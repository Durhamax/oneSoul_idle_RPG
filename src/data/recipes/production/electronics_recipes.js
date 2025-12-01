/**
 * ELECTRONICS RECIPES
 *
 * High-tech components and smart devices.
 * Circuits, processors, sensors, batteries.
 */

const ElectronicsRecipes = {
    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Basic Components (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    basic_circuit: {
        id: 'basic_circuit',
        name: 'Basic Circuit',
        skill: 'electronics',
        skillLevelRequired: 1,
        tier: 1,
        category: 'components',
        icon: '📟',
        description: 'A simple circuit board for basic devices.',
        materials: [
            { itemId: 'copper_wire', quantity: 3 },
            { itemId: 'silicon', quantity: 1 }
        ],
        outputs: {
            itemId: 'basic_circuit',
            quantity: 1
        },
        baseTime: 6000,
        experienceGain: 20
    },

    battery_cell: {
        id: 'battery_cell',
        name: 'Battery Cell',
        skill: 'electronics',
        skillLevelRequired: 4,
        tier: 1,
        category: 'power',
        icon: '🔋',
        description: 'Stores electrical energy for devices.',
        materials: [
            { itemId: 'copper_wire', quantity: 2 },
            { itemId: 'acid_compound', quantity: 1 },
            { itemId: 'metal_casing', quantity: 1 }
        ],
        outputs: {
            itemId: 'battery_cell',
            quantity: 2
        },
        baseTime: 8000,
        experienceGain: 25
    },

    sensor_module: {
        id: 'sensor_module',
        name: 'Sensor Module',
        skill: 'electronics',
        skillLevelRequired: 7,
        tier: 1,
        category: 'components',
        icon: '📡',
        description: 'Basic sensor for detection systems.',
        materials: [
            { itemId: 'basic_circuit', quantity: 1 },
            { itemId: 'copper_wire', quantity: 2 },
            { itemId: 'optical_lens', quantity: 1 }
        ],
        outputs: {
            itemId: 'sensor_module',
            quantity: 1
        },
        baseTime: 10000,
        experienceGain: 30
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 2: Advanced Components (Levels 11-25)
    // ═══════════════════════════════════════════════════════════════

    advanced_circuit: {
        id: 'advanced_circuit',
        name: 'Advanced Circuit',
        skill: 'electronics',
        skillLevelRequired: 12,
        tier: 2,
        category: 'components',
        icon: '💻',
        description: 'Complex circuit for advanced devices.',
        materials: [
            { itemId: 'basic_circuit', quantity: 2 },
            { itemId: 'gold_wire', quantity: 1 },
            { itemId: 'processor_chip', quantity: 1 }
        ],
        outputs: {
            itemId: 'advanced_circuit',
            quantity: 1
        },
        baseTime: 15000,
        experienceGain: 45
    },

    power_cell: {
        id: 'power_cell',
        name: 'Power Cell',
        skill: 'electronics',
        skillLevelRequired: 16,
        tier: 2,
        category: 'power',
        icon: '⚡',
        description: 'High-capacity energy storage.',
        materials: [
            { itemId: 'battery_cell', quantity: 3 },
            { itemId: 'capacitor', quantity: 2 },
            { itemId: 'advanced_circuit', quantity: 1 }
        ],
        outputs: {
            itemId: 'power_cell',
            quantity: 1
        },
        baseTime: 18000,
        experienceGain: 55
    },

    targeting_computer: {
        id: 'targeting_computer',
        name: 'Targeting Computer',
        skill: 'electronics',
        skillLevelRequired: 20,
        tier: 2,
        category: 'devices',
        icon: '🎯',
        description: 'Improves weapon accuracy.',
        materials: [
            { itemId: 'advanced_circuit', quantity: 2 },
            { itemId: 'sensor_module', quantity: 1 },
            { itemId: 'optical_lens', quantity: 2 }
        ],
        outputs: {
            itemId: 'targeting_computer',
            quantity: 1,
            rarityWeights: {
                common: 50,
                uncommon: 30,
                rare: 15,
                epic: 5
            }
        },
        baseTime: 25000,
        experienceGain: 70
    },

    capacitor: {
        id: 'capacitor',
        name: 'Capacitor',
        skill: 'electronics',
        skillLevelRequired: 14,
        tier: 2,
        category: 'components',
        icon: '🔌',
        description: 'Stores and releases electrical charge.',
        materials: [
            { itemId: 'copper_wire', quantity: 4 },
            { itemId: 'insulating_material', quantity: 2 }
        ],
        outputs: {
            itemId: 'capacitor',
            quantity: 2
        },
        baseTime: 10000,
        experienceGain: 35
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 3: High-Tech Devices (Levels 26-50)
    // ═══════════════════════════════════════════════════════════════

    quantum_processor: {
        id: 'quantum_processor',
        name: 'Quantum Processor',
        skill: 'electronics',
        skillLevelRequired: 30,
        tier: 3,
        category: 'components',
        icon: '🔮',
        description: 'Advanced processing unit for cutting-edge tech.',
        materials: [
            { itemId: 'advanced_circuit', quantity: 3 },
            { itemId: 'quantum_crystal', quantity: 1 },
            { itemId: 'gold_wire', quantity: 3 }
        ],
        outputs: {
            itemId: 'quantum_processor',
            quantity: 1
        },
        baseTime: 30000,
        experienceGain: 100
    },

    smart_scope: {
        id: 'smart_scope',
        name: 'Smart Scope',
        skill: 'electronics',
        skillLevelRequired: 35,
        tier: 3,
        category: 'devices',
        icon: '🔭',
        description: 'Digital scope with range finding and tracking.',
        materials: [
            { itemId: 'targeting_computer', quantity: 1 },
            { itemId: 'optical_lens', quantity: 3 },
            { itemId: 'power_cell', quantity: 1 }
        ],
        outputs: {
            itemId: 'smart_scope',
            quantity: 1,
            rarityWeights: {
                common: 35,
                uncommon: 35,
                rare: 20,
                epic: 8,
                legendary: 2
            }
        },
        baseTime: 35000,
        experienceGain: 90
    },

    shield_generator: {
        id: 'shield_generator',
        name: 'Shield Generator',
        skill: 'electronics',
        skillLevelRequired: 45,
        tier: 3,
        category: 'devices',
        icon: '🛡️',
        description: 'Generates a protective energy shield.',
        materials: [
            { itemId: 'quantum_processor', quantity: 1 },
            { itemId: 'power_cell', quantity: 2 },
            { itemId: 'capacitor', quantity: 4 },
            { itemId: 'titanium_plate', quantity: 2 }
        ],
        outputs: {
            itemId: 'shield_generator',
            quantity: 1,
            rarityWeights: {
                common: 25,
                uncommon: 35,
                rare: 25,
                epic: 12,
                legendary: 3
            }
        },
        baseTime: 50000,
        experienceGain: 150
    }
};

// Register recipes with RecipeRegistry
if (typeof RecipeRegistry !== 'undefined') {
    RecipeRegistry.registerBatch('electronics', ElectronicsRecipes, 'production');
    console.log('[ElectronicsRecipes] Registered electronics recipes');
} else {
    console.warn('[ElectronicsRecipes] RecipeRegistry not available');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectronicsRecipes;
}
