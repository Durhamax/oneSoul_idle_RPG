/**
 * GAME ENGINE - CORE COORDINATOR
 *
 * Orchestrates all game systems and manages the main game loop.
 * System-specific logic has been modularized into separate files.
 */

const GameEngine = {
    // Game state - this is what gets saved/loaded
    state: {
        // Metadata
        lastSaveTime: Date.now(),  // Track last save time for offline progress

        // Currencies
        currencies: {
            gold: 0,
            medals: 0,
            tomes: 0,
            gems: 0
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

            // Crafting Skills (6 core + 1 vertical)
            cooking: { level: 1, exp: 0, unlocked: true },
            chemistry: { level: 1, exp: 0, unlocked: true },
            smithing: { level: 1, exp: 0, unlocked: true },
            mechanics: { level: 1, exp: 0, unlocked: true },
            electronics: { level: 1, exp: 0, unlocked: true },
            textiles: { level: 1, exp: 0, unlocked: true },
            engineering: { level: 1, exp: 0, unlocked: true }
        },

        // Character Level (overarching level)
        characterLevel: {
            name: "Adventurer",
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
        currentRegion: "region_-3_-4",  // Active region ID (starting position)
        regions: {
            "region_-3_-4": {  // Starting region (The Cradle)
                discovered: true,
                discoveryProgress: 0,  // 0-100%, increases through navigation
                discoveredLocations: [],
                discoveredExitPaths: [],  // Array of adjacent region IDs that can be traveled to
                availableNodes: {}  // Node-specific state in this region
            }
        },

        // Global discovery state (nodes and enemies accessible across all regions)
        globalNodes: {},    // {nodeId: {discovered, regionContributions, totalHealthBonus}}
        globalEnemies: {},  // {enemyId: {discovered, regionContributions, totalHealthBonus}}

        // Current Activity (only one activity can be active at a time)
        currentActivity: null,  // Possible values: null, 'navigation', 'combat', 'nodeCollection', 'crafting'

        // Active Navigation (discovery system)
        activeNavigation: {
            isNavigating: false,       // Currently exploring/discovering
            isRecovering: false,       // Currently recovering endurance
            lastNavigationTick: 0,     // Last time progress was made
            lastRecoveryTick: 0,       // Last time endurance was recovered
            endurance: 100,            // Current endurance for exploration
            maxEndurance: 100,         // Max endurance (based on strength + mobility)
            restEquipment: {           // Equipment for camping/recovery
                food: null,            // Food item with healing value
                wood: null             // Wood item (log type)
            }
        },

        // Bank/Inventory System
        bank: {
            activeTab: "resource",  // Currently selected tab
            tabs: {
                resource: {
                    name: "Resources",
                    icon: "📦",
                    order: 0
                },
                tool: {
                    name: "Tools",
                    icon: "⛏️",
                    order: 1
                },
                weapon: {
                    name: "Weapons",
                    icon: "⚔️",
                    order: 2
                },
                armor: {
                    name: "Armor",
                    icon: "🛡️",
                    order: 3
                },
                technology: {
                    name: "Technology",
                    icon: "⚡",
                    order: 4
                },
                mod: {
                    name: "Mods",
                    icon: "💎",
                    order: 5
                },
                healing: {
                    name: "Healing",
                    icon: "🧪",
                    order: 6
                },
                consumable: {
                    name: "Consumables",
                    icon: "⚗️",
                    order: 7
                },
                perk: {
                    name: "Perks",
                    icon: "⭐",
                    order: 8
                },
                medal: {
                    name: "Medals",
                    icon: "🏅",
                    order: 9
                },
                attachment: {
                    name: "Attachments",
                    icon: "⚙️",
                    order: 10
                },
                quest: {
                    name: "Quest Items",
                    icon: "📜",
                    order: 11
                }
            },
            items: {
                // Items stored as: itemId: { quantity, tab, isNew, lastAddedTime }
            },
            newItems: [],  // Array of itemIds that are newly added

            // Equipment instances (non-stackable, unique items)
            equipmentInstances: {
                // instanceId: { baseItemId, instanceId, rarity, stats, enhancements, potential, createdAt, name, tier, level }
            }
        },

        // Equipment System - 3x3 Grid + Consumables + Technology
        equipment: {
            // === 3x3 EQUIPMENT GRID (Provides perks) ===
            weapon: null,      // Main weapon
            helmet: null,      // Head armor
            back: null,        // Cape/Cloak
            gloves: null,      // Gloves
            chest: null,       // Body armor
            neck: null,        // Necklace/Amulet
            boots: null,       // Boots
            legs: null,        // Leg armor
            ring: null,        // Ring

            // === CONSUMABLE SLOTS (No perks, show quantity) ===
            ammo: null,        // Ammunition for ranged weapons
            food: null,        // Food for auto-eat (already existed)
            potion: null,      // Combat potions/buffs

            // === TECHNOLOGY SLOTS (No perks, intellect-gated) ===
            tech1: null,       // Unlocked at 10 intellect
            tech2: null,       // Unlocked at 25 intellect
            tech3: null,       // Unlocked at 50 intellect
            tech4: null        // Unlocked at 100 intellect
        },

        // Equipment Presets - Save and quickly switch between builds
        equipmentPresets: {
            presets: [
                null, null, null, null, null,  // Presets 1-5
                null, null, null, null, null   // Presets 6-10
            ],
            activePreset: null  // Index of currently active preset (0-9), or null if custom
        },

        // Combat System
        combat: {
            // Player base stats
            player: {
                baseAttackDamage: 5,
                baseAttackSpeed: 1.0,    // Attacks per second
                baseAccuracy: 75,        // % chance to hit
                currentHealth: 500,
                maxHealth: 500
            },

            // Current enemy (null when not in combat)
            currentEnemy: null,

            // Combat state
            inCombat: false,
            combatLog: [],
            lastAttackTime: 0,
            isAttacking: false,  // Flag for attack animation (disables equipment swaps)

            // Reload system (for gun-type weapons)
            playerAmmo: {
                currentAmmo: 0,
                magazineSize: 0,
                isReloading: false,
                reloadStartTime: 0,
                reloadDuration: 0
            },

            // Active effects on enemy
            activeEffects: [],  // Array of {type, startTime, duration, damagePerTick, tickInterval, defenseLoss, etc}

            // Auto-eat system
            autoEatThreshold: 0.5,       // Eat food when health drops below 50%
            lastAutoEatTime: 0,          // Timestamp of last auto-eat
            autoEatCooldown: 3000,       // 3 second cooldown between auto-eats
            equippedFoodQuantity: 0,     // Track quantity of equipped food

            // Stance system
            currentStance: "offensive",  // "offensive" or "defensive"
            lastStanceChange: 0,         // Timestamp of last stance change
            stanceChangeCooldown: 2000,  // 2 second cooldown

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
            activeNode: null,        // Currently harvesting node {nodeId, startTime, harvestTime}
            selectedSkill: null      // Currently selected skill for node filtering
        },

        // Crafting System
        crafting: {
            discoveredStations: [],  // Array of discovered crafting station IDs
            activeCrafts: [],        // Array of active crafts {recipeId, startTime, completionTime, stationId}
            selectedSkill: null,     // Currently selected crafting skill filter
            autoRecipe: null         // Recipe to auto-repeat until stopped or out of materials
        },

        // Mission System
        missions: {
            available: [],           // Mission IDs available to start in current region
            active: [],              // Mission IDs currently active
            completed: [],           // Mission IDs that have been completed (forever)

            // Active mission progress tracking
            activeProgress: {},      // { missionId: { objectives: {objId: {current, required}}, startTime, completionTimes: [] } }

            // Repeatable mission cooldowns
            cooldowns: {},           // { missionId: lastCompletionTime }

            // Analytics
            analytics: {
                totalStarted: 0,
                totalCompleted: 0,
                totalAbandoned: 0,
                byMission: {}        // { missionId: { started, completed, abandoned, avgTime, fastestTime } }
            }
        },

        // Engineering System (Workshop Upgrades & Specialization)
        engineering: {
            // Engineering tokens (premium currency for upgrades)
            tokens: 0,

            // Workshop tiers for each crafting skill (0 = no workshop, 1-4 = tiers)
            workshops: {
                cooking: 0,
                chemistry: 0,
                smithing: 0,
                mechanics: 0,
                electronics: 0,
                textiles: 0
            },

            // Specialization paths (one per skill, mutually exclusive)
            paths: {
                // skillName: pathId (e.g., "cooking": "culinary_master")
            },

            // Unlocked recipes from reverse engineering
            reversedRecipes: []
        },

        // Perk Grid System
        perkGrid: {
            // Grid state
            medals: {},              // { "row,col": { type, row, col, placedAt } }
            unlockedCells: 9,        // Number of unlocked cells (start with center 3x3)
            unlockOrder: [],         // Spiral unlock order (generated on init)

            // Saved configurations
            savedConfigs: {},        // { configName: { medals, unlockedCells, totalPower, savedAt } }

            // Last calculation cache
            lastCalculation: null,   // { totalPower, rowMultipliers, colMultipliers, cellPowers, timestamp }

            // Balance configuration
            config: {
                baseUnlockCost: 10,           // Cost to unlock first cell after center
                unlockCostMultiplier: 1.5,    // Exponential multiplier for unlock costs
                maxCellPower: 1000000,        // Power cap per cell to prevent exponential explosion
                warningRowMultiplier: 10,     // Warn if row multiplier exceeds this
                warningColMultiplier: 10,     // Warn if column multiplier exceeds this
                warningTotalPower: 10000000   // Warn if total power exceeds this
            }
        },

        // Metadata
        gameTime: 0,              // Total game time in seconds
        lastTick: Date.now(),     // Last update timestamp
        lastSave: null,           // Last save timestamp
        tickRate: 100             // Game updates every 100ms (10 ticks/second)
    },

    // Game Balance Variables (tunable in developer panel)
    gameBalance: {
        // Experience & Leveling - Endless Exponential System
        skillBaseExpLv1to2: 100,      // Base XP required for level 1→2 (all skills)
        skillExpScaling: 1.15,        // Exponential scaling factor (e.g., 1.15 = 15% increase per level)
        characterBaseExpLv1to2: 500,  // Base character XP for level 1→2 (higher start)
        characterExpScaling: 1.10,    // Character exp scaling (slower than skills, e.g., 10% per level)

        // Combat
        baseCombatDamage: 10,         // Base player damage
        baseEnemyHealth: 100,         // Enemy health multiplier
        combatAttackSpeed: 2.5,       // Attacks per second (base)
        combatAccuracy: 75,           // Base hit chance %

        // Gathering
        gatherInterval: 2000,         // Time between gather actions (ms)
        nodeBaseHealth: 50,           // Base health for resource nodes
        gatherToolDamageMultiplier: 1.0, // Multiplier for tool damage

        // Navigation/Exploration - Attribute-Based System
        // Discovery Interval (Mobility)
        navigationInterval: 3000,           // Base time between discovery attempts (ms)
        mobilityIntervalReduction: 50,      // Interval reduction per mobility point (ms)
        minDiscoveryInterval: 1000,         // Minimum interval cap (ms)

        // Endurance System (Health)
        baseEndurance: 50,                  // Base endurance pool
        enduranceHealthMult: 10,            // Endurance gained per health point
        enduranceDrainPerAttempt: 5,        // Base endurance cost per discovery attempt
        healthDepletionReduction: 0.3,      // Depletion reduction per health point
        minDepletionRate: 1.5,              // Minimum depletion rate
        baseEnduranceRecovery: 2,           // Base recovery per second
        healthRecoveryBonus: 1.0,           // Recovery bonus per health point

        // Discovery Chance (Perception)
        baseDiscoveryChance: 30,            // Base % chance to make discovery per attempt
        perceptionDiscoveryBonus: 2.5,      // % discovery chance per perception point
        baseComplicationFactor: 1.0,        // Base complication for all regions
        complicationScaling: 0.1,           // Complication increase per distance from start

        // Crafting
        craftingTimeMultiplier: 1.0,  // Multiplier for all crafting times
        craftingExpMultiplier: 1.0,   // Multiplier for crafting XP

        // Economy
        goldDropMultiplier: 1.0,      // Multiplier for gold drops
        itemDropRateMultiplier: 1.0,  // Multiplier for item drop chances

        // Progression
        attributePointsPerLevel: 1,   // Attribute points gained per character level
        skillUnlockThreshold: 1,      // Minimum skill level to unlock features

        // Missions
        missionExpMultiplier: 1.0,    // Multiplier for mission XP rewards
        missionGoldMultiplier: 1.0,   // Multiplier for mission gold rewards
        missionCooldownMultiplier: 1.0, // Multiplier for repeatable mission cooldowns

        // Medal Crafting - Rarity Chance Multipliers
        rarityCommonMult: 1.0,        // Multiplier for common rarity chance
        rarityUncommonMult: 1.0,      // Multiplier for uncommon rarity chance
        rarityRareMult: 1.0,          // Multiplier for rare rarity chance
        rarityEpicMult: 1.0,          // Multiplier for epic rarity chance
        rarityLegendaryMult: 1.0,     // Multiplier for legendary rarity chance
        rarityMythicMult: 1.0,        // Multiplier for mythic rarity chance
        rarityDivineMult: 1.0,        // Multiplier for divine rarity chance
        rarityTranscendentMult: 1.0,  // Multiplier for transcendent rarity chance
        rarityCreatorMult: 1.0        // Multiplier for creator rarity chance
    },

    // Reference to definitions (will be set in init)
    definitions: null,

    // Game loop interval
    gameLoop: null,

    /**
     * Get nodes from NodeRegistry (provides access to node system)
     */
    get nodes() {
        if (typeof NodeRegistry !== 'undefined') {
            return NodeRegistry.getAllActive();
        }
        return {};
    },

    /**
     * Apply default rarity to all items that don't have one
     * This ensures backward compatibility and consistent rarity system
     */
    applyDefaultRarities() {
        if (!this.definitions.items) return;

        let appliedCount = 0;
        for (let itemId in this.definitions.items) {
            const item = this.definitions.items[itemId];

            // Skip if item already has a rarity
            if (item.rarity) continue;

            // Default to 'common' rarity
            item.rarity = 'common';
            appliedCount++;
        }

        if (appliedCount > 0) {
            console.log(`✅ Applied default 'common' rarity to ${appliedCount} items`);
        }
    },

    /**
     * Get item definition (STANDARDIZED ACCESS PATTERN)
     * This is the single source of truth for item access across all systems.
     * @param {string} itemId - Item ID
     * @returns {object|null} Item definition or null if not found
     */
    getItem(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },

    /**
     * Get rarity data for an item
     * @param {string} itemId - Item ID
     * @returns {object|null} Rarity definition or null if not found
     */
    getItemRarity(itemId) {
        const item = this.getItem(itemId);
        if (!item) return null;

        const rarity = item.rarity || 'common';
        return this.definitions.RARITY_TIERS[rarity] || this.definitions.RARITY_TIERS.common;
    },

    /**
     * Load game data from JSON files (async)
     * Falls back to GameDefinitions if JSON files not available
     */
    async loadGameData() {
        console.log("📦 Loading game data...");

        try {
            // Try to load JSON data
            const jsonPath = 'data/json/';
            const response = await fetch(jsonPath + 'definitions.json');

            if (response.ok) {
                const jsonData = await response.json();
                console.log("✅ Loaded data from JSON files");

                // Merge JSON data with GameDefinitions (keep RARITY_TIERS, ITEM_CATEGORIES, etc. from code)
                this.definitions = {
                    ...GameDefinitions,  // Keep system definitions
                    ...jsonData          // Override with JSON data
                };

                // IMPORTANT: Re-apply dynamic getters to preserve Registry integrations
                Object.defineProperty(this.definitions, 'items', {
                    get() {
                        // Delegate to GameDefinitions.items getter (which uses ItemRegistry)
                        return GameDefinitions.items;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(this.definitions, 'enemies', {
                    get() {
                        return GameDefinitions.enemies;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(this.definitions, 'missions', {
                    get() {
                        return GameDefinitions.missions;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(this.definitions, 'recipes', {
                    get() {
                        return GameDefinitions.recipes;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(this.definitions, 'skills', {
                    get() {
                        return GameDefinitions.skills;
                    },
                    enumerable: true,
                    configurable: true
                });

                return true;
            } else {
                throw new Error('JSON files not found');
            }
        } catch (error) {
            console.log("⚠️  JSON data not available, using GameDefinitions fallback");
            this.definitions = GameDefinitions;
            return false;
        }
    },

    /**
     * Initialize the game engine (now async to support JSON loading)
     */
    async init() {
        console.log("🎮 Game Engine Initializing...");

        // Load definitions (try JSON first, fallback to code)
        await this.loadGameData();

        // Apply default rarities to all items that don't have one
        this.applyDefaultRarities();

        // Initialize all systems
        InventorySystem.init(this);
        SkillSystem.init(this);
        EquipmentSystem.init(this);
        EquipmentPresetSystem.init(this);
        AttachmentSystem.init(this);
        TypeEffectivenessSystem.init(this);
        ResourceSystem.init(this);
        GatheringSystem.init(this);  // New universal gathering system
        MiningSystem.init(this);  // Initialize mining system before GlobalDiscoverySystem
        GlobalDiscoverySystem.init(this);
        // RestRecoverySystem.init(this);  // DEPRECATED - System removed
        WorldMapSystem.init(this);  // Initialize world map system
        NavigationSystem.init(this);
        NodeCollectionSystem.init(this);
        // HarvestSystem.init(this);  // DEPRECATED - Replaced by gatheringSystem.js
        CombatSystem.init(this);
        OfflineCombatSystem.init(this);
        CraftingSystem.init(this);
        MissionSystem.init(this);
        EngineeringSystem.init(this);
        EnhancementSystem.init(this);
        PerkGridSystem.init(this);
        MedalCraftingSystem.init(this);

        // Initialize unified item database integration
        if (typeof ItemIntegration !== 'undefined') {
            ItemIntegration.init(this);
        }

        // Initialize WorldMapSystem
        if (typeof WorldMapSystem !== 'undefined') {
            WorldMapSystem.init(this);
        }

        // Generate the world map if not already generated
        if (!this.definitions.worldMap) {
            console.log("🗺️ Generating hexagonal world map (radius 7)...");
            this.definitions.worldMap = WorldMapSystem.generateWorldMap(7);
            console.log(`✅ Generated ${Object.keys(this.definitions.worldMap).length} regions`);

            // Verify starting region exists (region_-3_-4)
            if (this.definitions.worldMap["region_-3_-4"]) {
                console.log("✅ Starting region (region_-3_-4) exists in world map");

                // TEMPORARILY DISABLED: Mission requirements for testing
                // TODO: Re-enable after mission system refactor
                // WorldMapSystem.setRegionMissionRequirement(this.definitions.worldMap, "region_-3_-4", "tutorial_elder");
                // console.log("🗺️ Starting region requires 'tutorial_elder' mission to leave");
            } else {
                console.error("❌ Starting region (region_-3_-4) NOT found in world map!");
                console.log("Available regions (first 10):", Object.keys(this.definitions.worldMap).slice(0, 10));
            }
        }

        // ALWAYS ensure starting region is unlocked and set as current region
        // Coordinates now match display: (-3, -4)
        const STARTING_REGION = "region_-3_-4";

        // Ensure current region is set to starting region if not set
        if (!this.state.currentRegion) {
            this.state.currentRegion = STARTING_REGION;
            console.log("✅ Set current region to starting region");
        }

        // ALWAYS ensure starting region exists in state and is discovered
        if (!this.state.regions[STARTING_REGION]) {
            this.state.regions[STARTING_REGION] = {
                discovered: true,
                discoveryProgress: 0,
                discoveredLocations: [],
                discoveredNodeTypes: [],
                nodeHealthBonuses: {},
                discoveredExitPaths: [],
                discoveredCraftingStations: []
            };
            console.log("✅ Created starting region state (region_-3_-4)");
        } else if (!this.state.regions[STARTING_REGION].discovered) {
            // If starting region exists but isn't discovered, unlock it
            this.state.regions[STARTING_REGION].discovered = true;
            console.log("✅ Unlocked starting region (region_-3_-4)");
        }

        // Ensure starting region has all required arrays
        const startRegion = this.state.regions[STARTING_REGION];
        if (!startRegion.discoveredNodeTypes) startRegion.discoveredNodeTypes = [];
        if (!startRegion.discoveredCraftingStations) startRegion.discoveredCraftingStations = [];
        if (!startRegion.discoveredExitPaths) startRegion.discoveredExitPaths = [];
        if (!startRegion.nodeHealthBonuses) startRegion.nodeHealthBonuses = {};

        // Auto-discover nodes in starting region on new game
        if (typeof WorldRegions !== 'undefined' && WorldRegions[STARTING_REGION]) {
            const startRegionDef = WorldRegions[STARTING_REGION];
            if (startRegionDef.discoverableNodes && startRegionDef.discoverableNodes.length > 0) {
                for (const nodeId of startRegionDef.discoverableNodes) {
                    // Only auto-discover if not already discovered
                    if (!this.state.globalNodes[nodeId] || !this.state.globalNodes[nodeId].discovered) {
                        this.discoverNodeGlobally(nodeId, STARTING_REGION);
                        console.log(`✅ Auto-discovered starting node: ${nodeId}`);
                    }
                }
            }
        }

        // Initialize background system AFTER world map is guaranteed to exist
        if (typeof BackgroundSystem !== 'undefined') {
            BackgroundSystem.init();
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

        // Add perk grid system if missing (backward compatibility)
        if (!this.state.perkGrid) {
            this.state.perkGrid = {
                equipmentCells: {},  // Center 3x3 equipment mapping
                unlockOrder: [],     // Spiral unlock order for non-equipment cells
                placedMedals: {}     // Medals placed on grid cells
            };
            console.log("✅ Added perk grid system");
        }

        // Initialize equipment cells
        if (!this.state.perkGrid.equipmentCells) {
            this.state.perkGrid.equipmentCells = {};
        }

        // Initialize placed medals
        if (!this.state.perkGrid.placedMedals) {
            this.state.perkGrid.placedMedals = {};
        }

        // Initialize unlock order - not used in new 5x5 system (all cells available)
        if (!this.state.perkGrid.unlockOrder) {
            this.state.perkGrid.unlockOrder = [];
        }
        console.log(`✅ Perk grid initialized (5x5 system - all cells available)`);


        // Update equipment cells to reflect currently equipped items
        this.updateEquipmentCells();

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

        // Migrate to currencies system (backward compatibility)
        if (!this.state.currencies) {
            this.state.currencies = {
                gold: this.state.resources.gold || 0,
                medals: 0,
                tomes: 0,
                gems: 0
            };
            delete this.state.resources.gold;
            console.log("✅ Migrated to currencies system");
        }

        // Ensure all currencies exist
        if (this.state.currencies.medals === undefined) this.state.currencies.medals = 0;
        if (this.state.currencies.tomes === undefined) this.state.currencies.tomes = 0;
        if (this.state.currencies.gems === undefined) this.state.currencies.gems = 0;

        // Add pending loot to combat (backward compatibility)
        if (this.state.combat && !this.state.combat.pendingLoot) {
            this.state.combat.pendingLoot = [];
            console.log("✅ Added pending loot to combat");
        }

        // Migrate old crafting skills to new system (forging→smithing, machining→mechanics)
        if (this.state.skills.forging && !this.state.skills.smithing) {
            this.state.skills.smithing = {
                level: this.state.skills.forging.level,
                exp: this.state.skills.forging.exp,
                unlocked: true
            };
            delete this.state.skills.forging;
            console.log(`✅ Migrated forging → smithing (Level ${this.state.skills.smithing.level})`);
        }

        if (this.state.skills.machining && !this.state.skills.mechanics) {
            this.state.skills.mechanics = {
                level: this.state.skills.machining.level,
                exp: this.state.skills.machining.exp,
                unlocked: true
            };
            delete this.state.skills.machining;
            console.log(`✅ Migrated machining → mechanics (Level ${this.state.skills.mechanics.level})`);
        }

        // Add new crafting skills if missing (backward compatibility)
        const craftingSkills = ['cooking', 'chemistry', 'smithing', 'mechanics', 'electronics', 'textiles', 'engineering'];
        for (let skill of craftingSkills) {
            if (!this.state.skills[skill]) {
                this.state.skills[skill] = { level: 1, exp: 0, unlocked: true };
                console.log(`✅ Added ${skill} skill`);
            }
        }

        // Migrate from old engineeringTech to new engineering system (backward compatibility)
        if (this.state.engineeringTech && !this.state.engineering) {
            this.state.engineering = {
                tokens: 0,  // Start fresh
                workshops: {
                    cooking: 0,
                    chemistry: 0,
                    smithing: 0,
                    mechanics: 0,
                    electronics: 0,
                    textiles: 0
                },
                paths: {},
                reversedRecipes: []
            };
            delete this.state.engineeringTech;
            console.log("✅ Migrated engineeringTech → engineering (workshop system)");
        }

        // Add engineering system if missing (backward compatibility)
        if (!this.state.engineering) {
            this.state.engineering = {
                tokens: 0,
                workshops: {
                    cooking: 0,
                    chemistry: 0,
                    smithing: 0,
                    mechanics: 0,
                    electronics: 0,
                    textiles: 0
                },
                paths: {},
                reversedRecipes: []
            };
            console.log("✅ Added engineering system");
        }

        // Add crafting system if missing (backward compatibility)
        if (!this.state.crafting) {
            this.state.crafting = {
                discoveredStations: [],
                activeCrafts: [],
                selectedSkill: null,
                autoRecipe: null
            };
            console.log("✅ Added crafting system");
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
            this.state.currentRegion === "region_-10_0" ||
            this.state.currentRegion === "region_0_10") {
            this.state.currentRegion = "region_0_0"; // New starting position (origin, axial coords)
            console.log("✅ Migrated to hexagonal world map system (starting at origin)");
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

        // Add all missing bank tabs (backward compatibility)
        const requiredTabs = {
            resource: { name: "Resources", icon: "📦", order: 0 },
            tool: { name: "Tools", icon: "⛏️", order: 1 },
            weapon: { name: "Weapons", icon: "⚔️", order: 2 },
            armor: { name: "Armor", icon: "🛡️", order: 3 },
            technology: { name: "Technology", icon: "⚡", order: 4 },
            mod: { name: "Mods", icon: "💎", order: 5 },
            healing: { name: "Healing", icon: "🧪", order: 6 },
            consumable: { name: "Consumables", icon: "⚗️", order: 7 },
            perk: { name: "Perks", icon: "⭐", order: 8 },
            medal: { name: "Medals", icon: "🏅", order: 9 },
            quest: { name: "Quest Items", icon: "📜", order: 10 },
            legacy: { name: "Legacy Items", icon: "🎒", order: 11 }
        };

        // Migrate old tab names to new structure
        const tabMigrations = {
            'resources': 'resource',
            'equipment': 'legacy',  // Old equipment tab becomes legacy
            'consumables': 'consumable'
        };

        // Apply migrations
        for (let [oldName, newName] of Object.entries(tabMigrations)) {
            if (this.state.bank.tabs[oldName] && !this.state.bank.tabs[newName]) {
                // Move items from old tab to new tab
                for (let itemId in this.state.bank.items) {
                    if (this.state.bank.items[itemId].tab === oldName) {
                        this.state.bank.items[itemId].tab = newName;
                    }
                }
                // Delete old tab
                delete this.state.bank.tabs[oldName];
                console.log(`✅ Migrated ${oldName} → ${newName}`);
            }
        }

        // Add any missing tabs
        let addedTabs = 0;
        for (let [tabId, tabData] of Object.entries(requiredTabs)) {
            if (!this.state.bank.tabs[tabId]) {
                this.state.bank.tabs[tabId] = { ...tabData };
                addedTabs++;
                console.log(`✅ Added ${tabData.icon} ${tabData.name} tab`);
            }
        }

        if (addedTabs > 0) {
            console.log(`✅ Added ${addedTabs} missing bank tabs (total: ${Object.keys(this.state.bank.tabs).length})`);
        }

        // Fix active tab if it's using an old name
        if (this.state.bank.activeTab === 'resources') {
            this.state.bank.activeTab = 'resource';
        } else if (this.state.bank.activeTab === 'equipment') {
            this.state.bank.activeTab = 'legacy';
        } else if (this.state.bank.activeTab === 'consumables') {
            this.state.bank.activeTab = 'consumable';
        }

        // Initialize craftedMedals array if missing (backward compatibility)
        if (!this.state.craftedMedals) {
            this.state.craftedMedals = [];
            console.log("✅ Initialized crafted medals array");
        }

        // Update available missions for current region
        this.updateAvailableMissions();

        // Validate node system (only in development)
        if (typeof NodeValidator !== 'undefined' && typeof NodeRegistry !== 'undefined') {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                const nodeReport = NodeValidator.validateRegistry(NodeRegistry);
                if (nodeReport.invalid > 0) {
                    console.error(`❌ Node validation failed: ${nodeReport.invalid} invalid nodes`);
                    nodeReport.errors.forEach(err => {
                        console.error(`  [${err.status}] ${err.id}:`, err.errors);
                    });
                } else {
                    console.log(`✅ Node system validated: ${nodeReport.valid}/${nodeReport.total} nodes`);
                }
            }
        }

        this.startGameLoop();
        console.log("✅ Game Engine Initialized");
        return this.state;
    },

    /**
     * Build stat context from current game state
     * Used by StatCalculator to get all contextual data for calculations
     */
    buildStatContext() {
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
            attributes: this.state.combatAttributes, // Alias for compatibility
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
    },

    /**
     * Get node defensive stats (explicit or calculated from tier)
     * Delegates to StatCalculator for actual values (follows foundation spec)
     */
    getNodeDefensiveStats(nodeId) {
        // REGISTRY ONLY - No legacy fallbacks
        const nodeDef = NodeRegistry.getAllActive()[nodeId];
        if (!nodeDef) {
            console.error(`❌ Node '${nodeId}' not found in NodeRegistry`);
            return StatCalculator.getNodeDefensiveStatsByTier(1); // Return tier 1 defaults
        }

        // If node has explicit defensive stats, use them
        if (nodeDef.resistance !== undefined) {
            return {
                resistance: nodeDef.resistance || 0,
                evasion: nodeDef.evasion || 0,
                critEvasion: nodeDef.critEvasion || 0,
                critResistance: nodeDef.critResistance || 0,
                rareEvasion: nodeDef.rareEvasion || 0,
                rareResistance: nodeDef.rareResistance || 0
            };
        }

        // Otherwise, get default stats from StatCalculator based on tier
        return StatCalculator.getNodeDefensiveStatsByTier(nodeDef.tier || 1);
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

        // Update all resource generation (delegated to ResourceSystem)
        if (this.updateResourceGeneration) {
            this.updateResourceGeneration(deltaTime);
        }

        // Check for newly unlocked content
        this.checkUnlocks();

        // Auto-clean old "new" item markers every 10 seconds (delegated to InventorySystem)
        if (Math.floor(this.state.gameTime) % 10 === 0) {
            if (this.autoCleanNewItems) {
                this.autoCleanNewItems();
            }
        }

        // Process combat (delegated to CombatSystem)
        if (this.state.combat.inCombat) {
            if (this.playerAttack) {
                this.playerAttack();
            }
            if (this.enemyAttack) {
                this.enemyAttack();
            }

            // Apply HP regeneration
            if (this.applyHPRegeneration) {
                this.applyHPRegeneration(deltaTime);
            }
        }

        // Check for enemy respawn (delegated to CombatSystem)
        if (this.state.combat.waitingForRespawn) {
            if (this.checkEnemyRespawn) {
                this.checkEnemyRespawn();
            }
        }

        // GATHERING SYSTEM (Universal for all gathering skills: mining, logging, fishing, etc.)
        // GatheringSystem handles all gathering logic - no other systems should process gathering
        if (this.state.currentActivity === 'gathering') {
            if (this.processGatheringTick) {
                this.processGatheringTick();
            }
        }

        // DEPRECATED SYSTEMS BELOW - Kept for backward compatibility with old save files only
        // These should NOT run if GatheringSystem is active (prevents double-processing)

        // OLD: NodeCollectionSystem (DEPRECATED - replaced by GatheringSystem)
        // Only runs if NOT using new gathering system
        if (!this.state.gatheringSession && this.state.nodeCollection && this.state.nodeCollection.activeNode) {
            if (this.processNodeHarvesting) {
                this.processNodeHarvesting(deltaTime);
            }
        }

        // OLD: MiningSystem (DEPRECATED - replaced by GatheringSystem)
        // Only runs if NOT using new gathering system
        if (!this.state.gatheringSession && this.state.currentActivity === 'mining') {
            if (this.state.miningState && this.state.miningState.isResting) {
                // Process rest state
                if (this.processMiningRestTick) {
                    this.processMiningRestTick();
                }
            } else {
                // Process mining action
                if (this.processMiningTick) {
                    this.processMiningTick();
                }
            }

            // Update mining UI every tick
            if (typeof renderMiningUI === 'function') {
                renderMiningUI();
            }
        }

        // Update node respawns in current region
        if (this.updateNodeRespawns) {
            this.updateNodeRespawns();
        }

        // Process navigation/discovery (delegated to NavigationSystem)
        if (this.state.activeNavigation && this.state.activeNavigation.isNavigating) {
            // Process rest resource consumption (food + logs every 6s) - DEPRECATED
            // if (this.processRestConsumption) {
            //     this.processRestConsumption(deltaTime);
            // }

            if (this.processNavigation) {
                this.processNavigation(deltaTime);
            }
        }

        // Check for completed crafts (delegated to CraftingSystem)
        if (this.state.crafting) {
            if (this.checkCraftCompletion) {
                this.checkCraftCompletion();
            }
        }
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
            if (this.updateResourceGeneration) {
                this.updateResourceGeneration(tickSize);
            }
        }

        this.state.gameTime += cappedSeconds;

        return {
            timeProcessed: cappedSeconds,
            wasCapped: offlineSeconds > maxOfflineSeconds
        };
    },

    /**
     * Stop all active activities
     */
    stopAllActivities() {
        // Stop navigation (delegated to NavigationSystem)
        if (this.state.currentActivity === 'navigation') {
            if (this.stopNavigation) {
                this.stopNavigation();
            }
        }

        // Stop node collection (delegated to NodeCollectionSystem)
        if (this.state.currentActivity === 'nodeCollection') {
            if (this.stopNodeHarvesting) {
                this.stopNodeHarvesting();
            }
        }

        // Stop combat (delegated to CombatSystem)
        if (this.state.currentActivity === 'combat') {
            if (this.endCombat) {
                this.endCombat();
            }
        }

        // Stop all active crafts (don't refund materials - they were already consumed)
        if (this.state.currentActivity === 'crafting') {
            this.state.currentActivity = null;
        }
        // Note: We don't cancel active crafts - they continue in background

        return { success: true };
    },

    /**
     * Reset the game to initial state
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
                navigation: { level: 1, exp: 0, unlocked: true },
                mining: { level: 1, exp: 0, unlocked: true },
                logging: { level: 1, exp: 0, unlocked: true },
                fishing: { level: 1, exp: 0, unlocked: true },
                hunting: { level: 1, exp: 0, unlocked: true },
                foraging: { level: 1, exp: 0, unlocked: true },
                thieving: { level: 1, exp: 0, unlocked: true },
                forging: { level: 1, exp: 0, unlocked: true },
                machining: { level: 1, exp: 0, unlocked: true },
                cooking: { level: 1, exp: 0, unlocked: true },
                chemistry: { level: 1, exp: 0, unlocked: true },
                textiles: { level: 1, exp: 0, unlocked: true },
                engineering: { level: 1, exp: 0, unlocked: true }
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
            currentRegion: "region_0_0",
            regions: {
                "region_0_0": {
                    discovered: true,
                    discoveryProgress: 0,
                    discoveredLocations: [],
                    discoveredNodeTypes: [],
                    nodeHealthBonuses: {},
                    discoveredExitPaths: [],
                    discoveredCraftingStations: []
                }
            },
            currentActivity: null,
            activeNavigation: {
                isNavigating: false,
                lastNavigationTick: 0,
                endurance: 100,
                maxEndurance: 100
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
                selectedSkill: null
            },
            crafting: {
                discoveredStations: [],
                activeCrafts: [],
                selectedSkill: null,
                autoRecipe: null
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
