/**
 * ITEM ACCESS HELPER FOR UI COMPONENTS
 *
 * Provides standardized item access for all UI components.
 * This is the ONLY way UI components should access item data.
 *
 * USAGE:
 *   const item = ItemAccessHelper.getItem(itemId);
 *   if (item) {
 *       // Use item...
 *   }
 */

const ItemAccessHelper = {
    /**
     * Get item definition (STANDARDIZED ACCESS PATTERN)
     * @param {string} itemId - Item ID to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    getItem(itemId) {
        if (!itemId) return null;

        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Secondary: Use GameEngine.getItem() if available
        if (typeof GameEngine !== 'undefined' && GameEngine.getItem) {
            return GameEngine.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        if (typeof GameEngine !== 'undefined' && GameEngine.definitions?.items) {
            return GameEngine.definitions.items[itemId] || null;
        }

        console.warn(`⚠️ ItemAccessHelper: Cannot access item ${itemId} - no item system available`);
        return null;
    },

    /**
     * Check if an item exists
     * @param {string} itemId - Item ID to check
     * @returns {boolean} True if item exists
     */
    hasItem(itemId) {
        return this.getItem(itemId) !== null;
    },

    /**
     * Get multiple items at once
     * @param {string[]} itemIds - Array of item IDs
     * @returns {object} Object mapping itemId to item definition
     */
    getItems(itemIds) {
        const result = {};
        itemIds.forEach(itemId => {
            const item = this.getItem(itemId);
            if (item) {
                result[itemId] = item;
            }
        });
        return result;
    },

    /**
     * Get item with error logging if not found
     * @param {string} itemId - Item ID to retrieve
     * @param {string} context - Context for error message (e.g., "itemModal")
     * @returns {object|null} Item definition or null if not found
     */
    getItemWithError(itemId, context = 'UI') {
        const item = this.getItem(itemId);
        if (!item) {
            console.error(`❌ ${context}: Item '${itemId}' not found`);
        }
        return item;
    }
};

// Make globally available for UI components
if (typeof window !== 'undefined') {
    window.ItemAccessHelper = ItemAccessHelper;
}

console.log('✅ ItemAccessHelper loaded (UI standardized item access)');
