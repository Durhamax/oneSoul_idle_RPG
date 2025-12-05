/**
 * Tier 1 Materials - Region 1 (The Cradle)
 *
 * These materials are gathered from the 6 starting nodes.
 * Each material has a skill association for inventory sorting.
 *
 * Node Mapping:
 * - Fishing: Lake Shallows (node 1_1) - 3 materials
 * - Hunting: Meadow Game Trail (node 1_2) - 3 materials
 * - Foraging: Fallen Timber (node 1_3) - 4 materials
 * - Logging: Lakeside Forest (node 1_4) - 3 materials
 * - Mining: Riverbed (node 1_5) - 4 materials
 * - Foraging: Meadow Herb Patch (node 1_6) - 2 materials
 *
 * Total: 19 Tier 1 Materials
 */

const MATERIAL_ITEMS = {
    // ==========================================
    // FISHING - Lake Shallows (node 1_1)
    // ==========================================
    solfish: {
        id: 'solfish',
        name: 'Solfish',
        description: 'A common freshwater fish found in shallow lakes. Its mild flavor makes it ideal for cooking.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: 'assets/icons/materials/solfish.png',
        tags: ['fish', 'food-ingredient', 'cooking']
    },

    minnows: {
        id: 'minnows',
        name: 'Minnows',
        description: 'Tiny silver fish often used as bait or ground into fish meal.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🐠',
        tags: ['fish', 'bait']
    },

    mossShrimp: {
        id: 'mossShrimp',
        name: 'Moss Shrimp',
        description: 'A rare delicacy that hides among lake vegetation. Prized by chefs.',
        type: 'material',
        category: 'material',
        subcategory: 'fish',
        skill: 'fishing',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 15,
        icon: '🦐',
        tags: ['fish', 'food-ingredient', 'cooking', 'rare']
    },

    // ==========================================
    // HUNTING - Meadow Game Trail (node 1_2)
    // ==========================================
    smallGameMeat: {
        id: 'smallGameMeat',
        name: 'Small Game Meat',
        description: 'Fresh meat from small meadow creatures. Best cooked soon after harvest.',
        type: 'material',
        category: 'material',
        subcategory: 'meat',
        skill: 'hunting',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: '🍖',
        tags: ['meat', 'food-ingredient', 'cooking']
    },

    smallPelts: {
        id: 'smallPelts',
        name: 'Small Pelts',
        description: 'Soft fur pelts from small game. Used in crafting light armor and accessories.',
        type: 'material',
        category: 'material',
        subcategory: 'hide',
        skill: 'hunting',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 5,
        icon: '🧶',
        tags: ['hide', 'leather', 'tailoring', 'crafting']
    },

    feathers: {
        id: 'feathers',
        name: 'Feathers',
        description: 'Light, flexible feathers used for fletching arrows and decorative crafts.',
        type: 'material',
        category: 'material',
        subcategory: 'component',
        skill: 'hunting',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 8,
        icon: 'assets/icons/materials/feathers.png',
        tags: ['fletching', 'crafting', 'mechanics']
    },

    // ==========================================
    // FORAGING - Fallen Timber (node 1_3)
    // ==========================================
    mintyHerb: {
        id: 'mintyHerb',
        name: 'Minty Herb',
        description: 'A fragrant herb with cooling properties. Essential for many recipes and remedies.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: '🌿',
        tags: ['herb', 'food-ingredient', 'cooking', 'chemistry']
    },

    commonMushrooms: {
        id: 'commonMushrooms',
        name: 'Common Mushrooms',
        description: 'Edible fungi found growing on fallen logs. Nutritious but bland alone.',
        type: 'material',
        category: 'material',
        subcategory: 'fungus',
        skill: 'foraging',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 3,
        icon: 'assets/icons/materials/common mushroom.png',
        tags: ['fungus', 'food-ingredient', 'cooking']
    },

    plantFibers: {
        id: 'plantFibers',
        name: 'Plant Fibers',
        description: 'Strong natural fibers stripped from forest plants. Used in rope and bowstrings.',
        type: 'material',
        category: 'material',
        subcategory: 'fiber',
        skill: 'foraging',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 6,
        icon: '🧵',
        tags: ['fiber', 'crafting', 'mechanics', 'tailoring']
    },

    wildroot: {
        id: 'wildroot',
        name: 'Wildroot',
        description: 'A tough, gnarled root with potent alchemical properties. Difficult to find.',
        type: 'material',
        category: 'material',
        subcategory: 'herb',
        skill: 'foraging',
        tier: 1,
        rarity: 'epic',
        stackable: true,
        stackLimit: 999,
        value: 25,
        icon: '🫚',
        tags: ['herb', 'alchemy', 'chemistry', 'rare']
    },

    // ==========================================
    // LOGGING - Lakeside Forest (node 1_4)
    // ==========================================
    pinewood: {
        id: 'pinewood',
        name: 'Pinewood',
        description: 'Common softwood from lakeside pines. Easy to work with for basic construction.',
        type: 'material',
        category: 'material',
        subcategory: 'wood',
        skill: 'logging',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 2,
        icon: 'assets/icons/materials/pinewood.png',
        tags: ['wood', 'crafting', 'construction']
    },

    riverwillow: {
        id: 'riverwillow',
        name: 'Riverwillow',
        description: 'Flexible willow wood that grows near water. Prized for bows and woven crafts.',
        type: 'material',
        category: 'material',
        subcategory: 'wood',
        skill: 'logging',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 5,
        icon: 'assets/icons/materials/riverwillow.png',
        tags: ['wood', 'crafting', 'mechanics', 'flexible']
    },

    resin: {
        id: 'resin',
        name: 'Resin',
        description: 'Sticky tree sap that hardens over time. Used as adhesive and waterproofing.',
        type: 'material',
        category: 'material',
        subcategory: 'extract',
        skill: 'logging',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 8,
        icon: 'assets/icons/materials/resin.png',
        tags: ['extract', 'adhesive', 'crafting', 'chemistry']
    },

    // ==========================================
    // MINING - Riverbed (node 1_5)
    // ==========================================
    clay: {
        id: 'clay',
        name: 'Clay',
        description: 'Malleable river clay used for pottery, bricks, and basic construction.',
        type: 'material',
        category: 'material',
        subcategory: 'mineral',
        skill: 'mining',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 1,
        icon: 'assets/icons/materials/clay.png',
        tags: ['mineral', 'construction', 'crafting']
    },

    flint: {
        id: 'flint',
        name: 'Flint',
        description: 'Sharp-edged stone that sparks when struck. Essential for primitive tools and fire.',
        type: 'material',
        category: 'material',
        subcategory: 'stone',
        skill: 'mining',
        tier: 1,
        rarity: 'uncommon',
        stackable: true,
        stackLimit: 999,
        value: 4,
        icon: 'assets/icons/materials/flint.png',
        tags: ['stone', 'crafting', 'tools', 'mechanics']
    },

    copperiteOre: {
        id: 'copperiteOre',
        name: 'Copperite Ore',
        description: 'Raw copper-bearing ore with a distinctive green tint. Smelts into usable metal.',
        type: 'material',
        category: 'material',
        subcategory: 'ore',
        skill: 'mining',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 10,
        icon: '🔶',
        tags: ['ore', 'metal', 'smithing', 'smelting']
    },

    goldFlakes: {
        id: 'goldFlakes',
        name: 'Gold Flakes',
        description: 'Tiny flecks of gold found in riverbeds. Valuable but require refining.',
        type: 'material',
        category: 'material',
        subcategory: 'precious',
        skill: 'mining',
        tier: 1,
        rarity: 'epic',
        stackable: true,
        stackLimit: 999,
        value: 50,
        icon: 'assets/icons/materials/gold-flakes.png',
        tags: ['precious', 'currency', 'rare', 'smithing']
    },

    // ==========================================
    // FORAGING - Meadow Herb Patch (node 1_6)
    // ==========================================
    meadowGreens: {
        id: 'meadowGreens',
        name: 'Meadow Greens',
        description: 'Fresh leafy greens from open meadows. A staple ingredient in Unity cooking.',
        type: 'material',
        category: 'material',
        subcategory: 'vegetable',
        skill: 'foraging',
        tier: 1,
        rarity: 'common',
        stackable: true,
        stackLimit: 999,
        value: 1,
        icon: '🥬',
        tags: ['vegetable', 'food-ingredient', 'cooking']
    },

    daypetalBloom: {
        id: 'daypetalBloom',
        name: 'Daypetal Bloom',
        description: 'A rare flower that only blooms during the day. Its petals have medicinal properties.',
        type: 'material',
        category: 'material',
        subcategory: 'flower',
        skill: 'foraging',
        tier: 1,
        rarity: 'rare',
        stackable: true,
        stackLimit: 999,
        value: 20,
        icon: '🌸',
        tags: ['flower', 'alchemy', 'chemistry', 'medicine']
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATERIAL_ITEMS;
}
