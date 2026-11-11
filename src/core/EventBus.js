/**
 * EVENT BUS
 *
 * Simple pub/sub event system for decoupled communication between systems.
 * Follows Foundation Specification pattern.
 */

const EventBus = {
    listeners: {},

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Handler function
     * @returns {function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Handler to remove
     */
    off(event, callback) {
        if (!this.listeners[event]) return;

        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    },

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (!this.listeners[event]) return;

        for (const callback of this.listeners[event]) {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in ${event} handler:`, error);
            }
        }
    },

    /**
     * Subscribe to event once (auto-unsubscribe after first call)
     * @param {string} event - Event name
     * @param {function} callback - Handler function
     */
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };

        this.on(event, wrapper);
    },

    /**
     * Clear all listeners for an event
     * @param {string} event - Event name (if omitted, clears all)
     */
    clear(event) {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
    },

    /**
     * Get count of listeners for debugging
     * @returns {object} Listener counts by event
     */
    getListenerCount() {
        const counts = {};
        for (const [event, listeners] of Object.entries(this.listeners)) {
            counts[event] = listeners.length;
        }
        return counts;
    }
};

console.log('✅ EventBus initialized');
