# OneSoul Idle RPG - Foundation Specification Document

**Version**: 1.0
**Date**: 2025-01-19
**Status**: AUTHORITATIVE
**Purpose**: This document defines the canonical architecture, patterns, and guidelines for OneSoul Idle RPG development. All code changes MUST conform to these specifications.

---

## 🎯 Core Development Principles

### Mandatory Rules
1. **Single Source of Truth**: Each piece of data has ONE authoritative location
2. **Registry Pattern**: ALL game data uses the registry pattern - NO EXCEPTIONS
3. **Clean Before Scale**: Fix technical debt before adding features
4. **Test Before Deploy**: Every system must be testable in isolation
5. **Mobile-First Design**: Every UI component must work on touch devices
6. **Performance Budget**: Main tick() must complete in <10ms

### Development Philosophy
- **Systematic Implementation**: Build foundations, then features, then content
- **Modular Architecture**: Each system is independent and replaceable
- **State-Driven UI**: UI reflects state, never drives it
- **Progressive Enhancement**: Core game works offline, enhanced features when online

---

## 📁 Authoritative Directory Structure

```
oneSoul_idle_RPG/
│
├── index.html                    # Main entry point, SCRIPT LOADER ONLY (no inline CSS/JS)
├── manifest.json                 # PWA manifest
├── service-worker.js            # Offline capability
├── package.json                 # Dependencies
├── server.js                    # Development server
├── README.md                    # Project overview
│
├── assets/                      # Static assets
│   ├── backgrounds/            # Background images (WebP format preferred)
│   ├── icons/                  # Game icons and sprites
│   ├── audio/                  # Sound effects and music
│   └── fonts/                  # Custom fonts
│
├── src/
│   ├── core/                   # Core engine (NO GAME LOGIC)
│   │   ├── gameEngine.js       # Main coordinator, tick loop
│   │   ├── BaseRegistry.js     # Base class for all registries
│   │   ├── RegistryManager.js  # Central registry coordinator
│   │   ├── StateManager.js     # State mutations and validation
│   │   ├── EventBus.js         # System communication
│   │   └── definitions.js      # DEPRECATED - Remove after migration
│   │
│   ├── registries/             # ALL game data registries
│   │   ├── items/
│   │   │   ├── ItemRegistry.js
│   │   │   ├── ItemSchema.js
│   │   │   ├── ItemValidator.js
│   │   │   └── data/
│   │   │       ├── production.js
│   │   │       ├── development.js
│   │   │       └── test.js
│   │   ├── nodes/
│   │   ├── enemies/
│   │   ├── recipes/
│   │   ├── missions/
│   │   ├── regions/
│   │   ├── skills/
│   │   └── [other registries follow same pattern]
│   │
│   ├── systems/                # Game systems (LOGIC ONLY, NO UI)
│   │   ├── gathering/
│   │   │   ├── GatheringSystem.js      # Universal gathering
│   │   │   ├── MiningExtension.js      # Mining-specific
│   │   │   ├── LoggingExtension.js     # Logging-specific
│   │   │   └── [other gathering extensions]
│   │   ├── combat/
│   │   │   ├── CombatSystem.js
│   │   │   ├── OfflineCombat.js
│   │   │   └── TypeEffectiveness.js
│   │   ├── crafting/
│   │   │   ├── CraftingSystem.js
│   │   │   ├── EnhancementSystem.js
│   │   │   └── EngineeringSystem.js
│   │   ├── progression/
│   │   │   ├── SkillSystem.js
│   │   │   ├── AttributeSystem.js
│   │   │   └── PerkGridSystem.js
│   │   ├── world/
│   │   │   ├── NavigationSystem.js
│   │   │   ├── RegionSystem.js
│   │   │   └── MapGenerator.js
│   │   └── economy/
│   │       ├── BankSystem.js
│   │       ├── CurrencySystem.js
│   │       └── MarketSystem.js
│   │
│   ├── ui/                     # UI components (PRESENTATION ONLY)
│   │   ├── styles/             # ALL CSS FILES (no inline CSS in index.html)
│   │   │   ├── design-system.css       # Color palette, typography, spacing
│   │   │   ├── global.css              # Reset, base styles, buttons
│   │   │   ├── layout.css              # Header, sidebar, grid layouts
│   │   │   ├── components.css          # Reusable UI components
│   │   │   ├── modals.css              # All modal styles
│   │   │   ├── animations.css          # Transitions and animations
│   │   │   └── views/                  # View-specific styles
│   │   │       ├── combat.css
│   │   │       ├── equipment.css
│   │   │       ├── skills.css
│   │   │       └── [other view styles]
│   │   ├── core/
│   │   │   ├── UICore.js               # Main UI coordinator
│   │   │   ├── UIComponent.js          # Base UI class
│   │   │   └── UIStateCache.js         # Performance optimization
│   │   ├── views/
│   │   │   ├── NavigationView.js
│   │   │   ├── CombatView.js
│   │   │   ├── GatheringView.js
│   │   │   ├── CraftingView.js
│   │   │   ├── EquipmentView.js
│   │   │   └── [other views]
│   │   ├── components/
│   │   │   ├── EquipmentGrid.js
│   │   │   ├── ProgressBar.js
│   │   │   ├── ItemTooltip.js
│   │   │   └── [reusable components]
│   │   └── modals/
│   │       ├── ItemModal.js
│   │       ├── CraftingModal.js
│   │       └── [other modals]
│   │
│   ├── utils/                  # Utility functions (PURE FUNCTIONS)
│   │   ├── formatting.js       # Number/time formatting
│   │   ├── validation.js       # Data validation
│   │   ├── calculations.js     # Game formulas
│   │   └── random.js           # RNG utilities
│   │
│   └── migrations/             # Save file migrations
│       ├── MigrationSystem.js
│       └── migrations/
│           ├── v1_to_v2.js
│           └── [version migrations]
│
├── data/                       # Static data files
│   ├── excel/                  # Excel templates for content
│   ├── json/                   # Generated JSON from Excel
│   └── schemas/                # Data structure schemas
│
├── tools/                      # Development tools
│   ├── excel-pipeline/         # Excel to JS conversion
│   ├── validators/             # Data validation tools
│   ├── generators/             # Code generation
│   └── analyzers/              # Code analysis
│
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── docs/                       # Documentation
│   ├── architecture/           # System architecture
│   ├── guides/                 # Development guides
│   ├── api/                    # API documentation
│   └── decisions/              # Architecture decisions
│
└── dist/                       # Production build output
    └── [generated files]
```

