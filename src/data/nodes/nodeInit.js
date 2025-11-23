/**
 * NODE SYSTEM INITIALIZATION
 *
 * Initializes the node system and provides console utilities
 */

// Initialize node system
window.addEventListener('DOMContentLoaded', () => {
    console.log('%c🌲 Node System Loading...', 'color: #4caf50; font-weight: bold; font-size: 14px;');

    // Register items embedded in node definitions
    if (typeof NodeItemIntegration !== 'undefined') {
        NodeItemIntegration.registerNodeItems(NodeRegistry);
    }

    // Run validation
    const validation = NodeUtils.validateAllNodes();

    console.log(`%c✅ Node System Loaded`, 'color: #4caf50; font-weight: bold;');
    console.log(`   Total Nodes: ${validation.total}`);
    console.log(`   Valid: ${validation.valid}`);
    console.log(`   Invalid: ${validation.invalid}`);
    console.log(`   Warnings: ${validation.warnings}`);

    // Show any errors
    if (validation.invalid > 0) {
        console.error('%c❌ INVALID NODES FOUND:', 'color: #f44336; font-weight: bold;');
        for (let nodeId in validation.details) {
            const detail = validation.details[nodeId];
            if (!detail.isValid) {
                console.error(`   ${nodeId}:`, detail.errors);
            }
        }
    }

    // Show warnings
    if (validation.warnings > 0) {
        console.warn('%c⚠️  NODE WARNINGS:', 'color: #ff9800; font-weight: bold;');
        for (let nodeId in validation.details) {
            const detail = validation.details[nodeId];
            if (detail.warnings.length > 0) {
                console.warn(`   ${nodeId}:`, detail.warnings);
            }
        }
    }

    // Print registry statistics
    NodeRegistry.printSummary();

    // Add console utilities
    window.Nodes = {
        // Quick access to registry
        registry: NodeRegistry,

        // Quick access to utilities
        utils: NodeUtils,

        // Get all nodes
        all() {
            return NodeRegistry.getAllActive();
        },

        // Get node by ID
        get(nodeId) {
            return NodeRegistry.getAllActive()[nodeId];
        },

        // Get nodes by skill
        bySkill(skillType) {
            return NodeRegistry.getBySkill(skillType);
        },

        // Get nodes by tier
        byTier(tier) {
            return NodeRegistry.getByTier(tier);
        },

        // Get nodes by biome
        byBiome(biome) {
            return NodeRegistry.getByBiome(biome);
        },

        // List all node IDs
        list() {
            const nodes = NodeRegistry.getAllActive();
            return Object.keys(nodes).sort();
        },

        // List nodes by skill
        listBySkill() {
            const skills = ['mining', 'logging', 'fishing', 'hunting', 'foraging', 'thieving'];
            const result = {};

            skills.forEach(skill => {
                const nodes = NodeRegistry.getBySkill(skill);
                result[skill] = nodes.map(n => n.id);
            });

            return result;
        },

        // Validate a specific node
        validate(nodeId) {
            const node = this.get(nodeId);
            if (!node) {
                console.error(`Node '${nodeId}' not found`);
                return null;
            }
            return NodeUtils.validateNode(node);
        },

        // Validate all nodes
        validateAll() {
            return NodeUtils.printValidationReport();
        },

        // Get statistics
        stats() {
            return NodeRegistry.getStatistics();
        },

        // Print summary
        summary() {
            return NodeRegistry.printSummary();
        },

        // Test harvest simulation
        testHarvest(nodeId, skillLevel = 50) {
            const node = this.get(nodeId);
            if (!node) {
                console.error(`Node '${nodeId}' not found`);
                return null;
            }

            // Create mock player state
            const mockPlayerState = {
                skills: {
                    [node.nodeType]: { level: skillLevel, unlocked: true }
                },
                nodeHarvestCounts: {}
            };

            console.log(`%c🎯 Testing Harvest: ${node.name}`, 'color: #2196f3; font-weight: bold;');
            console.log(`   Skill Level: ${skillLevel} (Required: ${node.requiredSkillLevel})`);
            console.log(`   Harvest Time: ${NodeUtils.calculateHarvestTime(node, skillLevel).toFixed(2)}s`);
            console.log(`   Rare Chance: ${NodeUtils.calculateRareChance(node, skillLevel).toFixed(2)}%`);

            // Simulate 10 harvests
            const results = {
                items: {},
                rareDrops: {},
                totalXP: 0
            };

            for (let i = 0; i < 10; i++) {
                const rewards = NodeUtils.processHarvest(node, mockPlayerState);

                // Aggregate items
                rewards.items.forEach(item => {
                    results.items[item.itemId] = (results.items[item.itemId] || 0) + item.quantity;
                });

                // Aggregate rare drops
                rewards.rareDrops.forEach(item => {
                    results.rareDrops[item.itemId] = (results.rareDrops[item.itemId] || 0) + item.quantity;
                });

                results.totalXP += rewards.xp;
            }

            console.log('   Results (10 harvests):');
            console.log('   Items:', results.items);
            console.log('   Rare Drops:', results.rareDrops);
            console.log(`   Total XP: ${results.totalXP}`);

            return results;
        },

        // Help command
        help() {
            console.log(`
%c🌲 Node System Console Utilities%c

Available commands:
  %cNodes.all()%c                  Get all active nodes
  %cNodes.get(id)%c                Get specific node by ID
  %cNodes.bySkill(skill)%c         Get nodes by skill type
  %cNodes.byTier(tier)%c           Get nodes by tier
  %cNodes.byBiome(biome)%c         Get nodes by biome
  %cNodes.list()%c                 List all node IDs
  %cNodes.listBySkill()%c          List nodes organized by skill
  %cNodes.validate(id)%c           Validate specific node
  %cNodes.validateAll()%c          Validate all nodes and show report
  %cNodes.stats()%c                Get registry statistics
  %cNodes.summary()%c              Print registry summary
  %cNodes.testHarvest(id, lvl)%c  Simulate 10 harvests at given level
  %cNodes.help()%c                 Show this help message

Example usage:
  Nodes.get('copper_vein')
  Nodes.bySkill('mining')
  Nodes.testHarvest('copper_vein', 25)
  Nodes.listBySkill()
            `,
            'color: #4caf50; font-weight: bold; font-size: 16px;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;',
            'color: #2196f3; font-weight: bold;', 'color: inherit;'
            );
        }
    };

    console.log('%c💡 TIP: Type "Nodes.help()" in the console for available commands', 'color: #9c27b0; font-style: italic;');
});
