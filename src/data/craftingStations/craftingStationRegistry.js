/**
 * CRAFTING STATION REGISTRY
 *
 * Manages crafting station definitions (anvil, workbench, etc.).
 */

class CraftingStationRegistryClass extends BaseRegistry {
    constructor() {
        super('craftingStation');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'icon'],
            optional: [
                'description', 'requiredLevel', 'recipes', 'skills',
                'unlockRequirement', 'assetPath', 'tier', 'category', 'tags'
            ]
        };
    }

    // Query methods
    getByRecipe(recipeId) {
        const allStations = this.getAllActive();
        const filtered = {};
        for (const [id, station] of Object.entries(allStations)) {
            if (station.recipes?.includes(recipeId)) filtered[id] = station;
        }
        return filtered;
    }

    getBySkill(skill) {
        const allStations = this.getAllActive();
        const filtered = {};
        for (const [id, station] of Object.entries(allStations)) {
            if (station.skills?.includes(skill)) filtered[id] = station;
        }
        return filtered;
    }

    getByTier(tier) {
        const allStations = this.getAllActive();
        const filtered = {};
        for (const [id, station] of Object.entries(allStations)) {
            if (station.tier === tier) filtered[id] = station;
        }
        return filtered;
    }
}

const CraftingStationRegistry = new CraftingStationRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CraftingStationRegistry;
}
