# OneSoul RPG - Excel + JSON Data Workflow

## Overview

This document describes the complete workflow for managing game data using Excel as the source of truth and JSON files for runtime loading.

## Architecture

```
Excel Workbook (OneDrive)          JSON Files (Git Repo)           Game Engine
━━━━━━━━━━━━━━━━━━━━━━            ━━━━━━━━━━━━━━━━━━━━            ━━━━━━━━━━━
OneSoul_GameData.xlsx       →      data/json/*.json        →       GameEngine.definitions
(Source of Truth)                   (Auto-generated)                (Runtime Data)
```

### Key Benefits

- **Excel**: Easy editing, formulas, sorting, filtering, collaboration
- **JSON**: Version control, fast loading, validation, programmatic access
- **Separation**: Excel in OneDrive (not in repo), JSON committed to Git

## File Structure

```
OneSoul_idle_RPG/
├── data/
│   ├── csv/                         # CSV templates (for initial setup)
│   │   ├── items.csv
│   │   ├── skills.csv
│   │   ├── enemies.csv
│   │   ├── regions.csv
│   │   └── recipes.csv
│   └── json/                        # Generated JSON files (committed to Git)
│       ├── items.json
│       ├── skills.json
│       ├── enemies.json
│       ├── regions.json
│       ├── recipes.json
│       └── definitions.json         # Combined file
├── scripts/
│   ├── extract-to-csv.js            # Extract definitions.js → CSV
│   ├── excel-to-json.js             # Convert Excel → JSON
│   └── validate-data.js             # Validate JSON data
└── outputs/                         # Deliverables
    ├── items.csv
    ├── skills.csv
    ├── enemies.csv
    ├── regions.csv
    ├── recipes.csv
    └── DATA_WORKFLOW.md (this file)
```

### OneDrive Location

Excel workbook location (auto-detected):
- `C:\Users\{username}\OneDrive\OneSoul_GameData\OneSoul_GameData.xlsx`
- `C:\Users\{username}\OneDrive - Personal\OneSoul_GameData\OneSoul_GameData.xlsx`
- Or local fallback: `data/OneSoul_GameData.xlsx`

## Workflow Steps

### 1. Initial Setup (One-Time)

#### 1.1. Generate CSV Templates

```bash
npm run extract-csv
```

This extracts current data from `src/core/definitions.js` into CSV files in `data/csv/`.

#### 1.2. Import CSV into Excel

1. Open Excel and create a new workbook: `OneSoul_GameData.xlsx`
2. For each CSV file (items, skills, enemies, regions, recipes):
   - Create a new worksheet with the same name
   - Import the CSV data
   - Apply formatting, filters, freeze header row
3. Save to OneDrive: `OneDrive/OneSoul_GameData/OneSoul_GameData.xlsx`

### 2. Daily Workflow (Editing Data)

#### 2.1. Edit Data in Excel

1. Open `OneSoul_GameData.xlsx` in Excel
2. Make changes to any worksheet
3. Save the file (Ctrl+S)

#### 2.2. Export to JSON

```bash
npm run export-data
```

This reads the Excel file and generates JSON files in `data/json/`.

**What it does:**
- Auto-detects OneDrive path
- Reads all worksheets (except those starting with `_`)
- Unflatters column names (`combatStats_damage` → `{combatStats: {damage: value}}`)
- Skips reference columns (starting with `_`)
- Converts types (TRUE/FALSE → boolean, numbers, null)
- Generates individual JSON files and `definitions.json` (combined)

#### 2.3. Validate Data

```bash
npm run validate-data
```

This validates the generated JSON files for:
- Required fields
- Data types
- Cross-references (recipes reference valid items, etc.)
- Balance warnings (overpowered stats, etc.)

#### 2.4. Test in Game

1. Start local dev server (e.g., `python -m http.server 8080`)
2. Open `http://localhost:8080` in browser
3. Check browser console for data loading messages:
   - `✅ Loaded data from JSON files` = Success!
   - `⚠️ JSON data not available, using GameDefinitions fallback` = JSON not found, using code

#### 2.5. Commit Changes

```bash
git add data/json/*.json
git commit -m "Update game data: [description]"
git push
```

**Important:** Only commit JSON files, NOT the Excel file (Excel stays in OneDrive only).

