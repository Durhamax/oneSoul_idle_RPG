// SPECIFIC DUAL-BANK SCENARIO TESTS
// Run these to verify the specific scenarios mentioned

console.group('🧪 SPECIFIC DUAL-BANK SCENARIO TESTS');

// ========================================
// Scenario 1: Creating a new weapon instance with attachments
// ========================================
console.group('1️⃣ Create Weapon Instance (testRifle, rare)');

// Check if createWeaponInstance exists
if (typeof GameEngine.createWeaponInstance === 'function') {
    console.log('✅ createWeaponInstance function exists');

    // Create a weapon instance
    const weaponInstance = GameEngine.createWeaponInstance('testRifle');

    if (weaponInstance) {
        console.log('✅ Weapon instance created:', weaponInstance.instanceId);
        console.log('Instance data:', weaponInstance);

        // Add it to the bank using the correct method
        const addResult = GameEngine.addEquipmentInstance(weaponInstance);
        console.log('Add to bank result:', addResult);

        if (addResult.success) {
            console.log('✅ Weapon instance added to dual-bank');
            console.log('In instanced storage:', GameEngine.state.bank.instanced[weaponInstance.instanceId]);

            // Save for later tests
            window.testWeaponInstanceId = weaponInstance.instanceId;
        } else {
            console.error('❌ Failed to add weapon instance to bank:', addResult.reason);
        }
    } else {
        console.error('❌ Failed to create weapon instance');
    }
} else {
    console.error('❌ createWeaponInstance function not found on GameEngine');
    console.log('Available attachment functions:', Object.keys(GameEngine).filter(k => k.includes('ttachment') || k.includes('eapon')));
}

console.groupEnd();

// ========================================
// Scenario 2: Attaching a mod to weapon
// ========================================
console.group('2️⃣ Attach Mod to Weapon Instance');

if (window.testWeaponInstanceId) {
    console.log('Testing with weapon instance:', window.testWeaponInstanceId);

    // First, we need a mod in the bank
    // Check if we have testBarrel (a mod/attachment item)
    const testBarrelCount = GameEngine.getItemCount('testBarrel');
    console.log('testBarrel in bank:', testBarrelCount);

    if (testBarrelCount === 0) {
        console.log('Adding testBarrel to bank...');
        GameEngine.addItemToBank('testBarrel', 1);
    }

    // Check if modifyWeaponAttachments exists
    if (typeof GameEngine.modifyWeaponAttachments === 'function') {
        console.log('✅ modifyWeaponAttachments function exists');

        // Try to attach testBarrel to the muzzle slot
        const attachResult = GameEngine.modifyWeaponAttachments(
            window.testWeaponInstanceId,
            'muzzle',
            'testBarrel'
        );

        console.log('Attach result:', attachResult);

        if (attachResult.success) {
            console.log('✅ Mod attached successfully');

            // Check the weapon instance
            const weapon = GameEngine.getEquipmentInstance(window.testWeaponInstanceId);
            console.log('Weapon attachments:', weapon?.attachments);
        } else {
            console.error('❌ Failed to attach mod:', attachResult.reason);
        }
    } else {
        console.error('❌ modifyWeaponAttachments function not found');
    }
} else {
    console.warn('⚠️ No weapon instance from previous test - skipping');
}

console.groupEnd();

// ========================================
// Scenario 3: Removing a mod (should return to bank)
// ========================================
console.group('3️⃣ Remove Mod from Weapon Instance');

if (window.testWeaponInstanceId) {
    console.log('Testing with weapon instance:', window.testWeaponInstanceId);

    // Check if weapon has mods attached
    const weapon = GameEngine.getEquipmentInstance(window.testWeaponInstanceId);
    console.log('Current attachments:', weapon?.attachments);

    if (typeof GameEngine.modifyWeaponAttachments === 'function') {
        // Remove the muzzle attachment (set to null)
        const removeResult = GameEngine.modifyWeaponAttachments(
            window.testWeaponInstanceId,
            'muzzle',
            null  // null = remove
        );

        console.log('Remove result:', removeResult);

        if (removeResult.success) {
            console.log('✅ Mod removed successfully');

            // Check that mod returned to bank
            const testBarrelCount = GameEngine.getItemCount('testBarrel');
            console.log('testBarrel now in bank:', testBarrelCount);

            if (testBarrelCount > 0) {
                console.log('✅ Mod returned to bank (stackable storage)');
            } else {
                console.warn('⚠️ Mod not found in bank after removal');
            }
        } else {
            console.error('❌ Failed to remove mod:', removeResult.reason);
        }
    }
} else {
    console.warn('⚠️ No weapon instance from previous test - skipping');
}

console.groupEnd();

// ========================================
// Scenario 4: Gathering resources (should go to stackable)
// ========================================
console.group('4️⃣ Gather Resources (Stackable Storage)');

console.log('Adding iron_ore (100 units)...');

// Check if iron_ore exists in registry
const ironOreDef = ItemRegistry?.getItem('iron_ore') || ItemRegistry?.getItem('ironOre');
const itemId = ironOreDef ? ironOreDef.id : 'pinewood'; // Fallback to pinewood if iron_ore not found

console.log('Using item ID:', itemId);

const beforeCount = GameEngine.getItemCount(itemId);
console.log('Before:', beforeCount);

const addResult = GameEngine.addItemToBank(itemId, 100);
console.log('Add result:', addResult);

