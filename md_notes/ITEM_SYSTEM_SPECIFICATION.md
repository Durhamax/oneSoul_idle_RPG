# OneSoul Idle RPG - Item System Specification

**Version**: 1.0  
**Date**: 2025-01-20  
**Status**: AUTHORITATIVE  
**Purpose**: Complete specification for the dual-mode item system supporting both stackable and instanced items

---

## 🎯 System Overview

### Core Philosophy
- **Dual-mode system**: Items are either stackable (fungible) or instanced (unique)
- **No stack limits**: Stackable items can accumulate infinitely
- **Rarity-driven progression**: 9 rarity tiers affect power and capabilities
- **Time-gated content**: 2-year progression curve for free players
- **Build diversity**: Every choice has trade-offs, no dominant strategy

### Item Categories

| Category | Instanced | Unique Properties | Acquisition Methods |
|----------|-----------|-------------------|---------------------|
| **Resources** | No | - | Gather, Loot, Mission |
| **Tools** | Yes | Rarity (affects efficiency) | Gather, Craft, Loot, Mission, Upgrade, Shop |
| **Weapons** | Yes | Rarity + Attachments (0-8 slots) | Gather, Craft, Loot, Mission, Upgrade, Shop |
| **Armor** | Yes | Rarity + Camo pattern | Gather, Craft, Loot, Mission, Upgrade, Shop |
| **Food** | No | - | Gather, Craft, Loot, Mission, Shop |
| **Potions** | No | - | Gather, Craft, Loot, Mission, Shop |
| **Ammo** | No | - | Gather, Craft, Loot, Mission, Shop |
| **Components** | No | - | Gather, Craft, Loot, Mission |
| **Perks** | Yes | Perk array + Tier | Medal Craft only |
| **Quest** | No | Protected flag | Mission only |
| **Currency** | No | - | Gather, Loot, Mission, Shop |
| **Technology** | No | 250 uses per item | Craft, Shop |

### Item Theme - for quick development of test items
- **Items found in wild of another exoplanet**
- **Manufactured or Looted items will be modern to futurustic - NO MEDIEVAL ITEMS**
- **Melee Items still needed in limited numbers but should be modern**
---

## 📊 Data Structures

### Base Item Definition
```javascript
{
  // === IDENTITY ===
  id: 'iron_sword',              // Unique identifier
  name: 'Iron Sword',            // Display name
  icon: '⚔️',                    // Visual representation
  category: 'weapons',           // From categories table above
  
  // === INSTANCE FLAG ===
  instanced: true,               // true = unique items, false = stackable
  
  // === ACQUISITION ===
  sources: {
    gather: true,
    craft: true,
    loot: true,
    mission: true,
    upgrade: false,              // Can this be created via upgrade system?
    shop: true,
    medalCraft: false            // Perks only
  },
  
  // === REQUIREMENTS ===
  requirements: {
    characterLevel: 1,
    skills: { 
      combat: 10,
      smithing: 5 
    },
    quests: [],                  // Quest IDs that must be completed
    items: []                    // Item IDs that must be owned
  },
  
  // === COMBAT STATS ===
  combatStats: {
    damage: 10,                  // Base damage
    attackSpeed: 1.0,            // Attacks per second
    accuracy: 75,                // Hit chance %
    critChance: 5,               // Critical hit %
    critDamage: 150              // Critical multiplier %
  },
  
  // === ECONOMY ===
  baseValue: 100,                // Shop buy price in gold
  sellRatio: 0.3                 // Sell for 30% of base value
}
```

### Instance Data Structure
```javascript
// Stored separately from base item, only for instanced items
{
  baseItemId: 'iron_sword',           // Reference to base item
  uniqueId: 'iron_sword_1234567890',  // Globally unique ID
  rarity: 'epic',                     // common → creator (9 tiers)
  equipped: false,                    // Currently equipped?
  locked: false,                      // Prevent accidental deletion
  
  // === CATEGORY-SPECIFIC DATA ===
  
  // Weapons only
  attachments: {
    scope: 'red_dot_sight_id',       // uniqueId of attachment or null
    barrel: null,
    magazine: 'extended_mag_id',
    stock: null,
    grip: null,
    muzzle: null,
    underbarrel: null,
    tactical: null
  },
  
  // Armor only
  camo: 'forest',                    // Biome-specific pattern
  
  // Tools only  
  efficiency: 1.35,                  // Rarity-based multiplier
  
  // Perks only
  perks: [
    { type: 'attackDamage', value: 15 },
    { type: 'miningSpeed', value: 10 },
    { type: 'critChance', value: 5 }
  ],
  tier: 5,                           // Medal tier used to craft
  reclaimValue: 300                  // Medals returned if reclaimed (60% of cost)
}
```

