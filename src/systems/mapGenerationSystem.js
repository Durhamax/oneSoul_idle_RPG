/**
 * MAP GENERATION SYSTEM
 *
 * Procedurally generates a hex-based world map with:
 * - Realistic terrain using Simplex noise
 * - Rivers flowing from mountains to ocean
 * - Logical settlement placement
 * - Each hex = ~25 miles across
 */

const MapGenerationSystem = {
    // World map data
    worldMap: null,

    // Valid hex positions matching the landmass shape (extended to cover full map width)
    // Using offset coordinates: even-r horizontal layout
    validHexPositions: [
        // Row 0 (bottom) - southern coastline and islands, extended eastward
        { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 3, r: 0 }, { q: 4, r: 0 }, { q: 5, r: 0 }, { q: 6, r: 0 }, { q: 7, r: 0 }, { q: 8, r: 0 }, { q: 9, r: 0 }, { q: 10, r: 0 }, { q: 11, r: 0 }, { q: 12, r: 0 }, { q: 13, r: 0 }, { q: 14, r: 0 }, { q: 15, r: 0 }, { q: 16, r: 0 },

        // Row 1 - main southern landmass, extended eastward (removed q=0 from left)
        { q: 1, r: 1 }, { q: 2, r: 1 }, { q: 3, r: 1 }, { q: 4, r: 1 }, { q: 5, r: 1 }, { q: 6, r: 1 }, { q: 7, r: 1 }, { q: 8, r: 1 }, { q: 9, r: 1 }, { q: 10, r: 1 }, { q: 11, r: 1 }, { q: 12, r: 1 }, { q: 13, r: 1 }, { q: 14, r: 1 }, { q: 15, r: 1 }, { q: 16, r: 1 },

        // Row 2 - widest part, extended eastward (removed q=0 from left, skip central lake area at q=3)
        { q: 1, r: 2 }, { q: 2, r: 2 }, /* LAKE GAP */ { q: 4, r: 2 }, { q: 5, r: 2 }, { q: 6, r: 2 }, { q: 7, r: 2 }, { q: 8, r: 2 }, { q: 9, r: 2 }, { q: 10, r: 2 }, { q: 11, r: 2 }, { q: 12, r: 2 }, { q: 13, r: 2 }, { q: 14, r: 2 }, { q: 15, r: 2 }, { q: 16, r: 2 },

        // Row 3 - northern regions, extended eastward
        { q: 1, r: 3 }, { q: 2, r: 3 }, { q: 3, r: 3 }, { q: 4, r: 3 }, { q: 5, r: 3 }, { q: 6, r: 3 }, { q: 7, r: 3 }, { q: 8, r: 3 }, { q: 9, r: 3 }, { q: 10, r: 3 }, { q: 11, r: 3 }, { q: 12, r: 3 }, { q: 13, r: 3 }, { q: 14, r: 3 }, { q: 15, r: 3 }, { q: 16, r: 3 },

        // Row 4 (top) - mountain peaks and far north, extended eastward
        { q: 2, r: 4 }, { q: 3, r: 4 }, { q: 4, r: 4 }, { q: 5, r: 4 }, { q: 6, r: 4 }, { q: 7, r: 4 }, { q: 8, r: 4 }, { q: 9, r: 4 }, { q: 10, r: 4 }, { q: 11, r: 4 }, { q: 12, r: 4 }, { q: 13, r: 4 }, { q: 14, r: 4 }, { q: 15, r: 4 }, { q: 16, r: 4 }
    ],

    // Biome definitions
    BIOMES: {
        OCEAN: { id: 'ocean', name: 'Ocean', color: '#1a5490', elevation: [0, 0.3] },
        COAST: { id: 'coast', name: 'Coast', color: '#4a8fd6', elevation: [0.3, 0.4] },
        BEACH: { id: 'beach', name: 'Beach', color: '#e8d4a0', elevation: [0.4, 0.42] },
        PLAINS: { id: 'plains', name: 'Plains', color: '#7aa65c', elevation: [0.42, 0.55] },
        FOREST: { id: 'forest', name: 'Forest', color: '#2d5a2a', elevation: [0.42, 0.65] },
        HILLS: { id: 'hills', name: 'Hills', color: '#6b7c3a', elevation: [0.55, 0.7] },
        MOUNTAINS: { id: 'mountains', name: 'Mountains', color: '#7a6f5d', elevation: [0.7, 0.9] },
        SNOW_PEAKS: { id: 'snow_peaks', name: 'Snow Peaks', color: '#e8e8f0', elevation: [0.9, 1.0] },
        DESERT: { id: 'desert', name: 'Desert', color: '#d4a574', elevation: [0.42, 0.6] },
        SWAMP: { id: 'swamp', name: 'Swamp', color: '#4a5c47', elevation: [0.4, 0.48] },
        TUNDRA: { id: 'tundra', name: 'Tundra', color: '#b0c4c8', elevation: [0.42, 0.6] }
    },

    // Major settlements (placed after terrain generation)
    SETTLEMENTS: [
        { id: 'starting_town', name: 'Crossroads', x: 0, y: 0, type: 'town', size: 'small' },
        { id: 'capital', name: 'Silvercrest', x: -3, y: 2, type: 'city', size: 'large' },
        { id: 'port', name: 'Harborview', x: 2, y: -8, type: 'port', size: 'large' },
        { id: 'fortress', name: 'Ironpeak', x: 7, y: 5, type: 'fortress', size: 'medium' },
        { id: 'desert_post', name: 'Sandspire', x: 12, y: -2, type: 'outpost', size: 'small' },
        { id: 'forest_village', name: 'Greenwood', x: -7, y: 1, type: 'village', size: 'small' }
    ],

    /**
     * Initialize the map generation system
     */
    init() {
        console.log("🗺️ Initializing Map Generation System...");
        this.worldMap = this.generateWorldMap();
        console.log(`✅ World map generated! (${Object.keys(this.worldMap.tiles).length} tiles in rectangular grid)`);
    },

    /**
     * Check if a tile is within the valid hex positions (custom landmass shape)
     */
    isWithinHexBoundary(q, r) {
        // Check if this hex position exists in our custom landmass layout
        return this.validHexPositions.some(pos => pos.q === q && pos.r === r);
    },

    /**
     * Generate the complete world map
     */
    generateWorldMap() {
        const seed = 12345; // Fixed seed for consistency
        const noise = new SimplexNoise(seed);

        const map = {
            tiles: {},
            rivers: [],
            roads: [],
            settlements: this.SETTLEMENTS,
            validPositions: this.validHexPositions
        };

        // Generate terrain for each valid hex position
        this.validHexPositions.forEach(pos => {
            const { q, r } = pos;
            map.tiles[`${q},${r}`] = this.generateTile(q, r, noise);
        });

        // Generate rivers from mountains to ocean
        map.rivers = this.generateRivers(map.tiles, noise);

        // Generate roads connecting settlements
        map.roads = this.generateRoads(map.tiles);

        return map;
    },

    /**
     * Generate a single hex tile
     */
    generateTile(x, y, noise) {
        // Base elevation using multiple octaves
        const scale = 0.08;
        let elevation = noise.octaveNoise2D(x * scale, y * scale, 5, 0.5);

        // Normalize to 0-1
        elevation = (elevation + 1) / 2;

        // Apply geographical features

        // Mountain range (northeast, around x:5-8, y:3-8)
        const mountainDist = this.distanceToLine(x, y, 5, 3, 8, 8);
        if (mountainDist < 2) {
            elevation = Math.max(elevation, 0.75 + (2 - mountainDist) * 0.1);
        } else if (mountainDist < 4) {
            elevation = Math.max(elevation, 0.6 + (4 - mountainDist) * 0.05);
        }

        // Ocean (southern edge, y < -8)
        if (y < -8) {
            elevation = Math.min(elevation, 0.25);
        } else if (y < -6) {
            // Coastal transition
            const coastalBlend = (y + 8) / 2;
            elevation = elevation * coastalBlend + 0.25 * (1 - coastalBlend);
        }

        // River valley (reduces elevation near river path)
        const riverInfluence = this.getRiverInfluence(x, y);
        if (riverInfluence > 0) {
            elevation = Math.max(0.41, elevation - riverInfluence * 0.15);
        }

        // Moisture (affects biome type)
        const moistureScale = 0.12;
        let moisture = noise.octaveNoise2D((x + 1000) * moistureScale, (y + 1000) * moistureScale, 4, 0.5);
        moisture = (moisture + 1) / 2;

        // Increase moisture near rivers
        if (riverInfluence > 0) {
            moisture = Math.min(1, moisture + riverInfluence * 0.4);
        }

        // Temperature (latitude-based with noise)
        const tempScale = 0.1;
        let temperature = noise.octaveNoise2D((x + 2000) * tempScale, (y + 2000) * tempScale, 3, 0.4);
        temperature = (temperature + 1) / 2;

        // Latitude influence (colder in north and south)
        const latitudeTemp = 1 - (Math.abs(y) / 20);
        temperature = temperature * 0.4 + latitudeTemp * 0.6;

        // Altitude makes it colder
        if (elevation > 0.7) {
            temperature = temperature * (1 - (elevation - 0.7) * 1.5);
        }

        // Determine biome
        const biome = this.determineBiome(elevation, moisture, temperature, x, y);

        return {
            x,
            y,
            elevation,
            moisture,
            temperature,
            biome,
            hasRiver: riverInfluence > 0.5,
            hasRoad: false, // Will be set when generating roads
            settlement: null // Will be set for settlement tiles
        };
    },

    /**
     * Determine biome based on terrain parameters
     */
    determineBiome(elevation, moisture, temperature, x, y) {
        // Ocean
        if (elevation < 0.4) {
            if (elevation < 0.3) return this.BIOMES.OCEAN.id;
            return this.BIOMES.COAST.id;
        }

        // Beach (coastal areas just above water)
        if (elevation < 0.42 && y < -5) {
            return this.BIOMES.BEACH.id;
        }

        // Snow peaks (high altitude)
        if (elevation > 0.9) {
            return this.BIOMES.SNOW_PEAKS.id;
        }

        // Mountains
        if (elevation > 0.7) {
            return this.BIOMES.MOUNTAINS.id;
        }

        // Hills
        if (elevation > 0.55) {
            return this.BIOMES.HILLS.id;
        }

        // Tundra (far north, y > 12)
        if (y > 12 && temperature < 0.3) {
            return this.BIOMES.TUNDRA.id;
        }

        // Desert (eastern regions, x > 10, low moisture)
        if (x > 10 && moisture < 0.4 && temperature > 0.6) {
            return this.BIOMES.DESERT.id;
        }

        // Swamp (southeast lowlands around x:3-5, y:-4 to -6)
        if (x >= 3 && x <= 5 && y >= -6 && y <= -4 && moisture > 0.6) {
            return this.BIOMES.SWAMP.id;
        }

        // Forest (western regions x < -5, or high moisture)
        if ((x < -5 || moisture > 0.6) && temperature > 0.3) {
            return this.BIOMES.FOREST.id;
        }

        // Default: Plains
        return this.BIOMES.PLAINS.id;
    },

    /**
     * Get river influence at a position
     */
    getRiverInfluence(x, y) {
        // Main river path (from mountains to ocean)
        // Starts around (7, 6), flows through (0, 0), to (2, -8)
        const riverPath = [
            { x: 7, y: 6 },
            { x: 5, y: 4 },
            { x: 3, y: 2 },
            { x: 0, y: 0 },
            { x: -1, y: -2 },
            { x: 0, y: -4 },
            { x: 1, y: -6 },
            { x: 2, y: -8 }
        ];

        let minDist = Infinity;
        for (let i = 0; i < riverPath.length - 1; i++) {
            const p1 = riverPath[i];
            const p2 = riverPath[i + 1];
            const dist = this.pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
            minDist = Math.min(minDist, dist);
        }

        // River influence decreases with distance
        if (minDist < 0.5) return 1.0;
        if (minDist < 1.5) return 1 - (minDist - 0.5);
        return 0;
    },

    /**
     * Generate river paths
     */
    generateRivers(tiles, noise) {
        const rivers = [];

        // Main river (from mountains southwest to ocean)
        const mainRiver = {
            id: 'main_river',
            name: 'Silverstream',
            path: [
                { x: 7, y: 6 },
                { x: 6, y: 5 },
                { x: 5, y: 4 },
                { x: 4, y: 3 },
                { x: 3, y: 2 },
                { x: 2, y: 1 },
                { x: 1, y: 0 },
                { x: 0, y: 0 },
                { x: -1, y: -1 },
                { x: -1, y: -2 },
                { x: 0, y: -3 },
                { x: 0, y: -4 },
                { x: 1, y: -5 },
                { x: 1, y: -6 },
                { x: 2, y: -7 },
                { x: 2, y: -8 }
            ]
        };

        rivers.push(mainRiver);

        // Mark tiles with rivers
        for (let point of mainRiver.path) {
            const key = `${point.x},${point.y}`;
            if (tiles[key]) {
                tiles[key].hasRiver = true;
            }
        }

        return rivers;
    },

    /**
     * Generate roads connecting settlements
     */
    generateRoads(tiles) {
        const roads = [];

        // Define major trade routes
        const routes = [
            // Capital to starting town
            { from: this.SETTLEMENTS[1], to: this.SETTLEMENTS[0] },
            // Starting town to port
            { from: this.SETTLEMENTS[0], to: this.SETTLEMENTS[2] },
            // Starting town to fortress
            { from: this.SETTLEMENTS[0], to: this.SETTLEMENTS[3] },
            // Fortress to desert outpost
            { from: this.SETTLEMENTS[3], to: this.SETTLEMENTS[4] },
            // Capital to forest village
            { from: this.SETTLEMENTS[1], to: this.SETTLEMENTS[5] }
        ];

        for (let route of routes) {
            const path = this.findPath(route.from, route.to, tiles);
            if (path) {
                roads.push({
                    from: route.from.id,
                    to: route.to.id,
                    path: path
                });

                // Mark tiles with roads
                for (let point of path) {
                    const key = `${point.x},${point.y}`;
                    if (tiles[key]) {
                        tiles[key].hasRoad = true;
                    }
                }
            }
        }

        return roads;
    },

    /**
     * Simple A* pathfinding for roads
     */
    findPath(start, end, tiles) {
        const path = [];
        const dx = Math.sign(end.x - start.x);
        const dy = Math.sign(end.y - start.y);

        let current = { x: start.x, y: start.y };
        path.push({ ...current });

        // Simple pathfinding - move toward goal avoiding water
        while (current.x !== end.x || current.y !== end.y) {
            if (current.x !== end.x) {
                current.x += dx;
            } else if (current.y !== end.y) {
                current.y += dy;
            }

            path.push({ ...current });

            // Safety check
            if (path.length > 100) break;
        }

        return path;
    },

    /**
     * Distance from point to line segment
     */
    pointToSegmentDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) {
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }

        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
        t = Math.max(0, Math.min(1, t));

        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    },

    /**
     * Distance from point to line
     */
    distanceToLine(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) {
            return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }

        const t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
    },

    /**
     * Get tile data at coordinates
     */
    getTile(x, y) {
        if (!this.worldMap) return null;
        return this.worldMap.tiles[`${x},${y}`] || null;
    },

    /**
     * Get biome info
     */
    getBiomeInfo(biomeId) {
        return Object.values(this.BIOMES).find(b => b.id === biomeId) || this.BIOMES.PLAINS;
    }
};
