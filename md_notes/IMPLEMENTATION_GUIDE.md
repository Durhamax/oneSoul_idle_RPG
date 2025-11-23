# OneSoul Idle RPG - Implementation Guide

**Version**: 1.0
**Date**: 2025-01-19
**Purpose**: Concrete implementation examples and migration roadmap for the Foundation Specification

---

## 🎯 How to Use This Guide

This guide provides:
1. **Concrete Examples** of correct implementations
2. **Migration Steps** from current to target architecture
3. **Reference Implementations** you can copy and modify
4. **Common Pitfalls** and how to avoid them

Always reference **FOUNDATION_SPECIFICATION.md** first, then use this guide for implementation details.

---

## 🔧 Current State → Target State Migration

### Priority 1: Fix Critical Breaks (Week 1)

#### Fix Navigation UI
```javascript
// CURRENT PROBLEM: Navigation UI renders blank
// FILE: src/ui/navigationUI.js

// Debug steps:
1. Add console logging to narrow down failure point:
   console.log('[NavigationUI] Render started');
   console.log('[NavigationUI] State:', GameEngine.state.regions);
   console.log('[NavigationUI] Current region:', GameEngine.state.currentRegion);

2. Check if WorldTilemap is loaded:
   if (typeof WorldTilemap === 'undefined') {
       console.error('[NavigationUI] WorldTilemap not loaded!');
       return;
   }

3. Verify MapGridSystem initialization:
   if (!MapGridSystem || !MapGridSystem.hexGrid) {
       console.error('[NavigationUI] MapGridSystem not initialized!');
       MapGridSystem.init();
   }

// CORRECT IMPLEMENTATION:
const NavigationView = {
    lastState: null,
    
    render() {
        const currentState = {
            regions: GameEngine.state.regions,
            currentRegion: GameEngine.state.currentRegion,
            endurance: GameEngine.state.activeNavigation.endurance
        };
        
        // Cache check
        if (JSON.stringify(currentState) === this.lastState) return;
        
        const container = document.getElementById('navigation-container');
        if (!container) {
            console.error('[NavigationView] Container not found');
            return;
        }
        
        try {
            const html = this.buildNavigationHTML(currentState);
            container.innerHTML = html;
            this.lastState = JSON.stringify(currentState);
        } catch (error) {
            console.error('[NavigationView] Render failed:', error);
            container.innerHTML = '<div class="error">Navigation system offline</div>';
        }
    }
};
```

#### Fix Gathering System
```javascript
// CURRENT PROBLEM: Nodes show as depleted and unselectable
// FILE: src/systems/gatheringSystem.js

// Integration checklist:
1. Update index.html - ensure proper load order:
   <!-- Remove/comment old systems -->
   <!-- <script src="src/systems/miningSystem.js"></script> -->
   <!-- <script src="src/systems/nodeCollectionSystem.js"></script> -->
   
   <!-- Load new system -->
   <script src="src/systems/gatheringSystem.js"></script>

2. Update GameEngine initialization:
   init() {
       // Remove old system inits
       // MiningSystem.init(this);
       // NodeCollectionSystem.init(this);
       
       // Add new system
       GatheringSystem.init(this);
   }

3. Fix node state tracking:
   // Old way (WRONG):
   node.currentHealth = 0;  // Makes it look depleted
   
   // New way (CORRECT):
   GameEngine.state.gathering = {
       activeNode: {
           nodeId: 'iron_ore',
           remainingHits: 10,
           maxHits: 10,
           isActive: true
       }
   };

4. Update UI to use new state:
   // In skillsUI.js
   renderNode(nodeId) {
       const nodeState = GameEngine.state.gathering.nodes[nodeId];
       const isDepeleted = nodeState && nodeState.remainingHits <= 0;
       
       return `
           <div class="node ${isDepeleted ? 'depleted' : 'available'}"
                onclick="GatheringSystem.startGathering('${nodeId}')">
               ${NodeRegistry.get(nodeId).name}
               ${!isDepeleted ? `(${nodeState?.remainingHits || '?'} hits)` : '(Depleted)'}
           </div>
       `;
   }
```

### Priority 2: Complete Registry Migration (Week 2)

