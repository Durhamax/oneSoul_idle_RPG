# Complete Harvesting Flow Explanation

## Overview

The harvesting system follows this path:
**Skills UI → Node Selection → Harvesting Mechanics → Visual Feedback**

---

## 1. Skills UI Layer

### SkillCard Component (`src/ui/components/SkillCard.js`)

**Purpose**: Displays all 13 skills in a grid with node counts and access buttons.

**What it shows:**
- Skill emblem with icon (⛏️, 🪓, 🎣, etc.)
- Current level and XP progress bar
- **"Available (X)" button** - nodes you can harvest NOW
- **"Locked (X)" button** - nodes that show what's coming (envy mechanic)

**Key Method: `getNodeCounts(skillId)`** (line 186-290)
```javascript
// 1. Maps skill name to node type
const skillToNodeType = {
    mining: 'mining',
    logging: 'logging',
    fishing: 'fishing',
    hunting: 'hunting',
    foraging: 'foraging',
    thieving: 'thieving',
    // Crafting/navigation have NO gathering nodes
    cooking: null,
    smithing: null,
    // ... etc
};

// 2. Queries NodeRegistry for all nodes of this type
const allNodes = NodeRegistry.getBySkill(nodeType); // Returns array of node objects

// 3. Filters nodes based on player state
for (const node of allNodes) {
    if (NodeRegistry.meetsRequirements(node, playerState)) {
        availableNodes.push(node); // Player can harvest this NOW
    } else {
        lockedNodes.push(node); // Player needs to level up
    }
}

// 4. Returns counts
return {
    availableCount: availableNodes.length,
    lockedCount: lockedNodes.length,
    lockedExamples: lockedNodes.slice(0, 3) // First 3 locked nodes for preview
};
```

**Node Requirements Check:**
`NodeRegistry.meetsRequirements(node, playerState)` checks:
- `node.requirements.skillLevel` ≤ player skill level
- `node.requirements.characterLevel` ≤ player character level
- `node.requirements.tools` - player has required tool tier equipped
- `node.requirements.quests` - player has completed required quests

**Event Flow:**
```
User clicks "Available (3)" button
    ↓
Button has onclick="showAvailableNodes('mining')"
    ↓
EventBus.emit('show-node-panel', { skillId: 'mining', filterType: 'available' })
    ↓
NodePanel receives event and opens
```

---

## 2. Node Selection Layer

### NodePanel Component (`src/ui/components/NodePanel.js`)

**Purpose**: Slide-in panel that displays filtered node lists when clicking Available/Locked buttons.

**Visual Design:**
- Slides in from right side of screen
- Header shows: "Mining | AVAILABLE" with close button
- Body shows scrollable list of node cards

**Key Method: `getFilteredNodes()`** (line 65-104)
```javascript
// 1. Convert skill to node type (same mapping as SkillCard)
const nodeType = skillToNodeType[this.currentSkill]; // 'mining', 'logging', etc.

// 2. Get all nodes for this skill
const allNodes = NodeRegistry.getBySkill(nodeType);

// 3. Filter based on panel mode
if (this.currentFilter === 'available') {
    return allNodes.filter(node =>
        NodeRegistry.meetsRequirements(node, playerState)
    );
} else { // 'locked'
    return allNodes.filter(node =>
        !NodeRegistry.meetsRequirements(node, playerState)
    );
}
```

**Node Card Display** (line 156-211):
Each node shows:
- **Icon & Tier Badge**: 💎 with "T1" badge
- **Name**: "Riverbed", "Evergreen Forest"
- **Description**: What the node is
- **Stats Row**:
  - ⚡ Harvest time (3s, 5s, etc.)
  - 💎 XP reward per harvest
  - ❤️ Node health (harvests before depletion)
- **Resource Preview**: Top 3 items you can get (for available nodes only)
- **Lock Reason**: "Requires mining level 5" (for locked nodes only)
- **Start Button**: Only on available nodes

**Start Harvesting Flow** (line 299-318):
```javascript
startNode(nodeId) {
    // Calls GameEngine's node harvesting system
    const result = GameEngine.startNodeHarvesting(nodeId);

    if (result && result.success) {
        this.hidePanel(); // Close panel
        // Player stays on Skills view to see PersistentActionBar
    } else {
        console.error('Failed:', result?.reason);
    }
}
```

