/**
 * COOKING RECIPES
 *
 * Food buffs, healing items, and biological materials.
 * Variable quantity outputs based on workstation tier.
 */

const CookingRecipes = {
    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Basic Food (Levels 1-5)
    // ═══════════════════════════════════════════════════════════════

    solfishBake: {
        id: 'solfishBake',
        name: 'Solfish Bake',
        skill: 'cooking',
        skillLevelRequired: 1,
        tier: 1,
        category: 'food',
        icon: '🐟',
        description: 'A simple baked fish seasoned with minty herbs. Restores health in combat.',
        materials: [
            { itemId: 'solfish', quantity: 1 },
            { itemId: 'mintyHerb', quantity: 1 }
        ],
        outputs: {
            itemId: 'solfishBake',
            baseQuantity: 2
        },
        baseTime: 4000,
        experienceGain: 15
    },

    smallGameStew: {
        id: 'smallGameStew',
        name: 'Small Game Stew',
        skill: 'cooking',
        skillLevelRequired: 1,
        tier: 1,
        category: 'food',
        icon: '🍲',
        description: 'A hearty stew made from small game and mushrooms. Boosts gathering efficiency.',
        materials: [
            { itemId: 'smallGameMeat', quantity: 1 },
            { itemId: 'sweetcap_mushroom', quantity: 1 }
        ],
        outputs: {
            itemId: 'smallGameStew',
            baseQuantity: 2
        },
        baseTime: 5000,
        experienceGain: 18
    },

    fishoil: {
        id: 'fishoil',
        name: 'Fish Oil',
        skill: 'cooking',
        skillLevelRequired: 1,
        tier: 1,
        category: 'resource',
        icon: '🧴',
        description: 'Oil extracted from minnows. Used in alchemy and cooking.',
        materials: [
            { itemId: 'minnow', quantity: 3 }
        ],
        outputs: {
            itemId: 'fishoil',
            baseQuantity: 1
        },
        baseTime: 3000,
        experienceGain: 12
    }
};

// Register recipes with RecipeRegistry
if (typeof RecipeRegistry !== 'undefined') {
    RecipeRegistry.registerBatch('cooking', CookingRecipes, 'production');
    console.log('[CookingRecipes] Registered cooking recipes');
} else {
    console.warn('[CookingRecipes] RecipeRegistry not available');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookingRecipes;
}
