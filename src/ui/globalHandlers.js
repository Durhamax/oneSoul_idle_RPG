/**
 * GLOBAL ONCLICK HANDLERS
 *
 * Functions called directly from HTML onclick/onload attributes.
 * These bridge the gap between HTML and the modular game systems.
 *
 * These functions are kept global to maintain compatibility with existing
 * HTML onclick handlers. They serve as adapters between the DOM and the
 * game engine, typically calling GameEngine methods and triggering UI updates.
 */

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the game on page load (async to support JSON loading)
 */
async function initGame() {
    console.log("🎮 Starting Idle RPG...");

    // Initialize systems in order (await GameEngine.init for async JSON loading)
    await GameEngine.init();
    const hasSave = SaveSystem.init();
    UICore.init();

    // Initialize EquipmentUI event listeners for instant updates
    if (typeof EquipmentUI !== 'undefined' && EquipmentUI.init) {
        EquipmentUI.init();
    }

    // Initialize CombatUI (Rev1)
    if (typeof CombatUI !== 'undefined' && CombatUI.init) {
        CombatUI.init();
    }

    // Initialize WeaponBuildModal
    if (typeof WeaponBuildModal !== 'undefined' && WeaponBuildModal.init) {
        WeaponBuildModal.init();
    }

    // Initialize developer stats panel
    if (typeof DevStatsPanel !== 'undefined') {
        DevStatsPanel.init();
        DevStatsPanel.update('overview');
    }

    // If no save exists, add starter items for testing
    if (!hasSave) {
        console.log("🎁 Adding starter items...");

        // Add some starting resources
        GameEngine.addItemToBank("gold", 100);
        GameEngine.addItemToBank("wood", 50);
        GameEngine.addItemToBank("ore", 50);

        // Add basic starter equipment
        GameEngine.addItemToBank("dagger", 1);
        GameEngine.addItemToBank("clothHood", 1);
        GameEngine.addItemToBank("huntingJacket", 1);
        GameEngine.addItemToBank("clothPants", 1);

        UICore.update();
    }

    console.log("✅ Game ready!");
}

// =============================================================================
// GAME MANAGEMENT
// =============================================================================

/**
 * Save the game
 */
function saveGame() {
    SaveSystem.save();
    UICore.update();
}

/**
 * Reset the game
 */
async function resetGame() {
    if (await confirm("Are you sure you want to reset all progress?")) {
        SaveSystem.deleteSave();
        GameEngine.reset();
        UICore.update();
    }
}

// =============================================================================
// VIEW MANAGEMENT
// =============================================================================

/**
 * Switch between different views
 */
/**
 * Global adapter function for view switching
 * Delegates to UICore.switchView() for proper separation of concerns
 * @param {string} viewName - The view to switch to
 */
function switchView(viewName) {
    // Delegate to UICore module
    if (typeof UICore !== 'undefined' && UICore.switchView) {
        UICore.switchView(viewName);
    } else {
        console.error('UICore.switchView() not available');
    }
}

// =============================================================================
// RESOURCES
// =============================================================================

/**
 * Purchase a generator
 */
function purchaseGenerator(genId) {
    const result = GameEngine.purchaseGenerator(genId);
    if (result.success) {
        UICore.update();
    } else {
        console.log(`❌ Cannot purchase: ${result.reason}`);
    }
}

/**
 * Purchase an upgrade
 */
function purchaseUpgrade(upgradeId) {
    const result = GameEngine.purchaseUpgrade(upgradeId);
    if (result.success) {
        UICore.update();
    } else {
        console.log(`❌ Cannot purchase: ${result.reason}`);
    }
}

// =============================================================================
// ATTRIBUTES
// =============================================================================

/**
 * Assign an attribute point
 */
/**
 * Assign attribute point (UI adapter for SkillSystem.assignAttributePoint)
 * @param {string} attributeId - The attribute ID (e.g., 'strength', 'agility')
 */
function assignPoint(attributeId) {
    // Delegate to SkillSystem via GameEngine
    const result = GameEngine.assignAttributePoint(attributeId);

    if (!result.success) {
        console.log(`❌ Could not assign point: ${result.reason}`);
        alert(result.reason);
    }
    // Success handling already done in SkillSystem
}

// =============================================================================
// EXPLORATION
// =============================================================================

/**
 * Explore the current region
 */
function explore() {
    const result = GameEngine.exploreRegion();

    if (result.success) {
        // Show discoveries if any
        if (result.discoveries && result.discoveries.length > 0) {
            const container = document.getElementById("discoveriesDisplay");
            let html = "<div style='margin-top: 10px;'><strong>New Discoveries!</strong>";

            for (let discovery of result.discoveries) {
                if (discovery.type === "node") {
                    const bonusPercent = (discovery.bonus * 100).toFixed(0);
                    html += `<div class="discovery">🔍 Found ${discovery.name}! (+${bonusPercent}% ${discovery.resource})</div>`;
                } else if (discovery.type === "location") {
                    html += `<div class="discovery">📍 Discovered ${discovery.name}!</div>`;
                }
            }

            html += "</div>";
            container.innerHTML = html;

            // Clear discoveries after 5 seconds
            setTimeout(() => {
                container.innerHTML = "";
            }, 5000);
        }

        UICore.update();
    } else {
        console.log(`❌ Cannot explore: ${result.reason}`);
    }
}

/**
 * Travel to a different region (called from region selection)
 */
function travelToRegion(regionId) {
    const result = GameEngine.travelToRegion(regionId);

    if (!result.success) {
        console.log(`❌ Cannot travel: ${result.reason}`);
    } else {
        console.log(`✈️ Traveled to ${result.region.name}`);
    }

    closeRegionPopup();
    UICore.update();
}

// =============================================================================
// BANK
// =============================================================================

/**
 * Switch bank tab
 */
function switchBankTab(tabId) {
    const result = GameEngine.switchBankTab(tabId);

    if (result.success) {
        // Force bank re-render by clearing cache
        EquipmentUI.lastBankState = null;
        EquipmentUI.updateBank();
    } else {
        console.log(`❌ Cannot switch tab: ${result.reason}`);
    }
}

/**
 * Inspect an item (clear new status and show info)
 */
function inspectItem(itemId) {
    console.log('[inspectItem] Called with itemId:', itemId);

    GameEngine.clearNewItemStatus(itemId);

    // DUAL-BANK: Check all storage locations (instanced, stackable, legacy)
    const instancedItem = GameEngine.state.bank.instanced?.[itemId];
    const stackableItem = GameEngine.state.bank.stackable?.[itemId];
    const legacyItem = GameEngine.state.bank.items?.[itemId];
    const bankItem = instancedItem || stackableItem || legacyItem;
    console.log('[inspectItem] Bank item:', bankItem);

    // For instanced items, use baseItemId to get definition
    const lookupId = bankItem?.baseItemId || itemId;
    const def = ItemAccessHelper.getItem(lookupId);
    console.log('[inspectItem] Definition (lookup:', lookupId, '):', def);

    if (!bankItem || !def) {
        console.error('[inspectItem] Missing bankItem or def');
        return;
    }

    // Open item detail modal
    ItemModal.open(itemId);

    UICore.update();
}

// =============================================================================
// EQUIPMENT
// =============================================================================

/**
 * Open equipment selection modal for a slot
 */
function openEquipModal(slot, event) {
    // Prevent unequip button from triggering modal
    if (event && event.target && event.target.tagName === 'BUTTON') {
        return;
    }

    const modal = document.getElementById("equipModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalGrid = document.getElementById("modalItemGrid");

    // Check if slot already has an item equipped
    const currentlyEquippedId = GameEngine.state.equipment[slot];

    // Set modal title
    modalTitle.textContent = `Select ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;

    // DUAL-BANK: Get all items from all storage locations that can be equipped in this slot
    const instancedItems = GameEngine.state.bank.instanced || {};
    const stackableItems = GameEngine.state.bank.stackable || {};
    const legacyItems = GameEngine.state.bank.items || {};

    // Combine all bank items
    const allBankItems = {...instancedItems, ...stackableItems, ...legacyItems};
    const compatibleItems = [];

    for (let itemId in allBankItems) {
        const bankItem = allBankItems[itemId];

        // Get base item ID for lookups (handle instances)
        const lookupId = bankItem.baseItemId || itemId;

        // Use ItemAccessHelper for standardized access
        const def = ItemAccessHelper.getItem(lookupId);

        if (!def) continue; // Skip if item not found

        // Check both 'equipSlot' and 'slot' properties for compatibility
        const itemSlot = def.equipSlot || def.slot;
        if (itemSlot === slot && bankItem.quantity > 0) {
            compatibleItems.push({
                itemId: itemId, // Use actual ID (could be instance ID)
                def: def,
                quantity: bankItem.quantity
            });
        }
    }

    // Render items
    let html = "";

    // Add unequip button if something is currently equipped
    if (currentlyEquippedId) {
        const equippedDef = ItemAccessHelper.getItem(currentlyEquippedId);
        if (equippedDef) {
            html += `
                <div class="equip-modal-unequip-section">
                    <div class="equip-modal-currently-equipped">
                        <span style="color: #888; font-size: 0.85em;">Currently Equipped:</span>
                        <strong>${equippedDef.name}</strong>
                    </div>
                    <button class="btn btn-danger" onclick="unequipFromModal('${slot}')" style="width: 100%; margin-bottom: 15px;">
                        ❌ Unequip ${equippedDef.name}
                    </button>
                </div>
            `;
        }
    }

    if (compatibleItems.length === 0) {
        html += `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
            No compatible items in bank.<br>
            <span style="font-size: 0.9em;">Items for this slot: ${slot}</span>
        </div>`;
    } else {
        html += '<div class="modal-item-grid">';
        for (let item of compatibleItems) {
            // Use standardized ItemCard component for equipment selection
            html += ItemCard.create(item.itemId, 'equipment', {
                quantity: item.quantity,
                compact: false,
                isEquipped: item.itemId === currentlyEquippedId,
                onClick: `equipFromModal(&quot;${item.itemId}&quot;, &quot;${slot}&quot;)`
            });
        }
        html += '</div>';
    }

    modalGrid.innerHTML = html;
    modal.style.display = "block";

    // Store current slot for later use
    modal.dataset.currentSlot = slot;
}

/**
 * Close equipment modal
 */
function closeEquipModal() {
    const modal = document.getElementById("equipModal");
    modal.style.display = "none";
}

/**
 * Unequip item from modal
 */
function unequipFromModal(slot) {
    const result = GameEngine.unequipItem(slot);

    if (result.success) {
        console.log(`✅ Unequipped from ${slot}`);
        closeEquipModal();
        UICore.updateAllViews();
    } else {
        console.error(`❌ Failed to unequip: ${result.reason}`);
        alert(`Cannot unequip: ${result.reason}`);
    }
}

/**
 * Equip an item from the modal
 */
function equipFromModal(itemId, slot) {
    const result = GameEngine.equipItem(itemId);

    // Use ItemIdUtils to get base ID for item name lookup
    const baseId = typeof ItemIdUtils !== 'undefined'
        ? ItemIdUtils.getBaseItemId(itemId)
        : itemId;

    if (result.success) {
        const itemDef = ItemAccessHelper.getItem(baseId);
        const itemName = itemDef ? itemDef.name : itemId;
        console.log(`⚔️ Equipped ${itemName}!`);
        closeEquipModal();
    } else {
        console.log(`❌ Cannot equip: ${result.reason}`);

        // Show error message in modal
        const modalGrid = document.getElementById("modalItemGrid");
        if (modalGrid) {
            // Create error message element
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(244, 67, 54, 0.95);
                color: white;
                padding: 20px 30px;
                border-radius: 8px;
                font-size: 1.1em;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                z-index: 10001;
                text-align: center;
            `;
            errorDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px;">⚠️ Cannot Equip</div>
                <div>${result.reason}</div>
            `;
            document.body.appendChild(errorDiv);

            // Remove after 3 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
        }

        return; // Don't close modal on error
    }

    // Force equipment and bank update
    EquipmentUI.lastEquipmentState = null;
    EquipmentUI.lastBankState = null;
    EquipmentUI.updateEquipment();
    EquipmentUI.updateBank();

    // Force combat UI update if in combat (for real-time stat updates)
    if (GameEngine.state.combat.inCombat) {
        CombatUI.lastCombatState = null;
        CombatUI.updateCombat();
        console.log('🔄 Combat stats updated after equipment change');
    }
}

/**
 * Unequip an item from a slot
 */
function unequipItem(slot, event) {
    // Stop propagation to prevent opening modal
    if (event) {
        event.stopPropagation();
    }

    const result = GameEngine.unequipItem(slot);

    if (!result.success) {
        console.log(`❌ Cannot unequip: ${result.reason}`);
    }

    // Force equipment and bank update
    EquipmentUI.lastEquipmentState = null;
    EquipmentUI.lastBankState = null;
    EquipmentUI.updateEquipment();
    EquipmentUI.updateBank();

    // Force combat UI update if in combat (for real-time stat updates)
    if (GameEngine.state.combat.inCombat) {
        CombatUI.lastCombatState = null;
        CombatUI.updateCombat();
        console.log('🔄 Combat stats updated after equipment change');
    }
}

/**
 * Open rest equipment selection modal (food or wood)
 */
function openRestEquipModal(slotType, event) {
    if (event) {
        event.stopPropagation();
    }

    const modal = document.getElementById("equipModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalGrid = document.getElementById("modalItemGrid");

    // Set modal title
    const slotLabels = {
        food: 'Food (Healing)',
        wood: 'Wood (Logs)'
    };
    modalTitle.textContent = `Select ${slotLabels[slotType]}`;

    // Get all items in bank that are compatible with this slot
    const bankItems = GameEngine.state.bank.items;
    const compatibleItems = [];

    for (let itemId in bankItems) {
        const def = ItemRegistry.getItem(itemId);
        if (!def || bankItems[itemId].quantity === 0) continue;

        // Filter based on slot type
        let isCompatible = false;
        if (slotType === 'food') {
            // Food items must have healing value
            isCompatible = def.healing && def.healing > 0;
        } else if (slotType === 'wood') {
            // Wood items must be logs (resourceType === 'log')
            isCompatible = def.resourceType === 'log';
        }

        if (isCompatible) {
            compatibleItems.push({
                itemId: itemId,
                def: def,
                quantity: bankItems[itemId].quantity
            });
        }
    }

    // Render items
    let html = "";

    if (compatibleItems.length === 0) {
        const emptyMessage = slotType === 'food'
            ? 'No food items with healing value in bank.'
            : 'No log items in bank.';
        html = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
            ${emptyMessage}<br>
            <span style="font-size: 0.9em;">Required: ${slotType === 'food' ? 'Items with healing property' : 'Log-type resources'}</span>
        </div>`;
    } else {
        for (let item of compatibleItems) {
            html += ItemCard.create(item.itemId, 'rest-equipment', {
                quantity: item.quantity,
                compact: false,
                onClick: `equipRestItem(&quot;${item.itemId}&quot;, &quot;${slotType}&quot;)`
            });
        }
    }

    modalGrid.innerHTML = html;
    modal.style.display = "block";
    modal.dataset.currentSlot = slotType;
    modal.dataset.restEquipment = 'true';
}

