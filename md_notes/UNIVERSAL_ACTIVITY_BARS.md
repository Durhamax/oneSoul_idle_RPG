# Universal Activity Bars System

**Version**: 1.0
**Date**: 2025-01-19
**Status**: IMPLEMENTED
**Purpose**: Single source of truth for all activity progress bars (gathering, combat, navigation, crafting)

---

## 🎯 Overview

The Universal Activity Bars system provides standardized, reusable UI components for displaying:
1. **Endurance/Health Bar** - Shows current endurance/health with recovery state
2. **Interval/Action Bar** - Shows progress toward next action with timing

This ensures consistent visual design and behavior across ALL game activities.

---

## 📁 File Structure

```
src/ui/components/
├── activityBars.js          # Universal bar component (CORE)

src/ui/
├── gatheringUI.js            # Uses ActivityBarsUI for all gathering skills
├── navigationUI.js           # Uses inline bars (can be migrated)
├── combatUI.js              # Can integrate ActivityBarsUI (TODO)
```

---

## 🎨 Component API

### ActivityBarsUI.renderEnduranceBar(config)

Renders endurance/stamina bar with recovery state indication.

**Config Parameters:**
```javascript
{
  containerId: 'string',       // ID of container div
  current: number,             // Current endurance value
  max: number,                 // Maximum endurance value
  isRecovering: boolean,       // Whether in recovery mode
  isActive: boolean,           // Whether activity is active
  activityName: 'string'       // Name (e.g., 'Mining', 'Combat')
}
```

**Visual States:**
- **Active (draining)**: Green gradient (`#4caf50 → #8bc34a`)
- **Recovering**: Orange gradient (`#FFC107 → #FF9800`)

---

### ActivityBarsUI.renderIntervalBar(config)

Renders action interval timer bar.

**Config Parameters:**
```javascript
{
  containerId: 'string',       // ID of container div
  currentTime: number,         // Current elapsed time (ms)
  intervalTime: number,        // Total interval duration (ms)
  isRecovering: boolean,       // Whether in recovery mode
  isActive: boolean,           // Whether activity is active
  activityName: 'string',      // Activity name
  actionIcon: 'string',        // Icon for activity (e.g., '⛏️', '🧭')
  stats: {                     // Optional stats to display
    interval: number,          // Interval time (ms)
    successChance: number,     // 0-1 success rate
    xpPerAction: number        // XP per successful action
  }
}
```

**Visual Design:**
- Blue gradient (`#2196F3 → #64B5F6`)
- Shows current time vs total interval
- Displays stats in description (e.g., "Action every 2.5s • 85% success • +10 XP")

---

### ActivityBarsUI.updateEnduranceBar(config) / updateIntervalBar(config)

Same parameters as render methods, but updates existing bars without full DOM re-render (more performant).

---

### ActivityBarsUI.renderActivityBars(config) / updateActivityBars(config)

Convenience methods that render/update BOTH bars at once.

**Combined Config:**
```javascript
{
  // Endurance bar container
  enduranceContainerId: 'string',
  endurance: number,
  maxEndurance: number,

  // Interval bar container
  intervalContainerId: 'string',
  currentTime: number,
  intervalTime: number,

  // Shared properties
  isRecovering: boolean,
  isActive: boolean,
  activityName: 'string',
  actionIcon: 'string',
  stats: { /* ... */ }
}
```

---

## 🔧 Integration Guide

### Step 1: Add Container Divs

```html
<div id="myActivityEnduranceBar"></div>
<div id="myActivityIntervalBar"></div>
```

### Step 2: Initial Render

```javascript
ActivityBarsUI.renderActivityBars({
  enduranceContainerId: 'myActivityEnduranceBar',
  intervalContainerId: 'myActivityIntervalBar',
  endurance: 60,
  maxEndurance: 100,
  currentTime: 1200,
  intervalTime: 3000,
  isRecovering: false,
  isActive: true,
  activityName: 'Mining',
  actionIcon: '⛏️',
  stats: {
    interval: 3000,
    successChance: 0.85,
    xpPerAction: 10
  }
});
```

### Step 3: Update Loop (100ms interval)

```javascript
setInterval(() => {
  if (isActivityActive) {
    ActivityBarsUI.updateActivityBars({
      enduranceContainerId: 'myActivityEnduranceBar',
      intervalContainerId: 'myActivityIntervalBar',
      endurance: getCurrentEndurance(),
      maxEndurance: getMaxEndurance(),
      currentTime: Date.now() - lastActionTime,
      intervalTime: calculateActionInterval(),
      isRecovering: isInRecoveryMode(),
      isActive: true,
      activityName: 'Mining',
      actionIcon: '⛏️',
      stats: getActivityStats()
    });
  }
}, 100);
```

---

## 📋 Current Implementations

### ✅ GatheringUI (src/ui/gatheringUI.js)

**Status**: FULLY INTEGRATED

Uses ActivityBarsUI for all gathering skills:
- Mining ⛏️
- Logging 🪓
- Fishing 🎣
- Hunting 🏹
- Foraging 🌿
- Thieving 🎭

**Display Location**: Skills tab (⭐ SKILLS)

**Containers:**
- `#gatheringActivityDisplay` (main container in Skills view)
- `#gatheringEnduranceBar` (endurance bar container)
- `#gatheringIntervalBar` (interval bar container)

**Update Frequency**: 100ms via setInterval

---

### ✅ NavigationUI (src/ui/navigationUI.js)

**Status**: CUSTOM IMPLEMENTATION (can be migrated)

Currently uses inline bars with similar design patterns.

**Containers:**
- `#navigationHealthBar` (endurance)
- `#navigationIntervalBar` (action)

