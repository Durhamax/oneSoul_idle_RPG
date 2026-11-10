# Item Definition Standard

**Last Updated:** 2025-11-22
**Status:** ✅ Production Verified

## The Standard Format

All items in the game follow this consistent structure:

### Core Properties (All Items)

```javascript
{
    id: 'uniqueItemId',
    name: 'Display Name',
    description: 'Item description',
    icon: '🔫',
    category: 'equipment' | 'consumable' | 'material',
    slot: 'weapon' | 'tool' | 'head' | 'body' | ...,
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic',
    stackLimit: 1,
    value: 100,
    tier: 'starter' | 'basic' | 'improved' | 'quality' | 'superior' | 'masterwork' | 'legendary',
    tags: ['weapon', 'rifle', 'ranged'],
}
```

### Equipment Properties

```javascript
{
    // ... core properties above
    category: 'equipment',
    slot: 'weapon',  // weapon, tool, head, body, legs, hands, feet, offhand, accessory

    combatStats: {
        damage: 15,
        attackSpeed: 1.0,
        defense: 0,
        critChance: 10,
        critDamage: 150,
        accuracy: 85,
        evasion: 0,
    },

    attributes: {
        strength: 2,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
        luck: 0,
    },

    requirements: {
        combat: 10,
        mining: 5,
    }
}
```

### Material Properties

```javascript
{
    // ... core properties above
    category: 'material',
    // NO slot property for materials

    resourceType: 'ore' | 'wood' | 'herb' | 'textile',
    gatherSkill: 'mining' | 'logging' | 'herbalism',
    gatherLevel: 1,
}
```

### Consumable Properties

```javascript
{
    // ... core properties above
    category: 'consumable',
    slot: 'ammo' | 'food' | 'potion',

    effectType: 'heal' | 'buff' | 'restore',
    effectValue: 50,
    effectDuration: 30000,  // milliseconds
    cooldown: 1000,
}
```

## Tab Routing Logic

Items automatically go to the correct bank tab based on `category` + `slot`:

| Category | Slot | Bank Tab |
|----------|------|----------|
| equipment | tool | Tools |
| equipment | weapon | Weapons |
| equipment | head/body/legs/etc | Armor |
| consumable | ammo/food/potion | Consumables |
| material | (no slot) | Resources |

## Property Aliases (Compatibility Layer)

For backward compatibility, `ItemRegistry.getItem()` automatically adds these aliases:

```javascript
item.attackDamage = item.combatStats?.damage || item.damage || 0
item.equipSlot = item.slot
item.attackSpeed = item.combatStats?.attackSpeed || 1.0
item.defense = item.combatStats?.defense || 0
```

This allows legacy systems expecting `equipSlot` or `attackDamage` to work seamlessly.

## Verified Consistency

**Diagnostic Results (2025-11-22):**
- ✅ Equipment: 24/24 items use `category: 'equipment'`
- ✅ Equipment: 24/24 items use `slot` (ZERO use deprecated `equipSlot`)
- ✅ Materials: 29/29 items use `category: 'material'`
- ✅ Damage: All weapons use `combatStats.damage` (ZERO use `attackDamage` at root)

## Example: Test Rifle

```javascript
testRifle: {
    id: 'testRifle',
    name: 'Test Rifle',
    description: 'A test weapon for attachment system',
    icon: '🔫',
    category: 'equipment',      // Equipment item
    slot: 'weapon',              // Combat weapon → Weapons tab
    rarity: 'rare',              // Rare = 3 attachment slots
    stackLimit: 1,
    value: 100,
    level: 10,
    tier: 'improved',
    combatStats: {
        damage: 15,
        attackSpeed: 1.0,
        critChance: 10,
        accuracy: 85,
    },
    requirements: {
        combat: 10,
    },
    tags: ['weapon', 'rifle', 'ranged', 'test'],
}
```

## Creating New Items

1. **Choose the category:** equipment, consumable, or material
2. **Set the slot:** Based on category:
   - Equipment: weapon, tool, head, body, legs, etc.
   - Consumable: ammo, food, potion
   - Material: omit slot property
3. **Add stats:** Use `combatStats` for equipment, `effectType`/`effectValue` for consumables
4. **Set rarity:** Affects drop rates, value multiplier, and attachment slots (for weapons)
5. **Add to appropriate file:**
   - Production: `src/data/items/production/equipment/equipment.js` or `materials.js`
   - Test: `src/data/items/test/testItems.js`

## Key Rules

1. ✅ Use `slot` not `equipSlot`
2. ✅ Use `combatStats.damage` not root-level `damage` or `attackDamage`
3. ✅ Use `category: 'equipment'` for ALL equippable items (weapons, armor, tools)
4. ✅ Materials have `category: 'material'` with NO slot property
5. ✅ Tab routing is automatic based on category + slot
6. ❌ Don't add `defaultTab` property (legacy, no longer needed)
7. ❌ Don't add `itemType` property (legacy, no longer needed)

## Migration Notes

- **Old Format:** Items used `equipSlot`, `defaultTab`, root-level `damage`
- **Current Format:** Items use `slot`, `combatStats.damage`, auto-routing
- **Compatibility:** Aliases ensure old systems still work
- **Status:** Migration complete, all production items verified consistent
