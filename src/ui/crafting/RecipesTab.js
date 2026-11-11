/**
 * RECIPES TAB
 *
 * Primary crafting interface showing:
 * - Skill selector pills at top
 * - Recipe grid for selected skill
 * - Material availability indicators
 * - Quick craft buttons (x1, x5, x10, MAX)
 */

const RecipesTab = {
    /**
     * Initialize recipes tab
     */
    init() {
        console.log('[RecipesTab] Initialized');

        // Use event delegation for craft buttons (more reliable than inline onclick)
        document.addEventListener('click', (e) => {
            // Handle quick craft buttons
            const btn = e.target.closest('.quick-craft-btn');
            if (btn) {
                const recipeId = btn.dataset.recipeId;
                const quantity = parseInt(btn.dataset.quantity, 10) || 1;
                if (recipeId) {
                    console.log(`🔨 [RecipesTab] Button clicked via delegation: ${recipeId} x${quantity}`);
                    this.startCraft(recipeId, quantity);
                }
            }

            // Handle stop craft button
            const stopBtn = e.target.closest('.stop-craft-btn');
            if (stopBtn) {
                const skill = stopBtn.dataset.skill;
                if (skill) {
                    console.log(`🛑 [RecipesTab] Stop craft clicked for skill: ${skill}`);
                    this.stopCraftingForSkill(skill);
                }
            }
        });
    },

    /**
     * Render the recipes tab content
     */
    render(selectedSkill) {
        const skills = ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'];

        return `
            <div class="recipes-tab">
                ${this.renderSkillSelector(skills, selectedSkill)}
                ${this.renderActiveCrafting()}
                ${this.renderSkillHeader(selectedSkill)}
                ${this.renderRecipeGrid(selectedSkill)}
            </div>
        `;
    },

    /**
     * Render active crafting section with interval bar (similar to GatherUI)
     */
    renderActiveCrafting() {
        // Find the first active craft across all skills
        const queues = GameEngine.state.crafting?.activeQueues || {};
        let activeCraft = null;
        let activeSkill = null;

        const skills = ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'];
        for (const skill of skills) {
            if (queues[skill] && queues[skill].length > 0) {
                activeCraft = queues[skill][0];
                activeSkill = skill;
                break;
            }
        }

        if (!activeCraft) {
            return `
                <div class="craft-active-empty">
                    <div class="empty-icon">🔨</div>
                    <div class="empty-text">No Active Crafting</div>
                    <div class="empty-hint">Select a recipe below to start crafting</div>
                </div>
            `;
        }

        // Get recipe info
        const recipe = typeof RecipeRegistry !== 'undefined' ? RecipeRegistry.get(activeCraft.recipeId) : null;
        if (!recipe) {
            return `<div class="craft-active-error">Error: Invalid crafting session</div>`;
        }

        const skillIcon = this.getSkillIcon(activeSkill);
        const skillName = UnifiedCraftingUI.capitalizeFirst(activeSkill);
        const skillColor = UnifiedCraftingUI.getSkillColor(activeSkill);

        // Calculate progress
        const now = Date.now();
        const elapsed = now - activeCraft.startTime;
        const totalTime = activeCraft.completionTime - activeCraft.startTime;
        const progress = Math.min(elapsed, totalTime);

        // Get skill level
        const skill = GameEngine.state.skills[activeSkill];

        return `
            <div class="craft-active-panel" data-activity="crafting" data-skill="${activeSkill}">
                <div class="craft-active-header">
                    <div class="craft-active-info">
                        <span class="craft-recipe-icon">${recipe.icon || skillIcon}</span>
                        <div class="craft-active-details">
                            <div class="craft-recipe-name">${recipe.name}</div>
                            <div class="craft-recipe-meta">
                                ${skillIcon} ${skillName} • Level ${skill?.level || 1}
                            </div>
                        </div>
                    </div>
                    <button class="btn-stop-craft" onclick="RecipesTab.stopCraftingForSkill('${activeSkill}')">
                        <span>⏹️</span> Stop
                    </button>
                </div>

                <!-- Interval Bar -->
                <div id="craft-interval-bar">
                    ${IntervalBar.render({
                        id: 'craft-progress',
                        label: this.getSkillActionVerb(activeSkill) + 'ing',
                        icon: skillIcon,
                        current: progress,
                        max: totalTime,
                        color: skillColor,
                        gradient: 'linear-gradient(90deg, ' + skillColor + ', ' + skillColor + 'aa)',
                        animated: true,
                        showTime: true,
                        variant: 'default',
                        stats: {
                            'Duration': (totalTime / 1000).toFixed(1) + 's',
                            'XP': '+' + (recipe.experienceGain || 0)
                        }
                    })}
                </div>

                <!-- Session Stats -->
                <div class="craft-session-stats">
                    <div class="stat-box">
                        <div class="stat-box-label">Crafts</div>
                        <div class="stat-box-value">${this.getSessionCraftCount()}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-label">XP Gained</div>
                        <div class="stat-box-value stat-success">${this.getSessionXP()}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-label">Duration</div>
                        <div class="stat-box-value">${this.formatDuration(this.getSessionDuration())}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-box-label">In Queue</div>
                        <div class="stat-box-value">${this.getTotalQueueCount()}</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get skill icon
     */
    getSkillIcon(skill) {
        const icons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            tailoring: '🧵',
            chemistry: '⚗️',
            cooking: '🍳'
        };
        return icons[skill] || '📦';
    },

    /**
     * Get total queue count across all skills
     */
    getTotalQueueCount() {
        const queues = GameEngine.state.crafting?.activeQueues || {};
        let total = 0;
        for (const skill in queues) {
            total += queues[skill]?.length || 0;
        }
        return total;
    },

    /**
     * Get session craft count
     */
    getSessionCraftCount() {
        return GameEngine.state.crafting?.sessionStats?.craftsCompleted || 0;
    },

    /**
     * Get session XP
     */
    getSessionXP() {
        return GameEngine.state.crafting?.sessionStats?.totalXP || 0;
    },

    /**
     * Get session duration
     */
    getSessionDuration() {
        const startTime = GameEngine.state.crafting?.sessionStats?.startTime;
        if (!startTime) return 0;
        return Date.now() - startTime;
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
     * Render skill selector pills
     */
    renderSkillSelector(skills, selectedSkill) {
        const skillIcons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            tailoring: '🧵',
            chemistry: '⚗️',
            cooking: '🍳'
        };

        let html = '<div class="skill-selector">';

        for (const skill of skills) {
            const skillState = GameEngine.state.skills?.[skill];
            const level = skillState?.level || 1;
            const isActive = selectedSkill === skill;
            const queueCount = this.getQueueCount(skill);
            const skillColor = UnifiedCraftingUI.getSkillColor(skill);

            html += `
                <button class="skill-pill ${isActive ? 'active' : ''}"
                        data-skill="${skill}"
                        style="${isActive ? `border-color: ${skillColor}; box-shadow: 0 0 10px ${skillColor}40;` : ''}"
                        onclick="UnifiedCraftingUI.selectSkill('${skill}')">
                    <span class="skill-pill-icon">${skillIcons[skill]}</span>
                    <span class="skill-pill-name">${UnifiedCraftingUI.capitalizeFirst(skill)}</span>
                    <span class="skill-pill-level">Lv.${level}</span>
                    ${queueCount > 0 ? `<span class="skill-pill-badge">${queueCount}</span>` : ''}
                </button>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render skill header with workstation info
     */
    renderSkillHeader(skill) {
        const skillState = GameEngine.state.skills?.[skill];
        const level = skillState?.level || 1;
        const workstationState = GameEngine.state.crafting?.workstations?.[skill] || { tier: 1 };
        const tier = workstationState.tier;
        const skillColor = UnifiedCraftingUI.getSkillColor(skill);

        // Get workstation benefits
        const engineeringLevel = GameEngine.state.skills?.engineering?.level || 1;
        let benefits = null;
        if (typeof WorkstationRegistry !== 'undefined') {
            benefits = WorkstationRegistry.getTierBenefits(skill, tier, engineeringLevel);
        }

        let benefitsHtml = '';
        if (benefits) {
            benefitsHtml = `
                <div class="skill-header-benefits">
                    ${benefits.rarityBonus ? `<span class="benefit-tag rarity">+${benefits.rarityBonus.toFixed(0)}% Rarity</span>` : ''}
                    ${benefits.outputMultiplier > 1 ? `<span class="benefit-tag output">x${benefits.outputMultiplier.toFixed(1)} Output</span>` : ''}
                    <span class="benefit-tag speed">x${benefits.craftSpeedMultiplier.toFixed(1)} Speed</span>
                    <span class="benefit-tag slots">${benefits.queueSlots} Slots</span>
                </div>
            `;
        }

        return `
            <div class="skill-header" style="border-left: 4px solid ${skillColor};">
                <div class="skill-header-info">
                    <div class="skill-header-title">
                        ${UnifiedCraftingUI.getSkillIcon(skill)} ${UnifiedCraftingUI.capitalizeFirst(skill)}
                        <span class="skill-header-level">Level ${level}</span>
                    </div>
                    <div class="skill-header-workstation">
                        Workstation Tier ${tier}/5
                        ${tier < 5 ? `<button class="upgrade-link" onclick="UnifiedCraftingUI.switchTab('workshop')">Upgrade</button>` : ''}
                    </div>
                </div>
                ${benefitsHtml}
            </div>
        `;
    },

    /**
     * Render recipe grid
     */
    renderRecipeGrid(skill) {
        // Get recipes for this skill
        let recipes = [];
        if (typeof RecipeRegistry !== 'undefined' && RecipeRegistry.getRecipesBySkill) {
            const recipesObj = RecipeRegistry.getRecipesBySkill(skill);
            // Convert object to array (RecipeRegistry returns an object, not array)
            recipes = Object.values(recipesObj || {});
        }

        if (!recipes || recipes.length === 0) {
            return `
                <div class="no-recipes">
                    <div class="no-recipes-icon">📭</div>
                    <div class="no-recipes-text">No recipes available for ${UnifiedCraftingUI.capitalizeFirst(skill)}</div>
                    <div class="no-recipes-hint">Level up your ${skill} skill to unlock recipes</div>
                </div>
            `;
        }

        // Sort recipes by skill level
        recipes.sort((a, b) => a.skillLevelRequired - b.skillLevelRequired);

        const playerLevel = GameEngine.state.skills?.[skill]?.level || 1;

        let html = '<div class="recipe-grid">';

        for (const recipe of recipes) {
            html += this.renderRecipeCard(recipe, playerLevel);
        }

        html += '</div>';
        return html;
    },

    /**
     * Render a single recipe card
     */
    renderRecipeCard(recipe, playerLevel) {
        const meetsLevel = playerLevel >= recipe.skillLevelRequired;
        const canCraft = this.checkCanCraft(recipe);
        const icon = recipe.icon || '📦';
        const skillColor = UnifiedCraftingUI.getSkillColor(recipe.skill);

        // Check if this recipe is currently being crafted
        const isActivelyCrafting = this.isRecipeActive(recipe.id, recipe.skill);
        const queueCount = this.getQueueCount(recipe.skill);

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
        let outputName = recipe.outputs.itemId;
        if (typeof ItemAccessHelper !== 'undefined') {
            const item = ItemAccessHelper.getItem(recipe.outputs.itemId);
            if (item) outputName = item.name;
        }

        // Rarity indicator
        let rarityHtml = '';
        if (recipe.outputs.rarityWeights) {
            rarityHtml = '<span class="recipe-has-rarity" title="Variable rarity output">✨</span>';
        }

        // Materials list
        let materialsHtml = '';
        for (const mat of recipe.materials) {
            let itemName = mat.itemId;
            if (typeof ItemAccessHelper !== 'undefined') {
                const item = ItemAccessHelper.getItem(mat.itemId);
                if (item) itemName = item.name;
            }
            const hasAmount = GameEngine.getItemCount(mat.itemId);
            const hasEnough = hasAmount >= mat.quantity;

            materialsHtml += `
                <div class="recipe-material ${hasEnough ? 'has-enough' : 'not-enough'}">
                    <span class="material-qty">${mat.quantity}x</span>
                    <span class="material-name">${itemName}</span>
                    <span class="material-status">${hasEnough ? '✓' : `(${hasAmount})`}</span>
                </div>
            `;
        }

        // Build action buttons based on state
        let actionsHtml = '';
        const maxCraftable = this.getMaxCraftable(recipe);

        if (isActivelyCrafting) {
            // Show stop button when this recipe is being crafted
            actionsHtml = `
                <div class="active-craft-controls">
                    <span class="crafting-indicator">⏳ Crafting...</span>
                    <button class="stop-craft-btn" data-skill="${recipe.skill}" title="Stop crafting">
                        🛑 Stop
                    </button>
                </div>
            `;
        } else if (meetsLevel && canCraft.canCraft) {
            // Single craft button with skill-specific verb
            const actionVerb = this.getSkillActionVerb(recipe.skill);
            actionsHtml = `
                <div class="quick-craft-buttons">
                    <button class="quick-craft-btn" data-recipe-id="${recipe.id}" data-quantity="1">${actionVerb}</button>
                </div>
            `;
        } else if (meetsLevel && canCraft.reason === 'Queue full') {
            // Queue is full but recipe is valid - allow switching
            actionsHtml = `
                <div class="quick-craft-buttons">
                    <button class="quick-craft-btn switch-craft" data-recipe-id="${recipe.id}" data-quantity="1" title="Stop current craft and start this one">
                        🔄 Switch to this
                    </button>
                </div>
            `;
        } else if (meetsLevel) {
            // Can't craft for other reasons (missing materials)
            actionsHtml = `
                <div class="craft-blocked">
                    <span class="blocked-reason">${canCraft.reason}</span>
                </div>
            `;
        } else {
            // Level locked
            actionsHtml = `
                <div class="craft-locked">
                    <span class="locked-text">Requires ${UnifiedCraftingUI.capitalizeFirst(recipe.skill)} Lv.${recipe.skillLevelRequired}</span>
                </div>
            `;
        }

        return `
            <div class="recipe-card ${meetsLevel ? '' : 'locked'} ${canCraft.canCraft ? 'craftable' : ''} ${isActivelyCrafting ? 'active-crafting' : ''}"
                 style="--skill-color: ${skillColor};">
                <div class="recipe-card-header">
                    <div class="recipe-icon">${icon}</div>
                    <div class="recipe-info">
                        <div class="recipe-name">${recipe.name} ${rarityHtml}</div>
                        <div class="recipe-output">${outputDisplay} ${outputName}</div>
                    </div>
                    <div class="recipe-level ${meetsLevel ? 'unlocked' : 'locked'}">
                        ${meetsLevel ? '' : '🔒'} Lv.${recipe.skillLevelRequired}
                    </div>
                </div>

                ${recipe.description ? `<div class="recipe-description">${recipe.description}</div>` : ''}

                <div class="recipe-materials">
                    ${materialsHtml}
                </div>

                <div class="recipe-footer">
                    <div class="recipe-stats">
                        <span class="recipe-time">⏱️ ${Math.ceil(recipe.baseTime / 1000)}s</span>
                        <span class="recipe-xp">⭐ ${recipe.experienceGain} XP</span>
                    </div>

                    ${actionsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Start crafting a recipe
     */
    startCraft(recipeId, quantity = 1) {
        console.log(`🔨 [RecipesTab] startCraft called: ${recipeId} x${quantity}`);

        // Get the recipe to find its skill
        const recipe = typeof RecipeRegistry !== 'undefined' ? RecipeRegistry.get(recipeId) : null;
        if (!recipe) {
            console.warn(`[RecipesTab] Recipe not found: ${recipeId}`);
            return;
        }

        const skill = recipe.skill;

        // Check if queue is full - if so, stop current crafts first (switch behavior)
        const currentQueueCount = this.getQueueCount(skill);
        const workstation = GameEngine.state.crafting?.workstations?.[skill] || { tier: 1 };
        const tier = workstation.tier;
        const queueSlots = Math.min(5, 1 + Math.floor(tier / 2));

        if (currentQueueCount >= queueSlots) {
            console.log(`🔄 [RecipesTab] Queue full, switching to new recipe: ${recipeId}`);
            // Stop current crafts for this skill first
            this.stopCraftingForSkill(skill);
        }

        // Now start the new craft(s)
        for (let i = 0; i < quantity; i++) {
            let result;

            // Use GameEngine.startCraft - CraftingSystem methods are bound to GameEngine
            if (typeof GameEngine !== 'undefined' && GameEngine.startCraft) {
                result = GameEngine.startCraft(recipeId);
            }

            if (result && !result.success) {
                console.warn(`[RecipesTab] Craft failed: ${result.reason}`);
                break;
            }
        }

        // Update queue display
        CraftQueue.update();

        // Re-render recipes to update material availability
        this.refreshRecipes();
    },

    /**
     * Check if player can craft a recipe
     */
    checkCanCraft(recipe) {
        // Check skill level
        const playerLevel = GameEngine.state.skills?.[recipe.skill]?.level || 1;
        if (playerLevel < recipe.skillLevelRequired) {
            return { canCraft: false, reason: `Need Lv.${recipe.skillLevelRequired}` };
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
        const currentQueue = this.getQueueCount(recipe.skill);

        if (currentQueue >= queueSlots) {
            return { canCraft: false, reason: 'Queue full' };
        }

        return { canCraft: true, reason: '' };
    },

    /**
     * Get maximum craftable quantity
     */
    getMaxCraftable(recipe) {
        let maxFromMaterials = Infinity;

        for (const material of recipe.materials) {
            const hasAmount = GameEngine.getItemCount(material.itemId);
            const canMake = Math.floor(hasAmount / material.quantity);
            maxFromMaterials = Math.min(maxFromMaterials, canMake);
        }

        // Limit by queue slots
        const workstation = GameEngine.state.crafting?.workstations?.[recipe.skill] || { tier: 1 };
        const tier = workstation.tier;
        const queueSlots = Math.min(5, 1 + Math.floor(tier / 2));
        const currentQueue = this.getQueueCount(recipe.skill);
        const availableSlots = queueSlots - currentQueue;

        return Math.min(maxFromMaterials, availableSlots, 100); // Cap at 100
    },

    /**
     * Get queue count for a skill
     */
    getQueueCount(skill) {
        const queues = GameEngine.state.crafting?.activeQueues;
        if (!queues) return 0;
        return queues[skill]?.length || 0;
    },

    /**
     * Check if a specific recipe is currently being crafted
     */
    isRecipeActive(recipeId, skill) {
        const queues = GameEngine.state.crafting?.activeQueues;
        if (!queues || !queues[skill]) return false;

        return queues[skill].some(craft => craft.recipeId === recipeId);
    },

    /**
     * Stop all crafting for a specific skill
     */
    stopCraftingForSkill(skill) {
        console.log(`[RecipesTab] Stopping all crafts for skill: ${skill}`);

        // Clear the queue for this skill
        if (GameEngine.state.crafting?.activeQueues?.[skill]) {
            GameEngine.state.crafting.activeQueues[skill] = [];
        }

        // Clear auto-repeat if it was for this skill
        const autoRecipe = GameEngine.state.crafting?.autoRecipe;
        if (autoRecipe) {
            const recipe = typeof RecipeRegistry !== 'undefined' ? RecipeRegistry.get(autoRecipe) : null;
            if (recipe && recipe.skill === skill) {
                GameEngine.state.crafting.autoRecipe = null;
            }
        }

        // Clear current activity if no other crafts
        let hasOtherCrafts = false;
        const queues = GameEngine.state.crafting?.activeQueues || {};
        for (const s in queues) {
            if (queues[s]?.length > 0) {
                hasOtherCrafts = true;
                break;
            }
        }
        if (!hasOtherCrafts && GameEngine.state.currentActivity === 'crafting') {
            GameEngine.state.currentActivity = null;
            // Reset session stats for next session
            if (GameEngine.state.crafting?.sessionStats) {
                GameEngine.state.crafting.sessionStats = {
                    outputs: {},
                    craftsCompleted: 0,
                    totalXP: 0,
                    startTime: null
                };
            }
        }

        // Update UI
        CraftQueue.update();
        this.refreshRecipes();
    },

    /**
     * Refresh recipes display
     */
    refreshRecipes() {
        const content = document.getElementById('crafting-content');
        if (content && UnifiedCraftingUI.currentTab === 'recipes') {
            content.innerHTML = this.render(UnifiedCraftingUI.selectedSkill);
        }
    },

    /**
     * Get skill-specific action verb for craft buttons
     */
    getSkillActionVerb(skill) {
        const verbs = {
            smithing: 'Smelt',
            mechanics: 'Build',
            electronics: 'Assemble',
            tailoring: 'Sew',
            chemistry: 'Mix',
            cooking: 'Cook'
        };
        return verbs[skill] || 'Craft';
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.RecipesTab = RecipesTab;
}