/**
 * Equip an item to rest equipment slot
 */
function equipRestItem(itemId, slotType) {
    const def = ItemRegistry.getItem(itemId);
    if (!def) {
        console.error('❌ Item not found:', itemId);
        return;
    }

    // Validate item is compatible
    let isValid = false;
    if (slotType === 'food' && def.healing && def.healing > 0) {
        isValid = true;
    } else if (slotType === 'wood' && def.resourceType === 'log') {
        isValid = true;
    }

    if (!isValid) {
        console.error(`❌ ${def.name} cannot be equipped in ${slotType} slot`);
        return;
    }

    // Equip the item
    GameEngine.state.activeNavigation.restEquipment[slotType] = itemId;
    console.log(`✅ Equipped ${def.name} to ${slotType} slot`);

    closeEquipModal();

    // Update navigation UI
    if (typeof NavigationUI !== 'undefined') {
        NavigationUI.lastNavigationState = null;
        NavigationUI.updateNavigation();
    }
}

/**
 * Unequip rest equipment item
 */
function unequipRestItem(slotType, event) {
    if (event) {
        event.stopPropagation();
    }

    GameEngine.state.activeNavigation.restEquipment[slotType] = null;
    console.log(`✅ Unequipped ${slotType} slot`);

    // Update navigation UI
    if (typeof NavigationUI !== 'undefined') {
        NavigationUI.lastNavigationState = null;
        NavigationUI.updateNavigation();
    }
}

/**
 * Show context menu on right-click
 */
function showContextMenu(event, itemId) {
    event.preventDefault();

    const contextMenu = document.getElementById("contextMenu");
    const def = ItemAccessHelper.getItem(itemId);

    // Build context menu
    let html = "";

    // If item is equippable, show equip option
    if (def.equipSlot) {
        html += `<div class="context-menu-item" onclick="equipItemFromContext('${itemId}')">⚔️ Equip ${def.name}</div>`;
    }

    html += `<div class="context-menu-item" onclick="inspectItem('${itemId}'); hideContextMenu();">👁️ Inspect</div>`;

    contextMenu.innerHTML = html;

    // Position the context menu at mouse position
    contextMenu.style.left = event.pageX + "px";
    contextMenu.style.top = event.pageY + "px";
    contextMenu.style.display = "block";
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById("contextMenu");
    contextMenu.style.display = "none";
}

/**
 * Equip item from context menu
 */
function equipItemFromContext(itemId) {
    const result = GameEngine.equipItem(itemId);

    // Use ItemIdUtils to get base ID for item name lookup
    const baseId = typeof ItemIdUtils !== 'undefined'
        ? ItemIdUtils.getBaseItemId(itemId)
        : itemId;

    if (result.success) {
        // Get item name using base ID
        const def = ItemRegistry.getItem(baseId) || GameEngine.definitions?.items?.[baseId];
        const itemName = def ? def.name : itemId;

        console.log(`⚔️ Equipped ${itemName}!`);
    } else {
        console.log(`❌ Cannot equip: ${result.reason}`);
    }

    hideContextMenu();
    // Force equipment and bank update
    EquipmentUI.lastEquipmentState = null;
    EquipmentUI.lastBankState = null;
    EquipmentUI.updateEquipment();
    EquipmentUI.updateBank();
}

// =============================================================================
// SKILLS & NODES
// =============================================================================

/**
 * Select a skill and switch to nodes view
 */
/**
 * Open node selection modal for a gathering skill
 * @param {string} skillId - The gathering skill ID (mining, logging, etc.)
 */
function selectSkillForNodes(skillId) {
    console.log(`🎯 Opening node selection modal for: ${skillId}`);

    // Open the skill node modal
    if (typeof SkillNodeModal !== 'undefined') {
        SkillNodeModal.open(skillId);
    } else {
        console.error('SkillNodeModal not loaded');
    }
}

/**
 * Start harvesting from a node
 */
function startNodeHarvesting(nodeId) {
    // Get node definition to determine skill
    const nodeDef = NodeRegistry.getAllActive()[nodeId];
    if (!nodeDef) {
        console.error(`Node ${nodeId} not found`);
        return;
    }

    const skill = nodeDef.nodeType; // mining, fishing, logging, etc.

    // Use NEW GatheringSystem (not NodeCollectionSystem)
    const canStart = GameEngine.canStartGathering(skill, nodeId);

    if (!canStart.canStart) {
        console.log(`❌ Cannot start harvesting: ${canStart.reason}`);
        alert(canStart.reason);
        return;
    }

    const result = GameEngine.startGathering(skill, nodeId);

    if (result) {
        console.log(`⛏️ Started gathering at ${nodeDef.name}!`);
        // Force nodes update
        NavigationUI.lastNodesState = null;
        NavigationUI.updateNodes();
    }
}

/**
 * Stop node harvesting
 */
function stopNodeHarvesting() {
    console.log("⏹️ Stop harvesting button clicked");

    // Use GatheringSystem.stopGathering (bound to GameEngine)
    GameEngine.stopGathering();

    console.log("✅ Stopped gathering");

    // Force nodes update
    NavigationUI.lastNodesState = null;
    NavigationUI.updateNodes();
}

// =============================================================================
// COMBAT
// =============================================================================

/**
 * Start combat with an enemy
 */
/**
 * Start combat with an enemy (UI adapter for CombatSystem.startCombat)
 * @param {string} enemyId - The enemy ID to fight
 */
function startFight(enemyId) {
    // Delegate to CombatSystem via GameEngine
    const result = GameEngine.startCombat(enemyId);

    if (!result.success) {
        console.log(`❌ Cannot start combat: ${result.reason}`);
        alert(result.reason);
    }

    // Force combat UI update
    CombatUI.lastCombatState = null;
    CombatUI.updateCombat();
}

/**
 * Player attacks (UI adapter for CombatSystem.playerAttack)
 */
function attack() {
    // Delegate to CombatSystem via GameEngine
    const result = GameEngine.playerAttack();

    if (!result.success && result.reason === "Attack on cooldown") {
        // Don't show error for cooldown - this is expected
        return;
    }

    // Delay combat UI update to allow attack animations to complete
    // Attack animation timeline: 0ms→200ms→400ms(hit splat)→600ms(enemy react)
    setTimeout(() => {
        CombatUI.lastCombatState = null;
        EquipmentUI.lastEquipmentState = null;
        CombatUI.updateCombat();
        EquipmentUI.updateEquipment();
    }, 800); // Delay 800ms to let attack animation complete (600ms) + buffer
}

/**
 * Toggle combat stance (UI adapter for CombatSystem.toggleStance)
 */
function toggleStance() {
    // Delegate to CombatSystem via GameEngine
    const result = GameEngine.toggleStance();

    if (!result.success) {
        console.log(`⚠️ ${result.reason}`);
        return;
    }

    // Force combat and equipment update to show new stats
    CombatUI.lastCombatState = null;
    EquipmentUI.lastEquipmentState = null;
    CombatUI.updateCombat();
    EquipmentUI.updateEquipment();
}

/**
 * Flee from combat (UI adapter for CombatSystem.fleeCombat)
 */
function flee() {
    // Delegate to CombatSystem via GameEngine
    const result = GameEngine.fleeCombat();

    if (result.success) {
        console.log("🏃 You fled from combat!");
    }

    // Force combat and equipment update
    CombatUI.lastCombatState = null;
    EquipmentUI.lastEquipmentState = null;
    CombatUI.updateCombat();
    EquipmentUI.updateEquipment();
}

/**
 * Collect all pending loot
 */
function collectLoot() {
    const result = GameEngine.collectLoot();

    if (result.success) {
        console.log("📦 Collected all loot!");
    }

    // Force UI update
    UICore.update();
}

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Start navigating/exploring the current region
 */
