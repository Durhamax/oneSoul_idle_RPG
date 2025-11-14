# Item Migration Guide

Complete guide for migrating items from the old format (definitions.js) to the new Item Registry system.

## 🎯 Overview

The migration system provides **automatic backwards compatibility** while transitioning to the new item schema. All existing items from definitions.js are automatically wrapped and made available through ItemRegistry.

## 🔄 How Migration Works

### Automatic Migration (On Game Load)

When the game loads:

1. **Item Integration initializes** (`itemIntegration.js`)
2. **Detects definitions.js items** (old format)
3. **Wraps each item** using DefinitionsAdapter (converts old format → new format)
4. **Registers to legacy registry** (items not already in production)
5. **All items available** through ItemRegistry and ItemUtils

### No Manual Work Required

✅ **All definitions.js items work immediately**
✅ **No game functionality breaks**
✅ **Gradual migration supported**
✅ **Both systems coexist**

## 📋 Format Differences

### Old Format (definitions.js)

```javascript
stone_pickaxe: {
    name: "Stone Pickaxe",
    description: "A crude pickaxe made from stone",
    image: "⛏️",              // OLD: uses 'image'
    stackLimit: 1,
    category: "tool",         // OLD: category names different
    equipSlot: "weapon",      // OLD: uses 'equipSlot'
    stats: {                  // OLD: uses 'stats'
        pickaxeDamage: 3,
        attackDamage: 2,
        weight: 5,
        damageType: "pierce"
    }
}
```

### New Format (Unified System)

```javascript
stonePickaxe: {
    id: 'stonePickaxe',
    name: 'Stone Pickaxe',
    description: 'A crude pickaxe made from stone',
    icon: '⛏️',               // NEW: uses 'icon'
    category: 'equipment',    // NEW: standardized categories
    rarity: 'common',         // NEW: required field
    stackLimit: 1,
    value: 20,                // NEW: required field
    level: 1,                 // NEW: required field
    slot: 'tool',             // NEW: uses 'slot'
    tier: 'starter',          // NEW: equipment tier
    combatStats: {            // NEW: uses 'combatStats'
        miningPower: 3,
        damage: 2,
        weight: 5,
        damageType: 'pierce'
    },
    requirements: {},         // NEW: skill/level requirements
    tags: ['tool', 'pickaxe', 'mining', 'starter'],  // NEW: searchable tags
    sellable: true,
    tradeable: true,
    droppable: true,
}
```

## 🔧 Adapter Conversions

The DefinitionsAdapter automatically converts:

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `image` | `icon` | Direct rename |
| `equipSlot` | `slot` | Direct rename |
| `stats` | `combatStats` | Object with stat mapping |
| `category: "tool"` | `category: "equipment"` | Category standardization |
| `category: "ore"` | `category: "material"` | Material categorization |
| - | `rarity` | **Inferred from name** |
| - | `value` | **Calculated from rarity** |
| - | `level` | **Inferred from name** |
| - | `tier` | **Inferred from name** |
| - | `requirements` | **Inferred from level/type** |
| - | `tags` | **Generated from name/category** |

### Stat Mapping

```javascript
// Old stats → New combatStats
pickaxeDamage  → miningPower
chopDamage     → woodcuttingPower
fishingPower   → fishingPower (unchanged)
huntingPower   → huntingPower (unchanged)
attackDamage   → damage
weight         → weight (unchanged)
damageType     → damageType (unchanged)
```

## 📊 Migration Status

### Check Migration Status

Open browser console after loading game:

```javascript
// Check what was migrated
ItemRegistry.printSummary();

// Detailed status
DefinitionsAdapter.printMigrationStatus(GameEngine.definitions.items);
```

Output example:
```
╔════════════════════════════════════════╗
║       MIGRATION STATUS                ║
╚════════════════════════════════════════╝

📦 Total Items: 45
✅ Already Migrated: 4
➡️  Needs Migration: 41

📋 Items to Migrate (first 20):
   stone_pickaxe, bronzePickaxe, ironPickaxe, ...
```

### Registry Distribution

After migration:
- **Production Registry**: Manually curated items (84 items)
- **Legacy Registry**: Auto-migrated definitions.js items (41+ items)
- **Total Active**: 125+ items available

## 🎮 Usage After Migration

### Access Migrated Items

All migrated items work through ItemRegistry/ItemUtils:

```javascript
// Get migrated item
const pickaxe = ItemRegistry.getItem('stone_pickaxe');

// Or use ItemUtils
const pickaxe = ItemUtils.getItem('stone_pickaxe');

// Check if item is from legacy system
if (pickaxe._legacy) {
    console.log('This item was migrated from definitions.js');
    console.log('Original format:', pickaxe._originalFormat);
}
```

### Filtering Migrated Items

```javascript
// Get all legacy items
const legacyItems = ItemRegistry.getLegacy();

// Get only production items
const productionItems = ItemRegistry.getProduction();

// Filter migrated tools
const tools = ItemUtils.getItemsByCategory('equipment')
    .filter(item => item._legacy);
```

## ✅ Validation

