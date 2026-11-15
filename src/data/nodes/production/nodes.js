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
        { itemId: 'auroranTuber', weight: 7, minYield: 1, maxYield: 1 }
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
        { itemId: 'clay', weight: 53, minYield: 2, maxYield: 5 },
        { itemId: 'flint', weight: 30, minYield: 1, maxYield: 2 },
        { itemId: 'copperiteOre', weight: 15, minYield: 1, maxYield: 1 },
        { itemId: 'goldFlakes', weight: 2, minYield: 1, maxYield: 1 }
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
// TIER 2 - SCOUTREACH (region_-2_-3) — arms gateway
// ==========================================

// MINING - Scoutreach Peat Bog (propellant stock)
NodeRegistry.production.node_scoutreachBog = {
    id: 'node_scoutreachBog',
    name: 'Scoutreach Peat Bog',
    description: 'A sour, crusted bog on the edge of Scoutreach. Centuries of decay have concentrated saltpeter and sulfur in the peat — the makings of powder.',
    nodeType: 'mining',
    skill: 'mining',
    tier: 2,
    category: 'wetland',

    requiredSkillLevel: 8,
    requiredTools: ['mining'],
    minToolTier: 1,

    baseHealth: 12,
    minHealth: 12,
    maxHealth: 12,

    harvestTime: 5.0,
    respawnTime: 45,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'bogNiter', weight: 48, minYield: 1, maxYield: 3 },
        { itemId: 'bogSulfur', weight: 38, minYield: 1, maxYield: 2 },
        { itemId: 'clay', weight: 14, minYield: 1, maxYield: 2 }
    ],

    baseXP: 26,
    icon: '⛏️',
    color: '#6D4C41',
    regions: ['region_-2_-3'],
    tags: ['wetland', 'mining', 'tier2', 'scoutreach', 'propellant']
};

// FORAGING - Bog Mosses (chemistry reagents)
NodeRegistry.production.node_scoutreachMoss = {
    id: 'node_scoutreachMoss',
    name: 'Bog Mosses',
    description: 'Thick peat moss and aromatic bog myrtle crowd the wet ground. Chemists prize both as reagents and binders.',
    nodeType: 'foraging',
    skill: 'foraging',
    tier: 2,
    category: 'wetland',

    requiredSkillLevel: 8,
    requiredTools: ['foraging'],
    minToolTier: 1,

    baseHealth: 11,
    minHealth: 11,
    maxHealth: 11,

    harvestTime: 3.5,
    respawnTime: 30,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'peatMoss', weight: 60, minYield: 1, maxYield: 3 },
        { itemId: 'bogMyrtle', weight: 40, minYield: 1, maxYield: 2 }
    ],

    baseXP: 22,
    icon: '🌿',
    color: '#66BB6A',
    regions: ['region_-2_-3'],
    tags: ['wetland', 'foraging', 'tier2', 'scoutreach', 'chemistry']
};

// HUNTING - Scoutreach Game Trail (ranging furs)
NodeRegistry.production.node_scoutreachGame = {
    id: 'node_scoutreachGame',
    name: 'Scoutreach Game Trail',
    description: 'Larger game ranges the scrubland past the outpost. Their thick hides make proper all-terrain ranging gear.',
    nodeType: 'hunting',
    skill: 'hunting',
    tier: 2,
    category: 'land',

    requiredSkillLevel: 10,
    requiredTools: ['hunting'],
    minToolTier: 1,

    baseHealth: 12,
    minHealth: 12,
    maxHealth: 12,

    harvestTime: 5.5,
    respawnTime: 50,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'smallGameMeat', weight: 45, minYield: 1, maxYield: 2 },
        { itemId: 'rangerPelt', weight: 40, minYield: 1, maxYield: 2 },
        { itemId: 'smallPelts', weight: 15, minYield: 1, maxYield: 1 }
    ],

    baseXP: 28,
    icon: '🦌',
    color: '#8D6E63',
    regions: ['region_-2_-3'],
    tags: ['land', 'hunting', 'tier2', 'scoutreach']
};

