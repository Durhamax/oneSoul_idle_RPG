/**
 * WORKSTATION REGISTRY
 *
 * Defines all crafting workstations and their tier-based benefits.
 * Engineering level gates access to higher workstation tiers.
 *
 * Key Design Decisions:
 * - Workstation tier does NOT gate recipes (skill level does)
 * - Engineering level gates workstation tier upgrades (tier * 10)
 * - Equipment stations: Rarity bonus, material savings, speed
 * - Consumable stations: Output multiplier, material savings, speed
 */

const WorkstationRegistry = {
    // Workstation definitions
    stations: {
        smithing: {
            id: 'smithing',
            name: 'Forge',
            type: 'equipment',
            icon: '🔥',
            description: 'Process raw ores into refined materials and metal components.'
        },
        mechanics: {
            id: 'mechanics',
            name: 'Workshop',
            type: 'equipment',
            icon: '⚙️',
            description: 'Manufacture weapons and precision mechanical components.'
        },
        electronics: {
            id: 'electronics',
            name: 'Tech Lab',
            type: 'equipment',
            icon: '🔌',
            description: 'Create circuits, processors, and high-tech components.'
        },
        tailoring: {
            id: 'tailoring',
            name: 'Loom',
            type: 'equipment',
            icon: '🧵',
            description: 'Craft armor, clothing, and textile-based equipment.'
        },
        chemistry: {
            id: 'chemistry',
            name: 'Laboratory',
            type: 'consumable',
            icon: '🧪',
            description: 'Create potions, explosives, and ammunition propellants.'
        },
        cooking: {
            id: 'cooking',
            name: 'Kitchen',
            type: 'consumable',
            icon: '🍳',
            description: 'Prepare food items and biological components.'
        }
    },

    // Maximum tier for workstations
    MAX_TIER: 10,

    // Valid skills (must match RecipeRegistry)
    validSkills: ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'],

    // ═══════════════════════════════════════════════════════════════
    // TIER BENEFITS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get tier benefits for a workstation
     * Engineering level gates access to higher tiers
     * @param {string} skill - The crafting skill
     * @param {number} tier - Current workstation tier (1-10)
     * @param {number} engineeringLevel - Player's engineering skill level
     * @returns {object|null} Benefits object or null if tier not accessible
     */
    getTierBenefits(skill, tier, engineeringLevel = 0) {
        // Validate inputs
        if (!this.validSkills.includes(skill)) {
            console.error(`[WorkstationRegistry] Invalid skill: ${skill}`);
            return null;
        }

        tier = Math.max(1, Math.min(tier, this.MAX_TIER));

        // Engineering level requirement: tier * 10
        // Tier 1: 0, Tier 2: 20, Tier 3: 30... Tier 10: 100
        const requiredEngineering = tier === 1 ? 0 : tier * 10;
        if (engineeringLevel < requiredEngineering) {
            return null; // Cannot use this tier
        }

        const station = this.stations[skill];

        if (station.type === 'equipment') {
            // Equipment workstations affect rarity
            return {
                type: 'equipment',
                tier: tier,
                rarityBonus: tier * 7.5,                    // +7.5% rarity per tier (up to +75%)
                materialSavingsChance: tier * 0.05,         // +5% per tier (up to 50%)
                craftSpeedMultiplier: 1 + (tier * 0.1),     // +10% speed per tier (up to 2.0x)
                queueSlots: Math.min(5, 1 + Math.floor(tier / 2)) // 1/1/2/2/3/3/4/4/5/5
            };
        } else {
            // Consumable workstations affect output quantity
            return {
                type: 'consumable',
                tier: tier,
                outputMultiplier: 1 + (tier * 0.4),         // 1.0x to 5.0x
                materialSavingsChance: tier * 0.05,         // +5% per tier (up to 50%)
                craftSpeedMultiplier: 1 + (tier * 0.1),     // +10% speed per tier (up to 2.0x)
                queueSlots: Math.min(5, 1 + Math.floor(tier / 2)) // 1/1/2/2/3/3/4/4/5/5
            };
        }
    },

    /**
     * Get special tier effects (tiers 5, 7, 10)
     * @param {string} skill - The crafting skill
     * @param {number} tier - Current workstation tier
     * @returns {object} Special effects for this tier
     */
    getSpecialEffects(skill, tier) {
        const station = this.stations[skill];
        const effects = {
            batchCraft: false,
            batchSize: 1,
            perfectCraftChance: 0,
            mythicChance: 0,
            bonusBatchChance: 0
        };

        if (station.type === 'equipment') {
            // Equipment station special effects
            if (tier >= 5) {
                effects.batchCraft = true;
                effects.batchSize = 2;
            }
            if (tier >= 7) {
                effects.batchSize = 3;
                effects.perfectCraftChance = 0.05; // 5% perfect craft chance
            }
            if (tier >= 10) {
                effects.batchSize = 5;
                effects.perfectCraftChance = 0.10; // 10% perfect craft chance
                effects.mythicChance = 0.05;        // 5% chance to upgrade to mythic
            }
        } else {
            // Consumable station special effects
            if (tier >= 5) {
                effects.bonusBatchChance = 0.15; // 15% chance for bonus batch
            }
            if (tier >= 7) {
                effects.bonusBatchChance = 0.25; // 25% chance for bonus batch
                effects.perfectCraftChance = 0.05; // 5% perfect (doesn't consume)
            }
            if (tier >= 10) {
                effects.bonusBatchChance = 0.40; // 40% chance for bonus batch
                effects.perfectCraftChance = 0.10; // 10% perfect craft
            }
        }

        return effects;
    },

    // ═══════════════════════════════════════════════════════════════
    // UPGRADE COSTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get upgrade cost for next tier
     * @param {number} currentTier - Current workstation tier (0-9)
     * @returns {object} Cost to upgrade to next tier
     */
    getUpgradeCost(currentTier) {
        const nextTier = currentTier + 1;

        if (nextTier > this.MAX_TIER) {
            return null; // Already at max tier
        }

        // Blueprint type by tier range
        let blueprintType;
        if (nextTier <= 3) {
            blueprintType = 'common';
        } else if (nextTier <= 7) {
            blueprintType = 'advanced';
        } else {
            blueprintType = 'masterwork';
        }

        return {
            blueprints: {
                type: blueprintType,
                quantity: nextTier * 5  // 5, 10, 15, 20, 25, 30, 35, 40, 45, 50
            },
            engineeringLevel: nextTier === 1 ? 0 : nextTier * 10,
            gold: nextTier * nextTier * 100  // 100, 400, 900, 1600... 10000
        };
    },

    /**
     * Check if player can upgrade workstation
     * @param {string} skill - The crafting skill
     * @param {object} playerState - Player state object
     * @returns {object} { canUpgrade: boolean, reason: string|null }
     */
    canUpgrade(skill, playerState) {
        if (!this.validSkills.includes(skill)) {
            return { canUpgrade: false, reason: `Invalid skill: ${skill}` };
        }

        const currentTier = playerState.workstations?.[skill]?.tier || 0;
        const cost = this.getUpgradeCost(currentTier);

        if (!cost) {
            return { canUpgrade: false, reason: 'Already at maximum tier' };
        }

        // Check engineering level
        const engineeringLevel = playerState.skills?.engineering?.level || 0;
        if (engineeringLevel < cost.engineeringLevel) {
            return {
                canUpgrade: false,
                reason: `Requires Engineering level ${cost.engineeringLevel} (current: ${engineeringLevel})`
            };
        }

        // Check blueprints
        const blueprints = playerState.blueprints?.[cost.blueprints.type] || 0;
        if (blueprints < cost.blueprints.quantity) {
            return {
                canUpgrade: false,
                reason: `Need ${cost.blueprints.quantity} ${cost.blueprints.type} blueprints (have: ${blueprints})`
            };
        }

        // Check gold
        const gold = playerState.resources?.gold || 0;
        if (gold < cost.gold) {
            return {
                canUpgrade: false,
                reason: `Need ${cost.gold} gold (have: ${gold})`
            };
        }

        return { canUpgrade: true, reason: null };
    },

    // ═══════════════════════════════════════════════════════════════
    // RETRIEVAL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get workstation definition
     * @param {string} skill - The crafting skill
     * @returns {object|null} Workstation definition
     */
    get(skill) {
        return this.stations[skill] || null;
    },

    /**
     * Get all workstations
     * @returns {object} All workstation definitions
     */
    getAll() {
        return { ...this.stations };
    },

    /**
     * Get workstations by type
     * @param {string} type - 'equipment' or 'consumable'
     * @returns {object} Filtered workstations
     */
    getByType(type) {
        return Object.entries(this.stations)
            .filter(([_, station]) => station.type === type)
            .reduce((acc, [id, station]) => {
                acc[id] = station;
                return acc;
            }, {});
    },

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get tier description for UI display
     * @param {number} tier - Workstation tier
     * @returns {string} Tier name
     */
    getTierName(tier) {
        const names = {
            1: 'Basic',
            2: 'Improved',
            3: 'Advanced',
            4: 'Expert',
            5: 'Master',
            6: 'Artisan',
            7: 'Legendary',
            8: 'Mythic',
            9: 'Divine',
            10: 'Transcendent'
        };
        return names[tier] || 'Unknown';
    },

    /**
     * Print workstation summary to console
     */
    printSummary() {
        console.log('\n=== WORKSTATION REGISTRY SUMMARY ===');
        console.log('Equipment Workstations:');
        for (const [id, station] of Object.entries(this.stations)) {
            if (station.type === 'equipment') {
                console.log(`  ${station.icon} ${station.name} (${id})`);
            }
        }
        console.log('Consumable Workstations:');
        for (const [id, station] of Object.entries(this.stations)) {
            if (station.type === 'consumable') {
                console.log(`  ${station.icon} ${station.name} (${id})`);
            }
        }
        console.log('=====================================\n');
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkstationRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.WorkstationRegistry = WorkstationRegistry;
}
