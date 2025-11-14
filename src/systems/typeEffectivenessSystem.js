/**
 * TYPE EFFECTIVENESS SYSTEM
 *
 * Manages damage type vs armor type effectiveness calculations
 * - Player armor ratings are summed from all equipped armor pieces
 * - Damage multipliers are calculated based on type matchups
 * - Uses the type effectiveness matrix from definitions
 */

const TypeEffectivenessSystem = {
    /**
     * Initialize type effectiveness system on GameEngine
     */
    init(engine) {
        engine.getPlayerArmorRatings = this.getPlayerArmorRatings.bind(engine);
        engine.getPlayerDominantArmorType = this.getPlayerDominantArmorType.bind(engine);
        engine.getWeaponDamageType = this.getWeaponDamageType.bind(engine);
        engine.calculateDamageMultiplier = this.calculateDamageMultiplier.bind(engine);
    },

    /**
     * Get total armor ratings from all equipped armor pieces
     * Returns an object with totals for each armor type
     */
    getPlayerArmorRatings() {
        const ratings = {
            insulated: 0,
            plated: 0,
            airborne: 0,
            droid: 0,
            biological: 0
        };

        // Loop through all equipment slots
        for (let slot in this.state.equipment) {
            const itemId = this.state.equipment[slot];
            if (itemId) {
                const itemDef = this.definitions.items[itemId];

                // Only count armor pieces (items with armorRatings)
                if (itemDef && itemDef.stats && itemDef.stats.armorRatings) {
                    const armorRatings = itemDef.stats.armorRatings;

                    // Sum up ratings for each type
                    for (let type in armorRatings) {
                        ratings[type] += armorRatings[type] || 0;
                    }
                }
            }
        }

        return ratings;
    },

    /**
     * Get the player's dominant armor type (highest total rating)
     * Returns the armor type string (e.g., "plated", "biological")
     */
    getPlayerDominantArmorType() {
        const ratings = this.getPlayerArmorRatings();

        let dominantType = 'biological'; // Default
        let highestRating = 0;

        for (let type in ratings) {
            if (ratings[type] > highestRating) {
                highestRating = ratings[type];
                dominantType = type;
            }
        }

        return dominantType;
    },

    /**
     * Get the damage type of the player's equipped weapon
     * Returns the damage type string (e.g., "pierce", "shock")
     */
    getWeaponDamageType() {
        const weaponId = this.state.equipment.weapon;

        if (!weaponId) {
            return 'pierce'; // Default unarmed damage type
        }

        const weaponDef = this.definitions.items[weaponId];

        if (!weaponDef || !weaponDef.stats || !weaponDef.stats.damageType) {
            return 'pierce'; // Default if no damage type defined
        }

        return weaponDef.stats.damageType;
    },

    /**
     * Calculate damage multiplier based on type effectiveness
     *
     * @param {string} attackerDamageType - The damage type being dealt (pierce, shock, etc.)
     * @param {string} defenderArmorType - The armor type being hit (plated, biological, etc.)
     * @returns {number} Damage multiplier (1.5 for strong, 0.67 for weak, 1.0 for neutral)
     */
    calculateDamageMultiplier(attackerDamageType, defenderArmorType) {
        const damageTypeDef = this.definitions.damageTypes[attackerDamageType];
        const effectiveness = this.definitions.typeEffectiveness;

        if (!damageTypeDef) {
            return effectiveness.neutralMultiplier; // No type data = neutral
        }

        // Check if strong against defender's armor
        if (damageTypeDef.strongAgainst === defenderArmorType) {
            return effectiveness.strongMultiplier; // 1.5x damage
        }

        // Check if weak against defender's armor
        if (damageTypeDef.weakAgainst === defenderArmorType) {
            return effectiveness.weakMultiplier; // 0.67x damage
        }

        // Neutral matchup
        return effectiveness.neutralMultiplier; // 1.0x damage
    }
};
