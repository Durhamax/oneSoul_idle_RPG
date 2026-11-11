/**
 * EQUIPMENT PRESET SYSTEM
 *
 * Allows players to save up to 10 equipment presets and quickly switch between them.
 * Each preset stores a complete snapshot of all equipment slots.
 */

const EquipmentPresetSystem = {
    // The real equipment slots in the current model (3-1-3 gear + consumables + tech).
    ALL_SLOTS: [
        'weapon', 'armor', 'back', 'gloves', 'neck', 'boots', 'ring',
        'ammo', 'food', 'potion',
        'tech1', 'tech2', 'tech3', 'tech4'
    ],

    /**
     * Initialize preset system functions on the GameEngine
     */    /**
     * Get item definition from ItemRegistry (standardized access pattern)
     * @param {string} itemId - Item ID to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    _getItemDef(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },


    init(engine) {
        engine.saveEquipmentPreset = this.saveEquipmentPreset.bind(engine);
        engine.loadEquipmentPreset = this.loadEquipmentPreset.bind(engine);
        engine.deleteEquipmentPreset = this.deleteEquipmentPreset.bind(engine);
        engine.getPresetData = this.getPresetData.bind(engine);
        engine.updateActivePreset = this.updateActivePreset.bind(engine);

        console.log('✅ EquipmentPresetSystem initialized (ItemRegistry pattern)');
    },

    /**
     * Save current equipment loadout to a preset slot
     * @param {number} presetIndex - Index 0-9 for preset slot
     * @param {string} name - Optional custom name for the preset
     */
    saveEquipmentPreset(presetIndex, name = null) {
        if (presetIndex < 0 || presetIndex > 9) {
            console.error('Invalid preset index:', presetIndex);
            return { success: false, reason: 'Invalid preset slot' };
        }

        // Snapshot current equipment. Equipment/tech slots hold instance-id strings;
        // consumable slots (food/ammo/potion) hold { itemId, quantity } objects — store
        // only the itemId so that LOADING pulls the full available stack from the bank
        // (equip max quantity) rather than a frozen snapshot amount.
        const snapshot = {};
        for (const slot in this.state.equipment) {
            const val = this.state.equipment[slot];
            if (!val) { snapshot[slot] = null; continue; }
            snapshot[slot] = (typeof val === 'object' && val.itemId) ? val.itemId : val;
        }

        // Preserve the existing name when overwriting unless a new one is passed.
        const existing = this.state.equipmentPresets.presets[presetIndex];
        const presetData = {
            name: name || existing?.name || `Preset ${presetIndex + 1}`,
            equipment: snapshot,
            savedAt: Date.now()
        };

        // Save to presets array
        this.state.equipmentPresets.presets[presetIndex] = presetData;
        this.state.equipmentPresets.activePreset = presetIndex;

        console.log(`✅ Saved equipment preset ${presetIndex + 1}:`, presetData);

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.updateAllViews) {
            UICore.updateAllViews();
        }

        return { success: true, preset: presetData };
    },

    /**
     * Load equipment from a preset slot
     * @param {number} presetIndex - Index 0-9 for preset slot
     */
    loadEquipmentPreset(presetIndex) {
        if (presetIndex < 0 || presetIndex > 9) {
            console.error('Invalid preset index:', presetIndex);
            return { success: false, reason: 'Invalid preset slot' };
        }

        const preset = this.state.equipmentPresets.presets[presetIndex];

        if (!preset) {
            return { success: false, reason: 'No preset saved in this slot' };
        }

        // Unequip all current equipment first (returns gear + consumable stacks to the bank
        // so the preset's items can be equipped — and so consumable stacks merge, letting
        // the preset re-equip the FULL available quantity).
        this.unequipAllItems();

        // Equip items from preset. equipItem() resolves the item from any bank store and,
        // for consumables, transfers the whole stack (max quantity). Items that are no
        // longer available are skipped rather than aborting the whole load.
        const equipResults = [];
        for (let slot in preset.equipment) {
            const val = preset.equipment[slot];
            if (!val) continue;
            const itemId = (typeof val === 'object' && val.itemId) ? val.itemId : val;
            if (!itemId) continue;

            const result = this.equipItem(itemId);
            equipResults.push({ slot, itemId, result });

            if (!result.success) {
                console.warn(`Preset: could not equip ${itemId} to ${slot}:`, result.reason);
            }
        }

        // Set active preset
        this.state.equipmentPresets.activePreset = presetIndex;

        console.log(`✅ Loaded equipment preset ${presetIndex + 1}`);

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.updateAllViews) {
            UICore.updateAllViews();
        }

        return {
            success: true,
            preset,
            equipResults,
            failedItems: equipResults.filter(r => !r.result.success)
        };
    },

    /**
     * Validate that all items in a preset are available
     */
    validatePreset(preset) {
        const missingItems = [];
        const unavailableItems = [];

        for (let slot in preset.equipment) {
            const itemId = preset.equipment[slot];
            if (itemId) {
                const itemDef = EquipmentPresetSystem._getItemDef.call(this, itemId);
                const bankItem = this.state.bank.items[itemId];

                if (!itemDef) {
                    missingItems.push(itemId);
                } else if (!bankItem || bankItem.quantity < 1) {
                    unavailableItems.push(itemId);
                }
            }
        }

        if (missingItems.length > 0) {
            return {
                success: false,
                reason: `Items no longer exist: ${missingItems.join(', ')}`
            };
        }

        if (unavailableItems.length > 0) {
            return {
                success: false,
                reason: `Items not in bank: ${unavailableItems.join(', ')}`
            };
        }

        return { success: true };
    },

    /**
     * Unequip all items (helper for preset loading)
     */
    unequipAllItems() {
        const slots = EquipmentPresetSystem.ALL_SLOTS;

        for (let slot of slots) {
            if (this.state.equipment[slot]) {
                this.unequipItem(slot);
            }
        }
    },

    /**
     * Delete a preset
     */
    deleteEquipmentPreset(presetIndex) {
        if (presetIndex < 0 || presetIndex > 9) {
            return { success: false, reason: 'Invalid preset slot' };
        }

        this.state.equipmentPresets.presets[presetIndex] = null;

        // If this was the active preset, clear active preset
        if (this.state.equipmentPresets.activePreset === presetIndex) {
            this.state.equipmentPresets.activePreset = null;
        }

        console.log(`🗑️ Deleted equipment preset ${presetIndex + 1}`);

        // Trigger UI update
        if (typeof UICore !== 'undefined' && UICore.updateAllViews) {
            UICore.updateAllViews();
        }

        return { success: true };
    },

    /**
     * Get preset data for display
     */
    getPresetData(presetIndex) {
        if (presetIndex < 0 || presetIndex > 9) {
            return null;
        }

        return this.state.equipmentPresets.presets[presetIndex];
    },

    /**
     * Update active preset tracking (called when manually changing equipment)
     */
    updateActivePreset() {
        // Check if current equipment matches any saved preset
        const currentEquipment = this.state.equipment;
        const presets = this.state.equipmentPresets.presets;

        for (let i = 0; i < presets.length; i++) {
            const preset = presets[i];
            if (!preset) continue;

            // Deep compare equipment
            if (this.equipmentMatches(currentEquipment, preset.equipment)) {
                this.state.equipmentPresets.activePreset = i;
                return i;
            }
        }

        // No match found - custom loadout
        this.state.equipmentPresets.activePreset = null;
        return null;
    },

    /**
     * Check if two equipment sets match
     */
    equipmentMatches(eq1, eq2) {
        const norm = (v) => (v && typeof v === 'object' && v.itemId) ? v.itemId : (v || null);

        for (let slot of EquipmentPresetSystem.ALL_SLOTS) {
            if (norm(eq1[slot]) !== norm(eq2[slot])) {
                return false;
            }
        }

        return true;
    }
};
