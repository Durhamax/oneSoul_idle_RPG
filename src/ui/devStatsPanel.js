/**
 * DEVELOPER STATISTICS PANEL
 *
 * Displays real-time statistics from the 5-layer calculation engine
 * Shows all variables currently being used in calculations
 * Context-aware: displays relevant stats for each tab
 */

const DevStatsPanel = {
    isExpanded: true,
    currentTab: 'overview',
    updateInterval: null,

    /**
     * Initialize the developer panel
     */
    init() {
        // Load expanded state from localStorage
        const savedState = localStorage.getItem('devPanelExpanded');
        if (savedState !== null) {
            this.isExpanded = savedState === 'true';
        }

        // Start auto-update (every 500ms)
        this.startAutoUpdate();

        console.log('Developer Stats Panel initialized');
    },

    /**
     * Start auto-update interval
     */
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            this.update();
        }, 500);
    },

    /**
     * Stop auto-update
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    /**
     * Toggle panel expansion
     */
    toggle() {
        this.isExpanded = !this.isExpanded;
        localStorage.setItem('devPanelExpanded', this.isExpanded);
        this.update();
    },

    /**
     * Update the panel with current stats
     */
    update(tabName) {
        if (tabName) {
            this.currentTab = tabName;
        }

        const container = document.getElementById('devStatsPanel');
        if (!container) return;

        // Store scroll position before update
        const contentDiv = container.querySelector('.dev-stats-content');
        const scrollTop = contentDiv ? contentDiv.scrollTop : 0;

        container.innerHTML = this.render();
        this.attachEventListeners();

        // Restore scroll position after update
        const newContentDiv = container.querySelector('.dev-stats-content');
        if (newContentDiv && scrollTop > 0) {
            newContentDiv.scrollTop = scrollTop;
        }
    },

    /**
     * Main render function
     */
    render() {
        const stats = this.getRelevantStats(this.currentTab);

        return `
            <div class="dev-stats-panel ${this.isExpanded ? 'expanded' : 'collapsed'}">
                <div class="dev-stats-header" onclick="DevStatsPanel.toggle()">
                    <span class="dev-stats-title">
                        ${this.isExpanded ? '�' : '�'} Developer Stats Panel - 5 Layer System
                    </span>
                    <span class="dev-stats-tab-info">[${this.currentTab.toUpperCase()}]</span>
                </div>

                ${this.isExpanded ? `
                    <div class="dev-stats-content">
                        ${this.renderStatsGrid(stats)}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render the stats grid
     */
    renderStatsGrid(stats) {
        if (!stats || stats.length === 0) {
            return '<div class="dev-stats-empty">No stats available for this tab</div>';
        }

        return `
            <div class="dev-stats-grid">
                ${stats.map(stat => this.renderStatCard(stat)).join('')}
            </div>

            <div class="dev-stats-legend">
                <span class="legend-item"><span class="layer-badge layer-base">Base</span> Raw base values</span>
                <span class="legend-item"><span class="layer-badge layer-attributes">Attr</span> From attributes (STR/DEX/etc)</span>
                <span class="legend-item"><span class="layer-badge layer-equipment">Equip</span> From equipment stats</span>
                <span class="legend-item"><span class="layer-badge layer-perks">Perks</span> From perk grid</span>
                <span class="legend-item"><span class="layer-badge layer-build">Build</span> Multiplicative bonuses</span>
                <span class="legend-item"><span class="layer-badge layer-final">Final</span> Computed result</span>
            </div>
        `;
    },

    /**
     * Render a single stat card
     */
    renderStatCard(stat) {
        const breakdown = stat.breakdown || {};

        return `
            <div class="dev-stat-card">
                <div class="dev-stat-name">${stat.displayName || stat.name}</div>

                <div class="dev-stat-layers">
                    <div class="dev-stat-layer layer-base">
                        <span class="layer-label">Base:</span>
                        <span class="layer-value">${this.formatValue(breakdown.base !== undefined ? breakdown.base : 0)}</span>
                    </div>

                    <div class="dev-stat-layer layer-attributes">
                        <span class="layer-label">Attr:</span>
                        <span class="layer-value">${this.formatLayerValue(breakdown.attributes, 'additive')}</span>
                    </div>

                    <div class="dev-stat-layer layer-equipment">
                        <span class="layer-label">Equip:</span>
                        <span class="layer-value">${this.formatLayerValue(breakdown.equipment, 'additive')}</span>
                    </div>

                    <div class="dev-stat-layer layer-perks">
                        <span class="layer-label">Perks:</span>
                        <span class="layer-value">${this.formatLayerValue(breakdown.perks, 'multiplicative')}</span>
                    </div>

                    <div class="dev-stat-layer layer-build">
                        <span class="layer-label">Build:</span>
                        <span class="layer-value">${this.formatLayerValue(breakdown.build, 'multiplicative')}</span>
                    </div>
                </div>

                <div class="dev-stat-final layer-final">
                    <span class="layer-label">Final:</span>
                    <span class="layer-value">${this.formatValue(stat.value)}</span>
                </div>

                ${breakdown.details && breakdown.details.length > 0 ? `
                    <div class="dev-stat-details">
                        ${breakdown.details.map(d => `<div class="detail-line">${d}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Get relevant stats for the current tab
     */
    getRelevantStats(tabName) {
        if (typeof GameEngine === 'undefined' || !GameEngine.state) {
            return [];
        }

        // Check if buildStatContext method exists
        if (typeof GameEngine.buildStatContext !== 'function') {
            console.warn('GameEngine.buildStatContext not available yet');
            return [];
        }

        let context;
        try {
            context = GameEngine.buildStatContext();
        } catch (e) {
            console.warn('Failed to build stat context:', e);
            return [];
        }
        const stats = [];

        switch (tabName) {
            case 'combat':
                stats.push(
                    this.buildStatInfo('attackDamage', 'Attack Damage', context),
                    this.buildStatInfo('attackSpeed', 'Attack Speed', context),
                    this.buildStatInfo('accuracy', 'Accuracy', context),
                    this.buildStatInfo('criticalChance', 'Critical Chance', context),
                    this.buildStatInfo('criticalDamage', 'Critical Damage', context),
                    this.buildStatInfo('maxHealth', 'Max Health', context),
                    this.buildStatInfo('damageReduction', 'Damage Reduction', context),
                    this.buildStatInfo('evasion', 'Evasion', context)
                );
                break;

            case 'nodes':
                // Check if there's a specific node being viewed
                const currentActivity = this.getCurrentNodeActivity();

                if (currentActivity) {
                    // Show only stats for the current skill
                    const skillStats = this.getStatsForSkill(currentActivity, context);
                    stats.push(...skillStats);
                } else {
                    // Show overview of all harvesting skills (just speeds)
                    stats.push(
                        this.buildStatInfo('miningSpeed', 'Mining Speed', context),
                        this.buildStatInfo('woodcuttingSpeed', 'Woodcutting Speed', context),
                        this.buildStatInfo('fishingSpeed', 'Fishing Speed', context),
                        this.buildStatInfo('huntingSpeed', 'Hunting Speed', context),
                        this.buildStatInfo('foragingSpeed', 'Foraging Speed', context),
                        this.buildStatInfo('thievingSpeed', 'Thieving Speed', context)
                    );
                }
                break;

            case 'equipment':
                stats.push(
                    this.buildStatInfo('attackDamage', 'Attack Damage', context),
                    this.buildStatInfo('attackSpeed', 'Attack Speed', context),
                    this.buildStatInfo('maxHealth', 'Max Health', context),
                    this.buildStatInfo('damageReduction', 'Damage Reduction', context)
                );
                break;

            case 'perks':
                // Show all perk grid contributions
                const gridCalc = GameEngine.calculateGridPerks ? GameEngine.calculateGridPerks(GameEngine.state) : null;
                if (gridCalc && gridCalc.perks) {
                    Object.entries(gridCalc.perks).forEach(([perkType, value]) => {
                        stats.push({
                            name: perkType,
                            displayName: this.formatPerkName(perkType),
                            value: value,
                            breakdown: {
                                base: 0,
                                perks: value / 100,
                                details: [
                                    `Grid Bonus: +${value.toFixed(2)}%`,
                                    `Rows contributing: ${this.countRowsWithPerk(gridCalc.rowTotals, perkType)}`,
                                    `Columns contributing: ${this.countColumnsWithPerk(gridCalc.columnTotals, perkType)}`
                                ]
                            }
                        });
                    });
                }
                break;

            case 'overview':
            default:
                // Show a summary of key stats
                stats.push(
                    this.buildStatInfo('attackDamage', 'Attack Damage', context),
                    this.buildStatInfo('attackSpeed', 'Attack Speed', context),
                    this.buildStatInfo('maxHealth', 'Max Health', context),
                    this.buildStatInfo('miningSpeed', 'Mining Speed', context)
                );
                break;
        }

        return stats.filter(s => s !== null);
    },

    /**
     * Build stat info object with full breakdown
     */
    buildStatInfo(statName, displayName, context) {
        if (typeof StatCalculator === 'undefined') {
            return null;
        }

        try {
            const result = StatCalculator.calculateStat(statName, context);

            return {
                name: statName,
                displayName: displayName,
                value: result.final,
                breakdown: {
                    base: result.layers.base,
                    attributes: result.layers.attributes.additive,
                    equipment: result.layers.equipment.additive,
                    perks: result.layers.perks.multiplicative,
                    build: result.layers.build.multiplicative,
                    details: result.breakdown || []
                }
            };
        } catch (e) {
            console.warn(`Failed to calculate ${statName}:`, e);
            return null;
        }
    },

    /**
     * Count rows with a specific perk
     */
    countRowsWithPerk(rowTotals, perkType) {
        if (!rowTotals || !rowTotals[perkType]) return 0;
        return rowTotals[perkType].length;
    },

    /**
     * Count columns with a specific perk
     */
    countColumnsWithPerk(columnTotals, perkType) {
        if (!columnTotals || !columnTotals[perkType]) return 0;
        return columnTotals[perkType].length;
    },

    /**
     * Format perk type name
     */
    formatPerkName(type) {
        const names = {
            attackDamage: 'Attack Damage',
            attackSpeed: 'Attack Speed',
            criticalChance: 'Critical Chance',
            criticalDamage: 'Critical Damage',
            accuracy: 'Accuracy',
            maxHealth: 'Max Health',
            damageReduction: 'Damage Reduction',
            evasion: 'Evasion',
            miningSpeed: 'Mining Speed',
            woodcuttingSpeed: 'Woodcutting Speed',
            fishingSpeed: 'Fishing Speed'
        };
        return names[type] || type;
    },

    /**
     * Format numeric value
     */
    formatValue(value) {
        if (value === undefined || value === null) return '-';
        if (typeof value !== 'number') return value;

        if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(2) + 'K';
        } else if (value < 1 && value > 0) {
            return value.toFixed(3);
        } else {
            return value.toFixed(2);
        }
    },

    /**
     * Format multiplier value
     */
    formatMultiplier(value) {
        if (value === undefined || value === null) return '1.000';
        if (typeof value !== 'number') return value;

        return (1 + value).toFixed(3);
    },

    /**
     * Format layer value based on type (additive or multiplicative)
     */
    formatLayerValue(value, type) {
        if (type === 'additive') {
            // Additive layers show +X or 0
            if (value === undefined || value === null || value === 0) {
                return '+0';
            }
            const sign = value >= 0 ? '+' : '';
            return `${sign}${this.formatValue(value)}`;
        } else if (type === 'multiplicative') {
            // Multiplicative layers show ×X.XXX
            if (value === undefined || value === null || value === 0) {
                return '×1.000';
            }
            return `×${this.formatMultiplier(value)}`;
        }
        return '-';
    },

    /**
     * Get current node activity being performed
     */
    getCurrentNodeActivity() {
        if (typeof GameEngine === 'undefined' || !GameEngine.state) {
            return null;
        }

        const state = GameEngine.state;

        // Check for active node being harvested
        if (state.nodeCollection && state.nodeCollection.activeNode) {
            const activeNode = state.nodeCollection.activeNode;
            const nodeId = activeNode.nodeId;

            // Get node definition to find skill type
            const definitions = GameEngine.definitions;
            if (definitions && definitions.resourceNodes && definitions.resourceNodes[nodeId]) {
                const nodeDef = definitions.resourceNodes[nodeId];
                const gameSkill = nodeDef.skill; // e.g., "logging", "mining", "fishing"

                // Map game skill names to StatCalculator skill names
                return this.mapGameSkillToStatSkill(gameSkill);
            }
        }

        return null;
    },

    /**
     * Map game skill names to StatCalculator skill names
     */
    mapGameSkillToStatSkill(gameSkill) {
        const skillMap = {
            'logging': 'woodcutting',  // Game uses "logging", stats use "woodcutting"
            'mining': 'mining',
            'fishing': 'fishing',
            'hunting': 'hunting',
            'foraging': 'foraging',
            'thieving': 'thieving'
        };

        return skillMap[gameSkill] || gameSkill;
    },

    /**
     * Get all stats for a specific skill
     */
    getStatsForSkill(skillName, context) {
        const stats = [];

        // Normalize skill name to lowercase
        const skill = skillName.toLowerCase();

        // Build comprehensive stat list for this skill
        const statTypes = [
            { suffix: 'Speed', display: 'Speed' },
            { suffix: 'Power', display: 'Power' },
            { suffix: 'Chance', display: 'Success Chance' },
            { suffix: 'CritChance', display: 'Crit Chance' },
            { suffix: 'CritMultiplier', display: 'Crit Multiplier' },
            { suffix: 'RareChance', display: 'Rare Chance' },
            { suffix: 'RareMultiplier', display: 'Rare Multiplier' }
        ];

        statTypes.forEach(statType => {
            const statName = skill + statType.suffix;
            const displayName = this.capitalizeFirst(skill) + ' ' + statType.display;
            const statInfo = this.buildStatInfo(statName, displayName, context);
            if (statInfo) {
                stats.push(statInfo);
            }
        });

        return stats;
    },

    /**
     * Capitalize first letter of a string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Event listeners are inline in the HTML for simplicity
    }
};

// Auto-initialize when GameEngine is ready
if (typeof GameEngine !== 'undefined') {
    console.log('DevStatsPanel loaded');
}
