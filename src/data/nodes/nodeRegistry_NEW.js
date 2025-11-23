/**
 * NODE REGISTRY (Refactored to extend BaseRegistry)
 *
 * Manages all resource nodes across different environments.
 * Now extends BaseRegistry for unified interface while maintaining 100% backward compatibility.
 */

class NodeRegistryClass extends BaseRegistry {
    constructor() {
        super('node');

        // Map config names for backward compatibility
        Object.defineProperty(this.config, 'includeDevNodes', {
            get() { return this.devMode; },
            set(value) { this.devMode = value; }
        });
        Object.defineProperty(this.config, 'includeTestNodes', {
            get() { return this.testMode; },
            set(value) { this.testMode = value; }
        });
        Object.defineProperty(this.config, 'includePlannedNodes', {
            get() { return false; },
            set(value) { /* no-op */ }
        });

        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'nodeType', 'requiredSkillLevel', 'baseHealth'],
            optional: [
                'description', 'icon', 'category', 'tier', 'rarity', 'biome',
                'harvestTime', 'respawnTime', 'resourceTable', 'baseXP',
                'resistance', 'evasion', 'critEvasion', 'minHealth', 'maxHealth',
                'status', 'recommendedLevel', 'assetPath', 'tags'
            ]
        };
    }

    // ===== ORIGINAL METHODS =====

    init() {
        console.log('🌳 Node Registry Initializing...');
        const stats = this.getStatistics();
        console.log(`📦 Production Nodes: ${stats.production.count}`);
        console.log(`🔧 Dev Nodes: ${stats.dev.count}`);
        console.log(`🧪 Test Nodes: ${stats.test.count}`);
        console.log(`📜 Legacy Nodes: ${stats.legacy.count}`);
        console.log(`🔮 Planned Nodes: ${stats.planned.count}`);
        console.log(`✅ Total Active: ${stats.totalActive}`);
        console.log('✅ Node Registry Initialized');
    }

    getNode(nodeId) {
        const nodes = this.getAllActive();
        return nodes[nodeId] || null;
    }

    hasNode(nodeId) {
        const nodes = this.getAllActive();
        return nodeId in nodes;
    }

    getBySkill(skillType) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node => node.nodeType === skillType);
    }

    getByTier(tier) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node => node.tier === tier);
    }

    getByTierRange(minTier, maxTier) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node =>
            node.tier >= minTier && node.tier <= maxTier
        );
    }

    getByBiome(biome) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node =>
            node.biome === biome || node.biomes?.includes(biome)
        );
    }

    getByCategory(category) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node => node.category === category);
    }

    getByRarity(rarity) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node => node.rarity === rarity);
    }

    getAvailableAtLevel(skillType, skillLevel) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node =>
            node.nodeType === skillType && node.requiredSkillLevel <= skillLevel
        );
    }

    getUnlockedNodes(playerState) {
        const nodes = this.getAllActive();
        return Object.values(nodes).filter(node => this.meetsRequirements(node, playerState));
    }

    meetsRequirements(node, playerState) {
        if (!node.requiredSkillLevel || !node.nodeType) return true;
        const playerLevel = playerState.skills?.[node.nodeType]?.level || 0;
        if (playerLevel < node.requiredSkillLevel) return false;
        if (node.requiredTools) {
            return this.hasRequiredTool(node.requiredTools, node.minToolTier || 1, playerState);
        }
        return true;
    }

    hasRequiredTool(requiredTools, minTier, playerState) {
        if (!requiredTools || requiredTools.length === 0) return true;
        const equippedTool = playerState.equipment?.weapon;
        if (!equippedTool) return false;
        return requiredTools.includes(equippedTool);
    }

    getStatistics() {
        return {
            production: { count: Object.keys(this.production).length, active: true },
            dev: { count: Object.keys(this.dev).length, active: this.config.includeDevNodes },
            test: { count: Object.keys(this.test).length, active: this.config.includeTestNodes },
            legacy: { count: Object.keys(this.legacy).length, active: false },
            planned: { count: Object.keys(this.planned).length, active: this.config.includePlannedNodes },
            totalActive: Object.keys(this.getAllActive()).length
        };
    }

    groupBySkill() {
        const nodes = this.getAllActive();
        const grouped = {};
        for (const [nodeId, node] of Object.entries(nodes)) {
            const skill = node.nodeType || 'unknown';
            if (!grouped[skill]) grouped[skill] = {};
            grouped[skill][nodeId] = node;
        }
        return grouped;
    }

    printSummary() {
        const stats = this.getStatistics();
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       NODE REGISTRY SUMMARY           ║');
        console.log('╚════════════════════════════════════════╝\n');
        console.log('🌳 Registry Counts:');
        console.log(`   Production:  ${stats.production.count.toString().padStart(3)} nodes (${stats.production.active ? '✅' : '❌'})`);
        console.log(`   Dev:         ${stats.dev.count.toString().padStart(3)} nodes (${stats.dev.active ? '✅' : '❌'})`);
        console.log(`   Test:        ${stats.test.count.toString().padStart(3)} nodes (${stats.test.active ? '✅' : '❌'})`);
        console.log(`   Legacy:      ${stats.legacy.count.toString().padStart(3)} nodes (${stats.legacy.active ? '✅' : '❌'})`);
        console.log(`   Planned:     ${stats.planned.count.toString().padStart(3)} nodes (${stats.planned.active ? '✅' : '❌'})`);
        console.log(`\n🎯 Total Active: ${stats.totalActive} nodes\n`);
        console.log('─'.repeat(50) + '\n');
    }

    enableDevMode() {
        this.config.includeDevNodes = true;
        this.config.includeTestNodes = true;
        console.log('🔧 Node dev mode enabled');
    }

    disableDevMode() {
        this.config.includeDevNodes = false;
        this.config.includeTestNodes = false;
        console.log('🎮 Node production mode');
    }
}

const NodeRegistry = new NodeRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeRegistry;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.NodeRegistry = NodeRegistry;
}
