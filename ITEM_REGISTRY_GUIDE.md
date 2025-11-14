# Item Registry System - Complete Guide

The Item Registry is a multi-environment organization system that separates items by purpose and lifecycle stage.

## 🎯 Purpose

Cleanly separate items into logical registries:
- **Production** - Real game items (always active)
- **Dev** - Development/testing items (toggle on/off)
- **Test** - Temporary test items (delete after testing)
- **Legacy** - Deprecated items (backwards compatibility)
- **Planned** - Future items (documentation/previews)

## 📁 Directory Structure

```
src/data/items/
├── itemRegistry.js              # Registry system core
├── itemSchema.js                # Item schema definitions
├── itemValidator.js             # Validation system
├── index.js                     # Main database (registers all items)
│
├── production/                  # PRODUCTION ITEMS (always active)
│   ├── equipment/
│   │   └── equipment.js         # 24 equipment items
│   ├── consumables/
│   │   └── consumables.js       # 15 consumable items
│   ├── materials/
│   │   └── materials.js         # 28 material items
│   └── currencies/
│       └── currencies.js        # 17 currency/special items
│
├── dev/                         # DEV ITEMS (testing only)
│   └── devItems.js              # 8 dev testing items
│
├── test/                        # TEST ITEMS (temporary)
│   └── testItems.js             # 3 test items
│
├── legacy/                      # LEGACY ITEMS (deprecated)
│   └── legacyItems.js           # 3 legacy items
│
└── planned/                     # PLANNED ITEMS (future)
    └── plannedItems.js          # 5 planned items
```

## 🚀 Basic Usage

### Access Items from Active Registries

```javascript
// Get an item (checks all active registries)
const sword = ItemRegistry.getItem('ironSword');

// Check if item exists
const exists = ItemRegistry.hasItem('ironSword');

// Get all active items
const allItems = ItemRegistry.getAllActive();
```

### Filter by Category, Tier, Rarity

```javascript
// Get all weapons
const weapons = ItemRegistry.getItemsByCategory('equipment');

// Get starter tier items
const starterItems = ItemRegistry.getItemsByTier('starter');

// Get rare items
const rareItems = ItemRegistry.getItemsByRarity('rare');

// Get items for a specific slot
const helmets = ItemRegistry.getItemsBySlot('head');
```

### Search Items

```javascript
// Text search (name, description, tags)
const swordResults = ItemRegistry.searchItems('sword');

// Get items by level range
const earlyItems = ItemRegistry.getItemsByLevelRange(1, 10);
```

## ⚙️ Registry Configuration

### Default Configuration

By default, the registry includes:
- ✅ Production items (always active)
- ✅ Legacy items (active for save compatibility)
- ❌ Dev items (inactive)
- ❌ Test items (inactive)
- ❌ Planned items (inactive)

### Toggle Dev Items

```javascript
// Enable dev mode (includes dev + test items)
ItemRegistry.enableDevMode();

// Disable dev mode (production only)
ItemRegistry.disableDevMode();

// Check dev item
const devSword = ItemRegistry.getItem('devSuperSword');
```

### Toggle Planned Items

```javascript
// Enable preview mode (show planned items)
ItemRegistry.enablePreviewMode();

// Disable preview mode
ItemRegistry.disablePreviewMode();

// Check planned item
const mythrilSword = ItemRegistry.getItem('planned_mythril_sword');
```

### Manual Configuration

```javascript
// Manually configure what's included
ItemRegistry.config.includeDevItems = true;
ItemRegistry.config.includeTestItems = true;
ItemRegistry.config.includeLegacyItems = false;
ItemRegistry.config.includePlannedItems = true;

// Reset to defaults
ItemRegistry.resetConfig();
```

## 📊 Registry Statistics

### Get Statistics

```javascript
const stats = ItemRegistry.getStatistics();

console.log(stats);
// {
//   production: { count: 84, active: true },
//   dev: { count: 8, active: false },
//   test: { count: 3, active: false },
//   legacy: { count: 3, active: true },
//   planned: { count: 5, active: false },
//   totalActive: 87
// }
```

