/**
 * UI CORE
 *
 * Main UI coordinator, initialization, update loop, view switching, and current activity display.
 * Uses utilities from formatting.js and progressBar.js.
 */

const UICore = {
    UPDATE_INTERVAL: 100, // Update UI every 100ms
    updateTimer: null,
    currentView: 'overview', // Current active view

    // Cache last rendered states to prevent unnecessary re-renders
    lastBankState: null,
    lastGeneratorsState: null,
    lastUpgradesState: null,
    lastSkillsState: null,
    lastCurrentRegionState: null,
    lastRegionsState: null,
    lastEquipmentState: null,
    lastCombatState: null,
    lastGameInfoState: null,
    lastNodesState: null,
    lastNavigationState: null,
    lastCraftingState: null,
    lastActiveCraftsState: null,
    lastActivityBarProgress: 0,

    // UI state
    worldMapCollapsed: true, // Default to collapsed

    /**
     * Initialize the UI system
     */
    init() {
        console.log("🎨 UI System Initialized");

        // Verify all required DOM elements exist
        const requiredElements = [
            'resourcesDisplay', 'generatorsDisplay', 'upgradesDisplay',
            'skillsDisplay', 'currentRegionDisplay', 'regionsDisplay',
            'bankStats', 'bankTabs', 'bankGrid',
            'playerStats', 'equipmentGrid', 'combatArea'
        ];

        let missingElements = [];
        for (let elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                missingElements.push(elementId);
            }
        }

        if (missingElements.length > 0) {
            console.error("❌ Missing UI elements:", missingElements);
        }

        // Initialize animation system
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }

        this.startUpdateLoop();
    },

    /**
     * Start the UI update loop
     */
    startUpdateLoop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        this.updateTimer = setInterval(() => {
            this.update();
        }, this.UPDATE_INTERVAL);

        console.log(`⏰ UI update loop started (every ${this.UPDATE_INTERVAL}ms)`);
    },

    /**
     * Main UI update function - routes to appropriate view
     */
    update() {
        // Always update these
        this.updateGameInfo();
        this.updateCharacterLevel();
        this.updateCurrencies();
        this.updateCurrentActivity();
        this.updateNotificationBadges();

        // Update current view
        switch (this.currentView) {
            case 'overview':
                OverviewUI.updateOverview();
                break;
            case 'skills':
                SkillsUI.updateSkills();
                break;
            case 'bank':
                EquipmentUI.updateBank();
                break;
            case 'equipment':
                EquipmentUI.updateEquipment();
                break;
            case 'combat':
                CombatUI.updateCombat();
                break;
            case 'crafting':
                CraftingUI.updateCrafting();
                break;
            case 'navigation':
                NavigationUI.updateNavigation();
                // Render the procedural world map
                if (typeof MapRenderer !== 'undefined' && MapRenderer.ctx) {
                    MapRenderer.render();
                }
                break;
            case 'nodes':
                NavigationUI.updateNodes();
                break;
            case 'regions':
                NavigationUI.updateCurrentRegion();
                NavigationUI.updateRegions();
                break;
            case 'missions':
                MissionsUI.updateMissions();
                break;
            case 'engineering':
                EngineeringUI.updateEngineering();
                break;
            case 'developer':
                DeveloperUI.updateDeveloperPanel();
                break;
        }
    },

    /**
     * Update game info (time, last save)
     */
    updateGameInfo() {
        // Game time and last save removed from header in compact design
        // Can be displayed elsewhere if needed
    },

    /**
     * Update character level and attribute points
     */
    updateCharacterLevel() {
        const charLevel = GameEngine.state.characterLevel;
        const expRequired = GameEngine.getCharacterExpRequired();
        const expPercent = (charLevel.exp / expRequired) * 100;

        document.getElementById("charLevel").textContent = charLevel.level;
        document.getElementById("charPoints").textContent = charLevel.unassignedAttributePoints;
        document.getElementById("charExpBar").style.width = `${Math.min(expPercent, 100)}%`;
        document.getElementById("charExpText").textContent =
            `${Formatting.formatNumber(charLevel.exp)} / ${Formatting.formatNumber(expRequired)} XP`;

        // Show/hide attribute points badge
        const pointsDisplay = document.getElementById("charPointsDisplay");
        if (pointsDisplay) {
            pointsDisplay.style.display = charLevel.unassignedAttributePoints > 0 ? 'block' : 'none';
        }

        // Check for XP gain and show XP drop animation
        const currentExp = charLevel.exp;
        if (this.lastCharacterExp !== undefined && currentExp > this.lastCharacterExp) {
            const xpGained = currentExp - this.lastCharacterExp;
            this.showXPDrop(xpGained);
        }
        this.lastCharacterExp = currentExp;
    },

    /**
     * Show XP drop animation
     */
    showXPDrop(amount) {
        const container = document.querySelector('.header-center');
        if (!container) return;

        const xpDrop = document.createElement('div');
        xpDrop.className = 'xp-drop';
        xpDrop.textContent = `+${Formatting.formatNumber(amount)} XP`;
        xpDrop.style.position = 'absolute';
        xpDrop.style.left = '150px';
        xpDrop.style.top = '10px';
        xpDrop.style.pointerEvents = 'none';
        xpDrop.style.zIndex = '1000';

        container.style.position = 'relative';
        container.appendChild(xpDrop);

        // Remove after animation completes
        setTimeout(() => {
            xpDrop.remove();
        }, 1000);
    },

    /**
     * Update currencies display
     */
    updateCurrencies() {
        const currencies = GameEngine.state.currencies;

        // Track previous values for flash animation
        if (!this.lastCurrencies) {
            this.lastCurrencies = { ...currencies };
        }

        // Update each currency with flash animation if changed
        const currencyElements = {
            gold: document.getElementById("goldAmount"),
            medals: document.getElementById("medalsAmount"),
            tomes: document.getElementById("tomesAmount"),
            gems: document.getElementById("gemsAmount")
        };

        for (const [key, element] of Object.entries(currencyElements)) {
            if (element) {
                element.textContent = Formatting.formatNumber(currencies[key]);

                // Flash animation if currency increased
                if (currencies[key] > this.lastCurrencies[key]) {
                    const parent = element.closest('.curr');
                    if (parent && typeof Animations !== 'undefined') {
                        Animations.flashCurrency(parent);
                    }
                }
            }
        }

        // Update last currencies
        this.lastCurrencies = { ...currencies };
    },

    /**
     * Update current activity display in header
     */
    updateCurrentActivity() {
        const state = GameEngine.state;
        const activityText = document.getElementById("activityText");
        const activityBar = document.getElementById("activityBar");
        const activityProgress = document.getElementById("activityProgress");
        const regionText = document.getElementById("currentRegionText");

        // Update current region
        const currentRegion = GameEngine.definitions.worldMap?.[state.currentRegion];
        if (regionText && currentRegion) {
            regionText.textContent = `${currentRegion.name || "Unknown"}`;
        }

        // Default values
        let text = "Idle";
        let progress = 0;
        let progressText = "--";
        let barColor = "linear-gradient(90deg, #4caf50, #8bc34a)";

        if (state.currentActivity === 'nodeCollection' && state.nodeCollection.activeNode) {
            // Show node harvesting activity
            const activeNode = state.nodeCollection.activeNode;
            const nodeDef = GameEngine.definitions.resourceNodes[activeNode.nodeId];

            if (nodeDef) {
                const now = Date.now();

                // Check if waiting for respawn
                if (activeNode.waitingForRespawn) {
                    const nodeState = GameEngine.getNodeStateInRegion(activeNode.nodeId);
                    const elapsed = now - (nodeState?.depletedAt || now);
                    progress = Math.min(100, (elapsed / (nodeState?.respawnTime || 1)) * 100);

                    const remaining = Math.max(0, Math.ceil(((nodeState?.respawnTime || 0) - elapsed) / 1000));
                    text = `⏳ ${nodeDef.name}`;
                    progressText = remaining > 0 ? `Respawning ${remaining}s` : "Respawned!";
                    barColor = "linear-gradient(90deg, #FF9800, #FFC107)";
                } else {
                    // Calculate harvest progress
                    const elapsed = now - activeNode.startTime;
                    progress = Math.min(100, (elapsed / activeNode.harvestTime) * 100);

                    const remaining = Math.max(0, Math.ceil((activeNode.harvestTime - elapsed) / 1000));
                    text = `⛏️ ${nodeDef.name}`;
                    progressText = remaining > 0 ? `${remaining}s` : "Harvesting!";
                    barColor = "linear-gradient(90deg, #2196F3, #03A9F4)";
                }
            }
        } else if (state.currentActivity === 'navigation' && state.activeNavigation.isNavigating) {
            // Show navigation activity
            const currentRegion = GameEngine.definitions.worldMap?.[state.currentRegion];
            const regionName = currentRegion?.name || "Unknown Region";

            text = `🧭 Exploring ${regionName}`;

            const regionState = state.regions[state.currentRegion];
            const totalDiscoveryItems = regionState.discoveredNodeTypes.length +
                                       regionState.discoveredCraftingStations.length +
                                       regionState.discoveredExitPaths.length;

            progress = (state.activeNavigation.regionHealth / state.activeNavigation.maxRegionHealth) * 100;
            progressText = `${totalDiscoveryItems} Discoveries | ${Math.floor(state.activeNavigation.regionHealth)} HP`;
            barColor = "linear-gradient(90deg, #FF9800, #FFC107)";
        } else if (state.currentActivity === 'combat' && state.combat.inCombat) {
            // Show combat activity
            const enemy = state.combat.currentEnemy;
            const enemyDef = GameEngine.definitions.enemies[enemy.enemyId];

            if (enemyDef) {
                text = `⚔️ Fighting ${enemyDef.name}`;
                progress = ((enemyDef.health - enemy.currentHealth) / enemyDef.health) * 100;
                progressText = `Enemy: ${Math.floor(enemy.currentHealth)} / ${enemyDef.health} HP`;
                barColor = "linear-gradient(90deg, #f44336, #e91e63)";
            }
        } else if (state.currentActivity === 'crafting' && state.crafting.activeCrafts.length > 0) {
            // Show crafting activity (first active craft)
            const craft = state.crafting.activeCrafts[0];
            const recipeDef = GameEngine.definitions.recipes[craft.recipeId];

            if (recipeDef) {
                text = `🔨 Crafting ${recipeDef.name}`;
                // Use global interval progress calculation for consistent behavior
                progress = ProgressBar.calculateIntervalProgress(craft.startTime, craft.completionTime);
                const elapsed = Date.now() - craft.startTime;
                const remaining = Math.max(0, Math.ceil((craft.totalTime - elapsed) / 1000));
                progressText = `${remaining}s remaining`;
                barColor = "linear-gradient(90deg, #9C27B0, #E91E63)";
            }
        }

        // Update DOM
        activityText.textContent = text;

        // Handle progress bar reset (instant jump to 0%, then smooth fill)
        if (progress < this.lastActivityBarProgress && progress === 0) {
            // Disable transition, set to 0, then re-enable transition
            activityBar.style.transition = 'none';
            activityBar.style.width = '0%';

            // Force reflow to apply the 0% immediately
            activityBar.offsetHeight;

            // Re-enable transition for smooth fill
            activityBar.style.transition = 'width 0.3s ease-out';
        } else {
            activityBar.style.width = `${progress}%`;
        }

        this.lastActivityBarProgress = progress;
        activityBar.style.background = barColor;
        activityProgress.textContent = progressText;
    },

    /**
     * Update notification badges on navigation tabs
     */
    updateNotificationBadges() {
        const state = GameEngine.state;

        // Skills tab: Unassigned attribute points
        const skillsCount = state.characterLevel.unassignedAttributePoints;
        this.updateTabBadge('skills', skillsCount);

        // Missions tab: Available missions (not started yet)
        let availableMissionsCount = 0;
        if (state.missions && GameEngine.definitions.missions) {
            for (let missionId in GameEngine.definitions.missions) {
                if (!state.missions[missionId] || state.missions[missionId].status === 'available') {
                    availableMissionsCount++;
                }
            }
        }
        this.updateTabBadge('missions', availableMissionsCount);

        // Bank tab: New items count
        const newItemsCount = state.bank.newItems.length;
        this.updateTabBadge('bank', newItemsCount);

        // Combat tab: Out of food alert (show "!" if no food equipped)
        const equippedFood = state.equipment.food;
        const foodQuantity = state.combat.equippedFoodQuantity;
        const hasFood = equippedFood && foodQuantity > 0;
        this.updateTabBadge('combat', hasFood ? 0 : '!', true);

        // Equipment tab: Out of ammo alert (show "!" if gun equipped but no ammo)
        const ammo = state.combat.playerAmmo;
        const hasAmmoIssue = ammo && ammo.magazineSize > 0 && ammo.currentAmmo === 0;
        this.updateTabBadge('equipment', hasAmmoIssue ? '!' : 0, true);
    },

    /**
     * Update a single tab's notification badge
     * @param {string} viewName - The view name (data-view attribute)
     * @param {number|string} count - The count to display (0 hides badge)
     * @param {boolean} isAlert - If true, displays as "!" instead of count
     */
    updateTabBadge(viewName, count, isAlert = false) {
        const tabButton = document.querySelector(`.sidebar-item[data-view="${viewName}"]`);
        if (!tabButton) return;

        // Get or create badge element
        let badge = tabButton.querySelector('.tab-notification');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'tab-notification';
            tabButton.appendChild(badge);
        }

        // Update badge visibility and content
        if (count > 0 || (isAlert && count === '!')) {
            badge.textContent = isAlert ? count : count > 99 ? '99+' : count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
};
