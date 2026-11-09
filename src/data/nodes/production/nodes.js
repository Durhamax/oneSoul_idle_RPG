/**
 * NODES - Production Node Definitions
 *
 * All gathering nodes in the game, organized by tier.
 * This file is the single source of truth for node data.
 *
 * Node IDs use format: node_[tier]_[index]
 * - node_1_1 through node_1_6 are Tier 1 nodes (The Cradle)
 *
 * Future tiers will be added as regions expand.
 */

// ==========================================
// TIER 1 - Region 1 (The Cradle)
// ==========================================

// FISHING - Lake Shallows (node_1_1)
NodeRegistry.production.node_1_1 = {
    id: 'node_1_1',
    name: 'Lake Shallows',
    description: 'Calm, shallow waters along the lake edge. Schools of small fish gather here among the reeds.',
    nodeType: 'fishing',
    skill: 'fishing',
    tier: 1,
    category: 'water',

    requiredSkillLevel: 1,
    requiredTools: ['fishing'],
    minToolTier: 1,

    baseHealth: 9,
    minHealth: 9,
    maxHealth: 9,

    harvestTime: 4.0,
    respawnTime: 30,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'solfish', weight: 60, minYield: 1, maxYield: 3 },
        { itemId: 'minnows', weight: 30, minYield: 1, maxYield: 2 },
        { itemId: 'mossShrimp', weight: 10, minYield: 1, maxYield: 1 }
    ],

    baseXP: 15,
    icon: '🎣',
    color: '#4FC3F7',
    regions: ['region_-3_-4'],
    tags: ['water', 'fishing', 'tier1', 'cradle']
};

// HUNTING - Meadow Game Trail (node_1_2)
NodeRegistry.production.node_1_2 = {
    id: 'node_1_2',
    name: 'Meadow Game Trail',
    description: 'A well-worn path through the meadow where small game frequently travels. Fresh tracks are everywhere.',
    nodeType: 'hunting',
    skill: 'hunting',
    tier: 1,
    category: 'land',

    requiredSkillLevel: 1,
    requiredTools: ['hunting'],
    minToolTier: 1,

    baseHealth: 9,
    minHealth: 9,
    maxHealth: 9,

    harvestTime: 5.0,
    respawnTime: 45,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'smallGameMeat', weight: 55, minYield: 1, maxYield: 2 },
        { itemId: 'smallPelts', weight: 30, minYield: 1, maxYield: 1 },
        { itemId: 'feathers', weight: 15, minYield: 1, maxYield: 3 }
    ],

    baseXP: 18,
    icon: '🦌',
    color: '#8D6E63',
    regions: ['region_-3_-4'],
    tags: ['land', 'hunting', 'tier1', 'cradle']
};

// FORAGING - Fallen Timber (node_1_3)
NodeRegistry.production.node_1_3 = {
    id: 'node_1_3',
    name: 'Fallen Timber',
    description: 'A moss-covered fallen tree, home to herbs, fungi, and useful plants growing in the decay.',
    nodeType: 'foraging',
    skill: 'foraging',
    tier: 1,
    category: 'forest',

    requiredSkillLevel: 1,
    requiredTools: ['foraging'],
    minToolTier: 1,

    baseHealth: 9,
    minHealth: 9,
    maxHealth: 9,

    harvestTime: 3.0,
    respawnTime: 25,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'mintyHerb', weight: 45, minYield: 1, maxYield: 3 },
        { itemId: 'commonMushrooms', weight: 30, minYield: 1, maxYield: 2 },
        { itemId: 'plantFibers', weight: 18, minYield: 1, maxYield: 2 },
        { itemId: 'wildroot', weight: 7, minYield: 1, maxYield: 1 }
    ],

    baseXP: 12,
    icon: '🌿',
    color: '#81C784',
    regions: ['region_-3_-4'],
    tags: ['forest', 'foraging', 'tier1', 'cradle']
};

// LOGGING - Lakeside Forest (node_1_4)
NodeRegistry.production.node_1_4 = {
    id: 'node_1_4',
    name: 'Lakeside Forest',
    description: 'A grove of pine and willow trees growing along the lake. The wood here is fresh and workable.',
    nodeType: 'logging',
    skill: 'logging',
    tier: 1,
    category: 'forest',

    requiredSkillLevel: 1,
    requiredTools: ['logging'],
    minToolTier: 1,

    baseHealth: 9,
    minHealth: 9,
    maxHealth: 9,

    harvestTime: 4.5,
    respawnTime: 60,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'pinewood', weight: 55, minYield: 2, maxYield: 4 },
        { itemId: 'riverwillow', weight: 30, minYield: 1, maxYield: 2 },
        { itemId: 'resin', weight: 15, minYield: 1, maxYield: 1 }
    ],

    baseXP: 16,
    icon: '🪓',
    color: '#A1887F',
    regions: ['region_-3_-4'],
    tags: ['forest', 'logging', 'tier1', 'cradle']
};

// MINING - Riverbed (node_1_5)
NodeRegistry.production.node_1_5 = {
    id: 'node_1_5',
    name: 'Riverbed',
    description: 'Exposed rock and sediment along the river. Clay, flint, and occasional ore deposits can be found here.',
    nodeType: 'mining',
    skill: 'mining',
    tier: 1,
    category: 'river',

    requiredSkillLevel: 1,
    requiredTools: ['mining'],
    minToolTier: 1,

    baseHealth: 9,
    minHealth: 9,
    maxHealth: 9,

    harvestTime: 5.0,
    respawnTime: 45,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'clay', weight: 50, minYield: 2, maxYield: 5 },
        { itemId: 'flint', weight: 28, minYield: 1, maxYield: 2 },
        { itemId: 'copperiteOre', weight: 15, minYield: 1, maxYield: 1 },
        { itemId: 'goldFlakes', weight: 7, minYield: 1, maxYield: 1 }
    ],

    baseXP: 20,
    icon: '⛏️',
    color: '#78909C',
    regions: ['region_-3_-4'],
    tags: ['river', 'mining', 'tier1', 'cradle']
};

// FORAGING - Meadow Herb Patch (node_1_6)
NodeRegistry.production.node_1_6 = {
    id: 'node_1_6',
    name: 'Meadow Herb Patch',
    description: 'A sunny patch of meadow where edible greens and medicinal flowers grow abundantly.',
    nodeType: 'foraging',
    skill: 'foraging',
    tier: 1,
    category: 'meadow',

    requiredSkillLevel: 1,
    requiredTools: ['foraging'],
    minToolTier: 1,

    baseHealth: 9,
    minHealth: 9,
    maxHealth: 9,

    harvestTime: 3.0,
    respawnTime: 20,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'meadowGreens', weight: 50, minYield: 2, maxYield: 4 },
        { itemId: 'mintyHerb', weight: 35, minYield: 1, maxYield: 2 },
        { itemId: 'daypetalBloom', weight: 15, minYield: 1, maxYield: 1 }
    ],

    baseXP: 12,
    icon: '🌻',
    color: '#AED581',
    regions: ['region_-3_-4'],
    tags: ['meadow', 'foraging', 'tier1', 'cradle']
};

// ==========================================
// TIER 2+ - Future Regions (placeholder)
// ==========================================

// Higher tier nodes will be added here as content expands

console.log('🌲 Nodes registered: 6 production nodes');
