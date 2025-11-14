/**
 * PLANNED ITEMS
 *
 * Future items planned for implementation.
 * These items serve as documentation and design specs.
 * Enable with: ItemRegistry.enablePreviewMode()
 */

const PLANNED_ITEMS = {
    // =================================================================
    // PLANNED WEAPONS (Future content)
    // =================================================================

    planned_mythril_sword: {
        id: 'planned_mythril_sword',
        name: '[PLANNED] Mythril Sword',
        description: 'Legendary sword forged from mythril. Coming in v2.0.',
        icon: '⚔️',
        category: 'equipment',
        rarity: 'legendary',
        stackLimit: 1,
        value: 5000,
        level: 40,
        slot: 'weapon',
        tier: 'legendary',
        combatStats: {
            damage: 120,
            attackSpeed: 1.8,
            critChance: 15,
        },
        planned: true,
        plannedVersion: '2.0',
        tags: ['planned', 'weapon', 'mythril', 'legendary'],
    },

    planned_dragon_bow: {
        id: 'planned_dragon_bow',
        name: '[PLANNED] Dragon Bow',
        description: 'Bow crafted from dragon bones. Coming soon.',
        icon: '🏹',
        category: 'equipment',
        rarity: 'epic',
        stackLimit: 1,
        value: 3000,
        level: 35,
        slot: 'weapon',
        tier: 'elite',
        combatStats: {
            damage: 90,
            attackSpeed: 2.0,
            range: 15,
        },
        planned: true,
        plannedVersion: '2.1',
        tags: ['planned', 'weapon', 'bow', 'dragon'],
    },

    // =================================================================
    // PLANNED CONSUMABLES
    // =================================================================

    planned_elixir_of_life: {
        id: 'planned_elixir_of_life',
        name: '[PLANNED] Elixir of Life',
        description: 'Grants immortality for 1 minute. Planned for endgame.',
        icon: '⚗️',
        category: 'consumable',
        rarity: 'mythic',
        stackLimit: 1,
        value: 100000,
        effectType: 'buff',
        effectDuration: 60000, // 1 minute
        effect: {
            immortality: true,
        },
        planned: true,
        plannedVersion: '3.0',
        tags: ['planned', 'consumable', 'immortality', 'endgame'],
    },

    // =================================================================
    // PLANNED SPECIAL ITEMS
    // =================================================================

    planned_flying_mount: {
        id: 'planned_flying_mount',
        name: '[PLANNED] Flying Mount',
        description: 'Mount that allows flying between regions. Planned feature.',
        icon: '🦅',
        category: 'special',
        rarity: 'legendary',
        stackLimit: 1,
        value: 50000,
        special: {
            type: 'mount',
            speed: 2.0,
            canFly: true,
        },
        planned: true,
        plannedVersion: '2.5',
        tags: ['planned', 'mount', 'flying', 'transport'],
    },

    planned_guild_banner: {
        id: 'planned_guild_banner',
        name: '[PLANNED] Guild Banner',
        description: 'Banner for guild system. Multiplayer feature planned.',
        icon: '🚩',
        category: 'special',
        rarity: 'epic',
        stackLimit: 1,
        value: 10000,
        special: {
            type: 'guild',
        },
        planned: true,
        plannedVersion: '4.0',
        tags: ['planned', 'guild', 'multiplayer'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLANNED_ITEMS;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.PLANNED_ITEMS = PLANNED_ITEMS;
}
