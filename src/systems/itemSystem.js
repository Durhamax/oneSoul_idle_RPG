/**
 * ITEM SYSTEM
 *
 * Comprehensive item system with base Item class and specialized subclasses.
 * Handles all item types, validation, quality variations, and item logic.
 */

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

const ItemRarity = {
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 3,
    EPIC: 4,
    LEGENDARY: 5,
    MYTHIC: 6,
    ANCIENT: 7,
    DIVINE: 8,
    TRANSCENDENT: 9
};

const ItemQuality = {
    DAMAGED: 0.7,    // 70% stats
    NORMAL: 1.0,     // 100% stats
    PRISTINE: 1.3    // 130% stats
};

const BindType = {
    NONE: 'none',
    PICKUP: 'pickup',
    EQUIP: 'equip',
    ACCOUNT: 'account'
};

const DamageType = {
    PHYSICAL: 'physical',
    MAGIC: 'magic',
    FIRE: 'fire',
    ICE: 'ice',
    LIGHTNING: 'lightning',
    POISON: 'poison',
    HOLY: 'holy',
    DARK: 'dark'
};

// =============================================================================
// BASE ITEM CLASS
// =============================================================================

class Item {
    constructor(data) {
        // Required base properties
        this.id = data.id || this.generateId();
        this.name = data.name || 'Unknown Item';
        this.description = data.description || '';
        this.icon = data.icon || '📦';

        // Core stats
        this.rarity = Math.max(1, Math.min(9, data.rarity || 1));
        this.stackSize = data.stackSize || 1;
        this.value = data.value || 1;
        this.weight = data.weight || 1;
        this.level = data.level || 1;
        this.bindType = data.bindType || BindType.NONE;

        // Quality system
        this.quality = data.quality || ItemQuality.NORMAL;
        this.qualityName = this.getQualityName();

        // Item state
        this.itemType = data.itemType || 'base';
        this.bound = data.bound || false;
        this.soulbound = data.soulbound || false;
        this.tradeable = data.tradeable !== undefined ? data.tradeable : true;
        this.destructible = data.destructible !== undefined ? data.destructible : true;
        this.droppable = data.droppable !== undefined ? data.droppable : true;

        // Metadata
        this.tags = data.tags || [];
        this.lore = data.lore || null;
        this.createdAt = data.createdAt || Date.now();
        this.uniqueId = data.uniqueId || this.generateUniqueId();
    }

    generateId() {
        return 'item_' + Math.random().toString(36).substr(2, 9);
    }

    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getQualityName() {
        if (this.quality <= ItemQuality.DAMAGED) return 'Damaged';
        if (this.quality >= ItemQuality.PRISTINE) return 'Pristine';
        return 'Normal';
    }

    getRarityName() {
        const names = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ancient', 'Divine', 'Transcendent'];
        return names[this.rarity] || 'Unknown';
    }

    getRarityColor() {
        const colors = ['', '#9d9d9d', '#1eff00', '#0070dd', '#a335ee', '#ff8000', '#e6cc80', '#00ccff', '#e5cc80', '#ff0000'];
        return colors[this.rarity] || '#ffffff';
    }

    canStack() {
        return this.stackSize > 1;
    }

    getScaledValue() {
        return Math.floor(this.value * this.quality);
    }

    validate() {
        // Basic validation
        if (!this.id || !this.name) return false;
        if (this.rarity < 1 || this.rarity > 9) return false;
        if (this.stackSize < 1) return false;
        return true;
    }

    clone() {
        return new this.constructor(JSON.parse(JSON.stringify(this)));
    }

    toJSON() {
        return { ...this };
    }
}

// =============================================================================
// RESOURCE ITEM
// =============================================================================

class ResourceItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'resource';

        // Resource-specific properties
        this.harvestSource = data.harvestSource || 'unknown'; // mining, woodcutting, fishing, etc.
        this.refinedInto = data.refinedInto || null; // Item ID it can be refined into
        this.baseYield = data.baseYield || 1;
        this.qualityGrade = data.qualityGrade || 'standard'; // poor, standard, fine, exceptional, masterwork

        this.stackSize = data.stackSize || 200;
    }

    validate() {
        if (!super.validate()) return false;
        if (!this.harvestSource) return false;
        return true;
    }
}

// =============================================================================
// TOOL ITEM
// =============================================================================

class ToolItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'tool';

        // Tool-specific properties
        this.durability = data.durability || 100;
        this.maxDurability = data.maxDurability || 100;
        this.efficiency = data.efficiency || 1.0;
        this.skillType = data.skillType || 'mining'; // mining, woodcutting, fishing, etc.
        this.tier = data.tier || 1;
        this.repairCost = data.repairCost || { gold: 100 };
        this.bonusYield = data.bonusYield || 0;

        this.stackSize = 1;
        this.bindType = data.bindType || BindType.EQUIP;
    }

    getDurabilityPercent() {
        return (this.durability / this.maxDurability) * 100;
    }

    isBroken() {
        return this.durability <= 0;
    }

    reduceDurability(amount = 1) {
        this.durability = Math.max(0, this.durability - amount);
        return this.durability;
    }

    repair(percent = 100) {
        this.durability = Math.min(this.maxDurability, this.durability + (this.maxDurability * percent / 100));
        return this.durability;
    }

    getEfficiency() {
        if (this.isBroken()) return 0;
        const durabilityMultiplier = this.getDurabilityPercent() / 100;
        return this.efficiency * durabilityMultiplier * this.quality;
    }

    validate() {
        if (!super.validate()) return false;
        if (!this.skillType) return false;
        if (this.tier < 1) return false;
        return true;
    }
}

// =============================================================================
// WEAPON ITEM
// =============================================================================

class WeaponItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'weapon';

        // Weapon-specific properties
        this.damage = data.damage || 10;
        this.attackSpeed = data.attackSpeed || 1.0;
        this.critChance = data.critChance || 5;
        this.damageType = data.damageType || DamageType.PHYSICAL;
        this.range = data.range || 'melee'; // melee, ranged
        this.scalingStat = data.scalingStat || 'strength'; // strength, dexterity, intelligence
        this.socketSlots = data.socketSlots || 0;
        this.sockets = data.sockets || []; // Array of mod IDs

        // Weapon state
        this.durability = data.durability || 100;
        this.maxDurability = data.maxDurability || 100;

        this.stackSize = 1;
        this.bindType = data.bindType || BindType.EQUIP;
    }

    getDamage() {
        const qualityBonus = this.quality;
        const durabilityMultiplier = this.durability / this.maxDurability;
        return Math.floor(this.damage * qualityBonus * durabilityMultiplier);
    }

    getCritChance() {
        return this.critChance * this.quality;
    }

    getDPS() {
        return this.getDamage() * this.attackSpeed;
    }

    canSocketMod() {
        return this.sockets.length < this.socketSlots;
    }

    socketMod(modId) {
        if (!this.canSocketMod()) return false;
        this.sockets.push(modId);
        return true;
    }

    validate() {
        if (!super.validate()) return false;
        if (this.damage <= 0) return false;
        if (this.attackSpeed <= 0) return false;
        return true;
    }
}

// =============================================================================
// ARMOR ITEM
// =============================================================================

class ArmorItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'armor';

        // Armor-specific properties
        this.defense = data.defense || 10;
        this.resistance = data.resistance || {
            physical: 0,
            magic: 0,
            fire: 0,
            ice: 0,
            lightning: 0,
            poison: 0
        };
        this.slot = data.slot || 'chest'; // head, chest, legs, feet, hands, shield
        this.setBonus = data.setBonus || null; // Set ID
        this.durability = data.durability || 100;
        this.maxDurability = data.maxDurability || 100;
        this.socketSlots = data.socketSlots || 0;
        this.sockets = data.sockets || [];

        this.stackSize = 1;
        this.bindType = data.bindType || BindType.EQUIP;
    }

    getDefense() {
        const qualityBonus = this.quality;
        const durabilityMultiplier = this.durability / this.maxDurability;
        return Math.floor(this.defense * qualityBonus * durabilityMultiplier);
    }

    getResistance(type) {
        if (!this.resistance[type]) return 0;
        return Math.floor(this.resistance[type] * this.quality);
    }

    validate() {
        if (!super.validate()) return false;
        if (!this.slot) return false;
        if (this.defense < 0) return false;
        return true;
    }
}

// =============================================================================
// TECHNOLOGY ITEM
// =============================================================================

class TechnologyItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'technology';

        // Technology-specific properties
        this.powerConsumption = data.powerConsumption || 10;
        this.effectRadius = data.effectRadius || 5;
        this.automation = data.automation || 'passive'; // passive, active
        this.upgradePath = data.upgradePath || []; // Array of upgrade item IDs
        this.techLevel = data.techLevel || 1;
        this.active = data.active || false;
        this.effects = data.effects || []; // Array of effect objects

        this.stackSize = 1;
    }

    isActive() {
        return this.active;
    }

    activate() {
        this.active = true;
        return true;
    }

    deactivate() {
        this.active = false;
        return true;
    }

    canUpgrade() {
        return this.upgradePath.length > 0;
    }

    validate() {
        if (!super.validate()) return false;
        if (this.techLevel < 1) return false;
        return true;
    }
}

