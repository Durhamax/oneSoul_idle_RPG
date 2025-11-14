# Item Registry System

Multi-environment item organization for development, testing, and production.

## 📁 Directory Structure

```
src/data/items/
│
├── 📄 itemRegistry.js           # Registry core (manages all registries)
├── 📄 itemSchema.js             # Item schema definitions
├── 📄 itemValidator.js          # Validation system
├── 📄 index.js                  # Main database (registers & exposes items)
│
├── 📄 README.md                 # Schema documentation
├── 📄 UNIFIED_SYSTEM.md         # System overview
├── 📄 REGISTRY_README.md        # This file
│
├── 🧪 testItemValidator.js      # Validator test suite
├── 🧪 testUnifiedSystem.js      # System test suite
│
├── 📂 production/               # PRODUCTION ITEMS (84 items)
│   ├── equipment/
│   │   └── equipment.js         # Weapons, armor, tools (24 items)
│   ├── consumables/
│   │   └── consumables.js       # Potions, food, scrolls (15 items)
│   ├── materials/
│   │   └── materials.js         # Ores, bars, wood, herbs (28 items)
│   └── currencies/
│       └── currencies.js        # Currencies, quest items, special (17 items)
│
├── 📂 dev/                      # DEV ITEMS (8 items)
│   └── devItems.js              # Overpowered testing items
│
├── 📂 test/                     # TEST ITEMS (3 items)
│   └── testItems.js             # Temporary test items
│
├── 📂 legacy/                   # LEGACY ITEMS (3 items)
│   └── legacyItems.js           # Deprecated items (backwards compat)
│
└── 📂 planned/                  # PLANNED ITEMS (5 items)
    └── plannedItems.js          # Future items (documentation)
```

## 🎯 Registries Explained

### Production Registry (84 items)
- **Purpose:** Real game items that ship to players
- **Status:** ✅ Always active
- **Location:** `production/[category]/`
- **Examples:** Iron Sword, Health Potion, Copper Ore

### Dev Registry (8 items)
- **Purpose:** Overpowered items for testing
- **Status:** ❌ Inactive by default
- **Enable:** `ItemRegistry.enableDevMode()`
- **Location:** `dev/devItems.js`
- **Examples:** `[DEV] Super Sword`, `[DEV] Gold Pile`

### Test Registry (3 items)
- **Purpose:** Temporary items for feature testing
- **Status:** ❌ Inactive by default
- **Enable:** `ItemRegistry.enableDevMode()`
- **Location:** `test/testItems.js`
- **Examples:** `[TEST] Dummy Item`, `[TEST] Stacking Item`

### Legacy Registry (3 items)
- **Purpose:** Deprecated items for backwards compatibility
- **Status:** ✅ Active by default
- **Location:** `legacy/legacyItems.js`
- **Examples:** `old_stone_sword`, `old_small_potion`

### Planned Registry (5 items)
- **Purpose:** Future items (design documentation)
- **Status:** ❌ Inactive by default
- **Enable:** `ItemRegistry.enablePreviewMode()`
- **Location:** `planned/plannedItems.js`
- **Examples:** `planned_mythril_sword`, `planned_dragon_bow`

## 🚀 Quick Start

### Basic Usage

```javascript
// Get an item from active registries
const sword = ItemRegistry.getItem('ironSword');

// Get all production items
const production = ItemRegistry.getProduction();

// Get items by tier
const starterItems = ItemRegistry.getItemsByTier('starter');

// Get items by category
const weapons = ItemRegistry.getItemsByCategory('equipment');

// Search items
const swordResults = ItemRegistry.searchItems('sword');
```

### Toggle Registries

```javascript
// Enable dev mode (includes dev + test items)
ItemRegistry.enableDevMode();

// Enable preview mode (includes planned items)
ItemRegistry.enablePreviewMode();

// Reset to defaults (production + legacy only)
ItemRegistry.resetConfig();
```

### Statistics

```javascript
// Get registry statistics
const stats = ItemRegistry.getStatistics();

// Print formatted summary
ItemRegistry.printSummary();
```

## 📋 Adding New Items

### Production Items

Add to appropriate category file in `production/`:

```javascript
// In production/equipment/equipment.js
const EQUIPMENT_ITEMS = {
    newSword: {
        id: 'newSword',
        name: 'New Sword',
        description: 'A newly added sword.',
        icon: '⚔️',
        category: 'equipment',
        rarity: 'uncommon',
        level: 12,
        slot: 'weapon',
        tier: 'intermediate',
        combatStats: { damage: 35 },
        tags: ['weapon', 'sword'],
    },
};
```

### Dev Items

Add to `dev/devItems.js`:

```javascript
const DEV_ITEMS = {
    devTestItem: {
        id: 'devTestItem',
        name: '[DEV] Test Item',
        description: 'For testing.',
        icon: '🔨',
        category: 'special',
        rarity: 'epic',
        value: 0,
        sellable: false,
        tags: ['dev', 'testing'],
    },
};
```

### Test Items

Add to `test/testItems.js` (delete after testing):

```javascript
const TEST_ITEMS = {
    testNewFeature: {
        id: 'testNewFeature',
        name: '[TEST] Feature Test',
        description: 'Testing new feature.',
        icon: '⚡',
        category: 'special',
        tags: ['test'],
    },
};
```

### Legacy Items

Add to `legacy/legacyItems.js`:

```javascript
const LEGACY_ITEMS = {
    old_item: {
        id: 'old_item',
        name: '[LEGACY] Old Item',
        description: 'Deprecated. Replaced by newItem.',
        icon: '📦',
        category: 'material',
        deprecated: true,
        replacedBy: 'newItem',
        tags: ['legacy'],
    },
};
```

### Planned Items

Add to `planned/plannedItems.js`:

```javascript
const PLANNED_ITEMS = {
    planned_item: {
        id: 'planned_item',
        name: '[PLANNED] New Item',
        description: 'Coming in v2.0.',
        icon: '✨',
        category: 'special',
        rarity: 'epic',
        planned: true,
        plannedVersion: '2.0',
        tags: ['planned'],
    },
};
```

## 🔄 Item Lifecycle

1. **Planning** → Add to `planned/`
2. **Development** → Move to `dev/`
3. **Testing** → Use `test/` for feature tests
4. **Production** → Move to `production/[category]/`
5. **Deprecation** → Move to `legacy/` (if needed for saves)

## ✅ Benefits

- ✅ **Clean separation** - Items organized by purpose
- ✅ **Toggle dev items** - Easy testing without cluttering production
- ✅ **Backwards compatible** - Legacy items prevent save corruption
- ✅ **Future planning** - Document planned items before coding
- ✅ **Easy filtering** - Category, tier, rarity, level, search
- ✅ **Statistics** - Track counts per registry

## 📖 Documentation

- **Complete Guide:** `ITEM_INTEGRATION_GUIDE.md`
- **Registry Guide:** `ITEM_REGISTRY_GUIDE.md`
- **Schema Docs:** `README.md`
- **System Overview:** `UNIFIED_SYSTEM.md`

## 🧪 Testing

Run in browser console:

```javascript
// Load test script
const script = document.createElement('script');
script.src = 'test_registry.js';
document.head.appendChild(script);
```

Or manually:

```javascript
ItemRegistry.printSummary();
ItemRegistry.enableDevMode();
ItemRegistry.getStatistics();
```

---

**Version:** 1.0.0
**Status:** Production Ready
**Total Items:** 103 (84 production + 8 dev + 3 test + 3 legacy + 5 planned)
