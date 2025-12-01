/**
 * DAMAGE CALCULATOR
 *
 * Complete damage pipeline with type effectiveness, resistances, and DR
 */

const DamageCalculator = {
    // Combat balance constants
    COMBAT_BALANCE: {
        // HP SCALING
        hpPerHealth: 10,

        // AUTO-EAT
        autoEatBaseThreshold: 0.20,
        autoEatBaseEfficiency: 0.50,
        autoEatPerInt: 0.005,
        autoEatMaxEfficiency: 0.95,
        autoEatCooldown: 1000,

        // DEFENSE ATTRIBUTE
        defensePerPoint: 0.001,
        defenseOffset: 0.001,

        // DAMAGE REDUCTION CAP
        maxDamageReduction: 0.90,

        // TYPE EFFECTIVENESS
        superEffective: 1.25,
        notEffective: 0.75,
        neutral: 1.00,

        // CRIT
        baseCritMultiplier: 2.0,

        // DAMAGE ROLL RANGE
        minDamageRatio: 0.5,
        maxDamageRatio: 1.5,

        // WEIGHT SYSTEM
        baseWeightCapacity: 9,
        overweightPenaltyRate: 5.0,
        maxOverweightPenalty: 10.0,

        // MOBILITY (Attack Speed)
        mobilityMaxFactor: 3.0,
        mobilityMinFactor: 0.1,
        mobilityScaling: 0.029
    },

    /**
     * Calculate final damage through complete pipeline
     * PIPELINE:
     * 1. Type Effectiveness (weighted multiplier ×0.75 to ×1.25)
     * 2. Type-Specific Resistance Perks (multiplicative)
     * 3. Damage Reduction % (cap 90%)
     * 4. Tech Flat Reduction (subtraction)
     * 5. Minimum 1 damage
     */
    calculateFinalDamage(rawDamage, attacker, defender) {
        const mult = defender.perkMultipliers || {};
        let damage = rawDamage;

        const pipeline = {
            raw: rawDamage,
            steps: []
        };

        // STEP 1: Type Effectiveness
        const typeEffect = TypeEffectiveness.calculate(
            attacker.compiledStats?.damage?.ratings || {},
            defender.compiledStats?.defense?.ratings || {}
        );
        damage = damage * typeEffect.multiplier;
        pipeline.steps.push({
            name: 'Type Effectiveness',
            multiplier: typeEffect.multiplier,
            damage: Math.floor(damage),
            breakdown: typeEffect.breakdown
        });

        // STEP 2: Type-Specific Resistance Perks
        const primaryDamageType = TypeEffectiveness.getPrimaryDamageType(
            attacker.compiledStats?.damage?.ratings || {}
        );
        const typeResistKey = `${primaryDamageType}Resist`;
        const typeResist = mult[typeResistKey] || 1.0;
        damage = damage * typeResist;
        pipeline.steps.push({
            name: 'Type Resistance',
            type: primaryDamageType,
            multiplier: typeResist,
            damage: Math.floor(damage)
        });

        // STEP 3: Damage Reduction
        const totalDR = this.calculateTotalDamageReduction(defender);
        damage = damage * (1 - totalDR.total);
        pipeline.steps.push({
            name: 'Damage Reduction',
            reduction: totalDR.total,
            multiplier: 1 - totalDR.total,
            damage: Math.floor(damage),
            breakdown: totalDR.breakdown
        });

        // STEP 4: Tech Flat Reduction
        const techFlat = this.calculateTechFlatReduction(defender);
        damage = damage - techFlat;
        pipeline.steps.push({
            name: 'Tech Flat Reduction',
            reduction: techFlat,
            damage: Math.floor(damage)
        });

        // STEP 5: Minimum 1 damage
        const finalDamage = Math.max(1, Math.floor(damage));
        pipeline.final = finalDamage;

        return {
            damage: finalDamage,
            pipeline: pipeline
        };
    },

    /**
     * Calculate total damage reduction from all sources
     */
    calculateTotalDamageReduction(defender) {
        const mult = defender.perkMultipliers || {};
        const compiled = defender.compiledStats || { defense: {} };
        const attributes = defender.attributes || {};

        // Source 1: Armor DR (from armor set + accessories)
        let armorDR = compiled.defense.damageReduction || 0;

        // Source 2: Defense Attribute
        const defenseBase = ((attributes.defense || 0) * this.COMBAT_BALANCE.defensePerPoint)
            - this.COMBAT_BALANCE.defenseOffset;
        const defenseDR = Math.max(0, defenseBase * (mult.defenseScaling || 1.0));

        // Source 3: Set Bonuses (if any)
        const setBonusDR = defender.setBonuses?.damageReduction || 0;

        // Source 4: Active Effects
        let effectsDR = 0;
        for (const effect of defender.activeEffects || []) {
            if (effect.damageReduction) {
                effectsDR += effect.damageReduction;
            }
        }

        const rawTotal = armorDR + defenseDR + setBonusDR + effectsDR;
        const cappedTotal = Math.min(this.COMBAT_BALANCE.maxDamageReduction, rawTotal);

        return {
            total: cappedTotal,
            breakdown: {
                armorDR: armorDR,
                defenseDR: defenseDR,
                setBonusDR: setBonusDR,
                effectsDR: effectsDR,
                raw: rawTotal,
                capped: rawTotal > this.COMBAT_BALANCE.maxDamageReduction
            }
        };
    },

    /**
     * Calculate tech flat damage reduction
     */
    calculateTechFlatReduction(defender) {
        let flatReduction = 0;

        // Check tech slots for flat DR effects
        const techSlots = ['tech1', 'tech2', 'tech3', 'tech4'];
        for (const slot of techSlots) {
            const tech = defender.equipment?.[slot];
            if (tech?.flatDamageReduction) {
                flatReduction += tech.flatDamageReduction;
            }
        }

        return flatReduction;
    },

    /**
     * Calculate melee damage
     */
    calculateMeleeDamage(player) {
        const mult = player.perkMultipliers || {};
        const strength = player.attributes?.strength || 0;
        const weapon = player.equipment?.weapon;

        if (!weapon || weapon.weaponType !== 'melee') {
            return null;
        }

        const baseDamage = weapon.baseDamage || 0;
        const strengthBonus = strength;  // 1:1 ratio

        const rawDamage = baseDamage + strengthBonus;
        const finalDamage = rawDamage * (mult.meleeDamage || 1.0);

        return {
            base: baseDamage,
            strengthBonus: strengthBonus,
            raw: rawDamage,
            multiplier: mult.meleeDamage || 1.0,
            final: Math.floor(finalDamage)
        };
    },

    /**
     * Calculate ranged damage
     */
    calculateRangedDamage(player) {
        const mult = player.perkMultipliers || {};
        const weapon = player.equipment?.weapon;

        if (!weapon || weapon.weaponType !== 'ranged') {
            return null;
        }

        const baseDamage = weapon.baseDamage || 0;
        const finalDamage = baseDamage * (mult.rangedDamage || 1.0);

        return {
            base: baseDamage,
            multiplier: mult.rangedDamage || 1.0,
            final: Math.floor(finalDamage)
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DamageCalculator;
}
