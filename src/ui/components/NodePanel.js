/**
 * NODE PANEL COMPONENT
 *
 * Slide-in panel that displays filtered node lists when clicking
 * Available/Locked buttons on skill cards.
 *
 * Follows UIComponent pattern from Foundation Spec.
 */

class NodePanel extends UIComponent {
    constructor() {
        super();
        this.element = null;
        this.currentSkill = null;
        this.currentFilter = 'available';
        this.isOpen = false;
        this.nodes = [];
    }

    init() {
        this.element = this.getElement('nodePanel');
        if (!this.element) {
            console.error('[NodePanel] Could not find nodePanel element');
            return;
        }

        // Listen for show panel events from SkillCard
        this.on('show-node-panel', (data) => {
            this.showPanel(data.skillId, data.filterType);
        });

        console.log('✅ NodePanel component initialized');
    }

    showPanel(skillId, filterType) {
        this.currentSkill = skillId;
        this.currentFilter = filterType;
        this.isOpen = true;

        // Get filtered nodes
        this.nodes = this.getFilteredNodes();

        console.log(`[NodePanel] Showing ${filterType} nodes for ${skillId}:`, this.nodes.length);

        this.render();

        // Slide in animation (add class after render)
        setTimeout(() => {
            this.element.classList.add('open');
        }, 10);
    }

    hidePanel() {
        this.isOpen = false;
        this.element.classList.remove('open');

        // Clear after animation completes
        setTimeout(() => {
            if (!this.isOpen) {
                this.setHTML(this.element, '');
            }
        }, 300);
    }

    getFilteredNodes() {
        const skillToNodeType = {
            mining: 'mining',
            logging: 'logging',
            fishing: 'fishing',
            hunting: 'hunting',
            foraging: 'foraging',
            thieving: 'thieving',
            cooking: null,
            chemistry: null,
            smithing: null,
            mechanics: null,
            electronics: null,
            textiles: null,
            engineering: null,
            navigation: null
        };

        const nodeType = skillToNodeType[this.currentSkill];
        if (!nodeType) return [];

        // Check if NodeRegistry is available
        if (typeof NodeRegistry === 'undefined') {
            console.error('[NodePanel] NodeRegistry not available');
            return [];
        }

        const allNodes = NodeRegistry.getBySkill(nodeType);
        const playerState = GameEngine.state;

        if (this.currentFilter === 'available') {
            return allNodes.filter(node =>
                NodeRegistry.meetsRequirements(node, playerState)
            );
        } else {
            return allNodes.filter(node =>
                !NodeRegistry.meetsRequirements(node, playerState)
            );
        }
    }

    render() {
        if (!this.element || !this.isOpen) return;

        const skillName = this.currentSkill.charAt(0).toUpperCase() + this.currentSkill.slice(1);
        const filterLabel = this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1);

        const html = `
            <div class="node-panel-header">
                <div class="panel-title">
                    <span class="panel-skill-name">${skillName}</span>
                    <span class="panel-filter-badge ${this.currentFilter}">${filterLabel}</span>
                </div>
                <button class="panel-close-btn" onclick="nodePanel.hidePanel()">✕</button>
            </div>

            <div class="node-panel-body">
                ${this.nodes.length === 0 ? this.renderEmptyState() : ''}
                <div class="node-list">
                    ${this.nodes.map(node => this.renderNodeItem(node)).join('')}
                </div>
            </div>
        `;

