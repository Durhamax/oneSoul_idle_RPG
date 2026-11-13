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

        // Guard against a missing icon rendering the literal string "undefined".
        const icon = (hexDef.icon && hexDef.icon !== 'undefined') ? hexDef.icon : '📍';
        const biomeColor = biomeDef?.color || 'var(--color-primary, #4a9eff)';

        let actionsHtml;
        if (isCurrentRegion) {
            actionsHtml = `
                <div class="rm-here">📍 You are here</div>
                <button class="rm-btn rm-btn--navigate" onclick="RegionModal.startNavigating()">🧭 Start Navigating</button>
            `;
        } else if (canTravel) {
            actionsHtml = `
                <button class="rm-btn rm-btn--travel" onclick="RegionModal.travelToRegion('${this.currentRegionId}')">🗺️ Travel Here</button>
                ${meetsNavReq ? `
                <button class="rm-btn rm-btn--go" onclick="RegionModal.travelAndNavigate('${this.currentRegionId}')">🧭 Travel & Navigate</button>
                ` : ''}
            `;
        } else if (!meetsNavReq) {
            actionsHtml = `<div class="rm-locked">🔒 Requires Navigation Level ${hexDef.navigationRequirement}</div>`;
        } else {
            actionsHtml = `<div class="rm-locked rm-locked--warn">🔒 Path not discovered yet</div>`;
        }

        container.innerHTML = `
            <div class="rm-head" style="--biome-color: ${biomeColor};">
                <div class="rm-head-main">
                    <h2 class="rm-title">${icon} ${hexDef.name}</h2>
                    <p class="rm-biome">${biomeDef?.name || 'Unknown'} Biome</p>
                </div>
                <button class="rm-close" onclick="RegionModal.close()" aria-label="Close">&times;</button>
            </div>

            <div class="rm-body">
                <section class="rm-section">
                    <h3 class="rm-section-title">Region Information</h3>
                    <div class="rm-rows">
                        <div class="rm-row"><span class="rm-k">Coordinates</span><span class="rm-v rm-mono">${this.currentRegionId}</span></div>
                        <div class="rm-row"><span class="rm-k">Navigation Req</span><span class="rm-v ${meetsNavReq ? 'is-ok' : 'is-bad'}">Level ${hexDef.navigationRequirement}</span></div>
                        <div class="rm-row"><span class="rm-k">Complication</span><span class="rm-v is-warn">${hexDef.complication}x</span></div>
                        ${regionState ? `<div class="rm-row"><span class="rm-k">Discovery</span><span class="rm-v is-ok">${regionState.discoveryProgress.toFixed(1)}%</span></div>` : ''}
                    </div>
                </section>

                <section class="rm-section rm-actions">${actionsHtml}</section>

                <section class="rm-section">
                    <h3 class="rm-section-title">Regional Content</h3>
                    <div class="rm-groups">
                        ${this.renderRegionNodes(hexDef)}
                        ${this.renderRegionEnemies(hexDef)}
                        ${this.renderRegionMissions(hexDef)}
                        ${regionState ? `
                            <div class="rm-subgroup">
                                <h4 class="rm-sub-title is-ok">✨ Your Discoveries Here</h4>
                                ${this.renderDiscoveredNodes(this.currentRegionId)}
                                ${this.renderDiscoveredEnemies(this.currentRegionId)}
                            </div>
                        ` : ''}
                    </div>
                </section>

                ${hexDef.adjacent ? `
                <section class="rm-section">
                    <h3 class="rm-section-title">Adjacent Regions</h3>
                    <div class="rm-rows">${this.renderAdjacentRegions(hexDef.adjacent, regionState)}</div>
                </section>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render region's discoverable nodes
     */
    renderRegionNodes(hexDef) {
        if (!hexDef.discoverableNodes || hexDef.discoverableNodes.length === 0) {
            return '<div class="rm-empty">No resource nodes in this region</div>';
        }

        let html = '<div class="rm-group"><h4 class="rm-sub-title is-ok">🌿 Resource Nodes (' + hexDef.discoverableNodes.length + ')</h4><div class="rm-tags">';

        for (let nodeId of hexDef.discoverableNodes) {
            const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
            if (!nodeDef) continue;

            html += `<span class="rm-tag rm-tag--node">${nodeDef.image || ''} ${nodeDef.name}</span>`;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * Render region's discoverable enemies
     */
    renderRegionEnemies(hexDef) {
        if (!hexDef.discoverableEnemies || hexDef.discoverableEnemies.length === 0) {
            return '<div class="rm-empty">No enemies in this region</div>';
        }

        let html = '<div class="rm-group"><h4 class="rm-sub-title is-bad">⚔️ Enemies (' + hexDef.discoverableEnemies.length + ')</h4><div class="rm-tags">';

        for (let enemyId of hexDef.discoverableEnemies) {
            const enemyDef = GameEngine.definitions.enemies[enemyId];
            if (!enemyDef) continue;

            html += `<span class="rm-tag rm-tag--enemy">${enemyDef.image || ''} ${enemyDef.name}</span>`;
        }

        html += '</div></div>';
        return html;
    },

    /**
     * Render region's available missions
     */
    renderRegionMissions(hexDef) {
        if (!hexDef.availableMissions || hexDef.availableMissions.length === 0) {
            return '<div class="rm-empty">No missions in this region</div>';
        }

        let html = '<div class="rm-group"><h4 class="rm-sub-title is-warn">📜 Missions (' + hexDef.availableMissions.length + ')</h4><div class="rm-mission-list">';

        for (let missionId of hexDef.availableMissions) {
            const missionDef = GameEngine.definitions.missions[missionId];
            if (!missionDef) continue;

            const isCompleted = GameEngine.state.missions.completed && GameEngine.state.missions.completed.includes(missionId);
            const isActive = GameEngine.state.missions.active && GameEngine.state.missions.active.includes(missionId);
            const statusCls = isCompleted ? 'is-ok' : isActive ? 'is-active' : 'is-muted';

            html += `
                <div class="rm-mission">
                    <span>${missionDef.name}</span>
                    <span class="rm-mission-status ${statusCls}">${isCompleted ? '✓ Complete' : isActive ? '⏳ Active' : '○ Available'}</span>
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
            return '<div class="rm-empty">No resource nodes discovered yet</div>';
        }

        let html = '<div class="rm-disc-label">Resource Nodes</div><div class="rm-disc-list">';

        for (let node of nodesInRegion) {
            html += `
                <div class="rm-disc-row">
                    <span>${node.def.image || ''} ${node.def.name}</span>
                    <span class="is-ok">+${node.bonus} health</span>
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
            return '<div class="rm-empty">No enemies discovered yet</div>';
        }

        let html = '<div class="rm-disc-label">Enemies</div><div class="rm-disc-list">';

        for (let enemy of enemiesInRegion) {
            html += `
                <div class="rm-disc-row">
                    <span>${enemy.def.image || ''} ${enemy.def.name}</span>
                    <span class="is-ok">+${enemy.bonus} health</span>
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
                <div class="rm-row rm-adjacent">
                    <span class="rm-k">${direction}</span>
                    <span class="rm-v ${isDiscovered ? 'is-ok' : 'is-muted'}">${isDiscovered ? '✓' : '🔒'} ${adjacentHex.name}</span>
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
