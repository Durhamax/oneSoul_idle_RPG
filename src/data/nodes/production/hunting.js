/**
 * HUNTING NODES - PRODUCTION
 *
 * Animal hunting grounds and wildlife zones
 */

// === TIER 1: SMALL GAME ===

NodeRegistry.production.cradle_woodlands = {
    id: "cradle_woodlands",
    name: "Cradle Woodlands",
    description: "A peaceful woodland area inhabited by hexapod alcapas and wild birds",
    icon: "🌳",

    nodeType: "hunting",
    category: "small_game",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 18,
    minHealth: 15,
    maxHealth: 25,
    harvestTime: 3.2,
    respawnTime: 32,

    resourceTable: [
        {
            itemId: "wild_chicken_feathers",
            weight: 75,
            minYield: 10,
            maxYield: 10,
            skillScaling: false,
            itemDef: {
                id: "wild_chicken_feathers",
                name: "Wild Chicken Feathers",
                description: "Wing feathers from wild birds. Found in bunches, useful for fletching arrows.",
                icon: "🪶",
                category: "material",
                subcategory: "animal_part",
                itemType: "resource",
                rarity: "common",
                stackLimit: 100,
                value: 2,
                resourceType: "feather",
                gatherSkill: "hunting",
                gatherLevel: 1,
                craftingUse: "fletching",
                tags: ["material", "feather", "hunting", "fletching", "arrows", "crafting"]
            }
        },
        {
            itemId: "alcapa_hide",
            weight: 15,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: "alcapa_hide",
                name: "Alcapa Hide",
                description: "Soft, furred hide from a hexapod alcapa. Perfect for crafting leather clothing.",
                icon: "🦙",
                category: "material",
                subcategory: "leather",
                itemType: "resource",
                rarity: "common",
                stackLimit: 100,
                value: 8,
                resourceType: "hide",
                gatherSkill: "hunting",
                gatherLevel: 1,
                craftingUse: "leatherworking",
                tags: ["material", "hide", "leather", "hunting", "clothing", "crafting"]
            }
        },
        {
            itemId: "sinew",
            weight: 10,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: "sinew",
                name: "Sinew",
                description: "Tough animal ligaments. Essential for crafting bowstrings and reinforced seams.",
                icon: "🧵",
                iconPath: "assets/icons/materials/sinew.png",
                category: "material",
                subcategory: "animal_part",
                itemType: "resource",
                rarity: "common",
                stackLimit: 100,
                value: 5,
                resourceType: "sinew",
                gatherSkill: "hunting",
                gatherLevel: 1,
                craftingUse: "bowstrings_sewing",
                tags: ["material", "sinew", "hunting", "bowstrings", "sewing", "crafting"]
            }
        }
    ],

    rareDropTable: null,
    rareDropChance: 5,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.03,

    baseXP: 20,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#558b2f",
    harvestSound: "hunting",
    particleEffect: "feathers",

    biomes: ["plains", "forest"],
    spawnWeight: 105,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 38,
    upgradeAmount: 3,

    requirements: {
        skill: "hunting",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["hunting"],
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

    progressionPath: "small_game",
    nextTier: "rabbit_burrow",
    previousTier: null,
    unlockMessage: "You've found the Cradle Woodlands, home to alcapas and wild birds!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "Region 1 lvl 1 hunting node - primary source of feathers, hide, and sinew",
    customData: {}
};

NodeRegistry.production.rabbit_burrow = {
    id: "rabbit_burrow",
    name: "Rabbit Burrow",
    description: "A burrow where rabbits can be hunted",
    icon: "🐰",

    nodeType: "hunting",
    category: "small_game",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 15,
    minHealth: 12,
    maxHealth: 22,
    harvestTime: 3.5,
    respawnTime: 35,

    resourceTable: [
        { itemId: "rawMeat", weight: 70, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "hide", weight: 20, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "bone", weight: 10, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 8,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.02,

    baseXP: 25,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#8d6e63",
    harvestSound: "hunting",
    particleEffect: "feathers",

    biomes: ["plains", "forest", "hills"],
    spawnWeight: 110,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 35,
    upgradeAmount: 3,

    requirements: {
        skill: "hunting",
        skillLevel: 1,
        characterLevel: 0,
        quests: [],
        tools: ["hunting"],
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

    progressionPath: "small_game",
    nextTier: "deer_trail",
    previousTier: null,
    unlockMessage: "You've found a rabbit burrow!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 2: MEDIUM GAME ===

NodeRegistry.production.deer_trail = {
    id: "deer_trail",
    name: "Deer Trail",
    description: "A well-worn deer trail through the wilderness",
    icon: "🦌",

    nodeType: "hunting",
    category: "medium_game",

    tier: 2,
    requiredSkillLevel: 15,
    recommendedLevel: 10,

    baseHealth: 12,
    minHealth: 10,
    maxHealth: 18,
    harvestTime: 5.0,
    respawnTime: 50,

    resourceTable: [
        { itemId: "rawMeat", weight: 60, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "hide", weight: 30, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "bone", weight: 10, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 12,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 55,
    xpScaling: "linear",
    xpMultiplier: 1.2,

    rarity: "uncommon",
    color: "#795548",
    harvestSound: "hunting",
    particleEffect: "dust_cloud",

    biomes: ["forest", "plains"],
    spawnWeight: 70,
    spawnConditions: null,

    discoveryWeight: 60,
    upgradeChance: 30,
    upgradeAmount: 2,

    requirements: {
        skill: "hunting",
        skillLevel: 15,
        characterLevel: 8,
        quests: [],
        tools: ["hunting"],
        toolTier: 2
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: true,
    seasonalAvailability: null,

    progressionPath: "medium_game",
    nextTier: "wolf_den",
    previousTier: "rabbit_burrow",
    unlockMessage: "You've found a deer trail!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 3: LARGE GAME ===

NodeRegistry.production.wolf_den = {
    id: "wolf_den",
    name: "Wolf Den",
    description: "A dangerous wolf den - high risk, high reward",
    icon: "🐺",

    nodeType: "hunting",
    category: "large_game",

    tier: 3,
    requiredSkillLevel: 30,
    recommendedLevel: 20,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 15,
    harvestTime: 6.0,
    respawnTime: 60,

    resourceTable: [
        { itemId: "rawMeat", weight: 50, minYield: 3, maxYield: 6, skillScaling: true },
        { itemId: "pelt", weight: 30, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "fang", weight: 15, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "bone", weight: 5, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 18,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 90,
    xpScaling: "linear",
    xpMultiplier: 1.5,

    rarity: "rare",
    color: "#424242",
    harvestSound: "hunting",
    particleEffect: "claw_marks",

    biomes: ["forest", "mountains", "tundra"],
    spawnWeight: 35,
    spawnConditions: null,

    discoveryWeight: 25,
    upgradeChance: 25,
    upgradeAmount: 2,

    requirements: {
        skill: "hunting",
        skillLevel: 30,
        characterLevel: 18,
        quests: [],
        tools: ["hunting"],
        toolTier: 4
    },

    isRenewable: true,
    isExhaustible: false,
    exhaustionThreshold: null,
    multiHarvest: false,
    instancedLoot: true,
    weatherDependent: false,
    timeDependent: true,
    seasonalAvailability: ["winter", "fall"],

    progressionPath: "large_game",
    nextTier: null,
    previousTier: "deer_trail",
    unlockMessage: "You've discovered a wolf den - be careful!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};
