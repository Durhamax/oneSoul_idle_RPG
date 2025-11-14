/**
 * INVENTORY SYSTEM
 *
 * Manages bank/inventory storage, tabs, item quantities, and new item tracking.
 */

const InventorySystem = {
    /**
     * Initialize inventory system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all inventory functions to engine
        engine.addItemToBank = this.addItemToBank.bind(engine);
        engine.getItemCount = this.getItemCount.bind(engine);
        engine.removeItemFromBank = this.removeItemFromBank.bind(engine);
        engine.createBankTab = this.createBankTab.bind(engine);
        engine.switchBankTab = this.switchBankTab.bind(engine);
        engine.clearNewItemStatus = this.clearNewItemStatus.bind(engine);
        engine.getItemsInTab = this.getItemsInTab.bind(engine);
        engine.moveItemToTab = this.moveItemToTab.bind(engine);
        engine.autoCleanNewItems = this.autoCleanNewItems.bind(engine);

        // Equipment instance functions
        engine.addEquipmentInstance = this.addEquipmentInstance.bind(engine);
        engine.getEquipmentInstance = this.getEquipmentInstance.bind(engine);
        engine.removeEquipmentInstance = this.removeEquipmentInstance.bind(engine);
        engine.getAllEquipmentInstances = this.getAllEquipmentInstances.bind(engine);
    },

    addItemToBank(itemId, quantity, tab = null) {
        const itemDef = this.definitions.items[itemId];

        if (!itemDef) {
            console.error(`❌ Item ${itemId} not found in definitions`);
            return { success: false, reason: "Item not found" };
        }

        // Determine which tab to use - prioritize itemType over defaultTab
        let targetTab = tab;

        if (!targetTab) {
            // Try itemType first (for comprehensive item system)
            if (itemDef.itemType && this.state.bank.tabs[itemDef.itemType]) {
                targetTab = itemDef.itemType;
            }
            // Fall back to defaultTab with migration for old items
            else if (itemDef.defaultTab) {
                // Migration map for old tab names to new ones
                const tabMigration = {
                    'resources': 'resource',
                    'equipment': 'tool',
                    'consumables': 'consumable',
                    'tools': 'tool',
                    'weapons': 'weapon',
                    'armor': 'armor',
                    'accessories': 'technology'
                };

                targetTab = tabMigration[itemDef.defaultTab] || itemDef.defaultTab;

                // If the migrated tab doesn't exist, use resource as default
                if (!this.state.bank.tabs[targetTab]) {
                    targetTab = 'resource';
                }
            }
            // Fall back to 'resource' tab for uncategorized items
            else {
                targetTab = 'resource';
            }
        }

        // Check if tab exists
        if (!this.state.bank.tabs[targetTab]) {
            console.warn(`⚠️ Tab ${targetTab} doesn't exist, creating it`);
            this.createBankTab(targetTab, targetTab, "📦");
        }

        // Check if item already exists in bank
        if (!this.state.bank.items[itemId]) {
            // New item - create entry
            this.state.bank.items[itemId] = {
                quantity: 0,
                tab: targetTab,
                isNew: true,
                lastAddedTime: Date.now()
            };

            // Track as new item
            if (!this.state.bank.newItems.includes(itemId)) {
                this.state.bank.newItems.push(itemId);
            }

            console.log(`✨ New item discovered: ${itemDef.name}!`);
        }

        const bankItem = this.state.bank.items[itemId];

        // NO QUANTITY CAP - Bank has unlimited storage
        // (Remove the limit check entirely)

        // Add full quantity without capping
        bankItem.quantity += quantity;
        bankItem.lastAddedTime = Date.now();

        // Trigger mission objective check for item collection
        if (this.checkMissionObjectives) {
            this.checkMissionObjectives('item_gained', {
                itemId: itemId,
                amount: quantity
            });
        }

        return {
            success: true,
            amountAdded: quantity,
            newQuantity: bankItem.quantity
        };
    },

    /**
     * Get the count of an item in the bank
     * @param {string} itemId - Item ID to check
     * @returns {number} - Quantity of the item (0 if not found)
     */
    getItemCount(itemId) {
        const bankItem = this.state.bank.items[itemId];
        return bankItem ? bankItem.quantity : 0;
    },

    /**
     * Remove items from the bank
     */
    removeItemFromBank(itemId, quantity) {
        const bankItem = this.state.bank.items[itemId];

        if (!bankItem || bankItem.quantity < quantity) {
            return { success: false, reason: "Insufficient quantity" };
        }

        bankItem.quantity -= quantity;

        // Remove item entry if quantity reaches 0
        if (bankItem.quantity <= 0) {
            delete this.state.bank.items[itemId];
        }

        return {
            success: true,
            newQuantity: bankItem.quantity
        };
    },

    /**
     * Create a new bank tab
     */
    createBankTab(tabId, name, icon = "📦") {
        if (this.state.bank.tabs[tabId]) {
            return { success: false, reason: "Tab already exists" };
        }

        const order = Object.keys(this.state.bank.tabs).length;

        this.state.bank.tabs[tabId] = {
            name: name,
            icon: icon,
            order: order
        };

        console.log(`📁 Created bank tab: ${name}`);

        return { success: true };
    },

    /**
     * Switch active bank tab
     */
    switchBankTab(tabId) {
        if (!this.state.bank.tabs[tabId]) {
            return { success: false, reason: "Tab doesn't exist" };
        }

        this.state.bank.activeTab = tabId;
        return { success: true };
    },

    /**
     * Clear "new" status from an item
     */
    clearNewItemStatus(itemId) {
        if (this.state.bank.items[itemId]) {
            this.state.bank.items[itemId].isNew = false;
        }

        const index = this.state.bank.newItems.indexOf(itemId);
        if (index > -1) {
            this.state.bank.newItems.splice(index, 1);
        }
    },

    /**
     * Get all items in a specific tab
     */
    getItemsInTab(tabId) {
        const items = [];

        for (let itemId in this.state.bank.items) {
            const bankItem = this.state.bank.items[itemId];
            if (bankItem.tab === tabId) {
                items.push({
                    itemId: itemId,
                    ...bankItem,
                    definition: this.definitions.items[itemId]
                });
            }
        }

        return items;
    },

    /**
     * Move item to different tab
     */
    moveItemToTab(itemId, newTabId) {
        const bankItem = this.state.bank.items[itemId];

        if (!bankItem) {
            return { success: false, reason: "Item not in bank" };
        }

        if (!this.state.bank.tabs[newTabId]) {
            return { success: false, reason: "Tab doesn't exist" };
        }

        bankItem.tab = newTabId;
        return { success: true };
    },

    /**
     * Auto-clear old "new" item statuses (called periodically)
     * Items remain "new" for 30 seconds after being added
     */
    autoCleanNewItems() {
        const now = Date.now();
        const newItemTimeout = 30000; // 30 seconds

        for (let itemId of [...this.state.bank.newItems]) {
            const bankItem = this.state.bank.items[itemId];
            if (bankItem && (now - bankItem.lastAddedTime) > newItemTimeout) {
                this.clearNewItemStatus(itemId);
            }
        }
    },

    /**
     * Add equipment instance to bank
     * @param {object} instance - Equipment instance data
     * @returns {object} - {success: boolean, instanceId: string}
     */
    addEquipmentInstance(instance) {
        if (!instance || !instance.instanceId) {
            return { success: false, reason: "Invalid instance" };
        }

        // Store instance
        this.state.bank.equipmentInstances[instance.instanceId] = instance;

        console.log(`✨ Added equipment instance: ${instance.name} (${instance.instanceId})`);

        // Show notification
        if (typeof Animations !== 'undefined') {
            const rarityColors = {
                common: '#9e9e9e',
                uncommon: '#4caf50',
                rare: '#2196f3',
                epic: '#9c27b0',
                legendary: '#ff9800',
                mythic: '#f44336'
            };
            const color = rarityColors[instance.rarity] || '#9e9e9e';

            Animations.showNotification(`${instance.name}`, 'success', 3000);
        }

        return { success: true, instanceId: instance.instanceId };
    },

    /**
     * Get equipment instance by ID
     * @param {string} instanceId - Instance ID
     * @returns {object|null} - Equipment instance or null
     */
    getEquipmentInstance(instanceId) {
        return this.state.bank.equipmentInstances[instanceId] || null;
    },

    /**
     * Remove equipment instance from bank
     * @param {string} instanceId - Instance ID
     * @returns {object} - {success: boolean}
     */
    removeEquipmentInstance(instanceId) {
        if (!this.state.bank.equipmentInstances[instanceId]) {
            return { success: false, reason: "Instance not found" };
        }

        delete this.state.bank.equipmentInstances[instanceId];

        return { success: true };
    },

    /**
     * Get all equipment instances for a base item ID
     * @param {string} baseItemId - Base item ID (optional)
     * @returns {array} - Array of equipment instances
     */
    getAllEquipmentInstances(baseItemId = null) {
        const instances = [];

        for (let instanceId in this.state.bank.equipmentInstances) {
            const instance = this.state.bank.equipmentInstances[instanceId];

            if (!baseItemId || instance.baseItemId === baseItemId) {
                instances.push(instance);
            }
        }

        return instances;
    }
};
