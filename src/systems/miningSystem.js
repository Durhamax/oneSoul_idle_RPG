/**
 * MINING SYSTEM - Phase 1 Implementation
 *
 * Complete mining loop with:
 * - Tool requirement validation
 * - Node HP system with discovery scaling
 * - Mining action loop (hit/miss/deplete)
 * - Rest state system
 * - Hit chance and interval calculations
 */

const MiningSystem = {
    /**
     * Initialize mining system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all mining functions to engine
        engine.startMining = this.startMining.bind(engine);
        engine.stopMining = this.stopMining.bind(engine);
        engine.processMiningTick = this.processMiningTick.bind(engine);
        engine.processMiningRestTick = this.processMiningRestTick.bind(engine);
        engine.validateMiningRequirements = this.validateMiningRequirements.bind(engine);
        engine.getEquippedMiningTool = this.getEquippedMiningTool.bind(engine);
        engine.getNodeMaxHP = this.getNodeMaxHP.bind(engine);
        engine.initializeNodeHealth = this.initializeNodeHealth.bind(engine);
        engine.calculateMiningHitChance = this.calculateMiningHitChance.bind(engine);
        engine.calculateMiningInterval = this.calculateMiningInterval.bind(engine);
        engine.startMiningRestState = this.startMiningRestState.bind(engine);
        engine.rollBasicMiningResources = this.rollBasicMiningResources.bind(engine);

        // Initialize state if needed
        if (!engine.state.nodeHealth) {
            engine.state.nodeHealth = {};
        }
        if (!engine.state.miningState) {
            engine.state.miningState = {
                activeNode: null,
                lastActionTime: 0,
                isResting: false
            };
        }
        if (!engine.state.restState) {
            engine.state.restState = {
                activity: null,
                startTime: 0,
                endurance: 0,
                maxEndurance: 100
            };
        }
    },

    /**
     * Get equipped mining tool (pickaxe)
     * Checks weapon slot and tool slot for pickaxe
     */
    getEquippedMiningTool() {
        // Check weapon slot first
        const weaponId = this.state.equipment.weapon;
        if (weaponId) {
            const weaponDef = ItemRegistry.getItem(weaponId) || this.definitions?.items?.[weaponId];
            if (weaponDef && weaponDef.toolType === 'pickaxe') {
                return {
                    id: weaponId,
                    ...weaponDef
                };
            }
        }

        // Check tool slot (future)
        const toolId = this.state.equipment.tool;
        if (toolId) {
            const toolDef = ItemRegistry.getItem(toolId) || this.definitions?.items?.[toolId];
            if (toolDef && toolDef.toolType === 'pickaxe') {
                return {
                    id: toolId,
                    ...toolDef
                };
            }
        }

        return null;
    },

    /**
     * Helper: Get item definition from ItemRegistry or definitions
     */
    _getItemDef(itemId) {
        if (typeof ItemRegistry !== 'undefined') {
            const item = ItemRegistry.getItem(itemId);
            if (item) return item;
        }
        return this.definitions?.items?.[itemId] || null;
    },

    /**
     * Helper: Get node definition from NodeRegistry
     */
    _getNodeDef(nodeId) {
        if (typeof NodeRegistry !== 'undefined') {
            return NodeRegistry.getAllActive()[nodeId];
        }
        return this.definitions?.resourceNodes?.[nodeId] || null;
    },

    /**
     * Validate mining requirements before starting
     * Returns {success: boolean, reason: string}
     */
    validateMiningRequirements(nodeId) {
        // Get node from NodeRegistry
        const nodeDef = NodeRegistry.getAllActive()[nodeId];
        if (!nodeDef) {
            return { success: false, reason: "Node not found" };
        }

        // Check if mining tool equipped
        const tool = this.getEquippedMiningTool();
        if (!tool) {
            return {
                success: false,
                reason: "Mining Tool Required",
                message: "You need a pickaxe equipped to mine this node.",
                icon: "⛏️"
            };
        }

        // Check mining skill level
        const miningSkill = this.state.skills.mining;
        const requiredLevel = nodeDef.requiredSkillLevel || 1;
        if (miningSkill.level < requiredLevel) {
            return {
                success: false,
                reason: `Mining Level ${requiredLevel} Required`,
                message: `You need Mining level ${requiredLevel} to mine this node. (Current: ${miningSkill.level})`,
                icon: "⛏️"
            };
        }

        // Check if node is discovered globally
        const globalNode = this.state.globalNodes?.[nodeId];
        if (!globalNode || !globalNode.discovered) {
            return {
                success: false,
                reason: "Node not discovered",
                message: "This node has not been discovered yet. Explore to find it!"
            };
        }

        // Initialize node health if needed
        const nodeHealth = this.initializeNodeHealth(nodeId);

        // Check if node is depleted
        if (nodeHealth.currentHP <= 0) {
            return {
                success: false,
                reason: "Node depleted",
                message: "This node is depleted. Rest to restore it."
            };
        }

        return { success: true };
    },

    /**
     * Get node health from global discovery system
     * Uses existing globalNodes data structure
     */
    getNodeMaxHP(nodeId) {
        // Use global discovery system data
        const globalNode = this.state.globalNodes?.[nodeId];

        if (!globalNode || !globalNode.discovered) {
            return 0; // Node not discovered yet
        }

        // Each region contributes 10 HP
        return globalNode.totalHealthBonus || 10;
    },

    /**
     * Initialize node health when first accessed
     * Syncs with global discovery system
     */
    initializeNodeHealth(nodeId) {
        if (!this.state.nodeHealth) {
            this.state.nodeHealth = {};
        }

        if (!this.state.nodeHealth[nodeId]) {
            const maxHP = this.getNodeMaxHP(nodeId);
            this.state.nodeHealth[nodeId] = {
                maxHP: maxHP,
                currentHP: maxHP
            };
        } else {
            // Update max HP from global discovery system
            const maxHP = this.getNodeMaxHP(nodeId);
            this.state.nodeHealth[nodeId].maxHP = maxHP;

            // If current HP is 0 (depleted), keep it at 0 until rest completes
            // Otherwise, ensure current HP doesn't exceed new max
            if (this.state.nodeHealth[nodeId].currentHP > 0) {
                this.state.nodeHealth[nodeId].currentHP = Math.min(
                    this.state.nodeHealth[nodeId].currentHP,
                    maxHP
                );
            }
        }

        return this.state.nodeHealth[nodeId];
    },

    /**
     * Calculate hit chance for mining action
     */
    calculateMiningHitChance(nodeDef, tool, miningSkill) {
        let baseChance = 0.7; // 70% base hit chance

        // Tool accuracy bonus
        if (tool.gatheringBonus?.mining?.accuracy) {
            baseChance += tool.gatheringBonus.mining.accuracy;
        }

        // Skill bonus (+1% per level)
        baseChance += miningSkill.level * 0.01;

        // Node difficulty penalty
        const levelDiff = (nodeDef.requiredSkillLevel || 1) - miningSkill.level;
        if (levelDiff > 0) {
            baseChance -= levelDiff * 0.05; // -5% per level difference
        }

        // Tool tier penalty (soft gating)
        const tierMap = {
            'tutorial': 0,
            'basic': 1,
            'improved': 2,
            'advanced': 3,
            'exceptional': 4,
            'legendary': 5
        };
        const toolTier = tierMap[tool.tier] || 1;
        const nodeTier = nodeDef.tier || 1;
        const tierDiff = nodeTier - toolTier;
        if (tierDiff > 0) {
            baseChance -= tierDiff * 0.15; // -15% per tier difference
        }

        // Clamp between 10% and 95%
        return Math.max(0.1, Math.min(0.95, baseChance));
    },

    /**
     * Calculate mining interval (time between actions)
     */
    calculateMiningInterval(nodeDef, tool, miningSkill) {
        let baseInterval = 3000; // 3 seconds base

        // Tool speed bonus
        if (tool.gatheringBonus?.mining?.speed) {
            baseInterval /= tool.gatheringBonus.mining.speed; // Higher = faster
        }

        // Skill speed bonus (-2% per level, max 50%)
        const skillBonus = Math.min(miningSkill.level * 0.02, 0.5);
        baseInterval *= (1 - skillBonus);

        // Node resistance
        if (nodeDef.harvestTime) {
            baseInterval *= nodeDef.harvestTime / 3.0; // Normalize to 3.0 base
        }

        return Math.max(500, baseInterval); // Min 0.5 seconds
    },

    /**
     * Start mining a node
     */
    startMining(nodeId) {
        // Validate requirements
        const validation = this.validateMiningRequirements(nodeId);
        if (!validation.success) {
            console.warn(`⚠️ Cannot start mining: ${validation.reason}`);

            // Show modal to player
            if (typeof showRequirementModal === 'function') {
                showRequirementModal({
                    title: validation.reason,
                    message: validation.message,
                    icon: validation.icon || "⚠️"
                });
            }
            return false;
        }

        // Stop current activity
        if (this.state.currentActivity) {
            console.log(`Stopping current activity: ${this.state.currentActivity}`);
        }

        // Ensure mining state exists (save system may have wiped it)
        if (!this.state.miningState) {
            this.state.miningState = {
                activeNode: null,
                lastActionTime: 0,
                isResting: false
            };
        }

        // Initialize mining state
        this.state.currentActivity = 'mining';
        this.state.miningState.activeNode = nodeId;
        this.state.miningState.lastActionTime = Date.now();
        this.state.miningState.isResting = false;

        const nodeDef = NodeRegistry.getAllActive()[nodeId];
        console.log(`⛏️ Started mining ${nodeDef.name}`);

        // Update UI
        if (typeof renderMiningUI === 'function') {
            renderMiningUI();
        }

        return true;
    },

    /**
     * Stop mining
     */
    stopMining(reason = "Stopped by player") {
        if (this.state.currentActivity !== 'mining') return;

        console.log(`🛑 Mining stopped: ${reason}`);

        this.state.currentActivity = null;
        this.state.miningState.activeNode = null;
        this.state.miningState.lastActionTime = 0;
        this.state.miningState.isResting = false;

        // Update UI
        if (typeof renderMiningUI === 'function') {
            renderMiningUI();
        }
    },

    /**
     * Process mining tick (called from main game loop)
     */
    processMiningTick() {
        // Safeguard: Don't process if not mining
        if (this.state.currentActivity !== 'mining') return;

        // Safeguard: State might be undefined after save load
        if (!this.state.miningState) return;

        // Safeguard: Don't process if resting
        if (this.state.miningState.isResting) return;

        const nodeId = this.state.miningState.activeNode;
        if (!nodeId) return;

        const nodeDef = NodeRegistry.getAllActive()[nodeId];
        if (!nodeDef) {
            this.stopMining("Node not found");
            return;
        }

        const now = Date.now();
        const miningSkill = this.state.skills.mining;
        const tool = this.getEquippedMiningTool();

        // Check tool still equipped
        if (!tool) {
            this.stopMining("Tool unequipped");
            return;
        }

        // Check interval
        const interval = this.calculateMiningInterval(nodeDef, tool, miningSkill);
        if (now - this.state.miningState.lastActionTime < interval) return;

        // Roll hit chance
        const hitChance = this.calculateMiningHitChance(nodeDef, tool, miningSkill);
        const didHit = Math.random() < hitChance;

        if (didHit) {
            // HIT - Deal damage to node
            const damage = 1; // Base damage per hit

            // Initialize or update node health from global discovery system
            const nodeHealth = this.initializeNodeHealth(nodeId);
            nodeHealth.currentHP -= damage;

            // Clamp HP to 0 minimum (prevent negative HP)
            nodeHealth.currentHP = Math.max(0, nodeHealth.currentHP);

            console.log(`[MINING] HIT! HP: ${nodeHealth.currentHP}/${nodeHealth.maxHP}`);

            // Visual feedback
            if (typeof showDamageNumber === 'function') {
                showDamageNumber(damage, false); // false = not crit
            }

            // Check if depleted
            if (nodeHealth.currentHP <= 0) {
                // Award resources
                const resources = this.rollBasicMiningResources(nodeDef, miningSkill);
                console.log(`💎 Node depleted! Rewards:`, resources);

                for (let itemId in resources) {
                    this.addItemToBank(itemId, resources[itemId]);
                }

                // Award mining XP
                const xpGained = nodeDef.baseXP || 25;
                this.gainSkillExp('mining', xpGained);

                // Enter rest state
                this.startMiningRestState(nodeId);
            }
        } else {
            // MISS
            console.log(`[MINING] MISS (${Math.round(hitChance * 100)}% chance)`);

            if (typeof showMissIndicator === 'function') {
                showMissIndicator();
            }
        }

        // Update last action time
        this.state.miningState.lastActionTime = now;

        // Update UI
        if (typeof updateMiningProgress === 'function') {
            updateMiningProgress();
        }
    },

    /**
     * Roll basic mining resources
     */
    rollBasicMiningResources(nodeDef, miningSkill) {
        const resources = {};

        if (!nodeDef.resourceTable) return resources;

        // Roll each item in resource table
        for (let entry of nodeDef.resourceTable) {
            const roll = Math.random() * 100;
            if (roll < entry.weight) {
                // Calculate yield
                let yield_ = Math.floor(Math.random() * (entry.maxYield - entry.minYield + 1)) + entry.minYield;

                // Apply skill scaling if enabled
                if (entry.skillScaling) {
                    const skillBonus = 1 + (miningSkill.level * 0.05); // +5% per level
                    yield_ = Math.floor(yield_ * skillBonus);
                }

                // Apply tool yield bonus
                const tool = this.getEquippedMiningTool();
                if (tool && tool.gatheringBonus?.mining?.yield) {
                    yield_ = Math.floor(yield_ * tool.gatheringBonus.mining.yield);
                }

                resources[entry.itemId] = (resources[entry.itemId] || 0) + yield_;
            }
        }

        return resources;
    },

    /**
     * Start rest state after node depletion
     */
    startMiningRestState(nodeId) {
        const nodeDef = NodeRegistry.getAllActive()[nodeId];

        console.log(`💤 Entering rest state for ${nodeDef.name}`);

        this.state.miningState.isResting = true;

        // Calculate max endurance
        let maxEndurance = 100;
        const strength = this.state.combatAttributes.strength || 1;
        const mobility = this.state.combatAttributes.mobility || 1;
        maxEndurance += (strength + mobility) * 2;

        this.state.restState = {
            activity: 'mining',
            nodeId: nodeId,
            startTime: Date.now(),
            endurance: 0,
            maxEndurance: maxEndurance
        };

        // Update UI to show rest state
        if (typeof renderMiningRestUI === 'function') {
            renderMiningRestUI();
        }
    },

    /**
     * Process mining rest tick
     */
    processMiningRestTick() {
        if (this.state.currentActivity !== 'mining') return;
        if (!this.state.miningState.isResting) return;

        const rest = this.state.restState;
        if (rest.activity !== 'mining') return;

        // Calculate recovery rate (1 endurance per 100ms = 10 per second)
        let recoveryRate = 0.1; // per 10ms tick
        // Future: add bonus from food/consumables

        rest.endurance += recoveryRate;

        console.log(`[REST] Endurance: ${Math.floor(rest.endurance)}/${rest.maxEndurance}`);

        // Check if rest complete
        if (rest.endurance >= rest.maxEndurance) {
            // Rest complete - restore node HP
            const nodeId = rest.nodeId;
            const nodeHealth = this.state.nodeHealth[nodeId];

            if (nodeHealth) {
                nodeHealth.currentHP = nodeHealth.maxHP;
                console.log(`[REST COMPLETE] Restoring node ${nodeId} to ${nodeHealth.maxHP} HP and resuming mining`);
            }

            // Exit rest state and RESUME MINING
            this.state.miningState.isResting = false;
            this.state.miningState.lastActionTime = Date.now(); // Reset action timer
            this.state.restState = {
                activity: null,
                startTime: 0,
                endurance: 0,
                maxEndurance: 100
            };

            console.log(`✅ Node ${nodeId} restored to ${nodeHealth.maxHP} HP - Mining resumed`);

            // Show notification
            if (typeof showFloatingText === 'function') {
                showFloatingText("Rest complete! Node restored. Mining resumed!", 'success');
            }

            // Update UI to show mining state again
            if (typeof renderMiningUI === 'function') {
                renderMiningUI();
            }
        } else {
            // Update rest UI
            if (typeof updateMiningRestProgress === 'function') {
                updateMiningRestProgress();
            }
        }
    }
};