---

## 3. Harvesting Mechanics Layer

### NodeCollectionSystem (`src/systems/nodeCollectionSystem.js`)

**Purpose**: Handles the actual harvesting loop, loot rolls, XP gains, and node depletion.

### Phase 1: Starting Harvest

**`startNodeHarvesting(nodeId)`** (line 243-315)

```javascript
// 1. Get node definition from NodeRegistry
const nodeDef = NodeRegistry.getNode(nodeId);

// 2. Check requirements
const skillType = nodeDef.nodeType; // 'mining', 'logging', etc.
const requiredLevel = nodeDef.requiredSkillLevel;
const playerSkillLevel = GameEngine.state.skills[skillType].level;

if (playerSkillLevel < requiredLevel) {
    return { success: false, reason: 'Not high enough level' };
}

// 3. Get node state in current region
const nodeState = this.getNodeStateInRegion(nodeId);

// Each region tracks node states:
// {
//   harvestsRemaining: 10,  // How many harvests left
//   maxHarvests: 10,        // Total harvests before depletion
//   depletedAt: null,       // Timestamp when depleted
//   respawnTime: 60000      // 60 seconds to respawn
// }

if (nodeState.harvestsRemaining <= 0) {
    return { success: false, reason: 'Node depleted, waiting for respawn' };
}

// 4. Stop other activities
if (this.state.currentActivity === 'combat') {
    this.endCombat();
}

// 5. Set active harvesting
this.state.currentActivity = 'nodeCollection';
this.state.nodeCollection.activeNode = {
    nodeId: nodeId,
    startTime: Date.now(),
    harvestTime: nodeDef.harvestTime // Base time (e.g., 5000ms)
};

// 6. Emit event for PersistentActionBar
EventBus.emit('gathering-started', {
    skill: nodeDef.skill,
    nodeId: nodeId,
    nodeName: nodeDef.name,
    nodeHealth: nodeState.harvestsRemaining,
    maxHealth: nodeState.maxHarvests
});
```

### Phase 2: Processing Harvest (Game Loop)

**`processNodeHarvesting(deltaTime)`** (line 309-343)

Called every game tick (100ms):

```javascript
const activeNode = this.state.nodeCollection.activeNode;
if (!activeNode) return; // Not harvesting

const now = Date.now();
const elapsed = now - activeNode.startTime;

// Check if harvest time has elapsed
if (elapsed >= activeNode.harvestTime) {
    this.completeNodeHarvest(); // Harvest complete!
}

// Special case: Waiting for node respawn
if (activeNode.waitingForRespawn) {
    const nodeState = this.getNodeStateInRegion(activeNode.nodeId);

    if (nodeState && nodeState.harvestsRemaining > 0) {
        // Node has respawned! Resume harvesting
        activeNode.waitingForRespawn = false;
        activeNode.startTime = Date.now();
        activeNode.harvestTime = nodeDef.harvestTime;
    }
}
```

### Phase 3: Completing Harvest

**`completeNodeHarvest()`** (line 401-548)

This is the big one - handles success/failure, loot, XP:

```javascript
// === STEP 1: Calculate Harvest Stats vs Node Stats ===
const skillType = nodeDef.nodeType; // 'mining', 'logging', etc.
const harvestCalc = StatCalculator.calculateHarvestVsNode(skillType, nodeId);

// StatCalculator queries baseGameValues for:
// - miningSpeed: 5000ms (base harvest time)
// - miningChance: 100% (base success rate)
// - miningCritChance: 15% (base crit chance)
// - miningCritMultiplier: 2.0x (double loot on crit)
// - miningRareChance: 2% (rare drop chance)
// - miningRareMultiplier: 2.0x (double quantity on rare)

// Then subtracts node defensive stats:
// - Node resistance: Adds time to harvest
// - Node evasion: Reduces success chance
// - Node critEvasion: Reduces crit chance
// - Node rareEvasion: Reduces rare chance

const effective = harvestCalc.effective;
// effective = {
//   speed: 5200ms (base 5000 + 200 resistance),
//   chance: 95% (base 100 - 5 evasion),
//   critChance: 12% (base 15 - 3 critEvasion),
//   critMultiplier: 2.0x,
//   rareChance: 1.5% (base 2 - 0.5 rareEvasion),
//   rareMultiplier: 2.0x
// }

// === STEP 2: Check Success (vs node evasion) ===
const successRoll = Math.random() * 100;
if (successRoll > effective.chance) {
    // MISS! Node evaded your harvest
    console.log('❌ MISS!');

    // Still start next harvest (no penalty except wasted time)
    activeNode.startTime = Date.now();
    activeNode.harvestTime = effective.speed;
    return; // Exit without giving rewards
}

// === STEP 3: Check for Critical Harvest ===
const critRoll = Math.random() * 100;
const isCritical = critRoll < effective.critChance;
let critMultiplier = 1;

if (isCritical) {
    critMultiplier = effective.critMultiplier; // 2.0x
    console.log('💥 CRITICAL HARVEST!');
}

// === STEP 4: Check for Rare Drop ===
const rareRoll = Math.random() * 100;
const isRare = rareRoll < effective.rareChance;

if (isRare) {
    console.log('✨ RARE DROP!');
}

// === STEP 5: Roll Loot ===
let rewardsGained = [];

// Use rare loot table if rare triggered, otherwise normal
const lootTable = (isRare && nodeDef.rareLoot?.length > 0)
    ? nodeDef.rareLoot
    : nodeDef.normalLoot;

// Normal loot: Weight-based single item
// nodeDef.normalLoot = [
//   { itemId: 'clay', weight: 70, min: 1, max: 3 },
//   { itemId: 'flint', weight: 30, min: 1, max: 2 }
// ]
// Total weight = 100
// Roll 0-100, if < 70 → clay, else → flint

const lootResult = this.rollNormalLoot(lootTable);
// Returns: { itemId: 'clay', amount: 2 }

// Apply multipliers
let finalAmount = lootResult.amount;

if (isCritical) {
    finalAmount = Math.floor(finalAmount * critMultiplier); // 2x
}

if (isRare) {
    finalAmount = Math.floor(finalAmount * effective.rareMultiplier); // 2x
}

// Add to player bank
this.addItemToBank(lootResult.itemId, finalAmount);
rewardsGained.push(`${finalAmount}x Clay 💥✨`);

// === STEP 6: Award XP ===
let xpGained = nodeDef.expPerHarvest; // e.g., 25 XP
if (isCritical) {
    xpGained = Math.floor(xpGained * 1.5); // Bonus XP on crit
}
this.gainSkillExp(nodeDef.skill, xpGained);

// === STEP 7: Decrement Harvests Remaining ===
nodeState.harvestsRemaining--;

console.log(`✅ Harvested: ${rewardsGained.join(', ')} +${xpGained} XP (${nodeState.harvestsRemaining}/${nodeState.maxHarvests} remaining)`);

// Emit event for PersistentActionBar
EventBus.emit('gathering-success', {
    damage: 1, // Decrement by 1 harvest
    rewards: rewardsGained
});

// === STEP 8: Check if Node Depleted ===
if (nodeState.harvestsRemaining <= 0) {
    nodeState.depletedAt = Date.now();
    console.log(`⏳ Node depleted! Waiting for respawn...`);

    EventBus.emit('node-depleted');

    // Don't stop harvesting - mark as waiting
    activeNode.waitingForRespawn = true;
    activeNode.respawnStartTime = Date.now();
    return;
}

// === STEP 9: Start Next Harvest (AUTO-LOOP) ===
activeNode.startTime = Date.now();
activeNode.harvestTime = effective.speed; // Use calculated speed with resistance
activeNode.waitingForRespawn = false;
```

### Phase 4: Node Respawn

**`updateNodeRespawns()`** (line 199-238)

Called every game tick:

