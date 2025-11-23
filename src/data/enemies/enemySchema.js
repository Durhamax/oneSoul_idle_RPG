/**
 * ENEMY SCHEMA
 *
 * Defines the structure and validation rules for enemy definitions.
 * Used by EnemyValidator to ensure data consistency.
 */

const EnemySchema = {
    /**
     * Required fields that must be present
     */
    required: [
        'name',          // Display name
        'description',   // Flavor text
        'stats'          // Combat statistics
    ],

    /**
     * Optional fields that can be present
     */
    optional: [
        'image',         // Icon/sprite
        'icon',          // Alternative to image
        'tier',          // Difficulty tier (1-5)
        'type',          // Enemy type (humanoid, beast, undead, etc.)
        'difficulty',    // Difficulty label (easy, medium, hard, boss)
        'isBoss',        // Is this a boss enemy?
        'rewards',       // Loot/rewards
        'lootTable',     // Drop table
        'abilities',     // Special abilities
        'resistances',   // Damage resistances
        'weaknesses',    // Damage weaknesses
        'spawnLocations', // Where enemy spawns
        'spawnWeight',   // Spawn probability
        'respawnTime',   // Respawn timer
        'unlockRequirement', // Requirements to encounter
        'behaviorAI',    // AI behavior patterns
        'tags',          // Classification tags
        'customData'     // Custom game-specific data
    ],

    /**
     * Field definitions with types and validation rules
     */
    fields: {
        // Basic Info
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            description: 'Enemy display name'
        },

        description: {
            type: 'string',
            minLength: 1,
            maxLength: 500,
            description: 'Enemy description/flavor text'
        },

        image: {
            type: 'string',
            description: 'Icon/emoji for the enemy'
        },

        icon: {
            type: 'string',
            description: 'Alternative icon field'
        },

        // Classification
        tier: {
            type: 'number',
            min: 1,
            max: 10,
            description: 'Enemy tier (difficulty level)'
        },

        type: {
            type: 'string',
            enum: ['humanoid', 'beast', 'undead', 'demon', 'elemental', 'construct', 'dragon', 'aberration'],
            description: 'Enemy type/species'
        },

        difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard', 'elite', 'boss', 'world_boss'],
            description: 'Difficulty classification'
        },

        isBoss: {
            type: 'boolean',
            description: 'Is this a boss enemy?'
        },

        // Combat Stats
        stats: {
            type: 'object',
            required: ['maxHealth'],
            fields: {
                maxHealth: {
                    type: 'number',
                    min: 1,
                    description: 'Maximum health points'
                },
                attackDamage: {
                    type: 'number',
                    min: 0,
                    description: 'Base attack damage'
                },
                attackSpeed: {
                    type: 'number',
                    min: 0.1,
                    max: 10,
                    description: 'Attacks per second'
                },
                defense: {
                    type: 'number',
                    min: 0,
                    description: 'Defense/armor value'
                },
                accuracy: {
                    type: 'number',
                    min: 0,
                    max: 100,
                    description: 'Hit chance percentage'
                },
                evasion: {
                    type: 'number',
                    min: 0,
                    max: 100,
                    description: 'Dodge chance percentage'
                },
                critChance: {
                    type: 'number',
                    min: 0,
                    max: 100,
                    description: 'Critical hit chance percentage'
                },
                critMultiplier: {
                    type: 'number',
                    min: 1,
                    description: 'Critical damage multiplier'
                },
                armorType: {
                    type: 'string',
                    enum: ['none', 'biological', 'light', 'medium', 'heavy', 'magical'],
                    description: 'Armor type'
                },
                damageType: {
                    type: 'string',
                    enum: ['physical', 'pierce', 'slash', 'blunt', 'fire', 'ice', 'lightning', 'holy', 'shadow', 'poison'],
                    description: 'Primary damage type'
                }
            }
        },

        // Rewards
        rewards: {
            type: 'object',
            fields: {
                gold: {
                    type: 'object',
                    fields: {
                        min: { type: 'number', min: 0 },
                        max: { type: 'number', min: 0 }
                    }
                },
                medals: {
                    type: 'object',
                    fields: {
                        min: { type: 'number', min: 0 },
                        max: { type: 'number', min: 0 }
                    }
                },
                exp: {
                    type: 'object',
                    description: 'Experience rewards by skill'
                }
            }
        },

        lootTable: {
            type: 'array',
            description: 'Item drop table',
            items: {
                type: 'object',
                fields: {
                    itemId: { type: 'string' },
                    chance: { type: 'number', min: 0, max: 100 },
                    minQuantity: { type: 'number', min: 1 },
                    maxQuantity: { type: 'number', min: 1 }
                }
            }
        },

        // Abilities
        abilities: {
            type: 'array',
            description: 'Special abilities',
            items: {
                type: 'object',
                fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    cooldown: { type: 'number', min: 0 },
                    effect: { type: 'string' }
                }
            }
        },

        // Resistances/Weaknesses
        resistances: {
            type: 'object',
            description: 'Damage resistances (percentage reduction)',
            fields: {
                physical: { type: 'number', min: -100, max: 100 },
                fire: { type: 'number', min: -100, max: 100 },
                ice: { type: 'number', min: -100, max: 100 },
                lightning: { type: 'number', min: -100, max: 100 },
                holy: { type: 'number', min: -100, max: 100 },
                shadow: { type: 'number', min: -100, max: 100 },
                poison: { type: 'number', min: -100, max: 100 }
            }
        },

        weaknesses: {
            type: 'object',
            description: 'Damage weaknesses (percentage increase)',
            fields: {
                physical: { type: 'number', min: -100, max: 100 },
                fire: { type: 'number', min: -100, max: 100 },
                ice: { type: 'number', min: -100, max: 100 },
                lightning: { type: 'number', min: -100, max: 100 },
                holy: { type: 'number', min: -100, max: 100 },
                shadow: { type: 'number', min: -100, max: 100 },
                poison: { type: 'number', min: -100, max: 100 }
            }
        },

        // Spawning
        spawnLocations: {
            type: 'array',
            description: 'Regions/locations where enemy spawns',
            items: { type: 'string' }
        },

        spawnWeight: {
            type: 'number',
            min: 0,
            max: 100,
            description: 'Relative spawn probability'
        },

        respawnTime: {
            type: 'number',
            min: 0,
            description: 'Respawn time in milliseconds'
        },

        unlockRequirement: {
            type: 'object',
            description: 'Requirements to encounter this enemy',
            nullable: true
        },

        // AI
        behaviorAI: {
            type: 'string',
            enum: ['passive', 'defensive', 'aggressive', 'tactical', 'berserker', 'support'],
            description: 'AI behavior pattern'
        },

        // Metadata
        tags: {
            type: 'array',
            description: 'Classification tags',
            items: { type: 'string' }
        },

        customData: {
            type: 'object',
            description: 'Custom game-specific data'
        }
    }
};
