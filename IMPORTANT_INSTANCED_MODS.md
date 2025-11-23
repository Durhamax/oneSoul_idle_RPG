# IMPORTANT: Mods/Attachments Are Instanced Items

## Key Discovery

During testing, we discovered that **mods/attachments are INSTANCED items**, not stackable items!

## Item Definitions

From `src/data/items/test/testItems.js`:

```javascript
testMuzzle_common: {
    id: 'testMuzzle_common',
    name: 'Common Muzzle',
    description: 'Increases weapon damage by 2%.',
    icon: '🔩',
    category: 'equipment',
    instanced: true,             // ← Mods are instanced!
    slot: 'attachment',
    itemType: 'attachment',
    modType: 'muzzle',
    modStat: 'attackDamage',
    rarity: 'common',
    stackLimit: 10,
    value: 25,
    defaultTab: 'mod',
    bonusValue: 0.02,
},
```

## Implications for Dual-Bank

### ✅ **Correct Workflow:**

1. **Create mod instance:**
   ```javascript
   const modInstance = DualBankSystem.createInstance('testMuzzle_common', {
       rarity: 'common'
   });
   ```

2. **Add to bank:**
   ```javascript
   GameEngine.addEquipmentInstance(modInstance);
   // Stored in bank.instanced[modInstance.uniqueId]
   ```

3. **Attach to weapon:**
   ```javascript
   GameEngine.modifyWeaponAttachments(
       weaponInstanceId,
       'muzzle',
       modInstance.uniqueId  // Use instance ID, not base item ID
   );
   ```

4. **Remove from weapon:**
   ```javascript
   GameEngine.modifyWeaponAttachments(
       weaponInstanceId,
       'muzzle',
       null  // Returns mod instance to bank.instanced
   );
   ```

### ❌ **Incorrect Workflow (old assumption):**

```javascript
// WRONG: Treating mods as stackable
GameEngine.addItemToBank('testMuzzle_common', 1);  // ❌ Error: instanced item
```

## Why This Matters

### Storage Location:
- **Weapons**: `bank.instanced[weaponInstanceId]`
- **Mods**: `bank.instanced[modInstanceId]` ← **Not stackable!**
- **Resources**: `bank.stackable[itemId]`

### Attachment System:
The attachment system must:
1. Remove mod **instance** from `bank.instanced` when attaching
2. Return mod **instance** to `bank.instanced` when removing
3. Store mod instance ID in weapon's `attachments` object

### Example Data Structure:

```javascript
// Weapon instance with attached mod
bank.instanced = {
    'testRifle_instance_123': {
        instanceId: 'testRifle_instance_123',
        baseItemId: 'testRifle',
        attachments: {
            muzzle: 'testMuzzle_common_instance_456',  // ← References mod instance
            scope: null
        }
    },

    // Separate mod instances (when NOT attached)
    'testScope_uncommon_instance_789': {
        instanceId: 'testScope_uncommon_instance_789',
        baseItemId: 'testScope_uncommon',
        modType: 'scope',
        bonusValue: 0.04
    }
};
```

## Test Items Available

From `src/data/items/test/testItems.js`:

- ✅ `testRifle` - Weapon (instanced)
- ✅ `testMuzzle_common` - Muzzle mod (instanced)
- ✅ `testScope_uncommon` - Scope mod (instanced)
- ✅ `testGrip_rare` - Grip mod (instanced)
- ❌ `testBarrel` - **Does NOT exist** (old test script had wrong ID)

## Updated Test Script

Created: `test-dual-bank-corrected.js`

This script:
1. Uses correct item IDs (`testMuzzle_common` instead of `testBarrel`)
2. Creates mod instances before attaching
3. Properly handles instanced attachments
4. Verifies mods return to `bank.instanced` when removed

## Action Required

If the attachment system currently assumes mods are stackable, it needs to be updated to:
1. Handle instanced mods
2. Remove from `bank.instanced` when attaching
3. Add to `bank.instanced` when removing
4. Store instance IDs in weapon attachments

## Status

- ✅ Dual-bank system supports instanced mods
- ✅ Test script corrected to use instanced mods
- ⚠️ Attachment system needs verification for instanced mod handling