function startNavigating() {
    const result = GameEngine.startNavigation();

    if (!result.success) {
        console.log(`❌ Cannot start navigating: ${result.reason}`);

        // Show user-friendly error message
        let userMessage = result.reason;

        // Check specific cases and provide helpful messages
        if (result.reason?.includes('food') || result.reason?.includes('logs')) {
            const hasFood = GameEngine.state.equipment?.food && GameEngine.state.bank.items[GameEngine.state.equipment.food]?.quantity > 0;
            const logItems = ['pinewood', 'log', 'normalLogs', 'oakLog', 'oakLogs', 'willowLog', 'willowLogs', 'birchLog', 'mapleLog', 'mapleLogs', 'wood'];
            const hasLogs = logItems.some(logId => GameEngine.state.bank.items[logId]?.quantity > 0);

            if (!hasFood && !hasLogs) {
                userMessage = '⚠️ Navigation requires:\n\n• Food equipped in Food slot (e.g., Light Rations)\n• Logs in your bank (e.g., Wood)\n\nYou are missing both!';
            } else if (!hasFood) {
                userMessage = '⚠️ No food equipped!\n\nEquip food in your Food slot to navigate.\n(Light Rations work great!)';
            } else if (!hasLogs) {
                userMessage = '⚠️ No logs in your bank!\n\nYou need logs (Wood, Oak Logs, etc.) to make campfires while exploring.';
            }
        }

        alert(userMessage);
    }

    UICore.update();
}

/**
 * Stop navigating
 */
function stopNavigating() {
    GameEngine.stopNavigation();
    UICore.update();
}

/**
 * Show region popup with information
 */
