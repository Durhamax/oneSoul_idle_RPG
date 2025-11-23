/**
 * FORAGING NODES - PRODUCTION
 *
 * Berry bushes, herb patches, and plant gathering spots
 */

// === TIER 1: COMMON PLANTS ===

NodeRegistry.production.fallen_timber = {
    id: "fallen_timber",
    name: "Fallen Timber",
    description: "Decaying logs covered in mushrooms and flexible saplings",
    icon: "🪵",

    nodeType: "foraging",
    category: "woodland_debris",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 18,
    minHealth: 15,
    maxHealth: 25,
    harvestTime: 2.8,
    respawnTime: 28,

    resourceTable: [
        {
            itemId: "sweetcap_mushroom",
            weight: 50,
            minYield: 1,
            maxYield: 3,
            skillScaling: true,
            itemDef: {
                id: "sweetcap_mushroom",
                name: "Sweetcap Mushroom",
                description: "A sweet-tasting mushroom found on fallen logs. Used in cooking and potion-making.",
                icon: "🍄",
                iconPath: "assets/icons/materials/sweetcap-mushroom.png",
                category: "material",
                subcategory: "mushroom",
                itemType: "resource",
                rarity: "common",
                stackLimit: 100,
                value: 4,
                resourceType: "fungus",
                gatherSkill: "foraging",
                gatherLevel: 1,
                tags: ["material", "mushroom", "cooking", "alchemy", "foraging"]
            }
        },
        {
            itemId: "flexible_limb",
            weight: 50,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: "flexible_limb",
                name: "Flexible Limb",
                description: "A young, flexible branch perfect for crafting bows and other mechanical devices.",
                icon: "🪵",
                iconPath: "assets/icons/materials/flexible-limb.png",
                category: "material",
                subcategory: "wood_component",
                itemType: "resource",
                rarity: "common",
                stackLimit: 100,
                value: 6,
                resourceType: "wood",
                gatherSkill: "foraging",
                gatherLevel: 1,
                craftingUse: "mechanics",
                tags: ["material", "wood", "mechanics", "bow_making", "foraging", "crafting"]
            }
        }
    ],

    rareDropTable: null,
    rareDropChance: 8,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.03,

    baseXP: 16,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#795548",
    harvestSound: "foraging",
    particleEffect: "leaves",

    biomes: ["forest", "plains"],
    spawnWeight: 100,
    spawnConditions: null,

    discoveryWeight: 95,
    upgradeChance: 40,
    upgradeAmount: 3,

    requirements: {
        skill: "foraging",
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
    timeDependent: false,
    seasonalAvailability: ["spring", "summer", "fall", "winter"],

    progressionPath: "basic_foraging",
    nextTier: "berry_bush",
    previousTier: null,
    unlockMessage: "You've found fallen timber covered in useful resources!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "Region 1 lvl 1 foraging node for early-game resource gathering",
    customData: {}
};