### Bank Storage Structure
```javascript
GameEngine.state.bank = {
  // Simple number storage for stackable items
  stackable: {
    'iron_ore': 1234567890,          // Can be millions/billions
    'bread': 500,
    'basic_potion': 45,
    'recon_drone': 10,               // Each = 250 uses
    'copper_coin': 999999999
  },
  
  // Individual storage for instanced items
  instanced: {
    'iron_sword_1234567890': {
      baseItemId: 'iron_sword',
      uniqueId: 'iron_sword_1234567890',
      rarity: 'epic',
      attachments: {},
      equipped: false,
      locked: false
    },
    'steel_armor_9876543210': {
      baseItemId: 'steel_armor',
      uniqueId: 'steel_armor_9876543210',
      rarity: 'rare',
      camo: 'desert',
      equipped: true,
      locked: true
    }
    // ... potentially thousands of entries
  }
}
```

---

## 🎲 Rarity System

### Rarity Tiers (All instanced items)
1. **Common** - Gray - Base stats
2. **Uncommon** - Green - +15% efficiency
3. **Rare** - Blue - +35% efficiency
4. **Epic** - Purple - +60% efficiency
5. **Legendary** - Orange - +100% efficiency
6. **Mythic** - Red - +150% efficiency
7. **Divine** - Gold/Shimmer - +220% efficiency
8. **Transcendent** - Rainbow - +300% efficiency
9. **Creator** - Cosmic - +400% efficiency

### Rarity-Specific Properties

#### Weapons: Attachment Slots
- Common: 0 slots
- Uncommon: 1 slot
- Rare: 2 slots
- Epic: 3 slots
- Legendary: 4 slots
- Mythic: 5 slots
- Divine: 6 slots
- Transcendent: 7 slots
- Creator: 8 slots

#### Perks: Number of Bonuses
- Common: 1 perk
- Uncommon: 1 perk (stronger)
- Rare: 2 perks
- Epic: 3 perks
- Legendary: 3 perks (stronger)
- Mythic: 4 perks
- Divine: 4 perks (stronger)
- Transcendent: 5 perks
- Creator: 5 perks (strongest)

#### Tools: Efficiency Multipliers
- Common: 1.0x
- Uncommon: 1.15x
- Rare: 1.35x
- Epic: 1.6x
- Legendary: 2.0x
- Mythic: 2.5x
- Divine: 3.2x
- Transcendent: 4.0x
- Creator: 5.0x

---

## 🔧 System Components

### Instance Manager
Responsible for creating and managing unique item instances.

**Key Functions:**
- `createInstance(baseItemId, properties)` - Generate unique instance
- `modifyInstance(uniqueId, changes)` - Update instance properties
- `deleteInstance(uniqueId)` - Remove instance
- `generateUniqueId()` - Create globally unique identifier

### Bank Manager
Handles dual-mode storage for both stackable and instanced items.

**Key Functions:**
- `addItem(itemId, quantityOrInstance)` - Add to appropriate storage
- `removeItem(itemIdOrUniqueId, quantity)` - Remove from storage
- `getItem(itemIdOrUniqueId)` - Retrieve item data
- `hasItem(itemIdOrUniqueId, quantity)` - Check availability
- `getItemCount(itemId)` - Get quantity (stackable) or count (instanced)

### Acquisition Handlers

#### Gathering System
- Rolls rarity for instanced items based on node tier and skill level
- Adds quantity for stackable items

#### Crafting System
- Rolls rarity for instanced outputs based on recipe and skill
- Supports batch crafting for stackables only
- Each instanced craft is unique

#### Upgrade System
- Combines 3-5 items of same type and rarity → 1 higher rarity
- Requires components and resources as additional materials
- Engineering skill gates maximum achievable rarity

#### Loot System
- Enemy drops with rarity weights
- Boss guarantees minimum rarity
- Stackables drop in quantity ranges

#### Shop System
- Permanent UI tab with discoverable sections
- Sections unlock through exploration
- Fixed inventories per section
- Gold for items, Medals for perks

#### Medal Craft System
- Input medal quantity determines tier
- Tier affects rarity probabilities
- Rarity determines perk count
- Reclaim for 60% medal return

---

## 🎨 UI Requirements

### Bank Display
- **Stackable items**: Show quantity badge (formatted as K/M/B for large numbers)
- **Instanced items**: Individual tiles with rarity border glow
- **Weapons**: Attachment indicator (X/Y slots filled)
- **Armor**: Camo pattern indicator
- **Sorting**: By category, then rarity (for instanced), then alphabetical
- **Filtering**: By category, rarity, equipped status

### Item Modals
- **Base modal**: Shows item stats and description
- **Weapon modal**: "Modify Attachments" button opens attachment interface
- **Armor modal**: "Apply Camo" option for camo kits
- **Perk modal**: Display all perks with values
- **Technology modal**: Shows total uses (quantity × 250)

