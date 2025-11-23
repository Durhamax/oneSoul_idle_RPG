// VERIFY MIGRATION SUCCESS
// Run this after page reload to check if migration worked correctly

console.group('✅ DUAL-BANK MIGRATION VERIFICATION');

// Check 1: Migration flag set?
console.group('1️⃣ Migration Flag');
const migrationFlag = GameEngine.state.migrations?.migrateDualBankStructure;
console.log('Migration completed:', migrationFlag ? '✅ YES' : '❌ NO');
if (!migrationFlag) {
    console.warn('⚠️ Migration has not run yet or flag not set!');
}
console.groupEnd();

// Check 2: Dual-bank structures exist?
console.group('2️⃣ Dual-Bank Structures');
const hasStackable = typeof GameEngine.state.bank.stackable === 'object';
const hasInstanced = typeof GameEngine.state.bank.instanced === 'object';
console.log('bank.stackable exists:', hasStackable ? '✅ YES' : '❌ NO');
console.log('bank.instanced exists:', hasInstanced ? '✅ YES' : '❌ NO');

if (!hasStackable || !hasInstanced) {
    console.error('❌ Dual-bank structures missing! Migration may have failed.');
}
console.groupEnd();

// Check 3: Items migrated?
console.group('3️⃣ Items Migrated');
const stackableCount = Object.keys(GameEngine.state.bank.stackable || {}).length;
const instancedCount = Object.keys(GameEngine.state.bank.instanced || {}).length;
const oldItemsCount = Object.keys(GameEngine.state.bank.items || {}).length;

console.log('Stackable items:', stackableCount);
console.log('Instanced items:', instancedCount);
console.log('Old bank.items:', oldItemsCount, '(still kept for backward compatibility)');

const totalMigrated = stackableCount + instancedCount;
console.log('Total migrated:', totalMigrated);

if (totalMigrated === 0) {
    console.warn('⚠️ No items migrated! Check if you have items to migrate.');
} else {
    console.log(`✅ ${totalMigrated} items successfully migrated!`);
}
console.groupEnd();

// Check 4: Sample stackable item
console.group('4️⃣ Sample Stackable Item');
const sampleStackable = Object.keys(GameEngine.state.bank.stackable || {})[0];
if (sampleStackable) {
    console.log('Item ID:', sampleStackable);
    console.log('Quantity:', GameEngine.state.bank.stackable[sampleStackable]);
    console.log('Type:', typeof GameEngine.state.bank.stackable[sampleStackable]);

    if (typeof GameEngine.state.bank.stackable[sampleStackable] === 'number') {
        console.log('✅ Correct: Stackable items stored as numbers');
    } else {
        console.error('❌ Wrong: Stackable items should be numbers!');
    }
} else {
    console.log('No stackable items found');
}
console.groupEnd();

// Check 5: Sample instanced item
console.group('5️⃣ Sample Instanced Item');
const sampleInstanced = Object.keys(GameEngine.state.bank.instanced || {})[0];
if (sampleInstanced) {
    console.log('Instance ID:', sampleInstanced);
    console.log('Instance data:', GameEngine.state.bank.instanced[sampleInstanced]);

    const instance = GameEngine.state.bank.instanced[sampleInstanced];
    const hasRequiredFields = instance.instanceId && instance.baseItemId;

    if (hasRequiredFields) {
        console.log('✅ Correct: Instance has required fields');
    } else {
        console.error('❌ Wrong: Instance missing required fields!');
    }

    console.table({
        instanceId: instance.instanceId,
        baseItemId: instance.baseItemId,
        rarity: instance.rarity,
        hasAttachments: Array.isArray(instance.attachments)
    });
} else {
    console.log('No instanced items found');
}
console.groupEnd();

// Check 6: UI can read items?
console.group('6️⃣ UI Can Read Items');
try {
    const resourceItems = GameEngine.getItemsInTab('resource');
    const weaponItems = GameEngine.getItemsInTab('weapon');
    const armorItems = GameEngine.getItemsInTab('armor');

    console.log('Resource tab items:', resourceItems.length);
    console.log('Weapon tab items:', weaponItems.length);
    console.log('Armor tab items:', armorItems.length);

    if (resourceItems.length > 0 || weaponItems.length > 0 || armorItems.length > 0) {
        console.log('✅ UI can successfully read items from dual-bank');
    } else {
        console.warn('⚠️ No items returned by getItemsInTab()');
    }
} catch (error) {
    console.error('❌ Error reading items:', error.message);
}
console.groupEnd();

// Check 7: Backup created?
console.group('7️⃣ Backup Created');
const hasBackup = GameEngine.state.bank.items_backup;
if (hasBackup) {
    const backupCount = Object.keys(hasBackup).length;
    console.log('✅ Backup created with', backupCount, 'items');
} else {
    console.log('⚠️ No backup found (might be first run with dual-bank)');
}
console.groupEnd();

// Final verdict
console.group('🎯 FINAL VERDICT');
const checks = {
    migrationFlag: migrationFlag,
    structuresExist: hasStackable && hasInstanced,
    itemsMigrated: totalMigrated > 0,
    stackableCorrectType: sampleStackable ? typeof GameEngine.state.bank.stackable[sampleStackable] === 'number' : true,
    instancedCorrectType: sampleInstanced ? !!(GameEngine.state.bank.instanced[sampleInstanced]?.instanceId) : true
};

const passedChecks = Object.values(checks).filter(v => v).length;
const totalChecks = Object.values(checks).length;

console.log('Passed checks:', passedChecks, '/', totalChecks);

if (passedChecks === totalChecks) {
    console.log('%c✅ MIGRATION SUCCESSFUL! 🎉', 'color: #4caf50; font-size: 16px; font-weight: bold;');
    console.log('All systems are ready. You can now use the dual-bank inventory system!');
} else {
    console.log('%c⚠️ MIGRATION INCOMPLETE', 'color: #ff9800; font-size: 16px; font-weight: bold;');
    console.log('Some checks failed. Review the details above.');
}

console.table(checks);
console.groupEnd();

console.groupEnd();

// Return summary for easy access
({
    success: passedChecks === totalChecks,
    passedChecks: passedChecks,
    totalChecks: totalChecks,
    stackableItems: stackableCount,
    instancedItems: instancedCount,
    totalItems: totalMigrated
});
