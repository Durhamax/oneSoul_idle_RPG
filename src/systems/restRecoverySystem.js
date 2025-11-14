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
     * Consumes 1 food and 1 log every 6 seconds during navigation
     */
    processRestConsumption(deltaTime) {
        // Only consume during active navigation
        if (this.state.currentActivity !== 'navigation') {
            return;
        }

        if (!this.state.activeNavigation?.isNavigating) {
            return;
        }

        // Initialize last consumption time if not set
        if (!this.state.activeNavigation.lastRestConsumption) {
            this.state.activeNavigation.lastRestConsumption = Date.now();
        }

        const now = Date.now();
        const timeSinceLastConsumption = now - this.state.activeNavigation.lastRestConsumption;
        const CONSUMPTION_INTERVAL = 6000; // 6 seconds

        // Check if it's time to consume resources
        if (timeSinceLastConsumption >= CONSUMPTION_INTERVAL) {
            this.state.activeNavigation.lastRestConsumption = now;

            // Check if player has resources
            if (!this.hasRestResources()) {
                console.log("🍖 Out of food or logs! Exploration stopped.");
                this.stopNavigation();
                return;
            }

            // Consume resources
            this.consumeRestResources();
        }
    },

    /**
     * Check if player has required rest resources (1 food + 1 log)
     * @returns {boolean} True if player has both resources
     */
    hasRestResources() {
        // Get food item from equipment slot
        const foodSlot = this.state.equipment?.food;
        let hasFood = false;

        if (foodSlot && foodSlot.itemId) {
            // Check if we have this item in bank
            const bankItem = this.state.bank.items[foodSlot.itemId];
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
     * Consume rest resources (1 food + 1 log)
     * Called every 6 seconds during navigation
     */
    consumeRestResources() {
        // Consume food from equipped slot
        const foodSlot = this.state.equipment?.food;
        if (foodSlot && foodSlot.itemId) {
            const bankItem = this.state.bank.items[foodSlot.itemId];
            if (bankItem && bankItem.quantity > 0) {
                bankItem.quantity -= 1;

                // Remove from bank if quantity reaches 0
                if (bankItem.quantity <= 0) {
                    delete this.state.bank.items[foodSlot.itemId];
                    console.log("🍖 Food depleted!");
                }
            }
        }

        // Consume 1 log (prioritize basic logs first)
        const logItems = ['pinewood', 'log', 'normalLogs', 'oakLog', 'oakLogs', 'willowLog', 'willowLogs', 'birchLog', 'mapleLog', 'mapleLogs'];
        for (let logId of logItems) {
            const bankItem = this.state.bank.items[logId];
            if (bankItem && bankItem.quantity > 0) {
                bankItem.quantity -= 1;

                // Remove from bank if quantity reaches 0
                if (bankItem.quantity <= 0) {
                    delete this.state.bank.items[logId];
                    console.log("🪵 Logs depleted!");
                }

                break; // Only consume 1 log
            }
        }

        const { food, logs } = this.getRestResourceCounts();
        console.log(`🔥 Consumed rest resources (${food} food, ${logs} logs remaining)`);
    },

    /**
     * Get current counts of rest resources
     * @returns {Object} {food: number, logs: number}
     */
    getRestResourceCounts() {
        // Count food from equipped slot
        let foodCount = 0;
        const foodSlot = this.state.equipment?.food;
        if (foodSlot && foodSlot.itemId) {
            const bankItem = this.state.bank.items[foodSlot.itemId];
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
