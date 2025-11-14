/**
 * DEVELOPER UI
 *
 * Renders the developer panel including:
 * - Game balancing variables editor
 * - Mission creator
 * - Analytics dashboard
 */

const DeveloperUI = {
    lastBalanceState: null,
    lastItemManagementState: null,
    lastItemCreatorState: null,

    /**
     * Update the balancing variables UI
     */
    updateBalancingVariables() {
        const container = document.getElementById("balancingVariables");
        if (!container) return;

        const balance = GameEngine.gameBalance;

        // Create state snapshot
        const currentState = JSON.stringify(balance);

        // Only re-render if state changed
        if (this.lastBalanceState === currentState) return;

        let html = `
            <div style="display: grid; gap: 20px;">
        `;

        // Group variables by category
        const categories = {
            'Experience & Leveling (Endless Exponential)': [
                { key: 'skillBaseExpLv1to2', label: 'Skill Base XP (Lv1→2)', min: 10, max: 1000, step: 10, type: 'int' },
                { key: 'skillExpScaling', label: 'Skill XP Scaling Factor', min: 1.05, max: 2.0, step: 0.05, type: 'float' },
                { key: 'characterBaseExpLv1to2', label: 'Character Base XP (Lv1→2)', min: 100, max: 5000, step: 100, type: 'int' },
                { key: 'characterExpScaling', label: 'Character XP Scaling Factor', min: 1.05, max: 1.5, step: 0.01, type: 'float' }
            ],
            'Combat': [
                { key: 'baseCombatDamage', label: 'Base Combat Damage', min: 1, max: 100, step: 1, type: 'int' },
                { key: 'baseEnemyHealth', label: 'Base Enemy Health', min: 10, max: 500, step: 10, type: 'int' },
                { key: 'combatAttackSpeed', label: 'Combat Attack Speed', min: 0.5, max: 10.0, step: 0.5, type: 'float' },
                { key: 'combatAccuracy', label: 'Base Accuracy %', min: 10, max: 100, step: 5, type: 'int' }
            ],
            'Gathering': [
                { key: 'gatherInterval', label: 'Gather Interval (ms)', min: 500, max: 10000, step: 100, type: 'int' },
                { key: 'nodeBaseHealth', label: 'Node Base Health', min: 10, max: 500, step: 10, type: 'int' },
                { key: 'gatherToolDamageMultiplier', label: 'Tool Damage Multiplier', min: 0.1, max: 5.0, step: 0.1, type: 'float' }
            ],
            'Navigation/Exploration - Endurance System': [
                { key: 'navigationInterval', label: 'Discovery Interval (ms)', min: 500, max: 10000, step: 100, type: 'int' },
                { key: 'baseEndurance', label: 'Base Endurance', min: 10, max: 500, step: 10, type: 'int' },
                { key: 'enduranceStrengthMult', label: 'Endurance per Strength', min: 1, max: 20, step: 1, type: 'int' },
                { key: 'enduranceMobilityMult', label: 'Endurance per Mobility', min: 1, max: 20, step: 1, type: 'int' },
                { key: 'enduranceDrainPerAttempt', label: 'Endurance Drain per Attempt', min: 1, max: 20, step: 1, type: 'int' },
                { key: 'baseDiscoveryChance', label: 'Base Discovery Chance %', min: 5, max: 95, step: 5, type: 'int' },
                { key: 'intellectDiscoveryBonus', label: 'Discovery % per Intellect', min: 0.1, max: 10.0, step: 0.1, type: 'float' },
                { key: 'baseComplicationFactor', label: 'Base Complication Factor', min: 0.1, max: 5.0, step: 0.1, type: 'float' },
                { key: 'complicationScaling', label: 'Complication per Distance', min: 0.01, max: 1.0, step: 0.01, type: 'float' }
            ],
            'Crafting': [
                { key: 'craftingTimeMultiplier', label: 'Crafting Time Multiplier', min: 0.1, max: 5.0, step: 0.1, type: 'float' },
                { key: 'craftingExpMultiplier', label: 'Crafting XP Multiplier', min: 0.1, max: 5.0, step: 0.1, type: 'float' }
            ],
            'Economy': [
                { key: 'goldDropMultiplier', label: 'Gold Drop Multiplier', min: 0.1, max: 10.0, step: 0.1, type: 'float' },
                { key: 'itemDropRateMultiplier', label: 'Item Drop Rate Multiplier', min: 0.1, max: 5.0, step: 0.1, type: 'float' }
            ],
            'Progression': [
                { key: 'attributePointsPerLevel', label: 'Attribute Points Per Level', min: 1, max: 10, step: 1, type: 'int' },
                { key: 'skillUnlockThreshold', label: 'Skill Unlock Threshold', min: 1, max: 100, step: 1, type: 'int' }
            ],
            'Missions': [
                { key: 'missionExpMultiplier', label: 'Mission XP Multiplier', min: 0.1, max: 10.0, step: 0.1, type: 'float' },
                { key: 'missionGoldMultiplier', label: 'Mission Gold Multiplier', min: 0.1, max: 10.0, step: 0.1, type: 'float' },
                { key: 'missionCooldownMultiplier', label: 'Mission Cooldown Multiplier', min: 0.1, max: 5.0, step: 0.1, type: 'float' }
            ],
            'Medal Crafting - Rarity Multipliers': [
                { key: 'rarityCommonMult', label: 'Common Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityUncommonMult', label: 'Uncommon Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityRareMult', label: 'Rare Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityEpicMult', label: 'Epic Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityLegendaryMult', label: 'Legendary Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityMythicMult', label: 'Mythic Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityDivineMult', label: 'Divine Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityTranscendentMult', label: 'Transcendent Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' },
                { key: 'rarityCreatorMult', label: 'Creator Rarity Mult', min: 0, max: 10.0, step: 0.1, type: 'float' }
            ]
        };

        // Render each category
        for (let category in categories) {
            const variables = categories[category];

            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">${this.getCategoryIcon(category)} ${category}</h4>
                    <div style="display: grid; gap: 12px;">
            `;

            for (let variable of variables) {
                const value = balance[variable.key];
                const displayValue = variable.type === 'float' ? value.toFixed(2) : value;

                html += `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <label style="font-size: 0.9em; color: #ddd;">${variable.label}</label>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input
                                    type="number"
                                    value="${displayValue}"
                                    min="${variable.min}"
                                    max="${variable.max}"
                                    step="${variable.step}"
                                    onchange="updateBalanceVariable('${variable.key}', parseFloat(this.value), '${variable.type}')"
                                    style="width: 80px; padding: 4px 8px; background: #1a1a2a; border: 1px solid #555; border-radius: 4px; color: white; text-align: right;"
                                />
                                <button
                                    onclick="resetBalanceVariable('${variable.key}')"
                                    style="padding: 4px 8px; background: #555; border: 1px solid #444; border-radius: 4px; color: white; cursor: pointer; font-size: 0.8em;"
                                    title="Reset to default"
                                >↺</button>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="${variable.min}"
                            max="${variable.max}"
                            step="${variable.step}"
                            value="${value}"
                            oninput="updateBalanceVariable('${variable.key}', parseFloat(this.value), '${variable.type}')"
                            style="width: 100%; cursor: pointer;"
                        />
                        <div style="display: flex; justify-content: space-between; font-size: 0.75em; color: #888; margin-top: 2px;">
                            <span>${variable.min}</span>
                            <span>${variable.max}</span>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        // Add reset all and export/import buttons
        html += `
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button
                    onclick="resetAllBalanceVariables()"
                    style="flex: 1; padding: 12px; background: #e74c3c; border: 1px solid #c0392b; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;"
                >
                    ↺ Reset All to Defaults
                </button>
                <button
                    onclick="exportBalanceVariables()"
                    style="flex: 1; padding: 12px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;"
                >
                    📤 Export Settings
                </button>
                <button
                    onclick="importBalanceVariables()"
                    style="flex: 1; padding: 12px; background: #16a085; border: 1px solid #138d75; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;"
                >
                    📥 Import Settings
                </button>
            </div>
        `;

        html += `</div>`;

        container.innerHTML = html;
        this.lastBalanceState = currentState;
    },

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            'Experience & Leveling (Endless Exponential)': '📈',
            'Combat': '⚔️',
            'Gathering': '⛏️',
            'Navigation/Exploration - Endurance System': '🗺️',
            'Crafting': '🔨',
            'Economy': '💰',
            'Progression': '🎯',
            'Missions': '📋',
            'Medal Crafting - Rarity Multipliers': '✨'
        };
        return icons[category] || '⚙️';
    },

    /**
     * Update item creator UI
     */
    updateItemCreator() {
        const container = document.getElementById("itemCreator");
        if (!container) return;

        // Item creator is static, only render once
        if (this.lastItemCreatorState === 'rendered') return;

        let html = `
            <div style="display: grid; gap: 15px;">
                <!-- Item Type Selector -->
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
                    <button onclick="showExampleItem('resource')" style="padding: 10px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">📦 Resource</button>
                    <button onclick="showExampleItem('tool')" style="padding: 10px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">⛏️ Tool</button>
                    <button onclick="showExampleItem('weapon')" style="padding: 10px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">⚔️ Weapon</button>
                    <button onclick="showExampleItem('armor')" style="padding: 10px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">🛡️ Armor</button>
                    <button onclick="showExampleItem('technology')" style="padding: 10px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">⚡ Technology</button>
                    <button onclick="showExampleItem('mod')" style="padding: 10px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">💎 Mod</button>
                    <button onclick="showExampleItem('healing')" style="padding: 10px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">🧪 Healing</button>
                    <button onclick="showExampleItem('consumable')" style="padding: 10px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">⚗️ Consumable</button>
                    <button onclick="showExampleItem('perk')" style="padding: 10px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">⭐ Perk</button>
                    <button onclick="showExampleItem('quest')" style="padding: 10px; background: #3498db; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">📜 Quest</button>
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 10px;">
                    <button onclick="generateRandomItem()" style="flex: 1; padding: 12px; background: #9c27b0; border: 1px solid #7b1fa2; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                        🎲 Generate Random Item
                    </button>
                    <button onclick="testEnhancementSystem()" style="flex: 1; padding: 12px; background: #ff9800; border: 1px solid #f57c00; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                        ✨ Test Enhancement System
                    </button>
                </div>

                <!-- Item Display -->
                <div id="itemDisplay" style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px; min-height: 200px;">
                    <div style="color: #888; text-align: center; padding: 40px;">
                        Click a button above to view example items or generate random ones
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.lastItemCreatorState = 'rendered';
    },

    /**
     * Update Item Management section
     */
    updateItemManagement() {
        const container = document.getElementById("itemManagement");
        if (!container) return;

        // Get registry statistics
        const stats = ItemRegistry ? ItemRegistry.getStatistics() : null;

        // Create state snapshot
        const currentState = JSON.stringify(stats);

        // Only re-render if state changed
        if (this.lastItemManagementState === currentState) return;

        let html = `
            <div style="display: grid; gap: 20px;">
                <!-- Registry Status -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">📊 Registry Status</h4>
                    ${stats ? `
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 10px;">
                            <div style="text-align: center; padding: 10px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">
                                <div style="font-size: 1.5em; font-weight: bold; color: #4a9eff;">${stats.production.count}</div>
                                <div style="font-size: 0.85em; color: #aaa;">Production</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 4px;">
                                <div style="font-size: 1.5em; font-weight: bold; color: #ff9800;">${stats.dev.count}</div>
                                <div style="font-size: 0.85em; color: #aaa;">Dev</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: rgba(156, 39, 176, 0.1); border-radius: 4px;">
                                <div style="font-size: 1.5em; font-weight: bold; color: #9c27b0;">${stats.test.count}</div>
                                <div style="font-size: 0.85em; color: #aaa;">Test</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: rgba(233, 30, 99, 0.1); border-radius: 4px;">
                                <div style="font-size: 1.5em; font-weight: bold; color: #e91e63;">${stats.legacy.count}</div>
                                <div style="font-size: 0.85em; color: #aaa;">Legacy</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
                                <div style="font-size: 1.5em; font-weight: bold; color: #4caf50;">${stats.planned.count}</div>
                                <div style="font-size: 0.85em; color: #aaa;">Planned</div>
                            </div>
                        </div>
                        <div style="text-align: center; padding: 10px; background: rgba(76, 175, 80, 0.2); border-radius: 4px;">
                            <div style="font-size: 1.2em; font-weight: bold; color: #4caf50;">${stats.totalActive} Total Active Items</div>
                        </div>
                    ` : '<div style="color: #e74c3c;">ItemRegistry not loaded</div>'}
                </div>

                <!-- Item Reports -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">📋 Item Reports</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <button onclick="DevItemTools.viewItemsByStatus('production')" class="dev-btn dev-btn-primary">
                            📦 Production Items
                        </button>
                        <button onclick="DevItemTools.viewItemsByStatus('dev')" class="dev-btn dev-btn-warning">
                            🔧 Dev Items
                        </button>
                        <button onclick="DevItemTools.viewItemsByStatus('test')" class="dev-btn dev-btn-info">
                            🧪 Test Items
                        </button>
                        <button onclick="DevItemTools.viewItemsByStatus('legacy')" class="dev-btn dev-btn-danger">
                            📜 Legacy Items
                        </button>
                        <button onclick="DevItemTools.viewItemsByStatus('planned')" class="dev-btn dev-btn-success">
                            🔮 Planned Items
                        </button>
                        <button onclick="DevItemTools.viewAllItems()" class="dev-btn dev-btn-secondary">
                            📊 All Active Items
                        </button>
                    </div>
                </div>

                <!-- Item Validation -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">✅ Validation & Quality</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <button onclick="DevItemTools.validateAllItems()" class="dev-btn dev-btn-success">
                            ✅ Validate All Items
                        </button>
                        <button onclick="DevItemTools.findIncompleteItems()" class="dev-btn dev-btn-warning">
                            🔍 Find Incomplete Items
                        </button>
                        <button onclick="DevItemTools.findDuplicateItems()" class="dev-btn dev-btn-danger">
                            🔄 Find Duplicates
                        </button>
                        <button onclick="DevItemTools.checkMissingFields()" class="dev-btn dev-btn-info">
                            📝 Check Missing Fields
                        </button>
                    </div>
                </div>

                <!-- Item Search & Filter -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">🔍 Search & Filter</h4>
                    <div style="display: grid; gap: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px;">
                            <input type="text" id="itemSearchInput" placeholder="Search items by name, ID, or tag..."
                                   style="padding: 8px 12px; background: rgba(0,0,0,0.4); border: 1px solid #555; border-radius: 4px; color: white; font-size: 0.95em;"
                                   onkeypress="if(event.key === 'Enter') DevItemTools.searchItems()">
                            <button onclick="DevItemTools.searchItems()" class="dev-btn dev-btn-primary">
                                🔍 Search
                            </button>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                            <select id="itemCategoryFilter" style="padding: 8px; background: rgba(0,0,0,0.4); border: 1px solid #555; border-radius: 4px; color: white;">
                                <option value="">All Categories</option>
                                <option value="equipment">Equipment</option>
                                <option value="consumable">Consumable</option>
                                <option value="material">Material</option>
                                <option value="currency">Currency</option>
                                <option value="special">Special</option>
                                <option value="quest">Quest</option>
                                <option value="key">Key</option>
                            </select>
                            <select id="itemRarityFilter" style="padding: 8px; background: rgba(0,0,0,0.4); border: 1px solid #555; border-radius: 4px; color: white;">
                                <option value="">All Rarities</option>
                                <option value="common">Common</option>
                                <option value="uncommon">Uncommon</option>
                                <option value="rare">Rare</option>
                                <option value="epic">Epic</option>
                                <option value="legendary">Legendary</option>
                            </select>
                            <select id="itemTierFilter" style="padding: 8px; background: rgba(0,0,0,0.4); border: 1px solid #555; border-radius: 4px; color: white;">
                                <option value="">All Tiers</option>
                                <option value="starter">Starter</option>
                                <option value="basic">Basic</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="elite">Elite</option>
                                <option value="legendary">Legendary</option>
                            </select>
                            <button onclick="DevItemTools.applyFilters()" class="dev-btn dev-btn-success">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Registry Management -->
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">⚙️ Registry Management</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <button onclick="DevItemTools.toggleDevMode()" class="dev-btn dev-btn-warning">
                            🔧 Toggle Dev Mode
                        </button>
                        <button onclick="DevItemTools.togglePreviewMode()" class="dev-btn dev-btn-info">
                            🔮 Toggle Preview Mode
                        </button>
                        <button onclick="DevItemTools.refreshRegistry()" class="dev-btn dev-btn-success">
                            🔄 Refresh Registry
                        </button>
                        <button onclick="DevItemTools.printSummary()" class="dev-btn dev-btn-secondary">
                            📊 Print Summary
                        </button>
                    </div>
                </div>

                <!-- Results Display -->
                <div id="itemManagementResults" style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px; display: none;">
                    <h4 style="margin: 0 0 15px 0; color: #4a9eff; font-size: 1.1em;">📄 Results</h4>
                    <div id="itemManagementResultsContent" style="max-height: 400px; overflow-y: auto;">
                        <!-- Results will be displayed here -->
                    </div>
                </div>
            </div>

            <style>
                .dev-btn {
                    padding: 10px 15px;
                    border: 1px solid;
                    border-radius: 4px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9em;
                }
                .dev-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
                .dev-btn-primary {
                    background: #4a9eff;
                    border-color: #2980b9;
                }
                .dev-btn-primary:hover {
                    background: #5badff;
                }
                .dev-btn-success {
                    background: #4caf50;
                    border-color: #388e3c;
                }
                .dev-btn-success:hover {
                    background: #66bb6a;
                }
                .dev-btn-warning {
                    background: #ff9800;
                    border-color: #f57c00;
                }
                .dev-btn-warning:hover {
                    background: #ffa726;
                }
                .dev-btn-danger {
                    background: #e91e63;
                    border-color: #c2185b;
                }
                .dev-btn-danger:hover {
                    background: #ec407a;
                }
                .dev-btn-info {
                    background: #9c27b0;
                    border-color: #7b1fa2;
                }
                .dev-btn-info:hover {
                    background: #ab47bc;
                }
                .dev-btn-secondary {
                    background: #607d8b;
                    border-color: #455a64;
                }
                .dev-btn-secondary:hover {
                    background: #78909c;
                }
            </style>
        `;

        container.innerHTML = html;
        this.lastItemManagementState = currentState;
    },

    /**
     * Update the entire developer panel
     */
    updateDeveloperPanel() {
        if (UICore.currentView === 'developer') {
            this.updateBalancingVariables();
            this.updateItemCreator();
            this.updateItemManagement();
        }
    }
};

// Store default balance values for reset
const DEFAULT_BALANCE_VALUES = JSON.parse(JSON.stringify(GameEngine.gameBalance));
