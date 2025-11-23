/**
 * INCURSION REGISTRY
 *
 * Manages tactical encounter definitions (future feature).
 * Incursions are special combat scenarios with unique mechanics.
 */

class IncursionRegistryClass extends BaseRegistry {
    constructor() {
        super('incursion');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name'],
            optional: [
                'description', 'difficulty', 'region', 'enemies', 'waves',
                'rewards', 'objectives', 'timeLimit', 'modifiers', 'tier', 'tags'
            ]
        };
    }

    // Query methods
    getByDifficulty(difficulty) {
        const allIncursions = this.getAllActive();
        const filtered = {};
        for (const [id, incursion] of Object.entries(allIncursions)) {
            if (incursion.difficulty === difficulty) filtered[id] = incursion;
        }
        return filtered;
    }

    getByRegion(regionId) {
        const allIncursions = this.getAllActive();
        const filtered = {};
        for (const [id, incursion] of Object.entries(allIncursions)) {
            if (incursion.region === regionId) filtered[id] = incursion;
        }
        return filtered;
    }

    getByTier(tier) {
        const allIncursions = this.getAllActive();
        const filtered = {};
        for (const [id, incursion] of Object.entries(allIncursions)) {
            if (incursion.tier === tier) filtered[id] = incursion;
        }
        return filtered;
    }
}

const IncursionRegistry = new IncursionRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = IncursionRegistry;
}