### Print Summary

```javascript
// Pretty-printed summary
ItemRegistry.printSummary();
```

Output:
```
╔════════════════════════════════════════╗
║       ITEM REGISTRY SUMMARY           ║
╚════════════════════════════════════════╝

📦 Registry Counts:
   Production:   84 items (✅ active)
   Dev:           8 items (❌ inactive)
   Test:          3 items (❌ inactive)
   Legacy:        3 items (✅ active)
   Planned:       5 items (❌ inactive)

🎯 Total Active: 87 items

⚙️  Configuration:
   Include Dev Items:     ❌ no
   Include Test Items:    ❌ no
   Include Legacy Items:  ✅ yes
   Include Planned Items: ❌ no
```

## 🔧 Adding New Items

### Adding Production Items

1. **Choose the appropriate category directory:**
   - `production/equipment/` - Weapons, armor, tools
   - `production/consumables/` - Potions, food, scrolls
   - `production/materials/` - Ores, bars, wood, herbs
   - `production/currencies/` - Currencies, quest items, special items

2. **Add item to the appropriate file:**

```javascript
// In production/equipment/equipment.js
const EQUIPMENT_ITEMS = {
    // ... existing items ...

    newSword: {
        id: 'newSword',
        name: 'New Sword',
        description: 'A newly added sword.',
        icon: '⚔️',
        category: 'equipment',
        rarity: 'uncommon',
        stackLimit: 1,
        value: 300,
        level: 12,
        slot: 'weapon',
        tier: 'intermediate',
        combatStats: {
            damage: 35,
            attackSpeed: 1.5,
        },
        tags: ['weapon', 'sword', 'melee'],
    },
};
```

3. **Items are automatically registered on page load** - No additional registration needed!

### Adding Dev Items

```javascript
// In dev/devItems.js
const DEV_ITEMS = {
    devNewTestItem: {
        id: 'devNewTestItem',
        name: '[DEV] New Test Item',
        description: 'For testing new feature.',
        icon: '🔨',
        category: 'special',
        rarity: 'epic',
        stackLimit: 99,
        value: 0,
        sellable: false,
        tags: ['dev', 'testing'],
    },
};
```

### Adding Test Items

```javascript
// In test/testItems.js
const TEST_ITEMS = {
    testNewFeature: {
        id: 'testNewFeature',
        name: '[TEST] New Feature Test',
        description: 'Temporary item for testing.',
        icon: '⚡',
        category: 'special',
        rarity: 'common',
        stackLimit: 1,
        value: 0,
        tags: ['test'],
    },
};
```

### Adding Legacy Items

```javascript
// In legacy/legacyItems.js
const LEGACY_ITEMS = {
    old_item_id: {
        id: 'old_item_id',
        name: '[LEGACY] Old Item Name',
        description: 'Deprecated. Replaced by newItemId.',
        icon: '📦',
        category: 'material',
        rarity: 'common',
        stackLimit: 99,
        value: 5,
        deprecated: true,
        replacedBy: 'newItemId',
        tags: ['legacy', 'deprecated'],
    },
};
```

### Adding Planned Items

```javascript
// In planned/plannedItems.js
const PLANNED_ITEMS = {
    planned_new_weapon: {
        id: 'planned_new_weapon',
        name: '[PLANNED] New Weapon',
        description: 'Coming in version 2.0.',
        icon: '⚔️',
        category: 'equipment',
        rarity: 'epic',
        stackLimit: 1,
        value: 5000,
        level: 30,
        slot: 'weapon',
        tier: 'elite',
        combatStats: {
            damage: 100,
        },
        planned: true,
        plannedVersion: '2.0',
        tags: ['planned', 'weapon'],
    },
};
```

## 📋 Item Registries Explained

### Production Registry

**Purpose:** Real game items that ship to players.

**Characteristics:**
- Always active (cannot be disabled)
- Fully implemented and tested
- Available to all players
- Organized by category in subdirectories

