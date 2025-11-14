/**
 * UNIFIED ITEMS DATABASE
 *
 * Central item registry combining all item categories.
 * This is the single source of truth for all items in the game.
 *
 * Now uses ItemRegistry for multi-environment support:
 * - Production items (active by default)
 * - Dev items (testing only)
 * - Legacy items (backwards compatibility)
 * - Planned items (future content)
 *
 * Usage:
 *   const item = ITEMS_DB.ironSword;
 *   const items = ItemUtils.getAllItems();
 *   const weapons = ItemUtils.getItemsByCategory('equipment');
 */

// Import ItemRegistry (must be loaded first)
// In browser mode, ItemRegistry is already available globally from itemRegistry.js
// We don't redeclare it - just use it directly as a global

// Import production items from organized directories
// In browser mode, these are already loaded as globals
// In browser mode, reference globals directly (already loaded by script tags)
const _EQUIPMENT = (typeof EQUIPMENT_ITEMS !== 'undefined' ? EQUIPMENT_ITEMS : {});
const _CONSUMABLE = (typeof CONSUMABLE_ITEMS !== 'undefined' ? CONSUMABLE_ITEMS : {});
const _MATERIAL = (typeof MATERIAL_ITEMS !== 'undefined' ? MATERIAL_ITEMS : {});
const _CURRENCY = (typeof CURRENCY_AND_SPECIAL_ITEMS !== 'undefined' ? CURRENCY_AND_SPECIAL_ITEMS : {});
const _DEV = (typeof DEV_ITEMS !== 'undefined' ? DEV_ITEMS : {});
const _TEST = (typeof TEST_ITEMS !== 'undefined' ? TEST_ITEMS : {});
const _LEGACY = (typeof LEGACY_ITEMS !== 'undefined' ? LEGACY_ITEMS : {});
const _PLANNED = (typeof PLANNED_ITEMS !== 'undefined' ? PLANNED_ITEMS : {});

// Register items to their respective registries
if (ItemRegistry) {
    ItemRegistry.register('production', {
        ..._EQUIPMENT,
        ..._CONSUMABLE,
        ..._MATERIAL,
        ..._CURRENCY,
    });

    ItemRegistry.register('dev', _DEV);
    ItemRegistry.register('test', _TEST);
    ItemRegistry.register('legacy', _LEGACY);
    ItemRegistry.register('planned', _PLANNED);
}

/**
 * Unified Items Database
 * Contains all active items based on ItemRegistry configuration
 */
const ITEMS_DB = ItemRegistry ? ItemRegistry.getAllActive() : {};

/**
 * Item Utilities
 * Helper functions for working with items
 * Now delegates to ItemRegistry for multi-environment support
 */