NodeRegistry.production.berry_bush = {
    id: "berry_bush",
    name: "Berry Bush",
    description: "A bush laden with ripe berries",
    icon: "🫐",

    nodeType: "foraging",
    category: "berry_source",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 20,
    minHealth: 15,
    maxHealth: 30,
    harvestTime: 2.5,
    respawnTime: 25,

    resourceTable: [
        { itemId: "berry", weight: 80, minYield: 2, maxYield: 5, skillScaling: true },
        { itemId: "seed", weight: 15, minYield: 1, maxYield: 3, skillScaling: false },
        { itemId: "leaf", weight: 5, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 10,

    yieldBonusPerLevel: 0.06,
    rareBonusPerLevel: 0.02,
    speedBonusPerLevel: 0.03,

    baseXP: 18,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#9c27b0",
    harvestSound: "foraging",
    particleEffect: "leaves",

    biomes: ["forest", "plains", "swamp"],
    spawnWeight: 120,
    spawnConditions: null,

    discoveryWeight: 110,
    upgradeChance: 45,
    upgradeAmount: 4,

    requirements: {
        skill: "foraging",
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
    timeDependent: false,
    seasonalAvailability: ["spring", "summer", "fall"],

    progressionPath: "basic_foraging",
    nextTier: "herb_patch",
    previousTier: null,
    unlockMessage: "You've found a berry bush!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

NodeRegistry.production.mushroom_cluster = {
    id: "mushroom_cluster",
    name: "Mushroom Cluster",
    description: "A cluster of edible mushrooms growing in the shade",
    icon: "🍄",

    nodeType: "foraging",
    category: "fungus",

    tier: 1,
    requiredSkillLevel: 5,
    recommendedLevel: 3,

    baseHealth: 15,
    minHealth: 12,
    maxHealth: 22,
    harvestTime: 3.0,
    respawnTime: 30,

    resourceTable: [
        { itemId: "mushroom", weight: 85, minYield: 1, maxYield: 4, skillScaling: true },
        { itemId: "spore", weight: 10, minYield: 1, maxYield: 2, skillScaling: false },
        { itemId: "truffle", weight: 5, minYield: 1, maxYield: 1, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 12,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 22,
    xpScaling: "linear",
    xpMultiplier: 1.0,

    rarity: "common",
    color: "#6d4c41",
    harvestSound: "foraging",
    particleEffect: "spore_cloud",

    biomes: ["forest", "swamp", "underground"],
    spawnWeight: 90,
    spawnConditions: null,

    discoveryWeight: 85,
    upgradeChance: 40,
    upgradeAmount: 3,

    requirements: {
        skill: "foraging",
        skillLevel: 5,
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
    weatherDependent: true,
    timeDependent: false,
    seasonalAvailability: ["fall", "spring"],

    progressionPath: "basic_foraging",
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've found a mushroom cluster!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 2: MEDICINAL HERBS ===

NodeRegistry.production.herb_patch = {
    id: "herb_patch",
    name: "Herb Patch",
    description: "A patch of medicinal herbs",
    icon: "🌿",

    nodeType: "foraging",
    category: "medicinal",

    tier: 2,
    requiredSkillLevel: 15,
    recommendedLevel: 10,

    baseHealth: 12,
    minHealth: 10,
    maxHealth: 18,
    harvestTime: 3.5,
    respawnTime: 40,

    resourceTable: [
        { itemId: "herb", weight: 75, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "medicinal_root", weight: 20, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "seed", weight: 5, minYield: 1, maxYield: 2, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 15,

    yieldBonusPerLevel: 0.05,
    rareBonusPerLevel: 0.03,
    speedBonusPerLevel: 0.02,

    baseXP: 45,
    xpScaling: "linear",
    xpMultiplier: 1.2,

    rarity: "uncommon",
    color: "#66bb6a",
    harvestSound: "foraging",
    particleEffect: "leaves",

    biomes: ["forest", "plains", "mountains"],
    spawnWeight: 60,
    spawnConditions: null,

    discoveryWeight: 50,
    upgradeChance: 30,
    upgradeAmount: 2,

    requirements: {
        skill: "foraging",
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
    timeDependent: false,
    seasonalAvailability: ["spring", "summer"],

    progressionPath: "medicinal_foraging",
    nextTier: "rare_flower_grove",
    previousTier: "berry_bush",
    unlockMessage: "You've found an herb patch!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};

// === TIER 3: RARE PLANTS ===

NodeRegistry.production.rare_flower_grove = {
    id: "rare_flower_grove",
    name: "Rare Flower Grove",
    description: "A grove of exceptionally rare and valuable flowers",
    icon: "🌺",

    nodeType: "foraging",
    category: "exotic_plant",

    tier: 3,
    requiredSkillLevel: 30,
    recommendedLevel: 20,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 15,
    harvestTime: 5.0,
    respawnTime: 60,

    resourceTable: [
        { itemId: "rare_flower", weight: 70, minYield: 1, maxYield: 3, skillScaling: true },
        { itemId: "essence", weight: 20, minYield: 1, maxYield: 2, skillScaling: true },
        { itemId: "petal", weight: 10, minYield: 1, maxYield: 3, skillScaling: false }
    ],

    rareDropTable: null,
    rareDropChance: 20,

    yieldBonusPerLevel: 0.04,
    rareBonusPerLevel: 0.04,
    speedBonusPerLevel: 0.02,

    baseXP: 85,
    xpScaling: "linear",
    xpMultiplier: 1.5,

    rarity: "rare",
    color: "#e91e63",
    harvestSound: "foraging",
    particleEffect: "flower_sparkle",

    biomes: ["forest", "mountains"],
    spawnWeight: 30,
    spawnConditions: null,

    discoveryWeight: 20,
    upgradeChance: 25,
    upgradeAmount: 2,

    requirements: {
        skill: "foraging",
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
    seasonalAvailability: ["spring"],

    progressionPath: "exotic_foraging",
    nextTier: null,
    previousTier: "herb_patch",
    unlockMessage: "You've discovered a rare flower grove!",

    status: "production",
    implemented: true,
    version: "1.0",
    developmentNotes: "",
    customData: {}
};
