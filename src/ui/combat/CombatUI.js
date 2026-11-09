/**
 * COMBAT UI - Main Coordinator
 *
 * Manages the combat tab with 2-tab system:
 * - Enemies: Enemy selection and incursion browser
 * - Combat: Active combat display
 *
 * NOTE: Loadout tab removed (2025-12-06) - use Equipment Tab instead
 */

const CombatUI = {
    currentTab: 'enemies', // Default to enemies tab
    currentModal: null,

    /**
     * Initialize combat UI
     */
    init() {
        console.log("⚔️ Combat UI Initialized");

        // Subscribe to EventBus events
        if (typeof EventBus !== 'undefined') {
            EventBus.on('combat-started', this.onCombatStarted.bind(this));
            EventBus.on('combat-ended', this.onCombatEnded.bind(this));
            EventBus.on('player-damaged', this.onPlayerDamaged.bind(this));
            EventBus.on('enemy-damaged', this.onEnemyDamaged.bind(this));
            EventBus.on('player-healed', this.onPlayerHealed.bind(this));
            EventBus.on('attack-missed', this.onAttackMissed.bind(this));
            EventBus.on('loot-dropped', this.onLootDropped.bind(this));
        }

        // Clean up any existing modals on init
        const existingModal = document.getElementById('combat-modal-container');
        if (existingModal) {
            existingModal.remove();
        }

        // Add keyboard listener for closing modals with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    },

    /**
     * Render combat UI
     */
    render() {
        const combatArea = document.getElementById('combatArea');
        if (!combatArea) return;

        const player = GameEngine.state;
        const inCombat = player.combat?.inCombat || false;
        const isRespawning = player.combat?.respawn?.active || false;
        const inCombatOrRespawning = inCombat || isRespawning;

        // NOTE: No auto-switching tabs - let user stay on current tab
        // Combat runs in background if user is on another tab

        combatArea.innerHTML = `
            <div class="combat-ui-wrapper">
                ${this.renderTabs(inCombatOrRespawning)}
                <div class="combat-content-area">
                    ${this.renderTabContent(player, inCombatOrRespawning)}
                </div>
            </div>
        `;
    },

    /**
     * Render tab navigation (2 tabs only: Enemies + Combat)
     */
    renderTabs(inCombat) {
        const tabs = [
            { id: 'enemies', icon: '👾', label: 'Enemies', disabled: false },
            { id: 'combat', icon: '⚔️', label: 'Combat', disabled: !inCombat, badge: inCombat }
            // NOTE: Loadout tab removed - use Equipment Tab instead
        ];

        return `
            <div class="combat-tab-bar">
                ${tabs.map(tab => `
                    <div class="combat-tab ${this.currentTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}"
                         onclick="${!tab.disabled ? `CombatUI.switchTab('${tab.id}')` : ''}"
                         data-tab="${tab.id}">
                        <span class="tab-icon">${tab.icon}</span>
                        <span class="tab-label">${tab.label}</span>
                        ${tab.badge && this.currentTab !== tab.id ? '<span class="tab-badge pulse">!</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render tab content (Enemies or Combat only)
     */
    renderTabContent(player, inCombat) {
        let content = '';

        switch (this.currentTab) {
            case 'enemies':
                content = EnemySelectionPanel.render();
                break;
            case 'combat':
                if (inCombat) {
                    content = CombatContainer.render();
                } else {
                    content = `
                        <div class="no-combat-message">
                            <div class="no-combat-icon">⚔️</div>
                            <div class="no-combat-text">No active combat</div>
                            <div class="no-combat-hint">Select an enemy from the Enemies tab to start combat</div>
                        </div>
                    `;
                }
                break;
            // NOTE: 'loadout' case removed - use Equipment Tab instead
            default:
                // Fallback to enemies if somehow on invalid tab
                this.currentTab = 'enemies';
                content = EnemySelectionPanel.render();
                break;
        }

        return `<div class="combat-tab-content">${content}</div>`;
    },

    /**
     * Switch tabs
     */
    switchTab(tabName) {
        console.log(`🎯 CombatUI.switchTab called with: ${tabName}`);
        const player = GameEngine.state;
        const inCombat = player.combat?.inCombat || false;
        const isRespawning = player.combat?.respawn?.active || false;
        const inCombatOrRespawning = inCombat || isRespawning;

        // Prevent switching to combat tab if not in combat and not respawning
        if (tabName === 'combat' && !inCombatOrRespawning) {
            console.log('⚠️ Cannot switch to combat tab - not in combat or respawning');
            return;
        }

        console.log(`✅ Switching to tab: ${tabName}`);
        this.currentTab = tabName;
        this.render();
    },

    /**
     * Update combat UI (called each tick)
     */
    updateCombat() {
        const player = GameEngine.state;
        const inCombat = player.combat?.inCombat || false;
        const isRespawning = player.combat?.respawn?.active || false;

        // Only update if combat tab is active and in combat or respawning
        if (this.currentTab === 'combat' && (inCombat || isRespawning)) {
            CombatContainer.update();
        }

        // Update tab badges
        this.updateTabBadges(player);
    },

    /**
     * Update tab badges
     */
    updateTabBadges(player) {
        const inCombat = player.combat?.inCombat || false;
        const isRespawning = player.combat?.respawn?.active || false;
        const inCombatOrRespawning = inCombat || isRespawning;
        const combatTab = document.querySelector('.combat-tab[data-tab="combat"]');

        if (combatTab) {
            const badge = combatTab.querySelector('.tab-badge');
            if (inCombatOrRespawning && this.currentTab !== 'combat') {
                if (!badge) {
                    const newBadge = document.createElement('span');
                    newBadge.className = 'tab-badge pulse';
                    newBadge.textContent = '!';
                    combatTab.appendChild(newBadge);
                }
            } else if (badge) {
                badge.remove();
            }
        }
    },

    /**
     * Open enemy modal
     */
    openEnemyModal(enemyId) {
        const player = GameEngine.state;

        // Get enemy definition
        let enemy = null;
        if (typeof EnemyRegistry !== 'undefined' && EnemyRegistry.get) {
            enemy = EnemyRegistry.get(enemyId);
        } else if (typeof EnemyRegistry !== 'undefined') {
            // Fallback: try direct access
            const allEnemies = EnemyRegistry.getAllActive();
            enemy = allEnemies[enemyId];
        } else {
            enemy = GameEngine.definitions.enemies[enemyId];
        }

        if (!enemy) {
            console.error(`Enemy not found: ${enemyId}`);
            return;
        }

        // Render modal
        const modalHTML = EnemyModal.render(enemy, player);
        const modalContainer = document.createElement('div');
        modalContainer.id = 'combat-modal-container';
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        this.currentModal = 'enemy';
    },

    /**
     * Open incursion modal
     */
    openIncursionModal(incursionId) {
        // TODO: Implement incursion modal
        console.log(`Open incursion modal: ${incursionId}`);
    },

    /**
     * Close modal
     */
    closeModal() {
        const modalContainer = document.getElementById('combat-modal-container');
        if (modalContainer) {
            modalContainer.remove();
        }
        this.currentModal = null;
    },

    /**
     * Start combat with enemy
     */
    startCombat(enemyId) {
        const player = GameEngine.state;

        // Get enemy definition
        let enemyDef = null;
        if (typeof EnemyRegistry !== 'undefined' && EnemyRegistry.get) {
            enemyDef = EnemyRegistry.get(enemyId);
        } else if (typeof EnemyRegistry !== 'undefined') {
            // Fallback: try direct access
            const allEnemies = EnemyRegistry.getAllActive();
            enemyDef = allEnemies[enemyId];
        } else {
            enemyDef = GameEngine.definitions.enemies[enemyId];
        }

        if (!enemyDef) {
            console.error(`Enemy not found: ${enemyId}`);
            return;
        }

        // Close modal
        this.closeModal();

        // Calculate damage range from baseDamage or use legacy format
        let minDamage, maxDamage;
        if (enemyDef.baseDamage && enemyDef.minDamageRatio && enemyDef.maxDamageRatio) {
            // New format: baseDamage * ratios
            minDamage = Math.floor(enemyDef.baseDamage * enemyDef.minDamageRatio);
            maxDamage = Math.floor(enemyDef.baseDamage * enemyDef.maxDamageRatio);
        } else {
            // Legacy format: direct minDamage/maxDamage
            minDamage = enemyDef.minDamage || 1;
            maxDamage = enemyDef.maxDamage || 10;
        }

        // Create enemy instance
        const enemy = {
            enemyId: enemyId,
            name: enemyDef.name,
            icon: enemyDef.icon,
            level: enemyDef.level,
            currentHP: enemyDef.maxHP || enemyDef.health || 100,
            maxHP: enemyDef.maxHP || enemyDef.health || 100,
            minDamage: minDamage,
            maxDamage: maxDamage,
            accuracy: enemyDef.accuracy || 50,
            evasion: enemyDef.evasion || 0,
            critRating: enemyDef.critRating || enemyDef.stealth || 5,
            critMultiplier: enemyDef.critMultiplier || 1.5,
            damageType: enemyDef.damageType || 'pierce',
            armorType: enemyDef.armorType || 'plated',
            armorRating: enemyDef.armorRating || 0,
            damageReduction: enemyDef.damageReduction || 0,
            attackInterval: enemyDef.attackInterval || 2000,
            loot: enemyDef.loot || enemyDef.lootTable || []
        };

        // Start combat via combat system
        if (typeof CombatSystem !== 'undefined' && CombatSystem.startCombat) {
            CombatSystem.startCombat(player, enemy);
        } else {
            console.error('CombatSystem not available');
            return;
        }

        // Switch to combat tab
        this.switchTab('combat');

        // Clear recent loot
        CombatContainer.recentLoot = [];
    },

    /**
     * Flee from combat
     */
    flee() {
        const player = GameEngine.state;

        if (!player.combat?.inCombat) {
            return;
        }

        // End combat via combat system
        if (typeof CombatSystem !== 'undefined' && CombatSystem.endCombat) {
            CombatSystem.endCombat(player, 'fled');
        }

        // Switch to enemies tab
        this.switchTab('enemies');
    },

    /**
     * Show loot table for enemy
     */
    showLootTable(enemyId) {
        // TODO: Implement loot table modal
        console.log(`Show loot table for: ${enemyId}`);
    },

    // ===========================
    // EVENT BUS HANDLERS
    // ===========================

    /**
     * Handle combat started event
     * NOTE: Does NOT auto-switch to combat tab - combat runs in background
     */
    onCombatStarted(data) {
        console.log('Combat started:', data);
        // Only re-render if on combat tab, otherwise let badge notify user
        if (this.currentTab === 'combat') {
            this.render();
        }
    },

    /**
     * Handle combat ended event
     */
    onCombatEnded(data) {
        console.log('Combat ended:', data);

        if (data.result === 'victory') {
            // Re-render to show respawn state (no victory modal - too distracting)
            this.render();
        } else if (data.result === 'defeat') {
            this.showCombatResult('DEFEAT!', data);
            // Only switch back to enemies on defeat (player died)
            setTimeout(() => {
                this.switchTab('enemies');
            }, 2000);
        }
    },

    /**
     * Handle player damaged event
     */
    onPlayerDamaged(data) {
        const { damage, isCrit } = data;

        // Show damage animation
        if (typeof CombatAnimations !== 'undefined') {
            if (isCrit) {
                CombatAnimations.showCriticalHitEffect('player');
                CombatAnimations.showDamageNumber('player', damage, 'crit');
            } else {
                CombatAnimations.showDamageNumber('player', damage, 'damage');
            }
        }
    },

    /**
     * Handle enemy damaged event
     */
    onEnemyDamaged(data) {
        const { damage, isCrit } = data;

        // Show damage animation
        if (typeof CombatAnimations !== 'undefined') {
            if (isCrit) {
                CombatAnimations.showCriticalHitEffect('enemy');
                CombatAnimations.showDamageNumber('enemy', damage, 'crit');
            } else {
                CombatAnimations.showDamageNumber('enemy', damage, 'damage');
            }
        }
    },

    /**
     * Handle player healed event
     */
    onPlayerHealed(data) {
        const { amount } = data;

        // Show heal animation
        if (typeof CombatAnimations !== 'undefined') {
            CombatAnimations.showDamageNumber('player', amount, 'heal');
        }
    },

    /**
     * Handle attack missed event
     */
    onAttackMissed(data) {
        const { target } = data;

        // Show miss animation
        if (typeof CombatAnimations !== 'undefined') {
            CombatAnimations.showDamageNumber(target, 0, 'miss');
        }
    },

    /**
     * Handle loot dropped event
     */
    onLootDropped(data) {
        const { itemId, quantity, rarity, name, icon, isCurrency, isItem } = data;

        // Build loot data - use provided values or look up from registry
        let lootData;

        if (isCurrency) {
            // Currency drop (gold, fragments) - use provided data directly
            lootData = {
                itemId: itemId,
                name: name || itemId,
                icon: icon || '💰',
                quantity: quantity || 1,
                rarity: rarity || 'currency',
                isCurrency: true
            };
        } else {
            // Item drop - may need to look up from registry
            const itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null;

            lootData = {
                itemId: itemId,
                name: name || itemDef?.name || itemId,
                icon: icon || itemDef?.icon || '📦',
                quantity: quantity || 1,
                rarity: rarity || itemDef?.rarity || 'common',
                isItem: true
            };
        }

        CombatContainer.addLoot(lootData);
    },

    /**
     * Show combat result (victory/defeat)
     */
    showCombatResult(title, data) {
        const resultOverlay = document.createElement('div');
        resultOverlay.className = 'combat-result-overlay';
        resultOverlay.innerHTML = `
            <div class="combat-result-modal">
                <div class="combat-result-title">${title}</div>
                <div class="combat-result-stats">
                    <div class="result-stat">
                        <span class="result-label">Damage Dealt:</span>
                        <span class="result-value">${data.session?.damageDealt || 0}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-label">Damage Taken:</span>
                        <span class="result-value">${data.session?.damageTaken || 0}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-label">Hits:</span>
                        <span class="result-value">${data.session?.hits || 0}</span>
                    </div>
                    <div class="result-stat">
                        <span class="result-label">Crits:</span>
                        <span class="result-value">${data.session?.crits || 0}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(resultOverlay);

        // Remove after 2 seconds
        setTimeout(() => {
            resultOverlay.remove();
        }, 2000);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatUI;
}
