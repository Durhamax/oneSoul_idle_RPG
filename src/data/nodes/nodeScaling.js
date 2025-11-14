/**
 * NODE SCALING UTILITIES
 *
 * Tools for generating nodes at any tier with balanced stats
 * Supports unlimited tier scaling without hardcoded values
 */

const NodeScaling = {
    /**
     * Generate node stats for any tier using formulas
     */
    calculateTierStats(tier) {
        return {
            requiredSkillLevel: this.calculateSkillRequirement(tier),
            recommendedLevel: this.calculateRecommendedLevel(tier),
            baseHealth: this.calculateBaseHealth(tier),
            minHealth: this.calculateMinHealth(tier),
            maxHealth: this.calculateMaxHealth(tier),
            harvestTime: this.calculateHarvestTime(tier),
            respawnTime: this.calculateRespawnTime(tier),
            baseXP: this.calculateBaseXP(tier),
            rareDropChance: this.calculateRareDropChance(tier)
        };
    },

    /**
     * Skill requirement scales by tier
     * Tier 1 = Level 1, Tier 2 = Level 10-15, Tier 3 = Level 25-35, etc.
     */
    calculateSkillRequirement(tier) {
        if (tier === 1) return 1;
        return Math.floor(5 + (tier - 1) * 10);
    },

    /**
     * Recommended character level (slightly lower than skill req)
     */
    calculateRecommendedLevel(tier) {
        const skillReq = this.calculateSkillRequirement(tier);
        return Math.max(1, Math.floor(skillReq * 0.8));
    },

    /**
     * Base health scales with tier (more harvests at higher tiers)
     */
    calculateBaseHealth(tier) {
        return Math.floor(8 + (tier * 2)); // Tier 1 = 10, Tier 5 = 18, Tier 10 = 28
    },

    /**
     * Min health (80% of base)
     */
    calculateMinHealth(tier) {
        return Math.max(5, Math.floor(this.calculateBaseHealth(tier) * 0.8));
    },

    /**
     * Max health (150% of base)
     */
    calculateMaxHealth(tier) {
        return Math.floor(this.calculateBaseHealth(tier) * 1.5);
    },

    /**
     * Harvest time increases slightly with tier
     */
    calculateHarvestTime(tier) {
        return Math.min(10, 2 + (tier * 0.3)); // Tier 1 = 2.3s, Tier 10 = 5s, caps at 10s
    },

    /**
     * Respawn time scales with tier
     */
    calculateRespawnTime(tier) {
        return Math.min(300, 20 + (tier * 10)); // Tier 1 = 30s, Tier 10 = 120s, caps at 5min
    },

    /**
     * Base XP scales exponentially
     */
    calculateBaseXP(tier) {
        return Math.floor(20 * tier * Math.pow(1.15, tier)); // Exponential growth
    },

    /**
     * Rare drop chance increases with tier
     */
    calculateRareDropChance(tier) {
        return Math.min(30, 5 + (tier * 2)); // Tier 1 = 7%, Tier 10 = 25%, caps at 30%
    },

    /**
     * Generate yield range based on tier
     */
    calculateYieldRange(tier) {
        return {
            minYield: Math.max(1, tier),
            maxYield: Math.max(2, tier * 2 + 1)
        };
    },

    /**
     * Generate a complete node at any tier
     */
    generateNode(config) {
        const {
            id,
            name,
            description,
            icon,
            nodeType,
            category,
            tier,
            primaryResource,
            secondaryResources = [],
            biomes = ['plains'],
            progressionPath = 'default',
            nextTier = null,
            previousTier = null
        } = config;

        const stats = this.calculateTierStats(tier);
        const yieldRange = this.calculateYieldRange(tier);

        // Build resource table
        const resourceTable = [
            {
                itemId: primaryResource,
                weight: 70,
                minYield: yieldRange.minYield,
                maxYield: yieldRange.maxYield,
                skillScaling: true
            }
        ];

        // Add secondary resources with lower weights
        secondaryResources.forEach((resource, index) => {
            resourceTable.push({
                itemId: resource,
                weight: Math.max(5, 30 - (index * 10)),
                minYield: 1,
                maxYield: Math.max(2, Math.floor(yieldRange.maxYield * 0.5)),
                skillScaling: false
            });
        });

        // Determine rarity
        let rarity = 'common';
        if (tier >= 8) rarity = 'legendary';
        else if (tier >= 6) rarity = 'epic';
        else if (tier >= 4) rarity = 'rare';
        else if (tier >= 2) rarity = 'uncommon';

        // Color based on rarity
        const rarityColors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800'
        };

        return {
            id,
            name,
            description,
            icon,

            nodeType,
            category,

            tier,
            requiredSkillLevel: stats.requiredSkillLevel,
            recommendedLevel: stats.recommendedLevel,

            baseHealth: stats.baseHealth,
            minHealth: stats.minHealth,
            maxHealth: stats.maxHealth,
            harvestTime: stats.harvestTime,
            respawnTime: stats.respawnTime,

            resourceTable,
            rareDropTable: null, // Use universal tables
            rareDropChance: stats.rareDropChance,

            yieldBonusPerLevel: 0.05,
            rareBonusPerLevel: 0.02,
            speedBonusPerLevel: 0.02,

            baseXP: stats.baseXP,
            xpScaling: 'linear',
            xpMultiplier: 1.0 + (tier * 0.1), // 10% bonus per tier

            rarity,
            color: rarityColors[rarity],
            harvestSound: nodeType,
            particleEffect: `${nodeType}_effect`,

            biomes,
            spawnWeight: Math.max(20, 100 - (tier * 10)), // Rarer at higher tiers
            spawnConditions: null,

            discoveryWeight: Math.max(10, 50 - (tier * 5)),
            upgradeChance: Math.max(15, 30 - tier),
            upgradeAmount: Math.max(1, Math.floor(tier * 0.5)),

            requirements: {
                skill: nodeType,
                skillLevel: stats.requiredSkillLevel,
                characterLevel: stats.recommendedLevel,
                quests: [],
                tools: this.getRequiredTools(nodeType),
                toolTier: Math.max(1, Math.floor(tier / 2))
            },

            isRenewable: true,
            isExhaustible: false,
            exhaustionThreshold: null,
            multiHarvest: false,
            instancedLoot: true,
            weatherDependent: tier >= 5, // High tier nodes may need good weather
            timeDependent: tier >= 7, // Very high tier may be time-restricted
            seasonalAvailability: tier >= 9 ? this.getSeasonalAvailability(tier) : null,

            progressionPath,
            nextTier,
            previousTier,
            unlockMessage: `You've discovered a ${name}!`,

            status: 'production',
            implemented: true,
            version: '1.0',
            developmentNotes: `Auto-generated tier ${tier} node`,
            customData: {
                autoGenerated: true,
                generatedAt: new Date().toISOString()
            }
        };
    },

    /**
     * Get required tools for skill type
     */
    getRequiredTools(nodeType) {
        const toolMap = {
            mining: ['pickaxe'],
            logging: ['axe'],
            fishing: ['fishing_rod'],
            hunting: ['bow', 'crossbow'],
            foraging: [],
            thieving: []
        };
        return toolMap[nodeType] || [];
    },

    /**
     * Get seasonal availability for very high tier nodes
     */
    getSeasonalAvailability(tier) {
        if (tier < 9) return null;

        const seasons = [
            ['spring'],
            ['summer'],
            ['fall'],
            ['winter'],
            ['spring', 'summer'],
            ['fall', 'winter']
        ];

        return seasons[tier % seasons.length];
    },

    /**
     * Generate a progression series of nodes
     */
    generateProgressionSeries(config) {
        const {
            baseName,
            nodeType,
            category,
            icon,
            primaryResource,
            secondaryResources,
            biomes,
            startTier,
            endTier,
            pathName
        } = config;

        const series = [];

        for (let tier = startTier; tier <= endTier; tier++) {
            const node = this.generateNode({
                id: `${baseName.toLowerCase().replace(/\s+/g, '_')}_t${tier}`,
                name: `${baseName} (Tier ${tier})`,
                description: `A tier ${tier} ${baseName.toLowerCase()} with enhanced rewards`,
                icon,
                nodeType,
                category,
                tier,
                primaryResource: `${primaryResource}_t${tier}`,
                secondaryResources,
                biomes,
                progressionPath: pathName,
                nextTier: tier < endTier ? `${baseName.toLowerCase().replace(/\s+/g, '_')}_t${tier + 1}` : null,
                previousTier: tier > startTier ? `${baseName.toLowerCase().replace(/\s+/g, '_')}_t${tier - 1}` : null
            });

            series.push(node);
        }

        return series;
    },

    /**
     * Calculate appropriate biomes for tier
     */
    getBiomesForTier(tier, nodeType) {
        // Low tier: common biomes
        if (tier <= 2) {
            return ['plains', 'forest', 'hills'];
        }

        // Mid tier: more specific biomes
        if (tier <= 5) {
            const biomeMap = {
                mining: ['mountains', 'underground', 'hills'],
                logging: ['forest', 'swamp'],
                fishing: ['river', 'coast'],
                hunting: ['forest', 'mountains', 'tundra'],
                foraging: ['forest', 'swamp', 'plains'],
                thieving: ['plains', 'coast']
            };
            return biomeMap[nodeType] || ['plains'];
        }

        // High tier: rare biomes only
        const rareBiomes = {
            mining: ['underground', 'mountains'],
            logging: ['forest'],
            fishing: ['ocean'],
            hunting: ['tundra', 'mountains'],
            foraging: ['swamp', 'forest'],
            thieving: ['coast']
        };
        return rareBiomes[nodeType] || ['mountains'];
    },

    /**
     * Validate generated node
     */
    validateGeneratedNode(node) {
        return NodeValidator.validate(node);
    }
};
