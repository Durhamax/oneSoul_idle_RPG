/**
 * MISSION REGISTRY (Refactored to extend BaseRegistry)
 *
 * Multi-environment organization system for missions/quests.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 *
 * ✅ All original methods preserved
 * ✅ New standardized methods added (.get, .has, etc.)
 * ✅ No breaking changes
 */

class MissionRegistryClass extends BaseRegistry {
    constructor() {
        super('mission');

        // Map config names for backward compatibility
        Object.defineProperty(this.config, 'includeDevMissions', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestMissions', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includeLegacyMissions', {
            get() { return this.previewMode; },
            set(value) { this.previewMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedMissions', {
            get() { return false; },
            set(value) { /* no-op */ }
        });

        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'description'],
            optional: [
                'metadata', 'category', 'region', 'type', 'tier', 'difficulty',
                'objectives', 'rewards', 'requirements', 'prerequisites',
                'repeatable', 'cooldown', 'timeLimit', 'autoComplete',
                'chains', 'branches', 'successText', 'failureText',
                'acceptText', 'completeText', 'icon', 'tags', 'level',
                'questGiver', 'location', 'experience', 'gold', 'items'
            ]
        };
    }

    // ===== ORIGINAL METHODS (100% backward compatible) =====

    /**
     * Register missions to a specific registry (ORIGINAL METHOD)
     * @param {string} registry - Registry name (production, dev, test, legacy, planned)
     * @param {Object} missions - Missions to register
     */
    register(registry, missions) {
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
        this.registerBatch(missions, environment);
        console.log(`📦 Registered ${Object.keys(missions).length} missions to ${registry} registry`);
    }

    /**
     * Get missions by status (environment) (ORIGINAL METHOD)
     * @param {string} status - Registry name (production, dev, test, legacy, planned)
     * @returns {Object} Missions from specified registry
     */
    getByStatus(status) {
        if (!this.hasOwnProperty(status)) {
            console.error(`❌ Invalid status: ${status}`);
            return {};
        }
        return { ...this[status] };
    }

    /**
     * Get missions by category (ORIGINAL METHOD - returns Array)
     * @param {string} category - Mission category
     * @returns {Array} Missions matching category
     */
    getByCategory(category) {
        const missions = this.getAllActive();
        return Object.values(missions).filter(m => m.metadata?.category === category);
    }

    /**
     * Get missions by region (ORIGINAL METHOD - returns Array)
     * @param {string} regionId - Region ID
     * @returns {Array} Missions in that region
     */
    getByRegion(regionId) {
        const missions = this.getAllActive();
        return Object.values(missions).filter(m => m.metadata?.region === regionId);
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
        console.log('║      MISSION REGISTRY SUMMARY         ║');
        console.log(`${'═'.repeat(40)}\n`);
        console.log(`📦 Production: ${stats.production} missions`);
        console.log(`🔧 Dev: ${stats.dev} missions`);
        console.log(`🧪 Test: ${stats.test} missions`);
        console.log(`📜 Legacy: ${stats.legacy} missions`);
        console.log(`🔮 Planned: ${stats.planned} missions`);
        console.log(`\n✅ Total Active: ${stats.total} missions\n`);
    }

    // Note: BaseRegistry already provides:
    // - register(id, definition, environment) - single mission registration
    // - registerBatch(definitions, environment)
    // - get(id) - NEW standardized method
    // - has(id) - NEW standardized method
    // - getAllActive(), getAllAsObject(), getAllIds()
    // - getProduction(), getDev(), getTest(), getLegacy(), getPlanned()
    // - clear(), clearAll(), importJSON(), exportJSON()
    // - enableDevMode(), disableDevMode(), enableTestMode(), disableTestMode()
}

// Create singleton instance
const MissionRegistry = new MissionRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.MissionRegistry = MissionRegistry;
}
