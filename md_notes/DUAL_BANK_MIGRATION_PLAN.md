# Dual-Bank Migration Plan

**Date**: 2025-01-22
**Status**: PLANNING - Awaiting Claude App Review
**Reference**: ITEM_SYSTEM_SPECIFICATION.md

---

## 🎯 Objective

Migrate from the current unified bank structure to a dual-bank system that separates:
- **Stackable items** (resources, materials, consumables) - stored as simple quantities
- **Instanced items** (weapons, armor, tools) - stored as unique objects with properties

---

## 📊 Current State

### Bank Structure (Current)
```javascript
GameEngine.state.bank = {
  items: {
    // Stackable items stored as objects
    'pinewood': { quantity: 3000443, tab: 'resource' },
    'clay': { quantity: 5632, tab: 'resource' },
    'testMuzzle_common': { quantity: 4, tab: 'mod' },

    // Instanced items stored as objects
    'testRifle_instance_123': {
      instanceId: 'testRifle_instance_123',
      baseItemId: 'testRifle',
      quantity: 1,
      attachments: { muzzle: 'testMuzzle_common', scope: 'testScope_uncommon' },
      modifiedStats: { ... },
      tab: 'weapon'
    }
  }
}
```

### Current Bank Contents
- **11 stackable resources**: pinewood, clay, flint, sap, solfish, sinew, wild_chicken_feathers, alcapa_hide, goldFlakes, flexible_limb, sweetcap_mushroom
- **5 test items**:
  - 1 weapon instance (testRifle_instance_*)
  - 4 attachments (testMuzzle_common, testScope_uncommon, testGrip_rare, testBarrel_common)

---

## 🎯 Target State (From Spec)

### Bank Structure (Target)
```javascript
GameEngine.state.bank = {
  stackable: {
    // Simple number storage - ONLY for resources/materials/consumables
    'pinewood': 3000443,
    'clay': 5632,
    'bread': 1000117
    // NOTE: Mods/attachments are NOT here - they are instanced!
  },

  instanced: {
    // Full object storage for unique items
    // WEAPONS - Unique instances with rarity and attachments
    'testRifle_instance_123': {
      baseItemId: 'testRifle',
      uniqueId: 'testRifle_instance_123',
      rarity: 'rare',
      attachments: {
        muzzle: 'testMuzzle_instance_456',  // References unique mod instance!
        scope: 'testScope_instance_789'      // Not just 'testMuzzle_common'!
      },
      equipped: false,
      locked: false
    },

    // MODS - Each is a unique instance with its own rarity/multiplier
    'testMuzzle_instance_456': {
      baseItemId: 'testMuzzle',
      uniqueId: 'testMuzzle_instance_456',
      rarity: 'common',
      modType: 'muzzle',
      modStat: 'armorPenetration',
      multiplier: 1.02,  // Common muzzle = +2%
      equipped: false,   // Currently attached to a weapon or not
      locked: false
    },
    'testScope_instance_789': {
      baseItemId: 'testScope',
      uniqueId: 'testScope_instance_789',
      rarity: 'legendary',
      modType: 'scope',
      modStat: 'accuracy',
      multiplier: 1.10,  // Legendary scope = +10%
      equipped: false,
      locked: false
    }
  }
}
```

---

## 📋 Migration Phases

### **Phase 1: Item Definition Updates**
**Goal**: Mark all items as stackable or instanced

**Tasks**:
1. Add `instanced: false` to all resource/material/consumable items in production registry
2. Add `instanced: true` to all weapon/armor/tool items in production registry
3. **Add `instanced: true` to ALL mod/attachment items** (CRITICAL: Mods are instanced!)
4. Add `modType`, `modStat` properties to mod definitions
5. Add `instanced: true` to testRifle
6. Update itemSchema.js to include `instanced`, `modType`, `modStat` as valid fields

**Example - Test Items:**
```javascript
// testItems.js
{
  testRifle: {
    instanced: true,  // Weapons are instanced
    category: 'equipment',
    slot: 'weapon'
  },
  testMuzzle: {  // Remove _common suffix - base definition
    instanced: true,  // MODS ARE INSTANCED!
    category: 'equipment',
    slot: 'attachment',
    modType: 'muzzle',
    modStat: 'armorPenetration'
  },
  testScope: {
    instanced: true,  // MODS ARE INSTANCED!
    category: 'equipment',
    slot: 'attachment',
    modType: 'scope',
    modStat: 'accuracy'
  }
}
```

**Files to modify**:
- `src/data/items/production/materials/*.js`
- `src/data/items/production/equipment/*.js`
- `src/data/items/test/testItems.js`
- `src/data/items/itemSchema.js`

**Validation**: Run ItemRegistry validation to ensure no errors

---

