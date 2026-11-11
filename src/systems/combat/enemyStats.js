/**
 * ENEMY STATS SYSTEM
 *
 * Compiles enemy definitions into combat-ready stat blocks.
 * Handles both single-type and multi-type enemies.
 */

const EnemyStats = {

    /**
     * Create a combat-ready enemy instance from registry definition
     * @param {string} enemyId - Enemy ID to look up
     * @returns {Object|null} Compiled enemy stats or null if not found
     */
    createCombatInstance(enemyId) {
        const enemyDef = EnemyRegistry.get(enemyId);

        if (!enemyDef) {
            console.error(`[EnemyStats] Enemy not found: ${enemyId}`);
            return null;
        }

        const compiled = this.compileStats(enemyDef);
        this.calculatePercentages(compiled);

        return compiled;
    },

    /**
     * Compile enemy definition into combat stats
     * @param {Object} enemyDef - Raw enemy definition
     * @returns {Object} Compiled combat stats
     */
    compileStats(enemyDef) {
        // Calculate damage range
        const minDamage = enemyDef.minDamage || Math.floor(enemyDef.baseDamage * enemyDef.minDamageRatio);
        const maxDamage = enemyDef.maxDamage || Math.floor(enemyDef.baseDamage * enemyDef.maxDamageRatio);

        return {
            // ═══ IDENTITY ═══
            id: enemyDef.id,
            name: enemyDef.name,
            icon: enemyDef.icon,
            tier: enemyDef.tier,
            level: enemyDef.level,
            category: enemyDef.category,
            description: enemyDef.description || '',

            // ═══ HEALTH ═══
            maxHP: enemyDef.maxHP,
            currentHP: enemyDef.maxHP,

            // ═══ OFFENSE ═══
            offense: {
                baseDamage: enemyDef.baseDamage,
                minDamage: minDamage,
                maxDamage: maxDamage,
                accuracy: enemyDef.accuracy,
                critRating: enemyDef.critRating,
                critMultiplier: enemyDef.critMultiplier,
                attackInterval: enemyDef.attackInterval,

                // Type ratings (compile from single or multi-type)
                damageRatings: this._compileDamageRatings(enemyDef),
                damagePercentages: {}  // Calculated after
            },

            // ═══ DEFENSE ═══
            defense: {
                evasion: enemyDef.evasion,
                armorRating: enemyDef.armorRating,
                damageReduction: enemyDef.damageReduction,
                critResistance: enemyDef.critResistance || 10,  // Default if not specified

                // Defense pool = evasion + armor rating
                defensePool: enemyDef.evasion + enemyDef.armorRating,

                // Type ratings (compile from single or multi-type)
                armorRatings: this._compileArmorRatings(enemyDef),
                armorPercentages: {}  // Calculated after
            },

            // ═══ REWARDS ═══
            rewards: {
                baseXP: enemyDef.baseXP,
                goldDrop: { ...enemyDef.goldDrop },
                lootTable: enemyDef.lootTable || null,
                loot: enemyDef.loot ? [...enemyDef.loot] : []
            },

            // ═══ RESPAWN ═══
            respawnTime: enemyDef.respawnTime,

            // ═══ COMBAT STATE ═══
            attackTimer: 0,
            isAlive: true,
            deathTime: null
        };
    },

    /**
     * Compile damage type ratings
     * Handles both single damageType and multi-type damageRatings
     * @private
     */
    _compileDamageRatings(enemyDef) {
        // If multi-type ratings provided, use those
        if (enemyDef.damageRatings && Object.keys(enemyDef.damageRatings).length > 0) {
            return { ...enemyDef.damageRatings };
        }

        // Otherwise, single damage type = 100% that type
        return { [enemyDef.damageType]: 100 };
    },

    /**
     * Compile armor type ratings
     * Handles both single armorType and multi-type armorRatings
     * @private
     */
    _compileArmorRatings(enemyDef) {
        // If multi-type ratings provided, use those
        if (enemyDef.armorRatings && Object.keys(enemyDef.armorRatings).length > 0) {
            return { ...enemyDef.armorRatings };
        }

        // Otherwise, single armor type = 100% that type
        return { [enemyDef.armorType]: 100 };
    },

    /**
     * Calculate type percentages from ratings
     * Must be called after compileStats
     * @param {Object} compiledEnemy - Compiled enemy object
     */
    calculatePercentages(compiledEnemy) {
        // Damage percentages
        const dmgRatings = compiledEnemy.offense.damageRatings;
        const dmgTotal = Object.values(dmgRatings).reduce((a, b) => a + b, 0);

        compiledEnemy.offense.damagePercentages = {};
        for (const [type, rating] of Object.entries(dmgRatings)) {
            compiledEnemy.offense.damagePercentages[type] = dmgTotal > 0 ? rating / dmgTotal : 0;
        }

        // Armor percentages
        const armRatings = compiledEnemy.defense.armorRatings;
        const armTotal = Object.values(armRatings).reduce((a, b) => a + b, 0);

        compiledEnemy.defense.armorPercentages = {};
        for (const [type, rating] of Object.entries(armRatings)) {
            compiledEnemy.defense.armorPercentages[type] = armTotal > 0 ? rating / armTotal : 0;
        }
    },

    /**
     * Roll for gold drop amount
     * @param {Object} compiledEnemy - Compiled enemy with rewards
     * @returns {number} Gold amount
     */
    rollGoldDrop(compiledEnemy) {
        const { min, max } = compiledEnemy.rewards.goldDrop;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Roll for loot drops
     * @param {Object} compiledEnemy - Compiled enemy with rewards
     * @returns {Array} Array of { itemId, quantity } for successful drops
     */
    rollLoot(compiledEnemy) {
        const drops = [];

        for (const entry of compiledEnemy.rewards.loot) {
            // Roll for drop chance
            if (Math.random() <= entry.chance) {
                // Calculate quantity
                let quantity = 1;
                if (typeof entry.quantity === 'number') {
                    quantity = entry.quantity;
                } else if (entry.quantity && entry.quantity.min !== undefined) {
                    const { min, max } = entry.quantity;
                    quantity = Math.floor(Math.random() * (max - min + 1)) + min;
                }

                drops.push({
                    itemId: entry.itemId,
                    quantity: quantity
                });
            }
        }

        return drops;
    },

    /**
     * Reset enemy to full health (for respawn)
     * @param {Object} compiledEnemy - Compiled enemy object
     */
    respawn(compiledEnemy) {
        compiledEnemy.currentHP = compiledEnemy.maxHP;
        compiledEnemy.attackTimer = 0;
        compiledEnemy.isAlive = true;
        compiledEnemy.deathTime = null;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemyStats;
}
