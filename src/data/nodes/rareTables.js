/**
 * UNIVERSAL RARE DROP TABLES
 *
 * Skill-specific rare drop tables that apply when nodes don't define custom rareDropTable
 */

const UniversalRareTables = {
    mining: [
        { itemId: "sapphire", weight: 40, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "emerald", weight: 30, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "ruby", weight: 20, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "diamond", weight: 9, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "prismatic_shard", weight: 1, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    logging: [
        { itemId: "amber", weight: 40, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "golden_resin", weight: 30, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "phoenix_ash", weight: 20, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "world_tree_bark", weight: 9, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "eternal_wood", weight: 1, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    fishing: [
        { itemId: "pearl", weight: 40, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "coral_fragment", weight: 30, minYield: 1, maxYield: 3, skillScaling: false },
        { itemId: "sunken_treasure", weight: 20, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "neptune_crown", weight: 9, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "leviathan_scale", weight: 1, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    hunting: [
        { itemId: "perfect_pelt", weight: 40, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "pristine_antlers", weight: 30, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "dragon_scale", weight: 20, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "phoenix_feather", weight: 9, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "chimera_horn", weight: 1, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    foraging: [
        { itemId: "golden_mushroom", weight: 40, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "moonflower", weight: 30, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "fairy_dust", weight: 20, minYield: 1, maxYield: 3, skillScaling: false },
        { itemId: "eternal_lotus", weight: 9, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "genesis_seed", weight: 1, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    thieving: [
        { itemId: "ancient_coin", weight: 40, minYield: 1, maxYield: 5, skillScaling: false },
        { itemId: "treasure_map", weight: 30, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "royal_jewel", weight: 20, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "crown_of_ages", weight: 9, minYield: 1, maxYield: 1, skillScaling: false },
        { itemId: "philosophers_stone", weight: 1, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    /**
     * Get rare table for a skill type
     */
    getTableForSkill(skillType) {
        return this[skillType] || [];
    },

    /**
     * Get all rare items for a skill type
     */
    getRareItemsForSkill(skillType) {
        const table = this.getTableForSkill(skillType);
        return table.map(entry => entry.itemId);
    },

    /**
     * Get rarity tier from weight
     */
    getRarityTier(weight) {
        if (weight >= 30) return { name: 'uncommon', color: '#4caf50' };
        if (weight >= 15) return { name: 'rare', color: '#2196f3' };
        if (weight >= 5) return { name: 'epic', color: '#9c27b0' };
        return { name: 'legendary', color: '#ff9800' };
    }
};
