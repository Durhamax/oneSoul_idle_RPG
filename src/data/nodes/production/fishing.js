/**
 * FISHING NODES - PRODUCTION
 *
 * Fishing spots, water resources, and aquatic locations
 */

// === TIER 1: COMMON SPOTS ===

NodeRegistry.production.cradle_lake_shallows = {
    id: "cradle_lake_shallows",
    name: "Cradle Lake Shallows",
    description: "Shallow waters of Cradle Lake, teeming with solfish",
    icon: "🎣",

    nodeType: "fishing",
    category: "fish_spot",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 8,
    minHealth: 6,
    maxHealth: 10,
    harvestTime: 2.5,
    respawnTime: 25,

    resourceTable: [
        {
            itemId: "solfish",
            weight: 100,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: 'solfish',
                name: 'Solfish',
                description: 'Small freshwater fish found in shallow waters. Can be cooked or sold.',
                icon: '🐟',
                iconPath: 'assets/icons/materials/solfish.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 4,
                resourceType: 'fish',
                gatherSkill: 'fishing',
                tags: ['resource', 'fish', 'food', 'cooking']
            }
        }
    ],

    rareDropTable: null,
    rareDropChance: 0,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 20,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#4FC3F7",
    harvestSound: "fishing",
    particleEffect: "water_splash",

    biomes: ["plains", "lake", "starting_region"],
    spawnWeight: 100,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 35,
    upgradeAmount: 3,

    requirements: {
        skill: "fishing",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["fishing"],
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

    progressionPath: "freshwater_fishing",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've discovered the Cradle Lake Shallows!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.pond_fishing_spot = {
    id: "pond_fishing_spot",
    name: "Calm Pond",
    description: "A tranquil pond teeming with small fish",
    icon: "🎣",

    nodeType: "fishing",
    category: "freshwater",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 20,
    minHealth: 15,
    maxHealth: 30,
    harvestTime: 4.0,
    respawnTime: 30,

    resourceTable: [
        { itemId: "minnow", weight: 60, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "trout", weight: 30, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "seaweed", weight: 10, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 10,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 20,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#2196f3",
    harvestSound: "fishing",
    particleEffect: "water_splash",

    biomes: ["plains", "forest"],
    spawnWeight: 100,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 40,
    upgradeAmount: 4,

    requirements: {
        skill: "fishing",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["fishing_rod", "fishing_net"],
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

    progressionPath: "freshwater_fishing",
    nextTier: "river_fishing_spot",
    previousTier: null,
    unlockMessage: "You've found a calm pond!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.river_fishing_spot = {
    id: "river_fishing_spot",
    name: "Flowing River",
    description: "A rushing river with larger, more challenging fish",
    icon: "🌊",

    nodeType: "fishing",
    category: "freshwater",

    tier: 2,
    requiredSkillLevel: 15,
    recommendedLevel: 10,

    baseHealth: 25,
    minHealth: 20,
    maxHealth: 35,
    harvestTime: 5.0,
    respawnTime: 40,

    resourceTable: [
        { itemId: "bass", weight: 45, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "salmon", weight: 35, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "trout", weight: 15, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "river_pearl", weight: 5, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 12,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 50,
    xpScaling: "linear",
    xpMultiplier: 1.2,

    rarity: "uncommon",
    color: "#1976d2",
    harvestSound: "fishing",
    particleEffect: "water_splash",

    biomes: ["forest", "mountains", "plains"],
    spawnWeight: 70,
    spawnConditions: null,

    discoveryWeight: 60,
    upgradeChance: 35,
    upgradeAmount: 4,

    requirements: {
        skill: "fishing",
        skillLevel: 15,
        characterLevel: 8,
        quests: [],
        tools: ["fishing_rod"],
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

    progressionPath: "freshwater_fishing",
    nextTier: null,
    previousTier: "pond_fishing_spot",
    unlockMessage: "You've found a flowing river!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.ocean_fishing_spot = {
    id: "ocean_fishing_spot",
    name: "Open Ocean",
    description: "The vast ocean, home to the largest catches",
    icon: "🌊",

    nodeType: "fishing",
    category: "saltwater",

    tier: 3,
    requiredSkillLevel: 30,
    recommendedLevel: 20,

    baseHealth: 30,
    minHealth: 25,
    maxHealth: 45,
    harvestTime: 6.0,
    respawnTime: 60,

    resourceTable: [
        { itemId: "tuna", weight: 40, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "swordfish", weight: 30, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "shark", weight: 20, minYield: 1, maxYield: 1, skillScaling: true },
        { itemId: "pearl", weight: 10, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 15,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 100,
    xpScaling: "linear",
    xpMultiplier: 1.5,

    rarity: "rare",
    color: "#0d47a1",
    harvestSound: "fishing",
    particleEffect: "water_splash",

    biomes: ["ocean", "coast"],
    spawnWeight: 40,
    spawnConditions: null,

    discoveryWeight: 25,
    upgradeChance: 30,
    upgradeAmount: 5,

    requirements: {
        skill: "fishing",
        skillLevel: 30,
        characterLevel: 18,
        quests: [],
        tools: ["fishing_rod"],
        toolTier: 4
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: true,
    timeDependent: false,
    seasonalAvailability: null,

    progressionPath: "saltwater_fishing",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've reached the open ocean!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};
