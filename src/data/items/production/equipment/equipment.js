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

    // Tier 1 Weapons
    greensmanTrainingBow: {
        id: 'greensmanTrainingBow',
        name: 'Greensman Training Bow',
        description: 'A basic bow crafted from riverwillow and plant fibers. Perfect for beginners learning archery.',
        icon: '🏹',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 25,
        level: 1,
        slot: 'weapon',
        equipSlot: 'weapon',
        tier: 'starter',
        weaponCategory: 'bow',
        combatStats: {
            damage: 6,
            attackSpeed: 1.0,
            accuracy: 70,
            critChance: 5,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['weapon', 'bow', 'ranged', 'starter', 'mechanics'],
    },

    sidekick22: {
        id: 'sidekick22',
        name: 'Sidekick 22',
        description: 'A small caliber pistol with a copper frame. Reliable sidearm for close encounters.',
        icon: '🔫',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 30,
        level: 1,
        slot: 'weapon',
        equipSlot: 'weapon',
        tier: 'starter',
        weaponType: 'pistol',
        weaponCategory: 'pistol',
        requiresAmmo: true,
        ammoType: 'pistol',
        baseDamage: 7,
        attackInterval: 2000,
        combatStats: {
            damage: 7,
            attackSpeed: 1.2,
            accuracy: 65,
            critChance: 8,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['weapon', 'pistol', 'ranged', 'firearm', 'starter', 'mechanics'],
    },

    frontierMarksmanRifle: {
        id: 'frontierMarksmanRifle',
        name: 'Frontier Marksman Rifle',
        description: 'A pinewood-stocked rifle with copper frame. Standard issue for frontier scouts.',
        icon: '🔫',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 35,
        level: 1,
        slot: 'weapon',
        equipSlot: 'weapon',
        tier: 'starter',
        weaponCategory: 'rifle',
        combatStats: {
            damage: 9,
            attackSpeed: 0.8,
            accuracy: 80,
            critChance: 6,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['weapon', 'rifle', 'ranged', 'firearm', 'starter', 'mechanics'],
    },

    unityBlade: {
        id: 'unityBlade',
        name: 'Unity Blade',
        description: 'A simple copper blade with pinewood handle. Standard melee weapon for Unity recruits.',
        icon: '🗡️',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 20,
        level: 1,
        slot: 'weapon',
        equipSlot: 'weapon',
        tier: 'starter',
        weaponCategory: 'balancedMelee',
        combatStats: {
            damage: 8,
            attackSpeed: 1.1,
            accuracy: 75,
            critChance: 10,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['weapon', 'melee', 'sword', 'starter', 'smithing'],
    },

    // =================================================================
    // AMMUNITION
    // =================================================================

    flintheadArrows: {
        id: 'flintheadArrows',
        name: 'Flinthead Arrows',
        description: 'Basic arrows with flint tips. Essential ammunition for bows.',
        icon: '🏹',
        category: 'equipment',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 2,
        level: 1,
        slot: 'ammo',
        equipSlot: 'ammo',
        tier: 'starter',
        tags: ['ammo', 'arrow', 'ranged'],
    },

    copperiteRounds: {
        id: 'copperiteRounds',
        name: 'Copperite Rounds',
        description: 'Simple ammunition made from copperite. Compatible with pistols and rifles.',
        icon: '🔘',
        category: 'equipment',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 3,
        level: 1,
        slot: 'ammo',
        equipSlot: 'ammo',
        tier: 'starter',
        ammoType: 'pistol',
        tags: ['ammo', 'pistol', 'ranged', 'firearm'],
    },

    // =================================================================
    // ARMOR SETS (Full body armor: head + chest + legs combined)
    // =================================================================

    // Tier 1 Armor Sets
    unityScoutSet: {
        id: 'unityScoutSet',
        name: 'Unity Scout Set',
        description: 'Standard issue armor for Unity scouts. Lightweight linen construction offers basic protection for field reconnaissance.',
        icon: '🎽',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 45,
        level: 1,
        slot: 'armor',
        equipSlot: 'armor',
        tier: 'starter',
        combatStats: {
            defense: 8,
            health: 25,
            evasion: 3,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'linen', 'light', 'set', 'unity'],
    },

    waxedWaderSet: {
        id: 'waxedWaderSet',
        name: 'Waxed Wader Set',
        description: 'Waterproof gear designed for fishermen and foragers. Waxed fabric keeps you dry in wet conditions.',
        icon: '🧥',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 60,
        level: 1,
        slot: 'armor',
        equipSlot: 'armor',
        tier: 'starter',
        combatStats: {
            defense: 10,
            health: 30,
        },
        attributes: {
            constitution: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'waxed', 'waterproof', 'set', 'fishing'],
    },

    harvestersGarb: {
        id: 'harvestersGarb',
        name: "Harvester's Garb",
        description: 'Practical wool and leather outfit for gatherers. Durable construction withstands brush and thorns.',
        icon: '👔',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 70,
        level: 2,
        slot: 'armor',
        equipSlot: 'armor',
        tier: 'starter',
        combatStats: {
            defense: 12,
            health: 35,
            evasion: 1,
        },
        attributes: {
            constitution: 1,
            dexterity: 1,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'wool', 'leather', 'set', 'harvesting'],
    },

    // =================================================================
    // TOOLS
    // =================================================================

    // Starter Tools (with custom icons)
    caneRod: {
        id: 'caneRod',
        name: 'Cane Rod',
        description: 'A simple fishing rod made from river cane. Perfect for catching small fish.',
        icon: '🎣',
        iconPath: 'assets/icons/tools/cane-rod.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 15,
        level: 1,
        slot: 'tool',           // Bank tab categorization
        equipSlot: 'weapon',    // Equipment slot (where it's equipped)
        tier: 'starter',
        weaponCategory: 'tool',
        toolType: 'fishing',
        toolTier: 1,
        requirements: {
            fishing: 1,
        },
        tags: ['tool', 'fishing', 'starter'],
    },

    huntingBlade: {
        id: 'huntingBlade',
        name: 'Hunting Blade',
        description: 'A sharp blade designed for hunting and field dressing game.',
        icon: '🔪',
        iconPath: 'assets/icons/tools/hunting blade.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 20,
        level: 1,
        slot: 'tool',           // Bank tab categorization
        equipSlot: 'weapon',    // Equipment slot (where it's equipped)
        tier: 'starter',
        weaponCategory: 'tool',
        toolType: 'hunting',
        toolTier: 1,
        requirements: {
            hunting: 1,
        },
        tags: ['tool', 'hunting', 'starter'],
    },

    lightPickaxe: {
        id: 'lightPickaxe',
        name: 'Light Pickaxe',
        description: 'A lightweight pickaxe ideal for beginners. Can mine basic ores.',
        icon: '⛏️',
        iconPath: 'assets/icons/tools/light-pickaxe.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 25,
        level: 1,
        slot: 'tool',           // Bank tab categorization
        equipSlot: 'weapon',    // Equipment slot (where it's equipped)
        tier: 'starter',
        weaponCategory: 'tool',
        toolType: 'mining',
        toolTier: 1,
        requirements: {
            mining: 1,
        },
        tags: ['tool', 'mining', 'starter'],
    },

    lockpick: {
        id: 'lockpick',
        name: 'Lockpick',
        description: 'A set of basic lockpicking tools. Essential for opening locked containers.',
        icon: '🔓',
        iconPath: 'assets/icons/tools/lockpick.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 30,
        level: 1,
        slot: 'tool',           // Bank tab categorization
        equipSlot: 'weapon',    // Equipment slot (where it's equipped)
        tier: 'starter',
        weaponCategory: 'tool',
        toolType: 'lockpicking',
        toolTier: 1,
        tags: ['tool', 'lockpicking', 'starter'],
    },

    utilityHatchet: {
        id: 'utilityHatchet',
        name: 'Utility Hatchet',
        description: 'A versatile hatchet for chopping wood and basic tasks.',
        icon: '🪓',
        iconPath: 'assets/icons/tools/utility-hatchet.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 18,
        level: 1,
        slot: 'tool',           // Bank tab categorization
        equipSlot: 'weapon',    // Equipment slot (where it's equipped)
        tier: 'starter',
        weaponCategory: 'tool',
        toolType: 'woodcutting',
        toolTier: 1,
        requirements: {
            woodcutting: 1,
        },
        tags: ['tool', 'woodcutting', 'starter'],
    },

    wovenBasket: {
        id: 'wovenBasket',
        name: 'Woven Basket',
        description: 'A sturdy basket woven from natural fibers. Useful for gathering plants.',
        icon: '🧺',
        iconPath: 'assets/icons/tools/woven-basket.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 12,
        level: 1,
        slot: 'tool',           // Bank tab categorization
        equipSlot: 'weapon',    // Equipment slot (where it's equipped)
        tier: 'starter',
        weaponCategory: 'tool',
        toolType: 'foraging',
        toolTier: 1,
        requirements: {
            foraging: 1,
        },
        tags: ['tool', 'foraging', 'starter'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EQUIPMENT_ITEMS;
}
