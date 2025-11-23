/**
 * EQUIPMENT/BANK UI MODULE
 *
 * Handles rendering and updates for the equipment and bank inventory UI.
 * Extracted from ui.js for better modularity and maintainability.
 */

const EquipmentUI = {
    // State caching for performance optimization
    lastBankState: null,
    lastEquipmentState: null,

    /**
     * Initialize event listeners for instant updates
     */
    init() {
        // Listen to inventory events for instant bank updates
        if (typeof EventBus !== 'undefined') {
            EventBus.on('item-added', (data) => this.handleItemChanged(data));
            EventBus.on('item-removed', (data) => this.handleItemChanged(data));
            EventBus.on('equipment-instance-added', (data) => this.handleItemChanged(data));
            console.log('✅ EquipmentUI event listeners registered');
        }
    },

    /**
     * Handle inventory change events for instant UI updates
     */
    handleItemChanged(data) {
        // Only update if we're currently viewing the bank tab
        if (UICore.currentView === 'bank') {
            this.updateBank();
        }
    },

    /**
     * Update bank display
     */
    updateBank() {
        const bank = GameEngine.state.bank;

        // Create a snapshot of current bank state
        const currentState = {
            activeTab: bank.activeTab,
            itemsHash: JSON.stringify(bank.items),
            newItemsCount: bank.newItems.length,
            medalsCount: GameEngine.state.craftedMedals?.length || 0
        };

        // Only re-render if something actually changed
        const hasChanged = !this.lastBankState ||
            this.lastBankState.activeTab !== currentState.activeTab ||
            this.lastBankState.itemsHash !== currentState.itemsHash ||
            this.lastBankState.newItemsCount !== currentState.newItemsCount ||
            this.lastBankState.medalsCount !== currentState.medalsCount;

        if (hasChanged) {
            this.updateBankStats();
            this.updateBankTabs();
            this.updateBankGrid();
            this.lastBankState = currentState;
        }
    },

    /**
     * Update bank statistics
     */
    updateBankStats() {
        const container = document.getElementById("bankStats");
        if (!container) return;

        const bank = GameEngine.state.bank;

        // DUAL-BANK: Calculate stats from both storages
        const stackableTypes = Object.keys(bank.stackable || {}).length;
        const stackableQuantity = Object.values(bank.stackable || {}).reduce((sum, qty) => sum + qty, 0);

        const instancedTypes = Object.keys(bank.instanced || {}).length;

        const totalTypes = stackableTypes + instancedTypes;
        const totalQuantity = stackableQuantity + instancedTypes; // Instances count as 1 each

        const newItemCount = bank.newItems.length;

        // Add medals to total count
        const medalCount = GameEngine.state.craftedMedals?.length || 0;

        let html = '';

        // Dev tools removed - access via Dev modal in top header

        html += `
            <div style="background: #2a2a2a; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px;">
                <strong>Total Items:</strong> ${totalTypes} types |
                <strong>Total Quantity:</strong> ${totalQuantity} |
                <strong>Medals:</strong> ${medalCount} |
                <strong>New Items:</strong> <span style="color: #ffeb3b;">${newItemCount}</span>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Update bank tabs
     */
    updateBankTabs() {
        const container = document.getElementById("bankTabs");
        if (!container) return;

        const bank = GameEngine.state.bank;

        // Sort tabs by order
        const sortedTabs = Object.entries(bank.tabs).sort((a, b) => a[1].order - b[1].order);

        let html = "";

        for (let [tabId, tab] of sortedTabs) {
            const isActive = bank.activeTab === tabId;

            // Special handling for medal tab - count from craftedMedals array
            let itemCount;
            if (tabId === 'medal') {
                itemCount = GameEngine.state.craftedMedals?.length || 0;
            } else {
                itemCount = GameEngine.getItemsInTab(tabId).length;
            }

            html += `
                <button
                    class="bank-tab ${isActive ? 'active' : ''}"
                    onclick="switchBankTab('${tabId}')"
                >
                    ${tab.icon} ${tab.name} (${itemCount})
                </button>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Update bank item grid
     */
    updateBankGrid() {
        const container = document.getElementById("bankGrid");
        if (!container) return;

        const activeTab = GameEngine.state.bank.activeTab;

        // Special handling for medal tab
        if (activeTab === 'medal') {
            this.updateMedalGrid(container);
            return;
        }

        const items = GameEngine.getItemsInTab(activeTab);

        console.log(`[Bank] Active tab: ${activeTab}, Items found: ${items.length}`);

        if (items.length === 0) {
            container.innerHTML = '<div class="bank-empty">No items in this tab yet...<br><br>💡 Use debug buttons to add items!</div>';
            return;
        }

        let html = "";
        let renderedCount = 0;

        for (let item of items) {
            const def = item.definition;

            // Skip items with missing definitions (e.g., deleted perk items)
            if (!def) {
                console.warn(`⚠️ Item ${item.itemId} has no definition, skipping display`);
                continue;
            }

            // Use the ItemCard component
            const cardHtml = ItemCard.create(item.itemId, 'bank', {
                quantity: item.quantity,
                isNew: item.isNew
                // onClick defaults to inspectItem() for bank context
            });

            if (cardHtml) {
                html += cardHtml;
                renderedCount++;
            } else {
                console.warn(`⚠️ ItemCard.create returned empty for ${item.itemId}`);
            }
        }

        console.log(`[Bank] Rendered ${renderedCount} item cards, HTML length: ${html.length}`);
        container.innerHTML = html;
    },

    /**
     * Update medal grid (special rendering for medals)
     */
    updateMedalGrid(container) {
        const medals = GameEngine.state.craftedMedals || [];

        if (medals.length === 0) {
            container.innerHTML = '<div class="bank-empty">No medals crafted yet...<br><br>💡 Visit the Medals tab in Perks to craft medals!</div>';
            return;
        }

        let html = '';

        for (let medal of medals) {
            const rarityData = MedalCraftingSystem.rarities[medal.rarity];
            if (!rarityData) continue;

            // Build perks display
            let perksHtml = '';
            for (let perk of medal.perks) {
                // Format value based on perk type
                let displayValue;
                if (perk.stat === 'rowMultiplier' || perk.stat === 'colMultiplier') {
                    // Row/col multipliers show as multiplier values
                    displayValue = perk.value.toFixed(2) + 'x';
                } else {
                    // All other perks are percentage multipliers
                    displayValue = (perk.value * 100).toFixed(1) + '%';
                }

                perksHtml += `
                    <div style="font-size: 0.65em; margin: 1px 0; color: #ddd; line-height: 1.3; text-align: left;">
                        ${perk.name}: +${displayValue}
                    </div>
                `;
            }

            // Render medal as a bank-item styled card
            html += `
                <div class="bank-item medal-card" style="background: rgba(255,255,255,0.05); border: 2px solid ${rarityData.color}; border-radius: 6px; padding: 8px; cursor: pointer; display: flex; flex-direction: column;"
                     onclick="console.log('Medal clicked:', '${medal.id}')"
                     title="Click to view details">
                    <div style="text-align: center; margin-bottom: 5px;">
                        <div style="font-size: 1.8em;">${rarityData.icon}</div>
                        <div style="font-weight: bold; color: ${rarityData.color}; font-size: 0.75em;">${rarityData.name}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 5px; border-radius: 3px; flex-grow: 1; overflow-y: auto; max-height: 90px;">
                        ${perksHtml}
                    </div>
                    <div style="text-align: center; margin-top: 4px; font-size: 0.65em; color: #888;">
                        ${rarityData.powerMultiplier}x
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Update equipment display
     */
    updateEquipment() {
        const equipment = GameEngine.state.equipment;
        const playerHealth = GameEngine.state.combat.player.currentHealth;
        const totalWeight = GameEngine.getTotalEquippedWeight();

        // Create state snapshot
        const currentState = {
            equipment: JSON.stringify(equipment),
            health: playerHealth,
            weight: totalWeight
        };

        // Only re-render if state changed (always render on first call)
        const hasChanged = !this.lastEquipmentState ||
            this.lastEquipmentState.equipment !== currentState.equipment ||
            this.lastEquipmentState.health !== currentState.health ||
            this.lastEquipmentState.weight !== currentState.weight;

        if (hasChanged) {
            this.updatePlayerStats();
            this.updateEquipmentSlots();
            this.lastEquipmentState = currentState;
        }
    },

    /**
     * Update player stats display
     */
    updatePlayerStats() {
        // Use new summary stats container in horizontal layout
        let container = document.getElementById("equipmentSummaryStats");

        // Fallback to old playerStats container if horizontal layout not present
        if (!container) {
            container = document.getElementById("playerStats");
        }

        if (!container) return;

        const stats = GameEngine.getPlayerCombatStats();
        const currentWeight = GameEngine.getTotalEquippedWeight();
        const maxWeight = GameEngine.getMaxEquipmentWeight();

        // Get type information
        const weaponDamageType = GameEngine.getWeaponDamageType();
        const playerArmorType = GameEngine.getPlayerDominantArmorType();
        const weaponTypeDef = GameEngine.definitions.damageTypes[weaponDamageType];
        const armorTypeDef = GameEngine.definitions.armorTypes[playerArmorType];

        // Determine weight color based on capacity
        let weightColor = "#4a9eff"; // Default blue
        const weightPercent = (currentWeight / maxWeight) * 100;
        const isOverCapacity = currentWeight > maxWeight;

        if (isOverCapacity) {
            weightColor = "#f44336"; // Red when over capacity
        } else if (weightPercent >= 80) {
            weightColor = "#ff9800"; // Orange when near capacity
        }

        let html = `
            <div class="stat-row">
                <span class="stat-label">⚖️ Equipment Weight:</span>
                <span class="stat-value" style="color: ${weightColor};">
                    ${currentWeight.toFixed(1)} / ${maxWeight}
                    ${isOverCapacity ? ' ⚠️' : ''}
                </span>
            </div>
            ${isOverCapacity ? `
                <div class="stat-row" style="background: rgba(244, 67, 54, 0.1); padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                    <span style="color: #f44336; font-size: 0.85em;">
                        ⚠️ Over capacity! Cannot equip more items.
                    </span>
                </div>
            ` : ''}
            <div style="margin-bottom: 15px;">
                <div style="background: #1a1a1a; border-radius: 4px; overflow: hidden; height: 8px;">
                    <div style="background: ${weightColor}; width: ${Math.min(100, weightPercent)}%; height: 100%; transition: width 0.3s ease;"></div>
                </div>
                <div style="font-size: 0.75em; color: #888; margin-top: 4px; text-align: right;">
                    ${weightPercent.toFixed(0)}% capacity used
                </div>
            </div>
            <div class="stat-row">
                <span class="stat-label">${weaponTypeDef.icon} Weapon Type:</span>
                <span class="stat-value" style="color: ${weaponTypeDef.color};">${weaponTypeDef.name}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">${armorTypeDef.icon} Armor Type:</span>
                <span class="stat-value" style="color: ${armorTypeDef.color};">${armorTypeDef.name}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⚔️ Attack Damage:</span>
                <span class="stat-value">${stats.attackDamage.toFixed(1)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⚡ Attack Speed:</span>
                <span class="stat-value">${stats.attackSpeed.toFixed(2)}/s</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🎯 Accuracy:</span>
                <span class="stat-value">${stats.accuracy.toFixed(0)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">❤️ Health:</span>
                <span class="stat-value">${Math.floor(stats.currentHealth)}/${Math.floor(stats.maxHealth)}</span>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Update equipment slots display
     */
    updateEquipmentSlots() {
        const container = document.getElementById("equipmentGrid");
        if (!container) {
            console.warn("⚠️ equipmentGrid container not found!");
            return;
        }

        let html = '';

        // Add equipment display using EquipmentComponent
        html += EquipmentComponent.render({
            mode: 'horizontal',
            showLabels: true,
            interactive: true
        });

        // Add equipment presets section at the bottom (if EquipmentPresetsUI is available)
        if (typeof EquipmentPresetsUI !== 'undefined') {
            html += `
                <div class="equipment-presets-section" style="margin-top: var(--space-xl);">
                    <h3 style="font-family: var(--font-display); font-size: var(--font-size-lg); color: var(--color-primary); margin: 0 0 var(--space-md) 0; text-transform: uppercase; letter-spacing: var(--letter-spacing-wider);">
                        💾 Equipment Presets
                    </h3>
                    ${EquipmentPresetsUI.render()}
                </div>
            `;
        }

        container.innerHTML = html;
    }
};