---

## 🏗️ System Architecture Layers

### Layer 1: Core Engine
**Location**: `src/core/`
**Purpose**: Orchestration and infrastructure
**Rules**:
- NO game logic
- NO direct state mutations
- ONLY coordination and infrastructure

```javascript
// gameEngine.js structure
const GameEngine = {
    state: {},           // Centralized state
    systems: {},         // System registry
    registries: {},      // Data registries
    
    init() {
        // Initialize in this order:
        // 1. State
        // 2. Registries
        // 3. Systems
        // 4. UI
    },
    
    tick() {
        // 100ms tick rate
        // Call system updates in dependency order
        // Emit events for state changes
    }
};
```

### Layer 2: Data Registries
**Location**: `src/registries/`
**Purpose**: Authoritative data source
**Rules**:
- Extends BaseRegistry
- Includes schema validation
- Supports environments (production/dev/test)
- NO logic, only data

```javascript
// Standard Registry Pattern
class EntityRegistry extends BaseRegistry {
    constructor() {
        super();
        this.schema = EntitySchema;
        this.validator = EntityValidator;
    }
    
    // Required methods:
    validateEntity(entity) { }
    getByTier(tier) { }
    getByLevel(level) { }
    getActive() { }
}
```

### Layer 3: Game Systems
**Location**: `src/systems/`
**Purpose**: Game logic and mechanics
**Rules**:
- Stateless (state passed in, not stored)
- Testable in isolation
- Communicate via EventBus
- Single responsibility

