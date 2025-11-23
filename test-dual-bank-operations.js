// TEST DUAL-BANK OPERATIONS
// Run this in console to verify all bank operations work correctly

console.group('🧪 DUAL-BANK OPERATIONS TEST');

// Test 1: Add stackable item
console.group('Test 1: Add Stackable Item (pinewood)');
const addResult1 = GameEngine.addItemToBank('pinewood', 100);
console.log('Result:', addResult1);
console.log('Count:', GameEngine.getItemCount('pinewood'));
console.log('In stackable storage:', GameEngine.state.bank.stackable['pinewood']);
console.groupEnd();

// Test 2: Remove stackable item
console.group('Test 2: Remove Stackable Item (pinewood)');
const removeResult1 = GameEngine.removeItemFromBank('pinewood', 50);
console.log('Result:', removeResult1);
console.log('Count:', GameEngine.getItemCount('pinewood'));
console.log('In stackable storage:', GameEngine.state.bank.stackable['pinewood']);
console.groupEnd();

// Test 3: Create equipment instance
console.group('Test 3: Add Equipment Instance (testRifle)');
const instance = {
    instanceId: 'testRifle_instance_' + Date.now() + '_test',
    baseItemId: 'testRifle',
    name: 'Test Rifle',
    rarity: 'common',
    attachments: [],
    durability: 100,
    maxDurability: 100
};
const addInstanceResult = GameEngine.addEquipmentInstance(instance);
console.log('Result:', addInstanceResult);
console.log('Instance in storage:', GameEngine.state.bank.instanced[instance.instanceId]);
console.log('Get instance:', GameEngine.getEquipmentInstance(instance.instanceId));
console.groupEnd();

// Test 4: Get items in tab
console.group('Test 4: Get Items in Resource Tab');
const resourceItems = GameEngine.getItemsInTab('resource');
console.log('Resource items:', resourceItems);
console.table(resourceItems.map(item => ({
    itemId: item.itemId,
    quantity: item.quantity,
    isInstance: !!item.instance
})));
console.groupEnd();

// Test 5: Get all equipment instances
console.group('Test 5: Get All Equipment Instances');
const allInstances = GameEngine.getAllEquipmentInstances();
console.log('All instances:', allInstances);
console.table(allInstances.map(inst => ({
    instanceId: inst.instanceId,
    baseItemId: inst.baseItemId,
    rarity: inst.rarity
})));
console.groupEnd();

// Test 6: Remove equipment instance
console.group('Test 6: Remove Equipment Instance');
const removeInstanceResult = GameEngine.removeEquipmentInstance(instance.instanceId);
console.log('Result:', removeInstanceResult);
console.log('Instance still in storage:', GameEngine.state.bank.instanced[instance.instanceId]);
console.groupEnd();

// Test 7: Verify dual-bank structure
console.group('Test 7: Verify Dual-Bank Structure');
console.log('Stackable storage:', GameEngine.state.bank.stackable);
console.log('Instanced storage:', GameEngine.state.bank.instanced);
console.log('Total stackable types:', Object.keys(GameEngine.state.bank.stackable || {}).length);
console.log('Total instanced items:', Object.keys(GameEngine.state.bank.instanced || {}).length);
console.groupEnd();

// Test 8: Attempt to add instanced item via addItemToBank (should fail gracefully)
console.group('Test 8: Attempt to Add Instanced Item via addItemToBank');
const addInstancedResult = GameEngine.addItemToBank('testRifle', 1);
console.log('Result (should fail):', addInstancedResult);
console.groupEnd();

console.log('✅ All tests complete!');
console.groupEnd();
