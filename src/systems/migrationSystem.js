/**
 * MIGRATION SYSTEM
 *
 * Centralized location for all backward compatibility migrations.
 * This runs AFTER the save file loads to ensure all new features are added
 * to existing saves.
 *
 * HOW TO ADD A NEW MIGRATION:
 * 1. Add your migration function below
 * 2. Add it to the migrations array in runAllMigrations()
 * 3. That's it! It will run automatically after save loads
 */

const MigrationSystem = {
    /**
     * Run all migrations on the loaded game state
     * Called by SaveSystem after loading a save file
     */
    runAllMigrations() {
        console.log("🔄 Running save migrations...");

        const migrations = [
            this.migrateBankTabs,
            this.migratePerkGrid,
            this.migrateCurrencies,
            this.migrateCombatAttributes,
            this.migrateCraftingSkills,
            this.migrateActiveNavigation,
            this.migrateCraftingSystem,
            this.migrateMissionSystem,
            this.migrateMedalCrafting,
            this.migrateNodeCollection,
            this.migrateCharacterLevel,
            this.migrateCombatPendingLoot,
            this.migrateRegionSystem,
            this.migrateCurrentActivity,
            this.migrateNodeHarvestingSystem,
            this.removeLegacyTab,
            this.fixTutorialMissionTargets,
            this.migrateEngineeringSystem,
            this.migrateBidirectionalPaths,
            this.migratePlayerAmmo,
            this.migrateStanceSystem,
            this.migrateEquipmentSlots,
            this.migrateInvalidEquipment,
            this.migrateCoordinateSystem,
            this.migrateGlobalDiscovery,
            this.migrateNavigationRequirements
        ];

        let totalMigrations = 0;
        for (let migration of migrations) {
            const count = migration.call(this);
            if (count > 0) {
                totalMigrations += count;
            }
        }

        if (totalMigrations > 0) {
            console.log(`✅ Applied ${totalMigrations} migrations to save file`);
        } else {
            console.log("✅ Save file is up to date");
        }
    },

    /**
     * Migrate bank tabs to new 12-tab structure
     */
    migrateBankTabs() {
        let changes = 0;

        // Define all required tabs
        const requiredTabs = {
            resource: { name: "Resources", icon: "📦", order: 0 },
            tool: { name: "Tools", icon: "⛏️", order: 1 },
            weapon: { name: "Weapons", icon: "⚔️", order: 2 },
            armor: { name: "Armor", icon: "🛡️", order: 3 },
            technology: { name: "Technology", icon: "⚡", order: 4 },
            mod: { name: "Mods", icon: "💎", order: 5 },
            healing: { name: "Healing", icon: "🧪", order: 6 },
            consumable: { name: "Consumables", icon: "⚗️", order: 7 },
            medal: { name: "Medals", icon: "🏅", order: 8 },
            quest: { name: "Quest Items", icon: "📜", order: 9 },
            legacy: { name: "Legacy Items", icon: "🎒", order: 10 }
        };

        // Migrate old tab names to new structure
        const tabMigrations = {
            'resources': 'resource',
            'equipment': 'legacy',
            'consumables': 'consumable',
            'perk': null  // Remove perk tab, medals tab handles this now
        };

        // Apply tab name migrations
        for (let [oldName, newName] of Object.entries(tabMigrations)) {
            if (GameEngine.state.bank.tabs[oldName]) {
                if (newName === null) {
                    // Delete tab entirely and remove all items with this tab
                    const itemsToDelete = [];
                    for (let itemId in GameEngine.state.bank.items) {
                        if (GameEngine.state.bank.items[itemId].tab === oldName) {
                            itemsToDelete.push(itemId);
                        }
                    }
                    // Delete the items
                    for (let itemId of itemsToDelete) {
                        delete GameEngine.state.bank.items[itemId];
                    }
                    delete GameEngine.state.bank.tabs[oldName];
                    console.log(`  ✅ Removed bank tab: ${oldName} (deleted ${itemsToDelete.length} items)`);
                    changes++;
                } else {
                    // Move items from old tab to new tab
                    for (let itemId in GameEngine.state.bank.items) {
                        if (GameEngine.state.bank.items[itemId].tab === oldName) {
                            GameEngine.state.bank.items[itemId].tab = newName;
                        }
                    }
                    // Delete old tab
                    delete GameEngine.state.bank.tabs[oldName];
                    console.log(`  ✅ Migrated bank tab: ${oldName} → ${newName}`);
                    changes++;
                }
            }
        }

        // Also clean up any perk items that might still be in other tabs
        const perkItemIds = ['scavenger_basics', 'quick_hands', 'survivalist'];
        for (let perkItemId of perkItemIds) {
            if (GameEngine.state.bank.items[perkItemId]) {
                delete GameEngine.state.bank.items[perkItemId];
                console.log(`  ✅ Removed deleted perk item: ${perkItemId}`);
                changes++;
            }
        }

        // Add any missing tabs
        for (let [tabId, tabData] of Object.entries(requiredTabs)) {
            if (!GameEngine.state.bank.tabs[tabId]) {
                GameEngine.state.bank.tabs[tabId] = { ...tabData };
                console.log(`  ✅ Added bank tab: ${tabData.icon} ${tabData.name}`);
                changes++;
            }
        }

        // Fix active tab if using old name
        if (GameEngine.state.bank.activeTab === 'resources') {
            GameEngine.state.bank.activeTab = 'resource';
            changes++;
        } else if (GameEngine.state.bank.activeTab === 'equipment') {
            GameEngine.state.bank.activeTab = 'legacy';
            changes++;
        } else if (GameEngine.state.bank.activeTab === 'consumables') {
            GameEngine.state.bank.activeTab = 'consumable';
            changes++;
        } else if (GameEngine.state.bank.activeTab === 'perk') {
            GameEngine.state.bank.activeTab = 'medal';
            changes++;
        }

        return changes;
    },

    /**
     * Migrate perk grid system
     */
    migratePerkGrid() {
        let changes = 0;

        if (!GameEngine.state.perkGrid) {
            GameEngine.state.perkGrid = {
                equipmentCells: {},
                unlockOrder: [],
                placedMedals: {}
            };
            console.log("  ✅ Added perk grid system");
            changes++;
        }

        // Ensure sub-properties exist
        if (!GameEngine.state.perkGrid.equipmentCells) {
            GameEngine.state.perkGrid.equipmentCells = {};
            changes++;
        }
        if (!GameEngine.state.perkGrid.placedMedals) {
            GameEngine.state.perkGrid.placedMedals = {};
            changes++;
        }

        // Ensure unlock order exists (legacy compatibility for 5x5 system)
        if (!GameEngine.state.perkGrid.unlockOrder) {
            GameEngine.state.perkGrid.unlockOrder = [];
        }

        // Update equipment cells
        if (GameEngine.updateEquipmentCells) {
            GameEngine.updateEquipmentCells();
        }

        return changes;
    },

    /**
     * Migrate to currencies system
     */
    migrateCurrencies() {
        let changes = 0;

        if (!GameEngine.state.currencies) {
            GameEngine.state.currencies = {
                gold: GameEngine.state.resources?.gold || 0,
                medals: 0,
                tomes: 0,
                gems: 0
            };
            if (GameEngine.state.resources?.gold) {
                delete GameEngine.state.resources.gold;
            }
            console.log("  ✅ Migrated to currencies system");
            changes++;
        }

        // Ensure all currencies exist
        if (GameEngine.state.currencies.medals === undefined) {
            GameEngine.state.currencies.medals = 0;
            changes++;
        }
        if (GameEngine.state.currencies.tomes === undefined) {
            GameEngine.state.currencies.tomes = 0;
            changes++;
        }
        if (GameEngine.state.currencies.gems === undefined) {
            GameEngine.state.currencies.gems = 0;
            changes++;
        }

        return changes;
    },

    /**
     * Add combat attributes if missing
     */
    migrateCombatAttributes() {
        let changes = 0;

        if (!GameEngine.state.combatAttributes) {
            GameEngine.state.combatAttributes = {
                health: 1,
                defense: 1,
                strength: 1,
                stealth: 1,
                perception: 1,
                mobility: 1,
                intellect: 1
            };
            console.log("  ✅ Added combat attributes");
            changes++;
        }

        return changes;
    },

    /**
     * Add crafting skills if missing
     */
    migrateCraftingSkills() {
        let changes = 0;

        // Rename old skills to new names
        const skillRenames = {
            'forging': 'smithing',
            'machining': 'mechanics'
        };

        for (let [oldName, newName] of Object.entries(skillRenames)) {
            if (GameEngine.state.skills[oldName] && !GameEngine.state.skills[newName]) {
                GameEngine.state.skills[newName] = GameEngine.state.skills[oldName];
                delete GameEngine.state.skills[oldName];
                console.log(`  ✅ Renamed skill: ${oldName} → ${newName}`);
                changes++;
            }
        }

        // Add new crafting skills if missing (using NEW names)
        const craftingSkills = ['cooking', 'chemistry', 'smithing', 'mechanics', 'electronics', 'textiles', 'engineering'];
        for (let skill of craftingSkills) {
            if (!GameEngine.state.skills[skill]) {
                GameEngine.state.skills[skill] = { level: 1, exp: 0, unlocked: true };
                console.log(`  ✅ Added crafting skill: ${skill}`);
                changes++;
            }
        }

        // Add gathering skills if missing
        const gatheringSkills = ['fishing', 'hunting', 'foraging', 'thieving'];
        for (let skill of gatheringSkills) {
            if (!GameEngine.state.skills[skill]) {
                GameEngine.state.skills[skill] = { level: 1, exp: 0, unlocked: true };
                console.log(`  ✅ Added gathering skill: ${skill}`);
                changes++;
            }
        }

        // Ensure all skills start at level 1 minimum
        for (let skillId in GameEngine.state.skills) {
            if (GameEngine.state.skills[skillId].level === 0) {
                GameEngine.state.skills[skillId].level = 1;
                changes++;
            }
        }

        return changes;
    },

    /**
     * Add active navigation system if missing
     */
    migrateActiveNavigation() {
        let changes = 0;

        if (!GameEngine.state.activeNavigation) {
            GameEngine.state.activeNavigation = {
                isNavigating: false,
                lastNavigationTick: 0,
                regionHealth: 100,
                maxRegionHealth: 100
            };
            changes++;
        }

        if (GameEngine.state.activeNavigation && !GameEngine.state.activeNavigation.hasOwnProperty('isNavigating')) {
            GameEngine.state.activeNavigation.isNavigating = false;
            changes++;
        }

        return changes;
    },

    /**
     * Add crafting system if missing
     */
    migrateCraftingSystem() {
        let changes = 0;

        if (!GameEngine.state.crafting) {
            GameEngine.state.crafting = {
                discoveredStations: [],
                activeCrafts: [],
                selectedSkill: null,
                autoRecipe: null
            };
            changes++;
        }

        // Sync crafting stations from regions
        if (GameEngine.state.crafting && GameEngine.state.regions) {
            for (let regionId in GameEngine.state.regions) {
                const regionState = GameEngine.state.regions[regionId];
                if (regionState.discoveredCraftingStations) {
                    for (let stationId of regionState.discoveredCraftingStations) {
                        if (!GameEngine.state.crafting.discoveredStations.includes(stationId)) {
                            GameEngine.state.crafting.discoveredStations.push(stationId);
                            changes++;
                        }
                    }
                }
            }
        }

        return changes;
    },

    /**
     * Add mission system if missing
     */
    migrateMissionSystem() {
        let changes = 0;

        if (!GameEngine.state.missions) {
            GameEngine.state.missions = {
                available: [],
                active: [],
                completed: [],
                activeProgress: {},
                cooldowns: {},
                analytics: {
                    totalStarted: 0,
                    totalCompleted: 0,
                    totalAbandoned: 0,
                    byMission: {}
                }
            };
            changes++;
        }

        return changes;
    },

    /**
     * Add medal crafting system if missing
     */
    migrateMedalCrafting() {
        let changes = 0;

        if (!GameEngine.state.craftedMedals) {
            GameEngine.state.craftedMedals = [];
            changes++;
        }

        if (!GameEngine.state.medalCrafting) {
            GameEngine.state.medalCrafting = {
                totalCrafted: 0,
                craftedByTier: {},
                craftedByRarity: {}
            };
            changes++;
        }

        return changes;
    },

    /**
     * Add node collection system if missing
     */
    migrateNodeCollection() {
        let changes = 0;

        if (!GameEngine.state.nodeCollection) {
            GameEngine.state.nodeCollection = {
                activeNode: null,
                lastCollectionTick: 0,
                selectedSkill: null
            };
            console.log("  ✅ Added nodeCollection system");
            changes++;
        }

        return changes;
    },

    /**
     * Add character level system if missing
     */
    migrateCharacterLevel() {
        let changes = 0;

        if (!GameEngine.state.characterLevel) {
            GameEngine.state.characterLevel = {
                level: 1,
                exp: 0,
                unassignedAttributePoints: 0
            };
            console.log("  ✅ Added character level system");
            changes++;
        }

        return changes;
    },

    /**
     * Add pending loot to combat if missing
     */
    migrateCombatPendingLoot() {
        let changes = 0;

        if (GameEngine.state.combat && !GameEngine.state.combat.pendingLoot) {
            GameEngine.state.combat.pendingLoot = [];
            console.log("  ✅ Added pending loot to combat");
            changes++;
        }

        return changes;
    },

    /**
     * Migrate region system to new coordinate system
     */
    migrateRegionSystem() {
        let changes = 0;

        // Migrate old region ID to new coordinate system
        if (GameEngine.state.currentRegion === "startingPlains" ||
            GameEngine.state.currentRegion === "region_0_0" ||
            GameEngine.state.currentRegion === "region_0_10") {
            GameEngine.state.currentRegion = "region_-10_0";
            console.log("  ✅ Migrated currentRegion to hexagonal world map");
            changes++;
        }

        // Ensure starting region state exists
        if (!GameEngine.state.regions[GameEngine.state.currentRegion]) {
            GameEngine.state.regions[GameEngine.state.currentRegion] = {
                discovered: true,
                discoveryProgress: 0,
                discoveredLocations: [],
                discoveredNodeTypes: [],
                nodeHealthBonuses: {},
                discoveredExitPaths: [],
                discoveredCraftingStations: []
            };
            console.log(`  ✅ Created region state for ${GameEngine.state.currentRegion}`);
            changes++;
        }

        // Ensure ALL regions have discoveredNodeTypes and discoveredCraftingStations arrays
        if (GameEngine.state.regions) {
            for (let regionId in GameEngine.state.regions) {
                const region = GameEngine.state.regions[regionId];

                if (!region.discoveredNodeTypes) {
                    region.discoveredNodeTypes = [];
                    changes++;
                }

                if (!region.discoveredCraftingStations) {
                    region.discoveredCraftingStations = [];
                    changes++;
                }

                if (!region.discoveredExitPaths) {
                    region.discoveredExitPaths = [];
                    changes++;
                }

                if (!region.nodeHealthBonuses) {
                    region.nodeHealthBonuses = {};
                    changes++;
                }
            }

            if (changes > 0) {
                console.log(`  ✅ Added missing arrays to ${Object.keys(GameEngine.state.regions).length} regions`);
            }
        }

        return changes;
    },

    /**
     * Add current activity tracking if missing
     */
    migrateCurrentActivity() {
        let changes = 0;

        if (!GameEngine.state.hasOwnProperty('currentActivity')) {
            GameEngine.state.currentActivity = null;
            console.log("  ✅ Added currentActivity tracking");
            changes++;
        }

        return changes;
    },

    /**
     * Migrate to new node harvesting system
     */
    migrateNodeHarvestingSystem() {
        let changes = 0;

        // Remove lastCollectionTick from nodeCollection (no longer used)
        if (GameEngine.state.nodeCollection && GameEngine.state.nodeCollection.hasOwnProperty('lastCollectionTick')) {
            delete GameEngine.state.nodeCollection.lastCollectionTick;
            console.log("  ✅ Removed lastCollectionTick from nodeCollection");
            changes++;
        }

        // Clear any active node (incompatible with new structure)
        if (GameEngine.state.nodeCollection && GameEngine.state.nodeCollection.activeNode) {
            GameEngine.state.nodeCollection.activeNode = null;
            console.log("  ✅ Cleared active node (new harvesting system)");
            changes++;
        }

        // Migrate all regions to new availableNodes structure
        for (let regionId in GameEngine.state.regions) {
            const regionState = GameEngine.state.regions[regionId];

            // Remove old nodeHealthBonuses (no longer used)
            if (regionState.nodeHealthBonuses) {
                delete regionState.nodeHealthBonuses;
                changes++;
            }

            // Initialize availableNodes if missing
            if (!regionState.availableNodes) {
                regionState.availableNodes = {};
                console.log(`  ✅ Added availableNodes to region ${regionId}`);
                changes++;
            }
        }

        return changes;
    },

    /**
     * Migration: Remove legacy tab and move items to proper tabs
     */
    removeLegacyTab() {
        let changes = 0;

        // Remove legacy tab if it exists
        if (GameEngine.state.bank.tabs.legacy) {
            delete GameEngine.state.bank.tabs.legacy;
            console.log("  ✅ Removed legacy bank tab");
            changes++;
        }

        // Migrate any items that are in legacy tab to their proper tabs
        for (let itemId in GameEngine.state.bank.items) {
            const bankItem = GameEngine.state.bank.items[itemId];

            if (bankItem.tab === 'legacy') {
                const itemDef = GameEngine.definitions.items[itemId];

                if (itemDef) {
                    // Use the tab migration logic
                    const tabMigration = {
                        'resources': 'resource',
                        'equipment': 'tool',
                        'consumables': 'consumable',
                        'tools': 'tool',
                        'weapons': 'weapon',
                        'armor': 'armor',
                        'accessories': 'technology'
                    };

                    let newTab = 'resource'; // default fallback

                    if (itemDef.defaultTab) {
                        newTab = tabMigration[itemDef.defaultTab] || itemDef.defaultTab;
                    }

                    // Make sure the new tab exists
                    if (GameEngine.state.bank.tabs[newTab]) {
                        bankItem.tab = newTab;
                        console.log(`  ✅ Moved ${itemId} from legacy to ${newTab}`);
                        changes++;
                    }
                }
            }
        }

        return changes;
    },

    /**
     * Migration: Fix mission objective targets for tutorial missions
     */
    fixTutorialMissionTargets() {
        let changes = 0;

        // Fix active mission progress for tutorial_gather_resources
        if (GameEngine.state.missions.activeProgress['tutorial_gather_resources']) {
            const progress = GameEngine.state.missions.activeProgress['tutorial_gather_resources'];

            // Fix copper_ore -> copperOre
            if (progress.objectives['collect_ore'] && progress.objectives['collect_ore'].target === 'copper_ore') {
                progress.objectives['collect_ore'].target = 'copperOre';
                console.log("  ✅ Fixed collect_ore target: copper_ore -> copperOre");
                changes++;
            }

            // Fix oak_wood -> wood
            if (progress.objectives['collect_wood'] && progress.objectives['collect_wood'].target === 'oak_wood') {
                progress.objectives['collect_wood'].target = 'wood';
                console.log("  ✅ Fixed collect_wood target: oak_wood -> wood");
                changes++;
            }
        }

        return changes;
    },

    /**
     * Migration: Add engineering tech tree system
     */
    migrateEngineeringSystem() {
        let changes = 0;

        // Migrate from old engineeringTech to new engineering system
        if (GameEngine.state.engineeringTech && !GameEngine.state.engineering) {
            GameEngine.state.engineering = {
                tokens: 0,  // Start fresh with new system
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
            delete GameEngine.state.engineeringTech;
            console.log("  ✅ Migrated engineeringTech → engineering (workshop system)");
            changes++;
        }

        // Add new engineering system if missing
        if (!GameEngine.state.engineering) {
            GameEngine.state.engineering = {
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
            console.log("  ✅ Added engineering workshop system");
            changes++;
        }

        // Initialize Engineering System functions
        if (typeof EngineeringSystem !== 'undefined' && !GameEngine.upgradeWorkshop) {
            EngineeringSystem.init(GameEngine);
            console.log("  ✅ Initialized Engineering System functions");
            changes++;
        }

        // Add equipment instances to bank if missing
        if (!GameEngine.state.bank.equipmentInstances) {
            GameEngine.state.bank.equipmentInstances = {};
            console.log("  ✅ Added equipment instance tracking");
            changes++;
        }

        return changes;
    },

    /**
     * Migration: Make all discovered paths bidirectional
     * Fixes old saves where paths were one-way only
     */
    migrateBidirectionalPaths() {
        let changes = 0;

        // For each region with discovered exit paths
        for (let regionId in GameEngine.state.regions) {
            const regionState = GameEngine.state.regions[regionId];

            if (!regionState.discoveredExitPaths || regionState.discoveredExitPaths.length === 0) {
                continue;
            }

            // For each discovered exit path from this region
            for (let targetRegionId of regionState.discoveredExitPaths) {
                // Ensure the target region exists
                if (!GameEngine.state.regions[targetRegionId]) {
                    GameEngine.state.regions[targetRegionId] = {
                        discovered: false,
                        discoveryProgress: 0,
                        discoveredLocations: [],
                        discoveredNodeTypes: [],
                        discoveredExitPaths: [],
                        discoveredCraftingStations: [],
                        availableNodes: {}
                    };
                }

                const targetState = GameEngine.state.regions[targetRegionId];

                // Ensure target region has path back to source region
                if (!targetState.discoveredExitPaths.includes(regionId)) {
                    targetState.discoveredExitPaths.push(regionId);
                    console.log(`  ✅ Added bidirectional path: ${targetRegionId} → ${regionId}`);
                    changes++;
                }
            }
        }

        if (changes > 0) {
            console.log(`  ✅ Made ${changes} paths bidirectional`);
        }

        return changes;
    },

    /**
     * Migrate combat system to include playerAmmo tracking for gun-type weapons
     */
    migratePlayerAmmo() {
        let changes = 0;

        // Ensure combat.playerAmmo exists
        if (!GameEngine.state.combat.playerAmmo) {
            GameEngine.state.combat.playerAmmo = {
                currentAmmo: 0,
                magazineSize: 0,
                isReloading: false,
                reloadStartTime: 0,
                reloadDuration: 0
            };
            changes++;
            console.log("  ✅ Added playerAmmo tracking to combat state");
        }

        // Ensure activeEffects exists
        if (!GameEngine.state.combat.activeEffects) {
            GameEngine.state.combat.activeEffects = [];
            changes++;
            console.log("  ✅ Added activeEffects tracking to combat state");
        }

        return changes;
    },

    /**
     * Migrate combat system to include stance system
     */
    migrateStanceSystem() {
        let changes = 0;

        // Ensure stance properties exist
        if (GameEngine.state.combat.currentStance === undefined) {
            GameEngine.state.combat.currentStance = "offensive";
            changes++;
            console.log("  ✅ Added currentStance to combat state");
        }

        if (GameEngine.state.combat.lastStanceChange === undefined) {
            GameEngine.state.combat.lastStanceChange = 0;
            changes++;
            console.log("  ✅ Added lastStanceChange to combat state");
        }

        if (GameEngine.state.combat.stanceChangeCooldown === undefined) {
            GameEngine.state.combat.stanceChangeCooldown = 2000;
            changes++;
            console.log("  ✅ Added stanceChangeCooldown to combat state");
        }

        return changes;
    },

    /**
     * Migrate equipment system to include new slots (consumables + technology)
     */
    migrateEquipmentSlots() {
        let changes = 0;

        // Ensure new consumable slots exist
        if (GameEngine.state.equipment.ammo === undefined) {
            GameEngine.state.equipment.ammo = null;
            changes++;
        }

        if (GameEngine.state.equipment.potion === undefined) {
            GameEngine.state.equipment.potion = null;
            changes++;
        }

        // Ensure technology slots exist
        const techSlots = ['tech1', 'tech2', 'tech3', 'tech4'];
        for (let slot of techSlots) {
            if (GameEngine.state.equipment[slot] === undefined) {
                GameEngine.state.equipment[slot] = null;
                changes++;
            }
        }

        if (changes > 0) {
            console.log(`  ✅ Added ${changes} new equipment slots (consumables + technology)`);
        }

        return changes;
    },

    /**
     * Clear any equipped items that no longer exist in definitions
     * (e.g., after skill renames or item removals)
     */
    migrateInvalidEquipment() {
        let changes = 0;

        // Check all equipment slots
        for (let slot in GameEngine.state.equipment) {
            const equippedItemId = GameEngine.state.equipment[slot];
            if (equippedItemId && !GameEngine.definitions.items[equippedItemId]) {
                console.log(`  ⚠️ Removing invalid equipped item: ${equippedItemId} from ${slot}`);
                GameEngine.state.equipment[slot] = null;
                changes++;
            }
        }

        if (changes > 0) {
            console.log(`  ✅ Cleared ${changes} invalid equipped item(s)`);
        }

        return changes;
    },

    /**
     * Migrate coordinate system from old (region_-10_0) to new (region_0_0)
     */
    migrateCoordinateSystem() {
        let changes = 0;

        // Update current region if it's the old starting region
        if (GameEngine.state.currentRegion === "region_-10_0") {
            GameEngine.state.currentRegion = "region_0_0";
            console.log("  ✅ Updated currentRegion to new coordinate system");
            changes++;
        }

        // Migrate region data from old key to new key
        if (GameEngine.state.regions["region_-10_0"] && !GameEngine.state.regions["region_0_0"]) {
            GameEngine.state.regions["region_0_0"] = GameEngine.state.regions["region_-10_0"];
            delete GameEngine.state.regions["region_-10_0"];
            console.log("  ✅ Migrated region_-10_0 → region_0_0");
            changes++;
        }

        return changes;
    },

    /**
     * Migrate to global discovery system
     * Converts region-locked node/enemy discoveries to global discovery system
     */
    migrateGlobalDiscovery() {
        let changes = 0;

        // Initialize global discovery state if not exists
        if (!GameEngine.state.globalNodes) {
            GameEngine.state.globalNodes = {};
            changes++;
        }

        if (!GameEngine.state.globalEnemies) {
            GameEngine.state.globalEnemies = {};
            changes++;
        }

        // Migrate old region-based node discoveries to global system
        for (let regionId in GameEngine.state.regions) {
            const regionState = GameEngine.state.regions[regionId];

            // Migrate discovered node types (old system)
            if (regionState.discoveredNodeTypes && Array.isArray(regionState.discoveredNodeTypes)) {
                for (let nodeId of regionState.discoveredNodeTypes) {
                    // Use the global discovery function if available
                    if (GameEngine.discoverNodeGlobally) {
                        const result = GameEngine.discoverNodeGlobally(nodeId, regionId);
                        if (result && result.newDiscovery) {
                            changes++;
                        }
                    } else {
                        // Fallback: manually add to global state
                        if (!GameEngine.state.globalNodes[nodeId]) {
                            GameEngine.state.globalNodes[nodeId] = {
                                discovered: true,
                                regionContributions: {},
                                totalHealthBonus: 0,
                                firstDiscoveredAt: Date.now(),
                                firstDiscoveredIn: regionId
                            };
                        }

                        if (!GameEngine.state.globalNodes[nodeId].regionContributions[regionId]) {
                            GameEngine.state.globalNodes[nodeId].regionContributions[regionId] = 10;
                            GameEngine.state.globalNodes[nodeId].totalHealthBonus += 10;
                            changes++;
                        }
                    }
                }
            }

            // Clean up old region state (no longer needed)
            if (regionState.discoveredNodeTypes) {
                delete regionState.discoveredNodeTypes;
            }
            if (regionState.nodeHealthBonuses) {
                delete regionState.nodeHealthBonuses;
            }
            if (regionState.discoveredCraftingStations) {
                delete regionState.discoveredCraftingStations;
            }
        }

        // Initialize rest consumption timer
        if (!GameEngine.state.activeNavigation.lastRestConsumption) {
            GameEngine.state.activeNavigation.lastRestConsumption = Date.now();
        }

        if (changes > 0) {
            console.log(`  ✅ Migrated ${changes} node discoveries to global system`);
        }

        return changes;
    },

    /**
     * Migrate navigation requirements to new scaling system
     * Updates all regions to use upward-then-right scaling
     */
    migrateNavigationRequirements() {
        let changes = 0;

        // Check if worldMap exists
        if (!GameEngine.definitions.worldMap) {
            return 0;
        }

        const startQ = -3;
        const startR = -4;

        // Update navigation requirements for all regions
        for (let regionId in GameEngine.definitions.worldMap) {
            const region = GameEngine.definitions.worldMap[regionId];

            if (!region.hexCoords) continue;

            const { q, r } = region.hexCoords;

            // Calculate new navigation requirement
            let newNavRequirement = 1;
            if (q !== startQ || r !== startR) {
                const stepsUp = Math.max(0, startR - r);
                const stepsRight = Math.max(0, q - startQ);
                const stepsDown = Math.max(0, r - startR);
                const stepsLeft = Math.max(0, startQ - q);

                newNavRequirement = 1 + (stepsUp * 2) + stepsRight + Math.floor(stepsDown / 2) + Math.floor(stepsLeft / 2);
            }

            // Update if different
            if (region.navigationRequirement !== newNavRequirement) {
                region.navigationRequirement = newNavRequirement;
                changes++;
            }
        }

        if (changes > 0) {
            console.log(`  ✅ Updated ${changes} region navigation requirements to new scaling system`);
        }

        return changes;
    }
};
