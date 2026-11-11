# Item Access Standard - ItemRegistry Pattern
**Last Updated:** 2025-11-22
**Status:** ✅ MANDATORY for all new code

---

## Executive Summary

**ALL item access MUST use ItemRegistry** as the single source of truth. Direct access to `definitions.items` is deprecated and should only exist in legacy fallback code.

### The Single Rule:
```javascript
// ✅ CORRECT - Use ItemRegistry
const item = ItemRegistry.getItem(itemId);

// ❌ WRONG - Direct access (deprecated)
const item = this.definitions.items[itemId];
```

---

## 1. Why This Matters

### Problem: Dual Access Patterns Created Bugs
Before standardization, the codebase had TWO ways to access items:
1. `ItemRegistry.getItem(itemId)` - New system
2. `this.definitions.items[itemId]` - Legacy system

This caused:
- **Attachment system breaking** - Items only in ItemRegistry weren't found
- **Confusion** - Developers didn't know which to use
- **Maintenance burden** - Had to check both sources
- **Inconsistency** - Different behaviors in different parts of code

### Solution: Single Source of Truth
All item access now goes through ItemRegistry with a standardized fallback pattern.

---

## 2. Access Patterns by Context

### A. In Game Systems (InventorySystem, EquipmentSystem, etc.)

**Pattern:** Use internal `_getItemDef()` helper

```javascript
const MySystem = {
    /**
     * Standardized item access helper
     */
    _getItemDef(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },

    init(engine) {
        // ... attach methods ...
        console.log('✅ MySystem initialized (ItemRegistry pattern)');
    },

    someMethod(itemId) {
        // Use the helper
        const item = MySystem._getItemDef.call(this, itemId);
        if (!item) {
            console.error(`Item not found: ${itemId}`);
            return;
        }

        // ... use item ...
    }
};
```

**Example - InventorySystem:**
```javascript
addItemToBank(itemId, quantity, tab = null) {
    // Use standardized item access pattern
    const itemDef = InventorySystem._getItemDef.call(this, itemId);

    if (!itemDef) {
        console.error(`❌ Item ${itemId} not found`);
        return { success: false, reason: "Item not found" };
    }

    // ... rest of logic ...
}
```

### B. In GameEngine

**Pattern:** Use `this.getItem()` method

```javascript
// GameEngine has a centralized getItem() method
getItem(itemId) {
    // Primary: Use ItemRegistry if available
    if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
        return ItemRegistry.getItem(itemId);
    }

    // Fallback: Use definitions.items (legacy support)
    return this.definitions?.items?.[itemId] || null;
}

// Use it in other methods
getItemRarity(itemId) {
    const item = this.getItem(itemId);  // ✅ Use getItem()
    if (!item) return null;

    const rarity = item.rarity || 'common';
    return this.definitions.RARITY_TIERS[rarity];
}
```

### C. In UI Components

**Pattern:** Use `GameEngine.getItem()` or `ItemRegistry.getItem()`

```javascript
// In UI components
function renderItem(itemId) {
    // Option 1: Through GameEngine (preferred)
    const item = GameEngine.getItem(itemId);

    // Option 2: Direct ItemRegistry (also acceptable)
    const item = ItemRegistry.getItem(itemId);

    if (!item) {
        console.warn(`Item ${itemId} not found`);
        return;
    }

    // ... render item ...
}
```

### D. In Standalone Utilities

**Pattern:** Use `ItemRegistry.getItem()` directly

```javascript
// In utility functions not bound to GameEngine
function calculateItemValue(itemId) {
    const item = ItemRegistry.getItem(itemId);
    if (!item) return 0;

    return item.value || 0;
}
```

---

## 3. Complete Examples

### Example 1: System with _getItemDef Helper

