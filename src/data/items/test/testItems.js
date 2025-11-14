/**
 * TEST ITEMS
 *
 * Temporary items for testing specific features.
 * These are meant to be deleted after testing is complete.
 * Enable with: ItemRegistry.enableDevMode()
 */

const TEST_ITEMS = {
    // =================================================================
    // TEMPORARY TEST ITEMS
    // =================================================================

    testDummyItem: {
        id: 'testDummyItem',
        name: '[TEST] Dummy Item',
        description: 'Test item for inventory system testing.',
        icon: '❓',
        category: 'material',
        rarity: 'common',
        stackLimit: 999,
        value: 1,
        sellable: true,
        droppable: true,
        tags: ['test', 'dummy'],
    },

    testStackingItem: {
        id: 'testStackingItem',
        name: '[TEST] Stacking Item',
        description: 'Test item for testing stack mechanics.',
        icon: '📚',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 5,
        sellable: true,
        droppable: true,
        tags: ['test', 'stacking'],
    },

    testUniqueItem: {
        id: 'testUniqueItem',
        name: '[TEST] Unique Item',
        description: 'Test item for unique item handling.',
        icon: '💎',
        category: 'special',
        rarity: 'legendary',
        stackLimit: 1,
        value: 0,
        unique: true,
        sellable: false,
        droppable: false,
        tags: ['test', 'unique'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TEST_ITEMS;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.TEST_ITEMS = TEST_ITEMS;
}
