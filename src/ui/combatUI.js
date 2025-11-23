/**
 * COMBAT UI
 *
 * Handles combat interface rendering including combat stats, active combat,
 * loot boxes, enemy selection, and respawn timers.
 */

const CombatUI = {
    // Cache last rendered state to prevent unnecessary re-renders
    lastCombatState: null,

    /**
     * Update combat display
     */
    updateCombat() {
        const container = document.getElementById("combatArea");
        if (!container) return;

        const combat = GameEngine.state.combat;
        const equipment = GameEngine.state.equipment;

        // Create state snapshot
        const currentState = {
            inCombat: combat.inCombat,
            enemy: combat.currentEnemy ? JSON.stringify({
                name: combat.currentEnemy.name,
                currentHealth: Math.floor(combat.currentEnemy.currentHealth / 10), // Track in chunks to reduce re-renders
                maxHealth: combat.currentEnemy.maxHealth
            }) : null,
            playerHealth: Math.floor(combat.player.currentHealth / 10), // Track in chunks of 10 HP to reduce re-renders
            // Only track log during respawn, not during active combat (too many re-renders block buttons)
            logLength: combat.inCombat ? -1 : combat.combatLog.length,
            unassignedPoints: GameEngine.state.characterLevel.unassignedAttributePoints,
            attributes: JSON.stringify(GameEngine.state.combatAttributes),
            waitingForRespawn: combat.waitingForRespawn,
            respawnTime: combat.waitingForRespawn ? Math.floor((Date.now() - combat.enemyDefeatedAt) / 1000) : 0,  // Update every 1 second (not 100ms)
            lootCount: combat.pendingLoot.length,
            equipment: JSON.stringify(equipment), // Track equipment changes
            ammo: combat.playerAmmo ? JSON.stringify(combat.playerAmmo) : null, // Track ammo changes
            reloading: combat.playerAmmo?.isReloading ? Math.floor(Date.now() / 100) : 0, // Update during reload
            foodQuantity: combat.equippedFoodQuantity, // Track food quantity
            currentStance: combat.currentStance // Track stance
            // Note: Cooldown displays are updated separately and don't need to trigger full re-renders
        };

        // Only re-render if state changed, but always update progress bars
        if (this.lastCombatState &&
            this.lastCombatState.inCombat === currentState.inCombat &&
            this.lastCombatState.enemy === currentState.enemy &&
            this.lastCombatState.playerHealth === currentState.playerHealth &&
            this.lastCombatState.logLength === currentState.logLength &&
            this.lastCombatState.unassignedPoints === currentState.unassignedPoints &&
            this.lastCombatState.attributes === currentState.attributes &&
            this.lastCombatState.waitingForRespawn === currentState.waitingForRespawn &&
            this.lastCombatState.respawnTime === currentState.respawnTime &&
            this.lastCombatState.lootCount === currentState.lootCount &&
            this.lastCombatState.equipment === currentState.equipment &&
            this.lastCombatState.ammo === currentState.ammo &&
            this.lastCombatState.reloading === currentState.reloading &&
            this.lastCombatState.foodQuantity === currentState.foodQuantity &&
            this.lastCombatState.currentStance === currentState.currentStance) {
            this.updateCombatProgressBars();
            return;
        }

        // Build HTML with responsive 3-column layout
        let html = '<div class="combat-container">';

        // LEFT COLUMN: Enemy/Dungeon Selection
        html += this.renderLeftColumn();

        // CENTER COLUMN: Combat Area
        if (combat.inCombat && combat.currentEnemy) {
            html += this.renderCenterColumn_ActiveCombat();
        } else if (combat.waitingForRespawn) {
            html += this.renderCenterColumn_Respawn();
        } else {
            html += this.renderCenterColumn_Idle();
        }

        // RIGHT COLUMN: Equipment & Stats
        html += this.renderRightColumn();

        html += '</div>';

        // Add mobile tabs
        html += this.renderMobileTabs();

        container.innerHTML = html;

        this.lastCombatState = currentState;

        // Update combat progress bars after rendering
        this.updateCombatProgressBars();
    },

    /**
     * Update combat progress bars (health and attack interval)
     */
    updateCombatProgressBars() {
        const combat = GameEngine.state.combat;
        if (!combat.inCombat || !combat.currentEnemy) return;

        const playerStats = GameEngine.getPlayerCombatStats();

        // Update player health bar
        const healthBar = document.getElementById("playerHealthBar");
        const healthText = document.getElementById("playerHealthText");
        if (healthBar && healthText) {
            const healthPercent = (playerStats.currentHealth / playerStats.maxHealth) * 100;
            healthBar.style.width = `${healthPercent}%`;
            healthText.textContent = `${Math.max(0, Math.floor(playerStats.currentHealth))}/${Math.floor(playerStats.maxHealth)}`;
        }

        // Update attack interval bar
        const lastAttack = GameEngine.state.combat.lastAttackTime;
        const attackInterval = playerStats.effectiveAttackInterval;
        const nextAttack = lastAttack + attackInterval;
        const progress = ProgressBar.calculateIntervalProgress(lastAttack, nextAttack);

        const intervalBar = document.getElementById("attackIntervalBar");
        const intervalText = document.getElementById("attackIntervalText");

        if (intervalBar && intervalText) {
            // Apply progress with reset logic
            ProgressBar.applyProgressWithReset(intervalBar, progress, this.lastAttackProgress || 0);
            this.lastAttackProgress = progress;

            const remaining = Math.max(0, Math.ceil((nextAttack - Date.now()) / 100) / 10);
            intervalText.textContent = remaining > 0 ? `${remaining.toFixed(1)}s` : "Attacking!";
        }
    },

    /**
     * Render combat stats display - COMPACT VERSION
     */
    renderCombatStats() {
        const attributes = GameEngine.state.combatAttributes;
        const attributeDefs = GameEngine.definitions.combatAttributes;
        const unassignedPoints = GameEngine.state.characterLevel.unassignedAttributePoints;
        const characterLevel = GameEngine.state.characterLevel.level;

        let html = `
            <div class="dashboard-panel" style="margin-bottom: 12px;">
                <div class="panel-header" style="padding: 8px 12px;">
                    <div class="panel-title" style="font-size: 0.9em;">⚔️ Character Stats (Lv ${characterLevel})</div>
                    ${unassignedPoints > 0 ? `<div class="panel-subtitle" style="color: #ffd700;">📈 ${unassignedPoints} Point${unassignedPoints !== 1 ? 's' : ''}</div>` : ''}
                </div>
                <div class="panel-content" style="padding: 10px;">
                    <!-- Compact Attributes Grid: 3 columns -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
        `;

        // Render each attribute - COMPACT
        for (let attrId in attributeDefs) {
            const attrDef = attributeDefs[attrId];
            const attrValue = attributes[attrId];
            const icon = this.getAttributeIcon(attrId);

            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 6px; text-align: center;">
                    <div style="font-size: 1.2em; margin-bottom: 2px;">${icon}</div>
                    <div style="font-size: 0.7em; color: #888; margin-bottom: 4px;">${attrDef.name}</div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                        <span style="color: #00d9ff; font-weight: bold; font-size: 1.1em;">${attrValue}</span>
                        ${unassignedPoints > 0 ? `
                            <button onclick="assignPoint('${attrId}')" style="padding: 2px 6px; background: #27ae60; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 0.8em; font-weight: bold;">+</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render food indicator (equipped food and quantity)
     */
    renderFoodIndicator() {
        const combat = GameEngine.state.combat;
        const equippedFood = GameEngine.state.equipment.food;

        // Only show if food is equipped
        if (!equippedFood || combat.equippedFoodQuantity <= 0) {
            return '';
        }

        const foodDef = ItemAccessHelper.getItem(equippedFood);
        if (!foodDef) {
            return '';
        }

        const playerStats = GameEngine.getPlayerCombatStats();
        const healthPercent = combat.player.currentHealth / playerStats.maxHealth;
        // Show effective threshold including HEALTH attribute bonus
        const effectiveThreshold = Math.min(0.95, combat.autoEatThreshold + playerStats.autoEatThresholdBonus);
        const thresholdPercent = Math.floor(effectiveThreshold * 100);

        // Check if on cooldown
        const now = Date.now();
        const onCooldown = (now - combat.lastAutoEatTime) < combat.autoEatCooldown;
        const cooldownRemaining = onCooldown ? ((combat.autoEatCooldown - (now - combat.lastAutoEatTime)) / 1000).toFixed(1) : 0;

        // Determine status color
        let statusColor = '#4caf50'; // Green - ready
        let statusText = 'Ready';
        if (healthPercent >= combat.autoEatThreshold) {
            statusColor = '#4a9eff'; // Blue - above threshold
            statusText = `Auto at ${thresholdPercent}%`;
        } else if (onCooldown) {
            statusColor = '#ffd43b'; // Yellow - on cooldown
            statusText = `Cooldown: ${cooldownRemaining}s`;
        }

        const foodName = foodDef.name || equippedFood;
        const foodIcon = foodDef.image || '🍎';

        // Show effective healing with INTELLECT consumable efficiency bonus
        const baseHeal = foodDef.healAmount;
        const effectiveHeal = Math.floor(baseHeal * (1 + playerStats.consumableEfficiency));
        const healDisplay = effectiveHeal > baseHeal ? `${effectiveHeal} HP (${baseHeal}+${effectiveHeal - baseHeal})` : `${baseHeal} HP`;

        return `
            <!-- Food Indicator -->
            <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <strong>${foodIcon} ${foodName}:</strong>
                    <span style="color: ${statusColor}; font-weight: bold; font-size: 1.1em;">
                        ${combat.equippedFoodQuantity}x
                    </span>
                </div>
                <div style="font-size: 0.85em; color: ${statusColor}; text-align: center;">
                    ${statusText} | Heals ${healDisplay}
                </div>
            </div>
        `;
    },

    /**
     * Render stance indicator
     */
    renderStanceIndicator() {
        const combat = GameEngine.state.combat;
        const currentStance = combat.currentStance || "offensive";

        const isDefensive = currentStance === "defensive";
        const stanceIcon = isDefensive ? "🛡️" : "⚔️";
        const stanceName = isDefensive ? "Defensive Stance" : "Offensive Stance";
        const stanceColor = isDefensive ? "#4a9eff" : "#f44336";
        const bgColor = isDefensive ? "rgba(74, 158, 255, 0.1)" : "rgba(244, 67, 54, 0.1)";

        // Check cooldown
        const now = Date.now();
        const onCooldown = (now - combat.lastStanceChange) < combat.stanceChangeCooldown;
        const cooldownRemaining = onCooldown ? ((combat.stanceChangeCooldown - (now - combat.lastStanceChange)) / 1000).toFixed(1) : 0;

        return `
            <!-- Stance Indicator -->
            <div style="
                margin: 15px 0;
                background: ${bgColor};
                border: 2px solid ${stanceColor};
                border-radius: 8px;
                padding: 12px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: ${stanceColor}; font-weight: bold; font-size: 1.1em;">
                        ${stanceIcon} ${stanceName}
                    </span>
                    ${onCooldown ? `
                        <span style="color: #ffd43b; font-size: 0.9em;">
                            ⏱️ ${cooldownRemaining}s
                        </span>
                    ` : ''}
                </div>

                ${isDefensive ? `
                    <div style="font-size: 0.85em; color: #aaa; line-height: 1.4;">
                        <div>🛡️ +30% Damage Reduction</div>
                        <div>💨 +20% Block/Parry</div>
                        <div>⚔️ -40% Damage Dealt</div>
                        <div>⏱️ -25% Attack Speed</div>
                    </div>
                ` : `
                    <div style="font-size: 0.85em; color: #aaa; line-height: 1.4;">
                        <div>⚔️ Normal Damage & Speed</div>
                    </div>
                `}
            </div>
        `;
    },

    /**
     * Render ammo counter and reload progress bar (for gun-type weapons)
     */
    renderAmmoAndReload() {
        const ammo = GameEngine.state.combat.playerAmmo;

        // Only show if player has a gun equipped
        if (!ammo || !ammo.magazineSize || ammo.magazineSize === 0) {
            return '';
        }

        let html = '';

        // Ammo Counter
        const ammoPercent = (ammo.currentAmmo / ammo.magazineSize) * 100;
        const ammoColor = ammoPercent > 30 ? '#4a9eff' : ammoPercent > 0 ? '#ffd43b' : '#f44336';

        html += `
            <!-- Ammo Counter -->
            <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <strong>🔫 Ammo:</strong>
                    <span style="color: ${ammoColor}; font-weight: bold; font-size: 1.1em;">
                        ${ammo.currentAmmo}/${ammo.magazineSize}
                    </span>
                </div>
                <div class="health-bar">
                    <div class="health-bar-fill" style="width: ${ammoPercent}%; background: linear-gradient(90deg, ${ammoColor}, ${ammoColor}); transition: width 0.3s ease-out;"></div>
                </div>
            </div>
        `;

        // Reload Progress Bar (only show if reloading)
        if (ammo.isReloading) {
            const now = Date.now();
            const elapsed = now - ammo.reloadStartTime;
            const reloadPercent = Math.min(100, (elapsed / ammo.reloadDuration) * 100);
            const timeRemaining = ((ammo.reloadDuration - elapsed) / 1000).toFixed(1);

            html += `
                <!-- Reload Progress Bar -->
                <div style="margin: 15px 0;">
                    <strong style="color: #ffd43b;">🔄 Reloading...</strong>
                    <div class="health-bar">
                        <div class="health-bar-fill" id="reloadBar" style="width: ${reloadPercent}%; background: linear-gradient(90deg, #ffd43b, #ffa726); transition: width 0.1s linear;"></div>
                        <div class="health-bar-text">${timeRemaining}s</div>
                    </div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Render combat loadout panel (equipment quick-swap in combat)
     */
    renderCombatLoadout() {
        const playerStats = GameEngine.getPlayerCombatStats();
        const currentWeight = GameEngine.getTotalEquippedWeight();
        const maxWeight = GameEngine.getMaxEquipmentWeight();

        // Determine weight color based on capacity
        let weightColor = "#4a9eff";
        const weightPercent = (currentWeight / maxWeight) * 100;
        if (weightPercent >= 100) {
            weightColor = "#f44336";
        } else if (weightPercent >= 80) {
            weightColor = "#ff9800";
        }

        let html = `
            <div style="background: #2a2a3a; border: 2px solid #4a9eff; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <!-- Loadout Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #444;">
                    <strong style="font-size: 1.05em;">⚔️ Combat Loadout</strong>
                    <div style="text-align: right;">
                        <div style="font-size: 0.85em; color: ${weightColor}; font-weight: bold;">
                            ⚖️ ${currentWeight} / ${maxWeight}
                        </div>
                        <div style="font-size: 0.7em; color: #888;">Equipment Weight</div>
                    </div>
                </div>

                <!-- Equipment Component (compact mode - equipment + consumables, no tech) -->
                ${EquipmentComponent.render({ mode: 'compact', showLabels: false, interactive: true })}

                <!-- Quick Stats Summary -->
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 0.75em;">
                    <div style="text-align: center;">
                        <div style="color: #888;">Damage</div>
                        <div style="font-weight: bold; color: #ff6b6b;">⚔️ ${playerStats.attackDamage.toFixed(1)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #888;">Speed</div>
                        <div style="font-weight: bold; color: #ffd43b;">⚡ ${playerStats.attackSpeed.toFixed(2)}/s</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #888;">Accuracy</div>
                        <div style="font-weight: bold; color: #51cf66;">🎯 ${playerStats.accuracy.toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render active combat UI
     */
    renderActiveCombat() {
        const combat = GameEngine.state.combat;
        const enemy = combat.currentEnemy;
        const player = combat.player;
        const playerStats = GameEngine.getPlayerCombatStats();
        const combatLog = combat.combatLog;

        const enemyHealthPercent = (enemy.currentHealth / enemy.maxHealth) * 100;
        const playerHealthPercent = (playerStats.currentHealth / playerStats.maxHealth) * 100;

        // Get enemy definition and type information
        const enemyDef = GameEngine.definitions.enemies[enemy.id];
        const enemyArmorType = enemyDef?.stats?.armorType || 'biological';
        const enemyDamageType = enemyDef?.stats?.damageType || 'pierce';
        const enemyArmorTypeDef = GameEngine.definitions.armorTypes[enemyArmorType];
        const enemyDamageTypeDef = GameEngine.definitions.damageTypes[enemyDamageType];

        // Start with combat stats
        let html = this.renderCombatStats();

        // Add loot box if there's pending loot
        html += this.renderLootBox();

        // Get active status effects for the enemy
        const activeEffects = combat.activeEffects || [];
        const statusOverlays = this.getStatusOverlays(activeEffects);
        const statusIcons = this.getStatusIcons(activeEffects);

        html += `
            <!-- Combat Arena -->
            <div class="combat-arena">
                <!-- Player Side -->
                <div class="player-side">
                    <div class="player-avatar-container" id="playerAvatarContainer">
                        <!-- Player Avatar (equipment display placeholder) -->
                        <div class="player-avatar">
                            🛡️
                        </div>

                        <!-- Player Health Bar (inside avatar) -->
                        <div class="enemy-health-bar">
                            <div class="health-fill" style="width: ${playerHealthPercent}%; background: linear-gradient(90deg, #27ae60, #229954);"></div>
                            <span class="health-text" id="playerHealthText">${Math.max(0, Math.floor(playerStats.currentHealth))}/${Math.floor(playerStats.maxHealth)}</span>
                        </div>
                    </div>

                    <div class="player-stats">
                        <div class="stat-label">Your Stats</div>
                        <div style="font-size: 0.85em; color: #aaa;">
                            Dmg: ${Math.floor(playerStats.minHit)}-${Math.floor(playerStats.maxHit)}<br>
                            Acc: ${Math.floor(playerStats.effectiveHitChance)}%<br>
                            Def: ${Math.floor(playerStats.damageReductionRate * 100)}%
                        </div>

                        <!-- Current Stance -->
                        ${this.renderStanceIndicator()}

                        <!-- Equipped Food -->
                        ${this.renderFoodIndicator()}
                    </div>
                </div>

                <!-- Battlefield Center -->
                <div class="battlefield-center" id="battlefieldCenter">
                    <!-- Hit splats will appear here -->

                    <!-- Attack Cooldown Indicator -->
                    <div style="margin-top: auto;">
                        <div class="health-bar" style="width: 150px;">
                            <div class="health-bar-fill" id="attackIntervalBar" style="width: 0%; background: linear-gradient(90deg, #f44336, #e91e63); transition: width 0.3s ease-out;"></div>
                            <div class="health-bar-text" id="attackIntervalText" style="font-size: 0.8em;">Ready</div>
                        </div>
                    </div>

                    ${this.renderAmmoAndReload()}
                </div>

                <!-- Enemy Side -->
                <div class="enemy-side">
                    <div class="enemy-avatar-container" id="enemyAvatarContainer">
                        <!-- Enemy Avatar -->
                        <div class="enemy-avatar">
                            ${enemy.image}
                        </div>

                        <!-- Status Overlays -->
                        ${statusOverlays}

                        <!-- Status Effect Icons -->
                        <div class="status-effects" id="statusEffects">
                            ${statusIcons}
                        </div>

                        <!-- Enemy Health Bar (inside avatar) -->
                        <div class="enemy-health-bar">
                            <div class="health-fill" style="width: ${enemyHealthPercent}%;"></div>
                            <span class="health-text">${Math.max(0, Math.floor(enemy.currentHealth))}/${enemy.maxHealth}</span>
                        </div>
                    </div>

                    <div class="enemy-stats">
                        <div class="stat-label">${enemy.name}</div>
                        <div style="font-size: 0.85em; color: #aaa;">
                            Dmg: ${enemy.attackDamage}<br>
                            Speed: ${enemy.attackSpeed}/s<br>
                            Acc: ${enemy.accuracy}%
                        </div>

                        <!-- Enemy Types -->
                        <div style="font-size: 0.8em; margin-top: 8px;">
                            <div>
                                <span style="color: ${enemyArmorTypeDef?.color || '#fff'};">
                                    ${enemyArmorTypeDef?.icon || '🛡️'} ${enemyArmorTypeDef?.name || 'Unknown'}
                                </span>
                            </div>
                            <div>
                                <span style="color: ${enemyDamageTypeDef?.color || '#fff'};">
                                    ${enemyDamageTypeDef?.icon || '⚔️'} ${enemyDamageTypeDef?.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Combat Controls -->
            <div class="combat-controls">
                <button class="attack-button" id="attackBtn" onclick="attack()">⚔️ Attack</button>
                <button onclick="toggleStance()">
                    ${combat.currentStance === "defensive" ? "⚔️ Offensive" : "🛡️ Defensive"}
                </button>
                <button onclick="flee()">🏃 Flee</button>
            </div>

            <!-- Combat Log -->
            <div class="combat-log" id="combatLog">
                ${combatLog.map(entry => `<div class="combat-log-entry">${entry.message}</div>`).reverse().join('')}
            </div>
        `;

        return html;
    },

    /**
     * Render loot box UI
     */
    renderLootBox() {
        const pendingLoot = GameEngine.state.combat.pendingLoot;

        if (pendingLoot.length === 0) {
            return '';
        }

        // Aggregate all loot
        const aggregatedLoot = {
            currencies: {},
            items: {}
        };

        for (let lootDrop of pendingLoot) {
            for (let item of lootDrop.items) {
                if (item.type === 'currency') {
                    aggregatedLoot.currencies[item.id] = (aggregatedLoot.currencies[item.id] || 0) + item.amount;
                } else if (item.type === 'item') {
                    aggregatedLoot.items[item.id] = (aggregatedLoot.items[item.id] || 0) + item.amount;
                }
            }
        }

        let html = `
            <div style="background: #2a2a3a; border: 2px solid #ffd700; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="font-size: 1.1em;">📦 Loot</strong>
                    <button onclick="collectLoot()" style="padding: 6px 12px; background: #27ae60; border: 1px solid #229954; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">
                        ✅ Collect All
                    </button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;">
        `;

        // Render currencies
        for (let currencyId in aggregatedLoot.currencies) {
            const amount = aggregatedLoot.currencies[currencyId];
            const currencyIcons = {
                'gold': '💰',
                'medals': '🏅',
                'tomes': '📚',
                'gems': '💎'
            };
            const icon = currencyIcons[currencyId] || '💰';
            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 4px; padding: 6px; text-align: center;">
                    <div style="font-size: 1.5em;">${icon}</div>
                    <div style="font-size: 0.85em; font-weight: bold;">${Formatting.formatNumber(amount)}</div>
                </div>
            `;
        }

        // Render items
        for (let itemId in aggregatedLoot.items) {
            const amount = aggregatedLoot.items[itemId];
            const itemDef = ItemAccessHelper.getItem(itemId);
            if (itemDef) {
                html += `
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid #555; border-radius: 4px; padding: 6px; text-align: center;" title="${itemDef.name}">
                        <div style="font-size: 1.5em;">${itemDef.image}</div>
                        <div style="font-size: 0.85em; font-weight: bold;">×${amount}</div>
                    </div>
                `;
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render enemy selection UI - COMPACT VERSION
     */
    renderEnemySelection() {
        const enemies = GameEngine.definitions.enemies;
        const combatSkill = GameEngine.state.skills.combat;

        // Start with compact combat stats
        let html = this.renderCombatStats();

        // Enemy Selection Panel
        html += `
            <div class="dashboard-panel">
                <div class="panel-header">
                    <div class="panel-title">👹 Select Enemy</div>
                    <div class="panel-subtitle">Choose your target</div>
                </div>
                <div class="panel-content" style="padding: 10px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
        `;

        for (let enemyId in enemies) {
            const enemy = enemies[enemyId];
            const canFight = GameEngine.meetsRequirement(enemy.unlockRequirement);

            // Get type information
            const armorType = enemy.stats.armorType || 'biological';
            const damageType = enemy.stats.damageType || 'pierce';
            const armorTypeDef = GameEngine.definitions.armorTypes[armorType];
            const damageTypeDef = GameEngine.definitions.damageTypes[damageType];

            // Calculate relative power level (0-100 scale)
            const powerScore = (enemy.stats.maxHealth / 10) + (enemy.stats.attackDamage * 5);
            let powerLevel = '';
            let powerColor = '';
            if (powerScore < 50) {
                powerLevel = 'Weak';
                powerColor = '#4caf50';
            } else if (powerScore < 150) {
                powerLevel = 'Moderate';
                powerColor = '#ff9800';
            } else if (powerScore < 300) {
                powerLevel = 'Strong';
                powerColor = '#f44336';
            } else {
                powerLevel = 'Elite';
                powerColor = '#9c27b0';
            }

            let disabledReason = "";
            if (!canFight && enemy.unlockRequirement) {
                if (enemy.unlockRequirement.combat) {
                    disabledReason = `Req: Combat ${enemy.unlockRequirement.combat}`;
                }
            }

            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px; text-align: center; transition: all 0.2s; ${canFight ? 'cursor: pointer;' : 'opacity: 0.5;'}"
                     ${canFight ? `onclick="startFight('${enemyId}')"` : ''}
                     ${canFight ? `onmouseover="this.style.borderColor='rgba(0,217,255,0.4)'"` : ''}
                     ${canFight ? `onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'"` : ''}
                     title="${enemy.description}">
                    <div style="font-size: 2em; margin-bottom: 4px;">${enemy.image}</div>
                    <div style="font-weight: bold; font-size: 0.9em; margin-bottom: 4px; color: #00d9ff;">${enemy.name}</div>
                    ${disabledReason ? `
                        <div style="font-size: 0.7em; color: #f88;">${disabledReason}</div>
                    ` : `
                        <div style="font-size: 0.75em; color: #888; margin-bottom: 4px;">
                            ❤️ ${enemy.stats.maxHealth} | ⚔️ ${enemy.stats.attackDamage}
                        </div>
                        <div style="font-size: 0.65em; color: ${powerColor}; background: ${powerColor}33; padding: 2px 6px; border-radius: 3px; display: inline-block;">
                            ${powerLevel}
                        </div>
                    `}
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render respawn timer UI
     */
    renderRespawnTimer() {
        const combat = GameEngine.state.combat;
        const enemyId = combat.selectedEnemyId;
        const enemyDef = GameEngine.definitions.enemies[enemyId];
        const combatLog = combat.combatLog;

        // Start with combat stats
        let html = this.renderCombatStats();

        // Add loot box if there's pending loot
        html += this.renderLootBox();

        // Calculate time remaining
        const now = Date.now();
        const timeSinceDefeat = now - combat.enemyDefeatedAt;
        const timeRemaining = Math.max(0, enemyDef.respawnTime - timeSinceDefeat);
        const secondsRemaining = Math.ceil(timeRemaining / 1000);

        html += `
            <div style="text-align: center; padding: 30px; background: #2a2a3a; border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 3em; margin-bottom: 10px;">${enemyDef.image}</div>
                <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">${enemyDef.name}</div>
                <div style="color: #aaa; margin-bottom: 20px;">Respawning...</div>
                <div style="font-size: 2em; color: #4a9eff; font-weight: bold;">${secondsRemaining}s</div>
                <button onclick="flee()" style="margin-top: 20px; padding: 8px 16px; background: #e74c3c; border: 1px solid #c0392b; border-radius: 4px; color: white; cursor: pointer; font-size: 1em;">
                    🏃 Stop Farming
                </button>
            </div>

            <!-- Combat Log -->
            <div style="margin-top: 15px;">
                <strong>Combat Log:</strong>
                <div style="background: #2a2a2a; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; margin-top: 5px; font-size: 0.85em;">
        `;

        // Show last 10 log messages
        const recentLogs = combatLog.slice(-10);
        for (let log of recentLogs) {
            html += `<div style="margin: 3px 0;">${log.message}</div>`;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Get icon for attribute
     */
    getAttributeIcon(attrId) {
        const icons = {
            health: '❤️',
            defense: '🛡️',
            strength: '💪',
            stealth: '🥷',
            perception: '👁️',
            mobility: '⚡',
            intellect: '🧠'
        };
        return icons[attrId] || '📊';
    },

    /**
     * Get effect label for attribute
     */
    getAttributeEffectLabel(attrId) {
        const labels = {
            health: 'HP',
            defense: '% damage reduction',
            strength: 'physical damage',
            stealth: 'stealth effectiveness',
            perception: 'perception',
            mobility: 'mobility',
            intellect: 'intellect'
        };
        return labels[attrId] || '';
    },

    /**
     * Get formatted effect display for attribute
     */
    getAttributeEffectDisplay(attrId, attrValue, attrDef) {
        const effect = attrValue * attrDef.effectPerPoint;

        // Different formatting based on attribute type
        switch (attrId) {
            case 'health':
                return `Effect: +${Formatting.formatNumber(effect)} max HP`;

            case 'defense':
                return `Effect: ${Formatting.formatNumber(effect * 100)}% damage reduction`;

            case 'strength':
                return `Effect: +${Formatting.formatNumber(effect)} attack damage`;

            case 'stealth':
                return `Effect: +${Formatting.formatNumber(effect * 100)}% thieving success`;

            case 'perception':
                return `Effect: +${Formatting.formatNumber(effect)}% accuracy`;

            case 'mobility':
                return `Effect: +${Formatting.formatNumber(effect * 100)}% attack speed`;

            case 'intellect':
                return `Effect: +${Formatting.formatNumber(effect * 100)}% skill XP gain`;

            default:
                return `Effect: +${Formatting.formatNumber(effect)}`;
        }
    },

    /**
     * Get damage type color for hit splats
     */
    getDamageTypeColor(damageType) {
        const colors = {
            pierce: '#9e9e9e',
            explosive: '#ff5722',
            cryo: '#03a9f4',
            shock: '#ffeb3b',
            incendiary: '#ff9800',
            poison: '#4caf50',
            healing: '#4caf50'
        };
        return colors[damageType] || '#ffffff';
    },

    /**
     * Create a hit splat (floating damage number)
     * @param {number} damage - Damage amount
     * @param {string} damageType - Type of damage (pierce, explosive, etc.)
     * @param {boolean} isCritical - Whether this was a critical hit
     * @param {string} targetType - 'player' or 'enemy'
     * @param {boolean} isMiss - Whether the attack missed
     * @param {boolean} isHeal - Whether this is healing
     */
    createHitSplat(damage, damageType, isCritical, targetType, isMiss = false, isHeal = false) {
        console.log(`🎯 createHitSplat called - damage: ${damage}, type: ${damageType}, target: ${targetType}, crit: ${isCritical}`);

        // Find the target element - target the avatar for hits, not hidden health bars
        let targetElement;
        if (targetType === 'enemy') {
            // Target the enemy avatar (the visible emoji/icon)
            const enemyContainer = document.getElementById('enemyAvatarContainer');
            console.log(`   Enemy container found:`, enemyContainer);
            if (enemyContainer) {
                // Target the actual enemy avatar div (visible)
                targetElement = enemyContainer.querySelector('.enemy-avatar');
                // Fallback to avatar container itself
                if (!targetElement) {
                    targetElement = enemyContainer;
                }
                console.log(`   Using target element:`, targetElement);
            } else {
                console.warn('❌ Enemy avatar container not found for hit splat');
            }
        } else {
            // For player, target the player avatar (visible)
            const playerContainer = document.getElementById('playerAvatarContainer');
            console.log(`   Player container found:`, playerContainer);
            if (playerContainer) {
                // Target the actual player avatar div (visible)
                targetElement = playerContainer.querySelector('.player-avatar');
                // Fallback to player avatar container
                if (!targetElement) {
                    targetElement = playerContainer;
                }
                console.log(`   Using target element:`, targetElement);
            } else {
                console.warn('❌ Player avatar container not found for hit splat');
            }
        }

        if (!targetElement) {
            console.warn(`❌ Target element not found for hit splat (targetType: ${targetType}, damage: ${damage}, isCritical: ${isCritical})`);
            return;
        }

        console.log(`   ✅ Target element found, creating hitsplat...`);

        // Create the splat element
        const splat = document.createElement('div');
        splat.className = 'hit-splat';

        // Check if this is a mega critical (2x+ average damage)
        if (isCritical) {
            splat.className += ' critical';

            // Calculate if it's a mega crit
            if (GameEngine && GameEngine.getPlayerCombatStats) {
                const playerStats = GameEngine.getPlayerCombatStats();
                const averageDamage = (playerStats.minHit + playerStats.maxHit) / 2;

                // Mega crit if damage is 2x or more than average
                if (damage >= averageDamage * 2) {
                    splat.className += ' mega';
                }
            }
        }

        if (isMiss) {
            splat.className += ' miss';
        }

        // Set color based on damage type or special conditions
        if (isMiss) {
            splat.textContent = 'MISS';
        } else if (isHeal) {
            splat.style.color = this.getDamageTypeColor('healing');
            splat.textContent = `+${Math.floor(damage)}`;
        } else {
            splat.style.color = this.getDamageTypeColor(damageType);
            splat.textContent = Math.floor(damage);
        }

        // Position with slight randomization for multiple hits
        const rect = targetElement.getBoundingClientRect();
        const offsetX = Math.random() * 60 - 30; // -30 to +30 px
        const offsetY = Math.random() * 20 - 10; // -10 to +10 px

        splat.style.left = (rect.left + rect.width / 2 + offsetX) + 'px';
        splat.style.top = (rect.top + rect.height / 2 + offsetY) + 'px';

        console.log(`   💥 Hitsplat positioned at (${splat.style.left}, ${splat.style.top})`);

        // Add to document
        document.body.appendChild(splat);
        console.log(`   ✅ Hitsplat added to DOM:`, splat);

        // For damage to enemy, also create HP drop indicator from health bar
        if (targetType === 'enemy' && !isMiss && !isHeal && damage > 0) {
            this.createHealthBarDrop(damage, isCritical);
        }

        // Remove after animation completes (1800ms for criticals, 1500ms for normal)
        const duration = isCritical ? 1800 : 1500;
        setTimeout(() => {
            if (splat.parentNode) {
                splat.remove();
                console.log(`   🗑️ Hitsplat removed after ${duration}ms`);
            }
        }, duration);
    },

    /**
     * Create HP drop indicator from the end of the health bar
     * Shows damage flowing down from where the HP bar is dropping
     */
    createHealthBarDrop(damage, isCritical) {
        // Find the visible health bar container at top of combat panel
        const healthBars = document.querySelector('.combat-column-center .health-bar');
        if (!healthBars) return;

        // Get all health bars and find the enemy one (second one)
        const allHealthBars = document.querySelectorAll('.combat-column-center .health-bar');
        if (allHealthBars.length < 2) return;

        const enemyHealthBar = allHealthBars[1]; // Second health bar is enemy
        const healthFill = enemyHealthBar.querySelector('.health-bar-fill');
        if (!healthFill) return;

        // Create drop indicator
        const dropIndicator = document.createElement('div');
        dropIndicator.className = 'hp-drop-indicator';
        if (isCritical) {
            dropIndicator.classList.add('critical');
        }
        dropIndicator.textContent = `-${Math.floor(damage)}`;
        dropIndicator.style.color = this.getDamageTypeColor('pierce');

        // Position at the right edge of current health fill
        const barRect = enemyHealthBar.getBoundingClientRect();
        const fillRect = healthFill.getBoundingClientRect();

        // Position at end of health bar (right edge of fill)
        dropIndicator.style.left = (fillRect.right - 10) + 'px';
        dropIndicator.style.top = barRect.top + 'px';

        document.body.appendChild(dropIndicator);

        // Remove after animation
        setTimeout(() => {
            if (dropIndicator.parentNode) {
                dropIndicator.remove();
            }
        }, 1000);
    },

    /**
     * Create a DOT (Damage Over Time) hit splat
     * Smaller and with pulsing animation instead of floating
     * @param {number} damage - Damage amount
     * @param {string} damageType - Type of damage
     * @param {string} targetType - 'player' or 'enemy'
     * @param {string} icon - Effect icon (e.g., '🔥', '⚡')
     */
    createDOTHitSplat(damage, damageType, targetType, icon = '') {
        // Find the target element - target the health bar for better positioning
        let targetElement;
        if (targetType === 'enemy') {
            // Target the enemy avatar container's health bar
            const enemyContainer = document.getElementById('enemyAvatarContainer');
            if (enemyContainer) {
                targetElement = enemyContainer.querySelector('.enemy-health-bar');
            }
            // Fallback to avatar container
            if (!targetElement) {
                targetElement = enemyContainer;
            }
        } else {
            // For player, target the player avatar container's health bar
            const playerContainer = document.getElementById('playerAvatarContainer');
            if (playerContainer) {
                targetElement = playerContainer.querySelector('.enemy-health-bar');
            }
            // Fallback to player avatar container
            if (!targetElement) {
                targetElement = playerContainer;
            }
        }

        if (!targetElement) {
            console.warn('Target element not found for DOT hit splat');
            return;
        }

        // Create the splat element
        const splat = document.createElement('div');
        splat.className = 'hit-splat dot-splat';

        // Set color based on damage type
        splat.style.color = this.getDamageTypeColor(damageType);
        splat.textContent = `${icon} ${Math.floor(damage)}`;
        splat.style.fontSize = '18px'; // Smaller than normal hit splats

        // Position randomly around target
        const rect = targetElement.getBoundingClientRect();
        const randomX = Math.random() * 30 - 15; // -15 to +15 px (smaller range)
        const randomY = Math.random() * 15 - 7; // -7 to +7 px

        splat.style.left = (rect.left + rect.width / 2 + randomX) + 'px';
        splat.style.top = (rect.top + rect.height / 2 + randomY) + 'px';

        // Add to document
        document.body.appendChild(splat);

        // Remove after animation completes
        setTimeout(() => {
            if (splat.parentNode) {
                splat.remove();
            }
        }, 1500);
    },

    /**
     * Get status overlay HTML for active effects
     */
    getStatusOverlays(activeEffects) {
        const statusTypeMap = {
            'shocked': 'shocked',
            'bleeding': 'bleeding',
            'burning': 'burning',
            'poisoned': 'poisoned',
            'frozen': 'frozen',
            'armor_break': 'armor-broken',
            // Legacy support
            'shock': 'shocked',
            'bleed': 'bleeding',
            'burn': 'burning',
            'poison': 'poisoned',
            'freeze': 'frozen'
        };

        let overlaysHtml = '';
        const activeTypes = new Set();

        // Collect all active status types
        for (const effect of activeEffects) {
            const statusClass = statusTypeMap[effect.type];
            if (statusClass && !activeTypes.has(statusClass)) {
                activeTypes.add(statusClass);
                overlaysHtml += `<div class="status-overlay ${statusClass} active"></div>\n`;
            }
        }

        return overlaysHtml;
    },

    /**
     * Get status effect icons HTML
     */
    getStatusIcons(activeEffects) {
        const iconMap = {
            'shocked': '⚡',
            'bleeding': '🩸',
            'burning': '🔥',
            'poisoned': '☠️',
            'frozen': '❄️',
            'armor_break': '💔',
            // Legacy support
            'shock': '⚡',
            'bleed': '🩸',
            'burn': '🔥',
            'poison': '☠️',
            'freeze': '❄️'
        };

        let iconsHtml = '';
        const seenTypes = new Set();

        for (const effect of activeEffects) {
            const icon = iconMap[effect.type];
            if (icon && !seenTypes.has(effect.type)) {
                seenTypes.add(effect.type);
                iconsHtml += `<span class="effect-icon" title="${effect.type}">${icon}</span>\n`;
            }
        }

        return iconsHtml;
    },

    /**
     * Update status effects on enemy avatar
     */
    updateStatusEffects(activeEffects) {
        const avatarContainer = document.getElementById('enemyAvatarContainer');
        if (!avatarContainer) return;

        // Remove all existing status overlays
        const existingOverlays = avatarContainer.querySelectorAll('.status-overlay');
        existingOverlays.forEach(overlay => overlay.remove());

        // Add new overlays
        const overlaysHtml = this.getStatusOverlays(activeEffects);
        if (overlaysHtml) {
            const avatarEl = avatarContainer.querySelector('.enemy-avatar');
            if (avatarEl) {
                avatarEl.insertAdjacentHTML('afterend', overlaysHtml);
            }
        }

        // Update status icons
        const statusEffectsEl = document.getElementById('statusEffects');
        if (statusEffectsEl) {
            statusEffectsEl.innerHTML = this.getStatusIcons(activeEffects);
        }
    },

    /**
     * Render left column (Enemy/Dungeon Selection)
     */
    renderLeftColumn() {
        const enemies = GameEngine.definitions.enemies;
        const combatSkill = GameEngine.state.skills.combat;

        let html = `
            <div class="combat-column-left" id="combatColumnLeft">
                <div style="text-align: center; margin-bottom: 10px;">
                    <strong style="font-size: 1.1em;">👹 Enemies</strong>
                </div>
        `;

        // Render enemy cards
        for (let enemyId in enemies) {
            const enemy = enemies[enemyId];
            const canFight = GameEngine.meetsRequirement(enemy.unlockRequirement);

            // Get type information
            const armorType = enemy.stats.armorType || 'biological';
            const damageType = enemy.stats.damageType || 'pierce';

            // Calculate power level
            const powerScore = (enemy.stats.maxHealth / 10) + (enemy.stats.attackDamage * 5);
            let powerLevel = '';
            let powerColor = '';
            if (powerScore < 50) {
                powerLevel = 'weak';
                powerColor = 'Weak';
            } else if (powerScore < 150) {
                powerLevel = 'moderate';
                powerColor = 'Moderate';
            } else if (powerScore < 300) {
                powerLevel = 'strong';
                powerColor = 'Strong';
            } else {
                powerLevel = 'elite';
                powerColor = 'Elite';
            }

            let disabledReason = "";
            if (!canFight && enemy.unlockRequirement) {
                if (enemy.unlockRequirement.combat) {
                    disabledReason = `Req: Combat ${enemy.unlockRequirement.combat}`;
                }
            }

            html += `
                <div class="enemy-card ${canFight ? 'current-region' : 'disabled'}"
                     ${canFight ? `onclick="startFight('${enemyId}')"` : ''}
                     title="${enemy.description}">
                    <div style="font-size: 2em; margin-bottom: 4px;">${enemy.image}</div>
                    <div style="font-weight: bold; font-size: 0.9em; margin-bottom: 4px; color: #00d9ff;">${enemy.name}</div>
                    ${disabledReason ? `
                        <div style="font-size: 0.7em; color: #f88;">${disabledReason}</div>
                    ` : `
                        <div style="font-size: 0.75em; color: #888; margin-bottom: 4px;">
                            ❤️ ${enemy.stats.maxHealth} | ⚔️ ${enemy.stats.attackDamage}
                        </div>
                        <div class="power-badge ${powerLevel}">${powerColor}</div>
                    `}
                </div>
            `;
        }

        // TODO: Add dungeons section here when dungeons are implemented
        html += `
                <div style="text-align: center; margin: 20px 0 10px 0;">
                    <strong style="font-size: 1.1em; color: #9c27b0;">🏰 Dungeons</strong>
                </div>
                <div style="text-align: center; padding: 20px; color: #888; font-size: 0.85em;">
                    Coming Soon...
                </div>
        `;

        html += `</div>`;
        return html;
    },

    /**
     * Render center column - Active Combat
     */
    renderCenterColumn_ActiveCombat() {
        const combat = GameEngine.state.combat;
        const enemy = combat.currentEnemy;
        const playerStats = GameEngine.getPlayerCombatStats();

        const enemyHealthPercent = (enemy.currentHealth / enemy.maxHealth) * 100;
        const playerHealthPercent = (playerStats.currentHealth / playerStats.maxHealth) * 100;

        // Get enemy definition and type information
        const enemyDef = GameEngine.definitions.enemies[enemy.id];
        const enemyArmorType = enemyDef?.stats?.armorType || 'biological';
        const enemyDamageType = enemyDef?.stats?.damageType || 'pierce';
        const enemyArmorTypeDef = GameEngine.definitions.armorTypes[enemyArmorType];
        const enemyDamageTypeDef = GameEngine.definitions.damageTypes[enemyDamageType];

        // Get active status effects
        const activeEffects = combat.activeEffects || [];
        const statusOverlays = this.getStatusOverlays(activeEffects);
        const statusIcons = this.getStatusIcons(activeEffects);

        let html = `
            <div class="combat-column-center" id="combatColumnCenter">
                <!-- Loot Box (if present) -->
                ${this.renderLootBox()}

                <!-- Health Bars -->
                <div style="background: rgba(42, 42, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 0.85em; color: #888;">You</span>
                            <span style="font-size: 0.85em; font-weight: bold;" id="playerHealthText">${Math.max(0, Math.floor(playerStats.currentHealth))}/${Math.floor(playerStats.maxHealth)}</span>
                        </div>
                        <div class="health-bar">
                            <div class="health-bar-fill" id="playerHealthBar" style="width: ${playerHealthPercent}%; background: linear-gradient(90deg, #27ae60, #229954);"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 0.85em; color: #888;">${enemy.name}</span>
                            <span style="font-size: 0.85em; font-weight: bold;">${Math.max(0, Math.floor(enemy.currentHealth))}/${enemy.maxHealth}</span>
                        </div>
                        <div class="health-bar">
                            <div class="health-bar-fill" style="width: ${enemyHealthPercent}%; background: linear-gradient(90deg, #e74c3c, #c0392b);"></div>
                        </div>
                    </div>
                </div>

                <!-- Combat Visualization (60% height) -->
                <div class="combat-arena" style="flex: 1; min-height: 300px; max-height: 400px;">
                    <!-- Player Side -->
                    <div class="player-side">
                        <div class="player-avatar-container" id="playerAvatarContainer">
                            <div class="player-avatar">🛡️</div>
                            <div class="enemy-health-bar" style="display: none;">
                                <div class="health-fill" style="width: ${playerHealthPercent}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Battlefield Center -->
                    <div class="battlefield-center" id="battlefieldCenter">
                        <div style="margin-top: auto;">
                            <div class="health-bar" style="width: 150px;">
                                <div class="health-bar-fill" id="attackIntervalBar" style="width: 0%; background: linear-gradient(90deg, #f44336, #e91e63); transition: width 0.3s ease-out;"></div>
                                <div class="health-bar-text" id="attackIntervalText" style="font-size: 0.8em;">Ready</div>
                            </div>
                        </div>
                        ${this.renderAmmoAndReload()}
                    </div>

                    <!-- Enemy Side -->
                    <div class="enemy-side">
                        <div class="enemy-avatar-container" id="enemyAvatarContainer">
                            <div class="enemy-avatar">${enemy.image}</div>
                            ${statusOverlays}
                            <div class="status-effects" id="statusEffects">${statusIcons}</div>
                            <div class="enemy-health-bar" style="display: none;">
                                <div class="health-fill" style="width: ${enemyHealthPercent}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="combat-controls">
                    <button class="attack-button" id="attackBtn" onclick="attack()">⚔️ Attack</button>
                    <button onclick="toggleStance()">
                        ${combat.currentStance === "defensive" ? "⚔️ Offensive" : "🛡️ Defensive"}
                    </button>
                    <button onclick="flee()">🏃 Flee</button>
                </div>

                <!-- Collapsible Combat Log -->
                <div class="combat-log-container">
                    <div class="combat-log-header" onclick="toggleCombatLog()">
                        <strong>📜 Combat Log</strong>
                        <span id="combatLogToggle">▼</span>
                    </div>
                    <div class="combat-log expanded" id="combatLog">
                        ${combat.combatLog.map(entry => `<div class="combat-log-entry">${entry.message}</div>`).reverse().join('')}
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render center column - Respawn Timer
     */
    renderCenterColumn_Respawn() {
        const combat = GameEngine.state.combat;
        const enemyId = combat.selectedEnemyId;
        const enemyDef = GameEngine.definitions.enemies[enemyId];
        const combatLog = combat.combatLog;

        // Calculate time remaining
        const now = Date.now();
        const timeSinceDefeat = now - combat.enemyDefeatedAt;
        const timeRemaining = Math.max(0, enemyDef.respawnTime - timeSinceDefeat);
        const secondsRemaining = Math.ceil(timeRemaining / 1000);

        let html = `
            <div class="combat-column-center" id="combatColumnCenter">
                <!-- Loot Box (if present) -->
                ${this.renderLootBox()}

                <div style="text-align: center; padding: 30px; background: #2a2a3a; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">${enemyDef.image}</div>
                    <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">${enemyDef.name}</div>
                    <div style="color: #aaa; margin-bottom: 20px;">Respawning...</div>
                    <div style="font-size: 2em; color: #4a9eff; font-weight: bold;">${secondsRemaining}s</div>
                    <button onclick="flee()" style="margin-top: 20px; padding: 8px 16px; background: #e74c3c; border: 1px solid #c0392b; border-radius: 4px; color: white; cursor: pointer; font-size: 1em;">
                        🏃 Stop Farming
                    </button>
                </div>

                <!-- Collapsible Combat Log -->
                <div class="combat-log-container">
                    <div class="combat-log-header" onclick="toggleCombatLog()">
                        <strong>📜 Combat Log</strong>
                        <span id="combatLogToggle">▼</span>
                    </div>
                    <div class="combat-log expanded" id="combatLog">
        `;

        // Show last 10 log messages
        const recentLogs = combatLog.slice(-10);
        for (let log of recentLogs) {
            html += `<div class="combat-log-entry">${log.message}</div>`;
        }

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render center column - Idle State
     */
    renderCenterColumn_Idle() {
        // Check if there's pending loot
        const hasPendingLoot = GameEngine.state.combat.pendingLoot.length > 0;

        let html = `
            <div class="combat-column-center" id="combatColumnCenter">
                <!-- Loot Box (if present) -->
                ${this.renderLootBox()}

                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; ${hasPendingLoot ? 'flex: 1;' : 'height: 100%;'} text-align: center; padding: 40px; color: #888;">
                    <div style="font-size: 4em; margin-bottom: 20px; opacity: 0.3;">⚔️</div>
                    <div style="font-size: 1.2em; margin-bottom: 10px; color: #aaa;">Select an enemy to begin combat</div>
                    <div style="font-size: 0.9em;">Choose from the list on the left</div>
                </div>
            </div>
        `;

        return html;
    },

    /**
     * Render right column (Equipment & Stats)
     */
    renderRightColumn() {
        const playerStats = GameEngine.getPlayerCombatStats();
        const currentWeight = GameEngine.getTotalEquippedWeight();
        const maxWeight = GameEngine.getMaxEquipmentWeight();
        const attributes = GameEngine.state.combatAttributes;
        const attributeDefs = GameEngine.definitions.combatAttributes;
        const unassignedPoints = GameEngine.state.characterLevel.unassignedAttributePoints;

        // Determine weight color
        let weightColor = "#4a9eff";
        const weightPercent = (currentWeight / maxWeight) * 100;
        if (weightPercent >= 100) {
            weightColor = "#f44336";
        } else if (weightPercent >= 80) {
            weightColor = "#ff9800";
        }

        let html = `
            <div class="combat-column-right" id="combatColumnRight">
                <!-- Compact Equipment -->
                <div class="combat-equipment-compact">
                    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                        <strong style="font-size: 0.9em;">⚔️ Equipment</strong>
                        <div style="font-size: 0.7em; color: ${weightColor}; margin-top: 4px;">
                            ⚖️ ${currentWeight}/${maxWeight}
                        </div>
                    </div>
                    ${EquipmentComponent.render({ mode: 'minimal', showLabels: false, interactive: true })}
                </div>

                <!-- Combat Stats with Attribute Points -->
                <div class="combat-stats-compact">
                    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                        <strong style="font-size: 0.9em;">📊 Combat Stats</strong>
                        ${unassignedPoints > 0 ? `
                            <div style="font-size: 0.7em; color: #ffd700; margin-top: 4px;">
                                📈 ${unassignedPoints} Point${unassignedPoints !== 1 ? 's' : ''}
                            </div>
                        ` : ''}
                    </div>
        `;

        // Render attributes with + buttons
        for (let attrId in attributeDefs) {
            const attrDef = attributeDefs[attrId];
            const attrValue = attributes[attrId];
            const icon = this.getAttributeIcon(attrId);

            html += `
                <div class="stat-row">
                    <span>${icon} ${attrDef.name}</span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <strong style="color: #00d9ff;">${attrValue}</strong>
                        ${unassignedPoints > 0 ? `
                            <button onclick="assignPoint('${attrId}')" style="padding: 2px 8px; background: #27ae60; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 0.8em; font-weight: bold;">+</button>
                        ` : ''}
                    </span>
                </div>
            `;
        }

        html += `
                </div>

                <!-- Equipped Consumables with Quick Use -->
                <div class="combat-stats-compact">
                    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #444;">
                        <strong style="font-size: 0.9em;">🧪 Consumables</strong>
                    </div>
        `;

        // Food
        const equippedFood = GameEngine.state.equipment.food;
        if (equippedFood && GameEngine.state.combat.equippedFoodQuantity > 0) {
            const foodDef = ItemAccessHelper.getItem(equippedFood);
            html += `
                <div class="stat-row">
                    <span>${foodDef.image} ${foodDef.name}</span>
                    <span style="color: #4caf50; font-weight: bold;">${GameEngine.state.combat.equippedFoodQuantity}x</span>
                </div>
            `;
        } else {
            html += `
                <div style="text-align: center; color: #666; font-size: 0.8em; padding: 10px;">
                    No food equipped
                </div>
            `;
        }

        // Ammo (if gun equipped)
        const ammo = GameEngine.state.combat.playerAmmo;
        if (ammo && ammo.magazineSize > 0) {
            const ammoPercent = (ammo.currentAmmo / ammo.magazineSize) * 100;
            const ammoColor = ammoPercent > 30 ? '#4a9eff' : ammoPercent > 0 ? '#ffd43b' : '#f44336';
            html += `
                <div class="stat-row">
                    <span>🔫 Ammo</span>
                    <span style="color: ${ammoColor}; font-weight: bold;">${ammo.currentAmmo}/${ammo.magazineSize}</span>
                </div>
            `;
        }

        html += `
                </div>

                <!-- Stance Indicator -->
                ${this.renderStanceIndicator()}
            </div>
        `;

        return html;
    },

    /**
     * Render mobile tabs
     */
    renderMobileTabs() {
        return `
            <div class="combat-mobile-tabs">
                <button class="combat-mobile-tab" onclick="toggleMobileColumn('left')">
                    <div class="combat-mobile-tab-icon">👹</div>
                    <div class="combat-mobile-tab-label">Enemies</div>
                </button>
                <button class="combat-mobile-tab" onclick="toggleMobileColumn('center')" style="display: none;">
                    <div class="combat-mobile-tab-icon">⚔️</div>
                    <div class="combat-mobile-tab-label">Combat</div>
                </button>
                <button class="combat-mobile-tab" onclick="toggleMobileColumn('right')">
                    <div class="combat-mobile-tab-icon">📊</div>
                    <div class="combat-mobile-tab-label">Gear</div>
                </button>
            </div>
        `;
    }
};
