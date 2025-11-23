/**
 * UI Initialization Module
 *
 * Initializes dopamine-optimized UI components when the DOM is ready.
 * Extracted from inline script in index.html to comply with architecture spec.
 */

window.addEventListener('DOMContentLoaded', () => {
    // Initialize game on page load
    if (typeof initGame === 'function') {
        initGame();
    }

    // Initialize PersistentActionBar
    if (typeof persistentActionBar !== 'undefined') {
        persistentActionBar.init();
        console.log('✅ PersistentActionBar initialized');
    }

    // Initialize SkillCard
    if (typeof skillCard !== 'undefined') {
        skillCard.init();
        console.log('✅ SkillCard initialized');
    }

    // Initialize NodePanel
    if (typeof nodePanel !== 'undefined') {
        nodePanel.init();
        console.log('✅ NodePanel initialized');
    }
});
