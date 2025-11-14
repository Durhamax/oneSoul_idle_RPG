# Item Schema & Validation System

Complete item architecture system with schema templates, validation, and examples.

## 📁 Files

- **`itemSchema.js`** - Complete item schema template with all valid properties
- **`itemValidator.js`** - Validation system for item data
- **`testItemValidator.js`** - Test suite demonstrating validation

## 🎯 Quick Start

### Creating a New Item

1. Use the schema template from `itemSchema.js`
2. Fill in required fields based on category
3. Validate using the validator

```javascript
const newItem = {
    // Required for all items
    id: 'bronzeSword',
    name: 'Bronze Sword',
    description: 'A basic sword forged from bronze.',
    icon: '🗡️',
    category: 'equipment',
    rarity: 'common',

    // Equipment-specific (required)
    slot: 'weapon',

    // Equipment-specific (optional)
    tier: 'basic',
    combatStats: {
        damage: 10,
        attackSpeed: 1.0,
    },

    // General optional fields
    stackLimit: 1,
    value: 50,
    level: 1,
    tags: ['weapon', 'sword', 'bronze', 'melee'],
};

// Validate the item
const validation = ItemValidator.validate(newItem);
if (!validation.isValid) {
    console.error('Invalid item:', validation.errors);
}
```

## 📋 Item Categories

### Equipment (`category: 'equipment'`)
**Required Fields:**
- `slot` - Equipment slot (weapon, body, head, etc.)

**Optional Fields:**
- `tier` - Equipment tier (basic, improved, quality, etc.)
- `attributes` - Attribute bonuses (strength, dexterity, etc.)
- `combatStats` - Combat stat bonuses (damage, defense, etc.)
- `requirements` - Skill requirements to equip
- `durability` - Durability system data
- `setId` - Set bonus identifier

**Example:**
```javascript
{
    id: 'steelHelm',
    name: 'Steel Helm',
    description: 'A sturdy helmet forged from steel.',
    icon: '⛑️',
    category: 'equipment',
    rarity: 'uncommon',
    slot: 'head',
    tier: 'improved',
    combatStats: {
        defense: 15,
        health: 25,
    },
    attributes: {
        constitution: 2,
    },
    requirements: {
        combat: 10,
    },
    stackLimit: 1,
    value: 200,
    level: 10,
    tags: ['armor', 'helmet', 'steel', 'head'],
}
```

### Consumable (`category: 'consumable'`)
**Required Fields:**
- `effectType` - Type of effect (heal, buff, restore, etc.)

**Optional Fields:**
- `effectValue` - Magnitude of effect
- `effectDuration` - Duration in milliseconds (for buffs)
- `cooldown` - Cooldown before using again
- `effect` - Detailed effect data object

**Example:**
```javascript
{
    id: 'strengthPotion',
    name: 'Strength Potion',
    description: 'Temporarily increases strength by 10 for 5 minutes.',
    icon: '🧪',
    category: 'consumable',
    rarity: 'uncommon',
    effectType: 'buff',
    effectValue: 10,
    effectDuration: 300000, // 5 minutes
    effect: {
        stat: 'strength',
        amount: 10,
    },
    stackLimit: 20,
    value: 100,
    cooldown: 1000,
    tags: ['consumable', 'potion', 'buff', 'strength'],
}
```

### Material/Resource (`category: 'material'` or `'resource'`)
**Optional Fields:**
- `resourceType` - Type of resource (ore, wood, textile, etc.)
- `gatherSkill` - Skill used to gather (mining, woodcutting, etc.)
- `gatherLevel` - Level required to gather

**Example:**
```javascript
{
    id: 'ironOre',
    name: 'Iron Ore',
    description: 'Raw iron ore extracted from iron deposits.',
    icon: '🪨',
    category: 'material',
    rarity: 'common',
    resourceType: 'ore',
    gatherSkill: 'mining',
    gatherLevel: 10,
    stackLimit: 100,
    value: 15,
    tags: ['material', 'ore', 'metal', 'iron'],
}
```

### Currency (`category: 'currency'`)
**Example:**
```javascript
{
    id: 'gems',
    name: 'Gems',
    description: 'Rare crystalline currency.',
    icon: '💎',
    category: 'currency',
    rarity: 'rare',
    stackLimit: 999999,
    value: 1,
    sellable: false,
    droppable: false,
    tags: ['currency', 'gems', 'premium'],
}
```

## 🔍 Validation System

### Validating Items

```javascript
// Validate a single item
const result = ItemValidator.validate(itemData);

if (result.isValid) {
    console.log('✅ Item is valid!');
} else {
    console.error('❌ Validation failed:');
    result.errors.forEach(error => console.error(`  - ${error}`));
}

// Check warnings
if (result.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
}
```

### Validating Multiple Items

```javascript
const results = ItemValidator.validateAll({
    item1: { /* ... */ },
    item2: { /* ... */ },
    item3: { /* ... */ },
});

ItemValidator.printSummary(results);
```

### Running Tests

```bash
# Node.js
node testItemValidator.js

# Or in browser console
testItemValidation();
```

## ✅ Validation Checks

