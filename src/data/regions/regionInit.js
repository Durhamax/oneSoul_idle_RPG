/**
 * REGION REGISTRY INITIALIZATION
 *
 * Migrates WorldRegions into RegionRegistry for consistency
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initializing Region Registry...');

    if (typeof RegionRegistry === 'undefined') {
        console.error('❌ RegionRegistry not loaded!');
        return;
    }

    if (typeof WorldRegions !== 'undefined') {
        console.log('🔄 Migrating WorldRegions to RegionRegistry...');

        let migratedCount = 0;
        for (let regionId in WorldRegions) {
            if (!RegionRegistry.production[regionId]) {
                RegionRegistry.legacy[regionId] = WorldRegions[regionId];
                migratedCount++;
            }
        }

        console.log(`✅ Migrated ${migratedCount} regions from WorldRegions to RegionRegistry.legacy`);
    }

    RegionRegistry.printSummary();
    console.log('✅ Region Registry Initialized');
});
