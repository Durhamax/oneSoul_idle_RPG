/**
 * PRODUCTION ENEMIES
 *
 * All enemies available in the production game.
 * Organized within this file by tier for easy reference.
 */

const ProductionEnemies = {

    // ═══════════════════════════════════════════════════════════════
    // TIER 1 ENEMIES (Levels 1-10)
    // ═══════════════════════════════════════════════════════════════

    elaran_survey_drone: {
        // Identity
        id: 'elaran_survey_drone',
        name: 'Elaran Survey Drone',
        icon: '🛸',
        assetPath: 'assets/enemies/elaran_survey_drone.png',
        tier: 1,
        level: 3,
        category: 'droid',        // Category is a PROPERTY, not file organization

        // Health - Low for entry enemy
        maxHP: 20,

        // Offense - Low damage, pierce type, fast attacks
        baseDamage: 8,
        minDamageRatio: 0.7,
        maxDamageRatio: 1.3,
        accuracy: 55,
        critRating: 5,
        critMultiplier: 1.5,
        attackInterval: 1800,       // Fast attacks (1.8 seconds)
        damageType: 'pierce',       // Pierce damage from scanning lasers

        // Defense - Airborne type, low armor, some evasion from mobility
        evasion: 1,                 // Reduced for testing
        armorRating: 1,             // Reduced for testing
        damageReduction: 0.01,      // Reduced for testing (1% DR)
        armorType: 'airborne',      // Flying unit - weak to cryo

        // Rewards - Entry level drops
        baseXP: 15,
        goldDrop: { min: 3, max: 8 },
        // Drones no longer drop medals — the Elaran Surveyor is the deliberate
        // introduction of medals as a combat drop (see below).
        fragmentDrop: { min: 0, max: 0 },
        loot: [
            // Salvaged sensor is the component that pairs with refined copper wire to
            // assemble the first technology (Scrap Field Scanner).
            { itemId: 'salvagedSensor', chance: 0.30, quantity: 1 }
        ],
        respawnTime: 500,           // 500ms for testing

        // Metadata
        description: 'A small reconnaissance drone used by Elaran forces to map terrain and monitor movement. Lightly armed with a scanning laser that can be weaponized.',
        region: 'region_-2_-4'      // Scoutreach — the first-combat beat (MAP_POI hex 2)
    },

    // The first HUMAN enemy — low-ranking Elaran military techs who operate the survey
    // drones on the ground. Introduces the BIOLOGICAL armor type and is the deliberate
    // introduction of MEDALS as a combat drop. Tougher than the drones: more HP, harder
    // hits, light armor, a basic sidearm.
    elaran_surveyor: {
        // Identity
        id: 'elaran_surveyor',
        name: 'Elaran Surveyor',
        icon: '🔭',
        assetPath: 'assets/enemies/elaran_surveyor.png',
        tier: 1,
        level: 5,
        category: 'humanoid',

        // Health - A clear step up from the drone (20 → 40)
        maxHP: 40,

        // Offense - Basic sidearm: harder hits than the drone, slower cadence
        baseDamage: 12,
        minDamageRatio: 0.8,
        maxDamageRatio: 1.3,
        accuracy: 65,
        critRating: 8,
        critMultiplier: 1.5,
        attackInterval: 2600,       // Slower than the drone (sidearm, not a scan laser)
        damageType: 'pierce',       // Standard-issue ballistic sidearm

        // Defense - Low-grade field armoring, lightly evasive infantry
        evasion: 2,
        armorRating: 3,
        damageReduction: 0.03,      // 3% DR (low-grade armoring)
        armorType: 'biological',    // Infantry — answered efficiently by Incendiary (T2)

        // Rewards - FIRST medal source + crafting-component salvage
        baseXP: 30,
        goldDrop: { min: 8, max: 18 },
        fragmentDrop: { min: 1, max: 3 },  // Medals — guaranteed at least 1
        loot: [
            { itemId: 'elaranSidearmParts', chance: 0.28, quantity: 1 },
            { itemId: 'scrapPlating',       chance: 0.35, quantity: { min: 1, max: 2 } },
            { itemId: 'salvagedSensor',     chance: 0.15, quantity: 1 },
            { itemId: 'surveyDataCore',     chance: 0.08, quantity: 1 }  // Rare clue/tome component
        ],
        respawnTime: 1500,

        // Metadata
        description: 'A low-ranking Elaran military technician sent in behind the survey drones to verify readings on the ground. Lightly armored and armed with a standard sidearm, but a trained soldier — and far more dangerous than the machines.',
        region: 'region_-2_-4'      // Scoutreach — "immediately after the drones"
    }

    // ═══════════════════════════════════════════════════════════════
    // TIER 2 ENEMIES (Levels 11-25)
    // ═══════════════════════════════════════════════════════════════

    // Future tier 2 enemies go here...

    // ═══════════════════════════════════════════════════════════════
    // TIER 3 ENEMIES (Levels 26-50)
    // ═══════════════════════════════════════════════════════════════

    // Future tier 3 enemies go here...

    // ═══════════════════════════════════════════════════════════════
    // TIER 4 ENEMIES (Levels 51-75)
    // ═══════════════════════════════════════════════════════════════

    // Future tier 4 enemies go here...

    // ═══════════════════════════════════════════════════════════════
    // TIER 5 ENEMIES (Levels 76-100)
    // ═══════════════════════════════════════════════════════════════

    // Future tier 5 enemies go here...
};

// Register all production enemies
if (typeof EnemyRegistry !== 'undefined') {
    // Use registerBatch directly (BaseRegistry method) instead of the custom register() method
    for (const [id, enemy] of Object.entries(ProductionEnemies)) {
        EnemyRegistry.production[id] = enemy;
    }
    console.log(`[ProductionEnemies] ✅ Registered ${Object.keys(ProductionEnemies).length} production enemies`);
} else {
    console.error('[ProductionEnemies] ❌ EnemyRegistry not available!');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionEnemies;
}
