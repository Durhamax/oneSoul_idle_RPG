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
        instanced: false,
        rarity: 'common',
        stackLimit: 50,
        value: 8,
        effectType: 'heal',
        effectValue: 75,
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
        instanced: false,
        rarity: 'common',
        stackLimit: 40,
        value: 12,
        effectType: 'heal',
        effectValue: 100,
        effect: {
            stat: 'strength',
            amount: 1,
            duration: 120000, // 2 minutes
        },
        cooldown: 1000,
        enduranceRecovery: 18,
        tags: ['consumable', 'food', 'healing', 'buff', 'meat'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSUMABLE_ITEMS;
}
