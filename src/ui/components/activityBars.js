/**
 * UNIVERSAL ACTIVITY BARS COMPONENT
 *
 * Provides standardized interval and endurance/recovery bars for all activities:
 * - Navigation (exploration)
 * - Gathering (mining, logging, fishing, hunting, foraging, thieving)
 * - Combat
 * - Crafting
 *
 * Design Principle: Single source of truth for all activity progress bars
 */

const ActivityBarsUI = {

  /**
   * Render endurance bar (universal for all activities)
   * @param {Object} config - Configuration object
   * @param {string} config.containerId - ID of container to render into
   * @param {number} config.current - Current endurance value
   * @param {number} config.max - Maximum endurance value
   * @param {boolean} config.isRecovering - Whether in recovery mode
   * @param {boolean} config.isActive - Whether activity is active
   * @param {string} config.activityName - Name of activity (e.g., 'Exploring', 'Mining', 'Combat')
   */
  renderEnduranceBar(config) {
    const {
      containerId,
      current = 0,
      max = 100,
      isRecovering = false,
      isActive = false,
      activityName = 'Activity'
    } = config;

    const container = document.getElementById(containerId);
    if (!container) return;

    const percent = (current / max) * 100;
    const gradient = isRecovering
      ? 'linear-gradient(90deg, #FFC107, #FF9800)'
      : 'linear-gradient(90deg, #4caf50, #8bc34a)';

    const label = isRecovering ? '💤 Resting' : '💪 Endurance';
    const status = isRecovering
      ? '💤 Recovering endurance'
      : isActive
        ? `⚡ Draining while ${activityName.toLowerCase()}`
        : '🛑 Paused';

    container.innerHTML = `
      <div style="background: #2a2a2a; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px;">
        <div class="activity-bar-label" style="margin-bottom: 5px; font-size: 0.9em; font-weight: bold;">
          ${label}
        </div>
        <div class="health-bar" style="margin-bottom: 5px;">
          <div class="health-bar-fill activity-endurance-fill"
               style="width: ${percent}%; background: ${gradient}; transition: width 0.3s ease-out;"></div>
          <div class="health-bar-text activity-endurance-text">
            ${Math.floor(current)}/${max}
          </div>
        </div>
        <div class="activity-bar-desc" style="font-size: 0.75em; color: #888;">
          ${status}
        </div>
      </div>
    `;
  },

  /**
   * Update endurance bar values without full re-render
   */
  updateEnduranceBar(config) {
    const {
      containerId,
      current = 0,
      max = 100,
      isRecovering = false,
      isActive = false,
      activityName = 'Activity'
    } = config;

    const container = document.getElementById(containerId);
    if (!container) return;

    const fill = container.querySelector('.activity-endurance-fill');
    const text = container.querySelector('.activity-endurance-text');
    const label = container.querySelector('.activity-bar-label');
    const desc = container.querySelector('.activity-bar-desc');

    if (fill && text) {
      const percent = (current / max) * 100;
      fill.style.width = `${percent}%`;
      fill.style.background = isRecovering
        ? 'linear-gradient(90deg, #FFC107, #FF9800)'
        : 'linear-gradient(90deg, #4caf50, #8bc34a)';
      text.textContent = `${Math.floor(current)}/${max}`;
    }

    if (label) {
      label.textContent = isRecovering ? '💤 Resting' : '💪 Endurance';
    }

    if (desc) {
      const status = isRecovering
        ? '💤 Recovering endurance'
        : isActive
          ? `⚡ Draining while ${activityName.toLowerCase()}`
          : '🛑 Paused';
      desc.textContent = status;
    }
  },

  /**
   * Render interval bar (action/recovery timer)
   * @param {Object} config - Configuration object
   * @param {string} config.containerId - ID of container to render into
   * @param {number} config.currentTime - Current elapsed time (ms)
   * @param {number} config.intervalTime - Total interval time (ms)
   * @param {boolean} config.isRecovering - Whether in recovery mode
   * @param {boolean} config.isActive - Whether activity is active
   * @param {string} config.activityName - Name of activity
   * @param {string} config.actionIcon - Icon for the action (e.g., '🧭', '⛏️', '⚔️')
   * @param {Object} config.stats - Additional stats to display (optional)
   */
  renderIntervalBar(config) {
    const {
      containerId,
      currentTime = 0,
      intervalTime = 3000,
      isRecovering = false,
      isActive = false,
      activityName = 'Action',
      actionIcon = '⚡',
      stats = {}
    } = config;

    const container = document.getElementById(containerId);
    if (!container) return;

    const percent = intervalTime > 0 ? (currentTime / intervalTime) * 100 : 0;
    const timeText = isActive ? `${(currentTime / 1000).toFixed(1)}s` : 'Not Active';

    const label = isRecovering
      ? '💤 Recovery Mode'
      : isActive
        ? `${actionIcon} ${activityName} Progress`
        : `${actionIcon} ${activityName}`;

    const description = isRecovering
      ? `Resting to recover endurance - ${activityName} paused`
      : isActive
        ? this.buildStatsDescription(stats, intervalTime)
        : `Click Start to begin ${activityName.toLowerCase()}`;

    container.innerHTML = `
      <div style="background: #2a2a2a; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px;">
        <div class="activity-bar-label" style="margin-bottom: 5px; font-size: 0.9em; font-weight: bold;">
          ${label}
        </div>
        <div class="health-bar" style="margin-bottom: 8px;">
          <div class="health-bar-fill activity-interval-fill"
               style="width: ${percent}%; background: linear-gradient(90deg, #2196F3, #64B5F6); transition: width 0.3s ease-out;"></div>
          <div class="health-bar-text activity-interval-text">${timeText}</div>
        </div>
        <div class="activity-bar-desc" style="font-size: 0.75em; color: #888;">
          ${description}
        </div>
      </div>
    `;
  },

  /**
   * Update interval bar values without full re-render
   */
  updateIntervalBar(config) {
    const {
      containerId,
      currentTime = 0,
      intervalTime = 3000,
      isRecovering = false,
      isActive = false,
      activityName = 'Action',
      actionIcon = '⚡',
      stats = {}
    } = config;

    const container = document.getElementById(containerId);
    if (!container) return;

    const fill = container.querySelector('.activity-interval-fill');
    const text = container.querySelector('.activity-interval-text');
    const label = container.querySelector('.activity-bar-label');
    const desc = container.querySelector('.activity-bar-desc');

    if (fill && text) {
      const percent = intervalTime > 0 ? (currentTime / intervalTime) * 100 : 0;
      fill.style.width = `${percent}%`;

      const timeText = isActive ? `${(currentTime / 1000).toFixed(1)}s` : 'Not Active';
      text.textContent = timeText;
    }

    if (label) {
      const labelText = isRecovering
        ? '💤 Recovery Mode'
        : isActive
          ? `${actionIcon} ${activityName} Progress`
          : `${actionIcon} ${activityName}`;
      label.textContent = labelText;
    }

    if (desc) {
      const description = isRecovering
        ? `Resting to recover endurance - ${activityName} paused`
        : isActive
          ? this.buildStatsDescription(stats, intervalTime)
          : `Click Start to begin ${activityName.toLowerCase()}`;
      desc.textContent = description;
    }
  },

  /**
   * Build stats description from stats object
   */
  buildStatsDescription(stats, intervalTime) {
    if (!stats || Object.keys(stats).length === 0) {
      return `Action every ${(intervalTime / 1000).toFixed(1)}s`;
    }

    let parts = [];

    if (stats.interval !== undefined) {
      parts.push(`Action every ${(stats.interval / 1000).toFixed(1)}s`);
    } else {
      parts.push(`Action every ${(intervalTime / 1000).toFixed(1)}s`);
    }

    if (stats.successChance !== undefined) {
      parts.push(`${(stats.successChance * 100).toFixed(1)}% success`);
    }

    if (stats.xpPerAction !== undefined) {
      parts.push(`+${stats.xpPerAction} XP`);
    }

    return parts.join(' • ');
  },

  /**
   * Render both endurance and interval bars together
   * @param {Object} config - Combined configuration
   */
  renderActivityBars(config) {
    this.renderEnduranceBar({
      containerId: config.enduranceContainerId,
      current: config.endurance,
      max: config.maxEndurance,
      isRecovering: config.isRecovering,
      isActive: config.isActive,
      activityName: config.activityName
    });

    this.renderIntervalBar({
      containerId: config.intervalContainerId,
      currentTime: config.currentTime,
      intervalTime: config.intervalTime,
      isRecovering: config.isRecovering,
      isActive: config.isActive,
      activityName: config.activityName,
      actionIcon: config.actionIcon,
      stats: config.stats
    });
  },

  /**
   * Update both bars without full re-render
   */
  updateActivityBars(config) {
    this.updateEnduranceBar({
      containerId: config.enduranceContainerId,
      current: config.endurance,
      max: config.maxEndurance,
      isRecovering: config.isRecovering,
      isActive: config.isActive,
      activityName: config.activityName
    });

    this.updateIntervalBar({
      containerId: config.intervalContainerId,
      currentTime: config.currentTime,
      intervalTime: config.intervalTime,
      isRecovering: config.isRecovering,
      isActive: config.isActive,
      activityName: config.activityName,
      actionIcon: config.actionIcon,
      stats: config.stats
    });
  }
};
