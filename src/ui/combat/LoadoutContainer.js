/**
 * LOADOUT CONTAINER
 *
 * Equipment and stats display for combat loadout
 * Uses crafting-style UI patterns (cards, sections)
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
     * Render equipment grid (card-based sections)
     */
    renderEquipmentGrid(player) {
        const equipment = player.equipment || {};

        return `
            <div class="loadout-equipment">
                <!-- Core Equipment Card -->
                <div class="loadout-section-card">
                    <div class="loadout-section-header">
                        <span class="section-icon">🎽</span>
                        <span class="section-title">Equipment</span>
                    </div>
                    <div class="loadout-section-content">
                        <div class="equipment-slots-grid">
                            ${this.renderEquipmentSlot('weapon', equipment.weapon, '⚔️')}
                            ${this.renderEquipmentSlot('armor', equipment.armor, '🛡️')}
                            ${this.renderEquipmentSlot('back', equipment.back, '🎒')}
                            ${this.renderEquipmentSlot('gloves', equipment.gloves, '🧤')}
                            ${this.renderEquipmentSlot('neck', equipment.neck, '📿')}
                            ${this.renderEquipmentSlot('boots', equipment.boots, '👢')}
                            ${this.renderEquipmentSlot('ring', equipment.ring, '💍')}
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
                        <div class="consumable-slots-grid">
                            ${this.renderConsumableSlot('ammo', equipment.ammo, '🎯', player.combat?.playerAmmo?.currentAmmo)}
                            ${this.renderConsumableSlot('food', equipment.food, '🍖', player.combat?.equippedFoodQuantity)}
                            ${this.renderConsumableSlot('potion', equipment.potion, '⚗️', null)}
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
                        <div class="tech-slots-grid">
                            ${this.renderTechSlot('tech1', equipment.tech1, 0)}
                            ${this.renderTechSlot('tech2', equipment.tech2, 3)}
                            ${this.renderTechSlot('tech3', equipment.tech3, 6)}
                            ${this.renderTechSlot('tech4', equipment.tech4, 9)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render equipment slot (card-based style)
     * @param {string} slotId - The slot identifier
     * @param {string|object|null} item - Instance ID string, item object, or null
     * @param {string} defaultIcon - Default icon if slot empty
     */
    renderEquipmentSlot(slotId, item, defaultIcon) {
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
        const itemId = typeof item === 'string' ? item : (item.instanceId || item.itemId || item);

        // Use ItemIdUtils to resolve instance ID to item definition
        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this.renderEquipmentSlot(slotId, null, defaultIcon);
        }

        const rarityClass = itemDef.rarity ? `rarity-${itemDef.rarity}` : '';

        return `
            <div class="loadout-slot filled ${rarityClass}" data-slot="${slotId}" onclick="ItemModal.open('${itemId}')">
                <div class="slot-icon-container">
                    <span class="slot-icon">${itemDef.icon || defaultIcon}</span>
                </div>
                <div class="slot-info">
                    <span class="slot-name">${itemDef.name}</span>
                    ${this.renderItemStats(itemDef)}
                </div>
            </div>
        `;
    },

    /**
     * Render consumable slot (card-based style)
     * @param {string} slotId - The slot identifier
     * @param {string|object|null} item - Instance ID string, item object, or null
     * @param {string} defaultIcon - Default icon if slot empty
     * @param {number|null} quantity - Override quantity to display
     */
    renderConsumableSlot(slotId, item, defaultIcon, quantity) {
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
        const itemId = typeof item === 'string' ? item : (item.instanceId || item.itemId || item);

        // Use ItemIdUtils to resolve instance ID to item definition
        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this.renderConsumableSlot(slotId, null, defaultIcon, null);
        }

        // Get quantity from item object if it exists
        const itemQuantity = typeof item === 'object' ? (item.quantity || 0) : 0;
        const displayQuantity = quantity !== null && quantity !== undefined ? quantity : itemQuantity;

        return `
            <div class="loadout-slot consumable filled" data-slot="${slotId}" onclick="ItemModal.open('${itemId}')">
                <div class="slot-icon-container">
                    <span class="slot-icon">${itemDef.icon || defaultIcon}</span>
                    <span class="slot-quantity">x${displayQuantity}</span>
                </div>
                <div class="slot-info">
                    <span class="slot-name">${itemDef.name}</span>
                </div>
            </div>
        `;
    },

    /**
     * Render technology slot (card-based style)
     */
    renderTechSlot(slotId, item, requiredInt) {
        const player = GameEngine.state;
        const intellect = player.combatAttributes?.intellect || player.attributes?.intellect || 0;
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
        const itemId = typeof item === 'string' ? item : (item.instanceId || item.itemId || item);

        // Use ItemIdUtils to resolve instance ID to item definition
        const itemDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(itemId)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null);

        if (!itemDef) {
            return this.renderTechSlot(slotId, null, requiredInt);
        }

        return `
            <div class="loadout-slot tech filled" data-slot="${slotId}" onclick="ItemModal.open('${itemId}')">
                <div class="slot-icon-container">
                    <span class="slot-icon">${itemDef.icon || '⚡'}</span>
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
        const damage = compiledStats.damage;
        const defense = compiledStats.defense;
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
            const itemId = typeof slotValue === 'string' ? slotValue : (slotValue.instanceId || slotValue.itemId || slotValue);
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
                    const quantity = typeof equipment[slot] === 'object' ? (equipment[slot].quantity || 1) : 1;
                    consumablesWeight += itemDef.weight * quantity;
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
