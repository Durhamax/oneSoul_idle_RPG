# Combat System State - November 29, 2025

## Current Architecture Overview

### Equipment Storage Pattern
The game uses a **dual-bank inventory system** with instanced equipment:

1. **Bank Storage** (`GameEngine.state.bank.items`):
   - Stackable items stored as: `{ itemId: quantity }` (e.g., `{ copperiteRounds: 40 }`)
   - Instanced equipment stored as objects with unique IDs:
     ```javascript
     {
       baseItemId: 'sidekick22',
       instanceId: 'sidekick22_1764441114356_r431m1xvb',
       rarity: 'common',
       stats: {...},
       enhancementSlots: 1
     }
     ```

2. **Equipment Slots** (`GameEngine.state.equipment`):
   - When equipped, slots store the **instanceId string** (not the object):
     ```javascript
     equipment: {
       weapon: 'sidekick22_1764441114356_r431m1xvb',  // Instance ID string
       armor: 'unityScoutSet_1764441114453_hshzdfe80',
       ammo: 'flintheadArrows',  // Base ID for stackables
       // ...
     }
     ```

3. **ItemRegistry** (definition lookup):
   - Only stores **base item definitions** keyed by base ID
   - `ItemRegistry.getItem('sidekick22')` works
   - `ItemRegistry.getItem('sidekick22_1764441114356_r431m1xvb')` returns `undefined`

---

## The Core Problem

### Instance ID vs Base ID Mismatch

When combat tries to look up weapon stats, it does:
```javascript
const weaponSlot = player.equipment.weapon;
// Returns: 'sidekick22_1764441114356_r431m1xvb'

const weaponDef = ItemRegistry.getItem(weaponSlot);
// Returns: undefined (because registry only knows 'sidekick22')
```

The instance ID format is: `{baseItemId}_{timestamp}_{randomId}`

### Failed Extraction Attempt
We added a `getBaseItemId()` helper with regex:
```javascript
const match = itemIdOrSlot.match(/^([a-zA-Z]+)_\d+_/);
```

**Problem**: This regex only captures letters before the first underscore with digits. For IDs like `sidekick22_1764441114356_r431m1xvb`, it fails because `sidekick22` contains a number.

---

## Systems Affected

### 1. Combat System (`combatSystem.js`)
- `compileWeaponData()` - needs to resolve instance ID to get weapon definition
- `compileAmmoData()` - needs to resolve ammo for quantity tracking
- `calculateCombatStats()` - needs weapon definition for damage/accuracy calculation
- `getPlayerAttackInterval()` - needs weapon attack speed

### 2. AutoConsumption (`autoConsumption.js`)
- `canAttack()` - checks if weapon exists and if ammo is required
- `consumeAmmo()` - consumes ammo during attacks
- Both fail when they can't resolve the weapon definition

### 3. Equipment System (`equipmentSystem.js`)
- `recalculatePlayerStats()` - crashes with `Cannot read properties of undefined (reading 'maxHealth')` at line 833
- This suggests `GameEngine.state.combat.player` doesn't exist in the expected structure
- Equipment changes during combat don't update the compiled combat state

### 4. Migration System (`migrationSystem.js`)
- Line 944 shows: `Removing invalid equipped item: unityBlade_1764441114404_1d4gyl5fo from weapon`
- The migration is clearing equipped items it considers "invalid"
- This may be stripping equipment on load, leaving slots empty

---

## Error Chain

1. **On Load**: Migration removes "invalid" equipped items
2. **Combat Starts**: No weapon in slot, or weapon slot has instance ID
3. **Combat Tick**: `canAttack()` tries to lookup instance ID in ItemRegistry
4. **Lookup Fails**: Returns undefined, combat says "No weapon equipped" or "Weapon not found"
5. **Enemy Attack**: Uses `enemy.accuracy` but this was being overwritten to 0 by `calculateCombatStats()` (partially fixed)

---

## What Needs to Change

### Option A: Store Base ID + Instance Reference Separately
```javascript
equipment: {
  weapon: {
    baseItemId: 'sidekick22',
    instanceId: 'sidekick22_1764441114356_r431m1xvb'
  }
}
```
- Pro: Clean separation, easy lookups
- Con: Requires migration of existing saves, changes to all equipment code

### Option B: Fix Instance ID Parsing
The regex needs to handle alphanumeric base IDs:
```javascript
// Current (broken for IDs with numbers):
/^([a-zA-Z]+)_\d+_/

// Fixed:
/^(.+?)_\d{10,}_/  // Match anything before a 10+ digit timestamp
```
- Pro: Minimal changes
- Con: Fragile, depends on ID format staying consistent

### Option C: Compile Combat State Once at Combat Start
Store resolved equipment data in combat state:
```javascript
player.combat = {
  compiledWeapon: { /* full weapon definition */ },
  compiledArmor: { /* full armor definition */ },
  playerAmmo: { currentAmmo: 40, ammoType: 'bullet' }
}
```
- Pro: No repeated lookups during combat
- Con: Equipment changes during combat require re-compilation

### Option D: Add Instance Lookup to ItemRegistry
```javascript
ItemRegistry.getItemFromInstance(instanceId) {
  const baseId = this.extractBaseId(instanceId);
  return this.getItem(baseId);
}
```
- Pro: Centralized solution
- Con: Still need reliable base ID extraction

---

## Recommended Approach

1. **Fix the base ID extraction** to handle alphanumeric IDs
2. **Compile combat state once** at combat start (partially implemented)
3. **Don't re-lookup items every tick** - use compiled data
4. **Fix migration system** to not strip valid equipped items
5. **Fix `recalculatePlayerStats()`** to handle missing `combat.player` structure

---

## Files to Modify

| File | Issue |
|------|-------|
| `combatSystem.js` | `getBaseItemId()` regex fails on alphanumeric IDs |
| `autoConsumption.js` | Same regex issue, also has duplicate helper |
| `equipmentSystem.js:833` | `recalculatePlayerStats()` accesses undefined `combat.player.maxHealth` |
| `migrationSystem.js:944` | Stripping "invalid" equipped items incorrectly |
| `combatRolls.js:42` | Uses `attacker.accuracy` which was being overwritten to 0 |

---

## Current Console Errors

1. `Cannot read properties of undefined (reading 'maxHealth')` - equipmentSystem.js:833
2. `Could not find weapon definition for: sidekick22_1764441114356_r431m1xvb` - autoConsumption.js:266
3. `Removing invalid equipped item` - migrationSystem.js:944 (on every load)
4. `Enemy MISS vs Player | Hit chance: 0.0%` - Enemy accuracy being zeroed out

---

## Test Scenario

To verify fix works:
1. Equip a weapon (e.g., Unity Blade or Sidekick 22)
2. Equip armor (e.g., Unity Scout Set)
3. Equip ammo (arrows or rounds)
4. Start combat with Elaran Survey Drone
5. Verify:
   - Player attacks trigger (not "No weapon equipped")
   - Enemy attacks have non-zero hit chance
   - Ammo decrements on ranged attacks
   - No console errors about missing definitions
