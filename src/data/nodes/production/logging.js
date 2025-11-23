/**
 * LOGGING NODES - PRODUCTION
 *
 * Trees, lumber sources, and wood resources
 */

// === TIER 1: BASIC TREES ===

NodeRegistry.production.evergreen_forest = {
    id: "evergreen_forest",
    name: "Evergreen Forest",
    description: "A dense forest of evergreen trees. Rich with pinewood, sap, and pinecones.",
    icon: "🌲",

    nodeType: "logging",
    category: "forest",

    tier: 1,
    requiredSkillLevel: 1,
    recommendedLevel: 1,

    baseHealth: 10,
    minHealth: 8,
    maxHealth: 15,
    harvestTime: 3.0,
    respawnTime: 30,

    resourceTable: [
        {
            itemId: "pinewood",
            weight: 50,
            minYield: 1,
            maxYield: 3,
            skillScaling: true,
            itemDef: {
                id: 'pinewood',
                name: 'Pinewood',
                description: 'Soft pine logs from young pine trees. Basic fuel for campfires and navigation.',
                icon: '🪵',
                iconPath: 'assets/icons/materials/pinewood.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 2,
                resourceType: 'wood',
                gatherSkill: 'logging',
                tags: ['resource', 'wood', 'logs', 'fuel', 'navigation', 'crafting']
            }
        },
        {
            itemId: "sap",
            weight: 25,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: 'sap',
                name: 'Sap',
                description: 'Sticky tree sap. Used in crafting adhesives and potions.',
                icon: '🍯',
                iconPath: 'assets/icons/materials/sap.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 3,
                resourceType: 'misc',
                gatherSkill: 'logging',
                tags: ['resource', 'misc', 'crafting', 'alchemy']
            }
        },
        {
            itemId: "pinecone",
            weight: 25,
            minYield: 1,
            maxYield: 2,
            skillScaling: true,
            itemDef: {
                id: 'pinecone',
                name: 'Pinecone',
                description: 'A pine cone. Can be used for kindling or decoration.',
                icon: '🌰',
                iconPath: 'assets/icons/materials/pinecone.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 1,
                resourceType: 'misc',
                gatherSkill: 'logging',
                tags: ['resource', 'misc', 'kindling', 'crafting']
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
    color: "#2e7d32",
    harvestSound: "logging",
    particleEffect: "wood_chips",

    biomes: ["forest", "plains", "starting_region"],
    spawnWeight: 100,
    spawnConditions: null,

    discoveryWeight: 100,
    upgradeChance: 30,
    upgradeAmount: 2,

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
    nextTier: null,
    previousTier: null,
    unlockMessage: "You've discovered an Evergreen Forest!",

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
        {
            itemId: "pinewood",
            weight: 90,
            minYield: 3,
            maxYield: 6,
            skillScaling: true,
            itemDef: {
                id: 'pinewood',
                name: 'Pinewood',
                description: 'Soft pine logs from young pine trees. Basic fuel for campfires and navigation.',
                icon: '🪵',
                iconPath: 'assets/icons/materials/pinewood.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 2,
                resourceType: 'wood',
                gatherSkill: 'logging',
                tags: ['resource', 'wood', 'logs', 'fuel', 'navigation', 'crafting']
            }
        },
        {
            itemId: "pinecone",
            weight: 10,
            minYield: 1,
            maxYield: 2,
            skillScaling: false,
            itemDef: {
                id: 'pinecone',
                name: 'Pinecone',
                description: 'A pine cone. Can be used for kindling or decoration.',
                icon: '🌰',
                iconPath: 'assets/icons/materials/pinecone.png',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 1,
                resourceType: 'misc',
                gatherSkill: 'logging',
                tags: ['resource', 'misc', 'kindling', 'crafting']
            }
        }
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
        {
            itemId: "willow_wood",
            weight: 80,
            minYield: 2,
            maxYield: 5,
            skillScaling: true,
            itemDef: {
                id: 'willow_wood',
                name: 'Willow Wood',
                description: 'Flexible willow branches. Excellent for weaving and crafting.',
                icon: '🪵',
                category: 'resource',
                rarity: 'uncommon',
                stackLimit: 100,
                value: 8,
                resourceType: 'wood',
                gatherSkill: 'logging',
                tags: ['resource', 'wood', 'flexible', 'crafting']
            }
        },
        {
            itemId: "pinewood",
            weight: 15,
            minYield: 1,
            maxYield: 3,
            skillScaling: true
        },
        {
            itemId: "willow_branch",
            weight: 5,
            minYield: 1,
            maxYield: 2,
            skillScaling: false,
            itemDef: {
                id: 'willow_branch',
                name: 'Willow Branch',
                description: 'Thin, flexible willow branches. Perfect for basket weaving.',
                icon: '🌿',
                category: 'resource',
                rarity: 'common',
                stackLimit: 100,
                value: 3,
                resourceType: 'misc',
                gatherSkill: 'logging',
                tags: ['resource', 'misc', 'flexible', 'crafting', 'weaving']
            }
        }
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
        {
            itemId: "maple_wood",
            weight: 75,
            minYield: 2,
            maxYield: 5,
            skillScaling: true,
            itemDef: {
                id: 'maple_wood',
                name: 'Maple Wood',
                description: 'Beautiful hardwood from maple trees. Prized for furniture and construction.',
                icon: '🪵',
                category: 'resource',
                rarity: 'rare',
                stackLimit: 100,
                value: 15,
                resourceType: 'wood',
                gatherSkill: 'logging',
                tags: ['resource', 'wood', 'hardwood', 'crafting', 'valuable']
            }
        },
        {
            itemId: "pinewood",
            weight: 20,
            minYield: 1,
            maxYield: 3,
            skillScaling: true
        },
        {
            itemId: "maple_sap",
            weight: 5,
            minYield: 1,
            maxYield: 1,
            skillScaling: false,
            itemDef: {
                id: 'maple_sap',
                name: 'Maple Sap',
                description: 'Sweet maple sap. Can be processed into syrup or used in alchemy.',
                icon: '🍯',
                category: 'resource',
                rarity: 'uncommon',
                stackLimit: 100,
                value: 12,
                resourceType: 'misc',
                gatherSkill: 'logging',
                tags: ['resource', 'misc', 'sweet', 'alchemy', 'cooking']
            }
        }
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
