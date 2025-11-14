/**
 * HARVEST STATS PANEL
 *
 * Displays real-time player vs node resistance stats during harvesting
 * Shows three columns: Player Stats | Node Stats | Effective Results
 */

const HarvestStatsPanel = {
    /**
     * Render the harvest stats panel (only shows when actively harvesting)
     */
    render() {
        const activeNode = GameEngine.state.nodeCollection?.activeNode;
        if (!activeNode) {
            return ''; // Don't show if not harvesting
        }

        const nodeDef = GameEngine.definitions.resourceNodes[activeNode.nodeId];
        if (!nodeDef) {
            return '';
        }

        // Get harvest calculation data
        const harvestCalc = StatCalculator.calculateHarvestVsNode(nodeDef.skill, activeNode.nodeId);
        const { player, node, effective, skill } = harvestCalc;

        return `
            <div class="harvest-stats-panel">
                <!-- Panel Header -->
                <div class="harvest-stats-header">
                    <span class="header-icon">⚔️</span>
                    <span class="header-title">Harvest vs ${nodeDef.name}</span>
                    <span class="header-skill">[${Formatting.capitalizeFirst(skill)}]</span>
                </div>

                <!-- Three Column Grid -->
                <div class="harvest-stats-grid">
                    <!-- Player Column -->
                    <div class="stat-column player-column">
                        <div class="column-header">Your Stats</div>
                        ${this.renderStatRow('Speed', player.speed, 'ms', 'speed', player.speed)}
                        ${this.renderStatRow('Success', player.chance, '%', 'percent', player.chance)}
                        ${this.renderStatRow('Crit Chance', player.critChance, '%', 'percent', player.critChance)}
                        ${this.renderStatRow('Crit Multi', player.critMultiplier, 'x', 'multiplier', player.critMultiplier)}
                        ${this.renderStatRow('Rare Chance', player.rareChance, '%', 'percent', player.rareChance)}
                        ${this.renderStatRow('Rare Multi', player.rareMultiplier, 'x', 'multiplier', player.rareMultiplier)}
                    </div>

                    <!-- Node Column -->
                    <div class="stat-column node-column">
                        <div class="column-header">Node Defense</div>
                        ${this.renderStatRow('Resistance', node.resistance, 'ms', 'speed', node.resistance)}
                        ${this.renderStatRow('Evasion', node.evasion, '%', 'percent', node.evasion)}
                        ${this.renderStatRow('Crit Evasion', node.critEvasion, '%', 'percent', node.critEvasion)}
                        ${this.renderStatRow('Crit Resist', node.critResistance, 'x', 'multiplier', node.critResistance)}
                        ${this.renderStatRow('Rare Evasion', node.rareEvasion, '%', 'percent', node.rareEvasion)}
                        ${this.renderStatRow('Rare Resist', node.rareResistance, 'x', 'multiplier', node.rareResistance)}
                    </div>

                    <!-- Effective Column -->
                    <div class="stat-column effective-column">
                        <div class="column-header">Effective Result</div>
                        ${this.renderEffectiveStat('Speed', effective.speed, 'ms', 'speed', player.speed, node.resistance)}
                        ${this.renderEffectiveStat('Success', effective.chance, '%', 'percent', player.chance, node.evasion)}
                        ${this.renderEffectiveStat('Crit Chance', effective.critChance, '%', 'percent', player.critChance, node.critEvasion)}
                        ${this.renderEffectiveStat('Crit Multi', effective.critMultiplier, 'x', 'multiplier', player.critMultiplier, node.critResistance)}
                        ${this.renderEffectiveStat('Rare Chance', effective.rareChance, '%', 'percent', player.rareChance, node.rareEvasion)}
                        ${this.renderEffectiveStat('Rare Multi', effective.rareMultiplier, 'x', 'multiplier', player.rareMultiplier, node.rareResistance)}
                    </div>
                </div>

                <!-- Summary Bar -->
                <div class="harvest-summary">
                    ${this.renderSummary(effective, nodeDef)}
                </div>
            </div>
        `;
    },

    /**
     * Render a stat row (player or node)
     */
    renderStatRow(label, value, unit, type, rawValue) {
        const formattedValue = this.formatValue(value, type);
        const color = this.getStatColor(rawValue, type, false);

        return `
            <div class="stat-row">
                <span class="stat-label">${label}</span>
                <span class="stat-value" style="color: ${color};">
                    ${formattedValue}${unit}
                </span>
            </div>
        `;
    },

    /**
     * Render an effective stat row with comparison
     */
    renderEffectiveStat(label, value, unit, type, playerValue, nodeValue) {
        const formattedValue = this.formatValue(value, type);
        const color = this.getEffectiveColor(value, type, playerValue, nodeValue);
        const comparison = this.getComparison(playerValue, nodeValue, type);

        return `
            <div class="stat-row effective-stat">
                <span class="stat-label">${label}</span>
                <div class="stat-value-container">
                    <span class="stat-value" style="color: ${color};">
                        ${formattedValue}${unit}
                    </span>
                    <span class="stat-comparison">${comparison}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render the summary bar at the bottom
     */
    renderSummary(effective, nodeDef) {
        let message = '';
        let icon = '';
        let color = '';

        // Determine overall performance
        if (effective.chance >= 80 && effective.speed <= 6000) {
            message = 'Excellent harvest conditions!';
            icon = '✨';
            color = '#4caf50';
        } else if (effective.chance >= 50 && effective.speed <= 10000) {
            message = 'Good harvest conditions';
            icon = '👍';
            color = '#66bb6a';
        } else if (effective.chance >= 30) {
            message = 'Moderate harvest difficulty';
            icon = '⚠️';
            color = '#ff9800';
        } else {
            message = 'Challenging harvest - Consider improving stats';
            icon = '💪';
            color = '#f44336';
        }

        const successRate = effective.chance.toFixed(1);
        const harvestTime = (effective.speed / 1000).toFixed(1);

        return `
            <div class="summary-message" style="color: ${color};">
                <span class="summary-icon">${icon}</span>
                <span class="summary-text">${message}</span>
            </div>
            <div class="summary-details">
                <span>Success Rate: <strong>${successRate}%</strong></span>
                <span>•</span>
                <span>Time: <strong>${harvestTime}s</strong></span>
                <span>•</span>
                <span>Crit: <strong>${effective.critChance.toFixed(1)}%</strong></span>
                <span>•</span>
                <span>Rare: <strong>${effective.rareChance.toFixed(1)}%</strong></span>
            </div>
        `;
    },

    /**
     * Format a value based on its type
     */
    formatValue(value, type) {
        if (value === undefined || value === null) {
            return '0';
        }

        switch (type) {
            case 'speed':
                return (value / 1000).toFixed(2);
            case 'percent':
                return value.toFixed(1);
            case 'multiplier':
                return value.toFixed(2);
            default:
                return value.toFixed(1);
        }
    },

    /**
     * Get color for a stat value
     */
    getStatColor(value, type, isNode) {
        if (type === 'speed') {
            // For speed, lower is better
            if (value < 5000) return '#4caf50';
            if (value < 8000) return '#66bb6a';
            if (value < 12000) return '#ff9800';
            return '#f44336';
        } else if (type === 'percent') {
            // For percentages, higher is better
            if (value >= 80) return '#4caf50';
            if (value >= 50) return '#66bb6a';
            if (value >= 30) return '#ff9800';
            return '#f44336';
        } else if (type === 'multiplier') {
            // For multipliers, higher is better
            if (value >= 2.5) return '#4caf50';
            if (value >= 2.0) return '#66bb6a';
            if (value >= 1.5) return '#ff9800';
            return '#f44336';
        }
        return '#aaa';
    },

    /**
     * Get color for effective stat based on comparison
     */
    getEffectiveColor(effectiveValue, type, playerValue, nodeValue) {
        if (type === 'speed') {
            // For speed: effective = player + node (higher is worse)
            const penalty = (nodeValue / playerValue) * 100;
            if (penalty <= 30) return '#4caf50'; // Low penalty
            if (penalty <= 60) return '#66bb6a'; // Medium penalty
            if (penalty <= 100) return '#ff9800'; // High penalty
            return '#f44336'; // Very high penalty
        } else if (type === 'percent') {
            // For percentages: effective = player - node (higher is better)
            if (effectiveValue >= 70) return '#4caf50';
            if (effectiveValue >= 50) return '#66bb6a';
            if (effectiveValue >= 30) return '#ff9800';
            return '#f44336';
        } else if (type === 'multiplier') {
            // For multipliers: effective = player - node (higher is better)
            if (effectiveValue >= 2.0) return '#4caf50';
            if (effectiveValue >= 1.5) return '#66bb6a';
            if (effectiveValue >= 1.2) return '#ff9800';
            return '#f44336';
        }
        return '#aaa';
    },

    /**
     * Get comparison indicator
     */
    getComparison(playerValue, nodeValue, type) {
        if (type === 'speed') {
            const change = ((nodeValue / playerValue) * 100).toFixed(0);
            return `+${change}%`;
        } else {
            const change = ((nodeValue / playerValue) * 100).toFixed(0);
            return `-${change}%`;
        }
    }
};
