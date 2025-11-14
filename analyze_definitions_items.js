/**
 * ANALYZE DEFINITIONS.JS ITEMS
 *
 * Analyzes items in definitions.js and compares with unified system.
 * Run this in browser console after loading the game.
 */

console.log('\n╔════════════════════════════════════════╗');
console.log('║   DEFINITIONS.JS ITEM ANALYSIS        ║');
console.log('╚════════════════════════════════════════╝\n');

// Get items from definitions.js
const definitionsItems = GameEngine?.definitions?.items || {};
const definitionsItemIds = Object.keys(definitionsItems);

console.log(`📦 Total items in definitions.js: ${definitionsItemIds.length}`);

// Get items from unified system
const unifiedItemIds = ItemUtils.getAllItemIds();
console.log(`📦 Total items in unified system: ${unifiedItemIds.length}`);

// Find items that exist in both
const overlap = definitionsItemIds.filter(id => unifiedItemIds.includes(id));
console.log(`🔄 Items in both systems: ${overlap.length}`);
if (overlap.length > 0) {
    console.log(`   Examples: ${overlap.slice(0, 5).join(', ')}`);
}

// Find items only in definitions.js (need to migrate)
const onlyInDefinitions = definitionsItemIds.filter(id => !unifiedItemIds.includes(id));
console.log(`➡️  Items only in definitions.js: ${onlyInDefinitions.length}`);
if (onlyInDefinitions.length > 0) {
    console.log(`   Examples: ${onlyInDefinitions.slice(0, 10).join(', ')}`);
}

// Find items only in unified system
const onlyInUnified = unifiedItemIds.filter(id => !definitionsItemIds.includes(id));
console.log(`⬅️  Items only in unified system: ${onlyInUnified.length}`);
if (onlyInUnified.length > 0) {
    console.log(`   Examples: ${onlyInUnified.slice(0, 10).join(', ')}`);
}

// Analyze definitions.js items by category
console.log('\n📊 Definitions.js Items by Category:');
const categoryCounts = {};
definitionsItemIds.forEach(id => {
    const item = definitionsItems[id];
    const category = item.category || 'unknown';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
});

Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
        console.log(`   ${category.padEnd(15)} ${count} items`);
    });

// List items to migrate by category
console.log('\n📋 Items to Migrate (grouped by category):');
const itemsByCategory = {};
onlyInDefinitions.forEach(id => {
    const item = definitionsItems[id];
    const category = item.category || 'unknown';
    if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
    }
    itemsByCategory[category].push(id);
});

Object.entries(itemsByCategory)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([category, items]) => {
        console.log(`\n${category.toUpperCase()} (${items.length} items):`);
        console.log(`   ${items.join(', ')}`);
    });

// Suggest migration strategy
console.log('\n📝 MIGRATION STRATEGY:');
console.log('\n1. OVERLAPPING ITEMS (update definitions.js to use unified):');
console.log(`   ${overlap.length} items can reference ItemRegistry directly`);

console.log('\n2. TOOLS & EQUIPMENT (add to production/equipment):');
const tools = onlyInDefinitions.filter(id => {
    const item = definitionsItems[id];
    return item.category === 'tool';
});
console.log(`   ${tools.length} tools: ${tools.join(', ')}`);

console.log('\n3. MATERIALS (add to production/materials):');
const materials = onlyInDefinitions.filter(id => {
    const item = definitionsItems[id];
    return ['ore', 'fish', 'meat', 'hide', 'feather', 'bone', 'fang', 'pelt', 'forage', 'material'].includes(item.category);
});
console.log(`   ${materials.length} materials`);

console.log('\n4. OTHER CATEGORIES:');
const other = onlyInDefinitions.filter(id => {
    const item = definitionsItems[id];
    return !['tool', 'ore', 'fish', 'meat', 'hide', 'feather', 'bone', 'fang', 'pelt', 'forage', 'material', 'currency'].includes(item.category);
});
console.log(`   ${other.length} other items`);

console.log('\n╔════════════════════════════════════════╗');
console.log('║         ANALYSIS COMPLETE             ║');
console.log('╚════════════════════════════════════════╝\n');
