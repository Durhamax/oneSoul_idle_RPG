/**
 * BIOME REGISTRY
 *
 * Manages biome definitions for world generation.
 * Biomes define environmental characteristics, resources, and appearance.
 */

class BiomeRegistryClass extends BaseRegistry {
    constructor() {
        super('biome');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'baseComplication'],
            optional: [
                'color', 'icon', 'description', 'temperature', 'humidity',
                'gatheringNodes', 'enemies', 'hazards', 'resourceMultipliers',
                'movementSpeed', 'discoveryChanceModifier', 'assetPath'
            ]
        };
    }

    // Query methods
    getByDifficulty(minComplication, maxComplication) {
        const allBiomes = this.getAllActive();
        const filtered = {};
        for (const [id, biome] of Object.entries(allBiomes)) {
            const comp = biome.baseComplication || 1.0;
            if (comp >= minComplication && comp <= maxComplication) {
                filtered[id] = biome;
            }
        }
        return filtered;
    }

    getByTemperature(temp) {
        const allBiomes = this.getAllActive();
        const filtered = {};
        for (const [id, biome] of Object.entries(allBiomes)) {
            if (biome.temperature === temp) filtered[id] = biome;
        }
        return filtered;
    }
}

const BiomeRegistry = new BiomeRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiomeRegistry;
}
