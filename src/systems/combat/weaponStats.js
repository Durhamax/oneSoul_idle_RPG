/**
 * WEAPON STATS SYSTEM
 *
 * Handles weapon-specific calculations including accuracy modifiers.
 * Implements tier-based and category-based accuracy modifications.
 */

const WeaponStats = {

    // Base accuracy modifier by weapon category
    ACCURACY_BASE: {
        precisionMelee: 1.10,   // Designed for precise strikes
        balancedMelee: 1.00,    // Standard accuracy
        heavyMelee: 0.90,       // Power over precision
        rifle: 1.15,            // Built for accuracy
        pistol: 1.05,           // Decent accuracy, less stable
        shotgun: 0.85,          // Spread pattern, close range
        bow: 1.10,              // Skill-based precision
        crossbow: 1.05,         // Mechanical consistency
        tool: 0.80              // Not designed for combat
    },

    // Bonus per tier above T1
    ACCURACY_TIER_BONUS: 0.03,

    /**
     * Calculate weapon accuracy modifier
     * @param {Object|null} weaponDef - Weapon definition object
     * @returns {number} Accuracy modifier (multiplier)
     */
    calculateAccuracyModifier(weaponDef) {
        if (!weaponDef) return 1.0;  // Unarmed = neutral

        const category = this.getWeaponCategory(weaponDef);
        const tier = this.getWeaponTier(weaponDef);

        const baseAccuracy = this.ACCURACY_BASE[category] || 1.00;
        const tierBonus = (tier - 1) * this.ACCURACY_TIER_BONUS;

        return baseAccuracy + tierBonus;
    },

    /**
     * Get weapon tier from definition
     * @param {Object} weaponDef - Weapon definition object
     * @returns {number} Weapon tier (1-5)
     */
    getWeaponTier(weaponDef) {
        if (!weaponDef) return 1;

        // Check for numeric tier
        if (typeof weaponDef.tier === 'number') {
            return Math.max(1, Math.min(5, weaponDef.tier));
        }

        // Check for tier string (e.g., "starter", "tier1", "improved")
        if (typeof weaponDef.tier === 'string') {
            const tierStr = weaponDef.tier.toLowerCase();
            if (tierStr === 'starter' || tierStr === 'tier1' || tierStr === 'basic') return 1;
            if (tierStr === 'tier2' || tierStr === 'improved') return 2;
            if (tierStr === 'tier3' || tierStr === 'advanced') return 3;
            if (tierStr === 'tier4' || tierStr === 'superior') return 4;
            if (tierStr === 'tier5' || tierStr === 'elite' || tierStr === 'legendary') return 5;
        }

        // Fallback to level if tier not found
        if (weaponDef.level) {
            if (weaponDef.level <= 10) return 1;
            if (weaponDef.level <= 20) return 2;
            if (weaponDef.level <= 30) return 3;
            if (weaponDef.level <= 40) return 4;
            return 5;
        }

        // Default to tier 1
        return 1;
    },

    /**
     * Get weapon category from weapon definition
     * Falls back to inferring from other properties if not set
     * @param {Object} weaponDef - Weapon definition object
     * @returns {string} Weapon category
     */
    getWeaponCategory(weaponDef) {
        if (!weaponDef) return 'balancedMelee';

        // Use explicit category if defined
        if (weaponDef.weaponCategory) {
            return weaponDef.weaponCategory;
        }

        // Fallback: infer from weaponType or other properties
        // This handles legacy weapons without weaponCategory
        if (weaponDef.weaponType === 'gun' || weaponDef.weaponType === 'firearm') {
            if (weaponDef.id?.includes('rifle') || weaponDef.id?.includes('sniper') ||
                weaponDef.name?.toLowerCase().includes('rifle') || weaponDef.name?.toLowerCase().includes('sniper')) {
                return 'rifle';
            }
            if (weaponDef.id?.includes('pistol') || weaponDef.id?.includes('handgun') ||
                weaponDef.name?.toLowerCase().includes('pistol') || weaponDef.name?.toLowerCase().includes('handgun')) {
                return 'pistol';
            }
            if (weaponDef.id?.includes('shotgun') ||
                weaponDef.name?.toLowerCase().includes('shotgun')) {
                return 'shotgun';
            }
            return 'rifle';  // Default gun type
        }

        if (weaponDef.weaponType === 'bow') return 'bow';
        if (weaponDef.weaponType === 'crossbow') return 'crossbow';

        // Melee inference based on common naming patterns
        if (weaponDef.equipSlot === 'weapon' || weaponDef.slot === 'weapon') {
            const idLower = (weaponDef.id || '').toLowerCase();
            const nameLower = (weaponDef.name || '').toLowerCase();

            // Precision melee
            if (idLower.includes('dagger') || idLower.includes('knife') || idLower.includes('rapier') ||
                idLower.includes('blade') && !idLower.includes('greatblade') ||
                nameLower.includes('dagger') || nameLower.includes('knife') || nameLower.includes('rapier')) {
                return 'precisionMelee';
            }

            // Heavy melee
            if (idLower.includes('hammer') || idLower.includes('mace') || idLower.includes('axe') ||
                idLower.includes('greathammer') || idLower.includes('greataxe') ||
                nameLower.includes('hammer') || nameLower.includes('mace') || nameLower.includes('axe')) {
                return 'heavyMelee';
            }

            // Tools used as weapons
            if (idLower.includes('pickaxe') || idLower.includes('hatchet') || idLower.includes('rod') ||
                weaponDef.toolType || weaponDef.slot === 'tool') {
                return 'tool';
            }
        }

        // Default to balanced melee
        return 'balancedMelee';
    },

    /**
     * Get detailed weapon stats for display
     * @param {Object} weaponDef - Weapon definition object
     * @returns {Object} Detailed weapon stats
     */
    getWeaponStats(weaponDef) {
        if (!weaponDef) {
            return {
                category: 'balancedMelee',
                tier: 1,
                accuracyModifier: 1.0,
                baseModifier: 1.0,
                tierBonus: 0,
                displayText: 'Unarmed (Neutral)'
            };
        }

        const category = this.getWeaponCategory(weaponDef);
        const tier = this.getWeaponTier(weaponDef);
        const accuracyModifier = this.calculateAccuracyModifier(weaponDef);
        const baseModifier = this.ACCURACY_BASE[category] || 1.0;
        const tierBonus = (tier - 1) * this.ACCURACY_TIER_BONUS;

        const percentChange = ((accuracyModifier - 1.0) * 100).toFixed(0);
        const displayText = accuracyModifier >= 1.0
            ? `+${percentChange}%`
            : `${percentChange}%`;

        return {
            category,
            tier,
            accuracyModifier,
            baseModifier,
            tierBonus,
            displayText
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeaponStats;
}
