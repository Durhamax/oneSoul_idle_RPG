/**
 * ITEM MIGRATION UTILITY
 *
 * Helps migrate items from old format (definitions.js) to new schema format.
 * Converts old fields to new fields and fills in missing schema data.
 */

const ItemMigrationUtility = {
    /**
     * Convert old item format to new schema format
     *
     * @param {string} itemId - Item ID
     * @param {Object} oldItem - Old format item
     * @returns {Object} New schema format item
     */
    convertToNewFormat(itemId, oldItem) {
        // Base conversion
        const newItem = {
            id: itemId,
            name: oldItem.name || itemId,
            description: oldItem.description || 'No description',
            icon: oldItem.image || oldItem.icon || '❓',
            category: this.convertCategory(oldItem.category),
            rarity: this.inferRarity(itemId, oldItem),
            stackLimit: oldItem.stackLimit || 1,
            value: this.inferValue(itemId, oldItem),
            level: this.inferLevel(itemId, oldItem),
            sellable: true,
            tradeable: true,
            droppable: true,
            tags: this.generateTags(itemId, oldItem),
        };

        // Category-specific fields
        if (newItem.category === 'equipment') {
            Object.assign(newItem, this.convertEquipment(itemId, oldItem));
        } else if (newItem.category === 'consumable') {
            Object.assign(newItem, this.convertConsumable(itemId, oldItem));
        } else if (newItem.category === 'material') {
            Object.assign(newItem, this.convertMaterial(itemId, oldItem));
        }

        return newItem;
    },

    /**
     * Convert old category to new category
     */
    convertCategory(oldCategory) {
        const categoryMap = {
            'tool': 'equipment',
            'ore': 'material',
            'fish': 'material',
            'meat': 'material',
            'hide': 'material',
            'feather': 'material',
            'bone': 'material',
            'fang': 'material',
            'pelt': 'material',
            'forage': 'material',
            'currency': 'currency',
            'material': 'material',
        };

        return categoryMap[oldCategory] || 'material';
    },

    /**
     * Infer rarity from item name and stats
     */
    inferRarity(itemId, oldItem) {
        const name = oldItem.name.toLowerCase();
        const id = itemId.toLowerCase();

        // Legendary/Mythic tier
        if (name.includes('legendary') || name.includes('master') || name.includes('mithril')) {
            return 'legendary';
        }

        // Epic tier
        if (name.includes('golden') || name.includes('rare') || name.includes('steel')) {
            return 'epic';
        }

        // Rare tier
        if (name.includes('silver') || name.includes('carbon') || name.includes('composite')) {
            return 'rare';
        }

        // Uncommon tier
        if (name.includes('iron') || name.includes('bronze') || name.includes('long')) {
            return 'uncommon';
        }

        // Common tier (default)
        return 'common';
    },

    /**
     * Infer item value from stats and rarity
     */
    inferValue(itemId, oldItem) {
        const rarity = this.inferRarity(itemId, oldItem);

        // Base value by rarity
        const baseValues = {
            common: 10,
            uncommon: 30,
            rare: 100,
            epic: 300,
            legendary: 1000,
        };

        let value = baseValues[rarity] || 10;

        // Adjust for currency
        if (oldItem.category === 'currency') {
            value = 1;
        }

        // Adjust for tools (higher value)
        if (oldItem.category === 'tool') {
            value *= 2;
        }

        return value;
    },

    /**
     * Infer item level from name and stats
     */
    inferLevel(itemId, oldItem) {
        const name = oldItem.name.toLowerCase();

        // Legendary tier
        if (name.includes('legendary') || name.includes('master') || name.includes('mithril')) {
            return 20;
        }

        // Epic tier
        if (name.includes('steel') || name.includes('golden') || name.includes('carbon')) {
            return 15;
        }

        // Rare tier
        if (name.includes('silver') || name.includes('composite')) {
            return 10;
        }

        // Uncommon tier
        if (name.includes('iron') || name.includes('long')) {
            return 5;
        }

        // Basic/Stone tier
        if (name.includes('stone') || name.includes('basic') || name.includes('bamboo')) {
            return 1;
        }

        // Bronze tier
        if (name.includes('bronze')) {
            return 3;
        }

        // Default
        return 1;
    },

    /**
     * Generate tags from item data
     */
    generateTags(itemId, oldItem) {
        const tags = [];
        const name = oldItem.name.toLowerCase();
        const category = oldItem.category;

        // Add category tag
        tags.push(category);

        // Add material tags
        if (name.includes('stone')) tags.push('stone');
        if (name.includes('bronze')) tags.push('bronze');
        if (name.includes('iron')) tags.push('iron');
        if (name.includes('steel')) tags.push('steel');
        if (name.includes('mithril')) tags.push('mithril');
        if (name.includes('silver')) tags.push('silver');
        if (name.includes('gold')) tags.push('gold');

        // Add tool type tags
        if (name.includes('pickaxe')) tags.push('pickaxe', 'mining');
        if (name.includes('axe') || name.includes('hatchet')) tags.push('axe', 'woodcutting');
        if (name.includes('fishing') || name.includes('rod') || name.includes('net')) tags.push('fishing');
        if (name.includes('bow')) tags.push('bow', 'hunting');

        // Add resource tags
        if (category === 'fish') tags.push('fish', 'food');
        if (category === 'meat') tags.push('meat', 'food');
        if (category === 'ore') tags.push('ore', 'mining');

        return tags;
    },

    /**
     * Convert equipment-specific fields
     */
    convertEquipment(itemId, oldItem) {
        const slot = oldItem.equipSlot || 'weapon';
        const tier = this.inferTier(itemId, oldItem);

        const equipment = {
            slot: slot === 'weapon' ? 'tool' : slot,  // Tools are separate from weapons
            tier: tier,
            combatStats: this.convertStats(oldItem.stats || {}),
        };

        // Add requirements
        equipment.requirements = this.inferRequirements(itemId, oldItem);

        return equipment;
    },

    /**
     * Convert stats object to combatStats
     */
    convertStats(oldStats) {
        const combatStats = {};

        // Map old stat names to new
        if (oldStats.attackDamage) combatStats.damage = oldStats.attackDamage;
        if (oldStats.pickaxeDamage) combatStats.miningPower = oldStats.pickaxeDamage;
        if (oldStats.chopDamage) combatStats.woodcuttingPower = oldStats.chopDamage;
        if (oldStats.fishingPower) combatStats.fishingPower = oldStats.fishingPower;
        if (oldStats.huntingPower) combatStats.huntingPower = oldStats.huntingPower;
        if (oldStats.weight) combatStats.weight = oldStats.weight;
        if (oldStats.damageType) combatStats.damageType = oldStats.damageType;

        return combatStats;
    },

    /**
     * Infer equipment tier
     */
    inferTier(itemId, oldItem) {
        const name = oldItem.name.toLowerCase();

        if (name.includes('legendary') || name.includes('master') || name.includes('mithril')) {
            return 'legendary';
        }
        if (name.includes('steel') || name.includes('carbon')) {
            return 'elite';
        }
        if (name.includes('iron') || name.includes('composite')) {
            return 'advanced';
        }
        if (name.includes('bronze') || name.includes('long') || name.includes('basic')) {
            return 'intermediate';
        }
        if (name.includes('stone') || name.includes('short') || name.includes('bamboo') || name.includes('fishing net')) {
            return 'starter';
        }

        return 'basic';
    },

    /**
     * Infer skill requirements
     */
    inferRequirements(itemId, oldItem) {
        const name = oldItem.name.toLowerCase();
        const requirements = {};

        // Level requirements
        const level = this.inferLevel(itemId, oldItem);
        if (level > 1) {
            requirements.level = level;
        }

        // Skill requirements based on tool type
        if (name.includes('pickaxe')) {
            if (level >= 10) requirements.mining = 10;
            else if (level >= 5) requirements.mining = 5;
            else if (level >= 3) requirements.mining = 3;
        }

        if (name.includes('axe') || name.includes('hatchet')) {
            if (level >= 10) requirements.woodcutting = 10;
            else if (level >= 5) requirements.woodcutting = 5;
            else if (level >= 3) requirements.woodcutting = 3;
        }

        if (name.includes('fishing') || name.includes('rod')) {
            if (level >= 10) requirements.fishing = 10;
            else if (level >= 5) requirements.fishing = 5;
        }

        if (name.includes('bow')) {
            if (level >= 10) requirements.hunting = 10;
            else if (level >= 5) requirements.hunting = 5;
        }

        return requirements;
    },

    /**
     * Convert consumable-specific fields
     */
    convertConsumable(itemId, oldItem) {
        // Placeholder - most items in definitions.js aren't consumables
        return {
            effectType: 'heal',
            effectValue: 50,
        };
    },

    /**
     * Convert material-specific fields
     */
    convertMaterial(itemId, oldItem) {
        const material = {};
        const category = oldItem.category;

        // Add resource type
        if (category === 'ore') {
            material.resourceType = 'ore';
            material.gatherSkill = 'mining';
            material.gatherLevel = this.inferLevel(itemId, oldItem);
        } else if (category === 'fish') {
            material.resourceType = 'fish';
            material.gatherSkill = 'fishing';
            material.gatherLevel = this.inferLevel(itemId, oldItem);
        } else if (category === 'meat' || category === 'hide' || category === 'feather' || category === 'bone' || category === 'fang' || category === 'pelt') {
            material.resourceType = 'hunting';
            material.gatherSkill = 'hunting';
            material.gatherLevel = this.inferLevel(itemId, oldItem);
        } else if (category === 'forage') {
            material.resourceType = 'plant';
            material.gatherSkill = 'foraging';
            material.gatherLevel = this.inferLevel(itemId, oldItem);
        }

        return material;
    },

    /**
     * Print migration summary for an item
     */
    printMigration(itemId, oldItem, newItem) {
        console.log(`\n--- ${itemId} ---`);
        console.log(`Name: ${oldItem.name} → ${newItem.name}`);
        console.log(`Category: ${oldItem.category} → ${newItem.category}`);
        console.log(`Rarity: ${newItem.rarity}`);
        console.log(`Level: ${newItem.level}`);
        console.log(`Value: ${newItem.value}`);
        console.log(`Tier: ${newItem.tier || 'N/A'}`);
        console.log(`Tags: ${newItem.tags.join(', ')}`);
    },

    /**
     * Batch convert all items from definitions
     */
    migrateAll(itemsObject) {
        const migrated = {};
        const results = {
            total: 0,
            equipment: 0,
            material: 0,
            currency: 0,
            other: 0,
        };

        for (const [itemId, oldItem] of Object.entries(itemsObject)) {
            const newItem = this.convertToNewFormat(itemId, oldItem);
            migrated[itemId] = newItem;
            results.total++;
            results[newItem.category] = (results[newItem.category] || 0) + 1;
        }

        console.log('\n=== Migration Summary ===');
        console.log(`Total items migrated: ${results.total}`);
        console.log(`Equipment: ${results.equipment}`);
        console.log(`Material: ${results.material}`);
        console.log(`Currency: ${results.currency}`);
        console.log(`Other: ${results.other}`);

        return migrated;
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ItemMigrationUtility;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.ItemMigrationUtility = ItemMigrationUtility;
}
