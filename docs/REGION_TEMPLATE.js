/**
 * REGION DEFINITION TEMPLATE
 *
 * Copy this template to create new region definitions.
 * All fields are optional unless marked [REQUIRED].
 */

const REGION_TEMPLATE = {
    // ========== BASIC INFORMATION ========== [REQUIRED]
    name: "Region Name",
    description: "A brief description of the region, its features, and lore.",
    biome: "plains",  // plains, forest, mountains, tundra, desert, swamp, coast
    icon: "🌾",       // Inherited from biome (automatically set)
    backgroundImage: null,  // Path to custom background, or null to use biome default

    // ========== COORDINATES & NAVIGATION ========== [REQUIRED]
    hexCoords: {
        q: 0,  // Axial coordinate (horizontal)
        r: 0   // Axial coordinate (diagonal)
    },
    navigationRequirement: 1,  // Minimum navigation skill level to unlock
    complication: 1.0,         // Discovery difficulty (1.0 = normal, 2.0 = twice as hard)

    // ========== ADJACENT REGIONS ========== [AUTO-GENERATED]
    // Automatically populated by generateWorldMap() based on hex neighbors
    adjacent: {
        "E": "region_1_0",
        "NE": "region_1_-1",
        "NW": "region_0_-1",
        "W": "region_-1_0",
        "SW": "region_-1_1",
        "SE": "region_0_1"
    },

    // ========== DISCOVERABLE CONTENT ==========
    // Automatically populated from biome definition, can be overridden

    discoverableNodes: [
        // Gathering nodes that can be discovered (leave empty to use biome defaults)
        // Examples: "copperVein", "oakTree", "pond", "grassland", "berryBush"
    ],

    discoverableCraftingStations: [
        // Crafting stations that can be discovered (leave empty to use biome defaults)
        // Examples: "basicForge", "campfire", "sewingKit"
    ],

    discoverableEnemies: [
        // Enemy IDs that can spawn (leave empty for distance-based auto-population)
        // Examples: "scout", "soldier", "operative"
    ],

    discoverableLocations: [
        // Special locations/events unique to this region
        {
            id: "unique_location_id",
            name: "Location Name",
            type: "discovery",  // Types: discovery, event, landmark
            description: "What the player sees when they find this.",
            discoveryChance: 0.05,  // 5% chance per discovery attempt
            rewards: {
                gold: 50,
                items: [
                    { itemId: "lightRations", amount: 5 }
                ],
                exp: {
                    navigation: 25,
                    // Can also include: mining, logging, combat, etc.
                }
            },
            oneTime: true  // Can only be discovered once
        }
    ],

    availableMissions: [
        // Mission IDs that are available in this region
        // Missions must exist in GameDefinitions.missions
        // Examples: "tutorial_elder", "gather_wood"
    ],

    // ========== EXPERIENCE & REWARDS ==========
    experienceRates: {
        navigation: {
            baseXP: 10,            // Base XP for any discovery
            nodeDiscovery: 15,     // XP for discovering a gathering node
            stationDiscovery: 25,  // XP for discovering a crafting station
            enemyDiscovery: 20,    // XP for discovering an enemy
            pathDiscovery: 30,     // XP for discovering an exit path
            locationDiscovery: 50  // XP for discovering a special location
        },
        firstTimeBonus: 2.0  // Multiplier for first discovery of each type
    },

    // ========== REGION EFFECTS ==========
    environmentalEffects: {
        movementSpeed: 1.0,              // Movement speed multiplier
        discoveryChanceModifier: 0,      // Flat % bonus to discovery chance
        resourceYieldMultiplier: 1.0,    // Gathering yield multiplier

        hazards: [
            // Environmental hazards (remove if none)
            {
                type: "cold",        // Types: cold, heat, poison, radiation
                severity: 0,         // 0-10 scale
                damagePerTick: 0,    // HP damage over time
                requiredResistance: null  // Item/attribute to negate
            }
        ]
    },

    // ========== PROGRESSION RESTRICTIONS ==========
    requiredMissionToLeave: null,  // Mission ID that blocks leaving until completed
    requiredItemsToEnter: {},      // { itemId: quantity } to enter region
    levelGate: {
        // Skill level requirements to enter
        navigation: 1,
        combat: 0,
        mining: 0,
        logging: 0,
        fishing: 0
    },

    // ========== REGION TIER & DIFFICULTY ==========
    tier: 1,                    // Region tier (1-10)
    difficultyRating: "Easy",   // Display: Easy, Medium, Hard, Extreme
    recommendedLevel: {
        character: 1,   // Recommended character level
        combat: 1,      // Recommended combat level
        navigation: 1   // Recommended navigation level
    },

    // ========== SPECIAL FEATURES ==========
    features: {
        safeZone: true,         // Cannot be attacked while here
        fastTravel: false,      // Can fast-travel to this region
        settlement: null,       // Settlement ID if region has one
        dungeon: null,          // Dungeon ID if region has one

        resourceBonuses: {
            // Resource yield multipliers
            wood: 1.0,
            ore: 1.0,
            fish: 1.0
        }
    }
};

