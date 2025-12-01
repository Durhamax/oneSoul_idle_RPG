/**
 * EQUIPMENT SYSTEM
 *
 * Manages player equipment, equipping/unequipping items, and calculating combat stats
 * from equipped gear, attributes, and perks.
 */

const EquipmentSystem = {
    /**
     * Get item definition from ItemRegistry (standardized access pattern)
     * Handles both base IDs and instance IDs via ItemIdUtils
     * @param {string} itemId - Item ID (base or instance) to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    _getItemDef(itemId) {
        // Use ItemIdUtils for consistent instance ID resolution
        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getItemDefinition(itemId);
        }

        // Fallback: Extract base ID manually if ItemIdUtils not available
        let baseId = itemId;
        if (typeof itemId === 'string') {
            const match = itemId.match(/^(.+)_(\d{13})_([a-z0-9]+)$/i);
            if (match) {
                baseId = match[1];
            }
        }

        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(baseId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[baseId] || null;
    },

    /**
     * Initialize equipment system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all equipment functions to engine
        engine.equipItem = this.equipItem.bind(engine);
        engine.unequipItem = this.unequipItem.bind(engine);
        engine.getPlayerCombatStats = this.getPlayerCombatStats.bind(engine);
        engine.getPlayerCombatStatsUsingCalculator = this.getPlayerCombatStatsUsingCalculator.bind(engine);
        engine.getPlayerCombatStatsLegacy = this.getPlayerCombatStatsLegacy.bind(engine);
        engine.recalculatePlayerStats = this.recalculatePlayerStats.bind(engine);
        engine.getTotalEquippedWeight = this.getTotalEquippedWeight.bind(engine);
        engine.getMaxEquipmentWeight = this.getMaxEquipmentWeight.bind(engine);
        engine.calculateCombatPower = this.calculateCombatPower.bind(engine);
        // Technology slot helpers
        engine.isTechSlotUnlocked = this.isTechSlotUnlocked.bind(engine);
        engine.getTechSlotRequirement = this.getTechSlotRequirement.bind(engine);
        engine.getEquipmentSlotType = this.getEquipmentSlotType.bind(engine);

        console.log('✅ EquipmentSystem initialized (ItemRegistry pattern)');
    },

    /**
     * Check if a technology slot is unlocked based on intellect
     */
    isTechSlotUnlocked(slot) {
        const intellect = this.state.combatAttributes.intellect;
        const requirement = this.getTechSlotRequirement(slot);
        return requirement === null || intellect >= requirement;
    },

    /**
     * Get the intellect requirement for a technology slot
     */
    getTechSlotRequirement(slot) {
        const requirements = {
            'tech1': 10,
            'tech2': 25,
            'tech3': 50,
            'tech4': 100
        };
        return requirements[slot] || null;
    },

    /**
     * Determine the slot type (equipment, consumable, or technology)
     */
    getEquipmentSlotType(slot) {
        const equipmentSlots = ['weapon', 'armor', 'back', 'gloves', 'neck', 'boots', 'ring'];
        const consumableSlots = ['ammo', 'food', 'potion'];
        const techSlots = ['tech1', 'tech2', 'tech3', 'tech4'];

        if (equipmentSlots.includes(slot)) return 'equipment';
        if (consumableSlots.includes(slot)) return 'consumable';
        if (techSlots.includes(slot)) return 'technology';
        return 'unknown';
    },

    /**
     * Equip an item from the bank
     */
    equipItem(itemId) {
        // DUAL-BANK: Check all storage locations (instanced, stackable, legacy)
        const instancedItem = this.state.bank.instanced?.[itemId];
        const stackableItem = this.state.bank.stackable?.[itemId];
        const legacyItem = this.state.bank.items?.[itemId];
        const bankItem = instancedItem || stackableItem || legacyItem;

        if (!bankItem || bankItem.quantity < 1) {
            console.warn(`❌ Item not in bank or quantity < 1: ${itemId}`, bankItem);
            return { success: false, reason: "Item not in bank" };
        }

        // Get the base item ID for definition lookup (handle instances)
        const lookupId = bankItem.baseItemId || itemId;

        // Use standardized item access pattern
        const itemDef = EquipmentSystem._getItemDef.call(this, lookupId);

        if (!itemDef) {
            console.warn(`❌ Item definition not found: ${lookupId} (from itemId: ${itemId})`);
            return { success: false, reason: "Item not found" };
        }

        // Check both 'equipSlot' and 'slot' properties for compatibility
        const slot = itemDef.equipSlot || itemDef.slot;

        console.log(`🔍 Equipping ${lookupId}: slot='${slot}', equipSlot='${itemDef.equipSlot}', itemDef.slot='${itemDef.slot}'`);

        if (!slot) {
            console.warn(`❌ No slot found for ${lookupId}`, itemDef);
            return { success: false, reason: "Item cannot be equipped" };
        }

        // === VALIDATION LAYER ===

        // 1. Check level requirements (DISABLED - no level requirements for now)
        // if (itemDef.level && itemDef.level > this.state.characterLevel.level) {
        //     return {
        //         success: false,
        //         reason: `Requires character level ${itemDef.level}`
        //     };
        // }

        // 2. Check attribute requirements (character level, combat attributes, AND skills)
        if (itemDef.requirements) {
            const combatAttributes = this.state.combatAttributes || {};
            const skills = this.state.skills || {};
            const characterLevel = this.state.characterLevel?.level || 0;

            for (let attr in itemDef.requirements) {
                const required = itemDef.requirements[attr];
                let current = 0;

                // Special case: characterLevel is a top-level property
                if (attr === 'characterLevel') {
                    current = characterLevel;
                }
                // Check combat attributes first, then skills
                else {
                    const currentFromAttributes = combatAttributes[attr] || 0;
                    const currentFromSkills = skills[attr]?.level || 0;
                    current = currentFromAttributes || currentFromSkills;
                }

                console.log(`🔍 Requirement check: ${attr} requires ${required}, you have ${current}`);

                if (current < required) {
                    return {
                        success: false,
                        reason: `Requires ${required} ${attr} (you have ${current})`
                    };
                }
            }
        }

        // 3. Check if technology slot is unlocked
        const slotType = this.getEquipmentSlotType(slot);
        if (slotType === 'technology' && !this.isTechSlotUnlocked(slot)) {
            const requirement = this.getTechSlotRequirement(slot);
            return {
                success: false,
                reason: `Technology slot requires ${requirement} Intellect`
            };
        }

        // 4. Check weight capacity BEFORE equipping
        const itemWeight = (itemDef.stats && itemDef.stats.weight) || 0;
        const currentWeight = this.getTotalEquippedWeight();
        const maxWeight = this.getMaxEquipmentWeight();

        // If there's an item already in the slot, subtract its weight first
        let weightAfterEquip = currentWeight + itemWeight;
        const currentItemInSlot = this.state.equipment[slot];
        if (currentItemInSlot) {
            // Use ItemIdUtils to extract base ID from instance ID
            const currentItemDef = EquipmentSystem._getItemDef.call(this, currentItemInSlot);
            const currentItemWeight = (currentItemDef && currentItemDef.stats && currentItemDef.stats.weight) || 0;
            weightAfterEquip -= currentItemWeight;
        }

        if (weightAfterEquip > maxWeight) {
            return {
                success: false,
                reason: `Too heavy! (${weightAfterEquip.toFixed(1)}/${maxWeight} capacity)`
            };
        }

        // === EQUIP ITEM ===

        // Unequip current item in slot if any
        if (this.state.equipment[slot]) {
            console.log(`🔄 Unequipping current item in ${slot}:`, this.state.equipment[slot]);
            this.unequipItem(slot);
        }

        // Equip new item
        console.log(`✅ Setting equipment[${slot}] = ${itemId}`);
        this.state.equipment[slot] = itemId;
        console.log(`📊 Equipment state after setting:`, this.state.equipment[slot]);

        // DUAL-BANK: Remove from bank using appropriate method
        if (instancedItem) {
            console.log(`📦 Removing instanced item from bank: ${itemId}`);
            this.removeEquipmentInstance(itemId);
        } else if (stackableItem) {
            console.log(`📦 Removing stackable item from bank: ${itemId}`);
            this.removeStackableItem(itemId, 1);
        } else {
            console.log(`📦 Removing legacy item from bank: ${itemId}`);
            this.removeItemFromBank(itemId, 1);
        }

        console.log(`⚔️ Equipped ${itemDef.name} to slot '${slot}' (${itemId})`);
        console.log(`📊 Current equipment state:`, {...this.state.equipment});

        // Recalculate player stats
        this.recalculatePlayerStats();

        // Recompile stats after equipment change
        if (typeof this.compilePlayerStats === 'function') {
            this.compilePlayerStats();
        }

        return { success: true };
    },

    /**
     * Unequip an item and return it to bank
     */
    unequipItem(slot) {
        const itemId = this.state.equipment[slot];

        if (!itemId) {
            return { success: false, reason: "Nothing equipped in that slot" };
        }

        console.log(`🔄 [UNEQUIP v2] Unequipping from ${slot}: ${itemId}`);

        // Use ItemIdUtils to extract base item ID for definition lookup
        const lookupId = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getBaseItemId(itemId)
            : itemId;
        const isInstance = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.isInstanceId(itemId)
            : false;

        const itemDef = EquipmentSystem._getItemDef.call(this, itemId);

        // DUAL-BANK: Check if the item is instanced
        if (isInstance || itemDef?.instanced) {
            // For instanced items, we need to recreate the instance in the bank
            console.log(`🔄 Returning instanced item to bank: ${itemId}`);

            // Get the instance data if it exists in equipped items tracking
            // Otherwise, recreate it from the base item
            const instanceData = {
                baseItemId: lookupId,
                instanceId: itemId,
                uniqueId: itemId,
                rarity: itemDef?.rarity || 'common',
                quantity: 1
            };

            // Add the instance back to bank
            this.addEquipmentInstance(instanceData);
        } else {
            // Return to bank normally for non-instanced items
            this.addItemToBank(itemId, 1);
        }

        // Remove from equipment
        this.state.equipment[slot] = null;

        console.log(`📦 Unequipped ${itemDef?.name || itemId}`);

        // Recalculate player stats
        this.recalculatePlayerStats();

        // Recompile stats after equipment change
        if (typeof this.compilePlayerStats === 'function') {
            this.compilePlayerStats();
        }

        return { success: true };
    },

    /**
     * Calculate comprehensive player combat stats
     * NOW USES STATCALCULATOR FOR MODULAR 5-LAYER STAT PIPELINE
     *
     * This method is a facade that uses StatCalculator for all calculations,
     * then formats the results to match the old API for backward compatibility.
     */
    getPlayerCombatStats() {
        // Build context for StatCalculator
        const context = this.buildStatContext ? this.buildStatContext() : {
            combatAttributes: this.state.combatAttributes,
            equipment: this.state.equipment,
            definitions: this.definitions,
            skills: this.state.skills,
            stance: this.state.combat.currentStance || 'offensive',
            state: this.state
        };

        // Use StatCalculator if available
        if (typeof StatCalculator !== 'undefined') {
            return this.getPlayerCombatStatsUsingCalculator(context);
        }

        // Fallback to legacy calculation if StatCalculator not loaded
        console.warn('[EquipmentSystem] StatCalculator not found, using legacy calculation');
        return this.getPlayerCombatStatsLegacy();
    },

    /**
     * NEW: Calculate stats using StatCalculator system
     */
    getPlayerCombatStatsUsingCalculator(context) {
        // Calculate all combat stats using StatCalculator
        const attackDamage = StatCalculator.calculateStat('attackDamage', context);
        const maxHealth = StatCalculator.calculateStat('maxHealth', context);
        const healthRegen = StatCalculator.calculateStat('healthRegen', context);
        const attackSpeed = StatCalculator.calculateStat('attackSpeed', context);
        const accuracy = StatCalculator.calculateStat('accuracy', context);
        const evasion = StatCalculator.calculateStat('evasion', context);
        const criticalChance = StatCalculator.calculateStat('criticalChance', context);
        const criticalDamage = StatCalculator.calculateStat('criticalDamage', context);
        const damageReduction = StatCalculator.calculateStat('damageReduction', context);
        const blockChance = StatCalculator.calculateStat('blockChance', context);

        // Get weapon-specific stats
        const weaponId = this.state.equipment.weapon;
        const weapon = weaponId ? EquipmentSystem._getItemDef.call(this, weaponId) : null;

        let damageType = 'ballistic';
        let reloadInterval = 0;
        let reloadTime = 0;
        let grenadeInterval = 0;
        let grenadeDamage = 0;

        if (weapon && weapon.combatStats) {
            damageType = weapon.combatStats.damageType || 'ballistic';
            reloadInterval = weapon.combatStats.reloadInterval || 0;
            reloadTime = weapon.combatStats.reloadTime || 0;
            grenadeInterval = weapon.combatStats.grenadeInterval || 0;
            grenadeDamage = weapon.combatStats.grenadeDamage || 0;
        }

        // Get attributes for derived calculations
        const attributes = this.state.combatAttributes;
        const baseStats = this.state.combat.player || {};
        const currentHealth = this.state.currentHP || 0;

        // Get stance modifiers
        const currentStance = this.state.combat.currentStance || "offensive";
        let stanceDamageMultiplier = 1.0;
        let stanceSpeedMultiplier = 1.0;
        let stanceDamageReductionBonus = 0;
        let stanceBlockChance = 0;

        if (currentStance === "defensive") {
            stanceDamageMultiplier = 0.60;
            stanceSpeedMultiplier = 0.75;
            stanceDamageReductionBonus = 0.30;
            stanceBlockChance = 20;
        }

        // Calculate damage variance (based on attributes)
        const maxHitOffset = attributes.strength * 0.5;
        const minHitOffset = attributes.strength * 0.2;
        const maxHitMultiplier = 1.2 + (attributes.strength * 0.01);
        const minHitMultiplier = 0.8 + (attributes.strength * 0.005);

        const maxHit = attackDamage.final * maxHitMultiplier + maxHitOffset;
        const minHit = attackDamage.final * minHitMultiplier + minHitOffset;
        const avgDamagePerHit = (maxHit + minHit) / 2;

        // Damage roll weights
        const damageRollWeightAbove = 50 + (attributes.strength * 0.5);
        const damageRollWeightBelow = 50 - (attributes.strength * 0.5);

        // Derived attribute bonuses
        const reloadTimeReduction = attributes.strength * 0.01;
        const autoEatThresholdBonus = attributes.health * 0.02;
        const dotResistance = attributes.health * 0.005;
        const specialAttackBlockChance = Math.min(50, attributes.defense * 0.3);
        const firstStrikeBonusDamage = attributes.stealth * 0.01;
        const enemyAccuracyReduction = attributes.stealth * 0.005;
        const specialAttackChanceBonus = attributes.intellect * 0.002;
        const consumableEfficiency = attributes.intellect * 0.005;

        // Return comprehensive stats object (matching old API format)
        return {
            // Display stats (for UI)
            maxHealth: maxHealth.final,
            currentHealth: currentHealth,
            attackDamage: attackDamage.final,
            attackSpeed: 1000 / attackSpeed.final,
            accuracy: accuracy.final,

            // Damage system (hidden)
            damage: attackDamage.final,
            maxHitOffset: maxHitOffset,
            minHitOffset: minHitOffset,
            maxHitMultiplier: maxHitMultiplier,
            minHitMultiplier: minHitMultiplier,
            maxHit: maxHit,
            minHit: minHit,
            avgDamagePerHit: avgDamagePerHit,
            damageRollWeightAbove: damageRollWeightAbove,
            damageRollWeightBelow: damageRollWeightBelow,

            // Attack speed system (hidden)
            characterAttackInterval: attackSpeed.final,
            weaponAttackInterval: 0,
            effectiveAttackInterval: attackSpeed.final,

            // Hit chance system (hidden)
            characterHitChance: accuracy.final,
            weaponHitChance: 0,
            effectiveHitChance: accuracy.final,

            // Critical system (hidden)
            criticalChance: criticalChance.final,
            criticalImpact: criticalDamage.final,

            // Special attacks (hidden)
            grenadeInterval: grenadeInterval,
            grenadeDamage: grenadeDamage,

            // Weapon mechanics (hidden)
            reloadInterval: reloadInterval,
            reloadTime: reloadTime,
            damageType: damageType,

            // Defense system (hidden)
            evasionRating: evasion.final,
            damageReductionRate: damageReduction.final / 100,
            absoluteDamageReduction: 0,

            // Regeneration (hidden)
            hpRegenerationRate: healthRegen.final,
            lifestealPercent: attributes.strength * 0.1,

            // Damage typing (hidden)
            strongTyping: 1.5,
            neutralTyping: 1.0,
            weakTyping: 0.75,

            // Enemy mechanics (hidden)
            enemyRespawnTimer: 1.0,

            // NEW ATTRIBUTE BONUSES
            reloadTimeReduction: reloadTimeReduction,
            autoEatThresholdBonus: autoEatThresholdBonus,
            dotResistance: dotResistance,
            specialAttackBlockChance: specialAttackBlockChance,
            firstStrikeBonusDamage: firstStrikeBonusDamage,
            enemyAccuracyReduction: enemyAccuracyReduction,
            specialAttackChanceBonus: specialAttackChanceBonus,
            consumableEfficiency: consumableEfficiency,

            // STANCE
            currentStance: currentStance,
            stanceDamageMultiplier: stanceDamageMultiplier,
            stanceSpeedMultiplier: stanceSpeedMultiplier,
            stanceDamageReductionBonus: stanceDamageReductionBonus,
            stanceBlockChance: stanceBlockChance,

            // Legacy compatibility
            damageReduction: damageReduction.final / 100
        };
    },

    /**
     * LEGACY: Old manual calculation (kept for fallback)
     * This should never be used if StatCalculator is loaded
     */
    getPlayerCombatStatsLegacy() {
        const baseStats = this.state.combat.player;
        const perks = this.state.perks;
        const attributes = this.state.combatAttributes;
        const attrDefs = this.definitions.combatAttributes;

        // === BASE STATS FROM ATTRIBUTES ===
        const baseDamage = baseStats.baseAttackDamage + (attributes.strength * 2);
        const baseHitChance = baseStats.baseAccuracy + (attributes.perception * 0.5);
        const baseAttackInterval = 1000 / (baseStats.baseAttackSpeed + (attributes.mobility * 0.02));
        const baseMaxHealth = baseStats.maxHealth + (attributes.health * 10);
        const baseCritChance = attributes.perception * 0.3; // 0.3% per perception point
        const baseCritImpact = 1.5 + (attributes.strength * 0.01); // 1.5x base, +1% per strength
        const baseEvasion = attributes.mobility * 0.5; // 0.5% per mobility point

        // === WEAPON STATS ===
        const weaponId = this.state.equipment.weapon;
        const weapon = weaponId ? EquipmentSystem._getItemDef.call(this, weaponId) : null;

        let weaponDamage = 0;
        let weaponHitChance = 0;
        let weaponAttackInterval = 0;
        let weaponCritChance = 0;
        let weaponCritImpact = 1.0;
        let damageType = 'ballistic';
        let reloadInterval = 0;
        let reloadTime = 0;
        let grenadeInterval = 0;
        let grenadeDamage = 0;

        if (weapon && weapon.combatStats) {
            weaponDamage = weapon.combatStats.damage || 0;
            weaponHitChance = weapon.combatStats.hitChance || 0;
            weaponAttackInterval = weapon.combatStats.attackInterval || 0;
            weaponCritChance = weapon.combatStats.critChance || 0;
            weaponCritImpact = weapon.combatStats.critImpact || 1.0;
            damageType = weapon.combatStats.damageType || 'ballistic';
            reloadInterval = weapon.combatStats.reloadInterval || 0;
            reloadTime = weapon.combatStats.reloadTime || 0;
            grenadeInterval = weapon.combatStats.grenadeInterval || 0;
            grenadeDamage = weapon.combatStats.grenadeDamage || 0;
        }

        // === ARMOR/EQUIPMENT STATS ===
        let equipmentDefense = 0;
        let equipmentAbsoluteDefense = 0;
        let equipmentHealthBonus = 0;
        let equipmentEvasion = 0;

        // Aggregate all equipment bonuses
        for (let slot in this.state.equipment) {
            const itemId = this.state.equipment[slot];
            if (!itemId || slot === 'weapon') continue;

            const itemDef = EquipmentSystem._getItemDef.call(this, itemId);
            if (!itemDef || !itemDef.combatStats) continue;

            equipmentDefense += itemDef.combatStats.damageReduction || 0;
            equipmentAbsoluteDefense += itemDef.combatStats.absoluteDefense || 0;
            equipmentHealthBonus += itemDef.combatStats.healthBonus || 0;
            equipmentEvasion += itemDef.combatStats.evasion || 0;
        }

        // === PERK GRID BONUSES ===
        // Get bonuses from perk grid (includes medals and equipment)
        const gridBonuses = this.calculateGridBonuses ? this.calculateGridBonuses() : {
            str: 0, dex: 0, int: 0, con: 0, damage: 0, maxHp: 0, critChance: 0
        };

        // Add grid bonuses to attributes
        const totalStrength = attributes.strength + (gridBonuses.str || 0);
        const totalDexterity = attributes.dexterity + (gridBonuses.dex || 0);
        const totalIntelligence = attributes.intellect + (gridBonuses.int || 0);
        const totalConstitution = attributes.health + (gridBonuses.con || 0);

        // === PERK MULTIPLIERS (Legacy + Grid Bonuses) ===
        const perkDamageMult = 1 + (perks.damageBonus / 100);
        const perkSpeedMult = 1 + (perks.speedBonus / 100);
        const perkAccuracyBonus = perks.accuracyBonus;
        const perkHealthMult = 1 + (perks.healthBonus / 100);

        // === CALCULATED HIDDEN STATS ===

        // === STANCE MODIFIERS (calculate early) ===
        const currentStance = this.state.combat.currentStance || "offensive";
        let stanceDamageMultiplier = 1.0;
        let stanceSpeedMultiplier = 1.0;
        let stanceDamageReductionBonus = 0;
        let stanceBlockChance = 0;

        if (currentStance === "defensive") {
            stanceDamageMultiplier = 0.60;      // -40% damage dealt
            stanceSpeedMultiplier = 0.75;       // -25% attack speed
            stanceDamageReductionBonus = 0.30;  // +30% damage reduction
            stanceBlockChance = 20;              // +20% block/parry chance
        }

        // DAMAGE SYSTEM (includes grid damage bonus and stance modifier)
        const totalBaseDamage = (baseDamage + weaponDamage + (gridBonuses.damage || 0)) * perkDamageMult * stanceDamageMultiplier;
        const maxHitOffset = attributes.strength * 0.5;
        const minHitOffset = attributes.strength * 0.2;
        const maxHitMultiplier = 1.2 + (attributes.strength * 0.01);
        const minHitMultiplier = 0.8 + (attributes.strength * 0.005);

        const maxHit = totalBaseDamage * maxHitMultiplier + maxHitOffset;
        const minHit = totalBaseDamage * minHitMultiplier + minHitOffset;
        const avgDamagePerHit = (maxHit + minHit) / 2;

        // Damage roll weights (affects variance distribution)
        const damageRollWeightAbove = 50 + (attributes.strength * 0.5); // Favor higher rolls with strength
        const damageRollWeightBelow = 50 - (attributes.strength * 0.5);

        // ATTACK SPEED SYSTEM (includes stance modifier)
        const characterAttackInterval = baseAttackInterval;
        const effectiveAttackInterval = Math.max(100, ((characterAttackInterval + weaponAttackInterval) / perkSpeedMult) / stanceSpeedMultiplier);

        // HIT CHANCE SYSTEM
        const characterHitChance = baseHitChance + perkAccuracyBonus;
        const effectiveHitChance = Math.min(99, characterHitChance + weaponHitChance);

        // CRITICAL SYSTEM (includes grid crit chance bonus)
        const criticalChance = Math.min(75, baseCritChance + weaponCritChance + (gridBonuses.critChance || 0)); // Cap at 75%
        const criticalImpact = baseCritImpact * weaponCritImpact;

        // DEFENSE SYSTEM (includes stance modifier)
        const attributeDefense = attributes.defense * 0.02; // 2% per defense point
        const damageReductionRate = Math.min(0.90, attributeDefense + equipmentDefense + stanceDamageReductionBonus); // Cap at 90%
        const absoluteDamageReduction = equipmentAbsoluteDefense;
        const evasionRating = Math.min(75, baseEvasion + equipmentEvasion + stanceBlockChance); // Cap at 75%

        // HEALTH SYSTEM (includes grid max HP bonus)
        const maxHealth = (baseMaxHealth + equipmentHealthBonus + (gridBonuses.maxHp || 0)) * perkHealthMult;
        const currentHealth = this.state.combat.player.currentHealth;
        const hpRegenerationRate = attributes.health * 0.1; // 0.1 HP/sec per health point
        const lifestealPercent = attributes.strength * 0.1; // 0.1% per strength point

        // DAMAGE TYPING SYSTEM (for future enemy type weaknesses)
        const strongTyping = 1.5;  // 150% damage vs weak types
        const neutralTyping = 1.0; // 100% normal damage
        const weakTyping = 0.75;   // 75% damage vs strong types

        // ENEMY RESPAWN (can be modified by perks/gear later)
        const enemyRespawnTimer = 1.0; // Multiplier for enemy respawn times

        // === NEW ATTRIBUTE BONUSES ===

        // STRENGTH BONUSES
        const reloadTimeReduction = attributes.strength * 0.01; // 1% per strength point

        // HEALTH BONUSES
        const autoEatThresholdBonus = attributes.health * 0.02; // 2% per health point
        const dotResistance = attributes.health * 0.005; // 0.5% per health point

        // DEFENSE BONUSES
        const specialAttackBlockChance = Math.min(50, attributes.defense * 0.3); // 0.3% per defense, cap 50%

        // STEALTH BONUSES
        const firstStrikeBonusDamage = attributes.stealth * 0.01; // 1% per stealth point
        const enemyAccuracyReduction = attributes.stealth * 0.005; // 0.5% per stealth point

        // INTELLECT BONUSES
        const specialAttackChanceBonus = attributes.intellect * 0.002; // 0.2% per intellect point
        const consumableEfficiency = attributes.intellect * 0.005; // 0.5% per intellect point

        // === RETURN COMPREHENSIVE STATS ===
        return {
            // Display stats (for UI)
            maxHealth: maxHealth,
            currentHealth: currentHealth,
            attackDamage: totalBaseDamage,
            attackSpeed: 1000 / effectiveAttackInterval,
            accuracy: effectiveHitChance,

            // Damage system (hidden)
            damage: totalBaseDamage,
            maxHitOffset: maxHitOffset,
            minHitOffset: minHitOffset,
            maxHitMultiplier: maxHitMultiplier,
            minHitMultiplier: minHitMultiplier,
            maxHit: maxHit,
            minHit: minHit,
            avgDamagePerHit: avgDamagePerHit,
            damageRollWeightAbove: damageRollWeightAbove,
            damageRollWeightBelow: damageRollWeightBelow,

            // Attack speed system (hidden)
            characterAttackInterval: characterAttackInterval,
            weaponAttackInterval: weaponAttackInterval,
            effectiveAttackInterval: effectiveAttackInterval,

            // Hit chance system (hidden)
            characterHitChance: characterHitChance,
            weaponHitChance: weaponHitChance,
            effectiveHitChance: effectiveHitChance,

            // Critical system (hidden)
            criticalChance: criticalChance,
            criticalImpact: criticalImpact,

            // Special attacks (hidden)
            grenadeInterval: grenadeInterval,
            grenadeDamage: grenadeDamage,

            // Weapon mechanics (hidden)
            reloadInterval: reloadInterval,
            reloadTime: reloadTime,
            damageType: damageType,

            // Defense system (hidden)
            evasionRating: evasionRating,
            damageReductionRate: damageReductionRate,
            absoluteDamageReduction: absoluteDamageReduction,

            // Regeneration (hidden)
            hpRegenerationRate: hpRegenerationRate,
            lifestealPercent: lifestealPercent,

            // Damage typing (hidden)
            strongTyping: strongTyping,
            neutralTyping: neutralTyping,
            weakTyping: weakTyping,

            // Enemy mechanics (hidden)
            enemyRespawnTimer: enemyRespawnTimer,

            // === NEW ATTRIBUTE BONUSES ===
            // STRENGTH
            reloadTimeReduction: reloadTimeReduction,

            // HEALTH
            autoEatThresholdBonus: autoEatThresholdBonus,
            dotResistance: dotResistance,

            // DEFENSE
            specialAttackBlockChance: specialAttackBlockChance,

            // STEALTH
            firstStrikeBonusDamage: firstStrikeBonusDamage,
            enemyAccuracyReduction: enemyAccuracyReduction,

            // INTELLECT
            specialAttackChanceBonus: specialAttackChanceBonus,
            consumableEfficiency: consumableEfficiency,

            // STANCE
            currentStance: currentStance,
            stanceDamageMultiplier: stanceDamageMultiplier,
            stanceSpeedMultiplier: stanceSpeedMultiplier,
            stanceDamageReductionBonus: stanceDamageReductionBonus,
            stanceBlockChance: stanceBlockChance,

            // Legacy compatibility
            damageReduction: damageReductionRate
        };
    },

    /**
     * Calculate total weight of equipped items
     */
    getTotalEquippedWeight() {
        let totalWeight = 0;

        // Loop through all equipment slots
        for (let slot in this.state.equipment) {
            const itemId = this.state.equipment[slot];
            if (itemId) {
                const itemDef = EquipmentSystem._getItemDef.call(this, itemId);
                if (itemDef && itemDef.stats && itemDef.stats.weight) {
                    totalWeight += itemDef.stats.weight;
                }
            }
        }

        return totalWeight;
    },

    /**
     * Calculate maximum equipment weight capacity based on strength
     * Base capacity: 50
     * +10 per strength point
     */
    getMaxEquipmentWeight() {
        const baseCapacity = 50;
        const perStrength = 10;
        const strength = this.state.combatAttributes.strength || 1;

        return baseCapacity + (strength * perStrength);
    },

    /**
     * Calculate Combat Power rating
     * Returns a numeric power rating and tier information
     */
    calculateCombatPower() {
        const stats = this.getPlayerCombatStats();
        const charLevel = this.state.characterLevel.level;
        const totalWeight = this.getTotalEquippedWeight();

        // Calculate average skill level (excluding combat which is character level based)
        const skills = this.state.skills;
        let totalSkillLevels = 0;
        let skillCount = 0;

        for (let skillId in skills) {
            if (skillId !== 'combat' && skills[skillId].unlocked) {
                totalSkillLevels += skills[skillId].level;
                skillCount++;
            }
        }

        const avgSkillLevel = skillCount > 0 ? totalSkillLevels / skillCount : 0;

        // Combat Power Formula
        const combatPower = Math.floor(
            (charLevel * 10) +                    // Base: Character Level × 10
            (stats.maxHealth / 10) +              // Health Contribution
            (stats.attackDamage * 5) +            // Damage Contribution
            (stats.damageReduction * 100) +       // Defense Contribution (percentage to points)
            (stats.attackSpeed * 20) +            // Speed Contribution
            (totalWeight * 0.5) +                 // Equipment Weight
            (avgSkillLevel * 2)                   // Skill Average
        );

        // Determine tier
        let tier = 'Novice';
        let tierColor = '#ffffff';

        if (combatPower >= 5000) {
            tier = 'Master';
            tierColor = '#ff9800'; // Orange
        } else if (combatPower >= 2000) {
            tier = 'Expert';
            tierColor = '#9c27b0'; // Purple
        } else if (combatPower >= 1000) {
            tier = 'Skilled';
            tierColor = '#2196f3'; // Blue
        } else if (combatPower >= 500) {
            tier = 'Capable';
            tierColor = '#4caf50'; // Green
        }

        return {
            power: combatPower,
            tier: tier,
            tierColor: tierColor
        };
    },

    /**
     * Recalculate and update player stats
     * Safely handles cases where combat.player structure doesn't exist
     */
    recalculatePlayerStats() {
        // Ensure combat state structure exists before accessing
        if (!this.state.combat) {
            this.state.combat = {};
        }
        if (!this.state.combat.player) {
            this.state.combat.player = {
                currentHealth: 100,
                maxHealth: 100,
                baseAttackDamage: 5,
                baseAttackSpeed: 1.0,
                baseAccuracy: 75
            };
        }

        const stats = this.getPlayerCombatStats();

        // Safely get old max health (default to current if not set)
        const oldMaxHealth = this.state.combat.player.maxHealth || stats.maxHealth;
        this.state.combat.player.maxHealth = stats.maxHealth;

        if (stats.maxHealth > oldMaxHealth) {
            const healthIncrease = stats.maxHealth - oldMaxHealth;
            this.state.combat.player.currentHealth = (this.state.combat.player.currentHealth || 100) + healthIncrease;
        }

        // Cap current health at max
        this.state.combat.player.currentHealth = Math.min(
            this.state.combat.player.currentHealth || stats.maxHealth,
            stats.maxHealth
        );
    }
};
