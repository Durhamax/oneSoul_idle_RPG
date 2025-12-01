/**
 * AUTO CONSUMPTION
 *
 * Auto-eat and ammo consumption systems
 */

const AutoConsumption = {
    /**
     * Get perk multipliers for consumables
     * @returns {Object} Consumable-related perk multipliers
     */
    getConsumablePerkMultipliers() {
        const multipliers = typeof GameEngine !== 'undefined' && GameEngine.getPerkMultipliers
            ? GameEngine.getPerkMultipliers()
            : {};
        return {
            foodHealing: multipliers.foodHealing || 1.0,
            potionPotency: multipliers.potionPotency || 1.0,
            techPotency: multipliers.techPotency || 1.0,
            foodConservation: multipliers.foodConservation || 1.0,
            potionConservation: multipliers.potionConservation || 1.0,
            techConservation: multipliers.techConservation || 1.0,
            ammoConservation: multipliers.ammoConservation || 1.0
        };
    },

    /**
     * Check if item should be consumed based on conservation perk
     * Conservation multiplier > 1 = chance to NOT consume
     * @param {string} conservationType - 'food', 'potion', 'tech', 'ammo'
     * @returns {boolean} true if item should be consumed, false if conserved
     */
    shouldConsumeItem(conservationType) {
        const perks = this.getConsumablePerkMultipliers();

        const conservationPerkMap = {
            food: 'foodConservation',
            potion: 'potionConservation',
            tech: 'techConservation',
            ammo: 'ammoConservation'
        };

        const perk = conservationPerkMap[conservationType];
        const conservationMultiplier = perks[perk] || 1.0;

        // Higher multiplier = lower consume chance
        // 1.00 = 100% consume, 1.20 = 80% consume, 1.50 = 50% consume
        const consumeChance = Math.max(0, 1.0 - (conservationMultiplier - 1.0));

        return Math.random() < consumeChance;
    },

    /**
     * Helper: Extract base item ID from instanced ID
     * Delegates to centralized ItemIdUtils for consistent ID parsing
     * e.g., "sidekick22_1764441114356_r431m1xvb" -> "sidekick22"
     */
    getBaseItemId(itemIdOrSlot) {
        // Use centralized utility for consistent ID parsing
        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getBaseItemId(itemIdOrSlot);
        }

        // Fallback if ItemIdUtils not loaded yet
        if (!itemIdOrSlot) return null;

        if (typeof itemIdOrSlot === 'object') {
            return itemIdOrSlot.baseItemId || itemIdOrSlot.itemId || null;
        }

        if (typeof itemIdOrSlot === 'string') {
            // Match pattern: baseId_13digitTimestamp_randomId
            const match = itemIdOrSlot.match(/^(.+)_(\d{13})_([a-z0-9]+)$/i);
            if (match) {
                return match[1];
            }
            return itemIdOrSlot;
        }

        return null;
    },

    /**
     * Helper: Get item definition from equipment slot (handles instanced items)
     * Uses ItemIdUtils for consistent ID resolution
     */
    getItemDef(slot) {
        if (!slot) return null;

        // Use centralized utility for consistent item lookup
        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getItemDefinition(slot);
        }

        // Fallback to manual lookup
        const baseId = this.getBaseItemId(slot);
        if (!baseId) return null;

        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getItem(baseId);
        }
        return null;
    },

    /**
     * Calculate auto-eat threshold (20% of max HP)
     */
    calculateAutoEatThreshold(player) {
        const mult = player.perkMultipliers || {};
        const maxHP = this.calculateMaxHP(player);

        // Fixed 20% of max HP, modified by perk only
        return Math.ceil(maxHP * 0.20 * (mult.autoEatThreshold || 1.0));
    },

    /**
     * Calculate auto-eat efficiency
     */
    calculateAutoEatEfficiency(player) {
        const mult = player.perkMultipliers || {};
        const intellect = player.combatAttributes?.intellect || 0;

        const baseEfficiency = 0.50 + (intellect * 0.005);
        const finalEfficiency = baseEfficiency * (mult.autoEatEfficiency || 1.0);

        return Math.min(0.95, finalEfficiency);
    },

    /**
     * Calculate max HP
     * Applies both healthScaling (on attribute contribution) and maxHealth (on total)
     */
    calculateMaxHP(player) {
        const mult = player.perkMultipliers || {};
        const health = player.combatAttributes?.health || 0;

        // Base HP of 100 + (health attribute * 10 * healthScaling)
        const baseHP = 100;
        const attributeHP = health * 10 * (mult.healthScaling || 1.0);
        const totalHP = baseHP + attributeHP;

        // Apply maxHealth multiplier to final total
        return Math.floor(totalHP * (mult.maxHealth || 1.0));
    },

    /**
     * Process auto-eat attempt
     * Returns healing info or null if no food consumed
     * Applies foodHealing multiplier for heal amount
     * Applies foodConservation for chance to not consume
     */
    processAutoEat(player, combat) {
        const threshold = this.calculateAutoEatThreshold(player);

        // Check if HP is below threshold
        if (player.currentHP > threshold) {
            return null;
        }

        // Check cooldown (1 second between auto-eats)
        if (combat.lastAutoEat && Date.now() - combat.lastAutoEat < 1000) {
            return null;
        }

        // Get food from equipment slot
        const food = player.equipment?.food;
        if (!food || !food.quantity || food.quantity <= 0) {
            return {
                success: false,
                reason: 'No food equipped'
            };
        }

        // Get consumable perk multipliers
        const consumablePerks = this.getConsumablePerkMultipliers();

        // Calculate healing with foodHealing multiplier
        const efficiency = this.calculateAutoEatEfficiency(player);
        const healValue = food.healValue || 0;
        const baseHealAmount = Math.floor(healValue * efficiency);
        const healAmount = Math.floor(baseHealAmount * consumablePerks.foodHealing);

        // Apply healing
        const maxHP = this.calculateMaxHP(player);
        const oldHP = player.currentHP;
        player.currentHP = Math.min(maxHP, player.currentHP + healAmount);
        const actualHealed = player.currentHP - oldHP;

        // Check food conservation - only consume if roll fails
        const wasConsumed = this.shouldConsumeItem('food');
        if (wasConsumed) {
            food.quantity--;
        }

        combat.lastAutoEat = Date.now();

        // Track in session stats
        if (combat.session) {
            if (wasConsumed) {
                combat.session.foodConsumed = (combat.session.foodConsumed || 0) + 1;
            } else {
                combat.session.foodConserved = (combat.session.foodConserved || 0) + 1;
            }
        }

        return {
            success: true,
            healed: actualHealed,
            foodUsed: food.id,
            foodName: food.name,
            remaining: food.quantity,
            efficiency: efficiency,
            threshold: threshold,
            wasConsumed: wasConsumed,
            healMultiplier: consumablePerks.foodHealing
        };
    },

    /**
     * Process ammo consumption
     * Returns true if ammo consumed, false if no ammo
     * Applies ammoConservation for chance to not consume
     */
    consumeAmmo(player, combat) {
        // Use pre-compiled weapon data if available
        const compiledWeapon = combat?.compiledWeapon;

        // Check if weapon requires ammo
        if (compiledWeapon) {
            if (!compiledWeapon.requiresAmmo) {
                return { success: true, reason: 'Weapon does not require ammo' };
            }
        } else {
            // Fallback: resolve from equipment
            const weaponDef = this.getItemDef(player.equipment?.weapon);
            if (!weaponDef || !weaponDef.requiresAmmo) {
                return { success: true, reason: 'Weapon does not require ammo' };
            }
        }

        // Use combat ammo state if available
        const ammoState = combat?.playerAmmo;
        if (ammoState) {
            if (ammoState.currentAmmo <= 0) {
                return {
                    success: false,
                    reason: 'Out of ammo',
                    weaponName: compiledWeapon?.name || 'weapon'
                };
            }

            // Check ammo conservation - only consume if roll fails
            const wasConsumed = this.shouldConsumeItem('ammo');
            if (wasConsumed) {
                // Consume ammo from combat state
                ammoState.currentAmmo--;
            }

            // Track in session stats
            if (combat.session) {
                if (wasConsumed) {
                    combat.session.ammoConsumed = (combat.session.ammoConsumed || 0) + 1;
                } else {
                    combat.session.ammoConserved = (combat.session.ammoConserved || 0) + 1;
                }
            }

            return {
                success: true,
                ammoUsed: ammoState.ammoId,
                ammoName: ammoState.ammoName,
                remaining: ammoState.currentAmmo,
                wasConsumed: wasConsumed
            };
        }

        // Fallback: use equipment slot directly
        const ammoSlot = player.equipment?.ammo;
        if (!ammoSlot) {
            return {
                success: false,
                reason: 'No ammo equipped',
                weaponName: compiledWeapon?.name || 'weapon'
            };
        }

        // Check quantity
        const quantity = ammoSlot.quantity || 0;
        if (quantity <= 0) {
            return {
                success: false,
                reason: 'Out of ammo',
                weaponName: compiledWeapon?.name || 'weapon'
            };
        }

        // Check ammo conservation - only consume if roll fails
        const wasConsumed = this.shouldConsumeItem('ammo');
        if (wasConsumed) {
            // Consume ammo
            ammoSlot.quantity--;
        }

        // Track in session stats
        if (combat?.session) {
            if (wasConsumed) {
                combat.session.ammoConsumed = (combat.session.ammoConsumed || 0) + 1;
            } else {
                combat.session.ammoConserved = (combat.session.ammoConserved || 0) + 1;
            }
        }

        const ammoDef = this.getItemDef(ammoSlot);
        return {
            success: true,
            ammoUsed: this.getBaseItemId(ammoSlot),
            ammoName: ammoDef?.name || 'ammo',
            remaining: ammoSlot.quantity,
            wasConsumed: wasConsumed
        };
    },

    /**
     * Check if player can attack (has ammo if needed)
     * Uses pre-compiled combat stats when available
     */
    canAttack(player) {
        // First check: use compiled weapon data if available (set at combat start)
        const compiledWeapon = player.combat?.compiledWeapon;
        if (compiledWeapon) {
            // Weapon was pre-compiled at combat start
            if (!compiledWeapon.requiresAmmo) {
                return { canAttack: true };
            }

            // Check ammo
            const ammoState = player.combat?.playerAmmo;
            if (!ammoState || ammoState.currentAmmo <= 0) {
                return {
                    canAttack: false,
                    reason: 'Out of ammo',
                    weaponName: compiledWeapon.name
                };
            }

            return { canAttack: true };
        }

        // Fallback: resolve from equipment (used if combat not properly initialized)
        const weaponSlot = player.equipment?.weapon;
        if (!weaponSlot) {
            return { canAttack: false, reason: 'No weapon equipped' };
        }

        // Get weapon definition using helper (handles instanced IDs)
        const weaponDef = this.getItemDef(weaponSlot);
        if (!weaponDef) {
            const baseId = this.getBaseItemId(weaponSlot);
            console.warn(`⚠️ [AutoConsumption] Could not find weapon definition for: ${baseId}`);
            return { canAttack: false, reason: 'Weapon not found in registry' };
        }

        // Check if weapon requires ammo
        if (!weaponDef.requiresAmmo) {
            return { canAttack: true };
        }

        // Get ammo from equipment slot
        const ammoSlot = player.equipment?.ammo;
        if (!ammoSlot) {
            return {
                canAttack: false,
                reason: 'Out of ammo',
                weaponName: weaponDef.name
            };
        }

        // Resolve ammo definition
        const ammoDef = this.getItemDef(ammoSlot);

        // Check ammo quantity
        const ammoQuantity = ammoSlot.quantity || player.combat?.playerAmmo?.currentAmmo || 0;
        if (ammoQuantity <= 0) {
            return {
                canAttack: false,
                reason: 'Out of ammo',
                weaponName: weaponDef.name
            };
        }

        // Check ammo compatibility
        if (weaponDef.ammoType && ammoDef?.ammoType !== weaponDef.ammoType) {
            return {
                canAttack: false,
                reason: 'Incompatible ammo',
                weaponAmmoType: weaponDef.ammoType,
                equippedAmmoType: ammoDef?.ammoType
            };
        }

        return { canAttack: true };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoConsumption;
}
