/**
 * NODE REGISTRY - CENTRALIZED NODE MANAGEMENT
 *
 * Manages all resource nodes across different environments.
 * Provides query methods for filtering and accessing nodes.
 */

const NodeRegistry = {
    // === REGISTRY STORAGE ===
    // Production nodes (real game content)
    production: {},

    // Development/testing nodes
    dev: {},
    test: {},
    legacy: {},
    planned: {},

    // Configuration
    config: {
        includeDevNodes: false,      // Include dev nodes in active set
        includeTestNodes: false,     // Include test nodes in active set
        includePlannedNodes: false   // Include planned nodes in active set
    },

    // === INITIALIZATION ===
    /**
     * Initialize the registry (called after all node files are loaded)
     */
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
    },

    // === CORE ACCESSORS ===
    /**
     * Get all active nodes (respects config flags)
     */
    getAllActive() {
        let nodes = { ...this.production };

        if (this.config.includeDevNodes) {
            nodes = { ...nodes, ...this.dev };
        }
        if (this.config.includeTestNodes) {
            nodes = { ...nodes, ...this.test };
        }
        if (this.config.includePlannedNodes) {
            nodes = { ...nodes, ...this.planned };
        }

        return nodes;
    },

    /**
     * Get production nodes only
     */
    getProduction() {
        return this.production;
    },

    /**
     * Get dev nodes only
     */
    getDev() {
        return this.dev;
    },

    /**
     * Get test nodes only
     */
    getTest() {
        return this.test;
    },

    /**
     * Get legacy nodes only
     */
    getLegacy() {
        return this.legacy;
    },

    /**
     * Get planned nodes only
     */
    getPlanned() {
        return this.planned;
    },

    /**
     * Get a specific node by ID
     */
    getNode(nodeId) {
        const allNodes = this.getAllActive();
        return allNodes[nodeId] || null;
    },

    /**
     * Check if a node exists
     */
    hasNode(nodeId) {
        return this.getNode(nodeId) !== null;
    },

    // === FILTERING METHODS ===
    /**
     * Get nodes by skill type
     */
    getBySkill(skillType) {
        const allNodes = this.getAllActive();
        return Object.values(allNodes).filter(node => node.nodeType === skillType);
    },

    /**
     * Get nodes by tier
     */
    getByTier(tier) {
        const allNodes = this.getAllActive();
        return Object.values(allNodes).filter(node => node.tier === tier);
    },

    /**
     * Get nodes within tier range
     */
    getByTierRange(minTier, maxTier) {
        const allNodes = this.getAllActive();
        return Object.values(allNodes).filter(node =>
            node.tier >= minTier && node.tier <= maxTier
        );
    },

    /**
     * Get nodes by biome
     */
    getByBiome(biome) {
        const allNodes = this.getAllActive();
        return Object.values(allNodes).filter(node =>
            node.biomes && node.biomes.includes(biome)
        );
    },

    /**
     * Get nodes by category
     */
    getByCategory(category) {
        const allNodes = this.getAllActive();
        return Object.values(allNodes).filter(node => node.category === category);
    },

    /**
     * Get nodes by rarity
     */
    getByRarity(rarity) {
        const allNodes = this.getAllActive();
        return Object.values(allNodes).filter(node => node.rarity === rarity);
    },

    /**
     * Get nodes available at skill level
     */
    getAvailableAtLevel(skillType, skillLevel) {
        return this.getBySkill(skillType).filter(node =>
            node.requiredSkillLevel <= skillLevel
        );
    },

    /**
     * Get nodes unlocked for player (considers all requirements)
     */
    getUnlockedNodes(playerState) {
        const allNodes = Object.values(this.getAllActive());
        return allNodes.filter(node => this.meetsRequirements(node, playerState));
    },

    /**
     * Check if player meets node requirements
     */
    meetsRequirements(node, playerState) {
        const req = node.requirements;

        // Check skill level
        if (playerState.skills[req.skill].level < req.skillLevel) {
            return false;
        }

        // Check character level
        if (req.characterLevel && playerState.characterLevel.level < req.characterLevel) {
            return false;
        }

        // Check quests (if any)
        if (req.quests && req.quests.length > 0) {
            for (let questId of req.quests) {
                if (!playerState.completedQuests.includes(questId)) {
                    return false;
                }
            }
        }

        // Check tool requirement
        if (req.tools && req.tools.length > 0) {
            const hasRequiredTool = this.hasRequiredTool(req.tools, req.toolTier, playerState);
            if (!hasRequiredTool) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if player has required tool
     */
    hasRequiredTool(requiredTools, minTier, playerState) {
        if (!requiredTools || requiredTools.length === 0) return true;

        // Check all equipment slots for a matching tool
        for (const slot in playerState.equipment) {
            const equippedItemId = playerState.equipment[slot];
            if (!equippedItemId) continue;

            // Parse instance ID to get base item ID
            let lookupId = equippedItemId;
            if (equippedItemId.includes('_instance_')) {
                lookupId = equippedItemId.split('_instance_')[0];
            } else if (equippedItemId.includes('_')) {
                const parts = equippedItemId.split('_');
                if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
                    lookupId = parts.slice(0, -2).join('_');
                }
            }

            // Get tool definition
            const toolDef = ItemRegistry?.getItem(lookupId) || window.GameEngine?.definitions?.items?.[lookupId];
            if (!toolDef) continue;

            // Check if tool type matches
            const toolType = toolDef.toolType || toolDef.category;
            if (!requiredTools.includes(toolType)) continue;

            // Check tier
            const toolTier = toolDef.toolTier || toolDef.tier || 1;
            if (toolTier < minTier) continue;

            return true;
        }

        return false;
    },

    // === STATISTICS ===
    /**
     * Get registry statistics
     */
    getStatistics() {
        const prodNodes = Object.values(this.production);
        const devNodes = Object.values(this.dev);
        const testNodes = Object.values(this.test);
        const legacyNodes = Object.values(this.legacy);
        const plannedNodes = Object.values(this.planned);
        const activeNodes = Object.values(this.getAllActive());

        return {
            production: {
                count: prodNodes.length,
                bySkill: this.groupBySkill(prodNodes)
            },
            dev: {
                count: devNodes.length,
                bySkill: this.groupBySkill(devNodes)
            },
            test: {
                count: testNodes.length,
                bySkill: this.groupBySkill(testNodes)
            },
            legacy: {
                count: legacyNodes.length,
                bySkill: this.groupBySkill(legacyNodes)
            },
            planned: {
                count: plannedNodes.length,
                bySkill: this.groupBySkill(plannedNodes)
            },
            totalActive: activeNodes.length,
            activeBySkill: this.groupBySkill(activeNodes)
        };
    },

    /**
     * Group nodes by skill type
     */
    groupBySkill(nodes) {
        const grouped = {};
        for (let node of nodes) {
            if (!grouped[node.nodeType]) {
                grouped[node.nodeType] = 0;
            }
            grouped[node.nodeType]++;
        }
        return grouped;
    },

    /**
     * Print summary to console
     */
    printSummary() {
        const stats = this.getStatistics();

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║         NODE REGISTRY SUMMARY          ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log(`📦 Production: ${stats.production.count} nodes`);
        this.printSkillBreakdown(stats.production.bySkill);

        console.log(`\n🔧 Dev: ${stats.dev.count} nodes`);
        this.printSkillBreakdown(stats.dev.bySkill);

        console.log(`\n🧪 Test: ${stats.test.count} nodes`);
        this.printSkillBreakdown(stats.test.bySkill);

        console.log(`\n📜 Legacy: ${stats.legacy.count} nodes`);
        this.printSkillBreakdown(stats.legacy.bySkill);

        console.log(`\n🔮 Planned: ${stats.planned.count} nodes`);
        this.printSkillBreakdown(stats.planned.bySkill);

        console.log(`\n✅ Total Active: ${stats.totalActive} nodes`);
        this.printSkillBreakdown(stats.activeBySkill);

        console.log('\n');
    },

    /**
     * Print skill breakdown
     */
    printSkillBreakdown(bySkill) {
        for (let skill in bySkill) {
            console.log(`   ${skill}: ${bySkill[skill]}`);
        }
    },

    // === CONFIGURATION ===
    /**
     * Enable dev mode (include dev nodes)
     */
    enableDevMode() {
        this.config.includeDevNodes = true;
        console.log('✅ Dev mode enabled');
    },

    /**
     * Disable dev mode
     */
    disableDevMode() {
        this.config.includeDevNodes = false;
        console.log('❌ Dev mode disabled');
    },

    /**
     * Enable test mode
     */
    enableTestMode() {
        this.config.includeTestNodes = true;
        console.log('✅ Test mode enabled');
    },

    /**
     * Disable test mode
     */
    disableTestMode() {
        this.config.includeTestNodes = false;
        console.log('❌ Test mode disabled');
    },

    /**
     * Enable preview mode (show planned nodes)
     */
    enablePreviewMode() {
        this.config.includePlannedNodes = true;
        console.log('✅ Preview mode enabled');
    },

    /**
     * Disable preview mode
     */
    disablePreviewMode() {
        this.config.includePlannedNodes = false;
        console.log('❌ Preview mode disabled');
    }
};
