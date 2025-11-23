/**
 * MINING NODES - PRODUCTION
 *
 * Ore veins, stone deposits, and mineral resources
 */

// === TIER 1: STARTER ORES ===

NodeRegistry.production.riverbed = {
    id: "riverbed",
    name: "Riverbed",
    description: "A shallow riverbed rich with clay, flint, and occasional gold flakes",
    icon: "💎",

    nodeType: "mining",
    category: "ore_deposit",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 12,
    harvestTime: 3.0,
    respawnTime: 30,

    resourceTable: [
        {
            itemId: "clay",
            weight: 60,
            minYield: 1,
            maxYield: 3,
            skillScaling: true,
            itemDef: {
                id: 'clay',
                name: 'Clay',
                description: 'Soft, moldable clay. Used in pottery and construction.',
                icon: '🧱',
                iconPath: 'assets/icons/materials/clay.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 2,
                resourceType: 'mineral',
                gatherSkill: 'mining',
                tags: ['resource', 'mineral', 'crafting', 'construction']
            }
        },
        {
            itemId: "flint",
            weight: 39,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: 'flint',
                name: 'Flint',
                description: 'Sharp flint stone. Used for tools and starting fires.',
                icon: '🪨',
                iconPath: 'assets/icons/materials/flint.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 3,
                resourceType: 'stone',
                gatherSkill: 'mining',
                tags: ['resource', 'stone', 'crafting', 'tools']
            }
        },
        {
            itemId: "goldFlakes",
            weight: 1,
            minYield: 1,
            maxYield: 1,
            skillScaling: false,
            itemDef: {
                id: 'goldFlakes',
                name: 'Gold Flakes',
                description: 'Tiny flakes of gold found in riverbeds. Can be refined.',
                icon: '✨',
                iconPath: 'assets/icons/materials/gold-flakes.png',
                category: 'resource',
                rarity: 'uncommon',
                stackLimit: 100,
                value: 25,
                resourceType: 'precious_metal',
                gatherSkill: 'mining',
                tags: ['resource', 'metal', 'precious', 'valuable']
            }
        }
    ],

    rareDropTable: null,
    rareDropChance: 0,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 25,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#8B7355",
    harvestSound: "mining",
    particleEffect: "ore_sparkle",

    biomes: ["plains", "river", "starting_region"],
    spawnWeight: 100,

    discoveryWeight: 100,
    upgradeChance: 30,
    upgradeAmount: 2,

    requirements: {
        skill: "mining",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["pickaxe"],
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

    progressionPath: "basic_materials",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've discovered a riverbed!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.copper_vein = {
    id: "copper_vein",
    name: "Copper Vein",
    description: "A deposit of copper ore, perfect for early metalworking",
    icon: "🪨",

    nodeType: "mining",
    category: "ore_deposit",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 15,
    harvestTime: 3.0,
    respawnTime: 30,

    resourceTable: [
        { itemId: "copperOre", weight: 80, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "stone", weight: 20, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 5,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 25,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#cd7f32",
    harvestSound: "mining",
    particleEffect: "ore_sparkle",

    biomes: ["plains", "mountains", "hills"],
    spawnWeight: 100,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 30,
    upgradeAmount: 2,

    requirements: {
        skill: "mining",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["pickaxe"],
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

    progressionPath: "copper_series",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've discovered a copper vein!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.tin_vein = {
    id: "tin_vein",
    name: "Tin Vein",
    description: "A deposit of tin ore, used to create bronze",
    icon: "🪨",

    nodeType: "mining",
    category: "ore_deposit",

    tier: 1,
    requiredSkillLevel: 5,
    recommendedLevel: 3,

    baseHealth: 12,
    minHealth: 10,
    maxHealth: 18,
    harvestTime: 3.5,
    respawnTime: 35,

    resourceTable: [
        { itemId: "tinOre", weight: 75, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "stone", weight: 25, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 6,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 35,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#95a5a6",
    harvestSound: "mining",
    particleEffect: "ore_sparkle",

    biomes: ["plains", "mountains", "swamp"],
    spawnWeight: 80,
    spawnConditions: null,

    discoveryWeight: 80,
    upgradeChance: 30,
    upgradeAmount: 2,

    requirements: {
        skill: "mining",
        skillLevel: 5,
        characterLevel: 0,
        quests: [],
        tools: ["pickaxe"],
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

    progressionPath: "tin_series",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've discovered a tin vein!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 2: INTERMEDIATE ORES ===

NodeRegistry.production.iron_vein = {
    id: "iron_vein",
    name: "Iron Vein",
    description: "A rich deposit of iron ore, the backbone of civilization",
    icon: "⛏️",

    nodeType: "mining",
    category: "ore_deposit",

    tier: 2,
    requiredSkillLevel: 15,
    recommendedLevel: 10,

    baseHealth: 15,
    minHealth: 12,
    maxHealth: 22,
    harvestTime: 4.0,
    respawnTime: 45,

    resourceTable: [
        { itemId: "ore", weight: 70, minYield: 1, maxYield: 4, skillScaling: true },
        { itemId: "stone", weight: 20, minYield: 1, maxYield: 3, skillScaling: false },
        { itemId: "coal", weight: 10, minYield: 1, maxYield: 2, skillScaling: true }
    ],

    rareDropTable: null,
    rareDropChance: 8,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 50,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "uncommon",
    color: "#7f8c8d",
    harvestSound: "mining",
    particleEffect: "ore_sparkle",

    biomes: ["mountains", "hills", "underground"],
    spawnWeight: 70,
    spawnConditions: null,

    discoveryWeight: 60,
    upgradeChance: 35,
    upgradeAmount: 3,

    requirements: {
        skill: "mining",
        skillLevel: 15,
        characterLevel: 5,
        quests: [],
        tools: ["pickaxe"],
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

    progressionPath: "iron_series",
    nextTier: "steel_vein",
    previousTier: "copper_vein",
    unlockMessage: "You've discovered an iron vein!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.coal_deposit = {
    id: "coal_deposit",
    name: "Coal Deposit",
    description: "A dark seam of coal, essential for smelting",
    icon: "🪨",

    nodeType: "mining",
    category: "fuel_source",

    tier: 2,
    requiredSkillLevel: 10,
    recommendedLevel: 8,

    baseHealth: 20,
    minHealth: 15,
    maxHealth: 30,
    harvestTime: 2.5,
    respawnTime: 40,

    resourceTable: [
        { itemId: "coal", weight: 90, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "stone", weight: 10, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 5,

    yieldBonusPerLevel: 0.06,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.03,

    baseXP: 40,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#2c3e50",
    harvestSound: "mining",
    particleEffect: "dust_cloud",

    biomes: ["mountains", "underground", "hills"],
    spawnWeight: 90,
    spawnConditions: null,

    discoveryWeight: 70,
    upgradeChance: 40,
    upgradeAmount: 3,

    requirements: {
        skill: "mining",
        skillLevel: 10,
        characterLevel: 0,
        quests: [],
        tools: ["pickaxe"],
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

    progressionPath: "fuel_series",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've discovered a coal deposit!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 3: PRECIOUS METALS ===

NodeRegistry.production.silver_vein = {
    id: "silver_vein",
    name: "Silver Vein",
    description: "A gleaming vein of silver, valuable and rare",
    icon: "✨",

    nodeType: "mining",
    category: "precious_metal",

    tier: 3,
    requiredSkillLevel: 25,
    recommendedLevel: 18,

    baseHealth: 12,
    minHealth: 10,
    maxHealth: 18,
    harvestTime: 5.0,
    respawnTime: 60,

    resourceTable: [
        { itemId: "silverOre", weight: 85, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "stone", weight: 15, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 12,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 75,
    xpScaling: "linear",
    xpMultiplier: 1.2,

    rarity: "rare",
    color: "#c0c0c0",
    harvestSound: "mining",
    particleEffect: "silver_sparkle",

    biomes: ["mountains", "underground"],
    spawnWeight: 40,
    spawnConditions: null,

    discoveryWeight: 30,
    upgradeChance: 25,
    upgradeAmount: 2,

    requirements: {
        skill: "mining",
        skillLevel: 25,
        characterLevel: 12,
        quests: [],
        tools: ["pickaxe"],
        toolTier: 3
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: false,
    seasonalAvailability: null,

    progressionPath: "precious_metals",
    nextTier: "gold_vein",
    previousTier: null,
    unlockMessage: "You've discovered a silver vein!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.gold_vein = {
    id: "gold_vein",
    name: "Gold Vein",
    description: "A rich vein of gold ore, the most precious metal",
    icon: "💰",

    nodeType: "mining",
    category: "precious_metal",

    tier: 4,
    requiredSkillLevel: 35,
    recommendedLevel: 25,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 15,
    harvestTime: 6.0,
    respawnTime: 90,

    resourceTable: [
        { itemId: "goldOre", weight: 80, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "silverOre", weight: 15, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "stone", weight: 5, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 15,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 100,
    xpScaling: "linear",
    xpMultiplier: 1.5,

    rarity: "epic",
    color: "#ffd700",
    harvestSound: "mining",
    particleEffect: "gold_sparkle",

    biomes: ["mountains", "underground", "desert"],
    spawnWeight: 25,
    spawnConditions: null,

    discoveryWeight: 15,
    upgradeChance: 20,
    upgradeAmount: 2,

    requirements: {
        skill: "mining",
        skillLevel: 35,
        characterLevel: 20,
        quests: [],
        tools: ["pickaxe"],
        toolTier: 4
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: false,
    seasonalAvailability: null,

    progressionPath: "precious_metals",
    nextTier: null,
    previousTier: "silver_vein",
    unlockMessage: "You've struck gold! A precious vein discovered!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === COMMON RESOURCES ===

NodeRegistry.production.stone_outcrop = {
    id: "stone_outcrop",
    name: "Stone Outcrop",
    description: "A rocky outcrop perfect for gathering stone",
    icon: "🪨",

    nodeType: "mining",
    category: "stone_deposit",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 25,
    minHealth: 20,
    maxHealth: 35,
    harvestTime: 2.0,
    respawnTime: 20,

    resourceTable: [
        { itemId: "stone", weight: 100, minYield: 2, maxYield: 6, skillScaling: true }
    ],

    rareDropTable: null,
    rareDropChance: 3,

    yieldBonusPerLevel: 0.07,
    rareBonusPerLevel: 0.01,
    speedBonusPerLevel: 0.03,

    baseXP: 15,
    xpScaling: "linear",
    xpMultiplier: 0.8,

    rarity: "common",
    color: "#95a5a6",
    harvestSound: "mining",
    particleEffect: "dust_cloud",

    biomes: ["plains", "mountains", "hills", "desert"],
    spawnWeight: 150,
    spawnConditions: null,

    discoveryWeight: 120,
    upgradeChance: 45,
    upgradeAmount: 4,

    requirements: {
        skill: "mining",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["pickaxe"],
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

    progressionPath: "basic_materials",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've found a stone outcrop!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};
