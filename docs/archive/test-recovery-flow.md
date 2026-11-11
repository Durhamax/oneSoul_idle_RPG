# Recovery Flow Test - Expected Behavior

## Phase 1: Active Gathering (Full Node Health)
**State:**
- `nodeHealth = 10` (full)
- `maxNodeHealth = 10`
- `isRecovering = false`
- `waitingForRespawn = false`

**Visuals:**
- ✅ All 10 notches show GREEN (active class)
- ✅ Cyan highlight cycles 0%→100% (action interval)
- ✅ Label shows "Next harvest..."

**Behavior:**
- ✅ Every interval: harvest attempt occurs
- ✅ On success: award resources + XP, decrement nodeHealth by 1
- ✅ Resources ARE being collected

---

## Phase 2: Depleting Node (9 HP → 1 HP)
**State:**
- `nodeHealth = 9, 8, 7... 1` (decreasing)
- `maxNodeHealth = 10`
- `isRecovering = false`

**Visuals:**
- ✅ Notches disappear from RIGHT to LEFT
- ✅ At 9 HP: rightmost notch goes dark/red
- ✅ At 1 HP: only leftmost notch is green
- ✅ Cyan highlight continues cycling
- ✅ Label shows "Next harvest..."

**Behavior:**
- ✅ Every interval: harvest attempt continues
- ✅ On success: award resources + XP, decrement nodeHealth
- ✅ Resources ARE still being collected

---

## Phase 3: Node Depleted (0 HP - Trigger Recovery)
**State:**
- `nodeHealth = 0` (empty)
- `maxNodeHealth = 10`
- `isRecovering = true` ← **RECOVERY STARTS**
- `waitingForRespawn = true` ← **BLOCKS HARVESTING**
- `recoveryProgress = 0%`

**Event Emitted:**
```javascript
EventBus.emit('node-depleted', {
    nodeId: 'copper_ore',
    nodeName: 'Copper Ore',
    respawnTime: 30000,
    respawnSeconds: 30
});
```

**Visuals:**
- ✅ All notches are DARK/RED (no active class)
- ✅ Highlight changes to RED (start of recovery)
- ✅ Label shows "Recovering..."
- ✅ Status shows "Recovering... 0%"

**Behavior:**
- ❌ NO harvesting occurs (early return in updateNodeCollection)
- ❌ NO resources awarded
- ❌ NO XP awarded
- ✅ Recovery animation starts

---

## Phase 4: Recovery in Progress (1% → 99%)
**State:**
- `nodeHealth = 0` (still empty)
- `isRecovering = true`
- `recoveryProgress = 1% → 99%` (increasing)

**Visuals:**
- ✅ Highlight transitions RED → YELLOW → GREEN
- ✅ Notches refill from LEFT to RIGHT
- ✅ At 10% recovery: 1 notch shows RECOVERING (bright green)
- ✅ At 50% recovery: 5 notches show RECOVERING (yellow highlight)
- ✅ At 90% recovery: 9 notches show RECOVERING (green highlight)
- ✅ Label shows "Recovering..."

**Behavior:**
- ❌ Still NO harvesting (waitingForRespawn = true)
- ❌ NO resources awarded
- ❌ NO XP awarded

---

## Phase 5: Recovery Complete (100%)
**State:**
- `recoveryProgress = 100%`
- `isRecovering = false` ← **RECOVERY ENDS**
- `nodeHealth = 10` ← **RESTORED**
- `waitingForRespawn = false` ← **UNBLOCKED**

**Event Emitted:**
```javascript
EventBus.emit('gathering-started', {
    skill: 'mining',
    nodeId: 'copper_ore',
    nodeName: 'Copper Ore',
    nodeHealth: 10,
    maxHealth: 10
});
```

**Visuals:**
- ✅ All 10 notches show GREEN (active)
- ✅ Highlight changes back to CYAN
- ✅ Highlight starts cycling 0%→100% again
- ✅ Label shows "Next harvest..."

**Behavior:**
- ✅ Harvesting resumes
- ✅ Resources awarded on success
- ✅ XP awarded on success
- ✅ Back to Phase 1

---

## Summary

**GATHERING (nodeHealth > 0):**
- Green notches (full = all green, depleting = fewer green)
- Cyan cycling highlight
- Resources + XP awarded

**RECOVERY (nodeHealth = 0):**
- Notches refill with bright green
- Red→Yellow→Green highlight
- NO resources, NO XP, NO harvesting
