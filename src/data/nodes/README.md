# Resource Node System - Complete Documentation

## Overview

The Resource Node System is a comprehensive, scalable framework for managing all resource gathering in the game. It replaces the old "health depletion" mechanic with an "instant harvest reward" system where each harvest (2-5 seconds) provides immediate resources.

## Core Concepts

### Harvest-Based System

- **Node Health** = number of harvests remaining before cooldown/respawn
- Each harvest action gives instant rewards (no grinding down health bars)
- Two-roll loot system: guaranteed resources + chance for rare drops
- Skill-based bonuses for speed, yield, and rare drop chance

### Unlimited Scaling

- No tier limits (tiers 1-100+)
- Node progression through skill levels
- Biome-specific distribution
- Flexible requirements and unlock conditions

## File Structure

```
src/data/nodes/
├── README.md                    # This file
├── nodeSchema.js                # Complete node template and constants
├── nodeRegistry.js              # Central registry and query system
├── nodeUtils.js                 # Helper functions and calculations
└── production/                  # Production nodes by skill type
    ├── mining.js                # Mining nodes (ores, stone, gems)
    ├── logging.js               # Logging nodes (trees, lumber)
    ├── fishing.js               # Fishing nodes (water spots)
    ├── hunting.js               # Hunting nodes (animal zones)
    ├── foraging.js              # Foraging nodes (plants, herbs)
    └── thieving.js              # Thieving nodes (targets, marks)
```

## Creating a New Node

### 1. Choose the Appropriate File

Add your node to the corresponding skill file in `production/`:
- Mining nodes → `production/mining.js`
- Logging nodes → `production/logging.js`
- Fishing nodes → `production/fishing.js`
- Hunting nodes → `production/hunting.js`
- Foraging nodes → `production/foraging.js`
- Thieving nodes → `production/thieving.js`

### 2. Use the Node Template

```javascript
NodeRegistry.production.your_node_id = {
    // === CORE IDENTITY (REQUIRED) ===
    id: "your_node_id",                 // Unique, snake_case
    name: "Display Name",               // What players see
    description: "Flavor text",         // Tooltip description
    icon: "🪨",                          // Emoji icon

    // === NODE TYPE (REQUIRED) ===
    nodeType: "mining",                 // Match skill type
    category: "ore_deposit",            // Organizational category

    // === PROGRESSION (REQUIRED) ===
    tier: 1,                            // 1-100+
    requiredSkillLevel: 1,              // Min skill level
    recommendedLevel: 1,                // Suggested char level

    // === HARVEST MECHANICS (REQUIRED) ===
    baseHealth: 10,                     // Default harvests
    minHealth: 8,                       // Min from exploration
    maxHealth: 15,                      // Max from exploration
    harvestTime: 3.0,                   // Seconds per harvest
    respawnTime: 30,                    // Seconds to respawn

    // === RESOURCE YIELDS (REQUIRED) ===
    resourceTable: [
        {
            itemId: "copper_ore",       // Item to give
            weight: 70,                 // Selection weight
            minYield: 1,                // Min quantity
            maxYield: 3,                // Max quantity
            skillScaling: true          // Scale with skill?
        }
    ],

    rareDropTable: null,                // Use default or override
    rareDropChance: 5,                  // Base % chance

    // === SKILL BONUSES ===
    yieldBonusPerLevel: 0.05,          // +5% yield per level
    rareBonusPerLevel: 0.02,           // +2% rare per level
    speedBonusPerLevel: 0.02,          // +2% speed per level

    // === XP REWARDS ===
    baseXP: 25,                        // XP per harvest
    xpScaling: "linear",               // linear/exponential/diminishing
    xpMultiplier: 1.0,                 // Global XP multiplier

    // === VISUAL & FEEDBACK ===
    rarity: "common",                  // UI rarity color
    color: "#cd7f32",                  // Theme color
    harvestSound: "mining",            // Sound effect
    particleEffect: "ore_sparkle",    // Visual effect

    // === REGIONAL DISTRIBUTION ===
    biomes: ["plains", "mountains"],   // Where it spawns
    spawnWeight: 100,                  // Relative frequency
    spawnConditions: null,             // Special conditions

    // === EXPLORATION MECHANICS ===
    discoveryWeight: 50,               // Discovery frequency
    upgradeChance: 30,                 // % chance to upgrade
    upgradeAmount: 2,                  // Health added on upgrade

    // === REQUIREMENTS & RESTRICTIONS ===
    requirements: {
        skill: "mining",               // Required skill
        skillLevel: 1,                 // Min skill level
        characterLevel: 0,             // Min char level
        quests: [],                    // Required quests
        tools: ["pickaxe"],            // Required tool types
        toolTier: 1                    // Min tool tier
    },

    // === SPECIAL MECHANICS ===
    isRenewable: true,                 // Respawns?
    isExhaustible: false,              // Can deplete permanently?
    exhaustionThreshold: null,         // Harvests before depletion

    multiHarvest: false,               // Multi-player harvest?
    instancedLoot: true,               // Each player gets loot?

    weatherDependent: false,           // Requires weather?
    timeDependent: false,              // Requires time of day?
    seasonalAvailability: null,        // null or ["spring", "summer"]

    // === PROGRESSION METADATA ===
    progressionPath: "copper_series",  // Upgrade path name
    nextTier: "iron_vein",             // Next tier node
    previousTier: null,                // Previous tier node

    unlockMessage: "You've discovered a copper vein!",

    // === STATUS & VERSIONING ===
    status: "production",              // production/dev/test/legacy/planned
    implemented: true,                 // Fully implemented?
    version: "1.0",                    // Game version
    developmentNotes: "",              // Internal notes

    // === FUTURE-PROOFING ===
    customData: {}                     // Extensible data
};
```

