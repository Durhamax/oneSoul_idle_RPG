/**
 * PERK GRID CALCULATOR
 *
 * Calculates stat multipliers from the 7x7 perk grid.
 *
 * Formula:
 * - Each row: multiply perks -> convert to bonus (product - 1)
 * - Each column: multiply perks -> convert to bonus (product - 1)
 * - Sum all row bonuses + all column bonuses
 * - Final multiplier = 1.0 + total bonus
 */

const PerkGridCalculator = {

    /**
     * Calculate all perk multipliers from the grid
     * @param {Object} perkGrid - Grid state with placedMedals
     * @returns {Object} Multipliers for all stats
     */
    calculateMultipliers(perkGrid) {
        const placedMedals = perkGrid?.placedMedals || {};
        const multipliers = this.getDefaultMultipliers();
        const statsOnGrid = this.getStatsOnGrid(placedMedals);

        for (const stat of statsOnGrid) {
            multipliers[stat] = this.calculateStatMultiplier(stat, placedMedals);
        }

        return multipliers;
    },

    /**
     * Calculate multiplier for a single stat
     * @param {string} stat - Stat name
     * @param {Object} placedMedals - Placed medals keyed by "row_col"
     * @returns {number} Final multiplier
     */
    calculateStatMultiplier(stat, placedMedals) {
        const gridSize = GRID_CONFIG.size;
        let totalRowBonus = 0;
        let totalColBonus = 0;

        // Row bonuses
        for (let row = 0; row < gridSize; row++) {
            let rowProduct = 1.0;

            for (let col = 0; col < gridSize; col++) {
                const medal = placedMedals[`${row}_${col}`];
                if (medal) {
                    const perkValue = this.getMedalPerkValue(medal, stat);
                    if (perkValue > 0) {
                        rowProduct *= (1 + perkValue);
                    }
                }
            }

            totalRowBonus += (rowProduct - 1.0);
        }

        // Column bonuses
        for (let col = 0; col < gridSize; col++) {
            let colProduct = 1.0;

            for (let row = 0; row < gridSize; row++) {
                const medal = placedMedals[`${row}_${col}`];
                if (medal) {
                    const perkValue = this.getMedalPerkValue(medal, stat);
                    if (perkValue > 0) {
                        colProduct *= (1 + perkValue);
                    }
                }
            }

            totalColBonus += (colProduct - 1.0);
        }

        return 1.0 + totalRowBonus + totalColBonus;
    },

    /**
     * Get perk value for a stat from a medal
     * @param {Object} medal - Medal object
     * @param {string} stat - Stat name
     * @returns {number} Perk value or 0
     */
    getMedalPerkValue(medal, stat) {
        if (!medal?.perks) return 0;
        const perk = medal.perks.find(p => p.stat === stat);
        return perk ? perk.value : 0;
    },

    /**
     * Get all stats present on the grid
     * @param {Object} placedMedals - Placed medals
     * @returns {Set} Set of stat names
     */
    getStatsOnGrid(placedMedals) {
        const stats = new Set();
        for (const medal of Object.values(placedMedals)) {
            if (medal?.perks) {
                for (const perk of medal.perks) {
                    stats.add(perk.stat);
                }
            }
        }
        return stats;
    },

    /**
     * Get default multipliers (all 1.0)
     * @returns {Object} Default multipliers
     */
    getDefaultMultipliers() {
        const multipliers = {};
        for (const stat of Object.keys(PERK_STAT_POOL)) {
            multipliers[stat] = 1.0;
        }
        return multipliers;
    },

    /**
     * Get detailed breakdown for UI display
     * @param {string} stat - Stat to analyze
     * @param {Object} placedMedals - Placed medals
     * @returns {Object} Detailed breakdown
     */
    getStatBreakdown(stat, placedMedals) {
        const gridSize = GRID_CONFIG.size;
        const breakdown = {
            stat,
            statInfo: PERK_STAT_POOL[stat],
            rows: [],
            columns: [],
            totalRowBonus: 0,
            totalColBonus: 0,
            totalBonus: 0,
            finalMultiplier: 1.0
        };

        // Row breakdown
        for (let row = 0; row < gridSize; row++) {
            let product = 1.0;
            const perksInRow = [];

            for (let col = 0; col < gridSize; col++) {
                const medal = placedMedals[`${row}_${col}`];
                if (medal) {
                    const perkValue = this.getMedalPerkValue(medal, stat);
                    if (perkValue > 0) {
                        product *= (1 + perkValue);
                        perksInRow.push({ col, value: perkValue, medal });
                    }
                }
            }

            const bonus = product - 1.0;
            breakdown.rows.push({ row, product, bonus, perks: perksInRow });
            breakdown.totalRowBonus += bonus;
        }

        // Column breakdown
        for (let col = 0; col < gridSize; col++) {
            let product = 1.0;
            const perksInCol = [];

            for (let row = 0; row < gridSize; row++) {
                const medal = placedMedals[`${row}_${col}`];
                if (medal) {
                    const perkValue = this.getMedalPerkValue(medal, stat);
                    if (perkValue > 0) {
                        product *= (1 + perkValue);
                        perksInCol.push({ row, value: perkValue, medal });
                    }
                }
            }

            const bonus = product - 1.0;
            breakdown.columns.push({ col, product, bonus, perks: perksInCol });
            breakdown.totalColBonus += bonus;
        }

        breakdown.totalBonus = breakdown.totalRowBonus + breakdown.totalColBonus;
        breakdown.finalMultiplier = 1.0 + breakdown.totalBonus;

        return breakdown;
    },

    /**
     * Get summary of all active multipliers (non-1.0 only)
     * @param {Object} placedMedals - Placed medals
     * @returns {Object} Active multipliers by category
     */
    getActiveSummary(placedMedals) {
        const multipliers = this.calculateMultipliers({ placedMedals });
        const summary = {};

        for (const [stat, multiplier] of Object.entries(multipliers)) {
            if (multiplier !== 1.0) {
                const info = PERK_STAT_POOL[stat];
                const category = info?.category || 'other';

                if (!summary[category]) {
                    summary[category] = [];
                }

                summary[category].push({
                    stat,
                    name: info?.name || stat,
                    icon: info?.icon || '-',
                    multiplier,
                    bonus: multiplier - 1.0
                });
            }
        }

        // Sort each category by multiplier descending
        for (const category of Object.keys(summary)) {
            summary[category].sort((a, b) => b.multiplier - a.multiplier);
        }

        return summary;
    },

    /**
     * Calculate row/column totals for edge display
     * @param {Object} placedMedals - Placed medals
     * @returns {Object} { rows: [...bonuses], columns: [...bonuses] }
     */
    getEdgeTotals(placedMedals) {
        const gridSize = GRID_CONFIG.size;
        const rows = [];
        const columns = [];

        // Get all stats to aggregate
        const allStats = this.getStatsOnGrid(placedMedals);

        // Row totals (sum of all stat bonuses in each row)
        for (let row = 0; row < gridSize; row++) {
            let totalBonus = 0;

            for (const stat of allStats) {
                let rowProduct = 1.0;

                for (let col = 0; col < gridSize; col++) {
                    const medal = placedMedals[`${row}_${col}`];
                    if (medal) {
                        const perkValue = this.getMedalPerkValue(medal, stat);
                        if (perkValue > 0) {
                            rowProduct *= (1 + perkValue);
                        }
                    }
                }

                totalBonus += (rowProduct - 1.0);
            }

            rows.push(totalBonus);
        }

        // Column totals
        for (let col = 0; col < gridSize; col++) {
            let totalBonus = 0;

            for (const stat of allStats) {
                let colProduct = 1.0;

                for (let row = 0; row < gridSize; row++) {
                    const medal = placedMedals[`${row}_${col}`];
                    if (medal) {
                        const perkValue = this.getMedalPerkValue(medal, stat);
                        if (perkValue > 0) {
                            colProduct *= (1 + perkValue);
                        }
                    }
                }

                totalBonus += (colProduct - 1.0);
            }

            columns.push(totalBonus);
        }

        return { rows, columns };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerkGridCalculator;
}
