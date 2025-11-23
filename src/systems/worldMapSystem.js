/**
 * WORLD MAP SYSTEM
 *
 * Handles procedural generation of the hex-based world map.
 * Integrates with WorldTilemap for landmass shape.
 * Generates regions with biomes, navigation requirements, and connections.
 *
 * Responsibilities:
 * - Generate world map from tilemap
 * - Assign biomes based on position
 * - Calculate navigation requirements
 * - Determine region complexity/complication
 * - Link adjacent regions
 * - Assign discoverable nodes and enemies
 */

const WorldMapSystem = {
    // Reference to game engine (set during init)
    gameEngine: null,

    /**
     * Initialize the world map system
     */
    init(gameEngine) {
        this.gameEngine = gameEngine;
        console.log('🗺️ WorldMapSystem initialized');
    },

    /**
     * Generate complete world map from tilemap
     * Returns: { regionId: regionData, ... }
     */
    generateWorldMap(mapRadius = 10) {
        const worldMap = {};
        const biomeTypes = ['plains', 'forest', 'mountains', 'tundra', 'desert', 'swamp', 'coast'];
        const startQ = -3;
        const startR = -4;

        // Get tiles from the tilemap (landmass shape)
        const tiles = typeof WorldTilemap !== 'undefined' ? WorldTilemap.getTiles() : [];

        if (tiles.length === 0) {
            console.error("❌ WorldTilemap not loaded! Cannot generate regions.");
            return {};
        }

        console.log(`🗺️ Generating regions for ${tiles.length} tiles from tilemap...`);

        // Generate a region for each tile in the tilemap
        for (let tile of tiles) {
            const { q, r } = tile;
            const regionId = `region_${q}_${r}`;
            const biome = this.getBiome(q, r, mapRadius, biomeTypes);
            const distanceFromStart = Math.sqrt((q - startQ) ** 2 + (r - startR) ** 2);

            // Calculate navigation requirement
            const navRequirement = this.calculateNavigationRequirement(q, r, startQ, startR);

            // Get valid neighbors (only those that exist in the tilemap)
            const neighbors = this.getNeighbors(q, r);
            const validNeighbors = neighbors.filter(n => {
                return WorldTilemap.hasTile(n.q, n.r);
            });

            // Generate region metadata
            const isStartingRegion = (q === startQ && r === startR);
            const description = isStartingRegion
                ? "A massive crater, home to the Unity members long banished to this corner of the new planet. The Cradle is heavily wooded and features a large lake of trapped freshwater. This is where your journey begins."
                : `A ${biome} region in the ${q > 0 ? 'eastern' : q < 0 ? 'western' : 'central'} ${r > 0 ? 'south' : r < 0 ? 'north' : 'lands'}`;

            const regionName = this.getRegionName(q, r, biome, startQ, startR);
            const biomeDef = this.gameEngine.definitions.biomes[biome];

            // Get discoverable nodes
            const discoverableNodes = this.getDiscoverableNodes(regionId, biomeDef);

            // Get discoverable enemies
            const discoverableEnemies = this.getDiscoverableEnemies(distanceFromStart);

            // Get available missions
            const availableMissions = this.getAvailableMissions(regionId, isStartingRegion);

            // Build region object
            worldMap[regionId] = {
                name: regionName,
                description: description,
                biome: biome,
                backgroundImage: this.getBackgroundImage(q, r, startQ, startR),
                hexCoords: { q, r },
                navigationRequirement: navRequirement,
                complication: this.getComplicationFactor(q, r, biome, startQ, startR),
                requiredMissionToLeave: null,
                discoverableNodes: discoverableNodes,
                discoverableEnemies: discoverableEnemies,
                availableMissions: availableMissions,
                adjacent: validNeighbors.reduce((obj, n) => {
                    obj[n.dir] = `region_${n.q}_${n.r}`;
                    return obj;
                }, {})
            };
        }

        return worldMap;
    },

    /**
     * Get hex neighbors in axial coordinates
     */
    getNeighbors(q, r) {
        return [
            { q: q + 1, r: r, dir: "E" },      // East
            { q: q + 1, r: r - 1, dir: "NE" }, // Northeast
            { q: q, r: r - 1, dir: "NW" },     // Northwest
            { q: q - 1, r: r, dir: "W" },      // West
            { q: q - 1, r: r + 1, dir: "SW" }, // Southwest
            { q: q, r: r + 1, dir: "SE" }      // Southeast
        ];
    },

    /**
     * Get biome based on position
     */
    getBiome(q, r, mapRadius, biomeTypes) {
        const startQ = -3;
        const startR = -4;

        // Starting region is plains
        if (q === startQ && r === startR) return 'plains';

        // Simple procedural biome assignment based on position
        const distanceFromStart = Math.sqrt((q - startQ) ** 2 + (r - startR) ** 2);

        // Close to start: plains
        if (distanceFromStart < 2) return 'plains';

        // Biome zones based on position
        // Left side (near start): plains and forest
        if (q < -mapRadius * 0.4) {
            return r < 0 ? 'forest' : 'plains';
        }

        // Upper regions: mountains and tundra
        if (r < -mapRadius * 0.4) {
            return q > 0 ? 'tundra' : 'mountains';
        }

        // Lower regions: swamp and coast
        if (r > mapRadius * 0.4) {
            return q > 0 ? 'coast' : 'swamp';
        }

        // Middle-right: desert and forest
        if (q > mapRadius * 0.4) {
            return r > 0 ? 'desert' : 'forest';
        }

        // Default: varied biomes
        const hash = Math.abs(q * 73 + r * 37) % biomeTypes.length;
        return biomeTypes[hash];
    },

    /**
     * Calculate navigation requirement for region
     */
    calculateNavigationRequirement(q, r, startQ, startR) {
        // Starting region has nav requirement of 1
        if (q === startQ && r === startR) return 1;

        // Calculate steps in each direction from start
        const stepsUp = Math.max(0, startR - r);       // North (decreasing r)
        const stepsRight = Math.max(0, q - startQ);    // East (increasing q)
        const stepsDown = Math.max(0, r - startR);     // South (increasing r)
        const stepsLeft = Math.max(0, startQ - q);     // West (decreasing q)

        // Priority: Up > Right > Down > Left
        // Each step up adds 2 levels, each step right adds 1 level
        return 1 + (stepsUp * 2) + stepsRight + Math.floor(stepsDown / 2) + Math.floor(stepsLeft / 2);
    },

    /**
     * Calculate region complication factor
     * Higher complication = harder to discover things (requires more intellect)
     */
    getComplicationFactor(q, r, biome, startQ, startR) {
        const distanceFromStart = Math.sqrt((q - startQ) ** 2 + (r - startR) ** 2);

        // Biome difficulty modifiers
        const biomeDifficulty = {
            'plains': 1.0,    // Easy (starting biome)
            'forest': 1.2,    // Slightly harder (dense vegetation)
            'coast': 1.1,     // Slightly harder (water navigation)
            'desert': 1.3,    // Moderate (harsh conditions)
            'swamp': 1.4,     // Hard (confusing terrain)
            'mountains': 1.5, // Very hard (complex terrain)
            'tundra': 1.6     // Hardest (extreme conditions)
        };

        const baseComplication = biomeDifficulty[biome] || 1.0;
        const distanceComplication = distanceFromStart * this.gameEngine.gameBalance.complicationScaling;

        return parseFloat((baseComplication + distanceComplication).toFixed(2));
    },

    /**
     * Generate region name
     */
    getRegionName(q, r, biome, startQ, startR) {
        // The Cradle - Starting region
        if (q === startQ && r === startR) return "The Cradle";

        const prefixes = {
            plains: ["Green", "Sunny", "Peaceful", "Rolling", "Golden"],
            forest: ["Dark", "Deep", "Ancient", "Verdant", "Misty"],
            mountains: ["Highland", "Snowy", "Rocky", "Towering", "Peak"],
            tundra: ["Frozen", "Icy", "Bitter", "Arctic", "Frost"],
            desert: ["Arid", "Burning", "Dry", "Sandy", "Scorched"],
            swamp: ["Murky", "Foggy", "Dank", "Mossy", "Fetid"],
            coast: ["Coastal", "Sandy", "Windy", "Harbor", "Tidal"]
        };

        const suffixes = {
            plains: ["Plains", "Meadows", "Fields", "Grassland", "Valley"],
            forest: ["Woods", "Forest", "Grove", "Thicket", "Woodland"],
            mountains: ["Ridge", "Peak", "Mountains", "Summit", "Heights"],
            tundra: ["Tundra", "Wastes", "Expanse", "Barrens", "Flats"],
            desert: ["Desert", "Wastes", "Dunes", "Sands", "Expanse"],
            swamp: ["Swamp", "Marsh", "Bog", "Fen", "Mire"],
            coast: ["Shores", "Coast", "Beach", "Bay", "Cove"]
        };

        const prefix = prefixes[biome][Math.abs(q + r * 3) % prefixes[biome].length];
        const suffix = suffixes[biome][Math.abs(q * 2 + r) % suffixes[biome].length];

        return `${prefix} ${suffix}`;
    },

    /**
     * Get background image for region
     * Returns region-specific image path or null to use biome default
     */
    getBackgroundImage(q, r, startQ, startR) {
        // The Cradle - Starting region has a specific background
        if (q === startQ && r === startR) {
            return 'assets/backgrounds/regions/region_the_scar_01.png';
        }

        // Future regions can have their own backgrounds added here
        return null;
    },

    /**
     * Get discoverable nodes for region
     */
    getDiscoverableNodes(regionId, biomeDef) {
        const discoverableNodes = [];

        // Check WorldRegions first (new system)
        const worldRegionDef = typeof WorldRegions !== 'undefined' ? WorldRegions[regionId] : null;
        if (worldRegionDef && worldRegionDef.discoverableNodes) {
            // Region has custom nodes defined in WorldRegions
            discoverableNodes.push(...worldRegionDef.discoverableNodes);
            if (regionId === 'region_-3_-4') {
                console.log(`🔍 Region ${regionId} has custom nodes from WorldRegions:`, worldRegionDef.discoverableNodes);
                console.log(`✅ Added ${discoverableNodes.length} nodes from region definition:`, discoverableNodes);
            }
        } else if (biomeDef && biomeDef.gatheringNodes) {
            // Fallback to biome nodes if region doesn't define any
            if (regionId === 'region_-3_-4') console.log(`⚠️ No custom nodes for ${regionId}, using biome fallback`);
            for (let skill in biomeDef.gatheringNodes) {
                discoverableNodes.push(...biomeDef.gatheringNodes[skill]);
            }
        }

        return discoverableNodes;
    },

    /**
     * Get discoverable enemies based on region difficulty
     */
    getDiscoverableEnemies(distanceFromStart) {
        const discoverableEnemies = [];

        if (this.gameEngine.definitions.enemies) {
            const maxEnemyLevel = Math.max(1, Math.floor(distanceFromStart * 1.5));
            for (let enemyId in this.gameEngine.definitions.enemies) {
                const enemy = this.gameEngine.definitions.enemies[enemyId];
                const enemyLevel = enemy.level || 1;
                if (enemyLevel <= maxEnemyLevel) {
                    discoverableEnemies.push(enemyId);
                }
            }
        }

        return discoverableEnemies;
    },

    /**
     * Get available missions in region
     */
    getAvailableMissions(regionId, isStartingRegion) {
        const availableMissions = [];

        if (this.gameEngine.definitions.missions) {
            for (let missionId in this.gameEngine.definitions.missions) {
                const mission = this.gameEngine.definitions.missions[missionId];
                // Include missions that are in this region
                if (mission.region === regionId || (isStartingRegion && mission.region === "region_0_0")) {
                    availableMissions.push(missionId);
                }
            }
        }

        return availableMissions;
    },

    /**
     * Set mission requirement for leaving a region
     */
    setRegionMissionRequirement(worldMap, regionId, missionId) {
        if (worldMap && worldMap[regionId]) {
            worldMap[regionId].requiredMissionToLeave = missionId;
            console.log(`🗺️ Region ${regionId} now requires mission '${missionId}' to leave`);
        } else {
            console.error(`❌ Cannot set mission requirement: Region ${regionId} not found`);
        }
    }
};
