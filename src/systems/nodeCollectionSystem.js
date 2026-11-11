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
    // Track missing nodes to prevent console spam
    _missingNodeWarnings: new Set(),

    /**
     * Helper: Get node definition from NodeRegistry ONLY
     */
    _getNodeDef(nodeId, engine) {
        // Use NodeRegistry.getNode() method (per UNIFIED_DATA_ARCHITECTURE spec)
        if (typeof NodeRegistry !== 'undefined' && NodeRegistry.getNode) {
            return NodeRegistry.getNode(nodeId);
        }
        // Fallback to direct lookup
        return NodeRegistry?.getAllActive?.()?.[nodeId] || null;
    },

    /**
     * Helper: Get item definition from ItemRegistry first, fallback to definitions
     */
    _getItemDef(itemId, engine) {
        let itemDef = null;
        if (typeof ItemRegistry !== 'undefined') {
            itemDef = ItemRegistry.getItem(itemId);
        }
        if (!itemDef && engine.definitions) {
            itemDef = engine.definitions.items?.[itemId];
        }
        return itemDef;
    },

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

        // Attach private methods (needed for refactored completeNodeHarvest)
        engine._validateHarvestState = this._validateHarvestState.bind(engine);
        engine._applyNodeFormatCompatibility = this._applyNodeFormatCompatibility.bind(engine);
        engine._checkHarvestSuccess = this._checkHarvestSuccess.bind(engine);
        engine._rollHarvestModifiers = this._rollHarvestModifiers.bind(engine);
        engine._rollAndAwardLoot = this._rollAndAwardLoot.bind(engine);
        engine._awardExperience = this._awardExperience.bind(engine);
        engine._decrementNodeHealth = this._decrementNodeHealth.bind(engine);
        engine._logHarvestSuccess = this._logHarvestSuccess.bind(engine);
        engine._handleNodeDepletion = this._handleNodeDepletion.bind(engine);
        engine._scheduleNextHarvest = this._scheduleNextHarvest.bind(engine);

        // Attach state management methods
        engine._updateNodeState = this._updateNodeState.bind(engine);
        engine._updateActiveNode = this._updateActiveNode.bind(engine);
        engine._setCurrentActivity = this._setCurrentActivity.bind(engine);
        engine._clearActiveNode = this._clearActiveNode.bind(engine);
        engine._createActiveNodeSession = this._createActiveNodeSession.bind(engine);

        // Attach tool validation methods (Phase 2)
        engine._getEquippedToolForSkill = this._getEquippedToolForSkill.bind(engine);
        engine._validateToolRequirement = this._validateToolRequirement.bind(engine);

        // Attach session tracking methods (Phase 2)
        engine._initializeSessionTracking = this._initializeSessionTracking.bind(engine);
        engine._updateSessionStats = this._updateSessionStats.bind(engine);
        engine._updateSessionMiss = this._updateSessionMiss.bind(engine);
        engine._getSessionSummary = this._getSessionSummary.bind(engine);
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

        // Get node from NodeRegistry first
        let nodeDef = null;
        if (typeof NodeRegistry !== 'undefined') {
            nodeDef = NodeRegistry.getAllActive()[nodeId];
        }
        if (!nodeDef) {
            nodeDef = this.definitions.resourceNodes?.[nodeId];
        }
        if (!nodeDef) return;

        const nodeState = regionNodes[nodeId];
        const maxHarvests = nodeDef.baseHealth || nodeDef.harvestsPerDepletion || 10;

        // Use StateManager pattern
        this._updateNodeState(nodeState, {
            harvestsRemaining: maxHarvests,
            maxHarvests: maxHarvests,
            depletedAt: null
        });

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
            // Get node from NodeRegistry first
            let nodeDef = null;
            if (typeof NodeRegistry !== 'undefined') {
                nodeDef = NodeRegistry.getAllActive()[nodeId];
            }
            if (!nodeDef) {
                nodeDef = this.definitions.resourceNodes?.[nodeId];
            }
            if (!nodeDef) continue;

            const nodeState = regionNodes[nodeId];
            const maxHarvests = nodeDef.baseHealth || nodeDef.harvestsPerDepletion || 10;

            // Use StateManager pattern
            this._updateNodeState(nodeState, {
                harvestsRemaining: maxHarvests,
                maxHarvests: maxHarvests,
                depletedAt: null
            });

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

        // Get weapon from ItemRegistry first
        let weaponDef = null;
        if (typeof ItemRegistry !== 'undefined') {
            weaponDef = ItemRegistry.getItem(weaponId);
        }
        if (!weaponDef) {
            weaponDef = this.definitions.items?.[weaponId];
        }
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
     * Get equipped tool for a specific skill (Phase 2: Tool requirement validation)
     * @private
     */
    _getEquippedToolForSkill(skillType) {
        // Check weapon slot first (most gathering tools are weapons)
        const weaponId = this.state.equipment.weapon;

        if (weaponId) {
            let weapon = null;
            if (typeof ItemRegistry !== 'undefined') {
                weapon = ItemRegistry.getItem(weaponId);
            }
            if (!weapon) {
                weapon = this.definitions.items?.[weaponId];
            }

            // Check if weapon has the required skill property
            if (weapon && weapon.skill === skillType) {
                return weapon;
            }
        }

        // Check tool slot if it exists
        const toolId = this.state.equipment.tool;
        if (toolId) {
            let tool = null;
            if (typeof ItemRegistry !== 'undefined') {
                tool = ItemRegistry.getItem(toolId);
            }
            if (!tool) {
                tool = this.definitions.items?.[toolId];
            }

            if (tool && tool.skill === skillType) {
                return tool;
            }
        }

        return null;
    },

    /**
     * Validate tool requirements for harvesting (Phase 2: Tool requirement validation)
     * @private
     */
    _validateToolRequirement(skillType, nodeDef) {
        const tool = this._getEquippedToolForSkill(skillType);

        if (!tool) {
            return {
                hasValidTool: false,
                reason: `You need a ${skillType} tool equipped (check weapon slot)`,
                tool: null
            };
        }

        return {
            hasValidTool: true,
            tool: tool
        };
    },

    /**
     * Get or initialize node state in current region
     */
    getNodeStateInRegion(nodeId) {
        const regionId = this.state.currentRegion;
        const nodeDef = NodeCollectionSystem._getNodeDef(nodeId, this);

        if (!nodeDef) return null;

        // Initialize region node tracking if doesn't exist
        if (!this.state.regions[regionId].availableNodes) {
            this.state.regions[regionId].availableNodes = {};
        }

        const regionNodes = this.state.regions[regionId].availableNodes;

        // Initialize this node if doesn't exist
        if (!regionNodes[nodeId]) {
            // Support both old (harvestsPerDepletion) and new (baseHealth) node schemas
            const maxHarvests = nodeDef.baseHealth || nodeDef.harvestsPerDepletion || 10;

            regionNodes[nodeId] = {
                discovered: false,
                harvestsRemaining: maxHarvests,
                maxHarvests: maxHarvests,
                depletedAt: null,
                respawnTime: nodeDef.respawnTime || 30000
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
                    const nodeDef = NodeCollectionSystem._getNodeDef(nodeId, this);

                    // Add null check per FOUNDATION_SPECIFICATION error handling
                    if (!nodeDef) {
                        // Only log warning once per missing node to prevent console spam
                        if (!NodeCollectionSystem._missingNodeWarnings.has(nodeId)) {
                            console.warn(`[NodeCollectionSystem] Node '${nodeId}' not found in NodeRegistry, skipping respawn`);
                            NodeCollectionSystem._missingNodeWarnings.add(nodeId);
                        }
                        continue; // Skip this node and continue with next one
                    }

                    const maxHarvests = nodeDef.baseHealth || nodeDef.harvestsPerDepletion || 10;

                    // Use StateManager pattern
                    this._updateNodeState(nodeState, {
                        harvestsRemaining: maxHarvests,
                        maxHarvests: maxHarvests,
                        depletedAt: null
                    });

                    console.log(`♻️ ${nodeDef.name} has respawned!`);
                }
            }
        }
    },

    /**
     * Start harvesting from a resource node
     */
    startNodeHarvesting(nodeId) {
        const nodeDef = NodeCollectionSystem._getNodeDef(nodeId, this);

        if (!nodeDef) {
            return { success: false, reason: "Node not found" };
        }

        // === COMPATIBILITY LAYER: Convert old node format to new format ===
        // Check if node uses old format (has resourceTable but not normalLoot)
        if (nodeDef.resourceTable && !nodeDef.normalLoot) {
            // Convert resourceTable to normalLoot format
            nodeDef.normalLoot = nodeDef.resourceTable.map(entry => ({
                itemId: entry.itemId,
                weight: entry.weight,
                min: entry.minYield || entry.min || 1,
                max: entry.maxYield || entry.max || 1
            }));

            // Calculate expPerHarvest based on tier (if missing)
            if (!nodeDef.expPerHarvest) {
                const tier = nodeDef.tier || 1;
                const baseXP = nodeDef.baseXP || (tier * 10); // 10 XP per tier
                nodeDef.expPerHarvest = baseXP;
            }

            // Add skill field (maps to nodeType for old format)
            if (!nodeDef.skill && nodeDef.nodeType) {
                nodeDef.skill = nodeDef.nodeType;
            }

            // Convert harvestTime from seconds to milliseconds (if needed)
            if (nodeDef.harvestTime && nodeDef.harvestTime < 100) {
                // If harvestTime is less than 100, assume it's in seconds
                nodeDef.harvestTime = nodeDef.harvestTime * 1000;
            }

            console.log(`[NodeCollectionSystem] Converted old format for ${nodeDef.id}:`, {
                normalLoot: nodeDef.normalLoot.length,
                expPerHarvest: nodeDef.expPerHarvest,
                skill: nodeDef.skill,
                harvestTime: nodeDef.harvestTime
            });
        }

        // Check skill level requirement (registry fields only)
        const skillType = nodeDef.nodeType;
        const requiredLevel = nodeDef.requiredSkillLevel;

        if (!this.state.skills[skillType]) {
            console.error(`❌ Skill '${skillType}' not found in player skills`);
            return { success: false, reason: `Skill '${skillType}' not available` };
        }

        const playerSkillLevel = this.state.skills[skillType].level;
        if (playerSkillLevel < requiredLevel) {
            return { success: false, reason: `Requires ${skillType} level ${requiredLevel}` };
        }

        // Phase 2: Validate tool requirement (optional for now - warn but allow)
        const toolValidation = this._validateToolRequirement(skillType, nodeDef);
        if (!toolValidation.hasValidTool) {
            console.warn(`⚠️ [Tool Validation] ${toolValidation.reason}`);
            console.warn(`⚠️ [Tool Validation] Harvesting with bare hands - penalties may apply`);
            // For now, allow harvesting without tools (backward compatibility)
            // TODO: Make tool requirement strict in future update
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

        // Set node collection as current activity (StateManager pattern)
        this._setCurrentActivity('nodeCollection');

        // Start harvesting (StateManager pattern)
        const activeNode = this._createActiveNodeSession(nodeId, nodeDef.harvestTime);

        // Phase 2: Initialize session tracking
        this._initializeSessionTracking(activeNode, skillType);

        console.log(`⛏️ Started harvesting ${nodeDef.name} (${nodeState.harvestsRemaining}/${nodeState.maxHarvests} remaining)`);

        // Emit gathering-started event for PersistentActionBar
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('gathering-started', {
                skill: nodeDef.skill,
                nodeId: nodeId,
                nodeName: nodeDef.name,
                nodeHealth: nodeState.harvestsRemaining,
                maxHealth: nodeState.maxHarvests
            });
        }

        return { success: true };
    },

    /**
     * Process node harvesting each tick
     */
    processNodeHarvesting(deltaTime) {
        const activeNode = this.state.nodeCollection.activeNode;
        if (!activeNode) return;

        const nodeDef = NodeCollectionSystem._getNodeDef(activeNode.nodeId, this);
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

                // Restart harvesting (StateManager pattern)
                this._updateActiveNode(activeNode, {
                    waitingForRespawn: false,
                    startTime: Date.now(),
                    harvestTime: nodeDef.harvestTime
                });

                // Emit event to restart UI animations
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('gathering-started', {
                        skill: nodeDef.skill,
                        nodeId: activeNode.nodeId,
                        nodeName: nodeDef.name,
                        nodeHealth: nodeState.harvestsRemaining,
                        maxHealth: nodeState.maxHarvests
                    });
                }
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
     * Complete node harvest and give rewards (REFACTORED)
     * Foundation Spec Compliant: Single responsibility, clean method extraction
     */
    completeNodeHarvest() {
        // Validate and get required state
        const harvestState = this._validateHarvestState();
        if (!harvestState) return;

        const {nodeDef, nodeState, activeNode} = harvestState;

        // Calculate harvest stats vs node defenses
        const harvestCalc = StatCalculator.calculateHarvestVsNode(nodeDef.nodeType, activeNode.nodeId);
        const effective = harvestCalc.effective;

        // Check if harvest succeeds (vs node evasion)
        if (!this._checkHarvestSuccess(effective, nodeDef, activeNode)) {
            return; // Miss - reschedule and try again
        }

        // Roll for modifiers (critical, rare)
        const modifiers = this._rollHarvestModifiers(effective);

        // Roll and award loot
        const rewards = this._rollAndAwardLoot(nodeDef, modifiers, effective);

        // Award experience
        const xpGained = this._awardExperience(nodeDef, modifiers.isCritical);

        // Phase 2: Update session tracking
        this._updateSessionStats(activeNode, rewards, xpGained, modifiers);

        // Decrement node health
        this._decrementNodeHealth(nodeState);

        // Log success and emit event
        this._logHarvestSuccess(nodeDef, rewards, nodeState, modifiers);

        // Handle depletion or schedule next harvest
        if (nodeState.harvestsRemaining <= 0) {
            this._handleNodeDepletion(nodeState, nodeDef, activeNode);
        } else {
            this._scheduleNextHarvest(activeNode, effective);
        }
    },

    /**
     * Validate harvest state and return required data
     * @private
     */
    _validateHarvestState() {
        const activeNode = this.state.nodeCollection.activeNode;
        if (!activeNode) return null;

        const nodeDef = NodeCollectionSystem._getNodeDef(activeNode.nodeId, this);
        if (!nodeDef) {
            this.stopNodeHarvesting();
            return null;
        }

        // Apply compatibility layer for old node format
        this._applyNodeFormatCompatibility(nodeDef);

        // Get node state
        const nodeState = this.getNodeStateInRegion(activeNode.nodeId);
        if (!nodeState || nodeState.harvestsRemaining <= 0) {
            this.stopNodeHarvesting();
            return null;
        }

        return {nodeDef, nodeState, activeNode};
    },

    /**
     * Apply compatibility layer to convert old node format to new format
     * @private
     */
    _applyNodeFormatCompatibility(nodeDef) {
        if (nodeDef.resourceTable && !nodeDef.normalLoot) {
            nodeDef.normalLoot = nodeDef.resourceTable.map(entry => ({
                itemId: entry.itemId,
                weight: entry.weight,
                min: entry.minYield || entry.min || 1,
                max: entry.maxYield || entry.max || 1
            }));

            if (!nodeDef.expPerHarvest) {
                const tier = nodeDef.tier || 1;
                const baseXP = nodeDef.baseXP || (tier * 10);
                nodeDef.expPerHarvest = baseXP;
            }

            if (!nodeDef.skill && nodeDef.nodeType) {
                nodeDef.skill = nodeDef.nodeType;
            }

            if (nodeDef.harvestTime && nodeDef.harvestTime < 100) {
                nodeDef.harvestTime = nodeDef.harvestTime * 1000;
            }
        }
    },

    /**
     * Check if harvest succeeds vs node evasion
     * @private
     */
    _checkHarvestSuccess(effective, nodeDef, activeNode) {
        const successRoll = Math.random() * 100;
        if (successRoll > effective.chance) {
            console.log(`❌ MISS! ${nodeDef.name} evaded your harvest attempt (${successRoll.toFixed(1)}% > ${effective.chance.toFixed(1)}%)`);

            // Phase 2: Track miss in session stats
            this._updateSessionMiss(activeNode);

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('gathering-miss');
            }

            // Reschedule next attempt (StateManager pattern)
            this._updateActiveNode(activeNode, {
                startTime: Date.now(),
                harvestTime: effective.speed
            });
            return false;
        }
        return true;
    },

    /**
     * Roll for critical and rare modifiers
     * @private
     */
    _rollHarvestModifiers(effective) {
        const critRoll = Math.random() * 100;
        const isCritical = critRoll < effective.critChance;
        const critMultiplier = isCritical ? effective.critMultiplier : 1;

        if (isCritical) {
            console.log(`💥 CRITICAL HARVEST! (${critMultiplier.toFixed(1)}x multiplier)`);
        }

        const rareRoll = Math.random() * 100;
        const isRare = rareRoll < effective.rareChance;

        if (isRare) {
            console.log(`✨ RARE DROP! (${effective.rareMultiplier.toFixed(1)}x multiplier)`);
        }

        return {isCritical, critMultiplier, isRare, rareMultiplier: effective.rareMultiplier};
    },

    /**
     * Roll loot tables, apply multipliers, and add to bank
     * @private
     */
    _rollAndAwardLoot(nodeDef, modifiers, effective) {
        const rewardsGained = [];
        const {isCritical, critMultiplier, isRare, rareMultiplier} = modifiers;

        // Select loot table - if rare drop but no rareLoot table, use normalLoot with multiplier
        const hasRareLoot = nodeDef.rareLoot && nodeDef.rareLoot.length > 0;
        const lootTable = (isRare && hasRareLoot) ? nodeDef.rareLoot : nodeDef.normalLoot;
        const lootResult = (isRare && hasRareLoot) ? this.rollRareLoot(lootTable) : [this.rollNormalLoot(lootTable)];

        // Process each loot item
        for (let loot of lootResult) {
            if (!loot) continue;

            let finalAmount = loot.amount;

            if (isCritical) {
                finalAmount = Math.floor(finalAmount * critMultiplier);
            }

            if (isRare) {
                finalAmount = Math.floor(finalAmount * rareMultiplier);
            }

            this.addItemToBank(loot.itemId, finalAmount);
            const itemDef = NodeCollectionSystem._getItemDef(loot.itemId, this);
            const itemName = itemDef?.name || loot.itemId;

            let label = `${finalAmount}x ${itemName}`;
            if (isCritical) label += ' 💥';
            if (isRare) label += ' ✨';

            rewardsGained.push(label);
        }

        return rewardsGained;
    },

    /**
     * Award experience points with critical bonus
     * @private
     */
    _awardExperience(nodeDef, isCritical) {
        let xpGained = nodeDef.expPerHarvest;
        if (isCritical) {
            xpGained = Math.floor(xpGained * 1.5);
        }
        this.gainSkillExp(nodeDef.skill, xpGained);

        if (this.checkMissionObjectives) {
            this.checkMissionObjectives('skill_action', {
                skillId: nodeDef.skill
            });
        }

        return xpGained;
    },

    /**
     * Decrement node health
     * @private
     */
    _decrementNodeHealth(nodeState) {
        // StateManager pattern - centralized mutation
        this._updateNodeState(nodeState, {
            harvestsRemaining: nodeState.harvestsRemaining - 1
        });
    },

    /**
     * Log harvest success and emit event
     * @private
     */
    _logHarvestSuccess(nodeDef, rewards, nodeState, modifiers) {
        const xpGained = modifiers.isCritical ? Math.floor(nodeDef.expPerHarvest * 1.5) : nodeDef.expPerHarvest;

        console.log(`✅ Harvested from ${nodeDef.name}: ${rewards.join(', ')} +${xpGained} ${nodeDef.skill} XP (${nodeState.harvestsRemaining}/${nodeState.maxHarvests} remaining)`);

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('gathering-success', {
                damage: 1,  // Always 1 harvest consumed per action
                rewards: rewards,  // Array of reward strings
                nodeHealth: nodeState.harvestsRemaining,  // Current harvests remaining
                maxHealth: nodeState.maxHarvests,  // Max harvests
                xpGained: xpGained,  // XP awarded this harvest
                isCritical: modifiers.isCritical,  // Was this a critical?
                isRare: modifiers.isRare  // Was this a rare drop?
            });
        }
    },

    /**
     * Handle node depletion
     * @private
     */
    _handleNodeDepletion(nodeState, nodeDef, activeNode) {
        // StateManager pattern - centralized mutations
        const now = Date.now();

        this._updateNodeState(nodeState, {
            depletedAt: now
        });

        const respawnSeconds = Math.ceil(nodeState.respawnTime / 1000);
        console.log(`⏳ ${nodeDef.name} depleted! Waiting for respawn (${respawnSeconds}s)...`);

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('node-depleted', {
                nodeId: activeNode.nodeId,
                nodeName: nodeDef.name,
                respawnTime: nodeState.respawnTime,
                respawnSeconds: respawnSeconds
            });
        }

        this._updateActiveNode(activeNode, {
            waitingForRespawn: true,
            respawnStartTime: now
        });
    },

    /**
     * Schedule next harvest attempt
     * @private
     */
    _scheduleNextHarvest(activeNode, effective) {
        // StateManager pattern - centralized mutation
        this._updateActiveNode(activeNode, {
            startTime: Date.now(),
            harvestTime: effective.speed,
            waitingForRespawn: false
        });
    },

    // ===== STATE MANAGEMENT LAYER =====
    // Centralized state mutations following Foundation Spec

    /**
     * Update node state (centralized mutation point)
     * @private
     */
    _updateNodeState(nodeState, updates) {
        Object.assign(nodeState, updates);
    },

    /**
     * Update active node state (centralized mutation point)
     * @private
     */
    _updateActiveNode(activeNode, updates) {
        Object.assign(activeNode, updates);
    },

    /**
     * Set current activity (centralized mutation point)
     * @private
     */
    _setCurrentActivity(activityName) {
        this.state.currentActivity = activityName;
    },

    /**
     * Clear active node (centralized mutation point)
     * @private
     */
    _clearActiveNode() {
        this.state.nodeCollection.activeNode = null;
    },

    /**
     * Create active node session (centralized mutation point)
     * @private
     */
    _createActiveNodeSession(nodeId, harvestTime) {
        this.state.nodeCollection.activeNode = {
            nodeId: nodeId,
            startTime: Date.now(),
            harvestTime: harvestTime
        };
        return this.state.nodeCollection.activeNode;
    },

    // ===== SESSION TRACKING =====
    // Phase 2: Track session statistics

    /**
     * Initialize session tracking for new harvesting session
     * @private
     */
    _initializeSessionTracking(activeNode, skillType) {
        activeNode.session = {
            skill: skillType,
            startedAt: Date.now(),
            totalActions: 0,
            successfulActions: 0,
            missedActions: 0,
            criticalActions: 0,
            rareActions: 0,
            totalResources: {},
            totalXP: 0
        };
    },

    /**
     * Update session stats after successful harvest
     * @private
     */
    _updateSessionStats(activeNode, rewards, xpGained, modifiers) {
        if (!activeNode.session) return;

        const session = activeNode.session;
        session.totalActions++;
        session.successfulActions++;
        session.totalXP += xpGained;

        if (modifiers.isCritical) {
            session.criticalActions++;
        }

        if (modifiers.isRare) {
            session.rareActions++;
        }

        // Track resources gained
        for (const reward of rewards) {
            // Parse reward string (e.g., "3x Clay" or "1x Flint 💥")
            const match = reward.match(/(\d+)x\s+([^💥✨]+)/);
            if (match) {
                const amount = parseInt(match[1]);
                const itemName = match[2].trim();

                if (!session.totalResources[itemName]) {
                    session.totalResources[itemName] = 0;
                }
                session.totalResources[itemName] += amount;
            }
        }
    },

    /**
     * Update session stats after missed harvest
     * @private
     */
    _updateSessionMiss(activeNode) {
        if (!activeNode.session) return;

        activeNode.session.totalActions++;
        activeNode.session.missedActions++;
    },

    /**
     * Get session summary for logging
     * @private
     */
    _getSessionSummary(activeNode) {
        if (!activeNode.session) return null;

        const session = activeNode.session;
        const duration = Math.floor((Date.now() - session.startedAt) / 1000);
        const successRate = session.totalActions > 0
            ? ((session.successfulActions / session.totalActions) * 100).toFixed(1)
            : 0;

        return {
            skill: session.skill,
            duration: duration,
            totalActions: session.totalActions,
            successRate: successRate,
            criticals: session.criticalActions,
            rares: session.rareActions,
            totalXP: session.totalXP,
            resources: session.totalResources
        };
    },

    /**
     * Stop node harvesting
     */
    stopNodeHarvesting() {
        // Phase 2: Log session summary before stopping
        const activeNode = this.state.nodeCollection.activeNode;
        if (activeNode) {
            const summary = this._getSessionSummary(activeNode);
            if (summary) {
                console.log(`📊 Session Summary - ${summary.skill}:`);
                console.log(`   Duration: ${summary.duration}s`);
                console.log(`   Actions: ${summary.totalActions} (${summary.successRate}% success)`);
                console.log(`   Criticals: ${summary.criticals}, Rares: ${summary.rares}`);
                console.log(`   Total XP: ${summary.totalXP}`);
                console.log(`   Resources:`, summary.resources);
            }
        }

        // StateManager pattern - centralized state mutation
        if (this.state.currentActivity === 'nodeCollection') {
            this._setCurrentActivity(null);
        }
        this._clearActiveNode();

        // Emit gathering-stopped event for PersistentActionBar
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('gathering-stopped');
        }

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
     * Uses NEW GLOBAL DISCOVERY SYSTEM - nodes discovered globally, not per-region
     */
    getAvailableNodesForSkill() {
        const selectedSkill = this.state.nodeCollection.selectedSkill;
        if (!selectedSkill) return [];

        // Get ALL globally discovered nodes (not region-specific)
        const globalNodes = this.state.globalNodes || {};

        const nodes = [];
        for (let nodeId in globalNodes) {
            const globalNode = globalNodes[nodeId];

            // Skip if not discovered
            if (!globalNode.discovered) continue;

            // Get node definition from NodeRegistry
            const nodeDef = NodeCollectionSystem._getNodeDef(nodeId, this);
            if (!nodeDef) continue;

            // Filter by skill - use nodeType as skill name
            const nodeSkill = nodeDef.nodeType || nodeDef.skill;
            if (nodeSkill !== selectedSkill) continue;

            // Check skill level requirement
            const playerSkillLevel = this.state.skills[selectedSkill]?.level || 0;
            const requiredLevel = nodeDef.requiredSkillLevel || nodeDef.skillLevel || 1;
            const canCollect = playerSkillLevel >= requiredLevel;

            // Get node state in current region
            const nodeState = this.getNodeStateInRegion(nodeId);

            // Check if node is currently depleted (tracked in GatheringSystem session)
            const gatheringSession = this.state.gatheringSession;
            const isDepleted = gatheringSession?.nodeId === nodeId && gatheringSession?.isNodeDepleted;

            nodes.push({
                nodeId: nodeId,
                definition: nodeDef,
                state: nodeState,
                globalState: globalNode,
                canCollect: canCollect,
                locked: !canCollect,
                isDepleted: isDepleted,  // Add depletion status from GatheringSystem
                regionCount: Object.keys(globalNode.regionContributions || {}).length,
                totalHealth: globalNode.totalHealthBonus || 0
            });
        }

        // Sort by tier, then by required level
        nodes.sort((a, b) => {
            if (a.definition.tier !== b.definition.tier) {
                return a.definition.tier - b.definition.tier;
            }
            return (a.definition.requiredSkillLevel || 0) - (b.definition.requiredSkillLevel || 0);
        });

        return nodes;
    }
};
