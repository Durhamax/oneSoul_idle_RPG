/**
 * ITEM ID UTILITIES
 *
 * Centralized utilities for parsing item IDs and instance IDs.
 * Used across combat, equipment, and inventory systems.
 *
 * Instance ID format: {baseItemId}_{13-digit-timestamp}_{randomString}
 * Examples:
 *   - sidekick22_1764441114356_r431m1xvb -> base: sidekick22
 *   - unityScoutSet_1764441114453_hshzdfe80 -> base: unityScoutSet
 *   - flintheadArrows -> base: flintheadArrows (stackable, no instance ID)
 */

const ItemIdUtils = {

    /**
     * Instance ID patterns:
     * Format 1: {baseItemId}_{13-digit-timestamp}_{randomString} (craftingSystem)
     * Format 2: {baseItemId}_instance_{13-digit-timestamp}_{randomString} (dualBankSystem)
     *
     * The timestamp is always exactly 13 digits (JavaScript Date.now()).
     */
    INSTANCE_ID_PATTERN: /^(.+)_(\d{13})_([a-z0-9]+)$/i,
    INSTANCE_ID_PATTERN_ALT: /^(.+)_instance_(\d{13})_([a-z0-9]+)$/i,

    /**
     * Extract base item ID from an instance ID or return as-is if already base ID
     *
     * Handles BOTH instance ID formats:
     * - Format 1: baseId_timestamp_random (e.g., 'cookedMeat_1763928759179_abc123')
     * - Format 2: baseId_instance_timestamp_random (e.g., 'cookedMeat_instance_1763928759179_abc123')
     *
     * @param {string|object} itemIdOrInstanceId - Either a base ID, instance ID, or object with baseItemId/itemId
     * @returns {string|null} The base item ID or null if invalid input
     *
     * @example
     * getBaseItemId('sidekick22_1764441114356_r431m1xvb') // Returns: 'sidekick22'
     * getBaseItemId('cookedMeat_instance_1763928759179_abc123') // Returns: 'cookedMeat'
     * getBaseItemId('flintheadArrows') // Returns: 'flintheadArrows'
     * getBaseItemId({ baseItemId: 'sidekick22' }) // Returns: 'sidekick22'
     * getBaseItemId(null) // Returns: null
     */
    getBaseItemId(itemIdOrInstanceId) {
        if (!itemIdOrInstanceId) {
            return null;
        }

        // Handle object with baseItemId or itemId property
        if (typeof itemIdOrInstanceId === 'object') {
            return itemIdOrInstanceId.baseItemId || itemIdOrInstanceId.itemId || null;
        }

        // Must be a string at this point
        if (typeof itemIdOrInstanceId !== 'string') {
            return null;
        }

        // Check Format 2 first: baseId_instance_timestamp_random
        if (itemIdOrInstanceId.includes('_instance_')) {
            return itemIdOrInstanceId.split('_instance_')[0];
        }

        // Try Format 1: baseId_timestamp_random
        const match = itemIdOrInstanceId.match(this.INSTANCE_ID_PATTERN);

        if (match) {
            // match[1] is the base ID (everything before the timestamp)
            return match[1];
        }

        // No match means it's already a base ID (or stackable item)
        return itemIdOrInstanceId;
    },

    /**
     * Check if a string is an instance ID (vs base ID)
     * Handles both formats.
     *
     * @param {string} itemId - Item ID to check
     * @returns {boolean} True if instance ID format
     */
    isInstanceId(itemId) {
        if (!itemId || typeof itemId !== 'string') {
            return false;
        }
        // Check both formats
        return this.INSTANCE_ID_PATTERN_ALT.test(itemId) || this.INSTANCE_ID_PATTERN.test(itemId);
    },

    /**
     * Parse an instance ID into its components
     * Handles both formats.
     *
     * @param {string} instanceId - Full instance ID
     * @returns {Object|null} { baseItemId, timestamp, randomId, fullId, format } or null if not instance ID
     */
    parseInstanceId(instanceId) {
        if (!instanceId || typeof instanceId !== 'string') {
            return null;
        }

        // Try Format 2 first: baseId_instance_timestamp_random
        const matchAlt = instanceId.match(this.INSTANCE_ID_PATTERN_ALT);
        if (matchAlt) {
            return {
                baseItemId: matchAlt[1],
                timestamp: parseInt(matchAlt[2], 10),
                randomId: matchAlt[3],
                fullId: instanceId,
                format: 'instance'
            };
        }

        // Try Format 1: baseId_timestamp_random
        const match = instanceId.match(this.INSTANCE_ID_PATTERN);
        if (match) {
            return {
                baseItemId: match[1],
                timestamp: parseInt(match[2], 10),
                randomId: match[3],
                fullId: instanceId,
                format: 'standard'
            };
        }

        return null;
    },

    /**
     * Get item definition from ItemRegistry, handling both base and instance IDs
     *
     * @param {string|object} itemIdOrInstanceId - Base ID or instance ID
     * @returns {Object|null} Item definition or null if not found
     */
    getItemDefinition(itemIdOrInstanceId) {
        const baseId = this.getBaseItemId(itemIdOrInstanceId);

        if (!baseId) {
            return null;
        }

        // Try ItemRegistry first
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            const item = ItemRegistry.getItem(baseId);
            if (item) return item;
        }

        // Fallback to GameEngine.definitions
        if (typeof GameEngine !== 'undefined' && GameEngine.definitions?.items) {
            return GameEngine.definitions.items[baseId] || null;
        }

        // Fallback to GameEngine.getItem
        if (typeof GameEngine !== 'undefined' && GameEngine.getItem) {
            return GameEngine.getItem(baseId);
        }

        return null;
    },

    /**
     * Get equipped item definition from a slot
     *
     * @param {string} slot - Equipment slot name (e.g., 'weapon', 'armor')
     * @returns {Object|null} Item definition or null if slot empty or item not found
     */
    getEquippedItemDefinition(slot) {
        if (typeof GameEngine === 'undefined' || !GameEngine.state?.equipment) {
            return null;
        }

        const equippedId = GameEngine.state.equipment[slot];
        if (!equippedId) {
            return null;
        }

        return this.getItemDefinition(equippedId);
    },

    /**
     * Get the equipped item's instance ID (or base ID for stackables)
     *
     * @param {string} slot - Equipment slot name
     * @returns {string|null} The instance ID or base ID, or null if slot empty
     */
    getEquippedItemId(slot) {
        if (typeof GameEngine === 'undefined' || !GameEngine.state?.equipment) {
            return null;
        }

        return GameEngine.state.equipment[slot] || null;
    },

    /**
     * Get the base item ID for an equipped item
     *
     * @param {string} slot - Equipment slot name
     * @returns {string|null} The base item ID, or null if slot empty
     */
    getEquippedBaseItemId(slot) {
        const equippedId = this.getEquippedItemId(slot);
        return this.getBaseItemId(equippedId);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ItemIdUtils;
}
