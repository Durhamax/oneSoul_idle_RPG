/**
 * PROGRESS BAR UTILITIES
 *
 * Global interval progress bar system that ensures consistent behavior
 * across all time-based activities (crafting, etc.).
 */

const ProgressBar = {
    /**
     * GLOBAL INTERVAL PROGRESS BAR SYSTEM
     * Calculates progress for all interval-based activities (crafting, collection, combat, navigation)
     * Ensures consistent behavior across all progress bars:
     *   - Start at 0% (empty bar)
     *   - Fill to 100% over activity duration
     *   - Brief visual pause at 100%
     *   - Reset to 0% for next cycle
     *
     * @param {number} startTime - Timestamp when interval started (ms)
     * @param {number} completionTime - Timestamp when interval completes (ms)
     * @returns {number} - Progress percentage (0-100)
     */
    calculateIntervalProgress(startTime, completionTime) {
        const now = Date.now();
        const elapsed = now - startTime;
        const totalTime = completionTime - startTime;

        // Grace period: Always show 0% for first 150ms
        // This ensures bars start empty even with render delays between
        // activity start and UI update (which can be 16-200ms)
        if (elapsed < 150) {
            return 0;
        }

        // Calculate and clamp progress to 0-100 range
        const rawProgress = (elapsed / totalTime) * 100;
        return Math.min(100, Math.max(0, rawProgress));
    },

    /**
     * Apply progress to a bar with instant reset behavior
     * When progress resets from high to 0, instantly jumps to 0% then smoothly fills
     *
     * @param {HTMLElement} progressBarElement - The progress bar DOM element
     * @param {number} newProgress - New progress percentage (0-100)
     * @param {number} lastProgress - Previous progress percentage (0-100)
     */
    applyProgressWithReset(progressBarElement, newProgress, lastProgress) {
        if (!progressBarElement) return;

        // If progress decreased and is now 0 (new interval started), instantly jump to 0%
        if (newProgress < lastProgress && newProgress === 0) {
            // Disable transition, set to 0, then re-enable transition
            progressBarElement.style.transition = 'none';
            progressBarElement.style.width = '0%';

            // Force reflow to apply the 0% immediately
            progressBarElement.offsetHeight;

            // Re-enable transition for smooth fill
            progressBarElement.style.transition = 'width 0.3s ease-out';
        } else {
            progressBarElement.style.width = `${newProgress}%`;
        }
    }
};
