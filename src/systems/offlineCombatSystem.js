/**
 * OFFLINE COMBAT SYSTEM
 *
 * Simulates combat progress while the player is away from the game.
 * Calculates kills, XP, loot, and resource consumption based on elapsed time.
 */

const OfflineCombatSystem = {
    MAX_OFFLINE_TIME: 8 * 60 * 60 * 1000,  // 8 hours in milliseconds
    OFFLINE_EFFICIENCY: 0.70,               // 70% efficiency when offline
    COMBAT_TICK_INTERVAL: 100,              // Simulate every 100ms

    /**
     * Initialize the offline combat system
     */
    init(engine) {
        engine.simulateOfflineCombat = this.simulateOfflineCombat.bind(engine);
        console.log('✅ Offline Combat System initialized');
    },

    /**
     * Simulate offline combat progress
     * @param {number} offlineTime - Time elapsed in milliseconds
     * @returns {Object} Summary of offline progress
     */
    simulateOfflineCombat(offlineTime) {
        // Cap offline time to prevent overflow
        const cappedTime = Math.min(offlineTime, OfflineCombatSystem.MAX_OFFLINE_TIME);
        const wasCapped = offlineTime > OfflineCombatSystem.MAX_OFFLINE_TIME;

        // Check if player was in combat or had an enemy selected
        const selectedEnemy = this.state.combat.selectedEnemyId;
        if (!selectedEnemy) {
            console.log('⏭️ Skipping offline combat simulation (no enemy selected)');
            return null;
        }

        const enemyDef = this.definitions.enemies[selectedEnemy];
        if (!enemyDef) {
            console.log('⚠️ Invalid enemy selected for offline combat');
            return null;
        }

        // Initialize offline combat statistics
        const stats = {
            enemiesKilled: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            foodConsumed: 0,
            ammoConsumed: 0,
            combatXpGained: 0,
            goldGained: 0,
            medalsGained: 0,
            lootGained: {},
            deaths: 0,
            timeSimulated: cappedTime,
            wasCapped: wasCapped
        };

        // Get player combat stats
        const playerStats = this.getPlayerCombatStats();

        // Check if player can survive this enemy
        const canSurvive = this.checkOfflineCombatViability(enemyDef, playerStats);
        if (!canSurvive.viable) {
            console.log(`⚠️ Player cannot safely fight ${enemyDef.name} offline: ${canSurvive.reason}`);
            return {
                ...stats,
                failed: true,
                reason: canSurvive.reason
            };
        }

        // Calculate number of combat ticks to simulate
        const numTicks = Math.floor(cappedTime / OfflineCombatSystem.COMBAT_TICK_INTERVAL);

        console.log(`🔄 Simulating ${numTicks} combat ticks (${(cappedTime / 1000 / 60).toFixed(1)} minutes) at ${OfflineCombatSystem.OFFLINE_EFFICIENCY * 100}% efficiency`);

        // Simulate combat
        this.runOfflineCombatSimulation(enemyDef, playerStats, numTicks, stats);

        // Apply offline efficiency penalty
        this.applyOfflineEfficiency(stats);

        // Apply rewards to game state
        this.applyOfflineRewards(stats);

        console.log(`⚔️ Offline Combat Complete: ${stats.enemiesKilled} kills, ${stats.combatXpGained} XP, ${stats.goldGained} gold`);

        return stats;
    },

    /**
     * Check if player can viably fight this enemy offline
     */
    checkOfflineCombatViability(enemyDef, playerStats) {
        // Calculate average damage rates
        const playerDPS = (playerStats.maxHit + playerStats.minHit) / 2 * (1000 / playerStats.effectiveAttackInterval);
        const enemyDPS = enemyDef.stats.attackDamage * enemyDef.stats.attackSpeed;

        // Factor in accuracy and evasion
        const playerEffectiveDPS = playerDPS * (playerStats.effectiveHitChance / 100);
        const enemyEffectiveDPS = enemyDPS * (enemyDef.stats.accuracy / 100) * (1 - playerStats.evasionRating / 100);

        // Factor in damage reduction
        const playerNetDamagePerSecond = Math.max(0, enemyEffectiveDPS * (1 - playerStats.damageReductionRate) - playerStats.hpRegenerationRate);

        // Calculate time to kill enemy
        const timeToKillEnemy = enemyDef.stats.maxHealth / playerEffectiveDPS;

        // Calculate damage taken per kill
        const damageTakenPerKill = playerNetDamagePerSecond * timeToKillEnemy;

        // Check if player can sustain combat
        if (damageTakenPerKill >= playerStats.maxHealth * 0.90) {
            return {
                viable: false,
                reason: "Takes too much damage per kill (90%+ max HP)"
            };
        }

        // Check if player has enough DPS
        if (playerEffectiveDPS < 1) {
            return {
                viable: false,
                reason: "Insufficient damage output"
            };
        }

        return {
            viable: true,
            timeToKillEnemy: timeToKillEnemy,
            damageTakenPerKill: damageTakenPerKill
        };
    },

    /**
     * Run the actual offline combat simulation
     */
    runOfflineCombatSimulation(enemyDef, playerStats, numTicks, stats) {
        let playerCurrentHealth = playerStats.maxHealth;
        let enemyCurrentHealth = enemyDef.stats.maxHealth;
        let playerLastAttack = 0;
        let enemyLastAttack = 0;
        let playerAmmo = 0;
        let playerMaxAmmo = 0;
        let isReloading = false;
        let reloadStartTime = 0;

        // Check if player has a gun
        const equippedWeapon = this.state.equipment.weapon;
        if (equippedWeapon) {
            const weaponDef = this.definitions.items[equippedWeapon];
            if (weaponDef?.magazineSize) {
                playerMaxAmmo = weaponDef.magazineSize;
                playerAmmo = playerMaxAmmo;
            }
        }

        // Get equipped food for healing
        const equippedFood = this.state.equipment.food;
        const foodDef = equippedFood ? this.definitions.items[equippedFood] : null;
        const foodHealAmount = foodDef ? Math.floor(foodDef.healAmount * (1 + playerStats.consumableEfficiency)) : 0;
        const autoEatThreshold = Math.min(0.95, this.state.combat.autoEatThreshold + playerStats.autoEatThresholdBonus);
        let lastFoodUse = 0;
        const foodCooldown = this.state.combat.autoEatCooldown;

        // Simulate each tick
        for (let tick = 0; tick < numTicks; tick++) {
            const currentTime = tick * OfflineCombatSystem.COMBAT_TICK_INTERVAL;

            // Apply HP regeneration
            playerCurrentHealth = Math.min(playerCurrentHealth + (playerStats.hpRegenerationRate * OfflineCombatSystem.COMBAT_TICK_INTERVAL / 1000), playerStats.maxHealth);

            // Check for auto-eat
            const healthPercent = playerCurrentHealth / playerStats.maxHealth;
            if (equippedFood && healthPercent < autoEatThreshold && currentTime - lastFoodUse >= foodCooldown) {
                // Check if we have food in inventory
                if (this.state.bank.items[equippedFood]?.quantity > 0) {
                    playerCurrentHealth = Math.min(playerCurrentHealth + foodHealAmount, playerStats.maxHealth);
                    stats.foodConsumed++;
                    lastFoodUse = currentTime;

                    // Consume food from inventory (but don't go below 0)
                    if (this.state.bank.items[equippedFood].quantity > 0) {
                        // We'll track this and apply at the end
                    }
                }
            }

            // Handle player reload
            if (playerMaxAmmo > 0) {
                const equippedWeapon = this.state.equipment.weapon;
                const weaponDef = this.definitions.items[equippedWeapon];
                const baseReloadTime = weaponDef?.reloadTime || 2000;
                const reloadReduction = 1 - playerStats.reloadTimeReduction;
                const effectiveReloadTime = Math.max(500, baseReloadTime * reloadReduction);

                if (isReloading) {
                    if (currentTime - reloadStartTime >= effectiveReloadTime) {
                        isReloading = false;
                        playerAmmo = playerMaxAmmo;
                    }
                } else if (playerAmmo <= 0) {
                    isReloading = true;
                    reloadStartTime = currentTime;
                }
            }

            // Player attack
            if (!isReloading && currentTime - playerLastAttack >= playerStats.effectiveAttackInterval) {
                // Check if attack hits
                const hitRoll = Math.random() * 100;
                if (hitRoll <= playerStats.effectiveHitChance) {
                    // Calculate damage
                    const damageRange = playerStats.maxHit - playerStats.minHit;
                    const damageRoll = Math.random();
                    let damage = playerStats.minHit + (damageRange * damageRoll);

                    // Check for critical hit
                    const critRoll = Math.random() * 100;
                    if (critRoll < playerStats.criticalChance) {
                        damage *= playerStats.criticalImpact;
                    }

                    // Apply damage
                    enemyCurrentHealth -= damage;
                    stats.totalDamageDealt += damage;

                    // Consume ammo
                    if (playerMaxAmmo > 0) {
                        playerAmmo--;
                        stats.ammoConsumed++;
                    }

                    // Check if enemy defeated
                    if (enemyCurrentHealth <= 0) {
                        stats.enemiesKilled++;

                        // Roll for loot
                        this.rollOfflineLoot(enemyDef, stats);

                        // Add gold and medals
                        const goldAmount = Math.floor(enemyDef.rewards.gold.min + Math.random() * (enemyDef.rewards.gold.max - enemyDef.rewards.gold.min));
                        stats.goldGained += goldAmount;

                        const medalAmount = Math.floor(enemyDef.rewards.medals.min + Math.random() * (enemyDef.rewards.medals.max - enemyDef.rewards.medals.min));
                        stats.medalsGained += medalAmount;

                        // Add combat XP
                        stats.combatXpGained += enemyDef.rewards.exp.combat;

                        // Respawn enemy
                        enemyCurrentHealth = enemyDef.stats.maxHealth;
                    }
                }

                playerLastAttack = currentTime;
            }

            // Enemy attack
            if (currentTime - enemyLastAttack >= (1000 / enemyDef.stats.attackSpeed)) {
                // Check evasion
                const evasionRoll = Math.random() * 100;
                if (evasionRoll >= playerStats.evasionRating) {
                    // Check if enemy hits
                    const enemyHitRoll = Math.random() * 100;
                    const effectiveEnemyAccuracy = enemyDef.stats.accuracy * (1 - playerStats.enemyAccuracyReduction);

                    if (enemyHitRoll <= effectiveEnemyAccuracy) {
                        // Calculate damage
                        const variance = 0.9 + Math.random() * 0.2;
                        let damage = enemyDef.stats.attackDamage * variance;

                        // Apply damage reduction
                        damage = damage * (1 - playerStats.damageReductionRate);
                        damage = Math.max(1, damage - playerStats.absoluteDamageReduction);
                        damage = Math.floor(damage);

                        playerCurrentHealth -= damage;
                        stats.totalDamageTaken += damage;

                        // Check if player defeated
                        if (playerCurrentHealth <= 0) {
                            stats.deaths++;
                            playerCurrentHealth = playerStats.maxHealth; // Respawn player

                            // Apply death penalty (lose some gold)
                            const goldLoss = Math.floor(stats.goldGained * 0.1);
                            stats.goldGained -= goldLoss;
                        }
                    }
                }

                enemyLastAttack = currentTime;
            }
        }
    },

    /**
     * Roll for loot from defeated enemy
     */
    rollOfflineLoot(enemyDef, stats) {
        if (!enemyDef.lootTable) return;

        for (let entry of enemyDef.lootTable) {
            const roll = Math.random();
            if (roll < entry.chance) {
                const amount = Math.floor(entry.min + Math.random() * (entry.max - entry.min + 1));

                if (!stats.lootGained[entry.itemId]) {
                    stats.lootGained[entry.itemId] = 0;
                }
                stats.lootGained[entry.itemId] += amount;
            }
        }
    },

    /**
     * Apply offline efficiency penalty
     */
    applyOfflineEfficiency(stats) {
        stats.enemiesKilled = Math.floor(stats.enemiesKilled * OfflineCombatSystem.OFFLINE_EFFICIENCY);
        stats.combatXpGained = Math.floor(stats.combatXpGained * OfflineCombatSystem.OFFLINE_EFFICIENCY);
        stats.goldGained = Math.floor(stats.goldGained * OfflineCombatSystem.OFFLINE_EFFICIENCY);
        stats.medalsGained = Math.floor(stats.medalsGained * OfflineCombatSystem.OFFLINE_EFFICIENCY);
        stats.foodConsumed = Math.floor(stats.foodConsumed * OfflineCombatSystem.OFFLINE_EFFICIENCY);
        stats.ammoConsumed = Math.floor(stats.ammoConsumed * OfflineCombatSystem.OFFLINE_EFFICIENCY);

        // Apply efficiency to loot
        for (let itemId in stats.lootGained) {
            stats.lootGained[itemId] = Math.floor(stats.lootGained[itemId] * OfflineCombatSystem.OFFLINE_EFFICIENCY);
        }
    },

    /**
     * Apply offline rewards to game state
     */
    applyOfflineRewards(stats) {
        // Add currencies
        this.state.currencies.gold += stats.goldGained;
        this.state.currencies.medals += stats.medalsGained;

        // Add combat XP
        if (this.gainSkillExp) {
            this.gainSkillExp('combat', stats.combatXpGained);
        }

        // Add loot to bank
        for (let itemId in stats.lootGained) {
            const amount = stats.lootGained[itemId];
            if (amount > 0) {
                this.addItemToBank(itemId, amount);
            }
        }

        // Consume food from inventory
        const equippedFood = this.state.equipment.food;
        if (equippedFood && stats.foodConsumed > 0) {
            if (this.state.bank.items[equippedFood]) {
                const currentQuantity = this.state.bank.items[equippedFood].quantity;
                const newQuantity = Math.max(0, currentQuantity - stats.foodConsumed);

                if (newQuantity <= 0) {
                    delete this.state.bank.items[equippedFood];
                    this.state.equipment.food = null;
                } else {
                    this.state.bank.items[equippedFood].quantity = newQuantity;
                }
            }
        }
    }
};
