/**
 * NAVIGATION UI MODULE
 *
 * Handles all navigation-related UI rendering including:
 * - Navigation display
 * - Nodes display and collection
 * - Region displays
 * - Hex map rendering with zoom/pan controls
 * - Discovery system
 */

const NavigationUI = {
    // State caching for preventing unnecessary re-renders
    lastCurrentRegionState: null,
    lastRegionsState: null,
    lastNodesState: null,
    lastActiveNodeId: null,
    lastNavigationState: null,
    worldMapCollapsed: false, // Map always expanded (no collapse option)

    /**
     * Update current region display
     */
    updateCurrentRegion() {
        const container = document.getElementById("currentRegionDisplay");
        const regionId = GameEngine.state.currentRegion;
        const regionState = GameEngine.state.regions[regionId];

        // Create state snapshot
        const currentState = {
            regionId: regionId,
            state: JSON.stringify(regionState)
        };

        // Only re-render if state changed
        if (this.lastCurrentRegionState &&
            this.lastCurrentRegionState.regionId === currentState.regionId &&
            this.lastCurrentRegionState.state === currentState.state) return;

        const regionDef = GameEngine.definitions.regions[regionId];

        if (!regionState || !regionDef) {
            container.innerHTML = "<div style='color: #f88;'>Error: Invalid region</div>";
            return;
        }

        const fogPercent = regionState.fogProgress.toFixed(1);
        const isFullyExplored = regionState.fogProgress >= 100;

        let html = `
            <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 1.2em; color: #4caf50;">${regionDef.name}</div>
                <div style="color: #aaa; font-size: 0.9em; margin-top: 5px;">${regionDef.description}</div>
            </div>

            <div style="margin: 10px 0;">
                <strong>Exploration Progress:</strong>
                <span class="fog-indicator">${fogPercent}%</span>
                <div class="skill-exp-bar" style="margin-top: 5px;">
                    <div class="skill-exp-fill" style="width: ${fogPercent}%; background: linear-gradient(90deg, #2e7d32, #4caf50); transition: width 0.3s ease-out;"></div>
                </div>
            </div>

            <div style="margin: 10px 0;">
                <strong>Gathering Skills Available:</strong><br>
                <span style="color: #4a9eff;">
                    ${Object.keys(regionDef.gatheringNodes || {}).map(skill => {
                        const skillDef = GameEngine.definitions.skills[skill];
                        return skillDef ? skillDef.name : skill;
                    }).join(", ") || "None"}
                </span>
            </div>
        `;

        // Show gathering nodes summary
        if (regionDef.gatheringNodes) {
            html += `<div style="margin: 10px 0;"><strong>Gathering Nodes:</strong>`;
            for (let skill in regionDef.gatheringNodes) {
                const nodeIds = regionDef.gatheringNodes[skill];
                const skillDef = GameEngine.definitions.skills[skill];
                const skillName = skillDef ? skillDef.name : skill;
                html += `<div class="discovery" style="font-size: 0.85em;">${this.getSkillIcon(skill)} ${skillName}: ${nodeIds.length} node(s)</div>`;
            }
            html += `</div>`;
        }

        // Show discovered locations
        if (regionState.discoveredLocations.length > 0) {
            html += `<div style="margin: 10px 0;"><strong>Locations:</strong>`;
            for (let locationId of regionState.discoveredLocations) {
                const location = regionDef.locations.find(l => l.id === locationId);
                if (location) {
                    html += `<div class="discovery">📍 ${location.name}</div>`;
                }
            }
            html += `</div>`;
        }

        container.innerHTML = html;
        this.lastCurrentRegionState = currentState;
    },

    /**
     * Update regions list
     */
    updateRegions() {
        const container = document.getElementById("regionsDisplay");
        const currentRegion = GameEngine.state.currentRegion;
        const regions = GameEngine.state.regions;

        // Create state snapshot
        const currentState = {
            currentRegion: currentRegion,
            regions: JSON.stringify(regions),
            navLevel: GameEngine.state.skills.navigation.level
        };

        // Only re-render if state changed
        if (this.lastRegionsState &&
            this.lastRegionsState.currentRegion === currentState.currentRegion &&
            this.lastRegionsState.regions === currentState.regions &&
            this.lastRegionsState.navLevel === currentState.navLevel) return;

        const regionDefs = GameEngine.definitions.regions;
        let html = "";

        for (let regionId in regionDefs) {
            const regionDef = regionDefs[regionId];
            const regionState = regions[regionId];

            if (!regionState || !regionState.discovered) {
                continue;  // Don't show undiscovered regions
            }

            const isActive = regionId === currentRegion;
            const canTravel = GameEngine.state.skills.navigation.level >= regionDef.navigationRequirement;
            const fogPercent = regionState.fogProgress.toFixed(0);

            html += `
                <button
                    class="region-button ${isActive ? 'active' : ''}"
                    onclick="travelToRegion('${regionId}')"
                    ${isActive || !canTravel ? 'disabled' : ''}
                >
                    <div style="font-weight: bold;">${regionDef.name} ${isActive ? '(Current)' : ''}</div>
                    <div class="region-info">
                        ${Object.keys(regionDef.gatheringNodes || {}).map(skill => this.getSkillIcon(skill)).join(" ")}
                        <span class="fog-indicator">${fogPercent}% explored</span>
                    </div>
                    ${!canTravel ? `<div style="color: #f88; font-size: 0.75em; margin-top: 3px;">Requires Navigation ${regionDef.navigationRequirement}</div>` : ''}
                </button>
            `;
        }

        if (html === "") {
            html = "<div style='color: #888;'>No regions discovered yet...</div>";
        }

        container.innerHTML = html;
        this.lastRegionsState = currentState;
    },

    /**
     * Update nodes display
     */
    updateNodes() {
        const nodeCollection = GameEngine.state.nodeCollection;

        // Create state snapshot - only track nodeId, not health (to prevent constant re-renders)
        const currentState = {
            selectedSkill: nodeCollection.selectedSkill,
            activeNodeId: nodeCollection.activeNode ? nodeCollection.activeNode.nodeId : null
        };

        // Check if we need to re-render the node selection grid
        const needsGridUpdate = !this.lastNodesState ||
            this.lastNodesState.selectedSkill !== currentState.selectedSkill ||
            this.lastNodesState.activeNodeId !== currentState.activeNodeId;

        // Update title if skill changed
        if (!this.lastNodesState || this.lastNodesState.selectedSkill !== currentState.selectedSkill) {
            const titleEl = document.getElementById("nodesViewTitle");
            if (titleEl && nodeCollection.selectedSkill) {
                const skillName = GameEngine.definitions.skills[nodeCollection.selectedSkill].name;
                const icon = this.getSkillIcon(nodeCollection.selectedSkill);
                titleEl.textContent = `${icon} ${skillName} Nodes`;
            }
        }

        // Always update active node display (shows health bar)
        this.updateActiveNodeDisplay();

        // Only update available nodes if selection changed
        if (needsGridUpdate) {
            this.updateNodesDisplay();
        }

        this.lastNodesState = currentState;
    },

    /**
     * Update active node harvesting display
     */
    updateActiveNodeDisplay() {
        const container = document.getElementById("activeNodeDisplay");
        if (!container) return;

        const activeNode = GameEngine.state.nodeCollection.activeNode;

        if (!activeNode) {
            container.innerHTML = "";
            this.lastActiveNodeId = null;
            return;
        }

        const nodeDef = GameEngine.definitions.resourceNodes[activeNode.nodeId];
        const nodeState = GameEngine.getNodeStateInRegion(activeNode.nodeId);

        if (!nodeDef || !nodeState) {
            container.innerHTML = "";
            return;
        }

        // Only rebuild HTML if node changed
        if (this.lastActiveNodeId !== activeNode.nodeId) {
            let html = `
                <div style="padding: 15px; background: #2a2a3a; border-radius: 4px; border: 2px solid #4a9eff;">
                    <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 10px;">
                        ${nodeDef.image} Harvesting: ${nodeDef.name}
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Harvests Remaining:</strong>
                        <div class="health-bar">
                            <div class="health-bar-fill" id="nodeHarvestsFill" style="width: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); transition: width 0.3s ease-out;"></div>
                            <div class="health-bar-text" id="nodeHarvestsText">0/0</div>
                        </div>
                    </div>
                    <div style="margin: 10px 0;">
                        <strong id="harvestProgressLabel">Harvest Progress:</strong>
                        <div class="health-bar">
                            <div class="health-bar-fill" id="harvestIntervalBar" style="width: 0%; background: linear-gradient(90deg, #2196F3, #03A9F4); transition: width 0.3s ease-out;"></div>
                            <div class="health-bar-text" id="harvestIntervalText">Ready</div>
                        </div>
                    </div>
                    <div style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                        ⏱️ Harvest time: ${(nodeDef.harvestTime / 1000).toFixed(1)}s
                    </div>
                    <button onclick="stopNodeHarvesting()" style="margin-top: 10px; width: 100%;">
                        ⏹️ Stop Harvesting
                    </button>
                </div>
            `;
            container.innerHTML = html;
            this.lastActiveNodeId = activeNode.nodeId;
        }

        // Always update progress bars
        const harvestsPercent = (nodeState.harvestsRemaining / nodeState.maxHarvests) * 100;
        const harvestsFill = document.getElementById("nodeHarvestsFill");
        const harvestsText = document.getElementById("nodeHarvestsText");

        if (harvestsFill) {
            harvestsFill.style.width = `${harvestsPercent}%`;
        }
        if (harvestsText) {
            harvestsText.textContent = `${nodeState.harvestsRemaining}/${nodeState.maxHarvests}`;
        }

        // Update harvest/respawn interval bar
        const now = Date.now();
        const intervalBar = document.getElementById("harvestIntervalBar");
        const intervalText = document.getElementById("harvestIntervalText");
        const progressLabel = document.getElementById("harvestProgressLabel");

        if (intervalBar && intervalText) {
            // Check if waiting for respawn
            if (activeNode.waitingForRespawn) {
                // Show respawn progress
                const elapsed = now - (nodeState.depletedAt || now);
                const progress = Math.min(100, (elapsed / nodeState.respawnTime) * 100);

                // Change bar color to orange for respawn
                intervalBar.style.background = "linear-gradient(90deg, #FF9800, #FFC107)";
                ProgressBar.applyProgressWithReset(intervalBar, progress, this.lastHarvestProgress || 0);
                this.lastHarvestProgress = progress;

                const remaining = Math.max(0, (nodeState.respawnTime - elapsed) / 1000);
                intervalText.textContent = remaining > 0 ? `Respawning ${remaining.toFixed(1)}s` : "Respawned!";

                // Update label
                if (progressLabel) {
                    progressLabel.textContent = "Respawn Progress:";
                }
            } else {
                // Show harvest progress
                const elapsed = now - activeNode.startTime;
                const progress = Math.min(100, (elapsed / activeNode.harvestTime) * 100);

                // Use blue color for harvesting
                intervalBar.style.background = "linear-gradient(90deg, #2196F3, #03A9F4)";
                ProgressBar.applyProgressWithReset(intervalBar, progress, this.lastHarvestProgress || 0);
                this.lastHarvestProgress = progress;

                const remaining = Math.max(0, (activeNode.harvestTime - elapsed) / 1000);
                intervalText.textContent = remaining > 0 ? `${remaining.toFixed(1)}s` : "Harvesting!";

                // Update label
                if (progressLabel) {
                    progressLabel.textContent = "Harvest Progress:";
                }
            }
        }
    },

    /**
     * Update available nodes display
     */
    updateNodesDisplay() {
        const container = document.getElementById("nodesDisplay");
        if (!container) return;

        const selectedSkill = GameEngine.state.nodeCollection.selectedSkill;

        if (!selectedSkill) {
            container.innerHTML = '<div style="color: #888;">Select a skill from the Skills view to see available nodes.</div>';
            return;
        }

        const nodes = GameEngine.getAvailableNodesForSkill();
        const activeNodeId = GameEngine.state.nodeCollection.activeNode?.nodeId;

        // Show current region
        const currentRegion = GameEngine.state.currentRegion;
        const hexDef = GameEngine.definitions.worldMap?.[currentRegion];
        const regionName = hexDef?.name || currentRegion;

        // Build HTML starting with skill header
        let html = '';

        // Add skill header if UIComponents is available
        if (UIComponents) {
            const skillTheme = UIComponents.getSkillTheme(selectedSkill);
            const skillDef = GameEngine.definitions.skills[selectedSkill];
            const skillIcon = this.getSkillIcon(selectedSkill);

            html += UIComponents.renderSkillHeader({
                skillId: selectedSkill,
                icon: skillIcon,
                displayName: skillDef?.name || Formatting.capitalizeFirst(selectedSkill),
                color: skillTheme.color,
                bgGradient: skillTheme.bgGradient,
                borderColor: skillTheme.borderColor,
                barGradient: skillTheme.barGradient
            });
        }

        if (nodes.length === 0) {
            html += `
                <div style="margin-bottom: 15px; padding: 10px; background: #2a2a2a; border-radius: 5px;">
                    <strong>Current Region:</strong> ${regionName}
                </div>
                <div style="color: #888;">No nodes available for this skill in ${regionName}.</div>
            `;
            container.innerHTML = html;
            return;
        }

        html += `
            <div style="margin-bottom: 15px; padding: 10px; background: #2a2a2a; border-radius: 5px;">
                <strong>Current Region:</strong> ${regionName}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
        `;

        for (let nodeData of nodes) {
            const def = nodeData.definition;
            const state = nodeData.state;
            const isLocked = nodeData.locked;
            const isActive = activeNodeId === nodeData.nodeId;

            // Tier stars
            const tierStars = '⭐'.repeat(def.tier);

            // Availability status
            const isDepleted = state && state.harvestsRemaining <= 0;
            let statusColor = '#4caf50'; // Available
            if (isDepleted) statusColor = '#f44336'; // Depleted
            else if (isLocked) statusColor = '#888'; // Locked

            // Respawn timer if depleted
            let availabilityText = '';
            if (isDepleted && state.depletedAt) {
                const timeUntilRespawn = Math.max(0, Math.ceil((state.depletedAt + state.respawnTime - Date.now()) / 1000));
                availabilityText = `<span style="color: #f44336;">⏳ Respawns in ${timeUntilRespawn}s</span>`;
            } else if (state) {
                availabilityText = `<span style="color: ${statusColor};">${state.harvestsRemaining}/${state.maxHarvests} harvests</span>`;
            }

            html += `
                <div class="panel" style="padding: 15px; ${isLocked ? 'opacity: 0.5;' : ''} ${isActive ? 'border: 2px solid #4a9eff;' : ''} ${isDepleted ? 'opacity: 0.7;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-size: 0.8em; color: #ff9800;">${tierStars}</div>
                        <div style="font-size: 0.75em; color: #888;">Lv.${def.skillLevel}</div>
                    </div>
                    <div style="font-size: 1.8em; text-align: center; margin-bottom: 8px;">${def.image}</div>
                    <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">${def.name}</div>
                    <div style="font-size: 0.8em; color: #aaa; text-align: center; margin-bottom: 10px;">${def.description}</div>

                    <div style="font-size: 0.8em; margin-bottom: 8px; text-align: center;">
                        ${availabilityText}
                    </div>

                    <div style="font-size: 0.75em; color: #888; margin-bottom: 8px; text-align: center;">
                        ⏱️ ${(def.harvestTime / 1000).toFixed(1)}s per harvest
                    </div>

                    <div style="font-size: 0.75em; margin-bottom: 8px;">
                        <div style="color: #4caf50; font-weight: bold; margin-bottom: 3px;">Normal Loot:</div>
                        ${this.formatNormalLoot(def.normalLoot)}
                    </div>

                    <div style="font-size: 0.75em; margin-bottom: 10px;">
                        <div style="color: #ff9800; font-weight: bold; margin-bottom: 3px;">Rare Drops:</div>
                        ${this.formatRareLoot(def.rareLoot)}
                    </div>

                    ${isActive ?
                        '<div style="color: #4a9eff; font-weight: bold; text-align: center;">✅ HARVESTING</div>' :
                        isDepleted ?
                        '<button disabled style="width: 100%; opacity: 0.5;">⏳ Depleted</button>' :
                        `<button onclick="startNodeHarvesting('${nodeData.nodeId}')" ${isLocked ? 'disabled' : ''} style="width: 100%;">
                            ${isLocked ? '🔒 Locked' : '▶️ Start Harvesting'}
                        </button>`
                    }
                </div>
            `;
        }

        html += '</div>'; // Close grid
        container.innerHTML = html;
    },

    /**
     * Format normal loot for display (weight-based)
     */
    formatNormalLoot(normalLoot) {
        if (!normalLoot || normalLoot.length === 0) return '<div style="color: #888;">None</div>';

        let html = '';
        const totalWeight = normalLoot.reduce((sum, entry) => sum + entry.weight, 0);

        for (let entry of normalLoot) {
            const itemName = GameEngine.definitions.items[entry.itemId]?.name || entry.itemId;
            const chance = Math.round((entry.weight / totalWeight) * 100);
            html += `<div style="margin-bottom: 2px;">• ${entry.min}-${entry.max} ${itemName} <span style="color: #888;">(${chance}%)</span></div>`;
        }
        return html;
    },

    /**
     * Format rare loot for display (chance-based)
     */
    formatRareLoot(rareLoot) {
        if (!rareLoot || rareLoot.length === 0) return '<div style="color: #888;">None</div>';

        let html = '';
        for (let entry of rareLoot) {
            const itemName = GameEngine.definitions.items[entry.itemId]?.name || entry.itemId;
            const itemDef = GameEngine.definitions.items[entry.itemId];
            const chance = (entry.chance * 100).toFixed(1);
            const rarityColor = itemDef?.rarity === 'legendary' ? '#9c27b0' : itemDef?.rarity === 'epic' ? '#ff9800' : '#4a9eff';
            html += `<div style="margin-bottom: 2px; color: ${rarityColor};">✨ ${itemName} <span style="color: #888;">(${chance}%)</span></div>`;
        }
        return html;
    },

    /**
     * Format node rewards for display (LEGACY - for old node structure)
     */
    formatNodeRewards(rewards) {
        let html = '';
        for (let reward of rewards) {
            const chancePercent = Math.round(reward.chance * 100);

            if (reward.exp) {
                // EXP reward
                for (let skillId in reward.exp) {
                    html += `<div style="font-size: 0.8em; color: #aaffaa;">+${reward.exp[skillId]} ${skillId} EXP (${chancePercent}%)</div>`;
                }
            } else if (reward.itemId) {
                // Item reward
                const itemName = GameEngine.definitions.items[reward.itemId]?.name || reward.itemId;
                html += `<div style="font-size: 0.8em;">${reward.min}-${reward.max} ${itemName} (${chancePercent}%)</div>`;
            }
        }
        return html;
    },

    /**
     * Update navigation display
     */
    updateNavigation() {
        const container = document.getElementById("navigationDisplay");

        if (!container) {
            return;
        }

        const state = GameEngine.state;
        const regionId = state.currentRegion;
        const regionState = state.regions[regionId];
        const activeNav = state.activeNavigation;
        const hexDef = GameEngine.definitions.worldMap[regionId];
        const biomeDef = GameEngine.definitions.biomes[hexDef?.biome];

        // Safety check - if data not loaded, show error
        if (!hexDef || !biomeDef || !regionState || !activeNav) {
            container.innerHTML = `
                <div style="color: #ff9800; padding: 20px;">
                    <h3>⚠️ Navigation System Initializing...</h3>
                    <p>Current Region ID: ${regionId}</p>
                    <p>World Map Generated: ${GameEngine.definitions.worldMap ? `✓ (${Object.keys(GameEngine.definitions.worldMap).length} regions)` : '✗'}</p>
                    <p>Region Definition: ${hexDef ? '✓' : '✗ (not found in worldMap)'}</p>
                    <p>Biome Data: ${biomeDef ? '✓' : `✗ (biome: ${hexDef?.biome})`}</p>
                    <p>Region State: ${regionState ? '✓' : '✗ (not in state.regions)'}</p>
                    <p>Active Navigation: ${activeNav ? '✓' : '✗'}</p>
                    <p style="margin-top: 15px; font-size: 0.9em; color: #888;">
                        If this persists, try refreshing the page or resetting your save.
                    </p>
                </div>
            `;
            console.error('Navigation initialization failed:', {
                regionId,
                hexDef,
                biomeDef,
                regionState,
                activeNav,
                worldMapKeys: GameEngine.definitions.worldMap ? Object.keys(GameEngine.definitions.worldMap).slice(0, 5) : 'null'
            });
            return;
        }

        // Create state snapshot - only track things that affect map display or major UI changes
        const currentState = {
            regionId: regionId,
            isNavigating: activeNav.isNavigating,
            currentActivity: state.currentActivity,
            discoveredPaths: JSON.stringify(regionState.discoveredExitPaths)
            // Removed: isRecovering (progress bar state, doesn't require full rebuild)
            // Removed: discoveredNodes, discoveredStations (shown in Nodes tab, not map)
            // Removed: navigationLevel, navigationExp (don't affect map display)
        };

        // Only re-render if state changed, but always update progress bars
        if (this.lastNavigationState && JSON.stringify(this.lastNavigationState) === JSON.stringify(currentState)) {
            this.updateNavigationProgressBars();
            return;
        }

        const stats = GameEngine.getNavigationStats();
        const endurancePercent = (activeNav.endurance / activeNav.maxEndurance) * 100;
        const isNavigating = activeNav.isNavigating && state.currentActivity === 'navigation';
        const isRecovering = activeNav.isRecovering || false;
        const hasOtherActivity = state.currentActivity !== null && state.currentActivity !== 'navigation';

        let html = '';

        html += `
            <!-- Hex Grid Map -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                    <h3 style="margin: 0;">🗺️ World Map</h3>
                </div>
                <!-- Integrated Map Container (map + hex grid) -->
                <div id="hexMapContainer" style="border: 2px solid rgba(0, 217, 255, 0.3);"></div>

                <div style="margin-top: 10px; font-size: 0.85em; color: #888; text-align: center;">
                    <span style="margin: 0 10px;">📍 Click a hex to view region details</span>
                    <span style="margin: 0 10px;">🖱️ Scroll to zoom • Drag map to pan</span>
                </div>
            </div>

            <!-- Endurance Bar -->
            <div style="background: #2a2a2a; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px;">
                <div id="navigationEnduranceLabel" style="margin-bottom: 5px; font-size: 0.9em; font-weight: bold;">
                    ${isRecovering ? '💤 Resting' : '💪 Endurance'}
                </div>
                <div class="health-bar" style="margin-bottom: 5px;">
                    <div class="health-bar-fill" id="navigationHealthBar" style="width: ${endurancePercent}%; background: linear-gradient(90deg, ${isRecovering ? '#FFC107, #FF9800' : '#4caf50, #8bc34a'}); transition: width 0.3s ease-out;"></div>
                    <div class="health-bar-text" id="navigationHealthText">${Math.floor(activeNav.endurance)}/${activeNav.maxEndurance}</div>
                </div>
                <div id="navigationEnduranceDesc" style="font-size: 0.75em; color: #888;">
                    ${isRecovering ? '💤 Recovering endurance (consuming rest resources)' : isNavigating ? '⚡ Draining while exploring' : '🛑 Paused'}
                </div>
            </div>

            <!-- Navigation Action Interval Bar -->
            <div style="background: #2a2a2a; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px;">
                <div id="navigationIntervalLabel" style="margin-bottom: 5px; font-size: 0.9em; font-weight: bold;">
                    ${isRecovering ? '💤 Recovery Mode' : isNavigating ? '🧭 Discovery Progress' : '🧭 Navigation Action'}
                </div>
                <div class="health-bar" style="margin-bottom: 8px;">
                    <div class="health-bar-fill" id="navigationIntervalBar" style="width: 0%; background: linear-gradient(90deg, #2196F3, #64B5F6); transition: width 0.3s ease-out;"></div>
                    <div class="health-bar-text" id="navigationIntervalText">${isRecovering ? 'Resting' : isNavigating ? '0.0s' : 'Not Exploring'}</div>
                </div>
                <div id="navigationIntervalDesc" style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
                ${isRecovering ? 'Resting to recover endurance - Discovery paused' : isNavigating ? `Making discoveries every ${(stats.discoveryInterval / 1000).toFixed(1)}s (${stats.discoveryChance.toFixed(1)}% chance)` : 'Click Start Exploring to discover resources and enemies in this region'}
                </div>
                <button onclick="${isNavigating ? 'stopNavigating()' : 'startNavigating()'}"
                        style="width: 100%; background: ${isNavigating ? '#d32f2f' : '#4a9eff'}; margin-top: 5px;">
                    ${isNavigating ? '⏹️ Stop Exploring' : '🧭 Start Exploring'}
                </button>
            </div>

            <!-- Rest Resource Consumption Bar -->
            <div style="background: #2a2a2a; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 5px; font-size: 0.9em; font-weight: bold;">🔥 Rest Resources</div>
                <div class="health-bar" style="margin-bottom: 8px;">
                    <div class="health-bar-fill" id="restIntervalBar" style="width: 0%; background: linear-gradient(90deg, #FF9800, #d32f2f); transition: width 0.3s ease-out;"></div>
                    <div class="health-bar-text" id="restIntervalText">${isRecovering ? '6.0s' : 'Not Active'}</div>
                </div>
                <div style="font-size: 0.75em; color: #888;">
                    ${isRecovering ? '💤 Consuming 1 food + 1 log every 6 seconds during recovery' : isNavigating ? '⚡ No consumption while exploring' : 'Resources consumed during recovery mode'}
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.lastNavigationState = currentState;

        // Re-initialize map grid system after DOM update (since innerHTML destroys the canvas)
        if (typeof MapGridSystem !== 'undefined') {
            setTimeout(() => {
                if (document.getElementById('hexMapContainer')) {
                    MapGridSystem.init('hexMapContainer');
                }
            }, 50);
        }

        // Update navigation progress bars if navigating
        this.updateNavigationProgressBars();
    },

    /**
     * Update navigation progress bars (endurance and interval)
     */
    updateNavigationProgressBars() {
        const activeNav = GameEngine.state.activeNavigation;
        if (!activeNav) return;

        const isNavigating = activeNav.isNavigating && GameEngine.state.currentActivity === 'navigation';
        const isRecovering = activeNav.isRecovering || false;

        // Always update endurance bar (whether navigating or not)
        const healthBar = document.getElementById("navigationHealthBar");
        const healthText = document.getElementById("navigationHealthText");
        const enduranceLabel = document.getElementById("navigationEnduranceLabel");
        const enduranceDesc = document.getElementById("navigationEnduranceDesc");

        if (healthBar && healthText) {
            const endurancePercent = (activeNav.endurance / activeNav.maxEndurance) * 100;
            healthBar.style.width = `${endurancePercent}%`;
            healthText.textContent = `${Math.max(0, Math.floor(activeNav.endurance))}/${activeNav.maxEndurance}`;

            // Update color based on recovery state
            healthBar.style.background = isRecovering
                ? 'linear-gradient(90deg, #FFC107, #FF9800)'
                : 'linear-gradient(90deg, #4caf50, #8bc34a)';
        }

        // Update endurance label and description based on recovery state
        if (enduranceLabel) {
            enduranceLabel.textContent = isRecovering ? '💤 Resting' : '💪 Endurance';
        }
        if (enduranceDesc) {
            enduranceDesc.textContent = isRecovering
                ? '💤 Recovering endurance (consuming rest resources)'
                : isNavigating ? '⚡ Draining while exploring' : '🛑 Paused';
        }

        // Update interval label and description
        const intervalLabel = document.getElementById("navigationIntervalLabel");
        const intervalDesc = document.getElementById("navigationIntervalDesc");

        if (intervalLabel) {
            intervalLabel.textContent = isRecovering
                ? '💤 Recovery Mode'
                : isNavigating ? '🧭 Discovery Progress' : '🧭 Navigation Action';
        }
        if (intervalDesc) {
            const stats = GameEngine.getNavigationStats();
            intervalDesc.textContent = isRecovering
                ? 'Resting to recover endurance - Discovery paused'
                : isNavigating
                    ? `Making discoveries every ${(stats.discoveryInterval / 1000).toFixed(1)}s (${stats.discoveryChance.toFixed(1)}% chance)`
                    : 'Click Start Exploring to discover resources and enemies in this region';
        }

        // Only update interval and rest bars if navigating
        if (!isNavigating) {
            // Reset interval bar when not navigating
            const intervalBar = document.getElementById("navigationIntervalBar");
            const intervalText = document.getElementById("navigationIntervalText");
            if (intervalBar && intervalText) {
                intervalBar.style.width = "0%";
                intervalText.textContent = "Not Exploring";
            }

            // Reset rest bar when not navigating
            const restBar = document.getElementById("restIntervalBar");
            const restText = document.getElementById("restIntervalText");
            if (restBar && restText) {
                restBar.style.width = "0%";
                restText.textContent = "Not Active";
            }
            return;
        }

        // Update interval bar (when navigating)
        const stats = GameEngine.getNavigationStats();
        const lastTick = activeNav.lastNavigationTick;
        const nextTick = lastTick + stats.discoveryInterval;
        const progress = ProgressBar.calculateIntervalProgress(lastTick, nextTick);

        const intervalBar = document.getElementById("navigationIntervalBar");
        const intervalText = document.getElementById("navigationIntervalText");

        if (intervalBar && intervalText) {
            // Apply progress with reset logic
            ProgressBar.applyProgressWithReset(intervalBar, progress, this.lastNavProgress || 0);
            this.lastNavProgress = progress;

            const remaining = Math.max(0, Math.ceil((nextTick - Date.now()) / 100) / 10);
            intervalText.textContent = remaining > 0 ? `${remaining.toFixed(1)}s` : "Discovering!";
        }

        // Update rest resource consumption bar (when navigating)
        const CONSUMPTION_INTERVAL = 6000; // 6 seconds
        const now = Date.now();
        const lastRestConsumption = activeNav.lastRestConsumption || now;
        const nextRestConsumption = lastRestConsumption + CONSUMPTION_INTERVAL;
        const restProgress = ProgressBar.calculateIntervalProgress(lastRestConsumption, nextRestConsumption);

        const restBar = document.getElementById("restIntervalBar");
        const restText = document.getElementById("restIntervalText");
        if (restBar && restText) {
            restBar.style.width = restProgress.percent + "%";
            restText.textContent = restProgress.remaining > 0 ? `${restProgress.remaining.toFixed(1)}s` : "Consuming...";
        }
    },

    /**
     * Render rest resources (food and logs)
     */
    renderRestResources() {
        if (!GameEngine.getRestResourceCounts) {
            return '<div style="color: #888; font-size: 0.85em;">Rest system loading...</div>';
        }

        const { food, logs } = GameEngine.getRestResourceCounts();
        const isNavigating = GameEngine.state.activeNavigation?.isNavigating && GameEngine.state.currentActivity === 'navigation';

        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                <div style="background: rgba(255,152,0,0.1); padding: 10px; border-radius: 5px; border: 1px solid #FF9800;">
                    <div style="font-weight: bold; color: #FF9800;">🍖 Food</div>
                    <div style="font-size: 1.2em; margin-top: 5px;">${food}</div>
                    <div style="font-size: 0.75em; color: #888; margin-top: 3px;">-1 every 6s while exploring</div>
                </div>
                <div style="background: rgba(139,69,19,0.1); padding: 10px; border-radius: 5px; border: 1px solid #8B4513;">
                    <div style="font-weight: bold; color: #D2691E;">🪵 Logs</div>
                    <div style="font-size: 1.2em; margin-top: 5px;">${logs}</div>
                    <div style="font-size: 0.75em; color: #888; margin-top: 3px;">-1 every 6s while exploring</div>
                </div>
            </div>
            ${isNavigating && (food === 0 || logs === 0) ? `
                <div style="margin-top: 10px; padding: 8px; background: rgba(244,67,54,0.2); border: 1px solid #f44336; border-radius: 4px; font-size: 0.85em; color: #ff6666;">
                    ⚠️ Running low on supplies! Exploration will stop when resources run out.
                </div>
            ` : ''}
        `;
    },

    /**
     * Render global discoveries (nodes and enemies)
     */
    renderGlobalDiscoveries() {
        const globalNodes = GameEngine.state.globalNodes || {};
        const globalEnemies = GameEngine.state.globalEnemies || {};

        const discoveredNodes = Object.keys(globalNodes).filter(id => globalNodes[id].discovered);
        const discoveredEnemies = Object.keys(globalEnemies).filter(id => globalEnemies[id].discovered);

        if (discoveredNodes.length === 0 && discoveredEnemies.length === 0) {
            return '<div style="color: #888; font-size: 0.9em;">No discoveries yet. Start exploring to find resources and enemies!</div>';
        }

        let html = '<div style="display: grid; gap: 15px;">';

        // Render discovered nodes
        if (discoveredNodes.length > 0) {
            html += '<div>';
            html += '<h4 style="margin: 0 0 8px 0; color: #4caf50;">🌿 Resource Nodes (' + discoveredNodes.length + ')</h4>';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">';

            for (let nodeId of discoveredNodes) {
                const globalNode = globalNodes[nodeId];
                const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
                if (!nodeDef) continue;

                const regionCount = Object.keys(globalNode.regionContributions || {}).length;
                const totalHealth = GameEngine.getGlobalNodeHealth ? GameEngine.getGlobalNodeHealth(nodeId) : 0;

                html += `
                    <div style="background: rgba(76,175,80,0.1); padding: 8px; border-radius: 4px; border: 1px solid #4caf50;">
                        <div style="font-weight: bold; font-size: 0.9em;">${nodeDef.image} ${nodeDef.name}</div>
                        <div style="font-size: 0.75em; color: #aaa; margin-top: 3px;">
                            ${regionCount} region${regionCount !== 1 ? 's' : ''} | ${totalHealth} harvests
                        </div>
                    </div>
                `;
            }

            html += '</div></div>';
        }

        // Render discovered enemies
        if (discoveredEnemies.length > 0) {
            html += '<div>';
            html += '<h4 style="margin: 0 0 8px 0; color: #f44336;">⚔️ Enemies (' + discoveredEnemies.length + ')</h4>';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">';

            for (let enemyId of discoveredEnemies) {
                const globalEnemy = globalEnemies[enemyId];
                const enemyDef = GameEngine.definitions.enemies[enemyId];
                if (!enemyDef) continue;

                const regionCount = Object.keys(globalEnemy.regionContributions || {}).length;
                const totalHealth = GameEngine.getGlobalEnemyHealth ? GameEngine.getGlobalEnemyHealth(enemyId) : 0;

                html += `
                    <div style="background: rgba(244,67,54,0.1); padding: 8px; border-radius: 4px; border: 1px solid #f44336; cursor: pointer;"
                         onclick="selectEnemy('${enemyId}')"
                         onmouseenter="this.style.borderColor='#ff6666'"
                         onmouseleave="this.style.borderColor='#f44336'">
                        <div style="font-weight: bold; font-size: 0.9em;">${enemyDef.image} ${enemyDef.name}</div>
                        <div style="font-size: 0.75em; color: #aaa; margin-top: 3px;">
                            ${regionCount} region${regionCount !== 1 ? 's' : ''} | ${totalHealth} HP
                        </div>
                    </div>
                `;
            }

            html += '</div></div>';
        }

        html += '</div>';
        return html;
    },

    /**
     * Render discovered nodes for navigation view (LEGACY - kept for compatibility)
     */
    renderDiscoveredNodes(regionState, biomeDef) {
        if (!regionState.discoveredNodeTypes || regionState.discoveredNodeTypes.length === 0) {
            return '<div style="color: #888; font-size: 0.9em;">No resource nodes discovered yet. Start exploring!</div>';
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';

        for (let nodeId of regionState.discoveredNodeTypes) {
            const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
            if (!nodeDef) continue;

            // Get node state in this region (with fallback if function doesn't exist)
            let nodeState = null;
            if (GameEngine.getNodeStateInRegion) {
                nodeState = GameEngine.getNodeStateInRegion(nodeId);
            }

            // Check if player can collect this node
            const playerSkillLevel = GameEngine.state.skills[nodeDef.skill]?.level || 0;
            const canCollect = playerSkillLevel >= nodeDef.skillLevel;
            const isActive = GameEngine.state.nodeCollection.activeNode?.nodeId === nodeId;

            // Check if depleted
            const isDepleted = nodeState && nodeState.harvestsRemaining <= 0;

            html += `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid ${isActive ? '#4a9eff' : '#444'}; cursor: ${canCollect && !isDepleted ? 'pointer' : 'default'}; position: relative; ${isDepleted ? 'opacity: 0.6;' : ''}"
                     ${canCollect && !isDepleted ? `onclick="startHarvestingFromNavigation('${nodeId}')" onmouseenter="this.style.borderColor='#4a9eff'" onmouseleave="this.style.borderColor='${isActive ? '#4a9eff' : '#444'}'"` : ''}
                     class="${canCollect && !isDepleted ? 'node-clickable' : ''}">
                    <div style="font-weight: bold; margin-bottom: 5px;">${nodeDef.image} ${nodeDef.name}</div>
                    <div style="font-size: 0.8em; color: #aaa;">Harvests: ${nodeState?.harvestsRemaining || 0}/${nodeState?.maxHarvests || 0}</div>
                    <div style="font-size: 0.75em; color: #888; margin-top: 5px;">${nodeDef.skill} Lv.${nodeDef.skillLevel}</div>
                    ${isDepleted ? `
                        <div style="font-size: 0.75em; color: #f44336; margin-top: 5px;">
                            ⏳ Depleted
                        </div>
                    ` : canCollect ? `
                        <div style="font-size: 0.75em; color: #4a9eff; margin-top: 5px;">
                            ${isActive ? '✅ Harvesting' : '👆 Click to harvest'}
                        </div>
                    ` : `
                        <div style="font-size: 0.75em; color: #ff9800; margin-top: 5px;">
                            🔒 ${nodeDef.skill} Lv.${nodeDef.skillLevel} required
                        </div>
                    `}
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render discovered crafting stations for navigation view
     */
    renderDiscoveredStations(regionState) {
        if (!regionState.discoveredCraftingStations || regionState.discoveredCraftingStations.length === 0) {
            return '<div style="color: #888; font-size: 0.9em;">No crafting stations discovered yet.</div>';
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';

        for (let stationId of regionState.discoveredCraftingStations) {
            const stationDef = GameEngine.definitions.craftingNodes[stationId];

            html += `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid #444; cursor: pointer;"
                     onclick="openCraftingForStation('${stationId}')"
                     onmouseenter="this.style.borderColor='#4a9eff'"
                     onmouseleave="this.style.borderColor='#444'">
                    <div style="font-weight: bold; margin-bottom: 5px;">${stationDef.image} ${stationDef.name}</div>
                    <div style="font-size: 0.75em; color: #888;">${stationDef.skill} Lv.${stationDef.skillLevel}</div>
                    <div style="font-size: 0.75em; color: #4a9eff; margin-top: 5px;">👆 Click to open crafting</div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render adjacent regions for navigation view
     */
    renderAdjacentRegions(currentRegionId, regionState, hexDef) {
        const adjacentRegions = hexDef.adjacent;
        const discoveredPaths = regionState.discoveredExitPaths || [];
        const navLevel = GameEngine.state.skills.navigation.level;

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">';

        for (let direction in adjacentRegions) {
            const targetRegionId = adjacentRegions[direction];
            const targetHexDef = GameEngine.definitions.worldMap[targetRegionId];
            const targetBiomeDef = GameEngine.definitions.biomes[targetHexDef?.biome];
            const targetRegionState = GameEngine.state.regions[targetRegionId];

            const isPathDiscovered = discoveredPaths.includes(targetRegionId);
            const hasLevelRequirement = navLevel >= targetHexDef.navigationRequirement;
            const canTravel = isPathDiscovered && hasLevelRequirement;

            html += `
                <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; border: 1px solid ${isPathDiscovered ? '#4a9eff' : '#333'}; opacity: ${isPathDiscovered ? '1' : '0.5'};">
                    <div style="font-size: 0.75em; color: #888; margin-bottom: 3px;">${direction}</div>
                    <div style="font-weight: bold; color: ${targetBiomeDef.color}; margin-bottom: 5px;">
                        ${targetBiomeDef.icon} ${targetHexDef.name}
                    </div>
                    <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${targetBiomeDef.name}</div>

                    ${isPathDiscovered ? `
                        <div style="font-size: 0.75em; color: #888; margin-bottom: 5px;">
                            Required: Navigation Lv.${targetHexDef.navigationRequirement}
                        </div>
                        ${targetRegionState?.discovered ?
                            `<div style="font-size: 0.75em; color: #4caf50; margin-bottom: 5px;">✅ Previously visited</div>` :
                            `<div style="font-size: 0.75em; color: #ff9800; margin-bottom: 5px;">🆕 Unvisited</div>`
                        }
                        <button onclick="travelToRegion('${targetRegionId}')"
                                ${!canTravel ? 'disabled' : ''}
                                style="width: 100%; font-size: 0.85em; padding: 5px;">
                            ${canTravel ? `✈️ Travel ${direction}` : `🔒 Nav Lv.${targetHexDef.navigationRequirement} Required`}
                        </button>
                    ` : `
                        <div style="font-size: 0.75em; color: #666;">🔒 Exit path not discovered</div>
                    `}
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render the hexagonal grid map
     */
    renderHexMap() {
        const state = GameEngine.state;
        const worldMap = GameEngine.definitions.worldMap;
        const currentRegionId = state.currentRegion;

        if (!worldMap) {
            return '<div style="padding: 50px; text-align: center; color: #888;">Generating world map...</div>';
        }

        // Larger hex drawing constants - ~8 columns x 5 rows (120-150px wide hexes)
        const hexWidth = 140; // Width of hex (flat-top orientation)
        const hexHeight = 121; // hexWidth * 0.866 for proper hex ratio
        const hexSize = hexWidth / Math.sqrt(3); // Radius for calculations

        // Calculate SVG dimensions to fit the map container
        const svgWidth = 1200;
        const svgHeight = 690;

        // Grid alignment - position (0,0) at left-center (green forest area)
        const originX = 150; // ~12.5% from left edge
        const originY = 345; // Center height

        // Convert hex coordinates to pixel coordinates (locked to map)
        const hexToPixel = (q, r) => {
            // Offset coordinate system for horizontal layout
            const x = originX + (q * hexWidth * 0.75);
            const y = originY + (r * hexHeight) + (q % 2) * (hexHeight / 2);
            return { x, y };
        };

        // Generate hex path (flat-top orientation)
        const hexPath = (cx, cy) => {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3 * i) - (Math.PI / 6); // Rotate 30° for flat-top
                const x = cx + hexSize * Math.cos(angle);
                const y = cy + hexSize * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return `M ${points.join(' L ')} Z`;
        };

        // Build SVG (locked to background, no pan/zoom)
        let svg = `
            <svg id="hexMapSVG" width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}"
                 style="background: transparent; user-select: none; -webkit-user-select: none;"
                 preserveAspectRatio="xMidYMid meet">

                <!-- SVG Filters for glow effects -->
                <defs>
                    <filter id="hexGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <filter id="hexGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <g id="hexMapGroup">
        `;

        // Render all hexes
        for (let regionId in worldMap) {
            const hex = worldMap[regionId];
            const regionState = state.regions[regionId];
            const biome = GameEngine.definitions.biomes[hex.biome];

            if (!hex || !hex.hexCoords) continue;

            const { q, r } = hex.hexCoords;
            const { x, y } = hexToPixel(q, r);

            // Determine hex state
            const isDiscovered = regionState?.discovered || false;
            const isCurrent = regionId === currentRegionId;
            const discoveryProgress = regionState?.discoveryProgress || 0;
            const isFullyExplored = discoveryProgress >= 100;
            const isPartiallyExplored = discoveryProgress > 0 && discoveryProgress < 100;
            const hasNodes = regionState?.discoveredNodeTypes?.length > 0;
            const hasMissionRequirement = hex.requiredMissionToLeave !== null;

            // Check if mission requirement is completed (only for current region)
            let missionRequirementMet = true;
            if (isCurrent && hasMissionRequirement) {
                const missionState = state.missions[hex.requiredMissionToLeave];
                missionRequirementMet = missionState?.status === 'completed';
            }

            // Check if explorable (another region has a path to this one)
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

            // Subtle overlay styling - barely visible, map shows through
            let fillColor = 'rgba(0, 0, 0, 0.4)'; // Locked - darker fog
            let strokeColor = 'rgba(100, 100, 100, 0.3)';
            let opacity = 1;
            let strokeWidth = 1.5;
            let glowColor = 'none';

            if (isExplorable && !isDiscovered) {
                // Path found but not visited - golden tint
                fillColor = 'rgba(255, 200, 0, 0.15)';
                strokeColor = 'rgba(255, 200, 0, 0.6)';
                strokeWidth = 2;
                glowColor = 'rgba(255, 200, 0, 0.4)';
            } else if (isDiscovered) {
                // Discovered - almost transparent, just a subtle outline
                fillColor = isFullyExplored ? 'rgba(0, 255, 100, 0.05)' : 'rgba(255, 255, 255, 0.02)';
                strokeColor = isFullyExplored ? 'rgba(0, 255, 100, 0.5)' : 'rgba(255, 255, 255, 0.3)';
                strokeWidth = isFullyExplored ? 2 : 1;
                if (isFullyExplored) {
                    glowColor = 'rgba(0, 255, 100, 0.3)';
                }
            }

            if (isCurrent) {
                strokeColor = 'rgba(74, 158, 255, 0.9)';
                fillColor = 'rgba(74, 158, 255, 0.1)';
                strokeWidth = 3;
                glowColor = 'rgba(74, 158, 255, 0.6)';
            }

            // Create hex element with glow effect
            const filterEffect = glowColor !== 'none' ? 'filter="url(#hexGlow)"' : '';

            svg += `
                <g class="hex-tile" data-region-id="${regionId}" style="cursor: pointer;"
                   onclick="showRegionPopup('${regionId}')">

                    <!-- Main hex shape -->
                    <path d="${hexPath(x, y)}"
                          fill="${fillColor}"
                          stroke="${strokeColor}"
                          stroke-width="${strokeWidth}"
                          ${filterEffect}
                          style="transition: all 0.3s ease;"
                          onmouseenter="this.setAttribute('stroke-width', '${strokeWidth + 1.5}'); this.setAttribute('filter', 'url(#hexGlowStrong)');"
                          onmouseleave="this.setAttribute('stroke-width', '${strokeWidth}'); this.setAttribute('filter', '${filterEffect.includes('url') ? 'url(#hexGlow)' : ''}');" />

                    <!-- Icons and labels (larger for bigger hexes) -->
                    ${isDiscovered ? `
                        <text x="${x}" y="${y + 8}"
                              text-anchor="middle"
                              font-size="24"
                              fill="white"
                              pointer-events="none"
                              style="font-weight: bold; text-shadow: 0 0 4px #000, 0 0 8px #000, 0 0 12px #000;">
                            ${biome.icon}
                        </text>
                    ` : isExplorable ? `
                        <text x="${x}" y="${y + 8}"
                              text-anchor="middle"
                              font-size="32"
                              fill="#ffcc00"
                              pointer-events="none"
                              style="font-weight: bold; text-shadow: 0 0 4px #000, 0 0 8px #000;">
                            ?
                        </text>
                    ` : ``}

                    <!-- Current location marker -->
                    ${isCurrent ? `
                        <circle cx="${x}" cy="${y}" r="8" fill="rgba(74, 158, 255, 0.3)" stroke="#4a9eff" stroke-width="2">
                            <animate attributeName="r" from="8" to="12" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="1" to="0.3" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="${x}" cy="${y}" r="5" fill="#4a9eff" />
                    ` : ''}

                    <!-- Status badges (larger for bigger hexes) -->
                    ${isPartiallyExplored ? `
                        <circle cx="${x + 35}" cy="${y - 35}" r="10" fill="#FFA500" stroke="#fff" stroke-width="1.5" pointer-events="none" />
                        <text x="${x + 35}" y="${y - 30}"
                              text-anchor="middle"
                              font-size="12"
                              fill="white"
                              pointer-events="none"
                              style="font-weight: bold;">
                            ...
                        </text>
                    ` : ''}

                    ${isFullyExplored ? `
                        <circle cx="${x + 35}" cy="${y - 35}" r="10" fill="#00ff00" stroke="#fff" stroke-width="1.5" pointer-events="none" />
                        <text x="${x + 35}" y="${y - 30}"
                              text-anchor="middle"
                              font-size="14"
                              fill="white"
                              pointer-events="none"
                              style="font-weight: bold;">
                            ✓
                        </text>
                    ` : ''}

                    ${hasNodes ? `
                        <circle cx="${x - 35}" cy="${y - 35}" r="10" fill="#9c27b0" stroke="#fff" stroke-width="1.5" pointer-events="none" />
                        <text x="${x - 35}" y="${y - 29}"
                              text-anchor="middle"
                              font-size="14"
                              fill="white"
                              pointer-events="none"
                              style="font-weight: bold;">
                            ⛏
                        </text>
                    ` : ''}

                    ${hasMissionRequirement && isCurrent ? `
                        <circle cx="${x}" cy="${y + 10}" r="5" fill="${missionRequirementMet ? '#00aa00' : '#ff3333'}" stroke="#fff" stroke-width="0.5" pointer-events="none" />
                        <text x="${x}" y="${y + 13}"
                              text-anchor="middle"
                              font-size="7"
                              fill="white"
                              pointer-events="none"
                              style="font-weight: bold;">
                            ${missionRequirementMet ? '✓' : '!'}
                        </text>
                    ` : ''}
                </g>
            `;
        }

        svg += `
                </g>
            </svg>
        `;

        // Add zoom/pan initialization script
        setTimeout(() => {
            this.initializeMapControls();
        }, 100);

        return svg;
    },

    /**
     * Initialize map zoom and pan controls
     */
    initializeMapControls() {
        const svg = document.getElementById('hexMapSVG');
        const group = document.getElementById('hexMapGroup');

        if (!svg || !group) return;

        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX, startY;

        // Zoom with mouse wheel
        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= delta;
            scale = Math.max(0.5, Math.min(3, scale)); // Limit zoom between 0.5x and 3x
            group.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
        });

        // Pan with mouse drag
        svg.addEventListener('mousedown', (e) => {
            // Only start drag if clicking on SVG background, not on hexes
            if (e.target.tagName === 'svg' || e.target.id === 'hexMapGroup') {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                svg.style.cursor = 'grabbing';
            }
        });

        svg.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                group.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
            }
        });

        svg.addEventListener('mouseup', () => {
            isDragging = false;
            svg.style.cursor = 'default';
        });

        svg.addEventListener('mouseleave', () => {
            isDragging = false;
            svg.style.cursor = 'default';
        });
    },

    /**
     * Get icon for a skill
     */
    getSkillIcon(skillId) {
        const icons = {
            'mining': '⛏️',
            'logging': '🪓',
            'fishing': '🎣',
            'hunting': '🏹',
            'foraging': '🧺',
            'thieving': '🥷',
            'navigation': '🧭',
            'combat': '⚔️'
        };
        return icons[skillId] || '📊';
    }
};