// THIEVING - Elaran Forward Supply Cache (Thieving intro)
NodeRegistry.production.node_elaranSupplyCache = {
    id: 'node_elaranSupplyCache',
    name: 'Elaran Supply Cache',
    description: 'A locked forward-supply crate at the Elaran survey camp. Pick it and help yourself to their kit — and their secrets.',
    nodeType: 'thieving',
    skill: 'thieving',
    tier: 2,
    category: 'plunder',

    requiredSkillLevel: 1,
    requiredTools: ['lockpicking'],
    minToolTier: 1,

    baseHealth: 10,
    minHealth: 10,
    maxHealth: 10,

    harvestTime: 5.0,
    respawnTime: 60,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'scrapAlloy', weight: 34, minYield: 1, maxYield: 2 },
        { itemId: 'salvagedWiring', weight: 26, minYield: 1, maxYield: 2 },
        { itemId: 'droneParts', weight: 16, minYield: 1, maxYield: 1 },
        { itemId: 'elaran6mmRounds', weight: 12, minYield: 1, maxYield: 1 },
        { itemId: 'droneDataCore', weight: 7, minYield: 1, maxYield: 1 },
        { itemId: 'elaran6mmDefender', weight: 3, minYield: 1, maxYield: 1 },
        { itemId: 'elaranIssuePlate', weight: 2, minYield: 1, maxYield: 1 }
    ],

    baseXP: 34,
    icon: '🔓',
    color: '#B39DDB',
    regions: ['region_-2_-3'],
    tags: ['plunder', 'thieving', 'tier2', 'scoutreach', 'elaran']
};

// THIEVING - Disabled Survey Drone (strip for salvage + data)
NodeRegistry.production.node_disabledDrone = {
    id: 'node_disabledDrone',
    name: 'Disabled Survey Drone',
    description: 'A survey drone brought down and left where it fell. Carefully stripped, it gives up parts, a live cell, and its sealed data core.',
    nodeType: 'thieving',
    skill: 'thieving',
    tier: 2,
    category: 'plunder',

    requiredSkillLevel: 5,
    requiredTools: ['lockpicking'],
    minToolTier: 1,

    baseHealth: 10,
    minHealth: 10,
    maxHealth: 10,

    harvestTime: 5.5,
    respawnTime: 70,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'droneParts', weight: 38, minYield: 1, maxYield: 2 },
        { itemId: 'salvagedSensor', weight: 24, minYield: 1, maxYield: 1 },
        { itemId: 'powerCell', weight: 20, minYield: 1, maxYield: 1 },
        { itemId: 'droneDataCore', weight: 18, minYield: 1, maxYield: 1 }
    ],

    baseXP: 32,
    icon: '🔓',
    color: '#B39DDB',
    regions: ['region_-2_-3'],
    tags: ['plunder', 'thieving', 'tier2', 'scoutreach', 'elaran']
};

// ==========================================
// TIER 2 - VERDUUN FOREST (South -3_-3, West -4_-3)
// ==========================================

// LOGGING - Verduun Old-Growth (shared across Verduun forest)
NodeRegistry.production.node_verduunHardwood = {
    id: 'node_verduunHardwood',
    name: 'Verduun Old-Growth',
    description: 'Dense stands of slow-grown hardwood in the abandoned Unity woods. The timber is harder and heavier than anything near the Cradle.',
    nodeType: 'logging',
    skill: 'logging',
    tier: 2,
    category: 'forest',

    requiredSkillLevel: 12,
    requiredTools: ['logging'],
    minToolTier: 1,

    baseHealth: 12,
    minHealth: 12,
    maxHealth: 12,

    harvestTime: 5.0,
    respawnTime: 60,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'verduunHardwood', weight: 55, minYield: 1, maxYield: 3 },
        { itemId: 'pinewood', weight: 30, minYield: 1, maxYield: 2 },
        { itemId: 'resin', weight: 15, minYield: 1, maxYield: 1 }
    ],

    baseXP: 24,
    icon: '🪓',
    color: '#6D4C41',
    regions: ['region_-3_-3', 'region_-4_-3'],
    tags: ['forest', 'logging', 'tier2', 'verduun']
};

