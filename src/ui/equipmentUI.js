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

        const totalItems = Object.keys(bank.items).length;
        const totalQuantity = Object.values(bank.items).reduce((sum, item) => sum + item.quantity, 0);
        const newItemCount = bank.newItems.length;

        // Add medals to total count
        const medalCount = GameEngine.state.craftedMedals?.length || 0;

        let html = '';

        // Dev tools removed - access via Dev modal in top header

        html += `
            <div style="background: #2a2a2a; padding: 10px 15px; border-radius: 5px; margin-bottom: 15px;">
                <strong>Total Items:</strong> ${totalItems} types |
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

        if (items.length === 0) {
            container.innerHTML = '<div class="bank-empty">No items in this tab yet...<br><br>💡 Use debug buttons to add items!</div>';
            return;
        }

        let html = "";

        for (let item of items) {
            const def = item.definition;

            // Skip items with missing definitions (e.g., deleted perk items)
            if (!def) {
                console.warn(`⚠️ Item ${item.itemId} has no definition, skipping display`);
                continue;
            }

            // Use the standardized ItemCard component
            html += ItemCard.create(item.itemId, 'bank', {
                quantity: item.quantity,
                isNew: item.isNew
            });
        }

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
        if (weightPercent >= 100) {
            weightColor = "#f44336"; // Red when at/over capacity
        } else if (weightPercent >= 80) {
            weightColor = "#ff9800"; // Orange when near capacity
        }

        let html = `
            <div class="stat-row">
                <span class="stat-label">⚖️ Equipment Weight:</span>
                <span class="stat-value" style="color: ${weightColor};">${currentWeight} / ${maxWeight}</span>
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

        // Use EquipmentComponent with horizontal layout mode (3 containers side-by-side)
        container.innerHTML = EquipmentComponent.render({
            mode: 'horizontal',
            showLabels: true,
            interactive: true
        });
    }
};
