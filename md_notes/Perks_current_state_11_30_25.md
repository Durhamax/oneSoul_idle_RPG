# Perk Grid System - Current State
## Document Date: November 30, 2025

---

## Overview

The Perk Grid System is a 7x7 grid-based character enhancement system where players place "medals" containing stat bonuses. Each medal has a rarity, one or more perks (stat bonuses), and a visual ribbon indicating its perk categories.

---

## Core Files

### System Files
- `src/systems/perkGrid/perkGridConstants.js` - All configuration constants
- `src/systems/perkGrid/perkGridSystem.js` - Grid state management and medal placement
- `src/systems/perkGrid/perkGridCalculator.js` - Multiplier calculations
- `src/systems/perkGrid/medalGenerator.js` - Medal creation with perks and ribbons
- `src/systems/perkGrid/medalCraftingSystem.js` - Forging, combining, salvaging

### UI Files
- `src/ui/perkGridUI.js` - Main UI rendering (grid, inventory, forge, combine, salvage tabs)
- `styles/modals.css` - CSS for grid cells, medal cards, ribbons, forge result modal

---

## Grid Configuration

```javascript
const GRID_CONFIG = {
    size: 7,              // 7x7 grid
    totalTiles: 49,       // 49 total tiles
    startingTiles: 1,     // 1 tile unlocked at level 1
    unlockInterval: 10    // +1 tile every 10 character levels
};
```

### Tile Unlock Order
Tiles unlock in a spiral pattern from the center outward:
- **Level 1**: Center tile (3,3)
- **Level 11+**: Ring 1 (8 tiles surrounding center)
- **Level 91+**: Ring 2 (16 tiles)
- **Level 251+**: Ring 3 (24 tiles - outer edge)

Full unlock order defined in `UNLOCK_ORDER` array in `perkGridConstants.js`.

---

## Medal Rarities

9 rarity tiers with increasing perk counts and value ranges:

| Rarity | Perk Count | Value Range | Color |
|--------|------------|-------------|-------|
| Common | 1 | 2-4% | #9e9e9e (gray) |
| Uncommon | 2 | 3-6% | #4caf50 (green) |
| Rare | 3 | 4-8% | #2196f3 (blue) |
| Epic | 4 | 5-10% | #9c27b0 (purple) |
| Legendary | 5 | 6-12% | #ff9800 (orange) |
| Mythic | 6 | 8-15% | #f44336 (red) |
| Divine | 7 | 10-18% | #00bcd4 (cyan) |
| Transcendent | 8 | 12-22% | #e91e63 (pink) |
| Creator | 9 | 15-28% | #ffd700 (gold) |

---

## Perk Stat Pool (68 Total)

All possible stats a medal perk can provide:

### Combat Offense (6)
- `meleeDamage` - Melee Damage
- `rangedDamage` - Ranged Damage
- `accuracy` - Accuracy
- `critRating` - Critical Rating
- `critMultiplier` - Critical Multiplier
- `attackSpeed` - Attack Speed

### Combat Defense (5)
- `maxHealth` - Max Health
- `evasion` - Evasion
- `armorRating` - Armor Rating
- `damageReduction` - Damage Reduction
- `critResistance` - Critical Resistance

### Combat Resistance (5)
- `pierceResist` - Pierce Resistance
- `explosiveResist` - Explosive Resistance
- `cryoResist` - Cryo Resistance
- `shockResist` - Shock Resistance
- `incendiaryResist` - Incendiary Resistance

### Combat Consumables (9)
**Effectiveness (how strong the effect is):**
- `foodHealing` - Food Healing (multiplier on food heal amount)
- `potionPotency` - Potion Potency (multiplier on potion effects)
- `techPotency` - Tech Potency (multiplier on tech item effects)

**Conservation (chance to NOT consume on use):**
- `foodConservation` - Food Conservation
- `potionConservation` - Potion Conservation
- `techConservation` - Tech Conservation
- `ammoConservation` - Ammo Conservation

**Auto-Eat System:**
- `autoEatThreshold` - Auto-Eat Threshold
- `autoEatEfficiency` - Auto-Eat Efficiency

### Combat Loot (3)
- `goldFind` - Gold Find (multiplier on gold drops)
- `fragmentFind` - Fragment Find (multiplier on medal fragment drops)
- `itemFind` - Item Find (multiplier on item drop quantities)

