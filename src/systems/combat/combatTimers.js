/**
 * COMBAT TIMERS
 *
 * Attack interval management and weight penalty system
 */

const CombatTimers = {
    /**
     * Calculate weight limit
     */
    calculateWeightLimit(player) {
        const mult = player.perkMultipliers || {};
        const strength = player.attributes?.strength || 0;

        const baseLimit = 9 + strength;
        return Math.floor(baseLimit * (mult.weightCapacity || 1.0));
    },

    /**
     * Calculate current weight
     */
    calculateCurrentWeight(player) {
        const compiled = player.compiledStats || { weight: 0 };
        return compiled.weight || 0;
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
     * Calculate mobility factor (attack speed modifier)
     */
    calculateMobilityFactor(player) {
        const mult = player.perkMultipliers || {};
        const mobility = player.attributes?.mobility || 0;

        // Mobility reduces the factor from 3.0× (at 0) to 0.1× (at max)
        const mobilityFactor = Math.max(0.1, 3.0 - (mobility * 0.029));

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
