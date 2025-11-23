/**
 * BASE REGISTRY CLASS
 *
 * Universal base class for all entity registries in the game.
 * Provides unified interface, multi-environment support, validation, and utilities.
 *
 * All entity-specific registries (ItemRegistry, NodeRegistry, etc.) extend this class.
 *
 * Supported Environments:
 * - production: Live game content
 * - dev: In-development content (enabled in dev mode)
 * - test: Testing/experimental content (enabled in test mode)
 * - legacy: Deprecated content (enabled in preview mode)
 * - planned: Future content (not accessible in game)
 */

class BaseRegistry {
    constructor(entityType) {
        this.entityType = entityType;

        // Storage for each environment
        this.production = {};
        this.dev = {};
        this.test = {};
        this.legacy = {};
        this.planned = {};

        // Environment flags
        this.config = {
            devMode: false,
            testMode: false,
            previewMode: false
        };

        // Schema for validation (set by subclass)
        this.schema = null;

        // Statistics
        this.stats = {
            totalRegistered: 0,
            registrationErrors: 0,
            validationErrors: 0
        };
    }

    // ===== REGISTRATION =====

    /**
     * Register a single entity
     * @param {string} id - Entity ID
     * @param {object} definition - Entity definition object
     * @param {string} environment - Environment to register in (production/dev/test/legacy/planned)
     * @returns {boolean} Success
     */
    register(id, definition, environment = 'production') {
        try {
            // Validate environment
            if (!this._isValidEnvironment(environment)) {
                throw new Error(`Invalid environment: ${environment}`);
            }

            // Validate definition if schema exists
            if (this.schema) {
                this._validateDefinition(id, definition);
            }

            // Ensure ID is set
            if (!definition.id) {
                definition.id = id;
            }

            // Register in specified environment
            this[environment][id] = Object.freeze(definition);
            this.stats.totalRegistered++;

            return true;
        } catch (error) {
            console.error(`❌ Failed to register ${this.entityType} '${id}':`, error.message);
            this.stats.registrationErrors++;
            return false;
        }
    }

    /**
     * Register multiple entities at once
     * @param {object} definitions - Object of {id: definition} pairs
     * @param {string} environment - Environment to register in
     * @returns {number} Number of successful registrations
     */
    registerBatch(definitions, environment = 'production') {
        let successCount = 0;

        for (const [id, definition] of Object.entries(definitions)) {
            if (this.register(id, definition, environment)) {
                successCount++;
            }
        }

        console.log(`✅ Registered ${successCount}/${Object.keys(definitions).length} ${this.entityType}(s) in ${environment}`);
        return successCount;
    }

    // ===== RETRIEVAL =====

    /**
     * Get a single entity by ID (searches active environments)
     * @param {string} id - Entity ID
     * @returns {object|null} Entity definition or null
     */
    get(id) {
        const allActive = this.getAllActive();
        const entity = allActive[id];

        if (!entity) {
            console.warn(`⚠️ ${this.entityType} '${id}' not found in active registries`);
            return null;
        }

        return entity;
    }

    /**
     * Check if entity exists (in active environments)
     * @param {string} id - Entity ID
     * @returns {boolean}
     */
    has(id) {
        const allActive = this.getAllActive();
        return id in allActive;
    }

    /**
     * Get all entities from specified environment
     * @param {string} environment - Environment name
     * @returns {object} All entities in that environment
     */
    getEnvironment(environment) {
        if (!this._isValidEnvironment(environment)) {
            console.error(`Invalid environment: ${environment}`);
            return {};
        }
        return { ...this[environment] };
    }

    /**
     * Get all active entities (production + enabled environments)
     * @returns {object} Merged entities from active environments
     */
    getAllActive() {
        let merged = { ...this.production };

        if (this.config.devMode) {
            merged = { ...merged, ...this.dev };
        }

        if (this.config.testMode) {
            merged = { ...merged, ...this.test };
        }

        if (this.config.previewMode) {
            merged = { ...merged, ...this.legacy };
        }

        return merged;
    }

    /**
     * Get all active entities as object (alias for getAllActive)
     * @returns {object}
     */
    getAllAsObject() {
        return this.getAllActive();
    }

    /**
     * Get all entity IDs from active environments
     * @returns {string[]} Array of entity IDs
     */
    getAllIds() {
        return Object.keys(this.getAllActive());
    }

    /**
     * Get entities from production environment
     * @returns {object}
     */
    getProduction() {
        return { ...this.production };
    }

    /**
     * Get entities from dev environment
     * @returns {object}
     */
    getDev() {
        return { ...this.dev };
    }

    /**
     * Get entities from test environment
     * @returns {object}
     */
    getTest() {
        return { ...this.test };
    }

    /**
     * Get entities from legacy environment
     * @returns {object}
     */
    getLegacy() {
        return { ...this.legacy };
    }

    /**
     * Get entities from planned environment
     * @returns {object}
     */
    getPlanned() {
        return { ...this.planned };
    }

    // ===== ENVIRONMENT CONTROL =====

    /**
     * Enable dev mode (includes dev entities in active set)
     */
    enableDevMode() {
        this.config.devMode = true;
        console.log(`🔧 Dev mode enabled for ${this.entityType} registry`);
    }

