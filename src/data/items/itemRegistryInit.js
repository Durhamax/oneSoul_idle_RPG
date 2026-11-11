/**
 * ITEM REGISTRY INITIALIZATION
 *
 * Initializes the item registry system and provides console utilities for development.
 * This follows the same pattern as other registry init files (nodeInit.js, enemyInit.js, etc.)
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('=æ Initializing Item Registry...');

    // Validate ItemRegistry is loaded
    if (typeof ItemRegistry === 'undefined') {
        console.error('L ItemRegistry not loaded!');
        return;
    }

    // Get statistics from registry
    const stats = ItemRegistry.getStatistics();

    // Print summary
    console.log('\n' + 'P'.repeat(40));
    console.log('Q      ITEM REGISTRY SUMMARY            Q');
    console.log('P'.repeat(40) + '\n');
    console.log(`=æ Production: ${stats.production.count} items`);
    console.log(`=' Dev: ${stats.dev.count} items`);
    console.log(`>ê Test: ${stats.test.count} items`);
    console.log(`=Ü Legacy: ${stats.legacy.count} items`);
    console.log(`=. Planned: ${stats.planned.count} items`);
    console.log(`\n Total Active: ${stats.totalActive} items\n`);

    // Add console utilities for development/debugging
    window.Items = {
        // Direct registry access
        registry: ItemRegistry,

        // Get specific item
        get(itemId) {
            const item = ItemRegistry.getItem(itemId);
            if (!item) {
                console.warn(`   Item "${itemId}" not found`);
                return null;
            }
            return item;
        },

        // Get all active items
        all() {
            return ItemRegistry.getAllActive();
        },

        // Search items by name or ID
        search(term) {
            const lowercaseTerm = term.toLowerCase();
            const all = ItemRegistry.getAllActive();

            return Object.entries(all)
                .filter(([id, item]) =>
                    id.toLowerCase().includes(lowercaseTerm) ||
                    (item.name && item.name.toLowerCase().includes(lowercaseTerm)) ||
                    (item.category && item.category.toLowerCase().includes(lowercaseTerm))
                )
                .reduce((obj, [id, item]) => {
                    obj[id] = item;
                    return obj;
                }, {});
        },

        // Get items by category
        byCategory(category) {
            const all = ItemRegistry.getAllActive();
            return Object.entries(all)
                .filter(([id, item]) => item.category === category)
                .reduce((obj, [id, item]) => {
                    obj[id] = item;
                    return obj;
                }, {});
        },

        // Get items by tier
        byTier(tier) {
            const all = ItemRegistry.getAllActive();
            return Object.entries(all)
                .filter(([id, item]) => item.tier === tier)
                .reduce((obj, [id, item]) => {
                    obj[id] = item;
                    return obj;
                }, {});
        },

        // Get registry statistics
        stats() {
            return ItemRegistry.getStatistics();
        },

        // Print full summary
        summary() {
            ItemRegistry.printSummary();
        },

        // List all item IDs
        list() {
            const all = ItemRegistry.getAllActive();
            return Object.keys(all).sort();
        },

        // Check if item exists
        exists(itemId) {
            return ItemRegistry.hasItem(itemId);
        },

        // Get items from specific registry
        production() { return { ...ItemRegistry.production }; },
        dev() { return { ...ItemRegistry.dev }; },
        test() { return { ...ItemRegistry.test }; },
        legacy() { return { ...ItemRegistry.legacy }; },
        planned() { return { ...ItemRegistry.planned }; }
    };

    // Log available console utilities
    console.log('=¡ Console Utilities Available:');
    console.log('   Items.get(id)           - Get specific item');
    console.log('   Items.all()             - Get all active items');
    console.log('   Items.search(term)      - Search items by name/id/category');
    console.log('   Items.byCategory(cat)   - Get items by category');
    console.log('   Items.byTier(tier)      - Get items by tier');
    console.log('   Items.list()            - List all item IDs');
    console.log('   Items.exists(id)        - Check if item exists');
    console.log('   Items.stats()           - Get registry statistics');
    console.log('   Items.summary()         - Print full summary');
    console.log('   Items.production/dev/test/legacy/planned() - Get items by status\n');

    console.log(' Item Registry Initialized');
});
