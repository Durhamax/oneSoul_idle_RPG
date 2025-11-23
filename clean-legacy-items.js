/**
 * CLEAN ALL WEAPONS FROM SAVE
 *
 * Removes ALL weapons and attachments from save data
 */

// Run this in browser console
function cleanLegacyItems() {
    if (!GameEngine?.state?.bank?.items) {
        console.error('GameEngine not loaded');
        return;
    }

    console.log('🧹 Starting weapon cleanup...');

    // Find ALL items with weapon-related properties
    const bank = GameEngine.state.bank.items;
    const weaponsToRemove = [];

    // Scan all bank items
    for (const itemId in bank) {
        const bankItem = bank[itemId];

        // Check if item has weapon-related properties
        if (bankItem.baseItemId || bankItem.instanceId || bankItem.attachments) {
            weaponsToRemove.push(itemId);
            continue;
        }

        // Try to get item definition
        const itemDef = ItemRegistry?.getItem(itemId);
        if (!itemDef) {
            // Item has no definition - mark for removal
            weaponsToRemove.push(itemId);
            console.log(`  🗑️ Marked for removal (no definition): ${itemId}`);
            continue;
        }

        // Check if it's a weapon or attachment
        if (itemDef.equipSlot === 'weapon' ||
            itemDef.category === 'weapon' ||
            itemDef.attachmentSlot ||
            itemDef.itemType === 'attachment') {
            weaponsToRemove.push(itemId);
            console.log(`  🗑️ Marked for removal (weapon/attachment): ${itemId}`);
        }
    }

    // Also add known legacy items that might not be in bank yet
    const knownLegacyItems = [
        // Old test items
        'huntsmanRifle',
        'huntsman_40',
        'test_pistol',
        'redDotSight',
        'holographicSight',
        'telescopicScope',
        'rifledBarrel',
        'heavyBarrel',
        'extendedMag',
        'quickReloadMag',
        'tacticalStock',
        'precisionStock',
        'verticalGrip',
        'angledGrip',
        // All test attachments
        'test_scope_common',
        'test_scope_rare',
        'test_scope_legendary',
        'test_barrel_common',
        'test_barrel_epic',
        'test_magazine_uncommon',
        'test_magazine_mythic',
        'test_stock_rare',
        'test_stock_divine',
        'test_grip_common',
        'test_grip_transcendent',
        'test_muzzle_uncommon',
        'test_muzzle_creator',
        'test_underbarrel_rare',
        'test_underbarrel_legendary',
        'test_tactical_epic',
        'test_tactical_mythic',
        // Old weapons from definitions.js
        'dagger',
        'ironSword',
        'steelSword',
        'shortBow',
        'longBow',
        'pipe_weapon',
        'stun_baton',
        'crowbar_weapon',
        'broadsword',
        'katana',
        'longsword',
        'battleaxe',
        'mace_iron',
        'warhammer',
        'spear_wooden',
        'spear_iron',
        'halberd',
        'crossbow_light',
        'crossbow_heavy',
        'pistol_basic',
        'rifle_hunting',
        'dragons_fang_sword',
        'frost_staff'
    ];

    // Combine both lists
    knownLegacyItems.forEach(item => {
        if (!weaponsToRemove.includes(item)) {
            weaponsToRemove.push(item);
        }
    });

    console.log(`\n📊 Found ${weaponsToRemove.length} weapons/attachments to remove`);

    // Remove all weapons
    let removed = 0;
    weaponsToRemove.forEach(itemId => {
        if (bank[itemId]) {
            delete bank[itemId];
            removed++;
            console.log(`  ✅ Removed: ${itemId}`);
        }
    });

    console.log(`\n🧹 Cleanup complete: ${removed} items removed from bank`);

    // Also clean equipped weapons
    if (GameEngine?.state?.equipment) {
        if (GameEngine.state.equipment.weapon) {
            console.log(`  ✅ Unequipped weapon: ${GameEngine.state.equipment.weapon}`);
            GameEngine.state.equipment.weapon = null;
        }
    }

    // Update UI
    if (typeof UICore !== 'undefined') {
        UICore.update();
    }

    // Save the cleaned state
    if (typeof SaveSystem !== 'undefined' && SaveSystem.save) {
        SaveSystem.save();
        console.log(`  💾 Saved cleaned state`);
    }
}

// Auto-run
if (typeof GameEngine !== 'undefined') {
    cleanLegacyItems();
} else {
    console.log('⏳ Waiting for GameEngine to load...');
    setTimeout(() => {
        if (typeof GameEngine !== 'undefined') {
            cleanLegacyItems();
        }
    }, 1000);
}
