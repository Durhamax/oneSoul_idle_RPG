/**
 * ITEM REGISTRY (Refactored to extend BaseRegistry)
 *
 * Multi-environment item organization system.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 *
 * ✅ All original methods preserved
 * ✅ New standardized methods added (.get, .has, etc.)
 * ✅ No breaking changes
 */

class ItemRegistryClass extends BaseRegistry {
    constructor() {
        super('item');

        // Enable test and legacy items by default
        this.config.testMode = true;     // Include test items
        this.config.previewMode = true;  // Include legacy items from definitions.js

        // Map config names for backward compatibility
        // BaseRegistry uses devMode/testMode/previewMode
        // Original ItemRegistry uses includeDevItems/includeTestItems/includeLegacyItems
        Object.defineProperty(this.config, 'includeDevItems', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestItems', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includeLegacyItems', {
            get() { return this.previewMode; },
            set(value) { this.previewMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedItems', {
            get() { return false; }, // Planned items never included by default
            set(value) { /* no-op, planned items controlled separately */ }
        });

        this._initSchema();
    }

    /**
     * Initialize item schema for validation
     */
    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'description', 'icon', 'category', 'stackLimit'],
            optional: [
                'itemType', 'subcategory', 'rarity', 'tier', 'quality', 'value', 'weight',
                'slot', 'equipSlot', 'stats', 'damageType', 'armorRatings', 'armorType',
                'attachmentSlot', 'weaponType', 'magazineSize', 'reloadTime',
                'specialAttack', 'gatheringBonus', 'craftingBonus', 'experienceBonus',
                'healAmount', 'buffs', 'debuffs', 'effects', 'unlockRequirement',
                'tags', 'assetPath', 'image', 'defaultTab', 'questItem', 'tradeable',
                'sellable', 'craftable', 'level', 'requiredLevel', 'requiredSkills',
                'durability', 'maxDurability', 'repairCost', 'modSlots', 'setBonus',
                'statusEffects', 'passive', 'active', 'cooldown', 'charges', 'consumeOnUse',
                'resourceType', 'gatherSkill', 'gatherLevel', 'craftingUse',
                'tutorialItem', 'questReward', 'toolType',
                // NEW: Skill-based tool system
                'skill',
                // Equipment fields from itemSchema.js
                'attributes', 'combatStats', 'requirements', 'setId',
                // Consumable fields from itemSchema.js
                'effectType', 'effectValue', 'effectDuration', 'effect', 'enduranceRecovery',
                // Special item fields
                'droppable', 'questId', 'unique', 'special',
                // DUAL-BANK: Instance management
                'instanced', 'iconPath', 'modType', 'modStat', 'bonusValue', 'bonusStat',
                // Legacy/migration fields
                'deprecated', 'replacedBy', 'removed', 'planned', 'plannedVersion'
            ]
        };
    }

    // ===== ORIGINAL METHODS (100% backward compatible) =====

    /**
     * Get single item (ORIGINAL METHOD with compatibility aliases)
     * @param {string} itemId - Item ID
     * @returns {object|null} Item or null if not found
     */
    getItem(itemId) {
        const items = this.getAllActive();
        const item = items[itemId] || null;

        if (!item) return null;

        // Create a new object with aliases (items may be frozen/sealed)
        // This ensures compatibility without modifying the original object
        if (!item._aliased) {
            const aliasedItem = {
                ...item,
                // Icon alias (legacy items use 'image', modern use 'icon')
                icon: item.icon || item.image || '❓',
                // Damage aliases (production uses combatStats.damage)
                attackDamage: item.combatStats?.damage || item.damage || 0,
                // Slot aliases (production uses 'slot', legacy used 'equipSlot')
                equipSlot: item.slot,
                // Attack speed alias
                attackSpeed: item.combatStats?.attackSpeed || 1.0,
                // Defense alias
                defense: item.combatStats?.defense || 0,
                // Mark as aliased
                _aliased: true
            };

            return aliasedItem;
        }

        return item;
    }

    /**
     * Check if item exists (ORIGINAL METHOD)
     * @param {string} itemId - Item ID
     * @returns {boolean} True if item exists
     */
    hasItem(itemId) {
        const items = this.getAllActive();
        return itemId in items;
    }

    /**
     * Get items by tier (ORIGINAL METHOD - returns Array)
     * @param {string} tier - Equipment tier
     * @returns {Array} Items matching tier
     */
    getItemsByTier(tier) {
        const items = this.getAllActive();
        return Object.values(items).filter(item => item.tier === tier);
    }

    /**
     * Get items by category (ORIGINAL METHOD - returns Array)
     * @param {string} category - Item category
     * @returns {Array} Items matching category
     */
    getItemsByCategory(category) {
        const items = this.getAllActive();
        return Object.values(items).filter(item => item.category === category);
    }

    /**
     * Get items by rarity (ORIGINAL METHOD - returns Array)
     * @param {string} rarity - Item rarity
     * @returns {Array} Items matching rarity
     */
    getItemsByRarity(rarity) {
        const items = this.getAllActive();
        return Object.values(items).filter(item => item.rarity === rarity);
    }

    /**
     * Get items by equipment slot (ORIGINAL METHOD - returns Array)
     * @param {string} slot - Equipment slot
     * @returns {Array} Items matching slot
     */
    getItemsBySlot(slot) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.category === 'equipment' && item.slot === slot
        );
    }

    /**
     * Get items by level range (ORIGINAL METHOD - returns Array)
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Array} Items in level range
     */
    getItemsByLevelRange(minLevel, maxLevel) {
        const items = this.getAllActive();
        return Object.values(items).filter(item =>
            item.level && item.level >= minLevel && item.level <= maxLevel
        );
    }

    /**
     * Search items by name or description (ORIGINAL METHOD - returns Array)
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
    }

    /**
     * Get statistics (RegistryManager compatible format)
     * @returns {object} Statistics for each registry
     */
    getStatistics() {
        const activeCount = Object.keys(this.getAllActive()).length;
        const totalCount = Object.keys(this.production).length +
                          Object.keys(this.dev).length +
                          Object.keys(this.test).length +
                          Object.keys(this.legacy).length +
                          Object.keys(this.planned).length;

        return {
            // RegistryManager-compatible fields
            status: 'loaded',
            total: totalCount,
            active: activeCount,
            hasBaseRegistry: false,

            // Original detailed fields for legacy compatibility
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
            totalActive: activeCount,
        };
    }

    /**
     * Print registry summary (ORIGINAL METHOD - with original formatting)
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
    }

    /**
     * Enable dev mode (ORIGINAL METHOD - includes dev and test items)
     */
    enableDevMode() {
        this.config.includeDevItems = true;
        this.config.includeTestItems = true;
        console.log('🔧 Dev mode enabled (dev + test items active)');
    }

    /**
     * Disable dev mode (ORIGINAL METHOD - production only)
     */
    disableDevMode() {
        this.config.includeDevItems = false;
        this.config.includeTestItems = false;
        console.log('🎮 Production mode (dev + test items inactive)');
    }

    // Note: BaseRegistry already provides:
    // - register(id, definition, environment)
    // - registerBatch(definitions, environment)
    // - get(id) - NEW standardized method
    // - has(id) - NEW standardized method
    // - getAll(), getAllActive(), getAllAsObject(), getAllIds()
    // - getProduction(), getDev(), getTest(), getLegacy(), getPlanned()
    // - clear(), clearAll(), importJSON(), exportJSON()
    // - enableTestMode(), disableTestMode(), enablePreviewMode(), disablePreviewMode()
}

// Create singleton instance
const ItemRegistry = new ItemRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ItemRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.ItemRegistry = ItemRegistry;
}