```javascript
for (let nodeId in regionNodes) {
    const nodeState = regionNodes[nodeId];

    // Check if node is depleted and ready to respawn
    if (nodeState.depletedAt && nodeState.harvestsRemaining === 0) {
        const respawnReady = Date.now() >= (nodeState.depletedAt + nodeState.respawnTime);

        if (respawnReady) {
            const nodeDef = NodeRegistry.getNode(nodeId);

            if (!nodeDef) {
                console.warn(`Node '${nodeId}' not found, skipping respawn`);
                continue; // Skip orphaned nodes from old saves
            }

            // Restore harvests
            const maxHarvests = nodeDef.baseHealth || nodeDef.harvestsPerDepletion || 10;
            nodeState.harvestsRemaining = maxHarvests;
            nodeState.maxHarvests = maxHarvests;
            nodeState.depletedAt = null;

            console.log(`♻️ ${nodeDef.name} has respawned!`);
        }
    }
}
```

---

## 4. Visual Feedback Layer

### PersistentActionBar (`src/ui/components/PersistentActionBar.js`)

**Purpose**: Shows active harvesting at top of screen with dopamine triggers.

**Listens for EventBus events:**

```javascript
// When harvesting starts
this.on('gathering-started', (data) => {
    this.nodeHealth = data.nodeHealth; // 10 harvests
    this.maxHealth = data.maxHealth;
    this.comboCount = 0;

    this.render({
        active: true,
        skill: data.skill,
        nodeName: data.nodeName,
        nodeHealth: 10,
        maxHealth: 10
    });
});

// When harvest succeeds
this.on('gathering-success', (data) => {
    this.comboCount++; // Increment combo
    this.nodeHealth--; // Decrement health

    this.triggerSuccessAnimation(); // Green flash
    this.showRewardPopup(data.rewards); // "+2x Clay 💥"

    this.render({
        active: true,
        nodeHealth: 9,
        maxHealth: 10,
        combo: 1
    });
});

// When harvest misses
this.on('gathering-miss', () => {
    this.comboCount = 0; // Reset combo
    this.triggerMissAnimation(); // Red flash

    this.render({
        active: true,
        nodeHealth: 9, // No change
        maxHealth: 10,
        combo: 0 // Reset!
    });
});

// When node depleted
this.on('node-depleted', () => {
    this.triggerDepletionAnimation(); // Fade out

    setTimeout(() => {
        this.handleGatheringStopped();
    }, 1000);
});

// When harvesting stops
this.on('gathering-stopped', () => {
    this.render({ active: false }); // Hide bar
});
```

**Visual Display:**
```
┌──────────────────────────────────────────────────────────┐
│ ⛏️ Mining                                                │
│    Riverbed                                              │
│                                                          │
│ ████████░░ (8/10 harvests remaining)                    │
│                                                          │
│                                            🔥 5x COMBO   │
└──────────────────────────────────────────────────────────┘
```

**Dopamine Triggers:**
- **Segmented Health Bar**: Shows exactly how many harvests left
- **Combo Counter**: Increases with consecutive successes
- **Reward Popups**: "+2x Clay 💥" floats up on screen
- **Color Changes**: Green flash on success, red flash on miss
- **Tier Escalation**: Combo tiers (5x, 10x, 25x) change colors

---

## 5. Data Flow Summary

```
┌─────────────────┐
│  User clicks    │
│  "Available"    │
│  button on      │
│  Mining card    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  EventBus       │
│  emits:         │
│  'show-node-    │
│   panel'        │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  NodePanel      │
│  queries:       │
│  NodeRegistry   │
│  .getBySkill()  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Shows list of  │
│  nodes with     │
│  "Start" btns   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  User clicks    │
│  "Start" on     │
│  Riverbed       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  GameEngine     │
│  .startNode     │
│  Harvesting()   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Sets active    │
│  node state,    │
│  emits          │
│  'gathering-    │
│   started'      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Persistent     │
│  ActionBar      │
│  appears at top │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Game Loop      │
│  calls          │
│  processNode    │
│  Harvesting()   │
│  every 100ms    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  After harvest  │
│  time elapsed:  │
│  completeNode   │
│  Harvest()      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  StatCalculator │
│  calculates     │
│  success/crit/  │
│  rare chances   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Roll loot,     │
│  give XP,       │
│  decrement      │
│  harvests       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Emit           │
│  'gathering-    │
│   success'      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  ActionBar      │
│  updates combo, │
│  health, shows  │
│  popup          │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Auto-start     │
│  next harvest   │
│  immediately    │
└────────┬────────┘
         │
         │
         v
    (Loop continues
     until depleted)
```

