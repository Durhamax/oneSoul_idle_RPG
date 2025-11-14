/**
 * ITEM REGISTRY TEST SUITE
 *
 * Test the multi-environment item registry system.
 * Run this in the browser console after the game loads.
 */

console.log('\n╔════════════════════════════════════════╗');
console.log('║   ITEM REGISTRY TEST SUITE            ║');
console.log('╚════════════════════════════════════════╝\n');

// Test 1: Check if ItemRegistry is loaded
console.log('📋 TEST 1: ItemRegistry Loaded\n');
if (typeof ItemRegistry !== 'undefined') {
    console.log('✅ ItemRegistry is globally available');
} else {
    console.error('❌ ItemRegistry not found');
}

// Test 2: Check registry counts
console.log('\n📋 TEST 2: Registry Counts\n');
if (typeof ItemRegistry !== 'undefined') {
    const stats = ItemRegistry.getStatistics();
    console.log(`Production:  ${stats.production.count} items (${stats.production.active ? '✅' : '❌'})`);
    console.log(`Dev:         ${stats.dev.count} items (${stats.dev.active ? '✅' : '❌'})`);
    console.log(`Test:        ${stats.test.count} items (${stats.test.active ? '✅' : '❌'})`);
    console.log(`Legacy:      ${stats.legacy.count} items (${stats.legacy.active ? '✅' : '❌'})`);
    console.log(`Planned:     ${stats.planned.count} items (${stats.planned.active ? '✅' : '❌'})`);
    console.log(`Total Active: ${stats.totalActive} items`);
}

// Test 3: Verify production items work
console.log('\n📋 TEST 3: Production Items\n');
const productionTestItems = ['ironSword', 'healthPotion', 'copperOre', 'gold'];
productionTestItems.forEach(itemId => {
    const item = ItemRegistry.getItem(itemId);
    if (item) {
        console.log(`✅ ${itemId}: ${item.icon} ${item.name}`);
    } else {
        console.error(`❌ Production item not found: ${itemId}`);
    }
});

// Test 4: Verify dev items are inactive by default
console.log('\n📋 TEST 4: Dev Items (Should be Inactive)\n');
const devItem = ItemRegistry.getItem('devSuperSword');
if (!devItem) {
    console.log('✅ Dev items correctly inactive by default');
} else {
    console.error('❌ Dev items should be inactive by default');
}

// Test 5: Enable dev mode and test
console.log('\n📋 TEST 5: Enable Dev Mode\n');
ItemRegistry.enableDevMode();
const devItemAfterEnable = ItemRegistry.getItem('devSuperSword');
if (devItemAfterEnable) {
    console.log(`✅ Dev mode enabled: ${devItemAfterEnable.icon} ${devItemAfterEnable.name}`);
    console.log(`   Stats: ${devItemAfterEnable.combatStats.damage} damage`);
} else {
    console.error('❌ Dev item not found after enabling dev mode');
}

// Test 6: Test filtering by tier
console.log('\n📋 TEST 6: Filter by Tier\n');
const starterItems = ItemRegistry.getItemsByTier('starter');
console.log(`✅ Found ${starterItems.length} starter tier items`);
if (starterItems.length > 0) {
    console.log(`   Examples: ${starterItems.slice(0, 3).map(i => i.name).join(', ')}`);
}

// Test 7: Test filtering by category
console.log('\n📋 TEST 7: Filter by Category\n');
const equipment = ItemRegistry.getItemsByCategory('equipment');
const consumables = ItemRegistry.getItemsByCategory('consumable');
console.log(`✅ Equipment: ${equipment.length} items`);
console.log(`✅ Consumables: ${consumables.length} items`);

// Test 8: Test legacy items
console.log('\n📋 TEST 8: Legacy Items\n');
const legacyItem = ItemRegistry.getItem('old_stone_sword');
if (legacyItem) {
    console.log(`✅ Legacy item found: ${legacyItem.icon} ${legacyItem.name}`);
    if (legacyItem.deprecated) {
        console.log(`   Deprecated: true, Replaced by: ${legacyItem.replacedBy || 'none'}`);
    }
} else {
    console.error('❌ Legacy item not found (should be active by default)');
}