**Examples:**
- Iron Sword
- Health Potion
- Copper Ore
- Gold currency

### Dev Registry

**Purpose:** Testing and development items.

**Characteristics:**
- Inactive by default (enable with `ItemRegistry.enableDevMode()`)
- Over-powered stats for testing
- Prefixed with `[DEV]` in name
- Not sellable/droppable
- Should never ship to production

**Examples:**
- `[DEV] Super Sword` - 9999 damage weapon
- `[DEV] God Armor` - Invincibility armor
- `[DEV] Gold Pile` - Instant 1,000,000 gold
- `[DEV] Level Booster` - Instant 10 levels

**Use Cases:**
- Testing combat balance
- Testing economy
- Testing endgame content
- Debugging progression systems

### Test Registry

**Purpose:** Temporary items for testing specific features.

**Characteristics:**
- Inactive by default (enable with `ItemRegistry.enableDevMode()`)
- Meant to be deleted after testing
- Prefixed with `[TEST]` in name
- Simple/minimal items for isolated testing

**Examples:**
- `[TEST] Dummy Item` - Basic inventory testing
- `[TEST] Stacking Item` - Stack mechanics testing
- `[TEST] Unique Item` - Unique item handling

**Use Cases:**
- Testing inventory system changes
- Testing new item mechanics
- Isolated feature testing
- Bug reproduction

### Legacy Registry

**Purpose:** Deprecated items kept for backwards compatibility.

**Characteristics:**
- Active by default (for save file compatibility)
- Marked with `deprecated: true`
- Often has `replacedBy` field
- Prefixed with `[LEGACY]` in name
- Can be disabled if no old saves exist

**Examples:**
- `old_stone_sword` - Replaced by `bronzeSword`
- `old_small_potion` - Replaced by `minorHealthPotion`
- `removed_cursed_amulet` - Removed from game entirely

**Use Cases:**
- Prevent save file corruption
- Graceful item migration
- Player communication about changes
- Maintaining historical context

### Planned Registry

**Purpose:** Documentation for future items.

**Characteristics:**
- Inactive by default (enable with `ItemRegistry.enablePreviewMode()`)
- Not fully implemented
- Has `planned: true` and `plannedVersion` fields
- Prefixed with `[PLANNED]` in name
- Serves as design documentation

**Examples:**
- `planned_mythril_sword` - Legendary weapon for v2.0
- `planned_dragon_bow` - Elite ranged weapon
- `planned_elixir_of_life` - Endgame consumable
- `planned_flying_mount` - Mount system feature

**Use Cases:**
- Planning future content
- Design documentation
- Preview builds for testing
- Community teasers

## 🔄 Integration with ItemUtils

ItemUtils automatically uses the ItemRegistry:

```javascript
// These all use ItemRegistry under the hood
ItemUtils.getItem('ironSword');
ItemUtils.getAllItems();
ItemUtils.getItemsByCategory('equipment');
ItemUtils.getItemsByTier('starter');
ItemUtils.searchItems('sword');
```

**Backwards Compatible:** If ItemRegistry isn't loaded, ItemUtils falls back to direct ITEMS_DB access.

## 🎮 Integration with Game Engine

The game engine has full access to the registry:

```javascript
// Access via GameEngine
GameEngine.ItemRegistry.enableDevMode();
GameEngine.ItemRegistry.getStatistics();

// Or use ItemUtils (attached to engine)
GameEngine.getUnifiedItem('ironSword');
GameEngine.findItems({ category: 'equipment' });
```

## ✅ Best Practices

### When to Use Each Registry

| Registry | Use For |
|----------|---------|
| **Production** | All real game items |
| **Dev** | Overpowered testing items |
| **Test** | Temporary feature testing |
| **Legacy** | Deprecated items from old versions |
| **Planned** | Future items (documentation) |

### Naming Conventions

