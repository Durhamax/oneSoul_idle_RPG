/**
 * ENGINEERING TAB
 *
 * Advanced crafting features:
 * - Equipment Perfection (10 items -> 1 higher rarity)
 * - Technology Assembly (create tech items)
 * - Salvaging (recover materials from items)
 * - Engineering statistics
 */

const EngineeringTab = {
    // Selection state for perfection
    selectedItems: [],

    /**
     * Initialize engineering tab
     */
    init() {
        console.log('[EngineeringTab] Initialized');
        this.selectedItems = [];
    },

    /**
     * Render the engineering tab content
     */
    render() {
        const engineeringLevel = GameEngine.state.skills?.engineering?.level || 1;
        const engineeringState = GameEngine.state.engineering || {};

        return `
            <div class="engineering-tab">
                <div class="engineering-header">
                    <div class="engineering-level">
                        <span class="level-icon">🔬</span>
                        <span class="level-text">Engineering Lab</span>
                        <span class="level-value">Level ${engineeringLevel}</span>
                    </div>
                </div>

                <div class="engineering-grid">
                    ${this.renderPerfectionPanel(engineeringLevel)}
                    ${this.renderTechnologyPanel(engineeringLevel)}
                    ${this.renderSalvagePanel(engineeringLevel)}
                    ${this.renderStatisticsPanel(engineeringState)}
                </div>
            </div>
        `;
    },

    /**
     * Render Equipment Perfection panel
     */
    renderPerfectionPanel(engineeringLevel) {
        // Calculate success rate based on engineering level
        const baseSuccessRate = 25;
        const bonusPerLevel = 0.5;
        const successRate = Math.min(75, baseSuccessRate + (engineeringLevel * bonusPerLevel));

        // Get items that can be perfected (equipment in bank with same base type and rarity)
        const perfectableGroups = this.getPerfectableItemGroups();

        let groupsHtml = '';
        if (Object.keys(perfectableGroups).length === 0) {
            groupsHtml = `
                <div class="no-items-message">
                    <p>No equipment available for perfection.</p>
                    <p class="hint">Collect 10 items of the same type and rarity to combine them.</p>
                </div>
            `;
        } else {
            groupsHtml = '<div class="perfection-groups">';
            for (const [key, group] of Object.entries(perfectableGroups)) {
                const canPerfect = group.count >= 10;
                groupsHtml += `
                    <div class="perfection-group ${canPerfect ? 'ready' : ''}">
                        <div class="group-icon">${group.icon}</div>
                        <div class="group-info">
                            <div class="group-name">${group.name}</div>
                            <div class="group-rarity rarity-${group.rarity}">${group.rarity}</div>
                        </div>
                        <div class="group-count">${group.count}/10</div>
                        ${canPerfect ? `
                            <button class="perfect-btn" onclick="EngineeringTab.perfectItems('${key}')">
                                ✨ Perfect
                            </button>
                        ` : ''}
                    </div>
                `;
            }
            groupsHtml += '</div>';
        }

        return `
            <div class="engineering-panel perfection-panel">
                <div class="panel-header">
                    <h3>✨ Equipment Perfection</h3>
                    <p class="panel-desc">Combine 10 items to create 1 of higher rarity</p>
                </div>
                <div class="panel-content">
                    <div class="success-rate">
                        <span class="rate-label">Success Rate:</span>
                        <span class="rate-value">${successRate.toFixed(1)}%</span>
                        <span class="rate-bonus">(+${(engineeringLevel * bonusPerLevel).toFixed(1)}% from Engineering)</span>
                    </div>
                    <div class="failure-info">
                        On failure: Return ${Math.min(5, Math.floor(engineeringLevel / 10))} items
                    </div>
                    ${groupsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render Technology Assembly panel
     */
    renderTechnologyPanel(engineeringLevel) {
        // Get available technology recipes
        const techRecipes = this.getTechnologyRecipes(engineeringLevel);

        let recipesHtml = '';
        if (techRecipes.length === 0) {
            recipesHtml = `
                <div class="no-items-message">
                    <p>No technology recipes available.</p>
                    <p class="hint">Level up Engineering to unlock technology assembly.</p>
                </div>
            `;
        } else {
            recipesHtml = '<div class="tech-recipes">';
            for (const recipe of techRecipes) {
                const canCraft = this.canCraftTechnology(recipe);
                recipesHtml += `
                    <div class="tech-recipe ${canCraft ? 'available' : 'unavailable'}">
                        <div class="tech-icon">${recipe.icon || '⚙️'}</div>
                        <div class="tech-info">
                            <div class="tech-name">${recipe.name}</div>
                            <div class="tech-desc">${recipe.description || ''}</div>
                        </div>
                        <div class="tech-reqs">
                            ${recipe.materials.map(m => `
                                <span class="tech-mat ${GameEngine.getItemCount(m.itemId) >= m.quantity ? 'has' : 'missing'}">
                                    ${m.quantity}x ${this.getItemName(m.itemId)}
                                </span>
                            `).join('')}
                        </div>
                        <button class="assemble-btn ${canCraft ? '' : 'disabled'}"
                                onclick="EngineeringTab.assembleTechnology('${recipe.id}')"
                                ${canCraft ? '' : 'disabled'}>
                            🔧 Assemble
                        </button>
                    </div>
                `;
            }
            recipesHtml += '</div>';
        }

        return `
            <div class="engineering-panel technology-panel">
                <div class="panel-header">
                    <h3>🔧 Technology Assembly</h3>
                    <p class="panel-desc">Create advanced technology items</p>
                </div>
                <div class="panel-content">
                    <div class="tech-level-req">
                        Minimum Engineering Level: ${engineeringLevel >= 10 ? '✓ Met' : '🔒 10 Required'}
                    </div>
                    ${recipesHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render Salvage panel
     */
    renderSalvagePanel(engineeringLevel) {
        // Calculate material recovery rate
        const baseRecovery = 25;
        const bonusPerLevel = 0.75;
        const recoveryRate = Math.min(100, baseRecovery + (engineeringLevel * bonusPerLevel));

        // Get salvageable items from bank
        const salvageableItems = this.getSalvageableItems();

        let itemsHtml = '';
        if (salvageableItems.length === 0) {
            itemsHtml = `
                <div class="no-items-message">
                    <p>No items available to salvage.</p>
                    <p class="hint">Equipment and crafted items can be salvaged for materials.</p>
                </div>
            `;
        } else {
            itemsHtml = '<div class="salvage-items">';
            for (const item of salvageableItems.slice(0, 10)) { // Show first 10
                itemsHtml += `
                    <div class="salvage-item">
                        <div class="salvage-icon">${item.icon || '📦'}</div>
                        <div class="salvage-info">
                            <div class="salvage-name">${item.name}</div>
                            <div class="salvage-rarity rarity-${item.rarity || 'common'}">${item.rarity || 'common'}</div>
                        </div>
                        <button class="salvage-btn" onclick="EngineeringTab.salvageItem('${item.itemId}')">
                            ♻️ Salvage
                        </button>
                    </div>
                `;
            }
            if (salvageableItems.length > 10) {
                itemsHtml += `<div class="more-items">...and ${salvageableItems.length - 10} more items</div>`;
            }
            itemsHtml += '</div>';
        }

        return `
            <div class="engineering-panel salvage-panel">
                <div class="panel-header">
                    <h3>♻️ Salvaging</h3>
                    <p class="panel-desc">Recover materials from items</p>
                </div>
                <div class="panel-content">
                    <div class="recovery-rate">
                        <span class="rate-label">Recovery Rate:</span>
                        <span class="rate-value">${recoveryRate.toFixed(0)}%</span>
                        <span class="rate-bonus">(+${(engineeringLevel * bonusPerLevel).toFixed(1)}% from Engineering)</span>
                    </div>
                    ${itemsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Render Statistics panel
     */
    renderStatisticsPanel(engineeringState) {
        const stats = engineeringState.statistics || {
            itemsPerfected: 0,
            perfectionSuccesses: 0,
            perfectionFailures: 0,
            technologiesAssembled: 0,
            itemsSalvaged: 0,
            materialsSaved: 0
        };

        const successRate = stats.itemsPerfected > 0
            ? ((stats.perfectionSuccesses / stats.itemsPerfected) * 100).toFixed(1)
            : '0.0';

        return `
            <div class="engineering-panel statistics-panel">
                <div class="panel-header">
                    <h3>📊 Engineering Statistics</h3>
                </div>
                <div class="panel-content">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">${stats.itemsPerfected}</span>
                            <span class="stat-label">Items Perfected</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${successRate}%</span>
                            <span class="stat-label">Perfection Rate</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${stats.technologiesAssembled}</span>
                            <span class="stat-label">Tech Assembled</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${stats.itemsSalvaged}</span>
                            <span class="stat-label">Items Salvaged</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${Formatting.formatNumber(stats.materialsSaved)}</span>
                            <span class="stat-label">Materials Saved</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ===========================
    // HELPER METHODS
    // ===========================

    /**
     * Get items that can be perfected, grouped by type and rarity
     */
    getPerfectableItemGroups() {
        const groups = {};
        const bank = GameEngine.state.bank?.items || {};

        for (const [itemId, itemData] of Object.entries(bank)) {
            if (!itemData || itemData.quantity < 1) continue;

            const def = itemData.definition;
            if (!def || !def.equipSlot) continue; // Only equipment

            const rarity = def.rarity || 'common';
            if (rarity === 'creator') continue; // Can't perfect max rarity

            // Group by base item type and rarity
            const baseId = itemId.replace(/_\d+$/, ''); // Remove instance suffix
            const key = `${baseId}_${rarity}`;

            if (!groups[key]) {
                groups[key] = {
                    baseId: baseId,
                    name: def.name,
                    icon: def.image || '📦',
                    rarity: rarity,
                    count: 0,
                    items: []
                };
            }

            groups[key].count += itemData.quantity;
            groups[key].items.push(itemId);
        }

        return groups;
    },

    /**
     * Get technology recipes available at current level
     */
    getTechnologyRecipes(engineeringLevel) {
        // Return empty for now - technology recipes would come from a registry
        // This is a placeholder for future implementation
        if (engineeringLevel < 10) return [];

        // Example technology recipes
        return [
            {
                id: 'recon_drone',
                name: 'Recon Drone',
                icon: '🛸',
                description: 'Increases discovery chance by 10%',
                requiredLevel: 10,
                materials: [
                    { itemId: 'basic_circuit', quantity: 3 },
                    { itemId: 'battery_cell', quantity: 2 },
                    { itemId: 'sensor_module', quantity: 1 }
                ]
            },
            {
                id: 'shield_generator',
                name: 'Shield Generator',
                icon: '🛡️',
                description: 'Provides +50 shield HP',
                requiredLevel: 20,
                materials: [
                    { itemId: 'advanced_circuit', quantity: 2 },
                    { itemId: 'power_cell', quantity: 1 },
                    { itemId: 'capacitor', quantity: 4 }
                ]
            }
        ].filter(r => engineeringLevel >= r.requiredLevel);
    },

    /**
     * Check if player can craft a technology
     */
    canCraftTechnology(recipe) {
        for (const mat of recipe.materials) {
            if (GameEngine.getItemCount(mat.itemId) < mat.quantity) {
                return false;
            }
        }
        return true;
    },

    /**
     * Get salvageable items from bank
     */
    getSalvageableItems() {
        const items = [];
        const bank = GameEngine.state.bank?.items || {};

        for (const [itemId, itemData] of Object.entries(bank)) {
            if (!itemData || itemData.quantity < 1) continue;

            const def = itemData.definition;
            if (!def) continue;

            // Equipment and crafted items can be salvaged
            if (def.equipSlot || def.category === 'crafted') {
                items.push({
                    itemId: itemId,
                    name: def.name,
                    icon: def.image,
                    rarity: def.rarity || 'common',
                    quantity: itemData.quantity
                });
            }
        }

        return items;
    },

    /**
     * Get item name by ID
     */
    getItemName(itemId) {
        if (typeof ItemAccessHelper !== 'undefined') {
            const item = ItemAccessHelper.getItem(itemId);
            if (item) return item.name;
        }
        return itemId;
    },

    // ===========================
    // ACTION METHODS
    // ===========================

    /**
     * Perfect items of a group
     */
    perfectItems(groupKey) {
        console.log(`[EngineeringTab] Perfecting: ${groupKey}`);

        if (typeof EngineeringSystem !== 'undefined' && EngineeringSystem.perfectEquipment) {
            const groups = this.getPerfectableItemGroups();
            const group = groups[groupKey];

            if (group && group.count >= 10) {
                // Get 10 item IDs to perfect
                const itemIds = group.items.slice(0, 10);
                const result = EngineeringSystem.perfectEquipment(itemIds);

                if (result && result.success) {
                    console.log('[EngineeringTab] Perfection successful!');
                    // Re-render
                    const content = document.getElementById('crafting-content');
                    if (content) {
                        content.innerHTML = this.render();
                    }
                } else {
                    console.warn('[EngineeringTab] Perfection failed:', result?.reason);
                }
            }
        }
    },

    /**
     * Assemble a technology item
     */
    assembleTechnology(recipeId) {
        console.log(`[EngineeringTab] Assembling: ${recipeId}`);

        if (typeof EngineeringSystem !== 'undefined' && EngineeringSystem.assemblyTechnology) {
            const result = EngineeringSystem.assemblyTechnology(recipeId);

            if (result && result.success) {
                console.log('[EngineeringTab] Assembly successful!');
                // Re-render
                const content = document.getElementById('crafting-content');
                if (content) {
                    content.innerHTML = this.render();
                }
            } else {
                console.warn('[EngineeringTab] Assembly failed:', result?.reason);
            }
        }
    },

    /**
     * Salvage an item
     */
    salvageItem(itemId) {
        console.log(`[EngineeringTab] Salvaging: ${itemId}`);

        if (typeof EngineeringSystem !== 'undefined' && EngineeringSystem.salvageItem) {
            const result = EngineeringSystem.salvageItem(itemId);

            if (result && result.success) {
                console.log('[EngineeringTab] Salvage successful! Materials:', result.materials);
                // Re-render
                const content = document.getElementById('crafting-content');
                if (content) {
                    content.innerHTML = this.render();
                }
            } else {
                console.warn('[EngineeringTab] Salvage failed:', result?.reason);
            }
        }
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.EngineeringTab = EngineeringTab;
}
