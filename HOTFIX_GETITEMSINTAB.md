# Hotfix: _getTabForItem Reference Error

## Issue
After page reload, the game crashed with:
```
Uncaught TypeError: this._getTabForItem is not a function
```

## Root Cause
The `getItemsInTab()` function was calling `this._getTabForItem()`, but:
1. `getItemsInTab()` is bound to `GameEngine` during initialization (`.bind(engine)`)
2. So `this` refers to `GameEngine`, not `InventorySystem`
3. `GameEngine` doesn't have the `_getTabForItem` helper method

## Fix Applied

### File: `src/systems/inventorySystem.js`

Changed all calls from:
```javascript
this._getTabForItem(itemId, itemDef)
```

To:
```javascript
InventorySystem._getTabForItem.call(this, itemId, itemDef)
```

This explicitly calls the function from `InventorySystem` while maintaining the correct `this` context.

**Lines changed:**
- Line 64: `addItemToBank()` - tab determination
- Line 334: `getItemsInTab()` - stackable item tab
- Line 355: `getItemsInTab()` - instanced item tab

### File: `src/data/items/itemRegistry_NEW.js`

Added missing schema fields to eliminate warnings:
```javascript
// DUAL-BANK: Instance management
'instanced', 'iconPath', 'modType', 'modStat', 'bonusValue', 'bonusStat',
```

**Line changed:**
- Line 70: Added to optional schema fields

## Test Results
After fix:
- ✅ Game loads without errors
- ✅ Bank UI displays items correctly
- ✅ No schema validation warnings for `instanced` field
- ✅ Dual-bank structure accessible

## Status
**FIXED** - Ready for testing
