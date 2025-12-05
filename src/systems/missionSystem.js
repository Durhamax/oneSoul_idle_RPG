/**
 * MISSION SYSTEM - EventBus-Integrated Version
 *
 * Core mission management system following the System Injection Pattern.
 * Automatically tracks objectives via EventBus subscriptions.
 *
 * Objective types: See src/data/missions/objectiveTypes.js for full list
 *
 * EventBus Integration:
 * - Subscribes to game events for automatic objective tracking
 * - Emits mission lifecycle events (started, completed, abandoned, etc.)
 */

const MissionSystem = {
    /** Store unsubscribe functions for cleanup */
    _eventSubscriptions: [],

    /**
     * Helper: Get mission definition from MissionRegistry first, fallback to definitions
     */
    _getMissionDef(missionId, engine) {
        let missionDef = null;

        // Try MissionRegistry first
        if (typeof MissionRegistry !== 'undefined') {
            missionDef = MissionRegistry.get(missionId);
            if (!missionDef) {
                missionDef = MissionRegistry.getAllActive()[missionId];
            }
        }

        // Fallback to definitions
        if (!missionDef && engine.definitions) {
            missionDef = engine.definitions.missions?.[missionId];
        }

        return missionDef;
    },

    /**
     * Helper: Get item definition
     */
    _getItemDef(itemId, engine) {
        if (typeof ItemAccessHelper !== 'undefined') {
            return ItemAccessHelper.getItem(itemId);
        }
        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getItem(itemId);
        }
        return engine.definitions?.items?.[itemId];
    },

    /**
     * Initialize mission system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        console.log('🔄 Initializing MissionSystem...');

        // Store engine reference for event handlers
        this._engine = engine;

        // Attach all mission functions to engine
        engine.initializeMissions = this.initializeMissions.bind(engine);
        engine.updateAvailableMissions = this.updateAvailableMissions.bind(engine);
        engine.canStartMission = this.canStartMission.bind(engine);
        engine.startMission = this.startMission.bind(engine);
        engine.completeMission = this.completeMission.bind(engine);
        engine.submitMission = this.submitMission.bind(engine);
        engine.grantMissionRewards = this.grantMissionRewards.bind(engine);
        engine.abandonMission = this.abandonMission.bind(engine);
        engine.getMissionProgress = this.getMissionProgress.bind(engine);
        engine.advanceObjective = this.advanceObjective.bind(engine);
        engine.checkObjectiveProgress = this.checkObjectiveProgress.bind(engine);
        engine.getMissionAnalytics = this.getMissionAnalytics.bind(engine);
        engine.calculateMissionDifficulty = this.calculateMissionDifficulty.bind(engine);
        engine.meetsRequirements = this.meetsRequirements.bind(engine);
        engine.isMissionUnlocked = this.isMissionUnlocked.bind(engine);
        engine.checkTurnInObjectives = this.checkTurnInObjectives.bind(engine);
        engine.consumeTurnInItems = this.consumeTurnInItems.bind(engine);

        // Subscribe to EventBus for automatic tracking
        this._subscribeToEvents(engine);

        console.log('✅ MissionSystem initialized');
    },

    /**
     * Subscribe to EventBus events for automatic objective tracking
     */
    _subscribeToEvents(engine) {
        // Clear any existing subscriptions
        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];

        // Combat events
        this._eventSubscriptions.push(
            EventBus.on('combat:enemyKilled', (data) => {
                this._handleCombatKill(engine, data);
            })
        );

        // Gathering/Harvest events
        this._eventSubscriptions.push(
            EventBus.on('gathering-success', (data) => {
                this._handleGatheringSuccess(engine, data);
            })
        );

        this._eventSubscriptions.push(
            EventBus.on('node-depleted', (data) => {
                this._handleNodeHarvested(engine, data);
            })
        );

        // Item events
        this._eventSubscriptions.push(
            EventBus.on('item-added', (data) => {
                this._handleItemAdded(engine, data);
            })
        );

        // Crafting events
        this._eventSubscriptions.push(
            EventBus.on('crafting-complete', (data) => {
                this._handleCraftingComplete(engine, data);
            })
        );

        // Skill events
        this._eventSubscriptions.push(
            EventBus.on('skill-level-up', (data) => {
                this._handleSkillLevelUp(engine, data);
            })
        );

        // Equipment events
        this._eventSubscriptions.push(
            EventBus.on('equipment-changed', (data) => {
                this._handleEquipmentChanged(engine, data);
            })
        );

        // Navigation events
        this._eventSubscriptions.push(
            EventBus.on('region-entered', (data) => {
                this._handleRegionEntered(engine, data);
            })
        );

        this._eventSubscriptions.push(
            EventBus.on('tile-moved', (data) => {
                this._handleTileMoved(engine, data);
            })
        );

        // Custom objective events (for manual triggering)
        this._eventSubscriptions.push(
            EventBus.on('mission:customObjective', (data) => {
                this._handleCustomObjective(engine, data);
            })
        );

        // Tab visit events (for UI tour objectives)
        this._eventSubscriptions.push(
            EventBus.on('tab-visited', (data) => {
                this._handleTabVisited(engine, data);
            })
        );

        console.log(`📡 MissionSystem subscribed to ${this._eventSubscriptions.length} EventBus events`);
    },

    /**
     * Handle combat kill event
     */
    _handleCombatKill(engine, data) {
        const { enemyId, enemy } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // KILL - specific enemy
                if (obj.type === 'kill' && obj.target === enemyId) {
                    engine.advanceObjective(missionId, objId, 1);
                }
                // KILL_TYPE - by armor type
                else if (obj.type === 'killType' && enemy?.armorType === obj.armorType) {
                    engine.advanceObjective(missionId, objId, 1);
                }
                // KILL_ANY - any enemy
                else if (obj.type === 'killAny') {
                    engine.advanceObjective(missionId, objId, 1);
                }
            }
        }
    },

    /**
     * Handle gathering success event
     * Supports both formats:
     * - { itemId, quantity } (legacy/direct)
     * - { rewards: [{ itemId, quantity }, ...] } (new format from GatheringSystem)
     */
    _handleGatheringSuccess(engine, data) {
        // Handle new format with rewards array
        if (data.rewards && Array.isArray(data.rewards)) {
            for (const reward of data.rewards) {
                const itemId = reward.itemId || reward.id;
                const quantity = reward.quantity || reward.amount || 1;
                if (itemId) {
                    this._processGatherObjectives(engine, itemId, quantity);
                }
            }
            return;
        }

        // Handle legacy format with direct itemId/quantity
        const { itemId, quantity } = data;
        if (itemId) {
            this._processGatherObjectives(engine, itemId, quantity || 1);
        }
    },

    /**
     * Handle node harvested/depleted event
     */
    _handleNodeHarvested(engine, data) {
        const { nodeId } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // HARVEST - specific node
                if (obj.type === 'harvest' && obj.target === nodeId) {
                    engine.advanceObjective(missionId, objId, 1);
                }
            }
        }
    },

    /**
     * Handle item added event
     */
    _handleItemAdded(engine, data) {
        const { itemId, quantity } = data;
        this._processGatherObjectives(engine, itemId, quantity || 1);
    },

    /**
     * Process gather objectives for an item
     */
    _processGatherObjectives(engine, itemId, quantity) {
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // GATHER - specific item
                if (obj.type === 'gather' && obj.target === itemId) {
                    engine.advanceObjective(missionId, objId, quantity);
                }
            }
        }
    },

    /**
     * Handle crafting complete event
     */
    _handleCraftingComplete(engine, data) {
        const { recipeId, itemId, skill, quantity } = data;
        const activeMissions = engine.state.missions.active;
        const craftedId = itemId || recipeId;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // CRAFT - specific item
                if (obj.type === 'craft' && obj.target === craftedId) {
                    engine.advanceObjective(missionId, objId, quantity || 1);
                }
                // CRAFT_SKILL - any item from skill
                else if (obj.type === 'craftSkill' && obj.skill === skill) {
                    engine.advanceObjective(missionId, objId, quantity || 1);
                }
            }
        }
    },

    /**
     * Handle skill level up event
     */
    _handleSkillLevelUp(engine, data) {
        const { skillId, newLevel } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // LEVEL_SKILL - reach skill level
                if (obj.type === 'levelSkill' && obj.skill === skillId) {
                    if (newLevel >= obj.level) {
                        // Set to required count to mark complete
                        obj.current = obj.count || 1;
                        obj.completed = true;
                        progress.completionTimes.push(Date.now());
                        console.log(`✅ Objective completed: ${skillId} reached level ${newLevel}`);

                        // Check mission completion
                        engine.checkObjectiveProgress(missionId);
                    }
                }
            }
        }
    },

    /**
     * Handle equipment changed event
     */
    _handleEquipmentChanged(engine, data) {
        const { itemId, slot } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // EQUIP - specific item or any item in slot
                if (obj.type === 'equip') {
                    const targetMatch = obj.target && obj.target === itemId;
                    const slotMatch = obj.slot && obj.slot === slot;

                    if (targetMatch || slotMatch) {
                        engine.advanceObjective(missionId, objId, 1);
                    }
                }
            }
        }
    },

    /**
     * Handle region entered event
     */
    _handleRegionEntered(engine, data) {
        const { regionId } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // EXPLORE - visit region
                if (obj.type === 'explore' && obj.target === regionId) {
                    engine.advanceObjective(missionId, objId, 1);
                }
            }
        }
    },

    /**
     * Handle tile moved event (for travel objectives)
     */
    _handleTileMoved(engine, data) {
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // TRAVEL - track distance
                if (obj.type === 'travel') {
                    engine.advanceObjective(missionId, objId, 1);
                }
            }
        }
    },

    /**
     * Handle custom objective event
     */
    _handleCustomObjective(engine, data) {
        const { key } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // CUSTOM - by key
                if (obj.type === 'custom' && obj.key === key) {
                    engine.advanceObjective(missionId, objId, 1);
                }
            }
        }
    },

    /**
     * Handle tab visited event (for UI tour objectives)
     */
    _handleTabVisited(engine, data) {
        const { tab } = data;
        const activeMissions = engine.state.missions.active;

        for (const missionId of activeMissions) {
            const progress = engine.state.missions.activeProgress[missionId];
            if (!progress) continue;

            // Get mission definition to look up objective details
            const mission = this._getMissionDef(missionId, engine);
            if (!mission) continue;

            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                if (obj.completed) continue;

                // VISIT_TAB - specific tab
                if (obj.type === 'visitTab') {
                    // Get tab from progress object or look up from mission definition
                    let objTab = obj.tab;
                    let objDef = null;
                    if (mission.objectives) {
                        objDef = mission.objectives.find(o => (o.id || `obj_${mission.objectives.indexOf(o) + 1}`) === objId);
                        if (!objTab) objTab = objDef?.tab;
                    }

                    if (objTab === tab) {
                        // Check if this is a turn-in/return objective
                        const isTurnIn = obj.isTurnIn || objDef?.isTurnIn ||
                            objId.startsWith('return_to_') || objId.includes('turn_in');

                        if (isTurnIn) {
                            // Turn-in objectives require all OTHER objectives to be complete first
                            const allOthersComplete = Object.entries(progress.objectives)
                                .filter(([id, o]) => id !== objId && !o.optional)
                                .every(([id, o]) => o.completed);

                            if (!allOthersComplete) {
                                // Don't advance - other objectives still incomplete
                                continue;
                            }
                        }

                        engine.advanceObjective(missionId, objId, 1);
                    }
                }
            }
        }
    },

    /**
     * Initialize mission system - set up available missions
     */
    initializeMissions() {
        console.log('🔄 Initializing missions...');

        // Ensure state structure exists
        if (!this.state.missions) {
            this.state.missions = {
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
        }

        this.updateAvailableMissions();
        console.log('✅ Missions initialized');
    },

    /**
     * Update which missions are available based on requirements
     */
    updateAvailableMissions() {
        const currentRegion = this.state.currentRegion;
        const missionsState = this.state.missions;

        // Get all mission definitions
        let missionDefs = {};

        // Get from MissionRegistry
        if (typeof MissionRegistry !== 'undefined') {
            missionDefs = { ...MissionRegistry.getAllActive() };
        }

        // Merge with definitions.missions
        if (this.definitions.missions) {
            missionDefs = { ...missionDefs, ...this.definitions.missions };
        }

        missionsState.available = [];

        for (const missionId in missionDefs) {
            const mission = missionDefs[missionId];
            if (!mission) continue;

            // Skip if already active
            if (missionsState.active.includes(missionId)) {
                continue;
            }

            // Skip if already completed and not repeatable
            const isRepeatable = mission.repeatable || mission.metadata?.repeatable;
            if (missionsState.completed.includes(missionId) && !isRepeatable) {
                continue;
            }

            // Check cooldown for repeatable missions
            if (isRepeatable && missionsState.cooldowns[missionId]) {
                const lastCompletion = missionsState.cooldowns[missionId];
                const cooldownMs = (mission.cooldown || mission.metadata?.cooldown || 0) * 1000;
                const timeSince = Date.now() - lastCompletion;
                if (timeSince < cooldownMs) {
                    continue; // Still on cooldown
                }
            }

            // Check region requirement
            const missionRegion = mission.region || mission.metadata?.region;
            if (missionRegion && missionRegion !== currentRegion) {
                continue;
            }

            // Check requirements
            const requirements = mission.requirements || {};
            if (!this.meetsRequirements(requirements)) {
                continue;
            }

            // Check mission unlock (chains)
            if (!this.isMissionUnlocked(missionId)) {
                continue;
            }

            missionsState.available.push(missionId);
        }

        // Emit event for UI update
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('missions:availableUpdated', {
                available: missionsState.available
            });
        }
    },

    /**
     * Check if a mission is unlocked (handles mission chains)
     */
    isMissionUnlocked(missionId) {
        const mission = MissionSystem._getMissionDef(missionId, this);
        if (!mission) return false;

        const requirements = mission.requirements || {};

        // Check required completed missions
        const requiredMissions = requirements.missions || requirements.completedMissions || [];
        if (requiredMissions.length === 0) {
            return true;
        }

        for (const requiredMission of requiredMissions) {
            if (!this.state.missions.completed.includes(requiredMission)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if player meets requirements
     */
    meetsRequirements(requirements) {
        if (!requirements) return true;

        // Check character level
        const reqLevel = requirements.level || requirements.characterLevel;
        if (reqLevel && this.state.characterLevel.level < reqLevel) {
            return false;
        }

        // Check skills
        if (requirements.skills) {
            for (const skillId in requirements.skills) {
                const requiredLevel = requirements.skills[skillId];
                const playerLevel = this.state.skills[skillId]?.level || 0;
                if (playerLevel < requiredLevel) {
                    return false;
                }
            }
        }

        // Check items (must have, not consumed)
        if (requirements.items) {
            const itemsArr = Array.isArray(requirements.items) ? requirements.items : Object.entries(requirements.items).map(([id, qty]) => ({ itemId: id, count: qty }));
            for (const item of itemsArr) {
                const itemId = item.itemId || item;
                const requiredAmount = item.count || requirements.items[itemId] || 1;
                const playerAmount = this.getItemCount(itemId);
                if (playerAmount < requiredAmount) {
                    return false;
                }
            }
        }

        // Check completed missions
        const requiredMissions = requirements.missions || requirements.completedMissions || [];
        for (const requiredMission of requiredMissions) {
            if (!this.state.missions.completed.includes(requiredMission)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if player can start a mission
     */
    canStartMission(missionId) {
        const mission = MissionSystem._getMissionDef(missionId, this);
        if (!mission) {
            return { canStart: false, reason: "Mission not found" };
        }

        // Check if already active
        if (this.state.missions.active.includes(missionId)) {
            return { canStart: false, reason: "Already active" };
        }

        // Check if already completed and not repeatable
        const isRepeatable = mission.repeatable || mission.metadata?.repeatable;
        if (this.state.missions.completed.includes(missionId) && !isRepeatable) {
            return { canStart: false, reason: "Already completed" };
        }

        // Check cooldown
        if (isRepeatable && this.state.missions.cooldowns[missionId]) {
            const lastCompletion = this.state.missions.cooldowns[missionId];
            const cooldownMs = (mission.cooldown || mission.metadata?.cooldown || 0) * 1000;
            const cooldownRemaining = cooldownMs - (Date.now() - lastCompletion);

            if (cooldownRemaining > 0) {
                const hours = Math.floor(cooldownRemaining / 3600000);
                const minutes = Math.floor((cooldownRemaining % 3600000) / 60000);
                return {
                    canStart: false,
                    reason: `On cooldown (${hours}h ${minutes}m remaining)`
                };
            }
        }

        // Check region
        const missionRegion = mission.region || mission.metadata?.region;
        if (missionRegion && missionRegion !== this.state.currentRegion) {
            const regionDef = this.definitions.worldMap?.[missionRegion];
            const regionName = regionDef?.name || missionRegion;
            return { canStart: false, reason: `Must be in ${regionName}` };
        }

        // Check requirements
        const requirements = mission.requirements || {};
        if (!this.meetsRequirements(requirements)) {
            return this._buildRequirementFailureReason(requirements);
        }

        return { canStart: true };
    },

    /**
     * Build detailed requirement failure reason
     */
    _buildRequirementFailureReason(requirements) {
        const reqLevel = requirements.level || requirements.characterLevel;
        if (reqLevel && this.state.characterLevel.level < reqLevel) {
            return { canStart: false, reason: `Requires character level ${reqLevel}` };
        }

        if (requirements.skills) {
            for (const skillId in requirements.skills) {
                const requiredLevel = requirements.skills[skillId];
                const playerLevel = this.state.skills[skillId]?.level || 0;
                if (playerLevel < requiredLevel) {
                    const skillName = this.definitions.skills?.[skillId]?.name || skillId;
                    return { canStart: false, reason: `Requires ${skillName} level ${requiredLevel}` };
                }
            }
        }

        const requiredMissions = requirements.missions || requirements.completedMissions || [];
        for (const requiredMission of requiredMissions) {
            if (!this.state.missions.completed.includes(requiredMission)) {
                const reqMissionDef = MissionSystem._getMissionDef(requiredMission, this);
                return {
                    canStart: false,
                    reason: `Requires completion of: ${reqMissionDef?.name || requiredMission}`
                };
            }
        }

        return { canStart: false, reason: "Requirements not met" };
    },

    /**
     * Start a mission
     */
    startMission(missionId) {
        const checkResult = this.canStartMission(missionId);
        if (!checkResult.canStart) {
            return { success: false, reason: checkResult.reason };
        }

        const mission = MissionSystem._getMissionDef(missionId, this);

        // Add to active missions
        this.state.missions.active.push(missionId);

        // Initialize progress tracking
        const progress = {
            objectives: {},
            startTime: Date.now(),
            completionTimes: []
        };

        // Initialize each objective
        const objectives = mission.objectives || [];
        objectives.forEach((objective, index) => {
            const objId = objective.id || `obj_${index + 1}`;
            progress.objectives[objId] = {
                current: 0,
                required: objective.count || objective.required || 1,
                type: objective.type,
                target: objective.target,
                skill: objective.skill,
                slot: objective.slot,
                level: objective.level,
                armorType: objective.armorType,
                key: objective.key,
                items: objective.items,
                tab: objective.tab,  // For visitTab objectives
                optional: objective.optional || false,
                hidden: objective.hidden || false,
                isTurnIn: objective.isTurnIn || false,  // For turn-in objectives
                completed: false
            };
        });

        this.state.missions.activeProgress[missionId] = progress;

        // Update analytics
        if (!this.state.missions.analytics.byMission[missionId]) {
            this.state.missions.analytics.byMission[missionId] = {
                started: 0,
                completed: 0,
                abandoned: 0,
                avgTime: 0,
                fastestTime: null
            };
        }
        this.state.missions.analytics.byMission[missionId].started++;
        this.state.missions.analytics.totalStarted++;

        console.log(`📋 Started mission: ${mission.name}`);

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('mission:started', {
                missionId,
                mission,
                progress
            });
        }

        return { success: true, mission, progress };
    },

    /**
     * Get mission progress
     */
    getMissionProgress(missionId) {
        return this.state.missions.activeProgress[missionId] || null;
    },

    /**
     * Advance a mission objective
     */
    advanceObjective(missionId, objectiveId, amount = 1) {
        const progress = this.state.missions.activeProgress[missionId];
        if (!progress) {
            return { success: false, reason: "Mission not active" };
        }

        const objective = progress.objectives[objectiveId];
        if (!objective) {
            return { success: false, reason: "Objective not found" };
        }

        if (objective.completed) {
            return { success: false, reason: "Objective already completed" };
        }

        // Update progress
        const previousCurrent = objective.current;
        objective.current = Math.min(objective.current + amount, objective.required);

        // Check if objective completed
        if (objective.current >= objective.required && !objective.completed) {
            objective.completed = true;
            progress.completionTimes.push(Date.now());
            console.log(`✅ Completed objective: ${objectiveId}`);

            // Show notification for objective completion
            const mission = MissionSystem._getMissionDef(missionId, this);
            const objDef = mission?.objectives?.find(o => (o.id || `obj_${mission.objectives.indexOf(o) + 1}`) === objectiveId);
            const objDescription = objDef?.description || objectiveId;
            if (typeof Animations !== 'undefined') {
                Animations.showNotification(`✅ ${objDescription}`, 'success', 2500);
            }

            // Emit objective complete event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('mission:objectiveCompleted', {
                    missionId,
                    objectiveId,
                    objective
                });
            }
        }

        // Emit progress event (only if actually changed)
        if (objective.current !== previousCurrent && typeof EventBus !== 'undefined') {
            EventBus.emit('mission:objectiveProgress', {
                missionId,
                objectiveId,
                current: objective.current,
                required: objective.required,
                completed: objective.completed
            });
        }

        // Check overall mission progress
        this.checkObjectiveProgress(missionId);

        return {
            success: true,
            objectiveCompleted: objective.completed,
            progress: objective.current,
            required: objective.required
        };
    },

    /**
     * Check if all required objectives are complete
     */
    checkObjectiveProgress(missionId) {
        const progress = this.state.missions.activeProgress[missionId];
        if (!progress) return false;

        const allRequiredComplete = Object.values(progress.objectives)
            .filter(obj => !obj.optional)
            .every(obj => obj.completed);

        if (allRequiredComplete) {
            // Check for turn-in objectives before auto-completing
            const hasTurnIn = Object.values(progress.objectives)
                .some(obj => obj.type === 'turnIn' || obj.type === 'turnInSet' || obj.isTurnIn);

            // Also check mission metadata for requiresTurnIn flag
            const mission = MissionSystem._getMissionDef(missionId, this);
            const requiresTurnIn = mission?.metadata?.requiresTurnIn === true;

            if (hasTurnIn || requiresTurnIn) {
                // Don't auto-complete - player must manually submit via Missions tab
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('mission:readyToSubmit', { missionId });
                }
            } else {
                // Auto-complete missions without turn-in objectives
                this.completeMission(missionId);
            }
        }

        return allRequiredComplete;
    },

    /**
     * Check if turn-in objectives can be satisfied
     */
    checkTurnInObjectives(missionId) {
        const progress = this.state.missions.activeProgress[missionId];
        if (!progress) return { canSubmit: false, reason: "Mission not active" };

        const mission = MissionSystem._getMissionDef(missionId, this);
        if (!mission) return { canSubmit: false, reason: "Mission not found" };

        for (const objId in progress.objectives) {
            const obj = progress.objectives[objId];

            if (obj.type === 'turnIn') {
                const itemCount = this.getItemCount(obj.target);
                if (itemCount < obj.required) {
                    const itemDef = MissionSystem._getItemDef(obj.target, this);
                    return {
                        canSubmit: false,
                        reason: `Need ${obj.required - itemCount} more ${itemDef?.name || obj.target}`
                    };
                }
            } else if (obj.type === 'turnInSet' && obj.items) {
                for (const item of obj.items) {
                    const itemCount = this.getItemCount(item.itemId);
                    if (itemCount < item.count) {
                        const itemDef = MissionSystem._getItemDef(item.itemId, this);
                        return {
                            canSubmit: false,
                            reason: `Need ${item.count - itemCount} more ${itemDef?.name || item.itemId}`
                        };
                    }
                }
            }
        }

        return { canSubmit: true };
    },

    /**
     * Consume items for turn-in objectives
     */
    consumeTurnInItems(missionId) {
        const progress = this.state.missions.activeProgress[missionId];
        if (!progress) return { success: false };

        for (const objId in progress.objectives) {
            const obj = progress.objectives[objId];

            if (obj.type === 'turnIn') {
                this.removeItemFromBank(obj.target, obj.required);
            } else if (obj.type === 'turnInSet' && obj.items) {
                for (const item of obj.items) {
                    this.removeItemFromBank(item.itemId, item.count);
                }
            }
        }

        return { success: true };
    },

    /**
     * Submit a mission (for turn-in type missions or missions requiring return to missions tab)
     */
    submitMission(missionId) {
        const mission = MissionSystem._getMissionDef(missionId, this);
        if (!mission) {
            return { success: false, reason: "Mission not found" };
        }

        const progress = this.state.missions.activeProgress[missionId];
        if (!progress) {
            return { success: false, reason: "Mission not active" };
        }

        // Check if all objectives are complete
        const allComplete = Object.values(progress.objectives).every(obj => obj.completed);
        if (!allComplete) {
            return { success: false, reason: "Not all objectives completed" };
        }

        // Check for item turn-in requirements
        const hasItemTurnIn = mission.objectives?.some(obj =>
            obj.type === 'turnIn' || obj.type === 'turnInSet'
        );

        if (hasItemTurnIn) {
            const turnInCheck = this.checkTurnInObjectives(missionId);
            if (!turnInCheck.canSubmit) {
                return { success: false, reason: turnInCheck.reason };
            }
            // Consume turn-in items
            this.consumeTurnInItems(missionId);
        }

        // Complete the mission
        return this.completeMission(missionId);
    },

    /**
     * Complete a mission and grant rewards
     */
    completeMission(missionId) {
        const mission = MissionSystem._getMissionDef(missionId, this);
        if (!mission) {
            return { success: false, reason: "Mission not found" };
        }

        const progress = this.state.missions.activeProgress[missionId];
        if (!progress) {
            return { success: false, reason: "Mission not active" };
        }

        // Calculate completion time
        const completionTime = Date.now() - progress.startTime;
        const completionSeconds = Math.floor(completionTime / 1000);

        // Remove from active
        const activeIndex = this.state.missions.active.indexOf(missionId);
        if (activeIndex > -1) {
            this.state.missions.active.splice(activeIndex, 1);
        }

        // Add to completed
        const isRepeatable = mission.repeatable || mission.metadata?.repeatable;
        if (!isRepeatable && !this.state.missions.completed.includes(missionId)) {
            this.state.missions.completed.push(missionId);
        }

        // Set cooldown for repeatable missions
        if (isRepeatable) {
            this.state.missions.cooldowns[missionId] = Date.now();
        }

        // Update analytics
        const analytics = this.state.missions.analytics.byMission[missionId];
        if (analytics) {
            analytics.completed++;
            const totalCompleted = analytics.completed;
            analytics.avgTime = ((analytics.avgTime * (totalCompleted - 1)) + completionSeconds) / totalCompleted;
            if (!analytics.fastestTime || completionSeconds < analytics.fastestTime) {
                analytics.fastestTime = completionSeconds;
            }
        }
        this.state.missions.analytics.totalCompleted++;

        // Grant rewards
        const grantedRewards = this.grantMissionRewards(mission, completionSeconds);

        // Clear progress
        delete this.state.missions.activeProgress[missionId];

        console.log(`✅ Completed mission: ${mission.name} (${completionSeconds}s)`);

        // Show mission completion notification with reward summary
        if (typeof Animations !== 'undefined') {
            const rewardParts = [];
            if (grantedRewards.gold > 0) rewardParts.push(`💰 ${grantedRewards.gold}`);
            if (grantedRewards.experience > 0) rewardParts.push(`✨ ${grantedRewards.experience} XP`);
            if (grantedRewards.items.length > 0) rewardParts.push(`🎁 ${grantedRewards.items.length} items`);
            const rewardText = rewardParts.length > 0 ? ` | ${rewardParts.join(' ')}` : '';
            Animations.showNotification(`🏆 Mission Complete: ${mission.name}${rewardText}`, 'success', 4000);
        }

        // Emit completion event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('mission:completed', {
                missionId,
                mission,
                rewards: grantedRewards,
                completionTime: completionSeconds
            });
        }

        // Update available missions
        this.updateAvailableMissions();

        return { success: true, rewards: grantedRewards, completionTime: completionSeconds };
    },

    /**
     * Grant mission rewards
     */
    grantMissionRewards(mission, completionSeconds) {
        const rewards = mission.rewards || {};
        const granted = { experience: 0, gold: 0, items: [], skills: {} };

        // Handle character XP (supports both 'experience' and 'characterXP' field names)
        const charXP = rewards.experience || rewards.characterXP || 0;
        if (charXP > 0) {
            // Grant character XP (contributes to character level)
            if (this.state.characterLevel) {
                const prevLevel = this.state.characterLevel.level;
                this.state.characterLevel.exp = (this.state.characterLevel.exp || 0) + charXP;

                // Check for level up (using XP curve: 100 * level^1.5)
                let xpForNextLevel = Math.floor(100 * Math.pow(this.state.characterLevel.level, 1.5));
                while (this.state.characterLevel.exp >= xpForNextLevel) {
                    this.state.characterLevel.level++;
                    this.state.characterLevel.exp -= xpForNextLevel;
                    this.state.characterLevel.unassignedAttributePoints = (this.state.characterLevel.unassignedAttributePoints || 0) + 1;
                    console.log(`🎉 Character level up! Now level ${this.state.characterLevel.level}`);

                    // Emit level up event
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('character:levelUp', {
                            newLevel: this.state.characterLevel.level,
                            attributePoints: this.state.characterLevel.unassignedAttributePoints
                        });
                    }

                    // Recalculate XP needed for next level
                    xpForNextLevel = Math.floor(100 * Math.pow(this.state.characterLevel.level, 1.5));
                }

                if (this.state.characterLevel.level > prevLevel && typeof Animations !== 'undefined') {
                    Animations.showNotification(`🎉 Level Up! Now level ${this.state.characterLevel.level}`, 'success', 3000);
                }
            }
            granted.experience = charXP;
            console.log(`✨ +${charXP} Character XP`);
        }

        if (rewards.gold) {
            this.state.currencies.gold = (this.state.currencies.gold || 0) + rewards.gold;
            granted.gold = rewards.gold;
            console.log(`💰 +${rewards.gold} gold`);
        }

        if (rewards.items) {
            for (const itemReward of rewards.items) {
                const itemId = itemReward.itemId || itemReward.id;
                const quantity = itemReward.quantity || itemReward.amount || 1;
                const itemDef = MissionSystem._getItemDef(itemId, this);

                // Check if item is instanced (equipment)
                if (itemDef?.instanced && this.createEquipmentInstance && this.addEquipmentInstance) {
                    // Create instances for instanced items
                    for (let i = 0; i < quantity; i++) {
                        const rarity = itemReward.rarity || itemDef.rarity || 'common';
                        const stats = this.rollItemStats ? this.rollItemStats(itemDef, rarity) : {};
                        const instance = this.createEquipmentInstance(itemId, rarity, stats);
                        this.addEquipmentInstance(instance);
                    }
                } else {
                    // Add stackable items normally
                    this.addItemToBank(itemId, quantity);
                }

                granted.items.push({ itemId, quantity });
                console.log(`🎁 +${quantity}x ${itemDef?.name || itemId}`);
            }
        }

        if (rewards.skills) {
            for (const skillId in rewards.skills) {
                const xpAmount = rewards.skills[skillId];
                this.gainSkillExp(skillId, xpAmount);
                granted.skills[skillId] = xpAmount;
                console.log(`✨ +${xpAmount} ${skillId} XP`);
            }
        }

        // Handle legacy reward format (base/bonus structure)
        if (rewards.base) {
            if (rewards.base.exp) {
                for (const skillId in rewards.base.exp) {
                    const expAmount = rewards.base.exp[skillId];
                    this.gainSkillExp(skillId, expAmount);
                    granted.skills[skillId] = (granted.skills[skillId] || 0) + expAmount;
                    console.log(`✨ +${expAmount} ${skillId} XP`);
                }
            }

            if (rewards.base.currencies) {
                for (const currencyId in rewards.base.currencies) {
                    const amount = rewards.base.currencies[currencyId];
                    this.state.currencies[currencyId] = (this.state.currencies[currencyId] || 0) + amount;
                    if (currencyId === 'gold') granted.gold += amount;
                    console.log(`💰 +${amount} ${currencyId}`);
                }
            }

            if (rewards.base.items) {
                for (const itemReward of rewards.base.items) {
                    const itemId = itemReward.itemId || itemReward.id;
                    const quantity = itemReward.amount || itemReward.quantity || 1;
                    const itemDef = MissionSystem._getItemDef(itemId, this);

                    // Check if item is instanced (equipment)
                    if (itemDef?.instanced && this.createEquipmentInstance && this.addEquipmentInstance) {
                        for (let i = 0; i < quantity; i++) {
                            const rarity = itemReward.rarity || itemDef.rarity || 'common';
                            const stats = this.rollItemStats ? this.rollItemStats(itemDef, rarity) : {};
                            const instance = this.createEquipmentInstance(itemId, rarity, stats);
                            this.addEquipmentInstance(instance);
                        }
                    } else {
                        this.addItemToBank(itemId, quantity);
                    }

                    granted.items.push({ itemId, quantity });
                }
            }
        }

        return granted;
    },

    /**
     * Abandon a mission
     */
    abandonMission(missionId) {
        const activeIndex = this.state.missions.active.indexOf(missionId);
        if (activeIndex === -1) {
            return { success: false, reason: "Mission not active" };
        }

        // Remove from active
        this.state.missions.active.splice(activeIndex, 1);

        // Clear progress
        delete this.state.missions.activeProgress[missionId];

        // Update analytics
        const analytics = this.state.missions.analytics.byMission[missionId];
        if (analytics) {
            analytics.abandoned++;
        }
        this.state.missions.analytics.totalAbandoned++;

        const abandonedMission = MissionSystem._getMissionDef(missionId, this);
        console.log(`❌ Abandoned mission: ${abandonedMission?.name || missionId}`);

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('mission:abandoned', { missionId });
        }

        // Update available missions
        this.updateAvailableMissions();

        return { success: true };
    },

    /**
     * Get mission analytics
     */
    getMissionAnalytics(missionId) {
        if (missionId) {
            return this.state.missions.analytics.byMission[missionId] || null;
        }
        return this.state.missions.analytics;
    },

    /**
     * Calculate mission difficulty score (1-10)
     */
    calculateMissionDifficulty(missionId) {
        const mission = MissionSystem._getMissionDef(missionId, this);
        if (!mission) return 0;

        // Use explicit difficulty if set
        const explicitDiff = mission.difficulty || mission.metadata?.difficulty;
        if (typeof explicitDiff === 'number') return explicitDiff;

        // Map difficulty strings to numbers
        const difficultyMap = {
            'trivial': 1,
            'easy': 2,
            'normal': 5,
            'hard': 7,
            'expert': 9,
            'legendary': 10
        };
        if (difficultyMap[explicitDiff]) return difficultyMap[explicitDiff];

        // Auto-calculate based on objectives
        const objectives = mission.objectives || [];
        if (objectives.length === 0) return 1;

        let difficultyScore = 0;
        const typeDifficulty = {
            'talk': 1,
            'explore': 2,
            'gather': 2,
            'harvest': 3,
            'collect': 3,
            'craft': 4,
            'craftSkill': 4,
            'turnIn': 3,
            'turnInSet': 4,
            'equip': 2,
            'levelSkill': 5,
            'levelChar': 5,
            'kill': 5,
            'killType': 6,
            'killAny': 4,
            'custom': 3
        };

        for (const objective of objectives) {
            const baseScore = typeDifficulty[objective.type] || 3;
            const count = objective.count || objective.required || 1;
            const scaledScore = baseScore * (1 + Math.log10(Math.max(1, count)));
            difficultyScore += scaledScore;
        }

        // Normalize to 1-10 scale
        return Math.min(10, Math.max(1, Math.round(difficultyScore / 2)));
    }
};
