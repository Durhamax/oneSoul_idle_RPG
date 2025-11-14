/**
 * NODE DEVELOPER TOOLS
 *
 * Developer utilities for testing and managing nodes
 */

const NodeDevTools = {
    /**
     * View all nodes organized by tier
     */
    showNodesByTier() {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       NODES BY TIER                    ║');
        console.log('╚════════════════════════════════════════╝\n');

        const allNodes = NodeRegistry.getAllActive();
        const nodesByTier = {};

        // Group by tier
        for (const nodeId in allNodes) {
            const node = allNodes[nodeId];
            if (!nodesByTier[node.tier]) {
                nodesByTier[node.tier] = [];
            }
            nodesByTier[node.tier].push(node);
        }

        // Display each tier
        const tiers = Object.keys(nodesByTier).sort((a, b) => parseInt(a) - parseInt(b));

        tiers.forEach(tier => {
            const nodes = nodesByTier[tier];
            console.log(`%c⭐ Tier ${tier} (${nodes.length} nodes)`, 'color: #ff9800; font-weight: bold;');

            console.table(nodes.map(n => ({
                ID: n.id,
                Name: n.name,
                Type: n.nodeType,
                'Skill Req': n.requiredSkillLevel,
                Health: `${n.baseHealth} (${n.minHealth}-${n.maxHealth})`,
                'Harvest Time': `${n.harvestTime}s`,
                XP: n.baseXP,
                Rarity: n.rarity
            })));

            console.log('\n');
        });
    },

    /**
     * View all nodes organized by skill
     */
    showNodesBySkill() {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       NODES BY SKILL                   ║');
        console.log('╚════════════════════════════════════════╝\n');

        const skills = ['mining', 'logging', 'fishing', 'hunting', 'foraging', 'thieving'];

        skills.forEach(skill => {
            const nodes = NodeRegistry.getBySkill(skill);

            if (nodes.length === 0) return;

            console.log(`%c${this.getSkillIcon(skill)} ${skill.toUpperCase()} (${nodes.length} nodes)`,
                'color: #4caf50; font-weight: bold;');

            console.table(nodes.map(n => ({
                ID: n.id,
                Name: n.name,
                Tier: n.tier,
                'Skill Req': n.requiredSkillLevel,
                Health: n.baseHealth,
                XP: n.baseXP,
                'Rare %': n.rareDropChance
            })));

            console.log('\n');
        });
    },

    /**
     * Spawn a node in current region (for testing)
     */
    spawnNode(nodeId) {
        if (typeof GameEngine === 'undefined') {
            console.error('GameEngine not available');
            return;
        }

        const node = NodeRegistry.getAllActive()[nodeId];
        if (!node) {
            console.error(`Node '${nodeId}' not found`);
            return;
        }

        const currentRegion = GameEngine.state.currentRegion;
        const regionData = GameEngine.state.regions[currentRegion];

        if (!regionData) {
            console.error(`Region '${currentRegion}' not found`);
            return;
        }

        // Initialize availableNodes if needed
        if (!regionData.availableNodes) {
            regionData.availableNodes = {};
        }

        // Spawn the node
        regionData.availableNodes[nodeId] = {
            discovered: true,
            currentHealth: node.baseHealth,
            maxHealth: node.baseHealth,
            depletedAt: null
        };

        console.log(`%c✅ Spawned ${node.name} in ${currentRegion}`,
            'color: #4caf50; font-weight: bold;');

        // Refresh UI if available
        if (typeof updateResourcesUI === 'function') {
            updateResourcesUI();
        }
    },

    /**
     * Spawn all nodes of a skill type in current region
     */
    spawnAllNodesForSkill(skillType) {
        const nodes = NodeRegistry.getBySkill(skillType);

        if (nodes.length === 0) {
            console.error(`No nodes found for skill: ${skillType}`);
            return;
        }

        nodes.forEach(node => {
            this.spawnNode(node.id);
        });

        console.log(`%c✅ Spawned ${nodes.length} ${skillType} nodes`,
            'color: #4caf50; font-weight: bold;');
    },

    /**
     * Test harvesting a node multiple times
     */
    testHarvest(nodeId, count = 1) {
        if (typeof GameEngine === 'undefined') {
            console.error('GameEngine not available');
            return;
        }

        const node = NodeRegistry.getAllActive()[nodeId];
        if (!node) {
            console.error(`Node '${nodeId}' not found`);
            return;
        }

        console.log(`%c🔨 Testing ${count} harvests of ${node.name}...`,
            'color: #2196f3; font-weight: bold;');

        const results = {
            items: {},
            rareDrops: {},
            totalXP: 0
        };

        for (let i = 0; i < count; i++) {
            // Ensure node is spawned
            if (!GameEngine.getNodeState(nodeId)) {
                this.spawnNode(nodeId);
            }

            // Start harvest
            if (!GameEngine.startHarvest(nodeId)) {
                console.error(`Failed to start harvest ${i + 1}`);
                break;
            }

            // Force complete immediately (for testing)
            GameEngine.state.nodeCollection.activeNode.completionTime = Date.now();
            const harvestResult = GameEngine.completeHarvest();

            if (!harvestResult) {
                console.error(`Failed to complete harvest ${i + 1}`);
                break;
            }

            // Aggregate results
            harvestResult.normalLoot.forEach(item => {
                results.items[item.itemId] = (results.items[item.itemId] || 0) + item.quantity;
            });

            harvestResult.rareLoot.forEach(item => {
                results.rareDrops[item.itemId] = (results.rareDrops[item.itemId] || 0) + item.quantity;
            });

            results.totalXP += harvestResult.xpGain;

            // Re-spawn if depleted
            if (harvestResult.harvestsRemaining === 0) {
                this.spawnNode(nodeId);
            }
        }

        console.log(`%c✅ Completed ${count} harvests`, 'color: #4caf50; font-weight: bold;');
        console.log('Items:', results.items);
        console.log('Rare Drops:', results.rareDrops);
        console.log(`Total XP: ${results.totalXP}`);

        return results;
    },

    /**
     * Clear all nodes from current region
     */
    clearAllNodes() {
        if (typeof GameEngine === 'undefined') {
            console.error('GameEngine not available');
            return;
        }

        const currentRegion = GameEngine.state.currentRegion;
        const regionData = GameEngine.state.regions[currentRegion];

        if (!regionData) {
            console.error(`Region '${currentRegion}' not found`);
            return;
        }

        const count = regionData.availableNodes ? Object.keys(regionData.availableNodes).length : 0;
        regionData.availableNodes = {};

        console.log(`%c✅ Cleared ${count} nodes from ${currentRegion}`,
            'color: #ff9800; font-weight: bold;');

        // Refresh UI
        if (typeof updateResourcesUI === 'function') {
            updateResourcesUI();
        }
    },

    /**
     * Validate all nodes and show report
     */
    validateAllNodes() {
        const report = NodeValidator.validateRegistry();
        NodeValidator.printReport(report);
        return report;
    },

    /**
     * Get node statistics
     */
    getStatistics() {
        return NodeRegistry.getStatistics();
    },

    /**
     * Generate nodes at any tier (using scaling system)
     */
    generateNodeAtTier(tier, nodeType, name) {
        console.log(`%c🔧 Generating ${nodeType} node at tier ${tier}...`,
            'color: #9c27b0; font-weight: bold;');

        const node = NodeScaling.generateNode({
            id: `generated_${nodeType}_t${tier}`,
            name: name || `Generated ${nodeType} (T${tier})`,
            description: `A procedurally generated tier ${tier} ${nodeType} node`,
            icon: this.getSkillIcon(nodeType),
            nodeType,
            category: 'generated',
            tier,
            primaryResource: `${nodeType}_resource`,
            secondaryResources: ['common_drop'],
            biomes: NodeScaling.getBiomesForTier(tier, nodeType)
        });

        // Validate
        const validation = NodeValidator.validate(node);

        if (validation.valid) {
            console.log('%c✅ Generated valid node', 'color: #4caf50; font-weight: bold;');
            console.log(node);
        } else {
            console.error('%c❌ Generated node has errors:', 'color: #f44336; font-weight: bold;');
            console.error(validation.errors);
        }

        if (validation.warnings.length > 0) {
            console.warn('⚠️ Warnings:', validation.warnings);
        }

        return node;
    },

    /**
     * Test progression series generation
     */
    testProgressionSeries(nodeType, startTier, endTier) {
        console.log(`%c🔧 Generating ${nodeType} progression series (Tier ${startTier}-${endTier})...`,
            'color: #9c27b0; font-weight: bold;');

        const series = NodeScaling.generateProgressionSeries({
            baseName: `${nodeType} Node`,
            nodeType,
            category: 'generated',
            icon: this.getSkillIcon(nodeType),
            primaryResource: `${nodeType}_ore`,
            secondaryResources: ['stone', 'dust'],
            biomes: ['plains', 'mountains'],
            startTier,
            endTier,
            pathName: 'test_progression'
        });

        console.log(`%c✅ Generated ${series.length} nodes`, 'color: #4caf50; font-weight: bold;');

        // Validate all
        let validCount = 0;
        series.forEach(node => {
            const validation = NodeValidator.validate(node);
            if (validation.valid) validCount++;
        });

        console.log(`Valid: ${validCount}/${series.length}`);

        // Show summary table
        console.table(series.map(n => ({
            ID: n.id,
            Tier: n.tier,
            'Skill Req': n.requiredSkillLevel,
            Health: n.baseHealth,
            'Harvest Time': `${n.harvestTime}s`,
            XP: n.baseXP,
            'Rare %': n.rareDropChance
        })));

        return series;
    },

    /**
     * Compare stats across tiers
     */
    compareTierScaling(startTier = 1, endTier = 10) {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       TIER SCALING COMPARISON          ║');
        console.log('╚════════════════════════════════════════╝\n');

        const comparison = [];

        for (let tier = startTier; tier <= endTier; tier++) {
            comparison.push(NodeScaling.calculateTierStats(tier));
        }

        console.table(comparison.map((stats, index) => ({
            Tier: startTier + index,
            'Skill Req': stats.requiredSkillLevel,
            'Char Lvl': stats.recommendedLevel,
            Health: `${stats.baseHealth} (${stats.minHealth}-${stats.maxHealth})`,
            'Harvest': `${stats.harvestTime.toFixed(1)}s`,
            'Respawn': `${stats.respawnTime}s`,
            XP: stats.baseXP,
            'Rare %': `${stats.rareDropChance}%`
        })));
    },

    /**
     * Get skill icon
     */
    getSkillIcon(skillType) {
        const icons = {
            mining: '⛏️',
            logging: '🪓',
            fishing: '🎣',
            hunting: '🏹',
            foraging: '🌿',
            thieving: '🎭'
        };
        return icons[skillType] || '📦';
    },

    /**
     * Show help
     */
    help() {
        console.log(`
%c🔧 Node Developer Tools%c

Available commands:
  %cNodeDevTools.showNodesByTier()%c          View all nodes organized by tier
  %cNodeDevTools.showNodesBySkill()%c         View all nodes organized by skill
  %cNodeDevTools.spawnNode(id)%c              Spawn specific node in current region
  %cNodeDevTools.spawnAllNodesForSkill(skill)%c  Spawn all nodes of a skill type
  %cNodeDevTools.testHarvest(id, count)%c     Test harvesting (default 1 harvest)
  %cNodeDevTools.clearAllNodes()%c            Remove all nodes from current region
  %cNodeDevTools.validateAllNodes()%c         Validate all nodes and show report
  %cNodeDevTools.getStatistics()%c            Get registry statistics
  %cNodeDevTools.generateNodeAtTier(tier, type, name)%c  Generate node at tier
  %cNodeDevTools.testProgressionSeries(type, start, end)%c  Test series generation
  %cNodeDevTools.compareTierScaling(start, end)%c  Compare stats across tiers

Example usage:
  NodeDevTools.showNodesByTier()
  NodeDevTools.spawnNode('copper_vein')
  NodeDevTools.testHarvest('copper_vein', 10)
  NodeDevTools.generateNodeAtTier(5, 'mining', 'Test Node')
  NodeDevTools.compareTierScaling(1, 10)
        `,
        'color: #ff9800; font-weight: bold; font-size: 16px;', 'color: inherit;',
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

// Make globally available
if (typeof window !== 'undefined') {
    window.NodeDevTools = NodeDevTools;
}
