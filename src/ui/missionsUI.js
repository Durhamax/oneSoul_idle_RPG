/**
 * MISSIONS UI - Enhanced with Chain Visualization
 *
 * Shows missions organized by:
 * - Main narrative missions (sequential chains)
 * - Side missions (branching content)
 * - Quest categories and types
 */

const MissionsUI = {
    // Cache last rendered state
    lastMissionsState: null,
    currentDialog: null,  // Currently displayed dialog mission

    /**
     * Update missions display
     */
    updateMissions() {
        const container = document.getElementById("missionsView");
        if (!container) return;

        const missionsState = GameEngine.state.missions;
        const currentRegion = GameEngine.state.currentRegion;

        // Safety check for missions state
        if (!missionsState) {
            container.innerHTML = '<p style="color: #888; padding: 20px;">Missions system not initialized.</p>';
            return;
        }

        // Create state snapshot
        const currentState = {
            available: JSON.stringify(missionsState.available || []),
            active: JSON.stringify(missionsState.active || []),
            completed: JSON.stringify(missionsState.completed || []),
            region: currentRegion,
            dialogOpen: this.currentDialog !== null
        };

        // Only re-render if state changed
        if (this.lastMissionsState &&
            this.lastMissionsState.available === currentState.available &&
            this.lastMissionsState.active === currentState.active &&
            this.lastMissionsState.completed === currentState.completed &&
            this.lastMissionsState.region === currentState.region &&
            this.lastMissionsState.dialogOpen === currentState.dialogOpen) {
            return;
        }

        // If dialog is open, show it
        if (this.currentDialog) {
            container.innerHTML = this.renderDialog(this.currentDialog);
            this.lastMissionsState = currentState;
            return;
        }

        // Otherwise show mission board
        container.innerHTML = this.renderMissionBoard();
        this.lastMissionsState = currentState;
    },

    /**
     * Render the full mission board with chains and categories
     */
    renderMissionBoard() {
        const missionsState = GameEngine.state.missions;
        const missionDefs = GameEngine.definitions.missions;

        // Safety check
        if (!missionsState || !missionDefs) {
            return '<p style="color: #888; padding: 20px;">No missions available.</p>';
        }

        // Organize missions
        const organized = this.organizeMissions();

        let html = `<div style="padding: 20px;">`;

        // Dev tools removed - access via Dev modal in top header

        html += `
                <h2 style="margin-top: 0;">📋 Mission Board</h2>
                <div style="color: #aaa; font-size: 0.9em; margin-bottom: 20px;">
                    ${this.renderMissionStats()}
                </div>
        `;

        // Active Missions Section
        if (missionsState.active && missionsState.active.length > 0) {
            html += this.renderActiveSection(missionsState.active);
        }

        // Main Story Chains
        if (organized.mainStory.length > 0) {
            html += this.renderStoryChainSection(organized.mainStory);
        }

        // Side Quests
        if (organized.sideQuests.length > 0) {
            html += this.renderSideQuestsSection(organized.sideQuests);
        }

        // Daily/Repeatable Quests
        if (organized.dailies.length > 0) {
            html += this.renderDailiesSection(organized.dailies);
        }

        // Completed Missions (collapsed by default)
        if (missionsState.completed.length > 0) {
            html += this.renderCompletedSection(missionsState.completed);
        }

        // No missions message (only if there are literally no missions defined)
        if (Object.keys(missionDefs).length === 0) {
            html += `
                <div style="text-align: center; padding: 60px 20px; color: #888;">
                    <div style="font-size: 4em; margin-bottom: 15px;">🗺️</div>
                    <h3 style="color: #aaa;">No Missions Defined</h3>
                    <p style="font-size: 0.9em; margin-top: 10px;">No missions have been created yet.</p>
                </div>
            `;
        }

        html += `</div>`; // Close padding div

        return html;
    },

    /**
     * Organize missions into categories
     * Shows ALL missions from definitions, not just available/active
     */
    organizeMissions() {
        const missionsState = GameEngine.state.missions;
        const missionDefs = GameEngine.definitions.missions;

        // Safety check
        if (!missionsState || !missionDefs) {
            return {
                mainStory: [],
                sideQuests: [],
                dailies: [],
                combat: [],
                skills: []
            };
        }

        // Include ALL mission IDs from definitions (not just available/active)
        const allMissionIds = Object.keys(missionDefs);

        const organized = {
            mainStory: [],      // Tutorial and main narrative chains
            sideQuests: [],     // Side content
            dailies: [],        // Repeatable content
            combat: [],         // Combat-focused
            skills: []          // Skill-focused
        };

        for (let missionId of allMissionIds) {
            const mission = missionDefs[missionId];
            if (!mission) continue;

            const category = mission.metadata.category;

            if (category === 'tutorial' || category === 'main_story') {
                organized.mainStory.push(missionId);
            } else if (category === 'daily' || category === 'weekly') {
                organized.dailies.push(missionId);
            } else if (category === 'combat') {
                organized.combat.push(missionId);
            } else {
                organized.sideQuests.push(missionId);
            }
        }

        // Sort main story by chain order
        organized.mainStory.sort((a, b) => {
            const missionA = missionDefs[a];
            const missionB = missionDefs[b];
            return (missionA.metadata.chainOrder || 0) - (missionB.metadata.chainOrder || 0);
        });

        return organized;
    },

    /**
     * Render mission statistics
     */
    renderMissionStats() {
        const analytics = GameEngine.state.missions.analytics;
        return `
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <span>✅ Completed: ${analytics.totalCompleted}</span>
                <span>🎯 Active: ${GameEngine.state.missions.active.length}</span>
                <span>📖 Available: ${GameEngine.state.missions.available.length}</span>
            </div>
        `;
    },

    /**
     * Render active missions section
     */
    renderActiveSection(activeMissions) {
        let html = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #4a9eff; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5em;">🎯</span>
                    Active Missions
                </h3>
                <div style="display: grid; gap: 15px;">
        `;

        for (let missionId of activeMissions) {
            html += this.renderMissionCard(missionId, 'active');
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render story chain section with visual progression
     */
    renderStoryChainSection(mainStoryMissions) {
        const missionDefs = GameEngine.definitions.missions;
        const completedMissions = GameEngine.state.missions.completed;

        // Group by chain
        const chains = {};
        for (let missionId of mainStoryMissions) {
            const mission = missionDefs[missionId];
            const chainId = mission.metadata.chain || 'default';

            if (!chains[chainId]) {
                chains[chainId] = [];
            }
            chains[chainId].push(missionId);
        }

        let html = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #ffd700; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5em;">📜</span>
                    Main Story
                </h3>
        `;

        // Render each chain
        for (let chainId in chains) {
            const chainMissions = chains[chainId];

            html += `
                <div style="background: #2a2a3a; border: 2px solid #ffd700; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-weight: bold; margin-bottom: 15px; color: #ffd700; font-size: 1.1em;">
                        ${this.getChainName(chainId)}
                    </div>
                    <div style="position: relative;">
            `;

            // Render chain progression line
            chainMissions.forEach((missionId, index) => {
                const mission = missionDefs[missionId];
                const isCompleted = completedMissions.includes(missionId);
                const isActive = GameEngine.state.missions.active && GameEngine.state.missions.active.includes(missionId);
                const isAvailable = GameEngine.state.missions.available && GameEngine.state.missions.available.includes(missionId);
                const isLocked = !isCompleted && !isActive && !isAvailable;

                // Connection line to next mission
                if (index < chainMissions.length - 1) {
                    html += `
                        <div style="display: flex; align-items: center; margin-bottom: 10px; pointer-events: none;">
                            <div style="flex: 1; pointer-events: auto;">
                                ${this.renderChainMissionNode(missionId, isCompleted, isActive, isAvailable, isLocked)}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: center; margin: 5px 0;">
                            <div style="width: 3px; height: 20px; background: ${isCompleted ? '#4caf50' : '#555'};"></div>
                        </div>
                    `;
                } else {
                    html += `
                        <div style="display: flex; align-items: center; pointer-events: none;">
                            <div style="flex: 1; pointer-events: auto;">
                                ${this.renderChainMissionNode(missionId, isCompleted, isActive, isAvailable, isLocked)}
                            </div>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    /**
     * Render a mission node in a chain
     */
    renderChainMissionNode(missionId, isCompleted, isActive, isAvailable, isLocked) {
        const mission = GameEngine.definitions.missions[missionId];
        const progress = GameEngine.getMissionProgress(missionId);

        let icon = '🔒';
        let borderColor = '#555';
        let opacity = '0.6';
        let bgColor = '#1a1a2a';

        if (isCompleted) {
            icon = '✅';
            borderColor = '#4caf50';
            opacity = '0.8';
            bgColor = '#1a2a1a';
        } else if (isActive) {
            icon = '🎯';
            borderColor = '#4a9eff';
            opacity = '1';
            bgColor = '#1a2a3a';
        } else if (isAvailable) {
            icon = '📋';
            borderColor = '#ffd700';
            opacity = '1';
            bgColor = '#2a2a1a';
        }

        let html = `
            <div style="background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 6px; padding: 12px; opacity: ${opacity}; cursor: pointer; pointer-events: auto;"
                 onclick="openMissionDialog('${missionId}')">
                <div style="display: flex; align-items: center; gap: 10px; pointer-events: none;">
                    <div style="font-size: 1.5em;">${icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; margin-bottom: 3px;">${mission.name}</div>
                        <div style="font-size: 0.85em; color: #aaa;">${mission.description}</div>
                        ${this.renderMissionTags(mission)}
                    </div>
                </div>
        `;

        // Show progress if active
        if (isActive && progress) {
            const totalObjectives = Object.keys(progress.objectives).length;
            const completedObjectives = Object.values(progress.objectives).filter(obj => obj.completed).length;

            html += `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; pointer-events: none;">
                    <div style="font-size: 0.85em; color: #4a9eff; margin-bottom: 5px;">
                        Progress: ${completedObjectives}/${totalObjectives} objectives
                    </div>
                    <div style="background: rgba(0,0,0,0.3); border-radius: 4px; height: 6px; overflow: hidden;">
                        <div style="width: ${(completedObjectives / totalObjectives) * 100}%; height: 100%; background: linear-gradient(90deg, #4a9eff, #2196F3);"></div>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    /**
     * Render side quests section
     */
    renderSideQuestsSection(sideQuests) {
        let html = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #9c27b0; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5em;">🌟</span>
                    Side Quests
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px;">
        `;

        for (let missionId of sideQuests) {
            html += this.renderMissionCard(missionId, 'side');
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render dailies/repeatable section
     */
    renderDailiesSection(dailies) {
        let html = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #ff9800; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5em;">🔄</span>
                    Daily & Repeatable
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px;">
        `;

        for (let missionId of dailies) {
            html += this.renderMissionCard(missionId, 'daily');
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render completed section (collapsed)
     */
    renderCompletedSection(completedMissions) {
        return `
            <details style="margin-top: 30px;">
                <summary style="cursor: pointer; padding: 10px; background: #2a2a3a; border-radius: 6px; color: #888; font-weight: bold;">
                    ✅ Completed Missions (${completedMissions.length})
                </summary>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; margin-top: 10px; padding: 10px;">
                    ${completedMissions.map(id => {
                        const mission = GameEngine.definitions.missions[id];
                        return mission ? `
                            <div style="background: #1a1a2a; border: 1px solid #555; border-radius: 4px; padding: 8px; opacity: 0.7;">
                                <div style="font-size: 0.9em; font-weight: bold;">${mission.name}</div>
                                <div style="font-size: 0.75em; color: #888;">${mission.metadata.category}</div>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
            </details>
        `;
    },

    /**
     * Render mission tags (difficulty, type, etc.)
     */
    renderMissionTags(mission) {
        const tags = [];

        // Difficulty
        const difficulty = mission.metadata.difficulty || GameEngine.calculateMissionDifficulty(mission.id);
        const difficultyColor = difficulty <= 3 ? '#4caf50' : difficulty <= 6 ? '#ff9800' : '#f44336';
        tags.push(`<span style="background: ${difficultyColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75em;">Lv${difficulty}</span>`);

        // Quest type icons based on objectives
        const objectiveTypes = new Set(mission.objectives.map(obj => obj.type));
        if (objectiveTypes.has('kill')) tags.push(`<span title="Combat">⚔️</span>`);
        if (objectiveTypes.has('collect')) tags.push(`<span title="Gathering">📦</span>`);
        if (objectiveTypes.has('craft')) tags.push(`<span title="Crafting">🔨</span>`);
        if (objectiveTypes.has('skill')) tags.push(`<span title="Skilling">📚</span>`);
        if (objectiveTypes.has('explore')) tags.push(`<span title="Exploration">🗺️</span>`);

        // Estimated time
        if (mission.metadata.estimatedTime) {
            const minutes = Math.ceil(mission.metadata.estimatedTime / 60);
            tags.push(`<span style="color: #aaa; font-size: 0.75em;">~${minutes}m</span>`);
        }

        return `<div style="display: flex; gap: 5px; margin-top: 5px; align-items: center;">${tags.join('')}</div>`;
    },

    /**
     * Render a mission card
     */
    renderMissionCard(missionId, status) {
        const mission = GameEngine.definitions.missions[missionId];
        if (!mission) return '';

        const isCompleted = GameEngine.state.missions.completed && GameEngine.state.missions.completed.includes(missionId);
        const isActive = GameEngine.state.missions.active && GameEngine.state.missions.active.includes(missionId);
        const isAvailable = GameEngine.state.missions.available && GameEngine.state.missions.available.includes(missionId);
        const isLocked = !isCompleted && !isActive && !isAvailable;
        const progress = GameEngine.getMissionProgress(missionId);

        let borderColor = '#555';
        let opacity = '1';

        if (isLocked) {
            opacity = '0.6';
            borderColor = '#444';
        } else if (status === 'active') {
            borderColor = '#4a9eff';
        } else if (status === 'side') {
            borderColor = '#9c27b0';
        } else if (status === 'daily') {
            borderColor = '#ff9800';
        }

        let html = `
            <div style="background: #2a2a3a; border: 2px solid ${borderColor}; border-radius: 8px; padding: 15px; opacity: ${opacity}; cursor: pointer;" onclick="openMissionDialog('${missionId}')">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; pointer-events: none;">
                    <div style="flex: 1;">
                        <div style="font-size: 1.1em; font-weight: bold; margin-bottom: 5px;">${mission.name}</div>
                        <div style="font-size: 0.85em; color: #aaa; margin-bottom: 8px;">${mission.description}</div>
                        ${this.renderMissionTags(mission)}
                    </div>
                </div>
        `;

        // Show objectives if active
        if (isActive && progress) {
            html += `
                <div style="margin: 12px 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px; pointer-events: none;">
                    <strong style="font-size: 0.9em;">Objectives:</strong>
                    <div style="margin-top: 6px;">
            `;

            for (let objId in progress.objectives) {
                const objective = progress.objectives[objId];
                const objDef = mission.objectives.find(o => o.id === objId);
                const complete = objective.completed;
                const icon = complete ? '✅' : '⬜';
                const percent = (objective.current / objective.required) * 100;

                html += `
                    <div style="margin: 6px 0;">
                        <div style="font-size: 0.85em; margin-bottom: 3px; color: ${complete ? '#4caf50' : '#ddd'};">
                            ${icon} ${objDef.description}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; background: rgba(0,0,0,0.4); border-radius: 3px; height: 6px; overflow: hidden;">
                                <div style="width: ${percent}%; height: 100%; background: ${complete ? '#4caf50' : '#4a9eff'}; transition: width 0.3s;"></div>
                            </div>
                            <span style="font-size: 0.75em; color: #888; min-width: 50px; text-align: right;">${objective.current}/${objective.required}</span>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        // Show rewards preview
        html += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #444; pointer-events: none;">`;
        html += this.renderRewardsPreview(mission.rewards);
        html += `</div>`;

        // Button
        html += `<div style="margin-top: 12px;">`;
        if (isCompleted) {
            html += `
                <button onclick="event.stopPropagation(); openMissionDialog('${missionId}')" style="width: 100%; padding: 8px; background: #4caf50; border: 1px solid #45a049; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; opacity: 0.7; pointer-events: auto;">
                    ✅ Completed
                </button>
            `;
        } else if (isActive) {
            html += `
                <button onclick="event.stopPropagation(); abandonMission('${missionId}')" style="width: 100%; padding: 8px; background: #e74c3c; border: 1px solid #c0392b; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; pointer-events: auto;">
                    ❌ Abandon
                </button>
            `;
        } else if (isAvailable) {
            html += `
                <button onclick="event.stopPropagation(); openMissionDialog('${missionId}')" style="width: 100%; padding: 8px; background: #4caf50; border: 1px solid #45a049; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; pointer-events: auto;">
                    ▶️ View Mission
                </button>
            `;
        } else if (isLocked) {
            const canStart = GameEngine.canStartMission(missionId);
            html += `
                <button style="width: 100%; padding: 8px; background: #555; border: 1px solid #444; border-radius: 4px; color: #aaa; font-weight: bold; cursor: not-allowed; pointer-events: auto;">
                    🔒 ${canStart.reason || 'Locked'}
                </button>
            `;
        }
        html += `</div>`;

        html += `</div>`;

        return html;
    },

    /**
     * Render rewards preview
     */
    renderRewardsPreview(rewards) {
        const parts = [];

        if (rewards.base) {
            // Experience
            if (rewards.base.exp) {
                const expParts = [];
                for (let skillId in rewards.base.exp) {
                    expParts.push(`${rewards.base.exp[skillId]} ${skillId}`);
                }
                if (expParts.length > 0) {
                    parts.push(`✨ ${expParts.join(', ')} XP`);
                }
            }

            // Currencies
            if (rewards.base.currencies) {
                for (let currencyId in rewards.base.currencies) {
                    const icons = { 'gold': '💰', 'medals': '🏅', 'tomes': '📚', 'gems': '💎' };
                    const icon = icons[currencyId] || '💰';
                    parts.push(`${icon} ${rewards.base.currencies[currencyId]} ${currencyId}`);
                }
            }

            // Items count
            if (rewards.base.items && rewards.base.items.length > 0) {
                parts.push(`🎁 ${rewards.base.items.length} item${rewards.base.items.length > 1 ? 's' : ''}`);
            }
        }

        return `<div style="font-size: 0.85em; color: #aaa;"><strong>Rewards:</strong> ${parts.join(' • ')}</div>`;
    },

    /**
     * Get chain display name
     */
    getChainName(chainId) {
        const chainNames = {
            'tutorial_chain': '🎓 Beginner\'s Path',
            'mining_chain': '⛏️ Mining Mastery',
            'combat_chain': '⚔️ Warrior\'s Journey',
            'crafting_chain': '🔨 Artisan\'s Way'
        };
        return chainNames[chainId] || chainId;
    },

    /**
     * Render mission dialog
     */
    renderDialog(missionId) {
        const mission = GameEngine.definitions.missions[missionId];
        if (!mission || !mission.dialog) {
            return '<div style="padding: 20px; color: #f88;">Error: Mission dialog not found</div>';
        }

        const isActive = GameEngine.state.missions.active.includes(missionId);
        const dialog = mission.dialog;
        const progress = GameEngine.getMissionProgress(missionId);

        let html = `
            <div style="padding: 20px; max-width: 900px; margin: 0 auto;">
                <!-- Dialog Header -->
                <div style="background: #2a2a3a; border: 2px solid #4a9eff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="font-size: 3em;">${dialog.npcIcon || '👤'}</div>
                        <div>
                            <div style="font-size: 1.3em; font-weight: bold;">${dialog.npc || 'Unknown'}</div>
                            <div style="font-size: 0.9em; color: #aaa;">${mission.name}</div>
                        </div>
                    </div>

                    <!-- Dialog Text -->
                    <div style="background: rgba(0,0,0,0.3); border-radius: 4px; padding: 15px; margin: 15px 0; line-height: 1.6;">
                        <p style="margin: 0 0 10px 0; font-style: italic; color: #ddd;">"${dialog.intro}"</p>
                        <p style="margin: 10px 0; color: #ccc; white-space: pre-line;">${dialog.body}</p>
                        ${!isActive ? `<p style="margin: 10px 0 0 0; font-style: italic; color: #ddd;">"${dialog.completion}"</p>` : ''}
                    </div>

                    <!-- Region Requirement -->
                    ${mission.metadata.region ? this.renderRegionRequirement(mission.metadata.region) : ''}

                    <!-- Objectives -->
                    ${this.renderDialogObjectives(mission, progress)}

                    <!-- Rewards -->
                    ${this.renderDialogRewards(mission.rewards)}

                    <!-- Unlocks -->
                    ${mission.metadata.unlocks && mission.metadata.unlocks.length > 0 ? this.renderUnlocks(mission.metadata.unlocks) : ''}

                    <!-- Buttons -->
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
        `;

        // Check if player is in correct region
        const currentRegion = GameEngine.state.currentRegion;
        const requiredRegion = mission.metadata.region;
        const inCorrectRegion = !requiredRegion || currentRegion === requiredRegion;
        const regionDef = requiredRegion ? GameEngine.definitions.worldMap[requiredRegion] : null;

        if (!isActive) {
            const canStart = GameEngine.canStartMission(missionId);

            // Travel button if not in correct region
            if (requiredRegion && !inCorrectRegion && regionDef) {
                const canTravel = GameEngine.canTravelToRegion(requiredRegion);
                html += `
                    <button onclick="travelToRegion('${requiredRegion}')"
                            style="flex: 1; padding: 12px; background: ${canTravel ? '#ff9800' : '#555'}; border: 1px solid ${canTravel ? '#f57c00' : '#444'}; border-radius: 4px; color: white; font-weight: bold; font-size: 1em; cursor: ${canTravel ? 'pointer' : 'not-allowed'};" ${!canTravel ? 'disabled' : ''}>
                        ${canTravel ? `🗺️ Travel to ${regionDef.name}` : `🔒 Cannot Travel (Discover Path First)`}
                    </button>
                `;
            }

            if (canStart.canStart) {
                html += `
                    <button onclick="acceptMission('${missionId}')" style="flex: 1; padding: 12px; background: #4caf50; border: 1px solid #45a049; border-radius: 4px; color: white; font-weight: bold; font-size: 1em; cursor: pointer;">
                        ✅ Accept Mission
                    </button>
                `;
            } else {
                html += `
                    <div style="flex: 1; padding: 12px; background: #555; border: 1px solid #444; border-radius: 4px; color: #aaa; text-align: center;">
                        🔒 ${canStart.reason}
                    </div>
                `;
            }
        } else {
            // Check if all objectives are complete
            const allObjectivesComplete = progress && Object.values(progress.objectives).every(obj => obj.completed);

            if (allObjectivesComplete) {
                html += `
                    <button onclick="completeMission('${missionId}'); closeMissionDialog();" style="flex: 1; padding: 12px; background: #4caf50; border: 1px solid #45a049; border-radius: 4px; color: white; font-weight: bold; font-size: 1em; cursor: pointer;">
                        ✅ Complete Mission
                    </button>
                `;
            }

            html += `
                <button onclick="abandonMission('${missionId}'); closeMissionDialog();" style="flex: 1; padding: 12px; background: #e74c3c; border: 1px solid #c0392b; border-radius: 4px; color: white; font-weight: bold; font-size: 1em; cursor: pointer;">
                    ❌ Abandon Mission
                </button>
            `;
        }

        html += `
                        <button onclick="closeMissionDialog()" style="flex: 1; padding: 12px; background: #555; border: 1px solid #444; border-radius: 4px; color: white; font-weight: bold; font-size: 1em; cursor: pointer;">
                            ${isActive ? '📋 Back to Missions' : '↩️ Back'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render objectives in dialog
     */
    renderDialogObjectives(mission, progress) {
        let html = `
            <div style="margin: 15px 0; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                <strong>Objectives:</strong>
                <div style="margin-top: 10px; display: grid; gap: 8px;">
        `;

        for (let objective of mission.objectives) {
            const objProgress = progress?.objectives[objective.id];
            const isCompleted = objProgress?.completed || false;
            const current = objProgress?.current || 0;

            html += `
                <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                    <div style="font-size: 1.2em;">${isCompleted ? '✅' : '⬜'}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.9em; font-weight: bold; margin-bottom: 3px;">${objective.description}</div>
                        <div style="font-size: 0.75em; color: #888;">${this.getObjectiveTypeLabel(objective.type)}</div>
                    </div>
                    ${progress ? `
                        <div style="min-width: 60px; text-align: right; color: ${isCompleted ? '#4caf50' : '#4a9eff'}; font-weight: bold;">
                            ${current}/${objective.required}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render rewards in dialog - HIGHLIGHTED VERSION
     */
    renderDialogRewards(rewards) {
        let html = `
            <div style="margin: 15px 0; padding: 15px; background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1)); border: 2px solid #ffd700; border-radius: 6px; box-shadow: 0 0 15px rgba(255,215,0,0.3);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                    <span style="font-size: 1.5em;">🎁</span>
                    <strong style="font-size: 1.1em; color: #ffd700;">REWARDS</strong>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        `;

        // Items - Highlighted
        if (rewards.base && rewards.base.items) {
            for (let itemReward of rewards.base.items) {
                const itemDef = GameEngine.definitions.items[itemReward.itemId];
                if (itemDef) {
                    html += `
                        <div style="background: linear-gradient(135deg, #2a2a3a, #1a1a2a); border: 2px solid #4caf50; border-radius: 6px; padding: 12px; text-align: center; min-width: 90px; box-shadow: 0 2px 8px rgba(76,175,80,0.3);">
                            <div style="font-size: 2em;">${itemDef.image}</div>
                            <div style="font-size: 0.85em; margin-top: 6px; font-weight: bold; color: #fff;">${itemDef.name}</div>
                            <div style="font-size: 0.8em; color: #4caf50; font-weight: bold;">×${itemReward.amount}</div>
                        </div>
                    `;
                }
            }
        }

        // Currencies - Highlighted
        if (rewards.base && rewards.base.currencies) {
            for (let currencyId in rewards.base.currencies) {
                const amount = rewards.base.currencies[currencyId];
                const currencyIcons = { 'gold': '💰', 'medals': '🏅', 'tomes': '📚', 'gems': '💎' };
                const icon = currencyIcons[currencyId] || '💰';
                html += `
                    <div style="background: linear-gradient(135deg, #2a2a1a, #1a1a0a); border: 2px solid #ffd700; border-radius: 6px; padding: 12px; text-align: center; min-width: 90px; box-shadow: 0 2px 8px rgba(255,215,0,0.3);">
                        <div style="font-size: 2em;">${icon}</div>
                        <div style="font-size: 0.85em; margin-top: 6px; font-weight: bold; text-transform: capitalize; color: #ffd700;">${currencyId}</div>
                        <div style="font-size: 0.9em; color: #4caf50; font-weight: bold;">+${amount}</div>
                    </div>
                `;
            }
        }

        // Experience - Highlighted
        if (rewards.base && rewards.base.exp) {
            for (let skillId in rewards.base.exp) {
                const amount = rewards.base.exp[skillId];
                const skillDef = GameEngine.definitions.skills[skillId];
                html += `
                    <div style="background: linear-gradient(135deg, #1a2a3a, #0a1a2a); border: 2px solid #4a9eff; border-radius: 6px; padding: 12px; text-align: center; min-width: 90px; box-shadow: 0 2px 8px rgba(74,158,255,0.3);">
                        <div style="font-size: 2em;">✨</div>
                        <div style="font-size: 0.85em; margin-top: 6px; font-weight: bold; color: #4a9eff;">${skillDef?.name || skillId}</div>
                        <div style="font-size: 0.9em; color: #4caf50; font-weight: bold;">+${amount} XP</div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Get objective type label
     */
    getObjectiveTypeLabel(type) {
        const labels = {
            'talk': '💬 Conversation',
            'kill': '⚔️ Combat',
            'collect': '📦 Gathering',
            'skill': '📚 Skilling',
            'craft': '🔨 Crafting',
            'explore': '🗺️ Exploration',
            'donate': '🎁 Donation'
        };
        return labels[type] || type;
    },

    /**
     * Render region requirement display
     */
    renderRegionRequirement(regionId) {
        const regionDef = GameEngine.definitions.worldMap[regionId];
        const currentRegion = GameEngine.state.currentRegion;
        const isInRegion = currentRegion === regionId;

        if (!regionDef) return '';

        const biomeDef = GameEngine.definitions.biomes[regionDef.biome];

        return `
            <div style="margin: 10px 0; padding: 10px; background: ${isInRegion ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)'}; border: 1px solid ${isInRegion ? '#4caf50' : '#ff9800'}; border-radius: 4px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.2em;">${isInRegion ? '✅' : '📍'}</span>
                    <div style="flex: 1;">
                        <strong style="font-size: 0.9em; color: ${isInRegion ? '#4caf50' : '#ff9800'};">
                            ${isInRegion ? 'You are in the correct region' : 'Mission Location'}
                        </strong>
                        <div style="font-size: 0.85em; color: #aaa; margin-top: 2px;">
                            ${biomeDef?.icon || '🗺️'} ${regionDef.name} (${biomeDef?.name || regionDef.biome})
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render unlocks section
     */
    renderUnlocks(unlocks) {
        const missionDefs = GameEngine.definitions.missions;

        let html = `
            <div style="margin: 15px 0; padding: 12px; background: rgba(156,39,176,0.1); border: 2px solid #9c27b0; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-size: 1.3em;">🔓</span>
                    <strong style="color: #9c27b0;">UNLOCKS</strong>
                </div>
                <div style="display: grid; gap: 8px;">
        `;

        for (let unlockedMissionId of unlocks) {
            const unlockedMission = missionDefs[unlockedMissionId];
            if (unlockedMission) {
                const isCompleted = GameEngine.state.missions.completed && GameEngine.state.missions.completed.includes(unlockedMissionId);
                const isActive = GameEngine.state.missions.active && GameEngine.state.missions.active.includes(unlockedMissionId);
                const isAvailable = GameEngine.state.missions.available && GameEngine.state.missions.available.includes(unlockedMissionId);

                let statusIcon = '🔒';
                let statusColor = '#888';
                if (isCompleted) {
                    statusIcon = '✅';
                    statusColor = '#4caf50';
                } else if (isActive) {
                    statusIcon = '🎯';
                    statusColor = '#4a9eff';
                } else if (isAvailable) {
                    statusIcon = '📋';
                    statusColor = '#ffd700';
                }

                html += `
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid ${statusColor}; border-radius: 4px; padding: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="openMissionDialog('${unlockedMissionId}')">
                        <span style="font-size: 1.2em;">${statusIcon}</span>
                        <div style="flex: 1;">
                            <div style="font-size: 0.9em; font-weight: bold; color: ${statusColor};">${unlockedMission.name}</div>
                            <div style="font-size: 0.75em; color: #aaa;">${unlockedMission.description}</div>
                        </div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }
};
