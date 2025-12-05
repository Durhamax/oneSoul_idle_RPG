/**
 * UNIFIED CRAFTING UI - Main Coordinator
 *
 * Manages the crafting tab with 3-tab system:
 * - Recipes: Recipe browsing and crafting by skill
 * - Workshop: Workstation management and upgrades
 * - Engineering: Advanced features (perfection, assembly, salvage)
 *
 * Follows Combat UI pattern for consistency.
 */

const UnifiedCraftingUI = {
    currentTab: 'recipes', // 'recipes' | 'workshop' | 'engineering'
    selectedSkill: 'smithing', // Currently selected crafting skill
    lastState: null,

    /**
     * Initialize the unified crafting UI
     */
    init() {
        console.log('[UnifiedCraftingUI] Initializing...');

        // Initialize sub-components
        if (typeof RecipesTab !== 'undefined') RecipesTab.init();
        if (typeof WorkshopTab !== 'undefined') WorkshopTab.init();
        if (typeof EngineeringTab !== 'undefined') EngineeringTab.init();

        // Subscribe to relevant events
        if (typeof EventBus !== 'undefined') {
            EventBus.on('crafting-complete', this.onCraftCompleted.bind(this));
            EventBus.on('crafting-started', this.onCraftStarted.bind(this));
            EventBus.on('workstation-upgraded', this.onWorkstationUpgraded.bind(this));
        }
    },

    /**
     * Main render function - called when switching to crafting view
     */
    render() {
        const container = document.getElementById('view-crafting');
        if (!container) {
            console.error('[UnifiedCraftingUI] Container not found: view-crafting');
            return;
        }

        container.innerHTML = `
            <div class="crafting-ui-container">
                ${this.renderTabs()}
                <div class="crafting-main-layout">
                    <div id="crafting-content" class="crafting-content">
                        <!-- Tab content renders here -->
                    </div>
                    ${CraftQueue.render()}
                </div>
            </div>
        `;

        this.renderCurrentTab();
    },

    /**
     * Render tab navigation
     */
    renderTabs() {
        const engineeringLevel = GameEngine.state.skills?.engineering?.level || 1;

        return `
            <div class="crafting-tabs">
                <button class="crafting-tab ${this.currentTab === 'recipes' ? 'active' : ''}"
                        onclick="UnifiedCraftingUI.switchTab('recipes')">
                    <span class="tab-icon">📜</span>
                    <span class="tab-label">RECIPES</span>
                </button>
                <button class="crafting-tab ${this.currentTab === 'workshop' ? 'active' : ''}"
                        onclick="UnifiedCraftingUI.switchTab('workshop')">
                    <span class="tab-icon">🏭</span>
                    <span class="tab-label">WORKSHOP</span>
                </button>
                <button class="crafting-tab ${this.currentTab === 'engineering' ? 'active' : ''}"
                        onclick="UnifiedCraftingUI.switchTab('engineering')">
                    <span class="tab-icon">⚙️</span>
                    <span class="tab-label">ENGINEERING</span>
                    <span class="tab-level">Lv.${engineeringLevel}</span>
                </button>
            </div>
        `;
    },

    /**
     * Switch to a different tab
     */
    switchTab(tab) {
        console.log(`[UnifiedCraftingUI] Switching to tab: ${tab}`);
        this.currentTab = tab;
        this.renderCurrentTab();

        // Update tab highlighting
        document.querySelectorAll('.crafting-tab').forEach(tabEl => {
            tabEl.classList.remove('active');
        });
        const activeTab = document.querySelector(`.crafting-tab[onclick*="${tab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    },

    /**
     * Render content for current tab
     */
    renderCurrentTab() {
        const content = document.getElementById('crafting-content');
        if (!content) return;

        switch (this.currentTab) {
            case 'recipes':
                content.innerHTML = RecipesTab.render(this.selectedSkill);
                break;
            case 'workshop':
                content.innerHTML = WorkshopTab.render();
                break;
            case 'engineering':
                content.innerHTML = EngineeringTab.render();
                break;
            default:
                content.innerHTML = '<div class="error-message">Unknown tab</div>';
        }
    },

    /**
     * Select a crafting skill (for Recipes tab)
     */
    selectSkill(skillId) {
        console.log(`[UnifiedCraftingUI] Selecting skill: ${skillId}`);
        this.selectedSkill = skillId;

        if (this.currentTab === 'recipes') {
            this.renderCurrentTab();
        }

        // Update skill pills
        document.querySelectorAll('.skill-pill').forEach(pill => {
            pill.classList.remove('active');
        });
        const activePill = document.querySelector(`.skill-pill[data-skill="${skillId}"]`);
        if (activePill) {
            activePill.classList.add('active');
        }
    },

    /**
     * Open crafting UI to a specific skill
     * Called from Skills tab
     */
    openToSkill(skillId) {
        console.log(`[UnifiedCraftingUI] Opening to skill: ${skillId}`);
        this.selectedSkill = skillId;
        this.currentTab = 'recipes';

        // Switch view to crafting
        if (typeof switchView === 'function') {
            switchView('crafting');
        }
    },

    /**
     * Update the UI (called from game loop)
     */
    update() {
        // Only update queue sidebar (progress bars change frequently)
        CraftQueue.update();
    },

    /**
     * Force full re-render
     */
    refresh() {
        this.render();
    },

    // ===========================
    // EVENT HANDLERS
    // ===========================

    onCraftCompleted(data) {
        console.log('[UnifiedCraftingUI] Craft completed:', data);
        const { outputs, recipe, skill } = data;

        // Show XP drop notification
        if (recipe) {
            const xp = recipe.experienceGain || recipe.expReward || 10;
            this.showXPDrop(skill, xp);
        }

        // Show item added notifications
        if (outputs && outputs.length > 0) {
            this.showItemNotifications(outputs);
        }

        // Refresh current tab to show updated state
        this.renderCurrentTab();
        CraftQueue.update();
    },

    onCraftStarted(data) {
        console.log('[UnifiedCraftingUI] Craft started:', data);
        CraftQueue.update();
    },

    onWorkstationUpgraded(data) {
        console.log('[UnifiedCraftingUI] Workstation upgraded:', data);
        if (this.currentTab === 'workshop') {
            this.renderCurrentTab();
        }
    },

    // ===========================
    // UTILITY METHODS
    // ===========================

    /**
     * Get skill icon emoji
     */
    getSkillIcon(skillId) {
        const icons = {
            smithing: '🔨',
            mechanics: '⚙️',
            electronics: '⚡',
            tailoring: '🧵',
            chemistry: '⚗️',
            cooking: '🍳',
            engineering: '🔬'
        };
        return icons[skillId] || '📦';
    },

    /**
     * Get skill color
     */
    getSkillColor(skillId) {
        const colors = {
            smithing: '#8B4513',
            mechanics: '#708090',
            electronics: '#00CED1',
            tailoring: '#8B008B',
            chemistry: '#32CD32',
            cooking: '#FF6347'
        };
        return colors[skillId] || '#888';
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Show XP drop notification
     */
    showXPDrop(skill, xp) {
        const container = document.getElementById('crafting-content');
        if (!container) return;

        const xpDrop = document.createElement('div');
        xpDrop.className = 'crafting-xp-drop';
        xpDrop.innerHTML = `+${xp} ${this.capitalizeFirst(skill)} XP`;
        xpDrop.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.4em;
            font-weight: bold;
            color: #4caf50;
            text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            pointer-events: none;
            z-index: 1000;
            animation: craftXpFloat 1.5s ease-out forwards;
        `;

        container.style.position = 'relative';
        container.appendChild(xpDrop);

        // Remove after animation
        setTimeout(() => xpDrop.remove(), 1500);
    },

    /**
     * Show item added notifications
     */
    showItemNotifications(outputs) {
        const container = document.getElementById('crafting-content');
        if (!container) return;

        outputs.forEach((output, index) => {
            const item = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(output.itemId) : null;
            const itemName = item?.name || output.itemId;
            const quantity = output.quantity || 1;

            const notification = document.createElement('div');
            notification.className = 'crafting-item-notification';
            notification.innerHTML = `
                <span class="item-icon">${item?.icon || '📦'}</span>
                <span class="item-text">+${quantity} ${itemName}</span>
            `;
            notification.style.cssText = `
                position: absolute;
                top: calc(40% + ${index * 30}px);
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
                pointer-events: none;
                z-index: 999;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                animation: craftItemSlide 2s ease-out forwards;
            `;

            container.style.position = 'relative';
            container.appendChild(notification);

            // Remove after animation
            setTimeout(() => notification.remove(), 2000);
        });
    }
};

// Global function for legacy compatibility
function openCraftingForSkill(skillId) {
    UnifiedCraftingUI.openToSkill(skillId);
}

// Initialize on load
if (typeof window !== 'undefined') {
    window.UnifiedCraftingUI = UnifiedCraftingUI;
}
