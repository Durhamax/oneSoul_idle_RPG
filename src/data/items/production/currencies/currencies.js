/**
 * CURRENCY & SPECIAL ITEMS
 *
 * Currency items, quest items, keys, and special unique items
 */

const CURRENCY_AND_SPECIAL_ITEMS = {
    // =================================================================
    // CURRENCIES
    // =================================================================

    gold: {
        id: 'gold',
        name: 'Gold',
        description: 'Standard currency used throughout the realm. Accepted everywhere.',
        icon: '🪙',
        category: 'currency',
        instanced: false,  // Stackable resource
        rarity: 'common',
        stackLimit: 999999,
        value: 1,
        sellable: false,
        droppable: false,
        tags: ['currency', 'gold', 'money'],
    },

    medals: {
        id: 'medals',
        name: 'Medal',
        description: 'Prestigious medals earned through accomplishments. Can be used for special purchases.',
        icon: '🏅',
        category: 'currency',
        instanced: false,  // Stackable resource
        rarity: 'uncommon',
        stackLimit: 999999,
        value: 100,
        sellable: false,
        droppable: false,
        tags: ['currency', 'medals', 'prestige'],
    },

    tomes: {
        id: 'tomes',
        name: 'Tome',
        description: 'Ancient tomes containing powerful knowledge. Rare and valuable.',
        icon: '📕',
        category: 'currency',
        instanced: false,  // Stackable resource
        rarity: 'rare',
        stackLimit: 999999,
        value: 1000,
        sellable: false,
        droppable: false,
        tags: ['currency', 'tomes', 'knowledge'],
    },

    gems: {
        id: 'gems',
        name: 'Gem',
        description: 'Rare crystalline gems with magical properties. Premium currency.',
        icon: '💎',
        category: 'currency',
        instanced: false,  // Stackable resource
        rarity: 'epic',
        stackLimit: 999999,
        value: 10000,
        sellable: false,
        droppable: false,
        tags: ['currency', 'gems', 'premium'],
    },

};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CURRENCY_AND_SPECIAL_ITEMS;
}