### 3. Validate Your Node

```javascript
// In browser console:
const validation = NodeUtils.validateNode(NodeRegistry.production.your_node_id);
console.log(validation);

// Or validate all nodes:
NodeUtils.printValidationReport();
```

## Using the Node System

### Querying Nodes

```javascript
// Get all active nodes
const allNodes = NodeRegistry.getAllActive();

// Get nodes by skill
const miningNodes = NodeRegistry.getBySkill('mining');

// Get nodes by tier
const tier1Nodes = NodeRegistry.getByTier(1);
const tier1to5 = NodeRegistry.getByTierRange(1, 5);

// Get nodes by biome
const forestNodes = NodeRegistry.getByBiome('forest');

// Get nodes available at skill level
const available = NodeRegistry.getAvailableAtLevel('mining', 15);

// Get all unlocked nodes for player
const unlocked = NodeRegistry.getUnlockedNodes(playerState);

// Get recommended nodes
const recommended = NodeUtils.getRecommendedNodes(playerState);
```

### Processing Harvests

```javascript
// Process a harvest action
const rewards = NodeUtils.processHarvest(node, playerState);

console.log(rewards);
// {
//     items: [{ itemId: 'copper_ore', quantity: 2 }],
//     rareDrops: [{ itemId: 'gem', quantity: 1 }],
//     xp: 25
// }
```

### Calculating Values

```javascript
// Calculate effective harvest time (with skill bonuses)
const harvestTime = NodeUtils.calculateHarvestTime(node, playerSkillLevel);

// Calculate resource yield (with skill scaling)
const yield = NodeUtils.calculateYield(resourceEntry, playerSkillLevel, requiredSkillLevel);

// Calculate rare drop chance (with skill bonuses)
const rareChance = NodeUtils.calculateRareChance(node, playerSkillLevel);

// Calculate XP reward (with scaling)
const xp = NodeUtils.calculateXP(node, harvestCount);
```

### Exploration Mechanics

```javascript
// Check if node can be upgraded
if (NodeUtils.canUpgradeNode(node, nodeState)) {
    const newHealth = NodeUtils.upgradeNodeHealth(node, nodeState);
    // Update node state
}

// Check if node can degrade
if (NodeUtils.canDegradeNode(node, nodeState)) {
    const newHealth = NodeUtils.degradeNodeHealth(node, nodeState);
    // Update node state
}
```

