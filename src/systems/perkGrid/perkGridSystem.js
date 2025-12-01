/**
 * PERK GRID SYSTEM
 * Manages the 7x7 perk grid state and medal placement
 */

const PerkGridSystemNew = {

    // Legacy compatibility - old 5x5 system embedded equipment in center 3x3
    // New 7x7 system does not embed equipment, but UI may reference this
    equipmentSlotMap: {},

    init(engine) {
        if (!engine.state.perkGrid) {
            engine.state.perkGrid = {
                placedMedals: {},
                cachedMultipliers: null
            };
        }

        // Bind methods
        engine.placeMedal = this.placeMedal.bind(engine);
        engine.removeMedal = this.removeMedal.bind(engine);
        engine.swapMedals = this.swapMedals.bind(engine);
        engine.getMedalAt = this.getMedalAt.bind(engine);
        engine.isTileUnlocked = this.isTileUnlocked.bind(engine);
        engine.getUnlockedTileCount = this.getUnlockedTileCount.bind(engine);
        engine.getUnlockedTiles = this.getUnlockedTiles.bind(engine);
        engine.getPerkMultipliers = this.getPerkMultipliers.bind(engine);
        engine.getPerkBreakdown = this.getPerkBreakdown.bind(engine);
        engine.getActivePerkSummary = this.getActivePerkSummary.bind(engine);
        engine.getGridEdgeTotals = this.getGridEdgeTotals.bind(engine);
        engine.invalidatePerkCache = this.invalidatePerkCache.bind(engine);
        engine.getGridState = this.getGridState.bind(engine);
        engine.placeMedalFromInventory = this.placeMedalFromInventory.bind(engine);
        engine.returnMedalToInventory = this.returnMedalToInventory.bind(engine);

        // Legacy compatibility - old perk grid used these methods
        engine.calculateGridPerks = this.calculateGridPerksLegacy.bind(engine);
        engine.calculateGridBonuses = this.calculateGridPerksLegacy.bind(engine);
        engine.getGridStats = this.calculateGridPerksLegacy.bind(engine);
        engine.placeMedalOnGrid = this.placeMedalOnGridLegacy.bind(engine);
        engine.removeMedalFromGrid = this.removeMedalFromGridLegacy.bind(engine);
        engine.getMedalAtCell = this.getMedalAt.bind(engine);
        engine.updateEquipmentCells = this.updateEquipmentCells.bind(engine);

        console.log('[PerkGridSystem] Initialized (7x7 grid)');
    },

    /**
     * Place a medal on the grid
     * @param {number} row - Row index (0-6)
     * @param {number} col - Column index (0-6)
     * @param {Object} medal - Medal object
     * @returns {Object} { success, error? }
     */
    placeMedal(row, col, medal) {
        const position = `${row}_${col}`;

        if (row < 0 || row >= GRID_CONFIG.size || col < 0 || col >= GRID_CONFIG.size) {
            return { success: false, error: 'Invalid grid position' };
        }

        if (!this.isTileUnlocked(row, col)) {
            return { success: false, error: 'Tile not unlocked' };
        }

        if (this.state.perkGrid.placedMedals[position]) {
            return { success: false, error: 'Tile already occupied' };
        }

        if (!medal || !medal.id || !medal.perks) {
            return { success: false, error: 'Invalid medal' };
        }

        this.state.perkGrid.placedMedals[position] = medal;
        this.invalidatePerkCache();

        // Recompile all player stats with new perk configuration
        if (typeof this.compilePlayerStats === 'function') {
            this.compilePlayerStats();
        }

        return { success: true };
    },

    /**
     * Place medal from inventory onto grid
     * @param {string} medalId - Medal ID from inventory
     * @param {number} row - Target row
     * @param {number} col - Target column
     * @returns {Object} { success, error? }
     */
    placeMedalFromInventory(medalId, row, col) {
        const inventory = this.state.medalInventory;
        const medalIndex = inventory.medals.findIndex(m => m.id === medalId);

        if (medalIndex === -1) {
            return { success: false, error: 'Medal not found in inventory' };
        }

        const medal = inventory.medals[medalIndex];
        const result = this.placeMedal(row, col, medal);

        if (result.success) {
            inventory.medals.splice(medalIndex, 1);
        }

        return result;
    },

    /**
     * Remove a medal from the grid
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object|null} Removed medal or null
     */
    removeMedal(row, col) {
        const position = `${row}_${col}`;
        const medal = this.state.perkGrid.placedMedals[position];

        if (!medal) return null;

        delete this.state.perkGrid.placedMedals[position];
        this.invalidatePerkCache();

        // Recompile stats after medal removal
        if (typeof this.compilePlayerStats === 'function') {
            this.compilePlayerStats();
        }

        return medal;
    },

    /**
     * Return medal from grid to inventory
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object} { success, medal?, error? }
     */
    returnMedalToInventory(row, col) {
        const medal = this.removeMedal(row, col);

        if (!medal) {
            return { success: false, error: 'No medal at position' };
        }

        const inventory = this.state.medalInventory;

        if (inventory.medals.length >= inventory.capacity) {
            // Put it back if inventory full
            this.state.perkGrid.placedMedals[`${row}_${col}`] = medal;
            this.invalidatePerkCache();
            return { success: false, error: 'Inventory full' };
        }

        inventory.medals.push(medal);
        return { success: true, medal };
    },

    /**
     * Swap two medals on the grid
     * @param {number} row1 - First row
     * @param {number} col1 - First column
     * @param {number} row2 - Second row
     * @param {number} col2 - Second column
     * @returns {Object} { success, error? }
     */
    swapMedals(row1, col1, row2, col2) {
        if (!this.isTileUnlocked(row1, col1) || !this.isTileUnlocked(row2, col2)) {
            return { success: false, error: 'One or both tiles not unlocked' };
        }

        const pos1 = `${row1}_${col1}`;
        const pos2 = `${row2}_${col2}`;

        const medal1 = this.state.perkGrid.placedMedals[pos1];
        const medal2 = this.state.perkGrid.placedMedals[pos2];

        if (medal1) {
            this.state.perkGrid.placedMedals[pos2] = medal1;
        } else {
            delete this.state.perkGrid.placedMedals[pos2];
        }

        if (medal2) {
            this.state.perkGrid.placedMedals[pos1] = medal2;
        } else {
            delete this.state.perkGrid.placedMedals[pos1];
        }

        this.invalidatePerkCache();

        // Recompile stats after swap
        if (typeof this.compilePlayerStats === 'function') {
            this.compilePlayerStats();
        }

        return { success: true };
    },

    /**
     * Get medal at position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object|null} Medal or null
     */
    getMedalAt(row, col) {
        return this.state.perkGrid.placedMedals[`${row}_${col}`] || null;
    },

    /**
     * Check if tile is unlocked
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} Is unlocked
     */
    isTileUnlocked(row, col) {
        const unlockedCount = this.getUnlockedTileCount();
        const tileIndex = UNLOCK_ORDER.findIndex(t => t.row === row && t.col === col);
        return tileIndex !== -1 && tileIndex < unlockedCount;
    },

    /**
     * Get number of unlocked tiles
     * @returns {number} Unlocked count
     */
    getUnlockedTileCount() {
        const level = this.state.characterLevel?.level || 1;
        return Math.min(
            GRID_CONFIG.totalTiles,
            GRID_CONFIG.startingTiles + Math.floor(level / GRID_CONFIG.unlockInterval)
        );
    },

    /**
     * Get array of unlocked tile positions
     * @returns {Array} Array of { row, col }
     */
    getUnlockedTiles() {
        return UNLOCK_ORDER.slice(0, this.getUnlockedTileCount());
    },

    /**
     * Get perk multipliers (cached)
     * @returns {Object} Multipliers
     */
    getPerkMultipliers() {
        // Ensure perkGrid state exists
        if (!this.state.perkGrid) {
            this.state.perkGrid = {
                placedMedals: {},
                cachedMultipliers: null
            };
        }

        if (this.state.perkGrid.cachedMultipliers) {
            return this.state.perkGrid.cachedMultipliers;
        }

        const multipliers = PerkGridCalculator.calculateMultipliers(this.state.perkGrid);
        this.state.perkGrid.cachedMultipliers = multipliers;
        return multipliers;
    },

    /**
     * Get stat breakdown
     * @param {string} stat - Stat name
     * @returns {Object} Breakdown
     */
    getPerkBreakdown(stat) {
        return PerkGridCalculator.getStatBreakdown(stat, this.state.perkGrid.placedMedals);
    },

    /**
     * Get active perk summary
     * @returns {Object} Summary by category
     */
    getActivePerkSummary() {
        return PerkGridCalculator.getActiveSummary(this.state.perkGrid.placedMedals);
    },

    /**
     * Get grid edge totals
     * @returns {Object} { rows, columns }
     */
    getGridEdgeTotals() {
        return PerkGridCalculator.getEdgeTotals(this.state.perkGrid.placedMedals);
    },

    /**
     * Invalidate multiplier cache
     */
    invalidatePerkCache() {
        this.state.perkGrid.cachedMultipliers = null;
    },

    /**
     * Get complete grid state for UI
     * @returns {Object} Grid state
     */
    getGridState() {
        // Ensure perkGrid state exists
        if (!this.state.perkGrid) {
            this.state.perkGrid = {
                placedMedals: {},
                cachedMultipliers: null
            };
        }
        const unlockedCount = this.getUnlockedTileCount();
        const placedCount = Object.keys(this.state.perkGrid.placedMedals || {}).length;
        const level = this.state.characterLevel?.level || 1;
        const nextUnlockLevel = unlockedCount < GRID_CONFIG.totalTiles
            ? (unlockedCount) * GRID_CONFIG.unlockInterval + 1
            : null;

        // Build tile states
        const tiles = [];
        for (let row = 0; row < GRID_CONFIG.size; row++) {
            for (let col = 0; col < GRID_CONFIG.size; col++) {
                const position = `${row}_${col}`;
                const medal = this.state.perkGrid.placedMedals[position];
                const unlockIndex = UNLOCK_ORDER.findIndex(t => t.row === row && t.col === col);
                const isUnlocked = unlockIndex !== -1 && unlockIndex < unlockedCount;
                const unlockLevel = unlockIndex !== -1 ? unlockIndex * GRID_CONFIG.unlockInterval + 1 : null;

                tiles.push({
                    row,
                    col,
                    position,
                    isUnlocked,
                    unlockIndex,
                    unlockLevel,
                    medal,
                    isEmpty: isUnlocked && !medal
                });
            }
        }

        return {
            size: GRID_CONFIG.size,
            totalTiles: GRID_CONFIG.totalTiles,
            unlockedCount,
            placedCount,
            emptyUnlockedCount: unlockedCount - placedCount,
            characterLevel: level,
            nextUnlockLevel,
            tiles,
            edgeTotals: this.getGridEdgeTotals(),
            activeSummary: this.getActivePerkSummary()
        };
    },

    // ========== LEGACY COMPATIBILITY METHODS ==========

    /**
     * Legacy method - returns grid calculation in old format
     * Used by old UI components and stat calculators
     */
    calculateGridPerksLegacy(state) {
        const multipliers = this.getPerkMultipliers();
        const summary = this.getActivePerkSummary();
        const edgeTotals = this.getGridEdgeTotals();

        // Convert multipliers to percentage format for old UI
        const perks = {};
        for (const [stat, mult] of Object.entries(multipliers)) {
            if (mult !== 1.0) {
                perks[stat] = (mult - 1.0) * 100; // Convert to percentage
            }
        }

        // Build grid data in old format (7x7 instead of 5x5)
        const gridData = [];
        for (let row = 0; row < GRID_CONFIG.size; row++) {
            gridData[row] = [];
            for (let col = 0; col < GRID_CONFIG.size; col++) {
                const medal = this.state.perkGrid.placedMedals[`${row}_${col}`];
                if (medal) {
                    gridData[row][col] = {
                        type: 'medal',
                        source: medal,
                        perks: medal.perks.map(p => ({
                            type: p.stat,
                            value: p.value,
                            name: PERK_STAT_POOL[p.stat]?.name || p.stat,
                            source: 'medal'
                        }))
                    };
                } else {
                    gridData[row][col] = null;
                }
            }
        }

        // Calculate total bonus
        let totalBonus = 0;
        let strongestPerk = null;
        let maxValue = 0;
        for (const [type, value] of Object.entries(perks)) {
            totalBonus += value;
            if (value > maxValue) {
                maxValue = value;
                strongestPerk = { type, value };
            }
        }

        return {
            perks,
            rowTotals: {}, // New system doesn't track per-row totals the same way
            columnTotals: {},
            gridData,
            summary: {
                totalPerks: Object.keys(perks).length,
                strongestPerk,
                totalBonus
            }
        };
    },

    /**
     * Legacy method - place medal on grid (old API)
     */
    placeMedalOnGridLegacy(row, col, medalIdOrObject) {
        if (typeof medalIdOrObject === 'object' && medalIdOrObject.id) {
            // New medal object format
            return this.placeMedal(row, col, medalIdOrObject);
        }
        // Old format - just return error, shouldn't be used
        return { success: false, reason: 'Legacy medal format not supported' };
    },

    /**
     * Legacy method - remove medal from grid (old API)
     */
    removeMedalFromGridLegacy(row, col) {
        const medal = this.removeMedal(row, col);
        if (medal) {
            // Return medal to inventory
            if (this.state.medalInventory) {
                this.state.medalInventory.medals.push(medal);
            }
            return { success: true, medal: { medal } };
        }
        return { success: false, reason: 'No medal at this position' };
    },

    /**
     * Legacy method - no-op since new 7x7 system doesn't embed equipment
     * Old 5x5 system had equipment in center 3x3
     */
    updateEquipmentCells() {
        // No-op - new 7x7 grid doesn't embed equipment slots
        // Equipment is now fully managed by the equipment system
    }
};

// Global alias for legacy compatibility
// Old UI references PerkGridSystem directly
const PerkGridSystem = PerkGridSystemNew;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkGridSystemNew;
}
