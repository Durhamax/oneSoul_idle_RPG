/**
 * ATTACHMENT SYSTEM
 *
 * Manages weapon attachments and modifications.
 * Weapons can have 0-8 attachment slots based on rarity.
 * Each attachment provides stat bonuses based on its own rarity.
 */

const AttachmentSystem = {
    // Rarity determines max attachment slots
    ATTACHMENT_SLOTS_BY_RARITY: {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
        mythic: 5,
        divine: 6,
        transcendent: 7,
        creator: 8
    },

    // Each attachment type affects one stat
    ATTACHMENT_TYPES: {
        muzzle: 'attackDamage',
        scope: 'accuracy',
        magazine: 'attackSpeed',
        stock: 'criticalChance',
        camo: 'stealth',
        underbarrel: 'stability',
        grip: 'criticalDamage',
        foregrip: 'recoilControl'
    },

    // Attachment rarity affects magnitude (balanced for perk grid)
    ATTACHMENT_MAGNITUDE: {
        common: 0.02,      // +2%
        uncommon: 0.04,    // +4%
        rare: 0.07,        // +7%
        epic: 0.10,        // +10%
        legendary: 0.15,   // +15%
        mythic: 0.20,      // +20%
        divine: 0.30,      // +30%
        transcendent: 0.45,// +45%
        creator: 0.70      // +70%
    },

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
     * Initialize attachment system functions on the GameEngine
     */
    init(engine) {
        engine.createWeaponInstance = this.createWeaponInstance.bind(engine);
        engine.modifyWeaponAttachments = this.modifyWeaponAttachments.bind(engine);
        engine.stripAttachments = this.stripAttachments.bind(engine);
        engine.getWeaponStats = this.getWeaponStats.bind(engine);
        engine.getAttachmentSlots = this.getAttachmentSlots.bind(engine);
        engine.calculateModifiedStats = this.calculateModifiedStats.bind(engine);

        console.log('✅ AttachmentSystem initialized (ItemRegistry pattern)');
    },

    /**
     * Create a unique weapon instance from a base weapon
     */
    createWeaponInstance(baseWeaponId) {
        const baseItem = AttachmentSystem._getItemDef.call(this, baseWeaponId);

        // Check both 'slot' (production) and 'equipSlot' (alias) for weapon type
        const slot = baseItem?.slot || baseItem?.equipSlot;
        if (!baseItem || slot !== 'weapon') {
            console.error('Cannot create weapon instance: invalid item or not a weapon');
            return null;
        }

        const instanceId = `${baseWeaponId}_instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const instance = {
            itemId: baseWeaponId,
            baseItemId: baseWeaponId,
            instanceId: instanceId,
            quantity: 1,
            attachments: {},
            customName: null,
            modifiedStats: null,
            tab: 'weapon'  // DUAL-BANK: Always 'weapon' for weapon instances
        };

        // Initialize empty attachment slots based on rarity
        // Get rarity string directly from item definition
        const rarityName = baseItem.rarity || 'common';
        const maxSlots = AttachmentSystem.ATTACHMENT_SLOTS_BY_RARITY[rarityName];
        const slotTypes = Object.keys(AttachmentSystem.ATTACHMENT_TYPES);

        console.log(`🔧 Creating instance for ${baseWeaponId}:`, {
            rarity: rarityName,
            maxSlots: maxSlots,
            slotTypes: slotTypes
        });

        for (let i = 0; i < maxSlots && i < slotTypes.length; i++) {
            instance.attachments[slotTypes[i]] = null;
            console.log(`  ✅ Added slot ${i}: ${slotTypes[i]}`);
        }

        console.log(`🔧 Final attachments:`, instance.attachments);

        // Calculate initial stats
        instance.modifiedStats = this.calculateModifiedStats.call(this, baseItem, {});

        console.log(`✅ Created weapon instance: ${instanceId}`);
        return instance;
    },

    /**
     * Modify weapon attachments
     */
    modifyWeaponAttachments(weaponInstanceId, slotType, attachmentId) {
        // DUAL-BANK: Use getEquipmentInstance instead of direct access
        const weapon = this.getEquipmentInstance(weaponInstanceId);

        if (!weapon || !weapon.instanceId) {
            console.error('Invalid weapon instance');
            return { success: false, reason: 'Invalid weapon instance' };
        }

        // Check if slot exists for this weapon
        if (!weapon.attachments.hasOwnProperty(slotType)) {
            return { success: false, reason: 'Invalid attachment slot for this weapon' };
        }

        // If adding a new attachment, check if it exists in bank first
        if (attachmentId) {
            console.log(`🔄 Checking for attachment in bank: ${attachmentId}`);
            // DUAL-BANK: Attachments are instanced, check instanced storage
            const attachmentInstance = this.getEquipmentInstance(attachmentId);
            if (!attachmentInstance) {
                return { success: false, reason: 'Attachment not available in bank' };
            }
            console.log(`✅ Attachment found in bank: ${attachmentId}`);
        }

        // Store old attachment for later (will be handled after setting new one)
        const oldAttachment = weapon.attachments[slotType];

        // Add new attachment to slot
        weapon.attachments[slotType] = attachmentId;

        // Remove attachment instance from bank if adding (not removing)
        if (attachmentId) {
            console.log(`🔄 Removing new attachment from bank: ${attachmentId}`);
            // DUAL-BANK: Attachments are instanced, use removeEquipmentInstance
            const removedInstance = this.removeEquipmentInstance(attachmentId);
            console.log(`🔄 Removed instance:`, removedInstance);
            if (!removedInstance) {
                // Revert change if we couldn't remove the attachment
                weapon.attachments[slotType] = oldAttachment;
                return { success: false, reason: 'Failed to remove attachment from bank' };
            }
        } else if (oldAttachment) {
            // Removing attachment (attachmentId is null), return old one to bank
            console.log(`🔄 Returning old attachment to bank: ${oldAttachment}`);

            // Extract base item ID from instance ID
            // Instance ID format: "baseItemId_instance_timestamp_random"
            const baseItemId = oldAttachment.split('_instance_')[0];
            console.log(`   Base item ID: ${baseItemId}`);

            const oldAttachmentDef = AttachmentSystem._getItemDef.call(this, baseItemId);
            if (oldAttachmentDef && oldAttachmentDef.instanced) {
                console.log(`   Creating instance for ${baseItemId}...`);
                // Create instance from stored attachment ID
                // This is a workaround - ideally we'd store the full instance when attaching
                const reconstructedInstance = DualBankSystem.createInstance(baseItemId, {
                    rarity: oldAttachmentDef.rarity || 'common'
                });
                if (reconstructedInstance) {
                    // Override the uniqueId with the stored attachment ID to maintain reference
                    reconstructedInstance.uniqueId = oldAttachment;
                    reconstructedInstance.instanceId = oldAttachment;
                    this.addEquipmentInstance(reconstructedInstance);
                    console.log(`✅ Returned attachment to bank: ${oldAttachment}`);
                } else {
                    console.error(`❌ Failed to create instance for ${baseItemId}`);
                }
            } else {
                console.warn(`⚠️ Attachment def not found or not instanced: ${baseItemId}`);
            }
        }

        // Recalculate stats
        const baseItem = AttachmentSystem._getItemDef.call(this, weapon.baseItemId);

        weapon.modifiedStats = this.calculateModifiedStats.call(this, baseItem, weapon.attachments);

        // DUAL-BANK: Persist changes back to dual-bank storage
        // The weapon object is a reference, so changes are already in instanced storage
        // But also update old storage for backward compatibility
        if (this.state.bank.equipmentInstances[weaponInstanceId]) {
            this.state.bank.equipmentInstances[weaponInstanceId] = weapon;
        }
        if (this.state.bank.items[weaponInstanceId]) {
            this.state.bank.items[weaponInstanceId] = weapon;
        }

        console.log(`✅ Modified ${weaponInstanceId}: ${slotType} -> ${attachmentId || 'removed'}`);
        return { success: true };
    },

    /**
     * Calculate weapon stats with attachments applied
     */
    calculateModifiedStats(baseWeapon, attachments) {
        // Use aliases from ItemRegistry.getItem() for compatibility
        // Production items: combatStats.damage, combatStats.attackSpeed
        // Aliases created: attackDamage, attackSpeed
        let stats = {
            attackDamage: baseWeapon.attackDamage || baseWeapon.stats?.attackDamage || baseWeapon.combatStats?.damage || 0,
            attackSpeed: baseWeapon.attackSpeed || baseWeapon.stats?.attackSpeed || baseWeapon.combatStats?.attackSpeed || 1.0,
            accuracy: baseWeapon.stats?.accuracy || baseWeapon.combatStats?.accuracy || 75,
            criticalChance: baseWeapon.stats?.criticalChance || baseWeapon.combatStats?.critChance || 5,
            criticalDamage: baseWeapon.stats?.criticalDamage || baseWeapon.combatStats?.critDamage || 150,
            armorPenetration: baseWeapon.stats?.armorPenetration || 0,
            stability: baseWeapon.stats?.stability || 100,
            reloadSpeed: baseWeapon.stats?.reloadSpeed || 100
        };

        // Apply attachment bonuses
        Object.entries(attachments).forEach(([slotType, attachmentId]) => {
            if (!attachmentId) return;

            // Parse the attachment ID to get the base item ID
            // Format: baseItemId_instance_timestamp_randomid or just baseItemId
            let baseItemId = attachmentId;

            // If it's an instance ID, extract the base ID
            if (attachmentId.includes('_instance_')) {
                baseItemId = attachmentId.split('_instance_')[0];
            }

            // Get the attachment definition
            const attachmentDef = AttachmentSystem._getItemDef.call(this, baseItemId);

            if (!attachmentDef) {
                console.warn(`Attachment definition not found for ${attachmentId} (base: ${baseItemId})`);
                return;
            }

            // Read the stat bonus from the definition (modStat and bonusValue)
            const bonusStat = attachmentDef.modStat || attachmentDef.bonusStat;
            const bonusValue = attachmentDef.bonusValue;

            if (!bonusStat || bonusValue === undefined) {
                console.warn(`Attachment ${baseItemId} missing modStat/bonusStat or bonusValue`);
                return;
            }

            // Apply multiplicative bonuses
            if (stats.hasOwnProperty(bonusStat)) {
                if (bonusStat === 'attackDamage') {
                    stats.attackDamage = Math.floor(stats.attackDamage * (1 + bonusValue));
                } else if (bonusStat === 'attackSpeed') {
                    stats.attackSpeed = parseFloat((stats.attackSpeed * (1 + bonusValue)).toFixed(2));
                } else {
                    stats[bonusStat] = Math.floor(stats[bonusStat] * (1 + bonusValue));
                }
            }
        });

        return stats;
    },

    /**
     * Strip all attachments from a weapon and return to base
     */
    stripAttachments(weaponInstanceId) {
        // DUAL-BANK: Use getEquipmentInstance instead of direct access
        const weapon = this.getEquipmentInstance(weaponInstanceId);

        if (!weapon || !weapon.attachments) {
            return { success: false, reason: 'Invalid weapon or no attachments' };
        }

        // Return all attachments to bank
        let returnedCount = 0;
        Object.entries(weapon.attachments).forEach(([slot, attachmentId]) => {
            if (attachmentId) {
                this.addItemToBank(attachmentId, 1);
                returnedCount++;
            }
        });

        // DUAL-BANK: Remove instance and add base weapon
        const baseId = weapon.baseItemId;
        this.removeEquipmentInstance(weaponInstanceId);
        this.addItemToBank(baseId, 1);

        console.log(`✅ Stripped ${returnedCount} attachments from ${weaponInstanceId}`);
        return { success: true, returnedCount };
    },

    /**
     * Get weapon stats (with attachments if instance)
     */
    getWeaponStats(weaponId) {
        // DUAL-BANK: Try to get as equipment instance first
        const weapon = this.getEquipmentInstance(weaponId);

        if (weapon) {
            // It's an instance - return modified stats
            if (weapon.modifiedStats) {
                return weapon.modifiedStats;
            }
        }

        // Not an instance or no modified stats - get base item stats
        const itemId = weapon?.baseItemId || weaponId;
        const baseItem = AttachmentSystem._getItemDef.call(this, itemId);

        return baseItem?.stats || null;
    },

    /**
     * Get available attachment slots for a weapon
     */
    getAttachmentSlots(weaponId) {
        // DUAL-BANK: Try to get as equipment instance first
        let weapon = this.getEquipmentInstance(weaponId);

        // If not an instance, get base item definition
        if (!weapon) {
            weapon = AttachmentSystem._getItemDef.call(this, weaponId);
        }

        if (!weapon) return 0;

        const rarity = this.getItemRarity(weapon.baseItemId || weaponId);
        const rarityName = rarity ? rarity.id : 'common';
        return AttachmentSystem.ATTACHMENT_SLOTS_BY_RARITY[rarityName];
    }
};
