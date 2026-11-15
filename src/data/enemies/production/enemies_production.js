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
        fragmentDrop: { min: 0, max: 2 },  // Low chance of 1-2 fragments, often 0
        loot: [
            // Salvaged sensor is the component that pairs with refined copper wire to
            // assemble the first technology (Scrap Field Scanner).
            { itemId: 'salvagedSensor', chance: 0.30, quantity: 1 }
        ],
        respawnTime: 500,           // 500ms for testing

        // Metadata
        description: 'A small reconnaissance drone used by Elaran forces to map terrain and monitor movement. Lightly armed with a scanning laser that can be weaponized.',
        region: 'starting_zone'
    },

    elaran_surveyor: {
        // Identity
        id: 'elaran_surveyor',
        name: 'Elaran Surveyor',
        icon: '🥽',
        assetPath: 'assets/enemies/elaran_surveyor.png',
        tier: 1,
        level: 6,
        category: 'biological',    // A person, not a machine — the enemy gets a face

        // Health - A step up from the drones; a trained operative, not a probe
        maxHP: 45,

        // Offense - Sidearm + survey tools; steadier aim than a drone, slower cadence
        baseDamage: 12,
        minDamageRatio: 0.8,
        maxDamageRatio: 1.25,
        accuracy: 62,
        critRating: 6,
        critMultiplier: 1.5,
        attackInterval: 2400,       // Slower, deliberate shots (2.4 seconds)
        damageType: 'pierce',       // Sidearm rounds

        // Defense - Field kit + light vest; grounded personnel, low mobility
        evasion: 3,
        armorRating: 3,
        damageReduction: 0.03,      // 3% DR from field gear
        armorType: 'biological',    // Living operative — the counter the player learns toward

        // Rewards - Better than drones; the first enemy worth looting properly
        baseXP: 35,
        goldDrop: { min: 8, max: 18 },
        fragmentDrop: { min: 0, max: 3 },
        loot: [
            // Salvaged kit from a downed surveyor; same component the drones carry.
            { itemId: 'salvagedSensor', chance: 0.45, quantity: 1 }
        ],
        respawnTime: 500,

        // Metadata
        description: 'An Elaran field operative mapping the ground the drones flag. They carry orders, sidearms, and a reason — the first enemy with a face, surveying the Cradle for something they will not name.',
        region: 'peaceful_meadows'
    },

    // ═══════════════════════════════════════════════════════════════
    // TIER 2 ENEMIES (Scoutreach / Verduun / West Coast)
    // Emoji-only (no assetPath) — art is added later by the art pipeline.
    // ═══════════════════════════════════════════════════════════════

    // SCOUTREACH — the grunt. Drops the reverse-engineering samples.
    elaran_recon_grunt: {
        id: 'elaran_recon_grunt',
        name: 'Elaran Recon Grunt',
        icon: '🪖',
        tier: 2,
        level: 2,
        category: 'biological',

        maxHP: 32,
        baseDamage: 10,
        minDamageRatio: 0.8,
        maxDamageRatio: 1.25,
        accuracy: 60,
        critRating: 5,
        critMultiplier: 1.5,
        attackInterval: 2200,
        damageType: 'pierce',       // 6mm sidearm

        evasion: 2,
        armorRating: 3,
        damageReduction: 0.03,
        armorType: 'biological',

        baseXP: 30,
        goldDrop: { min: 6, max: 14 },
        fragmentDrop: { min: 0, max: 3 },
        loot: [
            { itemId: 'scrapAlloy', chance: 0.40, quantity: 1 },
            { itemId: 'salvagedWiring', chance: 0.30, quantity: 1 },
            // Reverse-engineering samples: strip these to learn their recipes.
            { itemId: 'elaran6mmRounds', chance: 0.18, quantity: 1 },
            { itemId: 'elaranIssuePlate', chance: 0.08, quantity: 1 },
            { itemId: 'elaran6mmDefender', chance: 0.05, quantity: 1 }
        ],
        respawnTime: 500,

        description: 'A rank-and-file Elaran trooper working forward security at the Scoutreach survey camp. Carries a 6mm sidearm, issue plate, and more knowledge than Unity was ever allowed — all of it worth taking.',
        region: 'scoutreach'
    },

    // VERDUUN SOUTH/WEST — forest wildlife
    verduun_boar: {
        id: 'verduun_boar',
        name: 'Verduun Boar',
        icon: '🐗',
        tier: 2,
        level: 4,
        category: 'biological',

        maxHP: 55,
        baseDamage: 13,
        minDamageRatio: 0.85,
        maxDamageRatio: 1.3,
        accuracy: 58,
        critRating: 6,
        critMultiplier: 1.6,
        attackInterval: 2600,
        damageType: 'pierce',       // tusks

        evasion: 2,
        armorRating: 4,
        damageReduction: 0.04,
        armorType: 'biological',

        baseXP: 40,
        goldDrop: { min: 4, max: 10 },
        fragmentDrop: { min: 0, max: 2 },
        loot: [
            { itemId: 'smallGameMeat', chance: 0.60, quantity: 2 },
            { itemId: 'rangerPelt', chance: 0.30, quantity: 1 }
        ],
        respawnTime: 500,

        description: 'A heavy-shouldered boar that holds the overgrown Unity woods. Centuries without Unity hunters have made them bold and territorial.',
        region: 'verduun'
    },

    verduun_prowler: {
        id: 'verduun_prowler',
        name: 'Verduun Prowler',
        icon: '🐺',
        tier: 2,
        level: 5,
        category: 'biological',

        maxHP: 48,
        baseDamage: 15,
        minDamageRatio: 0.8,
        maxDamageRatio: 1.35,
        accuracy: 66,
        critRating: 9,
        critMultiplier: 1.7,
        attackInterval: 2000,       // fast, evasive predator
        damageType: 'pierce',

        evasion: 7,
        armorRating: 3,
        damageReduction: 0.03,
        armorType: 'biological',

        baseXP: 44,
        goldDrop: { min: 5, max: 12 },
        fragmentDrop: { min: 0, max: 3 },
        loot: [
            { itemId: 'smallPelts', chance: 0.55, quantity: 2 },
            { itemId: 'rangerPelt', chance: 0.35, quantity: 1 },
            { itemId: 'smallGameMeat', chance: 0.30, quantity: 1 }
        ],
        respawnTime: 500,

        description: 'A lean pack predator of the Verduun thickets. Quick and hard to pin — a test of accuracy over armor.',
        region: 'verduun'
    },

    // VERDUUN NORTH — reactivated war machine (first mini-elite)
    bunker_sentinel: {
        id: 'bunker_sentinel',
        name: 'Bunker Sentinel',
        icon: '🤖',
        tier: 2,
        level: 8,
        category: 'droid',

        maxHP: 110,
        baseDamage: 18,
        minDamageRatio: 0.85,
        maxDamageRatio: 1.3,
        accuracy: 64,
        critRating: 6,
        critMultiplier: 1.5,
        attackInterval: 2800,       // slow, heavy
        damageType: 'pierce',

        evasion: 1,
        armorRating: 8,
        damageReduction: 0.10,      // heavily armored
        armorType: 'droid',

        baseXP: 90,
        goldDrop: { min: 15, max: 35 },
        fragmentDrop: { min: 1, max: 4 },
        loot: [
            { itemId: 'corrodedPlating', chance: 0.50, quantity: 2 },
            { itemId: 'powerCell', chance: 0.35, quantity: 1 },
            { itemId: 'droneDataCore', chance: 0.25, quantity: 1 }
        ],
        respawnTime: 500,

        description: 'An automated sentry still guarding the collapsed Verduun trenches, half-buried and five centuries overdue for a relief that never came. Its plating turns most blades — the first real reason to field something heavier.',
        region: 'verduun_north'
    },

    // WEST COAST — shore scavenger
    shoal_raider: {
        id: 'shoal_raider',
        name: 'Shoal Raider',
        icon: '🦀',
        tier: 2,
        level: 4,
        category: 'biological',

        maxHP: 50,
        baseDamage: 12,
        minDamageRatio: 0.8,
        maxDamageRatio: 1.3,
        accuracy: 56,
        critRating: 5,
        critMultiplier: 1.5,
        attackInterval: 2500,
        damageType: 'pierce',       // claws

        evasion: 3,
        armorRating: 6,             // hard shell
        damageReduction: 0.06,
        armorType: 'biological',

        baseXP: 38,
        goldDrop: { min: 4, max: 11 },
        fragmentDrop: { min: 0, max: 2 },
        loot: [
            { itemId: 'shellfish', chance: 0.45, quantity: 2 },
            { itemId: 'seaSalt', chance: 0.30, quantity: 1 },
            { itemId: 'smallPelts', chance: 0.15, quantity: 1 }
        ],
        respawnTime: 500,

        description: 'A heavy-shelled crab that rules the tidal shoals west of the Cradle, territorial over the richest shellfish beds.',
        region: 'west_coast'
    }

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
