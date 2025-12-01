/**
 * CRAFTING SYSTEM
 *
 * Manages crafting recipes, active crafts, workstations, and auto-crafting.
 *
 * Key Design:
 * - Recipes unlock by SKILL LEVEL only (not workstation tier)
 * - Workstation tier provides bonuses (rarity, speed, material savings)
 * - Engineering level gates access to higher workstation tiers
 * - Uses RecipeRegistry for recipe definitions
 * - Uses WorkstationRegistry for workstation benefits
 */

const CraftingSystem = {
    // Valid crafting skills
    VALID_SKILLS: ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'],

    /**
     * Helper: Get recipe definition from RecipeRegistry first, fallback to definitions
     */
    _getRecipeDef(recipeId, engine) {
        let recipeDef = null;
        if (typeof RecipeRegistry !== 'undefined') {
            recipeDef = RecipeRegistry.get(recipeId);
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
        engine.getAvailableRecipesBySkill = this.getAvailableRecipesBySkill.bind(engine);
        engine.rollItemRarity = this.rollItemRarity.bind(engine);
        engine.setCraftingSkillFilter = this.setCraftingSkillFilter.bind(engine);
        engine.rollItemStats = this.rollItemStats.bind(engine);
        engine.createEquipmentInstance = this.createEquipmentInstance.bind(engine);
        engine.calculateCraftTime = this.calculateCraftTime.bind(engine);
        engine.getWorkstationBenefits = this.getWorkstationBenefits.bind(engine);
        engine.processCrafting = this.processCrafting.bind(engine);
        engine.upgradeWorkstation = this.upgradeWorkstation.bind(engine);

        // Initialize crafting state if not present
        this._initializeState(engine);

        console.log('[CraftingSystem] Initialized with skill-based recipe unlocks');
    },

    /**
     * Initialize crafting state on the engine
     */
    _initializeState(engine) {
        if (!engine.state.crafting) {
            engine.state.crafting = {
                activeQueues: {
                    smithing: [],
                    mechanics: [],
                    electronics: [],
                    tailoring: [],
                    chemistry: [],
                    cooking: []
                },
                discoveredStations: [],
                autoRecipe: null,
                selectedSkill: null
            };
        }

        // Ensure activeQueues structure exists
        if (!engine.state.crafting.activeQueues) {
            engine.state.crafting.activeQueues = {
                smithing: [],
                mechanics: [],
                electronics: [],
                tailoring: [],
                chemistry: [],
                cooking: []
            };
        }

        // Initialize workstations if not present
        if (!engine.state.workstations) {
            engine.state.workstations = {
                smithing: { tier: 1 },
                mechanics: { tier: 1 },
                electronics: { tier: 1 },
                tailoring: { tier: 1 },
                chemistry: { tier: 1 },
                cooking: { tier: 1 }
            };
        }

        // Initialize blueprints currency if not present
        if (!engine.state.blueprints) {
            engine.state.blueprints = {
                common: 0,
                advanced: 0,
                masterwork: 0
            };
        }

        // Legacy compatibility: convert activeCrafts to activeQueues
        if (engine.state.crafting.activeCrafts && !Array.isArray(engine.state.crafting.activeCrafts)) {
            // Already using activeQueues structure
        } else if (Array.isArray(engine.state.crafting.activeCrafts)) {
            // Migrate old activeCrafts array to new activeQueues structure
            for (const craft of engine.state.crafting.activeCrafts) {
                const recipe = CraftingSystem._getRecipeDef(craft.recipeId, engine);
                if (recipe && recipe.skill) {
                    if (!engine.state.crafting.activeQueues[recipe.skill]) {
                        engine.state.crafting.activeQueues[recipe.skill] = [];
                    }
                    engine.state.crafting.activeQueues[recipe.skill].push(craft);
                }
            }
            delete engine.state.crafting.activeCrafts;
        }
    },

    /**
     * Check if player can craft a recipe
     * @param {string} recipeId - Recipe ID to check
     * @param {number} quantity - Number of crafts (default 1)
     * @returns {object} - {canCraft: boolean, reason: string}
     */
    canCraft(recipeId, quantity = 1) {
        const recipe = CraftingSystem._getRecipeDef(recipeId, this);
        if (!recipe) {
            return { canCraft: false, reason: "Recipe not found" };
        }

        const skill = recipe.skill;

        // Check skill level requirement (NEW: uses skillLevelRequired)
        const playerSkillLevel = this.state.skills?.[skill]?.level || 0;
        const requiredLevel = recipe.skillLevelRequired || recipe.skillLevel || 1;
        if (playerSkillLevel < requiredLevel) {
            return { canCraft: false, reason: `Requires ${skill} level ${requiredLevel}` };
        }

        // Check engineering level requirement (optional)
        if (recipe.engineeringLevel) {
            const engineeringLevel = this.state.skills?.engineering?.level || 0;
            if (engineeringLevel < recipe.engineeringLevel) {
                return { canCraft: false, reason: `Requires Engineering level ${recipe.engineeringLevel}` };
            }
        }

        // Check workstation tier access (gated by engineering)
        const workstationTier = this.state.workstations?.[skill]?.tier || 1;
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        const benefits = this.getWorkstationBenefits(skill, workstationTier);

        if (!benefits) {
            return { canCraft: false, reason: `Engineering level too low for tier ${workstationTier} workstation` };
        }

        // Check queue slots
        const currentQueue = this.state.crafting.activeQueues?.[skill] || [];
        if (currentQueue.length >= benefits.queueSlots) {
            return { canCraft: false, reason: `Queue full (${benefits.queueSlots} slots)` };
        }

        // Legacy support: Check for station discovery if recipe has station array
        if (recipe.station && Array.isArray(recipe.station)) {
            const hasStation = recipe.station.some(stationId =>
                this.state.crafting.discoveredStations?.includes(stationId)
            );
            if (!hasStation) {
                return { canCraft: false, reason: "Required crafting station not discovered" };
            }
        }

        // Check if player has required materials (NEW: uses materials array)
        const materials = recipe.materials || recipe.inputs || [];
        for (let material of materials) {
            const itemId = material.itemId || material.id;
            const amount = (material.quantity || material.amount) * quantity;
            const itemCount = this.getItemCount(itemId);
            if (itemCount < amount) {
                const inputItemDef = CraftingSystem._getItemDef(itemId, this);
                return { canCraft: false, reason: `Need ${amount}x ${inputItemDef?.name || itemId}` };
            }
        }

        // Check discoverable recipes
        if (recipe.discoverable && !this.state.discoveredRecipes?.includes(recipeId)) {
            return { canCraft: false, reason: "Recipe not yet discovered" };
        }

        return { canCraft: true };
    },

    /**
     * Get workstation benefits for a skill (uses WorkstationRegistry)
     * @param {string} skill - Crafting skill
     * @param {number} tier - Workstation tier (optional, defaults to player's current)
     * @returns {object|null} Benefits object or null if not accessible
     */
    getWorkstationBenefits(skill, tier = null) {
        if (tier === null) {
            tier = this.state.workstations?.[skill]?.tier || 1;
        }

        const engineeringLevel = this.state.skills?.engineering?.level || 0;

        // Use WorkstationRegistry if available
        if (typeof WorkstationRegistry !== 'undefined') {
            return WorkstationRegistry.getTierBenefits(skill, tier, engineeringLevel);
        }

        // Fallback: basic benefits calculation
        const requiredEngineering = tier === 1 ? 0 : tier * 10;
        if (engineeringLevel < requiredEngineering) {
            return null;
        }

        return {
            type: 'equipment',
            tier: tier,
            rarityBonus: tier * 7.5,
            materialSavingsChance: tier * 0.05,
            craftSpeedMultiplier: 1 + (tier * 0.1),
            queueSlots: Math.min(5, 1 + Math.floor(tier / 2))
        };
    },

    /**
     * Start crafting a recipe
     * @param {string} recipeId - Recipe ID to craft
     * @param {number} quantity - Number of items to craft (default 1)
     * @returns {object} - {success: boolean, reason?: string, craftJob?: object}
     */
    startCraft(recipeId, quantity = 1) {
        const canCraftResult = this.canCraft(recipeId, quantity);
        if (!canCraftResult.canCraft) {
            return { success: false, reason: canCraftResult.reason };
        }

        const recipe = CraftingSystem._getRecipeDef(recipeId, this);
        const skill = recipe.skill;

        // Get workstation benefits
        const workstationTier = this.state.workstations?.[skill]?.tier || 1;
        const benefits = this.getWorkstationBenefits(skill, workstationTier);

        // Check for material savings (roll per craft)
        let materialsConsumed = true;
        if (Math.random() < benefits.materialSavingsChance) {
            materialsConsumed = false;
            console.log('[CraftingSystem] Material savings triggered!');
        }

        // Consume materials (NEW: uses materials array)
        if (materialsConsumed) {
            const materials = recipe.materials || recipe.inputs || [];
            for (let material of materials) {
                const itemId = material.itemId || material.id;
                const amount = (material.quantity || material.amount) * quantity;
                this.removeItemFromBank(itemId, amount);
            }
        }

        // Calculate craft time with modifiers
        const craftTime = this.calculateCraftTime(recipe, skill, workstationTier);

        // Create craft job
        const craftJob = {
            id: `craft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            recipeId: recipeId,
            quantity: quantity,
            skill: skill,
            startTime: Date.now(),
            completionTime: Date.now() + craftTime,
            totalTime: craftTime,
            materialsSaved: !materialsConsumed
        };

        // Add to skill-specific queue
        if (!this.state.crafting.activeQueues[skill]) {
            this.state.crafting.activeQueues[skill] = [];
        }
        this.state.crafting.activeQueues[skill].push(craftJob);

        // Legacy compatibility: also add to activeCrafts if it exists
        if (this.state.crafting.activeCrafts) {
            this.state.crafting.activeCrafts.push(craftJob);
        }

        // Set this recipe as the auto-repeat recipe
        this.state.crafting.autoRecipe = recipeId;

        // Set current activity to crafting
        this.state.currentActivity = 'crafting';

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('crafting-started', { recipe, quantity, craftJob });
        }

        console.log(`[CraftingSystem] Started crafting: ${recipe.name} x${quantity}`);
        return { success: true, craftJob };
    },

    /**
     * Calculate craft time with all modifiers applied
     * @param {object} recipe - Recipe definition
     * @param {string} skill - Crafting skill
     * @param {number} workstationTier - Current workstation tier
     * @returns {number} Craft time in milliseconds
     */
    calculateCraftTime(recipe, skill, workstationTier) {
        // Get base time from recipe (NEW: uses baseTime, legacy: craftingTime)
        const baseTime = recipe.baseTime || recipe.craftingTime || 5000;

        // Get player skill level
        const skillLevel = this.state.skills?.[skill]?.level || 0;

        // Get workstation benefits
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        let speedMultiplier = 1;

        if (typeof WorkstationRegistry !== 'undefined') {
            const benefits = WorkstationRegistry.getTierBenefits(skill, workstationTier, engineeringLevel);
            speedMultiplier = benefits?.craftSpeedMultiplier || 1;
        } else {
            speedMultiplier = 1 + (workstationTier * 0.1);
        }

        // Skill level bonus (1% faster per level, up to 50% at level 50)
        const skillBonus = 1 - Math.min(0.5, skillLevel * 0.01);

        // Attribute bonus (simplified)
        const attributeBonus = this.getAttributeSpeedBonus ? this.getAttributeSpeedBonus(skill) : 1;

        // Calculate final time (minimum 1 second)
        return Math.max(1000, Math.floor(baseTime * skillBonus / speedMultiplier / attributeBonus));
    },

    /**
     * Get attribute-based speed bonus for crafting
     * @param {string} skill - Crafting skill
     * @returns {number} Speed multiplier
     */
    getAttributeSpeedBonus(skill) {
        const attributeMap = {
            smithing: 'strength',
            mechanics: 'perception',
            electronics: 'intellect',
            tailoring: 'mobility',
            chemistry: 'intellect',
            cooking: 'health'
        };

        const primaryAttribute = this.state.combatAttributes?.[attributeMap[skill]] || 0;

        // 0.5% speed per attribute point
        return 1 + (primaryAttribute * 0.005);
    },

    /**
     * Check and complete any finished crafts
     * Called automatically in game tick
     */
    checkCraftCompletion() {
        const now = Date.now();

        // Check each skill queue
        for (const skill of CraftingSystem.VALID_SKILLS) {
            const queue = this.state.crafting.activeQueues?.[skill] || [];
            const completedIndices = [];

            // Find completed crafts in this queue
            queue.forEach((craft, index) => {
                if (now >= craft.completionTime) {
                    completedIndices.push(index);
                }
            });

            // Complete crafts (in reverse to avoid index issues)
            for (let i = completedIndices.length - 1; i >= 0; i--) {
                const craftIndex = completedIndices[i];
                this.completeCraft(skill, craftIndex);
            }
        }

        // Legacy compatibility: also check activeCrafts if it exists
        if (this.state.crafting.activeCrafts && Array.isArray(this.state.crafting.activeCrafts)) {
            const completedIndices = [];
            this.state.crafting.activeCrafts.forEach((craft, index) => {
                if (now >= craft.completionTime) {
                    completedIndices.push(index);
                }
            });

            for (let i = completedIndices.length - 1; i >= 0; i--) {
                const craftIndex = completedIndices[i];
                this.completeCraftLegacy(craftIndex);
            }
        }
    },

    /**
     * Process crafting tick (alias for checkCraftCompletion for new API)
     */
    processCrafting() {
        this.checkCraftCompletion();
    },

    /**
     * Complete a craft and give rewards (NEW: skill-based queues)
     * @param {string} skill - Crafting skill
     * @param {number} craftIndex - Index in skill queue
     */
    completeCraft(skill, craftIndex) {
        const queue = this.state.crafting.activeQueues?.[skill];
        if (!queue) return;

        const craft = queue[craftIndex];
        if (!craft) return;

        const recipe = CraftingSystem._getRecipeDef(craft.recipeId, this);
        if (!recipe) return;

        // Get workstation benefits for rarity bonus
        const workstationTier = this.state.workstations?.[skill]?.tier || 1;
        const engineeringLevel = this.state.skills?.engineering?.level || 0;

        let benefits = null;
        if (typeof WorkstationRegistry !== 'undefined') {
            benefits = WorkstationRegistry.getTierBenefits(skill, workstationTier, engineeringLevel);
        }

        const outputs = [];

        // Process outputs (NEW: uses outputs object, legacy: outputs array)
        if (recipe.outputs) {
            const output = recipe.outputs;
            const itemDef = CraftingSystem._getItemDef(output.itemId, this);

            if (!itemDef) {
                console.warn(`[CraftingSystem] Item not found: ${output.itemId}`);
            }

            // Determine if equipment or consumable
            const isEquipment = output.rarityWeights ||
                              itemDef?.equipSlot ||
                              (itemDef?.category && this.definitions?.ITEM_CATEGORIES?.[itemDef.category]?.hasInstances);

            if (isEquipment && output.rarityWeights) {
                // Equipment crafting: roll rarity
                const rarityBonus = (benefits?.rarityBonus || 0) + ((this.state.skills?.[skill]?.level || 0) * 0.5);
                const rarity = this.rollRarityFromWeights(output.rarityWeights, rarityBonus);
                const quantity = (output.quantity || 1) * craft.quantity;

                for (let i = 0; i < quantity; i++) {
                    const stats = this.rollItemStats(itemDef, rarity);
                    const instance = this.createEquipmentInstance(output.itemId, rarity, stats);

                    // Add instance to bank
                    if (this.addEquipmentInstance) {
                        this.addEquipmentInstance(instance);
                    } else if (this.addInstancedItemToBank) {
                        this.addInstancedItemToBank(instance);
                    }

                    outputs.push({ itemId: output.itemId, rarity, quantity: 1 });
                    console.log(`[CraftingSystem] Crafted ${rarity} ${itemDef?.name || output.itemId}!`);
                }
            } else if (output.baseQuantity) {
                // Consumable crafting: calculate quantity with multipliers
                const outputMult = benefits?.outputMultiplier || 1;
                const skillMult = 1 + ((this.state.skills?.[skill]?.level || 0) * 0.02);

                const finalQuantity = Math.floor(
                    output.baseQuantity * outputMult * skillMult * craft.quantity
                );

                this.addItemToBank(output.itemId, finalQuantity);
                outputs.push({ itemId: output.itemId, quantity: finalQuantity });
                console.log(`[CraftingSystem] Crafted ${finalQuantity}x ${itemDef?.name || output.itemId}!`);
            } else {
                // Simple output
                const quantity = (output.quantity || output.amount || 1) * craft.quantity;
                this.addItemToBank(output.itemId, quantity);
                outputs.push({ itemId: output.itemId, quantity });
                console.log(`[CraftingSystem] Crafted ${quantity}x ${itemDef?.name || output.itemId}!`);
            }
        }

        // Grant experience (NEW: uses experienceGain, legacy: expReward)
        const xp = recipe.experienceGain || recipe.expReward || 10;
        this.gainSkillExp(skill, xp * craft.quantity);

        // Trigger mission objective check
        if (this.checkMissionObjectives) {
            for (const output of outputs) {
                this.checkMissionObjectives('item_crafted', {
                    itemId: output.itemId,
                    amount: output.quantity
                });
            }
        }

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('crafting-complete', { outputs, recipe, skill });
        }

        // Remove from queue
        queue.splice(craftIndex, 1);

        // Auto-repeat logic
        const autoRecipeId = this.state.crafting.autoRecipe;
        if (autoRecipeId && craft.recipeId === autoRecipeId) {
            const canCraftAgain = this.canCraft(autoRecipeId);
            if (canCraftAgain.canCraft) {
                this.startCraft(autoRecipeId, 1);
                console.log(`[CraftingSystem] Auto-repeating: ${recipe.name}`);
            } else {
                console.log(`[CraftingSystem] Stopped auto-crafting ${recipe.name}: ${canCraftAgain.reason}`);
                this.state.crafting.autoRecipe = null;

                // Check if all queues are empty
                let allEmpty = true;
                for (const s of CraftingSystem.VALID_SKILLS) {
                    if ((this.state.crafting.activeQueues?.[s]?.length || 0) > 0) {
                        allEmpty = false;
                        break;
                    }
                }
                if (allEmpty) {
                    this.state.currentActivity = null;
                }
            }
        }
    },

    /**
     * Complete a craft (legacy compatibility - index-based)
     * @param {number} craftIndex - Index in activeCrafts array
     */
    completeCraftLegacy(craftIndex) {
        const craft = this.state.crafting.activeCrafts[craftIndex];
        if (!craft) return;

        const recipe = CraftingSystem._getRecipeDef(craft.recipeId, this);
        const skill = recipe?.skill || craft.skill;

        // Call the new method with skill
        if (skill && this.state.crafting.activeQueues?.[skill]) {
            // Find the craft in the queue
            const queueIndex = this.state.crafting.activeQueues[skill].findIndex(c => c.id === craft.id);
            if (queueIndex >= 0) {
                this.completeCraft(skill, queueIndex);
            }
        }

        // Remove from legacy array
        this.state.crafting.activeCrafts.splice(craftIndex, 1);
    },

    /**
     * Roll rarity from weights with bonus
     * @param {object} baseWeights - Base rarity weights
     * @param {number} rarityBonus - Bonus to apply
     * @returns {string} Rarity tier
     */
    rollRarityFromWeights(baseWeights, rarityBonus = 0) {
        // Shift weights based on bonus
        const weights = {
            common: Math.max(0, (baseWeights.common || 60) - rarityBonus),
            uncommon: (baseWeights.uncommon || 25) + (rarityBonus * 0.3),
            rare: (baseWeights.rare || 10) + (rarityBonus * 0.5),
            epic: (baseWeights.epic || 4) + (rarityBonus * 0.15),
            legendary: (baseWeights.legendary || 1) + (rarityBonus * 0.05)
        };

        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;

        for (const [rarity, weight] of Object.entries(weights)) {
            roll -= weight;
            if (roll <= 0) return rarity;
        }

        return 'common';
    },

    /**
     * Cancel an active craft and refund materials
     * @param {string} skill - Crafting skill (optional for new API)
     * @param {number} craftIndex - Index in queue
     * @returns {object} - {success: boolean}
     */
    cancelCraft(skillOrIndex, craftIndex = null) {
        let craft, recipe, skill;

        // Support both old and new API
        if (craftIndex === null) {
            // Old API: cancelCraft(index)
            if (this.state.crafting.activeCrafts) {
                craft = this.state.crafting.activeCrafts[skillOrIndex];
                if (craft) {
                    recipe = CraftingSystem._getRecipeDef(craft.recipeId, this);
                    skill = recipe?.skill || craft.skill;
                    this.state.crafting.activeCrafts.splice(skillOrIndex, 1);
                }
            }
        } else {
            // New API: cancelCraft(skill, index)
            skill = skillOrIndex;
            const queue = this.state.crafting.activeQueues?.[skill];
            if (queue) {
                craft = queue[craftIndex];
                if (craft) {
                    recipe = CraftingSystem._getRecipeDef(craft.recipeId, this);
                    queue.splice(craftIndex, 1);
                }
            }
        }

        if (!craft || !recipe) {
            return { success: false, reason: "Craft not found" };
        }

        // Refund 50% of materials (NEW: uses materials array)
        const materials = recipe.materials || recipe.inputs || [];
        for (let material of materials) {
            const itemId = material.itemId || material.id;
            const amount = material.quantity || material.amount;
            const refundAmount = Math.floor(amount * 0.5);
            if (refundAmount > 0) {
                this.addItemToBank(itemId, refundAmount);
            }
        }

        // Check if all queues are empty
        let allEmpty = true;
        for (const s of CraftingSystem.VALID_SKILLS) {
            if ((this.state.crafting.activeQueues?.[s]?.length || 0) > 0) {
                allEmpty = false;
                break;
            }
        }
        if (allEmpty) {
            this.state.currentActivity = null;
        }

        console.log(`[CraftingSystem] Cancelled crafting: ${recipe.name}`);
        return { success: true };
    },

    /**
     * Stop auto-crafting immediately (clears autoRecipe, active crafts, and current activity)
     * @returns {object} - {success: boolean}
     */
    stopAutoCraft() {
        this.state.crafting.autoRecipe = null;

        // Clear all queues
        for (const skill of CraftingSystem.VALID_SKILLS) {
            if (this.state.crafting.activeQueues?.[skill]) {
                this.state.crafting.activeQueues[skill] = [];
            }
        }

        // Legacy: clear activeCrafts if it exists
        if (this.state.crafting.activeCrafts) {
            this.state.crafting.activeCrafts = [];
        }

        // Clear current activity if crafting
        if (this.state.currentActivity === 'crafting') {
            this.state.currentActivity = null;
        }

        console.log('[CraftingSystem] Stopped auto-crafting');
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

        // Try RecipeRegistry first
        if (typeof RecipeRegistry !== 'undefined') {
            if (skillFilter) {
                const skillRecipes = RecipeRegistry.getAvailableRecipes(skillFilter, this.state);
                for (const [recipeId, recipe] of Object.entries(skillRecipes)) {
                    const canCraftResult = this.canCraft(recipeId);
                    recipes.push({
                        recipeId,
                        recipe,
                        canCraft: canCraftResult.canCraft,
                        reason: canCraftResult.reason
                    });
                }
            } else {
                // Get recipes from all skills
                for (const skill of CraftingSystem.VALID_SKILLS) {
                    const skillRecipes = RecipeRegistry.getAvailableRecipes(skill, this.state);
                    for (const [recipeId, recipe] of Object.entries(skillRecipes)) {
                        const canCraftResult = this.canCraft(recipeId);
                        recipes.push({
                            recipeId,
                            recipe,
                            canCraft: canCraftResult.canCraft,
                            reason: canCraftResult.reason
                        });
                    }
                }
            }
        }

        // Fallback: legacy definitions.recipes
        if (recipes.length === 0 && this.definitions?.recipes) {
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
        }

        return recipes;
    },

    /**
     * Get available recipes for a specific skill (NEW: skill-based organization)
     * @param {string} skill - Crafting skill
     * @returns {array} - Array of {recipeId, recipe, canCraft, reason}
     */
    getAvailableRecipesBySkill(skill) {
        return this.getAvailableRecipes(skill);
    },

    /**
     * Upgrade workstation to next tier
     * @param {string} skill - Crafting skill
     * @returns {object} - {success: boolean, reason?: string, tier?: number}
     */
    upgradeWorkstation(skill) {
        if (!CraftingSystem.VALID_SKILLS.includes(skill)) {
            return { success: false, reason: `Invalid skill: ${skill}` };
        }

        // Get current tier
        const currentTier = this.state.workstations?.[skill]?.tier || 1;

        // Use WorkstationRegistry if available
        if (typeof WorkstationRegistry !== 'undefined') {
            const canUpgrade = WorkstationRegistry.canUpgrade(skill, this.state);
            if (!canUpgrade.canUpgrade) {
                return { success: false, reason: canUpgrade.reason };
            }

            const cost = WorkstationRegistry.getUpgradeCost(currentTier);
            if (!cost) {
                return { success: false, reason: 'Already at maximum tier' };
            }

            // Deduct costs
            if (this.state.blueprints) {
                this.state.blueprints[cost.blueprints.type] -= cost.blueprints.quantity;
            }
            if (this.state.resources) {
                this.state.resources.gold = (this.state.resources.gold || 0) - cost.gold;
            } else if (this.state.gold !== undefined) {
                this.state.gold -= cost.gold;
            }

            // Apply upgrade
            if (!this.state.workstations[skill]) {
                this.state.workstations[skill] = { tier: 1 };
            }
            this.state.workstations[skill].tier = currentTier + 1;

            const tierName = WorkstationRegistry.getTierName(currentTier + 1);
            console.log(`[CraftingSystem] Upgraded ${skill} workstation to Tier ${currentTier + 1} (${tierName})`);

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('workstation-upgraded', { skill, tier: currentTier + 1 });
            }

            return { success: true, tier: currentTier + 1, tierName };
        }

        // Fallback: basic upgrade logic
        if (currentTier >= 10) {
            return { success: false, reason: 'Already at maximum tier' };
        }

        // Simple cost calculation
        const requiredEngineering = (currentTier + 1) * 10;
        const engineeringLevel = this.state.skills?.engineering?.level || 0;
        if (engineeringLevel < requiredEngineering) {
            return { success: false, reason: `Requires Engineering level ${requiredEngineering}` };
        }

        // Apply upgrade
        if (!this.state.workstations[skill]) {
            this.state.workstations[skill] = { tier: 1 };
        }
        this.state.workstations[skill].tier = currentTier + 1;

        return { success: true, tier: currentTier + 1 };
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
