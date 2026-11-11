/**
 * DEVELOPMENT ITEMS
 *
 * Items for testing and development purposes.
 * These items are NOT included in production builds by default.
 * Enable with: ItemRegistry.enableDevMode()
 */

const DEV_ITEMS = {
    // =================================================================
    // DEV TESTING ITEMS
    // =================================================================

    devSuperSword: {
        id: 'devSuperSword',
        name: '[DEV] Super Sword',
        description: 'Development sword with massive stats for testing.',
        icon: '⚔️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'legendary',
        stackLimit: 1,
        value: 999999,
        level: 1,
        slot: 'weapon',
        tier: 'dev',
        combatStats: {
            damage: 9999,
            attackSpeed: 10.0,
            critChance: 100,
        },
        sellable: false,
        droppable: false,
        tags: ['dev', 'weapon', 'testing', 'op'],
    },

    devGodArmor: {
        id: 'devGodArmor',
        name: '[DEV] God Armor',
        description: 'Invincible armor for testing. Makes you immortal.',
        icon: '🛡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'legendary',
        stackLimit: 1,
        value: 999999,
        level: 1,
        slot: 'body',
        tier: 'dev',
        combatStats: {
            defense: 9999,
            health: 99999,
        },
        sellable: false,
        droppable: false,
        tags: ['dev', 'armor', 'testing', 'invincible'],
    },

    devInfinitePotion: {
        id: 'devInfinitePotion',
        name: '[DEV] Infinite Potion',
        description: 'Fully heals and gives all buffs. For testing only.',
        icon: '🧪',
        category: 'consumable',
        instanced: true,  // Unique instance
        rarity: 'legendary',
        stackLimit: 999,
        value: 0,
        effectType: 'heal',
        effectValue: 999999,
        cooldown: 0,
        sellable: false,
        droppable: false,
        tags: ['dev', 'potion', 'testing', 'heal', 'buff'],
    },

    devGoldPile: {
        id: 'devGoldPile',
        name: '[DEV] Gold Pile',
        description: 'Gives 1,000,000 gold when used. For testing economy.',
        icon: '💰',
        category: 'consumable',
        instanced: true,  // Unique instance
        rarity: 'epic',
        stackLimit: 99,
        value: 0,
        effectType: 'currency',
        effectValue: 1000000,
        sellable: false,
        droppable: false,
        tags: ['dev', 'gold', 'testing', 'currency'],
    },

    devLevelBooster: {
        id: 'devLevelBooster',
        name: '[DEV] Level Booster',
        description: 'Instantly gain 10 levels. For testing progression.',
        icon: '⏫',
        category: 'special',
        instanced: true,  // Unique instance
        rarity: 'epic',
        stackLimit: 99,
        value: 0,
        special: {
            type: 'levelBoost',
            amount: 10,
        },
        sellable: false,
        droppable: false,
        tags: ['dev', 'level', 'testing', 'boost'],
    },

    devSkillMaxer: {
        id: 'devSkillMaxer',
        name: '[DEV] Skill Maxer',
        description: 'Sets all skills to level 99. For testing endgame.',
        icon: '📊',
        category: 'special',
        instanced: true,  // Unique instance
        rarity: 'legendary',
        stackLimit: 1,
        value: 0,
        special: {
            type: 'maxSkills',
        },
        sellable: false,
        droppable: false,
        tags: ['dev', 'skills', 'testing', 'max'],
    },

    devTeleporter: {
        id: 'devTeleporter',
        name: '[DEV] Teleporter',
        description: 'Teleport to any region instantly. For testing navigation.',
        icon: '🌀',
        category: 'special',
        instanced: true,  // Unique instance
        rarity: 'epic',
        stackLimit: 99,
        value: 0,
        special: {
            type: 'teleport',
        },
        sellable: false,
        droppable: false,
        tags: ['dev', 'teleport', 'testing', 'navigation'],
    },

    devItemSpawner: {
        id: 'devItemSpawner',
        name: '[DEV] Item Spawner',
        description: 'Spawns any item. For testing inventory/drops.',
        icon: '📦',
        category: 'special',
        instanced: true,  // Unique instance
        rarity: 'legendary',
        stackLimit: 1,
        value: 0,
        special: {
            type: 'itemSpawner',
        },
        sellable: false,
        droppable: false,
        tags: ['dev', 'spawn', 'testing', 'inventory'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEV_ITEMS;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.DEV_ITEMS = DEV_ITEMS;
}
