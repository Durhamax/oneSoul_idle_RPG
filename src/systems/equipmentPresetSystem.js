/**
 * EQUIPMENT PRESET SYSTEM
 *
 * Allows players to save up to 10 equipment presets and quickly switch between them.
 * Each preset stores a complete snapshot of all equipment slots.
 */

const EquipmentPresetSystem = {
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

        // Create a snapshot of current equipment
        const presetData = {
            name: name || `Preset ${presetIndex + 1}`,
            equipment: { ...this.state.equipment },
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

        // Validate all items in preset still exist and are available
        const validation = this.validatePreset(preset);
        if (!validation.success) {
            return validation;
        }

        // Unequip all current equipment first
        this.unequipAllItems();

        // Equip items from preset
        const equipResults = [];
        for (let slot in preset.equipment) {
            const itemId = preset.equipment[slot];
            if (itemId) {
                const result = this.equipItem(itemId);
                equipResults.push({ slot, itemId, result });

                if (!result.success) {
                    console.warn(`Failed to equip ${itemId} to ${slot}:`, result.reason);
                }
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
        const slots = [
            'weapon', 'helmet', 'back', 'gloves', 'chest', 'neck', 'boots', 'legs', 'ring',
            'ammo', 'food', 'potion',
            'tech1', 'tech2', 'tech3', 'tech4'
        ];

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
        const slots = [
            'weapon', 'helmet', 'back', 'gloves', 'chest', 'neck', 'boots', 'legs', 'ring',
            'ammo', 'food', 'potion',
            'tech1', 'tech2', 'tech3', 'tech4'
        ];

        for (let slot of slots) {
            if (eq1[slot] !== eq2[slot]) {
                return false;
            }
        }

        return true;
    }
};
