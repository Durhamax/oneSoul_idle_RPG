# ItemRegistry Quick Reference Card

## THE SINGLE RULE
**ALWAYS use ItemRegistry for item access. NEVER use `definitions.items` directly.**

---

## Quick Copy-Paste Patterns

### In Systems (InventorySystem, EquipmentSystem, etc.):
```javascript
const MySystem = {
    _getItemDef(itemId) {
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }
        return this.definitions?.items?.[itemId] || null;
    },

    someMethod(itemId) {
        const item = MySystem._getItemDef.call(this, itemId);
        if (!item) {
            console.error(`Item not found: ${itemId}`);
            return;
        }
        // ... use item ...
    }
};
```

### In GameEngine:
```javascript
const item = this.getItem(itemId);
```

### In UI Components:
```javascript
const item = GameEngine.getItem(itemId);
// or
const item = ItemRegistry.getItem(itemId);
```

---

## Common Queries

```javascript
// Get single item
ItemRegistry.getItem('ironSword')

// Check if exists
ItemRegistry.hasItem('ironSword')

// Get all items
ItemRegistry.getAllActive()

// Filter by category
ItemRegistry.getItemsByCategory('equipment')

// Filter by rarity
ItemRegistry.getItemsByRarity('legendary')

// Search
ItemRegistry.searchItems('sword')

// Statistics
ItemRegistry.getStatistics()
ItemRegistry.printSummary()
```

---

## ✅ DO THIS

```javascript
// Systems
const item = SystemName._getItemDef.call(this, itemId);

// GameEngine
const item = this.getItem(itemId);

// UI
const item = GameEngine.getItem(itemId);
const item = ItemRegistry.getItem(itemId);
```

## ❌ DON'T DO THIS

```javascript
// NEVER use these (deprecated):
const item = this.definitions.items[itemId];
const item = engine.definitions.items[itemId];
const item = GameEngine.definitions.items[itemId];
```

---

## Full Documentation
See `ITEM_ACCESS_STANDARD.md` for complete reference.
