/**
 * COMBAT ROLLS
 *
 * Weighted roll system for hit/crit/damage calculations
 */

const CombatRolls = {
    /**
     * Sum active timed Perception buffs (e.g. Minty Tincture) on a combatant.
     * Only the player carries activeEffects, so enemies read 0.
     */
    activePerceptionBonus(entity) {
        if (!entity || !entity.activeEffects || !entity.activeEffects.length) return 0;
        const now = Date.now();
        return entity.activeEffects.reduce((sum, e) =>
            (e.stat === 'perception' && e.amount && (!e.expiresAt || e.expiresAt > now)) ? sum + e.amount : sum, 0);
    },

    /**
     * Weighted roll: attackerStat vs defenderStat
     * Returns probability-based success
     */
    weightedRoll(attackerStat, defenderStat) {
        const total = attackerStat + defenderStat;

        if (total === 0) {
            return {
                success: false,
                chance: 0,
                roll: 0,
                attackerStat: 0,
                defenderStat: 0
            };
        }

        const successChance = attackerStat / total;
        const roll = Math.random();

        return {
            success: roll < successChance,
            chance: successChance,
            roll: roll,
            attackerStat: attackerStat,
            defenderStat: defenderStat
        };
    },

    /**
     * Roll 1: Hit Check
     * Enemy Accuracy vs Player Defense Pool (Evasion + Armor Rating)
     */
    performHitRoll(attacker, defender) {
        // Compiled accuracy follows accuracy = 70 + Perception*2, so each +1 Perception
        // from an active serum (Minty Tincture) is worth +2 accuracy toward hit chance.
        const attackerAccuracy = (attacker.accuracy || 0) + this.activePerceptionBonus(attacker) * 2;
        const defensePool = this.calculateDefensePool(defender);

        // Debug: Log if accuracy is 0 (should not happen for valid combatants)
        if (attackerAccuracy === 0) {
            console.warn(`⚠️ [CombatRolls] Attacker has 0 accuracy!`, {
                name: attacker.name,
                accuracy: attacker.accuracy,
                hasEnemyId: !!attacker.enemyId,
                hasEquipment: !!attacker.equipment
            });
        }

        const result = this.weightedRoll(attackerAccuracy, defensePool.total);

        return {
            ...result,
            defensePool: defensePool
        };
    },

    /**
     * Roll 2: Crit Check
     * Attacker Stealth/CritRating vs Defender Crit Resistance
     */
    performCritRoll(attacker, defender) {
        // critRating = 5 + Perception*0.5, so +1 Perception from a serum = +0.5 crit rating.
        const attackerCritRating = (attacker.critRating || 0) + this.activePerceptionBonus(attacker) * 0.5;
        const defenderCritResist = this.calculateCritResistance(defender);

        const result = this.weightedRoll(attackerCritRating, defenderCritResist);

        return {
            ...result,
            critRating: attackerCritRating,
            critResistance: defenderCritResist
        };
    },

    /**
     * Roll 3: Damage Roll
     *
     * Normal hit: rolls between the attacker's minimum (>= 1) and maxDamage.
     * Crit: the roll's FLOOR jumps to half of max (round(maxDamage / 2)), so a crit always
     * lands in the TOP HALF of the range — this happens BEFORE the crit multiplier is applied
     * by performAttack. (A miss never reaches this roll; it deals 0.)
     *
     * Example — normal range 1–9: a crit rolls 5–9 (9/2 = 4.5 → 5), then × crit multiplier.
     */
    performDamageRoll(attacker, isCrit = false) {
        const maxDmg = attacker.maxDamage || 0;

        if (maxDmg <= 0) {
            return { damage: 0, min: 0, max: 0, isCrit: !!isCrit };
        }

        // Crit raises the floor to the upper half; otherwise use the attacker's min (>= 1,
        // perks may raise it above 1).
        let minDmg = isCrit
            ? Math.round(maxDmg / 2)
            : Math.max(1, attacker.minDamage || 1);
        if (minDmg > maxDmg) minDmg = maxDmg;

        const damage = minDmg + Math.floor(Math.random() * (maxDmg - minDmg + 1));

        return {
            damage: damage,
            min: minDmg,
            max: maxDmg,
            isCrit: !!isCrit
        };
    },

    /**
     * Calculate defense pool (evasion + armor rating).
     *
     * Reads the defender's COMPILED stats as flat fields — never recomputes from
     * attributes. This is the single source of truth: the player's values are compiled
     * by StatCompiler (evasion = Stealth*10, etc.) and set flat on the combatant; enemies
     * carry their values flat from their definition. Covers all three combatant shapes:
     *   • flat field        (player combatant + production enemy)  → defender.evasion
     *   • player compiled   (StatCompiler)                         → compiledStats.defense
     *   • nested enemy       (EnemyStats dev path)                  → defender.defense
     */
    calculateCritResistanceSource(defender) {
        const cd = defender.compiledStats?.defense || {};
        const nd = defender.defense || {};
        return defender.critResistance ?? cd.critResistance ?? nd.critResistance ?? 0;
    },

    calculateDefensePool(defender) {
        const cd = defender.compiledStats?.defense || {};
        const nd = defender.defense || {};

        const flatEvasionBonus = cd.flatEvasionBonus ?? nd.flatEvasionBonus ?? 0;
        const evasion = Math.floor(
            (defender.evasion ?? cd.evasion ?? nd.evasion ?? 0) + flatEvasionBonus
        );
        const armorRating = defender.armorRating ?? cd.armorRating ?? nd.armorRating ?? 0;

        return {
            evasion: evasion,
            armorRating: armorRating,
            total: Math.floor(evasion + armorRating)
        };
    },

    /**
     * Calculate crit resistance — read as a flat compiled field (same single-source rule
     * as the defense pool). Player: Perception*10 (compiled); enemies: their defined value.
     * A timed Perception buff (Minty Tincture) still hardens the defender against crits.
     */
    calculateCritResistance(defender) {
        const base = this.calculateCritResistanceSource(defender);
        return Math.floor(base + this.activePerceptionBonus(defender) * 10);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatRolls;
}
