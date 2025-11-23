/**
 * MODULAR 5-LAYER STAT CALCULATION SYSTEM
 *
 * ============================================================================
 * CRITICAL: This is the SINGLE SOURCE OF TRUTH for all stat calculations.
 * All game systems MUST use this for stat calculations.
 * ============================================================================
 *
 * Layer Order (NEVER CHANGE):
 * 1. Base Game Values     - Core balance values (designer-tweakable)
 * 2. Character Attributes - Attribute bonuses (HEALTH, STRENGTH, etc.)
 * 3. Equipment Modifiers  - Gear bonuses from equipped items
 * 4. Perk Grid Modifiers  - Perk grid multipliers and bonuses
 * 5. Build Modifiers      - Skills, stance, consumables, temporary effects
 *
 * Each layer builds upon the previous, creating a transparent and modular
 * stat calculation pipeline that can be extended without breaking existing systems.
 */

const StatCalculator = {
    /**
     * Configuration for stat types and calculation methods
     */
    statConfig: {
        /**
         * Calculation types define HOW different categories of stats are calculated
         */
        calculationTypes: {
            // Speed stats: Lower is better (milliseconds, cooldowns)
            // Applied as: base * (1 - reductionPercent) then / (1 + multiplierPercent)
            'SPEED': 'multiplicative_reduction',

            // Power stats: Higher is better (damage, health, resources)
            // Applied as: (base + additive) * (1 + multiplierPercent)
            'POWER': 'additive_then_multiplicative',

            // Percentage stats: 0-100 range, often capped
            // Applied as: base + additive, then capped
            'PERCENTAGE': 'additive_capped',

            // Multiplier stats: Pure multiplicative (1.0 = 100%)
            // Applied as: base * layer1 * layer2 * layer3...
            'MULTIPLIER': 'pure_multiplicative',
        },

        /**
         * Map each stat to its calculation type
         */
        statTypes: {
            // ===== SPEED STATS (lower is better) =====
            'attackSpeed': 'SPEED',           // Milliseconds between attacks
            'reloadSpeed': 'SPEED',           // Milliseconds to reload
            'miningSpeed': 'SPEED',           // Milliseconds per resource
            'woodcuttingSpeed': 'SPEED',      // Milliseconds per log
            'loggingSpeed': 'SPEED',          // Milliseconds per log (same as woodcutting)
            'fishingSpeed': 'SPEED',          // Milliseconds per fish
            'huntingSpeed': 'SPEED',          // Milliseconds per hunt
            'foragingSpeed': 'SPEED',         // Milliseconds per forage
            'thievingSpeed': 'SPEED',         // Milliseconds per pickpocket
            'craftingSpeed': 'SPEED',         // Milliseconds per craft
            'cookingSpeed': 'SPEED',          // Milliseconds per cook

            // ===== POWER STATS (higher is better) =====
            'attackDamage': 'POWER',          // Base attack damage
            'maxHealth': 'POWER',             // Maximum health points
            'healthRegen': 'POWER',           // HP regeneration per second
            'miningPower': 'POWER',           // Mining yield bonus
            'woodcuttingPower': 'POWER',      // Woodcutting yield bonus
            'loggingPower': 'POWER',          // Logging yield bonus (same as woodcutting)
            'fishingPower': 'POWER',          // Fishing yield bonus
            'huntingPower': 'POWER',          // Hunting yield bonus
            'foragingPower': 'POWER',         // Foraging yield bonus
            'thievingPower': 'POWER',         // Thieving yield bonus

            // ===== PERCENTAGE STATS (0-100, capped) =====
            'accuracy': 'PERCENTAGE',         // Hit chance %
            'evasion': 'PERCENTAGE',          // Dodge chance %
            'criticalChance': 'PERCENTAGE',   // Critical hit chance %
            'blockChance': 'PERCENTAGE',      // Block chance %
            'damageReduction': 'PERCENTAGE',  // Damage reduction %

            // Harvesting success chances
            'miningChance': 'PERCENTAGE',     // Mining success chance %
            'woodcuttingChance': 'PERCENTAGE', // Woodcutting success chance %
            'loggingChance': 'PERCENTAGE',    // Logging success chance % (same as woodcutting)
            'fishingChance': 'PERCENTAGE',    // Fishing success chance %
            'huntingChance': 'PERCENTAGE',    // Hunting success chance %
            'foragingChance': 'PERCENTAGE',   // Foraging success chance %
            'thievingChance': 'PERCENTAGE',   // Thieving success chance %

            // Harvesting crit chances
            'miningCritChance': 'PERCENTAGE', // Mining crit chance %
            'woodcuttingCritChance': 'PERCENTAGE', // Woodcutting crit chance %
            'loggingCritChance': 'PERCENTAGE', // Logging crit chance % (same as woodcutting)
            'fishingCritChance': 'PERCENTAGE', // Fishing crit chance %
            'huntingCritChance': 'PERCENTAGE', // Hunting crit chance %
            'foragingCritChance': 'PERCENTAGE', // Foraging crit chance %
            'thievingCritChance': 'PERCENTAGE', // Thieving crit chance %

            // Harvesting rare chances
            'miningRareChance': 'PERCENTAGE', // Mining rare drop chance %
            'woodcuttingRareChance': 'PERCENTAGE', // Woodcutting rare drop chance %
            'loggingRareChance': 'PERCENTAGE', // Logging rare drop chance % (same as woodcutting)
            'fishingRareChance': 'PERCENTAGE', // Fishing rare drop chance %
            'huntingRareChance': 'PERCENTAGE', // Hunting rare drop chance %
            'foragingRareChance': 'PERCENTAGE', // Foraging rare drop chance %
            'thievingRareChance': 'PERCENTAGE', // Thieving rare drop chance %

            // ===== MULTIPLIER STATS (pure multiplicative) =====
            'criticalDamage': 'MULTIPLIER',   // Critical hit damage multiplier
            'dropRateMultiplier': 'MULTIPLIER', // Loot drop rate multiplier
            'experienceMultiplier': 'MULTIPLIER', // XP gain multiplier

            // Harvesting crit multipliers
            'miningCritMultiplier': 'MULTIPLIER', // Mining crit yield multiplier
            'woodcuttingCritMultiplier': 'MULTIPLIER', // Woodcutting crit yield multiplier
            'loggingCritMultiplier': 'MULTIPLIER', // Logging crit yield multiplier (same as woodcutting)
            'fishingCritMultiplier': 'MULTIPLIER', // Fishing crit yield multiplier
            'huntingCritMultiplier': 'MULTIPLIER', // Hunting crit yield multiplier
            'foragingCritMultiplier': 'MULTIPLIER', // Foraging crit yield multiplier
            'thievingCritMultiplier': 'MULTIPLIER', // Thieving crit yield multiplier

            // Harvesting rare multipliers
            'miningRareMultiplier': 'MULTIPLIER', // Mining rare yield multiplier
            'woodcuttingRareMultiplier': 'MULTIPLIER', // Woodcutting rare yield multiplier
            'loggingRareMultiplier': 'MULTIPLIER', // Logging rare yield multiplier (same as woodcutting)
            'fishingRareMultiplier': 'MULTIPLIER', // Fishing rare yield multiplier
            'huntingRareMultiplier': 'MULTIPLIER', // Hunting rare yield multiplier
            'foragingRareMultiplier': 'MULTIPLIER', // Foraging rare yield multiplier
            'thievingRareMultiplier': 'MULTIPLIER', // Thieving rare yield multiplier
        },

        /**
         * Caps for percentage stats (prevents going over 100% or other limits)
         */
        statCaps: {
            // Combat caps
            'accuracy': 95,           // Max 95% hit chance
            'evasion': 75,            // Max 75% dodge chance
            'criticalChance': 75,     // Max 75% crit chance
            'blockChance': 50,        // Max 50% block chance
            'damageReduction': 90,    // Max 90% damage reduction

            // Harvesting success chance caps
            'miningChance': 95,       // Max 95% mining success
            'woodcuttingChance': 95,  // Max 95% woodcutting success
            'loggingChance': 95,      // Max 95% logging success
            'fishingChance': 95,      // Max 95% fishing success
            'huntingChance': 95,      // Max 95% hunting success
            'foragingChance': 95,     // Max 95% foraging success
            'thievingChance': 95,     // Max 95% thieving success

            // Harvesting crit chance caps
            'miningCritChance': 50,   // Max 50% mining crit
            'woodcuttingCritChance': 50, // Max 50% woodcutting crit
            'loggingCritChance': 50,  // Max 50% logging crit
            'fishingCritChance': 50,  // Max 50% fishing crit
            'huntingCritChance': 50,  // Max 50% hunting crit
            'foragingCritChance': 50, // Max 50% foraging crit
            'thievingCritChance': 50, // Max 50% thieving crit

            // Harvesting rare chance caps
            'miningRareChance': 25,   // Max 25% rare drops
            'woodcuttingRareChance': 25, // Max 25% rare drops
            'loggingRareChance': 25,  // Max 25% logging rare drops
            'fishingRareChance': 25,  // Max 25% rare drops
            'huntingRareChance': 25,  // Max 25% rare drops
            'foragingRareChance': 25, // Max 25% rare drops
            'thievingRareChance': 25, // Max 25% rare drops
        },

        /**
         * Stat display formatting
         */
        statFormats: {
            // Speed stats
            'attackSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'reloadSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'miningSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'woodcuttingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'fishingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'huntingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'foragingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'thievingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'craftingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,
            'cookingSpeed': (val) => `${(val / 1000).toFixed(2)}s`,

            // Power stats
            'attackDamage': (val) => `${Math.floor(val)}`,
            'maxHealth': (val) => `${Math.floor(val)}`,
            'healthRegen': (val) => `${val.toFixed(1)}/s`,

            // Combat percentage stats
            'accuracy': (val) => `${val.toFixed(1)}%`,
            'evasion': (val) => `${val.toFixed(1)}%`,
            'criticalChance': (val) => `${val.toFixed(1)}%`,
            'blockChance': (val) => `${val.toFixed(1)}%`,
            'damageReduction': (val) => `${val.toFixed(1)}%`,

            // Harvesting success chances
            'miningChance': (val) => `${val.toFixed(1)}%`,
            'woodcuttingChance': (val) => `${val.toFixed(1)}%`,
            'fishingChance': (val) => `${val.toFixed(1)}%`,
            'huntingChance': (val) => `${val.toFixed(1)}%`,
            'foragingChance': (val) => `${val.toFixed(1)}%`,
            'thievingChance': (val) => `${val.toFixed(1)}%`,

            // Harvesting crit chances
            'miningCritChance': (val) => `${val.toFixed(1)}%`,
            'woodcuttingCritChance': (val) => `${val.toFixed(1)}%`,
            'fishingCritChance': (val) => `${val.toFixed(1)}%`,
            'huntingCritChance': (val) => `${val.toFixed(1)}%`,
            'foragingCritChance': (val) => `${val.toFixed(1)}%`,
            'thievingCritChance': (val) => `${val.toFixed(1)}%`,

            // Harvesting rare chances
            'miningRareChance': (val) => `${val.toFixed(1)}%`,
            'woodcuttingRareChance': (val) => `${val.toFixed(1)}%`,
            'fishingRareChance': (val) => `${val.toFixed(1)}%`,
            'huntingRareChance': (val) => `${val.toFixed(1)}%`,
            'foragingRareChance': (val) => `${val.toFixed(1)}%`,
            'thievingRareChance': (val) => `${val.toFixed(1)}%`,

            // Multiplier stats
            'criticalDamage': (val) => `${val.toFixed(2)}x`,
            'dropRateMultiplier': (val) => `${val.toFixed(2)}x`,
            'experienceMultiplier': (val) => `${val.toFixed(2)}x`,

            // Harvesting crit multipliers
            'miningCritMultiplier': (val) => `${val.toFixed(2)}x`,
            'woodcuttingCritMultiplier': (val) => `${val.toFixed(2)}x`,
            'fishingCritMultiplier': (val) => `${val.toFixed(2)}x`,
            'huntingCritMultiplier': (val) => `${val.toFixed(2)}x`,
            'foragingCritMultiplier': (val) => `${val.toFixed(2)}x`,
            'thievingCritMultiplier': (val) => `${val.toFixed(2)}x`,

            // Harvesting rare multipliers
            'miningRareMultiplier': (val) => `${val.toFixed(2)}x`,
            'woodcuttingRareMultiplier': (val) => `${val.toFixed(2)}x`,
            'fishingRareMultiplier': (val) => `${val.toFixed(2)}x`,
            'huntingRareMultiplier': (val) => `${val.toFixed(2)}x`,
            'foragingRareMultiplier': (val) => `${val.toFixed(2)}x`,
            'thievingRareMultiplier': (val) => `${val.toFixed(2)}x`,
        }
    },

    /**
     * Base game values - DESIGN TEAM TWEAKS THESE
     * These are the core balance knobs that designers use to tune the game
     */
    baseGameValues: {
        // ===== COMBAT STATS =====
        attackSpeed: 2500,              // Base 2.5 seconds between attacks
        attackDamage: 10,               // Base 10 damage per attack
        maxHealth: 500,                 // Base 500 health
        healthRegen: 1,                 // Base 1 HP/sec regeneration
        accuracy: 75,                   // Base 75% hit chance
        evasion: 5,                     // Base 5% dodge chance
        criticalChance: 5,              // Base 5% crit chance
        criticalDamage: 1.5,            // Base 1.5x crit multiplier
        blockChance: 0,                 // Base 0% block chance
        damageReduction: 0,             // Base 0% damage reduction

        // ===== WEAPON RELOAD =====
        reloadSpeed: 2000,              // Base 2 second reload

        // ===== GATHERING STATS =====
        // Mining - Steady and reliable
        miningSpeed: 5000,              // Base 5 seconds per ore
        miningPower: 1,                 // Base mining yield

        // Woodcutting/Logging - Steady and reliable
        woodcuttingSpeed: 5000,         // Base 5 seconds per log
        woodcuttingPower: 1,            // Base woodcutting yield
        loggingSpeed: 5000,             // Base 5 seconds per log (same as woodcutting)
        loggingPower: 1,                // Base logging yield

        // Fishing - Slower, less reliable, but high crit/rare
        fishingSpeed: 8000,             // Base 8 seconds per fish
        fishingPower: 1,                // Base fishing yield

        // Hunting - Medium speed, high crit chance/damage
        huntingSpeed: 6000,             // Base 6 seconds per hunt
        huntingPower: 1,                // Base hunting yield

        // Foraging - Fast and reliable, lower crit bonus
        foragingSpeed: 4000,            // Base 4 seconds per forage
        foragingPower: 1,               // Base foraging yield

        // Thieving - Slow, unreliable, but very high crit and rare
        thievingSpeed: 7000,            // Base 7 seconds per pickpocket
        thievingPower: 1,               // Base thieving yield

        // ===== PRODUCTION STATS =====
        craftingSpeed: 5000,            // Base 5 seconds per craft
        cookingSpeed: 3000,             // Base 3 seconds per cook

        // ===== MULTIPLIERS =====
        dropRateMultiplier: 1.0,        // Base 1.0x drop rate
        experienceMultiplier: 1.0,      // Base 1.0x XP gain

        // ===== HARVESTING SUCCESS CHANCES =====
        miningChance: 100,              // Base 100% mining success
        woodcuttingChance: 100,         // Base 100% woodcutting success
        loggingChance: 100,             // Base 100% logging success (same as woodcutting)
        fishingChance: 80,              // Base 80% fishing success (less reliable)
        huntingChance: 85,              // Base 85% hunting success
        foragingChance: 90,             // Base 90% foraging success
        thievingChance: 70,             // Base 70% thieving success (lowest)

        // ===== HARVESTING CRIT CHANCES =====
        miningCritChance: 15,           // Base 15% mining crit
        woodcuttingCritChance: 15,      // Base 15% woodcutting crit
        loggingCritChance: 15,          // Base 15% logging crit (same as woodcutting)
        fishingCritChance: 20,          // Base 20% fishing crit (higher)
        huntingCritChance: 25,          // Base 25% hunting crit (highest)
        foragingCritChance: 10,         // Base 10% foraging crit (lower)
        thievingCritChance: 30,         // Base 30% thieving crit (very high)

        // ===== HARVESTING RARE CHANCES =====
        miningRareChance: 2,            // Base 2% rare ore
        woodcuttingRareChance: 2,       // Base 2% rare wood
        loggingRareChance: 2,           // Base 2% rare wood (same as woodcutting)
        fishingRareChance: 5,           // Base 5% rare fish (higher)
        huntingRareChance: 1,           // Base 1% rare drops (low but huge multiplier)
        foragingRareChance: 3,          // Base 3% rare finds
        thievingRareChance: 10,         // Base 10% rare loot (highest)

        // ===== HARVESTING CRIT MULTIPLIERS =====
        miningCritMultiplier: 2.0,      // 2x yield on crit
        woodcuttingCritMultiplier: 2.0, // 2x yield on crit
        loggingCritMultiplier: 2.0,     // 2x yield on crit (same as woodcutting)
        fishingCritMultiplier: 2.5,     // 2.5x yield on crit (higher)
        huntingCritMultiplier: 3.0,     // 3x yield on crit (highest)
        foragingCritMultiplier: 1.5,    // 1.5x yield on crit (lower)
        thievingCritMultiplier: 2.0,    // 2x loot on crit

        // ===== HARVESTING RARE MULTIPLIERS =====
        miningRareMultiplier: 2.0,      // 2x quantity for rare items
        woodcuttingRareMultiplier: 2.0, // 2x quantity for rare items
        loggingRareMultiplier: 2.0,     // 2x quantity for rare items (same as woodcutting)
        fishingRareMultiplier: 3.0,     // 3x quantity for rare items
        huntingRareMultiplier: 5.0,     // 5x quantity for rare items (huge!)
        foragingRareMultiplier: 2.0,    // 2x quantity for rare items
        thievingRareMultiplier: 2.0,    // 2x quantity for rare items

        // ===== NODE DEFENSIVE STATS (TIER 1 BASE) =====
        // These are base values for tier 1 nodes. Higher tiers scale by 1.2x per tier.
        nodeResistance: 1000,           // Base 1 second added to harvest time
        nodeEvasion: 5,                 // Base 5% dodge/evasion (reduces hit chance)
        nodeCritEvasion: 2,             // Base 2% crit evasion (reduces crit chance)
        nodeCritResistance: 0.2,        // Base 0.2x crit resistance (reduces crit multiplier)
        nodeRareEvasion: 0.5,           // Base 0.5% rare evasion (reduces rare chance)
        nodeRareResistance: 0.5,        // Base 0.5x rare resistance (reduces rare multiplier)
    },

    /**
     * Main calculation function
     * DO NOT MODIFY LAYER ORDER - It's the foundation of the system
     *
     * @param {string} statName - Name of the stat to calculate
     * @param {object} context - Context object containing all game state
     * @returns {object} Detailed stat calculation result
     */
    calculateStat(statName, context = {}) {
        // Validate stat exists
        const baseValue = this.baseGameValues[statName];
        if (baseValue === undefined) {
            console.warn(`[StatCalculator] Unknown stat: ${statName}`);
            return this.getErrorResult(statName);
        }

        // Calculate all layers
        const layers = this.calculateAllLayers(statName, context);

        // Apply layers based on stat type
        const finalValue = this.applyLayers(statName, layers);

        // Build detailed breakdown for UI/debugging
        const breakdown = this.buildBreakdown(statName, layers, finalValue);

        return {
            final: finalValue,
            formatted: this.formatStatValue(statName, finalValue),
            breakdown: breakdown,
            layers: layers,
            capped: this.isStatCapped(statName, finalValue),

            // Utility methods for easy comparison
            isImprovedBy: (amount) => this.calculateImprovement(statName, finalValue, amount),
            meetsRequirement: (required) => this.meetsRequirement(statName, finalValue, required)
        };
    },

    /**
     * Calculate all layer values
     * CRITICAL: This is where the 5-layer architecture is enforced
     *
     * When extending the system (e.g., adding a "Blessing" layer), add it here
     * between Perks and Build layers
     */
    calculateAllLayers(statName, context) {
        return {
            base: this.baseGameValues[statName],
            attributes: this.calculateAttributeLayer(statName, context),
            equipment: this.calculateEquipmentLayer(statName, context),
            perks: this.calculatePerkLayer(statName, context),
            build: this.calculateBuildLayer(statName, context)
        };
    },

    /**
     * LAYER 2: Calculate attribute contributions
     * Attributes provide both additive and multiplicative bonuses
     */
    calculateAttributeLayer(statName, context) {
        const attributes = context.combatAttributes || context.attributes || {};
        const attrConfig = this.getAttributeConfig();

        let additive = 0;
        let multiplicative = 0;
        let details = [];

        // Map stats to their relevant attributes
        const statToAttributes = {
            // Combat stats
            'attackDamage': [
                { attr: 'strength', perPoint: 2, type: 'additive', label: 'STR' }
            ],
            'maxHealth': [
                { attr: 'health', perPoint: 50, type: 'additive', label: 'HP' }
            ],
            'healthRegen': [
                { attr: 'health', perPoint: 0.1, type: 'additive', label: 'HP' }
            ],
            'accuracy': [
                { attr: 'perception', perPoint: 0.5, type: 'additive', label: 'PER' }
            ],
            'evasion': [
                { attr: 'mobility', perPoint: 0.5, type: 'additive', label: 'MOB' }
            ],
            'criticalChance': [
                { attr: 'perception', perPoint: 0.3, type: 'additive', label: 'PER' }
            ],
            'criticalDamage': [
                { attr: 'strength', perPoint: 0.01, type: 'additive', label: 'STR' }
            ],
            'damageReduction': [
                { attr: 'defense', perPoint: 0.02, type: 'additive', label: 'DEF' }
            ],
            'attackSpeed': [
                { attr: 'mobility', perPoint: 0.02, type: 'speed_reduction', label: 'MOB' }
            ],

            // Gathering stats - Speed (Primary Attributes)
            'miningSpeed': [
                { attr: 'strength', perPoint: 0.015, type: 'speed_reduction', label: 'STR' }
            ],
            'woodcuttingSpeed': [
                { attr: 'strength', perPoint: 0.015, type: 'speed_reduction', label: 'STR' }
            ],
            'fishingSpeed': [
                { attr: 'perception', perPoint: 0.015, type: 'speed_reduction', label: 'PER' }
            ],
            'huntingSpeed': [
                { attr: 'mobility', perPoint: 0.015, type: 'speed_reduction', label: 'MOB' }
            ],
            'foragingSpeed': [
                { attr: 'mobility', perPoint: 0.015, type: 'speed_reduction', label: 'MOB' }
            ],
            'thievingSpeed': [
                { attr: 'stealth', perPoint: 0.015, type: 'speed_reduction', label: 'STL' }
            ],

            // Gathering stats - Power (Primary Attributes)
            'miningPower': [
                { attr: 'strength', perPoint: 0.05, type: 'additive', label: 'STR' }
            ],
            'woodcuttingPower': [
                { attr: 'strength', perPoint: 0.05, type: 'additive', label: 'STR' }
            ],
            'fishingPower': [
                { attr: 'perception', perPoint: 0.05, type: 'additive', label: 'PER' }
            ],
            'huntingPower': [
                { attr: 'mobility', perPoint: 0.05, type: 'additive', label: 'MOB' }
            ],
            'foragingPower': [
                { attr: 'mobility', perPoint: 0.05, type: 'additive', label: 'MOB' }
            ],
            'thievingPower': [
                { attr: 'stealth', perPoint: 0.05, type: 'additive', label: 'STL' }
            ],

            // Harvesting success chances (Primary Attributes)
            'miningChance': [
                { attr: 'strength', perPoint: 0.3, type: 'additive', label: 'STR' }
            ],
            'woodcuttingChance': [
                { attr: 'strength', perPoint: 0.3, type: 'additive', label: 'STR' }
            ],
            'fishingChance': [
                { attr: 'perception', perPoint: 0.3, type: 'additive', label: 'PER' }
            ],
            'huntingChance': [
                { attr: 'mobility', perPoint: 0.3, type: 'additive', label: 'MOB' }
            ],
            'foragingChance': [
                { attr: 'mobility', perPoint: 0.3, type: 'additive', label: 'MOB' }
            ],
            'thievingChance': [
                { attr: 'stealth', perPoint: 0.3, type: 'additive', label: 'STL' }
            ],

            // Harvesting crit chances (Secondary Attributes)
            'miningCritChance': [
                { attr: 'intellect', perPoint: 1.0, type: 'additive', label: 'INT' }
            ],
            'woodcuttingCritChance': [
                { attr: 'perception', perPoint: 1.0, type: 'additive', label: 'PER' }
            ],
            'fishingCritChance': [
                { attr: 'stealth', perPoint: 1.0, type: 'additive', label: 'STL' }
            ],
            'huntingCritChance': [
                { attr: 'stealth', perPoint: 1.0, type: 'additive', label: 'STL' }
            ],
            'foragingCritChance': [
                { attr: 'intellect', perPoint: 1.0, type: 'additive', label: 'INT' }
            ],
            'thievingCritChance': [
                { attr: 'intellect', perPoint: 1.0, type: 'additive', label: 'INT' }
            ],

            // Harvesting rare chances (Secondary Attributes - same as crit)
            'miningRareChance': [
                { attr: 'intellect', perPoint: 0.1, type: 'additive', label: 'INT' }
            ],
            'woodcuttingRareChance': [
                { attr: 'perception', perPoint: 0.1, type: 'additive', label: 'PER' }
            ],
            'fishingRareChance': [
                { attr: 'stealth', perPoint: 0.1, type: 'additive', label: 'STL' }
            ],
            'huntingRareChance': [
                { attr: 'stealth', perPoint: 0.1, type: 'additive', label: 'STL' }
            ],
            'foragingRareChance': [
                { attr: 'intellect', perPoint: 0.1, type: 'additive', label: 'INT' }
            ],
            'thievingRareChance': [
                { attr: 'intellect', perPoint: 0.1, type: 'additive', label: 'INT' }
            ],

            // Harvesting crit multipliers (Primary Attributes)
            'miningCritMultiplier': [
                { attr: 'strength', perPoint: 0.01, type: 'additive', label: 'STR' }
            ],
            'woodcuttingCritMultiplier': [
                { attr: 'strength', perPoint: 0.01, type: 'additive', label: 'STR' }
            ],
            'fishingCritMultiplier': [
                { attr: 'perception', perPoint: 0.01, type: 'additive', label: 'PER' }
            ],
            'huntingCritMultiplier': [
                { attr: 'mobility', perPoint: 0.01, type: 'additive', label: 'MOB' }
            ],
            'foragingCritMultiplier': [
                { attr: 'mobility', perPoint: 0.01, type: 'additive', label: 'MOB' }
            ],
            'thievingCritMultiplier': [
                { attr: 'stealth', perPoint: 0.01, type: 'additive', label: 'STL' }
            ],

            // Harvesting rare multipliers (Primary Attributes)
            'miningRareMultiplier': [
                { attr: 'strength', perPoint: 0.01, type: 'additive', label: 'STR' }
            ],
            'woodcuttingRareMultiplier': [
                { attr: 'strength', perPoint: 0.01, type: 'additive', label: 'STR' }
            ],
            'fishingRareMultiplier': [
                { attr: 'perception', perPoint: 0.01, type: 'additive', label: 'PER' }
            ],
            'huntingRareMultiplier': [
                { attr: 'mobility', perPoint: 0.01, type: 'additive', label: 'MOB' }
            ],
            'foragingRareMultiplier': [
                { attr: 'mobility', perPoint: 0.01, type: 'additive', label: 'MOB' }
            ],
            'thievingRareMultiplier': [
                { attr: 'stealth', perPoint: 0.01, type: 'additive', label: 'STL' }
            ],
        };

        const attributeRules = statToAttributes[statName] || [];

        attributeRules.forEach(rule => {
            const attrValue = attributes[rule.attr] || 0;
            const contribution = attrValue * rule.perPoint;

            if (rule.type === 'additive') {
                additive += contribution;
                details.push(`${rule.label}: +${contribution.toFixed(2)}`);
            } else if (rule.type === 'speed_reduction') {
                multiplicative += contribution;
                details.push(`${rule.label}: -${(contribution * 100).toFixed(1)}%`);
            }
        });

        return {
            additive: additive,
            multiplicative: multiplicative,
            details: details
        };
    },

    /**
     * LAYER 3: Calculate equipment contributions
     * Equipment provides direct stat bonuses from equipped items
     */
    calculateEquipmentLayer(statName, context) {
        const equipment = context.equipment || {};
        const definitions = context.definitions || (typeof GameEngine !== 'undefined' ? GameEngine.definitions : {});

        let additive = 0;
        let multiplicative = 0;
        let details = [];

        // Map stat names to equipment property names
        const statToEquipmentProperty = {
            'attackDamage': ['damage', 'attackDamage'],
            'attackSpeed': ['attackInterval', 'attackSpeed'],
            'maxHealth': ['healthBonus', 'maxHealth'],
            'healthRegen': ['healthRegen', 'hpRegen'],
            'accuracy': ['hitChance', 'accuracy'],
            'evasion': ['evasion', 'evasionRating'],
            'criticalChance': ['critChance', 'criticalChance'],
            'criticalDamage': ['critImpact', 'criticalDamage'],
            'damageReduction': ['damageReduction', 'defense'],
            'blockChance': ['blockChance'],
            'reloadSpeed': ['reloadTime'],
        };

        const propertyNames = statToEquipmentProperty[statName] || [];

        // Iterate through all equipped items
        Object.entries(equipment).forEach(([slot, itemId]) => {
            if (!itemId) return;

            // Find item definition
            const item = definitions.comprehensiveItems?.[itemId] ||
                        definitions.items?.[itemId];

            if (!item) return;

            // Check combatStats first (old format)
            const stats = item.combatStats || item.stats || {};

            // Check each possible property name
            propertyNames.forEach(propName => {
                if (stats[propName] !== undefined) {
                    const value = stats[propName];

                    // Determine if this is additive or multiplicative
                    if (statName.includes('Speed') && propName === 'attackInterval') {
                        // Attack interval is additive to base speed
                        additive += value;
                        details.push(`${item.name}: +${value}ms`);
                    } else {
                        additive += value;
                        details.push(`${item.name}: +${value}`);
                    }
                }
            });
        });

        return {
            additive: additive,
            multiplicative: multiplicative,
            details: details
        };
    },

    /**
     * LAYER 4: Calculate perk grid contributions
     * Perks provide multiplicative bonuses from the perk grid system
     * Uses the new row/column multiplication system
     */
    calculatePerkLayer(statName, context) {
        let additive = 0;
        let multiplicative = 0;
        let details = [];

        // Get full grid calculations from the new perk system
        // Try to get from context first, or calculate if needed
        let gridCalc = context.gridCalc;

        if (!gridCalc && typeof PerkGridSystem !== 'undefined') {
            // Calculate grid perks if not provided
            const state = context.state || (typeof GameEngine !== 'undefined' ? GameEngine.state : null);
            if (state) {
                gridCalc = PerkGridSystem.calculateGridPerks.call({ state, definitions: context.definitions }, state);
            }
        }

        if (gridCalc && gridCalc.perks) {
            // Find the perk value for this stat
            // Perk values are already in percentage form (0-100)
            const perkValue = gridCalc.perks[statName] || 0;

            if (perkValue > 0) {
                // Convert percentage to multiplier (percentage / 100)
                multiplicative += perkValue / 100;
                details.push(`Perk Grid: +${perkValue.toFixed(2)}%`);
            }
        }

        // Legacy compatibility - check for old gridBonuses format
        const gridBonuses = context.gridBonuses || {};
        const statToPerkProperty = {
            'attackDamage': ['damage', 'str'],
            'maxHealth': ['maxHp', 'con'],
            'criticalChance': ['critChance'],
            'miningSpeed': ['miningSpeed'],
            'woodcuttingSpeed': ['woodcuttingSpeed'],
            'fishingSpeed': ['fishingSpeed'],
        };

        const perkProperties = statToPerkProperty[statName] || [];
        perkProperties.forEach(prop => {
            if (gridBonuses[prop] !== undefined && gridBonuses[prop] !== 0 && !gridCalc) {
                // Only use legacy bonuses if new system didn't provide values
                multiplicative += gridBonuses[prop] / 100;
                details.push(`Perks (legacy): +${gridBonuses[prop]}%`);
            }
        });

        return {
            additive: additive,
            multiplicative: multiplicative,
            details: details
        };
    },

    /**
     * LAYER 5: Calculate build contributions
     * Build includes: skills, stance, consumables, temporary buffs
     */
    calculateBuildLayer(statName, context) {
        let additive = 0;
        let multiplicative = 0;
        let details = [];

        // === STANCE MODIFIERS ===
        const stance = context.stance || 'offensive';
        const stanceModifiers = this.getStanceModifiers(stance, statName);

        if (stanceModifiers.additive) {
            additive += stanceModifiers.additive;
            details.push(`Stance: +${stanceModifiers.additive}`);
        }
        if (stanceModifiers.multiplicative) {
            multiplicative += stanceModifiers.multiplicative;
            details.push(`Stance: ${(stanceModifiers.multiplicative * 100).toFixed(0)}%`);
        }

        // === CONSUMABLE BUFFS ===
        const activeConsumables = context.activeConsumables || [];
        activeConsumables.forEach(buff => {
            if (buff.stat === statName) {
                if (buff.type === 'additive') {
                    additive += buff.amount;
                    details.push(`${buff.name}: +${buff.amount}`);
                } else if (buff.type === 'multiplicative') {
                    multiplicative += buff.amount;
                    details.push(`${buff.name}: ${(buff.amount * 100).toFixed(0)}%`);
                }
            }
        });

        // === SKILL BONUSES ===
        const skills = context.skills || {};
        const skillModifiers = this.getSkillModifiers(skills, statName);

        if (skillModifiers.additive) {
            additive += skillModifiers.additive;
            details.push(`Skills: +${skillModifiers.additive}`);
        }
        if (skillModifiers.multiplicative) {
            multiplicative += skillModifiers.multiplicative;
            details.push(`Skills: ${(skillModifiers.multiplicative * 100).toFixed(0)}%`);
        }

        return {
            additive: additive,
            multiplicative: multiplicative,
            details: details
        };
    },

    /**
     * Apply all layers to calculate final stat value
     * Different stat types use different calculation methods
     */
    applyLayers(statName, layers) {
        const statType = this.statConfig.statTypes[statName];
        const calculationType = this.statConfig.calculationTypes[statType];

        const base = layers.base;
        const attr = layers.attributes;
        const equip = layers.equipment;
        const perks = layers.perks;
        const build = layers.build;

        let finalValue = base;

        switch (calculationType) {
            case 'multiplicative_reduction':
                // Speed stats: base * (1 - reductions) / (1 + multipliers)
                // Lower is better, so reductions decrease the value
                let totalReduction =
                    attr.multiplicative +
                    equip.multiplicative +
                    perks.multiplicative +
                    build.multiplicative;

                let totalAdditive =
                    attr.additive +
                    equip.additive +
                    perks.additive +
                    build.additive;

                // Apply additive first (for attack intervals from weapons)
                finalValue = base + totalAdditive;

                // Then apply reduction multipliers
                finalValue = finalValue * (1 - Math.min(0.95, totalReduction));
                break;

            case 'additive_then_multiplicative':
                // Power stats: (base + additive) * (1 + multipliers)
                let powerAdditive =
                    attr.additive +
                    equip.additive +
                    perks.additive +
                    build.additive;

                let powerMultiplier = 1 +
                    attr.multiplicative +
                    equip.multiplicative +
                    perks.multiplicative +
                    build.multiplicative;

                finalValue = (base + powerAdditive) * powerMultiplier;
                break;

            case 'additive_capped':
                // Percentage stats: base + all additive, then cap
                let percentAdditive =
                    attr.additive +
                    equip.additive +
                    perks.additive +
                    build.additive;

                finalValue = base + percentAdditive;

                // Apply cap if it exists
                const cap = this.statConfig.statCaps[statName];
                if (cap !== undefined) {
                    finalValue = Math.min(finalValue, cap);
                }
                break;

            case 'pure_multiplicative':
                // Multiplier stats: base * all layers
                let allMultipliers =
                    (1 + attr.multiplicative) *
                    (1 + equip.multiplicative) *
                    (1 + perks.multiplicative) *
                    (1 + build.multiplicative);

                finalValue = base * allMultipliers;
                break;

            default:
                console.warn(`[StatCalculator] Unknown calculation type: ${calculationType}`);
        }

        // Ensure non-negative values
        return Math.max(0, finalValue);
    },

    /**
     * Build a detailed breakdown of the calculation for UI display
     */
    buildBreakdown(statName, layers, finalValue) {
        const breakdown = {
            statName: statName,
            final: {
                value: finalValue,
                formatted: this.formatStatValue(statName, finalValue)
            },
            layers: [
                {
                    type: 'base',
                    name: 'Base Game Value',
                    value: layers.base,
                    display: this.formatStatValue(statName, layers.base),
                    details: 'Core balance value'
                }
            ]
        };

        // Add attribute layer if it contributes
        if (layers.attributes.additive !== 0 || layers.attributes.multiplicative !== 0) {
            breakdown.layers.push({
                type: 'attributes',
                name: 'Character Attributes',
                additive: layers.attributes.additive,
                multiplicative: layers.attributes.multiplicative,
                display: this.formatLayerContribution(layers.attributes),
                details: layers.attributes.details.join(', ')
            });
        }

        // Add equipment layer if it contributes
        if (layers.equipment.additive !== 0 || layers.equipment.multiplicative !== 0) {
            breakdown.layers.push({
                type: 'equipment',
                name: 'Equipment',
                additive: layers.equipment.additive,
                multiplicative: layers.equipment.multiplicative,
                display: this.formatLayerContribution(layers.equipment),
                details: layers.equipment.details.join(', ')
            });
        }

        // Add perk layer if it contributes
        if (layers.perks.additive !== 0 || layers.perks.multiplicative !== 0) {
            breakdown.layers.push({
                type: 'perks',
                name: 'Perk Grid',
                additive: layers.perks.additive,
                multiplicative: layers.perks.multiplicative,
                display: this.formatLayerContribution(layers.perks),
                details: layers.perks.details.join(', ')
            });
        }

        // Add build layer if it contributes
        if (layers.build.additive !== 0 || layers.build.multiplicative !== 0) {
            breakdown.layers.push({
                type: 'build',
                name: 'Build (Skills/Stance/Buffs)',
                additive: layers.build.additive,
                multiplicative: layers.build.multiplicative,
                display: this.formatLayerContribution(layers.build),
                details: layers.build.details.join(', ')
            });
        }

        return breakdown;
    },

    /**
     * Format layer contribution for display
     */
    formatLayerContribution(layer) {
        const parts = [];

        if (layer.additive !== 0) {
            parts.push(`${layer.additive >= 0 ? '+' : ''}${layer.additive.toFixed(1)}`);
        }

        if (layer.multiplicative !== 0) {
            const percent = layer.multiplicative * 100;
            parts.push(`${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`);
        }

        return parts.join(' & ') || '0';
    },

    /**
     * Get stance modifiers for a specific stat
     */
    getStanceModifiers(stance, statName) {
        const stanceEffects = {
            'offensive': {
                'attackDamage': { multiplicative: 0.10 },  // +10% damage
                'damageReduction': { multiplicative: -0.10 } // -10% defense
            },
            'defensive': {
                'damageReduction': { multiplicative: 0.15 }, // +15% defense
                'attackDamage': { multiplicative: -0.10 }     // -10% damage
            },
            'balanced': {
                // No modifiers - baseline
            }
        };

        return stanceEffects[stance]?.[statName] || {};
    },

    /**
     * Get skill modifiers for a specific stat
     */
    getSkillModifiers(skills, statName) {
        const modifiers = {
            additive: 0,
            multiplicative: 0
        };

        // Combat damage is determined by attributes and equipment only
        // No combat skill level bonus

        // Mining skill provides speed bonus
        if (statName === 'miningSpeed' && skills.mining) {
            const miningLevel = skills.mining.level || 1;
            modifiers.multiplicative += miningLevel * 0.01; // +1% speed per level
        }

        // Woodcutting skill provides speed bonus
        if (statName === 'woodcuttingSpeed' && skills.woodcutting) {
            const woodcuttingLevel = skills.woodcutting.level || 1;
            modifiers.multiplicative += woodcuttingLevel * 0.01;
        }

        // Fishing skill provides speed bonus
        if (statName === 'fishingSpeed' && skills.fishing) {
            const fishingLevel = skills.fishing.level || 1;
            modifiers.multiplicative += fishingLevel * 0.01;
        }

        return modifiers;
    },

    /**
     * Get attribute configuration
     */
    getAttributeConfig() {
        return {
            'strength': { name: 'Strength', abbr: 'STR' },
            'perception': { name: 'Perception', abbr: 'PER' },
            'mobility': { name: 'Mobility', abbr: 'MOB' },
            'health': { name: 'Health', abbr: 'HP' },
            'defense': { name: 'Defense', abbr: 'DEF' },
            'intelligence': { name: 'Intelligence', abbr: 'INT' },
            'stealth': { name: 'Stealth', abbr: 'STL' }
        };
    },

    /**
     * Format stat value for display
     */
    formatStatValue(statName, value) {
        const formatter = this.statConfig.statFormats[statName];
        if (formatter) {
            return formatter(value);
        }
        return value.toFixed(2);
    },

    /**
     * Check if a stat is at its cap
     */
    isStatCapped(statName, value) {
        const cap = this.statConfig.statCaps[statName];
        if (cap === undefined) return false;
        return value >= cap;
    },

    /**
     * Calculate improvement from adding a bonus
     */
    calculateImprovement(statName, currentValue, bonusAmount) {
        // This would recalculate with the bonus added
        // Useful for showing "what if" scenarios in UI
        const improvement = bonusAmount;
        const percentImprovement = (bonusAmount / currentValue) * 100;

        return {
            absolute: improvement,
            percent: percentImprovement,
            isPositive: improvement > 0
        };
    },

    /**
     * Check if stat meets a requirement
     */
    meetsRequirement(statName, value, required) {
        const statType = this.statConfig.statTypes[statName];
        const calculationType = this.statConfig.calculationTypes[statType];

        // For speed stats, lower is better
        if (calculationType === 'multiplicative_reduction') {
            return value <= required;
        }

        // For everything else, higher is better
        return value >= required;
    },

    /**
     * Get error result for unknown stat
     */
    getErrorResult(statName) {
        return {
            final: 0,
            formatted: 'ERROR',
            breakdown: {
                statName: statName,
                final: { value: 0, formatted: 'ERROR' },
                layers: [{
                    type: 'error',
                    name: 'Unknown Stat',
                    display: 'Stat not found in baseGameValues',
                    details: `The stat "${statName}" is not defined in the StatCalculator.`
                }]
            },
            layers: {},
            capped: false,
            isImprovedBy: () => ({ absolute: 0, percent: 0, isPositive: false }),
            meetsRequirement: () => false
        };
    },

    /**
     * =========================================================================
     * HARVEST VS NODE MECHANICS
     * =========================================================================
     */

    /**
     * Get node defensive stats by tier
     * @param {number} tier - The node tier (1, 2, 3, etc.)
     * @returns {object} Node defensive stats (resistance, evasion, critEvasion, etc.)
     */
    getNodeDefensiveStatsByTier(tier = 1) {
        // Get base stats from baseGameValues
        const baseStats = {
            resistance: this.baseGameValues.nodeResistance,
            evasion: this.baseGameValues.nodeEvasion,
            critEvasion: this.baseGameValues.nodeCritEvasion,
            critResistance: this.baseGameValues.nodeCritResistance,
            rareEvasion: this.baseGameValues.nodeRareEvasion,
            rareResistance: this.baseGameValues.nodeRareResistance
        };

        // Scale by tier (each tier adds 20% more difficulty)
        const tierMultiplier = Math.pow(1.2, tier - 1);

        const result = {
            resistance: Math.floor(baseStats.resistance * tierMultiplier),
            evasion: Math.round(baseStats.evasion * tierMultiplier * 10) / 10, // Round to 1 decimal
            critEvasion: Math.round(baseStats.critEvasion * tierMultiplier * 10) / 10,
            critResistance: Math.round(baseStats.critResistance * tierMultiplier * 100) / 100, // Round to 2 decimals
            rareEvasion: Math.round(baseStats.rareEvasion * tierMultiplier * 10) / 10,
            rareResistance: Math.round(baseStats.rareResistance * tierMultiplier * 100) / 100
        };

        console.log(`[StatCalculator] Node defensive stats for tier ${tier}:`, result);
        return result;
    },

    /**
     * Calculate harvest stats versus node defensive stats
     * @param {string} skill - The skill name (e.g., 'mining', 'woodcutting')
     * @param {string} nodeId - The node ID from definitions
     * @param {object} context - Optional context (if not provided, will build from GameEngine)
     * @returns {object} Complete breakdown of player stats, node stats, and effective results
     */
    calculateHarvestVsNode(skill, nodeId, context = null) {
        // Build context if not provided
        if (!context && typeof GameEngine !== 'undefined') {
            context = GameEngine.buildStatContext();
        } else if (!context) {
            context = {};
        }

        // Get player's harvest stats for this skill
        const speedResult = this.calculateStat(`${skill}Speed`, context);
        const chanceResult = this.calculateStat(`${skill}Chance`, context);
        const critChanceResult = this.calculateStat(`${skill}CritChance`, context);
        const critMultiplierResult = this.calculateStat(`${skill}CritMultiplier`, context);
        const rareChanceResult = this.calculateStat(`${skill}RareChance`, context);
        const rareMultiplierResult = this.calculateStat(`${skill}RareMultiplier`, context);

        // Debug logging
        console.log(`[StatCalculator] Harvest stats for ${skill}:`, {
            speed: speedResult.final,
            chance: chanceResult.final,
            critChance: critChanceResult.final,
            critMultiplier: critMultiplierResult.final,
            rareChance: rareChanceResult.final,
            rareMultiplier: rareMultiplierResult.final
        });

        const playerStats = {
            speed: speedResult.final,
            chance: chanceResult.final,
            critChance: critChanceResult.final,
            critMultiplier: critMultiplierResult.final,
            rareChance: rareChanceResult.final,
            rareMultiplier: rareMultiplierResult.final
        };

        // Get node's defensive stats
        let nodeStats = { resistance: 0, evasion: 0, critEvasion: 0, critResistance: 0, rareEvasion: 0, rareResistance: 0 };
        if (typeof GameEngine !== 'undefined' && GameEngine.getNodeDefensiveStats) {
            nodeStats = GameEngine.getNodeDefensiveStats(nodeId);
        }

        // Calculate effective values (player stats minus node defenses)
        const effective = {
            speed: playerStats.speed + nodeStats.resistance, // Speed: higher is worse (adds time)
            chance: Math.max(5, playerStats.chance - nodeStats.evasion), // Min 5% chance
            critChance: Math.max(0, playerStats.critChance - nodeStats.critEvasion),
            critMultiplier: Math.max(1, playerStats.critMultiplier - nodeStats.critResistance),
            rareChance: Math.max(0, playerStats.rareChance - nodeStats.rareEvasion),
            rareMultiplier: Math.max(1, playerStats.rareMultiplier - nodeStats.rareResistance)
        };

        // Generate summary message
        const summary = this.generateHarvestSummary(skill, playerStats, nodeStats, effective);

        return {
            skill: skill,
            nodeId: nodeId,
            player: playerStats,
            node: nodeStats,
            effective: effective,
            summary: summary
        };
    },

    /**
     * Generate a human-readable summary of harvest effectiveness
     */
    generateHarvestSummary(skill, playerStats, nodeStats, effective) {
        let messages = [];

        // Speed assessment
        if (effective.speed < 5000) {
            messages.push('⚡ Very fast harvesting!');
        } else if (effective.speed > 10000) {
            messages.push('🐌 Slow harvesting - upgrade your gear!');
        }

        // Chance assessment
        if (effective.chance < 50) {
            messages.push('⚠️ Low success chance - many attempts will miss!');
        } else if (effective.chance >= 95) {
            messages.push('✓ Excellent success rate!');
        }

        // Crit assessment
        if (effective.critChance >= 30) {
            messages.push('💥 High critical chance!');
        } else if (effective.critChance < 5) {
            messages.push('Critical hits are rare');
        }

        // Rare assessment
        if (effective.rareChance >= 5) {
            messages.push('✨ Good chance for rare drops!');
        }

        if (messages.length === 0) {
            messages.push('Moderate harvesting effectiveness');
        }

        return messages.join(' • ');
    },

    /**
     * =========================================================================
     * TESTING AND VALIDATION
     * =========================================================================
     */
    testing: {
        /**
         * Validate that calculations match expected values
         * RUN THIS AFTER ANY FORMULA CHANGES
         */
        validateCalculations() {
            console.log('[StatCalculator] Running validation tests...');

            const testCases = [
                {
                    name: 'Base attack damage with no modifiers',
                    stat: 'attackDamage',
                    context: {},
                    expected: 10,
                    tolerance: 0.1
                },
                {
                    name: 'Attack damage with 5 strength',
                    stat: 'attackDamage',
                    context: {
                        combatAttributes: { strength: 5 }
                    },
                    expected: 20, // Base 10 + (5 * 2)
                    tolerance: 0.1
                },
                {
                    name: 'Max health with 10 health attribute',
                    stat: 'maxHealth',
                    context: {
                        combatAttributes: { health: 10 }
                    },
                    expected: 1000, // Base 500 + (10 * 50)
                    tolerance: 0.1
                },
                {
                    name: 'Accuracy with 10 perception',
                    stat: 'accuracy',
                    context: {
                        combatAttributes: { perception: 10 }
                    },
                    expected: 80, // Base 75 + (10 * 0.5)
                    tolerance: 0.1
                }
            ];

            const results = testCases.map(test => {
                const calc = StatCalculator.calculateStat(test.stat, test.context);
                const passed = Math.abs(calc.final - test.expected) <= test.tolerance;

                return {
                    name: test.name,
                    stat: test.stat,
                    expected: test.expected,
                    actual: calc.final,
                    passed: passed,
                    diff: calc.final - test.expected
                };
            });

            console.table(results);

            const allPassed = results.every(r => r.passed);
            if (allPassed) {
                console.log('✅ All validation tests passed!');
            } else {
                console.error('❌ Some validation tests failed!');
            }

            return allPassed;
        },

        /**
         * Test all base stats can be calculated
         */
        testAllStats() {
            console.log('[StatCalculator] Testing all stats...');

            const results = [];
            for (let statName in StatCalculator.baseGameValues) {
                const calc = StatCalculator.calculateStat(statName, {});
                results.push({
                    stat: statName,
                    baseValue: StatCalculator.baseGameValues[statName],
                    calculated: calc.final,
                    formatted: calc.formatted,
                    success: calc.final !== undefined
                });
            }

            console.table(results);
            return results;
        },

        /**
         * Compare with old system (for migration)
         */
        compareWithOldSystem(oldStatFunction) {
            console.log('[StatCalculator] Comparing with old system...');

            const statNames = ['attackDamage', 'attackSpeed', 'accuracy', 'maxHealth'];
            const comparison = [];

            statNames.forEach(stat => {
                const newResult = StatCalculator.calculateStat(stat, {});
                const oldValue = oldStatFunction ? oldStatFunction(stat) : 'N/A';

                comparison.push({
                    stat: stat,
                    old: oldValue,
                    new: newResult.final,
                    diff: typeof oldValue === 'number' ? newResult.final - oldValue : 'N/A'
                });
            });

            console.table(comparison);
            return comparison;
        },

        /**
         * Benchmark performance
         */
        benchmarkPerformance(iterations = 1000) {
            console.log(`[StatCalculator] Benchmarking with ${iterations} iterations...`);

            const statNames = Object.keys(StatCalculator.baseGameValues);
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                statNames.forEach(stat => {
                    StatCalculator.calculateStat(stat, {
                        combatAttributes: { strength: 10, perception: 10, mobility: 10 },
                        equipment: {},
                        perkGrid: {},
                        stance: 'offensive'
                    });
                });
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;
            const avgTime = totalTime / iterations / statNames.length;

            console.log(`Total time: ${totalTime.toFixed(2)}ms`);
            console.log(`Average time per stat: ${avgTime.toFixed(4)}ms`);
            console.log(`Calculations per second: ${(1000 / avgTime).toFixed(0)}`);

            return {
                totalTime,
                avgTime,
                calculationsPerSecond: 1000 / avgTime
            };
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatCalculator;
}
