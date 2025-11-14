/**
 * SAVE SYSTEM
 *
 * Handles saving/loading game state to/from localStorage
 * and calculating offline progression
 */

const SaveSystem = {
    SAVE_KEY: "idleRpgSave_v1",
    AUTO_SAVE_INTERVAL: 30000, // Auto-save every 30 seconds
    autoSaveTimer: null,

    /**
     * Initialize the save system
     */
    init() {
        console.log("💾 Save System Initialized");

        // Try to load existing save
        const loaded = this.load();

        if (loaded) {
            console.log("📂 Save file loaded successfully");

            // Run all migrations on the loaded save (centralized in MigrationSystem)
            MigrationSystem.runAllMigrations();

            // Ensure perk grid unlock order exists (legacy compatibility)
            if (!GameEngine.state.perkGrid.unlockOrder) {
                GameEngine.state.perkGrid.unlockOrder = [];
            }
            console.log(`✅ Perk grid loaded (5x5 system)`);

            // Update equipment cells to reflect any equipped items
            if (GameEngine.updateEquipmentCells) {
                GameEngine.updateEquipmentCells();
                console.log("✅ Updated perk grid equipment cells after save load");
            }
        } else {
            console.log("📝 Starting new game");
        }

        // Start auto-save
        this.startAutoSave();

        // Save on page close
        window.addEventListener("beforeunload", () => {
            this.save();
        });

        return loaded;
    },

    /**
     * Save the current game state to localStorage
     */
    save() {
        try {
            // Update lastSaveTime before saving
            GameEngine.state.lastSaveTime = Date.now();

            const saveData = {
                state: GameEngine.state,
                timestamp: Date.now(),
                version: 1
            };

            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));

            console.log("💾 Game saved");
            return true;
        } catch (error) {
            console.error("❌ Save failed:", error);
            return false;
        }
    },

    /**
     * Load game state from localStorage
     */
    load() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);

            if (!savedData) {
                return false;
            }

            const saveData = JSON.parse(savedData);

            // Calculate offline progression
            const now = Date.now();
            const offlineTime = now - saveData.timestamp;

            // Load the saved state
            GameEngine.state = saveData.state;

            // Process offline time
            if (offlineTime > 5000) { // Only if offline for more than 5 seconds
                const minutesOffline = Math.floor(offlineTime / 1000 / 60);
                console.log(`🕐 You were offline for ${minutesOffline} minutes`);

                // Simulate offline combat
                const offlineResult = GameEngine.simulateOfflineCombat(offlineTime);

                // Show results UI if combat was simulated
                if (offlineResult) {
                    // Delay showing UI until after game is fully loaded
                    setTimeout(() => {
                        if (OfflineCombatUI) {
                            OfflineCombatUI.showResults(offlineResult, minutesOffline);
                        }
                    }, 500);
                }
            }

            // Restart the game loop with the loaded state
            GameEngine.state.lastTick = Date.now();
            GameEngine.startGameLoop();

            return true;
        } catch (error) {
            console.error("❌ Load failed:", error);
            return false;
        }
    },

    /**
     * Export save data as a string (for backup/sharing)
     */
    exportSave() {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            if (!saveData) {
                return null;
            }

            // Encode to base64 for easy copying
            const encoded = btoa(saveData);
            console.log("📤 Save exported to clipboard");
            return encoded;
        } catch (error) {
            console.error("❌ Export failed:", error);
            return null;
        }
    },

    /**
     * Import save data from a string
     */
    importSave(saveString) {
        try {
            // Decode from base64
            const decoded = atob(saveString);
            const saveData = JSON.parse(decoded);

            // Validate save data structure
            if (!saveData.state || !saveData.timestamp) {
                throw new Error("Invalid save data format");
            }

            // Store the imported save
            localStorage.setItem(this.SAVE_KEY, decoded);

            // Reload the game
            this.load();

            console.log("📥 Save imported successfully");
            return true;
        } catch (error) {
            console.error("❌ Import failed:", error);
            return false;
        }
    },

    /**
     * Delete the current save
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log("🗑️ Save deleted");
            return true;
        } catch (error) {
            console.error("❌ Delete failed:", error);
            return false;
        }
    },

    /**
     * Start auto-saving
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = setInterval(() => {
            this.save();
        }, this.AUTO_SAVE_INTERVAL);

        console.log(`⏰ Auto-save enabled (every ${this.AUTO_SAVE_INTERVAL / 1000}s)`);
    },

    /**
     * Stop auto-saving
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log("⏸️ Auto-save disabled");
        }
    },

    /**
     * Check if a save exists
     */
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    /**
     * Get save metadata without loading the full save
     */
    getSaveInfo() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                return null;
            }

            const saveData = JSON.parse(savedData);

            return {
                timestamp: saveData.timestamp,
                gameTime: saveData.state.gameTime,
                version: saveData.version,
                resources: saveData.state.resources
            };
        } catch (error) {
            console.error("❌ Failed to get save info:", error);
            return null;
        }
    }
};
