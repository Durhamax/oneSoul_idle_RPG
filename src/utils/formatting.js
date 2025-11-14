/**
 * FORMATTING UTILITIES
 *
 * Provides utility functions for formatting numbers, time, and strings
 * for display throughout the game UI.
 */

const Formatting = {
    /**
     * Format numbers for display with K/M/B suffixes
     * @param {number} num - Number to format
     * @returns {string} - Formatted number string
     */
    formatNumber(num) {
        if (num < 10) {
            return num.toFixed(1);
        } else if (num < 1000) {
            return Math.floor(num).toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(1) + "K";
        } else if (num < 1000000000) {
            return (num / 1000000).toFixed(2) + "M";
        } else {
            return (num / 1000000000).toFixed(2) + "B";
        }
    },

    /**
     * Format time for display (seconds to human-readable)
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return Math.floor(seconds) + "s";
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    },

    /**
     * Capitalize first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
