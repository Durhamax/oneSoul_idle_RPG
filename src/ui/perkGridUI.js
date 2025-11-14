/**
 * MODERN PERK GRID UI
 *
 * Sleek 5x5 grid interface with row/column totals and hover effects
 * Shows strategic medal placement and equipment synergy
 *
 * Layout:
 * - Left Panel: Summary statistics
 * - Center: 5x5 grid with row totals (left) and column totals (top)
 * - Right Panel: Medal inventory
 */

const PerkGridUI = {
    lastGridState: null,
    selectedMedal: null,
    hoveredCell: null,

    /**
     * Main render function
     */
    render() {
        const container = document.getElementById('perkGridView');
        if (!container) return;

        const gridCalc = GameEngine.calculateGridPerks(GameEngine.state);
        this.lastGridState = gridCalc;

        container.innerHTML = `
            <div class="perk-grid-container">
                <!-- Left Panel: Summary Stats -->
                <div class="grid-summary-panel">
                    <h3>Grid Overview</h3>
                    ${this.renderSummaryStats(gridCalc)}
                </div>

                <!-- Center: Main Grid Area -->
                <div class="grid-main-area">
                    <h3>Perk Grid (5x5)</h3>
                    ${this.renderGridWithTotals(gridCalc)}
                </div>

                <!-- Right Panel: Medal Inventory -->
                <div class="medal-inventory-panel">
                    <h3>Available Medals</h3>
                    ${this.renderMedalInventory()}
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    /**
     * Render summary statistics panel
     */
    renderSummaryStats(gridCalc) {
        const perks = gridCalc.perks;
        const summary = gridCalc.summary;

        if (!perks || Object.keys(perks).length === 0) {
            return `
                <div class="summary-empty">
                    <p>No perks active yet!</p>
                    <p class="hint">Place medals on the grid to gain bonuses.</p>
                </div>
            `;
        }

        // Sort perks by value (highest first)
        const sortedPerks = Object.entries(perks)
            .sort(([,a], [,b]) => b - a);

        return `
            <div class="summary-content">
                <div class="summary-highlight">
                    <div class="stat-label">Total Bonus</div>
                    <div class="stat-value grand-total">+${summary.totalBonus.toFixed(2)}%</div>
                </div>

                <div class="summary-highlight">
                    <div class="stat-label">Active Perks</div>
                    <div class="stat-value">${summary.totalPerks}</div>
                </div>

                ${summary.strongestPerk ? `
                    <div class="summary-highlight">
                        <div class="stat-label">Strongest</div>
                        <div class="stat-value">
                            ${this.formatPerkName(summary.strongestPerk.type)}
                            <span class="perk-value">+${summary.strongestPerk.value.toFixed(2)}%</span>
                        </div>
                    </div>
                ` : ''}

                <div class="perk-breakdown">
                    <h4>Active Perks:</h4>
                    ${sortedPerks.map(([type, value]) => `
                        <div class="perk-line">
                            <span class="perk-name">${this.formatPerkName(type)}</span>
                            <span class="perk-value">+${value.toFixed(2)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render the 5x5 grid with row and column totals
     */
    renderGridWithTotals(gridCalc) {
        const grid = gridCalc.gridData;
        const rowTotals = gridCalc.rowTotals;
        const columnTotals = gridCalc.columnTotals;

        // Build column totals header
        let html = '<div class="grid-with-totals">';

        // Top row: column totals
        html += '<div class="column-totals">';
        html += '<div class="corner-spacer"></div>'; // Empty corner
        for (let col = 0; col < 5; col++) {
            html += this.renderColumnTotal(col, columnTotals);
        }
        html += '</div>';

        // Grid rows with row totals on left
        html += '<div class="grid-rows">';
        for (let row = 0; row < 5; row++) {
            html += '<div class="grid-row-container">';

            // Row total on left
            html += this.renderRowTotal(row, rowTotals);

            // Row cells
            html += '<div class="grid-row">';
            for (let col = 0; col < 5; col++) {
                html += this.renderGridCell(row, col, grid[row][col]);
            }
            html += '</div>';

            html += '</div>';
        }
        html += '</div>';

        html += '</div>';
        return html;
    },

    /**
     * Render a single grid cell
     */
    renderGridCell(row, col, tile) {
        const cellKey = `${row}_${col}`;
        const isEquipmentZone = (row >= 1 && row <= 3 && col >= 1 && col <= 3);
        const equipSlot = PerkGridSystem.equipmentSlotMap[cellKey];

        let classes = ['grid-cell'];
        let content = '';
        let tooltip = '';

        if (tile) {
            if (tile.type === 'medal') {
                classes.push('has-medal');
                const medal = tile.source;
                const rarity = medal.rarity || 'common';
                classes.push(`rarity-${rarity}`);

                content = `
                    <div class="medal-icon">${this.getMedalIcon(medal)}</div>
                    <div class="medal-name">${medal.name || 'Medal'}</div>
                `;

                tooltip = this.buildMedalTooltip(medal, tile.perks, row, col);
            } else if (tile.type === 'equipment') {
                classes.push('has-equipment');
                const equip = tile.source;

                content = `
                    <div class="equipment-icon">${this.getEquipmentIcon(tile.slot)}</div>
                    <div class="equipment-name">${equip.name || tile.slot}</div>
                `;

                tooltip = this.buildEquipmentTooltip(equip, tile.perks, tile.slot);
            }
        } else if (isEquipmentZone) {
            classes.push('equipment-zone');
            content = `
                <div class="empty-equipment-slot">
                    <div class="slot-icon">${this.getEquipmentIcon(equipSlot)}</div>
                    <div class="slot-name">${equipSlot}</div>
                </div>
            `;
            tooltip = `<div class="tooltip-text">Equipment Slot: ${equipSlot}<br><em>Equip an item here</em></div>`;
        } else {
            classes.push('empty-slot');
            content = `<div class="empty-indicator">+</div>`;
            tooltip = `<div class="tooltip-text">Empty Medal Slot<br><em>Click to place a medal</em></div>`;
        }

        return `
            <div class="${classes.join(' ')}"
                 data-row="${row}"
                 data-col="${col}"
                 data-tooltip="${this.escapeHtml(tooltip)}">
                ${content}
            </div>
        `;
    },

    /**
     * Render column total display
     */
    renderColumnTotal(col, columnTotals) {
        const perksInColumn = {};

        // Collect all perk types in this column
        Object.entries(columnTotals).forEach(([perkType, columns]) => {
            const colData = columns.find(c => c.column === col);
            if (colData) {
                perksInColumn[perkType] = colData.value;
            }
        });

        const totalValue = Object.values(perksInColumn).reduce((sum, v) => sum + v, 0) * 100;
        const hasPerk = totalValue > 0;

        const tooltip = this.buildColumnTooltip(col, perksInColumn);

        return `
            <div class="column-total ${hasPerk ? 'has-perk' : ''}"
                 data-tooltip="${this.escapeHtml(tooltip)}">
                <div class="total-label">Col ${col}</div>
                <div class="total-value">${hasPerk ? '+' + totalValue.toFixed(1) + '%' : '-'}</div>
            </div>
        `;
    },

    /**
     * Render row total display
     */
    renderRowTotal(row, rowTotals) {
        const perksInRow = {};

        // Collect all perk types in this row
        Object.entries(rowTotals).forEach(([perkType, rows]) => {
            const rowData = rows.find(r => r.row === row);
            if (rowData) {
                perksInRow[perkType] = rowData.value;
            }
        });

        const totalValue = Object.values(perksInRow).reduce((sum, v) => sum + v, 0) * 100;
        const hasPerk = totalValue > 0;

        const tooltip = this.buildRowTooltip(row, perksInRow);

        return `
            <div class="row-total ${hasPerk ? 'has-perk' : ''}"
                 data-tooltip="${this.escapeHtml(tooltip)}">
                <div class="total-label">Row ${row}</div>
                <div class="total-value">${hasPerk ? '+' + totalValue.toFixed(1) + '%' : '-'}</div>
            </div>
        `;
    },

    /**
     * Render medal inventory
     */
    renderMedalInventory() {
        const craftedMedals = GameEngine.state.craftedMedals || [];
        const placedMedals = GameEngine.state.perkGrid?.placedMedals || {};
        const placedMedalIds = new Set(
            Object.values(placedMedals).map(p => p.medal?.id).filter(Boolean)
        );

        // Filter to only unplaced medals
        const availableMedals = craftedMedals.filter(m => !placedMedalIds.has(m.id));

        if (availableMedals.length === 0) {
            return `
                <div class="inventory-empty">
                    <p>No medals available</p>
                    <p class="hint">Craft medals to place them on the grid!</p>
                </div>
            `;
        }

        return `
            <div class="medal-inventory">
                ${availableMedals.map(medal => this.renderMedalCard(medal)).join('')}
            </div>
        `;
    },

    /**
     * Render a medal card in inventory
     */
    renderMedalCard(medal) {
        const rarity = medal.rarity || 'common';
        const isSelected = this.selectedMedal?.id === medal.id;

        return `
            <div class="medal-card rarity-${rarity} ${isSelected ? 'selected' : ''}"
                 data-medal-id="${medal.id}">
                <div class="medal-card-icon">${this.getMedalIcon(medal)}</div>
                <div class="medal-card-name">${medal.name || 'Medal'}</div>
                <div class="medal-card-rarity">${rarity}</div>
                <div class="medal-card-perks">
                    ${medal.perks.map(p => `
                        <div class="medal-perk-line">
                            ${this.formatPerkName(p.type)}: +${(p.value * 100).toFixed(1)}%
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Build tooltip for medal
     */
    buildMedalTooltip(medal, perks, row, col) {
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">${medal.name || 'Medal'}</div>
                <div class="tooltip-location">Position: [${row},${col}]</div>
                <div class="tooltip-section">
                    <strong>Perks:</strong>
                    ${perks.map(p => `
                        <div class="tooltip-perk">
                            ${this.formatPerkName(p.type)}: +${(p.value * 100).toFixed(2)}%
                        </div>
                    `).join('')}
                </div>
                <div class="tooltip-hint">Click to remove</div>
            </div>
        `;
    },

    /**
     * Build tooltip for equipment
     */
    buildEquipmentTooltip(equip, perks, slot) {
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">${equip.name || slot}</div>
                <div class="tooltip-location">Equipment Slot: ${slot}</div>
                <div class="tooltip-section">
                    <strong>Adopted Perks:</strong>
                    ${perks.length > 0 ? perks.map(p => `
                        <div class="tooltip-perk">
                            ${this.formatPerkName(p.type)}: +${(p.value * 100).toFixed(2)}%
                        </div>
                    `).join('') : '<em>No perks</em>'}
                </div>
                <div class="tooltip-hint">Can be overridden by medal</div>
            </div>
        `;
    },

    /**
     * Build tooltip for row total
     */
    buildRowTooltip(row, perks) {
        if (Object.keys(perks).length === 0) {
            return `<div class="tooltip-text">Row ${row}: No perks</div>`;
        }

        return `
            <div class="tooltip-content">
                <div class="tooltip-header">Row ${row} Total</div>
                ${Object.entries(perks).map(([type, value]) => `
                    <div class="tooltip-perk">
                        ${this.formatPerkName(type)}: +${(value * 100).toFixed(2)}%
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Build tooltip for column total
     */
    buildColumnTooltip(col, perks) {
        if (Object.keys(perks).length === 0) {
            return `<div class="tooltip-text">Column ${col}: No perks</div>`;
        }

        return `
            <div class="tooltip-content">
                <div class="tooltip-header">Column ${col} Total</div>
                ${Object.entries(perks).map(([type, value]) => `
                    <div class="tooltip-perk">
                        ${this.formatPerkName(type)}: +${(value * 100).toFixed(2)}%
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Get medal icon (using text)
     */
    getMedalIcon(medal) {
        const rarityIcons = {
            common: '[C]',
            uncommon: '[U]',
            rare: '[R]',
            epic: '[E]',
            legendary: '[L]'
        };
        return rarityIcons[medal.rarity] || '[M]';
    },

    /**
     * Get equipment slot icon (using text abbreviations)
     */
    getEquipmentIcon(slot) {
        const icons = {
            weapon: 'WPN',
            helmet: 'HLM',
            back: 'BCK',
            gloves: 'GLV',
            chest: 'CHT',
            neck: 'NCK',
            boots: 'BTS',
            legs: 'LGS',
            ring: 'RNG'
        };
        return icons[slot] || 'EQP';
    },

    /**
     * Format perk type name for display
     */
    formatPerkName(type) {
        const names = {
            attackDamage: 'Attack Damage',
            attackSpeed: 'Attack Speed',
            criticalChance: 'Crit Chance',
            criticalDamage: 'Crit Damage',
            accuracy: 'Accuracy',
            maxHealth: 'Max Health',
            damageReduction: 'Damage Reduction',
            evasion: 'Evasion',
            miningSpeed: 'Mining Speed',
            woodcuttingSpeed: 'Woodcutting',
            fishingSpeed: 'Fishing'
        };
        return names[type] || type;
    },

    /**
     * Escape HTML for tooltip attributes
     */
    escapeHtml(html) {
        return html.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    /**
     * Attach event listeners for interactivity
     */
    attachEventListeners() {
        // Medal card selection
        document.querySelectorAll('.medal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const medalId = card.dataset.medalId;
                this.selectMedal(medalId);
            });
        });

        // Grid cell clicks
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.handleCellClick(row, col);
            });
        });

        // Tooltip hover effects
        document.querySelectorAll('[data-tooltip]').forEach(elem => {
            elem.addEventListener('mouseenter', (e) => {
                this.showTooltip(elem, elem.dataset.tooltip);
            });
            elem.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    },

    /**
     * Select a medal from inventory
     */
    selectMedal(medalId) {
        const medal = GameEngine.state.craftedMedals?.find(m => m.id === medalId);
        if (!medal) return;

        this.selectedMedal = medal;
        this.render(); // Re-render to show selection
        console.log('Selected medal:', medal.name);
    },

    /**
     * Handle grid cell click
     */
    handleCellClick(row, col) {
        const tile = this.lastGridState?.gridData?.[row]?.[col];

        if (tile && tile.type === 'medal') {
            // Remove medal
            const result = GameEngine.removeMedalFromGrid(row, col);
            if (result.success) {
                console.log(`Removed medal from [${row},${col}]`);
                this.render();
            }
        } else if (this.selectedMedal) {
            // Place selected medal
            const result = GameEngine.placeMedalOnGrid(row, col, this.selectedMedal);
            if (result.success) {
                console.log(`Placed ${this.selectedMedal.name} at [${row},${col}]`);
                this.selectedMedal = null;
                this.render();
            } else {
                console.warn('Cannot place medal:', result.reason);
                alert(result.reason);
            }
        } else {
            console.log('Select a medal from inventory first');
        }
    },

    /**
     * Show tooltip
     */
    showTooltip(element, html) {
        let tooltip = document.getElementById('perk-grid-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'perk-grid-tooltip';
            tooltip.className = 'perk-grid-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = html;
        tooltip.style.display = 'block';

        // Position tooltip near cursor
        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        tooltip.style.top = (rect.top - 10) + 'px';
    },

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('perk-grid-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
};

// Auto-render when perk grid view becomes visible
if (typeof GameEngine !== 'undefined') {
    console.log('Perk Grid UI loaded');
}
