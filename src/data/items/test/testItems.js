/**
 * TEST ITEMS
 *
 * Temporary items for testing specific features.
 * These are meant to be deleted after testing is complete.
 * Enable with: ItemRegistry.enableDevMode()
 */

const TEST_ITEMS = {
    testRifle: {
        id: 'testRifle',
        name: 'Test Rifle',
        description: 'A test weapon for attachment system. Rare quality = 2 attachment slots.',
        icon: '🔫',
        category: 'equipment',      // Equipment item
        instanced: true,             // Weapons are instanced
        slot: 'weapon',              // Combat weapon → Weapons tab
        rarity: 'rare',              // Rare = 2 attachment slots
        stackLimit: 1,
        value: 100,
        level: 10,
        tier: 'improved',
        combatStats: {
            damage: 15,
            attackSpeed: 1.0,
            critChance: 10,
            accuracy: 85,
        },
        requirements: {
            characterLevel: 10,
        },
        tags: ['weapon', 'rifle', 'ranged', 'test'],
    },

    // Test Attachments/Mods
    testMuzzle_common: {
        id: 'testMuzzle_common',
        name: 'Common Muzzle',
        description: 'Increases weapon damage by 2%.',
        icon: '🔩',
        category: 'equipment',
        instanced: true,             // Mods are instanced!
        slot: 'attachment',
        itemType: 'attachment',      // Required for attachment filtering
        modType: 'muzzle',           // Which slot this mod fits in
        modStat: 'attackDamage',     // Which stat this mod boosts
        rarity: 'common',
        stackLimit: 10,
        value: 25,
        defaultTab: 'mod',           // Show in mod tab
        tags: ['attachment', 'muzzle', 'test'],
        // Stat bonus (inherent to this mod)
        bonusValue: 0.02,            // +2% multiplicative
    },

    testScope_uncommon: {
        id: 'testScope_uncommon',
        name: 'Uncommon Scope',
        description: 'Increases weapon accuracy by 4%.',
        icon: '🔭',
        category: 'equipment',
        instanced: true,             // Mods are instanced!
        slot: 'attachment',
        itemType: 'attachment',      // Required for attachment filtering
        modType: 'scope',            // Which slot this mod fits in
        modStat: 'accuracy',         // Which stat this mod boosts
        rarity: 'uncommon',
        stackLimit: 10,
        value: 50,
        defaultTab: 'mod',           // Show in mod tab
        tags: ['attachment', 'scope', 'test'],
        // Stat bonus (inherent to this mod)
        bonusValue: 0.04,            // +4% multiplicative
    },

    testGrip_rare: {
        id: 'testGrip_rare',
        name: 'Rare Grip',
        description: 'Increases weapon critical damage by 7%.',
        icon: '🎯',
        category: 'equipment',
        instanced: true,             // Mods are instanced!
        slot: 'attachment',
        itemType: 'attachment',      // Required for attachment filtering
        modType: 'grip',             // Which slot this mod fits in
        modStat: 'criticalDamage',   // Which stat this mod boosts
        rarity: 'rare',
        stackLimit: 10,
        value: 100,
        defaultTab: 'mod',           // Show in mod tab
        tags: ['attachment', 'grip', 'test'],
        // Stat bonus (inherent to this mod)
        bonusValue: 0.07,            // +7% multiplicative
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TEST_ITEMS;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.TEST_ITEMS = TEST_ITEMS;
}
