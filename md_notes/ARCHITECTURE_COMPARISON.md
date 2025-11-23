# Architecture Comparison: NodeCollectionSystem vs GatheringSystem

**Date**: 2025-01-20
**Status**: Analysis Complete

## Executive Summary

Currently, the game uses **NodeCollectionSystem** for harvesting, but **GatheringSystem** exists as a cleaner, more foundation-spec-compliant alternative. This document compares both systems and provides a migration path.

---

## System Comparison

### NodeCollectionSystem (Currently Active)

**Location**: `src/systems/nodeCollectionSystem.js`
**Lines**: ~650 lines
**Status**: ⚠️ Violates Foundation Specs

#### Architecture Issues:
1. **Monolithic methods** - `completeNodeHarvest()` is 200+ lines
2. **Direct state mutations** - Mutates `this.state` directly
3. **Mixed responsibilities** - Handles UI, events, state, AND game logic
4. **Tightly coupled** - Hard dependencies on NodeRegistry, StatCalculator
5. **No EventBus-only communication** - Direct method calls everywhere

#### What It Does Well:
- ✅ Works with StatCalculator for combat-like harvest calculations
- ✅ Uses node defensive stats (evasion, resistance)
- ✅ Comprehensive loot system (normalLoot + rareLoot)
- ✅ Node depletion and respawn mechanics
- ✅ Critical harvests and rare drops
- ✅ Compatibility layer for old/new node formats

#### Current State:
```javascript
// Example of problematic structure:
completeNodeHarvest() {
    // 200+ lines of:
    // - Stat calculations
    // - Success/failure logic
    // - Loot rolling
    // - XP awarding
    // - State mutations
    // - UI updates
    // - Event emissions
}
```

---

### GatheringSystem (Unused Alternative)

**Location**: `src/systems/gatheringSystem.js`
**Lines**: ~575 lines
**Status**: ✅ Foundation Spec Compliant

#### Architecture Strengths:
1. **Single responsibility** - Each method does ONE thing
2. **EventBus-only** - Emits events, doesn't call UI directly
3. **Clear separation** - Validation → Execution → Feedback
4. **Endurance system** - Built-in stamina mechanics
5. **Tool-based gathering** - Requires equipped tools with skill property

#### What It Does Well:
- ✅ Clean separation of concerns
- ✅ EventBus-driven architecture
- ✅ Endurance/stamina system for engaging gameplay
- ✅ Tool requirement validation
- ✅ Session tracking (totalActions, totalResources, totalXP)
- ✅ Recovery mode when out of endurance

#### Current State:
```javascript
// Example of clean structure:
startGathering(skill, nodeId) {
    const validation = this.canStartGathering(skill, nodeId);
    if (!validation.canStart) return false;

    // Create session
    this.state.gatheringSession = { ... };

    // Emit event
    EventBus.emit('gathering-started', { ... });

    return true;
}

performGatheringAction(nodeDef, toolDef, playerSkill) {
    const didSucceed = this.calculateSuccessChance(...);
    if (didSucceed) {
        const resources = this.rollResources(...);
        // Award resources and XP
        EventBus.emit('gathering-success', { ... });
    } else {
        EventBus.emit('gathering-miss');
    }
}
```

---

## Feature Comparison Matrix

| Feature | NodeCollectionSystem | GatheringSystem | Winner |
|---------|---------------------|----------------|--------|
| **Foundation Spec Compliance** | ❌ Violates | ✅ Follows | GatheringSystem |
| **Code Complexity** | ❌ High (200+ line methods) | ✅ Low (20-40 line methods) | GatheringSystem |
| **State Management** | ❌ Direct mutations | ✅ Clean mutations | GatheringSystem |
| **EventBus Usage** | ⚠️ Partial | ✅ Full | GatheringSystem |
| **Stat Calculations** | ✅ StatCalculator integration | ⚠️ Simple formulas | NodeCollectionSystem |
| **Node Defensive Stats** | ✅ Evasion, resistance, crit | ❌ Not implemented | NodeCollectionSystem |
| **Loot System** | ✅ Normal + Rare loot tables | ⚠️ Basic resourceTable | NodeCollectionSystem |
| **Critical Harvests** | ✅ Full system | ❌ Not implemented | NodeCollectionSystem |
| **Node Depletion** | ✅ Depletion + respawn | ❌ Not implemented | NodeCollectionSystem |
| **Endurance System** | ❌ Not implemented | ✅ Full stamina system | GatheringSystem |
| **Tool Requirements** | ❌ Not checked | ✅ Tool validation | GatheringSystem |
| **Session Tracking** | ⚠️ Partial | ✅ Comprehensive | GatheringSystem |

---

## Key Differences

### 1. Combat-Style vs. Tool-Based

**NodeCollectionSystem**: Treats harvesting like combat
- Player stats vs node defensive stats
- Hit chance vs evasion
- Critical hits, rare drops
- Feels like attacking a resource node

