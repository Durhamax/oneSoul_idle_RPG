/**
 * IDLE RPG GAME ENGINE
 *
 * This module contains all core game logic independent of UI.
 * Can be easily wrapped by React, Vue, or any other framework.
 */

// =============================================================================
// GAME STATE
// =============================================================================

const GameEngine = {
    // Game state - this is what gets saved/loaded
    state: {
        // Currencies
        currencies: {
            gold: 0,
            medals: 0
        },

        // Resources
        resources: {
            ore: 0,
            wood: 0,
            health: 100,
            maxHealth: 100
        },

        // Generators (produce resources over time)
        generators: {
            miner: { level: 0, unlocked: true },
            lumberjack: { level: 0, unlocked: true },
            merchant: { level: 0, unlocked: true }
        },

        // Upgrades (permanent bonuses)
        upgrades: {
            goldBoost1: { level: 0, unlocked: true },
            goldBoost2: { level: 0, unlocked: false },
            miningEfficiency: { level: 0, unlocked: true },
            loggingEfficiency: { level: 0, unlocked: true },
            merchantSkill: { level: 0, unlocked: false }
        },

        // Skills (player progression)
        skills: {
            // Gathering Skills
            navigation: { level: 1, exp: 0, unlocked: true },
            mining: { level: 1, exp: 0, unlocked: true },
            logging: { level: 1, exp: 0, unlocked: true },
            fishing: { level: 1, exp: 0, unlocked: true },
            hunting: { level: 1, exp: 0, unlocked: true },
            foraging: { level: 1, exp: 0, unlocked: true },
            thieving: { level: 1, exp: 0, unlocked: true },
            combat: { level: 1, exp: 0, unlocked: true },

            // Crafting Skills
            forging: { level: 1, exp: 0, unlocked: true },
            machining: { level: 1, exp: 0, unlocked: true },
            cooking: { level: 1, exp: 0, unlocked: true },
            chemistry: { level: 1, exp: 0, unlocked: true },
            textiles: { level: 1, exp: 0, unlocked: true },
            engineering: { level: 1, exp: 0, unlocked: true }
        },

        // Character Level (overarching level)
        characterLevel: {
            level: 1,
            exp: 0,
            unassignedAttributePoints: 0
        },

        // Combat Attributes (assigned from character level)
        combatAttributes: {
            health: 1,          // Increases max HP
            defense: 1,         // Reduces damage taken
            strength: 1,        // Increases physical damage
            stealth: 1,         // Improves thieving success and stealth attacks
            perception: 1,      // Improves accuracy and foraging success
            mobility: 1,        // Increases attack speed and dodge chance
            intellect: 1        // Improves magic damage and skill learning (future use)
        },

        // Regions & Exploration
        currentRegion: "region_-10_0",  // Active region ID (starting position: far left, q=-10, r=0)
        regions: {
            "region_-10_0": {  // Starting region (far left of hexagonal map)
                discovered: true,
                discoveryProgress: 0,  // 0-100%, increases through navigation
                discoveredLocations: [],
                discoveredNodeTypes: [],  // Array of resource node IDs discovered in this region (starts empty!)
                nodeHealthBonuses: {},    // {nodeId: bonusHealth} - accumulated health for nodes
                discoveredExitPaths: [],  // Array of adjacent region IDs that can be traveled to
                discoveredCraftingStations: []  // Array of crafting station IDs discovered (starts empty!)
            }
        },

        // Current Activity (only one activity can be active at a time)
        currentActivity: null,  // Possible values: null, 'navigation', 'combat', 'nodeCollection', 'crafting'

        // Active Navigation (discovery system)
        activeNavigation: {
            isNavigating: false,       // Currently exploring/discovering
            lastNavigationTick: 0,     // Last time progress was made
            regionHealth: 100,         // Current "health" of discovery target
            maxRegionHealth: 100       // Max health to deplete for discoveries
        },

        // Bank/Inventory System
        bank: {
            activeTab: "resources",  // Currently selected tab
            tabs: {
                resources: {
                    name: "Resources",
                    icon: "📦",
                    order: 0
                },
                equipment: {
                    name: "Equipment",
                    icon: "⚔️",
                    order: 1
                },
                consumables: {
                    name: "Consumables",
                    icon: "🧪",
                    order: 2
                }
            },
            items: {
                // Items stored as: itemId: { quantity, tab, isNew, lastAddedTime }
            },
            newItems: []  // Array of itemIds that are newly added
        },

        // Equipment System
        equipment: {
            weapon: null,      // Main weapon
            shield: null,      // Shield/Off-hand
            helmet: null,      // Head armor
            chest: null,       // Body armor
            legs: null,        // Leg armor
            neck: null,        // Necklace/Amulet
            ring: null,        // Ring
            back: null         // Cape/Cloak
        },

        // Combat System
        combat: {
            // Player base stats
            player: {
                baseAttackDamage: 5,
                baseAttackSpeed: 1.0,    // Attacks per second
                baseAccuracy: 75,        // % chance to hit
                currentHealth: 100,
                maxHealth: 100
            },

            // Current enemy (null when not in combat)
            currentEnemy: null,

            // Combat state
            inCombat: false,
            combatLog: [],
            lastAttackTime: 0,

            // Respawn tracking
            selectedEnemyId: null,       // Which enemy type to respawn
            enemyDefeatedAt: null,       // When enemy was last defeated
            waitingForRespawn: false,    // Whether we're waiting for respawn

            // Loot tracking
            pendingLoot: []              // Array of loot waiting to be collected
        },

        // Perks (placeholder for future)
        perks: {
            damageBonus: 0,      // +% damage
            speedBonus: 0,       // +% attack speed
            accuracyBonus: 0,    // +% accuracy
            healthBonus: 0       // +% max health
        },

        // Node Collection System
        nodeCollection: {
            activeNode: null,        // Currently collecting node {nodeId, currentHealth, startTime}
            lastCollectionTick: 0,   // Last time damage was dealt
            selectedSkill: null      // Currently selected skill for node filtering
        },

        // Crafting System
        crafting: {
            discoveredStations: [],  // Array of discovered crafting station IDs
            activeCrafts: [],        // Array of active crafts {recipeId, startTime, completionTime, stationId}
            selectedSkill: null,     // Currently selected crafting skill filter
            autoRecipe: null         // Recipe to auto-repeat until stopped or out of materials
        },

        // Engineering Tech Tree
        engineeringTech: {
            researched: [],          // Array of researched technology IDs
            activeResearch: null,    // Current research {techId, startTime, completionTime, cost, xpReward}
            analytics: {
                totalResearchCompleted: 0,
                totalResearchTime: 0,
                totalXpGained: 0,
                totalTomesSpent: 0,
                byTech: {}           // Per-tech stats {techId: {completed, totalTime, avgTime, fastestTime}}
            }
        },

        // Metadata
        gameTime: 0,              // Total game time in seconds
        lastTick: Date.now(),     // Last update timestamp
        lastSave: null,           // Last save timestamp
        tickRate: 100             // Game updates every 100ms (10 ticks/second)
    },

    // Game loop interval
    gameLoop: null,

    // =============================================================================
    // WORLD MAP GENERATOR
    // =============================================================================

    /**
     * Generate a hex grid world map
     * Creates a hexagonal-shaped map using axial coordinates (more square-like than rectangle)
     */
    generateWorldMap(mapRadius = 10) {
        const worldMap = {};
        const biomeTypes = ['plains', 'forest', 'mountains', 'tundra', 'desert', 'swamp', 'coast'];

        // Helper: Get hex neighbors in axial coordinates
        const getNeighbors = (q, r) => {
            return [
                { q: q + 1, r: r, dir: "E" },      // East
                { q: q + 1, r: r - 1, dir: "NE" }, // Northeast
                { q: q, r: r - 1, dir: "NW" },     // Northwest
                { q: q - 1, r: r, dir: "W" },      // West
                { q: q - 1, r: r + 1, dir: "SW" }, // Southwest
                { q: q, r: r + 1, dir: "SE" }      // Southeast
            ];
        };

        // Helper: Get biome based on position (simple pattern)
        // Starting position is far left (q = -mapRadius, r = 0)
        const getBiome = (q, r) => {
            const startQ = -mapRadius;
            const startR = 0;

            // Starting region is plains
            if (q === startQ && r === startR) return 'plains';

            // Simple procedural biome assignment based on position
            const distanceFromStart = Math.sqrt((q - startQ) ** 2 + (r - startR) ** 2);

            // Close to start: plains
            if (distanceFromStart < 2) return 'plains';

            // Biome zones based on position
            // Left side (near start): plains and forest
            if (q < -mapRadius * 0.4) {
                return r < 0 ? 'forest' : 'plains';
            }

            // Upper regions: mountains and tundra
            if (r < -mapRadius * 0.4) {
                return q > 0 ? 'tundra' : 'mountains';
            }

            // Lower regions: swamp and coast
            if (r > mapRadius * 0.4) {
                return q > 0 ? 'coast' : 'swamp';
            }

            // Middle-right: desert and forest
            if (q > mapRadius * 0.4) {
                return r > 0 ? 'desert' : 'forest';
            }

            // Default: varied biomes
            const hash = Math.abs(q * 73 + r * 37) % biomeTypes.length;
            return biomeTypes[hash];
        };

        // Helper: Generate region name
        const getRegionName = (q, r, biome) => {
            const startQ = -mapRadius;
            const startR = 0;

            if (q === startQ && r === startR) return "Starting Plains";

            const prefixes = {
                plains: ["Green", "Sunny", "Peaceful", "Rolling", "Golden"],
                forest: ["Dark", "Deep", "Ancient", "Verdant", "Misty"],
                mountains: ["Highland", "Snowy", "Rocky", "Towering", "Peak"],
                tundra: ["Frozen", "Icy", "Bitter", "Arctic", "Frost"],
                desert: ["Arid", "Burning", "Dry", "Sandy", "Scorched"],
                swamp: ["Murky", "Foggy", "Dank", "Mossy", "Fetid"],
                coast: ["Coastal", "Sandy", "Windy", "Harbor", "Tidal"]
            };

            const suffixes = {
                plains: ["Plains", "Meadows", "Fields", "Grassland", "Valley"],
                forest: ["Woods", "Forest", "Grove", "Thicket", "Woodland"],
                mountains: ["Ridge", "Peak", "Mountains", "Summit", "Heights"],
                tundra: ["Tundra", "Wastes", "Expanse", "Barrens", "Flats"],
                desert: ["Desert", "Wastes", "Dunes", "Sands", "Expanse"],
                swamp: ["Swamp", "Marsh", "Bog", "Fen", "Mire"],
                coast: ["Shores", "Coast", "Beach", "Bay", "Cove"]
            };

            const prefix = prefixes[biome][Math.abs(q + r * 3) % prefixes[biome].length];
            const suffix = suffixes[biome][Math.abs(q * 2 + r) % suffixes[biome].length];

            return `${prefix} ${suffix}`;
        };

        // Generate hexagonal grid with rectangular boundaries (wider than tall)
        // This creates a more square-like shape while maintaining hex adjacency
        const startQ = -mapRadius;
        const startR = 0;

        // Generate hexes in a rectangular boundary (2:1 width to height ratio for square-ish appearance)
        for (let q = -mapRadius; q <= mapRadius; q++) {
            const r1 = Math.max(-mapRadius, -q - mapRadius);
            const r2 = Math.min(mapRadius, -q + mapRadius);

            for (let r = r1; r <= r2; r++) {
                const regionId = `region_${q}_${r}`;
                const biome = getBiome(q, r);
                const distanceFromStart = Math.sqrt((q - startQ) ** 2 + (r - startR) ** 2);
                const navRequirement = Math.max(0, Math.floor(distanceFromStart / 2));

                // Get valid neighbors
                const neighbors = getNeighbors(q, r);
                const validNeighbors = neighbors.filter(n => {
                    // Check if neighbor is within map bounds
                    const nR1 = Math.max(-mapRadius, -n.q - mapRadius);
                    const nR2 = Math.min(mapRadius, -n.q + mapRadius);
                    return n.q >= -mapRadius && n.q <= mapRadius &&
                           n.r >= nR1 && n.r <= nR2;
                });

                worldMap[regionId] = {
                    name: getRegionName(q, r, biome),
                    description: `A ${biome} region in the ${q > 0 ? 'eastern' : q < 0 ? 'western' : 'central'} ${r > 0 ? 'south' : r < 0 ? 'north' : 'lands'}`,
                    biome: biome,
                    hexCoords: { q, r }, // Using axial coordinates
                    navigationRequirement: navRequirement,
                    adjacent: validNeighbors.reduce((obj, n) => {
                        obj[n.dir] = `region_${n.q}_${n.r}`;
                        return obj;
                    }, {})
                };
            }
        }

        return worldMap;
    },

    // =============================================================================
    // GAME DEFINITIONS (Balance Tweaking)
    // =============================================================================

    definitions: {
        // Skills definitions
        skills: {
            navigation: {
                name: "Navigation",
                description: "Explore regions and discover new locations",
                // EXP formula: expToLevel = baseExp * (level ^ expCurve)
                baseExp: 100,
                expCurve: 1.5,
                // Effects
                explorationSpeed: 0.1  // Base exploration speed per level (% per second)
            },
            mining: {
                name: "Mining",
                description: "Increases ore gathering efficiency",
                baseExp: 100,
                expCurve: 1.5,
                bonusPerLevel: 0.05  // +5% ore per level
            },
            logging: {
                name: "Logging",
                description: "Increases wood gathering efficiency",
                baseExp: 100,
                expCurve: 1.5,
                bonusPerLevel: 0.05  // +5% wood per level
            },
            fishing: {
                name: "Fishing",
                description: "Catch fish from lakes, rivers, and streams",
                baseExp: 100,
                expCurve: 1.5,
                bonusPerLevel: 0.05  // +5% fishing success per level
            },
            hunting: {
                name: "Hunting",
                description: "Track and hunt animals for meat and materials",
                baseExp: 100,
                expCurve: 1.5,
                bonusPerLevel: 0.05  // +5% hunting success per level
            },
            foraging: {
                name: "Foraging",
                description: "Gather mushrooms, herbs, flowers, and plants",
                baseExp: 100,
                expCurve: 1.5,
                bonusPerLevel: 0.05  // +5% foraging success per level
            },
            thieving: {
                name: "Thieving",
                description: "Steal valuables from locations and NPCs",
                baseExp: 120,
                expCurve: 1.6,
                bonusPerLevel: 0.05  // +5% thieving success per level
            },
            combat: {
                name: "Combat",
                description: "Increases combat effectiveness",
                baseExp: 150,
                expCurve: 1.6,
                bonusPerLevel: 0.1  // +10% damage per level
            },

            // Crafting Skills
            forging: {
                name: "Forging",
                description: "Craft melee weapons, armor plates, and metal components",
                baseExp: 120,
                expCurve: 1.5,
                bonusPerLevel: 0.03  // +3% crafting speed/success per level
            },
            machining: {
                name: "Machining",
                description: "Craft firearms, weapon parts, and mechanical components",
                baseExp: 120,
                expCurve: 1.5,
                bonusPerLevel: 0.03  // +3% crafting speed/success per level
            },
            cooking: {
                name: "Cooking",
                description: "Prepare food and consumables that provide buffs",
                baseExp: 100,
                expCurve: 1.4,
                bonusPerLevel: 0.05  // +5% buff effectiveness per level
            },
            chemistry: {
                name: "Chemistry",
                description: "Create medical supplies, explosives, and chemical compounds",
                baseExp: 130,
                expCurve: 1.6,
                bonusPerLevel: 0.04  // +4% potency per level
            },
            textiles: {
                name: "Textiles",
                description: "Craft clothing, tactical gear, and fabric-based items",
                baseExp: 110,
                expCurve: 1.5,
                bonusPerLevel: 0.03  // +3% crafting speed/success per level
            },
            engineering: {
                name: "Engineering",
                description: "Advanced tech crafting and unlocking new techniques",
                baseExp: 150,
                expCurve: 1.7,
                bonusPerLevel: 0.02  // +2% all crafting effectiveness per level
            }
        },

        // Character Level definitions
        characterLevel: {
            name: "Character Level",
            description: "Your overall character level, gained from all activities",
            baseExp: 1000,       // Base EXP required for first level
            expCurve: 2.0,       // Steeper curve than skills
            attributePointsPerLevel: 3,  // Points awarded per level up
            generalExpRate: 0.1  // 10% of skill XP also goes to character XP
        },

        // Combat Attribute definitions
        combatAttributes: {
            health: {
                name: "Health",
                description: "Increases maximum health points",
                effectPerPoint: 10  // +10 max HP per point
            },
            defense: {
                name: "Defense",
                description: "Reduces damage taken from attacks",
                effectPerPoint: 0.02  // +2% damage reduction per point
            },
            strength: {
                name: "Strength",
                description: "Increases physical damage dealt",
                effectPerPoint: 2  // +2 attack damage per point
            },
            stealth: {
                name: "Stealth",
                description: "Improves thieving success and enables stealth attacks",
                effectPerPoint: 0.01  // +1% thieving success per point
            },
            perception: {
                name: "Perception",
                description: "Improves accuracy and foraging success rates",
                effectPerPoint: 0.5  // +0.5% accuracy and foraging success per point
            },
            mobility: {
                name: "Mobility",
                description: "Increases attack speed and dodge chance",
                effectPerPoint: 0.02  // +2% attack speed per point
            },
            intellect: {
                name: "Intellect",
                description: "Improves skill learning and magic abilities",
                effectPerPoint: 0.01  // +1% skill exp gain per point (future: magic damage)
            }
        },

        // Hex Grid World Map (axial coordinates: q, r)
        // Generated procedurally at initialization - see generateWorldMap()
        worldMap: null,

        // OLD worldMap for reference (replaced by generated 20x20 grid)
        _oldWorldMap: {
            // Center starting hex
            "region_0_0": {
                name: "Starting Plains",
                biome: "plains",
                hexCoords: { q: 0, r: 0 },
                navigationRequirement: 0,
                adjacentHexes: [
                    { id: "region_1_0", direction: "E", discovered: false },
                    { id: "region_1_-1", direction: "NE", discovered: false },
                    { id: "region_0_-1", direction: "NW", discovered: false },
                    { id: "region_-1_0", direction: "W", discovered: false },
                    { id: "region_-1_1", direction: "SW", discovered: false },
                    { id: "region_0_1", direction: "SE", discovered: false }
                ]
            },
            // East
            "region_1_0": {
                name: "Verdant Woods",
                biome: "forest",
                hexCoords: { q: 1, r: 0 },
                navigationRequirement: 2,
                adjacentHexes: [
                    { id: "region_2_0", direction: "E", discovered: false },
                    { id: "region_2_-1", direction: "NE", discovered: false },
                    { id: "region_1_-1", direction: "NW", discovered: false },
                    { id: "region_0_0", direction: "W", discovered: false },
                    { id: "region_0_1", direction: "SW", discovered: false },
                    { id: "region_1_1", direction: "SE", discovered: false }
                ]
            },
            // Northeast
            "region_1_-1": {
                name: "Highland Ridge",
                biome: "mountains",
                hexCoords: { q: 1, r: -1 },
                navigationRequirement: 3,
                adjacentHexes: [
                    { id: "region_2_-1", direction: "E", discovered: false },
                    { id: "region_2_-2", direction: "NE", discovered: false },
                    { id: "region_1_-2", direction: "NW", discovered: false },
                    { id: "region_0_-1", direction: "W", discovered: false },
                    { id: "region_0_0", direction: "SW", discovered: false },
                    { id: "region_1_0", direction: "SE", discovered: false }
                ]
            },
            // Northwest
            "region_0_-1": {
                name: "Frozen Tundra",
                biome: "tundra",
                hexCoords: { q: 0, r: -1 },
                navigationRequirement: 4,
                adjacentHexes: [
                    { id: "region_1_-1", direction: "E", discovered: false },
                    { id: "region_1_-2", direction: "NE", discovered: false },
                    { id: "region_0_-2", direction: "NW", discovered: false },
                    { id: "region_-1_-1", direction: "W", discovered: false },
                    { id: "region_-1_0", direction: "SW", discovered: false },
                    { id: "region_0_0", direction: "SE", discovered: false }
                ]
            },
            // West
            "region_-1_0": {
                name: "Arid Wastes",
                biome: "desert",
                hexCoords: { q: -1, r: 0 },
                navigationRequirement: 3,
                adjacentHexes: [
                    { id: "region_0_0", direction: "E", discovered: false },
                    { id: "region_0_-1", direction: "NE", discovered: false },
                    { id: "region_-1_-1", direction: "NW", discovered: false },
                    { id: "region_-2_0", direction: "W", discovered: false },
                    { id: "region_-2_1", direction: "SW", discovered: false },
                    { id: "region_-1_1", direction: "SE", discovered: false }
                ]
            },
            // Southwest
            "region_-1_1": {
                name: "Murky Swamp",
                biome: "swamp",
                hexCoords: { q: -1, r: 1 },
                navigationRequirement: 3,
                adjacentHexes: [
                    { id: "region_0_1", direction: "E", discovered: false },
                    { id: "region_0_0", direction: "NE", discovered: false },
                    { id: "region_-1_0", direction: "NW", discovered: false },
                    { id: "region_-2_1", direction: "W", discovered: false },
                    { id: "region_-2_2", direction: "SW", discovered: false },
                    { id: "region_-1_2", direction: "SE", discovered: false }
                ]
            },
            // Southeast
            "region_0_1": {
                name: "Coastal Shores",
                biome: "coast",
                hexCoords: { q: 0, r: 1 },
                navigationRequirement: 2,
                adjacentHexes: [
                    { id: "region_1_1", direction: "E", discovered: false },
                    { id: "region_1_0", direction: "NE", discovered: false },
                    { id: "region_0_0", direction: "NW", discovered: false },
                    { id: "region_-1_1", direction: "W", discovered: false },
                    { id: "region_-1_2", direction: "SW", discovered: false },
                    { id: "region_0_2", direction: "SE", discovered: false }
                ]
            }
        },

        // Biome definitions (determines what can be discovered in each hex)
        biomes: {
            plains: {
                name: "Plains",
                description: "Open grasslands with basic resources",
                icon: "🌾",
                color: "#7fb069",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock"],
                    logging: ["oakTree"],
                    fishing: ["lake", "stream"],
                    hunting: ["plain"],
                    foraging: ["flowerPatch", "berryBush"],
                    thieving: ["abandonedCart", "merchantStall"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["campfire"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                exitPathChance: 0.15  // 15% chance per discovery to find exit path
            },
            forest: {
                name: "Forest",
                description: "Dense woodland with timber and wildlife",
                icon: "🌲",
                color: "#2d6a4f",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock", "coalDeposit"],
                    logging: ["oakTree", "pineTree"],
                    fishing: ["lake", "stream", "river"],
                    hunting: ["hardwoodForest"],
                    foraging: ["berryBush", "mushroomLog", "herbGarden"],
                    thieving: ["merchantStall", "guardPost"]
                },
                craftingNodes: {
                    forging: ["basicForge", "advancedForge"],
                    machining: ["basicWorkbench", "machineShop"],
                    cooking: ["campfire", "fieldKitchen"],
                    chemistry: ["chemTable", "chemLab"],
                    textiles: ["sewingKit", "tailorShop"],
                    engineering: ["engineeringDesk", "techBench"]
                },
                exitPathChance: 0.12
            },
            mountains: {
                name: "Mountains",
                description: "Rocky peaks rich with ore and minerals",
                icon: "⛰️",
                color: "#8b7355",
                gatheringNodes: {
                    mining: ["coalDeposit", "ironVein", "silverVein", "goldVein"],
                    logging: ["pineTree"],
                    fishing: ["stream", "waterfall"],
                    hunting: ["pineForest", "mountain"],
                    foraging: ["herbGarden", "rootField", "alpineMeadow"],
                    thieving: ["guardPost", "techWarehouse"]
                },
                craftingNodes: {
                    forging: ["advancedForge", "masterForge"],
                    machining: ["machineShop", "precisionLab"],
                    cooking: ["fieldKitchen", "fullKitchen"],
                    chemistry: ["chemLab", "researchLab"],
                    textiles: ["tailorShop", "fabricMill"],
                    engineering: ["techBench", "innovationCenter"]
                },
                exitPathChance: 0.10
            },
            tundra: {
                name: "Tundra",
                description: "Frozen wasteland with unique cold-climate resources",
                icon: "❄️",
                color: "#cce7ff",
                gatheringNodes: {
                    mining: ["ironVein", "silverVein"],
                    logging: ["pineTree"],
                    fishing: ["lake", "stream"],
                    hunting: ["tundra"],
                    foraging: ["alpineMeadow"],
                    thieving: ["techWarehouse"]
                },
                craftingNodes: {
                    forging: ["advancedForge"],
                    machining: ["machineShop"],
                    cooking: ["fieldKitchen"],
                    chemistry: ["chemLab"],
                    textiles: ["tailorShop"],
                    engineering: ["techBench"]
                },
                exitPathChance: 0.10
            },
            desert: {
                name: "Desert",
                description: "Arid landscape with scarce but valuable resources",
                icon: "🏜️",
                color: "#f4a261",
                gatheringNodes: {
                    mining: ["goldVein", "silverVein"],
                    logging: [],
                    fishing: [],
                    hunting: ["desert"],
                    foraging: ["cactus"],
                    thieving: ["mansion", "dataCenter"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["machineShop"],
                    cooking: ["campfire"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["techBench"]
                },
                exitPathChance: 0.08
            },
            swamp: {
                name: "Swamp",
                description: "Murky wetlands with poisonous plants and hidden treasures",
                icon: "🐊",
                color: "#52796f",
                gatheringNodes: {
                    mining: [],
                    logging: ["oakTree"],
                    fishing: ["swamp"],
                    hunting: ["swamp"],
                    foraging: ["mushroomLog", "herbGarden", "poisonBerry"],
                    thieving: ["abandonedCart", "guardPost"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["fieldKitchen"],
                    chemistry: ["chemLab"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                exitPathChance: 0.10
            },
            coast: {
                name: "Coast",
                description: "Shoreline with abundant fish and maritime resources",
                icon: "🌊",
                color: "#4a90e2",
                gatheringNodes: {
                    mining: ["copperVein"],
                    logging: ["oakTree"],
                    fishing: ["ocean", "beach", "reef"],
                    hunting: ["coast"],
                    foraging: ["seaweed", "shellfish"],
                    thieving: ["merchantStall", "harbor"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["campfire", "fieldKitchen"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                exitPathChance: 0.12
            }
        },

        // Region definitions (legacy - will be phased out in favor of worldMap)
        regions: {
            startingPlains: {
                name: "Starting Plains",
                description: "A peaceful grassland with basic resources",
                // Discoverable gathering nodes (references to resourceNodes)
                gatheringNodes: {
                    mining: ["copperVein", "tinRock"],
                    logging: ["oakTree"],
                    fishing: ["lake", "stream"],
                    hunting: ["plain"],
                    foraging: ["flowerPatch", "berryBush"],
                    thieving: ["abandonedCart", "merchantStall"]
                },
                // Discoverable crafting stations (references to craftingNodes)
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["campfire"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                // Special locations to discover
                locations: [
                    { id: "abandonedCamp", name: "Abandoned Camp", reward: { gold: 50 } },
                    { id: "oldShrine", name: "Old Shrine", reward: { navigation: 20 } }
                ],
                // Fog of war settings
                baseFogAmount: 100,  // Starting fog %
                navigationRequirement: 0  // Min navigation level to explore
            },
            darkForest: {
                name: "Dark Forest",
                description: "A dense forest rich with timber and ore deposits",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock", "coalDeposit", "ironVein"],
                    logging: ["oakTree", "pineTree"],
                    fishing: ["lake", "stream", "river"],
                    hunting: ["hardwoodForest"],
                    foraging: ["berryBush", "mushroomLog", "herbGarden"],
                    thieving: ["merchantStall", "guardPost", "techWarehouse"]
                },
                craftingNodes: {
                    forging: ["basicForge", "advancedForge"],
                    machining: ["basicWorkbench", "machineShop"],
                    cooking: ["campfire", "fieldKitchen"],
                    chemistry: ["chemTable", "chemLab"],
                    textiles: ["sewingKit", "tailorShop"],
                    engineering: ["engineeringDesk", "techBench"]
                },
                locations: [
                    { id: "huntersCabin", name: "Hunter's Cabin", reward: { wood: 100 } },
                    { id: "hiddenCave", name: "Hidden Cave", reward: { ore: 50 } }
                ],
                baseFogAmount: 100,
                navigationRequirement: 3,
                unlockRequirement: { navigation: 2 }
            },
            mountainPass: {
                name: "Mountain Pass",
                description: "Rocky terrain with abundant ore and precious metals",
                gatheringNodes: {
                    mining: ["coalDeposit", "ironVein", "silverVein", "goldVein"],
                    logging: ["pineTree"],
                    fishing: ["stream", "waterfall"],
                    hunting: ["pineForest", "mountain"],
                    foraging: ["herbGarden", "rootField", "alpineMeadow"],
                    thieving: ["techWarehouse", "mansion", "dataCenter"]
                },
                craftingNodes: {
                    forging: ["advancedForge", "masterForge"],
                    machining: ["machineShop", "precisionLab"],
                    cooking: ["fieldKitchen", "fullKitchen"],
                    chemistry: ["chemLab", "researchLab"],
                    textiles: ["tailorShop", "fabricMill"],
                    engineering: ["techBench", "innovationCenter"]
                },
                locations: [
                    { id: "dwarvenOutpost", name: "Dwarven Outpost", reward: { gold: 200, ore: 100 } },
                    { id: "peakShrine", name: "Peak Shrine", reward: { mining: 50 } }
                ],
                baseFogAmount: 100,
                navigationRequirement: 5,
                unlockRequirement: { navigation: 5, mining: 3 }
            }
        },

        // Item definitions
        items: {
            // Resources
            gold: {
                name: "Gold Coins",
                description: "Shiny gold coins used for trading",
                image: "💰",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "currency"
            },
            ore: {
                name: "Iron Ore",
                description: "Raw iron ore from the mines",
                image: "⛏️",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "material"
            },
            wood: {
                name: "Wood Logs",
                description: "Sturdy logs from trees",
                image: "🪵",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "material"
            },
            stone: {
                name: "Stone",
                description: "Hard stone from quarries",
                image: "🪨",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "material"
            },
            copperOre: {
                name: "Copper Ore",
                description: "Raw copper ore, useful for crafting",
                image: "🟠",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            tinOre: {
                name: "Tin Ore",
                description: "Silvery tin ore",
                image: "⚪",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            coal: {
                name: "Coal",
                description: "Black coal for fuel",
                image: "⚫",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            silverOre: {
                name: "Silver Ore",
                description: "Shiny silver ore",
                image: "⚪",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            goldOre: {
                name: "Gold Ore",
                description: "Precious gold ore",
                image: "🟡",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            // Equipment - Tools (Pickaxes)
            bronzePickaxe: {
                name: "Bronze Pickaxe",
                description: "A basic mining pickaxe",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 5,
                    attackDamage: 3
                }
            },
            ironPickaxe: {
                name: "Iron Pickaxe",
                description: "A sturdy iron pickaxe",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 10,
                    attackDamage: 5
                }
            },
            steelPickaxe: {
                name: "Steel Pickaxe",
                description: "A strong steel pickaxe",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 20,
                    attackDamage: 8
                }
            },
            mithrilPickaxe: {
                name: "Mithril Pickaxe",
                description: "A legendary pickaxe made from mithril",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 40,
                    attackDamage: 12
                }
            },
            // Equipment - Tools (Axes)
            bronzeAxe: {
                name: "Bronze Axe",
                description: "A basic woodcutting axe",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 5,
                    attackDamage: 4
                }
            },
            ironAxe: {
                name: "Iron Axe",
                description: "A sturdy iron axe",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 10,
                    attackDamage: 7
                }
            },
            steelAxe: {
                name: "Steel Axe",
                description: "A sharp steel axe",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 20,
                    attackDamage: 12
                }
            },
            // Equipment - Tools (Fishing Rods)
            bambooPole: {
                name: "Bamboo Fishing Pole",
                description: "A simple fishing pole",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 5
                }
            },
            basicRod: {
                name: "Basic Fishing Rod",
                description: "A standard fishing rod",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 10
                }
            },
            carbonRod: {
                name: "Carbon Fiber Rod",
                description: "A modern, flexible fishing rod",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 20
                }
            },
            masterRod: {
                name: "Master's Fishing Rod",
                description: "A legendary fishing rod",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 40
                }
            },
            // Equipment - Tools (Bows)
            shortBow: {
                name: "Short Bow",
                description: "A basic hunting bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 5,
                    attackDamage: 8
                }
            },
            longBow: {
                name: "Long Bow",
                description: "A sturdy long bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 10,
                    attackDamage: 14
                }
            },
            compositeBow: {
                name: "Composite Bow",
                description: "A powerful composite bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 20,
                    attackDamage: 22
                }
            },
            legendaryBow: {
                name: "Legendary Hunter's Bow",
                description: "A bow fit for the greatest hunters",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 40,
                    attackDamage: 35
                }
            },
            // Fish Resources
            minnow: {
                name: "Minnow",
                description: "A tiny fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            trout: {
                name: "Trout",
                description: "A common freshwater fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            bass: {
                name: "Bass",
                description: "A popular game fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            salmon: {
                name: "Salmon",
                description: "A prized fish known for swimming upstream",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            pike: {
                name: "Pike",
                description: "A fierce predatory fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            goldfish: {
                name: "Golden Fish",
                description: "A rare, shimmering fish",
                image: "🐠",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            // Hunting Resources
            rawMeat: {
                name: "Raw Meat",
                description: "Freshly hunted meat",
                image: "🥩",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "meat"
            },
            hide: {
                name: "Animal Hide",
                description: "Leather for crafting",
                image: "🦌",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "hide"
            },
            feather: {
                name: "Feather",
                description: "Bird feathers for crafting arrows",
                image: "🪶",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "feather"
            },
            bone: {
                name: "Bone",
                description: "Animal bones for crafting",
                image: "🦴",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "bone"
            },
            fang: {
                name: "Beast Fang",
                description: "Sharp fang from a predator",
                image: "🦷",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fang"
            },
            pelt: {
                name: "Rare Pelt",
                description: "A valuable animal pelt",
                image: "🦊",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "pelt"
            },
            // Foraging Resources
            mushroom: {
                name: "Mushroom",
                description: "Edible fungi from the forest",
                image: "🍄",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            herb: {
                name: "Herb",
                description: "Medicinal plant",
                image: "🌿",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            flower: {
                name: "Flower",
                description: "Colorful wildflower",
                image: "🌸",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            berries: {
                name: "Berries",
                description: "Sweet wild berries",
                image: "🫐",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            root: {
                name: "Root",
                description: "Edible plant root",
                image: "🥕",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            seed: {
                name: "Seeds",
                description: "Plant seeds for farming",
                image: "🌱",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            // Thieving Resources
            coinPouch: {
                name: "Coin Pouch",
                description: "Stolen money",
                image: "💰",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            jewelry: {
                name: "Jewelry",
                description: "Valuable trinkets",
                image: "💎",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            computerPart: {
                name: "Computer Part",
                description: "Electronic component",
                image: "🖥️",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            wire: {
                name: "Wire",
                description: "Copper wiring",
                image: "📎",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            scrap: {
                name: "Metal Scrap",
                description: "Salvaged metal",
                image: "🔩",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            keycard: {
                name: "Keycard",
                description: "Access card",
                image: "🎫",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            // Equipment - Tools (Foraging)
            wickerBasket: {
                name: "Wicker Basket",
                description: "A simple foraging basket",
                image: "🧺",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 5
                }
            },
            gatherersSatchel: {
                name: "Gatherer's Satchel",
                description: "A sturdy satchel for foraging",
                image: "🎒",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 10
                }
            },
            herbalistKit: {
                name: "Herbalist's Kit",
                description: "Professional foraging tools",
                image: "🧰",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 20
                }
            },
            masterGatherer: {
                name: "Master Gatherer's Set",
                description: "Expert foraging equipment",
                image: "🎒",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 40
                }
            },
            // Equipment - Tools (Thieving)
            lockpick: {
                name: "Lockpick Set",
                description: "Basic lockpicking tools",
                image: "🔓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 5
                }
            },
            crowbar: {
                name: "Crowbar",
                description: "For breaking and entering",
                image: "🔨",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 10
                }
            },
            advancedLockpick: {
                name: "Advanced Lockpick Set",
                description: "Professional thieving tools",
                image: "🔐",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 20
                }
            },
            masterThiefKit: {
                name: "Master Thief's Kit",
                description: "The best tools for stealing",
                image: "🎭",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 40
                }
            },
            // Equipment - Weapons
            dagger: {
                name: "Rusty Dagger",
                description: "A small, rusty blade",
                image: "🗡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "weapon",
                equipSlot: "weapon",
                stats: {
                    attackDamage: 6,
                    attackSpeed: 0.3,
                    accuracy: 5
                }
            },
            ironSword: {
                name: "Iron Sword",
                description: "A basic iron sword",
                image: "⚔️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "weapon",
                equipSlot: "weapon",
                stats: {
                    attackDamage: 12,
                    attackSpeed: 0.2,
                    accuracy: 5
                }
            },
            steelSword: {
                name: "Steel Sword",
                description: "A sharp steel blade",
                image: "🗡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "weapon",
                equipSlot: "weapon",
                stats: {
                    attackDamage: 20,
                    attackSpeed: 0.3,
                    accuracy: 10
                }
            },
            shortBow: {
                name: "Short Bow",
                description: "A basic hunting bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "weapon",
                equipSlot: "weapon",
                stats: {
                    attackDamage: 10,
                    attackSpeed: 0.4,
                    accuracy: 12
                }
            },
            longBow: {
                name: "Long Bow",
                description: "A powerful ranged weapon",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "weapon",
                equipSlot: "weapon",
                stats: {
                    attackDamage: 18,
                    attackSpeed: 0.3,
                    accuracy: 15
                }
            },
            // Equipment - Shields
            woodenShield: {
                name: "Wooden Shield",
                description: "A simple wooden shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "shield",
                equipSlot: "shield",
                stats: {
                    maxHealth: 15,
                    accuracy: -3
                }
            },
            ironShield: {
                name: "Iron Shield",
                description: "A sturdy iron shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "shield",
                equipSlot: "shield",
                stats: {
                    maxHealth: 30,
                    accuracy: -5,
                    attackSpeed: -0.1
                }
            },
            // Equipment - Helmets
            clothHood: {
                name: "Cloth Hood",
                description: "A simple cloth covering",
                image: "🧢",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "helmet",
                equipSlot: "helmet",
                stats: {
                    maxHealth: 5,
                    accuracy: 1
                }
            },
            leatherHelmet: {
                name: "Leather Helmet",
                description: "Basic head protection",
                image: "🪖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "helmet",
                equipSlot: "helmet",
                stats: {
                    maxHealth: 12,
                    accuracy: 2
                }
            },
            ironHelmet: {
                name: "Iron Helmet",
                description: "Heavy metal helmet",
                image: "⛑️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "helmet",
                equipSlot: "helmet",
                stats: {
                    maxHealth: 20,
                    attackSpeed: -0.05
                }
            },
            // Equipment - Chest Armor
            huntingJacket: {
                name: "Hunting Jacket",
                description: "A sturdy leather hunting jacket",
                image: "🧥",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 25,
                    accuracy: 3
                }
            },
            leatherArmor: {
                name: "Leather Armor",
                description: "Basic leather protection",
                image: "🦺",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 35,
                    attackSpeed: -0.05
                }
            },
            chainmail: {
                name: "Chainmail Armor",
                description: "Interlocking metal rings",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 50,
                    attackSpeed: -0.15
                }
            },
            ironArmor: {
                name: "Iron Plate Armor",
                description: "Heavy iron plating",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 70,
                    attackSpeed: -0.25,
                    accuracy: -5
                }
            },
            // Equipment - Legs
            clothPants: {
                name: "Cloth Pants",
                description: "Basic cloth leg protection",
                image: "👖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "legs",
                equipSlot: "legs",
                stats: {
                    maxHealth: 8
                }
            },
            leatherPants: {
                name: "Leather Pants",
                description: "Reinforced leather leggings",
                image: "👖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "legs",
                equipSlot: "legs",
                stats: {
                    maxHealth: 18,
                    attackSpeed: -0.02
                }
            },
            ironGreaves: {
                name: "Iron Greaves",
                description: "Heavy metal leg armor",
                image: "🦿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "legs",
                equipSlot: "legs",
                stats: {
                    maxHealth: 30,
                    attackSpeed: -0.1
                }
            },
            // Equipment - Neck
            bronzeAmulet: {
                name: "Bronze Amulet",
                description: "A simple bronze pendant",
                image: "📿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "neck",
                equipSlot: "neck",
                stats: {
                    maxHealth: 10,
                    attackDamage: 2
                }
            },
            silverNecklace: {
                name: "Silver Necklace",
                description: "An elegant silver chain",
                image: "📿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "neck",
                equipSlot: "neck",
                stats: {
                    maxHealth: 15,
                    accuracy: 5
                }
            },
            // Equipment - Ring
            copperRing: {
                name: "Copper Ring",
                description: "A basic copper band",
                image: "💍",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "ring",
                equipSlot: "ring",
                stats: {
                    attackDamage: 3,
                    accuracy: 2
                }
            },
            silverRing: {
                name: "Silver Ring",
                description: "A polished silver ring",
                image: "💍",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "ring",
                equipSlot: "ring",
                stats: {
                    attackDamage: 5,
                    attackSpeed: 0.05,
                    accuracy: 3
                }
            },
            // Equipment - Back
            travelersCloak: {
                name: "Traveler's Cloak",
                description: "A worn but sturdy cloak",
                image: "🧥",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "back",
                equipSlot: "back",
                stats: {
                    maxHealth: 12,
                    attackSpeed: 0.05
                }
            },
            woovenCape: {
                name: "Wooven Cape",
                description: "A finely crafted cape",
                image: "🦸",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "back",
                equipSlot: "back",
                stats: {
                    maxHealth: 20,
                    accuracy: 5
                }
            },
            // Consumables
            healthPotion: {
                name: "Health Potion",
                description: "Restores 50 health",
                image: "🧪",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "consumables",
                category: "potion"
            },
            bread: {
                name: "Bread",
                description: "Basic food item",
                image: "🍞",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "consumables",
                category: "food"
            }
        },

        // Enemy definitions (Modern Military Theme)
        enemies: {
            scout: {
                name: "Scout",
                description: "Lightly armed patrol unit",
                image: "🎯",
                stats: {
                    maxHealth: 40,
                    attackDamage: 5,
                    attackSpeed: 1.0,
                    accuracy: 65
                },
                rewards: {
                    gold: { min: 10, max: 20 },
                    medals: { min: 1, max: 3 },
                    exp: { combat: 10 }
                },
                lootTable: [
                    { itemId: "ore", min: 1, max: 3, chance: 0.40 },
                    { itemId: "wood", min: 2, max: 5, chance: 0.35 },
                    { itemId: "cloth", min: 1, max: 3, chance: 0.30 },
                    { itemId: "dagger", min: 1, max: 1, chance: 0.05 }
                ],
                respawnTime: 3000,
                unlockRequirement: null
            },
            soldier: {
                name: "Soldier",
                description: "Standard military unit",
                image: "🪖",
                stats: {
                    maxHealth: 80,
                    attackDamage: 12,
                    attackSpeed: 0.9,
                    accuracy: 70
                },
                rewards: {
                    gold: { min: 25, max: 50 },
                    medals: { min: 3, max: 7 },
                    exp: { combat: 25 }
                },
                lootTable: [
                    { itemId: "ore", min: 2, max: 5, chance: 0.35 },
                    { itemId: "wood", min: 3, max: 6, chance: 0.30 },
                    { itemId: "cloth", min: 2, max: 4, chance: 0.25 },
                    { itemId: "ironSword", min: 1, max: 1, chance: 0.08 },
                    { itemId: "leatherHelmet", min: 1, max: 1, chance: 0.06 }
                ],
                respawnTime: 4000,
                unlockRequirement: { combat: 3 }
            },
            operative: {
                name: "Operative",
                description: "Elite tactical unit",
                image: "🕵️",
                stats: {
                    maxHealth: 120,
                    attackDamage: 18,
                    attackSpeed: 1.2,
                    accuracy: 80
                },
                rewards: {
                    gold: { min: 60, max: 120 },
                    medals: { min: 8, max: 15 },
                    exp: { combat: 50 }
                },
                lootTable: [
                    { itemId: "ore", min: 4, max: 8, chance: 0.40 },
                    { itemId: "wood", min: 5, max: 10, chance: 0.25 },
                    { itemId: "cloth", min: 3, max: 6, chance: 0.30 },
                    { itemId: "steelSword", min: 1, max: 1, chance: 0.12 },
                    { itemId: "leatherArmor", min: 1, max: 1, chance: 0.10 },
                    { itemId: "ironHelmet", min: 1, max: 1, chance: 0.08 }
                ],
                respawnTime: 5000,
                unlockRequirement: { combat: 8 }
            },
            commander: {
                name: "Commander",
                description: "High-ranking military officer",
                image: "⭐",
                stats: {
                    maxHealth: 200,
                    attackDamage: 28,
                    attackSpeed: 0.8,
                    accuracy: 85
                },
                rewards: {
                    gold: { min: 150, max: 300 },
                    medals: { min: 15, max: 30 },
                    exp: { combat: 100 }
                },
                lootTable: [
                    { itemId: "ore", min: 8, max: 15, chance: 0.45 },
                    { itemId: "wood", min: 8, max: 15, chance: 0.25 },
                    { itemId: "cloth", min: 5, max: 10, chance: 0.30 },
                    { itemId: "steelSword", min: 1, max: 1, chance: 0.20 },
                    { itemId: "ironArmor", min: 1, max: 1, chance: 0.15 },
                    { itemId: "chainmail", min: 1, max: 1, chance: 0.12 },
                    { itemId: "silverRing", min: 1, max: 1, chance: 0.10 }
                ],
                respawnTime: 7000,
                unlockRequirement: { combat: 15 }
            }
        },

        // Crafting Recipe definitions
        recipes: {
            // === FORGING RECIPES ===
            // Melee weapons and metal components
            forgeSteelBar: {
                name: "Steel Bar",
                description: "A refined steel bar for crafting",
                skill: "forging",
                skillLevel: 5,
                craftingTime: 3000, // ms
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 3 },
                    { itemId: "coal", amount: 1 }
                ],
                outputs: [
                    { itemId: "steelBar", amount: 1 }
                ],
                expReward: 10
            },
            forgeCombatKnife: {
                name: "Combat Knife",
                description: "A tactical combat knife",
                skill: "forging",
                skillLevel: 1,
                craftingTime: 5000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 2 },
                    { itemId: "wood", amount: 1 }
                ],
                outputs: [
                    { itemId: "combatKnife", amount: 1 }
                ],
                expReward: 15
            },
            forgeWoodenShield: {
                name: "Wooden Shield",
                description: "Basic wooden shield for defense",
                skill: "forging",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "wood", amount: 4 },
                    { itemId: "ore", amount: 1 }
                ],
                outputs: [
                    { itemId: "woodenShield", amount: 1 }
                ],
                expReward: 8
            },
            forgeIronHelmet: {
                name: "Iron Helmet",
                description: "Sturdy iron helmet for head protection",
                skill: "forging",
                skillLevel: 3,
                craftingTime: 3500,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 5 },
                    { itemId: "leather", amount: 2 }
                ],
                outputs: [
                    { itemId: "ironHelmet", amount: 1 }
                ],
                expReward: 12
            },
            forgeIronArmor: {
                name: "Iron Armor",
                description: "Heavy iron chest armor",
                skill: "forging",
                skillLevel: 4,
                craftingTime: 5000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 8 },
                    { itemId: "leather", amount: 3 }
                ],
                outputs: [
                    { itemId: "ironArmor", amount: 1 }
                ],
                expReward: 20
            },
            forgeBodyArmor: {
                name: "Body Armor Plate",
                description: "Metal armor plating for body armor",
                skill: "forging",
                skillLevel: 10,
                craftingTime: 8000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "steelBar", amount: 3 },
                    { itemId: "scrap", amount: 2 }
                ],
                outputs: [
                    { itemId: "armorPlate", amount: 1 }
                ],
                expReward: 25
            },

            // === MACHINING RECIPES ===
            // Firearms and mechanical parts
            machineReceiverPart: {
                name: "Weapon Receiver",
                description: "The main body of a firearm",
                skill: "machining",
                skillLevel: 10,
                craftingTime: 10000,
                station: ["basicWorkbench", "machineShop", "precisionLab"],
                inputs: [
                    { itemId: "steelBar", amount: 2 },
                    { itemId: "scrap", amount: 3 }
                ],
                outputs: [
                    { itemId: "weaponReceiver", amount: 1 }
                ],
                expReward: 30
            },
            machinePistol: {
                name: "9mm Pistol",
                description: "A standard 9mm sidearm",
                skill: "machining",
                skillLevel: 5,
                craftingTime: 15000,
                station: ["basicWorkbench", "machineShop", "precisionLab"],
                inputs: [
                    { itemId: "weaponReceiver", amount: 1 },
                    { itemId: "steelBar", amount: 1 },
                    { itemId: "spring", amount: 2 }
                ],
                outputs: [
                    { itemId: "pistol9mm", amount: 1 }
                ],
                expReward: 50
            },
            machineOptic: {
                name: "Weapon Optic",
                description: "A precision aiming sight",
                skill: "machining",
                skillLevel: 15,
                craftingTime: 12000,
                station: ["machineShop", "precisionLab"],
                inputs: [
                    { itemId: "glass", amount: 2 },
                    { itemId: "scrap", amount: 3 },
                    { itemId: "wire", amount: 2 }
                ],
                outputs: [
                    { itemId: "redDotSight", amount: 1 }
                ],
                expReward: 40
            },

            // === COOKING RECIPES ===
            // Food and consumables with buffs
            cookBread: {
                name: "Bread",
                description: "Simple bread that restores a small amount of health",
                skill: "cooking",
                skillLevel: 1,
                craftingTime: 1500,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "grain", amount: 2 }
                ],
                outputs: [
                    { itemId: "bread", amount: 2 }
                ],
                expReward: 5
            },
            cookMeat: {
                name: "Cooked Meat",
                description: "Grilled meat that restores health",
                skill: "cooking",
                skillLevel: 1,
                craftingTime: 1000,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "meat", amount: 1 }
                ],
                outputs: [
                    { itemId: "cookedMeat", amount: 1 }
                ],
                expReward: 4
            },
            cookStew: {
                name: "Vegetable Stew",
                description: "Hearty stew that restores health and provides a small buff",
                skill: "cooking",
                skillLevel: 2,
                craftingTime: 2500,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "vegetables", amount: 3 },
                    { itemId: "meat", amount: 1 },
                    { itemId: "water", amount: 1 }
                ],
                outputs: [
                    { itemId: "vegetableStew", amount: 1 }
                ],
                expReward: 10
            },
            cookMRE: {
                name: "MRE (Meal Ready to Eat)",
                description: "Basic field ration that restores health",
                skill: "cooking",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "meat", amount: 2 },
                    { itemId: "berries", amount: 1 }
                ],
                outputs: [
                    { itemId: "mre", amount: 1 }
                ],
                expReward: 8
            },
            cookEnergyBar: {
                name: "Energy Bar",
                description: "Provides a temporary stamina boost",
                skill: "cooking",
                skillLevel: 5,
                craftingTime: 3000,
                station: ["fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "grain", amount: 3 },
                    { itemId: "honey", amount: 1 },
                    { itemId: "nuts", amount: 2 }
                ],
                outputs: [
                    { itemId: "energyBar", amount: 2 }
                ],
                expReward: 12
            },
            cookStimPack: {
                name: "Combat Stim",
                description: "Temporary combat effectiveness boost",
                skill: "cooking",
                skillLevel: 15,
                craftingTime: 5000,
                station: ["fullKitchen"],
                inputs: [
                    { itemId: "herb", amount: 4 },
                    { itemId: "water", amount: 2 },
                    { itemId: "salt", amount: 1 }
                ],
                outputs: [
                    { itemId: "combatStim", amount: 1 }
                ],
                expReward: 25
            },

            // === CHEMISTRY RECIPES ===
            // Medical supplies and explosives
            chemHealthPotion: {
                name: "Health Potion",
                description: "Basic potion that restores health",
                skill: "chemistry",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "herb", amount: 2 },
                    { itemId: "water", amount: 1 }
                ],
                outputs: [
                    { itemId: "healthPotion", amount: 1 }
                ],
                expReward: 6
            },
            chemStaminaPotion: {
                name: "Stamina Potion",
                description: "Weak potion that restores stamina",
                skill: "chemistry",
                skillLevel: 2,
                craftingTime: 2500,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "herb", amount: 2 },
                    { itemId: "berries", amount: 2 },
                    { itemId: "water", amount: 1 }
                ],
                outputs: [
                    { itemId: "staminaPotion", amount: 1 }
                ],
                expReward: 8
            },
            chemAntidote: {
                name: "Antidote",
                description: "Cures poison and negative effects",
                skill: "chemistry",
                skillLevel: 3,
                craftingTime: 3000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "herb", amount: 3 },
                    { itemId: "flower", amount: 2 },
                    { itemId: "alcohol", amount: 1 }
                ],
                outputs: [
                    { itemId: "antidote", amount: 1 }
                ],
                expReward: 12
            },
            chemMedKit: {
                name: "Medical Kit",
                description: "Restores significant health",
                skill: "chemistry",
                skillLevel: 5,
                craftingTime: 6000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "cloth", amount: 2 },
                    { itemId: "alcohol", amount: 1 },
                    { itemId: "herb", amount: 3 }
                ],
                outputs: [
                    { itemId: "medKit", amount: 1 }
                ],
                expReward: 20
            },
            chemGrenade: {
                name: "Frag Grenade",
                description: "Explosive grenade for combat",
                skill: "chemistry",
                skillLevel: 10,
                craftingTime: 8000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "explosivePowder", amount: 3 },
                    { itemId: "scrap", amount: 2 },
                    { itemId: "wire", amount: 1 }
                ],
                outputs: [
                    { itemId: "fragGrenade", amount: 1 }
                ],
                expReward: 30
            },
            chemExplosive: {
                name: "C4 Explosive",
                description: "High-grade plastic explosive",
                skill: "chemistry",
                skillLevel: 20,
                craftingTime: 15000,
                station: ["chemLab", "researchLab"],
                inputs: [
                    { itemId: "explosivePowder", amount: 5 },
                    { itemId: "plastic", amount: 3 },
                    { itemId: "detonator", amount: 1 }
                ],
                outputs: [
                    { itemId: "c4Explosive", amount: 1 }
                ],
                expReward: 50
            },

            // === TEXTILES RECIPES ===
            // Clothing and tactical gear
            textileCloth: {
                name: "Processed Cloth",
                description: "Clean, processed cloth for crafting",
                skill: "textiles",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "rawFiber", amount: 4 }
                ],
                outputs: [
                    { itemId: "cloth", amount: 2 }
                ],
                expReward: 5
            },
            textileClothHood: {
                name: "Cloth Hood",
                description: "Simple cloth hood for basic protection",
                skill: "textiles",
                skillLevel: 1,
                craftingTime: 1500,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 2 },
                    { itemId: "thread", amount: 1 }
                ],
                outputs: [
                    { itemId: "clothHood", amount: 1 }
                ],
                expReward: 6
            },
            textileClothPants: {
                name: "Cloth Pants",
                description: "Basic cloth pants",
                skill: "textiles",
                skillLevel: 1,
                craftingTime: 1500,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 3 },
                    { itemId: "thread", amount: 1 }
                ],
                outputs: [
                    { itemId: "clothPants", amount: 1 }
                ],
                expReward: 6
            },
            textileLeatherArmor: {
                name: "Leather Armor",
                description: "Durable leather chest armor",
                skill: "textiles",
                skillLevel: 3,
                craftingTime: 3000,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "leather", amount: 4 },
                    { itemId: "thread", amount: 2 }
                ],
                outputs: [
                    { itemId: "leatherArmor", amount: 1 }
                ],
                expReward: 15
            },
            textileHuntingJacket: {
                name: "Hunting Jacket",
                description: "Warm jacket with pockets",
                skill: "textiles",
                skillLevel: 2,
                craftingTime: 2500,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 4 },
                    { itemId: "leather", amount: 2 },
                    { itemId: "thread", amount: 2 }
                ],
                outputs: [
                    { itemId: "huntingJacket", amount: 1 }
                ],
                expReward: 12
            },
            textileTacticalVest: {
                name: "Tactical Vest",
                description: "Lightweight vest with pockets",
                skill: "textiles",
                skillLevel: 8,
                craftingTime: 10000,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 5 },
                    { itemId: "thread", amount: 3 },
                    { itemId: "buckle", amount: 2 }
                ],
                outputs: [
                    { itemId: "tacticalVest", amount: 1 }
                ],
                expReward: 30
            },
            textileCamo: {
                name: "Camouflage Uniform",
                description: "Stealth-enhancing camo clothing",
                skill: "textiles",
                skillLevel: 15,
                craftingTime: 12000,
                station: ["tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 8 },
                    { itemId: "dye", amount: 3 },
                    { itemId: "thread", amount: 5 }
                ],
                outputs: [
                    { itemId: "camoUniform", amount: 1 }
                ],
                expReward: 40
            },

            // === ENGINEERING RECIPES ===
            // Tech items and tools
            engineerCircuitBoard: {
                name: "Circuit Board",
                description: "Basic electronic component",
                skill: "engineering",
                skillLevel: 5,
                craftingTime: 8000,
                station: ["engineeringDesk", "techBench", "innovationCenter"],
                inputs: [
                    { itemId: "wire", amount: 4 },
                    { itemId: "plastic", amount: 2 },
                    { itemId: "solder", amount: 1 }
                ],
                outputs: [
                    { itemId: "circuitBoard", amount: 1 }
                ],
                expReward: 25
            },
            engineerDrone: {
                name: "Recon Drone",
                description: "Small surveillance drone",
                skill: "engineering",
                skillLevel: 20,
                craftingTime: 20000,
                station: ["techBench", "innovationCenter"],
                inputs: [
                    { itemId: "circuitBoard", amount: 3 },
                    { itemId: "motor", amount: 4 },
                    { itemId: "battery", amount: 2 },
                    { itemId: "plastic", amount: 5 }
                ],
                outputs: [
                    { itemId: "reconDrone", amount: 1 }
                ],
                expReward: 75
            },
            engineerTool: {
                name: "Multi-Tool",
                description: "Versatile engineering tool",
                skill: "engineering",
                skillLevel: 10,
                craftingTime: 10000,
                station: ["engineeringDesk", "techBench", "innovationCenter"],
                inputs: [
                    { itemId: "steelBar", amount: 2 },
                    { itemId: "scrap", amount: 3 },
                    { itemId: "spring", amount: 2 }
                ],
                outputs: [
                    { itemId: "multiTool", amount: 1 }
                ],
                expReward: 35
            }
        },

        // Resource Node definitions
        resourceNodes: {
            // MINING NODES
            copperVein: {
                name: "Copper Vein",
                description: "A small vein of copper ore",
                image: "🟠",
                skill: "mining",
                skillLevel: 1,
                maxHealth: 50,
                failRate: 0.05, // 5% fail rate
                availableIn: ["startingPlains", "darkForest"],
                rewards: [
                    { itemId: "copperOre", min: 1, max: 3, chance: 0.9 },
                    { itemId: "stone", min: 1, max: 2, chance: 0.4 },
                    { exp: { mining: 5 }, chance: 1.0 }
                ]
            },
            tinRock: {
                name: "Tin Rock",
                description: "A deposit of tin ore",
                image: "⚪",
                skill: "mining",
                skillLevel: 5,
                maxHealth: 75,
                failRate: 0.08,
                availableIn: ["startingPlains", "darkForest"],
                rewards: [
                    { itemId: "tinOre", min: 1, max: 2, chance: 0.85 },
                    { itemId: "stone", min: 1, max: 3, chance: 0.5 },
                    { exp: { mining: 8 }, chance: 1.0 }
                ]
            },
            coalDeposit: {
                name: "Coal Deposit",
                description: "A dark coal deposit",
                image: "⚫",
                skill: "mining",
                skillLevel: 10,
                maxHealth: 100,
                failRate: 0.10,
                availableIn: ["darkForest", "mountainPass"],
                rewards: [
                    { itemId: "coal", min: 2, max: 4, chance: 0.8 },
                    { itemId: "stone", min: 2, max: 4, chance: 0.6 },
                    { exp: { mining: 12 }, chance: 1.0 }
                ]
            },
            ironVein: {
                name: "Iron Vein",
                description: "A rich vein of iron ore",
                image: "⛏️",
                skill: "mining",
                skillLevel: 15,
                maxHealth: 150,
                failRate: 0.12,
                availableIn: ["darkForest", "mountainPass"],
                rewards: [
                    { itemId: "ore", min: 2, max: 5, chance: 0.75 },
                    { itemId: "coal", min: 1, max: 2, chance: 0.3 },
                    { itemId: "stone", min: 2, max: 5, chance: 0.7 },
                    { exp: { mining: 20 }, chance: 1.0 }
                ]
            },
            silverVein: {
                name: "Silver Vein",
                description: "A shimmering silver vein",
                image: "⚪",
                skill: "mining",
                skillLevel: 25,
                maxHealth: 200,
                failRate: 0.15,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "silverOre", min: 1, max: 3, chance: 0.7 },
                    { itemId: "ore", min: 1, max: 3, chance: 0.5 },
                    { itemId: "stone", min: 3, max: 6, chance: 0.8 },
                    { exp: { mining: 35 }, chance: 1.0 }
                ]
            },
            goldVein: {
                name: "Gold Vein",
                description: "A precious gold vein",
                image: "🟡",
                skill: "mining",
                skillLevel: 35,
                maxHealth: 300,
                failRate: 0.20,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "goldOre", min: 1, max: 2, chance: 0.6 },
                    { itemId: "silverOre", min: 1, max: 2, chance: 0.4 },
                    { itemId: "ore", min: 2, max: 4, chance: 0.6 },
                    { itemId: "stone", min: 4, max: 8, chance: 0.9 },
                    { exp: { mining: 50 }, chance: 1.0 }
                ]
            },

            // LOGGING NODES
            oakTree: {
                name: "Oak Tree",
                description: "A sturdy oak tree",
                image: "🌳",
                skill: "logging",
                skillLevel: 1,
                maxHealth: 60,
                failRate: 0.05,
                availableIn: ["startingPlains", "darkForest"],
                rewards: [
                    { itemId: "wood", min: 2, max: 4, chance: 0.95 },
                    { exp: { logging: 6 }, chance: 1.0 }
                ]
            },
            pineTree: {
                name: "Pine Tree",
                description: "A tall pine tree",
                image: "🌲",
                skill: "logging",
                skillLevel: 10,
                maxHealth: 100,
                failRate: 0.08,
                availableIn: ["darkForest", "mountainPass"],
                rewards: [
                    { itemId: "wood", min: 3, max: 6, chance: 0.9 },
                    { itemId: "stone", min: 1, max: 2, chance: 0.2 },
                    { exp: { logging: 15 }, chance: 1.0 }
                ]
            },

            // FISHING NODES
            lake: {
                name: "Lake",
                description: "A calm lake teeming with fish",
                image: "🌊",
                skill: "fishing",
                skillLevel: 1,
                maxHealth: 40,
                failRate: 0.15,
                availableIn: ["startingPlains", "darkForest"],
                rewards: [
                    { itemId: "minnow", min: 1, max: 3, chance: 0.6 },
                    { itemId: "trout", min: 1, max: 2, chance: 0.4 },
                    { itemId: "bass", min: 1, max: 1, chance: 0.2 },
                    { exp: { fishing: 5 }, chance: 1.0 }
                ]
            },
            stream: {
                name: "Stream",
                description: "A flowing stream with clear water",
                image: "💧",
                skill: "fishing",
                skillLevel: 5,
                maxHealth: 50,
                failRate: 0.18,
                availableIn: ["startingPlains", "darkForest", "mountainPass"],
                rewards: [
                    { itemId: "trout", min: 1, max: 2, chance: 0.65 },
                    { itemId: "bass", min: 1, max: 2, chance: 0.35 },
                    { itemId: "minnow", min: 2, max: 4, chance: 0.4 },
                    { exp: { fishing: 8 }, chance: 1.0 }
                ]
            },
            river: {
                name: "River",
                description: "A wide river with strong currents",
                image: "🌊",
                skill: "fishing",
                skillLevel: 15,
                maxHealth: 70,
                failRate: 0.22,
                availableIn: ["darkForest"],
                rewards: [
                    { itemId: "bass", min: 1, max: 3, chance: 0.55 },
                    { itemId: "pike", min: 1, max: 2, chance: 0.4 },
                    { itemId: "salmon", min: 1, max: 1, chance: 0.25 },
                    { itemId: "trout", min: 1, max: 2, chance: 0.5 },
                    { exp: { fishing: 20 }, chance: 1.0 }
                ]
            },
            waterfall: {
                name: "Waterfall",
                description: "A powerful waterfall where salmon leap",
                image: "💦",
                skill: "fishing",
                skillLevel: 25,
                maxHealth: 90,
                failRate: 0.28,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "salmon", min: 1, max: 3, chance: 0.65 },
                    { itemId: "pike", min: 1, max: 2, chance: 0.45 },
                    { itemId: "goldfish", min: 1, max: 1, chance: 0.15 },
                    { itemId: "bass", min: 1, max: 3, chance: 0.6 },
                    { exp: { fishing: 35 }, chance: 1.0 }
                ]
            },

            // HUNTING NODES
            plain: {
                name: "Plain",
                description: "Open grasslands with small game",
                image: "🌾",
                skill: "hunting",
                skillLevel: 1,
                maxHealth: 45,
                failRate: 0.20,
                availableIn: ["startingPlains"],
                rewards: [
                    { itemId: "rawMeat", min: 1, max: 2, chance: 0.65 },
                    { itemId: "hide", min: 1, max: 1, chance: 0.45 },
                    { itemId: "feather", min: 1, max: 3, chance: 0.5 },
                    { itemId: "bone", min: 1, max: 1, chance: 0.3 },
                    { exp: { hunting: 6 }, chance: 1.0 }
                ]
            },
            hardwoodForest: {
                name: "Hardwood Forest",
                description: "Dense forest with deer and boar",
                image: "🌳",
                skill: "hunting",
                skillLevel: 10,
                maxHealth: 70,
                failRate: 0.25,
                availableIn: ["darkForest"],
                rewards: [
                    { itemId: "rawMeat", min: 2, max: 4, chance: 0.7 },
                    { itemId: "hide", min: 1, max: 3, chance: 0.6 },
                    { itemId: "bone", min: 1, max: 2, chance: 0.5 },
                    { itemId: "fang", min: 1, max: 1, chance: 0.2 },
                    { exp: { hunting: 15 }, chance: 1.0 }
                ]
            },
            pineForest: {
                name: "Pine Forest",
                description: "Coniferous forest with elk and wolves",
                image: "🌲",
                skill: "hunting",
                skillLevel: 20,
                maxHealth: 90,
                failRate: 0.28,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "rawMeat", min: 2, max: 5, chance: 0.65 },
                    { itemId: "hide", min: 2, max: 4, chance: 0.65 },
                    { itemId: "fang", min: 1, max: 2, chance: 0.35 },
                    { itemId: "bone", min: 2, max: 3, chance: 0.6 },
                    { itemId: "pelt", min: 1, max: 1, chance: 0.15 },
                    { exp: { hunting: 28 }, chance: 1.0 }
                ]
            },
            mountain: {
                name: "Mountain",
                description: "Rocky peaks with rare mountain beasts",
                image: "⛰️",
                skill: "hunting",
                skillLevel: 30,
                maxHealth: 120,
                failRate: 0.32,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "rawMeat", min: 3, max: 6, chance: 0.6 },
                    { itemId: "hide", min: 2, max: 5, chance: 0.7 },
                    { itemId: "fang", min: 1, max: 3, chance: 0.5 },
                    { itemId: "bone", min: 2, max: 4, chance: 0.65 },
                    { itemId: "pelt", min: 1, max: 2, chance: 0.25 },
                    { exp: { hunting: 45 }, chance: 1.0 }
                ]
            },

            // FORAGING NODES
            flowerPatch: {
                name: "Flower Patch",
                description: "Colorful wildflowers grow here",
                image: "🌸",
                skill: "foraging",
                skillLevel: 1,
                maxHealth: 30,
                failRate: 0.10,
                availableIn: ["startingPlains"],
                rewards: [
                    { itemId: "flower", min: 2, max: 4, chance: 0.8 },
                    { itemId: "seed", min: 1, max: 2, chance: 0.4 },
                    { exp: { foraging: 4 }, chance: 1.0 }
                ]
            },
            berryBush: {
                name: "Berry Bush",
                description: "A bush laden with berries",
                image: "🫐",
                skill: "foraging",
                skillLevel: 5,
                maxHealth: 40,
                failRate: 0.12,
                availableIn: ["startingPlains", "darkForest"],
                rewards: [
                    { itemId: "berries", min: 2, max: 5, chance: 0.75 },
                    { itemId: "seed", min: 1, max: 1, chance: 0.3 },
                    { exp: { foraging: 7 }, chance: 1.0 }
                ]
            },
            mushroomLog: {
                name: "Mushroom Log",
                description: "A fallen log covered in mushrooms",
                image: "🍄",
                skill: "foraging",
                skillLevel: 10,
                maxHealth: 50,
                failRate: 0.15,
                availableIn: ["darkForest"],
                rewards: [
                    { itemId: "mushroom", min: 1, max: 3, chance: 0.7 },
                    { itemId: "root", min: 1, max: 2, chance: 0.4 },
                    { exp: { foraging: 12 }, chance: 1.0 }
                ]
            },
            herbGarden: {
                name: "Herb Garden",
                description: "Wild herbs growing naturally",
                image: "🌿",
                skill: "foraging",
                skillLevel: 15,
                maxHealth: 60,
                failRate: 0.18,
                availableIn: ["darkForest", "mountainPass"],
                rewards: [
                    { itemId: "herb", min: 2, max: 4, chance: 0.7 },
                    { itemId: "flower", min: 1, max: 3, chance: 0.5 },
                    { itemId: "seed", min: 1, max: 2, chance: 0.35 },
                    { exp: { foraging: 18 }, chance: 1.0 }
                ]
            },
            rootField: {
                name: "Root Field",
                description: "Ground rich with edible roots",
                image: "🥕",
                skill: "foraging",
                skillLevel: 20,
                maxHealth: 75,
                failRate: 0.20,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "root", min: 2, max: 5, chance: 0.75 },
                    { itemId: "herb", min: 1, max: 2, chance: 0.4 },
                    { itemId: "mushroom", min: 1, max: 2, chance: 0.3 },
                    { exp: { foraging: 25 }, chance: 1.0 }
                ]
            },
            alpineMeadow: {
                name: "Alpine Meadow",
                description: "High altitude plants and rare herbs",
                image: "🌼",
                skill: "foraging",
                skillLevel: 30,
                maxHealth: 100,
                failRate: 0.25,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "herb", min: 3, max: 6, chance: 0.65 },
                    { itemId: "flower", min: 2, max: 5, chance: 0.7 },
                    { itemId: "mushroom", min: 1, max: 3, chance: 0.45 },
                    { itemId: "seed", min: 2, max: 4, chance: 0.5 },
                    { exp: { foraging: 40 }, chance: 1.0 }
                ]
            },

            // THIEVING NODES
            abandonedCart: {
                name: "Abandoned Cart",
                description: "An old cart with forgotten goods",
                image: "🛒",
                skill: "thieving",
                skillLevel: 1,
                maxHealth: 40,
                failRate: 0.25,
                availableIn: ["startingPlains"],
                rewards: [
                    { itemId: "coinPouch", min: 1, max: 2, chance: 0.6 },
                    { itemId: "scrap", min: 1, max: 3, chance: 0.5 },
                    { exp: { thieving: 5 }, chance: 1.0 }
                ]
            },
            merchantStall: {
                name: "Merchant Stall",
                description: "An unattended merchant stall",
                image: "🏪",
                skill: "thieving",
                skillLevel: 8,
                maxHealth: 60,
                failRate: 0.30,
                availableIn: ["startingPlains", "darkForest"],
                rewards: [
                    { itemId: "coinPouch", min: 2, max: 4, chance: 0.65 },
                    { itemId: "jewelry", min: 1, max: 1, chance: 0.3 },
                    { itemId: "wire", min: 1, max: 2, chance: 0.4 },
                    { exp: { thieving: 10 }, chance: 1.0 }
                ]
            },
            guardPost: {
                name: "Guard Post",
                description: "A lightly guarded checkpoint",
                image: "🏛️",
                skill: "thieving",
                skillLevel: 15,
                maxHealth: 80,
                failRate: 0.35,
                availableIn: ["darkForest"],
                rewards: [
                    { itemId: "coinPouch", min: 2, max: 5, chance: 0.6 },
                    { itemId: "keycard", min: 1, max: 1, chance: 0.4 },
                    { itemId: "scrap", min: 2, max: 4, chance: 0.55 },
                    { exp: { thieving: 20 }, chance: 1.0 }
                ]
            },
            techWarehouse: {
                name: "Tech Warehouse",
                description: "Storage for electronic components",
                image: "🏭",
                skill: "thieving",
                skillLevel: 22,
                maxHealth: 100,
                failRate: 0.38,
                availableIn: ["darkForest", "mountainPass"],
                rewards: [
                    { itemId: "computerPart", min: 1, max: 3, chance: 0.6 },
                    { itemId: "wire", min: 2, max: 5, chance: 0.7 },
                    { itemId: "scrap", min: 3, max: 6, chance: 0.65 },
                    { exp: { thieving: 30 }, chance: 1.0 }
                ]
            },
            mansion: {
                name: "Wealthy Mansion",
                description: "Home of the wealthy elite",
                image: "🏰",
                skill: "thieving",
                skillLevel: 28,
                maxHealth: 120,
                failRate: 0.40,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "coinPouch", min: 4, max: 8, chance: 0.7 },
                    { itemId: "jewelry", min: 2, max: 4, chance: 0.6 },
                    { itemId: "keycard", min: 1, max: 2, chance: 0.45 },
                    { exp: { thieving: 45 }, chance: 1.0 }
                ]
            },
            dataCenter: {
                name: "Data Center",
                description: "High security tech facility",
                image: "🖥️",
                skill: "thieving",
                skillLevel: 35,
                maxHealth: 150,
                failRate: 0.45,
                availableIn: ["mountainPass"],
                rewards: [
                    { itemId: "computerPart", min: 3, max: 6, chance: 0.7 },
                    { itemId: "wire", min: 4, max: 8, chance: 0.75 },
                    { itemId: "keycard", min: 2, max: 3, chance: 0.55 },
                    { itemId: "scrap", min: 5, max: 10, chance: 0.8 },
                    { exp: { thieving: 60 }, chance: 1.0 }
                ]
            }
        },

        // Crafting Node definitions (crafting stations)
        craftingNodes: {
            // FORGING STATIONS
            basicForge: {
                name: "Basic Forge",
                description: "A simple forge for basic metalworking",
                image: "🔥",
                skill: "forging",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            advancedForge: {
                name: "Advanced Forge",
                description: "A well-equipped forge for advanced metalwork",
                image: "⚒️",
                skill: "forging",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            masterForge: {
                name: "Master Forge",
                description: "A state-of-the-art metalworking facility",
                image: "🏭",
                skill: "forging",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // MACHINING STATIONS
            basicWorkbench: {
                name: "Basic Workbench",
                description: "A simple workbench for basic machining",
                image: "🔧",
                skill: "machining",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            machineShop: {
                name: "Machine Shop",
                description: "A workshop with precision tools",
                image: "⚙️",
                skill: "machining",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            precisionLab: {
                name: "Precision Lab",
                description: "High-tech machining facility",
                image: "🏭",
                skill: "machining",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // COOKING STATIONS
            campfire: {
                name: "Campfire",
                description: "A simple fire for basic cooking",
                image: "🔥",
                skill: "cooking",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            fieldKitchen: {
                name: "Field Kitchen",
                description: "A portable cooking station",
                image: "🍳",
                skill: "cooking",
                skillLevel: 10,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            fullKitchen: {
                name: "Full Kitchen",
                description: "A fully equipped professional kitchen",
                image: "👨‍🍳",
                skill: "cooking",
                skillLevel: 25,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // CHEMISTRY STATIONS
            chemTable: {
                name: "Chemistry Table",
                description: "Basic chemistry equipment",
                image: "🧪",
                skill: "chemistry",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            chemLab: {
                name: "Chemistry Lab",
                description: "Advanced chemical synthesis facility",
                image: "⚗️",
                skill: "chemistry",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            researchLab: {
                name: "Research Lab",
                description: "State-of-the-art research facility",
                image: "🔬",
                skill: "chemistry",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // TEXTILES STATIONS
            sewingKit: {
                name: "Sewing Kit",
                description: "Basic sewing and textile tools",
                image: "🧵",
                skill: "textiles",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            tailorShop: {
                name: "Tailor Shop",
                description: "Professional textile crafting station",
                image: "🪡",
                skill: "textiles",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            fabricMill: {
                name: "Fabric Mill",
                description: "Industrial textile production facility",
                image: "🏭",
                skill: "textiles",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // ENGINEERING STATIONS
            engineeringDesk: {
                name: "Engineering Desk",
                description: "Basic engineering and design station",
                image: "📐",
                skill: "engineering",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            techBench: {
                name: "Tech Bench",
                description: "Advanced electronics and tech workspace",
                image: "💻",
                skill: "engineering",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            innovationCenter: {
                name: "Innovation Center",
                description: "Cutting-edge R&D facility",
                image: "🏢",
                skill: "engineering",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            }
        },

        // Generator definitions
        generators: {
            miner: {
                name: "Miner",
                description: "Mines ore automatically",
                // Base production per second at level 1
                baseProduction: 1,
                // Resource produced
                produces: "ore",
                // Cost formula: baseCost * (costMultiplier ^ level)
                baseCost: 10,
                costMultiplier: 1.15,
                costResource: "gold"
            },
            lumberjack: {
                name: "Lumberjack",
                description: "Chops wood automatically",
                baseProduction: 1,
                produces: "wood",
                baseCost: 10,
                costMultiplier: 1.15,
                costResource: "gold"
            },
            merchant: {
                name: "Merchant",
                description: "Generates gold automatically",
                baseProduction: 0.5,
                produces: "gold",
                baseCost: 50,
                costMultiplier: 1.2,
                costResource: "gold",
                unlockRequirement: { gold: 25 }
            }
        },

        // Upgrade definitions
        upgrades: {
            goldBoost1: {
                name: "Basic Commerce",
                description: "Increases gold generation",
                // Effect formula: each level adds +10% to gold generation
                effectPerLevel: 0.1,
                affectsResource: "gold",
                maxLevel: 10,
                // Cost formula: baseCost * (costMultiplier ^ level)
                baseCost: 25,
                costMultiplier: 1.5,
                costResource: "gold"
            },
            goldBoost2: {
                name: "Advanced Trading",
                description: "Further increases gold generation",
                effectPerLevel: 0.15,
                affectsResource: "gold",
                maxLevel: 10,
                baseCost: 500,
                costMultiplier: 1.8,
                costResource: "gold",
                unlockRequirement: { goldBoost1: 5 } // Requires first upgrade at level 5
            },
            miningEfficiency: {
                name: "Mining Efficiency",
                description: "Miners produce more ore",
                effectPerLevel: 0.2,
                affectsResource: "ore",
                maxLevel: 10,
                baseCost: 50,
                costMultiplier: 1.6,
                costResource: "ore"
            },
            loggingEfficiency: {
                name: "Logging Efficiency",
                description: "Lumberjacks produce more wood",
                effectPerLevel: 0.2,
                affectsResource: "wood",
                maxLevel: 10,
                baseCost: 50,
                costMultiplier: 1.6,
                costResource: "wood"
            },
            merchantSkill: {
                name: "Merchant Mastery",
                description: "Merchants generate significantly more gold",
                effectPerLevel: 0.25,
                affectsResource: "gold",
                maxLevel: 5,
                baseCost: 200,
                costMultiplier: 2.0,
                costResource: "gold",
                unlockRequirement: { gold: 100, merchant: 3 }
            }
        }
    },

    // =============================================================================
    // CORE GAME LOGIC
    // =============================================================================

    /**
     * Initialize the game engine
     */
    init() {
        console.log("🎮 Game Engine Initialized");

        // Generate the world map if not already generated
        if (!this.definitions.worldMap) {
            console.log("🗺️ Generating hexagonal world map (radius 10)...");
            this.definitions.worldMap = this.generateWorldMap(10);
            console.log(`✅ Generated ${Object.keys(this.definitions.worldMap).length} regions`);

            // Verify starting region exists
            if (this.definitions.worldMap["region_-10_0"]) {
                console.log("✅ Starting region (region_-10_0) exists in world map");
            } else {
                console.error("❌ Starting region (region_-10_0) NOT found in world map!");
                console.log("Available regions (first 10):", Object.keys(this.definitions.worldMap).slice(0, 10));
            }
        }

        // Ensure new features exist for backward compatibility with old saves
        if (!this.state.nodeCollection) {
            this.state.nodeCollection = {
                activeNode: null,
                lastCollectionTick: 0,
                selectedSkill: null
            };
            console.log("✅ Initialized nodeCollection system");
        }

        // Add fishing and hunting skills if missing (backward compatibility)
        if (!this.state.skills.fishing) {
            this.state.skills.fishing = { level: 1, exp: 0, unlocked: true };
            console.log("✅ Added fishing skill");
        }
        if (!this.state.skills.hunting) {
            this.state.skills.hunting = { level: 1, exp: 0, unlocked: true };
            console.log("✅ Added hunting skill");
        }
        if (!this.state.skills.foraging) {
            this.state.skills.foraging = { level: 1, exp: 0, unlocked: true };
            console.log("✅ Added foraging skill");
        }
        if (!this.state.skills.thieving) {
            this.state.skills.thieving = { level: 1, exp: 0, unlocked: true };
            console.log("✅ Added thieving skill");
        }

        // Ensure all skills start at level 1 minimum (backward compatibility)
        for (let skillId in this.state.skills) {
            if (this.state.skills[skillId].level === 0) {
                this.state.skills[skillId].level = 1;
                console.log(`✅ Updated ${skillId} to level 1`);
            }
        }

        // Add character level if missing (backward compatibility)
        if (!this.state.characterLevel) {
            this.state.characterLevel = {
                level: 1,
                exp: 0,
                unassignedAttributePoints: 0
            };
            console.log("✅ Added character level system");
        }

        // Add combat attributes if missing (backward compatibility)
        if (!this.state.combatAttributes) {
            this.state.combatAttributes = {
                health: 1,
                defense: 1,
                strength: 1,
                stealth: 1,
                perception: 1,
                mobility: 1,
                intellect: 1
            };
            console.log("✅ Added combat attributes");
        }

        // Initialize StatCalculator integration
        this.initializeStatCalculator();

        // Migrate to currencies system (backward compatibility)
        if (!this.state.currencies) {
            this.state.currencies = {
                gold: this.state.resources.gold || 0,
                medals: 0
            };
            delete this.state.resources.gold;
            console.log("✅ Migrated to currencies system");
        }

        // Add pending loot to combat (backward compatibility)
        if (this.state.combat && !this.state.combat.pendingLoot) {
            this.state.combat.pendingLoot = [];
            console.log("✅ Added pending loot to combat");
        }

        // Add crafting skills if missing (backward compatibility)
        const craftingSkills = ['forging', 'machining', 'cooking', 'chemistry', 'textiles', 'engineering'];
        for (let skill of craftingSkills) {
            if (!this.state.skills[skill]) {
                this.state.skills[skill] = { level: 1, exp: 0, unlocked: true };
                console.log(`✅ Added ${skill} skill`);
            }
        }

        // Add crafting system if missing (backward compatibility)
        if (!this.state.crafting) {
            this.state.crafting = {
                discoveredStations: [],
                activeCrafts: [],
                selectedSkill: null
            };
            console.log("✅ Added crafting system");
        }

        // Add engineering tech tree if missing (backward compatibility)
        if (!this.state.engineeringTech) {
            this.state.engineeringTech = {
                researched: [],
                activeResearch: null,
                analytics: {
                    totalResearchCompleted: 0,
                    totalResearchTime: 0,
                    totalXpGained: 0,
                    totalTomesSpent: 0,
                    byTech: {}
                }
            };
            console.log("✅ Added engineering tech tree system");
        }

        // Initialize Engineering System functions
        if (typeof EngineeringSystem !== 'undefined') {
            EngineeringSystem.init(this);
            console.log("✅ Initialized Engineering System");
        }

        // Add current activity tracking if missing (backward compatibility)
        if (!this.state.hasOwnProperty('currentActivity')) {
            this.state.currentActivity = null;
            console.log("✅ Added currentActivity tracking");
        }

        // Add active navigation if missing (backward compatibility)
        if (!this.state.activeNavigation) {
            this.state.activeNavigation = {
                isNavigating: false,
                lastNavigationTick: 0,
                regionHealth: 100,
                maxRegionHealth: 100
            };
            console.log("✅ Added active navigation system");
        }

        // Add isNavigating if missing
        if (this.state.activeNavigation && !this.state.activeNavigation.hasOwnProperty('isNavigating')) {
            this.state.activeNavigation.isNavigating = false;
            console.log("✅ Added isNavigating flag");
        }

        // Migrate old region structure to new hex grid system
        if (this.state.currentRegion === "startingPlains" ||
            this.state.currentRegion === "region_0_0" ||
            this.state.currentRegion === "region_0_10") {
            this.state.currentRegion = "region_-10_0"; // New starting position (far left, axial coords)
            console.log("✅ Migrated to hexagonal world map system");
        }

        // Ensure starting region exists in state
        if (!this.state.regions[this.state.currentRegion]) {
            this.state.regions[this.state.currentRegion] = {
                discovered: true,
                discoveryProgress: 0,
                discoveredLocations: [],
                discoveredNodeTypes: [],
                nodeHealthBonuses: {},
                discoveredExitPaths: [],
                discoveredCraftingStations: []
            };
            console.log(`✅ Created region state for ${this.state.currentRegion}`);
        }

        // Update region states to new structure
        for (let regionId in this.state.regions) {
            const regionState = this.state.regions[regionId];
            if (!regionState.discoveryProgress && regionState.fogProgress !== undefined) {
                regionState.discoveryProgress = regionState.fogProgress;
                console.log(`✅ Migrated discovery progress for ${regionId}`);
            }
            if (!regionState.discoveredNodeTypes) {
                regionState.discoveredNodeTypes = regionState.discoveredNodes || [];
                console.log(`✅ Added discoveredNodeTypes for ${regionId}`);
            }
            if (!regionState.nodeHealthBonuses) {
                regionState.nodeHealthBonuses = {};
            }
            if (!regionState.discoveredExitPaths) {
                regionState.discoveredExitPaths = [];
            }
            if (!regionState.discoveredCraftingStations) {
                regionState.discoveredCraftingStations = [];
            }
        }

        // Sync discovered crafting stations from all regions to global crafting state
        // This ensures stations discovered through navigation are usable for crafting
        let stationsSynced = 0;
        for (let regionId in this.state.regions) {
            const regionState = this.state.regions[regionId];
            if (regionState.discoveredCraftingStations) {
                for (let stationId of regionState.discoveredCraftingStations) {
                    if (!this.state.crafting.discoveredStations.includes(stationId)) {
                        this.state.crafting.discoveredStations.push(stationId);
                        stationsSynced++;
                    }
                }
            }
        }
        if (stationsSynced > 0) {
            console.log(`✅ Synced ${stationsSynced} crafting stations to global state`);
        }

        this.startGameLoop();
        return this.state;
    },

    /**
     * Start the main game loop
     */
    startGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        this.state.lastTick = Date.now();

        this.gameLoop = setInterval(() => {
            this.tick();
        }, this.state.tickRate);
    },

    /**
     * Main game tick - called every tickRate milliseconds
     */
    tick() {
        const now = Date.now();
        const deltaTime = (now - this.state.lastTick) / 1000; // Convert to seconds
        this.state.lastTick = now;
        this.state.gameTime += deltaTime;

        // Update all resource generation
        this.updateResourceGeneration(deltaTime);

        // Check for newly unlocked content
        this.checkUnlocks();

        // Auto-clean old "new" item markers every 10 seconds
        if (Math.floor(this.state.gameTime) % 10 === 0) {
            this.autoCleanNewItems();
        }

        // Process combat
        if (this.state.combat.inCombat) {
            this.playerAttack();
            this.enemyAttack();

            // Process active effects (DOTs and debuffs)
            if (this.processActiveEffects) {
                this.processActiveEffects();
            }

            // Apply HP regeneration
            this.applyHPRegeneration(deltaTime);
        }

        // Check for enemy respawn
        if (this.state.combat.waitingForRespawn) {
            this.checkEnemyRespawn();
        }

        // Process node collection if active
        if (this.state.nodeCollection && this.state.nodeCollection.activeNode) {
            this.processNodeCollection(deltaTime);
        }

        // Process navigation/discovery (automatic idle activity)
        if (this.state.activeNavigation) {
            this.processNavigation(deltaTime);
        }

        // Check for completed crafts
        if (this.state.crafting) {
            this.checkCraftCompletion();
        }
    },

    /**
     * Update resource generation based on generators and upgrades
     * @param {number} deltaTime - Time elapsed in seconds
     */
    updateResourceGeneration(deltaTime) {
        const gens = this.state.generators;
        const defs = this.definitions.generators;
        const currentRegion = this.definitions.regions[this.state.currentRegion];

        // Process each generator
        for (let genId in gens) {
            const gen = gens[genId];
            const def = defs[genId];

            if (!gen.unlocked || gen.level === 0) continue;

            // NOTE: Region-based resource restrictions removed in favor of node-based gathering
            // Generators now work in all regions

            // Calculate production
            // Formula: baseProduction * level * (1 + upgrade bonuses + skill bonuses + region bonuses) * deltaTime
            const baseProduction = def.baseProduction * gen.level;
            const upgradeMultiplier = this.getResourceMultiplier(def.produces);
            const skillMultiplier = this.getSkillMultiplier(def.produces);
            const regionMultiplier = this.getRegionMultiplier(def.produces);

            const totalMultiplier = upgradeMultiplier * skillMultiplier * regionMultiplier;
            const production = baseProduction * totalMultiplier * deltaTime;

            // Add to resource (legacy for now - will transition to bank)
            this.state.resources[def.produces] += production;

            // Also add to bank (1 item per full resource collected)
            // This creates the bank inventory while keeping the counter system
            const itemsToAdd = Math.floor(production);
            if (itemsToAdd > 0) {
                this.addItemToBank(def.produces, itemsToAdd);
            }

            // Gain skill experience for gathering
            this.gainSkillExp(this.getResourceSkill(def.produces), production * 0.1);
        }
    },

    /**
     * Calculate the total multiplier for a resource type based on upgrades
     * @param {string} resourceType - The resource to calculate multiplier for
     * @returns {number} - Total multiplier (1.0 = no bonus, 1.5 = +50%, etc.)
     */
    getResourceMultiplier(resourceType) {
        let multiplier = 1.0;

        const upgrades = this.state.upgrades;
        const upgradeDefs = this.definitions.upgrades;

        for (let upgradeId in upgrades) {
            const upgrade = upgrades[upgradeId];
            const def = upgradeDefs[upgradeId];

            if (!upgrade.unlocked || upgrade.level === 0) continue;
            if (def.affectsResource !== resourceType) continue;

            // Formula: multiplier += (effectPerLevel * level)
            multiplier += (def.effectPerLevel * upgrade.level);
        }

        return multiplier;
    },

    /**
     * Calculate cost for next level of a generator
     * Formula: baseCost * (costMultiplier ^ currentLevel)
     */
    getGeneratorCost(generatorId) {
        const gen = this.state.generators[generatorId];
        const def = this.definitions.generators[generatorId];

        return Math.floor(def.baseCost * Math.pow(def.costMultiplier, gen.level));
    },

    /**
     * Calculate cost for next level of an upgrade
     * Formula: baseCost * (costMultiplier ^ currentLevel)
     */
    getUpgradeCost(upgradeId) {
        const upgrade = this.state.upgrades[upgradeId];
        const def = this.definitions.upgrades[upgradeId];

        return Math.floor(def.baseCost * Math.pow(def.costMultiplier, upgrade.level));
    },

    /**
     * Purchase a generator level
     */
    purchaseGenerator(generatorId) {
        const gen = this.state.generators[generatorId];
        const def = this.definitions.generators[generatorId];

        if (!gen.unlocked) {
            return { success: false, reason: "Generator not unlocked" };
        }

        const cost = this.getGeneratorCost(generatorId);
        const costResource = def.costResource;

        if (this.state.resources[costResource] < cost) {
            return { success: false, reason: "Insufficient resources" };
        }

        // Deduct cost and increase level
        this.state.resources[costResource] -= cost;
        gen.level++;

        return { success: true };
    },

    /**
     * Purchase an upgrade level
     */
    purchaseUpgrade(upgradeId) {
        const upgrade = this.state.upgrades[upgradeId];
        const def = this.definitions.upgrades[upgradeId];

        if (!upgrade.unlocked) {
            return { success: false, reason: "Upgrade not unlocked" };
        }

        if (upgrade.level >= def.maxLevel) {
            return { success: false, reason: "Max level reached" };
        }

        const cost = this.getUpgradeCost(upgradeId);
        const costResource = def.costResource;

        if (this.state.resources[costResource] < cost) {
            return { success: false, reason: "Insufficient resources" };
        }

        // Deduct cost and increase level
        this.state.resources[costResource] -= cost;
        upgrade.level++;

        return { success: true };
    },

    /**
     * Check and unlock content based on requirements
     */
    checkUnlocks() {
        // Check generators
        for (let genId in this.definitions.generators) {
            const gen = this.state.generators[genId];
            const def = this.definitions.generators[genId];

            if (gen.unlocked) continue;

            if (this.meetsRequirement(def.unlockRequirement)) {
                gen.unlocked = true;
                console.log(`🔓 Unlocked generator: ${def.name}`);
            }
        }

        // Check upgrades
        for (let upgradeId in this.definitions.upgrades) {
            const upgrade = this.state.upgrades[upgradeId];
            const def = this.definitions.upgrades[upgradeId];

            if (upgrade.unlocked) continue;

            if (this.meetsRequirement(def.unlockRequirement)) {
                upgrade.unlocked = true;
                console.log(`🔓 Unlocked upgrade: ${def.name}`);
            }
        }
    },

    /**
     * Check if requirements are met
     * @param {Object} requirement - Object with resource/upgrade requirements
     */
    meetsRequirement(requirement) {
        if (!requirement) return true;

        for (let key in requirement) {
            const value = requirement[key];

            // Check if it's a resource requirement
            if (this.state.resources.hasOwnProperty(key)) {
                if (this.state.resources[key] < value) return false;
            }
            // Check if it's a generator requirement
            else if (this.state.generators.hasOwnProperty(key)) {
                if (this.state.generators[key].level < value) return false;
            }
            // Check if it's an upgrade requirement
            else if (this.state.upgrades.hasOwnProperty(key)) {
                if (this.state.upgrades[key].level < value) return false;
            }
        }

        return true;
    },

    /**
     * Calculate offline progression
     * @param {number} offlineTime - Time offline in milliseconds
     */
    calculateOfflineProgress(offlineTime) {
        const offlineSeconds = offlineTime / 1000;

        // Cap offline progression at 2 hours to prevent abuse
        const maxOfflineSeconds = 2 * 60 * 60;
        const cappedSeconds = Math.min(offlineSeconds, maxOfflineSeconds);

        console.log(`⏰ Processing ${cappedSeconds}s of offline time (${(cappedSeconds / 60).toFixed(1)} minutes)`);

        // Simulate ticks in larger chunks for performance
        const tickSize = 1; // Process in 1-second chunks
        const ticks = Math.floor(cappedSeconds / tickSize);

        for (let i = 0; i < ticks; i++) {
            this.updateResourceGeneration(tickSize);
        }

        this.state.gameTime += cappedSeconds;

        return {
            timeProcessed: cappedSeconds,
            wasCapped: offlineSeconds > maxOfflineSeconds
        };
    },

    /**
     * Get current production per second for each resource
     */
    getProductionRates() {
        const rates = {
            gold: 0,
            ore: 0,
            wood: 0
        };

        const gens = this.state.generators;
        const defs = this.definitions.generators;
        const currentRegion = this.definitions.regions[this.state.currentRegion];

        for (let genId in gens) {
            const gen = gens[genId];
            const def = defs[genId];

            if (!gen.unlocked || gen.level === 0) continue;

            // NOTE: Region-based resource restrictions removed in favor of node-based gathering
            // Generators now work in all regions

            const baseProduction = def.baseProduction * gen.level;
            const upgradeMultiplier = this.getResourceMultiplier(def.produces);
            const skillMultiplier = this.getSkillMultiplier(def.produces);
            const regionMultiplier = this.getRegionMultiplier(def.produces);

            const totalMultiplier = upgradeMultiplier * skillMultiplier * regionMultiplier;
            rates[def.produces] += baseProduction * totalMultiplier;
        }

        return rates;
    },

    // =============================================================================
    // SKILLS SYSTEM
    // =============================================================================

    /**
     * Get skill multiplier for a resource type
     */
    getSkillMultiplier(resourceType) {
        let multiplier = 1.0;
        const skillId = this.getResourceSkill(resourceType);

        if (!skillId) return multiplier;

        const skill = this.state.skills[skillId];
        const skillDef = this.definitions.skills[skillId];

        if (!skill || !skillDef.bonusPerLevel) return multiplier;

        // Formula: 1.0 + (bonusPerLevel * level)
        multiplier += (skillDef.bonusPerLevel * skill.level);

        return multiplier;
    },

    /**
     * Map resource types to their associated skill
     */
    getResourceSkill(resourceType) {
        const mapping = {
            ore: "mining",
            wood: "logging"
        };
        return mapping[resourceType] || null;
    },

    /**
     * Calculate EXP required for next skill level
     * Formula: baseExp * (level ^ expCurve)
     */
    /**
     * Get XP required for a specific level (generic formula)
     * @param {number} level - The level to calculate XP for
     * @param {number} baseExp - Base XP value (default 100)
     * @param {number} expCurve - Exponential curve (default 1.5)
     * @returns {number} - XP required for that level
     */
    getXpForLevel(level, baseExp = 100, expCurve = 1.5) {
        return Math.floor(baseExp * Math.pow(level, expCurve));
    },

    getSkillExpRequired(skillId) {
        const skill = this.state.skills[skillId];
        const def = this.definitions.skills[skillId];

        return Math.floor(def.baseExp * Math.pow(skill.level + 1, def.expCurve));
    },

    /**
     * Gain skill experience
     */
    gainSkillExp(skillId, amount) {
        if (!skillId || !this.state.skills[skillId]) return;

        const skill = this.state.skills[skillId];
        skill.exp += amount;

        // Check for level up
        const expRequired = this.getSkillExpRequired(skillId);
        if (skill.exp >= expRequired) {
            skill.exp -= expRequired;
            skill.level++;
            const def = this.definitions.skills[skillId];
            console.log(`⬆️ ${def.name} leveled up to ${skill.level}!`);
        }

        // Also grant character XP at reduced rate
        const generalExpRate = this.definitions.characterLevel.generalExpRate;
        const characterExp = amount * generalExpRate;
        this.gainCharacterExp(characterExp);
    },

    /**
     * Gain character experience
     */
    gainCharacterExp(amount) {
        const charLevel = this.state.characterLevel;
        charLevel.exp += amount;

        // Check for level up
        const expRequired = this.getCharacterExpRequired();
        if (charLevel.exp >= expRequired) {
            charLevel.exp -= expRequired;
            charLevel.level++;

            // Award attribute points
            const pointsAwarded = this.definitions.characterLevel.attributePointsPerLevel;
            charLevel.unassignedAttributePoints += pointsAwarded;

            console.log(`🌟 Character leveled up to ${charLevel.level}!`);
            console.log(`📈 Gained ${pointsAwarded} attribute points!`);
        }
    },

    /**
     * Get experience required for next character level
     */
    getCharacterExpRequired() {
        const level = this.state.characterLevel.level;
        const def = this.definitions.characterLevel;
        return Math.floor(def.baseExp * Math.pow(level, def.expCurve));
    },

    /**
     * Assign an attribute point
     */
    assignAttributePoint(attributeId) {
        if (!this.definitions.combatAttributes[attributeId]) {
            return { success: false, reason: "Invalid attribute" };
        }

        if (this.state.characterLevel.unassignedAttributePoints <= 0) {
            return { success: false, reason: "No unassigned points available" };
        }

        // Assign the point
        this.state.combatAttributes[attributeId]++;
        this.state.characterLevel.unassignedAttributePoints--;

        console.log(`✨ Assigned point to ${this.definitions.combatAttributes[attributeId].name}`);
        return { success: true };
    },

    /**
     * Reset all attribute points (costs gold or special item - implement later)
     */
    resetAttributes() {
        // Calculate total points assigned
        let totalPoints = 0;
        for (let attr in this.state.combatAttributes) {
            totalPoints += this.state.combatAttributes[attr];
            this.state.combatAttributes[attr] = 0;
        }

        // Return points to unassigned pool
        this.state.characterLevel.unassignedAttributePoints += totalPoints;

        console.log(`🔄 Reset all attributes. ${totalPoints} points available to reassign.`);
        return { success: true, pointsReturned: totalPoints };
    },

    // =============================================================================
    // REGION SYSTEM
    // =============================================================================

    /**
     * Get region multiplier based on discovered nodes
     */
    getRegionMultiplier(resourceType) {
        let multiplier = 1.0;

        const regionState = this.state.regions[this.state.currentRegion];
        const regionDef = this.definitions.regions[this.state.currentRegion];

        if (!regionState || !regionDef) return multiplier;

        // NOTE: Region multiplier system removed in favor of node-based gathering
        // Resource bonuses are now applied directly through node collection rewards
        // rather than passive generation multipliers

        return multiplier;
    },

    /**
     * Change to a different region
     */
    changeRegion(regionId) {
        const regionDef = this.definitions.regions[regionId];

        if (!regionDef) {
            return { success: false, reason: "Region does not exist" };
        }

        // Check if region is unlocked
        const regionState = this.state.regions[regionId];
        if (!regionState || !regionState.discovered) {
            return { success: false, reason: "Region not yet discovered" };
        }

        // Check navigation requirement
        const navSkill = this.state.skills.navigation;
        if (navSkill.level < regionDef.navigationRequirement) {
            return { success: false, reason: `Requires Navigation level ${regionDef.navigationRequirement}` };
        }

        this.state.currentRegion = regionId;
        console.log(`🗺️ Moved to ${regionDef.name}`);

        return { success: true };
    },

    /**
     * Explore current region (reduce fog of war)
     */
    exploreRegion() {
        const regionState = this.state.regions[this.state.currentRegion];
        const regionDef = this.definitions.regions[this.state.currentRegion];
        const navSkill = this.state.skills.navigation;
        const navDef = this.definitions.skills.navigation;

        if (!regionState || !regionDef) {
            return { success: false, reason: "Invalid region" };
        }

        if (regionState.fogProgress >= 100) {
            return { success: false, reason: "Region fully explored" };
        }

        // Calculate exploration progress
        // Formula: explorationSpeed * navigationLevel (% per action)
        const exploreAmount = navDef.explorationSpeed * (navSkill.level + 1) * 10;
        regionState.fogProgress += exploreAmount;

        // Cap at 100%
        if (regionState.fogProgress > 100) {
            regionState.fogProgress = 100;
        }

        // Gain navigation exp
        this.gainSkillExp("navigation", 10);

        // Check for discoveries
        const discoveries = this.checkForDiscoveries();

        return {
            success: true,
            progress: regionState.fogProgress,
            discoveries: discoveries
        };
    },

    /**
     * Check for new discoveries based on fog progress
     */
    checkForDiscoveries() {
        const regionState = this.state.regions[this.state.currentRegion];
        const regionDef = this.definitions.regions[this.state.currentRegion];
        const discoveries = [];

        if (!regionState || !regionDef) return discoveries;

        // NOTE: Resource node discovery system removed in favor of skill-based node access
        // Nodes are now directly accessible through gathering skills, not exploration
        // Discovery system now only handles special locations

        // Check for locations
        const locationCount = regionDef.locations?.length || 0;
        if (locationCount === 0) return discoveries;

        for (let location of regionDef.locations) {
            if (regionState.discoveredLocations.includes(location.id)) continue;

            const locationIndex = regionDef.locations.indexOf(location);
            const requiredProgress = ((locationIndex + 1) * (100 / locationCount));

            if (regionState.fogProgress >= requiredProgress) {
                regionState.discoveredLocations.push(location.id);

                // Grant rewards
                for (let rewardType in location.reward) {
                    const amount = location.reward[rewardType];

                    if (this.state.resources.hasOwnProperty(rewardType)) {
                        this.state.resources[rewardType] += amount;
                    } else if (this.state.skills.hasOwnProperty(rewardType)) {
                        this.gainSkillExp(rewardType, amount);
                    }
                }

                discoveries.push({
                    type: "location",
                    name: location.name,
                    reward: location.reward
                });
                console.log(`📍 Discovered: ${location.name}`);
            }
        }

        // Check for new region unlocks
        this.checkRegionUnlocks();

        return discoveries;
    },

    /**
     * Check and unlock new regions
     */
    checkRegionUnlocks() {
        for (let regionId in this.definitions.regions) {
            // Skip if already discovered
            if (this.state.regions[regionId]?.discovered) continue;

            const regionDef = this.definitions.regions[regionId];

            // Check requirements
            if (this.meetsRequirement(regionDef.unlockRequirement)) {
                // Initialize region state
                this.state.regions[regionId] = {
                    discovered: true,
                    fogProgress: 0,
                    discoveredLocations: [],
                    discoveredNodes: []
                };

                console.log(`🗺️ New region discovered: ${regionDef.name}!`);
            }
        }
    },

    // =============================================================================
    // BANK/INVENTORY SYSTEM
    // =============================================================================

    /**
     * Add items to the bank
     * @param {string} itemId - The item to add
     * @param {number} quantity - Amount to add
     * @param {string} tab - Optional specific tab (uses default if not specified)
     */
    addItemToBank(itemId, quantity, tab = null) {
        const itemDef = this.definitions.items[itemId];

        if (!itemDef) {
            console.error(`❌ Item ${itemId} not found in definitions`);
            return { success: false, reason: "Item not found" };
        }

        // Determine which tab to use
        const targetTab = tab || itemDef.defaultTab;

        // Check if tab exists
        if (!this.state.bank.tabs[targetTab]) {
            console.warn(`⚠️ Tab ${targetTab} doesn't exist, creating it`);
            this.createBankTab(targetTab, targetTab, "📦");
        }

        // Check if item already exists in bank
        if (!this.state.bank.items[itemId]) {
            // New item - create entry
            this.state.bank.items[itemId] = {
                quantity: 0,
                tab: targetTab,
                isNew: true,
                lastAddedTime: Date.now()
            };

            // Track as new item
            if (!this.state.bank.newItems.includes(itemId)) {
                this.state.bank.newItems.push(itemId);
            }

            console.log(`✨ New item discovered: ${itemDef.name}!`);
        }

        const bankItem = this.state.bank.items[itemId];

        // Check stack limit (use devLimit for unlimited, stackLimit for normal gameplay)
        const useDevMode = true;  // Toggle for testing
        const limit = useDevMode ? itemDef.devLimit : itemDef.stackLimit;

        if (bankItem.quantity >= limit) {
            return {
                success: false,
                reason: `Stack limit reached (${limit})`
            };
        }

        // Add quantity (cap at limit)
        const amountToAdd = Math.min(quantity, limit - bankItem.quantity);
        bankItem.quantity += amountToAdd;
        bankItem.lastAddedTime = Date.now();

        return {
            success: true,
            amountAdded: amountToAdd,
            newQuantity: bankItem.quantity
        };
    },

    /**
     * Get the count of an item in the bank
     * @param {string} itemId - Item ID to check
     * @returns {number} - Quantity of the item (0 if not found)
     */
    getItemCount(itemId) {
        const bankItem = this.state.bank.items[itemId];
        return bankItem ? bankItem.quantity : 0;
    },

    /**
     * Remove items from the bank
     */
    removeItemFromBank(itemId, quantity) {
        const bankItem = this.state.bank.items[itemId];

        if (!bankItem || bankItem.quantity < quantity) {
            return { success: false, reason: "Insufficient quantity" };
        }

        bankItem.quantity -= quantity;

        // Remove item entry if quantity reaches 0
        if (bankItem.quantity <= 0) {
            delete this.state.bank.items[itemId];
        }

        return {
            success: true,
            newQuantity: bankItem.quantity
        };
    },

    /**
     * Create a new bank tab
     */
    createBankTab(tabId, name, icon = "📦") {
        if (this.state.bank.tabs[tabId]) {
            return { success: false, reason: "Tab already exists" };
        }

        const order = Object.keys(this.state.bank.tabs).length;

        this.state.bank.tabs[tabId] = {
            name: name,
            icon: icon,
            order: order
        };

        console.log(`📁 Created bank tab: ${name}`);

        return { success: true };
    },

    /**
     * Switch active bank tab
     */
    switchBankTab(tabId) {
        if (!this.state.bank.tabs[tabId]) {
            return { success: false, reason: "Tab doesn't exist" };
        }

        this.state.bank.activeTab = tabId;
        return { success: true };
    },

    /**
     * Clear "new" status from an item
     */
    clearNewItemStatus(itemId) {
        if (this.state.bank.items[itemId]) {
            this.state.bank.items[itemId].isNew = false;
        }

        const index = this.state.bank.newItems.indexOf(itemId);
        if (index > -1) {
            this.state.bank.newItems.splice(index, 1);
        }
    },

    /**
     * Get all items in a specific tab
     */
    getItemsInTab(tabId) {
        const items = [];

        for (let itemId in this.state.bank.items) {
            const bankItem = this.state.bank.items[itemId];
            if (bankItem.tab === tabId) {
                items.push({
                    itemId: itemId,
                    ...bankItem,
                    definition: this.definitions.items[itemId]
                });
            }
        }

        return items;
    },

    /**
     * Move item to different tab
     */
    moveItemToTab(itemId, newTabId) {
        const bankItem = this.state.bank.items[itemId];

        if (!bankItem) {
            return { success: false, reason: "Item not in bank" };
        }

        if (!this.state.bank.tabs[newTabId]) {
            return { success: false, reason: "Tab doesn't exist" };
        }

        bankItem.tab = newTabId;
        return { success: true };
    },

    /**
     * Auto-clear old "new" item statuses (called periodically)
     * Items remain "new" for 30 seconds after being added
     */
    autoCleanNewItems() {
        const now = Date.now();
        const newItemTimeout = 30000; // 30 seconds

        for (let itemId of [...this.state.bank.newItems]) {
            const bankItem = this.state.bank.items[itemId];
            if (bankItem && (now - bankItem.lastAddedTime) > newItemTimeout) {
                this.clearNewItemStatus(itemId);
            }
        }
    },

    // =============================================================================
    // EQUIPMENT SYSTEM
    // =============================================================================

    /**
     * Equip an item from the bank
     */
    equipItem(itemId) {
        const itemDef = this.definitions.items[itemId];
        const bankItem = this.state.bank.items[itemId];

        if (!itemDef) {
            return { success: false, reason: "Item not found" };
        }

        if (!bankItem || bankItem.quantity < 1) {
            return { success: false, reason: "Item not in bank" };
        }

        if (!itemDef.equipSlot) {
            return { success: false, reason: "Item cannot be equipped" };
        }

        const slot = itemDef.equipSlot;

        // Unequip current item in slot if any
        if (this.state.equipment[slot]) {
            this.unequipItem(slot);
        }

        // Equip new item
        this.state.equipment[slot] = itemId;

        // Remove from bank
        this.removeItemFromBank(itemId, 1);

        console.log(`⚔️ Equipped ${itemDef.name}`);

        // Recalculate player stats
        this.recalculatePlayerStats();

        return { success: true };
    },

    /**
     * Unequip an item and return it to bank
     */
    unequipItem(slot) {
        const itemId = this.state.equipment[slot];

        if (!itemId) {
            return { success: false, reason: "Nothing equipped in that slot" };
        }

        const itemDef = this.definitions.items[itemId];

        // Return to bank
        this.addItemToBank(itemId, 1);

        // Remove from equipment
        this.state.equipment[slot] = null;

        console.log(`📦 Unequipped ${itemDef.name}`);

        // Recalculate player stats
        this.recalculatePlayerStats();

        return { success: true };
    },

    /**
     * Calculate comprehensive player combat stats
     * Includes all hidden attributes derived from base attributes, equipment, and perks
     */
    /**
     * Initialize StatCalculator integration
     * Binds the stat calculator to GameEngine and creates wrapper methods
     */
    initializeStatCalculator() {
        if (typeof StatCalculator === 'undefined') {
            console.warn('[GameEngine] StatCalculator not available, skipping initialization');
            return;
        }

        console.log('📊 Initializing StatCalculator integration...');

        // Bind calculateStat method to GameEngine
        this.calculateStat = (statName, context) => {
            // If no context provided, build it from current game state
            if (!context) {
                context = this.buildStatContext();
            }

            // Add definitions to context
            context.definitions = this.definitions;

            return StatCalculator.calculateStat(statName, context);
        };

        // Method to build stat context from current game state
        this.buildStatContext = () => {
            // Calculate grid perks once and include in context
            let gridCalc = null;
            if (this.calculateGridPerks) {
                try {
                    gridCalc = this.calculateGridPerks(this.state);
                } catch (e) {
                    console.warn('[StatContext] Failed to calculate grid perks:', e);
                }
            }

            return {
                combatAttributes: this.state.combatAttributes,
                attributes: this.state.combatAttributes,
                equipment: this.state.equipment,
                perkGrid: this.state.perkGrid,
                gridCalc: gridCalc, // New grid calculation results
                gridBonuses: gridCalc?.perks || {}, // Legacy compatibility
                skills: this.state.skills,
                stance: this.state.combat?.currentStance || 'offensive',
                activeConsumables: this.state.activeConsumables || [],
                definitions: this.definitions,
                state: this.state // Include full state for fallback calculations
            };
        };

        // Convenience method to calculate multiple stats at once
        this.calculateStats = (statNames) => {
            const context = this.buildStatContext();
            const results = {};

            statNames.forEach(statName => {
                const calc = StatCalculator.calculateStat(statName, context);
                results[statName] = calc.final;
                results[`${statName}_breakdown`] = calc.breakdown;
                results[`${statName}_formatted`] = calc.formatted;
            });

            return results;
        };

        // NEW: Method to get player combat stats using StatCalculator
        this.getPlayerCombatStatsNew = () => {
            const statNames = [
                'attackDamage',
                'attackSpeed',
                'maxHealth',
                'healthRegen',
                'accuracy',
                'evasion',
                'criticalChance',
                'criticalDamage',
                'damageReduction',
                'blockChance'
            ];

            const context = this.buildStatContext();
            const stats = {};

            statNames.forEach(statName => {
                const calc = StatCalculator.calculateStat(statName, context);
                stats[statName] = calc.final;
                stats[`${statName}_breakdown`] = calc.breakdown; // Store for UI tooltips
            });

            // Map some stat names to legacy names for compatibility
            stats.currentHealth = this.state.combat.player.currentHealth;
            stats.effectiveAttackInterval = stats.attackSpeed; // Already in milliseconds
            stats.effectiveHitChance = stats.accuracy;

            // Add derived stats that depend on calculated stats
            const playerStats = this.getPlayerCombatStats(); // Use old system temporarily
            stats.minHit = playerStats.minHit;
            stats.maxHit = playerStats.maxHit;
            stats.avgDamagePerHit = playerStats.avgDamagePerHit;
            stats.damageRollWeightAbove = playerStats.damageRollWeightAbove;
            stats.damageRollWeightBelow = playerStats.damageRollWeightBelow;
            stats.lifestealPercent = playerStats.lifestealPercent;
            stats.reloadTimeReduction = playerStats.reloadTimeReduction;
            stats.firstStrikeBonusDamage = playerStats.firstStrikeBonusDamage;
            stats.specialAttackChanceBonus = playerStats.specialAttackChanceBonus;

            return stats;
        };

        console.log('✅ StatCalculator integrated successfully');
    },

    /**
     * OLD SYSTEM - DEPRECATED (but kept for backwards compatibility during transition)
     * Use getPlayerCombatStatsNew() for new code
     *
     * This will be removed once all systems are migrated to StatCalculator
     */
    getPlayerCombatStats() {
        const baseStats = this.state.combat.player;
        const perks = this.state.perks;
        const attributes = this.state.combatAttributes;
        const attrDefs = this.definitions.combatAttributes;

        // === BASE STATS FROM ATTRIBUTES ===
        const baseDamage = baseStats.baseAttackDamage + (attributes.strength * 2);
        const baseHitChance = baseStats.baseAccuracy + (attributes.perception * 0.5);
        const baseAttackInterval = 1000 / (baseStats.baseAttackSpeed + (attributes.mobility * 0.02));
        const baseMaxHealth = baseStats.maxHealth + (attributes.health * 10);
        const baseCritChance = attributes.perception * 0.3; // 0.3% per perception point
        const baseCritImpact = 1.5 + (attributes.strength * 0.01); // 1.5x base, +1% per strength
        const baseEvasion = attributes.mobility * 0.5; // 0.5% per mobility point

        // === WEAPON STATS ===
        const weaponId = this.state.equipment.weapon;
        const weapon = weaponId ? this.definitions.items[weaponId] : null;

        let weaponDamage = 0;
        let weaponHitChance = 0;
        let weaponAttackInterval = 0;
        let weaponCritChance = 0;
        let weaponCritImpact = 1.0;
        let damageType = 'ballistic';
        let reloadInterval = 0;
        let reloadTime = 0;
        let grenadeInterval = 0;
        let grenadeDamage = 0;

        if (weapon && weapon.combatStats) {
            weaponDamage = weapon.combatStats.damage || 0;
            weaponHitChance = weapon.combatStats.hitChance || 0;
            weaponAttackInterval = weapon.combatStats.attackInterval || 0;
            weaponCritChance = weapon.combatStats.critChance || 0;
            weaponCritImpact = weapon.combatStats.critImpact || 1.0;
            damageType = weapon.combatStats.damageType || 'ballistic';
            reloadInterval = weapon.combatStats.reloadInterval || 0;
            reloadTime = weapon.combatStats.reloadTime || 0;
            grenadeInterval = weapon.combatStats.grenadeInterval || 0;
            grenadeDamage = weapon.combatStats.grenadeDamage || 0;
        }

        // === ARMOR/EQUIPMENT STATS ===
        let equipmentDefense = 0;
        let equipmentAbsoluteDefense = 0;
        let equipmentHealthBonus = 0;
        let equipmentEvasion = 0;

        // Aggregate all equipment bonuses
        for (let slot in this.state.equipment) {
            const itemId = this.state.equipment[slot];
            if (!itemId || slot === 'weapon') continue;

            const itemDef = this.definitions.items[itemId];
            if (!itemDef || !itemDef.combatStats) continue;

            equipmentDefense += itemDef.combatStats.damageReduction || 0;
            equipmentAbsoluteDefense += itemDef.combatStats.absoluteDefense || 0;
            equipmentHealthBonus += itemDef.combatStats.healthBonus || 0;
            equipmentEvasion += itemDef.combatStats.evasion || 0;
        }

        // === PERK MULTIPLIERS ===
        const perkDamageMult = 1 + (perks.damageBonus / 100);
        const perkSpeedMult = 1 + (perks.speedBonus / 100);
        const perkAccuracyBonus = perks.accuracyBonus;
        const perkHealthMult = 1 + (perks.healthBonus / 100);

        // === CALCULATED HIDDEN STATS ===

        // DAMAGE SYSTEM
        const totalBaseDamage = (baseDamage + weaponDamage) * perkDamageMult;
        const maxHitOffset = attributes.strength * 0.5;
        const minHitOffset = attributes.strength * 0.2;
        const maxHitMultiplier = 1.2 + (attributes.strength * 0.01);
        const minHitMultiplier = 0.8 + (attributes.strength * 0.005);

        const maxHit = totalBaseDamage * maxHitMultiplier + maxHitOffset;
        const minHit = totalBaseDamage * minHitMultiplier + minHitOffset;
        const avgDamagePerHit = (maxHit + minHit) / 2;

        // Damage roll weights (affects variance distribution)
        const damageRollWeightAbove = 50 + (attributes.strength * 0.5); // Favor higher rolls with strength
        const damageRollWeightBelow = 50 - (attributes.strength * 0.5);

        // ATTACK SPEED SYSTEM
        const characterAttackInterval = baseAttackInterval;
        const effectiveAttackInterval = Math.max(100, (characterAttackInterval + weaponAttackInterval) / perkSpeedMult);

        // HIT CHANCE SYSTEM
        const characterHitChance = baseHitChance + perkAccuracyBonus;
        const effectiveHitChance = Math.min(99, characterHitChance + weaponHitChance);

        // CRITICAL SYSTEM
        const criticalChance = Math.min(75, baseCritChance + weaponCritChance); // Cap at 75%
        const criticalImpact = baseCritImpact * weaponCritImpact;

        // DEFENSE SYSTEM
        const attributeDefense = attributes.defense * 0.02; // 2% per defense point
        const damageReductionRate = Math.min(0.90, attributeDefense + equipmentDefense); // Cap at 90%
        const absoluteDamageReduction = equipmentAbsoluteDefense;
        const evasionRating = Math.min(75, baseEvasion + equipmentEvasion); // Cap at 75%

        // HEALTH SYSTEM
        const maxHealth = (baseMaxHealth + equipmentHealthBonus) * perkHealthMult;
        const currentHealth = this.state.combat.player.currentHealth;
        const hpRegenerationRate = attributes.health * 0.1; // 0.1 HP/sec per health point
        const lifestealPercent = attributes.strength * 0.1; // 0.1% per strength point

        // DAMAGE TYPING SYSTEM (for future enemy type weaknesses)
        const strongTyping = 1.5;  // 150% damage vs weak types
        const neutralTyping = 1.0; // 100% normal damage
        const weakTyping = 0.75;   // 75% damage vs strong types

        // ENEMY RESPAWN (can be modified by perks/gear later)
        const enemyRespawnTimer = 1.0; // Multiplier for enemy respawn times

        // === RETURN COMPREHENSIVE STATS ===
        return {
            // Display stats (for UI)
            maxHealth: maxHealth,
            currentHealth: currentHealth,
            attackDamage: totalBaseDamage,
            attackSpeed: 1000 / effectiveAttackInterval,
            accuracy: effectiveHitChance,

            // Damage system (hidden)
            damage: totalBaseDamage,
            maxHitOffset: maxHitOffset,
            minHitOffset: minHitOffset,
            maxHitMultiplier: maxHitMultiplier,
            minHitMultiplier: minHitMultiplier,
            maxHit: maxHit,
            minHit: minHit,
            avgDamagePerHit: avgDamagePerHit,
            damageRollWeightAbove: damageRollWeightAbove,
            damageRollWeightBelow: damageRollWeightBelow,

            // Attack speed system (hidden)
            characterAttackInterval: characterAttackInterval,
            weaponAttackInterval: weaponAttackInterval,
            effectiveAttackInterval: effectiveAttackInterval,

            // Hit chance system (hidden)
            characterHitChance: characterHitChance,
            weaponHitChance: weaponHitChance,
            effectiveHitChance: effectiveHitChance,

            // Critical system (hidden)
            criticalChance: criticalChance,
            criticalImpact: criticalImpact,

            // Special attacks (hidden)
            grenadeInterval: grenadeInterval,
            grenadeDamage: grenadeDamage,

            // Weapon mechanics (hidden)
            reloadInterval: reloadInterval,
            reloadTime: reloadTime,
            damageType: damageType,

            // Defense system (hidden)
            evasionRating: evasionRating,
            damageReductionRate: damageReductionRate,
            absoluteDamageReduction: absoluteDamageReduction,

            // Regeneration (hidden)
            hpRegenerationRate: hpRegenerationRate,
            lifestealPercent: lifestealPercent,

            // Damage typing (hidden)
            strongTyping: strongTyping,
            neutralTyping: neutralTyping,
            weakTyping: weakTyping,

            // Enemy mechanics (hidden)
            enemyRespawnTimer: enemyRespawnTimer,

            // Legacy compatibility
            damageReduction: damageReductionRate
        };
    },

    /**
     * Calculate Combat Power rating
     * Returns a numeric power rating and tier information
     */
    calculateCombatPower() {
        const stats = this.getPlayerCombatStats();
        const charLevel = this.state.characterLevel.level;
        const totalWeight = this.getTotalEquippedWeight();

        // Calculate average skill level (excluding combat which is character level based)
        const skills = this.state.skills;
        let totalSkillLevels = 0;
        let skillCount = 0;

        for (let skillId in skills) {
            if (skillId !== 'combat' && skills[skillId].unlocked) {
                totalSkillLevels += skills[skillId].level;
                skillCount++;
            }
        }

        const avgSkillLevel = skillCount > 0 ? totalSkillLevels / skillCount : 0;

        // Combat Power Formula
        const combatPower = Math.floor(
            (charLevel * 10) +                    // Base: Character Level × 10
            (stats.maxHealth / 10) +              // Health Contribution
            (stats.attackDamage * 5) +            // Damage Contribution
            (stats.damageReduction * 100) +       // Defense Contribution (percentage to points)
            (stats.attackSpeed * 20) +            // Speed Contribution
            (totalWeight * 0.5) +                 // Equipment Weight
            (avgSkillLevel * 2)                   // Skill Average
        );

        // Determine tier
        let tier = 'Novice';
        let tierColor = '#ffffff';

        if (combatPower >= 5000) {
            tier = 'Master';
            tierColor = '#ff9800'; // Orange
        } else if (combatPower >= 2000) {
            tier = 'Expert';
            tierColor = '#9c27b0'; // Purple
        } else if (combatPower >= 1000) {
            tier = 'Skilled';
            tierColor = '#2196f3'; // Blue
        } else if (combatPower >= 500) {
            tier = 'Capable';
            tierColor = '#4caf50'; // Green
        }

        return {
            power: combatPower,
            tier: tier,
            tierColor: tierColor
        };
    },

    /**
     * Recalculate and update player stats
     */
    recalculatePlayerStats() {
        const stats = this.getPlayerCombatStats();

        // Update max health (heal if max increased)
        const oldMaxHealth = this.state.combat.player.maxHealth;
        this.state.combat.player.maxHealth = stats.maxHealth;

        if (stats.maxHealth > oldMaxHealth) {
            const healthIncrease = stats.maxHealth - oldMaxHealth;
            this.state.combat.player.currentHealth += healthIncrease;
        }

        // Cap current health at max
        this.state.combat.player.currentHealth = Math.min(
            this.state.combat.player.currentHealth,
            stats.maxHealth
        );
    },

    // =============================================================================
    // COMBAT SYSTEM
    // =============================================================================

    /**
     * Start combat with an enemy
     */
    startCombat(enemyId) {
        const enemyDef = this.definitions.enemies[enemyId];

        if (!enemyDef) {
            return { success: false, reason: "Enemy not found" };
        }

        // Check unlock requirements
        if (!this.meetsRequirement(enemyDef.unlockRequirement)) {
            return { success: false, reason: "Enemy not unlocked yet" };
        }

        // Stop other activities
        if (this.state.currentActivity === 'navigation') {
            this.stopNavigation();
        }
        if (this.state.currentActivity === 'nodeCollection') {
            this.stopNodeCollection();
        }

        // Set combat as current activity
        this.state.currentActivity = 'combat';

        // Create enemy instance
        this.state.combat.currentEnemy = {
            id: enemyId,
            name: enemyDef.name,
            image: enemyDef.image,
            currentHealth: enemyDef.stats.maxHealth,
            maxHealth: enemyDef.stats.maxHealth,
            attackDamage: enemyDef.stats.attackDamage,
            attackSpeed: enemyDef.stats.attackSpeed,
            accuracy: enemyDef.stats.accuracy,
            lastAttackTime: Date.now()
        };

        this.state.combat.inCombat = true;
        this.state.combat.selectedEnemyId = enemyId;  // Save for respawning
        this.state.combat.waitingForRespawn = false;
        this.state.combat.combatLog = [];
        this.addCombatLog(`⚔️ Combat started with ${enemyDef.name}!`);

        console.log(`⚔️ Engaged in combat with ${enemyDef.name}`);

        return { success: true };
    },

    /**
     * Player attacks enemy
     */
    playerAttack() {
        if (!this.state.combat.inCombat || !this.state.combat.currentEnemy) {
            return { success: false, reason: "Not in combat" };
        }

        const now = Date.now();
        const playerStats = this.getPlayerCombatStats();
        const enemy = this.state.combat.currentEnemy;

        // Check attack speed cooldown using effectiveAttackInterval
        const timeSinceLastAttack = now - this.state.combat.lastAttackTime;

        if (timeSinceLastAttack < playerStats.effectiveAttackInterval) {
            return { success: false, reason: "Attack on cooldown" };
        }

        this.state.combat.lastAttackTime = now;

        // Check if attack hits using effectiveHitChance
        const hitRoll = Math.random() * 100;
        if (hitRoll > playerStats.effectiveHitChance) {
            this.addCombatLog("💨 You missed!");
            return { success: true, hit: false };
        }

        // Check for critical hit
        const critRoll = Math.random() * 100;
        const isCritical = critRoll < playerStats.criticalChance;

        // Calculate damage using weighted roll system
        // Roll between minHit and maxHit with weighted distribution favoring higher damage
        const damageRange = playerStats.maxHit - playerStats.minHit;
        const totalWeight = playerStats.damageRollWeightAbove + playerStats.damageRollWeightBelow;
        const weightedRoll = Math.random() * totalWeight;

        let damageMultiplier;
        if (weightedRoll < playerStats.damageRollWeightAbove) {
            // High damage roll (weighted toward max)
            damageMultiplier = 0.5 + (weightedRoll / playerStats.damageRollWeightAbove) * 0.5;
        } else {
            // Low damage roll
            damageMultiplier = (weightedRoll - playerStats.damageRollWeightAbove) / playerStats.damageRollWeightBelow * 0.5;
        }

        let damage = Math.floor(playerStats.minHit + (damageRange * damageMultiplier));

        // Apply critical multiplier
        if (isCritical) {
            damage = Math.floor(damage * playerStats.criticalImpact);
            this.addCombatLog(`💥 CRITICAL HIT! You dealt ${damage} damage!`);
        } else {
            this.addCombatLog(`⚔️ You hit for ${damage} damage!`);
        }

        // Apply damage to enemy
        enemy.currentHealth -= damage;

        // Apply lifesteal
        if (playerStats.lifestealPercent > 0) {
            const healAmount = Math.floor(damage * (playerStats.lifestealPercent / 100));
            if (healAmount > 0) {
                this.state.combat.player.currentHealth = Math.min(
                    this.state.combat.player.currentHealth + healAmount,
                    playerStats.maxHealth
                );
                this.addCombatLog(`💚 Lifesteal restored ${healAmount} HP`);
            }
        }

        // Check if enemy defeated
        if (enemy.currentHealth <= 0) {
            return this.defeatEnemy();
        }

        return { success: true, hit: true, damage: damage, critical: isCritical };
    },

    /**
     * Enemy attacks player (called automatically)
     */
    enemyAttack() {
        if (!this.state.combat.inCombat || !this.state.combat.currentEnemy) {
            return;
        }

        const enemy = this.state.combat.currentEnemy;
        const now = Date.now();

        // Check enemy attack cooldown
        const attackCooldown = 1000 / enemy.attackSpeed;
        const timeSinceLastAttack = now - enemy.lastAttackTime;

        if (timeSinceLastAttack < attackCooldown) {
            return;
        }

        enemy.lastAttackTime = now;

        const playerStats = this.getPlayerCombatStats();

        // Check if player evades using evasionRating
        const evasionRoll = Math.random() * 100;
        if (evasionRoll < playerStats.evasionRating) {
            this.addCombatLog(`🌪️ You evaded ${enemy.name}'s attack!`);
            return;
        }

        // Check if attack hits
        const hitRoll = Math.random() * 100;
        if (hitRoll > enemy.accuracy) {
            this.addCombatLog(`💨 ${enemy.name} missed!`);
            return;
        }

        // Calculate damage
        const variance = 0.9 + Math.random() * 0.2;
        let damage = Math.floor(enemy.attackDamage * variance);

        // Apply percentage damage reduction
        if (playerStats.damageReductionRate > 0) {
            damage = damage * (1 - playerStats.damageReductionRate);
        }

        // Apply absolute damage reduction
        damage = Math.max(1, damage - playerStats.absoluteDamageReduction);

        damage = Math.floor(damage);

        // Apply damage to player
        this.state.combat.player.currentHealth -= damage;
        this.addCombatLog(`💥 ${enemy.name} hit you for ${damage} damage!`);

        // Check if player defeated
        if (this.state.combat.player.currentHealth <= 0) {
            this.playerDefeated();
        }
    },

    /**
     * Apply HP regeneration to player in combat
     * @param {number} deltaTime - Time elapsed in seconds
     */
    applyHPRegeneration(deltaTime) {
        if (!this.state.combat.inCombat) {
            return;
        }

        const playerStats = this.getPlayerCombatStats();

        // Apply HP regeneration if not at max health
        if (this.state.combat.player.currentHealth < playerStats.maxHealth && playerStats.hpRegenerationRate > 0) {
            const regenAmount = playerStats.hpRegenerationRate * deltaTime;
            this.state.combat.player.currentHealth = Math.min(
                this.state.combat.player.currentHealth + regenAmount,
                playerStats.maxHealth
            );
        }
    },

    /**
     * Enemy defeated - give rewards
     */
    defeatEnemy() {
        const enemy = this.state.combat.currentEnemy;
        const enemyDef = this.definitions.enemies[enemy.id];

        this.addCombatLog(`🎉 You defeated ${enemy.name}!`);

        // Grant combat experience
        if (enemyDef.rewards.exp.combat) {
            this.gainSkillExp("combat", enemyDef.rewards.exp.combat);
            this.addCombatLog(`📈 Gained ${enemyDef.rewards.exp.combat} combat EXP!`);
        }

        // Roll for loot
        const loot = this.rollLoot(enemyDef);

        // Add loot to pending
        this.state.combat.pendingLoot.push({
            timestamp: Date.now(),
            items: loot
        });

        // Start respawn timer instead of ending combat
        this.state.combat.currentEnemy = null;
        this.state.combat.inCombat = false;
        this.state.combat.waitingForRespawn = true;
        this.state.combat.enemyDefeatedAt = Date.now();

        const respawnSeconds = enemyDef.respawnTime / 1000;
        this.addCombatLog(`⏳ ${enemy.name} will respawn in ${respawnSeconds}s...`);

        return { success: true, defeated: true };
    },

    /**
     * Roll for loot from enemy loot table
     */
    rollLoot(enemyDef) {
        const loot = [];

        // Roll for gold
        const goldAmount = Math.floor(
            enemyDef.rewards.gold.min +
            Math.random() * (enemyDef.rewards.gold.max - enemyDef.rewards.gold.min)
        );
        loot.push({ type: 'currency', id: 'gold', amount: goldAmount });

        // Roll for medals
        const medalsAmount = Math.floor(
            enemyDef.rewards.medals.min +
            Math.random() * (enemyDef.rewards.medals.max - enemyDef.rewards.medals.min)
        );
        loot.push({ type: 'currency', id: 'medals', amount: medalsAmount });

        // Roll for items from loot table
        if (enemyDef.lootTable) {
            for (let entry of enemyDef.lootTable) {
                const roll = Math.random();
                if (roll < entry.chance) {
                    const amount = Math.floor(
                        entry.min + Math.random() * (entry.max - entry.min + 1)
                    );
                    loot.push({ type: 'item', id: entry.itemId, amount: amount });
                }
            }
        }

        return loot;
    },

    /**
     * Collect all pending loot
     */
    collectLoot() {
        if (this.state.combat.pendingLoot.length === 0) {
            return { success: false, reason: "No loot to collect" };
        }

        const totalCollected = {
            currencies: {},
            items: {}
        };

        // Collect all pending loot
        for (let lootDrop of this.state.combat.pendingLoot) {
            for (let item of lootDrop.items) {
                if (item.type === 'currency') {
                    this.state.currencies[item.id] += item.amount;
                    totalCollected.currencies[item.id] = (totalCollected.currencies[item.id] || 0) + item.amount;
                } else if (item.type === 'item') {
                    this.addItemToBank(item.id, item.amount);
                    totalCollected.items[item.id] = (totalCollected.items[item.id] || 0) + item.amount;
                }
            }
        }

        // Clear pending loot
        this.state.combat.pendingLoot = [];

        console.log("📦 Collected all loot!");
        return { success: true, collected: totalCollected };
    },

    // =============================================================================
    // CRAFTING SYSTEM
    // =============================================================================

    /**
     * Check if player can craft a recipe
     * @param {string} recipeId - Recipe ID to check
     * @returns {object} - {canCraft: boolean, reason: string}
     */
    canCraft(recipeId) {
        const recipe = this.definitions.recipes[recipeId];
        if (!recipe) {
            return { canCraft: false, reason: "Recipe not found" };
        }

        // Check skill level
        const playerSkillLevel = this.state.skills[recipe.skill].level;
        if (playerSkillLevel < recipe.skillLevel) {
            return { canCraft: false, reason: `Requires ${recipe.skill} level ${recipe.skillLevel}` };
        }

        // Check if player has discovered a required crafting station
        const hasStation = recipe.station.some(stationId =>
            this.state.crafting.discoveredStations.includes(stationId)
        );
        if (!hasStation) {
            return { canCraft: false, reason: "Required crafting station not discovered" };
        }

        // Check if player has required materials
        for (let input of recipe.inputs) {
            const itemCount = this.getItemCount(input.itemId);
            if (itemCount < input.amount) {
                return { canCraft: false, reason: `Need ${input.amount}x ${this.definitions.items[input.itemId]?.name || input.itemId}` };
            }
        }

        return { canCraft: true };
    },

    /**
     * Start crafting a recipe (switches to this craft if already crafting another)
     * @param {string} recipeId - Recipe ID to craft
     * @returns {object} - {success: boolean, reason?: string}
     */
    startCraft(recipeId) {
        const canCraftResult = this.canCraft(recipeId);
        if (!canCraftResult.canCraft) {
            return { success: false, reason: canCraftResult.reason };
        }

        const recipe = this.definitions.recipes[recipeId];

        // Stop any other activity first (including current craft)
        this.stopAllActivities();

        // Clear any active crafts (switching to new craft)
        this.state.crafting.activeCrafts = [];

        // Set this recipe as the auto-repeat recipe
        this.state.crafting.autoRecipe = recipeId;

        // Consume materials
        for (let input of recipe.inputs) {
            this.removeItemFromBank(input.itemId, input.amount);
        }

        // Find which discovered station to use (use first available)
        const stationId = recipe.station.find(s =>
            this.state.crafting.discoveredStations.includes(s)
        );

        // Add to active crafts
        const craft = {
            recipeId: recipeId,
            stationId: stationId,
            startTime: Date.now(),
            completionTime: Date.now() + recipe.craftingTime,
            totalTime: recipe.craftingTime
        };

        this.state.crafting.activeCrafts.push(craft);

        // Set current activity to crafting
        this.state.currentActivity = 'crafting';

        console.log(`🔨 Started auto-crafting: ${recipe.name}`);
        return { success: true, craft: craft };
    },

    /**
     * Check and complete any finished crafts
     * Called automatically in game tick
     */
    checkCraftCompletion() {
        const now = Date.now();
        const completedIndices = [];

        // Find completed crafts
        this.state.crafting.activeCrafts.forEach((craft, index) => {
            if (now >= craft.completionTime) {
                completedIndices.push(index);
            }
        });

        // Complete crafts (in reverse to avoid index issues)
        for (let i = completedIndices.length - 1; i >= 0; i--) {
            const craftIndex = completedIndices[i];
            this.completeCraft(craftIndex);
        }
    },

    /**
     * Complete a craft and give rewards
     * @param {number} craftIndex - Index in activeCrafts array
     */
    completeCraft(craftIndex) {
        const craft = this.state.crafting.activeCrafts[craftIndex];
        if (!craft) return;

        const recipe = this.definitions.recipes[craft.recipeId];

        // Give output items
        for (let output of recipe.outputs) {
            this.addItemToBank(output.itemId, output.amount);
        }

        // Give exp
        this.gainSkillExp(recipe.skill, recipe.expReward);

        console.log(`✅ Completed crafting: ${recipe.name}`);

        // Remove from active crafts
        this.state.crafting.activeCrafts.splice(craftIndex, 1);

        // Auto-repeat: If we have an auto recipe set and this was that recipe, try to craft again
        const autoRecipeId = this.state.crafting.autoRecipe;
        if (autoRecipeId && craft.recipeId === autoRecipeId) {
            const canCraftAgain = this.canCraft(autoRecipeId);
            if (canCraftAgain.canCraft) {
                // Consume materials and start new craft
                for (let input of recipe.inputs) {
                    this.removeItemFromBank(input.itemId, input.amount);
                }

                const stationId = recipe.station.find(s =>
                    this.state.crafting.discoveredStations.includes(s)
                );

                const newCraft = {
                    recipeId: autoRecipeId,
                    stationId: stationId,
                    startTime: Date.now(),
                    completionTime: Date.now() + recipe.craftingTime,
                    totalTime: recipe.craftingTime
                };

                this.state.crafting.activeCrafts.push(newCraft);
                console.log(`🔁 Auto-repeating craft: ${recipe.name}`);
            } else {
                // Can't craft anymore - stop auto crafting
                console.log(`⚠️ Stopped auto-crafting ${recipe.name}: ${canCraftAgain.reason}`);
                this.state.crafting.autoRecipe = null;
                this.state.currentActivity = null;
            }
        } else {
            // Clear current activity if no more crafts are active
            if (this.state.crafting.activeCrafts.length === 0) {
                this.state.currentActivity = null;
            }
        }
    },

    /**
     * Cancel an active craft and refund materials
     * @param {number} craftIndex - Index in activeCrafts array
     * @returns {object} - {success: boolean}
     */
    cancelCraft(craftIndex) {
        const craft = this.state.crafting.activeCrafts[craftIndex];
        if (!craft) {
            return { success: false, reason: "Craft not found" };
        }

        const recipe = this.definitions.recipes[craft.recipeId];

        // Refund 50% of materials
        for (let input of recipe.inputs) {
            const refundAmount = Math.floor(input.amount * 0.5);
            if (refundAmount > 0) {
                this.addItemToBank(input.itemId, refundAmount);
            }
        }

        // Remove from active crafts
        this.state.crafting.activeCrafts.splice(craftIndex, 1);

        // Clear current activity if no more crafts are active
        if (this.state.crafting.activeCrafts.length === 0) {
            this.state.currentActivity = null;
        }

        console.log(`❌ Cancelled crafting: ${recipe.name}`);
        return { success: true };
    },

    /**
     * Stop auto-crafting immediately (clears autoRecipe, active crafts, and current activity)
     * @returns {object} - {success: boolean}
     */
    stopAutoCraft() {
        this.state.crafting.autoRecipe = null;

        // Immediately clear any active crafts (stop mid-interval)
        this.state.crafting.activeCrafts = [];

        // Clear current activity if crafting
        if (this.state.currentActivity === 'crafting') {
            this.state.currentActivity = null;
        }

        console.log(`⏹️ Stopped auto-crafting`);
        return { success: true };
    },

    /**
     * Discover a crafting station
     * @param {string} stationId - Crafting station ID
     */
    discoverCraftingStation(stationId) {
        console.log(`🔧 discoverCraftingStation called with: ${stationId}`);
        console.log(`   Current global stations:`, this.state.crafting.discoveredStations);

        if (!this.state.crafting.discoveredStations.includes(stationId)) {
            this.state.crafting.discoveredStations.push(stationId);
            const station = this.definitions.craftingNodes[stationId];
            console.log(`   ✅ Added to global state: ${station.name}`);
            console.log(`   New global stations:`, this.state.crafting.discoveredStations);
            return true;
        } else {
            console.log(`   ⚠️ Already in global state`);
            return false;
        }
    },

    /**
     * Get all recipes available to the player (considering skill and discovered stations)
     * @param {string} skillFilter - Optional skill to filter by
     * @returns {array} - Array of {recipeId, recipe, canCraft, reason}
     */
    getAvailableRecipes(skillFilter = null) {
        const recipes = [];

        for (let recipeId in this.definitions.recipes) {
            const recipe = this.definitions.recipes[recipeId];

            // Apply skill filter
            if (skillFilter && recipe.skill !== skillFilter) {
                continue;
            }

            const canCraftResult = this.canCraft(recipeId);

            recipes.push({
                recipeId: recipeId,
                recipe: recipe,
                canCraft: canCraftResult.canCraft,
                reason: canCraftResult.reason
            });
        }

        return recipes;
    },

    /**
     * Player defeated
     */
    playerDefeated() {
        this.addCombatLog("💀 You were defeated!");

        // Penalty: lose some gold
        const goldLoss = Math.floor(this.state.currencies.gold * 0.1);
        this.state.currencies.gold -= goldLoss;

        if (goldLoss > 0) {
            this.addCombatLog(`💸 Lost ${goldLoss} gold!`);
        }

        // End combat and heal player
        this.endCombat();
        this.healPlayer(100); // Full heal after defeat
    },

    /**
     * End combat
     */
    endCombat() {
        if (this.state.currentActivity === 'combat') {
            this.state.currentActivity = null;
        }
        this.state.combat.inCombat = false;
        this.state.combat.currentEnemy = null;
        this.state.combat.waitingForRespawn = false;
        this.state.combat.selectedEnemyId = null;
        console.log("⚔️ Combat ended");
    },

    /**
     * Check if enemy should respawn
     */
    checkEnemyRespawn() {
        if (!this.state.combat.waitingForRespawn || !this.state.combat.selectedEnemyId) {
            return;
        }

        const enemyId = this.state.combat.selectedEnemyId;
        const enemyDef = this.definitions.enemies[enemyId];
        const now = Date.now();
        const timeSinceDefeat = now - this.state.combat.enemyDefeatedAt;

        if (timeSinceDefeat >= enemyDef.respawnTime) {
            // Respawn the enemy
            this.addCombatLog(`✨ ${enemyDef.name} has respawned!`);
            this.startCombat(enemyId);
        }
    },

    /**
     * Flee from combat
     */
    fleeCombat() {
        if (!this.state.combat.inCombat && !this.state.combat.waitingForRespawn) {
            return { success: false, reason: "Not in combat" };
        }

        this.addCombatLog("🏃 You fled from combat!");
        this.endCombat();

        return { success: true };
    },

    /**
     * Heal player
     */
    healPlayer(amount) {
        const stats = this.getPlayerCombatStats();
        this.state.combat.player.currentHealth = Math.min(
            this.state.combat.player.currentHealth + amount,
            stats.maxHealth
        );
    },

    /**
     * Add message to combat log
     */
    addCombatLog(message) {
        this.state.combat.combatLog.push({
            message: message,
            timestamp: Date.now()
        });

        // Keep only last 20 messages
        if (this.state.combat.combatLog.length > 20) {
            this.state.combat.combatLog.shift();
        }
    },

    // =============================================================================
    // NODE COLLECTION SYSTEM
    // =============================================================================

    /**
     * Get player's pickaxe damage from equipped weapon
     */
    getPickaxeDamage() {
        return this.getToolDamage('mining');
    },

    /**
     * Get tool damage/power based on skill type
     */
    getToolDamage(skill) {
        const weaponId = this.state.equipment.weapon;
        if (!weaponId) return 1; // Base damage with no tool

        const weaponDef = this.definitions.items[weaponId];
        if (!weaponDef || !weaponDef.stats) {
            return 1;
        }

        // Map skill to stat name
        const statMap = {
            'mining': 'pickaxeDamage',
            'logging': 'chopDamage',
            'fishing': 'fishingPower',
            'hunting': 'huntingPower',
            'foraging': 'foragingPower',
            'thieving': 'thievingPower'
        };

        const statName = statMap[skill];
        if (!statName || !weaponDef.stats[statName]) {
            return 1; // Tool doesn't have the required stat
        }

        return weaponDef.stats[statName];
    },

    /**
     * Start collecting from a resource node
     */
    startNodeCollection(nodeId) {
        const nodeDef = this.definitions.resourceNodes[nodeId];

        if (!nodeDef) {
            return { success: false, reason: "Node not found" };
        }

        // Check skill level requirement
        const playerSkillLevel = this.state.skills[nodeDef.skill].level;
        if (playerSkillLevel < nodeDef.skillLevel) {
            return { success: false, reason: `Requires ${nodeDef.skill} level ${nodeDef.skillLevel}` };
        }

        // Stop other activities
        if (this.state.currentActivity === 'navigation') {
            this.stopNavigation();
        }
        if (this.state.currentActivity === 'combat') {
            this.endCombat();
        }
        if (this.state.currentActivity === 'nodeCollection' && this.state.nodeCollection.activeNode) {
            console.log("⏹️ Stopping current collection to switch nodes");
            this.stopNodeCollection();
        }

        // Set node collection as current activity
        this.state.currentActivity = 'nodeCollection';

        // Get bonus health for this node from region discoveries
        const currentRegionId = this.state.currentRegion;
        const regionState = this.state.regions[currentRegionId];
        const bonusHealth = regionState?.nodeHealthBonuses?.[nodeId] || 0;

        // Start collection with base health + discovered bonus
        const totalHealth = nodeDef.maxHealth + bonusHealth;

        this.state.nodeCollection.activeNode = {
            nodeId: nodeId,
            currentHealth: totalHealth,
            maxHealth: totalHealth,
            startTime: Date.now()
        };
        this.state.nodeCollection.lastCollectionTick = Date.now();

        console.log(`⛏️ Started collecting ${nodeDef.name} (${totalHealth} health)`);
        return { success: true };
    },

    /**
     * Process node collection each tick
     */
    processNodeCollection(deltaTime) {
        const activeNode = this.state.nodeCollection.activeNode;
        if (!activeNode) return;

        const nodeDef = this.definitions.resourceNodes[activeNode.nodeId];
        if (!nodeDef) {
            this.stopNodeCollection();
            return;
        }

        // Deal damage based on tool damage/power for this skill
        const toolDamage = this.getToolDamage(nodeDef.skill);
        const damagePerSecond = toolDamage;
        const damage = damagePerSecond * deltaTime;

        activeNode.currentHealth -= damage;

        // Check if node is depleted
        if (activeNode.currentHealth <= 0) {
            this.completeNodeCollection();
        }
    },

    /**
     * Complete node collection and give rewards
     */
    completeNodeCollection() {
        const activeNode = this.state.nodeCollection.activeNode;
        if (!activeNode) return;

        const nodeDef = this.definitions.resourceNodes[activeNode.nodeId];
        if (!nodeDef) {
            this.stopNodeCollection();
            return;
        }

        // Check for fail rate
        if (nodeDef.failRate && Math.random() < nodeDef.failRate) {
            console.log(`❌ Failed to collect from ${nodeDef.name}!`);
            // Reset the node for another collection
            activeNode.currentHealth = nodeDef.maxHealth;
            this.state.nodeCollection.lastCollectionTick = Date.now();
            return;
        }

        // Process each reward with its chance
        let rewardsGained = [];

        for (let reward of nodeDef.rewards) {
            // Roll for chance
            if (Math.random() > reward.chance) {
                continue; // Didn't succeed this roll
            }

            // Check if this is an EXP reward
            if (reward.exp) {
                for (let skillId in reward.exp) {
                    const expGained = reward.exp[skillId];
                    this.gainSkillExp(skillId, expGained);
                }
            } else if (reward.itemId) {
                // Item reward
                const amount = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;

                // Add to bank
                this.addItemToBank(reward.itemId, amount);

                // Also add to resources state if it exists there
                if (this.state.resources.hasOwnProperty(reward.itemId)) {
                    this.state.resources[reward.itemId] += amount;
                }

                rewardsGained.push(`${amount}x ${this.definitions.items[reward.itemId]?.name || reward.itemId}`);
            }
        }

        if (rewardsGained.length > 0) {
            console.log(`✅ Collected from ${nodeDef.name}: ${rewardsGained.join(', ')}`);
        } else {
            console.log(`✅ Collected from ${nodeDef.name}!`);
        }

        // Reset the node for another collection
        activeNode.currentHealth = nodeDef.maxHealth;
        this.state.nodeCollection.lastCollectionTick = Date.now();
    },

    /**
     * Stop node collection
     */
    stopNodeCollection() {
        if (this.state.currentActivity === 'nodeCollection') {
            this.state.currentActivity = null;
        }
        this.state.nodeCollection.activeNode = null;
        this.state.nodeCollection.lastCollectionTick = 0;
        return { success: true };
    },

    /**
     * Select a skill for node filtering
     */
    selectSkillForNodes(skillId) {
        this.state.nodeCollection.selectedSkill = skillId;
        return { success: true };
    },

    /**
     * Get available nodes for current selected skill and region
     */
    getAvailableNodesForSkill() {
        const selectedSkill = this.state.nodeCollection.selectedSkill;
        if (!selectedSkill) return [];

        const currentRegionId = this.state.currentRegion;
        const regionState = this.state.regions[currentRegionId];
        const hexDef = this.definitions.worldMap[currentRegionId];
        const biomeDef = this.definitions.biomes[hexDef?.biome];

        if (!regionState || !biomeDef) {
            console.warn(`⚠️ Missing data for region ${currentRegionId}:`, {
                regionState: !!regionState,
                hexDef: !!hexDef,
                biomeDef: !!biomeDef
            });
            return [];
        }

        // Get discovered nodes in this region that match the selected skill
        const discoveredNodes = regionState.discoveredNodeTypes || [];
        const biomeNodesForSkill = biomeDef.gatheringNodes?.[selectedSkill] || [];

        console.log(`📋 Getting nodes for ${selectedSkill} in ${hexDef.name}:`, {
            discoveredNodes,
            biomeNodesForSkill,
            regionId: currentRegionId
        });

        // Filter to only show discovered nodes for this skill
        const availableNodeIds = discoveredNodes.filter(nodeId =>
            biomeNodesForSkill.includes(nodeId)
        );

        const nodes = [];
        for (let nodeId of availableNodeIds) {
            const nodeDef = this.definitions.resourceNodes[nodeId];
            if (nodeDef && nodeDef.skill === selectedSkill) {
                const playerSkillLevel = this.state.skills[selectedSkill].level;
                const canCollect = playerSkillLevel >= nodeDef.skillLevel;

                // Get bonus health for this node
                const bonusHealth = regionState.nodeHealthBonuses?.[nodeId] || 0;

                nodes.push({
                    nodeId: nodeId,
                    definition: nodeDef,
                    bonusHealth: bonusHealth,
                    canCollect: canCollect,
                    locked: !canCollect
                });
            }
        }

        console.log(`✅ Returning ${nodes.length} nodes for ${selectedSkill}`);
        return nodes;
    },

    // =============================================================================
    // NAVIGATION / DISCOVERY SYSTEM
    // =============================================================================

    /**
     * Get player's navigation stats for discovery
     */
    getNavigationStats() {
        const navSkill = this.state.skills.navigation;
        const attributes = this.state.combatAttributes;
        const perks = this.state.perks;

        // Base discovery stats
        const baseDiscoveryDamage = 5 + (navSkill.level * 2); // Damage to region health
        const baseDiscoverySpeed = 1.0 + (navSkill.level * 0.05); // Attacks per second
        const baseAccuracy = 70 + (attributes.perception * 0.5); // Hit chance

        // Apply perk multipliers (future use)
        const damageMultiplier = 1.0 + (perks.damageBonus / 100);
        const speedMultiplier = 1.0 + (perks.speedBonus / 100);

        return {
            discoveryDamage: baseDiscoveryDamage * damageMultiplier,
            discoverySpeed: baseDiscoverySpeed * speedMultiplier,
            discoveryInterval: 1000 / (baseDiscoverySpeed * speedMultiplier), // ms between discoveries
            accuracy: Math.min(95, baseAccuracy),
            navLevel: navSkill.level
        };
    },

    /**
     * Start navigation/discovery in current region
     */
    startNavigation() {
        if (this.state.currentActivity === 'navigation') {
            return { success: false, reason: "Already navigating" };
        }

        // Stop other activities
        if (this.state.currentActivity === 'combat') {
            this.endCombat();
        }
        if (this.state.currentActivity === 'nodeCollection') {
            this.stopNodeCollection();
        }
        // Crafting continues in background, doesn't block navigation

        this.state.currentActivity = 'navigation';
        this.state.activeNavigation.isNavigating = true;
        this.state.activeNavigation.lastNavigationTick = Date.now();
        this.state.activeNavigation.regionHealth = this.state.activeNavigation.maxRegionHealth;

        console.log("🗺️ Started exploring region...");
        return { success: true };
    },

    /**
     * Stop navigation/discovery
     */
    stopNavigation() {
        if (this.state.currentActivity === 'navigation') {
            this.state.currentActivity = null;
        }
        this.state.activeNavigation.isNavigating = false;
        this.state.activeNavigation.lastNavigationTick = 0;
        console.log("🗺️ Stopped exploring");
        return { success: true };
    },

    /**
     * Stop all activities (navigation, node collection, combat, crafting)
     */
    stopAllActivities() {
        // Stop navigation
        if (this.state.currentActivity === 'navigation') {
            this.stopNavigation();
        }

        // Stop node collection
        if (this.state.currentActivity === 'nodeCollection') {
            this.stopNodeCollection();
        }

        // Stop combat
        if (this.state.currentActivity === 'combat') {
            this.endCombat();
        }

        // Stop all active crafts (don't refund materials - they were already consumed)
        if (this.state.currentActivity === 'crafting') {
            this.state.currentActivity = null;
        }
        // Note: We don't cancel active crafts - they continue in background

        return { success: true };
    },

    /**
     * Process navigation tick (called automatically when navigation is active)
     */
    processNavigation(deltaTime) {
        if (!this.state.activeNavigation.isNavigating) {
            return;
        }

        const now = Date.now();
        const stats = this.getNavigationStats();

        // Check if enough time has passed for next discovery attempt
        const timeSinceLastAttempt = now - this.state.activeNavigation.lastNavigationTick;
        if (timeSinceLastAttempt < stats.discoveryInterval) {
            return;
        }

        this.state.activeNavigation.lastNavigationTick = now;

        // Roll for hit (accuracy check)
        const hitRoll = Math.random() * 100;
        if (hitRoll > stats.accuracy) {
            console.log("🔍 Discovery attempt missed...");
            return;
        }

        // Deal damage to region health
        const damage = Math.floor(stats.discoveryDamage * (0.9 + Math.random() * 0.2));
        this.state.activeNavigation.regionHealth -= damage;

        console.log(`🔍 Exploring... (${damage} progress, ${this.state.activeNavigation.regionHealth.toFixed(0)}/${this.state.activeNavigation.maxRegionHealth} remaining)`);

        // Check if discovery threshold reached
        if (this.state.activeNavigation.regionHealth <= 0) {
            this.makeDiscovery();
            // Reset region health for next discovery
            this.state.activeNavigation.regionHealth = this.state.activeNavigation.maxRegionHealth;
        }
    },

    /**
     * Make a discovery in the current region
     * Can discover: nodes, crafting stations, exit paths
     */
    makeDiscovery() {
        const currentRegionId = this.state.currentRegion;
        const regionState = this.state.regions[currentRegionId];
        const hexDef = this.definitions.worldMap[currentRegionId];
        const biomeDef = this.definitions.biomes[hexDef.biome];

        // Increase discovery progress
        const discoveryIncrease = 1 + (this.state.skills.navigation.level * 0.1);
        regionState.discoveryProgress = Math.min(100, regionState.discoveryProgress + discoveryIncrease);

        console.log(`✨ Discovery made! Region now ${regionState.discoveryProgress.toFixed(1)}% explored`);

        // Gain navigation exp
        this.gainSkillExp('navigation', 5);

        // Determine what was discovered (weighted random)
        const rand = Math.random();

        if (rand < 0.5) {
            // 50% chance: Discover a resource node
            this.discoverResourceNode(currentRegionId, biomeDef);
        } else if (rand < 0.75) {
            // 25% chance: Discover a crafting station
            this.discoverCraftingStationRandom(currentRegionId, biomeDef);
        } else {
            // 25% chance: Try to discover an exit path
            this.tryDiscoverExitPath(currentRegionId, hexDef, biomeDef);
        }
    },

    /**
     * Discover a random resource node type in the region
     */
    discoverResourceNode(regionId, biomeDef) {
        const regionState = this.state.regions[regionId];

        // Get all possible node types from biome
        const allPossibleNodes = [];
        for (let skill in biomeDef.gatheringNodes) {
            for (let nodeId of biomeDef.gatheringNodes[skill]) {
                allPossibleNodes.push(nodeId);
            }
        }

        if (allPossibleNodes.length === 0) {
            console.log("No resource nodes available in this biome");
            return;
        }

        // Pick a random node
        const randomNode = allPossibleNodes[Math.floor(Math.random() * allPossibleNodes.length)];
        const nodeDef = this.definitions.resourceNodes[randomNode];

        if (!nodeDef) return;

        // Check if already discovered
        if (regionState.discoveredNodeTypes.includes(randomNode)) {
            // Already discovered - add bonus health to this node
            if (!regionState.nodeHealthBonuses[randomNode]) {
                regionState.nodeHealthBonuses[randomNode] = 0;
            }
            regionState.nodeHealthBonuses[randomNode] += 20; // +20 health
            console.log(`🔨 Found more ${nodeDef.name}! (+20 health to this node)`);
        } else {
            // New discovery!
            regionState.discoveredNodeTypes.push(randomNode);
            regionState.nodeHealthBonuses[randomNode] = 0;
            console.log(`🌟 Discovered new resource: ${nodeDef.name}!`);
        }
    },

    /**
     * Try to discover a crafting station
     */
    discoverCraftingStationRandom(regionId, biomeDef) {
        const regionState = this.state.regions[regionId];

        // Get all possible crafting stations from biome
        const allPossibleStations = [];
        for (let skill in biomeDef.craftingNodes) {
            for (let stationId of biomeDef.craftingNodes[skill]) {
                if (!regionState.discoveredCraftingStations.includes(stationId)) {
                    allPossibleStations.push(stationId);
                }
            }
        }

        if (allPossibleStations.length === 0) {
            // All stations discovered, discover node instead
            this.discoverResourceNode(regionId, biomeDef);
            return;
        }

        // Pick a random station
        const randomStation = allPossibleStations[Math.floor(Math.random() * allPossibleStations.length)];

        regionState.discoveredCraftingStations.push(randomStation);
        this.discoverCraftingStation(randomStation); // Also add to global discovered stations

        const stationDef = this.definitions.craftingNodes[randomStation];
        console.log(`🏭 Discovered crafting station: ${stationDef.name}!`);
    },

    /**
     * Try to discover an exit path to an adjacent region
     */
    tryDiscoverExitPath(regionId, hexDef, biomeDef) {
        const regionState = this.state.regions[regionId];

        // Get undiscovered adjacent regions
        const undiscoveredExits = hexDef.adjacentHexes.filter(adj =>
            !regionState.discoveredExitPaths.includes(adj.id)
        );

        if (undiscoveredExits.length === 0) {
            // All exits discovered, discover node instead
            this.discoverResourceNode(regionId, biomeDef);
            return;
        }

        // Roll for exit path discovery
        const exitRoll = Math.random();
        if (exitRoll < biomeDef.exitPathChance) {
            // Pick a random undiscovered exit
            const randomExit = undiscoveredExits[Math.floor(Math.random() * undiscoveredExits.length)];

            regionState.discoveredExitPaths.push(randomExit.id);

            const adjacentHexDef = this.definitions.worldMap[randomExit.id];
            console.log(`🚪 Discovered exit path to ${randomExit.direction}: ${adjacentHexDef.name}!`);
        } else {
            // Failed to find exit, discover node instead
            this.discoverResourceNode(regionId, biomeDef);
        }
    },

    /**
     * Travel to an adjacent region
     */
    /**
     * Check if player can travel to a specific region
     */
    canTravelToRegion(targetRegionId) {
        const currentRegionId = this.state.currentRegion;

        // Can't travel to current region
        if (targetRegionId === currentRegionId) {
            return false;
        }

        // Check if target region exists in world map
        const targetHexDef = this.definitions.worldMap[targetRegionId];
        if (!targetHexDef) {
            return false;
        }

        // Check navigation level requirement
        if (this.state.skills.navigation.level < targetHexDef.navigationRequirement) {
            return false;
        }

        // For starting region, always allow travel
        if (targetRegionId === "region_-10_0") {
            return true;
        }

        // Check if any adjacent discovered region has path to target
        for (let regionId in this.state.regions) {
            const regionState = this.state.regions[regionId];
            if (regionState.discovered && regionState.discoveredExitPaths &&
                regionState.discoveredExitPaths.includes(targetRegionId)) {

                // Found a path! Now check if we can reach this region
                if (regionId === currentRegionId) {
                    return true; // Direct path from current region
                }

                // Check if this region is reachable (recursive pathfinding)
                // For now, simple check: is it directly connected?
                const currentRegionState = this.state.regions[currentRegionId];
                if (currentRegionState?.discoveredExitPaths?.includes(regionId)) {
                    return true;
                }
            }
        }

        return false;
    },

    travelToRegion(targetRegionId) {
        const currentRegionId = this.state.currentRegion;
        const currentRegionState = this.state.regions[currentRegionId];

        // Check if exit path is discovered
        if (!currentRegionState.discoveredExitPaths.includes(targetRegionId)) {
            return { success: false, reason: "Exit path not discovered" };
        }

        const targetHexDef = this.definitions.worldMap[targetRegionId];

        // Check navigation level requirement
        if (this.state.skills.navigation.level < targetHexDef.navigationRequirement) {
            return { success: false, reason: `Requires Navigation level ${targetHexDef.navigationRequirement}` };
        }

        // Initialize target region if not exists
        if (!this.state.regions[targetRegionId]) {
            this.state.regions[targetRegionId] = {
                discovered: true,
                discoveryProgress: 0,
                discoveredLocations: [],
                discoveredNodeTypes: [],
                nodeHealthBonuses: {},
                discoveredExitPaths: [],
                discoveredCraftingStations: []
            };
        }

        // Reset navigation progress for new region
        this.state.activeNavigation.lastNavigationTick = 0;
        this.state.activeNavigation.regionHealth = this.state.activeNavigation.maxRegionHealth;

        // Travel
        this.state.currentRegion = targetRegionId;

        console.log(`🗺️ Traveled to ${targetHexDef.name}`);
        return { success: true, region: targetHexDef };
    },

    /**
     * Reset the entire game
     */
    reset() {
        // Stop the game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Reset state to initial values
        this.state = {
            currencies: {
                gold: 0,
                medals: 0
            },
            resources: {
                ore: 0,
                wood: 0,
                health: 100,
                maxHealth: 100
            },
            generators: {
                miner: { level: 0, unlocked: true },
                lumberjack: { level: 0, unlocked: true },
                merchant: { level: 0, unlocked: true }
            },
            upgrades: {
                goldBoost1: { level: 0, unlocked: true },
                goldBoost2: { level: 0, unlocked: false },
                miningEfficiency: { level: 0, unlocked: true },
                loggingEfficiency: { level: 0, unlocked: true },
                merchantSkill: { level: 0, unlocked: false }
            },
            skills: {
                navigation: { level: 0, exp: 0, unlocked: true },
                mining: { level: 0, exp: 0, unlocked: true },
                logging: { level: 0, exp: 0, unlocked: true },
                fishing: { level: 0, exp: 0, unlocked: true },
                hunting: { level: 0, exp: 0, unlocked: true },
                foraging: { level: 0, exp: 0, unlocked: true },
                thieving: { level: 0, exp: 0, unlocked: true },
                combat: { level: 0, exp: 0, unlocked: true }
            },
            characterLevel: {
                level: 1,
                exp: 0,
                unassignedAttributePoints: 0
            },
            combatAttributes: {
                health: 1,
                defense: 1,
                strength: 1,
                stealth: 1,
                perception: 1,
                mobility: 1,
                intellect: 1
            },
            currentRegion: "startingPlains",
            regions: {
                startingPlains: {
                    discovered: true,
                    fogProgress: 0,
                    discoveredLocations: [],
                    discoveredNodes: []
                }
            },
            bank: {
                activeTab: "resources",
                tabs: {
                    resources: {
                        name: "Resources",
                        icon: "📦",
                        order: 0
                    },
                    equipment: {
                        name: "Equipment",
                        icon: "⚔️",
                        order: 1
                    },
                    consumables: {
                        name: "Consumables",
                        icon: "🧪",
                        order: 2
                    }
                },
                items: {},
                newItems: []
            },
            equipment: {
                weapon: null,
                shield: null,
                helmet: null,
                chest: null,
                legs: null,
                neck: null,
                ring: null,
                back: null
            },
            combat: {
                player: {
                    baseAttackDamage: 5,
                    baseAttackSpeed: 1.0,
                    baseAccuracy: 75,
                    currentHealth: 100,
                    maxHealth: 100
                },
                currentEnemy: null,
                inCombat: false,
                combatLog: [],
                lastAttackTime: 0,
                selectedEnemyId: null,
                enemyDefeatedAt: null,
                waitingForRespawn: false,
                pendingLoot: []
            },
            perks: {
                damageBonus: 0,
                speedBonus: 0,
                accuracyBonus: 0,
                healthBonus: 0
            },
            nodeCollection: {
                activeNode: null,
                lastCollectionTick: 0,
                selectedSkill: null
            },
            gameTime: 0,
            lastTick: Date.now(),
            lastSave: null,
            tickRate: 100
        };

        // Restart the game loop
        this.startGameLoop();
        console.log("🔄 Game reset complete");
    }
};

// Export for use in other modules (if using modules)
// In vanilla JS, GameEngine is available globally