#### Example: Migrate Perks to Registry Pattern
```javascript
// CREATE: src/registries/perks/PerkRegistry.js
class PerkRegistry extends BaseRegistry {
    constructor() {
        super();
        this.environments = {
            production: {},
            development: {},
            test: {}
        };
    }
    
    validatePerk(perk) {
        const required = ['id', 'name', 'description', 'type', 'value'];
        for (const field of required) {
            if (!perk[field]) {
                throw new Error(`Perk missing required field: ${field}`);
            }
        }
        return true;
    }
    
    getByType(type) {
        return Object.values(this.getActive()).filter(perk => perk.type === type);
    }
}

// CREATE: src/registries/perks/data/production.js
PerkRegistry.register('production', {
    mining_speed: {
        id: 'mining_speed',
        name: 'Mining Speed',
        description: 'Increases mining speed',
        type: 'gathering',
        value: 0.1,  // 10% increase
        icon: '⛏️'
    },
    // ... more perks
});

// UPDATE: index.html
<script src="src/registries/perks/PerkRegistry.js"></script>
<script src="src/registries/perks/data/production.js"></script>

// UPDATE: Any code using old perks
// OLD: const perk = GameDefinitions.perks[perkId];
// NEW: const perk = PerkRegistry.get(perkId);
```

### Priority 3: Implement System Patterns (Week 3)

#### Example: Stateless System Implementation
```javascript
// CREATE: src/systems/gathering/GatheringSystem.js
const GatheringSystem = {
    // NO stored state in the system!
    // state is always passed in or accessed via GameEngine
    
    init(engine) {
        // Bind all methods
        engine.startGathering = this.startGathering.bind(engine);
        engine.processGatheringTick = this.processGatheringTick.bind(engine);
        engine.stopGathering = this.stopGathering.bind(engine);
        
        // Register event handlers
        EventBus.on('tool-equipped', this.handleToolChange);
        EventBus.on('skill-levelup', this.handleSkillLevelUp);
    },
    
    startGathering(nodeId) {
        // 'this' is GameEngine due to binding
        const node = NodeRegistry.get(nodeId);
        if (!node) {
            console.error(`[GatheringSystem] Node not found: ${nodeId}`);
            return false;
        }
        
        // Validate requirements
        const validation = this.validateGatheringRequirements(node);
        if (!validation.success) {
            EventBus.emit('gathering-failed', validation);
            return false;
        }
        
        // Update state through GameEngine
        this.state.gathering = {
            active: true,
            nodeId: nodeId,
            startTime: Date.now(),
            remainingHits: node.health || 10
        };
        
        // Emit event for UI updates
        EventBus.emit('gathering-started', { nodeId });
        return true;
    },
    
    processGatheringTick() {
        if (!this.state.gathering.active) return;
        
        const gatheringState = this.state.gathering;
        const node = NodeRegistry.get(gatheringState.nodeId);
        
        // Calculate success
        const skillLevel = this.state.skills[node.skillType].level;
        const successChance = this.calculateSuccessChance(skillLevel, node.difficulty);
        
        if (Math.random() < successChance) {
            // Success - award resources
            const resources = this.calculateResources(node, skillLevel);
            
            // Update state
            gatheringState.remainingHits--;
            
            // Add resources through proper system
            for (const [itemId, quantity] of Object.entries(resources)) {
                this.addItemToBank(itemId, quantity);
            }
            
            // Emit success event
            EventBus.emit('gathering-success', { nodeId: node.id, resources });
            
            // Check if depleted
            if (gatheringState.remainingHits <= 0) {
                this.stopGathering();
                EventBus.emit('node-depleted', { nodeId: node.id });
            }
        } else {
            // Miss
            EventBus.emit('gathering-miss', { nodeId: node.id });
        }
    }
};
```

### Priority 4: Excel Pipeline (Week 4)

#### Example: Excel to Registry Pipeline
```javascript
// CREATE: tools/excel-pipeline/excel-to-registry.js
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelToRegistry {
    constructor(config) {
        this.inputPath = config.inputPath;   // OneDrive path
        this.outputPath = config.outputPath; // Registry data path
        this.schemaPath = config.schemaPath; // Validation schema
    }
    
    async processItemsExcel() {
        // Read Excel file
        const workbook = XLSX.readFile(path.join(this.inputPath, 'Items.xlsx'));
        const sheet = workbook.Sheets['Items'];
        const data = XLSX.utils.sheet_to_json(sheet);
        
        // Transform to registry format
        const items = {};
        for (const row of data) {
            const item = {
                id: row.ID,
                name: row.Name,
                description: row.Description,
                category: row.Category,
                stackLimit: parseInt(row.StackLimit) || 1,
                value: parseInt(row.Value) || 0,
                stats: this.parseStats(row),
                requirements: this.parseRequirements(row)
            };
            
            // Validate against schema
            if (this.validateItem(item)) {
                items[item.id] = item;
            }
        }
        
        // Generate registry file
        const output = `// Auto-generated from Excel - DO NOT EDIT MANUALLY
