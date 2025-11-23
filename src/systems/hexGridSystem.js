/**
 * HEX GRID SYSTEM
 *
 * Renders interactive hex tile grid overlay on world map background.
 * Integrated map and hex grid system with:
 * - Seamless zoom/pan of map and hexes together
 * - Constrained zoom (always fills viewport)
 * - Constrained pan (can't see beyond map edges)
 * - Hex grid locked to map background
 * - Only hexes within map bounds
 */

const HexGridSystem = {
    // Map and hex dimensions
    mapWidth: 2560,
    mapHeight: 1600,
    hexWidth: 217.8,  // Increased by 10% again (198 * 1.1)
    hexHeight: 188.76, // hexWidth * 0.866 for proper hex ratio
    hexGap: 3,      // Pixel gap between hexes for visual clarity

    // Grid bounds - extended to cover full map
    maxCols: 17,    // Covers columns 1-16 (extended to eastern edge)
    maxRows: 11,    // Covers full map height

    // Zoom and pan state
    currentScale: 1,
    currentX: 0,
    currentY: 0,
    minZoom: 1,          // Calculated minimum to fill viewport (no zoom out beyond this)
    maxZoom: 2.5,

    // Viewport dimensions
    viewportWidth: 0,
    viewportHeight: 0,

    // Drag state
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartTranslateX: 0,
    dragStartTranslateY: 0,

    // DOM references
    viewport: null,
    mapContent: null,
    hexContainer: null,

    // Hex grid origin (in map pixels) - centered on background image
    // This is where hex (0,0) will be positioned
    // Map dimensions: 2560 x 1600, center point: (1280, 800)
    // Adjusted to account for hexagonal grid shape and land distribution
    // Shifted right by 108.9px (half tile width) after removing column q=7
    originX: 1308.9,  // Re-centered after removing eastern column
    originY: 815,   // Center hex (0,0) on landmass vertical center

    // Landmass regions for smart tile placement
    // Extended to cover full map width (3 additional columns eastward)
    landRegions: [
        // Western forest area (left side of map)
        { left: 0, right: 1000, top: 100, bottom: 1400 },
        // Central area around lake
        { left: 900, right: 1500, top: 50, bottom: 1500 },
        // Eastern volcanic region (dark/red area) - EXTENDED
        { left: 1400, right: 2560, top: 200, bottom: 900 },
        // Southeastern desert (orange area) - EXTENDED
        { left: 1300, right: 2560, top: 800, bottom: 1450 },
        // Northern mountains (extends east) - EXTENDED
        { left: 1000, right: 2400, top: 50, bottom: 450 },
        // Southern coastal/island areas - EXTENDED
        { left: 100, right: 2500, top: 1200, bottom: 1580 }
    ],

    /**
     * Initialize the hex grid system
     */
    init(containerId) {
        console.log("🗺️ Initializing Hex Grid System...");

        // Add footsteps animation CSS if not already present
        if (!document.getElementById('footstepsAnimationStyles')) {
            const style = document.createElement('style');
            style.id = 'footstepsAnimationStyles';
            style.textContent = `
                @keyframes footstepsFade {
                    0% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.createDOM(containerId);
        this.calculateViewportBounds();
        this.calculateMinZoom();
        this.createHexGrid();
        this.setupZoomPan();
        this.centerOnStartingArea();

        console.log("✅ Hex Grid System initialized");
    },

    /**
     * Create the DOM structure
     */
    createDOM(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("Container not found:", containerId);
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create viewport (overflow hidden, maintains map aspect ratio)
        // Map is 2560x1600 = 16:10 aspect ratio (1.6:1)
        this.viewport = document.createElement('div');
        this.viewport.id = 'mapViewport';
        this.viewport.style.cssText = `
            width: 100%;
            aspect-ratio: 16 / 10;
            overflow: hidden;
            position: relative;
            background: #0a0a0a;
            border-radius: 5px;
            cursor: grab;
        `;

        // Create map content (holds both map and hexes, transforms together)
        this.mapContent = document.createElement('div');
        this.mapContent.id = 'mapContent';
        this.mapContent.style.cssText = `
            width: ${this.mapWidth}px;
            height: ${this.mapHeight}px;
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: 0 0;
            transition: transform 0.1s ease-out;
            background: url('assets/map/world_map.jpg') no-repeat;
            background-size: ${this.mapWidth}px ${this.mapHeight}px;
        `;

        // Create hex container (overlay on top of map)
        this.hexContainer = document.createElement('div');
        this.hexContainer.id = 'hexContainer';
        this.hexContainer.style.cssText = `
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
        `;

        this.mapContent.appendChild(this.hexContainer);
        this.viewport.appendChild(this.mapContent);
        container.appendChild(this.viewport);
    },

    /**
     * Calculate viewport dimensions
     */
    calculateViewportBounds() {
        if (!this.viewport) return;

        const rect = this.viewport.getBoundingClientRect();
        this.viewportWidth = rect.width;
        this.viewportHeight = rect.height;
    },

    /**
     * Calculate minimum zoom to fill viewport
     */
    calculateMinZoom() {
        const widthRatio = this.viewportWidth / this.mapWidth;
        const heightRatio = this.viewportHeight / this.mapHeight;

        // Min zoom is the larger ratio (ensures map fills viewport)
        this.minZoom = Math.max(widthRatio, heightRatio);

        // Start at min zoom (map fills viewport with no black space)
        this.currentScale = this.minZoom;

        console.log(`Min zoom: ${this.minZoom.toFixed(3)} (viewport: ${this.viewportWidth}x${this.viewportHeight}, map: ${this.mapWidth}x${this.mapHeight})`);
    },

    /**
     * Check if a hex should be created at this position (smart tile placement)
     */
    shouldCreateHex(x, y) {
        // Calculate hex center position
        const hexCenterX = x + this.hexWidth / 2;
        const hexCenterY = y + this.hexHeight / 2;

        // Check if hex is within map bounds
        if (hexCenterX < 0 || hexCenterX > this.mapWidth ||
            hexCenterY < 0 || hexCenterY > this.mapHeight) {
            return false;
        }

        // Check if hex center is within any land region
        return this.landRegions.some(region =>
            hexCenterX >= region.left &&
            hexCenterX <= region.right &&
            hexCenterY >= region.top &&
            hexCenterY <= region.bottom
        );
    },

    /**
     * Get hex position from axial coordinates (q, r)
     * Converts axial coordinates to pixel positions with gap spacing
     */
    getHexPosition(q, r) {
        // Include gap in positioning calculations
        const effectiveWidth = this.hexWidth + this.hexGap;
        const effectiveHeight = this.hexHeight + this.hexGap;

        // Convert axial coordinates to pixel positions
        // Note: r coordinates are negated during world generation so +r displays up, -r displays down
        // Pixel Y increases downward, so we negate r here to match that pixel coordinates increase downward
        const x = this.originX + (effectiveWidth * 0.75 * q);
        const y = this.originY + (effectiveHeight * (-r + q * 0.5));  // Negate r so positions match original map

        return { x, y };
    },

    /**
     * Create the hex grid
     */
    createHexGrid() {
        if (!this.hexContainer) return;

        const state = GameEngine.state;
        const worldMap = GameEngine.definitions.worldMap;

        if (!worldMap) {
            console.error("World map not found");
            return;
        }

        // Clear existing hexes
        this.hexContainer.innerHTML = '';

        // Create hexes for each tile in the tilemap
        let hexCount = 0;
        const tiles = WorldTilemap.getTiles();

        for (let tile of tiles) {
            const { q, r } = tile;
            const regionId = WorldTilemap.getRegionId(q, r);
            const hex = worldMap[regionId];

            if (!hex) {
                console.warn(`⚠️ No region definition for tile (${q}, ${r})`);
                continue;
            }

            // Get position with gap spacing
            const pos = this.getHexPosition(q, r);

            // Check if hex should be created (smart placement)
            if (!this.shouldCreateHex(pos.x, pos.y)) {
                continue;
            }

            // Create hex element
            const hexElement = this.createHexElement(regionId, hex, pos.x, pos.y);
            this.hexContainer.appendChild(hexElement);
            hexCount++;
        }

        console.log(`Created ${hexCount} hex tiles (extended grid: ${this.maxCols} cols × ${this.maxRows} rows)`);
    },

    /**
     * Check if a hex position is within map bounds
     */
    isHexInBounds(x, y) {
        const padding = 20; // Small padding to avoid edge issues

        return (
            x >= padding &&
            y >= padding &&
            x + this.hexWidth <= this.mapWidth - padding &&
            y + this.hexHeight <= this.mapHeight - padding
        );
    },

    /**
     * Create a single hex element
     */
    createHexElement(regionId, hexData, x, y) {
        const state = GameEngine.state;
        const regionState = state.regions[regionId];
        const biome = GameEngine.definitions.biomes[hexData.biome];
        const isCurrent = state.currentRegion === regionId;
        const isDiscovered = regionState?.discovered || false;
        const discoveryProgress = regionState?.discoveryProgress || 0;
        const isFullyExplored = discoveryProgress >= 100;

        // Check if explorable (path found from another region)
        let isExplorable = false;
        if (!isDiscovered) {
            for (let otherRegionId in state.regions) {
                const otherState = state.regions[otherRegionId];
                if (otherState.discoveredExitPaths?.includes(regionId)) {
                    isExplorable = true;
                    break;
                }
            }
        }

        const hexDiv = document.createElement('div');
        hexDiv.className = 'hex-tile';
        hexDiv.dataset.regionId = regionId;
        hexDiv.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${this.hexWidth}px;
            height: ${this.hexHeight}px;
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
            pointer-events: auto;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            outline: none;
            isolation: isolate;
        `;

        // Determine styling based on state - adjusted for larger hexes with gaps
        let fillColor = 'rgba(0, 0, 0, 0.7)'; // Locked - darker fog for larger tiles
        let strokeColor = 'rgba(74, 158, 255, 0.4)'; // Default border
        let strokeWidth = '2px'; // Border width
        let glow = 'none';
        let backdropBlur = '';

        if (isExplorable && !isDiscovered) {
            // Path found - golden tint
            fillColor = 'rgba(255, 200, 0, 0.25)';
            strokeColor = 'rgba(255, 200, 0, 0.6)';
            strokeWidth = '2px';
            glow = 'inset 0 0 25px rgba(255, 200, 0, 0.3), 0 0 3px rgba(255, 200, 0, 0.4)';
        } else if (isDiscovered && !isCurrent) {
            // Unlocked (discovered) - NO GRAY FILL, highlighted border in green/cyan
            fillColor = 'rgba(0, 0, 0, 0)'; // Transparent fill to show map underneath
            strokeColor = isFullyExplored ? 'rgba(0, 255, 150, 0.8)' : 'rgba(100, 200, 255, 0.7)';
            strokeWidth = '3px'; // Thicker border for unlocked tiles
            glow = isFullyExplored
                ? '0 0 6px rgba(0, 255, 150, 0.6)'
                : '0 0 4px rgba(100, 200, 255, 0.5)';
        } else if (!isDiscovered) {
            // Locked (undiscovered) - gray filled with blur effect for fog of war
            fillColor = 'rgba(0, 0, 0, 0.7)';
            strokeColor = 'rgba(80, 80, 80, 0.5)';
            strokeWidth = '2px';
            backdropBlur = 'blur(2px)';
        }

        if (isCurrent) {
            // Current region - BLUE BOLD border with glow effect
            fillColor = 'rgba(33, 150, 243, 0.12)'; // Blue tint
            strokeColor = 'rgba(33, 150, 243, 1.0)'; // Pure blue (#2196F3)
            strokeWidth = '4px'; // Bold/thick border
            glow = 'inset 0 0 35px rgba(33, 150, 243, 0.4), 0 0 15px rgba(100, 181, 246, 0.9)'; // Blue glow
        }

        // Apply styling with stroke-like border effect using box-shadow
        hexDiv.style.backgroundColor = fillColor;
        hexDiv.style.boxShadow = `${glow}${glow !== 'none' ? ', ' : ''}0 0 0 ${strokeWidth} ${strokeColor}`;
        if (backdropBlur) {
            hexDiv.style.backdropFilter = backdropBlur;
        }

        // Add icon/label - scaled up for larger hexes
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        `;

        // Add coordinate label (always visible for debugging)
        const coordLabel = document.createElement('div');
        coordLabel.style.cssText = `
            font-size: 20px;
            font-weight: bold;
            color: white;
            text-shadow: 0 0 4px #000, 0 0 8px #000, 2px 2px 3px #000;
            margin-bottom: 5px;
        `;
        // Display actual internal coordinates (no transformation)
        const displayQ = hexData.hexCoords.q;
        const displayR = hexData.hexCoords.r;
        coordLabel.textContent = `${displayQ},${displayR}`;

        contentDiv.appendChild(coordLabel);

        // Add biome icon or status indicator (not for current region)
        if (isDiscovered && !isCurrent) {
            const icon = document.createElement('span');
            icon.style.cssText = `font-size: 42px; text-shadow: 0 0 10px #000, 0 0 15px #000;`;
            icon.textContent = biome.icon;
            contentDiv.appendChild(icon);
        } else if (isExplorable) {
            const icon = document.createElement('span');
            icon.style.cssText = `font-size: 54px; color: #ffcc00; text-shadow: 0 0 10px #000, 0 0 15px #000;`;
            icon.textContent = '?';
            contentDiv.appendChild(icon);
        }

        // Add animated footsteps for current region during active navigation
        if (isCurrent && GameEngine.state.activeNavigation?.isNavigating) {
            const footstepsContainer = document.createElement('div');
            footstepsContainer.className = 'footsteps-container';
            footstepsContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                gap: 8px;
                font-size: 32px;
                animation: footstepsFade 2s ease-in-out infinite;
            `;

            // Create multiple footsteps with staggered animations
            for (let i = 0; i < 3; i++) {
                const footstep = document.createElement('span');
                footstep.textContent = '👣';
                footstep.style.cssText = `
                    animation: footstepsFade 2s ease-in-out infinite;
                    animation-delay: ${i * 0.4}s;
                    text-shadow: 0 0 8px #64B5F6, 0 0 12px #2196F3;
                `;
                footstepsContainer.appendChild(footstep);
            }

            contentDiv.appendChild(footstepsContainer);
        }

        hexDiv.appendChild(contentDiv);

        // Add hover effects - magnify tile and map underneath
        const originalBoxShadow = hexDiv.style.boxShadow;

        hexDiv.addEventListener('mouseenter', () => {
            if (!this.isDragging) {
                // Magnify the hex tile (scales both tile and map underneath)
                hexDiv.style.transform = 'scale(1.15)';
                // White border with inset fade zone creating a thin transition
                hexDiv.style.boxShadow = `
                    ${glow}${glow !== 'none' ? ', ' : ''}
                    0 0 0 3px rgba(255, 255, 255, 1.0),
                    inset 0 0 15px 5px rgba(255, 255, 255, 0.2),
                    0 0 20px rgba(255, 255, 255, 0.4)
                `.replace(/\s+/g, ' ').trim();
                hexDiv.style.zIndex = '100';
            }
        });

        hexDiv.addEventListener('mouseleave', () => {
            hexDiv.style.transform = 'scale(1)';
            hexDiv.style.boxShadow = originalBoxShadow;
            hexDiv.style.zIndex = 'auto';
        });

        // Add click handler
        hexDiv.addEventListener('click', (e) => {
            if (!this.isDragging) {
                e.stopPropagation();
                this.onHexClick(regionId);
            }
        });

        return hexDiv;
    },

    /**
     * Handle hex click - opens region modal
     */
    onHexClick(regionId) {
        if (typeof openRegionModal === 'function') {
            openRegionModal(regionId);
        } else if (typeof RegionModal !== 'undefined') {
            RegionModal.open(regionId);
        }
    },

    /**
     * Setup zoom and pan controls
     */
    setupZoomPan() {
        if (!this.viewport || !this.mapContent) return;

        // Mouse wheel zoom
        this.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = this.viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoom(delta, mouseX, mouseY);
        }, { passive: false });

        // Mouse drag to pan (can click anywhere, including hex tiles)
        this.viewport.addEventListener('mousedown', (e) => {
            this.startDrag(e);
        });

        this.viewport.addEventListener('mousemove', (e) => {
            this.drag(e);
        });

        this.viewport.addEventListener('mouseup', () => {
            this.stopDrag();
        });

        this.viewport.addEventListener('mouseleave', () => {
            this.stopDrag();
        });
    },

    /**
     * Zoom the map
     */
    zoom(delta, mouseX, mouseY) {
        const oldScale = this.currentScale;
        const newScale = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, this.currentScale + delta)
        );

        if (newScale === oldScale) return;

        // Calculate zoom point in map coordinates
        const mapX = (mouseX - this.currentX) / oldScale;
        const mapY = (mouseY - this.currentY) / oldScale;

        // Update scale
        this.currentScale = newScale;

        // Adjust translation to zoom toward mouse position
        this.currentX = mouseX - mapX * newScale;
        this.currentY = mouseY - mapY * newScale;

        // Constrain pan
        this.constrainPan();

        // Apply transform
        this.applyTransform();
    },

    /**
     * Start dragging
     */
    startDrag(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartTranslateX = this.currentX;
        this.dragStartTranslateY = this.currentY;
        this.viewport.style.cursor = 'grabbing';
    },

    /**
     * Drag the map
     */
    drag(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        this.currentX = this.dragStartTranslateX + deltaX;
        this.currentY = this.dragStartTranslateY + deltaY;

        this.constrainPan();
        this.applyTransform();
    },

    /**
     * Stop dragging
     */
    stopDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.viewport.style.cursor = 'grab';
        }
    },

    /**
     * Constrain panning to map bounds
     */
    constrainPan() {
        const scaledWidth = this.mapWidth * this.currentScale;
        const scaledHeight = this.mapHeight * this.currentScale;

        // If map is smaller than viewport, center it
        if (scaledWidth <= this.viewportWidth) {
            this.currentX = (this.viewportWidth - scaledWidth) / 2;
        } else {
            // Constrain to edges
            const minX = this.viewportWidth - scaledWidth;
            const maxX = 0;
            this.currentX = Math.max(minX, Math.min(maxX, this.currentX));
        }

        if (scaledHeight <= this.viewportHeight) {
            this.currentY = (this.viewportHeight - scaledHeight) / 2;
        } else {
            // Constrain to edges
            const minY = this.viewportHeight - scaledHeight;
            const maxY = 0;
            this.currentY = Math.max(minY, Math.min(maxY, this.currentY));
        }
    },

    /**
     * Apply transform to map content
     */
    applyTransform() {
        if (!this.mapContent) return;

        this.mapContent.style.transform =
            `translate(${this.currentX}px, ${this.currentY}px) scale(${this.currentScale})`;
    },

    /**
     * Center on starting area (region 0,0)
     */
    centerOnStartingArea() {
        // Find starting region (usually 0,0)
        const startingRegion = GameEngine.state.currentRegion || Object.keys(GameEngine.definitions.worldMap)[0];

        if (startingRegion) {
            this.centerOnRegion(startingRegion);
        } else {
            // Just center the map
            this.constrainPan();
            this.applyTransform();
        }
    },

    /**
     * Center on a specific region
     */
    centerOnRegion(regionId) {
        const worldMap = GameEngine.definitions.worldMap;
        const hex = worldMap[regionId];

        if (!hex || !hex.hexCoords) {
            this.constrainPan();
            this.applyTransform();
            return;
        }

        const { q, r } = hex.hexCoords;

        // Get hex position with gap spacing
        const pos = this.getHexPosition(q, r);
        const x = pos.x + (this.hexWidth / 2);
        const y = pos.y + (this.hexHeight / 2);

        // Center on this point
        this.currentX = (this.viewportWidth / 2) - (x * this.currentScale);
        this.currentY = (this.viewportHeight / 2) - (y * this.currentScale);

        this.constrainPan();
        this.applyTransform();
    },

    /**
     * Update the hex grid (call when game state changes)
     */
    update() {
        this.createHexGrid();
    },

    /**
     * Zoom in (button control)
     */
    zoomIn() {
        this.zoom(0.2, this.viewportWidth / 2, this.viewportHeight / 2);
    },

    /**
     * Zoom out (button control)
     */
    zoomOut() {
        this.zoom(-0.2, this.viewportWidth / 2, this.viewportHeight / 2);
    },

    /**
     * Reset zoom and center
     */
    resetView() {
        this.currentScale = this.minZoom;
        this.centerOnStartingArea();
    },

    /**
     * Recalculate on viewport resize
     */
    resize() {
        this.calculateViewportBounds();
        this.calculateMinZoom();
        this.constrainPan();
        this.applyTransform();
    }
};
