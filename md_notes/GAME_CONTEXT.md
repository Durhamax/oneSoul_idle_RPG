# OneSoul Idle RPG - Game Context Document

**Last Updated:** 2025-12-02
**Version:** 3.1
**Purpose:** Single source of truth for development context and AI assistance

---

## WORKING DIRECTORY

```
C:\Users\durha\oneSoul_idle_RPG\
```

**NEVER** use `C:\Users\durha\Documents\oneSoul_idle_RPG\` - this is incorrect.

---

## PROJECT OVERVIEW

**OneSoul Idle RPG** is a browser-based incremental RPG featuring:
- Resource gathering across 6 gathering skills
- Combat system with enemy progression
- Crafting system with 6+1 crafting skills
- Equipment and tool systems with instanced items
- Region-based exploration and navigation
- Perk grid system with medal crafting

**Tech Stack:**
- Pure JavaScript (ES6+), HTML5, CSS3
- No external frameworks (vanilla JS)
- Modular architecture with registry pattern
- LocalStorage for persistence

---

## CURRENT STATUS (2025-12-01)

### Recently Implemented

**Overview UI Overhaul** (2025-12-02):
- Removed character header (redundant with game header ribbon)
- 3-column layout: Attributes+Combat Stats+Milestones | Skills | Loadout
- Combat Power moved to Combat Stats panel as top stat with tier coloring
- 3-1-3 equipment grid: Left (Weapon/Gloves/Boots) | Center (Armor Set) | Right (Back/Neck/Ring)
- Unified 100px square tiles for all equipment, consumable, and tech slots
- Armor Set slot dynamically fills center column height
- Consumables row: Food, Potion, Ammo (3 slots)
- Technology row: Tech1-4 (4 slots, locked by Intellect)
- Attribute hover tooltips explaining Combat, Gathering, and Crafting impact
- 40px top padding for clearance from game header ribbon
- 3px vertical gap between attribute/skill rows
- Skills tab deprecated (commented out in sidebar)
- Dev stats panel deprecated (commented out at bottom)

**Unified Crafting UI** (Phase 1-5 Complete):
- Three-tab layout: Recipes, Workshop, Engineering
- Skill pill filters for recipe browsing
- Recipe cards with material indicators
- Queue sidebar showing all active crafts
- Workstation tier display with upgrade paths
- Integration with existing crafting system

**Combat UI Restyling**:
- Matches new crafting UI patterns (tabs, pills, cards)
- Enemy selection with difficulty filter pills
- Combatant cards for active combat display
- Loadout container with equipment cards and stats sidebar

**Dual Bank System**:
- Stackable items: `bank.items = { itemId: { quantity, tab } }`
- Instanced items: `bank.equipmentInstances = { instanceId: {...} }`
- Equipment has unique instances with stats, rarity, potential

### What Works
- Combat system with EventBus integration
- Equipment system with instanced items
- Unified Crafting UI with all 6 crafting skills
- Save/Load system with migrations
- Navigation UI with endurance system
- Universal gathering system (all 6 skills)
- Perk grid with medal crafting

### Known Issues
- Some recipes may reference materials not yet in registry
- Combat auto-consumption needs base ID extraction fix

---

## ARCHITECTURE

### Core Pattern: Registry System

All game data uses the **BaseRegistry** pattern:
- Multi-environment: production/dev/test/legacy/planned
- Schema validation on registration
- Query methods: `getById()`, `getAllActive()`, `filter()`

**Active Registries** (use `_NEW.js` versions):
- `ItemRegistry` - Items, equipment, materials
- `NodeRegistry` - Gathering nodes
- `EnemyRegistry` - Combat enemies
- `RecipeRegistry` - Crafting recipes
- `MissionRegistry` - Quests/missions
- `SkillRegistry` - Skill definitions
- `RegionRegistry` - World regions

### System Pattern

Systems inject methods into GameEngine:

```javascript
const ExampleSystem = {
    init(engine) {
        engine.methodName = this.methodName.bind(engine);
    },
    methodName() {
        // 'this' refers to GameEngine
        this.state.property = value;
    }
};
```

### Item Access Pattern

```javascript
// PRIMARY - Always use ItemRegistry
const itemDef = ItemRegistry.getItem(itemId);

// For instanced items, parse the instance ID first
const baseId = parseInstanceId(instanceId);
const itemDef = ItemRegistry.getItem(baseId);
```

### Instance ID Formats

Two formats exist in the codebase:
```javascript
// Format 1: baseId_instance_timestamp_random (dualBankSystem)
"bronzeSword_instance_1763928759179_8vf9c5dkj"

