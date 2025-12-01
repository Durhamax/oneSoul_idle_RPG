/**
 * MECHANICS RECIPES
 *
 * ALL weapon manufacturing and precision components.
 * Firearms, machined blades, precision parts.
 */

const MechanicsRecipes = {
    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Basic Weapons (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    combat_knife: {
        id: 'combat_knife',
        name: 'Combat Knife',
        skill: 'mechanics',
        skillLevelRequired: 1,
        tier: 1,
        category: 'weapons',
        icon: '🔪',
        description: 'A basic melee weapon for close combat.',
        materials: [
            { itemId: 'iron_ingot', quantity: 2 },
            { itemId: 'wood_plank', quantity: 1 }
        ],
        outputs: {
            itemId: 'combat_knife',
            quantity: 1,
            rarityWeights: {
                common: 70,
                uncommon: 20,
                rare: 8,
                epic: 2
            }
        },
        baseTime: 10000,
        experienceGain: 30
    },

    basic_pistol: {
        id: 'basic_pistol',
        name: 'Basic Pistol',
        skill: 'mechanics',
        skillLevelRequired: 5,
        tier: 1,
        category: 'weapons',
        icon: '🔫',
        description: 'A simple but reliable sidearm.',
        materials: [
            { itemId: 'iron_ingot', quantity: 3 },
            { itemId: 'copper_wire', quantity: 2 },
            { itemId: 'wood_plank', quantity: 1 }
        ],
        outputs: {
            itemId: 'basic_pistol',
            quantity: 1,
            rarityWeights: {
                common: 65,
                uncommon: 25,
                rare: 8,
                epic: 2
            }
        },
        baseTime: 15000,
        experienceGain: 45
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Precision Parts (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    gear_mechanism: {
        id: 'gear_mechanism',
        name: 'Gear Mechanism',
        skill: 'mechanics',
        skillLevelRequired: 3,
        tier: 1,
        category: 'components',
        icon: '⚙️',
        description: 'Precision gears for mechanical devices.',
        materials: [
            { itemId: 'iron_ingot', quantity: 2 }
        ],
        outputs: {
            itemId: 'gear_mechanism',
            quantity: 2
        },
        baseTime: 6000,
        experienceGain: 20
    },

    spring_assembly: {
        id: 'spring_assembly',
        name: 'Spring Assembly',
        skill: 'mechanics',
        skillLevelRequired: 6,
        tier: 1,
        category: 'components',
        icon: '🌀',
        description: 'Tension springs for weapons and mechanisms.',
        materials: [
            { itemId: 'steel_wire', quantity: 3 }
        ],
        outputs: {
            itemId: 'spring_assembly',
            quantity: 2
        },
        baseTime: 5000,
        experienceGain: 18
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 2: Standard Weapons (Levels 11-25)
    // ═══════════════════════════════════════════════════════════════

    assault_rifle: {
        id: 'assault_rifle',
        name: 'Assault Rifle',
        skill: 'mechanics',
        skillLevelRequired: 15,
        tier: 2,
        category: 'weapons',
        icon: '🔫',
        description: 'A versatile automatic rifle.',
        materials: [
            { itemId: 'steel_ingot', quantity: 4 },
            { itemId: 'gear_mechanism', quantity: 2 },
            { itemId: 'spring_assembly', quantity: 1 },
            { itemId: 'composite_grip', quantity: 1 }
        ],
        outputs: {
            itemId: 'assault_rifle',
            quantity: 1,
            rarityWeights: {
                common: 55,
                uncommon: 30,
                rare: 12,
                epic: 3
            }
        },
        baseTime: 25000,
        experienceGain: 75
    },

    shotgun: {
        id: 'shotgun',
        name: 'Shotgun',
        skill: 'mechanics',
        skillLevelRequired: 12,
        tier: 2,
        category: 'weapons',
        icon: '🔫',
        description: 'High damage at close range.',
        materials: [
            { itemId: 'steel_ingot', quantity: 3 },
            { itemId: 'iron_plate', quantity: 2 },
            { itemId: 'spring_assembly', quantity: 1 }
        ],
        outputs: {
            itemId: 'shotgun',
            quantity: 1,
            rarityWeights: {
                common: 60,
                uncommon: 28,
                rare: 10,
                epic: 2
            }
        },
        baseTime: 20000,
        experienceGain: 60
    },

    precision_barrel: {
        id: 'precision_barrel',
        name: 'Precision Barrel',
        skill: 'mechanics',
        skillLevelRequired: 18,
        tier: 2,
        category: 'components',
        icon: '🔧',
        description: 'A machined barrel for improved accuracy.',
        materials: [
            { itemId: 'steel_ingot', quantity: 2 },
            { itemId: 'gear_mechanism', quantity: 1 }
        ],
        outputs: {
            itemId: 'precision_barrel',
            quantity: 1
        },
        baseTime: 12000,
        experienceGain: 40
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 3: Advanced Weapons (Levels 26-50)
    // ═══════════════════════════════════════════════════════════════

    sniper_rifle: {
        id: 'sniper_rifle',
        name: 'Sniper Rifle',
        skill: 'mechanics',
        skillLevelRequired: 30,
        tier: 3,
        category: 'weapons',
        icon: '🎯',
        description: 'Long-range precision weapon.',
        materials: [
            { itemId: 'titanium_ingot', quantity: 3 },
            { itemId: 'precision_barrel', quantity: 1 },
            { itemId: 'gear_mechanism', quantity: 3 },
            { itemId: 'optical_lens', quantity: 1 }
        ],
        outputs: {
            itemId: 'sniper_rifle',
            quantity: 1,
            rarityWeights: {
                common: 40,
                uncommon: 35,
                rare: 18,
                epic: 6,
                legendary: 1
            }
        },
        baseTime: 40000,
        experienceGain: 120
    },

    heavy_machine_gun: {
        id: 'heavy_machine_gun',
        name: 'Heavy Machine Gun',
        skill: 'mechanics',
        skillLevelRequired: 40,
        tier: 3,
        category: 'weapons',
        icon: '💥',
        description: 'Sustained fire support weapon.',
        materials: [
            { itemId: 'titanium_ingot', quantity: 5 },
            { itemId: 'steel_plate', quantity: 3 },
            { itemId: 'gear_mechanism', quantity: 4 },
            { itemId: 'spring_assembly', quantity: 3 }
        ],
        outputs: {
            itemId: 'heavy_machine_gun',
            quantity: 1,
            rarityWeights: {
                common: 35,
                uncommon: 35,
                rare: 20,
                epic: 8,
                legendary: 2
            }
        },
        baseTime: 50000,
        experienceGain: 150
    }
};

// Register recipes with RecipeRegistry
if (typeof RecipeRegistry !== 'undefined') {
    RecipeRegistry.registerBatch('mechanics', MechanicsRecipes, 'production');
    console.log('[MechanicsRecipes] Registered mechanics recipes');
} else {
    console.warn('[MechanicsRecipes] RecipeRegistry not available');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MechanicsRecipes;
}
