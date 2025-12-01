/**
 * MATERIAL & RESOURCE ITEMS
 *
 * Crafting materials, gathered resources, and raw materials
 */

const MATERIAL_ITEMS = {
    // =================================================================
    // WOOD & LOGS
    // =================================================================

    pinewood: {
        id: 'pinewood',
        name: 'Pinewood',
        description: 'Soft pine logs from young pine trees. Basic fuel for campfires and navigation.',
        icon: '🪵',
        iconPath: 'assets/icons/materials/pinewood.png',
        category: 'material',
        instanced: false,  // Stackable resource
        itemType: 'resource',
        rarity: 'common',
        stackLimit: 100,
        value: 2,
        resourceType: 'wood',
        gatherSkill: 'woodcutting',
        gatherLevel: 1,
        tags: ['material', 'wood', 'logs', 'woodcutting', 'fuel', 'navigation'],
    },

    // =================================================================
    // TEXTILES & LEATHER
    // =================================================================

    leather: {
        id: 'leather',
        name: 'Leather',
        description: 'Tanned leather hide. Essential for leatherworking.',
        icon: '🦴',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'common',
        stackLimit: 50,
        value: 15,
        resourceType: 'leather',
        tags: ['material', 'leather', 'hide', 'crafting'],
    },

    // =================================================================
    // GEMS & CRYSTALS
    // =================================================================

    rubyGem: {
        id: 'rubyGem',
        name: 'Ruby',
        description: 'Precious ruby gemstone. Radiates with inner fire.',
        icon: '🔴',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'rare',
        stackLimit: 25,
        value: 200,
        resourceType: 'gem',
        tags: ['material', 'gem', 'ruby', 'precious'],
    },

    sapphireGem: {
        id: 'sapphireGem',
        name: 'Sapphire',
        description: 'Beautiful sapphire gemstone. Deep blue color.',
        icon: '🔵',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'rare',
        stackLimit: 25,
        value: 200,
        resourceType: 'gem',
        tags: ['material', 'gem', 'sapphire', 'precious'],
    },

    emeraldGem: {
        id: 'emeraldGem',
        name: 'Emerald',
        description: 'Stunning emerald gemstone. Vibrant green hue.',
        icon: '🟢',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'rare',
        stackLimit: 25,
        value: 200,
        resourceType: 'gem',
        tags: ['material', 'gem', 'emerald', 'precious'],
    },

    diamondGem: {
        id: 'diamondGem',
        name: 'Diamond',
        description: 'Flawless diamond. The hardest known material.',
        icon: '💎',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'epic',
        stackLimit: 10,
        value: 500,
        resourceType: 'gem',
        tags: ['material', 'gem', 'diamond', 'precious'],
    },

    // =================================================================
    // MISC MATERIALS
    // =================================================================

    glass: {
        id: 'glass',
        name: 'Glass',
        description: 'Clear glass made from sand. Used in various crafts.',
        icon: '🔳',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'common',
        stackLimit: 100,
        value: 10,
        resourceType: 'misc',
        tags: ['material', 'glass', 'crafting'],
    },

    rope: {
        id: 'rope',
        name: 'Rope',
        description: 'Sturdy rope. Useful for many purposes.',
        icon: '🪢',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'common',
        stackLimit: 50,
        value: 8,
        resourceType: 'misc',
        tags: ['material', 'rope', 'crafting'],
    },

    nails: {
        id: 'nails',
        name: 'Iron Nails',
        description: 'Small iron nails for construction and repairs.',
        icon: '📌',
        category: 'material',
        instanced: false,  // Stackable resource
        rarity: 'common',
        stackLimit: 200,
        value: 2,
        resourceType: 'misc',
        tags: ['material', 'iron', 'nails', 'crafting'],
    },

    flintstone: {
        id: 'flintstone',
        name: 'Flintstone',
        description: 'Sharp flint stone. Used for arrowheads and primitive tools.',
        icon: '🪨',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 3,
        resourceType: 'stone',
        gatherSkill: 'mining',
        gatherLevel: 1,
        tags: ['material', 'stone', 'flint', 'mining'],
    },

    feather: {
        id: 'feather',
        name: 'Feather',
        description: 'Light bird feather. Used for fletching arrows.',
        icon: '🪶',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 2,
        resourceType: 'misc',
        gatherSkill: 'hunting',
        gatherLevel: 1,
        tags: ['material', 'feather', 'hunting', 'fletching'],
    },

    copperite: {
        id: 'copperite',
        name: 'Copperite',
        description: 'Refined copper alloy suitable for ammunition casings.',
        icon: '🟫',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 8,
        resourceType: 'metal',
        tags: ['material', 'metal', 'copper', 'ammunition'],
    },

    linen: {
        id: 'linen',
        name: 'Linen',
        description: 'Woven linen fabric. Light and breathable.',
        icon: '🧵',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 10,
        resourceType: 'textile',
        tags: ['material', 'textile', 'linen', 'crafting'],
    },

    wax: {
        id: 'wax',
        name: 'Wax',
        description: 'Natural beeswax. Waterproofing and coating material.',
        icon: '🕯️',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 5,
        resourceType: 'misc',
        tags: ['material', 'wax', 'crafting'],
    },

    // =================================================================
    // HERBS & PLANTS
    // =================================================================

    mintyHerb: {
        id: 'mintyHerb',
        name: 'Minty Herb',
        description: 'A fragrant herb with a cool, refreshing taste. Commonly used in cooking and medicine.',
        icon: '🌿',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 3,
        resourceType: 'herb',
        gatherSkill: 'foraging',
        gatherLevel: 1,
        tags: ['material', 'herb', 'plant', 'cooking', 'foraging'],
    },

    // =================================================================
    // FOOD MATERIALS
    // =================================================================

    solfish: {
        id: 'solfish',
        name: 'Solfish',
        description: 'Common fish caught in freshwater. Can be cooked.',
        icon: '🐟',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 50,
        value: 4,
        resourceType: 'food',
        gatherSkill: 'fishing',
        gatherLevel: 1,
        tags: ['material', 'food', 'fish', 'fishing'],
    },

    minnow: {
        id: 'minnow',
        name: 'Minnow',
        description: 'Tiny fish found in ponds and streams. Can be processed into fish oil.',
        icon: '🐟',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 2,
        resourceType: 'food',
        gatherSkill: 'fishing',
        gatherLevel: 1,
        tags: ['material', 'food', 'fish', 'fishing', 'bait'],
    },

    smallGameMeat: {
        id: 'smallGameMeat',
        name: 'Small Game Meat',
        description: 'Raw meat from small game animals like rabbits or squirrels.',
        icon: '🥩',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 50,
        value: 6,
        resourceType: 'food',
        gatherSkill: 'hunting',
        gatherLevel: 1,
        tags: ['material', 'food', 'meat', 'hunting'],
    },

    fishoil: {
        id: 'fishoil',
        name: 'Fish Oil',
        description: 'Oil extracted from fish. Nutritious and restorative.',
        icon: '🧴',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 50,
        value: 8,
        resourceType: 'misc',
        tags: ['material', 'oil', 'fish', 'alchemy'],
    },

    // =================================================================
    // DROID PARTS & ELECTRONICS (Enemy Loot)
    // =================================================================

    circuit_scrap: {
        id: 'circuit_scrap',
        name: 'Circuit Scrap',
        description: 'Salvaged electronic components from droid enemies. Useful for electronics crafting.',
        icon: '🔌',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 999,
        value: 3,
        slot: 'resource',
        resourceType: 'electronics',
        tags: ['material', 'electronics', 'droid', 'crafting', 'combat_loot'],
    },

    copper_wire: {
        id: 'copper_wire',
        name: 'Copper Wire',
        description: 'Thin copper wiring useful for electronics crafting. Often salvaged from defeated droids.',
        icon: '🪡',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 999,
        value: 2,
        slot: 'resource',
        resourceType: 'metal',
        tags: ['material', 'metal', 'wire', 'electronics', 'crafting', 'combat_loot'],
    },

    lens_fragment: {
        id: 'lens_fragment',
        name: 'Lens Fragment',
        description: 'A cracked optical lens from a drone sensor array. Can be reprocessed or used in optics crafting.',
        icon: '🔍',
        category: 'material',
        instanced: false,
        rarity: 'common',
        stackLimit: 999,
        value: 5,
        slot: 'resource',
        resourceType: 'optics',
        tags: ['material', 'optics', 'lens', 'droid', 'crafting', 'combat_loot'],
    },

    survey_data_chip: {
        id: 'survey_data_chip',
        name: 'Survey Data Chip',
        description: 'Contains encrypted survey data from Elaran reconnaissance drones. May be valuable to certain buyers or useful for reverse engineering.',
        icon: '💾',
        category: 'material',
        instanced: false,
        rarity: 'uncommon',
        stackLimit: 99,
        value: 12,
        slot: 'resource',
        resourceType: 'data',
        tags: ['material', 'data', 'electronics', 'droid', 'valuable', 'combat_loot'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATERIAL_ITEMS;
}