// =============================================================================
// MOD ITEM
// =============================================================================

class ModItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'mod';

        // Mod-specific properties
        this.targetSlot = data.targetSlot || 'weapon'; // weapon, armor, tool
        this.statModifiers = data.statModifiers || []; // [{stat: 'damage', value: 10, type: 'flat'}]
        this.incompatibleWith = data.incompatibleWith || []; // Array of mod IDs
        this.tier = data.tier || 1;
        this.installed = data.installed || false;

        this.stackSize = data.stackSize || 10;
    }

    getModifiers() {
        return this.statModifiers.map(mod => ({
            ...mod,
            value: mod.value * this.quality
        }));
    }

    isCompatibleWith(targetItem) {
        if (!targetItem.itemType === this.targetSlot) return false;
        if (targetItem.sockets && targetItem.sockets.some(id => this.incompatibleWith.includes(id))) {
            return false;
        }
        return true;
    }

    validate() {
        if (!super.validate()) return false;
        if (!this.targetSlot) return false;
        if (!Array.isArray(this.statModifiers)) return false;
        return true;
    }
}

// =============================================================================
// HEALING ITEM
// =============================================================================

class HealingItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'healing';

        // Healing-specific properties
        this.healAmount = data.healAmount || 50;
        this.healType = data.healType || 'instant'; // instant, overtime
        this.duration = data.duration || 0; // For overtime healing
        this.cooldown = data.cooldown || 0;
        this.combatUsable = data.combatUsable !== undefined ? data.combatUsable : true;
        this.resurrectPower = data.resurrectPower || 0; // 0-100, chance to revive
        this.lastUsed = data.lastUsed || 0;

        this.stackSize = data.stackSize || 50;
    }

    getHealAmount() {
        return Math.floor(this.healAmount * this.quality);
    }

    isOnCooldown() {
        if (this.cooldown === 0) return false;
        return (Date.now() - this.lastUsed) < this.cooldown;
    }

    getCooldownRemaining() {
        if (!this.isOnCooldown()) return 0;
        return this.cooldown - (Date.now() - this.lastUsed);
    }

    use() {
        if (this.isOnCooldown()) return false;
        this.lastUsed = Date.now();
        return true;
    }

    validate() {
        if (!super.validate()) return false;
        if (this.healAmount <= 0) return false;
        return true;
    }
}

// =============================================================================
// CONSUMABLE ITEM
// =============================================================================

class ConsumableItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'consumable';

        // Consumable-specific properties
        this.duration = data.duration || 300000; // 5 minutes default
        this.effects = data.effects || []; // [{stat: 'strength', value: 10, type: 'percent'}]
        this.consumeOnUse = data.consumeOnUse !== undefined ? data.consumeOnUse : true;
        this.buffType = data.buffType || 'stat'; // stat, skill, experience, etc.
        this.debuffCleanse = data.debuffCleanse || false;
        this.stacks = data.stacks !== undefined ? data.stacks : false;
        this.category = data.category || 'potion'; // potion, food, elixir, scroll

        this.stackSize = data.stackSize || 50;
    }

    getEffects() {
        return this.effects.map(effect => ({
            ...effect,
            value: effect.value * this.quality
        }));
    }

    getDuration() {
        return this.duration;
    }

    validate() {
        if (!super.validate()) return false;
        if (!Array.isArray(this.effects)) return false;
        if (this.duration < 0) return false;
        return true;
    }
}

// =============================================================================
// PERK ITEM
// =============================================================================

class PerkItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'perk';

        // Perk-specific properties
        this.perkType = data.perkType || 'passive'; // passive, active, toggle
        this.powerMultiplier = data.powerMultiplier || 1.0;
        this.gridCompatible = data.gridCompatible !== undefined ? data.gridCompatible : true;
        this.slotCount = data.slotCount || 1; // How many perk slots it takes
        this.synergyTags = data.synergyTags || []; // Tags for synergies
        this.requirements = data.requirements || {}; // Level, skill requirements
        this.effects = data.effects || [];

        this.stackSize = 1;
        this.tradeable = false;
    }

    meetsRequirements(player) {
        if (this.requirements.level && player.level < this.requirements.level) return false;
        if (this.requirements.skills) {
            for (let skill in this.requirements.skills) {
                if (!player.skills[skill] || player.skills[skill].level < this.requirements.skills[skill]) {
                    return false;
                }
            }
        }
        return true;
    }

    getSynergyBonus(otherPerks) {
        let bonus = 0;
        for (let perk of otherPerks) {
            if (perk.synergyTags.some(tag => this.synergyTags.includes(tag))) {
                bonus += 0.1; // 10% bonus per synergy
            }
        }
        return bonus;
    }

    validate() {
        if (!super.validate()) return false;
        if (this.slotCount < 1) return false;
        return true;
    }
}

