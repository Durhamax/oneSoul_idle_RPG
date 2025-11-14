/**
 * CONSUMABLE ITEMS
 *
 * Single-use items: potions, food, scrolls, buffs
 */

const CONSUMABLE_ITEMS = {
    // =================================================================
    // HEALING POTIONS
    // =================================================================

    minorHealthPotion: {
        id: 'minorHealthPotion',
        name: 'Minor Health Potion',
        description: 'Restores 25 health points instantly. A lifesaver in tight spots.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 20,
        value: 15,
        effectType: 'heal',
        effectValue: 25,
        cooldown: 1000,
        tags: ['consumable', 'potion', 'healing', 'health'],
    },

    healthPotion: {
        id: 'healthPotion',
        name: 'Health Potion',
        description: 'Restores 50 health points instantly. Standard healing potion.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 20,
        value: 30,
        effectType: 'heal',
        effectValue: 50,
        cooldown: 1000,
        tags: ['consumable', 'potion', 'healing', 'health'],
    },

    greaterHealthPotion: {
        id: 'greaterHealthPotion',
        name: 'Greater Health Potion',
        description: 'Restores 100 health points instantly. Powerful healing.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 15,
        value: 75,
        effectType: 'heal',
        effectValue: 100,
        cooldown: 1000,
        tags: ['consumable', 'potion', 'healing', 'health'],
    },

    superiorHealthPotion: {
        id: 'superiorHealthPotion',
        name: 'Superior Health Potion',
        description: 'Restores 200 health points instantly. Exceptional healing power.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'rare',
        stackLimit: 10,
        value: 180,
        effectType: 'heal',
        effectValue: 200,
        cooldown: 1000,
        tags: ['consumable', 'potion', 'healing', 'health'],
    },

    // =================================================================
    // BUFF POTIONS
    // =================================================================

    strengthPotion: {
        id: 'strengthPotion',
        name: 'Strength Potion',
        description: 'Temporarily increases strength by 5 for 5 minutes. Feel the power!',
        icon: '💪',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 10,
        value: 80,
        effectType: 'buff',
        effectValue: 5,
        effectDuration: 300000, // 5 minutes
        effect: {
            stat: 'strength',
            amount: 5,
        },
        cooldown: 2000,
        tags: ['consumable', 'potion', 'buff', 'strength'],
    },

    dexterityPotion: {
        id: 'dexterityPotion',
        name: 'Dexterity Potion',
        description: 'Temporarily increases dexterity by 5 for 5 minutes. Move like the wind!',
        icon: '🏃',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 10,
        value: 80,
        effectType: 'buff',
        effectValue: 5,
        effectDuration: 300000,
        effect: {
            stat: 'dexterity',
            amount: 5,
        },
        cooldown: 2000,
        tags: ['consumable', 'potion', 'buff', 'dexterity'],
    },

    intelligencePotion: {
        id: 'intelligencePotion',
        name: 'Intelligence Potion',
        description: 'Temporarily increases intelligence by 5 for 5 minutes. Think sharper!',
        icon: '🧠',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 10,
        value: 80,
        effectType: 'buff',
        effectValue: 5,
        effectDuration: 300000,
        effect: {
            stat: 'intelligence',
            amount: 5,
        },
        cooldown: 2000,
        tags: ['consumable', 'potion', 'buff', 'intelligence'],
    },

    // =================================================================
    // FOOD
    // =================================================================

    bread: {
        id: 'bread',
        name: 'Bread',
        description: 'Fresh baked bread. Restores 10 health over time.',
        icon: '🍞',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 50,
        value: 5,
        effectType: 'heal',
        effectValue: 10,
        cooldown: 500,
        tags: ['consumable', 'food', 'healing'],
    },

    cookedMeat: {
        id: 'cookedMeat',
        name: 'Cooked Meat',
        description: 'Hearty cooked meat. Restores 25 health and provides small strength buff.',
        icon: '🍖',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 30,
        value: 12,
        effectType: 'heal',
        effectValue: 25,
        effect: {
            stat: 'strength',
            amount: 2,
            duration: 180000, // 3 minutes
        },
        cooldown: 1000,
        tags: ['consumable', 'food', 'healing', 'buff'],
    },

    fish: {
        id: 'fish',
        name: 'Cooked Fish',
        description: 'Freshly cooked fish. Restores 20 health and boosts dexterity.',
        icon: '🐟',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 30,
        value: 10,
        effectType: 'heal',
        effectValue: 20,
        effect: {
            stat: 'dexterity',
            amount: 2,
            duration: 180000,
        },
        cooldown: 1000,
        tags: ['consumable', 'food', 'healing', 'buff'],
    },

    // =================================================================
    // SCROLLS & TELEPORTS
    // =================================================================

    teleportScroll: {
        id: 'teleportScroll',
        name: 'Teleport Scroll',
        description: 'Ancient scroll that teleports you to a safe location.',
        icon: '📜',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 5,
        value: 100,
        effectType: 'teleport',
        effect: {
            destination: 'home',
        },
        cooldown: 5000,
        tags: ['consumable', 'scroll', 'teleport', 'magic'],
    },

    // =================================================================
    // EXPERIENCE ITEMS
    // =================================================================

    experienceTome: {
        id: 'experienceTome',
        name: 'Experience Tome',
        description: 'Mystical tome containing ancient knowledge. Grants 100 experience.',
        icon: '📚',
        category: 'consumable',
        rarity: 'rare',
        stackLimit: 10,
        value: 200,
        effectType: 'experience',
        effectValue: 100,
        tags: ['consumable', 'tome', 'experience', 'magic'],
    },

    minorExperienceTome: {
        id: 'minorExperienceTome',
        name: 'Minor Experience Tome',
        description: 'Small tome with basic knowledge. Grants 25 experience.',
        icon: '📖',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 20,
        value: 50,
        effectType: 'experience',
        effectValue: 25,
        tags: ['consumable', 'tome', 'experience', 'magic'],
    },

    // =================================================================
    // RESOURCE BOOSTERS
    // =================================================================

    gatheringPotion: {
        id: 'gatheringPotion',
        name: 'Gathering Potion',
        description: 'Increases gathering speed by 20% for 10 minutes.',
        icon: '⚗️',
        category: 'consumable',
        rarity: 'uncommon',
        stackLimit: 10,
        value: 120,
        effectType: 'buff',
        effectValue: 20,
        effectDuration: 600000, // 10 minutes
        effect: {
            type: 'gatheringSpeed',
            multiplier: 1.2,
        },
        cooldown: 2000,
        tags: ['consumable', 'potion', 'buff', 'gathering'],
    },

    luckPotion: {
        id: 'luckPotion',
        name: 'Luck Potion',
        description: 'Increases luck by 10 for 5 minutes. Better loot drops!',
        icon: '🍀',
        category: 'consumable',
        rarity: 'rare',
        stackLimit: 5,
        value: 250,
        effectType: 'buff',
        effectValue: 10,
        effectDuration: 300000,
        effect: {
            stat: 'luck',
            amount: 10,
        },
        cooldown: 2000,
        tags: ['consumable', 'potion', 'buff', 'luck'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSUMABLE_ITEMS;
}
