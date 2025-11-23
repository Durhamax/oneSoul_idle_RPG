/**
 * REGISTRY MANAGER
 *
 * Central manager for all entity registries in the game.
 * Provides unified access to all 17 entity types and cross-registry operations.
 *
 * Supported Entity Types:
 * - item, node, enemy, mission, recipe, skill, region
 * - perk, npc, biome, lootTable, craftingStation, technology
 * - incursion, attribute, currency, stance
 */

const RegistryManager = {
    /**
     * Map of all registries
     * Note: Some registries loaded dynamically, check availability before use
     */
    registries: {
        // Existing registries (already in game)
        item: null,          // Set when ItemRegistry loads
        node: null,          // Set when NodeRegistry loads
        enemy: null,         // Set when EnemyRegistry loads
        mission: null,       // Set when MissionRegistry loads
        recipe: null,        // Set when RecipeRegistry loads
        skill: null,         // Set when SkillRegistry loads
        region: null,        // Set when RegionRegistry loads

        // New registries (Phase 1)
        perk: null,          // Set when PerkRegistry loads
        npc: null,           // Set when NPCRegistry loads
        biome: null,         // Set when BiomeRegistry loads
        lootTable: null,     // Set when LootTableRegistry loads
        craftingStation: null, // Set when CraftingStationRegistry loads
        technology: null,    // Set when TechnologyRegistry loads
        incursion: null,     // Set when IncursionRegistry loads
        attribute: null,     // Set when AttributeRegistry loads
        currency: null,      // Set when CurrencyRegistry loads
        stance: null         // Set when StanceRegistry loads
    },

    /**
     * Initialize registry manager - links to all loaded registries
     * Call this after all registries have been loaded
     */
    init() {
        // Link existing registries
        if (typeof ItemRegistry !== 'undefined') this.registries.item = ItemRegistry;
        if (typeof NodeRegistry !== 'undefined') this.registries.node = NodeRegistry;
        if (typeof EnemyRegistry !== 'undefined') this.registries.enemy = EnemyRegistry;
        if (typeof MissionRegistry !== 'undefined') this.registries.mission = MissionRegistry;
        if (typeof RecipeRegistry !== 'undefined') this.registries.recipe = RecipeRegistry;
        if (typeof SkillRegistry !== 'undefined') this.registries.skill = SkillRegistry;
        if (typeof RegionRegistry !== 'undefined') this.registries.region = RegionRegistry;

        // Link new registries
        if (typeof PerkRegistry !== 'undefined') this.registries.perk = PerkRegistry;
        if (typeof NPCRegistry !== 'undefined') this.registries.npc = NPCRegistry;
        if (typeof BiomeRegistry !== 'undefined') this.registries.biome = BiomeRegistry;
        if (typeof LootTableRegistry !== 'undefined') this.registries.lootTable = LootTableRegistry;
        if (typeof CraftingStationRegistry !== 'undefined') this.registries.craftingStation = CraftingStationRegistry;
        if (typeof TechnologyRegistry !== 'undefined') this.registries.technology = TechnologyRegistry;
        if (typeof IncursionRegistry !== 'undefined') this.registries.incursion = IncursionRegistry;
        if (typeof AttributeRegistry !== 'undefined') this.registries.attribute = AttributeRegistry;
        if (typeof CurrencyRegistry !== 'undefined') this.registries.currency = CurrencyRegistry;
        if (typeof StanceRegistry !== 'undefined') this.registries.stance = StanceRegistry;

        console.log('✅ RegistryManager initialized');
        this.printStatus();
    },

    /**
     * Get a registry by entity type
     * @param {string} entityType - Type of entity
     * @returns {object|null} Registry object or null if not loaded
     */
    getRegistry(entityType) {
        const registry = this.registries[entityType];
        if (!registry) {
            console.warn(`⚠️ Registry for '${entityType}' not loaded`);
            return null;
        }
        return registry;
    },

    /**
     * Get entity from any registry
     * @param {string} entityType - Type of entity
     * @param {string} id - Entity ID
     * @returns {object|null} Entity definition or null
     */
    get(entityType, id) {
        const registry = this.getRegistry(entityType);
        if (!registry) return null;

        // Try using get() method if available (BaseRegistry)
        if (typeof registry.get === 'function') {
            return registry.get(id);
        }

        // Fallback to getAllActive() for old registries
        if (typeof registry.getAllActive === 'function') {
            const all = registry.getAllActive();
            return all[id] || null;
        }

        console.error(`❌ Registry for '${entityType}' has no get() or getAllActive() method`);
        return null;
    },

    /**
     * Check if entity exists in any registry
     * @param {string} entityType - Type of entity
     * @param {string} id - Entity ID
     * @returns {boolean}
     */
    has(entityType, id) {
        const registry = this.getRegistry(entityType);
        if (!registry) return false;

        // Try using has() method if available (BaseRegistry)
        if (typeof registry.has === 'function') {
            return registry.has(id);
        }

        // Fallback to getAllActive() for old registries
        if (typeof registry.getAllActive === 'function') {
            const all = registry.getAllActive();
            return id in all;
        }

        return false;
    },

    /**
     * Get all entities from a registry
     * @param {string} entityType - Type of entity
     * @returns {object} All entities from that registry
     */
    getAll(entityType) {
        const registry = this.getRegistry(entityType);
        if (!registry) return {};

        if (typeof registry.getAllActive === 'function') {
            return registry.getAllActive();
        }

        console.error(`❌ Registry for '${entityType}' has no getAllActive() method`);
        return {};
    },

    /**
     * Get statistics for all registries
     * @returns {object} Statistics by entity type
     */
    getAllStats() {
        const stats = {};

        for (const [type, registry] of Object.entries(this.registries)) {
            if (!registry) {
                stats[type] = { status: 'not_loaded' };
                continue;
            }

            // Try using getStatistics() if available (BaseRegistry)
            if (typeof registry.getStatistics === 'function') {
                stats[type] = registry.getStatistics();
            } else {
                // Fallback for old registries
                const all = registry.getAllActive ? registry.getAllActive() : {};
                stats[type] = {
                    status: 'loaded',
                    total: Object.keys(all).length,
                    hasBaseRegistry: false
                };
            }
        }

        return stats;
    },

    /**
     * Export all registries to JSON
     * @returns {object} All registry data as JSON
     */
    exportAllJSON() {
        const data = {};

        for (const [type, registry] of Object.entries(this.registries)) {
            if (!registry) continue;

            if (typeof registry.exportJSON === 'function') {
                data[type] = registry.exportJSON();
            } else if (typeof registry.getAllActive === 'function') {
                data[type] = registry.getAllActive();
            }
        }

        return data;
    },

    /**
     * Import data into registries from JSON
     * @param {object} data - Object with entity type keys
     * @returns {object} Import results by type
     */
    importAllJSON(data) {
        const results = {};

        for (const [type, entities] of Object.entries(data)) {
            const registry = this.getRegistry(type);
            if (!registry) {
                results[type] = { success: false, reason: 'Registry not loaded' };
                continue;
            }

            if (typeof registry.importJSON === 'function') {
                const count = registry.importJSON(entities);
                results[type] = { success: true, count };
            } else {
                results[type] = { success: false, reason: 'No importJSON() method' };
            }
        }

        return results;
    },

    /**
     * Enable dev mode on all registries
     */
    enableDevModeAll() {
        for (const [type, registry] of Object.entries(this.registries)) {
            if (registry && typeof registry.enableDevMode === 'function') {
                registry.enableDevMode();
            }
        }
        console.log('🔧 Dev mode enabled on all registries');
    },

    /**
     * Disable dev mode on all registries
     */
    disableDevModeAll() {
        for (const [type, registry] of Object.entries(this.registries)) {
            if (registry && typeof registry.disableDevMode === 'function') {
                registry.disableDevMode();
            }
        }
        console.log('🔧 Dev mode disabled on all registries');
    },

    /**
     * Print status of all registries
     */
    printStatus() {
        console.log('\n📊 REGISTRY MANAGER STATUS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const stats = this.getAllStats();
        let loadedCount = 0;
        let totalEntities = 0;

        for (const [type, stat] of Object.entries(stats)) {
            const status = stat.status === 'not_loaded' ? '❌' : '✅';
            const count = stat.total || stat.active || 0;
            const hasBase = stat.hasBaseRegistry !== false ? '(BaseRegistry)' : '(Legacy)';

            if (stat.status !== 'not_loaded') {
                loadedCount++;
                totalEntities += count;
            }

            console.log(`${status} ${type.padEnd(20)} ${String(count).padStart(5)} ${hasBase}`);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Loaded: ${loadedCount}/17 registries`);
        console.log(`Total Entities: ${totalEntities}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    },

    /**
     * Print summary for all registries
     */
    printAllSummaries() {
        for (const [type, registry] of Object.entries(this.registries)) {
            if (registry && typeof registry.printSummary === 'function') {
                registry.printSummary();
            }
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.RegistryManager = RegistryManager;
}
