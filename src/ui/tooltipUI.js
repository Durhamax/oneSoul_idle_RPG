/**
 * TOOLTIP UI
 *
 * Generates detailed tooltips for items based on their type.
 * Handles stat display, comparisons, and formatting.
 */

const TooltipUI = {
    /**
     * Generate full tooltip HTML for an item
     */
    generateTooltip(item, compareItem = null) {
        if (!item) return '';

        let html = `
            <div class="item-tooltip" style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid ${item.getRarityColor()};
                border-radius: 8px;
                padding: 12px;
                min-width: 250px;
                max-width: 350px;
                color: #ffffff;
                font-size: 0.9em;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            ">
        `;

        // Header
        html += this.generateHeader(item);

        // Type-specific stats
        html += this.generateTypeSpecificStats(item, compareItem);

        // Common stats
        html += this.generateCommonStats(item, compareItem);

        // Sockets
        if (item.socketSlots > 0) {
            html += this.generateSocketInfo(item);
        }

        // Effects
        if (item.effects && item.effects.length > 0) {
            html += this.generateEffects(item);
        }

        // Lore
        if (item.lore) {
            html += this.generateLore(item);
        }

        // Footer info
        html += this.generateFooter(item);

        html += `</div>`;
        return html;
    },

    /**
     * Generate tooltip header
     */
    generateHeader(item) {
        let html = `
            <div style="border-bottom: 1px solid ${item.getRarityColor()}; padding-bottom: 8px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 1.5em;">${item.icon}</span>
                    <div style="flex: 1;">
                        <div style="color: ${item.getRarityColor()}; font-weight: bold; font-size: 1.1em;">
                            ${item.name}
                        </div>
                        <div style="color: #aaa; font-size: 0.85em;">
                            ${item.getRarityName()} ${item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}
                        </div>
                    </div>
                </div>
        `;

        // Quality indicator
        if (item.quality !== 1.0) {
            const qualityColor = item.quality > 1.0 ? '#4CAF50' : '#f44336';
            html += `
                <div style="color: ${qualityColor}; font-size: 0.85em; font-style: italic;">
                    ${item.qualityName} Quality (${Math.round(item.quality * 100)}%)
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    /**
     * Generate type-specific stats
     */
    generateTypeSpecificStats(item, compareItem) {
        switch (item.itemType) {
            case 'weapon':
                return this.generateWeaponStats(item, compareItem);
            case 'armor':
                return this.generateArmorStats(item, compareItem);
            case 'tool':
                return this.generateToolStats(item, compareItem);
            case 'resource':
                return this.generateResourceStats(item);
            case 'technology':
                return this.generateTechnologyStats(item);
            case 'mod':
                return this.generateModStats(item);
            case 'healing':
                return this.generateHealingStats(item);
            case 'consumable':
                return this.generateConsumableStats(item);
            case 'perk':
                return this.generatePerkStats(item);
            case 'quest':
                return this.generateQuestStats(item);
            default:
                return '';
        }
    },

    /**
     * Generate weapon-specific stats
     */
    generateWeaponStats(item, compareItem) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('⚔️ Damage', item.getDamage(), compareItem?.getDamage());
        html += this.statLine('⚡ Attack Speed', item.attackSpeed.toFixed(2), compareItem?.attackSpeed);
        html += this.statLine('💥 DPS', item.getDPS().toFixed(1), compareItem?.getDPS());
        html += this.statLine('🎯 Crit Chance', `${item.getCritChance().toFixed(1)}%`, compareItem?.getCritChance());
        html += this.statLine('🔥 Damage Type', item.damageType);
        html += this.statLine('📏 Range', item.range);
        html += this.statLine('📊 Scales with', item.scalingStat);

        if (item.durability !== undefined) {
            const durPct = (item.durability / item.maxDurability * 100).toFixed(0);
            const durColor = durPct > 50 ? '#4CAF50' : durPct > 25 ? '#FFC107' : '#f44336';
            html += `<div style="color: ${durColor}; margin: 4px 0;">
                🔧 Durability: ${item.durability}/${item.maxDurability} (${durPct}%)
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate armor-specific stats
     */
    generateArmorStats(item, compareItem) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('🛡️ Defense', item.getDefense(), compareItem?.getDefense());
        html += this.statLine('📍 Slot', item.slot);

        // Resistances
        const resistances = ['physical', 'magic', 'fire', 'ice', 'lightning', 'poison'];
        const hasResistances = resistances.some(r => item.resistance[r] > 0);

        if (hasResistances) {
            html += '<div style="margin-top: 6px; color: #aaa; font-size: 0.9em;">Resistances:</div>';
            for (let resist of resistances) {
                const value = item.getResistance(resist);
                if (value > 0) {
                    const compareValue = compareItem?.getResistance(resist);
                    html += this.statLine(`  ${resist}`, `${value}%`, compareValue);
                }
            }
        }

        if (item.setBonus) {
            html += `<div style="color: #4CAF50; margin-top: 6px;">
                ✨ Set: ${item.setBonus}
            </div>`;
        }

        if (item.durability !== undefined) {
            const durPct = (item.durability / item.maxDurability * 100).toFixed(0);
            const durColor = durPct > 50 ? '#4CAF50' : durPct > 25 ? '#FFC107' : '#f44336';
            html += `<div style="color: ${durColor}; margin: 4px 0;">
                🔧 Durability: ${item.durability}/${item.maxDurability} (${durPct}%)
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate tool-specific stats
     */
    generateToolStats(item, compareItem) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('⚙️ Efficiency', `${(item.getEfficiency() * 100).toFixed(0)}%`,
            compareItem?.getEfficiency() ? (compareItem.getEfficiency() * 100).toFixed(0) : null);
        html += this.statLine('🎯 Skill Type', item.skillType);
        html += this.statLine('⭐ Tier', item.tier, compareItem?.tier);

        if (item.bonusYield > 0) {
            html += this.statLine('➕ Bonus Yield', `+${item.bonusYield}%`);
        }

        const durPct = item.getDurabilityPercent().toFixed(0);
        const durColor = durPct > 50 ? '#4CAF50' : durPct > 25 ? '#FFC107' : '#f44336';
        html += `<div style="color: ${durColor}; margin: 4px 0;">
            🔧 Durability: ${item.durability}/${item.maxDurability} (${durPct}%)
        </div>`;

        if (item.isBroken()) {
            html += `<div style="color: #f44336; font-weight: bold; margin: 4px 0;">
                ⚠️ BROKEN - Repair Required
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate resource-specific stats
     */
    generateResourceStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('⛏️ Source', item.harvestSource);
        html += this.statLine('📦 Base Yield', item.baseYield);
        html += this.statLine('⭐ Grade', item.qualityGrade);

        if (item.refinedInto) {
            html += `<div style="color: #4CAF50; margin: 4px 0;">
                🔄 Can be refined into: ${item.refinedInto}
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate technology-specific stats
     */
    generateTechnologyStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('⚡ Power', `${item.powerConsumption}W`);
        html += this.statLine('📡 Radius', `${item.effectRadius}m`);
        html += this.statLine('🔧 Tech Level', item.techLevel);
        html += this.statLine('🤖 Type', item.automation);

        const statusColor = item.isActive() ? '#4CAF50' : '#f44336';
        html += `<div style="color: ${statusColor}; margin: 4px 0; font-weight: bold;">
            ${item.isActive() ? '✅ ACTIVE' : '⭕ INACTIVE'}
        </div>`;

        if (item.canUpgrade()) {
            html += `<div style="color: #FFC107; margin: 4px 0;">
                ⬆️ Upgradeable (${item.upgradePath.length} paths)
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate mod-specific stats
     */
    generateModStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('🎯 Target', item.targetSlot);
        html += this.statLine('⭐ Tier', item.tier);

        if (item.statModifiers.length > 0) {
            html += '<div style="margin-top: 6px; color: #4CAF50;">Modifiers:</div>';
            for (let mod of item.getModifiers()) {
                const prefix = mod.type === 'percent' ? '+' : '';
                const suffix = mod.type === 'percent' ? '%' : '';
                html += `<div style="color: #4CAF50; margin-left: 8px;">
                    ${prefix}${mod.value}${suffix} ${mod.stat}
                </div>`;
            }
        }

        if (item.incompatibleWith.length > 0) {
            html += `<div style="color: #f44336; margin-top: 6px; font-size: 0.85em;">
                ⚠️ Incompatible with ${item.incompatibleWith.length} mod(s)
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate healing-specific stats
     */
    generateHealingStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('❤️ Heal Amount', item.getHealAmount());
        html += this.statLine('⏱️ Type', item.healType);

        if (item.healType === 'overtime' && item.duration > 0) {
            html += this.statLine('⏳ Duration', `${(item.duration / 1000).toFixed(0)}s`);
        }

        if (item.cooldown > 0) {
            html += this.statLine('🔄 Cooldown', `${(item.cooldown / 1000).toFixed(1)}s`);
        }

        const combatColor = item.combatUsable ? '#4CAF50' : '#f44336';
        html += `<div style="color: ${combatColor}; margin: 4px 0;">
            ${item.combatUsable ? '⚔️ Usable in combat' : '🚫 Not usable in combat'}
        </div>`;

        if (item.resurrectPower > 0) {
            html += `<div style="color: #FFD700; margin: 4px 0; font-weight: bold;">
                ✨ ${item.resurrectPower}% Revive Chance
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate consumable-specific stats
     */
    generateConsumableStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('📦 Category', item.category);
        html += this.statLine('⏳ Duration', `${(item.duration / 1000).toFixed(0)}s`);
        html += this.statLine('🔄 Stacks', item.stacks ? 'Yes' : 'No');

        if (item.effects.length > 0) {
            html += '<div style="margin-top: 6px; color: #4CAF50;">Effects:</div>';
            for (let effect of item.getEffects()) {
                const prefix = effect.type === 'percent' ? '+' : '';
                const suffix = effect.type === 'percent' ? '%' : '';
                html += `<div style="color: #4CAF50; margin-left: 8px;">
                    ${prefix}${effect.value}${suffix} ${effect.stat}
                </div>`;
            }
        }

        if (item.debuffCleanse) {
            html += `<div style="color: #FFD700; margin: 4px 0;">
                ✨ Cleanses debuffs
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate perk-specific stats
     */
    generatePerkStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('🎯 Type', item.perkType);
        html += this.statLine('⚡ Power', `${(item.powerMultiplier * 100).toFixed(0)}%`);
        html += this.statLine('📊 Slot Cost', item.slotCount);

        if (item.synergyTags.length > 0) {
            html += `<div style="color: #FFC107; margin: 6px 0;">
                🔗 Synergy Tags: ${item.synergyTags.join(', ')}
            </div>`;
        }

        if (item.requirements.level || item.requirements.skills) {
            html += '<div style="margin-top: 6px; color: #aaa; font-size: 0.85em;">Requirements:</div>';
            if (item.requirements.level) {
                html += `<div style="margin-left: 8px;">Level ${item.requirements.level}</div>`;
            }
            if (item.requirements.skills) {
                for (let skill in item.requirements.skills) {
                    html += `<div style="margin-left: 8px;">
                        ${skill}: ${item.requirements.skills[skill]}
                    </div>`;
                }
            }
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate quest-specific stats
     */
    generateQuestStats(item) {
        let html = '<div style="margin: 8px 0;">';

        html += this.statLine('📋 Quest', item.questId);

        if (item.progression > 0) {
            html += `<div style="color: #4CAF50; margin: 4px 0;">
                📊 Progress: ${item.progression}%
            </div>`;
        }

        if (item.unique) {
            html += `<div style="color: #FFD700; margin: 4px 0;">
                ⭐ Unique Item
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate socket info
     */
    generateSocketInfo(item) {
        let html = '<div style="margin: 8px 0; border-top: 1px solid #444; padding-top: 8px;">';

        const filled = item.sockets.length;
        const total = item.socketSlots;

        html += `<div style="color: #FFC107; margin-bottom: 4px;">
            💎 Sockets: ${filled}/${total}
        </div>`;

        // Display filled sockets
        for (let i = 0; i < total; i++) {
            const socketColor = i < filled ? '#4CAF50' : '#666';
            html += `<span style="color: ${socketColor}; font-size: 1.2em; margin-right: 4px;">
                ${i < filled ? '◆' : '◇'}
            </span>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate effects list
     */
    generateEffects(item) {
        let html = '<div style="margin: 8px 0; border-top: 1px solid #444; padding-top: 8px;">';
        html += '<div style="color: #4CAF50; margin-bottom: 4px;">✨ Effects:</div>';

        for (let effect of item.effects) {
            html += `<div style="color: #4CAF50; margin-left: 8px; font-size: 0.9em;">
                ${effect.description || effect.type}
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate lore section
     */
    generateLore(item) {
        return `
            <div style="margin: 8px 0; border-top: 1px solid #444; padding-top: 8px;">
                <div style="color: #FFC107; font-style: italic; font-size: 0.85em; line-height: 1.4;">
                    "${item.lore}"
                </div>
            </div>
        `;
    },

    /**
     * Generate common stats
     */
    generateCommonStats(item, compareItem) {
        let html = '<div style="margin: 8px 0; border-top: 1px solid #444; padding-top: 8px; font-size: 0.85em; color: #aaa;">';

        html += this.statLine('💰 Value', `${item.getScaledValue()}g`, compareItem?.getScaledValue());
        html += this.statLine('⚖️ Weight', `${item.weight}`, compareItem?.weight);
        html += this.statLine('📊 Level', item.level, compareItem?.level);

        if (item.stackSize > 1) {
            html += this.statLine('📦 Stack Size', item.stackSize);
        }

        html += '</div>';
        return html;
    },

    /**
     * Generate footer info
     */
    generateFooter(item) {
        let html = '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #444; font-size: 0.75em; color: #888;">';

        const bindText = {
            'none': 'Not Bound',
            'pickup': 'Binds on Pickup',
            'equip': 'Binds on Equip',
            'account': 'Account Bound'
        };
        html += `<div>${bindText[item.bindType] || 'Not Bound'}</div>`;

        if (!item.tradeable) html += `<div style="color: #f44336;">Cannot be traded</div>`;
        if (!item.destructible) html += `<div style="color: #f44336;">Cannot be destroyed</div>`;
        if (item.bound) html += `<div style="color: #FFC107;">Soulbound</div>`;

        html += '</div>';
        return html;
    },

    /**
     * Helper: Generate stat line with optional comparison
     */
    statLine(label, value, compareValue = null) {
        if (compareValue === undefined || compareValue === null || compareValue === value) {
            return `<div style="margin: 2px 0;">${label}: <span style="color: #fff;">${value}</span></div>`;
        }

        // Show comparison
        const diff = parseFloat(value) - parseFloat(compareValue);
        const diffColor = diff > 0 ? '#4CAF50' : '#f44336';
        const diffSymbol = diff > 0 ? '▲' : '▼';

        return `
            <div style="margin: 2px 0;">
                ${label}: <span style="color: #fff;">${value}</span>
                <span style="color: ${diffColor}; margin-left: 8px; font-size: 0.9em;">
                    ${diffSymbol} ${Math.abs(diff).toFixed(1)}
                </span>
            </div>
        `;
    }
};

// Make available globally
window.TooltipUI = TooltipUI;