**GatheringSystem**: Treats harvesting as a profession
- Tool proficiency system
- Endurance/stamina management
- Success based on tool quality + skill level
- Feels like using a tool to gather

### 2. State Structure

**NodeCollectionSystem**:
```javascript
state.nodeCollection = {
    activeNode: {
        nodeId: "riverbed",
        startTime: Date.now(),
        harvestTime: 5000
    }
}
```

**GatheringSystem**:
```javascript
state.gatheringSession = {
    skill: "mining",
    nodeId: "riverbed",
    toolId: "iron_pickaxe",
    totalActions: 42,
    totalResources: { "clay": 15, "flint": 8 },
    totalXP: 250,
    endurance: 75,
    maxEndurance: 150,
    isRecovering: false
}
```

### 3. Calculation Philosophy

**NodeCollectionSystem**: Uses StatCalculator
```javascript
const harvestCalc = StatCalculator.calculateHarvestVsNode(skillType, nodeId);
// Returns: {player, node, effective}
// Effective = player stats - node defenses
```

**GatheringSystem**: Uses local formulas
```javascript
let baseChance = 0.7; // 70% base
baseChance += toolBonus;
baseChance += skillLevel * 0.01;
baseChance -= levelDiff * 0.05;
```

---

## Migration Path

### Option 1: Keep NodeCollectionSystem (Current)

**Pros**:
- Already working
- Integrated with StatCalculator
- Combat-like feel is engaging
- Full feature set

**Cons**:
- Violates foundation specs
- Hard to maintain
- Mixed responsibilities
- No tool system
- No endurance system

**Effort**: 0 days (no changes)

---

### Option 2: Migrate to GatheringSystem

**Pros**:
- Foundation spec compliant
- Clean architecture
- Endurance adds depth
- Tool system is immersive
- Easier to maintain

**Cons**:
- Need to migrate stat calculations
- Need to add node defensive stats
- Need to add critical/rare systems
- Need to add depletion/respawn
- Need to rewrite UI integration

**Effort**: 3-5 days

#### Migration Steps:
1. Add StatCalculator integration to GatheringSystem
2. Port node defensive stats logic
3. Port critical harvest system
4. Port rare drop system
5. Add node depletion/respawn
6. Update UI to listen to gatheringSession events
7. Test all 6 gathering skills
8. Deprecate NodeCollectionSystem

---

### Option 3: Hybrid Approach (Recommended)

**Refactor NodeCollectionSystem to follow GatheringSystem patterns**

**Pros**:
- Keep existing features (stats, crits, rares, depletion)
- Improve architecture gradually
- Foundation spec compliant
- Add tool system and endurance
- Minimal user-facing changes

**Cons**:
- Takes time to refactor
- Need careful testing

**Effort**: 2-3 days

#### Refactor Steps:
1. **Extract methods** - Break 200-line methods into 20-line methods
2. **Add StateManager** - Centralize state mutations
3. **Pure EventBus** - Remove all direct UI calls
4. **Add tool validation** - Require tools like GatheringSystem
5. **Add endurance system** - Port from GatheringSystem
6. **Add session tracking** - Port from GatheringSystem
7. **Test thoroughly** - Ensure all features still work

---

## Recommendation

**Proceed with Option 3: Hybrid Approach**

### Rationale:
1. Keeps all working features (stats, crits, depletion)
2. Improves architecture to follow foundation specs
3. Adds engaging mechanics (tools, endurance)
4. Lower risk than full rewrite
5. Can be done incrementally

### Phase 1: Foundation Spec Compliance (1 day)
- Extract methods (break apart completeNodeHarvest)
- Add StateManager pattern
- Convert to pure EventBus communication

### Phase 2: Feature Additions (1-2 days)
- Add tool requirement system from GatheringSystem
- Add endurance system from GatheringSystem
- Add session tracking from GatheringSystem

### Phase 3: Testing & Polish (0.5 day)
- Test all 6 gathering skills
- Update documentation
- Remove debug logs

---

## Next Steps

1. **Get user approval** for Option 3 (Hybrid Approach)
2. **Create detailed refactor plan** with specific code changes
3. **Implement Phase 1** (Foundation Spec Compliance)
4. **Test Phase 1** before proceeding
5. **Implement Phase 2** (Feature Additions)
6. **Final testing and deployment**

---

## Conclusion

NodeCollectionSystem works but violates foundation specs. GatheringSystem is cleaner but lacks features. The best path forward is to **refactor NodeCollectionSystem using GatheringSystem patterns** while keeping the StatCalculator integration and combat-like mechanics that make harvesting engaging.

This gives us:
- ✅ Foundation spec compliance
- ✅ All current features (stats, crits, rares, depletion)
- ✅ New features (tools, endurance, session tracking)
- ✅ Better maintainability
- ✅ Lower risk than full rewrite
