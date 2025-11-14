/**
 * ENGINEERING SYSTEM
 *
 * Manages workshop upgrades, reverse engineering, component assembly, and specialization paths.
 * Engineering is a vertical skill that enhances all crafting skills.
 */

const EngineeringSystem = {
    /**
     * Initialize engineering system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        engine.upgradeWorkshop = this.upgradeWorkshop.bind(engine);
        engine.reverseEngineerItem = this.reverseEngineerItem.bind(engine);
        engine.assembleComponents = this.assembleComponents.bind(engine);
        engine.selectEngineeringPath = this.selectEngineeringPath.bind(engine);
        engine.getWorkshopBonus = this.getWorkshopBonus.bind(engine);
        engine.canAffordWorkshopUpgrade = this.canAffordWorkshopUpgrade.bind(engine);
        engine.awardEngineeringTokens = this.awardEngineeringTokens.bind(engine);
    },

    /**
     * Upgrade a workshop to the next tier
     * @param {string} skillName - The crafting skill (cooking, chemistry, etc.)
     * @returns {object} Result object with success status and message
     */
    upgradeWorkshop(skillName) {
        const workshopDef = this.definitions.WORKSHOP_UPGRADES[skillName];
        if (!workshopDef) {
            return { success: false, reason: "Invalid skill for workshop upgrade" };
        }

        const currentTier = this.state.engineering.workshops[skillName] || 0;
        const nextTier = currentTier + 1;

        // Check if max tier reached
        if (nextTier > workshopDef.tiers.length) {
            return { success: false, reason: "Workshop already at maximum tier" };
        }

        const tierDef = workshopDef.tiers[nextTier - 1]; // 0-indexed

        // Check costs
        const tokenCost = tierDef.cost.engineeringTokens;
        const goldCost = tierDef.cost.gold;

        if (this.state.engineering.tokens < tokenCost) {
            return { success: false, reason: `Need ${tokenCost} Engineering Tokens (have ${this.state.engineering.tokens})` };
        }

        if (this.state.gold < goldCost) {
            return { success: false, reason: `Need ${Formatting.formatNumber(goldCost)} gold (have ${Formatting.formatNumber(this.state.gold)})` };
        }

        // Deduct costs
        this.state.engineering.tokens -= tokenCost;
        this.state.gold -= goldCost;

        // Apply upgrade
        this.state.engineering.workshops[skillName] = nextTier;

        console.log(`⚙️ Upgraded ${workshopDef.name} to Tier ${nextTier}: ${tierDef.name}`);
        console.log(`📊 Bonuses: ${tierDef.bonuses.rarityChance}x rarity, ${tierDef.bonuses.craftSpeed}x speed, ${tierDef.bonuses.parallelSlots} slots, max ${tierDef.bonuses.maxRarity}`);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`${workshopDef.name} upgraded to ${tierDef.name}!`, 'success', 3000);
        }

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.update) {
            UICore.update();
        }

        return { success: true, tier: nextTier, tierName: tierDef.name };
    },

    /**
     * Check if player can afford workshop upgrade
     * @param {string} skillName - The crafting skill
     * @returns {boolean}
     */
    canAffordWorkshopUpgrade(skillName) {
        const workshopDef = this.definitions.WORKSHOP_UPGRADES[skillName];
        if (!workshopDef) return false;

        const currentTier = this.state.engineering.workshops[skillName] || 0;
        const nextTier = currentTier + 1;

        if (nextTier > workshopDef.tiers.length) return false;

        const tierDef = workshopDef.tiers[nextTier - 1];
        const hasTokens = this.state.engineering.tokens >= tierDef.cost.engineeringTokens;
        const hasGold = this.state.gold >= tierDef.cost.gold;

        return hasTokens && hasGold;
    },

    /**
     * Get current workshop bonuses for a skill
     * @param {string} skillName - The crafting skill
     * @returns {object} Bonus multipliers and caps
     */
    getWorkshopBonus(skillName) {
        const workshopDef = this.definitions.WORKSHOP_UPGRADES[skillName];
        if (!workshopDef) {
            return { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "common" };
        }

        const currentTier = this.state.engineering.workshops[skillName] || 0;

        // No workshop = tier 0 defaults
        if (currentTier === 0) {
            return { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "common" };
        }

        const tierDef = workshopDef.tiers[currentTier - 1];
        return tierDef.bonuses;
    },

    /**
     * Reverse engineer an item to unlock its recipe
     * @param {string} itemId - The item to reverse engineer
     * @returns {object} Result object
     */
    reverseEngineerItem(itemId) {
        const itemDef = this.definitions.items[itemId];
        if (!itemDef) {
            return { success: false, reason: "Invalid item" };
        }

        // Check if item is reverse-engineerable
        if (!itemDef.reverseEngineerable) {
            return { success: false, reason: "This item cannot be reverse engineered" };
        }

        // Check if player has the item
        const itemCount = this.getItemCount(itemId);
        if (itemCount < 1) {
            return { success: false, reason: "You don't have this item" };
        }

        // Check if recipe already unlocked
        const recipeId = itemDef.recipeId || itemId;
        if (this.state.unlockedRecipes[recipeId]) {
            return { success: false, reason: "Recipe already unlocked" };
        }

        // Cost: tokens + item consumed
        const tokenCost = itemDef.reverseEngineerCost || 5;
        if (this.state.engineering.tokens < tokenCost) {
            return { success: false, reason: `Need ${tokenCost} Engineering Tokens (have ${this.state.engineering.tokens})` };
        }

        // Deduct costs
        this.state.engineering.tokens -= tokenCost;
        this.removeItem(itemId, 1);

        // Unlock recipe
        this.state.unlockedRecipes[recipeId] = true;

        console.log(`🔬 Reverse engineered ${itemDef.name}!`);

        // Gain engineering XP
        this.gainSkillExp('engineering', 50);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`Recipe unlocked: ${itemDef.name}`, 'success', 3000);
        }

        return { success: true, recipeId };
    },

    /**
     * Assemble components into a finished product
     * @param {string} projectId - The assembly project ID
     * @returns {object} Result object
     */
    assembleComponents(projectId) {
        const projectDef = this.definitions.ASSEMBLY_PROJECTS?.[projectId];
        if (!projectDef) {
            return { success: false, reason: "Invalid assembly project" };
        }

        // Check engineering level requirement
        if (this.state.skills.engineering.level < projectDef.engineeringLevel) {
            return { success: false, reason: `Requires Engineering level ${projectDef.engineeringLevel}` };
        }

        // Check component requirements
        for (let componentId in projectDef.components) {
            const required = projectDef.components[componentId];
            const owned = this.getItemCount(componentId);
            if (owned < required) {
                const componentDef = this.definitions.items[componentId];
                return { success: false, reason: `Need ${required}x ${componentDef.name} (have ${owned})` };
            }
        }

        // Consume components
        for (let componentId in projectDef.components) {
            this.removeItem(componentId, projectDef.components[componentId]);
        }

        // Create product
        this.addItem(projectDef.output, 1);

        console.log(`🔧 Assembled ${this.definitions.items[projectDef.output].name}!`);

        // Gain engineering XP
        this.gainSkillExp('engineering', projectDef.expReward || 100);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`Assembled: ${this.definitions.items[projectDef.output].name}`, 'success', 3000);
        }

        return { success: true, output: projectDef.output };
    },

    /**
     * Select an engineering specialization path for a skill
     * @param {string} skillName - The crafting skill
     * @param {string} pathId - The path ID to select
     * @returns {object} Result object
     */
    selectEngineeringPath(skillName, pathId) {
        const pathsDef = this.definitions.ENGINEERING_PATHS?.[skillName];
        if (!pathsDef) {
            return { success: false, reason: "Invalid skill" };
        }

        // Find the path definition
        const pathDef = pathsDef.find(p => p.id === pathId);
        if (!pathDef) {
            return { success: false, reason: "Invalid path" };
        }

        // Check if player already selected a path for this skill
        if (this.state.engineering.paths[skillName]) {
            return { success: false, reason: "Path already selected for this skill" };
        }

        // Check token cost
        const tokenCost = pathDef.cost.engineeringTokens;
        if (this.state.engineering.tokens < tokenCost) {
            return { success: false, reason: `Need ${tokenCost} Engineering Tokens (have ${this.state.engineering.tokens})` };
        }

        // Check engineering level requirement (optional)
        const requiredLevel = pathDef.requiredLevel || 10;
        if (this.state.skills.engineering.level < requiredLevel) {
            return { success: false, reason: `Requires Engineering level ${requiredLevel}` };
        }

        // Deduct cost
        this.state.engineering.tokens -= tokenCost;

        // Select path
        this.state.engineering.paths[skillName] = pathId;

        console.log(`⚡ Selected ${pathDef.name} specialization for ${skillName}!`);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`Path unlocked: ${pathDef.name}`, 'success', 3000);
        }

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.update) {
            UICore.update();
        }

        return { success: true, pathName: pathDef.name };
    },

    /**
     * Award engineering tokens (called by missions, rare drops, etc.)
     * @param {number} amount - Number of tokens to award
     */
    awardEngineeringTokens(amount) {
        this.state.engineering.tokens += amount;
        console.log(`💎 Received ${amount} Engineering Token${amount !== 1 ? 's' : ''}!`);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`+${amount} Engineering Token${amount !== 1 ? 's' : ''}`, 'success', 2500);
        }

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.update) {
            UICore.update();
        }
    }
};
