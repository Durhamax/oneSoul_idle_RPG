/**
 * ITEM SCHEMA
 *
 * Complete schema template for all item types in the game.
 * This defines the structure and valid properties for items across all categories.
 *
 * Use this as a reference when creating new items to ensure consistency
 * and compatibility with the validation system.
 */

/**
 * Item Categories
 *
 * Primary categorization of all items in the game
 */
const ITEM_CATEGORIES = {
    EQUIPMENT: 'equipment',        // Equippable items (weapons, armor, tools)
    CONSUMABLE: 'consumable',      // Items that go in consumable slots (ammo, food, potions)
    MATERIAL: 'material',          // Raw resources from nodes, not yet processed
};

/**
 * Item Rarities
 *
 * Determines drop rate, vendor price multiplier, and visual styling
 */
const ITEM_RARITIES = {
    COMMON: 'common',              // White - Most basic items
    UNCOMMON: 'uncommon',          // Green - Slightly better
    RARE: 'rare',                  // Blue - Notable quality
    EPIC: 'epic',                  // Purple - High quality
    LEGENDARY: 'legendary',        // Orange - Exceptional items
    MYTHIC: 'mythic',             // Red - Extremely rare
};

/**
 * Equipment Slots
 *
 * Valid slots for items (3-1-3 Grid System)
 *
 * EQUIPMENT (category: 'equipment'):
 *   - tool: Skilling items (pickaxes, axes, fishing rods) → Tools tab
 *   - weapon: Combat weapons → Weapons tab
 *   - armor: Full armor set (head/chest/legs combined) → Armor tab
 *   - back: Capes/Cloaks → Armor tab
 *   - gloves: Gloves → Armor tab
 *   - neck: Necklaces/Amulets → Armor tab
 *   - boots: Boots → Armor tab
 *   - ring: Rings → Armor tab
 *
 * CONSUMABLES (category: 'consumable'):
 *   - ammo/food/potion: Consumable slots → Consumables tab
 *
 * MATERIALS (category: 'material'):
 *   - resource: Raw materials → Resources tab
 */
const EQUIPMENT_SLOTS = {
    // Equipment slots (3-1-3 Grid)
    TOOL: 'tool',                 // Skilling equipment
    WEAPON: 'weapon',             // Combat weapons
    ARMOR: 'armor',               // Full armor set (unified head/chest/legs)
    BACK: 'back',                 // Cape/Cloak
    GLOVES: 'gloves',             // Gloves
    NECK: 'neck',                 // Necklace/Amulet
    BOOTS: 'boots',               // Boots
    RING: 'ring',                 // Ring

    // Consumable slots
    AMMO: 'ammo',                 // Ammo consumable
    FOOD: 'food',                 // Food consumable
    POTION: 'potion',             // Potion consumable

    // Material slot
    RESOURCE: 'resource',         // Raw materials
};

/**
 * Equipment Tiers
 *
 * Progression tiers for equipment (affects stats scaling)
 */
const EQUIPMENT_TIERS = {
    STARTER: 'starter',            // Tier 0 - Tutorial equipment
    BASIC: 'basic',                // Tier 1 - Early game
    IMPROVED: 'improved',          // Tier 2 - Mid early game
    QUALITY: 'quality',            // Tier 3 - Mid game
    SUPERIOR: 'superior',          // Tier 4 - Late mid game
    MASTERWORK: 'masterwork',      // Tier 5 - Late game
    LEGENDARY: 'legendary',        // Tier 6 - End game
};

/**
 * Consumable Effect Types
 */
const CONSUMABLE_EFFECTS = {
    HEAL: 'heal',                  // Restore health
    RESTORE: 'restore',            // Restore resource (energy, mana, etc.)
    BUFF: 'buff',                  // Temporary stat increase
    DEBUFF: 'debuff',              // Temporary stat decrease (negative consumables)
    TELEPORT: 'teleport',          // Teleportation
    UNLOCK: 'unlock',              // Unlock content
    EXPERIENCE: 'experience',      // Grant XP
    CURRENCY: 'currency',          // Grant currency
    RESOURCE: 'resource',          // Grant resources/materials
};

