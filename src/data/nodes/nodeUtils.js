/**
 * NODE UTILITIES
 *
 * Helper functions for node calculations, validation, and operations
 */

const NodeUtils = {
    /**
     * Calculate effective harvest time based on skill level and bonuses
     */
    calculateHarvestTime(node, playerSkillLevel) {
        const baseTime = node.harvestTime;
        const levelDiff = Math.max(0, playerSkillLevel - node.requiredSkillLevel);
        const speedBonus = levelDiff * node.speedBonusPerLevel;

        // Speed bonus reduces time (max 50% reduction)
        const timeReduction = Math.min(0.5, speedBonus);
        const effectiveTime = baseTime * (1 - timeReduction);

        return Math.max(0.5, effectiveTime); // Minimum 0.5 seconds
    },

    /**
     * Calculate resource yield based on skill level
     */
    calculateYield(resourceEntry, playerSkillLevel, requiredSkillLevel) {
        const baseYield = Math.floor(
            Math.random() * (resourceEntry.maxYield - resourceEntry.minYield + 1)
        ) + resourceEntry.minYield;

        // Apply skill scaling if enabled
        if (!resourceEntry.skillScaling) {
            return baseYield;
        }

        const levelDiff = Math.max(0, playerSkillLevel - requiredSkillLevel);
        const yieldBonus = levelDiff * 0.05; // 5% per level above requirement

        const scaledYield = Math.floor(baseYield * (1 + yieldBonus));
        return Math.max(baseYield, scaledYield);
    },

    /**
     * Calculate rare drop chance based on skill level
     */
    calculateRareChance(node, playerSkillLevel) {
        const baseChance = node.rareDropChance;
        const levelDiff = Math.max(0, playerSkillLevel - node.requiredSkillLevel);
        const rareBonus = levelDiff * node.rareBonusPerLevel;

        return Math.min(100, baseChance + (rareBonus * 100)); // Cap at 100%
    },

    /**
     * Calculate XP reward based on scaling type
     */
    calculateXP(node, harvestCount = 0) {
        const baseXP = node.baseXP * node.xpMultiplier;

        switch (node.xpScaling) {
            case 'linear':
                return baseXP;

            case 'exponential':
                // XP increases per harvest (for rare nodes)
                const expBonus = 1 + (harvestCount * 0.1);
                return Math.floor(baseXP * expBonus);

            case 'diminishing':
                // XP decreases per harvest (prevents farming)
                const dimFactor = Math.max(0.5, 1 - (harvestCount * 0.05));
                return Math.floor(baseXP * dimFactor);

            default:
                return baseXP;
        }
    },

    /**
     * Select a resource from weighted table
     */
    selectResource(resourceTable) {
        const totalWeight = resourceTable.reduce((sum, entry) => sum + entry.weight, 0);
        let random = Math.random() * totalWeight;

        for (let entry of resourceTable) {
            random -= entry.weight;
            if (random <= 0) {
                return entry;
            }
        }

        // Fallback to first entry
        return resourceTable[0];
    },

    /**
     * Process a harvest action and return rewards
     */
    processHarvest(node, playerState) {
        const skillLevel = playerState.skills[node.nodeType].level;
        const rewards = {
            items: [],
            xp: 0,
            rareDrops: []
        };

        // Select and calculate normal resource
        const selectedResource = this.selectResource(node.resourceTable);
        const yield = this.calculateYield(selectedResource, skillLevel, node.requiredSkillLevel);

        rewards.items.push({
            itemId: selectedResource.itemId,
            quantity: yield
        });

        // Check for rare drop
        const rareChance = this.calculateRareChance(node, skillLevel);
        if (Math.random() * 100 < rareChance) {
            // Use node's rare drop table or skill's universal table
            const rareTable = node.rareDropTable || UniversalRareTables.getTableForSkill(node.nodeType);

            if (rareTable && rareTable.length > 0) {
                const rareResource = this.selectResource(rareTable);
                const rareYield = this.calculateYield(rareResource, skillLevel, node.requiredSkillLevel);

                rewards.rareDrops.push({
                    itemId: rareResource.itemId,
                    quantity: rareYield
                });
            }
        }

        // Calculate XP (track harvest count in node state)
        const harvestCount = playerState.nodeHarvestCounts?.[node.id] || 0;
        rewards.xp = this.calculateXP(node, harvestCount);

        return rewards;
    },

    /**
     * Get node current health (respects min/max from exploration)
     */
    getNodeHealth(node, nodeState) {
        if (!nodeState) {
            return node.baseHealth;
        }

        return nodeState.currentMaxHealth || node.baseHealth;
    },

    /**
     * Check if node can be upgraded during exploration
     */
    canUpgradeNode(node, nodeState) {
        if (!nodeState) return false;

        const currentMax = nodeState.currentMaxHealth || node.baseHealth;

        // Can't upgrade beyond absolute max
        if (currentMax >= node.maxHealth) return false;

        // Check upgrade chance
        return Math.random() * 100 < node.upgradeChance;
    },

    /**
     * Upgrade node health
     */
    upgradeNodeHealth(node, nodeState) {
        if (!nodeState) return node.baseHealth;

        const currentMax = nodeState.currentMaxHealth || node.baseHealth;
        const newMax = Math.min(node.maxHealth, currentMax + node.upgradeAmount);

        return newMax;
    },

    /**
     * Check if node can degrade during exploration
     */
    canDegradeNode(node, nodeState) {
        if (!nodeState) return false;

        const currentMax = nodeState.currentMaxHealth || node.baseHealth;

        // Can't degrade below absolute min
        if (currentMax <= node.minHealth) return false;

        // Random degradation chance (opposite of upgrade)
        return Math.random() * 100 < (100 - node.upgradeChance);
    },

    /**
     * Degrade node health
     */
    degradeNodeHealth(node, nodeState) {
        if (!nodeState) return node.baseHealth;

        const currentMax = nodeState.currentMaxHealth || node.baseHealth;
        const newMax = Math.max(node.minHealth, currentMax - 1);

        return newMax;
    },

    /**
     * Check if player meets node requirements
     */
    meetsRequirements(node, playerState) {
        return NodeRegistry.meetsRequirements(node, playerState);
    },

    /**
     * Get all nodes available to player
     */
    getAvailableNodes(playerState) {
        return NodeRegistry.getUnlockedNodes(playerState);
    },

    /**
     * Get nodes by skill type available to player
     */
    getAvailableNodesBySkill(skillType, playerState) {
        const allAvailable = this.getAvailableNodes(playerState);
        return allAvailable.filter(node => node.nodeType === skillType);
    },

    /**
     * Get recommended nodes for player's level
     */
    getRecommendedNodes(playerState) {
        const charLevel = playerState.characterLevel.level;
        const allNodes = Object.values(NodeRegistry.getAllActive());

        return allNodes.filter(node => {
            // Within ±5 levels of recommended
            const levelDiff = Math.abs(node.recommendedLevel - charLevel);
            if (levelDiff > 5) return false;

            // Must meet requirements
            return this.meetsRequirements(node, playerState);
        });
    },

    /**
     * Validate node definition
     */
    validateNode(node) {
        const errors = [];
        const warnings = [];

        // Check required fields
        for (let field of REQUIRED_NODE_FIELDS) {
            if (node[field] === undefined || node[field] === null) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Validate node type
        if (!VALID_NODE_TYPES.includes(node.nodeType)) {
            errors.push(`Invalid nodeType: ${node.nodeType}`);
        }

        // Validate rarity
        if (!VALID_RARITIES.includes(node.rarity)) {
            warnings.push(`Invalid rarity: ${node.rarity}`);
        }

        // Validate XP scaling
        if (!VALID_XP_SCALING.includes(node.xpScaling)) {
            warnings.push(`Invalid xpScaling: ${node.xpScaling}`);
        }

        // Validate health values
        if (node.minHealth > node.baseHealth) {
            warnings.push(`minHealth (${node.minHealth}) greater than baseHealth (${node.baseHealth})`);
        }

        if (node.maxHealth < node.baseHealth) {
            warnings.push(`maxHealth (${node.maxHealth}) less than baseHealth (${node.baseHealth})`);
        }

        // Validate resource table
        if (!Array.isArray(node.resourceTable) || node.resourceTable.length === 0) {
            errors.push('resourceTable must be a non-empty array');
        } else {
            for (let i = 0; i < node.resourceTable.length; i++) {
                const resource = node.resourceTable[i];
                if (!resource.itemId) {
                    errors.push(`resourceTable[${i}] missing itemId`);
                }
                if (resource.minYield > resource.maxYield) {
                    warnings.push(`resourceTable[${i}]: minYield > maxYield`);
                }
            }
        }

        // Validate requirements
        if (!node.requirements || !node.requirements.skill) {
            errors.push('Missing requirements.skill');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Validate all nodes in registry
     */
    validateAllNodes() {
        const allNodes = { ...NodeRegistry.production, ...NodeRegistry.dev };
        const results = {
            total: 0,
            valid: 0,
            invalid: 0,
            warnings: 0,
            details: {}
        };

        for (let nodeId in allNodes) {
            const node = allNodes[nodeId];
            const validation = this.validateNode(node);

            results.total++;
            if (validation.isValid) {
                results.valid++;
            } else {
                results.invalid++;
            }

            if (validation.warnings.length > 0) {
                results.warnings++;
            }

            results.details[nodeId] = validation;
        }

        return results;
    },

    /**
     * Print validation report
     */
    printValidationReport() {
        const results = this.validateAllNodes();

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       NODE VALIDATION REPORT           ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log(`Total Nodes: ${results.total}`);
        console.log(`✅ Valid: ${results.valid}`);
        console.log(`❌ Invalid: ${results.invalid}`);
        console.log(`⚠️  Warnings: ${results.warnings}\n`);

        // Show invalid nodes
        if (results.invalid > 0) {
            console.log('❌ INVALID NODES:');
            for (let nodeId in results.details) {
                const detail = results.details[nodeId];
                if (!detail.isValid) {
                    console.log(`\n  ${nodeId}:`);
                    detail.errors.forEach(err => console.log(`    - ${err}`));
                }
            }
        }

        // Show warnings
        if (results.warnings > 0) {
            console.log('\n⚠️  WARNINGS:');
            for (let nodeId in results.details) {
                const detail = results.details[nodeId];
                if (detail.warnings.length > 0) {
                    console.log(`\n  ${nodeId}:`);
                    detail.warnings.forEach(warn => console.log(`    - ${warn}`));
                }
            }
        }

        console.log('\n');
    }
};
