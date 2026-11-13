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
    // Debounce timer for bank updates
    bankUpdatePending: false,
    bankUpdateTimeout: null,

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
     * Uses debouncing to prevent rapid re-renders during crafting
     */
    handleItemChanged(data) {
        // Only update if we're currently viewing the bank tab
        if (UICore.currentView === 'bank') {
            // Debounce: wait 150ms before updating to batch rapid changes
            if (this.bankUpdateTimeout) {
                clearTimeout(this.bankUpdateTimeout);
            }
            this.bankUpdatePending = true;
            this.bankUpdateTimeout = setTimeout(() => {
                this.bankUpdatePending = false;
                this.updateBank();
            }, 150);
        }
    },

    /**
     * Update bank display
     */
    updateBank() {
        // Skip if a debounced update is already pending (prevents double updates)
        if (this.bankUpdatePending) {
            return;
        }

        const bank = GameEngine.state.bank;

        // DUAL-BANK: Create a snapshot of current bank state (all storage locations)
        const currentState = {
            activeTab: bank.activeTab,
            itemsHash: JSON.stringify(bank.items || {}),
            instancedHash: JSON.stringify(bank.instanced || {}),
            stackableHash: JSON.stringify(bank.stackable || {}),
            newItemsCount: bank.newItems?.length || 0,
            medalsCount: GameEngine.state.craftedMedals?.length || 0
        };

        // Only re-render if something actually changed
        const hasChanged = !this.lastBankState ||
            this.lastBankState.activeTab !== currentState.activeTab ||
            this.lastBankState.itemsHash !== currentState.itemsHash ||
            this.lastBankState.instancedHash !== currentState.instancedHash ||
            this.lastBankState.stackableHash !== currentState.stackableHash ||
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

            // Compact category chip: icon + name only (counts dropped so the
            // full set fits without horizontal spill). Spans match the shared
            // tab styling used across the other views.
            html += `
                <button
                    class="bank-tab ${isActive ? 'active' : ''}"
                    onclick="switchBankTab('${tabId}')"
                >
                    <span class="tab-icon">${tab.icon}</span>
                    <span class="tab-label">${tab.name}</span>
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
        // Get player health - check multiple possible locations
        const playerHealth = GameEngine.state.player?.currentHP
            || GameEngine.state.combat?.player?.currentHealth
            || GameEngine.state.combat?.player?.currentHP
            || 100;
        const totalWeight = GameEngine.getTotalEquippedWeight ? GameEngine.getTotalEquippedWeight() : 0;

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
            this.updateEquipmentSlots();
            this.lastEquipmentState = currentState;
        }
    },

    /**
     * Update equipment slots display
     * Uses split layout: Equipment (vertical stack) on left, Presets on right
     * Below 1000px: Everything stacks vertically
     */
    updateEquipmentSlots() {
        const container = document.getElementById("equipmentGrid");
        if (!container) {
            console.warn("⚠️ equipmentGrid container not found!");
            return;
        }

        const equipment = GameEngine.state.equipment || {};
        const intellect = GameEngine.state.combatAttributes?.intellect || 0;
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        let html = '';

        // Split layout: Equipment (left) | Presets (right)
        html += `<div class="equipment-view-container">`;

        // Left side: Equipment panels stacked vertically
        html += `<div class="equipment-main-panel">`;

        // Equipment Grid Container
        html += `
            <div class="equipment-section-card">
                <div class="equipment-section-header">
                    <span class="section-icon">⚔️</span>
                    <span class="section-title">Equipment</span>
                    <span class="section-subtitle">Main Gear</span>
                </div>
                <div class="equipment-section-content">
                    ${renderer ? renderer.renderEquipmentGrid({
                        equipment,
                        size: 'lg',
                        showLabels: true,
                        showNames: true,
                        interactive: true,
                        onSlotClick: (slot) => `openEquipModal('${slot}', event)`
                    }) : this._renderEquipmentGridFallback()}
                </div>
            </div>
        `;

        // Consumables Container
        html += `
            <div class="equipment-section-card">
                <div class="equipment-section-header">
                    <span class="section-icon">🍖</span>
                    <span class="section-title">Consumables</span>
                    <span class="section-subtitle">Food • Potions • Ammo</span>
                </div>
                <div class="equipment-section-content">
                    ${renderer ? renderer.renderConsumablesRow({
                        equipment,
                        size: 'lg',
                        showLabels: true,
                        interactive: true,
                        onSlotClick: (slot) => `openEquipModal('${slot}', event)`
                    }) : ''}
                </div>
            </div>
        `;

        // Technology Container
        html += `
            <div class="equipment-section-card">
                <div class="equipment-section-header">
                    <span class="section-icon">⚡</span>
                    <span class="section-title">Technology</span>
                    <span class="section-subtitle">Advanced Tech Slots</span>
                </div>
                <div class="equipment-section-content">
                    ${renderer ? renderer.renderTechRow({
                        equipment,
                        intellect,
                        size: 'lg',
                        showLabels: true,
                        interactive: true,
                        onSlotClick: (slot) => `openEquipModal('${slot}', event)`
                    }) : ''}
                </div>
            </div>
        `;

        html += `</div>`; // Close equipment-main-panel

        // Right side: Presets panel (if EquipmentPresetsUI is available)
        if (typeof EquipmentPresetsUI !== 'undefined') {
            html += `
                <div class="equipment-presets-panel">
                    <div class="equipment-presets-header">
                        <span class="presets-icon">💾</span>
                        <span class="presets-title">Equipment Presets</span>
                    </div>
                    ${EquipmentPresetsUI.render()}
                </div>
            `;
        }

        html += `</div>`; // Close equipment-view-container

        container.innerHTML = html;
    },

    /**
     * Fallback equipment grid rendering
     * @private
     */
    _renderEquipmentGridFallback() {
        return EquipmentComponent.renderEquipmentGrid(true, true);
    }
};
