/**
 * CRAFTING SYSTEM
 *
 * Manages crafting recipes, active crafts, crafting stations, and auto-crafting.
 */

const CraftingSystem = {
    /**
     * Helper: Get recipe definition from RecipeRegistry first, fallback to definitions
     */
    _getRecipeDef(recipeId, engine) {
        let recipeDef = null;
        if (typeof RecipeRegistry !== 'undefined') {
            recipeDef = RecipeRegistry.getAllActive()[recipeId];
        }
        if (!recipeDef && engine.definitions) {
            recipeDef = engine.definitions.recipes?.[recipeId];
        }
        return recipeDef;
    },

    /**
     * Helper: Get item definition from ItemRegistry first, fallback to definitions
     */
    _getItemDef(itemId, engine) {
        let itemDef = null;
        if (typeof ItemRegistry !== 'undefined') {
            itemDef = ItemRegistry.getItem(itemId);
        }
        if (!itemDef && engine.definitions) {
            itemDef = engine.definitions.items?.[itemId];
        }
        return itemDef;
    },

    /**
     * Initialize crafting system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all crafting functions to engine
        engine.canCraft = this.canCraft.bind(engine);
        engine.startCraft = this.startCraft.bind(engine);
        engine.checkCraftCompletion = this.checkCraftCompletion.bind(engine);
        engine.completeCraft = this.completeCraft.bind(engine);
        engine.cancelCraft = this.cancelCraft.bind(engine);
        engine.stopAutoCraft = this.stopAutoCraft.bind(engine);
        engine.discoverCraftingStation = this.discoverCraftingStation.bind(engine);
        engine.getAvailableRecipes = this.getAvailableRecipes.bind(engine);
        engine.rollItemRarity = this.rollItemRarity.bind(engine);
        engine.setCraftingSkillFilter = this.setCraftingSkillFilter.bind(engine);
        engine.rollItemStats = this.rollItemStats.bind(engine);
        engine.createEquipmentInstance = this.createEquipmentInstance.bind(engine);

        console.log('✅ CraftingSystem initialized (ItemRegistry pattern)');
    },

    /**
     * Check if player can craft a recipe
     * @param {string} recipeId - Recipe ID to check
     * @returns {object} - {canCraft: boolean, reason: string}
     */
    canCraft(recipeId) {
        const recipe = CraftingSystem._getRecipeDef(recipeId, this);
        if (!recipe) {
            return { canCraft: false, reason: "Recipe not found" };
        }

        // Check skill level
        const playerSkillLevel = this.state.skills[recipe.skill].level;
        if (playerSkillLevel < recipe.skillLevel) {
            return { canCraft: false, reason: `Requires ${recipe.skill} level ${recipe.skillLevel}` };
        }

        // Check if player has discovered a required crafting station
        const hasStation = recipe.station.some(stationId =>
            this.state.crafting.discoveredStations.includes(stationId)
        );
        if (!hasStation) {
            return { canCraft: false, reason: "Required crafting station not discovered" };
        }

        // Check if player has required materials
        for (let input of recipe.inputs) {
            const itemCount = this.getItemCount(input.itemId);
            if (itemCount < input.amount) {
                const inputItemDef = CraftingSystem._getItemDef(input.itemId, this);
                return { canCraft: false, reason: `Need ${input.amount}x ${inputItemDef?.name || input.itemId}` };
            }
        }

        return { canCraft: true };
    },

    /**
     * Start crafting a recipe (switches to this craft if already crafting another)
     * @param {string} recipeId - Recipe ID to craft
     * @returns {object} - {success: boolean, reason?: string}
     */
    startCraft(recipeId) {
        const canCraftResult = this.canCraft(recipeId);
        if (!canCraftResult.canCraft) {
            return { success: false, reason: canCraftResult.reason };
        }

        const recipe = CraftingSystem._getRecipeDef(recipeId, this);

        // Stop any other activity first (including current craft)
        this.stopAllActivities();

        // Clear any active crafts (switching to new craft)
        this.state.crafting.activeCrafts = [];

        // Set this recipe as the auto-repeat recipe
        this.state.crafting.autoRecipe = recipeId;

        // Consume materials
        for (let input of recipe.inputs) {
            this.removeItemFromBank(input.itemId, input.amount);
        }

        // Find which discovered station to use (use first available)
        const stationId = recipe.station.find(s =>
            this.state.crafting.discoveredStations.includes(s)
        );

        // Add to active crafts
        const craft = {
            recipeId: recipeId,
            stationId: stationId,
            startTime: Date.now(),
            completionTime: Date.now() + recipe.craftingTime,
            totalTime: recipe.craftingTime
        };

        this.state.crafting.activeCrafts.push(craft);

        // Set current activity to crafting
        this.state.currentActivity = 'crafting';

        console.log(`🔨 Started auto-crafting: ${recipe.name}`);
        return { success: true, craft: craft };
    },

    /**
     * Check and complete any finished crafts
     * Called automatically in game tick
     */
    checkCraftCompletion() {
        const now = Date.now();
        const completedIndices = [];

        // Find completed crafts
        this.state.crafting.activeCrafts.forEach((craft, index) => {
            if (now >= craft.completionTime) {
                completedIndices.push(index);
            }
        });

        // Complete crafts (in reverse to avoid index issues)
        for (let i = completedIndices.length - 1; i >= 0; i--) {
            const craftIndex = completedIndices[i];
            this.completeCraft(craftIndex);
        }
    },

    /**
     * Complete a craft and give rewards
     * @param {number} craftIndex - Index in activeCrafts array
     */
    completeCraft(craftIndex) {
        const craft = this.state.crafting.activeCrafts[craftIndex];
        if (!craft) return;

        const recipe = CraftingSystem._getRecipeDef(craft.recipeId, this);

        // Give output items
        for (let output of recipe.outputs) {
            const itemDef = CraftingSystem._getItemDef(output.itemId, this);

            // Check if this is equipment (has equipSlot or category is equipment)
            const isEquipment = itemDef.equipSlot ||
                               (itemDef.category && this.definitions.ITEM_CATEGORIES?.[itemDef.category]?.hasInstances);

            if (isEquipment) {
                // Equipment crafting: roll rarity and stats
                for (let i = 0; i < output.amount; i++) {
                    const rarity = this.rollItemRarity(recipe.skill);
                    const stats = this.rollItemStats(itemDef, rarity);
                    const instance = this.createEquipmentInstance(output.itemId, rarity, stats);

                    // Add instance to bank
                    this.addEquipmentInstance(instance);

                    console.log(`⚔️ Crafted ${rarity} ${itemDef.name}!`);
                    console.log(`   Stats:`, stats);
                }
            } else {
                // Consumable/stackable crafting: add to bank normally
                this.addItemToBank(output.itemId, output.amount);
            }

            // Trigger mission objective check for crafting
            if (this.checkMissionObjectives) {
                this.checkMissionObjectives('item_crafted', {
                    itemId: output.itemId,
                    amount: output.amount
                });
            }
        }

        // Give exp
        this.gainSkillExp(recipe.skill, recipe.expReward);

        console.log(`✅ Completed crafting: ${recipe.name}`);

        // Remove from active crafts
        this.state.crafting.activeCrafts.splice(craftIndex, 1);

        // Auto-repeat: If we have an auto recipe set and this was that recipe, try to craft again
        const autoRecipeId = this.state.crafting.autoRecipe;
        if (autoRecipeId && craft.recipeId === autoRecipeId) {
            const canCraftAgain = this.canCraft(autoRecipeId);
            if (canCraftAgain.canCraft) {
                // Consume materials and start new craft
                for (let input of recipe.inputs) {
                    this.removeItemFromBank(input.itemId, input.amount);
                }

                const stationId = recipe.station.find(s =>
                    this.state.crafting.discoveredStations.includes(s)
                );

                const newCraft = {
                    recipeId: autoRecipeId,
                    stationId: stationId,
                    startTime: Date.now(),
                    completionTime: Date.now() + recipe.craftingTime,
                    totalTime: recipe.craftingTime
                };

                this.state.crafting.activeCrafts.push(newCraft);
                console.log(`🔁 Auto-repeating craft: ${recipe.name}`);
            } else {
                // Can't craft anymore - stop auto crafting
                console.log(`⚠️ Stopped auto-crafting ${recipe.name}: ${canCraftAgain.reason}`);
                this.state.crafting.autoRecipe = null;
                this.state.currentActivity = null;
            }
        } else {
            // Clear current activity if no more crafts are active
            if (this.state.crafting.activeCrafts.length === 0) {
                this.state.currentActivity = null;
            }
        }
    },

    /**
     * Cancel an active craft and refund materials
     * @param {number} craftIndex - Index in activeCrafts array
     * @returns {object} - {success: boolean}
     */
    cancelCraft(craftIndex) {
        const craft = this.state.crafting.activeCrafts[craftIndex];
        if (!craft) {
            return { success: false, reason: "Craft not found" };
        }

        const recipe = CraftingSystem._getRecipeDef(craft.recipeId, this);

        // Refund 50% of materials
        for (let input of recipe.inputs) {
            const refundAmount = Math.floor(input.amount * 0.5);
            if (refundAmount > 0) {
                this.addItemToBank(input.itemId, refundAmount);
            }
        }

        // Remove from active crafts
        this.state.crafting.activeCrafts.splice(craftIndex, 1);

        // Clear current activity if no more crafts are active
        if (this.state.crafting.activeCrafts.length === 0) {
            this.state.currentActivity = null;
        }

        console.log(`❌ Cancelled crafting: ${recipe.name}`);
        return { success: true };
    },

    /**
     * Stop auto-crafting immediately (clears autoRecipe, active crafts, and current activity)
     * @returns {object} - {success: boolean}
     */
    stopAutoCraft() {
        this.state.crafting.autoRecipe = null;

        // Immediately clear any active crafts (stop mid-interval)
        this.state.crafting.activeCrafts = [];

        // Clear current activity if crafting
        if (this.state.currentActivity === 'crafting') {
            this.state.currentActivity = null;
        }

        console.log(`⏹️ Stopped auto-crafting`);
        return { success: true };
    },

    /**
     * Set the crafting skill filter (for UI filtering)
     * @param {string|null} skillId - Skill to filter by, or null for all
     * @returns {object} - {success: boolean}
     */
    setCraftingSkillFilter(skillId) {
        this.state.crafting.selectedSkill = skillId;
        console.log(`🔧 Crafting filter set to: ${skillId || 'All'}`);
        return { success: true };
    },

    /**
     * Discover a crafting station
     * @param {string} stationId - Crafting station ID
     */
    discoverCraftingStation(stationId) {
        console.log(`🔧 discoverCraftingStation called with: ${stationId}`);
        console.log(`   Current global stations:`, this.state.crafting.discoveredStations);

        if (!this.state.crafting.discoveredStations.includes(stationId)) {
            this.state.crafting.discoveredStations.push(stationId);
            const station = this.definitions.craftingNodes[stationId];
            console.log(`   ✅ Added to global state: ${station.name}`);
            console.log(`   New global stations:`, this.state.crafting.discoveredStations);
            return true;
        } else {
            console.log(`   ⚠️ Already in global state`);
            return false;
        }
    },

    /**
     * Get all recipes available to the player (considering skill and discovered stations)
     * @param {string} skillFilter - Optional skill to filter by
     * @returns {array} - Array of {recipeId, recipe, canCraft, reason}
     */
    getAvailableRecipes(skillFilter = null) {
        const recipes = [];

        for (let recipeId in this.definitions.recipes) {
            const recipe = CraftingSystem._getRecipeDef(recipeId, this);

            // Apply skill filter
            if (skillFilter && recipe.skill !== skillFilter) {
                continue;
            }

            const canCraftResult = this.canCraft(recipeId);

            recipes.push({
                recipeId: recipeId,
                recipe: recipe,
                canCraft: canCraftResult.canCraft,
                reason: canCraftResult.reason
            });
        }

        return recipes;
    },

    /**
     * Roll item rarity based on base chances and workshop bonuses
     * @param {string} skillName - The crafting skill used
     * @returns {string} - Rarity tier (common, uncommon, rare, epic, legendary, mythic)
     */
    rollItemRarity(skillName) {
        // Get base rarity chances
        const rarityChances = this.definitions.EQUIPMENT_RARITY_CHANCES;

        // Get workshop bonus for this skill
        const workshopBonus = this.getWorkshopBonus(skillName);
        const rarityMultiplier = workshopBonus.rarityChance || 1.0;
        const maxRarity = workshopBonus.maxRarity || 'common';

        // Apply multiplier to base chances
        const adjustedChances = {};
        for (let rarity in rarityChances) {
            adjustedChances[rarity] = rarityChances[rarity].baseChance * rarityMultiplier;
        }

        // Normalize chances to sum to 100%
        const total = Object.values(adjustedChances).reduce((sum, chance) => sum + chance, 0);
        for (let rarity in adjustedChances) {
            adjustedChances[rarity] = adjustedChances[rarity] / total;
        }

        // Roll rarity (highest to lowest)
        const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
        const maxRarityIndex = rarityOrder.indexOf(maxRarity);
        const roll = Math.random();
        let cumulative = 0;

        for (let i = 0; i < rarityOrder.length; i++) {
            const rarity = rarityOrder[i];

            // Skip rarities above workshop max
            if (i < maxRarityIndex) continue;

            cumulative += adjustedChances[rarity];
            if (roll < cumulative) {
                return rarity;
            }
        }

        return 'common'; // Fallback
    },

    /**
     * Roll item stats based on item definition and rarity
     * @param {object} itemDef - Item definition
     * @param {string} rarity - Rarity tier
     * @returns {object} - Rolled stats
     */
    rollItemStats(itemDef, rarity) {
        if (!itemDef.stats) return {};

        const rarityData = this.definitions.EQUIPMENT_RARITY_CHANCES[rarity];
        const [minMultiplier, maxMultiplier] = rarityData.statRange;

        const rolledStats = {};

        for (let statName in itemDef.stats) {
            const baseStat = itemDef.stats[statName];

            // Roll a multiplier within the rarity's range
            const multiplier = minMultiplier + (Math.random() * (maxMultiplier - minMultiplier));

            // Apply multiplier to base stat
            const rolledValue = Math.floor(baseStat * multiplier);

            rolledStats[statName] = rolledValue;
        }

        return rolledStats;
    },

    /**
     * Create a unique equipment instance with rarity and stats
     * @param {string} itemId - Base item ID
     * @param {string} rarity - Rarity tier
     * @param {object} stats - Rolled stats
     * @returns {string} - Unique instance ID
     */
    createEquipmentInstance(itemId, rarity, stats) {
        // Generate unique instance ID
        const instanceId = `${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const itemDef = CraftingSystem._getItemDef(itemId, this);
        const rarityData = this.definitions.EQUIPMENT_RARITY_CHANCES[rarity];

        // Create equipment instance data
        const instance = {
            baseItemId: itemId,
            instanceId: instanceId,
            rarity: rarity,
            stats: stats,
            enhancementSlots: rarityData.enhancementSlots,
            enhancements: [],
            potential: 0,
            createdAt: Date.now(),
            name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${itemDef.name}`
        };

        // Store instance in bank (will be added in Phase 4)
        // For now, just return the instance data
        return instance;
    }
};
