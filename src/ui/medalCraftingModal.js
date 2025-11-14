/**
 * MEDAL CRAFTING MODAL UI
 *
 * Modal popup for crafting medals from the Perk tab
 * - 9-tier crafting system
 * - Visual pie charts
 * - Pity progress bars
 * - Economy calculator
 * - Power comparison
 */

const MedalCraftingModal = {
    /**
     * Show the medal crafting modal
     */
    show() {
        let modal = document.getElementById('medalCraftingModal');

        // Create modal if it doesn't exist
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'medalCraftingModal';
            modal.className = 'modal';
            modal.style.display = 'none';
            document.body.appendChild(modal);
        }

        // Render content
        modal.innerHTML = this.renderModalContent();
        modal.style.display = 'block';

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.hide();
            }
        };
    },

    /**
     * Hide the modal
     */
    hide() {
        const modal = document.getElementById('medalCraftingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Render modal content
     */
    renderModalContent() {
        const stats = GameEngine.getMedalCraftingStats();
        const currentMedals = GameEngine.state.currencies?.medals || 0;

        return `
            <div class="modal-content" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="margin: 0; color: #ff9800;">🏅 Medal Crafting System</h2>
                    <button class="modal-close" onclick="MedalCraftingModal.hide()">&times;</button>
                </div>

                <div style="padding: 20px;">
                    <!-- Status Bar -->
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-around; align-items: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 0.8em; color: #888;">Medal Currency</div>
                            <div style="font-size: 1.8em; font-weight: bold; color: #ff9800;">${this.formatNumber(currentMedals)}</div>
                            <button onclick="MedalCraftingModal.addMaxMedals()"
                                    style="margin-top: 8px; padding: 6px 12px; background: rgba(255, 152, 0, 0.3); border: 1px solid #ff9800; border-radius: 4px; color: #ff9800; font-size: 0.75em; cursor: pointer; font-weight: bold;"
                                    onmouseover="this.style.background='rgba(255, 152, 0, 0.5)'"
                                    onmouseout="this.style.background='rgba(255, 152, 0, 0.3)'">
                                🔧 DEV: Add Max
                            </button>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.8em; color: #888;">Total Crafted</div>
                            <div style="font-size: 1.8em; font-weight: bold; color: #4a9eff;">${stats.totalCrafted}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 0.8em; color: #888;">In Inventory</div>
                            <div style="font-size: 1.8em; font-weight: bold; color: #4caf50;">${stats.inventoryMedals}</div>
                        </div>
                    </div>

                    <!-- Crafting Tiers Grid -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                        ${this.renderAllTiers(currentMedals, stats)}
                    </div>

                    <!-- Power Comparison -->
                    ${this.renderPowerComparison()}

                    <!-- Economy Calculator -->
                    ${this.renderEconomyCalculator(currentMedals)}

                    <!-- Developer Tools -->
                    ${this.renderDevTools()}
                </div>
            </div>
        `;
    },

    /**
     * Render all 9 crafting tiers
     */
    renderAllTiers(currentMedals, stats) {
        let html = '';

        for (let tierId in MedalCraftingSystem.craftingTiers) {
            const tier = MedalCraftingSystem.craftingTiers[tierId];
            const canAfford = currentMedals >= tier.cost;
            const pityCounters = stats.pityCounters || {};

            html += `
                <div style="background: rgba(255,255,255,0.05); border: 2px solid ${tier.color}; border-radius: 8px; padding: 12px;">
                    <!-- Tier Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <span style="font-size: 1.5em;">${tier.icon}</span>
                            <span style="font-weight: bold; margin-left: 5px; color: ${tier.color};">${tier.name}</span>
                        </div>
                        <div style="font-size: 0.85em; color: #aaa;">${this.formatNumber(tier.cost)}</div>
                    </div>

                    <!-- Pie Chart -->
                    ${this.renderPieChart(tier.rarityChances, tierId)}

                    <!-- Craft Button -->
                    <button onclick="MedalCraftingModal.craft('${tierId}', 1)"
                            ${!canAfford ? 'disabled' : ''}
                            style="width: 100%; padding: 8px; margin-top: 10px; background: ${canAfford ? tier.color : '#555'}; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                        Craft 1 (${tier.cost} 🏅)
                    </button>

                    <div style="display: flex; gap: 5px; margin-top: 5px;">
                        <button onclick="MedalCraftingModal.craft('${tierId}', 10)"
                                ${currentMedals < tier.cost * 10 ? 'disabled' : ''}
                                style="flex: 1; padding: 6px; background: ${currentMedals >= tier.cost * 10 ? tier.color : '#555'}; border: none; border-radius: 4px; color: white; font-size: 0.85em; cursor: ${currentMedals >= tier.cost * 10 ? 'pointer' : 'not-allowed'};">
                            x10
                        </button>
                        <button onclick="MedalCraftingModal.craftMax('${tierId}')"
                                ${!canAfford ? 'disabled' : ''}
                                style="flex: 1; padding: 6px; background: ${canAfford ? tier.color : '#555'}; border: none; border-radius: 4px; color: white; font-size: 0.85em; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                            MAX
                        </button>
                    </div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Render simple text-based pie chart showing rarity chances
     */
    renderPieChart(chances, tierId) {
        let html = '<div style="margin: 10px 0; font-size: 0.75em;">';

        // Get non-zero chances
        const entries = Object.entries(chances).filter(([_, chance]) => chance > 0);

        for (let [rarity, chance] of entries) {
            const rarityData = MedalCraftingSystem.rarities[rarity];
            if (!rarityData) continue;

            const percentage = (chance * 100).toFixed(1);
            const barWidth = Math.max(chance * 100, 2); // Min 2% width for visibility

            html += `
                <div style="margin: 3px 0;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 60px; color: ${rarityData.color};">${rarityData.icon} ${rarityData.name.substring(0, 4)}</span>
                        <div style="flex: 1; background: rgba(0,0,0,0.3); border-radius: 3px; height: 12px; overflow: hidden;">
                            <div style="width: ${barWidth}%; height: 100%; background: ${rarityData.color};"></div>
                        </div>
                        <span style="width: 40px; text-align: right; color: #aaa;">${percentage}%</span>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render pity progress bars
     */
    renderPityProgress(pityCounters, chances) {
        // Only show pity for rarities available in this tier
        const highestRarity = Object.keys(chances).reverse().find(r => chances[r] > 0);
        if (!highestRarity || highestRarity === 'common') return '';

        const pityCount = pityCounters[highestRarity] || 0;
        if (pityCount === 0) return '';

        const rarityData = MedalCraftingSystem.rarities[highestRarity];
        const maxPity = 100; // Visual max for progress bar

        return `
            <div style="margin-top: 8px; padding: 6px; background: rgba(255,152,0,0.1); border-radius: 4px; border: 1px solid #ff9800;">
                <div style="font-size: 0.7em; color: #ff9800; margin-bottom: 3px;">
                    🎰 Pity: ${pityCount} (${rarityData.icon} ${rarityData.name})
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 3px; height: 8px; overflow: hidden;">
                    <div style="width: ${Math.min((pityCount / maxPity) * 100, 100)}%; height: 100%; background: linear-gradient(90deg, #ff9800, #f44336);"></div>
                </div>
            </div>
        `;
    },

    /**
     * Render power comparison grid
     */
    renderPowerComparison() {
        return `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">⚡ Power Comparison</h4>
                <div style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 8px;">
                    ${this.renderPowerBars()}
                </div>
                <div style="margin-top: 10px; font-size: 0.85em; color: #aaa;">
                    Power multiplier shows how much stronger each rarity is compared to Common (1x)
                </div>
            </div>
        `;
    },

    /**
     * Render power bars for each rarity
     */
    renderPowerBars() {
        let html = '';
        const maxPower = 50; // Creator's multiplier

        for (let rarity in MedalCraftingSystem.rarities) {
            const rarityData = MedalCraftingSystem.rarities[rarity];
            const heightPercent = (rarityData.powerMultiplier / maxPower) * 100;

            html += `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="flex: 1; display: flex; align-items: flex-end; min-height: 100px;">
                        <div style="width: 100%; background: ${rarityData.color}; height: ${heightPercent}%; border-radius: 4px 4px 0 0; min-height: 10px;"></div>
                    </div>
                    <div style="font-size: 1.2em; margin-top: 5px;">${rarityData.icon}</div>
                    <div style="font-size: 0.65em; color: ${rarityData.color};">${rarityData.powerMultiplier}x</div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Render economy calculator
     */
    renderEconomyCalculator(currentMedals) {
        const medalsPerHour = 1000; // Placeholder - should calculate from actual combat stats

        let html = `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                <h4 style="margin-top: 0;">📊 Economy Calculator</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
        `;

        // Calculate time to afford each tier
        for (let tierId in MedalCraftingSystem.craftingTiers) {
            const tier = MedalCraftingSystem.craftingTiers[tierId];
            const timeToAfford = Math.max(0, (tier.cost - currentMedals) / medalsPerHour);

            let timeText;
            if (currentMedals >= tier.cost) {
                timeText = '✅ Can afford now!';
            } else if (timeToAfford < 1) {
                timeText = `${(timeToAfford * 60).toFixed(0)}min`;
            } else if (timeToAfford < 24) {
                timeText = `${timeToAfford.toFixed(1)}hr`;
            } else {
                timeText = `${(timeToAfford / 24).toFixed(1)}d`;
            }

            html += `
                <div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 3px solid ${tier.color};">
                    <div style="font-size: 0.75em; color: #aaa;">${tier.icon} ${tier.name}</div>
                    <div style="font-size: 0.9em; font-weight: bold; color: ${tier.color};">${timeText}</div>
                </div>
            `;
        }

        html += `
                </div>
                <div style="font-size: 0.85em; color: #aaa;">
                    Estimated earning rate: ${this.formatNumber(medalsPerHour)} medals/hour
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Craft medals
     */
    craft(tierId, count) {
        if (count === 1) {
            const result = GameEngine.craftMedal(tierId);

            if (result.success) {
                const rarityData = MedalCraftingSystem.rarities[result.rarity];
                console.log(`✨ Crafted ${rarityData.icon} ${rarityData.name} medal!`);

                // Show notification
                this.showNotification(`Crafted ${rarityData.icon} ${rarityData.name} Medal!`, rarityData.color);
            } else {
                console.log(`❌ Craft failed: ${result.reason}`);
                alert(`Failed to craft: ${result.reason}`);
            }
        } else {
            const result = GameEngine.craftMedalBulk(tierId, count);
            console.log(`✨ Bulk craft complete! Crafted ${result.crafted.length} medals`);

            // Show summary
            let summary = `Crafted ${result.crafted.length} medals:\n\n`;
            for (let rarity in result.byRarity) {
                const rarityData = MedalCraftingSystem.rarities[rarity];
                summary += `${rarityData.icon} ${rarityData.name}: ${result.byRarity[rarity]}\n`;
            }
            alert(summary);
        }

        // Refresh modal
        this.show();

        // Refresh perk grid if visible
        if (document.getElementById('view-perks').classList.contains('active')) {
            PerkGridUI.render();
        }
    },

    /**
     * Craft maximum possible
     */
    craftMax(tierId) {
        const tier = MedalCraftingSystem.craftingTiers[tierId];
        const currentMedals = GameEngine.state.currencies?.medals || 0;
        const maxCount = Math.floor(currentMedals / tier.cost);

        if (maxCount > 0) {
            if (confirm(`Craft ${maxCount} ${tier.name} medals?`)) {
                this.craft(tierId, maxCount);
            }
        }
    },

    /**
     * Show notification
     */
    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${color};
            color: white;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    /**
     * Render developer tools panel
     */
    renderDevTools() {
        // Get current perk strength multiplier (default 1.0)
        if (!window.medalPerkStrengthMultiplier) {
            window.medalPerkStrengthMultiplier = 1.0;
        }

        return `
            <div style="background: rgba(255, 152, 0, 0.1); border: 2px solid #ff9800; border-radius: 8px; padding: 15px; margin-top: 20px;">
                <h4 style="margin-top: 0; color: #ff9800;">🔧 Developer Tools</h4>

                <!-- Perk Strength Adjuster -->
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 0.9em; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Perk Strength Multiplier:</span>
                        <span style="color: #ff9800; font-weight: bold; font-size: 1.2em;" id="perkStrengthDisplay">${window.medalPerkStrengthMultiplier.toFixed(2)}x</span>
                    </div>
                    <input type="range"
                           id="perkStrengthSlider"
                           min="0.1"
                           max="10"
                           step="0.1"
                           value="${window.medalPerkStrengthMultiplier}"
                           style="width: 100%;"
                           oninput="MedalCraftingModal.updatePerkStrength(this.value)">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75em; color: #888; margin-top: 4px;">
                        <span>0.1x (Weak)</span>
                        <span>1.0x (Normal)</span>
                        <span>10x (OP)</span>
                    </div>
                </div>

                <!-- Quick Presets -->
                <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                    <button onclick="MedalCraftingModal.setPerkStrength(0.5)"
                            style="flex: 1; padding: 6px; background: rgba(76, 175, 80, 0.3); border: 1px solid #4caf50; border-radius: 4px; color: #4caf50; font-size: 0.8em; cursor: pointer;">
                        Balanced (0.5x)
                    </button>
                    <button onclick="MedalCraftingModal.setPerkStrength(1.0)"
                            style="flex: 1; padding: 6px; background: rgba(33, 150, 243, 0.3); border: 1px solid #2196f3; border-radius: 4px; color: #2196f3; font-size: 0.8em; cursor: pointer;">
                        Normal (1x)
                    </button>
                    <button onclick="MedalCraftingModal.setPerkStrength(2.0)"
                            style="flex: 1; padding: 6px; background: rgba(255, 152, 0, 0.3); border: 1px solid #ff9800; border-radius: 4px; color: #ff9800; font-size: 0.8em; cursor: pointer;">
                        Strong (2x)
                    </button>
                    <button onclick="MedalCraftingModal.setPerkStrength(5.0)"
                            style="flex: 1; padding: 6px; background: rgba(244, 67, 54, 0.3); border: 1px solid #f44336; border-radius: 4px; color: #f44336; font-size: 0.8em; cursor: pointer;">
                        OP (5x)
                    </button>
                </div>

                <!-- Other Dev Functions -->
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <button onclick="MedalCraftingModal.debugBankTabs()"
                            style="flex: 1; padding: 8px; background: rgba(156, 39, 176, 0.3); border: 1px solid #9c27b0; border-radius: 4px; color: #9c27b0; font-size: 0.85em; cursor: pointer; font-weight: bold;">
                        🔍 Debug Bank Tabs
                    </button>
                    <button onclick="MedalCraftingModal.fixBankTabs()"
                            style="flex: 1; padding: 8px; background: rgba(76, 175, 80, 0.3); border: 1px solid #4caf50; border-radius: 4px; color: #4caf50; font-size: 0.85em; cursor: pointer; font-weight: bold;">
                        🔧 Fix Bank Tabs
                    </button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="MedalCraftingModal.clearAllMedals()"
                            style="flex: 1; padding: 8px; background: rgba(244, 67, 54, 0.3); border: 1px solid #f44336; border-radius: 4px; color: #f44336; font-size: 0.85em; cursor: pointer; font-weight: bold;">
                        🗑️ Clear All Medals
                    </button>
                    <button onclick="EquipmentUI.updateBank(); alert('Bank UI refreshed!')"
                            style="flex: 1; padding: 8px; background: rgba(33, 150, 243, 0.3); border: 1px solid #2196f3; border-radius: 4px; color: #2196f3; font-size: 0.85em; cursor: pointer; font-weight: bold;">
                        🔄 Refresh Bank UI
                    </button>
                </div>

                <div style="margin-top: 10px; font-size: 0.75em; color: #888;">
                    Note: Perk strength changes only affect newly crafted medals. Existing medals keep their original values.
                </div>
            </div>
        `;
    },

    /**
     * Update perk strength multiplier
     */
    updatePerkStrength(value) {
        window.medalPerkStrengthMultiplier = parseFloat(value);
        const display = document.getElementById('perkStrengthDisplay');
        if (display) {
            display.textContent = window.medalPerkStrengthMultiplier.toFixed(2) + 'x';
        }
        console.log(`🔧 Perk strength set to ${window.medalPerkStrengthMultiplier.toFixed(2)}x`);
    },

    /**
     * Set perk strength to specific value
     */
    setPerkStrength(value) {
        window.medalPerkStrengthMultiplier = value;
        const slider = document.getElementById('perkStrengthSlider');
        const display = document.getElementById('perkStrengthDisplay');
        if (slider) slider.value = value;
        if (display) display.textContent = value.toFixed(2) + 'x';
        console.log(`🔧 Perk strength set to ${value.toFixed(2)}x`);
    },

    /**
     * Fix bank tabs - manually add all required tabs
     */
    fixBankTabs() {
        const requiredTabs = {
            resource: { name: "Resources", icon: "📦", order: 0 },
            tool: { name: "Tools", icon: "⛏️", order: 1 },
            weapon: { name: "Weapons", icon: "⚔️", order: 2 },
            armor: { name: "Armor", icon: "🛡️", order: 3 },
            technology: { name: "Technology", icon: "⚡", order: 4 },
            mod: { name: "Mods", icon: "💎", order: 5 },
            healing: { name: "Healing", icon: "🧪", order: 6 },
            consumable: { name: "Consumables", icon: "⚗️", order: 7 },
            perk: { name: "Perks", icon: "⭐", order: 8 },
            medal: { name: "Medals", icon: "🏅", order: 9 },
            quest: { name: "Quest Items", icon: "📜", order: 10 },
            legacy: { name: "Legacy Items", icon: "🎒", order: 11 }
        };

        let addedCount = 0;
        for (let [tabId, tabData] of Object.entries(requiredTabs)) {
            if (!GameEngine.state.bank.tabs[tabId]) {
                GameEngine.state.bank.tabs[tabId] = { ...tabData };
                addedCount++;
                console.log(`✅ Added ${tabData.icon} ${tabData.name}`);
            }
        }

        console.log(`🔧 Fixed bank tabs: added ${addedCount} missing tabs`);
        console.log(`Total tabs now: ${Object.keys(GameEngine.state.bank.tabs).length}`);

        // Refresh bank UI
        if (EquipmentUI && EquipmentUI.updateBank) {
            EquipmentUI.updateBank();
        }

        this.showNotification(`Added ${addedCount} missing bank tabs!`, '#4caf50');
        alert(`✅ Bank tabs fixed!\n\nAdded: ${addedCount} new tabs\nTotal: ${Object.keys(GameEngine.state.bank.tabs).length} tabs\n\nGo to Bank tab to see them.`);
    },

    /**
     * Debug bank tabs
     */
    debugBankTabs() {
        console.log('🔍 === BANK TABS DEBUG ===');
        console.log('Total tabs:', Object.keys(GameEngine.state.bank.tabs).length);
        console.log('Tabs:', GameEngine.state.bank.tabs);

        const sortedTabs = Object.entries(GameEngine.state.bank.tabs).sort((a, b) => a[1].order - b[1].order);
        console.log('Sorted tabs:');
        for (let [tabId, tab] of sortedTabs) {
            const itemCount = tabId === 'medal'
                ? (GameEngine.state.craftedMedals?.length || 0)
                : GameEngine.getItemsInTab(tabId).length;
            console.log(`  ${tab.order}: ${tab.icon} ${tab.name} (${tabId}) - ${itemCount} items`);
        }

        console.log('Active tab:', GameEngine.state.bank.activeTab);
        console.log('Bank container exists:', !!document.getElementById('bankTabs'));

        alert(`Bank has ${Object.keys(GameEngine.state.bank.tabs).length} tabs.\nCheck console for details.`);
    },

    /**
     * Clear all crafted medals
     */
    clearAllMedals() {
        if (confirm('⚠️ This will delete ALL crafted medals (including placed ones). Continue?')) {
            GameEngine.state.craftedMedals = [];
            if (GameEngine.state.perkGrid && GameEngine.state.perkGrid.placedMedals) {
                GameEngine.state.perkGrid.placedMedals = {};
            }
            console.log('🗑️ Cleared all medals');
            this.showNotification('All medals cleared!', '#f44336');
            this.show(); // Refresh modal

            // Refresh perk grid if visible
            if (PerkGridUI && PerkGridUI.render) {
                PerkGridUI.render();
            }
        }
    },

    /**
     * Developer function: Add maximum medals
     */
    addMaxMedals() {
        const maxMedals = 10000000; // 10 million medals

        if (!GameEngine.state.currencies) {
            GameEngine.state.currencies = {};
        }

        GameEngine.state.currencies.medals = maxMedals;
        console.log(`🔧 DEV: Added ${maxMedals.toLocaleString()} medals`);

        // Show notification
        this.showNotification('Added 10M medals! 🎉', '#ff9800');

        // Refresh modal to show updated currency
        this.show();
    },

    /**
     * Format number
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(0);
    }
};
