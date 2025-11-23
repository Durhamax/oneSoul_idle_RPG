/**
 * PRODUCTION STANCES
 *
 * Combat stances that modify battle behavior and bonuses.
 */

(function() {
'use strict';

const stances = {
    offensive: {
        id: 'offensive',
        name: 'Offensive Stance',
        type: 'offensive',
        description: 'Aggressive combat posture. Increases damage dealt but reduces defense.',
        icon: '⚔️',
        effects: ['increased_damage', 'reduced_defense'],
        bonuses: {
            damageMultiplier: 1.25,
            critChance: 10,
            attackSpeed: 1.1
        },
        penalties: {
            defenseMultiplier: 0.8,
            evasion: -10
        },
        category: 'combat',
        tags: ['combat', 'offensive', 'damage']
    },

    defensive: {
        id: 'defensive',
        name: 'Defensive Stance',
        type: 'defensive',
        description: 'Protective combat posture. Increases defense but reduces damage output.',
        icon: '🛡️',
        effects: ['increased_defense', 'reduced_damage'],
        bonuses: {
            defenseMultiplier: 1.5,
            evasion: 15,
            damageReduction: 10
        },
        penalties: {
            damageMultiplier: 0.75,
            attackSpeed: 0.9
        },
        category: 'combat',
        tags: ['combat', 'defensive', 'tanking']
    }
};

// Register all stances to production registry
StanceRegistry.registerBatch(stances, 'production');

console.log('✅ Loaded 2 production stances');

})();