// =============================================================================
// QUEST ITEM
// =============================================================================

class QuestItem extends Item {
    constructor(data) {
        super(data);
        this.itemType = 'quest';

        // Quest-specific properties
        this.questId = data.questId || null;
        this.progression = data.progression || 0; // Some quest items track progress
        this.tradeable = false;
        this.destructible = false;
        this.droppable = false;
        this.lore = data.lore || null;
        this.unique = data.unique !== undefined ? data.unique : true;

        this.stackSize = data.stackSize || 1;
        this.bindType = BindType.PICKUP;
    }

    validate() {
        if (!super.validate()) return false;
        if (!this.questId) return false;
        return true;
    }
}

// =============================================================================
// ITEM FACTORY
// =============================================================================

const ItemFactory = {
    /**
     * Create item from type and data
     */
    create(type, data) {
        switch (type) {
            case 'resource': return new ResourceItem(data);
            case 'tool': return new ToolItem(data);
            case 'weapon': return new WeaponItem(data);
            case 'armor': return new ArmorItem(data);
            case 'technology': return new TechnologyItem(data);
            case 'mod': return new ModItem(data);
            case 'healing': return new HealingItem(data);
            case 'consumable': return new ConsumableItem(data);
            case 'perk': return new PerkItem(data);
            case 'quest': return new QuestItem(data);
            default: return new Item(data);
        }
    },

    /**
     * Load item from saved JSON
     */
    fromJSON(json) {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        return this.create(data.itemType, data);
    },

    /**
     * Generate random item based on level and rarity weights
     */
    generate(type, level, rarityWeights = null) {
        const rarity = this.rollRarity(rarityWeights);
        const quality = this.rollQuality();

        const baseData = {
            level: level,
            rarity: rarity,
            quality: quality
        };

        // Add type-specific generation
        const item = this.create(type, baseData);
        this.scaleItemByLevel(item, level);
        this.applyRarityBonuses(item, rarity);

        return item;
    },

    /**
     * Roll rarity based on weights
     */
    rollRarity(weights = null) {
        const defaultWeights = {
            1: 50,  // Common
            2: 25,  // Uncommon
            3: 15,  // Rare
            4: 7,   // Epic
            5: 2,   // Legendary
            6: 0.8, // Mythic
            7: 0.15,// Ancient
            8: 0.04,// Divine
            9: 0.01 // Transcendent
        };

        const rarityWeights = weights || defaultWeights;
        const total = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;

        for (let rarity in rarityWeights) {
            roll -= rarityWeights[rarity];
            if (roll <= 0) return parseInt(rarity);
        }

        return 1; // Default to common
    },

    /**
     * Roll quality
     */
    rollQuality() {
        const roll = Math.random() * 100;
        if (roll < 10) return ItemQuality.DAMAGED;
        if (roll > 95) return ItemQuality.PRISTINE;
        return ItemQuality.NORMAL;
    },

    /**
     * Scale item stats by level
     */
    scaleItemByLevel(item, level) {
        const scalingFactor = 1 + (level - 1) * 0.1;

        if (item.damage) item.damage = Math.floor(item.damage * scalingFactor);
        if (item.defense) item.defense = Math.floor(item.defense * scalingFactor);
        if (item.healAmount) item.healAmount = Math.floor(item.healAmount * scalingFactor);
        if (item.value) item.value = Math.floor(item.value * scalingFactor);
    },

    /**
     * Apply rarity-based bonuses
     */
    applyRarityBonuses(item, rarity) {
        const rarityMultiplier = 1 + (rarity - 1) * 0.2;

        if (item.damage) item.damage = Math.floor(item.damage * rarityMultiplier);
        if (item.defense) item.defense = Math.floor(item.defense * rarityMultiplier);
        if (item.healAmount) item.healAmount = Math.floor(item.healAmount * rarityMultiplier);
        if (item.efficiency) item.efficiency *= rarityMultiplier;

        // Higher rarity = more sockets
        if (item.socketSlots !== undefined) {
            item.socketSlots = Math.min(rarity - 1, 6);
        }
    }
};

// =============================================================================
// EXPORTS
// =============================================================================

// Make available globally
window.ItemSystem = {
    Item,
    ResourceItem,
    ToolItem,
    WeaponItem,
    ArmorItem,
    TechnologyItem,
    ModItem,
    HealingItem,
    ConsumableItem,
    PerkItem,
    QuestItem,
    ItemFactory,
    ItemRarity,
    ItemQuality,
    BindType,
    DamageType
};
