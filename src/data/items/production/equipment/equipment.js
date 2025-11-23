/**
 * EQUIPMENT ITEMS
 *
 * All equippable items: weapons, armor, tools, accessories
 * Organized by equipment slot
 */

const EQUIPMENT_ITEMS = {
    // =================================================================
    // WEAPONS
    // =================================================================

    // Starter Weapons
    rustyDagger: {
        id: 'rustyDagger',
        name: 'Rusty Dagger',
        description: 'A worn dagger covered in rust. Better than nothing.',
        icon: '🗡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 5,
        level: 1,
        slot: 'weapon',
        tier: 'starter',
        combatStats: {
            damage: 3,
            attackSpeed: 1.2,
        },
        tags: ['weapon', 'dagger', 'melee', 'starter'],
    },

    woodenStaff: {
        id: 'woodenStaff',
        name: 'Wooden Staff',
        description: 'A simple wooden staff. Light and easy to handle.',
        icon: '🪵',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 10,
        level: 1,
        slot: 'weapon',
        tier: 'starter',
        combatStats: {
            damage: 4,
            attackSpeed: 1.0,
        },
        attributes: {
            wisdom: 1,
        },
        tags: ['weapon', 'staff', 'magic', 'starter'],
    },

    // Basic Weapons
    bronzeSword: {
        id: 'bronzeSword',
        name: 'Bronze Sword',
        description: 'A basic sword forged from bronze. Reliable for early adventures.',
        icon: '🗡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 50,
        level: 5,
        slot: 'weapon',
        tier: 'basic',
        combatStats: {
            damage: 10,
            attackSpeed: 1.0,
        },
        attributes: {
            strength: 2,
        },
        requirements: {
            combat: 5,
        },
        tags: ['weapon', 'sword', 'bronze', 'melee'],
    },

    ironSword: {
        id: 'ironSword',
        name: 'Iron Sword',
        description: 'A sturdy sword forged from iron. A warrior\'s reliable companion.',
        icon: '🗡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 150,
        level: 10,
        slot: 'weapon',
        tier: 'improved',
        combatStats: {
            damage: 18,
            attackSpeed: 1.0,
        },
        attributes: {
            strength: 3,
        },
        requirements: {
            combat: 10,
        },
        tags: ['weapon', 'sword', 'iron', 'melee'],
    },

    steelSword: {
        id: 'steelSword',
        name: 'Steel Sword',
        description: 'A finely crafted sword made of tempered steel. Sharp and deadly.',
        icon: '⚔️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'rare',
        stackLimit: 1,
        value: 400,
        level: 20,
        slot: 'weapon',
        tier: 'quality',
        combatStats: {
            damage: 30,
            attackSpeed: 1.0,
            critChance: 5,
        },
        attributes: {
            strength: 5,
            dexterity: 2,
        },
        requirements: {
            combat: 20,
        },
        tags: ['weapon', 'sword', 'steel', 'melee'],
    },

    // =================================================================
    // ARMOR - HEAD
    // =================================================================

    leatherCap: {
        id: 'leatherCap',
        name: 'Leather Cap',
        description: 'Simple leather headgear. Provides minimal protection.',
        icon: '🎩',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 30,
        level: 3,
        slot: 'head',
        tier: 'basic',
        combatStats: {
            defense: 3,
            health: 10,
        },
        tags: ['armor', 'head', 'leather'],
    },

    ironHelm: {
        id: 'ironHelm',
        name: 'Iron Helm',
        description: 'A solid iron helmet. Protects the head from serious damage.',
        icon: '⛑️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 180,
        level: 12,
        slot: 'head',
        tier: 'improved',
        combatStats: {
            defense: 12,
            health: 30,
        },
        attributes: {
            constitution: 2,
        },
        requirements: {
            combat: 12,
        },
        tags: ['armor', 'head', 'iron', 'helmet'],
    },

    // =================================================================
    // ARMOR - BODY
    // =================================================================

    clothRobe: {
        id: 'clothRobe',
        name: 'Cloth Robe',
        description: 'Simple cloth robes favored by scholars and mages.',
        icon: '👘',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 40,
        level: 1,
        slot: 'body',
        tier: 'starter',
        combatStats: {
            defense: 2,
            health: 15,
        },
        attributes: {
            wisdom: 2,
        },
        tags: ['armor', 'body', 'cloth', 'robe'],
    },

    leatherArmor: {
        id: 'leatherArmor',
        name: 'Leather Armor',
        description: 'Flexible leather armor. Good balance of protection and mobility.',
        icon: '🦺',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 100,
        level: 5,
        slot: 'body',
        tier: 'basic',
        combatStats: {
            defense: 8,
            health: 25,
            evasion: 2,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            combat: 5,
        },
        tags: ['armor', 'body', 'leather'],
    },

    ironChestplate: {
        id: 'ironChestplate',
        name: 'Iron Chestplate',
        description: 'Heavy iron armor for the torso. Provides excellent protection.',
        icon: '🛡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 300,
        level: 15,
        slot: 'body',
        tier: 'improved',
        combatStats: {
            defense: 20,
            health: 50,
        },
        attributes: {
            constitution: 3,
            strength: 1,
        },
        requirements: {
            combat: 15,
        },
        tags: ['armor', 'body', 'iron', 'plate'],
    },

    // =================================================================
    // ARMOR - LEGS
    // =================================================================

    leatherPants: {
        id: 'leatherPants',
        name: 'Leather Pants',
        description: 'Durable leather leg protection.',
        icon: '👖',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 60,
        level: 5,
        slot: 'legs',
        tier: 'basic',
        combatStats: {
            defense: 5,
            health: 15,
        },
        tags: ['armor', 'legs', 'leather'],
    },

    ironGreaves: {
        id: 'ironGreaves',
        name: 'Iron Greaves',
        description: 'Iron leg armor. Heavy but protective.',
        icon: '🦵',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 200,
        level: 12,
        slot: 'legs',
        tier: 'improved',
        combatStats: {
            defense: 15,
            health: 35,
        },
        attributes: {
            constitution: 2,
        },
        requirements: {
            combat: 12,
        },
        tags: ['armor', 'legs', 'iron'],
    },

    // =================================================================
    // ARMOR - FEET
    // =================================================================

    leatherBoots: {
        id: 'leatherBoots',
        name: 'Leather Boots',
        description: 'Comfortable leather boots for long journeys.',
        icon: '👢',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 40,
        level: 3,
        slot: 'feet',
        tier: 'basic',
        combatStats: {
            defense: 3,
            evasion: 1,
        },
        tags: ['armor', 'feet', 'leather', 'boots'],
    },

    ironBoots: {
        id: 'ironBoots',
        name: 'Iron Boots',
        description: 'Heavy iron boots. Difficult to move quickly but very protective.',
        icon: '🥾',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 150,
        level: 10,
        slot: 'feet',
        tier: 'improved',
        combatStats: {
            defense: 10,
            health: 20,
        },
        attributes: {
            constitution: 1,
        },
        requirements: {
            combat: 10,
        },
        tags: ['armor', 'feet', 'iron', 'boots'],
    },

    // =================================================================
    // ARMOR - HANDS
    // =================================================================

    leatherGloves: {
        id: 'leatherGloves',
        name: 'Leather Gloves',
        description: 'Flexible leather gloves. Good grip and light protection.',
        icon: '🧤',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 35,
        level: 3,
        slot: 'hands',
        tier: 'basic',
        combatStats: {
            defense: 2,
            accuracy: 2,
        },
        tags: ['armor', 'hands', 'leather', 'gloves'],
    },

    ironGauntlets: {
        id: 'ironGauntlets',
        name: 'Iron Gauntlets',
        description: 'Heavy iron gauntlets. Increase punching power.',
        icon: '🥊',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 120,
        level: 10,
        slot: 'hands',
        tier: 'improved',
        combatStats: {
            defense: 8,
            damage: 3,
        },
        attributes: {
            strength: 1,
        },
        requirements: {
            combat: 10,
        },
        tags: ['armor', 'hands', 'iron', 'gauntlets'],
    },

    // =================================================================
    // OFFHAND
    // =================================================================

    woodenShield: {
        id: 'woodenShield',
        name: 'Wooden Shield',
        description: 'Basic wooden shield. Blocks some attacks.',
        icon: '🛡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 50,
        level: 3,
        slot: 'offhand',
        tier: 'basic',
        combatStats: {
            defense: 10,
            evasion: 3,
        },
        tags: ['shield', 'offhand', 'wood', 'defense'],
    },

    ironShield: {
        id: 'ironShield',
        name: 'Iron Shield',
        description: 'Sturdy iron shield. Provides solid protection.',
        icon: '🛡️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 200,
        level: 12,
        slot: 'offhand',
        tier: 'improved',
        combatStats: {
            defense: 18,
            health: 30,
            evasion: 5,
        },
        attributes: {
            constitution: 2,
        },
        requirements: {
            combat: 12,
        },
        tags: ['shield', 'offhand', 'iron', 'defense'],
    },

    // =================================================================
    // TOOLS
    // =================================================================

    bronzePickaxe: {
        id: 'bronzePickaxe',
        name: 'Bronze Pickaxe',
        description: 'Basic mining tool. Can mine copper and tin ores.',
        icon: '⛏️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 40,
        level: 1,
        slot: 'tool',
        tier: 'basic',
        requirements: {
            mining: 1,
        },
        tags: ['tool', 'pickaxe', 'bronze', 'mining'],
    },

    ironPickaxe: {
        id: 'ironPickaxe',
        name: 'Iron Pickaxe',
        description: 'Sturdy iron pickaxe. Can mine iron and coal.',
        icon: '⛏️',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 150,
        level: 10,
        slot: 'tool',
        tier: 'improved',
        requirements: {
            mining: 10,
        },
        tags: ['tool', 'pickaxe', 'iron', 'mining'],
    },

    bronzeAxe: {
        id: 'bronzeAxe',
        name: 'Bronze Axe',
        description: 'Basic woodcutting tool. Can chop normal trees.',
        icon: '🪓',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 35,
        level: 1,
        slot: 'tool',
        tier: 'basic',
        requirements: {
            woodcutting: 1,
        },
        tags: ['tool', 'axe', 'bronze', 'woodcutting'],
    },

    ironAxe: {
        id: 'ironAxe',
        name: 'Iron Axe',
        description: 'Sharp iron axe. Can chop oak and willow trees.',
        icon: '🪓',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 140,
        level: 10,
        slot: 'tool',
        tier: 'improved',
        requirements: {
            woodcutting: 10,
        },
        tags: ['tool', 'axe', 'iron', 'woodcutting'],
    },

    // =================================================================
    // ACCESSORIES
    // =================================================================

    bronzeRing: {
        id: 'bronzeRing',
        name: 'Bronze Ring',
        description: 'Simple bronze ring. Provides minor stat boost.',
        icon: '💍',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'common',
        stackLimit: 1,
        value: 80,
        level: 5,
        slot: 'accessory',
        tier: 'basic',
        attributes: {
            luck: 2,
        },
        tags: ['accessory', 'ring', 'bronze'],
    },

    ironAmulet: {
        id: 'ironAmulet',
        name: 'Iron Amulet',
        description: 'Heavy iron amulet. Increases constitution.',
        icon: '📿',
        category: 'equipment',
        instanced: true,  // Unique instance
        rarity: 'uncommon',
        stackLimit: 1,
        value: 200,
        level: 12,
        slot: 'accessory',
        tier: 'improved',
        combatStats: {
            health: 40,
        },
        attributes: {
            constitution: 3,
        },
        requirements: {
            combat: 12,
        },
        tags: ['accessory', 'amulet', 'iron'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EQUIPMENT_ITEMS;
}
