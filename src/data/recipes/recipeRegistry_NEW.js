/**
 * RECIPE REGISTRY (Refactored to extend BaseRegistry)
 *
 * Multi-environment organization system for crafting recipes.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 *
 * ✅ All original methods preserved
 * ✅ New standardized methods added (.get, .has, etc.)
 * ✅ No breaking changes
 */

class RecipeRegistryClass extends BaseRegistry {
    constructor() {
        super('recipe');

        // Map config names for backward compatibility
        Object.defineProperty(this.config, 'includeDevRecipes', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestRecipes', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includeLegacyRecipes', {
            get() { return this.previewMode; },
            set(value) { this.previewMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedRecipes', {
            get() { return false; },
            set(value) { /* no-op */ }
        });

        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'skill', 'ingredients', 'output'],
            optional: [
                'description', 'icon', 'category', 'tier', 'level', 'requiredLevel',
                'craftTime', 'experience', 'station', 'requiredStation',
                'unlockRequirement', 'unlockLevel', 'unlockQuest',
                'tools', 'requiredTools', 'energy', 'energyCost',
                'successChance', 'critChance', 'failOutput',
                'tags', 'discoverable', 'hidden', 'masterable',
                'skillBonus', 'outputAmount', 'variations'
            ]
        };
    }

    // ===== ORIGINAL METHODS (100% backward compatible) =====

    /**
     * Register recipes to a specific registry (ORIGINAL METHOD)
     * @param {string} registry - Registry name (production, dev, test, legacy, planned)
     * @param {Object} recipes - Recipes to register
     */
    register(registry, recipes) {
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
        this.registerBatch(recipes, environment);
        console.log(`📦 Registered ${Object.keys(recipes).length} recipes to ${registry} registry`);
    }

    /**
     * Get recipes by status (environment) (ORIGINAL METHOD)
     * @param {string} status - Registry name (production, dev, test, legacy, planned)
     * @returns {Object} Recipes from specified registry
     */
    getByStatus(status) {
        if (!this.hasOwnProperty(status)) {
            console.error(`❌ Invalid status: ${status}`);
            return {};
        }
        return { ...this[status] };
    }

    /**
     * Get recipes by skill (ORIGINAL METHOD - returns Array)
     * @param {string} skill - Skill type
     * @returns {Array} Recipes for that skill
     */
    getBySkill(skill) {
        const recipes = this.getAllActive();
        return Object.values(recipes).filter(r => r.skill === skill);
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
        console.log('║      RECIPE REGISTRY SUMMARY          ║');
        console.log(`${'═'.repeat(40)}\n`);
        console.log(`📦 Production: ${stats.production} recipes`);
        console.log(`🔧 Dev: ${stats.dev} recipes`);
        console.log(`🧪 Test: ${stats.test} recipes`);
        console.log(`📜 Legacy: ${stats.legacy} recipes`);
        console.log(`🔮 Planned: ${stats.planned} recipes`);
        console.log(`\n✅ Total Active: ${stats.total} recipes\n`);
    }

    // Note: BaseRegistry already provides:
    // - register(id, definition, environment) - single recipe registration
    // - registerBatch(definitions, environment)
    // - get(id) - NEW standardized method
    // - has(id) - NEW standardized method
    // - getAllActive(), getAllAsObject(), getAllIds()
    // - getProduction(), getDev(), getTest(), getLegacy(), getPlanned()
    // - clear(), clearAll(), importJSON(), exportJSON()
    // - enableDevMode(), disableDevMode(), enableTestMode(), disableTestMode()
}

// Create singleton instance
const RecipeRegistry = new RecipeRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.RecipeRegistry = RecipeRegistry;
}
