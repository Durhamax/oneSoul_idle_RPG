# Equipment System Guide

## Overview

This document explains how the equipment system works in oneSoul Idle RPG, including how items are equipped, how they're stored, and how they're rendered in the UI.

---

## Key Concepts

### 1. Equipment Slots vs Bank Tabs

Items have TWO different slot-related properties that serve different purposes:

- **`slot`**: Determines which **bank tab** the item appears in
- **`equipSlot`**: Determines which **equipment slot** the item equips to

#### Example: Tools

```javascript
lightPickaxe: {
    id: 'lightPickaxe',
    name: 'Light Pickaxe',
    slot: 'tool',           // Appears in Tools bank tab
    equipSlot: 'weapon',    // Equips to weapon slot
    // ... other properties
}
```

This separation allows:
- Tools to be organized separately in the bank
- But equip to the weapon slot (since they're mainhand items)

### 2. Instance IDs

Equipment items are **instanced**, meaning each individual item has a unique ID and can have different stats, rarity, and enhancements.

#### Instance ID Formats

The codebase currently supports **two instance ID formats**:

1. **Format 1** (from `dualBankSystem.js`):
   ```
   baseItemId_instance_timestamp_randomid
   Example: lightPickaxe_instance_1763928759179_8vf9c5dkj
   ```

2. **Format 2** (from `craftingSystem.js`):
   ```
   baseItemId_timestamp_randomid
   Example: lightPickaxe_1763928759179_8vf9c5dkj
   ```

**Important**: All equipment rendering code must handle BOTH formats.

---

## Equipment Slots

The game has 9 equipment slots arranged in a 3x3 grid:

| Row 1 | Row 2 | Row 3 |
|-------|-------|-------|
| weapon | helmet | back |
| gloves | chest | neck |
| boots | legs | ring |

**Note**: There is NO 'tool' equipment slot. Tools equip to the 'weapon' slot.

---

## How Equipping Works

### 1. User Flow

1. User opens bank and navigates to a tab (e.g., Tools)
2. User clicks on an item to open the item modal
3. User clicks "⚔️ Equip" button
4. Item is equipped and modal closes
5. Success notification appears: "⚔️ Equipped [Item Name]"
6. Item disappears from bank
7. When user navigates to Equipment view, item appears in the appropriate slot

### 2. Technical Flow

#### Step 1: Item Modal Equip Button Click

**File**: `src/ui/itemModal.js`

```javascript
equipItem(itemId, slot) {
    const result = GameEngine.equipItem(itemId, slot);

    // Show success/error notification
    if (result.success) {
        Animations.showNotification(`⚔️ Equipped ${itemName}`, 'success', 2000);
    }

    // Force UI updates
    EquipmentUI.updateEquipment();
    EquipmentUI.updateBank();

    this.close();
    UICore.update();
}
```

#### Step 2: Equipment System Processes Request

**File**: `src/systems/equipmentSystem.js`

```javascript
equipItem(itemId, slot) {
    // 1. Parse instance ID to get base item ID
    let lookupId = itemId;
    if (itemId.includes('_instance_')) {
        lookupId = itemId.split('_instance_')[0];
    }

    // 2. Get item definition
    const itemDef = ItemAccessHelper.getItem(lookupId);

    // 3. Determine equipment slot (equipSlot takes priority over slot)
    const equipSlot = itemDef.equipSlot || itemDef.slot;

    // 4. Check requirements (skills, level, weight)
    // ... requirement checks ...

    // 5. Unequip current item in that slot (if any)
    if (this.state.equipment[equipSlot]) {
        this.unequipItem(equipSlot);
    }

    // 6. Set equipment state
    this.state.equipment[equipSlot] = itemId;

    // 7. Remove from bank
    this.removeEquipmentInstance(itemId);

    // 8. Recalculate stats
    this.recalculateStats();

    return { success: true };
}
```

#### Step 3: Bank Storage Updated

**File**: `src/systems/dualBankSystem.js`

The item is removed from `GameEngine.state.bank.instanced[itemId]`.

#### Step 4: Equipment State Updated

The equipment state is stored in `GameEngine.state.equipment`:

```javascript
GameEngine.state.equipment = {
    weapon: 'lightPickaxe_1763928759179_8vf9c5dkj',  // Instance ID
    helmet: null,
    chest: null,
    // ... other slots
}
```

---

## How Equipment Rendering Works

### 1. When Equipment View is Rendered

**File**: `src/ui/equipmentUI.js`

```javascript
updateEquipmentSlots() {
    const container = document.getElementById("equipmentGrid");

    // Render using EquipmentComponent
    html += EquipmentComponent.render({
        mode: 'horizontal',
        showLabels: true,
        interactive: true
    });

    container.innerHTML = html;
}
```

### 2. Equipment Component Rendering

**File**: `src/ui/equipmentComponent.js`

```javascript
renderEquipmentGrid(showLabels, interactive) {
    const slots = [
        ['weapon', 'helmet', 'back'],
        ['gloves', 'chest', 'neck'],
        ['boots', 'legs', 'ring']
    ];

    for (let row of slots) {
        for (let slot of row) {
            // 1. Get equipped item ID from state
            const equippedItemId = GameEngine.state.equipment[slot];

            // 2. Parse instance ID to get base item ID
            let lookupId = equippedItemId;
            if (equippedItemId) {
                if (equippedItemId.includes('_instance_')) {
                    // Format 1: baseId_instance_timestamp_random
                    lookupId = equippedItemId.split('_instance_')[0];
                } else if (equippedItemId.includes('_')) {
                    // Format 2: baseId_timestamp_random
                    const parts = equippedItemId.split('_');
                    if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
                        lookupId = parts.slice(0, -2).join('_');
                    }
                }
            }

            // 3. Get item definition
            const itemDef = lookupId ? ItemAccessHelper.getItem(lookupId) : null;

            // 4. Render slot
            const isEquipped = equippedItemId !== null && itemDef !== null;

            if (isEquipped) {
                // Render equipped item with icon, name, stats
                html += renderEquippedItem(itemDef);
            } else {
                // Render empty slot
                html += `<div class="equipment-slot-empty">📦</div>`;
            }
        }
    }
}
```

### 3. Instance ID Parsing (Critical!)

The rendering code MUST handle both instance ID formats:

```javascript
// Parse instance ID to get base item ID
let lookupId = equippedItemId;
if (equippedItemId) {
    if (equippedItemId.includes('_instance_')) {
        // Format 1: baseId_instance_timestamp_random
        lookupId = equippedItemId.split('_instance_')[0];
    } else if (equippedItemId.includes('_')) {
        // Format 2: baseId_timestamp_random
        const parts = equippedItemId.split('_');
        // Check if second-to-last part is a 13-digit timestamp
        if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
            // Remove timestamp and random ID to get base ID
            lookupId = parts.slice(0, -2).join('_');
        }
    }
}
```

**Why This Matters**:
- `craftingSystem.js` creates instances without `_instance_`
- `dualBankSystem.js` creates instances with `_instance_`
- If parsing only checks for one format, items won't render

---

## Item Definition Lookup

### ItemAccessHelper Pattern

All UI components should use `ItemAccessHelper.getItem()` to look up item definitions:

```javascript
const itemDef = ItemAccessHelper.getItem(lookupId);
```

This helper checks multiple sources in priority order:

1. **ItemRegistry** (primary, production items)
2. **GameEngine.getItem()** (uses ItemRegistry internally)
3. **GameEngine.definitions.items** (legacy fallback)

**File**: `src/ui/utilities/itemAccessHelper.js`

```javascript
getItem(itemId) {
    // Primary: Use ItemRegistry if available
    if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
        return ItemRegistry.getItem(itemId);
    }

    // Secondary: Use GameEngine.getItem()
    if (typeof GameEngine !== 'undefined' && GameEngine.getItem) {
        return GameEngine.getItem(itemId);
    }

    // Fallback: Use definitions.items (legacy)
    if (typeof GameEngine !== 'undefined' && GameEngine.definitions?.items) {
        return GameEngine.definitions.items[itemId] || null;
    }

    return null;
}
```

---

## UI Update Flow

### When Equipment Changes

After equipping or unequipping, multiple UI components may need to update:

```javascript
// Force cache clear to ensure fresh render
EquipmentUI.lastEquipmentState = null;
EquipmentUI.lastBankState = null;

// Update equipment view (if visible)
EquipmentUI.updateEquipment();

// Update bank view (if visible)
EquipmentUI.updateBank();

// Update other UI elements
UICore.update();
```

### View-Based Rendering

The equipment and bank are separate views:

- **Bank View** (`view-bank`): Shows bank tabs and items
- **Equipment View** (`view-equipment`): Shows equipment slots

Only the ACTIVE view is visible at any time. The equipment state persists regardless of which view is active.

---

## Equipment State Persistence

### Game State Structure

```javascript
GameEngine.state = {
    equipment: {
        weapon: 'lightPickaxe_1763928759179_8vf9c5dkj',
        helmet: null,
        chest: null,
        legs: null,
        gloves: null,
        boots: null,
        back: null,
        neck: null,
        ring: null
    },
    bank: {
        instanced: {
            // Items removed when equipped
        },
        stackable: {
            // Non-equipment items
        }
    }
}
```

### Save System

Equipment state is saved automatically:

**File**: `src/systems/saveSystem.js`

```javascript
save() {
    const saveData = {
        // ... other state
        equipment: GameEngine.state.equipment,
        bank: GameEngine.state.bank,
        // ...
    };

    localStorage.setItem('oneSoul_save', JSON.stringify(saveData));
}
```

### Load System

Equipment is restored on game load:

```javascript
load() {
    const saveData = JSON.parse(localStorage.getItem('oneSoul_save'));

    if (saveData.equipment) {
        GameEngine.state.equipment = saveData.equipment;
    }

    // Recalculate stats based on equipped items
    GameEngine.recalculateStats();
}
```

---

## Common Issues and Solutions

### Issue 1: Items Not Rendering in Equipment View

**Symptom**: Item equips successfully but doesn't appear in Equipment view

**Cause**: Instance ID not being parsed correctly

**Solution**: Ensure rendering code handles both instance ID formats (see "Instance ID Parsing" above)

### Issue 2: Wrong Equipment Slot

**Symptom**: Item equips to wrong slot (e.g., tool tries to equip to 'tool' slot which doesn't exist)

**Cause**: Using `slot` instead of `equipSlot` to determine equipment slot

**Solution**: Always prioritize `equipSlot` over `slot`:
```javascript
const equipSlot = itemDef.equipSlot || itemDef.slot;
```

### Issue 3: Item Definition Not Found

**Symptom**: Console shows "itemDef: NOT FOUND"

**Cause**:
- Instance ID not being parsed to base ID
- Item not registered in ItemRegistry
- Using wrong item access method

**Solution**:
1. Verify instance ID parsing logic
2. Check item exists in ItemRegistry: `Items.get('lightPickaxe')`
3. Use `ItemAccessHelper.getItem()` instead of direct access

### Issue 4: Equipment Not Persisting

**Symptom**: Equipment disappears on page refresh

**Cause**:
- Migration system removing invalid items
- Equipment state not being saved

**Solution**:
1. Check migration logs for "Removing invalid equipped item"
2. Verify item definitions are loaded before equipment state is restored
3. Ensure save system is saving equipment state

---

## Best Practices

### 1. Always Use ItemAccessHelper

```javascript
// ✅ Good
const itemDef = ItemAccessHelper.getItem(itemId);

// ❌ Bad
const itemDef = ITEMS_DB[itemId];
```

### 2. Parse Instance IDs Before Lookup

```javascript
// ✅ Good
let lookupId = itemId;
if (itemId.includes('_instance_')) {
    lookupId = itemId.split('_instance_')[0];
} else if (itemId.includes('_')) {
    const parts = itemId.split('_');
    if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
        lookupId = parts.slice(0, -2).join('_');
    }
}

// ❌ Bad
const lookupId = itemId; // Tries to look up instance ID directly
```

### 3. Prioritize equipSlot Over slot

```javascript
// ✅ Good
const equipSlot = itemDef.equipSlot || itemDef.slot;

// ❌ Bad
const equipSlot = itemDef.slot || itemDef.equipSlot;
```

### 4. Force UI Cache Clear After Equipment Changes

```javascript
// ✅ Good
EquipmentUI.lastEquipmentState = null;
EquipmentUI.updateEquipment();

// ❌ Bad
EquipmentUI.updateEquipment(); // May not re-render if state looks unchanged
```

### 5. Provide User Feedback

```javascript
// ✅ Good
if (result.success) {
    Animations.showNotification(`⚔️ Equipped ${itemName}`, 'success', 2000);
}

// ❌ Bad
GameEngine.equipItem(itemId, slot); // Silent, user doesn't know if it worked
```

---

## File Reference

### Core Systems
- **Equipment Logic**: `src/systems/equipmentSystem.js`
- **Bank Storage**: `src/systems/dualBankSystem.js`
- **Inventory Management**: `src/systems/inventorySystem.js`
- **Crafting (creates instances)**: `src/systems/craftingSystem.js`

### UI Components
- **Equipment Rendering**: `src/ui/equipmentComponent.js`
- **Equipment UI Controller**: `src/ui/equipmentUI.js`
- **Item Modal**: `src/ui/itemModal.js`
- **Item Access Helper**: `src/ui/utilities/itemAccessHelper.js`

### Data
- **Item Definitions**: `src/data/items/production/equipment/equipment.js`
- **Item Registry**: `src/data/items/itemRegistry_NEW.js`
- **Item Index**: `src/data/items/index.js`

### Game Engine
- **Core Engine**: `src/core/gameEngine.js`
- **Definitions**: `src/core/definitions.js`

---

## Equipment Requirements

Items can have requirements that must be met before equipping:

```javascript
lightPickaxe: {
    requirements: {
        mining: 1,      // Skill requirement
        combat: 0,      // Combat level requirement
    }
}
```

Requirements are checked in `equipmentSystem.js`:

```javascript
// Check skill requirements
if (itemDef.requirements) {
    for (let [skill, requiredLevel] of Object.entries(itemDef.requirements)) {
        const currentLevel = this.getSkillLevel(skill);
        if (currentLevel < requiredLevel) {
            return {
                success: false,
                reason: `Requires ${skill} level ${requiredLevel}`
            };
        }
    }
}
```

---

## Future Improvements

### Standardize Instance ID Format

Consider standardizing to a single instance ID format across the codebase:

```javascript
// Recommended format
const instanceId = `${baseItemId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

Update `craftingSystem.js` to use the same format as `dualBankSystem.js`.

### Create Helper Function

Create a centralized helper function for instance ID parsing:

```javascript
// src/utils/itemUtils.js
function parseInstanceId(itemId) {
    if (!itemId) return null;

    if (itemId.includes('_instance_')) {
        return itemId.split('_instance_')[0];
    } else if (itemId.includes('_')) {
        const parts = itemId.split('_');
        if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
            return parts.slice(0, -2).join('_');
        }
    }

    return itemId; // Not an instance ID
}
```

Use this helper everywhere instead of duplicating parsing logic.

---

## Debugging Tips

### Check Equipment State

In browser console:
```javascript
// View current equipment
GameEngine.state.equipment

// Check specific slot
GameEngine.state.equipment.weapon

// Check if item is in bank
GameEngine.state.bank.instanced

// Get item definition
Items.get('lightPickaxe')
```

### Enable Debug Logging

Add console.log statements to track the flow:

```javascript
console.log('🔍 Equipping:', itemId);
console.log('📊 Equipment state:', GameEngine.state.equipment);
console.log('🎨 Rendering slot:', slot, equippedItemId);
console.log('🔎 Lookup ID:', lookupId);
console.log('📦 Item def:', itemDef);
```

### Check Migration Logs

Look for warnings in console during game load:
```
⚠️ Removing invalid equipped item: lightPickaxe_xxx from weapon
```

This indicates the item definition wasn't found during migration.

---

## Summary

The equipment system works by:

1. **Storing equipped items** as instance IDs in `GameEngine.state.equipment`
2. **Parsing instance IDs** to extract base item IDs for definition lookup
3. **Using ItemAccessHelper** to get item definitions from ItemRegistry
4. **Rendering equipment slots** based on the equipment state
5. **Providing user feedback** via notifications when items are equipped/unequipped
6. **Persisting state** through the save system

Key things to remember:
- `slot` = bank tab, `equipSlot` = equipment slot
- Handle both instance ID formats when parsing
- Always use ItemAccessHelper for item lookups
- Force cache clear when equipment changes
- Provide user feedback for actions
