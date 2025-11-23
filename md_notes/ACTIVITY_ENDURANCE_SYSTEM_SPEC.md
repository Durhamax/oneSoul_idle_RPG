# Activity Endurance System - Universal Pattern Specification

**Version**: 1.0
**Date**: 2025-01-19
**Status**: PROPOSED
**Purpose**: Define a universal endurance/stamina pattern for all active skills (gathering, navigation, combat, etc.)

---

## 🎯 Overview

All active skill activities (mining, logging, fishing, navigation, etc.) should use a **unified endurance system** that:
- Prevents infinite grinding without player engagement
- Creates natural rest/recovery cycles
- Scales with player attributes (health-based)
- Is simple, predictable, and easy to understand

---

## 📐 Core Pattern (Proven in NavigationSystem)

### Components

Every active skill system needs these components:

```javascript
{
    // Activity state
    isActive: false,           // Is activity currently running?
    isRecovering: false,       // Is endurance recovering?

    // Endurance tracking
    endurance: 60,             // Current endurance
    maxEndurance: 60,          // Maximum endurance (health-based)

    // Timing
    lastActionTime: 0,         // Last action tick timestamp
    lastRecoveryTime: 0,       // Last recovery tick timestamp

    // Session tracking
    actionsThisSession: 0,     // Total actions this session
    resourcesGained: {},       // Resources gained this session
}
```

### Action Loop

```javascript
processActivity(deltaTime) {
    if (!this.isActive) return;

    // RECOVERY MODE
    if (this.isRecovering) {
        this.processRecovery();
        return;
    }

    // ACTION MODE
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime;

    // Check action interval
    if (timeSinceLastAction < this.getActionInterval()) {
        return;
    }

    this.lastActionTime = now;

    // Check endurance
    if (this.endurance <= 0) {
        console.log("💤 Out of endurance! Entering recovery mode...");
        this.isRecovering = true;
        this.lastRecoveryTime = now;
        return;
    }

    // Drain endurance
    this.endurance -= this.getDepletionRate();
    if (this.endurance < 0) this.endurance = 0;

    // Perform action
    this.performAction();
}
```

### Recovery Loop

```javascript
processRecovery() {
    const now = Date.now();
    const timeSinceRecovery = now - this.lastRecoveryTime;
    const recoveryInterval = 1000; // Recover every 1 second

    if (timeSinceRecovery >= recoveryInterval) {
        this.lastRecoveryTime = now;

        // Recover endurance
        this.endurance += this.getRecoveryRate();

        // Check if fully recovered
        if (this.endurance >= this.maxEndurance) {
            this.endurance = this.maxEndurance;
            this.isRecovering = false;
            console.log(`✅ Endurance restored! Resuming activity...`);
        } else {
            console.log(`⏳ Recovering endurance... (${Math.floor(this.endurance)}/${this.maxEndurance})`);
        }
    }
}
```

---

## 📊 Attribute-Based Formulas

### Max Endurance (Health-based)
```javascript
const health = this.state.combatAttributes?.health || 1;
const balance = this.gameBalance;

// Formula: base + (health * multiplier)
// Example: 50 + (health * 10) = 50-150 endurance range
const maxEndurance = (balance.baseEndurance || 50) +
                     (health * (balance.enduranceHealthMult || 10));
```

### Depletion Rate (Health reduces drain)
```javascript
const health = this.state.combatAttributes?.health || 1;
const balance = this.gameBalance;

// Formula: base - (health * reduction), minimum floor
// Example: 5 - (health * 0.3) = 5 down to 1.5 per action
// Higher health = slower endurance drain
const depletionRate = Math.max(
    balance.minDepletionRate || 1.5,
    (balance.baseDepletionRate || 5) - (health * (balance.healthDepletionReduction || 0.3))
);
```

### Recovery Rate (Health boosts recovery)
```javascript
const health = this.state.combatAttributes?.health || 1;
const balance = this.gameBalance;

// Formula: base + (health * multiplier)
// Example: 3 + (health * 0.5) = 3-8 endurance per second
// Higher health = faster recovery
const recoveryRate = (balance.baseRecoveryRate || 3) +
                     (health * (balance.healthRecoveryMult || 0.5));
```

---

## 🔧 Implementation Checklist

To add endurance to any skill system:

### 1. Add State Properties
```javascript
// In state initialization (gameEngine.js or system init)
this.state.skillSession = {
    isActive: false,
    isRecovering: false,
    endurance: 0,
    maxEndurance: 0,
    lastActionTime: 0,
    lastRecoveryTime: 0,
    // ... other session data
};
```

### 2. Add to Game Loop
```javascript
// In gameEngine.js tick()
if (this.state.skillSession && this.state.skillSession.isActive) {
    if (this.processSkillActivity) {
        this.processSkillActivity(deltaTime);
    }
}
```

### 3. Implement Activity Processing
```javascript
// In system file (e.g., gatheringSystem.js)
processGatheringTick(deltaTime) {
    const session = this.state.gatheringSession;
    if (!session || !session.isActive) return;

    // RECOVERY MODE
    if (session.isRecovering) {
        this.processGatheringRecovery();
        return;
    }

    // ACTION MODE
    // ... check intervals, drain endurance, perform action
}
```

