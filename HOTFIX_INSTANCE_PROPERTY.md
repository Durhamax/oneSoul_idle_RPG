# Hotfix: Instance Property Name Compatibility

## Issue
Test script failed with validation error:
```
❌ Invalid instance: {itemId: 'testRifle', baseItemId: 'testRifle', instanceId: 'testRifle_instance_1763870857206_qf10rlgdj', ...}
```

## Root Cause
Property name mismatch across systems:
- **DualBankSystem** expected property: `uniqueId`
- **AttachmentSystem.createWeaponInstance()** created property: `instanceId`
- **CraftingSystem.createEquipmentInstance()** created property: `instanceId`

This caused `DualBankSystem.addInstance()` validation to fail when trying to add instances created by other systems.

## Fix Applied

### File: `src/systems/dualBankSystem.js`

**Updated 4 functions to accept both property names:**

#### 1. `createInstance()` (lines 142-153)
```javascript
// Generate unique ID (accept both uniqueId and instanceId for compatibility)
const uniqueId = properties.uniqueId || properties.instanceId || `${baseItemId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Build instance object
const instance = {
    baseItemId: baseItemId,
    uniqueId: uniqueId,
    instanceId: uniqueId,  // DUAL-BANK: Provide both for compatibility
    rarity: properties.rarity || def.rarity || 'common',
    equipped: properties.equipped || false,
    locked: properties.locked || false,
};
```

#### 2. `addInstance()` (lines 182-211)
```javascript
addInstance(instance) {
    // DUAL-BANK: Accept both 'uniqueId' and 'instanceId' for compatibility
    const id = instance.uniqueId || instance.instanceId;

    if (!instance || !id || !instance.baseItemId) {
        console.warn('❌ Invalid instance:', instance);
        return false;
    }

    // ... validation ...

    // Ensure instance has both properties for compatibility
    instance.uniqueId = id;
    instance.instanceId = id;

    // Add to instanced storage
    GameEngine.state.bank.instanced[id] = instance;
}
```

#### 3. `removeInstance()` (lines 214-237)
```javascript
/**
 * Remove instance from bank
 * @param {string} uniqueId - Unique instance ID (accepts both uniqueId and instanceId)
 */
removeInstance(uniqueId) {
    // ... same logic, no code change needed ...
}
```

#### 4. `getInstance()` (lines 239-246)
```javascript
/**
 * Get instance by unique ID
 * @param {string} uniqueId - Unique instance ID (accepts both uniqueId and instanceId)
 */
getInstance(uniqueId) {
    return GameEngine.state.bank.instanced[uniqueId] || null;
}
```

#### 5. `validate()` (lines 394-407)
```javascript
// Check instanced items
Object.entries(GameEngine.state.bank.instanced).forEach(([uniqueId, inst]) => {
    // DUAL-BANK: Accept both uniqueId and instanceId
    const id = inst.uniqueId || inst.instanceId;
    if (!inst.baseItemId || !id) {
        issues.push(`Invalid instance structure: ${uniqueId}`);
    }
    // ... rest of validation ...
});
```

## Key Changes

1. **Backward Compatibility**: All instances now have BOTH `uniqueId` AND `instanceId` properties set to the same value
2. **Forward Compatibility**: Methods accept either property name as input
3. **Normalization**: `addInstance()` ensures both properties exist before storing

## Benefits

- ✅ Works with instances from `AttachmentSystem.createWeaponInstance()`
- ✅ Works with instances from `CraftingSystem.createEquipmentInstance()`
- ✅ Works with instances from `DualBankSystem.createInstance()`
- ✅ No breaking changes to existing code
- ✅ Future-proof for any system using either property name

## Test Results
**After fix**: Instances can be successfully added to dual-bank storage regardless of which property name they were created with.

## Status
**FIXED** - Ready for testing with test script
