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

        // Update mining UI if mining is active
        if (GameEngine.state.currentActivity === 'mining' && typeof renderMiningUI === 'function') {
            renderMiningUI();
        }

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

        // Get node data from GatheringSystem (not NodeCollectionSystem)
        const gatheringSession = GameEngine.state.gatheringSession;
        if (!gatheringSession || gatheringSession.nodeId !== activeNode.nodeId) {
            container.innerHTML = "";
            return;
        }

        const nodeDef = NodeRegistry.getAllActive()[activeNode.nodeId];
        if (!nodeDef) {
            container.innerHTML = "";
            return;
        }

        // Only rebuild HTML if node changed
        if (this.lastActiveNodeId !== activeNode.nodeId) {
            let html = `
                <div style="padding: 15px; background: #2a2a3a; border-radius: 4px; border: 2px solid #4a9eff;">
                    <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 10px;">
                        ${nodeDef.icon} Harvesting: ${nodeDef.name}
                    </div>
                    <div style="margin: 10px 0;">
                        <div style="font-size: 0.85em; color: #aaa;">
                            Node health and progress shown in persistent action bar above
                        </div>
                    </div>
                    <button onclick="GameEngine.stopGathering()" style="margin-top: 10px; width: 100%;">
                        ⏹️ Stop Gathering
                    </button>
                </div>
            `;
            container.innerHTML = html;
            this.lastActiveNodeId = activeNode.nodeId;
        }

        // All progress is now shown in PersistentActionBar - no need for duplicate display here
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
            const isDepleted = nodeData.isDepleted; // Depletion status provided by NodeCollectionSystem

            // Tier stars
            const tierStars = '⭐'.repeat(def.tier);

            // Status display removed - using PersistentActionBar for node health
            let statusColor = '#4caf50'; // Available
            if (isLocked) statusColor = '#888'; // Locked

            let availabilityText = isLocked ? '<span style="color: #888;">Locked</span>' : '<span style="color: #4caf50;">Available</span>';

            html += `
                <div class="panel" style="padding: 15px; ${isLocked ? 'opacity: 0.5;' : ''} ${isActive ? 'border: 2px solid #4a9eff;' : ''}">
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
            const itemName = ItemAccessHelper.getItem(entry.itemId)?.name || entry.itemId;
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
            const itemName = ItemAccessHelper.getItem(entry.itemId)?.name || entry.itemId;
            const itemDef = ItemAccessHelper.getItem(entry.itemId);
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
                const itemName = ItemAccessHelper.getItem(reward.itemId)?.name || reward.itemId;
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

        // Create state snapshot - only track things that affect map display or major UI changes.
        // Intentionally NOT tracking isNavigating / currentActivity: toggling exploration
        // must NOT rebuild the whole page (a rebuild re-inits the hex map and flickers).
        // The toggle button, bars and labels are updated live in
        // updateNavigationProgressBars() instead.
        const currentState = {
            regionId: regionId,
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

        // Current location data for the banner
        const fogProgress = (regionState.fogProgress ?? regionState.discoveryProgress ?? 0);
        const fogPercent = Math.min(100, Math.max(0, fogProgress)).toFixed(0);
        const isFullyExplored = fogProgress >= 100;

        // Navigation skill values for the shared skill strip (identical to gather/craft)
        const navSkill = state.skills.navigation || { level: 1, exp: 0 };
        const navLevel = navSkill.level || 1;
        const navExpReq = GameEngine.getSkillExpRequired?.('navigation') || 100;
        const navExpPct = Math.min(100, ((navSkill.exp || 0) / navExpReq) * 100);
        const fmt = (typeof Formatting !== 'undefined' && Formatting.formatNumber) ? Formatting.formatNumber : (n) => n;

        const navLabel = isRecovering ? 'Resting' : isNavigating ? 'Discovery Progress' : 'Navigation Action';
        const navTiming = isRecovering ? 'Resting' : isNavigating ? '0.0s' : 'Not exploring';
        const navDesc = isRecovering
            ? 'Resting to recover endurance - discovery paused'
            : isNavigating
                ? `Making discoveries every ${(stats.discoveryInterval / 1000).toFixed(1)}s (${stats.discoveryChance.toFixed(1)}% chance)`
                : 'Start exploring to discover resources and enemies in this region';

        let html = '';

        html += `
            <!-- Current Location: name (left) + exploration bar/value (right) -->
            <div class="nav-location-banner">
                <div class="nav-location-name">${hexDef.name}</div>
                <div class="nav-location-progress">
                    <div class="nav-location-progress-head">
                        <span>Exploration</span>
                        <span>${fogPercent}%${isFullyExplored ? ' ✓' : ''}</span>
                    </div>
                    <div class="skill-exp-bar">
                        <div class="skill-exp-fill" style="width: ${fogPercent}%; background: linear-gradient(90deg, var(--color-primary-dark), var(--color-primary));"></div>
                    </div>
                </div>
            </div>

            <!-- Integrated Map Container (map + hex grid), un-boxed -->
            <div id="hexMapContainer"></div>

            <!-- Two columns: exploration controls (left) + discoveries (right) -->
            <div class="nav-columns">
                <div class="nav-col nav-col--controls">
                    <!-- Navigation: the skill strip + two bars are borrowed identically
                         from the gather/craft active panel (.gap-skill + .gap-bar). -->
                    <div class="nav-control-block gather-active-panel nav-active-panel" style="--skill-color: var(--color-primary);">
                        <!-- Shared skill strip (icon + Navigation + level, xp bar, mods) -->
                        <div class="gap-skill">
                            <div class="gap-skill-id">
                                <span class="gap-skill-icon">🧭</span>
                                <span class="gap-skill-name">Navigation</span>
                                <span class="gap-skill-level">Lv.${navLevel}</span>
                            </div>
                            <div class="gap-skill-xp">
                                <div class="gap-skill-xp-track">
                                    <div class="gap-skill-xp-fill" style="width: ${navExpPct}%;"></div>
                                </div>
                                <span class="gap-skill-xp-text">${fmt(navSkill.exp || 0)} / ${fmt(navExpReq)} XP</span>
                            </div>
                            <div class="gap-skill-mods">
                                <span class="bonus-tag speed">+${Math.min(navLevel * 2, 50)}% Speed</span>
                                <span class="bonus-tag yield">${stats.discoveryChance.toFixed(1)}% Find</span>
                            </div>
                        </div>

                        <!-- Dynamic action label (replaces the node name line) -->
                        <div class="gap-nodename" id="navigationIntervalLabel">${navLabel}</div>

                        <!-- Interval (discovery) bar -->
                        <div class="gap-bar">
                            <div class="gap-bar-fill nav-discovery-fill" id="navigationIntervalBar" style="width: 0%;"></div>
                        </div>

                        <!-- Endurance (health) bar — same format, directly under the interval bar -->
                        <div class="gap-bar">
                            <div class="gap-bar-fill gap-health-fill${isRecovering ? ' is-recovering' : ''}" id="navigationHealthBar" style="width: ${endurancePercent}%;"></div>
                        </div>

                        <!-- Live readout + toggle (mirrors .gap-controls success + stop) -->
                        <div class="gap-controls">
                            <span class="gap-success">
                                <span id="navigationIntervalText">${navTiming}</span>
                                <span class="nav-endurance-readout">💪 <span id="navigationHealthText">${Math.floor(activeNav.endurance)}/${activeNav.maxEndurance}</span></span>
                            </span>
                            <button id="navigationToggleBtn" class="gap-stop${isNavigating ? '' : ' is-start'}"
                                    onclick="${isNavigating ? 'stopNavigating()' : 'startNavigating()'}">
                                ${isNavigating ? 'Stop' : 'Explore'}
                            </button>
                        </div>
                        <div id="navigationIntervalDesc" class="nav-control-desc" style="margin-top: 8px;">${navDesc}</div>
                    </div>

                    <!-- Camping Resources -->
                    <div class="nav-control-block">
                        <div class="nav-panel-title">Camping Resources</div>
                        <div class="nav-control-desc" style="margin-bottom: 10px;">
                            Select fuel and food for campfire recovery. Better fuel = faster recovery.
                        </div>
                        <div class="nav-camping-tiles">
                            ${this.renderRestEquipmentSlot('food')}
                            ${this.renderFuelSelector()}
                        </div>
                        ${this.renderCampfireStatus()}
                    </div>
                </div>

                <div class="nav-col nav-col--discoveries">
                    <!-- Explore new tiles -->
                    <div class="nav-control-block">
                        <div class="nav-panel-title">Nearby Regions</div>
                        ${this.renderAdjacentRegions(regionId, regionState, hexDef)}
                    </div>

                    <!-- Discovered nodes -->
                    <div class="nav-control-block">
                        <div class="nav-panel-title">Discovered Here</div>
                        ${this.renderDiscoveredNodes(regionState, biomeDef)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.lastNavigationState = currentState;

        // Initialize hex grid system after DOM update
        if (typeof HexGridSystem !== 'undefined') {
            setTimeout(() => {
                if (document.getElementById('hexMapContainer')) {
                    HexGridSystem.init('hexMapContainer');
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

        if (healthBar && healthText) {
            const endurancePercent = (activeNav.endurance / activeNav.maxEndurance) * 100;
            healthBar.style.width = `${endurancePercent}%`;
            healthText.textContent = `${Math.max(0, Math.floor(activeNav.endurance))}/${activeNav.maxEndurance}`;

            // Recovery state drives the amber fill via the shared gap-health-fill class
            healthBar.classList.toggle('is-recovering', isRecovering);
        }

        // Keep the toggle button in sync without rebuilding the page
        const toggleBtn = document.getElementById("navigationToggleBtn");
        if (toggleBtn) {
            toggleBtn.textContent = isNavigating ? 'Stop' : 'Explore';
            toggleBtn.classList.toggle('is-start', !isNavigating);
            toggleBtn.setAttribute('onclick', isNavigating ? 'stopNavigating()' : 'startNavigating()');
        }

        // Update the dynamic action label (the gap-nodename line) and description
        const intervalLabel = document.getElementById("navigationIntervalLabel");
        const intervalDesc = document.getElementById("navigationIntervalDesc");

        if (intervalLabel) {
            intervalLabel.textContent = isRecovering
                ? 'Resting'
                : isNavigating ? 'Discovery Progress' : 'Navigation Action';
        }
        if (intervalDesc) {
            const stats = GameEngine.getNavigationStats();
            intervalDesc.textContent = isRecovering
                ? 'Resting to recover endurance - discovery paused'
                : isNavigating
                    ? `Making discoveries every ${(stats.discoveryInterval / 1000).toFixed(1)}s (${stats.discoveryChance.toFixed(1)}% chance)`
                    : 'Start exploring to discover resources and enemies in this region';
        }

        // Only update interval and rest bars if navigating
        if (!isNavigating) {
            // Reset interval bar when not navigating
            const intervalBar = document.getElementById("navigationIntervalBar");
            const intervalText = document.getElementById("navigationIntervalText");
            if (intervalBar && intervalText) {
                intervalBar.style.width = "0%";
                intervalText.textContent = "Not exploring";
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
        // Consumption interval based on health: base 3000ms + (health * 200ms)
        const health = GameEngine.state.combatAttributes?.health || 1;
        const BASE_INTERVAL = 3000;
        const HEALTH_BONUS = 200;
        const consumptionInterval = BASE_INTERVAL + (health * HEALTH_BONUS);

        const now = Date.now();
        const lastRestConsumption = activeNav.lastRestConsumption || now;
        const nextRestConsumption = lastRestConsumption + consumptionInterval;
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

            // Check if player can collect this node
            const playerSkillLevel = GameEngine.state.skills[nodeDef.skill]?.level || 0;
            const canCollect = playerSkillLevel >= nodeDef.skillLevel;
            const isActive = GameEngine.state.nodeCollection.activeNode?.nodeId === nodeId;

            html += `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid ${isActive ? '#4a9eff' : '#444'}; cursor: ${canCollect ? 'pointer' : 'default'}; position: relative;"
                     ${canCollect ? `onclick="startHarvestingFromNavigation('${nodeId}')" onmouseenter="this.style.borderColor='#4a9eff'" onmouseleave="this.style.borderColor='${isActive ? '#4a9eff' : '#444'}'"` : ''}
                     class="${canCollect ? 'node-clickable' : ''}">
                    <div style="font-weight: bold; margin-bottom: 5px;">${nodeDef.image} ${nodeDef.name}</div>
                    <div style="font-size: 0.75em; color: #888; margin-top: 5px;">${nodeDef.skill} Lv.${nodeDef.skillLevel}</div>
                    ${canCollect ? `
                        <div style="font-size: 0.75em; color: #4a9eff; margin-top: 5px;">
                            ${isActive ? '✅ Gathering' : '👆 Click to gather'}
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
        const adjacentRegions = hexDef.adjacent || {};
        const discoveredPaths = regionState.discoveredExitPaths || [];
        const navLevel = GameEngine.state.skills.navigation.level;

        // Split the touching tiles into two groups:
        //  - connected: a path has been found to this neighbour. A discovered path is
        //    permanent and two-way, so these ALWAYS stay travellable — the button must
        //    never disappear just because the tile has since been visited.
        //  - frontier:  no path yet. Explore the current region to reveal it.
        const connected = [];
        const frontier = [];
        for (let direction in adjacentRegions) {
            const targetRegionId = adjacentRegions[direction];
            const targetHexDef = GameEngine.definitions.worldMap[targetRegionId];
            const targetBiomeDef = GameEngine.definitions.biomes[targetHexDef?.biome];

            if (!targetHexDef || !targetBiomeDef) continue;
            if (targetRegionId === currentRegionId) continue;

            const entry = { direction, targetRegionId, targetHexDef };
            if (discoveredPaths.includes(targetRegionId)) {
                connected.push(entry);
            } else {
                frontier.push(entry);
            }
        }

        if (connected.length === 0 && frontier.length === 0) {
            return '<div style="color: #888; font-size: 0.9em;">No regions border this tile.</div>';
        }

        const groupLabel = (text) =>
            `<div style="font-size: 0.72em; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin: 8px 0 4px;">${text}</div>`;

        let html = '<div class="nav-tile-list">';

        // Connected neighbours — a known path you can always travel back along.
        if (connected.length > 0) {
            html += groupLabel('Connected');
            for (const { direction, targetRegionId, targetHexDef } of connected) {
                const req = targetHexDef.navigationRequirement || 0;
                const canTravel = navLevel >= req;
                const actionHTML = canTravel
                    ? `<button class="nav-tile-btn" onclick="travelToRegion('${targetRegionId}')">✈️ Travel ${direction}</button>`
                    : `<button class="nav-tile-btn is-locked" disabled>🔒 Lv.${req}</button>`;
                html += `
                    <div class="nav-tile">
                        <span class="nav-tile-name">${targetHexDef.name}</span>
                        ${actionHTML}
                    </div>
                `;
            }
        }

        // Unexplored frontier — explore the current region to find these paths.
        if (frontier.length > 0) {
            if (connected.length > 0) html += groupLabel('Unexplored');
            for (const { targetHexDef } of frontier.slice(0, 6)) {
                html += `
                    <div class="nav-tile">
                        <span class="nav-tile-name">${targetHexDef.name}</span>
                        <button class="nav-tile-btn is-locked" disabled>🔍 Find path</button>
                    </div>
                `;
            }
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
     * Render fuel selector slot for campfire system (matches food slot pattern)
     */
    renderFuelSelector() {
        // Check if CampfireSystem is available
        if (typeof CampfireSystem === 'undefined' || !GameEngine.getCampfireStats) {
            // Fallback to old wood slot if CampfireSystem not loaded
            return this.renderRestEquipmentSlot('wood');
        }

        const campfireStats = GameEngine.getCampfireStats();
        const selectedFuelId = campfireStats?.selectedFuelId || null;
        const selectedFuel = selectedFuelId ? GameEngine.getFuelDefinition(selectedFuelId) : null;

        // Get quantity in bank for selected fuel
        // DualBankSystem stores stackable items as { itemId: quantity } (direct numbers)
        let quantity = 0;
        if (selectedFuelId && GameEngine.state.bank.stackable) {
            quantity = GameEngine.state.bank.stackable[selectedFuelId] || 0;
        }

        const isEquipped = selectedFuelId !== null && selectedFuel !== null;

        // Use the shared loadout tile so Fuel matches every other consumable slot.
        return LoadoutSlotRenderer.renderConsumableSlot({
            slotName: 'fuel',
            itemData: isEquipped ? selectedFuelId : null,
            quantity: quantity,
            showLabel: true,
            interactive: true,
            onClick: 'openFuelModal(event)'
        });
    },

    /**
     * Render campfire status display
     */
    renderCampfireStatus() {
        // Check if CampfireSystem is available
        if (typeof CampfireSystem === 'undefined' || !GameEngine.getCampfireStats) {
            return '';
        }

        const stats = GameEngine.getCampfireStats();
        const isRecovering = GameEngine.state.activeNavigation?.isRecovering || false;

        if (!isRecovering && !stats.active) {
            return ''; // Don't show status when not camping
        }

        const fuelPercent = stats.fuelRemaining > 0
            ? Math.min(100, (stats.fuelRemaining / 120) * 100) // Normalize to ~2 min max display
            : 0;

        return `
            <div style="margin-top: 10px; padding: 10px; background: rgba(255, 152, 0, 0.1);
                        border: 1px solid rgba(255, 152, 0, 0.3); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.8em; font-weight: 600; color: #FF9800;">
                        🔥 Campfire ${stats.active ? 'Active' : 'Inactive'}
                    </span>
                    <span style="font-size: 0.75em; color: #aaa;">
                        ${stats.selectedFuelName || 'No fuel'}
                    </span>
                </div>
                <div style="background: #1a1a1a; border-radius: 4px; height: 8px; overflow: hidden;">
                    <div style="width: ${fuelPercent}%;
                                height: 100%;
                                background: linear-gradient(90deg, #FF9800, #FFC107);
                                transition: width 0.3s ease;">
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.7em; color: #888;">
                    <span>🌡️ Warmth: ${stats.warmth}</span>
                    <span>⚡ ${stats.efficiency}x recovery</span>
                    <span>⏱️ ${Math.floor(stats.fuelRemaining)}s remaining</span>
                </div>
            </div>
        `;
    },

    /**
     * Render rest equipment slot (food) - uses equipment.food from loadout
     * Food is shared between combat and navigation - same slot, same quantity
     */
    renderRestEquipmentSlot(slotType) {
        // Food slot now reads from equipment.food (shared with combat loadout)
        // equipment.food is { itemId: string, quantity: number }
        const foodSlot = GameEngine.state.equipment?.food;

        let equippedItemId = null;
        let quantity = 0;
        let itemDef = null;
        let isEquipped = false;

        if (foodSlot && typeof foodSlot === 'object' && foodSlot.itemId) {
            equippedItemId = foodSlot.itemId;
            quantity = foodSlot.quantity || 0;
            itemDef = ItemRegistry.getItem(equippedItemId);
            isEquipped = itemDef !== null && quantity > 0;
        } else if (foodSlot && typeof foodSlot === 'string') {
            // Legacy format: just the item ID, quantity in bank
            equippedItemId = foodSlot;
            itemDef = ItemRegistry.getItem(equippedItemId);
            // Check bank for quantity (DualBankSystem uses stackable)
            quantity = GameEngine.state.bank?.stackable?.[equippedItemId] || 0;
            isEquipped = itemDef !== null && quantity > 0;
        }

        // Use the shared loadout tile so Food matches the combat loadout slot exactly.
        return LoadoutSlotRenderer.renderConsumableSlot({
            slotName: 'food',
            itemData: isEquipped ? equippedItemId : null,
            quantity: quantity,
            showLabel: true,
            interactive: true,
            onClick: 'openFoodEquipModal(event)'
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
