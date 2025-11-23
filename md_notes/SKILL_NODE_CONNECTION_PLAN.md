# Skill Card to Node Connection - Implementation Plan

## Current State Analysis

### ✅ What Already Exists

**1. Node Registry System** (`src/data/nodes/nodeRegistry.js`)
- ✅ Centralized node management
- ✅ `getBySkill(skillType)` - Get all nodes for a skill (e.g., 'mining')
- ✅ `getAvailableAtLevel(skillType, skillLevel)` - Filter by skill level requirement
- ✅ `meetsRequirements(node, playerState)` - Check if player can access node

**2. Node Definitions** (e.g., `src/data/nodes/production/mining.js`)
- ✅ Each node has `requirements` object:
  ```javascript
  requirements: {
      skill: "mining",          // Which skill
      skillLevel: 1,            // Min skill level needed
      characterLevel: 0,        // Min character level
      quests: [],               // Required quests
      tools: ["pickaxe"],       // Required tools
      toolTier: 1               // Min tool tier
  }
  ```
- ✅ Nodes also have:
  - `nodeType` - Matches skill type ('mining', 'logging', etc.)
  - `tier` - Difficulty tier (1-5)
  - `requiredSkillLevel` - Redundant with requirements.skillLevel

**3. Player State** (`GameEngine.state`)
- ✅ `skills[skillId]` - Player skill levels and XP
- ✅ `equipment.tool` - Currently equipped tool
- ✅ `characterLevel.level` - Overall character level
- ✅ `completedQuests` - Quest completion tracking

---

## What Needs to Be Built

### Phase 1: Update SkillCard Component (Immediate)

**Goal:** Connect the "Available" and "Locked" buttons to real node data.

**Changes to `src/ui/components/SkillCard.js`:**

```javascript
getNodeCounts(skillId) {
    const playerState = GameEngine.state;
    const skillLevel = playerState.skills[skillId]?.level || 1;

    // Map skill IDs to node types
    const skillToNodeType = {
        mining: 'mining',
        logging: 'logging',
        fishing: 'fishing',
        hunting: 'hunting',
        foraging: 'foraging',
        thieving: 'thieving',
        // Crafting skills don't have gathering nodes
        cooking: null,
        chemistry: null,
        smithing: null,
        mechanics: null,
        electronics: null,
        textiles: null,
        engineering: null,
        navigation: null
    };

    const nodeType = skillToNodeType[skillId];

    // If skill has no nodes (crafting skills), return zeros
    if (!nodeType) {
        return {
            availableCount: 0,
            lockedCount: 0,
            lockedExamples: []
        };
    }

    // Get all nodes for this skill type
    const allNodes = NodeRegistry.getBySkill(nodeType);

    // Separate available vs locked
    const availableNodes = [];
    const lockedNodes = [];

    for (const node of allNodes) {
        // Check if player meets requirements
        if (NodeRegistry.meetsRequirements(node, playerState)) {
            availableNodes.push(node);
        } else {
            lockedNodes.push(node);
        }
    }

    // Create locked examples (top 3 closest to unlocking)
    const lockedExamples = lockedNodes
        .map(node => ({
            nodeId: node.id,
            name: node.name,
            levelRequired: node.requirements.skillLevel,
            levelsAway: node.requirements.skillLevel - skillLevel,
            reason: this.getLockedReason(node, playerState)
        }))
        .filter(ex => ex.levelsAway > 0)  // Only show if it's a level issue
        .sort((a, b) => a.levelsAway - b.levelsAway)  // Closest first
        .slice(0, 3);  // Top 3

    return {
        availableCount: availableNodes.length,
        lockedCount: lockedNodes.length,
        lockedExamples
    };
}

getLockedReason(node, playerState) {
    const req = node.requirements;
    const skillLevel = playerState.skills[req.skill]?.level || 1;

    // Check skill level
    if (skillLevel < req.skillLevel) {
        return `Requires ${req.skill} level ${req.skillLevel}`;
    }

    // Check character level
    if (req.characterLevel && playerState.characterLevel.level < req.characterLevel) {
        return `Requires character level ${req.characterLevel}`;
    }

    // Check tool
    if (req.tools && req.tools.length > 0) {
        const hasRequiredTool = NodeRegistry.hasRequiredTool(
            req.tools,
            req.toolTier,
            playerState
        );
        if (!hasRequiredTool) {
            return `Requires ${req.tools[0]} (Tier ${req.toolTier})`;
        }
    }

    // Check quests
    if (req.quests && req.quests.length > 0) {
        for (let questId of req.quests) {
            if (!playerState.completedQuests.includes(questId)) {
                return `Requires quest: ${questId}`;
            }
        }
    }

    return 'Requirements not met';
}
```

---

### Phase 2: Create NodePanel Component (Next)

**Goal:** Display filtered node list when "Available" or "Locked" button is clicked.

**Create `src/ui/components/NodePanel.js`:**

