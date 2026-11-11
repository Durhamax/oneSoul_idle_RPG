# OneSoul Idle RPG - Crafting System Design Document

## System Overview

### Core Philosophy
- **Moderate Complexity Path**: Fixed quantity outputs with variable rarity outcomes
- **Meaningful Choices**: Players must make trade-offs in specialization and resource allocation
- **2-Year Content Timeline**: Balanced progression for long-term engagement
- **Item Sink Economy**: Engineering perfection system and technology consumption create continuous material demand

## The 6+1 Crafting Skills

### Material Processing & Crafting Chain
```
GATHERING → REFINING → CRAFTING → ASSEMBLY → USE

Mining → SMITHING (refinement) → Materials → MECHANICS (weapons)
                                            → TEXTILES (armor)
                                            → ELECTRONICS (components)
                                            → ENGINEERING (assembly)
```

### 1. **SMITHING** (Material Processing)
**Primary Role**: Raw material refinement and armor plating production
- **NOT weapon crafting** - purely material processing
- Ore → Ingots (copper, iron, steel, titanium)
- Ingots → Sheets/Plates/Wire
- Armor Plating components for all armor types
- Basic metal components (bolts, frames)

**Progression**:
- Lvl 1-25: Basic processing (50% yield from ore)
- Lvl 26-50: Improved efficiency (75% yield)
- Lvl 51-75: Advanced alloys (100% yield + special materials)
- Tier 10 Workstation: Chance for "Perfect" materials (bonus stats to final items)

### 2. **MECHANICS** (Weapons & Precision Parts)
**Primary Role**: ALL weapon manufacturing and precision components
- Firearms (pistols → rifles → heavy weapons)
- Machined blades (combat knives, tactical)
- Weapon attachments (grips, stocks, magazines, barrels)
- Precision parts (gears, pistons, bearings)
- Ammo casings (Chemistry fills them)

**Uses Smithing Outputs**:
- Steel Ingots + Precision Parts = Rifle
- Titanium Plates + Gears = Advanced Rifle

### 3. **ELECTRONICS** (Digital Components)
**Primary Role**: High-tech components and smart devices
- Circuits, processors, sensors, batteries
- Smart attachments (digital scopes, laser sights)
- Drone parts
- Tech components for Engineering

**Material Chain**:
- Copper Wire + Silicon = Circuit Board
- Gold Wire + Processor = Advanced Circuit

### 4. **TEXTILES** (ALL Armor Manufacturing)
**Primary Role**: Combines materials into finished armor
- Light Armor: Fabric + Light Plating
- Heavy Armor: Minimal Fabric + Heavy Plating  
- Tech Armor: Smart Fabric + Electronics
- Camo wraps and overlays
- Bags/storage (future feature)

**Example Recipe**:
- Tactical Vest = Kevlar Fabric + Steel Plates + Trauma Pad

### 5. **CHEMISTRY** (Consumables & Ammo)
**Primary Role**: Potions, explosives, and ammunition
- Health/buff potions
- Explosives (grenades, charges)
- Bullet production (fills casings from Mechanics)
- Special ammo types (incendiary, cryo, shock rounds)
- Chemical components for other skills

