/**
 * REGION MODAL SYSTEM
 *
 * Displays detailed region information in a modal when clicking hex tiles.
 * Shows: region name, biome, navigation req, discovered content, available actions.
 */

const RegionModal = {
    isOpen: false,
    currentRegionId: null,

    /**
     * Open the region modal for a specific region
     * @param {string} regionId - Region ID to display
     */
    open(regionId) {
        const hexDef = GameEngine.definitions.worldMap?.[regionId];
        if (!hexDef) {
            console.error(`❌ No hex definition found for region ${regionId}`);
            return;
        }

        this.currentRegionId = regionId;
        this.isOpen = true;

        const modal = document.getElementById('regionModal');
        if (modal) {
            modal.style.display = 'block';
            this.render();
        }
    },

    /**
     * Close the region modal
     */
    close() {
        this.isOpen = false;
        this.currentRegionId = null;

        const modal = document.getElementById('regionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Render the modal content
     */
    render() {
        const container = document.getElementById('regionModalContent');
        if (!container || !this.currentRegionId) return;

        const hexDef = GameEngine.definitions.worldMap[this.currentRegionId];
        const biomeDef = GameEngine.definitions.biomes[hexDef.biome];
        const regionState = GameEngine.state.regions[this.currentRegionId];
        const isCurrentRegion = GameEngine.state.currentRegion === this.currentRegionId;

        // Check if player can travel here
        const canTravel = GameEngine.canTravelToRegion ? GameEngine.canTravelToRegion(this.currentRegionId) : false;
        const meetsNavReq = GameEngine.state.skills.navigation.level >= hexDef.navigationRequirement;

        let html = `
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h2 style="margin: 0; color: ${biomeDef.color};">${hexDef.icon} ${hexDef.name}</h2>
                    <p style="margin: 5px 0 0 0; color: #888; font-size: 0.9em;">${biomeDef.name} Biome</p>
                </div>
                <button class="modal-close" onclick="RegionModal.close()" style="background: none; border: none; font-size: 2em; cursor: pointer; color: #888;">&times;</button>
            </div>

            <div style="display: grid; gap: 15px;">
                <!-- Region Info -->
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">📍 Region Information</h3>
                    <div style="display: grid; gap: 8px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">Coordinates:</span>
                            <span style="color: #fff; font-family: monospace;">${this.currentRegionId}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">Navigation Req:</span>
                            <span style="color: ${meetsNavReq ? '#4caf50' : '#f44336'};">Level ${hexDef.navigationRequirement}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">Complication:</span>
                            <span style="color: #ff9800;">${hexDef.complication}x</span>
                        </div>
                        ${regionState ? `
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #aaa;">Discovery:</span>
                            <span style="color: #4caf50;">${regionState.discoveryProgress.toFixed(1)}%</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Region Actions -->
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                    ${isCurrentRegion ? `
                        <div style="color: #4caf50; font-size: 1.1em; text-align: center; margin-bottom: 12px;">
                            📍 You are here
                        </div>
                        <button onclick="RegionModal.startNavigating()"
                                class="action-btn"
                                style="width: 100%; padding: 12px; background: linear-gradient(135deg, #ff9800, #f57c00); border: none; border-radius: 6px; color: white; font-size: 1em; cursor: pointer; font-weight: bold; margin-bottom: 8px;">
                            🧭 Start Navigating
                        </button>
                    ` : canTravel ? `
                        <button onclick="RegionModal.travelToRegion('${this.currentRegionId}')"
                                class="action-btn"
                                style="width: 100%; padding: 12px; background: linear-gradient(135deg, #4a9eff, #357abd); border: none; border-radius: 6px; color: white; font-size: 1em; cursor: pointer; font-weight: bold; margin-bottom: 8px;">
                            🗺️ Travel Here
                        </button>
                        ${meetsNavReq ? `
                        <button onclick="RegionModal.travelAndNavigate('${this.currentRegionId}')"
                                class="action-btn"
                                style="width: 100%; padding: 12px; background: linear-gradient(135deg, #66bb6a, #43a047); border: none; border-radius: 6px; color: white; font-size: 1em; cursor: pointer; font-weight: bold;">
                            🧭 Travel & Navigate
                        </button>
                        ` : ''}
                    ` : !meetsNavReq ? `
                        <div style="color: #f44336; text-align: center;">
                            🔒 Requires Navigation Level ${hexDef.navigationRequirement}
                        </div>
                    ` : `
                        <div style="color: #ff9800; text-align: center;">
                            🔒 Path not discovered yet
                        </div>
                    `}
                </div>

                <!-- Region Content -->
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">📍 Regional Content</h3>
                    <div style="display: grid; gap: 15px;">
                        ${this.renderRegionNodes(hexDef)}
                        ${this.renderRegionEnemies(hexDef)}
                        ${this.renderRegionMissions(hexDef)}
                        ${regionState ? `
                            <div style="border-top: 1px solid #444; padding-top: 10px;">
                                <h4 style="margin: 0 0 8px 0; color: #4caf50; font-size: 0.9em;">✨ Your Discoveries Here</h4>
                                ${this.renderDiscoveredNodes(this.currentRegionId)}
                                ${this.renderDiscoveredEnemies(this.currentRegionId)}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Adjacent Regions -->
                ${hexDef.adjacent ? `
                <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">🧭 Adjacent Regions</h3>
                    <div style="display: grid; gap: 8px;">
                        ${this.renderAdjacentRegions(hexDef.adjacent, regionState)}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Render region's discoverable nodes
     */
    renderRegionNodes(hexDef) {
        if (!hexDef.discoverableNodes || hexDef.discoverableNodes.length === 0) {
            return '<div style="color: #666; font-size: 0.85em;">No resource nodes in this region</div>';
        }

        let html = '<div><h4 style="margin: 0 0 5px 0; color: #4caf50; font-size: 0.9em;">🌿 Resource Nodes (' + hexDef.discoverableNodes.length + ')</h4>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 4px;">';

        for (let nodeId of hexDef.discoverableNodes) {
            const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
            if (!nodeDef) continue;

            html += `
                <span style="background: rgba(76,175,80,0.2); padding: 3px 8px; border-radius: 3px; font-size: 0.75em; border: 1px solid #4caf50;">
                    ${nodeDef.image} ${nodeDef.name}
                </span>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * Render region's discoverable enemies
     */
    renderRegionEnemies(hexDef) {
        if (!hexDef.discoverableEnemies || hexDef.discoverableEnemies.length === 0) {
            return '<div style="color: #666; font-size: 0.85em;">No enemies in this region</div>';
        }

        let html = '<div><h4 style="margin: 0 0 5px 0; color: #f44336; font-size: 0.9em;">⚔️ Enemies (' + hexDef.discoverableEnemies.length + ')</h4>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 4px;">';

        for (let enemyId of hexDef.discoverableEnemies) {
            const enemyDef = GameEngine.definitions.enemies[enemyId];
            if (!enemyDef) continue;

            html += `
                <span style="background: rgba(244,67,54,0.2); padding: 3px 8px; border-radius: 3px; font-size: 0.75em; border: 1px solid #f44336;">
                    ${enemyDef.image} ${enemyDef.name}
                </span>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * Render region's available missions
     */
    renderRegionMissions(hexDef) {
        if (!hexDef.availableMissions || hexDef.availableMissions.length === 0) {
            return '<div style="color: #666; font-size: 0.85em;">No missions in this region</div>';
        }

        let html = '<div><h4 style="margin: 0 0 5px 0; color: #ff9800; font-size: 0.9em;">📜 Missions (' + hexDef.availableMissions.length + ')</h4>';
        html += '<div style="display: grid; gap: 4px;">';

        for (let missionId of hexDef.availableMissions) {
            const missionDef = GameEngine.definitions.missions[missionId];
            if (!missionDef) continue;

            const isCompleted = GameEngine.state.missions.completed && GameEngine.state.missions.completed.includes(missionId);
            const isActive = GameEngine.state.missions.active && GameEngine.state.missions.active.includes(missionId);

            html += `
                <div style="background: rgba(255,152,0,0.1); padding: 6px 10px; border-radius: 4px; border: 1px solid #ff9800; font-size: 0.8em; display: flex; justify-content: space-between; align-items: center;">
                    <span>${missionDef.name}</span>
                    <span style="color: ${isCompleted ? '#4caf50' : isActive ? '#2196f3' : '#888'};">
                        ${isCompleted ? '✓ Complete' : isActive ? '⏳ Active' : '○ Available'}
                    </span>
                </div>
            `;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * Render discovered nodes in this region
     */
    renderDiscoveredNodes(regionId) {
        if (!GameEngine.state.globalNodes) return '';

        const nodesInRegion = [];
        for (let nodeId in GameEngine.state.globalNodes) {
            const globalNode = GameEngine.state.globalNodes[nodeId];
            if (globalNode.regionContributions && globalNode.regionContributions[regionId]) {
                const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
                if (nodeDef) {
                    nodesInRegion.push({
                        id: nodeId,
                        def: nodeDef,
                        bonus: globalNode.regionContributions[regionId]
                    });
                }
            }
        }

        if (nodesInRegion.length === 0) {
            return '<div style="color: #666; font-style: italic;">No resource nodes discovered yet</div>';
        }

        let html = '<div style="color: #aaa; font-size: 0.9em; margin-bottom: 5px;">Resource Nodes:</div>';
        html += '<div style="display: grid; gap: 5px;">';

        for (let node of nodesInRegion) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                    <span style="color: #fff;">${node.def.image} ${node.def.name}</span>
                    <span style="color: #4caf50; font-size: 0.85em;">+${node.bonus} health</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render discovered enemies in this region
     */
    renderDiscoveredEnemies(regionId) {
        if (!GameEngine.state.globalEnemies) return '';

        const enemiesInRegion = [];
        for (let enemyId in GameEngine.state.globalEnemies) {
            const globalEnemy = GameEngine.state.globalEnemies[enemyId];
            if (globalEnemy.regionContributions && globalEnemy.regionContributions[regionId]) {
                const enemyDef = GameEngine.definitions.enemies[enemyId];
                if (enemyDef) {
                    enemiesInRegion.push({
                        id: enemyId,
                        def: enemyDef,
                        bonus: globalEnemy.regionContributions[regionId]
                    });
                }
            }
        }

        if (enemiesInRegion.length === 0) {
            return '<div style="color: #666; font-style: italic; margin-top: 10px;">No enemies discovered yet</div>';
        }

        let html = '<div style="color: #aaa; font-size: 0.9em; margin: 10px 0 5px 0;">Enemies:</div>';
        html += '<div style="display: grid; gap: 5px;">';

        for (let enemy of enemiesInRegion) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px;">
                    <span style="color: #fff;">${enemy.def.image} ${enemy.def.name}</span>
                    <span style="color: #4caf50; font-size: 0.85em;">+${enemy.bonus} health</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render adjacent regions list
     */
    renderAdjacentRegions(adjacent, regionState) {
        if (!adjacent) return '';

        let html = '';
        for (let direction in adjacent) {
            const adjacentId = adjacent[direction];
            const adjacentHex = GameEngine.definitions.worldMap[adjacentId];
            if (!adjacentHex) continue;

            const isDiscovered = regionState && regionState.discoveredExitPaths && regionState.discoveredExitPaths.includes(adjacentId);

            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <span style="color: #aaa;">${direction}:</span>
                    <span style="color: ${isDiscovered ? '#4caf50' : '#666'};">
                        ${isDiscovered ? '✓' : '🔒'} ${adjacentHex.name}
                    </span>
                </div>
            `;
        }

        return html;
    },

    /**
     * Travel to the region shown in modal
     */
    travelToRegion(regionId) {
        if (!GameEngine.travelToRegion) {
            console.error("❌ travelToRegion function not available");
            return;
        }

        const result = GameEngine.travelToRegion(regionId);
        if (result.success) {
            this.close();
            // Trigger UI update
            if (typeof UI !== 'undefined' && UI.updateAll) {
                UI.updateAll();
            }
        } else {
            alert(result.reason || "Cannot travel to this region");
        }
    },

    /**
     * Start navigating in the current region (from modal)
     */
    startNavigating() {
        if (GameEngine.state.currentRegion !== this.currentRegionId) {
            alert("You must be in this region to start navigating.");
            return;
        }

        // Call the global startNavigating function
        if (typeof startNavigating === 'function') {
            startNavigating();
            this.close();
        } else if (GameEngine.startNavigation) {
            GameEngine.startNavigation();
            this.close();
            if (typeof UI !== 'undefined' && UI.updateAll) {
                UI.updateAll();
            }
        } else {
            console.error("❌ startNavigating function not available");
        }
    },

    /**
     * Travel to a region and immediately start navigating
     */
    travelAndNavigate(regionId) {
        if (!GameEngine.travelToRegion) {
            console.error("❌ travelToRegion function not available");
            return;
        }

        const result = GameEngine.travelToRegion(regionId);
        if (result.success) {
            // After successful travel, start navigating
            if (typeof startNavigating === 'function') {
                startNavigating();
            } else if (GameEngine.startNavigation) {
                GameEngine.startNavigation();
            }
            this.close();
            // Trigger UI update
            if (typeof UI !== 'undefined' && UI.updateAll) {
                UI.updateAll();
            }
        } else {
            alert(result.reason || "Cannot travel to this region");
        }
    },

    /**
     * Update the modal if it's currently open
     */
    update() {
        if (this.isOpen && this.currentRegionId) {
            this.render();
        }
    }
};

// Global function to open region modal (called from hex click)
function openRegionModal(regionId) {
    RegionModal.open(regionId);
}
