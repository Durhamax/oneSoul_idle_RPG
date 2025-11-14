/**
 * RESOURCES UI
 *
 * Handles rendering of resources, generators, and upgrades.
 */

const ResourcesUI = {
    // State tracking for caching
    lastGeneratorsState: null,
    lastUpgradesState: null,

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
                displayAmount = Formatting.formatNumber(amount);

                if (rate && rate > 0) {
                    displayRate = `<span style="color: #4caf50;"> (+${Formatting.formatNumber(rate)}/s)</span>`;
                }
            }

            html += `
                <div class="resource">
                    <span class="resource-name">${Formatting.capitalizeFirst(resourceId)}:</span>
                    <span class="resource-value">${displayAmount}</span>
                    ${displayRate}
                </div>
            `;
        }

        container.innerHTML = html;
    },

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
                    <div class="upgrade-effect">Production: ${Formatting.formatNumber(currentProduction)} ${def.produces}/s</div>
                    <div class="upgrade-cost">Cost: ${Formatting.formatNumber(cost)} ${def.costResource}</div>
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
                        <div class="upgrade-cost">Cost: ${Formatting.formatNumber(cost)} ${def.costResource}</div>
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
    }
};
