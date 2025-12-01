/**
 * SMITHING RECIPES
 *
 * Material processing only - NOT weapon crafting.
 * Ore -> Ingots, Ingots -> Sheets/Plates/Wire
 */

const SmithingRecipes = {
    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Basic Processing (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    copper_ingot: {
        id: 'copper_ingot',
        name: 'Copper Ingot',
        skill: 'smithing',
        skillLevelRequired: 1,
        tier: 1,
        category: 'ingots',
        icon: '🔶',
        description: 'Smelt copper ore into a refined ingot.',
        materials: [
            { itemId: 'copper_ore', quantity: 3 }
        ],
        outputs: {
            itemId: 'copper_ingot',
            quantity: 1
        },
        baseTime: 5000,
        experienceGain: 15
    },

    copper_wire: {
        id: 'copper_wire',
        name: 'Copper Wire',
        skill: 'smithing',
        skillLevelRequired: 3,
        tier: 1,
        category: 'components',
        icon: '〰️',
        description: 'Draw copper into thin wire for electronics.',
        materials: [
            { itemId: 'copper_ingot', quantity: 1 }
        ],
        outputs: {
            itemId: 'copper_wire',
            quantity: 5
        },
        baseTime: 3000,
        experienceGain: 10
    },

    iron_ingot: {
        id: 'iron_ingot',
        name: 'Iron Ingot',
        skill: 'smithing',
        skillLevelRequired: 5,
        tier: 1,
        category: 'ingots',
        icon: '⬛',
        description: 'Smelt iron ore into a sturdy ingot.',
        materials: [
            { itemId: 'iron_ore', quantity: 4 }
        ],
        outputs: {
            itemId: 'iron_ingot',
            quantity: 1
        },
        baseTime: 8000,
        experienceGain: 25
    },

    iron_plate: {
        id: 'iron_plate',
        name: 'Iron Plate',
        skill: 'smithing',
        skillLevelRequired: 8,
        tier: 1,
        category: 'plates',
        icon: '🔲',
        description: 'Hammer iron into a flat plate for armor.',
        materials: [
            { itemId: 'iron_ingot', quantity: 2 }
        ],
        outputs: {
            itemId: 'iron_plate',
            quantity: 1
        },
        baseTime: 6000,
        experienceGain: 20
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 2: Alloys (Levels 11-25)
    // ═══════════════════════════════════════════════════════════════

    steel_ingot: {
        id: 'steel_ingot',
        name: 'Steel Ingot',
        skill: 'smithing',
        skillLevelRequired: 12,
        tier: 2,
        category: 'ingots',
        icon: '🔷',
        description: 'Combine iron with carbon to create strong steel.',
        materials: [
            { itemId: 'iron_ingot', quantity: 2 },
            { itemId: 'coal', quantity: 1 }
        ],
        outputs: {
            itemId: 'steel_ingot',
            quantity: 1
        },
        baseTime: 12000,
        experienceGain: 40
    },

    steel_plate: {
        id: 'steel_plate',
        name: 'Steel Plate',
        skill: 'smithing',
        skillLevelRequired: 15,
        tier: 2,
        category: 'plates',
        icon: '🛡️',
        description: 'Forge steel into heavy armor plating.',
        materials: [
            { itemId: 'steel_ingot', quantity: 2 }
        ],
        outputs: {
            itemId: 'steel_plate',
            quantity: 1
        },
        baseTime: 10000,
        experienceGain: 35
    },

    steel_wire: {
        id: 'steel_wire',
        name: 'Steel Wire',
        skill: 'smithing',
        skillLevelRequired: 18,
        tier: 2,
        category: 'components',
        icon: '➰',
        description: 'Draw steel into durable wire.',
        materials: [
            { itemId: 'steel_ingot', quantity: 1 }
        ],
        outputs: {
            itemId: 'steel_wire',
            quantity: 3
        },
        baseTime: 7000,
        experienceGain: 25
    },

    reinforced_frame: {
        id: 'reinforced_frame',
        name: 'Reinforced Frame',
        skill: 'smithing',
        skillLevelRequired: 22,
        tier: 2,
        category: 'components',
        icon: '🔩',
        description: 'A sturdy frame for weapon and armor construction.',
        materials: [
            { itemId: 'steel_ingot', quantity: 3 },
            { itemId: 'iron_plate', quantity: 2 }
        ],
        outputs: {
            itemId: 'reinforced_frame',
            quantity: 1
        },
        baseTime: 15000,
        experienceGain: 50
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 3: Advanced Alloys (Levels 26-50)
    // ═══════════════════════════════════════════════════════════════

    titanium_ingot: {
        id: 'titanium_ingot',
        name: 'Titanium Ingot',
        skill: 'smithing',
        skillLevelRequired: 30,
        tier: 3,
        category: 'ingots',
        icon: '💎',
        description: 'Refine titanium ore into a lightweight, strong ingot.',
        materials: [
            { itemId: 'titanium_ore', quantity: 5 }
        ],
        outputs: {
            itemId: 'titanium_ingot',
            quantity: 1
        },
        baseTime: 20000,
        experienceGain: 75
    },

    titanium_plate: {
        id: 'titanium_plate',
        name: 'Titanium Plate',
        skill: 'smithing',
        skillLevelRequired: 35,
        tier: 3,
        category: 'plates',
        icon: '🛡️',
        description: 'Form titanium into lightweight armor plating.',
        materials: [
            { itemId: 'titanium_ingot', quantity: 2 }
        ],
        outputs: {
            itemId: 'titanium_plate',
            quantity: 1
        },
        baseTime: 18000,
        experienceGain: 60
    },

    composite_alloy: {
        id: 'composite_alloy',
        name: 'Composite Alloy',
        skill: 'smithing',
        skillLevelRequired: 45,
        tier: 3,
        category: 'ingots',
        icon: '🔮',
        description: 'A high-tech alloy combining multiple metals.',
        materials: [
            { itemId: 'titanium_ingot', quantity: 1 },
            { itemId: 'steel_ingot', quantity: 2 },
            { itemId: 'carbon_fiber', quantity: 1 }
        ],
        outputs: {
            itemId: 'composite_alloy',
            quantity: 1
        },
        baseTime: 30000,
        experienceGain: 100
    }
};

// Register recipes with RecipeRegistry
if (typeof RecipeRegistry !== 'undefined') {
    RecipeRegistry.registerBatch('smithing', SmithingRecipes, 'production');
    console.log('[SmithingRecipes] Registered smithing recipes');
} else {
    console.warn('[SmithingRecipes] RecipeRegistry not available');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmithingRecipes;
}
