# NodeCollectionSystem Refactor Plan

## Phase 1: Extract Methods from completeNodeHarvest()

### Current Structure (200+ lines):
```
completeNodeHarvest() {
    // Compatibility layer
    // Get node state
    // Calculate stats
    // Check success
    // Check critical
    // Check rare
    // Roll loot
    // Apply multipliers
    // Award XP
    // Decrement harvests
    // Check depletion
    // Start next harvest
}
```

### Target Structure (20-40 line methods):

```javascript
completeNodeHarvest() {
    const {nodeDef, nodeState, activeNode} = this._validateHarvestState();
    if (!nodeDef || !nodeState) return;

    const harvestCalc = StatCalculator.calculateHarvestVsNode(nodeDef.nodeType, activeNode.nodeId);

    // Check success
    if (!this._checkHarvestSuccess(harvestCalc.effective, nodeDef, activeNode)) {
        return; // Miss - try again
    }

    // Roll modifiers
    const modifiers = this._rollHarvestModifiers(harvestCalc.effective);

    // Award loot
    const rewards = this._rollAndAwardLoot(nodeDef, modifiers);

    // Award XP
    this._awardExperience(nodeDef, modifiers.isCritical);

    // Update node state
    this._decrementNodeHealth(nodeState);

    // Log success
    this._logHarvestSuccess(nodeDef, rewards, nodeState);

    // Handle depletion or continue
    if (nodeState.harvestsRemaining <= 0) {
        this._handleNodeDepletion(nodeState, nodeDef, activeNode);
    } else {
        this._scheduleNextHarvest(activeNode, harvestCalc.effective);
    }
}

// Extracted methods (each 10-30 lines):
_validateHarvestState()
_checkHarvestSuccess(effective, nodeDef, activeNode)
_rollHarvestModifiers(effective)
_rollAndAwardLoot(nodeDef, modifiers)
_awardExperience(nodeDef, isCritical)
_decrementNodeHealth(nodeState)
_logHarvestSuccess(nodeDef, rewards, nodeState)
_handleNodeDepletion(nodeState, nodeDef, activeNode)
_scheduleNextHarvest(activeNode, effective)
```

### Benefits:
- ✅ Each method has single responsibility
- ✅ Easy to test individual pieces
- ✅ Easy to understand flow
- ✅ Easy to modify without breaking other parts
- ✅ Foundation spec compliant

### Implementation Order:
1. Create all new private methods (prefixed with _)
2. Test each method individually
3. Refactor completeNodeHarvest() to call them
4. Test full flow
5. Remove old code

## Extraction Details

### Method 1: _validateHarvestState()
**Purpose**: Validate active node and get required data
**Returns**: `{nodeDef, nodeState, activeNode}` or null
**Lines**: ~20 lines

### Method 2: _checkHarvestSuccess()
**Purpose**: Roll success vs node evasion
**Returns**: boolean (true = success, false = miss)
**Side Effects**: Emits gathering-miss, reschedules harvest
**Lines**: ~15 lines

### Method 3: _rollHarvestModifiers()
**Purpose**: Roll critical and rare flags
**Returns**: `{isCritical, critMultiplier, isRare, rareMultiplier}`
**Lines**: ~20 lines

### Method 4: _rollAndAwardLoot()
**Purpose**: Roll loot tables, apply multipliers, add to bank
**Returns**: rewards array for logging
**Side Effects**: Adds items to bank
**Lines**: ~40 lines

### Method 5: _awardExperience()
**Purpose**: Calculate and award XP
**Side Effects**: Calls gainSkillExp(), checks missions
**Lines**: ~15 lines

### Method 6: _decrementNodeHealth()
**Purpose**: Decrement harvestsRemaining
**Side Effects**: Mutates nodeState
**Lines**: ~5 lines

### Method 7: _logHarvestSuccess()
**Purpose**: Log success message and emit event
**Side Effects**: Console log, EventBus emit
**Lines**: ~15 lines

### Method 8: _handleNodeDepletion()
**Purpose**: Mark node as depleted, emit event
**Side Effects**: Sets depletedAt, emits node-depleted
**Lines**: ~15 lines

### Method 9: _scheduleNextHarvest()
**Purpose**: Set next harvest time
**Side Effects**: Updates activeNode timing
**Lines**: ~5 lines

Total: ~150 lines across 9 methods vs 200+ in one method
