/**
 * UI SYSTEM
 *
 * Handles all UI updates and user interactions.
 * Completely separated from game logic for easy framework migration.
 */

const UI = {
    UPDATE_INTERVAL: 100, // Update UI every 100ms
    updateTimer: null,
    currentView: 'resources', // Current active view

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

    // UI state
    worldMapCollapsed: true, // Default to collapsed
    lastActivityBarProgress: 0, // Track last activity bar progress to detect resets

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
            console.error("❌ Missing DOM elements:", missingElements);
        } else {
            console.log("✅ All DOM elements found");
        }

        // Start UI update loop
        this.startUpdateLoop();

        // Initial render
        console.log("🔄 Performing initial UI update...");
        this.update();
        console.log("✅ Initial UI update complete");
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
    },

    /**
     * Main UI update function - only updates currently active view
     */
    update() {
        // Always update game info (shown in header)
        this.updateGameInfo();
        this.updateCharacterLevel();
        this.updateCurrencies();
        this.updateCurrentActivity();

        // Update view-specific sections based on current view
        switch (this.currentView) {
            case 'resources':
                this.updateResources();
                this.updateUpgrades();
                break;
            case 'skills':
                this.updateSkills();
                break;
            case 'nodes':
                this.updateNodes();
                break;
            case 'bank':
                this.updateBank();
                break;
            case 'equipment':
                this.updateEquipment();
                break;
            case 'combat':
                this.updateCombat();
                this.updateEquipment(); // Update player stats during combat
                break;
            case 'navigation':
                this.updateNavigation();
                break;
            case 'crafting':
                this.updateCrafting();
                break;
            case 'debug':
                this.updateDebugStats();
                break;
        }
    },

    /**
     * Update resource display
     */
    updateResources() {
        const container = document.getElementById("resourcesDisplay");
        const resources = GameEngine.state.resources;
        const rates = GameEngine.getProductionRates();

        let html = "";

        // Display each resource
        for (let resourceId in resources) {
            const amount = resources[resourceId];
            const rate = rates[resourceId];

            let displayAmount = amount;
            let displayRate = "";

            // Format large numbers
            if (resourceId === "health") {
                displayAmount = `${Math.floor(amount)}/${resources.maxHealth}`;
            } else {
                displayAmount = this.formatNumber(amount);

                if (rate && rate > 0) {
                    displayRate = `<span style="color: #4caf50;"> (+${this.formatNumber(rate)}/s)</span>`;
                }
            }

            html += `
                <div class="resource">
                    <span class="resource-name">${this.capitalizeFirst(resourceId)}:</span>
                    <span class="resource-value">${displayAmount}</span>
                    ${displayRate}
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Update generators display
     */
    updateGenerators() {
        const container = document.getElementById("generatorsDisplay");
        const generators = GameEngine.state.generators;

        // Create state snapshot
        const currentState = JSON.stringify(generators);

        // Only re-render if state changed
        if (this.lastGeneratorsState === currentState) return;

        const genDefs = GameEngine.definitions.generators;
        let html = "";

        for (let genId in generators) {
            const gen = generators[genId];
            const def = genDefs[genId];

            if (!gen.unlocked) continue;

            const cost = GameEngine.getGeneratorCost(genId);
            const canAfford = GameEngine.state.resources[def.costResource] >= cost;

            const multiplier = GameEngine.getResourceMultiplier(def.produces);
            const currentProduction = def.baseProduction * gen.level * multiplier;

            html += `
                <div class="upgrade">
                    <div class="upgrade-header">
                        <span class="upgrade-name">${def.name}</span>
                        <span class="upgrade-level">Level ${gen.level}</span>
                    </div>
                    <div class="upgrade-effect">${def.description}</div>
                    <div class="upgrade-effect">Production: ${this.formatNumber(currentProduction)} ${def.produces}/s</div>
                    <div class="upgrade-cost">Cost: ${this.formatNumber(cost)} ${def.costResource}</div>
                    <button onclick="purchaseGenerator('${genId}')" ${!canAfford ? "disabled" : ""}>
                        Buy (${gen.level + 1})
                    </button>
                </div>
            `;
        }

        if (html === "") {
            html = "<div style='color: #888;'>No generators available yet...</div>";
        }

        container.innerHTML = html;
        this.lastGeneratorsState = currentState;
    },

    /**
     * Update upgrades display
     */
    updateUpgrades() {
        const container = document.getElementById("upgradesDisplay");
        const upgrades = GameEngine.state.upgrades;

        // Create state snapshot
        const currentState = JSON.stringify(upgrades);

        // Only re-render if state changed
        if (this.lastUpgradesState === currentState) return;

        const upgradeDefs = GameEngine.definitions.upgrades;
        let html = "";

        for (let upgradeId in upgrades) {
            const upgrade = upgrades[upgradeId];
            const def = upgradeDefs[upgradeId];

            if (!upgrade.unlocked) continue;

            const cost = GameEngine.getUpgradeCost(upgradeId);
            const canAfford = GameEngine.state.resources[def.costResource] >= cost;
            const isMaxLevel = upgrade.level >= def.maxLevel;

            const effectPercent = (def.effectPerLevel * 100).toFixed(0);
            const currentBonus = (def.effectPerLevel * upgrade.level * 100).toFixed(0);

            html += `
                <div class="upgrade">
                    <div class="upgrade-header">
                        <span class="upgrade-name">${def.name}</span>
                        <span class="upgrade-level">Level ${upgrade.level}/${def.maxLevel}</span>
                    </div>
                    <div class="upgrade-effect">${def.description}</div>
                    <div class="upgrade-effect">Effect: +${effectPercent}% ${def.affectsResource} per level (Current: +${currentBonus}%)</div>
                    ${!isMaxLevel ? `
                        <div class="upgrade-cost">Cost: ${this.formatNumber(cost)} ${def.costResource}</div>
                        <button onclick="purchaseUpgrade('${upgradeId}')" ${!canAfford ? "disabled" : ""}>
                            Upgrade (${upgrade.level + 1})
                        </button>
                    ` : `
                        <div style="color: #4caf50; font-weight: bold;">MAX LEVEL</div>
                    `}
                </div>
            `;
        }

        if (html === "") {
            html = "<div style='color: #888;'>No upgrades available yet...</div>";
        }

        container.innerHTML = html;
        this.lastUpgradesState = currentState;
    },

    /**
     * Update skills display
     */
    updateSkills() {
        const container = document.getElementById("skillsDisplay");
        const skills = GameEngine.state.skills;

        // Create state snapshot
        const currentState = JSON.stringify(skills);

        // Only re-render if state changed
        if (this.lastSkillsState === currentState) return;

        const skillDefs = GameEngine.definitions.skills;
        let html = "";

        // Define skill order and groups
        const prioritySkills = ['navigation', 'engineering'];
        const gatheringSkills = ['mining', 'logging', 'fishing', 'hunting', 'foraging', 'thieving', 'combat'];
        const craftingSkills = ['forging', 'machining', 'cooking', 'chemistry', 'textiles'];

        // Helper function to render a skill
        const renderSkill = (skillId, color) => {
            const skill = skills[skillId];
            const def = skillDefs[skillId];

            if (!skill || !skill.unlocked) return '';

            // Skip combat skill - it's shown in the combat view
            if (skillId === 'combat') return '';

            const expRequired = GameEngine.getSkillExpRequired(skillId);
            const expPercent = (skill.exp / expRequired) * 100;

            // Make gathering skills, navigation, and crafting skills clickable
            const isGatheringSkill = gatheringSkills.includes(skillId) && skillId !== 'combat';
            const isNavigationSkill = skillId === 'navigation';
            const isCraftingSkill = craftingSkills.includes(skillId);
            const isClickable = isGatheringSkill || isNavigationSkill || isCraftingSkill;

            let clickHandler = '';
            if (isGatheringSkill) {
                clickHandler = `onclick="selectSkillForNodes('${skillId}')"`;
            } else if (isNavigationSkill) {
                clickHandler = `onclick="switchView('navigation')"`;
            } else if (isCraftingSkill) {
                clickHandler = `onclick="openCraftingForSkill('${skillId}')"`;
            }

            const hoverClass = isClickable ? 'skill-clickable' : '';

            return `
                <div class="skill ${hoverClass}" ${clickHandler}>
                    <div class="skill-header">
                        <span class="skill-name" style="color: ${color};">${def.name}</span>
                        <span class="skill-level">Level ${skill.level}</span>
                    </div>
                    <div class="upgrade-effect">${def.description}</div>
                    ${isGatheringSkill ? '<div style="font-size: 0.75em; color: #4a9eff; margin-top: 3px;">👆 Click to view nodes</div>' : ''}
                    ${isNavigationSkill ? '<div style="font-size: 0.75em; color: #4a9eff; margin-top: 3px;">👆 Click to open navigation</div>' : ''}
                    ${isCraftingSkill ? '<div style="font-size: 0.75em; color: #4a9eff; margin-top: 3px;">👆 Click to open crafting</div>' : ''}
                    <div class="skill-exp-bar">
                        <div class="skill-exp-fill" style="width: ${expPercent}%; transition: width 0.3s ease-out;"></div>
                    </div>
                    <div style="font-size: 0.75em; color: #888; margin-top: 3px;">
                        ${this.formatNumber(skill.exp)}/${this.formatNumber(expRequired)} EXP
                    </div>
                </div>
            `;
        };

        // Render Priority Skills (Gold color)
        html += '<div style="margin-bottom: 15px; border-bottom: 1px solid #444; padding-bottom: 5px;"><strong style="color: #ffd700; font-size: 1.1em;">⭐ Priority Skills</strong></div>';
        for (let skillId of prioritySkills) {
            html += renderSkill(skillId, '#ffd700');
        }

        // Render Gathering Skills (Green color)
        html += '<div style="margin: 20px 0 15px 0; border-bottom: 1px solid #444; padding-bottom: 5px;"><strong style="color: #4caf50; font-size: 1.1em;">🌿 Gathering Skills</strong></div>';
        for (let skillId of gatheringSkills) {
            html += renderSkill(skillId, '#4caf50');
        }

        // Render Crafting Skills (Blue color)
        html += '<div style="margin: 20px 0 15px 0; border-bottom: 1px solid #444; padding-bottom: 5px;"><strong style="color: #2196f3; font-size: 1.1em;">🔧 Crafting Skills</strong></div>';
        for (let skillId of craftingSkills) {
            html += renderSkill(skillId, '#2196f3');
        }

        container.innerHTML = html;
        this.lastSkillsState = currentState;
    },

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
     * Update bank interface
     */
    updateBank() {
        const bank = GameEngine.state.bank;

        // Create a snapshot of current bank state
        const currentState = {
            activeTab: bank.activeTab,
            itemsHash: JSON.stringify(bank.items),
            newItemsCount: bank.newItems.length
        };

        // Only re-render if something actually changed
        const hasChanged = !this.lastBankState ||
            this.lastBankState.activeTab !== currentState.activeTab ||
            this.lastBankState.itemsHash !== currentState.itemsHash ||
            this.lastBankState.newItemsCount !== currentState.newItemsCount;

        if (hasChanged) {
            this.updateBankStats();
            this.updateBankTabs();
            this.updateBankGrid();
            this.lastBankState = currentState;
        }
    },

    /**
     * Update bank statistics
     */
    updateBankStats() {
        const container = document.getElementById("bankStats");
        if (!container) return;

        const bank = GameEngine.state.bank;

        const totalItems = Object.keys(bank.items).length;
        const totalQuantity = Object.values(bank.items).reduce((sum, item) => sum + item.quantity, 0);
        const newItemCount = bank.newItems.length;

        let html = `
            <strong>Total Items:</strong> ${totalItems} types |
            <strong>Total Quantity:</strong> ${totalQuantity} |
            <strong>New Items:</strong> <span style="color: #ffeb3b;">${newItemCount}</span>
        `;

        container.innerHTML = html;
    },

    /**
     * Update bank tabs
     */
    updateBankTabs() {
        const container = document.getElementById("bankTabs");
        if (!container) return;

        const bank = GameEngine.state.bank;

        // Sort tabs by order
        const sortedTabs = Object.entries(bank.tabs).sort((a, b) => a[1].order - b[1].order);

        let html = "";

        for (let [tabId, tab] of sortedTabs) {
            const isActive = bank.activeTab === tabId;
            const itemCount = GameEngine.getItemsInTab(tabId).length;

            html += `
                <button
                    class="bank-tab ${isActive ? 'active' : ''}"
                    onclick="switchBankTab('${tabId}')"
                >
                    ${tab.icon} ${tab.name} (${itemCount})
                </button>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Update bank item grid
     */
    updateBankGrid() {
        const container = document.getElementById("bankGrid");
        if (!container) return;

        const activeTab = GameEngine.state.bank.activeTab;
        const items = GameEngine.getItemsInTab(activeTab);

        if (items.length === 0) {
            container.innerHTML = '<div class="bank-empty">No items in this tab yet...<br><br>💡 Use debug buttons to add items!</div>';
            return;
        }

        let html = "";

        for (let item of items) {
            const def = item.definition;
            const isNew = item.isNew;
            const stackInfo = def.stackLimit === Infinity ? "∞" : `${item.quantity}/${def.stackLimit}`;

            html += `
                <div class="bank-item ${isNew ? 'new' : ''}"
                     onclick="inspectItem('${item.itemId}')"
                     oncontextmenu="showContextMenu(event, '${item.itemId}'); return false;"
                     title="${def.description}">
                    <div class="bank-item-stack-limit">${stackInfo}</div>
                    <div class="bank-item-image">${def.image}</div>
                    <div class="bank-item-name">${def.name}</div>
                    <div class="bank-item-quantity">${this.formatNumber(item.quantity)}</div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Update equipment display
     */
    updateEquipment() {
        const equipment = GameEngine.state.equipment;
        const playerHealth = GameEngine.state.combat.player.currentHealth;

        // Create state snapshot
        const currentState = {
            equipment: JSON.stringify(equipment),
            health: playerHealth
        };

        // Only re-render if state changed
        if (this.lastEquipmentState &&
            this.lastEquipmentState.equipment === currentState.equipment &&
            this.lastEquipmentState.health === currentState.health) return;

        this.updatePlayerStats();
        this.updateEquipmentSlots();
        this.lastEquipmentState = currentState;
    },

    /**
     * Update player stats display
     */
    updatePlayerStats() {
        const container = document.getElementById("playerStats");
        if (!container) return;

        const stats = GameEngine.getPlayerCombatStats();

        let html = `
            <div class="stat-row">
                <span class="stat-label">⚔️ Attack Damage:</span>
                <span class="stat-value">${stats.attackDamage.toFixed(1)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⚡ Attack Speed:</span>
                <span class="stat-value">${stats.attackSpeed.toFixed(2)}/s</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🎯 Accuracy:</span>
                <span class="stat-value">${stats.accuracy.toFixed(0)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">❤️ Health:</span>
                <span class="stat-value">${Math.floor(stats.currentHealth)}/${Math.floor(stats.maxHealth)}</span>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Update equipment slots display
     */
    updateEquipmentSlots() {
        const container = document.getElementById("equipmentGrid");
        if (!container) return;

        const equipment = GameEngine.state.equipment;
        const slots = ["weapon", "shield", "helmet", "chest", "legs", "neck", "ring", "back"];

        let html = "";

        for (let slot of slots) {
            const itemId = equipment[slot];
            const isEquipped = itemId !== null;

            let slotContent = "";

            if (isEquipped) {
                const itemDef = GameEngine.definitions.items[itemId];
                slotContent = `
                    <div class="equipment-item-icon">${itemDef.image}</div>
                    <div class="equipment-item-name">${itemDef.name}</div>
                    <button onclick="unequipItem('${slot}', event)" style="margin-top: 8px; padding: 4px 8px; font-size: 0.8em;">Unequip</button>
                `;
            } else {
                slotContent = `
                    <div class="equipment-empty">Click to equip</div>
                    <div style="font-size: 2em; margin: 10px 0; opacity: 0.3;">📦</div>
                `;
            }

            html += `
                <div class="equipment-slot ${isEquipped ? 'equipped' : ''}" onclick="openEquipModal('${slot}')" style="cursor: pointer;">
                    <div class="equipment-slot-label">${this.capitalizeFirst(slot)}</div>
                    ${slotContent}
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * Render combat stats section (skill + attributes)
     */
    renderCombatStats() {
        const combatSkill = GameEngine.state.skills.combat;
        const combatSkillDef = GameEngine.definitions.skills.combat;
        const attributes = GameEngine.state.combatAttributes;
        const attributeDefs = GameEngine.definitions.combatAttributes;
        const unassignedPoints = GameEngine.state.characterLevel.unassignedAttributePoints;

        const expRequired = GameEngine.getSkillExpRequired('combat');
        const expPercent = (combatSkill.exp / expRequired) * 100;

        let html = `
            <div style="background: #2a2a3a; border: 2px solid #4a9eff; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <!-- Combat Skill Display -->
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #444;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 1.1em; font-weight: bold;">⚔️ ${combatSkillDef.name}</span>
                        <span style="font-weight: bold; color: #4a9eff;">Level ${combatSkill.level}</span>
                    </div>
                    <div style="font-size: 0.85em; color: #aaa; margin-bottom: 8px;">${combatSkillDef.description}</div>
                    <div style="width: 100%; height: 12px; background: rgba(0,0,0,0.5); border-radius: 6px; overflow: hidden; margin-bottom: 3px;">
                        <div style="width: ${expPercent}%; height: 100%; background: linear-gradient(90deg, #e74c3c, #c0392b); transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 0.75em; color: #888;">
                        ${this.formatNumber(combatSkill.exp)}/${this.formatNumber(expRequired)} EXP
                    </div>
                </div>

                <!-- Combat Attributes Header -->
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 1.05em;">Combat Attributes</strong>
                        ${unassignedPoints > 0 ? `
                            <span style="color: #ffd700; font-weight: bold; animation: pulse 1.5s infinite;">
                                📈 ${unassignedPoints} Point${unassignedPoints !== 1 ? 's' : ''} Available
                            </span>
                        ` : ''}
                    </div>
                </div>

                <!-- Attributes Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        `;

        // Render each attribute
        for (let attrId in attributeDefs) {
            const attrDef = attributeDefs[attrId];
            const attrValue = attributes[attrId];
            const icon = this.getAttributeIcon(attrId);

            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 4px; padding: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: bold;">${icon} ${attrDef.name}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #4a9eff; font-weight: bold; font-size: 1.1em;">${attrValue}</span>
                            ${unassignedPoints > 0 ? `
                                <button onclick="assignPoint('${attrId}')" style="padding: 4px 10px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; cursor: pointer; font-size: 0.9em; font-weight: bold;">
                                    +
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div style="font-size: 0.75em; color: #aaa; margin-bottom: 4px;">${attrDef.description}</div>
                    <div style="font-size: 0.7em; color: #888;">
                        ${this.getAttributeEffectDisplay(attrId, attrValue, attrDef)}
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Get icon for attribute
     */
    getAttributeIcon(attrId) {
        const icons = {
            health: '❤️',
            defense: '🛡️',
            strength: '💪',
            stealth: '🥷',
            perception: '👁️',
            mobility: '⚡',
            intellect: '🧠'
        };
        return icons[attrId] || '📊';
    },

    /**
     * Get effect label for attribute
     */
    getAttributeEffectLabel(attrId) {
        const labels = {
            health: 'HP',
            defense: '% damage reduction',
            strength: 'physical damage',
            stealth: 'stealth effectiveness',
            perception: 'perception',
            mobility: 'mobility',
            intellect: 'intellect'
        };
        return labels[attrId] || '';
    },

    /**
     * Get formatted effect display for attribute
     */
    getAttributeEffectDisplay(attrId, attrValue, attrDef) {
        const effect = attrValue * attrDef.effectPerPoint;

        // Different formatting based on attribute type
        switch (attrId) {
            case 'health':
                return `Effect: +${this.formatNumber(effect)} max HP`;

            case 'defense':
                return `Effect: ${this.formatNumber(effect * 100)}% damage reduction`;

            case 'strength':
                return `Effect: +${this.formatNumber(effect)} attack damage`;

            case 'stealth':
                return `Effect: +${this.formatNumber(effect * 100)}% thieving success`;

            case 'perception':
                return `Effect: +${this.formatNumber(effect)}% accuracy`;

            case 'mobility':
                return `Effect: +${this.formatNumber(effect * 100)}% attack speed`;

            case 'intellect':
                return `Effect: +${this.formatNumber(effect * 100)}% skill XP gain`;

            default:
                return `Effect: +${this.formatNumber(effect)}`;
        }
    },

    /**
     * Update combat display
     */
    updateCombat() {
        const container = document.getElementById("combatArea");
        if (!container) return;

        const combat = GameEngine.state.combat;

        // Create state snapshot
        const currentState = {
            inCombat: combat.inCombat,
            enemy: combat.currentEnemy ? JSON.stringify({
                name: combat.currentEnemy.name,
                currentHealth: combat.currentEnemy.currentHealth,
                maxHealth: combat.currentEnemy.maxHealth
            }) : null,
            playerHealth: combat.player.currentHealth,
            logLength: combat.combatLog.length,
            combatLevel: GameEngine.state.skills.combat.level,
            combatExp: GameEngine.state.skills.combat.exp,
            unassignedPoints: GameEngine.state.characterLevel.unassignedAttributePoints,
            attributes: JSON.stringify(GameEngine.state.combatAttributes),
            waitingForRespawn: combat.waitingForRespawn,
            respawnTime: combat.waitingForRespawn ? Math.floor((Date.now() - combat.enemyDefeatedAt) / 100) : 0,  // Update every 100ms
            lootCount: combat.pendingLoot.length
        };

        // Only re-render if state changed
        if (this.lastCombatState &&
            this.lastCombatState.inCombat === currentState.inCombat &&
            this.lastCombatState.enemy === currentState.enemy &&
            this.lastCombatState.playerHealth === currentState.playerHealth &&
            this.lastCombatState.logLength === currentState.logLength &&
            this.lastCombatState.combatLevel === currentState.combatLevel &&
            this.lastCombatState.combatExp === currentState.combatExp &&
            this.lastCombatState.unassignedPoints === currentState.unassignedPoints &&
            this.lastCombatState.attributes === currentState.attributes &&
            this.lastCombatState.waitingForRespawn === currentState.waitingForRespawn &&
            this.lastCombatState.respawnTime === currentState.respawnTime &&
            this.lastCombatState.lootCount === currentState.lootCount) return;

        if (combat.inCombat && combat.currentEnemy) {
            // Show active combat
            container.innerHTML = this.renderActiveCombat();
        } else if (combat.waitingForRespawn) {
            // Show respawn timer
            container.innerHTML = this.renderRespawnTimer();
        } else {
            // Show enemy selection
            container.innerHTML = this.renderEnemySelection();
        }

        this.lastCombatState = currentState;
    },

    /**
     * Render active combat UI
     */
    renderActiveCombat() {
        const enemy = GameEngine.state.combat.currentEnemy;
        const player = GameEngine.state.combat.player;
        const playerStats = GameEngine.getPlayerCombatStats();
        const combatLog = GameEngine.state.combat.combatLog;

        const enemyHealthPercent = (enemy.currentHealth / enemy.maxHealth) * 100;
        const playerHealthPercent = (playerStats.currentHealth / playerStats.maxHealth) * 100;

        // Start with combat stats
        let html = this.renderCombatStats();

        // Add loot box if there's pending loot
        html += this.renderLootBox();

        html += `
            <!-- Enemy Display -->
            <div class="enemy-display">
                <div class="enemy-icon">${enemy.image}</div>
                <div class="enemy-name">${enemy.name}</div>

                <!-- Enemy Health Bar -->
                <div style="margin: 10px 0;">
                    <strong>Enemy Health:</strong>
                    <div class="health-bar">
                        <div class="health-bar-fill" style="width: ${enemyHealthPercent}%; background: linear-gradient(90deg, #e74c3c, #c0392b); transition: width 0.3s ease-out;"></div>
                        <div class="health-bar-text">${Math.max(0, Math.floor(enemy.currentHealth))}/${enemy.maxHealth}</div>
                    </div>
                </div>

                <!-- Enemy Stats -->
                <div style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    Damage: ${enemy.attackDamage} | Speed: ${enemy.attackSpeed}/s | Accuracy: ${enemy.accuracy}%
                </div>
            </div>

            <!-- Player Health Bar -->
            <div style="margin: 15px 0;">
                <strong>Your Health:</strong>
                <div class="health-bar">
                    <div class="health-bar-fill" style="width: ${playerHealthPercent}%; background: linear-gradient(90deg, #27ae60, #229954); transition: width 0.3s ease-out;"></div>
                    <div class="health-bar-text">${Math.max(0, Math.floor(playerStats.currentHealth))}/${Math.floor(playerStats.maxHealth)}</div>
                </div>
            </div>

            <!-- Combat Controls -->
            <div class="combat-controls">
                <button class="attack-button" onclick="attack()">⚔️ Attack</button>
                <button onclick="flee()">🏃 Flee</button>
            </div>

            <!-- Combat Log -->
            <div style="margin-top: 15px;">
                <strong>Combat Log:</strong>
                <div class="combat-log" id="combatLog">
                    ${combatLog.map(entry => `<div class="combat-log-entry">${entry.message}</div>`).reverse().join('')}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render loot box UI
     */
    renderLootBox() {
        const pendingLoot = GameEngine.state.combat.pendingLoot;

        if (pendingLoot.length === 0) {
            return '';
        }

        // Aggregate all loot
        const aggregatedLoot = {
            currencies: {},
            items: {}
        };

        for (let lootDrop of pendingLoot) {
            for (let item of lootDrop.items) {
                if (item.type === 'currency') {
                    aggregatedLoot.currencies[item.id] = (aggregatedLoot.currencies[item.id] || 0) + item.amount;
                } else if (item.type === 'item') {
                    aggregatedLoot.items[item.id] = (aggregatedLoot.items[item.id] || 0) + item.amount;
                }
            }
        }

        let html = `
            <div style="background: #2a2a3a; border: 2px solid #ffd700; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="font-size: 1.1em;">📦 Loot</strong>
                    <button onclick="collectLoot()" style="padding: 6px 12px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">
                        ✅ Collect All
                    </button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;">
        `;

        // Render currencies
        for (let currencyId in aggregatedLoot.currencies) {
            const amount = aggregatedLoot.currencies[currencyId];
            const icon = currencyId === 'gold' ? '💰' : '🏅';
            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 4px; padding: 6px; text-align: center;">
                    <div style="font-size: 1.5em;">${icon}</div>
                    <div style="font-size: 0.85em; font-weight: bold;">${this.formatNumber(amount)}</div>
                </div>
            `;
        }

        // Render items
        for (let itemId in aggregatedLoot.items) {
            const amount = aggregatedLoot.items[itemId];
            const itemDef = GameEngine.definitions.items[itemId];
            if (itemDef) {
                html += `
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 4px; padding: 6px; text-align: center;" title="${itemDef.name}">
                        <div style="font-size: 1.5em;">${itemDef.image}</div>
                        <div style="font-size: 0.85em; font-weight: bold;">×${amount}</div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render enemy selection UI
     */
    renderEnemySelection() {
        const enemies = GameEngine.definitions.enemies;
        const combatSkill = GameEngine.state.skills.combat;

        // Start with combat stats
        let html = this.renderCombatStats();

        html += `
            <div style="margin-bottom: 15px;">
                <strong>Select an enemy to fight:</strong>
            </div>
            <div class="enemy-select">
        `;

        for (let enemyId in enemies) {
            const enemy = enemies[enemyId];
            const canFight = GameEngine.meetsRequirement(enemy.unlockRequirement);

            let disabledReason = "";
            if (!canFight && enemy.unlockRequirement) {
                if (enemy.unlockRequirement.combat) {
                    disabledReason = `Req: Combat ${enemy.unlockRequirement.combat}`;
                }
            }

            html += `
                <button
                    class="enemy-button"
                    onclick="startFight('${enemyId}')"
                    ${!canFight ? 'disabled' : ''}
                    title="${enemy.description}"
                >
                    <div class="enemy-button-icon">${enemy.image}</div>
                    <div class="enemy-button-name">${enemy.name}</div>
                    ${disabledReason ? `<div style="font-size: 0.7em; color: #f88; margin-top: 3px;">${disabledReason}</div>` : ''}
                </button>
            `;
        }

        html += `
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #2a2a3a; border-radius: 4px; font-size: 0.85em; color: #aaa;">
                💡 Tip: Equip weapons and armor from the bank to increase your combat effectiveness!
            </div>
        `;

        return html;
    },

    /**
     * Render respawn timer UI
     */
    renderRespawnTimer() {
        const combat = GameEngine.state.combat;
        const enemyId = combat.selectedEnemyId;
        const enemyDef = GameEngine.definitions.enemies[enemyId];
        const combatLog = combat.combatLog;

        // Start with combat stats
        let html = this.renderCombatStats();

        // Add loot box if there's pending loot
        html += this.renderLootBox();

        // Calculate time remaining
        const now = Date.now();
        const timeSinceDefeat = now - combat.enemyDefeatedAt;
        const timeRemaining = Math.max(0, enemyDef.respawnTime - timeSinceDefeat);
        const secondsRemaining = Math.ceil(timeRemaining / 1000);

        html += `
            <div style="text-align: center; padding: 30px; background: #2a2a3a; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 3em; margin-bottom: 10px;">${enemyDef.image}</div>
                <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">${enemyDef.name}</div>
                <div style="color: #aaa; margin-bottom: 20px;">Respawning...</div>
                <div style="font-size: 2em; color: #4a9eff; font-weight: bold;">${secondsRemaining}s</div>
                <button onclick="flee()" style="margin-top: 20px; padding: 8px 16px; background: #e74c3c; border: 1px solid #c0392b; border-radius: 4px; color: white; cursor: pointer; font-size: 1em;">
                    🏃 Stop Farming
                </button>
            </div>

            <!-- Combat Log -->
            <div style="margin-top: 15px;">
                <strong>Combat Log:</strong>
                <div style="background: #2a2a2a; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; margin-top: 5px; font-size: 0.85em;">
        `;

        // Show last 10 log messages
        const recentLogs = combatLog.slice(-10);
        for (let log of recentLogs) {
            html += `<div style="margin: 3px 0;">${log.message}</div>`;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Update resource nodes display
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
     * Update active node collection display
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
        const healthPercent = (activeNode.currentHealth / nodeDef.maxHealth) * 100;
        const pickaxeDamage = GameEngine.getPickaxeDamage();

        // Only rebuild HTML if node changed, otherwise just update the health values
        if (this.lastActiveNodeId !== activeNode.nodeId) {
            let html = `
                <div style="padding: 15px; background: #2a2a3a; border-radius: 4px; border: 2px solid #4a9eff;">
                    <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 10px;">
                        ${nodeDef.image} Collecting: ${nodeDef.name}
                    </div>
                    <div style="margin: 10px 0;">
                        <strong>Node Health:</strong>
                        <div class="health-bar">
                            <div class="health-bar-fill" id="nodeHealthFill" style="width: ${healthPercent}%; background: linear-gradient(90deg, #8b4513, #a0522d); transition: width 0.3s ease-out;"></div>
                            <div class="health-bar-text" id="nodeHealthText">${Math.max(0, Math.floor(activeNode.currentHealth))}/${nodeDef.maxHealth}</div>
                        </div>
                    </div>
                    <div style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                        ⛏️ Damage per second: ${pickaxeDamage}
                    </div>
                    <button onclick="stopNodeCollection()" style="margin-top: 10px; width: 100%;">
                        ⏹️ Stop Collecting
                    </button>
                </div>
            `;
            container.innerHTML = html;
            this.lastActiveNodeId = activeNode.nodeId;
        } else {
            // Just update the health bar and text
            const healthFill = document.getElementById("nodeHealthFill");
            const healthText = document.getElementById("nodeHealthText");
            if (healthFill) {
                healthFill.style.width = `${healthPercent}%`;
            }
            if (healthText) {
                healthText.textContent = `${Math.max(0, Math.floor(activeNode.currentHealth))}/${nodeDef.maxHealth}`;
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

        if (nodes.length === 0) {
            container.innerHTML = `
                <div style="margin-bottom: 15px; padding: 10px; background: #2a2a2a; border-radius: 5px;">
                    <strong>Current Region:</strong> ${regionName}
                </div>
                <div style="color: #888;">No nodes available for this skill in ${regionName}.</div>
            `;
            return;
        }

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: #2a2a2a; border-radius: 5px;">
                <strong>Current Region:</strong> ${regionName}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
        `;

        for (let nodeData of nodes) {
            const def = nodeData.definition;
            const isLocked = nodeData.locked;
            const isActive = activeNodeId === nodeData.nodeId;
            const bonusHealth = nodeData.bonusHealth || 0;
            const totalHealth = def.maxHealth + bonusHealth;

            html += `
                <div class="panel" style="padding: 15px; ${isLocked ? 'opacity: 0.5;' : ''} ${isActive ? 'border: 2px solid #4a9eff;' : ''}">
                    <div style="font-size: 2em; text-align: center; margin-bottom: 10px;">${def.image}</div>
                    <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">${def.name}</div>
                    <div style="font-size: 0.85em; color: #aaa; text-align: center; margin-bottom: 10px;">${def.description}</div>
                    <div style="font-size: 0.85em; margin-bottom: 5px;">
                        <strong>Required Level:</strong> ${def.skillLevel}
                    </div>
                    <div style="font-size: 0.85em; margin-bottom: 5px;">
                        <strong>Health:</strong> ${totalHealth}${bonusHealth > 0 ? ` <span style="color: #4caf50;">(+${bonusHealth})</span>` : ''}
                    </div>
                    <div style="font-size: 0.85em; margin-bottom: 10px;">
                        <strong>Fail Rate:</strong> ${Math.round(def.failRate * 100)}%
                    </div>
                    <div style="font-size: 0.85em; margin-bottom: 10px;">
                        <strong>Rewards:</strong><br>
                        ${this.formatNodeRewards(def.rewards)}
                    </div>
                    ${isActive ?
                        '<div style="color: #4a9eff; font-weight: bold; text-align: center;">✅ COLLECTING</div>' :
                        `<button onclick="startNodeCollection('${nodeData.nodeId}')" ${isLocked ? 'disabled' : ''} style="width: 100%;">
                            ${isLocked ? '🔒 Locked' : '▶️ Start Collecting'}
                        </button>`
                    }
                </div>
            `;
        }

        html += '</div></div>'; // Close grid and wrapper
        container.innerHTML = html;
    },

    /**
     * Format node rewards for display
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
                    <p>World Map Generated: ${worldMap ? `✓ (${Object.keys(worldMap).length} regions)` : '✗'}</p>
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
                worldMapKeys: worldMap ? Object.keys(worldMap).slice(0, 5) : 'null'
            });
            return;
        }

        // Create state snapshot
        const currentState = {
            regionId: regionId,
            isNavigating: activeNav.isNavigating,
            regionHealth: activeNav.regionHealth,
            currentActivity: state.currentActivity,
            discoveredNodes: JSON.stringify(regionState.discoveredNodeTypes),
            discoveredStations: JSON.stringify(regionState.discoveredCraftingStations),
            discoveredPaths: JSON.stringify(regionState.discoveredExitPaths),
            navigationLevel: state.skills.navigation.level,
            navigationExp: state.skills.navigation.exp
        };

        // Only re-render if state changed
        if (this.lastNavigationState && JSON.stringify(this.lastNavigationState) === JSON.stringify(currentState)) {
            return;
        }

        const stats = GameEngine.getNavigationStats();
        const regionHealthPercent = (activeNav.regionHealth / activeNav.maxRegionHealth) * 100;
        const isNavigating = activeNav.isNavigating && state.currentActivity === 'navigation';
        const hasOtherActivity = state.currentActivity !== null && state.currentActivity !== 'navigation';

        let html = `
            <!-- Hex Grid Map -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${this.worldMapCollapsed ? '0' : '10px'};">
                    <h3 style="margin: 0;">🗺️ World Map</h3>
                    <button onclick="toggleWorldMap()" style="padding: 5px 15px; font-size: 0.9em;">
                        ${this.worldMapCollapsed ? '▼ Expand Map' : '▲ Collapse Map'}
                    </button>
                </div>
                ${!this.worldMapCollapsed ? `
                    <div id="hexMapContainer" style="width: 100%; height: 600px; background: #1a1a1a; border-radius: 5px; overflow: hidden; position: relative; margin-top: 10px;">
                        ${this.renderHexMap()}
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #888; text-align: center;">
                        <span style="margin: 0 10px;">🔍 Scroll to zoom</span>
                        <span style="margin: 0 10px;">🖱️ Click and drag to pan</span>
                        <span style="margin: 0 10px;">📍 Click a region for details</span>
                    </div>
                ` : ''}
            </div>

            <!-- Current Region Info -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: ${biomeDef.color};">${biomeDef.icon} ${hexDef.name}</h3>
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 10px;">${hexDef.description}</div>
                <div style="font-size: 0.85em;">
                    <strong>Biome:</strong> ${biomeDef.name} |
                    <strong>Discovery Progress:</strong> ${regionState.discoveryProgress}%
                </div>
            </div>

            <!-- Navigation Stats -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">📊 Navigation Stats</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85em;">
                    <div><strong>Discovery Speed:</strong> ${(stats.discoveryInterval / 1000).toFixed(1)}s</div>
                    <div><strong>Discovery Damage:</strong> ${stats.discoveryDamage}</div>
                    <div><strong>Accuracy:</strong> ${stats.accuracy}%</div>
                    <div><strong>Navigation Level:</strong> ${state.skills.navigation.level}</div>
                </div>
            </div>

            <!-- Exploration Control -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">🧭 Exploration</h3>

                ${isNavigating ? `
                    <div style="margin-bottom: 10px;">
                        <strong>Region Health:</strong>
                        <div class="health-bar" style="margin-top: 5px;">
                            <div class="health-bar-fill" style="width: ${regionHealthPercent}%; background: #4a9eff; transition: width 0.3s ease-out;"></div>
                            <div class="health-bar-text">${Math.max(0, Math.floor(activeNav.regionHealth))}/${activeNav.maxRegionHealth}</div>
                        </div>
                        <div style="font-size: 0.75em; color: #888; margin-top: 3px;">Making discoveries...</div>
                    </div>
                    <button onclick="stopNavigating()" style="width: 100%; background: #d32f2f;">
                        ⏹️ Stop Exploring
                    </button>
                ` : `
                    <div style="margin-bottom: 10px; color: #888;">
                        ${hasOtherActivity ?
                            `<div style="color: #ff9800; margin-bottom: 10px;">⚠️ Currently ${state.currentActivity}: Will automatically stop when you start exploring</div>` :
                            '<div>Start exploring to discover resources, crafting stations, and exit paths!</div>'
                        }
                    </div>
                    <button onclick="startNavigating()" style="width: 100%;">
                        ${hasOtherActivity ? '🔄 Stop Current Activity & Start Exploring' : '▶️ Start Exploring'}
                    </button>
                `}
            </div>

            <!-- Discovered Resources -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">🌿 Discovered Resource Nodes</h3>
                ${this.renderDiscoveredNodes(regionState, biomeDef)}
            </div>

            <!-- Discovered Crafting Stations -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">🔧 Discovered Crafting Stations</h3>
                ${this.renderDiscoveredStations(regionState)}
            </div>

            <!-- Adjacent Regions & Travel -->
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0;">🗺️ Adjacent Regions</h3>
                ${this.renderAdjacentRegions(regionId, regionState, hexDef)}
            </div>
        `;

        container.innerHTML = html;
        this.lastNavigationState = currentState;
    },

    /**
     * Render discovered nodes for navigation view
     */
    renderDiscoveredNodes(regionState, biomeDef) {
        if (!regionState.discoveredNodeTypes || regionState.discoveredNodeTypes.length === 0) {
            return '<div style="color: #888; font-size: 0.9em;">No resource nodes discovered yet. Start exploring!</div>';
        }

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';

        for (let nodeId of regionState.discoveredNodeTypes) {
            const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
            const bonusHealth = regionState.nodeHealthBonuses?.[nodeId] || 0;
            const totalHealth = nodeDef.maxHealth + bonusHealth;

            // Check if player can collect this node
            const playerSkillLevel = GameEngine.state.skills[nodeDef.skill]?.level || 0;
            const canCollect = playerSkillLevel >= nodeDef.skillLevel;
            const isActive = GameEngine.state.nodeCollection.activeNode?.nodeId === nodeId;

            html += `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid ${isActive ? '#4a9eff' : '#444'}; cursor: ${canCollect ? 'pointer' : 'default'}; position: relative;"
                     ${canCollect ? `onclick="startCollectingFromNavigation('${nodeId}')" onmouseenter="this.style.borderColor='#4a9eff'" onmouseleave="this.style.borderColor='${isActive ? '#4a9eff' : '#444'}'"` : ''}
                     class="${canCollect ? 'node-clickable' : ''}">
                    <div style="font-weight: bold; margin-bottom: 5px;">${nodeDef.image} ${nodeDef.name}</div>
                    <div style="font-size: 0.8em; color: #aaa;">Health: ${totalHealth}</div>
                    ${bonusHealth > 0 ? `<div style="font-size: 0.75em; color: #4caf50;">+${bonusHealth} bonus</div>` : ''}
                    <div style="font-size: 0.75em; color: #888; margin-top: 5px;">${nodeDef.skill} Lv.${nodeDef.skillLevel}</div>
                    ${canCollect ? `
                        <div style="font-size: 0.75em; color: #4a9eff; margin-top: 5px;">
                            ${isActive ? '✅ Collecting' : '👆 Click to collect'}
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

        // Hex drawing constants
        const hexSize = 20; // Radius of hex
        const hexWidth = hexSize * Math.sqrt(3); // Width of hex
        const hexHeight = hexSize * 2; // Height of hex

        // Calculate SVG dimensions
        const svgWidth = 1200;
        const svgHeight = 600;
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;

        // Convert axial coordinates (q, r) to pixel coordinates
        const hexToPixel = (q, r) => {
            const x = centerX + hexSize * (3/2 * q);
            const y = centerY + hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
            return { x, y };
        };

        // Generate hex path
        const hexPath = (cx, cy) => {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i;
                const x = cx + hexSize * 0.9 * Math.cos(angle);
                const y = cy + hexSize * 0.9 * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return `M ${points.join(' L ')} Z`;
        };

        // Build SVG
        let svg = `
            <svg id="hexMapSVG" width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}"
                 style="background: #0a0a0a;" preserveAspectRatio="xMidYMid meet">
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
            const hasPath = regionState && regionState.discoveredExitPaths && regionState.discoveredExitPaths.length > 0;

            // Color based on state
            let fillColor = '#333'; // Unexplored
            let strokeColor = '#555';
            let opacity = 0.3;

            if (isDiscovered) {
                fillColor = biome.color;
                opacity = 0.7;
                strokeColor = '#888';
            }

            if (isCurrent) {
                strokeColor = '#4a9eff';
                opacity = 1;
            }

            // Create hex element
            svg += `
                <g class="hex-tile" data-region-id="${regionId}" style="cursor: pointer;"
                   onmouseenter="this.setAttribute('opacity', '1')"
                   onmouseleave="this.setAttribute('opacity', '${opacity}')"
                   onclick="showRegionPopup('${regionId}')">
                    <path d="${hexPath(x, y)}"
                          fill="${fillColor}"
                          stroke="${strokeColor}"
                          stroke-width="${isCurrent ? 3 : 1.5}"
                          opacity="${opacity}" />

                    ${isDiscovered ? `
                        <text x="${x}" y="${y + 5}"
                              text-anchor="middle"
                              font-size="10"
                              fill="white"
                              pointer-events="none"
                              style="font-weight: bold;">
                            ${biome.icon}
                        </text>
                    ` : ''}

                    ${isCurrent ? `
                        <circle cx="${x}" cy="${y}" r="3" fill="#4a9eff" />
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
    },

    /**
     * Update game info display
     */
    updateGameInfo() {
        const gameTime = GameEngine.state.gameTime;
        const lastSave = GameEngine.state.lastSave;

        // Create state snapshot (rounded to avoid constant re-renders)
        const currentState = {
            gameTime: Math.floor(gameTime / 10), // Update every 10 seconds
            lastSave: lastSave
        };

        // Only re-render if state changed
        if (this.lastGameInfoState &&
            this.lastGameInfoState.gameTime === currentState.gameTime &&
            this.lastGameInfoState.lastSave === currentState.lastSave) return;

        document.getElementById("gameTime").textContent = this.formatTime(gameTime);

        if (lastSave) {
            const timeSinceLastSave = (Date.now() - lastSave) / 1000;
            document.getElementById("lastSave").textContent = this.formatTime(timeSinceLastSave) + " ago";
        } else {
            document.getElementById("lastSave").textContent = "Never";
        }

        this.lastGameInfoState = currentState;
    },

    /**
     * Update character level display
     */
    updateCharacterLevel() {
        const charLevel = GameEngine.state.characterLevel;
        const expRequired = GameEngine.getCharacterExpRequired();
        const expPercent = (charLevel.exp / expRequired) * 100;

        // Update level
        document.getElementById("charLevel").textContent = charLevel.level;

        // Update XP text
        document.getElementById("charExpText").textContent =
            `${this.formatNumber(charLevel.exp)} / ${this.formatNumber(expRequired)} XP`;

        // Update XP bar
        document.getElementById("charExpBar").style.width = `${Math.min(expPercent, 100)}%`;

        // Update points display
        const pointsDisplay = document.getElementById("charPointsDisplay");
        if (charLevel.unassignedAttributePoints > 0) {
            pointsDisplay.style.display = "block";
            document.getElementById("charPoints").textContent = charLevel.unassignedAttributePoints;
        } else {
            pointsDisplay.style.display = "none";
        }
    },

    /**
     * Update currency display
     */
    updateCurrencies() {
        const currencies = GameEngine.state.currencies;

        // Update gold
        document.getElementById("goldAmount").textContent = this.formatNumber(currencies.gold);

        // Update medals
        document.getElementById("medalsAmount").textContent = this.formatNumber(currencies.medals);
    },

    /**
     * Update current activity display in header
     */
    updateCurrentActivity() {
        const state = GameEngine.state;
        const activityText = document.getElementById("activityText");
        const activityBar = document.getElementById("activityBar");
        const activityProgress = document.getElementById("activityProgress");

        // Default values
        let text = "Idle";
        let progress = 0;
        let progressText = "--";
        let barColor = "linear-gradient(90deg, #4caf50, #8bc34a)";

        if (state.currentActivity === 'nodeCollection' && state.nodeCollection.activeNode) {
            // Show node collection activity
            const activeNode = state.nodeCollection.activeNode;
            const nodeDef = GameEngine.definitions.resourceNodes[activeNode.nodeId];

            if (nodeDef) {
                text = `⛏️ ${nodeDef.name}`;
                progress = 100 - ((activeNode.currentHealth / activeNode.maxHealth) * 100);
                progressText = `${Math.floor(activeNode.currentHealth)} / ${activeNode.maxHealth} HP`;
                barColor = "linear-gradient(90deg, #2196F3, #03A9F4)";
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
            const enemy = state.combat.enemy;
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
                progress = this.calculateIntervalProgress(craft.startTime, craft.completionTime);
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
     * Update debug stats
     */
    updateDebugStats() {
        const rates = GameEngine.getProductionRates();
        const state = GameEngine.state;
        const regionDef = GameEngine.definitions.regions[state.currentRegion];

        let html = "<div style='margin-top: 10px;'>";
        html += "<strong>Production Rates:</strong><br>";
        html += `Gold: ${this.formatNumber(rates.gold)}/s<br>`;
        html += `Ore: ${this.formatNumber(rates.ore)}/s<br>`;
        html += `Wood: ${this.formatNumber(rates.wood)}/s<br>`;
        html += `<br><strong>Current Region:</strong><br>`;
        html += `${regionDef.name}<br>`;
        html += `Gathering Skills: ${Object.keys(regionDef.gatheringNodes || {}).join(", ")}<br>`;
        html += `<br><strong>Game Stats:</strong><br>`;
        html += `Total Ticks: ${Math.floor(state.gameTime * 10)}<br>`;
        html += `Tick Rate: ${state.tickRate}ms<br>`;
        html += "</div>";

        document.getElementById("debugStats").innerHTML = html;
    },

    /**
     * Update crafting display
     */
    updateCrafting(forceUpdate = false) {
        // Sync discovered stations from all regions to global crafting state
        this.syncCraftingStations();

        // Always update active crafts (progress bars change)
        this.updateActiveCrafts();

        // Only update stations if something changed (prevents destroying buttons during clicks)
        // Track last state to detect changes
        const currentState = {
            stations: GameEngine.state.crafting.discoveredStations.length,
            skill: GameEngine.state.crafting.selectedSkill,
            activeCrafts: GameEngine.state.crafting.activeCrafts.length
        };

        const stateKey = JSON.stringify(currentState);
        if (forceUpdate || this.lastCraftingState !== stateKey) {
            this.updateCraftingStations();
            this.lastCraftingState = stateKey;
        }
    },

    /**
     * Sync discovered crafting stations from regions to global crafting state
     */
    syncCraftingStations() {
        let synced = 0;

        for (let regionId in GameEngine.state.regions) {
            const regionState = GameEngine.state.regions[regionId];
            if (regionState.discoveredCraftingStations) {
                for (let stationId of regionState.discoveredCraftingStations) {
                    if (!GameEngine.state.crafting.discoveredStations.includes(stationId)) {
                        GameEngine.state.crafting.discoveredStations.push(stationId);
                        synced++;
                    }
                }
            }
        }

        if (synced > 0) {
            console.log(`🔄 Synced ${synced} new crafting stations`);
        }
    },

    /**
     * Update active crafts display
     */
    updateActiveCrafts() {
        const container = document.getElementById("activeCraftsDisplay");
        const activeCrafts = GameEngine.state.crafting.activeCrafts;
        const autoRecipe = GameEngine.state.crafting.autoRecipe;
        const isAutoCrafting = autoRecipe !== null;

        // Track state to avoid recreating HTML unnecessarily (prevents button click issues)
        const stateKey = JSON.stringify({
            count: activeCrafts.length,
            autoRecipe: autoRecipe,
            recipeId: activeCrafts[0]?.recipeId
        });

        // Only update structure when state changes, not every tick
        if (this.lastActiveCraftsState !== stateKey) {
            this.lastActiveCraftsState = stateKey;
            this.renderActiveCrafts(container, activeCrafts, autoRecipe, isAutoCrafting);
        } else {
            // Just update progress bars smoothly without recreating HTML
            this.updateActiveCraftsProgress(activeCrafts);
        }
    },

    /**
     * Render active crafts HTML structure (only when needed)
     */
    renderActiveCrafts(container, activeCrafts, autoRecipe, isAutoCrafting) {
        if (activeCrafts.length === 0) {
            container.innerHTML = '<div style="color: #888; font-size: 0.9em; padding: 10px; background: #1a1a1a; border-radius: 5px; text-align: center;">No active crafts</div>';
            return;
        }

        let html = '<div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">';

        // Auto-craft header with stop button
        if (isAutoCrafting) {
            const autoRecipeDef = GameEngine.definitions.recipes[autoRecipe];
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: #1a1a1a; border-radius: 5px; border: 2px solid #4caf50;">
                    <div>
                        <div style="font-weight: bold; color: #4caf50;">🔁 Auto-Crafting: ${autoRecipeDef.name}</div>
                        <div style="font-size: 0.8em; color: #888; margin-top: 3px;">Will repeat until stopped or out of materials</div>
                    </div>
                    <button onclick="stopAutoCrafting()" style="padding: 8px 16px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ⏹️ Stop
                    </button>
                </div>
            `;
        }

        html += '<h3 style="margin: 0 0 10px 0;">⏳ Current Craft</h3>';

        for (let craft of activeCrafts) {
            const recipe = GameEngine.definitions.recipes[craft.recipeId];
            const station = GameEngine.definitions.craftingNodes[craft.stationId];
            const now = Date.now();
            const elapsed = now - craft.startTime;
            const totalTime = craft.completionTime - craft.startTime;

            // Start at 0% for first 50ms to ensure smooth start from empty
            const progress = elapsed < 50 ? 0 : Math.min(100, (elapsed / totalTime) * 100);
            const remaining = Math.max(0, Math.ceil((craft.completionTime - now) / 1000));

            html += `
                <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 10px; border: 1px solid #444;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <span style="font-weight: bold; color: #4a9eff;">${recipe.name}</span>
                            <span style="font-size: 0.8em; color: #888; margin-left: 10px;">at ${station.image} ${station.name}</span>
                        </div>
                        <div id="craftRemaining" style="font-size: 0.85em; color: #4caf50;">
                            ${remaining}s remaining
                        </div>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden;">
                        <div id="craftProgressBar" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #9C27B0, #E91E63); transition: width 0.3s ease-out;"></div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Update active crafts progress bars only (no HTML recreation)
     */
    updateActiveCraftsProgress(activeCrafts) {
        if (activeCrafts.length === 0) return;

        const craft = activeCrafts[0];
        const now = Date.now();

        // Use global interval progress calculation for consistent behavior
        const progress = this.calculateIntervalProgress(craft.startTime, craft.completionTime);
        const remaining = Math.max(0, Math.ceil((craft.completionTime - now) / 1000));

        // Update progress bar width
        const progressBar = document.getElementById('craftProgressBar');
        if (progressBar) {
            const currentWidth = parseFloat(progressBar.style.width) || 0;

            // If progress decreased (new craft started), instantly jump to 0% then animate fill
            if (progress < currentWidth && progress === 0) {
                // Disable transition, set to 0, then re-enable transition
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';

                // Force reflow to apply the 0% immediately
                progressBar.offsetHeight;

                // Re-enable transition for smooth fill
                progressBar.style.transition = 'width 0.3s ease-out';
            } else {
                progressBar.style.width = `${progress}%`;
            }
        }

        // Update remaining time text
        const remainingText = document.getElementById('craftRemaining');
        if (remainingText) {
            remainingText.textContent = `${remaining}s remaining`;
        }
    },

    /**
     * Update crafting stations and recipes display
     */
    updateCraftingStations() {
        const container = document.getElementById("craftingDisplay");

        if (!container) {
            console.error("❌ craftingDisplay container not found!");
            return;
        }

        const discoveredStations = GameEngine.state.crafting.discoveredStations;
        const selectedSkill = GameEngine.state.crafting.selectedSkill;

        if (discoveredStations.length === 0) {
            container.innerHTML = `
                <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.2em; color: #888; margin-bottom: 10px;">No Crafting Stations Discovered</div>
                    <div style="color: #aaa; font-size: 0.9em;">Explore regions to discover crafting stations!</div>
                    ${regionalStations.length > 0 ? `
                        <div style="margin-top: 15px; padding: 10px; background: #ff9800; color: #000; border-radius: 5px;">
                            <strong>⚠️ DEBUG:</strong> Found ${regionalStations.length} region(s) with stations but they're not synced to global state.
                            <button onclick="UI.syncCraftingStations(); UI.updateCrafting();" style="margin-top: 5px; background: #fff; color: #000;">
                                🔄 Force Sync Now
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            return;
        }

        // Group stations by skill
        const stationsBySkill = {};
        for (let stationId of discoveredStations) {
            const station = GameEngine.definitions.craftingNodes[stationId];
            if (!stationsBySkill[station.skill]) {
                stationsBySkill[station.skill] = [];
            }
            stationsBySkill[station.skill].push({ id: stationId, def: station });
        }

        // Skill filter buttons
        let html = `
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">🔧 Crafting Skills</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button onclick="selectCraftingSkill(null)" class="craft-skill-btn" data-skill="null"
                            style="background: ${selectedSkill === null ? '#4a9eff' : '#555'}; padding: 8px 15px; font-size: 0.9em; cursor: pointer; border: none; border-radius: 4px; color: white;">
                        All Skills
                    </button>
        `;

        for (let skill in stationsBySkill) {
            const skillDef = GameEngine.state.skills[skill];
            html += `
                <button onclick="selectCraftingSkill('${skill}')" class="craft-skill-btn" data-skill="${skill}"
                        style="background: ${selectedSkill === skill ? '#4a9eff' : '#555'}; padding: 8px 15px; font-size: 0.9em; cursor: pointer; border: none; border-radius: 4px; color: white;">
                    ${this.capitalizeFirst(skill)} (Lv.${skillDef?.level || 1})
                </button>
            `;
        }

        html += '</div></div>';

        // Display recipes by station
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 15px;">';

        for (let skill in stationsBySkill) {
            // Filter by selected skill
            if (selectedSkill !== null && skill !== selectedSkill) continue;

            for (let stationData of stationsBySkill[skill]) {
                const station = stationData.def;
                const stationId = stationData.id;

                html += `
                    <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; border: 2px solid #444;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #444;">
                            <span style="font-size: 2em;">${station.image}</span>
                            <div>
                                <div style="font-weight: bold; font-size: 1.1em;">${station.name}</div>
                                <div style="font-size: 0.8em; color: #888;">${station.description}</div>
                            </div>
                        </div>
                        ${this.renderRecipesForStation(stationId, skill)}
                    </div>
                `;
            }
        }

        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Render recipes available at a crafting station
     */
    renderRecipesForStation(stationId, skill) {
        const recipes = GameEngine.definitions.recipes;
        const availableRecipes = [];

        // Find all recipes that can be crafted at this station
        for (let recipeId in recipes) {
            const recipe = recipes[recipeId];
            if (recipe.skill === skill && recipe.station.includes(stationId)) {
                availableRecipes.push({ id: recipeId, def: recipe });
            }
        }

        if (availableRecipes.length === 0) {
            return '<div style="color: #888; font-size: 0.85em; text-align: center; padding: 10px;">No recipes available</div>';
        }

        // Sort by skill level
        availableRecipes.sort((a, b) => a.def.skillLevel - b.def.skillLevel);

        let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';

        for (let recipeData of availableRecipes) {
            const recipe = recipeData.def;
            const recipeId = recipeData.id;
            const canCraftResult = GameEngine.canCraft(recipeId);
            const canCraft = canCraftResult.canCraft;
            const playerSkillLevel = GameEngine.state.skills[recipe.skill]?.level || 0;
            const meetsSkillLevel = playerSkillLevel >= recipe.skillLevel;

            html += `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; border: 1px solid ${canCraft ? '#4caf50' : '#555'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                        <div>
                            <div style="font-weight: bold; color: ${meetsSkillLevel ? '#4a9eff' : '#ff9800'};">
                                ${recipe.name}
                            </div>
                            <div style="font-size: 0.75em; color: #888;">${recipe.description}</div>
                        </div>
                        <div style="font-size: 0.75em; color: ${meetsSkillLevel ? '#4caf50' : '#ff9800'}; white-space: nowrap; margin-left: 10px;">
                            Lv.${recipe.skillLevel}
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px; margin: 8px 0; font-size: 0.8em;">
                        <div>
                            <div style="color: #aaa; margin-bottom: 3px;">Materials:</div>
                            ${recipe.inputs.map(input => {
                                const item = GameEngine.definitions.items[input.itemId];
                                const hasAmount = GameEngine.getItemCount(input.itemId);
                                const hasEnough = hasAmount >= input.amount;
                                return `<div style="color: ${hasEnough ? '#4caf50' : '#f44336'};">
                                    ${input.amount}x ${item?.name || input.itemId} ${hasEnough ? '✓' : `(${hasAmount})`}
                                </div>`;
                            }).join('')}
                        </div>
                        <div>
                            <div style="color: #aaa; margin-bottom: 3px;">Produces:</div>
                            ${recipe.outputs.map(output => {
                                const item = GameEngine.definitions.items[output.itemId];
                                return `<div style="color: #4a9eff;">
                                    ${output.amount}x ${item?.name || output.itemId}
                                </div>`;
                            }).join('')}
                        </div>
                        <div style="margin-left: auto;">
                            <div style="color: #aaa; margin-bottom: 3px;">Time:</div>
                            <div style="color: #9C27B0;">${Math.ceil(recipe.craftingTime / 1000)}s</div>
                        </div>
                    </div>

                    <button onclick="startCrafting('${recipeId}')" class="craft-btn" data-recipe="${recipeId}"
                            ${!canCraft ? 'disabled' : ''}
                            style="width: 100%; padding: 8px; font-size: 0.9em; cursor: ${canCraft ? 'pointer' : 'not-allowed'}; border: none; border-radius: 4px; background: ${canCraft ? '#4caf50' : '#666'}; color: white;">
                        ${canCraft ? '🔨 Craft' : `🔒 ${canCraftResult.reason}`}
                    </button>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Format numbers for display
     */
    formatNumber(num) {
        if (num < 10) {
            return num.toFixed(1);
        } else if (num < 1000) {
            return Math.floor(num).toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(1) + "K";
        } else if (num < 1000000000) {
            return (num / 1000000).toFixed(2) + "M";
        } else {
            return (num / 1000000000).toFixed(2) + "B";
        }
    },

    /**
     * Format time for display
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return Math.floor(seconds) + "s";
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    },

    /**
     * GLOBAL INTERVAL PROGRESS BAR SYSTEM
     * Calculates progress for all interval-based activities (crafting, collection, combat, navigation)
     * Ensures consistent behavior across all progress bars:
     *   - Start at 0% (empty bar)
     *   - Fill to 100% over activity duration
     *   - Brief visual pause at 100%
     *   - Reset to 0% for next cycle
     *
     * @param {number} startTime - Timestamp when interval started (ms)
     * @param {number} completionTime - Timestamp when interval completes (ms)
     * @returns {number} - Progress percentage (0-100)
     */
    calculateIntervalProgress(startTime, completionTime) {
        const now = Date.now();
        const elapsed = now - startTime;
        const totalTime = completionTime - startTime;

        // Grace period: Always show 0% for first 150ms
        // This ensures bars start empty even with render delays between
        // activity start and UI update (which can be 16-200ms)
        if (elapsed < 150) {
            return 0;
        }

        // Calculate and clamp progress to 0-100 range
        const rawProgress = (elapsed / totalTime) * 100;
        return Math.min(100, Math.max(0, rawProgress));
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// =============================================================================
// GLOBAL FUNCTIONS (Called from HTML)
// =============================================================================

/**
 * Purchase a generator
 */
function purchaseGenerator(genId) {
    const result = GameEngine.purchaseGenerator(genId);
    if (result.success) {
        UI.update();
    } else {
        console.log(`❌ Cannot purchase: ${result.reason}`);
    }
}

/**
 * Purchase an upgrade
 */
function purchaseUpgrade(upgradeId) {
    const result = GameEngine.purchaseUpgrade(upgradeId);
    if (result.success) {
        UI.update();
    } else {
        console.log(`❌ Cannot purchase: ${result.reason}`);
    }
}

/**
 * Save the game
 */
function saveGame() {
    SaveSystem.save();
    UI.update();
}

/**
 * Reset the game
 */
function resetGame() {
    if (confirm("Are you sure you want to reset all progress?")) {
        SaveSystem.deleteSave();
        GameEngine.reset();
        UI.update();
    }
}

/**
 * Assign an attribute point
 */
function assignPoint(attributeId) {
    const result = GameEngine.assignAttributePoint(attributeId);

    if (result.success) {
        const attrDef = GameEngine.definitions.combatAttributes[attributeId];
        console.log(`✨ Assigned point to ${attrDef.name}`);
        UI.update();
    } else {
        console.log(`❌ Could not assign point: ${result.reason}`);
    }
}

/**
 * Switch between different views
 */
function switchView(viewName) {
    // Update current view
    UI.currentView = viewName;

    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));

    // Show selected view
    const selectedView = document.getElementById(`view-${viewName}`);
    if (selectedView) {
        selectedView.classList.add('active');
    }

    // Update navigation menu active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Special handling for crafting view - ensure stations are synced
    if (viewName === 'crafting') {
        UI.syncCraftingStations();
    }

    // Force update of the new view
    UI.update();
}

/**
 * Explore the current region
 */
function explore() {
    const result = GameEngine.exploreRegion();

    if (result.success) {
        // Show discoveries if any
        if (result.discoveries && result.discoveries.length > 0) {
            const container = document.getElementById("discoveriesDisplay");
            let html = "<div style='margin-top: 10px;'><strong>New Discoveries!</strong>";

            for (let discovery of result.discoveries) {
                if (discovery.type === "node") {
                    const bonusPercent = (discovery.bonus * 100).toFixed(0);
                    html += `<div class="discovery">🔍 Found ${discovery.name}! (+${bonusPercent}% ${discovery.resource})</div>`;
                } else if (discovery.type === "location") {
                    html += `<div class="discovery">📍 Discovered ${discovery.name}!</div>`;
                }
            }

            html += "</div>";
            container.innerHTML = html;

            // Clear discoveries after 5 seconds
            setTimeout(() => {
                container.innerHTML = "";
            }, 5000);
        }

        UI.update();
    } else {
        console.log(`❌ Cannot explore: ${result.reason}`);
    }
}

/**
 * Travel to a different region
 */
function travelToRegion(regionId) {
    const result = GameEngine.changeRegion(regionId);

    if (result.success) {
        UI.update();
    } else {
        console.log(`❌ Cannot travel: ${result.reason}`);
    }
}

/**
 * Switch bank tab
 */
function switchBankTab(tabId) {
    const result = GameEngine.switchBankTab(tabId);

    if (result.success) {
        // Force bank re-render by clearing cache
        UI.lastBankState = null;
        UI.updateBank();
    } else {
        console.log(`❌ Cannot switch tab: ${result.reason}`);
    }
}

/**
 * Inspect an item (clear new status and show info)
 */
function inspectItem(itemId) {
    GameEngine.clearNewItemStatus(itemId);

    const bankItem = GameEngine.state.bank.items[itemId];
    const def = GameEngine.definitions.items[itemId];

    if (!bankItem || !def) return;

    console.log(`📦 ${def.name}`);
    console.log(`   ${def.description}`);
    console.log(`   Quantity: ${bankItem.quantity}`);
    console.log(`   Stack Limit: ${def.stackLimit === Infinity ? 'Unlimited' : def.stackLimit}`);
    console.log(`   Category: ${def.category}`);

    if (def.stats) {
        console.log(`   Stats:`, def.stats);
    }

    UI.update();
}

// =============================================================================
// NODE COLLECTION FUNCTIONS
// =============================================================================

/**
 * Select a skill and switch to nodes view
 */
function selectSkillForNodes(skillId) {
    console.log(`🎯 Selected skill: ${skillId}`);

    const result = GameEngine.selectSkillForNodes(skillId);

    if (result.success) {
        console.log(`✅ Switching to nodes view for ${skillId}`);
        switchView('nodes');
        // Force nodes update
        UI.lastNodesState = null;
        UI.updateNodes();
    } else {
        console.log(`❌ Failed to select skill: ${result.reason || 'Unknown error'}`);
    }
}

/**
 * Start collecting from a node
 */
function startNodeCollection(nodeId) {
    const result = GameEngine.startNodeCollection(nodeId);

    if (!result.success) {
        console.log(`❌ Cannot start collection: ${result.reason}`);
    } else {
        console.log(`⛏️ Started collecting!`);
        // Force nodes update
        UI.lastNodesState = null;
        UI.updateNodes();
    }
}

/**
 * Stop node collection
 */
function stopNodeCollection() {
    console.log("⏹️ Stop collection button clicked");
    const result = GameEngine.stopNodeCollection();

    if (result.success) {
        console.log("✅ Stopped collection successfully");
        // Force nodes update
        UI.lastNodesState = null;
        UI.updateNodes();
    } else {
        console.log("❌ Failed to stop collection");
    }
}

// =============================================================================
// EQUIPMENT FUNCTIONS
// =============================================================================

/**
 * Open equipment selection modal for a slot
 */
function openEquipModal(slot) {
    // Prevent unequip button from triggering modal
    if (event && event.target.tagName === 'BUTTON') {
        return;
    }

    const modal = document.getElementById("equipModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalGrid = document.getElementById("modalItemGrid");

    // Set modal title
    modalTitle.textContent = `Select ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;

    // Get all items in bank that can be equipped in this slot
    const bankItems = GameEngine.state.bank.items;
    const compatibleItems = [];

    for (let itemId in bankItems) {
        const def = GameEngine.definitions.items[itemId];
        if (def.equipSlot === slot && bankItems[itemId].quantity > 0) {
            compatibleItems.push({
                itemId: itemId,
                def: def,
                quantity: bankItems[itemId].quantity
            });
        }
    }

    // Render items
    let html = "";

    if (compatibleItems.length === 0) {
        html = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
            No compatible items in bank.<br>
            <span style="font-size: 0.9em;">Items for this slot: ${slot}</span>
        </div>`;
    } else {
        for (let item of compatibleItems) {
            html += `
                <div class="modal-item" onclick="equipFromModal('${item.itemId}', '${slot}')">
                    <div class="modal-item-icon">${item.def.image}</div>
                    <div class="modal-item-name">${item.def.name}</div>
                    <div style="font-size: 0.7em; color: #888; margin-top: 3px;">x${item.quantity}</div>
                </div>
            `;
        }
    }

    modalGrid.innerHTML = html;
    modal.style.display = "block";

    // Store current slot for later use
    modal.dataset.currentSlot = slot;
}

/**
 * Close equipment modal
 */
function closeEquipModal() {
    const modal = document.getElementById("equipModal");
    modal.style.display = "none";
}

/**
 * Equip an item from the modal
 */
function equipFromModal(itemId, slot) {
    const result = GameEngine.equipItem(itemId);

    if (result.success) {
        console.log(`⚔️ Equipped ${GameEngine.definitions.items[itemId].name}!`);
        closeEquipModal();
    } else {
        console.log(`❌ Cannot equip: ${result.reason}`);
    }

    // Force equipment and bank update
    UI.lastEquipmentState = null;
    UI.lastBankState = null;
    UI.updateEquipment();
    UI.updateBank();
}

/**
 * Unequip an item from a slot
 */
function unequipItem(slot, event) {
    // Stop propagation to prevent opening modal
    if (event) {
        event.stopPropagation();
    }

    const result = GameEngine.unequipItem(slot);

    if (!result.success) {
        console.log(`❌ Cannot unequip: ${result.reason}`);
    }

    // Force equipment and bank update
    UI.lastEquipmentState = null;
    UI.lastBankState = null;
    UI.updateEquipment();
    UI.updateBank();
}

/**
 * Show context menu on right-click
 */
function showContextMenu(event, itemId) {
    event.preventDefault();

    const contextMenu = document.getElementById("contextMenu");
    const def = GameEngine.definitions.items[itemId];

    // Build context menu
    let html = "";

    // If item is equippable, show equip option
    if (def.equipSlot) {
        html += `<div class="context-menu-item" onclick="equipItemFromContext('${itemId}')">⚔️ Equip ${def.name}</div>`;
    }

    html += `<div class="context-menu-item" onclick="inspectItem('${itemId}'); hideContextMenu();">👁️ Inspect</div>`;

    contextMenu.innerHTML = html;

    // Position the context menu at mouse position
    contextMenu.style.left = event.pageX + "px";
    contextMenu.style.top = event.pageY + "px";
    contextMenu.style.display = "block";
}

/**
 * Hide context menu
 */
function hideContextMenu() {
    const contextMenu = document.getElementById("contextMenu");
    contextMenu.style.display = "none";
}

/**
 * Equip item from context menu
 */
function equipItemFromContext(itemId) {
    const result = GameEngine.equipItem(itemId);

    if (result.success) {
        console.log(`⚔️ Equipped ${GameEngine.definitions.items[itemId].name}!`);
    } else {
        console.log(`❌ Cannot equip: ${result.reason}`);
    }

    hideContextMenu();
    // Force equipment and bank update
    UI.lastEquipmentState = null;
    UI.lastBankState = null;
    UI.updateEquipment();
    UI.updateBank();
}

// Close modal and context menu when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById("equipModal");
    const contextMenu = document.getElementById("contextMenu");

    if (event.target === modal) {
        closeEquipModal();
    }

    // Hide context menu on any click
    if (contextMenu.style.display === "block") {
        hideContextMenu();
    }
}

// =============================================================================
// COMBAT FUNCTIONS
// =============================================================================

/**
 * Start combat with an enemy
 */
function startFight(enemyId) {
    const result = GameEngine.startCombat(enemyId);

    if (!result.success) {
        console.log(`❌ Cannot start combat: ${result.reason}`);
    }

    // Force combat update
    UI.lastCombatState = null;
    UI.updateCombat();
}

/**
 * Player attacks
 */
function attack() {
    const result = GameEngine.playerAttack();

    if (!result.success && result.reason === "Attack on cooldown") {
        // Don't show error for cooldown - this is expected
        return;
    }

    // Force combat and equipment update
    UI.lastCombatState = null;
    UI.lastEquipmentState = null;
    UI.updateCombat();
    UI.updateEquipment();
}

/**
 * Flee from combat
 */
function flee() {
    const result = GameEngine.fleeCombat();

    if (result.success) {
        console.log("🏃 You fled from combat!");
    }

    // Force combat and equipment update
    UI.lastCombatState = null;
    UI.lastEquipmentState = null;
    UI.updateCombat();
    UI.updateEquipment();
}

/**
 * Collect all pending loot
 */
function collectLoot() {
    const result = GameEngine.collectLoot();

    if (result.success) {
        console.log("📦 Collected all loot!");
    }

    // Force UI update
    UI.update();
}

// =============================================================================
// NAVIGATION FUNCTIONS
// =============================================================================

function startNavigating() {
    const result = GameEngine.startNavigation();

    if (!result.success) {
        console.log(`❌ Cannot start navigating: ${result.reason}`);
    }

    UI.update();
}

function stopNavigating() {
    GameEngine.stopNavigation();
    UI.update();
}

function travelToRegion(regionId) {
    const result = GameEngine.travelToRegion(regionId);

    if (!result.success) {
        console.log(`❌ Cannot travel: ${result.reason}`);
    } else {
        console.log(`✈️ Traveled to ${result.region.name}`);
    }

    closeRegionPopup();
    UI.update();
}

function showRegionPopup(regionId) {
    const modal = document.getElementById("regionModal");
    const modalContent = document.getElementById("regionModalContent");

    const hexDef = GameEngine.definitions.worldMap[regionId];
    const biomeDef = GameEngine.definitions.biomes[hexDef?.biome];
    const regionState = GameEngine.state.regions[regionId];
    const currentRegionId = GameEngine.state.currentRegion;

    if (!hexDef || !biomeDef) {
        console.error(`Region ${regionId} not found`);
        return;
    }

    const isDiscovered = regionState?.discovered || false;
    const isCurrent = regionId === currentRegionId;
    const discoveredNodes = regionState?.discoveredNodeTypes || [];
    const discoveredStations = regionState?.discoveredCraftingStations || [];
    const discoveredPaths = regionState?.discoveredExitPaths || [];

    // Check if can travel
    const canTravelHere = GameEngine.canTravelToRegion(regionId);

    let html = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 3em; margin-bottom: 10px;">${biomeDef.icon}</div>
            <h2 style="margin: 0; color: ${biomeDef.color};">${hexDef.name}</h2>
            <div style="color: #888; margin-top: 5px;">${biomeDef.name} Biome</div>
            ${isCurrent ? '<div style="color: #4a9eff; margin-top: 5px;">📍 Current Location</div>' : ''}
        </div>

        <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="color: #aaa; margin: 0;">${hexDef.description}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; text-align: center;">
                <div style="font-size: 2em; color: #4caf50;">🌿</div>
                <div style="font-size: 1.5em; font-weight: bold;">${discoveredNodes.length}</div>
                <div style="font-size: 0.85em; color: #888;">Resource Nodes</div>
            </div>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; text-align: center;">
                <div style="font-size: 2em; color: #2196f3;">🔧</div>
                <div style="font-size: 1.5em; font-weight: bold;">${discoveredStations.length}</div>
                <div style="font-size: 0.85em; color: #888;">Crafting Stations</div>
            </div>
        </div>

        ${isDiscovered ? `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <div style="font-size: 0.9em; color: #888; margin-bottom: 10px;">
                    <strong>Exit Paths Discovered:</strong> ${discoveredPaths.length}
                </div>
                <div style="font-size: 0.9em; color: #888;">
                    <strong>Discovery Progress:</strong> ${regionState.discoveryProgress}%
                </div>
            </div>
        ` : `
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; margin-bottom: 15px; text-align: center; color: #888;">
                <div style="font-size: 2em; margin-bottom: 10px;">🔒</div>
                <div>This region has not been discovered yet.</div>
                ${hexDef.navigationRequirement > 0 ? `<div style="margin-top: 5px; font-size: 0.9em;">Requires Navigation Level ${hexDef.navigationRequirement}</div>` : ''}
            </div>
        `}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${!isCurrent && isDiscovered ? `
                <button onclick="switchToRegionAndExplore('${regionId}')"
                        style="background: #4a9eff; padding: 12px; font-size: 1em;">
                    🧭 Explore Region
                </button>
            ` : ''}

            ${!isCurrent ? `
                <button onclick="travelToRegion('${regionId}')"
                        ${!canTravelHere ? 'disabled' : ''}
                        style="padding: 12px; font-size: 1em; ${canTravelHere ? 'background: #4caf50;' : ''}">
                    ${canTravelHere ? '✈️ Travel Here' : '🔒 Path Not Discovered'}
                </button>
            ` : `
                <button disabled style="padding: 12px; font-size: 1em; grid-column: 1 / -1;">
                    📍 Already Here
                </button>
            `}

            <button onclick="closeRegionPopup()"
                    style="background: #666; padding: 12px; font-size: 1em; ${isCurrent || !isDiscovered ? 'grid-column: 1 / -1;' : ''}">
                Close
            </button>
        </div>
    `;

    modalContent.innerHTML = html;
    modal.style.display = "flex";
}

function switchToRegionAndExplore(regionId) {
    const result = GameEngine.travelToRegion(regionId);

    if (result.success) {
        closeRegionPopup();
        startNavigating();
    } else {
        console.log(`❌ Cannot travel: ${result.reason}`);
    }
}

function closeRegionPopup() {
    const modal = document.getElementById("regionModal");
    modal.style.display = "none";
}

function startCollectingFromNavigation(nodeId) {
    // Stop navigation if active
    if (GameEngine.state.activeNavigation.isNavigating) {
        GameEngine.stopNavigation();
    }

    // Get node definition to determine skill
    const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
    if (!nodeDef) {
        console.error(`Node ${nodeId} not found`);
        return;
    }

    // Select the appropriate skill for this node
    const skillResult = GameEngine.selectSkillForNodes(nodeDef.skill);
    if (!skillResult.success) {
        console.log(`❌ Cannot select skill: ${skillResult.reason}`);
        return;
    }

    // Start collecting the node
    const collectResult = GameEngine.startNodeCollection(nodeId);
    if (!collectResult.success) {
        console.log(`❌ Cannot start collecting: ${collectResult.reason}`);
        return;
    }

    console.log(`✅ Started collecting ${nodeDef.name}`);

    // Switch to nodes view to show the active collection
    switchView('nodes');
    UI.update();
}

/**
 * Toggle the world map collapsed state
 */
function toggleWorldMap() {
    UI.worldMapCollapsed = !UI.worldMapCollapsed;
    UI.updateNavigation();
}

// =============================================================================
// CRAFTING FUNCTIONS
// =============================================================================

/**
 * Select a crafting skill filter
 */
function selectCraftingSkill(skill) {
    GameEngine.state.crafting.selectedSkill = skill;
    UI.updateCrafting(true); // Force update when skill filter changes
}

/**
 * Start crafting a recipe
 */
function startCrafting(recipeId) {
    try {
        const result = GameEngine.startCraft(recipeId);

        if (result.success) {
            const recipe = GameEngine.definitions.recipes[recipeId];
            console.log(`✅ Started crafting ${recipe.name}`);
        } else {
            console.log(`❌ Cannot craft: ${result.reason}`);
            alert(`Cannot craft: ${result.reason}`);
        }
    } catch (error) {
        console.error(`💥 Error in startCrafting:`, error);
        alert(`Error: ${error.message}`);
    }

    UI.updateCrafting(true); // Force update to refresh material counts
}

/**
 * Stop auto-crafting
 */
function stopAutoCrafting() {
    GameEngine.stopAutoCraft();
    console.log('⏹️ Stopped auto-crafting');
    UI.updateCrafting(true);
}

/**
 * Open crafting view and select a specific skill
 */
function openCraftingForSkill(skill) {
    GameEngine.state.crafting.selectedSkill = skill;
    switchView('crafting');
}

/**
 * Open crafting view and select a specific station
 */
function openCraftingForStation(stationId) {
    const station = GameEngine.definitions.craftingNodes[stationId];
    if (station) {
        GameEngine.state.crafting.selectedSkill = station.skill;
        switchView('crafting');
    }
}

// =============================================================================
// DEBUG FUNCTIONS
// =============================================================================

const debug = {
    addGold() {
        GameEngine.state.currencies.gold += 1000;
        console.log("💰 Added 1000 gold");
        UI.update();
    },

    addOre() {
        GameEngine.state.resources.ore += 100;
        GameEngine.addItemToBank("ore", 100);
        console.log("⛏️ Added 100 ore");
        UI.update();
    },

    addWood() {
        GameEngine.state.resources.wood += 100;
        GameEngine.addItemToBank("wood", 100);
        console.log("🪓 Added 100 wood");
        UI.update();
    },

    skipTime() {
        // Skip 1 hour of game time
        const oneHour = 60 * 60; // seconds
        GameEngine.calculateOfflineProgress(oneHour * 1000);
        console.log("⏩ Skipped 1 hour");
        UI.update();
    },

    unlockAll() {
        // Unlock all generators
        for (let genId in GameEngine.state.generators) {
            GameEngine.state.generators[genId].unlocked = true;
        }

        // Unlock all upgrades
        for (let upgradeId in GameEngine.state.upgrades) {
            GameEngine.state.upgrades[upgradeId].unlocked = true;
        }

        console.log("🔓 Unlocked everything");
        UI.update();
    },

    maxUpgrades() {
        // Set all upgrades to max level
        for (let upgradeId in GameEngine.state.upgrades) {
            const def = GameEngine.definitions.upgrades[upgradeId];
            GameEngine.state.upgrades[upgradeId].level = def.maxLevel;
        }

        console.log("⬆️ Maxed all upgrades");
        UI.update();
    },

    maxSkills() {
        // Set all skills to level 10
        for (let skillId in GameEngine.state.skills) {
            GameEngine.state.skills[skillId].level = 10;
            GameEngine.state.skills[skillId].exp = 0;
        }

        console.log("🎯 Maxed all skills");
        UI.update();
    },

    addRandomItem() {
        // Add a random item to the bank
        const itemIds = Object.keys(GameEngine.definitions.items);
        const randomItemId = itemIds[Math.floor(Math.random() * itemIds.length)];
        const randomQuantity = Math.floor(Math.random() * 50) + 1;

        const result = GameEngine.addItemToBank(randomItemId, randomQuantity);

        if (result.success) {
            const def = GameEngine.definitions.items[randomItemId];
            console.log(`🎲 Added ${result.amountAdded}x ${def.name} to bank`);
        } else {
            console.log(`❌ Failed to add item: ${result.reason}`);
        }

        UI.update();
    },

    fillBank() {
        // Add all items to the bank with random quantities
        for (let itemId in GameEngine.definitions.items) {
            const quantity = Math.floor(Math.random() * 100) + 10;
            GameEngine.addItemToBank(itemId, quantity);
        }

        console.log("📦 Filled bank with all items");
        UI.update();
    },

    addEquipment() {
        // Add all equipment items to bank for testing
        const equipmentItems = [
            // Tools (Pickaxes)
            'bronzePickaxe', 'ironPickaxe', 'steelPickaxe', 'mithrilPickaxe',
            // Tools (Axes)
            'bronzeAxe', 'ironAxe', 'steelAxe',
            // Tools (Fishing Rods)
            'bambooPole', 'basicRod', 'carbonRod', 'masterRod',
            // Tools (Bows)
            'shortBow', 'longBow', 'compositeBow', 'legendaryBow',
            // Tools (Foraging)
            'wickerBasket', 'gatherersSatchel', 'herbalistKit', 'masterGatherer',
            // Tools (Thieving)
            'lockpick', 'crowbar', 'advancedLockpick', 'masterThiefKit',
            // Weapons
            'dagger', 'ironSword', 'steelSword',
            // Shields
            'woodenShield', 'ironShield',
            // Helmets
            'clothHood', 'leatherHelmet', 'ironHelmet',
            // Chest
            'huntingJacket', 'leatherArmor', 'chainmail', 'ironArmor',
            // Legs
            'clothPants', 'leatherPants', 'ironGreaves',
            // Neck
            'bronzeAmulet', 'silverNecklace',
            // Ring
            'copperRing', 'silverRing',
            // Back
            'travelersCloak', 'woovenCape'
        ];

        for (let itemId of equipmentItems) {
            GameEngine.addItemToBank(itemId, 1);
        }

        console.log("⚔️ Added all equipment to bank");
        UI.update();
    },

    addStarterSet() {
        // Add beginner-friendly set of items and equipment
        console.log("🎁 Adding starter set...");

        // Resources
        GameEngine.addItemToBank("gold", 500);
        GameEngine.addItemToBank("wood", 100);
        GameEngine.addItemToBank("ore", 100);

        // Starter equipment
        GameEngine.addItemToBank("shortBow", 1);
        GameEngine.addItemToBank("woodenShield", 1);
        GameEngine.addItemToBank("clothHood", 1);
        GameEngine.addItemToBank("huntingJacket", 1);
        GameEngine.addItemToBank("clothPants", 1);
        GameEngine.addItemToBank("travelersCloak", 1);
        GameEngine.addItemToBank("copperRing", 1);

        // Some consumables
        GameEngine.addItemToBank("healthPotion", 5);
        GameEngine.addItemToBank("bread", 10);

        console.log("✅ Starter set added to bank!");
        UI.update();
    },

    healPlayer() {
        GameEngine.healPlayer(1000);
        console.log("❤️ Player healed to full");
        UI.update();
    },

    addAttributePoints() {
        GameEngine.state.characterLevel.unassignedAttributePoints += 5;
        console.log("📈 Added 5 attribute points");
        UI.update();
    },

    exportSave() {
        const saveString = SaveSystem.exportSave();
        if (saveString) {
            navigator.clipboard.writeText(saveString);
            console.log("📋 Save copied to clipboard");
        }
    },

    fullyExploreRegion() {
        const currentRegionId = GameEngine.state.currentRegion;
        const regionState = GameEngine.state.regions[currentRegionId];
        const hexDef = GameEngine.definitions.worldMap[currentRegionId];
        const biomeDef = GameEngine.definitions.biomes[hexDef.biome];

        if (!regionState) {
            console.log("❌ Current region not found");
            return;
        }

        console.log(`🔍 Fully exploring ${hexDef.name}...`);

        let nodesDiscovered = 0;
        let stationsDiscovered = 0;
        let pathsDiscovered = 0;

        // Discover all resource nodes in the biome
        if (biomeDef.gatheringNodes) {
            for (let skill in biomeDef.gatheringNodes) {
                for (let nodeId of biomeDef.gatheringNodes[skill]) {
                    if (!regionState.discoveredNodeTypes.includes(nodeId)) {
                        regionState.discoveredNodeTypes.push(nodeId);
                        regionState.nodeHealthBonuses[nodeId] = 100; // Bonus health
                        nodesDiscovered++;
                        const nodeDef = GameEngine.definitions.resourceNodes[nodeId];
                        console.log(`  🌟 Discovered: ${nodeDef.name}`);
                    }
                }
            }
        }

        // Discover all crafting stations in the biome
        if (biomeDef.craftingNodes) {
            for (let skill in biomeDef.craftingNodes) {
                for (let stationId of biomeDef.craftingNodes[skill]) {
                    if (!regionState.discoveredCraftingStations.includes(stationId)) {
                        regionState.discoveredCraftingStations.push(stationId);
                        GameEngine.discoverCraftingStation(stationId);
                        stationsDiscovered++;
                        const stationDef = GameEngine.definitions.craftingNodes[stationId];
                        console.log(`  🏭 Discovered: ${stationDef.name}`);
                    }
                }
            }
        }

        // Discover all exit paths
        if (hexDef.adjacentHexes) {
            for (let adjacent of hexDef.adjacentHexes) {
                if (!regionState.discoveredExitPaths.includes(adjacent.id)) {
                    regionState.discoveredExitPaths.push(adjacent.id);
                    pathsDiscovered++;
                    const adjacentHexDef = GameEngine.definitions.worldMap[adjacent.id];
                    console.log(`  🚪 Discovered path to: ${adjacentHexDef.name}`);
                }
            }
        }

        // Set discovery progress to 100%
        regionState.discoveryProgress = 100;

        console.log(`✅ Region fully explored!`);
        console.log(`   📊 ${nodesDiscovered} nodes, ${stationsDiscovered} stations, ${pathsDiscovered} paths discovered`);

        // Show current state
        console.log(`   🔍 Global crafting state:`, GameEngine.state.crafting.discoveredStations);
        console.log(`   🔍 Regional stations:`, regionState.discoveredCraftingStations);

        UI.update();
    },

    checkCraftingState() {
        console.log("=== CRAFTING STATE DEBUG ===");
        console.log("Global discovered stations:", GameEngine.state.crafting.discoveredStations);
        console.log("Selected skill:", GameEngine.state.crafting.selectedSkill);
        console.log("Active crafts:", GameEngine.state.crafting.activeCrafts);

        console.log("\n=== REGIONAL STATIONS ===");
        for (let regionId in GameEngine.state.regions) {
            const regionState = GameEngine.state.regions[regionId];
            if (regionState.discoveredCraftingStations && regionState.discoveredCraftingStations.length > 0) {
                console.log(`${regionId}:`, regionState.discoveredCraftingStations);
            }
        }

        console.log("\n=== STATION DEFINITIONS ===");
        for (let stationId of GameEngine.state.crafting.discoveredStations) {
            const station = GameEngine.definitions.craftingNodes[stationId];
            if (station) {
                console.log(`${stationId}: ${station.name} (${station.skill})`);
            } else {
                console.log(`${stationId}: DEFINITION NOT FOUND!`);
            }
        }

        console.log("\n=== FUNCTION TEST ===");
        console.log("selectCraftingSkill function:", typeof selectCraftingSkill);
        console.log("startCrafting function:", typeof startCrafting);
    },

    addCraftingMaterials() {
        console.log("🎁 Adding basic crafting materials...");

        // Basic materials
        GameEngine.addItemToBank("wood", 100);
        GameEngine.addItemToBank("ore", 100);
        GameEngine.addItemToBank("coal", 50);
        GameEngine.addItemToBank("grain", 50);
        GameEngine.addItemToBank("meat", 50);
        GameEngine.addItemToBank("berries", 50);
        GameEngine.addItemToBank("vegetables", 50);
        GameEngine.addItemToBank("water", 50);
        GameEngine.addItemToBank("herbs", 50);
        GameEngine.addItemToBank("flowers", 30);
        GameEngine.addItemToBank("cloth", 50);
        GameEngine.addItemToBank("leather", 50);
        GameEngine.addItemToBank("thread", 50);
        GameEngine.addItemToBank("rawFiber", 50);
        GameEngine.addItemToBank("alcohol", 20);

        console.log("✅ Added crafting materials to bank!");
        UI.update();
    }
};

// =============================================================================
// (Debugging removed - crafting buttons now work!)
// =============================================================================

// =============================================================================
// INITIALIZE THE GAME
// =============================================================================

// Wait for DOM to be ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
} else {
    initGame();
}

function initGame() {
    console.log("🎮 Starting Idle RPG...");

    // Initialize systems in order
    GameEngine.init();
    const hasSave = SaveSystem.init();
    UI.init();

    // If no save exists, add starter items for testing
    if (!hasSave) {
        console.log("🎁 Adding starter items...");

        // Add some starting resources
        GameEngine.addItemToBank("gold", 100);
        GameEngine.addItemToBank("wood", 50);
        GameEngine.addItemToBank("ore", 50);

        // Add basic starter equipment
        GameEngine.addItemToBank("dagger", 1);
        GameEngine.addItemToBank("clothHood", 1);
        GameEngine.addItemToBank("huntingJacket", 1);
        GameEngine.addItemToBank("clothPants", 1);

        UI.update();
    }

    console.log("✅ Game ready!");
}
