/**
 * ITEM DETAIL MODAL
 *
 * Comprehensive item information modal that shows:
 * - Item details (icon, name, rarity, description)
 * - Stats and attributes
 * - Crafting recipes that use this item
 * - Source information
 * - Contextual action buttons
 */

const ItemModal = {
    currentItemId: null,

    /**
     * Open the item detail modal
     * @param {string} itemId - The item ID to display
     */
    open(itemId) {
        // DUAL-BANK: Check all storage locations (instanced, stackable, legacy)
        const instancedItem = GameEngine.state.bank.instanced?.[itemId];
        const stackableItem = GameEngine.state.bank.stackable?.[itemId];
        const legacyItem = GameEngine.state.bank.items?.[itemId];
        const bankItem = instancedItem || stackableItem || legacyItem;

        // For instanced items, use baseItemId to get definition
        const lookupId = bankItem?.baseItemId || itemId;
        const itemDef = ItemAccessHelper.getItem(lookupId);

        if (!itemDef) {
            console.error(`Item ${itemId} not found (lookup: ${lookupId})`);
            return;
        }

        this.currentItemId = itemId;

        // Get modal elements
        const modal = document.getElementById('itemModal');
        const overlay = document.getElementById('itemModalOverlay');

        // Populate modal content
        this.populateModal(itemId, itemDef);

        // Show modal
        overlay.classList.add('active');
        modal.classList.add('active');

        // Add ESC key listener
        this.addKeyboardListeners();
    },

    /**
     * Close the item detail modal
     */
    close() {
        const modal = document.getElementById('itemModal');
        const overlay = document.getElementById('itemModalOverlay');

        modal.classList.remove('active');
        overlay.classList.remove('active');

        this.currentItemId = null;

        // Remove ESC key listener
        this.removeKeyboardListeners();
    },

    /**
     * Populate modal with item information
     * @param {string} itemId - Item ID
     * @param {object} itemDef - Item definition
     */
    populateModal(itemId, itemDef) {
        // DUAL-BANK: Check all storage locations (instanced, stackable, legacy)
        const instancedItem = GameEngine.state.bank.instanced?.[itemId];
        const stackableItem = GameEngine.state.bank.stackable?.[itemId];
        const legacyItem = GameEngine.state.bank.items?.[itemId];
        const bankItem = instancedItem || stackableItem || legacyItem;

        // Get rarity information (use baseItemId for instances)
        const lookupId = bankItem?.baseItemId || itemId;
        const rarity = GameEngine.getItemRarity(lookupId);
        const rarityColor = rarity ? rarity.color : '#9e9e9e';
        const rarityName = rarity ? rarity.name : 'Common';
        const rarityIcon = rarity ? rarity.icon : '⚪';

        // Get player's quantity
        const quantity = bankItem ? bankItem.quantity : 0;

        // Header section
        document.getElementById('itemModalIcon').innerHTML = IconHelper.getItemIconHTML(itemDef, {size: 64, className: 'modal-icon'});
        document.getElementById('itemModalName').textContent = itemDef.name;
        document.getElementById('itemModalName').style.color = rarityColor;
        document.getElementById('itemModalRarity').textContent = `${rarityIcon} ${rarityName}`;
        document.getElementById('itemModalRarity').style.color = rarityColor;
        document.getElementById('itemModalQuantity').textContent = `Owned: ${quantity}`;
        document.getElementById('itemModalDescription').textContent = itemDef.description || 'No description available.';

        // Stats section
        this.renderStats(itemDef);

        // Recipes section
        this.renderRecipes(itemId);

        // Source information
        this.renderSources(itemId);

        // Action buttons
        this.renderActions(itemId, itemDef);
    },

    /**
     * Render item stats
     */
    renderStats(itemDef) {
        const container = document.getElementById('itemModalStats');

        if (!itemDef.stats || Object.keys(itemDef.stats).length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">No stats available</p>';
            return;
        }

        let html = '<div class="item-stats-grid">';

        // Combat stats
        const combatStats = ['attackDamage', 'attackSpeed', 'accuracy', 'maxHealth', 'damageReduction', 'critChance', 'critDamage'];
        const hasCombatStats = combatStats.some(stat => itemDef.stats[stat]);

        if (hasCombatStats) {
            html += '<div class="stat-category"><h4>⚔️ Combat</h4>';
            if (itemDef.stats.attackDamage) html += `<div class="stat-row"><span>Attack Damage:</span><span class="stat-value">${itemDef.stats.attackDamage}</span></div>`;
            if (itemDef.stats.attackSpeed) html += `<div class="stat-row"><span>Attack Speed:</span><span class="stat-value">${itemDef.stats.attackSpeed}/s</span></div>`;
            if (itemDef.stats.accuracy) html += `<div class="stat-row"><span>Accuracy:</span><span class="stat-value">+${itemDef.stats.accuracy}%</span></div>`;
            if (itemDef.stats.maxHealth) html += `<div class="stat-row"><span>Health:</span><span class="stat-value">+${itemDef.stats.maxHealth}</span></div>`;
            if (itemDef.stats.damageReduction) html += `<div class="stat-row"><span>Damage Reduction:</span><span class="stat-value">${itemDef.stats.damageReduction}%</span></div>`;
            if (itemDef.stats.critChance) html += `<div class="stat-row"><span>Crit Chance:</span><span class="stat-value">+${itemDef.stats.critChance}%</span></div>`;
            if (itemDef.stats.critDamage) html += `<div class="stat-row"><span>Crit Damage:</span><span class="stat-value">+${itemDef.stats.critDamage}%</span></div>`;
            html += '</div>';
        }

        // Gathering stats
        const gatheringStats = ['miningPower', 'loggingPower', 'fishingPower', 'huntingPower', 'foragingPower', 'thievingPower'];
        const hasGatheringStats = gatheringStats.some(stat => itemDef.stats[stat]);

        if (hasGatheringStats) {
            html += '<div class="stat-category"><h4>⛏️ Gathering</h4>';
            if (itemDef.stats.miningPower) html += `<div class="stat-row"><span>Mining Power:</span><span class="stat-value">${itemDef.stats.miningPower}</span></div>`;
            if (itemDef.stats.loggingPower) html += `<div class="stat-row"><span>Logging Power:</span><span class="stat-value">${itemDef.stats.loggingPower}</span></div>`;
            if (itemDef.stats.fishingPower) html += `<div class="stat-row"><span>Fishing Power:</span><span class="stat-value">${itemDef.stats.fishingPower}</span></div>`;
            if (itemDef.stats.huntingPower) html += `<div class="stat-row"><span>Hunting Power:</span><span class="stat-value">${itemDef.stats.huntingPower}</span></div>`;
            if (itemDef.stats.foragingPower) html += `<div class="stat-row"><span>Foraging Power:</span><span class="stat-value">${itemDef.stats.foragingPower}</span></div>`;
            if (itemDef.stats.thievingPower) html += `<div class="stat-row"><span>Thieving Power:</span><span class="stat-value">${itemDef.stats.thievingPower}</span></div>`;
            html += '</div>';
        }

        // Other stats
        if (itemDef.stats.weight) {
            html += '<div class="stat-category"><h4>📦 Properties</h4>';
            html += `<div class="stat-row"><span>Weight:</span><span class="stat-value">${itemDef.stats.weight}</span></div>`;
            if (itemDef.stats.damageType) {
                const damageTypeDef = GameEngine.definitions.damageTypes[itemDef.stats.damageType];
                html += `<div class="stat-row"><span>Damage Type:</span><span class="stat-value" style="color: ${damageTypeDef?.color || '#fff'}">${damageTypeDef?.name || itemDef.stats.damageType}</span></div>`;
            }
            if (itemDef.stackLimit) html += `<div class="stat-row"><span>Stack Limit:</span><span class="stat-value">${itemDef.stackLimit === Infinity ? '∞' : itemDef.stackLimit}</span></div>`;
            html += '</div>';
        }

        // Consumable stats
        if (itemDef.healAmount || itemDef.foodValue) {
            html += '<div class="stat-category"><h4>🧪 Consumable</h4>';
            if (itemDef.healAmount) html += `<div class="stat-row"><span>Heal Amount:</span><span class="stat-value">+${itemDef.healAmount} HP</span></div>`;
            if (itemDef.foodValue) html += `<div class="stat-row"><span>Food Value:</span><span class="stat-value">${itemDef.foodValue}</span></div>`;
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Render recipes that use this item
     */
    renderRecipes(itemId) {
        const container = document.getElementById('itemModalRecipes');
        const recipes = GameEngine.definitions.recipes;

        if (!recipes) {
            container.innerHTML = '<p style="color: #888; text-align: center;">No recipe data available</p>';
            return;
        }

        // Find recipes that use this item
        const usedInRecipes = [];
        for (let recipeId in recipes) {
            const recipe = recipes[recipeId];
            if (recipe.inputs && recipe.inputs[itemId]) {
                usedInRecipes.push({
                    id: recipeId,
                    ...recipe,
                    requiredQuantity: recipe.inputs[itemId]
                });
            }
        }

        if (usedInRecipes.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">Not used in any recipes</p>';
            return;
        }

        let html = '<div class="recipe-uses-list">';
        for (let recipe of usedInRecipes) {
            const outputItem = ItemAccessHelper.getItem(recipe.output);
            const icon = IconHelper.getItemIconHTML(outputItem, {size: 32, className: 'recipe-icon'});

            html += `
                <div class="recipe-use-row">
                    <div class="recipe-use-info">
                        ${icon}
                        <div class="recipe-use-details">
                            <div class="recipe-use-name">${outputItem?.name || recipe.id}</div>
                            <div class="recipe-use-amount">Uses ${recipe.requiredQuantity}x per craft</div>
                        </div>
                    </div>
                    <button class="recipe-craft-btn" onclick="ItemModal.openRecipeCrafting('${recipe.id}')">
                        🔨 Craft
                    </button>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Render source information
     */
    renderSources(itemId) {
        const container = document.getElementById('itemModalSources');
        const sources = [];

        // Check enemy loot tables
        const enemies = GameEngine.definitions.enemies;
        if (enemies) {
            for (let enemyId in enemies) {
                const enemy = enemies[enemyId];
                if (enemy.lootTable && Array.isArray(enemy.lootTable)) {
                    for (let loot of enemy.lootTable) {
                        if (loot.itemId === itemId) {
                            sources.push(`🗡️ Drop from ${enemy.name} (${(loot.chance * 100).toFixed(1)}%)`);
                            break;
                        }
                    }
                }
            }
        }

        // Check recipes (if this item is crafted)
        const recipes = GameEngine.definitions.recipes;
        if (recipes) {
            for (let recipeId in recipes) {
                const recipe = recipes[recipeId];
                if (recipe.output === itemId) {
                    sources.push(`🔨 Crafted at ${recipe.station || 'crafting station'}`);
                    break;
                }
            }
        }

        // Check resource nodes
        const biomes = GameEngine.definitions.biomes;
        if (biomes) {
            for (let biomeId in biomes) {
                const biome = biomes[biomeId];
                if (biome.gatheringNodes) {
                    for (let nodeId in biome.gatheringNodes) {
                        const node = biome.gatheringNodes[nodeId];
                        if (node.yields && node.yields.itemId === itemId) {
                            sources.push(`⛏️ Gathered from ${node.name || nodeId} in ${biomeId}`);
                        }
                    }
                }
            }
        }

        if (sources.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">Source unknown</p>';
            return;
        }

        let html = '<ul class="source-list">';
        for (let source of sources) {
            html += `<li>${source}</li>`;
        }
        html += '</ul>';

        container.innerHTML = html;
    },

    /**
     * Render action buttons
     */
    renderActions(itemId, itemDef) {
        const container = document.getElementById('itemModalActions');

        // DUAL-BANK: Check all storage locations
        const instancedItem = GameEngine.state.bank.instanced?.[itemId];
        const stackableItem = GameEngine.state.bank.stackable?.[itemId];
        const legacyItem = GameEngine.state.bank.items?.[itemId];
        const bankItem = instancedItem || stackableItem || legacyItem;

        const quantity = bankItem ? (bankItem.quantity || 1) : 0;

        if (quantity === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">You don\'t own this item</p>';
            return;
        }

        let html = '<div class="action-buttons">';

        // === PRIMARY ACTIONS (Equipment/Consumable) ===

        // Equip/Unequip button (for equipment, but NOT attachments)
        if ((itemDef.slot || itemDef.equipSlot) && itemDef.itemType !== 'attachment' && itemDef.slot !== 'attachment') {
            const slot = itemDef.equipSlot || itemDef.slot;
            const isEquipped = GameEngine.state.equipment[slot] === itemId;
            if (isEquipped) {
                html += `<button class="action-btn unequip-btn" onclick="ItemModal.unequipItem('${itemId}', '${slot}')">
                    🛡️ Unequip
                </button>`;
            } else {
                html += `<button class="action-btn equip-btn" onclick="ItemModal.equipItem('${itemId}', '${slot}')">
                    ⚔️ Equip
                </button>`;
            }
        }


        // Use/Consume button (for consumables)
        if (itemDef.category === 'consumable' && itemDef.effect) {
            html += `<button class="action-btn use-btn" onclick="ItemModal.useItem('${itemId}')">
                🧪 Use
            </button>`;
        }

        // === SECONDARY ACTIONS ===

        // Sell button
        const sellValue = itemDef.value || 10;
        html += `<button class="action-btn sell-btn" onclick="ItemModal.sellItem('${itemId}')">
            💰 Sell (${sellValue}g)
        </button>`;

        // Drop button (red warning style)
        html += `<button class="action-btn drop-btn" onclick="ItemModal.dropItem('${itemId}')">
            📤 Drop
        </button>`;

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Equip an item
     */
    equipItem(itemId, slot) {
        const result = GameEngine.equipItem(itemId, slot);

        // Use ItemIdUtils to extract base ID for item name lookup
        const baseId = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getBaseItemId(itemId)
            : itemId;

        // Show notification feedback
        if (result.success) {
            const itemDef = ItemAccessHelper.getItem(baseId);
            const itemName = itemDef ? itemDef.name : itemId;
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification(`⚔️ Equipped ${itemName}`, 'success', 2000);
            }
        } else {
            // Always show error feedback, even if no specific reason
            const reason = result.reason || 'Failed to equip item';
            console.warn(`❌ Equip failed for ${itemId}: ${reason}`);
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification(`❌ ${reason}`, 'error', 3000);
            }
        }

        // Force equipment and bank UI update BEFORE closing modal
        if (typeof EquipmentUI !== 'undefined') {
            if (EquipmentUI.updateEquipment) {
                EquipmentUI.lastEquipmentState = null;
                EquipmentUI.updateEquipment();
            }
            if (EquipmentUI.updateBank) {
                EquipmentUI.lastBankState = null;
                EquipmentUI.updateBank();
            }
        }

        this.close();
        UICore.update();
    },

    /**
     * Unequip an item
     */
    unequipItem(itemId, slot) {
        const result = GameEngine.unequipItem(slot);

        // Use ItemIdUtils to extract base ID for item name lookup
        const baseId = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getBaseItemId(itemId)
            : itemId;

        // Show notification feedback
        if (result.success) {
            const itemDef = ItemAccessHelper.getItem(baseId);
            const itemName = itemDef ? itemDef.name : itemId;
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification(`🛡️ Unequipped ${itemName}`, 'success', 2000);
            }
        } else {
            // Always show error feedback
            const reason = result.reason || 'Failed to unequip item';
            console.warn(`❌ Unequip failed for ${itemId}: ${reason}`);
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification(`❌ ${reason}`, 'error', 3000);
            }
        }

        // Force equipment and bank UI update BEFORE closing modal
        if (typeof EquipmentUI !== 'undefined') {
            if (EquipmentUI.updateEquipment) {
                EquipmentUI.lastEquipmentState = null;
                EquipmentUI.updateEquipment();
            }
            if (EquipmentUI.updateBank) {
                EquipmentUI.lastBankState = null;
                EquipmentUI.updateBank();
            }
        }

        this.close();
        UICore.update();
    },

    /**
     * Show crafting options for this item
     */
    showCraftingOptions(itemId) {
        this.close();
        switchView('crafting');
        // TODO: Filter crafting view to recipes using this item
    },

    /**
     * Drop an item (with confirmation)
     */
    dropItem(itemId) {
        // DUAL-BANK: Check all storage locations
        const instancedItem = GameEngine.state.bank.instanced?.[itemId];
        const stackableItem = GameEngine.state.bank.stackable?.[itemId];
        const legacyItem = GameEngine.state.bank.items?.[itemId];
        const bankItem = instancedItem || stackableItem || legacyItem;

        if (!bankItem) return;

        const itemDef = ItemAccessHelper.getItem(bankItem.baseItemId || itemId);
        const quantity = bankItem.quantity || 1;

        // Confirmation prompt
        const confirmMsg = quantity > 1
            ? `Drop ${quantity}x ${itemDef.name}?`
            : `Drop ${itemDef.name}?`;

        if (confirm(confirmMsg)) {
            // Remove item from bank
            if (instancedItem) {
                GameEngine.removeEquipmentInstance(itemId);
            } else if (stackableItem) {
                GameEngine.removeStackableItem(itemId, quantity);
            } else {
                GameEngine.removeItemFromBank(itemId, quantity);
            }

            console.log(`📤 Dropped ${quantity}x ${itemDef.name}`);

            // Close modal and force full UI update
            this.close();

            // Force refresh of the equipment UI to remove the dropped item card
            if (typeof EquipmentUI !== 'undefined' && EquipmentUI.updateBank) {
                EquipmentUI.updateBank();
            }

            // Update rest of UI
            UICore.update();
        }
    },

    /**
     * Sell an item
     */
    sellItem(itemId) {
        // DUAL-BANK: Check all storage locations
        const instancedItem = GameEngine.state.bank.instanced?.[itemId];
        const stackableItem = GameEngine.state.bank.stackable?.[itemId];
        const legacyItem = GameEngine.state.bank.items?.[itemId];
        const bankItem = instancedItem || stackableItem || legacyItem;

        if (!bankItem) return;

        const itemDef = ItemAccessHelper.getItem(bankItem.baseItemId || itemId);
        const quantity = bankItem.quantity || 1;
        const sellValue = itemDef.value || 10;
        const totalValue = sellValue * quantity;

        if (confirm(`Sell ${quantity}x ${itemDef.name} for ${totalValue} gold?`)) {
            // Remove item from bank
            if (instancedItem) {
                GameEngine.removeEquipmentInstance(itemId);
            } else if (stackableItem) {
                GameEngine.removeStackableItem(itemId, quantity);
            } else {
                GameEngine.removeItemFromBank(itemId, quantity);
            }

            // Add gold
            if (!GameEngine.state.currencies) GameEngine.state.currencies = {};
            GameEngine.state.currencies.gold = (GameEngine.state.currencies.gold || 0) + totalValue;

            console.log(`💰 Sold ${quantity}x ${itemDef.name} for ${totalValue} gold`);

            // Close modal and force full UI update
            this.close();

            // Force refresh of the equipment UI to remove the sold item card
            if (typeof EquipmentUI !== 'undefined' && EquipmentUI.updateBank) {
                EquipmentUI.updateBank();
            }

            // Update rest of UI
            UICore.update();
        }
    },

    /**
     * Use/consume an item
     */
    useItem(itemId) {
        // DUAL-BANK: Check all storage locations
        const stackableItem = GameEngine.state.bank.stackable?.[itemId];
        const legacyItem = GameEngine.state.bank.items?.[itemId];
        const bankItem = stackableItem || legacyItem;

        if (!bankItem) return;

        const itemDef = ItemAccessHelper.getItem(itemId);

        // Apply consumable effect
        if (itemDef.effect) {
            // TODO: Implement consumable effect system
            console.log(`🧪 Used ${itemDef.name}`);

            // Remove one from stack
            if (stackableItem) {
                GameEngine.removeStackableItem(itemId, 1);
            } else {
                GameEngine.removeItemFromBank(itemId, 1);
            }

            this.close();
            UICore.update();
        }
    },

    /**
     * Open crafting UI with specific recipe highlighted
     * Called from the "Used in Crafting" section
     */
    openRecipeCrafting(recipeId) {
        this.close();
        // Switch to crafting view
        if (typeof switchView === 'function') {
            switchView('crafting');
        }
        // TODO: Highlight/scroll to specific recipe when crafting UI is complete
        // This will set the selected recipe in the crafting UI
        console.log(`🔨 Opening crafting UI for recipe: ${recipeId}`);
    },


    /**
     * Add keyboard listeners
     */
    addKeyboardListeners() {
        document.addEventListener('keydown', this.handleKeyPress);
    },

    /**
     * Remove keyboard listeners
     */
    removeKeyboardListeners() {
        document.removeEventListener('keydown', this.handleKeyPress);
    },

    /**
     * Handle keyboard presses
     */
    handleKeyPress(e) {
        if (e.key === 'Escape') {
            ItemModal.close();
        }
    }
};
