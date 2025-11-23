/**
 * UI COMPONENT BASE CLASS
 *
 * Base class for all UI components. Implements state-driven rendering
 * with automatic caching to prevent unnecessary re-renders.
 *
 * Follows Foundation Specification Layer 4 pattern.
 */

class UIComponent {
    constructor() {
        this.lastState = null;
        this.element = null;
        this.eventHandlers = [];
    }

    /**
     * Check if component should update based on state change
     * Override for custom comparison logic
     * @param {object} newState - New state to compare
     * @returns {boolean} True if should re-render
     */
    shouldUpdate(newState) {
        const newStateStr = JSON.stringify(newState);
        if (newStateStr === this.lastState) {
            return false;
        }
        this.lastState = newStateStr;
        return true;
    }

    /**
     * Render the component
     * Must be implemented by subclass
     * @param {object} state - Current state slice
     */
    render(state) {
        throw new Error('UIComponent.render() must be implemented by subclass');
    }

    /**
     * Attach event handler with automatic cleanup
     * @param {string} event - Event name
     * @param {function} handler - Event handler
     */
    on(event, handler) {
        const unsubscribe = EventBus.on(event, handler);
        this.eventHandlers.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Clean up component (call when removing component)
     */
    destroy() {
        // Unsubscribe from all events
        for (const unsubscribe of this.eventHandlers) {
            unsubscribe();
        }
        this.eventHandlers = [];
        this.element = null;
        this.lastState = null;
    }

    /**
     * Get element by ID with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`[UIComponent] Element not found: ${id}`);
        }
        return element;
    }

    /**
     * Safe innerHTML setter with error handling
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content
     */
    setHTML(element, html) {
        if (!element) {
            console.error('[UIComponent] Cannot set HTML on null element');
            return;
        }

        try {
            element.innerHTML = html;
        } catch (error) {
            console.error('[UIComponent] Failed to set innerHTML:', error);
        }
    }
}

console.log('✅ UIComponent base class loaded');
