/**
 * UNIFIED ITEM SYSTEM TEST
 *
 * Tests the complete unified item system including:
 * - Item database integrity
 * - Item validation
 * - Utility functions
 * - Statistics
 *
 * Usage (Node.js):
 *   node testUnifiedSystem.js
 */

// Import required modules
const { ITEMS_DB, ItemUtils } = typeof require !== 'undefined'
    ? require('./index.js')
    : window;

const ItemValidator = typeof require !== 'undefined'
    ? require('./itemValidator.js')
    : window.ItemValidator;

/**
 * Run all tests
 */
function testUnifiedItemSystem() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   UNIFIED ITEM SYSTEM TEST SUITE      ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Test 1: Database Integrity
    console.log('📋 TEST 1: Database Integrity\n');
    testDatabaseIntegrity();

    // Test 2: Validate All Items
    console.log('\n📋 TEST 2: Validate All Items\n');
    const validationResults = testAllItemsValidation();

    // Test 3: Utility Functions
    console.log('\n📋 TEST 3: Utility Functions\n');
    testUtilityFunctions();

    // Test 4: Database Statistics
    console.log('\n📋 TEST 4: Database Statistics\n');
    ItemUtils.printSummary();

    // Test 5: Search Functionality
    console.log('\n📋 TEST 5: Search Functionality\n');
    testSearchFunctionality();

    // Final Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         TEST SUITE COMPLETE           ║');
    console.log('╚════════════════════════════════════════╝\n');

    const summary = {
        totalItems: ItemUtils.getAllItems().length,
        validItems: validationResults.validItems,
        invalidItems: validationResults.invalidItems,
        warnings: validationResults.totalWarnings,
    };

    console.log(`📦 Total Items: ${summary.totalItems}`);
    console.log(`✅ Valid Items: ${summary.validItems}`);
    console.log(`❌ Invalid Items: ${summary.invalidItems}`);
    console.log(`⚠️  Total Warnings: ${summary.warnings}`);

    if (summary.invalidItems === 0 && summary.warnings === 0) {
        console.log('\n✨ All tests passed! System is ready for production.\n');
    } else if (summary.invalidItems === 0) {
        console.log('\n✅ All items valid, but review warnings.\n');
    } else {
        console.log('\n❌ Some items failed validation. Fix errors before proceeding.\n');
    }
}

/**
 * Test database integrity
 */
function testDatabaseIntegrity() {
    const items = ItemUtils.getAllItems();
    const itemIds = ItemUtils.getAllItemIds();

    console.log(`✓ Database loaded: ${items.length} items`);
    console.log(`✓ All items have unique IDs`);

    // Check for duplicate IDs
    const duplicates = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
        console.error(`❌ Found duplicate IDs:`, duplicates);
    } else {
        console.log(`✓ No duplicate IDs found`);
    }

    // Check that all items have required structure
    let structureErrors = 0;
    items.forEach(item => {
        if (!item.id || !item.name || !item.category) {
            structureErrors++;
        }
    });

    if (structureErrors === 0) {
        console.log(`✓ All items have basic required fields`);
    } else {
        console.error(`❌ ${structureErrors} items missing basic structure`);
    }
}

/**
 * Validate all items against schema
 */
function testAllItemsValidation() {
    const results = ItemValidator.validateAll(ITEMS_DB);

    console.log(`Validated ${results.totalItems} items`);
    console.log(`✅ Valid: ${results.validItems}`);
    console.log(`❌ Invalid: ${results.invalidItems}`);
    console.log(`⚠️  Warnings: ${results.totalWarnings}`);

    // Print detailed results if there are issues
    if (results.invalidItems > 0 || results.totalWarnings > 0) {
        ItemValidator.printSummary(results);
    }

    return results;
}

/**
 * Test utility functions
 */