- **Production:** `camelCase` (e.g., `ironSword`, `healthPotion`)
- **Dev:** `dev` prefix (e.g., `devSuperSword`, `devGoldPile`)
- **Test:** `test` prefix (e.g., `testDummyItem`, `testStackingItem`)
- **Legacy:** `old_` prefix or `removed_` (e.g., `old_stone_sword`, `removed_cursed_amulet`)
- **Planned:** `planned_` prefix (e.g., `planned_mythril_sword`, `planned_dragon_bow`)

### Item Lifecycle

1. **Planning** → Add to `planned/` registry
2. **Development** → Move to `dev/` registry
3. **Testing** → Use `test/` items for feature testing
4. **Production** → Move to `production/` registry
5. **Deprecation** → Move to `legacy/` registry (if still needed for saves)

### When to Delete vs. Legacy

**Move to Legacy if:**
- Item exists in player save files
- Need graceful migration to replacement
- Want to maintain historical record

**Delete entirely if:**
- Item was only in dev/test
- No player saves have the item
- Clean break is acceptable

## 🧪 Testing

### Browser Console Test

```javascript
// Load test script
const script = document.createElement('script');
script.src = 'test_registry.js';
document.head.appendChild(script);
```

### Manual Testing

```javascript
// 1. Check production items work
ItemRegistry.getItem('ironSword');  // Should return item

// 2. Verify dev items are off by default
ItemRegistry.getItem('devSuperSword');  // Should return null

// 3. Enable dev mode
ItemRegistry.enableDevMode();

// 4. Now dev items work
ItemRegistry.getItem('devSuperSword');  // Should return item

// 5. Check statistics
ItemRegistry.printSummary();

// 6. Reset
ItemRegistry.resetConfig();
```

## 📊 Examples

### Example: Different Item Tiers

```javascript
// Get all starter gear
const starterGear = ItemRegistry.getItemsByTier('starter');
console.log(`Starter: ${starterGear.map(i => i.name).join(', ')}`);

// Get all intermediate gear
const intermediateGear = ItemRegistry.getItemsByTier('intermediate');
console.log(`Intermediate: ${intermediateGear.map(i => i.name).join(', ')}`);
```

### Example: Building a Shop by Level

```javascript
function createShopForLevel(playerLevel) {
    // Get items appropriate for player level (±5 levels)
    const shopItems = ItemRegistry.getItemsByLevelRange(
        playerLevel - 5,
        playerLevel + 5
    ).filter(item => item.sellable !== false);

    console.log(`Shop items for level ${playerLevel}:`);
    shopItems.forEach(item => {
        console.log(`  ${item.icon} ${item.name} - ${item.value} gold`);
    });
}

createShopForLevel(10);
```

### Example: Dev Testing Workflow

```javascript
// 1. Enable dev mode for testing
ItemRegistry.enableDevMode();

// 2. Give yourself dev items
const devSword = ItemRegistry.getItem('devSuperSword');
const devGold = ItemRegistry.getItem('devGoldPile');

// 3. Test features with overpowered stats
// ... testing code ...

// 4. Reset when done
ItemRegistry.resetConfig();
```

### Example: Preview Future Content

```javascript
// Enable preview mode
ItemRegistry.enablePreviewMode();

// Show planned items
const plannedItems = ItemRegistry.getPlanned();
Object.values(plannedItems).forEach(item => {
    console.log(`${item.icon} ${item.name} - Coming in ${item.plannedVersion}`);
});

// Disable preview mode
ItemRegistry.disablePreviewMode();
```

## 🎯 Summary

✅ **Multi-environment support** - Production, Dev, Test, Legacy, Planned
✅ **Clean organization** - Items organized by purpose and lifecycle
✅ **Toggle dev items** - Easy on/off switching for testing
✅ **Backwards compatible** - Legacy items for old save files
✅ **Future planning** - Document planned items before implementation
✅ **Full filtering** - Category, tier, rarity, level, search
✅ **Statistics** - Track counts per registry
✅ **Seamless integration** - Works with existing ItemUtils and GameEngine

The Item Registry System provides a robust, scalable foundation for managing items across all stages of development!

---

**Created**: 2025-01-10
**Version**: 1.0.0
**Status**: Complete & Tested
