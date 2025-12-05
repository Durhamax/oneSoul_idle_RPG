/**
 * COMPLETED MISSIONS TAB COMPONENT
 *
 * Displays completed main story missions in reverse chronological order.
 * Filters out test missions, daily/repeatable missions, and non-story content.
 *
 * Features:
 * - Shows only main story missions (type code 1)
 * - Sorts newest first (by completion order in array)
 * - Compact card display with completion stats
 */

const CompletedMissionsTab = {
    /**
     * Render the completed missions tab content
     * @returns {string} HTML content
     */
    render() {
        const completedMissions = GameEngine.state.missions?.completed || [];

        if (completedMissions.length === 0) {
            return this._renderEmpty();
        }

        // Filter to main story only and reverse for newest first
        const mainStoryMissions = this._filterMainStory(completedMissions);

        if (mainStoryMissions.length === 0) {
            return this._renderEmpty('No main story missions completed yet.');
        }

        // Reverse to show newest first (last completed at top)
        const sortedMissions = [...mainStoryMissions].reverse();

        return this._renderMissionList(sortedMissions);
    },

    /**
     * Filter to main story missions only
     * @param {string[]} missionIds - Array of mission IDs
     * @returns {string[]} Filtered array of main story mission IDs
     */
    _filterMainStory(missionIds) {
        return missionIds.filter(missionId => {
            // Parse mission ID to get type
            const parsed = this._parseMissionId(missionId);
            if (!parsed) return false;

            // Only include main story (type 1)
            if (parsed.type !== 'main') return false;

            // Skip test missions (9xx series)
            if (parsed.number >= 900) return false;

            // Verify mission exists in registry
            const mission = this._getMissionDef(missionId);
            if (!mission) return false;

            // Skip repeatable missions
            if (mission.repeatable || mission.metadata?.repeatable) return false;

            return true;
        });
    },

    /**
     * Render empty state
     * @param {string} message - Optional custom message
     * @returns {string} HTML
     */
    _renderEmpty(message = 'No completed missions yet.') {
        return `
            <div class="missions-empty">
                <div class="empty-icon">🏆</div>
                <h3>Your Journey Awaits</h3>
                <p>${message}</p>
                <p class="empty-hint">Complete main story missions to see them here.</p>
            </div>
        `;
    },

    /**
     * Render the mission list
     * @param {string[]} missionIds - Sorted array of mission IDs
     * @returns {string} HTML
     */
    _renderMissionList(missionIds) {
        let html = `
            <div class="completed-missions-header">
                <span class="completed-count">${missionIds.length} Main Story Missions Completed</span>
            </div>
            <div class="completed-missions-list">
        `;

        missionIds.forEach((missionId, index) => {
            html += this._renderCompletedCard(missionId, index + 1);
        });

        html += '</div>';
        return html;
    },

    /**
     * Render a completed mission card
     * @param {string} missionId - Mission ID
     * @param {number} order - Display order (1-based)
     * @returns {string} HTML
     */
    _renderCompletedCard(missionId, order) {
        const mission = this._getMissionDef(missionId);
        if (!mission) return '';

        const analytics = GameEngine.getMissionAnalytics?.(missionId);
        const parsed = this._parseMissionId(missionId);

        // Get chapter/tier info
        const tier = mission.tier || parsed?.tier || 1;
        const tierLabels = ['Prologue', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
        const chapterLabel = tierLabels[Math.min(tier, tierLabels.length - 1)] || `Tier ${tier}`;

        return `
            <div class="completed-mission-card" data-mission-id="${missionId}" onclick="MissionsUI.openMissionDialog('${missionId}')">
                <div class="completed-order">#${order}</div>
                <div class="completed-info">
                    <div class="completed-chapter">${chapterLabel}</div>
                    <h4 class="completed-name">${mission.name}</h4>
                    ${mission.description ? `<p class="completed-desc">${mission.description}</p>` : ''}
                </div>
                <div class="completed-stats">
                    <span class="completed-badge">✅ Completed</span>
                    ${analytics?.fastestTime ? `
                        <span class="completed-time">⏱️ ${this._formatTime(analytics.fastestTime)}</span>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Parse mission ID using MissionIdUtils
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
    },

    /**
     * Get mission definition
     */
    _getMissionDef(missionId) {
        if (typeof MissionRegistry !== 'undefined') {
            const def = MissionRegistry.get(missionId);
            if (def) return def;
        }
        return GameEngine?.definitions?.missions?.[missionId];
    },

    /**
     * Format time in seconds
     */
    _formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.CompletedMissionsTab = CompletedMissionsTab;
}
