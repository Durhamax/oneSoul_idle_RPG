/**
 * UNIFIED SKILLS DATABASE
 *
 * Central skill registry combining all skill categories.
 * This is the single source of truth for all skills in the game.
 *
 * Mirrors the pattern used by items/index.js
 */

console.log('📦 Skills index.js loading...');
console.log('   productionSkills available?', typeof productionSkills !== 'undefined');
console.log('   SkillRegistry available?', typeof SkillRegistry !== 'undefined');

// Import production skills from organized directories
// In browser mode, these are already loaded as globals
const _PRODUCTION_SKILLS = (typeof productionSkills !== 'undefined' ? productionSkills : {});

console.log('   _PRODUCTION_SKILLS count:', Object.keys(_PRODUCTION_SKILLS).length);

// Register skills to their respective registries (synchronously, no DOMContentLoaded)
if (typeof SkillRegistry !== 'undefined') {
    console.log('   SkillRegistry.production before:', Object.keys(SkillRegistry.production).length);
    SkillRegistry.registerBatch(_PRODUCTION_SKILLS, 'production');
    console.log('   SkillRegistry.production after:', Object.keys(SkillRegistry.production).length);
    console.log(`✅ Registered ${Object.keys(_PRODUCTION_SKILLS).length} production skills`);
} else {
    console.error('❌ SkillRegistry not available!');
}

/**
 * Unified Skills Database
 * Contains all active skills based on SkillRegistry configuration
 */
const SKILLS_DB = (typeof SkillRegistry !== 'undefined') ? SkillRegistry.getAllActive() : {};

/**
 * Skill Utilities
 * Helper functions for working with skills
 */
const SkillUtils = {
    /**
     * Get all skills as an array
     * @returns {Array} Array of all skills
     */
    getAllSkills() {
        return Object.values(SKILLS_DB);
    },

    /**
     * Get all skill IDs
     * @returns {Array} Array of all skill IDs
     */
    getAllSkillIds() {
        return Object.keys(SKILLS_DB);
    },

    /**
     * Get skill by ID
     * @param {string} skillId - Skill ID to look up
     * @returns {Object|null} Skill object or null if not found
     */
    getSkill(skillId) {
        return SkillRegistry ? SkillRegistry.get(skillId) : (SKILLS_DB[skillId] || null);
    },

    /**
     * Check if skill exists
     * @param {string} skillId - Skill ID to check
     * @returns {boolean} True if skill exists
     */
    hasSkill(skillId) {
        return SkillRegistry ? SkillRegistry.has(skillId) : (skillId in SKILLS_DB);
    },

    /**
     * Get skills by category
     * @param {string} category - Category to filter by (priority, gathering, crafting, vertical)
     * @returns {Array} Array of skills in category
     */
    getSkillsByCategory(category) {
        return Object.values(SKILLS_DB).filter(skill => skill.category === category);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SKILLS_DB, SkillUtils };
}
