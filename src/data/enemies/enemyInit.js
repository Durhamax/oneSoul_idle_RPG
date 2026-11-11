/**
 * ENEMY REGISTRY INITIALIZATION
 *
 * Initializes the EnemyRegistry and migrates legacy enemies from GameDefinitions.
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing Enemy Registry...');

    if (typeof EnemyRegistry === 'undefined') {
        console.error('❌ EnemyRegistry not loaded!');
        return;
    }

    if (typeof GameDefinitions === 'undefined') {
        console.error('❌ GameDefinitions not loaded!');
        return;
    }

    // Migrate legacy enemies from GameDefinitions._legacyEnemies
    if (GameDefinitions._legacyEnemies && typeof GameDefinitions._legacyEnemies === 'object') {
        console.log('🔄 Migrating legacy enemies from GameDefinitions...');

        let migratedCount = 0;
        for (let enemyId in GameDefinitions._legacyEnemies) {
            // Only migrate if not already in production
            if (!EnemyRegistry.production[enemyId]) {
                EnemyRegistry.legacy[enemyId] = GameDefinitions._legacyEnemies[enemyId];
                migratedCount++;
            }
        }

        console.log(`✅ Migrated ${migratedCount} legacy enemies to EnemyRegistry.legacy`);
    }

    // Print statistics
    EnemyRegistry.printSummary();

    console.log('✅ Enemy Registry Initialized');
});
