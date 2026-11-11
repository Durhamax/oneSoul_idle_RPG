/**
 * REGION REGISTRY (Refactored to extend BaseRegistry)
 *
 * Wraps WorldRegions in registry pattern for consistency.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 *
 * ✅ All original methods preserved
 * ✅ New standardized methods added (.get, .has, etc.)
 * ✅ No breaking changes
 */

class RegionRegistryClass extends BaseRegistry {
    constructor() {
        super('region');

        // Map config names for backward compatibility
        Object.defineProperty(this.config, 'includeDevRegions', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestRegions', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includeLegacyRegions', {
            get() { return this.previewMode; },
            set(value) { this.previewMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedRegions', {
            get() { return false; },
            set(value) { /* no-op */ }
        });

        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'description'],
            optional: [
                'icon', 'assetPath', 'level', 'tier', 'recommendedLevel',
                'unlockRequirement', 'unlockLevel', 'unlockQuest',
                'biomes', 'zones', 'locations', 'settlements',
                'enemies', 'resources', 'nodes', 'missions',
                'npcs', 'lore', 'climate', 'terrain',
                'dangerLevel', 'explorationRewards', 'discoverable',
                'hidden', 'mapData', 'tilemapPath', 'tags'
            ]
        };
    }

    // ===== ORIGINAL METHODS (100% backward compatible) =====

    /**
     * Register regions to a specific registry (ORIGINAL METHOD)
     * @param {string} registry - Registry name (production, dev, test, legacy, planned)
     * @param {Object} regions - Regions to register
     */
    register(registry, regions) {
        const environment = registry === 'production' ? 'production' :
                          registry === 'dev' ? 'dev' :
                          registry === 'test' ? 'test' :
                          registry === 'legacy' ? 'legacy' :
                          registry === 'planned' ? 'planned' : null;

        if (!environment) {
            console.error(`❌ Invalid registry: ${registry}`);
            return;
        }

        // Use BaseRegistry's registerBatch for batch registration
        this.registerBatch(regions, environment);
        console.log(`📦 Registered ${Object.keys(regions).length} regions to ${registry} registry`);
    }

    /**
     * Get regions by status (environment) (ORIGINAL METHOD)
     * @param {string} status - Registry name (production, dev, test, legacy, planned)
     * @returns {Object} Regions from specified registry
     */
    getByStatus(status) {
        if (!this.hasOwnProperty(status)) {
            console.error(`❌ Invalid status: ${status}`);
            return {};
        }
        return { ...this[status] };
    }

    /**
     * Get statistics (ORIGINAL METHOD)
     * @returns {Object} Statistics for each registry
     */
    getStatistics() {
        const stats = {
            production: Object.keys(this.production).length,
            dev: Object.keys(this.dev).length,
            test: Object.keys(this.test).length,
            legacy: Object.keys(this.legacy).length,
            planned: Object.keys(this.planned).length,
            total: 0
        };
        stats.total = stats.production + stats.dev + stats.test + stats.legacy + stats.planned;
        return stats;
    }

    /**
     * Print registry summary (ORIGINAL METHOD - with original formatting)
     */
    printSummary() {
        const stats = this.getStatistics();
        console.log(`\n${'═'.repeat(40)}`);
        console.log('║      REGION REGISTRY SUMMARY          ║');
        console.log(`${'═'.repeat(40)}\n`);
        console.log(`📦 Production: ${stats.production} regions`);
        console.log(`🔧 Dev: ${stats.dev} regions`);
        console.log(`🧪 Test: ${stats.test} regions`);
        console.log(`📜 Legacy: ${stats.legacy} regions`);
        console.log(`🔮 Planned: ${stats.planned} regions`);
        console.log(`\n✅ Total Active: ${stats.total} regions\n`);
    }

    // Note: BaseRegistry already provides:
    // - register(id, definition, environment) - single region registration
    // - registerBatch(definitions, environment)
    // - get(id) - NEW standardized method
    // - has(id) - NEW standardized method
    // - getAllActive(), getAllAsObject(), getAllIds()
    // - getProduction(), getDev(), getTest(), getLegacy(), getPlanned()
    // - clear(), clearAll(), importJSON(), exportJSON()
    // - enableDevMode(), disableDevMode(), enableTestMode(), disableTestMode()
}

// Create singleton instance
const RegionRegistry = new RegionRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.RegionRegistry = RegionRegistry;
}
