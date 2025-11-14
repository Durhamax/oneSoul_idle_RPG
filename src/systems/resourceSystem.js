/**
 * RESOURCE SYSTEM
 *
 * Manages resource generation, production rates, multipliers, and purchasing of generators/upgrades.
 * Extracted from GameEngine to maintain modular architecture.
 */

const ResourceSystem = {
    /**
     * Initialize resource system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all resource functions to engine
        engine.updateResourceGeneration = this.updateResourceGeneration.bind(engine);
        engine.getProductionRates = this.getProductionRates.bind(engine);
        engine.getResourceMultiplier = this.getResourceMultiplier.bind(engine);
        engine.getRegionMultiplier = this.getRegionMultiplier.bind(engine);
        engine.getGeneratorCost = this.getGeneratorCost.bind(engine);
        engine.getUpgradeCost = this.getUpgradeCost.bind(engine);
        engine.purchaseGenerator = this.purchaseGenerator.bind(engine);
        engine.purchaseUpgrade = this.purchaseUpgrade.bind(engine);
    },

    /**
     * Update resource generation based on generators and upgrades
     * @param {number} deltaTime - Time elapsed in seconds
     */
    updateResourceGeneration(deltaTime) {
        const gens = this.state.generators;
        const defs = this.definitions.generators;
        const currentRegion = this.definitions.regions[this.state.currentRegion];

        // Process each generator
        for (let genId in gens) {
            const gen = gens[genId];
            const def = defs[genId];

            if (!gen.unlocked || gen.level === 0) continue;

            // NOTE: Region-based resource restrictions removed in favor of node-based gathering
            // Generators now work in all regions

            // Calculate production
            // Formula: baseProduction * level * (1 + upgrade bonuses + skill bonuses + region bonuses) * deltaTime
            const baseProduction = def.baseProduction * gen.level;
            const upgradeMultiplier = this.getResourceMultiplier(def.produces);
            const skillMultiplier = this.getSkillMultiplier(def.produces);
            const regionMultiplier = this.getRegionMultiplier(def.produces);

            const totalMultiplier = upgradeMultiplier * skillMultiplier * regionMultiplier;
            const production = baseProduction * totalMultiplier * deltaTime;

            // Add to resource (legacy for now - will transition to bank)
            this.state.resources[def.produces] += production;

            // Also add to bank (1 item per full resource collected)
            // This creates the bank inventory while keeping the counter system
            const itemsToAdd = Math.floor(production);
            if (itemsToAdd > 0) {
                this.addItemToBank(def.produces, itemsToAdd);
            }

            // Gain skill experience for gathering
            this.gainSkillExp(this.getResourceSkill(def.produces), production * 0.1);
        }
    },

    /**
     * Calculate the total multiplier for a resource type based on upgrades
     * @param {string} resourceType - The resource to calculate multiplier for
     * @returns {number} - Total multiplier (1.0 = no bonus, 1.5 = +50%, etc.)
     */
    getResourceMultiplier(resourceType) {
        let multiplier = 1.0;

        const upgrades = this.state.upgrades;
        const upgradeDefs = this.definitions.upgrades;

        for (let upgradeId in upgrades) {
            const upgrade = upgrades[upgradeId];
            const def = upgradeDefs[upgradeId];

            if (!upgrade.unlocked || upgrade.level === 0) continue;
            if (def.affectsResource !== resourceType) continue;

            // Formula: multiplier += (effectPerLevel * level)
            multiplier += (def.effectPerLevel * upgrade.level);
        }

        return multiplier;
    },

    /**
     * Calculate cost for next level of a generator
     * Formula: baseCost * (costMultiplier ^ currentLevel)
     */
    getGeneratorCost(generatorId) {
        const gen = this.state.generators[generatorId];
        const def = this.definitions.generators[generatorId];

        return Math.floor(def.baseCost * Math.pow(def.costMultiplier, gen.level));
    },

    /**
     * Calculate cost for next level of an upgrade
     * Formula: baseCost * (costMultiplier ^ currentLevel)
     */
    getUpgradeCost(upgradeId) {
        const upgrade = this.state.upgrades[upgradeId];
        const def = this.definitions.upgrades[upgradeId];

        return Math.floor(def.baseCost * Math.pow(def.costMultiplier, upgrade.level));
    },

    /**
     * Purchase a generator level
     */
    purchaseGenerator(generatorId) {
        const gen = this.state.generators[generatorId];
        const def = this.definitions.generators[generatorId];

        if (!gen.unlocked) {
            return { success: false, reason: "Generator not unlocked" };
        }

        const cost = this.getGeneratorCost(generatorId);
        const costResource = def.costResource;

        if (this.state.resources[costResource] < cost) {
            return { success: false, reason: "Insufficient resources" };
        }

        // Deduct cost and increase level
        this.state.resources[costResource] -= cost;
        gen.level++;

        return { success: true };
    },

    /**
     * Purchase an upgrade level
     */
    purchaseUpgrade(upgradeId) {
        const upgrade = this.state.upgrades[upgradeId];
        const def = this.definitions.upgrades[upgradeId];

        if (!upgrade.unlocked) {
            return { success: false, reason: "Upgrade not unlocked" };
        }

        if (upgrade.level >= def.maxLevel) {
            return { success: false, reason: "Max level reached" };
        }

        const cost = this.getUpgradeCost(upgradeId);
        const costResource = def.costResource;

        if (this.state.resources[costResource] < cost) {
            return { success: false, reason: "Insufficient resources" };
        }

        // Deduct cost and increase level
        this.state.resources[costResource] -= cost;
        upgrade.level++;

        return { success: true };
    },

    /**
     * Get current production rates for all resources
     */
    getProductionRates() {
        const rates = {
            gold: 0,
            ore: 0,
            wood: 0
        };

        const gens = this.state.generators;
        const defs = this.definitions.generators;
        const currentRegion = this.definitions.regions[this.state.currentRegion];

        for (let genId in gens) {
            const gen = gens[genId];
            const def = defs[genId];

            if (!gen.unlocked || gen.level === 0) continue;

            // NOTE: Region-based resource restrictions removed in favor of node-based gathering
            // Generators now work in all regions

            const baseProduction = def.baseProduction * gen.level;
            const upgradeMultiplier = this.getResourceMultiplier(def.produces);
            const skillMultiplier = this.getSkillMultiplier(def.produces);
            const regionMultiplier = this.getRegionMultiplier(def.produces);

            const totalMultiplier = upgradeMultiplier * skillMultiplier * regionMultiplier;
            rates[def.produces] += baseProduction * totalMultiplier;
        }

        return rates;
    },

    /**
     * Get region multiplier for a resource type
     */
    getRegionMultiplier(resourceType) {
        let multiplier = 1.0;

        const regionState = this.state.regions[this.state.currentRegion];
        const regionDef = this.definitions.regions[this.state.currentRegion];

        if (!regionState || !regionDef) return multiplier;

        // NOTE: Region multiplier system removed in favor of node-based gathering
        // Resource bonuses are now applied directly through node collection rewards
        // rather than passive generation multipliers

        return multiplier;
    }
};
