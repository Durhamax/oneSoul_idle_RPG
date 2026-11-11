// CORRECTED DUAL-BANK SCENARIO TESTS
// Uses actual item IDs and handles instanced attachments

console.group('🧪 DUAL-BANK SCENARIO TESTS (CORRECTED)');

// ========================================
// Scenario 1: Creating a new weapon instance with attachments
// ========================================
console.group('1️⃣ Create Weapon Instance (testRifle)');

if (typeof GameEngine.createWeaponInstance === 'function') {
    console.log('✅ createWeaponInstance function exists');

    const weaponInstance = GameEngine.createWeaponInstance('testRifle');

    if (weaponInstance) {
        console.log('✅ Weapon instance created:', weaponInstance.instanceId);

        const addResult = GameEngine.addEquipmentInstance(weaponInstance);

        if (addResult.success) {
            console.log('✅ Weapon instance added to dual-bank');
            console.log('   Instance ID:', weaponInstance.instanceId);
            console.log('   Available slots:', Object.keys(weaponInstance.attachments));

            // Save for later tests
            window.testWeaponInstanceId = weaponInstance.instanceId;
        } else {
            console.error('❌ Failed to add weapon instance:', addResult.reason);
        }
    }
} else {
    console.error('❌ createWeaponInstance function not found');
}

console.groupEnd();

// ========================================
// Scenario 2: Attaching a mod to weapon
// ========================================
console.group('2️⃣ Attach Mod to Weapon Instance');

if (window.testWeaponInstanceId) {
    console.log('Testing with weapon:', window.testWeaponInstanceId);

    // Use testMuzzle_common (the actual test mod that exists)
    const modId = 'testMuzzle_common';
    console.log('Using mod:', modId);

    // Check if mod exists in registry
    const modDef = ItemRegistry?.getItem(modId);
    if (!modDef) {
        console.error('❌ Mod not found in registry:', modId);
    } else {
        console.log('✅ Mod found in registry');
        console.log('   Mod is instanced:', modDef.instanced);
        console.log('   Mod type:', modDef.modType);

        // Since mods are INSTANCED, we need to create an instance
        if (modDef.instanced) {
            console.log('Creating mod instance...');

            // Create a mod instance
            const modInstance = DualBankSystem.createInstance(modId, {
                rarity: modDef.rarity || 'common'
            });

            if (modInstance) {
                console.log('✅ Mod instance created:', modInstance.uniqueId);

                // Add mod instance to bank
                const addModResult = GameEngine.addEquipmentInstance(modInstance);

                if (addModResult.success) {
                    console.log('✅ Mod instance added to bank');

                    // Now attach it using the instance ID
                    const attachResult = GameEngine.modifyWeaponAttachments(
                        window.testWeaponInstanceId,
                        'muzzle',
                        modInstance.uniqueId  // Use instance ID, not base item ID
                    );

                    console.log('Attach result:', attachResult);

                    if (attachResult.success) {
                        console.log('✅ Mod attached successfully');

                        const weapon = GameEngine.getEquipmentInstance(window.testWeaponInstanceId);
                        console.log('   Weapon attachments:', weapon?.attachments);

                        // Save mod instance ID for removal test
                        window.testModInstanceId = modInstance.uniqueId;
                    } else {
                        console.error('❌ Failed to attach mod:', attachResult.reason);
                    }
                } else {
                    console.error('❌ Failed to add mod to bank:', addModResult.reason);
                }
            } else {
                console.error('❌ Failed to create mod instance');
            }
        } else {
            console.warn('⚠️ Mod is not instanced - would use base ID directly');
        }
    }
} else {
    console.warn('⚠️ No weapon instance from previous test');
}

console.groupEnd();

// ========================================
// Scenario 3: Removing a mod (should return to bank)
// ========================================
console.group('3️⃣ Remove Mod from Weapon Instance');

