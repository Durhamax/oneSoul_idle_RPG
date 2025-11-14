/**
 * CUSTOM MODAL SYSTEM
 *
 * Provides styled alert and confirm dialogs that match the game's theme
 * Replaces default browser alert() and confirm() functions
 */

const Modal = {
    /**
     * Show a custom alert dialog
     * @param {string} message - Message to display
     * @param {string} title - Optional title (default: "Alert")
     * @returns {Promise} Resolves when user clicks OK
     */
    alert(message, title = "Alert") {
        return new Promise((resolve) => {
            const overlay = document.getElementById('modalOverlay');
            const container = document.getElementById('modalContainer');

            container.innerHTML = `
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button id="modalOkBtn" class="modal-btn modal-btn-primary">OK</button>
                </div>
            `;

            overlay.style.display = 'flex';

            // Handle OK button
            document.getElementById('modalOkBtn').onclick = () => {
                this.close();
                resolve(true);
            };

            // Handle escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                    resolve(true);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);

            // Focus OK button
            setTimeout(() => {
                document.getElementById('modalOkBtn')?.focus();
            }, 100);
        });
    },

    /**
     * Show a custom confirm dialog
     * @param {string} message - Message to display
     * @param {string} title - Optional title (default: "Confirm")
     * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
     */
    confirm(message, title = "Confirm") {
        return new Promise((resolve) => {
            const overlay = document.getElementById('modalOverlay');
            const container = document.getElementById('modalContainer');

            container.innerHTML = `
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button id="modalCancelBtn" class="modal-btn modal-btn-secondary">Cancel</button>
                    <button id="modalConfirmBtn" class="modal-btn modal-btn-primary">Confirm</button>
                </div>
            `;

            overlay.style.display = 'flex';

            // Handle Confirm button
            document.getElementById('modalConfirmBtn').onclick = () => {
                this.close();
                resolve(true);
            };

            // Handle Cancel button
            document.getElementById('modalCancelBtn').onclick = () => {
                this.close();
                resolve(false);
            };

            // Handle escape key (counts as cancel)
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                    resolve(false);
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);

            // Focus Confirm button
            setTimeout(() => {
                document.getElementById('modalConfirmBtn')?.focus();
            }, 100);
        });
    },

    /**
     * Close the modal
     */
    close() {
        const overlay = document.getElementById('modalOverlay');
        overlay.style.display = 'none';
    }
};

// Store original functions for debugging if needed
window._originalAlert = window.alert;
window._originalConfirm = window.confirm;

// Override global alert and confirm to use custom modals
// Note: These return Promises, so use with await in async functions
// For synchronous-looking code, the modal will still display but won't block execution
window.alert = async (message, title) => {
    return await Modal.alert(message, title);
};

window.confirm = async (message, title) => {
    return await Modal.confirm(message, title);
};
