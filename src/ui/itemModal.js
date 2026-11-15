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

        // Get rarity information
        // For instanced items, use the instance's rarity (rolled at craft time)
        // For non-instanced items, use the base item definition's rarity
        const lookupId = bankItem?.baseItemId || itemId;
        const itemDefForRarity = ItemAccessHelper.getItem(lookupId);
        let rarityTier = 'common';
        if (instancedItem && instancedItem.rarity) {
            // Instanced item: use the rarity stored on the instance
            rarityTier = instancedItem.rarity;
        } else {
            // Non-instanced item: get rarity from item definition
            rarityTier = itemDefForRarity?.rarity || 'common';
        }
        const rarity = GameEngine.definitions.RARITY_TIERS[rarityTier] || GameEngine.definitions.RARITY_TIERS.common;
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

        // Stats section (pass the bank instance so rarity-scaled stats are shown)
        this.renderStats(itemDef, bankItem);

        // Recipes section
        this.renderRecipes(itemId);

        // Source information
        this.renderSources(itemId);

        // Action buttons
        this.renderActions(itemId, itemDef);
    },

    /**
     * Render item stats.
     * @param {object} itemDef - base item definition
     * @param {object} [bankItem] - the bank entry; for crafted equipment this is the
     *        instance carrying rarity-scaled `stats`, which we prefer over the base def.
     */
    renderStats(itemDef, bankItem) {
        const container = document.getElementById('itemModalStats');

        // Equipment defs store their numbers under `combatStats`; crafted instances
        // carry the rarity-scaled copy under `stats`. Prefer the instance when present.
        const src = (bankItem && bankItem.stats && Object.keys(bankItem.stats).length)
            ? bankItem.stats
            : (itemDef.combatStats || itemDef.stats || {});

        const sections = [];

        // ---- Combat ----
        const COMBAT = [
            ['damage', 'Damage', '', ''],
            ['attackDamage', 'Attack Damage', '', ''],
            ['attackSpeed', 'Attack Speed', '', '/s'],
            ['accuracy', 'Accuracy', '', ''],
            ['defense', 'Defense', '', ''],
            ['health', 'Health', '+', ''],
            ['maxHealth', 'Health', '+', ''],
            ['evasion', 'Evasion', '+', ''],
            ['critChance', 'Crit Chance', '+', '%'],
            ['critDamage', 'Crit Damage', '+', '%'],
            ['damageReduction', 'Damage Reduction', '', '%'],
            ['flatDamageReduction', 'Flat Damage Reduction', '', ''],
        ];
        let combatRows = '';
        for (const [key, label, pre, suf] of COMBAT) {
            if (src[key]) combatRows += `<div class="stat-row"><span>${label}:</span><span class="stat-value">${pre}${src[key]}${suf}</span></div>`;
        }
        if (combatRows) sections.push('<div class="stat-category"><h4>⚔️ Combat</h4>' + combatRows + '</div>');

        // ---- Gathering ----
        const GATHER = {
            miningPower: 'Mining Power', loggingPower: 'Logging Power', fishingPower: 'Fishing Power',
            huntingPower: 'Hunting Power', foragingPower: 'Foraging Power', thievingPower: 'Thieving Power'
        };
        let gatherRows = '';
        for (const key in GATHER) {
            if (src[key]) gatherRows += `<div class="stat-row"><span>${GATHER[key]}:</span><span class="stat-value">${src[key]}</span></div>`;
        }
        if (gatherRows) sections.push('<div class="stat-category"><h4>⛏️ Gathering</h4>' + gatherRows + '</div>');

        // ---- Tool identity (gathering tools: type, tier, skill requirement) ----
        if (itemDef.weaponCategory === 'tool' || itemDef.toolType) {
            let rows = '';
            if (itemDef.toolType) rows += `<div class="stat-row"><span>Tool Type:</span><span class="stat-value">${this._cap(itemDef.toolType)}</span></div>`;
            if (itemDef.toolTier) rows += `<div class="stat-row"><span>Tool Tier:</span><span class="stat-value">${itemDef.toolTier}</span></div>`;
            if (itemDef.requirements) {
                for (const [skill, lvl] of Object.entries(itemDef.requirements)) {
                    if (skill === 'characterLevel' && lvl <= 1) continue;
                    rows += `<div class="stat-row"><span>Requires:</span><span class="stat-value">${this._cap(skill)} Lv.${lvl}</span></div>`;
                }
            }
            if (rows) sections.push('<div class="stat-category"><h4>🛠️ Tool</h4>' + rows + '</div>');
        }

        // ---- Gathering modifiers (per-skill speed / accuracy / yield from gatheringBonus) ----
        const gb = (bankItem && bankItem.gatheringBonus && Object.keys(bankItem.gatheringBonus).length)
            ? bankItem.gatheringBonus
            : itemDef.gatheringBonus;
        if (gb && Object.keys(gb).length) {
            let rows = '';
            for (const [skill, mods] of Object.entries(gb)) {
                if (!mods || typeof mods !== 'object') continue;
                const label = this._cap(skill);
                if (mods.speed && mods.speed !== 1) {
                    rows += `<div class="stat-row"><span>${label} Speed:</span><span class="stat-value">+${Math.round((mods.speed - 1) * 100)}%</span></div>`;
                }
                if (mods.accuracy) {
                    rows += `<div class="stat-row"><span>${label} Accuracy:</span><span class="stat-value">+${Math.round(mods.accuracy * 100)}%</span></div>`;
                }
                if (mods.yield) {
                    const yieldTxt = mods.yield > 1
                        ? `+${Math.round((mods.yield - 1) * 100)}%`
                        : `+${mods.yield}`;
                    rows += `<div class="stat-row"><span>${label} Yield:</span><span class="stat-value">${yieldTxt}</span></div>`;
                }
            }
            if (rows) sections.push('<div class="stat-category"><h4>⛏️ Gathering Modifiers</h4>' + rows + '</div>');
        }

        // ---- Skilling bonus (XP / yield gear; it carries no combat stats) ----
        if (itemDef.skillingBonus) {
            const sb = itemDef.skillingBonus;
            const skillsTxt = Array.isArray(sb.skills)
                ? sb.skills.map(s => this._cap(s)).join(', ')
                : (sb.skills === 'all' ? 'All skills' : this._cap(sb.skills || ''));
            let rows = '';
            if (skillsTxt) rows += `<div class="stat-row"><span>Skill:</span><span class="stat-value">${skillsTxt}</span></div>`;
            if (sb.xp) rows += `<div class="stat-row"><span>Bonus XP:</span><span class="stat-value">+${(sb.xp * 100).toFixed(1)}%</span></div>`;
            if (sb.yield) rows += `<div class="stat-row"><span>Bonus Yield:</span><span class="stat-value">${(sb.yield.chance * 100).toFixed(0)}% → +${sb.yield.amount}</span></div>`;
            if (rows) sections.push('<div class="stat-category"><h4>🌿 Skilling</h4>' + rows + '</div>');
        }

        // ---- Attributes ----
        if (itemDef.attributes && Object.keys(itemDef.attributes).length) {
            let rows = '';
            for (const [k, v] of Object.entries(itemDef.attributes)) {
                if (v) rows += `<div class="stat-row"><span>${this._cap(k)}:</span><span class="stat-value">+${v}</span></div>`;
            }
            if (rows) sections.push('<div class="stat-category"><h4>✨ Attributes</h4>' + rows + '</div>');
        }

        // ---- Properties ----
        let propRows = '';
        const weight = itemDef.weight ?? src.weight;
        if (weight) propRows += `<div class="stat-row"><span>Weight:</span><span class="stat-value">${weight}</span></div>`;
        const dtype = src.damageType || itemDef.damageType;
        if (dtype) {
            const d = GameEngine.definitions.damageTypes?.[dtype];
            propRows += `<div class="stat-row"><span>Damage Type:</span><span class="stat-value" style="color: ${d?.color || '#fff'}">${d?.name || dtype}</span></div>`;
        }
        if (itemDef.equipSlot) propRows += `<div class="stat-row"><span>Slot:</span><span class="stat-value">${this._cap(itemDef.equipSlot)}</span></div>`;
        if (itemDef.stackLimit && itemDef.stackLimit !== 1) propRows += `<div class="stat-row"><span>Stack Limit:</span><span class="stat-value">${itemDef.stackLimit === Infinity ? '∞' : itemDef.stackLimit}</span></div>`;
        if (propRows) sections.push('<div class="stat-category"><h4>📦 Properties</h4>' + propRows + '</div>');

        // ---- Consumable ----
        let consRows = '';
        if (itemDef.healAmount) consRows += `<div class="stat-row"><span>Heal Amount:</span><span class="stat-value">+${itemDef.healAmount} HP</span></div>`;
        if (itemDef.foodValue) consRows += `<div class="stat-row"><span>Food Value:</span><span class="stat-value">${itemDef.foodValue}</span></div>`;
        if (consRows) sections.push('<div class="stat-category"><h4>🧪 Consumable</h4>' + consRows + '</div>');

        if (!sections.length) {
            container.innerHTML = '<p style="color: #888; text-align: center;">No stats available</p>';
            return;
        }
        container.innerHTML = '<div class="item-stats-grid">' + sections.join('') + '</div>';
    },

    /** Capitalize the first letter of a word. */
    _cap(s) {
        if (!s) return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
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

        // Reverse Engineer button — strip a salvaged item to learn its recipe.
        if (itemDef.reverseEngineerable) {
            const recipeId = itemDef.recipeId || itemId;
            const alreadyKnown = GameEngine.state.unlockedRecipes && GameEngine.state.unlockedRecipes[recipeId];
            if (alreadyKnown) {
                html += `<button class="action-btn" disabled style="opacity:0.6;">
                    🔬 Recipe Learned
                </button>`;
            } else {
                const recipe = (typeof RecipeRegistry !== 'undefined' && RecipeRegistry.get) ? RecipeRegistry.get(recipeId) : null;
                const unlockName = recipe && recipe.name ? recipe.name : 'its blueprint';
                html += `<button class="action-btn reverse-engineer-btn" onclick="ItemModal.reverseEngineer('${itemId}')">
                    🔬 Reverse Engineer
                </button>`;
                html += `<div class="reverse-engineer-hint" style="margin-top:6px;font-size:0.78em;color:#5fb0e8;line-height:1.3;">
                    🔬 Strip this salvaged part to learn <strong>${unlockName}</strong> — consumes the sample and unlocks the recipe for crafting.
                </div>`;
            }
        }

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
     * Reverse-engineer a salvaged item into a crafting recipe.
     */
    reverseEngineer(itemId) {
        if (typeof GameEngine === 'undefined' || !GameEngine.reverseEngineerItem) {
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification('❌ Reverse engineering unavailable', 'error', 3000);
            }
            return;
        }

        const result = GameEngine.reverseEngineerItem(itemId);

        if (result.success) {
            const recipe = (typeof RecipeRegistry !== 'undefined' && RecipeRegistry.get)
                ? RecipeRegistry.get(result.recipeId) : null;
            const label = recipe?.name || result.recipeId;
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification(`🔬 Recipe unlocked: ${label}`, 'success', 3000);
            }
        } else {
            if (typeof Animations !== 'undefined' && Animations.showNotification) {
                Animations.showNotification(`❌ ${result.reason || 'Cannot reverse engineer'}`, 'error', 3000);
            }
        }

        // Refresh bank UI (item consumed) and close.
        if (typeof EquipmentUI !== 'undefined' && EquipmentUI.updateBank) {
            EquipmentUI.lastBankState = null;
            EquipmentUI.updateBank();
        }

        this.close();
        if (typeof UICore !== 'undefined' && UICore.update) UICore.update();
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
