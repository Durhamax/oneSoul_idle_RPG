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
        weight: 2,          // light wooden bow
        name: 'Greensman Training Bow',
        description: 'A basic bow crafted from riverwillow and plant fibers. Perfect for beginners learning archery.',
        icon: 'assets/icons/weapons/greensman_training_bow.png',
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
        requiresAmmo: true,
        ammoType: 'arrow',
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
        weight: 2.5,        // compact metal pistol
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
        baseDamage: 25,
        attackInterval: 800,
        combatStats: {
            damage: 25,
            attackSpeed: 2.5,
            accuracy: 500,
            critChance: 15,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['weapon', 'pistol', 'ranged', 'firearm', 'starter', 'mechanics'],
    },

    reclaimedElaranSidearm: {
        id: 'reclaimedElaranSidearm',
        weight: 2.5,        // compact salvaged pistol
        name: 'Reclaimed Elaran Sidearm',
        description: 'An Elaran surveyor\'s sidearm rebuilt around a copperite frame. Better machined than Unity make — the first spoils of the war turned back on its makers.',
        icon: '🔫',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 55,
        level: 1,
        slot: 'weapon',
        equipSlot: 'weapon',
        tier: 'starter',
        weaponType: 'pistol',
        weaponCategory: 'pistol',
        requiresAmmo: true,
        ammoType: 'pistol',
        baseDamage: 28,
        attackInterval: 800,
        combatStats: {
            damage: 28,
            attackSpeed: 2.5,
            accuracy: 520,
            critChance: 16,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['weapon', 'pistol', 'ranged', 'firearm', 'salvage', 'mechanics'],
    },

    frontierMarksmanRifle: {
        id: 'frontierMarksmanRifle',
        weight: 4.5,        // heavy two-handed rifle
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
        requiresAmmo: true,
        ammoType: 'rifle',
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
        weight: 3,          // metal melee blade
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
        weight: 1,          // flat per stack (ammo)
        name: 'Flinthead Arrows',
        description: 'Basic arrows with flint tips. Essential ammunition for bows.',
        icon: 'assets/icons/ammo/flinthead_arrows.png',
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
        weight: 1.5,        // flat per stack (metal rounds)
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
        combatStats: {
            damage: 10,
            accuracy: 5,
            critChance: 5,
        },
        tags: ['ammo', 'pistol', 'ranged', 'firearm'],
    },

    // =================================================================
    // TECHNOLOGY (tech-slot gear — slots gated by Intellect: 0/3/6/9)
    // =================================================================
    fieldScanner: {
        id: 'fieldScanner',
        weight: 1,          // compact salvaged tech
        name: 'Scrap Field Scanner',
        description: 'Your first working technology: a salvaged survey-drone sensor wired to a copper harness. It reads incoming threats and shaves a little off every hit.',
        icon: '📡',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 60,
        level: 1,
        slot: 'technology',
        equipSlot: 'technology',
        tier: 'starter',
        flatDamageReduction: 2,       // read by DamageCalculator when slotted into tech1–tech4
        combatStats: {
            flatDamageReduction: 2,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['technology', 'tech', 'scanner', 'salvage'],
    },

    // =================================================================
    // ARMOR SETS (Full body armor: head + chest + legs combined)
    // =================================================================

    // Tier 1 Armor Sets
    unityScoutSet: {
        id: 'unityScoutSet',
        weight: 4,          // linen armor set
        name: 'Unity Scout Set',
        description: 'Standard issue armor for Unity scouts. Lightweight linen construction offers basic protection for field reconnaissance.',
        icon: 'assets/icons/armor/Unity_scout_set.png',
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
        weight: 3.5,        // waxed-fabric set
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
        weight: 3,          // cloth work garb
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

    platedFieldVest: {
        id: 'platedFieldVest',
        weight: 6,          // plating + cloth assembly (heavier than the cloth sets)
        name: 'Plated Field Vest',
        description: 'Scavenged Elaran plating lashed over a fiber-and-pelt backing. Heavier than Unity cloth, but it turns a blade — your first taste of modern armor.',
        icon: '🦺',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 85,
        level: 2,
        slot: 'armor',
        equipSlot: 'armor',
        tier: 'starter',
        combatStats: {
            defense: 16,
            health: 30,
        },
        attributes: {
            constitution: 1,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'plated', 'salvage', 'tailoring'],
    },

    // Tier 1 Boots & Gloves (Tailoring — crafted from Region 1 materials)
    scoutTrailBoots: {
        id: 'scoutTrailBoots',
        weight: 1.5,        // soft leather boots
        name: 'Scout Trail Boots',
        description: 'Supple pelt-leather boots sealed with resin against the Cradle damp. Light and quiet — made for covering ground.',
        icon: '🥾',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 35,
        level: 1,
        slot: 'armor',          // Bank tab categorization
        equipSlot: 'boots',     // Equipment slot
        tier: 'starter',
        combatStats: {
            defense: 4,
            evasion: 2,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'boots', 'leather', 'light', 'tailoring'],
    },

    scoutHandwraps: {
        id: 'scoutHandwraps',
        weight: 1,          // leather-and-fiber hand wraps
        name: 'Scout Handwraps',
        description: 'Pelt-leather wraps bound with plant fiber to guard the hands and steady a grip. Simple protection for a working scout.',
        icon: '🧤',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 32,
        level: 1,
        slot: 'armor',          // Bank tab categorization
        equipSlot: 'gloves',    // Equipment slot
        tier: 'starter',
        combatStats: {
            defense: 3,
            health: 8,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'gloves', 'leather', 'light', 'tailoring'],
    },

    // =================================================================
    // TOOLS
    // =================================================================

    // Starter Tools
    caneRod: {
        id: 'caneRod',
        weight: 1.5,        // light wooden rod
        name: 'Cane Rod',
        description: 'A simple fishing rod made from river cane. Perfect for catching small fish.',
        icon: 'assets/icons/tools/cane-rod.png',
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
        weight: 2,          // metal blade tool
        name: 'Hunting Blade',
        description: 'A sharp blade designed for hunting and field dressing game.',
        icon: 'assets/icons/tools/hunting blade.png',
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
        weight: 2,          // light metal-headed pick
        name: 'Light Pickaxe',
        description: 'A lightweight pickaxe ideal for beginners. Can mine basic ores.',
        icon: 'assets/icons/tools/light-pickaxe.png',
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
        weight: 0.5,        // tiny tool
        name: 'Lockpick',
        description: 'A set of basic lockpicking tools. Essential for opening locked containers.',
        icon: 'assets/icons/tools/lockpick.png',
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
        requirements: {
            thieving: 1,        // Skill name is 'thieving', not 'lockpicking'
        },
        tags: ['tool', 'lockpicking', 'starter'],
    },

    utilityHatchet: {
        id: 'utilityHatchet',
        weight: 2,          // metal hatchet
        name: 'Utility Hatchet',
        description: 'A versatile hatchet for chopping wood and basic tasks.',
        icon: 'assets/icons/tools/utility-hatchet.png',
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
            logging: 1,         // Skill name is 'logging', not 'woodcutting'
        },
        tags: ['tool', 'woodcutting', 'starter'],
    },

    wovenBasket: {
        id: 'wovenBasket',
        weight: 1.5,        // light woven carry-basket
        name: 'Woven Basket',
        description: 'A sturdy basket woven from natural fibers. Useful for gathering plants.',
        icon: 'assets/icons/tools/woven-basket.png',
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