```javascript
class NodePanel extends UIComponent {
    constructor() {
        super();
        this.element = null;
        this.currentSkill = null;
        this.currentFilter = 'available';
        this.isOpen = false;
    }

    init() {
        this.element = this.getElement('nodePanel');

        // Listen for show panel events from SkillCard
        this.on('show-node-panel', (data) => {
            this.showPanel(data.skillId, data.filterType);
        });

        console.log('✅ NodePanel initialized');
    }

    showPanel(skillId, filterType) {
        this.currentSkill = skillId;
        this.currentFilter = filterType;
        this.isOpen = true;

        this.render();

        // Slide in animation
        this.element.classList.add('open');
    }

    hidePanel() {
        this.isOpen = false;
        this.element.classList.remove('open');
    }

    render() {
        if (!this.element || !this.isOpen) return;

        const nodes = this.getFilteredNodes();

        const html = `
            <div class="node-panel-header">
                <h3>${this.currentSkill} - ${this.currentFilter} Nodes</h3>
                <button class="close-btn" onclick="nodePanel.hidePanel()">✕</button>
            </div>

            <div class="node-list">
                ${nodes.map(node => this.renderNodeItem(node)).join('')}
            </div>
        `;

        this.setHTML(this.element, html);
    }

    getFilteredNodes() {
        const skillToNodeType = {
            mining: 'mining',
            logging: 'logging',
            // ... etc
        };

        const nodeType = skillToNodeType[this.currentSkill];
        if (!nodeType) return [];

        const allNodes = NodeRegistry.getBySkill(nodeType);
        const playerState = GameEngine.state;

        if (this.currentFilter === 'available') {
            return allNodes.filter(node =>
                NodeRegistry.meetsRequirements(node, playerState)
            );
        } else {
            return allNodes.filter(node =>
                !NodeRegistry.meetsRequirements(node, playerState)
            );
        }
    }

    renderNodeItem(node) {
        const isLocked = this.currentFilter === 'locked';

        return `
            <div class="node-item ${isLocked ? 'locked' : ''}"
                 onclick="nodePanel.selectNode('${node.id}')">
                <div class="node-icon">${node.icon}</div>
                <div class="node-info">
                    <div class="node-name">${node.name}</div>
                    <div class="node-description">${node.description}</div>
                    ${isLocked ? this.renderLockInfo(node) : ''}
                </div>
                ${!isLocked ? '<button class="start-btn">Start</button>' : ''}
            </div>
        `;
    }

    renderLockInfo(node) {
        const playerState = GameEngine.state;
        const reason = this.getLockedReason(node, playerState);

        return `<div class="lock-info">🔒 ${reason}</div>`;
    }

    selectNode(nodeId) {
        if (this.currentFilter === 'available') {
            // Start gathering this node
            EventBus.emit('start-gathering', { nodeId });
            this.hidePanel();
        }
    }
}
```

---

### Phase 3: Integration Points

**1. NodeRegistry is already available globally**
- ✅ Loaded via `src/data/nodes/nodeRegistry.js`
- ✅ Methods ready to use

**2. SkillCard already emits the event**
- ✅ `EventBus.emit('show-node-panel', { skillId, filterType })`

**3. Need to ensure NodeRegistry methods work with player state**
- ⚠️ `meetsRequirements()` expects specific state structure
- ⚠️ May need to verify tool checking logic works

---

## Summary: Do Nodes Need New Definitions?

### ❌ NO - Nodes Already Have What We Need!

**Existing node properties cover everything:**

```javascript
// From mining.js example:
requirements: {
    skill: "mining",          // ✅ Already defined
    skillLevel: 1,            // ✅ Already defined
    characterLevel: 0,        // ✅ Already defined
    quests: [],               // ✅ Already defined
    tools: ["pickaxe"],       // ✅ Already defined
    toolTier: 1               // ✅ Already defined
}
```

**The logic for available vs locked is already implemented:**
- ✅ `NodeRegistry.meetsRequirements()` checks all requirements
- ✅ `NodeRegistry.getAvailableAtLevel()` filters by skill level
- ✅ `NodeRegistry.hasRequiredTool()` validates tool requirements

---

## Implementation Steps

### Step 1: Update SkillCard (10 minutes)
Replace the mock `getNodeCounts()` method with real NodeRegistry queries.

### Step 2: Test in Browser (5 minutes)
- Open Skills tab
- Check node counts update correctly
- Verify locked examples show real nodes

### Step 3: Create NodePanel Component (30 minutes)
- Build slide-in panel with node list
- Add filtering logic
- Style with dopamine-friendly animations

### Step 4: Wire Start Button (10 minutes)
- Connect "Start" button to gathering system
- Emit events to trigger node collection

---

## Questions Answered

**Q: Do nodes need additional definitions for available vs unavailable?**
**A:** No! The `requirements` object already has everything:
- ✅ `skillLevel` - Determines if player can access
- ✅ `tools` - Requires specific tool equipped
- ✅ `quests` - Blocks until quests completed
- ✅ `characterLevel` - Additional level gate

**Q: What determines if a node is "available"?**
**A:** `NodeRegistry.meetsRequirements(node, playerState)` checks:
1. Player skill level >= node's required skill level
2. Player has required tool equipped (if any)
3. Player has correct tool tier (if specified)
4. Player completed required quests (if any)
5. Player character level high enough (if specified)

**Q: What needs to be built?**
**A:** Just the UI connection layer:
1. Update SkillCard to query NodeRegistry
2. Create NodePanel to display filtered nodes
3. Wire Start button to gathering system

The data layer is complete! 🎉

---

## Next Action

**Recommended:** Start with Step 1 - Update `getNodeCounts()` in SkillCard to use real data.

This will immediately show accurate node counts and unlock the progression flow!
