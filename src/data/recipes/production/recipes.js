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
    },

    // ==========================================
    // TAILORING RECIPES — R1 skilling pieces
    // Individual gathering-aid garments (see equipment.js SKILLING PIECES).
    // ==========================================
    anglersVest: {
        id: 'anglersVest',
        name: "Angler's Vest",
        skill: 'tailoring',
        tier: 1,
        skillLevelRequired: 1,
        category: 'armor',
        icon: '🦺',
        description: 'A fisher\'s tackle vest sewn from plant fibre and a scrap of pelt. Boosts Fishing XP while worn.',

        materials: [
            { itemId: 'plantFibers', quantity: 6 },
            { itemId: 'smallPelts', quantity: 1 }
        ],

        outputs: {
            itemId: 'anglersVest',
            quantity: 1
        },

        baseTime: 12000,
        experienceGain: 40,

        stationType: 'tailoring',
        stationTierRequired: 0,

        tags: ['armor', 'skilling', 'fishing', 'tailoring', 'tier1']
    },

    anglersWaders: {
        id: 'anglersWaders',
        name: "Angler's Waders",
        skill: 'tailoring',
        tier: 1,
        skillLevelRequired: 2,
        category: 'armor',
        icon: '👖',
        description: 'Waxed leg waders sealed with resin. Gives a small chance at an extra catch while Fishing.',

        materials: [
            { itemId: 'smallPelts', quantity: 2 },
            { itemId: 'plantFibers', quantity: 3 },
            { itemId: 'resin', quantity: 2 }
        ],

        outputs: {
            itemId: 'anglersWaders',
            quantity: 1
        },

        baseTime: 14000,
        experienceGain: 48,

        stationType: 'tailoring',
        stationTierRequired: 0,

        tags: ['armor', 'skilling', 'fishing', 'tailoring', 'tier1']
    },

    foragersHood: {
        id: 'foragersHood',
        name: "Forager's Hood",
        skill: 'tailoring',
        tier: 1,
        skillLevelRequired: 1,
        category: 'armor',
        icon: '🧢',
        description: 'A broad cloth hood for long days in the brush. Boosts Foraging XP while worn.',

        materials: [
            { itemId: 'plantFibers', quantity: 4 },
            { itemId: 'smallPelts', quantity: 1 }
        ],

        outputs: {
            itemId: 'foragersHood',
            quantity: 1
        },

        baseTime: 10000,
        experienceGain: 34,

        stationType: 'tailoring',
        stationTierRequired: 0,

        tags: ['armor', 'skilling', 'foraging', 'tailoring', 'tier1']
    },

    trappersGloves: {
        id: 'trappersGloves',
        name: "Trapper's Gloves",
        skill: 'tailoring',
        tier: 1,
        skillLevelRequired: 2,
        category: 'armor',
        icon: '🧤',
        description: 'Supple leather gloves for working snares. Gives a small chance at an extra drop while Hunting.',

        materials: [
            { itemId: 'smallPelts', quantity: 2 },
            { itemId: 'plantFibers', quantity: 2 }
        ],

        outputs: {
            itemId: 'trappersGloves',
            quantity: 1
        },

        baseTime: 11000,
        experienceGain: 40,

        stationType: 'tailoring',
        stationTierRequired: 0,

        tags: ['armor', 'skilling', 'hunting', 'tailoring', 'tier1']
    },

    // ==========================================
    // TIER 2 — SCOUTREACH: thieving bootstrap + arms chain
    // ==========================================

    // Lets the player build their first lockpick to begin Thieving.
    craftLockpick: {
        id: 'craftLockpick',
        name: 'Lockpick',
        skill: 'mechanics',
        tier: 2,
        skillLevelRequired: 1,
        category: 'tool',
        icon: '🔓',
        description: 'A set of improvised picks bent from copperite and flint — enough to open an Elaran supply cache and begin thieving.',
        materials: [
            { itemId: 'copperiteOre', quantity: 2 },
            { itemId: 'flint', quantity: 1 },
            { itemId: 'pinewood', quantity: 1 }
        ],
        outputs: { itemId: 'lockpick', quantity: 1 },
        baseTime: 8000,
        experienceGain: 20,
        stationType: 'mechanics',
        stationTierRequired: 0,
        tags: ['tool', 'thieving', 'mechanics', 'tier2']
    },

    // Charcoal kiln — the third propellant ingredient.
    craftCharcoal: {
        id: 'craftCharcoal',
        name: 'Charcoal',
        skill: 'smithing',
        tier: 2,
        skillLevelRequired: 1,
        category: 'material',
        icon: '⚫',
        description: 'Pinewood charred slow in a sealed kiln into clean-burning charcoal.',
        materials: [
            { itemId: 'pinewood', quantity: 2 }
        ],
        outputs: { itemId: 'charcoal', quantity: 2 },
        baseTime: 6000,
        experienceGain: 14,
        stationType: 'smithing',
        stationTierRequired: 0,
        tags: ['material', 'fuel', 'propellant', 'smithing', 'tier2']
    },

    // Chemistry makes the propellant — niter + sulfur + charcoal.
    craftGunPropellant: {
        id: 'craftGunPropellant',
        name: 'Gun Propellant',
        skill: 'chemistry',
        tier: 2,
        skillLevelRequired: 1,
        category: 'material',
        icon: '💥',
        description: 'Mill bog niter, sulfur and charcoal into corned small-arms powder — the charge behind every round.',
        materials: [
            { itemId: 'bogNiter', quantity: 2 },
            { itemId: 'bogSulfur', quantity: 1 },
            { itemId: 'charcoal', quantity: 1 }
        ],
        outputs: { itemId: 'gunPropellant', quantity: 2 },
        baseTime: 9000,
        experienceGain: 26,
        stationType: 'chemistry',
        stationTierRequired: 0,
        tags: ['material', 'propellant', 'chemistry', 'tier2']
    },

    // Smith brass casings for the 6mm standard.
    craftSixMmCasing: {
        id: 'craftSixMmCasing',
        name: '6mm Casing',
        skill: 'smithing',
        tier: 2,
        skillLevelRequired: 1,
        category: 'material',
        icon: '🔶',
        description: 'Draw copperite into brass cases sized to the 6mm standard.',
        materials: [
            { itemId: 'copperiteOre', quantity: 1 }
        ],
        outputs: { itemId: 'sixMmCasing', quantity: 5 },
        baseTime: 6000,
        experienceGain: 16,
        stationType: 'smithing',
        stationTierRequired: 0,
        tags: ['material', 'ammo', 'casing', 'smithing', 'tier2']
    },

    // RE-GATED: learned by reverse-engineering Spent 6mm Rounds.
    craft6mmRounds: {
        id: 'craft6mmRounds',
        name: '6mm Rounds',
        skill: 'mechanics',
        tier: 2,
        skillLevelRequired: 1,
        category: 'ammo',
        icon: '🔶',
        description: 'Prime a casing, charge it with propellant, seat a copperite slug. Loads a stack of 6mm rounds.',
        discoverable: true,       // hidden until reverse-engineered
        materials: [
            { itemId: 'sixMmCasing', quantity: 5 },
            { itemId: 'gunPropellant', quantity: 1 },
            { itemId: 'copperiteOre', quantity: 1 }
        ],
        outputs: { itemId: 'sixMmRounds', quantity: 10 },
        baseTime: 8000,
        experienceGain: 24,
        stationType: 'mechanics',
        stationTierRequired: 0,
        tags: ['ammo', '6mm', 'munitions', 'mechanics', 'tier2']
    },

    // RE-GATED: learned by reverse-engineering a Salvaged Elaran Sidearm.
    craft6mmDefender: {
        id: 'craft6mmDefender',
        name: '6mm Defender',
        skill: 'mechanics',
        tier: 2,
        skillLevelRequired: 2,
        category: 'weapons',
        icon: '🔫',
        description: 'Assemble a working 6mm sidearm from a pinewood frame, salvaged wiring and drone parts — your first self-built firearm.',
        discoverable: true,
        materials: [
            { itemId: 'pinewood', quantity: 2 },
            { itemId: 'droneParts', quantity: 2 },
            { itemId: 'salvagedWiring', quantity: 1 },
            { itemId: 'scrapAlloy', quantity: 1 }
        ],
        outputs: { itemId: 'sixMmDefender', quantity: 1 },
        baseTime: 16000,
        experienceGain: 45,
        stationType: 'mechanics',
        stationTierRequired: 0,
        tags: ['weapon', 'pistol', 'firearm', '6mm', 'mechanics', 'tier2']
    },

    // RE-GATED: learned by reverse-engineering Battered Elaran Plate. HEAVY lane.
    craftElaranPlate: {
        id: 'craftElaranPlate',
        name: 'Salvaged Plate Carrier',
        skill: 'tailoring',
        tier: 2,
        skillLevelRequired: 2,
        category: 'armor',
        icon: '🦺',
        description: 'Re-set scrap Elaran alloy into plates and bind them over a cloth carrier — the heavy-armor starting point.',
        discoverable: true,
        materials: [
            { itemId: 'scrapAlloy', quantity: 3 },
            { itemId: 'plantFibers', quantity: 2 }
        ],
        outputs: { itemId: 'elaranPlateChest', quantity: 1 },
        baseTime: 15000,
        experienceGain: 48,
        stationType: 'tailoring',
        stationTierRequired: 0,
        tags: ['armor', 'chest', 'plated', 'heavy', 'tailoring', 'tier2']
    },

    // LIGHT lane — ranging furs (no RE needed).
    craftRangerHood: {
        id: 'craftRangerHood',
        name: 'Ranger Hood',
        skill: 'tailoring',
        tier: 2,
        skillLevelRequired: 1,
        category: 'armor',
        icon: '🧢',
        description: 'Cut a hooded cowl from thick ranger pelt — light, quiet all-terrain headgear.',
        materials: [
            { itemId: 'rangerPelt', quantity: 1 },
            { itemId: 'plantFibers', quantity: 2 }
        ],
        outputs: { itemId: 'rangerHood', quantity: 1 },
        baseTime: 11000,
        experienceGain: 36,
        stationType: 'tailoring',
        stationTierRequired: 0,
        tags: ['armor', 'head', 'light', 'ranging', 'tailoring', 'tier2']
    },

    craftRangerCoat: {
        id: 'craftRangerCoat',
        name: 'Ranger Coat',
        skill: 'tailoring',
        tier: 2,
        skillLevelRequired: 2,
        category: 'armor',
        icon: '🧥',
        description: 'Layer ranger pelt and fibre into a supple all-terrain coat for the mobility lane.',
        materials: [
            { itemId: 'rangerPelt', quantity: 2 },
            { itemId: 'plantFibers', quantity: 3 }
        ],
        outputs: { itemId: 'rangerCoat', quantity: 1 },
        baseTime: 13000,
        experienceGain: 44,
        stationType: 'tailoring',
        stationTierRequired: 0,
        tags: ['armor', 'chest', 'light', 'ranging', 'tailoring', 'tier2']
    },

    // ==========================================
    // TIER 2 — WEST COAST cooking
    // ==========================================
    shellfishBoil: {
        id: 'shellfishBoil',
        name: 'Coastal Shellfish Boil',
        skill: 'cooking',
        tier: 2,
        skillLevelRequired: 2,
        category: 'food',
        icon: '🍲',
        description: 'Moss shrimp, clams and auroran tuber boiled in salted water — the multi-region coastal boil, finally within reach.',
        materials: [
            { itemId: 'mossShrimp', quantity: 1 },
            { itemId: 'auroranTuber', quantity: 1 },
            { itemId: 'shellfish', quantity: 2 },
            { itemId: 'clay', quantity: 1 }
        ],
        outputs: { itemId: 'shellfishBoil', quantity: 1 },
        baseTime: 10000,
        experienceGain: 40,
        stationType: 'cooking',
        stationTierRequired: 0,
        tags: ['food', 'cooking', 'coast', 'tier2']
    },

    saltCuredRations: {
        id: 'saltCuredRations',
        name: 'Salt-Cured Rations',
        skill: 'cooking',
        tier: 2,
        skillLevelRequired: 1,
        category: 'food',
        icon: '🥓',
        description: 'Game meat cured with sea salt into keepable field rations.',
        materials: [
            { itemId: 'smallGameMeat', quantity: 1 },
            { itemId: 'seaSalt', quantity: 1 }
        ],
        outputs: { itemId: 'saltCuredRations', quantity: 2 },
        baseTime: 7000,
        experienceGain: 22,
        stationType: 'cooking',
        stationTierRequired: 0,
        tags: ['food', 'cooking', 'coast', 'tier2']
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