```javascript
const EquipmentSystem = {
    /**
     * Standardized item access (REQUIRED)
     */
    _getItemDef(itemId) {
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }
        return this.definitions?.items?.[itemId] || null;
    },

    init(engine) {
        engine.equipItem = this.equipItem.bind(engine);
        // ... other bindings ...
        console.log('✅ EquipmentSystem initialized (ItemRegistry pattern)');
    },

    equipItem(itemId) {
        // Use the helper
        const itemDef = EquipmentSystem._getItemDef.call(this, itemId);

        if (!itemDef) {
            return { success: false, reason: "Item not found" };
        }

        if (!itemDef.equipSlot) {
            return { success: false, reason: "Item is not equippable" };
        }

        // ... equipping logic ...
    },

    unequipItem(slot) {
        const itemId = this.state.equipment[slot];

        if (!itemId) {
            return { success: false, reason: "Nothing equipped" };
        }

        // Use the helper
        const itemDef = EquipmentSystem._getItemDef.call(this, itemId);

        // ... unequipping logic ...
    }
};
```

### Example 2: GameEngine Method

```javascript
// In gameEngine.js

/**
 * Get item definition (STANDARDIZED ACCESS PATTERN)
 */
getItem(itemId) {
    if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
        return ItemRegistry.getItem(itemId);
    }
    return this.definitions?.items?.[itemId] || null;
},

/**
 * Check if player can afford an item
 */
canAffordItem(itemId) {
    const item = this.getItem(itemId);  // ✅ Use getItem()

    if (!item) {
        return false;
    }

    const playerGold = this.state.resources.gold || 0;
    const itemCost = item.value || 0;

    return playerGold >= itemCost;
}
```

### Example 3: UI Component

```javascript
// In itemModal.js or similar UI file

function openItemModal(itemId) {
    // Use GameEngine.getItem() for UI
    const item = GameEngine.getItem(itemId);

    if (!item) {
        console.error(`Cannot open modal: Item ${itemId} not found`);
        return;
    }

    // Populate modal
    document.getElementById('itemName').textContent = item.name;
    document.getElementById('itemDescription').textContent = item.description;
    document.getElementById('itemIcon').textContent = item.icon;

    // ... rest of modal logic ...
}
```

---

## 4. Migration Checklist

When updating existing code to use ItemRegistry pattern:

### For Systems:

- [ ] Add `_getItemDef(itemId)` helper function at top of system
- [ ] Add console log to `init()`: `console.log('✅ SystemName initialized (ItemRegistry pattern)');`
- [ ] Find all `this.definitions.items[itemId]` occurrences
- [ ] Replace with `SystemName._getItemDef.call(this, itemId)`
- [ ] Test all functions that access items

### For GameEngine:

- [ ] Ensure `getItem(itemId)` method exists
- [ ] Replace `this.definitions.items[itemId]` with `this.getItem(itemId)`
- [ ] Test all item-related methods

### For UI Components:

- [ ] Replace `engine.definitions.items[itemId]` with `GameEngine.getItem(itemId)`
- [ ] Or use `ItemRegistry.getItem(itemId)` if GameEngine not available
- [ ] Test all UI rendering

---

## 5. Common Mistakes to Avoid

### ❌ Mistake 1: Direct Object Access
```javascript
// WRONG
const item = this.definitions.items[itemId];
const item = engine.definitions.items[itemId];
const item = GameEngine.definitions.items[itemId];
```

### ✅ Correct:
```javascript
// In systems
const item = SystemName._getItemDef.call(this, itemId);

// In GameEngine
const item = this.getItem(itemId);

// In UI
const item = GameEngine.getItem(itemId);
```

### ❌ Mistake 2: Checking Existence Wrong
```javascript
// WRONG
if (this.definitions.items[itemId]) { ... }
if (itemId in this.definitions.items) { ... }
```

### ✅ Correct:
```javascript
// In systems
const item = SystemName._getItemDef.call(this, itemId);
if (item) { ... }

// In GameEngine
const item = this.getItem(itemId);
if (item) { ... }

// Or use ItemRegistry directly
if (ItemRegistry.hasItem(itemId)) { ... }
```

### ❌ Mistake 3: Iterating Items Wrong
```javascript
// WRONG
for (let itemId in this.definitions.items) { ... }
Object.keys(this.definitions.items).forEach(...)
```