### **Phase 2: Create Dual-Bank Manager**
**Goal**: New system that can handle both storage types

**Tasks**:
1. Create `src/systems/dualBankSystem.js` with methods:
   - `addStackable(itemId, quantity)` - Add to stackable storage
   - `removeStackable(itemId, quantity)` - Remove from stackable storage
   - `createInstance(baseItemId, properties)` - Create unique instance
   - `addInstance(instance)` - Add to instanced storage
   - `removeInstance(uniqueId)` - Remove from instanced storage
   - `getItem(itemIdOrUniqueId)` - Universal getter
   - `hasItem(itemIdOrUniqueId, quantity)` - Universal checker
   - `getItemCount(itemId)` - Count (stackable) or instance count

2. Add backward compatibility layer to read from old `bank.items` if new structure doesn't exist

**Files to create**:
- `src/systems/dualBankSystem.js`

**Integration point**: Initialize in gameEngine.js after inventorySystem

---

### **Phase 3: Save Migration**
**Goal**: Convert existing saves to new structure without data loss

**Tasks**:
1. Create migration in `src/systems/migrationSystem.js`:
   ```javascript
   migration_dualBank: {
     version: 44,
     name: 'Dual-Bank Structure',
     run: (save) => {
       // Create new structure
       save.bank.stackable = {};
       save.bank.instanced = {};

       // Migrate each item
       Object.entries(save.bank.items).forEach(([itemId, itemData]) => {
         const def = ItemRegistry.getItem(itemId);

         // Check if item is instanced (weapons, armor, tools, MODS)
         if (itemData.instanceId || def?.instanced === true) {

           // SPECIAL HANDLING FOR MODS
           if (def?.category === 'equipment' && def?.slot === 'attachment') {
             // Extract base ID (remove _common, _rare, etc. suffixes)
             const baseItemId = itemId.replace(/_common|_uncommon|_rare|_epic|_legendary|_mythic|_divine|_transcendent|_creator/g, '');

             // ROBUST RARITY DETECTION
             let rarity = 'common';  // default

             // First check if rarity is stored in the item data
             if (itemData.rarity) {
               rarity = itemData.rarity;
             }
             // Then check item definition
             else if (def?.rarity) {
               rarity = def.rarity;
             }
             // Only as last resort, try to parse from ID
             else if (itemId.includes('_uncommon')) rarity = 'uncommon';
             else if (itemId.includes('_rare')) rarity = 'rare';
             else if (itemId.includes('_epic')) rarity = 'epic';
             else if (itemId.includes('_legendary')) rarity = 'legendary';
             else if (itemId.includes('_mythic')) rarity = 'mythic';
             else if (itemId.includes('_divine')) rarity = 'divine';
             else if (itemId.includes('_transcendent')) rarity = 'transcendent';
             else if (itemId.includes('_creator')) rarity = 'creator';

             // Get multiplier based on rarity and mod type
             const modType = def.attachmentSlot || def.modType;
             const modStat = def.bonusStat || def.modStat;
             const multiplier = def.bonusValue || getRarityMultiplier(rarity);

             // Create unique instance ID
             const uniqueId = `${baseItemId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

             // Add to instanced storage
             save.bank.instanced[uniqueId] = {
               baseItemId: baseItemId,
               uniqueId: uniqueId,
               rarity: rarity,
               modType: modType,
               modStat: modStat,
               multiplier: multiplier,
               equipped: false,
               locked: false
             };
           }
           // WEAPONS, ARMOR, TOOLS
           else {
             save.bank.instanced[itemId] = {
               baseItemId: itemData.baseItemId || itemId,
               uniqueId: itemData.instanceId || itemId,
               rarity: def?.rarity || 'common',
               attachments: itemData.attachments || {},
               equipped: itemData.equipped || false,
               locked: itemData.locked || false
             };
           }
         }
         // STACKABLE (resources, materials, consumables)
         else {
           save.bank.stackable[itemId] = itemData.quantity || 1;
         }
       });

       // Keep old structure for backward compatibility (one version)
       // Will be removed in future migration
     }
   }
   ```

2. Add helper function `getRarityMultiplier(rarity)` that maps rarity to multiplier
3. Test migration on current save
4. Verify all items migrated correctly, especially mods

**Files to modify**:
- `src/systems/migrationSystem.js`

---

### **Phase 4: Update Inventory System**
**Goal**: Use new dual-bank structure

**Tasks**:
1. Update `inventorySystem.js`:
   - `addItemToBank()` → Check `instanced` property, route to correct storage
   - `removeItemFromBank()` → Check storage type, remove accordingly
   - `hasItemInBank()` → Check both storages
   - Keep old code paths active for one version (compatibility)

2. Update `attachmentSystem.js`:
   - Use `dualBankSystem.removeInstance()` for attachments (mods are instanced!)
   - Use `dualBankSystem.addInstance()` when returning attachments
   - Update weapon attachments to reference mod instance IDs

3. Update `equipmentSystem.js`:
   - Use instanced storage for all equipment operations

**Files to modify**:
- `src/systems/inventorySystem.js`
- `src/systems/attachmentSystem.js`
- `src/systems/equipmentSystem.js`

---

### **Phase 5: Update UI Systems**
**Goal**: Display items from new structure

**Tasks**:
1. Update `equipmentUI.js`:
   - Update `updateBankGrid()` to read from both `stackable` and `instanced`
   - Show quantity badge for stackable items
   - Show individual tiles for instanced items

2. Update `itemModal.js`:
   - Handle both item types appropriately

**Files to modify**:
- `src/ui/equipmentUI.js`
- `src/ui/itemModal.js`

---

### **Phase 6: Update Game Systems**
**Goal**: All systems use new bank structure

**Tasks**:
1. Update `craftingSystem.js` - Use dual-bank for inputs/outputs
2. Update `harvestSystem.js` - Add resources to stackable storage
3. Update `combatSystem.js` - Use instanced storage for loot
4. Update `missionSystem.js` - Reward handling for both types

**Files to modify**:
- `src/systems/craftingSystem.js`
- `src/systems/harvestSystem.js`
- `src/systems/combatSystem.js`
- `src/systems/missionSystem.js`

---

### **Phase 7: Testing & Validation**
**Goal**: Ensure everything works

**Tasks**:
1. Test gathering resources → stackable storage
2. Test creating weapon instances → instanced storage
3. Test attachment system with stackable attachments
4. Test equipment system with instanced items
5. Test save/load cycle
6. Test UI displays correctly

---

### **Phase 8: Cleanup**
**Goal**: Remove old code paths

**Tasks**:
1. Remove backward compatibility from dualBankSystem
2. Remove old `bank.items` from save structure
3. Create migration to delete old structure
4. Update documentation

---

## ⚠️ Critical Considerations

### Edge Cases
1. **Attachment handling**: Attachments should be stackable, but when attached to a weapon, they're consumed
2. **Instance creation**: When does a stackable become an instance? (e.g., when you first equip a weapon)
3. **Attachment instances**: Current system uses attachment itemIds in weapon.attachments, not unique instances
4. **Save compatibility**: Need to support reading old format for at least one version

### ✅ Clarifications from Claude App

1. **Attachments/Mods**: INSTANCED (not stackable)
   - **Why**: Different rarities have different multipliers
   - **Example**: Common scope (1.02x accuracy) ≠ Legendary scope (1.10x accuracy)
   - **Implementation**: Each mod is a unique instance with `rarity`, `modType`, `modStat`, `multiplier`

2. **Instance creation timing**: AT CREATION (no conversion)
   - **Weapons**: Instance created immediately when crafted/looted with rolled rarity
   - **Mods**: Instance created immediately when crafted/looted with rolled rarity
   - **Resources**: Added to stackable count when gathered
   - **NEVER**: Items do NOT convert from stackable to instanced

3. **Backward compatibility duration**: 2 versions
   - Version 1: Migration runs, both formats supported
   - Version 2: Safety buffer, still supports old format
   - Version 3+: Old format removed

4. **Tab system**: Use 13 specified tabs
   - Resources, Tools, Weapons, Armor, Food, Potions, Ammo, Mods, Components, Perks, Quest, Currency, Technology
   - Route items to tabs based on category/slot

---

## 🚀 Implementation Order

**Week 1**: Phases 1-3 (Foundation)
- Item definitions
- Dual-bank system
- Save migration

**Week 2**: Phases 4-5 (Core Systems)
- Inventory system updates
- UI updates

**Week 3**: Phases 6-7 (Integration)
- Game systems
- Testing

**Week 4**: Phase 8 (Cleanup)
- Remove compatibility layer
- Final cleanup

---

## 📊 Success Metrics

- [ ] All items have `instanced` property defined
- [ ] Save migration works without data loss
- [ ] Bank UI shows items from both storages
- [ ] Attachment system works with stackable attachments
- [ ] Weapon instances remain unique with attachments
- [ ] All systems can add/remove from correct storage
- [ ] Save/load cycle preserves all data
- [ ] No errors in console after migration

---

## 🔗 Related Documents

- `ITEM_SYSTEM_SPECIFICATION.md` - Original spec from Claude App
- `GAME_CONTEXT.md` - Overall game architecture
- `ATTACHMENT_SYSTEM_NOTES.md` - Current attachment implementation

---

**Status**: Ready for Claude App review
**Next Step**: Get approval and start Phase 1
