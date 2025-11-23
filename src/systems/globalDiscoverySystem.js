/**
 * GLOBAL DISCOVERY SYSTEM
 *
 * Manages globally accessible discovered content (nodes and enemies).
 * Implements the new refactored navigation mechanics where:
 * - Discovered nodes/enemies become globally accessible (not region-locked)
 * - Node health increases by +10 per region discovered (stacking across regions)
 * - Simplifies navigation and eliminates region barriers
 */

const GlobalDiscoverySystem = {
    /**
     * Initialize global discovery system on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach functions to engine
        engine.discoverNodeGlobally = this.discoverNodeGlobally.bind(engine);
        engine.discoverEnemyGlobally = this.discoverEnemyGlobally.bind(engine);
        engine.getGlobalNodeHealth = this.getGlobalNodeHealth.bind(engine);
        engine.getGlobalEnemyHealth = this.getGlobalEnemyHealth.bind(engine);
        engine.getAvailableGlobalNodes = this.getAvailableGlobalNodes.bind(engine);
        engine.getAvailableGlobalEnemies = this.getAvailableGlobalEnemies.bind(engine);
        engine.getRegionContributionCount = this.getRegionContributionCount.bind(engine);
    },

    /**
     * Discover a node globally, adding region contribution
     * @param {string} nodeId - Resource node ID
     * @param {string} regionId - Region where discovered
     */
    discoverNodeGlobally(nodeId, regionId) {
        // Get node from NodeRegistry only
        if (typeof NodeRegistry === 'undefined') {
            console.error(`❌ NodeRegistry not available`);
            return;
        }

        const nodeDef = NodeRegistry.getAllActive()[nodeId];
        if (!nodeDef) {
            console.error(`❌ Node ${nodeId} not found in NodeRegistry`);
            return;
        }

        // Initialize global nodes state if doesn't exist
        if (!this.state.globalNodes) {
            this.state.globalNodes = {};
        }

        // Initialize this node if first discovery
        if (!this.state.globalNodes[nodeId]) {
            this.state.globalNodes[nodeId] = {
                discovered: true,
                regionContributions: {},
                totalHealthBonus: 0,
                firstDiscoveredAt: Date.now(),
                firstDiscoveredIn: regionId
            };
        }

        const globalNode = this.state.globalNodes[nodeId];

        // Check if this region already contributed
        if (globalNode.regionContributions[regionId]) {
            console.log(`ℹ️ ${nodeDef.name} already discovered in ${regionId} (no additional health)`);
            return { alreadyDiscovered: true, node: globalNode };
        }

        // Add region contribution (+10 health per region)
        const HEALTH_PER_REGION = 10;
        globalNode.regionContributions[regionId] = HEALTH_PER_REGION;
        globalNode.totalHealthBonus += HEALTH_PER_REGION;
        globalNode.discovered = true;

        const regionCount = Object.keys(globalNode.regionContributions).length;

        console.log(`🌟 Discovered ${nodeDef.name} in ${regionId}! (+${HEALTH_PER_REGION} health, total regions: ${regionCount}, total bonus: ${globalNode.totalHealthBonus})`);

        // Initialize node health for mining system if this is a mining node
        if (nodeDef.nodeType === 'mining' && this.initializeNodeHealth) {
            this.initializeNodeHealth(nodeId);
        }

        return {
            newDiscovery: true,
            node: globalNode,
            healthBonus: HEALTH_PER_REGION,
            totalRegions: regionCount
        };
    },

    /**
     * Discover an enemy globally, adding region contribution
     * @param {string} enemyId - Enemy ID
     * @param {string} regionId - Region where discovered
     */
    discoverEnemyGlobally(enemyId, regionId) {
        const enemyDef = this.definitions.enemies?.[enemyId];
        if (!enemyDef) {
            console.error(`❌ Enemy ${enemyId} not found in definitions`);
            return;
        }

        // Initialize global enemies state if doesn't exist
        if (!this.state.globalEnemies) {
            this.state.globalEnemies = {};
        }

        // Initialize this enemy if first discovery
        if (!this.state.globalEnemies[enemyId]) {
            this.state.globalEnemies[enemyId] = {
                discovered: true,
                regionContributions: {},
                totalHealthBonus: 0,
                firstDiscoveredAt: Date.now(),
                firstDiscoveredIn: regionId
            };
        }

        const globalEnemy = this.state.globalEnemies[enemyId];

        // Check if this region already contributed
        if (globalEnemy.regionContributions[regionId]) {
            console.log(`ℹ️ ${enemyDef.name} already discovered in ${regionId} (no additional health)`);
            return { alreadyDiscovered: true, enemy: globalEnemy };
        }

        // Add region contribution (+10 health per region)
        const HEALTH_PER_REGION = 10;
        globalEnemy.regionContributions[regionId] = HEALTH_PER_REGION;
        globalEnemy.totalHealthBonus += HEALTH_PER_REGION;
        globalEnemy.discovered = true;

        const regionCount = Object.keys(globalEnemy.regionContributions).length;

        console.log(`🌟 Discovered ${enemyDef.name} in ${regionId}! (+${HEALTH_PER_REGION} health, total regions: ${regionCount}, total bonus: ${globalEnemy.totalHealthBonus})`);

        return {
            newDiscovery: true,
            enemy: globalEnemy,
            healthBonus: HEALTH_PER_REGION,
            totalRegions: regionCount
        };
    },

    /**
     * Get total health (harvests/max HP) for a globally discovered node
     * @param {string} nodeId - Resource node ID
     * @returns {number} Total harvests available (base + bonus from all regions)
     */
    getGlobalNodeHealth(nodeId) {
        const nodeDef = this.definitions.resourceNodes?.[nodeId];
        if (!nodeDef) return 0;

        const globalNode = this.state.globalNodes?.[nodeId];
        if (!globalNode || !globalNode.discovered) {
            return 0; // Node not discovered yet
        }

        // Base harvests from node definition + total bonus from all regions
        const baseHarvests = nodeDef.harvestsPerDepletion || 10;
        const totalHarvests = baseHarvests + globalNode.totalHealthBonus;

        return totalHarvests;
    },

    /**
     * Get total health for a globally discovered enemy
     * @param {string} enemyId - Enemy ID
     * @returns {number} Total HP (base + bonus from all regions)
     */
    getGlobalEnemyHealth(enemyId) {
        const enemyDef = this.definitions.enemies?.[enemyId];
        if (!enemyDef) return 0;

        const globalEnemy = this.state.globalEnemies?.[enemyId];
        if (!globalEnemy || !globalEnemy.discovered) {
            return 0; // Enemy not discovered yet
        }

        // Base health from enemy definition + total bonus from all regions
        const baseHealth = enemyDef.health || 100;
        const totalHealth = baseHealth + globalEnemy.totalHealthBonus;

        return totalHealth;
    },

    /**
     * Get all globally available nodes for a specific skill
     * @param {string} skill - Skill name (mining, logging, fishing, etc.)
     * @returns {Array} Array of node objects with definitions and global state
     */
    getAvailableGlobalNodes(skill) {
        if (!this.state.globalNodes) {
            return [];
        }

        const availableNodes = [];

        for (let nodeId in this.state.globalNodes) {
            const globalNode = this.state.globalNodes[nodeId];
            if (!globalNode.discovered) continue;

            const nodeDef = this.definitions.resourceNodes?.[nodeId];
            if (!nodeDef) continue;

            // Filter by skill if specified
            if (skill && nodeDef.skill !== skill) continue;

            // Check if player meets skill level requirement
            const playerSkillLevel = this.state.skills[nodeDef.skill]?.level || 0;
            if (playerSkillLevel < nodeDef.skillLevel) continue;

            availableNodes.push({
                nodeId: nodeId,
                definition: nodeDef,
                globalState: globalNode,
                totalHarvests: this.getGlobalNodeHealth(nodeId),
                regionCount: Object.keys(globalNode.regionContributions).length
            });
        }

        // Sort by tier, then by skill level requirement
        availableNodes.sort((a, b) => {
            if (a.definition.tier !== b.definition.tier) {
                return a.definition.tier - b.definition.tier;
            }
            return a.definition.skillLevel - b.definition.skillLevel;
        });

        return availableNodes;
    },

    /**
     * Get all globally available enemies
     * @param {string} tier - Optional tier filter (1, 2, 3, etc.)
     * @returns {Array} Array of enemy objects with definitions and global state
     */
    getAvailableGlobalEnemies(tier = null) {
        if (!this.state.globalEnemies) {
            return [];
        }

        const availableEnemies = [];

        for (let enemyId in this.state.globalEnemies) {
            const globalEnemy = this.state.globalEnemies[enemyId];
            if (!globalEnemy.discovered) continue;

            const enemyDef = this.definitions.enemies?.[enemyId];
            if (!enemyDef) continue;

            // Filter by tier if specified
            if (tier !== null && enemyDef.tier !== tier) continue;

            availableEnemies.push({
                enemyId: enemyId,
                definition: enemyDef,
                globalState: globalEnemy,
                totalHealth: this.getGlobalEnemyHealth(enemyId),
                regionCount: Object.keys(globalEnemy.regionContributions).length
            });
        }

        // Sort by tier, then by level
        availableEnemies.sort((a, b) => {
            if (a.definition.tier !== b.definition.tier) {
                return a.definition.tier - b.definition.tier;
            }
            return a.definition.level - b.definition.level;
        });

        return availableEnemies;
    },

    /**
     * Get number of regions that have contributed to a node/enemy
     * @param {string} id - Node or enemy ID
     * @param {string} type - 'node' or 'enemy'
     * @returns {number} Number of regions that contributed
     */
    getRegionContributionCount(id, type = 'node') {
        const globalData = type === 'node'
            ? this.state.globalNodes?.[id]
            : this.state.globalEnemies?.[id];

        if (!globalData) return 0;

        return Object.keys(globalData.regionContributions || {}).length;
    }
};