### 3. Combined Workflow (One Command)

```bash
npm run workflow
```

This runs `export-data` followed by `validate-data` in one command.

## Excel Worksheet Structure

### Column Naming Convention

**Nested objects** use underscore notation:

| Excel Column         | JSON Result                           |
|----------------------|---------------------------------------|
| `name`               | `{ name: "value" }`                   |
| `combatStats_damage` | `{ combatStats: { damage: 10 } }`     |
| `stats_armorRatings_plated` | `{ stats: { armorRatings: { plated: 5 } } }` |

**Reference columns** (starting with `_`) are skipped during export:

| Column Name | Purpose                        |
|-------------|--------------------------------|
| `_tier`     | Human-readable tier reference  |
| `_notes`    | Designer notes                 |
| `_status`   | `active`, `planned`, `disabled` |

### Type Conversions

| Excel Value | JSON Result |
|-------------|-------------|
| `TRUE`      | `true`      |
| `FALSE`     | `false`     |
| `123`       | `123`       |
| `123.45`    | `123.45`    |
| Empty cell  | (skipped)   |
| `["tag1","tag2"]` | `["tag1","tag2"]` (parsed as array) |

### Example: Items Worksheet

| id | name | icon | category | rarity | value | stats_damage | stats_defense | _tier | _notes | _status |
|----|------|------|----------|--------|-------|--------------|---------------|-------|--------|---------|
| ironSword | Iron Sword | 🗡️ | equipment | uncommon | 150 | 18 | | improved | Basic melee weapon | active |
| leatherCap | Leather Cap | 🎩 | equipment | common | 30 | | 3 | basic | Light armor | active |

**Exports to:**

```json
{
  "ironSword": {
    "name": "Iron Sword",
    "icon": "🗡️",
    "category": "equipment",
    "rarity": "uncommon",
    "value": 150,
    "stats": {
      "damage": 18
    }
  },
  "leatherCap": {
    "name": "Leather Cap",
    "icon": "🎩",
    "category": "equipment",
    "rarity": "common",
    "value": 30,
    "stats": {
      "defense": 3
    }
  }
}
```

## Game Engine Integration

### How Data is Loaded

1. **Game Initialization**: `index.html` calls `initGame()`
2. **Engine Init**: `GameEngine.init()` calls `loadGameData()`
3. **JSON Loading** (async):
   - Try to fetch `data/json/definitions.json`
   - If successful: merge JSON data with `GameDefinitions` (keeps system defs like `RARITY_TIERS`)
   - If failed: fallback to `GameDefinitions` from code
4. **Game Continues**: All systems access `GameEngine.definitions`

### Code Changes

**gameEngine.js** (src/core/gameEngine.js):
- Added `async loadGameData()` method
- Made `init()` async and calls `await this.loadGameData()`
- Merges JSON data with `GameDefinitions` to keep system definitions

**globalHandlers.js** (src/ui/globalHandlers.js):
- Made `initGame()` async
- Calls `await GameEngine.init()` to ensure data loads before game starts

### Fallback Behavior

