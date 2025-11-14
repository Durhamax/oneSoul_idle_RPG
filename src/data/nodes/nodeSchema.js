/**
 * NODE SCHEMA - COMPREHENSIVE RESOURCE NODE TEMPLATE
 *
 * Defines the complete structure for resource nodes in the game.
 * Supports unlimited tier scaling, skill-based progression, and biome distribution.
 */

const NODE_SCHEMA = {
    // === CORE IDENTITY (REQUIRED) ===
    id: "copper_vein",                      // Unique identifier (snake_case)
    name: "Copper Vein",                    // Display name
    description: "A rich deposit of copper ore", // Flavor text
    icon: "⛏️",                              // Emoji icon

    // === NODE TYPE (REQUIRED) ===
    nodeType: "mining",                     // mining/logging/fishing/hunting/foraging/thieving
    category: "ore_deposit",                // Subcategory for organization

    // === PROGRESSION (REQUIRED) ===
    tier: 1,                                // Tier level (1-100+, unlimited scaling)
    requiredSkillLevel: 1,                  // Minimum skill level to harvest
    recommendedLevel: 1,                    // Suggested character level

    // === HARVEST MECHANICS (REQUIRED) ===
    baseHealth: 10,                         // Number of harvests before respawn
    minHealth: 8,                           // Minimum health (can be reduced by exploration)
    maxHealth: 15,                          // Maximum health (can be increased by exploration)

    harvestTime: 3.0,                       // Seconds per harvest action
    respawnTime: 30,                        // Seconds until node respawns after depletion

    // === RESOURCE YIELDS (REQUIRED) ===
    // Normal resource table (guaranteed drop, one selected per harvest)
    resourceTable: [
        {
            itemId: "copper_ore",
            weight: 70,                     // Selection weight (higher = more common)
            minYield: 1,                    // Minimum quantity
            maxYield: 3,                    // Maximum quantity
            skillScaling: true              // Does yield increase with skill?
        },
        {
            itemId: "stone",
            weight: 30,
            minYield: 1,
            maxYield: 2,
            skillScaling: false
        }
    ],

    // Rare drop table (chance-based, checked separately)
    rareDropTable: null,                    // null = use skill universal table, or override here
    rareDropChance: 5,                      // Base % chance for rare drop (modified by skill)

    // === SKILL BONUSES (CALCULATED) ===
    yieldBonusPerLevel: 0.05,              // +5% yield per skill level above requirement
    rareBonusPerLevel: 0.02,               // +2% rare chance per skill level above requirement
    speedBonusPerLevel: 0.02,              // +2% harvest speed per skill level (reduces time)

    // === XP REWARDS ===
    baseXP: 25,                            // XP granted per harvest
    xpScaling: "linear",                   // "linear", "exponential", "diminishing"
    xpMultiplier: 1.0,                     // Multiplier for this node's XP

    // === VISUAL & FEEDBACK ===
    rarity: "common",                      // common/uncommon/rare/epic/legendary
    color: "#cd7f32",                      // Theme color for UI
    harvestSound: "mining",                // Sound effect ID
    particleEffect: "ore_sparkle",         // Visual effect on harvest

    // === REGIONAL DISTRIBUTION ===
    biomes: ["plains", "mountains"],       // Which biomes this node can spawn in
    spawnWeight: 100,                      // Relative spawn weight in those biomes
    spawnConditions: null,                 // Special conditions (quests, events, etc.)

    // === EXPLORATION MECHANICS ===
    discoveryWeight: 50,                   // Weight for initial discovery (higher = more common)
    upgradeChance: 30,                     // % chance to add health during exploration
    upgradeAmount: 2,                      // Health added on upgrade

    // === REQUIREMENTS & RESTRICTIONS ===
    requirements: {
        skill: "mining",                   // Which skill is required
        skillLevel: 1,                     // Minimum level
        characterLevel: 0,                 // Minimum character level
        quests: [],                        // Required quest completions
        tools: ["pickaxe"],                // Required tool types (any tier works)
        toolTier: 1                        // Minimum tool tier required
    },

    // === SPECIAL MECHANICS ===
    isRenewable: true,                     // Does it respawn? (false = one-time node)
    isExhaustible: false,                  // Can it be permanently depleted?
    exhaustionThreshold: null,             // Harvests before permanent depletion (if exhaustible)

    multiHarvest: false,                   // Can multiple players harvest simultaneously?
    instancedLoot: true,                   // Each player gets own loot vs. shared pool

    weatherDependent: false,               // Requires specific weather?
    timeDependent: false,                  // Requires specific time of day?
    seasonalAvailability: null,            // null = always, or ["spring", "summer"]

    // === PROGRESSION METADATA ===
    progressionPath: "copper_series",      // Which upgrade path this belongs to
    nextTier: "iron_vein",                 // Next tier node ID (null if max tier)
    previousTier: null,                    // Previous tier node ID (null if tier 1)

    unlockMessage: "You've discovered a copper vein!", // Message on first discovery

    // === STATUS & VERSIONING ===
    status: "production",                  // production/dev/test/legacy/planned
    implemented: true,                     // Is this fully implemented?
    version: "1.0",                        // Game version when added
    developmentNotes: "",                  // Internal notes

    // === FUTURE-PROOFING ===
    customData: {}                         // Extensible object for future features
};

/**
 * VALIDATION RULES
 *
 * Required fields that must be present in every node:
 * - id, name, description, icon
 * - nodeType, tier, requiredSkillLevel
 * - baseHealth, harvestTime, respawnTime
 * - resourceTable (at least one entry)
 * - requirements.skill
 */

const REQUIRED_NODE_FIELDS = [
    'id', 'name', 'description', 'icon',
    'nodeType', 'tier', 'requiredSkillLevel',
    'baseHealth', 'harvestTime', 'respawnTime',
    'resourceTable'
];

/**
 * Valid node types (must match skill types)
 */
const VALID_NODE_TYPES = [
    'mining',
    'logging',
    'fishing',
    'hunting',
    'foraging',
    'thieving'
];

/**
 * Valid rarity levels
 */
const VALID_RARITIES = [
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
    'mythic'
];

/**
 * Valid XP scaling types
 */
const VALID_XP_SCALING = [
    'linear',       // XP stays constant
    'exponential',  // XP increases per harvest
    'diminishing'   // XP decreases per harvest (for farming prevention)
];
