/**
 * SKILL NODE SELECTION MODAL
 *
 * Modal popup system for selecting gathering nodes from the Skills UI.
 * Replaces the deprecated Nodes tab with a contextual modal approach.
 *
 * Features:
 * - Activity/rest UI status at top
 * - Selected node preview with stats
 * - Start gathering button
 * - Grid of discovered nodes (clickable)
 * - Grid of undiscovered nodes (grayed out, unselectable)
 */

console.log('🚀 skillNodeModal.js loading...');

const SkillNodeModal = {
  currentSkill: null,
  selectedNode: null,

  // Skill-specific configuration
  skillConfig: {
    mining: {
      icon: '⛏️',
      name: 'Mining',
      actionVerb: 'Mining',
      startButtonText: 'Begin Mining'
    },
    logging: {
      icon: '🪓',
      name: 'Logging',
      actionVerb: 'Logging',
      startButtonText: 'Begin Logging'
    },
    fishing: {
      icon: '🎣',
      name: 'Fishing',
      actionVerb: 'Fishing',
      startButtonText: 'Begin Fishing'
    },
    hunting: {
      icon: '🏹',
      name: 'Hunting',
      actionVerb: 'Hunting',
      startButtonText: 'Begin Hunting'
    },
    foraging: {
      icon: '🌿',
      name: 'Foraging',
      actionVerb: 'Foraging',
      startButtonText: 'Begin Foraging'
    },
    thieving: {
      icon: '🎭',
      name: 'Thieving',
      actionVerb: 'Thieving',
      startButtonText: 'Begin Thieving'
    }
  },

  /**
   * Open the modal for a specific skill
   */
  open(skillId) {
    console.log('📂 SkillNodeModal.open() called with:', skillId);

    if (!this.skillConfig[skillId]) {
      console.error(`❌ Unknown skill: ${skillId}`);
      return;
    }

    console.log('✅ Skill config found for:', skillId);

    this.currentSkill = skillId;
    this.selectedNode = null;

    // Create modal if it doesn't exist
    console.log('🔨 Creating modal...');
    this.createModal();

    // Render modal content
    console.log('🎨 About to call render()...');
    this.render();
    console.log('✅ render() completed');

    // Show modal
    const modal = document.getElementById('skillNodeModal');
    if (modal) {
      console.log('✅ Modal found, showing it');
      modal.style.display = 'flex';
    } else {
      console.error('❌ Modal element not found!');
    }
  },

  /**
   * Close the modal
   */
  close() {
    const modal = document.getElementById('skillNodeModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentSkill = null;
    this.selectedNode = null;
  },

  /**
   * Create the modal DOM structure if it doesn't exist
   */
  createModal() {
    if (document.getElementById('skillNodeModal')) return;

    const modalHTML = `
      <div id="skillNodeModal" class="modal-overlay" style="display: none;">
        <div class="modal-container" style="width: 90%; max-width: 900px; max-height: 90vh; overflow-y: auto; padding: var(--space-lg);">
          <div id="skillNodeModalContent"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when clicking overlay
    document.getElementById('skillNodeModal').addEventListener('click', (e) => {
      if (e.target.id === 'skillNodeModal') {
        this.close();
      }
    });
  },

  /**
   * Render the modal content
   */
  render() {
    console.log('🎨 SkillNodeModal.render() called', { currentSkill: this.currentSkill });

    const container = document.getElementById('skillNodeModalContent');
    if (!container) {
      console.error('❌ Modal container not found!');
      return;
    }

    const config = this.skillConfig[this.currentSkill];
    const skill = GameEngine.state.skills[this.currentSkill];

    console.log('📊 Modal render data:', {
      config: config ? 'Found' : 'Missing',
      skill: skill ? `Level ${skill.level}` : 'Missing'
    });

    if (!config || !skill) {
      container.innerHTML = '<div style="color: var(--color-danger);">Error: Invalid skill</div>';
      return;
    }

    const isGathering = GameEngine.state.currentActivity === 'gathering' &&
                       GameEngine.state.gatheringSession?.skill === this.currentSkill;

    container.innerHTML = `
      <!-- Modal Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <div style="display: flex; align-items: center; gap: var(--space-md);">
          <span style="font-size: 48px;">${config.icon}</span>
          <div>
            <h2 style="margin: 0; color: var(--color-text-primary);">${config.name}</h2>
            <div style="color: var(--color-text-secondary);">Level ${skill.level} • Select a node to gather</div>
          </div>
        </div>
        <button class="modal-close-btn" onclick="SkillNodeModal.close()">×</button>
      </div>

      <!-- Activity Status (if currently gathering this skill) -->
      ${isGathering ? this.renderActivityStatus() : ''}

      <!-- Selected Node Preview -->
      ${this.renderSelectedNodePreview()}

      <!-- Discovered Nodes Grid -->
      ${this.renderDiscoveredNodesSection()}

      <!-- Undiscovered Nodes Grid -->
      ${this.renderUndiscoveredNodesSection()}
    `;
  },

  /**
   * Render activity status section (when currently gathering)
   */
  renderActivityStatus() {
    const session = GameEngine.state.gatheringSession;
    if (!session) return '';

    const nodeDef = NodeRegistry.getAllActive()[session.nodeId];
    const toolDef = ItemRegistry.getItem(session.toolId);

    if (!nodeDef || !toolDef) return '';

    return `
      <div class="panel-bordered" style="margin-bottom: var(--space-lg); background: var(--color-bg-glass-dark);">
        <div style="font-weight: bold; color: var(--color-success); margin-bottom: var(--space-sm);">
          ✅ Currently Gathering: ${nodeDef.name}
        </div>
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
        <button class="btn btn-danger" onclick="GameEngine.stopGathering(); SkillNodeModal.render();" style="margin-top: var(--space-md); width: 100%;">
          ⏹️ Stop Gathering
        </button>
      </div>
    `;
  },

  /**
   * Render selected node preview and start button
   */
  renderSelectedNodePreview() {
    const config = this.skillConfig[this.currentSkill];
    const skill = GameEngine.state.skills[this.currentSkill];

    if (!this.selectedNode) {
      return `
        <div class="panel-bordered" style="margin-bottom: var(--space-lg); padding: var(--space-xl); text-align: center; background: var(--color-bg-glass-dark);">
          <div style="font-size: 48px; margin-bottom: var(--space-md); opacity: 0.3;">📍</div>
          <div style="color: var(--color-text-tertiary);">Select a node below to view details</div>
        </div>
      `;
    }

    const nodeDef = NodeRegistry.getAllActive()[this.selectedNode];
    if (!nodeDef) {
      return '<div style="color: var(--color-danger);">Error: Invalid node</div>';
    }

    // Find equipped tool for this skill
    const equippedTool = this.getEquippedToolForSkill(this.currentSkill);
    const toolDef = equippedTool ? ItemRegistry.getItem(equippedTool) : null;

    // Calculate stats
    const actionInterval = this.calculateActionInterval(nodeDef, toolDef, skill);
    const successChance = this.calculateSuccessChance(nodeDef, toolDef, skill);
    const xpPerAction = nodeDef.baseXP || 10;

    // Check if player can use this node
    const canUse = skill.level >= nodeDef.requiredSkillLevel && toolDef;
    const isGathering = GameEngine.state.currentActivity === 'gathering';

    let statusMessage = '';
    if (!toolDef) {
      statusMessage = `<div style="color: var(--color-danger); margin-top: var(--space-md);">⚠️ No ${config.name.toLowerCase()} tool equipped</div>`;
    } else if (!canUse) {
      statusMessage = `<div style="color: var(--color-warning); margin-top: var(--space-md);">🔒 Requires Level ${nodeDef.requiredSkillLevel}</div>`;
    }

    return `
      <div class="panel-bordered" style="margin-bottom: var(--space-lg); background: var(--color-bg-glass-light);">
        <!-- Node Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
          <div style="display: flex; align-items: center; gap: var(--space-md);">
            <span style="font-size: 48px;">${nodeDef.icon || '📦'}</span>
            <div>
              <div style="font-size: 1.3em; font-weight: bold; color: var(--color-text-primary);">${nodeDef.name}</div>
              <div style="color: var(--color-text-secondary);">Level ${nodeDef.requiredSkillLevel} ${config.name}</div>
            </div>
          </div>
          <button
            class="btn ${canUse && !isGathering ? 'btn-primary' : 'btn-disabled'}"
            onclick="SkillNodeModal.startGathering()"
            ${!canUse || isGathering ? 'disabled' : ''}
            style="font-size: 1.1em; padding: var(--space-md) var(--space-lg);">
            ${config.startButtonText}
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid-3">
          <div class="stat-box">
            <div class="stat-box-label">Action Interval</div>
            <div class="stat-box-value stat-box-value-info">${(actionInterval / 1000).toFixed(1)}s</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-label">Success Chance</div>
            <div class="stat-box-value stat-box-value-success">${Math.round(successChance * 100)}%</div>
          </div>
          <div class="stat-box">
            <div class="stat-box-label">XP per Action</div>
            <div class="stat-box-value stat-box-value-warning">${xpPerAction}</div>
          </div>
        </div>

        ${toolDef ? `
          <div style="margin-top: var(--space-md); padding: var(--space-sm); background: var(--color-bg-glass-dark); border-radius: var(--radius-md); display: flex; align-items: center; gap: var(--space-sm);">
            <span style="font-size: 24px;">${toolDef.icon || '🔧'}</span>
            <div>
              <div style="font-size: 0.9em; color: var(--color-text-secondary);">Using Tool:</div>
              <div style="font-weight: bold; color: var(--color-text-primary);">${toolDef.name}</div>
            </div>
          </div>
        ` : ''}

        ${statusMessage}
      </div>
    `;
  },

  /**
   * Render discovered nodes section
   */
  renderDiscoveredNodesSection() {
    const config = this.skillConfig[this.currentSkill];
    const discoveredNodes = this.getDiscoveredNodesForSkill(this.currentSkill);

    if (discoveredNodes.length === 0) {
      return `
        <div class="panel-section" style="text-align: center; padding: var(--space-xl); color: var(--color-text-tertiary);">
          <div style="font-size: 48px; margin-bottom: var(--space-md); opacity: 0.3;">🔍</div>
          <div>No ${config.name.toLowerCase()} nodes discovered yet</div>
          <div style="font-size: 0.9em; margin-top: var(--space-sm);">Explore regions to find gathering nodes</div>
        </div>
      `;
    }

    return `
      <div class="panel-section">
        <div style="font-weight: bold; margin-bottom: var(--space-md); color: var(--color-info);">
          📍 Discovered Nodes
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-md);">
          ${this.renderNodeTiles(discoveredNodes, true)}
        </div>
      </div>
    `;
  },

  /**
   * Render undiscovered nodes section
   */
  renderUndiscoveredNodesSection() {
    const undiscoveredNodes = this.getUndiscoveredNodesForSkill(this.currentSkill);

    if (undiscoveredNodes.length === 0) {
      return '';
    }

    return `
      <div class="panel-section" style="margin-top: var(--space-lg); border-top: 2px solid var(--color-border); padding-top: var(--space-lg);">
        <div style="font-weight: bold; margin-bottom: var(--space-md); color: var(--color-text-tertiary);">
          ❓ Undiscovered Nodes
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-md);">
          ${this.renderNodeTiles(undiscoveredNodes, false)}
        </div>
      </div>
    `;
  },

  /**
   * Render node tiles
   */
  renderNodeTiles(nodes, isDiscovered = true) {
    if (!nodes || nodes.length === 0) return '';

    const skill = GameEngine.state.skills[this.currentSkill];

    return nodes.map(nodeId => {
      const nodeDef = NodeRegistry.getAllActive()[nodeId];
      if (!nodeDef) return '';

      const canUse = skill.level >= nodeDef.requiredSkillLevel && isDiscovered;
      const isSelected = this.selectedNode === nodeId;

      return `
        <div class="node-tile ${isSelected ? 'selected' : ''} ${!canUse ? 'disabled' : ''} ${!isDiscovered ? 'undiscovered' : ''}"
             data-node-id="${nodeId}"
             ${canUse ? `onclick="SkillNodeModal.selectNode('${nodeId}')"` : ''}
             style="
               cursor: ${canUse ? 'pointer' : 'not-allowed'};
               opacity: ${isDiscovered ? (canUse ? '1' : '0.5') : '0.3'};
               background: ${isSelected ? 'var(--color-bg-glass-light)' : 'var(--color-bg-tertiary)'};
               border: 2px solid ${isSelected ? 'var(--color-info)' : 'var(--color-border)'};
               border-radius: var(--radius-md);
               padding: var(--space-md);
               ${!isDiscovered ? 'filter: grayscale(1);' : ''}
             ">
          <div style="text-align: center;">
            <div style="font-size: 32px; margin-bottom: var(--space-sm);">
              ${isDiscovered ? (nodeDef.icon || '📦') : '❓'}
            </div>
            <div style="font-weight: bold; color: var(--color-text-primary);">
              ${isDiscovered ? nodeDef.name : '???'}
            </div>
            <div style="font-size: 0.85em; color: var(--color-text-tertiary);">
              Level ${nodeDef.requiredSkillLevel}
            </div>
            ${!isDiscovered ? `
              <div style="margin-top: var(--space-xs); font-size: 0.8em; color: var(--color-warning);">
                🔍 Undiscovered
              </div>
            ` : !canUse ? `
              <div style="margin-top: var(--space-xs); font-size: 0.8em; color: var(--color-danger);">
                🔒 Locked
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Select a node (updates preview)
   */
  selectNode(nodeId) {
    this.selectedNode = nodeId;
    this.render();
  },

  /**
   * Start gathering the selected node
   */
  startGathering() {
    if (!this.selectedNode) {
      console.error('No node selected');
      return;
    }

    // Use NEW GatheringSystem (simpler, cleaner system)
    const result = GameEngine.startGathering(this.currentSkill, this.selectedNode);

    if (result.success) {
      console.log(`✅ Started gathering: ${this.selectedNode}`);
      this.close();
      // Switch to skills view to show gathering UI
      UICore.switchView('skills');
    } else {
      console.error('Failed to start gathering:', result.message);
      alert(result.message);
    }
  },

  /**
   * Get discovered nodes for a skill
   * Now uses region's discoverableNodes (nodes are directly accessible, not discovery-based)
   */
  getDiscoveredNodesForSkill(skillId) {
    const currentRegion = GameEngine.state.currentRegion;
    const regionDef = GameEngine.definitions.worldMap?.[currentRegion];

    console.log(`🔍 Getting nodes for ${skillId} in ${currentRegion}`, {
      regionDef: regionDef ? 'Found' : 'Missing',
      discoverableNodes: regionDef?.discoverableNodes
    });

    if (!regionDef || !regionDef.discoverableNodes) {
      console.warn(`⚠️ No discoverable nodes for region ${currentRegion}`);
      return [];
    }

    // Filter discoverable nodes by skill (nodeType field)
    const allNodes = NodeRegistry.getAllActive();
    const filtered = regionDef.discoverableNodes.filter(nodeId => {
      const nodeDef = allNodes[nodeId];
      const matches = nodeDef && nodeDef.nodeType === skillId;
      if (matches) {
        console.log(`✅ Found node: ${nodeId} (${nodeDef.name})`);
      }
      return matches;
    });

    console.log(`📊 Total nodes for ${skillId}: ${filtered.length}`);
    return filtered;
  },

  /**
   * Get undiscovered nodes for a skill
   */
  getUndiscoveredNodesForSkill(skillId) {
    const allNodes = NodeRegistry.getAllActive();
    const discoveredNodes = this.getDiscoveredNodesForSkill(skillId);
    const undiscoveredNodeIds = [];

    // Find all nodes for this skill that haven't been discovered
    for (const nodeId in allNodes) {
      const nodeDef = allNodes[nodeId];
      if (nodeDef && nodeDef.nodeType === skillId && !discoveredNodes.includes(nodeId)) {
        undiscoveredNodeIds.push(nodeId);
      }
    }

    // Sort by required level
    undiscoveredNodeIds.sort((a, b) => {
      const nodeA = allNodes[a];
      const nodeB = allNodes[b];
      return (nodeA.requiredSkillLevel || 0) - (nodeB.requiredSkillLevel || 0);
    });

    return undiscoveredNodeIds;
  },

  /**
   * Get equipped tool for a skill
   * Matches the logic in gatheringSystem.js
   */
  getEquippedToolForSkill(skillId) {
    const equipment = GameEngine.state.equipment;

    // Check weapon slot first (gathering tools use weapon slot)
    const weaponId = equipment.weapon;
    if (weaponId) {
      const weapon = ItemRegistry.getItem(weaponId);
      if (weapon && weapon.skill === skillId) {
        return weaponId;
      }
    }

    // Check tool slot as fallback
    const toolId = equipment.tool;
    if (toolId) {
      const tool = ItemRegistry.getItem(toolId);
      if (tool && tool.skill === skillId) {
        return toolId;
      }
    }

    return null;
  },

  /**
   * Calculate action interval (mirrors GatheringSystem logic)
   */
  calculateActionInterval(nodeDef, toolDef, playerSkill) {
    let baseInterval = 3000;

    if (toolDef) {
      const toolBonus = toolDef.gatheringBonus?.[playerSkill.id]?.speed || 1.0;
      baseInterval = baseInterval / toolBonus;
    }

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

    if (toolDef) {
      const toolBonus = toolDef.gatheringBonus?.[playerSkill.id]?.accuracy || 0;
      baseChance += toolBonus;
    }

    baseChance += playerSkill.level * 0.01;

    const levelDiff = nodeDef.requiredSkillLevel - playerSkill.level;
    if (levelDiff > 0) {
      baseChance -= levelDiff * 0.05;
    }

    return Math.max(0.1, Math.min(0.95, baseChance));
  },

  /**
   * Format duration in mm:ss
   */
  formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};
