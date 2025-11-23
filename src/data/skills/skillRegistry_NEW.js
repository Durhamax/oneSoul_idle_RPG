/**
 * SKILL REGISTRY (Refactored to extend BaseRegistry)
 *
 * Multi-environment organization system for skills.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 *
 * ✅ All original methods preserved
 * ✅ New standardized methods added (.get, .has, etc.)
 * ✅ No breaking changes
 */

class SkillRegistryClass extends BaseRegistry {
    constructor() {
        super('skill');

        // Map config names for backward compatibility
        Object.defineProperty(this.config, 'includeDevSkills', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestSkills', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includeLegacySkills', {
            get() { return this.previewMode; },
            set(value) { this.previewMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedSkills', {
            get() { return false; },
            set(value) { /* no-op */ }
        });

        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'description'],
            optional: [
                'icon', 'category', 'type', 'baseXP', 'xpCurve', 'maxLevel',
                'unlockLevel', 'unlockRequirement', 'passiveBonus',
                'activeAbilities', 'synergies', 'masteryBonus',
                'color', 'displayOrder', 'tags', 'trainable',
                'combatSkill', 'gatheringSkill', 'craftingSkill'
            ]
        };
    }

    // ===== ORIGINAL METHODS (100% backward compatible) =====

    // Note: register() method removed - use BaseRegistry's implementation
    // Use registerBatch() for bulk registration instead

    /**
     * Get skills by status (environment) (ORIGINAL METHOD)
     * @param {string} status - Registry name (production, dev, test, legacy, planned)
     * @returns {Object} Skills from specified registry
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
        console.log('║       SKILL REGISTRY SUMMARY          ║');
        console.log(`${'═'.repeat(40)}\n`);
        console.log(`📦 Production: ${stats.production} skills`);
        console.log(`🔧 Dev: ${stats.dev} skills`);
        console.log(`🧪 Test: ${stats.test} skills`);
        console.log(`📜 Legacy: ${stats.legacy} skills`);
        console.log(`🔮 Planned: ${stats.planned} skills`);
        console.log(`\n✅ Total Active: ${stats.total} skills\n`);
    }

    // Note: BaseRegistry already provides:
    // - register(id, definition, environment) - single skill registration
    // - registerBatch(definitions, environment)
    // - get(id) - NEW standardized method
    // - has(id) - NEW standardized method
    // - getAllActive(), getAllAsObject(), getAllIds()
    // - getProduction(), getDev(), getTest(), getLegacy(), getPlanned()
    // - clear(), clearAll(), importJSON(), exportJSON()
    // - enableDevMode(), disableDevMode(), enableTestMode(), disableTestMode()
}

// Create singleton instance
const SkillRegistry = new SkillRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.SkillRegistry = SkillRegistry;
}
