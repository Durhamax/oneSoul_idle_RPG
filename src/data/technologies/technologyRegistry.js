/**
 * TECHNOLOGY REGISTRY
 *
 * Manages technology slot items and upgrades.
 */

class TechnologyRegistryClass extends BaseRegistry {
    constructor() {
        super('technology');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'icon'],
            optional: [
                'description', 'type', 'tier', 'effects', 'requirements',
                'researchTime', 'cost', 'prerequisites', 'category', 'tags'
            ]
        };
    }

    // Query methods
    getByType(type) {
        const allTech = this.getAllActive();
        const filtered = {};
        for (const [id, tech] of Object.entries(allTech)) {
            if (tech.type === type) filtered[id] = tech;
        }
        return filtered;
    }

    getByTier(tier) {
        const allTech = this.getAllActive();
        const filtered = {};
        for (const [id, tech] of Object.entries(allTech)) {
            if (tech.tier === tier) filtered[id] = tech;
        }
        return filtered;
    }

    getByCategory(category) {
        const allTech = this.getAllActive();
        const filtered = {};
        for (const [id, tech] of Object.entries(allTech)) {
            if (tech.category === category) filtered[id] = tech;
        }
        return filtered;
    }
}

const TechnologyRegistry = new TechnologyRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechnologyRegistry;
}
