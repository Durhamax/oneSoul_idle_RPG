/**
 * NODE COLLECTION SYSTEM (REDESIGNED)
 *
 * New harvesting mechanics:
 * - Nodes are harvesting areas with multiple harvests before depletion
 * - Each harvest gives immediate rewards (no health pool to deplete)
 * - Two-roll loot system: guaranteed normal loot + chance for rare drops
 * - Respawn timer when depleted (tier-based)
 * - Region-specific node tracking (harvests remaining, depletion time)
 */

const NodeCollectionSystem = {
    /**
     * Initialize node collection system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all node collection functions to engine
        engine.startNodeHarvesting = this.startNodeHarvesting.bind(engine);
        engine.processNodeHarvesting = this.processNodeHarvesting.bind(engine);
        engine.completeNodeHarvest = this.completeNodeHarvest.bind(engine);
        engine.stopNodeHarvesting = this.stopNodeHarvesting.bind(engine);
        engine.selectSkillForNodes = this.selectSkillForNodes.bind(engine);
        engine.getAvailableNodesForSkill = this.getAvailableNodesForSkill.bind(engine);
        engine.getToolDamage = this.getToolDamage.bind(engine);
        engine.rollNormalLoot = this.rollNormalLoot.bind(engine);
        engine.rollRareLoot = this.rollRareLoot.bind(engine);
        engine.getNodeStateInRegion = this.getNodeStateInRegion.bind(engine);
        engine.updateNodeRespawns = this.updateNodeRespawns.bind(engine);
        engine.resetAllNodesInRegion = this.resetAllNodesInRegion.bind(engine);
        engine.forceRespawnNode = this.forceRespawnNode.bind(engine);
    },

    /**
     * Force respawn a specific node (for testing/debugging)
     */
    forceRespawnNode(nodeId) {
        const regionId = this.state.currentRegion;
        const regionNodes = this.state.regions[regionId]?.availableNodes;

        if (!regionNodes || !regionNodes[nodeId]) {
            console.warn(`Node ${nodeId} not found in region`);
            return;
        }

        const nodeDef = this.definitions.resourceNodes[nodeId];
        if (!nodeDef) return;

        const nodeState = regionNodes[nodeId];
        nodeState.harvestsRemaining = nodeDef.harvestsPerDepletion;
        nodeState.maxHarvests = nodeDef.harvestsPerDepletion;
        nodeState.depletedAt = null;

        console.log(`✅ Forced respawn of ${nodeDef.name} (${nodeState.harvestsRemaining} harvests available)`);
    },

    /**
     * Reset all nodes in current region (for testing/debugging)
     */
    resetAllNodesInRegion() {
        const regionId = this.state.currentRegion;
        const regionNodes = this.state.regions[regionId]?.availableNodes;

        if (!regionNodes) {
            console.warn('No nodes in current region');
            return;
        }

        let count = 0;
        for (let nodeId in regionNodes) {
            const nodeDef = this.definitions.resourceNodes[nodeId];
            if (!nodeDef) continue;

            const nodeState = regionNodes[nodeId];
            nodeState.harvestsRemaining = nodeDef.harvestsPerDepletion;
            nodeState.maxHarvests = nodeDef.harvestsPerDepletion;
            nodeState.depletedAt = null;
            count++;
        }

        console.log(`✅ Reset ${count} nodes in ${regionId}`);
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
     * Get or initialize node state in current region
     */
    getNodeStateInRegion(nodeId) {
        const regionId = this.state.currentRegion;
        const nodeDef = this.definitions.resourceNodes[nodeId];

        if (!nodeDef) return null;

        // Initialize region node tracking if doesn't exist
        if (!this.state.regions[regionId].availableNodes) {
            this.state.regions[regionId].availableNodes = {};
        }

        const regionNodes = this.state.regions[regionId].availableNodes;

        // Initialize this node if doesn't exist
        if (!regionNodes[nodeId]) {
            regionNodes[nodeId] = {
                discovered: false,
                harvestsRemaining: nodeDef.harvestsPerDepletion,
                maxHarvests: nodeDef.harvestsPerDepletion,
                depletedAt: null,
                respawnTime: nodeDef.respawnTime
            };
        }

        return regionNodes[nodeId];
    },

    /**
     * Update node respawns (check if any depleted nodes should respawn)
     */
    updateNodeRespawns() {
        const regionId = this.state.currentRegion;
        const regionNodes = this.state.regions[regionId]?.availableNodes;

        if (!regionNodes) return;

        const now = Date.now();

        for (let nodeId in regionNodes) {
            const nodeState = regionNodes[nodeId];

            // Check if node is depleted and ready to respawn
            if (nodeState.depletedAt && nodeState.harvestsRemaining === 0) {
                const respawnReady = now >= (nodeState.depletedAt + nodeState.respawnTime);

                if (respawnReady) {
                    const nodeDef = this.definitions.resourceNodes[nodeId];
                    nodeState.harvestsRemaining = nodeDef.harvestsPerDepletion;
                    nodeState.maxHarvests = nodeDef.harvestsPerDepletion;
                    nodeState.depletedAt = null;
                    console.log(`♻️ ${nodeDef.name} has respawned!`);
                }
            }
        }
    },

    /**
     * Start harvesting from a resource node
     */
    startNodeHarvesting(nodeId) {
        const nodeDef = this.definitions.resourceNodes[nodeId];

        if (!nodeDef) {
            return { success: false, reason: "Node not found" };
        }

        // Check skill level requirement
        const playerSkillLevel = this.state.skills[nodeDef.skill].level;
        if (playerSkillLevel < nodeDef.skillLevel) {
            return { success: false, reason: `Requires ${nodeDef.skill} level ${nodeDef.skillLevel}` };
        }

        // Get node state in this region
        const nodeState = this.getNodeStateInRegion(nodeId);

        if (!nodeState) {
            return { success: false, reason: "Node state error" };
        }

        // Check if node is depleted
        if (nodeState.harvestsRemaining <= 0) {
            const timeUntilRespawn = Math.ceil((nodeState.depletedAt + nodeState.respawnTime - Date.now()) / 1000);
            return { success: false, reason: `Depleted. Respawns in ${timeUntilRespawn}s` };
        }

        // Stop other activities
        if (this.state.currentActivity === 'navigation') {
            this.stopNavigation();
        }
        if (this.state.currentActivity === 'combat') {
            this.endCombat();
        }
        if (this.state.currentActivity === 'crafting') {
            // Crafting can continue in background
        }
        if (this.state.currentActivity === 'nodeCollection' && this.state.nodeCollection.activeNode) {
            console.log("⏹️ Stopping current harvesting to switch nodes");
            this.stopNodeHarvesting();
        }

        // Set node collection as current activity
        this.state.currentActivity = 'nodeCollection';

        // Start harvesting
        this.state.nodeCollection.activeNode = {
            nodeId: nodeId,
            startTime: Date.now(),
            harvestTime: nodeDef.harvestTime
        };

        console.log(`⛏️ Started harvesting ${nodeDef.name} (${nodeState.harvestsRemaining}/${nodeState.maxHarvests} remaining)`);
        return { success: true };
    },

    /**
     * Process node harvesting each tick
     */
    processNodeHarvesting(deltaTime) {
        const activeNode = this.state.nodeCollection.activeNode;
        if (!activeNode) return;

        const nodeDef = this.definitions.resourceNodes[activeNode.nodeId];
        if (!nodeDef) {
            this.stopNodeHarvesting();
            return;
        }

        const now = Date.now();

        // Check if we're waiting for node to respawn
        if (activeNode.waitingForRespawn) {
            const nodeState = this.getNodeStateInRegion(activeNode.nodeId);

            // Check if node has respawned
            if (nodeState && nodeState.harvestsRemaining > 0) {
                console.log(`♻️ ${nodeDef.name} has respawned! Resuming harvesting...`);

                // Restart harvesting
                activeNode.waitingForRespawn = false;
                activeNode.startTime = Date.now();
                activeNode.harvestTime = nodeDef.harvestTime;
            }
            return;
        }

        // Check if harvest time has elapsed
        const elapsed = now - activeNode.startTime;

        if (elapsed >= activeNode.harvestTime) {
            this.completeNodeHarvest();
        }
    },

    /**
     * Roll loot from normal loot table (weight-based)
     */
    rollNormalLoot(normalLootTable) {
        if (!normalLootTable || normalLootTable.length === 0) return null;

        // Calculate total weight
        const totalWeight = normalLootTable.reduce((sum, entry) => sum + entry.weight, 0);

        // Roll random number
        const roll = Math.random() * totalWeight;

        // Find which entry was rolled
        let currentWeight = 0;
        for (let entry of normalLootTable) {
            currentWeight += entry.weight;
            if (roll <= currentWeight) {
                // Rolled this item - determine quantity
                const amount = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
                return {
                    itemId: entry.itemId,
                    amount: amount
                };
            }
        }

        // Fallback (shouldn't happen)
        return null;
    },

    /**
     * Roll loot from rare loot table (chance-based)
     */
    rollRareLoot(rareLootTable) {
        const rareDrops = [];

        if (!rareLootTable || rareLootTable.length === 0) return rareDrops;

        for (let entry of rareLootTable) {
            const roll = Math.random();
            if (roll <= entry.chance) {
                // Success! Rare drop obtained
                const amount = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
                rareDrops.push({
                    itemId: entry.itemId,
                    amount: amount
                });
            }
        }

        return rareDrops;
    },

    /**
     * Complete node harvest and give rewards
     */
    completeNodeHarvest() {
        const activeNode = this.state.nodeCollection.activeNode;
        if (!activeNode) return;

        const nodeDef = this.definitions.resourceNodes[activeNode.nodeId];
        if (!nodeDef) {
            this.stopNodeHarvesting();
            return;
        }

        // Get node state
        const nodeState = this.getNodeStateInRegion(activeNode.nodeId);
        if (!nodeState || nodeState.harvestsRemaining <= 0) {
            this.stopNodeHarvesting();
            return;
        }

        // === CALCULATE HARVEST VS NODE STATS ===
        const harvestCalc = StatCalculator.calculateHarvestVsNode(nodeDef.skill, activeNode.nodeId);
        const effective = harvestCalc.effective;

        // === CHECK SUCCESS (vs node evasion) ===
        const successRoll = Math.random() * 100;
        if (successRoll > effective.chance) {
            // Harvest failed due to node evasion!
            console.log(`❌ MISS! ${nodeDef.name} evaded your harvest attempt (${successRoll.toFixed(1)}% > ${effective.chance.toFixed(1)}%)`);

            // Still start next harvest (no penalty except time)
            activeNode.startTime = Date.now();
            activeNode.harvestTime = effective.speed; // Use effective speed
            return;
        }

        // === CHECK FOR CRITICAL HARVEST ===
        const critRoll = Math.random() * 100;
        const isCritical = critRoll < effective.critChance;
        let critMultiplier = 1;

        if (isCritical) {
            critMultiplier = effective.critMultiplier;
            console.log(`💥 CRITICAL HARVEST! (${critMultiplier.toFixed(1)}x multiplier)`);
        }

        // === CHECK FOR RARE DROP ===
        const rareRoll = Math.random() * 100;
        const isRare = rareRoll < effective.rareChance;
        let useRareLoot = isRare;

        if (isRare) {
            console.log(`✨ RARE DROP! (${effective.rareMultiplier.toFixed(1)}x multiplier)`);
        }

        // === ROLL LOOT ===
        let rewardsGained = [];

        // Use rare loot table if rare triggered, otherwise normal
        const lootTable = (useRareLoot && nodeDef.rareLoot?.length > 0) ? nodeDef.rareLoot : nodeDef.normalLoot;
        const lootResult = useRareLoot ? this.rollRareLoot(lootTable) : [this.rollNormalLoot(lootTable)];

        // Apply multipliers to loot
        for (let loot of lootResult) {
            if (!loot) continue;

            let finalAmount = loot.amount;

            // Apply critical multiplier
            if (isCritical) {
                finalAmount = Math.floor(finalAmount * critMultiplier);
            }

            // Apply rare multiplier if rare drop
            if (isRare) {
                finalAmount = Math.floor(finalAmount * effective.rareMultiplier);
            }

            this.addItemToBank(loot.itemId, finalAmount);
            const itemName = this.definitions.items[loot.itemId]?.name || loot.itemId;

            let label = `${finalAmount}x ${itemName}`;
            if (isCritical) label += ' 💥';
            if (isRare) label += ' ✨';

            rewardsGained.push(label);
        }

        // === Award XP ===
        let xpGained = nodeDef.expPerHarvest;
        if (isCritical) {
            xpGained = Math.floor(xpGained * 1.5); // Bonus XP on crit
        }
        this.gainSkillExp(nodeDef.skill, xpGained);

        // Trigger mission objective check for skill actions
        if (this.checkMissionObjectives) {
            this.checkMissionObjectives('skill_action', {
                skillId: nodeDef.skill
            });
        }

        // === Decrement harvests remaining ===
        nodeState.harvestsRemaining--;

        console.log(`✅ Harvested from ${nodeDef.name}: ${rewardsGained.join(', ')} +${xpGained} ${nodeDef.skill} XP (${nodeState.harvestsRemaining}/${nodeState.maxHarvests} remaining)`);

        // === Check if node is now depleted ===
        if (nodeState.harvestsRemaining <= 0) {
            nodeState.depletedAt = Date.now();
            const respawnSeconds = Math.ceil(nodeState.respawnTime / 1000);
            console.log(`⏳ ${nodeDef.name} depleted! Waiting for respawn (${respawnSeconds}s)...`);

            // Don't stop harvesting - instead mark as waiting for respawn
            activeNode.waitingForRespawn = true;
            activeNode.respawnStartTime = Date.now();
            return;
        }

        // === Start next harvest ===
        activeNode.startTime = Date.now();
        activeNode.harvestTime = effective.speed; // Use effective speed with resistance
        activeNode.waitingForRespawn = false;
    },

    /**
     * Stop node harvesting
     */
    stopNodeHarvesting() {
        if (this.state.currentActivity === 'nodeCollection') {
            this.state.currentActivity = null;
        }
        this.state.nodeCollection.activeNode = null;
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

                // Get node state
                const nodeState = this.getNodeStateInRegion(nodeId);

                nodes.push({
                    nodeId: nodeId,
                    definition: nodeDef,
                    state: nodeState,
                    canCollect: canCollect,
                    locked: !canCollect
                });
            }
        }

        return nodes;
    }
};