**Migration Path**: Replace inline bars with ActivityBarsUI calls for consistency.

---

### ⏳ CombatUI (src/ui/combatUI.js)

**Status**: TODO

Can integrate ActivityBarsUI for:
- Player health bar
- Enemy health bar
- Combat action interval
- Special attack cooldowns

---

## 🎨 Styling

All bars use existing game CSS classes:
- `.health-bar` - Container
- `.health-bar-fill` - Fill bar with gradient
- `.health-bar-text` - Overlay text (e.g., "60/100")

Additional activity bar classes:
- `.activity-bar-label` - Bar title/label
- `.activity-bar-desc` - Description text
- `.activity-endurance-fill` - Endurance bar fill
- `.activity-interval-fill` - Interval bar fill
- `.activity-endurance-text` - Endurance text
- `.activity-interval-text` - Interval text

**Design Variables** (from index.html):
- `--color-bg-secondary`: `#14141e` (bar background)
- `--color-border`: `rgba(255, 255, 255, 0.1)` (borders)
- `--radius-md`: `8px` (border radius)
- `--space-md`: `12px` (padding)
- `--transition-base`: `300ms ease` (transitions)

---

## 🔄 Endurance System Integration

Activity bars are designed to work with the universal endurance system:

**Endurance States:**
```javascript
{
  endurance: 60,           // Current endurance
  maxEndurance: 100,       // Max based on Health attribute
  isRecovering: false,     // Recovery mode flag
  lastActionTime: Date.now(),
  lastRecoveryTime: 0
}
```

**Formulas** (from ACTIVITY_ENDURANCE_SYSTEM_SPEC.md):
- Max Endurance: `50 + (health * 10)`
- Depletion Rate: `max(1.5, 5 - (health * 0.3))`
- Recovery Rate: `3 + (health * 0.5)`

**Automatic Recovery**:
- When `endurance <= 0`, system enters recovery mode (`isRecovering = true`)
- Bars change color to orange gradient
- Labels update to "💤 Resting" / "💤 Recovery Mode"
- Activity pauses until endurance fully restored

---

## 🔗 Related Systems

### NavigationSystem (src/systems/navigationSystem.js)
- Uses endurance for exploration
- Drains during discovery ticks
- Recovers when depleted

### GatheringSystem (src/systems/gatheringSystem.js)
- Universal gathering for all skilling
- Endurance management per skill
- Action intervals based on tool/skill/node

### UICore (src/ui/uiCore.js)
- Main UI update loop (100ms)
- Routes to view-specific renderers
- Calls `GatheringUI.render()` for nodes view

---

## 📝 Design Principles

1. **Single Source of Truth**: All activity bars use ActivityBarsUI component
2. **Consistent Visual Language**: Same colors, gradients, and layout everywhere
3. **Performance**: Update methods avoid full DOM re-render
4. **Separation of Concerns**: Systems handle logic, UI handles display
5. **Reusability**: One component serves all activities (gathering, combat, navigation, crafting)

---

## 🚀 Future Enhancements

### Phase 2: Combat Integration
Integrate ActivityBarsUI into CombatUI for:
- Attack interval bar
- Special ability cooldowns
- Player/enemy health bars (optional replacement)

### Phase 3: NavigationUI Migration
Replace NavigationUI inline bars with ActivityBarsUI for full consistency.

### Phase 4: Crafting Integration
Add activity bars to crafting UI:
- Crafting progress interval
- Stamina/focus for complex crafts

---

## 📖 Example: Adding New Activity

```javascript
// 1. Add HTML containers
<div id="newActivityEnduranceBar"></div>
<div id="newActivityIntervalBar"></div>

// 2. Render on activity start
function startNewActivity() {
  // ... start activity logic ...

  ActivityBarsUI.renderActivityBars({
    enduranceContainerId: 'newActivityEnduranceBar',
    intervalContainerId: 'newActivityIntervalBar',
    endurance: state.endurance,
    maxEndurance: state.maxEndurance,
    currentTime: 0,
    intervalTime: calculateInterval(),
    isRecovering: false,
    isActive: true,
    activityName: 'Alchemy',
    actionIcon: '🧪',
    stats: {
      interval: 5000,
      successChance: 0.8,
      xpPerAction: 25
    }
  });
}

// 3. Update in game loop
function updateNewActivityUI() {
  ActivityBarsUI.updateActivityBars({
    enduranceContainerId: 'newActivityEnduranceBar',
    intervalContainerId: 'newActivityIntervalBar',
    endurance: state.endurance,
    maxEndurance: state.maxEndurance,
    currentTime: Date.now() - state.lastActionTime,
    intervalTime: calculateInterval(),
    isRecovering: state.isRecovering,
    isActive: true,
    activityName: 'Alchemy',
    actionIcon: '🧪',
    stats: getAlchemyStats()
  });
}
```

---

## ✅ Testing Checklist

- [ ] Test gathering activity bars for all 6 skills
- [ ] Test endurance depletion visual (green → orange)
- [ ] Test recovery mode activation
- [ ] Test interval bar progress (0% → 100%)
- [ ] Test stat display updates
- [ ] Test activity name/icon display
- [ ] Test bar visibility when activity starts/stops
- [ ] Test performance (no frame drops during updates)
- [ ] Test on different screen sizes
- [ ] Test with different Health attribute values

---

## 🎓 Key Takeaways

✅ **ActivityBarsUI is now the universal component for ALL activity progress displays**
✅ **GatheringUI demonstrates full integration pattern**
✅ **All future activities should use this component**
✅ **Consistent design = better UX across the entire game**
