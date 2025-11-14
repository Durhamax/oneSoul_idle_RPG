/**
 * STAT DISPLAY UI
 *
 * Provides UI components for displaying detailed stat breakdowns
 * using the modular 5-layer stat calculation system.
 *
 * Features:
 * - Hover tooltips showing layer-by-layer breakdown
 * - Visual indicators for capped stats
 * - Color-coded improvements/reductions
 * - Formatted stat values
 */

const StatDisplayUI = {
    /**
     * Create a stat element with hover tooltip
     * @param {string} statName - Name of the stat
     * @param {object} options - Display options
     * @returns {HTMLElement} Stat element with tooltip
     */
    createStatElement(statName, options = {}) {
        const {
            showLabel = true,
            showIcon = false,
            className = 'stat-item',
            iconMap = this.getDefaultIconMap()
        } = options;

        // Calculate the stat
        const calc = GameEngine.calculateStat(statName);

        // Create container
        const container = document.createElement('div');
        container.className = `${className} ${calc.capped ? 'stat-capped' : ''}`;
        container.dataset.stat = statName;

        // Add icon if requested
        if (showIcon && iconMap[statName]) {
            const icon = document.createElement('span');
            icon.className = 'stat-icon';
            icon.textContent = iconMap[statName];
            container.appendChild(icon);
        }

        // Add label
        if (showLabel) {
            const label = document.createElement('span');
            label.className = 'stat-label';
            label.textContent = this.formatStatName(statName);
            container.appendChild(label);
        }

        // Add value
        const value = document.createElement('span');
        value.className = 'stat-value';
        value.textContent = calc.formatted;
        container.appendChild(value);

        // Add capped indicator
        if (calc.capped) {
            const cappedIcon = document.createElement('span');
            cappedIcon.className = 'stat-capped-icon';
            cappedIcon.textContent = '⚠️';
            cappedIcon.title = 'This stat has reached its maximum value';
            container.appendChild(cappedIcon);
        }

        // Add hover event for tooltip
        container.addEventListener('mouseenter', (e) => {
            this.showStatTooltip(statName, e.currentTarget);
        });

        container.addEventListener('mouseleave', () => {
            this.hideStatTooltip();
        });

        return container;
    },

    /**
     * Show detailed stat tooltip
     * @param {string} statName - Name of the stat
     * @param {HTMLElement} targetElement - Element to position tooltip near
     */
    showStatTooltip(statName, targetElement) {
        // Remove existing tooltip
        this.hideStatTooltip();

        // Calculate the stat with full breakdown
        const calc = GameEngine.calculateStat(statName);
        const breakdown = calc.breakdown;

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = 'stat-breakdown-tooltip';
        tooltip.className = 'stat-breakdown-tooltip';
        tooltip.innerHTML = this.renderBreakdown(statName, breakdown);

        // Position tooltip
        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, targetElement);

        // Store reference for cleanup
        this.activeTooltip = tooltip;
    },

    /**
     * Hide active tooltip
     */
    hideStatTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    },

    /**
     * Render detailed breakdown HTML
     * @param {string} statName - Name of the stat
     * @param {object} breakdown - Breakdown object from StatCalculator
     * @returns {string} HTML string
     */
    renderBreakdown(statName, breakdown) {
        const layers = breakdown.layers;

        return `
            <div class="breakdown-header">
                <span class="breakdown-stat-name">${this.formatStatName(statName)}</span>
                <span class="breakdown-final-value">${breakdown.final.formatted}</span>
                ${breakdown.capped ? '<span class="breakdown-capped-badge">CAPPED</span>' : ''}
            </div>

            <div class="breakdown-layers">
                ${layers.map(layer => this.renderLayer(layer)).join('')}
            </div>

            <div class="breakdown-footer">
                <div class="breakdown-formula-label">Calculation Method:</div>
                <div class="breakdown-formula">${this.getCalculationMethodText(statName)}</div>
            </div>
        `;
    },

    /**
     * Render a single layer
     * @param {object} layer - Layer data
     * @returns {string} HTML string
     */
    renderLayer(layer) {
        const layerIcons = {
            'base': '⚙️',
            'attributes': '💪',
            'equipment': '🛡️',
            'perks': '⭐',
            'build': '📊'
        };

        const icon = layerIcons[layer.type] || '•';
        const hasDetails = layer.details && layer.details.length > 0;

        return `
            <div class="breakdown-layer ${layer.type}">
                <div class="layer-header">
                    <span class="layer-icon">${icon}</span>
                    <span class="layer-name">${layer.name}</span>
                    <span class="layer-value">${layer.display}</span>
                </div>
                ${hasDetails ? `
                    <div class="layer-details">
                        ${layer.details}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Get calculation method explanation text
     */
    getCalculationMethodText(statName) {
        const statType = StatCalculator.statConfig.statTypes[statName];
        const calculationType = StatCalculator.statConfig.calculationTypes[statType];

        const explanations = {
            'multiplicative_reduction': 'Speed: Base × (1 - Reductions) ÷ (1 + Multipliers) - Lower is better',
            'additive_then_multiplicative': 'Power: (Base + Additive) × (1 + Multipliers) - Higher is better',
            'additive_capped': 'Percentage: Base + All Additive (capped) - 0-100% range',
            'pure_multiplicative': 'Multiplier: Base × Layer1 × Layer2 × Layer3...'
        };

        return explanations[calculationType] || 'Custom calculation method';
    },

    /**
     * Position tooltip near target element
     * @param {HTMLElement} tooltip - Tooltip element
     * @param {HTMLElement} target - Target element
     */
    positionTooltip(tooltip, target) {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Calculate position (prefer right side, fall back to left if needed)
        let left = targetRect.right + 10;
        let top = targetRect.top;

        // Check if tooltip would go off-screen to the right
        if (left + tooltipRect.width > window.innerWidth - 10) {
            // Position on left side instead
            left = targetRect.left - tooltipRect.width - 10;
        }

        // Ensure tooltip doesn't go off top/bottom
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        if (top < 10) {
            top = 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    },

    /**
     * Format stat name for display
     * @param {string} statName - Internal stat name
     * @returns {string} Formatted display name
     */
    formatStatName(statName) {
        const nameMap = {
            'attackDamage': 'Attack Damage',
            'attackSpeed': 'Attack Speed',
            'maxHealth': 'Max Health',
            'healthRegen': 'Health Regen',
            'accuracy': 'Accuracy',
            'evasion': 'Evasion',
            'criticalChance': 'Critical Chance',
            'criticalDamage': 'Critical Damage',
            'damageReduction': 'Damage Reduction',
            'blockChance': 'Block Chance',
            'reloadSpeed': 'Reload Speed',
            'miningSpeed': 'Mining Speed',
            'miningPower': 'Mining Power',
            'woodcuttingSpeed': 'Woodcutting Speed',
            'woodcuttingPower': 'Woodcutting Power',
            'fishingSpeed': 'Fishing Speed',
            'fishingPower': 'Fishing Power',
            'craftingSpeed': 'Crafting Speed',
            'cookingSpeed': 'Cooking Speed',
            'dropRateMultiplier': 'Drop Rate',
            'experienceMultiplier': 'Experience Gain'
        };

        return nameMap[statName] || statName.replace(/([A-Z])/g, ' $1').trim();
    },

    /**
     * Get default icon map for stats
     */
    getDefaultIconMap() {
        return {
            'attackDamage': '⚔️',
            'attackSpeed': '⚡',
            'maxHealth': '❤️',
            'healthRegen': '💚',
            'accuracy': '🎯',
            'evasion': '💨',
            'criticalChance': '💥',
            'criticalDamage': '⚡',
            'damageReduction': '🛡️',
            'blockChance': '🛡️',
            'reloadSpeed': '🔄',
            'miningSpeed': '⛏️',
            'miningPower': '⛏️',
            'woodcuttingSpeed': '🪓',
            'woodcuttingPower': '🪓',
            'fishingSpeed': '🎣',
            'fishingPower': '🎣',
            'craftingSpeed': '🔨',
            'cookingSpeed': '🍳',
            'dropRateMultiplier': '🎁',
            'experienceMultiplier': '⭐'
        };
    },

    /**
     * Create a compact stat comparison element (for equipment tooltips)
     * @param {string} statName - Name of the stat
     * @param {number} currentValue - Current stat value
     * @param {number} newValue - New stat value (with equipment change)
     * @returns {HTMLElement} Comparison element
     */
    createStatComparison(statName, currentValue, newValue) {
        const container = document.createElement('div');
        container.className = 'stat-comparison';

        const diff = newValue - currentValue;
        const isImprovement = this.isStatImprovement(statName, diff);

        container.innerHTML = `
            <span class="comparison-label">${this.formatStatName(statName)}:</span>
            <span class="comparison-current">${currentValue.toFixed(1)}</span>
            <span class="comparison-arrow">→</span>
            <span class="comparison-new ${isImprovement ? 'improvement' : 'degradation'}">
                ${newValue.toFixed(1)}
            </span>
            <span class="comparison-diff ${isImprovement ? 'positive' : 'negative'}">
                (${isImprovement ? '+' : ''}${diff.toFixed(1)})
            </span>
        `;

        return container;
    },

    /**
     * Check if a stat change is an improvement
     * @param {string} statName - Name of the stat
     * @param {number} diff - Difference value
     * @returns {boolean} True if improvement
     */
    isStatImprovement(statName, diff) {
        // For speed stats, negative diff is good (faster)
        const speedStats = ['attackSpeed', 'reloadSpeed', 'miningSpeed', 'woodcuttingSpeed', 'fishingSpeed', 'craftingSpeed', 'cookingSpeed'];

        if (speedStats.includes(statName)) {
            return diff < 0;
        }

        // For all other stats, positive diff is good
        return diff > 0;
    },

    /**
     * Create stat grid display (for character sheet)
     * @param {string[]} statNames - Array of stat names to display
     * @param {object} options - Display options
     * @returns {HTMLElement} Stat grid element
     */
    createStatGrid(statNames, options = {}) {
        const {
            columns = 2,
            showIcons = true,
            className = 'stat-grid'
        } = options;

        const grid = document.createElement('div');
        grid.className = className;
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        grid.style.gap = '12px';

        statNames.forEach(statName => {
            const statElement = this.createStatElement(statName, {
                showLabel: true,
                showIcon: showIcons,
                className: 'stat-item-grid'
            });
            grid.appendChild(statElement);
        });

        return grid;
    },

    /**
     * Update all stat elements on the page
     * Call this when stats change (equipment change, level up, etc.)
     */
    updateAllStatElements() {
        const statElements = document.querySelectorAll('[data-stat]');

        statElements.forEach(element => {
            const statName = element.dataset.stat;
            if (!statName) return;

            const calc = GameEngine.calculateStat(statName);

            // Update value
            const valueElement = element.querySelector('.stat-value');
            if (valueElement) {
                valueElement.textContent = calc.formatted;
            }

            // Update capped status
            if (calc.capped) {
                element.classList.add('stat-capped');
            } else {
                element.classList.remove('stat-capped');
            }
        });
    },

    /**
     * Create a debug panel for testing StatCalculator
     * @returns {HTMLElement} Debug panel element
     */
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'stat-calculator-debug';
        panel.className = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: rgba(10, 10, 15, 0.95);
            border: 1px solid rgba(0, 217, 255, 0.3);
            border-radius: 8px;
            padding: 16px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
        `;

        // Header
        const header = document.createElement('div');
        header.innerHTML = `
            <h3 style="margin: 0 0 12px 0; color: #00d9ff;">StatCalculator Debug</h3>
            <button id="close-debug-panel" style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: #fff; cursor: pointer; font-size: 18px;">×</button>
        `;
        panel.appendChild(header);

        // Test buttons
        const controls = document.createElement('div');
        controls.innerHTML = `
            <button class="debug-btn" data-action="validateCalculations">Validate Calculations</button>
            <button class="debug-btn" data-action="testAllStats">Test All Stats</button>
            <button class="debug-btn" data-action="benchmarkPerformance">Benchmark Performance</button>
        `;
        controls.style.cssText = 'display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;';
        panel.appendChild(controls);

        // Results area
        const results = document.createElement('div');
        results.id = 'debug-results';
        results.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            padding: 12px;
            color: #b8b8c4;
            white-space: pre-wrap;
            font-size: 11px;
            max-height: 400px;
            overflow-y: auto;
        `;
        results.textContent = 'Click a button to run tests...';
        panel.appendChild(results);

        // Event listeners
        panel.querySelector('#close-debug-panel').addEventListener('click', () => {
            panel.remove();
        });

        controls.querySelectorAll('.debug-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.runDebugAction(action, results);
            });
        });

        // Style debug buttons
        controls.querySelectorAll('.debug-btn').forEach(btn => {
            btn.style.cssText = `
                background: rgba(0, 217, 255, 0.1);
                border: 1px solid rgba(0, 217, 255, 0.3);
                color: #00d9ff;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                flex: 1;
            `;
        });

        return panel;
    },

    /**
     * Run debug action
     */
    runDebugAction(action, resultsElement) {
        resultsElement.textContent = `Running ${action}...\n`;

        setTimeout(() => {
            let output = '';

            switch (action) {
                case 'validateCalculations':
                    const isValid = StatCalculator.testing.validateCalculations();
                    output = `Validation ${isValid ? 'PASSED ✅' : 'FAILED ❌'}\nCheck console for details.`;
                    break;

                case 'testAllStats':
                    const results = StatCalculator.testing.testAllStats();
                    output = `Tested ${results.length} stats:\n\n`;
                    results.forEach(r => {
                        output += `${r.stat}: ${r.formatted} (base: ${r.baseValue})\n`;
                    });
                    break;

                case 'benchmarkPerformance':
                    const benchmark = StatCalculator.testing.benchmarkPerformance();
                    output = `Performance Benchmark:\n\n`;
                    output += `Total Time: ${benchmark.totalTime.toFixed(2)}ms\n`;
                    output += `Avg Time/Stat: ${benchmark.avgTime.toFixed(4)}ms\n`;
                    output += `Calcs/Second: ${benchmark.calculationsPerSecond.toFixed(0)}`;
                    break;
            }

            resultsElement.textContent = output;
        }, 100);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatDisplayUI;
}
