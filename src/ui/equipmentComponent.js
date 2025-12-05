/**
 * REUSABLE EQUIPMENT DISPLAY COMPONENT
 *
 * Provides a consistent equipment layout across Dashboard, Equipment Tab, and Combat View
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
     * Render horizontal layout with 4 separate containers
     */
    renderHorizontalLayout(showLabels, interactive) {
        return `
            <div class="equipment-horizontal-layout">
                <!-- Container 1: Equipment Grid -->
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>⚔️ Equipment</h3>
                        <div class="equipment-container-subtitle">Main Gear</div>
                    </div>
                    ${this.renderEquipmentGrid(showLabels, interactive)}
                </div>

                <!-- Container 2: Consumables -->
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>📦 Consumables</h3>
                        <div class="equipment-container-subtitle">Ammo • Food • Potions</div>
                    </div>
                    ${this.renderConsumableSlots(showLabels, interactive)}
                </div>

                <!-- Container 3: Technology -->
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>⚙️ Technology</h3>
                        <div class="equipment-container-subtitle">Advanced Tech Slots</div>
                    </div>
                    ${this.renderTechnologySlots(showLabels, interactive)}
                </div>

                <!-- Container 4: Equipment Summary Stats -->
                <div class="equipment-container">
                    <div class="equipment-container-header">
                        <h3>📊 Summary</h3>
                        <div class="equipment-container-subtitle">Stats Overview</div>
                    </div>
                    <div id="equipmentSummaryStats">
                        <!-- Stats will be populated by updatePlayerStats() -->
                    </div>
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

        // Left Column: Weapon, Gloves, Boots (3 slots)
        html += `<div class="loadout-column">`;
        html += this.renderSlot('weapon', slotLabels['weapon'], showLabels, interactive);
        html += this.renderSlot('gloves', slotLabels['gloves'], showLabels, interactive);
        html += this.renderSlot('boots', slotLabels['boots'], showLabels, interactive);
        html += `</div>`;

        // Middle Column: Armor Set (1 tall slot)
        html += `<div class="loadout-column loadout-column--armor">`;
        html += this.renderArmorSlot(slotLabels['armor'], showLabels, interactive);
        html += `</div>`;

        // Right Column: Back, Neck, Ring (3 slots)
        html += `<div class="loadout-column">`;
        html += this.renderSlot('back', slotLabels['back'], showLabels, interactive);
        html += this.renderSlot('neck', slotLabels['neck'], showLabels, interactive);
        html += this.renderSlot('ring', slotLabels['ring'], showLabels, interactive);
        html += `</div>`;

        html += `</div>`;
        return html;
    },

    /**
     * Render tall armor slot
     */
    renderArmorSlot(label, showLabels, interactive) {
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

        // Get rarity from the equipped INSTANCE, not base item definition
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
     * Render individual equipment slot
     * @param {string} slot - Slot name
     * @param {string} label - Display label
     * @param {boolean} showLabels - Show slot label
     * @param {boolean} interactive - Allow clicking
     * @returns {string} HTML string
     */
    renderSlot(slot, label, showLabels, interactive) {
        const equippedItemId = GameEngine.state.equipment[slot];

        // Parse instance ID to get base item ID for definition lookup
        // Handles both formats: baseId_instance_timestamp_random AND baseId_timestamp_random
        let lookupId = equippedItemId;
        if (equippedItemId) {
            if (equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            } else if (equippedItemId.includes('_')) {
                // Check if this looks like an instance ID (has timestamp pattern)
                const parts = equippedItemId.split('_');
                if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
                    // Last two parts are timestamp and random ID, rest is baseItemId
                    lookupId = parts.slice(0, -2).join('_');
                }
            }
        }

        const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;

        // Check if item definition exists (might be null if item was removed/renamed)
        const isEquipped = equippedItemId !== null && itemDef !== null;

        // Check if this is a weapon slot with a gun equipped
        const isGunEquipped = slot === 'weapon' && itemDef && itemDef.weaponType === 'gun';

        // Get rarity from the equipped INSTANCE, not base item definition
        const equippedInstance = equippedItemId ? GameEngine.state.bank.instanced?.[equippedItemId] : null;
        const rarityTier = equippedInstance?.rarity || itemDef?.rarity || 'common';
        const rarity = isEquipped ? (GameEngine.definitions.RARITY_TIERS[rarityTier] || GameEngine.definitions.RARITY_TIERS.common) : null;
        const rarityColor = rarity ? rarity.color : null;
        const rarityGlow = rarity && rarity.glow;

        // Get slot icon for empty state
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
        const slots = ['ammo', 'food', 'potion'];
        const slotLabels = {
            ammo: '🎯 Ammunition',
            food: '🍖 Food',
            potion: '🧪 Potion'
        };

        let html = `<div class="consumable-slots">`;

        for (let slot of slots) {
            const equippedValue = GameEngine.state.equipment[slot];

            // Handle consumable slots with { itemId, quantity } format
            let equippedItemId = null;
            let quantity = 0;

            if (equippedValue && typeof equippedValue === 'object') {
                // New consumable format: { itemId, quantity }
                equippedItemId = equippedValue.itemId;
                quantity = equippedValue.quantity || 0;
            } else if (equippedValue && typeof equippedValue === 'string') {
                // Standard equipment format: string ID
                equippedItemId = equippedValue;
            }

            // Parse instance ID to get base item ID for definition lookup
            let lookupId = equippedItemId;
            if (equippedItemId && typeof equippedItemId === 'string' && equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            }

            const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;

            // Check if item definition exists (might be null if item was removed/renamed)
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

            // Parse instance ID to get base item ID for definition lookup
            let lookupId = equippedItemId;
            if (equippedItemId && equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            }

            const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;

            // Check if item definition exists (might be null if item was removed/renamed)
            const isEquipped = equippedItemId !== null && itemDef !== null;

            html += `
                <div class="technology-slot ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''} ${interactive && isUnlocked ? 'clickable' : ''}"
                     ${interactive && isUnlocked ? `onclick="openEquipModal('${slot}', event)"` : ''}
                     title="${isUnlocked ? 'Technology Slot' : `Requires ${requirement} Intellect`}">
                    ${showLabels && isUnlocked ? `<div class="equipment-slot-label">${slotLabels[slot]}</div>` : ''}

                    ${!isUnlocked ? `
                        <div class="technology-slot-locked-overlay">
                            <div class="technology-lock-icon">🔒</div>
                            <div class="technology-slot-requirement">
                                ${requirement} Intellect
                            </div>
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

        // Show key stats
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
