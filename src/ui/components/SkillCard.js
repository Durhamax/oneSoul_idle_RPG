/**
 * SKILL CARD COMPONENT
 *
 * Displays individual skill cards in the dopamine skills grid.
 * Shows: emblem, level, XP bar, description, available/locked nodes
 * Implements envy mechanics for locked content.
 *
 * Follows UIComponent pattern from Foundation Spec.
 */

class SkillCard extends UIComponent {
    constructor() {
        super();
        this.element = null;
        this.skills = [];
    }

    init() {
        this.element = this.getElement('skillsGrid');
        if (!this.element) {
            console.error('[SkillCard] Could not find skillsGrid element');
            return;
        }

        // Listen for skill events (must match EventBus emission names)
        this.on('skill-level-up', (data) => this.handleSkillLevelUp(data));
        this.on('skill-xp-gained', (data) => this.handleSkillXpGained(data));
        this.on('node-unlocked', () => this.refreshCards());
        this.on('save-loaded', () => this.refreshCards());

        // Initial render
        this.renderAllCards();

        console.log('✅ SkillCard component initialized');
    }

    renderAllCards() {
        if (!this.element) return;

        // Get all skills from production data
        const allSkills = this.getAllSkills();

        let html = '';
        for (const [skillId, skillDef] of Object.entries(allSkills)) {
            html += this.renderSingleCard(skillId, skillDef);
        }

        this.setHTML(this.element, html);

        // Add event listeners after rendering
        this.attachCardListeners();
    }

    getAllSkills() {
        // Load from productionSkills if available, fallback to GameEngine state
        if (typeof productionSkills !== 'undefined') {
            return productionSkills;
        }

        console.warn('[SkillCard] productionSkills not found, using empty object');
        return {};
    }

    renderSingleCard(skillId, skillDef) {
        const state = GameEngine.state.skills[skillId];
        if (!state) {
            console.warn(`[SkillCard] No state found for skill: ${skillId}`);
            return '';
        }

        const level = state.level || 1;
        const currentXp = state.exp || 0;
        const xpForNext = this.calculateXpForLevel(level + 1);
        const xpProgress = (currentXp / xpForNext) * 100;

        // Get color for this skill
        const skillColor = this.getSkillColor(skillId);

        // Count available and locked nodes
        const { availableCount, lockedCount, lockedExamples } = this.getNodeCounts(skillId);

        return `
            <div class="skill-card"
                 data-skill="${skillId}"
                 style="--skill-color: ${skillColor};">

                <!-- Skill Header -->
                <div class="skill-header">
                    <div class="skill-emblem" style="background: ${skillColor};">
                        <span class="skill-icon">${skillDef.icon || '⚒️'}</span>
                    </div>
                    <div class="skill-title-section">
                        <h3 class="skill-name">${skillDef.name}</h3>
                        <div class="skill-level-badge" style="background: ${skillColor};">
                            Lvl ${level}
                        </div>
                    </div>
                    <!-- Node Modal Button (top-right) -->
                    <button class="skill-btn-compact"
                            data-skill="${skillId}"
                            data-action="available"
                            ${availableCount === 0 ? 'disabled' : ''}
                            title="View ${availableCount} available nodes">
                        <span class="btn-icon">📋</span>
                        <span class="btn-count">${availableCount}</span>
                    </button>
                </div>

                <!-- XP Progress Bar -->
                <div class="skill-xp-container">
                    <div class="skill-xp-bar">
                        <div class="skill-xp-fill shimmer"
                             style="width: ${xpProgress}%; background: ${skillColor};">
                        </div>
                    </div>
                    <div class="skill-xp-text">
                        ${this.formatNumber(currentXp)} / ${this.formatNumber(xpForNext)} XP
                    </div>
                </div>

                <!-- Description -->
                <div class="skill-description">
                    ${skillDef.description || 'No description'}
                </div>
            </div>
        `;
    }

