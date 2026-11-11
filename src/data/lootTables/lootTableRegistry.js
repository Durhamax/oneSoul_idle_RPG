/**
 * LOOT TABLE REGISTRY
 *
 * Manages loot table definitions for enemy drops and other random rewards.
 */

class LootTableRegistryClass extends BaseRegistry {
    constructor() {
        super('lootTable');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'items'],
            optional: [
                'guaranteedItems', 'currencyRanges', 'dropChance',
                'minItems', 'maxItems', 'rareDrops', 'conditions', 'tags'
            ]
        };
    }

    // Query methods
    getByEnemy(enemyId) {
        const allTables = this.getAllActive();
        const filtered = {};
        for (const [id, table] of Object.entries(allTables)) {
            if (table.enemyId === enemyId || table.tags?.includes(enemyId)) {
                filtered[id] = table;
            }
        }
        return filtered;
    }

    getByItemType(itemType) {
        const allTables = this.getAllActive();
        const filtered = {};
        for (const [id, table] of Object.entries(allTables)) {
            const hasItemType = table.items?.some(item => item.type === itemType);
            if (hasItemType) filtered[id] = table;
        }
        return filtered;
    }
}

const LootTableRegistry = new LootTableRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LootTableRegistry;
}
