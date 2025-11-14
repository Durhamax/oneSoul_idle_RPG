/**
 * COMPLETE PERK GRID SYSTEM WITH ROW/COLUMN MULTIPLIERS
 *
 * Grid Layout (0-indexed 5x5):
 * [0,0] [0,1] [0,2] [0,3] [0,4]
 * [1,0] [1,1] [1,2] [1,3] [1,4]
 * [2,0] [2,1] [2,2] [2,3] [2,4]
 * [3,0] [3,1] [3,2] [3,3] [3,4]
 * [4,0] [4,1] [4,2] [4,3] [4,4]
 *
 * Middle 3x3 (equipment slots) are positions [1,1] through [3,3]
 *
 * Mechanics:
 * - Each tile contributes perks to its row AND column
 * - Same perk types in a row multiply together
 * - Same perk types in a column multiply together
 * - Final perk value = sum of all row totals + sum of all column totals
 */

const PerkGridSystem = {
    // Equipment slot mappings for middle 3x3
    equipmentSlotMap: {
        '1_1': 'weapon',
        '1_2': 'helmet',
        '1_3': 'back',
        '2_1': 'gloves',
        '2_2': 'chest',
        '2_3': 'neck',
        '3_1': 'boots',
        '3_2': 'legs',
        '3_3': 'ring'
    },

    /**
     * Initialize perk grid system on GameEngine
     */
    init(engine) {
        // Bind all methods
        engine.calculateGridPerks = this.calculateGridPerks.bind(engine);
        engine.placeMedalOnGrid = this.placeMedalOnGrid.bind(engine);
        engine.removeMedalFromGrid = this.removeMedalFromGrid.bind(engine);
        engine.getMedalAtCell = this.getMedalAtCell.bind(engine);
        engine.updateEquipmentCells = this.updateEquipmentCells.bind(engine);

        // Legacy compatibility
        engine.calculateGridBonuses = this.calculateGridPerks.bind(engine);
        engine.getGridStats = this.calculateGridPerks.bind(engine);

        console.log('✅ Perk Grid System initialized (5x5 with row/column multipliers)');
    },

    /**
     * Calculate all perk values from the grid
     * This is the main function that StatCalculator will call
     */
    calculateGridPerks(state) {
        const grid = PerkGridSystem.buildCompleteGrid(state || this.state);
        const rowMultipliers = PerkGridSystem.calculateRowMultipliers(grid);
        const columnMultipliers = PerkGridSystem.calculateColumnMultipliers(grid);
        const finalPerks = PerkGridSystem.combinePerkMultipliers(rowMultipliers, columnMultipliers);

        return {
            perks: finalPerks,
            rowTotals: rowMultipliers,
            columnTotals: columnMultipliers,
            gridData: grid,
            summary: PerkGridSystem.generateSummary(finalPerks)
        };
    },

    /**
     * Build complete 5x5 grid including equipment perks in middle 3x3
     */
    buildCompleteGrid(state) {
        const grid = Array(5).fill(null).map(() => Array(5).fill(null));

        // Fill placed medals
        const placedMedals = state.perkGrid?.placedMedals || {};
        Object.entries(placedMedals).forEach(([key, data]) => {
            const parts = key.split(/[_,]/); // Support both "row_col" and "row,col" formats
            const row = parseInt(parts[0]);
            const col = parseInt(parts[1]);

            if (row >= 0 && row < 5 && col >= 0 && col < 5) {
                grid[row][col] = {
                    type: 'medal',
                    source: data.medal || data,
                    perks: PerkGridSystem.extractPerks(data.medal || data)
                };
            }
        });

        // Fill middle 3x3 with equipment perks (only if no medal placed)
        for (let row = 1; row <= 3; row++) {
            for (let col = 1; col <= 3; col++) {
                if (!grid[row][col]) { // Only if no medal placed
                    const slotKey = `${row}_${col}`;
                    const equipSlot = PerkGridSystem.equipmentSlotMap[slotKey];
                    const equipmentId = state.equipment?.[equipSlot];

                    if (equipmentId) {
                        const equipment = state.definitions?.comprehensiveItems?.[equipmentId] ||
                                        state.definitions?.items?.[equipmentId] ||
                                        (typeof GameEngine !== 'undefined' ?
                                            GameEngine.definitions?.comprehensiveItems?.[equipmentId] ||
                                            GameEngine.definitions?.items?.[equipmentId] : null);

                        if (equipment) {
                            grid[row][col] = {
                                type: 'equipment',
                                source: equipment,
                                slot: equipSlot,
                                perks: PerkGridSystem.extractEquipmentPerks(equipment)
                            };
                        }
                    }
                }
            }
        }

        return grid;
    },

    /**
     * Extract perks from a medal
     * Perks should be in format: { type: 'attackDamage', value: 0.01 }
     */
    extractPerks(medal) {
        if (!medal || !medal.perks) return [];

        return medal.perks.map(perk => ({
            type: PerkGridSystem.normalizePerkType(perk.stat || perk.type),
            value: PerkGridSystem.normalizePerkValue(perk.value),
            name: perk.name || perk.stat || perk.type,
            source: 'medal'
        }));
    },

    /**
     * Extract perks from equipment
     * Convert equipment stats to perk format
     */
    extractEquipmentPerks(equipment) {
        if (!equipment) return [];

        const perks = [];
        const stats = equipment.combatStats || equipment.stats || {};

        // Mapping of equipment stats to perk types with scaling factors
        const statToPerk = {
            'damage': { type: 'attackDamage', scale: 0.001 },
            'attackDamage': { type: 'attackDamage', scale: 0.001 },
            'attackInterval': { type: 'attackSpeed', scale: -0.0001 }, // Negative because lower is better
            'attackSpeed': { type: 'attackSpeed', scale: 0.0001 },
            'hitChance': { type: 'accuracy', scale: 0.0005 },
            'accuracy': { type: 'accuracy', scale: 0.0005 },
            'critChance': { type: 'criticalChance', scale: 0.0005 },
            'criticalChance': { type: 'criticalChance', scale: 0.0005 },
            'critImpact': { type: 'criticalDamage', scale: 0.001 },
            'criticalDamage': { type: 'criticalDamage', scale: 0.001 },
            'healthBonus': { type: 'maxHealth', scale: 0.0001 },
            'maxHealth': { type: 'maxHealth', scale: 0.0001 },
            'damageReduction': { type: 'damageReduction', scale: 0.0005 },
            'absoluteDefense': { type: 'damageReduction', scale: 0.0003 },
            'evasion': { type: 'evasion', scale: 0.0005 },
        };

        Object.entries(stats).forEach(([stat, value]) => {
            if (statToPerk[stat] && value > 0) {
                perks.push({
                    type: statToPerk[stat].type,
                    value: Math.abs(value * statToPerk[stat].scale), // Scale to perk range (0.001-0.1)
                    name: stat,
                    source: 'equipment'
                });
            }
        });

        return perks;
    },

    /**
     * Calculate row multipliers
     * Same perks in a row multiply together
     */
    calculateRowMultipliers(grid) {
        const rowPerks = {};

        for (let row = 0; row < 5; row++) {
            const perksInRow = {};

            // Collect all perks in this row
            for (let col = 0; col < 5; col++) {
                const tile = grid[row][col];
                if (!tile?.perks) continue;

                tile.perks.forEach(perk => {
                    if (!perksInRow[perk.type]) {
                        perksInRow[perk.type] = [];
                    }
                    perksInRow[perk.type].push(perk.value);
                });
            }

            // Multiply same perks together
            Object.entries(perksInRow).forEach(([perkType, values]) => {
                // Multiplicative formula: (1 + v1) * (1 + v2) * ... - 1
                const multiplied = values.reduce((acc, val) => acc * (1 + val), 1) - 1;

                if (!rowPerks[perkType]) {
                    rowPerks[perkType] = [];
                }
                rowPerks[perkType].push({
                    row: row,
                    value: multiplied,
                    count: values.length,
                    baseValues: values
                });
            });
        }

        return rowPerks;
    },

    /**
     * Calculate column multipliers
     * Same perks in a column multiply together
     */
    calculateColumnMultipliers(grid) {
        const columnPerks = {};

        for (let col = 0; col < 5; col++) {
            const perksInColumn = {};

            // Collect all perks in this column
            for (let row = 0; row < 5; row++) {
                const tile = grid[row][col];
                if (!tile?.perks) continue;

                tile.perks.forEach(perk => {
                    if (!perksInColumn[perk.type]) {
                        perksInColumn[perk.type] = [];
                    }
                    perksInColumn[perk.type].push(perk.value);
                });
            }

            // Multiply same perks together
            Object.entries(perksInColumn).forEach(([perkType, values]) => {
                // Multiplicative formula: (1 + v1) * (1 + v2) * ... - 1
                const multiplied = values.reduce((acc, val) => acc * (1 + val), 1) - 1;

                if (!columnPerks[perkType]) {
                    columnPerks[perkType] = [];
                }
                columnPerks[perkType].push({
                    column: col,
                    value: multiplied,
                    count: values.length,
                    baseValues: values
                });
            });
        }

        return columnPerks;
    },

    /**
     * Combine row and column multipliers into final perk values
     */
    combinePerkMultipliers(rowPerks, columnPerks) {
        const finalPerks = {};

        // Sum all row contributions
        Object.entries(rowPerks).forEach(([perkType, rows]) => {
            const rowSum = rows.reduce((sum, r) => sum + r.value, 0);
            finalPerks[perkType] = (finalPerks[perkType] || 0) + rowSum;
        });

        // Sum all column contributions
        Object.entries(columnPerks).forEach(([perkType, columns]) => {
            const colSum = columns.reduce((sum, c) => sum + c.value, 0);
            finalPerks[perkType] = (finalPerks[perkType] || 0) + colSum;
        });

        // Convert to percentages for display (multiply by 100)
        Object.keys(finalPerks).forEach(perkType => {
            finalPerks[perkType] = finalPerks[perkType] * 100; // Convert to percentage
        });

        return finalPerks;
    },

    /**
     * Normalize perk types to match stat system
     */
    normalizePerkType(type) {
        const mapping = {
            'combat_damage': 'attackDamage',
            'damage': 'attackDamage',
            'combat_attack_speed': 'attackSpeed',
            'attackSpeed': 'attackSpeed',
            'combat_crit_chance': 'criticalChance',
            'critChance': 'criticalChance',
            'combat_crit_damage': 'criticalDamage',
            'critDamage': 'criticalDamage',
            'mining_speed': 'miningSpeed',
            'logging_speed': 'woodcuttingSpeed',
            'woodcutting_speed': 'woodcuttingSpeed',
            'fishing_speed': 'fishingSpeed',
            'str': 'attackDamage',
            'dex': 'attackSpeed',
            'int': 'criticalDamage',
            'con': 'maxHealth',
        };
        return mapping[type] || type;
    },

    /**
     * Ensure perk values are in correct range (0.001 to 0.1)
     */
    normalizePerkValue(value) {
        // Clamp between 0.001 and 0.1
        return Math.max(0.001, Math.min(0.1, Math.abs(value)));
    },

    /**
     * Generate summary statistics
     */
    generateSummary(perks) {
        const summary = {
            totalPerks: Object.keys(perks).length,
            strongestPerk: null,
            totalBonus: 0
        };

        let maxValue = 0;
        Object.entries(perks).forEach(([type, value]) => {
            summary.totalBonus += value;
            if (value > maxValue) {
                maxValue = value;
                summary.strongestPerk = { type, value };
            }
        });

        return summary;
    },

    /**
     * Place a medal on a grid cell
     */
    placeMedalOnGrid(row, col, medalIdOrObject) {
        if (!this.state.perkGrid) {
            this.state.perkGrid = { placedMedals: {} };
        }

        // Check bounds
        if (row < 0 || row >= 5 || col < 0 || col >= 5) {
            return { success: false, reason: "Cell out of bounds" };
        }

        // Check if equipment cell - can place medals there, they override equipment
        const cellKey = `${row}_${col}`;

        // Check if cell already has a medal
        if (this.state.perkGrid.placedMedals[cellKey]) {
            return { success: false, reason: "Cell already has a medal - remove it first" };
        }

        // Determine if this is a crafted medal (object) or legacy medal (ID)
        const isCraftedMedal = typeof medalIdOrObject === 'object';

        if (isCraftedMedal) {
            // Crafted medal - store the full medal object
            this.state.perkGrid.placedMedals[cellKey] = {
                medal: medalIdOrObject,
                row: row,
                col: col,
                placedAt: Date.now()
            };

            // Remove from crafted medals inventory
            const medalIndex = this.state.craftedMedals?.findIndex(m => m.id === medalIdOrObject.id);
            if (medalIndex !== -1) {
                this.state.craftedMedals.splice(medalIndex, 1);
            }
        } else {
            // Legacy medal - validate it exists in definitions
            const medalDef = this.definitions.medals?.[medalIdOrObject];
            if (!medalDef) {
                return { success: false, reason: "Invalid medal" };
            }

            this.state.perkGrid.placedMedals[cellKey] = {
                medalId: medalIdOrObject,
                medal: medalDef,
                row: row,
                col: col,
                placedAt: Date.now()
            };
        }

        console.log(`✅ Placed medal at [${row},${col}]`);
        return { success: true };
    },

    /**
     * Remove a medal from a grid cell
     */
    removeMedalFromGrid(row, col) {
        if (!this.state.perkGrid || !this.state.perkGrid.placedMedals) {
            return { success: false, reason: "No medals placed" };
        }

        const cellKey = `${row}_${col}`;
        const placedData = this.state.perkGrid.placedMedals[cellKey];

        if (!placedData) {
            return { success: false, reason: "No medal at this position" };
        }

        // If it's a crafted medal, return it to inventory
        if (placedData.medal && placedData.medal.id) {
            if (!this.state.craftedMedals) {
                this.state.craftedMedals = [];
            }
            this.state.craftedMedals.push(placedData.medal);
        }

        delete this.state.perkGrid.placedMedals[cellKey];

        console.log(`🗑️ Removed medal from [${row},${col}]`);
        return { success: true, medal: placedData };
    },

    /**
     * Get medal placed at a specific cell
     */
    getMedalAtCell(row, col) {
        if (!this.state.perkGrid || !this.state.perkGrid.placedMedals) {
            return null;
        }

        const cellKey = `${row}_${col}`;
        return this.state.perkGrid.placedMedals[cellKey] || null;
    },

    /**
     * Update equipment cells with current equipped items
     * (Legacy compatibility - now handled automatically in buildCompleteGrid)
     */
    updateEquipmentCells() {
        // No longer needed - buildCompleteGrid handles this dynamically
        // Kept for backwards compatibility
        console.log('📋 Equipment cells updated (handled dynamically)');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkGridSystem;
}
