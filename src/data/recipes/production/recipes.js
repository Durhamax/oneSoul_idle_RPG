/**
 * Game Recipes
 *
 * All crafting recipes organized by skill.
 * This file will be generated from Excel pipeline in the future.
 *
 * Recipe Structure:
 * - id: Unique recipe identifier
 * - name: Display name
 * - skill: Crafting skill required (cooking, smithing, mechanics, etc.)
 * - tier: Recipe tier (affects unlock requirements)
 * - skillLevelRequired: Minimum skill level to craft
 * - materials: Array of {itemId, quantity} inputs
 * - outputs: {itemId, quantity} or array for multiple outputs
 * - baseTime: Craft time in milliseconds
 * - experienceGain: XP granted on completion (using existing field name)
 */

const RECIPES = {
    // ==========================================
    // COOKING RECIPES
    // ==========================================
    solfishBake: {
        id: 'solfishBake',
        name: 'Solfish Bake',
        skill: 'cooking',
        tier: 1,
        skillLevelRequired: 1,
        category: 'food',
        icon: '🐟',
        description: 'A simple but nourishing baked fish dish seasoned with minty herbs.',

        materials: [
            { itemId: 'solfish', quantity: 1 },
            { itemId: 'mintyHerb', quantity: 1 }
        ],

        outputs: {
            itemId: 'solfishBake',
            quantity: 1
        },

        baseTime: 5000,      // 5 seconds
        experienceGain: 15,

        // Workstation requirements (optional)
        stationType: 'cooking',
        stationTierRequired: 0,  // Can craft without station

        tags: ['food', 'cooking', 'tier1', 'tutorial']
    },

    // ==========================================
    // MECHANICS RECIPES
    // ==========================================
    greensmanTrainingBow: {
        id: 'greensmanTrainingBow',
        name: 'Greensman Training Bow',
        skill: 'mechanics',
        tier: 1,
        skillLevelRequired: 1,
        category: 'weapons',
        icon: '🏹',
        description: 'A flexible bow crafted from riverwillow, suitable for beginners learning to hunt.',

        materials: [
            { itemId: 'riverwillow', quantity: 2 },
            { itemId: 'plantFibers', quantity: 3 },
            { itemId: 'smallPelts', quantity: 1 }
        ],

        outputs: {
            itemId: 'greensmanTrainingBow',
            quantity: 1
        },

        baseTime: 15000,     // 15 seconds
        experienceGain: 35,

        stationType: 'mechanics',
        stationTierRequired: 0,

        tags: ['weapon', 'bow', 'mechanics', 'tier1', 'tutorial']
    },

    flintheadArrows: {
        id: 'flintheadArrows',
        name: 'Flinthead Arrows',
        skill: 'mechanics',
        tier: 1,
        skillLevelRequired: 1,
        category: 'ammo',
        icon: '🏹',
        description: 'Basic arrows tipped with sharp flint. Effective against light armor.',

        materials: [
            { itemId: 'flint', quantity: 1 },
            { itemId: 'pinewood', quantity: 2 },
            { itemId: 'feathers', quantity: 2 }
        ],

        outputs: {
            itemId: 'flintheadArrows',
            quantity: 10       // Crafts a stack of 10 arrows
        },

        baseTime: 8000,      // 8 seconds
        experienceGain: 20,

        stationType: 'mechanics',
        stationTierRequired: 0,

        tags: ['ammo', 'arrows', 'mechanics', 'tier1', 'tutorial']
    }
};

// Register all recipes
if (typeof RecipeRegistry !== 'undefined') {
    // Use registerRecipes which handles skill from each recipe definition
    RecipeRegistry.registerRecipes(RECIPES, 'production');
    console.log(`📜 Recipes registered: ${Object.keys(RECIPES).length}`);
} else {
    console.error('❌ RecipeRegistry not found - cannot register recipes');
}

// Export for reference
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RECIPES };
}
