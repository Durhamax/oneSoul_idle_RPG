/**
 * MISSION REGISTRY INITIALIZATION
 *
 * Initializes the mission registry and enables appropriate modes
 * based on the environment.
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing Mission Registry...');

    if (typeof MissionRegistry === 'undefined') {
        console.error('❌ MissionRegistry not loaded!');
        return;
    }

    // Enable test mode to include test missions
    // This can be controlled via URL parameter or config
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('testMissions') || urlParams.has('dev')) {
        MissionRegistry.enableTestMode();
        console.log('🧪 Test missions enabled');
    }

    // For development, always enable test mode
    // TODO: Remove this in production
    MissionRegistry.enableTestMode();

    // Migrate legacy missions if they exist
    if (typeof GameDefinitions !== 'undefined' &&
        GameDefinitions._legacyMissions &&
        typeof GameDefinitions._legacyMissions === 'object') {

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

    // Print summary
    MissionRegistry.printSummary();

    // Log available utility classes
    if (typeof MissionIdUtils !== 'undefined') {
        console.log('✅ MissionIdUtils loaded');
    }
    if (typeof OBJECTIVE_TYPES !== 'undefined') {
        console.log(`✅ OBJECTIVE_TYPES loaded (${Object.keys(OBJECTIVE_TYPES).length} types)`);
    }
    if (typeof MissionSchema !== 'undefined') {
        console.log('✅ MissionSchema loaded');
    }

    console.log('✅ Mission Registry Initialized');
});
