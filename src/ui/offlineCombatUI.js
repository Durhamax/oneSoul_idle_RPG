/**
 * OFFLINE COMBAT UI
 *
 * Displays offline combat simulation results to the player
 */

const OfflineCombatUI = {
    /**
     * Show offline combat results modal
     */
    showResults(stats, offlineMinutes) {
        if (!stats) return;

        // Check if simulation failed
        if (stats.failed) {
            this.showFailedSimulation(stats, offlineMinutes);
            return;
        }

        // Build results summary
        let html = `
            <div class="offline-results-modal" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #2a2a3a 0%, #1a1a2a 100%);
                border: 3px solid #4a9eff;
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10000;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            ">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4a9eff; margin: 0 0 10px 0; font-size: 1.8em;">
                        ⚔️ Welcome Back!
                    </h2>
                    <p style="color: #aaa; font-size: 1.1em; margin: 0;">
                        You were away for <strong style="color: #ffd43b;">${offlineMinutes} minutes</strong>
                    </p>
                    ${stats.wasCapped ? `
                        <p style="color: #ff9800; font-size: 0.9em; margin-top: 5px;">
                            ⚠️ Offline time capped at 8 hours
                        </p>
                    ` : ''}
                </div>

                <!-- Efficiency Notice -->
                <div style="
                    background: #1a1a2a;
                    border: 1px solid #4a9eff;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 20px;
                    text-align: center;
                    color: #4a9eff;
                    font-size: 0.9em;
                ">
                    💡 Offline combat simulated at 70% efficiency
                </div>

                <!-- Combat Summary -->
                <div style="
                    background: #1a1a2a;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                ">
                    <h3 style="color: #ffd43b; margin: 0 0 15px 0; border-bottom: 2px solid #ffd43b; padding-bottom: 8px;">
                        ⚔️ Combat Summary
                    </h3>

                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <!-- Enemies Killed -->
                        <div style="background: #2a2a3a; padding: 12px; border-radius: 6px;">
                            <div style="color: #aaa; font-size: 0.85em; margin-bottom: 5px;">Enemies Defeated</div>
                            <div style="color: #4caf50; font-size: 1.5em; font-weight: bold;">
                                💀 ${stats.enemiesKilled.toLocaleString()}
                            </div>
                        </div>

                        <!-- Combat XP -->
                        <div style="background: #2a2a3a; padding: 12px; border-radius: 6px;">
                            <div style="color: #aaa; font-size: 0.85em; margin-bottom: 5px;">Combat XP Gained</div>
                            <div style="color: #9c27b0; font-size: 1.5em; font-weight: bold;">
                                📈 ${stats.combatXpGained.toLocaleString()}
                            </div>
                        </div>

                        <!-- Damage Dealt -->
                        <div style="background: #2a2a3a; padding: 12px; border-radius: 6px;">
                            <div style="color: #aaa; font-size: 0.85em; margin-bottom: 5px;">Damage Dealt</div>
                            <div style="color: #f44336; font-size: 1.3em; font-weight: bold;">
                                ⚔️ ${Math.floor(stats.totalDamageDealt).toLocaleString()}
                            </div>
                        </div>

                        <!-- Damage Taken -->
                        <div style="background: #2a2a3a; padding: 12px; border-radius: 6px;">
                            <div style="color: #aaa; font-size: 0.85em; margin-bottom: 5px;">Damage Taken</div>
                            <div style="color: #ff9800; font-size: 1.3em; font-weight: bold;">
                                💥 ${Math.floor(stats.totalDamageTaken).toLocaleString()}
                            </div>
                        </div>

                        ${stats.deaths > 0 ? `
                            <!-- Deaths -->
                            <div style="background: #2a2a3a; padding: 12px; border-radius: 6px; grid-column: span 2;">
                                <div style="color: #aaa; font-size: 0.85em; margin-bottom: 5px;">Deaths</div>
                                <div style="color: #f44336; font-size: 1.3em; font-weight: bold;">
                                    💀 ${stats.deaths}
                                    <span style="font-size: 0.7em; color: #aaa;">(10% gold penalty applied)</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Rewards -->
                <div style="
                    background: #1a1a2a;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                ">
                    <h3 style="color: #ffd43b; margin: 0 0 15px 0; border-bottom: 2px solid #ffd43b; padding-bottom: 8px;">
                        💰 Rewards Earned
                    </h3>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <!-- Gold -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #2a2a3a; border-radius: 6px;">
                            <span style="color: #aaa;">💰 Gold</span>
                            <span style="color: #ffd700; font-weight: bold; font-size: 1.2em;">
                                +${stats.goldGained.toLocaleString()}
                            </span>
                        </div>

                        <!-- Medals -->
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #2a2a3a; border-radius: 6px;">
                            <span style="color: #aaa;">🏅 Medals</span>
                            <span style="color: #4a9eff; font-weight: bold; font-size: 1.2em;">
                                +${stats.medalsGained.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                ${this.renderLootSection(stats.lootGained)}
                ${this.renderConsumablesSection(stats)}

                <!-- Close Button -->
                <div style="text-align: center; margin-top: 25px;">
                    <button onclick="closeOfflineResults()" style="
                        background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
                        border: none;
                        color: white;
                        padding: 15px 40px;
                        font-size: 1.1em;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(74, 158, 255, 0.3);
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        Continue Playing ⚔️
                    </button>
                </div>
            </div>

            <!-- Backdrop -->
            <div class="offline-results-backdrop" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
            " onclick="closeOfflineResults()"></div>
        `;

        // Add to page
        const container = document.createElement('div');
        container.id = 'offlineResultsContainer';
        container.innerHTML = html;
        document.body.appendChild(container);
    },

    /**
     * Show failed simulation message
     */
    showFailedSimulation(stats, offlineMinutes) {
        let html = `
            <div class="offline-results-modal" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #2a2a3a 0%, #1a1a2a 100%);
                border: 3px solid #f44336;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                z-index: 10000;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                text-align: center;
            ">
                <h2 style="color: #f44336; margin: 0 0 20px 0; font-size: 1.8em;">
                    ⚠️ Offline Combat Unavailable
                </h2>

                <p style="color: #aaa; font-size: 1.1em; margin-bottom: 15px;">
                    You were away for <strong style="color: #ffd43b;">${offlineMinutes} minutes</strong>
                </p>

                <div style="
                    background: #1a1a2a;
                    border: 1px solid #f44336;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                ">
                    <p style="color: #f44336; font-weight: bold; margin: 0 0 10px 0;">
                        ❌ Combat Simulation Failed
                    </p>
                    <p style="color: #aaa; margin: 0; line-height: 1.6;">
                        ${stats.reason}
                    </p>
                </div>

                <p style="color: #888; font-size: 0.9em; line-height: 1.6;">
                    💡 <strong>Tip:</strong> To earn offline progress, make sure you can safely defeat your selected enemy. Consider improving your equipment, leveling up, or selecting an easier enemy.
                </p>

                <button onclick="closeOfflineResults()" style="
                    background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
                    border: none;
                    color: white;
                    padding: 15px 40px;
                    font-size: 1.1em;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 20px;
                    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Continue
                </button>
            </div>

            <!-- Backdrop -->
            <div class="offline-results-backdrop" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9999;
            " onclick="closeOfflineResults()"></div>
        `;

        const container = document.createElement('div');
        container.id = 'offlineResultsContainer';
        container.innerHTML = html;
        document.body.appendChild(container);
    },

    /**
     * Render loot section
     */
    renderLootSection(lootGained) {
        const lootEntries = Object.entries(lootGained);

        if (lootEntries.length === 0) {
            return '';
        }

        const lootItems = lootEntries
            .map(([itemId, amount]) => {
                const itemDef = GameEngine.definitions.items[itemId];
                const itemName = itemDef ? itemDef.name : itemId;
                const itemIcon = itemDef ? itemDef.image : '📦';

                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #2a2a3a; border-radius: 4px;">
                        <span style="color: #aaa;">${itemIcon} ${itemName}</span>
                        <span style="color: #4caf50; font-weight: bold;">+${amount}</span>
                    </div>
                `;
            })
            .join('');

        return `
            <div style="
                background: #1a1a2a;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            ">
                <h3 style="color: #ffd43b; margin: 0 0 15px 0; border-bottom: 2px solid #ffd43b; padding-bottom: 8px;">
                    📦 Items Looted
                </h3>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
                    ${lootItems}
                </div>
            </div>
        `;
    },

    /**
     * Render consumables section
     */
    renderConsumablesSection(stats) {
        if (stats.foodConsumed === 0 && stats.ammoConsumed === 0) {
            return '';
        }

        return `
            <div style="
                background: #1a1a2a;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            ">
                <h3 style="color: #ffd43b; margin: 0 0 15px 0; border-bottom: 2px solid #ffd43b; padding-bottom: 8px;">
                    📊 Resources Consumed
                </h3>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${stats.foodConsumed > 0 ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #2a2a3a; border-radius: 6px;">
                            <span style="color: #aaa;">🍎 Food</span>
                            <span style="color: #ff9800; font-weight: bold;">-${stats.foodConsumed}</span>
                        </div>
                    ` : ''}

                    ${stats.ammoConsumed > 0 ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #2a2a3a; border-radius: 6px;">
                            <span style="color: #aaa;">🔫 Ammo</span>
                            <span style="color: #ff9800; font-weight: bold;">-${stats.ammoConsumed}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
};

/**
 * Close offline results modal
 */
function closeOfflineResults() {
    const container = document.getElementById('offlineResultsContainer');
    if (container) {
        container.remove();
    }
}
