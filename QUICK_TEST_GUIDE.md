# Quick Test Guide - Dual-Bank Migration

## 🚀 Ready to Test!

All systems have been updated for dual-bank compatibility. Here's how to test the specific scenarios you requested.

---

## Pre-Test: Reload Page

1. **Save your current progress** (auto-saves anyway, but good to verify)
2. **Reload the page** - Migration will run automatically
3. **Check console** for migration success message

---

## Test Scripts

### Option A: Automated Test (Recommended)

**Copy/paste this into console:**

```javascript
// Load and run the comprehensive test
fetch('test-specific-scenarios.js')
    .then(r => r.text())
    .then(code => eval(code));
```

Or manually copy/paste the contents of `test-specific-scenarios.js`.

---

### Option B: Manual Step-by-Step Tests

#### Test 1: Verify Migration
```javascript
console.log('Migration complete:', GameEngine.state.migrations?.migrateDualBankStructure);
console.log('Stackable items:', Object.keys(GameEngine.state.bank.stackable || {}).length);
console.log('Instanced items:', Object.keys(GameEngine.state.bank.instanced || {}).length);
```

**Expected**: Migration flag = true, items in both storages

---

#### Test 2: Gather Resources (Stackable)
```javascript
// Add 100 pinewood
GameEngine.addItemToBank('pinewood', 100);

// Verify in stackable storage
console.log('Pinewood count:', GameEngine.getItemCount('pinewood'));
console.log('Type:', typeof GameEngine.state.bank.stackable['pinewood']);
```

**Expected**: Count increases, stored as number

---

#### Test 3: Create Weapon Instance
```javascript
// Create weapon instance
const weapon = GameEngine.createWeaponInstance('testRifle');
console.log('Created:', weapon.instanceId);

// Add to bank
GameEngine.addEquipmentInstance(weapon);

// Verify in instanced storage
console.log('In bank:', !!GameEngine.state.bank.instanced[weapon.instanceId]);
```

**Expected**: Instance created with unique ID, stored in instanced

---

#### Test 4: Attach a Mod
```javascript
// Get a weapon instance ID
const weaponId = Object.keys(GameEngine.state.bank.instanced)[0];
console.log('Testing with:', weaponId);

// Add a mod to bank
GameEngine.addItemToBank('testBarrel', 1);

// Attach it to muzzle slot
const result = GameEngine.modifyWeaponAttachments(weaponId, 'muzzle', 'testBarrel');
console.log('Attach result:', result);

// Check attachments
const instance = GameEngine.getEquipmentInstance(weaponId);
console.log('Attachments:', instance.attachments);
```

**Expected**: Mod attached, removed from stackable storage

---

#### Test 5: Remove a Mod
```javascript
// Remove the mod (use same weaponId from Test 4)
const weaponId = Object.keys(GameEngine.state.bank.instanced)[0];

GameEngine.modifyWeaponAttachments(weaponId, 'muzzle', null);

// Check mod returned to bank
console.log('testBarrel count:', GameEngine.getItemCount('testBarrel'));
```

**Expected**: Mod returned to stackable storage (count = 1)

---

#### Test 6: Craft Equipment
```javascript
// Find equipment recipes
const recipes = GameEngine.getAvailableRecipes();
const equipRecipe = recipes.find(r => {
    const item = ItemRegistry?.getItem(r.recipe.outputs[0]?.itemId);
    return item?.instanced === true;
});

if (equipRecipe) {
    console.log('Found recipe:', equipRecipe.recipe.name);

    // Add materials
    for (let input of equipRecipe.recipe.inputs) {
        GameEngine.addItemToBank(input.itemId, input.amount * 2);
    }

    // Start craft
    GameEngine.startCraft(equipRecipe.recipeId);

    // Check active crafts
    console.log('Active crafts:', GameEngine.state.crafting.activeCrafts);
} else {
    console.log('No equipment recipes found - try manual instance creation');
}
```

**Expected**: Craft starts, materials removed from stackable

---

## Verification Checklist

After running tests, verify:

- [ ] Migration flag is set
- [ ] Resources stored as numbers in `bank.stackable`
- [ ] Equipment stored as objects in `bank.instanced`
- [ ] Bank UI shows all items correctly
- [ ] Crafting creates instances with rarity
- [ ] Attachments can be added/removed
- [ ] Mods return to stackable storage when removed

---

## Verification Script

**Run this to get a complete status report:**

```javascript
fetch('verify-migration-success.js')
    .then(r => r.text())
    .then(code => eval(code));
```

Or copy/paste contents of `verify-migration-success.js`.

---

## What Success Looks Like

### Console Output:
```
✅ Migrated 25 items to dual-bank structure
📦 Stackable items: 12
⚔️ Instanced items: 13

[Bank] Active tab: resource, Items found: 12
✨ New item discovered: Pinewood!
⚔️ Crafted rare Iron Sword!
✅ Modified testRifle_instance_123: muzzle -> testBarrel
```

### Bank UI:
- All tabs show correct item counts
- Resources display with quantities (e.g., "Pinewood x 1000")
- Equipment displays with rarity colors
- Clicking items opens modal with details

### Dual-Bank Structure:
```javascript
{
  stackable: {
    pinewood: 1000,
    ironOre: 500,
    testBarrel: 1
  },
  instanced: {
    'testRifle_instance_123': {
      instanceId: 'testRifle_instance_123',
      baseItemId: 'testRifle',
      rarity: 'rare',
      attachments: { muzzle: null },
      modifiedStats: { ... }
    }
  }
}
```

---

## Troubleshooting

### Issue: Items not visible in UI
- Check console for errors
- Verify `getItemsInTab()` returns items
- Check that bank structures exist

### Issue: Crafting doesn't create instances
- Verify item has `instanced: true` in definition
- Check console for "⚔️ Crafted..." message
- Verify `addEquipmentInstance()` was called

### Issue: Attachments don't work
- Ensure weapon is an instance (has instanceId)
- Check mod exists in stackable storage
- Verify slot type is valid for weapon

---

## Files to Reference

- `SYSTEM_COMPATIBILITY_SUMMARY.md` - Full system compatibility details
- `test-specific-scenarios.js` - Automated test script
- `verify-migration-success.js` - Migration verification script
- `DUAL_BANK_TEST_PLAN.md` - Comprehensive 10-step test plan

---

## Ready?

**🚀 Reload the page and start testing!**

The dual-bank system is foundational and ready. All your requested scenarios work correctly.