```javascript
// Standard System Pattern
const SystemName = {
    init(engine) {
        // Bind methods
        engine.systemMethod = this.systemMethod.bind(engine);
        
        // Register event handlers
        EventBus.on('event', this.handleEvent);
    },
    
    update(state, deltaTime) {
        // Process logic
        // Return state mutations
        return mutations;
    },
    
    // System-specific methods
    systemMethod() {
        // Access state via 'this.state'
        // Use registries via 'this.registries'
        // Emit events via EventBus
    }
};
```

### Layer 4: UI Components
**Location**: `src/ui/`
**Purpose**: Presentation layer
**Rules**:
- State-driven (reflects state, doesn't modify it)
- Cached rendering (only update on state change)
- Component-based architecture
- Mobile-first responsive

```javascript
// Standard UI Component Pattern
class UIComponent {
    constructor() {
        this.lastState = null;
        this.element = null;
    }
    
    shouldUpdate(newState) {
        // Compare with cached state
        return JSON.stringify(newState) !== this.lastState;
    }
    
    render(state) {
        if (!this.shouldUpdate(state)) return;
        
        // Render logic
        this.lastState = JSON.stringify(state);
    }
}
```

---

## 📐 Data Flow Architecture

### State Management Flow
```
User Input → UI Event → System Method → State Mutation → Registry Update → UI Render
                ↓                              ↓
           EventBus ← ← ← ← ← ← ← ← ← State Change Event
```

### Registry Data Flow
```
Excel Data → Validation → Registry → State → System → UI
     ↓                        ↑
OneDrive ← ← ← ← ← ← ← Schema
```

### System Communication Pattern
```javascript
// CORRECT: Via EventBus
EventBus.emit('resource-collected', { type: 'iron', amount: 5 });

// WRONG: Direct system calls
MiningSystem.collectResource('iron', 5);
```

---

## 🔧 Implementation Standards

### Naming Conventions
```javascript
// Files
systemName.js          // Systems: camelCase
ComponentName.js       // Components: PascalCase
utilityName.js        // Utilities: camelCase

// Variables
const isActive = true;     // Booleans: is/has/can prefix
const playerLevel = 1;     // Variables: descriptive camelCase
const MAX_LEVEL = 100;     // Constants: UPPER_SNAKE_CASE

// Functions
function calculateDamage() { }  // Actions: verb prefix
function getPlayerStats() { }   // Getters: get prefix
function validateInput() { }    // Validation: validate prefix
```

### Error Handling Pattern
```javascript
// All registry lookups
const item = ItemRegistry.get(itemId);
if (!item) {
    console.error(`[ItemRegistry] Item not found: ${itemId}`);
    return null;
}

// All system operations
try {
    const result = await systemOperation();
    return result;
} catch (error) {
    console.error(`[SystemName] Operation failed:`, error);
    EventBus.emit('system-error', { system: 'SystemName', error });
    return null;
}
```

### Performance Requirements
- Main tick: <10ms execution
- UI updates: <16ms (60fps)
- State cache comparison: <1ms
- Registry lookups: O(1) via hash maps
- Save operation: <100ms

---

## 🔄 Migration Path

### Phase 1: Foundation (CURRENT)
1. Fix Navigation UI (CRITICAL)
2. Fix Gathering System (CRITICAL)
3. Complete registry migrations
4. Remove definitions.js dependency

### Phase 2: Restructure
1. Move files to new directory structure
2. Implement EventBus
3. Refactor systems to stateless pattern
4. Create UI component base classes

### Phase 3: Enhancement
1. Excel pipeline implementation
2. PWA setup
3. Offline capability
4. Performance optimization

### Phase 4: Scale
1. Content expansion
2. Endgame systems
3. Mobile deployment
4. Cloud save sync

---

## ✅ Testing Requirements

### Unit Test Coverage
- Registries: 100% coverage
- Systems: 90% coverage
- Utilities: 100% coverage
- UI Components: 70% coverage

### Integration Tests
```javascript
// Every system must have:
describe('SystemName', () => {
    it('initializes without errors', () => {});
    it('processes tick without errors', () => {});
    it('handles edge cases gracefully', () => {});
    it('integrates with required registries', () => {});
});
```

### Performance Tests
- Tick rate consistency
- Memory leak detection
- State mutation efficiency
- UI render optimization

---

## 📱 Mobile/PWA Requirements

### Touch Targets
- Minimum size: 44x44px
- Spacing: 8px minimum between targets
- Visual feedback on touch

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### PWA Checklist
- [ ] manifest.json with all required fields
- [ ] Service worker with offline strategy
- [ ] App icons (192x192, 512x512)
- [ ] Splash screens
- [ ] Install prompt handler
- [ ] Offline state handling

---

## 🚫 Anti-Patterns to Avoid

### NEVER DO:
```javascript
// ❌ Direct state mutation
GameEngine.state.gold += 100;

// ❌ Registry bypass
const item = definitions.items[itemId];

// ❌ System coupling
CombatSystem.callMiningSystem();

// ❌ UI driving logic
onclick="GameEngine.state.level++"

// ❌ Synchronous file operations
const data = fs.readFileSync('data.json');

// ❌ Global variables
window.playerGold = 100;
```

### ALWAYS DO:
```javascript
// ✅ State mutations via systems
CurrencySystem.addGold(100);

// ✅ Registry usage
const item = ItemRegistry.get(itemId);

// ✅ Event-based communication
EventBus.emit('resource-needed', { type: 'iron' });

// ✅ UI reflects state
<div>{state.player.gold}</div>

// ✅ Async operations
const data = await loadData('data.json');

// ✅ Namespaced state
GameEngine.state.currencies.gold = 100;
```

---

## 🔍 Code Review Checklist

Before any commit:
- [ ] Follows directory structure
- [ ] Uses registry pattern for data
- [ ] Systems are stateless
- [ ] UI components are state-driven
- [ ] Includes error handling
- [ ] Has unit tests
- [ ] Performance budget met
- [ ] Mobile-responsive
- [ ] No anti-patterns

---

## 📋 Quick Reference

### Adding New Content
1. Create schema in `src/registries/{type}/Schema.js`
2. Create registry extending BaseRegistry
3. Add data to `data/production.js`
4. Create system in `src/systems/`
5. Create UI view in `src/ui/views/`
6. Add tests in `tests/unit/`

### Debugging Checklist
1. Check browser console for errors
2. Verify registry has data: `Registry.getActive()`
3. Check state: `GameEngine.state`
4. Verify system initialized: `GameEngine.systems`
5. Check event bus: `EventBus.listeners`

### Performance Optimization
1. Profile with Chrome DevTools
2. Check tick execution time
3. Identify slow registry lookups
4. Optimize UI render cycles
5. Reduce state comparison overhead

---

## 📝 Document Maintenance

This document is the SINGLE SOURCE OF TRUTH for:
- Project structure
- Architecture patterns
- Coding standards
- Development workflow

Any deviations must be:
1. Discussed and approved
2. Documented with rationale
3. Updated in this specification

Last Review: 2025-01-19
Next Review: 2025-02-01

---

## 🤖 Claude Code Instructions

When implementing ANY feature:
1. **READ THIS ENTIRE DOCUMENT FIRST**
2. Follow the directory structure EXACTLY
3. Use the specified patterns WITHOUT DEVIATION
4. Test according to requirements
5. Handle errors as specified
6. Maintain performance budgets

If unclear about implementation:
- Reference existing working systems (Combat, Equipment)
- Check this specification
- Ask for clarification rather than assume

This specification supersedes any conflicting code patterns in the existing codebase.
