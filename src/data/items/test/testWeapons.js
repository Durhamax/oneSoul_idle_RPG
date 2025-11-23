/**
 * TEST WEAPONS - Development Only
 *
 * Add ONLY weapons you want to test here.
 * These are separate from production items.
 *
 * Use Dev Modal buttons to:
 * - "Load Test Weapons" - Add these to your bank
 * - "Clear Test Items" - Remove all test items from save
 */

const TEST_WEAPONS = {
    // Add your test weapons here
    // Example:
    /*
    testRifle: {
        id: 'testRifle',
        name: 'Test Rifle',
        description: 'A test weapon with attachments',
        category: 'weapon',
        equipSlot: 'weapon',
        rarity: 'rare',
        value: 100,
        minDamage: 10,
        maxDamage: 20,
        critChance: 0.10,
        critMultiplier: 2.0,
        attackSpeed: 1.0,
        accuracy: 0.85,
        range: 'ranged',
        attachmentSlots: 3  // Rare = 2-3 slots
    }
    */
};

const TEST_ATTACHMENTS = {
    // Add your test attachments here
    // Example:
    /*
    testScope: {
        id: 'testScope',
        name: 'Test Scope',
        description: 'Improves accuracy',
        category: 'attachment',
        itemType: 'attachment',
        attachmentSlot: 'optic',
        rarity: 'uncommon',
        value: 50,
        stats: {
            accuracy: 0.15,
            critChance: 0.05
        }
    }
    */
};

// Export for Dev Modal
if (typeof window !== 'undefined') {
    window.TEST_WEAPONS = TEST_WEAPONS;
    window.TEST_ATTACHMENTS = TEST_ATTACHMENTS;
}

console.log('📦 Test weapons loaded:', Object.keys(TEST_WEAPONS).length, 'weapons,', Object.keys(TEST_ATTACHMENTS).length, 'attachments');
