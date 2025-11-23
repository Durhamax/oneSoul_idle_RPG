# Import Missions and Nodes to Excel

## New CSV Files Created

Two new CSV files have been generated:

- **missions.csv** (4 missions)
- **nodes.csv** (28 resource nodes)

These need to be imported into your Excel workbook as new worksheets.

## Import Steps

### 1. Open Your Excel File
Open: `C:\Users\durha\OneDrive\OneSoul_GameData\OneSoul_GameData.xlsx`

### 2. Import missions.csv

1. **Create new worksheet**:
   - Right-click on the worksheet tabs at the bottom
   - Select "Insert" → "Worksheet"
   - Rename the new sheet to exactly: `missions` (lowercase)

2. **Import the CSV**:
   - With the `missions` worksheet selected
   - Go to **Data** tab → **Get Data** → **From File** → **From Text/CSV**
   - Browse to: `C:\Users\durha\oneSoul_idle_RPG\outputs\missions.csv`
   - Click "Load"

3. **Format the sheet** (optional):
   - Freeze top row: Select row 2, then **View** → **Freeze Panes** → **Freeze Top Row**
   - Add filters: Select header row, then **Data** → **Filter**
   - Auto-fit columns: Select all columns (Ctrl+A), then double-click column border

### 3. Import nodes.csv

1. **Create new worksheet**:
   - Right-click on worksheet tabs
   - Select "Insert" → "Worksheet"
   - Rename to exactly: `nodes` (lowercase)

2. **Import the CSV**:
   - With `nodes` worksheet selected
   - Go to **Data** → **Get Data** → **From File** → **From Text/CSV**
   - Browse to: `C:\Users\durha\oneSoul_idle_RPG\outputs\nodes.csv`
   - Click "Load"

3. **Format the sheet** (optional):
   - Freeze top row
   - Add filters
   - Auto-fit columns

### 4. Save the Excel File

- Press **Ctrl+S** to save
- Excel will save to OneDrive automatically

### 5. Test the Export

After saving, test that the export works:

```bash
cd C:\Users\durha\oneSoul_idle_RPG
npm run export-data
```

You should see output like:
```
✅ Export complete!

Results:
   items: 194 records → items.json
   recipes: 31 records → recipes.json
   enemies: 7 records → enemies.json
   regions: 3 records → regions.json
   skills: 15 records → skills.json
   missions: 4 records → missions.json
   nodes: 28 records → nodes.json
```

## Column Structure

### Missions Columns
The missions CSV includes flattened nested data like:
- `id`, `name`, `description`
- `metadata_category`, `metadata_difficulty`, `metadata_region`
- `requirements_characterLevel`, `requirements_completedMissions`
- `rewards_base_exp_mining`, `rewards_base_currencies_gold`
- `dialog_npc`, `dialog_intro`, `dialog_body`
- `_notes`, `_status` (reference columns, not exported)

### Nodes Columns
The nodes CSV includes:
- `id`, `name`, `description`, `icon`
- `nodeType`, `category`, `tier`
- `baseHealth`, `harvestTime`, `respawnTime`
- `requiredSkillLevel`, `baseXP`
- `resourceTable` (JSON array of loot)
- `biomes`, `spawnWeight`
- `requirements_skill`, `requirements_toolTier`
- `_notes`, `_status` (reference columns)

## Editing Data

### Tips for Editing
- **Reference columns** (starting with `_`) won't be exported, use them for notes
- **Complex data** like `resourceTable` uses JSON format: `[{"itemId":"copperOre","weight":80}]`
- **Booleans** should be `TRUE` or `FALSE` (Excel will auto-convert)
- **Empty cells** will be skipped during export (not included in JSON)

### After Making Changes
1. Save Excel file (Ctrl+S)
2. Run export: `npm run export-data`
3. Test in game

## Troubleshooting

### "Sheet not found" error
- Make sure worksheet names are exactly: `missions` and `nodes` (lowercase, no spaces)

### "No data exported"
- Check that the first row has column headers
- Ensure `id` column exists with values

### Validation errors
- Run `npm run validate-data` to check for issues
- Fix any missing required fields

---

**All done!** Your Excel file now has complete game data including Missions and Nodes.