// Generated: ${new Date().toISOString()}
// Source: Items.xlsx

ItemRegistry.register('production', ${JSON.stringify(items, null, 2)});
`;
        
        // Write to file
        fs.writeFileSync(
            path.join(this.outputPath, 'items/data/production.js'),
            output
        );
        
        console.log(`✅ Generated ${Object.keys(items).length} items from Excel`);
    }
    
    parseStats(row) {
        const stats = {};
        // Parse stat columns (ATK, DEF, HP, etc.)
        if (row.ATK) stats.attackDamage = parseInt(row.ATK);
        if (row.DEF) stats.defense = parseInt(row.DEF);
        if (row.HP) stats.maxHealth = parseInt(row.HP);
        // ... parse other stats
        return stats;
    }
}

// Excel template structure:
/*
Items.xlsx:
| ID          | Name        | Description          | Category | StackLimit | Value | ATK | DEF | HP  |
|-------------|-------------|---------------------|----------|------------|-------|-----|-----|-----|
| iron_sword  | Iron Sword  | A basic iron sword  | weapon   | 1          | 100   | 10  | 0   | 0   |
| health_pot  | Health Pot  | Restores 50 HP      | consume  | 20         | 50    | 0   | 0   | 50  |
*/
```

---

## 📊 Reference Implementations

### Complete Registry Implementation
```javascript
// Example of a fully-compliant registry
// FILE: src/registries/enemies/EnemyRegistry.js

import BaseRegistry from '../BaseRegistry.js';
import EnemySchema from './EnemySchema.js';
import EnemyValidator from './EnemyValidator.js';

class EnemyRegistry extends BaseRegistry {
    constructor() {
        super();
        this.schema = EnemySchema;
        this.validator = EnemyValidator;
        
        // Enemy-specific indexes for fast lookup
        this.byTier = new Map();
        this.byBiome = new Map();
        this.byType = new Map();
    }
    
    register(environment, enemies) {
        super.register(environment, enemies);
        
        // Build indexes
        for (const [id, enemy] of Object.entries(enemies)) {
            // Index by tier
            if (!this.byTier.has(enemy.tier)) {
                this.byTier.set(enemy.tier, []);
            }
            this.byTier.get(enemy.tier).push(enemy);
            
            // Index by biome
            for (const biome of enemy.biomes || []) {
                if (!this.byBiome.has(biome)) {
                    this.byBiome.set(biome, []);
                }
                this.byBiome.get(biome).push(enemy);
            }
            
            // Index by type
            if (!this.byType.has(enemy.type)) {
                this.byType.set(enemy.type, []);
            }
            this.byType.get(enemy.type).push(enemy);
        }
    }
    
    // Fast lookups using indexes
    getByTier(tier) {
        return this.byTier.get(tier) || [];
    }
    
    getByBiome(biome) {
        return this.byBiome.get(biome) || [];
    }
    
    getByType(type) {
        return this.byType.get(type) || [];
    }
    
    // Get enemies appropriate for player level
    getForLevel(level) {
        const tier = Math.floor(level / 20) + 1; // Tier 1-5
        return this.getByTier(tier);
    }
}

export default new EnemyRegistry();
```