if (addResult.success) {
    console.log('✅ Resource added successfully');

    const afterCount = GameEngine.getItemCount(itemId);
    console.log('After:', afterCount);
    console.log('Increase:', afterCount - beforeCount);

    // Verify it's in stackable storage
    const inStackable = GameEngine.state.bank.stackable[itemId];
    console.log('In stackable storage:', inStackable);

    if (typeof inStackable === 'number') {
        console.log('✅ Correctly stored as number in stackable storage');
    } else {
        console.error('❌ Not stored as number in stackable storage');
    }
} else {
    console.error('❌ Failed to add resource:', addResult.reason);
}

console.groupEnd();

// ========================================
// Scenario 5: Crafting equipment (should create instance)
// ========================================
console.group('5️⃣ Craft Equipment (Instance Creation)');

// Check what recipes are available
console.log('Checking available recipes...');

if (typeof GameEngine.getAvailableRecipes === 'function') {
    const recipes = GameEngine.getAvailableRecipes();
    console.log('Total recipes:', recipes.length);

    // Find equipment recipes
    const equipmentRecipes = recipes.filter(r => {
        const outputItemId = r.recipe.outputs?.[0]?.itemId;
        if (!outputItemId) return false;

        const outputItem = ItemRegistry?.getItem(outputItemId);
        return outputItem?.instanced === true;
    });

    console.log('Equipment recipes (instanced):', equipmentRecipes.length);

    if (equipmentRecipes.length > 0) {
        const testRecipe = equipmentRecipes[0];
        console.log('Testing with recipe:', testRecipe.recipeId);
        console.log('Recipe:', testRecipe.recipe);

        // Check if we can craft it
        console.log('Can craft:', testRecipe.canCraft);

        if (!testRecipe.canCraft) {
            console.log('Reason:', testRecipe.reason);
            console.log('Adding required materials for testing...');

            // Add materials
            for (let input of testRecipe.recipe.inputs) {
                GameEngine.addItemToBank(input.itemId, input.amount * 2); // 2x for safety
            }

            console.log('Materials added, checking again...');
            const canCraftNow = GameEngine.canCraft(testRecipe.recipeId);
            console.log('Can craft now:', canCraftNow);
        }

        // Try to craft
        console.log('Starting craft...');
        const craftResult = GameEngine.startCraft(testRecipe.recipeId);
        console.log('Craft result:', craftResult);

        if (craftResult.success) {
            console.log('✅ Craft started');
            console.log('Active crafts:', GameEngine.state.crafting.activeCrafts);

            // Complete the craft instantly for testing
            if (GameEngine.state.crafting.activeCrafts.length > 0) {
                console.log('Completing craft instantly (for testing)...');

                // Force completion time to now
                GameEngine.state.crafting.activeCrafts[0].completionTime = Date.now() - 1000;

                // Complete the craft
                GameEngine.completeCraft(0);

                // Check if instance was created
                const outputItemId = testRecipe.recipe.outputs[0].itemId;
                console.log('Checking for instances of:', outputItemId);

                const instances = GameEngine.getAllEquipmentInstances(outputItemId);
                console.log('Instances found:', instances.length);

                if (instances.length > 0) {
                    console.log('✅ Equipment instance created by crafting!');
                    console.table(instances.map(i => ({
                        id: i.instanceId,
                        rarity: i.rarity,
                        inDualBank: !!GameEngine.state.bank.instanced[i.instanceId]
                    })));
                } else {
                    console.warn('⚠️ No instances found after crafting');
                }
            }
        } else {
            console.error('❌ Failed to start craft:', craftResult.reason);
        }
    } else {
        console.warn('⚠️ No equipment recipes found to test');
        console.log('Trying manual instance creation instead...');

        // Manual test: create an equipment instance
        if (typeof GameEngine.createEquipmentInstance === 'function') {
            const testItem = 'testRifle'; // Known instanced item
            const instance = GameEngine.createEquipmentInstance(testItem, 'rare', {});
            console.log('Manual instance created:', instance);

            if (instance) {
                const addResult = GameEngine.addEquipmentInstance(instance);
                console.log('Add result:', addResult);

                if (addResult.success) {
                    console.log('✅ Manual equipment instance created and added');
                } else {
                    console.error('❌ Failed to add instance:', addResult.reason);
                }
            }
        } else {
            console.error('❌ createEquipmentInstance not available');
        }
    }
} else {
    console.error('❌ getAvailableRecipes function not found');
}

console.groupEnd();

// ========================================
// SUMMARY
// ========================================
console.group('📊 SCENARIO TEST SUMMARY');

console.log('Dual-Bank Structure:');
console.log('- Stackable items:', Object.keys(GameEngine.state.bank.stackable || {}).length);
console.log('- Instanced items:', Object.keys(GameEngine.state.bank.instanced || {}).length);

console.log('\nSample Stackable:');
const sampleStackable = Object.entries(GameEngine.state.bank.stackable || {})[0];
if (sampleStackable) {
    console.log(`  ${sampleStackable[0]}: ${sampleStackable[1]} (${typeof sampleStackable[1]})`);
}

console.log('\nSample Instanced:');
const sampleInstanced = Object.entries(GameEngine.state.bank.instanced || {})[0];
if (sampleInstanced) {
    console.log(`  ${sampleInstanced[0]}:`, sampleInstanced[1]);
}

console.log('\nTest Results:');
console.log('✅ = Test passed');
console.log('❌ = Test failed');
console.log('⚠️ = Test skipped or warning');

console.groupEnd();

console.groupEnd();

// Clean up global test variable
delete window.testWeaponInstanceId;
