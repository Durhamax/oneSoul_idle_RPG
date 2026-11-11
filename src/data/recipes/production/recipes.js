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

    smallGameStew: {
        id: 'smallGameStew',
        name: 'Small Game Stew',
        skill: 'cooking',
        tier: 1,
        skillLevelRequired: 1,
        category: 'food',
        icon: '🍲',
        description: 'A hearty stew of small game meat and common mushrooms. Restores health and briefly steadies the hands.',

        materials: [
            { itemId: 'smallGameMeat', quantity: 1 },
            { itemId: 'commonMushrooms', quantity: 1 },
            { itemId: 'clay', quantity: 1 }        // fired into a simple bowl to cook/serve
        ],

        outputs: {
            itemId: 'smallGameStew',
            quantity: 1
        },

        baseTime: 6000,      // 6 seconds
        experienceGain: 18,

        stationType: 'cooking',
        stationTierRequired: 0,

        tags: ['food', 'cooking', 'tier1']
    },

    // ==========================================
    // CHEMISTRY RECIPES
    // ==========================================
    mintyTincture: {
        id: 'mintyTincture',
        name: 'Minty Tincture',
        skill: 'chemistry',
        tier: 1,
        skillLevelRequired: 1,
        category: 'consumable',
        icon: '🧪',
        description: 'Minty herb steeped and bound with resin into a bracing, focus-sharpening tincture.',

        materials: [
            { itemId: 'mintyHerb', quantity: 2 },
            { itemId: 'resin', quantity: 1 },
            { itemId: 'clay', quantity: 1 }        // clay vial to hold the tincture
        ],

        outputs: {
            itemId: 'mintyTincture',
            quantity: 1
        },

        baseTime: 8000,      // 8 seconds
        experienceGain: 22,

        stationType: 'chemistry',
        stationTierRequired: 0,

        tags: ['consumable', 'serum', 'chemistry', 'tier1']
    },

    daypetalSalve: {
        id: 'daypetalSalve',
        name: 'Daypetal Salve',
        skill: 'chemistry',
        tier: 1,
        skillLevelRequired: 1,
        category: 'consumable',
        icon: '🌼',
        description: 'Daypetal blooms rendered over a meadow-greens base into a restorative salve that keeps you patched up in a fight.',

        materials: [
            { itemId: 'daypetalBloom', quantity: 1 },
            { itemId: 'meadowGreens', quantity: 1 },   // leafy base for the salve
            { itemId: 'clay', quantity: 1 }            // clay pot to render the salve
        ],

        outputs: {
            itemId: 'daypetalSalve',
            quantity: 1
        },

        baseTime: 9000,      // 9 seconds
        experienceGain: 26,

        stationType: 'chemistry',
        stationTierRequired: 0,

        tags: ['consumable', 'serum', 'chemistry', 'tier1']
    },

    // ==========================================
    // SMITHING RECIPES
    // ==========================================
    copperWire: {
        id: 'copperWire',
        name: 'Copper Wire',
        skill: 'smithing',
        tier: 1,
        skillLevelRequired: 1,
        category: 'material',
        icon: '🔌',
        description: 'Copperite ore smelted down and drawn into fine conductive wire — feedstock for electronics.',

        materials: [
            { itemId: 'copperiteOre', quantity: 2 }
        ],

        outputs: {
            itemId: 'copperWire',
            quantity: 2
        },

        baseTime: 7000,      // 7 seconds
        experienceGain: 20,

        stationType: 'smithing',
        stationTierRequired: 0,

        tags: ['component', 'refined', 'smithing', 'tier1']
    },

    // ==========================================
    // ELECTRONICS RECIPES
    // ==========================================
    fieldScanner: {
        id: 'fieldScanner',
        name: 'Scrap Field Scanner',
        skill: 'electronics',
        tier: 1,
        skillLevelRequired: 1,
        category: 'equipment',
        icon: '📡',
        description: 'Wire a salvaged survey-drone sensor into a copper harness — your first working technology.',

        materials: [
            { itemId: 'copperWire', quantity: 2 },
            { itemId: 'salvagedSensor', quantity: 1 }
        ],

        outputs: {
            itemId: 'fieldScanner',
            quantity: 1
        },

        baseTime: 12000,     // 12 seconds
        experienceGain: 40,

        stationType: 'electronics',
        stationTierRequired: 0,

        tags: ['technology', 'tech', 'electronics', 'tier1']
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
