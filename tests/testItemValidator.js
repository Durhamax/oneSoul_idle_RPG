/**
 * ITEM VALIDATOR TEST
 *
 * Demonstrates the item validation system with various test cases.
 * Run this file to see validation in action.
 *
 * Usage (Node.js):
 *   node testItemValidator.js
 *
 * Usage (Browser):
 *   Include in HTML and call testItemValidation()
 */

// Import required modules
const ItemValidator = typeof require !== 'undefined'
    ? require('./itemValidator.js')
    : window.ItemValidator;

const {
    EXAMPLE_ITEMS
} = typeof require !== 'undefined'
    ? require('./itemSchema.js')
    : window;

/**
 * Test Cases
 */
const TEST_ITEMS = {
    // ✅ Valid Items
    validSword: {
        id: 'testSword',
        name: 'Test Sword',
        description: 'A perfectly valid sword for testing purposes.',
        icon: '🗡️',
        category: 'equipment',
        rarity: 'common',
        stackLimit: 1,
        value: 100,
        slot: 'weapon',
        tier: 'basic',
        attributes: {
            strength: 5,
        },
        combatStats: {
            damage: 20,
        },
        tags: ['weapon', 'sword', 'test'],
    },

    validPotion: {
        id: 'testPotion',
        name: 'Test Potion',
        description: 'A perfectly valid healing potion for testing.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 20,
        value: 50,
        effectType: 'heal',
        effectValue: 100,
        tags: ['consumable', 'healing', 'test'],
    },

    // ❌ Invalid Items (Missing Required Fields)
    missingName: {
        id: 'noName',
        description: 'Item without a name',
        icon: '❓',
        category: 'material',
        rarity: 'common',
    },

    missingCategory: {
        id: 'noCategory',
        name: 'No Category Item',
        description: 'Item without a category',
        icon: '❓',
        rarity: 'common',
    },

    missingDescription: {
        id: 'noDesc',
        name: 'No Description',
        icon: '❓',
        category: 'material',
        rarity: 'common',
    },

    // ❌ Invalid Category-Specific
    equipmentMissingSlot: {
        id: 'noSlotEquipment',
        name: 'Equipment Without Slot',
        description: 'Equipment item missing required slot field.',
        icon: '🗡️',
        category: 'equipment',
        rarity: 'common',
        // Missing: slot (required for equipment)
    },

    consumableMissingEffect: {
        id: 'noEffectConsumable',
        name: 'Consumable Without Effect',
        description: 'Consumable item missing effect type.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'common',
        // Missing: effectType (required for consumable)
    },

    // ⚠️ Items with Warnings
    deprecatedShield: {
        id: 'oldShield',
        name: 'Old Shield',
        description: 'Shield using deprecated slot value.',
        icon: '🛡️',
        category: 'equipment',
        rarity: 'common',
        slot: 'shield', // Deprecated! Should be 'offhand'
        tier: 'basic',
    },

    invalidRarity: {
        id: 'wrongRarity',
        name: 'Wrong Rarity',
        description: 'Item with invalid rarity value.',
        icon: '❓',
        category: 'material',
        rarity: 'super-rare', // Invalid rarity!
    },

    equipmentNoStats: {
        id: 'weakSword',
        name: 'Weak Sword',
        description: 'Equipment with no combat stats or attributes.',
        icon: '🗡️',
        category: 'equipment',
        rarity: 'common',
        slot: 'weapon',
        tier: 'basic',
        // No combatStats or attributes defined
        tags: ['weapon', 'sword'],
    },

    shortDescription: {
        id: 'shortDesc',
        name: 'Short Description Item',
        description: 'Too short',
        icon: '❓',
        category: 'material',
        rarity: 'common',
    },

    placeholderIcon: {
        id: 'badIcon',
        name: 'Placeholder Icon',
        description: 'Item still using placeholder icon that should be replaced.',
        icon: '❓', // Placeholder icon
        category: 'material',
        rarity: 'common',
    },

    noValue: {
        id: 'noValue',
        name: 'No Value Item',
        description: 'Non-quest/currency item with zero value.',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        value: 0,
    },

    noTags: {
        id: 'noTags',
        name: 'No Tags Item',
        description: 'Item without any tags for searching/filtering.',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        value: 10,
        // No tags array
    },

    stackableEquipment: {
        id: 'stackEquip',
        name: 'Stackable Equipment',
        description: 'Equipment with stackLimit > 1 (unusual).',
        icon: '🗡️',
        category: 'equipment',
        rarity: 'common',
        slot: 'weapon',
        stackLimit: 10, // Warning: equipment should typically be 1
        combatStats: { damage: 10 },
    },

    lowStackMaterial: {
        id: 'lowStack',
        name: 'Low Stack Material',
        description: 'Material with low stackLimit (should be higher).',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        stackLimit: 5, // Warning: materials should typically be 50+
        resourceType: 'ore',
        gatherSkill: 'mining',
    },
};

/**
 * Run validation tests
 */
function testItemValidation() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     ITEM VALIDATOR TEST SUITE         ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Test 1: Validate example items from schema
    console.log('📋 TEST 1: Validating Example Items from Schema\n');
    const exampleResults = ItemValidator.validateAll(EXAMPLE_ITEMS);
    ItemValidator.printSummary(exampleResults);

    // Test 2: Validate test items
    console.log('\n📋 TEST 2: Validating Test Cases\n');
    const testResults = ItemValidator.validateAll(TEST_ITEMS);
    ItemValidator.printSummary(testResults);

    // Test 3: Individual item validation examples
    console.log('\n📋 TEST 3: Individual Item Validation Examples\n');

    // Valid item
    console.log('✅ Testing VALID item:');
    const validResult = ItemValidator.validate(TEST_ITEMS.validSword);
    ItemValidator.printItemReport('validSword', validResult);

    // Invalid item (missing required field)
    console.log('\n❌ Testing INVALID item (missing name):');
    const invalidResult = ItemValidator.validate(TEST_ITEMS.missingName);
    ItemValidator.printItemReport('missingName', invalidResult);

    // Item with warnings
    console.log('\n⚠️  Testing item with WARNINGS:');
    const warningResult = ItemValidator.validate(TEST_ITEMS.deprecatedShield);
    ItemValidator.printItemReport('deprecatedShield', warningResult);

    // Test 4: Summary statistics
    console.log('\n📊 OVERALL STATISTICS\n');
    const totalTests = Object.keys(TEST_ITEMS).length;
    const passed = Object.values(testResults.items).filter(r => r.isValid).length;
    const failed = totalTests - passed;

    console.log(`Total Test Cases: ${totalTests}`);
    console.log(`Passed: ${passed} (${Math.round((passed / totalTests) * 100)}%)`);
    console.log(`Failed: ${failed} (${Math.round((failed / totalTests) * 100)}%)`);
    console.log(`Total Warnings: ${testResults.totalWarnings}`);

    console.log('\n✅ Testing Complete!\n');
}

// Auto-run if executed directly in Node.js
if (typeof require !== 'undefined' && require.main === module) {
    testItemValidation();
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.testItemValidation = testItemValidation;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testItemValidation, TEST_ITEMS };
}