If JSON files are not available (e.g., during development or if export hasn't been run):
- Game automatically falls back to `GameDefinitions` from `src/core/definitions.js`
- Warning logged: `⚠️ JSON data not available, using GameDefinitions fallback`
- Game continues normally

## Data Validation

The validation script checks for:

### Required Fields
- Items: `name`, `category`
- Skills: `name`
- Enemies: `name`, `health`
- Recipes: `output`, `inputs`

### Cross-References
- Recipe outputs reference valid items
- Recipe inputs reference valid items
- (Expandable: enemy loot tables, region nodes, etc.)

### Balance Warnings
- Items with very high damage (>1000)
- Items with very high defense (>500)
- Enemies with very high health (>100000)

### Type Validation
- `value` must be a number
- `stackLimit` must be a number
- Booleans are properly converted
- Arrays are properly parsed

## Troubleshooting

### "Could not find OneSoul_GameData.xlsx"

**Problem**: Excel file not found in expected locations

**Solution**:
1. Check file exists at: `C:\Users\{username}\OneDrive\OneSoul_GameData\OneSoul_GameData.xlsx`
2. Or place file at: `data/OneSoul_GameData.xlsx` (local fallback)
3. Check spelling and path in script

### "JSON data not available, using GameDefinitions fallback"

**Problem**: Game can't load JSON files (browser console warning)

**Solution**:
1. Run `npm run export-data` to generate JSON files
2. Ensure `data/json/definitions.json` exists
3. Check dev server is running and serving from project root
4. Check browser console for fetch errors

### Validation Errors: "Missing required field"

**Problem**: Data validation failed

**Solution**:
1. Check validation output for specific errors
2. Fix missing fields in Excel
3. Re-export: `npm run export-data`
4. Re-validate: `npm run validate-data`

### Excel Changes Not Appearing in Game

**Problem**: Made changes in Excel but game still shows old data

**Solution**:
1. Save Excel file (Ctrl+S)
2. Run `npm run export-data` to regenerate JSON
3. Hard refresh browser (Ctrl+Shift+R)
4. Check `data/json/*.json` files have new timestamps

## Best Practices

### Git Workflow

✅ **DO:**
- Commit JSON files (`data/json/*.json`)
- Include validation in your workflow
- Write descriptive commit messages
- Test changes locally before committing

❌ **DON'T:**
- Commit Excel file (keep in OneDrive only)
- Commit CSV templates (they're one-time use)
- Skip validation step
- Commit without testing

### Excel Editing

✅ **DO:**
- Use Excel formulas to calculate derived values
- Use conditional formatting for visual feedback
- Freeze top row for easier scrolling
- Use filters to find specific items
- Add comments in `_notes` column

❌ **DON'T:**
- Delete the `id` column
- Use commas in item IDs
- Leave required fields empty
- Delete reference columns (`_tier`, `_notes`, `_status`)

### Data Balance

✅ **DO:**
- Pay attention to balance warnings
- Test new items in-game
- Compare with similar tier items
- Use `_tier` column for organization

❌ **DON'T:**
- Ignore validation warnings
- Create overpowered items without reason
- Forget to set item rarity
- Mix up damage types

## npm Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run extract-csv` | Extract definitions.js → CSV templates |
| `npm run export-data` | Convert Excel → JSON |
| `npm run validate-data` | Validate JSON files |
| `npm run workflow` | Export + Validate (combined) |

## File Format Reference

### items.json
```json
{
  "itemId": {
    "name": "Item Name",
    "category": "equipment|consumable|material",
    "rarity": "common|uncommon|rare|epic|legendary",
    "value": 100,
    "stats": {
      "damage": 10,
      "defense": 5
    }
  }
}
```

### skills.json
```json
{
  "skillId": {
    "name": "Skill Name",
    "description": "Skill description",
    "maxLevel": 99
  }
}
```

### enemies.json
```json
{
  "enemyId": {
    "name": "Enemy Name",
    "health": 100,
    "attackDamage": 10,
    "loot": {
      "itemId": { "chance": 0.5, "quantity": 1 }
    }
  }
}
```

### recipes.json
```json
{
  "recipeId": {
    "output": "itemId",
    "outputQuantity": 1,
    "inputs": {
      "ingredient1": 2,
      "ingredient2": 1
    },
    "skill": "smithing",
    "level": 5
  }
}
```

## Future Enhancements

### Planned Features
- [ ] Validation for enemy loot tables
- [ ] Balance checker for item tier progression
- [ ] Auto-generate item IDs from names
- [ ] Import/export to Google Sheets
- [ ] Real-time Excel→JSON sync (file watcher)
- [ ] Visual diff tool for data changes
- [ ] Automated tests for game balance

### Advanced Workflows
- Use Excel Power Query for complex data transformations
- Create pivot tables for balance analysis
- Use Excel formulas to calculate scaling curves
- Export subsets of data for specific features
- Generate localization files from Excel

---

## Quick Reference

**Setup:**
```bash
npm run extract-csv      # One-time: Create CSV templates
# Import CSVs into Excel, save to OneDrive
```

**Daily Workflow:**
```bash
# 1. Edit data in Excel
# 2. Export and validate:
npm run workflow

# 3. Test in game
# 4. Commit if good:
git add data/json/*.json
git commit -m "Update: added new weapons"
git push
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-15
**Maintainer**: OneSoul RPG Team
