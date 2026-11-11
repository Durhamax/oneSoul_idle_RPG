/**
 * CONSUMABLE ITEMS
 *
 * Single-use items: potions, food, scrolls, buffs
 */

const CONSUMABLE_ITEMS = {
    // =================================================================
    // TIER 1 FOOD
    // =================================================================
    solfishBake: {
        id: 'solfishBake',
        name: 'Solfish Bake',
        description: 'A basic baked fish meal. Provides modest healing and endurance recovery.',
        icon: '🐟',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'food',       // Equipment slot
        instanced: false,
        rarity: 'common',
        stackLimit: 50,
        value: 8,
        effectType: 'heal',
        effectValue: 75,         // HP restored when consumed
        cooldown: 800,
        enduranceRecovery: 12,
        tags: ['consumable', 'food', 'healing', 'fish'],
    },

    smallGameStew: {
        id: 'smallGameStew',
        name: 'Small Game Stew',
        description: 'A hearty stew made from small game meat. Restores health and provides a temporary strength boost.',
        icon: '🍲',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'food',       // Equipment slot
        instanced: false,
        rarity: 'common',
        stackLimit: 40,
        value: 12,
        effectType: 'heal',
        effectValue: 100,        // HP restored when consumed
        effect: {
            stat: 'strength',
            amount: 1,
            duration: 120000, // 2 minutes
        },
        cooldown: 1000,
        enduranceRecovery: 18,
        tags: ['consumable', 'food', 'healing', 'buff', 'meat'],
    },

    // =================================================================
    // TIER 1 SERUMS / TINCTURES (potion slot — dosed, not eaten)
    // =================================================================
    mintyTincture: {
        id: 'mintyTincture',
        name: 'Minty Tincture',
        description: 'A soothing tincture pressed from minty herb. Dosed to steady you — grants brief damage resistance and a touch of healing. Depletes as it is dosed in combat or while skilling.',
        icon: '🧪',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'potion',     // Equipment slot (serum/tincture)
        instanced: false,
        rarity: 'common',
        stackLimit: 40,
        value: 14,
        // Dose heals a little (combat only) and applies a timed buff.
        effectType: 'heal',
        effectValue: 20,
        effect: {
            damageReduction: 0.08,   // +8% damage resistance...
            duration: 60000,         // ...for 60s; re-dosed (−1) when it lapses
        },
        tags: ['consumable', 'serum', 'tincture', 'buff', 'herb'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSUMABLE_ITEMS;
}