### Visual Language
- **Rarity colors**: Consistent border/glow effects
- **Instance indicator**: Small diamond icon for instanced items
- **Equipped indicator**: Green checkmark overlay
- **Locked indicator**: Lock icon overlay
- **Attachment count**: "3/5" badge on weapons
- **Camo type**: Small biome icon on armor

### Number Formatting
```javascript
function formatNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
}
```

---

## 🚧 Implementation Plan

### Phase 1: Foundation (Critical)
1. Add `instanced` property to all item definitions
2. Implement dual-bank structure (stackable/instanced)
3. Create Instance Manager with unique ID generation
4. Create Bank Manager for dual-mode operations
5. Update save/load system for new structure
6. Add migration for existing saves

### Phase 2: Acquisition Systems
1. Update Gathering System for rarity rolls
2. Enhance Crafting System with rarity
3. Build Upgrade System (3→1 rarity progression)
4. Update Loot System for instanced drops
5. Update Mission System rewards
6. Create Shop System with sections

### Phase 3: Category Features
1. Weapon Attachment System (0-8 slots by rarity)
2. Armor Camo System (biome patterns)
3. Tool Efficiency System (rarity multipliers)
4. Perk Medal System (perk arrays)
5. Technology as consumables (250 uses)

### Phase 4: UI Implementation
1. Bank UI with dual-mode display
2. Rarity visual effects
3. Item comparison interface
4. Attachment modal system
5. Number formatting throughout

---

## ⚠️ Critical Considerations

### Edge Cases to Handle
1. **Stack splitting**: When modifying one item from a stackable group
2. **Instance comparison**: Comparing same base item with different rarities
3. **Equipment references**: Use uniqueId for instanced, baseItemId for stackables
4. **Performance**: Efficient lookup with thousands of instances
5. **Save size**: Instances will significantly increase save data

### Design Decisions
1. **No stack limits**: Infinite stacking for all stackables
2. **Rarity on creation**: Rarity determined when item created, not modified later
3. **Attachment permanence**: Attachments stay with weapon instance
4. **Protected quest items**: Cannot be sold/deleted
5. **Technology simplification**: Consumable with uses, not instanced with durability

### Integration Points
1. **Combat System**: Reads weapon stats including attachments
2. **Gathering System**: Tool efficiency affects gathering rate
3. **Perk Grid**: Equipment provides base stats that perks multiply
4. **Save System**: Must handle both storage types
5. **Equipment System**: References appropriate ID type

---

## 🎮 Gameplay Impact

### Early Game (Months 1-3)
- Mostly common/uncommon items
- Limited attachments (0-1 slots)
- Focus on quantity over quality
- Discovering first shop sections

### Mid Game (Months 4-12)
- Rare/Epic items becoming common
- Multiple attachments per weapon
- Upgrade system becomes important
- Multiple shop sections unlocked

### Late Game (Year 1-2)
- Legendary+ items required for progression
- Full attachment optimization
- Perfect perk arrangements
- All shops discovered

### Endgame (Year 2+)
- Creator tier items with 8 attachments
- Multiple perfect sets for different scenarios
- Collection completion goals
- Prestige system engagement

---

## 📈 Progression Gates

### Hard Requirements (Cannot bypass)
- Skill levels for nodes/crafting
- Quest completion for certain items
- Specific equipment for boss immunities
- Engineering level for upgrade tiers

### Soft Requirements (Can overcome with time)
- Resource quantities for crafting
- Component requirements for upgrades
- Gold for shop purchases
- Medals for perk crafting

---

## 💎 Monetization Integration

### Gems Can:
- Speed up crafting (instant completion)
- Boost drop rates (temporary multipliers)
- Refresh shop inventory
- Reroll rarity outcomes

### Gems Cannot:
- Bypass level requirements
- Create items from nothing
- Skip progression gates
- Provide exclusive items

---

## 📋 Success Metrics

- [ ] Stackable items stack infinitely without errors
- [ ] Instanced items each have unique IDs
- [ ] Rarity system affects all instanced categories appropriately
- [ ] Bank UI clearly differentiates item types
- [ ] Attachment system supports 0-8 slots based on rarity
- [ ] Upgrade system combines lower → higher rarity
- [ ] Shop sections unlock through discovery
- [ ] Save/load preserves all item data
- [ ] Performance remains smooth with 1000+ instances

---

## 🔗 Related Documents

- `GAME_CONTEXT.md` - Overall game structure and systems
- `FOUNDATION_SPECIFICATION.md` - Core architecture patterns
- `UNIFIED_DATA_ARCHITECTURE.md` - Registry system design
- `CURRENT_STATE_SUMMARY.md` - Current implementation status

---

**Last Updated**: 2025-01-20  
**Next Review**: After Phase 1 implementation  
**Owner**: Game Systems Team