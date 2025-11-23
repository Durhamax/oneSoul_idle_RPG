# Dual-Bank Migration Test Plan

## Overview
This test plan will verify that the dual-bank migration works correctly and that all bank operations function as expected.

## Pre-Test Checklist
- [ ] All Phase 4 inventory system updates are complete
- [ ] Migration is re-enabled in migrationSystem.js
- [ ] You have a backup of your save file (just in case)

## Test Sequence

### Test 1: Fresh Page Load (Migration Test)
**Goal**: Verify migration runs automatically and items appear in UI

1. Open the game in browser
2. Check console for migration message:
   ```
   ✅ Migrated X items to dual-bank structure
   📦 Stackable items: X
   ⚔️ Instanced items: X
   ```
3. Open Bank UI
4. Verify all items are visible in their correct tabs
5. Check that item counts match what you had before

**Expected Result**: All items visible, no errors

---

### Test 2: Inspect Dual-Bank Structure
**Goal**: Verify migration created correct dual-bank structure

Run in console:
```javascript
console.log('Stackable items:', GameEngine.state.bank.stackable);
console.log('Instanced items:', GameEngine.state.bank.instanced);
console.log('Total stackable types:', Object.keys(GameEngine.state.bank.stackable || {}).length);
console.log('Total instanced items:', Object.keys(GameEngine.state.bank.instanced || {}).length);
```

**Expected Result**:
- Stackable contains resources/materials with simple numbers
- Instanced contains weapons/armor/tools with full objects

---

### Test 3: Add Stackable Item
**Goal**: Verify adding stackable items works

1. Gather some resources (wood, ore, etc.)
2. Check console for: `✨ New item discovered: [Item Name]!` (if new)
3. Open Bank UI and verify item appears
4. Run in console:
```javascript
GameEngine.addItemToBank('pinewood', 500);
console.log('Pinewood count:', GameEngine.getItemCount('pinewood'));
```

**Expected Result**: Item count increases, UI updates instantly

---

### Test 4: Remove Stackable Item
**Goal**: Verify removing stackable items works

Run in console:
```javascript
const before = GameEngine.getItemCount('pinewood');
GameEngine.removeItemFromBank('pinewood', 100);
const after = GameEngine.getItemCount('pinewood');
console.log('Before:', before, 'After:', after, 'Difference:', before - after);
```

**Expected Result**: Count decreases by 100, UI updates

---

### Test 5: Craft Equipment (Instance Creation)
**Goal**: Verify instanced items are created correctly

1. Open Crafting UI
2. Craft a weapon or tool
3. Check console for: `✨ Added equipment instance: [Item Name] ([instanceId])`
4. Open Bank UI → Check weapon/tool tab
5. Verify item appears with unique instance

Run in console:
```javascript
const instances = GameEngine.getAllEquipmentInstances();
console.table(instances.map(i => ({
    id: i.instanceId,
    base: i.baseItemId,
    rarity: i.rarity
})));
```

**Expected Result**: New instance appears with unique ID

---

### Test 6: Equip/Unequip Instanced Item
**Goal**: Verify equipment system works with instanced items

1. Open Equipment UI
2. Click an equipment slot
3. Select an instanced item from bank
4. Verify it equips correctly
5. Unequip it
6. Verify it returns to bank

**Expected Result**: Item moves between equipment and bank seamlessly

---

### Test 7: Run Comprehensive Operations Test
**Goal**: Test all bank operations systematically

Copy/paste the contents of `test-dual-bank-operations.js` into console.

**Expected Result**: All 8 tests pass without errors

---

### Test 8: Save and Reload
**Goal**: Verify dual-bank structure persists correctly

1. Play for a bit, add/remove items
2. Note your current item counts
3. Save the game (it auto-saves, but you can force it)
4. Reload the page
5. Verify all items are still there
6. Run in console:
```javascript
console.log('Migration ran:', GameEngine.state.migrations?.migrateDualBankStructure || false);
```

**Expected Result**:
- Migration should NOT run again (already migrated)
- All items persist correctly

---

### Test 9: Check UI Responsiveness
**Goal**: Verify UI updates instantly with EventBus

1. Open Bank UI
2. Run in console:
```javascript
GameEngine.addItemToBank('pinewood', 1000);
```
3. Watch the UI - it should update WITHOUT manually switching tabs

**Expected Result**: UI updates instantly without refresh

---

### Test 10: Check Bank Statistics
**Goal**: Verify bank stats calculate from dual-bank

1. Open Bank UI
2. Check the stats at top:
   - Total Items: [should show correct type count]
   - Total Quantity: [should show sum of stackable + instance count]
3. Run in console:
```javascript
const stackableTypes = Object.keys(GameEngine.state.bank.stackable || {}).length;
const stackableQty = Object.values(GameEngine.state.bank.stackable || {}).reduce((sum, qty) => sum + qty, 0);
const instancedTypes = Object.keys(GameEngine.state.bank.instanced || {}).length;
console.log('Stackable types:', stackableTypes);
console.log('Stackable quantity:', stackableQty);
console.log('Instanced types:', instancedTypes);
console.log('Total:', stackableTypes + instancedTypes, 'types,', stackableQty + instancedTypes, 'items');
```

**Expected Result**: UI stats match console output

---

## Troubleshooting

### Issue: Migration ran but items not visible
**Cause**: UI might not be reading from dual-bank yet
**Fix**: Check that `getItemsInTab()` is updated (it should be)

### Issue: "Item not found in registry" warnings
**Cause**: Item ID mismatch between save and definitions
**Fix**: Check that all items in your save exist in ItemRegistry

### Issue: Duplicate items (in both old and new storage)
**Cause**: Backward compatibility keeping old structure
**Fix**: This is expected during transition - old structure will be removed in Phase 5

### Issue: Migration runs every reload
**Cause**: Migration flag not being set
**Fix**: Check `GameEngine.state.migrations.migrateDualBankStructure`

---

## Success Criteria

✅ Migration runs once on first load
✅ All items visible in Bank UI
✅ Stackable items stored as simple numbers
✅ Instanced items stored as full objects
✅ Adding/removing items works correctly
✅ Crafting creates unique instances
✅ Equipment system works with instances
✅ Save/load preserves dual-bank structure
✅ UI updates instantly via EventBus
✅ Bank statistics calculate correctly

---

## After Testing

If all tests pass:
1. Mark Phase 4 as complete ✅
2. Begin Phase 5: Update other game systems
   - Crafting system
   - Combat system (loot)
   - Gathering systems
   - Equipment system
   - Any other systems accessing bank directly

If tests fail:
1. Note which test failed
2. Check console for errors
3. Review the relevant function in inventorySystem.js
4. Fix and re-test
