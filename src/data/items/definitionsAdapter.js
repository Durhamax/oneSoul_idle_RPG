/**
 * DEFINITIONS ADAPTER
 *
 * Adapter that wraps definitions.js items and exposes them through ItemRegistry.
 * This allows gradual migration from old format to new format without breaking existing functionality.
 *
 * Old format (definitions.js):
 * - Uses `image` instead of `icon`
 * - Uses `equipSlot` instead of `slot`
 * - Uses `stats` instead of `combatStats`
 * - Missing many schema fields
 *
 * This adapter converts on-the-fly to maintain compatibility.
 */

const DefinitionsAdapter = {
    /**
     * Wrap definitions.js items for use with ItemRegistry
     *
     * @param {Object} definitionsItems - Items object from definitions.js
     * @returns {Object} Wrapped items in new format
     */
    wrapItems(definitionsItems) {
        const wrapped = {};

        for (const [itemId, oldItem] of Object.entries(definitionsItems)) {
            wrapped[itemId] = this.wrapItem(itemId, oldItem);
        }

        console.log(`📦 Wrapped ${Object.keys(wrapped).length} items from definitions.js`);
        return wrapped;
    },

    /**
     * Wrap a single item
     *
     * @param {string} itemId - Item ID
     * @param {Object} oldItem - Old format item
     * @returns {Object} Wrapped item in new format
     */
    wrapItem(itemId, oldItem) {
        // Convert old format to new format
        const wrapped = {
            id: itemId,
            name: oldItem.name || itemId,
            description: oldItem.description || 'No description',
            icon: oldItem.image || oldItem.icon || '❓',  // Support both old and new
            category: this.convertCategory(oldItem.category),
            rarity: this.inferRarity(itemId, oldItem),
            stackLimit: oldItem.stackLimit || 1,
            value: this.inferValue(itemId, oldItem),
            level: this.inferLevel(itemId, oldItem),
            sellable: true,
            tradeable: true,
            droppable: true,
            tags: this.generateTags(itemId, oldItem),

            // Preserve original data for reference
            _legacy: true,
            _originalFormat: oldItem.category,
            _originalData: oldItem,
        };

        // Add category-specific fields
        if (wrapped.category === 'equipment' && oldItem.category === 'tool') {
            wrapped.slot = 'tool';
            wrapped.tier = this.inferTier(itemId, oldItem);
            wrapped.combatStats = this.convertStats(oldItem.stats || {});
            wrapped.requirements = this.inferRequirements(itemId, oldItem);
        } else if (wrapped.category === 'material') {
            const materialData = this.getMaterialData(oldItem.category);
            if (materialData) {
                Object.assign(wrapped, materialData);
            }
        }

        return wrapped;
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
     * Infer rarity based on item name
     */
    inferRarity(itemId, oldItem) {
        const name = (oldItem.name || '').toLowerCase();

        if (name.includes('legendary') || name.includes('master') || name.includes('mithril')) return 'legendary';
        if (name.includes('golden') || name.includes('rare') || name.includes('steel')) return 'epic';
        if (name.includes('silver') || name.includes('carbon') || name.includes('composite')) return 'rare';
        if (name.includes('iron') || name.includes('bronze') || name.includes('long')) return 'uncommon';

        return 'common';
    },

    /**
     * Infer item value
     */
    inferValue(itemId, oldItem) {
        const rarity = this.inferRarity(itemId, oldItem);
        const values = { common: 10, uncommon: 30, rare: 100, epic: 300, legendary: 1000 };
        let value = values[rarity] || 10;

        if (oldItem.category === 'currency') value = 1;
        if (oldItem.category === 'tool') value *= 2;

        return value;
    },

    /**
     * Infer item level
     */
    inferLevel(itemId, oldItem) {
        const name = (oldItem.name || '').toLowerCase();

        if (name.includes('legendary') || name.includes('master') || name.includes('mithril')) return 20;
        if (name.includes('steel') || name.includes('golden') || name.includes('carbon')) return 15;
        if (name.includes('silver') || name.includes('composite')) return 10;
        if (name.includes('iron') || name.includes('long')) return 5;
        if (name.includes('bronze')) return 3;
        if (name.includes('stone') || name.includes('basic') || name.includes('bamboo')) return 1;

        return 1;
    },

    /**
     * Generate tags
     */
    generateTags(itemId, oldItem) {
        const tags = ['legacy'];  // Mark as legacy
        const name = (oldItem.name || '').toLowerCase();
        const category = oldItem.category;

        tags.push(category);

        // Material tags
        if (name.includes('stone')) tags.push('stone');
        if (name.includes('bronze')) tags.push('bronze');
        if (name.includes('iron')) tags.push('iron');
        if (name.includes('steel')) tags.push('steel');
        if (name.includes('mithril')) tags.push('mithril');

        // Tool tags
        if (name.includes('pickaxe')) tags.push('pickaxe', 'mining');
        if (name.includes('axe') || name.includes('hatchet')) tags.push('axe', 'woodcutting');
        if (name.includes('fishing') || name.includes('rod') || name.includes('net')) tags.push('fishing');
        if (name.includes('bow')) tags.push('bow', 'hunting');

        // Resource tags
        if (category === 'fish') tags.push('fish');
        if (category === 'meat') tags.push('meat');
        if (category === 'ore') tags.push('ore');

        return tags;
    },

    /**
     * Convert stats to combatStats
     */
    convertStats(oldStats) {
        const combatStats = {};

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
        const name = (oldItem.name || '').toLowerCase();

        if (name.includes('legendary') || name.includes('master') || name.includes('mithril')) return 'legendary';
        if (name.includes('steel') || name.includes('carbon')) return 'elite';
        if (name.includes('iron') || name.includes('composite')) return 'advanced';
        if (name.includes('bronze') || name.includes('long') || name.includes('basic')) return 'intermediate';
        if (name.includes('stone') || name.includes('short') || name.includes('bamboo') || name.includes('net')) return 'starter';

        return 'basic';
    },

    /**
     * Infer skill requirements
     */
    inferRequirements(itemId, oldItem) {
        const name = (oldItem.name || '').toLowerCase();
        const level = this.inferLevel(itemId, oldItem);
        const requirements = {};

        if (level > 1) requirements.level = level;

        if (name.includes('pickaxe') && level >= 3) {
            requirements.mining = level;
        }
        if ((name.includes('axe') || name.includes('hatchet')) && level >= 3) {
            requirements.woodcutting = level;
        }
        if ((name.includes('fishing') || name.includes('rod')) && level >= 3) {
            requirements.fishing = level;
        }
        if (name.includes('bow') && level >= 3) {
            requirements.hunting = level;
        }

        return requirements;
    },

    /**
     * Get material-specific data
     */
    getMaterialData(oldCategory) {
        const materialTypes = {
            'ore': { resourceType: 'ore', gatherSkill: 'mining' },
            'fish': { resourceType: 'fish', gatherSkill: 'fishing' },
            'meat': { resourceType: 'hunting', gatherSkill: 'hunting' },
            'hide': { resourceType: 'hunting', gatherSkill: 'hunting' },
            'feather': { resourceType: 'hunting', gatherSkill: 'hunting' },
            'bone': { resourceType: 'hunting', gatherSkill: 'hunting' },
            'fang': { resourceType: 'hunting', gatherSkill: 'hunting' },
            'pelt': { resourceType: 'hunting', gatherSkill: 'hunting' },
            'forage': { resourceType: 'plant', gatherSkill: 'foraging' },
        };

        return materialTypes[oldCategory] || null;
    },

    /**
     * Check if item needs migration
     *
     * @param {string} itemId - Item ID
     * @returns {boolean} True if item exists in new system
     */
    needsMigration(itemId) {
        // Check if item exists in unified system
        return !ItemUtils.hasItem(itemId);
    },

    /**
     * Get migration status for all definitions items
     */
    getMigrationStatus(definitionsItems) {
        const status = {
            total: 0,
            migrated: 0,
            needsMigration: 0,
            items: {
                migrated: [],
                needsMigration: [],
            },
        };

        for (const itemId of Object.keys(definitionsItems)) {
            status.total++;

            if (this.needsMigration(itemId)) {
                status.needsMigration++;
                status.items.needsMigration.push(itemId);
            } else {
                status.migrated++;
                status.items.migrated.push(itemId);
            }
        }

        return status;
    },

    /**
     * Print migration status
     */
    printMigrationStatus(definitionsItems) {
        const status = this.getMigrationStatus(definitionsItems);

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       MIGRATION STATUS                ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log(`📦 Total Items: ${status.total}`);
        console.log(`✅ Already Migrated: ${status.migrated}`);
        console.log(`➡️  Needs Migration: ${status.needsMigration}`);

        if (status.items.needsMigration.length > 0) {
            console.log(`\n📋 Items to Migrate (first 20):`);
            console.log(`   ${status.items.needsMigration.slice(0, 20).join(', ')}`);
        }

        console.log('\n' + '─'.repeat(50) + '\n');

        return status;
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DefinitionsAdapter;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.DefinitionsAdapter = DefinitionsAdapter;
}
