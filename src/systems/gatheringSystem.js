/**
 * GATHERING SYSTEM
 *
 * Universal gathering loop for all gathering skills:
 * - Mining (pickaxe → ore)
 * - Logging (axe → wood)
 * - Fishing (rod → fish)
 * - Hunting (bow → meat/hide)
 * - Foraging (basket → herbs)
 * - Thieving (lockpick → loot)
 *
 * Core loop: Start → Action Tick → Award Resources → Repeat → Stop
 */

const GatheringSystem = {

  // ========================================
  // INITIALIZATION
  // ========================================

  init(engine) {
    this.engine = engine;
    this.state = engine.state;

    // Bind methods
    engine.startGathering = this.startGathering.bind(this);
    engine.stopGathering = this.stopGathering.bind(this);
    engine.processGatheringTick = this.processGatheringTick.bind(this);
    engine.canStartGathering = this.canStartGathering.bind(this);

    console.log('✅ GatheringSystem initialized');
  },

  // ========================================
  // START GATHERING
  // ========================================

  canStartGathering(skill, nodeId) {
    // Get node definition
    const nodeDef = NodeRegistry.getAllActive()[nodeId];
    if (!nodeDef) {
      return { canStart: false, reason: `Node '${nodeId}' not found` };
    }

    // Check skill matches node
    if (nodeDef.nodeType !== skill) {
      return { canStart: false, reason: `This node requires ${nodeDef.nodeType} skill` };
    }

    // Check skill level requirement
    const playerSkill = this.state.skills[skill];
    if (playerSkill.level < nodeDef.requiredSkillLevel) {
      return {
        canStart: false,
        reason: `Requires ${skill} level ${nodeDef.requiredSkillLevel} (you have ${playerSkill.level})`
      };
    }

    // Check has correct tool equipped (tool with matching skill property)
    const equippedTool = this.getEquippedToolForSkill(skill);

    if (!equippedTool) {
      // Search inventory for alternative tools
      const alternativeTools = this.findToolsInInventory(skill);

      return {
        canStart: false,
        reason: `You need a ${skill} tool equipped (check weapon slot)`,
        missingTool: true,
        requiredSkill: skill,
        alternativeTools: alternativeTools
      };
    }

    // All checks passed
    return {
      canStart: true,
      tool: equippedTool
    };
  },

  startGathering(skill, nodeId) {
    // Validate
    const validation = this.canStartGathering(skill, nodeId);
    if (!validation.canStart) {
      console.warn(`⚠️ Cannot start gathering: ${validation.reason}`);

      // Check if the issue is missing tool - offer quick equip
      if (validation.missingTool && validation.alternativeTools && validation.alternativeTools.length > 0) {
        this.showQuickEquipModal(skill, nodeId, validation);
        return false;
      }

      // Otherwise show generic requirement modal
      if (typeof showRequirementModal === 'function') {
        showRequirementModal({
          title: "Cannot Start Gathering",
          message: validation.reason,
          icon: "⚠️"
        });
      }
      return false;
    }

    // Get node definition
    const nodeDef = NodeRegistry.getAllActive()[nodeId];

    // Get node health
    const nodeHealth = nodeDef.baseHealth || nodeDef.harvestsPerDepletion || 10;
    const respawnTime = 20000; // 20 seconds fixed recovery time

    // Create gathering session with node capacity system
    this.state.gatheringSession = {
      skill: skill,
      nodeId: nodeId,
      toolId: validation.tool.id,
      startTime: Date.now(),
      lastActionTime: Date.now(),
      totalActions: 0,
      totalResources: {},
      totalXP: 0,

      // Node capacity system
      nodeHealth: nodeHealth,
      maxNodeHealth: nodeHealth,
      isNodeDepleted: false,
      nodeRespawnTime: respawnTime,
      nodeDepletedAt: null,
      lastRecoveryTime: 0
    };

    this.state.currentActivity = 'gathering';

    console.log(`⛏️ Started ${skill} at ${nodeDef.name} with ${validation.tool.name} (Capacity: ${nodeHealth})`);

    // Emit gathering started event
    EventBus.emit('gathering-started', {
      skill: skill,
      nodeId: nodeId,
      nodeName: nodeDef.name,
      nodeHealth: nodeHealth,
      maxHealth: nodeHealth,
      toolName: validation.tool.name
    });

    return true;
  },

  // ========================================
  // STOP GATHERING
  // ========================================

  stopGathering(reason = 'Player stopped') {
    if (!this.state.gatheringSession) return;

    const session = this.state.gatheringSession;

    // Show summary
    console.log(`🛑 Gathering session ended: ${session.totalActions} actions, ${session.totalXP} XP`);
    console.log('📦 Resources gained:', session.totalResources);

    // Clear session
    this.state.gatheringSession = null;
    this.state.currentActivity = null;

    // Emit gathering stopped event
    EventBus.emit('gathering-stopped', { reason });

    console.log(`Stopped gathering: ${reason}`);
  },

  // ========================================
  // GATHERING TICK (Main Loop)
  // ========================================

  processGatheringTick() {
    // Only process if actively gathering
    if (this.state.currentActivity !== 'gathering') return;
    if (!this.state.gatheringSession) return;

    const session = this.state.gatheringSession;
    const now = Date.now();

    // ===== NODE RECOVERY MODE (Node depleted) =====
    if (session.isNodeDepleted) {
      this.processNodeRecovery();
      return; // Don't harvest while node is recovering
    }

    // ===== ACTION MODE =====
    // Calculate action interval
    const nodeDef = NodeRegistry.getAllActive()[session.nodeId];
    const toolDef = ItemRegistry.getItem(session.toolId);
    const playerSkill = this.state.skills[session.skill];

    if (!nodeDef || !toolDef) {
      this.stopGathering('Invalid node or tool');
      return;
    }

    const actionInterval = this.calculateActionInterval(nodeDef, toolDef, playerSkill);

    // Check if enough time passed
    const timeSinceLastAction = now - session.lastActionTime;
    if (timeSinceLastAction < actionInterval) {
      return;
    }

    // Check tool still equipped (using new skill-based system)
    const equippedTool = this.getEquippedToolForSkill(session.skill);
    if (!equippedTool || equippedTool.id !== session.toolId) {
      this.stopGathering('Tool unequipped');
      return;
    }

    // PERFORM GATHERING ACTION
    this.performGatheringAction(nodeDef, toolDef, playerSkill);

    // Update session
    session.lastActionTime = now;
    session.totalActions++;
  },

  performGatheringAction(nodeDef, toolDef, playerSkill) {
    const session = this.state.gatheringSession;

    // Roll success chance
    const successChance = this.calculateSuccessChance(nodeDef, toolDef, playerSkill);
    const didSucceed = Math.random() < successChance;

    if (didSucceed) {
      // SUCCESS - Award resources ONLY if node has health
      const resources = this.rollResources(nodeDef, toolDef, playerSkill);

      // Add to bank
      for (const [itemId, amount] of Object.entries(resources)) {
        this.engine.addItemToBank(itemId, amount);

        // Track in session
        session.totalResources[itemId] = (session.totalResources[itemId] || 0) + amount;
      }

      // Award XP
      const xpGained = nodeDef.baseXP || 10;
      this.engine.gainSkillExp(session.skill, xpGained);
      session.totalXP += xpGained;

      // Decrement node health
      session.nodeHealth--;

      // Visual feedback
      this.showSuccessFeedback(resources, xpGained);

      // Emit success event for UI
      const rewardsArray = Object.entries(resources).map(([itemId, quantity]) => ({
        itemId,
        quantity
      }));

      EventBus.emit('gathering-success', {
        damage: 1,
        xpGained,
        rewards: rewardsArray,
        nodeHealth: session.nodeHealth,
        maxHealth: session.maxNodeHealth
      });

      // Check if node is depleted
      if (session.nodeHealth <= 0) {
        this.handleNodeDepletion();
      }

    } else {
      // MISS
      this.showMissFeedback();

      // Emit miss event for UI
      EventBus.emit('gathering-miss');
    }
  },

  // ========================================
  // NODE CAPACITY & RECOVERY
  // ========================================

  handleNodeDepletion() {
    const session = this.state.gatheringSession;
    const now = Date.now();

    session.isNodeDepleted = true;
    session.nodeDepletedAt = now;
    session.nodeHealth = 0;

    const respawnSeconds = Math.ceil(session.nodeRespawnTime / 1000);
    console.log(`⏳ Node depleted! Waiting ${respawnSeconds}s for respawn...`);

    // Emit node-depleted event
    const nodeDef = NodeRegistry.getAllActive()[session.nodeId];
    EventBus.emit('node-depleted', {
      nodeId: session.nodeId,
      nodeName: nodeDef?.name || session.nodeId,
      respawnTime: session.nodeRespawnTime,
      respawnSeconds: respawnSeconds
    });
  },

  processNodeRecovery() {
    const session = this.state.gatheringSession;
    const now = Date.now();

    // Calculate recovery progress (0% → 100%)
    const timeElapsed = now - session.nodeDepletedAt;
    const recoveryPercent = Math.min(100, (timeElapsed / session.nodeRespawnTime) * 100);

    // Update node health based on recovery percentage
    const recoveredHealth = Math.floor((recoveryPercent / 100) * session.maxNodeHealth);
    session.nodeHealth = recoveredHealth;

    // Log recovery progress every second
    const timeSinceLastLog = now - (session.lastRecoveryTime || 0);
    if (timeSinceLastLog >= 1000) {
      session.lastRecoveryTime = now;
      console.log(`⏳ Node recovering... (${recoveredHealth}/${session.maxNodeHealth}) ${recoveryPercent.toFixed(0)}%`);
    }

    // Check if fully recovered
    if (timeElapsed >= session.nodeRespawnTime) {
      // Node fully respawned!
      session.isNodeDepleted = false;
      session.nodeHealth = session.maxNodeHealth;
      session.nodeDepletedAt = null;
      session.lastRecoveryTime = 0;

      // CRITICAL: Reset lastActionTime to prevent rapid-fire actions
      session.lastActionTime = now;

      const nodeDef = NodeRegistry.getAllActive()[session.nodeId];
      console.log(`✅ ${nodeDef?.name || 'Node'} fully recovered! Resuming gathering...`);

      // Emit gathering-started to restart UI animations
      EventBus.emit('gathering-started', {
        skill: session.skill,
        nodeId: session.nodeId,
        nodeName: nodeDef?.name || session.nodeId,
        nodeHealth: session.nodeHealth,
        maxHealth: session.maxNodeHealth
      });
    }
  },

  // ========================================
  // CALCULATIONS
  // ========================================

  calculateActionInterval(nodeDef, toolDef, playerSkill) {
    let baseInterval = 3000; // 3 seconds base

    // Tool speed bonus (e.g., gatheringBonus.mining.speed: 1.2 = 20% faster)
    const toolBonus = toolDef.gatheringBonus?.[playerSkill.id]?.speed || 1.0;
    baseInterval = baseInterval / toolBonus;

    // Skill speed bonus (-2% per level, max -50%)
    const skillSpeedBonus = Math.min(playerSkill.level * 0.02, 0.5);
    baseInterval = baseInterval * (1 - skillSpeedBonus);

    // Node resistance (e.g., harvestSpeed: 1.2 = 20% slower)
    const nodeResistance = nodeDef.harvestSpeed || 1.0;
    baseInterval = baseInterval * nodeResistance;

    // Minimum 500ms
    return Math.max(500, Math.floor(baseInterval));
  },

  calculateSuccessChance(nodeDef, toolDef, playerSkill) {
    let baseChance = 0.7; // 70% base success rate

    // Tool accuracy bonus
    const toolBonus = toolDef.gatheringBonus?.[playerSkill.id]?.accuracy || 0;
    baseChance += toolBonus;

    // Skill level bonus (+1% per level)
    baseChance += playerSkill.level * 0.01;

    // Level requirement penalty (if under-leveled)
    const levelDiff = nodeDef.requiredSkillLevel - playerSkill.level;
    if (levelDiff > 0) {
      baseChance -= levelDiff * 0.05; // -5% per level under
    }

    // Clamp between 10% and 95%
    return Math.max(0.1, Math.min(0.95, baseChance));
  },

  rollResources(nodeDef, toolDef, playerSkill) {
    const resources = {};

    // Use resourceTable from node definition
    if (!nodeDef.resourceTable || nodeDef.resourceTable.length === 0) {
      console.warn(`Node ${nodeDef.id} has no resourceTable`);
      return resources;
    }

    // Roll each resource in the table
    for (const resource of nodeDef.resourceTable) {
      // Check weight/chance
      const roll = Math.random() * 100;
      if (roll > resource.weight) continue; // Didn't roll high enough

      // Calculate yield
      const minYield = resource.minYield || 1;
      const maxYield = resource.maxYield || 1;
      let amount = Math.floor(Math.random() * (maxYield - minYield + 1)) + minYield;

      // Yield bonus from tool
      const yieldBonus = toolDef.gatheringBonus?.[playerSkill.id]?.yield || 0;
      if (yieldBonus > 0) {
        amount = Math.floor(amount * (1 + yieldBonus));
      }

      // Yield bonus from skill (+5% per 10 levels)
      const skillYieldBonus = 1 + (Math.floor(playerSkill.level / 10) * 0.05);
      amount = Math.floor(amount * skillYieldBonus);

      resources[resource.itemId] = Math.max(1, amount);
    }

    return resources;
  },

  // ========================================
  // HELPERS
  // ========================================

  getEquippedToolForSkill(skill) {
    console.log(`[getEquippedToolForSkill] Looking for tool with skill: ${skill}`);
    console.log(`[getEquippedToolForSkill] Equipment state:`, this.state.equipment);

    // Check weapon slot first (most gathering tools are weapons)
    const weaponId = this.state.equipment.weapon;
    console.log(`[getEquippedToolForSkill] Weapon slot contains: ${weaponId}`);

    if (weaponId) {
      const weapon = ItemRegistry.getItem(weaponId);
      console.log(`[getEquippedToolForSkill] ItemRegistry.getItem returned:`, weapon);
      console.log(`[getEquippedToolForSkill] weapon?.skill = ${weapon?.skill}`);

      if (weapon && weapon.skill === skill) {
        console.log(`[getEquippedToolForSkill] ✅ Found matching tool!`);
        return weapon;
      }
    }

    // Check tool slot if you have one
    const toolId = this.state.equipment.tool;
    if (toolId) {
      const tool = ItemRegistry.getItem(toolId);
      console.log(`[getEquippedToolForSkill] Checking tool slot: ${toolId}`, tool);
      if (tool && tool.skill === skill) {
        return tool;
      }
    }

    console.log(`[getEquippedToolForSkill] ❌ No tool found with skill: ${skill}`);
    return null;
  },

  findToolsInInventory(skill) {
    const tools = [];
    const bank = this.state.bank || {};

    // Search through all items in bank
    for (const [itemId, quantity] of Object.entries(bank)) {
      if (quantity > 0) {
        const item = ItemRegistry.getItem(itemId);

        // Check if item has matching skill property
        if (item && item.skill === skill) {
          tools.push({
            id: itemId,
            name: item.name,
            icon: item.icon || '🔧',
            quantity: quantity,
            // Include relevant stats for display
            gatheringBonus: item.gatheringBonus || {}
          });
        }
      }
    }

    return tools;
  },

  showQuickEquipModal(skill, nodeId, validation) {
    const { requiredSkill, alternativeTools } = validation;

    // Build modal HTML
    let toolsHTML = '';
    for (const tool of alternativeTools) {
      toolsHTML += `
        <div class="quick-equip-tool-option" data-tool-id="${tool.id}">
          <div class="tool-icon">${tool.icon}</div>
          <div class="tool-info">
            <div class="tool-name">${tool.name}</div>
            <div class="tool-quantity">Owned: ${tool.quantity}</div>
          </div>
          <button class="btn-equip-start" onclick="gameEngine.equipAndStartGathering('${skill}', '${nodeId}', '${tool.id}')">
            Equip & Start
          </button>
        </div>
      `;
    }

    const modalHTML = `
      <div class="modal-overlay" id="quickEquipModal" style="display: flex;">
        <div class="modal-content quick-equip-modal">
          <div class="modal-header">
            <h3>⚠️ Tool Required</h3>
            <button class="modal-close" onclick="closeQuickEquipModal()">&times;</button>
          </div>
          <div class="modal-body">
            <p>You need a <strong>${requiredToolType}</strong> equipped to ${skill}.</p>
            <p>Select a tool from your inventory:</p>
            <div class="quick-equip-tools-list">
              ${toolsHTML}
            </div>
          </div>
        </div>
      </div>
    `;

    // Inject modal into DOM
    const existingModal = document.getElementById('quickEquipModal');
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on overlay click
    document.getElementById('quickEquipModal').addEventListener('click', (e) => {
      if (e.target.id === 'quickEquipModal') {
        window.closeQuickEquipModal();
      }
    });

    // Add global close function
    window.closeQuickEquipModal = () => {
      const modal = document.getElementById('quickEquipModal');
      if (modal) modal.remove();
    };

    // Add equip & start function to game engine
    this.engine.equipAndStartGathering = (skill, nodeId, toolId) => {
      // Equip the tool
      this.state.equipment.weapon = toolId;
      console.log(`✅ Equipped ${toolId}`);

      // Close modal
      window.closeQuickEquipModal();

      // Start gathering
      this.startGathering(skill, nodeId);

      // Refresh UI if available
      if (typeof refreshEquipmentUI === 'function') {
        refreshEquipmentUI();
      }
    };
  },

  showSuccessFeedback(resources, xp) {
    // Console output for now
    const resourceText = Object.entries(resources)
      .map(([id, amt]) => {
        const item = ItemRegistry.getItem(id);
        return `+${amt} ${item?.name || id}`;
      })
      .join(', ');

    console.log(`✅ SUCCESS: ${resourceText} | +${xp} XP`);
  },

  showMissFeedback() {
    console.log('❌ MISS');
  }
};
