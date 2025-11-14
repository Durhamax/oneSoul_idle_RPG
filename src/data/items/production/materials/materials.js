/**
 * MATERIAL & RESOURCE ITEMS
 *
 * Crafting materials, gathered resources, and raw materials
 */

const MATERIAL_ITEMS = {
    // =================================================================
    // ORES & METALS
    // =================================================================

    copperOre: {
        id: 'copperOre',
        name: 'Copper Ore',
        description: 'Raw copper ore mined from copper deposits. Used in basic smithing.',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 5,
        resourceType: 'ore',
        gatherSkill: 'mining',
        gatherLevel: 1,
        tags: ['material', 'ore', 'metal', 'copper', 'mining'],
    },

    tinOre: {
        id: 'tinOre',
        name: 'Tin Ore',
        description: 'Raw tin ore from tin deposits. Combines with copper to make bronze.',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 5,
        resourceType: 'ore',
        gatherSkill: 'mining',
        gatherLevel: 1,
        tags: ['material', 'ore', 'metal', 'tin', 'mining'],
    },

    ironOre: {
        id: 'ironOre',
        name: 'Iron Ore',
        description: 'Raw iron ore extracted from iron deposits. Essential for smithing.',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 15,
        resourceType: 'ore',
        gatherSkill: 'mining',
        gatherLevel: 10,
        tags: ['material', 'ore', 'metal', 'iron', 'mining'],
    },

    coal: {
        id: 'coal',
        name: 'Coal',
        description: 'Black coal used as fuel for smelting. Burns hot and long.',
        icon: '⚫',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 8,
        resourceType: 'ore',
        gatherSkill: 'mining',
        gatherLevel: 5,
        tags: ['material', 'ore', 'fuel', 'coal', 'mining'],
    },

    goldOre: {
        id: 'goldOre',
        name: 'Gold Ore',
        description: 'Precious gold ore. Can be smelted into gold bars.',
        icon: '🪨',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 50,
        value: 50,
        resourceType: 'ore',
        gatherSkill: 'mining',
        gatherLevel: 20,
        tags: ['material', 'ore', 'metal', 'gold', 'mining'],
    },

    // =================================================================
    // BARS & INGOTS
    // =================================================================

    copperBar: {
        id: 'copperBar',
        name: 'Copper Bar',
        description: 'Refined copper bar. Ready for crafting.',
        icon: '🟫',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 12,
        resourceType: 'bar',
        tags: ['material', 'bar', 'metal', 'copper', 'smithing'],
    },

    bronzeBar: {
        id: 'bronzeBar',
        name: 'Bronze Bar',
        description: 'Bronze alloy bar made from copper and tin. Durable and versatile.',
        icon: '🟫',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 25,
        resourceType: 'bar',
        tags: ['material', 'bar', 'metal', 'bronze', 'smithing'],
    },

    ironBar: {
        id: 'ironBar',
        name: 'Iron Bar',
        description: 'Refined iron bar. Strong and reliable crafting material.',
        icon: '⬛',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 100,
        value: 40,
        resourceType: 'bar',
        tags: ['material', 'bar', 'metal', 'iron', 'smithing'],
    },

    steelBar: {
        id: 'steelBar',
        name: 'Steel Bar',
        description: 'Tempered steel bar. Superior strength and quality.',
        icon: '⬛',
        category: 'material',
        rarity: 'rare',
        stackLimit: 75,
        value: 100,
        resourceType: 'bar',
        tags: ['material', 'bar', 'metal', 'steel', 'smithing'],
    },

    goldBar: {
        id: 'goldBar',
        name: 'Gold Bar',
        description: 'Pure gold bar. Valuable and malleable.',
        icon: '🟨',
        category: 'material',
        rarity: 'rare',
        stackLimit: 50,
        value: 150,
        resourceType: 'bar',
        tags: ['material', 'bar', 'metal', 'gold', 'smithing'],
    },

    // =================================================================
    // WOOD & LOGS
    // =================================================================

    normalLogs: {
        id: 'normalLogs',
        name: 'Normal Logs',
        description: 'Basic logs from common trees. Used in crafting and construction.',
        icon: '🪵',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 3,
        resourceType: 'wood',
        gatherSkill: 'woodcutting',
        gatherLevel: 1,
        tags: ['material', 'wood', 'logs', 'woodcutting'],
    },

    oakLogs: {
        id: 'oakLogs',
        name: 'Oak Logs',
        description: 'Sturdy oak logs. Better quality than normal wood.',
        icon: '🪵',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 10,
        resourceType: 'wood',
        gatherSkill: 'woodcutting',
        gatherLevel: 10,
        tags: ['material', 'wood', 'logs', 'oak', 'woodcutting'],
    },

    willowLogs: {
        id: 'willowLogs',
        name: 'Willow Logs',
        description: 'Flexible willow logs. Excellent for crafting bows and tools.',
        icon: '🪵',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 100,
        value: 18,
        resourceType: 'wood',
        gatherSkill: 'woodcutting',
        gatherLevel: 15,
        tags: ['material', 'wood', 'logs', 'willow', 'woodcutting'],
    },

    mapleLogs: {
        id: 'mapleLogs',
        name: 'Maple Logs',
        description: 'Hard maple logs. Dense and durable.',
        icon: '🪵',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 100,
        value: 30,
        resourceType: 'wood',
        gatherSkill: 'woodcutting',
        gatherLevel: 25,
        tags: ['material', 'wood', 'logs', 'maple', 'woodcutting'],
    },

    // =================================================================
    // TEXTILES & LEATHER
    // =================================================================

    wool: {
        id: 'wool',
        name: 'Wool',
        description: 'Soft wool fiber. Can be spun into thread.',
        icon: '🧶',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 4,
        resourceType: 'textile',
        tags: ['material', 'textile', 'wool', 'crafting'],
    },

    thread: {
        id: 'thread',
        name: 'Thread',
        description: 'Spun thread for sewing and crafting cloth items.',
        icon: '🧵',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 8,
        resourceType: 'textile',
        tags: ['material', 'textile', 'thread', 'crafting'],
    },

    leather: {
        id: 'leather',
        name: 'Leather',
        description: 'Tanned leather hide. Essential for leatherworking.',
        icon: '🦴',
        category: 'material',
        rarity: 'common',
        stackLimit: 50,
        value: 15,
        resourceType: 'leather',
        tags: ['material', 'leather', 'hide', 'crafting'],
    },

    hardLeather: {
        id: 'hardLeather',
        name: 'Hard Leather',
        description: 'Hardened leather. More durable than regular leather.',
        icon: '🦴',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 50,
        value: 35,
        resourceType: 'leather',
        tags: ['material', 'leather', 'hide', 'crafting'],
    },

    // =================================================================
    // HERBS & PLANTS
    // =================================================================

    healingHerb: {
        id: 'healingHerb',
        name: 'Healing Herb',
        description: 'Medicinal herb with healing properties. Used in potion making.',
        icon: '🌿',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 6,
        resourceType: 'herb',
        gatherSkill: 'herbalism',
        gatherLevel: 1,
        tags: ['material', 'herb', 'plant', 'alchemy', 'healing'],
    },

    strengthHerb: {
        id: 'strengthHerb',
        name: 'Strength Herb',
        description: 'Potent herb that enhances physical power. Used in strength potions.',
        icon: '🌿',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 50,
        value: 20,
        resourceType: 'herb',
        gatherSkill: 'herbalism',
        gatherLevel: 10,
        tags: ['material', 'herb', 'plant', 'alchemy', 'strength'],
    },

    magicHerb: {
        id: 'magicHerb',
        name: 'Magic Herb',
        description: 'Mystical herb infused with arcane energy. Used in magic potions.',
        icon: '🌿',
        category: 'material',
        rarity: 'uncommon',
        stackLimit: 50,
        value: 25,
        resourceType: 'herb',
        gatherSkill: 'herbalism',
        gatherLevel: 15,
        tags: ['material', 'herb', 'plant', 'alchemy', 'magic'],
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
        rarity: 'common',
        stackLimit: 200,
        value: 2,
        resourceType: 'misc',
        tags: ['material', 'iron', 'nails', 'crafting'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATERIAL_ITEMS;
}