function showRegionPopup(regionId) {
    const modal = document.getElementById("regionModal");
    const modalContent = document.getElementById("regionModalContent");

    const hexDef = GameEngine.definitions.worldMap[regionId];
    const biomeDef = GameEngine.definitions.biomes[hexDef?.biome];
    const regionState = GameEngine.state.regions[regionId];
    const currentRegionId = GameEngine.state.currentRegion;

    if (!hexDef || !biomeDef) {
        console.error(`Region ${regionId} not found`);
        return;
    }

    const isDiscovered = regionState?.discovered || false;
    const isCurrent = regionId === currentRegionId;
    const discoveredNodes = regionState?.discoveredNodeTypes || [];
    const discoveredStations = regionState?.discoveredCraftingStations || [];
    const discoveredPaths = regionState?.discoveredExitPaths || [];

    // Check if can travel
    const canTravelHere = GameEngine.canTravelToRegion(regionId);

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 3em; margin-bottom: 10px;">${biomeDef.icon}</div>
            <h2 style="margin: 0; color: ${biomeDef.color};">${hexDef.name}</h2>
            <div style="color: #888; margin-top: 5px;">${biomeDef.name} Biome</div>
            ${isCurrent ? '<div style="color: #4a9eff; margin-top: 5px;">📍 Current Location</div>' : ''}
        </div>

        <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="color: #aaa; margin: 0;">${hexDef.description}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; text-align: center;">
                <div style="font-size: 2em; color: #4caf50;">🌿</div>
                <div style="font-size: 1.5em; font-weight: bold;">${discoveredNodes.length}</div>
                <div style="font-size: 0.85em; color: #888;">Resource Nodes</div>
            </div>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; text-align: center;">
                <div style="font-size: 2em; color: #2196f3;">🔧</div>
                <div style="font-size: 1.5em; font-weight: bold;">${discoveredStations.length}</div>
                <div style="font-size: 0.85em; color: #888;">Crafting Stations</div>
            </div>
        </div>

        ${isDiscovered ? `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <div style="font-size: 0.9em; color: #888; margin-bottom: 10px;">
                    <strong>Exit Paths Discovered:</strong> ${discoveredPaths.length}
                </div>
                <div style="font-size: 0.9em; color: #888;">
                    <strong>Discovery Progress:</strong> ${regionState.discoveryProgress}%
                </div>
            </div>
        ` : `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin-bottom: 15px; text-align: center; color: #888;">
                <div style="font-size: 2em; margin-bottom: 10px;">🔒</div>
                <div>This region has not been discovered yet.</div>
                ${hexDef.navigationRequirement > 0 ? `<div style="margin-top: 5px; font-size: 0.9em;">Requires Navigation Level ${hexDef.navigationRequirement}</div>` : ''}
            </div>
        `}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${!isCurrent && isDiscovered ? `
                <button onclick="switchToRegionAndExplore('${regionId}')"
                        style="background: #4a9eff; padding: 12px; font-size: 1em;">
                    🧭 Explore Region
                </button>
            ` : ''}

            ${!isCurrent ? `
                <button onclick="travelToRegion('${regionId}')"
                        ${!canTravelHere ? 'disabled' : ''}
                        style="padding: 12px; font-size: 1em; ${canTravelHere ? 'background: #4caf50;' : ''}">
                    ${canTravelHere ? '✈️ Travel Here' : '🔒 Path Not Discovered'}
                </button>
            ` : `
                <button disabled style="padding: 12px; font-size: 1em; grid-column: 1 / -1;">
                    📍 Already Here
                </button>
            `}

            <button onclick="closeRegionPopup()"
                    style="background: #666; padding: 12px; font-size: 1em; ${isCurrent || !isDiscovered ? 'grid-column: 1 / -1;' : ''}">
                Close
            </button>
        </div>
    `;

    modalContent.innerHTML = html;
    modal.style.display = "flex";
}

/**
 * Switch to a region and start exploring it
 */
function switchToRegionAndExplore(regionId) {
    const result = GameEngine.travelToRegion(regionId);

    if (result.success) {
        closeRegionPopup();
        startNavigating();
    } else {
        console.log(`❌ Cannot travel: ${result.reason}`);
    }
}

/**
 * Close the region popup modal
 */
function closeRegionPopup() {
    const modal = document.getElementById("regionModal");
    modal.style.display = "none";
}

/**
 * Start harvesting from a node while navigating
 */
function startHarvestingFromNavigation(nodeId) {
    // Stop navigation if active
    if (GameEngine.state.activeNavigation.isNavigating) {
        GameEngine.stopNavigation();
    }

    // Get node definition to determine skill
    const nodeDef = NodeRegistry.getAllActive()[nodeId];
    if (!nodeDef) {
        console.error(`Node ${nodeId} not found`);
        return;
    }

    const skill = nodeDef.nodeType; // mining, fishing, logging, etc.

    // Use NEW GatheringSystem (not NodeCollectionSystem)
    const canStart = GameEngine.canStartGathering(skill, nodeId);

    if (!canStart.canStart) {
        console.log(`❌ Cannot start harvesting: ${canStart.reason}`);
        alert(canStart.reason);
        return;
    }

    const result = GameEngine.startGathering(skill, nodeId);

    if (result) {
        console.log(`✅ Started harvesting ${nodeDef.name}`);

        // Switch to nodes view to show the active harvesting
        switchView('nodes');
        UICore.update();
    }
}

/**
 * Toggle the world map collapsed state
 */
function toggleWorldMap() {
    NavigationUI.worldMapCollapsed = !NavigationUI.worldMapCollapsed;
    NavigationUI.lastNavigationState = null; // Force re-render
    UICore.update();
}

// =============================================================================
// CRAFTING
// =============================================================================

/**
 * Select a crafting skill filter
 */
function selectCraftingSkill(skill) {
    GameEngine.setCraftingSkillFilter(skill);  // Use system method instead of direct mutation
    UICore.updateCrafting(true); // Force update when skill filter changes
}

/**
 * Start crafting a recipe
 */
function startCrafting(recipeId) {
    try {
        const result = GameEngine.startCraft(recipeId);

        if (result.success) {
            const recipe = GameEngine.definitions.recipes[recipeId];
            console.log(`✅ Started crafting ${recipe.name}`);
        } else {
            console.log(`❌ Cannot craft: ${result.reason}`);
            alert(`Cannot craft: ${result.reason}`);
        }
    } catch (error) {
        console.error(`💥 Error in startCrafting:`, error);
        alert(`Error: ${error.message}`);
    }

    UICore.updateCrafting(true); // Force update to refresh material counts
}

/**
 * Stop auto-crafting
 */
function stopAutoCrafting() {
    GameEngine.stopAutoCraft();
    console.log('⏹️ Stopped auto-crafting');
    UICore.updateCrafting(true);
}

/**
 * Open crafting view and select a specific skill
 */
function openCraftingForSkill(skill) {
    GameEngine.setCraftingSkillFilter(skill);  // Use system method instead of direct mutation
    switchView('crafting');
}

/**
 * Open crafting view and select a specific station
 */
function openCraftingForStation(stationId) {
    const station = GameEngine.definitions.craftingNodes[stationId];
    if (station) {
        GameEngine.setCraftingSkillFilter(station.skill);  // Use system method instead of direct mutation
        switchView('crafting');
    }
}

// =============================================================================
// WINDOW EVENT HANDLERS
// =============================================================================

// Close modal and context menu when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("equipModal");
    const contextMenu = document.getElementById("contextMenu");

    if (event.target === modal) {
        closeEquipModal();
    }

    // Hide context menu on any click
    if (contextMenu.style.display === "block") {
        hideContextMenu();
    }
}

// =============================================================================
// MISSIONS
// =============================================================================

/**
 * Open mission dialog to view details or start mission
 */
function openMissionDialog(missionId) {
    MissionsUI.currentDialog = missionId;
    MissionsUI.lastMissionsState = null;  // Force re-render
    MissionsUI.updateMissions();
}

/**
 * Close mission dialog
 */
function closeMissionDialog() {
    MissionsUI.currentDialog = null;
    MissionsUI.lastMissionsState = null;  // Force re-render
    MissionsUI.updateMissions();
}

/**
 * Accept and start a mission
 */
function acceptMission(missionId) {
    const result = GameEngine.startMission(missionId);

    if (result.success) {
        console.log(`✅ Accepted mission: ${GameEngine.definitions.missions[missionId].name}`);

        // For "talk" objective type missions, auto-complete the talk objective
        const mission = GameEngine.definitions.missions[missionId];
        if (mission && mission.objectives) {
            for (let objective of mission.objectives) {
                if (objective.type === 'talk') {
                    GameEngine.advanceObjective(missionId, objective.id, 1);
                }
            }
        }

        closeMissionDialog();
    } else {
        console.log(`❌ Cannot accept mission: ${result.reason}`);
        alert(`Cannot accept mission: ${result.reason}`);
    }
}

/**
 * Complete an active mission and claim rewards
 */
function completeMission(missionId) {
    const result = GameEngine.completeMission(missionId);

    if (result.success) {
        console.log(`✅ Mission completed!`);
        console.log(`🎁 Rewards:`, result.rewards);

        // Force UI refresh
        MissionsUI.lastMissionsState = null;
        UICore.update();
    } else {
        console.log(`❌ Cannot complete mission: ${result.reason}`);
        alert(`Cannot complete mission: ${result.reason}`);
    }
}

/**
 * Abandon an active mission
 */
async function abandonMission(missionId) {
    if (!await confirm('Are you sure you want to abandon this mission? All progress will be lost.')) {
        return;
    }

    const result = GameEngine.abandonMission(missionId);

    if (result.success) {
        console.log(`❌ Abandoned mission`);
        MissionsUI.lastMissionsState = null;
        MissionsUI.updateMissions();
    } else {
        console.log(`❌ Cannot abandon: ${result.reason}`);
    }
}

// =============================================================================
// DEVELOPER PANEL - BALANCE VARIABLES
// =============================================================================

/**
 * Update a balance variable
 */
function updateBalanceVariable(key, value, type) {
    if (type === 'int') {
        GameEngine.gameBalance[key] = Math.round(value);
    } else {
        GameEngine.gameBalance[key] = parseFloat(value);
    }

    console.log(`⚖️ Updated ${key} to ${GameEngine.gameBalance[key]}`);
    DeveloperUI.lastBalanceState = null; // Force re-render
    DeveloperUI.updateBalancingVariables();
}

/**
 * Reset a single balance variable to default
 */
function resetBalanceVariable(key) {
    if (DEFAULT_BALANCE_VALUES[key] !== undefined) {
        GameEngine.gameBalance[key] = DEFAULT_BALANCE_VALUES[key];
        console.log(`↺ Reset ${key} to ${DEFAULT_BALANCE_VALUES[key]}`);
        DeveloperUI.lastBalanceState = null;
        DeveloperUI.updateBalancingVariables();
    }
}

/**
 * Reset all balance variables to defaults
 */
async function resetAllBalanceVariables() {
    if (!await confirm('Reset all balance variables to default values?')) {
        return;
    }

    for (let key in DEFAULT_BALANCE_VALUES) {
        GameEngine.gameBalance[key] = DEFAULT_BALANCE_VALUES[key];
    }

    console.log('↺ Reset all balance variables to defaults');
    DeveloperUI.lastBalanceState = null;
    DeveloperUI.updateBalancingVariables();
}

/**
 * Export balance variables to clipboard
 */
function exportBalanceVariables() {
    const json = JSON.stringify(GameEngine.gameBalance, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        alert('Balance variables copied to clipboard!');
        console.log('📤 Exported balance variables:', json);
    });
}

/**
 * Import balance variables from JSON
 */
function importBalanceVariables() {
    const json = prompt('Paste balance variables JSON:');
    if (!json) return;

    try {
        const imported = JSON.parse(json);

        // Validate that all keys exist
        for (let key in imported) {
            if (GameEngine.gameBalance[key] === undefined) {
                throw new Error(`Unknown balance variable: ${key}`);
            }
        }

        // Apply imported values
        Object.assign(GameEngine.gameBalance, imported);

        console.log('📥 Imported balance variables');
        DeveloperUI.lastBalanceState = null;
        DeveloperUI.updateBalancingVariables();
        alert('Balance variables imported successfully!');
    } catch (error) {
        alert(`Import failed: ${error.message}`);
        console.error('Import error:', error);
    }
}

// =============================================================================
// DEVELOPER PANEL - DEBUG TOOLS
// =============================================================================

/**
 * Debug tools object with quick testing functions
 *
 * TODO ARCHITECTURE VIOLATION: These functions directly mutate GameEngine.state
 * Should be moved to DeveloperSystem or use proper GameEngine methods
 * See: md_notes/UI_ARCHITECTURE_VIOLATIONS.md - Violation #1
 */
const debug = {
    /**
     * Add 1000 gold
     */
    addGold() {
        GameEngine.state.currencies.gold += 1000;
        console.log('💰 Added 1000 gold');
    },

    /**
     * Add 500 medals
     */
    addMedals() {
        GameEngine.state.currencies.medals += 500;
        console.log('🏅 Added 500 medals');
    },

    /**
     * Add 10 character levels (for testing)
     */
    addLevels() {
        if (!GameEngine.state.characterLevel) {
            GameEngine.state.characterLevel = { level: 1, exp: 0, expToLevel: 100 };
        }
        const oldLevel = GameEngine.state.characterLevel.level || 1;
        GameEngine.state.characterLevel.level = oldLevel + 10;
        console.log(`⬆️ Leveled up from ${oldLevel} to ${GameEngine.state.characterLevel.level}`);

        // Refresh perk grid if visible
        if (document.getElementById('view-perks').style.display !== 'none') {
            PerkGridUI.render();
        }
    },

    /**
     * Reset character level to 1 (for testing)
     */
    resetLevel() {
        if (!GameEngine.state.characterLevel) {
            GameEngine.state.characterLevel = { level: 1, exp: 0, expToLevel: 100 };
        }
        const oldLevel = GameEngine.state.characterLevel.level || 1;
        GameEngine.state.characterLevel.level = 1;
        console.log(`🔄 Reset level from ${oldLevel} to 1`);

        // Refresh perk grid if visible
        if (document.getElementById('view-perks').style.display !== 'none') {
            PerkGridUI.render();
        }
    },

    /**
     * Add 100 ore to bank
     */
    addOre() {
        const oreTypes = ['copperOre', 'tinOre', 'ore', 'coal'];
        let added = 0;
        for (let ore of oreTypes) {
            const result = GameEngine.addItemToBank(ore, 100);
            if (result.success) added++;
        }
        console.log(`⛏️ Added 100 ore (${added}/${oreTypes.length} types)`);
    },

    /**
     * Add 100 wood to bank
     */
    addWood() {
        const result = GameEngine.addItemToBank('wood', 300);
        if (result.success) {
            console.log('🪵 Added 300 wood');
        } else {
            console.log(`❌ Failed to add wood: ${result.reason}`);
        }
    },

    /**
     * Skip 1 hour of game time
     */
    skipTime() {
        GameEngine.state.gameTime += 3600;
        console.log('⏩ Skipped 1 hour of game time');
    },

    /**
     * Unlock all regions
     */
    unlockAll() {
        for (let regionId in GameEngine.definitions.worldMap) {
            if (!GameEngine.state.regions[regionId]) {
                GameEngine.state.regions[regionId] = {
                    unlocked: true,
                    visited: false,
                    explorationProgress: 0,
                    discoveredNodeTypes: [],
                    discoveredCraftingStations: [],
                    discoveredExitPaths: []
                };
            }
            GameEngine.state.regions[regionId].unlocked = true;
        }
        console.log('🔓 Unlocked all regions');
    },

    /**
     * Discover all exit paths to adjacent regions from current region
     */
    discoverAllExitPaths() {
        const currentRegionId = GameEngine.state.currentRegion;
        const hexDef = GameEngine.definitions.worldMap[currentRegionId];
        const regionState = GameEngine.state.regions[currentRegionId];

        if (!hexDef || !hexDef.adjacent) {
            console.log('❌ No adjacent regions found');
            return;
        }

        // Convert adjacent object to array format
        const adjacentExits = Object.entries(hexDef.adjacent).map(([direction, regionId]) => ({
            direction: direction,
            id: regionId
        }));

        let discovered = 0;
        for (let adjacentHex of adjacentExits) {
            if (!regionState.discoveredExitPaths.includes(adjacentHex.id)) {
                regionState.discoveredExitPaths.push(adjacentHex.id);
                discovered++;

                const adjacentHexDef = GameEngine.definitions.worldMap[adjacentHex.id];
                console.log(`🚪 Discovered exit path ${adjacentHex.direction}: ${adjacentHexDef?.name || adjacentHex.id}`);
            }
        }

        if (discovered === 0) {
            console.log('ℹ️ All exit paths already discovered');
        } else {
            console.log(`✅ Discovered ${discovered} exit path(s)!`);
        }

        // Refresh navigation UI if visible
        if (UICore.currentView === 'navigation') {
            NavigationUI.lastNavigationState = null;
            UICore.update();
        }
    },

    /**
     * Max out all upgrades
     */
    maxUpgrades() {
        for (let upgradeId in GameEngine.definitions.upgrades) {
            GameEngine.state.upgrades[upgradeId] = 99;
        }
        console.log('⬆️ Maxed all upgrades to level 99');
    },

    /**
     * Max out all skills
     */
    maxSkills() {
        for (let skillId in GameEngine.state.skills) {
            GameEngine.state.skills[skillId].level = 99;
            GameEngine.state.skills[skillId].exp = 0;
        }
        console.log('🎯 Maxed all skills to level 99');
    },

    /**
     * Add a random item to bank
     */
    addRandomItem() {
        const items = Object.keys(GameEngine.definitions.items);
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const amount = Math.floor(Math.random() * 50) + 1;
        GameEngine.addItemToBank(randomItem, amount);
        console.log(`🎲 Added ${amount}x ${randomItem}`);
    },

    /**
     * Fill bank with various items
     */
    fillBank() {
        const itemsToAdd = [
            'copperOre', 'tinOre', 'ore', 'coal',
            'wood', 'stone',
            'hide', 'feather', 'bone',
            'mushroom', 'herb', 'berries'
        ];

        let added = 0;
        for (let item of itemsToAdd) {
            if (ItemAccessHelper.getItem(item)) {
                const result = GameEngine.addItemToBank(item, 500);
                if (result.success) added++;
            }
        }
        console.log(`📦 Filled bank with materials (${added}/${itemsToAdd.length} items)`);
    },

    /**
     * Add equipment pieces to bank
     */
    addEquipment() {
        const equipment = [
            'clothHood', 'leatherHelmet', 'ironHelmet',
            'huntingJacket', 'leatherArmor', 'chainmail',
            'clothPants', 'leatherPants',
            'bronzeSword', 'ironSword',
            'bronzePickaxe', 'ironPickaxe',
            'bronzeAxe', 'ironAxe'
        ];

        let added = 0;
        for (let item of equipment) {
            if (ItemAccessHelper.getItem(item)) {
                const result = GameEngine.addItemToBank(item, 1);
                if (result.success) added++;
            }
        }
        console.log(`⚔️ Added equipment (${added}/${equipment.length} items)`);
    },

    /**
     * Add starter set (tools + basic resources)
     */
    addStarterSet() {
        GameEngine.state.currencies.gold += 5000;
        let added = 0;
        const items = [
            { id: 'bronzePickaxe', amount: 1 },
            { id: 'bronzeAxe', amount: 1 },
            { id: 'copperOre', amount: 100 },
            { id: 'tinOre', amount: 100 },
            { id: 'wood', amount: 100 }
        ];

        for (let item of items) {
            const result = GameEngine.addItemToBank(item.id, item.amount);
            if (result.success) added++;
        }
        console.log(`🎁 Added starter set (5000 gold + ${added}/${items.length} items)`);
    },

    /**
     * Heal player to full health
     */
    healPlayer() {
        const maxHealth = GameEngine.getMaxHealth();
        GameEngine.state.combat.currentHealth = maxHealth;
        console.log('❤️ Healed player to full health');
    },

    /**
     * Add 5 attribute points
     */
    addAttributePoints() {
        GameEngine.state.characterLevel.unassignedAttributePoints += 5;
        console.log('📈 Added 5 attribute points');
    },

    /**
     * Set mission requirement for current region
     * @param {string} missionId - Mission ID that must be completed to leave
     */
    setMissionRequirement(missionId) {
        const currentRegionId = GameEngine.state.currentRegion;
        GameEngine.setRegionMissionRequirement(currentRegionId, missionId);

        // Refresh UI if on navigation tab
        if (UICore.currentView === 'navigation') {
            NavigationUI.lastNavigationState = null;
            UICore.update();
        }
    },

    /**
     * Clear mission requirement for current region
     */
    clearMissionRequirement() {
        const currentRegionId = GameEngine.state.currentRegion;
        const regionDef = GameEngine.definitions.worldMap[currentRegionId];
        if (regionDef) {
            regionDef.requiredMissionToLeave = null;
            console.log(`🗺️ Cleared mission requirement for ${regionDef.name}`);

            // Refresh UI if on navigation tab
            if (UICore.currentView === 'navigation') {
                NavigationUI.lastNavigationState = null;
                UICore.update();
            }
        }
    },

    /**
     * Fully explore current region
     */
    fullyExploreRegion() {
        const currentRegion = GameEngine.state.currentRegion;
        const regionDef = GameEngine.definitions.worldMap[currentRegion];

        if (regionDef) {
            const regionState = GameEngine.state.regions[currentRegion];
            regionState.visited = true;
            regionState.explorationProgress = 100;

            // Discover all node types
            if (regionDef.resourceNodes) {
                regionState.discoveredNodeTypes = [...regionDef.resourceNodes];
            }

            // Discover all crafting stations
            if (regionDef.craftingStations) {
                regionState.discoveredCraftingStations = [...regionDef.craftingStations];
            }

            // Discover all exits
            if (regionDef.exits) {
                regionState.discoveredExitPaths = Object.keys(regionDef.exits);
            }

            console.log(`🗺️ Fully explored ${regionDef.name}`);
        }
    },

    /**
     * Log crafting state to console
     */
    checkCraftingState() {
        console.log('🔍 Crafting State:', JSON.stringify(GameEngine.state.crafting, null, 2));
    },

    /**
     * Add crafting materials
     */
    addCraftingMaterials() {
        const materials = [
            'copperOre', 'tinOre', 'ore', 'coal',
            'wood', 'stone',
            'hide', 'feather', 'bone',
            'rawMeat', 'minnow', 'trout'
        ];

        let added = 0;
        for (let material of materials) {
            if (ItemAccessHelper.getItem(material)) {
                const result = GameEngine.addItemToBank(material, 200);
                if (result.success) added++;
            }
        }
        console.log(`📦 Added crafting materials (${added}/${materials.length} items)`);
    },

    /**
     * Add comprehensive item system examples to bank (UNLIMITED QUANTITIES)
     */
    addComprehensiveItems() {
        console.log('🎁 Adding UNLIMITED items to bank...');

        let added = 0;
        let total = 0;
        const unlimitedQuantity = 999999;

        // Add all modern low-level items (the new 30 items)
        const modernItems = [
            // Resources
            'scrap_metal', 'plastic_bits', 'wire_scraps',
            // Tools
            'basic_wrench', 'plastic_hammer', 'wire_cutters',
            // Weapons
            'pipe_weapon', 'stun_baton', 'crowbar_weapon',
            // Armor
            'leather_jacket', 'work_boots', 'safety_goggles',
            // Technology
            'flashlight', 'battery_pack', 'radio_receiver',
            // Mods
            'scope_attachment', 'reinforced_plating', 'energy_cell',
            // Healing
            'first_aid_kit', 'bandage_roll', 'pain_killers',
            // Consumables
            'energy_drink', 'protein_bar', 'water_bottle',
            // Perks
            'scavenger_basics', 'quick_hands', 'survivalist',
            // Quest Items
            'old_photo', 'keycard_red', 'broken_phone'
        ];

        console.log('📦 Adding modern low-level items...');
        for (let itemId of modernItems) {
            total++;
            if (ItemAccessHelper.getItem(itemId)) {
                const result = GameEngine.addItemToBank(itemId, unlimitedQuantity);
                if (result.success) {
                    added++;
                    console.log(`  ✅ ${itemId}: ${unlimitedQuantity.toLocaleString()}`);
                }
            } else {
                console.warn(`  ⚠️ ${itemId} not found in definitions`);
            }
        }

        // Add all comprehensive item system examples
        const comprehensiveItems = GameEngine.definitions.comprehensiveItems;
        if (comprehensiveItems) {
            console.log('🏆 Adding high-level comprehensive items...');
            for (let itemId in comprehensiveItems) {
                total++;
                const itemData = comprehensiveItems[itemId];

                // Add UNLIMITED quantity
                const result = GameEngine.addItemToBank(itemId, unlimitedQuantity);

                if (result.success) {
                    added++;
                    // Store the full item data in definitions for later retrieval
                    if (!ItemAccessHelper.getItem(itemId)) {
                        ItemAccessHelper.getItem(itemId) = itemData;
                    }
                    console.log(`  ✅ ${itemId}: ${unlimitedQuantity.toLocaleString()}`);
                }
            }
        }

        console.log(`\n🎉 Added ${added}/${total} items with UNLIMITED quantities!`);
        console.log('📂 Check bank tabs: Resources, Tools, Weapons, Armor, Technology, Mods, Healing, Consumables, Perks, Quest Items');

        alert(`Added ${added} item types with ${unlimitedQuantity.toLocaleString()} of each!\nCheck your bank tabs!`);
    },

    /**
     * Test unlimited bank capacity
     */
    testUnlimitedBank() {
        console.log('🧪 Testing unlimited bank capacity...');

        // Try adding a huge amount of items
        const testItem = 'copperOre';
        const hugeAmount = 999999999;

        const beforeCount = GameEngine.getItemCount(testItem);
        const result = GameEngine.addItemToBank(testItem, hugeAmount);
        const afterCount = GameEngine.getItemCount(testItem);

        console.log(`Before: ${beforeCount.toLocaleString()}`);
        console.log(`Added: ${result.amountAdded.toLocaleString()}`);
        console.log(`After: ${afterCount.toLocaleString()}`);
        console.log(result.success ? '✅ Unlimited capacity confirmed!' : '❌ Still capped');

        alert(`Added ${result.amountAdded.toLocaleString()} items!\nNew total: ${afterCount.toLocaleString()}`);
    },

    /**
     * Remove all medals from the perk grid
     */
    async removeAllMedalsFromGrid() {
        if (!await confirm('Remove all medals from the perk grid?')) {
            return;
        }

        if (GameEngine.state.perkGrid && GameEngine.state.perkGrid.placedMedals) {
            const count = Object.keys(GameEngine.state.perkGrid.placedMedals).length;
            GameEngine.state.perkGrid.placedMedals = {};
            console.log(`🗑️ Removed ${count} medals from perk grid`);

            // Refresh perk grid if visible
            if (UICore.currentView === 'perks') {
                PerkGridUI.render();
            }

            await alert(`Removed ${count} medals from the perk grid!`);
        } else {
            console.log('❌ No medals to remove');
            await alert('No medals to remove!');
        }
    },

    /**
     * Add infinite medals to inventory (999 of each tier from common to mythic)
     */
    async addInfiniteMedals() {
        console.log('🏅 Adding infinite medals to inventory...');

        if (!GameEngine.state.craftedMedals) {
            GameEngine.state.craftedMedals = [];
        }

        const tiers = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
        const medalsPerTier = 999;
        let totalAdded = 0;

        for (let tier of tiers) {
            for (let i = 0; i < medalsPerTier; i++) {
                // Craft a medal of this tier (using the highest rarity chance for that tier)
                const medal = GameEngine.craftMedal(tier);
                if (medal.success) {
                    totalAdded++;
                }
            }
        }

        console.log(`🎉 Added ${totalAdded} medals to inventory!`);
        console.log(`📊 Breakdown: ${medalsPerTier} medals of each tier (Common to Mythic)`);

        // Refresh UI if on bank or perks view
        if (UICore.currentView === 'bank' || UICore.currentView === 'perks') {
            UICore.update();
        }

        await alert(`Added ${totalAdded} medals!\n${medalsPerTier} of each tier from Common to Mythic!`);
    },

    // =========================================================================
    // ENGINEERING DEV TOOLS
    // =========================================================================

    /**
     * Grant Engineering XP for testing
     */
    grantEngineeringXP(amount) {
        const result = GameEngine.grantEngineeringXP(amount);
        console.log(`⬆️ Granted ${amount} Engineering XP`);
        if (result.levelUps > 0) {
            console.log(`🎉 Leveled up ${result.levelUps} times! Now level ${result.newLevel}`);
        }
        UICore.update();
    },

    /**
     * [DEPRECATED] Old engineering system - now using workshop system
     * Complete active research instantly
     */
    /*
    completeActiveResearch() {
        console.log('❌ Old engineering system removed. Use giveEngineeringTokens() instead.');
    },
    */

    /**
     * [DEPRECATED] Old engineering system - now using workshop system
     * Reset all research progress
     */
    /*
    resetResearch() {
        console.log('❌ Old engineering system removed. Use giveEngineeringTokens() instead.');
    }
    */
};

// =============================================================================
// OLD ENGINEERING UI HANDLERS (DEPRECATED - Research system removed)
// =============================================================================
// The old research-based engineering system has been replaced with a workshop
// upgrade system. See the new ENGINEERING SYSTEM GLOBAL HANDLERS section below.
/*
function startResearch(techId) {
    console.log('❌ Old engineering research system removed. Use upgradeWorkshop() instead.');
}

function completeResearch() {
    console.log('❌ Old engineering research system removed. Use upgradeWorkshop() instead.');
}

function cancelResearch() {
    console.log('❌ Old engineering research system removed. Use upgradeWorkshop() instead.');
}

function selectTech(techId) {
    console.log('❌ Old engineering research system removed. Use upgradeWorkshop() instead.');
}

function closeTechDetail() {
    console.log('❌ Old engineering research system removed. Use upgradeWorkshop() instead.');
}

// =============================================================================
// COMPREHENSIVE ITEM SYSTEM
// =============================================================================

/**
 * Show example item by type
 */
function showExampleItem(itemType) {
    // Map of example items for each type
    const exampleMap = {
        'resource': 'pristine_iron_ore',
        'tool': 'mythril_pickaxe',
        'weapon': 'dragons_fang_sword',
        'armor': 'titanium_plate_chest',
        'technology': 'auto_smelter',
        'mod': 'crit_damage_mod',
        'healing': 'phoenix_feather',
        'consumable': 'strength_elixir',
        'perk': 'master_miner_perk',
        'quest': 'elder_amulet'
    };

    const itemId = exampleMap[itemType];
    if (!itemId) {
        console.error('Unknown item type:', itemType);
        return;
    }

    // Get item data from definitions
    const itemData = GameDefinitions.comprehensiveItems[itemId];
    if (!itemData) {
        console.error('Item not found:', itemId);
        return;
    }

    // Create item instance
    const item = ItemFactory.create(itemData.itemType, itemData);

    // Display item
    displayItemInPanel(item);

    console.log(`🎁 Showing example ${itemType} item:`, item);
}

/**
 * Generate random item
 */
function generateRandomItem() {
    const types = ['resource', 'tool', 'weapon', 'armor', 'technology', 'mod', 'healing', 'consumable', 'perk', 'quest'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomLevel = Math.floor(Math.random() * 100) + 1;

    // Generate item
    const item = ItemFactory.generate(randomType, randomLevel);

    // Set random name based on type
    const nameTemplates = {
        'resource': ['Ancient', 'Pristine', 'Refined', 'Pure', 'Rare'],
        'tool': ['Legendary', 'Master', 'Superior', 'Exquisite', 'Famed'],
        'weapon': ['Mythical', 'Divine', 'Legendary', 'Fabled', 'Cursed'],
        'armor': ['Reinforced', 'Enchanted', 'Blessed', 'Fortified', 'Sacred'],
        'technology': ['Advanced', 'Quantum', 'Plasma', 'Neural', 'Fusion'],
        'mod': ['Pristine', 'Flawless', 'Perfect', 'Superior', 'Elite'],
        'healing': ['Greater', 'Superior', 'Divine', 'Blessed', 'Holy'],
        'consumable': ['Potent', 'Enhanced', 'Concentrated', 'Refined', 'Pure'],
        'perk': ['Master', 'Expert', 'Advanced', 'Elite', 'Legendary'],
        'quest': ['Ancient', 'Mysterious', 'Forgotten', 'Sacred', 'Lost']
    };

    const prefix = nameTemplates[randomType][Math.floor(Math.random() * 5)];
    item.name = `${prefix} ${randomType.charAt(0).toUpperCase() + randomType.slice(1)}`;

    // Display item
    displayItemInPanel(item);

    console.log(`🎲 Generated random ${randomType}:`, item);
}

/**
 * Test enhancement system
 */
function testEnhancementSystem() {
    // Create a test weapon
    const weaponData = GameDefinitions.comprehensiveItems['dragons_fang_sword'];
    const weapon = ItemFactory.create('weapon', weaponData);

    const display = document.getElementById("itemDisplay");
    if (!display) return;

    let html = `
        <div style="color: white;">
            <h3 style="color: #ff9800; margin-top: 0;">✨ Enhancement System Test</h3>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="color: #4CAF50;">Original Item:</h4>
                ${TooltipUI.generateTooltip(weapon)}
            </div>
    `;

    // Test enhancement
    const enhanceResult = EnhancementSystem.enhance(weapon, {}, 50);
    html += `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="color: ${enhanceResult.success ? '#4CAF50' : '#f44336'};">
                    Enhancement Result: ${enhanceResult.success ? 'SUCCESS' : 'FAILED'}
                </h4>
                <div style="color: #aaa; font-size: 0.9em;">
                    Success Chance: ${enhanceResult.chance.toFixed(1)}%<br>
                    ${enhanceResult.success ? `Level: ${enhanceResult.oldLevel} → ${enhanceResult.newLevel}` : 'Materials lost'}
                </div>
            </div>
    `;

    if (enhanceResult.success) {
        html += `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="color: #4CAF50;">Enhanced Item:</h4>
                ${TooltipUI.generateTooltip(weapon)}
            </div>
        `;
    }

    // Test repair
    weapon.durability = 50;
    const repairResult = EnhancementSystem.repair(weapon, 100);
    html += `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h4 style="color: #FFC107;">Repair Test:</h4>
                <div style="color: #aaa; font-size: 0.9em;">
                    Durability: ${repairResult.oldDurability} → ${repairResult.newDurability}<br>
                    Repaired: +${repairResult.repaired} durability
                </div>
            </div>
    `;

    // Test salvage
    const salvageItem = ItemFactory.create('weapon', { ...weaponData, id: 'test_salvage' });
    const salvageResult = EnhancementSystem.salvage(salvageItem);
    html += `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px;">
                <h4 style="color: #e74c3c;">Salvage Test:</h4>
                <div style="color: #aaa; font-size: 0.9em;">
                    Materials Gained:<br>
                    ${Object.entries(salvageResult.materials).map(([k, v]) => `• ${k}: ${v}`).join('<br>')}
                </div>
            </div>
        </div>
    `;

    display.innerHTML = html;

    console.log('✨ Enhancement system tested');
}

/**
 * Display item in dev panel
 */
function displayItemInPanel(item) {
    const display = document.getElementById("itemDisplay");
    if (!display) return;

    const html = `
        <div style="display: grid; gap: 15px;">
            <div>
                <h3 style="color: ${item.getRarityColor()}; margin: 0 0 10px 0;">
                    ${item.icon} ${item.name}
                </h3>
                ${TooltipUI.generateTooltip(item)}
            </div>

            <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                <h4 style="color: #4CAF50; margin: 0 0 10px 0;">JSON Data:</h4>
                <pre style="background: #1a1a2a; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 0.85em; color: #ddd; margin: 0;">
${JSON.stringify(item, null, 2)}</pre>
            </div>

            <div style="display: flex; gap: 10px;">
                <button onclick="copyItemJSON('${item.uniqueId}')" style="flex: 1; padding: 10px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                    📋 Copy JSON
                </button>
                <button onclick="testItemMethods('${item.uniqueId}')" style="flex: 1; padding: 10px; background: #9c27b0; border: 1px solid #7b1fa2; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                    🧪 Test Methods
                </button>
            </div>
        </div>
    `;

    display.innerHTML = html;

    // Store item temporarily for access
    window._currentTestItem = item;
}

/**
 * Copy item JSON to clipboard
 */
function copyItemJSON(uniqueId) {
    if (!window._currentTestItem) {
        alert('No item selected');
        return;
    }

    const json = JSON.stringify(window._currentTestItem, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        alert('Item JSON copied to clipboard!');
        console.log('📋 Copied item JSON');
    });
}

/**
 * Test item methods
 */
function testItemMethods(uniqueId) {
    const item = window._currentTestItem;
    if (!item) {
        alert('No item selected');
        return;
    }

    console.group(`🧪 Testing ${item.name}`);

    console.log('Validation:', item.validate() ? '✅ Valid' : '❌ Invalid');
    console.log('Can Stack:', item.canStack());
    console.log('Scaled Value:', item.getScaledValue());
    console.log('Rarity Name:', item.getRarityName());
    console.log('Rarity Color:', item.getRarityColor());

    // Type-specific tests
    if (item.getDamage) console.log('Damage:', item.getDamage());
    if (item.getDPS) console.log('DPS:', item.getDPS());
    if (item.getDefense) console.log('Defense:', item.getDefense());
    if (item.getEfficiency) console.log('Efficiency:', item.getEfficiency());
    if (item.getHealAmount) console.log('Heal Amount:', item.getHealAmount());
    if (item.getEffects) console.log('Effects:', item.getEffects());
    if (item.getModifiers) console.log('Modifiers:', item.getModifiers());

    console.groupEnd();

    alert('Check console for test results!');
}

// =============================================================================
// STATUS EFFECT TESTING
// =============================================================================

/**
 * Apply a status effect to the current enemy (for testing)
 * Usage from console:
 *   testStatusEffect('shocked')
 *   testStatusEffect('burning')
 *   testStatusEffect('poisoned')
 *   testStatusEffect('frozen')
 *   testStatusEffect('bleeding')
 *   testStatusEffect('armor_break')
 */
function testStatusEffect(effectType) {
    if (!GameEngine.state.combat.inCombat) {
        console.warn('⚠️ Not in combat! Start a fight first.');
        return;
    }

    if (!GameEngine.applyStatusEffect) {
        console.error('❌ Status effect system not initialized!');
        return;
    }

    GameEngine.applyStatusEffect(effectType, 'enemy');
    console.log(`✅ Applied ${effectType} to enemy`);
    UICore.update();
}

/**
 * Apply all status effects at once (for testing)
 */
function testAllStatusEffects() {
    if (!GameEngine.state.combat.inCombat) {
        console.warn('⚠️ Not in combat! Start a fight first.');
        return;
    }

    const effects = ['shocked', 'burning', 'poisoned', 'frozen', 'bleeding', 'armor_break'];
    effects.forEach(effect => {
        GameEngine.applyStatusEffect(effect, 'enemy');
    });

    console.log('✅ Applied all status effects to enemy');
    UICore.update();
}

// =============================================================================
// STAT CALCULATOR TESTING
// =============================================================================

/**
 * Test the StatCalculator system
 */
function testStatCalculator() {
    console.log('===== STAT CALCULATOR TEST =====\n');

    if (typeof StatCalculator === 'undefined') {
        console.error('❌ StatCalculator not loaded!');
        return;
    }

    console.log('✅ StatCalculator is loaded\n');

    // Test a few key stats
    const statsToTest = ['attackDamage', 'attackSpeed', 'maxHealth', 'accuracy', 'criticalChance'];

    console.log('Testing stats with current game state:');
    console.log('=====================================\n');

    statsToTest.forEach(stat => {
        const calc = GameEngine.calculateStat(stat);
        console.log(`${stat}:`);
        console.log(`  Final Value: ${calc.formatted}`);
        console.log(`  Layers:`, calc.layers);
        console.log(`  Capped: ${calc.capped}`);
        console.log('');
    });

    console.log('\n===== END TEST =====');
}

/**
 * Run StatCalculator validation tests
 */
function validateStatCalculator() {
    console.log('===== STAT CALCULATOR VALIDATION =====\n');

    if (typeof StatCalculator === 'undefined') {
        console.error('❌ StatCalculator not loaded!');
        return;
    }

    const passed = StatCalculator.testing.validateCalculations();

    if (passed) {
        console.log('\n✅ ALL TESTS PASSED!');
    } else {
        console.error('\n❌ SOME TESTS FAILED! Check output above.');
    }

    console.log('\n===== END VALIDATION =====');
}

/**
 * Benchmark StatCalculator performance
 */
function benchmarkStatCalculator() {
    console.log('===== STAT CALCULATOR BENCHMARK =====\n');

    if (typeof StatCalculator === 'undefined') {
        console.error('❌ StatCalculator not loaded!');
        return;
    }

    const result = StatCalculator.testing.benchmarkPerformance();

    console.log(`Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`Avg Time per Stat: ${result.avgTime.toFixed(4)}ms`);
    console.log(`Calculations per Second: ${result.calculationsPerSecond.toFixed(0)}`);

    console.log('\n===== END BENCHMARK =====');
}