## Node Categories

### Mining
- **ore_deposit**: Copper, Tin, Iron, Silver, Gold
- **precious_metal**: Silver, Gold
- **fuel_source**: Coal
- **stone_deposit**: Stone, Granite
- **gem_deposit**: Gemstones

### Logging
- **hardwood_tree**: Oak, Maple
- **softwood_tree**: Pine, Willow
- **exotic_tree**: Special/rare trees

### Fishing
- **freshwater**: Ponds, Rivers, Lakes
- **saltwater**: Ocean, Deep Sea
- **ice_fishing**: Frozen lakes

### Hunting
- **small_game**: Rabbits, Birds
- **medium_game**: Deer, Boar
- **large_game**: Bears, Wolves

### Foraging
- **berry_source**: Berry bushes
- **fungus**: Mushrooms
- **medicinal**: Herbs, Plants
- **exotic_plant**: Rare flowers

### Thieving
- **pickpocket**: NPCs, Travelers
- **lockbox**: Chests, Safes
- **trap_disarm**: Traps, Mechanisms

## Progression Paths

Nodes can belong to progression paths that show upgrade routes:

```javascript
// Example: Copper → Iron → Steel → Mithril
NodeRegistry.production.copper_vein = {
    progressionPath: "metal_series",
    nextTier: "iron_vein",
    previousTier: null
};

NodeRegistry.production.iron_vein = {
    progressionPath: "metal_series",
    nextTier: "steel_vein",
    previousTier: "copper_vein"
};
```

## Skill Bonuses

All nodes grant bonuses based on skill level above requirement:

### Yield Bonus
- Default: +5% per level above requirement
- Example: Lv20 player on Lv10 node = +50% yield

### Rare Drop Bonus
- Default: +2% per level above requirement
- Example: Lv30 player on Lv10 node = +40% rare chance

### Speed Bonus
- Default: +2% faster per level above requirement
- Example: Lv25 player on Lv15 node = +20% speed (20% less time)

## XP Scaling Types

### Linear (Default)
- Constant XP per harvest
- Best for standard progression

### Exponential
- XP increases per harvest
- Good for rare/special nodes to reward persistence

### Diminishing
- XP decreases per harvest
- Prevents farming abuse on high-value nodes

## Biome Distribution

Nodes specify which biomes they can spawn in:

```javascript
biomes: ["plains", "mountains", "forest"]
```

Available biomes:
- plains
- forest
- mountains
- hills
- desert
- tundra
- swamp
- ocean
- coast
- underground
- river

## Special Mechanics

### Seasonal Availability
Some nodes only appear in certain seasons:

```javascript
seasonalAvailability: ["spring", "summer"]  // Only available in spring/summer
seasonalAvailability: null                  // Available year-round
```

### Weather Dependent
Some nodes require specific weather:

```javascript
weatherDependent: true   // Requires appropriate weather
```

### Time Dependent
Some nodes only available at certain times:

```javascript
timeDependent: true  // Day/night restrictions
```

### Exhaustible Nodes
Some nodes can be permanently depleted:

```javascript
isExhaustible: true
exhaustionThreshold: 100  // Depletes after 100 harvests
```

## Registry Configuration

### Dev Mode
Include development nodes:

```javascript
NodeRegistry.enableDevMode();
NodeRegistry.disableDevMode();
```

### Test Mode
Include test nodes:

```javascript
NodeRegistry.enableTestMode();
NodeRegistry.disableTestMode();
```

### Preview Mode
Include planned nodes:

```javascript
NodeRegistry.enablePreviewMode();
NodeRegistry.disablePreviewMode();
```

## Validation

### Validate Single Node
```javascript
const result = NodeUtils.validateNode(node);
// {
//     isValid: true/false,
//     errors: [...],
//     warnings: [...]
// }
```

### Validate All Nodes
```javascript
NodeUtils.printValidationReport();
// Prints comprehensive report to console
```

