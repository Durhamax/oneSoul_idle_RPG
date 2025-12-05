/**
 * MISSIONS UI - Tabbed Interface with MissionSystem Integration
 *
 * Three-tab layout:
 * 1. Active - Currently tracked missions with progress
 * 2. Available - Missions ready to accept
 * 3. Completed - Mission history
 *
 * Integrates with:
 * - MissionSystem (EventBus-driven objective tracking)
 * - MissionIdUtils (ID parsing and sorting)
 * - OBJECTIVE_TYPES (objective display)
 * - MissionSchema (validation)
 */

const MissionsUI = {
    // Current tab state
    currentTab: 'active',

    // Cache for performance
    lastMissionsState: null,
    lastDialogState: null,

    // Currently open mission dialog
    currentDialog: null,

    // Event subscriptions
    _eventSubscriptions: [],

    /**
     * Initialize UI and subscribe to events
     */
    init() {
        this._subscribeToEvents();
        console.log('✅ MissionsUI initialized');
    },

    /**
     * Subscribe to mission-related EventBus events
     */
    _subscribeToEvents() {
        // Clear existing subscriptions
        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];

        if (typeof EventBus === 'undefined') return;

        // Mission lifecycle events
        this._eventSubscriptions.push(
            EventBus.on('mission:started', () => this.refresh()),
            EventBus.on('mission:completed', () => this.refresh()),
            EventBus.on('mission:abandoned', () => this.refresh()),
            EventBus.on('missions:availableUpdated', () => this.refresh()),
            EventBus.on('mission:objectiveProgress', () => this.updateActiveProgress()),
            EventBus.on('mission:objectiveCompleted', () => this.refresh()),
            EventBus.on('mission:readyToSubmit', (data) => this.showSubmitPrompt(data.missionId))
        );
    },

    /**
     * Force refresh the UI
     */
    refresh() {
        this.lastMissionsState = null;
        this.updateMissions();
    },

    /**
     * Update only active mission progress (lightweight)
     */
    updateActiveProgress() {
        if (this.currentTab !== 'active') return;

        const container = document.getElementById('mission-active-content');
        if (!container) return;

        // Just re-render active tab content
        container.innerHTML = this.renderActiveContent();
    },

    /**
     * Show submit prompt for turn-in missions
     */
    showSubmitPrompt(missionId) {
        const mission = this._getMissionDef(missionId);
        if (!mission) return;

        // Could show a toast or highlight the mission
        console.log(`📋 Mission "${mission.name}" is ready to submit!`);
    },

    /**
     * Update missions display
     */
    updateMissions() {
        const container = document.getElementById("missionsView");
        if (!container) return;

        const missionsState = GameEngine.state.missions;

        // Safety check
        if (!missionsState) {
            container.innerHTML = '<p style="color: #888; padding: 20px;">Missions system not initialized.</p>';
            return;
        }

        // If dialog is open, show it instead (with caching to prevent re-render every tick)
        if (this.currentDialog) {
            const progress = GameEngine.getMissionProgress(this.currentDialog);
            const dialogState = {
                missionId: this.currentDialog,
                progress: JSON.stringify(progress?.objectives || {})
            };

            // Only re-render dialog if progress changed
            if (this.lastDialogState &&
                this.lastDialogState.missionId === dialogState.missionId &&
                this.lastDialogState.progress === dialogState.progress) {
                return;
            }

            container.innerHTML = this.renderDialog(this.currentDialog);
            this.lastDialogState = dialogState;
            return;
        }

        // Clear dialog state when no dialog is open
        this.lastDialogState = null;

        // Create state snapshot for caching
        const currentState = {
            available: JSON.stringify(missionsState.available || []),
            active: JSON.stringify(missionsState.active || []),
            completed: JSON.stringify(missionsState.completed || []),
            progress: JSON.stringify(missionsState.activeProgress || {}),
            tab: this.currentTab
        };

        // Only re-render if state changed
        if (this.lastMissionsState &&
            this.lastMissionsState.available === currentState.available &&
            this.lastMissionsState.active === currentState.active &&
            this.lastMissionsState.completed === currentState.completed &&
            this.lastMissionsState.tab === currentState.tab) {
            return;
        }

        container.innerHTML = this.renderMissionBoard();
        this.lastMissionsState = currentState;
    },

    /**
     * Switch to a different tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        this.lastMissionsState = null;
        this.updateMissions();
    },

    /**
     * Render the mission board with tabs
     */
    renderMissionBoard() {
        const missionsState = GameEngine.state.missions;

        // Count badges
        const activeCount = missionsState.active?.length || 0;
        const availableCount = missionsState.available?.length || 0;
        const completedCount = missionsState.completed?.length || 0;

        let html = `
            <div class="missions-container">
                <!-- Header -->
                <div class="missions-header">
                    <h2 class="missions-title">Mission Board</h2>
                    ${this.renderMissionStats()}
                </div>

                <!-- Tab Navigation -->
                <div class="missions-tabs">
                    <button class="mission-tab ${this.currentTab === 'active' ? 'active' : ''}"
                            onclick="MissionsUI.switchTab('active')">
                        <span class="tab-icon">🎯</span>
                        <span class="tab-label">Active</span>
                        ${activeCount > 0 ? `<span class="tab-badge">${activeCount}</span>` : ''}
                    </button>
                    <button class="mission-tab ${this.currentTab === 'available' ? 'active' : ''}"
                            onclick="MissionsUI.switchTab('available')">
                        <span class="tab-icon">📋</span>
                        <span class="tab-label">Available</span>
                        ${availableCount > 0 ? `<span class="tab-badge available">${availableCount}</span>` : ''}
                    </button>
                    <button class="mission-tab ${this.currentTab === 'completed' ? 'active' : ''}"
                            onclick="MissionsUI.switchTab('completed')">
                        <span class="tab-icon">✅</span>
                        <span class="tab-label">Completed</span>
                        <span class="tab-badge completed">${completedCount}</span>
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="missions-tab-content" id="mission-${this.currentTab}-content">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render tab content based on current tab
     */
    renderTabContent() {
        switch (this.currentTab) {
            case 'active':
                return this.renderActiveContent();
            case 'available':
                return this.renderAvailableContent();
            case 'completed':
                return this.renderCompletedContent();
            default:
                return '';
        }
    },

    /**
     * Render active missions content
     */
    renderActiveContent() {
        const activeMissions = GameEngine.state.missions.active || [];

        if (activeMissions.length === 0) {
            return `
                <div class="missions-empty">
                    <div class="empty-icon">🗺️</div>
                    <h3>No Active Missions</h3>
                    <p>Check the Available tab for missions to start!</p>
                </div>
            `;
        }

        // Sort missions (main story first, then by type)
        const sortedMissions = this._sortMissions(activeMissions);

        let html = '<div class="missions-grid">';
        for (const missionId of sortedMissions) {
            html += this.renderMissionCard(missionId, 'active');
        }
        html += '</div>';

        return html;
    },

    /**
     * Render available missions content
     */
    renderAvailableContent() {
        const availableMissions = GameEngine.state.missions.available || [];

        if (availableMissions.length === 0) {
            return `
                <div class="missions-empty">
                    <div class="empty-icon">📭</div>
                    <h3>No Available Missions</h3>
                    <p>Complete current missions or explore to unlock more.</p>
                </div>
            `;
        }

        // Organize by type
        const organized = this._organizeMissions(availableMissions);

        let html = '';

        // Main Story
        if (organized.main.length > 0) {
            html += this.renderMissionSection('Main Story', '📖', organized.main, 'main');
        }

        // Side Quests
        if (organized.side.length > 0) {
            html += this.renderMissionSection('Side Quests', '📜', organized.side, 'side');
        }

        // Daily/Repeatable
        if (organized.daily.length > 0) {
            html += this.renderMissionSection('Daily', '🔄', organized.daily, 'daily');
        }

        // Other types
        if (organized.other.length > 0) {
            html += this.renderMissionSection('Other', '📋', organized.other, 'other');
        }

        return html || '<div class="missions-empty"><p>No missions available.</p></div>';
    },

    /**
     * Render completed missions content
     * Uses CompletedMissionsTab component for main story filtering and display
     */
    renderCompletedContent() {
        // Use the CompletedMissionsTab component if available
        if (typeof CompletedMissionsTab !== 'undefined') {
            return CompletedMissionsTab.render();
        }

        // Fallback to original implementation
        const completedMissions = GameEngine.state.missions.completed || [];

        if (completedMissions.length === 0) {
            return `
                <div class="missions-empty">
                    <div class="empty-icon">🏆</div>
                    <h3>No Completed Missions</h3>
                    <p>Your completed missions will appear here.</p>
                </div>
            `;
        }

        // Sort by type
        const sortedMissions = this._sortMissions(completedMissions);

        let html = '<div class="missions-grid completed">';
        for (const missionId of sortedMissions) {
            html += this.renderCompletedCard(missionId);
        }
        html += '</div>';

        return html;
    },

    /**
     * Render a section of missions
     */
    renderMissionSection(title, icon, missionIds, type) {
        const typeColors = {
            main: '#2196F3',
            side: '#FF9800',
            daily: '#9C27B0',
            other: '#607D8B'
        };

        let html = `
            <div class="mission-section" data-type="${type}">
                <h3 class="section-title" style="border-color: ${typeColors[type] || '#888'}">
                    <span class="section-icon">${icon}</span>
                    ${title}
                    <span class="section-count">(${missionIds.length})</span>
                </h3>
                <div class="missions-grid">
        `;

        for (const missionId of missionIds) {
            html += this.renderMissionCard(missionId, 'available');
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render mission statistics
     */
    renderMissionStats() {
        const analytics = GameEngine.state.missions?.analytics || {};
        return `
            <div class="missions-stats">
                <span class="stat">
                    <span class="stat-value">${analytics.totalCompleted || 0}</span>
                    <span class="stat-label">Completed</span>
                </span>
                <span class="stat">
                    <span class="stat-value">${analytics.totalStarted || 0}</span>
                    <span class="stat-label">Started</span>
                </span>
            </div>
        `;
    },

    /**
     * Render a mission card
     */
    renderMissionCard(missionId, status) {
        const mission = this._getMissionDef(missionId);
        if (!mission) return '';

        const progress = GameEngine.getMissionProgress(missionId);
        const parsed = this._parseMissionId(missionId);
        const typeInfo = this._getTypeDisplayInfo(parsed?.type);
        const difficulty = GameEngine.calculateMissionDifficulty?.(missionId) || 1;

        // Calculate progress percentage
        let progressPercent = 0;
        let objectivesComplete = 0;
        let totalObjectives = 0;

        if (progress) {
            const objectives = Object.values(progress.objectives);
            totalObjectives = objectives.length;
            objectivesComplete = objectives.filter(obj => obj.completed).length;
            progressPercent = totalObjectives > 0 ? (objectivesComplete / totalObjectives) * 100 : 0;
        }

        // Check for turn-in readiness
        const hasTurnIn = mission.objectives?.some(obj =>
            obj.type === 'turnIn' || obj.type === 'turnInSet' || obj.isTurnIn
        );
        const requiresTurnIn = mission.metadata?.requiresTurnIn === true;
        const isReadyToSubmit = status === 'active' && progressPercent === 100 && (hasTurnIn || requiresTurnIn);

        let html = `
            <div class="mission-card ${status}" data-mission-id="${missionId}" onclick="MissionsUI.openMissionDialog('${missionId}')">
                <div class="mission-card-header">
                    <span class="mission-type-badge" style="background: ${typeInfo.color}">
                        ${typeInfo.icon} ${typeInfo.label}
                    </span>
                    <span class="mission-difficulty" title="Difficulty ${difficulty}/10">
                        ${'★'.repeat(Math.min(5, Math.ceil(difficulty / 2)))}
                    </span>
                </div>

                <h4 class="mission-name">${mission.name}</h4>
                <p class="mission-description">${mission.description}</p>
        `;

        // Progress bar for active missions
        if (status === 'active' && progress) {
            html += `
                <div class="mission-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${objectivesComplete}/${totalObjectives} objectives</span>
                </div>
            `;

            // Render objectives
            html += '<div class="mission-objectives">';
            for (const objId in progress.objectives) {
                const obj = progress.objectives[objId];
                const objDef = mission.objectives?.find(o => (o.id || `obj_${mission.objectives.indexOf(o) + 1}`) === objId);

                html += `
                    <div class="objective ${obj.completed ? 'completed' : ''}">
                        <span class="objective-icon">${obj.completed ? '✅' : '⬜'}</span>
                        <span class="objective-text">${this._getObjectiveDisplayText(obj, objDef)}</span>
                        <span class="objective-progress">${obj.current}/${obj.required}</span>
                    </div>
                `;
            }
            html += '</div>';

            // Complete button for missions ready to turn in
            if (isReadyToSubmit) {
                html += `
                    <button class="mission-submit-btn" onclick="event.stopPropagation(); MissionsUI.submitMission('${missionId}')">
                        Complete Mission
                    </button>
                `;
            }
        }

        // Rewards preview
        html += this.renderRewardsPreview(mission.rewards);

        // Action button
        html += '<div class="mission-card-actions">';
        if (status === 'available') {
            html += `
                <button class="mission-action-btn accept" onclick="event.stopPropagation(); MissionsUI.acceptMission('${missionId}')">
                    Accept Mission
                </button>
            `;
        } else if (status === 'active') {
            html += `
                <button class="mission-action-btn abandon" onclick="event.stopPropagation(); MissionsUI.abandonMission('${missionId}')">
                    Abandon
                </button>
            `;
        }
        html += '</div>';

        html += '</div>';
        return html;
    },

    /**
     * Render a completed mission card (compact)
     */
    renderCompletedCard(missionId) {
        const mission = this._getMissionDef(missionId);
        if (!mission) return '';

        const parsed = this._parseMissionId(missionId);
        const typeInfo = this._getTypeDisplayInfo(parsed?.type);
        const analytics = GameEngine.getMissionAnalytics?.(missionId);

        let html = `
            <div class="mission-card completed" data-mission-id="${missionId}" onclick="MissionsUI.openMissionDialog('${missionId}')">
                <div class="mission-card-header">
                    <span class="mission-type-badge" style="background: ${typeInfo.color}; opacity: 0.7">
                        ${typeInfo.icon} ${typeInfo.label}
                    </span>
                    <span class="completed-badge">✅</span>
                </div>
                <h4 class="mission-name">${mission.name}</h4>
        `;

        // Show analytics if available
        if (analytics) {
            html += `
                <div class="completion-stats">
                    <span>Completed ${analytics.completed}x</span>
                    ${analytics.fastestTime ? `<span>Best: ${this._formatTime(analytics.fastestTime)}</span>` : ''}
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render rewards preview
     */
    renderRewardsPreview(rewards) {
        if (!rewards) return '';

        const parts = [];

        // New format
        if (rewards.gold) parts.push(`💰 ${rewards.gold}`);
        if (rewards.experience) parts.push(`✨ ${rewards.experience} XP`);
        if (rewards.items?.length) parts.push(`🎁 ${rewards.items.length} item${rewards.items.length > 1 ? 's' : ''}`);

        // Legacy format (base/bonus)
        if (rewards.base) {
            if (rewards.base.currencies?.gold) parts.push(`💰 ${rewards.base.currencies.gold}`);
            if (rewards.base.exp) {
                const totalExp = Object.values(rewards.base.exp).reduce((a, b) => a + b, 0);
                if (totalExp > 0) parts.push(`✨ ${totalExp} XP`);
            }
            if (rewards.base.items?.length) parts.push(`🎁 ${rewards.base.items.length} item${rewards.base.items.length > 1 ? 's' : ''}`);
        }

        if (parts.length === 0) return '';

        return `
            <div class="mission-rewards-preview">
                <span class="rewards-label">Rewards:</span>
                <span class="rewards-items">${parts.join(' • ')}</span>
            </div>
        `;
    },

    /**
     * Open mission dialog
     */
    openMissionDialog(missionId) {
        this.currentDialog = missionId;
        this.updateMissions();
    },

    /**
     * Close mission dialog
     */
    closeMissionDialog() {
        this.currentDialog = null;
        this.lastDialogState = null;
        this.refresh();
    },

    /**
     * Accept a mission
     */
    acceptMission(missionId) {
        const result = GameEngine.startMission(missionId);
        if (result.success) {
            this.switchTab('active');
        } else {
            console.warn(`Could not accept mission: ${result.reason}`);
            // Could show a toast here
        }
    },

    /**
     * Abandon a mission
     */
    abandonMission(missionId) {
        if (confirm('Are you sure you want to abandon this mission?')) {
            GameEngine.abandonMission(missionId);
        }
    },

    /**
     * Submit a turn-in mission
     */
    submitMission(missionId) {
        const result = GameEngine.submitMission(missionId);
        if (!result.success) {
            console.warn(`Could not submit mission: ${result.reason}`);
            // Could show a toast here
        }
    },

    /**
     * Render mission dialog
     */
    renderDialog(missionId) {
        const mission = this._getMissionDef(missionId);
        if (!mission) {
            return '<div class="mission-dialog-error">Mission not found</div>';
        }

        const isActive = GameEngine.state.missions.active.includes(missionId);
        const isCompleted = GameEngine.state.missions.completed.includes(missionId);
        const progress = GameEngine.getMissionProgress(missionId);
        const canStart = GameEngine.canStartMission(missionId);
        const parsed = this._parseMissionId(missionId);
        const typeInfo = this._getTypeDisplayInfo(parsed?.type);
        const difficulty = GameEngine.calculateMissionDifficulty?.(missionId) || 1;

        // Check turn-in status
        const hasTurnIn = mission.objectives?.some(obj =>
            obj.type === 'turnIn' || obj.type === 'turnInSet' || obj.isTurnIn
        );
        const requiresTurnIn = mission.metadata?.requiresTurnIn === true;
        let turnInCheck = { canSubmit: false };
        if (isActive && (hasTurnIn || requiresTurnIn)) {
            turnInCheck = GameEngine.checkTurnInObjectives(missionId);
            // For missions that just require returning to missions tab (no item turn-in)
            // Check if all objectives are complete
            if (!turnInCheck.canSubmit && requiresTurnIn && !hasTurnIn) {
                const allComplete = progress && Object.values(progress.objectives).every(obj => obj.completed);
                if (allComplete) {
                    turnInCheck = { canSubmit: true };
                }
            }
        }

        const allObjectivesComplete = progress &&
            Object.values(progress.objectives).every(obj => obj.completed);

        let html = `
            <div class="mission-dialog">
                <div class="mission-dialog-content">
                    <!-- Header -->
                    <div class="mission-dialog-header">
                        <div class="mission-type-badge large" style="background: ${typeInfo.color}">
                            ${typeInfo.icon} ${typeInfo.label}
                        </div>
                        <button class="dialog-close-btn" onclick="MissionsUI.closeMissionDialog()">✕</button>
                    </div>

                    <!-- Title -->
                    <h2 class="mission-dialog-title">${mission.name}</h2>
                    <div class="mission-dialog-difficulty">
                        Difficulty: ${'★'.repeat(Math.min(5, Math.ceil(difficulty / 2)))}${'☆'.repeat(5 - Math.min(5, Math.ceil(difficulty / 2)))}
                    </div>

                    <!-- Description -->
                    <div class="mission-dialog-description">
                        ${mission.description}
                    </div>

                    <!-- Narrative (if available) -->
                    ${mission.narrative?.intro ? `
                        <div class="mission-narrative">
                            <p>"${mission.narrative.intro}"</p>
                        </div>
                    ` : ''}

                    <!-- Objectives -->
                    <div class="mission-dialog-section">
                        <h3>Objectives</h3>
                        <div class="objectives-list">
                            ${this.renderDialogObjectives(mission, progress, isCompleted)}
                        </div>
                    </div>

                    <!-- Requirements (if not met) -->
                    ${!canStart.canStart && !isActive && !isCompleted ? `
                        <div class="mission-dialog-section requirements">
                            <h3>Requirements</h3>
                            <div class="requirement-warning">
                                🔒 ${canStart.reason}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Rewards -->
                    <div class="mission-dialog-section">
                        <h3>Rewards</h3>
                        ${this.renderDialogRewards(mission.rewards)}
                    </div>

                    <!-- Actions -->
                    <div class="mission-dialog-actions">
        `;

        if (isCompleted && !isActive) {
            html += `
                <div class="completed-message">✅ Mission Completed</div>
            `;
            // Show replay if repeatable
            const isRepeatable = mission.repeatable || mission.metadata?.repeatable;
            if (isRepeatable && canStart.canStart) {
                html += `
                    <button class="dialog-action-btn accept" onclick="MissionsUI.acceptMission('${missionId}'); MissionsUI.closeMissionDialog()">
                        🔄 Replay Mission
                    </button>
                `;
            }
        } else if (isActive) {
            // Show submit if ready
            if (allObjectivesComplete && (hasTurnIn || requiresTurnIn)) {
                if (turnInCheck.canSubmit) {
                    html += `
                        <button class="dialog-action-btn submit" onclick="MissionsUI.submitMission('${missionId}'); MissionsUI.closeMissionDialog()">
                            ✅ Complete Mission
                        </button>
                    `;
                } else {
                    html += `
                        <div class="turnin-warning">⚠️ ${turnInCheck.reason}</div>
                    `;
                }
            } else if (allObjectivesComplete && !hasTurnIn && !requiresTurnIn) {
                // Auto-complete should have triggered, but show button anyway
                html += `
                    <button class="dialog-action-btn submit" onclick="GameEngine.completeMission('${missionId}'); MissionsUI.closeMissionDialog()">
                        ✅ Complete Mission
                    </button>
                `;
            }

            html += `
                <button class="dialog-action-btn abandon" onclick="MissionsUI.abandonMission('${missionId}'); MissionsUI.closeMissionDialog()">
                    ❌ Abandon Mission
                </button>
            `;
        } else if (canStart.canStart) {
            html += `
                <button class="dialog-action-btn accept" onclick="MissionsUI.acceptMission('${missionId}'); MissionsUI.closeMissionDialog()">
                    ✅ Accept Mission
                </button>
            `;
        }

        html += `
                        <button class="dialog-action-btn close" onclick="MissionsUI.closeMissionDialog()">
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render objectives in dialog
     * @param {object} mission - Mission definition
     * @param {object|null} progress - Progress object (null for completed/available missions)
     * @param {boolean} isCompleted - Whether mission is completed
     */
    renderDialogObjectives(mission, progress, isCompleted = false) {
        const objectives = mission.objectives || [];
        let html = '';

        // For completed missions, show a summary instead of progress bars
        if (isCompleted && !progress) {
            html += `
                <div class="objectives-completed-summary">
                    <div class="completed-banner">
                        <span class="completed-icon">🏆</span>
                        <span class="completed-text">All Objectives Completed!</span>
                    </div>
                    <div class="completed-objectives-list">
            `;
            objectives.forEach((objective, index) => {
                const required = objective.count || objective.required || 1;
                html += `
                    <div class="dialog-objective completed">
                        <div class="objective-header">
                            <span class="objective-icon">✅</span>
                            <span class="objective-text">${this._getObjectiveDisplayText(objective, objective)}</span>
                        </div>
                        <div class="objective-progress-text completed">${required}/${required}</div>
                    </div>
                `;
            });
            html += `
                    </div>
                </div>
            `;
            return html;
        }

        // For active missions or available missions
        objectives.forEach((objective, index) => {
            const objId = objective.id || `obj_${index + 1}`;
            const objProgress = progress?.objectives[objId];
            const objIsCompleted = objProgress?.completed || false;
            const current = objProgress?.current || 0;
            const required = objective.count || objective.required || 1;
            const percent = (current / required) * 100;

            html += `
                <div class="dialog-objective ${objIsCompleted ? 'completed' : ''}">
                    <div class="objective-header">
                        <span class="objective-icon">${objIsCompleted ? '✅' : '⬜'}</span>
                        <span class="objective-text">${this._getObjectiveDisplayText(objProgress || objective, objective)}</span>
                    </div>
                    ${progress ? `
                        <div class="objective-progress-bar">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="objective-progress-text">${current}/${required}</div>
                    ` : `
                        <div class="objective-requirement">Requires: ${required}</div>
                    `}
                </div>
            `;
        });

        return html;
    },

    /**
     * Render rewards in dialog
     */
    renderDialogRewards(rewards) {
        if (!rewards) return '<p class="no-rewards">No rewards specified</p>';

        let html = '<div class="rewards-grid">';

        // New format rewards
        if (rewards.gold) {
            html += `
                <div class="reward-item gold">
                    <span class="reward-icon">💰</span>
                    <span class="reward-amount">+${rewards.gold}</span>
                    <span class="reward-label">Gold</span>
                </div>
            `;
        }

        if (rewards.experience) {
            html += `
                <div class="reward-item xp">
                    <span class="reward-icon">✨</span>
                    <span class="reward-amount">+${rewards.experience}</span>
                    <span class="reward-label">XP</span>
                </div>
            `;
        }

        if (rewards.skills) {
            for (const skillId in rewards.skills) {
                const amount = rewards.skills[skillId];
                const skillDef = GameEngine.definitions?.skills?.[skillId];
                html += `
                    <div class="reward-item skill">
                        <span class="reward-icon">📚</span>
                        <span class="reward-amount">+${amount}</span>
                        <span class="reward-label">${skillDef?.name || skillId} XP</span>
                    </div>
                `;
            }
        }

        if (rewards.items) {
            for (const item of rewards.items) {
                const itemId = item.itemId || item.id;
                const quantity = item.quantity || item.amount || 1;
                const itemDef = typeof ItemAccessHelper !== 'undefined'
                    ? ItemAccessHelper.getItem(itemId)
                    : null;

                html += `
                    <div class="reward-item item">
                        <span class="reward-icon">${itemDef?.image || '🎁'}</span>
                        <span class="reward-amount">×${quantity}</span>
                        <span class="reward-label">${itemDef?.name || itemId}</span>
                    </div>
                `;
            }
        }

        // Legacy format (base/bonus)
        if (rewards.base) {
            if (rewards.base.currencies) {
                for (const currencyId in rewards.base.currencies) {
                    const amount = rewards.base.currencies[currencyId];
                    const icons = { gold: '💰', medals: '🏅', tomes: '📚', gems: '💎' };
                    html += `
                        <div class="reward-item currency">
                            <span class="reward-icon">${icons[currencyId] || '💰'}</span>
                            <span class="reward-amount">+${amount}</span>
                            <span class="reward-label">${currencyId}</span>
                        </div>
                    `;
                }
            }

            if (rewards.base.exp) {
                for (const skillId in rewards.base.exp) {
                    const amount = rewards.base.exp[skillId];
                    const skillDef = GameEngine.definitions?.skills?.[skillId];
                    html += `
                        <div class="reward-item skill">
                            <span class="reward-icon">✨</span>
                            <span class="reward-amount">+${amount}</span>
                            <span class="reward-label">${skillDef?.name || skillId} XP</span>
                        </div>
                    `;
                }
            }

            if (rewards.base.items) {
                for (const item of rewards.base.items) {
                    const itemDef = typeof ItemAccessHelper !== 'undefined'
                        ? ItemAccessHelper.getItem(item.itemId)
                        : null;

                    html += `
                        <div class="reward-item item">
                            <span class="reward-icon">${itemDef?.image || '🎁'}</span>
                            <span class="reward-amount">×${item.amount || 1}</span>
                            <span class="reward-label">${itemDef?.name || item.itemId}</span>
                        </div>
                    `;
                }
            }
        }

        html += '</div>';
        return html;
    },

    // === HELPER METHODS ===

    /**
     * Get mission definition
     */
    _getMissionDef(missionId) {
        // Try MissionRegistry
        if (typeof MissionRegistry !== 'undefined') {
            const def = MissionRegistry.get(missionId);
            if (def) return def;
        }

        // Fallback to definitions
        return GameEngine.definitions?.missions?.[missionId];
    },

    /**
     * Parse mission ID using MissionIdUtils
     */
    _parseMissionId(missionId) {
        if (typeof MissionIdUtils !== 'undefined') {
            return MissionIdUtils.parse(missionId);
        }
        return null;
    },

    /**
     * Sort missions using MissionIdUtils
     */
    _sortMissions(missionIds) {
        if (typeof MissionIdUtils !== 'undefined') {
            return MissionIdUtils.sort(missionIds);
        }
        return missionIds;
    },

    /**
     * Get type display info
     */
    _getTypeDisplayInfo(type) {
        if (typeof MissionIdUtils !== 'undefined') {
            return MissionIdUtils.getTypeDisplayInfo(type);
        }

        // Fallback
        const defaults = {
            main: { icon: '📖', color: '#2196F3', label: 'Main' },
            side: { icon: '📜', color: '#FF9800', label: 'Side' },
            daily: { icon: '🔄', color: '#9C27B0', label: 'Daily' }
        };
        return defaults[type] || { icon: '📋', color: '#888', label: 'Quest' };
    },

    /**
     * Organize missions by type
     */
    _organizeMissions(missionIds) {
        const organized = {
            main: [],
            side: [],
            daily: [],
            other: []
        };

        for (const missionId of missionIds) {
            const parsed = this._parseMissionId(missionId);
            const type = parsed?.type || 'other';

            if (organized[type]) {
                organized[type].push(missionId);
            } else {
                organized.other.push(missionId);
            }
        }

        // Sort each category
        for (const type in organized) {
            organized[type] = this._sortMissions(organized[type]);
        }

        return organized;
    },

    /**
     * Get objective display text
     */
    _getObjectiveDisplayText(obj, objDef) {
        // Use objective definition description if available (most accurate)
        if (objDef?.description) {
            return objDef.description;
        }

        // Use global function if available, but merge objDef with obj for complete data
        if (typeof getObjectiveDisplayText !== 'undefined') {
            // Merge definition with progress to ensure all properties are available
            const mergedObj = { ...objDef, ...obj };
            return getObjectiveDisplayText(mergedObj, { showProgress: false });
        }

        // Basic fallback
        const typeLabels = {
            kill: 'Defeat',
            killAny: 'Defeat enemies',
            killType: 'Hunt',
            gather: 'Collect',
            harvest: 'Harvest',
            craft: 'Craft',
            explore: 'Explore',
            turnIn: 'Deliver',
            equip: 'Equip',
            levelSkill: 'Train',
            custom: 'Complete'
        };

        const label = typeLabels[obj.type] || obj.type;
        const target = obj.target || '';

        return `${label} ${target}`;
    },

    /**
     * Format time in seconds to readable string
     */
    _formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
};

// Global handlers for backwards compatibility
function openMissionDialog(missionId) {
    MissionsUI.openMissionDialog(missionId);
}

function closeMissionDialog() {
    MissionsUI.closeMissionDialog();
}

function acceptMission(missionId) {
    MissionsUI.acceptMission(missionId);
}

function abandonMission(missionId) {
    MissionsUI.abandonMission(missionId);
}

function completeMission(missionId) {
    GameEngine.completeMission(missionId);
    MissionsUI.closeMissionDialog();
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MissionsUI.init());
    } else {
        MissionsUI.init();
    }
}
