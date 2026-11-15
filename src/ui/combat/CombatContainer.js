/**
 * COMBAT CONTAINER
 *
 * Active combat display with real-time HP, timers, and animations
 * Layout: Player First → Enemy → Drops
 * Responsive: Side-by-side on desktop, stacked on mobile
 */

const CombatContainer = {
    recentLoot: [],

    /**
     * Render combat container
     */
    render() {
        const player = GameEngine.state;
        const combat = player.combat;
        const respawn = GameEngine.state?.combat?.respawn;

        // Check if in respawn phase
        if (respawn?.active) {
            return this.renderRespawnState(respawn);
        }

        if (!combat || !combat.inCombat) {
            return `
                <div class="combat-container">
                    <div class="combat-idle">
                        <div class="idle-empty">
                            <span class="idle-empty-icon">⚔️</span>
                            <span class="idle-empty-text">No Active Combat</span>
                            <span class="idle-empty-hint">Select an enemy from the Enemies tab</span>
                        </div>
                    </div>
                </div>
            `;
        }

        const enemy = combat.currentEnemy;
        const autoCombat = GameEngine?.state?.combat?.autoCombat ?? true;

        return `
            <div class="combat-active combat-active--hero">
                <!-- Header (title removed; controls only) -->
                <div class="combat-header combat-header--controls-only">
                    <div class="combat-header-actions">
                        <label class="auto-toggle">
                            <input type="checkbox"
                                   ${autoCombat ? 'checked' : ''}
                                   onchange="CombatContainer.toggleAutoCombat(this.checked)">
                            <span>Auto</span>
                        </label>
                        <button class="btn-flee" onclick="CombatUI.flee()">🏃 Flee</button>
                    </div>
                </div>

                <!-- Enemy-hero stage: enemy (hero) on top, player HUD below, both
                     sized to sit above the fold; the loadout follows so it peeks
                     just out of view and is scrolled/pulled up for gear swaps. -->
                <div class="combat-stage">
                    ${this.renderEnemyCard(enemy, combat)}
                    ${this.renderPlayerCard(player, combat)}
                </div>

                <!-- Loadout (below the fold) -->
                ${(typeof OverviewUI !== 'undefined' && OverviewUI.renderLoadoutPanel) ? OverviewUI.renderLoadoutPanel() : ''}

                <!-- Drops Section -->
                ${this.renderDropsSection()}
            </div>
        `;
    },

    /**
     * Render player card (always first)
     */
    renderPlayerCard(player, combat) {
        const hpPercent = Math.max(0, (player.currentHP / player.maxHP) * 100);
        const threshold = typeof AutoConsumption !== 'undefined'
            ? AutoConsumption.calculateAutoEatThreshold(player)
            : Math.round(player.maxHP * 0.15); // matches AutoConsumption BASE_AUTO_EAT_THRESHOLD_PCT

        // Get attack interval from compiled weapon
        const baseInterval = combat.compiledWeapon?.attackInterval || 2000;
        const playerInterval = typeof CombatTimers !== 'undefined'
            ? CombatTimers.calculateAttackInterval(player, baseInterval)
            : { interval: 2000 };
        const attackProgress = ((combat.playerTimer?.elapsed || 0) / playerInterval.interval) * 100;
        const attackRemaining = ((playerInterval.interval / 1000) * (1 - attackProgress / 100)).toFixed(1);

        // Get player combat stats
        const compiledStats = player.compiledStats || {};
        const minDmg = compiledStats.minDamage || combat.compiledWeapon?.baseDamage || 10;
        const maxDmg = compiledStats.maxDamage || (minDmg + 10);
        const damageType = combat.compiledWeapon?.damageType || 'physical';
        const armorType = compiledStats.armorType || 'none';

        // Get consumables
        const foodSlot = player.equipment?.food;
        const ammoSlot = player.equipment?.ammo;

        // Auto-eat only works while there is food in the slot. Showing "Auto-eat 29"
        // with an empty slot implied healing that could not happen (and let HP reach 0
        // under Auto). Reflect the real state so the gap is visible at a glance.
        const foodQty = (foodSlot && typeof foodSlot === 'object') ? (foodSlot.quantity || 0) : 0;
        const autoEatHint = foodQty > 0
            ? `<span class="auto-eat-hint auto-eat-hint--inline">🍖 Auto-eat ${threshold}</span>`
            : `<span class="auto-eat-hint auto-eat-hint--inline auto-eat-hint--empty">⚠️ No food — no auto-heal</span>`;

        return `
            <div class="combatant-card combatant-card--player combatant-card--slim">
                <div class="damage-anchor" id="playerDamageAnchor"></div>

                <div class="player-hud-row">
                    <span class="combatant-label">YOU</span>
                    <div class="combatant-stats combatant-stats--inline">
                        <span class="stat-pill">⚔️ ${minDmg}-${maxDmg}</span>
                        <span class="stat-pill stat-pill--${damageType}">${this.getTypeIcon(damageType)} ${this.capitalize(damageType)}</span>
                        <span class="stat-pill">🛡️ ${this.capitalize(armorType)}</span>
                    </div>
                </div>

                <div class="combatant-bars">
                    <div class="stat-bar">
                        <span class="bar-icon">❤️</span>
                        <div class="bar-track bar-track--hp">
                            <div class="bar-fill bar-fill--player-hp" style="width: ${hpPercent}%"></div>
                        </div>
                        <span class="bar-value">${Math.floor(player.currentHP)}/${player.maxHP}</span>
                    </div>
                    <div class="stat-bar">
                        <span class="bar-icon">⚔️</span>
                        <div class="bar-track bar-track--sm">
                            <div class="bar-fill bar-fill--player-atk" style="width: ${attackProgress}%"></div>
                        </div>
                        <span class="bar-value">${attackRemaining}s</span>
                    </div>
                </div>

                <div class="player-hud-footer">
                    ${autoEatHint}
                    <div class="consumable-row consumable-row--inline">
                        ${this.renderConsumableSlot('food', foodSlot, player)}
                        ${this.renderConsumableSlot('ammo', ammoSlot, player)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render enemy card
     */
    renderEnemyCard(enemy, combat) {
        const hpPercent = Math.max(0, (enemy.currentHP / enemy.maxHP) * 100);
        const enemyInterval = enemy.attackInterval || 2000;
        const attackProgress = ((combat.enemyTimer?.elapsed || 0) / enemyInterval) * 100;
        const attackRemaining = ((enemyInterval / 1000) * (1 - attackProgress / 100)).toFixed(1);

        const damageType = enemy.damageType || 'pierce';
        const armorType = enemy.armorType || 'plated';

        // The live combat enemy is a trimmed instance; pull artwork/description from the
        // full definition for the expanded display.
        const enemyId = enemy.enemyId || enemy.id;
        const def = (typeof EnemyRegistry !== 'undefined' && EnemyRegistry.get)
            ? (EnemyRegistry.get(enemyId) || {})
            : {};
        const assetPath = def.assetPath || (enemyId ? `assets/enemies/${enemyId}.png` : '');
        const hasAsset = !!(def.assetPath || def.useAsset);
        const fallbackIcon = enemy.icon || def.icon || '👾';
        const artwork = (hasAsset && assetPath)
            ? `<img src="${assetPath}" alt="${enemy.name}" class="enemy-art-img"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
               <span class="enemy-art-fallback" style="display:none;">${fallbackIcon}</span>`
            : `<span class="enemy-art-fallback">${fallbackIcon}</span>`;

        const drPct = Math.round((enemy.damageReduction || 0) * 100);

        return `
            <div class="combatant-card combatant-card--enemy combatant-card--hero">
                <div class="damage-anchor" id="enemyDamageAnchor"></div>

                <!-- Hero art is the centrepiece; detailed enemy stats live in the
                     Enemies-tab detail modal so the fight view stays clean. -->
                <div class="enemy-hero-art">${artwork}</div>

                <div class="combatant-header-row">
                    <span class="combatant-label combatant-label--name">${enemy.name}</span>
                    <span class="combatant-level">Lv.${enemy.level}</span>
                </div>

                <div class="combatant-bars">
                    <div class="stat-bar">
                        <span class="bar-icon">❤️</span>
                        <div class="bar-track bar-track--hp">
                            <div class="bar-fill bar-fill--enemy-hp" style="width: ${hpPercent}%"></div>
                        </div>
                        <span class="bar-value">${Math.floor(enemy.currentHP)}/${enemy.maxHP}</span>
                    </div>
                    <div class="stat-bar">
                        <span class="bar-icon">⚔️</span>
                        <div class="bar-track bar-track--sm">
                            <div class="bar-fill bar-fill--enemy-atk" style="width: ${attackProgress}%"></div>
                        </div>
                        <span class="bar-value">${attackRemaining}s</span>
                    </div>
                </div>

                <div class="combatant-stats">
                    <span class="stat-pill">⚔️ ${enemy.minDamage}-${enemy.maxDamage}</span>
                    <span class="stat-pill stat-pill--${damageType}">${this.getTypeIcon(damageType)} ${this.capitalize(damageType)}</span>
                    <span class="stat-pill">🛡️ ${this.capitalize(armorType)}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render consumable slot
     */
    renderConsumableSlot(type, slot, player) {
        const icon = type === 'food' ? '🍖' : '🔫';
        const label = type === 'food' ? 'Food' : 'Ammo';

        // Get quantity - handle different slot formats
        let quantity = 0;
        let itemName = `No ${label}`;
        let itemIcon = icon;

        if (slot) {
            // Handle object format { itemId, quantity } or { name, quantity }
            if (typeof slot === 'object') {
                const itemId = slot.itemId || slot.id;
                if (itemId) {
                    const itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null;
                    itemName = itemDef?.name || slot.name || itemId;
                    itemIcon = itemDef?.icon || icon;

                    // Get quantity from bank for stackable items
                    if (type === 'ammo') {
                        quantity = player.bank?.stackable?.[itemId] || slot.quantity || 0;
                    } else {
                        quantity = slot.quantity || player.bank?.stackable?.[itemId] || 0;
                    }
                } else {
                    itemName = slot.name || label;
                    quantity = slot.quantity || 0;
                }
            } else if (typeof slot === 'string') {
                // Handle string ID format
                const itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(slot) : null;
                itemName = itemDef?.name || slot;
                itemIcon = itemDef?.icon || icon;
                quantity = player.bank?.stackable?.[slot] || 0;
            }
        }

        const isEmpty = quantity === 0;

        // Render the icon as an image when it is an asset path, otherwise as an emoji/text.
        const iconHtml = (typeof itemIcon === 'string' && (itemIcon.startsWith('assets/') || itemIcon.endsWith('.png')))
            ? `<img src="${itemIcon}" alt="" class="consumable-icon-img" onerror="this.replaceWith(document.createTextNode('${icon}'))">`
            : itemIcon;

        return `
            <div class="consumable-slot ${isEmpty ? 'consumable-slot--empty' : ''}">
                <span class="consumable-icon">${iconHtml}</span>
                <div class="consumable-info">
                    <span class="consumable-label">${label}</span>
                    <span class="consumable-qty">x${this.formatNumber(quantity)}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render drops section
     */
    renderDropsSection() {
        const hasLoot = this.recentLoot && this.recentLoot.length > 0;

        // Rewards now auto-apply on each kill (gold/medals/items/XP), so this is an
        // informational feed of what was just collected — the button only clears it.
        return `
            <div class="drops-section">
                <div class="drops-header">
                    <span class="drops-icon">📦</span>
                    <span class="drops-title">RECENT DROPS</span>
                    <span class="drops-count">${this.recentLoot?.length || 0}</span>
                    ${hasLoot ? `<button class="btn-loot-all" onclick="CombatContainer.collectAllLoot()">Clear</button>` : ''}
                </div>
                <div class="drops-grid">
                    ${this.renderDrops()}
                </div>
            </div>
        `;
    },

    /**
     * Render drop tiles
     * Items are pre-stacked in recentLoot via addLoot()
     */
    renderDrops() {
        if (!this.recentLoot || this.recentLoot.length === 0) {
            return '<div class="drops-empty">No drops yet</div>';
        }

        // recentLoot is already stacked - just render it
        return this.recentLoot.map(drop => {
            const rarity = drop.rarity || 'common';
            const qtyDisplay = drop.isInstanced ? '' : `+${drop.quantity || 1}`;
            const instanceBadge = drop.isInstanced ? '<span class="drop-instance-badge">★</span>' : '';
            return `
                <div class="drop-tile drop-tile--${rarity}" title="${drop.name}${drop.isInstanced ? ' (Unique)' : ''}">
                    <span class="drop-icon">${drop.icon || '📦'}</span>
                    ${qtyDisplay ? `<span class="drop-qty">${qtyDisplay}</span>` : ''}
                    ${instanceBadge}
                </div>
            `;
        }).join('');
    },

    /**
     * Render respawn state
     */
    renderRespawnState(respawn) {
        const respawnData = typeof GameEngine !== 'undefined' && GameEngine.getRespawnProgress
            ? GameEngine.getRespawnProgress()
            : null;

        if (!respawnData) {
            return this.render();
        }

        const enemy = typeof EnemyRegistry !== 'undefined'
            ? EnemyRegistry.get(respawnData.enemyId)
            : null;
        const enemyName = enemy?.name || 'Enemy';
        const enemyIcon = enemy?.icon || '👾';
        const remainingSeconds = (respawnData.remaining / 1000).toFixed(1);
        const progressPercent = respawnData.progress * 100;
        const autoCombat = GameEngine?.state?.combat?.autoCombat ?? true;

        return `
            <div class="combat-container">
                <div class="combat-respawn">
                    <div class="respawn-icon-wrap">
                        <span class="respawn-icon">${enemyIcon}</span>
                    </div>
                    <div class="respawn-text">RESPAWNING</div>
                    <div class="respawn-name">${enemyName}</div>
                    <div class="respawn-bar-wrap">
                        <div class="respawn-bar">
                            <div class="respawn-bar-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="respawn-time">${remainingSeconds}s</span>
                    </div>
                    <div class="respawn-actions">
                        <button class="btn-cancel" onclick="CombatContainer.cancelRespawn()">Cancel</button>
                        <label class="auto-toggle">
                            <input type="checkbox"
                                   ${autoCombat ? 'checked' : ''}
                                   onchange="CombatContainer.toggleAutoCombat(this.checked)">
                            <span>Auto-Combat</span>
                        </label>
                    </div>
                </div>

                ${this.renderDropsSection()}
            </div>
        `;
    },

    /**
     * Cancel respawn timer
     */
    cancelRespawn() {
        if (typeof GameEngine !== 'undefined' && GameEngine.cancelRespawnTimer) {
            GameEngine.cancelRespawnTimer();
        }
        if (typeof CombatUI !== 'undefined' && CombatUI.render) {
            CombatUI.render();
        }
    },

    /**
     * Toggle auto-combat setting
     */
    toggleAutoCombat(enabled) {
        if (typeof GameEngine !== 'undefined' && GameEngine.setAutoCombat) {
            GameEngine.setAutoCombat(enabled);
        }
    },

    /**
     * Update combat display (called each tick)
     */
    update() {
        const player = GameEngine.state;
        const combat = player.combat;
        const respawn = GameEngine.state?.combat?.respawn;

        if (respawn?.active) {
            this.updateRespawnProgress();
            return;
        }

        if (!combat || !combat.inCombat) return;

        // Update HP bars
        this.updateBar('.bar-fill--player-hp', player.currentHP, player.maxHP);
        this.updateBar('.bar-fill--enemy-hp', combat.currentEnemy.currentHP, combat.currentEnemy.maxHP);

        // Update HP text
        const pVal = document.querySelector('.combatant-card--player .stat-bar .bar-value');
        const eVal = document.querySelector('.combatant-card--enemy .stat-bar .bar-value');
        if (pVal) pVal.textContent = `${Math.floor(player.currentHP)}/${player.maxHP}`;
        if (eVal) eVal.textContent = `${Math.floor(combat.currentEnemy.currentHP)}/${combat.currentEnemy.maxHP}`;

        // Update attack timers
        this.updateAttackBars(player, combat);

        // Update consumable quantities
        this.updateConsumables(player);
    },

    /**
     * Update a progress bar
     */
    updateBar(selector, current, max) {
        const bar = document.querySelector(selector);
        if (bar) {
            bar.style.width = `${Math.max(0, (current / max) * 100)}%`;
        }
    },

    /**
     * Update attack progress bars
     */
    updateAttackBars(player, combat) {
        // Player attack bar
        const baseInterval = combat.compiledWeapon?.attackInterval || 2000;
        const playerInterval = typeof CombatTimers !== 'undefined'
            ? CombatTimers.calculateAttackInterval(player, baseInterval)
            : { interval: 2000 };
        const playerProgress = ((combat.playerTimer?.elapsed || 0) / playerInterval.interval) * 100;
        const playerRemaining = ((playerInterval.interval / 1000) * (1 - playerProgress / 100)).toFixed(1);

        const pAtkBar = document.querySelector('.bar-fill--player-atk');
        const pAtkVal = document.querySelector('.combatant-card--player .stat-bar:nth-child(2) .bar-value');
        if (pAtkBar) pAtkBar.style.width = `${playerProgress}%`;
        if (pAtkVal) pAtkVal.textContent = `${playerRemaining}s`;

        // Enemy attack bar
        const enemyInterval = combat.currentEnemy.attackInterval || 2000;
        const enemyProgress = ((combat.enemyTimer?.elapsed || 0) / enemyInterval) * 100;
        const enemyRemaining = ((enemyInterval / 1000) * (1 - enemyProgress / 100)).toFixed(1);

        const eAtkBar = document.querySelector('.bar-fill--enemy-atk');
        const eAtkVal = document.querySelector('.combatant-card--enemy .stat-bar:nth-child(2) .bar-value');
        if (eAtkBar) eAtkBar.style.width = `${enemyProgress}%`;
        if (eAtkVal) eAtkVal.textContent = `${enemyRemaining}s`;
    },

    /**
     * Update respawn progress bar
     */
    updateRespawnProgress() {
        const respawnData = typeof GameEngine !== 'undefined' && GameEngine.getRespawnProgress
            ? GameEngine.getRespawnProgress()
            : null;

        if (!respawnData) return;

        const fillEl = document.querySelector('.respawn-bar-fill');
        const timeEl = document.querySelector('.respawn-time');

        if (fillEl) {
            fillEl.style.width = `${respawnData.progress * 100}%`;
        }
        if (timeEl) {
            timeEl.textContent = `${(respawnData.remaining / 1000).toFixed(1)}s`;
        }
    },

    /**
     * Update consumables display
     */
    updateConsumables(player) {
        const slots = document.querySelectorAll('.consumable-slot .consumable-qty');
        if (slots.length < 2) return;

        // Food
        const foodSlot = player.equipment?.food;
        let foodQty = 0;
        if (foodSlot) {
            const foodId = typeof foodSlot === 'object' ? (foodSlot.itemId || foodSlot.id) : foodSlot;
            foodQty = player.bank?.stackable?.[foodId] || foodSlot?.quantity || 0;
        }
        if (slots[0]) slots[0].textContent = `x${this.formatNumber(foodQty)}`;

        // Ammo
        const ammoSlot = player.equipment?.ammo;
        let ammoQty = 0;
        if (ammoSlot) {
            const ammoId = typeof ammoSlot === 'object' ? (ammoSlot.itemId || ammoSlot.id) : ammoSlot;
            ammoQty = player.bank?.stackable?.[ammoId] || ammoSlot?.quantity || 0;
        }
        if (slots[1]) slots[1].textContent = `x${this.formatNumber(ammoQty)}`;
    },

    /**
     * Add loot drop - stacks stackable items, keeps instanced items separate
     */
    addLoot(lootData) {
        // Instanced items (with instanceId) always get their own entry
        if (lootData.instanceId) {
            this.recentLoot.push({ ...lootData, isInstanced: true });
        } else {
            // Stackable item - find existing entry and add to it
            const key = lootData.itemId || lootData.name;
            const existing = this.recentLoot.find(
                entry => !entry.isInstanced && (entry.itemId === key || entry.name === key)
            );

            if (existing) {
                existing.quantity = (existing.quantity || 1) + (lootData.quantity || 1);
            } else {
                this.recentLoot.push({ ...lootData, quantity: lootData.quantity || 1 });
            }
        }

        // NOTE: No limit on recentLoot - loot persists until manually collected
        // Future: Add "Loot All" button to clear

        // Re-render drops section
        const dropsSection = document.querySelector('.drops-section');
        if (dropsSection) {
            dropsSection.outerHTML = this.renderDropsSection();
        }
    },

    // === HELPERS ===

    getTypeIcon(type) {
        const icons = {
            pierce: '🗡️',
            explosive: '💥',
            cryo: '❄️',
            shock: '⚡',
            incendiary: '🔥',
            physical: '⚔️',
            slash: '🗡️',
            blunt: '🔨'
        };
        return icons[type] || '⚔️';
    },

    capitalize(str) {
        if (!str) return 'None';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    formatNumber(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toString();
    },

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
     * Clear the recent-drops feed. Rewards (gold/medals/items/XP) are now applied the
     * moment an enemy dies (CombatSystem.awardLoot → depositKillRewards), so this list
     * is informational only — the button must NOT re-deposit, or every drop would be
     * granted twice.
     */
    collectAllLoot() {
        if (!this.recentLoot || this.recentLoot.length === 0) {
            return;
        }

        // Rewards are already in the player's currencies/bank/XP — just clear the feed.
        this.recentLoot = [];

        // Re-render drops section
        const dropsSection = document.querySelector('.drops-section');
        if (dropsSection) {
            dropsSection.outerHTML = this.renderDropsSection();
        }

        // Update currency display
        if (typeof UICore !== 'undefined' && UICore.updateCurrencyDisplay) {
            UICore.updateCurrencyDisplay();
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatContainer;
}
