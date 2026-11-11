/**
 * OVERVIEW UI - 3-Column Dashboard Layout
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                          CHARACTER HEADER                               │
 * │            [Level] [Name] [Location] [Power]                            │
 * ├─────────────────────┬─────────────────────┬─────────────────────────────┤
 * │    COLUMN 1         │    COLUMN 2         │      COLUMN 3               │
 * │   Attributes        │   Skills Panel      │   Loadout (3-1-3)           │
 * │   + Combat Stats    │   (vertical list)   │   + Recent Activity         │
 * │                     │   Priority Section  │   + Milestones              │
 * │   ❤️ Health    [+]  │   Gathering Section │                             │
 * │   💪 Strength  [+]  │   Crafting Section  │   Equipment Grid            │
 * │   🏃 Mobility  [+]  │                     │   Consumables Row           │
 * │   🧠 Intellect [+]  │   Each skill:       │   Tech Slots                │
 * │                     │   [Icon][Name][Lv]→ │                             │
 * │   Combat Stats:     │                     │                             │
 * │   HP, DMG, SPD...   │                     │                             │
 * └─────────────────────┴─────────────────────┴─────────────────────────────┘
 */

const OverviewUI = {
    // Cache last rendered state
    lastOverviewState: null,

    // Skills organized by category with navigation info
    PRIORITY_SKILLS: [
        { id: 'navigation', name: 'Navigation', icon: '🧭', view: 'navigation', action: null },
        { id: 'engineering', name: 'Engineering', icon: '🔬', view: 'crafting', action: () => UnifiedCraftingUI?.switchTab?.('engineering') }
    ],

    GATHERING_SKILLS: [
        { id: 'mining', name: 'Mining', icon: '⛏️', view: 'gather', action: () => GatherUI?.selectSkill?.('mining') },
        { id: 'logging', name: 'Logging', icon: '🪓', view: 'gather', action: () => GatherUI?.selectSkill?.('logging') },
        { id: 'fishing', name: 'Fishing', icon: '🎣', view: 'gather', action: () => GatherUI?.selectSkill?.('fishing') },
        { id: 'hunting', name: 'Hunting', icon: '🏹', view: 'gather', action: () => GatherUI?.selectSkill?.('hunting') },
        { id: 'foraging', name: 'Foraging', icon: '🌿', view: 'gather', action: () => GatherUI?.selectSkill?.('foraging') },
        { id: 'thieving', name: 'Thieving', icon: '🎭', view: 'gather', action: () => GatherUI?.selectSkill?.('thieving') }
    ],

    CRAFTING_SKILLS: [
        { id: 'smithing', name: 'Smithing', icon: '🔨', view: 'crafting', action: () => UnifiedCraftingUI?.selectSkill?.('smithing') },
        { id: 'mechanics', name: 'Mechanics', icon: '⚙️', view: 'crafting', action: () => UnifiedCraftingUI?.selectSkill?.('mechanics') },
        { id: 'electronics', name: 'Electronics', icon: '⚡', view: 'crafting', action: () => UnifiedCraftingUI?.selectSkill?.('electronics') },
        { id: 'cooking', name: 'Cooking', icon: '🍳', view: 'crafting', action: () => UnifiedCraftingUI?.selectSkill?.('cooking') },
        { id: 'chemistry', name: 'Chemistry', icon: '⚗️', view: 'crafting', action: () => UnifiedCraftingUI?.selectSkill?.('chemistry') },
        { id: 'tailoring', name: 'Tailoring', icon: '🧵', view: 'crafting', action: () => UnifiedCraftingUI?.selectSkill?.('tailoring') }
    ],

    // Attributes configuration (7 total - matches GameEngine.state.combatAttributes)
    ATTRIBUTES: [
        {
            id: 'health',
            icon: '❤️',
            name: 'Health',
            desc: '+10 Max HP per point',
            tooltip: {
                combat: 'Increases maximum health pool, allowing you to survive more hits in combat.',
                gathering: 'Higher health lets you gather from dangerous nodes longer without retreating.',
                crafting: 'No direct crafting benefit.'
            }
        },
        {
            id: 'strength',
            icon: '💪',
            name: 'Strength',
            desc: '+1 Damage per point',
            tooltip: {
                combat: 'Increases base attack damage dealt to enemies.',
                gathering: 'Improves yield from mining and logging nodes.',
                crafting: 'Reduces stamina cost for smithing recipes.'
            }
        },
        {
            id: 'defense',
            icon: '🛡️',
            name: 'Defense',
            desc: '+1% Damage Reduction per point',
            tooltip: {
                combat: 'Reduces incoming damage from enemy attacks.',
                gathering: 'Reduces damage taken from hazardous gathering nodes.',
                crafting: 'No direct crafting benefit.'
            }
        },
        {
            id: 'stealth',
            icon: '🥷',
            name: 'Stealth',
            desc: '+1% Evasion per point',
            tooltip: {
                combat: 'Chance to completely avoid enemy attacks.',
                gathering: 'Improves thieving success rate and reduces detection.',
                crafting: 'No direct crafting benefit.'
            }
        },
        {
            id: 'perception',
            icon: '👁️',
            name: 'Perception',
            desc: '+1% Accuracy per point',
            tooltip: {
                combat: 'Increases hit chance against enemies, especially evasive ones.',
                gathering: 'Increases chance to find rare materials while foraging and fishing.',
                crafting: 'Improves quality inspection, reducing failed crafts.'
            }
        },
        {
            id: 'mobility',
            icon: '🏃',
            name: 'Mobility',
            desc: '+1% Attack Speed per point',
            tooltip: {
                combat: 'Increases attack frequency, dealing damage more often.',
                gathering: 'Speeds up gathering actions at all nodes.',
                crafting: 'Reduces crafting time for all recipes.'
            }
        },
        {
            id: 'intellect',
            icon: '🧠',
            name: 'Intellect',
            desc: 'Unlocks Tech Slots',
            tooltip: {
                combat: 'Unlocks technology slots for combat gadgets and buffs.',
                gathering: 'Improves engineering node efficiency.',
                crafting: 'Required for electronics and chemistry recipes. Unlocks advanced crafting tiers.'
            }
        }
    ],

    // Slot icons for equipment display
    SLOT_ICONS: {
        weapon: '⚔️', gloves: '🧤', boots: '👢',
        armor: '🛡️',  // Single armor set slot (replaces helmet/chest/legs)
        back: '🎒', neck: '📿', ring: '💍',
        food: '🍖', potion: '🧪', ammo: '🎯',
        tech1: '💾', tech2: '💾', tech3: '💾', tech4: '💾'
    },

    /**
     * Update overview display
     */
    updateOverview() {
        const container = document.getElementById("overviewView");
        if (!container) return;

        // Create state snapshot for change detection
        const currentState = {
            region: GameEngine.state.currentRegion,
            activity: GameEngine.state.currentActivity,
            charLevel: GameEngine.state.characterLevel?.level,
            unassignedPoints: GameEngine.state.characterLevel?.unassignedAttributePoints,
            equipment: JSON.stringify(GameEngine.state.equipment),
            combatAttributes: JSON.stringify(GameEngine.state.combatAttributes),
            skills: JSON.stringify(GameEngine.state.skills),
            inCombat: GameEngine.state.combat?.inCombat || false,
            gatheringSession: GameEngine.state.gatheringSession?.nodeId || null,
            activeCrafts: GameEngine.state.crafting?.activeCrafts?.length || 0
        };

        // Only re-render if state changed
        if (this.lastOverviewState && JSON.stringify(this.lastOverviewState) === JSON.stringify(currentState)) {
            return;
        }

        container.innerHTML = this.render();
        this.lastOverviewState = currentState;
    },

    /**
     * Main render function - 3-column layout
     */
    render() {
        return `
            <div class="overview-dashboard">
                <div class="overview-three-columns">
                    <!-- Column 1: Attributes + Combat Stats + Milestones -->
                    <div class="overview-column overview-column--left">
                        ${this.renderAttributesPanel()}
                        ${this.renderCombatStatsPanel()}
                        ${this.renderMilestonesPanel()}
                    </div>

                    <!-- Column 2: Skills (vertical list) -->
                    <div class="overview-column overview-column--center">
                        ${this.renderSkillsPanel()}
                    </div>

                    <!-- Column 3: Loadout (full height) -->
                    <div class="overview-column overview-column--right">
                        ${this.renderLoadoutPanel()}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render character header
     */
    renderCharacterHeader() {
        const charLevel = GameEngine.state.characterLevel || { level: 1, exp: 0 };
        const expRequired = GameEngine.getCharacterExpRequired?.() || 100;
        const expPercent = Math.min(100, (charLevel.exp / expRequired) * 100);
        const combatPower = this.calculateCombatPower();
        const unassignedPoints = charLevel.unassignedAttributePoints || 0;

        const currentRegion = GameEngine.state?.currentRegion;
        const worldMap = GameEngine.definitions?.worldMap || GameEngine.state?.worldMap;
        const hexDef = worldMap?.[currentRegion];
        const regionName = hexDef?.name || currentRegion || 'Unknown';

        // Get current activity status
        const activity = this.getCurrentActivityStatus();

        return `
            <div class="overview-header ${unassignedPoints > 0 ? 'has-unassigned-points' : ''}">
                <div class="header-left">
                    <div class="level-badge">
                        <span class="level-number">${charLevel.level}</span>
                        <span class="level-label">LVL</span>
                    </div>
                    <div class="character-info">
                        <div class="character-name">Adventurer</div>
                        <div class="xp-bar-container">
                            <div class="xp-bar">
                                <div class="xp-fill" style="width: ${expPercent}%;"></div>
                            </div>
                            <span class="xp-text">${Formatting.formatNumber(charLevel.exp)} / ${Formatting.formatNumber(expRequired)}</span>
                        </div>
                    </div>
                </div>

                <div class="header-center">
                    <div class="location-badge">
                        <span class="location-icon">📍</span>
                        <span class="location-name">${regionName}</span>
                    </div>
                    <div class="activity-status" style="color: ${activity.color};">
                        <span class="activity-icon">${activity.icon}</span>
                        <span class="activity-text">${activity.text}</span>
                    </div>
                    ${unassignedPoints > 0 ? `
                        <div class="points-badge" onclick="switchView('skills')">
                            <span class="points-glow">✨</span>
                            <span class="points-count">${unassignedPoints}</span>
                            <span class="points-text">Point${unassignedPoints !== 1 ? 's' : ''}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="header-right">
                    <div class="power-display" style="--power-color: ${combatPower.tierColor};">
                        <span class="power-value">${combatPower.power}</span>
                        <span class="power-tier">${combatPower.tier}</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render attributes panel with + buttons
     */
    renderAttributesPanel() {
        const attrs = GameEngine.state.combatAttributes || {};
        const charLevel = GameEngine.state.characterLevel || {};
        const unassignedPoints = charLevel.unassignedAttributePoints || 0;

        return `
            <div class="overview-panel panel-attributes">
                <div class="panel-header">
                    <span class="panel-icon">📊</span>
                    <span class="panel-title">Attributes</span>
                    ${unassignedPoints > 0 ? `<span class="panel-badge badge-warning">${unassignedPoints} pts</span>` : ''}
                </div>
                <div class="panel-content">
                    <div class="attributes-list">
                        ${this.ATTRIBUTES.map(attr => `
                            <div class="attribute-row"
                                 onmouseenter="OverviewUI.showAttributeTooltip(event, '${attr.id}')"
                                 onmouseleave="OverviewUI.hideAttributeTooltip()">
                                <div class="attribute-info">
                                    <span class="attr-icon">${attr.icon}</span>
                                    <span class="attr-name">${attr.name}</span>
                                </div>
                                <div class="attribute-controls">
                                    <span class="attr-value">${attrs[attr.id] || 0}</span>
                                    ${unassignedPoints > 0 ? `
                                        <button class="attr-add-btn" onclick="event.stopPropagation(); OverviewUI.addAttribute('${attr.id}')" title="${attr.desc}">+</button>
                                    ` : `
                                        <div class="attr-btn-placeholder"></div>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Add attribute point
     */
    addAttribute(attrId) {
        if (typeof GameEngine.assignAttributePoint === 'function') {
            const result = GameEngine.assignAttributePoint(attrId);
            if (result.success) {
                this.updateOverview();
            } else {
                console.log(`❌ Could not assign point: ${result.reason}`);
            }
        }
    },

    /**
     * Show attribute tooltip on hover
     */
    showAttributeTooltip(event, attrId) {
        const attr = this.ATTRIBUTES.find(a => a.id === attrId);
        if (!attr || !attr.tooltip) return;

        // Remove existing tooltip
        this.hideAttributeTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'attribute-tooltip';
        tooltip.id = 'attribute-tooltip';
        tooltip.innerHTML = `
            <div class="attr-tooltip-header">
                <span class="attr-tooltip-icon">${attr.icon}</span>
                <span class="attr-tooltip-name">${attr.name}</span>
            </div>
            <div class="attr-tooltip-desc">${attr.desc}</div>
            <div class="attr-tooltip-section">
                <span class="attr-tooltip-label">⚔️ Combat</span>
                <span class="attr-tooltip-text">${attr.tooltip.combat}</span>
            </div>
            <div class="attr-tooltip-section">
                <span class="attr-tooltip-label">⛏️ Gathering</span>
                <span class="attr-tooltip-text">${attr.tooltip.gathering}</span>
            </div>
            <div class="attr-tooltip-section">
                <span class="attr-tooltip-label">🔨 Crafting</span>
                <span class="attr-tooltip-text">${attr.tooltip.crafting}</span>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip near the element
        const rect = event.currentTarget.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;

        // Adjust if off-screen
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = `${rect.left - tooltipRect.width - 10}px`;
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = `${window.innerHeight - tooltipRect.height - 10}px`;
        }
    },

    /**
     * Hide attribute tooltip
     */
    hideAttributeTooltip() {
        const existing = document.getElementById('attribute-tooltip');
        if (existing) existing.remove();
    },

    /**
     * Render combat stats panel
     */
    renderCombatStatsPanel() {
        const stats = this.getLiveCombatStats();
        const combatPower = this.calculateCombatPower();

        const dr = (stats.damageReduction * 100).toFixed(1);
        // Accuracy and Crit are weighted-roll RATINGS (not flat %): each hit rolls the
        // rating against the enemy's opposing stat, so the true odds depend on the enemy.
        const accTitle = `Accuracy rating ${stats.accuracy} — each hit rolls this against the enemy&#39;s evasion (hit chance = ACC / (ACC + enemy evasion)). Not a flat %.`;
        const critTitle = `Crit rating ${stats.critRating} at ${stats.critMultiplier.toFixed(2)}&times; damage — rolled against the enemy&#39;s crit resistance. Not a flat %.`;
        const defTitle = `Damage reduction ${dr}% &middot; Armor rating ${stats.armorRating}`;
        const critMin = Math.round(stats.maxDamage / 2);
        const dmgTitle = `Normal hit rolls ${stats.minDamage}&ndash;${stats.maxDamage}. Crit rolls ${critMin}&ndash;${stats.maxDamage} (upper half) &times; ${stats.critMultiplier.toFixed(2)} crit multiplier. Misses deal 0.`;

        return `
            <div class="overview-panel panel-combat-stats">
                <div class="panel-header">
                    <span class="panel-icon">⚔️</span>
                    <span class="panel-title">Combat Stats</span>
                </div>
                <div class="panel-content">
                    <!-- Combat Power as top stat -->
                    <div class="combat-power-display" style="--power-color: ${combatPower.tierColor};">
                        <span class="power-icon">💥</span>
                        <span class="power-label">POWER</span>
                        <span class="power-value">${combatPower.power}</span>
                        <span class="power-tier">${combatPower.tier}</span>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-icon">❤️</span>
                            <span class="stat-label">HP</span>
                            <span class="stat-value">${stats.currentHP}/${stats.maxHealth}</span>
                        </div>
                        <div class="stat-item" title="${dmgTitle}">
                            <span class="stat-icon">⚔️</span>
                            <span class="stat-label">Damage</span>
                            <span class="stat-value">${stats.minDamage}&ndash;${stats.maxDamage}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">⚡</span>
                            <span class="stat-label">Speed</span>
                            <span class="stat-value">${stats.attacksPerSec.toFixed(2)}/s</span>
                        </div>
                        <div class="stat-item" title="${accTitle}">
                            <span class="stat-icon">🎯</span>
                            <span class="stat-label">Accuracy</span>
                            <span class="stat-value">${stats.accuracy}</span>
                        </div>
                        <div class="stat-item" title="${defTitle}">
                            <span class="stat-icon">🛡️</span>
                            <span class="stat-label">Defense</span>
                            <span class="stat-value">${dr}%</span>
                        </div>
                        <div class="stat-item" title="${critTitle}">
                            <span class="stat-icon">🔄</span>
                            <span class="stat-label">Crit</span>
                            <span class="stat-value">${stats.critRating} &middot; ${stats.critMultiplier.toFixed(1)}&times;</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Read the player's LIVE combat stats from state.compiledStats — the single
     * source of truth the combat engine (StatCompiler + CombatRolls) actually uses.
     * This replaces the legacy StatCalculator path (getPlayerCombatStats), whose
     * formulas diverged from real combat.
     */
    getLiveCombatStats() {
        // compiledStats is the documented source of truth; compile if missing.
        if (!GameEngine.state?.compiledStats && typeof GameEngine.compilePlayerStats === 'function') {
            GameEngine.compilePlayerStats();
        }
        const c = GameEngine.state?.compiledStats || {};
        const attrs = GameEngine.state?.combatAttributes || {};

        const maxHealth = Math.floor(c.maxHealth || 100);
        // currentHP is only set during/after combat; fall back to full when idle.
        const currentHP = Math.floor(GameEngine.state?.currentHP ?? maxHealth);
        const attackInterval = c.attackInterval || 2000;
        const attacksPerSec = c.attackSpeed || (1000 / attackInterval);
        const dmg = this.getEffectiveWeaponDamage(attrs, c);

        return {
            maxHealth,
            currentHP,
            minDamage: dmg.min,
            maxDamage: dmg.max,
            attacksPerSec,
            accuracy: Math.floor(c.accuracy || 0),
            critRating: Math.floor(c.critRating || 0),
            critMultiplier: c.critMultiplier || 1.5,
            damageReduction: c.damageReduction || 0, // 0..0.75
            armorRating: Math.floor(c.armorRating || 0)
        };
    },

    /**
     * Mirror of combatSystem.calculateCombatStats()'s weapon-damage path so the
     * panel shows the exact min–max the damage roll uses (weapon base, +Strength
     * for melee, perk multipliers), not the legacy StatCalculator value.
     */
    getEffectiveWeaponDamage(attrs, compiled) {
        const weaponSlot = GameEngine.state?.equipment?.weapon;
        if (!weaponSlot) return { min: 1, max: 3 };

        const rawId = typeof weaponSlot === 'string' ? weaponSlot : (weaponSlot.itemId || weaponSlot.id);
        const baseId = this.parseInstanceId(rawId);
        const weaponDef = (typeof ItemRegistry !== 'undefined') ? ItemRegistry.getItem(baseId) : null;
        if (!weaponDef) return { min: 1, max: 3 };

        const mult = compiled.perkMultipliers || {};
        // Resolve damage from the same fields combatSystem.calculateCombatStats uses
        // (baseDamage is missing on most weapons; attackDamage/combatStats.damage carry it).
        const baseDamage = weaponDef.baseDamage
            ?? weaponDef.attackDamage
            ?? weaponDef.combatStats?.damage
            ?? 0;
        const weaponType = weaponDef.weaponType || weaponDef.weaponCategory || 'melee';
        const rangedTypes = ['ranged', 'pistol', 'rifle', 'bow', 'crossbow'];
        const meleeTypes = ['melee', 'sword', 'axe', 'mace', 'dagger', 'balancedMelee'];

        let dmg = baseDamage;
        if (meleeTypes.includes(weaponType)) {
            dmg = Math.floor((baseDamage + (attrs.strength || 0)) * (mult.meleeDamage || 1.0));
        } else if (rangedTypes.includes(weaponType)) {
            dmg = Math.floor(baseDamage * (mult.rangedDamage || 1.0));
        }

        // A landed normal hit rolls 1..max (misses deal 0). Perks may raise the floor above 1.
        return { min: Math.max(1, Math.floor(mult.minDamageBonus || 0) || 1), max: Math.floor(dmg * 1.5) };
    },

    /**
     * Render skills panel with vertical list
     */
    renderSkillsPanel() {
        const skills = GameEngine.state?.skills || {};

        return `
            <div class="overview-panel panel-skills">
                <div class="panel-header">
                    <span class="panel-icon">⭐</span>
                    <span class="panel-title">Skills</span>
                </div>
                <div class="panel-content skills-list-container">
                    <!-- Priority Skills Section -->
                    <div class="skill-section">
                        <div class="skill-section-header">Priority</div>
                        <div class="skill-section-list">
                            ${this.PRIORITY_SKILLS.map(skill => this.renderSkillRow(skill, skills[skill.id])).join('')}
                        </div>
                    </div>

                    <!-- Gathering Skills Section -->
                    <div class="skill-section">
                        <div class="skill-section-header">Gathering</div>
                        <div class="skill-section-list">
                            ${this.GATHERING_SKILLS.map(skill => this.renderSkillRow(skill, skills[skill.id])).join('')}
                        </div>
                    </div>

                    <!-- Crafting Skills Section -->
                    <div class="skill-section">
                        <div class="skill-section-header">Crafting</div>
                        <div class="skill-section-list">
                            ${this.CRAFTING_SKILLS.map(skill => this.renderSkillRow(skill, skills[skill.id])).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render a single skill row (matches attribute row structure)
     */
    renderSkillRow(skillConfig, skillData) {
        const level = skillData?.level || 1;
        const exp = skillData?.exp || 0;
        const expRequired = GameEngine.getSkillExpRequired?.(skillConfig.id) || 100;
        const expPercent = level >= 100 ? 100 : Math.min(100, (exp / expRequired) * 100);

        return `
            <div class="skill-row skill-row--clickable" onclick="OverviewUI.navigateToSkill('${skillConfig.id}')">
                <span class="skill-icon">${skillConfig.icon}</span>
                <span class="skill-name">${skillConfig.name}</span>
                <div class="skill-xp-container">
                    <div class="skill-xp-bar">
                        <div class="skill-xp-fill" style="width: ${expPercent}%;"></div>
                    </div>
                </div>
                <span class="skill-level">LV.${level}</span>
                <span class="skill-arrow">→</span>
            </div>
        `;
    },

    /**
     * Navigate to skill's relevant UI
     */
    navigateToSkill(skillId) {
        const allSkills = [...this.PRIORITY_SKILLS, ...this.GATHERING_SKILLS, ...this.CRAFTING_SKILLS];
        const skill = allSkills.find(s => s.id === skillId);

        if (!skill) {
            console.warn(`[OverviewUI] Unknown skill: ${skillId}`);
            return;
        }

        // Switch to the target view
        if (typeof switchView === 'function') {
            switchView(skill.view);
        }

        // Execute skill-specific action after view switch
        if (skill.action) {
            setTimeout(() => skill.action(), 50);
        }

        console.log(`[OverviewUI] Navigated to ${skill.view} for ${skillId}`);
    },

    /**
     * Render loadout panel (3-1-3 grid) using LoadoutSlotRenderer
     */
    renderLoadoutPanel() {
        const equipment = GameEngine.state.equipment || {};
        const attrs = GameEngine.state.combatAttributes || {};
        const intellect = attrs.intellect || 0;
        const currentWeight = GameEngine.getTotalEquippedWeight?.() || 0;
        const maxWeight = GameEngine.getMaxEquipmentWeight?.() || 100;

        // Use LoadoutSlotRenderer for consistent slot rendering
        const renderer = typeof LoadoutSlotRenderer !== 'undefined' ? LoadoutSlotRenderer : null;

        // Fallback to legacy rendering if LoadoutSlotRenderer not available
        if (!renderer) {
            return this._renderLoadoutPanelLegacy(equipment, intellect, currentWeight, maxWeight);
        }

        return `
            <div class="overview-panel panel-loadout">
                <div class="panel-header">
                    <span class="panel-icon">🎒</span>
                    <span class="panel-title">Loadout</span>
                    <span class="panel-badge ${currentWeight >= maxWeight ? 'badge-warning' : ''}">${currentWeight}/${maxWeight}</span>
                </div>
                <div class="panel-content unified-slots--compact">
                    <!-- 3-1-3 Equipment Grid -->
                    ${renderer.renderEquipmentGrid({
                        equipment,
                        size: 'auto',
                        showLabels: false,
                        showNames: false,
                        interactive: false,
                        onSlotClick: null
                    })}

                    <!-- Consumables -->
                    <div class="unified-loadout-section">
                        <div class="unified-loadout-section__label">CONSUMABLES</div>
                        ${renderer.renderConsumablesRow({
                            equipment,
                            size: 'auto',
                            showLabels: false,
                            interactive: false,
                            onSlotClick: null
                        })}
                    </div>

                    <!-- Technology -->
                    <div class="unified-loadout-section">
                        <div class="unified-loadout-section__label">TECHNOLOGY</div>
                        ${renderer.renderTechRow({
                            equipment,
                            intellect,
                            size: 'auto',
                            showLabels: false,
                            interactive: false,
                            onSlotClick: null
                        })}
                    </div>

                    <button class="loadout-view-btn" onclick="switchView('equipment')">
                        View Full Loadout
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render the carry-weight bar for the loadout panel.
     * Uses the equipment-weight system (equipped item weights vs 50 + strength*10),
     * matching the panel's header badge. Styled in the Overview flat idiom.
     */
    renderLoadoutWeightBar(currentWeight, maxWeight) {
        const max = maxWeight > 0 ? maxWeight : 1;
        const pct = Math.max(0, Math.min(100, (currentWeight / max) * 100));
        const isOver = currentWeight >= maxWeight;
        const isNear = !isOver && pct >= 85;
        const stateClass = isOver ? 'is-over' : (isNear ? 'is-near' : '');
        return `
            <div class="loadout-weight-row ${stateClass}" title="Carry weight ${currentWeight} / ${maxWeight}">
                <span class="loadout-weight-label">⚖️ WEIGHT</span>
                <div class="loadout-weight-track">
                    <div class="loadout-weight-fill" style="width:${pct}%"></div>
                </div>
                <span class="loadout-weight-value">${currentWeight}<span class="loadout-weight-sep">/</span>${maxWeight}</span>
            </div>
        `;
    },

    /**
     * Legacy loadout panel rendering (fallback if LoadoutSlotRenderer not available)
     * @private
     */
    _renderLoadoutPanelLegacy(equipment, intellect, currentWeight, maxWeight) {
        return `
            <div class="overview-panel panel-loadout">
                <div class="panel-header">
                    <span class="panel-icon">🎒</span>
                    <span class="panel-title">Loadout</span>
                    <span class="panel-badge ${currentWeight >= maxWeight ? 'badge-warning' : ''}">${currentWeight}/${maxWeight}</span>
                </div>
                <div class="panel-content">
                    <div class="loadout-equipment-grid">
                        <div class="loadout-column">
                            ${this.renderLoadoutSlotLegacy(equipment.weapon, 'weapon')}
                            ${this.renderLoadoutSlotLegacy(equipment.gloves, 'gloves')}
                            ${this.renderLoadoutSlotLegacy(equipment.boots, 'boots')}
                        </div>
                        <div class="loadout-column loadout-column--armor">
                            ${this.renderArmorSlotLegacy(equipment.armor)}
                        </div>
                        <div class="loadout-column">
                            ${this.renderLoadoutSlotLegacy(equipment.back, 'back')}
                            ${this.renderLoadoutSlotLegacy(equipment.neck, 'neck')}
                            ${this.renderLoadoutSlotLegacy(equipment.ring, 'ring')}
                        </div>
                    </div>
                    <div class="loadout-section">
                        <div class="loadout-section-label">CONSUMABLES</div>
                        <div class="loadout-consumables-row">
                            ${this.renderLoadoutSlotLegacy(equipment.food, 'food', true)}
                            ${this.renderLoadoutSlotLegacy(equipment.potion, 'potion', true)}
                            ${this.renderLoadoutSlotLegacy(equipment.ammo, 'ammo', true)}
                        </div>
                    </div>
                    <div class="loadout-section">
                        <div class="loadout-section-label">TECHNOLOGY</div>
                        <div class="loadout-tech-row">
                            ${this.renderTechSlotLegacy(equipment.tech1, 'tech1', 0, intellect)}
                            ${this.renderTechSlotLegacy(equipment.tech2, 'tech2', 3, intellect)}
                            ${this.renderTechSlotLegacy(equipment.tech3, 'tech3', 6, intellect)}
                            ${this.renderTechSlotLegacy(equipment.tech4, 'tech4', 9, intellect)}
                        </div>
                    </div>
                    <button class="loadout-view-btn" onclick="switchView('equipment')">
                        View Full Loadout
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Legacy loadout slot rendering (fallback)
     * @private
     */
    renderLoadoutSlotLegacy(itemData, slotName, isConsumable = false) {
        const icon = this.SLOT_ICONS[slotName] || '❓';
        let itemDef = null;
        let itemIconHtml = `<span class="slot-icon-emoji">${icon}</span>`;
        let quantity = 0;
        let itemId = null;

        if (itemData) {
            itemId = typeof itemData === 'string' ? itemData : itemData.itemId;
            if (isConsumable && itemData.quantity) {
                quantity = itemData.quantity;
            }
            if (itemId) {
                const baseId = this.parseInstanceId(itemId);
                itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(baseId) : null;
                if (itemDef) {
                    if (typeof IconHelper !== 'undefined') {
                        itemIconHtml = IconHelper.getItemIconHTML(itemDef, { size: 28, className: 'slot-icon-img' });
                    } else if (itemDef.icon) {
                        itemIconHtml = `<span class="slot-icon-emoji">${itemDef.icon}</span>`;
                    }
                }
            }
        }

        const isEmpty = !itemDef && (!isConsumable || quantity <= 0);
        const isFilled = itemDef !== null;
        const title = itemDef?.name || slotName.charAt(0).toUpperCase() + slotName.slice(1);

        const instancedItem = itemId ? GameEngine.state.bank?.instanced?.[itemId] : null;
        const rarity = instancedItem?.rarity || itemDef?.rarity || 'common';
        const rarityData = GameEngine.definitions?.RARITY_TIERS?.[rarity] || { color: '#9e9e9e' };
        const rarityColor = rarityData.color;
        const hasGlow = rarityData.glow;

        return `
            <div class="loadout-slot ${isEmpty ? 'loadout-slot--empty' : ''} ${isFilled ? 'loadout-slot--filled' : ''} ${hasGlow ? 'loadout-slot--glow' : ''} rarity-${rarity}"
                 ${isFilled ? `style="--rarity-color: ${rarityColor};"` : ''}
                 title="${title}${isFilled ? ` (${rarity})` : ''}" data-slot="${slotName}">
                <span class="slot-icon">${itemIconHtml}</span>
                ${isConsumable && quantity > 0 ? `<span class="slot-qty">${this.formatQuantity(quantity)}</span>` : ''}
            </div>
        `;
    },

    /**
     * Legacy armor slot rendering (fallback)
     * @private
     */
    renderArmorSlotLegacy(armorData) {
        let itemDef = null;
        let itemIconHtml = `<span class="slot-icon-emoji">🛡️</span>`;
        let itemId = null;

        if (armorData) {
            itemId = typeof armorData === 'string' ? armorData : armorData.itemId;
            if (itemId) {
                const baseId = this.parseInstanceId(itemId);
                itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(baseId) : null;
                if (itemDef) {
                    if (typeof IconHelper !== 'undefined') {
                        itemIconHtml = IconHelper.getItemIconHTML(itemDef, { size: 40, className: 'slot-icon-img' });
                    } else if (itemDef.icon) {
                        itemIconHtml = `<span class="slot-icon-emoji">${itemDef.icon}</span>`;
                    }
                }
            }
        }

        const isEmpty = !itemDef;
        const isFilled = itemDef !== null;
        const title = itemDef?.name || 'Armor Set';

        const instancedItem = itemId ? GameEngine.state.bank?.instanced?.[itemId] : null;
        const rarity = instancedItem?.rarity || itemDef?.rarity || 'common';
        const rarityData = GameEngine.definitions?.RARITY_TIERS?.[rarity] || { color: '#9e9e9e' };
        const rarityColor = rarityData.color;
        const hasGlow = rarityData.glow;

        return `
            <div class="loadout-slot loadout-slot--armor ${isEmpty ? 'loadout-slot--empty' : ''} ${isFilled ? 'loadout-slot--filled' : ''} ${hasGlow ? 'loadout-slot--glow' : ''} rarity-${rarity}"
                 ${isFilled ? `style="--rarity-color: ${rarityColor};"` : ''}
                 title="${title}${isFilled ? ` (${rarity})` : ''}" data-slot="armor">
                <span class="slot-icon">${itemIconHtml}</span>
                <span class="slot-label">Armor</span>
            </div>
        `;
    },

    /**
     * Legacy tech slot rendering (fallback)
     * @private
     */
    renderTechSlotLegacy(itemData, slotName, requiredInt, currentInt) {
        const isLocked = currentInt < requiredInt;
        const icon = this.SLOT_ICONS[slotName] || '💾';
        let itemDef = null;
        let itemIconHtml = `<span class="slot-icon-emoji">${icon}</span>`;

        if (!isLocked && itemData) {
            const itemId = typeof itemData === 'string' ? itemData : itemData.itemId;
            if (itemId) {
                const baseId = this.parseInstanceId(itemId);
                itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(baseId) : null;
                if (itemDef) {
                    if (typeof IconHelper !== 'undefined') {
                        itemIconHtml = IconHelper.getItemIconHTML(itemDef, { size: 24, className: 'slot-icon-img' });
                    } else if (itemDef.icon) {
                        itemIconHtml = `<span class="slot-icon-emoji">${itemDef.icon}</span>`;
                    }
                }
            }
        }

        const isEmpty = isLocked || !itemDef;
        const title = isLocked ? `Requires ${requiredInt} Intellect` : (itemDef?.name || slotName);

        return `
            <div class="tech-slot ${isEmpty ? 'tech-slot--empty' : ''} ${isLocked ? 'tech-slot--locked' : ''}"
                 title="${title}" data-slot="${slotName}">
                ${isLocked ? `<span class="slot-lock">🔒</span>` : `<span class="slot-icon">${itemIconHtml}</span>`}
            </div>
        `;
    },

    /**
     * Render recent activity panel
     */
    renderRecentActivityPanel() {
        const activity = this.getCurrentActivityStatus();

        return `
            <div class="overview-panel panel-activity">
                <div class="panel-header">
                    <span class="panel-icon">📋</span>
                    <span class="panel-title">Recent Activity</span>
                </div>
                <div class="panel-content">
                    <div class="activity-current">
                        <span class="activity-icon" style="color: ${activity.color};">${activity.icon}</span>
                        <div class="activity-info">
                            <span class="activity-title">${activity.title}</span>
                            <span class="activity-detail">${activity.detail}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render milestones panel
     */
    renderMilestonesPanel() {
        const milestones = this.getMilestones();

        return `
            <div class="overview-panel panel-milestones">
                <div class="panel-header">
                    <span class="panel-icon">🏆</span>
                    <span class="panel-title">Milestones</span>
                </div>
                <div class="panel-content">
                    <div class="milestones-list">
                        ${milestones.map(m => `
                            <div class="milestone-item ${m.achieved ? 'achieved' : ''}">
                                <span class="milestone-icon">${m.icon}</span>
                                <span class="milestone-text">${m.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // ===========================
    // SLOT RENDERING HELPERS
    // ===========================

    /**
     * Parse instance ID to get base item ID
     */
    parseInstanceId(fullId) {
        if (!fullId) return fullId;
        if (fullId.includes('_instance_')) {
            return fullId.split('_instance_')[0];
        }
        const parts = fullId.split('_');
        if (parts.length >= 3 && /^\d{13}$/.test(parts[parts.length - 2])) {
            return parts.slice(0, -2).join('_');
        }
        return fullId;
    },

    // ===========================
    // HELPER METHODS
    // ===========================

    /**
     * Get current activity status for header
     */
    getCurrentActivityStatus() {
        // Combat
        if (GameEngine.state.combat?.inCombat) {
            return { icon: '⚔️', text: 'In Combat', color: '#f44336', title: 'Combat', detail: 'Fighting enemy' };
        }

        // Gathering
        if (GameEngine.state.gatheringSession && GameEngine.state.currentActivity === 'gathering') {
            const session = GameEngine.state.gatheringSession;
            return {
                icon: session.isRecovering ? '⏳' : '⛏️',
                text: session.isRecovering ? 'Recovering' : 'Gathering',
                color: session.isRecovering ? '#FFC107' : '#4caf50',
                title: 'Gathering',
                detail: `${session.skill} - ${session.totalActions || 0} actions`
            };
        }

        // Crafting
        if (GameEngine.state.crafting?.activeCrafts?.length > 0) {
            const count = GameEngine.state.crafting.activeCrafts.length;
            return {
                icon: '🔨',
                text: `Crafting (${count})`,
                color: '#9c27b0',
                title: 'Crafting',
                detail: `${count} item${count > 1 ? 's' : ''} in queue`
            };
        }

        // Navigation
        if (GameEngine.state.activeNavigation?.isNavigating) {
            return { icon: '🗺️', text: 'Navigating', color: '#2196f3', title: 'Navigation', detail: 'Traveling...' };
        }

        // Idle
        return { icon: '💤', text: 'Idle', color: '#888', title: 'Idle', detail: 'Ready for action' };
    },

    /**
     * Calculate combat power
     */
    calculateCombatPower() {
        // Build POWER from the LIVE compiled stats so it matches the stats shown
        // below it. (GameEngine.calculateCombatPower uses the legacy StatCalculator
        // path, which diverges from real combat — only fall back to it if stats
        // haven't been compiled yet.)
        if (!GameEngine.state?.compiledStats) {
            if (typeof GameEngine.calculateCombatPower === 'function') {
                return GameEngine.calculateCombatPower();
            }
        }

        const stats = this.getLiveCombatStats();
        const charLevel = GameEngine.state?.characterLevel?.level || 1;
        const weight = GameEngine.state?.compiledStats?.weight || 0;
        const avgDamage = (stats.minDamage + stats.maxDamage) / 2;

        // Average unlocked non-combat skill level (matches equipmentSystem formula)
        const skills = GameEngine.state?.skills || {};
        let totalSkillLevels = 0, skillCount = 0;
        for (const id in skills) {
            if (id !== 'combat' && skills[id]?.unlocked) {
                totalSkillLevels += skills[id].level || 0;
                skillCount++;
            }
        }
        const avgSkillLevel = skillCount > 0 ? totalSkillLevels / skillCount : 0;

        const power = Math.floor(
            (charLevel * 10) +                 // Base: character level
            (stats.maxHealth / 10) +           // Health contribution
            (avgDamage * 5) +                  // Damage contribution
            (stats.damageReduction * 100) +    // Defense contribution
            (stats.attacksPerSec * 20) +       // Speed contribution
            (weight * 0.5) +                   // Equipment weight
            (avgSkillLevel * 2)                // Skill average
        );

        // Tiers match equipmentSystem.calculateCombatPower for consistency
        const tiers = [
            { threshold: 5000, name: 'Master', color: '#ff9800' },
            { threshold: 2000, name: 'Expert', color: '#9c27b0' },
            { threshold: 1000, name: 'Skilled', color: '#2196f3' },
            { threshold: 500, name: 'Capable', color: '#4caf50' },
            { threshold: 0, name: 'Novice', color: '#ffffff' }
        ];
        const currentTier = tiers.find(t => power >= t.threshold) || tiers[tiers.length - 1];

        return { power, tier: currentTier.name, tierColor: currentTier.color };
    },

    /**
     * Get milestones for display
     */
    getMilestones() {
        const charLevel = GameEngine.state.characterLevel?.level || 1;
        const skills = GameEngine.state.skills || {};

        // Calculate total skill levels
        const totalSkillLevels = Object.values(skills).reduce((sum, s) => sum + (s?.level || 0), 0);

        // Check for max level skills
        const maxLevelSkills = Object.values(skills).filter(s => s?.level >= 100).length;

        return [
            { icon: '🎯', text: `Character Level ${charLevel}`, achieved: charLevel >= 10 },
            { icon: '📚', text: `Total Skill Levels: ${totalSkillLevels}`, achieved: totalSkillLevels >= 50 },
            { icon: '⭐', text: `Mastered Skills: ${maxLevelSkills}`, achieved: maxLevelSkills >= 1 }
        ];
    },

    /**
     * Format quantity for compact display
     */
    formatQuantity(num) {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }
};
