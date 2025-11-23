# Idle RPG Prototype - Game Context Document

**Last Updated:** 2025-11-21
**Version:** 2.1
**Purpose:** Comprehensive context document for development and AI assistance

## ⚠️ CURRENT STATUS

**Recent Changes (2025-11-21)**:
- ✅ **Navigation System Refactored**: Camping resources added (food + wood consumption during recovery)
- ✅ **World Map System Extracted**: Map generation logic moved to dedicated `worldMapSystem.js`
- ✅ **Hex Grid System Restored**: Interactive hex tile overlay over world map background
- ✅ **System Architecture Cleanup**: Removed old rectangular map generation files
- ✅ **Path Discovery System**: Bidirectional path discovery between regions working
- ✅ **Equipment Slots for Camping**: Food and wood slots in navigation UI for recovery resources

**Recent Architecture Improvements**:
- WorldMapSystem: Generates region data (biomes, navigation requirements, discoverable content)
- HexGridSystem: Renders interactive hex tiles over world map with zoom/pan
- NavigationSystem: Handles camping resource consumption (1 food + 1 wood every 6 seconds during recovery)
- Proper delegation pattern: GameEngine initializes systems, doesn't contain logic

**What Actually Works**:
- ✅ Save/Load system
- ✅ Navigation with camping resources (food + wood consumption)
- ✅ World map generation with hex tile grid overlay
- ✅ Bidirectional path discovery between regions
- ✅ Gathering system with endurance/recovery
- ✅ Interactive hex grid with zoom/pan over world map image
- ✅ Inventory/Bank system
- ✅ Skill progression tracking

**What Exists But Is NON-FUNCTIONAL (Needs Major Work)**:
- ❌ **Combat System**: Rev0 placeholder - needs complete implementation
  - Combat UI exists but mechanics are basic
  - No proper enemy AI or combat flow
  - Stance system not implemented
  - Type effectiveness system incomplete
- ❌ **Equipment System**: Rev0 placeholder - needs complete overhaul
  - Equipment slots exist but stat calculation incomplete
  - No proper equipment validation
  - Equipment UI needs major work
- ❌ **Crafting System**: Rev0 placeholder - barely functional
  - Recipe system exists but UI is broken
  - No proper material validation
  - Crafting UI needs complete rebuild
- ❌ **Weapon Build System**: Non-functional
  - Attachment system not implemented
  - No attachment UI
  - Weapon modding system doesn't exist
- ❌ **Perk Grid System**: Rev0 placeholder - non-functional
  - 5x5 grid UI exists but mechanics broken
  - Medal placement works but no actual perk effects
  - Perk calculations incomplete
  - Perk Grid UI needs major work
- ❌ **Mission System**: Rev0 placeholder - needs complete refactor
  - Mission definitions exist but system is broken
  - No proper mission flow or progression
  - Mission UI incomplete
  - Needs alignment with FOUNDATION_SPECIFICATION.md

**What Needs Work**:
- ⚠️ Path visualization (removed visual indicators - need better solution)
- ⚠️ Region modal/details when clicking hex tiles
- ⚠️ Node collection UI improvements
- ⚠️ All combat-related UIs (combat, equipment, weapon builds)
- ⚠️ All crafting-related UIs (crafting, recipes)
- ⚠️ Mission UI and flow
- ⚠️ Perk grid UI and mechanics

**🚨 CRITICAL: Most Systems Are Rev0 Placeholders**:

The following systems have file structure and basic initialization but are **NOT FUNCTIONAL**:
1. **Combat System** - Needs complete implementation from scratch
2. **Equipment System** - Needs stat calculation, validation, and UI overhaul
3. **Crafting System** - Recipe system broken, UI needs rebuild
4. **Weapon Build/Attachments** - Doesn't exist beyond stubs
5. **Perk Grid System** - UI exists but no actual effects, calculations incomplete
6. **Mission System** - Broken, needs complete refactor per FOUNDATION_SPECIFICATION.md

**Development Priority Order**:
1. Fix Equipment System (stat calculations, validation, UI)
2. Implement Combat System properly (mechanics, AI, flow, UI)
3. Build Weapon Attachment System (modding, attachments, UI)
4. Fix Crafting System (recipe validation, material handling, UI)
5. Implement Perk Grid mechanics (actual effects, calculations, UI)
6. Refactor Mission System (proper flow, progression, alignment with spec)

