/**
 * LOADOUT CONTAINER
 *
 * Equipment and stats display for combat loadout
 * Uses crafting-style UI patterns (cards, sections)
 *
 * Updated: 2025-12-06 - Now uses LoadoutSlotRenderer for consistent styling
 */

const LoadoutContainer = {
    /**
     * Render loadout container
     */
    render() {
        const player = GameEngine.state;
        const compiledStats = this.compilePlayerStats(player);

        return `
            <div class="loadout-container">
                <div class="loadout-main">
                    ${this.renderEquipmentGrid(player)}
                </div>
                <div class="loadout-sidebar">
                    ${this.renderStatsPanel(player, compiledStats)}
                </div>
            </div>
        `;
    },

    /**
     * Vertical carry-weight bar shown to the right of the loadout: fill = current
     * equipped weight, full track = the Strength-driven threshold (10 + Str/2).
     * Turns red and shows the graduated slow-down when over the threshold.
     */
    renderWeightBar(player) {
        const weight = this.calculateWeight(player).total;
        const limit = (typeof CombatTimers !== 'undefined')
            ? CombatTimers.getStateWeightLimit(player)
            : (10 + ((player.combatAttributes?.strength || 0) / 2));
        const ow = (typeof CombatTimers !== 'undefined')
            ? CombatTimers.calculateOverweightPenalty(weight, limit)
            : { overweight: false, penalty: 1 };

        const pct = limit > 0 ? Math.max(0, Math.min(100, (weight / limit) * 100)) : 0;
        const slowPct = Math.round((ow.penalty - 1) * 100);

        return `
            <div class="loadout-weight ${ow.overweight ? 'is-over' : ''}" title="Carry weight ${weight.toFixed(1)} / threshold ${limit.toFixed(1)}">
                <div class="loadout-weight-cap">⚖️</div>
                <div class="loadout-weight-track">
                    <div class="loadout-weight-fill" style="height:${pct}%"></div>
                </div>
                <div class="loadout-weight-readout">${weight.toFixed(1)}<span class="loadout-weight-sep">/</span>${limit.toFixed(1)}</div>
                ${ow.overweight ? `<div class="loadout-weight-warn">−${slowPct}%<br>speed</div>` : ''}
            </div>
        `;
    },

    /**
     * Render equipment grid (3-1-3 format: Left 3 slots | Middle 1 tall armor | Right 3 slots)
     * Uses LoadoutSlotRenderer if available for unified styling
     */
    renderEquipmentGrid(player) {
        const equipment = player.equipment || {};
        const attrs = player.combatAttributes || {};
        const intellect = attrs.intellect || 0;

        // Use LoadoutSlotRenderer if available
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        if (renderer) {
            // Get food and ammo quantities for display
            const foodQuantity = player.combat?.equippedFoodQuantity;
            const ammoQuantity = player.combat?.playerAmmo?.currentAmmo;

            return `
                <div class="loadout-equipment">
                    <!-- Core Equipment Card (3-1-3 Layout) -->
                    <div class="loadout-section-card">
                        <div class="loadout-section-header">
                            <span class="section-icon">🎽</span>
                            <span class="section-title">Equipment</span>
                        </div>
                        <div class="loadout-section-content unified-slots--compact">
                            ${renderer.renderEquipmentGrid({
                                equipment,
                                size: 'auto',
                                showNames: false,
                                showStats: false,
                                interactive: true
                            })}
                        </div>
                    </div>

                    <!-- Consumables Card -->
                    <div class="loadout-section-card">
                        <div class="loadout-section-header">
                            <span class="section-icon">🍖</span>
                            <span class="section-title">Consumables</span>
                        </div>
                        <div class="loadout-section-content unified-slots--compact">
                            ${renderer.renderConsumablesRow({
                                equipment,
                                foodQuantity,
                                ammoQuantity,
                                interactive: true,
                                onSlotClick: (slot) => slot === 'food'
                                    ? 'openFoodEquipModal(event)'
                                    : `openEquipModal('${slot}', event)`
                            })}
                        </div>
                    </div>

                    <!-- Technology Card -->
                    <div class="loadout-section-card">
                        <div class="loadout-section-header">
                            <span class="section-icon">⚡</span>
                            <span class="section-title">Technology</span>
                        </div>
                        <div class="loadout-section-content unified-slots--compact">
                            ${renderer.renderTechRow({
                                equipment,
                                intellect,
                                interactive: true
                            })}
                        </div>
                    </div>
                </div>
            `;
        }

        // Legacy fallback if LoadoutSlotRenderer not available
        return this._renderEquipmentGridLegacy(player, equipment, intellect);
    },

    /**
     * Legacy equipment grid rendering (fallback)
     */
    _renderEquipmentGridLegacy(player, equipment, intellect) {
        return `
            <div class="loadout-equipment">
                <!-- Core Equipment Card (3-1-3 Layout) -->
                <div class="loadout-section-card">
                    <div class="loadout-section-header">
                        <span class="section-icon">🎽</span>
                        <span class="section-title">Equipment</span>
                    </div>
                    <div class="loadout-section-content">
                        <div class="combat-loadout-grid">
                            <!-- Left Column: Weapon, Gloves, Boots (3 slots) -->
                            <div class="loadout-column">
                                ${this._renderEquipmentSlotLegacy('weapon', equipment.weapon, '⚔️')}
                                ${this._renderEquipmentSlotLegacy('gloves', equipment.gloves, '🧤')}
                                ${this._renderEquipmentSlotLegacy('boots', equipment.boots, '👢')}
                            </div>
                            <!-- Middle Column: Armor Set (1 tall slot) -->
                            <div class="loadout-column loadout-column--armor">
                                ${this._renderArmorSlotLegacy(equipment.armor)}
                            </div>
                            <!-- Right Column: Back, Neck, Ring (3 slots) -->
                            <div class="loadout-column">
                                ${this._renderEquipmentSlotLegacy('back', equipment.back, '🎒')}
                                ${this._renderEquipmentSlotLegacy('neck', equipment.neck, '📿')}
                                ${this._renderEquipmentSlotLegacy('ring', equipment.ring, '💍')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Consumables Card -->
                <div class="loadout-section-card">
                    <div class="loadout-section-header">
                        <span class="section-icon">🍖</span>
                        <span class="section-title">Consumables</span>
                    </div>
                    <div class="loadout-section-content">
                        <div class="consumables-row">
                            ${this._renderConsumableSlotLegacy('food', equipment.food, '🍖', player.combat?.equippedFoodQuantity)}
                            ${this._renderConsumableSlotLegacy('potion', equipment.potion, '🧪', null)}
                            ${this._renderConsumableSlotLegacy('ammo', equipment.ammo, '🎯', player.combat?.playerAmmo?.currentAmmo)}
                        </div>
                    </div>
                </div>

                <!-- Technology Card -->
                <div class="loadout-section-card">
                    <div class="loadout-section-header">
                        <span class="section-icon">⚡</span>
                        <span class="section-title">Technology</span>
                    </div>
                    <div class="loadout-section-content">
                        <div class="tech-row">
                            ${this._renderTechSlotLegacy('tech1', equipment.tech1, 0, intellect)}
                            ${this._renderTechSlotLegacy('tech2', equipment.tech2, 3, intellect)}
                            ${this._renderTechSlotLegacy('tech3', equipment.tech3, 6, intellect)}
                            ${this._renderTechSlotLegacy('tech4', equipment.tech4, 9, intellect)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Legacy: Render tall armor slot (fills middle column)
     * @param {string|object|null} item - Instance ID string, item object, or null
     */
    _renderArmorSlotLegacy(item) {
        if (!item) {
            return `
                <div class="loadout-slot loadout-slot--armor empty" data-slot="armor">
                    <div class="slot-icon-container">
                        <span class="slot-icon">🛡️</span>
                    </div>
                    <div class="slot-info">
                        <span class="slot-label">Armor Set</span>
                        <span class="slot-status">Empty</span>
                    </div>
                </div>
            `;
        }

        const itemId = typeof item === 'string' ? item : (item.id || item.instanceId || item.itemId || item);

        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this.renderArmorSlot(null);
        }

        // Get rarity from instance if available, otherwise from item definition
        const instancedItem = GameEngine.state.bank?.instanced?.[itemId];
        const rarity = instancedItem?.rarity || itemDef.rarity || 'common';
        const rarityData = GameEngine.definitions?.RARITY_TIERS?.[rarity] || { color: '#9e9e9e' };
        const rarityColor = rarityData.color;
        const hasGlow = rarityData.glow;

        return `
            <div class="loadout-slot loadout-slot--armor filled rarity-${rarity} ${hasGlow ? 'loadout-slot--glow' : ''}"
                 data-slot="armor"
                 onclick="ItemModal.open('${itemId}')"
                 style="--rarity-color: ${rarityColor};">
                <div class="slot-icon-container">
                    ${this._getIconHTML(itemDef, 48, '🛡️')}
                </div>
                <div class="slot-info">
                    <span class="slot-name">${itemDef.name}</span>
                    <span class="slot-rarity" style="color: ${rarityColor};">${this.capitalizeFirst(rarity)}</span>
                    ${this.renderItemStats(itemDef)}
                </div>
            </div>
        `;
    },

    /**
     * Legacy: Render equipment slot (card-based style)
     * @param {string} slotId - The slot identifier
     * @param {string|object|null} item - Instance ID string, item object, or null
     * @param {string} defaultIcon - Default icon if slot empty
     */
    _renderEquipmentSlotLegacy(slotId, item, defaultIcon) {
        const slotName = this.capitalizeFirst(slotId);

        if (!item) {
            return `
                <div class="loadout-slot empty" data-slot="${slotId}">
                    <div class="slot-icon-container">
                        <span class="slot-icon">${defaultIcon}</span>
                    </div>
                    <div class="slot-info">
                        <span class="slot-label">${slotName}</span>
                        <span class="slot-status">Empty</span>
                    </div>
                </div>
            `;
        }

        // Handle both string instance IDs and object formats
        // Compiled objects have 'id', other objects may have 'instanceId' or 'itemId'
        const itemId = typeof item === 'string' ? item : (item.id || item.instanceId || item.itemId || item);

        // Use ItemIdUtils to resolve instance ID to item definition
        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this.renderEquipmentSlot(slotId, null, defaultIcon);
        }

        // Get rarity from instance if available, otherwise from item definition
        const instancedItem = GameEngine.state.bank?.instanced?.[itemId];
        const rarity = instancedItem?.rarity || itemDef.rarity || 'common';
        const rarityData = GameEngine.definitions?.RARITY_TIERS?.[rarity] || { color: '#9e9e9e' };
        const rarityColor = rarityData.color;
        const hasGlow = rarityData.glow;

        return `
            <div class="loadout-slot filled rarity-${rarity} ${hasGlow ? 'loadout-slot--glow' : ''}"
                 data-slot="${slotId}"
                 onclick="ItemModal.open('${itemId}')"
                 style="--rarity-color: ${rarityColor};">
                <div class="slot-icon-container">
                    ${this._getIconHTML(itemDef, 32, defaultIcon)}
                </div>
                <div class="slot-info">
                    <span class="slot-name">${itemDef.name}</span>
                    <span class="slot-rarity" style="color: ${rarityColor};">${this.capitalizeFirst(rarity)}</span>
                    ${this.renderItemStats(itemDef)}
                </div>
            </div>
        `;
    },

    /**
     * Legacy: Render consumable slot (card-based style)
     * @param {string} slotId - The slot identifier
     * @param {string|object|null} item - Instance ID string, item object, or null
     * @param {string} defaultIcon - Default icon if slot empty
     * @param {number|null} quantity - Override quantity to display
     */
    _renderConsumableSlotLegacy(slotId, item, defaultIcon, quantity) {
        const slotName = this.capitalizeFirst(slotId);

        if (!item) {
            return `
                <div class="loadout-slot consumable empty" data-slot="${slotId}">
                    <div class="slot-icon-container">
                        <span class="slot-icon">${defaultIcon}</span>
                    </div>
                    <div class="slot-info">
                        <span class="slot-label">${slotName}</span>
                        <span class="slot-status">Empty</span>
                    </div>
                </div>
            `;
        }

        // Handle both string instance IDs and object formats
        // Compiled food objects have 'id', other objects may have 'instanceId' or 'itemId'
        const itemId = typeof item === 'string' ? item : (item.id || item.instanceId || item.itemId || item);

        // Use ItemIdUtils to resolve instance ID to item definition
        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this.renderConsumableSlot(slotId, null, defaultIcon, null);
        }

        // Get quantity from item object if it exists
        // Compiled food objects use 'quantity' directly
        const itemQuantity = typeof item === 'object' ? (item.quantity || 0) : 0;
        const displayQuantity = quantity !== null && quantity !== undefined ? quantity : itemQuantity;

        return `
            <div class="loadout-slot consumable filled" data-slot="${slotId}" onclick="ItemModal.open('${itemId}')">
                <div class="slot-icon-container">
                    ${this._getIconHTML(itemDef, 32, defaultIcon)}
                    <span class="slot-quantity">x${displayQuantity}</span>
                </div>
                <div class="slot-info">
                    <span class="slot-name">${itemDef.name}</span>
                </div>
            </div>
        `;
    },

    /**
     * Legacy: Render technology slot (card-based style)
     */
    _renderTechSlotLegacy(slotId, item, requiredInt, currentInt = null) {
        const player = GameEngine.state;
        const intellect = currentInt !== null ? currentInt : (player.combatAttributes?.intellect || player.attributes?.intellect || 0);
        const isLocked = intellect < requiredInt;
        const slotNumber = slotId.replace('tech', '');

        if (isLocked) {
            return `
                <div class="loadout-slot tech locked" data-slot="${slotId}">
                    <div class="slot-icon-container">
                        <span class="slot-icon">🔒</span>
                    </div>
                    <div class="slot-info">
                        <span class="slot-label">Tech ${slotNumber}</span>
                        <span class="slot-requirement">Req. ${requiredInt} INT</span>
                    </div>
                </div>
            `;
        }

        if (!item) {
            return `
                <div class="loadout-slot tech empty" data-slot="${slotId}">
                    <div class="slot-icon-container">
                        <span class="slot-icon">⚡</span>
                    </div>
                    <div class="slot-info">
                        <span class="slot-label">Tech ${slotNumber}</span>
                        <span class="slot-status">Empty</span>
                    </div>
                </div>
            `;
        }

        // Handle both string instance IDs and object formats
        // Compiled objects have 'id', other objects may have 'instanceId' or 'itemId'
        const itemId = typeof item === 'string' ? item : (item.id || item.instanceId || item.itemId || item);

        // Use ItemIdUtils to resolve instance ID to item definition
        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this._renderTechSlotLegacy(slotId, null, requiredInt);
        }

        return `
            <div class="loadout-slot tech filled" data-slot="${slotId}" onclick="ItemModal.open('${itemId}')">
                <div class="slot-icon-container">
                    ${this._getIconHTML(itemDef, 32, '⚡')}
                </div>
                <div class="slot-info">
                    <span class="slot-name">${itemDef.name}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render item stats (mini preview)
     */
    renderItemStats(itemDef) {
        const stats = [];

        // Armor
        if (itemDef.stats?.defense?.armorRating) {
            stats.push(`${itemDef.stats.defense.armorRating} ARM`);
        }

        // Damage
        if (itemDef.stats?.damage?.minDamage && itemDef.stats?.damage?.maxDamage) {
            stats.push(`${itemDef.stats.damage.minDamage}-${itemDef.stats.damage.maxDamage} DMG`);
        }

        // Weight
        if (itemDef.weight) {
            stats.push(`${itemDef.weight}kg`);
        }

        if (stats.length === 0) return '';

        return `<span class="slot-mini-stats">${stats.join(' | ')}</span>`;
    },

    /**
     * Render stats panel (card-based sidebar)
     */
    renderStatsPanel(player, compiledStats) {
        const damage = compiledStats?.damage || { minDamage: 0, maxDamage: 0, accuracy: 0, critRating: 0, ratings: {} };
        const defense = compiledStats?.defense || { evasion: 0, armorRating: 0, damageReduction: 0, ratings: {} };
        const weight = this.calculateWeight(player);
        const weightLimit = typeof CombatTimers !== 'undefined'
            ? CombatTimers.calculateWeightLimit(player)
            : 50;
        const overweightData = typeof CombatTimers !== 'undefined'
            ? CombatTimers.calculateOverweightPenalty(weight.total, weightLimit)
            : { overweight: false };

        return `
            <div class="stats-sidebar">
                <!-- Offense Card -->
                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-icon">⚔️</span>
                        <span class="stats-title">Offense</span>
                    </div>
                    <div class="stats-card-content">
                        <div class="stat-row">
                            <span class="stat-label">Damage</span>
                            <span class="stat-value">${damage.minDamage}-${damage.maxDamage}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Accuracy</span>
                            <span class="stat-value">${damage.accuracy}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Crit Rating</span>
                            <span class="stat-value">${damage.critRating}</span>
                        </div>
                        ${this.renderDamageTypeBreakdown(damage.ratings)}
                    </div>
                </div>

                <!-- Defense Card -->
                <div class="stats-card">
                    <div class="stats-card-header">
                        <span class="stats-icon">🛡️</span>
                        <span class="stats-title">Defense</span>
                    </div>
                    <div class="stats-card-content">
                        <div class="stat-row">
                            <span class="stat-label">Armor</span>
                            <span class="stat-value">${defense.armorRating}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">Evasion</span>
                            <span class="stat-value">${defense.evasion}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">DR</span>
                            <span class="stat-value">${(defense.damageReduction * 100).toFixed(1)}%</span>
                        </div>
                        ${this.renderArmorTypeBreakdown(defense.ratings)}
                    </div>
                </div>

                <!-- Weight Card -->
                <div class="stats-card ${overweightData.overweight ? 'warning' : ''}">
                    <div class="stats-card-header">
                        <span class="stats-icon">⚖️</span>
                        <span class="stats-title">Weight</span>
                    </div>
                    <div class="stats-card-content">
                        <div class="stat-row ${overweightData.overweight ? 'stat-warning' : ''}">
                            <span class="stat-label">Current</span>
                            <span class="stat-value">${weight.total.toFixed(1)} / ${weightLimit.toFixed(1)} kg</span>
                        </div>
                        ${overweightData.overweight ? `
                            <div class="stat-row stat-warning">
                                <span class="stat-label">Penalty</span>
                                <span class="stat-value">${overweightData.penalty.toFixed(2)}×</span>
                            </div>
                            <div class="stat-warning-message">${overweightData.message}</div>
                        ` : ''}
                        ${this.renderWeightBreakdown(weight)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render damage type breakdown
     */
    renderDamageTypeBreakdown(ratings) {
        const types = ['pierce', 'explosive', 'cryo', 'shock', 'incendiary'];
        const total = types.reduce((sum, type) => sum + (ratings[type] || 0), 0);

        if (total === 0) {
            return `<div class="type-breakdown">No damage types</div>`;
        }

        const typeIcons = {
            pierce: '⚡',
            explosive: '💥',
            cryo: '❄️',
            shock: '⚡',
            incendiary: '🔥'
        };

        const breakdown = types
            .filter(type => ratings[type] > 0)
            .map(type => {
                const percent = (ratings[type] / total * 100).toFixed(0);
                return `
                    <div class="type-bar">
                        <div class="type-bar-label">
                            <span>${typeIcons[type]} ${this.capitalizeFirst(type)}</span>
                            <span>${percent}%</span>
                        </div>
                        <div class="type-bar-fill" style="width: ${percent}%"></div>
                    </div>
                `;
            })
            .join('');

        return `<div class="type-breakdown">${breakdown}</div>`;
    },

    /**
     * Render armor type breakdown
     */
    renderArmorTypeBreakdown(ratings) {
        const types = ['insulated', 'plated', 'airborne', 'droid', 'biological'];
        const total = types.reduce((sum, type) => sum + (ratings[type] || 0), 0);

        if (total === 0) {
            return `<div class="type-breakdown">No armor types</div>`;
        }

        const typeIcons = {
            insulated: '🛡️',
            plated: '🛡️',
            airborne: '💨',
            droid: '🤖',
            biological: '🧬'
        };

        const breakdown = types
            .filter(type => ratings[type] > 0)
            .map(type => {
                const percent = (ratings[type] / total * 100).toFixed(0);
                return `
                    <div class="type-bar">
                        <div class="type-bar-label">
                            <span>${typeIcons[type]} ${this.capitalizeFirst(type)}</span>
                            <span>${percent}%</span>
                        </div>
                        <div class="type-bar-fill" style="width: ${percent}%"></div>
                    </div>
                `;
            })
            .join('');

        return `<div class="type-breakdown">${breakdown}</div>`;
    },

    /**
     * Render weight breakdown
     */
    renderWeightBreakdown(weight) {
        return `
            <div class="weight-breakdown">
                <div class="weight-item">
                    <span>Equipment:</span>
                    <span>${weight.equipment.toFixed(1)} kg</span>
                </div>
                <div class="weight-item">
                    <span>Consumables:</span>
                    <span>${weight.consumables.toFixed(1)} kg</span>
                </div>
                <div class="weight-item">
                    <span>Technology:</span>
                    <span>${weight.technology.toFixed(1)} kg</span>
                </div>
            </div>
        `;
    },

    /**
     * Calculate current weight
     * Handles both string instance IDs and object formats in equipment slots
     */
    calculateWeight(player) {
        const equipment = player.equipment || {};
        let equipmentWeight = 0;
        let consumablesWeight = 0;
        let technologyWeight = 0;

        // Helper to get item definition from slot value (string or object)
        const getItemDefFromSlot = (slotValue) => {
            if (!slotValue) return null;
            // Compiled objects have 'id', other objects may have 'instanceId' or 'itemId'
            const itemId = typeof slotValue === 'string' ? slotValue : (slotValue.id || slotValue.instanceId || slotValue.itemId || slotValue);
            return typeof ItemIdUtils !== 'undefined'
                ? ItemIdUtils.getItemDefinition(itemId)
                : ItemRegistry.getItem(itemId);
        };

        // Equipment slots (3-1-3 Grid)
        const equipmentSlots = ['weapon', 'armor', 'back', 'gloves', 'neck', 'boots', 'ring'];
        for (const slot of equipmentSlots) {
            if (equipment[slot]) {
                const itemDef = getItemDefFromSlot(equipment[slot]);
                if (itemDef && itemDef.weight) {
                    equipmentWeight += itemDef.weight;
                }
            }
        }

        // Consumable slots
        const consumableSlots = ['ammo', 'food', 'potion'];
        for (const slot of consumableSlots) {
            if (equipment[slot]) {
                const itemDef = getItemDefFromSlot(equipment[slot]);
                if (itemDef && itemDef.weight) {
                    // Flat weight per equipped stack, never × quantity (a 70-arrow stack
                    // weighs the same 1 as a single arrow).
                    consumablesWeight += itemDef.weight;
                }
            }
        }

        // Technology slots
        const techSlots = ['tech1', 'tech2', 'tech3', 'tech4'];
        for (const slot of techSlots) {
            if (equipment[slot]) {
                const itemDef = getItemDefFromSlot(equipment[slot]);
                if (itemDef && itemDef.weight) {
                    technologyWeight += itemDef.weight;
                }
            }
        }

        return {
            equipment: equipmentWeight,
            consumables: consumablesWeight,
            technology: technologyWeight,
            total: equipmentWeight + consumablesWeight + technologyWeight
        };
    },

    /**
     * Compile player stats (simplified for display)
     */
    compilePlayerStats(player) {
        // Use combat system's compilation if available
        if (typeof CombatSystem !== 'undefined' && CombatSystem.compilePlayerStats) {
            CombatSystem.compilePlayerStats(player);
            // Return the compiled stats that were set on the player
            if (player.compiledStats) {
                return player.compiledStats;
            }
        }

        // Fallback basic compilation
        return {
            damage: {
                minDamage: 1,
                maxDamage: 5,
                accuracy: 50,
                critRating: 5,
                ratings: { pierce: 100 }
            },
            defense: {
                armorRating: 0,
                evasion: 0,
                damageReduction: 0,
                ratings: { plated: 100 }
            }
        };
    },

    /**
     * Get icon HTML using IconHelper (FIX: properly renders PNG icons)
     * @param {Object} itemDef - Item definition
     * @param {number} size - Icon size in pixels
     * @param {string} fallbackEmoji - Emoji to use if no icon available
     * @returns {string} HTML for the icon
     */
    _getIconHTML(itemDef, size, fallbackEmoji) {
        // Use IconHelper if available - THIS FIXES THE ICON BUG
        if (typeof IconHelper !== 'undefined' && IconHelper.getItemIconHTML) {
            return IconHelper.getItemIconHTML(itemDef, {
                size: size,
                className: 'slot-item-icon'
            });
        }

        // Fallback: Check if icon is a PNG path
        const icon = itemDef?.icon;
        if (icon && (icon.endsWith('.png') || icon.endsWith('.jpg') || icon.startsWith('assets/'))) {
            return `<img src="${icon}" alt="${itemDef.name || ''}" class="slot-item-icon" style="width: ${size}px; height: ${size}px; object-fit: contain;">`;
        }

        // Final fallback: emoji
        return `<span class="slot-icon">${icon || fallbackEmoji}</span>`;
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
    module.exports = LoadoutContainer;
}