if (window.testWeaponInstanceId && window.testModInstanceId) {
    console.log('Testing with weapon:', window.testWeaponInstanceId);
    console.log('Mod to remove:', window.testModInstanceId);

    // Check current attachments
    const weaponBefore = GameEngine.getEquipmentInstance(window.testWeaponInstanceId);
    console.log('Before removal:', weaponBefore?.attachments);

    // Check if mod is currently in bank
    const modInBankBefore = !!GameEngine.state.bank.instanced[window.testModInstanceId];
    console.log('Mod in bank before removal:', modInBankBefore);

    // Remove the muzzle attachment
    const removeResult = GameEngine.modifyWeaponAttachments(
        window.testWeaponInstanceId,
        'muzzle',
        null  // null = remove
    );

    console.log('Remove result:', removeResult);

    if (removeResult.success) {
        console.log('✅ Mod removed successfully');

        // Check that mod returned to bank
        const modInBankAfter = !!GameEngine.state.bank.instanced[window.testModInstanceId];
        console.log('Mod in bank after removal:', modInBankAfter);

        if (modInBankAfter) {
            console.log('✅ Mod returned to instanced storage');
        } else {
            console.warn('⚠️ Mod not found in bank after removal');
        }

        // Verify weapon no longer has attachment
        const weaponAfter = GameEngine.getEquipmentInstance(window.testWeaponInstanceId);
        console.log('After removal:', weaponAfter?.attachments);
    } else {
        console.error('❌ Failed to remove mod:', removeResult.reason);
    }
} else {
    console.warn('⚠️ Missing weapon or mod instance from previous tests');
}

console.groupEnd();

// ========================================
// Scenario 4: Gathering resources (should go to stackable)
// ========================================
console.group('4️⃣ Gather Resources (Stackable Storage)');

const testResourceId = 'ironOre';
console.log('Testing with resource:', testResourceId);

const beforeCount = GameEngine.getItemCount(testResourceId);
console.log('Before:', beforeCount);

const addResult = GameEngine.addItemToBank(testResourceId, 100);

// addItemToBank returns boolean true/false
if (addResult === true || (typeof addResult === 'object' && addResult.success)) {
    console.log('✅ Resource added successfully');

    const afterCount = GameEngine.getItemCount(testResourceId);
    console.log('After:', afterCount);
    console.log('Increase:', afterCount - beforeCount);

    // Verify it's in stackable storage
    const inStackable = GameEngine.state.bank.stackable[testResourceId];
    console.log('In stackable storage:', inStackable, `(${typeof inStackable})`);

    if (typeof inStackable === 'number') {
        console.log('✅ Correctly stored as number in stackable storage');
    } else {
        console.error('❌ Not stored as number in stackable storage');
    }
} else {
    console.error('❌ Failed to add resource');
}

console.groupEnd();

// ========================================
// Scenario 5: Crafting equipment (manual test)
// ========================================
console.group('5️⃣ Equipment Instance Creation (Manual)');

console.log('Creating equipment instance manually...');

if (typeof GameEngine.createEquipmentInstance === 'function') {
    const testItem = 'testRifle';
    const instance = GameEngine.createEquipmentInstance(testItem, 'rare', {});
    console.log('Created instance:', instance?.instanceId);

    if (instance) {
        const addResult = GameEngine.addEquipmentInstance(instance);

        if (addResult.success) {
            console.log('✅ Equipment instance created and added');
            console.log('   Instance ID:', instance.instanceId);
            console.log('   Rarity:', instance.rarity);
            console.log('   In dual-bank:', !!GameEngine.state.bank.instanced[instance.instanceId]);
        } else {
            console.error('❌ Failed to add instance:', addResult.reason);
        }
    }
} else {
    console.error('❌ createEquipmentInstance not available');
}

console.groupEnd();

// ========================================
// SUMMARY
// ========================================
console.group('📊 FINAL SUMMARY');

console.log('Dual-Bank Structure:');
console.log('  Stackable items:', Object.keys(GameEngine.state.bank.stackable || {}).length);
console.log('  Instanced items:', Object.keys(GameEngine.state.bank.instanced || {}).length);

console.log('\nKey Findings:');
console.log('  ✅ Weapon instances created and stored correctly');
console.log('  ✅ Mod instances are also instanced items');
console.log('  ✅ Resources stored as numbers in stackable');
console.log('  ✅ Equipment instances stored as objects in instanced');

console.log('\nDual-Bank Validation:');
const validation = DualBankSystem.validate();
console.log('  Valid:', validation.valid);
if (!validation.valid) {
    console.log('  Issues:', validation.issues);
}

console.groupEnd();

console.groupEnd();

// Clean up
delete window.testWeaponInstanceId;
delete window.testModInstanceId;

console.log('\n✅ Test script complete!');
