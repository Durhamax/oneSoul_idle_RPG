/**
 * EQUIPMENT PRESETS UI
 *
 * Renders preset tiles for saving and loading equipment builds.
 */

const EquipmentPresetsUI = {
    /**
     * Render preset tiles grid (10 presets)
     */
    render() {
        let html = '<div class="equipment-presets-grid">';

        for (let i = 0; i < 10; i++) {
            html += this.renderPresetTile(i);
        }

        html += '</div>';
        return html;
    },

    /**
     * Render a single preset tile
     */
    renderPresetTile(presetIndex) {
        const preset = GameEngine.getPresetData(presetIndex);
        const isActive = GameEngine.state.equipmentPresets.activePreset === presetIndex;

        // Get weapon from preset for display
        let weaponIcon = '📦';
        let weaponId = null;

        if (preset && preset.equipment.weapon) {
            weaponId = preset.equipment.weapon;
            const weaponDef = ItemAccessHelper.getItem(weaponId);
            if (weaponDef) {
                weaponIcon = IconHelper.getItemIconHTML(weaponDef, {size: 48, className: 'preset-weapon-icon'});
            }
        }

        const isEmpty = !preset;
        const presetName = preset ? preset.name : `Preset ${presetIndex + 1}`;

        return `
            <div class="preset-tile ${isActive ? 'preset-active' : ''} ${isEmpty ? 'preset-empty' : ''}"
                 onclick="handlePresetClick(${presetIndex}, event)"
                 oncontextmenu="handlePresetRightClick(${presetIndex}, event); return false;"
                 title="${isEmpty ? 'Right-click to save current loadout' : 'Click to load, Right-click for options'}">

                <!-- Preset Number Badge -->
                <div class="preset-number">${presetIndex + 1}</div>

                <!-- Active Indicator -->
                ${isActive ? '<div class="preset-active-badge" title="Active Preset">✓</div>' : ''}

                <!-- Weapon Icon -->
                <div class="preset-weapon-display">
                    ${weaponIcon}
                </div>

                <!-- Preset Name -->
                <div class="preset-name">${presetName}</div>

                <!-- Empty State -->
                ${isEmpty ? '<div class="preset-empty-hint">Empty Slot</div>' : ''}
            </div>
        `;
    }
};

/**
 * Handle preset tile click (load preset)
 */
function handlePresetClick(presetIndex, event) {
    event.stopPropagation();

    const preset = GameEngine.getPresetData(presetIndex);

    if (!preset) {
        // Empty slot - show save dialog
        const confirmed = confirm(`Save current equipment loadout to Preset ${presetIndex + 1}?`);
        if (confirmed) {
            const result = GameEngine.saveEquipmentPreset(presetIndex);
            if (result.success) {
                showNotification(`Saved to Preset ${presetIndex + 1}`, 'success');
            } else {
                showNotification(result.reason, 'error');
            }
        }
    } else {
        // Load preset
        const result = GameEngine.loadEquipmentPreset(presetIndex);
        if (result.success) {
            showNotification(`Loaded Preset ${presetIndex + 1}`, 'success');

            if (result.failedItems && result.failedItems.length > 0) {
                console.warn('Some items failed to equip:', result.failedItems);
                showNotification(`Warning: ${result.failedItems.length} items could not be equipped`, 'warning');
            }
        } else {
            showNotification(result.reason, 'error');
        }
    }
}

/**
 * Handle preset tile right-click (context menu)
 */
function handlePresetRightClick(presetIndex, event) {
    event.preventDefault();
    event.stopPropagation();

    const preset = GameEngine.getPresetData(presetIndex);

    if (!preset) {
        // Empty slot - offer to save
        const confirmed = confirm(`Save current equipment loadout to Preset ${presetIndex + 1}?`);
        if (confirmed) {
            const result = GameEngine.saveEquipmentPreset(presetIndex);
            if (result.success) {
                showNotification(`Saved to Preset ${presetIndex + 1}`, 'success');
            } else {
                showNotification(result.reason, 'error');
            }
        }
    } else {
        // Show context menu options
        showPresetContextMenu(presetIndex, event);
    }
}

/**
 * Show context menu for preset options
 */
function showPresetContextMenu(presetIndex, event) {
    const preset = GameEngine.getPresetData(presetIndex);

    const actions = [
        {
            label: '📥 Load Preset',
            action: () => {
                const result = GameEngine.loadEquipmentPreset(presetIndex);
                if (result.success) {
                    showNotification(`Loaded Preset ${presetIndex + 1}`, 'success');
                } else {
                    showNotification(result.reason, 'error');
                }
            }
        },
        {
            label: '💾 Update Preset',
            action: () => {
                const confirmed = confirm(`Overwrite Preset ${presetIndex + 1} with current equipment?`);
                if (confirmed) {
                    const result = GameEngine.saveEquipmentPreset(presetIndex, preset.name);
                    if (result.success) {
                        showNotification(`Updated Preset ${presetIndex + 1}`, 'success');
                    } else {
                        showNotification(result.reason, 'error');
                    }
                }
            }
        },
        {
            label: '✏️ Rename Preset',
            action: () => {
                const newName = prompt(`Enter new name for Preset ${presetIndex + 1}:`, preset.name);
                if (newName && newName.trim()) {
                    const result = GameEngine.saveEquipmentPreset(presetIndex, newName.trim());
                    if (result.success) {
                        showNotification('Preset renamed', 'success');
                    }
                }
            }
        },
        {
            label: '🗑️ Delete Preset',
            action: () => {
                const confirmed = confirm(`Delete Preset ${presetIndex + 1}?`);
                if (confirmed) {
                    const result = GameEngine.deleteEquipmentPreset(presetIndex);
                    if (result.success) {
                        showNotification('Preset deleted', 'success');
                    }
                }
            }
        }
    ];

    // Simple action selection using prompt/confirm for now
    // TODO: Replace with proper context menu UI
    const actionLabels = actions.map((a, i) => `${i + 1}. ${a.label}`).join('\n');
    const choice = prompt(`Preset ${presetIndex + 1} Options:\n\n${actionLabels}\n\nEnter option number (1-${actions.length}):`);

    const choiceIndex = parseInt(choice) - 1;
    if (choiceIndex >= 0 && choiceIndex < actions.length) {
        actions[choiceIndex].action();
    }
}

/**
 * Simple notification system (can be replaced with proper toast notifications)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simple alert for now - TODO: Replace with toast notification
    if (type === 'error') {
        alert(`Error: ${message}`);
    } else {
        // Log success/info messages to console
        console.log(`✅ ${message}`);
    }
}
