/**
 * PERK GRID UI (7x7 System)
 *
 * Modern interface for the 7x7 perk grid with medal management
 *
 * Layout:
 * - Left Panel: Grid statistics and active perks summary
 * - Center: 7x7 grid with row/column edge totals
 * - Right Panel: Medal inventory and crafting
 */

const PerkGridUI = {
    selectedMedalId: null,
    selectedGridCell: null,
    craftingTab: 'inventory', // 'inventory', 'forge', 'combine', 'salvage'
    selectedForCombine: [],
    selectedForSalvage: [],
    forgeTier: 1,

    /**
     * Main render function
     */
    render() {
        const container = document.getElementById('perkGridView');
        if (!container) return;

        const gridState = GameEngine.getGridState();
        const multipliers = GameEngine.getPerkMultipliers();
        const inventoryInfo = GameEngine.getMedalInventoryInfo();
        const fragments = GameEngine.state.currencies?.medalFragments || 0;

        container.innerHTML = `
            <div class="perk-grid-container-7x7">
                <!-- Left Panel: Stats Summary -->
                <div class="grid-stats-panel">
                    ${this.renderStatsPanel(gridState, multipliers)}
                </div>

                <!-- Center: Main Grid -->
                <div class="grid-main-panel">
                    <div class="grid-header">
                        <h3>Perk Grid</h3>
                        <div class="grid-info">
                            Level ${gridState.characterLevel} |
                            ${gridState.unlockedCount}/${gridState.totalTiles} tiles unlocked
                            ${gridState.nextUnlockLevel ? ` | Next unlock: Lv.${gridState.nextUnlockLevel}` : ' | All unlocked!'}
                        </div>
                    </div>
                    ${this.renderGrid(gridState)}
                </div>

                <!-- Right Panel: Medal Management -->
                <div class="medal-management-panel">
                    <div class="medal-currency">
                        <span class="fragment-icon">◆</span>
                        <span class="fragment-count">${fragments.toLocaleString()}</span>
                        <span class="fragment-label">Fragments</span>
                    </div>
                    ${this.renderMedalTabs()}
                    ${this.renderMedalContent(inventoryInfo, fragments)}
                </div>
            </div>
        `;

        this.attachEventListeners();
    },

    /**
     * Render stats panel
     */
    renderStatsPanel(gridState, multipliers) {
        const summary = gridState.activeSummary;
        const edgeTotals = gridState.edgeTotals;

        // Get non-1.0 multipliers (actual bonuses)
        const activeMultipliers = Object.entries(multipliers)
            .filter(([_, val]) => val !== 1.0)
            .sort(([_, a], [__, b]) => b - a);

        return `
            <div class="stats-section">
                <h4>Grid Status</h4>
                <div class="stat-row">
                    <span>Medals Placed</span>
                    <span>${gridState.placedCount}</span>
                </div>
                <div class="stat-row">
                    <span>Empty Slots</span>
                    <span>${gridState.emptyUnlockedCount}</span>
                </div>
            </div>

            <div class="stats-section">
                <h4>Active Bonuses (${activeMultipliers.length})</h4>
                ${activeMultipliers.length === 0 ? `
                    <div class="no-bonuses">Place medals to gain bonuses</div>
                ` : `
                    <div class="bonus-list">
                        ${activeMultipliers.slice(0, 10).map(([stat, mult]) => {
                            const perkInfo = typeof PERK_STAT_POOL !== 'undefined' ? PERK_STAT_POOL[stat] : null;
                            const name = perkInfo?.name || stat;
                            const icon = perkInfo?.icon || '•';
                            const percent = ((mult - 1) * 100).toFixed(1);
                            return `
                                <div class="bonus-row">
                                    <span class="bonus-icon">${icon}</span>
                                    <span class="bonus-name">${name}</span>
                                    <span class="bonus-value ${mult > 1 ? 'positive' : 'negative'}">
                                        ${mult > 1 ? '+' : ''}${percent}%
                                    </span>
                                </div>
                            `;
                        }).join('')}
                        ${activeMultipliers.length > 10 ? `
                            <div class="bonus-more">+${activeMultipliers.length - 10} more...</div>
                        ` : ''}
                    </div>
                `}
            </div>

            <div class="stats-section">
                <h4>Perk Categories</h4>
                ${Object.entries(summary).map(([category, perks]) => `
                    <div class="category-row">
                        <span class="category-name">${category}</span>
                        <span class="category-count">${Object.keys(perks).length} active</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render the 7x7 grid with edge totals
     */
    renderGrid(gridState) {
        const edgeTotals = gridState.edgeTotals;
        const size = gridState.size;

        // Build column headers (edge totals)
        let columnHeaders = '<div class="grid-corner"></div>';
        for (let col = 0; col < size; col++) {
            const colTotal = edgeTotals.columns[col] || 0;
            const hasBonus = colTotal > 0;
            columnHeaders += `
                <div class="grid-edge-total column-total ${hasBonus ? 'has-bonus' : ''}">
                    ${hasBonus ? `+${(colTotal * 100).toFixed(0)}%` : '-'}
                </div>
            `;
        }

        // Build grid rows
        let gridRows = '';
        for (let row = 0; row < size; row++) {
            const rowTotal = edgeTotals.rows[row] || 0;
            const hasRowBonus = rowTotal > 0;

            // Row total on left
            gridRows += `
                <div class="grid-edge-total row-total ${hasRowBonus ? 'has-bonus' : ''}">
                    ${hasRowBonus ? `+${(rowTotal * 100).toFixed(0)}%` : '-'}
                </div>
            `;

            // Grid cells
            for (let col = 0; col < size; col++) {
                const tile = gridState.tiles.find(t => t.row === row && t.col === col);
                gridRows += this.renderGridCell(tile);
            }
        }

        return `
            <div class="grid-7x7-wrapper">
                <div class="grid-7x7" style="grid-template-columns: 40px repeat(${size}, 1fr);">
                    ${columnHeaders}
                    ${gridRows}
                </div>
            </div>
            ${this.selectedMedalId ? `
                <div class="grid-instructions">
                    Click an empty unlocked tile to place the selected medal
                </div>
            ` : ''}
        `;
    },

    /**
     * Render a single grid cell
     */
    renderGridCell(tile) {
        if (!tile) return '<div class="grid-cell locked"></div>';

        const { row, col, isUnlocked, medal, isEmpty, unlockLevel } = tile;

        let classes = ['grid-cell'];
        let content = '';
        let dataAttrs = `data-row="${row}" data-col="${col}"`;

        if (!isUnlocked) {
            classes.push('locked');
            content = `<span class="lock-level">Lv.${unlockLevel || '?'}</span>`;
        } else if (medal) {
            classes.push('has-medal');
            classes.push(`rarity-${medal.rarity}`);

            const perkCount = medal.perks?.length || 0;
            const primaryPerk = medal.perks?.[0];
            const perkIcon = primaryPerk && typeof PERK_STAT_POOL !== 'undefined'
                ? PERK_STAT_POOL[primaryPerk.stat]?.icon || '★'
                : '★';

            // Build ribbon style from medal's generated gradient
            const ribbonStyle = medal.ribbon?.cssGradient
                ? `background: ${medal.ribbon.cssGradient};`
                : '';

            content = `
                ${medal.ribbon ? `<div class="grid-cell-ribbon" style="${ribbonStyle}"></div>` : ''}
                <div class="medal-display">
                    <span class="medal-icon">${perkIcon}</span>
                    <span class="medal-perk-count">${perkCount}</span>
                </div>
            `;
            dataAttrs += ` data-medal-id="${medal.id}"`;
        } else {
            classes.push('empty');
            if (this.selectedMedalId) {
                classes.push('placeable');
            }
            content = '<span class="empty-slot">+</span>';
        }

        if (this.selectedGridCell === `${row}_${col}`) {
            classes.push('selected');
        }

        return `
            <div class="${classes.join(' ')}" ${dataAttrs}>
                ${content}
            </div>
        `;
    },

    /**
     * Render medal management tabs
     */
    renderMedalTabs() {
        return `
            <div class="medal-tabs">
                <button class="medal-tab ${this.craftingTab === 'inventory' ? 'active' : ''}"
                        data-tab="inventory">Inventory</button>
                <button class="medal-tab ${this.craftingTab === 'forge' ? 'active' : ''}"
                        data-tab="forge">Forge</button>
                <button class="medal-tab ${this.craftingTab === 'combine' ? 'active' : ''}"
                        data-tab="combine">Combine</button>
                <button class="medal-tab ${this.craftingTab === 'salvage' ? 'active' : ''}"
                        data-tab="salvage">Salvage</button>
            </div>
        `;
    },

    /**
     * Render medal content based on active tab
     */
    renderMedalContent(inventoryInfo, fragments) {
        switch (this.craftingTab) {
            case 'inventory':
                return this.renderMedalInventory(inventoryInfo);
            case 'forge':
                return this.renderForgePanel(fragments);
            case 'combine':
                return this.renderCombinePanel(inventoryInfo);
            case 'salvage':
                return this.renderSalvagePanel(inventoryInfo);
            default:
                return this.renderMedalInventory(inventoryInfo);
        }
    },

    /**
     * Render medal inventory
     */
    renderMedalInventory(inventoryInfo) {
        const { medals, count, capacity } = inventoryInfo;

        return `
            <div class="medal-inventory">
                <div class="inventory-header">
                    <span>${count}/${capacity} medals</span>
                    ${inventoryInfo.canExpand ? `
                        <button class="expand-btn" data-action="expand">
                            Expand (+${typeof MEDAL_INVENTORY_CONFIG !== 'undefined' ? MEDAL_INVENTORY_CONFIG.expansionAmount : 10})
                            <span class="cost">${inventoryInfo.expansionCost}◆</span>
                        </button>
                    ` : ''}
                </div>
                <div class="medal-grid">
                    ${medals.length === 0 ? `
                        <div class="empty-inventory">
                            No medals yet. Forge some!
                        </div>
                    ` : medals.map(medal => this.renderMedalCard(medal, 'inventory')).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render a medal card
     */
    renderMedalCard(medal, context = 'inventory') {
        const isSelected = this.selectedMedalId === medal.id;
        const isSelectedForCombine = this.selectedForCombine.includes(medal.id);
        const isSelectedForSalvage = this.selectedForSalvage.includes(medal.id);

        let classes = ['medal-card', `rarity-${medal.rarity}`];
        if (isSelected) classes.push('selected');
        if (isSelectedForCombine) classes.push('selected-combine');
        if (isSelectedForSalvage) classes.push('selected-salvage');

        const rarityInfo = typeof MEDAL_RARITIES !== 'undefined' ? MEDAL_RARITIES[medal.rarity] : null;
        const rarityName = rarityInfo?.name || medal.rarity;

        // Build ribbon style from generated gradient
        const ribbonStyle = medal.ribbon?.cssGradient
            ? `background: ${medal.ribbon.cssGradient};`
            : '';

        return `
            <div class="${classes.join(' ')}" data-medal-id="${medal.id}" data-context="${context}">
                ${medal.ribbon ? `
                    <div class="medal-ribbon-visual" style="${ribbonStyle}"></div>
                ` : ''}
                <div class="medal-header">
                    <span class="medal-rarity">${rarityName}</span>
                    <span class="medal-perk-count">${medal.perks?.length || 0} perks</span>
                </div>
                <div class="medal-perks">
                    ${(medal.perks || []).slice(0, 3).map(perk => {
                        const perkInfo = typeof PERK_STAT_POOL !== 'undefined' ? PERK_STAT_POOL[perk.stat] : null;
                        const icon = perkInfo?.icon || '•';
                        const name = perkInfo?.name || perk.stat;
                        const categoryColor = perkInfo ? CATEGORY_COLORS[perkInfo.category] || '#888' : '#888';
                        return `
                            <div class="medal-perk">
                                <span class="perk-icon" style="color: ${categoryColor}">${icon}</span>
                                <span class="perk-name">${name}</span>
                                <span class="perk-value">+${(perk.value * 100).toFixed(1)}%</span>
                            </div>
                        `;
                    }).join('')}
                    ${(medal.perks?.length || 0) > 3 ? `
                        <div class="medal-perk more">+${medal.perks.length - 3} more</div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render forge panel
     */
    renderForgePanel(fragments) {
        const tiers = typeof CRAFTING_TIERS !== 'undefined' ? CRAFTING_TIERS : {};
        const tierKeys = Object.keys(tiers).map(Number).sort((a, b) => a - b);

        return `
            <div class="forge-panel">
                <div class="forge-description">
                    Spend fragments to forge new medals. Higher tiers have better rarity chances.
                </div>

                <div class="tier-selector">
                    ${tierKeys.map(tier => {
                        const config = tiers[tier];
                        const canAfford = fragments >= config.cost;
                        const isSelected = this.forgeTier === tier;

                        return `
                            <button class="tier-btn ${isSelected ? 'selected' : ''} ${!canAfford ? 'unaffordable' : ''}"
                                    data-tier="${tier}">
                                <div class="tier-name">${config.name}</div>
                                <div class="tier-cost">${config.cost}◆</div>
                            </button>
                        `;
                    }).join('')}
                </div>

                ${this.forgeTier && tiers[this.forgeTier] ? `
                    <div class="forge-preview">
                        <h4>${tiers[this.forgeTier].name} Forge</h4>
                        <div class="rarity-chances">
                            ${Object.entries(tiers[this.forgeTier].rarityWeights || {}).map(([rarity, weight]) => {
                                const totalWeight = Object.values(tiers[this.forgeTier].rarityWeights).reduce((a, b) => a + b, 0);
                                const percent = ((weight / totalWeight) * 100).toFixed(1);
                                return `
                                    <div class="rarity-chance rarity-${rarity}">
                                        <span>${rarity}</span>
                                        <span>${percent}%</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="forge-actions">
                            <button class="forge-btn" data-action="forge" data-count="1"
                                    ${fragments < tiers[this.forgeTier].cost ? 'disabled' : ''}>
                                Forge 1 (${tiers[this.forgeTier].cost}◆)
                            </button>
                            <button class="forge-btn" data-action="forge" data-count="10"
                                    ${fragments < tiers[this.forgeTier].cost * 10 ? 'disabled' : ''}>
                                Forge 10 (${tiers[this.forgeTier].cost * 10}◆)
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render combine panel
     */
    renderCombinePanel(inventoryInfo) {
        const medals = inventoryInfo.medals;
        const preview = GameEngine.getCombinePreview ? GameEngine.getCombinePreview(this.selectedForCombine) : null;

        // Group medals by rarity for easier selection
        const byRarity = {};
        medals.forEach(m => {
            if (!byRarity[m.rarity]) byRarity[m.rarity] = [];
            byRarity[m.rarity].push(m);
        });

        return `
            <div class="combine-panel">
                <div class="combine-description">
                    Combine 3 medals of the same rarity to create 1 medal of higher rarity.
                    Stats from source medals influence the result.
                </div>

                <div class="combine-selection">
                    <h4>Selected: ${this.selectedForCombine.length}/3</h4>
                    <div class="selected-medals">
                        ${this.selectedForCombine.map(id => {
                            const medal = medals.find(m => m.id === id);
                            return medal ? this.renderMedalCard(medal, 'combine') : '';
                        }).join('')}
                        ${[...Array(3 - this.selectedForCombine.length)].map(() => `
                            <div class="medal-slot-empty">?</div>
                        `).join('')}
                    </div>
                </div>

                ${preview && preview.valid ? `
                    <div class="combine-preview">
                        <div class="preview-arrow">→</div>
                        <div class="preview-result rarity-${preview.resultRarity}">
                            ${preview.resultRarity} Medal
                        </div>
                        ${preview.inheritancePreview?.length > 0 ? `
                            <div class="inheritance-hint">
                                Likely perks: ${preview.inheritancePreview.slice(0, 3).map(p => p.name).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                    <button class="combine-btn" data-action="combine">
                        Combine Medals
                    </button>
                ` : preview && !preview.valid ? `
                    <div class="combine-error">${preview.error || 'Select 3 medals of the same rarity'}</div>
                ` : ''}

                <div class="available-medals">
                    <h4>Available Medals</h4>
                    ${Object.entries(byRarity).map(([rarity, rarityMedals]) => `
                        <div class="rarity-group">
                            <div class="rarity-label rarity-${rarity}">${rarity} (${rarityMedals.length})</div>
                            <div class="rarity-medals">
                                ${rarityMedals.map(m => this.renderMedalCard(m, 'combine-select')).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render salvage panel
     */
    renderSalvagePanel(inventoryInfo) {
        const medals = inventoryInfo.medals;
        const preview = GameEngine.getSalvagePreview ? GameEngine.getSalvagePreview(this.selectedForSalvage) : null;

        return `
            <div class="salvage-panel">
                <div class="salvage-description">
                    Destroy medals to recover fragments. Higher rarity medals yield more fragments.
                </div>

                <div class="salvage-selection">
                    <h4>Selected: ${this.selectedForSalvage.length}</h4>
                    ${preview ? `
                        <div class="salvage-preview">
                            Will recover: <span class="fragment-gain">+${preview.totalFragments}◆</span>
                        </div>
                    ` : ''}
                    <button class="salvage-btn" data-action="salvage"
                            ${this.selectedForSalvage.length === 0 ? 'disabled' : ''}>
                        Salvage ${this.selectedForSalvage.length} Medal${this.selectedForSalvage.length !== 1 ? 's' : ''}
                    </button>
                </div>

                <div class="salvage-medals">
                    <h4>Click medals to select for salvage</h4>
                    <div class="medal-grid">
                        ${medals.map(m => this.renderMedalCard(m, 'salvage')).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const container = document.getElementById('perkGridView');
        if (!container) return;

        // Tab switching
        container.querySelectorAll('.medal-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.craftingTab = e.target.dataset.tab;
                this.selectedForCombine = [];
                this.selectedForSalvage = [];
                this.render();
            });
        });

        // Grid cell clicks
        container.querySelectorAll('.grid-cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.handleGridCellClick(e));
        });

        // Medal card clicks
        container.querySelectorAll('.medal-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleMedalClick(e));
        });

        // Tier selection
        container.querySelectorAll('.tier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.forgeTier = parseInt(e.currentTarget.dataset.tier);
                this.render();
            });
        });

        // Action buttons
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling to globalHandlers
                this.handleAction(e);
            });
        });
    },

    /**
     * Handle grid cell click
     */
    handleGridCellClick(e) {
        const cell = e.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const medalId = cell.dataset.medalId;

        if (cell.classList.contains('locked')) {
            return; // Can't interact with locked cells
        }

        if (this.selectedMedalId && cell.classList.contains('empty')) {
            // Place selected medal
            const result = GameEngine.placeMedalFromInventory(this.selectedMedalId, row, col);
            if (result.success) {
                this.selectedMedalId = null;
                this.render();
            } else {
                console.warn('Failed to place medal:', result.error);
            }
        } else if (medalId) {
            // Click on existing medal - return to inventory
            const result = GameEngine.returnMedalToInventory(row, col);
            if (result.success) {
                this.render();
            } else {
                console.warn('Failed to return medal:', result.error);
            }
        }
    },

    /**
     * Handle medal card click
     */
    handleMedalClick(e) {
        const card = e.currentTarget;
        const medalId = card.dataset.medalId;
        const context = card.dataset.context;

        switch (context) {
            case 'inventory':
                // Select for placement
                this.selectedMedalId = this.selectedMedalId === medalId ? null : medalId;
                this.render();
                break;

            case 'combine-select':
                // Toggle selection for combining
                const combineIdx = this.selectedForCombine.indexOf(medalId);
                if (combineIdx >= 0) {
                    this.selectedForCombine.splice(combineIdx, 1);
                } else if (this.selectedForCombine.length < 3) {
                    this.selectedForCombine.push(medalId);
                }
                this.render();
                break;

            case 'combine':
                // Deselect from combine
                const idx = this.selectedForCombine.indexOf(medalId);
                if (idx >= 0) {
                    this.selectedForCombine.splice(idx, 1);
                    this.render();
                }
                break;

            case 'salvage':
                // Toggle selection for salvage
                const salvageIdx = this.selectedForSalvage.indexOf(medalId);
                if (salvageIdx >= 0) {
                    this.selectedForSalvage.splice(salvageIdx, 1);
                } else {
                    this.selectedForSalvage.push(medalId);
                }
                this.render();
                break;
        }
    },

    /**
     * Handle action buttons
     */
    handleAction(e) {
        const action = e.currentTarget.dataset.action;

        switch (action) {
            case 'forge':
                const count = parseInt(e.currentTarget.dataset.count) || 1;
                if (count === 1) {
                    const result = GameEngine.forgeMedal(this.forgeTier);
                    if (result.success) {
                        console.log('Forged medal:', result.medal);
                        this.showForgeResultModal([result.medal]);
                    } else {
                        console.warn('Forge failed:', result.error);
                        this.showForgeErrorModal(result.error);
                    }
                } else {
                    const result = GameEngine.forgeMedalBatch(this.forgeTier, count);
                    if (result.success) {
                        console.log(`Forged ${result.medals.length} medals`);
                        this.showForgeResultModal(result.medals);
                    } else {
                        console.warn('Batch forge failed:', result.error);
                        this.showForgeErrorModal(result.error);
                    }
                }
                this.render();
                break;

            case 'combine':
                if (this.selectedForCombine.length === 3) {
                    const result = GameEngine.combineMedals(this.selectedForCombine);
                    if (result.success) {
                        console.log('Combined into:', result.medal);
                        this.selectedForCombine = [];
                    } else {
                        console.warn('Combine failed:', result.error);
                    }
                    this.render();
                }
                break;

            case 'salvage':
                if (this.selectedForSalvage.length > 0) {
                    const result = GameEngine.salvageMedals(this.selectedForSalvage);
                    if (result.success) {
                        console.log(`Salvaged ${result.medalsDestroyed} medals for ${result.fragmentsGained} fragments`);
                        this.selectedForSalvage = [];
                    }
                    this.render();
                }
                break;

            case 'expand':
                const expandResult = GameEngine.expandMedalInventory();
                if (expandResult.success) {
                    console.log('Inventory expanded to', expandResult.newCapacity);
                } else {
                    console.warn('Expand failed:', expandResult.error);
                }
                this.render();
                break;
        }
    },

    /**
     * Show forge result modal with medal details
     */
    showForgeResultModal(medals) {
        // Remove any existing modal
        const existing = document.querySelector('.forge-result-modal');
        if (existing) existing.remove();

        // Group medals by rarity for summary
        const rarityCounts = {};
        medals.forEach(m => {
            rarityCounts[m.rarity] = (rarityCounts[m.rarity] || 0) + 1;
        });

        const modal = document.createElement('div');
        modal.className = 'forge-result-modal';
        modal.innerHTML = `
            <div class="forge-result-backdrop"></div>
            <div class="forge-result-content">
                <div class="forge-result-header">
                    <h3>Forged ${medals.length} Medal${medals.length !== 1 ? 's' : ''}!</h3>
                    <div class="forge-result-summary">
                        ${Object.entries(rarityCounts).map(([rarity, count]) => `
                            <span class="rarity-badge rarity-${rarity}">${count}x ${rarity}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="forge-result-medals">
                    ${medals.map(medal => this.renderForgeResultMedal(medal)).join('')}
                </div>
                <div class="forge-result-footer">
                    <button class="forge-result-close">Continue</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('.forge-result-backdrop').addEventListener('click', () => modal.remove());
        modal.querySelector('.forge-result-close').addEventListener('click', () => modal.remove());

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    },

    /**
     * Render a medal for the forge result modal
     */
    renderForgeResultMedal(medal) {
        const rarityInfo = typeof MEDAL_RARITIES !== 'undefined' ? MEDAL_RARITIES[medal.rarity] : null;
        const rarityName = rarityInfo?.name || medal.rarity;

        // Build ribbon style from generated gradient
        const ribbonStyle = medal.ribbon?.cssGradient
            ? `background: ${medal.ribbon.cssGradient};`
            : '';

        return `
            <div class="forge-result-medal rarity-${medal.rarity}">
                ${medal.ribbon ? `
                    <div class="medal-ribbon-visual" style="${ribbonStyle}"></div>
                ` : ''}
                <div class="medal-result-header">
                    <span class="medal-result-rarity">${rarityName}</span>
                    <span class="medal-result-perk-count">${medal.perks?.length || 0} perk${(medal.perks?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
                <div class="medal-result-perks">
                    ${(medal.perks || []).map(perk => {
                        const perkInfo = typeof PERK_STAT_POOL !== 'undefined' ? PERK_STAT_POOL[perk.stat] : null;
                        const icon = perkInfo?.icon || '•';
                        const name = perkInfo?.name || perk.stat;
                        const categoryColor = perkInfo ? CATEGORY_COLORS[perkInfo.category] || '#888' : '#888';
                        const percent = (perk.value * 100).toFixed(1);
                        return `
                            <div class="medal-result-perk">
                                <span class="perk-icon" style="color: ${categoryColor}">${icon}</span>
                                <span class="perk-name">${name}</span>
                                <span class="perk-value">+${percent}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Show forge error modal
     */
    showForgeErrorModal(error) {
        // Remove any existing modal
        const existing = document.querySelector('.forge-result-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'forge-result-modal forge-error-modal';
        modal.innerHTML = `
            <div class="forge-result-backdrop"></div>
            <div class="forge-result-content error-content">
                <div class="forge-result-header error-header">
                    <h3>Forge Failed</h3>
                </div>
                <div class="forge-error-message">
                    <span class="error-icon">⚠</span>
                    <p>${error}</p>
                </div>
                <div class="forge-result-footer">
                    <button class="forge-result-close">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('.forge-result-backdrop').addEventListener('click', () => modal.remove());
        modal.querySelector('.forge-result-close').addEventListener('click', () => modal.remove());

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    },

    /**
     * Get color for rarity
     */
    getRarityColor(rarity) {
        const colors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800',
            mythic: '#f44336',
            divine: '#00bcd4',
            transcendent: '#e91e63',
            creator: '#ffd700',
            batch: '#4a9eff',
            error: '#f44336',
            info: '#4a9eff'
        };
        return colors[rarity] || colors.info;
    }
};

// Make globally accessible
if (typeof window !== 'undefined') {
    window.PerkGridUI = PerkGridUI;
}
