/**
 * RECIPE REGISTRY
 *
 * Central registry for all crafting recipes.
 * Organized by skill (smithing, mechanics, electronics, tailoring, chemistry, cooking).
 * Recipes unlock by skill level only (NOT workstation tier).
 *
 * Uses RecipeSchema for validation.
 */

const RecipeRegistry = {
    // Environment Registries (organized by skill within each environment)
    production: {
        smithing: {},     // Material processing only
        mechanics: {},    // Weapons only (no attachments)
        electronics: {},  // Components
        tailoring: {},    // All armor
        chemistry: {},    // Consumables and ammo propellant
        cooking: {}       // Food and bio materials
    },
    dev: {
        smithing: {},
        mechanics: {},
        electronics: {},
        tailoring: {},
        chemistry: {},
        cooking: {}
    },
    test: {
        smithing: {},
        mechanics: {},
        electronics: {},
        tailoring: {},
        chemistry: {},
        cooking: {}
    },
    legacy: {},
    planned: {},

    config: {
        devMode: false,
        testMode: false,
        previewMode: false
    },

    // Statistics
    stats: {
        totalRegistered: 0,
        registrationErrors: 0,
        validationErrors: 0
    },

    // Valid skills for convenience
    validSkills: ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'],

    // ═══════════════════════════════════════════════════════════════
    // REGISTRATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Register a single recipe
     * @param {string} skill - The crafting skill (smithing, mechanics, etc.)
     * @param {string} id - Recipe ID
     * @param {object} recipe - Recipe definition
     * @param {string} environment - Environment to register in
     * @returns {boolean} Success
     */
    register(skill, id, recipe, environment = 'production') {
        try {
            // Validate skill
            if (!this.validSkills.includes(skill)) {
                throw new Error(`Invalid skill: ${skill}`);
            }

            // Validate environment
            if (!['production', 'dev', 'test', 'legacy', 'planned'].includes(environment)) {
                throw new Error(`Invalid environment: ${environment}`);
            }

            // Validate recipe against schema
            this._validateRecipe(id, recipe);

            // Ensure skill registry exists
            if (!this[environment][skill]) {
                this[environment][skill] = {};
            }

            // Ensure ID is set
            if (!recipe.id) {
                recipe.id = id;
            }

            // Ensure skill is set
            if (!recipe.skill) {
                recipe.skill = skill;
            }

            // Register the recipe (frozen for immutability)
            this[environment][skill][id] = Object.freeze(recipe);
            this.stats.totalRegistered++;

            return true;
        } catch (error) {
            console.error(`[RecipeRegistry] Failed to register recipe '${id}':`, error.message);
            this.stats.registrationErrors++;
            return false;
        }
    },

    /**
     * Register multiple recipes for a skill at once
     * @param {string} skill - The crafting skill
     * @param {object} recipes - Object of {id: recipe} pairs
     * @param {string} environment - Environment to register in
     * @returns {number} Number of successful registrations
     */
    registerBatch(skill, recipes, environment = 'production') {
        let successCount = 0;

        for (const [id, recipe] of Object.entries(recipes)) {
            if (this.register(skill, id, recipe, environment)) {
                successCount++;
            }
        }

        console.log(`[RecipeRegistry] Registered ${successCount}/${Object.keys(recipes).length} ${skill} recipes in ${environment}`);
        return successCount;
    },

    /**
     * Register recipes using skill from recipe definition
     * @param {object} recipes - Object of {id: recipe} pairs (each recipe must have 'skill' field)
     * @param {string} environment - Environment to register in
     * @returns {number} Number of successful registrations
     */
    registerRecipes(recipes, environment = 'production') {
        let successCount = 0;

        for (const [id, recipe] of Object.entries(recipes)) {
            const skill = recipe.skill;
            if (!skill) {
                console.error(`[RecipeRegistry] Recipe '${id}' missing required 'skill' field`);
                this.stats.registrationErrors++;
                continue;
            }

            if (this.register(skill, id, recipe, environment)) {
                successCount++;
            }
        }

        console.log(`[RecipeRegistry] Registered ${successCount}/${Object.keys(recipes).length} recipes in ${environment}`);
        return successCount;
    },

    // ═══════════════════════════════════════════════════════════════
    // RETRIEVAL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get a recipe by ID (searches all skills in active environments)
     * @param {string} id - Recipe ID
     * @returns {object|null} Recipe definition or null
     */
    get(id) {
        // Search production first
        for (const skill of this.validSkills) {
            if (this.production[skill] && this.production[skill][id]) {
                return this.production[skill][id];
            }
        }

        // Search dev if enabled
        if (this.config.devMode) {
            for (const skill of this.validSkills) {
                if (this.dev[skill] && this.dev[skill][id]) {
                    return this.dev[skill][id];
                }
            }
        }

        // Search test if enabled
        if (this.config.testMode) {
            for (const skill of this.validSkills) {
                if (this.test[skill] && this.test[skill][id]) {
                    return this.test[skill][id];
                }
            }
        }

        console.warn(`[RecipeRegistry] Recipe '${id}' not found in active registries`);
        return null;
    },

    /**
     * Get recipe (alias for get)
     */
    getRecipe(id) {
        return this.get(id);
    },

    /**
     * Check if recipe exists
     * @param {string} id - Recipe ID
     * @returns {boolean}
     */
    has(id) {
        return this.get(id) !== null;
    },

    /**
     * Get all recipes for a specific skill from active environments
     * @param {string} skill - Crafting skill
     * @returns {object} All recipes for that skill
     */
    getRecipesBySkill(skill) {
        if (!this.validSkills.includes(skill)) {
            console.error(`[RecipeRegistry] Invalid skill: ${skill}`);
            return {};
        }

        let merged = { ...(this.production[skill] || {}) };

        if (this.config.devMode && this.dev[skill]) {
            merged = { ...merged, ...this.dev[skill] };
        }

        if (this.config.testMode && this.test[skill]) {
            merged = { ...merged, ...this.test[skill] };
        }

        return merged;
    },

    /**
     * Get recipes by skill (returns Array for backward compatibility)
     * @param {string} skill - Skill type
     * @returns {Array} Recipes for that skill
     */
    getBySkill(skill) {
        return Object.values(this.getRecipesBySkill(skill));
    },

    /**
     * Get available recipes based on skill level only
     * @param {string} skill - Crafting skill
     * @param {object} playerState - Player state object
     * @returns {object} Recipes available to the player
     */
    getAvailableRecipes(skill, playerState) {
        const allRecipes = this.getRecipesBySkill(skill);
        const skillLevel = playerState.skills?.[skill]?.level || 0;

        // Recipes unlock by skill level only, not workstation tier
        return Object.entries(allRecipes)
            .filter(([id, recipe]) => {
                // Check skill level requirement
                if (recipe.skillLevelRequired > skillLevel) {
                    return false;
                }

                // Check if discoverable and not yet discovered
                if (recipe.discoverable && !playerState.discoveredRecipes?.includes(id)) {
                    return false;
                }

                return true;
            })
            .reduce((acc, [id, recipe]) => {
                acc[id] = recipe;
                return acc;
            }, {});
    },

    /**
     * Get all active recipes across all skills
     * @returns {object} All recipes organized by skill
     */
    getAllActive() {
        const result = {};

        for (const skill of this.validSkills) {
            result[skill] = this.getRecipesBySkill(skill);
        }

        return result;
    },

    /**
     * Get all active recipes as a flat object
     * @returns {object} All recipes as {id: recipe} pairs
     */
    getAllAsObject() {
        const result = {};

        for (const skill of this.validSkills) {
            const recipes = this.getRecipesBySkill(skill);
            Object.assign(result, recipes);
        }

        return result;
    },

    /**
     * Get all recipe IDs from active environments
     * @returns {string[]} Array of recipe IDs
     */
    getAllIds() {
        const ids = [];

        for (const skill of this.validSkills) {
            const recipes = this.getRecipesBySkill(skill);
            ids.push(...Object.keys(recipes));
        }

        return ids;
    },

    // ═══════════════════════════════════════════════════════════════
    // ENVIRONMENT CONTROL
    // ═══════════════════════════════════════════════════════════════

    enableDevMode() {
        this.config.devMode = true;
        console.log('[RecipeRegistry] Dev mode enabled');
    },

    disableDevMode() {
        this.config.devMode = false;
        console.log('[RecipeRegistry] Dev mode disabled');
    },

    enableTestMode() {
        this.config.testMode = true;
        console.log('[RecipeRegistry] Test mode enabled');
    },

    disableTestMode() {
        this.config.testMode = false;
        console.log('[RecipeRegistry] Test mode disabled');
    },

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Validate recipe definition against schema
     * @param {string} id - Recipe ID
     * @param {object} recipe - Recipe definition
     * @throws {Error} If validation fails
     */
    _validateRecipe(id, recipe) {
        // Use RecipeSchema if available
        const schema = typeof RecipeSchema !== 'undefined' ? RecipeSchema : null;

        if (schema) {
            // Check required fields
            for (const field of schema.required) {
                if (!(field in recipe)) {
                    this.stats.validationErrors++;
                    throw new Error(`Missing required field '${field}' in recipe '${id}'`);
                }
            }

            // Validate skill
            if (recipe.skill && !schema.validSkills.includes(recipe.skill)) {
                this.stats.validationErrors++;
                throw new Error(`Invalid skill '${recipe.skill}' in recipe '${id}'`);
            }
        }

        // Validate materials array
        if (!Array.isArray(recipe.materials) || recipe.materials.length === 0) {
            this.stats.validationErrors++;
            throw new Error(`Recipe '${id}' must have at least one material`);
        }

        // Validate each material
        for (const material of recipe.materials) {
            if (!material.itemId || !material.quantity) {
                this.stats.validationErrors++;
                throw new Error(`Invalid material in recipe '${id}': missing itemId or quantity`);
            }
        }

        // Validate outputs
        if (!recipe.outputs || !recipe.outputs.itemId) {
            this.stats.validationErrors++;
            throw new Error(`Recipe '${id}' must have outputs.itemId`);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Clear all recipes in specified environment
     * @param {string} environment - Environment to clear
     */
    clear(environment) {
        if (!['production', 'dev', 'test', 'legacy', 'planned'].includes(environment)) {
            console.error(`[RecipeRegistry] Invalid environment: ${environment}`);
            return;
        }

        let count = 0;
        for (const skill of this.validSkills) {
            if (this[environment][skill]) {
                count += Object.keys(this[environment][skill]).length;
                this[environment][skill] = {};
            }
        }

        console.log(`[RecipeRegistry] Cleared ${count} recipes from ${environment}`);
    },

    /**
     * Get registry statistics
     * @returns {object} Statistics object
     */
    getStatistics() {
        const stats = {
            total: this.stats.totalRegistered,
            bySkill: {},
            byEnvironment: {
                production: 0,
                dev: 0,
                test: 0
            },
            errors: this.stats.registrationErrors + this.stats.validationErrors
        };

        for (const skill of this.validSkills) {
            stats.bySkill[skill] = Object.keys(this.getRecipesBySkill(skill)).length;

            // Count by environment
            if (this.production[skill]) {
                stats.byEnvironment.production += Object.keys(this.production[skill]).length;
            }
            if (this.dev[skill]) {
                stats.byEnvironment.dev += Object.keys(this.dev[skill]).length;
            }
            if (this.test[skill]) {
                stats.byEnvironment.test += Object.keys(this.test[skill]).length;
            }
        }

        return stats;
    },

    /**
     * Print registry summary to console
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log('\n=== RECIPE REGISTRY SUMMARY ===');
        console.log(`Total Registered: ${stats.total}`);
        console.log('By Skill:');
        for (const [skill, count] of Object.entries(stats.bySkill)) {
            console.log(`  ${skill}: ${count}`);
        }
        console.log('By Environment:');
        console.log(`  Production: ${stats.byEnvironment.production}`);
        console.log(`  Dev: ${stats.byEnvironment.dev}`);
        console.log(`  Test: ${stats.byEnvironment.test}`);
        console.log(`Errors: ${stats.errors}`);
        console.log('================================\n');
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.RecipeRegistry = RecipeRegistry;
}
