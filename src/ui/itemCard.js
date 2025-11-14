/**
 * REUSABLE ITEM CARD COMPONENT
 *
 * Standardized item display component used across the entire game.
 * Provides consistent visual representation and interaction for items in different contexts.
 *
 * Usage:
 *   ItemCard.create(itemId, context, options)
 *
 * Contexts: 'bank', 'crafting', 'equipment', 'mission', 'tooltip', 'loot', 'shop'
 */

const ItemCard = {
    /**
     * Create an item card HTML element
     * @param {string} itemId - The item ID
     * @param {string} context - Display context ('bank', 'crafting', 'equipment', 'mission', 'tooltip', 'loot', 'shop')
     * @param {object} options - Additional options
     * @param {number} options.quantity - Override quantity display
     * @param {boolean} options.isNew - Mark as new item
     * @param {boolean} options.isEquipped - Mark as currently equipped
     * @param {boolean} options.showActions - Show action buttons
     * @param {function} options.onClick - Custom click handler
     * @param {function} options.onContextMenu - Custom right-click handler
     * @param {boolean} options.compact - Use compact display mode
     * @returns {string} HTML string for the item card
     */
    create(itemId, context = 'bank', options = {}) {
        const itemDef = GameEngine.definitions.items[itemId];
        if (!itemDef) {
            console.warn(`Item definition not found for: ${itemId}`);
            return '';
        }

        // Get item data from bank
        const bankItem = GameEngine.state.bank.items[itemId];
        const quantity = options.quantity !== undefined ? options.quantity : (bankItem ? bankItem.quantity : 0);
        const isNew = options.isNew !== undefined ? options.isNew : (bankItem ? bankItem.isNew : false);

        // Get rarity information
        const rarity = GameEngine.getItemRarity(itemId);
        const rarityColor = rarity ? rarity.color : '#9e9e9e';
        const rarityGlow = rarity && rarity.glow;
        const rarityName = rarity ? rarity.name : 'Common';

        // Check if equipped
        const isEquipped = options.isEquipped !== undefined ? options.isEquipped : this.isItemEquipped(itemId);

        // Stack limit display
        const stackInfo = itemDef.stackLimit === Infinity ? "∞" : `${quantity}/${itemDef.stackLimit}`;

        // Build CSS classes
        const classes = ['item-card'];
        classes.push(`item-card-${context}`);
        if (isNew) classes.push('item-card-new');
        if (isEquipped) classes.push('item-card-equipped');
        if (options.compact) classes.push('item-card-compact');
        if (rarityGlow) classes.push('item-card-glow');

        // Build inline styles
        const styles = [];
        styles.push(`border-color: ${rarityColor}`);
        if (rarityGlow) {
            styles.push(`box-shadow: 0 0 10px ${rarityColor}`);
        }

        // Build event handlers
        // If custom onClick is provided as string, use it directly; otherwise use default
        const clickHandler = (typeof options.onClick === 'string') ? options.onClick : this.getDefaultClickHandler(itemId, context);
        const contextMenuHandler = (typeof options.onContextMenu === 'string') ? options.onContextMenu : this.getDefaultContextMenuHandler(itemId, context);

        // Build card HTML based on context
        return this.renderCard(itemId, itemDef, {
            classes: classes.join(' '),
            styles: styles.join('; '),
            clickHandler,
            contextMenuHandler,
            quantity,
            stackInfo,
            isNew,
            isEquipped,
            rarityColor,
            rarityName,
            context,
            showActions: options.showActions,
            compact: options.compact
        });
    },

    /**
     * Render the card HTML
     */
    renderCard(itemId, itemDef, params) {
        const {
            classes,
            styles,
            clickHandler,
            contextMenuHandler,
            quantity,
            stackInfo,
            isNew,
            isEquipped,
            rarityColor,
            rarityName,
            context,
            showActions,
            compact
        } = params;

        let html = `
            <div class="${classes}"
                 style="${styles}"
                 onclick="${clickHandler}"
                 oncontextmenu="${contextMenuHandler}"
                 data-item-id="${itemId}"
                 title="${itemDef.description}">
        `;

        // Top-right badges/indicators
        html += '<div class="item-card-badges">';

        // Stack limit indicator (top-right corner)
        if (context === 'bank' || context === 'loot') {
            html += `<div class="item-card-stack-limit">${stackInfo}</div>`;
        }

        // Equipped indicator
        if (isEquipped) {
            html += `<div class="item-card-equipped-badge" title="Currently Equipped">⚔️</div>`;
        }

        html += '</div>';

        // Main content
        html += `<div class="item-card-content">`;

        // Icon/Image
        html += `<div class="item-card-icon">${itemDef.image || '📦'}</div>`;

        // Name (colored by rarity)
        html += `<div class="item-card-name" style="color: ${rarityColor};">${itemDef.name}</div>`;

        // Context-specific information
        html += this.renderContextInfo(itemId, itemDef, context, params);

        // Quantity display (bottom)
        if (quantity > 0 && (context === 'bank' || context === 'loot' || context === 'crafting')) {
            html += `<div class="item-card-quantity">${Formatting.formatNumber(quantity)}</div>`;
        }

        html += `</div>`; // End content

        // Action buttons (if enabled)
        if (showActions) {
            html += this.renderActions(itemId, itemDef, context);
        }

        html += `</div>`; // End card

        return html;
    },

    /**
     * Render context-specific information
     */
    renderContextInfo(itemId, itemDef, context, params) {
        let html = '';

        switch (context) {
            case 'crafting':
                // Show if player has materials
                const hasMaterials = this.checkHasMaterials(itemId);
                if (!hasMaterials) {
                    html += `<div class="item-card-warning">⚠️ Need Materials</div>`;
                }
                break;

            case 'equipment':
                // Show key stats
                if (itemDef.stats) {
                    html += '<div class="item-card-stats">';
                    if (itemDef.stats.attackDamage) {
                        html += `<div>⚔️ ${itemDef.stats.attackDamage}</div>`;
                    }
                    if (itemDef.stats.damageReduction) {
                        html += `<div>🛡️ ${itemDef.stats.damageReduction}%</div>`;
                    }
                    html += '</div>';
                }
                break;

            case 'mission':
                // Show required quantity vs owned
                const required = params.requiredQuantity || 1;
                const owned = params.quantity || 0;
                const hasEnough = owned >= required;
                html += `<div class="item-card-requirement ${hasEnough ? 'met' : 'unmet'}">`;
                html += `${owned}/${required}`;
                html += `</div>`;
                break;

            case 'tooltip':
                // Show rarity name
                html += `<div class="item-card-rarity" style="color: ${params.rarityColor};">${params.rarityName}</div>`;
                break;

            case 'shop':
                // Show price
                if (itemDef.value) {
                    html += `<div class="item-card-price">💰 ${itemDef.value}</div>`;
                }
                break;

            case 'loot':
                // Loot context - minimal extra info
                break;

            case 'bank':
            default:
                // Bank shows rarity in subtle way
                break;
        }

        return html;
    },

    /**
     * Render action buttons for the card
     */
    renderActions(itemId, itemDef, context) {
        let html = '<div class="item-card-actions">';

        switch (context) {
            case 'bank':
                if (itemDef.equipSlot) {
                    const isEquipped = this.isItemEquipped(itemId);
                    if (isEquipped) {
                        html += `<button class="item-card-action-btn" onclick="event.stopPropagation(); unequipItem('${itemDef.equipSlot}', event);">Unequip</button>`;
                    } else {
                        html += `<button class="item-card-action-btn" onclick="event.stopPropagation(); equipFromModal('${itemId}', '${itemDef.equipSlot}');">Equip</button>`;
                    }
                }
                break;

            case 'crafting':
                html += `<button class="item-card-action-btn" onclick="event.stopPropagation(); startCrafting('${itemId}');">Craft</button>`;
                break;

            case 'shop':
                html += `<button class="item-card-action-btn" onclick="event.stopPropagation(); buyItem('${itemId}');">Buy</button>`;
                break;
        }

        html += '</div>';
        return html;
    },

    /**
     * Get default click handler based on context
     */
    getDefaultClickHandler(itemId, context) {
        const itemDef = GameEngine.definitions.items[itemId];

        switch (context) {
            case 'bank':
            case 'loot':
                return `inspectItem('${itemId}')`;
            case 'equipment':
                // In equipment context, clicking should equip the item
                // The equipFromModal function needs the slot, so we inspect instead
                // The actual equip action happens via the action button
                return `inspectItem('${itemId}')`;
            case 'crafting':
                return `startCrafting('${itemId}')`;
            case 'mission':
                return `showMissionItemDetails('${itemId}')`;
            case 'shop':
                return `buyItem('${itemId}')`;
            default:
                return `inspectItem('${itemId}')`;
        }
    },

    /**
     * Get default context menu handler based on context
     */
    getDefaultContextMenuHandler(itemId, context) {
        if (context === 'bank') {
            return `showContextMenu(event, '${itemId}'); return false;`;
        }
        return 'return false;'; // Prevent default context menu
    },

    /**
     * Check if item is currently equipped
     */
    isItemEquipped(itemId) {
        const equipment = GameEngine.state.equipment;
        for (let slot in equipment) {
            if (equipment[slot] === itemId) {
                return true;
            }
        }
        return false;
    },

    /**
     * Check if player has materials for crafting
     */
    checkHasMaterials(recipeId) {
        const recipe = GameEngine.definitions.recipes[recipeId];
        if (!recipe || !recipe.inputs) return true;

        for (let inputId in recipe.inputs) {
            const required = recipe.inputs[inputId];
            const owned = GameEngine.getItemCount(inputId);
            if (owned < required) {
                return false;
            }
        }
        return true;
    },

    /**
     * Create multiple item cards at once
     * @param {array} items - Array of {itemId, context, options} objects
     * @returns {string} Concatenated HTML for all cards
     */
    createBatch(items) {
        return items.map(item => this.create(item.itemId, item.context, item.options)).join('');
    }
};
