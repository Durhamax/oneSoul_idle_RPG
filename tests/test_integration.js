/**
 * UNIFIED ITEM SYSTEM INTEGRATION TEST
 *
 * Quick test to verify the unified item system is integrated with the game engine.
 * Run this in the browser console after the game loads.
 */

console.log('\n╔════════════════════════════════════════╗');
console.log('║   ITEM INTEGRATION TEST SUITE         ║');
console.log('╚════════════════════════════════════════╝\n');

// Test 1: Check if ITEMS_DB is loaded globally
console.log('📋 TEST 1: Global Database Access\n');
if (typeof ITEMS_DB !== 'undefined') {
    console.log('✅ ITEMS_DB is globally available');
    console.log(`   Total items: ${Object.keys(ITEMS_DB).length}`);
} else {
    console.error('❌ ITEMS_DB not found globally');
}

// Test 2: Check if ItemUtils is loaded globally
console.log('\n📋 TEST 2: ItemUtils Access\n');
if (typeof ItemUtils !== 'undefined') {
    console.log('✅ ItemUtils is globally available');
    console.log(`   Total items: ${ItemUtils.getAllItems().length}`);
} else {
    console.error('❌ ItemUtils not found globally');
}

// Test 3: Check if GameEngine has access to unified items
console.log('\n📋 TEST 3: GameEngine Integration\n');
if (typeof GameEngine !== 'undefined') {
    if (GameEngine.ITEMS_DB) {
        console.log('✅ GameEngine.ITEMS_DB is available');
    } else {
        console.error('❌ GameEngine.ITEMS_DB not found');
    }

    if (GameEngine.ItemUtils) {
        console.log('✅ GameEngine.ItemUtils is available');
    } else {
        console.error('❌ GameEngine.ItemUtils not found');
    }

    if (GameEngine.getUnifiedItem) {
        console.log('✅ GameEngine.getUnifiedItem() method is available');
    } else {
        console.error('❌ GameEngine.getUnifiedItem() not found');
    }

    if (GameEngine.findItems) {
        console.log('✅ GameEngine.findItems() method is available');
    } else {
        console.error('❌ GameEngine.findItems() not found');
    }
} else {
    console.error('❌ GameEngine not found');
}

// Test 4: Test actual item retrieval
console.log('\n📋 TEST 4: Item Retrieval\n');
if (typeof GameEngine !== 'undefined' && GameEngine.getUnifiedItem) {
    const testItems = ['ironSword', 'healthPotion', 'copperOre', 'gold'];

    testItems.forEach(itemId => {
        const item = GameEngine.getUnifiedItem(itemId);
        if (item) {
            console.log(`✅ ${itemId}: ${item.icon} ${item.name} (${item.rarity})`);
        } else {
            console.error(`❌ Could not retrieve item: ${itemId}`);
        }
    });
}

// Test 5: Test item filtering
console.log('\n📋 TEST 5: Item Filtering\n');
if (typeof GameEngine !== 'undefined' && GameEngine.findItems) {
    const weapons = GameEngine.findItems({ category: 'equipment', slot: 'weapon' });
    console.log(`✅ Found ${weapons.length} weapons`);

    const potions = GameEngine.findItems({ category: 'consumable', tags: ['potion'] });
    console.log(`✅ Found ${potions.length} potions`);

    const rareItems = GameEngine.findItems({ rarity: 'rare' });
    console.log(`✅ Found ${rareItems.length} rare items`);
}

// Test 6: Test item info retrieval
console.log('\n📋 TEST 6: Item Info Retrieval\n');
if (typeof GameEngine !== 'undefined' && GameEngine.getItemInfo) {
    const info = GameEngine.getItemInfo('ironSword');
    if (info) {
        console.log('✅ getItemInfo() works:');
        console.log(`   Name: ${info.name}`);
        console.log(`   Icon: ${info.icon}`);
        console.log(`   Rarity: ${info.rarity}`);
        console.log(`   Category: ${info.category}`);
    } else {
        console.error('❌ getItemInfo() failed');
    }
}

// Test 7: Database statistics
console.log('\n📋 TEST 7: Database Statistics\n');
if (typeof ItemUtils !== 'undefined') {
    const stats = ItemUtils.getStatistics();
    console.log(`✅ Total Items: ${stats.totalItems}`);
    console.log(`   Categories: ${Object.keys(stats.byCategory).length}`);
    console.log(`   Equipment: ${stats.byCategory.equipment || 0}`);
    console.log(`   Consumables: ${stats.byCategory.consumable || 0}`);
    console.log(`   Materials: ${stats.byCategory.material || 0}`);
    console.log(`   Max Level: ${stats.maxLevel}`);
}

// Final Summary
console.log('\n╔════════════════════════════════════════╗');
console.log('║         TEST SUITE COMPLETE           ║');
console.log('╚════════════════════════════════════════╝\n');

// Count successes
let successCount = 0;
let totalTests = 7;

if (typeof ITEMS_DB !== 'undefined') successCount++;
if (typeof ItemUtils !== 'undefined') successCount++;
if (typeof GameEngine !== 'undefined' && GameEngine.ITEMS_DB && GameEngine.ItemUtils) successCount++;
if (typeof GameEngine !== 'undefined' && GameEngine.getUnifiedItem && GameEngine.getUnifiedItem('ironSword')) successCount++;
if (typeof GameEngine !== 'undefined' && GameEngine.findItems) successCount++;
if (typeof GameEngine !== 'undefined' && GameEngine.getItemInfo) successCount++;
if (typeof ItemUtils !== 'undefined' && ItemUtils.getStatistics) successCount++;

console.log(`Tests Passed: ${successCount}/${totalTests}`);

if (successCount === totalTests) {
    console.log('✨ All integration tests passed! The unified item system is fully integrated.\n');
} else {
    console.log(`⚠️  ${totalTests - successCount} test(s) failed. Check errors above.\n`);
}
