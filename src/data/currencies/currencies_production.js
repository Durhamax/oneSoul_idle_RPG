/**
 * PRODUCTION CURRENCIES
 *
 * Core currency types used in the game economy.
 */

(function() {
'use strict';

const currencies = {
    gold: {
        id: 'gold',
        name: 'Gold',
        icon: '🪙',
        description: 'Common currency earned from combat and trading',
        abbreviation: 'g',
        maxStack: 999999999,
        tradeable: true,
        category: 'earnable',
        color: '#FFD700',
        sources: ['combat', 'missions', 'selling'],
        uses: ['buying', 'trading', 'upgrading'],
        tags: ['currency', 'common']
    },

    medals: {
        id: 'medals',
        name: 'Medals',
        icon: '🏅',
        description: 'War-trophy currency stripped from defeated Elaran soldiers; spent to roll perks. Higher-rank enemies drop more.',
        abbreviation: 'med',
        maxStack: 999999,
        tradeable: false,
        category: 'earnable',
        color: '#C0C0C0',
        sources: ['combat', 'elite_enemies'],
        uses: ['perk_rolls', 'perks'],
        tags: ['currency', 'combat', 'perks']
    },

    tomes: {
        id: 'tomes',
        name: 'Tomes',
        icon: '📖',
        description: 'Knowledge currency used for unlocking skills and recipes',
        abbreviation: 'tome',
        maxStack: 99999,
        tradeable: false,
        category: 'earnable',
        color: '#8B4513',
        sources: ['missions', 'exploring', 'studying'],
        uses: ['unlocking_skills', 'unlocking_recipes', 'research'],
        tags: ['currency', 'knowledge']
    },

    gems: {
        id: 'gems',
        name: 'Gems',
        icon: '💎',
        description: 'Premium currency (future use)',
        abbreviation: 'gem',
        maxStack: 99999,
        tradeable: false,
        category: 'premium',
        color: '#00FFFF',
        rarity: 'legendary',
        sources: ['rare_drops', 'special_events'],
        uses: ['cosmetics', 'convenience', 'special_features'],
        tags: ['currency', 'premium', 'rare']
    }
};

// Register all currencies to production registry
CurrencyRegistry.registerBatch(currencies, 'production');

console.log('✅ Loaded 4 production currencies');

})();
