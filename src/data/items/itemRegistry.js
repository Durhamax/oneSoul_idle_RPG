/**
 * ITEM REGISTRY
 *
 * Multi-environment item organization system that separates items by purpose:
 * - production: Real game items (active in production)
 * - dev: Development testing items
 * - test: Temporary testing items
 * - legacy: Deprecated items (kept for backwards compatibility)
 * - planned: Future items (not yet implemented)
 *
 * This allows clean separation of concerns and makes it easy to:
 * - Toggle dev items on/off
 * - Maintain backwards compatibility with legacy items
 * - Plan future items without cluttering production
 * - Test new items in isolation
 */

/**
 * Item Registry System
 * Manages multiple item registries for different environments
 */
const ItemRegistry = {
    // Environment Registries
    production: {},  // Real game items (active)
    dev: {},         // Development testing items
    test: {},        // Temporary testing items
    legacy: {},      // Deprecated items (backwards compat)
    planned: {},     // Future items (documentation)

    // Configuration
    config: {
        includeDevItems: false,      // Toggle dev items in builds
        includeTestItems: false,     // Toggle test items in builds
        includeLegacyItems: true,    // Keep legacy items for save compatibility
        includePlannedItems: false,  // Toggle planned items (for previews)
    },

    /**
     * Register items to a specific registry
     *
     * @param {string} registry - Registry name (production, dev, test, legacy, planned)
     * @param {Object} items - Items to register
     */
    register(registry, items) {
        if (!this.hasOwnProperty(registry)) {
            console.error(`❌ Invalid registry: ${registry}`);
            return;
        }

        this[registry] = {
            ...this[registry],
            ...items,
        };

        console.log(`📦 Registered ${Object.keys(items).length} items to ${registry} registry`);
    },

    /**
     * Get all active items based on config
     * Combines registries according to config flags
     *
     * @returns {Object} Combined items from active registries
     */
    getAllActive() {
        let combined = {
            ...this.production,  // Always include production
        };

        if (this.config.includeDevItems) {
            combined = { ...combined, ...this.dev };
        }

        if (this.config.includeTestItems) {
            combined = { ...combined, ...this.test };
        }

        if (this.config.includeLegacyItems) {
            combined = { ...combined, ...this.legacy };
        }

        if (this.config.includePlannedItems) {
            combined = { ...combined, ...this.planned };
        }

        return combined;
    },

    /**
     * Get production items only
     *
     * @returns {Object} Production items
     */
    getProduction() {
        return { ...this.production };
    },

    /**
     * Get dev items only
     *
     * @returns {Object} Dev items
     */
    getDev() {
        return { ...this.dev };
    },

    /**
     * Get test items only
     *
     * @returns {Object} Test items
     */
    getTest() {
        return { ...this.test };
    },

    /**
     * Get legacy items only
     *
     * @returns {Object} Legacy items
     */
    getLegacy() {
        return { ...this.legacy };
    },

    /**
     * Get planned items only
     *
     * @returns {Object} Planned items
     */
    getPlanned() {
        return { ...this.planned };
    },

    /**
     * Get items by tier from active registries
     *
     * @param {string} tier - Equipment tier (starter, basic, intermediate, advanced, elite, legendary)
     * @returns {Array} Items matching tier
     */
    getItemsByTier(tier) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.tier === tier
        );
    },

    /**
     * Get items by category from active registries
     *
     * @param {string} category - Item category
     * @returns {Array} Items matching category
     */
    getItemsByCategory(category) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.category === category
        );
    },

    /**
     * Get items by rarity from active registries
     *
     * @param {string} rarity - Item rarity
     * @returns {Array} Items matching rarity
     */
    getItemsByRarity(rarity) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.rarity === rarity
        );
    },

    /**
     * Get items by slot from active registries
     *
     * @param {string} slot - Equipment slot
     * @returns {Array} Items matching slot
     */
    getItemsBySlot(slot) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.category === 'equipment' && item.slot === slot
        );
    },

    /**
     * Get items by level range from active registries
     *
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Array} Items in level range
     */
    getItemsByLevelRange(minLevel, maxLevel) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.level && item.level >= minLevel && item.level <= maxLevel
        );
    },

    /**
     * Search items by name or description from active registries
     *
     * @param {string} searchTerm - Search term (case insensitive)
     * @returns {Array} Matching items
     */
    searchItems(searchTerm) {
        const items = this.getAllActive();
        const term = searchTerm.toLowerCase();
        return Object.values(items).filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    },

    /**
     * Get item from any active registry
     *
     * @param {string} itemId - Item ID
     * @returns {Object|null} Item or null if not found
     */
    getItem(itemId) {
        const items = this.getAllActive();
        return items[itemId] || null;
    },

    /**
     * Check if item exists in any active registry
     *
     * @param {string} itemId - Item ID
     * @returns {boolean} True if item exists
     */
    hasItem(itemId) {
        const items = this.getAllActive();
        return itemId in items;
    },

    /**
     * Get registry statistics
     *
     * @returns {Object} Statistics for each registry
     */
    getStatistics() {
        return {
            production: {
                count: Object.keys(this.production).length,
                active: true,
            },
            dev: {
                count: Object.keys(this.dev).length,
                active: this.config.includeDevItems,
            },
            test: {
                count: Object.keys(this.test).length,
                active: this.config.includeTestItems,
            },
            legacy: {
                count: Object.keys(this.legacy).length,
                active: this.config.includeLegacyItems,
            },
            planned: {
                count: Object.keys(this.planned).length,
                active: this.config.includePlannedItems,
            },
            totalActive: Object.keys(this.getAllActive()).length,
        };
    },

    /**
     * Print registry summary
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       ITEM REGISTRY SUMMARY           ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log('📦 Registry Counts:');
        console.log(`   Production:  ${stats.production.count.toString().padStart(3)} items (${stats.production.active ? '✅ active' : '❌ inactive'})`);
        console.log(`   Dev:         ${stats.dev.count.toString().padStart(3)} items (${stats.dev.active ? '✅ active' : '❌ inactive'})`);
        console.log(`   Test:        ${stats.test.count.toString().padStart(3)} items (${stats.test.active ? '✅ active' : '❌ inactive'})`);
        console.log(`   Legacy:      ${stats.legacy.count.toString().padStart(3)} items (${stats.legacy.active ? '✅ active' : '❌ inactive'})`);
        console.log(`   Planned:     ${stats.planned.count.toString().padStart(3)} items (${stats.planned.active ? '✅ active' : '❌ inactive'})`);

        console.log(`\n🎯 Total Active: ${stats.totalActive} items`);

        console.log('\n⚙️  Configuration:');
        console.log(`   Include Dev Items:     ${this.config.includeDevItems ? '✅ yes' : '❌ no'}`);
        console.log(`   Include Test Items:    ${this.config.includeTestItems ? '✅ yes' : '❌ no'}`);
        console.log(`   Include Legacy Items:  ${this.config.includeLegacyItems ? '✅ yes' : '❌ no'}`);
        console.log(`   Include Planned Items: ${this.config.includePlannedItems ? '✅ yes' : '❌ no'}`);

        console.log('\n' + '─'.repeat(50) + '\n');
    },

    /**
     * Enable dev mode (includes dev and test items)
     */
    enableDevMode() {
        this.config.includeDevItems = true;
        this.config.includeTestItems = true;
        console.log('🔧 Dev mode enabled (dev + test items active)');
    },

    /**
     * Disable dev mode (production only)
     */
    disableDevMode() {
        this.config.includeDevItems = false;
        this.config.includeTestItems = false;
        console.log('🎮 Production mode (dev + test items inactive)');
    },

    /**
     * Enable preview mode (includes planned items)
     */
    enablePreviewMode() {
        this.config.includePlannedItems = true;
        console.log('👀 Preview mode enabled (planned items visible)');
    },

    /**
     * Disable preview mode
     */
    disablePreviewMode() {
        this.config.includePlannedItems = false;
        console.log('🎮 Preview mode disabled');
    },

    /**
     * Reset to default configuration
     */
    resetConfig() {
        this.config = {
            includeDevItems: false,
            includeTestItems: false,
            includeLegacyItems: true,
            includePlannedItems: false,
        };
        console.log('🔄 Registry config reset to defaults');
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ItemRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.ItemRegistry = ItemRegistry;
}