**Tier 10 Benefits** (solving consumable value problem):
- Compound potions with multiple effects
- 5x output multiplier
- 10% chance for "Perfect" version (doesn't consume charges)
- Catalyst effects (next 3 potions are free)

### 6. **COOKING** (Food & Biological Materials)
**Primary Role**: Healing items and biological components
- Food buffs (HP regen, stat boosts)
- Biological materials for other crafts
- Preserved rations for tech

**Tier 10 Benefits**:
- Multi-stack foods (multiple buffs)
- 5x batch multiplication
- "Perfect Dish" chance (permanent buff until replaced)
- Well Fed bonus (doubles other consumable effects)

### 7. **ENGINEERING** (Assembly & Perfection)
**Primary Role**: Combines components into technologies and perfects equipment
- **NO WORKSTATION** - skill-based progression only
- Technology Assembly (for tech slots)
- Equipment Perfection System (combine 10 items for rarity upgrade)
- Component Salvaging
- Future: Modification/Reforging

## Workstation Upgrade System

### Currency: Blueprints
- **Sources**: Mission rewards, combat drops (0.5-5%), thieving (1-10%)
- **Types**: Common (Tier 1-3), Advanced (Tier 4-7), Masterwork (Tier 8-10)
- **Material Sink**: Higher tiers require materials + blueprints

### Upgrade Benefits by Type

**Equipment Crafting** (Smithing, Mechanics, Electronics, Textiles):
- Tier 1: Base recipes, 0% rarity bonus, 1 queue slot
- Tier 5: +20% rarity, 3 queue slots, batch craft x2
- Tier 10: +75% rarity, 5 queue slots, 5% Mythic chance, Perfect craft chance

**Consumable Crafting** (Chemistry, Cooking):
- Tier 1: 1.0x output, 1 queue slot
- Tier 5: 2.0x output, 3 queue slots, chance for bonus batch
- Tier 10: 5.0x output, 5 queue slots, Perfect craft, Transmutation recipes

## Dual Progression System

### Workstation Tier (Costs Blueprints)
**Controls**:
- Recipe unlocks (hard gates)
- Base rarity chances
- Queue slots
- Special features (batch crafting)

### Skill Level (From XP)
**Controls**:
- Execution quality (bonus rarity)
- Output quantity (especially consumables)
- Crafting speed
- Material efficiency
- Mastery bonuses

### Progression Formulas

**Equipment Rarity**:
```
Final Rarity Chance = Base (Workstation) + Skill Bonus + Other Modifiers

Example at Mechanics Level 50:
Workstation Tier 3: Base rare chance = 10%
Skill Level 50: +25% rare chance (0.5% per level)
Final: 35% chance for rare
```

**Consumable Output**:
```
Final Output = Base Amount × Workstation Multiplier × Skill Multiplier

Example at Chemistry Level 50:
Base Recipe: 5 potions
Workstation Tier 3: 1.5x multiplier
Skill Level 50: 2.0x multiplier
Final: 5 × 1.5 × 2.0 = 15 potions
```

## Character Attribute Integration

### Attribute → Crafting Skill Mapping

| Skill | Primary Attribute | Secondary Attribute | Key Benefits |
|-------|------------------|-------------------|--------------|
| **Smithing** | Strength | Perception | Speed +2%/point, Material yield +1%/point |
| **Mechanics** | Perception | Intellect | Rarity +0.5%/point, Attachment slot chance |
| **Electronics** | Intellect | Perception | Complexity limit, Bonus stats +0.5%/point |
| **Textiles** | Mobility | Perception | Speed +2%/point, Camo effectiveness +1%/point |
| **Chemistry** | Intellect | Health | Potency +1%/point, Safety bonus +2%/point |
| **Cooking** | Health | Strength | Food quality +1%/point, Stack size +2%/point |
| **Engineering** | Intellect | Stealth | Tech complexity +3/10 int, Salvage +1%/point |

### Why This Distribution Works
- Avoids Intellect dominance (only primary for 2/6 skills)
- Creates diverse viable builds
- Natural synergies with gathering skills
- Every attribute has crafting value
- Defense is combat-only (maintains its identity)

## Engineering's Perfection System

### Core Mechanic
Combine 10 items of same type to attempt rarity upgrade

### Success Rates (Base)
- Common → Uncommon: 60%
- Uncommon → Rare: 40%
- Rare → Epic: 25%
- Epic → Legendary: 15%
- Higher tiers: 10%, 5%, 3%, 1%
- Engineering Level adds +0.5% per level

### Mixed Rarity System
```javascript
Rarity Weights:
Common: 1, Uncommon: 3, Rare: 9, Epic: 27, etc.

Example: 5 Rare + 5 Uncommon
Total Weight: (5×9) + (5×3) = 60
Average: 6 (between uncommon and rare)
Result: Lower success chance but targets Rare
```

### Engineering Level Benefits
- Level 1-25: Can perfect up to Epic, failure destroys all
- Level 26-50: Can perfect to Legendary, failure returns 1 item
- Level 51-75: Can perfect to Mythic, failure returns 3 items, 25% perk transfer
- Level 76-100: Can perfect to Creator, failure returns 5 items, guaranteed success option

## Technology System (Engineering Assembly)

### Example Technology Item
**Recon Drone** (Tech Slot Item):
- Components Required:
  - Airframe (Mechanics)
  - Propeller x2 (Smithing/Mechanics)
  - Battery (Chemistry/Electronics)
  - Camera (Electronics)
- Assembly: Engineering Skill Level 10
- Output: 500 charges, +20 Perception
- Consumption: 1 charge per combat attack/defense

### Technology Tiers
- Level 1-10: Basic (2-3 components) - Flashlight, Radio
- Level 11-25: Intermediate (4-5 components) - Shield Generator, Recon Drone
- Level 26-50: Advanced (6-8 components) - Combat Exoskeleton, Cloaking Device
- Level 51+: Legendary (10+ components) - Temporal Manipulator, Nanite Swarm

## Critical Item Categories & Distribution

### Items Needed Across All Levels
1. **Weapons** (Mechanics) - All damage types
2. **Armor** (Textiles + Smithing plating) - All armor types
3. **Camo Effects** (Textiles) - Biome-specific stealth
4. **Food** (Cooking) - Healing and buffs
5. **Potions** (Chemistry) - Instant effects and buffs
6. **Ammo** (Chemistry + Mechanics) - Arrows and bullets
7. **Weapon Attachments** (Mechanics/Electronics) - 6 slot types
8. **Technology Components** (All skills) - For Engineering assembly

### Damage/Armor Type Distribution

**Damage Types by Skill**:
- Pierce: Mechanics (guns), some Smithing (arrows)
- Incendiary: Chemistry (special ammo)
- Explosive: Chemistry (grenades)
- Shock: Electronics (energy weapons)
- Cryo: Chemistry (cryo rounds)

**Armor Types by Material**:
- Plated: Heavy Smithing materials
- Insulated: Textiles (cloth/fabric)
- Biological: Textiles (leather) + Cooking
- Droid: Electronics components
- Airborne: Light Textiles + Electronics

## Material Progression by Region Tier

**Tier 1 (Starting)**: Copper, Wood, Fiber, Meat, Herbs
- Can craft: Basic weapons, cloth armor, simple food

**Tier 2**: Iron, Hardwood, Leather, Fish, Minerals
- Can craft: Iron tier, leather armor, potions

**Tier 3**: Steel, Carbon, Silk, Rare Herbs
- Can craft: Guns, advanced armor, complex food

**Tier 4**: Titanium, Composites, Chemicals, Exotic Materials
- Can craft: High-tech weapons, specialized ammo

**Tier 5 (Endgame)**: Mithril, Adamantine, Quantum Materials
- Can craft: Legendary everything

## Balancing Considerations

### Power Distribution
- 30% from attributes
- 35% from skill level  
- 35% from workstation tier

### Item Sink Economics
- Technologies consume 1 charge per action (massive sink)
- Perfection system: 10 items → 1 item
- Failed perfections can be salvaged (50% materials)
- Higher tier recipes require more materials

### Recipe Discovery
- **Base Recipes**: Unlocked by skill level (predictable progression)
- **Advanced Recipes**: Found as loot (discovery dopamine)
- **Legendary Recipes**: Mission chain rewards
- **No reverse engineering required** (keeps it simple)

## Strategic Player Decisions

1. **Specialization vs Generalization**
   - Focus blueprints on one workstation vs spread evenly
   - Maximize one crafting skill vs level all equally

2. **Quality vs Quantity**
   - High workstation + low skill = slow, high quality
   - Low workstation + high skill = fast, lower quality

3. **Material Allocation**
   - Save for perfection attempts vs craft immediately
   - Craft consumables for immediate use vs save for tech

4. **Attribute Build Impact**
   - Strength build excels at Smithing/Cooking
   - Intellect build excels at Electronics/Chemistry
   - Balanced builds have no weaknesses but no specialization

## Implementation Priority

1. **Phase 1: Foundation**
   - Fix RecipeRegistry structure
   - Implement basic crafting for all 6 skills
   - Material validation system
   - Basic workstation tiers (1-3)

2. **Phase 2: Depth**
   - Dual progression system (skill + workstation)
   - Attribute integration
   - Blueprint drops and economy
   - Workstation tiers 4-10

3. **Phase 3: Engineering**
   - Technology assembly
   - Perfection system
   - Salvaging mechanics

4. **Phase 4: Polish**
   - Recipe mastery system
   - Special combinations/easter eggs
   - Cross-skill synergies
   - UI/UX optimization

## Open Questions for Refinement

1. **Ammo Crafting**: Batches of 100-500 or smaller with higher impact?
2. **Attachment Rarity**: Should attachments have rarity tiers affecting bonuses?
3. **Camo Duration**: Time-based (30 min) or use-based (50 attempts)?
4. **Component Standardization**: Generic "Circuit" or tier-specific "Advanced Circuit"?
5. **Failure Punishment**: Destroy all, return some, or downgrade for perfection?
6. **Blueprint Trading**: Allow conversion (10 Common → 1 Advanced)?

## Key Success Metrics

- Clear progression path from early to endgame
- Every crafting skill feels unique and valuable
- Multiple viable strategies for different playstyles
- Continuous material sink maintaining economy
- 2-year content pipeline without overwhelming complexity

---

# Implementation Foundation for Claude Code

## Key Design Changes From Original
1. **Tailoring** replaces Textiles (naming consistency)
2. **Weapon attachments REMOVED** - No attachment system needed
3. **Engineering has NO attribute mappings** - Simplified
4. **Recipe unlocks by skill level ONLY** - Workstations don't gate recipes
5. **Engineering skill gates workstation upgrades** - Must have engineering level for higher tiers
6. **Simplified attribute bonuses** - Only speed and material savings
7. **Material savings chance** is a key mechanic across all skills

## Registry Structures

### 1. Recipe Registry

```javascript
// src/data/recipes/recipeRegistry_NEW.js
const RecipeRegistry = {
    // Environment Registries
    production: {
        smithing: {},     // Material processing only
        mechanics: {},    // Weapons only (no attachments)
        electronics: {},  // Components
        tailoring: {},    // All armor
        chemistry: {},    // Consumables and ammo propellant
        cooking: {}       // Food and bio materials
    },
    dev: {},
    test: {},
    
    config: {
        includeDevRecipes: false,
        includeTestRecipes: false
    },
    
    /**
     * Register recipes to a specific crafting skill
     */
    registerRecipes(skill, environment, recipes) {
        if (!this[environment]) {
            console.error(`[RecipeRegistry] Invalid environment: ${environment}`);
            return;
        }
        
        if (!this[environment][skill]) {
            this[environment][skill] = {};
        }
        
        Object.assign(this[environment][skill], recipes);
        console.log(`[RecipeRegistry] Registered ${Object.keys(recipes).length} ${skill} recipes`);
    },
    
    /**
     * Get available recipes based on skill level only
     */
    getAvailableRecipes(skill, playerState) {
        const allRecipes = this.getRecipesBySkill(skill);
        const skillLevel = playerState.skills[skill]?.level || 0;
        
        // Recipes unlock by skill level only, not workstation tier
        return Object.entries(allRecipes).filter(([id, recipe]) => {
            return recipe.skillLevelRequired <= skillLevel;
        }).reduce((acc, [id, recipe]) => {
            acc[id] = recipe;
            return acc;
        }, {});
    }
};
```

### 2. Simplified Recipe Schema

```javascript
// src/data/recipes/recipeSchema.js
const RecipeSchema = {
    id: 'string',
    name: 'string',
    skill: 'string', // smithing, mechanics, electronics, tailoring, chemistry, cooking
    
    requirements: {
        skillLevelRequired: 'number',  // Only skill level gates recipes
        engineeringLevel: 'number?'    // Optional, for advanced recipes
    },
    
    materials: [
        {
            itemId: 'string',
            quantity: 'number'
        }
    ],
    
    outputs: {
        itemId: 'string',
        
        // Equipment (fixed quantity, variable rarity)
        quantity: 1,
        rarityWeights: {
            common: 60,
            uncommon: 25,
            rare: 10,
            epic: 4,
            legendary: 1
        },
        
        // Consumables (variable quantity)
        baseQuantity: 'number?',  // For consumables
    },
    
    crafting: {
        baseTime: 'number',       // milliseconds
        experienceGain: 'number'
    }
};
```

### 3. Simplified Workstation System

```javascript
// src/data/workstations/workstationRegistry.js
const WorkstationRegistry = {
    stations: {
        smithing: { name: "Forge", type: "equipment" },
        mechanics: { name: "Workshop", type: "equipment" },
        electronics: { name: "Tech Lab", type: "equipment" },
        tailoring: { name: "Loom", type: "equipment" },
        chemistry: { name: "Laboratory", type: "consumable" },
        cooking: { name: "Kitchen", type: "consumable" }
    },
    
    /**
     * Get tier benefits for a workstation
     * Engineering level gates access to higher tiers
     */
    getTierBenefits(skill, tier, engineeringLevel) {
        // Engineering level requirement: tier * 10
        if (engineeringLevel < tier * 10) {
            return null; // Cannot use this tier
        }
        
        const station = this.stations[skill];
        
        if (station.type === 'equipment') {
            return {
                rarityBonus: tier * 7.5,              // +7.5% per tier
                materialSavingsChance: tier * 0.05,   // +5% per tier
                craftSpeedMultiplier: 1 + (tier * 0.1)
            };
        } else {
            // Consumable stations
            return {
                outputMultiplier: 1 + (tier * 0.4),   // 1.0x to 5.0x
                materialSavingsChance: tier * 0.05,   // +5% per tier
                craftSpeedMultiplier: 1 + (tier * 0.1)
            };
        }
    },
    
    /**
     * Get upgrade cost for next tier
     */
    getUpgradeCost(currentTier) {
        const nextTier = currentTier + 1;
        
        return {
            blueprints: {
                type: nextTier <= 3 ? 'common' : nextTier <= 7 ? 'advanced' : 'masterwork',
                quantity: nextTier * 5
            },
            materials: {
                // Materials from previous tier crafting
                itemId: `tier${currentTier}_material`,
                quantity: currentTier * 10
            }
        };
    }
};
```

## Simplified Crafting System

```javascript
// src/systems/craftingSystem.js
const CraftingSystem = {
    init(engine) {
        // Bind methods following standard pattern
        engine.startCrafting = this.startCrafting.bind(engine);
        engine.processCrafting = this.processCrafting.bind(engine);
        engine.completeCraft = this.completeCraft.bind(engine);
        engine.upgradeWorkstation = this.upgradeWorkstation.bind(engine);
        
        // Initialize state
        if (!engine.state.crafting) {
            engine.state.crafting = {
                activeQueues: {
                    smithing: [],
                    mechanics: [],
                    electronics: [],
                    tailoring: [],
                    chemistry: [],
                    cooking: []
                }
            };
        }
        
        if (!engine.state.workstations) {
            engine.state.workstations = {
                smithing: { tier: 1 },
                mechanics: { tier: 1 },
                electronics: { tier: 1 },
                tailoring: { tier: 1 },
                chemistry: { tier: 1 },
                cooking: { tier: 1 }
            };
        }
        
        console.log('[CraftingSystem] Initialized');
    },
    
    /**
     * Start crafting a recipe
     */
    startCrafting(recipeId, quantity = 1) {
        const recipe = RecipeRegistry.getRecipe(recipeId);
        if (!recipe) {
            return { success: false, reason: 'Recipe not found' };
        }
        
        const skill = recipe.skill;
        const playerSkillLevel = this.state.skills[skill]?.level || 0;
        const workstationTier = this.state.workstations[skill]?.tier || 0;
        const engineeringLevel = this.state.skills.engineering?.level || 0;
        
        // Check skill level requirement
        if (playerSkillLevel < recipe.requirements.skillLevelRequired) {
            return { success: false, reason: `Requires ${skill} level ${recipe.requirements.skillLevelRequired}` };
        }
        
        // Check engineering level for this workstation tier
        if (engineeringLevel < workstationTier * 10) {
            return { success: false, reason: `Requires Engineering level ${workstationTier * 10} for tier ${workstationTier} workstation` };
        }
        
        // Validate and consume materials
        for (const material of recipe.materials) {
            const hasAmount = this.state.bank.items[material.itemId]?.quantity || 0;
            if (hasAmount < material.quantity * quantity) {
                return { success: false, reason: `Need ${material.quantity * quantity} ${material.itemId}` };
            }
        }
        
        // Check for material savings
        const tierBenefits = WorkstationRegistry.getTierBenefits(skill, workstationTier, engineeringLevel);
        let materialsConsumed = true;
        
        if (Math.random() < tierBenefits.materialSavingsChance) {
            materialsConsumed = false;
            console.log('[CraftingSystem] Material savings triggered!');
        }
        
        if (materialsConsumed) {
            for (const material of recipe.materials) {
                this.removeItemFromBank(material.itemId, material.quantity * quantity);
            }
        }
        
        // Calculate craft time
        const craftTime = this.calculateCraftTime(recipe, skill, workstationTier);
        
        // Add to queue
        const craftJob = {
            id: `craft_${Date.now()}_${Math.random()}`,
            recipeId: recipeId,
            quantity: quantity,
            startTime: Date.now(),
            completionTime: Date.now() + craftTime
        };
        
        this.state.crafting.activeQueues[skill].push(craftJob);
        
        EventBus.emit('crafting-started', { recipe, quantity });
        return { success: true, craftJob };
    },
    
    /**
     * Calculate craft time with modifiers
     */
    calculateCraftTime(recipe, skill, workstationTier) {
        const baseTime = recipe.crafting.baseTime;
        const skillLevel = this.state.skills[skill]?.level || 0;
        const engineeringLevel = this.state.skills.engineering?.level || 0;
        
        // Get tier benefits
        const tierBenefits = WorkstationRegistry.getTierBenefits(skill, workstationTier, engineeringLevel);
        const speedMultiplier = tierBenefits?.craftSpeedMultiplier || 1;
        
        // Skill level bonus (1% faster per level)
        const skillBonus = 1 - (skillLevel * 0.01);
        
        // Attribute bonus (simplified)
        const attributeBonus = this.getAttributeSpeedBonus(skill);
        
        return Math.max(1000, baseTime * skillBonus / speedMultiplier / attributeBonus);
    },
    
    /**
     * Get simplified attribute speed bonus
     */
    getAttributeSpeedBonus(skill) {
        const attributeMap = {
            smithing: 'strength',
            mechanics: 'perception',
            electronics: 'intellect',
            tailoring: 'mobility',
            chemistry: 'intellect',
            cooking: 'health'
        };
        
        const primaryAttribute = this.state.combatAttributes[attributeMap[skill]] || 0;
        
        // 0.5% speed per attribute point
        return 1 + (primaryAttribute * 0.005);
    },
    
    /**
     * Complete a craft
     */
    completeCraft(craftJob) {
        const recipe = RecipeRegistry.getRecipe(craftJob.recipeId);
        const skill = recipe.skill;
        const workstationTier = this.state.workstations[skill]?.tier || 0;
        const engineeringLevel = this.state.skills.engineering?.level || 0;
        const skillLevel = this.state.skills[skill]?.level || 0;
        
        const tierBenefits = WorkstationRegistry.getTierBenefits(skill, workstationTier, engineeringLevel);
        
        let outputs = [];
        
        if (recipe.outputs.rarityWeights) {
            // Equipment - roll rarity
            const rarityBonus = tierBenefits.rarityBonus + (skillLevel * 0.5);
            const rarity = this.rollRarity(recipe.outputs.rarityWeights, rarityBonus);
            
            outputs.push({
                itemId: recipe.outputs.itemId,
                rarity: rarity,
                quantity: craftJob.quantity
            });
            
        } else if (recipe.outputs.baseQuantity) {
            // Consumables - calculate quantity
            const outputMult = tierBenefits.outputMultiplier || 1;
            const skillMult = 1 + (skillLevel * 0.02);
            
            const finalQuantity = Math.floor(
                recipe.outputs.baseQuantity * outputMult * skillMult * craftJob.quantity
            );
            
            outputs.push({
                itemId: recipe.outputs.itemId,
                quantity: finalQuantity
            });
        }
        
        // Add outputs to bank
        for (const output of outputs) {
            this.addItemToBank(output.itemId, output.quantity);
        }
        
        // Grant experience
        this.gainSkillExp(skill, recipe.crafting.experienceGain);
        
        EventBus.emit('crafting-complete', { outputs });
        return outputs;
    },
    
    /**
     * Roll for rarity with bonuses
     */
    rollRarity(baseWeights, rarityBonus) {
        // Shift weights based on bonus
        const weights = {
            common: Math.max(0, baseWeights.common - rarityBonus),
            uncommon: baseWeights.uncommon + (rarityBonus * 0.3),
            rare: baseWeights.rare + (rarityBonus * 0.5),
            epic: baseWeights.epic + (rarityBonus * 0.15),
            legendary: baseWeights.legendary + (rarityBonus * 0.05)
        };
        
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            roll -= weight;
            if (roll <= 0) return rarity;
        }
        
        return 'common';
    }
};
```

## Simplified Engineering System

```javascript
// src/systems/engineeringSystem.js
const EngineeringSystem = {
    init(engine) {
        // Engineering doesn't craft, it perfects and assembles
        engine.perfectEquipment = this.perfectEquipment.bind(engine);
        engine.assemblyTechnology = this.assemblyTechnology.bind(engine);
        engine.salvageItem = this.salvageItem.bind(engine);
        
        if (!engine.state.engineering) {
            engine.state.engineering = {
                perfectionAttempts: 0,
                perfectionSuccesses: 0
            };
        }
    },
    
    /**
     * Perfection system - combine 10 items for rarity upgrade
     * NO ATTRIBUTE BONUSES - purely skill based
     */
    perfectEquipment(itemIds) {
        if (itemIds.length !== 10) {
            return { success: false, reason: 'Need exactly 10 items' };
        }
        
        // Validate all items are same type
        const items = itemIds.map(id => this.state.bank.items[id]);
        const baseItemId = items[0]?.baseItemId;
        
        if (!items.every(item => item && item.baseItemId === baseItemId)) {
            return { success: false, reason: 'All items must be same type' };
        }
        
        // Get average rarity to determine target
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'transcendent', 'creator'];
        const avgRarityIndex = Math.floor(
            items.reduce((sum, item) => sum + rarityOrder.indexOf(item.rarity), 0) / items.length
        );
        
        const targetRarity = rarityOrder[Math.min(avgRarityIndex + 1, rarityOrder.length - 1)];
        
        // Calculate success chance
        const engineeringLevel = this.state.skills.engineering?.level || 0;
        const baseChances = {
            uncommon: 60,
            rare: 40,
            epic: 25,
            legendary: 15,
            mythic: 10,
            divine: 5,
            transcendent: 3,
            creator: 1
        };
        
        // Only 0.1% bonus per engineering level (reduced from 0.5%)
        const successChance = (baseChances[targetRarity] || 10) + (engineeringLevel * 0.1);
        
        // Remove input items
        for (const id of itemIds) {
            this.removeItemFromBank(id, 1);
        }
        
        // Roll for success
        if (Math.random() * 100 < successChance) {
            // Success!
            const newItem = {
                baseItemId: baseItemId,
                rarity: targetRarity,
                instanceId: `${baseItemId}_perfect_${Date.now()}`
            };
            
            this.addInstancedItemToBank(newItem);
            this.state.engineering.perfectionSuccesses++;
            
            EventBus.emit('perfection-success', { item: newItem });
            return { success: true, item: newItem };
        } else {
            // Failure - return some items based on engineering level
            const returnCount = Math.min(5, Math.floor(engineeringLevel / 20));
            
            for (let i = 0; i < returnCount; i++) {
                this.addInstancedItemToBank(items[i]);
            }
            
            return { success: false, returned: returnCount };
        }
    },
    
    /**
     * Technology assembly (for tech slots)
     */
    assemblyTechnology(componentIds, techRecipeId) {
        // Technology recipes require components from multiple skills
        const recipe = TechnologyRegistry.get(techRecipeId);
        if (!recipe) {
            return { success: false, reason: 'Technology not found' };
        }
        
        // Validate components
        for (const required of recipe.components) {
            if (!componentIds.includes(required.itemId)) {
                return { success: false, reason: `Missing component: ${required.itemId}` };
            }
        }
        
        // Consume components
        for (const id of componentIds) {
            this.removeItemFromBank(id, 1);
        }
        
        // Create technology with charges
        const engineeringLevel = this.state.skills.engineering?.level || 0;
        const baseCharges = recipe.baseCharges || 500;
        const bonusCharges = Math.floor(baseCharges * engineeringLevel * 0.01);
        
        const technology = {
            itemId: techRecipeId,
            charges: baseCharges + bonusCharges,
            maxCharges: baseCharges + bonusCharges
        };
        
        this.addTechnologyToBank(technology);
        
        EventBus.emit('technology-assembled', { technology });
        return { success: true, technology };
    }
};
```

## Updated State Structure

```javascript
// Additions to GameEngine.state
GameEngine.state = {
    // ... existing state ...
    
    crafting: {
        activeQueues: {
            smithing: [],
            mechanics: [],
            electronics: [],
            tailoring: [],  // Changed from textiles
            chemistry: [],
            cooking: []
        }
    },
    
    workstations: {
        smithing: { tier: 1 },
        mechanics: { tier: 1 },
        electronics: { tier: 1 },
        tailoring: { tier: 1 },  // Changed from textiles
        chemistry: { tier: 1 },
        cooking: { tier: 1 }
    },
    
    blueprints: {
        common: 0,
        advanced: 0,
        masterwork: 0
    },
    
    engineering: {
        perfectionAttempts: 0,
        perfectionSuccesses: 0,
        technologiesAssembled: 0
    }
};
```

## Implementation Notes for Claude Code

### Key Simplifications:
1. **No weapon attachments** - Remove all attachment-related code
2. **Recipe unlocks by skill level only** - Workstations don't gate recipes
3. **Engineering gates workstation tiers** - Need engineering_level >= tier * 10
4. **Simplified attributes** - Only affect speed (0.5%/point) and material savings (0.1%/point)
5. **Material savings chance** - Roll to not consume materials (tier * 5% chance)
6. **No attribute mapping for Engineering** - It's a pure skill-based system

### Workstation Upgrade Benefits:
- **Equipment stations**: Rarity bonus, material savings, speed
- **Consumable stations**: Output multiplier, material savings, speed
- **Special tier effects**: Implement at key tiers (5, 7, 10) for build diversity

### Integration Order:
1. Create recipe registry with skill-based unlocks
2. Implement simplified crafting system
3. Add engineering perfection (no attributes)
4. Create workstation upgrade system (engineering-gated)
5. Add material savings mechanic
6. Implement UI with proper caching