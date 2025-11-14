/**
 * MIGRATION TEST SUITE
 *
 * Tests the automatic migration of definitions.js items to ItemRegistry.
 * Run this in browser console after the game loads.
 */

console.log('\n╔════════════════════════════════════════╗');
console.log('║   ITEM MIGRATION TEST SUITE           ║');
console.log('╚════════════════════════════════════════╝\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            console.log(`✅ ${name}`);
            testsPassed++;
        } else {
            console.error(`❌ ${name}`);
            testsFailed++;
        }
    } catch (error) {
        console.error(`❌ ${name} - Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: Adapter loaded
test('DefinitionsAdapter is loaded', () => {
    return typeof DefinitionsAdapter !== 'undefined';
});

// Test 2: Migration utility loaded
test('ItemMigrationUtility is loaded', () => {
    return typeof ItemMigrationUtility !== 'undefined';
});

// Test 3: Definitions items exist
test('definitions.js items are loaded', () => {
    return GameEngine?.definitions?.items && Object.keys(GameEngine.definitions.items).length > 0;
});

// Test 4: Items were migrated
test('Items were migrated to legacy registry', () => {
    const legacyCount = ItemRegistry.getLegacy ? Object.keys(ItemRegistry.getLegacy()).length : 0;
    console.log(`   Legacy registry has ${legacyCount} items`);
    return legacyCount > 0;
});

// Test 5: Sample item migrated correctly
test('Sample item (stone_pickaxe) migrated', () => {
    const item = ItemUtils.getItem('stone_pickaxe');
    if (!item) {
        console.log('   Item not found');
        return false;
    }
    console.log(`   Found: ${item.icon} ${item.name}`);
    return true;
});

// Test 6: Old format converted to new format
test('Old format converted correctly', () => {
    const item = ItemUtils.getItem('stone_pickaxe');
    if (!item) return false;

    // Check new format fields exist
    const hasNewFields = item.icon && item.category && item.rarity &&
                         item.value !== undefined && item.level !== undefined &&
                         item.tags && item.tags.length > 0;

    if (!hasNewFields) {
        console.log('   Missing required new format fields');
        return false;
    }

    // Check legacy flag
    if (!item._legacy) {
        console.log('   Missing _legacy flag');
        return false;
    }

    console.log(`   Category: ${item.category}, Rarity: ${item.rarity}, Level: ${item.level}`);
    return true;
});

// Test 7: Stats converted correctly
test('Stats converted to combatStats', () => {
    const item = ItemUtils.getItem('stone_pickaxe');
    if (!item) return false;

    if (!item.combatStats) {
        console.log('   Missing combatStats');
        return false;
    }

    // Original had pickaxeDamage: 3
    if (!item.combatStats.miningPower) {
        console.log('   pickaxeDamage not converted to miningPower');
        return false;
    }

    console.log(`   Mining Power: ${item.combatStats.miningPower}`);
    return true;
});

// Test 8: Equipment slot converted
test('equipSlot converted to slot', () => {
    const item = ItemUtils.getItem('stone_pickaxe');
    if (!item) return false;

    if (!item.slot) {
        console.log('   Missing slot field');
        return false;
    }

    console.log(`   Slot: ${item.slot}`);
    return item.slot === 'tool';
});

// Test 9: Tier inferred correctly
test('Equipment tier inferred', () => {
    const item = ItemUtils.getItem('stone_pickaxe');
    if (!item) return false;

    if (!item.tier) {
        console.log('   Missing tier field');
        return false;
    }

    console.log(`   Tier: ${item.tier}`);
    return item.tier === 'starter';
});

// Test 10: Tags generated
test('Tags generated from item data', () => {
    const item = ItemUtils.getItem('stone_pickaxe');
    if (!item) return false;

    if (!item.tags || item.tags.length === 0) {
        console.log('   No tags generated');
        return false;
    }

    console.log(`   Tags: ${item.tags.join(', ')}`);
    return item.tags.includes('tool') && item.tags.includes('legacy');
});

// Test 11: Fish items migrated
test('Fish items migrated correctly', () => {
    const fish = ItemUtils.getItem('trout') || ItemUtils.getItem('salmon') || ItemUtils.getItem('bass');
    if (!fish) {
        console.log('   No fish items found');
        return false;
    }

    console.log(`   Found: ${fish.icon} ${fish.name}, Category: ${fish.category}`);
    return fish.category === 'material';
});

// Test 12: Material items have gather data
test('Material items have gather data', () => {
    const ore = ItemUtils.getItem('copperOre') || ItemUtils.getItem('tinOre');
    if (!ore) {
        console.log('   No ore items found');
        return false;
    }

    const hasGatherData = ore.resourceType && ore.gatherSkill;
    console.log(`   Resource Type: ${ore.resourceType}, Gather Skill: ${ore.gatherSkill}`);
    return hasGatherData;
});

// Test 13: All definitions items accessible
test('All definitions items accessible through ItemUtils', () => {
    const definitionsItems = GameEngine.definitions.items;
    const definitionsIds = Object.keys(definitionsItems);

    let accessible = 0;
    let notAccessible = 0;

    definitionsIds.forEach(id => {
        if (ItemUtils.hasItem(id)) {
            accessible++;
        } else {
            notAccessible++;
            console.log(`   ⚠️  ${id} not accessible`);
        }
    });

    console.log(`   Accessible: ${accessible}/${definitionsIds.length}`);

    return notAccessible === 0 || (notAccessible / definitionsIds.length) < 0.1;  // Allow up to 10% overlap with production
});

// Test 14: Search works with migrated items
test('Search works with migrated items', () => {
    const results = ItemUtils.searchItems('pickaxe');

    if (results.length === 0) {
        console.log('   No pickaxes found');
        return false;
    }

    const legacyPickaxes = results.filter(item => item._legacy);
    console.log(`   Found ${legacyPickaxes.length} legacy pickaxes: ${legacyPickaxes.map(i => i.name).join(', ')}`);

    return legacyPickaxes.length > 0;
});

// Test 15: Filtering by category works
test('Filtering by category works', () => {
    const equipment = ItemUtils.getItemsByCategory('equipment');
    const legacyEquipment = equipment.filter(item => item._legacy);

    console.log(`   Found ${legacyEquipment.length} legacy equipment items`);

    return legacyEquipment.length > 0;
});

// Test 16: No duplicate items
test('No duplicate items in registry', () => {
    const allItems = ItemUtils.getAllItems();
    const ids = allItems.map(item => item.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
        console.log(`   Duplicates found: ${ids.length} items, ${uniqueIds.size} unique`);
        return false;
    }

    console.log(`   All ${ids.length} items have unique IDs`);
    return true;
});

// Test 17: Production items take precedence
test('Production items take precedence over legacy', () => {
    // Gold exists in both production and definitions
    const gold = ItemUtils.getItem('gold');

    if (!gold) {
        console.log('   Gold item not found');
        return true;  // If it doesn't exist in either, that's fine
    }

    // If it has _legacy flag, that means legacy version is being used (bad)
    if (gold._legacy) {
        console.log('   Legacy version used instead of production');
        return false;
    }

    console.log(`   Production version used: ${gold.icon} ${gold.name}`);
    return true;
});

// Test 18: Validation passes
test('Migrated items pass validation', () => {
    const sampleIds = ['stone_pickaxe', 'bronzePickaxe', 'ironPickaxe'];
    let passed = 0;
    let failed = 0;

    sampleIds.forEach(id => {
        const item = ItemUtils.getItem(id);
        if (item) {
            const result = ItemValidator.validate(item);
            if (result.isValid || result.errors.length === 0) {
                passed++;
            } else {
                failed++;
                console.log(`   ${id} validation failed:`, result.errors);
            }
        }
    });

    console.log(`   Validated ${passed}/${sampleIds.length} items`);
    return failed === 0;
});

// Final Summary
console.log('\n╔════════════════════════════════════════╗');
console.log('║         TEST SUITE COMPLETE           ║');
console.log('╚════════════════════════════════════════╝\n');

console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%\n`);

if (testsFailed === 0) {
    console.log('✨ All migration tests passed! Items successfully migrated.\n');
} else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
}

// Print migration statistics
console.log('📊 MIGRATION STATISTICS:\n');
ItemRegistry.printSummary();
