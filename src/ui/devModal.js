/**
 * COMPREHENSIVE DEVELOPER TOOLS MODAL
 *
 * Tabbed interface for all development and debugging functions
 * Consolidates all dev features into one organized modal
 */

const DevModal = {
    isOpen: false,
    activeTab: 'skills', // Default tab

    /**
     * Tab configuration
     */
    tabs: {
        skills: { name: 'Skills', icon: '⭐', enabled: true },
        items: { name: 'Items', icon: '🎒', enabled: true },
        combat: { name: 'Combat', icon: '⚔️', enabled: true },
        time: { name: 'Time', icon: '⏱️', enabled: true },
        scenarios: { name: 'Scenarios', icon: '🎯', enabled: true },
        registry: { name: 'Registry', icon: '📊', enabled: true }
    },

    /**
     * Open the developer modal
     */
    open() {
        this.isOpen = true;
        const modal = document.getElementById('devModal');
        if (modal) {
            modal.style.display = 'block';
            this.render();
        }
    },

    /**
     * Close the developer modal
     */
    close() {
        this.isOpen = false;
        const modal = document.getElementById('devModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Switch to a different tab
     */
    switchTab(tabName) {
        if (this.tabs[tabName] && this.tabs[tabName].enabled) {
            this.activeTab = tabName;
            this.render();
        }
    },

    /**
     * Render the complete modal content
     */
    render() {
        const content = document.getElementById('devModalContent');
        if (!content) return;

        content.innerHTML = `
            ${this.renderTabNav()}
            ${this.renderTabContent()}
            ${this.renderFooter()}
        `;
    },

    /**
     * Render tab navigation
     */
    renderTabNav() {
        const tabButtons = Object.entries(this.tabs)
            .filter(([_, config]) => config.enabled)
            .map(([key, config]) => {
                const isActive = key === this.activeTab;
                return `
                    <button
                        onclick="DevModal.switchTab('${key}')"
                        style="
                            padding: 12px 24px;
                            background: ${isActive ? '#4a9eff' : '#2a2a2a'};
                            border: 1px solid ${isActive ? '#6bb6ff' : '#444'};
                            border-radius: 6px 6px 0 0;
                            color: white;
                            cursor: pointer;
                            font-weight: ${isActive ? 'bold' : 'normal'};
                            transition: all 0.2s;
                        "
                        onmouseover="if('${key}' !== '${this.activeTab}') this.style.background='#3a3a3a'"
                        onmouseout="if('${key}' !== '${this.activeTab}') this.style.background='#2a2a2a'"
                    >
                        ${config.icon} ${config.name}
                    </button>
                `;
            }).join('');

        return `
            <div style="display: flex; gap: 4px; border-bottom: 2px solid #4a9eff; margin-bottom: 20px;">
                ${tabButtons}
            </div>
        `;
    },

    /**
     * Render active tab content
     */
    renderTabContent() {
        switch(this.activeTab) {
            case 'skills': return this.renderSkillsTab();
            case 'items': return this.renderItemsTab();
            case 'combat': return this.renderCombatTab();
            case 'time': return this.renderTimeTab();
            case 'scenarios': return this.renderScenariosTab();
            case 'registry': return this.renderRegistryTab();
            default: return '<p>Unknown tab</p>';
        }
    },

    /**
     * Render Skills & Progression tab
     */
    renderSkillsTab() {
        const skills = typeof SkillRegistry !== 'undefined' ? SkillRegistry.getAllActive() : {};
        const skillIds = Object.keys(skills);

        if (skillIds.length === 0) {
            return '<div style="padding: 40px; text-align: center; color: #888;">No skills found in SkillRegistry</div>';
        }

        const selectedSkill = document.getElementById('devSkillSelector')?.value || skillIds[0];
        const skillDef = skills[selectedSkill];
        const playerSkill = GameEngine?.state?.skills?.[selectedSkill];

        return `
            <div style="display: grid; gap: 20px;">
                <!-- Skill Selector -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Skill Selector</h3>
                    <select id="devSkillSelector" onchange="DevModal.render()" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                        ${skillIds.map(id => `<option value="${id}" ${id === selectedSkill ? 'selected' : ''}>${skills[id].name}</option>`).join('')}
                    </select>

                    ${playerSkill ? `
                        <div style="margin-top: 15px; padding: 15px; background: #1a1a1a; border-radius: 4px;">
                            <p style="margin: 0 0 8px 0;"><strong>Current Level:</strong> ${playerSkill.level || 1}</p>
                            <p style="margin: 0 0 8px 0;"><strong>Current XP:</strong> ${playerSkill.xp || 0}</p>
                            <p style="margin: 0 0 8px 0;"><strong>XP to Next:</strong> ${DevModal.calculateXPForLevel((playerSkill.level || 1) + 1, skillDef)}</p>
                            <div style="background: #333; height: 20px; border-radius: 10px; overflow: hidden; margin-top: 8px;">
                                <div style="background: #4a9eff; height: 100%; width: ${DevModal.calculateProgress(playerSkill, skillDef)}%;"></div>
                            </div>
                        </div>
                    ` : '<p style="color: #888; margin-top: 15px;">Skill not initialized</p>'}
                </div>

                <!-- Manual Controls -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Manual Controls</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #aaa;">Set Level:</label>
                            <input type="number" id="devSetLevel" min="1" value="${playerSkill?.level || 1}" style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                            <button onclick="DevModal.setSkillLevel()" style="width: 100%; margin-top: 5px; padding: 10px; background: #4a9eff; border: none; border-radius: 4px; color: white; cursor: pointer;">Set Level</button>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #aaa;">Set XP:</label>
                            <input type="number" id="devSetXP" min="0" value="${playerSkill?.xp || 0}" style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                            <button onclick="DevModal.setSkillXP()" style="width: 100%; margin-top: 5px; padding: 10px; background: #4a9eff; border: none; border-radius: 4px; color: white; cursor: pointer;">Set XP</button>
                        </div>
                    </div>
                </div>

                <!-- Quick Level Buttons -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Quick Level Adjustments</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                        <button onclick="DevModal.addSkillLevels(1)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">+1 Level</button>
                        <button onclick="DevModal.addSkillLevels(10)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">+10 Levels</button>
                        <button onclick="DevModal.addSkillLevels(100)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">+100 Levels</button>
                        <button onclick="DevModal.addSkillLevels(1000)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">+1000 Levels</button>
                    </div>
                </div>

                <!-- Progression Presets -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Progression Presets (All Skills)</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <button onclick="DevModal.setAllSkillsLevel(10)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Early Game (Lv 10)</button>
                        <button onclick="DevModal.setAllSkillsLevel(50)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Mid Game (Lv 50)</button>
                        <button onclick="DevModal.setAllSkillsLevel(100)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Late Game (Lv 100)</button>
                        <button onclick="DevModal.setAllSkillsLevel(500)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Endgame (Lv 500)</button>
                        <button onclick="DevModal.setAllSkillsLevel(1000)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Ultra Late (Lv 1000)</button>
                        <button onclick="DevModal.setAllSkillsLevel(10000)" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Extreme (Lv 10000)</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Items & Inventory tab
     */
    renderItemsTab() {
        const items = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getAllActive() : {};
        const itemIds = Object.keys(items).sort();

        // Get unique categories and tiers
        const categories = [...new Set(Object.values(items).map(i => i.category).filter(Boolean))];
        const tiers = [...new Set(Object.values(items).map(i => i.tier).filter(Boolean))].sort();

        return `
            <div style="display: grid; gap: 20px;">
                <!-- Item Adder -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ffd700;">Item Adder</h3>

                    <!-- Filters -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 0.9em;">Search:</label>
                            <input type="text" id="devItemSearch" oninput="DevModal.filterItems()" placeholder="Filter by name or ID..." style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 0.9em;">Category:</label>
                            <select id="devItemCategory" onchange="DevModal.filterItems()" style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                                <option value="">All Categories</option>
                                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #aaa; font-size: 0.9em;">Tier:</label>
                            <select id="devItemTier" onchange="DevModal.filterItems()" style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                                <option value="">All Tiers</option>
                                ${tiers.map(tier => `<option value="${tier}">Tier ${tier}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Item selector and add controls -->
                    <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 10px;">
                        <select id="devItemSelector" size="8" style="padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px; font-family: monospace;">
                            ${itemIds.map(id => `<option value="${id}">${items[id].icon || '📦'} ${items[id].name || id}</option>`).join('')}
                        </select>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <input type="number" id="devItemQuantity" min="1" max="9999" value="1" style="padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px; width: 80px;">
                            <button onclick="DevModal.addItemToBank()" style="padding: 10px; background: #ffd700; border: none; border-radius: 4px; color: #000; font-weight: bold; cursor: pointer; white-space: nowrap;">Add to Bank</button>
                        </div>
                    </div>
                </div>

                <!-- Test Weapons (Development) -->
                <div style="background: #1a3a1a; padding: 15px; border-radius: 8px; border: 2px solid #4CAF50;">
                    <h3 style="margin: 0 0 10px 0; color: #4CAF50;">🧪 Test Weapons (Clean Development)</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <button onclick="DevModal.loadTestWeapons()" style="padding: 10px; background: #4CAF50; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">📦 Load Test Weapons</button>
                        <button onclick="DevModal.clearTestItems()" style="padding: 10px; background: #ff5722; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">🗑️ Clear Test Items</button>
                    </div>
                    <p style="margin: 10px 0 0 0; color: #aaa; font-size: 0.85em;">Edit test weapons in: src/data/items/test/testWeapons.js</p>
                </div>

                <!-- Quick Actions -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ffd700;">Quick Actions</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <button onclick="DevModal.addAllItems()" style="padding: 10px; background: #9c27b0; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">✨ Add ALL Items (10 each)</button>
                        <button onclick="DevModal.clearBank()" style="padding: 10px; background: #ff6b6b; border: none; border-radius: 4px; color: white; cursor: pointer;">Clear Bank</button>
                        <button onclick="DevModal.cleanWeapons()" style="padding: 10px; background: #e74c3c; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">🗑️ DELETE ALL WEAPONS</button>
                        <button onclick="DevModal.addAllTier1Items()" style="padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">Add All Tier 1 Items</button>
                        <button onclick="DevModal.addAllTier2Items()" style="padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">Add All Tier 2 Items</button>
                        <button onclick="DevModal.addStarterKit()" style="padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">Add Starter Kit</button>
                    </div>
                </div>

                <!-- Item Inspector -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ffd700;">Item Inspector</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 15px; background: #1a1a1a; border-radius: 4px;">
                        <div>
                            <p style="margin: 0; color: #aaa; font-size: 0.9em;">Unique Items in Bank</p>
                            <p style="margin: 5px 0 0 0; font-size: 1.5em; font-weight: bold; color: #ffd700;">${DevModal.countUniqueItems()}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #aaa; font-size: 0.9em;">Total Stack Count</p>
                            <p style="margin: 5px 0 0 0; font-size: 1.5em; font-weight: bold; color: #ffd700;">${DevModal.countTotalStacks()}</p>
                        </div>
                        <div>
                            <button onclick="DevModal.exportBank()" style="width: 100%; padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">Export Bank (JSON)</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Combat & Attributes tab
     */
    renderCombatTab() {
        const attributes = GameEngine?.state?.attributes || {};
        const attributeNames = ['health', 'defense', 'strength', 'stealth', 'perception', 'mobility', 'intellect'];

        return `
            <div style="display: grid; gap: 20px;">
                <!-- Attribute Editor -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">Attribute Editor</h3>
                    <div style="display: grid; gap: 15px;">
                        ${attributeNames.map(attr => {
                            const value = attributes[attr] || 1;
                            return `
                                <div>
                                    <label style="display: block; margin-bottom: 5px; color: #aaa; text-transform: capitalize; font-weight: bold;">${attr}: <span id="dev${attr}Value">${value}</span></label>
                                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px;">
                                        <input type="range" id="dev${attr}Slider" min="0" max="999" value="${value}"
                                            oninput="DevModal.updateAttributeSlider('${attr}')"
                                            style="width: 100%;">
                                        <input type="number" id="dev${attr}Input" min="0" max="999" value="${value}"
                                            oninput="DevModal.updateAttributeInput('${attr}')"
                                            style="width: 80px; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button onclick="DevModal.applyAttributes()" style="width: 100%; margin-top: 15px; padding: 12px; background: #ff6b6b; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">Apply Attributes</button>
                </div>

                <!-- Preset Buttons -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">Attribute Presets</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <button onclick="DevModal.setAllAttributes(1)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Fresh Start (1)</button>
                        <button onclick="DevModal.setAllAttributes(10)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Early Game (10)</button>
                        <button onclick="DevModal.setAllAttributes(50)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Mid Game (50)</button>
                        <button onclick="DevModal.setAllAttributes(200)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Late Game (200)</button>
                        <button onclick="DevModal.setAllAttributes(500)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Endgame (500)</button>
                        <button onclick="DevModal.setAllAttributes(999)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Max Out (999)</button>
                    </div>
                </div>

                <!-- Enemy Testing -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">Enemy Testing</h3>
                    <div style="display: grid; gap: 10px;">
                        <select id="devEnemySelector" style="padding: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                            <option value="">Select Enemy...</option>
                            ${DevModal.getEnemyList().map(([id, enemy]) =>
                                `<option value="${id}">${enemy.name || id} (Lv ${enemy.level || 1})</option>`
                            ).join('')}
                        </select>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <button onclick="DevModal.spawnEnemy()" style="padding: 10px; background: #ff6b6b; border: none; border-radius: 4px; color: white; cursor: pointer;">Spawn Enemy</button>
                            <button onclick="DevModal.quickKillEnemy()" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Quick Kill (1 HP)</button>
                        </div>
                        <button onclick="DevModal.instantVictory()" style="width: 100%; padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">Instant Victory</button>
                    </div>
                </div>

                <!-- Combat Toggles -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff6b6b;">Combat Toggles</h3>
                    <div style="display: grid; gap: 10px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devGodMode" onchange="DevModal.toggleGodMode()" style="margin-right: 10px; cursor: pointer;">
                            <span>God Mode (take no damage)</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devOneHitKill" onchange="DevModal.toggleOneHitKill()" style="margin-right: 10px; cursor: pointer;">
                            <span>One-Hit Kill (deal 99999 damage)</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devInfiniteConsumables" onchange="DevModal.toggleInfiniteConsumables()" style="margin-right: 10px; cursor: pointer;">
                            <span>Infinite Consumables (never deplete)</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devAutoWin" onchange="DevModal.toggleAutoWin()" style="margin-right: 10px; cursor: pointer;">
                            <span>Auto-Win Combat (instant victories)</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Time & Speed tab
     */
    renderTimeTab() {
        return `
            <div style="display: grid; gap: 20px;">
                <!-- Time Skip -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff9800;">Time Skip</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <button onclick="DevModal.skipTime(1)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">⏩ Skip 1 Hour</button>
                        <button onclick="DevModal.skipTime(24)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">⏩ Skip 1 Day</button>
                        <button onclick="DevModal.skipTime(168)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">⏩ Skip 1 Week</button>
                        <button onclick="DevModal.skipTime(720)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">⏩ Skip 1 Month</button>
                    </div>
                    <div style="margin-top: 10px;">
                        <label style="display: block; margin-bottom: 5px; color: #aaa;">Custom Skip (hours):</label>
                        <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px;">
                            <input type="number" id="devCustomSkip" min="0" value="1" style="padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 4px;">
                            <button onclick="DevModal.skipCustomTime()" style="padding: 10px 20px; background: #ff9800; border: none; border-radius: 4px; color: white; cursor: pointer;">Skip</button>
                        </div>
                    </div>
                </div>

                <!-- Game Speed -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff9800;">Game Speed</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #aaa;">Speed Multiplier: <span id="devSpeedDisplay">1x</span></label>
                        <input type="range" id="devSpeedSlider" min="0.1" max="100" step="0.1" value="1"
                            oninput="DevModal.updateSpeedSlider()"
                            style="width: 100%;">
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                        <button onclick="DevModal.setGameSpeed(1)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">1x</button>
                        <button onclick="DevModal.setGameSpeed(2)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">2x</button>
                        <button onclick="DevModal.setGameSpeed(5)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">5x</button>
                        <button onclick="DevModal.setGameSpeed(10)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">10x</button>
                        <button onclick="DevModal.setGameSpeed(50)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">50x</button>
                        <button onclick="DevModal.setGameSpeed(100)" style="padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">100x</button>
                    </div>
                    <div style="margin-top: 15px; padding: 10px; background: #1a1a1a; border-radius: 4px; text-align: center;">
                        <p style="margin: 0; color: #aaa; font-size: 0.9em;">Current Game Time</p>
                        <p style="margin: 5px 0 0 0; font-size: 1.2em; font-weight: bold;">${DevModal.getCurrentGameTime()}</p>
                    </div>
                </div>

                <!-- Activity Speed Testing -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff9800;">Activity Speed Toggles</h3>
                    <div style="display: grid; gap: 10px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devInstantCrafts" onchange="DevModal.toggleInstantCrafts()" style="margin-right: 10px; cursor: pointer;">
                            <span>Instant Crafts</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devInstantGathering" onchange="DevModal.toggleInstantGathering()" style="margin-right: 10px; cursor: pointer;">
                            <span>Instant Gathering</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devInstantTravel" onchange="DevModal.toggleInstantTravel()" style="margin-right: 10px; cursor: pointer;">
                            <span>Instant Travel</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devNoCooldowns" onchange="DevModal.toggleNoCooldowns()" style="margin-right: 10px; cursor: pointer;">
                            <span>No Cooldowns</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Quick Scenarios tab
     */
    renderScenariosTab() {
        const scenarios = [
            {
                name: 'Fresh Start',
                icon: '🆕',
                description: 'Level 1 all skills, Attributes all 1, No items, Tutorial state',
                action: 'freshStart'
            },
            {
                name: 'Early Game (Hour 1-5)',
                icon: '🌱',
                description: 'Skills: 5-10, Attributes: 10-20, Basic tools + starter gear, Tier 1 resources',
                action: 'earlyGame'
            },
            {
                name: 'Mid Game (Hour 10-50)',
                icon: '⚙️',
                description: 'Skills: 25-50, Attributes: 50-100, Quality weapons + armor, Tier 2-3 resources',
                action: 'midGame'
            },
            {
                name: 'Late Game (Hour 100+)',
                icon: '🔥',
                description: 'Skills: 100-200, Attributes: 200-500, Epic gear + attachments, Tier 4-5 resources',
                action: 'lateGame'
            },
            {
                name: 'Endgame (Hour 500+)',
                icon: '👑',
                description: 'Skills: 500-1000, Attributes: 500-999, Legendary everything, Massive resources',
                action: 'endgame'
            },
            {
                name: 'Test Crafting Chain',
                icon: '🎯',
                description: 'Mining 20, Forging 20, Raw ores + recipes unlocked, Workshop access',
                action: 'testCrafting'
            },
            {
                name: 'Test Combat Build',
                icon: '⚔️',
                description: 'Combat skills 50+, Strength/Perception high, Multiple weapons + ammo, Health consumables',
                action: 'testCombat'
            },
            {
                name: 'Test Exploration',
                icon: '🗺️',
                description: 'Navigation 50+, All regions discovered, Travel resources stocked',
                action: 'testExploration'
            }
        ];

        return `
            <div style="display: grid; gap: 20px;">
                <div style="background: rgba(255, 165, 0, 0.1); padding: 15px; border: 1px solid #ff9800; border-radius: 8px;">
                    <p style="margin: 0; color: #ff9800; font-weight: bold;">⚠️ Warning</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #aaa;">Loading a scenario will modify your character state. Some scenarios clear existing items.</p>
                </div>

                ${scenarios.map(scenario => `
                    <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; border-left: 4px solid #4a9eff;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 2em; margin-right: 15px;">${scenario.icon}</span>
                            <h3 style="margin: 0; color: #4a9eff;">${scenario.name}</h3>
                        </div>
                        <p style="margin: 10px 0; color: #aaa; font-size: 0.95em;">${scenario.description}</p>
                        <button onclick="DevModal.loadScenario('${scenario.action}')" style="width: 100%; padding: 12px; background: #4a9eff; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                            ⚡ Load Scenario
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render Registry & Diagnostics tab
     */
    renderRegistryTab() {
        const stats = typeof RegistryManager !== 'undefined' ? RegistryManager.getAllStats() : null;

        return `
            <div style="display: grid; gap: 20px;">
                <!-- Registry Inspector -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Registry Inspector</h3>
                    ${stats ? `
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            ${Object.entries(stats).map(([name, count]) => `
                                <div style="padding: 15px; background: #1a1a1a; border-radius: 4px; text-align: center;">
                                    <p style="margin: 0; color: #aaa; font-size: 0.9em; text-transform: capitalize;">${name}</p>
                                    <p style="margin: 5px 0 0 0; font-size: 1.5em; font-weight: bold; color: #4a9eff;">${count}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: #888;">RegistryManager not available</p>'}
                </div>

                <!-- Environment Toggles -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Environment Toggles</h3>
                    <div style="display: grid; gap: 10px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devDevMode" onchange="DevModal.toggleDevMode()" style="margin-right: 10px; cursor: pointer;">
                            <span>Dev Mode (show dev entities)</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devTestMode" onchange="DevModal.toggleTestMode()" style="margin-right: 10px; cursor: pointer;">
                            <span>Test Mode (show test entities)</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devPreviewMode" onchange="DevModal.togglePreviewMode()" style="margin-right: 10px; cursor: pointer;">
                            <span>Preview Mode (show planned entities)</span>
                        </label>
                    </div>
                </div>

                <!-- Data Management -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Data Management</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <button onclick="DevModal.exportAllData()" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Export All Data (JSON)</button>
                        <button onclick="DevModal.importData()" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Import Data (JSON)</button>
                        <button onclick="DevModal.validateAllRegistries()" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Validate All Registries</button>
                        <button onclick="DevModal.clearAllCaches()" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Clear All Caches</button>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Performance Metrics</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="padding: 15px; background: #1a1a1a; border-radius: 4px;">
                            <p style="margin: 0; color: #aaa; font-size: 0.9em;">Game Tick Rate</p>
                            <p style="margin: 5px 0 0 0; font-size: 1.3em; font-weight: bold; color: #4a9eff;">60 FPS</p>
                        </div>
                        <div style="padding: 15px; background: #1a1a1a; border-radius: 4px;">
                            <p style="margin: 0; color: #aaa; font-size: 0.9em;">Last Save</p>
                            <p style="margin: 5px 0 0 0; font-size: 1.3em; font-weight: bold; color: #4a9eff;">${DevModal.getLastSaveTime()}</p>
                        </div>
                    </div>
                </div>

                <!-- Debug Logging -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Debug Logging</h3>
                    <div style="display: grid; gap: 10px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devVerboseLogging" onchange="DevModal.toggleVerboseLogging()" style="margin-right: 10px; cursor: pointer;">
                            <span>Enable Verbose Logging</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devLogRegistryLookups" onchange="DevModal.toggleLogRegistryLookups()" style="margin-right: 10px; cursor: pointer;">
                            <span>Log Registry Lookups</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devLogStateChanges" onchange="DevModal.toggleLogStateChanges()" style="margin-right: 10px; cursor: pointer;">
                            <span>Log State Changes</span>
                        </label>
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 10px; background: #1a1a1a; border-radius: 4px;">
                            <input type="checkbox" id="devLogSystemUpdates" onchange="DevModal.toggleLogSystemUpdates()" style="margin-right: 10px; cursor: pointer;">
                            <span>Log System Updates</span>
                        </label>
                    </div>
                </div>

                <!-- Console Shortcuts -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #4a9eff;">Console Shortcuts</h3>
                    <div style="display: grid; gap: 10px;">
                        <button onclick="DevModal.exposeGameEngine()" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Expose GameEngine to Console</button>
                        <button onclick="DevModal.exposeRegistryManager()" style="padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">Expose RegistryManager to Console</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render footer warning
     */
    renderFooter() {
        return `
            <div style="margin-top: 20px; padding: 15px; background: rgba(255, 0, 0, 0.1); border: 1px solid #ff6b6b; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ff6b6b; font-weight: bold;">⚠️ Developer Tools - Use with caution!</p>
                <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #aaa;">These functions are for testing and development purposes only.</p>
            </div>
        `;
    },

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    /**
     * Calculate XP needed for a specific level
     */
    calculateXPForLevel(level, skillDef) {
        if (!skillDef) return 0;
        const baseXP = skillDef.baseXP || 100;
        const curve = skillDef.xpCurve || 1.5;
        return Math.floor(baseXP * Math.pow(level, curve));
    },

    /**
     * Calculate total XP needed to reach a level
     */
    calculateTotalXP(targetLevel, skillDef) {
        let totalXP = 0;
        for (let i = 1; i <= targetLevel; i++) {
            totalXP += this.calculateXPForLevel(i, skillDef);
        }
        return totalXP;
    },

    /**
     * Calculate progress percentage for skill
     */
    calculateProgress(playerSkill, skillDef) {
        if (!playerSkill || !skillDef) return 0;
        const currentXP = playerSkill.xp || 0;
        const nextLevelXP = this.calculateXPForLevel((playerSkill.level || 1) + 1, skillDef);
        return Math.min(100, (currentXP / nextLevelXP) * 100);
    },

    /**
     * Get list of enemies
     */
    getEnemyList() {
        if (typeof EnemyRegistry !== 'undefined') {
            return Object.entries(EnemyRegistry.getAllActive());
        }
        return [];
    },

    /**
     * Count unique items in bank
     */
    countUniqueItems() {
        if (!GameEngine?.state?.bank) return 0;
        let count = 0;
        for (let tab in GameEngine.state.bank) {
            count += Object.keys(GameEngine.state.bank[tab]).length;
        }
        return count;
    },

    /**
     * Count total item stacks
     */
    countTotalStacks() {
        if (!GameEngine?.state?.bank) return 0;
        let total = 0;
        for (let tab in GameEngine.state.bank) {
            for (let itemId in GameEngine.state.bank[tab]) {
                total += GameEngine.state.bank[tab][itemId] || 0;
            }
        }
        return total;
    },

    /**
     * Get current game time formatted
     */
    getCurrentGameTime() {
        if (!GameEngine?.state?.gameTime) return 'N/A';
        const hours = Math.floor(GameEngine.state.gameTime / 3600);
        const minutes = Math.floor((GameEngine.state.gameTime % 3600) / 60);
        return `${hours}h ${minutes}m`;
    },

    /**
     * Get last save time
     */
    getLastSaveTime() {
        if (!GameEngine?.state?.lastSave) return 'Never';
        const now = Date.now();
        const diff = now - GameEngine.state.lastSave;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    },

    // ========================================
    // TAB 1: SKILLS FUNCTIONS
    // ========================================

    /**
     * Set skill level
     */
    setSkillLevel() {
        const skillId = document.getElementById('devSkillSelector')?.value;
        const targetLevel = parseInt(document.getElementById('devSetLevel')?.value);

        if (!skillId || !targetLevel || targetLevel < 1) {
            console.error('Invalid skill or level');
            return;
        }

        const skillDef = SkillRegistry.getAllActive()[skillId];
        if (!GameEngine?.state?.skills) return;

        // Initialize skill if it doesn't exist
        if (!GameEngine.state.skills[skillId]) {
            GameEngine.state.skills[skillId] = { level: 1, xp: 0, unlocked: true };
        }

        // Set level and calculate total XP
        GameEngine.state.skills[skillId].level = targetLevel;
        GameEngine.state.skills[skillId].xp = this.calculateTotalXP(targetLevel, skillDef);

        console.log(`Set ${skillId} to level ${targetLevel}`);
        this.render();
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Set skill XP
     */
    setSkillXP() {
        const skillId = document.getElementById('devSkillSelector')?.value;
        const xp = parseInt(document.getElementById('devSetXP')?.value);

        if (!skillId || xp < 0) {
            console.error('Invalid skill or XP');
            return;
        }

        if (!GameEngine?.state?.skills) return;

        // Initialize skill if it doesn't exist
        if (!GameEngine.state.skills[skillId]) {
            GameEngine.state.skills[skillId] = { level: 1, xp: 0, unlocked: true };
        }

        GameEngine.state.skills[skillId].xp = xp;

        console.log(`Set ${skillId} XP to ${xp}`);
        this.render();
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Add levels to selected skill
     */
    addSkillLevels(amount) {
        const skillId = document.getElementById('devSkillSelector')?.value;
        if (!skillId || !GameEngine?.state?.skills) return;

        // Initialize skill if it doesn't exist
        if (!GameEngine.state.skills[skillId]) {
            GameEngine.state.skills[skillId] = { level: 1, xp: 0, unlocked: true };
        }

        const currentLevel = GameEngine.state.skills[skillId].level || 1;
        const newLevel = currentLevel + amount;
        const skillDef = SkillRegistry.getAllActive()[skillId];

        GameEngine.state.skills[skillId].level = newLevel;
        GameEngine.state.skills[skillId].xp = this.calculateTotalXP(newLevel, skillDef);

        console.log(`Added ${amount} levels to ${skillId} (now level ${newLevel})`);
        this.render();
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Set all skills to a specific level
     */
    setAllSkillsLevel(level) {
        if (!GameEngine?.state?.skills) return;

        const skills = SkillRegistry.getAllActive();
        for (let skillId in skills) {
            if (!GameEngine.state.skills[skillId]) {
                GameEngine.state.skills[skillId] = { level: 1, xp: 0, unlocked: true };
            }
            GameEngine.state.skills[skillId].level = level;
            GameEngine.state.skills[skillId].xp = this.calculateTotalXP(level, skills[skillId]);
        }

        console.log(`Set all skills to level ${level}`);
        this.render();
        if (typeof UICore !== 'undefined') UICore.update();
    },

    // ========================================
    // TAB 2: ITEMS FUNCTIONS
    // ========================================

    /**
     * Filter items based on search/category/tier
     */
    filterItems() {
        const searchTerm = document.getElementById('devItemSearch')?.value.toLowerCase() || '';
        const category = document.getElementById('devItemCategory')?.value || '';
        const tier = document.getElementById('devItemTier')?.value || '';
        const selector = document.getElementById('devItemSelector');

        if (!selector) return;

        const items = ItemRegistry.getAllActive();
        const filtered = Object.entries(items).filter(([id, item]) => {
            const matchesSearch = !searchTerm ||
                id.toLowerCase().includes(searchTerm) ||
                (item.name || '').toLowerCase().includes(searchTerm);
            const matchesCategory = !category || item.category === category;
            const matchesTier = !tier || item.tier === parseInt(tier);
            return matchesSearch && matchesCategory && matchesTier;
        });

        selector.innerHTML = filtered.map(([id, item]) =>
            `<option value="${id}">${item.icon || '📦'} ${item.name || id}</option>`
        ).join('');
    },

    /**
     * Add item to bank
     */
    addItemToBank() {
        const itemId = document.getElementById('devItemSelector')?.value;
        const quantity = parseInt(document.getElementById('devItemQuantity')?.value) || 1;

        if (!itemId || quantity < 1) return;

        if (typeof GameEngine?.addItemToBank === 'function') {
            GameEngine.addItemToBank(itemId, quantity);
            console.log(`Added ${quantity}x ${itemId} to bank`);
            if (typeof UICore !== 'undefined') UICore.update();
            this.render();
        } else {
            console.error('GameEngine.addItemToBank not available');
        }
    },

    /**
     * Clear bank
     */
    clearBank() {
        if (!confirm('Are you sure you want to clear the entire bank?')) return;

        if (GameEngine?.state?.bank) {
            for (let tab in GameEngine.state.bank) {
                GameEngine.state.bank[tab] = {};
            }
            console.log('Bank cleared');
            if (typeof UICore !== 'undefined') UICore.update();
            this.render();
        }
    },

    /**
     * Add all tier 1 items
     */
    addAllTier1Items() {
        this.addAllTierItems(1);
    },

    /**
     * Add all tier 2 items
     */
    addAllTier2Items() {
        this.addAllTierItems(2);
    },

    /**
     * Add all items of a specific tier
     */
    addAllTierItems(tier) {
        if (!GameEngine?.addItemToBank) return;

        const items = ItemRegistry.getAllActive();
        let count = 0;

        for (let itemId in items) {
            if (items[itemId].tier === tier) {
                GameEngine.addItemToBank(itemId, 10);
                count++;
            }
        }

        console.log(`Added ${count} tier ${tier} items (10 each)`);
        if (typeof UICore !== 'undefined') UICore.update();
        this.render();
    },

    /**
     * Add ALL items from ItemRegistry (regardless of tier)
     */
    addAllItems() {
        if (!GameEngine?.addItemToBank) return;

        const items = ItemRegistry.getAllActive();
        let count = 0;

        for (let itemId in items) {
            GameEngine.addItemToBank(itemId, 10);
            count++;
        }

        console.log(`✨ Added ALL ${count} items (10 each)`);
        if (typeof UICore !== 'undefined') UICore.update();
        this.render();
    },

    /**
     * Add test weapons and attachments for attachment system testing
     */
    addTestWeapons() {
        if (!GameEngine?.addItemToBank) return;

        const testItems = [
            // Weapons
            { id: 'huntsman_40', qty: 1 },
            { id: 'test_pistol', qty: 1 },
            // Attachments - all types and rarities
            { id: 'test_scope_common', qty: 5 },
            { id: 'test_scope_rare', qty: 5 },
            { id: 'test_scope_legendary', qty: 5 },
            { id: 'test_barrel_common', qty: 5 },
            { id: 'test_barrel_epic', qty: 5 },
            { id: 'test_magazine_uncommon', qty: 5 },
            { id: 'test_magazine_mythic', qty: 5 },
            { id: 'test_stock_rare', qty: 5 },
            { id: 'test_stock_divine', qty: 5 },
            { id: 'test_grip_common', qty: 5 },
            { id: 'test_grip_transcendent', qty: 5 },
            { id: 'test_muzzle_uncommon', qty: 5 },
            { id: 'test_muzzle_creator', qty: 5 },
            { id: 'test_underbarrel_rare', qty: 5 },
            { id: 'test_underbarrel_legendary', qty: 5 },
            { id: 'test_tactical_epic', qty: 5 },
            { id: 'test_tactical_mythic', qty: 5 }
        ];

        let added = 0;
        let failed = 0;

        for (let item of testItems) {
            if (ItemRegistry.hasItem(item.id)) {
                GameEngine.addItemToBank(item.id, item.qty);
                added++;
            } else {
                console.error(`❌ Test item not found: ${item.id}`);
                failed++;
            }
        }

        console.log(`🔫 Added ${added} test weapons/attachments (${failed} failed)`);
        if (typeof UICore !== 'undefined') UICore.update();
        this.render();
    },

    /**
     * Add starter kit
     */
    addStarterKit() {
        if (!GameEngine?.addItemToBank) return;

        const starterItems = [
            { id: 'lightPickaxe', qty: 1 },
            { id: 'utilityHatchet', qty: 1 },
            { id: 'caneRod', qty: 1 },
            { id: 'huntingBlade', qty: 1 },
            { id: 'wovenBasket', qty: 1 },
            { id: 'lockpick', qty: 1 },
            { id: 'pinewood', qty: 50 },
            { id: 'lightRations', qty: 20 },
            { id: 'bread', qty: 10 }
        ];

        for (let item of starterItems) {
            GameEngine.addItemToBank(item.id, item.qty);
        }

        console.log('Added starter kit');
        if (typeof UICore !== 'undefined') UICore.update();
        this.render();
    },

    /**
     * Clean ALL weapons from bank
     */
    cleanWeapons() {
        if (!GameEngine?.state?.bank?.items) {
            alert('❌ Game not loaded yet');
            return;
        }

        const bank = GameEngine.state.bank.items;
        const weaponsToRemove = [];

        // Scan all bank items for weapons
        for (const itemId in bank) {
            const bankItem = bank[itemId];

            // Weapon instances
            if (bankItem.baseItemId || bankItem.instanceId || bankItem.attachments) {
                console.log(`  🎯 Found weapon instance: ${itemId}`, bankItem);
                weaponsToRemove.push(itemId);
                continue;
            }

            // Items with no definition
            const itemDef = ItemRegistry?.getItem(itemId);
            if (!itemDef) {
                console.log(`  ⚠️ No definition: ${itemId}`);
                weaponsToRemove.push(itemId);
                continue;
            }

            // Weapon definitions
            if (itemDef.equipSlot === 'weapon' ||
                itemDef.slot === 'weapon' ||
                itemDef.category === 'weapon' ||
                itemDef.attachmentSlot ||
                itemDef.itemType === 'attachment') {
                console.log(`  🔫 Found weapon/attachment: ${itemId}`, itemDef);
                weaponsToRemove.push(itemId);
            }
        }

        console.log(`🗑️ Found ${weaponsToRemove.length} weapons to remove`);

        // Remove all
        let removed = 0;
        weaponsToRemove.forEach(itemId => {
            if (bank[itemId]) {
                delete bank[itemId];
                removed++;
            }
        });

        // Unequip weapon
        if (GameEngine.state.equipment?.weapon) {
            GameEngine.state.equipment.weapon = null;
        }

        console.log(`✅ Removed ${removed} weapons from bank`);

        // Save and update
        SaveSystem.save();
        UICore.update();

        alert(`✅ Deleted ${removed} weapons from your save!`);
        this.render();
    },

    /**
     * Load test items from ItemRegistry.test environment
     */
    loadTestWeapons() {
        if (!GameEngine?.addItemToBank || !ItemRegistry) {
            alert('❌ GameEngine not loaded');
            return;
        }

        const testItems = ItemRegistry.test || {};
        let added = 0;
        let failed = 0;

        for (const itemId in testItems) {
            try {
                GameEngine.addItemToBank(itemId, 1);
                console.log(`✅ Added test item: ${itemId}`);
                added++;
            } catch (err) {
                console.error(`❌ Failed to add ${itemId}:`, err);
                failed++;
            }
        }

        console.log(`📦 Test items loaded: ${added} added, ${failed} failed`);

        SaveSystem.save();
        UICore.update();

        if (added === 0) {
            alert('⚠️ No test items defined.\n\nEdit: src/data/items/test/testItems.js');
        } else {
            alert(`✅ Loaded ${added} test items!`);
        }

        this.render();
    },

    /**
     * Clear test items from bank (removes all items in ItemRegistry.test)
     */
    clearTestItems() {
        if (!GameEngine?.state?.bank?.items || !ItemRegistry) {
            alert('❌ Game not loaded yet');
            return;
        }

        const bank = GameEngine.state.bank.items;
        const testItems = ItemRegistry.test || {};
        let removed = 0;

        for (const itemId in testItems) {
            if (bank[itemId]) {
                delete bank[itemId];
                removed++;
                console.log(`🗑️ Removed test item: ${itemId}`);
            }
        }

        console.log(`🧹 Test cleanup: ${removed} items removed`);

        SaveSystem.save();
        UICore.update();

        alert(`✅ Removed ${removed} test items from bank`);
        this.render();
    },

    /**
     * Export bank contents
     */
    exportBank() {
        if (!GameEngine?.state?.bank) return;

        const data = JSON.stringify(GameEngine.state.bank, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bank_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('Bank exported');
    },

    // ========================================
    // TAB 3: COMBAT FUNCTIONS
    // ========================================

    /**
     * Update attribute slider
     */
    updateAttributeSlider(attr) {
        const slider = document.getElementById(`dev${attr}Slider`);
        const input = document.getElementById(`dev${attr}Input`);
        const display = document.getElementById(`dev${attr}Value`);

        if (slider && input && display) {
            input.value = slider.value;
            display.textContent = slider.value;
        }
    },

    /**
     * Update attribute input
     */
    updateAttributeInput(attr) {
        const slider = document.getElementById(`dev${attr}Slider`);
        const input = document.getElementById(`dev${attr}Input`);
        const display = document.getElementById(`dev${attr}Value`);

        if (slider && input && display) {
            slider.value = input.value;
            display.textContent = input.value;
        }
    },

    /**
     * Apply attributes to game state
     */
    applyAttributes() {
        if (!GameEngine?.state?.attributes) return;

        const attributeNames = ['health', 'defense', 'strength', 'stealth', 'perception', 'mobility', 'intellect'];

        for (let attr of attributeNames) {
            const input = document.getElementById(`dev${attr}Input`);
            if (input) {
                GameEngine.state.attributes[attr] = parseInt(input.value) || 1;
            }
        }

        console.log('Attributes applied:', GameEngine.state.attributes);
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Set all attributes to a value
     */
    setAllAttributes(value) {
        if (!GameEngine?.state?.attributes) return;

        const attributeNames = ['health', 'defense', 'strength', 'stealth', 'perception', 'mobility', 'intellect'];

        for (let attr of attributeNames) {
            GameEngine.state.attributes[attr] = value;
        }

        console.log(`Set all attributes to ${value}`);
        this.render();
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Spawn selected enemy
     */
    spawnEnemy() {
        const enemyId = document.getElementById('devEnemySelector')?.value;
        if (!enemyId) return;

        // Call combat system to start combat with enemy
        if (typeof GameEngine?.startCombat === 'function') {
            GameEngine.startCombat(enemyId);
            console.log(`Spawned enemy: ${enemyId}`);
        } else {
            console.error('GameEngine.startCombat not available');
        }
    },

    /**
     * Quick kill enemy (set to 1 HP)
     */
    quickKillEnemy() {
        if (GameEngine?.state?.combat?.active && GameEngine.state.combat.enemyHp !== undefined) {
            GameEngine.state.combat.enemyHp = 1;
            console.log('Enemy HP set to 1');
            if (typeof UICore !== 'undefined') UICore.update();
        } else {
            console.log('No active combat');
        }
    },

    /**
     * Instant victory
     */
    instantVictory() {
        if (GameEngine?.state?.combat?.active && GameEngine.state.combat.enemyHp !== undefined) {
            GameEngine.state.combat.enemyHp = 0;
            console.log('Enemy defeated instantly');
            if (typeof UICore !== 'undefined') UICore.update();
        } else {
            console.log('No active combat');
        }
    },

    /**
     * Toggle god mode
     */
    toggleGodMode() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devGodMode = !GameEngine.devGodMode;
            console.log('God mode:', GameEngine.devGodMode ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle one-hit kill
     */
    toggleOneHitKill() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devOneHitKill = !GameEngine.devOneHitKill;
            console.log('One-hit kill:', GameEngine.devOneHitKill ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle infinite consumables
     */
    toggleInfiniteConsumables() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devInfiniteConsumables = !GameEngine.devInfiniteConsumables;
            console.log('Infinite consumables:', GameEngine.devInfiniteConsumables ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle auto-win combat
     */
    toggleAutoWin() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devAutoWin = !GameEngine.devAutoWin;
            console.log('Auto-win:', GameEngine.devAutoWin ? 'ON' : 'OFF');
        }
    },

    // ========================================
    // TAB 4: TIME FUNCTIONS
    // ========================================

    /**
     * Skip time (in hours)
     */
    skipTime(hours) {
        if (!GameEngine?.update) return;

        const seconds = hours * 3600;
        GameEngine.update(seconds);
        console.log(`Skipped ${hours} hour(s)`);
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Skip custom time
     */
    skipCustomTime() {
        const hours = parseInt(document.getElementById('devCustomSkip')?.value) || 0;
        if (hours > 0) {
            this.skipTime(hours);
        }
    },

    /**
     * Update speed slider
     */
    updateSpeedSlider() {
        const slider = document.getElementById('devSpeedSlider');
        const display = document.getElementById('devSpeedDisplay');

        if (slider && display) {
            const value = parseFloat(slider.value);
            display.textContent = `${value.toFixed(1)}x`;

            if (typeof GameEngine !== 'undefined') {
                GameEngine.devSpeedMultiplier = value;
            }
        }
    },

    /**
     * Set game speed
     */
    setGameSpeed(multiplier) {
        const slider = document.getElementById('devSpeedSlider');
        const display = document.getElementById('devSpeedDisplay');

        if (slider) slider.value = multiplier;
        if (display) display.textContent = `${multiplier}x`;

        if (typeof GameEngine !== 'undefined') {
            GameEngine.devSpeedMultiplier = multiplier;
            console.log(`Game speed set to ${multiplier}x`);
        }
    },

    /**
     * Toggle instant crafts
     */
    toggleInstantCrafts() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devInstantCrafts = !GameEngine.devInstantCrafts;
            console.log('Instant crafts:', GameEngine.devInstantCrafts ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle instant gathering
     */
    toggleInstantGathering() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devInstantGathering = !GameEngine.devInstantGathering;
            console.log('Instant gathering:', GameEngine.devInstantGathering ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle instant travel
     */
    toggleInstantTravel() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devInstantTravel = !GameEngine.devInstantTravel;
            console.log('Instant travel:', GameEngine.devInstantTravel ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle no cooldowns
     */
    toggleNoCooldowns() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devNoCooldowns = !GameEngine.devNoCooldowns;
            console.log('No cooldowns:', GameEngine.devNoCooldowns ? 'ON' : 'OFF');
        }
    },

    // ========================================
    // TAB 5: SCENARIOS FUNCTIONS
    // ========================================

    /**
     * Load a scenario
     */
    loadScenario(scenarioName) {
        if (!confirm(`Load scenario: ${scenarioName}?\n\nThis will modify your character state.`)) {
            return;
        }

        switch(scenarioName) {
            case 'freshStart':
                this.scenarioFreshStart();
                break;
            case 'earlyGame':
                this.scenarioEarlyGame();
                break;
            case 'midGame':
                this.scenarioMidGame();
                break;
            case 'lateGame':
                this.scenarioLateGame();
                break;
            case 'endgame':
                this.scenarioEndgame();
                break;
            case 'testCrafting':
                this.scenarioTestCrafting();
                break;
            case 'testCombat':
                this.scenarioTestCombat();
                break;
            case 'testExploration':
                this.scenarioTestExploration();
                break;
        }

        console.log(`Loaded scenario: ${scenarioName}`);
        if (typeof UICore !== 'undefined') UICore.update();
    },

    /**
     * Scenario: Fresh Start
     */
    scenarioFreshStart() {
        // Set all skills to level 1
        this.setAllSkillsLevel(1);
        // Set all attributes to 1
        this.setAllAttributes(1);
        // Clear bank
        if (GameEngine?.state?.bank) {
            for (let tab in GameEngine.state.bank) {
                GameEngine.state.bank[tab] = {};
            }
        }
    },

    /**
     * Scenario: Early Game
     */
    scenarioEarlyGame() {
        // Skills 5-10
        if (GameEngine?.state?.skills) {
            const skills = SkillRegistry.getAllActive();
            for (let skillId in skills) {
                if (!GameEngine.state.skills[skillId]) {
                    GameEngine.state.skills[skillId] = { level: 1, xp: 0, unlocked: true };
                }
                const level = Math.floor(Math.random() * 6) + 5; // 5-10
                GameEngine.state.skills[skillId].level = level;
                GameEngine.state.skills[skillId].xp = this.calculateTotalXP(level, skills[skillId]);
            }
        }

        // Attributes 10-20
        this.setAllAttributes(15);

        // Add basic tools and resources
        if (GameEngine?.addItemToBank) {
            this.addStarterKit();
            this.addAllTierItems(1);
        }
    },

    /**
     * Scenario: Mid Game
     */
    scenarioMidGame() {
        // Skills 25-50
        this.setAllSkillsLevel(35);

        // Attributes 50-100
        this.setAllAttributes(75);

        // Add tier 2-3 items
        if (GameEngine?.addItemToBank) {
            this.addAllTierItems(2);
            this.addAllTierItems(3);
        }
    },

    /**
     * Scenario: Late Game
     */
    scenarioLateGame() {
        // Skills 100-200
        this.setAllSkillsLevel(150);

        // Attributes 200-500
        this.setAllAttributes(350);

        // Add tier 4-5 items
        if (GameEngine?.addItemToBank) {
            this.addAllTierItems(4);
            this.addAllTierItems(5);
        }
    },

    /**
     * Scenario: Endgame
     */
    scenarioEndgame() {
        // Skills 500-1000
        this.setAllSkillsLevel(750);

        // Attributes 500-999
        this.setAllAttributes(750);

        // Add all items
        if (GameEngine?.addItemToBank) {
            const items = ItemRegistry.getAllActive();
            for (let itemId in items) {
                GameEngine.addItemToBank(itemId, 100);
            }
        }
    },

    /**
     * Scenario: Test Crafting
     */
    scenarioTestCrafting() {
        // Mining and smithing skills
        if (GameEngine?.state?.skills) {
            const skills = SkillRegistry.getAllActive();
            if (skills.mining) {
                GameEngine.state.skills.mining = { level: 20, xp: this.calculateTotalXP(20, skills.mining), unlocked: true };
            }
            if (skills.smithing) {
                GameEngine.state.skills.smithing = { level: 20, xp: this.calculateTotalXP(20, skills.smithing), unlocked: true };
            }
        }

        // Add raw materials
        if (GameEngine?.addItemToBank) {
            GameEngine.addItemToBank('copperOre', 100);
            GameEngine.addItemToBank('tinOre', 100);
            GameEngine.addItemToBank('ironOre', 100);
            GameEngine.addItemToBank('coal', 100);
        }
    },

    /**
     * Scenario: Test Combat
     */
    scenarioTestCombat() {
        // Combat skills to 50+
        if (GameEngine?.state?.skills) {
            const skills = SkillRegistry.getAllActive();
            const combatSkills = ['strength', 'defense', 'perception'];
            for (let skill of combatSkills) {
                if (skills[skill]) {
                    GameEngine.state.skills[skill] = { level: 50, xp: this.calculateTotalXP(50, skills[skill]), unlocked: true };
                }
            }
        }

        // High strength and perception
        if (GameEngine?.state?.attributes) {
            GameEngine.state.attributes.strength = 100;
            GameEngine.state.attributes.perception = 100;
        }

        // Add weapons and consumables
        if (GameEngine?.addItemToBank) {
            GameEngine.addItemToBank('ironSword', 1);
            GameEngine.addItemToBank('ironShield', 1);
            GameEngine.addItemToBank('healthPotion', 20);
        }
    },

    /**
     * Scenario: Test Exploration
     */
    scenarioTestExploration() {
        // Navigation skill 50+
        if (GameEngine?.state?.skills) {
            const skills = SkillRegistry.getAllActive();
            if (skills.navigation) {
                GameEngine.state.skills.navigation = { level: 50, xp: this.calculateTotalXP(50, skills.navigation), unlocked: true };
            }
        }

        // Unlock all regions
        if (GameEngine?.state?.regions && GameEngine.definitions?.worldMap) {
            for (let regionId in GameEngine.definitions.worldMap) {
                if (!GameEngine.state.regions[regionId]) {
                    GameEngine.state.regions[regionId] = {
                        discovered: false,
                        discoveryProgress: 0,
                        discoveredExitPaths: [],
                        availableNodes: {}
                    };
                }
                GameEngine.state.regions[regionId].discovered = true;
                GameEngine.state.regions[regionId].discoveryProgress = 100;
            }
        }

        // Add travel resources
        if (GameEngine?.addItemToBank) {
            GameEngine.addItemToBank('pinewood', 999);
            GameEngine.addItemToBank('lightRations', 999);
        }
    },

    // ========================================
    // TAB 6: REGISTRY FUNCTIONS
    // ========================================

    /**
     * Toggle dev mode
     */
    toggleDevMode() {
        // Implementation depends on your registry system
        console.log('Dev mode toggled');
    },

    /**
     * Toggle test mode
     */
    toggleTestMode() {
        console.log('Test mode toggled');
    },

    /**
     * Toggle preview mode
     */
    togglePreviewMode() {
        console.log('Preview mode toggled');
    },

    /**
     * Export all data
     */
    exportAllData() {
        if (!GameEngine?.state) return;

        const data = JSON.stringify(GameEngine.state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `game_state_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('Game state exported');
    },

    /**
     * Import data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm('Import this data? This will overwrite your current game state.')) {
                        GameEngine.state = data;
                        console.log('Game state imported');
                        if (typeof UICore !== 'undefined') UICore.update();
                    }
                } catch (error) {
                    console.error('Failed to import data:', error);
                    alert('Failed to import data. Invalid JSON format.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    /**
     * Validate all registries
     */
    validateAllRegistries() {
        if (typeof RegistryManager !== 'undefined' && RegistryManager.validateAll) {
            const results = RegistryManager.validateAll();
            console.log('Registry validation results:', results);
            alert('Check console for validation results');
        } else {
            console.log('RegistryManager.validateAll not available');
        }
    },

    /**
     * Clear all caches
     */
    clearAllCaches() {
        console.log('Caches cleared (stub)');
    },

    /**
     * Toggle verbose logging
     */
    toggleVerboseLogging() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devVerboseLogging = !GameEngine.devVerboseLogging;
            console.log('Verbose logging:', GameEngine.devVerboseLogging ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle log registry lookups
     */
    toggleLogRegistryLookups() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devLogRegistryLookups = !GameEngine.devLogRegistryLookups;
            console.log('Log registry lookups:', GameEngine.devLogRegistryLookups ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle log state changes
     */
    toggleLogStateChanges() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devLogStateChanges = !GameEngine.devLogStateChanges;
            console.log('Log state changes:', GameEngine.devLogStateChanges ? 'ON' : 'OFF');
        }
    },

    /**
     * Toggle log system updates
     */
    toggleLogSystemUpdates() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devLogSystemUpdates = !GameEngine.devLogSystemUpdates;
            console.log('Log system updates:', GameEngine.devLogSystemUpdates ? 'ON' : 'OFF');
        }
    },

    /**
     * Expose GameEngine to console
     */
    exposeGameEngine() {
        if (typeof GameEngine !== 'undefined') {
            window.GameEngine = GameEngine;
            console.log('GameEngine exposed to window.GameEngine');
            alert('GameEngine is now available in the console as window.GameEngine');
        }
    },

    /**
     * Expose RegistryManager to console
     */
    exposeRegistryManager() {
        if (typeof RegistryManager !== 'undefined') {
            window.RegistryManager = RegistryManager;
            console.log('RegistryManager exposed to window.RegistryManager');
            alert('RegistryManager is now available in the console as window.RegistryManager');
        }
    }
};

/**
 * Toggle the dev modal (called from header button)
 */
function toggleDevModal() {
    if (DevModal.isOpen) {
        DevModal.close();
    } else {
        DevModal.open();
    }
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DevModal.isOpen) {
        DevModal.close();
    }
});
