/**
 * PRODUCTION ATTRIBUTES
 *
 * Core combat attributes that define character capabilities.
 * These are the 7 fundamental attributes in the game.
 */

(function() {
'use strict';

const attributes = {
    health: {
        id: 'health',
        name: 'Health',
        description: 'Maximum hit points. Determines how much damage you can take before death.',
        icon: '❤️',
        category: 'defensive',
        baseValue: 100,
        scalingFactor: 10,
        tags: ['core', 'defensive', 'vital']
    },

    defense: {
        id: 'defense',
        name: 'Defense',
        description: 'Reduces incoming physical damage. Each point reduces damage by a percentage.',
        icon: '🛡️',
        category: 'defensive',
        baseValue: 0,
        scalingFactor: 1,
        tags: ['core', 'defensive', 'mitigation']
    },

    strength: {
        id: 'strength',
        name: 'Strength',
        description: 'Increases physical damage dealt. Raw power in combat.',
        icon: '💪',
        category: 'offensive',
        baseValue: 10,
        scalingFactor: 2,
        tags: ['core', 'offensive', 'damage']
    },

    stealth: {
        id: 'stealth',
        name: 'Stealth',
        description: 'Improves ambush damage and thieving success rate.',
        icon: '🥷',
        category: 'utility',
        baseValue: 0,
        scalingFactor: 1,
        tags: ['core', 'utility', 'thieving']
    },

    perception: {
        id: 'perception',
        name: 'Perception',
        description: 'Increases accuracy and critical hit chance. Better awareness in combat.',
        icon: '👁️',
        category: 'offensive',
        baseValue: 50,
        scalingFactor: 2,
        tags: ['core', 'offensive', 'accuracy']
    },

    mobility: {
        id: 'mobility',
        name: 'Mobility',
        description: 'Increases evasion chance. Makes you harder to hit.',
        icon: '🏃',
        category: 'defensive',
        baseValue: 0,
        scalingFactor: 1,
        tags: ['core', 'defensive', 'evasion']
    },

    intellect: {
        id: 'intellect',
        name: 'Intellect',
        description: 'Improves magic damage and skill experience gain.',
        icon: '🧠',
        category: 'utility',
        baseValue: 10,
        scalingFactor: 1,
        tags: ['core', 'utility', 'magic', 'experience']
    }
};

// Register all attributes to production registry
AttributeRegistry.registerBatch(attributes, 'production');

console.log('✅ Loaded 7 production attributes');

})();
