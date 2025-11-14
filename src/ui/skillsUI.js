/**
 * SKILLS UI
 *
 * Handles the display and updates for skills, including skill leveling, experience tracking,
 * and skill grouping (priority, gathering, crafting).
 */

const SkillsUI = {
    // Cache last rendered state to prevent unnecessary re-renders
    lastSkillsState: null,

    /**
     * Update skills display
     */
    updateSkills() {
        const container = document.getElementById("skillsDisplay");
        const skills = GameEngine.state.skills;

        // Create state snapshot (include character level and attributes for proper updates)
        const currentState = JSON.stringify({
            skills: skills,
            charLevel: GameEngine.state.characterLevel,
            attributes: GameEngine.state.combatAttributes
        });

        // Only re-render if state changed
        if (this.lastSkillsState === currentState) return;

        const skillDefs = GameEngine.definitions.skills;
        const charLevel = GameEngine.state.characterLevel;
        const attributes = GameEngine.state.combatAttributes;
        const attributeDefs = GameEngine.definitions.combatAttributes;

        let html = `<div class="dashboard-grid">`;

        // Character Level & Attributes Panel (at top)
        const charExpRequired = GameEngine.getCharacterExpRequired();
        const charExpPercent = (charLevel.exp / charExpRequired) * 100;
        const unassignedPoints = charLevel.unassignedAttributePoints;

        html += `
            <div class="dashboard-panel" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(74, 158, 255, 0.1), rgba(123, 63, 242, 0.1)); border: 2px solid ${unassignedPoints > 0 ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}; ${unassignedPoints > 0 ? 'box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); animation: pulse 2s infinite;' : ''}">
                <div class="panel-header">
                    <div class="panel-title">🌟 Character Level ${charLevel.level}</div>
                    ${unassignedPoints > 0 ? `<div class="panel-subtitle" style="color: #ffd700; font-weight: bold; font-size: 1.1em;">✨ ${unassignedPoints} Unassigned Point${unassignedPoints !== 1 ? 's' : ''} Available!</div>` : `<div class="panel-subtitle">Gain XP from all activities</div>`}
                </div>
                <div class="panel-content">
                    <!-- XP Progress Bar -->
                    <div style="margin-bottom: 20px;">
                        <div style="background: rgba(0, 0, 0, 0.5); border-radius: 8px; height: 24px; overflow: hidden; position: relative;">
                            <div style="background: linear-gradient(90deg, #4a9eff 0%, #7b3ff2 100%); height: 100%; width: ${charExpPercent}%; transition: width 0.3s;"></div>
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.9em; text-shadow: 0 0 4px rgba(0,0,0,0.8);">
                                ${Formatting.formatNumber(charLevel.exp)} / ${Formatting.formatNumber(charExpRequired)} XP
                            </div>
                        </div>
                    </div>

                    <!-- Attributes Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${this.renderAttribute('health', '❤️', attributes, attributeDefs, unassignedPoints)}
                        ${this.renderAttribute('strength', '💪', attributes, attributeDefs, unassignedPoints)}
                        ${this.renderAttribute('mobility', '🏃', attributes, attributeDefs, unassignedPoints)}
                        ${this.renderAttribute('intellect', '🧠', attributes, attributeDefs, unassignedPoints)}
                    </div>
                </div>
            </div>
        `;

        // Define skill order and groups
        const prioritySkills = ['navigation', 'engineering'];
        const gatheringSkills = ['mining', 'logging', 'fishing', 'hunting', 'foraging', 'thieving'];
        const craftingSkills = ['cooking', 'chemistry', 'smithing', 'mechanics', 'electronics', 'textiles'];

        // Helper function to render a skill card
        const renderSkill = (skillId, icon) => {
            const skill = skills[skillId];
            const def = skillDefs[skillId];

            if (!skill || !skill.unlocked) return '';

            const expRequired = GameEngine.getSkillExpRequired(skillId);
            const expPercent = (skill.exp / expRequired) * 100;

            // Make gathering skills, navigation, crafting skills, and engineering clickable
            const isGatheringSkill = gatheringSkills.includes(skillId);
            const isNavigationSkill = skillId === 'navigation';
            const isEngineeringSkill = skillId === 'engineering';
            const isCraftingSkill = craftingSkills.includes(skillId);
            const isClickable = isGatheringSkill || isNavigationSkill || isEngineeringSkill || isCraftingSkill;

            let clickHandler = '';
            let clickHint = '';
            if (isGatheringSkill) {
                clickHandler = `onclick="selectSkillForNodes('${skillId}')" style="cursor: pointer;"`;
                clickHint = '<div style="font-size: 0.7em; color: #00d9ff; margin-top: 4px;">👆 Click to view nodes</div>';
            } else if (isNavigationSkill) {
                clickHandler = `onclick="switchView('navigation')" style="cursor: pointer;"`;
                clickHint = '<div style="font-size: 0.7em; color: #00d9ff; margin-top: 4px;">👆 Click to open navigation</div>';
            } else if (isEngineeringSkill) {
                clickHandler = `onclick="switchView('engineering')" style="cursor: pointer;"`;
                clickHint = '<div style="font-size: 0.7em; color: #00d9ff; margin-top: 4px;">👆 Click to open engineering</div>';
            } else if (isCraftingSkill) {
                clickHandler = `onclick="openCraftingForSkill('${skillId}')" style="cursor: pointer;"`;
                clickHint = '<div style="font-size: 0.7em; color: #00d9ff; margin-top: 4px;">👆 Click to open crafting</div>';
            }

            return `
                <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.2s;" ${clickHandler} onmouseover="this.style.borderColor='rgba(0, 217, 255, 0.4)'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 2em;">${icon}</span>
                        <div style="flex: 1;">
                            <div style="font-size: 0.75em; color: #888; text-transform: uppercase;">${def.name}</div>
                            <div style="font-weight: bold; color: #00d9ff; font-size: 1.2em;">Level ${skill.level}</div>
                        </div>
                    </div>
                    <div style="font-size: 0.8em; color: #b8b8c4; margin-bottom: 8px; line-height: 1.4;">${def.description}</div>
                    ${clickHint}
                    <div style="background: rgba(0, 0, 0, 0.5); border-radius: 4px; height: 8px; overflow: hidden; margin: 8px 0 4px 0;">
                        <div style="background: linear-gradient(90deg, #533483 0%, #7b3ff2 100%); height: 100%; width: ${expPercent}%; transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 0.7em; color: #888; text-align: center;">
                        ${Formatting.formatNumber(skill.exp)} / ${Formatting.formatNumber(expRequired)} XP
                    </div>
                </div>
            `;
        };

        // Render Priority Skills Panel
        const priorityContent = prioritySkills.map(skillId => renderSkill(skillId, skillId === 'navigation' ? '🗺️' : '⚙️')).join('');
        html += `
            <div class="dashboard-panel panel-priority">
                <div class="panel-header">
                    <div class="panel-title">⭐ Priority Skills</div>
                    <div class="panel-subtitle">Essential for progression</div>
                </div>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                        ${priorityContent}
                    </div>
                </div>
            </div>
        `;

        // Render Gathering Skills Panel
        const gatheringContent = gatheringSkills.map(skillId => {
            const icons = { mining: '⛏️', logging: '🪓', fishing: '🎣', hunting: '🏹', foraging: '🌿', thieving: '🎭' };
            return renderSkill(skillId, icons[skillId] || '📦');
        }).join('');
        html += `
            <div class="dashboard-panel panel-gathering">
                <div class="panel-header">
                    <div class="panel-title">🌿 Gathering Skills</div>
                    <div class="panel-subtitle">Harvest resources from the world</div>
                </div>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                        ${gatheringContent}
                    </div>
                </div>
            </div>
        `;

        // Render Crafting Skills Panel
        const craftingContent = craftingSkills.map(skillId => {
            const icons = {
                cooking: '🍳',
                chemistry: '⚗️',
                smithing: '🔨',
                mechanics: '⚙️',
                electronics: '⚡',
                textiles: '🧵'
            };
            return renderSkill(skillId, icons[skillId] || '🔧');
        }).join('');
        html += `
            <div class="dashboard-panel panel-crafting">
                <div class="panel-header">
                    <div class="panel-title">🔧 Crafting Skills</div>
                    <div class="panel-subtitle">Create items and equipment</div>
                </div>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                        ${craftingContent}
                    </div>
                </div>
            </div>
        `;

        html += `</div>`;
        container.innerHTML = html;
        this.lastSkillsState = currentState;
    },

    /**
     * Render a single attribute with + button
     */
    renderAttribute(attrId, icon, attributes, attributeDefs, unassignedPoints) {
        const value = attributes[attrId];
        const def = attributeDefs[attrId];
        const hasPoints = unassignedPoints > 0;

        return `
            <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.5em;">${icon}</span>
                        <div>
                            <div style="font-size: 0.75em; color: #888; text-transform: uppercase;">${def.name}</div>
                            <div style="font-weight: bold; color: #00d9ff; font-size: 1.3em;">${value}</div>
                        </div>
                    </div>
                    ${hasPoints ? `
                        <button onclick="assignPoint('${attrId}')"
                                style="padding: 8px 16px; background: linear-gradient(135deg, #27ae60, #229954); border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; font-size: 1.2em; transition: all 0.2s; box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 12px rgba(39, 174, 96, 0.5)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(39, 174, 96, 0.3)';">
                            +
                        </button>
                    ` : ''}
                </div>
                <div style="font-size: 0.75em; color: #aaa; line-height: 1.4;">${def.description}</div>
                ${this.renderAttributeBonuses(attrId, value)}
            </div>
        `;
    },

    /**
     * Render attribute bonuses display
     */
    renderAttributeBonuses(attrId, value) {
        let bonuses = [];

        switch (attrId) {
            case 'health':
                bonuses.push(`+${value * 10} Max HP`);
                bonuses.push(`+${(value * 2).toFixed(1)}% HP Regen`);
                break;
            case 'strength':
                bonuses.push(`+${(value * 5).toFixed(1)}% Damage`);
                bonuses.push(`+${value * 5} Max Endurance`);
                break;
            case 'mobility':
                bonuses.push(`+${(value * 3).toFixed(1)}% Attack Speed`);
                bonuses.push(`+${value * 3} Max Endurance`);
                break;
            case 'intellect':
                bonuses.push(`+${(value * 2).toFixed(1)}% Discovery`);
                bonuses.push(`+${(value * 4).toFixed(1)}% Crit Chance`);
                break;
        }

        if (bonuses.length === 0) return '';

        return `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                ${bonuses.map(bonus => `<div style="font-size: 0.7em; color: #4caf50;">• ${bonus}</div>`).join('')}
            </div>
        `;
    }
};
