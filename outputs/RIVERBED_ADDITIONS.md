# Riverbed Node & Materials Added

## What Was Added

### 1. New Mining Node: **Riverbed**
- **ID**: `riverbed`
- **Type**: Tier 1 mining node
- **Location**: Starting region, plains, river biomes
- **Requirements**: Mining skill level 1, any pickaxe (tier 1+)
- **Harvest Time**: 3.0 seconds
- **Respawn Time**: 30 seconds
- **Health**: 10 (8-15 range)

**Resource Drops:**
- **Clay** - 60% chance (1-3 yield)
- **Flint** - 39% chance (1-2 yield)
- **Gold Flakes** - 1% chance (1 yield, rare!)

### 2. New Material Items

**Clay:**
- Common material
- Used for crafting and pottery
- Stack limit: 100
- Value: 3 gold
- Icon: 🟤

**Flint:**
- Common material
- Essential for tool-making and fire-starting
- Stack limit: 100
- Value: 5 gold
- Icon: ⚫

**Gold Flakes:**
- Rare material
- Precious and valuable
- Stack limit: 50
- Value: 100 gold (rare drop!)
- Icon: ✨

## Files Updated

✅ **nodes.csv** - Added Riverbed node (29 nodes total)
✅ **items.csv** - Added Clay, Flint, Gold Flakes (197 items total)

Both files copied to `outputs/` folder.

## Next Steps

### 1. Import Updated CSVs to Excel

**Option A - Re-import entire sheet:**
1. Open Excel: `C:\Users\durha\OneDrive\OneSoul_GameData\OneSoul_GameData.xlsx`
2. Delete the old `nodes` worksheet
3. Create new `nodes` worksheet
4. Import `outputs/nodes.csv`
5. Delete the old `items` worksheet
6. Create new `items` worksheet
7. Import `outputs/items.csv`
8. Save (Ctrl+S)

**Option B - Add rows manually:**
1. Open Excel
2. Go to `nodes` worksheet
3. Add the Riverbed row at the bottom (copy from CSV)
4. Go to `items` worksheet
5. Add Clay, Flint, Gold Flakes rows (copy from CSV)
6. Save (Ctrl+S)

### 2. Export to JSON

```bash
cd C:\Users\durha\oneSoul_idle_RPG
npm run export-data
```

**Expected output:**
```
✅ Export complete!

Results:
   items: 197 records → items.json  (was 194, now +3)
   nodes: 29 records → nodes.json   (was 28, now +1)
   ...
```

### 3. Test in Game

1. Start your dev server
2. Open the game
3. Navigate to starting region
4. Look for "Riverbed" node
5. Mine it with a pickaxe
6. Should get: Clay (common), Flint (common), Gold Flakes (rare 1%)

## Game Balance Notes

**Riverbed is designed as a starter node:**
- Tier 1 (accessible immediately)
- Low health (quick to harvest)
- Fast respawn (30 seconds)
- Outputs useful crafting materials
- Small chance for valuable gold flakes (1%)

**Resource Rarity:**
- Clay: 60% - Primary output, common crafting material
- Flint: 39% - Secondary output, tool-making material
- Gold Flakes: 1% - Rare valuable drop for economy

## Future Additions

Ready to add more nodes? Let me know:
- Logging nodes (trees, wood types)
- Fishing nodes (ponds, rivers)
- Foraging nodes (bushes, plants)
- Hunting nodes (animal spawns)

Just tell me the details and I'll add them the same way!

---

**Status**: ✅ Ready to import into Excel
**Location**: All files in `C:\Users\durha\oneSoul_idle_RPG\outputs\`
