/**
 * PERK GRID CONSTANTS
 * All configuration for the 7x7 perk grid system
 */

const GRID_CONFIG = {
    size: 7,
    totalTiles: 49,
    startingTiles: 1,
    unlockInterval: 10  // +1 tile every 10 character levels
};

// Spiral unlock order from center
const UNLOCK_ORDER = [
    // Center (level 1)
    { row: 3, col: 3 },
    // Ring 1 (levels 11-81)
    { row: 3, col: 4 },
    { row: 2, col: 4 },
    { row: 2, col: 3 },
    { row: 2, col: 2 },
    { row: 3, col: 2 },
    { row: 4, col: 2 },
    { row: 4, col: 3 },
    { row: 4, col: 4 },
    // Ring 2 (levels 91-241)
    { row: 4, col: 5 },
    { row: 3, col: 5 },
    { row: 2, col: 5 },
    { row: 1, col: 5 },
    { row: 1, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 2 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
    { row: 3, col: 1 },
    { row: 4, col: 1 },
    { row: 5, col: 1 },
    { row: 5, col: 2 },
    { row: 5, col: 3 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },
    // Ring 3 (levels 251-481)
    { row: 5, col: 6 },
    { row: 4, col: 6 },
    { row: 3, col: 6 },
    { row: 2, col: 6 },
    { row: 1, col: 6 },
    { row: 0, col: 6 },
    { row: 0, col: 5 },
    { row: 0, col: 4 },
    { row: 0, col: 3 },
    { row: 0, col: 2 },
    { row: 0, col: 1 },
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 3, col: 0 },
    { row: 4, col: 0 },
    { row: 5, col: 0 },
    { row: 6, col: 0 },
    { row: 6, col: 1 },
    { row: 6, col: 2 },
    { row: 6, col: 3 },
    { row: 6, col: 4 },
    { row: 6, col: 5 },
    { row: 6, col: 6 }
];

const MEDAL_RARITIES = {
    common: {
        name: 'Common',
        perkCount: 1,
        valueRange: { min: 0.02, max: 0.04 },
        color: '#9e9e9e',
        bgGradient: 'linear-gradient(135deg, #424242, #616161)',
        icon: '?',
        glowIntensity: 0,
        animation: null
    },
    uncommon: {
        name: 'Uncommon',
        perkCount: 2,
        valueRange: { min: 0.03, max: 0.06 },
        color: '#4caf50',
        bgGradient: 'linear-gradient(135deg, #2e7d32, #4caf50)',
        icon: '?',
        glowIntensity: 0.3,
        animation: null
    },
    rare: {
        name: 'Rare',
        perkCount: 3,
        valueRange: { min: 0.04, max: 0.08 },
        color: '#2196f3',
        bgGradient: 'linear-gradient(135deg, #1565c0, #2196f3)',
        icon: '?',
        glowIntensity: 0.5,
        animation: 'pulse-slow'
    },
    epic: {
        name: 'Epic',
        perkCount: 4,
        valueRange: { min: 0.05, max: 0.10 },
        color: '#9c27b0',
        bgGradient: 'linear-gradient(135deg, #6a1b9a, #9c27b0)',
        icon: '?',
        glowIntensity: 0.6,
        animation: 'pulse-medium'
    },
    legendary: {
        name: 'Legendary',
        perkCount: 5,
        valueRange: { min: 0.06, max: 0.12 },
        color: '#ff9800',
        bgGradient: 'linear-gradient(135deg, #e65100, #ff9800, #ffc107)',
        icon: '?',
        glowIntensity: 0.7,
        animation: 'shimmer'
    },
    mythic: {
        name: 'Mythic',
        perkCount: 6,
        valueRange: { min: 0.08, max: 0.15 },
        color: '#f44336',
        bgGradient: 'linear-gradient(135deg, #b71c1c, #f44336, #ff5722)',
        icon: '?',
        glowIntensity: 0.8,
        animation: 'shimmer-intense'
    },
    divine: {
        name: 'Divine',
        perkCount: 7,
        valueRange: { min: 0.10, max: 0.18 },
        color: '#00bcd4',
        bgGradient: 'linear-gradient(135deg, #006064, #00bcd4, #4dd0e1)',
        icon: '*',
        glowIntensity: 0.9,
        animation: 'prismatic'
    },
    transcendent: {
        name: 'Transcendent',
        perkCount: 8,
        valueRange: { min: 0.12, max: 0.22 },
        color: '#e91e63',
        bgGradient: 'linear-gradient(45deg, #880e4f, #e91e63, #f48fb1, #e91e63)',
        icon: '~',
        glowIntensity: 1.0,
        animation: 'energy-flow'
    },
    creator: {
        name: 'Creator',
        perkCount: 9,
        valueRange: { min: 0.15, max: 0.28 },
        color: '#ffd700',
        bgGradient: 'linear-gradient(45deg, #ff6b6b, #ffd700, #4ecdc4, #ffd700, #ff6b6b)',
        icon: '+',
        glowIntensity: 1.2,
        animation: 'reality-warp'
    }
};

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'divine', 'transcendent', 'creator'];