/**
 * Show detailed breakdown for a specific stat
 */
function showStatBreakdown(statName) {
    if (!statName) {
        console.error('❌ Please provide a stat name. Example: showStatBreakdown("attackDamage")');
        return;
    }

    const calc = GameEngine.calculateStat(statName);
    const breakdown = calc.breakdown;

    console.log(`===== ${breakdown.statName.toUpperCase()} BREAKDOWN =====`);
    console.log(`\nFinal Value: ${breakdown.final.formatted}\n`);

    breakdown.layers.forEach(layer => {
        console.log(`${layer.name}:`);
        console.log(`  Value: ${layer.display}`);
        if (layer.details) {
            console.log(`  Details: ${layer.details}`);
        }
        console.log('');
    });

    console.log('===== END BREAKDOWN =====');
}

/**
 * Show debug panel for StatCalculator
 */
function showStatDebugPanel() {
    // Remove existing panel if present
    const existing = document.getElementById('stat-calculator-debug');
    if (existing) {
        existing.remove();
        return;
    }

    if (typeof StatDisplayUI === 'undefined') {
        console.error('❌ StatDisplayUI not loaded!');
        return;
    }

    const panel = StatDisplayUI.createDebugPanel();
    document.body.appendChild(panel);

    console.log('✅ Debug panel opened. Click × to close, or run showStatDebugPanel() again.');
}

