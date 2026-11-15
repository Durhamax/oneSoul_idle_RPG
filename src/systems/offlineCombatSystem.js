/**
 * OFFLINE COMBAT SYSTEM
 *
 * Simulates combat progress while the player is away, using the SAME rules as live
 * combat. Rather than a parallel damage/loot model, it fast-forwards the live combat
 * primitives (CombatSystem.performAttack, AutoConsumption auto-eat/ammo, and the shared
 * CombatSystem.rollKillRewards/depositKillRewards) on a disposable clone of the player.
 * Running on a clone lets both the rewards AND the resources that produced them be scaled
 * by the offline efficiency before a single application to the real state.
 *
 * Triggered from SaveSystem.load() with the elapsed offline time. Only resumes a fight
 * that was genuinely active (state.currentActivity === 'combat' + a persisted target).
 */

const OfflineCombatSystem = {
    MAX_OFFLINE_TIME: 8 * 60 * 60 * 1000,  // 8 hours
    OFFLINE_EFFICIENCY: 0.70,              // 70% of what live play would yield
    SIM_STEP_MS: 200,                      // simulation resolution
    AUTO_EAT_INTERVAL_MS: 1000,            // matches the live auto-eat cooldown (sim-time)

    init(engine) {
        engine.simulateOfflineCombat = this.simulateOfflineCombat.bind(engine);
        console.log('✅ Offline Combat System initialized (shared live-combat rules)');
    },

    /**
     * Entry point (bound so `this` === GameEngine). Returns a results summary for
     * OfflineCombatUI, or null if there was no active fight to resume.
     */
    simulateOfflineCombat(offlineTime) {
        const OC = OfflineCombatSystem;
        const state = this.state;

        // Only resume a fight the player was genuinely in (set by CombatSystem.startCombat).
        if (!state || state.currentActivity !== 'combat') {
            console.log('⏭️ Offline combat skipped (not the active activity)');
            return null;
        }
        const enemyId = state.combat && state.combat.selectedEnemyId;
        if (!enemyId) {
            console.log('⏭️ Offline combat skipped (no persisted target)');
            return null;
        }

        // Resolve the enemy from the live registry (current schema) — same source as live combat.
        const enemyDef = (typeof EnemyRegistry !== 'undefined')
            ? (EnemyRegistry.get ? EnemyRegistry.get(enemyId) : (EnemyRegistry.production || {})[enemyId])
            : null;
        if (!enemyDef) {
            console.log(`⚠️ Offline combat: enemy '${enemyId}' not found in registry`);
            return null;
        }

        const cappedTime = Math.min(offlineTime, OC.MAX_OFFLINE_TIME);
        const wasCapped = offlineTime > OC.MAX_OFFLINE_TIME;

        const stats = {
            enemiesKilled: 0, combatXpGained: 0, goldGained: 0, medalsGained: 0,
            lootGained: {}, foodConsumed: 0, ammoConsumed: 0,
            totalDamageDealt: 0, totalDamageTaken: 0, deaths: 0,
            timeSimulated: cappedTime, wasCapped, stopReason: null
        };

        OC.runSharedSimulation.call(this, enemyDef, cappedTime, stats);
        OC.applyEfficiencyAndDeposit.call(this, stats);

        console.log(`⚔️ Offline combat: ${stats.enemiesKilled} kills, ${stats.combatXpGained} XP, ${stats.goldGained} gold, stop=${stats.stopReason}`);
        return stats;
    },

    /**
     * Fast-forward the fight on a player clone using the live combat primitives. Fills
     * `stats` with 100%-rate totals (scaling happens afterward). `this` === GameEngine.
     */
    runSharedSimulation(enemyDef, cappedTime, stats) {
        const OC = OfflineCombatSystem;
        const state = this.state;
        const step = OC.SIM_STEP_MS;

        // ── Enemy instance (clone + compiled derived stats) ──
        const enemy = Object.assign({}, enemyDef, {
            enemyId: enemyDef.id || enemyDef.enemyId,
            currentHP: enemyDef.maxHP || enemyDef.health || 100
        });
        enemy.maxHP = enemy.maxHP || enemy.health || 100;
        if (CombatSystem.compileEnemyStats) CombatSystem.compileEnemyStats(enemy);

        // ── Player clone (equipment deep-cloned so food/ammo deplete here, not for real) ──
        const maxHP = state.maxHP || state.compiledStats?.maxHealth
            || (AutoConsumption.calculateMaxHP ? AutoConsumption.calculateMaxHP(state) : 100);
        const perkMultipliers = state.compiledStats?.perkMultipliers
            || (this.getPerkMultipliers ? this.getPerkMultipliers() : {});
        const sim = {
            currentHP: Math.min(state.currentHP != null ? state.currentHP : maxHP, maxHP),
            maxHP,
            autoEatThresholdPct: state.autoEatThresholdPct,
            perkMultipliers,
            combatAttributes: Object.assign({}, state.combatAttributes),
            activeEffects: [],
            equipment: JSON.parse(JSON.stringify(state.equipment || {}))
        };
        if (CombatSystem.compilePlayerStats) CombatSystem.compilePlayerStats(sim);

        // Combat context the shared helpers read (compiled weapon/ammo + session + cooldown).
        const compiledWeapon = CombatSystem.compileWeaponData ? CombatSystem.compileWeaponData(sim) : null;
        const compiledAmmo = CombatSystem.compileAmmoData ? CombatSystem.compileAmmoData(sim) : null;
        sim.combat = {
            compiledWeapon,
            playerAmmo: compiledAmmo,
            session: { foodConsumed: 0, ammoConsumed: 0 },
            lastAutoEat: 0
        };

        // Starting resources, to measure consumption after the run.
        const ammoStart = sim.equipment?.ammo?.quantity || 0;
        const foodStart = sim.equipment?.food?.quantity || 0;

        const playerInterval = (CombatSystem.getPlayerAttackInterval
            ? (CombatSystem.getPlayerAttackInterval(sim).interval || 2000) : 2000);
        const enemyInterval = enemy.attackInterval || 2000;
        const respawnMs = enemyDef.respawnTime || 0;

        let playerLast = -playerInterval;   // allow an immediate first swing
        let enemyLast = 0;
        let enemyRespawnAt = 0;
        let simLastEat = -OC.AUTO_EAT_INTERVAL_MS;
        const numTicks = Math.floor(cappedTime / step);

        for (let tick = 0; tick < numTicks; tick++) {
            const now = tick * step;

            // Auto-eat on the live rules, gated in SIM-time (processAutoEat's own cooldown
            // keys on real Date.now(), which barely moves during this compressed loop).
            if (now - simLastEat >= OC.AUTO_EAT_INTERVAL_MS) {
                sim.combat.lastAutoEat = 0; // bypass the real-time cooldown; we gate above
                AutoConsumption.processAutoEat(sim, sim.combat);
                simLastEat = now;
            }

            // Player attack (only once the enemy has respawned)
            if (now >= enemyRespawnAt && (now - playerLast) >= playerInterval) {
                const can = AutoConsumption.canAttack(sim);
                if (!can.canAttack) {
                    // Out of ammo → the fight can't continue (activity stops).
                    stats.stopReason = 'out-of-ammo';
                    break;
                }
                AutoConsumption.consumeAmmo(sim, sim.combat);
                const res = CombatSystem.performAttack(sim, enemy);
                if (res && res.hit && res.hit.success) {
                    enemy.currentHP = Math.max(0, enemy.currentHP - res.finalDamage);
                    stats.totalDamageDealt += res.finalDamage;
                    if (enemy.currentHP <= 0) {
                        const r = CombatSystem.rollKillRewards(sim, enemy);
                        stats.enemiesKilled++;
                        stats.combatXpGained += r.xp;
                        stats.goldGained += r.gold;
                        stats.medalsGained += r.medals;
                        for (const it of r.items) {
                            stats.lootGained[it.itemId] = (stats.lootGained[it.itemId] || 0) + it.quantity;
                        }
                        enemy.currentHP = enemy.maxHP;        // respawn
                        enemyRespawnAt = now + respawnMs;     // honor respawn delay
                    }
                }
                playerLast = now;
            }

            // Enemy attack
            if (now >= enemyRespawnAt && (now - enemyLast) >= enemyInterval) {
                const res = CombatSystem.performAttack(enemy, sim);
                if (res && res.hit && res.hit.success) {
                    sim.currentHP = Math.max(0, sim.currentHP - res.finalDamage);
                    stats.totalDamageTaken += res.finalDamage;
                    if (sim.currentHP <= 0) {
                        // Death stops the activity (no respawn-and-continue) — same rule the
                        // player affirmed for live idling without enough food.
                        stats.deaths = 1;
                        stats.stopReason = 'death';
                        break;
                    }
                }
                enemyLast = now;
            }
        }

        if (!stats.stopReason) stats.stopReason = 'time-elapsed';

        // Resources consumed, measured on the clone (100% rate; scaled next).
        stats.ammoConsumed = Math.max(0, ammoStart - (sim.equipment?.ammo?.quantity || 0));
        stats.foodConsumed = Math.max(0, foodStart - (sim.equipment?.food?.quantity || 0));
    },

    /**
     * Scale the 100%-rate totals by the offline efficiency, then apply once to real state:
     * deposit rewards through the shared depositKillRewards (no UI events during load) and
     * deduct the scaled resources from the real equipped food/ammo slots. `this` === GameEngine.
     */
    applyEfficiencyAndDeposit(stats) {
        const state = this.state;
        const eff = OfflineCombatSystem.OFFLINE_EFFICIENCY;

        stats.enemiesKilled = Math.floor(stats.enemiesKilled * eff);
        stats.combatXpGained = Math.floor(stats.combatXpGained * eff);
        stats.goldGained = Math.floor(stats.goldGained * eff);
        stats.medalsGained = Math.floor(stats.medalsGained * eff);
        stats.ammoConsumed = Math.floor(stats.ammoConsumed * eff);
        stats.foodConsumed = Math.floor(stats.foodConsumed * eff);
        for (const id in stats.lootGained) {
            stats.lootGained[id] = Math.floor(stats.lootGained[id] * eff);
        }

        // Deposit rewards through the SAME path live kills use (XP → character level,
        // gold/medals → currencies, items → bank). emit:false keeps it silent on load.
        const items = Object.entries(stats.lootGained)
            .filter(([, q]) => q > 0)
            .map(([itemId, quantity]) => ({ itemId, quantity }));
        if (CombatSystem.depositKillRewards) {
            CombatSystem.depositKillRewards(state, {
                xp: stats.combatXpGained,
                gold: stats.goldGained,
                medals: stats.medalsGained,
                items
            }, { emit: false });
        }

        // Deduct the scaled resources from the REAL equipped slots.
        if (stats.ammoConsumed > 0 && state.equipment?.ammo && state.equipment.ammo.quantity != null) {
            state.equipment.ammo.quantity = Math.max(0, state.equipment.ammo.quantity - stats.ammoConsumed);
        }
        if (stats.foodConsumed > 0 && state.equipment?.food && state.equipment.food.quantity != null) {
            state.equipment.food.quantity = Math.max(0, state.equipment.food.quantity - stats.foodConsumed);
            if (state.equipment.food.quantity <= 0) state.equipment.food = null;
        }

        // If the player died offline, the activity is over — clear it so the game resumes
        // idle rather than silently re-entering combat.
        if (stats.deaths > 0) {
            if (state.currentActivity === 'combat') state.currentActivity = null;
            if (state.combat) {
                state.combat.selectedEnemyId = null;
                state.combat.autoCombat = false;
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineCombatSystem;
}
