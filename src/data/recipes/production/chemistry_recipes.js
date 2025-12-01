/**
 * CHEMISTRY RECIPES
 *
 * Consumables: Potions, explosives, and ammunition.
 * Variable quantity outputs based on workstation tier.
 */

const ChemistryRecipes = {
    // ═══════════════════════════════════════════════════════════════
    // TIER 1: Basic Consumables (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    health_potion_small: {
        id: 'health_potion_small',
        name: 'Small Health Potion',
        skill: 'chemistry',
        skillLevelRequired: 1,
        tier: 1,
        category: 'potions',
        icon: '🧪',
        description: 'Restores a small amount of health.',
        materials: [
            { itemId: 'medicinal_herb', quantity: 2 },
            { itemId: 'pure_water', quantity: 1 }
        ],
        outputs: {
            itemId: 'health_potion_small',
            baseQuantity: 3  // Variable quantity for consumables
        },
        baseTime: 5000,
        experienceGain: 15
    },

    antidote: {
        id: 'antidote',
        name: 'Antidote',
        skill: 'chemistry',
        skillLevelRequired: 3,
        tier: 1,
        category: 'potions',
        icon: '💚',
        description: 'Cures poison effects.',
        materials: [
            { itemId: 'medicinal_herb', quantity: 1 },
            { itemId: 'charcoal', quantity: 1 },
            { itemId: 'pure_water', quantity: 1 }
        ],
        outputs: {
            itemId: 'antidote',
            baseQuantity: 2
        },
        baseTime: 6000,
        experienceGain: 18
    },

    basic_bullet: {
        id: 'basic_bullet',
        name: 'Basic Bullets',
        skill: 'chemistry',
        skillLevelRequired: 5,
        tier: 1,
        category: 'ammunition',
        icon: '🔹',
        description: 'Standard ammunition for firearms.',
        materials: [
            { itemId: 'iron_ingot', quantity: 1 },
            { itemId: 'gunpowder', quantity: 2 }
        ],
        outputs: {
            itemId: 'basic_bullet',
            baseQuantity: 20
        },
        baseTime: 8000,
        experienceGain: 25
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 2: Standard Consumables (Levels 11-25)
    // ═══════════════════════════════════════════════════════════════

    health_potion_medium: {
        id: 'health_potion_medium',
        name: 'Medium Health Potion',
        skill: 'chemistry',
        skillLevelRequired: 12,
        tier: 2,
        category: 'potions',
        icon: '🧪',
        description: 'Restores a moderate amount of health.',
        materials: [
            { itemId: 'medicinal_herb', quantity: 4 },
            { itemId: 'rare_flower', quantity: 1 },
            { itemId: 'pure_water', quantity: 2 }
        ],
        outputs: {
            itemId: 'health_potion_medium',
            baseQuantity: 3
        },
        baseTime: 10000,
        experienceGain: 35
    },

    stamina_potion: {
        id: 'stamina_potion',
        name: 'Stamina Potion',
        skill: 'chemistry',
        skillLevelRequired: 15,
        tier: 2,
        category: 'potions',
        icon: '⚡',
        description: 'Restores endurance for travel.',
        materials: [
            { itemId: 'energy_root', quantity: 2 },
            { itemId: 'honey', quantity: 1 },
            { itemId: 'pure_water', quantity: 1 }
        ],
        outputs: {
            itemId: 'stamina_potion',
            baseQuantity: 2
        },
        baseTime: 8000,
        experienceGain: 30
    },

    frag_grenade: {
        id: 'frag_grenade',
        name: 'Frag Grenade',
        skill: 'chemistry',
        skillLevelRequired: 18,
        tier: 2,
        category: 'explosives',
        icon: '💣',
        description: 'Explosive device that deals area damage.',
        materials: [
            { itemId: 'iron_plate', quantity: 1 },
            { itemId: 'gunpowder', quantity: 4 },
            { itemId: 'shrapnel', quantity: 2 }
        ],
        outputs: {
            itemId: 'frag_grenade',
            baseQuantity: 2
        },
        baseTime: 15000,
        experienceGain: 45
    },

    incendiary_round: {
        id: 'incendiary_round',
        name: 'Incendiary Rounds',
        skill: 'chemistry',
        skillLevelRequired: 20,
        tier: 2,
        category: 'ammunition',
        icon: '🔥',
        description: 'Bullets that cause burn damage.',
        materials: [
            { itemId: 'iron_ingot', quantity: 1 },
            { itemId: 'gunpowder', quantity: 2 },
            { itemId: 'phosphorus', quantity: 1 }
        ],
        outputs: {
            itemId: 'incendiary_round',
            baseQuantity: 15
        },
        baseTime: 12000,
        experienceGain: 40
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 3: Advanced Consumables (Levels 26-50)
    // ═══════════════════════════════════════════════════════════════

    health_potion_large: {
        id: 'health_potion_large',
        name: 'Large Health Potion',
        skill: 'chemistry',
        skillLevelRequired: 28,
        tier: 3,
        category: 'potions',
        icon: '🧪',
        description: 'Restores a large amount of health.',
        materials: [
            { itemId: 'medicinal_herb', quantity: 6 },
            { itemId: 'rare_flower', quantity: 2 },
            { itemId: 'crystal_essence', quantity: 1 },
            { itemId: 'pure_water', quantity: 3 }
        ],
        outputs: {
            itemId: 'health_potion_large',
            baseQuantity: 3
        },
        baseTime: 18000,
        experienceGain: 60
    },

    cryo_round: {
        id: 'cryo_round',
        name: 'Cryo Rounds',
        skill: 'chemistry',
        skillLevelRequired: 32,
        tier: 3,
        category: 'ammunition',
        icon: '❄️',
        description: 'Bullets that slow and freeze targets.',
        materials: [
            { itemId: 'titanium_ingot', quantity: 1 },
            { itemId: 'cryo_compound', quantity: 2 },
            { itemId: 'gunpowder', quantity: 2 }
        ],
        outputs: {
            itemId: 'cryo_round',
            baseQuantity: 12
        },
        baseTime: 15000,
        experienceGain: 55
    },

    shock_round: {
        id: 'shock_round',
        name: 'Shock Rounds',
        skill: 'chemistry',
        skillLevelRequired: 35,
        tier: 3,
        category: 'ammunition',
        icon: '⚡',
        description: 'Bullets that stun with electrical damage.',
        materials: [
            { itemId: 'titanium_ingot', quantity: 1 },
            { itemId: 'capacitor', quantity: 1 },
            { itemId: 'conductive_gel', quantity: 2 },
            { itemId: 'gunpowder', quantity: 2 }
        ],
        outputs: {
            itemId: 'shock_round',
            baseQuantity: 10
        },
        baseTime: 18000,
        experienceGain: 65
    },

    combat_stim: {
        id: 'combat_stim',
        name: 'Combat Stimulant',
        skill: 'chemistry',
        skillLevelRequired: 40,
        tier: 3,
        category: 'potions',
        icon: '💉',
        description: 'Temporarily boosts combat stats.',
        materials: [
            { itemId: 'adrenaline_extract', quantity: 2 },
            { itemId: 'rare_flower', quantity: 1 },
            { itemId: 'synthetic_compound', quantity: 1 }
        ],
        outputs: {
            itemId: 'combat_stim',
            baseQuantity: 2
        },
        baseTime: 20000,
        experienceGain: 75
    }
};

// Register recipes with RecipeRegistry
if (typeof RecipeRegistry !== 'undefined') {
    RecipeRegistry.registerBatch('chemistry', ChemistryRecipes, 'production');
    console.log('[ChemistryRecipes] Registered chemistry recipes');
} else {
    console.warn('[ChemistryRecipes] RecipeRegistry not available');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChemistryRecipes;
}
