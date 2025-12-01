/**
 * ENEMY SELECTION PANEL
 *
 * Enemy and incursion browser interface
 * Uses crafting-style UI patterns (pills, cards, sections)
 */

const EnemySelectionPanel = {
    currentFilter: 'all', // Filter by difficulty: all, easy, medium, hard, elite

    /**
     * Render enemy selection panel
     */
    render() {
        const enemies = this.getAvailableEnemies();
        const incursions = this.getAvailableIncursions();

        return `
            <div class="enemy-selection-panel">
                ${this.renderFilterPills(enemies)}
                ${this.renderEnemySection(enemies)}
                ${this.renderIncursionSection(incursions)}
            </div>
        `;
    },

    /**
     * Render filter pills (like skill pills in crafting UI)
     */
    renderFilterPills(enemies) {
        // Count enemies by difficulty
        const counts = { all: enemies.length, easy: 0, medium: 0, hard: 0, elite: 0 };
        enemies.forEach(enemy => {
            const diff = this.getDifficultyInfo(enemy);
            if (diff.class === 'difficulty-easy') counts.easy++;
            else if (diff.class === 'difficulty-medium') counts.medium++;
            else if (diff.class === 'difficulty-hard') counts.hard++;
            else if (diff.class === 'difficulty-elite') counts.elite++;
        });

        const filters = [
            { id: 'all', label: 'All', icon: '👾', count: counts.all },
            { id: 'easy', label: 'Easy', icon: '🟢', count: counts.easy },
            { id: 'medium', label: 'Medium', icon: '🟡', count: counts.medium },
            { id: 'hard', label: 'Hard', icon: '🟠', count: counts.hard },
            { id: 'elite', label: 'Elite', icon: '🔴', count: counts.elite }
        ];

        return `
            <div class="enemy-filter-container">
                <div class="enemy-filter-pills">
                    ${filters.map(filter => `
                        <div class="enemy-type-pill ${this.currentFilter === filter.id ? 'active' : ''} ${filter.count === 0 ? 'disabled' : ''}"
                             onclick="${filter.count > 0 ? `EnemySelectionPanel.setFilter('${filter.id}')` : ''}"
                             data-filter="${filter.id}">
                            <span class="pill-icon">${filter.icon}</span>
                            <span class="pill-label">${filter.label}</span>
                            <span class="pill-count">${filter.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Set difficulty filter
     */
    setFilter(filterId) {
        this.currentFilter = filterId;
        CombatUI.render();
    },

    /**
     * Render single enemies section
     */
    renderEnemySection(enemies) {
        // Filter enemies based on current filter
        const filteredEnemies = this.currentFilter === 'all'
            ? enemies
            : enemies.filter(enemy => {
                const diff = this.getDifficultyInfo(enemy);
                return diff.class === `difficulty-${this.currentFilter}`;
            });

        return `
            <div class="combat-section-card">
                <div class="combat-section-header" onclick="EnemySelectionPanel.toggleSection('enemies')">
                    <div class="combat-section-title">
                        <span class="section-icon">👾</span>
                        <span>Single Enemies</span>
                    </div>
                    <span class="combat-section-count">${filteredEnemies.length} available</span>
                </div>
                <div class="combat-section-content" id="enemies-section">
                    <div class="enemy-grid">
                        ${filteredEnemies.length > 0
                            ? filteredEnemies.map(enemy => this.renderEnemyTile(enemy)).join('')
                            : '<div class="no-enemies">No enemies match the selected filter</div>'
                        }
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render incursions section
     */
    renderIncursionSection(incursions) {
        if (incursions.length === 0) {
            return ''; // Don't show empty incursion section
        }

        return `
            <div class="combat-section-card">
                <div class="combat-section-header" onclick="EnemySelectionPanel.toggleSection('incursions')">
                    <div class="combat-section-title">
                        <span class="section-icon">🏰</span>
                        <span>Incursions</span>
                    </div>
                    <span class="combat-section-count">${incursions.length} available</span>
                </div>
                <div class="combat-section-content" id="incursions-section">
                    <div class="incursion-grid">
                        ${incursions.map(incursion => this.renderIncursionTile(incursion)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render enemy tile (card-based like crafting recipe cards)
     */
    renderEnemyTile(enemy) {
        const typeIcon = this.getDamageTypeIcon(enemy.damageType || 'pierce');
        const difficulty = this.getDifficultyInfo(enemy);
        const powerRating = this.getCombatPower(enemy);

        // Use .png asset if available, otherwise fall back to emoji icon
        const assetPath = enemy.assetPath || `assets/enemies/${enemy.id}.png`;
        const imageDisplay = enemy.assetPath || enemy.useAsset ?
            `<img src="${assetPath}" alt="${enemy.name}" class="enemy-card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
             <span class="enemy-card-icon" style="display:none;">${enemy.icon || '👾'}</span>` :
            `<span class="enemy-card-icon">${enemy.icon || '👾'}</span>`;

        return `
            <div class="enemy-card ${difficulty.class}" data-enemy-id="${enemy.id}" onclick="CombatUI.openEnemyModal('${enemy.id}')">
                <div class="enemy-card-image">
                    ${imageDisplay}
                </div>
                <div class="enemy-card-content">
                    <div class="enemy-card-header">
                        <span class="enemy-card-name">${enemy.name}</span>
                        <span class="enemy-card-level">Lv.${enemy.level}</span>
                    </div>
                    <div class="enemy-card-stats">
                        <span class="enemy-stat" title="Combat Power">
                            <span class="stat-icon">⚡</span>${powerRating}
                        </span>
                        <span class="enemy-stat" title="Damage Type">
                            ${typeIcon}
                        </span>
                    </div>
                    <div class="enemy-card-difficulty ${difficulty.class}">
                        ${difficulty.label}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render incursion tile (card-based like crafting recipe cards)
     */
    renderIncursionTile(incursion) {
        const status = this.getIncursionStatus(incursion);

        return `
            <div class="incursion-card ${status.class}" data-incursion-id="${incursion.id}" onclick="CombatUI.openIncursionModal('${incursion.id}')">
                <div class="incursion-card-icon">${incursion.icon || '🏰'}</div>
                <div class="incursion-card-content">
                    <div class="incursion-card-header">
                        <span class="incursion-card-name">${incursion.name}</span>
                        <span class="incursion-card-level">Lv.${incursion.recommendedLevel || 10}</span>
                    </div>
                    <div class="incursion-card-stats">
                        <span class="incursion-stat">
                            <span class="stat-icon">🌊</span>${incursion.waves?.length || 3} Waves
                        </span>
                    </div>
                    <div class="incursion-card-rewards">
                        <span class="rewards-label">Rewards:</span>
                        <span class="rewards-text">${incursion.rewardPreview || 'Gold, Items'}</span>
                    </div>
                    <div class="incursion-card-status ${status.class}">
                        ${status.label}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get available enemies
     */
    getAvailableEnemies() {
        // Get enemies from EnemyRegistry
        if (typeof EnemyRegistry !== 'undefined') {
            const enemies = EnemyRegistry.getAllActive();
            // Convert to array if it's an object
            return Array.isArray(enemies) ? enemies : Object.values(enemies);
        }
        // Fallback to legacy enemies
        return GameEngine.definitions?.enemies ? Object.values(GameEngine.definitions.enemies) : [];
    },

    /**
     * Get available incursions
     */
    getAvailableIncursions() {
        // Get incursions from registry (when implemented)
        if (typeof IncursionRegistry !== 'undefined') {
            const incursions = IncursionRegistry.getAllActive();
            // Convert to array if it's an object
            return Array.isArray(incursions) ? incursions : Object.values(incursions);
        }
        return [];
    },

    /**
     * Get damage type icon
     */
    getDamageTypeIcon(type) {
        const icons = {
            pierce: '⚡',
            explosive: '💥',
            cryo: '❄️',
            shock: '⚡',
            incendiary: '🔥'
        };
        return icons[type] || '⚔️';
    },

    /**
     * Get damage type color
     */
    getDamageTypeColor(type) {
        const colors = {
            pierce: '#90caf9',
            explosive: '#ef5350',
            cryo: '#64b5f6',
            shock: '#ffd54f',
            incendiary: '#ff7043'
        };
        return colors[type] || '#9e9e9e';
    },

    /**
     * Get combat power rating for enemy
     */
    getCombatPower(enemy) {
        // Use EnemyRegistry's power rating if available
        if (typeof EnemyRegistry !== 'undefined' && EnemyRegistry.getPowerRating) {
            return EnemyRegistry.getPowerRating(enemy.id);
        }

        // Fallback calculation: HP/10 + avgDamage*5 + accuracy/10 + evasion/5 + armor/5
        const avgDamage = ((enemy.minDamage || 0) + (enemy.maxDamage || 0)) / 2;
        return Math.floor(
            ((enemy.maxHP || enemy.health || 100) / 10) +
            (avgDamage * 5) +
            ((enemy.accuracy || 50) / 10) +
            ((enemy.evasion || 0) / 5) +
            ((enemy.armorRating || 0) / 5)
        );
    },

    /**
     * Get difficulty info for enemy
     */
    getDifficultyInfo(enemy) {
        const playerLevel = GameEngine.state?.characterLevel?.level || 1;
        const levelDiff = enemy.level - playerLevel;

        if (levelDiff <= -5) {
            return { class: 'difficulty-easy', label: 'Easy' };
        } else if (levelDiff <= 0) {
            return { class: 'difficulty-medium', label: 'Medium' };
        } else if (levelDiff <= 5) {
            return { class: 'difficulty-hard', label: 'Hard' };
        } else {
            return { class: 'difficulty-elite', label: 'Elite' };
        }
    },

    /**
     * Get incursion status
     */
    getIncursionStatus(incursion) {
        // Check if player meets requirements
        const playerLevel = GameEngine.state?.characterLevel?.level || 1;

        if (playerLevel < incursion.recommendedLevel) {
            return { class: 'status-locked', label: 'Too Difficult' };
        }

        if (incursion.completed) {
            return { class: 'status-completed', label: 'Completed' };
        }

        return { class: 'status-available', label: 'Available' };
    },

    /**
     * Toggle section collapse
     */
    toggleSection(sectionId) {
        const section = document.getElementById(`${sectionId}-section`);
        if (section) {
            section.classList.toggle('collapsed');
        }
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
    module.exports = EnemySelectionPanel;
}