// Format 2: baseId_timestamp_random (craftingSystem)
"bronzeSword_1763928759179_8vf9c5dkj"

// Parse function handles both:
function parseInstanceId(fullId) {
    if (fullId.includes('_instance_')) {
        return fullId.split('_instance_')[0];
    }
    const parts = fullId.split('_');
    if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
        return parts.slice(0, -2).join('_');
    }
    return fullId;
}
```

### Slot vs EquipSlot

- `slot` - Bank tab categorization (where item appears in inventory)
- `equipSlot` - Equipment slot (where item equips)

Example: Tools have `slot: 'tool'` but `equipSlot: 'weapon'`

---

## KEY SYSTEMS

### Equipment System

**Equipment Slots (3-1-3 Grid + Consumables + Tech):**
```
Overview UI Loadout Layout:

Left Column    Center Column    Right Column
[Weapon]       [             ]  [Back]
[Gloves]       [ Armor Set   ]  [Neck]
[Boots]        [             ]  [Ring]

Consumables Row: [Food] [Potion] [Ammo]
Technology Row:  [Tech1] [Tech2] [Tech3] [Tech4]

- All slots are 100px squares (uniform size)
- Armor Set slot spans full height of center column
- Tech slots unlock based on Intellect attribute
```

**Instanced Equipment:**
```javascript
{
    baseItemId: "bronzeSword",
    instanceId: "bronzeSword_1763928759179_abc123",
    rarity: "uncommon",
    stats: { damage: 15 },
    enhancements: 0,
    potential: 3,
    attachments: {},
    createdAt: 1763928759179
}
```

### Crafting System (6+1 Skills)

**Crafting Skills:**
- Smithing - Weapons, armor, metal items
- Mechanics - Firearms, mechanical devices
- Electronics - Tech items, circuitry
- Textiles - Cloth armor, fabric items
- Chemistry - Potions, explosives
- Cooking - Food, consumables

**Engineering (Special):**
- Not a traditional crafting skill
- Unlocks workstation upgrades
- Gates advanced features

**Workstation Tiers (0-5):**
- Tier 0: No station (basic crafting only)
- Tier 1-5: Progressive bonuses to speed, quality, output

**Recipe Structure:**
```javascript
{
    id: 'solfishBake',
    name: 'Solfish Bake',
    skill: 'cooking',
    skillLevelRequired: 1,
    tier: 1,
    materials: [
        { itemId: 'solfish', quantity: 1 },
        { itemId: 'mintyHerb', quantity: 1 }
    ],
    outputs: { itemId: 'solfishBake', baseQuantity: 2 },
    baseTime: 4000,
    experienceGain: 15
}
```

### Gathering System

**6 Gathering Skills:**
- Mining - Ores, gems, stone
- Logging - Wood, bark, sap
- Fishing - Fish, shells
- Hunting - Meat, hides, bones
- Foraging - Herbs, berries, plants
- Thieving - Lockpicking, pickpocketing

**Tool Detection:**
```javascript
// Tools use 'skill' property to match gathering skills
const weapon = ItemRegistry.getItem(parseInstanceId(weaponId));
if (weapon && weapon.skill === 'mining') {
    // This is a mining tool
}
```

### Combat System

**Combat Flow:**
1. Select enemy from Enemies tab
2. Click to open Enemy Modal
3. Start Combat -> switches to Combat tab
4. Timer-based attacks (player and enemy)
5. Type effectiveness applies
6. Defeat enemy -> loot drops -> respawn timer

**Type Effectiveness:**
| Damage Type | Strong Against | Weak Against |
|-------------|----------------|--------------|
| Pierce | Insulated | Plated |
| Explosive | Plated | Airborne |
| Cryo | Airborne | Biological |
| Shock | Droid | Insulated |
| Incendiary | Biological | Droid |

### Navigation System

**Endurance-Based Exploration:**
- Endurance pool scales with attributes
- Discovery attempts cost endurance
- Auto-stops when depleted
- Recovery when not navigating

**Discovery System:**
- Nodes become globally accessible once discovered
- Enemies added to global pool
- Region-specific content unlocks

---

## UI ARCHITECTURE

### Overview UI

**Location:** `src/ui/overviewUI.js`, `styles/overview-ui.css`

**3-Column Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│                     [Game Header Ribbon]                        │
├─────────────────────┬─────────────────────┬─────────────────────┤
│    COLUMN 1         │    COLUMN 2         │    COLUMN 3         │
│   ┌─────────────┐   │   ┌─────────────┐   │   ┌─────────────┐   │
│   │ Attributes  │   │   │             │   │   │   Loadout   │   │
│   │ + Tooltips  │   │   │   Skills    │   │   │  3-1-3 Grid │   │
│   └─────────────┘   │   │   Panel     │   │   │             │   │
│   ┌─────────────┐   │   │             │   │   │ Consumables │   │
│   │Combat Stats │   │   │ - Priority  │   │   │ Technology  │   │
│   │ + Power     │   │   │ - Gathering │   │   │             │   │
│   └─────────────┘   │   │ - Crafting  │   │   └─────────────┘   │
│   ┌─────────────┐   │   └─────────────┘   │                     │
│   │ Milestones  │   │                     │                     │
│   └─────────────┘   │                     │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Key Features:**
- 40px top padding for header clearance
- Attributes with hover tooltips (Combat/Gathering/Crafting impact)
- Combat Power as top stat in Combat Stats panel
- Unified 100px square equipment tiles
- Skills panel with clickable rows to navigate to skill UIs

**7 Attributes:**
| Attribute   | Combat Effect           | Gathering Effect              | Crafting Effect              |
|-------------|-------------------------|-------------------------------|------------------------------|
| Health      | +10 Max HP/point        | Dangerous node survival       | None                         |
| Strength    | +1 Damage/point         | Mining/logging yield          | Smithing stamina cost        |
| Defense     | +1% Damage Reduction    | Hazard damage reduction       | None                         |
| Stealth     | +1% Evasion             | Thieving success rate         | None                         |
| Perception  | +1% Accuracy            | Rare material discovery       | Quality inspection           |
| Mobility    | +1% Attack Speed        | Gathering action speed        | Crafting time reduction      |
| Intellect   | Unlocks Tech Slots      | Engineering efficiency        | Electronics/Chemistry unlock |

### Unified Crafting UI

**Location:** `src/ui/crafting/`

**Components:**
- `UnifiedCraftingUI.js` - Main coordinator
- `RecipesTab.js` - Recipe browsing and crafting
- `WorkshopTab.js` - Workstation management
- `EngineeringTab.js` - Advanced features
- `CraftQueue.js` - Queue sidebar

**Three-Tab Layout:**
1. **Recipes** - Main crafting interface
   - Skill pills at top (filter by skill)
   - Recipe cards in grid
   - Material availability indicators
   - Quick craft buttons

2. **Workshop** - Workstation upgrades
   - All 6 workstations as cards
   - Tier display and benefits
   - Upgrade requirements

3. **Engineering** - Advanced features
   - Equipment perfection
   - Technology assembly
   - Salvaging

### Combat UI

**Location:** `src/ui/combat/`

**Components:**
- `combatUI.js` - Main coordinator
- `enemySelectionPanel.js` - Enemy browser
- `combatContainer.js` - Active combat display
- `loadoutContainer.js` - Equipment/stats
- `enemyModal.js` - Enemy details
- `combatAnimations.js` - Visual effects

### View Switching

```javascript
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    // Update UI for that view
}
```

---

## STATE MANAGEMENT

### GameEngine.state Structure

```javascript
GameEngine.state = {
    // Character
    characterLevel: { name, level, exp, unassignedAttributePoints },
    combatAttributes: { health, strength, mobility, intellect, ... },
    skills: { mining: {level, exp}, cooking: {level, exp}, ... },

    // Inventory (Dual Bank)
    bank: {
        items: { [itemId]: { quantity, tab } },           // Stackable
        equipmentInstances: { [instanceId]: {...} },      // Instanced
        tabs: { resource, tool, weapon, armor, ... },
        activeTab: "resource"
    },

    // Equipment
    equipment: {
        weapon, helmet, back, gloves, chest, neck, boots, legs, ring,
        ammo, food, potion,
        tech1, tech2, tech3, tech4
    },

    // Combat
    combat: {
        player: { baseAttackDamage, attackSpeed, currentHealth, maxHealth },
        currentEnemy: null,
        inCombat: false,
        currentStance: "offensive"
    },

    // World
    currentRegion: "region_-3_-4",
    regions: { [regionId]: { discovered, discoveryProgress, ... } },
    globalNodes: {},
    globalEnemies: {},

    // Crafting
    crafting: {
        activeCrafts: [],
        selectedSkill: null,
        autoRecipe: null
    },

    // Engineering
    engineering: {
        workshops: { cooking: 0, smithing: 0, ... }
    }
}
```

### State Modification Rules

1. **Only systems modify state** - UI reads, doesn't write
2. **UI triggers system methods** - `GameEngine.startCraft(recipeId)`
3. **State changes trigger UI updates** - Manual or via EventBus

---

## FILE STRUCTURE

```
oneSoul_idle_RPG/
├── index.html                  # Main entry point
├── saveSystem.js               # Save/load functionality
├── GAME_CONTEXT.md             # This file
│
├── src/
│   ├── core/
│   │   ├── gameEngine.js       # Main coordinator
│   │   ├── BaseRegistry.js     # Registry base class
│   │   ├── EventBus.js         # Event system
│   │   ├── definitions.js      # Legacy definitions
│   │   └── statCalculator.js   # Stat calculations
│   │
│   ├── data/
│   │   ├── items/
│   │   │   ├── itemRegistry_NEW.js
│   │   │   └── production/     # equipment, consumables, materials
│   │   ├── nodes/
│   │   │   ├── nodeRegistry_NEW.js
│   │   │   └── production/     # mining, logging, fishing, etc.
│   │   ├── enemies/
│   │   ├── recipes/
│   │   │   ├── recipeRegistry_NEW.js
│   │   │   └── production/     # Recipe files by skill
│   │   ├── skills/
│   │   └── regions/
│   │
│   ├── systems/
│   │   ├── combat/             # Combat system modules
│   │   ├── craftingSystem.js
│   │   ├── equipmentSystem.js
│   │   ├── gatheringSystem.js
│   │   ├── navigationSystem.js
│   │   ├── dualBankSystem.js
│   │   └── ...
│   │
│   ├── ui/
│   │   ├── crafting/           # Unified Crafting UI
│   │   ├── combat/             # Combat UI
│   │   ├── uiCore.js
│   │   ├── globalHandlers.js
│   │   └── ...
│   │
│   └── utils/
│       ├── formatting.js
│       └── ...
│
├── styles/
│   ├── crafting-ui.css
│   ├── combat-ui.css
│   ├── game-ui.css
│   └── ...
│
└── md_notes/                   # Extended documentation
```

---

## DEVELOPMENT PATTERNS

### Adding New Items

1. Add to `src/data/items/production/[category]/`
2. Follow item schema (id, name, category, slot, etc.)
3. Items auto-register via registry system

### Adding New Recipes

1. Add to `src/data/recipes/production/[skill]_recipes.js`
2. Follow recipe schema
3. Register with `RecipeRegistry.registerBatch()`

### Adding New Systems

1. Create `src/systems/newSystem.js`
2. Use system injection pattern
3. Add script tag to `index.html` (correct position)
4. Initialize in `gameEngine.js`

### Common Gotchas

1. **Instance IDs** - Always parse before looking up definitions
2. **Slot vs EquipSlot** - Tools use different values for each
3. **RecipeRegistry returns object** - Use `Object.values()` for arrays
4. **Load order matters** - Check index.html for dependencies

---

## QUICK REFERENCE

### Debug Commands

```javascript
// Add item to bank
GameEngine.addItemToBank('ironOre', 50);

// Get player stats
GameEngine.getPlayerCombatStats();

// Check equipment
GameEngine.state.equipment;

// Check bank
GameEngine.state.bank.items;
GameEngine.state.bank.equipmentInstances;

// Force save
saveGame();

// Check crafting queue
GameEngine.state.crafting.activeCrafts;
```

### UI Skill Colors

```css
--smithing-color: #8B4513;    /* Brown */
--mechanics-color: #708090;   /* Steel gray */
--electronics-color: #00CED1; /* Cyan */
--textiles-color: #8B008B;    /* Purple */
--chemistry-color: #32CD32;   /* Lime */
--cooking-color: #FF6347;     /* Tomato */
```

---

## EXTENDED DOCUMENTATION

For detailed guides, see `md_notes/`:
- `EQUIPMENT_SYSTEM_GUIDE.md` - Equipment mechanics
- `OneSoul_Crafting_System_Design.md` - Full crafting design
- `PROJECT_ARCHITECTURE.md` - Complete architecture reference

---

**End of Context Document**
