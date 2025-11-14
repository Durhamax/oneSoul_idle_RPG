/**
 * LOGGING NODES - PRODUCTION
 *
 * Trees, lumber sources, and wood resources
 */

// === TIER 1: BASIC TREES ===

NodeRegistry.production.oak_tree = {
    id: "oak_tree",
    name: "Oak Tree",
    description: "A sturdy oak tree with strong, versatile wood",
    icon: "🌳",

    nodeType: "logging",
    category: "hardwood_tree",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 12,
    minHealth: 10,
    maxHealth: 18,
    harvestTime: 3.5,
    respawnTime: 45,

    resourceTable: [
        { itemId: "wood", weight: 85, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "stick", weight: 15, minYield: 1, maxYield: 3, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 8,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 30,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#8b4513",
    harvestSound: "logging",
    particleEffect: "wood_chips",

    biomes: ["forest", "plains", "hills"],
    spawnWeight: 120,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 35,
    upgradeAmount: 3,

    requirements: {
        skill: "logging",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["axe", "hatchet"],
        toolTier: 1
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: false,
    seasonalAvailability: null,

    progressionPath: "basic_lumber",
    nextTier: "willow_tree",
    previousTier: null,
    unlockMessage: "You've found an oak tree!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.pine_tree = {
    id: "pine_tree",
    name: "Pine Tree",
    description: "A tall pine tree, perfect for construction lumber",
    icon: "🌲",

    nodeType: "logging",
    category: "softwood_tree",

    tier: 1,
    requiredSkillLevel: 5,
    recommendedLevel: 3,

    baseHealth: 15,
    minHealth: 12,
    maxHealth: 22,
    harvestTime: 3.0,
    respawnTime: 40,

    resourceTable: [
        { itemId: "wood", weight: 90, minYield: 3, maxYield: 6, skillScaling: true },
        { itemId: "pinecone", weight: 10, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 6,

    yieldBonusPerLevel: 0.06,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.03,

    baseXP: 28,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#2e7d32",
    harvestSound: "logging",
    particleEffect: "wood_chips",

    biomes: ["forest", "mountains", "tundra"],
    spawnWeight: 110,
    spawnConditions: null,

    discoveryWeight: 90,
    upgradeChance: 40,
    upgradeAmount: 3,

    requirements: {
        skill: "logging",
        skillLevel: 5,
        characterLevel: 0,
        quests: [],
        tools: ["axe", "hatchet"],
        toolTier: 1
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: false,
    seasonalAvailability: null,

    progressionPath: "basic_lumber",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've found a pine tree!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 2: EXOTIC TREES ===

NodeRegistry.production.willow_tree = {
    id: "willow_tree",
    name: "Willow Tree",
    description: "A graceful willow with flexible, useful branches",
    icon: "🌳",

    nodeType: "logging",
    category: "softwood_tree",

    tier: 2,
    requiredSkillLevel: 15,
    recommendedLevel: 10,

    baseHealth: 18,
    minHealth: 15,
    maxHealth: 25,
    harvestTime: 4.0,
    respawnTime: 50,

    resourceTable: [
        { itemId: "willow_wood", weight: 80, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "wood", weight: 15, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "willow_branch", weight: 5, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 10,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 55,
    xpScaling: "linear",
    xpMultiplier: 1.1,

    rarity: "uncommon",
    color: "#7cb342",
    harvestSound: "logging",
    particleEffect: "wood_chips",

    biomes: ["forest", "swamp", "river"],
    spawnWeight: 60,
    spawnConditions: null,

    discoveryWeight: 50,
    upgradeChance: 30,
    upgradeAmount: 3,

    requirements: {
        skill: "logging",
        skillLevel: 15,
        characterLevel: 8,
        quests: [],
        tools: ["axe"],
        toolTier: 2
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: false,
    seasonalAvailability: null,

    progressionPath: "exotic_lumber",
    nextTier: "maple_tree",
    previousTier: "oak_tree",
    unlockMessage: "You've found a willow tree!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.maple_tree = {
    id: "maple_tree",
    name: "Maple Tree",
    description: "A beautiful maple tree with valuable hardwood",
    icon: "🍁",

    nodeType: "logging",
    category: "hardwood_tree",

    tier: 3,
    requiredSkillLevel: 25,
    recommendedLevel: 18,

    baseHealth: 20,
    minHealth: 16,
    maxHealth: 28,
    harvestTime: 5.0,
    respawnTime: 60,

    resourceTable: [
        { itemId: "maple_wood", weight: 75, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "wood", weight: 20, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "maple_sap", weight: 5, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 12,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 80,
    xpScaling: "linear",
    xpMultiplier: 1.3,

    rarity: "rare",
    color: "#d32f2f",
    harvestSound: "logging",
    particleEffect: "wood_chips",

    biomes: ["forest", "hills"],
    spawnWeight: 40,
    spawnConditions: null,

    discoveryWeight: 30,
    upgradeChance: 25,
    upgradeAmount: 3,

    requirements: {
        skill: "logging",
        skillLevel: 25,
        characterLevel: 15,
        quests: [],
        tools: ["axe"],
        toolTier: 3
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: false,
    seasonalAvailability: ["spring", "fall"],

    progressionPath: "exotic_lumber",
    nextTier: null,
    previousTier: "willow_tree",
    unlockMessage: "You've found a majestic maple tree!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};