/**
 * Complete Item Schema Template
 *
 * This is the definitive structure for all items.
 * Fields marked with [REQUIRED] must be present.
 * Fields marked with [OPTIONAL] can be omitted if not needed.
 * Fields marked with [CATEGORY: X] are required only for that category.
 */
const ITEM_SCHEMA = {
    // =================================================================
    // CORE PROPERTIES (All Items)
    // =================================================================

    /**
     * Unique identifier for this item
     * @type {string}
     * @required
     * @example "ironSword", "healthPotion", "copperOre"
     */
    id: '',

    /**
     * Display name shown to player
     * @type {string}
     * @required
     * @example "Iron Sword", "Health Potion", "Copper Ore"
     */
    name: '',

    /**
     * Detailed description of the item
     * @type {string}
     * @required
     * @example "A sturdy sword forged from iron. Reliable and effective."
     */
    description: '',

    /**
     * Icon/emoji representing the item
     * @type {string}
     * @required
     * @example "🗡️", "🧪", "⛏️"
     */
    icon: '',

    /**
     * Path to PNG icon image (optional, falls back to emoji icon)
     * @type {string}
     * @optional
     * @example "assets/icons/tools/light-pickaxe.png"
     */
    iconPath: '',

    /**
     * Primary category of the item
     * @type {string}
     * @required
     * @see ITEM_CATEGORIES
     */
    category: '',

    /**
     * Whether this item is instanced (unique) or stackable
     * @type {boolean}
     * @required
     * @default false for resources/consumables, true for equipment/mods
     */
    instanced: false,

    /**
     * Item rarity level
     * @type {string}
     * @required
     * @see ITEM_RARITIES
     */
    rarity: '',

    /**
     * Maximum stack size (1 for non-stackable)
     * @type {number}
     * @optional
     * @default 1
     * @example 1 (equipment), 100 (materials), 999 (currency)
     */
    stackLimit: 1,

    /**
     * Base vendor sell value in gold
     * @type {number}
     * @optional
     * @default 0
     */
    value: 0,

    /**
     * Can this item be sold to vendors?
     * @type {boolean}
     * @optional
     * @default true
     */
    sellable: true,

    /**
     * Can this item be traded between players?
     * @type {boolean}
     * @optional
     * @default true
     */
    tradeable: true,

    /**
     * Can this item be dropped/deleted?
     * @type {boolean}
     * @optional
     * @default true
     */
    droppable: true,

    /**
     * Item level (for level requirements/scaling)
     * @type {number}
     * @optional
     */
    level: 1,

    /**
     * Tags for searching/filtering
     * @type {string[]}
     * @optional
     * @example ["weapon", "melee", "iron"], ["consumable", "healing"]
     */
    tags: [],

    // =================================================================
    // EQUIPMENT PROPERTIES (category: 'equipment')
    // =================================================================

    /**
     * Equipment slot this item occupies (for bank tab categorization)
     * @type {string}
     * @category equipment
     * @required
     * @see EQUIPMENT_SLOTS
     */
    slot: '',

    /**
     * Equipment slot where this item is actually equipped (where it goes on character)
     * @type {string}
     * @category equipment
     * @optional
     * @see EQUIPMENT_SLOTS
     * @example "weapon" (for both weapons and tools)
     */
    equipSlot: '',

    /**
     * Equipment tier for progression
     * @type {string}
     * @category equipment
     * @optional
     * @see EQUIPMENT_TIERS
     */
    tier: '',

    /**
     * Weapon category for accuracy modifier calculations
     * @type {string}
     * @category equipment
     * @optional
     * @example "rifle", "bow", "pistol", "balancedMelee", "heavyMelee", "precisionMelee", "tool"
     */
    weaponCategory: '',

    /**
     * Tool type for gathering/skilling
     * @type {string}
     * @category equipment
     * @optional
     * @example "mining", "woodcutting", "fishing", "hunting"
     */
    toolType: '',

    /**
     * Tool tier for gathering effectiveness
     * @type {number}
     * @category equipment
     * @optional
     */
    toolTier: 1,

    /**
     * Skill this equipment is associated with
     * @type {string}
     * @category equipment
     * @optional
     * @example "mining", "logging", "fishing", "combat"
     */
    skill: '',

    /**
     * Combat attributes bonuses
     * @type {Object}
     * @category equipment
     * @optional
     */
    attributes: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
        luck: 0,
    },

    /**
     * Combat stats bonuses
     * @type {Object}
     * @category equipment
     * @optional
     */
    combatStats: {
        health: 0,
        damage: 0,
        defense: 0,
        attackSpeed: 0,
        critChance: 0,
        critDamage: 0,
        accuracy: 0,
        evasion: 0,
    },

    /**
     * Requirements to equip/use item
     * @type {Object}
     * @category equipment
     * @optional
     * @example { characterLevel: 10, mining: 5 }
     */
    requirements: {},

    /**
     * Durability system (if applicable)
     * @type {Object}
     * @category equipment
     * @optional
     */
    durability: {
        current: 100,
        max: 100,
        repairable: true,
    },

    /**
     * Set bonus ID (if part of equipment set)
     * @type {string}
     * @category equipment
     * @optional
     * @example "ironWarrior", "arcaneScholar"
     */
    setId: null,

    // =================================================================
    // ATTACHMENT PROPERTIES (slot: 'attachment')
    // =================================================================

    /**
     * Item type (used for filtering attachments)
     * @type {string}
     * @category equipment
     * @optional
     * @example "attachment"
     */
    itemType: '',

    /**
     * Which attachment slot this fits into (legacy: attachmentSlot)
     * @type {string}
     * @category equipment
     * @optional
     * @example "muzzle", "scope", "grip", "stock"
     */
    attachmentSlot: '',
    modType: '',  // Alias for attachmentSlot

    /**
     * Which stat this attachment boosts (legacy: bonusStat)
     * @type {string}
     * @category equipment
     * @optional
     * @example "attackDamage", "accuracy", "criticalChance"
     */
    bonusStat: '',
    modStat: '',  // Alias for bonusStat

    /**
     * The magnitude of the stat bonus (multiplicative)
     * @type {number}
     * @category equipment
     * @optional
     * @example 0.02 (2% increase), 0.10 (10% increase)
     */
    bonusValue: 0,

    // =================================================================
    // CONSUMABLE PROPERTIES (category: 'consumable')
    // =================================================================

    /**
     * Consumable effect type
     * @type {string}
     * @category consumable
     * @required
     * @see CONSUMABLE_EFFECTS
     */
    effectType: '',

    /**
     * Effect magnitude/value
     * @type {number}
     * @category consumable
     * @optional
     * @example 50 (heal 50 HP), 1800000 (30 minute buff)
     */
    effectValue: 0,

    /**
     * Effect duration in milliseconds (for buffs)
     * @type {number}
     * @category consumable
     * @optional
     */
    effectDuration: 0,

    /**
     * Cooldown before using again (milliseconds)
     * @type {number}
     * @category consumable
     * @optional
     */
    cooldown: 0,

    /**
     * Detailed effect data
     * @type {Object}
     * @category consumable
     * @optional
     * @example { stat: 'strength', amount: 10 }
     */
    effect: {},

    // =================================================================
    // MATERIAL/RESOURCE PROPERTIES
    // =================================================================

    /**
     * Resource type for gathering/crafting
     * @type {string}
     * @category material, resource
     * @optional
     * @example "ore", "wood", "textile", "herb"
     */
    resourceType: '',

    /**
     * Skill this resource is associated with
     * @type {string}
     * @category material, resource
     * @optional
     * @example "mining", "woodcutting", "herbalism"
     */
    gatherSkill: '',

    /**
     * Skill level required to gather
     * @type {number}
     * @category material, resource
     * @optional
     */
    gatherLevel: 1,

    // =================================================================
    // CRAFTING PROPERTIES
    // =================================================================

    /**
     * Recipe ID if this item can be crafted
     * @type {string}
     * @optional
     */
    recipeId: null,

    /**
     * Materials required to craft (if craftable)
     * @type {Object}
     * @optional
     * @example { ironOre: 5, coal: 2 }
     */
    materials: {},

    /**
     * Crafting station required
     * @type {string}
     * @optional
     * @example "forge", "workbench", "alchemyTable"
     */
    craftingStation: null,

    // =================================================================
    // QUEST/SPECIAL PROPERTIES
    // =================================================================

    /**
     * Quest ID this item belongs to
     * @type {string}
     * @category quest
     * @optional
     */
    questId: null,

    /**
     * Is this item unique (only one can exist)?
     * @type {boolean}
     * @optional
     * @default false
     */
    unique: false,

    /**
     * Custom properties for special items
     * @type {Object}
     * @optional
     */
    special: {},
};