### Attribute Scaling (7)
- `healthScaling` - Health Scaling
- `strengthScaling` - Strength Scaling
- `defenseScaling` - Defense Scaling
- `mobilityScaling` - Mobility Scaling
- `perceptionScaling` - Perception Scaling
- `stealthScaling` - Stealth Scaling
- `intelligenceScaling` - Intelligence Scaling

### Navigation (5)
- `explorationSpeed` - Exploration Speed (faster discovery attempts)
- `discoveryChance` - Discovery Chance (higher success rate)
- `enduranceCapacity` - Endurance Capacity (more max endurance)
- `enduranceRecovery` - Endurance Recovery (faster recovery while camping)
- `pathDiscovery` - Path Discovery (higher chance to find exit paths)

### Gathering Speed (6)
- `miningSpeed` - Mining Speed
- `loggingSpeed` - Logging Speed
- `fishingSpeed` - Fishing Speed
- `huntingSpeed` - Hunting Speed
- `foragingSpeed` - Foraging Speed
- `thievingSpeed` - Thieving Speed

### Gathering Yield (6)
- `miningYield` - Mining Yield
- `loggingYield` - Logging Yield
- `fishingYield` - Fishing Yield
- `huntingYield` - Hunting Yield
- `foragingYield` - Foraging Yield
- `thievingYield` - Thieving Yield

### Crafting Speed (7)
- `cookingSpeed` - Cooking Speed
- `chemistrySpeed` - Chemistry Speed
- `smithingSpeed` - Smithing Speed
- `mechanicsSpeed` - Mechanics Speed
- `electronicsSpeed` - Electronics Speed
- `textilesSpeed` - Textiles Speed
- `engineeringSpeed` - Engineering Speed

### Crafting Yield (5) - Non-instanced outputs only
- `cookingYield` - Cooking Yield
- `chemistryYield` - Chemistry Yield
- `smithingYield` - Smithing Yield
- `electronicsYield` - Electronics Yield
- `engineeringYield` - Engineering Yield

### Crafting Rarity (2) - Instanced outputs only
- `mechanicsRarity` - Mechanics Rarity
- `textilesRarity` - Textiles Rarity

### Experience (2)
- `combatXP` - Combat XP
- `skillXP` - Skill XP

---

## Category Colors

Each perk category has an associated color used in ribbons (10 categories):

```javascript
const CATEGORY_COLORS = {
    offense: '#e53935',      // red
    defense: '#1e88e5',      // blue
    resistance: '#8e24aa',   // purple
    consumable: '#ff7043',   // deep orange
    combat: '#ffc107',       // amber (loot perks)
    scaling: '#00acc1',      // cyan
    navigation: '#26a69a',   // teal
    gathering: '#43a047',    // green
    crafting: '#fb8c00',     // orange
    experience: '#ffd700'    // gold
};
```

---

## Medal Forging

### Currency
- **Medal Fragments** - Primary currency for forging
- Stored in `GameEngine.state.currencies.medalFragments`

### Crafting Tiers

| Tier | Name | Cost | Rarity Weights |
|------|------|------|----------------|
| 1 | Basic | 10 | 100% Common |
| 2 | Standard | 25 | 70% Common, 30% Uncommon |
| 3 | Quality | 50 | 50% Common, 35% Uncommon, 15% Rare |
| 4 | Superior | 100 | 50% Uncommon, 35% Rare, 15% Epic |
| 5 | Elite | 250 | 50% Rare, 35% Epic, 15% Legendary |
| 6 | Masterwork | 500 | 50% Epic, 35% Legendary, 15% Mythic |
| 7 | Exalted | 1000 | 50% Legendary, 35% Mythic, 15% Divine |
| 8 | Ascendant | 2500 | 50% Mythic, 35% Divine, 15% Transcendent |
| 9 | Primordial | 5000 | 50% Divine, 35% Transcendent, 15% Creator |

### Forging API
```javascript
// Single forge
GameEngine.forgeMedal(tier)
// Returns: { success, medal?, error? }

// Batch forge
GameEngine.forgeMedalBatch(tier, count)
// Returns: { success, medals[], totalCost, rarityCounts, error? }
```

---

## Medal Combining

Combine 3 medals of the same rarity to create 1 medal of the next higher rarity.

