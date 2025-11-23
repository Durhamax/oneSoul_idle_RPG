# Hotfix: Instanced Attachments in Attachment System

## Issue
Attachment system was treating mods as stackable items when they're actually instanced, causing attachment operations to fail.

**Test Result:**
```
✅ Mod instance added to bank
🔄 Removing new attachment from bank: testMuzzle_common_instance_1763871447410_gp8dgfbas
✅ Removed instance: testMuzzle_common_instance_1763871447410_gp8dgfbas (testMuzzle_common)
❌ Failed to attach mod: Attachment not available in bank
```

## Root Cause

The attachment system's `modifyWeaponAttachments()` function was using:
- `addItemToBank(attachmentId, 1)` - For stackable items
- `removeItemFromBank(attachmentId, 1)` - For stackable items

But test mods have `instanced: true`, so they should use:
- `addEquipmentInstance(instance)` - For instanced items
- `removeEquipmentInstance(instanceId)` - For instanced items

The old code would:
1. Call `removeItemFromBank(attachmentId, 1)`
2. This routed to `DualBankSystem.removeStackable()`
3. This failed because the attachment is in `bank.instanced`, not `bank.stackable`
4. BUT `removeEquipmentInstance()` already removed it from `bank.instanced`!
5. Resulted in: "Attachment not available in bank" error

## Fix Applied

### File: `src/systems/attachmentSystem.js` (lines 146-205)

**Key Changes:**

1. **Check Before Removing** (lines 146-155):
```javascript
// If adding a new attachment, check if it exists in bank first
if (attachmentId) {
    console.log(`🔄 Checking for attachment in bank: ${attachmentId}`);
    // DUAL-BANK: Attachments are instanced, check instanced storage
    const attachmentInstance = this.getEquipmentInstance(attachmentId);
    if (!attachmentInstance) {
        return { success: false, reason: 'Attachment not available in bank' };
    }
    console.log(`✅ Attachment found in bank: ${attachmentId}`);
}
```

2. **Remove Using Instance Methods** (lines 176-185):
```javascript
// Remove attachment instance from bank if adding (not removing)
if (attachmentId) {
    console.log(`🔄 Removing new attachment from bank: ${attachmentId}`);
    // DUAL-BANK: Attachments are instanced, use removeEquipmentInstance
    const removedInstance = this.removeEquipmentInstance(attachmentId);
    console.log(`🔄 Removed instance:`, removedInstance);
    if (!removedInstance) {
        // Revert change if we couldn't remove the attachment
        weapon.attachments[slotType] = oldAttachment;
        return { success: false, reason: 'Failed to remove attachment from bank' };
    }
}
```

3. **Return to Bank When Removing** (lines 186-205):
```javascript
else if (oldAttachment) {
    // Removing attachment (attachmentId is null), return old one to bank
    const oldAttachmentDef = AttachmentSystem._getItemDef.call(this, oldAttachment);
    if (oldAttachmentDef && oldAttachmentDef.instanced) {
        // Create instance from stored attachment ID
        const reconstructedInstance = DualBankSystem.createInstance(oldAttachmentDef.id, {
            rarity: oldAttachmentDef.rarity || 'common'
        });
        if (reconstructedInstance) {
            // Override the uniqueId with the stored attachment ID to maintain reference
            reconstructedInstance.uniqueId = oldAttachment;
            reconstructedInstance.instanceId = oldAttachment;
            this.addEquipmentInstance(reconstructedInstance);
            console.log(`✅ Returned attachment to bank: ${oldAttachment}`);
        }
    }
}
```

## Flow After Fix

### Attaching a Mod:
1. Check if mod instance exists in `bank.instanced` ✅
2. Remove old attachment from slot (if any)
3. Add new attachment ID to weapon's attachments object
4. Remove mod instance from `bank.instanced` using `removeEquipmentInstance()` ✅
5. Recalculate weapon stats

### Removing a Mod:
1. Get old attachment ID from weapon slot
2. Set slot to `null`
3. Reconstruct attachment instance from base definition ✅
4. Add instance back to `bank.instanced` using `addEquipmentInstance()` ✅
5. Recalculate weapon stats

## Known Limitation

**Instance Data Loss:**
When attaching a mod, we only store the instance ID in the weapon's `attachments` object. The full instance data (with potentially rolled stats, rarity, etc.) is lost.

**Current Workaround:**
When removing, we reconstruct the instance from the base definition, but this means:
- Rarity is reset to base rarity
- Any rolled stats are lost
- Original instance data is not preserved

**TODO:**
Consider storing full attachment instance data in weapon object:
```javascript
weapon.attachmentInstances = {
    muzzle: { instanceId: 'mod_123', rarity: 'epic', stats: {...} },
    scope: null
};
weapon.attachments = {
    muzzle: 'mod_123',  // Just the ID for quick reference
    scope: null
};
```

## Test Results

After fix, the attachment workflow should:
- ✅ Check if mod exists before attaching
- ✅ Use instanced methods for add/remove
- ✅ Return mod to bank when removed
- ✅ No "not available in bank" errors

## Status
**FIXED** - Ready for retesting with corrected test script

## Related Files
- `IMPORTANT_INSTANCED_MODS.md` - Discovery of instanced mods
- `test-dual-bank-corrected.js` - Test script