/**
 * Example Items
 *
 * These demonstrate proper item structure for each category
 */
const EXAMPLE_ITEMS = {
    // Equipment Example: Iron Sword
    ironSword: {
        id: 'ironSword',
        name: 'Iron Sword',
        description: 'A sturdy sword forged from iron. Reliable weapon for any warrior.',
        icon: '🗡️',
        category: 'equipment',
        rarity: 'common',
        stackLimit: 1,
        value: 100,
        level: 5,
        slot: 'weapon',
        tier: 'basic',
        attributes: {
            strength: 2,
        },
        combatStats: {
            damage: 15,
            attackSpeed: 1.0,
        },
        requirements: {
            characterLevel: 5,
        },
        tags: ['weapon', 'sword', 'melee', 'iron'],
    },

    // Consumable Example: Health Potion
    healthPotion: {
        id: 'healthPotion',
        name: 'Health Potion',
        description: 'Restores 50 health points instantly.',
        icon: '🧪',
        category: 'consumable',
        rarity: 'common',
        stackLimit: 20,
        value: 25,
        effectType: 'heal',
        effectValue: 50,
        cooldown: 1000,
        tags: ['consumable', 'healing', 'potion'],
    },

    // Material Example: Copper Ore
    copperOre: {
        id: 'copperOre',
        name: 'Copper Ore',
        description: 'Raw copper ore extracted from copper deposits.',
        icon: '🪨',
        category: 'material',
        rarity: 'common',
        stackLimit: 100,
        value: 5,
        resourceType: 'ore',
        gatherSkill: 'mining',
        gatherLevel: 1,
        tags: ['material', 'ore', 'metal', 'copper'],
    },

    // Currency Example: Gold Coin
    goldCoin: {
        id: 'gold',
        name: 'Gold',
        description: 'Standard currency used throughout the realm.',
        icon: '🪙',
        category: 'currency',
        rarity: 'common',
        stackLimit: 999999,
        value: 1,
        sellable: false,
        droppable: false,
        tags: ['currency', 'gold'],
    },
};

