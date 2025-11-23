/**
 * WORLD REGIONS - Manual Definitions
 *
 * Finite, hand-crafted region definitions for the game world.
 * Each region is carefully designed with specific content, difficulty, and progression.
 */

const WorldRegions = {
    /**
     * THE CRADLE - Starting Region
     * Region ID: region_-3_-4
     * Coordinates: q=-3, r=-4
     */
    "region_-3_-4": {
        // ===== BASIC INFORMATION =====
        name: "The Cradle",
        description: "A massive crater, home to the Unity members long banished to this corner of the new planet. The Cradle is heavily wooded and features a large lake of trapped freshwater. This is where your journey begins.",
        biome: "plains",
        icon: "🌾",  // Set from biome
        backgroundImage: "assets/backgrounds/regions/region_the_scar_01.png",

        // ===== LOCATION =====
        hexCoords: { q: -3, r: -4 },
        navigationRequirement: 1,
        complication: 1.0,  // Base difficulty

        // ===== ADJACENT REGIONS =====
        // Regions that border this one (6 directions in hex grid)
        adjacent: {
            "E": "region_-2_-4",    // East: Peaceful Meadows
            "NE": "region_-2_-5",   // Northeast: (TBD)
            "NW": "region_-3_-5",   // Northwest: (TBD)
            "W": "region_-4_-4",    // West: (TBD)
            "SW": "region_-4_-3",   // Southwest: (TBD)
            "SE": "region_-3_-3"    // Southeast: (TBD)
        },

        // ===== DISCOVERABLE CONTENT =====
        // What players can find through Navigation discoveries

        // Gathering nodes - Only NodeRegistry nodes (new system)
        discoverableNodes: [
            // Mining
            "riverbed",
            // Logging
            "evergreen_forest",
            // Fishing
            "cradle_lake_shallows",
            // Hunting
            "cradle_woodlands",
            // Foraging
            "fallen_timber"
        ],

        // Crafting stations
        discoverableCraftingStations: [
            "basicForge",
            "basicWorkbench",
            "campfire",
            "chemTable",
            "sewingKit",
            "engineeringDesk"
        ],

        // Enemies that can be discovered
        discoverableEnemies: [
            "scout"  // Low-level enemies only
        ],

        // Special locations/landmarks
        discoverableLocations: [
            {
                id: "the_scar_lake",
                name: "The Freshwater Lake",
                type: "landmark",
                description: "A pristine lake formed in the crater's center. Its waters are crystal clear and teeming with fish.",
                discoveryChance: 0.08,  // 8% per discovery attempt
                rewards: {
                    exp: {
                        navigation: 50,
                        fishing: 25
                    },
                    items: [
                        { itemId: "lightRations", amount: 3 }
                    ]
                },
                oneTime: true  // Can only be discovered once
            },
            {
                id: "abandoned_supply_cache",
                name: "Abandoned Supply Cache",
                type: "discovery",
                description: "A hidden cache of supplies left by previous explorers. The food is still fresh.",
                discoveryChance: 0.05,  // 5% per discovery attempt
                rewards: {
                    exp: { navigation: 30 },
                    items: [
                        { itemId: "lightRations", amount: 10 },
                        { itemId: "pinewood", amount: 15 }
                    ],
                    gold: 25
                },
                oneTime: true
            }
        ],

        // Missions available in this region
        availableMissions: [
            "tutorial_elder",
            "tutorial_gather_resources"
        ],

        // ===== EXPERIENCE RATES =====
        experienceRates: {
            navigation: {
                baseXP: 10,            // Base XP for failed discovery
                nodeDiscovery: 15,     // XP for discovering gathering node
                stationDiscovery: 25,  // XP for discovering crafting station
                enemyDiscovery: 20,    // XP for discovering enemy
                pathDiscovery: 30,     // XP for discovering exit path
                locationDiscovery: 50  // XP for discovering special location
            },
            firstTimeBonus: 2.0  // 2x XP for first discovery of each type
        },

        // ===== ENVIRONMENTAL EFFECTS =====
        environmentalEffects: {
            movementSpeed: 1.0,           // Normal speed
            discoveryChanceModifier: 5,   // +5% discovery (safe, familiar area)
            resourceYieldMultiplier: 1.0, // Normal yields
            hazards: []  // No hazards in starting area
        },

        // ===== PROGRESSION GATES =====
        requiredMissionToLeave: "tutorial_elder",  // Must complete tutorial before leaving
        requiredItemsToEnter: {},  // No requirements to enter starting region
        levelGate: {
            navigation: 1  // Only navigation level 1 required
        },

        // ===== DIFFICULTY & TIER =====
        tier: 1,
        difficultyRating: "Easy",
        recommendedLevel: {
            character: 1,
            combat: 1,
            navigation: 1
        },

        // ===== SPECIAL FEATURES =====
        features: {
            safeZone: true,              // Cannot be attacked while navigating
            fastTravel: true,            // Can fast-travel here once discovered
            settlement: "the_scar_village",  // Has a village
            dungeon: null,               // No dungeon
            resourceBonuses: {
                wood: 1.1,   // +10% wood (heavily forested)
                ore: 1.0,    // Normal ore
                fish: 1.2    // +20% fish (pristine lake)
            }
        }
    },

    /**
     * PEACEFUL MEADOWS - East of Starting Region
     * Region ID: region_-2_-4
     * Coordinates: q=-2, r=-4
     */
    "region_-2_-4": {
        name: "Peaceful Meadows",
        description: "Rolling grasslands stretching eastward from The Cradle. Wild flowers bloom year-round and gentle streams wind through the fields.",
        biome: "plains",
        icon: "🌾",
        backgroundImage: null,  // Use biome default

        hexCoords: { q: -2, r: -4 },
        navigationRequirement: 2,
        complication: 1.1,

        adjacent: {
            "E": "region_-1_-4",
            "NE": "region_-1_-5",
            "NW": "region_-2_-5",
            "W": "region_-3_-4",    // Back to The Cradle
            "SW": "region_-3_-3",
            "SE": "region_-2_-3"
        },

        discoverableNodes: [],  // Use biome defaults
        discoverableCraftingStations: [],  // Use biome defaults

        discoverableEnemies: [
            "scout",
            "soldier"  // Slightly tougher enemies
        ],

        discoverableLocations: [
            {
                id: "flower_field",
                name: "Vibrant Flower Field",
                type: "landmark",
                description: "A massive field of colorful wildflowers. The air is thick with pollen and the sound of buzzing insects.",
                discoveryChance: 0.06,
                rewards: {
                    exp: {
                        navigation: 40,
                        foraging: 30
                    },
                    items: [
                        { itemId: "flowerPatch", amount: 5 }
                    ]
                },
                oneTime: true
            }
        ],

        availableMissions: [],  // No missions here yet

        experienceRates: {
            navigation: {
                baseXP: 12,
                nodeDiscovery: 18,
                stationDiscovery: 30,
                enemyDiscovery: 25,
                pathDiscovery: 35,
                locationDiscovery: 60
            },
            firstTimeBonus: 2.0
        },

        environmentalEffects: {
            movementSpeed: 1.05,  // Slightly faster (open terrain)
            discoveryChanceModifier: 0,
            resourceYieldMultiplier: 1.0,
            hazards: []
        },

        requiredMissionToLeave: null,  // Can leave freely
        requiredItemsToEnter: {},
        levelGate: {
            navigation: 2
        },

        tier: 1,
        difficultyRating: "Easy",
        recommendedLevel: {
            character: 2,
            combat: 2,
            navigation: 2
        },

        features: {
            safeZone: false,  // Can be attacked
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: {
                wood: 0.8,   // Less wood (open fields)
                ore: 1.0,
                fish: 1.0
            }
        }
    }

    // ===== TEMPLATE FOR ADDING NEW REGIONS =====
    /*
    "region_Q_R": {
        name: "",
        description: "",
        biome: "",  // plains, forest, mountains, tundra, desert, swamp, coast
        icon: "",
        backgroundImage: null,

        hexCoords: { q: 0, r: 0 },
        navigationRequirement: 1,
        complication: 1.0,

        adjacent: {},

        discoverableNodes: [],
        discoverableCraftingStations: [],
        discoverableEnemies: [],
        discoverableLocations: [],
        availableMissions: [],

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
            discoveryChanceModifier: 0,
            resourceYieldMultiplier: 1.0,
            hazards: []
        },

        requiredMissionToLeave: null,
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
            safeZone: false,
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: {
                wood: 1.0,
                ore: 1.0,
                fish: 1.0
            }
        }
    }
    */
};