// ========== EXAMPLE: Starting Region (The Scar) ==========

const EXAMPLE_STARTING_REGION = {
    name: "The Scar",
    description: "A massive crater, home to the Unity members long banished to this corner of the new planet. The Scar is heavily wooded and features a large lake of trapped freshwater. This is where your journey begins.",
    biome: "plains",
    backgroundImage: "assets/backgrounds/regions/region_the_scar_01.png",

    hexCoords: { q: -3, r: -4 },
    navigationRequirement: 1,
    complication: 1.0,

    adjacent: {
        "E": "region_-2_-4",
        "NE": "region_-2_-5",
        "NW": "region_-3_-5",
        "W": "region_-4_-4",
        "SW": "region_-4_-3",
        "SE": "region_-3_-3"
    },

    discoverableNodes: [],  // Use biome defaults
    discoverableCraftingStations: [],  // Use biome defaults
    discoverableEnemies: ["scout"],
    discoverableLocations: [
        {
            id: "the_scar_lake",
            name: "The Freshwater Lake",
            type: "landmark",
            description: "A pristine lake formed in the crater. Its waters are clear and teeming with life.",
            discoveryChance: 0.10,
            rewards: {
                exp: { navigation: 50, fishing: 25 },
                items: [{ itemId: "lightRations", amount: 3 }]
            },
            oneTime: true
        }
    ],
    availableMissions: ["tutorial_elder", "tutorial_gather_resources"],

    experienceRates: {
        navigation: {
            baseXP: 10,
            nodeDiscovery: 15,
            stationDiscovery: 25,
            enemyDiscovery: 20,
            pathDiscovery: 30,
            locationDiscovery: 50
        },
        firstTimeBonus: 2.0
    },

    environmentalEffects: {
        movementSpeed: 1.0,
        discoveryChanceModifier: 5,  // +5% discovery chance (safe starting area)
        resourceYieldMultiplier: 1.0,
        hazards: []
    },

    requiredMissionToLeave: "tutorial_elder",
    requiredItemsToEnter: {},
    levelGate: { navigation: 1 },

    tier: 1,
    difficultyRating: "Easy",
    recommendedLevel: {
        character: 1,
        combat: 1,
        navigation: 1
    },

    features: {
        safeZone: true,
        fastTravel: true,
        settlement: "the_scar_village",
        dungeon: null,
        resourceBonuses: {
            wood: 1.1,  // +10% wood yield
            ore: 1.0,
            fish: 1.2   // +20% fish yield (due to lake)
        }
    }
};

// ========== EXAMPLE: Mid-Tier Mountain Region ==========

const EXAMPLE_MOUNTAIN_REGION = {
    name: "Frostpeak Summit",
    description: "Towering peaks covered in eternal snow. The air is thin and dangerous creatures lurk among the cliffs.",
    biome: "mountains",
    backgroundImage: null,  // Use biome default

    hexCoords: { q: 2, r: -6 },
    navigationRequirement: 10,
    complication: 2.5,  // Very difficult to navigate

    adjacent: {}, // Auto-populated

    discoverableNodes: [],  // Use biome defaults
    discoverableCraftingStations: [],
    discoverableEnemies: ["mountainBeast", "frostElemental"],
    discoverableLocations: [
        {
            id: "ancient_shrine",
            name: "Ancient Mountain Shrine",
            type: "landmark",
            description: "A weathered shrine dedicated to forgotten gods. Strange energy emanates from within.",
            discoveryChance: 0.03,
            rewards: {
                gold: 500,
                exp: { navigation: 200 },
                items: [
                    { itemId: "ancientRelic", amount: 1 },
                    { itemId: "mithrilOre", amount: 5 }
                ]
            },
            oneTime: true
        }
    ],
    availableMissions: ["mountain_expedition"],

    experienceRates: {
        navigation: {
            baseXP: 30,
            nodeDiscovery: 45,
            stationDiscovery: 75,
            enemyDiscovery: 60,
            pathDiscovery: 90,
            locationDiscovery: 150
        },
        firstTimeBonus: 2.0
    },

    environmentalEffects: {
        movementSpeed: 0.7,  // 30% slower movement
        discoveryChanceModifier: -10,  // -10% discovery (harsh terrain)
        resourceYieldMultiplier: 1.5,  // +50% resources (high quality ores)
        hazards: [
            {
                type: "cold",
                severity: 8,
                damagePerTick: 5,
                requiredResistance: "coldResistance"
            }
        ]
    },

    requiredMissionToLeave: null,
    requiredItemsToEnter: {
        "warmCloak": 1  // Need warm gear to survive
    },
    levelGate: {
        navigation: 10,
        combat: 8
    },

    tier: 6,
    difficultyRating: "Hard",
    recommendedLevel: {
        character: 15,
        combat: 12,
        navigation: 10
    },

    features: {
        safeZone: false,
        fastTravel: false,
        settlement: null,
        dungeon: "frostpeak_caverns",
        resourceBonuses: {
            wood: 0.5,   // -50% wood (scarce)
            ore: 2.0,    // +100% ore (rich deposits)
            fish: 0.0    // No fish (frozen)
        }
    }
};