// FORAGING - Verduun Forest Floor (shared)
NodeRegistry.production.node_verduunForage = {
    id: 'node_verduunForage',
    name: 'Verduun Forest Floor',
    description: 'Fern shoots, herbs and fungi carpet the shaded floor of the old Unity woods.',
    nodeType: 'foraging',
    skill: 'foraging',
    tier: 2,
    category: 'forest',

    requiredSkillLevel: 12,
    requiredTools: ['foraging'],
    minToolTier: 1,

    baseHealth: 11,
    minHealth: 11,
    maxHealth: 11,

    harvestTime: 3.5,
    respawnTime: 30,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'verduunFernshoot', weight: 50, minYield: 1, maxYield: 3 },
        { itemId: 'mintyHerb', weight: 30, minYield: 1, maxYield: 2 },
        { itemId: 'commonMushrooms', weight: 20, minYield: 1, maxYield: 2 }
    ],

    baseXP: 20,
    icon: '🌿',
    color: '#81C784',
    regions: ['region_-3_-3', 'region_-4_-3'],
    tags: ['forest', 'foraging', 'tier2', 'verduun']
};

// HUNTING - Verduun Thickets (shared)
NodeRegistry.production.node_verduunGame = {
    id: 'node_verduunGame',
    name: 'Verduun Thickets',
    description: 'Boar and prowling predators hold the overgrown Unity woods. Dangerous ground, good hides and meat.',
    nodeType: 'hunting',
    skill: 'hunting',
    tier: 2,
    category: 'forest',

    requiredSkillLevel: 14,
    requiredTools: ['hunting'],
    minToolTier: 1,

    baseHealth: 13,
    minHealth: 13,
    maxHealth: 13,

    harvestTime: 5.5,
    respawnTime: 55,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'smallGameMeat', weight: 45, minYield: 1, maxYield: 2 },
        { itemId: 'rangerPelt', weight: 30, minYield: 1, maxYield: 1 },
        { itemId: 'smallPelts', weight: 25, minYield: 1, maxYield: 2 }
    ],

    baseXP: 26,
    icon: '🦌',
    color: '#8D6E63',
    regions: ['region_-3_-3', 'region_-4_-3'],
    tags: ['forest', 'hunting', 'tier2', 'verduun']
};

// ==========================================
// TIER 2 - VERDUUN NORTH (region_-3_-2) — overgrown war trenches
// ==========================================

// MINING - Overgrown Trenches (war salvage → heavy-armor stock)
NodeRegistry.production.node_trenchSalvage = {
    id: 'node_trenchSalvage',
    name: 'Overgrown Trenches',
    description: 'The collapsed war trenches of Verduun North, five centuries under dirt and root. Dig carefully and the old war yields its metal.',
    nodeType: 'mining',
    skill: 'mining',
    tier: 2,
    category: 'ruins',

    requiredSkillLevel: 18,
    requiredTools: ['mining'],
    minToolTier: 1,

    baseHealth: 14,
    minHealth: 14,
    maxHealth: 14,

    harvestTime: 6.0,
    respawnTime: 60,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'corrodedPlating', weight: 42, minYield: 1, maxYield: 2 },
        { itemId: 'scrapAlloy', weight: 33, minYield: 1, maxYield: 2 },
        { itemId: 'copperiteOre', weight: 25, minYield: 1, maxYield: 1 }
    ],

    baseXP: 30,
    icon: '⛏️',
    color: '#78909C',
    regions: ['region_-3_-2'],
    tags: ['ruins', 'mining', 'tier2', 'verduun', 'war-salvage']
};

// ==========================================
// TIER 2 - WEST COAST (region_-4_-4) — saltwater, shoals, dunes
// ==========================================

