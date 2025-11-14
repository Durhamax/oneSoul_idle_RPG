/**
 * THIEVING NODES - PRODUCTION
 *
 * Pickpocket targets, lockboxes, and trap disarming locations
 */

// === TIER 1: EASY MARKS ===

NodeRegistry.production.street_vendor = {
    id: "street_vendor",
    name: "Street Vendor",
    description: "An unsuspecting vendor - easy pickings for beginners",
    icon: "👤",

    nodeType: "thieving",
    category: "pickpocket",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 15,
    harvestTime: 4.0,
    respawnTime: 40,

    resourceTable: [
        { itemId: "coin", weight: 70, minYield: 5, maxYield: 15, skillScaling: true },
        { itemId: "bread", weight: 20, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "key", weight: 10, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 8,

    yieldBonusPerLevel: 0.06,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.03,

    baseXP: 20,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#757575",
    harvestSound: "thieving",
    particleEffect: "coin_sparkle",

    biomes: ["plains", "coast"],
    spawnWeight: 120,
    spawnConditions: null,

    discoveryWeight: 110,
    upgradeChance: 35,
    upgradeAmount: 2,

    requirements: {
        skill: "thieving",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: [],
        toolTier: 0
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: true,
    seasonalAvailability: null,

    progressionPath: "pickpocket_progression",
    nextTier: "traveling_merchant",
    previousTier: null,
    unlockMessage: "You've found an easy mark!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.simple_lockbox = {
    id: "simple_lockbox",
    name: "Simple Lockbox",
    description: "A poorly secured lockbox - perfect practice",
    icon: "🔒",

    nodeType: "thieving",
    category: "lockbox",

    tier: 1,
    requiredSkillLevel: 5,
    recommendedLevel: 3,

    baseHealth: 5,
    minHealth: 3,
    maxHealth: 8,
    harvestTime: 5.0,
    respawnTime: 50,

    resourceTable: [
        { itemId: "coin", weight: 60, minYield: 10, maxYield: 25, skillScaling: true },
        { itemId: "lockpick", weight: 25, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "jewelry", weight: 15, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 12,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 30,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#9e9e9e",
    harvestSound: "lockpicking",
    particleEffect: "lock_click",

    biomes: ["plains", "forest", "coast"],
    spawnWeight: 80,
    spawnConditions: null,

    discoveryWeight: 75,
    upgradeChance: 30,
    upgradeAmount: 1,

    requirements: {
        skill: "thieving",
        skillLevel: 5,
        characterLevel: 0,
        quests: [],
        tools: ["lockpick"],
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

    progressionPath: "lockbox_progression",
    nextTier: "reinforced_chest",
    previousTier: null,
    unlockMessage: "You've found a simple lockbox!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 2: MODERATE TARGETS ===

NodeRegistry.production.traveling_merchant = {
    id: "traveling_merchant",
    name: "Traveling Merchant",
    description: "A wealthy merchant carrying valuable goods",
    icon: "🎩",

    nodeType: "thieving",
    category: "pickpocket",

    tier: 2,
    requiredSkillLevel: 15,
    recommendedLevel: 10,

    baseHealth: 8,
    minHealth: 6,
    maxHealth: 12,
    harvestTime: 5.5,
    respawnTime: 55,

    resourceTable: [
        { itemId: "coin", weight: 60, minYield: 20, maxYield: 50, skillScaling: true },
        { itemId: "gem", weight: 20, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "jewelry", weight: 15, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "silk", weight: 5, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 15,

    yieldBonusPerLevel: 0.06,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 50,
    xpScaling: "linear",
    xpMultiplier: 1.2,

    rarity: "uncommon",
    color: "#616161",
    harvestSound: "thieving",
    particleEffect: "coin_sparkle",

    biomes: ["plains", "coast", "forest"],
    spawnWeight: 60,
    spawnConditions: null,

    discoveryWeight: 50,
    upgradeChance: 30,
    upgradeAmount: 2,

    requirements: {
        skill: "thieving",
        skillLevel: 15,
        characterLevel: 8,
        quests: [],
        tools: [],
        toolTier: 0
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: true,
    seasonalAvailability: null,

    progressionPath: "pickpocket_progression",
    nextTier: "noble_target",
    previousTier: "street_vendor",
    unlockMessage: "You've spotted a traveling merchant!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.reinforced_chest = {
    id: "reinforced_chest",
    name: "Reinforced Chest",
    description: "A well-secured chest requiring skill to open",
    icon: "📦",

    nodeType: "thieving",
    category: "lockbox",

    tier: 2,
    requiredSkillLevel: 20,
    recommendedLevel: 12,

    baseHealth: 4,
    minHealth: 3,
    maxHealth: 6,
    harvestTime: 7.0,
    respawnTime: 70,

    resourceTable: [
        { itemId: "coin", weight: 50, minYield: 30, maxYield: 75, skillScaling: true },
        { itemId: "jewelry", weight: 25, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "gem", weight: 15, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "rare_item", weight: 10, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 18,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.04,
    speedBonusPerLevel: 0.02,

    baseXP: 75,
    xpScaling: "linear",
    xpMultiplier: 1.3,

    rarity: "uncommon",
    color: "#795548",
    harvestSound: "lockpicking",
    particleEffect: "lock_click",

    biomes: ["plains", "mountains", "underground"],
    spawnWeight: 45,
    spawnConditions: null,

    discoveryWeight: 35,
    upgradeChance: 25,
    upgradeAmount: 1,

    requirements: {
        skill: "thieving",
        skillLevel: 20,
        characterLevel: 10,
        quests: [],
        tools: ["lockpick"],
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

    progressionPath: "lockbox_progression",
    nextTier: "master_safe",
    previousTier: "simple_lockbox",
    unlockMessage: "You've found a reinforced chest!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.trapped_mechanism = {
    id: "trapped_mechanism",
    name: "Trapped Mechanism",
    description: "A dangerous trapped mechanism - disarm for rewards",
    icon: "⚙️",

    nodeType: "thieving",
    category: "trap_disarm",

    tier: 2,
    requiredSkillLevel: 18,
    recommendedLevel: 12,

    baseHealth: 6,
    minHealth: 4,
    maxHealth: 9,
    harvestTime: 6.0,
    respawnTime: 60,

    resourceTable: [
        { itemId: "mechanism_part", weight: 50, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "coin", weight: 30, minYield: 15, maxYield: 40, skillScaling: true },
        { itemId: "spring", weight: 15, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "gear", weight: 5, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 15,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 65,
    xpScaling: "linear",
    xpMultiplier: 1.25,

    rarity: "uncommon",
    color: "#ff6f00",
    harvestSound: "mechanism",
    particleEffect: "gear_spin",

    biomes: ["underground", "mountains"],
    spawnWeight: 50,
    spawnConditions: null,

    discoveryWeight: 40,
    upgradeChance: 28,
    upgradeAmount: 2,

    requirements: {
        skill: "thieving",
        skillLevel: 18,
        characterLevel: 10,
        quests: [],
        tools: ["toolkit"],
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

    progressionPath: "trap_progression",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've found a trapped mechanism!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 3: DIFFICULT TARGETS ===

NodeRegistry.production.noble_target = {
    id: "noble_target",
    name: "Noble Target",
    description: "A wealthy noble - high risk, high reward",
    icon: "👑",

    nodeType: "thieving",
    category: "pickpocket",

    tier: 3,
    requiredSkillLevel: 30,
    recommendedLevel: 20,

    baseHealth: 5,
    minHealth: 4,
    maxHealth: 8,
    harvestTime: 7.0,
    respawnTime: 80,

    resourceTable: [
        { itemId: "coin", weight: 50, minYield: 50, maxYield: 150, skillScaling: true },
        { itemId: "gem", weight: 25, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "jewelry", weight: 20, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "signet_ring", weight: 5, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 20,

    yieldBonusPerLevel: 0.07,
    rareBonusPerLevel: 0.04,
    speedBonusPerLevel: 0.02,

    baseXP: 100,
    xpScaling: "linear",
    xpMultiplier: 1.5,

    rarity: "rare",
    color: "#ffd700",
    harvestSound: "thieving",
    particleEffect: "gold_sparkle",

    biomes: ["plains", "coast"],
    spawnWeight: 25,
    spawnConditions: null,

    discoveryWeight: 20,
    upgradeChance: 20,
    upgradeAmount: 1,

    requirements: {
        skill: "thieving",
        skillLevel: 30,
        characterLevel: 18,
        quests: [],
        tools: [],
        toolTier: 0
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: true,
    seasonalAvailability: null,

    progressionPath: "pickpocket_progression",
    nextTier: null,
    previousTier: "traveling_merchant",
    unlockMessage: "You've spotted a wealthy noble - be careful!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.master_safe = {
    id: "master_safe",
    name: "Master Safe",
    description: "An expertly crafted safe - only masters can crack it",
    icon: "🔐",

    nodeType: "thieving",
    category: "lockbox",

    tier: 3,
    requiredSkillLevel: 35,
    recommendedLevel: 22,

    baseHealth: 3,
    minHealth: 2,
    maxHealth: 5,
    harvestTime: 10.0,
    respawnTime: 120,

    resourceTable: [
        { itemId: "coin", weight: 40, minYield: 100, maxYield: 250, skillScaling: true },
        { itemId: "gem", weight: 30, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "jewelry", weight: 20, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "rare_artifact", weight: 10, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 25,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.05,
    speedBonusPerLevel: 0.02,

    baseXP: 150,
    xpScaling: "linear",
    xpMultiplier: 1.8,

    rarity: "rare",
    color: "#1a237e",
    harvestSound: "lockpicking",
    particleEffect: "lock_break",

    biomes: ["plains", "underground"],
    spawnWeight: 15,
    spawnConditions: null,

    discoveryWeight: 10,
    upgradeChance: 15,
    upgradeAmount: 1,

    requirements: {
        skill: "thieving",
        skillLevel: 35,
        characterLevel: 20,
        quests: [],
        tools: ["lockpick"],
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

    progressionPath: "lockbox_progression",
    nextTier: null,
    previousTier: "reinforced_chest",
    unlockMessage: "You've discovered a master safe!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};
