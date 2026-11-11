/**
 * DEV TOOLS COMPONENT
 *
 * Reusable component for rendering dev tools on each tab.
 * Provides balancing variables and debug functions specific to each game system.
 */

const DevTools = {
    collapsed: {}, // Track collapsed state per tab

    /**
     * Render dev tools box for a specific tab
     * @param {string} tabId - Unique ID for this dev tools instance
     * @param {object} config - Configuration object with sections array
     * @returns {string} HTML string for dev tools box
     */
    render(tabId, config) {
        const isCollapsed = this.collapsed[tabId] !== false; // Default to expanded

        let html = `
            <div id="devTools_${tabId}" style="background: rgba(25, 25, 35, 0.95); border: 2px solid #ff9800; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
                <!-- Header -->
                <div onclick="DevTools.toggle('${tabId}')" style="background: linear-gradient(90deg, #ff9800, #f57c00); padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2em;">🛠️</span>
                        <strong style="color: white; font-size: 0.95em;">DEVELOPER TOOLS</strong>
                        ${config.title ? `<span style="color: rgba(255,255,255,0.7); font-size: 0.85em;">- ${config.title}</span>` : ''}
                    </div>
                    <span style="color: white; font-size: 0.9em; transition: transform 0.2s;" id="devToolsToggle_${tabId}">
                        ${isCollapsed ? '▼' : '▲'}
                    </span>
                </div>

                <!-- Content -->
                <div id="devToolsContent_${tabId}" style="display: ${isCollapsed ? 'none' : 'block'}; padding: 15px;">
                    ${this.renderSections(config.sections)}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render all sections within a dev tools box
     */
    renderSections(sections) {
        let html = '<div style="display: grid; gap: 15px;">';

        for (let section of sections) {
            if (section.type === 'balancing') {
                html += this.renderBalancingSection(section);
            } else if (section.type === 'debug') {
                html += this.renderDebugSection(section);
            }
        }

        html += '</div>';
        return html;
    },

    /**
     * Render a balancing variables section
     */
    renderBalancingSection(section) {
        const balance = GameEngine.gameBalance;

        let html = `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                <h4 style="margin: 0 0 12px 0; color: #4a9eff; font-size: 1em;">${section.icon || '⚙️'} ${section.title}</h4>
                <div style="display: grid; gap: 10px;">
        `;

        for (let variable of section.variables) {
            const value = balance[variable.key];
            const displayValue = variable.type === 'float' ? value.toFixed(2) : value;

            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <label style="font-size: 0.85em; color: #ddd;">${variable.label}</label>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <input
                                type="number"
                                value="${displayValue}"
                                min="${variable.min}"
                                max="${variable.max}"
                                step="${variable.step}"
                                onchange="updateBalanceVariable('${variable.key}', parseFloat(this.value), '${variable.type}')"
                                style="width: 70px; padding: 3px 6px; background: #1a1a2a; border: 1px solid #555; border-radius: 3px; color: white; text-align: right; font-size: 0.85em;"
                            />
                            <button
                                onclick="resetBalanceVariable('${variable.key}')"
                                style="padding: 3px 6px; background: #555; border: 1px solid #444; border-radius: 3px; color: white; cursor: pointer; font-size: 0.75em;"
                                title="Reset to default"
                            >↺</button>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="${variable.min}"
                        max="${variable.max}"
                        step="${variable.step}"
                        value="${value}"
                        oninput="updateBalanceVariable('${variable.key}', parseFloat(this.value), '${variable.type}')"
                        style="width: 100%; cursor: pointer;"
                    />
                    <div style="display: flex; justify-content: space-between; font-size: 0.7em; color: #888; margin-top: 2px;">
                        <span>${variable.min}</span>
                        <span>${variable.max}</span>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render a debug functions section
     */
    renderDebugSection(section) {
        let html = `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                <h4 style="margin: 0 0 12px 0; color: #9c27b0; font-size: 1em;">${section.icon || '🐛'} ${section.title}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
        `;

        for (let func of section.functions) {
            html += `
                <button
                    onclick="${func.onclick}"
                    style="padding: 8px 10px; background: #7b1fa2; border: 1px solid #6a1b9a; border-radius: 4px; color: white; font-size: 0.85em; cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='#9c27b0'"
                    onmouseout="this.style.background='#7b1fa2'"
                >
                    ${func.icon || '▶️'} ${func.label}
                </button>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Toggle dev tools visibility
     */
    toggle(tabId) {
        const content = document.getElementById(`devToolsContent_${tabId}`);
        const toggle = document.getElementById(`devToolsToggle_${tabId}`);

        if (!content || !toggle) return;

        const isCurrentlyCollapsed = content.style.display === 'none';

        content.style.display = isCurrentlyCollapsed ? 'block' : 'none';
        toggle.textContent = isCurrentlyCollapsed ? '▲' : '▼';
        this.collapsed[tabId] = !isCurrentlyCollapsed;
    },

    /**
     * Reset all missions for testing
     */
    resetMissions() {
        console.log('🔄 Resetting all missions...');

        // Clear all mission state
        GameEngine.state.missions.available = [];
        GameEngine.state.missions.active = [];
        GameEngine.state.missions.completed = [];
        GameEngine.state.missions.progress = {};

        // Reinitialize missions
        GameEngine.initializeMissions();

        // Force UI refresh
        MissionsUI.lastMissionsState = null;
        if (UICore.currentView === 'missions') {
            UICore.update();
        }

        console.log('✅ Missions reset! All missions are now incomplete.');
        console.log('📋 Available missions:', GameEngine.state.missions.available);
    },

    /**
     * Add medal fragments for testing
     * @param {number} amount - Amount to add (default 10000)
     */
    addFragments(amount = 10000) {
        if (!GameEngine.state.currencies) {
            GameEngine.state.currencies = {};
        }
        GameEngine.state.currencies.medalFragments = (GameEngine.state.currencies.medalFragments || 0) + amount;
        console.log(`✅ Added ${amount.toLocaleString()} medal fragments!`);
        console.log(`💎 Total fragments: ${GameEngine.state.currencies.medalFragments.toLocaleString()}`);

        // Refresh UI if on perk grid
        if (typeof PerkGridUI !== 'undefined') {
            PerkGridUI.render();
        }
        return GameEngine.state.currencies.medalFragments;
    },

    /**
     * Set medal fragments to specific amount
     * @param {number} amount - Amount to set
     */
    setFragments(amount) {
        if (!GameEngine.state.currencies) {
            GameEngine.state.currencies = {};
        }
        GameEngine.state.currencies.medalFragments = amount;
        console.log(`✅ Set medal fragments to ${amount.toLocaleString()}`);

        // Refresh UI if on perk grid
        if (typeof PerkGridUI !== 'undefined') {
            PerkGridUI.render();
        }
        return amount;
    }
};

// Console shortcuts for medal fragments
window.addFragments = (amount) => DevTools.addFragments(amount);
window.setFragments = (amount) => DevTools.setFragments(amount);

/**
 * DEV FOOD TOOLS
 *
 * Developer tools for testing food consumption and combat healing.
 * Accessible via console: DevFood.toggleInfiniteFood(), DevFood.addTestFood(), etc.
 */
const DevFoodTools = {
    // Toggle mode - food never decrements when true
    infiniteFoodEnabled: false,

    /**
     * Toggle infinite food mode
     * When enabled, auto-eat heals without consuming food
     * @returns {boolean} New state of infinite food mode
     */
    toggleInfiniteFood() {
        this.infiniteFoodEnabled = !this.infiniteFoodEnabled;
        const status = this.infiniteFoodEnabled ? 'ON' : 'OFF';
        console.log(`🍔 [DEV] Infinite food mode: ${status}`);

        if (this.infiniteFoodEnabled) {
            console.log('   Food will not be consumed during auto-eat');
        }

        return this.infiniteFoodEnabled;
    },

    /**
     * Add test food to inventory
     * @param {string} itemId - Food item ID (default: 'solfishBake')
     * @param {number} quantity - Amount to add (default: 999)
     */
    addTestFood(itemId = 'solfishBake', quantity = 999) {
        // Verify item exists
        const itemDef = ItemIdUtils.getItemDefinition(itemId);
        if (!itemDef) {
            console.error(`❌ [DEV] Item '${itemId}' not found in registry`);
            console.log('   Try: solfishBake, smallGameStew');
            return false;
        }

        const bank = GameEngine.state.bank;

        // Add directly to bank.stackable for consumables
        if (!bank.stackable) {
            bank.stackable = {};
        }
        bank.stackable[itemId] = (bank.stackable[itemId] || 0) + quantity;
        console.log(`🍔 [DEV] Added ${quantity}x ${itemDef.name || itemId}`);

        // Show current quantity
        const totalQty = bank.stackable[itemId] || 0;
        console.log(`   Total in bank.stackable: ${totalQty}`);

        return true;
    },

    /**
     * Equip food to food slot (uses new { itemId, quantity } format)
     * @param {string} itemId - Food item ID to equip
     * @param {number} quantity - Quantity to equip (default: all from bank)
     */
    equipFood(itemId = 'solfishBake', quantity = null) {
        // Verify item exists
        const itemDef = ItemIdUtils.getItemDefinition(itemId);
        if (!itemDef) {
            console.error(`❌ [DEV] Item '${itemId}' not found in registry`);
            return false;
        }

        // Check bank for quantity
        const bank = GameEngine.state.bank;
        let bankQuantity = 0;

        // Check stackable first, then legacy items
        if (bank.stackable && typeof bank.stackable[itemId] === 'number') {
            bankQuantity = bank.stackable[itemId];
        } else if (bank.items && bank.items[itemId]) {
            const bankItem = bank.items[itemId];
            bankQuantity = typeof bankItem === 'number' ? bankItem : (bankItem.quantity || 0);
        }

        if (bankQuantity <= 0) {
            console.warn(`⚠️ [DEV] No ${itemId} in bank. Adding some first...`);
            this.addTestFood(itemId, 1000);
            bankQuantity = 1000;
        }

        // Use specified quantity or all available
        const equipQuantity = quantity !== null ? Math.min(quantity, bankQuantity) : bankQuantity;

        // Unequip current food first (returns to bank)
        if (GameEngine.state.equipment.food) {
            GameEngine.unequipItem('food');
        }

        // Equip to food slot (new format: { itemId, quantity })
        GameEngine.state.equipment.food = {
            itemId: itemId,
            quantity: equipQuantity
        };

        // Remove from bank
        if (bank.stackable && typeof bank.stackable[itemId] === 'number') {
            bank.stackable[itemId] -= equipQuantity;
            if (bank.stackable[itemId] <= 0) {
                delete bank.stackable[itemId];
            }
        } else if (bank.items && bank.items[itemId]) {
            if (typeof bank.items[itemId] === 'number') {
                bank.items[itemId] -= equipQuantity;
                if (bank.items[itemId] <= 0) {
                    delete bank.items[itemId];
                }
            } else {
                bank.items[itemId].quantity -= equipQuantity;
                if (bank.items[itemId].quantity <= 0) {
                    delete bank.items[itemId];
                }
            }
        }

        console.log(`🍔 [DEV] Equipped ${equipQuantity}x ${itemDef.name || itemId} to food slot`);

        return true;
    },

    /**
     * Full heal player to max HP
     */
    fullHeal() {
        const player = GameEngine.state;
        const maxHP = AutoConsumption.calculateMaxHP(player);

        const oldHealth = player.currentHP || 0;
        player.currentHP = maxHP;
        const healAmount = player.currentHP - oldHealth;

        console.log(`💚 [DEV] Player healed: ${oldHealth} → ${player.currentHP}/${maxHP}`);

        // Emit event for UI
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('player-healed', { amount: healAmount, source: 'dev' });
        }

        return player.currentHP;
    },

    /**
     * Set player health to specific value
     * @param {number} health - Health value to set
     */
    setHealth(health) {
        const player = GameEngine.state;
        const maxHP = AutoConsumption.calculateMaxHP(player);

        player.currentHP = Math.max(1, Math.min(health, maxHP));
        console.log(`💚 [DEV] Player health set to: ${player.currentHP}/${maxHP}`);

        return player.currentHP;
    },

    /**
     * Damage player by amount (for testing auto-eat)
     * @param {number} damage - Damage to deal
     */
    damagePlayer(damage = 50) {
        const player = GameEngine.state;

        const oldHealth = player.currentHP || 0;
        player.currentHP = Math.max(1, oldHealth - damage);

        console.log(`💔 [DEV] Player took ${damage} damage: ${oldHealth} → ${player.currentHP}`);

        // Emit event for UI
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('player-damaged', { damage: damage, source: 'dev' });
        }

        return player.currentHP;
    },

    /**
     * Trigger auto-eat manually (for testing)
     */
    triggerAutoEat() {
        const player = GameEngine.state;
        const combat = player.combat || { lastAutoEat: 0, session: {} };

        console.log('🍔 [DEV] Triggering auto-eat...');
        const result = AutoConsumption.processAutoEat(player, combat);

        if (result) {
            if (result.success) {
                console.log(`   ✅ Consumed ${result.itemsConsumed} ${result.foodName}`);
                console.log(`   Healed: ${result.healed} HP`);
                console.log(`   Remaining: ${result.remaining}`);
            } else {
                console.log(`   ❌ ${result.reason}`);
            }
        } else {
            console.log('   ⏳ Auto-eat not triggered (HP above threshold or on cooldown)');
        }

        return result;
    },

    /**
     * Manual eat (100% efficiency, no conservation)
     */
    manualEat() {
        const player = GameEngine.state;

        console.log('🍔 [DEV] Manual eat...');
        const result = AutoConsumption.manualEat(player);

        if (result.success) {
            console.log(`   ✅ Consumed 1 ${result.foodName}`);
            console.log(`   Healed: ${result.healed} HP (100% efficiency)`);
            console.log(`   Remaining: ${result.remaining}`);
        } else {
            console.log(`   ❌ ${result.reason}`);
        }

        return result;
    },

    /**
     * Show current food status
     */
    status() {
        const equipment = GameEngine.state.equipment;
        const player = GameEngine.state;
        const bank = GameEngine.state.bank;

        console.log('=== 🍔 FOOD STATUS ===');
        console.log(`Infinite mode: ${this.infiniteFoodEnabled ? 'ON' : 'OFF'}`);

        // Handle new { itemId, quantity } format
        const foodSlot = equipment.food;
        if (foodSlot && typeof foodSlot === 'object') {
            const { itemId, quantity } = foodSlot;
            const itemDef = ItemIdUtils.getItemDefinition(itemId);

            console.log(`Equipped food: ${itemDef?.name || itemId}`);
            console.log(`  Item ID: ${itemId}`);
            console.log(`  Equipped quantity: ${quantity}`);
            console.log(`  Heal amount: ${itemDef?.healAmount || itemDef?.effectValue || 'Unknown'}`);

            if (itemDef?.effect) {
                console.log(`  Effect: +${itemDef.effect.amount} ${itemDef.effect.stat}`);
            }
        } else if (foodSlot) {
            // Legacy format (string ID)
            console.log(`Equipped food (legacy): ${foodSlot}`);
        } else {
            console.log(`Equipped food: None`);
        }

        // Show bank quantities
        console.log(`Bank stackable:`, bank.stackable || {});

        // Player HP
        const maxHP = AutoConsumption.calculateMaxHP(player);
        console.log(`Player HP: ${player.currentHP || 0}/${maxHP}`);
        console.log(`Auto-eat threshold: ${AutoConsumption.calculateAutoEatThreshold(player)} HP`);
        console.log(`Auto-eat efficiency: ${(AutoConsumption.calculateAutoEatEfficiency(player) * 100).toFixed(1)}%`);
        console.log('======================');
    },

    /**
     * List all available food items in registry
     */
    listFoods() {
        console.log('=== 🍔 AVAILABLE FOODS ===');

        if (typeof ItemRegistry !== 'undefined') {
            const allItems = ItemRegistry.getAllActive();
            const foods = Object.values(allItems).filter(item =>
                item.category === 'consumable' ||
                item.effectType === 'heal' ||
                item.healAmount ||
                item.effectValue
            );

            foods.forEach(food => {
                const heal = food.healAmount || food.effectValue || 0;
                console.log(`  ${food.id}: ${food.name} (heals ${heal})`);
            });

            if (foods.length === 0) {
                console.log('  No food items found in registry');
            }
        } else {
            console.log('  ItemRegistry not available');
        }

        console.log('==========================');
    }
};

// Make DevFoodTools globally accessible
window.DevFood = DevFoodTools;

// Console shortcuts
window.infiniteFood = () => DevFoodTools.toggleInfiniteFood();
window.addFood = (id, qty) => DevFoodTools.addTestFood(id, qty);
window.equipFood = (id) => DevFoodTools.equipFood(id);
window.fullHeal = () => DevFoodTools.fullHeal();
window.foodStatus = () => DevFoodTools.status();
