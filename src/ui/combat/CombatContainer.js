/**
 * COMBAT CONTAINER
 *
 * Active combat display with real-time HP, timers, and animations
 * Uses crafting-style UI patterns (cards, sections)
 */

const CombatContainer = {
    recentLoot: [],

    /**
     * Render combat container
     */
    render() {
        const player = GameEngine.state;
        const combat = player.combat;

        if (!combat || !combat.inCombat) {
            return `
                <div class="combat-container">
                    <div class="combat-empty-state">
                        <div class="empty-icon">⚔️</div>
                        <div class="empty-title">No Active Combat</div>
                        <div class="empty-hint">Select an enemy from the Enemies tab to start combat</div>
                    </div>
                </div>
            `;
        }

        const enemy = combat.currentEnemy;

        return `
            <div class="combat-container">
                <div class="combat-arena-header">
                    <div class="arena-title">
                        <span class="arena-icon">⚔️</span>
                        <span>Active Combat</span>
                    </div>
                    <button class="combat-flee-btn" onclick="CombatUI.flee()">
                        <span>🏃</span>
                        <span>Flee</span>
                    </button>
                </div>

                <div class="combat-arena">
                    ${this.renderPlayerPanel(player, combat)}

                    <div class="combat-arena-vs">
                        <span class="vs-icon">⚔️</span>
                        <span class="vs-text">VS</span>
                        <span class="vs-icon">⚔️</span>
                    </div>

                    ${this.renderEnemyPanel(enemy, combat)}
                </div>

                ${this.renderLootBox()}
            </div>
        `;
    },

    /**
     * Render player combat panel (card-based layout)
     */
    renderPlayerPanel(player, combat) {
        const hpPercent = (player.currentHP / player.maxHP) * 100;
        const threshold = typeof AutoConsumption !== 'undefined'
            ? AutoConsumption.calculateAutoEatThreshold(player)
            : Math.floor(player.maxHP * 0.3);
        const thresholdPercent = (threshold / player.maxHP) * 100;

        const playerInterval = typeof CombatTimers !== 'undefined'
            ? CombatTimers.calculateAttackInterval(player, player.equipment?.weapon?.attackInterval || 2000)
            : { interval: 2000 };
        const attackProgress = (combat.playerTimer?.elapsed || 0) / playerInterval.interval;

        return `
            <div class="combatant-card player-card">
                <div class="combatant-header">
                    <span class="combatant-icon">👤</span>
                    <span class="combatant-title">Player</span>
                </div>

                <div class="combatant-content">
                    <div class="health-section">
                        <div class="health-label">
                            <span class="health-icon">❤️</span>
                            <span class="health-values">${player.currentHP} / ${player.maxHP}</span>
                        </div>
                        <div class="health-bar-container">
                            <div class="health-bar player-hp" style="width: ${hpPercent}%"></div>
                            <div class="health-threshold" style="left: ${thresholdPercent}%" title="Auto-eat threshold"></div>
                        </div>
                        <div class="health-info">Auto-eat: ${threshold} HP</div>
                    </div>

                    <div class="attack-timer-section">
                        <div class="timer-label">
                            <span class="timer-icon">⚔️</span>
                            <span>Attack</span>
                            <span class="timer-countdown">${((playerInterval.interval / 1000) * (1 - attackProgress)).toFixed(1)}s</span>
                        </div>
                        <div class="timer-bar-container">
                            <div class="timer-bar player-attack" style="width: ${attackProgress * 100}%"></div>
                        </div>
                    </div>

                    <div class="consumables-row">
                        <div class="consumable-slot ${player.equipment?.food ? 'equipped' : 'empty'}">
                            <span class="slot-icon">🍖</span>
                            <span class="slot-name">${player.equipment?.food?.name || 'No Food'}</span>
                            <span class="slot-count">x${player.equipment?.food?.quantity || 0}</span>
                        </div>
                        <div class="consumable-slot ${player.equipment?.ammo ? 'equipped' : 'empty'}">
                            <span class="slot-icon">🎯</span>
                            <span class="slot-name">${player.equipment?.ammo?.name || 'No Ammo'}</span>
                            <span class="slot-count">x${player.equipment?.ammo?.quantity || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render enemy combat panel (card-based layout)
     */
    renderEnemyPanel(enemy, combat) {
        const hpPercent = (enemy.currentHP / enemy.maxHP) * 100;
        const enemyInterval = enemy.attackInterval || 2000;
        const attackProgress = (combat.enemyTimer?.elapsed || 0) / enemyInterval;

        const damageTypeIcon = typeof EnemySelectionPanel !== 'undefined'
            ? EnemySelectionPanel.getDamageTypeIcon(enemy.damageType || 'pierce')
            : '⚡';
        const armorTypeIcon = this.getArmorTypeIcon(enemy.armorType || 'plated');

        return `
            <div class="combatant-card enemy-card">
                <div class="combatant-header">
                    <span class="combatant-icon">${enemy.icon || '👾'}</span>
                    <span class="combatant-title">${enemy.name}</span>
                    <span class="combatant-level">Lv.${enemy.level}</span>
                </div>

                <div class="combatant-content">
                    <div class="health-section">
                        <div class="health-label">
                            <span class="health-icon">❤️</span>
                            <span class="health-values">${enemy.currentHP} / ${enemy.maxHP}</span>
                        </div>
                        <div class="health-bar-container">
                            <div class="health-bar enemy-hp" style="width: ${hpPercent}%"></div>
                        </div>
                    </div>

                    <div class="attack-timer-section">
                        <div class="timer-label">
                            <span class="timer-icon">⚔️</span>
                            <span>Attack</span>
                            <span class="timer-countdown">${(enemyInterval / 1000 * (1 - attackProgress)).toFixed(1)}s</span>
                        </div>
                        <div class="timer-bar-container">
                            <div class="timer-bar enemy-attack" style="width: ${attackProgress * 100}%"></div>
                        </div>
                    </div>

                    <div class="enemy-combat-stats">
                        <div class="combat-stat">
                            <span class="stat-icon">⚔️</span>
                            <span class="stat-value">${enemy.minDamage}-${enemy.maxDamage}</span>
                            <span class="stat-label">DMG</span>
                        </div>
                        <div class="combat-stat">
                            <span class="stat-icon">${damageTypeIcon}</span>
                            <span class="stat-value">${this.capitalizeFirst(enemy.damageType || 'pierce')}</span>
                        </div>
                        <div class="combat-stat">
                            <span class="stat-icon">${armorTypeIcon}</span>
                            <span class="stat-value">${this.capitalizeFirst(enemy.armorType || 'plated')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render loot box (card-based like craft queue)
     */
    renderLootBox() {
        return `
            <div class="combat-loot-card">
                <div class="loot-card-header">
                    <span class="loot-header-icon">🎁</span>
                    <span class="loot-header-title">Recent Drops</span>
                    <span class="loot-header-count">${this.recentLoot?.length || 0}</span>
                </div>
                <div class="loot-card-content">
                    ${!this.recentLoot || this.recentLoot.length === 0
                        ? '<div class="loot-empty">No drops yet...</div>'
                        : this.recentLoot.slice(-5).map(loot => `
                            <div class="loot-item rarity-${loot.rarity || 'common'}">
                                <span class="loot-icon">${loot.icon}</span>
                                <span class="loot-name">${loot.name}</span>
                                <span class="loot-quantity">+${loot.quantity || 1}</span>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    },

    /**
     * Update combat display (called each tick)
     */
    update() {
        const player = GameEngine.state;
        const combat = player.combat;

        if (!combat || !combat.inCombat) return;

        // Update HP bars
        this.updateHealthBar('player', player.currentHP, player.maxHP);
        this.updateHealthBar('enemy', combat.currentEnemy.currentHP, combat.currentEnemy.maxHP);

        // Update attack timers
        this.updateTimerBar('player', combat);
        this.updateTimerBar('enemy', combat);

        // Update consumables
        this.updateConsumables(player);
    },

    /**
     * Update health bar
     */
    updateHealthBar(target, currentHP, maxHP) {
        const card = document.querySelector(`.${target}-card`);
        if (!card) return;

        const healthBar = card.querySelector('.health-bar');
        const healthValues = card.querySelector('.health-values');

        if (healthBar) {
            const percent = (currentHP / maxHP) * 100;
            healthBar.style.width = `${percent}%`;
        }

        if (healthValues) {
            healthValues.textContent = `${currentHP} / ${maxHP}`;
        }
    },

    /**
     * Update timer bar
     */
    updateTimerBar(target, combat) {
        const player = GameEngine.state;
        const card = document.querySelector(`.${target}-card`);
        if (!card) return;

        let progress, interval;

        if (target === 'player') {
            const playerInterval = typeof CombatTimers !== 'undefined'
                ? CombatTimers.calculateAttackInterval(player, player.equipment?.weapon?.attackInterval || 2000)
                : { interval: 2000 };
            progress = (combat.playerTimer?.elapsed || 0) / playerInterval.interval;
            interval = playerInterval.interval;
        } else {
            const enemyInterval = combat.currentEnemy.attackInterval || 2000;
            progress = (combat.enemyTimer?.elapsed || 0) / enemyInterval;
            interval = enemyInterval;
        }

        const timerBar = card.querySelector('.timer-bar');
        const timerCountdown = card.querySelector('.timer-countdown');

        if (timerBar) timerBar.style.width = `${progress * 100}%`;
        if (timerCountdown) timerCountdown.textContent = `${(interval / 1000 * (1 - progress)).toFixed(1)}s`;
    },

    /**
     * Update consumables display
     */
    updateConsumables(player) {
        const consumableSlots = document.querySelectorAll('.consumables-row .consumable-slot');
        if (consumableSlots.length < 2) return;

        const foodSlot = consumableSlots[0];
        const ammoSlot = consumableSlots[1];

        if (foodSlot) {
            const countEl = foodSlot.querySelector('.slot-count');
            if (countEl) countEl.textContent = `x${player.equipment?.food?.quantity || 0}`;
        }
        if (ammoSlot) {
            const countEl = ammoSlot.querySelector('.slot-count');
            if (countEl) countEl.textContent = `x${player.equipment?.ammo?.quantity || 0}`;
        }
    },

    /**
     * Add loot drop
     */
    addLoot(lootData) {
        this.recentLoot.push(lootData);

        // Keep only last 10 drops
        if (this.recentLoot.length > 10) {
            this.recentLoot.shift();
        }

        // Re-render loot box
        const lootCard = document.querySelector('.combat-loot-card');
        if (lootCard) {
            lootCard.outerHTML = this.renderLootBox();
        }
    },

    /**
     * Get armor type icon
     */
    getArmorTypeIcon(type) {
        const icons = {
            insulated: '🛡️',
            plated: '🛡️',
            airborne: '💨',
            droid: '🤖',
            biological: '🧬'
        };
        return icons[type] || '🛡️';
    },

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatContainer;
}
