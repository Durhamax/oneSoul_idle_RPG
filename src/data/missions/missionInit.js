/**
 * MISSION REGISTRY INITIALIZATION
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing Mission Registry...');

    if (typeof MissionRegistry === 'undefined') {
        console.error('❌ MissionRegistry not loaded!');
        return;
    }

    if (typeof GameDefinitions === 'undefined') {
        console.error('❌ GameDefinitions not loaded!');
        return;
    }

    if (GameDefinitions._legacyMissions && typeof GameDefinitions._legacyMissions === 'object') {
        console.log('🔄 Migrating legacy missions from GameDefinitions...');

        let migratedCount = 0;
        for (let missionId in GameDefinitions._legacyMissions) {
            if (!MissionRegistry.production[missionId]) {
                MissionRegistry.legacy[missionId] = GameDefinitions._legacyMissions[missionId];
                migratedCount++;
            }
        }

        console.log(`✅ Migrated ${migratedCount} legacy missions to MissionRegistry.legacy`);
    }

    MissionRegistry.printSummary();
    console.log('✅ Mission Registry Initialized');
});
