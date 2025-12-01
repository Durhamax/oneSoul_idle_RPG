/**
 * MEDAL CRAFTING SYSTEM
 * Handles forging, combining, and salvaging medals
 */

const MedalCraftingSystemNew = {

    init(engine) {
        // Ensure state structures exist
        if (!engine.state.currencies) {
            engine.state.currencies = {};
        }
        if (engine.state.currencies.medalFragments === undefined) {
            engine.state.currencies.medalFragments = 0;
        }

        if (!engine.state.medalInventory) {
            engine.state.medalInventory = {
                medals: [],
                capacity: MEDAL_INVENTORY_CONFIG.baseCapacity,
                expansions: 0
            };
        }

        if (!engine.state.medalCrafting) {
            engine.state.medalCrafting = {
                totalForged: 0,
                totalCombined: 0,
                totalSalvaged: 0,
                forgedByTier: {},
                forgedByRarity: {}
            };
        }

        // Bind methods
        engine.ensureMedalInventory = this.ensureMedalInventory.bind(engine);
        engine.forgeMedal = this.forgeMedal.bind(engine);
        engine.forgeMedalBatch = this.forgeMedalBatch.bind(engine);
        engine.combineMedals = this.combineMedals.bind(engine);
        engine.salvageMedals = this.salvageMedals.bind(engine);
        engine.expandMedalInventory = this.expandMedalInventory.bind(engine);
        engine.getMedalInventoryInfo = this.getMedalInventoryInfo.bind(engine);
        engine.canAffordForge = this.canAffordForge.bind(engine);
        engine.getForgePreview = this.getForgePreview.bind(engine);
        engine.getCombinePreview = this.getCombinePreview.bind(engine);
        engine.getSalvagePreview = this.getSalvagePreview.bind(engine);

        console.log('[MedalCraftingSystem] Initialized');
    },

    /**
     * Ensure medal inventory state exists
     */
    ensureMedalInventory() {
        // Ensure currencies exist
        if (!this.state.currencies) {
            this.state.currencies = {};
        }
        if (this.state.currencies.medalFragments === undefined) {
            this.state.currencies.medalFragments = 0;
        }

        // Ensure medal inventory exists
        if (!this.state.medalInventory) {
            this.state.medalInventory = {
                medals: [],
                capacity: MEDAL_INVENTORY_CONFIG.baseCapacity,
                expansions: 0
            };
        }
        if (!this.state.medalInventory.medals) {
            this.state.medalInventory.medals = [];
        }
        if (this.state.medalInventory.capacity === undefined) {
            this.state.medalInventory.capacity = MEDAL_INVENTORY_CONFIG.baseCapacity;
        }

        // Ensure medal crafting stats exist
        if (!this.state.medalCrafting) {
            this.state.medalCrafting = {
                totalForged: 0,
                totalCombined: 0,
                totalSalvaged: 0,
                forgedByTier: {},
                forgedByRarity: {}
            };
        }
        if (!this.state.medalCrafting.forgedByTier) {
            this.state.medalCrafting.forgedByTier = {};
        }
        if (!this.state.medalCrafting.forgedByRarity) {
            this.state.medalCrafting.forgedByRarity = {};
        }

        return this.state.medalInventory;
    },

    /**
     * Forge a single medal
     * @param {number} tier - Crafting tier (1-9)
     * @returns {Object} { success, medal?, error? }
     */
    forgeMedal(tier) {
        const tierConfig = CRAFTING_TIERS[tier];
        if (!tierConfig) {
            return { success: false, error: 'Invalid crafting tier' };
        }

        const fragments = this.state.currencies.medalFragments || 0;
        if (fragments < tierConfig.cost) {
            return { success: false, error: 'Not enough medal fragments' };
        }

        const inventory = this.ensureMedalInventory();
        if (inventory.medals.length >= inventory.capacity) {
            return { success: false, error: 'Medal inventory full' };
        }

        // Consume fragments
        this.state.currencies.medalFragments -= tierConfig.cost;

        // Roll rarity
        const rarity = MedalCraftingSystemNew.rollRarity(tierConfig.rarityWeights);

        // Generate medal
        const medal = MedalGenerator.generate(rarity);

        // Add to inventory
        inventory.medals.push(medal);

        // Track stats
        this.state.medalCrafting.totalForged++;
        this.state.medalCrafting.forgedByTier[tier] =
            (this.state.medalCrafting.forgedByTier[tier] || 0) + 1;
        this.state.medalCrafting.forgedByRarity[rarity] =
            (this.state.medalCrafting.forgedByRarity[rarity] || 0) + 1;

        return { success: true, medal, tier, cost: tierConfig.cost };
    },

    /**
     * Forge multiple medals
     * @param {number} tier - Crafting tier
     * @param {number} count - Number to forge
     * @returns {Object} { success, medals, totalCost, error? }
     */
    forgeMedalBatch(tier, count) {
        const tierConfig = CRAFTING_TIERS[tier];
        if (!tierConfig) {
            return { success: false, error: 'Invalid crafting tier' };
        }

        const totalCost = tierConfig.cost * count;
        const fragments = this.state.currencies.medalFragments || 0;

        if (fragments < totalCost) {
            return { success: false, error: 'Not enough medal fragments' };
        }

        const inventory = this.ensureMedalInventory();
        const availableSlots = inventory.capacity - inventory.medals.length;

        if (availableSlots < count) {
            return { success: false, error: `Only ${availableSlots} inventory slots available` };
        }

        // Consume fragments
        this.state.currencies.medalFragments -= totalCost;

        // Generate medals
        const medals = [];
        const rarityCounts = {};

        for (let i = 0; i < count; i++) {
            const rarity = MedalCraftingSystemNew.rollRarity(tierConfig.rarityWeights);
            const medal = MedalGenerator.generate(rarity);

            medals.push(medal);
            inventory.medals.push(medal);

            rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;

            // Track stats
            this.state.medalCrafting.totalForged++;
            this.state.medalCrafting.forgedByTier[tier] =
                (this.state.medalCrafting.forgedByTier[tier] || 0) + 1;
            this.state.medalCrafting.forgedByRarity[rarity] =
                (this.state.medalCrafting.forgedByRarity[rarity] || 0) + 1;
        }

        return { success: true, medals, totalCost, rarityCounts };
    },

    /**
     * Combine 3 medals into 1 higher rarity
     * @param {Array} medalIds - Array of 3 medal IDs
     * @returns {Object} { success, medal?, consumed?, error? }
     */
    combineMedals(medalIds) {
        if (medalIds.length !== COMBINE_CONFIG.medalsRequired) {
            return { success: false, error: `Must select exactly ${COMBINE_CONFIG.medalsRequired} medals` };
        }

        const inventory = this.state.medalInventory;
        const medals = medalIds.map(id => inventory.medals.find(m => m.id === id));

        if (medals.some(m => !m)) {
            return { success: false, error: 'One or more medals not found' };
        }

        const rarity = medals[0].rarity;
        if (!medals.every(m => m.rarity === rarity)) {
            return { success: false, error: 'All medals must be the same rarity' };
        }

        const nextRarity = MedalCraftingSystemNew.getNextRarity(rarity);
        if (!nextRarity) {
            return { success: false, error: 'Cannot combine Creator medals' };
        }

        // Calculate inheritance weights
        const weights = MedalCraftingSystemNew.calculateInheritanceWeights(medals);

        // Generate new medal
        const newMedal = MedalGenerator.generateWithWeights(nextRarity, weights);

        // Remove source medals
        for (const id of medalIds) {
            const index = inventory.medals.findIndex(m => m.id === id);
            if (index !== -1) {
                inventory.medals.splice(index, 1);
            }
        }

        // Add new medal
        inventory.medals.push(newMedal);

        // Track stats
        this.state.medalCrafting.totalCombined++;

        return { success: true, medal: newMedal, consumed: medals };
    },

    /**
     * Salvage medals for fragments
     * @param {Array} medalIds - Array of medal IDs
     * @returns {Object} { success, fragmentsGained, medalsDestroyed }
     */
    salvageMedals(medalIds) {
        const inventory = this.state.medalInventory;
        let totalFragments = 0;
        const destroyed = [];

        for (const id of medalIds) {
            const index = inventory.medals.findIndex(m => m.id === id);
            if (index === -1) continue;

            const medal = inventory.medals[index];
            const fragments = SALVAGE_CONFIG.minimumByRarity[medal.rarity] || 5;

            totalFragments += fragments;
            destroyed.push(medal);

            inventory.medals.splice(index, 1);
        }

        this.state.currencies.medalFragments += totalFragments;
        this.state.medalCrafting.totalSalvaged += destroyed.length;

        return { success: true, fragmentsGained: totalFragments, medalsDestroyed: destroyed.length };
    },

    /**
     * Expand medal inventory
     * @returns {Object} { success, newCapacity, error? }
     */
    expandMedalInventory() {
        const inventory = this.state.medalInventory;

        if (inventory.capacity >= MEDAL_INVENTORY_CONFIG.maxCapacity) {
            return { success: false, error: 'Inventory already at maximum capacity' };
        }

        const fragments = this.state.currencies.medalFragments || 0;
        if (fragments < MEDAL_INVENTORY_CONFIG.expansionCost) {
            return { success: false, error: 'Not enough medal fragments' };
        }

        this.state.currencies.medalFragments -= MEDAL_INVENTORY_CONFIG.expansionCost;
        inventory.capacity = Math.min(
            inventory.capacity + MEDAL_INVENTORY_CONFIG.expansionAmount,
            MEDAL_INVENTORY_CONFIG.maxCapacity
        );
        inventory.expansions++;

        return { success: true, newCapacity: inventory.capacity };
    },

    /**
     * Get medal inventory info
     * @returns {Object} Inventory info
     */
    getMedalInventoryInfo() {
        const inventory = this.state.medalInventory || {
            medals: [],
            capacity: MEDAL_INVENTORY_CONFIG.baseCapacity,
            expansions: 0
        };
        return {
            medals: inventory.medals || [],
            count: (inventory.medals || []).length,
            capacity: inventory.capacity || MEDAL_INVENTORY_CONFIG.baseCapacity,
            maxCapacity: MEDAL_INVENTORY_CONFIG.maxCapacity,
            canExpand: (inventory.capacity || 0) < MEDAL_INVENTORY_CONFIG.maxCapacity,
            expansionCost: MEDAL_INVENTORY_CONFIG.expansionCost,
            expansions: inventory.expansions || 0
        };
    },

    /**
     * Check if can afford forge at tier
     * @param {number} tier - Crafting tier
     * @param {number} count - Number to forge
     * @returns {boolean} Can afford
     */
    canAffordForge(tier, count = 1) {
        const tierConfig = CRAFTING_TIERS[tier];
        if (!tierConfig) return false;

        const totalCost = tierConfig.cost * count;
        return (this.state.currencies.medalFragments || 0) >= totalCost;
    },

    /**
     * Get forge preview
     * @param {number} tier - Crafting tier
     * @param {number} count - Number to forge
     * @returns {Object} Preview info
     */
    getForgePreview(tier, count = 1) {
        const tierConfig = CRAFTING_TIERS[tier];
        if (!tierConfig) return null;

        const inventory = this.state.medalInventory;
        const fragments = this.state.currencies.medalFragments || 0;
        const totalCost = tierConfig.cost * count;
        const availableSlots = inventory.capacity - inventory.medals.length;

        return {
            tier,
            tierName: tierConfig.name,
            costPerMedal: tierConfig.cost,
            totalCost,
            count,
            canAfford: fragments >= totalCost,
            hasSpace: availableSlots >= count,
            fragments,
            availableSlots,
            rarityWeights: tierConfig.rarityWeights
        };
    },

    /**
     * Get combine preview
     * @param {Array} medalIds - Selected medal IDs
     * @returns {Object} Preview info
     */
    getCombinePreview(medalIds) {
        const inventory = this.state.medalInventory;
        const medals = medalIds.map(id => inventory.medals.find(m => m.id === id)).filter(Boolean);

        if (medals.length === 0) {
            return { valid: false, error: 'No medals selected' };
        }

        const rarity = medals[0].rarity;
        const allSameRarity = medals.every(m => m.rarity === rarity);
        const nextRarity = MedalCraftingSystemNew.getNextRarity(rarity);

        // Calculate inheritance preview
        const weights = medals.length > 0 ? MedalCraftingSystemNew.calculateInheritanceWeights(medals) : {};
        const topStats = Object.entries(weights)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([stat, weight]) => ({
                stat,
                name: PERK_STAT_POOL[stat]?.name || stat,
                icon: PERK_STAT_POOL[stat]?.icon || '-',
                weight,
                likelihood: weight > 1.5 ? 'HIGH' : weight > 1.2 ? 'MEDIUM' : 'LOW'
            }));

        return {
            valid: medals.length === COMBINE_CONFIG.medalsRequired && allSameRarity && nextRarity,
            medalsSelected: medals.length,
            medalsRequired: COMBINE_CONFIG.medalsRequired,
            currentRarity: rarity,
            resultRarity: nextRarity,
            allSameRarity,
            canCombine: medals.length === COMBINE_CONFIG.medalsRequired && allSameRarity && !!nextRarity,
            inheritancePreview: topStats,
            medals
        };
    },

    /**
     * Get salvage preview
     * @param {Array} medalIds - Selected medal IDs
     * @returns {Object} Preview info
     */
    getSalvagePreview(medalIds) {
        const inventory = this.state.medalInventory;
        const medals = medalIds.map(id => inventory.medals.find(m => m.id === id)).filter(Boolean);

        let totalFragments = 0;
        const breakdown = {};

        for (const medal of medals) {
            const fragments = SALVAGE_CONFIG.minimumByRarity[medal.rarity] || 5;
            totalFragments += fragments;

            if (!breakdown[medal.rarity]) {
                breakdown[medal.rarity] = { count: 0, fragments: 0 };
            }
            breakdown[medal.rarity].count++;
            breakdown[medal.rarity].fragments += fragments;
        }

        return {
            medalsSelected: medals.length,
            totalFragments,
            breakdown,
            medals
        };
    },

    // === STATIC HELPERS ===

    /**
     * Roll rarity from weights
     * @param {Object} weights - Rarity weights
     * @returns {string} Rolled rarity
     */
    rollRarity(weights) {
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let roll = Math.random() * totalWeight;

        for (const [rarity, weight] of Object.entries(weights)) {
            roll -= weight;
            if (roll <= 0) return rarity;
        }

        return Object.keys(weights)[0];
    },

    /**
     * Get next rarity tier
     * @param {string} rarity - Current rarity
     * @returns {string|null} Next rarity or null
     */
    getNextRarity(rarity) {
        const index = RARITY_ORDER.indexOf(rarity);
        return index < RARITY_ORDER.length - 1 ? RARITY_ORDER[index + 1] : null;
    },

    /**
     * Calculate inheritance weights from source medals
     * @param {Array} medals - Source medals
     * @returns {Object} Weighted stats
     */
    calculateInheritanceWeights(medals) {
        const weights = {};

        for (const stat of Object.keys(PERK_STAT_POOL)) {
            weights[stat] = 1.0;
        }

        for (const medal of medals) {
            for (const perk of medal.perks) {
                weights[perk.stat] += COMBINE_CONFIG.inheritanceBonus;
            }
        }

        return weights;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedalCraftingSystemNew;
}