        this.setHTML(this.element, html);
    }

    renderEmptyState() {
        if (this.currentFilter === 'available') {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">No Available Nodes</div>
                    <div class="empty-message">
                        Level up your ${this.currentSkill} skill to unlock more nodes!
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="empty-state">
                    <div class="empty-icon">✨</div>
                    <div class="empty-title">All Nodes Unlocked!</div>
                    <div class="empty-message">
                        You've unlocked all ${this.currentSkill} nodes. Great work!
                    </div>
                </div>
            `;
        }
    }

    renderNodeItem(node) {
        const isLocked = this.currentFilter === 'locked';
        const playerState = GameEngine.state;
        const tierClass = `tier-${node.tier || 1}`;

        return `
            <div class="node-item ${isLocked ? 'locked' : 'available'} ${tierClass}"
                 data-node-id="${node.id}">

                <!-- Node Icon & Info -->
                <div class="node-main-content">
                    <div class="node-icon-container">
                        <span class="node-icon">${node.icon || '📦'}</span>
                        <span class="node-tier-badge">T${node.tier || 1}</span>
                    </div>

                    <div class="node-info">
                        <div class="node-name-row">
                            <span class="node-name">${node.name}</span>
                            ${isLocked ? '<span class="lock-icon">🔒</span>' : ''}
                        </div>
                        <div class="node-description">${node.description || 'No description'}</div>

                        <!-- Node Stats -->
                        <div class="node-stats">
                            <span class="node-stat">
                                <span class="stat-icon">⚡</span>
                                <span class="stat-value">${node.harvestTime || 3}s</span>
                            </span>
                            <span class="node-stat">
                                <span class="stat-icon">💎</span>
                                <span class="stat-value">${node.baseXP || 0} XP</span>
                            </span>
                            <span class="node-stat">
                                <span class="stat-icon">❤️</span>
                                <span class="stat-value">${node.baseHealth || 10} HP</span>
                            </span>
                        </div>

                        ${isLocked ? this.renderLockInfo(node, playerState) : this.renderResourcePreview(node)}
                    </div>
                </div>

                <!-- Action Button -->
                <div class="node-actions">
                    ${isLocked ? '' : `
                        <button class="node-start-btn"
                                onclick="nodePanel.startNode('${node.id}')">
                            <span class="btn-icon">▶️</span>
                            <span class="btn-label">Start</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderLockInfo(node, playerState) {
        const reason = this.getLockedReason(node, playerState);
        const req = node.requirements;
        const skillLevel = playerState.skills[req?.skill]?.level || 1;
        const reqLevel = req?.skillLevel || node.requiredSkillLevel || 1;
        const levelsAway = reqLevel - skillLevel;

        return `
            <div class="node-lock-info">
                <div class="lock-reason">${reason}</div>
                ${levelsAway > 0 ? `
                    <div class="lock-progress">
                        ${levelsAway} more level${levelsAway === 1 ? '' : 's'}!
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderResourcePreview(node) {
        if (!node.resourceTable || node.resourceTable.length === 0) {
            return '';
        }

        // Show top 3 resources
        const topResources = node.resourceTable
            .sort((a, b) => (b.weight || 0) - (a.weight || 0))
            .slice(0, 3);

        return `
            <div class="node-resources">
                <span class="resources-label">Yields:</span>
                ${topResources.map(res => {
                    const itemDef = res.itemDef || ItemRegistry?.get?.(res.itemId);
                    const itemName = itemDef?.name || res.itemId;
                    const itemIcon = itemDef?.icon || '📦';
                    return `<span class="resource-tag">${itemIcon} ${itemName}</span>`;
                }).join('')}
            </div>
        `;
    }

    getLockedReason(node, playerState) {
        const req = node.requirements;
        if (!req) return 'Requirements not defined';

        const skillLevel = playerState.skills[req.skill]?.level || 1;

        // Check skill level
        if (skillLevel < req.skillLevel) {
            return `Requires ${req.skill} level ${req.skillLevel}`;
        }

        // Check character level
        if (req.characterLevel && playerState.characterLevel.level < req.characterLevel) {
            return `Requires character level ${req.characterLevel}`;
        }

        // Check tool requirement
        if (req.tools && req.tools.length > 0) {
            const hasRequiredTool = NodeRegistry.hasRequiredTool(
                req.tools,
                req.toolTier || 1,
                playerState
            );
            if (!hasRequiredTool) {
                const toolName = req.tools[0].charAt(0).toUpperCase() + req.tools[0].slice(1);
                return `Requires ${toolName} (Tier ${req.toolTier || 1})`;
            }
        }

        // Check quests
        if (req.quests && req.quests.length > 0) {
            if (!playerState.completedQuests) {
                return `Requires quest completion`;
            }
            for (let questId of req.quests) {
                if (!playerState.completedQuests.includes(questId)) {
                    return `Requires quest: ${questId}`;
                }
            }
        }

        return 'Requirements not met';
    }

    startNode(nodeId) {
        console.log(`[NodePanel] Starting node: ${nodeId}`);

        // Use global startNodeHarvesting function (from globalHandlers.js)
        // This function properly uses GatheringSystem, not the deprecated NodeCollectionSystem
        if (typeof startNodeHarvesting === 'function') {
            startNodeHarvesting(nodeId);  // Calls GatheringSystem via globalHandlers.js
            console.log(`[NodePanel] Successfully started harvesting ${nodeId}`);

            // Close panel
            this.hidePanel();

            // Stay on skills view to see persistent action bar
        } else {
            console.error('[NodePanel] startNodeHarvesting function not available');
        }
    }
}

// Create singleton instance
const nodePanel = new NodePanel();

console.log('✅ NodePanel component loaded');