---

## 6. Key Data Structures

### Node Definition (from NodeRegistry)
```javascript
{
    id: "riverbed",
    name: "Riverbed",
    description: "A shallow riverbed with clay deposits",
    icon: "💎",

    nodeType: "mining",
    category: "water",
    tier: 1,

    // Requirements
    requiredSkillLevel: 1,
    requirements: {
        skill: "mining",
        skillLevel: 1,
        characterLevel: 1,
        tools: ["pickaxe"],
        toolTier: 1,
        quests: []
    },

    // Harvesting mechanics
    harvestTime: 3000,           // 3 seconds per harvest
    expPerHarvest: 25,            // 25 XP per harvest
    baseHealth: 10,               // 10 harvests before depletion
    respawnTime: 60000,           // 60 seconds to respawn

    // Loot tables
    normalLoot: [
        { itemId: 'clay', weight: 70, min: 1, max: 3 },
        { itemId: 'flint', weight: 30, min: 1, max: 2 }
    ],
    rareLoot: [
        { itemId: 'copper_ore', chance: 0.05, min: 1, max: 1 }
    ],

    // Node defensive stats (from tier)
    resistance: 0,      // Adds time to harvest
    evasion: 5,         // Reduces success chance
    critEvasion: 0,     // Reduces crit chance
    rareEvasion: 0      // Reduces rare chance
}
```

### Player Skill State
```javascript
GameEngine.state.skills = {
    mining: {
        level: 5,
        exp: 234,
        unlocked: true
    },
    logging: {
        level: 3,
        exp: 89,
        unlocked: true
    },
    // ... etc
}
```

### Active Node State (per region)
```javascript
GameEngine.state.regions = {
    plains: {
        availableNodes: {
            riverbed: {
                harvestsRemaining: 8,    // 8 harvests left
                maxHarvests: 10,         // Total 10 harvests
                depletedAt: null,        // Not depleted
                respawnTime: 60000       // 60s respawn
            },
            copperVein: {
                harvestsRemaining: 0,    // Depleted!
                maxHarvests: 10,
                depletedAt: 1716234567890, // Timestamp
                respawnTime: 120000      // 120s respawn
            }
        }
    }
}
```

### Active Harvesting State
```javascript
GameEngine.state.nodeCollection = {
    activeNode: {
        nodeId: "riverbed",
        startTime: 1716234567890,     // When this harvest started
        harvestTime: 3200,             // Time until complete (with resistance)
        waitingForRespawn: false       // Not waiting
    }
}
```

---

## 7. Stat Calculation Details

### Base Stats (from `statCalculator.js` baseGameValues)

```javascript
// For each gathering skill, defines:
miningSpeed: 5000,              // Base 5 seconds per harvest
miningChance: 100,              // Base 100% success rate
miningCritChance: 15,           // Base 15% crit chance
miningCritMultiplier: 2.0,      // 2x loot on crit
miningRareChance: 2,            // Base 2% rare drop
miningRareMultiplier: 2.0,      // 2x quantity on rare

// Same pattern for:
// loggingSpeed, loggingChance, loggingCritChance, etc.
// fishingSpeed, fishingChance, fishingCritChance, etc.
// huntingSpeed, huntingChance, huntingCritChance, etc.
// foragingSpeed, foragingChance, foragingCritChance, etc.
// thievingSpeed, thievingChance, thievingCritChance, etc.
```

### Modifiers (applied by equipment, perks, buffs)

```javascript
// Equipment can add:
// +10% miningSpeed (faster harvesting)
// +5% miningCritChance (more crits)
// +0.5x miningCritMultiplier (bigger crits)

// Perks can add:
// +15% miningChance (less misses)
// +3% miningRareChance (more rare drops)

// Buffs can add:
// +20% experienceMultiplier (more XP)
// +50% dropRateMultiplier (more loot)
```

### Effective Calculation