const ItemUtils = {
    /**
     * Get all items as an array
     * @returns {Array} Array of all items
     */
    getAllItems() {
        return Object.values(ITEMS_DB);
    },

    /**
     * Get all item IDs
     * @returns {Array} Array of all item IDs
     */
    getAllItemIds() {
        return Object.keys(ITEMS_DB);
    },

    /**
     * Get item by ID
     * @param {string} itemId - Item ID to look up
     * @returns {Object|null} Item object or null if not found
     */
    getItem(itemId) {
        return ItemRegistry ? ItemRegistry.getItem(itemId) : (ITEMS_DB[itemId] || null);
    },

    /**
     * Check if item exists
     * @param {string} itemId - Item ID to check
     * @returns {boolean} True if item exists
     */
    hasItem(itemId) {
        return ItemRegistry ? ItemRegistry.hasItem(itemId) : (itemId in ITEMS_DB);
    },

    /**
     * Get items by category
     * @param {string} category - Category to filter by
     * @returns {Array} Array of items in category
     */
    getItemsByCategory(category) {
        return ItemRegistry ? ItemRegistry.getItemsByCategory(category) : this.getAllItems().filter(item => item.category === category);
    },

    /**
     * Get items by rarity
     * @param {string} rarity - Rarity to filter by
     * @returns {Array} Array of items with rarity
     */
    getItemsByRarity(rarity) {
        return ItemRegistry ? ItemRegistry.getItemsByRarity(rarity) : this.getAllItems().filter(item => item.rarity === rarity);
    },

    /**
     * Get items by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array} Array of items with tag
     */
    getItemsByTag(tag) {
        return this.getAllItems().filter(item =>
            item.tags && item.tags.includes(tag)
        );
    },

    /**
     * Get equipment by slot
     * @param {string} slot - Equipment slot
     * @returns {Array} Array of equipment for slot
     */
    getEquipmentBySlot(slot) {
        return ItemRegistry ? ItemRegistry.getItemsBySlot(slot) : this.getAllItems().filter(item => item.category === 'equipment' && item.slot === slot);
    },

    /**
     * Get items by tier
     * @param {string} tier - Equipment tier
     * @returns {Array} Array of items with tier
     */
    getItemsByTier(tier) {
        return ItemRegistry ? ItemRegistry.getItemsByTier(tier) : this.getAllItems().filter(item => item.tier === tier);
    },

    /**
     * Get craftable items
     * @returns {Array} Array of items that can be crafted
     */
    getCraftableItems() {
        return this.getAllItems().filter(item =>
            item.materials || item.recipeId
        );
    },

    /**
     * Get sellable items
     * @returns {Array} Array of items that can be sold
     */
    getSellableItems() {
        return this.getAllItems().filter(item =>
            item.sellable !== false
        );
    },

    /**
     * Get items by level range
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Array} Array of items in level range
     */
    getItemsByLevelRange(minLevel, maxLevel) {
        return ItemRegistry ? ItemRegistry.getItemsByLevelRange(minLevel, maxLevel) : this.getAllItems().filter(item => item.level && item.level >= minLevel && item.level <= maxLevel);
    },

    /**
     * Search items by name
     * @param {string} searchTerm - Search term (case insensitive)
     * @returns {Array} Array of matching items
     */
    searchItems(searchTerm) {
        return ItemRegistry ? ItemRegistry.searchItems(searchTerm) : (() => {
            const term = searchTerm.toLowerCase();
            return this.getAllItems().filter(item =>
                item.name.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
            );
        })();
    },

    /**
     * Get item statistics
     * @returns {Object} Statistics about items database
     */
    getStatistics() {
        const items = this.getAllItems();

        const stats = {
            totalItems: items.length,
            byCategory: {},
            byRarity: {},
            bySlot: {},
            avgValue: 0,
            maxLevel: 0,
        };

        // Count by category
        items.forEach(item => {
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
            stats.byRarity[item.rarity] = (stats.byRarity[item.rarity] || 0) + 1;

            if (item.slot) {
                stats.bySlot[item.slot] = (stats.bySlot[item.slot] || 0) + 1;
            }

            if (item.level && item.level > stats.maxLevel) {
                stats.maxLevel = item.level;
            }
        });

        // Calculate average value
        const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);
        stats.avgValue = Math.round(totalValue / items.length);

        return stats;
    },

    /**
     * Print database summary
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       ITEMS DATABASE SUMMARY          ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log(`📦 Total Items: ${stats.totalItems}`);
        console.log(`💰 Average Value: ${stats.avgValue} gold`);
        console.log(`⭐ Max Level: ${stats.maxLevel}`);

        console.log('\n📁 By Category:');
        Object.entries(stats.byCategory)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`  ${category.padEnd(15)} ${count} items`);
            });

        console.log('\n🎨 By Rarity:');
        Object.entries(stats.byRarity)
            .sort((a, b) => b[1] - a[1])
            .forEach(([rarity, count]) => {
                console.log(`  ${rarity.padEnd(15)} ${count} items`);
            });

        if (Object.keys(stats.bySlot).length > 0) {
            console.log('\n⚔️  Equipment by Slot:');
            Object.entries(stats.bySlot)
                .sort((a, b) => b[1] - a[1])
                .forEach(([slot, count]) => {
                    console.log(`  ${slot.padEnd(15)} ${count} items`);
                });
        }

        console.log('\n' + '─'.repeat(50) + '\n');
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ITEMS_DB,
        ItemUtils,
        ItemRegistry,
        // Export individual categories for direct access if needed
        EQUIPMENT_ITEMS,
        CONSUMABLE_ITEMS,
        MATERIAL_ITEMS,
        CURRENCY_AND_SPECIAL_ITEMS,
        DEV_ITEMS,
        TEST_ITEMS,
        LEGACY_ITEMS,
        PLANNED_ITEMS,
    };
}

// Browser global access
if (typeof window !== 'undefined') {
    window.ITEMS_DB = ITEMS_DB;
    window.ItemUtils = ItemUtils;
    // ItemRegistry is already global from itemRegistry.js
}
