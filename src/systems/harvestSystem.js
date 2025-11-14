/**
 * HARVEST SYSTEM
 *
 * Handles node harvesting mechanics, loot rolling, and respawn timers
 */

const HarvestSystem = {
    init(engine) {
        engine.canHarvestNode = this.canHarvestNode.bind(engine);
        engine.startHarvest = this.startHarvest.bind(engine);
        engine.completeHarvest = this.completeHarvest.bind(engine);
        engine.cancelHarvest = this.cancelHarvest.bind(engine);
        engine.updateNodeRespawns = this.updateNodeRespawns.bind(engine);
        engine.getNodeState = this.getNodeState.bind(engine);
        engine.getAvailableNodesInRegion = this.getAvailableNodesInRegion.bind(engine);
    },

    /**
     * Check if player can harvest a node
     */
    canHarvestNode(nodeId) {
        const node = NodeRegistry.getAllActive()[nodeId];
        if (!node) {
            return { canHarvest: false, reason: "Node not found" };
        }

        const currentRegion = this.state.currentRegion;
        const regionData = this.state.regions[currentRegion];
        const nodeState = regionData?.availableNodes?.[nodeId];

        if (!nodeState || !nodeState.discovered) {
            return { canHarvest: false, reason: "Node not discovered" };
        }

        // Check if depleted
        if (nodeState.currentHealth <= 0) {
            const timeUntilRespawn = this.getTimeUntilRespawn(nodeId);
            return {
                canHarvest: false,
                reason: `Depleted. Respawns in ${Math.ceil(timeUntilRespawn)}s`
            };
        }

        // Check skill requirement
        const playerSkillLevel = this.state.skills[node.nodeType]?.level || 0;
        if (playerSkillLevel < node.requiredSkillLevel) {
            return {
                canHarvest: false,
                reason: `Requires ${node.nodeType} level ${node.requiredSkillLevel}`
            };
        }

        // Check character level requirement
        const charLevel = this.state.characterLevel.level;
        if (charLevel < node.requirements.characterLevel) {
            return {
                canHarvest: false,
                reason: `Requires character level ${node.requirements.characterLevel}`
            };
        }

        // Check tool requirement
        if (node.requirements.tools && node.requirements.tools.length > 0) {
            const hasTool = this.hasRequiredTool(node.requirements.tools, node.requirements.toolTier);
            if (!hasTool) {
                return {
                    canHarvest: false,
                    reason: `Requires ${node.requirements.tools[0]} (tier ${node.requirements.toolTier}+)`
                };
            }
        }

        // Check quest requirements
        if (node.requirements.quests && node.requirements.quests.length > 0) {
            const hasQuests = node.requirements.quests.every(questId =>
                this.state.completedQuests?.includes(questId)
            );
            if (!hasQuests) {
                return {
                    canHarvest: false,
                    reason: "Requires quest completion"
                };
            }
        }

        // Check if already harvesting
        if (this.state.currentActivity === 'nodeCollection' && this.state.nodeCollection?.activeNode) {
            return { canHarvest: false, reason: "Already harvesting" };
        }

        return { canHarvest: true };
    },

    /**
     * Start harvesting a node
     */
    startHarvest(nodeId) {
        const check = this.canHarvestNode(nodeId);
        if (!check.canHarvest) {
            console.log(check.reason);
            return false;
        }

        const node = NodeRegistry.getAllActive()[nodeId];
        const playerSkillLevel = this.state.skills[node.nodeType]?.level || 0;

        // Calculate harvest time with skill bonus
        const harvestTime = NodeUtils.calculateHarvestTime(node, playerSkillLevel);
        const harvestTimeMs = harvestTime * 1000;

        // Set activity state
        this.state.currentActivity = 'nodeCollection';
        this.state.nodeCollection = {
            activeNode: {
                nodeId: nodeId,
                startTime: Date.now(),
                completionTime: Date.now() + harvestTimeMs,
                harvestTime: harvestTimeMs
            }
        };

        console.log(`Started harvesting ${node.name} (${harvestTime.toFixed(1)}s)`);
        return true;
    },

    /**
     * Complete a harvest and grant rewards
     */
    completeHarvest() {
        const activeNode = this.state.nodeCollection?.activeNode;
        if (!activeNode) {
            console.warn('No active harvest to complete');
            return null;
        }

        const { nodeId } = activeNode;
        const node = NodeRegistry.getAllActive()[nodeId];
        const currentRegion = this.state.currentRegion;
        const regionData = this.state.regions[currentRegion];
        const nodeState = regionData.availableNodes[nodeId];

        if (!node || !nodeState) {
            console.error('Invalid node state during harvest completion');
            this.cancelHarvest();
            return null;
        }

        // Initialize harvest counts if needed
        if (!this.state.nodeHarvestCounts) {
            this.state.nodeHarvestCounts = {};
        }
        this.state.nodeHarvestCounts[nodeId] = (this.state.nodeHarvestCounts[nodeId] || 0) + 1;

        // Create mock player state for NodeUtils
        const playerState = {
            skills: this.state.skills,
            nodeHarvestCounts: this.state.nodeHarvestCounts
        };

        // Process harvest using NodeUtils
        const rewards = NodeUtils.processHarvest(node, playerState);

        // Grant items
        const allLoot = [...rewards.items, ...rewards.rareDrops];
        for (const loot of allLoot) {
            this.addItemToBank(loot.itemId, loot.quantity);
        }

        // Grant XP
        this.addSkillXP(node.nodeType, rewards.xp);

        // Reduce node health
        nodeState.currentHealth = Math.max(0, nodeState.currentHealth - 1);

        // Check if depleted
        if (nodeState.currentHealth <= 0) {
            nodeState.depletedAt = Date.now();
            console.log(`${node.name} depleted! Respawning in ${node.respawnTime}s`);
        }

        // Clear activity
        this.state.currentActivity = null;
        this.state.nodeCollection = { activeNode: null };

        // Display harvest results
        const normalLootText = rewards.items.map(i => `${i.itemId} x${i.quantity}`).join(', ');
        const rareLootText = rewards.rareDrops.length > 0
            ? ` + ✨ ${rewards.rareDrops.map(i => `${i.itemId} x${i.quantity}`).join(', ')}`
            : '';

        console.log(`✅ Harvested ${node.name}: ${normalLootText}${rareLootText} (+${rewards.xp} XP)`);

        return {
            nodeId,
            nodeName: node.name,
            normalLoot: rewards.items,
            rareLoot: rewards.rareDrops,
            xpGain: rewards.xp,
            harvestsRemaining: nodeState.currentHealth
        };
    },

    /**
     * Cancel active harvest
     */
    cancelHarvest() {
        if (this.state.currentActivity === 'nodeCollection') {
            this.state.currentActivity = null;
            this.state.nodeCollection = { activeNode: null };
            console.log('Harvest cancelled');
            return true;
        }
        return false;
    },

    /**
     * Update node respawn timers (called from game loop)
     */
    updateNodeRespawns() {
        const now = Date.now();

        for (const regionId in this.state.regions) {
            const region = this.state.regions[regionId];

            if (!region.availableNodes) continue;

            for (const nodeId in region.availableNodes) {
                const nodeState = region.availableNodes[nodeId];
                const node = NodeRegistry.getAllActive()[nodeId];

                if (!node) continue;

                // Check if node needs to respawn
                if (nodeState.currentHealth <= 0 && nodeState.depletedAt) {
                    const timeElapsed = (now - nodeState.depletedAt) / 1000;

                    if (timeElapsed >= node.respawnTime) {
                        // Respawn node
                        nodeState.currentHealth = nodeState.maxHealth;
                        nodeState.depletedAt = null;

                        // Only log if player is in this region
                        if (regionId === this.state.currentRegion) {
                            console.log(`${node.name} has respawned!`);
                        }
                    }
                }
            }
        }
    },

    /**
     * Get time until node respawns (in seconds)
     */
    getTimeUntilRespawn(nodeId) {
        const currentRegion = this.state.currentRegion;
        const regionData = this.state.regions[currentRegion];
        const nodeState = regionData?.availableNodes?.[nodeId];
        const node = NodeRegistry.getAllActive()[nodeId];

        if (!nodeState || !node || nodeState.currentHealth > 0) {
            return 0;
        }

        const now = Date.now();
        const timeElapsed = (now - nodeState.depletedAt) / 1000;
        const timeRemaining = Math.max(0, node.respawnTime - timeElapsed);

        return timeRemaining;
    },

    /**
     * Get node state in current region
     */
    getNodeState(nodeId) {
        const currentRegion = this.state.currentRegion;
        const regionData = this.state.regions[currentRegion];
        return regionData?.availableNodes?.[nodeId] || null;
    },

    /**
     * Get all available nodes in current region
     */
    getAvailableNodesInRegion() {
        const currentRegion = this.state.currentRegion;
        const regionData = this.state.regions[currentRegion];

        if (!regionData?.availableNodes) {
            return [];
        }

        const availableNodes = [];

        for (const nodeId in regionData.availableNodes) {
            const nodeState = regionData.availableNodes[nodeId];
            const node = NodeRegistry.getAllActive()[nodeId];

            if (node && nodeState.discovered) {
                availableNodes.push({
                    node: node,
                    state: nodeState,
                    canHarvest: this.canHarvestNode(nodeId)
                });
            }
        }

        return availableNodes;
    },

    /**
     * Check if player has required tool equipped
     */
    hasRequiredTool(requiredTools, requiredTier) {
        if (!requiredTools || requiredTools.length === 0) {
            return true; // No tools required
        }

        // Check equipment for matching tool
        for (const slot in this.state.equipment) {
            const equippedItemId = this.state.equipment[slot];
            if (!equippedItemId) continue;

            const itemDef = this.definitions.items[equippedItemId];
            if (!itemDef) continue;

            // Check if this is a tool of required type and tier
            if (requiredTools.includes(itemDef.toolType) &&
                itemDef.toolTier >= requiredTier) {
                return true;
            }
        }

        return false;
    },

    /**
     * Get harvest progress (0-1)
     */
    getHarvestProgress() {
        const activeNode = this.state.nodeCollection?.activeNode;
        if (!activeNode) return 0;

        const now = Date.now();
        const elapsed = now - activeNode.startTime;
        const progress = Math.min(1, elapsed / activeNode.harvestTime);

        return progress;
    },

    /**
     * Check if harvest is complete
     */
    isHarvestComplete() {
        const activeNode = this.state.nodeCollection?.activeNode;
        if (!activeNode) return false;

        return Date.now() >= activeNode.completionTime;
    }
};
