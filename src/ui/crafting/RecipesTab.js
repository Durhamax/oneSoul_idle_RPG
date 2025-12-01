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
    },

    /**
     * Render the recipes tab content
     */
    render(selectedSkill) {
        const skills = ['smithing', 'mechanics', 'electronics', 'textiles', 'chemistry', 'cooking'];

        return `
            <div class="recipes-tab">
                ${this.renderSkillSelector(skills, selectedSkill)}
                ${this.renderSkillHeader(selectedSkill)}
                ${this.renderRecipeGrid(selectedSkill)}
            </div>
        `;
    },

    /**
     * Render skill selector pills
     */
    renderSkillSelector(skills, selectedSkill) {
        const skillIcons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            textiles: '🧵',
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

        // Quick craft buttons
        const maxCraftable = this.getMaxCraftable(recipe);
        let quickCraftHtml = '';
        if (canCraft.canCraft) {
            quickCraftHtml = `
                <div class="quick-craft-buttons">
                    <button class="quick-craft-btn" onclick="RecipesTab.startCraft('${recipe.id}', 1)">×1</button>
                    ${maxCraftable >= 5 ? `<button class="quick-craft-btn" onclick="RecipesTab.startCraft('${recipe.id}', 5)">×5</button>` : ''}
                    ${maxCraftable >= 10 ? `<button class="quick-craft-btn" onclick="RecipesTab.startCraft('${recipe.id}', 10)">×10</button>` : ''}
                    ${maxCraftable > 1 ? `<button class="quick-craft-btn max" onclick="RecipesTab.startCraft('${recipe.id}', ${maxCraftable})">MAX (${maxCraftable})</button>` : ''}
                </div>
            `;
        }

        return `
            <div class="recipe-card ${meetsLevel ? '' : 'locked'} ${canCraft.canCraft ? 'craftable' : ''}"
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

                    ${meetsLevel ? (canCraft.canCraft ? quickCraftHtml : `
                        <div class="craft-blocked">
                            <span class="blocked-reason">${canCraft.reason}</span>
                        </div>
                    `) : `
                        <div class="craft-locked">
                            <span class="locked-text">Requires ${UnifiedCraftingUI.capitalizeFirst(recipe.skill)} Lv.${recipe.skillLevelRequired}</span>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    /**
     * Start crafting a recipe
     */
    startCraft(recipeId, quantity = 1) {
        console.log(`[RecipesTab] Starting craft: ${recipeId} x${quantity}`);

        for (let i = 0; i < quantity; i++) {
            let result;

            if (typeof CraftingSystem !== 'undefined' && CraftingSystem.startCraft) {
                result = CraftingSystem.startCraft(recipeId);
            } else if (typeof GameEngine !== 'undefined' && GameEngine.startCraft) {
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
        const content = document.getElementById('crafting-content');
        if (content) {
            content.innerHTML = this.render(UnifiedCraftingUI.selectedSkill);
        }
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
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.RecipesTab = RecipesTab;
}
