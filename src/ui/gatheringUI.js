/**
 * UNIVERSAL GATHERING UI
 *
 * Displays gathering interface with activity bars for:
 * - Mining, Logging, Fishing, Hunting, Foraging, Thieving
 *
 * Uses ActivityBarsUI component for consistent interval/endurance display
 */

const GatheringUI = {

  /**
   * Render gathering activity display
   */
  render() {
    const container = document.getElementById('gatheringActivityDisplay');
    if (!container) return;

    const session = GameEngine.state.gatheringSession;

    // Hide if not gathering
    if (!session || GameEngine.state.currentActivity !== 'gathering') {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    // Get node and skill info
    const nodeDef = NodeRegistry.getAllActive()[session.nodeId];
    const skill = GameEngine.state.skills[session.skill];
    const toolDef = ItemRegistry.getItem(session.toolId);

    if (!nodeDef || !skill || !toolDef) {
      container.innerHTML = '<div style="color: #f88;">Error: Invalid gathering session</div>';
      return;
    }

    const skillIcon = this.getSkillIcon(session.skill);
    const skillName = Formatting.capitalizeFirst(session.skill);

    container.innerHTML = `
      <div class="panel-bordered" data-activity="gathering" data-skill="${session.skill}" data-node="${session.nodeId}">
        <!-- Header -->
        <div class="activity-header">
          <span style="font-size: 32px;">${nodeDef.icon || skillIcon}</span>
          <div style="flex: 1;">
            <div class="activity-title">${nodeDef.name}</div>
            <div class="activity-subtitle">
              ${skillIcon} ${skillName} • Level ${skill.level} • Using ${toolDef.name}
            </div>
          </div>
          <button class="btn btn-danger" onclick="gameEngine.stopGathering()">
            ⏹️ Stop
          </button>
        </div>

        <!-- Session Stats -->
        <div class="stats-grid-3">
          <div class="stat-box">
            <div class="stat-box-label">Actions</div>
            <div class="stat-box-value stat-box-value-info">${session.totalActions}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-label">XP Gained</div>
            <div class="stat-box-value stat-box-value-success">${session.totalXP}</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-label">Duration</div>
            <div class="stat-box-value stat-box-value-warning">
              ${this.formatDuration(Date.now() - session.startTime)}
            </div>
          </div>
        </div>

        <!-- Activity Bars (endurance + interval) -->
        <div id="gatheringEnduranceBar"></div>
        <div id="gatheringIntervalBar"></div>

        <!-- Resources Gained -->
        ${this.renderResourcesGained(session.totalResources)}
      </div>
    `;

    // Initialize activity bars
    this.updateActivityBars();
  },

  /**
   * Update activity bars (endurance and interval)
   */
  updateActivityBars() {
    const session = GameEngine.state.gatheringSession;
    if (!session) return;

    const nodeDef = NodeRegistry.getAllActive()[session.nodeId];
    const toolDef = ItemRegistry.getItem(session.toolId);
    const skill = GameEngine.state.skills[session.skill];

    if (!nodeDef || !toolDef || !skill) return;

    const isActive = GameEngine.state.currentActivity === 'gathering' && !session.isRecovering;
    const isRecovering = session.isRecovering || false;

    // Calculate current interval progress
    const now = Date.now();
    const timeSinceLastAction = now - (session.lastActionTime || now);
    const actionInterval = this.calculateActionInterval(nodeDef, toolDef, skill);

    // Calculate stats for display
    const successChance = this.calculateSuccessChance(nodeDef, toolDef, skill);
    const stats = {
      interval: actionInterval,
      successChance: successChance,
      xpPerAction: nodeDef.baseXP || 10
    };

    // Skill icon
    const skillIcon = this.getSkillIcon(session.skill);
    const skillName = Formatting.capitalizeFirst(session.skill);

    // Update or render bars
    const enduranceContainer = document.getElementById('gatheringEnduranceBar');
    const intervalContainer = document.getElementById('gatheringIntervalBar');

    if (enduranceContainer && enduranceContainer.querySelector('.activity-endurance-fill')) {
      // Update existing
      ActivityBarsUI.updateEnduranceBar({
        containerId: 'gatheringEnduranceBar',
        current: session.endurance,
        max: session.maxEndurance,
        isRecovering: isRecovering,
        isActive: isActive,
        activityName: skillName
      });
    } else if (enduranceContainer) {
      // Render new
      ActivityBarsUI.renderEnduranceBar({
        containerId: 'gatheringEnduranceBar',
        current: session.endurance,
        max: session.maxEndurance,
        isRecovering: isRecovering,
        isActive: isActive,
        activityName: skillName
      });
    }

    if (intervalContainer && intervalContainer.querySelector('.activity-interval-fill')) {
      // Update existing
      ActivityBarsUI.updateIntervalBar({
        containerId: 'gatheringIntervalBar',
        currentTime: isRecovering ? 0 : timeSinceLastAction,
        intervalTime: actionInterval,
        isRecovering: isRecovering,
        isActive: isActive,
        activityName: skillName,
        actionIcon: skillIcon,
        stats: stats
      });
    } else if (intervalContainer) {
      // Render new
      ActivityBarsUI.renderIntervalBar({
        containerId: 'gatheringIntervalBar',
        currentTime: isRecovering ? 0 : timeSinceLastAction,
        intervalTime: actionInterval,
        isRecovering: isRecovering,
        isActive: isActive,
        activityName: skillName,
        actionIcon: skillIcon,
        stats: stats
      });
    }
  },

  /**
   * Calculate action interval (mirrors GatheringSystem logic)
   */
  calculateActionInterval(nodeDef, toolDef, playerSkill) {
    let baseInterval = 3000;

    const toolBonus = toolDef.gatheringBonus?.[playerSkill.id]?.speed || 1.0;
    baseInterval = baseInterval / toolBonus;

    const skillSpeedBonus = Math.min(playerSkill.level * 0.02, 0.5);
    baseInterval = baseInterval * (1 - skillSpeedBonus);

    const nodeResistance = nodeDef.harvestSpeed || 1.0;
    baseInterval = baseInterval * nodeResistance;

    return Math.max(500, Math.floor(baseInterval));
  },

  /**
   * Calculate success chance (mirrors GatheringSystem logic)
   */
  calculateSuccessChance(nodeDef, toolDef, playerSkill) {
    let baseChance = 0.7;

    const toolBonus = toolDef.gatheringBonus?.[playerSkill.id]?.accuracy || 0;
    baseChance += toolBonus;

    baseChance += playerSkill.level * 0.01;

    const levelDiff = nodeDef.requiredSkillLevel - playerSkill.level;
    if (levelDiff > 0) {
      baseChance -= levelDiff * 0.05;
    }

    return Math.max(0.1, Math.min(0.95, baseChance));
  },

  /**
   * Render resources gained section
   */
  renderResourcesGained(resources) {
    if (!resources || Object.keys(resources).length === 0) {
      return `
        <div class="panel-section" style="text-align: center; color: var(--color-text-tertiary);">
          No resources gathered yet
        </div>
      `;
    }

    let resourcesHTML = '';
    for (const [itemId, amount] of Object.entries(resources)) {
      const item = ItemRegistry.getItem(itemId);
      if (!item) continue;

      resourcesHTML += `
        <div class="resource-item">
          <span class="resource-item-icon">${item.icon || '📦'}</span>
          <span class="resource-item-name">${item.name}</span>
          <span class="resource-item-amount">+${amount}</span>
        </div>
      `;
    }

    return `
      <div class="panel-section">
        <div style="font-weight: bold; margin-bottom: var(--space-sm); color: var(--color-info);">📦 Resources Gathered</div>
        <div class="resource-list">
          ${resourcesHTML}
        </div>
      </div>
    `;
  },

  /**
   * Format duration in mm:ss
   */
  formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Get skill icon
   */
  getSkillIcon(skillId) {
    const icons = {
      mining: '⛏️',
      logging: '🪓',
      fishing: '🎣',
      hunting: '🏹',
      foraging: '🌿',
      thieving: '🎭'
    };
    return icons[skillId] || '⚡';
  }
};

// Auto-update gathering UI every 100ms when active
setInterval(() => {
  if (GameEngine && GameEngine.state && GameEngine.state.currentActivity === 'gathering') {
    GatheringUI.updateActivityBars();
  }
}, 100);
