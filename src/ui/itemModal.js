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
        // For weapon instances, use baseItemId to get definition
        const bankItem = GameEngine.state.bank.items[itemId];
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
        // Get rarity information (use baseItemId for instances)
        const bankItem = GameEngine.state.bank.items[itemId];
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
                usedInRecipes.push({ id: recipeId, ...recipe });
            }
        }

        if (usedInRecipes.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">Not used in any recipes</p>';
            return;
        }

        let html = '<div class="recipe-list">';
        for (let recipe of usedInRecipes.slice(0, 5)) {  // Limit to 5 recipes
            const outputItem = ItemAccessHelper.getItem(recipe.output);
            html += `
                <div class="recipe-card" onclick="ItemModal.viewRecipe('${recipe.id}')">
                    <div style="font-size: 1.5em;">${outputItem?.image || '📦'}</div>
                    <div style="font-size: 0.85em;">${outputItem?.name || recipe.id}</div>
                </div>
            `;
        }

        if (usedInRecipes.length > 5) {
            html += `<div style="text-align: center; color: #888; font-size: 0.85em; padding: 10px;">+${usedInRecipes.length - 5} more recipes</div>`;
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
        const bankItem = GameEngine.state.bank.items[itemId];
        const quantity = bankItem ? bankItem.quantity : 0;

        if (quantity === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">You don\'t own this item</p>';
            return;
        }

        let html = '<div class="action-buttons">';

        // Equip/Unequip button
        if (itemDef.equipSlot) {
            const isEquipped = GameEngine.state.equipment[itemDef.equipSlot] === itemId;
            if (isEquipped) {
                html += `<button class="action-btn unequip-btn" onclick="ItemModal.unequipItem('${itemId}', '${itemDef.equipSlot}')">
                    🛡️ Unequip
                </button>`;
            } else {
                html += `<button class="action-btn equip-btn" onclick="ItemModal.equipItem('${itemId}', '${itemDef.equipSlot}')">
                    ⚔️ Equip
                </button>`;
            }
        }

        // Attachment modification button for weapons with rarity > common
        if (itemDef.equipSlot === 'weapon' && typeof AttachmentSystem !== 'undefined') {
            // Use baseItemId for instances
            const lookupId = bankItem?.baseItemId || itemId;
            const rarity = GameEngine.getItemRarity(lookupId);
            const rarityName = rarity ? rarity.id : 'common';

            if (rarityName !== 'common') {
                const attachmentSlots = AttachmentSystem.ATTACHMENT_SLOTS_BY_RARITY[rarityName];
                const isInstance = bankItem.instanceId;
                const currentAttachments = isInstance ? bankItem.attachments : {};
                const attachmentCount = Object.values(currentAttachments || {}).filter(a => a).length;

                html += `<button class="action-btn attachment-btn" onclick="ItemModal.openAttachmentModal('${itemId}')">
                    ⚙️ Modify Attachments (${attachmentCount}/${attachmentSlots})
                </button>`;
            }
        }

        // Use in Craft button
        html += `<button class="action-btn craft-btn" onclick="ItemModal.showCraftingOptions('${itemId}')">
            🔨 Use in Craft
        </button>`;

        // Sell button
        html += `<button class="action-btn sell-btn" onclick="ItemModal.sellItem('${itemId}')">
            💰 Sell
        </button>`;

        // Drop/Destroy button
        html += `<button class="action-btn destroy-btn" onclick="ItemModal.destroyItem('${itemId}')">
            🗑️ Destroy
        </button>`;

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Equip an item
     */
    equipItem(itemId, slot) {
        GameEngine.equipItem(itemId, slot);
        this.close();
        UICore.update();
    },

    /**
     * Unequip an item
     */
    unequipItem(itemId, slot) {
        GameEngine.unequipItem(slot);
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
     * Sell an item
     */
    sellItem(itemId) {
        const bankItem = GameEngine.state.bank.items[itemId];
        if (!bankItem) return;

        const sellValue = 10; // Base sell value per item
        const totalValue = sellValue * bankItem.quantity;

        if (confirm(`Sell all ${bankItem.quantity}x ${ItemAccessHelper.getItem(itemId).name} for ${totalValue} gold?`)) {
            GameEngine.removeItemFromBank(itemId, bankItem.quantity);
            GameEngine.state.currencies.gold += totalValue;
            this.close();
            UICore.update();
            console.log(`💰 Sold ${bankItem.quantity}x ${itemId} for ${totalValue} gold`);
        }
    },

    /**
     * Destroy an item
     */
    destroyItem(itemId) {
        const bankItem = GameEngine.state.bank.items[itemId];
        if (!bankItem) return;

        if (confirm(`⚠️ Permanently destroy all ${bankItem.quantity}x ${ItemAccessHelper.getItem(itemId).name}? This cannot be undone!`)) {
            GameEngine.removeItemFromBank(itemId, bankItem.quantity);
            this.close();
            UICore.update();
            console.log(`🗑️ Destroyed ${bankItem.quantity}x ${itemId}`);
        }
    },

    /**
     * View a recipe
     */
    viewRecipe(recipeId) {
        this.close();
        switchView('crafting');
        // TODO: Open crafting view and highlight this recipe
    },

    /**
     * Open attachment modal for weapon
     */
    openAttachmentModal(itemId) {
        this.close();
        if (typeof AttachmentModal !== 'undefined') {
            AttachmentModal.open(itemId);
        } else {
            console.error('AttachmentModal not loaded');
        }
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
