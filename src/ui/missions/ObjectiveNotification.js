/**
 * OBJECTIVE NOTIFICATION COMPONENT
 *
 * Displays improved visual feedback for mission objective completion.
 * Shows an animated notification with objective details, progress, and rewards.
 *
 * Subscribes to EventBus events:
 * - mission:objectiveCompleted - Shows objective completion animation
 * - mission:objectiveProgress - Shows progress update (optional)
 */

const ObjectiveNotification = {
    // Configuration
    config: {
        showProgressUpdates: false,  // Whether to show progress updates (can be noisy)
        displayDuration: 3000,       // How long to show notification (ms)
        animationDuration: 500,      // Animation duration (ms)
        maxNotifications: 3          // Max concurrent notifications
    },

    // Active notifications
    _activeNotifications: [],
    _notificationContainer: null,
    _eventSubscriptions: [],

    /**
     * Initialize the notification system
     * DISABLED: Using Animations.showNotification for simpler objective completion feedback
     */
    init() {
        // DISABLED - user prefers small dark gray notification from Animations.showNotification
        console.log('ObjectiveNotification disabled (using Animations.showNotification instead)');
        return;

        // Original code below - kept for reference
        // this._createContainer();
        // this._subscribeToEvents();
        // console.log('ObjectiveNotification initialized');
    },

    /**
     * Create the notification container
     */
    _createContainer() {
        // Check if container already exists
        let container = document.getElementById('objective-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'objective-notifications';
            container.className = 'objective-notifications-container';
            document.body.appendChild(container);
        }
        this._notificationContainer = container;
    },

    /**
     * Subscribe to EventBus events
     */
    _subscribeToEvents() {
        if (typeof EventBus === 'undefined') {
            console.warn('ObjectiveNotification: EventBus not available');
            return;
        }

        // Clear existing subscriptions
        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];

        // Subscribe to objective completed
        this._eventSubscriptions.push(
            EventBus.on('mission:objectiveCompleted', (data) => {
                this.showObjectiveComplete(data);
            })
        );

        // Optional: Subscribe to progress updates
        if (this.config.showProgressUpdates) {
            this._eventSubscriptions.push(
                EventBus.on('mission:objectiveProgress', (data) => {
                    this.showProgressUpdate(data);
                })
            );
        }

        // Subscribe to mission completed
        this._eventSubscriptions.push(
            EventBus.on('mission:completed', (data) => {
                this.showMissionComplete(data);
            })
        );
    },

    /**
     * Show objective completion notification
     */
    showObjectiveComplete(data) {
        const { missionId, objectiveId, objective } = data;

        // Get mission definition
        const mission = this._getMissionDef(missionId);
        if (!mission) return;

        // Get objective definition
        const objDef = mission.objectives?.find(o =>
            (o.id || `obj_${mission.objectives.indexOf(o) + 1}`) === objectiveId
        );

        const objText = objDef?.description || this._getObjectiveText(objective);

        // Create notification element
        const notification = this._createNotification({
            type: 'objective-complete',
            icon: '✅',
            title: 'Objective Complete!',
            message: objText,
            progress: `${objective.current}/${objective.required}`,
            missionName: mission.name
        });

        this._showNotification(notification);
    },

    /**
     * Show progress update notification
     */
    showProgressUpdate(data) {
        const { missionId, objectiveId, current, required } = data;

        // Only show at certain thresholds (25%, 50%, 75%)
        const percent = (current / required) * 100;
        const thresholds = [25, 50, 75];
        const isThreshold = thresholds.some(t =>
            percent >= t && ((current - 1) / required) * 100 < t
        );

        if (!isThreshold) return;

        const mission = this._getMissionDef(missionId);
        if (!mission) return;

        const objDef = mission.objectives?.find(o =>
            (o.id || `obj_${mission.objectives.indexOf(o) + 1}`) === objectiveId
        );

        const notification = this._createNotification({
            type: 'objective-progress',
            icon: '📊',
            title: 'Quest Progress',
            message: objDef?.description || objectiveId,
            progress: `${current}/${required} (${Math.round(percent)}%)`,
            missionName: mission.name
        });

        this._showNotification(notification, 2000);
    },

    /**
     * Show mission completion notification
     */
    showMissionComplete(data) {
        const { missionId, mission, rewards, completionTime } = data;

        // Build reward summary
        const rewardParts = [];
        if (rewards?.gold > 0) rewardParts.push(`${rewards.gold} Gold`);
        if (rewards?.experience > 0) rewardParts.push(`${rewards.experience} XP`);
        if (rewards?.items?.length > 0) rewardParts.push(`${rewards.items.length} Items`);
        if (rewards?.skills) {
            const skillXP = Object.entries(rewards.skills)
                .map(([skill, xp]) => `${xp} ${skill} XP`)
                .join(', ');
            if (skillXP) rewardParts.push(skillXP);
        }

        const notification = this._createNotification({
            type: 'mission-complete',
            icon: '🏆',
            title: 'Mission Complete!',
            message: mission.name,
            rewards: rewardParts.join(' | '),
            time: this._formatTime(completionTime)
        });

        this._showNotification(notification, 5000);
    },

    /**
     * Create notification element
     */
    _createNotification(options) {
        const notification = document.createElement('div');
        notification.className = `objective-notification ${options.type}`;

        let html = `
            <div class="notification-icon">${options.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${options.title}</div>
                <div class="notification-message">${options.message}</div>
        `;

        if (options.missionName && options.type !== 'mission-complete') {
            html += `<div class="notification-mission">${options.missionName}</div>`;
        }

        if (options.progress) {
            html += `<div class="notification-progress">${options.progress}</div>`;
        }

        if (options.rewards) {
            html += `<div class="notification-rewards">${options.rewards}</div>`;
        }

        if (options.time) {
            html += `<div class="notification-time">Completed in ${options.time}</div>`;
        }

        html += `
            </div>
            <button class="notification-close" onclick="ObjectiveNotification.dismissNotification(this.parentElement)">&times;</button>
        `;

        notification.innerHTML = html;
        return notification;
    },

    /**
     * Show notification with animation
     */
    _showNotification(notification, duration = this.config.displayDuration) {
        if (!this._notificationContainer) {
            this._createContainer();
        }

        // Limit active notifications
        while (this._activeNotifications.length >= this.config.maxNotifications) {
            const oldest = this._activeNotifications.shift();
            this.dismissNotification(oldest);
        }

        // Add to container
        this._notificationContainer.appendChild(notification);
        this._activeNotifications.push(notification);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-dismiss after duration
        setTimeout(() => {
            this.dismissNotification(notification);
        }, duration);
    },

    /**
     * Dismiss a notification
     */
    dismissNotification(notification) {
        if (!notification || !notification.parentElement) return;

        notification.classList.add('hide');
        notification.classList.remove('show');

        // Remove from active list
        const index = this._activeNotifications.indexOf(notification);
        if (index > -1) {
            this._activeNotifications.splice(index, 1);
        }

        // Remove element after animation
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, this.config.animationDuration);
    },

    /**
     * Get mission definition helper
     */
    _getMissionDef(missionId) {
        if (typeof MissionRegistry !== 'undefined') {
            const def = MissionRegistry.get(missionId);
            if (def) return def;
        }
        return GameEngine?.definitions?.missions?.[missionId];
    },

    /**
     * Get objective display text
     */
    _getObjectiveText(objective) {
        const typeLabels = {
            kill: 'Defeat',
            killAny: 'Defeat enemies',
            gather: 'Collect',
            harvest: 'Harvest',
            craft: 'Craft',
            explore: 'Explore',
            turnIn: 'Deliver',
            equip: 'Equip',
            levelSkill: 'Train skill',
            visitTab: 'Visit'
        };

        const label = typeLabels[objective.type] || objective.type;
        const target = objective.target || '';
        return `${label} ${target}`;
    },

    /**
     * Format time in seconds
     */
    _formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    },

    /**
     * Cleanup
     */
    destroy() {
        this._eventSubscriptions.forEach(unsub => unsub());
        this._eventSubscriptions = [];

        if (this._notificationContainer) {
            this._notificationContainer.remove();
            this._notificationContainer = null;
        }

        this._activeNotifications = [];
    }
};

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ObjectiveNotification.init());
    } else {
        ObjectiveNotification.init();
    }
}
