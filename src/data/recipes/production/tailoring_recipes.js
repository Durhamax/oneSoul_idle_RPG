/**
 * TAILORING RECIPES
 *
 * ALL armor manufacturing.
 * Combines materials into finished armor.
 */

const TailoringRecipes = {
    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Basic Armor (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    cloth_vest: {
        id: 'cloth_vest',
        name: 'Cloth Vest',
        skill: 'tailoring',
        skillLevelRequired: 1,
        tier: 1,
        category: 'armor',
        icon: '👕',
        description: 'Basic cloth armor providing minimal protection.',
        materials: [
            { itemId: 'cloth', quantity: 4 }
        ],
        outputs: {
            itemId: 'cloth_vest',
            quantity: 1,
            rarityWeights: {
                common: 75,
                uncommon: 20,
                rare: 5
            }
        },
        baseTime: 8000,
        experienceGain: 20
    },

    leather_jacket: {
        id: 'leather_jacket',
        name: 'Leather Jacket',
        skill: 'tailoring',
        skillLevelRequired: 5,
        tier: 1,
        category: 'armor',
        icon: '🧥',
        description: 'Sturdy leather armor for light protection.',
        materials: [
            { itemId: 'leather', quantity: 4 },
            { itemId: 'thread', quantity: 2 }
        ],
        outputs: {
            itemId: 'leather_jacket',
            quantity: 1,
            rarityWeights: {
                common: 70,
                uncommon: 22,
                rare: 7,
                epic: 1
            }
        },
        baseTime: 12000,
        experienceGain: 30
    },

    padded_gloves: {
        id: 'padded_gloves',
        name: 'Padded Gloves',
        skill: 'tailoring',
        skillLevelRequired: 3,
        tier: 1,
        category: 'armor',
        icon: '🧤',
        description: 'Protective gloves for the hands.',
        materials: [
            { itemId: 'leather', quantity: 2 },
            { itemId: 'cloth', quantity: 1 }
        ],
        outputs: {
            itemId: 'padded_gloves',
            quantity: 1,
            rarityWeights: {
                common: 72,
                uncommon: 20,
                rare: 6,
                epic: 2
            }
        },
        baseTime: 6000,
        experienceGain: 15
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 2: Reinforced Armor (Levels 11-25)
    // ═══════════════════════════════════════════════════════════════

    tactical_vest: {
        id: 'tactical_vest',
        name: 'Tactical Vest',
        skill: 'tailoring',
        skillLevelRequired: 12,
        tier: 2,
        category: 'armor',
        icon: '🦺',
        description: 'Reinforced vest with metal plating.',
        materials: [
            { itemId: 'leather', quantity: 4 },
            { itemId: 'iron_plate', quantity: 2 },
            { itemId: 'padding', quantity: 2 }
        ],
        outputs: {
            itemId: 'tactical_vest',
            quantity: 1,
            rarityWeights: {
                common: 55,
                uncommon: 30,
                rare: 12,
                epic: 3
            }
        },
        baseTime: 20000,
        experienceGain: 50
    },

    combat_boots: {
        id: 'combat_boots',
        name: 'Combat Boots',
        skill: 'tailoring',
        skillLevelRequired: 15,
        tier: 2,
        category: 'armor',
        icon: '👢',
        description: 'Sturdy boots for combat situations.',
        materials: [
            { itemId: 'leather', quantity: 3 },
            { itemId: 'steel_plate', quantity: 1 },
            { itemId: 'rubber', quantity: 2 }
        ],
        outputs: {
            itemId: 'combat_boots',
            quantity: 1,
            rarityWeights: {
                common: 55,
                uncommon: 30,
                rare: 12,
                epic: 3
            }
        },
        baseTime: 15000,
        experienceGain: 40
    },

    kevlar_vest: {
        id: 'kevlar_vest',
        name: 'Kevlar Vest',
        skill: 'tailoring',
        skillLevelRequired: 20,
        tier: 2,
        category: 'armor',
        icon: '🛡️',
        description: 'Bullet-resistant armor for maximum protection.',
        materials: [
            { itemId: 'kevlar_fabric', quantity: 4 },
            { itemId: 'steel_plate', quantity: 2 },
            { itemId: 'padding', quantity: 3 }
        ],
        outputs: {
            itemId: 'kevlar_vest',
            quantity: 1,
            rarityWeights: {
                common: 45,
                uncommon: 35,
                rare: 15,
                epic: 5
            }
        },
        baseTime: 25000,
        experienceGain: 65
    },

    insulated_suit: {
        id: 'insulated_suit',
        name: 'Insulated Suit',
        skill: 'tailoring',
        skillLevelRequired: 22,
        tier: 2,
        category: 'armor',
        icon: '🔌',
        description: 'Protects against electrical and energy damage.',
        materials: [
            { itemId: 'insulating_material', quantity: 4 },
            { itemId: 'rubber', quantity: 3 },
            { itemId: 'cloth', quantity: 2 }
        ],
        outputs: {
            itemId: 'insulated_suit',
            quantity: 1,
            rarityWeights: {
                common: 50,
                uncommon: 32,
                rare: 14,
                epic: 4
            }
        },
        baseTime: 22000,
        experienceGain: 55
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 3: Advanced Armor (Levels 26-50)
    // ═══════════════════════════════════════════════════════════════

    tactical_armor: {
        id: 'tactical_armor',
        name: 'Tactical Armor',
        skill: 'tailoring',
        skillLevelRequired: 28,
        tier: 3,
        category: 'armor',
        icon: '⚔️',
        description: 'Full tactical armor set with titanium plating.',
        materials: [
            { itemId: 'kevlar_fabric', quantity: 6 },
            { itemId: 'titanium_plate', quantity: 3 },
            { itemId: 'padding', quantity: 4 },
            { itemId: 'reinforced_frame', quantity: 1 }
        ],
        outputs: {
            itemId: 'tactical_armor',
            quantity: 1,
            rarityWeights: {
                common: 35,
                uncommon: 35,
                rare: 20,
                epic: 8,
                legendary: 2
            }
        },
        baseTime: 40000,
        experienceGain: 100
    },

    powered_exosuit: {
        id: 'powered_exosuit',
        name: 'Powered Exosuit',
        skill: 'tailoring',
        skillLevelRequired: 40,
        tier: 3,
        category: 'armor',
        icon: '🤖',
        description: 'Powered armor that enhances strength and protection.',
        materials: [
            { itemId: 'titanium_plate', quantity: 5 },
            { itemId: 'kevlar_fabric', quantity: 4 },
            { itemId: 'power_cell', quantity: 2 },
            { itemId: 'servo_motor', quantity: 4 },
            { itemId: 'advanced_circuit', quantity: 2 }
        ],
        outputs: {
            itemId: 'powered_exosuit',
            quantity: 1,
            rarityWeights: {
                common: 25,
                uncommon: 35,
                rare: 25,
                epic: 12,
                legendary: 3
            }
        },
        baseTime: 60000,
        experienceGain: 150
    },

    stealth_suit: {
        id: 'stealth_suit',
        name: 'Stealth Suit',
        skill: 'tailoring',
        skillLevelRequired: 35,
        tier: 3,
        category: 'armor',
        icon: '🥷',
        description: 'Light armor designed for stealth operations.',
        materials: [
            { itemId: 'smart_fabric', quantity: 4 },
            { itemId: 'optical_camo', quantity: 2 },
            { itemId: 'sensor_module', quantity: 1 },
            { itemId: 'battery_cell', quantity: 2 }
        ],
        outputs: {
            itemId: 'stealth_suit',
            quantity: 1,
            rarityWeights: {
                common: 30,
                uncommon: 35,
                rare: 22,
                epic: 10,
                legendary: 3
            }
        },
        baseTime: 45000,
        experienceGain: 120
    }
};

// Register recipes with RecipeRegistry
if (typeof RecipeRegistry !== 'undefined') {
    RecipeRegistry.registerBatch('tailoring', TailoringRecipes, 'production');
    console.log('[TailoringRecipes] Registered tailoring recipes');
} else {
    console.warn('[TailoringRecipes] RecipeRegistry not available');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TailoringRecipes;
}