### ✅ Correct:
```javascript
// Use ItemRegistry methods
const allItems = ItemRegistry.getAllActive();
for (let itemId in allItems) { ... }

// Or get as array
const itemArray = Object.values(ItemRegistry.getAllActive());
itemArray.forEach(item => { ... });

// Or use built-in queries
const weapons = ItemRegistry.getItemsByCategory('weapon');
const rareItems = ItemRegistry.getItemsByRarity('rare');
```

---

## 6. ItemRegistry Query Methods

### Available Methods:

```javascript
// Get single item
ItemRegistry.getItem(itemId)           // Returns: object | null

// Check existence
ItemRegistry.hasItem(itemId)           // Returns: boolean

// Get all items (object keyed by itemId)
ItemRegistry.getAllActive()            // Returns: { itemId: {...}, ... }

// Get all items as array
Object.values(ItemRegistry.getAllActive())  // Returns: [{...}, {...}, ...]

// Get all item IDs
ItemRegistry.getAllIds()               // Returns: ['itemId1', 'itemId2', ...]

// Filter by category
ItemRegistry.getItemsByCategory('equipment')  // Returns: [{...}, {...}, ...]

// Filter by rarity
ItemRegistry.getItemsByRarity('legendary')    // Returns: [{...}, {...}, ...]

// Filter by equipment slot
ItemRegistry.getItemsBySlot('weapon')         // Returns: [{...}, {...}, ...]

// Filter by tier
ItemRegistry.getItemsByTier('advanced')       // Returns: [{...}, {...}, ...]

// Filter by level range
ItemRegistry.getItemsByLevelRange(5, 20)      // Returns: [{...}, {...}, ...]

// Search by name/description/tags
ItemRegistry.searchItems('sword')             // Returns: [{...}, {...}, ...]
```

### Query Examples:

```javascript
// Get all weapons
const weapons = ItemRegistry.getItemsByCategory('equipment')
    .filter(item => item.equipSlot === 'weapon');

// Get craftable items player can make
const level = GameEngine.state.skills.smithing.level;
const craftableWeapons = ItemRegistry.getItemsByCategory('equipment')
    .filter(item =>
        item.craftable &&
        item.requiredLevel <= level &&
        item.equipSlot === 'weapon'
    );

// Get all items with a specific tag
const fireItems = ItemRegistry.getAllActive();
const fireWeapons = Object.values(fireItems)
    .filter(item => item.tags && item.tags.includes('fire'));

// Search for items
const searchResults = ItemRegistry.searchItems('iron');
// Returns items with "iron" in name, description, or tags
```

---

## 7. Environment Control

ItemRegistry supports multiple environments:

```javascript
// Environments available:
- production: Live game items (always active)
- dev: Development/testing items
- test: Test environment items
- legacy: Backwards compatibility items
- planned: Future planned items

// Control which environments are active:
ItemRegistry.config.devMode = true;       // Enable dev items
ItemRegistry.config.testMode = true;      // Enable test items
ItemRegistry.config.previewMode = true;   // Enable legacy items

// Convenience methods:
ItemRegistry.enableDevMode();     // Enables dev + test
ItemRegistry.disableDevMode();    // Disables dev + test
ItemRegistry.enablePreviewMode(); // Enables legacy items
ItemRegistry.disablePreviewMode(); // Disables legacy items

// Get items from specific environment:
const prodItems = ItemRegistry.getProduction();
const devItems = ItemRegistry.getDev();
const testItems = ItemRegistry.getTest();
const legacyItems = ItemRegistry.getLegacy();
const plannedItems = ItemRegistry.getPlanned();
```

---

## 8. Statistics and Debugging

### Get Registry Statistics:

```javascript
const stats = ItemRegistry.getStatistics();

console.log(stats);
// {
//     status: 'loaded',
//     total: 296,
//     active: 110,
//     production: { count: 92, active: true },
//     dev: { count: 8, active: false },
//     test: { count: 3, active: false },
//     legacy: { count: 3, active: true },
//     planned: { count: 5, active: false },
//     totalActive: 110
// }
```

### Print Summary:

