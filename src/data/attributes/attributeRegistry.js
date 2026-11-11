/**
 * ATTRIBUTE REGISTRY
 *
 * Manages combat attribute metadata (Strength, Dexterity, Constitution, etc.).
 * Defines how attributes affect stats and gameplay.
 */

class AttributeRegistryClass extends BaseRegistry {
    constructor() {
        super('attribute');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'icon'],
            optional: [
                'description', 'effects', 'scaling', 'category',
                'abbreviation', 'color', 'maxValue', 'tags',
                'baseValue', 'scalingFactor'
            ]
        };
    }

    // Query methods
    getByCategory(category) {
        const allAttributes = this.getAllActive();
        const filtered = {};
        for (const [id, attr] of Object.entries(allAttributes)) {
            if (attr.category === category) filtered[id] = attr;
        }
        return filtered;
    }

    getCombatAttributes() {
        return this.getByCategory('combat');
    }

    getGatheringAttributes() {
        return this.getByCategory('gathering');
    }
}

const AttributeRegistry = new AttributeRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttributeRegistry;
}
