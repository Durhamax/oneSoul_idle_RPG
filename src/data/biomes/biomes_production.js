/**
 * PRODUCTION BIOMES
 *
 * Environmental biome definitions that define regions and resource distributions.
 */

(function() {
'use strict';

const biomes = {
    plains: {
        id: 'plains',
        name: 'Plains',
        baseComplication: 1.0,
        description: 'Open grasslands with gentle rolling hills. Good for beginners.',
        icon: '🌾',
        climate: 'temperate',
        terrain: 'flat',
        difficulty: 'easy',
        tier: 1,
        resources: ['copper', 'tin', 'herbs', 'rabbits'],
        enemies: ['wolf', 'bandit'],
        tags: ['starter', 'temperate', 'open']
    },

    forest: {
        id: 'forest',
        name: 'Forest',
        baseComplication: 1.2,
        description: 'Dense woodland filled with valuable timber and wildlife.',
        icon: '🌲',
        climate: 'temperate',
        terrain: 'wooded',
        difficulty: 'easy',
        tier: 1,
        resources: ['oak', 'pine', 'deer', 'mushrooms'],
        enemies: ['bear', 'wolf'],
        tags: ['starter', 'temperate', 'wooded']
    },

    coast: {
        id: 'coast',
        name: 'Coast',
        baseComplication: 1.5,
        description: 'Rocky shoreline with abundant fish and sea resources.',
        icon: '🏖️',
        climate: 'coastal',
        terrain: 'mixed',
        difficulty: 'medium',
        tier: 2,
        resources: ['fish', 'salt', 'crabs', 'seaweed'],
        enemies: ['pirate', 'sea_serpent'],
        tags: ['water', 'coastal', 'fishing']
    },

    mountains: {
        id: 'mountains',
        name: 'Mountains',
        baseComplication: 2.0,
        description: 'Treacherous peaks rich with precious ores and gems.',
        icon: '⛰️',
        climate: 'alpine',
        terrain: 'mountainous',
        difficulty: 'hard',
        tier: 3,
        resources: ['iron', 'silver', 'gold', 'gems'],
        enemies: ['troll', 'wyvern'],
        tags: ['dangerous', 'mining', 'high_altitude']
    },

    desert: {
        id: 'desert',
        name: 'Desert',
        baseComplication: 2.2,
        description: 'Harsh arid wasteland with rare but valuable resources.',
        icon: '🏜️',
        climate: 'arid',
        terrain: 'sandy',
        difficulty: 'hard',
        tier: 3,
        resources: ['cactus', 'scorpions', 'rare_gems', 'ancient_artifacts'],
        enemies: ['sand_worm', 'nomad'],
        tags: ['dangerous', 'hot', 'rare_resources']
    },

    swamp: {
        id: 'swamp',
        name: 'Swamp',
        baseComplication: 1.7,
        description: 'Murky wetlands filled with poisonous creatures and rare herbs.',
        icon: '🐊',
        climate: 'humid',
        terrain: 'wetland',
        difficulty: 'medium',
        tier: 2,
        resources: ['moss', 'poison_herbs', 'alligators', 'frogs'],
        enemies: ['lizardman', 'giant_spider'],
        tags: ['wet', 'poisonous', 'herbs']
    },

    tundra: {
        id: 'tundra',
        name: 'Tundra',
        baseComplication: 2.5,
        description: 'Frozen wasteland with extreme cold and rare ice-based resources.',
        icon: '❄️',
        climate: 'arctic',
        terrain: 'frozen',
        difficulty: 'very_hard',
        tier: 4,
        resources: ['ice_crystals', 'frozen_fish', 'mammoths', 'glacial_ore'],
        enemies: ['frost_giant', 'ice_drake'],
        tags: ['extreme', 'cold', 'endgame']
    }
};

// Register all biomes to production registry
BiomeRegistry.registerBatch(biomes, 'production');

console.log('✅ Loaded 7 production biomes');

})();
