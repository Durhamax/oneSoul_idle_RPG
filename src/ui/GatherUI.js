/**
 * GATHER UI
 *
 * Primary gathering interface following Crafting UI patterns.
 * Displays all gathering skills with node selection and activity progress.
 *
 * Structure:
 * - Skill pills for filtering (Mining, Logging, Fishing, etc.)
 * - Active gathering display with IntervalBar
 * - Node cards grid for selected skill
 * - Session stats sidebar
 */

const GatherUI = {
    // Currently selected gathering skill
    selectedSkill: 'mining',

    // Last rendered state for optimization
    lastState: null,

    // Gathering skills list
    GATHERING_SKILLS: ['mining', 'logging', 'fishing', 'hunting', 'foraging', 'thieving'],

    // Skill icons
    SKILL_ICONS: {
        mining: '⛏️',
        logging: '🪓',
        fishing: '🎣',
        hunting: '🏹',
        foraging: '🌿',
        thieving: '🎭'
    },

    // Skill colors
    SKILL_COLORS: {
        mining: '#8B4513',
        logging: '#228B22',
        fishing: '#4682B4',
        hunting: '#8B0000',
        foraging: '#9ACD32',
        thieving: '#4B0082'
    },

    /**
     * Initialize the Gather UI
     */
    init() {
        console.log('[GatherUI] Initializing...');

        // Subscribe to relevant events
        if (typeof EventBus !== 'undefined') {
            EventBus.on('gathering-started', this.onGatheringStarted.bind(this));
            EventBus.on('gathering-completed', this.onGatheringCompleted.bind(this));
            EventBus.on('gathering-success', this.onGatheringAction.bind(this));
            EventBus.on('gathering-miss', this.onGatheringMiss.bind(this));
            console.log('[GatherUI] ✅ Event subscriptions registered');
        } else {
            console.warn('[GatherUI] ⚠️ EventBus not available, will retry...');
            // Retry after a short delay if EventBus isn't ready yet
            setTimeout(() => this.init(), 100);
        }
    },

    /**
     * Main render function - called when switching to gather view
     */
    render() {
        const container = document.getElementById('view-gather');
        if (!container) {
            console.error('[GatherUI] Container not found: view-gather');
            return;
        }

        container.innerHTML = `
            <div class="gather-ui-container">
                ${this.renderSkillPills()}
                <div class="gather-main-layout">
                    <div class="gather-content">
                        ${this.renderActiveGathering()}
                        ${this.renderSkillHeader()}
                        <div id="gather-nodes-grid" class="gather-nodes-grid">
                            ${this.renderNodeCards()}
                        </div>
                    </div>
                    ${this.renderSessionSidebar()}
                </div>
            </div>
        `;

        // Start interval updates if gathering
        this.startUpdates();
    },

    /**
     * Render skill pill filters
     */
    renderSkillPills() {
        const skills = GameEngine.state.skills;

        const tabs = this.GATHERING_SKILLS.map(skillId => {
            const skill = skills[skillId];
            if (!skill || !skill.unlocked) return '';

            const isActive = this.selectedSkill === skillId;
            const icon = this.SKILL_ICONS[skillId];
            const nodeCount = this.getNodeCountForSkill(skillId);

            return `
                <button class="crafting-tab gather-skill-tab ${isActive ? 'active' : ''}"
                        data-skill="${skillId}"
                        onclick="GatherUI.selectSkill('${skillId}')">
                    <span class="tab-icon">${icon}</span>
                    <span class="tab-label">${this.capitalizeFirst(skillId)}</span>
                    <span class="tab-level">Lv.${skill.level}</span>
                    ${nodeCount > 0 ? `<span class="tab-badge">${nodeCount}</span>` : ''}
                </button>
            `;
        }).join('');

        return `
            <div class="crafting-tabs gather-skill-tabs">
                ${tabs}
            </div>
        `;
    },

    /**
     * Render active gathering section
     */
    renderActiveGathering() {
        const session = GameEngine.state.gatheringSession;
        const isGathering = session && GameEngine.state.currentActivity === 'gathering';

        if (!isGathering) {
            return `
                <div class="gather-active-empty">
                    <div class="empty-icon">🌿</div>
                    <div class="empty-text">No Active Gathering</div>
                    <div class="empty-hint">Select a node below to start gathering</div>
                </div>
            `;
        }

        // Get node and tool info
        const nodeDef = this.getNodeDefinition(session.nodeId);
        const toolDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(session.toolId) : null;
        const skill = GameEngine.state.skills[session.skill];

        if (!nodeDef) {
            return `<div class="gather-active-error">Error: Invalid gathering session</div>`;
        }

        const skillIcon = this.SKILL_ICONS[session.skill];
        const skillName = this.capitalizeFirst(session.skill);
        const isRecovering = session.isRecovering || false;

        // Calculate interval progress
        const now = Date.now();
        const interval = this.calculateActionInterval(nodeDef, toolDef, skill);
        const timeSinceLastAction = now - (session.lastActionTime || now);
        const progress = isRecovering ? 0 : Math.min(timeSinceLastAction, interval);

        return `
            <div class="gather-active-panel" data-activity="gathering" data-skill="${session.skill}">
                <div class="gather-active-header">
                    <div class="gather-active-info">
                        <span class="gather-node-icon">${nodeDef.icon || skillIcon}</span>
                        <div class="gather-active-details">
                            <div class="gather-node-name">${nodeDef.name}</div>
                            <div class="gather-node-meta">
                                ${skillIcon} ${skillName} • Level ${skill?.level || 1}
                                ${toolDef ? ` • Using ${toolDef.name}` : ''}
                            </div>
                        </div>
                    </div>
                    <button class="btn-stop-gather" onclick="GatherUI.stopGathering()">
                        <span>⏹️</span> Stop
                    </button>
                </div>

                <!-- Interval Bar -->
                <div id="gather-interval-bar">
                    ${IntervalBar.render({
                        id: 'gather-progress',
                        label: isRecovering ? 'Recovering' : 'Gathering',
                        icon: isRecovering ? '💤' : skillIcon,
                        current: progress,
                        max: interval,
                        color: isRecovering ? '#FFC107' : this.SKILL_COLORS[session.skill],
                        gradient: isRecovering
                            ? 'linear-gradient(90deg, #FFC107, #FF9800)'
                            : `linear-gradient(90deg, ${this.SKILL_COLORS[session.skill]}, ${this.SKILL_COLORS[session.skill]}aa)`,
                        animated: true,
                        showTime: true,
                        variant: 'default',
                        stats: {
                            'Interval': `${(interval / 1000).toFixed(1)}s`,
                            'Success': `${(this.calculateSuccessChance(nodeDef, toolDef, skill) * 100).toFixed(0)}%`
                        }
                    })}
                </div>

                <!-- Node Health depleting bar -->
                ${this.renderNodeHealthBar(session, isRecovering)}
            </div>
        `;
    },

    /**
     * Render the node-health depleting bar for the active gathering panel
     */
    renderNodeHealthBar(session, isRecovering) {
        const health = (session && session.nodeHealth !== undefined) ? session.nodeHealth : 0;
        const maxHealth = (session && session.maxNodeHealth !== undefined) ? session.maxNodeHealth : 10;
        const pct = maxHealth > 0 ? Math.max(0, Math.min(100, (health / maxHealth) * 100)) : 0;
        const low = pct <= 30;

        return `
            <div class="gather-nodehealth">
                <div class="gather-nodehealth-head">
                    <span class="gather-nodehealth-label">${isRecovering ? '💤 Node Recovering' : '🪨 Node Health'}</span>
                </div>
                <div class="gather-nodehealth-track">
                    <div class="gather-nodehealth-fill ${isRecovering ? 'is-recovering' : ''} ${low && !isRecovering ? 'is-low' : ''}"
                         id="gather-node-health-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    },

    /**
     * Render skill header with level and bonuses
     */
    renderSkillHeader() {
        const skill = GameEngine.state.skills[this.selectedSkill];
        if (!skill) return '';

        const skillDef = GameEngine.definitions.skills?.[this.selectedSkill];
        const icon = this.SKILL_ICONS[this.selectedSkill];
        const color = this.SKILL_COLORS[this.selectedSkill];

        const expRequired = GameEngine.getSkillExpRequired?.(this.selectedSkill) || 100;
        const expPercent = (skill.exp / expRequired) * 100;

        return `
            <div class="skill-header" style="--skill-color: ${color};">
                <div class="skill-header-info">
                    <div class="skill-header-title">
                        <span>${icon}</span>
                        <span>${this.capitalizeFirst(this.selectedSkill)}</span>
                        <span class="skill-header-level">Level ${skill.level}</span>
                    </div>
                    <div class="skill-header-xp">
                        <div class="skill-xp-bar">
                            <div class="skill-xp-fill" style="width: ${expPercent}%; background: ${color};"></div>
                        </div>
                        <span class="skill-xp-text">
                            ${Formatting.formatNumber(skill.exp)} / ${Formatting.formatNumber(expRequired)} XP
                        </span>
                    </div>
                </div>
                <div class="skill-header-bonuses">
                    <span class="bonus-tag speed">+${Math.min(skill.level * 2, 50)}% Speed</span>
                    <span class="bonus-tag yield">+${Math.min(skill.level, 25)}% Yield</span>
                    <span class="bonus-tag rare">+${(skill.level * 0.5).toFixed(1)}% Rare</span>
                </div>
            </div>
        `;
    },

    /**
     * Render node cards for selected skill
     */
    renderNodeCards() {
        const nodes = this.getNodesForSkill(this.selectedSkill);

        if (nodes.length === 0) {
            return `
                <div class="no-nodes">
                    <div class="no-nodes-icon">${this.SKILL_ICONS[this.selectedSkill]}</div>
                    <div class="no-nodes-text">No ${this.capitalizeFirst(this.selectedSkill)} nodes discovered</div>
                    <div class="no-nodes-hint">Explore new regions to find gathering spots</div>
                </div>
            `;
        }

        return nodes.map(node => this.renderNodeCard(node)).join('');
    },

    /**
     * Render a single node card
     */
    renderNodeCard(node) {
        // Ensure node has an id
        if (!node || !node.id) {
            console.warn('[GatherUI] Node missing id:', node);
            return '';
        }

        const playerSkillLevel = GameEngine.state.skills[node.nodeType]?.level || 0;
        const canGather = playerSkillLevel >= (node.requiredSkillLevel || 1);
        const isLocked = !canGather;

        const color = this.SKILL_COLORS[node.nodeType];
        const harvestTime = this.calculateHarvestTime(node, playerSkillLevel);
        const rareChance = this.calculateRareChance(node, playerSkillLevel);

        // Get node health/state (runtime state stores currentHP/maxHP)
        const rawState = GameEngine.state.nodeHealth?.[node.id];
        const defaultMax = node.maxHealth || node.baseHealth || 10;
        const curHealth = rawState
            ? (rawState.currentHP ?? rawState.currentHealth ?? defaultMax)
            : defaultMax;
        const maxHealth = rawState
            ? (rawState.maxHP ?? rawState.maxHealth ?? defaultMax)
            : defaultMax;
        const healthPercent = maxHealth > 0 ? (curHealth / maxHealth) * 100 : 0;
        const isDepleted = curHealth <= 0;

        // Check if currently gathering this node
        const session = GameEngine.state.gatheringSession;
        const isActive = session && session.nodeId === node.id && GameEngine.state.currentActivity === 'gathering';

        return `
            <div class="node-card ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''} ${isDepleted ? 'depleted' : ''}"
                 style="--node-color: ${node.color || color};">

                <!-- Tier Badge -->
                <div class="node-tier">${'⭐'.repeat(node.tier || 1)}</div>

                <!-- Node Header -->
                <div class="node-card-header">
                    <span class="node-icon">${node.icon || this.SKILL_ICONS[node.nodeType]}</span>
                    <div class="node-info">
                        <div class="node-name">${node.name}</div>
                        <div class="node-desc">${node.description || ''}</div>
                    </div>
                </div>

                <!-- Health Bar -->
                <div class="node-health">
                    <div class="node-health-bar">
                        <div class="node-health-fill" style="width: ${healthPercent}%;"></div>
                    </div>
                    <span class="node-health-text">
                        ${isDepleted ? 'Depleted' : `${curHealth}/${maxHealth}`}
                    </span>
                </div>

                <!-- Resources Preview -->
                <div class="node-resources">
                    ${this.renderResourcePreview(node)}
                </div>

                <!-- Stats -->
                <div class="node-stats">
                    <div class="node-stat">
                        <span class="stat-label">Time</span>
                        <span class="stat-value">${harvestTime.toFixed(1)}s</span>
                    </div>
                    <div class="node-stat">
                        <span class="stat-label">Rare</span>
                        <span class="stat-value">${rareChance.toFixed(1)}%</span>
                    </div>
                    <div class="node-stat">
                        <span class="stat-label">Req</span>
                        <span class="stat-value ${canGather ? 'met' : 'unmet'}">Lv.${node.requiredSkillLevel || 1}</span>
                    </div>
                </div>

                <!-- Action Button -->
                ${this.renderNodeAction(node, canGather, isActive, isDepleted)}
            </div>
        `;
    },

    /**
     * Render resource preview for node
     */
    renderResourcePreview(node) {
        if (!node.resourceTable || node.resourceTable.length === 0) {
            return '<span class="no-resources">No data</span>';
        }

        const topResources = node.resourceTable
            .sort((a, b) => (b.weight || 1) - (a.weight || 1))
            .slice(0, 3);

        return topResources.map(resource => {
            const itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(resource.itemId) : null;
            const iconHtml = (typeof IconHelper !== 'undefined' && itemDef)
                ? IconHelper.getItemIconHTML(itemDef, { size: 16 })
                : (itemDef?.icon || '📦');
            return `
                <span class="resource-tag">
                    ${iconHtml} ${itemDef?.name || resource.itemId}
                </span>
            `;
        }).join('');
    },

    /**
     * Render node action button
     */
    renderNodeAction(node, canGather, isActive, isDepleted) {
        if (isActive) {
            return `
                <button class="node-action-btn active" onclick="GatherUI.stopGathering()">
                    <span>⏹️</span> Stop
                </button>
            `;
        }

        if (isDepleted) {
            return `
                <button class="node-action-btn depleted" disabled>
                    <span>💤</span> Respawning...
                </button>
            `;
        }

        if (!canGather) {
            return `
                <button class="node-action-btn locked" disabled>
                    <span>🔒</span> Level Required
                </button>
            `;
        }

        return `
            <button class="node-action-btn" onclick="GatherUI.startGathering('${node.id}')">
                <span>${this.SKILL_ICONS[node.nodeType]}</span> Gather
            </button>
        `;
    },

    /**
     * Render session sidebar
     */
    renderSessionSidebar() {
        const session = GameEngine.state.gatheringSession;
        const isGathering = session && GameEngine.state.currentActivity === 'gathering';

        if (!isGathering) {
            return `
                <div class="gather-sidebar">
                    <div class="sidebar-header">
                        <h3>📦 Session Loot</h3>
                    </div>
                    <div class="sidebar-empty">
                        <div class="empty-icon">📦</div>
                        <div class="empty-text">No active session</div>
                        <div class="empty-hint">Start gathering to track loot</div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="gather-sidebar">
                <div class="sidebar-header">
                    <h3>📦 Session Loot</h3>
                </div>
                <div class="sidebar-content">
                    ${this.renderSessionLoot(session.totalResources)}
                </div>
            </div>
        `;
    },

    /**
     * Render session loot
     */
    renderSessionLoot(resources) {
        if (!resources || Object.keys(resources).length === 0) {
            return `
                <div class="loot-empty">
                    <span>No resources gathered yet</span>
                </div>
            `;
        }

        return Object.entries(resources).map(([itemId, qty]) => {
            const itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null;
            const iconHtml = (typeof IconHelper !== 'undefined' && itemDef)
                ? IconHelper.getItemIconHTML(itemDef, { size: 24 })
                : (itemDef?.icon || '📦');
            return `
                <div class="loot-item">
                    <span class="loot-icon">${iconHtml}</span>
                    <span class="loot-name">${itemDef?.name || itemId}</span>
                    <span class="loot-qty">+${qty}</span>
                </div>
            `;
        }).join('');
    },

    // ===========================
    // ACTIONS
    // ===========================

    /**
     * Select a gathering skill
     */
    selectSkill(skillId) {
        if (!this.GATHERING_SKILLS.includes(skillId)) return;

        console.log(`[GatherUI] Selecting skill: ${skillId}`);
        this.selectedSkill = skillId;

        // Update skill tabs (Craft top-tab style)
        document.querySelectorAll('.gather-skill-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const activeTab = document.querySelector(`.gather-skill-tab[data-skill="${skillId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Re-render content
        const header = document.querySelector('.skill-header');
        const grid = document.getElementById('gather-nodes-grid');

        if (header) {
            header.outerHTML = this.renderSkillHeader();
        }

        if (grid) {
            grid.innerHTML = this.renderNodeCards();
        }
    },

    /**
     * Start gathering a node
     */
    startGathering(nodeId) {
        console.log(`[GatherUI] Starting gathering: ${nodeId}`);

        if (!nodeId) {
            console.error('[GatherUI] Cannot start gathering: nodeId is undefined');
            return;
        }

        // Look up node to get skill type
        const node = NodeRegistry.getAllActive()[nodeId];
        if (!node) {
            console.error(`[GatherUI] Node not found: ${nodeId}`);
            return;
        }

        const skill = node.nodeType || node.skillType;
        if (!skill) {
            console.error(`[GatherUI] Node has no skill type: ${nodeId}`);
            return;
        }

        if (typeof GameEngine !== 'undefined' && GameEngine.startGathering) {
            // Pass both skill and nodeId (GatheringSystem expects both)
            const result = GameEngine.startGathering(skill, nodeId);
            console.log(`[GatherUI] startGathering result:`, result);
            if (result) {
                this.render();
            }
        }
    },

    /**
     * Stop current gathering
     */
    stopGathering() {
        console.log('[GatherUI] Stopping gathering');

        if (typeof GameEngine !== 'undefined' && GameEngine.stopGathering) {
            GameEngine.stopGathering();
            this.render();
        }
    },

    // ===========================
    // UPDATES
    // ===========================

    /**
     * Start interval bar updates
     */
    startUpdates() {
        // Clear any existing update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.updateIntervalBar();
        }, 50);
    },

    /**
     * Stop updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    /**
     * Update the interval bar progress
     */
    updateIntervalBar() {
        const session = GameEngine.state.gatheringSession;
        if (!session || GameEngine.state.currentActivity !== 'gathering') return;

        const nodeDef = this.getNodeDefinition(session.nodeId);
        const toolDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(session.toolId) : null;
        const skill = GameEngine.state.skills[session.skill];

        if (!nodeDef) return;

        const interval = this.calculateActionInterval(nodeDef, toolDef, skill);
        const now = Date.now();
        const timeSinceLastAction = now - (session.lastActionTime || now);
        const progress = session.isRecovering ? 0 : Math.min(timeSinceLastAction, interval);

        // Update interval bar
        IntervalBar.update('gather-progress', progress, interval);

        // Keep the node-health depleting bar in sync
        this.updateNodeHealthBar(session);
    },

    /**
     * Update just the node-health bar width (cheap, called on tick and on action)
     */
    updateNodeHealthBar(session) {
        const fill = document.getElementById('gather-node-health-fill');
        if (!fill || !session) return;
        const maxHealth = session.maxNodeHealth !== undefined ? session.maxNodeHealth : 10;
        const health = session.nodeHealth !== undefined ? session.nodeHealth : 0;
        const pct = maxHealth > 0 ? Math.max(0, Math.min(100, (health / maxHealth) * 100)) : 0;
        fill.style.width = `${pct}%`;
        fill.classList.toggle('is-low', pct <= 30 && !session.isRecovering);
        fill.classList.toggle('is-recovering', !!session.isRecovering);
    },

    /**
     * Force refresh the UI
     */
    refresh() {
        this.render();
    },

    // ===========================
    // HELPERS
    // ===========================

    /**
     * Get node definition
     */
    getNodeDefinition(nodeId) {
        if (typeof NodeRegistry !== 'undefined' && NodeRegistry.getAllActive) {
            return NodeRegistry.getAllActive()[nodeId];
        }
        return GameEngine.definitions?.resourceNodes?.[nodeId];
    },

    /**
     * Get nodes for a skill
     */
    getNodesForSkill(skillId) {
        // Use NodeRegistry.getBySkill if available (returns array with id property)
        if (typeof NodeRegistry !== 'undefined' && NodeRegistry.getBySkill) {
            return NodeRegistry.getBySkill(skillId);
        }

        // Fallback to manual filtering
        const allNodes = GameEngine.definitions?.resourceNodes || {};
        return Object.entries(allNodes)
            .filter(([id, node]) => node.nodeType === skillId)
            .map(([id, node]) => ({ ...node, id })); // Ensure id is on each node
    },

    /**
     * Get node count for a skill
     */
    getNodeCountForSkill(skillId) {
        return this.getNodesForSkill(skillId).length;
    },

    /**
     * Calculate harvest time
     */
    calculateHarvestTime(node, playerLevel) {
        let baseTime = node.harvestTime || 3000;
        const speedBonus = Math.min(playerLevel * 0.02, 0.5);
        return (baseTime * (1 - speedBonus)) / 1000;
    },

    /**
     * Calculate rare chance
     */
    calculateRareChance(node, playerLevel) {
        const baseChance = node.rareChance || 5;
        const levelBonus = playerLevel * 0.5;
        return Math.min(baseChance + levelBonus, 50);
    },

    /**
     * Calculate action interval
     */
    calculateActionInterval(nodeDef, toolDef, skill) {
        let baseInterval = 3000;

        if (toolDef?.gatheringBonus?.[skill?.id]?.speed) {
            baseInterval = baseInterval / toolDef.gatheringBonus[skill.id].speed;
        }

        const skillSpeedBonus = Math.min((skill?.level || 1) * 0.02, 0.5);
        baseInterval = baseInterval * (1 - skillSpeedBonus);

        const nodeResistance = nodeDef?.harvestSpeed || 1.0;
        baseInterval = baseInterval * nodeResistance;

        return Math.max(500, Math.floor(baseInterval));
    },

    /**
     * Calculate success chance
     */
    calculateSuccessChance(nodeDef, toolDef, skill) {
        let baseChance = 0.7;

        if (toolDef?.gatheringBonus?.[skill?.id]?.accuracy) {
            baseChance += toolDef.gatheringBonus[skill.id].accuracy;
        }

        baseChance += (skill?.level || 1) * 0.01;

        const levelDiff = (nodeDef?.requiredSkillLevel || 1) - (skill?.level || 1);
        if (levelDiff > 0) {
            baseChance -= levelDiff * 0.05;
        }

        return Math.max(0.1, Math.min(0.95, baseChance));
    },

    /**
     * Format duration
     */
    formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // ===========================
    // EVENT HANDLERS
    // ===========================

    onGatheringStarted(data) {
        console.log('[GatherUI] Gathering started:', data);
        this.render();
    },

    onGatheringCompleted(data) {
        console.log('[GatherUI] Gathering completed:', data);
        this.render();
    },

    onGatheringAction(data) {
        // Update loot sidebar - find the sidebar container
        const sidebarContainer = document.querySelector('.gather-sidebar');
        if (sidebarContainer && GameEngine.state.gatheringSession?.totalResources) {
            // Check if sidebar-content exists, if not we need to add it
            let sidebarContent = sidebarContainer.querySelector('.sidebar-content');
            if (!sidebarContent) {
                // Replace sidebar-empty with sidebar-content
                const emptyDiv = sidebarContainer.querySelector('.sidebar-empty');
                if (emptyDiv) {
                    emptyDiv.remove();
                }
                sidebarContent = document.createElement('div');
                sidebarContent.className = 'sidebar-content';
                sidebarContainer.appendChild(sidebarContent);
            }
            sidebarContent.innerHTML = this.renderSessionLoot(GameEngine.state.gatheringSession.totalResources);
        }

        // Update the node-health depleting bar
        this.updateNodeHealthBar(GameEngine.state.gatheringSession);
    },

    onGatheringMiss(data) {
        // Node health unchanged on a miss; nothing to update in the slimmed panel
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.GatherUI = GatherUI;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => GatherUI.init());
    } else {
        GatherUI.init();
    }
}
