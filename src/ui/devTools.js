/**
 * DEV TOOLS COMPONENT
 *
 * Reusable component for rendering dev tools on each tab.
 * Provides balancing variables and debug functions specific to each game system.
 */

const DevTools = {
    collapsed: {}, // Track collapsed state per tab

    /**
     * Render dev tools box for a specific tab
     * @param {string} tabId - Unique ID for this dev tools instance
     * @param {object} config - Configuration object with sections array
     * @returns {string} HTML string for dev tools box
     */
    render(tabId, config) {
        const isCollapsed = this.collapsed[tabId] !== false; // Default to expanded

        let html = `
            <div id="devTools_${tabId}" style="background: rgba(25, 25, 35, 0.95); border: 2px solid #ff9800; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
                <!-- Header -->
                <div onclick="DevTools.toggle('${tabId}')" style="background: linear-gradient(90deg, #ff9800, #f57c00); padding: 10px 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2em;">🛠️</span>
                        <strong style="color: white; font-size: 0.95em;">DEVELOPER TOOLS</strong>
                        ${config.title ? `<span style="color: rgba(255,255,255,0.7); font-size: 0.85em;">- ${config.title}</span>` : ''}
                    </div>
                    <span style="color: white; font-size: 0.9em; transition: transform 0.2s;" id="devToolsToggle_${tabId}">
                        ${isCollapsed ? '▼' : '▲'}
                    </span>
                </div>

                <!-- Content -->
                <div id="devToolsContent_${tabId}" style="display: ${isCollapsed ? 'none' : 'block'}; padding: 15px;">
                    ${this.renderSections(config.sections)}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render all sections within a dev tools box
     */
    renderSections(sections) {
        let html = '<div style="display: grid; gap: 15px;">';

        for (let section of sections) {
            if (section.type === 'balancing') {
                html += this.renderBalancingSection(section);
            } else if (section.type === 'debug') {
                html += this.renderDebugSection(section);
            }
        }

        html += '</div>';
        return html;
    },

    /**
     * Render a balancing variables section
     */
    renderBalancingSection(section) {
        const balance = GameEngine.gameBalance;

        let html = `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                <h4 style="margin: 0 0 12px 0; color: #4a9eff; font-size: 1em;">${section.icon || '⚙️'} ${section.title}</h4>
                <div style="display: grid; gap: 10px;">
        `;

        for (let variable of section.variables) {
            const value = balance[variable.key];
            const displayValue = variable.type === 'float' ? value.toFixed(2) : value;

            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <label style="font-size: 0.85em; color: #ddd;">${variable.label}</label>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <input
                                type="number"
                                value="${displayValue}"
                                min="${variable.min}"
                                max="${variable.max}"
                                step="${variable.step}"
                                onchange="updateBalanceVariable('${variable.key}', parseFloat(this.value), '${variable.type}')"
                                style="width: 70px; padding: 3px 6px; background: #1a1a2a; border: 1px solid #555; border-radius: 3px; color: white; text-align: right; font-size: 0.85em;"
                            />
                            <button
                                onclick="resetBalanceVariable('${variable.key}')"
                                style="padding: 3px 6px; background: #555; border: 1px solid #444; border-radius: 3px; color: white; cursor: pointer; font-size: 0.75em;"
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
                    <div style="display: flex; justify-content: space-between; font-size: 0.7em; color: #888; margin-top: 2px;">
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

        return html;
    },

    /**
     * Render a debug functions section
     */
    renderDebugSection(section) {
        let html = `
            <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 6px; padding: 15px;">
                <h4 style="margin: 0 0 12px 0; color: #9c27b0; font-size: 1em;">${section.icon || '🐛'} ${section.title}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
        `;

        for (let func of section.functions) {
            html += `
                <button
                    onclick="${func.onclick}"
                    style="padding: 8px 10px; background: #7b1fa2; border: 1px solid #6a1b9a; border-radius: 4px; color: white; font-size: 0.85em; cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='#9c27b0'"
                    onmouseout="this.style.background='#7b1fa2'"
                >
                    ${func.icon || '▶️'} ${func.label}
                </button>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Toggle dev tools visibility
     */
    toggle(tabId) {
        const content = document.getElementById(`devToolsContent_${tabId}`);
        const toggle = document.getElementById(`devToolsToggle_${tabId}`);

        if (!content || !toggle) return;

        const isCurrentlyCollapsed = content.style.display === 'none';

        content.style.display = isCurrentlyCollapsed ? 'block' : 'none';
        toggle.textContent = isCurrentlyCollapsed ? '▲' : '▼';
        this.collapsed[tabId] = !isCurrentlyCollapsed;
    },

    /**
     * Reset all missions for testing
     */
    resetMissions() {
        console.log('🔄 Resetting all missions...');

        // Clear all mission state
        GameEngine.state.missions.available = [];
        GameEngine.state.missions.active = [];
        GameEngine.state.missions.completed = [];
        GameEngine.state.missions.progress = {};

        // Reinitialize missions
        GameEngine.initializeMissions();

        // Force UI refresh
        MissionsUI.lastMissionsState = null;
        if (UICore.currentView === 'missions') {
            UICore.update();
        }

        console.log('✅ Missions reset! All missions are now incomplete.');
        console.log('📋 Available missions:', GameEngine.state.missions.available);
    }
};
