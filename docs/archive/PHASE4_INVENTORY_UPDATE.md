# Phase 4: Inventory System Update for Dual-Bank

## Overview
Updated the entire inventory system to use the dual-bank storage architecture, which separates stackable items (simple quantities) from instanced items (unique objects with properties).

## Changes Made

### 1. `src/systems/inventorySystem.js`

#### Updated Functions:

**`addItemToBank(itemId, quantity, tab)`** (lines 48-135)
- Checks if item is stackable or instanced using `itemDef.instanced` property
- Routes stackable items to `DualBankSystem.addStackable()`
- Rejects instanced items with helpful error message directing to `addEquipmentInstance()`
- Maintains backward compatibility by syncing old `bank.items` structure
- Emits EventBus events for instant UI updates

**`removeItemFromBank(itemId, quantity)`** (lines 150-256)
- Checks both `bank.stackable` and `bank.instanced` storage
- For stackable items: Uses `DualBankSystem.removeStackable()`
- For instanced items: Uses `DualBankSystem.removeInstance()` (only allows quantity of 1)
- Falls back to old `bank.items` for backward compatibility
- Syncs old structure and emits events

**`getItemCount(itemId)`** (lines 142-158)
- Checks `bank.stackable` first for stackable items
- Returns 1 for instanced items (instances are always quantity 1)
- Falls back to old `bank.items` for backward compatibility

**`getItemsInTab(tabId)`** (lines 238-329)
- Completely rewritten to read from both storages:
  - Iterates through `bank.stackable` for stackable items
  - Iterates through `bank.instanced` for instanced items
- Returns proper item structure for UI rendering:
  - For stackable: `{ itemId, quantity, tab, definition, isNew }`
  - For instanced: `{ itemId (unique), baseItemId, quantity: 1, tab, definition, instance, isNew }`
- Uses `_getTabForItem()` helper to determine correct tab

**`addEquipmentInstance(instance)`** (lines 453-498)
- Uses `DualBankSystem.addInstance()` to add to instanced storage
- Syncs old `bank.equipmentInstances` for backward compatibility
- Tracks as new item
- Shows notification and emits events

**`getEquipmentInstance(instanceId)`** (lines 505-515)
- Uses `DualBankSystem.getInstance()` first
- Falls back to old `bank.equipmentInstances`

**`removeEquipmentInstance(instanceId)`** (lines 522-539)
- Uses `DualBankSystem.removeInstance()`
- Syncs old `bank.equipmentInstances`

**`getAllEquipmentInstances(baseItemId)`** (lines 546-568)
- Uses `DualBankSystem.getInstancesByBaseId()` when baseItemId provided
- Otherwise iterates through `bank.instanced`
- Merges with old storage for backward compatibility

#### New Helper Function:

**`_getTabForItem(itemId, itemDef)`** (lines 293-329)
- Determines which tab an item belongs to
- Checks old `bank.items` for explicit tab assignment first
- Then determines based on slot and category:
  - `tool` slot → 'tool' tab
  - `weapon` slot → 'weapon' tab
  - `head/body/legs/feet/hands/offhand/accessory` slots → 'armor' tab
  - `attachment` slot → 'mod' tab
  - `consumable` category → 'consumable' or 'healing' tab
  - `material` category → 'resource' tab
  - Default → 'resource' tab

### 2. `src/ui/equipmentUI.js`

**`updateBankStats()`** (lines 68-102)
- Updated to calculate from dual-bank:
  - Counts stackable types and total quantity
  - Counts instanced types (each counts as 1)
  - Shows combined totals in UI

## Backward Compatibility

All functions maintain backward compatibility during the transition:

1. **Old `bank.items` structure** is still synced for systems not yet updated
2. **Old `bank.equipmentInstances`** is still synced
3. **Fallback reads** from old structures if dual-bank is empty
4. **Graceful degradation** if DualBankSystem is not available

## Testing

Run the test script to verify all operations:
```javascript
// In console:
// Copy/paste contents of test-dual-bank-operations.js
```

Tests include:
1. Add stackable item
2. Remove stackable item
3. Add equipment instance
4. Get items in tab
5. Get all equipment instances
6. Remove equipment instance
7. Verify dual-bank structure
8. Attempt to add instanced item via wrong function (should fail gracefully)

## Next Steps

1. ✅ All core inventory functions updated
2. **TODO**: Re-enable migration in `migrationSystem.js`
3. **TODO**: Test full migration flow
4. **TODO**: Update other game systems that directly access `bank.items`:
   - Crafting system
   - Combat system (loot drops)
   - Equipment system
   - Gathering/harvesting systems
   - Any other systems that read/write to bank

## Architecture Notes

**Dual-Bank Structure:**
```javascript
GameEngine.state.bank = {
  // Old structure (being phased out)
  items: { 'pinewood': { quantity: 1000, tab: 'resource' } },
  equipmentInstances: { 'testRifle_instance_123': { ... } },

  // New dual-bank structure
  stackable: {
    'pinewood': 3000443,  // Simple numbers
    'ironOre': 12500
  },
  instanced: {
    'testRifle_instance_123': {  // Full objects
      instanceId: 'testRifle_instance_123',
      baseItemId: 'testRifle',
      rarity: 'uncommon',
      attachments: [...],
      durability: 95,
      maxDurability: 100
    }
  },

  // Shared metadata
  newItems: ['pinewood', 'testRifle_instance_123'],
  tabs: { ... },
  activeTab: 'resource'
}
```

**Item Definition Property:**
```javascript
{
  id: 'pinewood',
  name: 'Pinewood',
  instanced: false  // <-- This determines storage type
}

{
  id: 'testRifle',
  name: 'Test Rifle',
  instanced: true  // <-- Instanced items get unique IDs and full objects
}
```

## Status

✅ **Phase 4 Complete** - All inventory system functions updated to use dual-bank
⏳ **Next**: Re-enable migration and test full flow
