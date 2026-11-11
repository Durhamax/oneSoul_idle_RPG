# CSV Column Ordering Guide

## Problem

When you import CSV files into Excel, the columns appear in whatever order they're in the CSV. If you reorder columns in Excel, then re-import the CSV, you lose your custom order.

## Solution

The CSV files now have columns pre-ordered with important fields first!

## New Column Order

### Items (67 columns)
**First 10 visible columns:**
1. `id` - Item identifier
2. `name` - Display name
3. `_status` - active/disabled/planned
4. `_tier` - Tier reference
5. `category` - equipment/consumable/material
6. `rarity` - common/uncommon/rare/epic
7. `description` - What the item does
8. `value` - Gold value
9. `icon` - Emoji icon
10. `...` - Remaining 57 columns alphabetically

### Nodes (57 columns)
**First 10 visible columns:**
1. `id` - Node identifier
2. `name` - Display name
3. `_status` - active/disabled/planned
4. `icon` - Emoji icon
5. `tier` - Difficulty tier (1-3)
6. `nodeType` - mining/logging/fishing/etc.
7. `category` - ore_deposit/tree/fish_spot/etc.
8. `description` - What the node is
9. `baseHealth` - How many hits to harvest
10. `...` - Remaining 47 columns alphabetically

### Enemies (51 columns)
**First 6 visible columns:**
1. `id` - Enemy identifier
2. `name` - Display name
3. `_status` - active/disabled/planned
4. `_difficulty` - Difficulty reference
5. `description` - Enemy description
6. `...` - Remaining 45 columns alphabetically

### Skills, Regions, Recipes, Missions
Similar ordering with `id`, `name`, `_status`, `description` first.

## How to Use

### When Importing CSVs to Excel:

1. **Delete old worksheet** (if exists)
2. **Create new worksheet** with same name
3. **Import CSV from outputs/** folder
4. Columns will already be in the right order! ✅

### When You Add New Nodes/Items:

After adding data (via my scripts or manually in CSV):

```bash
npm run reorder-csv
```

This will:
- Reorder all CSV files
- Put important columns first
- Copy to outputs/ folder
- Ready for Excel import

### Workflow Example:

```bash
# 1. Add new nodes (I do this for you)
node scripts/add-cradle-lake.js

# 2. Reorder columns
npm run reorder-csv

# 3. Import to Excel
# Open Excel, import from outputs/

# 4. Edit in Excel, save

# 5. Export to JSON
npm run export-data

# 6. Test in game
```

## Manual Reordering (If You Want Different Order)

If you want a different column order:

1. Edit `scripts/reorder-csv-columns.js`
2. Change the `columnOrders` object:
```javascript
const columnOrders = {
    items: ['id', 'name', 'YOUR_COLUMN', 'icon', ...],
    nodes: ['id', 'name', 'YOUR_COLUMN', 'tier', ...],
    // etc.
};
```
3. Run `npm run reorder-csv`

## Benefits

✅ **id always visible** - No more scrolling to column 50+
✅ **Consistent order** - Same order every time you import
✅ **Logical grouping** - Important metadata first, details later
✅ **Less scrolling** - See key info without horizontal scrolling
✅ **Easier editing** - Quickly identify items by id + name

## Column Hiding in Excel

Once imported, you can still:
- **Hide columns** you rarely use (right-click → Hide)
- **Freeze panes** to keep id/name visible while scrolling
- **Filter/sort** by any column
- **Add new columns** (will be alphabetically sorted on next reorder)

Hidden columns are still exported to JSON - hiding is just for your viewing convenience!

## NPM Scripts Reference

| Command | What It Does |
|---------|-------------|
| `npm run extract-csv` | Extract from definitions.js → CSV (includes reordering) |
| `npm run reorder-csv` | Reorder existing CSV files |
| `npm run export-data` | Export Excel → JSON |
| `npm run validate-data` | Validate JSON files |
| `npm run workflow` | Export + Validate (combined) |

---

**Status**: ✅ All CSV files now have logical column order
**Next**: Import updated CSVs from `outputs/` folder into Excel
