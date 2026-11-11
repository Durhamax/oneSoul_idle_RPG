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
     * Random between min and max damage
     */
    performDamageRoll(attacker) {
        const minDmg = attacker.minDamage || 0;
        const maxDmg = attacker.maxDamage || 0;

        if (minDmg === 0 && maxDmg === 0) {
            return { damage: 0, min: 0, max: 0 };
        }

        const damage = minDmg + Math.floor(Math.random() * (maxDmg - minDmg + 1));

        return {
            damage: damage,
            min: minDmg,
            max: maxDmg
        };
    },

    /**
     * Calculate defense pool (evasion + armor rating)
     */
    calculateDefensePool(defender) {
        const mult = defender.perkMultipliers || {};
        const compiled = defender.compiledStats || {};
        const defense = compiled.defense || {};
        // Player uses combatAttributes, enemies use attributes
        const attributes = defender.attributes || defender.combatAttributes || {};

        // Evasion from Stealth — Stealth lowers an attacker's chance to hit this defender.
        // (Mobility governs attack speed, not dodge.)
        let evasion = (attributes.stealth || 0) * 10
            * (mult.stealthScaling || 1.0)
            * (mult.evasion || 1.0);

        // Flat evasion from equipment
        evasion += defense.flatEvasionBonus || 0;

        // Armor Rating
        const armorRating = defense.armorRating || 0;

        return {
            evasion: Math.floor(evasion),
            armorRating: armorRating,
            total: Math.floor(evasion + armorRating)
        };
    },

    /**
     * Calculate crit resistance
     */
    calculateCritResistance(defender) {
        const mult = defender.perkMultipliers || {};
        // Player uses combatAttributes, enemies use attributes
        const attributes = defender.attributes || defender.combatAttributes || {};

        const perception = (attributes.perception || 0) + this.activePerceptionBonus(defender);
        const critResistance = perception * 10
            * (mult.perceptionScaling || 1.0)
            * (mult.critResistance || 1.0);

        return Math.floor(critResistance);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatRolls;
}
