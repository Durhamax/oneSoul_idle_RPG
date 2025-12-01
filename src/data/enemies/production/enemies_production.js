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
        maxHP: 80,

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
        evasion: 35,                // Nimble flyer
        armorRating: 15,            // Light construction
        damageReduction: 0.05,      // Minimal plating (5% DR)
        armorType: 'airborne',      // Flying unit - weak to cryo

        // Rewards - Entry level drops
        baseXP: 15,
        goldDrop: { min: 3, max: 8 },
        fragmentDrop: { min: 0, max: 2 },  // Low chance of 1-2 fragments, often 0
        loot: [
            { itemId: 'circuit_scrap', chance: 0.45, quantity: { min: 1, max: 2 } },
            { itemId: 'copper_wire', chance: 0.35, quantity: { min: 1, max: 3 } },
            { itemId: 'lens_fragment', chance: 0.15, quantity: 1 },
            { itemId: 'survey_data_chip', chance: 0.08, quantity: 1 }
        ],
        respawnTime: 15000,         // 15 second respawn

        // Metadata
        description: 'A small reconnaissance drone used by Elaran forces to map terrain and monitor movement. Lightly armed with a scanning laser that can be weaponized.',
        region: 'starting_zone'
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
