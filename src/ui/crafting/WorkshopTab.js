/**
 * WORKSHOP TAB
 *
 * Workstation management interface showing:
 * - 6 workstation cards in 2x3 grid
 * - Current tier and benefits display
 * - Upgrade buttons with blueprint costs
 * - Engineering level requirements
 * - Blueprint inventory display
 */

const WorkshopTab = {
    /**
     * Initialize workshop tab
     */
    init() {
        console.log('[WorkshopTab] Initialized');
    },

    /**
     * Render the workshop tab content
     */
    render() {
        return `
            <div class="workshop-tab">
                ${this.renderBlueprintInventory()}
                <div class="workshop-title">
                    <h2>🏭 Workstation Overview</h2>
                    <p>Upgrade workstations to improve crafting efficiency</p>
                </div>
                ${this.renderWorkstationGrid()}
                ${this.renderUpgradeInfo()}
            </div>
        `;
    },

    /**
     * Render blueprint inventory bar
     */
    renderBlueprintInventory() {
        const blueprints = GameEngine.state.currencies?.blueprints || 0;

        return `
            <div class="blueprint-inventory">
                <div class="blueprint-item">
                    <span class="blueprint-icon">📘</span>
                    <span class="blueprint-name">Blueprints</span>
                    <span class="blueprint-count">${blueprints}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render workstation grid (2x3)
     */
    renderWorkstationGrid() {
        const skills = ['smithing', 'mechanics', 'electronics', 'textiles', 'chemistry', 'cooking'];

        let html = '<div class="workstation-grid">';

        for (const skill of skills) {
            html += this.renderWorkstationCard(skill);
        }

        html += '</div>';
        return html;
    },

    /**
     * Render a single workstation card
     */
    renderWorkstationCard(skill) {
        const skillState = GameEngine.state.skills?.[skill];
        const skillLevel = skillState?.level || 1;
        const workstationState = GameEngine.state.crafting?.workstations?.[skill] || { tier: 1 };
        const tier = workstationState.tier;
        const engineeringLevel = GameEngine.state.skills?.engineering?.level || 1;
        const skillColor = UnifiedCraftingUI.getSkillColor(skill);

        // Get workstation definition
        let workstation = null;
        if (typeof WorkstationRegistry !== 'undefined') {
            workstation = WorkstationRegistry.get(skill);
        }

        const workstationName = workstation?.name || `${UnifiedCraftingUI.capitalizeFirst(skill)} Workstation`;

        // Get current tier benefits
        let benefits = null;
        if (typeof WorkstationRegistry !== 'undefined') {
            benefits = WorkstationRegistry.getTierBenefits(skill, tier, engineeringLevel);
        }

        // Check upgrade availability
        const nextTier = tier + 1;
        const canUpgrade = nextTier <= 5;
        const requiredEngineering = nextTier * 10;
        const meetsEngineeringReq = engineeringLevel >= requiredEngineering;
        const blueprintCost = this.getUpgradeCost(tier);
        const hasBlueprints = (GameEngine.state.currencies?.blueprints || 0) >= blueprintCost;

        // Tier progress bar
        const tierProgress = (tier / 5) * 100;

        // Benefits list
        let benefitsHtml = '';
        if (benefits) {
            benefitsHtml = `
                <div class="workstation-benefits">
                    ${benefits.rarityBonus ? `<div class="benefit-row"><span>Rarity Bonus:</span><span class="benefit-value">+${benefits.rarityBonus.toFixed(1)}%</span></div>` : ''}
                    ${benefits.outputMultiplier > 1 ? `<div class="benefit-row"><span>Output Multi:</span><span class="benefit-value">x${benefits.outputMultiplier.toFixed(1)}</span></div>` : ''}
                    <div class="benefit-row"><span>Material Savings:</span><span class="benefit-value">${(benefits.materialSavingsChance * 100).toFixed(0)}%</span></div>
                    <div class="benefit-row"><span>Craft Speed:</span><span class="benefit-value">x${benefits.craftSpeedMultiplier.toFixed(1)}</span></div>
                    <div class="benefit-row"><span>Queue Slots:</span><span class="benefit-value">${benefits.queueSlots}</span></div>
                </div>
            `;
        }

        // Upgrade section
        let upgradeHtml = '';
        if (tier >= 5) {
            upgradeHtml = `
                <div class="workstation-upgrade maxed">
                    <span class="upgrade-text">✨ Maximum Tier Reached</span>
                </div>
            `;
        } else if (!meetsEngineeringReq) {
            upgradeHtml = `
                <div class="workstation-upgrade locked">
                    <div class="upgrade-requirement">
                        <span class="req-icon">🔒</span>
                        <span class="req-text">Requires Engineering Lv.${requiredEngineering}</span>
                    </div>
                    <div class="current-level">Current: Lv.${engineeringLevel}</div>
                </div>
            `;
        } else {
            upgradeHtml = `
                <div class="workstation-upgrade available">
                    <div class="upgrade-cost">
                        <span class="cost-icon">📘</span>
                        <span class="cost-amount">${blueprintCost} Blueprints</span>
                        ${hasBlueprints ? '<span class="cost-status has">✓</span>' : `<span class="cost-status missing">(Have: ${GameEngine.state.currencies?.blueprints || 0})</span>`}
                    </div>
                    <button class="upgrade-btn ${hasBlueprints ? '' : 'disabled'}"
                            onclick="WorkshopTab.upgradeWorkstation('${skill}')"
                            ${hasBlueprints ? '' : 'disabled'}>
                        ⬆️ Upgrade to Tier ${nextTier}
                    </button>
                </div>
            `;
        }

        return `
            <div class="workstation-card skill-${skill}" style="--skill-color: ${skillColor};">
                <div class="workstation-header">
                    <div class="workstation-icon">${UnifiedCraftingUI.getSkillIcon(skill)}</div>
                    <div class="workstation-info">
                        <div class="workstation-name">${workstationName}</div>
                        <div class="workstation-skill">${UnifiedCraftingUI.capitalizeFirst(skill)} Lv.${skillLevel}</div>
                    </div>
                </div>

                <div class="workstation-tier">
                    <div class="tier-label">Tier ${tier} / 5</div>
                    <div class="tier-progress-bar">
                        <div class="tier-progress-fill" style="width: ${tierProgress}%;"></div>
                    </div>
                </div>

                ${benefitsHtml}

                ${upgradeHtml}
            </div>
        `;
    },

    /**
     * Render upgrade info section
     */
    renderUpgradeInfo() {
        return `
            <div class="upgrade-info">
                <h3>📋 Upgrade Information</h3>
                <div class="upgrade-info-content">
                    <div class="info-item">
                        <span class="info-label">Engineering Gates:</span>
                        <span class="info-value">Tier 2 = Lv.20, Tier 3 = Lv.30, Tier 4 = Lv.40, Tier 5 = Lv.50</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Blueprint Sources:</span>
                        <span class="info-value">Combat loot, Mission rewards, Salvaging</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tier Benefits:</span>
                        <span class="info-value">Each tier: +7.5% rarity, +5% material savings, +10% speed, +1 queue slot (every 2 tiers)</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get blueprint cost for upgrading to next tier
     */
    getUpgradeCost(currentTier) {
        const costs = {
            1: 5,   // Tier 1 -> 2
            2: 15,  // Tier 2 -> 3
            3: 30,  // Tier 3 -> 4
            4: 50,  // Tier 4 -> 5
            5: 0    // Already max
        };
        return costs[currentTier] || 0;
    },

    /**
     * Upgrade a workstation
     */
    upgradeWorkstation(skill) {
        console.log(`[WorkshopTab] Upgrading workstation: ${skill}`);

        let result;
        if (typeof CraftingSystem !== 'undefined' && CraftingSystem.upgradeWorkstation) {
            result = CraftingSystem.upgradeWorkstation(skill);
        }

        if (result && result.success) {
            console.log(`[WorkshopTab] Upgrade successful! New tier: ${result.newTier}`);

            // Emit event for other systems
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('workstation-upgraded', { skill, tier: result.newTier });
            }

            // Re-render
            const content = document.getElementById('crafting-content');
            if (content) {
                content.innerHTML = this.render();
            }
        } else {
            console.warn(`[WorkshopTab] Upgrade failed:`, result?.reason || 'Unknown error');
        }
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.WorkshopTab = WorkshopTab;
}
