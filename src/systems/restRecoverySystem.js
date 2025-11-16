/**
 * REST/RECOVERY SYSTEM
 *
 * Replaces endurance-based navigation with resource consumption.
 * Players consume food and logs every 6 seconds while navigating/exploring.
 * If resources run out, exploration stops automatically.
 */

const RestRecoverySystem = {
    /**
     * Initialize rest/recovery system on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach functions to engine
        engine.processRestConsumption = this.processRestConsumption.bind(engine);
        engine.hasRestResources = this.hasRestResources.bind(engine);
        engine.consumeRestResources = this.consumeRestResources.bind(engine);
        engine.getRestResourceCounts = this.getRestResourceCounts.bind(engine);
    },

    /**
     * Process rest resource consumption (called from game loop)
     * Consumes 1 food and 1 log at health-based intervals ONLY during recovery mode
     * Each consumption restores endurance based on item tier
     */
    processRestConsumption(deltaTime) {
        // Only consume during active navigation
        if (this.state.currentActivity !== 'navigation') {
            return;
        }

        if (!this.state.activeNavigation?.isNavigating) {
            return;
        }

        // Only consume resources during recovery mode (not during exploration)
        if (!this.state.activeNavigation?.isRecovering) {
            return;
        }

        // Initialize last consumption time if not set
        if (!this.state.activeNavigation.lastRestConsumption) {
            this.state.activeNavigation.lastRestConsumption = Date.now();
        }

        const now = Date.now();
        const timeSinceLastConsumption = now - this.state.activeNavigation.lastRestConsumption;

        // Calculate consumption interval based on health attribute
        // Base 3000ms + (health * 200ms) = slower consumption with higher health
        const health = this.state.combatAttributes?.health || 1;
        const BASE_INTERVAL = 3000; // 3 seconds
        const HEALTH_BONUS = 200; // ms per health point
        const consumptionInterval = BASE_INTERVAL + (health * HEALTH_BONUS);

        // Check if it's time to consume resources
        if (timeSinceLastConsumption >= consumptionInterval) {
            this.state.activeNavigation.lastRestConsumption = now;

            // Check if player has resources
            if (!this.hasRestResources()) {
                console.log("🍖 Out of food or logs! Stopping navigation...");
                this.stopNavigation();
                return;
            }

            // Consume resources and restore endurance
            this.consumeRestResources();
        }
    },

    /**
     * Check if player has required rest resources (1 food + 1 log)
     * @returns {boolean} True if player has both resources
     */
    hasRestResources() {
        // Get food item from equipment slot
        const foodItemId = this.state.equipment?.food;
        let hasFood = false;

        if (foodItemId) {
            // Check if we have this item in bank
            const bankItem = this.state.bank.items[foodItemId];
            hasFood = bankItem && bankItem.quantity > 0;
        }

        // Check for logs in bank (any basic log item will work)
        const logItems = ['pinewood', 'log', 'normalLogs', 'oakLog', 'oakLogs', 'willowLog', 'willowLogs', 'birchLog', 'mapleLog', 'mapleLogs'];
        let hasLogs = false;

        for (let logId of logItems) {
            const bankItem = this.state.bank.items[logId];
            if (bankItem && bankItem.quantity > 0) {
                hasLogs = true;
                break;
            }
        }

        return hasFood && hasLogs;
    },

    /**
     * Consume rest resources (1 food + 1 log) and restore endurance based on item tiers
     * Called at health-based intervals during navigation recovery mode
     */
    consumeRestResources() {
        let totalEnduranceRecovery = 0;

        // Consume food from equipped slot and get its recovery value
        const foodItemId = this.state.equipment?.food;
        if (foodItemId) {
            const bankItem = this.state.bank.items[foodItemId];
            if (bankItem && bankItem.quantity > 0) {
                bankItem.quantity -= 1;

                // Get food item definition and recovery value
                // Try ItemDatabase first, then fall back to definitions.js
                let foodDef = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(foodItemId) : null;
                if (!foodDef && this.definitions?.items?.[foodItemId]) {
                    foodDef = this.definitions.items[foodItemId];
                }
                const foodRecovery = foodDef?.enduranceRecovery || 10; // Default 10 if not specified
                totalEnduranceRecovery += foodRecovery;

                // Show consumption animation
                if (typeof ItemConsumptionAnimation !== 'undefined') {
                    ItemConsumptionAnimation.showItemConsumed(foodItemId, 1);
                }

                // Remove from bank if quantity reaches 0
                if (bankItem.quantity <= 0) {
                    delete this.state.bank.items[foodItemId];
                    console.log("🍖 Food depleted!");
                }
            }
        }

        // Consume 1 log (prioritize basic logs first) and get its recovery value
        const logItems = ['pinewood', 'log', 'normalLogs', 'oakLogs', 'willowLogs', 'mapleLogs'];
        let logRecovery = 0;
        for (let logId of logItems) {
            const bankItem = this.state.bank.items[logId];
            if (bankItem && bankItem.quantity > 0) {
                bankItem.quantity -= 1;

                // Get log item definition and recovery value
                // Try ItemDatabase first, then fall back to definitions.js
                let logDef = typeof ItemDatabase !== 'undefined' ? ItemDatabase.getItem(logId) : null;
                if (!logDef && this.definitions?.items?.[logId]) {
                    logDef = this.definitions.items[logId];
                }
                logRecovery = logDef?.enduranceRecovery || 5; // Default 5 if not specified
                totalEnduranceRecovery += logRecovery;

                // Show consumption animation
                if (typeof ItemConsumptionAnimation !== 'undefined') {
                    ItemConsumptionAnimation.showItemConsumed(logId, 1);
                }

                // Remove from bank if quantity reaches 0
                if (bankItem.quantity <= 0) {
                    delete this.state.bank.items[logId];
                    console.log("🪵 Logs depleted!");
                }

                break; // Only consume 1 log
            }
        }

        // Restore endurance based on consumed items
        if (this.state.activeNavigation && totalEnduranceRecovery > 0) {
            const activeNav = this.state.activeNavigation;
            const previousEndurance = activeNav.endurance;
            activeNav.endurance = Math.min(activeNav.maxEndurance, activeNav.endurance + totalEnduranceRecovery);
            const actualRecovery = activeNav.endurance - previousEndurance;

            console.log(`🔥 Consumed rest resources: +${actualRecovery.toFixed(1)} endurance (${Math.floor(activeNav.endurance)}/${activeNav.maxEndurance})`);

            // Exit recovery when full
            if (activeNav.endurance >= activeNav.maxEndurance) {
                activeNav.isRecovering = false;
                console.log(`✅ Endurance recovered! Resuming exploration...`);
            }
        }

        const { food, logs } = this.getRestResourceCounts();
        if (food > 0 && logs > 0) {
            console.log(`   Remaining: ${food} food, ${logs} logs`);
        }
    },

    /**
     * Get current counts of rest resources
     * @returns {Object} {food: number, logs: number}
     */
    getRestResourceCounts() {
        // Count food from equipped slot
        let foodCount = 0;
        const foodItemId = this.state.equipment?.food;
        if (foodItemId) {
            const bankItem = this.state.bank.items[foodItemId];
            if (bankItem) {
                foodCount = bankItem.quantity || 0;
            }
        }

        // Count all logs
        let logsCount = 0;
        const logItems = ['pinewood', 'log', 'normalLogs', 'oakLog', 'oakLogs', 'willowLog', 'willowLogs', 'birchLog', 'mapleLog', 'mapleLogs'];
        for (let logId of logItems) {
            const bankItem = this.state.bank.items[logId];
            if (bankItem) {
                logsCount += bankItem.quantity || 0;
            }
        }

        return { food: foodCount, logs: logsCount };
    }
};
