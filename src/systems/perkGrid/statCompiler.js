/**
 * STAT COMPILER - Centralized Stat Compilation System
 *
 * Compiles all player stats from three sources:
 * 1. Base attributes (combatAttributes)
 * 2. Equipment bonuses
 * 3. Perk grid multipliers
 *
 * Results stored in GameEngine.state.compiledStats
 * All game systems should read from compiledStats, not calculate on the fly
 */

const StatCompiler = {

    /**
     * Initialize the stat compiler
     */
    init(engine) {
        engine.compilePlayerStats = this.compilePlayerStats.bind(engine);
        engine.getCompiledStat = this.getCompiledStat.bind(engine);
        engine.recompileStats = this.recompileStats.bind(engine);

        console.log('✅ StatCompiler initialized');
    },

    /**
     * Main compilation function - call this whenever stats need updating
     * Compiles all stats and stores in state.compiledStats
     */
    compilePlayerStats() {
        const state = this.state;
        const attributes = state.combatAttributes || {};
        const equipment = state.equipment || {};

        // Get perk multipliers from perk grid
        const perks = typeof this.getPerkMultipliers === 'function'
            ? this.getPerkMultipliers()
            : StatCompiler.getDefaultMultipliers();

        // Get equipment bonuses
        const equipmentStats = StatCompiler.compileEquipmentStats.call(this, equipment);

        // Compile all stat categories
        const compiled = {
            // ═══ COMBAT OFFENSE ═══
            ...StatCompiler.compileOffenseStats(attributes, equipmentStats, perks),

            // ═══ COMBAT DEFENSE ═══
            ...StatCompiler.compileDefenseStats(attributes, equipmentStats, perks),

            // ═══ RESISTANCES ═══
            ...StatCompiler.compileResistanceStats(attributes, equipmentStats, perks),

            // ═══ CONSUMABLE MODIFIERS ═══
            ...StatCompiler.compileConsumableStats(perks),

            // ═══ NAVIGATION ═══
            ...StatCompiler.compileNavigationStats(attributes, perks),

            // ═══ GATHERING ═══
            ...StatCompiler.compileGatheringStats(attributes, equipmentStats, perks),

            // ═══ CRAFTING ═══
            ...StatCompiler.compileCraftingStats(attributes, perks),

            // ═══ EXPERIENCE ═══
            ...StatCompiler.compileExperienceStats(perks),

            // ═══ LOOT ═══
            ...StatCompiler.compileLootStats(perks),

            // ═══ META ═══
            lastCompiled: Date.now(),
            perkMultipliers: perks  // Store raw perks for reference
        };

        // Store in state
        state.compiledStats = compiled;

        // Log compilation details for debugging
        const activePerks = Object.entries(perks).filter(([k, v]) => v !== 1.0);
        console.log('📊 Stats compiled:', {
            healthAttr: attributes.health,
            healthScaling: perks.healthScaling,
            maxHealthPerk: perks.maxHealth,
            equipmentHealth: equipmentStats.maxHealth,
            finalMaxHealth: compiled.maxHealth,
            activePerks: activePerks.length,
            perks: activePerks.map(([k, v]) => `${k}: ${(v * 100 - 100).toFixed(1)}%`)
        });

        return compiled;
    },

    /**
     * Get a single compiled stat (with fallback if not yet compiled)
     */
    getCompiledStat(statName) {
        if (!this.state.compiledStats) {
            this.compilePlayerStats();
        }
        return this.state.compiledStats[statName];
    },

    /**
     * Force recompilation (alias for compilePlayerStats)
     */
    recompileStats() {
        return this.compilePlayerStats();
    },

    // ═══════════════════════════════════════════════════════════════
    // COMPILATION HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Compile equipment stats from equipped items
     */
    compileEquipmentStats(equipment) {
        const stats = {
            attackDamage: 0,
            attackSpeed: 0,
            accuracy: 0,
            critRating: 0,
            critMultiplier: 0,
            maxHealth: 0,
            evasion: 0,
            armorRating: 0,
            damageReduction: 0,
            weaponDamage: 0,
            weaponAccuracyMod: 1.0,
            critResistance: 0
        };

        // Iterate through equipment slots and sum bonuses
        for (const [slot, itemId] of Object.entries(equipment || {})) {
            if (!itemId) continue;

            // Get item definition (handle instance IDs)
            let itemDef;
            if (typeof ItemIdUtils !== 'undefined') {
                itemDef = ItemIdUtils.getItemDefinition(itemId);
            } else if (typeof ItemRegistry !== 'undefined') {
                const baseId = itemId.includes('_') ? itemId.split('_')[0] : itemId;
                itemDef = ItemRegistry.getItem(baseId);
            }

            if (!itemDef) continue;

            // Weapon handling
            if (slot === 'weapon') {
                stats.weaponDamage = itemDef.baseDamage || itemDef.combatStats?.damage || 0;
                stats.attackDamage += stats.weaponDamage;
            }

            // Armor handling - check combatStats first (new format)
            const combatStats = itemDef.combatStats || {};
            if (combatStats.defense) {
                stats.armorRating += combatStats.defense;
            }
            if (combatStats.health) {
                stats.maxHealth += combatStats.health;
            }
            if (combatStats.evasion) {
                stats.evasion += combatStats.evasion;
            }
            if (combatStats.damage) {
                stats.attackDamage += combatStats.damage;
            }
            if (combatStats.accuracy) {
                stats.accuracy += combatStats.accuracy;
            }

            // Legacy armor stats
            if (itemDef.armorRating) {
                stats.armorRating += itemDef.armorRating;
            }
            if (itemDef.damageReduction) {
                stats.damageReduction += itemDef.damageReduction;
            }

            // Generic stat bonuses (legacy format)
            if (itemDef.stats) {
                stats.maxHealth += itemDef.stats.maxHealth || 0;
                stats.accuracy += itemDef.stats.accuracy || 0;
                stats.critRating += itemDef.stats.critRating || 0;
                stats.evasion += itemDef.stats.evasion || 0;
                stats.critResistance += itemDef.stats.critResistance || 0;
                stats.armorRating += itemDef.stats.armorRating || 0;
                stats.damageReduction += itemDef.stats.damageReduction || 0;
            }
        }

        return stats;
    },

    /**
     * Compile offense stats
     */
    compileOffenseStats(attributes, equipmentStats, perks) {
        const strength = attributes.strength || 1;
        const perception = attributes.perception || 1;
        const mobility = attributes.mobility || 1;

        // Base melee damage: strength contributes
        const baseMeleeDamage = 5 + (strength * 2);
        const meleeDamage = Math.floor(
            (baseMeleeDamage + equipmentStats.attackDamage)
            * (perks.strengthScaling || 1.0)
            * (perks.meleeDamage || 1.0)
        );

        // Base ranged damage: perception contributes
        const baseRangedDamage = 5 + (perception * 1.5);
        const rangedDamage = Math.floor(
            (baseRangedDamage + equipmentStats.attackDamage)
            * (perks.perceptionScaling || 1.0)
            * (perks.rangedDamage || 1.0)
        );

        // Accuracy: perception-based
        const baseAccuracy = 70 + (perception * 2);
        const accuracy = Math.min(95, Math.floor(
            (baseAccuracy + equipmentStats.accuracy)
            * (perks.accuracy || 1.0)
        ));

        // Crit rating: perception-based
        const baseCritRating = 5 + (perception * 0.5);
        const critRating = Math.floor(
            (baseCritRating + equipmentStats.critRating)
            * (perks.critRating || 1.0)
        );

        // Crit multiplier
        const baseCritMultiplier = 1.5;
        const critMultiplier = (baseCritMultiplier + equipmentStats.critMultiplier)
            * (perks.critMultiplier || 1.0);

        // Attack speed: mobility-based (interval in ms, lower = faster)
        const baseAttackInterval = 2000; // 2 second base attack
        const mobilityReduction = mobility * 20; // -20ms per mobility
        const attackInterval = Math.max(500,
            (baseAttackInterval - mobilityReduction - (equipmentStats.attackSpeed || 0))
            / (perks.mobilityScaling || 1.0)
            / (perks.attackSpeed || 1.0)
        );

        // Attack speed as attacks per second for display
        const attackSpeed = 1000 / attackInterval;

        return {
            meleeDamage,
            rangedDamage,
            accuracy,
            critRating,
            critMultiplier,
            attackSpeed,
            attackInterval
        };
    },

    /**
     * Compile defense stats
     */
    compileDefenseStats(attributes, equipmentStats, perks) {
        const health = attributes.health || 1;
        const defense = attributes.defense || 1;
        const mobility = attributes.mobility || 1;

        // Max health: base 100 + health attribute * 10
        const baseHealth = 100;
        const attributeHealth = health * 10 * (perks.healthScaling || 1.0);
        const maxHealth = Math.floor(
            (baseHealth + attributeHealth + equipmentStats.maxHealth)
            * (perks.maxHealth || 1.0)
        );

        // Evasion: mobility-based
        const baseEvasion = mobility * 1.5;
        const evasion = Math.min(50, Math.floor(
            (baseEvasion + equipmentStats.evasion)
            * (perks.mobilityScaling || 1.0)
            * (perks.evasion || 1.0)
        ));

        // Armor rating: defense-based
        const baseArmor = defense * 3;
        const armorRating = Math.floor(
            (baseArmor + equipmentStats.armorRating)
            * (perks.defenseScaling || 1.0)
            * (perks.armorRating || 1.0)
        );

        // Damage reduction: defense-based (percentage)
        const baseDR = defense * 0.01;
        const damageReduction = Math.min(0.75,
            (baseDR + equipmentStats.damageReduction)
            * (perks.damageReduction || 1.0)
        );

        // Crit resistance
        const critResistance = Math.min(50, Math.floor(
            (defense * 0.5 + equipmentStats.critResistance)
            * (perks.critResistance || 1.0)
        ));

        return {
            maxHealth,
            evasion,
            armorRating,
            damageReduction,
            critResistance
        };
    },

    /**
     * Compile resistance stats
     */
    compileResistanceStats(attributes, equipmentStats, perks) {
        // Base resistances from defense attribute
        const defense = attributes.defense || 1;
        const baseResist = defense * 0.5;

        return {
            pierceResist: Math.floor(baseResist * (perks.pierceResist || 1.0)),
            explosiveResist: Math.floor(baseResist * (perks.explosiveResist || 1.0)),
            cryoResist: Math.floor(baseResist * (perks.cryoResist || 1.0)),
            shockResist: Math.floor(baseResist * (perks.shockResist || 1.0)),
            incendiaryResist: Math.floor(baseResist * (perks.incendiaryResist || 1.0))
        };
    },

    /**
     * Compile consumable modifiers
     */
    compileConsumableStats(perks) {
        // Conservation: higher perk = lower consume chance
        // Formula: consumeChance = max(0, 1.0 - (multiplier - 1.0))
        const calcConsumeChance = (mult) => Math.max(0, 1.0 - ((mult || 1.0) - 1.0));

        return {
            // Effectiveness multipliers
            foodHealingMultiplier: perks.foodHealing || 1.0,
            potionPotencyMultiplier: perks.potionPotency || 1.0,
            techPotencyMultiplier: perks.techPotency || 1.0,

            // Conservation (consume chances - lower is better)
            foodConsumeChance: calcConsumeChance(perks.foodConservation),
            potionConsumeChance: calcConsumeChance(perks.potionConservation),
            techConsumeChance: calcConsumeChance(perks.techConservation),
            ammoConsumeChance: calcConsumeChance(perks.ammoConservation),

            // Auto-eat
            autoEatThresholdMultiplier: perks.autoEatThreshold || 1.0,
            autoEatEfficiencyMultiplier: perks.autoEatEfficiency || 1.0
        };
    },

    /**
     * Compile navigation stats
     */
    compileNavigationStats(attributes, perks) {
        const mobility = attributes.mobility || 1;
        const health = attributes.health || 1;
        const perception = attributes.perception || 1;

        // Base exploration interval: 3000ms, reduced by mobility
        const baseExplorationInterval = 3000;
        const explorationInterval = Math.max(1000, Math.floor(
            (baseExplorationInterval - (mobility * 50)) / (perks.explorationSpeed || 1.0)
        ));

        // Discovery chance: perception-based
        const baseDiscoveryChance = 0.20 + (perception * 0.02);
        const discoveryChance = Math.min(0.95,
            baseDiscoveryChance * (perks.discoveryChance || 1.0)
        );

        // Max endurance: health-based
        const baseEndurance = 100 + (health * 5) + (mobility * 3);
        const maxEndurance = Math.floor(
            baseEndurance * (perks.enduranceCapacity || 1.0)
        );

        // Endurance recovery: per second
        const baseRecovery = 2 + (health * 0.2);
        const enduranceRecovery = baseRecovery * (perks.enduranceRecovery || 1.0);

        // Path discovery chance
        const basePathChance = 0.10;
        const pathDiscoveryChance = Math.min(0.50,
            basePathChance * (perks.pathDiscovery || 1.0)
        );

        return {
            explorationInterval,
            discoveryChance,
            maxEndurance,
            enduranceRecovery,
            pathDiscoveryChance
        };
    },

    /**
     * Compile gathering stats
     */
    compileGatheringStats(attributes, equipmentStats, perks) {
        // Base gathering interval: 3000ms
        const baseInterval = 3000;

        // Speed multipliers reduce interval
        const calcInterval = (speedPerk) => Math.max(500, Math.floor(baseInterval / (speedPerk || 1.0)));

        // Yield multipliers (applied with rounding at 0.50)
        const getYield = (yieldPerk) => yieldPerk || 1.0;

        return {
            // Intervals (ms)
            miningInterval: calcInterval(perks.miningSpeed),
            loggingInterval: calcInterval(perks.loggingSpeed),
            fishingInterval: calcInterval(perks.fishingSpeed),
            huntingInterval: calcInterval(perks.huntingSpeed),
            foragingInterval: calcInterval(perks.foragingSpeed),
            thievingInterval: calcInterval(perks.thievingSpeed),

            // Yield multipliers
            miningYield: getYield(perks.miningYield),
            loggingYield: getYield(perks.loggingYield),
            fishingYield: getYield(perks.fishingYield),
            huntingYield: getYield(perks.huntingYield),
            foragingYield: getYield(perks.foragingYield),
            thievingYield: getYield(perks.thievingYield),

            // Speed multipliers (for display)
            miningSpeedMultiplier: perks.miningSpeed || 1.0,
            loggingSpeedMultiplier: perks.loggingSpeed || 1.0,
            fishingSpeedMultiplier: perks.fishingSpeed || 1.0,
            huntingSpeedMultiplier: perks.huntingSpeed || 1.0,
            foragingSpeedMultiplier: perks.foragingSpeed || 1.0,
            thievingSpeedMultiplier: perks.thievingSpeed || 1.0
        };
    },

    /**
     * Compile crafting stats
     */
    compileCraftingStats(attributes, perks) {
        // Base crafting interval: 5000ms
        const baseInterval = 5000;

        // Speed multipliers reduce interval
        const calcInterval = (speedPerk) => Math.max(1000, Math.floor(baseInterval / (speedPerk || 1.0)));

        // Yield multipliers
        const getYield = (yieldPerk) => yieldPerk || 1.0;

        // Rarity multipliers (for instanced crafts)
        const getRarity = (rarityPerk) => rarityPerk || 1.0;

        return {
            // Speed intervals (ms)
            cookingInterval: calcInterval(perks.cookingSpeed),
            chemistryInterval: calcInterval(perks.chemistrySpeed),
            smithingInterval: calcInterval(perks.smithingSpeed),
            mechanicsInterval: calcInterval(perks.mechanicsSpeed),
            electronicsInterval: calcInterval(perks.electronicsSpeed),
            textilesInterval: calcInterval(perks.textilesSpeed),
            engineeringInterval: calcInterval(perks.engineeringSpeed),

            // Yield multipliers (non-instanced only)
            cookingYield: getYield(perks.cookingYield),
            chemistryYield: getYield(perks.chemistryYield),
            smithingYield: getYield(perks.smithingYield),
            electronicsYield: getYield(perks.electronicsYield),
            engineeringYield: getYield(perks.engineeringYield),

            // Rarity multipliers (instanced only)
            mechanicsRarity: getRarity(perks.mechanicsRarity),
            textilesRarity: getRarity(perks.textilesRarity),

            // Speed multipliers (for display)
            cookingSpeedMultiplier: perks.cookingSpeed || 1.0,
            chemistrySpeedMultiplier: perks.chemistrySpeed || 1.0,
            smithingSpeedMultiplier: perks.smithingSpeed || 1.0,
            mechanicsSpeedMultiplier: perks.mechanicsSpeed || 1.0,
            electronicsSpeedMultiplier: perks.electronicsSpeed || 1.0,
            textilesSpeedMultiplier: perks.textilesSpeed || 1.0,
            engineeringSpeedMultiplier: perks.engineeringSpeed || 1.0
        };
    },

    /**
     * Compile experience stats
     */
    compileExperienceStats(perks) {
        return {
            combatXPMultiplier: perks.combatXP || 1.0,
            skillXPMultiplier: perks.skillXP || 1.0
        };
    },

    /**
     * Compile loot stats (gold, fragments, items)
     */
    compileLootStats(perks) {
        return {
            goldFindMultiplier: perks.goldFind || 1.0,
            fragmentFindMultiplier: perks.fragmentFind || 1.0,
            itemFindMultiplier: perks.itemFind || 1.0
        };
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get default multipliers (all 1.0)
     */
    getDefaultMultipliers() {
        const defaults = {};
        // This should match PERK_STAT_POOL keys (68 total)
        const perkKeys = [
            // Offense (6)
            'meleeDamage', 'rangedDamage', 'accuracy', 'critRating', 'critMultiplier', 'attackSpeed',
            // Defense (5)
            'maxHealth', 'evasion', 'armorRating', 'damageReduction', 'critResistance',
            // Resistance (5)
            'pierceResist', 'explosiveResist', 'cryoResist', 'shockResist', 'incendiaryResist',
            // Consumable (9)
            'foodHealing', 'potionPotency', 'techPotency',
            'foodConservation', 'potionConservation', 'techConservation', 'ammoConservation',
            'autoEatThreshold', 'autoEatEfficiency',
            // Combat Loot (3)
            'goldFind', 'fragmentFind', 'itemFind',
            // Scaling (7)
            'healthScaling', 'strengthScaling', 'defenseScaling', 'mobilityScaling',
            'perceptionScaling', 'stealthScaling', 'intelligenceScaling',
            // Navigation (5)
            'explorationSpeed', 'discoveryChance', 'enduranceCapacity', 'enduranceRecovery', 'pathDiscovery',
            // Gathering Speed (6)
            'miningSpeed', 'loggingSpeed', 'fishingSpeed', 'huntingSpeed', 'foragingSpeed', 'thievingSpeed',
            // Gathering Yield (6)
            'miningYield', 'loggingYield', 'fishingYield', 'huntingYield', 'foragingYield', 'thievingYield',
            // Crafting Speed (7)
            'cookingSpeed', 'chemistrySpeed', 'smithingSpeed', 'mechanicsSpeed', 'electronicsSpeed', 'textilesSpeed', 'engineeringSpeed',
            // Crafting Yield (5)
            'cookingYield', 'chemistryYield', 'smithingYield', 'electronicsYield', 'engineeringYield',
            // Crafting Rarity (2)
            'mechanicsRarity', 'textilesRarity',
            // Experience (2)
            'combatXP', 'skillXP'
        ];

        for (const key of perkKeys) {
            defaults[key] = 1.0;
        }
        return defaults;
    },

    /**
     * Apply yield multiplier with rounding at 0.50 threshold
     */
    applyYieldMultiplier(baseQuantity, yieldMultiplier) {
        const rawYield = baseQuantity * yieldMultiplier;
        return Math.round(rawYield);  // 1.49 → 1, 1.50 → 2
    },

    /**
     * Roll conservation check - returns true if item should be consumed
     */
    shouldConsumeItem(consumeChance) {
        return Math.random() < consumeChance;
    },

    /**
     * Apply loot multiplier with rounding at 0.50 threshold
     * @param {number} baseAmount - Base drop amount
     * @param {number} multiplier - Perk multiplier (e.g., 1.15 = +15%)
     * @returns {number} Final amount rounded to nearest integer
     */
    applyLootMultiplier(baseAmount, multiplier) {
        const rawAmount = baseAmount * multiplier;
        return Math.round(rawAmount);  // 1.49 → 1, 1.50 → 2
    },

    /**
     * Legacy method - returns compiled stats (backward compatibility)
     */
    getCompiledStats() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state?.compiledStats) {
            return GameEngine.state.compiledStats;
        }
        return this.compilePlayerStats.call(GameEngine);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.StatCompiler = StatCompiler;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatCompiler;
}
