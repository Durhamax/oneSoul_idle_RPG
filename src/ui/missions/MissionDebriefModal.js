/**
 * MissionDebriefModal - Mission completion celebration and rewards display
 *
 * Shows a debrief modal when missions are completed with:
 * - NPC dialog (completion text)
 * - Reward summary with item details
 * - Mission lore/narrative
 *
 * Subscribes to EventBus:
 * - mission:completed - Shows debrief modal
 */
const MissionDebriefModal = {
    _eventSubscriptions: [],

    init() {
        this._subscribeToEvents();
        console.log('✅ MissionDebriefModal initialized');
    },

    _subscribeToEvents() {
        if (typeof EventBus === 'undefined') return;

        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];

        this._eventSubscriptions.push(
            EventBus.on('mission:completed', (data) => this.show(data))
        );
    },

    /**
     * Show the debrief modal
     * @param {Object} data - Mission completion data
     */
    show(data) {
        const { missionId, mission, rewards, completionTime } = data;
        if (!mission) return;

        // Remove any existing modal
        this.hide();

        const overlay = document.createElement('div');
        overlay.id = 'mission-debrief-overlay';
        overlay.className = 'modal-overlay debrief-modal-overlay';

        const dialog = mission.dialog || {};
        const npc = dialog.npc || 'Mission Complete';
        const npcIcon = dialog.npcIcon || '🏆';
        const completionText = dialog.completion || 'Well done! You have completed this mission.';

        overlay.innerHTML = `
            <div class="debrief-modal">
                <div class="debrief-header">
                    <h2><span class="debrief-icon">🏆</span> Mission Complete!</h2>
                    <div class="debrief-mission-name">${mission.name}</div>
                </div>

                <div class="debrief-npc">
                    <div class="npc-avatar">${npcIcon}</div>
                    <div class="npc-dialogue">
                        <div class="npc-name">${npc}</div>
                        <p>"${completionText}"</p>
                    </div>
                </div>

                <div class="debrief-rewards">
                    <h3>Rewards Earned</h3>
                    <div class="rewards-grid">
                        ${this._renderRewards(rewards, mission.rewards)}
                    </div>
                </div>

                ${completionTime ? `
                    <div class="debrief-stats">
                        <span class="stat-label">Completion Time:</span>
                        <span class="stat-value">${this._formatTime(completionTime)}</span>
                    </div>
                ` : ''}

                <div class="debrief-footer">
                    <button class="debrief-btn primary" onclick="MissionDebriefModal.hide()">
                        Continue
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add click-outside-to-close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });

        // Play celebration sound if available
        if (typeof AudioSystem !== 'undefined' && AudioSystem.play) {
            AudioSystem.play('mission_complete');
        }
    },

    /**
     * Render the rewards section
     */
    _renderRewards(grantedRewards, missionRewards) {
        let currencyHtml = '';
        let itemsHtml = '';

        // XP
        if (grantedRewards?.experience > 0 || missionRewards?.characterXP > 0) {
            const xp = grantedRewards?.experience || missionRewards?.characterXP || 0;
            currencyHtml += `
                <div class="reward-currency xp">
                    <span class="reward-icon">✨</span>
                    <span class="reward-text">${xp} XP</span>
                </div>
            `;
        }

        // Gold
        if (grantedRewards?.gold > 0) {
            currencyHtml += `
                <div class="reward-currency gold">
                    <span class="reward-icon">💰</span>
                    <span class="reward-text">${grantedRewards.gold} Gold</span>
                </div>
            `;
        }

        // Skill XP
        const skillXP = grantedRewards?.skills || missionRewards?.skillXP || {};
        for (const [skillId, xp] of Object.entries(skillXP)) {
            const skillDef = GameEngine?.definitions?.skills?.[skillId];
            const skillName = skillDef?.name || this._formatSkillName(skillId);
            const skillIcon = skillDef?.icon || '⭐';

            currencyHtml += `
                <div class="reward-currency skill-xp">
                    <span class="reward-icon">${skillIcon}</span>
                    <span class="reward-text">${xp} ${skillName}</span>
                </div>
            `;
        }

        // Items - render as cards in a 4-wide grid
        const items = grantedRewards?.items || missionRewards?.items || [];
        for (const item of items) {
            const itemId = item.itemId || item.id;
            const quantity = item.quantity || item.amount || 1;
            const itemDef = this._getItemDef(itemId);
            const itemName = itemDef?.name || itemId;
            const rarity = itemDef?.rarity || 'common';

            // Use IconHelper for proper PNG/emoji icon rendering
            const iconHtml = (typeof IconHelper !== 'undefined' && itemDef)
                ? IconHelper.getItemIconHTML(itemDef, { size: 40 })
                : `<span class="item-icon-emoji">${itemDef?.icon || '📦'}</span>`;

            itemsHtml += `
                <div class="reward-item-card rarity-${rarity}">
                    <div class="item-icon">${iconHtml}</div>
                    <div class="item-name">${itemName}</div>
                    ${quantity > 1 ? `<div class="item-quantity">x${quantity}</div>` : ''}
                </div>
            `;
        }

        // Build final HTML
        let html = '';

        if (currencyHtml) {
            html += `<div class="rewards-currency-row">${currencyHtml}</div>`;
        }

        if (itemsHtml) {
            html += `<div class="rewards-items-grid">${itemsHtml}</div>`;
        }

        return html || '<div class="reward-item none">No rewards</div>';
    },

    /**
     * Get item definition helper
     */
    _getItemDef(itemId) {
        if (typeof ItemAccessHelper !== 'undefined') {
            return ItemAccessHelper.getItem(itemId);
        }
        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getItem(itemId);
        }
        return GameEngine?.definitions?.items?.[itemId];
    },

    /**
     * Format skill name from ID
     */
    _formatSkillName(skillId) {
        return skillId
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },

    /**
     * Format time in seconds
     */
    _formatTime(seconds) {
        if (seconds < 60) return `${seconds} seconds`;
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
        }
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    },

    /**
     * Hide the modal
     */
    hide() {
        const overlay = document.getElementById('mission-debrief-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    },

    /**
     * Cleanup
     */
    destroy() {
        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];
        this.hide();
    }
};

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MissionDebriefModal.init());
    } else {
        MissionDebriefModal.init();
    }
}

// Browser global access
if (typeof window !== 'undefined') {
    window.MissionDebriefModal = MissionDebriefModal;
}
