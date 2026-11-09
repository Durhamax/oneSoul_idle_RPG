/**
 * LOADOUT SLOT RENDERER
 *
 * Unified slot rendering utility for equipment display across:
 * - Overview Page (overviewUI.js)
 * - Equipment Tab (equipmentComponent.js)
 * - Combat Loadout (loadoutContainer.js)
 *
 * Features:
 * - Consistent HTML structure
 * - Rarity-based styling with glow effects
 * - IconHelper integration (CRITICAL - fixes raw icon bug)
 * - Instance ID parsing for equipment lookup
 * - Responsive sizing support
 *
 * Created: 2025-12-06
 */

const LoadoutSlotRenderer = {
    // Slot type icons (empty state placeholders)
    SLOT_ICONS: {
        weapon: '⚔️',
        armor: '🛡️',
        back: '🎒',
        gloves: '🧤',
        boots: '👢',
        neck: '📿',
        ring: '💍',
        helmet: '🪖',
        chest: '👕',
        legs: '👖',
        // Consumables
        food: '🍖',
        potion: '🧪',
        ammo: '🎯',
        // Tech
        tech1: '⚡',
        tech2: '⚡',
        tech3: '⚡',
        tech4: '⚡'
    },

    // Slot display names
    SLOT_NAMES: {
        weapon: 'Weapon',
        armor: 'Armor Set',
        back: 'Back',
        gloves: 'Gloves',
        boots: 'Boots',
        neck: 'Neck',
        ring: 'Ring',
        helmet: 'Helmet',
        chest: 'Chest',
        legs: 'Legs',
        food: 'Food',
        potion: 'Potion',
        ammo: 'Ammo',
        tech1: 'Tech 1',
        tech2: 'Tech 2',
        tech3: 'Tech 3',
        tech4: 'Tech 4'
    },

    /**
     * Render a standard equipment slot
     * @param {Object} options - Render options
     * @param {string} options.slotName - Equipment slot name (e.g., 'weapon', 'armor')
     * @param {string|Object|null} options.itemData - Equipped item ID or object
     * @param {string} options.size - Size variant: 'sm' | 'md' | 'lg' | 'auto'
     * @param {boolean} options.showLabel - Show slot label
     * @param {boolean} options.showName - Show item name when filled
     * @param {boolean} options.interactive - Allow clicking
     * @param {string} options.onClick - Click handler (function name or inline)
     * @returns {string} HTML string
     */
    renderSlot(options) {
        const {
            slotName,
            itemData = null,
            size = 'auto',
            showLabel = false,
            showName = false,
            interactive = true,
            onClick = null
        } = options;

        // Parse item data to get item ID
        const itemId = this._extractItemId(itemData);

        // Get item definition
        const itemDef = itemId ? this._getItemDefinition(itemId) : null;

        // Get rarity info
        const { rarity, rarityColor, hasGlow } = this._getRarityInfo(itemId, itemDef);

        // Build CSS classes
        const classes = [
            'unified-slot',
            itemDef ? 'unified-slot--filled' : 'unified-slot--empty',
            hasGlow ? 'unified-slot--glow' : '',
            interactive ? 'unified-slot--interactive' : '',
            `rarity-${rarity}`,
            size !== 'auto' ? `unified-slot--${size}` : ''
        ].filter(Boolean).join(' ');

        // Build click handler
        const clickHandler = interactive && onClick ? `onclick="${onClick}"` : '';

        // Get icon HTML
        const iconHTML = itemDef
            ? this._getIconHTML(itemDef, this._getIconSize(size))
            : `<span class="unified-slot__empty-icon">${this.SLOT_ICONS[slotName] || '📦'}</span>`;

        // Build label (slot type label)
        const labelHTML = showLabel
            ? `<div class="unified-slot__label">${this.SLOT_NAMES[slotName] || slotName}</div>`
            : '';

        // Build item name (always show when filled, with truncation)
        let nameHTML = '';
        if (itemDef) {
            const itemName = itemDef.name || '';
            const truncatedName = itemName.length > 15
                ? itemName.substring(0, 14) + '…'
                : itemName;
            nameHTML = `<span class="slot-item-name">${truncatedName}</span>`;
        }

        return `
            <div class="${classes}"
                 style="--rarity-color: ${rarityColor};"
                 data-slot="${slotName}"
                 data-item-id="${itemId || ''}"
                 title="${itemDef ? `${itemDef.name} (${rarity})` : this.SLOT_NAMES[slotName] || slotName}"
                 ${clickHandler}>
                <div class="unified-slot__icon">${iconHTML}</div>
                ${nameHTML}
                ${labelHTML}
            </div>
        `;
    },

    /**
     * Render the tall armor slot
     * @param {Object} options - Same as renderSlot with armor-specific handling
     * @returns {string} HTML string
     */
    renderArmorSlot(options) {
        const {
            itemData = null,
            showLabel = true,
            showName = true,
            interactive = true,
            onClick = null
        } = options;

        // Parse item data to get item ID
        const itemId = this._extractItemId(itemData);

        // Get item definition
        const itemDef = itemId ? this._getItemDefinition(itemId) : null;

        // Get rarity info
        const { rarity, rarityColor, hasGlow } = this._getRarityInfo(itemId, itemDef);

        // Build CSS classes
        const classes = [
            'unified-slot',
            'unified-slot--armor',
            itemDef ? 'unified-slot--filled' : 'unified-slot--empty',
            hasGlow ? 'unified-slot--glow' : '',
            interactive ? 'unified-slot--interactive' : '',
            `rarity-${rarity}`
        ].filter(Boolean).join(' ');

        // Build click handler
        const clickHandler = interactive && onClick ? `onclick="${onClick}"` : '';

        // Get icon HTML (larger for armor)
        const iconHTML = itemDef
            ? this._getIconHTML(itemDef, 64)
            : `<span class="unified-slot__empty-icon">${this.SLOT_ICONS.armor}</span>`;

        // Build label (only show when empty)
        const labelHTML = showLabel && !itemDef
            ? `<div class="unified-slot__label">Armor Set</div>`
            : '';

        // Build item name (always show when filled, with truncation)
        let nameHTML = '';
        if (itemDef) {
            const itemName = itemDef.name || '';
            const truncatedName = itemName.length > 15
                ? itemName.substring(0, 14) + '…'
                : itemName;
            nameHTML = `<span class="slot-item-name">${truncatedName}</span>`;
        }

        return `
            <div class="${classes}"
                 style="--rarity-color: ${rarityColor};"
                 data-slot="armor"
                 data-item-id="${itemId || ''}"
                 title="${itemDef ? `${itemDef.name} (${rarity})` : 'Armor Set'}"
                 ${clickHandler}>
                <div class="unified-slot__icon">${iconHTML}</div>
                ${nameHTML}
                ${labelHTML}
            </div>
        `;
    },

    /**
     * Render consumable slot with quantity
     * @param {Object} options - Render options
     * @param {string} options.slotName - Slot name (food, potion, ammo)
     * @param {Object|string|null} options.itemData - Item data with quantity
     * @param {number} options.quantity - Override quantity
     * @param {string} options.size - Size variant
     * @param {boolean} options.showLabel - Show slot label
     * @param {boolean} options.interactive - Allow clicking
     * @param {string} options.onClick - Click handler
     * @returns {string} HTML string
     */
    renderConsumableSlot(options) {
        const {
            slotName,
            itemData = null,
            quantity: overrideQuantity = null,
            size = 'auto',
            showLabel = false,
            interactive = true,
            onClick = null
        } = options;

        // Parse item data
        const itemId = this._extractItemId(itemData);
        const itemQuantity = this._extractQuantity(itemData);
        const displayQuantity = overrideQuantity !== null ? overrideQuantity : itemQuantity;

        // Get item definition
        const itemDef = itemId ? this._getItemDefinition(itemId) : null;

        // Build CSS classes
        const classes = [
            'unified-slot',
            'unified-slot--consumable',
            itemDef ? 'unified-slot--filled' : 'unified-slot--empty',
            interactive ? 'unified-slot--interactive' : '',
            size !== 'auto' ? `unified-slot--${size}` : ''
        ].filter(Boolean).join(' ');

        // Build click handler
        const clickHandler = interactive && onClick ? `onclick="${onClick}"` : '';

        // Get icon HTML
        const iconHTML = itemDef
            ? this._getIconHTML(itemDef, this._getIconSize(size))
            : `<span class="unified-slot__empty-icon">${this.SLOT_ICONS[slotName] || '📦'}</span>`;

        // Build label
        const labelHTML = showLabel
            ? `<div class="unified-slot__label">${this.SLOT_NAMES[slotName] || slotName}</div>`
            : '';

        // Build quantity badge
        const hasQuantity = itemDef && displayQuantity > 0;
        const quantityHTML = `<div class="unified-slot__quantity" data-visible="${hasQuantity}">${hasQuantity ? displayQuantity : ''}</div>`;

        return `
            <div class="${classes}"
                 data-slot="${slotName}"
                 data-item-id="${itemId || ''}"
                 title="${itemDef ? `${itemDef.name} (x${displayQuantity})` : this.SLOT_NAMES[slotName] || slotName}"
                 ${clickHandler}>
                <div class="unified-slot__icon">${iconHTML}</div>
                ${labelHTML}
                ${quantityHTML}
            </div>
        `;
    },

    /**
     * Render technology slot with intellect gating
     * @param {Object} options - Render options
     * @param {string} options.slotName - Slot name (tech1, tech2, tech3, tech4)
     * @param {string|Object|null} options.itemData - Equipped item
     * @param {number} options.requiredIntellect - Required intellect to unlock
     * @param {number} options.currentIntellect - Player's current intellect
     * @param {string} options.size - Size variant
     * @param {boolean} options.showLabel - Show slot label
     * @param {boolean} options.interactive - Allow clicking
     * @param {string} options.onClick - Click handler
     * @returns {string} HTML string
     */
    renderTechSlot(options) {
        const {
            slotName,
            itemData = null,
            requiredIntellect = 0,
            currentIntellect = 0,
            size = 'auto',
            showLabel = false,
            interactive = true,
            onClick = null
        } = options;

        const isLocked = currentIntellect < requiredIntellect;

        // If locked, render locked state
        if (isLocked) {
            const classes = [
                'unified-slot',
                'unified-slot--tech',
                'unified-slot--locked',
                size !== 'auto' ? `unified-slot--${size}` : ''
            ].filter(Boolean).join(' ');

            return `
                <div class="${classes}"
                     data-slot="${slotName}"
                     title="Requires ${requiredIntellect} Intellect">
                    <span class="unified-slot__lock">🔒</span>
                    <div class="unified-slot__requirement">${requiredIntellect} INT</div>
                </div>
            `;
        }

        // Parse item data
        const itemId = this._extractItemId(itemData);
        const itemDef = itemId ? this._getItemDefinition(itemId) : null;

        // Get rarity info
        const { rarity, rarityColor, hasGlow } = this._getRarityInfo(itemId, itemDef);

        // Build CSS classes
        const classes = [
            'unified-slot',
            'unified-slot--tech',
            itemDef ? 'unified-slot--filled' : 'unified-slot--empty',
            hasGlow ? 'unified-slot--glow' : '',
            interactive ? 'unified-slot--interactive' : '',
            `rarity-${rarity}`,
            size !== 'auto' ? `unified-slot--${size}` : ''
        ].filter(Boolean).join(' ');

        // Build click handler
        const clickHandler = interactive && onClick ? `onclick="${onClick}"` : '';

        // Get icon HTML
        const iconHTML = itemDef
            ? this._getIconHTML(itemDef, this._getIconSize(size))
            : `<span class="unified-slot__empty-icon">${this.SLOT_ICONS[slotName] || '⚡'}</span>`;

        // Build label
        const labelHTML = showLabel
            ? `<div class="unified-slot__label">${this.SLOT_NAMES[slotName] || slotName}</div>`
            : '';

        return `
            <div class="${classes}"
                 style="--rarity-color: ${rarityColor};"
                 data-slot="${slotName}"
                 data-item-id="${itemId || ''}"
                 title="${itemDef ? `${itemDef.name} (${rarity})` : this.SLOT_NAMES[slotName] || slotName}"
                 ${clickHandler}>
                <div class="unified-slot__icon">${iconHTML}</div>
                ${labelHTML}
            </div>
        `;
    },

    /**
     * Render complete 3-1-3 equipment grid
     * @param {Object} options - Grid options
     * @param {Object} options.equipment - Equipment state object
     * @param {string} options.size - Size variant
     * @param {boolean} options.showLabels - Show slot labels
     * @param {boolean} options.showNames - Show item names
     * @param {boolean} options.interactive - Allow clicking
     * @param {Function} options.onSlotClick - Click handler factory (slotName) => string
     * @returns {string} HTML string
     */
    renderEquipmentGrid(options) {
        const {
            equipment = {},
            size = 'auto',
            showLabels = false,
            showNames = false,
            interactive = true,
            onSlotClick = null
        } = options;

        const getClickHandler = (slot) => {
            if (!interactive) return null;
            if (onSlotClick) return onSlotClick(slot);
            return `openEquipModal('${slot}', event)`;
        };

        // Left column: Weapon, Gloves, Boots
        const leftColumn = `
            <div class="unified-loadout-column">
                ${this.renderSlot({ slotName: 'weapon', itemData: equipment.weapon, size, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('weapon') })}
                ${this.renderSlot({ slotName: 'gloves', itemData: equipment.gloves, size, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('gloves') })}
                ${this.renderSlot({ slotName: 'boots', itemData: equipment.boots, size, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('boots') })}
            </div>
        `;

        // Middle column: Armor (tall)
        const middleColumn = `
            <div class="unified-loadout-column unified-loadout-column--armor">
                ${this.renderArmorSlot({ itemData: equipment.armor, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('armor') })}
            </div>
        `;

        // Right column: Back, Neck, Ring
        const rightColumn = `
            <div class="unified-loadout-column">
                ${this.renderSlot({ slotName: 'back', itemData: equipment.back, size, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('back') })}
                ${this.renderSlot({ slotName: 'neck', itemData: equipment.neck, size, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('neck') })}
                ${this.renderSlot({ slotName: 'ring', itemData: equipment.ring, size, showLabel: showLabels, showName: showNames, interactive, onClick: getClickHandler('ring') })}
            </div>
        `;

        return `
            <div class="unified-loadout-grid">
                ${leftColumn}
                ${middleColumn}
                ${rightColumn}
            </div>
        `;
    },

    /**
     * Render consumables row
     * @param {Object} options - Row options
     * @param {Object} options.equipment - Equipment state object
     * @param {string} options.size - Size variant
     * @param {boolean} options.showLabels - Show slot labels
     * @param {boolean} options.interactive - Allow clicking
     * @param {Function} options.onSlotClick - Click handler factory
     * @returns {string} HTML string
     */
    renderConsumablesRow(options) {
        const {
            equipment = {},
            size = 'auto',
            showLabels = false,
            interactive = true,
            onSlotClick = null
        } = options;

        const getClickHandler = (slot) => {
            if (!interactive) return null;
            if (onSlotClick) return onSlotClick(slot);
            return `openEquipModal('${slot}', event)`;
        };

        return `
            <div class="unified-consumables-row">
                ${this.renderConsumableSlot({ slotName: 'food', itemData: equipment.food, size, showLabel: showLabels, interactive, onClick: getClickHandler('food') })}
                ${this.renderConsumableSlot({ slotName: 'potion', itemData: equipment.potion, size, showLabel: showLabels, interactive, onClick: getClickHandler('potion') })}
                ${this.renderConsumableSlot({ slotName: 'ammo', itemData: equipment.ammo, size, showLabel: showLabels, interactive, onClick: getClickHandler('ammo') })}
            </div>
        `;
    },

    /**
     * Render technology row
     * @param {Object} options - Row options
     * @param {Object} options.equipment - Equipment state object
     * @param {number} options.intellect - Player's intellect attribute
     * @param {string} options.size - Size variant
     * @param {boolean} options.showLabels - Show slot labels
     * @param {boolean} options.interactive - Allow clicking
     * @param {Function} options.onSlotClick - Click handler factory
     * @returns {string} HTML string
     */
    renderTechRow(options) {
        const {
            equipment = {},
            intellect = 0,
            size = 'auto',
            showLabels = false,
            interactive = true,
            onSlotClick = null
        } = options;

        const getClickHandler = (slot) => {
            if (!interactive) return null;
            if (onSlotClick) return onSlotClick(slot);
            return `openEquipModal('${slot}', event)`;
        };

        // Tech slot intellect requirements
        const techRequirements = { tech1: 0, tech2: 3, tech3: 6, tech4: 9 };

        return `
            <div class="unified-tech-row">
                ${this.renderTechSlot({ slotName: 'tech1', itemData: equipment.tech1, requiredIntellect: techRequirements.tech1, currentIntellect: intellect, size, showLabel: showLabels, interactive, onClick: getClickHandler('tech1') })}
                ${this.renderTechSlot({ slotName: 'tech2', itemData: equipment.tech2, requiredIntellect: techRequirements.tech2, currentIntellect: intellect, size, showLabel: showLabels, interactive, onClick: getClickHandler('tech2') })}
                ${this.renderTechSlot({ slotName: 'tech3', itemData: equipment.tech3, requiredIntellect: techRequirements.tech3, currentIntellect: intellect, size, showLabel: showLabels, interactive, onClick: getClickHandler('tech3') })}
                ${this.renderTechSlot({ slotName: 'tech4', itemData: equipment.tech4, requiredIntellect: techRequirements.tech4, currentIntellect: intellect, size, showLabel: showLabels, interactive, onClick: getClickHandler('tech4') })}
            </div>
        `;
    },

    // ===========================
    // PRIVATE HELPER METHODS
    // ===========================

    /**
     * Extract item ID from various input formats
     * @private
     */
    _extractItemId(itemData) {
        if (!itemData) return null;

        // String ID
        if (typeof itemData === 'string') {
            return itemData;
        }

        // Object with itemId (consumables)
        if (typeof itemData === 'object') {
            return itemData.itemId || itemData.id || itemData.instanceId || null;
        }

        return null;
    },

    /**
     * Extract quantity from consumable item data
     * @private
     */
    _extractQuantity(itemData) {
        if (!itemData) return 0;

        if (typeof itemData === 'object') {
            return itemData.quantity || 0;
        }

        return 0;
    },

    /**
     * Parse instance ID to get base item ID
     * Handles both formats:
     * - baseId_instance_timestamp_random (dualBankSystem)
     * - baseId_timestamp_random (craftingSystem)
     * @private
     */
    _parseInstanceId(fullId) {
        if (!fullId) return fullId;

        // Format 1: baseId_instance_timestamp_random
        if (fullId.includes('_instance_')) {
            return fullId.split('_instance_')[0];
        }

        // Format 2: baseId_timestamp_random
        const parts = fullId.split('_');
        if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
            return parts.slice(0, -2).join('_');
        }

        return fullId;
    },

    /**
     * Get item definition from ItemRegistry
     * @private
     */
    _getItemDefinition(itemId) {
        if (!itemId) return null;

        const baseId = this._parseInstanceId(itemId);

        // Use ItemRegistry (primary)
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(baseId);
        }

        // Fallback to ItemAccessHelper
        if (typeof ItemAccessHelper !== 'undefined' && ItemAccessHelper.getItem) {
            return ItemAccessHelper.getItem(baseId);
        }

        // Fallback to GameEngine.definitions
        if (typeof GameEngine !== 'undefined' && GameEngine.definitions?.items) {
            return GameEngine.definitions.items[baseId];
        }

        return null;
    },

    /**
     * Get rarity information from item
     * Checks instanced equipment first, then item definition
     * @private
     */
    _getRarityInfo(itemId, itemDef) {
        const defaultRarity = {
            rarity: 'common',
            rarityColor: '#9e9e9e',
            hasGlow: false
        };

        if (!itemId && !itemDef) return defaultRarity;

        // Check instanced equipment for rarity
        let rarity = 'common';

        if (itemId && typeof GameEngine !== 'undefined') {
            const instancedItem = GameEngine.state?.bank?.instanced?.[itemId];
            if (instancedItem?.rarity) {
                rarity = instancedItem.rarity;
            }
        }

        // Fall back to item definition rarity
        if (rarity === 'common' && itemDef?.rarity) {
            rarity = itemDef.rarity;
        }

        // Get rarity data from definitions
        const rarityData = (typeof GameEngine !== 'undefined' && GameEngine.definitions?.RARITY_TIERS?.[rarity])
            || { color: '#9e9e9e', glow: false };

        return {
            rarity,
            rarityColor: rarityData.color || '#9e9e9e',
            hasGlow: rarityData.glow || false
        };
    },

    /**
     * Get icon HTML using IconHelper (CRITICAL - fixes raw icon bug)
     * @private
     */
    _getIconHTML(itemDef, size = 32) {
        if (!itemDef) return '';

        // ALWAYS use IconHelper - this fixes the bug in loadoutContainer.js
        if (typeof IconHelper !== 'undefined' && IconHelper.getItemIconHTML) {
            return IconHelper.getItemIconHTML(itemDef, { size, className: 'slot-item-icon' });
        }

        // Fallback: check if icon is a PNG path
        const iconPath = itemDef.iconPath || (itemDef.icon && (itemDef.icon.startsWith('assets/') || itemDef.icon.endsWith('.png')) ? itemDef.icon : null);

        if (iconPath) {
            return `<img src="${iconPath}" alt="${itemDef.name}" style="width: ${size}px; height: ${size}px; object-fit: contain;">`;
        }

        // Final fallback: emoji
        return `<span style="font-size: ${size * 0.75}px;">${itemDef.icon || '📦'}</span>`;
    },

    /**
     * Get icon size based on slot size variant
     * @private
     */
    _getIconSize(size) {
        switch (size) {
            case 'sm': return 28;
            case 'md': return 36;
            case 'lg': return 44;
            default: return 36;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadoutSlotRenderer;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.LoadoutSlotRenderer = LoadoutSlotRenderer;
}
