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

        // Extract base item ID if this is an instance ID (e.g., "unityScoutSet_1234567_abc" -> "unityScoutSet")
        const baseId = this.extractBaseId(itemId);

        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            // Try direct lookup first, then base ID
            return ItemRegistry.getItem(itemId) || ItemRegistry.getItem(baseId);
        }

        // Secondary: Use GameEngine.getItem() if available
        if (typeof GameEngine !== 'undefined' && GameEngine.getItem) {
            return GameEngine.getItem(itemId) || GameEngine.getItem(baseId);
        }

        // Fallback: Use definitions.items (legacy support)
        if (typeof GameEngine !== 'undefined' && GameEngine.definitions?.items) {
            return GameEngine.definitions.items[itemId] || GameEngine.definitions.items[baseId] || null;
        }

        console.warn(`⚠️ ItemAccessHelper: Cannot access item ${itemId} - no item system available`);
        return null;
    },

    /**
     * Extract base item ID from an instance ID
     * Instance IDs follow pattern: baseId_timestamp_randomSuffix
     * @param {string} itemId - Item ID (may be instance ID or base ID)
     * @returns {string} Base item ID
     */
    extractBaseId(itemId) {
        if (!itemId) return itemId;

        // Check if this looks like an instance ID (contains underscore followed by numbers)
        // Pattern: baseId_timestamp_suffix (e.g., "unityScoutSet_1764951189390_mum2erxd4")
        const instancePattern = /^(.+?)_\d+_[a-z0-9]+$/i;
        const match = itemId.match(instancePattern);

        if (match) {
            return match[1]; // Return the base ID
        }

        // Also check bank.instanced for the actual base ID
        if (typeof GameEngine !== 'undefined' && GameEngine.state?.bank?.instanced?.[itemId]) {
            const instance = GameEngine.state.bank.instanced[itemId];
            if (instance.baseItemId) {
                return instance.baseItemId;
            }
        }

        return itemId; // Return as-is if not an instance ID
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