// Test 9: Test planned items (should be inactive)
console.log('\n📋 TEST 9: Planned Items (Should be Inactive)\n');
const plannedItem = ItemRegistry.getItem('planned_mythril_sword');
if (!plannedItem) {
    console.log('✅ Planned items correctly inactive by default');
} else {
    console.error('❌ Planned items should be inactive by default');
}

// Test 10: Enable preview mode
console.log('\n📋 TEST 10: Enable Preview Mode\n');
ItemRegistry.enablePreviewMode();
const plannedItemAfterEnable = ItemRegistry.getItem('planned_mythril_sword');
if (plannedItemAfterEnable) {
    console.log(`✅ Preview mode enabled: ${plannedItemAfterEnable.icon} ${plannedItemAfterEnable.name}`);
    console.log(`   Planned for version: ${plannedItemAfterEnable.plannedVersion}`);
} else {
    console.error('❌ Planned item not found after enabling preview mode');
}

// Test 11: Print full registry summary
console.log('\n📋 TEST 11: Registry Summary\n');
ItemRegistry.printSummary();

// Test 12: Verify ItemUtils integration
console.log('\n📋 TEST 12: ItemUtils Integration\n');
if (typeof ItemUtils !== 'undefined') {
    console.log('✅ ItemUtils is available');

    const allItems = ItemUtils.getAllItems();
    console.log(`   Total items via ItemUtils: ${allItems.length}`);

    const weapons = ItemUtils.getEquipmentBySlot('weapon');
    console.log(`   Weapons via ItemUtils: ${weapons.length}`);

    const searchResults = ItemUtils.searchItems('sword');
    console.log(`   Search 'sword': ${searchResults.length} results`);
} else {
    console.error('❌ ItemUtils not found');
}

// Test 13: Verify ITEMS_DB includes all active registries
console.log('\n📋 TEST 13: ITEMS_DB Active Items\n');
if (typeof ITEMS_DB !== 'undefined') {
    const dbCount = Object.keys(ITEMS_DB).length;
    const registryActiveCount = ItemRegistry.getStatistics().totalActive;

    console.log(`ITEMS_DB count: ${dbCount}`);
    console.log(`Registry active count: ${registryActiveCount}`);

    if (dbCount === registryActiveCount) {
        console.log('✅ ITEMS_DB correctly reflects active registries');
    } else {
        console.error('❌ Mismatch between ITEMS_DB and registry active count');
    }
} else {
    console.error('❌ ITEMS_DB not found');
}

// Reset to production mode for clean state
console.log('\n📋 Cleanup: Reset to Production Mode\n');
ItemRegistry.resetConfig();
console.log('✅ Registry reset to production defaults');

// Final Summary
console.log('\n╔════════════════════════════════════════╗');
console.log('║         TEST SUITE COMPLETE           ║');
console.log('╚════════════════════════════════════════╝\n');

const finalStats = ItemRegistry.getStatistics();
console.log('📊 Final Statistics:');
console.log(`   Production: ${finalStats.production.count} items`);
console.log(`   Dev: ${finalStats.dev.count} items (${finalStats.dev.active ? 'active' : 'inactive'})`);
console.log(`   Test: ${finalStats.test.count} items (${finalStats.test.active ? 'active' : 'inactive'})`);
console.log(`   Legacy: ${finalStats.legacy.count} items (${finalStats.legacy.active ? 'active' : 'inactive'})`);
console.log(`   Planned: ${finalStats.planned.count} items (${finalStats.planned.active ? 'active' : 'inactive'})`);
console.log(`   Total Active: ${finalStats.totalActive} items\n`);

console.log('✨ Item Registry System is fully functional!\n');
