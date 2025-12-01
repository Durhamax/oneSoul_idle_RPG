/**
 * ENGINEERING SYSTEM
 *
 * Manages perfection system, technology assembly, and component salvaging.
 * Engineering is a vertical skill that enhances all crafting skills.
 *
 * Key Features:
 * - Perfection: Combine 10 items of same type for rarity upgrade
 * - Technology Assembly: Create tech items from components
 * - Salvaging: Break down items for materials
 * - NO attribute bonuses - purely skill-based
 */

const EngineeringSystem = {
    // Rarity order for perfection system
    RARITY_ORDER: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'transcendent', 'creator'],

    // Base success rates for perfection
    PERFECTION_BASE_RATES: {
        uncommon: 60,      // common -> uncommon
        rare: 40,          // uncommon -> rare
        epic: 25,          // rare -> epic
        legendary: 15,     // epic -> legendary
        mythic: 10,        // legendary -> mythic
        divine: 5,         // mythic -> divine
        transcendent: 3,   // divine -> transcendent
        creator: 1         // transcendent -> creator
    },

    /**
     * Get item definition from ItemRegistry (standardized access pattern)
     * @param {string} itemId - Item ID to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    _getItemDef(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },

    /**
     * Initialize engineering system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Core engineering functions
        engine.perfectEquipment = this.perfectEquipment.bind(engine);
        engine.assemblyTechnology = this.assemblyTechnology.bind(engine);
        engine.salvageItem = this.salvageItem.bind(engine);

        // Legacy functions (backward compatibility)
        engine.upgradeWorkshop = this.upgradeWorkshop.bind(engine);
        engine.reverseEngineerItem = this.reverseEngineerItem.bind(engine);
        engine.assembleComponents = this.assembleComponents.bind(engine);
        engine.selectEngineeringPath = this.selectEngineeringPath.bind(engine);
        engine.getWorkshopBonus = this.getWorkshopBonus.bind(engine);
        engine.canAffordWorkshopUpgrade = this.canAffordWorkshopUpgrade.bind(engine);
        engine.awardEngineeringTokens = this.awardEngineeringTokens.bind(engine);

        // New helper functions
        engine.getPerfectionSuccessRate = this.getPerfectionSuccessRate.bind(engine);
        engine.canPerfect = this.canPerfect.bind(engine);

        // Initialize engineering state
        this._initializeState(engine);

        console.log('[EngineeringSystem] Initialized with perfection and technology assembly');
    },

    /**
     * Initialize engineering state on the engine
     */
    _initializeState(engine) {
        if (!engine.state.engineering) {
            engine.state.engineering = {
                tokens: 0,
                workshops: {},
                paths: {},
                perfectionAttempts: 0,
                perfectionSuccesses: 0,
                technologiesAssembled: 0,
                itemsSalvaged: 0
            };
        }

        // Ensure all properties exist
        if (engine.state.engineering.perfectionAttempts === undefined) {
            engine.state.engineering.perfectionAttempts = 0;
        }
        if (engine.state.engineering.perfectionSuccesses === undefined) {
            engine.state.engineering.perfectionSuccesses = 0;
        }
        if (engine.state.engineering.technologiesAssembled === undefined) {
            engine.state.engineering.technologiesAssembled = 0;
        }
        if (engine.state.engineering.itemsSalvaged === undefined) {
            engine.state.engineering.itemsSalvaged = 0;
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // PERFECTION SYSTEM (NEW)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Perfection system - combine 10 items for rarity upgrade
     * NO ATTRIBUTE BONUSES - purely skill based
     * @param {array} itemIds - Array of 10 instanced item IDs
     * @returns {object} - {success: boolean, item?: object, returned?: number, reason?: string}
     */
    perfectEquipment(itemIds) {
        if (!Array.isArray(itemIds) || itemIds.length !== 10) {
            return { success: false, reason: 'Need exactly 10 items' };
        }

        // Get all items from bank
        const items = [];
        for (const id of itemIds) {
            // Try instanced bank first
            let item = null;
            if (this.state.bank?.instanced?.[id]) {
                item = this.state.bank.instanced[id];
            } else if (this.getInstancedItem) {
                item = this.getInstancedItem(id);
            }

            if (!item) {
                return { success: false, reason: `Item not found: ${id}` };
            }
            items.push(item);
        }

        // Validate all items are same base type
        const baseItemId = items[0].baseItemId;
        if (!items.every(item => item.baseItemId === baseItemId)) {
            return { success: false, reason: 'All items must be the same type' };
        }

        // Calculate average rarity to determine target
        const rarityOrder = EngineeringSystem.RARITY_ORDER;
        const avgRarityIndex = Math.floor(
            items.reduce((sum, item) => {
                const idx = rarityOrder.indexOf(item.rarity);
                return sum + (idx >= 0 ? idx : 0);
            }, 0) / items.length
        );

        const targetRarityIndex = Math.min(avgRarityIndex + 1, rarityOrder.length - 1);
        const targetRarity = rarityOrder[targetRarityIndex];

        // Calculate success chance (only 0.1% bonus per engineering level - reduced from design)
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        const baseChance = EngineeringSystem.PERFECTION_BASE_RATES[targetRarity] || 10;
        const successChance = baseChance + (engineeringLevel * 0.1);

        // Increment attempt counter
        this.state.engineering.perfectionAttempts++;

        // Remove input items from bank
        for (const id of itemIds) {
            if (this.removeInstancedItemFromBank) {
                this.removeInstancedItemFromBank(id);
            } else if (this.state.bank?.instanced?.[id]) {
                delete this.state.bank.instanced[id];
            }
        }

        // Roll for success
        if (Math.random() * 100 < successChance) {
            // Success!
            const itemDef = EngineeringSystem._getItemDef.call(this, baseItemId);

            const newItem = {
                baseItemId: baseItemId,
                rarity: targetRarity,
                instanceId: `${baseItemId}_perfect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                stats: items[0].stats || {}, // Inherit stats from first item (could be improved)
                createdAt: Date.now(),
                perfected: true,
                name: `${targetRarity.charAt(0).toUpperCase() + targetRarity.slice(1)} ${itemDef?.name || baseItemId}`
            };

            // Add to bank
            if (this.addInstancedItemToBank) {
                this.addInstancedItemToBank(newItem);
            } else if (this.state.bank?.instanced) {
                this.state.bank.instanced[newItem.instanceId] = newItem;
            }

            this.state.engineering.perfectionSuccesses++;

            // Gain engineering XP
            if (this.gainSkillExp) {
                this.gainSkillExp('engineering', 50 + (targetRarityIndex * 25));
            }

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('perfection-success', { item: newItem, targetRarity });
            }

            console.log(`[EngineeringSystem] Perfection success! Created ${targetRarity} ${itemDef?.name || baseItemId}`);
            return { success: true, item: newItem };

        } else {
            // Failure - return some items based on engineering level
            // Level 1-25: 0 items returned
            // Level 26-50: 1 item returned
            // Level 51-75: 3 items returned
            // Level 76-100: 5 items returned
            let returnCount = 0;
            if (engineeringLevel >= 76) {
                returnCount = 5;
            } else if (engineeringLevel >= 51) {
                returnCount = 3;
            } else if (engineeringLevel >= 26) {
                returnCount = 1;
            }

            // Return items
            for (let i = 0; i < returnCount && i < items.length; i++) {
                if (this.addInstancedItemToBank) {
                    this.addInstancedItemToBank(items[i]);
                } else if (this.state.bank?.instanced) {
                    this.state.bank.instanced[items[i].instanceId] = items[i];
                }
            }

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('perfection-failed', { returned: returnCount });
            }

            console.log(`[EngineeringSystem] Perfection failed. Returned ${returnCount} items.`);
            return { success: false, returned: returnCount };
        }
    },

    /**
     * Get success rate for perfection attempt
     * @param {string} targetRarity - Target rarity tier
     * @returns {number} Success percentage
     */
    getPerfectionSuccessRate(targetRarity) {
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        const baseChance = EngineeringSystem.PERFECTION_BASE_RATES[targetRarity] || 10;
        return baseChance + (engineeringLevel * 0.1);
    },

    /**
     * Check if player can perform perfection
     * @param {array} itemIds - Array of item IDs
     * @returns {object} - {canPerfect: boolean, reason?: string, targetRarity?: string}
     */
    canPerfect(itemIds) {
        if (!Array.isArray(itemIds) || itemIds.length !== 10) {
            return { canPerfect: false, reason: 'Need exactly 10 items' };
        }

        // Check engineering level for target rarity
        const engineeringLevel = this.state.skills?.engineering?.level || 0;

        // Level gates for max target rarity
        let maxTarget = 'epic';
        if (engineeringLevel >= 76) {
            maxTarget = 'creator';
        } else if (engineeringLevel >= 51) {
            maxTarget = 'mythic';
        } else if (engineeringLevel >= 26) {
            maxTarget = 'legendary';
        }

        return { canPerfect: true, maxTarget };
    },

    // ═══════════════════════════════════════════════════════════════
    // TECHNOLOGY ASSEMBLY (NEW)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Technology assembly (for tech slots)
     * @param {array} componentIds - Array of component item IDs
     * @param {string} techRecipeId - Technology recipe ID
     * @returns {object} - {success: boolean, technology?: object, reason?: string}
     */
    assemblyTechnology(componentIds, techRecipeId) {
        // Get technology recipe
        let recipe = null;
        if (typeof TechnologyRegistry !== 'undefined') {
            recipe = TechnologyRegistry.get(techRecipeId);
        }
        if (!recipe && this.definitions?.TECHNOLOGY_RECIPES) {
            recipe = this.definitions.TECHNOLOGY_RECIPES[techRecipeId];
        }

        if (!recipe) {
            return { success: false, reason: 'Technology recipe not found' };
        }

        // Check engineering level requirement
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        const requiredLevel = recipe.engineeringLevel || recipe.requiredLevel || 1;
        if (engineeringLevel < requiredLevel) {
            return { success: false, reason: `Requires Engineering level ${requiredLevel}` };
        }

        // Validate components
        const requiredComponents = recipe.components || [];
        for (const required of requiredComponents) {
            const itemId = required.itemId || required.id;
            const quantity = required.quantity || required.amount || 1;
            const owned = this.getItemCount ? this.getItemCount(itemId) : 0;

            if (owned < quantity) {
                const itemDef = EngineeringSystem._getItemDef.call(this, itemId);
                return { success: false, reason: `Need ${quantity}x ${itemDef?.name || itemId} (have ${owned})` };
            }
        }

        // Consume components
        for (const required of requiredComponents) {
            const itemId = required.itemId || required.id;
            const quantity = required.quantity || required.amount || 1;

            if (this.removeItemFromBank) {
                this.removeItemFromBank(itemId, quantity);
            }
        }

        // Create technology with charges
        const baseCharges = recipe.baseCharges || 500;
        const bonusCharges = Math.floor(baseCharges * engineeringLevel * 0.01);

        const technology = {
            itemId: techRecipeId,
            instanceId: `tech_${techRecipeId}_${Date.now()}`,
            charges: baseCharges + bonusCharges,
            maxCharges: baseCharges + bonusCharges,
            stats: recipe.stats || {},
            createdAt: Date.now()
        };

        // Add to bank (as tech item)
        if (this.addTechnologyToBank) {
            this.addTechnologyToBank(technology);
        } else if (this.addInstancedItemToBank) {
            this.addInstancedItemToBank(technology);
        }

        // Increment counter
        this.state.engineering.technologiesAssembled++;

        // Gain XP
        if (this.gainSkillExp) {
            this.gainSkillExp('engineering', recipe.experienceGain || 100);
        }

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('technology-assembled', { technology });
        }

        console.log(`[EngineeringSystem] Assembled technology: ${recipe.name || techRecipeId}`);
        return { success: true, technology };
    },

    // ═══════════════════════════════════════════════════════════════
    // SALVAGING (NEW)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Salvage an item for materials
     * @param {string} itemId - Instanced item ID to salvage
     * @returns {object} - {success: boolean, materials?: array, reason?: string}
     */
    salvageItem(itemId) {
        // Get item from bank
        let item = null;
        if (this.state.bank?.instanced?.[itemId]) {
            item = this.state.bank.instanced[itemId];
        } else if (this.getInstancedItem) {
            item = this.getInstancedItem(itemId);
        }

        if (!item) {
            return { success: false, reason: 'Item not found' };
        }

        // Get item definition
        const itemDef = EngineeringSystem._getItemDef.call(this, item.baseItemId);
        if (!itemDef) {
            return { success: false, reason: 'Item definition not found' };
        }

        // Calculate materials returned (50% of crafting cost, affected by engineering level)
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        const salvageMultiplier = 0.5 + (engineeringLevel * 0.005); // 50% to 100%

        const materials = [];

        // Get materials from item's recipe if available
        if (itemDef.craftingRecipe && typeof RecipeRegistry !== 'undefined') {
            const recipe = RecipeRegistry.get(itemDef.craftingRecipe);
            if (recipe && recipe.materials) {
                for (const mat of recipe.materials) {
                    const returned = Math.floor((mat.quantity || 1) * salvageMultiplier);
                    if (returned > 0) {
                        materials.push({ itemId: mat.itemId, quantity: returned });
                        if (this.addItemToBank) {
                            this.addItemToBank(mat.itemId, returned);
                        }
                    }
                }
            }
        }

        // Fallback: return generic salvage materials based on rarity
        if (materials.length === 0) {
            const rarityIndex = EngineeringSystem.RARITY_ORDER.indexOf(item.rarity);
            const scrapAmount = Math.max(1, Math.floor((rarityIndex + 1) * salvageMultiplier));
            materials.push({ itemId: 'salvage_scrap', quantity: scrapAmount });

            if (this.addItemToBank) {
                this.addItemToBank('salvage_scrap', scrapAmount);
            }
        }

        // Remove item from bank
        if (this.removeInstancedItemFromBank) {
            this.removeInstancedItemFromBank(itemId);
        } else if (this.state.bank?.instanced?.[itemId]) {
            delete this.state.bank.instanced[itemId];
        }

        // Increment counter
        this.state.engineering.itemsSalvaged++;

        // Gain XP
        if (this.gainSkillExp) {
            this.gainSkillExp('engineering', 10);
        }

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('item-salvaged', { materials });
        }

        console.log(`[EngineeringSystem] Salvaged ${itemDef.name || item.baseItemId}, returned ${materials.length} material types`);
        return { success: true, materials };
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
        const itemDef = EngineeringSystem._getItemDef.call(this, itemId);
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
                const componentDef = EngineeringSystem._getItemDef.call(this, componentId);
                return { success: false, reason: `Need ${required}x ${componentDef.name} (have ${owned})` };
            }
        }

        // Consume components
        for (let componentId in projectDef.components) {
            this.removeItem(componentId, projectDef.components[componentId]);
        }

        // Create product
        this.addItem(projectDef.output, 1);

        console.log(`🔧 Assembled ${EngineeringSystem._getItemDef.call(this, projectDef.output).name}!`);

        // Gain engineering XP
        this.gainSkillExp('engineering', projectDef.expReward || 100);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`Assembled: ${EngineeringSystem._getItemDef.call(this, projectDef.output).name}`, 'success', 3000);
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