    renderEnvyPreview(lockedExamples, skillColor) {
        if (!lockedExamples || lockedExamples.length === 0) return '';

        const example = lockedExamples[0]; // Show first locked node as preview

        return `
            <div class="envy-preview" style="border-color: ${skillColor};">
                <div class="envy-blur">
                    <div class="envy-icon">🔒</div>
                    <div class="envy-text">
                        <strong>${example.name}</strong>
                        <div class="envy-requirement">
                            ${example.levelRequired ? `Requires Level ${example.levelRequired}` : 'Requirements not met'}
                        </div>
                        <div class="envy-progress">
                            ${example.levelsAway ? `${example.levelsAway} more levels!` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSkillColor(skillId) {
        const colors = {
            mining: '#8b4513',
            logging: '#228b22',
            fishing: '#4682b4',
            hunting: '#8b0000',
            foraging: '#32cd32',
            thieving: '#4b0082',
            navigation: '#ffd700',
            smithing: '#ff6347',
            mechanics: '#708090',
            cooking: '#ff8c00',
            chemistry: '#9370db',
            textiles: '#db7093',
            electronics: '#4682b4',
            engineering: '#00d9ff'
        };
        return colors[skillId] || '#808090';
    }

    getNodeCounts(skillId) {
        const playerState = GameEngine.state;
        const skillLevel = playerState.skills[skillId]?.level || 1;

        // Map skill IDs to node types
        const skillToNodeType = {
            mining: 'mining',
            logging: 'logging',
            fishing: 'fishing',
            hunting: 'hunting',
            foraging: 'foraging',
            thieving: 'thieving',
            // Crafting skills don't have gathering nodes
            cooking: null,
            chemistry: null,
            smithing: null,
            mechanics: null,
            electronics: null,
            textiles: null,
            engineering: null,
            navigation: null
        };

        const nodeType = skillToNodeType[skillId];

        // If skill has no nodes (crafting skills), return zeros
        if (!nodeType) {
            return {
                availableCount: 0,
                lockedCount: 0,
                lockedExamples: []
            };
        }

        // Check if NodeRegistry is available
        if (typeof NodeRegistry === 'undefined') {
            console.warn('[SkillCard] NodeRegistry not available yet');
            return {
                availableCount: 0,
                lockedCount: 0,
                lockedExamples: []
            };
        }

        // Get all nodes for this skill type
        const allNodes = NodeRegistry.getBySkill(nodeType);

        // Separate available vs locked
        const availableNodes = [];
        const lockedNodes = [];

        for (const node of allNodes) {
            // Check if player meets requirements
            if (NodeRegistry.meetsRequirements(node, playerState)) {
                availableNodes.push(node);
            } else {
                lockedNodes.push(node);
            }
        }

        // Create locked examples (top 3 closest to unlocking)
        const lockedExamples = lockedNodes
            .map(node => ({
                nodeId: node.id,
                name: node.name,
                levelRequired: node.requirements?.skillLevel || node.requiredSkillLevel || 1,
                levelsAway: (node.requirements?.skillLevel || node.requiredSkillLevel || 1) - skillLevel,
                reason: this.getLockedReason(node, playerState)
            }))
            .filter(ex => ex.levelsAway > 0)  // Only show if it's a level issue
            .sort((a, b) => a.levelsAway - b.levelsAway)  // Closest first
            .slice(0, 3);  // Top 3

        return {
            availableCount: availableNodes.length,
            lockedCount: lockedNodes.length,
            lockedExamples
        };
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

    calculateXpForLevel(level) {
        // Standard XP curve: 100 * level^1.5
        return Math.floor(100 * Math.pow(level, 1.5));
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.floor(num).toString();
    }

    attachCardListeners() {
        // Compact node modal buttons
        const compactBtns = document.querySelectorAll('.skill-btn-compact');
        compactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const skillId = e.currentTarget.dataset.skill;
                const action = e.currentTarget.dataset.action || 'available';
                this.showNodePanel(skillId, action);
            });
        });
    }

    showNodePanel(skillId, filterType) {
        console.log(`[SkillCard] Opening node panel: ${skillId} (${filterType})`);

        // Emit event for NodePanel component to handle
        EventBus.emit('show-node-panel', {
            skillId,
            filterType
        });
    }

    handleSkillLevelUp(data) {
        const { skillId } = data;
        console.log(`[SkillCard] Skill leveled up: ${skillId}`);

        // Refresh just this card
        this.refreshCard(skillId);

        // Trigger celebration animation
        this.triggerLevelUpAnimation(skillId);
    }

    handleSkillXpGained(data) {
        const { skillId } = data;

        // Update XP bar smoothly
        this.updateXpBar(skillId);
    }

    refreshCard(skillId) {
        const skillCard = this.element?.querySelector(`[data-skill="${skillId}"]`);
        if (!skillCard) return;

        const allSkills = this.getAllSkills();
        const skillDef = allSkills[skillId];
        if (!skillDef) return;

        // Re-render this specific card
        const newCardHTML = this.renderSingleCard(skillId, skillDef);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newCardHTML;
        const newCard = tempDiv.firstElementChild;

        skillCard.replaceWith(newCard);

        // Re-attach listeners
        this.attachCardListeners();
    }

    refreshCards() {
        // Full refresh of all cards
        this.renderAllCards();
    }

    updateXpBar(skillId) {
        const skillCard = this.element?.querySelector(`[data-skill="${skillId}"]`);
        if (!skillCard) return;

        const state = GameEngine.state.skills[skillId];
        if (!state) return;

        const level = state.level || 1;
        const currentXp = state.exp || 0;
        const xpForNext = this.calculateXpForLevel(level + 1);
        const xpProgress = (currentXp / xpForNext) * 100;

        const xpFill = skillCard.querySelector('.skill-xp-fill');
        const xpText = skillCard.querySelector('.skill-xp-text');

        if (xpFill) {
            xpFill.style.width = `${xpProgress}%`;
        }

        if (xpText) {
            xpText.textContent = `${this.formatNumber(currentXp)} / ${this.formatNumber(xpForNext)} XP`;
        }
    }

    triggerLevelUpAnimation(skillId) {
        const skillCard = this.element?.querySelector(`[data-skill="${skillId}"]`);
        if (!skillCard) return;

        skillCard.classList.add('level-up-animation');
        setTimeout(() => {
            skillCard.classList.remove('level-up-animation');
        }, 1000);

        // Emit particle event
        EventBus.emit('spawn-particles', {
            type: 'levelup',
            element: skillCard
        });
    }
}

// Create singleton instance
const skillCard = new SkillCard();

console.log('✅ SkillCard component loaded');
