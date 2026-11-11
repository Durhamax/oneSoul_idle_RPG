/**
 * DUAL-BANK SYSTEM TEST SCRIPT
 *
 * Run this in the browser console after loading the game
 * to verify DualBankSystem functionality
 */

console.group('🧪 DUAL-BANK SYSTEM TESTS');

// Test 1: Initialization
console.group('Test 1: Initialization');
console.log('Bank structure exists:', !!GameEngine.state.bank);
console.log('Stackable storage exists:', !!GameEngine.state.bank.stackable);
console.log('Instanced storage exists:', !!GameEngine.state.bank.instanced);
console.groupEnd();

// Test 2: Add Stackable Items
console.group('Test 2: Add Stackable Items');
const stackableResult1 = DualBankSystem.addStackable('pinewood', 100);
console.log('Added 100x pinewood:', stackableResult1);
const stackableResult2 = DualBankSystem.addStackable('clay', 50);
console.log('Added 50x clay:', stackableResult2);
console.log('Pinewood quantity:', DualBankSystem.getStackableQuantity('pinewood'));
console.log('Clay quantity:', DualBankSystem.getStackableQuantity('clay'));
console.groupEnd();

// Test 3: Remove Stackable Items
console.group('Test 3: Remove Stackable Items');
const removeResult1 = DualBankSystem.removeStackable('pinewood', 30);
console.log('Removed 30x pinewood:', removeResult1);
console.log('Pinewood quantity after removal:', DualBankSystem.getStackableQuantity('pinewood'));
const removeResult2 = DualBankSystem.removeStackable('clay', 100);
console.log('Tried to remove 100x clay (should fail):', removeResult2);
console.groupEnd();

// Test 4: Create Instance
console.group('Test 4: Create Instance');
const rifleInstance = DualBankSystem.createInstance('testRifle', {
    rarity: 'rare'
});
console.log('Created rifle instance:', rifleInstance);
console.groupEnd();

// Test 5: Add Instance
console.group('Test 5: Add Instance');
const addInstanceResult = DualBankSystem.addInstance(rifleInstance);
console.log('Added rifle instance:', addInstanceResult);
console.log('Rifle instances in bank:', DualBankSystem.getInstancesByBaseId('testRifle'));
console.groupEnd();

// Test 6: Create Mod Instance
console.group('Test 6: Create Mod Instance');
const modInstance = DualBankSystem.createInstance('testMuzzle_common', {
    rarity: 'common'
});
console.log('Created mod instance:', modInstance);
const addModResult = DualBankSystem.addInstance(modInstance);
console.log('Added mod instance:', addModResult);
console.groupEnd();

// Test 7: Universal Getters
console.group('Test 7: Universal Getters');
console.log('Get pinewood (stackable):', DualBankSystem.getItem('pinewood'));
console.log('Get rifle instance:', DualBankSystem.getItem(rifleInstance.uniqueId));
console.log('Has 50x pinewood:', DualBankSystem.hasItem('pinewood', 50));
console.log('Has 100x pinewood:', DualBankSystem.hasItem('pinewood', 100));
console.log('Item count - pinewood:', DualBankSystem.getItemCount('pinewood'));
console.log('Item count - testRifle:', DualBankSystem.getItemCount('testRifle'));
console.groupEnd();

// Test 8: Statistics
console.group('Test 8: Statistics');
console.table(DualBankSystem.getStatistics());
console.groupEnd();

// Test 9: Validation
console.group('Test 9: Validation');
const validation = DualBankSystem.validate();
console.log('Bank valid:', validation.valid);
if (!validation.valid) {
    console.log('Issues:', validation.issues);
}
console.groupEnd();

// Test 10: Debug Print
console.group('Test 10: Full Bank Contents');
DualBankSystem.debugPrint();
console.groupEnd();

console.groupEnd(); // End main test group

console.log('✅ All tests complete!');
