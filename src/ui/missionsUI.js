/**
 * MissionsUI - Vertical Quest Path View
 *
 * Displays missions as a vertical journey with inline details.
 */
const MissionsUI = {
    container: null,
    expandedMission: null,
    _eventSubscriptions: [],
    _lastStateHash: null,

    init() {
        this.container = document.getElementById('missionsView');
        this._subscribeToEvents();
        console.log('✅ MissionsUI (Vertical Quest Path) initialized');
    },

    _subscribeToEvents() {
        if (typeof EventBus === 'undefined') return;

        // Clear existing subscriptions
        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];

        this._eventSubscriptions.push(
            EventBus.on('mission:started', () => this.render()),
            EventBus.on('mission:completed', () => this.render()),
            EventBus.on('mission:abandoned', () => this.render()),
            EventBus.on('missions:availableUpdated', () => this.render()),
            EventBus.on('mission:objectiveProgress', () => this.updateProgress()),
            EventBus.on('mission:objectiveCompleted', () => this.updateProgress())
        );
    },

    /**
     * Force refresh
     */
    refresh() {
        this.render();
    },

    /**
     * Main render function - called by uiCore when missions view is active
     */
    updateMissions() {
        const state = GameEngine.state.missions || {};

        // Get mission count to detect if missions have been registered since last render
        let missionCount = 0;
        if (typeof MissionRegistry !== 'undefined' && MissionRegistry.getAllActive) {
            missionCount = Object.keys(MissionRegistry.getAllActive()).length;
        }

        // Only hash the arrays that affect which missions show
        const stateHash = JSON.stringify({
            active: state.active,
            available: state.available,
            completed: state.completed,
            missionCount: missionCount // Include mission count to detect registration
        });

        if (stateHash === this._lastStateHash && this.container?.innerHTML) {
            return;
        }

        this._lastStateHash = stateHash;
        this.render();
    },

    render() {
        if (!this.container) {
            this.container = document.getElementById('missionsView');
        }
        if (!this.container) return;

        const state = GameEngine.state.missions || {};
        const missionsByRegion = this.organizeMissionsByRegion();

        // Mark all available missions as seen (for notification badge)
        this.markMissionsAsSeen(state);

        this.container.innerHTML = `
            <div class="quest-journey">
                <header class="journey-header">
                    <h1>Journey Through Aurora Vitae</h1>
                    <p>Follow the path of a Unity ranger</p>
                </header>

                <div class="journey-regions">
                    ${this.renderAllRegions(missionsByRegion, state)}
                </div>
            </div>
        `;

        this.scrollToActive(state);
    },

    organizeMissionsByRegion() {
        let allMissions = {};

        // Get from MissionRegistry
        if (typeof MissionRegistry !== 'undefined') {
            allMissions = MissionRegistry.getAllActive ?
                MissionRegistry.getAllActive() :
                MissionRegistry.getAll?.() || {};
        }

        const byRegion = {};

        Object.values(allMissions).forEach(mission => {
            const region = mission.regionRequired || 'region_-3_-4';
            if (!byRegion[region]) {
                byRegion[region] = { main: [], side: [], daily: [] };
            }

            const parsed = this.parseMissionId(mission.id);
            if (parsed.isMainStory) {
                byRegion[region].main.push(mission);
            } else if (parsed.typeCode === 3) {
                byRegion[region].daily.push(mission);
            } else {
                byRegion[region].side.push(mission);
            }
        });

        // Sort main story by order
        Object.values(byRegion).forEach(group => {
            group.main.sort((a, b) => {
                const orderA = this.parseMissionId(a.id).order;
                const orderB = this.parseMissionId(b.id).order;
                return orderA - orderB;
            });
        });

        return byRegion;
    },

    parseMissionId(missionId) {
        const match = missionId.match(/mission_(\d)(\d{2})/);
        if (!match) return { typeCode: 0, order: 0, isMainStory: false };

        return {
            typeCode: parseInt(match[1]),
            order: parseInt(match[2]),
            isMainStory: parseInt(match[1]) === 1
        };
    },

    getStatus(missionId, state) {
        if (state.completed?.includes(missionId)) return 'completed';
        if (state.active?.includes(missionId)) return 'active';
        if (state.available?.includes(missionId)) return 'available';
        return 'locked';
    },

    getStatusIcon(status) {
        return { completed: '✅', active: '⚡', available: '📜', locked: '🔒' }[status] || '❓';
    },

    renderAllRegions(missionsByRegion, state) {
        // Use the actual region IDs from the mission data
        const regionOrder = ['region_-3_-4', 'region_-2_-4', 'region_-1_-4'];

        return regionOrder.map((regionId, idx) => {
            const regionData = missionsByRegion[regionId];
            const info = this.getRegionInfo(regionId);
            const isUnlocked = this.isRegionUnlocked(regionId, state);

            return `
                <section class="quest-region ${isUnlocked ? '' : 'locked'}" data-region="${regionId}">
                    <div class="region-header">
                        <span class="region-icon">${info.icon}</span>
                        <h2 class="region-name">${info.name}</h2>
                        ${!isUnlocked ? '<span class="lock-badge">🔒 Locked</span>' : ''}
                    </div>

                    <div class="region-content">
                        ${isUnlocked ? this.renderRegionMissions(regionData, state) : this.renderLockedMessage(regionId)}
                    </div>
                </section>

                ${idx < regionOrder.length - 1 ? '<div class="region-divider"></div>' : ''}
            `;
        }).join('');
    },

    renderRegionMissions(regionData, state) {
        if (!regionData || regionData.main.length === 0) {
            return '<p class="no-missions">No missions in this region yet</p>';
        }

        let html = '';

        // Main story missions
        if (regionData.main.length > 0) {
            html += '<div class="mission-track">';
            html += '<div class="track-label">MAIN STORY</div>';
            html += '<div class="mission-list">';

            regionData.main.forEach((mission, index) => {
                const status = this.getStatus(mission.id, state);
                const isLast = index === regionData.main.length - 1;
                const progress = this.getProgress(mission.id, state);

                html += this.renderMissionRow(mission, status, isLast, progress);
            });

            html += '</div></div>';
        }

        // Side quests
        if (regionData.side?.length > 0) {
            html += '<div class="mission-track side-track">';
            html += '<div class="track-label">SIDE QUESTS</div>';
            html += '<div class="mission-list">';

            regionData.side.forEach((mission, index) => {
                const status = this.getStatus(mission.id, state);
                const isLast = index === regionData.side.length - 1;
                html += this.renderMissionRow(mission, status, isLast, null, true);
            });

            html += '</div></div>';
        }

        return html;
    },

    renderMissionRow(mission, status, isLast, progress, isSide = false) {
        const icon = this.getStatusIcon(status);
        const rewards = this.formatRewardsPreview(mission.rewards);
        const isExpanded = this.expandedMission === mission.id;

        // Check if mission is ready to complete (all objectives done)
        const isReadyToComplete = status === 'active' && this.canComplete(mission.id);
        const readyClass = isReadyToComplete ? 'ready-to-complete' : '';

        return `
            <div class="mission-row status-${status} ${isExpanded ? 'expanded' : ''} ${readyClass}"
                 data-mission="${mission.id}"
                 data-action="toggle-mission">

                <!-- Left: Status & Connector -->
                <div class="mission-status">
                    <div class="status-node ${status} ${readyClass}">
                        <span class="status-icon">${isReadyToComplete ? '✨' : icon}</span>
                    </div>
                    ${!isLast ? '<div class="status-line"></div>' : ''}
                </div>

                <!-- Center: Mission Info -->
                <div class="mission-info">
                    <div class="mission-header">
                        <span class="mission-number">${this.parseMissionId(mission.id).order}</span>
                        <h3 class="mission-name">${mission.name}</h3>
                        ${status === 'active' && progress !== null && !isReadyToComplete ?
                            `<div class="mission-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                </div>
                                <span class="progress-text">${progress}%</span>
                            </div>` : ''
                        }
                        ${isReadyToComplete ?
                            `<button class="mission-complete-inline" data-action="complete-mission" data-mission="${mission.id}">Complete</button>` : ''
                        }
                    </div>
                    <p class="mission-description">${mission.description || ''}</p>

                    <!-- Expanded Details -->
                    ${isExpanded ? this.renderExpandedDetails(mission, status) : ''}
                </div>

                <!-- Right: Rewards Preview -->
                <div class="mission-rewards">
                    ${rewards}
                </div>

                <!-- Expand Indicator -->
                <div class="expand-indicator">
                    <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
                </div>
            </div>
        `;
    },

    renderExpandedDetails(mission, status) {
        const state = GameEngine.state.missions || {};
        const progress = state.activeProgress?.[mission.id];

        let objectivesHtml = '';
        if (mission.objectives?.length > 0) {
            objectivesHtml = '<div class="expanded-objectives"><h4>Objectives</h4><ul>';
            mission.objectives.forEach(obj => {
                const objId = obj.id || `obj_${mission.objectives.indexOf(obj) + 1}`;
                const objProg = progress?.objectives?.[objId];
                const current = objProg?.current || 0;
                const required = objProg?.required || obj.count || 1;
                const done = current >= required;

                objectivesHtml += `
                    <li class="${done ? 'complete' : ''}">
                        <span class="obj-check">${done ? '✅' : '⬜'}</span>
                        <span class="obj-text">${obj.description}</span>
                        ${obj.count ? `<span class="obj-progress">${current}/${required}</span>` : ''}
                    </li>
                `;
            });
            objectivesHtml += '</ul></div>';
        }

        // NPC Dialog
        let dialogHtml = '';
        if (mission.dialog?.npc) {
            const text = status === 'completed' ? mission.dialog.completion :
                        status === 'active' ? mission.dialog.body :
                        mission.dialog.intro;
            if (text) {
                dialogHtml = `
                    <div class="expanded-dialog">
                        <div class="npc-badge">
                            <span class="npc-icon">${mission.dialog.npcIcon || '👤'}</span>
                            <span class="npc-name">${mission.dialog.npc}</span>
                        </div>
                        <p class="npc-text">"${text}"</p>
                    </div>
                `;
            }
        }

        // Action Button
        let actionHtml = '';
        if (status === 'available') {
            actionHtml = `<button class="mission-action start" data-action="start-mission" data-mission="${mission.id}">Start Mission</button>`;
        } else if (status === 'active') {
            const canComplete = this.canComplete(mission.id);
            if (canComplete) {
                actionHtml = `<button class="mission-action complete" data-action="complete-mission" data-mission="${mission.id}">Complete Mission</button>`;
            } else {
                actionHtml = `<button class="mission-action abandon" data-action="abandon-mission" data-mission="${mission.id}">Abandon</button>`;
            }
        }

        return `
            <div class="expanded-content">
                ${dialogHtml}
                ${objectivesHtml}
                <div class="expanded-actions">${actionHtml}</div>
            </div>
        `;
    },

    formatRewardsPreview(rewards) {
        if (!rewards) return '';

        const parts = [];

        if (rewards.characterXP || rewards.experience) {
            const xp = rewards.characterXP || rewards.experience;
            parts.push(`<span class="reward-xp">⭐ ${xp}</span>`);
        }

        if (rewards.gold) {
            parts.push(`<span class="reward-gold">💰 ${rewards.gold}</span>`);
        }

        if (rewards.items?.length > 0) {
            // Show first 2 items max
            rewards.items.slice(0, 2).forEach(item => {
                const def = typeof ItemRegistry !== 'undefined' ? ItemRegistry.get(item.itemId) : null;
                const icon = def?.icon || '📦';
                const name = def?.name || item.itemId;
                // Use emoji if icon is emoji, otherwise show generic package icon
                const displayIcon = icon.length <= 2 ? icon : '📦';
                parts.push(`<span class="reward-item" title="${item.quantity || 1}x ${name}">${displayIcon}</span>`);
            });

            if (rewards.items.length > 2) {
                parts.push(`<span class="reward-more">+${rewards.items.length - 2}</span>`);
            }
        }

        return parts.join('');
    },

    getProgress(missionId, state) {
        const progress = state.activeProgress?.[missionId];
        if (!progress?.objectives) return null;

        let total = 0, done = 0;
        Object.values(progress.objectives).forEach(obj => {
            total += obj.required || 1;
            done += Math.min(obj.current || 0, obj.required || 1);
        });

        return total > 0 ? Math.round((done / total) * 100) : 0;
    },

    canComplete(missionId) {
        const state = GameEngine.state.missions || {};
        const progress = state.activeProgress?.[missionId];
        if (!progress?.objectives) return false;

        return Object.values(progress.objectives).every(obj =>
            (obj.current || 0) >= (obj.required || 1)
        );
    },

    /**
     * Mark available missions as seen (removes them from notification badge)
     */
    markMissionsAsSeen(state) {
        if (!state.available || !GameEngine.state.missions) return;

        // Initialize seenMissions array if it doesn't exist
        if (!GameEngine.state.missions.seenMissions) {
            GameEngine.state.missions.seenMissions = [];
        }

        const seenMissions = GameEngine.state.missions.seenMissions;
        let changed = false;

        // Add any available missions that haven't been seen yet
        for (const missionId of state.available) {
            if (!seenMissions.includes(missionId)) {
                seenMissions.push(missionId);
                changed = true;
            }
        }

        // Also mark active missions as seen
        if (state.active) {
            for (const missionId of state.active) {
                if (!seenMissions.includes(missionId)) {
                    seenMissions.push(missionId);
                    changed = true;
                }
            }
        }

        // Trigger badge update if we marked any new missions as seen
        if (changed && typeof UICore !== 'undefined' && UICore.updateNotificationBadges) {
            UICore.updateNotificationBadges();
        }
    },

    getRegionInfo(regionId) {
        const regions = {
            'region_-3_-4': { name: 'The Cradle', icon: '🏠' },
            'region_-2_-4': { name: 'Peaceful Meadows', icon: '🌾' },
            'region_-1_-4': { name: 'The Frontier', icon: '🌲' }
        };
        return regions[regionId] || { name: regionId, icon: '📍' };
    },

    isRegionUnlocked(regionId, state) {
        // The Cradle (starting region) always unlocked
        if (regionId === 'region_-3_-4') return true;

        // Peaceful Meadows requires completing mission_106
        if (regionId === 'region_-2_-4') {
            return state.completed?.includes('mission_106');
        }

        // The Frontier requires completing region 2
        if (regionId === 'region_-1_-4') {
            // TODO: Add proper check when region 2 missions exist
            return false;
        }

        return false;
    },

    renderLockedMessage(regionId) {
        const requirements = {
            'region_-2_-4': 'Complete "Force of Nature" to unlock',
            'region_-1_-4': 'Complete Peaceful Meadows to unlock'
        };
        return `
            <div class="locked-message">
                <span class="lock-icon">🔒</span>
                <p>${requirements[regionId] || 'Complete previous region'}</p>
            </div>
        `;
    },

    // === INTERACTIONS ===

    toggleMission(missionId) {
        if (this.expandedMission === missionId) {
            this.expandedMission = null;
        } else {
            this.expandedMission = missionId;
        }
        this.render();
    },

    updateProgress() {
        // Quick update without full re-render
        const state = GameEngine.state.missions || {};

        state.active?.forEach(missionId => {
            const progress = this.getProgress(missionId, state);
            const row = this.container?.querySelector(`[data-mission="${missionId}"]`);
            if (row && progress !== null) {
                const fill = row.querySelector('.progress-fill');
                const text = row.querySelector('.progress-text');
                if (fill) fill.style.width = `${progress}%`;
                if (text) text.textContent = `${progress}%`;
            }
        });

        // Update expanded mission objectives if viewing an active mission
        if (this.expandedMission && state.active?.includes(this.expandedMission)) {
            this._updateExpandedObjectives(this.expandedMission, state);
        }
    },

    _updateExpandedObjectives(missionId, state) {
        const row = this.container?.querySelector(`[data-mission="${missionId}"]`);
        if (!row) return;

        const objectivesList = row.querySelector('.expanded-objectives ul');
        if (!objectivesList) return;

        const mission = this._getMissionDef(missionId);
        if (!mission?.objectives) return;

        const missionProgress = state.activeProgress?.[missionId];
        const objectives = missionProgress?.objectives;

        const listItems = objectivesList.querySelectorAll('li');
        mission.objectives.forEach((obj, index) => {
            const li = listItems[index];
            if (!li) return;

            const objId = obj.id || `obj_${index + 1}`;
            const objProgress = objectives?.[objId];
            const current = objProgress?.current || 0;
            const required = objProgress?.required || obj.count || 1;
            const isComplete = current >= required;

            li.className = isComplete ? 'complete' : '';

            const icon = li.querySelector('.obj-check');
            if (icon) icon.textContent = isComplete ? '✅' : '⬜';

            const count = li.querySelector('.obj-progress');
            if (count) count.textContent = `${current}/${required}`;
        });

        // Update action button if mission is now completable
        const isComplete = this.canComplete(missionId);
        const actionsDiv = row.querySelector('.expanded-actions');
        if (actionsDiv && isComplete) {
            const existingCompleteBtn = actionsDiv.querySelector('[data-action="complete-mission"]');
            if (!existingCompleteBtn) {
                actionsDiv.innerHTML = `<button class="mission-action complete" data-action="complete-mission" data-mission="${missionId}">Complete Mission</button>`;
            }
        }
    },

    scrollToActive(state) {
        requestAnimationFrame(() => {
            const active = state.active?.[0];
            const available = state.available?.find(id => this.parseMissionId(id).isMainStory);
            const target = active || available;

            if (target) {
                const row = this.container?.querySelector(`[data-mission="${target}"]`);
                row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    },

    // === HELPER METHODS ===

    _getMissionDef(missionId) {
        if (typeof MissionRegistry !== 'undefined') {
            return MissionRegistry.get(missionId);
        }
        return GameEngine.definitions?.missions?.[missionId];
    },

    // === LEGACY COMPATIBILITY ===

    // These methods maintain compatibility with old code
    selectMission(missionId) {
        this.toggleMission(missionId);
    },

    hideDetailPanel() {
        this.expandedMission = null;
        this.render();
    },

    openMissionDialog(missionId) {
        this.toggleMission(missionId);
    },

    closeMissionDialog() {
        this.hideDetailPanel();
    },

    acceptMission(missionId) {
        const result = GameEngine.startMission(missionId);
        if (result.success) {
            this.expandedMission = missionId;
            this.render();
        } else {
            console.warn(`Could not accept mission: ${result.reason}`);
        }
    },

    abandonMission(missionId) {
        if (confirm('Are you sure you want to abandon this mission?')) {
            GameEngine.abandonMission(missionId);
            this.expandedMission = null;
            this.render();
        }
    },

    submitMission(missionId) {
        const result = GameEngine.submitMission?.(missionId) || GameEngine.completeMission?.(missionId);
        if (result?.success !== false) {
            this.expandedMission = null;
            this.render();
        }
    },

    switchTab(tabName) {
        // No-op - quest path has no tabs
        console.log('MissionsUI.switchTab() called but quest path view has no tabs');
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

// Browser global access
if (typeof window !== 'undefined') {
    window.MissionsUI = MissionsUI;
}
