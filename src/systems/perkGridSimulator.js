/**
 * PERK GRID SIMULATOR
 *
 * Development tool for testing perk grid progression
 * - Simulate level 1-50 progression
 * - Test different medal placement strategies
 * - Analyze optimal configurations
 * - Balance testing and warnings
 */

const PerkGridSimulator = {
    /**
     * Simulate progression from level 1 to targetLevel
     */
    simulateProgression(targetLevel, strategy = 'balanced') {
        console.log(`🔬 Simulating progression to level ${targetLevel} using "${strategy}" strategy...`);

        // Save current state
        const savedState = this.saveState();

        // Reset grid
        this.resetGrid();

        const results = {
            levels: [],
            finalPower: 0,
            totalMedalsPlaced: 0,
            totalMedalsEarned: 0,
            warnings: [],
            strategy: strategy
        };

        // Simulate each level
        for (let level = 1; level <= targetLevel; level++) {
            const levelResult = this.simulateLevel(level, strategy);
            results.levels.push(levelResult);

            if (levelResult.warnings.length > 0) {
                results.warnings.push(...levelResult.warnings.map(w => ({ ...w, level })));
            }
        }

        results.finalPower = GameEngine.calculateGridPower();
        results.totalMedalsPlaced = Object.keys(GameEngine.state.perkGrid.medals).length;

        // Restore original state
        this.restoreState(savedState);

        console.log(`✅ Simulation complete. Final power: ${results.finalPower.toFixed(0)}`);

        return results;
    },

    /**
     * Simulate actions for a single level
     */
    simulateLevel(level, strategy) {
        const levelResult = {
            level: level,
            medalsEarned: this.calculateMedalsEarnedAtLevel(level),
            cellsUnlocked: 0,
            medalsPlaced: 0,
            power: 0,
            warnings: []
        };

        // Unlock cells based on level
        const targetUnlocks = this.calculateTargetUnlocksAtLevel(level);
        while (GameEngine.state.perkGrid.unlockedCells < targetUnlocks) {
            const cost = GameEngine.getNextUnlockCost();
            GameEngine.state.currencies.medals += cost; // Give medals for simulation
            const result = GameEngine.unlockGridCell();
            if (result.success) {
                levelResult.cellsUnlocked++;
            } else {
                break;
            }
        }

        // Place medals based on strategy
        const medalsToPlace = this.getMedalsForLevel(level, strategy);

        for (let medal of medalsToPlace) {
            const placement = this.findBestPlacement(medal.type, strategy);
            if (placement) {
                const result = GameEngine.placeMedalOnGrid(placement.row, placement.col, medal.type);
                if (result.success) {
                    levelResult.medalsPlaced++;
                    if (result.warnings) {
                        levelResult.warnings.push(...result.warnings);
                    }
                }
            }
        }

        levelResult.power = GameEngine.calculateGridPower();

        return levelResult;
    },

    /**
     * Calculate how many medals player would have earned by this level
     */
    calculateMedalsEarnedAtLevel(level) {
        // Example progression: 10 medals per level + exponential bonus
        return Math.floor(10 * level + Math.pow(level, 1.5));
    },

    /**
     * Calculate target number of unlocked cells at level
     */
    calculateTargetUnlocksAtLevel(level) {
        // Start with center 9, unlock more as level increases
        // Level 1: 9 cells
        // Level 10: 25 cells
        // Level 50: 81 cells
        const baseUnlocks = 9;
        const additionalUnlocks = Math.floor((level / 50) * 72); // 72 = 81 - 9
        return Math.min(81, baseUnlocks + additionalUnlocks);
    },

    /**
     * Get medals to place at this level
     */
    getMedalsForLevel(level, strategy) {
        const medals = [];

        // Different strategies for medal selection
        switch (strategy) {
            case 'balanced':
                // Mix of power and multiplier medals
                if (level % 3 === 0) medals.push({ type: 'power_medal_small' });
                if (level % 5 === 0) medals.push({ type: 'multiplier_medal_row' });
                if (level % 7 === 0) medals.push({ type: 'multiplier_medal_col' });
                break;

            case 'multiplier_focused':
                // Prioritize multipliers
                if (level % 2 === 0) medals.push({ type: 'multiplier_medal_row' });
                if (level % 3 === 0) medals.push({ type: 'multiplier_medal_col' });
                break;

            case 'power_focused':
                // Prioritize raw power
                if (level % 2 === 0) medals.push({ type: 'power_medal_small' });
                if (level % 5 === 0) medals.push({ type: 'power_medal_medium' });
                break;

            case 'equipment_first':
                // Fill equipment area first
                const equipmentCount = Object.values(GameEngine.state.perkGrid.medals)
                    .filter(m => GameEngine.isEquipmentCell(m.row, m.col)).length;

                if (equipmentCount < 9) {
                    medals.push({ type: 'equipment' });
                } else {
                    if (level % 3 === 0) medals.push({ type: 'power_medal_small' });
                }
                break;
        }

        return medals;
    },

    /**
     * Find best placement for a medal type
     */
    findBestPlacement(medalType, strategy) {
        const heatMap = GameEngine.getOptimalMedalPlacement(medalType);
        const cells = Object.values(heatMap);

        if (cells.length === 0) return null;

        // Sort by power gain
        cells.sort((a, b) => b.powerGain - a.powerGain);

        // Return best cell
        return cells[0];
    },

    /**
     * Compare multiple strategies
     */
    compareStrategies(targetLevel, strategies = ['balanced', 'multiplier_focused', 'power_focused', 'equipment_first']) {
        console.log(`📊 Comparing ${strategies.length} strategies for level ${targetLevel}...`);

        const results = {};

        for (let strategy of strategies) {
            results[strategy] = this.simulateProgression(targetLevel, strategy);
        }

        // Analyze results
        const analysis = {
            strategies: results,
            winner: null,
            comparison: []
        };

        let maxPower = 0;
        for (let [strategy, result] of Object.entries(results)) {
            if (result.finalPower > maxPower) {
                maxPower = result.finalPower;
                analysis.winner = strategy;
            }

            analysis.comparison.push({
                strategy,
                finalPower: result.finalPower,
                totalWarnings: result.warnings.length,
                medalsPlaced: result.totalMedalsPlaced
            });
        }

        // Sort by power
        analysis.comparison.sort((a, b) => b.finalPower - a.finalPower);

        console.log('📊 Strategy Comparison:');
        console.table(analysis.comparison);
        console.log(`🏆 Winner: ${analysis.winner} with ${maxPower.toFixed(0)} power`);

        return analysis;
    },

    /**
     * Test balance parameters
     */
    testBalance(params) {
        console.log('⚖️ Testing balance parameters...');

        const savedConfig = { ...GameEngine.state.perkGrid.config };

        // Apply test parameters
        if (params.baseUnlockCost) GameEngine.state.perkGrid.config.baseUnlockCost = params.baseUnlockCost;
        if (params.unlockCostMultiplier) GameEngine.state.perkGrid.config.unlockCostMultiplier = params.unlockCostMultiplier;
        if (params.maxCellPower) GameEngine.state.perkGrid.config.maxCellPower = params.maxCellPower;
        if (params.warningRowMultiplier) GameEngine.state.perkGrid.config.warningRowMultiplier = params.warningRowMultiplier;
        if (params.warningColMultiplier) GameEngine.state.perkGrid.config.warningColMultiplier = params.warningColMultiplier;

        // Run simulation
        const result = this.simulateProgression(50, 'balanced');

        // Restore original config
        GameEngine.state.perkGrid.config = savedConfig;

        console.log('⚖️ Balance test results:');
        console.log(`  Final Power: ${result.finalPower.toFixed(0)}`);
        console.log(`  Total Warnings: ${result.warnings.length}`);
        console.log(`  Medals Placed: ${result.totalMedalsPlaced}`);

        return {
            params,
            result,
            balanced: result.warnings.length < 10 && result.finalPower < 1000000
        };
    },

    /**
     * Analyze specific grid configuration
     */
    analyzeConfiguration(configName) {
        const config = GameEngine.state.perkGrid.savedConfigs[configName];

        if (!config) {
            console.error('Configuration not found:', configName);
            return null;
        }

        // Load configuration
        GameEngine.loadGridConfiguration(configName);

        const analysis = {
            name: configName,
            totalPower: GameEngine.calculateGridPower(),
            warnings: GameEngine.checkExponentialScaling(),
            stats: GameEngine.getGridStats(),
            multipliers: GameEngine.getGridMultipliers()
        };

        // Identify bottlenecks
        analysis.bottlenecks = this.findBottlenecks(analysis);

        // Suggest improvements
        analysis.suggestions = this.suggestImprovements(analysis);

        console.log('🔍 Configuration Analysis:', configName);
        console.table(analysis.stats);
        console.log('Warnings:', analysis.warnings.length);
        console.log('Bottlenecks:', analysis.bottlenecks);
        console.log('Suggestions:', analysis.suggestions);

        return analysis;
    },

    /**
     * Find bottlenecks in current configuration
     */
    findBottlenecks(analysis) {
        const bottlenecks = [];

        // Check for unused high-multiplier rows/columns
        for (let i = 0; i < 9; i++) {
            if (analysis.multipliers.rowMultipliers[i] < 1.5) {
                bottlenecks.push(`Row ${i} has low multiplier (${analysis.multipliers.rowMultipliers[i].toFixed(2)}x)`);
            }
            if (analysis.multipliers.colMultipliers[i] < 1.5) {
                bottlenecks.push(`Column ${i} has low multiplier (${analysis.multipliers.colMultipliers[i].toFixed(2)}x)`);
            }
        }

        // Check for empty high-value cells
        const calc = analysis.multipliers;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellKey = `${row},${col}`;
                if (!GameEngine.state.perkGrid.medals[cellKey] && GameEngine.isGridCellUnlocked(row, col)) {
                    const potentialValue = calc.rowMultipliers[row] * calc.colMultipliers[col];
                    if (potentialValue > 5) {
                        bottlenecks.push(`Empty cell at (${row}, ${col}) has ${potentialValue.toFixed(2)}x potential`);
                    }
                }
            }
        }

        return bottlenecks;
    },

    /**
     * Suggest improvements
     */
    suggestImprovements(analysis) {
        const suggestions = [];

        // Suggest placing medals in high-multiplier rows/columns
        const calc = analysis.multipliers;
        let maxRowMult = 0;
        let maxColMult = 0;
        let maxRow = 0;
        let maxCol = 0;

        for (let i = 0; i < 9; i++) {
            if (calc.rowMultipliers[i] > maxRowMult) {
                maxRowMult = calc.rowMultipliers[i];
                maxRow = i;
            }
            if (calc.colMultipliers[i] > maxColMult) {
                maxColMult = calc.colMultipliers[i];
                maxCol = i;
            }
        }

        suggestions.push(`Consider placing power medals in row ${maxRow} (${maxRowMult.toFixed(2)}x) or column ${maxCol} (${maxColMult.toFixed(2)}x)`);

        // Check if equipment area is full
        const equipmentCount = Object.values(GameEngine.state.perkGrid.medals)
            .filter(m => GameEngine.isEquipmentCell(m.row, m.col)).length;

        if (equipmentCount < 9) {
            suggestions.push(`Equipment area is only ${equipmentCount}/9 filled. Fill it to maximize synergies.`);
        }

        // Check warning count
        if (analysis.warnings.length > 0) {
            suggestions.push(`You have ${analysis.warnings.length} scaling warnings. Consider rebalancing.`);
        }

        return suggestions;
    },

    /**
     * Generate progression report
     */
    generateProgressionReport(targetLevel) {
        const results = this.simulateProgression(targetLevel, 'balanced');

        let report = `
==============================================
PERK GRID PROGRESSION REPORT
==============================================
Target Level: ${targetLevel}
Strategy: ${results.strategy}

SUMMARY:
- Final Power: ${results.finalPower.toFixed(0)}
- Medals Placed: ${results.totalMedalsPlaced}
- Total Warnings: ${results.warnings.length}

LEVEL BREAKDOWN:
`;

        // Show every 5th level
        for (let i = 0; i < results.levels.length; i += 5) {
            const level = results.levels[i];
            report += `Level ${level.level}: Power ${level.power.toFixed(0)}, Medals ${level.medalsPlaced}, Unlocks ${level.cellsUnlocked}\n`;
        }

        if (results.warnings.length > 0) {
            report += `\nWARNINGS:\n`;
            results.warnings.slice(0, 5).forEach(w => {
                report += `- Level ${w.level}: ${w.message}\n`;
            });
            if (results.warnings.length > 5) {
                report += `... and ${results.warnings.length - 5} more warnings\n`;
            }
        }

        report += `
==============================================
`;

        console.log(report);
        return report;
    },

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    resetGrid() {
        GameEngine.state.perkGrid.medals = {};
        GameEngine.state.perkGrid.unlockedCells = 9; // Start with center unlocked
        GameEngine.calculateGridPower();
    },

    saveState() {
        return {
            medals: { ...GameEngine.state.perkGrid.medals },
            unlockedCells: GameEngine.state.perkGrid.unlockedCells,
            config: { ...GameEngine.state.perkGrid.config }
        };
    },

    restoreState(state) {
        GameEngine.state.perkGrid.medals = state.medals;
        GameEngine.state.perkGrid.unlockedCells = state.unlockedCells;
        GameEngine.state.perkGrid.config = state.config;
        GameEngine.calculateGridPower();
    }
};
