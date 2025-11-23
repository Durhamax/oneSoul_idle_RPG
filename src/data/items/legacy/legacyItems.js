/**
 * LEGACY ITEMS
 *
 * Deprecated items kept for backwards compatibility.
 * These items exist in old save files but have been replaced or removed.
 * Kept active by default to prevent save file corruption.
 */

const LEGACY_ITEMS = {
    // =================================================================
    // DEPRECATED EQUIPMENT (Old naming/format)
    // =================================================================

    old_stone_sword: {
        id: 'old_stone_sword',
        name: '[LEGACY] Stone Sword',
        description: 'Old item format. Replaced by bronzeSword.',
        icon: '🗡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 15,
        level: 3,
        slot: 'weapon',
        tier: 'starter',
        combatStats: {
            damage: 5,
            attackSpeed: 1.0,
        },
        deprecated: true,
        replacedBy: 'bronzeSword',
        tags: ['legacy', 'weapon', 'deprecated'],
    },

    // =================================================================
    // DEPRECATED CONSUMABLES
    // =================================================================

    old_small_potion: {
        id: 'old_small_potion',
        name: '[LEGACY] Small Potion',
        description: 'Old item format. Replaced by minorHealthPotion.',
        icon: '🧪',
        category: 'consumable',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 20,
        value: 10,
        effectType: 'heal',
        effectValue: 20,
        deprecated: true,
        replacedBy: 'minorHealthPotion',
        tags: ['legacy', 'potion', 'deprecated'],
    },

    // =================================================================
    // REMOVED ITEMS (No longer in game)
    // =================================================================

    removed_cursed_amulet: {
        id: 'removed_cursed_amulet',
        name: '[REMOVED] Cursed Amulet',
        description: 'This item was removed from the game. Kept for save compatibility.',
        icon: '🔮',
        category: 'special',
        instanced: true,  // Unique instance
        rarity: 'rare',
        stackLimit: 1,
        value: 0,
        deprecated: true,
        removed: true,
        sellable: false,
        droppable: false,
        tags: ['legacy', 'removed', 'cursed'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LEGACY_ITEMS;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.LEGACY_ITEMS = LEGACY_ITEMS;
}
