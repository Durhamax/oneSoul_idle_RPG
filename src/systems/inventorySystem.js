/**
 * INVENTORY SYSTEM
 *
 * Manages bank/inventory storage, tabs, item quantities, and new item tracking.
 */

const InventorySystem = {
    /**
     * Get item definition from ItemRegistry (standardized access pattern)
     * @param {string} itemId - Item ID to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    _getItemDef(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },

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

        console.log('✅ InventorySystem initialized (ItemRegistry pattern)');
    },

    addItemToBank(itemId, quantity, tab = null) {
        // Use standardized item access pattern
        const itemDef = InventorySystem._getItemDef.call(this, itemId);

        if (!itemDef) {
            console.error(`❌ Item ${itemId} not found`);
            return { success: false, reason: "Item not found" };
        }

        // DUAL-BANK: Check if item should be instanced or stackable
        const isInstanced = itemDef.instanced === true;

        // Determine which tab to use based on category + slot
        let targetTab = tab;

        if (!targetTab) {
            targetTab = InventorySystem._getTabForItem.call(this, itemId, itemDef);
        }

        // Check if tab exists
        if (!this.state.bank.tabs[targetTab]) {
            console.warn(`⚠️ Tab ${targetTab} doesn't exist, creating it`);
            this.createBankTab(targetTab, targetTab, "📦");
        }

        // DUAL-BANK: Route to appropriate storage
        if (isInstanced) {
            // For instanced items, create individual instances
            console.warn(`⚠️ Attempted to add instanced item ${itemId} via addItemToBank - use addEquipmentInstance instead`);
            return {
                success: false,
                reason: "Use addEquipmentInstance() for instanced items"
            };
        } else {
            // For stackable items, add to stackable storage
            const result = DualBankSystem.addStackable(itemId, quantity);

            if (result.success) {
                // Track new items (backward compatibility)
                const isNew = !this.state.bank.stackable[itemId] || this.state.bank.newItems.includes(itemId);

                if (isNew && !this.state.bank.newItems.includes(itemId)) {
                    this.state.bank.newItems.push(itemId);
                    console.log(`✨ New item discovered: ${itemDef.name}!`);
                }

                // Update old bank.items for backward compatibility during transition
                if (!this.state.bank.items[itemId]) {
                    this.state.bank.items[itemId] = {
                        quantity: result.newQuantity,
                        tab: targetTab,
                        isNew: isNew,
                        lastAddedTime: Date.now()
                    };
                } else {
                    this.state.bank.items[itemId].quantity = result.newQuantity;
                    this.state.bank.items[itemId].lastAddedTime = Date.now();
                }

                // Trigger mission objective check for item collection
                if (this.checkMissionObjectives) {
                    this.checkMissionObjectives('item_gained', {
                        itemId: itemId,
                        amount: quantity
                    });
                }

                // Emit inventory event for instant UI updates
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('item-added', {
                        itemId: itemId,
                        quantity: quantity,
                        newQuantity: result.newQuantity,
                        tab: targetTab,
                        isNew: isNew
                    });
                }

                return {
                    success: true,
                    amountAdded: quantity,
                    newQuantity: result.newQuantity
                };
            } else {
                return result;
            }
        }
    },

    /**
     * Get the count of an item in the bank
     * @param {string} itemId - Item ID to check
     * @returns {number} - Quantity of the item (0 if not found)
     */
    getItemCount(itemId) {
        // DUAL-BANK: Check both storages

        // Check stackable storage first
        if (this.state.bank.stackable[itemId] !== undefined) {
            return this.state.bank.stackable[itemId];
        }

        // Check if it's an instanced item (instances are always quantity 1)
        if (this.state.bank.instanced[itemId]) {
            return 1;
        }

        // Fallback: Check old bank.items for backward compatibility
        const bankItem = this.state.bank.items[itemId];
        return bankItem ? bankItem.quantity : 0;
    },

    /**
     * Remove items from the bank
     */
    removeItemFromBank(itemId, quantity) {
        // DUAL-BANK: Check if this is a stackable or instanced item

        // First check if it's in stackable storage
        if (this.state.bank.stackable[itemId] !== undefined) {
            // Stackable item
            const result = DualBankSystem.removeStackable(itemId, quantity);

            if (result.success) {
                // Update old bank.items for backward compatibility
                const wasRemoved = result.newQuantity <= 0;

                if (wasRemoved && this.state.bank.items[itemId]) {
                    delete this.state.bank.items[itemId];
                } else if (this.state.bank.items[itemId]) {
                    this.state.bank.items[itemId].quantity = result.newQuantity;
                }

                // Emit inventory event for instant UI updates
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('item-removed', {
                        itemId: itemId,
                        quantity: quantity,
                        newQuantity: result.newQuantity,
                        fullyRemoved: wasRemoved
                    });
                }

                return {
                    success: true,
                    newQuantity: result.newQuantity
                };
            } else {
                return result;
            }
        }
        // Check if it's an instanced item
        else if (this.state.bank.instanced[itemId]) {
            // Instanced item - can only remove quantity of 1
            if (quantity !== 1) {
                return { success: false, reason: "Instanced items can only be removed one at a time" };
            }

            const result = DualBankSystem.removeInstance(itemId);

            if (result.success) {
                // Update old bank.items for backward compatibility
                if (this.state.bank.items[itemId]) {
                    delete this.state.bank.items[itemId];
                }

                // Emit inventory event for instant UI updates
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('item-removed', {
                        itemId: itemId,
                        quantity: 1,
                        newQuantity: 0,
                        fullyRemoved: true
                    });
                }

                return {
                    success: true,
                    newQuantity: 0
                };
            } else {
                return result;
            }
        }
        // Fallback: Check old bank.items (backward compatibility)
        else if (this.state.bank.items[itemId]) {
            const bankItem = this.state.bank.items[itemId];

            if (bankItem.quantity < quantity) {
                return { success: false, reason: "Insufficient quantity" };
            }

            bankItem.quantity -= quantity;

            // Check if item was fully removed
            const wasRemoved = bankItem.quantity <= 0;

            // Remove item entry if quantity reaches 0
            if (wasRemoved) {
                delete this.state.bank.items[itemId];
            }

            // Emit inventory event for instant UI updates
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('item-removed', {
                    itemId: itemId,
                    quantity: quantity,
                    newQuantity: wasRemoved ? 0 : bankItem.quantity,
                    fullyRemoved: wasRemoved
                });
            }

            return {
                success: true,
                newQuantity: wasRemoved ? 0 : bankItem.quantity
            };
        }
        // Item not found anywhere
        else {
            return { success: false, reason: "Item not found in bank" };
        }
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

        // DUAL-BANK: Read from both stackable and instanced storage

        // 1. Get stackable items (resources, materials, consumables)
        for (let itemId in this.state.bank.stackable) {
            const quantity = this.state.bank.stackable[itemId];
            const itemDef = InventorySystem._getItemDef.call(this, itemId);

            if (!itemDef) continue;

            // Determine tab for stackable item
            const itemTab = InventorySystem._getTabForItem.call(this, itemId, itemDef);

            if (itemTab === tabId) {
                items.push({
                    itemId: itemId,
                    quantity: quantity,
                    tab: itemTab,
                    definition: itemDef,
                    isNew: this.state.bank.newItems.includes(itemId)
                });
            }
        }

        // 2. Get instanced items (weapons, armor, tools, mods)
        for (let uniqueId in this.state.bank.instanced) {
            const instance = this.state.bank.instanced[uniqueId];
            const itemDef = InventorySystem._getItemDef.call(this, instance.baseItemId);

            if (!itemDef) continue;

            // Determine tab for instanced item
            const itemTab = InventorySystem._getTabForItem.call(this, instance.baseItemId, itemDef);

            if (itemTab === tabId) {
                items.push({
                    itemId: uniqueId,  // Use unique ID for instances
                    baseItemId: instance.baseItemId,
                    quantity: 1,  // Instances are always quantity 1
                    tab: itemTab,
                    definition: itemDef,
                    instance: instance,  // Include full instance data
                    isNew: this.state.bank.newItems.includes(uniqueId)
                });
            }
        }

        return items;
    },

    /**
     * Helper: Determine which tab an item belongs to
     */
    _getTabForItem(itemId, itemDef) {
        // Check if item has explicit tab assignment (from old bank.items)
        const oldBankItem = this.state.bank.items?.[itemId];
        if (oldBankItem?.tab) {
            return oldBankItem.tab;
        }

        // Determine tab based on item definition
        const slot = itemDef.slot;
        const category = itemDef.category;

        // Equipment tabs (3-1-3 Grid)
        if (slot === 'tool') return 'tool';
        if (slot === 'weapon') return 'weapon';
        if (slot === 'ammo') return 'ammo';
        if (['armor', 'back', 'gloves', 'neck', 'boots', 'ring'].includes(slot)) return 'armor';

        // Consumable tabs
        if (category === 'consumable') {
            if (slot === 'food') return 'food';
            if (slot === 'potion') return 'potion';
            return 'food';
        }

        // Material/resource tab
        if (category === 'material') return 'material';

        // Currency/special tabs
        if (category === 'currency') return 'material';
        if (category === 'quest') return 'quest';
        if (category === 'key') return 'material';
        if (category === 'special') return 'material';

        // Perk tab
        if (category === 'perk') return 'perk';

        // Default to material tab
        return 'material';
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

        // DUAL-BANK: Add to instanced storage
        const result = DualBankSystem.addInstance(instance);

        // Handle both boolean and object return types
        if (result === false || (typeof result === 'object' && !result.success)) {
            return { success: false, reason: "Failed to add to dual-bank storage" };
        }

        // Also store in old equipmentInstances for backward compatibility
        this.state.bank.equipmentInstances[instance.instanceId] = instance;

        console.log(`✨ Added equipment instance: ${instance.name} (${instance.instanceId})`);

        // Track as new item
        if (!this.state.bank.newItems.includes(instance.instanceId)) {
            this.state.bank.newItems.push(instance.instanceId);
        }

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

        // Emit inventory event for instant UI updates
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('equipment-instance-added', {
                instance: instance
            });
        }

        return { success: true, instanceId: instance.instanceId };
    },

    /**
     * Get equipment instance by ID
     * @param {string} instanceId - Instance ID
     * @returns {object|null} - Equipment instance or null
     */
    getEquipmentInstance(instanceId) {
        // DUAL-BANK: Check instanced storage first
        const instance = DualBankSystem.getInstance(instanceId);

        if (instance) {
            return instance;
        }

        // Fallback: Check old equipmentInstances for backward compatibility
        return this.state.bank.equipmentInstances[instanceId] || null;
    },

    /**
     * Remove equipment instance from bank
     * @param {string} instanceId - Instance ID
     * @returns {object} - {success: boolean}
     */
    removeEquipmentInstance(instanceId) {
        // DUAL-BANK: Remove from instanced storage
        // DualBankSystem.removeInstance returns the removed instance or null
        const removedInstance = DualBankSystem.removeInstance(instanceId);

        if (!removedInstance) {
            // Try fallback to old storage
            if (!this.state.bank.equipmentInstances[instanceId]) {
                console.warn(`❌ Instance not found: ${instanceId}`);
                return { success: false, reason: "Instance not found" };
            }
        }

        // Also remove from old equipmentInstances for backward compatibility
        if (this.state.bank.equipmentInstances[instanceId]) {
            delete this.state.bank.equipmentInstances[instanceId];
        }

        // Also remove from legacy bank.items if present
        if (this.state.bank.items[instanceId]) {
            delete this.state.bank.items[instanceId];
        }

        console.log(`✅ Removed equipment instance: ${instanceId}`);
        return { success: true, instance: removedInstance };
    },

    /**
     * Get all equipment instances for a base item ID
     * @param {string} baseItemId - Base item ID (optional)
     * @returns {array} - Array of equipment instances
     */
    getAllEquipmentInstances(baseItemId = null) {
        // DUAL-BANK: Get from instanced storage
        if (baseItemId) {
            return DualBankSystem.getInstancesByBaseId(baseItemId);
        } else {
            // Get all instances
            const instances = [];
            for (let uniqueId in this.state.bank.instanced) {
                instances.push(this.state.bank.instanced[uniqueId]);
            }

            // Also check old storage for backward compatibility
            for (let instanceId in this.state.bank.equipmentInstances) {
                const instance = this.state.bank.equipmentInstances[instanceId];
                // Only add if not already in new storage
                if (!this.state.bank.instanced[instanceId]) {
                    instances.push(instance);
                }
            }

            return instances;
        }
    }
};
