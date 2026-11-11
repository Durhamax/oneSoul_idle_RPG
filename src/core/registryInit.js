/**
 * Registry Manager Initialization
 *
 * Initializes the RegistryManager after all data has been loaded.
 * Extracted from inline script in index.html to comply with architecture spec.
 */

// Wait for DOMContentLoaded to ensure all xxxInit.js files have run
window.addEventListener('DOMContentLoaded', () => {
    if (typeof RegistryManager !== 'undefined') {
        RegistryManager.init();
    }
});