/**
 * Validation Rules
 *
 * Rules for validating item data
 */
const VALIDATION_RULES = {
    // Required fields for all items
    required: ['id', 'name', 'description', 'icon', 'category', 'rarity'],

    // Category-specific required fields
    categoryRequired: {
        equipment: ['slot'],
        consumable: ['effectType'],
    },

    // Deprecated fields that should trigger warnings
    deprecated: {
        shield: 'Use "offhand" slot instead',
        armour: 'Use "body", "legs", or "feet" slot instead',
    },

    // Valid value ranges
    ranges: {
        stackLimit: { min: 1, max: 999999 },
        value: { min: 0, max: 999999999 },
        level: { min: 1, max: 100 },
    },
};

// Export all schema definitions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js export
    module.exports = {
        ITEM_SCHEMA,
        ITEM_CATEGORIES,
        ITEM_RARITIES,
        EQUIPMENT_SLOTS,
        EQUIPMENT_TIERS,
        CONSUMABLE_EFFECTS,
        EXAMPLE_ITEMS,
        VALIDATION_RULES,
    };
} else {
    // Browser export - make available globally
    window.ITEM_SCHEMA = ITEM_SCHEMA;
    window.ITEM_CATEGORIES = ITEM_CATEGORIES;
    window.ITEM_RARITIES = ITEM_RARITIES;
    window.EQUIPMENT_SLOTS = EQUIPMENT_SLOTS;
    window.EQUIPMENT_TIERS = EQUIPMENT_TIERS;
    window.CONSUMABLE_EFFECTS = CONSUMABLE_EFFECTS;
    window.EXAMPLE_ITEMS = EXAMPLE_ITEMS;
    window.VALIDATION_RULES = VALIDATION_RULES;
}