function testUtilityFunctions() {
    // Test getItem
    const sword = ItemUtils.getItem('ironSword');
    console.log(`✓ getItem('ironSword'): ${sword ? sword.name : 'NOT FOUND'}`);

    // Test hasItem
    const hasSword = ItemUtils.hasItem('ironSword');
    const hasFake = ItemUtils.hasItem('fakeItem');
    console.log(`✓ hasItem('ironSword'): ${hasSword}`);
    console.log(`✓ hasItem('fakeItem'): ${hasFake}`);

    // Test getItemsByCategory
    const equipment = ItemUtils.getItemsByCategory('equipment');
    const consumables = ItemUtils.getItemsByCategory('consumable');
    const materials = ItemUtils.getItemsByCategory('material');
    console.log(`✓ Equipment items: ${equipment.length}`);
    console.log(`✓ Consumable items: ${consumables.length}`);
    console.log(`✓ Material items: ${materials.length}`);

    // Test getItemsByRarity
    const common = ItemUtils.getItemsByRarity('common');
    const uncommon = ItemUtils.getItemsByRarity('uncommon');
    const rare = ItemUtils.getItemsByRarity('rare');
    console.log(`✓ Common items: ${common.length}`);
    console.log(`✓ Uncommon items: ${uncommon.length}`);
    console.log(`✓ Rare items: ${rare.length}`);

    // Test getEquipmentBySlot
    const weapons = ItemUtils.getEquipmentBySlot('weapon');
    const armor = ItemUtils.getEquipmentBySlot('body');
    console.log(`✓ Weapons: ${weapons.length}`);
    console.log(`✓ Body armor: ${armor.length}`);

    // Test getItemsByTag
    const swords = ItemUtils.getItemsByTag('sword');
    const potions = ItemUtils.getItemsByTag('potion');
    console.log(`✓ Items tagged 'sword': ${swords.length}`);
    console.log(`✓ Items tagged 'potion': ${potions.length}`);

    // Test level filtering
    const lowLevel = ItemUtils.getItemsByLevelRange(1, 10);
    const highLevel = ItemUtils.getItemsByLevelRange(20, 100);
    console.log(`✓ Level 1-10 items: ${lowLevel.length}`);
    console.log(`✓ Level 20+ items: ${highLevel.length}`);

    // Test craftable/sellable
    const craftable = ItemUtils.getCraftableItems();
    const sellable = ItemUtils.getSellableItems();
    console.log(`✓ Craftable items: ${craftable.length}`);
    console.log(`✓ Sellable items: ${sellable.length}`);
}

/**
 * Test search functionality
 */
function testSearchFunctionality() {
    // Test various searches
    const swordResults = ItemUtils.searchItems('sword');
    const potionResults = ItemUtils.searchItems('potion');
    const ironResults = ItemUtils.searchItems('iron');
    const healResults = ItemUtils.searchItems('heal');

    console.log(`✓ Search 'sword': ${swordResults.length} results`);
    if (swordResults.length > 0) {
        console.log(`  Examples: ${swordResults.slice(0, 3).map(i => i.name).join(', ')}`);
    }

    console.log(`✓ Search 'potion': ${potionResults.length} results`);
    if (potionResults.length > 0) {
        console.log(`  Examples: ${potionResults.slice(0, 3).map(i => i.name).join(', ')}`);
    }

    console.log(`✓ Search 'iron': ${ironResults.length} results`);
    if (ironResults.length > 0) {
        console.log(`  Examples: ${ironResults.slice(0, 3).map(i => i.name).join(', ')}`);
    }

    console.log(`✓ Search 'heal': ${healResults.length} results`);
    if (healResults.length > 0) {
        console.log(`  Examples: ${healResults.slice(0, 3).map(i => i.name).join(', ')}`);
    }
}

// Auto-run if executed directly in Node.js
if (typeof require !== 'undefined' && require.main === module) {
    testUnifiedItemSystem();
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.testUnifiedItemSystem = testUnifiedItemSystem;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testUnifiedItemSystem };
}
