/**
 * MEDAL CRAFTING UI
 *
 * Developer panel for medal crafting simulator
 * - Shows crafting tiers with costs and chances
 * - Preview system
 * - Bulk crafting controls
 * - Economy balance warnings
 */

const MedalCraftingUI = {
    /**
     * Render the complete medal crafting simulator
     */
    render() {
        const stats = GameEngine.getMedalCraftingStats();
        const currentMedals = GameEngine.state.currencies?.medals || 0;

        let html = `
            <div class="medal-crafting-panel">
                <h3 style="color: #ff9800; margin-top: 0;">🏅 Medal Crafting Simulator</h3>
                <p style="color: #aaa; font-size: 0.9em; margin-bottom: 20px;">
                    Craft perk medals using medal currency. Higher tiers have better rarity chances and multi-perk medals.
                </p>

                <!-- Current Status -->
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-top: 0;">Current Status</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div>
                            <div style="font-size: 0.8em; color: #888;">Medal Currency</div>
                            <div style="font-size: 1.5em; font-weight: bold; color: #ff9800;">${this.formatNumber(currentMedals)}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.8em; color: #888;">Total Crafted</div>
                            <div style="font-size: 1.5em; font-weight: bold; color: #4a9eff;">${stats.totalCrafted}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.8em; color: #888;">In Inventory</div>
                            <div style="font-size: 1.5em; font-weight: bold; color: #4caf50;">${stats.inventoryMedals}</div>
                        </div>
                    </div>
                </div>

                <!-- Economy Balance Warning -->
                ${this.renderEconomyWarning(currentMedals, stats)}

                <!-- Crafting Tiers -->
                <div style="margin-bottom: 20px;">
                    <h4>Crafting Tiers</h4>
                    ${this.renderCraftingTiers(currentMedals, stats)}
                </div>

                <!-- Crafted Medals Inventory -->
                <div style="margin-top: 20px;">
                    <h4>Crafted Medals (${stats.inventoryMedals})</h4>
                    ${this.renderMedalInventory()}
                </div>

                <!-- Statistics -->
                <div style="margin-top: 20px;">
                    <h4>Crafting Statistics</h4>
                    ${this.renderStatistics(stats)}
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render economy balance warning
     */
    renderEconomyWarning(currentMedals, stats) {
        // Calculate average medal drop rate (this would come from combat system)
        const averageMedalsPerCombat = 5; // Placeholder
        const averageCombatTime = 10; // seconds

        const medalsPerHour = (3600 / averageCombatTime) * averageMedalsPerCombat;

        // Calculate costs
        const mythicCost = MedalCraftingSystem.craftingTiers.mythic.cost;
        const hoursToMythic = mythicCost / medalsPerHour;

        let warningHtml = '';
        let warningClass = '';
        let warningText = '';

        if (hoursToMythic > 10) {
            warningClass = 'warning-critical';
            warningText = `⚠️ CRITICAL: At current drop rates, a Mythic craft takes ${hoursToMythic.toFixed(1)} hours. Consider increasing medal drops!`;
        } else if (hoursToMythic > 5) {
            warningClass = 'warning-high';
            warningText = `⚠️ WARNING: Mythic craft takes ${hoursToMythic.toFixed(1)} hours. Medal economy may be too slow.`;
        } else if (hoursToMythic < 0.5) {
            warningClass = 'warning-medium';
            warningText = `⚠️ NOTICE: Mythic craft takes only ${(hoursToMythic * 60).toFixed(0)} minutes. Medal economy may be too fast.`;
        } else {
            warningClass = 'warning-good';
            warningText = `✅ BALANCED: Mythic craft takes ${hoursToMythic.toFixed(1)} hours. Economy looks good!`;
        }

        warningHtml = `
            <div class="${warningClass}" style="padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 2px solid;">
                <div style="font-weight: bold; margin-bottom: 5px;">${warningText}</div>
                <div style="font-size: 0.85em; color: #aaa;">
                    Est. ${medalsPerHour.toFixed(0)} medals/hour •
                    Bronze: ${(MedalCraftingSystem.craftingTiers.bronze.cost / medalsPerHour * 60).toFixed(1)}min •
                    Gold: ${(MedalCraftingSystem.craftingTiers.gold.cost / medalsPerHour * 60).toFixed(1)}min •
                    Mythic: ${hoursToMythic.toFixed(1)}hr
                </div>
            </div>
        `;

        return warningHtml;
    },

    /**
     * Render crafting tiers
     */
    renderCraftingTiers(currentMedals, stats) {
        let html = '<div style="display: grid; gap: 15px;">';

        for (let tierId in MedalCraftingSystem.craftingTiers) {
            const tier = MedalCraftingSystem.craftingTiers[tierId];
            const canAfford = currentMedals >= tier.cost;
            const pityCounter = stats.pityCounters[tierId] || 0;
            const craftedCount = stats.craftedByTier[tierId] || 0;

            html += `
                <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid ${canAfford ? '#4a9eff' : '#555'}; border-radius: 8px; padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <span style="font-size: 1.5em;">${tier.icon}</span>
                            <span style="font-weight: bold; font-size: 1.1em; margin-left: 8px;">${tier.name}</span>
                            <span style="color: #888; margin-left: 10px;">Cost: ${tier.cost} medals</span>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="MedalCraftingUI.craft('${tierId}', 1)"
                                    ${!canAfford ? 'disabled' : ''}
                                    style="padding: 8px 16px; background: #4a9eff; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">
                                Craft 1
                            </button>
                            <button onclick="MedalCraftingUI.craft('${tierId}', 10)"
                                    ${currentMedals < tier.cost * 10 ? 'disabled' : ''}
                                    style="padding: 8px 16px; background: #9c27b0; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">
                                Craft 10
                            </button>
                            <button onclick="MedalCraftingUI.craftMax('${tierId}')"
                                    ${!canAfford ? 'disabled' : ''}
                                    style="padding: 8px 16px; background: #e91e63; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">
                                Craft Max
                            </button>
                        </div>
                    </div>

                    <!-- Rarity Chances -->
                    <div style="margin-bottom: 10px;">
                        <div style="font-size: 0.85em; color: #aaa; margin-bottom: 5px;">Rarity Chances:</div>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            ${this.renderRarityChances(tier.rarityChances, pityCounter)}
                        </div>
                    </div>

                    <!-- Pity Counter -->
                    ${pityCounter > 0 ? `
                        <div style="margin-top: 10px; padding: 8px; background: rgba(255, 152, 0, 0.2); border-radius: 4px; border: 1px solid #ff9800;">
                            <span style="color: #ff9800; font-weight: bold;">🎰 Pity Counter: ${pityCounter}</span>
                            <span style="color: #aaa; font-size: 0.85em; margin-left: 10px;">
                                Legendary chance boosted by +${(pityCounter * 0.5).toFixed(1)}%
                            </span>
                        </div>
                    ` : ''}

                    <!-- Stats -->
                    <div style="margin-top: 10px; font-size: 0.85em; color: #888;">
                        Crafted: ${craftedCount} times •
                        Max possible: ${Math.floor(currentMedals / tier.cost)} crafts
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render rarity chances
     */
    renderRarityChances(chances, pityCounter) {
        let html = '';

        for (let rarity in chances) {
            if (chances[rarity] === 0) continue;

            const rarityData = MedalCraftingSystem.rarities[rarity];
            let chance = chances[rarity] * 100;

            // Apply pity bonus for legendary
            if (rarity === 'legendary' && pityCounter > 0) {
                const pityBonus = Math.min(pityCounter * 0.5, 50);
                chance = Math.min(chance + pityBonus, 95);
            }

            html += `
                <div style="text-align: center;">
                    <div style="font-size: 1.2em;">${rarityData.icon}</div>
                    <div style="font-size: 0.75em; color: ${rarityData.color}; font-weight: bold;">${rarityData.name}</div>
                    <div style="font-size: 0.7em; color: #aaa;">${chance.toFixed(1)}%</div>
                    <div style="font-size: 0.65em; color: #666;">${rarityData.perkCount} perk${rarityData.perkCount > 1 ? 's' : ''}</div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Render medal inventory
     */
    renderMedalInventory() {
        const medals = GameEngine.state.craftedMedals || [];

        if (medals.length === 0) {
            return '<div style="color: #888; text-align: center; padding: 20px;">No medals crafted yet. Start crafting above!</div>';
        }

        // Sort by rarity (legendary first)
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        const sortedMedals = [...medals].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-height: 400px; overflow-y: auto;">';

        for (let medal of sortedMedals) {
            const rarityData = MedalCraftingSystem.rarities[medal.rarity];

            html += `
                <div style="background: rgba(0, 0, 0, 0.3); border: 2px solid ${rarityData.color}; border-radius: 8px; padding: 12px;">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 1.5em; margin-right: 8px;">${rarityData.icon}</span>
                        <div>
                            <div style="font-weight: bold; color: ${rarityData.color};">${medal.name}</div>
                            <div style="font-size: 0.75em; color: #888;">${medal.perks.length} Perk${medal.perks.length > 1 ? 's' : ''}</div>
                        </div>
                    </div>

                    <!-- Perks -->
                    <div style="margin-top: 8px;">
                        ${medal.perks.map(perk => `
                            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid rgba(255,255,255,0.1);">
                                <span style="color: #aaa;">${perk.icon} ${perk.name}</span>
                                <span style="color: #4a9eff; font-weight: bold;">+${perk.value}${perk.type.includes('Multiplier') ? 'x' : ''}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Actions -->
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button onclick="MedalCraftingUI.placeMedal('${medal.id}')"
                                style="flex: 1; padding: 6px; background: #4caf50; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 0.85em;">
                            📍 Place on Grid
                        </button>
                        <button onclick="MedalCraftingUI.deleteMedal('${medal.id}')"
                                style="flex: 1; padding: 6px; background: #e74c3c; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 0.85em;">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Render statistics
     */
    renderStatistics(stats) {
        let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">';

        // By Rarity
        html += '<div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">';
        html += '<h5 style="margin-top: 0;">By Rarity</h5>';
        for (let rarity in MedalCraftingSystem.rarities) {
            const count = stats.craftedByRarity[rarity] || 0;
            const rarityData = MedalCraftingSystem.rarities[rarity];
            if (count > 0) {
                html += `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span style="color: ${rarityData.color};">${rarityData.icon} ${rarityData.name}</span>
                    <span style="font-weight: bold;">${count}</span>
                </div>`;
            }
        }
        html += '</div>';

        // By Tier
        html += '<div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px;">';
        html += '<h5 style="margin-top: 0;">By Tier</h5>';
        for (let tierId in MedalCraftingSystem.craftingTiers) {
            const count = stats.craftedByTier[tierId] || 0;
            const tier = MedalCraftingSystem.craftingTiers[tierId];
            if (count > 0) {
                html += `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
                    <span>${tier.icon} ${tier.name}</span>
                    <span style="font-weight: bold;">${count}</span>
                </div>`;
            }
        }
        html += '</div>';

        html += '</div>';
        return html;
    },

    /**
     * Craft medals
     */
    craft(tierId, count) {
        if (count === 1) {
            const result = GameEngine.craftMedal(tierId);

            if (result.success) {
                const rarityData = MedalCraftingSystem.rarities[result.rarity];
                console.log(`✨ Crafted ${rarityData.name} medal with ${result.medal.perks.length} perk(s)!`);
            } else {
                console.log(`❌ Craft failed: ${result.reason}`);
            }
        } else {
            const result = GameEngine.craftMedalBulk(tierId, count);
            console.log(`✨ Bulk craft complete! Crafted ${result.crafted.length} medals (${result.failed} failed)`);
            for (let rarity in result.byRarity) {
                const rarityData = MedalCraftingSystem.rarities[rarity];
                console.log(`  ${rarityData.icon} ${rarityData.name}: ${result.byRarity[rarity]}`);
            }
        }

        this.refresh();
    },

    /**
     * Craft maximum possible
     */
    craftMax(tierId) {
        const tier = MedalCraftingSystem.craftingTiers[tierId];
        const currentMedals = GameEngine.state.currencies?.medals || 0;
        const maxCount = Math.floor(currentMedals / tier.cost);

        if (maxCount > 0) {
            this.craft(tierId, maxCount);
        }
    },

    /**
     * Place medal on grid
     */
    placeMedal(medalId) {
        // Find the medal in crafted medals
        const medal = GameEngine.state.craftedMedals?.find(m => m.id === medalId);
        if (!medal) {
            console.log(`❌ Medal ${medalId} not found in inventory`);
            return;
        }

        // Prompt for grid position
        const input = prompt(`Place ${medal.name} on grid\n\nEnter position as "row,col" (e.g. "2,3"):\n\nRows and columns are 0-8.\nAvoid equipment area (rows 3-5, cols 3-5).`);

        if (!input) return;

        const parts = input.split(',');
        if (parts.length !== 2) {
            alert('Invalid format! Use "row,col" (e.g. "2,3")');
            return;
        }

        const row = parseInt(parts[0].trim());
        const col = parseInt(parts[1].trim());

        if (isNaN(row) || isNaN(col) || row < 0 || row > 8 || col < 0 || col > 8) {
            alert('Invalid position! Rows and columns must be 0-8');
            return;
        }

        const result = GameEngine.placeMedalOnGrid(row, col, medal);

        if (result.success) {
            console.log(`✅ Placed ${medal.name} at (${row},${col})`);
            this.refresh();
        } else {
            alert(`❌ Failed to place medal: ${result.reason}`);
        }
    },

    /**
     * Delete medal
     */
    deleteMedal(medalId) {
        if (confirm('Are you sure you want to delete this medal?')) {
            const index = GameEngine.state.craftedMedals.findIndex(m => m.id === medalId);
            if (index !== -1) {
                GameEngine.state.craftedMedals.splice(index, 1);
                console.log('🗑️ Medal deleted');
                this.refresh();
            }
        }
    },

    /**
     * Refresh the UI
     */
    refresh() {
        const container = document.getElementById('medalCraftingSimulator');
        if (container) {
            container.innerHTML = this.render();
        }
    },

    /**
     * Format number helper
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toFixed(0);
    }
};
