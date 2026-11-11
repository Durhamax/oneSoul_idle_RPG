/**
 * PERK REGISTRY
 *
 * Manages perk definitions for medals and other equipment.
 * Perks are stat modifiers that can be applied to items.
 *
 * Examples:
 * - "+5% Mining Speed"
 * - "+10 Max Health"
 * - "+2% Critical Chance"
 */

class PerkRegistryClass extends BaseRegistry {
    constructor() {
        super('perk');
        this._initSchema();
    }

    /**
     * Initialize perk schema for validation
     */
    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'type', 'value', 'unit'],
            optional: [
                'description', 'icon', 'abbreviation', 'rarity', 'tier',
                'category', 'stat', 'statType', 'operation', 'condition',
                'duration', 'cooldown', 'stackable', 'maxStacks', 'tags'
            ]
        };
    }

    // ===== PERK-SPECIFIC QUERY METHODS =====

    /**
     * Get perks by type (offensive, defensive, utility, etc.)
     * @param {string} type - Perk type
     * @returns {object} Perks matching type
     */
    getByType(type) {
        const allPerks = this.getAllActive();
        const filtered = {};

        for (const [id, perk] of Object.entries(allPerks)) {
            if (perk.type === type) {
                filtered[id] = perk;
            }
        }

        return filtered;
    }

    /**
     * Get perks by category
     * @param {string} category - Perk category (combat, gathering, crafting, etc.)
     * @returns {object} Perks matching category
     */
    getByCategory(category) {
        const allPerks = this.getAllActive();
        const filtered = {};

        for (const [id, perk] of Object.entries(allPerks)) {
            if (perk.category === category) {
                filtered[id] = perk;
            }
        }

        return filtered;
    }

    /**
     * Get perks by rarity
     * @param {string} rarity - Perk rarity
     * @returns {object} Perks matching rarity
     */
    getByRarity(rarity) {
        const allPerks = this.getAllActive();
        const filtered = {};

        for (const [id, perk] of Object.entries(allPerks)) {
            if (perk.rarity === rarity) {
                filtered[id] = perk;
            }
        }

        return filtered;
    }

    /**
     * Get perks that affect a specific stat
     * @param {string} stat - Stat name (e.g., 'miningSpeed', 'maxHealth')
     * @returns {object} Perks affecting that stat
     */
    getByStat(stat) {
        const allPerks = this.getAllActive();
        const filtered = {};

        for (const [id, perk] of Object.entries(allPerks)) {
            if (perk.stat === stat) {
                filtered[id] = perk;
            }
        }

        return filtered;
    }

    /**
     * Get offensive perks (damage, crit, etc.)
     * @returns {object} Offensive perks
     */
    getOffensivePerks() {
        return this.getByType('offensive');
    }

    /**
     * Get defensive perks (armor, resistance, etc.)
     * @returns {object} Defensive perks
     */
    getDefensivePerks() {
        return this.getByType('defensive');
    }

    /**
     * Get utility perks (speed, efficiency, etc.)
     * @returns {object} Utility perks
     */
    getUtilityPerks() {
        return this.getByType('utility');
    }
}

// Create singleton instance
const PerkRegistry = new PerkRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkRegistry;
}