### Required Fields (All Items)
- `id` - Unique identifier
- `name` - Display name
- `description` - Item description
- `icon` - Icon/emoji
- `category` - Item category
- `rarity` - Rarity level

### Category-Specific Requirements
- **Equipment**: Must have `slot`
- **Consumable**: Must have `effectType`

### Validation Rules
1. **Category Validation**: Category must be valid (equipment, consumable, etc.)
2. **Rarity Validation**: Rarity must be valid (common, uncommon, rare, etc.)
3. **Slot Validation** (Equipment): Slot must be valid
4. **Effect Type Validation** (Consumable): Effect type should be recognized
5. **Range Validation**: Numeric values should be in valid ranges
6. **Deprecation Checks**: Warns about deprecated fields/values

### Warnings
- Missing/short descriptions
- Placeholder icons (❓, ⚠️)
- Zero value (non-quest/currency items)
- Missing tags
- Equipment without stats
- Low stack limits for materials
- High stack limits for equipment

### Deprecated Patterns
⚠️ The following patterns are deprecated:
- **`slot: 'shield'`** → Use `slot: 'offhand'` instead
- **`slot: 'armour'`** → Use specific slots: `'body'`, `'legs'`, or `'feet'`

## 📊 Validation Output Example

```
╔════════════════════════════════════════╗
║     ITEM VALIDATION SUMMARY           ║
╚════════════════════════════════════════╝

📦 Total Items: 4
✅ Valid Items: 3
❌ Invalid Items: 1
🚨 Total Errors: 2
⚠️  Total Warnings: 5

❌ INVALID ITEMS:

  brokenSword:
    ❌ Missing required field: "slot"
    ⚠️  Equipment has no combat stats or attributes defined

⚠️  ITEMS WITH WARNINGS:

  basicSword:
    ⚠️  Description is too short - provide more detail
    ⚠️  No tags defined - tags help with searching and filtering
```

## 🎨 Item Rarities

| Rarity | Color | Description |
|--------|-------|-------------|
| `common` | White | Most basic items |
| `uncommon` | Green | Slightly better quality |
| `rare` | Blue | Notable quality items |
| `epic` | Purple | High quality items |
| `legendary` | Orange | Exceptional items |
| `mythic` | Red | Extremely rare items |

## 🎒 Equipment Slots

- `head` - Helmets, hats, crowns
- `body` - Chest armor, shirts, robes
- `legs` - Leg armor, pants
- `feet` - Boots, shoes
- `hands` - Gloves, gauntlets
- `weapon` - Primary weapon
- `offhand` - Shields, secondary weapons, spell books
- `accessory` - Rings, amulets, trinkets
- `tool` - Gathering tools (pickaxe, axe, etc.)

## 📈 Equipment Tiers

1. **Starter** (Tier 0) - Tutorial equipment
2. **Basic** (Tier 1) - Early game
3. **Improved** (Tier 2) - Mid early game
4. **Quality** (Tier 3) - Mid game
5. **Superior** (Tier 4) - Late mid game
6. **Masterwork** (Tier 5) - Late game
7. **Legendary** (Tier 6) - End game

## 🔧 Best Practices

1. **Always validate items** before adding to definitions
2. **Use meaningful IDs** (camelCase, descriptive)
3. **Write clear descriptions** (at least 10 characters)
4. **Add tags** for searchability
5. **Set appropriate stack limits**:
   - Equipment: 1
   - Consumables: 10-50
   - Materials: 50-999
   - Currency: 999999
6. **Use proper slots** (avoid deprecated values)
7. **Balance item values** appropriately
8. **Add stats to equipment** (combatStats or attributes)

## 🚀 Integration

To integrate with your game's item system:

```javascript
// In your definitions file
const definitions = {
    items: {
        // Validate all items on game load
        // (already handled by definitions validation)
    }
};

// Validate on item creation/modification
function createItem(itemData) {
    const validation = ItemValidator.validate(itemData);

    if (!validation.isValid) {
        console.error(`Cannot create item ${itemData.id}:`, validation.errors);
        return null;
    }

    if (validation.warnings.length > 0) {
        console.warn(`Item ${itemData.id} has warnings:`, validation.warnings);
    }

    return itemData;
}
```

## 📝 Notes

- The validation system is designed to be lenient with warnings but strict with errors
- Warnings help improve data quality but don't prevent items from working
- Errors indicate critical issues that must be fixed
- The schema is extensible - add custom fields as needed for your game

## 🆘 Troubleshooting

**"Missing required field" error:**
- Ensure all required fields (id, name, description, icon, category, rarity) are present

**"Invalid category" error:**
- Use one of the valid categories: equipment, consumable, material, resource, currency, quest, key, special

**"Invalid equipment slot" error:**
- Use valid slots: head, body, legs, feet, hands, weapon, offhand, accessory, tool
- Avoid deprecated slots like 'shield' (use 'offhand')

**Too many warnings:**
- Add missing tags
- Write longer descriptions
- Set appropriate values
- Add stats to equipment

---

**Built for Idle RPG Prototype**
Last Updated: 2025-01-10