### Complete System Implementation
```javascript
// Example of a fully-compliant system
// FILE: src/systems/combat/CombatSystem.js

const CombatSystem = {
    // Configuration (not state!)
    config: {
        baseAttackSpeed: 1.0,
        baseCritChance: 0.05,
        baseDodgeChance: 0.05
    },
    
    init(engine) {
        // Standard initialization
        console.log('[CombatSystem] Initializing...');
        
        // Bind all public methods
        engine.startCombat = this.startCombat.bind(engine);
        engine.attackEnemy = this.attackEnemy.bind(engine);
        engine.defendFromEnemy = this.defendFromEnemy.bind(engine);
        engine.endCombat = this.endCombat.bind(engine);
        engine.processCombatTick = this.processCombatTick.bind(engine);
        
        // Register event handlers
        EventBus.on('enemy-defeated', this.handleEnemyDefeated.bind(engine));
        EventBus.on('player-defeated', this.handlePlayerDefeated.bind(engine));
        EventBus.on('equipment-changed', this.recalculateCombatStats.bind(engine));
        
        // Initialize combat state if missing
        if (!engine.state.combat) {
            engine.state.combat = {
                active: false,
                currentEnemyId: null,
                playerHealth: 100,
                playerMaxHealth: 100,
                enemyHealth: 0,
                enemyMaxHealth: 0,
                lastAttackTime: 0,
                combatLog: []
            };
        }
        
        console.log('[CombatSystem] Initialized successfully');
    },
    
    startCombat(enemyId) {
        const enemy = EnemyRegistry.get(enemyId);
        if (!enemy) {
            console.error(`[CombatSystem] Enemy not found: ${enemyId}`);
            return false;
        }
        
        // Validate combat requirements
        if (this.state.combat.active) {
            console.warn('[CombatSystem] Already in combat');
            return false;
        }
        
        // Initialize combat state
        this.state.combat = {
            active: true,
            currentEnemyId: enemyId,
            playerHealth: this.state.combat.playerMaxHealth,
            enemyHealth: enemy.health,
            enemyMaxHealth: enemy.health,
            lastAttackTime: 0,
            combatLog: [],
            startTime: Date.now()
        };
        
        // Emit event
        EventBus.emit('combat-started', { enemyId, enemy });
        
        // Log
        this.addCombatLog(`Combat started with ${enemy.name}!`);
        
        return true;
    },
    
    processCombatTick() {
        if (!this.state.combat.active) return;
        
        const now = Date.now();
        const combat = this.state.combat;
        const enemy = EnemyRegistry.get(combat.currentEnemyId);
        
        // Player auto-attack
        const playerAttackSpeed = this.getPlayerAttackSpeed();
        const playerAttackCooldown = 1000 / playerAttackSpeed;
        
        if (now - combat.lastPlayerAttack >= playerAttackCooldown) {
            this.performPlayerAttack();
            combat.lastPlayerAttack = now;
        }
        
        // Enemy attack
        const enemyAttackCooldown = 1000 / (enemy.attackSpeed || 1);
        
        if (now - combat.lastEnemyAttack >= enemyAttackCooldown) {
            this.performEnemyAttack();
            combat.lastEnemyAttack = now;
        }
        
        // Check victory/defeat conditions
        if (combat.enemyHealth <= 0) {
            this.handleVictory();
        } else if (combat.playerHealth <= 0) {
            this.handleDefeat();
        }
    },
    
    performPlayerAttack() {
        const damage = this.calculatePlayerDamage();
        this.state.combat.enemyHealth -= damage;
        
        this.addCombatLog(`You dealt ${damage} damage!`);
        EventBus.emit('damage-dealt', { 
            target: 'enemy', 
            damage, 
            remaining: this.state.combat.enemyHealth 
        });
    },
    
    // Calculation methods (pure functions)
    calculatePlayerDamage() {
        const baseDamage = this.getPlayerAttackDamage();
        const critRoll = Math.random();
        const critChance = this.getPlayerCritChance();
        
        let damage = baseDamage;
        
        if (critRoll < critChance) {
            damage *= 2;
            EventBus.emit('critical-hit', { damage });
        }
        
        // Add variance
        damage *= (0.9 + Math.random() * 0.2);
        
        return Math.floor(damage);
    },
    
    // Helper methods that read state
    getPlayerAttackDamage() {
        let damage = 5; // Base damage
        
        // Add weapon damage
        const weapon = this.getEquippedWeapon();
        if (weapon?.stats?.attackDamage) {
            damage += weapon.stats.attackDamage;
        }
        
        // Add strength bonus
        damage += this.state.combatAttributes.strength * 2;
        
        return damage;
    }
};
```

---

## ⚠️ Common Pitfalls and Solutions

### Pitfall 1: State Mutation in UI
```javascript
// ❌ WRONG - UI directly mutating state
<button onclick="GameEngine.state.gold += 10">Add Gold</button>

// ✅ CORRECT - UI calls system method
<button onclick="CurrencySystem.addGold(10)">Add Gold</button>
```