    /**
     * Disable dev mode
     */
    disableDevMode() {
        this.config.devMode = false;
        console.log(`🔧 Dev mode disabled for ${this.entityType} registry`);
    }

    /**
     * Enable test mode (includes test entities in active set)
     */
    enableTestMode() {
        this.config.testMode = true;
        console.log(`🧪 Test mode enabled for ${this.entityType} registry`);
    }

    /**
     * Disable test mode
     */
    disableTestMode() {
        this.config.testMode = false;
        console.log(`🧪 Test mode disabled for ${this.entityType} registry`);
    }

    /**
     * Enable preview mode (includes legacy entities in active set)
     */
    enablePreviewMode() {
        this.config.previewMode = true;
        console.log(`👁️ Preview mode enabled for ${this.entityType} registry`);
    }

    /**
     * Disable preview mode
     */
    disablePreviewMode() {
        this.config.previewMode = false;
        console.log(`👁️ Preview mode disabled for ${this.entityType} registry`);
    }

    // ===== VALIDATION =====

    /**
     * Validate entity definition against schema
     * @param {string} id - Entity ID
     * @param {object} definition - Entity definition
     * @throws {Error} If validation fails
     */
    _validateDefinition(id, definition) {
        if (!this.schema) return; // No schema defined

        // Check required fields
        if (this.schema.required) {
            for (const field of this.schema.required) {
                if (!(field in definition)) {
                    this.stats.validationErrors++;
                    throw new Error(`Missing required field '${field}' in ${this.entityType} '${id}'`);
                }
            }
        }

        // Warn on unknown fields (possible typos)
        if (this.schema.optional) {
            const allKnownFields = [
                ...(this.schema.required || []),
                ...(this.schema.optional || [])
            ];

            for (const field of Object.keys(definition)) {
                if (!allKnownFields.includes(field)) {
                    console.warn(`⚠️ Unknown field '${field}' in ${this.entityType} '${id}' (possible typo?)`);
                }
            }
        }
    }

    /**
     * Check if environment name is valid
     * @param {string} environment
     * @returns {boolean}
     */
    _isValidEnvironment(environment) {
        return ['production', 'dev', 'test', 'legacy', 'planned'].includes(environment);
    }

    /**
     * Initialize schema (implemented by subclasses)
     * Subclasses should override this to define their schema
     */
    _initSchema() {
        // Override in subclass
        this.schema = {
            required: [],
            optional: []
        };
    }

    // ===== UTILITIES =====

    /**
     * Clear all entities in specified environment
     * @param {string} environment - Environment to clear
     */
    clear(environment) {
        if (!this._isValidEnvironment(environment)) {
            console.error(`Invalid environment: ${environment}`);
            return;
        }

        const count = Object.keys(this[environment]).length;
        this[environment] = {};
        console.log(`🗑️ Cleared ${count} ${this.entityType}(s) from ${environment}`);
    }

    /**
     * Clear all entities from all environments
     */
    clearAll() {
        this.production = {};
        this.dev = {};
        this.test = {};
        this.legacy = {};
        this.planned = {};
        console.log(`🗑️ Cleared all ${this.entityType} registries`);
    }

    /**
     * Import entities from JSON
     * @param {object} data - Object of {id: definition} pairs
     * @param {string} environment - Environment to import into
     * @returns {number} Number imported
     */
    importJSON(data, environment = 'production') {
        try {
            const count = this.registerBatch(data, environment);
            console.log(`📥 Imported ${count} ${this.entityType}(s) to ${environment}`);
            return count;
        } catch (error) {
            console.error(`❌ JSON import failed for ${this.entityType}:`, error);
            return 0;
        }
    }

    /**
     * Export entities to JSON
     * @param {string} environment - Environment to export (default: all active)
     * @returns {object} Entity definitions as JSON object
     */
    exportJSON(environment = null) {
        if (environment) {
            return this.getEnvironment(environment);
        } else {
            return this.getAllActive();
        }
    }

    /**
     * Get registry statistics
     * @returns {object} Statistics object
     */
    getStatistics() {
        const activeCount = Object.keys(this.getAllActive()).length;

        return {
            entityType: this.entityType,
            total: this.stats.totalRegistered,
            production: Object.keys(this.production).length,
            dev: Object.keys(this.dev).length,
            test: Object.keys(this.test).length,
            legacy: Object.keys(this.legacy).length,
            planned: Object.keys(this.planned).length,
            active: activeCount,
            registrationErrors: this.stats.registrationErrors,
            validationErrors: this.stats.validationErrors,
            config: { ...this.config }
        };
    }

    /**
     * Print registry summary to console
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log(`\n📊 ${this.entityType.toUpperCase()} REGISTRY SUMMARY`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Total Registered: ${stats.total}`);
        console.log(`Active: ${stats.active}`);
        console.log(`  Production: ${stats.production}`);
        console.log(`  Dev: ${stats.dev} ${this.config.devMode ? '✅' : '❌'}`);
        console.log(`  Test: ${stats.test} ${this.config.testMode ? '✅' : '❌'}`);
        console.log(`  Legacy: ${stats.legacy} ${this.config.previewMode ? '✅' : '❌'}`);
        console.log(`  Planned: ${stats.planned}`);
        console.log(`Errors: ${stats.registrationErrors + stats.validationErrors}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }
}

// Export for use in other registries
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseRegistry;
}
