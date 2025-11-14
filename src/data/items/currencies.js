/**
 * CURRENCY & SPECIAL ITEMS
 *
 * Currency items, quest items, keys, and special unique items
 */

const CURRENCY_AND_SPECIAL_ITEMS = {
    // =================================================================
    // CURRENCIES
    // =================================================================

    gold: {
        id: 'gold',
        name: 'Gold',
        description: 'Standard currency used throughout the realm. Accepted everywhere.',
        icon: '🪙',
        category: 'currency',
        rarity: 'common',
        stackLimit: 999999,
        value: 1,
        sellable: false,
        droppable: false,
        tags: ['currency', 'gold', 'money'],
    },

    medals: {
        id: 'medals',
        name: 'Medal',
        description: 'Prestigious medals earned through accomplishments. Can be used for special purchases.',
        icon: '🏅',
        category: 'currency',
        rarity: 'uncommon',
        stackLimit: 999999,
        value: 100,
        sellable: false,
        droppable: false,
        tags: ['currency', 'medals', 'prestige'],
    },

    tomes: {
        id: 'tomes',
        name: 'Tome',
        description: 'Ancient tomes containing powerful knowledge. Rare and valuable.',
        icon: '📕',
        category: 'currency',
        rarity: 'rare',
        stackLimit: 999999,
        value: 1000,
        sellable: false,
        droppable: false,
        tags: ['currency', 'tomes', 'knowledge'],
    },

    gems: {
        id: 'gems',
        name: 'Gem',
        description: 'Rare crystalline gems with magical properties. Premium currency.',
        icon: '💎',
        category: 'currency',
        rarity: 'epic',
        stackLimit: 999999,
        value: 10000,
        sellable: false,
        droppable: false,
        tags: ['currency', 'gems', 'premium'],
    },

    // =================================================================
    // QUEST ITEMS
    // =================================================================

    mysteriousLetter: {
        id: 'mysteriousLetter',
        name: 'Mysterious Letter',
        description: 'A sealed letter with an unknown sender. Smells faintly of lavender.',
        icon: '💌',
        category: 'quest',
        rarity: 'uncommon',
        stackLimit: 1,
        value: 0,
        sellable: false,
        droppable: false,
        questId: 'tutorialQuest',
        tags: ['quest', 'letter', 'mystery'],
    },

    ancientArtifact: {
        id: 'ancientArtifact',
        name: 'Ancient Artifact',
        description: 'A mysterious artifact from a forgotten age. Pulses with dormant power.',
        icon: '🗿',
        category: 'quest',
        rarity: 'legendary',
        stackLimit: 1,
        value: 0,
        sellable: false,
        droppable: false,
        unique: true,
        tags: ['quest', 'artifact', 'ancient', 'unique'],
    },

    //=================================================================
    // KEYS
    // =================================================================

    bronzeKey: {
        id: 'bronzeKey',
        name: 'Bronze Key',
        description: 'Simple bronze key. Opens bronze chests.',
        icon: '🗝️',
        category: 'key',
        rarity: 'common',
        stackLimit: 10,
        value: 20,
        tags: ['key', 'bronze', 'chest'],
    },

    silverKey: {
        id: 'silverKey',
        name: 'Silver Key',
        description: 'Ornate silver key. Opens silver chests.',
        icon: '🗝️',
        category: 'key',
        rarity: 'uncommon',
        stackLimit: 5,
        value: 50,
        tags: ['key', 'silver', 'chest'],
    },

    goldKey: {
        id: 'goldKey',
        name: 'Gold Key',
        description: 'Precious gold key. Opens gold chests.',
        icon: '🗝️',
        category: 'key',
        rarity: 'rare',
        stackLimit: 3,
        value: 150,
        tags: ['key', 'gold', 'chest'],
    },

    masterKey: {
        id: 'masterKey',
        name: 'Master Key',
        description: 'Legendary master key. Can open any chest.',
        icon: '🔑',
        category: 'key',
        rarity: 'legendary',
        stackLimit: 1,
        value: 1000,
        unique: true,
        tags: ['key', 'master', 'unique'],
    },

    // =================================================================
    // SPECIAL ITEMS
    // =================================================================

    luckyCharm: {
        id: 'luckyCharm',
        name: 'Lucky Charm',
        description: 'A small charm said to bring good fortune. Increases luck permanently.',
        icon: '🍀',
        category: 'special',
        rarity: 'rare',
        stackLimit: 1,
        value: 500,
        sellable: true,
        special: {
            type: 'permanentBuff',
            stat: 'luck',
            amount: 5,
        },
        tags: ['special', 'charm', 'luck', 'buff'],
    },

    petEgg: {
        id: 'petEgg',
        name: 'Pet Egg',
        description: 'Mysterious egg that will hatch into a companion. Handle with care!',
        icon: '🥚',
        category: 'special',
        rarity: 'epic',
        stackLimit: 1,
        value: 0,
        sellable: false,
        droppable: false,
        special: {
            type: 'pet',
            hatchTime: 86400000, // 24 hours
        },
        tags: ['special', 'pet', 'egg'],
    },

    resetPotion: {
        id: 'resetPotion',
        name: 'Reset Potion',
        description: 'Powerful potion that allows you to reset your character attributes.',
        icon: '⚗️',
        category: 'special',
        rarity: 'legendary',
        stackLimit: 1,
        value: 10000,
        sellable: false,
        special: {
            type: 'attributeReset',
        },
        tags: ['special', 'potion', 'reset'],
    },

    bagExpansion: {
        id: 'bagExpansion',
        name: 'Bag Expansion',
        description: 'Magical expansion that increases your inventory capacity by 10 slots.',
        icon: '🎒',
        category: 'special',
        rarity: 'rare',
        stackLimit: 1,
        value: 5000,
        sellable: false,
        special: {
            type: 'inventoryExpansion',
            amount: 10,
        },
        tags: ['special', 'bag', 'inventory'],
    },

    bankExpansion: {
        id: 'bankExpansion',
        name: 'Bank Expansion',
        description: 'Adds an additional bank tab for storage.',
        icon: '🏦',
        category: 'special',
        rarity: 'rare',
        stackLimit: 1,
        value: 10000,
        sellable: false,
        special: {
            type: 'bankExpansion',
            amount: 1,
        },
        tags: ['special', 'bank', 'storage'],
    },

    experienceBooster: {
        id: 'experienceBooster',
        name: 'Experience Booster',
        description: 'Doubles experience gains for 1 hour. Time to level up!',
        icon: '⏫',
        category: 'special',
        rarity: 'epic',
        stackLimit: 5,
        value: 2000,
        special: {
            type: 'experienceMultiplier',
            multiplier: 2.0,
            duration: 3600000, // 1 hour
        },
        tags: ['special', 'boost', 'experience'],
    },

    lootBooster: {
        id: 'lootBooster',
        name: 'Loot Booster',
        description: 'Increases drop rates by 50% for 30 minutes. Find rare items!',
        icon: '🎁',
        category: 'special',
        rarity: 'epic',
        stackLimit: 5,
        value: 1500,
        special: {
            type: 'lootMultiplier',
            multiplier: 1.5,
            duration: 1800000, // 30 minutes
        },
        tags: ['special', 'boost', 'loot'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CURRENCY_AND_SPECIAL_ITEMS;
}
