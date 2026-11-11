/**
 * TYPE EFFECTIVENESS
 *
 * Type matrix and weighted effectiveness calculations
 */

const TypeEffectiveness = {
    // Type effectiveness matrix
    TYPE_MATRIX: {
        pierce:     { insulated: 1.25, plated: 0.75, airborne: 1.00, droid: 1.00, biological: 1.00 },
        explosive:  { insulated: 1.00, plated: 1.25, airborne: 0.75, droid: 1.00, biological: 1.00 },
        cryo:       { insulated: 1.00, plated: 1.00, airborne: 1.25, droid: 1.00, biological: 0.75 },
        shock:      { insulated: 0.75, plated: 1.00, airborne: 1.00, droid: 1.25, biological: 1.00 },
        incendiary: { insulated: 1.00, plated: 1.00, airborne: 1.00, droid: 0.75, biological: 1.25 }
    },

    ARMOR_TYPES: ['insulated', 'plated', 'airborne', 'droid', 'biological'],
    DAMAGE_TYPES: ['pierce', 'explosive', 'cryo', 'shock', 'incendiary'],

    /**
     * Calculate weighted type effectiveness
     * @param {object} attackerDamageRatings - Damage type ratings from attacker
     * @param {object} defenderArmorRatings - Armor type ratings from defender
     * @returns {object} Weighted multiplier and breakdown
     */
    calculate(attackerDamageRatings, defenderArmorRatings) {
        const attackTotal = Object.values(attackerDamageRatings).reduce((a, b) => a + b, 0);
        const defenseTotal = Object.values(defenderArmorRatings).reduce((a, b) => a + b, 0);

        // No type interaction if either side has no ratings
        if (attackTotal === 0 || defenseTotal === 0) {
            return {
                multiplier: 1.0,
                breakdown: [],
                neutral: true
            };
        }

        let weightedMultiplier = 0;
        const breakdown = [];

        // Calculate weighted contribution for each damage/armor pairing
        for (const [dmgType, dmgRating] of Object.entries(attackerDamageRatings)) {
            if (dmgRating === 0) continue;

            const dmgPercent = dmgRating / attackTotal;

            for (const [armType, armRating] of Object.entries(defenderArmorRatings)) {
                if (armRating === 0) continue;

                const armPercent = armRating / defenseTotal;
                const typeMult = this.TYPE_MATRIX[dmgType]?.[armType] || 1.0;
                const contribution = dmgPercent * armPercent * typeMult;

                weightedMultiplier += contribution;

                breakdown.push({
                    damageType: dmgType,
                    armorType: armType,
                    dmgPercent: dmgPercent,
                    armPercent: armPercent,
                    typeMult: typeMult,
                    contribution: contribution
                });
            }
        }

        return {
            multiplier: weightedMultiplier,
            breakdown: breakdown,
            neutral: false
        };
    },

    /**
     * Get primary damage type (highest rating)
     */
    getPrimaryDamageType(damageRatings) {
        let maxType = null;
        let maxRating = 0;

        for (const [type, rating] of Object.entries(damageRatings)) {
            if (rating > maxRating) {
                maxRating = rating;
                maxType = type;
            }
        }

        return maxType || 'pierce';
    },

    /**
     * Get primary armor type (highest rating)
     */
    getPrimaryArmorType(armorRatings) {
        let maxType = null;
        let maxRating = 0;

        for (const [type, rating] of Object.entries(armorRatings)) {
            if (rating > maxRating) {
                maxRating = rating;
                maxType = type;
            }
        }

        return maxType || 'plated';
    },

    /**
     * Format type effectiveness for display
     */
    formatEffectiveness(multiplier) {
        if (multiplier >= 1.20) return { text: 'Super Effective!', color: '#4ade80' };
        if (multiplier >= 1.05) return { text: 'Effective', color: '#86efac' };
        if (multiplier <= 0.80) return { text: 'Not Very Effective', color: '#f87171' };
        if (multiplier <= 0.95) return { text: 'Resisted', color: '#fca5a5' };
        return { text: 'Neutral', color: '#d1d5db' };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TypeEffectiveness;
}