### Configuration
```javascript
const COMBINE_CONFIG = {
    medalsRequired: 3,
    inheritanceBonus: 0.25  // Weight bonus for inherited stats
};
```

### Inheritance System
When combining, the perks from source medals influence the new medal:
- Each perk stat from source medals gets +0.25 weight bonus
- Higher weights = higher chance of that stat appearing on the result
- This allows "focused" combining toward desired stats

### Combining API
```javascript
GameEngine.combineMedals(medalIds[])
// Returns: { success, medal?, consumed[], error? }

GameEngine.getCombinePreview(medalIds[])
// Returns: { valid, medalsSelected, currentRarity, resultRarity, inheritancePreview[], error? }
```

---

## Medal Salvaging

Destroy medals to recover medal fragments.

### Salvage Values by Rarity

| Rarity | Fragments Returned |
|--------|-------------------|
| Common | 3 |
| Uncommon | 8 |
| Rare | 15 |
| Epic | 30 |
| Legendary | 75 |
| Mythic | 150 |
| Divine | 300 |
| Transcendent | 750 |
| Creator | 1500 |

### Salvage API
```javascript
GameEngine.salvageMedals(medalIds[])
// Returns: { success, fragmentsGained, medalsDestroyed }

GameEngine.getSalvagePreview(medalIds[])
// Returns: { medalsSelected, totalFragments, breakdown{} }
```

---

## Medal Inventory

### Configuration
```javascript
const MEDAL_INVENTORY_CONFIG = {
    baseCapacity: 100,     // Starting inventory slots
    maxCapacity: 500,      // Maximum after expansions
    expansionCost: 500,    // Fragments per expansion
    expansionAmount: 25    // Slots gained per expansion
};
```

### State Structure
```javascript
GameEngine.state.medalInventory = {
    medals: [],           // Array of medal objects
    capacity: 100,        // Current capacity
    expansions: 0         // Number of expansions purchased
};
```

### Inventory API
```javascript
GameEngine.getMedalInventoryInfo()
// Returns: { medals[], count, capacity, maxCapacity, canExpand, expansionCost, expansions }

GameEngine.expandMedalInventory()
// Returns: { success, newCapacity, error? }
```

---

## Grid Placement

### Placing Medals
```javascript
// Place from inventory onto grid
GameEngine.placeMedalFromInventory(medalId, row, col)
// Returns: { success, error? }

// Direct placement (internal)
GameEngine.placeMedal(row, col, medalObject)
// Returns: { success, error? }
```

### Removing Medals
```javascript
// Return medal from grid to inventory
GameEngine.returnMedalToInventory(row, col)
// Returns: { success, medal?, error? }

// Just remove (internal)
GameEngine.removeMedal(row, col)
// Returns: medal object or null
```

### Swapping Medals
```javascript
GameEngine.swapMedals(row1, col1, row2, col2)
// Returns: { success, error? }
```

### Querying Grid
```javascript
GameEngine.getMedalAt(row, col)
// Returns: medal object or null

GameEngine.isTileUnlocked(row, col)
// Returns: boolean

GameEngine.getUnlockedTileCount()
// Returns: number

GameEngine.getUnlockedTiles()
// Returns: [{ row, col }, ...]

GameEngine.getGridState()
// Returns: { size, totalTiles, unlockedCount, placedCount, emptyUnlockedCount,
//            characterLevel, nextUnlockLevel, tiles[], edgeTotals, activeSummary }
```

---

## Perk Calculations

### Multiplier System
Perks provide multiplicative bonuses. The calculation system:

1. **Within a row/column**: Perks are multiplied together
2. **Across rows/columns**: Results are added together

### Getting Multipliers
```javascript
GameEngine.getPerkMultipliers()
// Returns: { statName: multiplierValue, ... }
// Example: { meleeDamage: 1.15, maxHealth: 1.08, ... }
// Value of 1.0 = no bonus, 1.15 = +15% bonus
```

### Breakdown & Summary
```javascript
GameEngine.getPerkBreakdown(statName)
// Returns detailed breakdown of a specific stat's sources

GameEngine.getActivePerkSummary()
// Returns: { category: { stat: totalValue, ... }, ... }

GameEngine.getGridEdgeTotals()
// Returns: { rows: { 0: total, 1: total, ... }, columns: { 0: total, ... } }
```

### Cache Management
```javascript
GameEngine.invalidatePerkCache()
// Call when grid changes to force recalculation
```

