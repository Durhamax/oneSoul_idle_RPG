# OneSoul Idle RPG - Complete Project Architecture

**Last Updated:** 2025-11-29
**Purpose:** Comprehensive technical reference for AI assistants and future development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Core Architecture](#core-architecture)
4. [Game Engine](#game-engine)
5. [Data Registries](#data-registries)
6. [Systems](#systems)
7. [UI Components](#ui-components)
8. [HTML Structure](#html-structure)
9. [Script Loading Order](#script-loading-order)
10. [State Management](#state-management)
11. [Development Patterns](#development-patterns)
12. [Future Systems Planning](#future-systems-planning)

---

## 📌 Project Overview

**OneSoul Idle RPG** is a browser-based incremental RPG featuring:
- Resource gathering across 6 gathering skills
- Combat system with enemy progression
- Crafting system with 7 crafting skills
- Equipment and tool systems
- Region-based exploration and navigation
- Perk grid system with medal crafting
- Mission system with objectives
- Engineering/workshop upgrades

**Tech Stack:**
- Pure JavaScript (ES6+)
- HTML5/CSS3
- No external frameworks (vanilla JS)
- Modular architecture with registry pattern

**Working Directory:**
```
C:\Users\durha\oneSoul_idle_RPG\
```

---

## 📁 Directory Structure

```
oneSoul_idle_RPG/
│
├── index.html                      # Main entry point
├── saveSystem.js                   # Save/load functionality
├── clean-legacy-items.js           # Legacy cleanup utility
│
├── styles/                         # CSS stylesheets
│   ├── variables.css               # CSS custom properties
│   ├── global.css                  # Global styles
│   ├── components.css              # Reusable components
│   ├── background.css              # Background effects
│   ├── header.css                  # Header styling
│   ├── layout.css                  # Layout grid
│   ├── game-ui.css                 # Game UI elements
│   ├── modals.css                  # Modal dialogs
│   └── developer.css               # Dev tools styling
│
├── src/
│   ├── core/                       # Core game systems
│   │   ├── EventBus.js             # Event system
│   │   ├── BaseRegistry.js         # Base class for all registries
│   │   ├── RegistryManager.js      # Registry coordinator
│   │   ├── registryInit.js         # Registry initialization
│   │   ├── gameEngine.js           # Main game loop & state coordinator
│   │   ├── definitions.js          # Legacy definitions (being phased out)
│   │   └── statCalculator.js       # Combat/equipment stat calculations
│   │
│   ├── data/                       # All game data (registry pattern)
│   │   ├── attributes/             # Character attributes (health, strength, etc.)
│   │   ├── biomes/                 # Biome definitions
│   │   ├── craftingStations/       # Crafting station data
│   │   ├── currencies/             # Currency types (gold, medals, etc.)
│   │   ├── enemies/                # Enemy definitions
│   │   │   ├── enemySchema.js
│   │   │   ├── enemyRegistry_NEW.js
│   │   │   ├── enemyInit.js
│   │   │   └── production/basicEnemies.js
│   │   ├── incursions/             # Special event/incursion data
│   │   ├── items/                  # Item registry system
│   │   │   ├── itemSchema.js       # Item validation schema
│   │   │   ├── itemValidator.js    # Schema validation logic
│   │   │   ├── itemRegistry_NEW.js # Main item registry
│   │   │   ├── itemRegistryInit.js # Registry initialization
│   │   │   ├── index.js            # Item database index
│   │   │   ├── production/         # Production items
│   │   │   │   ├── equipment/equipment.js    # Weapons, armor, tools
│   │   │   │   ├── consumables/consumables.js # Food, potions
│   │   │   │   ├── materials/materials.js     # Resources
│   │   │   │   └── currencies/currencies.js   # Currency items
│   │   │   ├── dev/devItems.js     # Development items
│   │   │   ├── test/               # Test items
│   │   │   ├── legacy/             # Deprecated items
│   │   │   └── planned/            # Future items
│   │   ├── lootTables/             # Loot drop tables
│   │   ├── missions/               # Mission definitions
│   │   │   ├── missionRegistry_NEW.js
│   │   │   └── missionInit.js
│   │   ├── nodes/                  # Resource nodes (gathering)
│   │   │   ├── nodeSchema.js
│   │   │   ├── nodeRegistry_NEW.js
│   │   │   ├── nodeUtils.js        # Node utility functions
│   │   │   ├── nodeValidator.js
│   │   │   ├── nodeScaling.js      # Node difficulty scaling
│   │   │   ├── rareTables.js       # Rare drop tables
│   │   │   ├── nodeItemIntegration.js
│   │   │   ├── nodeDevTools.js     # Dev tools for nodes
│   │   │   ├── nodeInit.js         # Node initialization
│   │   │   └── production/         # Production nodes by skill
│   │   │       ├── mining.js
│   │   │       ├── logging.js
│   │   │       ├── fishing.js
│   │   │       ├── hunting.js
│   │   │       ├── foraging.js
│   │   │       └── thieving.js
│   │   ├── npcs/                   # NPC definitions
│   │   ├── perks/                  # Perk definitions
│   │   ├── recipes/                # Crafting recipes
│   │   │   ├── recipeRegistry_NEW.js
│   │   │   └── recipeInit.js
│   │   ├── regions/                # World regions/zones
│   │   │   ├── worldRegions.js
│   │   │   ├── regionRegistry_NEW.js
│   │   │   └── regionInit.js
│   │   ├── skills/                 # Skill definitions
│   │   │   ├── skillRegistry_NEW.js
│   │   │   ├── index.js
│   │   │   └── production/skills_production.js
│   │   ├── stances/                # Combat stance data
│   │   ├── technologies/           # Technology upgrades
│   │   └── worldTilemap.js         # World map generation
│   │
│   ├── systems/                    # Game systems (logic & mechanics)
│   │   ├── attachmentSystem.js     # Weapon attachment system
│   │   ├── backgroundSystem.js     # Dynamic background effects
│   │   ├── combatSystem.js         # Combat mechanics
│   │   ├── offlineCombatSystem.js  # Offline combat progression
│   │   ├── craftingSystem.js       # Crafting mechanics
│   │   ├── dualBankSystem.js       # Instanced + stackable inventory
│   │   ├── engineeringSystem.js    # Workshop/specialization
│   │   ├── enhancementSystem.js    # Item enhancement
│   │   ├── equipmentSystem.js      # Equipment management
│   │   ├── equipmentPresetSystem.js # Equipment loadout presets
│   │   ├── gatheringSystem.js      # Universal gathering (6 skills)
│   │   ├── miningSystem.js         # Mining-specific mechanics
│   │   ├── globalDiscoverySystem.js # Node/enemy discovery
│   │   ├── harvestSystem.js        # DEPRECATED - use gatheringSystem
│   │   ├── hexGridSystem.js        # Hexagonal grid for world map
│   │   ├── inventorySystem.js      # Item storage & management
│   │   ├── itemIntegration.js      # Item system integration layer
│   │   ├── medalCraftingSystem.js  # Medal crafting mechanics
│   │   ├── migrationSystem.js      # Save data migration
│   │   ├── missionSystem.js        # Mission tracking & completion
│   │   ├── navigationSystem.js     # Region navigation/exploration
│   │   ├── nodeCollectionSystem.js # Node harvesting
│   │   ├── perkGridSystem.js       # Perk grid mechanics
│   │   ├── perkGridSimulator.js    # Perk grid simulation
│   │   ├── resourceSystem.js       # Resource management
│   │   ├── restRecoverySystem.js   # DEPRECATED
│   │   ├── skillSystem.js          # Skill progression
│   │   ├── typeEffectivenessSystem.js # Combat type matchups
│   │   └── worldMapSystem.js       # World map generation
│   │
│   ├── ui/                         # UI components & rendering
│   │   ├── core/
│   │   │   └── UIComponent.js      # Base UI component class
│   │   ├── components/             # Reusable UI components
│   │   │   ├── PersistentActionBar.js # Sticky action bar
│   │   │   ├── SkillCard.js        # Skill display cards
│   │   │   └── NodePanel.js        # Node selection panel
│   │   ├── utilities/
│   │   │   └── itemAccessHelper.js # Item lookup utilities
│   │   ├── animations.js           # Animation utilities
│   │   ├── attachmentModal.js      # Weapon attachment UI
│   │   ├── bankDevTools.js         # Bank dev tools
│   │   ├── combatUI.js             # Combat view
│   │   ├── offlineCombatUI.js      # Offline combat display
│   │   ├── craftingUI.js           # Crafting view
│   │   ├── developerUI.js          # Developer panel
│   │   ├── devItemTools.js         # Item creation tools
│   │   ├── devModal.js             # Developer modal
│   │   ├── devStatsPanel.js        # Dev stats overlay
│   │   ├── devTools.js             # Debug tools
│   │   ├── engineeringUI.js        # Engineering/workshop view
│   │   ├── equipmentComponent.js   # Equipment slot rendering
│   │   ├── equipmentPresetsUI.js   # Preset management UI
│   │   ├── equipmentUI.js          # Equipment view
│   │   ├── gatheringUI.js          # Gathering activity display
│   │   ├── globalHandlers.js       # Global click handlers
│   │   ├── harvestStatsPanel.js    # Harvest statistics
│   │   ├── init.js                 # UI initialization
│   │   ├── itemCard.js             # Item card component
│   │   ├── itemConsumptionAnimation.js # Item use animations
│   │   ├── itemModal.js            # Item detail modal
│   │   ├── mapRenderer.js          # DISABLED - World map renderer
│   │   ├── medalCraftingModal.js   # Medal crafting interface
│   │   ├── medalCraftingUI.js      # Medal crafting view
│   │   ├── medalSelectionModal.js  # Medal selection
│   │   ├── miningUI.js             # Mining activity display
│   │   ├── missionsUI.js           # Missions view
│   │   ├── modal.js                # Modal utilities
│   │   ├── navigationUI.js         # Navigation/exploration view
│   │   ├── nodeCollectionUI.js     # Node harvesting UI
│   │   ├── overviewUI.js           # Overview/dashboard
│   │   ├── perkGridUI.js           # Perk grid view
│   │   ├── regionModal.js          # Region detail popup
│   │   ├── resourcesUI.js          # Resource display
│   │   ├── skillNodeModal.js       # Node selection modal
│   │   ├── skillsUI.js             # Skills view
│   │   ├── statDisplayUI.js        # Stat display components
│   │   ├── tooltipUI.js            # Tooltip system
│   │   ├── uiCore.js               # Core UI utilities
│   │   └── weaponBuildModal.js     # Weapon customization
│   │
│   └── utils/                      # Utility functions
│       ├── assetManager.js         # Asset loading & caching
│       ├── formatting.js           # Number/text formatting
│       ├── iconHelper.js           # Icon utilities
│       ├── progressBar.js          # Progress bar components
│       ├── simplexNoise.js         # Noise generation
│       └── uiComponents.js         # UI helper functions
│
├── data/                           # External data files (JSON, CSV)
├── scripts/                        # Utility scripts
├── outputs/                        # Generated files
├── md_notes/                       # Documentation notes
└── docs/                           # Documentation
```

---

## 🏗️ Core Architecture

### Architecture Patterns

**1. Registry Pattern**
- All game data uses the BaseRegistry system
- Multi-environment support (production/dev/test/legacy/planned)
- Centralized validation and schema enforcement
- Example: `ItemRegistry`, `NodeRegistry`, `EnemyRegistry`

**2. System Pattern**
- Game logic separated into modular systems
- Each system focuses on one domain (combat, crafting, navigation, etc.)
- Systems inject methods into GameEngine via `init(engine)` pattern
- Example: `CombatSystem.init(GameEngine)` adds combat methods to engine

**3. UI Component Pattern**
- Separation of rendering logic from game logic
- UI components read from GameEngine.state
- Event-driven updates via EventBus or direct calls
- Example: `SkillsUI.update()` renders skills view

**4. State-Driven Design**
- Single source of truth: `GameEngine.state`
- All game data flows through state object
- Save system serializes entire state
- UI reflects state changes

### Key Architectural Decisions

**Registry System (NEW - Post-Migration)**
- All game entities use `_NEW.js` registry files
- Old files (`itemRegistry.js`, `nodeRegistry.js`) are deprecated
- BaseRegistry provides unified interface
- Environment-based content filtering

**Tool System**
- Tools use `skill` property (e.g., `skill: 'mining'`)
- Tools equip to `weapon` slot (not a dedicated tool slot)
- `slot` property determines bank tab, `equipSlot` determines equipment slot
- Tools are recognized by matching `weapon.skill === skillType`

**Instance ID Formats**
- Format 1: `baseId_instance_timestamp_random` (dualBankSystem)
- Format 2: `baseId_timestamp_random` (craftingSystem)
- All systems must parse both formats
- Use regex `/^\d{13}$/` to detect 13-digit timestamps

**Item Access Pattern**
```javascript
// STANDARDIZED - Always use ItemRegistry
const itemDef = ItemRegistry.getItem(itemId);

// FALLBACK - Only if ItemRegistry unavailable
const itemDef = GameEngine.definitions.items[itemId];
```

**Node Access Pattern**
```javascript
// Get active nodes (respects dev/test mode)
const nodes = NodeRegistry.getAllActive();

// Get specific node
const node = NodeRegistry.getNode(nodeId);

// Filter nodes by skill
const miningNodes = NodeRegistry.getBySkill('mining');
```

---

## 🎮 Game Engine

**File:** `src/core/gameEngine.js`

### Purpose
Central coordinator for all game systems. Manages game state, game loop, and system integration.

### Core Structure

```javascript
const GameEngine = {
    // Single source of truth for all game data
    state: {
        // Currencies
        currencies: { gold, medals, tomes, gems },

        // Resources
        resources: { ore, wood, health, maxHealth },

        // Skills (13 total: 6 gathering + 7 crafting)
        skills: {
            // Gathering: navigation, mining, logging, fishing, hunting, foraging, thieving
            // Crafting: cooking, chemistry, smithing, mechanics, electronics, textiles, engineering
        },

        // Character level & attributes
        characterLevel: { name, level, exp, unassignedAttributePoints },
        combatAttributes: { health, defense, strength, stealth, perception, mobility, intellect },

        // Region & exploration
        currentRegion: "region_-3_-4",  // Current region ID
        regions: {
            // Per-region data: discovered, discoveryProgress, availableNodes
        },

        // Global discoveries (cross-region)
        globalNodes: {},    // Nodes discovered across all regions
        globalEnemies: {},  // Enemies discovered across all regions

        // Activity state (only one active at a time)
        currentActivity: null,  // 'navigation' | 'combat' | 'nodeCollection' | 'crafting'

        // Navigation/exploration
        activeNavigation: {
            isNavigating, isRecovering, endurance, maxEndurance
        },

        // Bank/Inventory (dual system)
        bank: {
            items: {},              // Stackable items: {itemId: quantity}
            equipmentInstances: {}, // Instanced items: {instanceId: {...}}
            tabs: { resource, tool, weapon, armor, ... },
            activeTab: "resource"
        },

        // Equipment (3x3 grid + consumables + tech)
        equipment: {
            // 3x3 Grid: weapon, helmet, back, gloves, chest, neck, boots, legs, ring
            // Consumables: ammo, food, potion
            // Technology: tech1, tech2, tech3, tech4 (intellect-gated)
        },

        // Equipment presets (10 loadouts)
        equipmentPresets: {
            presets: [null × 10],
            activePreset: null
        },

        // Combat state
        combat: {
            player: { baseAttackDamage, baseAttackSpeed, currentHealth, maxHealth },
            currentEnemy: null,
            inCombat: false,
            playerAmmo: { currentAmmo, magazineSize, isReloading },
            activeEffects: [],  // DoT, debuffs
            currentStance: "offensive",
            pendingLoot: []
        },

        // Node collection
        nodeCollection: {
            activeNode: null,   // {nodeId, startTime, harvestTime}
            selectedSkill: null
        },

        // Crafting
        crafting: {
            discoveredStations: [],
            activeCrafts: [],   // {recipeId, startTime, completionTime, stationId}
            selectedSkill: null,
            autoRecipe: null
        },

        // Missions
        missions: {
            available: [],
            active: [],
            completed: [],
            activeProgress: {},
            cooldowns: {},
            analytics: {}
        },

        // Engineering (workshops)
        engineering: {
            tokens: 0,
            workshops: { cooking: 0, chemistry: 0, ... },
            paths: {},
            reversedRecipes: []
        },

        // Perk Grid
        perkGrid: {
            medals: {},          // {row,col: medalData}
            unlockedCells: 9,
            savedConfigs: {},
            lastCalculation: null
        },

        // Metadata
        gameTime: 0,
        lastTick: Date.now(),
        tickRate: 100  // 10 ticks/second
    },

    // Game balance variables (tunable)
    gameBalance: {
        skillBaseExpLv1to2: 100,
        skillExpScaling: 1.15,
        characterBaseExpLv1to2: 500,
        characterExpScaling: 1.10,
        // ... (many more tuning knobs)
    },

    // Core methods
    init() {},           // Initialize game
    update(deltaTime) {}, // Main game loop
    save() {},           // Save game state
    load(saveData) {}    // Load saved state
}
```

### Game Loop

**Update Cycle:** 100ms (10 ticks/second)

```javascript
setInterval(() => {
    const now = Date.now();
    const deltaTime = (now - GameEngine.state.lastTick) / 1000; // Convert to seconds

    GameEngine.update(deltaTime);

    GameEngine.state.lastTick = now;
}, GameEngine.state.tickRate);
```

**What Updates Per Tick:**
1. Navigation progress & endurance recovery
2. Combat (attacks, damage, effects, respawns)
3. Node harvesting progress
4. Crafting progress
5. Mission objective tracking
6. Node respawn timers
7. Auto-save (every 30 seconds)

### System Integration

Systems inject their methods into GameEngine via `init()`:

```javascript
// Example: CombatSystem
CombatSystem.init(engine) {
    engine.startCombat = this.startCombat.bind(engine);
    engine.endCombat = this.endCombat.bind(engine);
    engine.performAttack = this.performAttack.bind(engine);
    // ... more methods
}

// Called during initialization
CombatSystem.init(GameEngine);
```

This pattern allows:
- Modular system development
- Clean separation of concerns
- Easy testing of individual systems
- Systems can access `this.state` (GameEngine.state)

---

## 📊 Data Registries

All game data uses the **Registry Pattern** based on `BaseRegistry`.

### BaseRegistry Class

**File:** `src/core/BaseRegistry.js`

**Purpose:** Universal base class for all entity registries.

**Features:**
- Multi-environment storage (production/dev/test/legacy/planned)
- Schema validation
- Query methods (getById, getByTier, filter, etc.)
- Statistics tracking
- Dev mode toggles

**Structure:**
```javascript
class BaseRegistry {
    constructor(entityType) {
        this.production = {};  // Live game content
        this.dev = {};         // In-development content
        this.test = {};        // Testing/experimental content
        this.legacy = {};      // Deprecated content
        this.planned = {};     // Future content

        this.config = {
            devMode: false,
            testMode: false,
            previewMode: false
        };

        this.schema = null;  // Set by subclass
    }

    // Registration
    register(id, definition, environment = 'production') {}
    registerBatch(definitions, environment) {}

    // Access (respects config flags)
    getAllActive() {}     // Returns production + (dev if enabled) + (test if enabled)
    getProduction() {}
    getDev() {}

    // Queries
    getById(id) {}
    filter(predicate) {}

    // Validation
    validate(id, definition) {}

    // Dev tools
    enableDevMode() {}
    disableDevMode() {}
}
```

### Registry Implementations

#### 1. ItemRegistry
**File:** `src/data/items/itemRegistry_NEW.js`

**Extends:** `BaseRegistry`

**Item Types:**
- Equipment: weapons, armor, tools
- Consumables: food, potions
- Materials: resources, components
- Currencies: gold tokens, etc.
- Attachments: weapon mods
- Perks: passive bonuses
- Medals: perk grid items
- Technology: tech upgrades
- Quest items: mission-specific

**Key Properties:**
```javascript
{
    id: "lightPickaxe",
    name: "Light Pickaxe",
    slot: "tool",           // Bank tab categorization
    equipSlot: "weapon",    // Equipment slot (where it equips)
    type: "equipment",
    category: "tool",
    rarity: "common",
    tier: 1,
    skill: "mining",        // NEW: Skill association for tools
    toolTier: 1,            // Tool power level
    stats: { damage: 5 },
    requirements: { mining: 1 }
}
```

**Special Methods:**
- `getItem(itemId)` - Get item with aliasing (creates clean object with equipSlot)
- `getBySlot(slot)` - Filter items by bank tab
- `getByType(type)` - Filter by item type
- `getByRarity(rarity)` - Filter by rarity

#### 2. NodeRegistry
**File:** `src/data/nodes/nodeRegistry_NEW.js`

**Extends:** `BaseRegistry`

**Node Types:**
- Mining nodes (ores, gems)
- Logging nodes (trees)
- Fishing nodes (water sources)
- Hunting nodes (animals)
- Foraging nodes (plants, herbs)
- Thieving nodes (chests, targets)

**Key Properties:**
```javascript
{
    id: "riverbed",
    name: "Riverbed",
    nodeType: "mining",         // Skill required
    tier: 1,
    requiredSkillLevel: 1,
    requiredTools: ['mining'],  // Tool types needed
    minToolTier: 1,            // Minimum tool tier
    baseHealth: 10,            // Harvests before depletion
    harvestTime: 3,            // Seconds per harvest
    respawnTime: 30,           // Seconds to respawn
    resourceTable: {           // Loot table
        flint: { min: 1, max: 3, weight: 80 },
        clay: { min: 1, max: 2, weight: 50 }
    },
    baseXP: 25                 // XP per harvest
}
```

**Special Methods:**
- `getBySkill(skillType)` - Get nodes for a skill
- `getByTier(tier)` - Get nodes by tier
- `getAvailableAtLevel(skillType, level)` - Get accessible nodes
- `meetsRequirements(node, playerState)` - Check if player can access
- `hasRequiredTool(tools, minTier, playerState)` - Validate tool requirements

#### 3. EnemyRegistry
**File:** `src/data/enemies/enemyRegistry_NEW.js`

**Enemy Properties:**
```javascript
{
    id: "bandit",
    name: "Bandit",
    tier: 1,
    health: 100,
    attackDamage: 10,
    attackSpeed: 1.0,
    accuracy: 75,
    defense: 5,
    lootTable: {
        gold: { min: 5, max: 15 },
        items: [
            { itemId: "leatherScraps", chance: 0.3 }
        ]
    },
    respawnTime: 60
}
```

#### 4. RecipeRegistry
**File:** `src/data/recipes/recipeRegistry_NEW.js`

**Recipe Properties:**
```javascript
{
    id: "bronzeSword",
    name: "Bronze Sword",
    skill: "smithing",
    tier: 1,
    requiredLevel: 5,
    craftTime: 10,          // Seconds
    xpGain: 50,
    station: "forge",
    inputs: [
        { itemId: "bronzeBar", quantity: 3 },
        { itemId: "wood", quantity: 1 }
    ],
    outputs: [
        { itemId: "bronzeSword", quantity: 1 }
    ]
}
```

#### 5. MissionRegistry
**File:** `src/data/missions/missionRegistry_NEW.js`

**Mission Properties:**
```javascript
{
    id: "firstSteps",
    name: "First Steps",
    tier: 1,
    type: "tutorial",
    objectives: [
        {
            id: "harvest_wood",
            type: "harvest",
            target: "oakTree",
            required: 10
        }
    ],
    rewards: {
        gold: 50,
        items: [{ itemId: "bronzeAxe", quantity: 1 }],
        xp: 100
    },
    repeatable: false
}
```

#### 6. RegionRegistry
**File:** `src/data/regions/regionRegistry_NEW.js`

**Region Properties:**
```javascript
{
    id: "region_-3_-4",
    name: "The Cradle",
    description: "Starting zone",
    tier: 1,
    biome: "plains",
    coordinates: { q: -3, r: -4 },
    discoveryComplications: 1.0,  // Base difficulty
    availableNodes: ["riverbed", "oakTree", ...],
    availableEnemies: ["bandit", "wolf", ...],
    adjacentRegions: ["region_-2_-4", ...]
}
```

#### 7. SkillRegistry
**File:** `src/data/skills/skillRegistry_NEW.js`

**Skill Properties:**
```javascript
{
    id: "mining",
    name: "Mining",
    description: "Extract ores and minerals",
    category: "gathering",
    icon: "⛏️",
    unlocked: true
}
```

### Registry Initialization Order

**Critical:** Registries must load in dependency order.

```javascript
// 1. Core infrastructure
BaseRegistry

// 2. Schemas
itemSchema, nodeSchema, enemySchema, etc.

// 3. Registries (empty)
ItemRegistry, NodeRegistry, EnemyRegistry, etc.

// 4. Data files (populate registries)
equipment.js, materials.js, mining.js, basicEnemies.js, etc.

// 5. Initialization (finalize registries)
itemRegistryInit.js, nodeInit.js, enemyInit.js, etc.

// 6. Game Engine
gameEngine.js
```

See [Script Loading Order](#script-loading-order) for complete sequence.

---

## ⚙️ Systems

Game logic is organized into modular systems. Each system focuses on one domain.

### System Architecture Pattern

```javascript
const ExampleSystem = {
    /**
     * Initialize system - inject methods into GameEngine
     */
    init(engine) {
        engine.exampleMethod = this.exampleMethod.bind(engine);
        console.log('✅ ExampleSystem initialized');
    },

    /**
     * System methods (bound to engine, access via 'this')
     */
    exampleMethod() {
        // 'this' refers to GameEngine
        this.state.someProperty = value;
    },

    /**
     * Internal helper (not bound to engine)
     */
    _helperFunction(param) {
        return result;
    }
};
```

### Core Systems

#### 1. GatheringSystem
**File:** `src/systems/gatheringSystem.js`

**Purpose:** Universal gathering for all 6 gathering skills.

**Replaces:** `harvestSystem.js` (deprecated)

**Skills Supported:**
- Mining (ores, gems)
- Logging (wood)
- Fishing (fish)
- Hunting (meat, hides)
- Foraging (herbs, berries)
- Thieving (chests, pickpocketing)

**Key Methods:**
```javascript
startGathering(nodeId)     // Start gathering from node
stopGathering()            // Cancel active gathering
tickGathering(deltaTime)   // Progress gathering action
completeGathering()        // Finalize harvest, grant loot
getEquippedToolForSkill(skill) // Check for equipped tool
calculateGatherStats(node, tool, playerLevel) // Compute success rate
```

**Mechanics:**
- Endurance-based activity (drains over time)
- Tool requirements (skill-based)
- Success/failure rolls
- Resource grants + XP
- Node health depletion

**Tool Detection:**
```javascript
// Check weapon slot for tool with matching skill
const weaponId = this.state.equipment.weapon;
const weapon = ItemRegistry.getItem(parseInstanceId(weaponId));

if (weapon && weapon.skill === skillType) {
    return weapon;  // Tool found
}
```

#### 2. CombatSystem
**File:** `src/systems/combatSystem.js`

**Purpose:** Turn-based combat with enemies.

**Key Methods:**
```javascript
startCombat(enemyId)       // Initiate combat
endCombat()                // Exit combat
performAttack()            // Player attacks enemy
enemyAttack()              // Enemy attacks player
calculateDamage(attacker, defender) // Damage calculation
applyEffect(effect)        // DoT, debuffs
checkAutoEat()             // Auto-consume food
handleReload()             // Reload weapons
collectLoot()              // Grant enemy drops
```

**Combat Flow:**
1. Player selects enemy
2. `startCombat(enemyId)` initializes combat state
3. `performAttack()` called every attack interval
4. Damage calculated based on weapon, stats, stance
5. Enemy retaliates via `enemyAttack()`
6. Combat ends when enemy HP reaches 0
7. Loot granted, enemy respawn timer starts

**Stance System:**
- Offensive: +20% damage, -10% defense
- Defensive: -10% damage, +20% defense
- 2 second cooldown between stance changes

#### 3. CraftingSystem
**File:** `src/systems/craftingSystem.js`

**Purpose:** Recipe-based item creation.

**Key Methods:**
```javascript
startCraft(recipeId)       // Begin crafting recipe
tickCrafting(deltaTime)    // Progress active crafts
completeCraft(craft)       // Finalize craft, grant output
canCraft(recipeId)         // Check material availability
consumeInputs(recipe)      // Remove input materials
grantOutputs(recipe)       // Add output items
setAutoRecipe(recipeId)    // Auto-repeat recipe
```

**Crafting Flow:**
1. Player selects recipe
2. System checks material requirements
3. `startCraft()` consumes materials, adds to activeCrafts array
4. `tickCrafting()` tracks progress
5. When complete, output items granted + XP
6. If auto-repeat enabled, immediately start next craft

**Multi-Craft Support:**
- Multiple crafts can run simultaneously
- No queue system (instant start if materials available)

#### 4. NavigationSystem
**File:** `src/systems/navigationSystem.js`

**Purpose:** Region exploration and discovery.

**Key Methods:**
```javascript
startNavigation()          // Begin exploration
stopNavigation()           // Pause exploration
tickNavigation(deltaTime)  // Discovery attempts + endurance drain
attemptDiscovery()         // Roll for node/enemy discovery
recoverEndurance(deltaTime) // Passive endurance recovery
getTierModifiedInterval()  // Calculate discovery speed
canNavigate()              // Check if navigation allowed
```

**Discovery System:**
- Attribute-based mechanics:
  - **Mobility:** Faster discovery attempts
  - **Health:** Larger endurance pool, slower drain
  - **Perception:** Higher discovery success rate
- Discovery rolls happen every X seconds (based on mobility)
- Each roll has % chance to discover node/enemy (based on perception)
- Endurance drains per attempt (based on health)
- When endurance reaches 0, navigation stops
- Endurance recovers passively when not navigating

**Global Discovery:**
- Nodes/enemies discovered in one region become globally accessible
- `state.globalNodes` and `state.globalEnemies` track discoveries
- Each region contributes "health bonus" to global pool
- Total health = sum of all regional contributions

#### 5. EquipmentSystem
**File:** `src/systems/equipmentSystem.js`

**Purpose:** Item equipping and unequipping.

**Key Methods:**
```javascript
equipItem(itemId, slot)    // Equip item to slot
unequipItem(slot)          // Remove item from slot
canEquipToSlot(item, slot) // Validate equip requirements
swapEquipment(slot1, slot2) // Swap two equipped items
```

**Equipment Slots:**
- **3x3 Grid:** weapon, helmet, back, gloves, chest, neck, boots, legs, ring
- **Consumables:** ammo, food, potion
- **Technology:** tech1, tech2, tech3, tech4 (intellect-gated)

**Equip Flow:**
1. Player clicks "Equip" in item modal or bank
2. System determines target slot via `item.equipSlot || item.slot`
3. If slot occupied, old item returned to bank
4. New item placed in slot
5. StatCalculator recalculates combat stats
6. UI updates to reflect changes

**Tool Equipping:**
- Tools have `slot: 'tool'` (bank tab) but `equipSlot: 'weapon'` (equip slot)
- Tools equip to weapon slot, not a dedicated tool slot
- Tool slot doesn't exist in equipment grid

#### 6. InventorySystem / DualBankSystem
**Files:**
- `src/systems/inventorySystem.js`
- `src/systems/dualBankSystem.js`

**Purpose:** Item storage with dual system (stackable + instanced).

**Two Storage Types:**

**Stackable Items** (materials, consumables, currencies):
```javascript
state.bank.items = {
    "copperOre": { quantity: 150, tab: "resource" },
    "bronzeBar": { quantity: 45, tab: "resource" }
}
```

**Instanced Items** (equipment, unique items):
```javascript
state.bank.equipmentInstances = {
    "bronzeSword_1763928759179_8vf9c5dkj": {
        baseItemId: "bronzeSword",
        instanceId: "bronzeSword_1763928759179_8vf9c5dkj",
        rarity: "uncommon",
        stats: { damage: 15 },
        enhancements: 0,
        potential: 3,
        createdAt: 1763928759179
    }
}
```

**Key Methods:**
```javascript
addItemToBank(itemId, quantity)      // Add stackable
createEquipmentInstance(baseItemId)  // Create instanced item
removeItemFromBank(itemId, quantity) // Remove stackable
deleteEquipmentInstance(instanceId)  // Delete instanced item
hasItem(itemId, quantity)            // Check availability
transferItemToBank(instanceId)       // Move equipped item to bank
```

**Instance ID Parsing:**
```javascript
// Two formats exist:
// Format 1: baseId_instance_timestamp_random
// Format 2: baseId_timestamp_random

function parseInstanceId(fullId) {
    if (fullId.includes('_instance_')) {
        return fullId.split('_instance_')[0];
    } else if (fullId.includes('_')) {
        const parts = fullId.split('_');
        // Check if last two parts are timestamp + random
        if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
            return parts.slice(0, -2).join('_');
        }
    }
    return fullId;  // No instance ID
}
```

#### 7. MissionSystem
**File:** `src/systems/missionSystem.js`

**Purpose:** Quest/mission tracking and completion.

**Key Methods:**
```javascript
startMission(missionId)        // Accept mission
abandonMission(missionId)      // Cancel mission
trackObjective(missionId, objectiveId, amount) // Update progress
checkCompletion(missionId)     // Check if mission complete
completeMission(missionId)     // Finalize mission, grant rewards
getMissionsInRegion()          // Get available missions
```

**Objective Types:**
- Harvest: Collect X resources from nodes
- Kill: Defeat X enemies
- Craft: Create X items
- Explore: Discover X locations
- Talk: Interact with NPCs

**Mission Flow:**
1. Mission becomes available in region
2. Player starts mission
3. Objectives tracked automatically via game systems
4. When all objectives complete, mission can be turned in
5. Rewards granted (gold, items, XP)
6. If repeatable, cooldown timer starts

#### 8. EngineeringSystem
**File:** `src/systems/engineeringSystem.js`

**Purpose:** Workshop upgrades and specialization paths.

**Key Methods:**
```javascript
upgradeWorkshop(skill, tier)       // Upgrade workshop
unlockPath(skill, pathId)          // Choose specialization
reverseEngineer(itemId)            // Learn recipe from item
canUpgradeWorkshop(skill, tier)    // Check upgrade requirements
getActiveSpecialization(skill)     // Get chosen path
```

**Workshop Tiers:**
- Tier 0: No workshop (basic crafting)
- Tier 1: Basic workshop (+10% speed, unlock recipes)
- Tier 2: Advanced workshop (+25% speed, +5% quality)
- Tier 3: Master workshop (+50% speed, +10% quality, multi-craft)
- Tier 4: Legendary workshop (+100% speed, +20% quality, auto-craft)

**Specialization Paths:**
Each crafting skill has 2-3 specialization paths (mutually exclusive):
- Cooking: Culinary Master, Alchemical Chef, Survival Expert
- Smithing: Weaponsmith, Armorsmith, Jewelcrafter
- Mechanics: Gunsmith, Engineer, Inventor
- Etc.

#### 9. PerkGridSystem
**File:** `src/systems/perkGridSystem.js`

**Purpose:** Medal placement and power calculation.

**Key Methods:**
```javascript
placeMedal(row, col, medalType)    // Place medal on grid
removeMedal(row, col)               // Remove medal
unlockCell()                        // Unlock next cell (spiral order)
calculatePower()                    // Compute total grid power
saveConfiguration(name)             // Save current grid layout
loadConfiguration(name)             // Restore saved layout
```

**Perk Grid Mechanics:**
- 13x13 grid (169 cells)
- Start with center 3x3 unlocked (9 cells)
- Unlock cells in spiral order
- Medals placed in cells
- Power calculation:
  - Each medal has base power
  - Row multipliers: Adjacent medals in row multiply
  - Column multipliers: Adjacent medals in column multiply
  - Total power = sum of (medal power × row mult × col mult)

**Medal Types:**
- Common: 1 power
- Uncommon: 3 power
- Rare: 10 power
- Epic: 30 power
- Legendary: 100 power
- Mythic: 300 power
- Divine: 1000 power
- Transcendent: 3000 power
- Creator: 10000 power

#### 10. MiningSystem
**File:** `src/systems/miningSystem.js`

**Purpose:** Mining-specific mechanics (HP-based nodes).

**Note:** This is a specialized extension of GatheringSystem for mining only. Most gathering uses GatheringSystem.

**Key Features:**
- Node HP tracking (separate from node health)
- Multi-strike mechanics
- Critical hit system
- Tool durability (if implemented)

**Integration:**
- `state.nodeHealth[nodeId]` tracks HP per node
- Used alongside GatheringSystem for mining activities

---

## 🎨 UI Components

UI is organized into view components and reusable widgets.

### UI Architecture

**Principles:**
1. **Separation of Concerns:** UI reads from state, doesn't modify it
2. **Event-Driven:** User actions trigger GameEngine methods
3. **Reactive Updates:** UI updates when state changes
4. **Component Reusability:** Shared widgets (cards, modals, bars)

### View Components

#### 1. SkillsUI
**File:** `src/ui/skillsUI.js`

**Purpose:** Display all skills with gathering nodes.

**Features:**
- Skill cards for each skill (13 total)
- Click skill card to open node selection modal
- Shows skill level, XP, and progress
- Node panel slides in from right (deprecated - now uses modal)

#### 2. EquipmentUI
**File:** `src/ui/equipmentUI.js`

**Purpose:** Equipment management view.

**Features:**
- 3x3 equipment grid
- Consumable slots (ammo, food, potion)
- Technology slots (tech1-4)
- Player stats display
- Click slot to open equip modal

**Rendering:**
- Uses `equipmentComponent.js` for slot rendering
- Parses instance IDs to display correct item data
- Shows quantity for consumables

#### 3. CombatUI (Rev1 - Complete Overhaul 2025-11-29)
**Files:** `src/ui/combat/` directory (6 files)

**Purpose:** Complete combat UI system with 3-tab interface.

**Architecture:**
```
CombatUI (Main Coordinator)
├── EnemySelectionPanel (Enemies Tab)
├── CombatContainer (Combat Tab)
├── LoadoutContainer (Loadout Tab)
├── EnemyModal (Enemy Details)
└── CombatAnimations (Visual Effects)
```

**Features:**

**1. Enemies Tab (`enemySelectionPanel.js` - 178 lines)**
- Grid display of available enemies
- Difficulty indicators (Weak/Moderate/Strong/Elite)
- Enemy stats preview (HP, damage, armor type)
- Click to open Enemy Modal

**2. Combat Tab (`combatContainer.js` - 358 lines)**
- Real-time HP bars (player and enemy)
- Attack timer/cooldown visualization
- Combat log with damage numbers
- Loot drops display
- Flee button
- Auto-switches to this tab when combat starts

**3. Loadout Tab (`loadoutContainer.js` - 417 lines)**
- **Equipment Grid:** 7 core slots (weapon, head, body, legs, hands, feet, offhand)
- **Consumables:** 3 slots (ammo, food, potion) with quantity display
- **Technology:** 4 slots (tech1-4) with intellect gating (0/3/6/9 INT required)
- **Combat Stats Panel:**
  - Offense: Damage range, accuracy, crit rating
  - Defense: Armor rating, evasion, damage reduction
  - Weight: Current/limit with overweight penalties
- **Type Breakdown Visualization:**
  - Damage types: pierce/explosive/cryo/shock/incendiary
  - Armor types: insulated/plated/airborne/droid/biological
  - Visual progress bars showing distribution

**4. Enemy Modal (`enemyModal.js` - 425 lines)**
- Comprehensive enemy stats
- Type effectiveness calculations
  - Player damage type vs enemy armor
  - Enemy damage type vs player armor
  - Visual indicators (super effective/not very effective)
- Loot table preview
- Start Combat button
- Escape key to close

**5. Combat Animations (`combatAnimations.js` - 215 lines)**
- Damage number fly-ins
- Critical hit effects
- Miss indicators
- Heal animations
- Loot drop notifications

**EventBus Integration:**
All combat events trigger UI updates:
- `combat-started` → Switch to Combat tab
- `combat-ended` → Victory/defeat modal
- `player-damaged` → Damage animation on player
- `enemy-damaged` → Damage animation on enemy
- `player-healed` → Heal animation (auto-eat)
- `attack-missed` → Miss indicator
- `loot-dropped` → Loot notification

**Styling:**
- `styles/combat-ui.css` (1,100+ lines)
- Comprehensive theming for all combat components
- Responsive grid layouts
- Animated HP bars and progress indicators
- Modal overlay system (scoped to `#combat-modal-container`)

**Usage Pattern:**
```javascript
// Initialize (called in globalHandlers.js)
CombatUI.init();

// Render (called from uiCore.js)
CombatUI.render();

// Update (called each tick during combat)
CombatUI.updateCombat();

// Start combat (from enemy modal)
CombatUI.startCombat(enemyId);

// Flee combat
CombatUI.flee();
```

**Tab Switching:**
```javascript
CombatUI.switchTab('enemies');  // Enemy selection
CombatUI.switchTab('combat');   // Active combat (disabled when not in combat)
CombatUI.switchTab('loadout');  // Equipment and stats
```

#### 4. CraftingUI
**File:** `src/ui/craftingUI.js`

**Purpose:** Recipe browsing and crafting.

**Features:**
- Station selection
- Recipe list (filtered by station + skill)
- Material requirements
- Craft button
- Active crafts progress bars
- Auto-repeat toggle

#### 5. NavigationUI
**File:** `src/ui/navigationUI.js`

**Purpose:** Region exploration and travel.

**Features:**
- Current region display
- Discovery progress bar
- Endurance meter
- Start/stop navigation button
- Adjacent region travel buttons
- Region details modal

#### 6. OverviewUI
**File:** `src/ui/overviewUI.js`

**Purpose:** Dashboard/home screen.

**Features:**
- Character summary (level, XP, stats)
- Currency display
- Active activity status
- Quick navigation to other views
- Recent achievements/notifications

#### 7. MissionsUI
**File:** `src/ui/missionsUI.js`

**Purpose:** Mission tracking and management.

**Features:**
- Available missions list
- Active missions with objective progress
- Completed missions log
- Mission details modal
- Accept/abandon buttons

#### 8. EngineeringUI
**File:** `src/ui/engineeringUI.js`

**Purpose:** Workshop management.

**Features:**
- Workshop tier display per skill
- Upgrade buttons (token cost)
- Specialization path selection
- Reverse engineering interface
- Active bonuses display

#### 9. PerkGridUI
**File:** `src/ui/perkGridUI.js`

**Purpose:** Medal placement grid.

**Features:**
- 13x13 interactive grid
- Medal inventory
- Drag-and-drop placement
- Power calculation display
- Unlock cell button
- Save/load configurations

### Reusable Components

#### SkillCard
**File:** `src/ui/components/SkillCard.js`

**Purpose:** Individual skill display card.

**Usage:**
```javascript
const card = SkillCard.create(skillData, GameEngine.state);
container.appendChild(card);
```

**Displays:**
- Skill icon and name
- Level and XP progress bar
- Click handler to open nodes

#### PersistentActionBar
**File:** `src/ui/components/PersistentActionBar.js`

**Purpose:** Sticky action bar showing current activity.

**Features:**
- Shows active gathering/combat/crafting
- Progress bar
- Cancel button
- Loot notifications

#### NodePanel
**File:** `src/ui/components/NodePanel.js`

**Purpose:** Node selection sidebar (deprecated - replaced by modal).

**Displays:**
- Nodes filtered by skill
- Node requirements (level, tool)
- Start harvest button

#### ItemCard
**File:** `src/ui/itemCard.js`

**Purpose:** Item display in bank/inventory.

**Usage:**
```javascript
const card = ItemCard.create(itemData, quantity);
grid.appendChild(card);
```

**Features:**
- Click to open item modal
- Right-click for context menu
- Shows quantity, rarity, tier
- Instance ID handling

#### ItemModal
**File:** `src/ui/itemModal.js`

**Purpose:** Detailed item view with actions.

**Features:**
- Item stats and description
- Equip/unequip button
- Use/consume button
- Drop/delete button
- Crafting recipes that use item
- Source information (where to find)

**Actions:**
- Equip: Move to equipment slot
- Unequip: Return to bank
- Consume: Use consumable (food, potion)
- Drop: Delete from inventory

#### Modal System
**File:** `src/ui/modal.js`

**Purpose:** Reusable modal dialogs.

**Functions:**
```javascript
Modal.show(title, content, buttons)   // Show custom modal
Modal.alert(message)                  // Alert dialog
Modal.confirm(message, callback)      // Confirm dialog
Modal.hide()                          // Close modal
```

### UI Update Pattern

**Manual Update:**
```javascript
// UI component
const SkillsUI = {
    update() {
        // Read from GameEngine.state
        const skills = GameEngine.state.skills;

        // Render UI
        this.renderSkills(skills);
    }
};

// Called from globalHandlers or system after state change
SkillsUI.update();
```

**Auto-Update (via EventBus):**
```javascript
// Subscribe to events
EventBus.on('skillLevelUp', () => {
    SkillsUI.update();
});

// Emit events from systems
GameEngine.addSkillXP = function(skill, xp) {
    // ... update state ...

    if (leveledUp) {
        EventBus.emit('skillLevelUp', { skill, newLevel });
    }
};
```

---

## 📄 HTML Structure

**File:** `index.html`

### Page Layout

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap">

    <!-- Stylesheets (load order matters) -->
    <link rel="stylesheet" href="styles/variables.css">
    <link rel="stylesheet" href="styles/global.css">
    <link rel="stylesheet" href="styles/components.css">
    <link rel="stylesheet" href="styles/background.css">
    <link rel="stylesheet" href="styles/header.css">
    <link rel="stylesheet" href="styles/layout.css">
    <link rel="stylesheet" href="styles/game-ui.css">
    <link rel="stylesheet" href="styles/modals.css">
    <link rel="stylesheet" href="styles/developer.css">
</head>
<body>
    <!-- Dynamic Background -->
    <div id="backgroundContainer" class="background-container">
        <div id="backgroundLayer"></div>
        <div id="gradientLayer"></div>
        <div id="particleLayer"></div>
        <div class="dark-overlay"></div>
    </div>

    <!-- Header (currencies, XP, activity status) -->
    <div class="header">
        <!-- Left: Title -->
        <div class="header-title">⚔️ IDLE RPG</div>

        <!-- Center: Character level, XP bar, activity -->
        <div class="header-center">
            <div class="header-level">
                <span id="charLevel">1</span> LVL
            </div>
            <div class="header-xp">
                <div class="xp-bar">
                    <div class="xp-fill" id="charExpBar"></div>
                </div>
                <span id="charExpText">0 / 1K XP</span>
            </div>
            <div class="header-activity">
                <span id="currentRegionText">Plains</span>
                <span id="activityText">Idle</span>
            </div>
            <div class="activity-bar">
                <div class="activity-fill" id="activityBar"></div>
            </div>
            <span id="activityProgress">--</span>
        </div>

        <!-- Right: Currencies & buttons -->
        <div class="header-right">
            <div class="currencies">
                <div class="curr">💰 <span id="goldAmount">0</span></div>
                <div class="curr">🏅 <span id="medalsAmount">0</span></div>
                <div class="curr">📚 <span id="tomesAmount">0</span></div>
                <div class="curr">💎 <span id="gemsAmount">0</span></div>
            </div>
            <button data-action="save-game">💾</button>
            <button data-action="reset-game">🔄</button>
            <button data-action="toggle-dev-modal">⚙️ Dev</button>
        </div>
    </div>

    <!-- Vertical Sidebar Navigation -->
    <nav class="sidebar-nav">
        <!-- Primary nav buttons -->
        <button class="sidebar-item active" data-action="switch-view" data-view="overview">
            📊 OVERVIEW
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="skills">
            ⭐ SKILLS
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="bank">
            🎒 ITEMS
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="equipment">
            🛡️ LOADOUT
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="navigation">
            🧭 EXPLORE
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="combat">
            ⚔️ COMBAT
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="missions">
            📋 MISSIONS
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="engineering">
            🔧 TECH
        </button>
        <button class="sidebar-item" data-action="switch-view" data-view="perks">
            🌟 PERKS
        </button>

        <!-- Bottom buttons -->
        <div class="sidebar-bottom">
            <button class="sidebar-item" data-action="switch-view" data-view="settings">
                ⚙️ SETTINGS
            </button>
        </div>
    </nav>

    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Each view is a div with class="view" -->
        <!-- Only one view has class="active" at a time -->

        <div id="view-overview" class="view active">
            <div id="overviewView"><!-- Rendered by overviewUI.js --></div>
        </div>

        <div id="view-skills" class="view">
            <div class="skilling-container">
                <div id="persistentActionBar"><!-- Persistent action display --></div>
                <div id="skillsGrid"><!-- Skill cards --></div>
                <div id="nodePanel"><!-- Node selection (deprecated) --></div>
            </div>
        </div>

        <div id="view-bank" class="view">
            <h2>🏦 Bank / Inventory</h2>
            <div id="bankStats"><!-- Bank capacity --></div>
            <div id="bankTabs"><!-- Tab buttons --></div>
            <div id="bankGrid"><!-- Item cards --></div>
        </div>

        <div id="view-equipment" class="view">
            <h2>⚔️ Equipment</h2>
            <div id="equipmentGrid"><!-- Equipment slots --></div>
            <div id="playerStats"><!-- Combat stats --></div>
        </div>

        <div id="view-navigation" class="view">
            <h2>🧭 Navigation</h2>
            <div id="navigationDisplay"><!-- Navigation UI --></div>
        </div>

        <div id="view-combat" class="view">
            <h2>⚔️ Combat</h2>
            <div id="combatArea"><!-- Combat UI --></div>
        </div>

        <div id="view-crafting" class="view">
            <h2>🔨 Crafting</h2>
            <div id="activeCraftsDisplay"><!-- Active crafts --></div>
            <div id="craftingDisplay"><!-- Recipes --></div>
        </div>

        <div id="view-engineering" class="view">
            <div id="engineeringView"><!-- Engineering UI --></div>
        </div>

        <div id="view-missions" class="view">
            <div id="missionsView"><!-- Missions UI --></div>
        </div>

        <div id="view-perks" class="view">
            <div id="perkGridView"><!-- Perk grid --></div>
        </div>

        <!-- ... more views ... -->
    </div>

    <!-- Modals (overlays) -->
    <div id="equipModal" class="modal"><!-- Equipment selection --></div>
    <div id="itemModalOverlay" class="item-modal-overlay">
        <div id="itemModal" class="item-modal"><!-- Item details --></div>
    </div>
    <div id="weaponBuildModal" class="modal"><!-- Weapon customization --></div>
    <div id="regionModal" class="modal"><!-- Region details --></div>
    <div id="devModal" class="modal"><!-- Developer tools --></div>
    <div id="contextMenu" class="context-menu"><!-- Right-click menu --></div>

    <!-- Scripts (load order is CRITICAL) -->
    <!-- See next section for full loading order -->

    <!-- Developer Statistics Panel (fixed overlay) -->
    <div id="devStatsPanel"></div>
</body>
</html>
```

### View Switching

**Pattern:**
```javascript
// globalHandlers.js
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });

    // Show target view
    const targetView = document.getElementById(`view-${viewName}`);
    targetView.classList.add('active');

    // Update UI for that view
    if (viewName === 'skills') SkillsUI.update();
    if (viewName === 'equipment') EquipmentUI.update();
    // etc.
}
```

**Data Attributes:**
- `data-action="switch-view"` - Trigger view switch
- `data-view="skills"` - Target view name
- `data-action="save-game"` - Trigger save
- `data-action="debug-add-gold"` - Dev tool action
- etc.

All `data-action` attributes are handled by `globalHandlers.js`.

---

## 📦 Script Loading Order

**CRITICAL:** Scripts must load in strict dependency order.

**File:** `index.html` (lines 644-876)

### Loading Sequence

```html
<!-- 0. CORE INFRASTRUCTURE (no dependencies) -->
<script src="src/core/EventBus.js"></script>
<script src="src/ui/core/UIComponent.js"></script>

<!-- 1. UTILITIES (no dependencies) -->
<script src="src/utils/formatting.js"></script>
<script src="src/utils/progressBar.js"></script>
<script src="src/utils/uiComponents.js"></script>
<script src="src/utils/assetManager.js"></script>
<script src="src/utils/simplexNoise.js"></script>
<script src="src/utils/iconHelper.js"></script>
<script src="src/ui/utilities/itemAccessHelper.js"></script>
<script src="src/ui/overviewUI.js"></script>
<script src="src/ui/statDisplayUI.js"></script>

<!-- 2. DEFINITIONS (no dependencies) -->
<script src="src/core/definitions.js"></script>
<script src="src/data/worldTilemap.js"></script>

<!-- 2.5. STAT CALCULATOR (depends on definitions) -->
<script src="src/core/statCalculator.js"></script>

<!-- 3. GAME SYSTEMS (load in dependency order) -->
<script src="src/systems/backgroundSystem.js"></script>
<script src="src/systems/migrationSystem.js"></script>
<script src="src/systems/dualBankSystem.js"></script>
<script src="src/systems/inventorySystem.js"></script>
<script src="src/systems/skillSystem.js"></script>
<script src="src/systems/equipmentSystem.js"></script>
<script src="src/systems/equipmentPresetSystem.js"></script>
<script src="src/systems/attachmentSystem.js"></script>
<script src="src/systems/typeEffectivenessSystem.js"></script>
<script src="src/systems/resourceSystem.js"></script>
<script src="src/systems/worldMapSystem.js"></script>
<script src="src/systems/hexGridSystem.js"></script>
<!-- mapRenderer.js DISABLED -->
<script src="src/systems/navigationSystem.js"></script>
<script src="src/systems/globalDiscoverySystem.js"></script>
<!-- restRecoverySystem.js DEPRECATED -->
<script src="src/systems/nodeCollectionSystem.js"></script>
<script src="src/systems/gatheringSystem.js"></script>
<script src="src/systems/miningSystem.js"></script>
<!-- harvestSystem.js DEPRECATED -->
<script src="src/systems/combatSystem.js"></script>
<script src="src/systems/offlineCombatSystem.js"></script>
<script src="src/systems/craftingSystem.js"></script>
<script src="src/systems/missionSystem.js"></script>
<script src="src/systems/engineeringSystem.js"></script>
<script src="src/systems/perkGridSystem.js"></script>
<script src="src/systems/perkGridSimulator.js"></script>
<script src="src/systems/medalCraftingSystem.js"></script>

<!-- 3.5 UNIFIED ITEM DATABASE (before game engine) -->
<!-- Core Registry Infrastructure (MUST LOAD FIRST) -->
<script src="src/core/BaseRegistry.js"></script>

<!-- Schema and Validation -->
<script src="src/data/items/itemSchema.js"></script>
<script src="src/data/items/itemValidator.js"></script>

<!-- Item Registry (must load first) -->
<script src="src/data/items/itemRegistry_NEW.js"></script>

<!-- Production Items (organized by category) -->
<script src="src/data/items/production/equipment/equipment.js"></script>
<script src="src/data/items/production/consumables/consumables.js"></script>
<script src="src/data/items/production/materials/materials.js"></script>
<script src="src/data/items/production/currencies/currencies.js"></script>

<!-- Dev/Test/Legacy/Planned Items -->
<script src="src/data/items/dev/devItems.js"></script>
<script src="src/data/items/test/testItems.js"></script>
<script src="src/data/items/test/testWeapons.js"></script>
<script src="src/data/items/legacy/legacyItems.js"></script>
<script src="src/data/items/planned/plannedItems.js"></script>

<!-- Main Database Index (registers items and provides utilities) -->
<script src="src/data/items/index.js"></script>

<!-- Item Integration Layer -->
<script src="src/systems/itemIntegration.js"></script>

<!-- Migration Utility -->
<script src="src/data/items/migrationUtility.js"></script>

<!-- 3.6 RESOURCE NODE SYSTEM (before game engine) -->
<!-- Schema and Registry -->
<script src="src/data/nodes/nodeSchema.js"></script>
<script src="src/data/nodes/nodeRegistry_NEW.js"></script>
<script src="src/data/nodes/nodeUtils.js"></script>
<script src="src/data/nodes/nodeValidator.js"></script>
<script src="src/data/nodes/rareTables.js"></script>
<script src="src/data/nodes/nodeScaling.js"></script>
<script src="src/data/nodes/nodeItemIntegration.js"></script>
<script src="src/data/nodes/nodeDevTools.js"></script>

<!-- Developer Tools Modal -->
<script src="src/ui/devModal.js"></script>

<!-- Production Nodes (organized by skill type) -->
<script src="src/data/nodes/production/mining.js"></script>
<script src="src/data/nodes/production/logging.js"></script>
<script src="src/data/nodes/production/fishing.js"></script>
<script src="src/data/nodes/production/hunting.js"></script>
<script src="src/data/nodes/production/foraging.js"></script>
<script src="src/data/nodes/production/thieving.js"></script>

<!-- Node System Initialization -->
<script src="src/data/nodes/nodeInit.js"></script>

<!-- Item Registry Initialization -->
<script src="src/data/items/itemRegistryInit.js"></script>

<!-- Enemy Registry System -->
<script src="src/data/enemies/enemySchema.js"></script>
<script src="src/data/enemies/enemyRegistry_NEW.js"></script>
<script src="src/data/enemies/production/basicEnemies.js"></script>
<script src="src/data/enemies/enemyInit.js"></script>

<!-- Mission Registry System -->
<script src="src/data/missions/missionRegistry_NEW.js"></script>
<script src="src/data/missions/missionInit.js"></script>

<!-- Recipe Registry System -->
<script src="src/data/recipes/recipeRegistry_NEW.js"></script>
<script src="src/data/recipes/recipeInit.js"></script>

<!-- Skill Registry System -->
<script src="src/data/skills/skillRegistry_NEW.js"></script>

<!-- Production Skills -->
<script src="src/data/skills/production/skills_production.js"></script>

<!-- Main Database Index (registers skills) -->
<script src="src/data/skills/index.js"></script>

<!-- Region Registry System -->
<script src="src/data/regions/worldRegions.js"></script>
<script src="src/data/regions/regionRegistry_NEW.js"></script>
<script src="src/data/regions/regionInit.js"></script>

<!-- NEW ENTITY REGISTRIES (Phase 1) -->
<script src="src/data/perks/perkRegistry.js"></script>
<script src="src/data/npcs/npcRegistry.js"></script>
<script src="src/data/biomes/biomeRegistry.js"></script>
<script src="src/data/lootTables/lootTableRegistry.js"></script>
<script src="src/data/craftingStations/craftingStationRegistry.js"></script>
<script src="src/data/technologies/technologyRegistry.js"></script>
<script src="src/data/incursions/incursionRegistry.js"></script>
<script src="src/data/attributes/attributeRegistry.js"></script>
<script src="src/data/currencies/currencyRegistry.js"></script>
<script src="src/data/stances/stanceRegistry.js"></script>

<!-- Registry Manager -->
<script src="src/core/RegistryManager.js"></script>

<!-- NEW ENTITY DATA (Phase 1) -->
<script src="src/data/attributes/attributes_production.js"></script>
<script src="src/data/currencies/currencies_production.js"></script>
<script src="src/data/stances/stances_production.js"></script>
<script src="src/data/biomes/biomes_production.js"></script>
<script src="src/data/perks/perks_production.js"></script>
<script src="src/data/npcs/npcs_production.js"></script>
<script src="src/data/lootTables/lootTables_production.js"></script>
<script src="src/data/craftingStations/craftingStations_production.js"></script>
<script src="src/data/technologies/technologies_production.js"></script>
<script src="src/data/incursions/incursions_production.js"></script>

<!-- Initialize RegistryManager -->
<script src="src/core/registryInit.js"></script>

<!-- 4. CORE GAME ENGINE (coordinates all systems) -->
<script src="src/core/gameEngine.js"></script>

<!-- 5. UI MODULES -->
<script src="src/ui/modal.js"></script>
<script src="src/ui/devTools.js"></script>
<script src="src/ui/animations.js"></script>
<script src="src/ui/itemConsumptionAnimation.js"></script>
<script src="src/ui/uiCore.js"></script>

<!-- Dopamine-Optimized Skilling Components -->
<script src="src/ui/components/PersistentActionBar.js"></script>
<script src="src/ui/components/SkillCard.js"></script>
<script src="src/ui/components/NodePanel.js"></script>

<!-- UI Components -->
<script src="src/ui/resourcesUI.js"></script>
<script src="src/ui/nodeCollectionUI.js"></script>
<script src="src/ui/harvestStatsPanel.js"></script>
<script src="src/ui/itemCard.js"></script>
<script src="src/ui/equipmentComponent.js"></script>
<script src="src/ui/equipmentPresetsUI.js"></script>
<script src="src/ui/weaponBuildModal.js"></script>
<script src="src/ui/skillsUI.js"></script>
<script src="src/ui/skillNodeModal.js"></script>
<script src="src/ui/equipmentUI.js"></script>
<script src="src/ui/itemModal.js"></script>
<script src="src/ui/attachmentModal.js"></script>
<script src="src/ui/combatUI.js"></script>
<script src="src/ui/offlineCombatUI.js"></script>
<script src="src/ui/craftingUI.js"></script>
<script src="src/ui/miningUI.js"></script>
<script src="src/ui/navigationUI.js"></script>
<script src="src/ui/regionModal.js"></script>
<script src="src/ui/missionsUI.js"></script>
<script src="src/ui/engineeringUI.js"></script>
<script src="src/ui/devItemTools.js"></script>
<script src="src/ui/developerUI.js"></script>
<script src="src/ui/perkGridUI.js"></script>
<script src="src/ui/medalCraftingUI.js"></script>
<script src="src/ui/medalCraftingModal.js"></script>
<script src="src/ui/medalSelectionModal.js"></script>
<script src="src/ui/bankDevTools.js"></script>
<script src="src/ui/devStatsPanel.js"></script>

<!-- Enhancement System & Tooltips -->
<script src="src/systems/enhancementSystem.js"></script>
<script src="src/ui/tooltipUI.js"></script>

<!-- 6. GLOBAL ONCLICK HANDLERS -->
<script src="src/ui/globalHandlers.js"></script>

<!-- 7. SAVE SYSTEM -->
<script src="saveSystem.js"></script>

<!-- 7.5 CLEANUP LEGACY ITEMS -->
<script src="clean-legacy-items.js"></script>

<!-- 8. INITIALIZE DOPAMINE UI COMPONENTS -->
<script src="src/ui/init.js"></script>
```

### Why Load Order Matters

1. **Dependencies:** Systems depend on earlier systems
   - Example: `equipmentSystem.js` needs `inventorySystem.js`

2. **Registries before Data:** Registry classes must exist before data files
   - Example: `ItemRegistry` class before `equipment.js`

3. **Data before Engine:** All game data loaded before engine initializes
   - Example: All items/nodes loaded before `gameEngine.js`

4. **Engine before UI:** Game logic before UI components
   - Example: `gameEngine.js` before `skillsUI.js`

5. **UI before Handlers:** UI components before event handlers
   - Example: All UI files before `globalHandlers.js`

6. **Handlers before Init:** Event handlers before initialization
   - Example: `globalHandlers.js` before `init.js`

**Breaking load order = runtime errors!**

---

## 💾 State Management

### GameEngine.state

**Single source of truth** for all game data.

### State Structure Overview

```javascript
GameEngine.state = {
    // === PLAYER DATA ===
    characterLevel: { level, exp, unassignedAttributePoints },
    combatAttributes: { health, defense, strength, ... },
    skills: { mining: {level, exp}, logging: {level, exp}, ... },

    // === INVENTORY ===
    bank: {
        items: { itemId: {quantity, tab} },        // Stackable
        equipmentInstances: { instanceId: {...} }  // Instanced
    },
    equipment: { weapon, helmet, chest, ... },

    // === EXPLORATION ===
    currentRegion: "region_-3_-4",
    regions: { regionId: {discovered, discoveryProgress, availableNodes} },
    globalNodes: { nodeId: {discovered, totalHealthBonus} },
    globalEnemies: { enemyId: {discovered, totalHealthBonus} },

    // === ACTIVITY ===
    currentActivity: null,  // 'navigation' | 'combat' | 'nodeCollection' | 'crafting'
    activeNavigation: { isNavigating, endurance, maxEndurance },
    combat: { player, currentEnemy, inCombat },
    nodeCollection: { activeNode },
    crafting: { activeCrafts },

    // === PROGRESSION ===
    missions: { available, active, completed, activeProgress },
    engineering: { tokens, workshops, paths },
    perkGrid: { medals, unlockedCells },

    // === CURRENCIES ===
    currencies: { gold, medals, tomes, gems },
    resources: { ore, wood, health, maxHealth }
}
```

### State Modification Rules

**1. Only Systems Modify State**
```javascript
// ✅ CORRECT - System method modifies state
GameEngine.addItemToBank = function(itemId, quantity) {
    this.state.bank.items[itemId] = (this.state.bank.items[itemId] || 0) + quantity;
};

// ❌ WRONG - UI modifies state directly
SkillsUI.update = function() {
    GameEngine.state.skills.mining.exp += 100;  // NO!
};
```

**2. UI Reads State, Doesn't Write**
```javascript
// ✅ CORRECT - UI reads state
SkillsUI.update = function() {
    const miningLevel = GameEngine.state.skills.mining.level;
    this.renderSkillCard('mining', miningLevel);
};

// ✅ CORRECT - UI triggers system method
function onHarvestButtonClick(nodeId) {
    GameEngine.startGathering(nodeId);  // System handles state change
}
```

**3. State Changes Trigger UI Updates**
```javascript
// Pattern 1: Manual update
GameEngine.addSkillXP = function(skill, xp) {
    // ... modify state ...

    // Update UI
    SkillsUI.update();
};

// Pattern 2: Event-driven
GameEngine.addSkillXP = function(skill, xp) {
    // ... modify state ...

    // Emit event
    EventBus.emit('skillXPGained', { skill, xp });
};

// UI subscribes
EventBus.on('skillXPGained', () => {
    SkillsUI.update();
});
```

### Save/Load Flow

**Save:**
```javascript
function saveGame() {
    const saveData = {
        version: 2.1,
        timestamp: Date.now(),
        state: GameEngine.state  // Entire state object
    };

    localStorage.setItem('idleRPGSave', JSON.stringify(saveData));
    console.log('✅ Game saved');
}
```

**Load:**
```javascript
function loadGame() {
    const saveData = JSON.parse(localStorage.getItem('idleRPGSave'));

    if (saveData) {
        // Migration (if version changed)
        MigrationSystem.migrate(saveData);

        // Restore state
        GameEngine.state = saveData.state;

        // Update system references (CRITICAL!)
        GatheringSystem.state = GameEngine.state;
        CombatSystem.state = GameEngine.state;
        // etc.

        // Update UI
        UICore.update();

        console.log('✅ Game loaded');
    }
}
```

**Auto-Save:**
```javascript
// In game loop
if (now - lastAutoSave > 30000) {  // Every 30 seconds
    saveGame();
    lastAutoSave = now;
}
```

---

## 🛠️ Development Patterns

### Common Patterns Used in Codebase

#### 1. System Injection Pattern

**Used by:** All game systems

**Pattern:**
```javascript
const ExampleSystem = {
    init(engine) {
        // Bind methods to engine
        engine.methodName = this.methodName.bind(engine);

        console.log('✅ ExampleSystem initialized');
    },

    methodName() {
        // 'this' = GameEngine
        this.state.someProperty = value;
    }
};

// Initialize
ExampleSystem.init(GameEngine);
```

**Why:** Allows systems to access `GameEngine.state` via `this.state`.

#### 2. Registry Pattern

**Used by:** All game data (items, nodes, enemies, etc.)

**Pattern:**
```javascript
class EntityRegistry extends BaseRegistry {
    constructor() {
        super('entityType');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name'],
            optional: ['description', 'tier']
        };
    }

    // Custom query methods
    getByCustomCriteria(criteria) {
        return this.filter(entity => entity.customProp === criteria);
    }
}

const Registry = new EntityRegistry();

// Registration
Registry.register('itemId', itemDefinition, 'production');

// Access
const item = Registry.getById('itemId');
const allItems = Registry.getAllActive();
```

**Why:** Unified interface, validation, multi-environment support.

#### 3. Instance ID Parsing

**Used by:** All systems that handle equipment

**Pattern:**
```javascript
function parseInstanceId(fullId) {
    let lookupId = fullId;

    // Format 1: baseId_instance_timestamp_random
    if (fullId.includes('_instance_')) {
        lookupId = fullId.split('_instance_')[0];
    }
    // Format 2: baseId_timestamp_random
    else if (fullId.includes('_')) {
        const parts = fullId.split('_');
        // Check if last two parts are timestamp + random
        if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
            lookupId = parts.slice(0, -2).join('_');
        }
    }

    return lookupId;
}
```

**Why:** Two instance ID formats exist in codebase, must handle both.

#### 4. Item Access Pattern

**Used by:** All systems that need item data

**Pattern:**
```javascript
// STANDARDIZED - Primary method
const itemDef = ItemRegistry.getItem(itemId);

// FALLBACK - Only if ItemRegistry unavailable
const itemDef = GameEngine.definitions.items[itemId];

// HELPER - For UI components
const itemDef = ItemAccessHelper.getItem(itemId);
```

**Why:** Centralized item lookup, handles aliasing and fallbacks.

#### 5. Slot vs EquipSlot Pattern

**Used by:** Item system, equipment system

**Pattern:**
```javascript
// Item definition
{
    id: "lightPickaxe",
    slot: "tool",           // Bank tab (where it appears in inventory)
    equipSlot: "weapon"     // Equipment slot (where it goes when equipped)
}

// Equipping
const targetSlot = itemDef.equipSlot || itemDef.slot;
GameEngine.state.equipment[targetSlot] = itemId;
```

**Why:** Allows items to appear in one bank tab but equip to a different slot.

#### 6. Tool Detection Pattern

**Used by:** Gathering system, node validation

**Pattern:**
```javascript
function getEquippedToolForSkill(skill) {
    const weaponId = this.state.equipment.weapon;

    if (weaponId) {
        const baseId = parseInstanceId(weaponId);
        const weapon = ItemRegistry.getItem(baseId);

        // Check if tool matches skill
        if (weapon && weapon.skill === skill) {
            return weapon;
        }
    }

    return null;
}
```

**Why:** Tools use `skill` property to match with gathering skills.

#### 7. Event-Driven UI Updates

**Used by:** UI components, animations

**Pattern:**
```javascript
// System emits event
GameEngine.addItemToBank = function(itemId, quantity) {
    // ... modify state ...

    EventBus.emit('itemAdded', { itemId, quantity });
};

// UI subscribes
EventBus.on('itemAdded', (data) => {
    Animations.showNotification(`+${data.quantity} ${data.itemId}`, 'success');
});
```

**Why:** Decouples systems from UI, allows multiple listeners.

#### 8. Data-Action Pattern

**Used by:** Global handlers, UI interactions

**Pattern:**
```html
<button data-action="save-game">Save</button>
<button data-action="switch-view" data-view="skills">Skills</button>
<button data-action="debug-add-gold">+1000 Gold</button>
```

```javascript
// globalHandlers.js
document.addEventListener('click', (e) => {
    const action = e.target.getAttribute('data-action');

    if (action === 'save-game') saveGame();
    if (action === 'switch-view') {
        const view = e.target.getAttribute('data-view');
        switchView(view);
    }
    if (action === 'debug-add-gold') {
        GameEngine.addCurrency('gold', 1000);
    }
});
```

**Why:** Declarative UI, centralized event handling, easy to extend.

### File Naming Conventions

- **Registry files:** `entityRegistry_NEW.js` (post-migration)
- **System files:** `systemNameSystem.js` (camelCase + System suffix)
- **UI files:** `viewNameUI.js` (camelCase + UI suffix)
- **Component files:** `ComponentName.js` (PascalCase for classes)
- **Data files:** `entityType.js` (camelCase, describes content)
- **Schema files:** `entitySchema.js`
- **Init files:** `entityInit.js`

### Code Organization

**Systems:**
- One system per file
- System object contains all related methods
- Use `init(engine)` to inject into GameEngine

**Registries:**
- Extend BaseRegistry
- One registry per entity type
- Data files populate registries via `register()`

**UI:**
- One UI component per file
- Components export object with `update()` method
- Read from GameEngine.state, don't modify

**Utilities:**
- Pure functions (no side effects)
- Grouped by purpose (formatting, validation, etc.)
- No dependencies on GameEngine

---

## 🚀 Future Systems Planning

### Systems Ready for Expansion

#### 1. Biome System
**Status:** Registry exists, data placeholder

**Planned Features:**
- Biome-specific resources
- Weather effects
- Seasonal changes
- Biome bonuses/penalties

**Files:**
- `src/data/biomes/biomeRegistry.js` ✅
- `src/data/biomes/biomes_production.js` ✅ (placeholder)

#### 2. NPC System
**Status:** Registry exists, data placeholder

**Planned Features:**
- NPC shops
- Dialogue system
- Reputation/faction
- Trading

**Files:**
- `src/data/npcs/npcRegistry.js` ✅
- `src/data/npcs/npcs_production.js` ✅ (placeholder)

#### 3. Technology System
**Status:** Registry exists, data placeholder

**Planned Features:**
- Tech tree progression
- Research mechanics
- Unlockable tech slots (intellect-gated)
- Passive bonuses

**Files:**
- `src/data/technologies/technologyRegistry.js` ✅
- `src/data/technologies/technologies_production.js` ✅ (placeholder)

#### 4. Incursion System
**Status:** Registry exists, data placeholder

**Planned Features:**
- Timed events
- Special challenges
- Unique rewards
- Leaderboards

**Files:**
- `src/data/incursions/incursionRegistry.js` ✅
- `src/data/incursions/incursions_production.js` ✅ (placeholder)

#### 5. Loot Table System
**Status:** Registry exists, data placeholder

**Planned Features:**
- Weighted random drops
- Conditional loot
- Rare drop tracking
- Loot history

**Files:**
- `src/data/lootTables/lootTableRegistry.js` ✅
- `src/data/lootTables/lootTables_production.js` ✅ (placeholder)

### Systems Needing Development

#### 1. Quest/Dialogue System
**Current:** Basic mission system exists

**Expansion Needed:**
- Branching dialogue trees
- Choices with consequences
- Quest chains
- Story progression

#### 2. Multiplayer/Social
**Current:** Single-player only

**Future:**
- Trading between players
- Guild/clan system
- Leaderboards
- Co-op activities

#### 3. Prestige System
**Current:** Endless progression

**Future:**
- Ascension/rebirth mechanics
- Permanent bonuses
- Prestige currency
- Meta-progression

#### 4. Pet/Companion System
**Current:** Not implemented

**Future:**
- Collectible pets
- Pet abilities
- Pet leveling
- Pet equipment

#### 5. Achievements/Collections
**Current:** Not implemented

**Future:**
- Achievement tracking
- Collection log (items, enemies, nodes)
- Completion rewards
- Showcase system

### Infrastructure Improvements

#### 1. Performance Optimization
- **Object pooling** for frequently created/destroyed objects
- **Lazy loading** for UI components
- **Worker threads** for heavy calculations
- **IndexedDB** for save data (replace localStorage)

#### 2. Testing Framework
- **Unit tests** for core systems
- **Integration tests** for system interactions
- **UI tests** for component rendering
- **Regression tests** for bug prevention

#### 3. Build System
- **Module bundling** (webpack/rollup)
- **Code minification**
- **Asset optimization**
- **Version management**

#### 4. Data Management
- **CSV/JSON import** for game data
- **Visual editors** for items/nodes/enemies
- **Data validation** pipeline
- **Hot reloading** for dev

### Content Expansion Priorities

**High Priority:**
1. More nodes per skill (currently only 1-2 per skill)
2. Enemy variety (currently only basic enemies)
3. Crafting recipes (expand all 7 crafting skills)
4. Missions (story progression)
5. Regions (expand world map)

**Medium Priority:**
1. Technology items
2. Biome-specific content
3. NPCs and shops
4. Perk variety
5. Attachment variety

**Low Priority:**
1. Incursions
2. Seasonal events
3. Cosmetics
4. Achievements
5. Collection log

---

## 📝 Notes for AI Assistants

### Key Reminders

1. **Working Directory:** Always use `C:\Users\durha\oneSoul_idle_RPG\`
2. **Registry Files:** Use `_NEW.js` versions, not old registry files
3. **Tool System:** Tools use `skill` property, equip to `weapon` slot
4. **Instance IDs:** Parse both formats (`_instance_` and timestamp-based)
5. **Item Access:** Use `ItemRegistry.getItem()` as primary method
6. **State Modification:** Only systems modify state, UI reads state
7. **Load Order:** Script loading order is CRITICAL (see index.html)
8. **Deprecated Files:** `harvestSystem.js`, `restRecoverySystem.js`, `mapRenderer.js`

### When Adding New Features

1. **Check registries first** - Does a registry exist for this entity type?
2. **Follow patterns** - Use existing patterns (system injection, registry, etc.)
3. **Update schemas** - Add new properties to schemas if needed
4. **Test load order** - Ensure new files load in correct sequence
5. **Update UI** - Create/update UI component for new feature
6. **Document changes** - Update this file and GAME_CONTEXT.md

### Common Tasks

**Adding a new item:**
1. Add to appropriate file in `src/data/items/production/`
2. Follow item schema (see `itemSchema.js`)
3. Register via `ItemRegistry.register()`
4. No code changes needed (registry handles it)

**Adding a new system:**
1. Create file in `src/systems/`
2. Use system injection pattern
3. Add script tag to `index.html` (in correct position)
4. Initialize in `gameEngine.js`

**Adding a new UI view:**
1. Create file in `src/ui/`
2. Add view div to `index.html`
3. Add sidebar button with `data-action="switch-view"`
4. Create `update()` method
5. Call from `globalHandlers.js`

**Debugging state issues:**
1. Check browser console for errors
2. Inspect `GameEngine.state` in console
3. Verify system references updated after load
4. Check save data structure in localStorage

### Project Strengths

- ✅ Clean modular architecture
- ✅ Unified registry system
- ✅ Comprehensive data validation
- ✅ Multi-environment support (dev/test/prod)
- ✅ Extensible system design
- ✅ Well-organized directory structure

### Known Technical Debt

- ⚠️ Two instance ID formats (should standardize)
- ⚠️ Some UI components don't use EventBus
- ⚠️ Performance optimization needed for large inventories
- ⚠️ Legacy `definitions.js` still in use (should fully migrate)
- ⚠️ No automated testing
- ⚠️ Manual dependency management (no build system)

---

**End of Architecture Document**

For game design context and recent changes, see `GAME_CONTEXT.md`.
For equipment system details, see `EQUIPMENT_SYSTEM_GUIDE.md`.