## Statistics

### Get Registry Stats
```javascript
const stats = NodeRegistry.getStatistics();
console.log(stats);
// {
//     production: { count: 25, bySkill: {...} },
//     dev: { count: 5, bySkill: {...} },
//     ...
// }
```

### Print Summary
```javascript
NodeRegistry.printSummary();
// Prints formatted summary to console
```

## Best Practices

### 1. Balance Tiers Carefully
- Tier 1: Skills 1-10
- Tier 2: Skills 11-20
- Tier 3: Skills 21-35
- Tier 4+: Progressive scaling

### 2. Resource Tables
- Use weighted selection for variety
- Primary resource: 60-80% weight
- Secondary resources: 15-30% weight
- Rare resources: 5-10% weight

### 3. Harvest Times
- Quick resources: 2-3 seconds
- Standard resources: 3-5 seconds
- Rare resources: 5-8 seconds

### 4. Respawn Times
- Common nodes: 20-40 seconds
- Uncommon nodes: 40-60 seconds
- Rare nodes: 60-120 seconds

### 5. XP Rewards
- Scale with tier and difficulty
- Multiply by 1.0-2.0 for special nodes
- Use diminishing for farmable nodes

### 6. Biome Distribution
- Common nodes: 3-5 biomes
- Uncommon nodes: 2-3 biomes
- Rare nodes: 1-2 specific biomes

## Integration with Game Engine

### Loading Nodes
Add to `index.html` before game engine:

```html
<!-- Node System -->
<script src="src/data/nodes/nodeSchema.js"></script>
<script src="src/data/nodes/nodeRegistry.js"></script>
<script src="src/data/nodes/nodeUtils.js"></script>

<!-- Node Definitions -->
<script src="src/data/nodes/production/mining.js"></script>
<script src="src/data/nodes/production/logging.js"></script>
<script src="src/data/nodes/production/fishing.js"></script>
<script src="src/data/nodes/production/hunting.js"></script>
<script src="src/data/nodes/production/foraging.js"></script>

<!-- Initialize -->
<script>
    NodeRegistry.init();
</script>
```

### Using in Game Systems
```javascript
// In exploration system
const availableNodes = NodeUtils.getAvailableNodesBySkill('mining', playerState);

// In harvesting system
const rewards = NodeUtils.processHarvest(currentNode, playerState);
GameEngine.addItems(rewards.items);
GameEngine.addSkillXP(currentNode.nodeType, rewards.xp);

// In UI
const harvestTime = NodeUtils.calculateHarvestTime(node, playerSkillLevel);
ProgressBar.show(harvestTime);
```

## Future Enhancements

### Potential Additions
1. Dynamic node spawning based on player activity
2. Node quality variations (poor/normal/rich)
3. Tool durability affecting harvest efficiency
4. Group harvesting with bonuses
5. Node ownership/territory systems
6. Special events that modify nodes temporarily
7. Node upgrades through player actions
8. Regional node scarcity mechanics

### Extension Points
The `customData` field allows for future mechanics without breaking compatibility:

```javascript
customData: {
    eventBonus: 2.0,           // Future: Event multipliers
    territoryOwner: null,      // Future: Territory system
    qualityVariance: 0.2,      // Future: Quality system
    customMechanics: {}        // Future: Any new mechanics
}
```

## Troubleshooting

### Node Not Appearing
1. Check `status` is "production"
2. Verify `implemented` is true
3. Check biome matches current region
4. Verify player meets requirements

### Incorrect Yields
1. Validate `skillScaling` is set correctly
2. Check min/max yield values
3. Verify skill level calculation

### XP Not Scaling
1. Check `xpScaling` type is valid
2. Verify `xpMultiplier` is set
3. Check harvest count tracking

## Support & Contributions

When adding new nodes:
1. Follow the schema template exactly
2. Run validation before committing
3. Test in multiple biomes
4. Document any special mechanics
5. Update this README if adding new categories

---

**Version:** 1.0
**Last Updated:** 2025-01-10
**Status:** Production Ready
