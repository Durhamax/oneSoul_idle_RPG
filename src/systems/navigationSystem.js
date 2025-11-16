/**
 * NAVIGATION SYSTEM
 *
 * Manages region navigation, exploration, discovery, and travel between regions.
 * Handles discovery of resource nodes, crafting stations, and exit paths.
 */

const NavigationSystem = {
    /**
     * Initialize navigation system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all navigation functions to engine
        engine.startNavigation = this.startNavigation.bind(engine);
        engine.stopNavigation = this.stopNavigation.bind(engine);
        engine.processNavigation = this.processNavigation.bind(engine);
        engine.getNavigationStats = this.getNavigationStats.bind(engine);
        engine.makeDiscovery = this.makeDiscovery.bind(engine);
        engine.discoverResourceNode = this.discoverResourceNode.bind(engine);
        engine.discoverEnemyInRegion = this.discoverEnemyInRegion.bind(engine);
        engine.tryDiscoverExitPath = this.tryDiscoverExitPath.bind(engine);
        engine.canTravelToRegion = this.canTravelToRegion.bind(engine);
        engine.travelToRegion = this.travelToRegion.bind(engine);
        engine.changeRegion = this.changeRegion.bind(engine);
        engine.exploreRegion = this.exploreRegion.bind(engine);
        engine.checkForDiscoveries = this.checkForDiscoveries.bind(engine);
        engine.checkRegionUnlocks = this.checkRegionUnlocks.bind(engine);
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

        // Update background based on biome and region
        const hexDef = this.definitions.worldMap?.[regionId];
        if (hexDef && typeof BackgroundSystem !== 'undefined') {
            BackgroundSystem.updateBackgroundFromRegion(hexDef.biome, hexDef.name, regionId);
        }

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

    /**
     * Get player's navigation stats for discovery
     * Uses attribute-based system:
     * - Health: Max endurance, depletion/recovery rates
     * - Perception: Discovery success chance vs region complication
     * - Mobility: Discovery interval speed
     */
    getNavigationStats() {
        const navSkill = this.state.skills.navigation;
        const attributes = this.state.combatAttributes;
        const currentRegionId = this.state.currentRegion;
        const regionDef = this.definitions.worldMap[currentRegionId];
        const balance = this.gameBalance;

        // Safety checks for attributes (default to 1 if undefined)
        const health = attributes.health || 1;
        const perception = attributes.perception || 1;
        const mobility = attributes.mobility || 1;

        // ===== MAX ENDURANCE (Health only) =====
        // Formula: baseEndurance + (health * healthMult)
        const maxEndurance = (balance.baseEndurance || 50) + (health * (balance.enduranceHealthMult || 10));

        // ===== DISCOVERY CHANCE (Perception vs Region Complication) =====
        // Formula: baseChance + (perception * bonus) - (complication * penalty)
        const regionComplication = regionDef?.complication || 1.0;
        const perceptionBonus = perception * (balance.perceptionDiscoveryBonus || 2.5);
        const complicationPenalty = (regionComplication - 1.0) * 10; // 10% per complexity point
        const discoveryChance = Math.max(5, Math.min(95,
            (balance.baseDiscoveryChance || 30) + perceptionBonus - complicationPenalty
        ));

        // ===== DISCOVERY INTERVAL (Mobility-based speed) =====
        // Formula: baseInterval - (mobility * reduction), capped at minimum
        const baseInterval = balance.navigationInterval || 3000;
        const mobilityReduction = mobility * (balance.mobilityIntervalReduction || 50);
        const discoveryInterval = Math.max(
            balance.minDiscoveryInterval || 1000,
            baseInterval - mobilityReduction
        );

        // ===== ENDURANCE DRAIN (Base rate, refined by health in processNavigation) =====
        const enduranceDrain = balance.enduranceDrainPerAttempt || 5;

        return {
            maxEndurance: Math.floor(maxEndurance),
            discoveryChance: discoveryChance,
            discoveryInterval: discoveryInterval,
            enduranceDrain: enduranceDrain,
            navLevel: navSkill.level,
            regionComplication: regionComplication,
            // Include raw attributes for reference
            health: health,
            perception: perception,
            mobility: mobility
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
            this.stopNodeHarvesting();
        }
        // Crafting continues in background, doesn't block navigation

        // Calculate and set endurance based on character attributes
        const stats = this.getNavigationStats();
        this.state.activeNavigation.maxEndurance = stats.maxEndurance;
        this.state.activeNavigation.endurance = stats.maxEndurance;

        this.state.currentActivity = 'navigation';
        this.state.activeNavigation.isNavigating = true;
        this.state.activeNavigation.lastNavigationTick = Date.now();

        console.log(`🗺️ Started exploring region... (Endurance: ${stats.maxEndurance}, Discovery Chance: ${stats.discoveryChance.toFixed(1)}%)`);
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
     * Process navigation tick (called automatically when navigation is active)
     * Uses endurance-based system with intellect-based discovery chance
     * When endurance depletes, enters recovery mode instead of stopping
     */
    processNavigation(deltaTime) {
        if (!this.state.activeNavigation.isNavigating) {
            return;
        }

        const now = Date.now();
        const stats = this.getNavigationStats();
        const activeNav = this.state.activeNavigation;

        // Migration: Initialize endurance if it's undefined or NaN (old save data)
        if (typeof activeNav.endurance !== 'number' || isNaN(activeNav.endurance)) {
            activeNav.maxEndurance = stats.maxEndurance;
            activeNav.endurance = stats.maxEndurance;
            console.log(`🔄 Migrated to endurance system: ${stats.maxEndurance} endurance`);
        }

        // Migration: Initialize recovery state if undefined
        if (typeof activeNav.isRecovering !== 'boolean') {
            activeNav.isRecovering = false;
            activeNav.lastRecoveryTick = 0;
        }

        // RECOVERY MODE: Endurance recovery now handled by consuming food/logs in RestRecoverySystem
        // Just return early if in recovery mode - actual recovery happens via resource consumption
        if (activeNav.isRecovering) {
            return;
        }

        // EXPLORATION MODE: Make discovery attempts
        // Check if enough time has passed for next discovery attempt
        const timeSinceLastAttempt = now - activeNav.lastNavigationTick;
        if (timeSinceLastAttempt < stats.discoveryInterval) {
            return;
        }

        activeNav.lastNavigationTick = now;

        // Check if player has endurance remaining
        if (activeNav.endurance <= 0) {
            console.log("💤 Out of endurance! Entering recovery mode...");
            activeNav.isRecovering = true;
            activeNav.lastRecoveryTick = now;
            return;
        }

        // Drain endurance for the attempt (happens whether successful or not)
        // Depletion rate based on health
        // Formula: base 5 - (health * 0.3) = slower depletion with higher health, min 1.5
        const health = this.state.combatAttributes?.health || 1;
        const balance = this.gameBalance;
        const healthDepletionReduction = balance.healthDepletionReduction || 0.3;
        const minDepletionRate = balance.minDepletionRate || 1.5;
        const depletionRate = Math.max(minDepletionRate, stats.enduranceDrain - (health * healthDepletionReduction));

        activeNav.endurance -= depletionRate;
        if (activeNav.endurance < 0) {
            activeNav.endurance = 0;
        }

        // Roll for discovery success (based on intellect vs region complication)
        const discoveryRoll = Math.random() * 100;
        if (discoveryRoll > stats.discoveryChance) {
            console.log(`🔍 Exploring... (No discovery, ${Math.floor(activeNav.endurance)}/${activeNav.maxEndurance} endurance remaining)`);
            return;
        }

        // Success! Make a discovery
        console.log(`✨ Discovery made! (${Math.floor(activeNav.endurance)}/${activeNav.maxEndurance} endurance remaining)`);
        this.makeDiscovery();
    },

    /**
     * Make a discovery in the current region
     * Can discover: nodes, crafting stations, exit paths
     */
    makeDiscovery() {
        const currentRegionId = this.state.currentRegion;
        const regionState = this.state.regions[currentRegionId];
        const hexDef = this.definitions.worldMap[currentRegionId];

        if (!hexDef) {
            console.error(`❌ No hex definition found for region ${currentRegionId}`);
            return;
        }

        const biomeDef = this.definitions.biomes[hexDef.biome];

        if (!biomeDef) {
            console.error(`❌ No biome definition found for biome: ${hexDef.biome}`);
            return;
        }

        // Increase discovery progress
        const discoveryIncrease = 1 + (this.state.skills.navigation.level * 0.1);
        regionState.discoveryProgress = Math.min(100, regionState.discoveryProgress + discoveryIncrease);

        console.log(`✨ Discovery made! Region now ${regionState.discoveryProgress.toFixed(1)}% explored`);

        // Gain navigation exp
        this.gainSkillExp('navigation', 5);

        // Determine what was discovered (weighted random)
        const rand = Math.random();

        if (rand < 0.6) {
            // 60% chance: Discover a resource node (using new global system)
            this.discoverResourceNode(currentRegionId, biomeDef);
        } else if (rand < 0.85) {
            // 25% chance: Discover an enemy (using new global system)
            this.discoverEnemyInRegion(currentRegionId, biomeDef);
        } else {
            // 15% chance: Try to discover an exit path
            this.tryDiscoverExitPath(currentRegionId, hexDef, biomeDef);
        }
    },

    /**
     * Discover a random resource node type in the region (using global discovery system)
     */
    discoverResourceNode(regionId, biomeDef) {
        const hexDef = this.definitions.worldMap[regionId];

        // Use region-specific discoverable nodes if available
        const discoverableNodes = hexDef?.discoverableNodes || [];

        if (discoverableNodes.length === 0) {
            console.log("❌ No resource nodes available in this region");
            return;
        }

        // Filter to nodes the player can access (skill level requirement)
        const accessibleNodes = [];
        for (let nodeId of discoverableNodes) {
            const nodeDef = this.definitions.resourceNodes[nodeId];
            if (nodeDef) {
                const playerSkillLevel = this.state.skills[nodeDef.skill]?.level || 0;
                if (playerSkillLevel >= nodeDef.skillLevel) {
                    accessibleNodes.push(nodeId);
                }
            }
        }

        if (accessibleNodes.length === 0) {
            console.log("No resource nodes available in this region at your skill level");
            return;
        }

        // Pick a random accessible node
        const randomNode = accessibleNodes[Math.floor(Math.random() * accessibleNodes.length)];

        // Discover globally (adds +10 health per region)
        if (this.discoverNodeGlobally) {
            this.discoverNodeGlobally(randomNode, regionId);
        }
    },

    /**
     * Discover a random enemy in the region (using global discovery system)
     */
    discoverEnemyInRegion(regionId, biomeDef) {
        const hexDef = this.definitions.worldMap[regionId];

        // Use region-specific discoverable enemies if available
        const discoverableEnemies = hexDef?.discoverableEnemies || [];

        if (discoverableEnemies.length === 0) {
            console.log("No enemies available in this region");
            // Fallback to node discovery
            this.discoverResourceNode(regionId, biomeDef);
            return;
        }

        // Pick a random enemy from the region's pool
        const randomEnemy = discoverableEnemies[Math.floor(Math.random() * discoverableEnemies.length)];

        // Discover globally (adds +10 health per region)
        if (this.discoverEnemyGlobally) {
            this.discoverEnemyGlobally(randomEnemy, regionId);
        }
    },

    /**
     * Try to discover an exit path to an adjacent region
     */
    tryDiscoverExitPath(regionId, hexDef, biomeDef) {
        const regionState = this.state.regions[regionId];

        // Safety check for hexDef.adjacent
        if (!hexDef || !hexDef.adjacent) {
            console.log("❌ No adjacent regions found");
            this.discoverResourceNode(regionId, biomeDef);
            return;
        }

        // Convert adjacent object to array format for compatibility
        const adjacentExits = Object.entries(hexDef.adjacent).map(([direction, regionId]) => ({
            direction: direction,
            id: regionId
        }));

        // Get undiscovered adjacent regions
        const undiscoveredExits = adjacentExits.filter(adj =>
            !regionState.discoveredExitPaths.includes(adj.id)
        );

        if (undiscoveredExits.length === 0) {
            // All exits discovered, discover node instead
            this.discoverResourceNode(regionId, biomeDef);
            return;
        }

        // Safety check for biomeDef
        if (!biomeDef || typeof biomeDef.exitPathChance !== 'number') {
            // Default chance if not defined
            const exitRoll = Math.random();
            if (exitRoll < 0.3) { // 30% default chance
                const randomExit = undiscoveredExits[Math.floor(Math.random() * undiscoveredExits.length)];

                // Discover path bidirectionally
                this.discoverBidirectionalPath(regionId, randomExit.id);

                const adjacentHexDef = this.definitions.worldMap[randomExit.id];
                console.log(`🚪 Discovered exit path to ${randomExit.direction}: ${adjacentHexDef?.name || randomExit.id}!`);
            } else {
                this.discoverResourceNode(regionId, biomeDef);
            }
            return;
        }

        // Roll for exit path discovery
        const exitRoll = Math.random();
        if (exitRoll < biomeDef.exitPathChance) {
            // Pick a random undiscovered exit
            const randomExit = undiscoveredExits[Math.floor(Math.random() * undiscoveredExits.length)];

            // Discover path bidirectionally
            this.discoverBidirectionalPath(regionId, randomExit.id);

            const adjacentHexDef = this.definitions.worldMap[randomExit.id];
            console.log(`🚪 Discovered exit path to ${randomExit.direction}: ${adjacentHexDef?.name || randomExit.id}!`);
        } else {
            // Failed to find exit, discover node instead
            this.discoverResourceNode(regionId, biomeDef);
        }
    },

    /**
     * Discover a path bidirectionally between two regions
     * This ensures you can travel both ways once a path is discovered
     * @param {string} regionA - First region ID
     * @param {string} regionB - Second region ID
     */
    discoverBidirectionalPath(regionA, regionB) {
        // Ensure both regions exist in state
        if (!this.state.regions[regionA]) {
            this.state.regions[regionA] = {
                discovered: false,
                discoveryProgress: 0,
                discoveredLocations: [],
                discoveredExitPaths: [],
                availableNodes: {}
            };
        }
        if (!this.state.regions[regionB]) {
            this.state.regions[regionB] = {
                discovered: false,
                discoveryProgress: 0,
                discoveredLocations: [],
                discoveredExitPaths: [],
                availableNodes: {}
            };
        }

        // Add bidirectional paths
        const stateA = this.state.regions[regionA];
        const stateB = this.state.regions[regionB];

        // Add path from A to B
        if (!stateA.discoveredExitPaths.includes(regionB)) {
            stateA.discoveredExitPaths.push(regionB);
        }

        // Add path from B to A (reverse direction)
        if (!stateB.discoveredExitPaths.includes(regionA)) {
            stateB.discoveredExitPaths.push(regionA);
        }
    },

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

    /**
     * Travel to an adjacent region
     */
    travelToRegion(targetRegionId) {
        const currentRegionId = this.state.currentRegion;
        const currentRegionState = this.state.regions[currentRegionId];
        const currentRegionDef = this.definitions.worldMap[currentRegionId];

        // Check if exit path is discovered
        if (!currentRegionState.discoveredExitPaths.includes(targetRegionId)) {
            return { success: false, reason: "Exit path not discovered" };
        }

        // Check if current region has a mission requirement to leave
        if (currentRegionDef && currentRegionDef.requiredMissionToLeave) {
            const missionId = currentRegionDef.requiredMissionToLeave;
            const missionDef = this.definitions.missions[missionId];

            // Check if mission is completed (missions are stored in completed array)
            const isCompleted = this.state.missions.completed && this.state.missions.completed.includes(missionId);

            if (!isCompleted) {
                const missionName = missionDef ? missionDef.name : missionId;
                return {
                    success: false,
                    reason: `Must complete mission "${missionName}" before leaving this region`,
                    blockedByMission: missionId
                };
            }
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
                discoveredExitPaths: [],
                availableNodes: {}
            };
        }

        // Reset navigation progress for new region
        this.state.activeNavigation.lastNavigationTick = 0;

        // Recalculate endurance for new region
        const stats = this.getNavigationStats();
        this.state.activeNavigation.maxEndurance = stats.maxEndurance;
        this.state.activeNavigation.endurance = stats.maxEndurance;

        // Travel
        this.state.currentRegion = targetRegionId;

        console.log(`🗺️ Traveled to ${targetHexDef.name}`);
        return { success: true, region: targetHexDef };
    }
};