### 4. Add Recovery Logic
```javascript
processGatheringRecovery() {
    const session = this.state.gatheringSession;
    const now = Date.now();
    const timeSinceRecovery = now - session.lastRecoveryTime;

    if (timeSinceRecovery >= 1000) {
        session.lastRecoveryTime = now;
        session.endurance += this.getRecoveryRate();

        if (session.endurance >= session.maxEndurance) {
            session.endurance = session.maxEndurance;
            session.isRecovering = false;
            console.log(`✅ Endurance restored! Resuming ${session.skill}...`);
        }
    }
}
```

### 5. Update UI to Show Endurance
```javascript
// In UI component
const enduranceBar = `
    <div class="endurance-bar">
        <div class="endurance-fill" style="width: ${(endurance/maxEndurance)*100}%"></div>
        <span>${Math.floor(endurance)}/${maxEndurance}</span>
    </div>
`;

const statusText = isRecovering ?
    "⏳ Resting..." :
    `⚡ ${skill}ing...`;
```

---

## 🎮 Game Balance Values

Default values (can be tuned in gameBalance):

```javascript
gameBalance = {
    // Endurance pool
    baseEndurance: 50,              // Base endurance at health=1
    enduranceHealthMult: 10,        // Endurance gain per health point

    // Depletion
    baseDepletionRate: 5,           // Base endurance cost per action
    healthDepletionReduction: 0.3,  // How much health reduces drain
    minDepletionRate: 1.5,          // Minimum drain per action

    // Recovery
    baseRecoveryRate: 3,            // Base recovery per second
    healthRecoveryMult: 0.5,        // Recovery gain per health point
};
```

### Example Calculations

**Player with Health = 1 (starter)**:
- Max Endurance: 50 + (1 * 10) = **60**
- Depletion: max(1.5, 5 - (1 * 0.3)) = **4.7 per action**
- Recovery: 3 + (1 * 0.5) = **3.5 per second**
- **Result**: ~13 actions before rest, ~17 seconds to recover

**Player with Health = 5 (mid-game)**:
- Max Endurance: 50 + (5 * 10) = **100**
- Depletion: max(1.5, 5 - (5 * 0.3)) = **3.5 per action**
- Recovery: 3 + (5 * 0.5) = **5.5 per second**
- **Result**: ~29 actions before rest, ~18 seconds to recover

**Player with Health = 10 (late-game)**:
- Max Endurance: 50 + (10 * 10) = **150**
- Depletion: max(1.5, 5 - (10 * 0.3)) = **2.0 per action** (capped at min)
- Recovery: 3 + (10 * 0.5) = **8 per second**
- **Result**: ~75 actions before rest, ~19 seconds to recover

---

## 🔄 Migration Strategy

### Phase 1: Extract Pattern from NavigationSystem ✅
- [x] NavigationSystem has working endurance
- [x] Document the pattern
- [x] Create this specification

### Phase 2: Apply to GatheringSystem
- [ ] Add endurance state to gatheringSession
- [ ] Implement processGatheringRecovery()
- [ ] Update startGathering() to initialize endurance
- [ ] Update processGatheringTick() to check endurance
- [ ] Update gathering UI to show endurance bar

### Phase 3: Create Shared Activity Utility
- [ ] Extract to `src/utils/ActivityEnduranceUtil.js`
- [ ] Provide reusable functions:
  - `calculateMaxEndurance(health, balance)`
  - `calculateDepletionRate(health, balance)`
  - `calculateRecoveryRate(health, balance)`
  - `processRecovery(session, health, balance)`

### Phase 4: Apply to Other Skills
- [ ] Combat system (if needed)
- [ ] Crafting system (optional - crafting might not need endurance)
- [ ] Any future active skills

---

## 💡 Design Notes

### Why Health-Based?
- Health is the "physical endurance" attribute
- Scales naturally as player progresses
- Creates attribute synergy (health is useful outside combat)
- Easy to understand: "More health = work longer, rest faster"

### Why Time-Based Recovery?
- Simple and predictable
- No resource consumption needed
- Creates natural gameplay rhythm
- Works offline (calculated on return)

### Why NOT Resource-Based Recovery?
- Adds inventory management complexity
- Creates resource consumption loops
- Less accessible for new players
- Navigation worked with RestRecoverySystem but was overly complex

---

## ✅ Success Criteria

This system is successful if:
1. ✅ **Natural Rhythm**: Players cycle between action and rest without frustration
2. ✅ **Progression Feel**: Higher health = noticeably longer sessions
3. ✅ **No Exploitation**: Can't grind infinitely without engagement
4. ✅ **Clear Feedback**: UI clearly shows endurance state
5. ✅ **Performance**: System adds <1ms to tick time

---

## 🔗 References

- **Working Implementation**: `src/systems/navigationSystem.js` lines 312-358
- **Game Loop Integration**: `src/core/gameEngine.js` lines 1230-1240
- **Foundation Spec**: `FOUNDATION_SPECIFICATION.md`
- **Game Balance**: `src/core/gameEngine.js` gameBalance object

---

## 📋 Next Steps

1. **Test navigation endurance thoroughly** - ensure it's balanced and fun
2. **Apply to GatheringSystem** - prove the pattern is reusable
3. **Extract to utility** - make it a standard library function
4. **Update documentation** - add to FOUNDATION_SPECIFICATION.md as standard pattern
5. **Consider EventBus** - emit events for endurance changes (future enhancement)
