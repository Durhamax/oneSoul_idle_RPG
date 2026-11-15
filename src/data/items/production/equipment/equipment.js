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
        rarity: 'common',
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
    // ARMOR PIECES (Separate head / chest / legs slots)
    // Each former "set" is split into 3 pieces; a full set of 3 pieces
    // roughly equals the original combined set's stats.
    // =================================================================

    // --- Unity Scout (Tier 1 light linen) ---
    unityScoutHood: {
        id: 'unityScoutHood',
        weight: 1,
        name: 'Unity Scout Hood',
        description: 'A soft linen hood issued to Unity scouts — light enough to never catch a branch as they slip through the dense Cradle woods on the hunt.',
        icon: 'assets/icons/armor/Unity_scout_set.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 15,
        level: 1,
        slot: 'head',
        equipSlot: 'head',
        tier: 'starter',
        combatStats: {
            defense: 2,
            health: 6,
            evasion: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'head', 'linen', 'light', 'unity'],
    },

    unityScoutJacket: {
        id: 'unityScoutJacket',
        weight: 2,
        name: 'Unity Scout Jacket',
        description: 'An open-front linen jacket worn loose over an undershirt, sleeves cut for free movement. Unity scout issue — made to run nimbly through the Cradle thickets as a mobile hunter.',
        icon: 'assets/icons/armor/Unity_scout_set.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 18,
        level: 1,
        slot: 'chest',
        equipSlot: 'chest',
        tier: 'starter',
        combatStats: {
            defense: 4,
            health: 13,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'chest', 'jacket', 'linen', 'light', 'unity'],
    },

    unityScoutLeggings: {
        id: 'unityScoutLeggings',
        weight: 1,
        name: 'Unity Scout Leggings',
        description: 'Loose, Shaolin-cut linen pants that never bind at the knee — made for sprinting, climbing and vaulting through dense woodland the way a Unity scout must.',
        icon: 'assets/icons/armor/Unity_scout_set.png',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 12,
        level: 1,
        slot: 'legs',
        equipSlot: 'legs',
        tier: 'starter',
        combatStats: {
            defense: 2,
            health: 6,
            evasion: 2,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'legs', 'linen', 'light', 'unity'],
    },

    // --- Waxed Wader (Tier 1 waterproof) ---
    waxedWaderHood: {
        id: 'waxedWaderHood',
        weight: 1,
        name: 'Waxed Wader Hood',
        description: 'Waterproof waxed-fabric hood for fishermen and foragers. Keeps the rain off your head.',
        icon: '🧥',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 18,
        level: 1,
        slot: 'head',
        equipSlot: 'head',
        tier: 'starter',
        combatStats: {
            defense: 3,
            health: 8,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'head', 'waxed', 'waterproof', 'fishing'],
    },

    waxedWaderCoat: {
        id: 'waxedWaderCoat',
        weight: 1.5,
        name: 'Waxed Wader Coat',
        description: 'Waterproof waxed-fabric coat designed for fishermen and foragers. Keeps you dry in wet conditions.',
        icon: '🧥',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 24,
        level: 1,
        slot: 'chest',
        equipSlot: 'chest',
        tier: 'starter',
        combatStats: {
            defense: 4,
            health: 14,
        },
        attributes: {
            constitution: 1,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'chest', 'waxed', 'waterproof', 'fishing'],
    },

    waxedWaderLeggings: {
        id: 'waxedWaderLeggings',
        weight: 1,
        name: 'Waxed Wader Leggings',
        description: 'Waterproof waxed-fabric leggings for fishermen and foragers. Keeps your legs dry in the shallows.',
        icon: '🧥',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 18,
        level: 1,
        slot: 'legs',
        equipSlot: 'legs',
        tier: 'starter',
        combatStats: {
            defense: 3,
            health: 8,
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['armor', 'legs', 'waxed', 'waterproof', 'fishing'],
    },

    // --- Harvester's (Tier 1 wool & leather work garb) ---
    harvestersHood: {
        id: 'harvestersHood',
        weight: 1,
        name: "Harvester's Hood",
        description: 'Durable wool and leather hood for gatherers. Withstands brush and thorns.',
        icon: '👔',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 22,
        level: 2,
        slot: 'head',
        equipSlot: 'head',
        tier: 'starter',
        combatStats: {
            defense: 4,
            health: 11,
            evasion: 1,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'head', 'wool', 'leather', 'harvesting'],
    },

    harvestersVest: {
        id: 'harvestersVest',
        weight: 1,
        name: "Harvester's Vest",
        description: 'Practical wool and leather vest for gatherers. Durable construction withstands brush and thorns.',
        icon: '👔',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 26,
        level: 2,
        slot: 'chest',
        equipSlot: 'chest',
        tier: 'starter',
        combatStats: {
            defense: 4,
            health: 13,
        },
        attributes: {
            constitution: 1,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'chest', 'wool', 'leather', 'harvesting'],
    },

    harvestersLeggings: {
        id: 'harvestersLeggings',
        weight: 1,
        name: "Harvester's Leggings",
        description: 'Practical wool and leather leggings for gatherers. Durable construction withstands brush and thorns.',
        icon: '👔',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 22,
        level: 2,
        slot: 'legs',
        equipSlot: 'legs',
        tier: 'starter',
        combatStats: {
            defense: 4,
            health: 11,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'legs', 'wool', 'leather', 'harvesting'],
    },

    // =================================================================
    // SKILLING PIECES (Region 1 — The Cradle)
    // Individual gear worn in armor slots that aids a gathering skill.
    // Each early piece carries EITHER an XP bonus OR a yield bonus (never both),
    // via `skillingBonus` (see SkillingOutfit system). Minimal combat value — the
    // point is the skilling perk, at the cost of real armor in that slot. These are
    // NOT a matched set; each piece stands alone and stacks with others.
    // =================================================================

    anglersVest: {
        id: 'anglersVest',
        weight: 1,
        name: "Angler's Vest",
        description: 'A snug tackle vest that keeps a fisher\'s hands free and their focus sharp. Favoured along the Cradle\'s river shallows.',
        icon: '🦺',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 40,
        level: 1,
        slot: 'chest',
        equipSlot: 'chest',
        tier: 'starter',
        skillingBonus: {
            skills: ['fishing'],
            xp: 0.005,          // +0.5% Fishing XP per gather action
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['skilling', 'chest', 'fishing', 'cloth', 'cradle'],
    },

    anglersWaders: {
        id: 'anglersWaders',
        weight: 1,
        name: "Angler's Waders",
        description: 'Waxed leg waders for standing in the shallows. Now and then they help you work an extra catch free of the reeds.',
        icon: '👖',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 45,
        level: 1,
        slot: 'legs',
        equipSlot: 'legs',
        tier: 'starter',
        skillingBonus: {
            skills: ['fishing'],
            yield: { chance: 0.01, amount: 1 },   // 1% chance per catch for +1 fish (no XP)
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['skilling', 'legs', 'fishing', 'waxed', 'cradle'],
    },

    foragersHood: {
        id: 'foragersHood',
        weight: 1,
        name: "Forager's Hood",
        description: 'A broad cloth hood that shades the eyes while scanning the brush for herbs, roots and resin.',
        icon: '🧢',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 40,
        level: 1,
        slot: 'head',
        equipSlot: 'head',
        tier: 'starter',
        skillingBonus: {
            skills: ['foraging'],
            xp: 0.005,          // +0.5% Foraging XP per gather action
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['skilling', 'head', 'foraging', 'cloth', 'cradle'],
    },

    trappersGloves: {
        id: 'trappersGloves',
        weight: 1,
        name: "Trapper's Gloves",
        description: 'Supple leather gloves for setting snares along the game trails. A steadier hand means the occasional extra pelt.',
        icon: '🧤',
        category: 'equipment',
        instanced: true,
        rarity: 'common',
        stackLimit: 1,
        value: 42,
        level: 1,
        slot: 'gloves',
        equipSlot: 'gloves',
        tier: 'starter',
        skillingBonus: {
            skills: ['hunting'],
            yield: { chance: 0.01, amount: 1 },   // 1% chance per kill for +1 drop (no XP)
        },
        requirements: {
            characterLevel: 1,
        },
        tags: ['skilling', 'gloves', 'hunting', 'leather', 'cradle'],
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

    // =================================================================
    // TIER 2 — SCOUTREACH ARMS (reverse-engineered from Elaran kit)
    // Calibers are standardized in millimeters on this world; the 6mm
    // Defender is the first player-manufactured firearm.
    // =================================================================
    sixMmDefender: {
        id: 'sixMmDefender',
        weight: 2.2,
        name: '6mm Defender',
        description: 'A compact 6mm sidearm reverse-engineered from a salvaged Elaran pistol — the first firearm you build yourself. Chambered to the 6mm standard, it fires farther and harder than a training bow.',
        icon: '🔫',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 90,
        level: 3,
        slot: 'weapon',
        equipSlot: 'weapon',
        tier: 'tier2',
        weaponCategory: 'pistol',
        requiresAmmo: true,
        ammoType: '6mm',
        damageType: 'pierce',
        combatStats: {
            damage: 16,
            attackSpeed: 1.4,
            accuracy: 82,
            critChance: 12,
        },
        requirements: {
            characterLevel: 3,
        },
        tags: ['weapon', 'pistol', 'ranged', 'firearm', '6mm', 'mechanics'],
    },

    sixMmRounds: {
        id: 'sixMmRounds',
        weight: 1,
        name: '6mm Rounds',
        description: 'Self-loaded 6mm cartridges: a brass casing, a charge of propellant, a copperite slug. The standard feed for 6mm firearms.',
        icon: '🔶',
        category: 'equipment',
        instanced: false,
        rarity: 'common',
        stackLimit: 100,
        value: 4,
        level: 1,
        slot: 'ammo',
        equipSlot: 'ammo',
        tier: 'tier2',
        ammoType: '6mm',
        combatStats: {
            damage: 14,
            accuracy: 8,
            critChance: 6,
        },
        tags: ['ammo', '6mm', 'ranged', 'firearm', 'munitions'],
    },

    // =================================================================
    // TIER 2 — ARMOR BRANCH: heavy (plating) vs light (ranging furs)
    // =================================================================
    // HEAVY lane — reverse-engineered Elaran plate: high defense/HP, heavy.
    elaranPlateChest: {
        id: 'elaranPlateChest',
        weight: 7,
        name: 'Salvaged Plate Carrier',
        description: 'Scrap Elaran alloy re-set into a plate carrier over cloth. Heavy and slow, but it soaks hits — the first step down the heavy-armor road.',
        icon: '🦺',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 70,
        level: 3,
        slot: 'chest',
        equipSlot: 'chest',
        tier: 'tier2',
        combatStats: {
            defense: 9,
            health: 24,
            evasion: -2,
        },
        attributes: {
            constitution: 1,
        },
        requirements: {
            characterLevel: 3,
        },
        tags: ['armor', 'chest', 'plated', 'heavy', 'tailoring'],
    },

    // LIGHT lane — ranging furs: evasion/mobility, low weight.
    rangerHood: {
        id: 'rangerHood',
        weight: 1,
        name: 'Ranger Hood',
        description: 'A hooded cowl cut from thick ranger pelt. Light, quiet, and weather-shedding — gear for moving fast and far.',
        icon: '🧢',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 36,
        level: 2,
        slot: 'head',
        equipSlot: 'head',
        tier: 'tier2',
        combatStats: {
            defense: 2,
            health: 8,
            evasion: 4,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'head', 'leather', 'light', 'ranging'],
    },

    rangerCoat: {
        id: 'rangerCoat',
        weight: 2,
        name: 'Ranger Coat',
        description: 'A supple all-terrain coat of layered ranger pelt and fibre. Barely slows you down — the mobility lane\'s mainstay.',
        icon: '🧥',
        category: 'equipment',
        instanced: true,
        rarity: 'uncommon',
        stackLimit: 1,
        value: 48,
        level: 2,
        slot: 'chest',
        equipSlot: 'chest',
        tier: 'tier2',
        combatStats: {
            defense: 4,
            health: 12,
            evasion: 5,
        },
        attributes: {
            dexterity: 1,
        },
        requirements: {
            characterLevel: 2,
        },
        tags: ['armor', 'chest', 'leather', 'light', 'ranging'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EQUIPMENT_ITEMS;
}
