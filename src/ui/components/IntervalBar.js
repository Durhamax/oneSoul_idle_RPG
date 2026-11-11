/**
 * INTERVAL BAR COMPONENT
 *
 * Reusable progress bar component for activity intervals.
 * Used across Gather, Combat, Crafting, and Navigation views.
 *
 * Features:
 * - Smooth CSS animation-based progress
 * - Configurable colors and gradients
 * - Icon and label support
 * - Stats display (time remaining, rate, etc.)
 * - Pulse animation on completion
 */

const IntervalBar = {
    // Track active intervals for cleanup
    activeIntervals: new Map(),

    /**
     * Render an interval bar
     * @param {Object} config - Configuration object
     * @param {string} config.id - Unique identifier for this bar
     * @param {string} config.label - Label text (e.g., "Mining", "Crafting")
     * @param {string} config.icon - Icon emoji
     * @param {number} config.current - Current progress value (ms elapsed)
     * @param {number} config.max - Maximum value (total interval ms)
     * @param {string} config.color - Primary color (CSS variable or hex)
     * @param {string} config.gradient - Optional gradient string
     * @param {boolean} config.animated - Whether to animate smoothly
     * @param {boolean} config.showTime - Show time remaining
     * @param {boolean} config.showPercent - Show percentage
     * @param {Object} config.stats - Additional stats { label: value }
     * @param {string} config.size - 'sm' | 'md' | 'lg'
     * @param {string} config.variant - 'default' | 'compact' | 'detailed'
     * @returns {string} HTML string
     */
    render(config) {
        const {
            id = 'interval-bar',
            label = 'Progress',
            icon = '⚡',
            current = 0,
            max = 1000,
            color = 'var(--color-primary)',
            gradient = null,
            animated = true,
            showTime = true,
            showPercent = false,
            stats = null,
            size = 'md',
            variant = 'default'
        } = config;

        const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
        const timeRemaining = Math.max(0, max - current);
        const timeText = this.formatTime(timeRemaining);
        const percentText = `${Math.floor(percent)}%`;

        const bgGradient = gradient || `linear-gradient(90deg, ${color}, ${color}dd)`;

        // Size classes
        const sizeConfig = {
            sm: { height: '6px', fontSize: '0.75rem', padding: '8px 12px' },
            md: { height: '10px', fontSize: '0.85rem', padding: '12px 16px' },
            lg: { height: '14px', fontSize: '1rem', padding: '16px 20px' }
        };
        const sizeStyles = sizeConfig[size] || sizeConfig.md;

        // Variant-specific rendering
        if (variant === 'compact') {
            return this.renderCompact({ id, icon, label, percent, bgGradient, timeText, showTime, sizeStyles });
        }

        if (variant === 'detailed') {
            return this.renderDetailed({ id, icon, label, percent, bgGradient, timeText, percentText, showTime, showPercent, stats, sizeStyles, color });
        }

        // Default variant
        return `
            <div class="interval-bar-container" id="${id}" data-current="${current}" data-max="${max}">
                <div class="interval-bar-header">
                    <div class="interval-bar-label">
                        <span class="interval-bar-icon">${icon}</span>
                        <span class="interval-bar-text">${label}</span>
                    </div>
                    <div class="interval-bar-value">
                        ${showTime ? `<span class="interval-bar-time">${timeText}</span>` : ''}
                        ${showPercent ? `<span class="interval-bar-percent">${percentText}</span>` : ''}
                    </div>
                </div>
                <div class="interval-bar-track" style="height: ${sizeStyles.height};">
                    <div class="interval-bar-fill ${animated ? 'animated' : ''}"
                         style="width: ${percent}%; background: ${bgGradient};">
                    </div>
                    ${percent >= 99 ? '<div class="interval-bar-pulse"></div>' : ''}
                </div>
                ${stats ? this.renderStats(stats) : ''}
            </div>
        `;
    },

    /**
     * Render compact variant (inline bar)
     */
    renderCompact(config) {
        const { id, icon, label, percent, bgGradient, timeText, showTime, sizeStyles } = config;

        return `
            <div class="interval-bar-compact" id="${id}">
                <span class="interval-bar-icon">${icon}</span>
                <div class="interval-bar-track-compact" style="height: ${sizeStyles.height};">
                    <div class="interval-bar-fill animated" style="width: ${percent}%; background: ${bgGradient};"></div>
                </div>
                ${showTime ? `<span class="interval-bar-time-compact">${timeText}</span>` : ''}
            </div>
        `;
    },

    /**
     * Render detailed variant (with stats grid)
     */
    renderDetailed(config) {
        const { id, icon, label, percent, bgGradient, timeText, percentText, showTime, showPercent, stats, sizeStyles, color } = config;

        return `
            <div class="interval-bar-detailed" id="${id}">
                <div class="interval-bar-header-detailed">
                    <div class="interval-bar-title">
                        <span class="interval-bar-icon-lg">${icon}</span>
                        <div class="interval-bar-title-text">
                            <span class="interval-bar-label-text">${label}</span>
                            ${showTime ? `<span class="interval-bar-subtitle">${timeText} remaining</span>` : ''}
                        </div>
                    </div>
                    ${showPercent ? `<span class="interval-bar-percent-badge" style="color: ${color};">${percentText}</span>` : ''}
                </div>
                <div class="interval-bar-track-detailed" style="height: ${sizeStyles.height};">
                    <div class="interval-bar-fill animated" style="width: ${percent}%; background: ${bgGradient};"></div>
                    ${percent >= 99 ? '<div class="interval-bar-pulse"></div>' : ''}
                </div>
                ${stats ? this.renderStatsGrid(stats, color) : ''}
            </div>
        `;
    },

    /**
     * Render inline stats
     */
    renderStats(stats) {
        if (!stats || Object.keys(stats).length === 0) return '';

        const statsHtml = Object.entries(stats)
            .map(([key, value]) => `<span class="interval-stat"><span class="stat-label">${key}:</span> <span class="stat-value">${value}</span></span>`)
            .join('');

        return `<div class="interval-bar-stats">${statsHtml}</div>`;
    },

    /**
     * Render stats as grid (for detailed variant)
     */
    renderStatsGrid(stats, color) {
        if (!stats || Object.keys(stats).length === 0) return '';

        const statsHtml = Object.entries(stats)
            .map(([key, value]) => `
                <div class="interval-stat-item">
                    <span class="stat-item-label">${key}</span>
                    <span class="stat-item-value" style="color: ${color};">${value}</span>
                </div>
            `)
            .join('');

        return `<div class="interval-bar-stats-grid">${statsHtml}</div>`;
    },

    /**
     * Update an existing interval bar's progress
     * @param {string} id - Bar ID
     * @param {number} current - Current progress
     * @param {number} max - Maximum value
     */
    update(id, current, max) {
        const container = document.getElementById(id);
        if (!container) return;

        const fill = container.querySelector('.interval-bar-fill');
        const timeEl = container.querySelector('.interval-bar-time, .interval-bar-time-compact');
        const percentEl = container.querySelector('.interval-bar-percent, .interval-bar-percent-badge');
        const subtitleEl = container.querySelector('.interval-bar-subtitle');

        const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
        const timeRemaining = Math.max(0, max - current);
        const timeText = this.formatTime(timeRemaining);

        if (fill) {
            fill.style.width = `${percent}%`;

            // Add/remove pulse effect
            const pulseEl = container.querySelector('.interval-bar-pulse');
            if (percent >= 99 && !pulseEl) {
                fill.insertAdjacentHTML('afterend', '<div class="interval-bar-pulse"></div>');
            } else if (percent < 99 && pulseEl) {
                pulseEl.remove();
            }
        }

        if (timeEl) timeEl.textContent = timeText;
        if (percentEl) percentEl.textContent = `${Math.floor(percent)}%`;
        if (subtitleEl) subtitleEl.textContent = `${timeText} remaining`;

        // Update data attributes
        container.dataset.current = current;
        container.dataset.max = max;
    },

    /**
     * Start an auto-updating interval bar
     * @param {string} id - Bar ID
     * @param {number} max - Total interval duration
     * @param {Function} onComplete - Callback when complete
     * @param {number} updateRate - Update frequency in ms
     */
    startInterval(id, max, onComplete = null, updateRate = 50) {
        // Clear any existing interval
        this.stopInterval(id);

        const startTime = Date.now();
        const container = document.getElementById(id);
        if (!container) return;

        const intervalId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            this.update(id, elapsed, max);

            if (elapsed >= max) {
                this.stopInterval(id);
                if (onComplete) onComplete();
            }
        }, updateRate);

        this.activeIntervals.set(id, { intervalId, startTime, max });
    },

    /**
     * Stop an auto-updating interval
     * @param {string} id - Bar ID
     */
    stopInterval(id) {
        const interval = this.activeIntervals.get(id);
        if (interval) {
            clearInterval(interval.intervalId);
            this.activeIntervals.delete(id);
        }
    },

    /**
     * Stop all active intervals
     */
    stopAll() {
        for (const [id, interval] of this.activeIntervals) {
            clearInterval(interval.intervalId);
        }
        this.activeIntervals.clear();
    },

    /**
     * Format time in human-readable format
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time string
     */
    formatTime(ms) {
        if (ms <= 0) return '0.0s';

        const seconds = ms / 1000;

        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (minutes < 60) {
            return `${minutes}m ${remainingSeconds}s`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    },

    /**
     * Create a gathering-specific interval bar
     */
    renderGatheringBar(config) {
        const { nodeIcon, nodeName, skillName, interval, progress } = config;

        return this.render({
            id: `gathering-interval-${config.nodeId || 'default'}`,
            label: nodeName,
            icon: nodeIcon,
            current: progress || 0,
            max: interval,
            color: 'var(--color-success)',
            gradient: 'linear-gradient(90deg, #4caf50, #8bc34a)',
            animated: true,
            showTime: true,
            variant: 'detailed',
            stats: {
                'Skill': skillName,
                'Interval': `${(interval / 1000).toFixed(1)}s`
            }
        });
    },

    /**
     * Create a crafting-specific interval bar
     */
    renderCraftingBar(config) {
        const { recipeName, recipeIcon, craftTime, progress, skillName } = config;

        return this.render({
            id: `crafting-interval-${config.recipeId || 'default'}`,
            label: recipeName,
            icon: recipeIcon || '🔨',
            current: progress || 0,
            max: craftTime,
            color: 'var(--color-secondary)',
            gradient: 'linear-gradient(90deg, #9c27b0, #e91e63)',
            animated: true,
            showTime: true,
            showPercent: true,
            variant: 'detailed',
            stats: skillName ? { 'Skill': skillName, 'Duration': `${(craftTime / 1000).toFixed(1)}s` } : null
        });
    },

    /**
     * Create a combat-specific interval bar
     */
    renderCombatBar(config) {
        const { attackerName, attackerIcon, attackSpeed, progress } = config;
        const interval = 1000 / attackSpeed; // Convert attacks/sec to ms

        return this.render({
            id: `combat-interval-${config.combatantId || 'default'}`,
            label: attackerName,
            icon: attackerIcon || '⚔️',
            current: progress || 0,
            max: interval,
            color: 'var(--color-danger)',
            gradient: 'linear-gradient(90deg, #f44336, #ff5722)',
            animated: true,
            showTime: false,
            showPercent: true,
            variant: 'compact'
        });
    },

    /**
     * Create a navigation/exploration-specific interval bar
     */
    renderNavigationBar(config) {
        const { regionName, exploreTime, progress, discoveryChance } = config;

        return this.render({
            id: 'navigation-interval',
            label: `Exploring ${regionName}`,
            icon: '🧭',
            current: progress || 0,
            max: exploreTime,
            color: 'var(--color-info)',
            gradient: 'linear-gradient(90deg, #2196F3, #64B5F6)',
            animated: true,
            showTime: true,
            variant: 'detailed',
            stats: discoveryChance ? { 'Discovery': `${(discoveryChance * 100).toFixed(0)}%` } : null
        });
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntervalBar;
}

// Make globally available
if (typeof window !== 'undefined') {
    window.IntervalBar = IntervalBar;
}
