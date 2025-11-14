/**
 * ENHANCEMENT SYSTEM
 *
 * Manages equipment enhancement, catalysts, potential, and tier upgrades.
 * Equipment can be enhanced using catalysts to improve stats.
 */

const EnhancementSystem = {
    /**
     * Initialize enhancement system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        engine.enhanceEquipment = this.enhanceEquipment.bind(engine);
        engine.canEnhanceEquipment = this.canEnhanceEquipment.bind(engine);
        engine.getTierUpgradeRequirements = this.getTierUpgradeRequirements.bind(engine);
        engine.upgradeTier = this.upgradeTier.bind(engine);
        engine.getEnhancementBonus = this.getEnhancementBonus.bind(engine);
        engine.calculateEnhancedStats = this.calculateEnhancedStats.bind(engine);
    },

    /**
     * Check if equipment can be enhanced
     * @param {string} instanceId - Equipment instance ID
     * @param {string} catalystId - Catalyst item ID
     * @returns {object} - {canEnhance: boolean, reason: string}
     */
    canEnhanceEquipment(instanceId, catalystId) {
        // Get equipment instance (Phase 4 will implement proper instance storage)
        // For now, return placeholder
        const instance = this.getEquipmentInstance?.(instanceId);
        if (!instance) {
            return { canEnhance: false, reason: "Equipment not found" };
        }

        // Check if equipment has available enhancement slots
        const usedSlots = instance.enhancements?.length || 0;
        const totalSlots = instance.enhancementSlots || 0;

        if (usedSlots >= totalSlots) {
            return { canEnhance: false, reason: "No enhancement slots available" };
        }

        // Check if player has the catalyst
        const catalystCount = this.getItemCount(catalystId);
        if (catalystCount < 1) {
            return { canEnhance: false, reason: "Missing catalyst" };
        }

        // Check catalyst definition
        const catalystDef = this.definitions.items[catalystId];
        if (!catalystDef || catalystDef.category !== 'catalyst') {
            return { canEnhance: false, reason: "Invalid catalyst" };
        }

        return { canEnhance: true };
    },

    /**
     * Enhance equipment with a catalyst
     * @param {string} instanceId - Equipment instance ID
     * @param {string} catalystId - Catalyst item ID
     * @returns {object} - {success: boolean, newStats?: object, potential?: number}
     */
    enhanceEquipment(instanceId, catalystId) {
        const check = this.canEnhanceEquipment(instanceId, catalystId);
        if (!check.canEnhance) {
            return { success: false, reason: check.reason };
        }

        // Get equipment instance
        const instance = this.getEquipmentInstance?.(instanceId);
        const catalystDef = this.definitions.items[catalystId];

        // Consume catalyst
        this.removeItem(catalystId, 1);

        // Apply enhancement
        const enhancement = {
            catalystId: catalystId,
            catalystName: catalystDef.name,
            statBonus: catalystDef.enhancementBonus || {}, // e.g., {attackDamage: 5, critChance: 2}
            appliedAt: Date.now()
        };

        if (!instance.enhancements) {
            instance.enhancements = [];
        }
        instance.enhancements.push(enhancement);

        // Increase potential
        instance.potential = (instance.potential || 0) + (catalystDef.potentialGain || 10);

        // Recalculate total stats
        const newStats = this.calculateEnhancedStats(instance);

        console.log(`✨ Enhanced ${instance.name} with ${catalystDef.name}!`);
        console.log(`   Potential: ${instance.potential}`);
        console.log(`   Slots used: ${instance.enhancements.length}/${instance.enhancementSlots}`);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`Enhanced ${instance.name}!`, 'success', 3000);
        }

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.update) {
            UICore.update();
        }

        return {
            success: true,
            newStats: newStats,
            potential: instance.potential,
            slotsUsed: instance.enhancements.length,
            slotsTotal: instance.enhancementSlots
        };
    },

    /**
     * Calculate total stats including base stats and enhancements
     * @param {object} instance - Equipment instance
     * @returns {object} - Combined stats
     */
    calculateEnhancedStats(instance) {
        const stats = { ...instance.stats };

        // Add enhancement bonuses
        if (instance.enhancements) {
            for (let enhancement of instance.enhancements) {
                for (let statName in enhancement.statBonus) {
                    stats[statName] = (stats[statName] || 0) + enhancement.statBonus[statName];
                }
            }
        }

        return stats;
    },

    /**
     * Get tier upgrade requirements
     * @param {object} instance - Equipment instance
     * @returns {object} - {canUpgrade: boolean, requiredLevel: number, cost: object}
     */
    getTierUpgradeRequirements(instance) {
        const currentTier = instance.tier || 0;
        const nextTier = currentTier + 1;

        // Tier upgrades every 5 levels (tier 1 at level 5, tier 2 at level 10, etc.)
        const requiredLevel = nextTier * 5;

        // Check if equipment has reached required level
        const equipmentLevel = instance.level || 1;
        if (equipmentLevel < requiredLevel) {
            return {
                canUpgrade: false,
                reason: `Requires equipment level ${requiredLevel}`,
                requiredLevel: requiredLevel,
                currentLevel: equipmentLevel
            };
        }

        // Cost increases per tier
        const baseCost = 100;
        const goldCost = baseCost * Math.pow(2, nextTier);

        return {
            canUpgrade: true,
            requiredLevel: requiredLevel,
            tier: nextTier,
            cost: {
                gold: goldCost
            }
        };
    },

    /**
     * Upgrade equipment tier
     * @param {string} instanceId - Equipment instance ID
     * @returns {object} - {success: boolean, newTier?: number}
     */
    upgradeTier(instanceId) {
        const instance = this.getEquipmentInstance?.(instanceId);
        if (!instance) {
            return { success: false, reason: "Equipment not found" };
        }

        const requirements = this.getTierUpgradeRequirements(instance);
        if (!requirements.canUpgrade) {
            return { success: false, reason: requirements.reason };
        }

        // Check cost
        if (this.state.gold < requirements.cost.gold) {
            return { success: false, reason: `Need ${requirements.cost.gold} gold` };
        }

        // Deduct cost
        this.state.gold -= requirements.cost.gold;

        // Upgrade tier
        instance.tier = requirements.tier;

        // Boost stats by 10% per tier
        const boostMultiplier = 1.10;
        for (let statName in instance.stats) {
            instance.stats[statName] = Math.floor(instance.stats[statName] * boostMultiplier);
        }

        console.log(`⬆️ Upgraded ${instance.name} to Tier ${instance.tier}!`);

        // Show notification
        if (typeof Animations !== 'undefined') {
            Animations.showNotification(`Tier ${instance.tier} ${instance.name}!`, 'success', 3000);
        }

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.update) {
            UICore.update();
        }

        return { success: true, newTier: instance.tier, newStats: instance.stats };
    },

    /**
     * Get total enhancement bonus for a stat
     * @param {object} instance - Equipment instance
     * @param {string} statName - Stat name
     * @returns {number} - Bonus value
     */
    getEnhancementBonus(instance, statName) {
        let bonus = 0;

        if (instance.enhancements) {
            for (let enhancement of instance.enhancements) {
                bonus += enhancement.statBonus[statName] || 0;
            }
        }

        return bonus;
    }
};
