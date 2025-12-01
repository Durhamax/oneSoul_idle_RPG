/**
 * ENEMY REGISTRY (Refactored to extend BaseRegistry)
 *
 * Multi-environment organization system for enemies/monsters.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 *
 * ✅ All original methods preserved
 * ✅ New standardized methods added (.get, .has, etc.)
 * ✅ No breaking changes
 */

class EnemyRegistryClass extends BaseRegistry {
    constructor() {
        super('enemy');

        // Map config names for backward compatibility
        Object.defineProperty(this.config, 'includeDevEnemies', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestEnemies', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includeLegacyEnemies', {
            get() { return this.previewMode; },
            set(value) { this.previewMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedEnemies', {
            get() { return false; },
            set(value) { /* no-op */ }
        });

        this._initSchema();
    }

    _initSchema() {
        // Use the combat-focused schema
        if (typeof EnemySchema !== 'undefined') {
            this.schema = EnemySchema;
        } else {
            // Fallback legacy schema
            this.schema = {
                required: ['id', 'name', 'type', 'tier', 'level'],
                optional: [
                    'description', 'icon', 'difficulty', 'isBoss', 'health', 'maxHealth',
                    'damage', 'defense', 'accuracy', 'evasion', 'critChance', 'critDamage',
                    'abilities', 'drops', 'lootTable', 'experience', 'gold',
                    'resistances', 'weaknesses', 'immunities', 'statusEffects',
                    'behavior', 'aiPattern', 'spawnLocations', 'spawnWeight',
                    'minLevel', 'maxLevel', 'tags', 'assetPath', 'rarity',
                    'respawnTime', 'aggro', 'attackSpeed', 'moveSpeed'
                ]
            };
        }

        // Initialize validator
        if (typeof EnemyValidator !== 'undefined') {
            this.validator = EnemyValidator;
        }
    }

    // ===== ORIGINAL METHODS (100% backward compatible) =====

    /**
     * Register enemies to a specific registry (ORIGINAL METHOD)
     * @param {string} registry - Registry name (production, dev, test, legacy, planned)
     * @param {Object} enemies - Enemies to register
     */
    register(registry, enemies) {
        const environment = registry === 'production' ? 'production' :
                          registry === 'dev' ? 'dev' :
                          registry === 'test' ? 'test' :
                          registry === 'legacy' ? 'legacy' :
                          registry === 'planned' ? 'planned' : null;

        if (!environment) {
            console.error(`❌ Invalid registry: ${registry}`);
            return;
        }

        // Use BaseRegistry's registerBatch for batch registration
        this.registerBatch(enemies, environment);
        console.log(`📦 Registered ${Object.keys(enemies).length} enemies to ${registry} registry`);
    }

    /**
     * Get enemies by status (environment) (ORIGINAL METHOD)
     * @param {string} status - Registry name (production, dev, test, legacy, planned)
     * @returns {Object} Enemies from specified registry
     */
    getByStatus(status) {
        if (!this.hasOwnProperty(status)) {
            console.error(`❌ Invalid status: ${status}`);
            return {};
        }
        return { ...this[status] };
    }

    /**
     * Get enemies by tier (ORIGINAL METHOD - returns Array)
     * @param {number} tier - Enemy tier (1-5)
     * @returns {Array} Enemies matching tier
     */
    getByTier(tier) {
        const enemies = this.getAllActive();
        return Object.values(enemies).filter(enemy => enemy.tier === tier);
    }

    /**
     * Get enemies by type (ORIGINAL METHOD - returns Array)
     * @param {string} type - Enemy type (humanoid, beast, undead, demon, etc.)
     * @returns {Array} Enemies matching type
     */
    getByType(type) {
        const enemies = this.getAllActive();
        return Object.values(enemies).filter(enemy => enemy.type === type);
    }

    /**
     * Get enemies by difficulty (ORIGINAL METHOD - returns Array)
     * @param {string} difficulty - Difficulty level (easy, medium, hard, boss)
     * @returns {Array} Enemies matching difficulty
     */
    getByDifficulty(difficulty) {
        const enemies = this.getAllActive();
        return Object.values(enemies).filter(enemy => enemy.difficulty === difficulty);
    }

    /**
     * Get boss enemies (ORIGINAL METHOD - returns Array)
     * @returns {Array} Boss enemies
     */
    getBosses() {
        const enemies = this.getAllActive();
        return Object.values(enemies).filter(enemy => enemy.isBoss === true);
    }

    /**
     * Get statistics (ORIGINAL METHOD)
     * @returns {Object} Statistics for each registry
     */
    getStatistics() {
        const stats = {
            production: Object.keys(this.production).length,
            dev: Object.keys(this.dev).length,
            test: Object.keys(this.test).length,
            legacy: Object.keys(this.legacy).length,
            planned: Object.keys(this.planned).length,
            total: 0,
            byTier: {},
            byType: {},
            bosses: 0
        };

        stats.total = stats.production + stats.dev + stats.test + stats.legacy + stats.planned;

        // Count by tier and type
        const allEnemies = this.getAllActive();
        for (let enemyId in allEnemies) {
            const enemy = allEnemies[enemyId];

            // Count by tier
            if (enemy.tier) {
                stats.byTier[enemy.tier] = (stats.byTier[enemy.tier] || 0) + 1;
            }

            // Count by type
            if (enemy.type) {
                stats.byType[enemy.type] = (stats.byType[enemy.type] || 0) + 1;
            }

            // Count bosses
            if (enemy.isBoss) {
                stats.bosses++;
            }
        }

        return stats;
    }

    /**
     * Print registry summary (ORIGINAL METHOD - with original formatting)
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log(`\n${'═'.repeat(40)}`);
        console.log('║       ENEMY REGISTRY SUMMARY          ║');
        console.log(`${'═'.repeat(40)}\n`);

        console.log(`📦 Production: ${stats.production} enemies`);
        console.log(`🔧 Dev: ${stats.dev} enemies`);
        console.log(`🧪 Test: ${stats.test} enemies`);
        console.log(`📜 Legacy: ${stats.legacy} enemies`);
        console.log(`🔮 Planned: ${stats.planned} enemies`);
        console.log(`\n✅ Total Active: ${stats.total} enemies\n`);

        if (Object.keys(stats.byTier).length > 0) {
            console.log('By Tier:');
            for (let tier in stats.byTier) {
                console.log(`   Tier ${tier}: ${stats.byTier[tier]} enemies`);
            }
            console.log('');
        }

        if (Object.keys(stats.byType).length > 0) {
            console.log('By Type:');
            for (let type in stats.byType) {
                console.log(`   ${type}: ${stats.byType[type]} enemies`);
            }
            console.log('');
        }

        if (stats.bosses > 0) {
            console.log(`👑 Bosses: ${stats.bosses} enemies\n`);
        }
    }

    // ===== NEW COMBAT-SPECIFIC METHODS =====

    /**
     * Get enemies by category (for new combat system)
     * @param {string} category - Enemy category (beast, droid, etc.)
     * @returns {Object} Enemies matching category
     */
    getByCategory(category) {
        const all = this.getAllActive();
        const filtered = {};

        for (const [id, enemy] of Object.entries(all)) {
            if (enemy.category === category) {
                filtered[id] = enemy;
            }
        }

        return filtered;
    }

    /**
     * Get enemies by damage type
     * @param {string} damageType - Damage type
     * @returns {Object} Enemies with that damage type
     */
    getByDamageType(damageType) {
        const all = this.getAllActive();
        const filtered = {};

        for (const [id, enemy] of Object.entries(all)) {
            if (enemy.damageType === damageType ||
                (enemy.damageRatings && enemy.damageRatings[damageType])) {
                filtered[id] = enemy;
            }
        }

        return filtered;
    }

    /**
     * Get enemies by armor type
     * @param {string} armorType - Armor type
     * @returns {Object} Enemies with that armor type
     */
    getByArmorType(armorType) {
        const all = this.getAllActive();
        const filtered = {};

        for (const [id, enemy] of Object.entries(all)) {
            if (enemy.armorType === armorType ||
                (enemy.armorRatings && enemy.armorRatings[armorType])) {
                filtered[id] = enemy;
            }
        }

        return filtered;
    }

    /**
     * Get enemies by region
     * @param {string} region - Region identifier
     * @returns {Object} Enemies in that region
     */
    getByRegion(region) {
        const all = this.getAllActive();
        const filtered = {};

        for (const [id, enemy] of Object.entries(all)) {
            if (enemy.region === region) {
                filtered[id] = enemy;
            }
        }

        return filtered;
    }

    /**
     * Get enemy power rating (for difficulty display)
     * @param {string} enemyId - Enemy ID
     * @returns {number} Power rating
     */
    getPowerRating(enemyId) {
        const enemy = this.get(enemyId);
        if (!enemy) return 0;

        // Simple power formula: HP/10 + avgDamage*5 + accuracy/10
        const avgDamage = enemy.baseDamage || 0;
        return Math.floor(
            (enemy.maxHP / 10) +
            (avgDamage * 5) +
            (enemy.accuracy / 10) +
            (enemy.evasion / 5) +
            (enemy.armorRating / 5)
        );
    }

    /**
     * Get difficulty label for enemy
     * @param {string} enemyId - Enemy ID
     * @returns {string} Difficulty label
     */
    getDifficultyLabel(enemyId) {
        const power = this.getPowerRating(enemyId);

        if (power < 30) return 'Weak';
        if (power < 60) return 'Easy';
        if (power < 100) return 'Moderate';
        if (power < 150) return 'Challenging';
        if (power < 250) return 'Hard';
        if (power < 400) return 'Deadly';
        return 'Elite';
    }

    /**
     * Validate an enemy before registration
     * @param {Object} enemy - Enemy definition
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateEnemy(enemy) {
        if (this.validator) {
            return this.validator.validate(enemy);
        }
        // Fallback if validator not loaded
        return { valid: true, errors: [] };
    }

    // Note: BaseRegistry already provides:
    // - register(id, definition, environment) - single enemy registration
    // - registerBatch(definitions, environment)
    // - get(id) - NEW standardized method
    // - has(id) - NEW standardized method
    // - getAllActive(), getAllAsObject(), getAllIds()
    // - getProduction(), getDev(), getTest(), getLegacy(), getPlanned()
    // - clear(), clearAll(), importJSON(), exportJSON()
    // - enableDevMode(), disableDevMode(), enableTestMode(), disableTestMode()
}

// Create singleton instance
const EnemyRegistry = new EnemyRegistryClass();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemyRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.EnemyRegistry = EnemyRegistry;
}
