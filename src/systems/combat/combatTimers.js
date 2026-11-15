/**
 * COMBAT TIMERS
 *
 * Attack interval management and weight penalty system
 */

const CombatTimers = {
    /**
     * Calculate weight limit (carry threshold).
     * Threshold = 10 + Strength/2, scaled by any weightCapacity perk.
     */
    calculateWeightLimit(player) {
        const mult = player.perkMultipliers || player.compiledStats?.perkMultipliers || {};
        // Combat snapshots expose `attributes`; GameEngine.state exposes `combatAttributes`.
        const strength = player.attributes?.strength ?? player.combatAttributes?.strength ?? 0;

        const baseLimit = 10 + (strength / 2);
        return baseLimit * (mult.weightCapacity || 1.0);
    },

    /**
     * Calculate current weight
     */
    calculateCurrentWeight(player) {
        const compiled = player.compiledStats || { weight: 0 };
        return compiled.weight || 0;
    },

    /**
     * Weight limit from GameEngine.state (non-combat systems read combatAttributes).
     */
    getStateWeightLimit(state) {
        const mult = state?.compiledStats?.perkMultipliers || {};
        const strength = state?.combatAttributes?.strength || 0;
        const baseLimit = 10 + (strength / 2);
        return baseLimit * (mult.weightCapacity || 1.0);
    },

    /**
     * Graduated overweight interval multiplier (>= 1.0) from GameEngine.state.
     * Shared by gathering, crafting and navigation so every activity slows the same
     * way the attack interval does. Returns 1.0 when within the carry threshold.
     */
    getStateOverweightPenalty(state) {
        if (!state) return 1.0;
        const weight = state.compiledStats?.weight || 0;
        const limit = this.getStateWeightLimit(state);
        return this.calculateOverweightPenalty(weight, limit).penalty;
    },

    /**
     * Calculate overweight penalty
     */
    calculateOverweightPenalty(currentWeight, weightLimit) {
        if (currentWeight <= weightLimit) {
            return {
                overweight: false,
                penalty: 1.0,
                overPercent: 0,
                severity: 'none',
                message: null
            };
        }

        const overPercent = (currentWeight - weightLimit) / weightLimit;
        const penalty = Math.min(10.0, 1.0 + (overPercent * 5.0));

        let severity;
        if (overPercent <= 0.10) severity = 'slightly';
        else if (overPercent <= 0.25) severity = 'noticeably';
        else if (overPercent <= 0.50) severity = 'heavily';
        else severity = 'extremely';

        return {
            overweight: true,
            overPercent: overPercent,
            penalty: penalty,
            severity: severity,
            message: `You are ${severity} overburdened! Attack speed reduced by ${((penalty - 1) * 100).toFixed(0)}%`
        };
    },

    /**
     * Calculate mobility factor (attack speed modifier).
     *
     * Mobility is a SPEED BONUS measured from a 1.0× baseline, never a penalty:
     * a brand-new character (mobility ~1) attacks at roughly the weapon's base
     * interval, and investing in mobility makes attacks faster down to a floor.
     * (The old curve started at 3.0× — i.e. every low-mobility character attacked
     * ~3× slower than their weapon's base, which made early combat unwinnable and
     * disagreed with the character sheet.)
     *
     * factor = clamp(1.0 - mobility * 0.01, floor 0.4, ceil 1.0)
     *   mobility   0 → 1.00×   (weapon base)
     *   mobility   1 → 0.99×
     *   mobility  30 → 0.70×
     *   mobility ≥60 → 0.40×   (floor: 2.5× faster than base)
     */
    calculateMobilityFactor(player) {
        const mobility = player.attributes?.mobility || 0;
        const mobilityFactor = Math.min(1.0, Math.max(0.4, 1.0 - (mobility * 0.01)));
        return mobilityFactor;
    },

    /**
     * Calculate final attack interval
     * attackInterval = baseInterval × mobilityFactor × overweightPenalty / attackSpeedPerk
     */
    calculateAttackInterval(player, baseInterval) {
        const mult = player.perkMultipliers || {};

        // Get mobility factor
        const mobilityFactor = this.calculateMobilityFactor(player);

        // Get overweight penalty
        const weightLimit = this.calculateWeightLimit(player);
        const currentWeight = this.calculateCurrentWeight(player);
        const overweightData = this.calculateOverweightPenalty(currentWeight, weightLimit);

        // Calculate final interval
        const attackSpeedMult = mult.attackSpeed || 1.0;
        const finalInterval = baseInterval * mobilityFactor * overweightData.penalty / attackSpeedMult;

        return {
            interval: finalInterval,
            baseInterval: baseInterval,
            mobilityFactor: mobilityFactor,
            overweightPenalty: overweightData.penalty,
            attackSpeedMult: attackSpeedMult,
            breakdown: {
                mobility: player.attributes?.mobility || 0,
                weight: {
                    current: currentWeight,
                    limit: weightLimit,
                    overweight: overweightData.overweight,
                    severity: overweightData.severity
                }
            }
        };
    },

    /**
     * Update attack timer (called each tick)
     * Returns true if ready to attack
     */
    updateTimer(timerState, deltaTime, attackInterval) {
        timerState.elapsed += deltaTime;

        if (timerState.elapsed >= attackInterval) {
            timerState.elapsed = 0;
            return true;
        }

        return false;
    },

    /**
     * Get timer progress (0.0 to 1.0)
     */
    getTimerProgress(timerState, attackInterval) {
        if (attackInterval === 0) return 1.0;
        return Math.min(1.0, timerState.elapsed / attackInterval);
    },

    /**
     * Reset timer
     */
    resetTimer(timerState) {
        timerState.elapsed = 0;
    },

    /**
     * Create new timer state
     */
    createTimerState() {
        return {
            elapsed: 0
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatTimers;
}
