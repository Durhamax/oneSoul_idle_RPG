/**
 * RECIPE SCHEMA
 *
 * Defines all required and optional fields for recipe definitions.
 * Recipes are skill-level gated (NOT workstation gated).
 */

const RecipeSchema = {
    required: [
        // ═══ IDENTITY ═══
        'id',                 // Unique identifier
        'name',               // Display name
        'skill',              // smithing, mechanics, electronics, tailoring, chemistry, cooking

        // ═══ REQUIREMENTS ═══
        'skillLevelRequired', // Skill level needed to unlock recipe

        // ═══ MATERIALS ═══
        'materials',          // Array of { itemId, quantity } objects

        // ═══ OUTPUTS ═══
        'outputs',            // { itemId, quantity?, baseQuantity?, rarityWeights? }

        // ═══ CRAFTING ═══
        'baseTime',           // Milliseconds to craft
        'experienceGain'      // XP granted on completion
    ],

    optional: [
        // Advanced requirements
        'engineeringLevel',   // Optional engineering level requirement

        // Output modifiers
        'perfectChance',      // Chance for perfect craft (0.0-1.0)

        // Metadata
        'description',        // Flavor text
        'icon',               // Emoji or icon reference
        'tier',               // Recipe tier (1-10) for UI organization
        'category',           // Sub-category within skill (e.g., 'ingots', 'plates')
        'discoverable'        // If true, must be found as loot (not auto-unlocked)
    ],

    // Valid crafting skills
    validSkills: ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'],

    // Recipe output types
    outputTypes: {
        equipment: ['rarityWeights', 'quantity'],    // Fixed quantity, variable rarity
        consumable: ['baseQuantity']                  // Variable quantity based on multipliers
    },

    // Rarity tiers for equipment crafting
    validRarities: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'transcendent', 'creator'],

    // Constraints
    constraints: {
        skillLevelRequired: { min: 1, max: 100 },
        engineeringLevel: { min: 0, max: 100 },
        baseTime: { min: 1000 },              // Minimum 1 second
        experienceGain: { min: 1 },
        quantity: { min: 1, max: 100 },
        baseQuantity: { min: 1, max: 1000 }
    }
};

// Export for use in validator and registry
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeSchema;
}
