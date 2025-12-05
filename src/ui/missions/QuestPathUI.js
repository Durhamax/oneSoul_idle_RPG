/**
 * QUEST PATH UI COMPONENT
 *
 * Visual timeline/path display for main story progression.
 * Replaces the grid layout with a connected node path showing quest flow.
 *
 * Features:
 * - Visual node path with connections
 * - Completed/Active/Locked states
 * - Chapter groupings
 * - Progress indicators
 * - Click to expand quest details
 */

const QuestPathUI = {
    // Configuration
    config: {
        nodeSize: 60,
        nodeSpacing: 100,
        pathWidth: 4,
        showSideQuests: false  // Toggle side quests in path
    },

    // State
    expandedMission: null,

    /**
     * Render the full quest path
     * @returns {string} HTML content
     */
    render() {
        const missionsState = GameEngine.state.missions;
        if (!missionsState) {
            return '<div class="quest-path-error">Mission system not initialized</div>';
        }

        // Get all main story missions from registry
        const mainStoryMissions = this._getMainStoryMissions();

        if (mainStoryMissions.length === 0) {
            return this._renderNoMissions();
        }

        // Group by chapter/tier
        const chapters = this._groupByChapter(mainStoryMissions);

        return this._renderPath(chapters, missionsState);
    },

    /**
     * Get all main story missions sorted by ID
     */
    _getMainStoryMissions() {
        const missions = [];

        // Get from MissionRegistry
        if (typeof MissionRegistry !== 'undefined') {
            const allMissions = MissionRegistry.getAllActive();
            for (const missionId in allMissions) {
                const parsed = this._parseMissionId(missionId);
                // Main story is type 1 (mission_1XX)
                if (parsed?.type === 'main' && parsed.number < 900) {
                    missions.push({
                        id: missionId,
                        def: allMissions[missionId],
                        parsed: parsed
                    });
                }
            }
        }

        // Sort by mission number
        missions.sort((a, b) => a.parsed.number - b.parsed.number);

        return missions;
    },

    /**
     * Group missions by chapter (tier)
     */
    _groupByChapter(missions) {
        const chapters = {};

        missions.forEach(mission => {
            const tier = mission.def.tier || mission.parsed.tier || 1;
            if (!chapters[tier]) {
                chapters[tier] = {
                    tier: tier,
                    name: this._getChapterName(tier),
                    missions: []
                };
            }
            chapters[tier].missions.push(mission);
        });

        return Object.values(chapters).sort((a, b) => a.tier - b.tier);
    },

    /**
     * Get chapter name by tier
     */
    _getChapterName(tier) {
        const names = {
            1: 'Prologue: First Steps',
            2: 'Chapter 1: The Cradle',
            3: 'Chapter 2: Expanding Horizons',
            4: 'Chapter 3: Mastery',
            5: 'Chapter 4: The Challenge',
            6: 'Chapter 5: Endgame'
        };
        return names[tier] || `Chapter ${tier}`;
    },

    /**
     * Render the path with chapters
     */
    _renderPath(chapters, missionsState) {
        let html = '<div class="quest-path-container">';

        // Overall progress
        const totalMissions = chapters.reduce((sum, ch) => sum + ch.missions.length, 0);
        const completedCount = chapters.reduce((sum, ch) =>
            sum + ch.missions.filter(m => missionsState.completed.includes(m.id)).length, 0
        );
        const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

        html += `
            <div class="quest-path-header">
                <h2>Main Story Progress</h2>
                <div class="path-progress-bar">
                    <div class="path-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="path-progress-text">${completedCount}/${totalMissions} Quests Completed</span>
            </div>
        `;

        html += '<div class="quest-path-chapters">';

        chapters.forEach((chapter, chapterIndex) => {
            html += this._renderChapter(chapter, missionsState, chapterIndex === 0);
        });

        html += '</div>';
        html += '</div>';

        return html;
    },

    /**
     * Render a chapter section
     */
    _renderChapter(chapter, missionsState, isFirst) {
        const completedInChapter = chapter.missions.filter(m =>
            missionsState.completed.includes(m.id)
        ).length;
        const chapterComplete = completedInChapter === chapter.missions.length;
        const chapterStarted = completedInChapter > 0;

        let html = `
            <div class="quest-chapter ${chapterComplete ? 'complete' : ''} ${chapterStarted ? 'started' : ''}">
                <div class="chapter-header">
                    <span class="chapter-icon">${chapterComplete ? '✅' : '📖'}</span>
                    <span class="chapter-name">${chapter.name}</span>
                    <span class="chapter-progress">${completedInChapter}/${chapter.missions.length}</span>
                </div>
                <div class="chapter-path">
        `;

        chapter.missions.forEach((mission, index) => {
            const isCompleted = missionsState.completed.includes(mission.id);
            const isActive = missionsState.active.includes(mission.id);
            const isAvailable = missionsState.available.includes(mission.id);
            const isLocked = !isCompleted && !isActive && !isAvailable;

            // Render connector (except for first node)
            if (index > 0) {
                const prevCompleted = missionsState.completed.includes(chapter.missions[index - 1].id);
                html += `
                    <div class="path-connector ${prevCompleted ? 'complete' : ''}">
                        <div class="connector-line"></div>
                    </div>
                `;
            }

            html += this._renderNode(mission, {
                isCompleted,
                isActive,
                isAvailable,
                isLocked,
                isExpanded: this.expandedMission === mission.id
            });
        });

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render a quest node
     */
    _renderNode(mission, state) {
        const statusClass = state.isCompleted ? 'completed' :
                           state.isActive ? 'active' :
                           state.isAvailable ? 'available' : 'locked';

        const statusIcon = state.isCompleted ? '✅' :
                          state.isActive ? '🎯' :
                          state.isAvailable ? '📋' : '🔒';

        const progress = state.isActive ? GameEngine.getMissionProgress(mission.id) : null;
        let progressPercent = 0;
        if (progress) {
            const objectives = Object.values(progress.objectives);
            const completed = objectives.filter(o => o.completed).length;
            progressPercent = objectives.length > 0 ? (completed / objectives.length) * 100 : 0;
        }

        let html = `
            <div class="quest-node ${statusClass}"
                 data-mission-id="${mission.id}"
                 onclick="QuestPathUI.toggleExpand('${mission.id}')">
                <div class="node-icon">${statusIcon}</div>
                <div class="node-title">${mission.def.name}</div>
                ${state.isActive ? `
                    <div class="node-progress">
                        <div class="node-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                ` : ''}
            </div>
        `;

        // Expanded details
        if (state.isExpanded) {
            html += this._renderExpandedDetails(mission, state, progress);
        }

        return html;
    },

    /**
     * Render expanded quest details
     */
    _renderExpandedDetails(mission, state, progress) {
        const def = mission.def;

        let html = `
            <div class="quest-details-expanded">
                <p class="quest-description">${def.description}</p>
        `;

        // Objectives
        if (def.objectives && def.objectives.length > 0) {
            html += '<div class="quest-objectives">';
            def.objectives.forEach((obj, index) => {
                const objId = obj.id || `obj_${index + 1}`;
                const objProgress = progress?.objectives[objId];
                const objCompleted = objProgress?.completed || state.isCompleted;
                const current = objProgress?.current || (state.isCompleted ? (obj.count || 1) : 0);
                const required = obj.count || obj.required || 1;

                html += `
                    <div class="quest-objective ${objCompleted ? 'completed' : ''}">
                        <span class="obj-icon">${objCompleted ? '✅' : '⬜'}</span>
                        <span class="obj-text">${obj.description || obj.type}</span>
                        <span class="obj-progress">${current}/${required}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Rewards preview
        if (def.rewards) {
            html += '<div class="quest-rewards-mini">';
            if (def.rewards.gold) html += `<span class="reward">💰 ${def.rewards.gold}</span>`;
            if (def.rewards.experience) html += `<span class="reward">✨ ${def.rewards.experience} XP</span>`;
            if (def.rewards.items?.length) html += `<span class="reward">🎁 ${def.rewards.items.length} items</span>`;
            html += '</div>';
        }

        // Action buttons
        html += '<div class="quest-actions">';
        if (state.isAvailable) {
            html += `<button class="quest-action-btn accept" onclick="event.stopPropagation(); MissionsUI.acceptMission('${mission.id}')">Accept Quest</button>`;
        } else if (state.isActive) {
            html += `<button class="quest-action-btn view" onclick="event.stopPropagation(); MissionsUI.openMissionDialog('${mission.id}')">View Details</button>`;
        } else if (state.isLocked) {
            html += `<span class="quest-locked-hint">Complete previous quests to unlock</span>`;
        }
        html += '</div>';

        html += '</div>';
        return html;
    },

    /**
     * Toggle expanded state for a mission
     */
    toggleExpand(missionId) {
        if (this.expandedMission === missionId) {
            this.expandedMission = null;
        } else {
            this.expandedMission = missionId;
        }
        // Trigger re-render
        if (typeof MissionsUI !== 'undefined') {
            MissionsUI.refresh();
        }
    },

    /**
     * Render no missions state
     */
    _renderNoMissions() {
        return `
            <div class="quest-path-empty">
                <div class="empty-icon">🗺️</div>
                <h3>No Quests Available</h3>
                <p>The main story quests will appear here once available.</p>
            </div>
        `;
    },

    /**
     * Parse mission ID
     */
    _parseMissionId(missionId) {
        if (typeof MissionIdUtils !== 'undefined') {
            return MissionIdUtils.parse(missionId);
        }

        // Fallback parsing for mission_XYY format
        const match = missionId.match(/^mission_(\d)(\d{2})$/);
        if (match) {
            const typeCode = parseInt(match[1]);
            const number = parseInt(match[2]);
            const typeMap = { 1: 'main', 2: 'side', 3: 'daily', 4: 'milestone', 5: 'regional' };
            return {
                type: typeMap[typeCode] || 'unknown',
                number: number,
                tier: Math.floor(number / 10) + 1
            };
        }

        return null;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.QuestPathUI = QuestPathUI;
}
