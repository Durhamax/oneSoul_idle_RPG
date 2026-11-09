/**
 * REUSABLE EQUIPMENT DISPLAY COMPONENT
 *
 * Provides a consistent equipment layout across Dashboard, Equipment Tab, and Combat View
 * Now uses LoadoutSlotRenderer for unified slot rendering.
 *
 * Features:
 * - Golden ratio 3x3 equipment grid
 * - Consumable slots (ammo, food, potion)
 * - Technology slots with intellect unlocking
 * - Locked/unlocked states for tech slots
 */

const EquipmentComponent = {
    /**
     * Render complete equipment display
     * @param {object} options - Configuration options
     * @param {string} options.mode - 'full', 'compact', 'minimal', or 'horizontal'
     * @param {boolean} options.showLabels - Show slot labels
     * @param {boolean} options.interactive - Allow clicking to equip/unequip
     * @returns {string} HTML string
     */
    render(options = {}) {
        const {
            mode = 'full',
            showLabels = true,
            interactive = true
        } = options;

        // Horizontal mode: 3 containers side-by-side
        if (mode === 'horizontal') {
            return this.renderHorizontalLayout(showLabels, interactive);
        }

        // Standard vertical layouts
        let html = `<div class="equipment-component equipment-mode-${mode}">`;

        // 3x3 Equipment Grid
        html += this.renderEquipmentGrid(showLabels, interactive);

        // Consumable Slots (only in full and compact modes)
        if (mode !== 'minimal') {
            html += this.renderConsumableSlots(showLabels, interactive);
        }

        // Technology Slots (only in full mode)
        if (mode === 'full') {
            html += this.renderTechnologySlots(showLabels, interactive);
        }

        html += `</div>`;

        return html;
    },

    /**
     * Render horizontal layout with 3 separate containers
     * Stats summary removed to allow containers to expand for visual consistency
     */
    renderHorizontalLayout(showLabels, interactive) {
        const equipment = GameEngine.state.equipment || {};
        const intellect = GameEngine.state.combatAttributes?.intellect || 0;

        // Use LoadoutSlotRenderer if available
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        if (renderer) {
            return `
                <div class="equipment-horizontal-layout">
                    <!-- Container 1: Equipment Grid -->
                    <div class="equipment-container">
                        <div class="equipment-container-header">
                            <h3>⚔️ Equipment</h3>
                            <div class="equipment-container-subtitle">Main Gear</div>
                        </div>
                        <div class="unified-slots--expanded">
                            ${renderer.renderEquipmentGrid({
                                equipment,
                                size: 'lg',
                                showLabels,
                                showNames: true,
                                interactive,
                                onSlotClick: (slot) => `openEquipModal('${slot}', event)`
                            })}
                        </div>
                    </div>

                    <!-- Container 2: Consumables -->
                    <div class="equipment-container">
                        <div class="equipment-container-header">
                            <h3>📦 Consumables</h3>
                            <div class="equipment-container-subtitle">Ammo • Food • Potions</div>
                        </div>
                        <div class="unified-slots--expanded consumables-vertical-layout">
                            ${renderer.renderConsumableSlot({
                                slotName: 'ammo',
                                itemData: equipment.ammo,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('ammo', event)`
                            })}
                            ${renderer.renderConsumableSlot({
                                slotName: 'food',
                                itemData: equipment.food,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('food', event)`
                            })}
                            ${renderer.renderConsumableSlot({
                                slotName: 'potion',
                                itemData: equipment.potion,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('potion', event)`
                            })}
                        </div>
                    </div>

                    <!-- Container 3: Technology -->
                    <div class="equipment-container">
                        <div class="equipment-container-header">
                            <h3>⚙️ Technology</h3>
                            <div class="equipment-container-subtitle">Advanced Tech Slots</div>
                        </div>
                        <div class="unified-slots--expanded tech-vertical-layout">
                            ${renderer.renderTechSlot({
                                slotName: 'tech1',
                                itemData: equipment.tech1,
                                requiredIntellect: 0,
                                currentIntellect: intellect,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('tech1', event)`
                            })}
                            ${renderer.renderTechSlot({
                                slotName: 'tech2',
                                itemData: equipment.tech2,
                                requiredIntellect: 3,
                                currentIntellect: intellect,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('tech2', event)`
                            })}
                            ${renderer.renderTechSlot({
                                slotName: 'tech3',
                                itemData: equipment.tech3,
                                requiredIntellect: 6,
                                currentIntellect: intellect,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('tech3', event)`
                            })}
                            ${renderer.renderTechSlot({
                                slotName: 'tech4',
                                itemData: equipment.tech4,
                                requiredIntellect: 9,
                                currentIntellect: intellect,
                                size: 'lg',
                                showLabel: showLabels,
                                interactive,
                                onClick: `openEquipModal('tech4', event)`
                            })}
                        </div>
                    </div>
                </div>
            `;
        }

        // Fallback to legacy rendering
        return this._renderHorizontalLayoutLegacy(showLabels, interactive);
    },

    /**
     * Legacy horizontal layout (fallback)
     * @private
     */
    _renderHorizontalLayoutLegacy(showLabels, interactive) {
        return `
            <div class="equipment-horizontal-layout">
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>⚔️ Equipment</h3>
                        <div class="equipment-container-subtitle">Main Gear</div>
                    </div>
                    ${this.renderEquipmentGrid(showLabels, interactive)}
                </div>
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>📦 Consumables</h3>
                        <div class="equipment-container-subtitle">Ammo • Food • Potions</div>
                    </div>
                    ${this.renderConsumableSlots(showLabels, interactive)}
                </div>
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>⚙️ Technology</h3>
                        <div class="equipment-container-subtitle">Advanced Tech Slots</div>
                    </div>
                    ${this.renderTechnologySlots(showLabels, interactive)}
                </div>
            </div>
        `;
    },

    /**
     * Render 3-1-3 equipment grid (standardized format)
     * Layout:
     *   Left Column:   Weapon, Gloves, Boots (3 slots)
     *   Middle Column: Armor Set (1 tall slot)
     *   Right Column:  Back, Neck, Ring (3 slots)
     */
    renderEquipmentGrid(showLabels, interactive) {
        const equipment = GameEngine.state.equipment || {};
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        if (renderer) {
            return `
                <div class="equipment-grid equipment-main-grid unified-slots--expanded">
                    ${renderer.renderEquipmentGrid({
                        equipment,
                        size: 'lg',
                        showLabels,
                        showNames: true,
                        interactive,
                        onSlotClick: (slot) => `openEquipModal('${slot}', event)`
                    })}
                </div>
            `;
        }

        // Fallback to legacy rendering
        const slotLabels = {
            back: '🎒 Back',
            weapon: '⚔️ Weapon',
            gloves: '🧤 Gloves',
            boots: '👢 Boots',
            neck: '📿 Neck',
            ring: '💍 Ring',
            armor: '🛡️ Armor Set'
        };

        let html = `<div class="equipment-grid equipment-main-grid">`;

        html += `<div class="loadout-column">`;
        html += this.renderSlotLegacy('weapon', slotLabels['weapon'], showLabels, interactive);
        html += this.renderSlotLegacy('gloves', slotLabels['gloves'], showLabels, interactive);
        html += this.renderSlotLegacy('boots', slotLabels['boots'], showLabels, interactive);
        html += `</div>`;

        html += `<div class="loadout-column loadout-column--armor">`;
        html += this.renderArmorSlotLegacy(slotLabels['armor'], showLabels, interactive);
        html += `</div>`;

        html += `<div class="loadout-column">`;
        html += this.renderSlotLegacy('back', slotLabels['back'], showLabels, interactive);
        html += this.renderSlotLegacy('neck', slotLabels['neck'], showLabels, interactive);
        html += this.renderSlotLegacy('ring', slotLabels['ring'], showLabels, interactive);
        html += `</div>`;

        html += `</div>`;
        return html;
    },

    /**
     * Legacy armor slot rendering
     * @private
     */
    renderArmorSlotLegacy(label, showLabels, interactive) {
        const equippedItemId = GameEngine.state.equipment.armor;

        let lookupId = equippedItemId;
        if (equippedItemId) {
            if (equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            } else if (equippedItemId.includes('_')) {
                const parts = equippedItemId.split('_');
                if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
                    lookupId = parts.slice(0, -2).join('_');
                }
            }
        }

        const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;
        const isEquipped = equippedItemId !== null && itemDef !== null;

        const equippedInstance = equippedItemId ? GameEngine.state.bank.instanced?.[equippedItemId] : null;
        const rarityTier = equippedInstance?.rarity || itemDef?.rarity || 'common';
        const rarity = isEquipped ? (GameEngine.definitions.RARITY_TIERS[rarityTier] || GameEngine.definitions.RARITY_TIERS.common) : null;
        const rarityColor = rarity ? rarity.color : null;
        const rarityGlow = rarity && rarity.glow;

        return `
            <div class="equipment-slot equipment-slot--armor ${isEquipped ? 'equipped' : ''} ${interactive ? 'clickable' : ''}"
                 style="${rarityColor ? `border-color: ${rarityColor};` : ''} ${rarityGlow ? `box-shadow: 0 0 8px ${rarityColor};` : ''}"
                 ${interactive ? `onclick="openEquipModal('armor', event)"` : ''}>
                ${showLabels ? `<div class="equipment-slot-label">${label}</div>` : ''}
                ${isEquipped ? `
                    <div class="equipment-slot-icon">${IconHelper.getItemIconHTML(itemDef, {size: 64, className: 'equipment-icon'})}</div>
                    <div class="equipment-slot-item" style="${rarityColor ? `color: ${rarityColor};` : ''}">${itemDef.name}</div>
                    ${this.renderItemStats(itemDef)}
                ` : `
                    <div class="equipment-slot-empty">🛡️</div>
                    <div class="equipment-slot-label-empty">Armor Set</div>
                `}
            </div>
        `;
    },

    /**
     * Legacy slot rendering
     * @private
     */
    renderSlotLegacy(slot, label, showLabels, interactive) {
        const equippedItemId = GameEngine.state.equipment[slot];

        let lookupId = equippedItemId;
        if (equippedItemId) {
            if (equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            } else if (equippedItemId.includes('_')) {
                const parts = equippedItemId.split('_');
                if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
                    lookupId = parts.slice(0, -2).join('_');
                }
            }
        }

        const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;
        const isEquipped = equippedItemId !== null && itemDef !== null;
        const isGunEquipped = slot === 'weapon' && itemDef && itemDef.weaponType === 'gun';

        const equippedInstance = equippedItemId ? GameEngine.state.bank.instanced?.[equippedItemId] : null;
        const rarityTier = equippedInstance?.rarity || itemDef?.rarity || 'common';
        const rarity = isEquipped ? (GameEngine.definitions.RARITY_TIERS[rarityTier] || GameEngine.definitions.RARITY_TIERS.common) : null;
        const rarityColor = rarity ? rarity.color : null;
        const rarityGlow = rarity && rarity.glow;

        const slotIcons = {
            helmet: '🪖', chest: '👕', back: '🎒', weapon: '⚔️',
            gloves: '🧤', boots: '👢', legs: '👖', neck: '📿', ring: '💍'
        };
        const emptyIcon = slotIcons[slot] || '📦';

        return `
            <div class="equipment-slot ${isEquipped ? 'equipped' : ''} ${interactive ? 'clickable' : ''}"
                 style="${rarityColor ? `border-color: ${rarityColor};` : ''} ${rarityGlow ? `box-shadow: 0 0 8px ${rarityColor};` : ''}"
                 ${interactive ? `onclick="openEquipModal('${slot}', event)"` : ''}>
                ${showLabels ? `<div class="equipment-slot-label">${label}</div>` : ''}
                ${isEquipped ? `
                    <div class="equipment-slot-icon">${IconHelper.getItemIconHTML(itemDef, {size: 48, className: 'equipment-icon'})}</div>
                    <div class="equipment-slot-item" style="${rarityColor ? `color: ${rarityColor};` : ''}">${itemDef.name}</div>
                    ${this.renderItemStats(itemDef)}
                    ${isGunEquipped ? `
                        <button class="btn-sm weapon-customize-btn" onclick="event.stopPropagation(); openWeaponBuildModal();" style="margin-top: 8px;">
                            ⚙️ Customize
                        </button>
                    ` : ''}
                ` : `
                    <div class="equipment-slot-empty">${emptyIcon}</div>
                `}
            </div>
        `;
    },

    /**
     * Render consumable slots
     */
    renderConsumableSlots(showLabels, interactive) {
        const equipment = GameEngine.state.equipment || {};
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        if (renderer) {
            return `
                <div class="consumable-slots unified-slots--expanded">
                    ${renderer.renderConsumableSlot({
                        slotName: 'ammo',
                        itemData: equipment.ammo,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('ammo', event)`
                    })}
                    ${renderer.renderConsumableSlot({
                        slotName: 'food',
                        itemData: equipment.food,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('food', event)`
                    })}
                    ${renderer.renderConsumableSlot({
                        slotName: 'potion',
                        itemData: equipment.potion,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('potion', event)`
                    })}
                </div>
            `;
        }

        // Fallback to legacy rendering
        return this._renderConsumableSlotsLegacy(showLabels, interactive);
    },

    /**
     * Legacy consumable slots rendering
     * @private
     */
    _renderConsumableSlotsLegacy(showLabels, interactive) {
        const slots = ['ammo', 'food', 'potion'];
        const slotLabels = {
            ammo: '🎯 Ammunition',
            food: '🍖 Food',
            potion: '🧪 Potion'
        };

        let html = `<div class="consumable-slots">`;

        for (let slot of slots) {
            const equippedValue = GameEngine.state.equipment[slot];
            let equippedItemId = null;
            let quantity = 0;

            if (equippedValue && typeof equippedValue === 'object') {
                equippedItemId = equippedValue.itemId;
                quantity = equippedValue.quantity || 0;
            } else if (equippedValue && typeof equippedValue === 'string') {
                equippedItemId = equippedValue;
            }

            let lookupId = equippedItemId;
            if (equippedItemId && typeof equippedItemId === 'string' && equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            }

            const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;
            const isEquipped = equippedItemId !== null && itemDef !== null;

            html += `
                <div class="consumable-slot ${isEquipped ? 'equipped' : ''} ${interactive ? 'clickable' : ''}"
                     ${interactive ? `onclick="openEquipModal('${slot}', event)"` : ''}>
                    ${showLabels ? `<div class="equipment-slot-label">${slotLabels[slot]}</div>` : ''}
                    ${isEquipped ? `
                        <div class="consumable-quantity">${quantity}x</div>
                        <div class="equipment-slot-icon">${IconHelper.getItemIconHTML(itemDef, {size: 32, className: 'consumable-icon'})}</div>
                        <div class="equipment-slot-item">${itemDef.name}</div>
                    ` : `
                        <div class="equipment-slot-empty">📦</div>
                    `}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    /**
     * Render technology slots with intellect gating
     */
    renderTechnologySlots(showLabels, interactive) {
        const equipment = GameEngine.state.equipment || {};
        const intellect = GameEngine.state.combatAttributes?.intellect || 0;
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        if (renderer) {
            return `
                <div class="technology-slots unified-slots--expanded">
                    ${renderer.renderTechSlot({
                        slotName: 'tech1',
                        itemData: equipment.tech1,
                        requiredIntellect: 0,
                        currentIntellect: intellect,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('tech1', event)`
                    })}
                    ${renderer.renderTechSlot({
                        slotName: 'tech2',
                        itemData: equipment.tech2,
                        requiredIntellect: 3,
                        currentIntellect: intellect,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('tech2', event)`
                    })}
                    ${renderer.renderTechSlot({
                        slotName: 'tech3',
                        itemData: equipment.tech3,
                        requiredIntellect: 6,
                        currentIntellect: intellect,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('tech3', event)`
                    })}
                    ${renderer.renderTechSlot({
                        slotName: 'tech4',
                        itemData: equipment.tech4,
                        requiredIntellect: 9,
                        currentIntellect: intellect,
                        size: 'lg',
                        showLabel: showLabels,
                        interactive,
                        onClick: `openEquipModal('tech4', event)`
                    })}
                </div>
            `;
        }

        // Fallback to legacy rendering
        return this._renderTechnologySlotsLegacy(showLabels, interactive);
    },

    /**
     * Legacy technology slots rendering
     * @private
     */
    _renderTechnologySlotsLegacy(showLabels, interactive) {
        const slots = ['tech1', 'tech2', 'tech3', 'tech4'];
        const slotLabels = {
            tech1: '⚙️ Tech Slot 1',
            tech2: '⚙️ Tech Slot 2',
            tech3: '⚙️ Tech Slot 3',
            tech4: '⚙️ Tech Slot 4'
        };

        let html = `<div class="technology-slots">`;

        for (let slot of slots) {
            const isUnlocked = GameEngine.isTechSlotUnlocked(slot);
            const requirement = GameEngine.getTechSlotRequirement(slot);
            const equippedItemId = GameEngine.state.equipment[slot];

            let lookupId = equippedItemId;
            if (equippedItemId && equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            }

            const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;
            const isEquipped = equippedItemId !== null && itemDef !== null;

            html += `
                <div class="technology-slot ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''} ${interactive && isUnlocked ? 'clickable' : ''}"
                     ${interactive && isUnlocked ? `onclick="openEquipModal('${slot}', event)"` : ''}
                     title="${isUnlocked ? 'Technology Slot' : `Requires ${requirement} Intellect`}">
                    ${showLabels && isUnlocked ? `<div class="equipment-slot-label">${slotLabels[slot]}</div>` : ''}
                    ${!isUnlocked ? `
                        <div class="technology-slot-locked-overlay">
                            <div class="technology-lock-icon">🔒</div>
                            <div class="technology-slot-requirement">${requirement} Intellect</div>
                        </div>
                    ` : isEquipped ? `
                        <div class="equipment-slot-icon">${IconHelper.getItemIconHTML(itemDef, {size: 40, className: 'tech-icon'})}</div>
                        <div class="equipment-slot-item">${itemDef.name}</div>
                        ${this.renderItemStats(itemDef)}
                    ` : `
                        <div class="equipment-slot-empty">⚙️</div>
                    `}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    /**
     * Render compact item stats
     */
    renderItemStats(itemDef) {
        if (!itemDef || !itemDef.stats) return '';

        const stats = itemDef.stats;
        let statLines = [];

        if (stats.attackDamage) statLines.push(`⚔️ ${stats.attackDamage}`);
        if (stats.damageReduction) statLines.push(`🛡️ ${stats.damageReduction}%`);
        if (stats.maxHealth) statLines.push(`❤️ ${stats.maxHealth}`);

        if (statLines.length === 0) return '';

        return `
            <div style="font-size: 0.7em; color: #888; margin-top: 4px;">
                ${statLines.join(' · ')}
            </div>
        `;
    }
};
