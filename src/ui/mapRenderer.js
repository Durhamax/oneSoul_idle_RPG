/**
 * MAP RENDERER - Full View with Detailed Geographic Features
 *
 * Renders the entire world map at once with:
 * - Multi-layer hex rendering (terrain, elevation, water, vegetation, settlements)
 * - Detailed geographic features (rivers, mountains, forests, coasts)
 * - Clear settlement markers and roads
 * - Complete legend and scale indicator
 * - (0,0) positioned at left edge for westward-to-eastward exploration
 */

const MapRenderer = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 600,

    // Hex dimensions (flat-top hexagons)
    hexSize: 12, // Smaller to fit full map (x:-10 to x:20 = 30 tiles wide)
    hexWidth: 0,
    hexHeight: 0,

    // Map offset to position (0,0) at left edge
    offsetX: 100, // Left margin
    offsetY: 300, // Middle height

    // Rendering flags
    showGrid: true,
    showRivers: true,
    showRoads: true,
    showSettlements: true,
    showPlayerPosition: true,
    showLabels: false, // Toggle for region labels

    /**
     * Initialize the renderer
     */
    init(canvasId = 'worldMapCanvas') {
        console.log("🎨 Initializing Full-View Map Renderer...");

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`❌ Canvas ${canvasId} not found`);
            return false;
        }

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Calculate hex dimensions for flat-top hexagons
        this.hexWidth = this.hexSize * 2;
        this.hexHeight = this.hexSize * Math.sqrt(3);

        // Add mouse event listeners
        this.setupMouseControls();

        console.log("✅ Full-View Map Renderer initialized!");
        return true;
    },

    /**
     * Setup mouse controls for tile selection
     */
    setupMouseControls() {
        // Mouse click for tile selection
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.handleTileClick(mouseX, mouseY);
        });

        // Mouse move for hover effects
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const coords = this.pixelToHex(mouseX, mouseY);
            if (coords) {
                this.canvas.style.cursor = 'pointer';
                this.showCoordinateTooltip(coords.q, coords.r, mouseX, mouseY);
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
    },

    /**
     * Convert hex coordinates to pixel position
     */
    hexToPixel(q, r) {
        const x = this.offsetX + (q * this.hexWidth * 0.75);
        const y = this.offsetY + (r * this.hexHeight + q * this.hexHeight * 0.5);
        return { x, y };
    },

    /**
     * Convert pixel position to hex coordinates
     */
    pixelToHex(px, py) {
        // Inverse of hexToPixel calculation
        const adjustedX = px - this.offsetX;
        const adjustedY = py - this.offsetY;

        // Approximate hex grid conversion
        const q = Math.round((adjustedX / (this.hexWidth * 0.75)));
        const r = Math.round((adjustedY - q * this.hexHeight * 0.5) / this.hexHeight);

        // Check if this hex exists in the world map
        const regionId = `region_${q}_${r}`;
        if (GameEngine.definitions.worldMap && GameEngine.definitions.worldMap[regionId]) {
            return { q, r };
        }

        return null;
    },

    /**
     * Render the entire world map
     */
    render() {
        if (!GameEngine.definitions.worldMap) {
            console.warn("⚠️ World map not loaded yet");
            return;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background (ocean)
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const worldMap = GameEngine.definitions.worldMap;

        // LAYER 1: Base terrain
        for (let regionId in worldMap) {
            const region = worldMap[regionId];
            const { q, r } = region.hexCoords;
            this.drawHexBase(q, r, region);
        }

        // LAYER 2: Elevation shading
        for (let regionId in worldMap) {
            const region = worldMap[regionId];
            const { q, r } = region.hexCoords;
            this.drawElevationShading(q, r, region);
        }

        // LAYER 3: Water features (rivers)
        if (this.showRivers) {
            this.drawAllRivers();
        }

        // LAYER 4: Vegetation patterns
        for (let regionId in worldMap) {
            const region = worldMap[regionId];
            const { q, r } = region.hexCoords;
            this.drawVegetation(q, r, region);
        }

        // LAYER 5: Roads
        if (this.showRoads) {
            this.drawAllRoads();
        }

        // LAYER 6: Settlements and markers
        if (this.showSettlements) {
            for (let regionId in worldMap) {
                const region = worldMap[regionId];
                const { q, r } = region.hexCoords;
                this.drawSettlement(q, r, region);
            }
        }

        // LAYER 7: Grid lines
        if (this.showGrid) {
            for (let regionId in worldMap) {
                const region = worldMap[regionId];
                const { q, r } = region.hexCoords;
                this.drawHexOutline(q, r, region);
            }
        }

        // LAYER 8: Player position marker
        if (this.showPlayerPosition && GameEngine.state.currentRegion) {
            const currentRegion = GameEngine.definitions.worldMap[GameEngine.state.currentRegion];
            if (currentRegion) {
                const { q, r } = currentRegion.hexCoords;
                this.drawPlayerMarker(q, r);
            }
        }

        // Draw legend
        this.drawLegend();

        // Draw compass rose
        this.drawCompassRose();

        // Draw scale indicator
        this.drawScaleIndicator();
    },

    /**
     * LAYER 1: Draw hex base terrain
     */
    drawHexBase(q, r, region) {
        const { x, y } = this.hexToPixel(q, r);
        const biome = region.biome;

        // Biome colors
        const biomeColors = {
            ocean: '#1a5490',
            coast: '#4a8fd6',
            beach: '#e8d4a0',
            plains: '#90a955',
            forest: '#2d5a2a',
            hills: '#8b7355',
            mountains: '#a0896d',
            snow_peaks: '#e8e8f0',
            desert: '#d4a574',
            swamp: '#3e5c3a',
            tundra: '#d0e1f9'
        };

        this.ctx.fillStyle = biomeColors[biome] || biomeColors.plains;
        this.drawHex(x, y);
    },

    /**
     * LAYER 2: Draw elevation shading
     */
    drawElevationShading(q, r, region) {
        // Add shadows for mountains and hills
        if (region.biome === 'mountains' || region.biome === 'hills' || region.biome === 'snow_peaks') {
            const { x, y } = this.hexToPixel(q, r);

            // Draw mountain peaks as triangles
            const peakCount = region.biome === 'snow_peaks' ? 3 : region.biome === 'mountains' ? 2 : 1;

            for (let i = 0; i < peakCount; i++) {
                const offsetX = (Math.random() - 0.5) * this.hexSize;
                const offsetY = (Math.random() - 0.5) * this.hexSize;
                const peakSize = this.hexSize * 0.4;

                // Mountain body
                this.ctx.fillStyle = region.biome === 'snow_peaks' ? '#c0c0d0' : '#7a6f5d';
                this.ctx.beginPath();
                this.ctx.moveTo(x + offsetX, y + offsetY - peakSize);
                this.ctx.lineTo(x + offsetX - peakSize * 0.6, y + offsetY + peakSize * 0.5);
                this.ctx.lineTo(x + offsetX + peakSize * 0.6, y + offsetY + peakSize * 0.5);
                this.ctx.closePath();
                this.ctx.fill();

                // Snow cap for high peaks
                if (region.biome === 'snow_peaks' || region.biome === 'mountains') {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + offsetX, y + offsetY - peakSize);
                    this.ctx.lineTo(x + offsetX - peakSize * 0.3, y + offsetY - peakSize * 0.3);
                    this.ctx.lineTo(x + offsetX + peakSize * 0.3, y + offsetY - peakSize * 0.3);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
        }
    },

    /**
     * LAYER 3: Draw all rivers
     */
    drawAllRivers() {
        if (!MapGenerationSystem || !MapGenerationSystem.worldMap) return;

        const rivers = MapGenerationSystem.worldMap.rivers;
        if (!rivers) return;

        for (let river of rivers) {
            this.drawRiver(river);
        }
    },

    /**
     * Draw a single river as a curved path
     */
    drawRiver(river) {
        if (!river.path || river.path.length < 2) return;

        this.ctx.strokeStyle = '#4a90a4';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw river as curved path
        this.ctx.beginPath();

        for (let i = 0; i < river.path.length; i++) {
            const point = river.path[i];
            const { x, y } = this.hexToPixel(point.x, point.y);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                // Use quadratic curves for smoother river
                const prevPoint = river.path[i - 1];
                const { x: px, y: py } = this.hexToPixel(prevPoint.x, prevPoint.y);
                const cpx = (px + x) / 2 + (Math.random() - 0.5) * 5;
                const cpy = (py + y) / 2 + (Math.random() - 0.5) * 5;
                this.ctx.quadraticCurveTo(cpx, cpy, x, y);
            }
        }

        this.ctx.stroke();

        // River gets wider toward ocean
        this.ctx.strokeStyle = 'rgba(74, 144, 164, 0.3)';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    },

    /**
     * LAYER 4: Draw vegetation patterns
     */
    drawVegetation(q, r, region) {
        const { x, y } = this.hexToPixel(q, r);

        // Forest pattern
        if (region.biome === 'forest') {
            const treeCount = 5;
            this.ctx.fillStyle = '#0d5016';

            for (let i = 0; i < treeCount; i++) {
                const angle = (Math.PI * 2 * i) / treeCount + Math.random();
                const dist = this.hexSize * 0.5 * Math.random();
                const tx = x + Math.cos(angle) * dist;
                const ty = y + Math.sin(angle) * dist;

                // Draw simple tree triangle
                this.ctx.beginPath();
                this.ctx.moveTo(tx, ty - 3);
                this.ctx.lineTo(tx - 2, ty + 2);
                this.ctx.lineTo(tx + 2, ty + 2);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }

        // Swamp pattern (sparse dots)
        if (region.biome === 'swamp') {
            this.ctx.fillStyle = 'rgba(20, 40, 20, 0.4)';
            for (let i = 0; i < 8; i++) {
                const sx = x + (Math.random() - 0.5) * this.hexSize;
                const sy = y + (Math.random() - 0.5) * this.hexSize * 0.8;
                this.ctx.fillRect(sx, sy, 1, 1);
            }
        }

        // Desert pattern (sand dunes)
        if (region.biome === 'desert') {
            this.ctx.strokeStyle = 'rgba(200, 150, 100, 0.3)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 2; i++) {
                this.ctx.beginPath();
                this.ctx.arc(x + (i - 0.5) * this.hexSize * 0.4, y, this.hexSize * 0.3, 0, Math.PI, false);
                this.ctx.stroke();
            }
        }
    },

    /**
     * LAYER 5: Draw all roads
     */
    drawAllRoads() {
        if (!MapGenerationSystem || !MapGenerationSystem.worldMap) return;

        const roads = MapGenerationSystem.worldMap.roads;
        if (!roads) return;

        for (let road of roads) {
            this.drawRoad(road);
        }
    },

    /**
     * Draw a single road
     */
    drawRoad(road) {
        if (!road.path || road.path.length < 2) return;

        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([3, 2]);
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();

        for (let i = 0; i < road.path.length; i++) {
            const point = road.path[i];
            const { x, y } = this.hexToPixel(point.x, point.y);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    },

    /**
     * LAYER 6: Draw settlement markers
     */
    drawSettlement(q, r, region) {
        // Check if this is a settlement location
        if (!MapGenerationSystem || !MapGenerationSystem.worldMap) return;

        const settlements = MapGenerationSystem.worldMap.settlements || [];
        const settlement = settlements.find(s => s.x === q && s.y === r);

        if (!settlement) {
            // Check if this is starting position (0,0)
            if (q === 0 && r === 0) {
                this.drawSettlementIcon(q, r, 'starting', 'The Scar');
            }
            return;
        }

        this.drawSettlementIcon(q, r, settlement.type, settlement.name);
    },

    /**
     * Draw settlement icon
     */
    drawSettlementIcon(q, r, type, name) {
        const { x, y } = this.hexToPixel(q, r);

        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        let icon = '';
        let color = '#000000';

        switch (type) {
            case 'starting':
            case 'town':
                icon = '⭐';
                color = '#ffd700';
                break;
            case 'city':
                icon = '⬛';
                color = '#333333';
                break;
            case 'port':
                icon = '⚓';
                color = '#4a90a4';
                break;
            case 'fortress':
                icon = '🏰';
                break;
            case 'outpost':
                icon = '▪️';
                color = '#666666';
                break;
            case 'village':
                icon = '▪️';
                color = '#8b4513';
                break;
            default:
                icon = '⚫';
        }

        // Draw icon
        this.ctx.fillStyle = color;
        this.ctx.fillText(icon, x, y);

        // Draw name label (small)
        if (name && this.showLabels) {
            this.ctx.font = '8px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeText(name, x, y + this.hexSize + 5);
            this.ctx.fillText(name, x, y + this.hexSize + 5);
        }
    },

    /**
     * Draw hex outline (grid)
     */
    drawHexOutline(q, r, region) {
        const { x, y } = this.hexToPixel(q, r);

        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        this.ctx.lineWidth = 0.5;
        this.drawHexPath(x, y);
        this.ctx.stroke();
    },

    /**
     * Draw player position marker
     */
    drawPlayerMarker(q, r) {
        const { x, y } = this.hexToPixel(q, r);

        // Draw pulsing circle
        this.ctx.strokeStyle = '#00d9ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.hexSize * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw inner dot
        this.ctx.fillStyle = '#00d9ff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    },

    /**
     * Draw a hex shape at pixel position
     */
    drawHex(x, y) {
        this.drawHexPath(x, y);
        this.ctx.fill();
    },

    /**
     * Create hex path (for filling or stroking)
     */
    drawHexPath(x, y) {
        const size = this.hexSize;

        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);

            if (i === 0) {
                this.ctx.moveTo(hx, hy);
            } else {
                this.ctx.lineTo(hx, hy);
            }
        }
        this.ctx.closePath();
    },

    /**
     * Draw complete legend
     */
    drawLegend() {
        const legendX = 10;
        const legendY = 10;
        const lineHeight = 16;
        const boxSize = 12;

        // Legend background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(legendX, legendY, 140, 280);

        // Legend title
        this.ctx.font = 'bold 11px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('MAP LEGEND', legendX + 10, legendY + 15);

        // Legend items
        const items = [
            { color: '#1a5490', label: 'Deep Ocean' },
            { color: '#4a8fd6', label: 'Coastal Water' },
            { color: '#90a955', label: 'Plains' },
            { color: '#2d5a2a', label: 'Dense Forest' },
            { color: '#8b7355', label: 'Hills' },
            { color: '#a0896d', label: 'Mountains' },
            { color: '#e8e8f0', label: 'Snow Peaks' },
            { color: '#d4a574', label: 'Desert' },
            { color: '#3e5c3a', label: 'Swamp' },
            { color: '#d0e1f9', label: 'Tundra' },
            { symbol: '〰️', color: '#4a90a4', label: 'River' },
            { symbol: '---', color: '#666', label: 'Road' },
            { symbol: '⭐', color: '#ffd700', label: 'Starting Point' },
            { symbol: '⬛', color: '#333', label: 'City' },
            { symbol: '⚓', color: '#4a90a4', label: 'Port' },
            { symbol: '🏰', label: 'Fortress' }
        ];

        this.ctx.font = '10px Arial';

        items.forEach((item, index) => {
            const y = legendY + 35 + index * lineHeight;

            if (item.symbol) {
                // Draw symbol
                this.ctx.fillStyle = item.color || '#ffffff';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(item.symbol, legendX + 15, y);
            } else {
                // Draw color box
                this.ctx.fillStyle = item.color;
                this.ctx.fillRect(legendX + 10, y - boxSize/2, boxSize, boxSize);
                this.ctx.strokeStyle = '#666';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(legendX + 10, y - boxSize/2, boxSize, boxSize);
            }

            // Draw label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.label, legendX + 30, y + 2);
        });
    },

    /**
     * Draw compass rose
     */
    drawCompassRose() {
        const cx = this.width - 40;
        const cy = this.height - 40;
        const radius = 25;

        // Background circle
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // North arrow
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - radius + 5);
        this.ctx.lineTo(cx - 5, cy - 10);
        this.ctx.lineTo(cx + 5, cy - 10);
        this.ctx.closePath();
        this.ctx.fill();

        // Direction labels
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('N', cx, cy - radius + 12);
        this.ctx.fillText('S', cx, cy + radius - 8);
        this.ctx.fillText('E', cx + radius - 8, cy);
        this.ctx.fillText('W', cx - radius + 8, cy);
    },

    /**
     * Draw scale indicator
     */
    drawScaleIndicator() {
        const x = this.width - 150;
        const y = this.height - 80;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, 140, 30);

        // Scale text
        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('1 hex ≈ 25 miles', x + 10, y + 20);

        // Scale bar
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y + 10);
        this.ctx.lineTo(x + 50, y + 10);
        this.ctx.stroke();
    },

    /**
     * Show coordinate tooltip on hover
     */
    showCoordinateTooltip(q, r, mouseX, mouseY) {
        const regionId = `region_${q}_${r}`;
        const region = GameEngine.definitions.worldMap[regionId];

        if (!region) return;

        // Draw tooltip
        const tooltipText = `(${q}, ${r}) - ${region.name}`;
        const tooltipWidth = this.ctx.measureText(tooltipText).width + 10;
        const tooltipX = Math.min(mouseX + 10, this.width - tooltipWidth - 5);
        const tooltipY = mouseY - 25;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, 20);

        this.ctx.font = '11px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(tooltipText, tooltipX + 5, tooltipY + 14);
    },

    /**
     * Handle tile click
     */
    handleTileClick(mouseX, mouseY) {
        const coords = this.pixelToHex(mouseX, mouseY);
        if (!coords) return;

        const { q, r } = coords;
        const regionId = `region_${q}_${r}`;
        const region = GameEngine.definitions.worldMap[regionId];

        if (!region) return;

        console.log(`🗺️ Clicked region: ${region.name} (${q}, ${r})`);
        this.openRegionModal(q, r, region);
    },

    /**
     * Open region information modal
     */
    openRegionModal(q, r, region) {
        // Use the existing modal from the old system
        if (typeof openRegionModal === 'function') {
            openRegionModal(q, r, region);
        } else {
            // Create simple modal
            alert(`${region.name}\nBiome: ${region.biome}\nCoordinates: (${q}, ${r})`);
        }
    },

    /**
     * Center view on specific coordinates (not needed for full view, but kept for compatibility)
     */
    centerOn(q, r) {
        console.log(`Map already shows full view - (${q}, ${r}) is visible`);
        this.render();
    },

    /**
     * Refresh the map display
     */
    refresh() {
        this.render();
    }
};
