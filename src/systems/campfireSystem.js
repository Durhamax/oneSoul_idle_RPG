/**
 * CAMPFIRE SYSTEM
 *
 * Manages fuel consumption during navigation recovery mode.
 * Fuel is consumed from bank inventory, not a loadout slot.
 * Higher tier fuels provide better recovery efficiency.
 */

const CampfireSystem = {
    // Campfire balance constants
    CAMPFIRE_BALANCE: {
        // Tick rate in milliseconds
        tickInterval: 1000,

        // Fuel consumption rate (seconds per tick at base)
        baseFuelConsumption: 1,

        // Base recovery per tick (before fuel efficiency modifier)
        baseRecoveryPerTick: 3,

        // Minimum warmth required for recovery
        minWarmthForRecovery: 1,

        // Warmth decay rate when no fuel (per tick)
        warmthDecayRate: 5
    },

    /**
     * Initialize campfire system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all campfire functions to engine
        engine.initCampfireState = this.initCampfireState.bind(engine);
        engine.selectCampfireFuel = this.selectCampfireFuel.bind(engine);
        engine.getOwnedFuelItems = this.getOwnedFuelItems.bind(engine);
        engine.getFuelDefinition = this.getFuelDefinition.bind(engine);
        engine.processCampfireTick = this.processCampfireTick.bind(engine);
        engine.consumeFuel = this.consumeFuel.bind(engine);
        engine.getCampfireStats = this.getCampfireStats.bind(engine);
        engine.extinguishCampfire = this.extinguishCampfire.bind(engine);

        // Initialize campfire state if not present
        this.ensureCampfireState(engine);
    },

    /**
     * Ensure campfire state exists in navigation state
     */
    ensureCampfireState(engine) {
        if (!engine.state.navigation) {
            engine.state.navigation = {};
        }

        if (!engine.state.navigation.campfire) {
            engine.state.navigation.campfire = {
                active: false,
                selectedFuelId: null,
                fuelRemaining: 0,      // Remaining burn time in seconds
                warmth: 0,              // Current warmth level
                efficiency: 1.0,        // Current fuel efficiency
                lastTick: 0             // Last tick timestamp
            };
        }
    },

    /**
     * Initialize campfire state (called from GameEngine)
     * Bound to: engine.initCampfireState()
     */
    initCampfireState() {
        if (!this.state.navigation) {
            this.state.navigation = {};
        }

        if (!this.state.navigation.campfire) {
            this.state.navigation.campfire = {
                active: false,
                selectedFuelId: null,
                fuelRemaining: 0,
                warmth: 0,
                efficiency: 1.0,
                lastTick: 0
            };
        }

        return this.state.navigation.campfire;
    },

    /**
     * Get all fuel items owned by player in bank
     * Bound to: engine.getOwnedFuelItems()
     * @returns {Array} Array of { itemId, quantity, definition } objects
     */
    getOwnedFuelItems() {
        const ownedFuels = [];

        // Check bank inventory for fuel items
        // DualBankSystem stores stackable items as { itemId: quantity } (direct numbers)
        const stackableItems = this.state.bank?.stackable || {};

        for (const [itemId, quantity] of Object.entries(stackableItems)) {
            if (!quantity || quantity <= 0) continue;

            // Get item definition
            const itemDef = typeof ItemRegistry !== 'undefined'
                ? ItemRegistry.getItem(itemId)
                : null;

            // Check if this is a fuel item (fuel: true property)
            if (itemDef && itemDef.fuel === true) {
                ownedFuels.push({
                    itemId: itemId,
                    quantity: quantity,
                    definition: itemDef
                });
            }
        }

        // Sort by tier (higher tier first)
        ownedFuels.sort((a, b) => (b.definition.tier || 1) - (a.definition.tier || 1));

        return ownedFuels;
    },

    /**
     * Get fuel item definition
     * Bound to: engine.getFuelDefinition(fuelId)
     * @param {string} fuelId - The fuel item ID
     * @returns {object|null} Fuel definition or null
     */
    getFuelDefinition(fuelId) {
        if (!fuelId) return null;

        const itemDef = typeof ItemRegistry !== 'undefined'
            ? ItemRegistry.getItem(fuelId)
            : null;

        if (itemDef && itemDef.fuel === true) {
            return itemDef;
        }

        return null;
    },

    /**
     * Select fuel type for campfire
     * Bound to: engine.selectCampfireFuel(fuelId)
     * @param {string|null} fuelId - The fuel item ID to select, or null to deselect
     * @returns {object} Result with success status
     */
    selectCampfireFuel(fuelId) {
        const campfire = this.initCampfireState();

        if (fuelId === null) {
            // Deselect fuel
            campfire.selectedFuelId = null;
            console.log('🔥 Campfire fuel deselected');
            return { success: true, message: 'Fuel deselected' };
        }

        // Verify the fuel exists and player owns it
        const fuelDef = this.getFuelDefinition(fuelId);
        if (!fuelDef) {
            return { success: false, message: 'Invalid fuel type' };
        }

        // DualBankSystem stores stackable items as { itemId: quantity } (direct numbers)
        const bankQty = this.state.bank?.stackable?.[fuelId] || 0;
        if (bankQty <= 0) {
            return { success: false, message: 'No fuel in inventory' };
        }

        campfire.selectedFuelId = fuelId;
        console.log(`🔥 Selected campfire fuel: ${fuelDef.name}`);

        return { success: true, message: `Selected ${fuelDef.name}` };
    },

    /**
     * Consume one unit of selected fuel
     * Bound to: engine.consumeFuel()
     * @returns {object} Result with fuel stats if successful
     */
    consumeFuel() {
        const campfire = this.initCampfireState();

        if (!campfire.selectedFuelId) {
            return { success: false, reason: 'No fuel selected' };
        }

        const fuelId = campfire.selectedFuelId;
        const fuelDef = this.getFuelDefinition(fuelId);

        if (!fuelDef) {
            return { success: false, reason: 'Invalid fuel type' };
        }

        // Check bank quantity (DualBankSystem stores stackable as { itemId: quantity })
        const bankQty = this.state.bank?.stackable?.[fuelId] || 0;
        if (bankQty <= 0) {
            // Auto-switch to next available fuel
            const ownedFuels = this.getOwnedFuelItems();
            if (ownedFuels.length > 0) {
                campfire.selectedFuelId = ownedFuels[0].itemId;
                console.log(`🔥 Auto-switched to ${ownedFuels[0].definition.name}`);
                return this.consumeFuel(); // Retry with new fuel
            }

            return { success: false, reason: 'Out of fuel' };
        }

        // Remove fuel from bank (use InventorySystem's removeItemFromBank)
        this.removeItemFromBank(fuelId, 1);

        // Get fuel stats
        const fuelStats = fuelDef.fuelStats || {
            burnTime: 30,
            warmth: 5,
            efficiency: 1.0
        };

        // Add fuel to campfire
        campfire.fuelRemaining += fuelStats.burnTime;
        campfire.warmth = Math.max(campfire.warmth, fuelStats.warmth);
        campfire.efficiency = fuelStats.efficiency;
        campfire.active = true;

        console.log(`🔥 Added ${fuelDef.name} to campfire (+${fuelStats.burnTime}s, warmth: ${fuelStats.warmth}, efficiency: ${fuelStats.efficiency}x)`);

        return {
            success: true,
            fuelName: fuelDef.name,
            burnTime: fuelStats.burnTime,
            warmth: fuelStats.warmth,
            efficiency: fuelStats.efficiency,
            totalBurnTime: campfire.fuelRemaining
        };
    },

    /**
     * Process campfire tick during recovery
     * Bound to: engine.processCampfireTick(deltaTime)
     * @param {number} deltaTime - Time since last tick in milliseconds
     * @returns {object} Tick result with recovery amount
     */
    processCampfireTick(deltaTime) {
        const campfire = this.initCampfireState();
        const balance = CampfireSystem.CAMPFIRE_BALANCE;
        const now = Date.now();

        // Initialize lastTick if needed
        if (!campfire.lastTick) {
            campfire.lastTick = now;
        }

        const timeSinceLastTick = now - campfire.lastTick;

        // Only process once per tick interval
        if (timeSinceLastTick < balance.tickInterval) {
            return { processed: false };
        }

        campfire.lastTick = now;
        const ticksElapsed = Math.floor(timeSinceLastTick / balance.tickInterval);

        // Auto-start campfire if fuel is selected but fire isn't lit
        if (!campfire.active && campfire.selectedFuelId && campfire.fuelRemaining <= 0) {
            // Try to light the fire by consuming first fuel
            const igniteResult = this.consumeFuel();
            if (igniteResult.success) {
                console.log('🔥 Campfire auto-ignited!');
            }
        }

        // Process fuel consumption
        if (campfire.active && campfire.fuelRemaining > 0) {
            // Consume fuel time
            campfire.fuelRemaining -= balance.baseFuelConsumption * ticksElapsed;

            if (campfire.fuelRemaining <= 0) {
                campfire.fuelRemaining = 0;

                // Try to add more fuel automatically
                const refuelResult = this.consumeFuel();
                if (!refuelResult.success) {
                    // Out of fuel, start warmth decay
                    campfire.warmth = Math.max(0, campfire.warmth - balance.warmthDecayRate);

                    if (campfire.warmth <= 0) {
                        campfire.active = false;
                        console.log('🔥 Campfire extinguished (out of fuel)');
                    }
                }
            }
        } else if (campfire.warmth > 0) {
            // No active fuel, decay warmth
            campfire.warmth = Math.max(0, campfire.warmth - balance.warmthDecayRate);

            if (campfire.warmth <= 0) {
                campfire.active = false;
            }
        }

        // Calculate recovery amount based on warmth and efficiency
        let recoveryAmount = 0;

        if (campfire.warmth >= balance.minWarmthForRecovery) {
            // Base recovery modified by fuel efficiency
            recoveryAmount = balance.baseRecoveryPerTick * campfire.efficiency * ticksElapsed;
        }

        return {
            processed: true,
            ticksElapsed: ticksElapsed,
            fuelRemaining: campfire.fuelRemaining,
            warmth: campfire.warmth,
            efficiency: campfire.efficiency,
            recoveryAmount: recoveryAmount,
            active: campfire.active
        };
    },

    /**
     * Get current campfire stats
     * Bound to: engine.getCampfireStats()
     * @returns {object} Current campfire state and stats
     */
    getCampfireStats() {
        const campfire = this.initCampfireState();
        const selectedFuel = campfire.selectedFuelId
            ? this.getFuelDefinition(campfire.selectedFuelId)
            : null;

        const bankQty = campfire.selectedFuelId
            ? (this.state.bank?.stackable?.[campfire.selectedFuelId] || 0)
            : 0;

        return {
            active: campfire.active,
            selectedFuelId: campfire.selectedFuelId,
            selectedFuelName: selectedFuel?.name || 'None',
            selectedFuelIcon: selectedFuel?.icon || '🪵',
            fuelInBank: bankQty,
            fuelRemaining: campfire.fuelRemaining,
            warmth: campfire.warmth,
            efficiency: campfire.efficiency,
            fuelStats: selectedFuel?.fuelStats || null
        };
    },

    /**
     * Extinguish campfire
     * Bound to: engine.extinguishCampfire()
     */
    extinguishCampfire() {
        const campfire = this.initCampfireState();

        campfire.active = false;
        campfire.fuelRemaining = 0;
        campfire.warmth = 0;

        console.log('🔥 Campfire extinguished');

        return { success: true };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CampfireSystem;
}
