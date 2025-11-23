/**
 * CRAFTING UI
 *
 * Manages the crafting interface, including:
 * - Active crafts display with progress tracking
 * - Crafting stations discovery and sync
 * - Recipe display and filtering by skill
 * - Auto-crafting controls
 */

const CraftingUI = {
    // Cache last rendered states to prevent unnecessary re-renders
    lastCraftingState: null,
    lastActiveCraftsState: null,

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
     * Render active crafts HTML structure (only when needed) - COMPACT VERSION
     */
    renderActiveCrafts(container, activeCrafts, autoRecipe, isAutoCrafting) {
        if (activeCrafts.length === 0) {
            container.innerHTML = '<div style="color: #888; font-size: 0.85em; padding: 8px; text-align: center;">No active crafts</div>';
            return;
        }

        let html = '';

        // Auto-craft header with stop button - COMPACT
        if (isAutoCrafting) {
            const autoRecipeDef = GameEngine.definitions.recipes[autoRecipe];
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px; background: rgba(76,175,80,0.1); border-radius: 4px; border: 1px solid #4caf50;">
                    <div>
                        <div style="font-weight: bold; color: #4caf50; font-size: 0.9em;">🔁 ${autoRecipeDef.name}</div>
                        <div style="font-size: 0.7em; color: #888;">Auto-repeating</div>
                    </div>
                    <button onclick="stopAutoCrafting()" style="padding: 4px 10px; background: #d32f2f; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8em;">
                        ⏹️ Stop
                    </button>
                </div>
            `;
        }

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
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-weight: bold; color: #00d9ff; font-size: 0.9em;">${recipe.name}</span>
                        <div id="craftRemaining" style="font-size: 0.75em; color: #4caf50;">${remaining}s</div>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden;">
                        <div id="craftProgressBar" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #9C27B0, #E91E63); transition: width 0.3s ease-out;"></div>
                    </div>
                    <div style="font-size: 0.7em; color: #888; margin-top: 4px;">${station.image} ${station.name}</div>
                </div>
            `;
        }

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
        const progress = ProgressBar.calculateIntervalProgress(craft.startTime, craft.completionTime);
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

        // Note: regionalStations is not defined in the original code - appears to be a bug
        // Setting to empty array to prevent errors
        const regionalStations = [];

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
        let html = '';

        // Dev tools removed - access via Dev modal in top header

        html += `
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
                    ${Formatting.capitalizeFirst(skill)} (Lv.${skillDef?.level || 1})
                </button>
            `;
        }

        html += '</div></div>';

        // Display skill header if a specific skill is selected
        if (selectedSkill !== null && UIComponents) {
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
                                const item = ItemAccessHelper.getItem(input.itemId);
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
                                const item = ItemAccessHelper.getItem(output.itemId);
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
     * Get icon emoji for a crafting skill
     * @param {string} skillId - Skill ID
     * @returns {string} - Icon emoji
     */
    getSkillIcon(skillId) {
        const icons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            cooking: '🍳',
            chemistry: '⚗️',
            textiles: '🧵',
            engineering: '🔬'
        };
        return icons[skillId] || '🔨';
    }
};
