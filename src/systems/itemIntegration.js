/**
 * ITEM INTEGRATION
 *
 * Integration layer between the unified item database and the game engine.
 * Provides simple utility functions to access and use items from the unified system.
 *
 * This module complements the existing itemSystem.js (OOP-based) by providing
 * direct access to the unified item database.
 */

const ItemIntegration = {
    /**
     * Initialize item integration
     */
    init(engine) {
        console.log("🔗 Item Integration Initializing...");

        this.engine = engine;

        // Check if unified database is loaded
        if (typeof ITEMS_DB === 'undefined' || typeof ItemUtils === 'undefined') {
            console.error("❌ Unified item database not loaded!");
            console.log("   Make sure to include item database scripts before game engine.");
            return false;
        }

        console.log(`✅ Unified Database Available: ${ItemUtils.getAllItems().length} items`);

        // Attach utility methods to engine for easy access
        this.attachMethods(engine);

        // Migrate definitions.js items if available
        if (engine.definitions && engine.definitions.items) {
            console.log("\n🔄 Migrating definitions.js items...");
            this.migrateDefinitionsItems(engine.definitions.items);
        }

        // Print database statistics
        console.log("\n📊 Item Database Statistics:");
        const stats = ItemUtils.getStatistics();
        console.log(`   Total Items: ${stats.totalItems}`);
        console.log(`   Categories: ${Object.keys(stats.byCategory).length}`);
        console.log(`   Equipment: ${stats.byCategory.equipment || 0}`);
        console.log(`   Consumables: ${stats.byCategory.consumable || 0}`);
        console.log(`   Materials: ${stats.byCategory.material || 0}`);

        console.log("✅ Item Integration Complete");
        return true;
    },

    /**
     * Attach utility methods to game engine
     */
    attachMethods(engine) {
        // Direct item database access
        engine.ITEMS_DB = ITEMS_DB;
        engine.ItemUtils = ItemUtils;

        // Convenience methods
        engine.getUnifiedItem = this.getUnifiedItem.bind(this);
        engine.getItemInfo = this.getItemInfo.bind(this);
        engine.findItems = this.findItems.bind(this);
        engine.getEquipmentForSlot = this.getEquipmentForSlot.bind(this);
        engine.printItemStats = this.printItemStats.bind(this);
    },

    /**
     * Get item from unified database
     *
     * @param {string} itemId - Item ID
     * @returns {Object|null} Item definition from unified database
     */
    getUnifiedItem(itemId) {
        return ItemUtils.getItem(itemId);
    },

    /**
     * Get basic item info (name, icon, description)
     *
     * @param {string} itemId - Item ID
     * @returns {Object} Basic item info
     */
    getItemInfo(itemId) {
        const item = ItemUtils.getItem(itemId);

        if (!item) {
            return {
                id: itemId,
                name: 'Unknown Item',
                icon: '❓',
                description: 'Item not found in database'
            };
        }

        return {
            id: item.id,
            name: item.name,
            icon: item.icon,
            description: item.description,
            rarity: item.rarity,
            category: item.category,
            value: item.value,
            stackLimit: item.stackLimit
        };
    },

    /**
     * Search/filter items with various criteria
     *
     * @param {Object} criteria - Search criteria
     * @returns {Array} Matching items
     */
    findItems(criteria = {}) {
        let results = ItemUtils.getAllItems();

        // Filter by category
        if (criteria.category) {
            results = results.filter(item => item.category === criteria.category);
        }

        // Filter by rarity
        if (criteria.rarity) {
            results = results.filter(item => item.rarity === criteria.rarity);
        }

        // Filter by slot (for equipment)
        if (criteria.slot) {
            results = results.filter(item => item.slot === criteria.slot);
        }

        // Filter by level range
        if (criteria.minLevel !== undefined) {
            results = results.filter(item => item.level >= criteria.minLevel);
        }

        if (criteria.maxLevel !== undefined) {
            results = results.filter(item => item.level <= criteria.maxLevel);
        }

        // Filter by tags
        if (criteria.tags && criteria.tags.length > 0) {
            results = results.filter(item =>
                item.tags && criteria.tags.some(tag => item.tags.includes(tag))
            );
        }

        // Text search
        if (criteria.search) {
            const searchTerm = criteria.search.toLowerCase();
            results = results.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        // Limit results
        if (criteria.limit) {
            results = results.slice(0, criteria.limit);
        }

        return results;
    },

    /**
     * Get all equipment for a specific slot
     *
     * @param {string} slot - Equipment slot
     * @returns {Array} Equipment items for slot
     */
    getEquipmentForSlot(slot) {
        return ItemUtils.getEquipmentBySlot(slot);
    },

    /**
     * Print item database statistics
     */
    printItemStats() {
        ItemUtils.printSummary();
    },

    /**
     * Migrate definitions.js items to ItemRegistry
     *
     * Wraps old-format items and registers them in the legacy registry.
     * This maintains backwards compatibility while using the new item system.
     *
     * @param {Object} definitionsItems - Items from definitions.js
     */
    migrateDefinitionsItems(definitionsItems) {
        if (typeof DefinitionsAdapter === 'undefined') {
            console.warn("⚠️  DefinitionsAdapter not loaded, skipping migration");
            return;
        }

        if (typeof ItemRegistry === 'undefined') {
            console.warn("⚠️  ItemRegistry not loaded, skipping migration");
            return;
        }

        // Wrap old-format items
        const wrappedItems = DefinitionsAdapter.wrapItems(definitionsItems);

        // Filter items that don't already exist in unified system
        const newItems = {};
        let skipped = 0;
        let added = 0;

        for (const [itemId, item] of Object.entries(wrappedItems)) {
            // Check if item already exists in production registry
            const existsInProduction = ItemRegistry.production.hasOwnProperty(itemId);

            if (existsInProduction) {
                skipped++;
                // console.log(`   ⏭️  Skipping ${itemId} (already in production)`);
            } else {
                newItems[itemId] = item;
                added++;
            }
        }

        // Register wrapped items to legacy registry
        if (Object.keys(newItems).length > 0) {
            ItemRegistry.register('legacy', newItems);
            console.log(`✅ Migrated ${added} items from definitions.js to legacy registry`);
            console.log(`   (Skipped ${skipped} items already in production)`);
        } else {
            console.log(`✅ All definitions.js items already in production registry`);
        }

        // Refresh ITEMS_DB to include newly registered items
        if (typeof window !== 'undefined') {
            window.ITEMS_DB = ItemRegistry.getAllActive();
        }
    },
};

// Auto-attach to GameEngine if available
if (typeof GameEngine !== 'undefined') {
    GameEngine.ItemIntegration = ItemIntegration;
}