**⚠️ TODO: Mission System Refactor**:
- **ISSUE**: Mission requirements are currently set in `gameEngine.js`
- **PROBLEM**: Game engine should NOT contain game logic, only initialization
- **CORRECT APPROACH**: Mission system should handle its own requirements
- **ACTION NEEDED**:
  1. Move mission requirement checks to MissionSystem
  2. MissionSystem should only be called from gameEngine for initialization
  3. Use EventBus for mission-related state changes
  4. Use Registry pattern for mission definitions
  5. Region exit requirements should be optional mission rewards, not hardcoded

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Core Systems](#core-systems)
4. [Game Mechanics](#game-mechanics)
5. [Type System](#type-system)
6. [UI Architecture](#ui-architecture)
7. [Data Structures](#data-structures)
8. [Standardizations & Conventions](#standardizations--conventions)
9. [Future Development Notes](#future-development-notes)

---

## Project Overview

### Game Type
Idle/Incremental RPG with hex-based world exploration, combat, crafting, and progression systems.

### Tech Stack
- **Frontend:** Pure JavaScript (ES6+), HTML5, CSS3
- **No Framework:** Vanilla JS implementation
- **Architecture:** Modular system-based design
- **Storage:** LocalStorage for save/load

### Design Philosophy
- Modular, maintainable code structure
- System-based architecture (each game feature is a separate system)
- Clear separation between game logic and UI
- Performance-optimized UI updates with state caching

---

## File Structure

**Note**: Directory structure aligned with best practices (95% complete). Old duplicate registry files removed.

```
oneSoul_idle_RPG/
├── index.html                          # Main HTML file, includes all CSS
├── saveSystem.js                       # Save/load functionality
├── server.js                           # Dev server
├── package.json                        # Dependencies
├── README.md                           # Project overview
│
├── assets/                             # Game assets
│   └── backgrounds/                    # Background images
│
├── src/
│   ├── core/                          # Core engine
│   │   ├── gameEngine.js              # Main coordinator, game loop (1809 lines)
│   │   ├── definitions.js              # Legacy definitions adapter
│   │   ├── BaseRegistry.js            # Base registry class
│   │   ├── RegistryManager.js         # Central registry manager
│   │   └── statCalculator.js          # Stat calculation system
│   │
│   ├── data/                          # Game data definitions (UNIFIED REGISTRY SYSTEM)
│   │   ├── items/
│   │   │   ├── itemRegistry_NEW.js    # ✅ ACTIVE registry
│   │   │   ├── itemRegistryInit.js    # Registry initializer
│   │   │   ├── index.js               # Main loader
│   │   │   ├── itemSchema.js          # Item data structure
│   │   │   ├── itemValidator.js       # Data validation
│   │   │   ├── production/            # Production item data
│   │   │   │   ├── equipment/
│   │   │   │   ├── consumables/
│   │   │   │   ├── materials/
│   │   │   │   └── currencies/
│   │   │   ├── dev/, test/, legacy/, planned/
│   │   │   └── definitionsAdapter.js  # Adapter for legacy code
│   │   │
│   │   ├── nodes/                     # Resource nodes
│   │   │   ├── nodeRegistry_NEW.js    # ✅ ACTIVE registry
│   │   │   ├── nodeInit.js            # Initializer
│   │   │   ├── production/            # Node data by skill type
│   │   │   │   ├── mining.js
│   │   │   │   ├── logging.js
│   │   │   │   ├── fishing.js
│   │   │   │   ├── hunting.js
│   │   │   │   ├── foraging.js
│   │   │   │   └── thieving.js
│   │   │   ├── nodeSchema.js
│   │   │   └── nodeValidator.js
│   │   │
│   │   ├── enemies/
│   │   │   ├── enemyRegistry_NEW.js   # ✅ ACTIVE registry
│   │   │   ├── enemyInit.js
│   │   │   └── production/basicEnemies.js
│   │   │
│   │   ├── missions/
│   │   │   ├── missionRegistry_NEW.js # ✅ ACTIVE registry
│   │   │   └── missionInit.js
│   │   │
│   │   ├── recipes/
│   │   │   ├── recipeRegistry_NEW.js  # ✅ ACTIVE registry
│   │   │   └── recipeInit.js
│   │   │
│   │   ├── skills/
│   │   │   ├── skillRegistry_NEW.js   # ✅ ACTIVE registry
│   │   │   ├── index.js
│   │   │   └── production/skills_production.js
│   │   │
│   │   ├── regions/
│   │   │   ├── regionRegistry_NEW.js  # ✅ ACTIVE registry
│   │   │   ├── regionInit.js
│   │   │   └── worldRegions.js
│   │   │
│   │   └── [Other registries: perks, npcs, biomes, lootTables, etc.]
│   │
│   ├── systems/                       # Game systems
│   │   ├── combatSystem.js            # ✅ Combat logic and enemy encounters
│   │   ├── offlineCombatSystem.js     # ✅ Offline combat simulation
│   │   ├── craftingSystem.js          # ✅ Recipe-based crafting
│   │   ├── equipmentSystem.js         # ✅ Equipment, stats calculation
│   │   ├── inventorySystem.js         # ✅ Bank/inventory management
│   │   ├── enhancementSystem.js       # Item enhancement/upgrading
│   │   ├── missionSystem.js           # ✅ Quest/mission system
│   │   ├── navigationSystem.js        # ✅ World exploration with camping resources
│   │   ├── worldMapSystem.js          # ✅ NEW - World map generation (biomes, regions, paths)
│   │   ├── hexGridSystem.js           # ✅ NEW - Interactive hex tile overlay with zoom/pan
│   │   ├── gatheringSystem.js         # ✅ Universal gathering system
│   │   ├── nodeCollectionSystem.js    # ⚠️ DEPRECATED - Being replaced by gatheringSystem
│   │   ├── miningSystem.js            # ⚠️ DEPRECATED - Being replaced by gatheringSystem
│   │   ├── resourceSystem.js          # ✅ Resource management
│   │   ├── skillSystem.js             # ✅ Skill progression
│   │   ├── perkGridSystem.js          # ✅ 5x5 perk grid mechanics
│   │   ├── perkGridSimulator.js       # ✅ Perk calculations
│   │   ├── medalCraftingSystem.js     # ✅ Medal crafting with rarities
│   │   ├── typeEffectivenessSystem.js # ✅ Damage/armor type calculations
│   │   ├── migrationSystem.js         # ✅ Save file migrations
│   │   ├── backgroundSystem.js        # Background image loading
│   │   ├── globalDiscoverySystem.js   # Global discovery tracking
│   │   ├── engineeringSystem.js       # Engineering crafting
│   │   └── itemIntegration.js         # Item system integration
│   │
│   ├── ui/                            # UI modules
│   │   ├── uiCore.js                  # ✅ UI coordinator, main update loop
│   │   ├── combatUI.js                # ✅ Combat view rendering
│   │   ├── offlineCombatUI.js         # ✅ Offline combat results modal
│   │   ├── craftingUI.js              # ✅ Crafting view
│   │   ├── equipmentUI.js             # ✅ Equipment and bank UI
│   │   ├── equipmentComponent.js      # ✅ Reusable equipment display
│   │   ├── navigationUI.js            # ✅ World map + hex grid + camping resources
│   │   ├── skillsUI.js                # ✅ Skills view
│   │   ├── nodeCollectionUI.js        # ✅ Node interaction UI
│   │   ├── missionsUI.js              # ✅ Mission/quest UI
│   │   ├── developerUI.js             # ✅ Dev tools and debugging
│   │   ├── perkGridUI.js              # ✅ Perk grid visualization
│   │   ├── medalCraftingUI.js         # ✅ Medal crafting interface
│   │   ├── medalCraftingModal.js      # ✅ Medal crafting popup
│   │   ├── medalSelectionModal.js     # ✅ Medal placement popup
│   │   ├── tooltipUI.js               # ✅ Item tooltips
│   │   ├── bankDevTools.js            # ✅ Bank debugging tools
│   │   ├── devTools.js                # ✅ Reusable dev tools
│   │   ├── globalHandlers.js          # ✅ Click handlers (HTML → systems)
│   │   └── [39 total UI modules]
│   │
│   └── utils/                         # Utilities
│       ├── formatting.js              # Number/time formatting
│       ├── progressBar.js             # Progress bar calculations
│       ├── assetManager.js            # Asset loading
│       ├── simplexNoise.js            # Noise generation
│       └── uiComponents.js            # Reusable UI components
│
├── docs/                              # Documentation
│   ├── REGION_SCHEMA.md
│   └── REGION_TEMPLATE.js
│
├── dev-tools/                         # Development utilities
│   ├── exportRegions.html
│   ├── extractTilemap.html
│   ├── countTiles.html
│   └── diagnose-combat-ui.js
│
├── outputs/                           # Excel export tools
│   ├── excel-to-json.js
│   ├── extract-to-csv.js
│   └── validate-data.js
│
├── tests/                             # Test files
│   └── [6 test files]
│
└── [Root Documentation - 39 .md files including status/guide docs]
```

---

## Core Systems

### 1. Game Engine (`gameEngine.js`)
**Purpose:** Central coordinator for all game systems

**Responsibilities:**
- Manages game state (single source of truth)
- Runs main game loop (100ms tick rate)
- Coordinates all subsystems
- Handles initialization and system binding

**Key Methods:**
- `init()` - Initialize all systems
- `tick()` - Main game loop (runs every 100ms)
- `definitions` - Reference to all game data

### 2. Save System (`saveSystem.js`)
**Purpose:** Persistence and data migration

**Features:**
- Auto-save every 30 seconds
- LocalStorage-based
- Save file versioning
- Migration system for backward compatibility
- Export/import functionality

**Save Format:**
```javascript
{
    version: "1.5",
    timestamp: Date.now(),
    state: { ...gameState }
}
```

### 3. Migration System (`migrationSystem.js`)
**Purpose:** Handle breaking changes to save files

**Migrations Applied:**
- Removed "perk" bank tab (items deleted)
- Added new equipment slots (boots, gloves)
- Type system additions (armor ratings, damage types)
- Added consumable slots (ammo, potion)
- Added technology slots (tech1, tech2, tech3, tech4)
- Combat stance system initialization
- Weapon attachments system initialization
- Rest equipment slots (food + wood for camping)

### 4. World Map System (`worldMapSystem.js`) - NEW
**Purpose:** Generate procedural world map with regions, biomes, and navigation requirements

**Responsibilities:**
- Generate regions from WorldTilemap (hex coordinates)
- Assign biomes based on position (plains, forest, mountains, tundra, desert, swamp, coast)
- Calculate navigation requirements (tier-based progression)
- Determine region complication (discovery difficulty)
- Assign discoverable nodes and enemies per region
- Link adjacent regions for path discovery

**Key Methods:**
- `generateWorldMap(radius)` - Main generation function
- `getBiome(q, r)` - Procedural biome assignment
- `calculateNavigationRequirement(q, r)` - Nav tier calculation
- `getComplicationFactor(q, r, biome)` - Discovery difficulty
- `getDiscoverableNodes(regionId)` - Node assignment from WorldRegions
- `setRegionMissionRequirement(worldMap, regionId, missionId)` - Gate regions with missions

**Integration:**
- Called by GameEngine during initialization
- Generates 135 regions from WorldTilemap
- Starting region: (-3, -4) "The Cradle"

### 5. Hex Grid System (`hexGridSystem.js`) - NEW
**Purpose:** Render interactive hex tile overlay on world map background image

**Responsibilities:**
- Create DOM structure with world map background (`assets/map/world_map.jpg`)
- Render hex tiles for each tilemap position
- Handle zoom/pan controls (scroll to zoom, drag to pan)
- Display hex states (current, discovered, undiscovered, explorable)
- Show coordinates, discovery progress
- Animated footsteps on current region during navigation

**Features:**
- **Zoom/Pan**: Mouse wheel zoom (1x-2.5x), drag to pan, constrained to map bounds
- **Hex States**:
  - Current region: Blue border with glow, animated footsteps
  - Discovered: Transparent fill (shows map), colored border
  - Undiscovered: Dark fog of war
  - Explorable: Golden tint (path found from another region)
- **Smart Tile Placement**: Only creates hexes over landmass regions
- **Interactive**: Click hex to open region modal, hover to magnify

**Key Methods:**
- `init(containerId)` - Initialize system and render grid
- `createHexElement(regionId, hexData, x, y)` - Create single hex tile
- `getHexPosition(q, r)` - Convert axial coords to pixels
- `zoom(delta, mouseX, mouseY)` - Handle zoom controls
- `centerOnRegion(regionId)` - Pan to specific region

### 6. Navigation System (`navigationSystem.js`) - UPDATED
**Purpose:** Handle region exploration, path discovery, and camping resources

**Recent Changes:**
- **Camping Resources**: Added food + wood equipment slots for recovery
- **Resource Consumption**: Consumes 1 food + 1 wood every 6 seconds during recovery
- **Recovery Pause**: If resources depleted, recovery stops until restocked

**Key Mechanics:**
- **Path Discovery**: `discoverBidirectionalPath(regionA, regionB)` - Unlocks travel both ways
- **Exit Path Discovery**: Random chance during exploration to discover adjacent region paths
- **Travel Validation**: `canTravelToRegion(targetRegionId)` - Checks if path discovered
- **Camping System**: Recovery mode requires equipped food (healing > 0) and wood (log type)

**Equipment Integration:**
- Food slot: Filters items with `healing > 0`
- Wood slot: Filters items with `resourceType === 'log'`
- Modal selection with compatible items only
- Displays equipped item cards with quantity

---

## Game Mechanics

### Character Progression

#### Character Level
- **Gain From:** 10% of all skill XP
- **Benefits:** Attribute points (3 per level)
- **XP Formula:** `baseExp * (level ^ expCurve)` where baseExp=1000, expCurve=2.0
- **UI:** Header shows character name, level, XP bar with floating XP drop animations

#### Combat Attributes
- **Health** - +10 max HP per point, +2% auto-eat threshold per point, +0.5% DOT resistance per point
- **Defense** - +2% damage reduction per point, +0.3% special attack block chance per point (cap 50%)
- **Strength** - +2 attack damage per point, +10 equipment capacity per point, +5 navigation endurance per point, +1% reload time reduction per point
- **Stealth** - +1% thieving success per point, +1% first strike bonus damage per point, +0.5% enemy accuracy reduction per point
- **Perception** - +0.5% accuracy per point, +1% critical hit chance per point
- **Mobility** - +2% attack speed per point, +3 navigation endurance per point, +1% dodge chance per point
- **Intellect** - +1% skill XP gain per point, +2% discovery chance per point in navigation, +0.2% special attack chance per point, +0.5% consumable efficiency per point

### Skills System

#### Skill Categories

**Gathering Skills:**
- Navigation (exploration speed)
- Mining (ore gathering)
- Logging (wood gathering)
- Fishing (fish catching)
- Hunting (animal hunting)
- Foraging (plant gathering)
- Thieving (lockpicking/pickpocketing)

**Crafting Skills:**
- Forging (weapons, armor, metal)
- Machining (firearms, mechanical)
- Cooking (food, consumables)
- Chemistry (potions, explosives)
- Textiles (cloth armor, fabric)
- Engineering (structures, devices)

**Progression:**
- XP Formula: `baseExp * (level ^ expCurve)`
- Typical: baseExp=100-150, expCurve=1.4-1.7
- Level unlocks new recipes, nodes, enemies

### Equipment System

#### Equipment Slots

**3x3 Equipment Grid (Provides Perks):**
```
[Weapon]  [Helmet]  [Back]
[Gloves]  [Chest]   [Neck]
[Boots]   [Legs]    [Ring]
```

**Consumable Slots (Show Quantity, No Perks):**
- Ammo (🎯) - Ammunition for ranged weapons
- Food (🍖) - Auto-consumed during combat
- Potion (🧪) - Healing/buff consumables

**Technology Slots (Intellect-Gated, No Perks):**
- Tech Slot 1 (⚙️) - Unlocked at 10 Intellect
- Tech Slot 2 (⚙️) - Unlocked at 25 Intellect
- Tech Slot 3 (⚙️) - Unlocked at 50 Intellect
- Tech Slot 4 (⚙️) - Unlocked at 100 Intellect

**Key Differences:**
- Only the 3x3 grid provides perk bonuses for the perk grid system
- Consumables display remaining quantity and are consumed during activities
- Technology items provide passive combat bonuses but no perk grid contribution
- Technology slots require minimum intellect attribute to unlock

#### Equipment UI Layout

**Horizontal 4-Container Layout (Equipment Tab):**
1. **Equipment Container** - 3x3 grid with golden ratio proportions
2. **Consumables Container** - Vertical stack of 3 consumable slots (green theme)
3. **Technology Container** - Vertical stack of 4 tech slots (cyan theme, circuit pattern)
4. **Summary Container** - Equipment stats and bonuses display

**Display Modes:**
- `full` - All containers (equipment + consumables + technology + stats)
- `compact` - Equipment + consumables only (Dashboard, Combat View)
- `minimal` - Equipment grid only
- `horizontal` - 4 equal-width containers for Equipment Tab

#### Weapon Customization System

**Gun-Type Weapons:**
- Guns have 6 attachment slots for customization
- Attachment slots: Scope, Barrel, Magazine, Stock, Grip, Muzzle
- Attachments are items with `itemType: 'attachment'` and `attachmentSlot: '<type>'`
- Customization accessed via "⚙️ Customize" button on equipped gun

**Weapon Build Modal:**
- Left panel: Weapon preview with current stats
- Right panel: 6 attachment slots in 2x3 grid
- Bottom panel: Attachment selection (filters bank by slot type)
- Real-time stat updates when attachments change
- Visual indicators for attached vs empty slots

**Attachment System State:**
```javascript
weaponAttachments: {
    scope: null,      // itemId or null
    barrel: null,
    magazine: null,
    stock: null,
    grip: null,
    muzzle: null
}
```

#### Equipment Weight System
- **Base Capacity:** 30
- **Per Strength:** +1 capacity
- **Weight Ranges:**
  - Weapons: 2-15 (tools lighter, combat weapons heavier, large weapons the heaviest)
  - Armor: 5-25 (cloth/leather light, plated armor heavy)
  - Accessories: 1-6 (rings/amulets lightest)

#### Stats Calculation
All equipment bonuses are summed and applied:
- Attack damage, attack speed, accuracy
- Max health, health regen
- Damage reduction (percentage and absolute)
- Critical hit chance/damage
- Evasion, lifesteal
- All equipment stats are applied to their tiles in perkgrid
- PerkGrid final stats contain weapon stats and are used in combat and skilling calculations

**Formula Flow:**
1. Base stats from combat attributes
2. + Equipment bonuses
3. * Perk multipliers from grid
4. * Skill level bonuses
5. = Final effective stats

### Type Effectiveness System

#### Damage Types (5 total)
| Type | Icon | Strong Against | Weak Against | Color |
|------|------|----------------|--------------|-------|
| Pierce | 🗡️ | Insulated | Plated | #9e9e9e |
| Explosive | 💥 | Plated | Airborne | #ff5722 |
| Cryo | ❄️ | Airborne | Biological | #03a9f4 |
| Shock | ⚡ | Droid | Insulated | #ffeb3b |
| Incendiary | 🔥 | Biological | Droid | #ff9800 |

#### Armor Types (5 total)
| Type | Icon | Resists | Weak To | Color |
|------|------|---------|---------|-------|
| Insulated | 🛡️ | Shock | Pierce | #ffc107 |
| Plated | 🛡️ | Pierce | Explosive | #607d8b |
| Airborne | 🌪️ | Explosive | Cryo | #2196f3 |
| Droid | 🤖 | Incendiary | Shock | #9c27b0 |
| Biological | 🧬 | Cryo | Incendiary | #4caf50 |

#### Type Effectiveness Multipliers
- **Super Effective:** 1.5x damage (50% more)
- **Not Very Effective:** 0.67x damage (33% less)
- **Neutral:** 1.0x damage (normal)

#### Implementation
**Weapons:**
- Each weapon has `damageType` property
- 47 weapons assigned types (33 Pierce, 11 Incendiary, 3 Shock)

**Armor:**
- Each armor piece has `armorRatings` object
- Ratings for all 5 types, sum to ~100 points per piece
- Player's dominant type = highest total rating across equipped armor

**Combat:**
- Player attack: weapon damageType vs enemy armorType
- Enemy attack: enemy damageType vs player dominant armorType
- Combat log shows effectiveness: `[SUPER EFFECTIVE!]` or `[Not very effective...]`

### Combat System

#### Combat Flow
1. Player selects enemy from list
2. Combat begins (turn-based with auto-attack)
3. Player can manually attack or auto-attack on cooldown
4. Enemy auto-attacks on their cooldown
5. Defeat enemy → loot drops → respawn timer
6. Player can flee at any time

#### Damage Calculation (Player → Enemy)
```javascript
1. Base damage = player attackDamage
2. Roll for hit (player accuracy vs random 0-100)
3. Roll for critical (criticalChance%)
4. Calculate damage variance (weighted toward high rolls)
5. Apply type effectiveness multiplier
6. If critical: damage *= criticalImpact
7. Apply lifesteal
8. Deal final damage
```

#### Damage Calculation (Enemy → Player)
```javascript
1. Base damage = enemy attackDamage
2. Roll for evasion (player evasionRating%)
3. Roll for hit (enemy accuracy vs random 0-100)
4. Calculate damage variance (0.9x to 1.1x)
5. Apply type effectiveness multiplier
6. Apply percentage damage reduction
7. Apply absolute damage reduction (minimum 1)
8. Deal final damage
```

#### Enemy Power Levels
Displayed on enemy tiles before combat:
- **Weak** (green): Power < 50
- **Moderate** (orange): Power 50-150
- **Strong** (red): Power 150-300
- **Elite** (purple): Power 300+

**Power Formula:** `(maxHealth / 10) + (attackDamage * 5)`

#### Combat Stance System
Players can toggle between two combat stances during battle:

**Offensive Stance (Default):**
- Normal damage and attack speed (1.0x multipliers)
- Standard defense values

**Defensive Stance:**
- +30% damage reduction
- +20% block/parry chance
- -40% damage dealt
- -25% attack speed

**Mechanics:**
- 2-second cooldown between stance changes
- Toggle button in combat UI
- Stance indicator shows active modifiers
- Visual feedback with icons (⚔️ Offensive / 🛡️ Defensive)

#### Offline Combat Simulation
When players are away from the game, combat progress is simulated:

**Features:**
- 8-hour cap on offline time
- 70% efficiency penalty for offline progress
- Viability check (ensures player can safely defeat enemy)
- Full combat tick simulation (100ms intervals)
- Tracks: kills, XP, gold, medals, loot, food/ammo consumed, deaths
- Beautiful results modal on return

**Limitations:**
- Only simulates if player has an enemy selected
- Must have food and ammo equipped (if required)
- Will fail simulation if player cannot survive the enemy

### Perk Grid System

#### Grid Layout
- **Size:** 5x5 grid (25 cells)
- **Purpose:** Place medals to gain permanent multipliers

#### Medal System
**9 Rarity Tiers:**
| Rarity | Icon | Perk Count | Power Mult | Grid Effect |
|--------|------|------------|------------|-------------|
| Common | ⚪ | 1 | 1.0x | None |
| Uncommon | 🟢 | 1 | 1.5x | None |
| Rare | 🔵 | 2 | 2.0x | None |
| Epic | 🟣 | 3 | 3.0x | None |
| Legendary | 🟠 | 3 | 4.0x | None |
| Mythic | 🔴 | 4 | 6.0x | None |
| Divine | ✨ | 4 | 10.0x | None |
| Transcendent | 💫 | 5 | 20.0x | Affects row |
| Creator | 🌟 | 5 | 50.0x | Affects all |

**Crafting Tiers:** 9 tiers from Common (10 medals) to Creator (2M medals)

**Perk Types:**
- Combat: Damage, Attack Speed, Crit Chance/Damage, Accuracy, Evasion, Defense, HP Regen
- Gathering: Mining/Logging/Fishing/Hunting/Foraging/Thieving Speed and Damage
- Crafting: Speed, Quality, Efficiency for each skill
- Special: Row/Column Multipliers

**Perk Name Abbreviations:**
- Speed → SPD.
- Efficiency → EFF.
- Multiplier → MULT.

**Grid Mechanics:**
- Place medals on grid cells
- Each medal grants percentage multipliers
- Transcendent: affects entire row
- Creator: affects entire grid
- Power multiplier scales perk values

### Bank/Inventory System

#### Bank Tabs (11 total)
1. Resources (ore, wood, etc.)
2. Equipment (weapons, armor)
3. Consumables (food, potions)
4. Quest (mission items)
5. Crafting (materials)
6. Tools (gathering tools)
7. Weapons (combat weapons)
8. Armor (wearable armor)
9. Accessories (rings, amulets)
10. Medals (crafted medals - special display)
11. Legacy (deprecated items)

#### Item Properties
```javascript
{
    name: string,
    description: string,
    image: string (emoji),
    stackLimit: number (1 for equipment, higher for resources),
    devLimit: number (Infinity for most),
    defaultTab: string (tab to appear in),
    category: string,
    equipSlot?: string (for equipment),
    stats?: {
        // Combat stats
        attackDamage?: number,
        attackSpeed?: number,
        accuracy?: number,
        maxHealth?: number,
        // etc.

        // Equipment properties
        weight?: number,
        damageType?: string (for weapons),
        armorRatings?: { insulated, plated, airborne, droid, biological }
    }
}
```

#### Special Features
- Grid layout: 140px tiles, responsive
- Medal tab: compact display with perk previews
- New item indicators (yellow highlight)
- Context menus on items
- Tooltips with full stats

### Navigation/World System

#### World Generation
- **Grid Size:** 20x20 hexagonal tiles (configurable radius)
- **Biomes:** plains, forest, coast, mountains, desert, swamp, tundra
- **Generation:** Procedural with noise-based biome placement
- **Complication Factor:** Each region has difficulty rating based on:
  - Biome type (plains: 1.0x to tundra: 1.6x)
  - Distance from starting region
  - Formula: `biomeDifficulty + (distance × complicationScaling)`

#### Navigation Mechanics - Endurance System
**Exploration uses endurance instead of region health:**
- **Endurance Pool:** `baseEndurance + (strength × 5) + (mobility × 3)`
  - Base: 100
  - Scales with player attributes
- **Discovery Attempts:** Every 3 seconds (configurable interval)
  - Costs endurance per attempt (default: 5 endurance)
  - Endurance drains whether successful or not
  - Auto-stops when endurance reaches 0
- **Discovery Success Rate:** Based on intellect vs region complication
  - Formula: `baseChance + (intellect × 2) - ((complication - 1.0) × 10)`
  - Clamped between 5% and 95%
  - Higher intellect = more discoveries per attempt
  - Higher complication = fewer discoveries

#### Discovery System
- Resource nodes (mining, logging, fishing, hunting, foraging)
- Crafting stations (anvil, workbench, etc.)
- Exit paths (to adjacent hexes)
- Enemies (for combat)
- Missions (region-specific quests)

#### Region Features
- **Visual Indicators:** Map shows region status
  - Locked (dark): Not yet discovered
  - Explorable (yellow border): Path exists from another region
  - Partially Explored (orange badge): 0-99% discovery progress
  - Fully Explored (green checkmark): 100% discovered
  - Has Nodes (purple pickaxe): Resources available
  - Current Region (blue border): Player location
- **Mission Gating:** Regions can require mission completion before allowing travel out
  - Red badge (!) when mission incomplete
  - Green badge (✓) when mission complete
  - Travel blocked until requirement met

### Crafting System

#### Recipe Structure
```javascript
{
    name: string,
    category: string,
    skill: string,
    skillLevel: number (unlock requirement),
    ingredients: [
        { itemId: string, quantity: number }
    ],
    output: { itemId: string, quantity: number },
    craftTime: number (milliseconds)
}
```

#### Crafting Flow
1. Select recipe (must meet skill level)
2. Check ingredients in bank
3. Start craft (ingredients consumed)
4. Wait for craft time
5. Receive output in bank

#### Multiple Crafts
- Queue system (up to 5 active crafts)
- Parallel processing
- Progress bars for each

### Mission System

#### Mission Structure
Missions are region-specific quests with objectives, rewards, and progression chains.

**Mission Properties:**
```javascript
{
    name: string,
    description: string,
    type: 'main_story' | 'side' | 'daily',
    metadata: {
        region: string,        // Required region ID
        chain: string,         // Chain ID for progression
        unlocks: [string],     // Mission IDs unlocked on completion
        chainOrder: number     // Position in chain
    },
    objectives: [
        {
            id: string,
            type: 'kill' | 'gather' | 'craft' | 'explore' | 'equip',
            description: string,
            target: string,    // Enemy ID, item ID, region ID, etc.
            required: number
        }
    ],
    rewards: {
        base: {
            exp: { skillId: amount },  // XP rewards per skill
            currencies: { gold, medals, tomes, gems },
            items: [{ itemId, amount }]
        }
    },
    dialog: {
        npc: string,
        npcIcon: string,
        intro: string,
        body: string,
        completion: string
    }
}
```

#### Mission States
- **Locked:** Requirements not met (previous missions incomplete)
- **Available:** Can be started
- **Active:** Currently in progress
- **Completed:** Finished

#### Mission Display
**Mission Board Organization:**
- **Main Story:** Quest chains with visual progression
- **Side Quests:** Optional missions
- **Daily/Repeatable:** Recurring missions
- **Completed:** Collapsible history

**Visual Features:**
- All missions always visible (including locked)
- Color-coded borders by type
- Status icons (🔒 Locked, 📋 Available, 🎯 Active, ✅ Completed)
- Objective progress tracking
- Rewards preview on cards

#### Mission Dialogs
Enhanced popup when viewing missions:
- NPC portrait and dialogue
- Objective list with progress
- Highlighted rewards section:
  - Items (green border with icons)
  - Currencies (gold border)
  - Experience (blue border per skill)
- Unlocks section showing progression path
- Region requirement display
- Travel button (if not in correct region)
- Accept/Abandon buttons

#### Tutorial Mission
**Starting Region (region_-10_0):**
- Mission: "tutorial_elder"
- Blocks exit until completed
- Rewards: All 5 basic gathering tools
  - stone_pickaxe (Mining)
  - stone_hatchet (Logging)
  - fishing_net (Fishing)
  - shortBow (Hunting)
  - wickerBasket (Foraging)
- Teaches basic game mechanics

---

## Type System

### Detailed Type Matrix

#### Weapon Damage Type Distribution
**Pierce (33 weapons):**
- Pickaxes: bronze, iron, steel, mithril
- Axes (for piercing): None (axes are Incendiary)
- Bows: shortBow, longBow, compositeBow, legendaryBow
- Fishing Rods: bambooPole, basicRod, carbonRod, masterRod
- Foraging Tools: wickerBasket, gatherersSatchel, herbalistKit, masterGatherer
- Thieving Tools: lockpick, crowbar, advancedLockpick, masterThiefKit
- Combat: dagger, knife_hunting, spear_wooden, spear_iron, halberd
- Crossbows: crossbow_light, crossbow_heavy
- Misc: shovel_basic, sickle_iron, pipe_weapon, crowbar_weapon

**Incendiary (11 weapons):**
- Axes: bronzeAxe, ironAxe, steelAxe, battleaxe
- Swords: ironSword, steelSword, broadsword, katana, longsword
- Blunt: mace_iron, warhammer

**Shock (3 weapons):**
- Firearms: pistol_basic, rifle_hunting
- Electric: stun_baton

### Armor Rating Distribution
**Average armor ratings across all 35 armor pieces:**
- Insulated: 20.57
- Plated: 33.29 (highest - most armor is metal)
- Airborne: 20.77
- Droid: 12.34
- Biological: 13.03

**Material-based patterns:**
- Cloth items: High insulated (45-50), moderate biological (20-30)
- Leather items: Balanced insulated (28-32) and biological (18-25)
- Iron/Steel: Very high plated (50-70), low everything else
- Capes/Cloaks: High airborne (50-55)
- Jewelry: Moderate droid (25-30) for tech theme

---

## UI Architecture

### Header (Sticky)
**Layout:** Horizontal flex container, stays at top when scrolling

**Sections (left to right):**
1. **Game Title** - "⚔️ Idle RPG Prototype"
2. **Character Level** - Vertical stack:
   - Character name (editable in save file)
   - Level display
   - XP bar
   - XP drop animations (+X XP floats up)
3. **Activity Display** - Vertical stack:
   - Current region name
   - Activity text (Idle/Mining/Combat/etc.)
   - Progress bar
   - Progress text
4. **Currency Display** - 2x2 grid:
   - Row 1: 💰 Gold | 🏅 Medals
   - Row 2: 📚 Tomes | 💎 Gems
5. **Controls** - Save, Reset buttons + game time

### Navigation Tabs (Sticky)
**Position:** Below header, stays visible when scrolling

**Tabs:**
- 🧭 Navigation
- 🎯 Skills
- ⛏️ Nodes
- 🏦 Bank
- ⚔️ Equipment
- ⚔️ Combat
- 🔨 Crafting
- 📋 Missions
- ⭐ Perks
- 🛒 Shop
- 📜 Completion Log
- ⚙️ Settings
- 👨‍💻 Developer

### Main Content Area
**Layout:** Scrollable, below sticky header/tabs

**View Switching:**
- Only one view active at a time
- `switchView(viewName)` function
- Active view has `.active` class

### UI Update Strategy

**Performance Optimization:**
- State caching to prevent unnecessary re-renders
- Only update when state changes
- Snapshot current state, compare to last state
- If different → re-render, cache new state

**Example (Equipment UI):**
```javascript
updateEquipment() {
    const currentState = {
        equipment: JSON.stringify(GameEngine.state.equipment),
        health: playerHealth,
        weight: totalWeight
    };

    const hasChanged = !this.lastEquipmentState ||
        this.lastEquipmentState.equipment !== currentState.equipment ||
        this.lastEquipmentState.health !== currentState.health ||
        this.lastEquipmentState.weight !== currentState.weight;

    if (hasChanged) {
        this.render();
        this.lastEquipmentState = currentState;
    }
}
```

### Animation System

**XP Drops:**
- CSS animation: `@keyframes xpDrop`
- Float up 40px, scale 1.0→1.2→0.8, fade out
- Duration: 1 second
- Triggered on any XP gain
- Auto-removes after animation

**Progress Bars:**
- Smooth transitions with CSS: `transition: width 0.3s ease-out`
- Reset logic: disable transition, set to 0%, re-enable, animate to target
- Used for: activity bars, attack cooldown, health bars

---

## Data Structures

### Game State Schema
```javascript
GameEngine.state = {
    // Core progression
    characterLevel: {
        name: "Adventurer",
        level: 1,
        exp: 0,
        unassignedAttributePoints: 0
    },

    combatAttributes: {
        health: 1,
        defense: 1,
        strength: 1,
        stealth: 1,
        perception: 1,
        mobility: 1,
        intellect: 1
    },

    skills: {
        navigation: { level: 1, exp: 0, unlocked: true },
        mining: { level: 1, exp: 0, unlocked: true },
        // ... 14 total skills
    },

    // Resources & Economy
    currencies: {
        gold: 0,
        medals: 0,
        tomes: 0,
        gems: 0
    },

    // Inventory
    bank: {
        activeTab: "resources",
        tabs: { /* 11 tabs */ },
        items: {
            [itemId]: {
                itemId: string,
                quantity: number,
                tab: string,
                definition: object,
                isNew: boolean
            }
        },
        newItems: [] // Array of itemIds
    },

    // Equipment System - 3x3 Grid + Consumables + Technology
    equipment: {
        // === 3x3 EQUIPMENT GRID (Provides perks) ===
        weapon: null,
        helmet: null,
        back: null,
        gloves: null,
        chest: null,
        neck: null,
        boots: null,
        legs: null,
        ring: null,

        // === CONSUMABLE SLOTS (No perks, show quantity) ===
        ammo: null,
        food: null,
        potion: null,

        // === TECHNOLOGY SLOTS (No perks, intellect-gated) ===
        tech1: null,  // Unlocked at 10 intellect
        tech2: null,  // Unlocked at 25 intellect
        tech3: null,  // Unlocked at 50 intellect
        tech4: null   // Unlocked at 100 intellect
    },

    // Weapon Attachments (Gun Customization)
    weaponAttachments: {
        scope: null,
        barrel: null,
        magazine: null,
        stock: null,
        grip: null,
        muzzle: null
    },

    // Combat
    combat: {
        player: {
            baseAttackDamage: 5,
            baseAttackSpeed: 1.0,
            baseAccuracy: 75,
            currentHealth: 100,
            maxHealth: 100
        },
        currentEnemy: null, // or { id, name, currentHealth, maxHealth, ... }
        inCombat: false,
        selectedEnemyId: null,
        waitingForRespawn: false,
        enemyDefeatedAt: null,
        lastAttackTime: 0,
        combatLog: [],
        pendingLoot: [],
        // Stance system
        currentStance: "offensive",  // "offensive" or "defensive"
        lastStanceChange: 0,         // Timestamp of last stance change
        stanceChangeCooldown: 2000,  // 2 second cooldown
        firstStrike: true            // Track first attack for STEALTH bonus
    },

    // World
    currentRegion: "region_0_0",
    regions: {
        [regionId]: {
            discovered: boolean,
            discoveredNodeTypes: [],
            discoveredCraftingStations: [],
            discoveredExitPaths: [],
            visits: number
        }
    },
    activeNavigation: {
        isNavigating: false,
        endurance: 100,
        maxEndurance: 100,
        lastNavigationTick: 0
    },

    // Activities
    currentActivity: null, // "navigation", "nodeCollection", "combat", "crafting"
    nodeCollection: {
        activeNode: null // or { nodeId, currentHealth, maxHealth, ... }
    },

    // Crafting
    crafting: {
        activeCrafts: [
            { recipeId, startTime, completionTime, totalTime }
        ]
    },

    // Missions
    missions: {
        available: [],    // Mission IDs that can be started
        active: [],       // Mission IDs in progress
        completed: [],    // Mission IDs finished
        progress: {
            [missionId]: {
                startedAt: timestamp,
                objectives: {
                    [objectiveId]: {
                        current: number,
                        required: number,
                        completed: boolean
                    }
                }
            }
        }
    },

    // Perk System
    perkGrid: {
        placedMedals: {
            "row_col": { medal: {...}, row, col }
        }
    },
    craftedMedals: [
        { id, name, icon, rarity, tier, perks: [...], craftedAt }
    ],
    medalCrafting: {
        totalCrafted: 0,
        craftedByTier: {},
        craftedByRarity: {}
    },

    // Meta
    gameTime: 0,
    lastSave: Date.now(),
    lastSaveTime: Date.now()  // For offline combat simulation
}
```

---

## Standardizations & Conventions

### Naming Conventions

**Variables:**
- camelCase for all variables
- Descriptive names: `currentEnemy` not `e`
- Booleans start with `is`, `has`, `can`: `isNavigating`, `hasUnlocked`

**Functions:**
- camelCase for functions
- Verbs for actions: `equipItem()`, `startCombat()`, `updateUI()`
- `get` prefix for getters: `getPlayerCombatStats()`
- `calculate` for computations: `calculateDamageMultiplier()`

**Constants:**
- UPPER_SNAKE_CASE: `UPDATE_INTERVAL`, `MAX_CRAFTS`

**Files:**
- camelCase for all files
- System files: `[name]System.js`
- UI files: `[name]UI.js`

### Code Organization

**System Pattern:**
```javascript
const SystemName = {
    init(engine) {
        // Bind all methods to engine
        engine.methodName = this.methodName.bind(engine);
    },

    methodName() {
        // 'this' refers to GameEngine
        // Access state: this.state
        // Access definitions: this.definitions
    }
};
```

**UI Pattern:**
```javascript
const UIModuleName = {
    lastState: null,

    update() {
        // Check if re-render needed
        // Update DOM
        // Cache state
    },

    render() {
        // Build HTML string
        // Return or set innerHTML
    }
};
```

### Bug Fix Methodology

**Standard Bug Fix Process:**

1. **Diagnose Root Cause**
   - Read error stack trace completely
   - Identify exact file and line number
   - Understand what the code is trying to do
   - Check if referenced objects/properties exist

2. **Use Registry System for Data Access (REGISTRY ONLY - NO FALLBACKS)**
   - ✅ **DO**: Use registries exclusively: `NodeRegistry.getAllActive()[nodeId]`, `SkillRegistry.getAllActive()`
   - ✅ **DO**: Trust the registry schema - use exact field names
   - ❌ **DON'T**: Add fallbacks to legacy definitions
   - ❌ **DON'T**: Use `||` operators for old/new field names
   - ❌ **DON'T**: Access `GameEngine.definitions` directly
   - **Pattern**: `const nodeDef = NodeRegistry.getAllActive()[nodeId];`

3. **Registry Schema Fields (Use Exact Names)**
   - Nodes: Use `nodeType`, `requiredSkillLevel` (NOT `skill`, `skillLevel`)
   - Items: Use registry-defined schema fields only
   - Skills: Use registry-defined schema fields only
   - No fallbacks, no legacy compatibility

4. **Validate Before Access**
   - Check if registry entity exists before accessing properties
   - Add null/undefined guards
   - Log errors with context for debugging
   - Example:
   ```javascript
   const nodeDef = NodeRegistry.getAllActive()[nodeId];
   if (!nodeDef) {
       console.error(`❌ Node '${nodeId}' not found in NodeRegistry`);
       return null;
   }
   ```

5. **System Binding Pattern**
   - All system methods must be bound in `init()` method
   - Missing binding causes "is not a function" errors
   - Always check `init()` when adding new methods
   - Example:
   ```javascript
   init(engine) {
       engine.methodName = this.methodName.bind(engine);
   }
   ```

**Recent Fixes Applied:**

*Node Harvesting Skill Check (2025-01-17):*
- **Issue**: `Cannot read properties of undefined (reading 'level')`
- **Root Cause**: Code used `nodeDef.skill` (undefined) - registry uses `nodeDef.nodeType`
- **Fix**: Changed to use exact registry field: `const skillType = nodeDef.nodeType;`
- **File**: `src/systems/nodeCollectionSystem.js:233-234`

*Navigation Path Discovery (2025-01-17):*
- **Issue**: `this.discoverBidirectionalPath is not a function`
- **Root Cause**: Method existed but wasn't bound to GameEngine in NavigationSystem.init()
- **Fix**: Added `engine.discoverBidirectionalPath = this.discoverBidirectionalPath.bind(engine);`
- **File**: `src/systems/navigationSystem.js:23`

*Harvest Stat Calculation (2025-01-17):*
- **Issue**: `[StatCalculator] Unknown stat: undefinedSpeed` (and other "undefined" stats)
- **Root Cause**: Code passed `nodeDef.skill` (undefined) - registry uses `nodeDef.nodeType`
- **Fix**: Changed to use exact registry field: `const skillType = nodeDef.nodeType;`
- **File**: `src/systems/nodeCollectionSystem.js:403`

*Node Registry Lookup (2025-01-17):*
- **Issue**: Node switched from "Riverbed" (correct) to "Copper Vein" (legacy fallback - WRONG)
- **Root Cause**: gameEngine.getNodeDefensiveStats had legacy fallback that accessed wrong data source
- **Fix**: REMOVED all fallbacks - registry only: `const nodeDef = NodeRegistry.getAllActive()[nodeId];`
- **Files**: `src/core/gameEngine.js:1065`, `src/systems/nodeCollectionSystem.js:16-19`

### Item ID Conventions
- lowercase with underscores: `iron_sword`, `crafted_medal_123`
- Prefixes for categories: `perk_`, `medal_`, `resource_`
- Generated IDs: `crafted_medal_${timestamp}_${random}`

### CSS Class Conventions
- Kebab-case: `.enemy-button`, `.bank-item`
- BEM-style for components: `.enemy-button-icon`, `.enemy-button-name`
- State classes: `.active`, `.disabled`, `.equipped`

### Color Palette
```css
/* Backgrounds */
--bg-primary: #1a1a1a;
--bg-secondary: #2a2a2a;
--bg-tertiary: #3a3a3a;

/* Accents */
--accent-primary: #4a9eff;
--accent-gold: #ffd700;
--accent-danger: #f44336;
--accent-success: #4caf50;
--accent-warning: #ff9800;

/* Text */
--text-primary: #e0e0e0;
--text-secondary: #aaa;
--text-muted: #888;
```

### Icon Standards
- Emojis for all icons (cross-platform)
- Standard set:
  - ⚔️ Combat/Weapons
  - 🛡️ Defense/Armor
  - 💰 Gold currency
  - 🏅 Medals currency
  - 📚 Tomes currency
  - 💎 Gems currency
  - 🌟 Character level
  - ⛏️ Mining/Resources
  - 🔨 Crafting

### Number Formatting
**Utility:** `Formatting.formatNumber(n)`
- < 1,000: Show as-is (500)
- < 1M: Show with K (1.5K)
- < 1B: Show with M (1.5M)
- >= 1B: Show with B (1.5B)

**Percentages:**
- Multipliers stored as decimals (0.5 = 50%)
- Display with `(value * 100).toFixed(1) + '%'`
- Type effectiveness: 1.5x shown as "Super Effective"

---

## Future Development Notes

### Planned Features
1. **Character Naming**
   - UI for editing character name
   - Saved in `characterLevel.name`

2. **More Enemy Variety**
   - Current: 4 enemies (all biological)
   - Need: Droid, Airborne, Plated, Insulated enemies
   - Diverse damage types

3. **Cryo and Explosive Weapons**
   - Current: No Cryo or Explosive weapons
   - Design space for future content

4. **Advanced Crafting**
   - Item enhancement system (exists but minimal)
   - Quality tiers
   - Random stat bonuses

5. **Missions/Quests** ✅ ENHANCED
   - Enhanced mission UI with dialogs
   - Quest chains with visual progression
   - Region-based mission requirements
   - Tutorial mission implemented
   - Need more mission content

### Technical Debt & Known Issues

**CRITICAL ISSUES (2025-01-19):**

3. **⚠️ Equipment State Migration**
   - **Status**: FIXED (needs testing)
   - **Issue**: Equipment saved as objects `{itemId: 'x'}` instead of strings `'x'`
   - **Fix**: Enhanced `migrationSystem.js` to auto-convert on load
   - **Test**: Reload page, equip lightPickaxe, test gathering
   - **Priority**: MEDIUM (testing required)

**CLEANUP COMPLETED (2025-01-19):**

4. **✅ Duplicate Registry Files**
   - **Status**: RESOLVED
   - **Action**: Deleted 8 old registry files (kept `_NEW` versions)
   - **Deleted**: `itemRegistry.js`, `enemyRegistry.js`, `missionRegistry.js`, `nodeRegistry.js`, `recipeRegistry.js`, `regionRegistry.js`, `skillRegistry.js`, `materials.js`
   - **Active**: All registries now use `_NEW.js` pattern

5. **✅ Duplicate Scripts**
   - **Status**: RESOLVED
   - **Action**: Deleted entire `scripts/` directory (duplicated `outputs/`)
   - **Result**: Clean directory structure, no competing scripts

**DEPRECATED SYSTEMS:**

6. **🗑️ Old Gathering Systems**
   - **Status**: Being replaced by `gatheringSystem.js`
   - `harvestSystem.js` - Commented out in index.html
   - `restRecoverySystem.js` - Commented out in index.html
   - `miningSystem.js` - Still loaded, will be removed after gathering system works
   - `nodeCollectionSystem.js` - Still loaded, will be removed after gathering system works

**ONGOING:**

7. **Performance**
   - 100ms tick rate
   - State caching helps
   - Monitor as game grows

8. **Documentation Organization**
   - 39+ .md files in root directory
   - Should be organized into `docs/` subdirectories
   - Priority: LOW

### Balance Notes
- Starting strength = 1 → 60 equipment capacity
- Strength = 5 → 100 capacity (enough for heavy armor set)
- Type effectiveness: 1.5x feels good, not too punishing at 0.67x
- Medal power scaling: exponential (1x → 50x across rarities)
- Character level: slow progression (intentional idle game pacing)
- Navigation endurance: Base 100, early game ~115-130 (1-3 attributes)
- Discovery chance: ~30-40% base, scales well with intellect investment

### Recent Changes (v2.0 - 2025-01-19)

**Equipment System Bug Fix:**
- Fixed critical bug where equipment state showed `null` after being set
- Root cause: Old save format stored equipment as objects instead of strings
- Enhanced `migrationSystem.js` with automatic format conversion
- Files modified: `src/systems/migrationSystem.js` (lines 849-915)

**Universal Gathering System Implementation:**
- Created new `gatheringSystem.js` to replace 3-4 competing legacy systems
- Unified system for all 6 gathering skills (mining, logging, fishing, hunting, foraging, thieving)
- Simple flow: Start → Action Tick → Award Resources → Repeat → Stop
- Tool validation, skill level checks, success/miss mechanics
- Files created: `src/systems/gatheringSystem.js` (351 lines), `GATHERING_SYSTEM_TEST.md`
- **Status**: Implemented but needs testing/debugging

**Directory Cleanup:**
- Deleted 10 duplicate/legacy files (8 old registries + duplicate scripts directory)
- Removed: `itemRegistry.js`, `itemRegistryV2.js`, `enemyRegistry.js`, `missionRegistry.js`, `nodeRegistry.js`, `recipeRegistry.js`, `regionRegistry.js`, `skillRegistry.js`, `materials.js`, entire `scripts/` directory
- Updated `index.html` script imports (fixed materials.js path, commented out deprecated systems)
- Result: Clean codebase, no competing scripts, single source of truth

**Registry System Status:**
- All registries now use unified `_NEW.js` pattern
- Active registries: `itemRegistry_NEW.js`, `nodeRegistry_NEW.js`, `enemyRegistry_NEW.js`, `missionRegistry_NEW.js`, `recipeRegistry_NEW.js`, `skillRegistry_NEW.js`, `regionRegistry_NEW.js`
- Old competing versions all deleted

**Known Issues Introduced:**


**Documentation Created:**
- `DIRECTORY_AUDIT.md` - Full audit of directory structure vs. recommended
- `CLEANUP_SCRIPT.md` - Cleanup commands and safe deletion list
- `CLEANUP_COMPLETE.md` - Summary of cleanup actions
- `EQUIPMENT_BUG_FIX.md` - Equipment bug root cause and fix details
- `EQUIPMENT_DEBUG_TEST.md` - Diagnostic tests for equipment issues
- `CURRENT_STATE_SUMMARY.md` - Complete project state for sharing with Claude

### Recent Changes (v1.9 - 2025-01-14)

**Navigation System Cosmetic Improvements:**
- Endurance bar title changes to "💤 Resting" during recovery mode
- Navigation action bar changed from yellow to blue gradient (standardized skill interval bars)
- Current region border changed to blue with glow effect
- Removed START label and biome icon from current region tile
- Added animated footsteps (👣) to current region during active navigation
- Footsteps use staggered fade-in/fade-out animation

**Global Item Consumption Animation System:**
- Created `src/ui/itemConsumptionAnimation.js` for visual feedback when items are consumed
- Items drop from top header and fade over 1.5 seconds
- Shows item icon, quantity consumed, and item name
- Border colors match item categories (green=consumables, orange=resources)
- Integrated with rest recovery system (triggers when food/logs consumed)

**Region Schema Standardization:**
- Created comprehensive region definition schema documentation (`docs/REGION_SCHEMA.md`)
- Standardized region structure with all possible fields:
  - Basic info (name, description, biome, background)
  - Navigation (coordinates, requirements, complication)
  - Discoverable content (nodes, stations, enemies, locations, missions)
  - Experience rates (per discovery type, first-time bonuses)
  - Environmental effects (movement speed, discovery modifiers, hazards)
  - Progression gates (mission requirements, item requirements, level gates)
  - Difficulty ratings (tier, recommended levels)
  - Special features (safe zones, fast travel, settlements, dungeons, resource bonuses)
- Created region definition template (`docs/REGION_TEMPLATE.js`) with examples

**Tilemap Separation:**
- Separated tilemap (which hex tiles exist) from region data (what's in each region)
- Created `src/data/worldTilemap.js` defining the 80-tile landmass shape
- Extracted hardcoded tile exclusions from MapGridSystem into data-driven structure
- WorldTilemap provides methods: `getTiles()`, `hasTile(q, r)`, `getRegionId(q, r)`
- Updated `MapGridSystem.createHexGrid()` to iterate through WorldTilemap tiles
- Updated `generateWorldMap()` to only create regions for tiles in tilemap
- Adjacent region filtering now checks WorldTilemap (only neighbors that exist)
- Regions reduced from 169 (full radius-7 grid) to 80 (actual landmass)

**Developer Tools:**
- Created `dev-tools/exportRegions.html` for exporting procedurally generated regions to static file
- Created `dev-tools/extractTilemap.html` for extracting tilemap from exclusion rules
- Created `dev-tools/countTiles.html` for verifying tilemap tile count
- Export tool updated to use WorldTilemap for region generation

**Technical Debt:**
- Need to resolve region export tool discrepancy (135 vs 80 regions)
- Once resolved, implement dual-mode loading (static + procedural fallback)
- Test both loading methods produce identical results
- Switch to static loading as default, keep procedural as backup

---

### Recent Changes (v1.8)

**Equipment System Redesign:**
- Redesigned equipment UI with horizontal 4-container layout in Equipment Tab
- Added 3 consumable slots: ammo, food (existing), potion
- Added 4 technology slots: tech1-4 (unlocked at 10/25/50/100 intellect)
- Only 3x3 equipment grid provides perk bonuses (consumables and tech slots do not)
- Technology slots require minimum intellect attribute to unlock
- Consumable slots display remaining quantity from bank

**Equipment Component System:**
- Created reusable `equipmentComponent.js` for consistent equipment display
- 4 display modes: full, compact, minimal, horizontal
- Used across Dashboard, Equipment Tab, and Combat View
- Automatic "⚙️ Customize" button appears on gun-type weapons
- Golden ratio proportions for equipment grid (aspect-ratio: 0.618)

**Weapon Build Modal:**
- Complete gun customization system with 6 attachment slots
- Attachment slots: Scope (🔭), Barrel (🔩), Magazine (📋), Stock (📏), Grip (✊), Muzzle (💨)
- Attachments are items with `itemType: 'attachment'` and `attachmentSlot: '<type>'`
- Modal shows weapon preview, stats, and current attachments
- Attachment selection filters bank items by slot type
- Real-time stat updates when attachments change
- Only gun-type weapons can use attachment system (weaponType: 'gun')

**UI Layout Improvements:**
- Equipment Tab uses full viewport width (matches Dashboard layout)
- 4 equal-width containers: Equipment (3x3), Consumables (vertical), Technology (vertical), Summary (stats)
- Consumable slots: green-themed with dashed borders
- Technology slots: cyan-themed with circuit pattern background
- Locked technology slots show 🔒 icon and intellect requirement
- Equipment summary moved to far-right container

**CSS Design System Integration:**
- Equipment components use CSS variables for consistent theming
- Removed inline styles in favor of CSS classes
- Added clickable state for interactive slots
- Optimized spacing and font sizes for horizontal layout
- Container padding and gaps match Dashboard design language

**Save System Updates:**
- Migration for new equipment slots (ammo, potion, tech1-4)
- Migration for weapon attachments state initialization
- Backward compatibility with saves from v1.7 and earlier
- All new slots default to null on migration

**Technical Implementation:**
- Equipment slots categorized by type: equipment, consumable, technology
- Helper methods: `isTechSlotUnlocked()`, `getTechSlotRequirement()`, `getEquipmentSlotType()`
- Tech slot validation in `equipItem()` checks intellect requirement
- Weapon build modal handlers: `openWeaponBuildModal()`, `attachAttachment()`, `renderWeaponAttachments()`
- Attachment availability checked from player's bank inventory

### Recent Changes (v1.7)

**Combat Attribute Enhancements:**
- Enhanced all combat attributes with specific meaningful bonuses
- STRENGTH: +1% reload time reduction for heavy weapons
- HEALTH: +2% auto-eat threshold, +0.5% DOT resistance
- DEFENSE: +0.3% special attack block chance (cap 50%)
- STEALTH: +1% first strike bonus damage, +0.5% enemy accuracy reduction
- PERCEPTION: Already had crit chance
- MOBILITY: Already had dodge chance
- INTELLECT: +0.2% special attack chance, +0.5% consumable efficiency

**Combat Stance System:**
- Added toggleable defensive/offensive stance mechanic
- Defensive stance: +30% damage reduction, +20% block/parry, -40% damage dealt, -25% attack speed
- 2-second cooldown between stance changes
- Visual indicator showing active stance modifiers
- Stance toggle button in combat controls

**Offline Combat Simulation:**
- Full combat simulation when player is away from game
- 8-hour cap on offline time with 70% efficiency penalty
- Viability check ensures player can safely defeat enemy
- Tracks kills, XP, gold, medals, loot, consumables used, deaths
- Beautiful results modal displaying progress summary
- Integrated with save system, runs on game load

**Elite Enemy System (Data Structure):**
- Added comprehensive elite enemy definitions with hooks for future implementation
- 3 elite enemies: elite_scout (bronze), elite_soldier (silver), elite_commander (gold)
- Data structure includes: modifiers, abilities (with triggers/cooldowns), passives, loot enhancements, visual effects, behavior modifications
- Ready for incremental feature implementation

**Critical Bug Fixes:**
- Fixed JavaScript declaration errors with item registry system (const redeclaration issues)
- Fixed missing `combat` variable in `renderActiveCombat()` function
- Fixed `UICore.updateCombat()` calls - changed to `CombatUI.updateCombat()`
- Fixed infinite re-render loops blocking button clicks in combat UI
- Optimized state tracking: health tracked in chunks of 10 HP instead of every point
- Disabled combat log length tracking during active combat (too many re-renders)
- Reduced respawn timer update from 100ms to 1 second intervals

**UI Performance Optimizations:**
- Removed cooldown tracking from state comparison (foodCooldown, stanceCooldown)
- Only track meaningful state changes, not cosmetic timer updates
- Combat UI now only re-renders when significant events occur (health chunks, enemy defeated, etc.)
- Progress bars update separately without triggering full re-renders
- Buttons remain clickable during combat (no more DOM replacement blocking clicks)

**Migration System:**
- Added stance system migration for backward compatibility with old saves
- Ensures all saves have currentStance, lastStanceChange, stanceChangeCooldown properties

### Recent Changes (v1.6)

**Navigation System Overhaul:**
- Replaced region health with endurance-based exploration
- Endurance scales with player attributes (strength + mobility)
- Discovery success based on intellect vs region complication
- Region complication factors based on biome and distance
- Auto-stop when endurance depleted
- Better attribute scaling integration

**Mission System Enhancements:**
- All missions now visible on mission board (including locked)
- Enhanced mission dialog with NPC portraits
- Highlighted rewards sections (items, currencies, XP)
- Unlocks section showing quest progression
- Region requirement display and travel buttons
- Mission-based region gating (blocks travel until complete)
- Tutorial mission provides all gathering tools

**Map Visual Improvements:**
- Color-coded region status (locked, explorable, explored)
- Status badges (partially explored, fully explored, has nodes)
- Mission requirement indicators (red/green badges)
- Current region highlighting
- Legend explaining all indicators

---

## Development Workflow

### Adding a New System
1. Create `src/systems/newSystem.js`
2. Define system object with `init(engine)` method
3. Bind methods to engine in init
4. Add script tag to `index.html` (before gameEngine.js)
5. Call `NewSystem.init(this)` in gameEngine.js init()

### Adding a New UI Module
1. Create `src/ui/newUI.js`
2. Define UI object with update/render methods
3. Add state caching for performance
4. Add script tag to `index.html`
5. Call update method from `uiCore.js` switch statement

### Adding New Items
1. Edit `src/core/definitions.js`
2. Add to `items` object with all required properties
3. Set `defaultTab` for bank categorization
4. Add `equipSlot` if equipment (weapon, helmet, back, gloves, chest, neck, boots, legs, ring, ammo, food, potion, tech1-4)
5. Add `stats` object with bonuses
6. Add `weight` for equipment
7. Add `damageType` for weapons
8. Add `armorRatings` for armor
9. For attachments: set `itemType: 'attachment'` and `attachmentSlot: '<type>'` (scope, barrel, magazine, stock, grip, muzzle)
10. For guns: set `weaponType: 'gun'` to enable customization button

### Using Equipment Component
**When to use:**
- Displaying equipment across multiple UI locations
- Need consistent equipment layout and styling

**Component modes:**
```javascript
// Full mode - all slots + stats (Equipment Tab)
EquipmentComponent.render({ mode: 'horizontal', showLabels: true, interactive: true })

// Compact mode - equipment + consumables (Dashboard, Combat)
EquipmentComponent.render({ mode: 'compact', showLabels: false, interactive: true })

// Minimal mode - equipment grid only
EquipmentComponent.render({ mode: 'minimal', showLabels: true, interactive: true })
```

**Component handles:**
- Rendering 3x3 equipment grid
- Consumable slots with quantity display
- Technology slots with unlock requirements
- Equipment summary stats
- Interactive click handlers for equipment modal
- Customize button for gun-type weapons

### Testing Checklist
- [ ] Save/load works (test with localStorage)
- [ ] Migration doesn't break old saves
- [ ] UI updates correctly (no console errors)
- [ ] State changes trigger re-renders
- [ ] Performance acceptable (no lag)
- [ ] Cross-browser compatible (emojis render)

---

## Glossary

**Game Loop** - Main tick function that runs every 100ms, updates all active systems

**State Caching** - Storing previous UI state to compare against current state, only re-rendering if different

**Type Effectiveness** - Damage multiplier system based on attack type vs defense type matchups

**Perk Grid** - 5x5 grid where medals are placed to gain permanent stat multipliers

**Medal** - Craftable item with random perks, placed on perk grid for bonuses

**Bank** - Main inventory system with 11 categorized tabs

**Node** - Gatherable resource point in the world (ore, trees, fish, etc.)

**Hex** - Hexagonal world tile, each with a biome and discoveries

**Migration** - Code that updates old save files to new format when game structure changes

**System** - Self-contained module that handles one aspect of game (combat, crafting, etc.)

---

## Quick Reference

### Common Tasks

**Add debug item to bank:**
```javascript
GameEngine.addItemToBank('iron_sword', 1);
```

**Check player stats:**
```javascript
GameEngine.getPlayerCombatStats();
```

**Check equipment weight:**
```javascript
GameEngine.getTotalEquippedWeight(); // Current
GameEngine.getMaxEquipmentWeight();  // Max based on strength
```

**Get type effectiveness:**
```javascript
GameEngine.calculateDamageMultiplier('pierce', 'plated'); // Returns 0.67 (weak)
GameEngine.calculateDamageMultiplier('explosive', 'plated'); // Returns 1.5 (strong)
```

**Force save:**
```javascript
saveGame();
```

**Check save version:**
```javascript
const save = JSON.parse(localStorage.getItem('idleRPG_save'));
console.log(save.version);
```

**Check tech slot unlock status:**
```javascript
GameEngine.isTechSlotUnlocked('tech1'); // Returns true if intellect >= 10
GameEngine.getTechSlotRequirement('tech2'); // Returns 25
```

**Get equipment slot type:**
```javascript
GameEngine.getEquipmentSlotType('weapon'); // Returns 'equipment'
GameEngine.getEquipmentSlotType('ammo'); // Returns 'consumable'
GameEngine.getEquipmentSlotType('tech1'); // Returns 'technology'
```

**Open weapon build modal:**
```javascript
openWeaponBuildModal(); // Opens if gun equipped, shows alert otherwise
```

**Attach weapon attachment:**
```javascript
attachAttachment('scope', 'red_dot_sight'); // Attach item to slot
attachAttachment('barrel', null); // Remove attachment from slot
```

---

**End of Context Document**
