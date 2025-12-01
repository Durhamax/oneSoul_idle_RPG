/**
 * ATTACHMENT MODAL
 *
 * UI for modifying weapon attachments.
 * Shows attachment slots based on weapon rarity and allows adding/removing attachments.
 */

const AttachmentModal = {
    currentWeaponId: null,
    tempAttachments: {},

    /**
     * Open the attachment modal for a weapon
     */
    open(weaponId) {
        // DUAL-BANK: Check all storage locations (instanced, stackable, legacy)
        const instancedWeapon = GameEngine.state.bank.instanced?.[weaponId];
        const legacyWeapon = GameEngine.state.bank.items?.[weaponId];
        const weaponData = instancedWeapon || legacyWeapon;

        if (!weaponData) {
            console.error('Weapon not found:', weaponId);
            return;
        }

        const baseItemId = weaponData.baseItemId || weaponId;

        // Try ItemRegistry first, fallback to definitions
        const baseItem = (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem)
            ? ItemRegistry.getItem(baseItemId) || ItemAccessHelper.getItem(baseItemId)
            : ItemAccessHelper.getItem(baseItemId);

        if (!baseItem || baseItem.equipSlot !== 'weapon') {
            console.error('Not a weapon:', weaponId, 'Base item:', baseItem);
            return;
        }

        // Create instance if needed
        if (!weaponData.instanceId) {
            const sourceQuantity = weaponData.quantity || 1;

            if (sourceQuantity > 1) {
                // Split stack - reduce quantity and create new instance
                weaponData.quantity--;
                const instance = GameEngine.createWeaponInstance(baseItemId);
                if (!instance) {
                    console.error('Failed to create weapon instance');
                    return;
                }
                GameEngine.state.bank.items[instance.instanceId] = instance;
                this.currentWeaponId = instance.instanceId;
            } else {
                // Convert single item to instance
                const instanceId = `${baseItemId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                // Remove old entry
                const oldData = {...weaponData};
                delete GameEngine.state.bank.items[weaponId];

                // Create new instance entry
                const instance = GameEngine.createWeaponInstance(baseItemId);
                if (!instance) {
                    console.error('Failed to create weapon instance');
                    return;
                }
                instance.instanceId = instanceId;
                GameEngine.state.bank.items[instanceId] = instance;
                this.currentWeaponId = instanceId;

                // Refresh UI to show the new instance in bank
                if (typeof UICore !== 'undefined') {
                    UICore.update();
                }
            }
        } else {
            this.currentWeaponId = weaponData.instanceId || weaponId;
        }

        // DUAL-BANK: Get weapon from appropriate storage
        const instancedWeapon2 = GameEngine.state.bank.instanced?.[this.currentWeaponId];
        const legacyWeapon2 = GameEngine.state.bank.items?.[this.currentWeaponId];
        const weapon = instancedWeapon2 || legacyWeapon2;

        this.tempAttachments = {...(weapon.attachments || {})};
        this.render();
        document.getElementById('attachmentModal').style.display = 'block';
    },

    /**
     * Render the attachment modal
     */
    render() {
        // DUAL-BANK: Check all storage locations
        const instancedWeapon = GameEngine.state.bank.instanced?.[this.currentWeaponId];
        const legacyWeapon = GameEngine.state.bank.items?.[this.currentWeaponId];
        const weapon = instancedWeapon || legacyWeapon;

        if (!weapon) {
            console.error('[AttachmentModal] Weapon not found:', this.currentWeaponId);
            this.close();
            return;
        }

        const baseItemId = weapon.baseItemId || weapon.itemId;
        const baseItem = ItemAccessHelper.getItem(baseItemId);

        if (!baseItem) {
            console.error('[AttachmentModal] Base item not found:', baseItemId);
            console.error('[AttachmentModal] Weapon object:', weapon);
            this.close();
            return;
        }

        // Get rarity directly from item (it's already the rarity key like 'rare', 'epic', etc.)
        const rarityName = baseItem.rarity || 'common';
        const maxSlots = AttachmentSystem.ATTACHMENT_SLOTS_BY_RARITY[rarityName];

        let html = `
            <div class="modal-content attachment-modal-content">
                <div class="modal-header">
                    <div class="attachment-modal-title">
                        <h2>${baseItem.icon || '⚔️'} ${baseItem.name} - Attachments</h2>
                        <span class="rarity-badge rarity-${rarityName}">${rarityName.toUpperCase()}</span>
                    </div>
                    <button class="modal-close" onclick="AttachmentModal.close()">&times;</button>
                </div>

                <div class="attachment-layout">
                    <!-- Left: Weapon Preview -->
                    <div class="weapon-preview-section">
                        <div class="weapon-icon-large">${baseItem.icon || '⚔️'}</div>
                        <div class="weapon-name">${weapon.customName || baseItem.name}</div>

                        <div class="weapon-base-stats">
                            <h4>Base Stats</h4>
                            ${this.renderBaseStats(baseItem)}
                        </div>

                        <div class="weapon-modified-stats">
                            <h4>Modified Stats</h4>
                            ${this.renderModifiedStats(weapon, baseItem)}
                        </div>
                    </div>

                    <!-- Right: Attachment Slots -->
                    <div class="attachment-slots-section">
                        <h3>Attachment Slots (${Object.values(this.tempAttachments).filter(a => a).length}/${maxSlots})</h3>
                        <div class="attachment-grid">
                            ${this.renderAttachmentSlots(maxSlots)}
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="AttachmentModal.save()">💾 Save Changes</button>
                    <button class="btn btn-danger" onclick="AttachmentModal.stripAll()">🗑️ Strip All</button>
                    <button class="btn btn-secondary" onclick="AttachmentModal.close()">❌ Cancel</button>
                </div>

                <!-- Attachment Selector Overlay -->
                <div id="attachmentSelectorOverlay" class="attachment-selector-overlay" style="display: none;"></div>
            </div>
        `;

        document.getElementById('attachmentModal').innerHTML = html;
    },

    /**
     * Render base weapon stats
     */
    renderBaseStats(baseItem) {
        const stats = baseItem.stats || {};
        return `
            <div class="stat-line">⚔️ Damage: ${stats.attackDamage || 0}</div>
            <div class="stat-line">⚡ Speed: ${stats.attackSpeed || 1.0}</div>
            <div class="stat-line">🎯 Accuracy: ${stats.accuracy || 75}%</div>
        `;
    },

    /**
     * Render modified stats with attachment bonuses
     */
    renderModifiedStats(weapon, baseItem) {
        const modifiedStats = AttachmentSystem.calculateModifiedStats.call(GameEngine, baseItem, this.tempAttachments);
        const baseStats = baseItem.stats || {};

        const getDiff = (modified, base) => {
            const diff = modified - base;
            if (diff > 0) return `<span class="stat-bonus">+${diff}</span>`;
            return '';
        };

        return `
            <div class="stat-line">⚔️ Damage: ${modifiedStats.attackDamage} ${getDiff(modifiedStats.attackDamage, baseStats.attackDamage || 0)}</div>
            <div class="stat-line">⚡ Speed: ${modifiedStats.attackSpeed} ${getDiff(modifiedStats.attackSpeed, baseStats.attackSpeed || 1.0)}</div>
            <div class="stat-line">🎯 Accuracy: ${modifiedStats.accuracy}% ${getDiff(modifiedStats.accuracy, baseStats.accuracy || 75)}</div>
            <div class="stat-line">💥 Crit Chance: ${modifiedStats.criticalChance}% ${getDiff(modifiedStats.criticalChance, baseStats.criticalChance || 5)}</div>
            <div class="stat-line">🌟 Crit Damage: ${modifiedStats.criticalDamage}% ${getDiff(modifiedStats.criticalDamage, baseStats.criticalDamage || 150)}</div>
        `;
    },

    /**
     * Render attachment slots
     */
    renderAttachmentSlots(maxSlots) {
        const slotTypes = Object.keys(AttachmentSystem.ATTACHMENT_TYPES);
        let html = '';

        for (let i = 0; i < maxSlots && i < slotTypes.length; i++) {
            const slotType = slotTypes[i];
            const currentAttachment = this.tempAttachments[slotType];

            // Parse instance ID to get base item ID
            let baseItemId = currentAttachment;
            if (currentAttachment && currentAttachment.includes('_instance_')) {
                baseItemId = currentAttachment.split('_instance_')[0];
            }

            const attachmentItem = baseItemId ? ItemAccessHelper.getItem(baseItemId) : null;
            const rarity = attachmentItem ? GameEngine.getItemRarity(baseItemId) : null;

            html += `
                <div class="attachment-slot ${currentAttachment ? 'filled' : 'empty'}"
                     onclick="AttachmentModal.openSlotSelector('${slotType}')">
                    <div class="slot-label">${slotType.charAt(0).toUpperCase() + slotType.slice(1)}</div>
                    <div class="slot-content">
                        ${attachmentItem ?
                          `<div class="attachment-item rarity-${rarity ? rarity.id : 'common'}">
                             <span class="attachment-icon">${attachmentItem.icon || '📦'}</span>
                             <span class="attachment-name">${attachmentItem.name}</span>
                           </div>` :
                          '<div class="empty-slot-icon">+</div>'}
                    </div>
                    ${currentAttachment ?
                      `<button class="remove-attachment-btn"
                               onclick="event.stopPropagation(); AttachmentModal.removeAttachment('${slotType}')">×</button>` : ''}
                </div>
            `;
        }

        if (maxSlots === 0) {
            html = '<div class="no-slots-message">This weapon has no attachment slots (Common rarity)</div>';
        }

        return html;
    },

    /**
     * Open selector overlay for a specific slot
     */
    openSlotSelector(slotType) {
        // DUAL-BANK: Get attachments from all storage systems
        const instancedItems = GameEngine.state.bank.instanced || {};
        const stackableItems = GameEngine.state.bank.stackable || {};
        const legacyItems = GameEngine.state.bank.items || {};
        const allBankItems = {...instancedItems, ...stackableItems, ...legacyItems};

        // Get attachments from bank that match this slot type
        const availableAttachments = Object.entries(allBankItems)
            .filter(([id, item]) => {
                // Get the base item ID for lookups
                const itemId = item.baseItemId || item.itemId || id;
                const def = ItemAccessHelper.getItem(itemId);

                // Check if this is a compatible attachment
                return def &&
                       def.itemType === 'attachment' &&
                       (def.modType === slotType || def.attachmentSlot === slotType) &&
                       !Object.values(this.tempAttachments).includes(id);
                       // Note: Removed instanceId filter - attachments can be instanced items
            })
            .map(([id, item]) => ({
                id: id, // Use the actual bank ID (could be instance ID)
                item: item,
                definition: ItemAccessHelper.getItem(item.baseItemId || item.itemId || id)
            }));

        let html = `
            <div class="attachment-selector-content">
                <h3>Select ${slotType.charAt(0).toUpperCase() + slotType.slice(1)} Attachment</h3>
                <div class="attachment-list">
        `;

        if (availableAttachments.length === 0) {
            html += '<div class="no-attachments">No compatible attachments in bank</div>';
        } else {
            availableAttachments.forEach(({id, item, definition}) => {
                const rarityName = definition.rarity || 'common';
                const bonusStat = definition.bonusStat || 'unknown';
                const bonusValue = definition.bonusValue || 0;

                html += `
                    <div class="attachment-option rarity-${rarityName}"
                         onclick="AttachmentModal.selectAttachment('${slotType}', '${id}')">
                        <span class="attachment-icon">${definition.icon || '📦'}</span>
                        <span class="attachment-name">${definition.name}</span>
                        <span class="attachment-bonus">+${(bonusValue * 100).toFixed(0)}% ${bonusStat}</span>
                        <span class="quantity">×${item.quantity}</span>
                    </div>
                `;
            });
        }

        html += `
                </div>
                <button class="btn btn-secondary" onclick="AttachmentModal.closeSelectorOverlay()">Cancel</button>
            </div>
        `;

        const overlay = document.getElementById('attachmentSelectorOverlay');
        overlay.innerHTML = html;
        overlay.style.display = 'flex';
    },

    /**
     * Select an attachment for a slot
     */
    selectAttachment(slotType, attachmentId) {
        this.tempAttachments[slotType] = attachmentId;
        this.closeSelectorOverlay();
        this.render();
    },

    /**
     * Remove an attachment from a slot
     */
    removeAttachment(slotType) {
        this.tempAttachments[slotType] = null;
        this.render();
    },

    /**
     * Close selector overlay
     */
    closeSelectorOverlay() {
        const overlay = document.getElementById('attachmentSelectorOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },

    /**
     * Save changes and apply to weapon
     */
    save() {
        // DUAL-BANK: Check all storage locations
        const instancedWeapon = GameEngine.state.bank.instanced?.[this.currentWeaponId];
        const legacyWeapon = GameEngine.state.bank.items?.[this.currentWeaponId];
        const weapon = instancedWeapon || legacyWeapon;

        if (!weapon) {
            this.close();
            return;
        }

        // Apply changes
        Object.keys(this.tempAttachments).forEach(slotType => {
            const oldAttachment = weapon.attachments[slotType];
            const newAttachment = this.tempAttachments[slotType];

            if (oldAttachment !== newAttachment) {
                const result = GameEngine.modifyWeaponAttachments(this.currentWeaponId, slotType, newAttachment);
                if (!result.success) {
                    console.error('Failed to modify attachment:', result.reason);
                }
            }
        });

        // Refresh UI
        if (typeof EquipmentUI !== 'undefined') {
            EquipmentUI.updateBank();
        }
        if (typeof UICore !== 'undefined') {
            UICore.update();
        }

        this.close();
    },

    /**
     * Strip all attachments from weapon
     */
    stripAll() {
        if (confirm('Remove all attachments from this weapon? They will be returned to your bank.')) {
            const result = GameEngine.stripAttachments(this.currentWeaponId);
            if (result.success) {
                console.log(`Stripped ${result.returnedCount} attachments`);
            }

            this.close();

            // Refresh UI
            if (typeof EquipmentUI !== 'undefined') {
                EquipmentUI.updateBank();
            }
            if (typeof UICore !== 'undefined') {
                UICore.update();
            }
        }
    },

    /**
     * Close the modal
     */
    close() {
        document.getElementById('attachmentModal').style.display = 'none';
        this.currentWeaponId = null;
        this.tempAttachments = {};
    }
};
