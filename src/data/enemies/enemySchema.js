/**
 * ENEMY SCHEMA
 *
 * Defines all required and optional fields for enemy definitions.
 * All combat-essential fields are REQUIRED - no defaults.
 */

const EnemySchema = {
    required: [
        // ═══ IDENTITY ═══
        'id',                 // Unique identifier
        'name',               // Display name
        'icon',               // Emoji or icon reference
        'tier',               // 1-5, determines difficulty bracket
        'level',              // Display level
        'category',           // beast, humanoid, droid, elemental, undead, etc.

        // ═══ HEALTH ═══
        'maxHP',              // Maximum hit points

        // ═══ OFFENSE ═══
        'baseDamage',         // Base damage value
        'minDamageRatio',     // Min damage = baseDamage × minDamageRatio
        'maxDamageRatio',     // Max damage = baseDamage × maxDamageRatio
        'accuracy',           // Accuracy rating for hit rolls
        'critRating',         // Crit chance rating vs player crit resistance
        'critMultiplier',     // Damage multiplier on critical hit
        'attackInterval',     // Milliseconds between attacks
        'damageType',         // Primary: pierce, explosive, cryo, shock, incendiary

        // ═══ DEFENSE ═══
        'evasion',            // Evasion rating (adds to defense pool)
        'armorRating',        // Armor rating (adds to defense pool)
        'damageReduction',    // DR percentage (0.00 to 0.90)
        'armorType',          // Primary: insulated, plated, airborne, droid, biological

        // ═══ REWARDS ═══
        'baseXP',             // Experience points on kill
        'goldDrop',           // { min: number, max: number }
        'fragmentDrop',       // { min: number, max: number } - medal fragments on kill
        'loot',               // Array of loot entries
        'respawnTime'         // Milliseconds until respawn
    ],

    optional: [
        // Multi-type alternatives (override single type if present)
        'damageRatings',      // { pierce: 70, shock: 30 } - percentages
        'armorRatings',       // { droid: 60, plated: 40 } - percentages

        // Explicit damage range (override ratio calculation if present)
        'minDamage',          // Explicit minimum damage
        'maxDamage',          // Explicit maximum damage

        // Crit resistance (if enemy can resist player crits)
        'critResistance',     // Rating vs player crit rating

        // Loot table reference (alternative to inline loot array)
        'lootTable',          // Reference to LootTableRegistry

        // Future features
        'behavior',           // aggressive, defensive, balanced
        'abilities',          // Special attack array
        'passives',           // Passive effect array

        // Metadata
        'description',        // Flavor text
        'region',             // Associated region(s)
        'discoveryHint'       // Hint for how to find this enemy
    ],

    // Valid values for enum fields
    validDamageTypes: ['pierce', 'explosive', 'cryo', 'shock', 'incendiary'],
    validArmorTypes: ['insulated', 'plated', 'airborne', 'droid', 'biological'],
    validCategories: ['beast', 'humanoid', 'droid', 'elemental', 'undead', 'insectoid', 'plant', 'construct', 'aberration'],
    validBehaviors: ['aggressive', 'defensive', 'balanced'],

    // Constraints
    constraints: {
        tier: { min: 1, max: 5 },
        level: { min: 1, max: 100 },
        maxHP: { min: 1 },
        baseDamage: { min: 1 },
        minDamageRatio: { min: 0.1, max: 1.0 },
        maxDamageRatio: { min: 1.0, max: 3.0 },
        accuracy: { min: 1 },
        critRating: { min: 0 },
        critMultiplier: { min: 1.0, max: 5.0 },
        attackInterval: { min: 500 },
        evasion: { min: 0 },
        armorRating: { min: 0 },
        damageReduction: { min: 0, max: 0.90 },
        baseXP: { min: 1 },
        respawnTime: { min: 1000 }
    }
};

// Export for use in validator and registry
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemySchema;
}
