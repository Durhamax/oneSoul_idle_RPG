/**
 * ENEMY VALIDATOR
 *
 * Validates enemy definitions against the schema.
 * Ensures all required fields are present and valid.
 */

const EnemyValidator = {

    /**
     * Validate a single enemy definition
     * @param {Object} enemy - Enemy definition object
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate(enemy) {
        const errors = [];

        if (!enemy || typeof enemy !== 'object') {
            return { valid: false, errors: ['Enemy definition must be an object'] };
        }

        // Check all required fields exist and are not null/undefined
        for (const field of EnemySchema.required) {
            if (enemy[field] === undefined || enemy[field] === null) {
                errors.push(`Missing required field: '${field}'`);
            }
        }

        // If missing required fields, return early
        if (errors.length > 0) {
            return { valid: false, errors };
        }

        // ═══ TYPE VALIDATION ═══

        // Tier
        if (!this._inRange(enemy.tier, EnemySchema.constraints.tier)) {
            errors.push(`Invalid tier: ${enemy.tier} (must be 1-5)`);
        }

        // Level
        if (!this._inRange(enemy.level, EnemySchema.constraints.level)) {
            errors.push(`Invalid level: ${enemy.level} (must be 1-100)`);
        }

        // Category
        if (!EnemySchema.validCategories.includes(enemy.category)) {
            errors.push(`Invalid category: '${enemy.category}' (valid: ${EnemySchema.validCategories.join(', ')})`);
        }

        // MaxHP
        if (!this._inRange(enemy.maxHP, EnemySchema.constraints.maxHP)) {
            errors.push(`Invalid maxHP: ${enemy.maxHP} (must be positive)`);
        }

        // Base Damage
        if (!this._inRange(enemy.baseDamage, EnemySchema.constraints.baseDamage)) {
            errors.push(`Invalid baseDamage: ${enemy.baseDamage} (must be positive)`);
        }

        // Damage Ratios
        if (!this._inRange(enemy.minDamageRatio, EnemySchema.constraints.minDamageRatio)) {
            errors.push(`Invalid minDamageRatio: ${enemy.minDamageRatio} (must be 0.1-1.0)`);
        }
        if (!this._inRange(enemy.maxDamageRatio, EnemySchema.constraints.maxDamageRatio)) {
            errors.push(`Invalid maxDamageRatio: ${enemy.maxDamageRatio} (must be 1.0-3.0)`);
        }
        if (enemy.minDamageRatio >= enemy.maxDamageRatio) {
            errors.push(`minDamageRatio (${enemy.minDamageRatio}) must be less than maxDamageRatio (${enemy.maxDamageRatio})`);
        }

        // Accuracy
        if (!this._inRange(enemy.accuracy, EnemySchema.constraints.accuracy)) {
            errors.push(`Invalid accuracy: ${enemy.accuracy} (must be positive)`);
        }

        // Crit Rating
        if (!this._inRange(enemy.critRating, EnemySchema.constraints.critRating)) {
            errors.push(`Invalid critRating: ${enemy.critRating} (must be non-negative)`);
        }

        // Crit Multiplier
        if (!this._inRange(enemy.critMultiplier, EnemySchema.constraints.critMultiplier)) {
            errors.push(`Invalid critMultiplier: ${enemy.critMultiplier} (must be 1.0-5.0)`);
        }

        // Attack Interval
        if (!this._inRange(enemy.attackInterval, EnemySchema.constraints.attackInterval)) {
            errors.push(`Invalid attackInterval: ${enemy.attackInterval} (minimum 500ms)`);
        }

        // Damage Type
        if (!EnemySchema.validDamageTypes.includes(enemy.damageType)) {
            errors.push(`Invalid damageType: '${enemy.damageType}' (valid: ${EnemySchema.validDamageTypes.join(', ')})`);
        }

        // Evasion
        if (!this._inRange(enemy.evasion, EnemySchema.constraints.evasion)) {
            errors.push(`Invalid evasion: ${enemy.evasion} (must be non-negative)`);
        }

        // Armor Rating
        if (!this._inRange(enemy.armorRating, EnemySchema.constraints.armorRating)) {
            errors.push(`Invalid armorRating: ${enemy.armorRating} (must be non-negative)`);
        }

        // Damage Reduction
        if (!this._inRange(enemy.damageReduction, EnemySchema.constraints.damageReduction)) {
            errors.push(`Invalid damageReduction: ${enemy.damageReduction} (must be 0-0.90)`);
        }

        // Armor Type
        if (!EnemySchema.validArmorTypes.includes(enemy.armorType)) {
            errors.push(`Invalid armorType: '${enemy.armorType}' (valid: ${EnemySchema.validArmorTypes.join(', ')})`);
        }

        // Base XP
        if (!this._inRange(enemy.baseXP, EnemySchema.constraints.baseXP)) {
            errors.push(`Invalid baseXP: ${enemy.baseXP} (must be positive)`);
        }

        // Gold Drop
        if (!enemy.goldDrop || typeof enemy.goldDrop !== 'object') {
            errors.push(`Invalid goldDrop: must be object { min, max }`);
        } else {
            if (typeof enemy.goldDrop.min !== 'number' || enemy.goldDrop.min < 0) {
                errors.push(`Invalid goldDrop.min: ${enemy.goldDrop.min}`);
            }
            if (typeof enemy.goldDrop.max !== 'number' || enemy.goldDrop.max < enemy.goldDrop.min) {
                errors.push(`Invalid goldDrop.max: ${enemy.goldDrop.max} (must be >= min)`);
            }
        }

        // Loot Array
        if (!Array.isArray(enemy.loot)) {
            errors.push(`Invalid loot: must be an array`);
        } else {
            enemy.loot.forEach((entry, index) => {
                if (!entry.itemId || typeof entry.itemId !== 'string') {
                    errors.push(`Loot[${index}]: missing or invalid itemId`);
                }
                if (typeof entry.chance !== 'number' || entry.chance < 0 || entry.chance > 1) {
                    errors.push(`Loot[${index}]: invalid chance (must be 0-1)`);
                }
                if (entry.quantity === undefined) {
                    errors.push(`Loot[${index}]: missing quantity`);
                }
            });
        }

        // Respawn Time
        if (!this._inRange(enemy.respawnTime, EnemySchema.constraints.respawnTime)) {
            errors.push(`Invalid respawnTime: ${enemy.respawnTime} (minimum 1000ms)`);
        }

        // ═══ OPTIONAL FIELD VALIDATION ═══

        // Damage Ratings (if present)
        if (enemy.damageRatings) {
            const dmgErrors = this._validateTypeRatings(enemy.damageRatings, 'damageRatings', EnemySchema.validDamageTypes);
            errors.push(...dmgErrors);
        }

        // Armor Ratings (if present)
        if (enemy.armorRatings) {
            const armErrors = this._validateTypeRatings(enemy.armorRatings, 'armorRatings', EnemySchema.validArmorTypes);
            errors.push(...armErrors);
        }

        // Behavior (if present)
        if (enemy.behavior && !EnemySchema.validBehaviors.includes(enemy.behavior)) {
            errors.push(`Invalid behavior: '${enemy.behavior}' (valid: ${EnemySchema.validBehaviors.join(', ')})`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate all enemies in a collection
     * @param {Object} enemies - Object of enemy definitions keyed by id
     * @returns {Object} { allValid: boolean, results: { [id]: validationResult } }
     */
    validateAll(enemies) {
        const results = {};
        let allValid = true;

        for (const [id, enemy] of Object.entries(enemies)) {
            // Ensure id matches key
            if (enemy.id !== id) {
                results[id] = { valid: false, errors: [`ID mismatch: key '${id}' vs enemy.id '${enemy.id}'`] };
                allValid = false;
                continue;
            }

            const result = this.validate(enemy);
            results[id] = result;

            if (!result.valid) {
                allValid = false;
                console.error(`[EnemyValidator] ❌ Invalid enemy '${id}':`, result.errors);
            }
        }

        if (allValid) {
            console.log(`[EnemyValidator] ✅ All ${Object.keys(enemies).length} enemies validated successfully`);
        }

        return { allValid, results };
    },

    /**
     * Check if value is within range
     * @private
     */
    _inRange(value, constraint) {
        if (typeof value !== 'number' || isNaN(value)) return false;
        if (constraint.min !== undefined && value < constraint.min) return false;
        if (constraint.max !== undefined && value > constraint.max) return false;
        return true;
    },

    /**
     * Validate type ratings object
     * @private
     */
    _validateTypeRatings(ratings, fieldName, validTypes) {
        const errors = [];

        if (typeof ratings !== 'object') {
            errors.push(`${fieldName} must be an object`);
            return errors;
        }

        let total = 0;
        for (const [type, value] of Object.entries(ratings)) {
            if (!validTypes.includes(type)) {
                errors.push(`${fieldName}: invalid type '${type}'`);
            }
            if (typeof value !== 'number' || value < 0) {
                errors.push(`${fieldName}: invalid value for '${type}': ${value}`);
            }
            total += value;
        }

        // Ratings should sum to something reasonable (warn if not ~100)
        if (total <= 0) {
            errors.push(`${fieldName}: total must be positive (got ${total})`);
        }

        return errors;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnemyValidator;
}
