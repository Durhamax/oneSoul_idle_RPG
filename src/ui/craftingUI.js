/**
 * CRAFTING UI
 *
 * Manages the crafting interface for the skill-based crafting system.
 *
 * Features:
 * - Skill tabs for 6 crafting skills
 * - Workstation tier display with upgrade options
 * - Recipe display filtered by skill level
 * - Active craft queues per skill
 * - Auto-crafting controls
 */

const CraftingUI = {
    // Cache last rendered states to prevent unnecessary re-renders
    lastCraftingState: null,
    lastActiveCraftsState: null,

    // Currently selected skill tab
    selectedSkill: 'smithing',

    /**
     * Initialize the crafting UI
     */
    init() {
        console.log('[CraftingUI] Initializing...');
        this.selectedSkill = 'smithing';
    },

    /**
     * Update crafting display
     */
    updateCrafting(forceUpdate = false) {
        // Update active crafts display (progress bars change frequently)
        this.updateActiveCrafts();

        // Only update main display if something changed
        const currentState = {
            skill: this.selectedSkill,
            workstationTier: GameEngine.state.crafting?.workstations?.[this.selectedSkill]?.tier || 1,
            queueLength: this.getQueueLength(this.selectedSkill)
        };

        const stateKey = JSON.stringify(currentState);
        if (forceUpdate || this.lastCraftingState !== stateKey) {
            this.renderCraftingPanel();
            this.lastCraftingState = stateKey;
        }
    },

    /**
     * Get queue length for a skill
     */
    getQueueLength(skill) {
        const queues = GameEngine.state.crafting?.activeQueues;
        if (!queues) return 0;
        return queues[skill]?.length || 0;
    },

    /**
     * Select a crafting skill tab
     */
    selectSkill(skill) {
        this.selectedSkill = skill;
        this.updateCrafting(true);
    },

    /**
     * Render the main crafting panel
     */
    renderCraftingPanel() {
        const container = document.getElementById("craftingDisplay");
        if (!container) return;

        const skills = ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'];
        const skillIcons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            tailoring: '🧵',
            chemistry: '⚗️',
            cooking: '🍳'
        };

        let html = '';

        // Skill tabs
        html += `
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">🔧 Crafting Skills</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        `;

        for (const skill of skills) {
            const skillState = GameEngine.state.skills?.[skill];
            const level = skillState?.level || 1;
            const isSelected = this.selectedSkill === skill;
            const queueCount = this.getQueueLength(skill);

            html += `
                <button onclick="CraftingUI.selectSkill('${skill}')"
                        style="background: ${isSelected ? '#4a9eff' : '#555'};
                               padding: 8px 15px; font-size: 0.9em; cursor: pointer;
                               border: none; border-radius: 4px; color: white;
                               display: flex; align-items: center; gap: 6px;
                               ${isSelected ? 'box-shadow: 0 0 10px rgba(74, 158, 255, 0.5);' : ''}">
                    <span>${skillIcons[skill]}</span>
                    <span>${this.capitalizeFirst(skill)}</span>
                    <span style="font-size: 0.8em; opacity: 0.8;">Lv.${level}</span>
                    ${queueCount > 0 ? `<span style="background: #4caf50; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7em; display: flex; align-items: center; justify-content: center;">${queueCount}</span>` : ''}
                </button>
            `;
        }

        html += '</div></div>';

        // Workstation info for selected skill
        html += this.renderWorkstationInfo();

        // Recipes for selected skill
        html += this.renderRecipes();

        container.innerHTML = html;
    },

    /**
     * Render workstation information and upgrade button
     */
    renderWorkstationInfo() {
        const skill = this.selectedSkill;
        const workstationState = GameEngine.state.crafting?.workstations?.[skill] || { tier: 1 };
        const tier = workstationState.tier;
        const engineeringLevel = GameEngine.state.skills?.engineering?.level || 1;

        // Get workstation definition
        const workstation = typeof WorkstationRegistry !== 'undefined'
            ? WorkstationRegistry.get(skill)
            : null;

        const benefits = typeof WorkstationRegistry !== 'undefined'
            ? WorkstationRegistry.getTierBenefits(skill, tier, engineeringLevel)
            : null;

        // Check if upgrade is available
        const nextTier = tier + 1;
        const canUpgrade = nextTier <= 5 && engineeringLevel >= (nextTier * 10);
        const requiredEngineering = nextTier * 10;

        let html = `
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #555;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <h3 style="margin: 0; color: #4a9eff;">
                            ${workstation?.name || this.capitalizeFirst(skill) + ' Workstation'}
                        </h3>
                        <div style="font-size: 0.9em; color: #888;">Tier ${tier} / 5</div>
                    </div>
                    <div style="text-align: right;">
        `;

        if (tier < 5) {
            if (canUpgrade) {
                html += `
                    <button onclick="CraftingUI.upgradeWorkstation('${skill}')"
                            style="background: #4caf50; color: white; border: none; padding: 8px 15px;
                                   border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                        ⬆️ Upgrade to Tier ${nextTier}
                    </button>
                `;
            } else {
                html += `
                    <div style="color: #ff9800; font-size: 0.85em;">
                        🔒 Engineering Lv.${requiredEngineering} required
                    </div>
                    <div style="color: #666; font-size: 0.75em;">
                        (Current: Lv.${engineeringLevel})
                    </div>
                `;
            }
        } else {
            html += `<div style="color: #4caf50; font-size: 0.9em;">✨ Max Tier</div>`;
        }

        html += `
                    </div>
                </div>
        `;

        // Tier benefits
        if (benefits) {
            html += `
                <div style="display: flex; gap: 20px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid #444;">
            `;

            if (benefits.rarityBonus) {
                html += `
                    <div style="text-align: center;">
                        <div style="color: #9c27b0; font-size: 1.1em; font-weight: bold;">+${benefits.rarityBonus.toFixed(1)}%</div>
                        <div style="color: #888; font-size: 0.75em;">Rarity Chance</div>
                    </div>
                `;
            }

            if (benefits.outputMultiplier && benefits.outputMultiplier > 1) {
                html += `
                    <div style="text-align: center;">
                        <div style="color: #4caf50; font-size: 1.1em; font-weight: bold;">x${benefits.outputMultiplier.toFixed(1)}</div>
                        <div style="color: #888; font-size: 0.75em;">Output Multi</div>
                    </div>
                `;
            }

            html += `
                <div style="text-align: center;">
                    <div style="color: #2196f3; font-size: 1.1em; font-weight: bold;">${(benefits.materialSavingsChance * 100).toFixed(0)}%</div>
                    <div style="color: #888; font-size: 0.75em;">Material Save</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #ff9800; font-size: 1.1em; font-weight: bold;">x${benefits.craftSpeedMultiplier.toFixed(1)}</div>
                    <div style="color: #888; font-size: 0.75em;">Speed Multi</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #00bcd4; font-size: 1.1em; font-weight: bold;">${benefits.queueSlots}</div>
                    <div style="color: #888; font-size: 0.75em;">Queue Slots</div>
                </div>
            `;

            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    /**
     * Render recipes for selected skill
     */
    renderRecipes() {
        const skill = this.selectedSkill;
        const playerSkillLevel = GameEngine.state.skills?.[skill]?.level || 1;

        // Get recipes for this skill
        let recipes = [];
        if (typeof RecipeRegistry !== 'undefined') {
            recipes = RecipeRegistry.getRecipesBySkill(skill);
        }

        if (recipes.length === 0) {
            return `
                <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; text-align: center; color: #888;">
                    No recipes available for ${this.capitalizeFirst(skill)}
                </div>
            `;
        }

        // Sort recipes by skill level
        recipes.sort((a, b) => a.skillLevelRequired - b.skillLevelRequired);

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 15px;">
        `;

        for (const recipe of recipes) {
            const meetsLevel = playerSkillLevel >= recipe.skillLevelRequired;
            const canCraft = this.checkCanCraft(recipe);

            html += this.renderRecipeCard(recipe, meetsLevel, canCraft);
        }

        html += '</div>';
        return html;
    },

    /**
     * Check if player can craft a recipe
     */
    checkCanCraft(recipe) {
        // Check skill level
        const playerLevel = GameEngine.state.skills?.[recipe.skill]?.level || 1;
        if (playerLevel < recipe.skillLevelRequired) {
            return { canCraft: false, reason: `Need ${recipe.skill} Lv.${recipe.skillLevelRequired}` };
        }

        // Check materials
        for (const material of recipe.materials) {
            const hasAmount = GameEngine.getItemCount(material.itemId);
            if (hasAmount < material.quantity) {
                return { canCraft: false, reason: 'Missing materials' };
            }
        }

        // Check queue slots
        const workstation = GameEngine.state.crafting?.workstations?.[recipe.skill] || { tier: 1 };
        const tier = workstation.tier;
        const queueSlots = Math.min(5, 1 + Math.floor(tier / 2));
        const currentQueue = this.getQueueLength(recipe.skill);

        if (currentQueue >= queueSlots) {
            return { canCraft: false, reason: 'Queue full' };
        }

        return { canCraft: true, reason: '' };
    },

    /**
     * Render a single recipe card
     */
    renderRecipeCard(recipe, meetsLevel, canCraftResult) {
        const canCraft = canCraftResult.canCraft;
        const icon = recipe.icon || '📦';

        // Determine output display
        let outputDisplay = '';
        if (recipe.outputs.quantity) {
            outputDisplay = `${recipe.outputs.quantity}x`;
        } else if (recipe.outputs.baseQuantity) {
            outputDisplay = `~${recipe.outputs.baseQuantity}x`;
        } else {
            outputDisplay = '1x';
        }

        // Get output item name
        const outputItem = typeof ItemAccessHelper !== 'undefined'
            ? ItemAccessHelper.getItem(recipe.outputs.itemId)
            : null;
        const outputName = outputItem?.name || recipe.outputs.itemId;

        // Rarity display
        let rarityDisplay = '';
        if (recipe.outputs.rarityWeights) {
            const weights = recipe.outputs.rarityWeights;
            rarityDisplay = `
                <div style="font-size: 0.7em; color: #888; margin-top: 3px;">
                    Rarity: ${Object.keys(weights).map(r => `<span style="color: ${this.getRarityColor(r)};">${r.charAt(0).toUpperCase()}</span>`).join(' ')}
                </div>
            `;
        }

        let html = `
            <div style="background: ${meetsLevel ? '#1a1a1a' : '#1a1a1a'}; padding: 15px; border-radius: 8px;
                        border: 2px solid ${canCraft ? '#4caf50' : meetsLevel ? '#555' : '#333'};
                        ${!meetsLevel ? 'opacity: 0.7;' : ''}">

                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.5em;">${icon}</span>
                        <div>
                            <div style="font-weight: bold; color: ${meetsLevel ? '#4a9eff' : '#888'};">
                                ${recipe.name}
                            </div>
                            <div style="font-size: 0.75em; color: #666;">${recipe.description || ''}</div>
                        </div>
                    </div>
                    <div style="font-size: 0.8em; color: ${meetsLevel ? '#4caf50' : '#ff9800'}; white-space: nowrap;">
                        Lv.${recipe.skillLevelRequired}
                    </div>
                </div>

                <div style="display: flex; gap: 20px; margin-bottom: 10px; font-size: 0.85em;">
                    <div style="flex: 1;">
                        <div style="color: #aaa; margin-bottom: 5px;">Materials:</div>
                        ${recipe.materials.map(mat => {
                            const item = typeof ItemAccessHelper !== 'undefined'
                                ? ItemAccessHelper.getItem(mat.itemId)
                                : null;
                            const hasAmount = GameEngine.getItemCount(mat.itemId);
                            const hasEnough = hasAmount >= mat.quantity;
                            return `
                                <div style="color: ${hasEnough ? '#4caf50' : '#f44336'}; font-size: 0.9em;">
                                    ${mat.quantity}x ${item?.name || mat.itemId}
                                    ${hasEnough ? '✓' : `(${hasAmount})`}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div>
                        <div style="color: #aaa; margin-bottom: 5px;">Output:</div>
                        <div style="color: #4a9eff;">${outputDisplay} ${outputName}</div>
                        ${rarityDisplay}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #333;">
                    <div style="font-size: 0.85em;">
                        <span style="color: #888;">Time:</span>
                        <span style="color: #9c27b0;">${Math.ceil(recipe.baseTime / 1000)}s</span>
                        <span style="color: #888; margin-left: 10px;">XP:</span>
                        <span style="color: #ffc107;">${recipe.experienceGain}</span>
                    </div>

                    <div style="display: flex; gap: 5px;">
                        <button onclick="CraftingUI.startCraft('${recipe.id}')"
                                ${!canCraft ? 'disabled' : ''}
                                style="padding: 6px 12px; font-size: 0.85em; cursor: ${canCraft ? 'pointer' : 'not-allowed'};
                                       border: none; border-radius: 4px;
                                       background: ${canCraft ? '#4caf50' : '#555'}; color: white;">
                            ${canCraft ? '🔨 Craft' : canCraftResult.reason}
                        </button>
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Update active crafts display
     */
    updateActiveCrafts() {
        const container = document.getElementById("activeCraftsDisplay");
        if (!container) return;

        // Get all active queues
        const queues = GameEngine.state.crafting?.activeQueues || {};
        let totalActive = 0;

        for (const skill in queues) {
            totalActive += queues[skill]?.length || 0;
        }

        // Also check legacy activeCrafts for backward compatibility
        const legacyCrafts = GameEngine.state.crafting?.activeCrafts || [];
        totalActive += legacyCrafts.length;

        if (totalActive === 0) {
            container.innerHTML = '<div style="color: #888; font-size: 0.85em; padding: 8px; text-align: center;">No active crafts</div>';
            return;
        }

        let html = '';

        // Render queued crafts by skill
        for (const skill in queues) {
            const queue = queues[skill];
            if (!queue || queue.length === 0) continue;

            html += `<div style="margin-bottom: 10px;">
                <div style="font-size: 0.8em; color: #888; margin-bottom: 5px;">${this.capitalizeFirst(skill)}:</div>
            `;

            for (let i = 0; i < queue.length; i++) {
                const craft = queue[i];
                html += this.renderActiveCraft(craft, skill, i);
            }

            html += '</div>';
        }

        // Render legacy crafts
        for (let i = 0; i < legacyCrafts.length; i++) {
            const craft = legacyCrafts[i];
            html += this.renderActiveCraft(craft, null, i);
        }

        container.innerHTML = html;
    },

    /**
     * Render a single active craft
     */
    renderActiveCraft(craft, skill, index) {
        const recipe = typeof RecipeRegistry !== 'undefined' && skill
            ? RecipeRegistry.get(skill, craft.recipeId)
            : GameEngine.definitions?.recipes?.[craft.recipeId];

        if (!recipe) return '';

        const now = Date.now();
        const elapsed = now - craft.startTime;
        const totalTime = craft.completionTime - craft.startTime;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        const remaining = Math.max(0, Math.ceil((craft.completionTime - now) / 1000));

        return `
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 5px;
                        border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-weight: bold; color: #00d9ff; font-size: 0.9em;">
                        ${recipe.icon || '📦'} ${recipe.name}
                    </span>
                    <div style="font-size: 0.75em; color: #4caf50;">${remaining}s</div>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #9C27B0, #E91E63);
                                transition: width 0.3s ease-out;"></div>
                </div>
            </div>
        `;
    },

    /**
     * Start crafting a recipe
     */
    startCraft(recipeId) {
        if (typeof CraftingSystem !== 'undefined' && CraftingSystem.startCraft) {
            const result = CraftingSystem.startCraft(recipeId);
            if (result.success) {
                this.updateCrafting(true);
            } else {
                console.warn('[CraftingUI] Failed to start craft:', result.reason);
            }
        } else if (typeof GameEngine !== 'undefined' && GameEngine.startCraft) {
            // Fallback to GameEngine method
            GameEngine.startCraft(recipeId);
            this.updateCrafting(true);
        }
    },

    /**
     * Upgrade workstation
     */
    upgradeWorkstation(skill) {
        if (typeof CraftingSystem !== 'undefined' && CraftingSystem.upgradeWorkstation) {
            const result = CraftingSystem.upgradeWorkstation(skill);
            if (result.success) {
                this.updateCrafting(true);
            } else {
                console.warn('[CraftingUI] Failed to upgrade workstation:', result.reason);
            }
        }
    },

    /**
     * Get color for rarity
     */
    getRarityColor(rarity) {
        const colors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800',
            mythic: '#f44336',
            divine: '#e91e63',
            transcendent: '#00bcd4',
            creator: '#ffd700'
        };
        return colors[rarity] || '#9e9e9e';
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Get skill icon
     */
    getSkillIcon(skillId) {
        const icons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            cooking: '🍳',
            chemistry: '⚗️',
            tailoring: '🧵',
            engineering: '🔬'
        };
        return icons[skillId] || '🔨';
    },

    // =========================================================================
    // LEGACY COMPATIBILITY METHODS
    // These methods maintain backward compatibility with old code
    // =========================================================================

    /**
     * Legacy: Sync crafting stations from regions
     */
    syncCraftingStations() {
        // This is now handled differently - workstations are global
        console.log('[CraftingUI] syncCraftingStations called (legacy)');
    },

    /**
     * Legacy: Update crafting stations display
     */
    updateCraftingStations() {
        this.renderCraftingPanel();
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.CraftingUI = CraftingUI;
}