```javascript
ItemRegistry.printSummary();

// Outputs:
// ╔════════════════════════════════════════╗
// ║       ITEM REGISTRY SUMMARY           ║
// ╚════════════════════════════════════════╝
//
// 📦 Registry Counts:
//    Production:   92 items (✅ active)
//    Dev:           8 items (❌ inactive)
//    Test:          3 items (❌ inactive)
//    Legacy:        3 items (✅ active)
//    Planned:       5 items (❌ inactive)
//
// 🎯 Total Active: 110 items
```

### Console Utilities:

```javascript
// Available in browser console via window.Items:

Items.get('ironSword')          // Get specific item
Items.all()                     // Get all active items
Items.search('iron')            // Search items
Items.byCategory('equipment')   // Filter by category
Items.byTier('advanced')        // Filter by tier
Items.stats()                   // Get statistics
Items.summary()                 // Print summary
Items.list()                    // List all IDs
Items.exists('ironSword')       // Check existence
Items.production()              // Get production items only
Items.dev()                     // Get dev items only
Items.test()                    // Get test items only
Items.legacy()                  // Get legacy items only
Items.planned()                 // Get planned items only
```

---

## 9. Adding New Items

### Step 1: Add to Appropriate File

```javascript
// In src/data/items/production/equipment/equipment.js (for production items)
const EQUIPMENT_ITEMS = {
    // ... existing items ...

    newSword: {
        id: 'newSword',
        name: 'New Sword',
        description: 'A shiny new sword',
        icon: '⚔️',
        category: 'equipment',
        equipSlot: 'weapon',
        rarity: 'rare',
        stackLimit: 1,
        value: 500,
        level: 10,
        tier: 'intermediate',
        combatStats: {
            damage: 25,
            attackSpeed: 1.0,
            criticalChance: 5
        },
        tags: ['weapon', 'sword', 'melee']
    }
};
```

### Step 2: Item Automatically Registers

Items are automatically registered on page load through the index.js file.

### Step 3: Access via ItemRegistry

```javascript
// In any system or UI component
const sword = ItemRegistry.getItem('newSword');
// or
const sword = GameEngine.getItem('newSword');
```

---

## 10. Testing Item Access

### Unit Test Pattern:

```javascript
// Test that item is accessible
function testItemAccess(itemId) {
    const item = ItemRegistry.getItem(itemId);

    console.assert(item !== null, `Item ${itemId} should exist`);
    console.assert(item.id === itemId, `Item ID should match`);
    console.assert(item.name, `Item should have name`);
    console.assert(item.category, `Item should have category`);

    console.log(`✅ Item ${itemId} accessible`);
}

// Test all items are accessible
function testAllItemsAccessible() {
    const allIds = ItemRegistry.getAllIds();

    allIds.forEach(itemId => {
        const item = ItemRegistry.getItem(itemId);
        console.assert(item !== null, `Item ${itemId} should be accessible`);
    });

    console.log(`✅ All ${allIds.length} items accessible`);
}

// Run in console
testItemAccess('ironSword');
testAllItemsAccessible();
```

---

## 11. Summary

### The Rules:

1. **ALWAYS use ItemRegistry** as the single source of truth
2. **Systems use `_getItemDef()` helper** for item access
3. **GameEngine uses `this.getItem()`** for item access
4. **UI uses `GameEngine.getItem()` or `ItemRegistry.getItem()`**
5. **NEVER directly access `definitions.items`** (deprecated pattern)

### Quick Reference Card:

```javascript
// ✅ CORRECT PATTERNS

// In Systems:
const item = SystemName._getItemDef.call(this, itemId);

// In GameEngine:
const item = this.getItem(itemId);

// In UI:
const item = GameEngine.getItem(itemId);
const item = ItemRegistry.getItem(itemId);

// ❌ WRONG PATTERNS (DEPRECATED)

// Never use these:
const item = this.definitions.items[itemId];
const item = engine.definitions.items[itemId];
const item = GameEngine.definitions.items[itemId];
```

### Benefits:

- ✅ Single source of truth
- ✅ Consistent behavior across codebase
- ✅ Multi-environment support (dev/test/production/legacy)
- ✅ Validation on registration
- ✅ Query and filter capabilities
- ✅ Easy debugging and statistics
- ✅ Future-proof for migrations

---

**END OF STANDARD**