const CATEGORY_COLORS = {
    offense: '#e53935',      // red
    defense: '#1e88e5',      // blue
    resistance: '#8e24aa',   // purple
    consumable: '#ff7043',   // deep orange
    combat: '#ffc107',       // amber (loot perks)
    scaling: '#00acc1',      // cyan
    navigation: '#26a69a',   // teal
    gathering: '#43a047',    // green
    crafting: '#fb8c00',     // orange
    experience: '#ffd700'    // gold
};

const PERK_STAT_POOL = {
    // ═══════════════════════════════════════════════════════════════
    // COMBAT OFFENSE (6)
    // ═══════════════════════════════════════════════════════════════
    meleeDamage: { name: 'Melee Damage', category: 'offense', icon: '⚔️' },
    rangedDamage: { name: 'Ranged Damage', category: 'offense', icon: '🎯' },
    accuracy: { name: 'Accuracy', category: 'offense', icon: '◎' },
    critRating: { name: 'Critical Rating', category: 'offense', icon: '💥' },
    critMultiplier: { name: 'Critical Multiplier', category: 'offense', icon: '✴️' },
    attackSpeed: { name: 'Attack Speed', category: 'offense', icon: '⚡' },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT DEFENSE (5)
    // ═══════════════════════════════════════════════════════════════
    maxHealth: { name: 'Max Health', category: 'defense', icon: '❤️' },
    evasion: { name: 'Evasion', category: 'defense', icon: '💨' },
    armorRating: { name: 'Armor Rating', category: 'defense', icon: '🛡️' },
    damageReduction: { name: 'Damage Reduction', category: 'defense', icon: '🔰' },
    critResistance: { name: 'Critical Resistance', category: 'defense', icon: '🛑' },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT RESISTANCE (5)
    // ═══════════════════════════════════════════════════════════════
    pierceResist: { name: 'Pierce Resistance', category: 'resistance', icon: '🗡️' },
    explosiveResist: { name: 'Explosive Resistance', category: 'resistance', icon: '💣' },
    cryoResist: { name: 'Cryo Resistance', category: 'resistance', icon: '❄️' },
    shockResist: { name: 'Shock Resistance', category: 'resistance', icon: '⚡' },
    incendiaryResist: { name: 'Incendiary Resistance', category: 'resistance', icon: '🔥' },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT CONSUMABLES (9) - Effectiveness & Conservation
    // ═══════════════════════════════════════════════════════════════
    // Effectiveness (how strong the effect is)
    foodHealing: { name: 'Food Healing', category: 'consumable', icon: '💚' },
    potionPotency: { name: 'Potion Potency', category: 'consumable', icon: '🧪' },
    techPotency: { name: 'Tech Potency', category: 'consumable', icon: '🔋' },

    // Conservation (chance to NOT consume on use)
    foodConservation: { name: 'Food Conservation', category: 'consumable', icon: '🍞' },
    potionConservation: { name: 'Potion Conservation', category: 'consumable', icon: '💧' },
    techConservation: { name: 'Tech Conservation', category: 'consumable', icon: '🔌' },
    ammoConservation: { name: 'Ammo Conservation', category: 'consumable', icon: '🎯' },

    // Auto-Eat System
    autoEatThreshold: { name: 'Auto-Eat Threshold', category: 'consumable', icon: '🍖' },
    autoEatEfficiency: { name: 'Auto-Eat Efficiency', category: 'consumable', icon: '✨' },

    // ═══════════════════════════════════════════════════════════════
    // COMBAT LOOT (3) - Currency & Item Find
    // ═══════════════════════════════════════════════════════════════
    goldFind: { name: 'Gold Find', category: 'combat', icon: '💰' },
    fragmentFind: { name: 'Fragment Find', category: 'combat', icon: '🏅' },
    itemFind: { name: 'Item Find', category: 'combat', icon: '🎁' },

    // ═══════════════════════════════════════════════════════════════
    // ATTRIBUTE SCALING (7)
    // ═══════════════════════════════════════════════════════════════
    healthScaling: { name: 'Health Scaling', category: 'scaling', icon: '❤️' },
    strengthScaling: { name: 'Strength Scaling', category: 'scaling', icon: '💪' },
    defenseScaling: { name: 'Defense Scaling', category: 'scaling', icon: '🛡️' },
    mobilityScaling: { name: 'Mobility Scaling', category: 'scaling', icon: '🏃' },
    perceptionScaling: { name: 'Perception Scaling', category: 'scaling', icon: '👁️' },
    stealthScaling: { name: 'Stealth Scaling', category: 'scaling', icon: '🥷' },
    intelligenceScaling: { name: 'Intelligence Scaling', category: 'scaling', icon: '🧠' },

    // ═══════════════════════════════════════════════════════════════
    // NAVIGATION (5)
    // ═══════════════════════════════════════════════════════════════
    explorationSpeed: { name: 'Exploration Speed', category: 'navigation', icon: '🧭' },
    discoveryChance: { name: 'Discovery Chance', category: 'navigation', icon: '🔍' },
    enduranceCapacity: { name: 'Endurance Capacity', category: 'navigation', icon: '🏃' },
    enduranceRecovery: { name: 'Endurance Recovery', category: 'navigation', icon: '💤' },
    pathDiscovery: { name: 'Path Discovery', category: 'navigation', icon: '🗺️' },

    // ═══════════════════════════════════════════════════════════════
    // GATHERING SPEED (6)
    // ═══════════════════════════════════════════════════════════════
    miningSpeed: { name: 'Mining Speed', category: 'gathering', icon: '⛏️' },
    loggingSpeed: { name: 'Logging Speed', category: 'gathering', icon: '🪓' },
    fishingSpeed: { name: 'Fishing Speed', category: 'gathering', icon: '🎣' },
    huntingSpeed: { name: 'Hunting Speed', category: 'gathering', icon: '🏹' },
    foragingSpeed: { name: 'Foraging Speed', category: 'gathering', icon: '🌿' },
    thievingSpeed: { name: 'Thieving Speed', category: 'gathering', icon: '🤫' },

    // ═══════════════════════════════════════════════════════════════
    // GATHERING YIELD (6)
    // ═══════════════════════════════════════════════════════════════
    miningYield: { name: 'Mining Yield', category: 'gathering', icon: '💎' },
    loggingYield: { name: 'Logging Yield', category: 'gathering', icon: '🪵' },
    fishingYield: { name: 'Fishing Yield', category: 'gathering', icon: '🐟' },
    huntingYield: { name: 'Hunting Yield', category: 'gathering', icon: '🥩' },
    foragingYield: { name: 'Foraging Yield', category: 'gathering', icon: '🌱' },
    thievingYield: { name: 'Thieving Yield', category: 'gathering', icon: '💰' },

    // ═══════════════════════════════════════════════════════════════
    // CRAFTING SPEED (7)
    // ═══════════════════════════════════════════════════════════════
    cookingSpeed: { name: 'Cooking Speed', category: 'crafting', icon: '🍳' },
    chemistrySpeed: { name: 'Chemistry Speed', category: 'crafting', icon: '⚗️' },
    smithingSpeed: { name: 'Smithing Speed', category: 'crafting', icon: '🔨' },
    mechanicsSpeed: { name: 'Mechanics Speed', category: 'crafting', icon: '⚙️' },
    electronicsSpeed: { name: 'Electronics Speed', category: 'crafting', icon: '🔌' },
    textilesSpeed: { name: 'Textiles Speed', category: 'crafting', icon: '🧵' },
    engineeringSpeed: { name: 'Engineering Speed', category: 'crafting', icon: '🔧' },

    // ═══════════════════════════════════════════════════════════════
    // CRAFTING YIELD (5) - Non-instanced outputs only
    // ═══════════════════════════════════════════════════════════════
    cookingYield: { name: 'Cooking Yield', category: 'crafting', icon: '🍲' },
    chemistryYield: { name: 'Chemistry Yield', category: 'crafting', icon: '🧪' },
    smithingYield: { name: 'Smithing Yield', category: 'crafting', icon: '⚒️' },
    electronicsYield: { name: 'Electronics Yield', category: 'crafting', icon: '💡' },
    engineeringYield: { name: 'Engineering Yield', category: 'crafting', icon: '🏗️' },

    // ═══════════════════════════════════════════════════════════════
    // CRAFTING RARITY (2) - Instanced outputs only
    // ═══════════════════════════════════════════════════════════════
    mechanicsRarity: { name: 'Mechanics Rarity', category: 'crafting', icon: '⭐' },
    textilesRarity: { name: 'Textiles Rarity', category: 'crafting', icon: '⭐' },

    // ═══════════════════════════════════════════════════════════════
    // EXPERIENCE (2)
    // ═══════════════════════════════════════════════════════════════
    combatXP: { name: 'Combat XP', category: 'experience', icon: '⚔️' },
    skillXP: { name: 'Skill XP', category: 'experience', icon: '📚' }
};