/**
 * ENGINEERING SYSTEM GLOBAL HANDLERS
 */

/**
 * Upgrade a workshop
 */
function upgradeWorkshop(skillName) {
    const result = GameEngine.upgradeWorkshop(skillName);
    if (result.success) {
        console.log(`⚙️ Upgraded ${skillName} workshop to Tier ${result.tier}!`);
        UICore.update();
    } else {
        alert(result.reason || 'Cannot upgrade workshop');
    }
}

/**
 * Select an engineering specialization path
 */
function selectEngineeringPath(skillName, pathId) {
    const result = GameEngine.selectEngineeringPath(skillName, pathId);
    if (result.success) {
        console.log(`⚡ Selected ${result.pathName} for ${skillName}!`);
        UICore.update();
    } else {
        alert(result.reason || 'Cannot select path');
    }
}

/**
 * Award engineering tokens (for testing)
 */
function giveEngineeringTokens(amount = 10) {
    GameEngine.awardEngineeringTokens(amount);
    UICore.update();
}

// =============================================================================
// MAP INTERACTION HANDLERS
// =============================================================================

/**
 * Open region modal from map coordinates (called by MapRenderer)
 */
function openRegionModal(regionIdOrQ, r, region) {
    // Handle both old format (q, r, region) and new format (regionId)
    let regionId;
    if (typeof regionIdOrQ === 'string' && regionIdOrQ.startsWith('region_')) {
        // New format: regionId passed directly
        regionId = regionIdOrQ;
    } else {
        // Old format: q, r coordinates
        regionId = `region_${regionIdOrQ}_${r}`;
    }

    // Use new RegionModal system if available
    if (typeof RegionModal !== 'undefined' && RegionModal.open) {
        RegionModal.open(regionId);
    } else {
        // Fallback to old system
        showRegionPopup(regionId);
    }
}

