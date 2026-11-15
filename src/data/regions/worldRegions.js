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

        // Gathering nodes - Tier 1 nodes (new naming: node_[tier]_[index])
        discoverableNodes: [
            "node_1_1",  // Lake Shallows (Fishing)
            "node_1_2",  // Meadow Game Trail (Hunting)
            "node_1_3",  // Fallen Timber (Foraging)
            "node_1_4",  // Lakeside Forest (Logging)
            "node_1_5",  // Riverbed (Mining)
            "node_1_6"   // Meadow Herb Patch (Foraging)
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
            "elaran_survey_drone"  // The invasion — drones in the garden (mission_107)
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
            "elaran_surveyor"  // The handlers behind the drones (mission_109)
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
    },

    /**
     * SCOUTREACH - The arms gateway (Region 2)
     * Region ID: region_-2_-3
     * Named for the extent of Unity scout range from The Cradle. A Unity forward
     * outpost now held by an Elaran survey detail — where guns, munitions, armor
     * and Thieving all enter the game via reverse-engineered Elaran kit.
     */
    "region_-2_-3": {
        name: "Scoutreach",
        description: "The far edge of the old Unity scout range. A forward outpost stands here, now occupied by an Elaran survey detail and their drones. Past the camp, sour peat bogs give up the makings of powder — and a downed drone or a picked supply crate gives up the knowledge Unity was never allowed.",
        biome: "plains",
        icon: "🏕️",
        backgroundImage: null,

        hexCoords: { q: -2, r: -3 },
        navigationRequirement: 2,
        complication: 1.25,

        adjacent: {
            "E": "region_-1_-3",
            "NE": "region_-1_-4",
            "NW": "region_-2_-4",   // Peaceful Meadows
            "W": "region_-3_-3",    // Verduun South
            "SW": "region_-3_-2",   // Verduun North
            "SE": "region_-2_-2"
        },

        discoverableNodes: [
            "node_scoutreachBog",      // Mining — bog niter/sulfur (propellant)
            "node_scoutreachMoss",     // Foraging — chemistry reagents
            "node_scoutreachGame",     // Hunting — ranging furs
            "node_elaranSupplyCache",  // Thieving — Elaran salvage + RE samples
            "node_disabledDrone"       // Thieving — drone parts + data core
        ],
        discoverableCraftingStations: [],

        discoverableEnemies: [
            "elaran_recon_grunt",      // Grunt — drops the RE samples
            "elaran_survey_drone"      // Airborne support
        ],

        discoverableLocations: [
            {
                id: "unity_forward_outpost",
                name: "Unity Forward Outpost",
                type: "landmark",
                description: "The abandoned Unity scouting post, now an Elaran survey camp. Crates, drones and field notes litter the ground — all of it worth taking.",
                discoveryChance: 0.07,
                rewards: {
                    exp: { navigation: 50 },
                    items: [
                        { itemId: "droneDataCore", amount: 1 }
                    ],
                    gold: 30
                },
                oneTime: true
            }
        ],

        availableMissions: [],

        experienceRates: {
            navigation: {
                baseXP: 14,
                nodeDiscovery: 20,
                stationDiscovery: 32,
                enemyDiscovery: 28,
                pathDiscovery: 36,
                locationDiscovery: 65
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
        levelGate: { navigation: 2 },

        tier: 2,
        difficultyRating: "Moderate",
        recommendedLevel: { character: 3, combat: 3, navigation: 2 },

        features: {
            safeZone: false,
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: { wood: 0.9, ore: 1.1, fish: 1.0 }
        }
    },

    /**
     * VERDUUN SOUTH - Old Unity hub
     * Region ID: region_-3_-3
     * The abandoned Unity gathering place: an earthen amphitheatre encircling a
     * stone circle raised to the constellations of Aurora Vitae. Narrative landmark.
     */
    "region_-3_-3": {
        name: "Verduun South",
        description: "The heart of the old Unity woods, long abandoned. Here the Unity raised an earthen amphitheatre three storeys high, encircling a hundred-yard market floor reached only by ground-level tunnels. At its centre stands a ring of great stones — an ode to a world they left behind, aligned to the new constellations of Aurora Vitae.",
        biome: "forest",
        icon: "🏛️",
        backgroundImage: null,

        hexCoords: { q: -3, r: -3 },
        navigationRequirement: 2,
        complication: 1.2,

        adjacent: {
            "E": "region_-2_-3",    // Scoutreach
            "NE": "region_-2_-4",   // Peaceful Meadows
            "NW": "region_-3_-4",   // The Cradle
            "W": "region_-4_-3",    // Verduun West
            "SW": "region_-4_-2",
            "SE": "region_-3_-2"    // Verduun North
        },

        discoverableNodes: [
            "node_verduunHardwood",
            "node_verduunForage",
            "node_verduunGame"
        ],
        discoverableCraftingStations: [],

        discoverableEnemies: [
            "verduun_boar",
            "verduun_prowler"
        ],

        discoverableLocations: [
            {
                id: "earthen_amphitheatre",
                name: "The Earthen Amphitheatre",
                type: "landmark",
                description: "A vast ring of earth three storeys high, built by the Unity to encircle a market and gathering floor. The tiered mound once held the stalls and halls of Unity leaders; now only the tunnels and the quiet remain.",
                discoveryChance: 0.05,
                rewards: {
                    exp: { navigation: 60 },
                    gold: 20
                },
                oneTime: true
            },
            {
                id: "standing_stones",
                name: "The Standing Stones",
                type: "landmark",
                description: "A great circle of raised stones at the amphitheatre's centre, set to align with the constellations seen from Aurora Vitae. The Unity left the relics untouched; so should you — there is a story here, not a quarry.",
                discoveryChance: 0.04,
                rewards: {
                    exp: { navigation: 70 }
                },
                oneTime: true
            }
        ],

        availableMissions: [],

        experienceRates: {
            navigation: {
                baseXP: 14,
                nodeDiscovery: 20,
                stationDiscovery: 32,
                enemyDiscovery: 28,
                pathDiscovery: 36,
                locationDiscovery: 70
            },
            firstTimeBonus: 2.0
        },

        environmentalEffects: {
            movementSpeed: 0.95,
            discoveryChanceModifier: 0,
            resourceYieldMultiplier: 1.0,
            hazards: []
        },

        requiredMissionToLeave: null,
        requiredItemsToEnter: {},
        levelGate: { navigation: 2 },

        tier: 2,
        difficultyRating: "Moderate",
        recommendedLevel: { character: 3, combat: 3, navigation: 2 },

        features: {
            safeZone: false,
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: { wood: 1.2, ore: 1.0, fish: 0.9 }
        }
    },

    /**
     * VERDUUN WEST - Quiet old-growth
     * Region ID: region_-4_-3
     */
    "region_-4_-3": {
        name: "Verduun West",
        description: "The western reach of the old Unity woods — deep, quiet old-growth that the Unity never built on. Hardwood stands crowd the slopes and game holds the thickets. Wilderness, for now.",
        biome: "forest",
        icon: "🌲",
        backgroundImage: "assets/backgrounds/regions/region_verduun_west_01.jpg",

        hexCoords: { q: -4, r: -3 },
        navigationRequirement: 3,
        complication: 1.2,

        adjacent: {
            "E": "region_-3_-3",    // Verduun South
            "NE": "region_-3_-4",   // The Cradle
            "NW": "region_-4_-4",   // West Coast
            "W": "region_-5_-3",
            "SW": "region_-5_-2",
            "SE": "region_-4_-2"
        },

        discoverableNodes: [
            "node_verduunHardwood",
            "node_verduunForage",
            "node_verduunGame"
        ],
        discoverableCraftingStations: [],

        discoverableEnemies: [
            "verduun_boar",
            "verduun_prowler"
        ],

        discoverableLocations: [
            {
                id: "old_growth_grove",
                name: "The Old-Growth Grove",
                type: "landmark",
                description: "A cathedral of ancient hardwoods the Unity left standing. The canopy swallows the light and the sound.",
                discoveryChance: 0.05,
                rewards: {
                    exp: { navigation: 55, logging: 25 },
                    gold: 15
                },
                oneTime: true
            }
        ],

        availableMissions: [],

        experienceRates: {
            navigation: {
                baseXP: 15,
                nodeDiscovery: 22,
                stationDiscovery: 34,
                enemyDiscovery: 30,
                pathDiscovery: 38,
                locationDiscovery: 65
            },
            firstTimeBonus: 2.0
        },

        environmentalEffects: {
            movementSpeed: 0.95,
            discoveryChanceModifier: 0,
            resourceYieldMultiplier: 1.0,
            hazards: []
        },

        requiredMissionToLeave: null,
        requiredItemsToEnter: {},
        levelGate: { navigation: 3 },

        tier: 2,
        difficultyRating: "Moderate",
        recommendedLevel: { character: 4, combat: 4, navigation: 3 },

        features: {
            safeZone: false,
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: { wood: 1.3, ore: 1.0, fish: 0.9 }
        }
    },

    /**
     * VERDUUN NORTH - Early-war trenches
     * Region ID: region_-3_-2
     * Remnants of an early war between the factions: underground trenches and
     * passages, 500+ years overgrown. War-salvage mining + first mini-elite.
     */
    "region_-3_-2": {
        name: "Verduun North",
        description: "The northern Verduun woods carry the scars of an early war between the factions — underground trenches and passages that still thread the hills beneath five centuries of dirt and overgrowth. Something down there still keeps watch.",
        biome: "forest",
        icon: "⚔️",
        backgroundImage: null,

        hexCoords: { q: -3, r: -2 },
        navigationRequirement: 3,
        complication: 1.35,

        adjacent: {
            "E": "region_-2_-2",
            "NE": "region_-2_-3",   // Scoutreach
            "NW": "region_-3_-3",   // Verduun South
            "W": "region_-4_-2",
            "SW": "region_-4_-1",
            "SE": "region_-3_-1"
        },

        discoverableNodes: [
            "node_trenchSalvage",   // Mining — war salvage (heavy-armor stock)
            "node_verduunForage",
            "node_verduunGame"
        ],
        discoverableCraftingStations: [],

        discoverableEnemies: [
            "elaran_surveyor",      // Infantry
            "bunker_sentinel"       // First mini-elite
        ],

        discoverableLocations: [
            {
                id: "overgrown_trenches",
                name: "The Overgrown Trenches",
                type: "landmark",
                description: "Collapsed war trenches and sealed passages, swallowed by root and dirt. The old war is down there somewhere — a story to uncover, if you dig carefully and watch your back.",
                discoveryChance: 0.05,
                rewards: {
                    exp: { navigation: 70 },
                    gold: 25
                },
                oneTime: true
            }
        ],

        availableMissions: [],

        experienceRates: {
            navigation: {
                baseXP: 16,
                nodeDiscovery: 24,
                stationDiscovery: 36,
                enemyDiscovery: 32,
                pathDiscovery: 40,
                locationDiscovery: 75
            },
            firstTimeBonus: 2.0
        },

        environmentalEffects: {
            movementSpeed: 0.9,
            discoveryChanceModifier: -5,   // overgrown, hard to read
            resourceYieldMultiplier: 1.0,
            hazards: []
        },

        requiredMissionToLeave: null,
        requiredItemsToEnter: {},
        levelGate: { navigation: 3 },

        tier: 2,
        difficultyRating: "Hard",
        recommendedLevel: { character: 6, combat: 6, navigation: 3 },

        features: {
            safeZone: false,
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: { wood: 1.1, ore: 1.2, fish: 0.8 }
        }
    },

    /**
     * WEST COAST - Saltwater, shoals, dunes
     * Region ID: region_-4_-4
     * The Cradle's ocean edge: tidal shoals, salt pans and dunes. Wilderness with
     * the coast resource register; home of the reserved multi-region shellfish boil.
     */
    "region_-4_-4": {
        name: "The West Shoals",
        description: "West of The Cradle the land breaks into saltwater: tidal shoals thick with shellfish, evaporite salt pans behind the dunes, and driftwood heaped along the tide line. Quiet, open coast — and the clams the old Lake-boil recipe always wanted.",
        biome: "coast",
        icon: "🏖️",
        backgroundImage: "assets/backgrounds/regions/region_west_shoals_01.jpg",

        hexCoords: { q: -4, r: -4 },
        navigationRequirement: 2,
        complication: 1.15,

        adjacent: {
            "E": "region_-3_-4",    // The Cradle
            "NE": "region_-3_-5",
            "NW": "region_-4_-5",
            "W": "region_-5_-4",
            "SW": "region_-5_-3",
            "SE": "region_-4_-3"    // Verduun West
        },

        discoverableNodes: [
            "node_tidalShoals",    // Fishing — shellfish
            "node_kelpBeds",       // Foraging — kelp/saltherb
            "node_saltPans",       // Mining — sea salt/saltstone
            "node_driftwood"       // Logging — driftwood
        ],
        discoverableCraftingStations: [],

        discoverableEnemies: [
            "shoal_raider"
        ],

        discoverableLocations: [
            {
                id: "the_dunes",
                name: "The Dunes",
                type: "landmark",
                description: "Wind-raked dunes above the tide line, crusted with salt pans. The sea stretches west past anything the Unity ever mapped.",
                discoveryChance: 0.06,
                rewards: {
                    exp: { navigation: 50 },
                    items: [
                        { itemId: "seaSalt", amount: 3 }
                    ],
                    gold: 15
                },
                oneTime: true
            }
        ],

        availableMissions: [],

        experienceRates: {
            navigation: {
                baseXP: 14,
                nodeDiscovery: 20,
                stationDiscovery: 32,
                enemyDiscovery: 28,
                pathDiscovery: 36,
                locationDiscovery: 65
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
        levelGate: { navigation: 2 },

        tier: 2,
        difficultyRating: "Moderate",
        recommendedLevel: { character: 3, combat: 3, navigation: 2 },

        features: {
            safeZone: false,
            fastTravel: false,
            settlement: null,
            dungeon: null,
            resourceBonuses: { wood: 0.8, ore: 1.0, fish: 1.3 }
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
