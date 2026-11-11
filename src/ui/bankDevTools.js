/**
 * BANK DEVELOPER TOOLS
 *
 * Debugging and utility functions for the bank/inventory system
 */

const BankDevTools = {
    /**
     * Debug bank tabs - show all tab information
     */
    debugBankTabs() {
        console.log('🔍 === BANK TABS DEBUG ===');
        console.log('Total tabs:', Object.keys(GameEngine.state.bank.tabs).length);
        console.log('Tabs:', GameEngine.state.bank.tabs);

        const sortedTabs = Object.entries(GameEngine.state.bank.tabs).sort((a, b) => a[1].order - b[1].order);
        console.log('Sorted tabs:');
        for (let [tabId, tab] of sortedTabs) {
            const itemCount = tabId === 'medal'
                ? (GameEngine.state.craftedMedals?.length || 0)
                : GameEngine.getItemsInTab(tabId).length;
            console.log(`  ${tab.order}: ${tab.icon} ${tab.name} (${tabId}) - ${itemCount} items`);
        }

        console.log('Active tab:', GameEngine.state.bank.activeTab);
        console.log('Bank container exists:', !!document.getElementById('bankTabs'));
        console.log('Total items in bank:', Object.keys(GameEngine.state.bank.items).length);

        // Show summary alert
        let summary = `Bank Debug Info:\n\n`;
        summary += `Total Tabs: ${Object.keys(GameEngine.state.bank.tabs).length}\n`;
        summary += `Active Tab: ${GameEngine.state.bank.activeTab}\n`;
        summary += `Total Items: ${Object.keys(GameEngine.state.bank.items).length}\n\n`;
        summary += `Tabs:\n`;
        for (let [tabId, tab] of sortedTabs) {
            const itemCount = tabId === 'medal'
                ? (GameEngine.state.craftedMedals?.length || 0)
                : GameEngine.getItemsInTab(tabId).length;
            summary += `  ${tab.icon} ${tab.name}: ${itemCount} items\n`;
        }
        summary += `\nCheck console for detailed info.`;

        alert(summary);
    },

    /**
     * Fix bank tabs - add all missing tabs
     */
    fixBankTabs() {
        const requiredTabs = {
            resource: { name: "Resources", icon: "📦", order: 0 },
            tool: { name: "Tools", icon: "⛏️", order: 1 },
            weapon: { name: "Weapons", icon: "⚔️", order: 2 },
            armor: { name: "Armor", icon: "🛡️", order: 3 },
            technology: { name: "Technology", icon: "⚡", order: 4 },
            mod: { name: "Mods", icon: "💎", order: 5 },
            healing: { name: "Healing", icon: "🧪", order: 6 },
            consumable: { name: "Consumables", icon: "⚗️", order: 7 },
            medal: { name: "Medals", icon: "🏅", order: 8 },
            quest: { name: "Quest Items", icon: "📜", order: 9 },
            legacy: { name: "Legacy Items", icon: "🎒", order: 10 }
        };

        let addedCount = 0;
        let migratedCount = 0;

        // First migrate old tab names
        const tabMigrations = {
            'resources': 'resource',
            'equipment': 'legacy',
            'consumables': 'consumable',
            'perk': null  // Remove perk tab
        };

        for (let [oldName, newName] of Object.entries(tabMigrations)) {
            if (GameEngine.state.bank.tabs[oldName]) {
                if (newName === null) {
                    console.log(`Removing ${oldName} tab`);

                    // Move items to legacy tab
                    for (let itemId in GameEngine.state.bank.items) {
                        if (GameEngine.state.bank.items[itemId].tab === oldName) {
                            GameEngine.state.bank.items[itemId].tab = 'legacy';
                        }
                    }

                    // Delete old tab
                    delete GameEngine.state.bank.tabs[oldName];
                    migratedCount++;
                    console.log(`✅ Removed ${oldName} tab`);
                } else {
                    console.log(`Migrating ${oldName} → ${newName}`);

                    // Move items from old tab to new tab
                    for (let itemId in GameEngine.state.bank.items) {
                        if (GameEngine.state.bank.items[itemId].tab === oldName) {
                            GameEngine.state.bank.items[itemId].tab = newName;
                        }
                    }

                    // Copy tab data if new tab doesn't exist
                    if (!GameEngine.state.bank.tabs[newName]) {
                        GameEngine.state.bank.tabs[newName] = {
                            name: requiredTabs[newName].name,
                            icon: requiredTabs[newName].icon,
                            order: requiredTabs[newName].order
                        };
                    }

                    // Delete old tab
                    delete GameEngine.state.bank.tabs[oldName];
                    migratedCount++;
                    console.log(`✅ Migrated ${oldName} → ${newName}`);
                }
            }
        }

        // Then add missing tabs
        for (let [tabId, tabData] of Object.entries(requiredTabs)) {
            if (!GameEngine.state.bank.tabs[tabId]) {
                GameEngine.state.bank.tabs[tabId] = { ...tabData };
                addedCount++;
                console.log(`✅ Added ${tabData.icon} ${tabData.name}`);
            }
        }

        // Fix active tab if needed
        if (GameEngine.state.bank.activeTab === 'resources') {
            GameEngine.state.bank.activeTab = 'resource';
        } else if (GameEngine.state.bank.activeTab === 'equipment') {
            GameEngine.state.bank.activeTab = 'legacy';
        } else if (GameEngine.state.bank.activeTab === 'consumables') {
            GameEngine.state.bank.activeTab = 'consumable';
        } else if (GameEngine.state.bank.activeTab === 'perk') {
            GameEngine.state.bank.activeTab = 'medal';
        }

        console.log(`🔧 Bank tabs fixed:`);
        console.log(`  Migrated: ${migratedCount} old tabs`);
        console.log(`  Added: ${addedCount} new tabs`);
        console.log(`  Total: ${Object.keys(GameEngine.state.bank.tabs).length} tabs`);

        // Refresh UI
        this.refreshBankUI();

        // Show success message
        alert(`✅ Bank Tabs Fixed!\n\nMigrated: ${migratedCount} old tabs\nAdded: ${addedCount} new tabs\nTotal: ${Object.keys(GameEngine.state.bank.tabs).length} tabs\n\nAll tabs should now be visible!`);
    },

    /**
     * Refresh bank UI
     */
    refreshBankUI() {
        if (EquipmentUI && EquipmentUI.updateBank) {
            EquipmentUI.lastBankState = null; // Force full refresh
            EquipmentUI.updateBank();
            console.log('🔄 Bank UI refreshed');
        }
    },

    /**
     * Clear all legacy items
     */
    clearLegacyItems() {
        const legacyItems = GameEngine.getItemsInTab('legacy');

        if (legacyItems.length === 0) {
            alert('No legacy items to clear.');
            return;
        }

        if (confirm(`⚠️ This will delete ${legacyItems.length} legacy items.\n\nContinue?`)) {
            let deletedCount = 0;
            for (let item of legacyItems) {
                delete GameEngine.state.bank.items[item.itemId];
                deletedCount++;
            }

            console.log(`🗑️ Deleted ${deletedCount} legacy items`);
            this.refreshBankUI();
            alert(`✅ Deleted ${deletedCount} legacy items!`);
        }
    },

    /**
     * Add all test items to the bank
     */
    addAllTestItems() {
        if (!confirm('⚠️ This will add 100+ items to your bank for testing.\n\nContinue?')) {
            return;
        }

        const testItems = [
            // Resources
            'ruby', 'sapphire', 'emerald', 'diamond',
            'herbs_common', 'herbs_rare', 'mushroom_red', 'crystal_shard',
            'ore', 'wood', 'stone', 'copperOre', 'tinOre', 'coal', 'silverOre', 'goldOre',

            // Tools
            'shovel_basic', 'sickle_iron', 'knife_hunting',
            'bronzePickaxe', 'ironPickaxe', 'steelPickaxe', 'mithrilPickaxe',
            'bronzeAxe', 'ironAxe', 'steelAxe',
            'bambooPole', 'basicRod', 'carbonRod', 'masterRod',
            'shortBow', 'longBow', 'compositeBow', 'legendaryBow',

            // Weapons
            'dagger', 'ironSword', 'steelSword', 'broadsword', 'katana', 'longsword',
            'battleaxe', 'mace_iron', 'warhammer',
            'spear_wooden', 'spear_iron', 'halberd',
            'crossbow_light', 'crossbow_heavy', 'pistol_basic', 'rifle_hunting',
            'pipe_weapon', 'stun_baton',

            // Armor - Helmets
            'clothHood', 'leatherHelmet', 'ironHelmet', 'helmet_bronze', 'helmet_steel', 'helmet_knight',

            // Armor - Chest
            'tunic_leather', 'chainmail', 'plate_armor', 'robe_mage',

            // Armor - Legs
            'pants_leather', 'greaves_iron', 'leggings_plate',

            // Armor - Gloves
            'gloves_cloth', 'gauntlets_iron', 'gauntlets_steel',

            // Armor - Boots
            'boots_leather', 'boots_iron', 'boots_steel',

            // Armor - Shields
            'woodenShield', 'ironShield', 'shield_bronze', 'shield_steel', 'shield_tower',

            // Armor - Accessories
            'bronzeAmulet', 'silverNecklace', 'copperRing', 'silverRing',
            'travelersCloak', 'woovenCape',

            // Consumables - Potions
            'potion_small_health', 'potion_medium_health', 'potion_large_health',
            'potion_strength', 'potion_speed', 'potion_defense',

            // Consumables - Food
            'apple', 'bread', 'cooked_meat', 'fish_cooked', 'stew', 'cake',
            'energy_drink', 'protein_bar', 'water_bottle',

            // Healing
            'first_aid_kit', 'bandage_roll', 'pain_killers',
            'medical_kit_advanced', 'antidote', 'regeneration_serum',

            // Technology
            'circuit_board', 'battery', 'laser_sight', 'radio_receiver',

            // Mods
            'scope_attachment', 'reinforced_plating', 'energy_cell',
            'damage_upgrade', 'speed_upgrade', 'armor_upgrade',

            // Quest Items
            'old_photo', 'keycard_red', 'broken_phone',
            'ancient_key', 'map_treasure', 'scroll_ancient', 'amulet_cursed', 'letter_sealed',

            // Fish
            'minnow', 'trout', 'bass', 'salmon', 'pike', 'goldfish',

            // Hunting resources
            'rawMeat', 'hide', 'feather', 'bone', 'fang', 'pelt'
        ];

        let addedCount = 0;
        let skippedCount = 0;

        for (let itemId of testItems) {
            // Check if item definition exists
            if (!ItemAccessHelper.getItem(itemId)) {
                console.warn(`⚠️ Item definition not found: ${itemId}`);
                skippedCount++;
                continue;
            }

            // Add item to bank
            const added = GameEngine.addItemToBank(itemId, 1);
            if (added) {
                addedCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`✅ Added ${addedCount} test items to bank`);
        if (skippedCount > 0) {
            console.log(`⚠️ Skipped ${skippedCount} items`);
        }

        // Refresh UI
        this.refreshBankUI();

        alert(`✅ Test Items Added!\n\nAdded: ${addedCount} items\nSkipped: ${skippedCount} items\n\nCheck your bank tabs!`);
    }
};