const CRAFTING_TIERS = {
    1: { name: 'Basic', cost: 10, rarityWeights: { common: 100 } },
    2: { name: 'Standard', cost: 25, rarityWeights: { common: 70, uncommon: 30 } },
    3: { name: 'Quality', cost: 50, rarityWeights: { common: 50, uncommon: 35, rare: 15 } },
    4: { name: 'Superior', cost: 100, rarityWeights: { uncommon: 50, rare: 35, epic: 15 } },
    5: { name: 'Elite', cost: 250, rarityWeights: { rare: 50, epic: 35, legendary: 15 } },
    6: { name: 'Masterwork', cost: 500, rarityWeights: { epic: 50, legendary: 35, mythic: 15 } },
    7: { name: 'Exalted', cost: 1000, rarityWeights: { legendary: 50, mythic: 35, divine: 15 } },
    8: { name: 'Ascendant', cost: 2500, rarityWeights: { mythic: 50, divine: 35, transcendent: 15 } },
    9: { name: 'Primordial', cost: 5000, rarityWeights: { divine: 50, transcendent: 35, creator: 15 } }
};

const MEDAL_INVENTORY_CONFIG = {
    baseCapacity: 100,
    maxCapacity: 500,
    expansionCost: 500,
    expansionAmount: 25
};

const COMBINE_CONFIG = {
    medalsRequired: 3,
    inheritanceBonus: 0.25
};

const SALVAGE_CONFIG = {
    returnRate: 0.30,
    minimumByRarity: {
        common: 3,
        uncommon: 8,
        rare: 15,
        epic: 30,
        legendary: 75,
        mythic: 150,
        divine: 300,
        transcendent: 750,
        creator: 1500
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GRID_CONFIG, UNLOCK_ORDER, MEDAL_RARITIES, RARITY_ORDER,
        CATEGORY_COLORS, PERK_STAT_POOL, CRAFTING_TIERS,
        MEDAL_INVENTORY_CONFIG, COMBINE_CONFIG, SALVAGE_CONFIG
    };
}