// FISHING - Tidal Shoals (shellfish)
NodeRegistry.production.node_tidalShoals = {
    id: 'node_tidalShoals',
    name: 'Tidal Shoals',
    description: 'Shallow shoals west of the Cradle where mussels and clams cling to the rocks and small fish dart the eelgrass.',
    nodeType: 'fishing',
    skill: 'fishing',
    tier: 2,
    category: 'water',

    requiredSkillLevel: 12,
    requiredTools: ['fishing'],
    minToolTier: 1,

    baseHealth: 12,
    minHealth: 12,
    maxHealth: 12,

    harvestTime: 4.5,
    respawnTime: 40,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'shellfish', weight: 45, minYield: 1, maxYield: 2 },
        { itemId: 'solfish', weight: 40, minYield: 1, maxYield: 2 },
        { itemId: 'minnows', weight: 15, minYield: 1, maxYield: 2 }
    ],

    baseXP: 24,
    icon: '🎣',
    color: '#4FC3F7',
    regions: ['region_-4_-4'],
    tags: ['water', 'fishing', 'tier2', 'coast']
};

// FORAGING - Kelp Beds (coastal greens)
NodeRegistry.production.node_kelpBeds = {
    id: 'node_kelpBeds',
    name: 'Kelp Beds',
    description: 'Ribbons of kelp and hardy saltherb wash up along the dune line. Edible, and useful at the chemistry bench.',
    nodeType: 'foraging',
    skill: 'foraging',
    tier: 2,
    category: 'coast',

    requiredSkillLevel: 13,
    requiredTools: ['foraging'],
    minToolTier: 1,

    baseHealth: 11,
    minHealth: 11,
    maxHealth: 11,

    harvestTime: 3.5,
    respawnTime: 30,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'kelpFrond', weight: 55, minYield: 1, maxYield: 3 },
        { itemId: 'saltherb', weight: 45, minYield: 1, maxYield: 2 }
    ],

    baseXP: 20,
    icon: '🌿',
    color: '#4DB6AC',
    regions: ['region_-4_-4'],
    tags: ['coast', 'foraging', 'tier2']
};

// MINING - Salt Pans (evaporite flats)
NodeRegistry.production.node_saltPans = {
    id: 'node_saltPans',
    name: 'Salt Pans',
    description: 'Evaporite flats behind the dunes, crusted white. Rake the pans for sea salt and quarry the harder saltstone.',
    nodeType: 'mining',
    skill: 'mining',
    tier: 2,
    category: 'coast',

    requiredSkillLevel: 14,
    requiredTools: ['mining'],
    minToolTier: 1,

    baseHealth: 12,
    minHealth: 12,
    maxHealth: 12,

    harvestTime: 5.0,
    respawnTime: 40,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'seaSalt', weight: 55, minYield: 1, maxYield: 3 },
        { itemId: 'saltstone', weight: 45, minYield: 1, maxYield: 2 }
    ],

    baseXP: 22,
    icon: '⛏️',
    color: '#B0BEC5',
    regions: ['region_-4_-4'],
    tags: ['coast', 'mining', 'tier2']
};

// LOGGING - Driftwood Line (dune fuel/stock)
NodeRegistry.production.node_driftwood = {
    id: 'node_driftwood',
    name: 'Driftwood Line',
    description: 'Sun-bleached timber heaped along the tide line. Dry, light, and quick to work.',
    nodeType: 'logging',
    skill: 'logging',
    tier: 2,
    category: 'coast',

    requiredSkillLevel: 10,
    requiredTools: ['logging'],
    minToolTier: 1,

    baseHealth: 10,
    minHealth: 10,
    maxHealth: 10,

    harvestTime: 4.0,
    respawnTime: 35,
    harvestsPerCapacity: 3,

    resourceTable: [
        { itemId: 'driftwood', weight: 70, minYield: 2, maxYield: 4 },
        { itemId: 'pinewood', weight: 30, minYield: 1, maxYield: 2 }
    ],

    baseXP: 18,
    icon: '🪓',
    color: '#A1887F',
    regions: ['region_-4_-4'],
    tags: ['coast', 'logging', 'tier2']
};

// Higher tier nodes will be added here as content expands

console.log('🌲 Nodes registered: 6 Cradle + 14 tier-2 production nodes');