/**
 * Close region summary modal
 */
function closeRegionModal(event) {
    // If clicking outside the modal content, close it
    if (event && event.target.className !== 'modal-overlay') {
        return;
    }

    const modal = document.getElementById('regionModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Travel to a specific region
 * Accepts either (x, y) coordinates or a regionId string
 */
function travelToRegion(xOrRegionId, y) {
    let regionId;

    // Handle both (x, y) and regionId formats
    if (typeof y === 'undefined') {
        // Called with regionId string
        regionId = xOrRegionId;
    } else {
        // Called with x, y coordinates
        regionId = `region_${xOrRegionId}_${y}`;
    }

    // Check if region exists and is accessible
    const regionState = GameEngine.state.regions[regionId];

    if (!regionState || !regionState.discovered) {
        alert('You must discover this region before you can travel to it!');
        return;
    }

    // Check if region is adjacent to current region (optional pathfinding later)
    // For now, allow direct travel to any discovered region
    GameEngine.state.currentRegion = regionId;

    console.log(`🧭 Traveled to region ${regionId}`);

    // Update UI
    UICore.update();

    // Refresh map to show new location
    if (typeof MapRenderer !== 'undefined' && MapRenderer.render) {
        MapRenderer.render();
    }
}

/**
 * Compare old vs new stat calculation systems
 */
function compareStatSystems() {
    console.log('===== OLD VS NEW STAT SYSTEM COMPARISON =====\n');

    const statsToCompare = ['attackDamage', 'maxHealth', 'accuracy', 'criticalChance'];

    console.log('Stat                 | Old System    | New System    | Difference');
    console.log('---------------------|---------------|---------------|------------');

    statsToCompare.forEach(stat => {
        const oldStats = GameEngine.getPlayerCombatStats();
        const newCalc = GameEngine.calculateStat(stat);

        const oldValue = oldStats[stat];
        const newValue = newCalc.final;
        const diff = newValue - oldValue;

        console.log(`${stat.padEnd(20)} | ${String(oldValue).padEnd(13)} | ${String(newValue.toFixed(1)).padEnd(13)} | ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`);
    });

    console.log('\n===== END COMPARISON =====');
}

/**
 * Test stat calculation with hypothetical changes
 */
function testStatWithChanges(statName, changes = {}) {
    if (!statName) {
        console.error('❌ Please provide a stat name.');
        console.log('Example: testStatWithChanges("attackDamage", { combatAttributes: { strength: 20 } })');
        return;
    }

    console.log(`===== TESTING ${statName.toUpperCase()} WITH CHANGES =====\n`);

    // Get current value
    const current = GameEngine.calculateStat(statName);
    console.log(`Current Value: ${current.formatted}`);

    // Build context with changes
    const context = GameEngine.buildStatContext();
    Object.assign(context, changes);

    // Calculate with changes
    const modified = StatCalculator.calculateStat(statName, context);
    console.log(`Modified Value: ${modified.formatted}`);

    const diff = modified.final - current.final;
    console.log(`\nDifference: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`);
    console.log(`Percent Change: ${((diff / current.final) * 100).toFixed(1)}%`);

    console.log('\n===== END TEST =====');
}

// =============================================================================
// WEAPON BUILD MODAL
// =============================================================================

/**
 * Open weapon build modal
 */
function openWeaponBuildModal() {
    const weaponId = GameEngine.state.equipment.weapon;

    if (!weaponId) {
        alert('No weapon equipped! Equip a weapon first.');
        return;
    }

    const weaponDef = ItemAccessHelper.getItem(weaponId);

    // Check if weapon supports attachments (must be a gun-type weapon)
    if (!weaponDef || weaponDef.weaponType !== 'gun') {
        alert('This weapon does not support attachments. Only guns can be customized.');
        return;
    }

    const modal = document.getElementById("weaponBuildModal");

    // Update weapon preview
    document.getElementById("weaponPreviewIcon").textContent = weaponDef.image || '🔫';
    document.getElementById("weaponPreviewName").textContent = weaponDef.name;

    // Render weapon stats
    renderWeaponStats(weaponDef);

    // Render current attachments
    renderWeaponAttachments();

    modal.style.display = "block";
}

/**
 * Close weapon build modal
 */
function closeWeaponBuildModal() {
    const modal = document.getElementById("weaponBuildModal");
    modal.style.display = "none";

    // Close attachment selection if open
    closeAttachmentSelection();
}

/**
 * Render weapon stats in preview panel
 */
function renderWeaponStats(weaponDef) {
    const container = document.getElementById("weaponStatsDisplay");
    if (!container) return;

    const stats = weaponDef.stats || {};

    let html = '';

    if (stats.attackDamage) {
        html += `
            <div class="weapon-stat-row">
                <span class="weapon-stat-label">⚔️ Damage</span>
                <span class="weapon-stat-value">${stats.attackDamage}</span>
            </div>
        `;
    }

    if (stats.attackSpeed) {
        html += `
            <div class="weapon-stat-row">
                <span class="weapon-stat-label">⚡ Attack Speed</span>
                <span class="weapon-stat-value">${stats.attackSpeed.toFixed(2)}/s</span>
            </div>
        `;
    }

    if (stats.accuracy) {
        html += `
            <div class="weapon-stat-row">
                <span class="weapon-stat-label">🎯 Accuracy</span>
                <span class="weapon-stat-value">${stats.accuracy}%</span>
            </div>
        `;
    }

    if (stats.criticalChance) {
        html += `
            <div class="weapon-stat-row">
                <span class="weapon-stat-label">💥 Crit Chance</span>
                <span class="weapon-stat-value">${stats.criticalChance}%</span>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Render current weapon attachments
 */
function renderWeaponAttachments() {
    // Initialize weapon attachments if not exist
    if (!GameEngine.state.weaponAttachments) {
        GameEngine.state.weaponAttachments = {
            scope: null,
            barrel: null,
            magazine: null,
            stock: null,
            grip: null,
            muzzle: null
        };
    }

    const attachments = GameEngine.state.weaponAttachments;
    const attachmentSlots = ['scope', 'barrel', 'magazine', 'stock', 'grip', 'muzzle'];

    for (let slot of attachmentSlots) {
        const contentDiv = document.getElementById(`attachmentContent_${slot}`);
        if (!contentDiv) continue;

        const attachmentId = attachments[slot];

        if (attachmentId) {
            const attachmentDef = ItemAccessHelper.getItem(attachmentId);
            if (attachmentDef) {
                contentDiv.innerHTML = `
                    <div class="attachment-item">
                        <div class="attachment-item-icon">${attachmentDef.image}</div>
                        <div class="attachment-item-name">${attachmentDef.name}</div>
                    </div>
                `;
            }
        } else {
            contentDiv.innerHTML = '<div class="attachment-empty">Click to attach</div>';
        }
    }
}

/**
 * Open attachment selection for a specific slot
 */
function openAttachmentSelection(slot) {
    const panel = document.getElementById("attachmentSelectionPanel");
    const titleEl = document.getElementById("attachmentSelectionTitle");
    const gridEl = document.getElementById("attachmentSelectionGrid");

    // Update title
    const slotNames = {
        scope: '🔭 Scope',
        barrel: '🔩 Barrel',
        magazine: '📋 Magazine',
        stock: '📏 Stock',
        grip: '✊ Grip',
        muzzle: '💨 Muzzle'
    };
    titleEl.textContent = `Select ${slotNames[slot]}`;

    // Get available attachments for this slot type
    const availableAttachments = getAvailableAttachments(slot);

    // Render attachment options
    let html = '';

    // Add "Remove" option if something is attached
    if (GameEngine.state.weaponAttachments && GameEngine.state.weaponAttachments[slot]) {
        html += `
            <div class="attachment-option" onclick="attachAttachment('${slot}', null)">
                <div class="attachment-option-icon">❌</div>
                <div class="attachment-option-name">Remove</div>
            </div>
        `;
    }

    // Add available attachments
    for (let attachment of availableAttachments) {
        html += `
            <div class="attachment-option" onclick="attachAttachment('${slot}', '${attachment.id}')">
                <div class="attachment-option-icon">${attachment.image}</div>
                <div class="attachment-option-name">${attachment.name}</div>
            </div>
        `;
    }

    if (availableAttachments.length === 0 && (!GameEngine.state.weaponAttachments || !GameEngine.state.weaponAttachments[slot])) {
        html = '<div style="text-align: center; padding: 20px; color: #888;">No attachments available for this slot.</div>';
    }

    gridEl.innerHTML = html;
    panel.style.display = "block";

    // Store current slot
    panel.dataset.currentSlot = slot;
}

/**
 * Close attachment selection panel
 */
function closeAttachmentSelection() {
    const panel = document.getElementById("attachmentSelectionPanel");
    panel.style.display = "none";
}

/**
 * Get available attachments for a slot type from player's bank
 */
function getAvailableAttachments(slotType) {
    const bankItems = GameEngine.state.bank.items;
    const available = [];

    for (let itemId in bankItems) {
        const def = ItemAccessHelper.getItem(itemId);

        // Check if item is an attachment for this slot
        if (def && def.itemType === 'attachment' && def.attachmentSlot === slotType && bankItems[itemId].quantity > 0) {
            available.push({
                id: itemId,
                name: def.name,
                image: def.image || '🔧'
            });
        }
    }

    return available;
}

/**
 * Attach an attachment to a weapon slot
 */
function attachAttachment(slot, attachmentId) {
    // Initialize if needed
    if (!GameEngine.state.weaponAttachments) {
        GameEngine.state.weaponAttachments = {
            scope: null,
            barrel: null,
            magazine: null,
            stock: null,
            grip: null,
            muzzle: null
        };
    }

    // Set the attachment (null removes it)
    GameEngine.state.weaponAttachments[slot] = attachmentId;

    // Re-render attachments
    renderWeaponAttachments();

    // Update weapon stats
    const weaponId = GameEngine.state.equipment.weapon;
    const weaponDef = ItemAccessHelper.getItem(weaponId);
    renderWeaponStats(weaponDef);

    // Close selection panel
    closeAttachmentSelection();

    // Force equipment UI update
    EquipmentUI.lastEquipmentState = null;
    EquipmentUI.updateEquipment();

    console.log(`⚙️ ${attachmentId ? 'Attached' : 'Removed'} attachment in ${slot} slot`);
}

// =============================================================================
// COMBAT UI HANDLERS
// =============================================================================

/**
 * Toggle combat log visibility (collapsible)
 */
function toggleCombatLog() {
    const log = document.getElementById('combatLog');
    const toggle = document.getElementById('combatLogToggle');

    if (!log || !toggle) return;

    if (log.classList.contains('expanded')) {
        log.classList.remove('expanded');
        log.classList.add('collapsed');
        toggle.textContent = '▶';
    } else {
        log.classList.remove('collapsed');
        log.classList.add('expanded');
        toggle.textContent = '▼';
    }
}

/**
 * Toggle mobile column visibility (for mobile tabs)
 * @param {string} column - 'left', 'center', or 'right'
 */
function toggleMobileColumn(column) {
    // Only applies on mobile (<768px)
    if (window.innerWidth > 768) return;

    const leftCol = document.getElementById('combatColumnLeft');
    const centerCol = document.getElementById('combatColumnCenter');
    const rightCol = document.getElementById('combatColumnRight');

    if (!leftCol || !centerCol || !rightCol) return;

    // Remove active class from all
    leftCol.classList.remove('active');
    centerCol.classList.remove('active');
    rightCol.classList.remove('active');

    // Add active class to selected column
    if (column === 'left') {
        leftCol.classList.add('active');
    } else if (column === 'center') {
        centerCol.classList.add('active');
    } else if (column === 'right') {
        rightCol.classList.add('active');
    }

    // Update tab active states
    const tabs = document.querySelectorAll('.combat-mobile-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Find and activate the corresponding tab
    tabs.forEach((tab, index) => {
        if ((column === 'left' && index === 0) ||
            (column === 'center' && index === 1) ||
            (column === 'right' && index === 2)) {
            tab.classList.add('active');
        }
    });
}

// =================================================================
// DEVELOPER FUNCTIONS
// =================================================================

/**
 * DEV: Spawn navigation resources (food and logs) for testing
 * Call from console: spawnNavResources()
 */
function spawnNavResources() {
    if (!GameEngine || !GameEngine.state) {
        console.error("❌ GameEngine not available");
        return;
    }

    // Add 9999 Light Rations to bank
    if (!GameEngine.state.bank.items['lightRations']) {
        GameEngine.state.bank.items['lightRations'] = {
            itemId: 'lightRations',
            quantity: 0
        };
    }
    GameEngine.state.bank.items['lightRations'].quantity += 9999;

    // Add 9999 Pinewood to bank
    if (!GameEngine.state.bank.items['pinewood']) {
        GameEngine.state.bank.items['pinewood'] = {
            itemId: 'pinewood',
            quantity: 0
        };
    }
    GameEngine.state.bank.items['pinewood'].quantity += 9999;

    // Equip Light Rations in food slot
    if (!GameEngine.state.equipment) {
        GameEngine.state.equipment = {};
    }
    GameEngine.state.equipment.food = {
        itemId: 'lightRations'
    };

    console.log("✅ Spawned navigation resources:");
    console.log("   🍖 Light Rations: 9999 (equipped in food slot)");
    console.log("   🪵 Pinewood: 9999");
    console.log("   You can now navigate/explore regions!");

    // Update UI
    if (typeof UI !== 'undefined' && UI.updateAll) {
        UI.updateAll();
    }
}

// =============================================================================
// EVENT DELEGATION SYSTEM
// =============================================================================

/**
 * Global Event Delegation Handler
 *
 * Provides a modern event delegation layer that can eventually replace inline
 * onclick handlers. Uses data attributes to route events to appropriate handlers.
 *
 * Usage in HTML:
 *   <button data-action="switchView" data-view="skills">Skills</button>
 *   <button data-action="startNavigation">Explore</button>
 */
const GlobalEventDelegation = {
    /**
     * Initialize event delegation
     */
    init() {
        // Global click handler using event delegation
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const handler = this.handlers[action];

            if (handler) {
                handler.call(this, target, e);
            } else {
                console.warn(`No handler found for action: ${action}`);
            }
        });

        console.log('✅ Global event delegation initialized');
    },

    /**
     * Action handlers mapped by data-action value
     */
    handlers: {
        // Game Management
        'save-game'() {
            if (typeof saveGame === 'function') {
                saveGame();
            }
        },

        'reset-game'() {
            if (typeof resetGame === 'function') {
                resetGame();
            }
        },

        'toggle-dev-modal'() {
            if (typeof toggleDevModal === 'function') {
                toggleDevModal();
            }
        },

        'toggle-dev-modal-if-overlay'(target, event) {
            if (event.target === target && typeof toggleDevModal === 'function') {
                toggleDevModal();
            }
        },

        // View switching
        'switch-view'(target) {
            const viewName = target.dataset.view;
            if (viewName && typeof UICore !== 'undefined') {
                UICore.switchView(viewName);
            }
        },

        switchView(target) {
            const viewName = target.dataset.view;
            if (viewName && typeof UICore !== 'undefined') {
                UICore.switchView(viewName);
            }
        },

        // Navigation
        startNavigation() {
            if (typeof startNavigating === 'function') {
                startNavigating();
            }
        },

        stopNavigation() {
            if (typeof stopNavigating === 'function') {
                stopNavigating();
            }
        },

        travelToRegion(target) {
            const regionId = target.dataset.regionId;
            if (regionId && typeof travelToRegion === 'function') {
                travelToRegion(regionId);
            }
        },

        // Gathering
        startGathering(target) {
            const skill = target.dataset.skill;
            const nodeId = target.dataset.nodeId;
            if (skill && nodeId && typeof GameEngine !== 'undefined') {
                // Use NEW GatheringSystem (simpler, cleaner)
                GameEngine.startGathering(skill, nodeId);
            }
        },

        stopGathering() {
            if (typeof GameEngine !== 'undefined') {
                // Use NEW GatheringSystem
                GameEngine.stopGathering();
            }
        },

        // Attributes
        assignPoint(target) {
            const attributeId = target.dataset.attributeId;
            if (attributeId && typeof assignPoint === 'function') {
                assignPoint(attributeId);
            }
        },

        // Bank
        switchBankTab(target) {
            const tabId = target.dataset.tabId;
            if (tabId && typeof switchBankTab === 'function') {
                switchBankTab(tabId);
            }
        },

        // Equipment
        openEquipModal(target) {
            const slot = target.dataset.slot;
            if (slot && typeof openEquipModal === 'function') {
                openEquipModal(slot);
            }
        },

        equipItem(target) {
            const itemId = target.dataset.itemId;
            const slot = target.dataset.slot;
            if (itemId && slot && typeof equipFromModal === 'function') {
                equipFromModal(itemId, slot);
            }
        },

        unequipItem(target, event) {
            const slot = target.dataset.slot;
            if (slot && typeof unequipItem === 'function') {
                unequipItem(slot, event);
            }
        },

        // Combat
        startFight(target) {
            const enemyId = target.dataset.enemyId;
            if (enemyId && typeof startFight === 'function') {
                startFight(enemyId);
            }
        },

        attack() {
            if (typeof attack === 'function') {
                attack();
            }
        },

        flee() {
            if (typeof flee === 'function') {
                flee();
            }
        },

        // Crafting
        startCrafting(target) {
            const recipeId = target.dataset.recipeId;
            if (recipeId && typeof startCrafting === 'function') {
                startCrafting(recipeId);
            }
        },

        // Missions
        acceptMission(target) {
            const missionId = target.dataset.missionId;
            if (missionId && typeof acceptMission === 'function') {
                acceptMission(missionId);
            }
        },

        completeMission(target) {
            const missionId = target.dataset.missionId;
            if (missionId && typeof completeMission === 'function') {
                completeMission(missionId);
            }
        },

        // Modals
        closeModal(target) {
            const modalId = target.dataset.modalId;
            if (modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        },

        'close-equip-modal'() {
            if (typeof closeEquipModal === 'function') {
                closeEquipModal();
            }
        },

        'close-weapon-build-modal'() {
            if (typeof closeWeaponBuildModal === 'function') {
                closeWeaponBuildModal();
            }
        },

        'open-attachment-selection'(target) {
            const attachmentType = target.dataset.attachmentType;
            if (attachmentType && typeof openAttachmentSelection === 'function') {
                openAttachmentSelection(attachmentType);
            }
        },

        'close-attachment-selection'() {
            if (typeof closeAttachmentSelection === 'function') {
                closeAttachmentSelection();
            }
        },

        'close-region-popup-if-overlay'(target, event) {
            if (event.target === target && typeof closeRegionPopup === 'function') {
                closeRegionPopup();
            }
        },

        'close-region-modal-if-overlay'(target, event) {
            if (event.target === target && typeof RegionModal !== 'undefined' && RegionModal.close) {
                RegionModal.close();
            }
        },

        'close-item-modal-if-overlay'(target, event) {
            if (event.target === target && typeof ItemModal !== 'undefined' && ItemModal.close) {
                ItemModal.close();
            }
        },

        'close-item-modal'() {
            if (typeof ItemModal !== 'undefined' && ItemModal.close) {
                ItemModal.close();
            }
        },

        // Debug Tools
        'debug-add-gold'() {
            if (typeof debug !== 'undefined' && debug.addGold) {
                debug.addGold();
            }
        },

        'debug-add-medals'() {
            if (typeof debug !== 'undefined' && debug.addMedals) {
                debug.addMedals();
            }
        },

        'debug-add-levels'() {
            if (typeof debug !== 'undefined' && debug.addLevels) {
                debug.addLevels();
            }
        },

        'debug-reset-level'() {
            if (typeof debug !== 'undefined' && debug.resetLevel) {
                debug.resetLevel();
            }
        },

        'debug-add-ore'() {
            if (typeof debug !== 'undefined' && debug.addOre) {
                debug.addOre();
            }
        },

        'debug-add-wood'() {
            if (typeof debug !== 'undefined' && debug.addWood) {
                debug.addWood();
            }
        },

        'debug-skip-time'() {
            if (typeof debug !== 'undefined' && debug.skipTime) {
                debug.skipTime();
            }
        },

        'debug-unlock-all'() {
            if (typeof debug !== 'undefined' && debug.unlockAll) {
                debug.unlockAll();
            }
        },

        'debug-max-upgrades'() {
            if (typeof debug !== 'undefined' && debug.maxUpgrades) {
                debug.maxUpgrades();
            }
        },

        'debug-max-skills'() {
            if (typeof debug !== 'undefined' && debug.maxSkills) {
                debug.maxSkills();
            }
        },

        'debug-add-random-item'() {
            if (typeof debug !== 'undefined' && debug.addRandomItem) {
                debug.addRandomItem();
            }
        },

        'debug-fill-bank'() {
            if (typeof debug !== 'undefined' && debug.fillBank) {
                debug.fillBank();
            }
        },

        'debug-add-equipment'() {
            if (typeof debug !== 'undefined' && debug.addEquipment) {
                debug.addEquipment();
            }
        },

        'debug-add-starter-set'() {
            if (typeof debug !== 'undefined' && debug.addStarterSet) {
                debug.addStarterSet();
            }
        },

        'debug-heal-player'() {
            if (typeof debug !== 'undefined' && debug.healPlayer) {
                debug.healPlayer();
            }
        },

        'debug-add-attribute-points'() {
            if (typeof debug !== 'undefined' && debug.addAttributePoints) {
                debug.addAttributePoints();
            }
        },

        'debug-fully-explore-region'() {
            if (typeof debug !== 'undefined' && debug.fullyExploreRegion) {
                debug.fullyExploreRegion();
            }
        },

        'debug-check-crafting-state'() {
            if (typeof debug !== 'undefined' && debug.checkCraftingState) {
                debug.checkCraftingState();
            }
        },

        'debug-add-crafting-materials'() {
            if (typeof debug !== 'undefined' && debug.addCraftingMaterials) {
                debug.addCraftingMaterials();
            }
        },

        'debug-add-comprehensive-items'() {
            if (typeof debug !== 'undefined' && debug.addComprehensiveItems) {
                debug.addComprehensiveItems();
            }
        },

        'debug-test-unlimited-bank'() {
            if (typeof debug !== 'undefined' && debug.testUnlimitedBank) {
                debug.testUnlimitedBank();
            }
        }
    }
};

// Auto-initialize event delegation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        GlobalEventDelegation.init();
    });
} else {
    // DOM already loaded
    GlobalEventDelegation.init();
}