---

## Medal Object Structure

```javascript
{
    id: "medal_1764476449875_2xf4k1juf",  // Unique ID
    rarity: "uncommon",                    // Rarity tier
    perks: [
        { stat: "meleeDamage", value: 0.045 },
        { stat: "accuracy", value: 0.038 }
    ],
    ribbon: {
        baseColor: "#4caf50",              // Rarity color
        edgeColor: "#2e7d32",              // Darker shade
        stripes: [
            { color: "#e53935", width: 12 },  // Offense stripe
            { color: "#e53935", width: 11 }   // Offense stripe
        ],
        cssGradient: "linear-gradient(90deg, ...)"  // Ready-to-use CSS
    },
    craftedAt: 1764476449875,              // Timestamp
    combined: false                         // true if from combining
}
```

---

## Visual Ribbon System

Each medal has a visual ribbon showing its perk categories:

### Generation (`medalGenerator.js`)
1. Perks are sorted by category
2. Each perk generates a stripe with:
   - Color from `CATEGORY_COLORS[category]`
   - Width based on perk value (8 + value*100)
3. Stripes are compiled into a CSS gradient

### Display Locations
1. **Grid cells**: 4px stripe at top of placed medals
2. **Medal cards**: 6px stripe at top in inventory
3. **Forge result modal**: 8px stripe on forged medals

---

## State Persistence

### Saved State
```javascript
GameEngine.state.perkGrid = {
    placedMedals: {
        "3_3": { /* medal object */ },
        "3_4": { /* medal object */ },
        // key format: "row_col"
    },
    cachedMultipliers: null  // Regenerated on load
};

GameEngine.state.medalInventory = {
    medals: [ /* medal objects */ ],
    capacity: 100,
    expansions: 0
};

GameEngine.state.medalCrafting = {
    totalForged: 0,
    totalCombined: 0,
    totalSalvaged: 0,
    forgedByTier: { 1: count, 2: count, ... },
    forgedByRarity: { common: count, uncommon: count, ... }
};

GameEngine.state.currencies.medalFragments = 0;
```

---

## Integration Points

### Combat System Integration
**STATUS: INTEGRATED** (as of Nov 30, 2025)

Combat perks are applied in `combatSystem.js` and `autoConsumption.js`:
- `meleeDamage`, `rangedDamage` → Damage calculations in `calculateCombatStats()`
- `accuracy` → Hit chance via `perceptionScaling`
- `critRating`, `critMultiplier` → Critical hit system
- `attackSpeed` → Attack interval
- `maxHealth` → HP pool via `healthScaling`
- `evasion` → Dodge chance
- `armorRating`, `damageReduction` → Damage mitigation
- `critResistance` → Crit damage reduction
- Type resistances → Elemental damage reduction

### Consumable Conservation Integration
**STATUS: INTEGRATED** (as of Nov 30, 2025)

Conservation perks in `autoConsumption.js`:
- `foodConservation` → Chance to not consume food on auto-eat
- `ammoConservation` → Chance to not consume ammo on ranged attack
- `potionConservation` → Chance to not consume potion (future)
- `techConservation` → Chance to not consume tech item (future)

**Implementation:**
```javascript
// Conservation multiplier > 1 = chance to NOT consume
// 1.00 = 100% consume, 1.20 = 80% consume, 1.50 = 50% consume
const consumeChance = Math.max(0, 1.0 - (conservationMultiplier - 1.0));
return Math.random() < consumeChance;
```

### Consumable Effectiveness Integration
**STATUS: INTEGRATED** (as of Nov 30, 2025)

Effectiveness perks in `autoConsumption.js`:
- `foodHealing` → Multiplier on food heal amount

**Implementation:**
```javascript
const healAmount = Math.floor(baseHealAmount * consumablePerks.foodHealing);
```

### Navigation System Integration
**STATUS: INTEGRATED** (as of Nov 30, 2025)

Navigation perks in `navigationSystem.js`:
- `explorationSpeed` → Faster discovery interval
- `discoveryChance` → Higher discovery success rate
- `enduranceCapacity` → More max endurance
- `enduranceRecovery` → Faster recovery while camping
- `pathDiscovery` → Higher chance to find exit paths (capped at 50%)

