/**
 * ICON HELPER UTILITY
 *
 * Provides unified icon display logic:
 * - Uses PNG iconPath if available
 * - Falls back to emoji icon
 * - Handles sizing and styling
 */

const IconHelper = {
    /**
     * Get HTML for displaying an item icon
     * @param {Object} item - Item definition object
     * @param {Object} options - Display options
     * @param {number} options.size - Size in pixels (default: 32)
     * @param {string} options.className - Additional CSS classes
     * @returns {string} HTML string for icon display
     */
    getItemIconHTML(item, options = {}) {
        if (!item) return '';

        const size = options.size || 32;
        const className = options.className || '';

        // Use PNG icon if available
        // Scale PNG icons 1.5x larger than specified size to match emoji visual weight
        if (item.iconPath) {
            const pngSize = Math.round(size * 1.5);
            return `<img src="${item.iconPath}"
                         alt="${item.name}"
                         class="item-icon ${className}"
                         style="width: ${pngSize}px; height: ${pngSize}px; object-fit: contain;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span class="item-icon-fallback" style="display: none; font-size: ${size * 0.75}px;">${item.icon || '📦'}</span>`;
        }

        // Fallback to emoji
        return `<span class="item-icon ${className}" style="font-size: ${size * 0.75}px;">${item.icon || '📦'}</span>`;
    },

    /**
     * Get just the icon source (for use in existing <img> tags)
     * @param {Object} item - Item definition object
     * @returns {string} Icon path or data URI for emoji
     */
    getItemIconSrc(item) {
        if (!item) return '';

        // Return PNG path if available
        if (item.iconPath) {
            return item.iconPath;
        }

        // For emoji, return as text (caller should handle display)
        return '';
    },

    /**
     * Check if item has PNG icon
     * @param {Object} item - Item definition object
     * @returns {boolean}
     */
    hasPNGIcon(item) {
        return !!(item && item.iconPath);
    },

    /**
     * Get icon display (for inline use)
     * @param {Object} item - Item definition object
     * @param {number} size - Size in pixels
     * @returns {string} Icon emoji or empty if using PNG
     */
    getIconEmoji(item, size = 24) {
        if (!item) return '📦';

        // If has PNG, don't show emoji
        if (item.iconPath) return '';

        return item.icon || '📦';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconHelper;
}
