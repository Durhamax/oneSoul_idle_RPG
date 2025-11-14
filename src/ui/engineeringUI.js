/**
 * ENGINEERING UI
 *
 * Displays workshop upgrades, engineering paths, and engineering token management.
 */

const EngineeringUI = {
    // Cache last rendered state
    lastEngineeringState: null,

    /**
     * Update engineering display
     */
    updateEngineering() {
        const container = document.getElementById("engineeringView");
        if (!container) return;

        const engineering = GameEngine.state.engineering;
        const engineeringSkill = GameEngine.state.skills.engineering;

        // Create state snapshot
        const currentState = JSON.stringify({
            engineering: engineering,
            skill: engineeringSkill,
            gold: GameEngine.state.gold
        });

        // Only re-render if state changed
        if (this.lastEngineeringState === currentState) return;

        let html = `<div class="dashboard-grid">`;

        // Engineering Overview Panel
        html += `
            <div class="dashboard-panel" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 193, 7, 0.1)); border: 2px solid rgba(255, 152, 0, 0.3);">
                <div class="panel-header">
                    <div class="panel-title">⚙️ Engineering Overview</div>
                    <div class="panel-subtitle">Level ${engineeringSkill.level} • Enhance all crafting skills</div>
                </div>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255, 152, 0, 0.3);">
                            <div style="font-size: 0.75em; color: #888; text-transform: uppercase;">Engineering Tokens</div>
                            <div style="font-weight: bold; color: #ffc107; font-size: 1.5em;">💎 ${Formatting.formatNumber(engineering.tokens)}</div>
                            <div style="font-size: 0.7em; color: #aaa; margin-top: 4px;">Earned from missions & rare drops</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255, 152, 0, 0.3);">
                            <div style="font-size: 0.75em; color: #888; text-transform: uppercase;">Active Workshops</div>
                            <div style="font-weight: bold; color: #00d9ff; font-size: 1.5em;">${this.getActiveWorkshopCount(engineering)}/6</div>
                            <div style="font-size: 0.7em; color: #aaa; margin-top: 4px;">Upgraded crafting stations</div>
                        </div>
                        <div style="background: rgba(0, 0, 0, 0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255, 152, 0, 0.3);">
                            <div style="font-size: 0.75em; color: #888; text-transform: uppercase;">Specializations</div>
                            <div style="font-weight: bold; color: #9c27b0; font-size: 1.5em;">${Object.keys(engineering.paths).length}/6</div>
                            <div style="font-size: 0.7em; color: #aaa; margin-top: 4px;">Paths unlocked</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Workshop Upgrades Panel
        const craftingSkills = ['cooking', 'chemistry', 'smithing', 'mechanics', 'electronics', 'textiles'];
        const skillIcons = {
            cooking: '🍳',
            chemistry: '⚗️',
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            textiles: '🧵'
        };

        html += `
            <div class="dashboard-panel" style="grid-column: 1 / -1;">
                <div class="panel-header">
                    <div class="panel-title">🏭 Workshop Upgrades</div>
                    <div class="panel-subtitle">Improve rarity chances, craft speed, and parallel slots</div>
                </div>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                        ${craftingSkills.map(skill => this.renderWorkshop(skill, skillIcons[skill])).join('')}
                    </div>
                </div>
            </div>
        `;

        // Engineering Paths Panel
        html += `
            <div class="dashboard-panel" style="grid-column: 1 / -1;">
                <div class="panel-header">
                    <div class="panel-title">🌟 Engineering Specializations</div>
                    <div class="panel-subtitle">Choose one path per skill (permanent choice)</div>
                </div>
                <div class="panel-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 16px;">
                        ${craftingSkills.map(skill => this.renderPaths(skill, skillIcons[skill])).join('')}
                    </div>
                </div>
            </div>
        `;

        html += `</div>`;
        container.innerHTML = html;
        this.lastEngineeringState = currentState;
    },

    /**
     * Render workshop upgrade card
     */
    renderWorkshop(skillName, icon) {
        const workshopDef = GameEngine.definitions.WORKSHOP_UPGRADES?.[skillName];
        if (!workshopDef) return '';

        const currentTier = GameEngine.state.engineering.workshops[skillName] || 0;
        const nextTier = currentTier + 1;
        const maxTier = workshopDef.tiers.length;

        const currentTierData = currentTier > 0 ? workshopDef.tiers[currentTier - 1] : null;
        const nextTierData = nextTier <= maxTier ? workshopDef.tiers[nextTier - 1] : null;

        const canAfford = nextTierData ? GameEngine.canAffordWorkshopUpgrade(skillName) : false;
        const isMaxTier = currentTier >= maxTier;

        return `
            <div style="background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 2.5em;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 1.1em;">${workshopDef.name}</div>
                        <div style="font-size: 0.8em; color: #888;">${currentTierData ? currentTierData.name : 'No Workshop'}</div>
                    </div>
                </div>

                <!-- Current Tier Progress -->
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 0.75em; color: #888;">Tier ${currentTier}/${maxTier}</span>
                    </div>
                    <div style="background: rgba(0, 0, 0, 0.5); border-radius: 4px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #ff9800, #ffc107); height: 100%; width: ${(currentTier / maxTier) * 100}%;"></div>
                    </div>
                </div>

                <!-- Current Bonuses -->
                ${currentTierData ? `
                    <div style="background: rgba(76, 175, 80, 0.1); padding: 8px; border-radius: 4px; margin-bottom: 12px; border: 1px solid rgba(76, 175, 80, 0.3);">
                        <div style="font-size: 0.75em; color: #4caf50; font-weight: bold; margin-bottom: 4px;">CURRENT BONUSES</div>
                        <div style="font-size: 0.7em; color: #aaa;">
                            <div>⭐ ${(currentTierData.bonuses.rarityChance * 100).toFixed(0)}% Rarity Chance</div>
                            <div>⚡ ${(currentTierData.bonuses.craftSpeed * 100).toFixed(0)}% Craft Speed</div>
                            <div>📦 ${currentTierData.bonuses.parallelSlots} Parallel Slot${currentTierData.bonuses.parallelSlots > 1 ? 's' : ''}</div>
                            <div>🎯 Max: ${currentTierData.bonuses.maxRarity.charAt(0).toUpperCase() + currentTierData.bonuses.maxRarity.slice(1)}</div>
                        </div>
                    </div>
                ` : ''}

                <!-- Upgrade Button or Max Tier Message -->
                ${isMaxTier ? `
                    <div style="text-align: center; padding: 12px; background: rgba(76, 175, 80, 0.2); border-radius: 6px; border: 1px solid rgba(76, 175, 80, 0.4);">
                        <div style="font-weight: bold; color: #4caf50;">✅ MAX TIER</div>
                    </div>
                ` : `
                    <div style="background: rgba(0, 0, 0, 0.4); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                        <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">UPGRADE TO TIER ${nextTier}</div>
                        <div style="font-weight: bold; font-size: 0.9em; margin-bottom: 8px;">${nextTierData.name}</div>
                        <div style="font-size: 0.7em; color: #aaa; margin-bottom: 8px;">
                            <div>⭐ ${(nextTierData.bonuses.rarityChance * 100).toFixed(0)}% Rarity (+${((nextTierData.bonuses.rarityChance - (currentTierData?.bonuses.rarityChance || 1)) * 100).toFixed(0)}%)</div>
                            <div>⚡ ${(nextTierData.bonuses.craftSpeed * 100).toFixed(0)}% Speed (+${((nextTierData.bonuses.craftSpeed - (currentTierData?.bonuses.craftSpeed || 1)) * 100).toFixed(0)}%)</div>
                            <div>📦 ${nextTierData.bonuses.parallelSlots} Slots (+${nextTierData.bonuses.parallelSlots - (currentTierData?.bonuses.parallelSlots || 1)})</div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                            <div style="flex: 1; font-size: 0.7em;">
                                <span style="color: #888;">Cost:</span>
                                <span style="color: ${GameEngine.state.engineering.tokens >= nextTierData.cost.engineeringTokens ? '#4caf50' : '#f44336'};">
                                    💎 ${nextTierData.cost.engineeringTokens}
                                </span>
                            </div>
                            <div style="flex: 1; font-size: 0.7em;">
                                <span style="color: #888;">Gold:</span>
                                <span style="color: ${GameEngine.state.gold >= nextTierData.cost.gold ? '#4caf50' : '#f44336'};">
                                    💰 ${Formatting.formatNumber(nextTierData.cost.gold)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onclick="upgradeWorkshop('${skillName}')"
                            style="width: 100%; padding: 10px; background: ${canAfford ? 'linear-gradient(135deg, #ff9800, #ffc107)' : 'rgba(100, 100, 100, 0.3)'}; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; transition: all 0.2s;"
                            ${!canAfford ? 'disabled' : ''}
                            onmouseover="${canAfford ? 'this.style.transform=`scale(1.05)`' : ''}"
                            onmouseout="${canAfford ? 'this.style.transform=`scale(1)`' : ''}">
                        ${canAfford ? 'UPGRADE WORKSHOP' : 'INSUFFICIENT RESOURCES'}
                    </button>
                `}
            </div>
        `;
    },

    /**
     * Render engineering paths for a skill
     */
    renderPaths(skillName, icon) {
        const pathsDef = GameEngine.definitions.ENGINEERING_PATHS?.[skillName];
        if (!pathsDef) return '';

        const selectedPath = GameEngine.state.engineering.paths[skillName];
        const hasSelected = !!selectedPath;

        return `
            <div style="background: rgba(0, 0, 0, 0.3); padding: 16px; border-radius: 8px; border: 1px solid ${hasSelected ? 'rgba(156, 39, 176, 0.5)' : 'rgba(255, 255, 255, 0.1)'};">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 2em;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 1.1em; text-transform: capitalize;">${skillName}</div>
                        ${hasSelected ? `<div style="font-size: 0.8em; color: #9c27b0;">✨ Path Selected</div>` : `<div style="font-size: 0.8em; color: #888;">Choose One</div>`}
                    </div>
                </div>

                ${hasSelected ? `
                    <!-- Show selected path -->
                    ${this.renderPathCard(skillName, pathsDef.find(p => p.id === selectedPath), true)}
                ` : `
                    <!-- Show both options -->
                    <div style="display: grid; gap: 12px;">
                        ${pathsDef.map(path => this.renderPathCard(skillName, path, false)).join('')}
                    </div>
                `}
            </div>
        `;
    },

    /**
     * Render a single path card
     */
    renderPathCard(skillName, path, isSelected) {
        const canAfford = GameEngine.state.engineering.tokens >= path.cost.engineeringTokens;
        const reqLevel = path.requiredLevel || 10;
        const hasLevel = GameEngine.state.skills.engineering.level >= reqLevel;

        return `
            <div style="background: ${isSelected ? 'rgba(156, 39, 176, 0.2)' : 'rgba(0, 0, 0, 0.4)'}; padding: 12px; border-radius: 6px; border: 1px solid ${isSelected ? 'rgba(156, 39, 176, 0.5)' : 'rgba(255, 255, 255, 0.1)'};">
                <div style="font-weight: bold; margin-bottom: 4px; color: ${isSelected ? '#9c27b0' : 'white'};">
                    ${isSelected ? '✨ ' : ''}${path.name}
                </div>
                <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${path.description}</div>

                ${!isSelected ? `
                    <div style="display: flex; gap: 8px; margin-bottom: 8px; font-size: 0.7em;">
                        <div style="color: ${hasLevel ? '#4caf50' : '#f44336'};">
                            Requires Eng ${reqLevel}
                        </div>
                        <div style="color: ${canAfford ? '#4caf50' : '#f44336'};">
                            💎 ${path.cost.engineeringTokens}
                        </div>
                    </div>
                    <button onclick="selectEngineeringPath('${skillName}', '${path.id}')"
                            style="width: 100%; padding: 8px; background: ${canAfford && hasLevel ? 'linear-gradient(135deg, #9c27b0, #ba68c8)' : 'rgba(100, 100, 100, 0.3)'}; border: none; border-radius: 4px; color: white; font-weight: bold; font-size: 0.8em; cursor: ${canAfford && hasLevel ? 'pointer' : 'not-allowed'};"
                            ${!canAfford || !hasLevel ? 'disabled' : ''}>
                        ${canAfford && hasLevel ? 'SELECT PATH' : 'LOCKED'}
                    </button>
                ` : `
                    <div style="text-align: center; padding: 8px; background: rgba(76, 175, 80, 0.2); border-radius: 4px; border: 1px solid rgba(76, 175, 80, 0.4);">
                        <span style="color: #4caf50; font-weight: bold; font-size: 0.8em;">ACTIVE</span>
                    </div>
                `}
            </div>
        `;
    },

    /**
     * Get count of active workshops
     */
    getActiveWorkshopCount(engineering) {
        let count = 0;
        for (let skill in engineering.workshops) {
            if (engineering.workshops[skill] > 0) count++;
        }
        return count;
    }
};
