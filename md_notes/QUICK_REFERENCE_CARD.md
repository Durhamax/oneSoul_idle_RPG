# OneSoul Idle RPG - Quick Reference Card

## 📍 Foundation Documents Location
```
project/
├── FOUNDATION_SPECIFICATION.md  # Architecture & standards
├── IMPLEMENTATION_GUIDE.md       # Examples & migration
├── CURRENT_STATE_SUMMARY.md     # Current issues/status
└── CLAUDE_CODE_TEMPLATE.md      # How to instruct Claude Code
```

## 🚨 Current Critical Issues
1. **Navigation UI** - Blank display (HIGH PRIORITY)
2. **Gathering System** - Nodes show depleted (HIGH PRIORITY)
3. **Equipment Migration** - Needs testing

## ✅ Working Systems (Use as Reference)
- CombatSystem
- EquipmentSystem
- CraftingSystem
- PerkGridSystem

## 🏗️ Correct Patterns

### Registry Access
```javascript
// ✅ RIGHT
const item = ItemRegistry.get(itemId);

// ❌ WRONG
const item = GameDefinitions.items[itemId];
const item = definitions.items[itemId];
```

### System Communication
```javascript
// ✅ RIGHT
EventBus.emit('gold-added', { amount: 100 });

// ❌ WRONG
CurrencySystem.addGold(100);  // Direct call
```

### State Mutation
```javascript
// ✅ RIGHT (in a system method)
this.state.currencies.gold += amount;
EventBus.emit('currency-changed', { gold: this.state.currencies.gold });

// ❌ WRONG (anywhere)
GameEngine.state.currencies.gold += 100;
```

### Error Handling
```javascript
// ✅ ALWAYS check registry lookups
const entity = Registry.get(id);
if (!entity) {
    console.error(`[SystemName] Entity not found: ${id}`);
    return null;
}
```

## 🔧 Debug Commands

```javascript
// Check what's loaded
console.log('Registries:', Object.keys(window).filter(k => k.includes('Registry')));
console.log('State:', GameEngine.state);
console.log('Systems:', GameEngine.systems);

// Test specific systems
GatheringSystem.startGathering('iron_ore');
CombatSystem.startCombat('goblin');
NavigationSystem.travelToRegion('region_1_0');

// Check registry contents
console.table(ItemRegistry.getStatistics());
console.log('Active items:', Object.keys(ItemRegistry.getActive()).length);

// Performance check
console.time('tick'); GameEngine.tick(); console.timeEnd('tick');

// Validate implementation
validateImplementation();  // If function exists
```

## 📁 Directory Quick Map

```
src/
├── core/          # Engine only (NO game logic)
├── registries/    # ALL game data
├── systems/       # Game logic (stateless)
├── ui/           # Presentation only
├── utils/        # Pure functions
└── migrations/   # Save compatibility
```

## 🎯 Add New Content Checklist

1. [ ] Create Schema
2. [ ] Create Registry (extends BaseRegistry)
3. [ ] Add production data
4. [ ] Create/Update System
5. [ ] Create/Update UI View
6. [ ] Add tests
7. [ ] Update index.html load order

## ⚡ Performance Targets

| Operation | Target | Critical |
|-----------|--------|----------|
| Tick | <10ms | <20ms |
| UI Render | <16ms | <33ms |
| Registry Lookup | <1ms | <5ms |
| Save | <100ms | <500ms |

## 🐛 Fix Priority Order

1. **Navigation UI** (can't play without it)
2. **Gathering System** (core gameplay loop)
3. **Test Equipment Migration**
4. Complete remaining registry migrations
5. Implement EventBus
6. Refactor to stateless systems
7. Excel pipeline
8. PWA setup

## 📋 Testing Checklist

Before ANY commit:
- [ ] No console errors
- [ ] Follows FOUNDATION_SPECIFICATION.md
- [ ] Performance budget met
- [ ] Save/load works
- [ ] Mobile responsive

## 🔴 Never Do This

```javascript
// Direct state mutation outside systems
GameEngine.state.anything = value;

// Registry bypass
definitions.items[id]

// System coupling
SystemA.callSystemB()

// Sync file operations
fs.readFileSync()

// Global variables
window.myVar = value;

// UI driving logic
onclick="GameEngine.state++"
```

## 🟢 Always Do This

```javascript
// State changes in systems
this.state.field = value;

// Registry methods
Registry.get(id);

// Event communication
EventBus.emit('event', data);

// Async operations
await loadData();

// Namespaced state
GameEngine.state.module.field;

// UI reflects state
render(state);
```

## 💬 Claude Code Prompt Start

```
MANDATORY: Read FOUNDATION_SPECIFICATION.md first.
Task: [Your task here]
Follow the patterns EXACTLY as specified.
Test with the commands in Quick Reference Card.
```

---

Keep this card open while developing. When in doubt, check FOUNDATION_SPECIFICATION.md.
