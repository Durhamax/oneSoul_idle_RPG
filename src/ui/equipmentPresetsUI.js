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
 * Right-click = management: overwrite with current loadout, rename, delete (or save if empty).
 */
function handlePresetRightClick(presetIndex, event) {
    event.preventDefault();
    event.stopPropagation();
    showPresetContextMenu(presetIndex, event);
}

/**
 * Remove any open preset context menu.
 */
function closePresetContextMenu() {
    const existing = document.getElementById('presetContextMenu');
    if (existing) existing.remove();
    document.removeEventListener('click', closePresetContextMenu);
}

/**
 * Show a floating context menu for preset options.
 */
function showPresetContextMenu(presetIndex, event) {
    closePresetContextMenu();

    const preset = GameEngine.getPresetData(presetIndex);
    const label = preset ? preset.name : `Preset ${presetIndex + 1}`;

    const saveCurrent = () => {
        const result = GameEngine.saveEquipmentPreset(presetIndex, preset?.name || null);
        if (result.success) {
            showNotification(`Saved current loadout to ${result.preset.name}`, 'success');
        } else {
            showNotification(result.reason, 'error');
        }
    };

    const actions = [];

    if (preset) {
        actions.push({ label: '📥 Equip this preset', run: () => {
            const result = GameEngine.loadEquipmentPreset(presetIndex);
            if (result.success) {
                showNotification(`Equipped ${label}`, 'success');
                if (result.failedItems && result.failedItems.length > 0) {
                    showNotification(`${result.failedItems.length} item(s) no longer available`, 'warning');
                }
            } else {
                showNotification(result.reason, 'error');
            }
        }});
        actions.push({ label: '💾 Overwrite with current loadout', run: saveCurrent });
        actions.push({ label: '✏️ Rename', run: () => {
            const newName = prompt(`Rename ${label}:`, preset.name);
            if (newName && newName.trim()) {
                const result = GameEngine.saveEquipmentPreset(presetIndex, newName.trim());
                if (result.success) showNotification('Preset renamed', 'success');
            }
        }});
        actions.push({ label: '🗑️ Delete', run: () => {
            const result = GameEngine.deleteEquipmentPreset(presetIndex);
            if (result.success) showNotification('Preset deleted', 'success');
        }});
    } else {
        actions.push({ label: '💾 Save current loadout here', run: saveCurrent });
    }

    const menu = document.createElement('div');
    menu.id = 'presetContextMenu';
    menu.style.cssText = `
        position: fixed; z-index: 10050;
        background: #1e1e28; border: 1px solid var(--accent-primary, #3498db);
        border-radius: 8px; padding: 6px; min-width: 210px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);`;

    menu.innerHTML = `
        <div style="font-size:0.75em; color:#888; padding:4px 10px 6px; border-bottom:1px solid #333; margin-bottom:4px;">${label}</div>
        ${actions.map((a, i) => `
            <div class="preset-ctx-item" data-idx="${i}"
                 style="padding:8px 10px; border-radius:5px; cursor:pointer; font-size:0.9em; color:#eee;">
                ${a.label}
            </div>
        `).join('')}
    `;

    document.body.appendChild(menu);

    // Position within viewport
    const px = Math.min(event.clientX, window.innerWidth - menu.offsetWidth - 8);
    const py = Math.min(event.clientY, window.innerHeight - menu.offsetHeight - 8);
    menu.style.left = `${Math.max(8, px)}px`;
    menu.style.top = `${Math.max(8, py)}px`;

    menu.querySelectorAll('.preset-ctx-item').forEach(el => {
        el.addEventListener('mouseenter', () => { el.style.background = 'rgba(52,152,219,0.25)'; });
        el.addEventListener('mouseleave', () => { el.style.background = 'transparent'; });
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(el.dataset.idx, 10);
            closePresetContextMenu();
            actions[idx].run();
        });
    });

    // Close on any outside click (next tick so this event doesn't immediately close it)
    setTimeout(() => document.addEventListener('click', closePresetContextMenu), 0);
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
