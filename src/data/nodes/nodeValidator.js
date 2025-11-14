/**
 * NODE VALIDATOR
 *
 * Comprehensive validation system for node definitions
 */

const NodeValidator = {
    REQUIRED_FIELDS: [
        'id', 'name', 'description', 'icon',
        'nodeType', 'category', 'tier', 'requiredSkillLevel', 'recommendedLevel',
        'baseHealth', 'minHealth', 'maxHealth', 'harvestTime', 'respawnTime',
        'resourceTable', 'rareDropChance',
        'yieldBonusPerLevel', 'rareBonusPerLevel', 'speedBonusPerLevel',
        'baseXP', 'xpScaling', 'xpMultiplier',
        'rarity', 'color',
        'biomes', 'spawnWeight',
        'discoveryWeight', 'upgradeChance', 'upgradeAmount',
        'requirements',
        'isRenewable', 'isExhaustible',
        'status', 'implemented', 'version'
    ],

    VALID_NODE_TYPES: ['mining', 'logging', 'fishing', 'hunting', 'foraging', 'thieving'],
    VALID_RARITIES: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    VALID_XP_SCALING: ['linear', 'exponential', 'diminishing'],
    VALID_STATUSES: ['production', 'dev', 'test', 'legacy', 'planned'],

    /**
     * Validate a single node definition
     */
    validate(node) {
        const errors = [];
        const warnings = [];

        // Check required fields
        for (const field of this.REQUIRED_FIELDS) {
            if (node[field] === undefined || node[field] === null) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Validate node type
        if (node.nodeType && !this.VALID_NODE_TYPES.includes(node.nodeType)) {
            errors.push(`Invalid nodeType: ${node.nodeType}. Must be one of: ${this.VALID_NODE_TYPES.join(', ')}`);
        }

        // Validate rarity
        if (node.rarity && !this.VALID_RARITIES.includes(node.rarity)) {
            warnings.push(`Invalid rarity: ${node.rarity}. Should be one of: ${this.VALID_RARITIES.join(', ')}`);
        }

        // Validate XP scaling
        if (node.xpScaling && !this.VALID_XP_SCALING.includes(node.xpScaling)) {
            warnings.push(`Invalid xpScaling: ${node.xpScaling}. Should be one of: ${this.VALID_XP_SCALING.join(', ')}`);
        }

        // Validate status
        if (node.status && !this.VALID_STATUSES.includes(node.status)) {
            warnings.push(`Invalid status: ${node.status}. Should be one of: ${this.VALID_STATUSES.join(', ')}`);
        }

        // Validate tier
        if (node.tier && node.tier < 1) {
            errors.push('Tier must be >= 1');
        }

        // Validate health values
        if (node.minHealth !== undefined && node.baseHealth !== undefined) {
            if (node.minHealth > node.baseHealth) {
                warnings.push(`minHealth (${node.minHealth}) > baseHealth (${node.baseHealth})`);
            }
        }

        if (node.maxHealth !== undefined && node.baseHealth !== undefined) {
            if (node.maxHealth < node.baseHealth) {
                warnings.push(`maxHealth (${node.maxHealth}) < baseHealth (${node.baseHealth})`);
            }
        }

        // Validate harvest time
        if (node.harvestTime !== undefined) {
            if (node.harvestTime < 0.5) {
                warnings.push(`harvestTime (${node.harvestTime}s) is very short - may feel too fast`);
            }
            if (node.harvestTime > 30) {
                warnings.push(`harvestTime (${node.harvestTime}s) is very long - may feel tedious`);
            }
        }

        // Validate respawn time
        if (node.respawnTime !== undefined) {
            if (node.respawnTime < 10) {
                warnings.push(`respawnTime (${node.respawnTime}s) is very short`);
            }
            if (node.respawnTime > 300) {
                warnings.push(`respawnTime (${node.respawnTime}s) is very long (>5 minutes)`);
            }
        }

        // Validate resource table
        if (node.resourceTable) {
            if (!Array.isArray(node.resourceTable)) {
                errors.push('resourceTable must be an array');
            } else if (node.resourceTable.length === 0) {
                errors.push('resourceTable cannot be empty');
            } else {
                // Validate each resource entry
                node.resourceTable.forEach((resource, index) => {
                    if (!resource.itemId) {
                        errors.push(`resourceTable[${index}]: missing itemId`);
                    }
                    if (resource.weight === undefined || resource.weight < 0) {
                        errors.push(`resourceTable[${index}]: invalid weight`);
                    }
                    if (resource.minYield === undefined || resource.minYield < 0) {
                        errors.push(`resourceTable[${index}]: invalid minYield`);
                    }
                    if (resource.maxYield === undefined || resource.maxYield < resource.minYield) {
                        errors.push(`resourceTable[${index}]: maxYield must be >= minYield`);
                    }
                    if (resource.skillScaling === undefined) {
                        warnings.push(`resourceTable[${index}]: skillScaling not specified (assuming false)`);
                    }
                });

                // Check total weight
                const totalWeight = node.resourceTable.reduce((sum, r) => sum + r.weight, 0);
                if (totalWeight === 0) {
                    errors.push('Total resource weight cannot be 0');
                }
            }
        }

        // Validate rare drop table (if provided)
        if (node.rareDropTable !== null && node.rareDropTable !== undefined) {
            if (!Array.isArray(node.rareDropTable)) {
                errors.push('rareDropTable must be an array or null');
            } else if (node.rareDropTable.length > 0) {
                node.rareDropTable.forEach((resource, index) => {
                    if (!resource.itemId) {
                        errors.push(`rareDropTable[${index}]: missing itemId`);
                    }
                    if (resource.weight === undefined || resource.weight < 0) {
                        errors.push(`rareDropTable[${index}]: invalid weight`);
                    }
                    if (resource.minYield === undefined || resource.minYield < 0) {
                        errors.push(`rareDropTable[${index}]: invalid minYield`);
                    }
                    if (resource.maxYield === undefined || resource.maxYield < resource.minYield) {
                        errors.push(`rareDropTable[${index}]: maxYield must be >= minYield`);
                    }
                });
            }
        }

        // Validate rare drop chance
        if (node.rareDropChance !== undefined) {
            if (node.rareDropChance < 0 || node.rareDropChance > 100) {
                warnings.push('rareDropChance should be between 0 and 100');
            }
        }

        // Validate bonus rates
        if (node.yieldBonusPerLevel !== undefined && (node.yieldBonusPerLevel < 0 || node.yieldBonusPerLevel > 1)) {
            warnings.push('yieldBonusPerLevel should be between 0 and 1 (e.g., 0.05 = 5%)');
        }
        if (node.rareBonusPerLevel !== undefined && (node.rareBonusPerLevel < 0 || node.rareBonusPerLevel > 1)) {
            warnings.push('rareBonusPerLevel should be between 0 and 1 (e.g., 0.02 = 2%)');
        }
        if (node.speedBonusPerLevel !== undefined && (node.speedBonusPerLevel < 0 || node.speedBonusPerLevel > 1)) {
            warnings.push('speedBonusPerLevel should be between 0 and 1 (e.g., 0.02 = 2%)');
        }

        // Validate XP values
        if (node.baseXP !== undefined && node.baseXP < 1) {
            warnings.push('baseXP is very low (<1)');
        }
        if (node.xpMultiplier !== undefined && node.xpMultiplier <= 0) {
            errors.push('xpMultiplier must be > 0');
        }

        // Validate biomes
        if (node.biomes) {
            if (!Array.isArray(node.biomes)) {
                errors.push('biomes must be an array');
            } else if (node.biomes.length === 0) {
                warnings.push('No biomes specified - node will not spawn naturally');
            }
        }

        // Validate requirements
        if (node.requirements) {
            if (!node.requirements.skill) {
                errors.push('requirements.skill is required');
            }
            if (node.requirements.skillLevel === undefined) {
                errors.push('requirements.skillLevel is required');
            }
            if (node.requirements.characterLevel === undefined) {
                warnings.push('requirements.characterLevel not specified (assuming 0)');
            }
            if (node.requirements.tools && !Array.isArray(node.requirements.tools)) {
                errors.push('requirements.tools must be an array');
            }
        }

        // Validate exhaustible settings
        if (node.isExhaustible && !node.exhaustionThreshold) {
            warnings.push('Node is exhaustible but exhaustionThreshold is not set');
        }

        // Check for common mistakes
        if (!node.progressionPath) {
            warnings.push('No progressionPath defined - may be hard to organize in progression trees');
        }

        if (node.baseHealth < 3) {
            warnings.push('baseHealth < 3 - node may feel unsatisfying (too few harvests)');
        }

        if (node.upgradeAmount > node.maxHealth - node.baseHealth) {
            warnings.push('upgradeAmount exceeds available upgrade range');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Validate all nodes in the registry
     */
    validateRegistry(registry = NodeRegistry) {
        const report = {
            total: 0,
            valid: 0,
            invalid: 0,
            withWarnings: 0,
            errors: [],
            warnings: [],
            byStatus: {},
            bySkill: {}
        };

        const allNodes = {
            production: registry.production,
            dev: registry.dev,
            test: registry.test,
            legacy: registry.legacy,
            planned: registry.planned
        };

        for (const [status, nodes] of Object.entries(allNodes)) {
            if (!report.byStatus[status]) {
                report.byStatus[status] = { total: 0, valid: 0, invalid: 0 };
            }

            for (const [id, node] of Object.entries(nodes)) {
                report.total++;
                report.byStatus[status].total++;

                const result = this.validate(node);

                if (result.valid) {
                    report.valid++;
                    report.byStatus[status].valid++;
                } else {
                    report.invalid++;
                    report.byStatus[status].invalid++;
                    report.errors.push({
                        status,
                        id,
                        errors: result.errors
                    });
                }

                if (result.warnings.length > 0) {
                    report.withWarnings++;
                    report.warnings.push({
                        status,
                        id,
                        warnings: result.warnings
                    });
                }

                // Track by skill
                if (node.nodeType) {
                    if (!report.bySkill[node.nodeType]) {
                        report.bySkill[node.nodeType] = { total: 0, valid: 0 };
                    }
                    report.bySkill[node.nodeType].total++;
                    if (result.valid) {
                        report.bySkill[node.nodeType].valid++;
                    }
                }
            }
        }

        return report;
    },

    /**
     * Print validation report to console
     */
    printReport(report) {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   COMPREHENSIVE NODE VALIDATION        ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log(`Total Nodes: ${report.total}`);
        console.log(`✅ Valid: ${report.valid}`);
        console.log(`❌ Invalid: ${report.invalid}`);
        console.log(`⚠️  With Warnings: ${report.withWarnings}\n`);

        // Show by status
        console.log('By Status:');
        for (const [status, counts] of Object.entries(report.byStatus)) {
            console.log(`  ${status}: ${counts.valid}/${counts.total} valid`);
        }

        // Show by skill
        console.log('\nBy Skill:');
        for (const [skill, counts] of Object.entries(report.bySkill)) {
            console.log(`  ${skill}: ${counts.valid}/${counts.total} valid`);
        }

        // Show invalid nodes
        if (report.errors.length > 0) {
            console.log('\n❌ INVALID NODES:');
            report.errors.forEach(({ status, id, errors }) => {
                console.log(`\n  [${status}] ${id}:`);
                errors.forEach(err => console.log(`    - ${err}`));
            });
        }

        // Show warnings
        if (report.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            report.warnings.forEach(({ status, id, warnings }) => {
                console.log(`\n  [${status}] ${id}:`);
                warnings.forEach(warn => console.log(`    - ${warn}`));
            });
        }

        console.log('\n');

        return report;
    },

    /**
     * Quick validation - just check if all nodes are valid
     */
    quickValidate() {
        const report = this.validateRegistry();
        return report.invalid === 0;
    }
};