### Pitfall 2: Registry Bypass
```javascript
// ❌ WRONG - Accessing old definitions
const item = GameDefinitions.items[itemId];

// ❌ WRONG - Direct registry access
const item = ItemRegistry.production[itemId];

// ✅ CORRECT - Using registry methods
const item = ItemRegistry.get(itemId);
```

### Pitfall 3: System Coupling
```javascript
// ❌ WRONG - Systems calling each other directly
CombatSystem.init = function(engine) {
    // Don't do this!
    MiningSystem.someMethod();
}

// ✅ CORRECT - Systems communicate via events
CombatSystem.init = function(engine) {
    EventBus.on('resources-needed', (data) => {
        // Handle event
    });
}
```

### Pitfall 4: Missing Error Handling
```javascript
// ❌ WRONG - No error handling
const enemy = EnemyRegistry.get(enemyId);
const damage = enemy.attackDamage * 2;  // Crashes if enemy not found

// ✅ CORRECT - Proper error handling
const enemy = EnemyRegistry.get(enemyId);
if (!enemy) {
    console.error(`[CombatSystem] Enemy not found: ${enemyId}`);
    return 0;
}
const damage = enemy.attackDamage * 2;
```

### Pitfall 5: Performance Issues
```javascript
// ❌ WRONG - Rendering on every tick
tick() {
    this.renderUI();  // 10 times per second!
}

// ✅ CORRECT - Render only on state change
tick() {
    if (this.hasStateChanged()) {
        this.renderUI();
    }
}
```

---

## 🎮 Testing Your Implementation

### Quick Test Commands
```javascript
// Test registry is working
console.log('Items loaded:', Object.keys(ItemRegistry.getActive()).length);

// Test system is initialized
console.log('Systems:', Object.keys(GameEngine.systems));

// Test state structure
console.log('State:', JSON.stringify(GameEngine.state, null, 2));

// Test event bus
EventBus.emit('test-event', { message: 'Hello' });

// Test gathering system
GatheringSystem.startGathering('iron_ore');

// Test combat system
CombatSystem.startCombat('goblin');
```

### Validation Checklist
```javascript
// Run this to validate your implementation
function validateImplementation() {
    const checks = {
        registriesLoaded: Object.keys(window).filter(k => k.includes('Registry')).length > 5,
        systemsInitialized: GameEngine.systems && Object.keys(GameEngine.systems).length > 5,
        stateStructured: GameEngine.state && GameEngine.state.player && GameEngine.state.combat,
        uiResponsive: document.querySelector('.active') !== null,
        noConsoleErrors: !console.error.called  // Requires console wrapper
    };
    
    console.table(checks);
    return Object.values(checks).every(v => v === true);
}
```

---

## 📚 Additional Resources

### File Templates
- Registry Template: See `PerkRegistry` example above
- System Template: See `CombatSystem` example above
- UI Component Template: See `NavigationView` example above
- Test Template: In testing section

### Naming Conventions Quick Reference
- Registry: `{Entity}Registry` (PascalCase)
- System: `{Feature}System` (PascalCase)
- UI View: `{Feature}View` (PascalCase)
- Data files: `{environment}.js` (lowercase)
- Test files: `{feature}.test.js` (lowercase)

### Performance Targets
- Registry lookup: <1ms
- System tick: <5ms
- UI render: <16ms
- Save operation: <100ms
- Load operation: <200ms

---

## 📅 Weekly Implementation Schedule

### Week 1: Critical Fixes
- Day 1-2: Fix Navigation UI
- Day 3-4: Fix Gathering System
- Day 5: Test equipment migration
- Day 6-7: Stabilization and testing

### Week 2: Registry Migration
- Day 1-2: Create remaining registries
- Day 3-4: Update all references
- Day 5: Remove definitions.js dependency
- Day 6-7: Testing and validation

### Week 3: System Refactor
- Day 1-2: Implement EventBus
- Day 3-4: Refactor to stateless systems
- Day 5: Update UI components
- Day 6-7: Integration testing

### Week 4: Excel Pipeline
- Day 1-2: Create Excel templates
- Day 3-4: Build conversion tools
- Day 5: Test pipeline
- Day 6-7: Documentation

### Week 5: PWA Setup
- Day 1-2: Service worker
- Day 3-4: Manifest and icons
- Day 5: Offline testing
- Day 6-7: Mobile optimization

---

This implementation guide should be used alongside FOUNDATION_SPECIFICATION.md to ensure consistent, high-quality development.