**Implementation in `getNavigationStats()`:**
```javascript
const navPerks = this.getNavigationPerkMultipliers();
maxEndurance = Math.floor(baseEndurance * navPerks.enduranceCapacity);
discoveryChance = baseChance * navPerks.discoveryChance;
discoveryInterval = baseInterval / navPerks.explorationSpeed;
```

### Gathering Speed Integration
**STATUS: INTEGRATED** (as of Nov 30, 2025)

Speed multipliers affect gathering tick rates in `GatheringSystem.calculateActionInterval()`:
- `miningSpeed` → Mining nodes
- `loggingSpeed` → Logging nodes
- `fishingSpeed` → Fishing nodes
- `huntingSpeed` → Hunting nodes
- `foragingSpeed` → Foraging nodes
- `thievingSpeed` → Thieving nodes

**Implementation in `gatheringSystem.js`:**
```javascript
// In calculateActionInterval()
const speedPerk = speedPerkMap[playerSkill.id]; // e.g., 'miningSpeed'
if (speedPerk && perkMultipliers[speedPerk]) {
    baseInterval = baseInterval / perkMultipliers[speedPerk];
}
```

### Gathering Yield Integration
**STATUS: INTEGRATED** (as of Nov 30, 2025)

Yield multipliers affect resource amounts in `GatheringSystem.rollResources()`:
- `miningYield` → Mining resource yield
- `loggingYield` → Logging resource yield
- `fishingYield` → Fishing resource yield
- `huntingYield` → Hunting resource yield
- `foragingYield` → Foraging resource yield
- `thievingYield` → Thieving resource yield

**Implementation in `gatheringSystem.js`:**
```javascript
// In rollResources()
const yieldPerk = yieldPerkMap[playerSkill.id]; // e.g., 'miningYield'
if (perkYieldMultiplier > 1.0) {
    const rawYield = amount * perkYieldMultiplier;
    amount = Math.round(rawYield);  // 1.49 → 1, 1.50 → 2
}
```

### Experience Integration
**STATUS: PARTIALLY INTEGRATED** (as of Nov 30, 2025)

XP multipliers:
- `combatXP` → Combat experience gains (in `awardLoot()`)
- `skillXP` → Skill experience gains - **INTEGRATED** in gathering

### Crafting Integration
**STATUS: NOT YET IMPLEMENTED**

Crafting perks are defined but not yet integrated:
- Speed perks: `cookingSpeed`, `chemistrySpeed`, `smithingSpeed`, etc.
- Yield perks: `cookingYield`, `chemistryYield`, `smithingYield`, etc.
- Rarity perks: `mechanicsRarity`, `textilesRarity`

---

## Dev Tools

### Console Commands
```javascript
// Add medal fragments
addFragments(10000)  // or DevTools.addFragments(10000)

// Set exact fragment amount
setFragments(50000)  // or DevTools.setFragments(50000)
```

### Debug Info
The UI logs medal inventory count on each render (currently disabled).

---

## UI Components

### Tab Structure
1. **Inventory Tab** (default) - Shows all medals in inventory, click to select for placement
2. **Forge Tab** - Select tier, view rarity chances, forge 1 or 10 medals
3. **Combine Tab** - Select 3 same-rarity medals, preview result, combine
4. **Salvage Tab** - Multi-select medals, preview fragment return, salvage

### Grid Interaction
- **Click empty unlocked tile** with medal selected → Place medal
- **Click tile with medal** → Return medal to inventory
- **Locked tiles** show required level

### Forge Result Modal
After forging, a modal displays:
- Count and rarity summary
- Each medal with ribbon, perks, and values
- "Continue" button to dismiss

---

## Known Issues / TODO

1. **Combat Integration** - Verify `getPerkMultipliers()` is called in combat damage/defense calculations
2. **Gathering Integration** - Verify speed multipliers affect gathering tick rates
3. **XP Integration** - Verify XP multipliers are applied to experience gains
4. **Attribute Scaling** - Verify scaling perks affect attribute calculations
5. **Save/Load** - Verify medals persist correctly across sessions
6. **Legacy Compatibility** - Old 5x5 system methods exist for backwards compatibility

---

## Migration Notes

### From Old 5x5 System
The old system embedded equipment in the center 3x3. The new 7x7 system:
- Does NOT embed equipment (equipment is separate)
- Has `updateEquipmentCells()` as a no-op for compatibility
- Global alias `PerkGridSystem = PerkGridSystemNew` for old references
