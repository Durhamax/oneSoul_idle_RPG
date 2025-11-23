/**
 * DUAL-BANK SYSTEM
 *
 * Manages two separate storage types for items:
 * 1. Stackable Storage - Simple quantities for resources/materials/consumables
 * 2. Instanced Storage - Unique objects for weapons/armor/tools/mods
 *
 * This replaces the old unified bank.items structure.
 */

const DualBankSystem = {
    /**
     * Initialize the dual-bank structure
     */
    initialize() {
        if (!GameEngine.state.bank) {
            GameEngine.state.bank = {};
        }

        // Initialize new structure if it doesn't exist
        if (!GameEngine.state.bank.stackable) {
            GameEngine.state.bank.stackable = {};
        }

        if (!GameEngine.state.bank.instanced) {
            GameEngine.state.bank.instanced = {};
        }

        console.log('✅ DualBankSystem initialized');
    },

    // =================================================================
    // STACKABLE METHODS (Resources, Materials, Consumables)
    // =================================================================

    /**
     * Add stackable item to bank
     * @param {string} itemId - Item ID
     * @param {number} quantity - Amount to add
     * @returns {boolean} Success
     */
    addStackable(itemId, quantity = 1) {
        if (!itemId || quantity <= 0) {
            console.warn('❌ Invalid stackable add:', itemId, quantity);
            return false;
        }

        const def = ItemRegistry.getItem(itemId);
        if (!def) {
            console.warn('❌ Item not found in registry:', itemId);
            return false;
        }

        if (def.instanced === true) {
            console.warn('❌ Cannot add instanced item as stackable:', itemId);
            return false;
        }

        // Initialize if doesn't exist
        if (!GameEngine.state.bank.stackable[itemId]) {
            GameEngine.state.bank.stackable[itemId] = 0;
        }

        // Add quantity
        GameEngine.state.bank.stackable[itemId] += quantity;

        console.log(`✅ Added ${quantity}x ${itemId} (Total: ${GameEngine.state.bank.stackable[itemId]})`);
        return true;
    },

    /**
     * Remove stackable item from bank
     * @param {string} itemId - Item ID
     * @param {number} quantity - Amount to remove
     * @returns {boolean} Success
     */
    removeStackable(itemId, quantity = 1) {
        if (!itemId || quantity <= 0) {
            console.warn('❌ Invalid stackable remove:', itemId, quantity);
            return false;
        }

        const current = GameEngine.state.bank.stackable[itemId] || 0;
        if (current < quantity) {
            console.warn(`❌ Insufficient quantity: ${itemId} (have ${current}, need ${quantity})`);
            return false;
        }

        // Remove quantity
        GameEngine.state.bank.stackable[itemId] -= quantity;

        // Clean up if zero
        if (GameEngine.state.bank.stackable[itemId] <= 0) {
            delete GameEngine.state.bank.stackable[itemId];
        }

        console.log(`✅ Removed ${quantity}x ${itemId} (Remaining: ${GameEngine.state.bank.stackable[itemId] || 0})`);
        return true;
    },

    /**
     * Get stackable item quantity
     * @param {string} itemId - Item ID
     * @returns {number} Quantity
     */
    getStackableQuantity(itemId) {
        return GameEngine.state.bank.stackable[itemId] || 0;
    },

    /**
     * Check if has enough stackable quantity
     * @param {string} itemId - Item ID
     * @param {number} quantity - Required amount
     * @returns {boolean} Has enough
     */
    hasStackable(itemId, quantity = 1) {
        return this.getStackableQuantity(itemId) >= quantity;
    },

    // =================================================================
    // INSTANCED METHODS (Weapons, Armor, Tools, Mods)
    // =================================================================

    /**
     * Create a new unique instance
     * @param {string} baseItemId - Base item definition ID
     * @param {object} properties - Instance properties (rarity, attachments, etc.)
     * @returns {object|null} Created instance or null
     */
    createInstance(baseItemId, properties = {}) {
        const def = ItemRegistry.getItem(baseItemId);
        if (!def) {
            console.warn('❌ Item not found in registry:', baseItemId);
            return null;
        }

        if (def.instanced !== true) {
            console.warn('❌ Cannot create instance for non-instanced item:', baseItemId);
            return null;
        }

        // Generate unique ID (accept both uniqueId and instanceId for compatibility)
        const uniqueId = properties.uniqueId || properties.instanceId || `${baseItemId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Build instance object
        const instance = {
            baseItemId: baseItemId,
            uniqueId: uniqueId,
            instanceId: uniqueId,  // DUAL-BANK: Provide both for compatibility
            rarity: properties.rarity || def.rarity || 'common',
            equipped: properties.equipped || false,
            locked: properties.locked || false,
        };

        // Add mod-specific properties
        if (def.slot === 'attachment' || def.itemType === 'attachment') {
            instance.modType = properties.modType || def.modType || def.attachmentSlot;
            instance.modStat = properties.modStat || def.modStat || def.bonusStat;
            instance.multiplier = properties.multiplier || def.bonusValue || this.getRarityMultiplier(instance.rarity);
        }

        // Add weapon/armor-specific properties
        if (def.slot === 'weapon' || ['head', 'body', 'legs', 'feet', 'hands', 'offhand', 'accessory'].includes(def.slot)) {
            instance.attachments = properties.attachments || {};
        }

        // Add any additional custom properties
        Object.keys(properties).forEach(key => {
            if (!instance.hasOwnProperty(key)) {
                instance[key] = properties[key];
            }
        });

        console.log('✅ Created instance:', uniqueId, instance);
        return instance;
    },

    /**
     * Add instance to bank
     * @param {object} instance - Instance object
     * @returns {boolean} Success
     */
    addInstance(instance) {
        // DUAL-BANK: Accept both 'uniqueId' and 'instanceId' for compatibility
        const id = instance.uniqueId || instance.instanceId;

        if (!instance || !id || !instance.baseItemId) {
            console.warn('❌ Invalid instance:', instance);
            return false;
        }

        // Verify base item exists and is instanced
        const def = ItemRegistry.getItem(instance.baseItemId);
        if (!def) {
            console.warn('❌ Base item not found:', instance.baseItemId);
            return false;
        }

        if (def.instanced !== true) {
            console.warn('❌ Base item is not instanced:', instance.baseItemId);
            return false;
        }

        // Ensure instance has both properties for compatibility
        instance.uniqueId = id;
        instance.instanceId = id;

        // Add to instanced storage
        GameEngine.state.bank.instanced[id] = instance;

        console.log(`✅ Added instance: ${id} (${instance.baseItemId})`);
        return true;
    },

    /**
     * Remove instance from bank
     * @param {string} uniqueId - Unique instance ID (accepts both uniqueId and instanceId)
     * @returns {object|null} Removed instance or null
     */
    removeInstance(uniqueId) {
        if (!uniqueId) {
            console.warn('❌ Invalid uniqueId:', uniqueId);
            return null;
        }

        // DUAL-BANK: Accept both property names
        const instance = GameEngine.state.bank.instanced[uniqueId];
        if (!instance) {
            console.warn('❌ Instance not found:', uniqueId);
            return null;
        }

        // Remove from storage
        delete GameEngine.state.bank.instanced[uniqueId];

        console.log(`✅ Removed instance: ${uniqueId} (${instance.baseItemId})`);
        return instance;
    },

    /**
     * Get instance by unique ID
     * @param {string} uniqueId - Unique instance ID (accepts both uniqueId and instanceId)
     * @returns {object|null} Instance or null
     */
    getInstance(uniqueId) {
        return GameEngine.state.bank.instanced[uniqueId] || null;
    },

    /**
     * Get all instances of a base item
     * @param {string} baseItemId - Base item ID
     * @returns {array} Array of instances
     */
    getInstancesByBaseId(baseItemId) {
        return Object.values(GameEngine.state.bank.instanced)
            .filter(inst => inst.baseItemId === baseItemId);
    },

    /**
     * Count instances of a base item
     * @param {string} baseItemId - Base item ID
     * @returns {number} Count
     */
    getInstanceCount(baseItemId) {
        return this.getInstancesByBaseId(baseItemId).length;
    },

    // =================================================================
    // UNIVERSAL METHODS
    // =================================================================

    /**
     * Get item (works for both stackable and instanced)
     * @param {string} itemIdOrUniqueId - Item ID or unique instance ID
     * @returns {number|object|null} Quantity (stackable) or instance object or null
     */
    getItem(itemIdOrUniqueId) {
        // Check instanced first (unique IDs usually have _instance_)
        if (GameEngine.state.bank.instanced[itemIdOrUniqueId]) {
            return GameEngine.state.bank.instanced[itemIdOrUniqueId];
        }

        // Check stackable
        if (GameEngine.state.bank.stackable[itemIdOrUniqueId] !== undefined) {
            return GameEngine.state.bank.stackable[itemIdOrUniqueId];
        }

        return null;
    },

    /**
     * Check if has item (works for both types)
     * @param {string} itemIdOrUniqueId - Item ID or unique instance ID
     * @param {number} quantity - Required quantity (for stackable only)
     * @returns {boolean} Has item
     */
    hasItem(itemIdOrUniqueId, quantity = 1) {
        // Check instanced
        if (GameEngine.state.bank.instanced[itemIdOrUniqueId]) {
            return true;
        }

        // Check stackable
        return this.hasStackable(itemIdOrUniqueId, quantity);
    },

    /**
     * Get item count (universal)
     * @param {string} itemId - Item ID (base ID for instanced items)
     * @returns {number} Count
     */
    getItemCount(itemId) {
        const def = ItemRegistry.getItem(itemId);
        if (!def) return 0;

        if (def.instanced === true) {
            return this.getInstanceCount(itemId);
        } else {
            return this.getStackableQuantity(itemId);
        }
    },

    // =================================================================
    // UTILITY METHODS
    // =================================================================

    /**
     * Get rarity multiplier for mods
     * @param {string} rarity - Rarity level
     * @returns {number} Multiplier
     */
    getRarityMultiplier(rarity) {
        const multipliers = {
            common: 1.02,      // +2%
            uncommon: 1.04,    // +4%
            rare: 1.07,        // +7%
            epic: 1.10,        // +10%
            legendary: 1.15,   // +15%
            mythic: 1.20,      // +20%
            divine: 1.25,      // +25%
            transcendent: 1.30, // +30%
            creator: 1.50      // +50%
        };

        return multipliers[rarity] || 1.02;
    },

    /**
     * Get bank statistics
     * @returns {object} Statistics
     */
    getStatistics() {
        const stats = {
            stackable: {
                uniqueItems: Object.keys(GameEngine.state.bank.stackable).length,
                totalQuantity: Object.values(GameEngine.state.bank.stackable).reduce((sum, qty) => sum + qty, 0)
            },
            instanced: {
                totalInstances: Object.keys(GameEngine.state.bank.instanced).length,
                byBaseId: {}
            }
        };

        // Count instances by base ID
        Object.values(GameEngine.state.bank.instanced).forEach(inst => {
            if (!stats.instanced.byBaseId[inst.baseItemId]) {
                stats.instanced.byBaseId[inst.baseItemId] = 0;
            }
            stats.instanced.byBaseId[inst.baseItemId]++;
        });

        return stats;
    },

    /**
     * Validate bank integrity
     * @returns {object} Validation results
     */
    validate() {
        const issues = [];

        // Check stackable items
        Object.entries(GameEngine.state.bank.stackable).forEach(([itemId, qty]) => {
            const def = ItemRegistry.getItem(itemId);
            if (!def) {
                issues.push(`Stackable item not in registry: ${itemId}`);
            } else if (def.instanced === true) {
                issues.push(`Instanced item in stackable storage: ${itemId}`);
            }
            if (qty < 0) {
                issues.push(`Negative quantity for ${itemId}: ${qty}`);
            }
        });

        // Check instanced items
        Object.entries(GameEngine.state.bank.instanced).forEach(([uniqueId, inst]) => {
            // DUAL-BANK: Accept both uniqueId and instanceId
            const id = inst.uniqueId || inst.instanceId;
            if (!inst.baseItemId || !id) {
                issues.push(`Invalid instance structure: ${uniqueId}`);
            }
            const def = ItemRegistry.getItem(inst.baseItemId);
            if (!def) {
                issues.push(`Instance base item not in registry: ${inst.baseItemId}`);
            } else if (def.instanced !== true) {
                issues.push(`Non-instanced item in instanced storage: ${inst.baseItemId}`);
            }
        });

        return {
            valid: issues.length === 0,
            issues: issues
        };
    },

    /**
     * Debug: Print bank contents
     */
    debugPrint() {
        console.group('🏦 DUAL-BANK CONTENTS');

        console.group('📦 Stackable Storage');
        console.table(GameEngine.state.bank.stackable);
        console.groupEnd();

        console.group('⚔️ Instanced Storage');
        console.table(GameEngine.state.bank.instanced);
        console.groupEnd();

        console.group('📊 Statistics');
        console.table(this.getStatistics());
        console.groupEnd();

        console.groupEnd();
    }
};

// Browser global access
if (typeof window !== 'undefined') {
    window.DualBankSystem = DualBankSystem;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DualBankSystem;
}
