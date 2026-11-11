/**
 * MINING UI - Phase 1
 *
 * Displays mining interface with:
 * - Node HP bar
 * - Mining progress bar
 * - Hit/Miss feedback
 * - Tool and skill info
 * - Rest state UI
 */

/**
 * Render main mining UI
 */
function renderMiningUI() {
    const container = document.getElementById('miningContainer');
    if (!container) {
        console.warn('[renderMiningUI] Container #miningContainer not found');
        return;
    }

    // Check if mining is active
    if (GameEngine.state.currentActivity !== 'mining') {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    const nodeId = GameEngine.state.miningState?.activeNode;
    if (!nodeId) {
        console.warn('[renderMiningUI] No active node in miningState');
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }

    console.log(`[renderMiningUI] Rendering UI for node: ${nodeId}`);

    // Get node definition
    const nodeDef = NodeRegistry.getAllActive()[nodeId];
    if (!nodeDef) return;

    // Get node health
    const nodeHealth = GameEngine.state.nodeHealth[nodeId] || { currentHP: 1, maxHP: 1 };
    const tool = GameEngine.getEquippedMiningTool();
    const miningSkill = GameEngine.state.skills.mining;

    // Check if resting
    if (GameEngine.state.miningState.isResting) {
        renderMiningRestUI();
        return;
    }

    // Calculate percentages
    const hpPercent = Math.max(0, (nodeHealth.currentHP / nodeHealth.maxHP) * 100);

    container.style.display = 'block';
    container.innerHTML = `
        <div class="mining-ui" style="
            background: #1a1a1a;
            border: 2px solid #4a9eff;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
        ">
            <!-- Node Header -->
            <div class="node-header" style="
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            ">
                <span class="node-icon" style="font-size: 32px;">${nodeDef.icon || '⛏️'}</span>
                <div style="flex: 1;">
                    <div class="node-name" style="
                        font-size: 20px;
                        font-weight: bold;
                        color: #4a9eff;
                    ">${nodeDef.name}</div>
                    <div class="node-type" style="
                        font-size: 12px;
                        color: #888;
                    ">Mining Node • Tier ${nodeDef.tier || 1}</div>
                </div>
            </div>

            <!-- Node HP Bar -->
            <div class="node-hp-section" style="margin-bottom: 15px;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 12px;
                    color: #aaa;
                ">
                    <span>Node Health</span>
                    <span>${nodeHealth.currentHP} / ${nodeHealth.maxHP} HP</span>
                </div>
                <div class="hp-bar-container" style="
                    width: 100%;
                    height: 20px;
                    background: #333;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid #555;
                ">
                    <div class="hp-bar-fill" style="
                        width: ${hpPercent}%;
                        height: 100%;
                        background: linear-gradient(90deg, #4a9eff, #6bb6ff);
                        transition: width 0.3s ease;
                    "></div>
                </div>
            </div>

            <!-- Mining Progress Bar -->
            <div class="mining-progress-section" style="margin-bottom: 15px;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 12px;
                    color: #aaa;
                ">
                    <span>Mining...</span>
                    <span id="miningProgressText">0.0s</span>
                </div>
                <div class="progress-bar-container" style="
                    width: 100%;
                    height: 10px;
                    background: #222;
                    border-radius: 5px;
                    overflow: hidden;
                    border: 1px solid #444;
                ">
                    <div id="miningProgressFill" class="progress-bar-fill" style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #ffaa00, #ffcc00);
                        transition: width 0.1s linear;
                    "></div>
                </div>
            </div>

            <!-- Feedback Area -->
            <div id="miningFeedback" style="
                min-height: 30px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
            "></div>

            <!-- Mining Info -->
            <div class="mining-info" style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
                padding: 10px;
                background: #222;
                border-radius: 6px;
            ">
                <div>
                    <div style="font-size: 11px; color: #888;">Tool Equipped</div>
                    <div style="font-size: 14px; color: #4a9eff;">
                        ${tool ? `${tool.icon || '⛏️'} ${tool.name}` : 'None'}
                    </div>
                </div>
                <div>
                    <div style="font-size: 11px; color: #888;">Mining Level</div>
                    <div style="font-size: 14px; color: #4a9eff;">
                        Level ${miningSkill.level}
                    </div>
                </div>
            </div>

            <!-- Stop Button -->
            <button onclick="GameEngine.stopMining()" style="
                width: 100%;
                padding: 12px;
                background: #aa4444;
                color: white;
                border: 2px solid #cc6666;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#cc5555'" onmouseout="this.style.background='#aa4444'">
                🛑 Stop Mining
            </button>
        </div>
    `;

    // Start updating progress
    updateMiningProgress();
}

/**
 * Update mining progress bar animation
 */
function updateMiningProgress() {
    if (GameEngine.state.currentActivity !== 'mining') return;
    if (GameEngine.state.miningState?.isResting) return;

    const nodeId = GameEngine.state.miningState?.activeNode;
    if (!nodeId) return;

    const nodeDef = NodeRegistry.getAllActive()[nodeId];
    if (!nodeDef) return;

    const tool = GameEngine.getEquippedMiningTool();
    const miningSkill = GameEngine.state.skills.mining;
    const interval = GameEngine.calculateMiningInterval(nodeDef, tool, miningSkill);

    const lastAction = GameEngine.state.miningState.lastActionTime;
    const now = Date.now();
    const elapsed = now - lastAction;
    const progress = Math.min(100, (elapsed / interval) * 100);

    const fillEl = document.getElementById('miningProgressFill');
    const textEl = document.getElementById('miningProgressText');

    if (fillEl) {
        fillEl.style.width = `${progress}%`;
    }

    if (textEl) {
        const remaining = Math.max(0, (interval - elapsed) / 1000);
        textEl.textContent = `${remaining.toFixed(1)}s`;
    }

    // Continue updating
    if (GameEngine.state.currentActivity === 'mining' && !GameEngine.state.miningState?.isResting) {
        requestAnimationFrame(updateMiningProgress);
    }
}

/**
 * Show damage number when hitting node
 */
function showDamageNumber(damage, isCrit) {
    const feedbackEl = document.getElementById('miningFeedback');
    if (!feedbackEl) return;

    const color = isCrit ? '#ffd700' : '#ffffff';
    const size = isCrit ? '28px' : '20px';

    feedbackEl.innerHTML = `
        <div class="damage-number" style="
            color: ${color};
            font-size: ${size};
            animation: floatUp 0.8s ease-out;
        ">
            ${isCrit ? '💥 ' : ''}⛏️ -${damage} HP${isCrit ? ' CRIT!' : ''}
        </div>
    `;

    setTimeout(() => {
        if (feedbackEl) feedbackEl.innerHTML = '';
    }, 800);
}

/**
 * Show miss indicator
 */
function showMissIndicator() {
    const feedbackEl = document.getElementById('miningFeedback');
    if (!feedbackEl) return;

    feedbackEl.innerHTML = `
        <div class="miss-indicator" style="
            color: #888;
            font-size: 18px;
            animation: fadeOut 0.6s ease-out;
        ">
            ❌ MISS
        </div>
    `;

    setTimeout(() => {
        if (feedbackEl) feedbackEl.innerHTML = '';
    }, 600);
}

/**
 * Render rest state UI
 */
function renderMiningRestUI() {
    const container = document.getElementById('miningContainer');
    if (!container) return;

    const rest = GameEngine.state.restState;
    if (!rest || rest.activity !== 'mining') return;

    const percent = Math.min(100, (rest.endurance / rest.maxEndurance) * 100);

    container.style.display = 'block';
    container.innerHTML = `
        <div class="mining-rest-ui" style="
            background: #1a1a1a;
            border: 2px solid #6666aa;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
        ">
            <!-- Rest Header -->
            <div class="rest-header" style="
                text-align: center;
                margin-bottom: 20px;
            ">
                <div style="font-size: 36px; margin-bottom: 10px;">💤</div>
                <div style="
                    font-size: 24px;
                    font-weight: bold;
                    color: #6666aa;
                ">Resting</div>
                <div style="
                    font-size: 14px;
                    color: #888;
                    margin-top: 5px;
                ">Recovering endurance...</div>
            </div>

            <!-- Endurance Bar -->
            <div class="endurance-section">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 12px;
                    color: #aaa;
                ">
                    <span>Endurance</span>
                    <span id="restEnduranceText">${Math.floor(rest.endurance)} / ${rest.maxEndurance}</span>
                </div>
                <div class="endurance-bar-container" style="
                    width: 100%;
                    height: 24px;
                    background: #222;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #444;
                ">
                    <div id="restEnduranceFill" class="endurance-bar-fill" style="
                        width: ${percent}%;
                        height: 100%;
                        background: linear-gradient(90deg, #6666aa, #8888cc);
                        transition: width 0.2s linear;
                    "></div>
                </div>
            </div>

            <!-- Info -->
            <div style="
                margin-top: 20px;
                padding: 10px;
                background: #222;
                border-radius: 6px;
                text-align: center;
                color: #aaa;
                font-size: 12px;
            ">
                Node will be restored when rest is complete
            </div>

            <!-- Stop Button -->
            <button onclick="GameEngine.stopMining()" style="
                width: 100%;
                margin-top: 15px;
                padding: 12px;
                background: #666;
                color: white;
                border: 2px solid #888;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            " onmouseover="this.style.background='#777'" onmouseout="this.style.background='#666'">
                Stop Resting
            </button>
        </div>
    `;

    // Start updating rest progress
    updateMiningRestProgress();
}

/**
 * Update rest progress bar animation
 */
function updateMiningRestProgress() {
    if (GameEngine.state.currentActivity !== 'mining') return;
    if (!GameEngine.state.miningState?.isResting) return;

    const rest = GameEngine.state.restState;
    if (!rest || rest.activity !== 'mining') return;

    const percent = Math.min(100, (rest.endurance / rest.maxEndurance) * 100);

    const fillEl = document.getElementById('restEnduranceFill');
    const textEl = document.getElementById('restEnduranceText');

    if (fillEl) {
        fillEl.style.width = `${percent}%`;
    }

    if (textEl) {
        textEl.textContent = `${Math.floor(rest.endurance)} / ${rest.maxEndurance}`;
    }

    // Continue updating
    if (GameEngine.state.miningState?.isResting) {
        requestAnimationFrame(updateMiningRestProgress);
    }
}

/**
 * Show requirement modal
 */
function showRequirementModal(data) {
    const modal = document.createElement('div');
    modal.className = 'requirement-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: #1a1a1a;
            border: 2px solid #aa4444;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            text-align: center;
        ">
            <div style="font-size: 48px; margin-bottom: 15px;">${data.icon || '⚠️'}</div>
            <div style="
                font-size: 20px;
                font-weight: bold;
                color: #ff6666;
                margin-bottom: 10px;
            ">${data.title}</div>
            <div style="
                font-size: 14px;
                color: #ccc;
                margin-bottom: 20px;
                line-height: 1.5;
            ">${data.message}</div>
            <button onclick="this.closest('.requirement-modal').remove()" style="
                padding: 10px 30px;
                background: #aa4444;
                color: white;
                border: 2px solid #cc6666;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
            ">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-30px); opacity: 0; }
    }

    @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);
