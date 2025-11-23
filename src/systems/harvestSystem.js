/**
 * HARVEST SYSTEM
 *
 * Handles node harvesting mechanics, loot rolling, and respawn timers
 */

const HarvestSystem = {    /**
     * Get item definition from ItemRegistry (standardized access pattern)
     * @param {string} itemId - Item ID to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    _getItemDef(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },


    init(engine) {
        engine.canHarvestNode = this.canHarvestNode.bind(engine);
        engine.startHarvest = this.startHarvest.bind(engine);
        engine.completeHarvest = this.completeHarvest.bind(engine);
        engine.cancelHarvest = this.cancelHarvest.bind(engine);
        engine.updateNodeRespawns = this.updateNodeRespawns.bind(engine);
        engine.getNodeState = this.getNodeState.bind(engine);
        engine.getAvailableNodesInRegion = this.getAvailableNodesInRegion.bind(engine);
        console.log('✅ HarvestSystem initialized (ItemRegistry pattern)');

    },

    /**
     * Check if player can harvest a node
     * NEW SYSTEM: Uses nodeHealth and global discovery
     */
    canHarvestNode(nodeId) {
        const node = NodeRegistry.getAllActive()[nodeId];
        if (!node) {
            return { canHarvest: false, reason: "Node not found" };
        }

        // Check if discovered globally
        const globalNode = this.state.globalNodes?.[nodeId];
        if (!globalNode || !globalNode.discovered) {
            return { canHarvest: false, reason: "Node not discovered" };
        }

        // Check if depleted
        // For mining nodes, check nodeHealth if it exists, otherwise check globalNodes
        let currentHP;
        if (node.nodeType === 'mining') {
            const nodeHealth = this.state.nodeHealth?.[nodeId];
            if (nodeHealth) {
                currentHP = nodeHealth.currentHP;
            } else {
                // Node hasn't been mined yet, use discovery HP
                const globalNode = this.state.globalNodes?.[nodeId];
                currentHP = globalNode?.totalHealthBonus || 10;
            }
        } else {
            // Non-mining nodes use global discovery HP
            const globalNode = this.state.globalNodes?.[nodeId];
            currentHP = globalNode?.totalHealthBonus || 10;
        }

        if (currentHP <= 0) {
            return {
                canHarvest: false,
                reason: "Depleted"
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

        // Check if already mining/harvesting
        if (this.state.currentActivity === 'mining' && this.state.miningState?.activeNode) {
            return { canHarvest: false, reason: "Already mining" };
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
     * NEW: Uses mining system (state.nodeHealth) for ALL nodes
     */
    getAvailableNodesInRegion() {
        // Get ALL globally discovered nodes (not region-specific)
        const globalNodes = this.state.globalNodes || {};
        const availableNodes = [];

        for (const nodeId in globalNodes) {
            const globalNode = globalNodes[nodeId];

            // Skip if not discovered
            if (!globalNode?.discovered) continue;

            // Get node definition from NodeRegistry
            const node = NodeRegistry.getAllActive()[nodeId];
            if (!node) continue;

            // For mining nodes, read HP from mining system's nodeHealth if it exists
            // Otherwise fall back to globalNodes totalHealthBonus
            // For other nodes, use totalHealthBonus from global discovery
            let currentHealth, maxHealth;

            if (node.nodeType === 'mining') {
                // Mining nodes use the mining system's HP tracking
                const nodeHealth = this.state.nodeHealth?.[nodeId];

                if (nodeHealth) {
                    // Node health has been initialized by mining system
                    currentHealth = nodeHealth.currentHP;
                    maxHealth = nodeHealth.maxHP;
                } else {
                    // Node hasn't been mined yet, show discovery HP
                    const discoveryHP = globalNode.totalHealthBonus || 10;
                    currentHealth = discoveryHP;
                    maxHealth = discoveryHP;
                }
            } else {
                // Non-mining nodes just show total health bonus directly
                currentHealth = globalNode.totalHealthBonus || 10;
                maxHealth = globalNode.totalHealthBonus || 10;
            }

            // Create unified state object
            const state = {
                currentHealth: currentHealth,
                maxHealth: maxHealth,
                discovered: true
            };

            availableNodes.push({
                node: node,
                state: state,
                canHarvest: this.canHarvestNode(nodeId)
            });
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

            const itemDef = HarvestSystem._getItemDef.call(this, equippedItemId);
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