```javascript
// Player stats MINUS node defensive stats
effectiveChance = (baseChance + modifiers) - nodeEvasion
effectiveCritChance = (baseCritChance + modifiers) - nodeCritEvasion
effectiveSpeed = (baseSpeed + modifiers) + nodeResistance
effectiveRareChance = (baseRareChance + modifiers) - nodeRareEvasion

// Example:
// Player: 100% base chance + 10% from gear = 110%
// Node: 5% evasion
// Effective: 110% - 5% = 105% (capped at 100% usually)
```

---

## 8. Current Issues (Based on Console Logs)

### Issue 1: Missing Stat Definitions ✅ FIXED
**Problem**: `loggingSpeed`, `loggingChance`, etc. weren't defined in baseGameValues
**Solution**: Added all logging stats to statCalculator.js (same values as woodcutting)

### Issue 2: High Miss Rate
**Problem**: Seeing "❌ MISS! Evergreen Forest evaded your harvest attempt (82.3% > 5.0%)"
**Analysis**: This shows:
- Roll was 82.3% (random)
- Success threshold is only 5.0%
- This means effectiveChance is 5% (very low!)

**Root Cause**: Either:
1. Node has 95% evasion (way too high for T1)
2. Player base chance is 5% (should be 100%)
3. Stat calculation is broken

**Debug Steps**:
1. Check what `StatCalculator.calculateHarvestVsNode('logging', 'evergreen_forest')` returns
2. Verify `loggingChance: 100` is being read correctly
3. Check if node `evasion` is reasonable (should be 0-10% for T1)

### Issue 3: Missing EventBus Events ✅ FIXED
**Problem**: PersistentActionBar wasn't showing updates
**Solution**: Added EventBus.emit() calls to nodeCollectionSystem for:
- `gathering-started`
- `gathering-success`
- `gathering-miss` (need to add)
- `node-depleted`
- `gathering-stopped`

### Issue 4: Orphaned Nodes ✅ FIXED
**Problem**: Save file has `copperVein` but NodeRegistry doesn't
**Solution**: Added null check in updateNodeRespawns() to skip missing nodes

---

## 9. Expected Behavior

When everything works correctly:

1. **Skills tab shows**: "Available (3)" for mining
2. **Click "Available"**: Panel slides in showing Riverbed, Copper Vein, Iron Deposit
3. **Click "Start" on Riverbed**: Panel closes
4. **PersistentActionBar appears**: Shows "⛏️ Mining - Riverbed" with 10/10 health
5. **After 5 seconds**: First harvest completes
   - Success: "✅ Harvested: 2x Clay +25 XP (9/10 remaining)"
   - Bar updates to 9/10 health
   - Combo increases to 1x
   - Reward popup shows "+2x Clay"
6. **After another 5 seconds**: Second harvest
   - Critical: "💥 CRITICAL HARVEST!"
   - "✅ Harvested: 6x Clay 💥 +37 XP (8/10 remaining)"
   - Bar updates to 8/10 health
   - Combo increases to 2x
7. **Continues automatically** until 0/10 harvests
8. **When depleted**: "⏳ Riverbed depleted! Waiting for respawn (60s)..."
   - Bar shows respawn timer
   - After 60s: "♻️ Riverbed has respawned!"
   - Harvesting resumes automatically

---

## 10. Testing Commands

```javascript
// In browser console:

// Check if stats exist
StatCalculator.baseGameValues.loggingSpeed
// Should return: 5000

// Check node definition
NodeRegistry.getNode('evergreen_forest')
// Should return full node object

// Check harvest calculation
StatCalculator.calculateHarvestVsNode('logging', 'evergreen_forest')
// Should return: { playerStats, nodeStats, effective }

// Check skill state
GameEngine.state.skills.logging
// Should return: { level: X, exp: Y, unlocked: true }

// Force start harvesting
GameEngine.startNodeHarvesting('evergreen_forest')
// Should return: { success: true } or { success: false, reason: '...' }

// Check active node
GameEngine.state.nodeCollection.activeNode
// Should return: { nodeId, startTime, harvestTime, waitingForRespawn }
```

---

This is the complete flow from Skills UI → Node Selection → Harvesting → Visual Feedback!
