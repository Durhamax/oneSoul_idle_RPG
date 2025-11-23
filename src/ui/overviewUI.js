/**
 * OVERVIEW UI - Character & Progress Summary
 *
 * Displays a compact overview of:
 * - All skill levels
 * - Current region
 * - Current activity
 * - Equipped items
 *
 * Designed to fit on one screen without scrolling.
 */

const OverviewUI = {
    // Cache last rendered state
    lastOverviewState: null,

    /**
     * Update overview display
     */
    updateOverview() {
        const container = document.getElementById("overviewView");
        if (!container) return;

        // Create state snapshot
        const currentState = {
            region: GameEngine.state.currentRegion,
            activity: GameEngine.state.currentActivity,
            navLevel: GameEngine.state.skills.navigation.level,
            equipment: JSON.stringify(GameEngine.state.equipment),
            activeNode: GameEngine.state.nodeCollection?.activeNode?.nodeId || null,
            activeCrafts: GameEngine.state.crafting?.activeCrafts?.length || 0,
            inCombat: GameEngine.state.combat?.inCombat || false,
            combatAttributes: JSON.stringify(GameEngine.state.combatAttributes),
            skills: JSON.stringify(GameEngine.state.skills)
        };

        // Only re-render if state changed
        if (this.lastOverviewState && JSON.stringify(this.lastOverviewState) === JSON.stringify(currentState)) {
            return;
        }

        container.innerHTML = this.renderOverview();
        this.lastOverviewState = currentState;
    },

    /**
     * Render the overview interface with grid layout
     */
    renderOverview() {
        return `
            <div class="dashboard-grid">
                ${this.renderActivityPanel()}
                ${this.renderCombatPanel()}
                ${this.renderSkillsPanel()}
                ${this.renderEquipmentPanel()}
            </div>
        `;
    },

    /**
     * Create a reusable panel component
     */
    createPanel(title, subtitle, content, className = '') {
        return `
            <div class="dashboard-panel ${className}">
                <div class="panel-header">
                    <div class="panel-title">${title}</div>
                    ${subtitle ? `<div class="panel-subtitle">${subtitle}</div>` : ''}
                </div>
                <div class="panel-content">
                    ${content}
                </div>
            </div>
        `;
    },

    /**
     * Render Activity Panel (large, top-left)
     */
    renderActivityPanel() {
        const content = this.renderCurrentStatus();
        return this.createPanel(
            '🎯 Current Activity',
            'What you\'re doing right now',
            content,
            'panel-activity'
        );
    },

    /**
     * Render Combat Panel (right side, tall)
     */
    renderCombatPanel() {
        const content = this.renderCombatAttributes();
        return this.createPanel(
            '⚔️ Character Stats',
            'Overall Power Metrics',
            content,
            'panel-combat'
        );
    },

    /**
     * Render Skills Panel (middle-left)
     */
    renderSkillsPanel() {
        const content = this.renderSkillsList();
        return this.createPanel(
            '⭐ Skills Overview',
            'All skill levels',
            content,
            'panel-skills'
        );
    },

    /**
     * Render Equipment Panel (middle-center)
     */
    renderEquipmentPanel() {
        const content = this.renderEquipment();
        return this.createPanel(
            '🛡️ Loadout',
            'Equipped gear',
            content,
            'panel-equipment'
        );
    },

    /**
     * Render current status (region, activity) - for Activity Panel
     */
    renderCurrentStatus() {
        const currentRegion = GameEngine.state.currentRegion;
        const hexDef = GameEngine.definitions.worldMap?.[currentRegion];
        const regionName = hexDef?.name || currentRegion;
        const biome = hexDef?.biome || 'unknown';

        // Determine current activity
        let activityText = 'Idle';
        let activityColor = '#888';
        let activityIcon = '💤';
        let activityDetails = 'Nothing happening right now';

        if (GameEngine.state.combat?.inCombat) {
            const enemy = GameEngine.state.combat.currentEnemy;
            const enemyDef = GameEngine.definitions.enemies[enemy?.enemyId];
            activityText = `Fighting ${enemyDef?.name || 'Enemy'}`;
            activityColor = '#f44336';
            activityIcon = '⚔️';
            activityDetails = `Enemy HP: ${Math.floor(enemy?.currentHealth || 0)} / ${enemyDef?.health || 0}`;
        } else if (GameEngine.state.nodeCollection?.activeNode) {
            const nodeId = GameEngine.state.nodeCollection.activeNode.nodeId;
            const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
            activityText = `Harvesting ${nodeDef?.name || 'Node'}`;
            activityColor = '#4caf50';
            activityIcon = nodeDef?.image || '⛏️';
            activityDetails = `Collecting resources from node`;
        } else if (GameEngine.state.crafting?.activeCrafts?.length > 0) {
            const craft = GameEngine.state.crafting.activeCrafts[0];
            const recipeDef = GameEngine.definitions.recipes[craft.recipeId];
            activityText = `Crafting ${recipeDef?.name || 'Item'}`;
            activityColor = '#ff9800';
            activityIcon = '🔨';
            const remaining = Math.max(0, Math.ceil((craft.completionTime - Date.now()) / 1000));
            activityDetails = `${remaining}s remaining`;
        } else if (GameEngine.state.activeNavigation?.isNavigating) {
            activityText = 'Exploring Region';
            activityColor = '#2196f3';
            activityIcon = '🗺️';
            activityDetails = `Discovering new locations`;
        }

        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <!-- Region Info (Compressed) -->
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 10px; border-left: 3px solid #e94560;">
                    <div style="font-size: 0.7em; color: #888; text-transform: uppercase; margin-bottom: 3px;">Current Region</div>
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <div style="font-weight: bold; color: #e94560; font-size: 1.2em;">📍 ${regionName}</div>
                        <div style="font-size: 0.75em; color: #aaa;">${Formatting.capitalizeFirst(biome)}</div>
                    </div>
                </div>

                <!-- Activity Info (Compressed) -->
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 10px; border-left: 3px solid ${activityColor};">
                    <div style="font-size: 0.7em; color: #888; text-transform: uppercase; margin-bottom: 3px;">Current Activity</div>
                    <div style="font-weight: bold; color: ${activityColor}; font-size: 1.1em; margin-bottom: 2px;">${activityIcon} ${activityText}</div>
                    <div style="font-size: 0.75em; color: #aaa;">${activityDetails}</div>
                </div>
            </div>
        `;
    },

    /**
     * Render skills in a compact list for Skills Panel - 2 columns showing all 14 skills
     */
    renderSkillsList() {
        const skills = GameEngine.state.skills;
        const skillDefs = GameEngine.definitions.skills;

        let html = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;

        // All skills in order (14 skills - no combat skill)
        const skillOrder = [
            'navigation',
            'mining', 'logging',
            'fishing', 'hunting',
            'foraging', 'thieving',
            'smithing', 'mechanics',
            'electronics', 'cooking',
            'chemistry', 'textiles',
            'engineering'
        ];

        for (let skillId of skillOrder) {
            if (!skills[skillId]) continue;

            const skill = skills[skillId];
            const def = skillDefs[skillId];
            const icon = this.getSkillIcon(skillId);

            // Calculate XP progress
            const baseExp = def?.baseExp || 100;
            const expCurve = def?.expCurve || 1.5;
            const xpForNext = Math.floor(baseExp * Math.pow(skill.level + 1, expCurve));
            const xpPercent = skill.level >= 100 ? 100 : (skill.exp / xpForNext * 100);

            html += `
            <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="font-size: 1.5em;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="font-size: 0.75em; color: #aaa; text-transform: uppercase;">${def?.name || skillId}</div>
                        <div style="font-weight: bold; color: #4a9eff; font-size: 1em;">Lv ${skill.level}</div>
                    </div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.5); border-radius: 3px; height: 6px; overflow: hidden; margin-bottom: 3px;">
                    <div style="background: linear-gradient(90deg, #533483 0%, #7b3ff2 100%);
                                height: 100%;
                                width: ${xpPercent}%;
                                transition: width 0.3s;">
                    </div>
                </div>
                <div style="font-size: 0.65em; color: #888; text-align: center;">
                    ${Formatting.formatNumber(skill.exp)} / ${Formatting.formatNumber(xpForNext)} XP
                </div>
            </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    /**
     * Render combat attributes for Combat Panel
     */
    renderCombatAttributes() {
        const attributes = GameEngine.state.combatAttributes;
        const stats = GameEngine.getPlayerCombatStats();
        const combatPower = GameEngine.calculateCombatPower();

        return `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <!-- Character Level -->
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 12px; border-left: 3px solid #4a9eff;">
                    <div style="font-size: 0.7em; color: #888; text-transform: uppercase; margin-bottom: 3px;">Character Level</div>
                    <div style="font-weight: bold; color: #4a9eff; font-size: 1.3em;">${GameEngine.state.characterLevel.level}</div>
                </div>

                <!-- Combat Power -->
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 12px; border-left: 3px solid ${combatPower.tierColor};">
                    <div style="font-size: 0.7em; color: #888; text-transform: uppercase; margin-bottom: 3px;">Combat Power</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="font-weight: bold; color: ${combatPower.tierColor}; font-size: 1.3em;">${combatPower.power}</div>
                        <div style="background: ${combatPower.tierColor}22; color: ${combatPower.tierColor}; border: 1px solid ${combatPower.tierColor}; border-radius: 4px; padding: 2px 8px; font-size: 0.7em; font-weight: bold;">${combatPower.tier}</div>
                    </div>
                </div>

                <!-- Current Stats -->
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 12px;">
                    <div style="font-size: 0.75em; color: #888; text-transform: uppercase; margin-bottom: 8px;">Current Stats</div>
                    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85em;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">❤️ Health</span>
                            <span style="font-weight: bold; color: #fff;">${Math.floor(stats.currentHealth)} / ${Math.floor(stats.maxHealth)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">⚔️ Damage</span>
                            <span style="font-weight: bold; color: #fff;">${stats.attackDamage.toFixed(1)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">⚡ Speed</span>
                            <span style="font-weight: bold; color: #fff;">${stats.attackSpeed.toFixed(2)}/s</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">🎯 Accuracy</span>
                            <span style="font-weight: bold; color: #fff;">${stats.accuracy.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                <!-- Attributes -->
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 12px;">
                    <div style="font-size: 0.75em; color: #888; text-transform: uppercase; margin-bottom: 8px;">Attributes</div>
                    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85em;">
                        ${this.renderAttribute('health', '❤️', attributes.health)}
                        ${this.renderAttribute('defense', '🛡️', attributes.defense)}
                        ${this.renderAttribute('strength', '💪', attributes.strength)}
                        ${this.renderAttribute('stealth', '🥷', attributes.stealth)}
                        ${this.renderAttribute('perception', '👁️', attributes.perception)}
                        ${this.renderAttribute('mobility', '⚡', attributes.mobility)}
                        ${this.renderAttribute('intellect', '🧠', attributes.intellect)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render a single attribute (compact)
     */
    renderAttribute(id, icon, value) {
        const attrDef = GameEngine.definitions.combatAttributes[id];
        return `
            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                <span style="color: #aaa;">${icon} ${attrDef.name}</span>
                <span style="font-weight: bold; color: #4a9eff;">${value}</span>
            </div>
        `;
    },

    /**
     * Render equipped items for Equipment Panel with stats summary
     */
    renderEquipment() {
        const stats = GameEngine.getPlayerCombatStats();
        const currentWeight = GameEngine.getTotalEquippedWeight();
        const maxWeight = GameEngine.getMaxEquipmentWeight();

        let html = `
        <!-- Equipment Component (compact mode - no tech slots) -->
        ${EquipmentComponent.render({ mode: 'compact', showLabels: false, interactive: false })}

        <!-- Equipment Stats Summary -->
        <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 10px; border-top: 2px solid #4a9eff; margin-top: 12px;">
            <div style="font-size: 0.75em; color: #4a9eff; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Equipment Summary</div>

            <!-- Weight -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.85em;">
                <span style="color: #aaa;">⚖️ Weight</span>
                <span style="font-weight: bold; color: ${currentWeight >= maxWeight ? '#f44336' : currentWeight >= maxWeight * 0.8 ? '#ff9800' : '#4caf50'};">
                    ${currentWeight} / ${maxWeight}
                </span>
            </div>

            <!-- Bonuses -->
            <div style="font-size: 0.7em; color: #888; margin: 6px 0 4px 0;">Bonuses:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.8em;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">⚔️ Damage</span>
                    <span style="font-weight: bold; color: #fff;">+${stats.attackDamage.toFixed(1)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">🛡️ Defense</span>
                    <span style="font-weight: bold; color: #fff;">${(stats.damageReduction * 100).toFixed(1)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">❤️ Health</span>
                    <span style="font-weight: bold; color: #fff;">${Math.floor(stats.maxHealth)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #aaa;">⚡ Speed</span>
                    <span style="font-weight: bold; color: #fff;">${stats.attackSpeed.toFixed(2)}/s</span>
                </div>
            </div>

            <!-- Armor Type -->
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <div style="font-size: 0.7em; color: #888;">Armor Type</div>
                <div style="font-size: 0.85em; font-weight: bold; color: ${GameEngine.definitions.armorTypes[GameEngine.getPlayerDominantArmorType()]?.color || '#fff'};">
                    ${GameEngine.definitions.armorTypes[GameEngine.getPlayerDominantArmorType()]?.icon || '🛡️'}
                    ${GameEngine.definitions.armorTypes[GameEngine.getPlayerDominantArmorType()]?.name || 'None'}
                </div>
            </div>
        </div>
        `;

        return html;
    },

    /**
     * Get icon for a skill
     * @param {string} skillId - Skill ID
     * @returns {string} - Icon emoji
     */
    getSkillIcon(skillId) {
        const icons = {
            navigation: '🧭',
            combat: '⚔️',
            mining: '⛏️',
            logging: '🪓',
            fishing: '🎣',
            hunting: '🏹',
            foraging: '🌿',
            thieving: '🗡️',
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            cooking: '🍳',
            chemistry: '⚗️',
            textiles: '🧵',
            engineering: '🔬'
        };
        return icons[skillId] || '⭐';
    }
};
