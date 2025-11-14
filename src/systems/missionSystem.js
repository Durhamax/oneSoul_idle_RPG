/**
 * MISSION SYSTEM - Enhanced Flexible Version
 *
 * Supports multiple objective types, progress tracking, chains, cooldowns, and analytics
 * Objective types: talk, kill, collect, skill, craft, donate, explore
 */

const MissionSystem = {
    /**
     * Initialize mission system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all mission functions to engine
        engine.initializeMissions = this.initializeMissions.bind(engine);
        engine.updateAvailableMissions = this.updateAvailableMissions.bind(engine);
        engine.canStartMission = this.canStartMission.bind(engine);
        engine.startMission = this.startMission.bind(engine);
        engine.completeMission = this.completeMission.bind(engine);
        engine.grantMissionRewards = this.grantMissionRewards.bind(engine);
        engine.abandonMission = this.abandonMission.bind(engine);
        engine.getMissionProgress = this.getMissionProgress.bind(engine);
        engine.advanceObjective = this.advanceObjective.bind(engine);
        engine.checkMissionObjectives = this.checkMissionObjectives.bind(engine);
        engine.getMissionAnalytics = this.getMissionAnalytics.bind(engine);
        engine.calculateMissionDifficulty = this.calculateMissionDifficulty.bind(engine);
        engine.meetsRequirements = this.meetsRequirements.bind(engine);
        engine.isMissionUnlocked = this.isMissionUnlocked.bind(engine);
    },

    /**
     * Initialize mission system - set up available missions
     */
    initializeMissions() {
        console.log('🔄 Initializing mission system...');
        this.updateAvailableMissions();
        console.log('✅ Mission system initialized');
    },

    /**
     * Update which missions are available based on current region, requirements, and chains
     */
    updateAvailableMissions() {
        const currentRegion = this.state.currentRegion;
        const missionsState = this.state.missions;
        const missionDefs = this.definitions.missions;

        missionsState.available = [];

        for (let missionId in missionDefs) {
            const mission = missionDefs[missionId];

            // Skip if already active
            if (missionsState.active.includes(missionId)) {
                continue;
            }

            // Skip if already completed and not repeatable
            if (missionsState.completed.includes(missionId) && !mission.metadata.repeatable) {
                continue;
            }

            // Check cooldown for repeatable missions
            if (mission.metadata.repeatable && missionsState.cooldowns[missionId]) {
                const lastCompletion = missionsState.cooldowns[missionId];
                const timeSince = Date.now() - lastCompletion;
                if (timeSince < mission.metadata.cooldown * 1000) {
                    continue; // Still on cooldown
                }
            }

            // Check region requirement
            if (mission.metadata.region && mission.metadata.region !== currentRegion) {
                continue;
            }

            // Check if requirements are met
            if (!this.meetsRequirements(mission.requirements)) {
                continue;
            }

            // Check if unlocked (via mission chains)
            if (!this.isMissionUnlocked(missionId)) {
                continue;
            }

            missionsState.available.push(missionId);
        }
    },

    /**
     * Check if a mission is unlocked (handles mission chains)
     */
    isMissionUnlocked(missionId) {
        const mission = this.definitions.missions[missionId];
        if (!mission) return false;

        // If no required completed missions, it's unlocked
        if (!mission.requirements.completedMissions || mission.requirements.completedMissions.length === 0) {
            return true;
        }

        // Check if all required missions are completed
        for (let requiredMission of mission.requirements.completedMissions) {
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
        // Check character level
        if (requirements.characterLevel && this.state.characterLevel.level < requirements.characterLevel) {
            return false;
        }

        // Check skills
        if (requirements.skills) {
            for (let skillId in requirements.skills) {
                const requiredLevel = requirements.skills[skillId];
                const playerLevel = this.state.skills[skillId]?.level || 0;
                if (playerLevel < requiredLevel) {
                    return false;
                }
            }
        }

        // Check items
        if (requirements.items) {
            for (let itemId in requirements.items) {
                const requiredAmount = requirements.items[itemId];
                const playerAmount = this.getItemCount(itemId);
                if (playerAmount < requiredAmount) {
                    return false;
                }
            }
        }

        // Check completed missions
        if (requirements.completedMissions) {
            for (let requiredMission of requirements.completedMissions) {
                if (!this.state.missions.completed.includes(requiredMission)) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Check if player can start a mission
     */
    canStartMission(missionId) {
        const mission = this.definitions.missions[missionId];
        if (!mission) {
            return { canStart: false, reason: "Mission not found" };
        }

        // Check if already active
        if (this.state.missions.active.includes(missionId)) {
            return { canStart: false, reason: "Already active" };
        }

        // Check if already completed and not repeatable
        if (this.state.missions.completed.includes(missionId) && !mission.metadata.repeatable) {
            return { canStart: false, reason: "Already completed" };
        }

        // Check cooldown
        if (mission.metadata.repeatable && this.state.missions.cooldowns[missionId]) {
            const lastCompletion = this.state.missions.cooldowns[missionId];
            const timeSince = Date.now() - lastCompletion;
            const cooldownRemaining = mission.metadata.cooldown * 1000 - timeSince;

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
        if (mission.metadata.region && mission.metadata.region !== this.state.currentRegion) {
            const regionDef = this.definitions.worldMap[mission.metadata.region];
            const regionName = regionDef?.name || mission.metadata.region;
            return { canStart: false, reason: `Must be in ${regionName}` };
        }

        // Check requirements
        if (!this.meetsRequirements(mission.requirements)) {
            // Build detailed reason
            const reqs = mission.requirements;

            if (reqs.characterLevel && this.state.characterLevel.level < reqs.characterLevel) {
                return { canStart: false, reason: `Requires character level ${reqs.characterLevel}` };
            }

            if (reqs.skills) {
                for (let skillId in reqs.skills) {
                    const requiredLevel = reqs.skills[skillId];
                    const playerLevel = this.state.skills[skillId]?.level || 0;
                    if (playerLevel < requiredLevel) {
                        const skillName = this.definitions.skills[skillId]?.name || skillId;
                        return { canStart: false, reason: `Requires ${skillName} level ${requiredLevel}` };
                    }
                }
            }

            if (reqs.items) {
                for (let itemId in reqs.items) {
                    const requiredAmount = reqs.items[itemId];
                    const playerAmount = this.getItemCount(itemId);
                    if (playerAmount < requiredAmount) {
                        const itemDef = this.definitions.items[itemId];
                        return {
                            canStart: false,
                            reason: `Requires ${requiredAmount}x ${itemDef?.name || itemId}`
                        };
                    }
                }
            }

            if (reqs.completedMissions) {
                for (let requiredMission of reqs.completedMissions) {
                    if (!this.state.missions.completed.includes(requiredMission)) {
                        const reqMissionDef = this.definitions.missions[requiredMission];
                        return {
                            canStart: false,
                            reason: `Requires completion of: ${reqMissionDef?.name || requiredMission}`
                        };
                    }
                }
            }
        }

        return { canStart: true };
    },

    /**
     * Start a mission
     */
    startMission(missionId) {
        const checkResult = this.canStartMission(missionId);
        if (!checkResult.canStart) {
            return { success: false, reason: checkResult.reason };
        }

        const mission = this.definitions.missions[missionId];

        // Add to active missions
        this.state.missions.active.push(missionId);

        // Initialize progress tracking
        const progress = {
            objectives: {},
            startTime: Date.now(),
            completionTimes: []  // Track when objectives are completed
        };

        // Initialize each objective
        for (let objective of mission.objectives) {
            progress.objectives[objective.id] = {
                current: 0,
                required: objective.required,
                type: objective.type,
                target: objective.target,
                completed: false
            };
        }

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
        return { success: true };
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
        objective.current = Math.min(objective.current + amount, objective.required);

        // Check if objective completed
        if (objective.current >= objective.required && !objective.completed) {
            objective.completed = true;
            progress.completionTimes.push(Date.now());
            console.log(`✅ Completed objective: ${objectiveId}`);
        }

        // Check if all objectives complete
        const allComplete = Object.values(progress.objectives).every(obj => obj.completed);

        if (allComplete) {
            this.completeMission(missionId);
        }

        return {
            success: true,
            objectiveCompleted: objective.completed,
            missionComplete: allComplete,
            progress: objective.current,
            required: objective.required
        };
    },

    /**
     * Check and update mission objectives based on game events
     * Called automatically by other systems
     */
    checkMissionObjectives(eventType, data) {
        const activeMissions = this.state.missions.active;

        for (let missionId of activeMissions) {
            const progress = this.state.missions.activeProgress[missionId];
            if (!progress) continue;

            for (let objId in progress.objectives) {
                const objective = progress.objectives[objId];
                if (objective.completed) continue;

                // Match objective type to event type
                switch (objective.type) {
                    case 'collect':
                        if (eventType === 'item_gained' && data.itemId === objective.target) {
                            this.advanceObjective(missionId, objId, data.amount);
                        }
                        break;

                    case 'kill':
                        if (eventType === 'enemy_killed' && data.enemyId === objective.target) {
                            this.advanceObjective(missionId, objId, 1);
                        }
                        break;

                    case 'skill':
                        if (eventType === 'skill_action' && data.skillId === objective.target) {
                            this.advanceObjective(missionId, objId, 1);
                        }
                        break;

                    case 'craft':
                        if (eventType === 'item_crafted' && data.itemId === objective.target) {
                            this.advanceObjective(missionId, objId, data.amount);
                        }
                        break;

                    case 'explore':
                        if (eventType === 'station_discovered' && data.stationId === objective.target) {
                            this.advanceObjective(missionId, objId, 1);
                        }
                        break;

                    case 'donate':
                        if (eventType === 'item_donated' && data.itemId === objective.target) {
                            this.advanceObjective(missionId, objId, data.amount);
                        }
                        break;
                }
            }
        }
    },

    /**
     * Complete a mission and grant rewards
     */
    completeMission(missionId) {
        const mission = this.definitions.missions[missionId];
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

        // Add to completed (if not repeatable, it stays forever)
        if (!mission.metadata.repeatable && !this.state.missions.completed.includes(missionId)) {
            this.state.missions.completed.push(missionId);
        }

        // Set cooldown for repeatable missions
        if (mission.metadata.repeatable) {
            this.state.missions.cooldowns[missionId] = Date.now();
        }

        // Update analytics
        const analytics = this.state.missions.analytics.byMission[missionId];
        if (analytics) {
            analytics.completed++;

            // Update average time
            const totalCompleted = analytics.completed;
            analytics.avgTime = ((analytics.avgTime * (totalCompleted - 1)) + completionSeconds) / totalCompleted;

            // Update fastest time
            if (!analytics.fastestTime || completionSeconds < analytics.fastestTime) {
                analytics.fastestTime = completionSeconds;
            }
        }
        this.state.missions.analytics.totalCompleted++;

        // Grant rewards
        const grantedRewards = this.grantMissionRewards(mission, completionSeconds);

        // Clear progress
        delete this.state.missions.activeProgress[missionId];

        // Unlock chained missions
        if (mission.metadata.unlocks && mission.metadata.unlocks.length > 0) {
            console.log(`🔓 Unlocked missions: ${mission.metadata.unlocks.join(', ')}`);
        }

        console.log(`✅ Completed mission: ${mission.name} (${completionSeconds}s)`);

        // Update available missions
        this.updateAvailableMissions();

        return { success: true, rewards: grantedRewards, completionTime: completionSeconds };
    },

    /**
     * Grant mission rewards (base + bonus if applicable)
     */
    grantMissionRewards(mission, completionSeconds) {
        const rewards = mission.rewards;
        const granted = { exp: {}, items: [], currencies: {} };

        // Grant base rewards
        if (rewards.base) {
            // Experience
            if (rewards.base.exp) {
                for (let skillId in rewards.base.exp) {
                    const expAmount = rewards.base.exp[skillId];
                    this.gainSkillExp(skillId, expAmount);
                    granted.exp[skillId] = (granted.exp[skillId] || 0) + expAmount;
                    console.log(`✨ +${expAmount} ${skillId} XP`);
                }
            }

            // Currencies
            if (rewards.base.currencies) {
                for (let currencyId in rewards.base.currencies) {
                    const amount = rewards.base.currencies[currencyId];
                    this.state.currencies[currencyId] = (this.state.currencies[currencyId] || 0) + amount;
                    granted.currencies[currencyId] = (granted.currencies[currencyId] || 0) + amount;
                    console.log(`💰 +${amount} ${currencyId}`);
                }
            }

            // Items
            if (rewards.base.items) {
                for (let itemReward of rewards.base.items) {
                    this.addItemToBank(itemReward.itemId, itemReward.amount);
                    granted.items.push(itemReward);
                    const itemDef = this.definitions.items[itemReward.itemId];
                    console.log(`🎁 +${itemReward.amount}x ${itemDef?.name || itemReward.itemId}`);
                }
            }
        }

        // Check for bonus rewards
        if (rewards.bonus) {
            let bonusEarned = false;

            // Check bonus condition
            if (rewards.bonus.condition) {
                const condition = rewards.bonus.condition;

                // Parse condition (e.g., "time_under_60")
                if (condition.startsWith('time_under_')) {
                    const timeLimit = parseInt(condition.replace('time_under_', ''));
                    if (completionSeconds < timeLimit) {
                        bonusEarned = true;
                    }
                }
            }

            // Grant bonus if earned
            if (bonusEarned) {
                console.log(`🎉 Bonus reward earned!`);

                if (rewards.bonus.exp) {
                    for (let skillId in rewards.bonus.exp) {
                        const expAmount = rewards.bonus.exp[skillId];
                        this.gainSkillExp(skillId, expAmount);
                        granted.exp[skillId] = (granted.exp[skillId] || 0) + expAmount;
                        console.log(`✨ BONUS +${expAmount} ${skillId} XP`);
                    }
                }

                if (rewards.bonus.currencies) {
                    for (let currencyId in rewards.bonus.currencies) {
                        const amount = rewards.bonus.currencies[currencyId];
                        this.state.currencies[currencyId] = (this.state.currencies[currencyId] || 0) + amount;
                        granted.currencies[currencyId] = (granted.currencies[currencyId] || 0) + amount;
                        console.log(`💰 BONUS +${amount} ${currencyId}`);
                    }
                }

                if (rewards.bonus.items) {
                    for (let itemReward of rewards.bonus.items) {
                        this.addItemToBank(itemReward.itemId, itemReward.amount);
                        granted.items.push(itemReward);
                        const itemDef = this.definitions.items[itemReward.itemId];
                        console.log(`🎁 BONUS +${itemReward.amount}x ${itemDef?.name || itemReward.itemId}`);
                    }
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

        console.log(`❌ Abandoned mission: ${this.definitions.missions[missionId]?.name || missionId}`);

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
        const mission = this.definitions.missions[missionId];
        if (!mission) return 0;

        // If difficulty is already set, use it
        if (mission.metadata.difficulty) {
            return mission.metadata.difficulty;
        }

        // Auto-calculate based on objectives
        let difficultyScore = 0;

        for (let objective of mission.objectives) {
            // Base difficulty per objective type
            const typeDifficulty = {
                'talk': 1,
                'explore': 2,
                'collect': 3,
                'skill': 3,
                'craft': 4,
                'donate': 4,
                'kill': 5
            };

            const baseScore = typeDifficulty[objective.type] || 3;

            // Scale by required amount
            const scaledScore = baseScore * (1 + Math.log10(objective.required));

            difficultyScore += scaledScore;
        }

        // Normalize to 1-10 scale
        difficultyScore = Math.min(10, Math.max(1, Math.round(difficultyScore / 2)));

        return difficultyScore;
    }
};