All migrated items are automatically validated against the item schema.

### Run Validation

```javascript
// Validate all items (including migrated)
const results = ItemValidator.validateAll(ITEMS_DB);

// Print validation summary
ItemValidator.printSummary(results);
```

Expected results:
- **Valid**: 100% (all items pass validation)
- **Warnings**: Some expected warnings for legacy items (missing tags, default values, etc.)
- **Errors**: 0 (adapter ensures all required fields are present)

## 🔄 Gradual Migration Path

### Moving Items from Legacy to Production

When ready to move an item from legacy to production:

1. **Find the migrated item:**
   ```javascript
   const item = ItemRegistry.getItem('stone_pickaxe');
   console.log(item);  // Inspect auto-generated fields
   ```

2. **Manually create new version:**
   ```javascript
   // In production/equipment/tools.js
   stonePickaxe: {
       id: 'stonePickaxe',
       name: 'Stone Pickaxe',
       description: 'A crude pickaxe made from stone. Better than nothing.',
       icon: '⛏️',
       category: 'equipment',
       rarity: 'common',
       stackLimit: 1,
       value: 20,
       level: 1,
       slot: 'tool',
       tier: 'starter',
       combatStats: {
           miningPower: 3,
           damage: 2,
           weight: 5,
           damageType: 'pierce'
       },
       requirements: {
           mining: 1
       },
       tags: ['tool', 'pickaxe', 'mining', 'starter', 'stone'],
   },
   ```

3. **Remove from definitions.js** (or keep for backwards compat)

4. **Reload game** - Production version takes precedence

### Benefits of Manual Migration

- **Better data quality**: Manually review and improve item data
- **Complete schema compliance**: Fill in all optional fields
- **Better balance**: Adjust values for game balance
- **Richer tags**: Add more specific, useful tags
- **Accurate requirements**: Set precise skill/level requirements

## 🚨 Common Issues

### Issue: Item not found after migration

**Cause**: Item ID mismatch (definitions.js uses different ID)

**Solution**:
```javascript
// Find the actual ID
Object.keys(GameEngine.definitions.items).filter(id =>
    id.toLowerCase().includes('pickaxe')
);

// Use the correct ID
const item = ItemUtils.getItem('stone_pickaxe');  // Note underscore
```

### Issue: Stats don't match expected values

**Cause**: Auto-inference may not match original intent

**Solution**: Manually migrate item to production registry with correct values

### Issue: Legacy items have wrong category

**Cause**: Adapter maps old categories to new standard

**Solution**:
- Check adapter category mapping in `definitionsAdapter.js`
- Manually migrate to production with correct category

## 📝 Best Practices

### During Transition Period

1. **Leave definitions.js intact** - Don't delete items yet
2. **Test thoroughly** - Verify all functionality works with migrated items
3. **Migrate incrementally** - Move items to production one category at a time
4. **Validate frequently** - Run validation after each batch migration

### After Full Migration

1. **Archive definitions.js items** - Keep as backup
2. **Update all code references** - Use new item IDs where needed
3. **Document changes** - Note any item ID or stat changes
4. **Remove deprecated items** - Clean up after confirming no usage

## 🧪 Testing

### Test Migrated Items

```javascript
// Load test script
const script = document.createElement('script');
script.src = 'analyze_definitions_items.js';
document.head.appendChild(script);
```

### Manual Tests

```javascript
// 1. Check item exists
ItemUtils.hasItem('stone_pickaxe');  // Should return true

// 2. Check item data
const item = ItemUtils.getItem('stone_pickaxe');
console.log(item);  // Inspect all fields

// 3. Check combatStats conversion
console.log(item.combatStats.miningPower);  // Should be 3

// 4. Check legacy flag
console.log(item._legacy);  // Should be true

// 5. Search works
const tools = ItemUtils.searchItems('pickaxe');
console.log(`Found ${tools.length} pickaxes`);
```

## 📚 Migration Utilities

### Analyze Items

```javascript
// Compare definitions.js with unified system
DefinitionsAdapter.printMigrationStatus(GameEngine.definitions.items);
```

### Convert Single Item

```javascript
// Manually convert one item
const converted = ItemMigrationUtility.convertToNewFormat(
    'stone_pickaxe',
    GameEngine.definitions.items.stone_pickaxe
);

console.log(converted);
```

### Batch Convert

```javascript
// Convert all items (for reference)
const allConverted = ItemMigrationUtility.migrateAll(
    GameEngine.definitions.items
);

// Export for manual review
console.log(JSON.stringify(allConverted, null, 2));
```

## 🎯 Summary

✅ **Automatic migration** - No manual work required
✅ **100% backwards compatible** - All items work immediately
✅ **Gradual migration path** - Move items to production incrementally
✅ **Validation included** - All migrated items validated
✅ **Both systems coexist** - Old and new formats work together
✅ **Production ready** - Safe to use in live game

The migration system ensures a smooth transition from the old item format to the new unified system without breaking any existing functionality!

---

**Created**: 2025-01-10
**Version**: 1.0.0
**Status**: Production Ready
