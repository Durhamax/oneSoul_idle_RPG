/**
 * NODE COLLECTION UI
 *
 * Displays available resource nodes and harvesting interface
 */

const NodeCollectionUI = {
    /**
     * Render the node collection panel
     */
    renderPanel() {
        const availableNodes = GameEngine.getAvailableNodesInRegion();

        if (availableNodes.length === 0) {
            return `
                <div style="padding: 20px; text-align: center; color: #888;">
                    <div style="font-size: 2em; margin-bottom: 10px;">🗺️</div>
                    <div style="font-size: 0.9em;">No resource nodes discovered in this region</div>
                    <div style="font-size: 0.75em; margin-top: 8px;">
                        Explore to discover gathering spots!
                    </div>
                </div>
            `;
        }

        // Group nodes by skill type
        const nodesBySkill = {};
        availableNodes.forEach(({ node }) => {
            if (!nodesBySkill[node.nodeType]) {
                nodesBySkill[node.nodeType] = [];
            }
            nodesBySkill[node.nodeType].push(node);
        });

        let html = `<div style="padding: 15px;">`;

        // Render each skill group
        for (const [skillType, nodes] of Object.entries(nodesBySkill)) {
            html += this.renderSkillGroup(skillType, nodes, availableNodes);
        }

        html += `</div>`;

        return html;
    },

    /**
     * Render a skill group of nodes
     */
    renderSkillGroup(skillType, nodes, availableNodesData) {
        const skillIcon = this.getSkillIcon(skillType);
        const skillName = Formatting.capitalizeFirst(skillType);

        let html = `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 10px; color: #e94560; display: flex; align-items: center; gap: 8px;">
                    <span>${skillIcon}</span>
                    <span>${skillName}</span>
                    <span style="font-size: 0.75em; color: #888;">(${nodes.length})</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
        `;

        // Render each node card
        nodes.forEach(node => {
            const nodeData = availableNodesData.find(n => n.node.id === node.id);
            html += this.renderNodeCard(node, nodeData);
        });

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render an individual node card
     */
    renderNodeCard(node, nodeData) {
        const { state, canHarvest } = nodeData;
        const playerSkillLevel = GameEngine.state.skills[node.nodeType]?.level || 0;

        // Calculate node status
        const healthPercent = (state.currentHealth / state.maxHealth) * 100;
        let statusColor, statusText, statusIcon;

        if (state.currentHealth === 0) {
            statusColor = '#f44336';
            statusText = 'Depleted';
            statusIcon = '💤';
        } else if (healthPercent <= 30) {
            statusColor = '#ff9800';
            statusText = 'Low';
            statusIcon = '⚠️';
        } else if (healthPercent <= 70) {
            statusColor = '#ffeb3b';
            statusText = 'Moderate';
            statusIcon = '📊';
        } else {
            statusColor = '#4caf50';
            statusText = 'Abundant';
            statusIcon = '✨';
        }

        // Check if locked
        if (!canHarvest.canHarvest && canHarvest.reason.includes('level')) {
            statusColor = '#666';
            statusText = 'Locked';
            statusIcon = '🔒';
        }

        // Get tier stars
        const tierStars = '⭐'.repeat(node.tier);

        // Calculate harvest stats with player bonuses
        const harvestTime = NodeUtils.calculateHarvestTime(node, playerSkillLevel);
        const rareChance = NodeUtils.calculateRareChance(node, playerSkillLevel);

        // Get rarity color
        const rarityColors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800'
        };
        const rarityColor = rarityColors[node.rarity] || '#9e9e9e';

        // Check if currently harvesting this node
        const isActiveHarvest = GameEngine.state.nodeCollection?.activeNode?.nodeId === node.id;

        let html = `
            <div style="
                background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
                border-radius: 8px;
                padding: 12px;
                border: 2px solid ${rarityColor};
                border-left: 4px solid ${node.color};
                position: relative;
                overflow: hidden;
            ">
                <!-- Tier Badge -->
                <div style="position: absolute; top: 8px; right: 8px; font-size: 0.7em; color: ${rarityColor};">
                    ${tierStars}
                </div>

                <!-- Node Header -->
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="font-size: 2em;">${node.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 1em; color: ${node.color};">
                            ${node.name}
                        </div>
                        <div style="font-size: 0.7em; color: #888; font-style: italic;">
                            ${node.description}
                        </div>
                    </div>
                </div>

                <!-- Status Bar -->
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <div style="font-size: 0.75em; color: ${statusColor}; display: flex; align-items: center; gap: 4px;">
                            <span>${statusIcon}</span>
                            <span style="font-weight: bold;">${statusText}</span>
                        </div>
                        <div style="font-size: 0.75em; color: #aaa;">
                            ${state.currentHealth === 0 ? 'Respawning...' : `${state.currentHealth}/${state.maxHealth} harvests`}
                        </div>
                    </div>

                    <!-- Health Bar -->
                    ${this.renderHealthBar(state, statusColor)}

                    <!-- Respawn Timer -->
                    ${state.currentHealth === 0 ? this.renderRespawnTimer(node) : ''}
                </div>

                <!-- Resource Preview -->
                <div style="margin-bottom: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                    <div style="font-size: 0.7em; color: #888; text-transform: uppercase; margin-bottom: 4px;">
                        Resources
                    </div>
                    ${this.renderResourcePreview(node)}
                </div>

                <!-- Stats -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-size: 0.75em;">
                    <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
                        <div style="color: #888;">Harvest Time</div>
                        <div style="font-weight: bold; color: #4caf50;">${harvestTime.toFixed(1)}s</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px;">
                        <div style="color: #888;">Rare Chance</div>
                        <div style="font-weight: bold; color: #ff9800;">${rareChance.toFixed(1)}%</div>
                    </div>
                </div>

                <!-- Skill Requirement Badge -->
                ${this.renderSkillRequirement(node, playerSkillLevel)}

                <!-- Harvest Button -->
                ${this.renderHarvestButton(node, canHarvest, isActiveHarvest, harvestTime)}

                <!-- Active Harvest Progress -->
                ${isActiveHarvest ? this.renderHarvestProgress() : ''}
            </div>

            <!-- Harvest vs Node Stats Panel (shown when actively harvesting) -->
            ${isActiveHarvest && typeof HarvestStatsPanel !== 'undefined' ? HarvestStatsPanel.render() : ''}
        `;

        return html;
    },

    /**
     * Render health bar
     */
    renderHealthBar(state, color) {
        const percent = (state.currentHealth / state.maxHealth) * 100;

        return `
            <div style="
                width: 100%;
                height: 8px;
                background: rgba(0,0,0,0.5);
                border-radius: 4px;
                overflow: hidden;
            ">
                <div style="
                    width: ${percent}%;
                    height: 100%;
                    background: linear-gradient(90deg, ${color} 0%, ${color}dd 100%);
                    transition: width 0.3s ease;
                "></div>
            </div>
        `;
    },

    /**
     * Render respawn timer
     */
    renderRespawnTimer(node) {
        const timeRemaining = GameEngine.getTimeUntilRespawn(node.id);
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);

        return `
            <div style="
                margin-top: 6px;
                padding: 6px;
                background: rgba(244, 67, 54, 0.2);
                border-radius: 4px;
                text-align: center;
                font-size: 0.75em;
                color: #ff6b6b;
            ">
                Respawns in ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s
            </div>
        `;
    },

    /**
     * Render resource preview
     */
    renderResourcePreview(node) {
        const topResources = node.resourceTable
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);

        let html = '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';

        topResources.forEach(resource => {
            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    font-size: 0.7em;
                ">
                    <span style="color: #4caf50;">${resource.itemId}</span>
                    <span style="color: #888;">x${resource.minYield}-${resource.maxYield}</span>
                </div>
            `;
        });

        html += '</div>';

        return html;
    },

    /**
     * Render skill requirement badge
     */
    renderSkillRequirement(node, playerSkillLevel) {
        const meetsRequirement = playerSkillLevel >= node.requiredSkillLevel;
        const color = meetsRequirement ? '#4caf50' : '#f44336';
        const icon = meetsRequirement ? '✓' : '🔒';

        return `
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px;
                background: rgba(0,0,0,0.3);
                border-radius: 4px;
                margin-bottom: 10px;
                font-size: 0.75em;
            ">
                <div style="color: #888;">Required Level</div>
                <div style="display: flex; align-items: center; gap: 4px; color: ${color}; font-weight: bold;">
                    <span>${icon}</span>
                    <span>${node.requiredSkillLevel}</span>
                    <span style="color: #666;">/</span>
                    <span style="color: ${meetsRequirement ? '#4caf50' : '#aaa'};">${playerSkillLevel}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render harvest button
     */
    renderHarvestButton(node, canHarvest, isActiveHarvest, harvestTime) {
        if (isActiveHarvest) {
            return `
                <button onclick="GameEngine.cancelHarvest()" style="
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 0.9em;
                ">
                    ⏸️ Cancel Harvest
                </button>
            `;
        }

        if (!canHarvest.canHarvest) {
            return `
                <button disabled style="
                    width: 100%;
                    padding: 10px;
                    background: #444;
                    color: #888;
                    border: none;
                    border-radius: 6px;
                    cursor: not-allowed;
                    font-size: 0.85em;
                ">
                    ${canHarvest.reason}
                </button>
            `;
        }

        return `
            <button onclick="window.harvestNode('${node.id}')" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.9em;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                ⛏️ Harvest (${harvestTime.toFixed(1)}s)
            </button>
        `;
    },

    /**
     * Render harvest progress bar
     */
    renderHarvestProgress() {
        const progress = GameEngine.getHarvestProgress() * 100;

        return `
            <div style="
                margin-top: 10px;
                padding: 8px;
                background: rgba(76, 175, 80, 0.2);
                border-radius: 4px;
            ">
                <div style="
                    font-size: 0.7em;
                    color: #4caf50;
                    margin-bottom: 4px;
                    text-align: center;
                    font-weight: bold;
                ">
                    Harvesting... ${progress.toFixed(0)}%
                </div>
                <div style="
                    width: 100%;
                    height: 6px;
                    background: rgba(0,0,0,0.5);
                    border-radius: 3px;
                    overflow: hidden;
                ">
                    <div style="
                        width: ${progress}%;
                        height: 100%;
                        background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
                        transition: width 0.1s linear;
                    "></div>
                </div>
            </div>
        `;
    },

    /**
     * Get skill icon
     */
    getSkillIcon(skillType) {
        const icons = {
            mining: '⛏️',
            logging: '🪓',
            fishing: '🎣',
            hunting: '🏹',
            foraging: '🌿',
            thieving: '🎭'
        };
        return icons[skillType] || '📦';
    }
};

/**
 * Global harvest function (called from button onclick)
 */
window.harvestNode = function(nodeId) {
    const started = GameEngine.startHarvest(nodeId);
    if (started) {
        // Update UI to show progress
        updateResourcesUI();
    }
};
