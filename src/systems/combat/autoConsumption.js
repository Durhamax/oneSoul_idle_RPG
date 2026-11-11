/**
 * AUTO CONSUMPTION
 *
 * Auto-eat and ammo consumption systems
 *
 * Food System:
 * - Equipment slot stores { itemId, quantity } object
 * - Auto-eat: Triggers when HP <= threshold, consumes multiple items until full HP (at efficiency rate)
 * - Manual eat: Consumes 1 item at 100% heal value
 * - Effects: Applied each attack interval while food quantity > 0
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
     * Get food definition from equipped food slot
     * Handles new { itemId, quantity } format
     */
    getFoodDefinition(foodSlot) {
        if (!foodSlot) return null;

        // New format: { itemId, quantity }
        const itemId = typeof foodSlot === 'object' ? foodSlot.itemId : foodSlot;
        if (!itemId) return null;

        // Use ItemIdUtils for item lookup
        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getItemDefinition(itemId);
        }

        // Fallback to ItemRegistry
        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getItem(itemId);
        }

        return null;
    },

    /**
     * Get equipped food quantity
     */
    getEquippedFoodQuantity(player) {
        const foodSlot = player.equipment?.food;
        if (!foodSlot) return 0;

        // New format: { itemId, quantity }
        if (typeof foodSlot === 'object' && foodSlot.quantity !== undefined) {
            return foodSlot.quantity;
        }

        // Legacy format: string ID (shouldn't happen with new system)
        return 0;
    },

    /**
     * Calculate auto-eat threshold (20% of max HP by default)
     */
    calculateAutoEatThreshold(player) {
        const mult = player.perkMultipliers || {};
        const maxHP = this.calculateMaxHP(player);

        // Fixed 20% of max HP, modified by perk only
        return Math.ceil(maxHP * 0.20 * (mult.autoEatThreshold || 1.0));
    },

    /**
     * Calculate auto-eat efficiency (base 50% + intellect bonus)
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
     * Prefers pre-compiled maxHP from combat start, falls back to calculation
     */
    calculateMaxHP(player) {
        // Use pre-compiled maxHP if available (includes equipment bonuses, perks, etc.)
        if (player.maxHP && player.maxHP > 0) {
            return player.maxHP;
        }

        // Fallback: try to get from GameEngine's compiled stats
        if (typeof GameEngine !== 'undefined' && GameEngine.state?.compiledStats?.maxHealth) {
            return GameEngine.state.compiledStats.maxHealth;
        }

        // Last resort: calculate manually (won't include equipment bonuses)
        const mult = player.perkMultipliers || {};
        const health = player.combatAttributes?.health || 0;

        const baseHP = 100;
        const attributeHP = health * 10 * (mult.healthScaling || 1.0);
        const totalHP = baseHP + attributeHP;

        return Math.floor(totalHP * (mult.maxHealth || 1.0));
    },

    /**
     * Process auto-eat attempt
     * When HP <= threshold, consume items until full HP (at efficiency rate)
     * Returns healing info or null if no action taken
     */
    processAutoEat(player, combat) {
        // Check for dev infinite food mode
        if (typeof DevFoodTools !== 'undefined' && DevFoodTools.infiniteFoodEnabled) {
            return this.processInfiniteAutoEat(player, combat);
        }

        const threshold = this.calculateAutoEatThreshold(player);
        const maxHP = this.calculateMaxHP(player);

        // Check if HP is below threshold
        if (player.currentHP > threshold) {
            return null;
        }

        // Check cooldown (1 second between auto-eats)
        if (combat.lastAutoEat && Date.now() - combat.lastAutoEat < 1000) {
            return null;
        }

        // Get food from equipment slot (new format: { itemId, quantity })
        const foodSlot = player.equipment?.food;
        if (!foodSlot || typeof foodSlot !== 'object') {
            return { success: false, reason: 'No food equipped' };
        }

        const { itemId, quantity } = foodSlot;
        if (!itemId || quantity <= 0) {
            return { success: false, reason: 'No food remaining' };
        }

        // Get food definition
        const foodDef = this.getFoodDefinition(foodSlot);
        if (!foodDef) {
            return { success: false, reason: 'Food definition not found' };
        }

        // Get consumable perk multipliers
        const consumablePerks = this.getConsumablePerkMultipliers();
        const efficiency = this.calculateAutoEatEfficiency(player);

        // Calculate heal per item (at efficiency rate for auto-eat)
        const healValue = foodDef.healAmount || foodDef.effectValue || 0;
        const healPerItem = Math.floor(healValue * efficiency * consumablePerks.foodHealing);

        if (healPerItem <= 0) {
            return { success: false, reason: 'Food has no heal value' };
        }

        // Calculate how much HP we need to restore
        const hpNeeded = maxHP - player.currentHP;

        // Calculate how many items needed to reach full HP
        let itemsNeeded = Math.ceil(hpNeeded / healPerItem);

        // Limit to available quantity
        let itemsToConsume = Math.min(itemsNeeded, quantity);

        // Apply conservation - each item has a chance to not be consumed
        let itemsActuallyConsumed = 0;
        let totalHealed = 0;

        for (let i = 0; i < itemsToConsume; i++) {
            // Check if we're already at full HP
            if (player.currentHP >= maxHP) break;

            // Apply healing
            const oldHP = player.currentHP;
            player.currentHP = Math.min(maxHP, player.currentHP + healPerItem);
            totalHealed += (player.currentHP - oldHP);

            // Check conservation - only consume if roll fails
            if (this.shouldConsumeItem('food')) {
                itemsActuallyConsumed++;
            }
        }

        // Decrement equipped food quantity
        foodSlot.quantity -= itemsActuallyConsumed;

        // Track in session stats
        if (combat.session) {
            combat.session.foodConsumed = (combat.session.foodConsumed || 0) + itemsActuallyConsumed;
            combat.session.foodConserved = (combat.session.foodConserved || 0) + (itemsToConsume - itemsActuallyConsumed);
        }

        combat.lastAutoEat = Date.now();

        // Emit event for UI updates
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('food-consumed', {
                itemId: itemId,
                consumed: itemsActuallyConsumed,
                remaining: foodSlot.quantity
            });
        }

        return {
            success: true,
            healed: totalHealed,
            itemsConsumed: itemsActuallyConsumed,
            itemsUsed: itemsToConsume,
            foodId: itemId,
            foodName: foodDef.name,
            remaining: foodSlot.quantity,
            efficiency: efficiency,
            threshold: threshold,
            healMultiplier: consumablePerks.foodHealing
        };
    },

    /**
     * Manual eat - consume 1 food item at 100% efficiency
     * Called when player clicks "Eat" button
     */
    manualEat(player) {
        const maxHP = this.calculateMaxHP(player);

        // Already at full HP
        if (player.currentHP >= maxHP) {
            return { success: false, reason: 'Already at full HP' };
        }

        // Get food from equipment slot
        const foodSlot = player.equipment?.food;
        if (!foodSlot || typeof foodSlot !== 'object') {
            return { success: false, reason: 'No food equipped' };
        }

        const { itemId, quantity } = foodSlot;
        if (!itemId || quantity <= 0) {
            return { success: false, reason: 'No food remaining' };
        }

        // Get food definition
        const foodDef = this.getFoodDefinition(foodSlot);
        if (!foodDef) {
            return { success: false, reason: 'Food definition not found' };
        }

        // Get consumable perk multipliers
        const consumablePerks = this.getConsumablePerkMultipliers();

        // Calculate heal at 100% efficiency (manual eat is full value)
        const healValue = foodDef.healAmount || foodDef.effectValue || 0;
        const healAmount = Math.floor(healValue * consumablePerks.foodHealing);

        // Apply healing
        const oldHP = player.currentHP;
        player.currentHP = Math.min(maxHP, player.currentHP + healAmount);
        const actualHealed = player.currentHP - oldHP;

        // Always consume 1 item for manual eat (no conservation)
        foodSlot.quantity--;

        // Track in session stats
        if (player.combat?.session) {
            player.combat.session.foodConsumed = (player.combat.session.foodConsumed || 0) + 1;
        }

        // Emit event for UI updates
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('food-consumed', {
                itemId: itemId,
                consumed: 1,
                remaining: foodSlot.quantity,
                manual: true
            });
        }

        return {
            success: true,
            healed: actualHealed,
            foodId: itemId,
            foodName: foodDef.name,
            remaining: foodSlot.quantity,
            efficiency: 1.0,
            healMultiplier: consumablePerks.foodHealing
        };
    },

    /**
     * Get active food effects
     * Effects are active while food quantity > 0
     */
    getActiveFoodEffects(player) {
        const foodSlot = player.equipment?.food;
        if (!foodSlot || typeof foodSlot !== 'object') {
            return null;
        }

        const { itemId, quantity } = foodSlot;
        if (!itemId || quantity <= 0) {
            return null;
        }

        const foodDef = this.getFoodDefinition(foodSlot);
        if (!foodDef || !foodDef.effect) {
            return null;
        }

        // Return effect (e.g., { stat: 'strength', amount: 1 })
        return {
            ...foodDef.effect,
            source: 'food',
            foodId: itemId,
            foodName: foodDef.name
        };
    },

    /**
     * Process auto-eat in infinite food mode (dev tool)
     * Heals without consuming food
     */
    processInfiniteAutoEat(player, combat) {
        const threshold = this.calculateAutoEatThreshold(player);
        const maxHP = this.calculateMaxHP(player);

        if (player.currentHP > threshold) {
            return null;
        }

        if (combat.lastAutoEat && Date.now() - combat.lastAutoEat < 1000) {
            return null;
        }

        const foodSlot = player.equipment?.food;
        const foodDef = this.getFoodDefinition(foodSlot);

        const consumablePerks = this.getConsumablePerkMultipliers();
        const efficiency = this.calculateAutoEatEfficiency(player);
        const healValue = foodDef?.healAmount || foodDef?.effectValue || 50;

        // Heal to full HP instantly in dev mode
        const oldHP = player.currentHP;
        player.currentHP = maxHP;
        const actualHealed = player.currentHP - oldHP;

        combat.lastAutoEat = Date.now();

        return {
            success: true,
            healed: actualHealed,
            itemsConsumed: 0,
            foodId: foodSlot?.itemId || 'dev_food',
            foodName: (foodDef?.name || 'Dev Food') + ' [INFINITE]',
            remaining: foodSlot?.quantity || 999,
            efficiency: efficiency,
            threshold: threshold,
            devMode: true
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
            const weaponSlot = player.equipment?.weapon;
            const weaponDef = this.getWeaponDefinition(weaponSlot);
            if (!weaponDef || !weaponDef.requiresAmmo) {
                return { success: true, reason: 'Weapon does not require ammo' };
            }
        }

        // Get ammo from equipment slot (new format: { itemId, quantity })
        const ammoSlot = player.equipment?.ammo;
        if (!ammoSlot || typeof ammoSlot !== 'object') {
            return {
                success: false,
                reason: 'No ammo equipped',
                weaponName: compiledWeapon?.name || 'weapon'
            };
        }

        const { itemId, quantity } = ammoSlot;
        if (!itemId || quantity <= 0) {
            return {
                success: false,
                reason: 'Out of ammo',
                weaponName: compiledWeapon?.name || 'weapon'
            };
        }

        // Check ammo conservation - only consume if roll fails
        const wasConsumed = this.shouldConsumeItem('ammo');
        if (wasConsumed) {
            ammoSlot.quantity--;
        }

        // Keep the compiled combat snapshot (what the combat UI reads) in sync with the
        // live equipped slot, so the on-screen ammo count drops by 1 as rounds are spent.
        if (combat?.playerAmmo) {
            combat.playerAmmo.currentAmmo = ammoSlot.quantity;
        }

        // Track in session stats
        if (combat?.session) {
            if (wasConsumed) {
                combat.session.ammoConsumed = (combat.session.ammoConsumed || 0) + 1;
            } else {
                combat.session.ammoConserved = (combat.session.ammoConserved || 0) + 1;
            }
        }

        const ammoDef = this.getAmmoDefinition(ammoSlot);
        return {
            success: true,
            ammoUsed: itemId,
            ammoName: ammoDef?.name || 'ammo',
            remaining: ammoSlot.quantity,
            wasConsumed: wasConsumed
        };
    },

    /**
     * Get potion/serum definition from the equipped potion slot
     * (mirrors getFoodDefinition)
     */
    getPotionDefinition(potionSlot) {
        if (!potionSlot) return null;
        const itemId = typeof potionSlot === 'object' ? potionSlot.itemId : potionSlot;
        if (!itemId) return null;
        if (typeof ItemIdUtils !== 'undefined') return ItemIdUtils.getItemDefinition(itemId);
        if (typeof ItemRegistry !== 'undefined') return ItemRegistry.getItem(itemId);
        return null;
    },

    /**
     * Drop any expired timed effects from player.activeEffects.
     * Safe to call every tick.
     */
    pruneExpiredEffects(player) {
        if (!player || !player.activeEffects || !player.activeEffects.length) return;
        const now = Date.now();
        player.activeEffects = player.activeEffects.filter(e => !e.expiresAt || e.expiresAt > now);
    },

    /**
     * Process a serum/potion DOSE.
     *
     * Like food and ammo, the equipped `potion` slot is a consumable that depletes
     * through use — but a serum is DOSED to keep a timed buff up: when the serum's
     * buff lapses it is re-dosed, consuming 1 from the slot. Runs during combat
     * (pass the combat object as context) and during skilling (pass {}). When the
     * slot is empty the buff simply ends — craft/loot and equip more.
     *
     * Effect channels supported now (no stat-pipeline surgery, so they're reliable):
     *   - def.effect.damageReduction  -> timed %DR, read directly by DamageCalculator
     *   - def.effectType === 'heal'   -> heal-on-dose (combat only), uses effectValue
     * Only serums that define a timed buff (effect.duration or def.duration) auto-dose,
     * so a one-shot heal item won't spam. Generic { stat, amount } buffs are recorded on
     * activeEffects for future readers (broader stat application is a follow-up — it needs
     * the attributes/combatAttributes pipeline reconciled, same work that gates food buffs).
     *
     * @param {Object} player - player state (GameEngine.state)
     * @param {Object} [context] - { inCombat?, session? }
     * @returns {Object|null} dose info, or null if nothing was dosed
     */
    processSerumDose(player, context = {}) {
        const potionSlot = player?.equipment?.potion;
        if (!potionSlot || typeof potionSlot !== 'object') return null;

        const { itemId, quantity } = potionSlot;
        if (!itemId || quantity <= 0) return null;

        const def = this.getPotionDefinition(potionSlot);
        if (!def) return null;

        // Only timed-buff serums auto-dose (prevents one-shot items from spamming).
        const duration = (def.effect && def.effect.duration) || def.duration;
        if (!duration) return null;

        this.pruneExpiredEffects(player);
        const now = Date.now();

        // If this serum's buff is still active, don't re-dose yet.
        const alreadyActive = (player.activeEffects || []).some(
            e => e.source === 'serum' && e.serumId === itemId && e.expiresAt > now
        );
        if (alreadyActive) return null;

        // Throttle so a burst of attacks/harvests can't dump the whole stack at once.
        if (player._lastSerumDose && (now - player._lastSerumDose) < 1000) return null;
        player._lastSerumDose = now;

        // Conservation (base 1.0 = always consume).
        const wasConsumed = this.shouldConsumeItem('potion');
        if (wasConsumed) {
            potionSlot.quantity--;
        }

        const perks = this.getConsumablePerkMultipliers();

        // Apply the timed effect.
        if (!player.activeEffects) player.activeEffects = [];
        const effect = {
            source: 'serum',
            serumId: itemId,
            name: def.name,
            appliedAt: now,
            expiresAt: now + duration
        };
        if (def.effect && def.effect.damageReduction) {
            effect.damageReduction = def.effect.damageReduction;
        }
        if (def.effect && def.effect.stat && def.effect.amount) {
            effect.stat = def.effect.stat;
            effect.amount = def.effect.amount;
        }
        player.activeEffects.push(effect);

        // Heal-on-dose (combat only — avoids surprise healing while skilling).
        let healed = 0;
        if (context.inCombat && def.effectType === 'heal' && def.effectValue) {
            const maxHP = this.calculateMaxHP(player);
            const healAmt = Math.floor(def.effectValue * (perks.potionPotency || 1.0));
            const oldHP = player.currentHP || 0;
            player.currentHP = Math.min(maxHP, oldHP + healAmt);
            healed = player.currentHP - oldHP;
        }

        // Session stats
        if (context.session) {
            if (wasConsumed) context.session.serumsConsumed = (context.session.serumsConsumed || 0) + 1;
            else context.session.serumsConserved = (context.session.serumsConserved || 0) + 1;
        }

        if (typeof EventBus !== 'undefined') {
            EventBus.emit('serum-dosed', { itemId, remaining: potionSlot.quantity, healed });
        }

        return {
            success: true,
            serumId: itemId,
            serumName: def.name,
            healed,
            remaining: potionSlot.quantity,
            wasConsumed,
            expiresAt: effect.expiresAt
        };
    },

    /**
     * Get weapon definition helper
     */
    getWeaponDefinition(weaponSlot) {
        if (!weaponSlot) return null;
        const itemId = typeof weaponSlot === 'string' ? weaponSlot : weaponSlot.itemId;
        if (!itemId) return null;

        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getItemDefinition(itemId);
        }
        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getItem(itemId);
        }
        return null;
    },

    /**
     * Get ammo definition helper
     */
    getAmmoDefinition(ammoSlot) {
        if (!ammoSlot) return null;
        const itemId = typeof ammoSlot === 'object' ? ammoSlot.itemId : ammoSlot;
        if (!itemId) return null;

        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getItemDefinition(itemId);
        }
        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getItem(itemId);
        }
        return null;
    },

    /**
     * Check if player can attack (has ammo if needed)
     */
    canAttack(player) {
        // First check: use compiled weapon data if available
        const compiledWeapon = player.combat?.compiledWeapon;
        if (compiledWeapon) {
            if (!compiledWeapon.requiresAmmo) {
                return { canAttack: true };
            }

            // Check ammo
            const ammoSlot = player.equipment?.ammo;
            if (!ammoSlot || typeof ammoSlot !== 'object' || ammoSlot.quantity <= 0) {
                return {
                    canAttack: false,
                    reason: 'Out of ammo',
                    weaponName: compiledWeapon.name
                };
            }

            return { canAttack: true };
        }

        // Fallback: resolve from equipment
        const weaponSlot = player.equipment?.weapon;
        if (!weaponSlot) {
            return { canAttack: false, reason: 'No weapon equipped' };
        }

        const weaponDef = this.getWeaponDefinition(weaponSlot);
        if (!weaponDef) {
            return { canAttack: false, reason: 'Weapon not found in registry' };
        }

        if (!weaponDef.requiresAmmo) {
            return { canAttack: true };
        }

        // Check ammo
        const ammoSlot = player.equipment?.ammo;
        if (!ammoSlot || typeof ammoSlot !== 'object' || ammoSlot.quantity <= 0) {
            return {
                canAttack: false,
                reason: 'Out of ammo',
                weaponName: weaponDef.name
            };
        }

        return { canAttack: true };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoConsumption;
}
