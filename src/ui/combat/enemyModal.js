/**
 * ENEMY MODAL
 *
 * Enemy info modal with stats, type matchup, and attack button
 */

const EnemyModal = {
    /**
     * Render enemy modal
     */
    render(enemy, player) {
        const typeMatchup = this.calculateTypeMatchup(player, enemy);

        return `
            <div class="modal-overlay" onclick="CombatUI.closeModal()">
                <div class="enemy-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div class="enemy-modal-icon">${enemy.icon || '👾'}</div>
                        <div class="enemy-modal-title">${enemy.name}</div>
                        <div class="enemy-modal-level">Level ${enemy.level}</div>
                        <button class="modal-close" onclick="CombatUI.closeModal()">✕</button>
                    </div>

                    <div class="modal-body">
                        <div class="stat-section">
                            <div class="stat-section-title">COMBAT STATS</div>
                            <div class="stat-row">
                                <span class="stat-label">❤️ Health:</span>
                                <span class="stat-value">${enemy.maxHP || enemy.health || 100} HP</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">⚔️ Damage:</span>
                                <span class="stat-value">${this.getDamageRange(enemy)}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">🎯 Accuracy:</span>
                                <span class="stat-value">${enemy.accuracy || 50}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">🗡️ Crit Rate:</span>
                                <span class="stat-value">${enemy.critRating || enemy.stealth || 5}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">⏱️ Attack Interval:</span>
                                <span class="stat-value">${((enemy.attackInterval || 2000) / 1000).toFixed(1)}s</span>
                            </div>
                        </div>

                        ${this.renderTypingSection(enemy)}

                        <div class="stat-section">
                            <div class="stat-section-title">DEFENSE</div>
                            <div class="stat-row">
                                <span class="stat-label">🛡️ Armor Rating:</span>
                                <span class="stat-value">${enemy.armorRating || 0}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">🔷 Damage Reduction:</span>
                                <span class="stat-value">${((enemy.damageReduction || 0) * 100).toFixed(0)}%</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">💨 Evasion:</span>
                                <span class="stat-value">${enemy.evasion || 0}</span>
                            </div>
                        </div>

                        <div class="stat-section matchup-section">
                            <div class="stat-section-title">TYPE MATCHUP (vs your loadout)</div>
                            <div class="stat-row ${typeMatchup.playerAdvantage}">
                                <span class="stat-label">Your damage vs enemy:</span>
                                <span class="stat-value">${typeMatchup.playerMultiplier.toFixed(2)}× (${typeMatchup.playerLabel})</span>
                            </div>
                            <div class="stat-row ${typeMatchup.enemyAdvantage}">
                                <span class="stat-label">Enemy damage vs you:</span>
                                <span class="stat-value">${typeMatchup.enemyMultiplier.toFixed(2)}× (${typeMatchup.enemyLabel})</span>
                            </div>
                        </div>

                        ${this.renderLootSection(enemy)}
                    </div>

                    <div class="modal-footer">
                        <button class="modal-btn secondary" onclick="CombatUI.showLootTable('${enemy.id}')">
                            📜 View Loot Table
                        </button>
                        <button class="modal-btn primary" onclick="CombatUI.startCombat('${enemy.id}')">
                            ⚔️ ATTACK
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get damage range display
     */
    getDamageRange(enemy) {
        // If baseDamage and ratios are defined (new format)
        if (enemy.baseDamage && enemy.minDamageRatio && enemy.maxDamageRatio) {
            const minDmg = Math.floor(enemy.baseDamage * enemy.minDamageRatio);
            const maxDmg = Math.floor(enemy.baseDamage * enemy.maxDamageRatio);
            return `${minDmg}-${maxDmg}`;
        }
        // Fallback to legacy format
        return `${enemy.minDamage || 1}-${enemy.maxDamage || 10}`;
    },

    /**
     * Render typing section (damage and armor types)
     */
    renderTypingSection(enemy) {
        const damageTypes = this.getTypingDisplay(enemy.damageType, enemy.damageRatings);
        const armorTypes = this.getTypingDisplay(enemy.armorType, enemy.armorRatings);

        return `
            <div class="stat-section typing-section">
                <div class="stat-section-title">TYPING</div>
                <div class="stat-row">
                    <span class="stat-label">⚔️ Damage Type:</span>
                    <span class="stat-value">${damageTypes}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">🛡️ Armor Type:</span>
                    <span class="stat-value">${armorTypes}</span>
                </div>
            </div>
        `;
    },

    /**
     * Get typing display (handles both single type and multi-type)
     */
    getTypingDisplay(singleType, ratingsObject) {
        // If ratings object exists, show all types with percentages
        if (ratingsObject && typeof ratingsObject === 'object') {
            const types = Object.entries(ratingsObject)
                .filter(([_, value]) => value > 0)
                .map(([type, value]) => `${this.capitalizeFirst(type)} ${value}%`)
                .join(', ');
            return types || this.capitalizeFirst(singleType || 'unknown');
        }
        // Otherwise show single type
        return this.capitalizeFirst(singleType || 'unknown');
    },

    /**
     * Render loot section
     */
    renderLootSection(enemy) {
        const loot = enemy.loot || [];

        if (!loot || loot.length === 0) {
            return `
                <div class="stat-section loot-section">
                    <div class="stat-section-title">LOOT TABLE</div>
                    <div class="no-loot">No loot drops</div>
                </div>
            `;
        }

        const lootEntries = loot.map(drop => {
            const item = this.getItemDef(drop.itemId);
            const itemName = item?.name || drop.itemId;
            const itemIcon = item?.icon || '📦';
            const chance = (drop.chance * 100).toFixed(1);
            const quantity = this.getQuantityDisplay(drop.quantity);

            return `
                <div class="loot-entry">
                    <span class="loot-icon">${itemIcon}</span>
                    <span class="loot-name">${itemName}</span>
                    <span class="loot-quantity">${quantity}</span>
                    <span class="loot-chance">${chance}%</span>
                </div>
            `;
        }).join('');

        return `
            <div class="stat-section loot-section">
                <div class="stat-section-title">LOOT TABLE</div>
                <div class="loot-list">
                    ${lootEntries}
                </div>
            </div>
        `;
    },

    /**
     * Get quantity display
     */
    getQuantityDisplay(quantity) {
        if (typeof quantity === 'object' && quantity.min && quantity.max) {
            return `×${quantity.min}-${quantity.max}`;
        }
        return `×${quantity || 1}`;
    },

    /**
     * Get item definition
     */
    getItemDef(itemId) {
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.get) {
            return ItemRegistry.get(itemId);
        }
        return GameEngine.definitions?.items?.[itemId] || null;
    },

    /**
     * Calculate type matchup between player and enemy
     */
    calculateTypeMatchup(player, enemy) {
        const playerDamageRatings = player.compiledStats?.damage?.ratings || { pierce: 100 };
        const enemyArmorRatings = enemy.armorRatings || { [enemy.armorType || 'plated']: 100 };
        const enemyDamageRatings = enemy.damageRatings || { [enemy.damageType || 'pierce']: 100 };
        const playerArmorRatings = player.compiledStats?.defense?.ratings || { plated: 100 };

        // Calculate player attacking enemy
        const playerTypeEffect = TypeEffectiveness.calculate(playerDamageRatings, enemyArmorRatings);
        const playerMult = playerTypeEffect.multiplier;

        // Calculate enemy attacking player
        const enemyTypeEffect = TypeEffectiveness.calculate(enemyDamageRatings, playerArmorRatings);
        const enemyMult = enemyTypeEffect.multiplier;

        return {
            playerMultiplier: playerMult,
            playerLabel: this.getEffectivenessLabel(playerMult),
            playerAdvantage: playerMult >= 1.05 ? 'advantage' : playerMult <= 0.95 ? 'disadvantage' : '',
            enemyMultiplier: enemyMult,
            enemyLabel: this.getEffectivenessLabel(enemyMult),
            enemyAdvantage: enemyMult >= 1.05 ? 'advantage' : enemyMult <= 0.95 ? 'disadvantage' : ''
        };
    },

    /**
     * Get effectiveness label
     */
    getEffectivenessLabel(multiplier) {
        if (multiplier >= 1.20) return 'Super Effective';
        if (multiplier >= 1.05) return 'Effective';
        if (multiplier <= 0.80) return 'Not Very Effective';
        if (multiplier <= 0.95) return 'Resisted';
        return 'Neutral';
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
    module.exports = EnemyModal;
}
