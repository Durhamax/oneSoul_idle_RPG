/**
 * DEVELOPER TOOLS MODAL
 *
 * Centralized modal for all developer/debugging functions
 */

const DevModal = {
    isOpen: false,

    /**
     * Render the dev modal content
     */
    renderContent() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">

                <!-- General Game Controls -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #4a9eff; border-bottom: 2px solid #4a9eff; padding-bottom: 5px;">🎮 General</h3>
                    <button onclick="DevModal.addGold()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">
                        💰 Add 1000 Gold
                    </button>
                    <button onclick="DevModal.addMedals()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">
                        🏅 Add 100 Medals
                    </button>
                    <button onclick="DevModal.addTomes()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">
                        📚 Add 50 Tomes
                    </button>
                    <button onclick="DevModal.levelUp()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">
                        ⬆️ Level Up Character
                    </button>
                    <button onclick="DevModal.maxSkills()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #4a9eff; border-radius: 4px; color: white; cursor: pointer;">
                        ⭐ Max All Skills
                    </button>
                </div>

                <!-- Combat & Enemies -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #ff6b6b; border-bottom: 2px solid #ff6b6b; padding-bottom: 5px;">⚔️ Combat</h3>
                    <button onclick="DevModal.killEnemy()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">
                        💀 Instantly Kill Enemy
                    </button>
                    <button onclick="DevModal.fullHeal()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">
                        ❤️ Full Heal
                    </button>
                    <button onclick="DevModal.godMode()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ff6b6b; border-radius: 4px; color: white; cursor: pointer;">
                        🛡️ Toggle God Mode
                    </button>
                </div>

                <!-- Items & Equipment -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #ffd700; border-bottom: 2px solid #ffd700; padding-bottom: 5px;">🎒 Items</h3>
                    <button onclick="DevModal.unlockAllItems()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">
                        🔓 Unlock All Items
                    </button>
                    <button onclick="DevModal.addAllMaterials()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">
                        📦 Add All Materials (x100)
                    </button>
                    <button onclick="DevModal.upgradeAllEquipment()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ffd700; border-radius: 4px; color: white; cursor: pointer;">
                        ⚡ Upgrade All Equipment
                    </button>
                </div>

                <!-- Map & Navigation -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #00d9ff; border-bottom: 2px solid #00d9ff; padding-bottom: 5px;">🗺️ Navigation</h3>
                    <button onclick="DevModal.unlockAllRegions()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #00d9ff; border-radius: 4px; color: white; cursor: pointer;">
                        🌍 Unlock All Regions
                    </button>
                    <button onclick="DevModal.discoverAllNodes()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #00d9ff; border-radius: 4px; color: white; cursor: pointer;">
                        📍 Discover All Nodes
                    </button>
                    <button onclick="DevModal.maxNavigation()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #00d9ff; border-radius: 4px; color: white; cursor: pointer;">
                        🧭 Max Navigation Skill
                    </button>
                    <button onclick="DevModal.addRestResources()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #00d9ff; border-radius: 4px; color: white; cursor: pointer;">
                        🔥🍖 Add Infinite Rest Resources
                    </button>
                </div>

                <!-- Missions & Quests -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #9c27b0; border-bottom: 2px solid #9c27b0; padding-bottom: 5px;">📜 Missions</h3>
                    <button onclick="DevModal.completeMission()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #9c27b0; border-radius: 4px; color: white; cursor: pointer;">
                        ✅ Complete Active Mission
                    </button>
                    <button onclick="DevModal.unlockAllMissions()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #9c27b0; border-radius: 4px; color: white; cursor: pointer;">
                        📋 Unlock All Missions
                    </button>
                </div>

                <!-- Time & Speed -->
                <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 15px 0; color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 5px;">⏱️ Time</h3>
                    <button onclick="DevModal.speedUp()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">
                        ⚡ 10x Speed (Toggle)
                    </button>
                    <button onclick="DevModal.skipTime()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">
                        ⏩ Skip 1 Hour
                    </button>
                    <button onclick="DevModal.completeActivity()" style="width: 100%; margin-bottom: 8px; padding: 10px; background: #3a3a3a; border: 1px solid #ff9800; border-radius: 4px; color: white; cursor: pointer;">
                        ✨ Complete Current Activity
                    </button>
                </div>

            </div>

            <div style="margin-top: 20px; padding: 15px; background: rgba(255, 0, 0, 0.1); border: 1px solid #ff6b6b; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ff6b6b; font-weight: bold;">⚠️ Developer Tools - Use with caution!</p>
                <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #aaa;">These functions are for testing and development purposes only.</p>
            </div>
        `;
    },

    /**
     * Update the modal content
     */
    update() {
        const content = document.getElementById('devModalContent');
        if (content) {
            content.innerHTML = this.renderContent();
        }
    },

    // ========== Dev Functions ==========

    addGold() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            GameEngine.state.gold += 1000;
            UICore.update();
            console.log('Added 1000 gold');
        }
    },

    addMedals() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            GameEngine.state.medals += 100;
            UICore.update();
            console.log('Added 100 medals');
        }
    },

    addTomes() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            GameEngine.state.tomes += 50;
            UICore.update();
            console.log('Added 50 tomes');
        }
    },

    levelUp() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            GameEngine.state.level++;
            GameEngine.state.statPoints += 3;
            UICore.update();
            console.log('Leveled up to', GameEngine.state.level);
        }
    },

    maxSkills() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            for (let skill in GameEngine.state.skills) {
                GameEngine.state.skills[skill] = 100;
            }
            UICore.update();
            console.log('Maxed all skills');
        }
    },

    killEnemy() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state && GameEngine.state.combat?.active) {
            GameEngine.state.combat.enemyHp = 0;
            console.log('Enemy killed');
        } else {
            console.log('No active combat');
        }
    },

    fullHeal() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            GameEngine.state.hp = GameEngine.getMaxHp();
            UICore.update();
            console.log('Full heal');
        }
    },

    godMode() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devGodMode = !GameEngine.devGodMode;
            console.log('God mode:', GameEngine.devGodMode ? 'ON' : 'OFF');
        }
    },

    unlockAllItems() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state && GameEngine.definitions) {
            for (let itemId in GameEngine.definitions.comprehensiveItems) {
                GameEngine.state.discoveredItems[itemId] = true;
            }
            UICore.update();
            console.log('Unlocked all items');
        }
    },

    addAllMaterials() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state && GameEngine.definitions) {
            for (let itemId in GameEngine.definitions.comprehensiveItems) {
                const item = GameEngine.definitions.comprehensiveItems[itemId];
                if (item.category === 'Material') {
                    if (!GameEngine.state.inventory[itemId]) {
                        GameEngine.state.inventory[itemId] = 0;
                    }
                    GameEngine.state.inventory[itemId] += 100;
                }
            }
            UICore.update();
            console.log('Added 100 of each material');
        }
    },

    upgradeAllEquipment() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            for (let slot in GameEngine.state.equipment) {
                if (GameEngine.state.equipment[slot]) {
                    if (!GameEngine.state.equipment[slot].level) {
                        GameEngine.state.equipment[slot].level = 0;
                    }
                    GameEngine.state.equipment[slot].level += 5;
                }
            }
            UICore.update();
            console.log('Upgraded all equipment by +5 levels');
        }
    },

    unlockAllRegions() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state && GameEngine.definitions) {
            for (let regionId in GameEngine.definitions.worldMap) {
                if (!GameEngine.state.regions[regionId]) {
                    GameEngine.state.regions[regionId] = {
                        discovered: false,
                        discoveryProgress: 0,
                        discoveredExitPaths: []
                    };
                }
                GameEngine.state.regions[regionId].discovered = true;
                GameEngine.state.regions[regionId].discoveryProgress = 100;
            }
            UICore.update();
            console.log('Unlocked all regions');
        }
    },

    discoverAllNodes() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            const currentRegion = GameEngine.state.currentRegion;
            if (GameEngine.state.regions[currentRegion]) {
                if (!GameEngine.state.regions[currentRegion].nodes) {
                    GameEngine.state.regions[currentRegion].nodes = {};
                }
                // Discover all possible nodes for current region
                for (let i = 0; i < 20; i++) {
                    const nodeId = `node_${i}`;
                    GameEngine.state.regions[currentRegion].nodes[nodeId] = {
                        discovered: true,
                        type: 'resource'
                    };
                }
                UICore.update();
                console.log('Discovered all nodes in current region');
            }
        }
    },

    maxNavigation() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            GameEngine.state.skills.navigation = 100;
            UICore.update();
            console.log('Navigation skill maxed');
        }
    },

    addRestResources() {
        if (typeof GameEngine !== 'undefined' && GameEngine.addItemToBank) {
            // Add infinite pinewood (fuel)
            GameEngine.addItemToBank('pinewood', 999999);

            // Add infinite light rations (food)
            GameEngine.addItemToBank('lightRations', 999999);

            // Equip light rations in food slot using the equipment system
            if (GameEngine.equipItem) {
                GameEngine.equipItem('lightRations');
            } else {
                // Fallback: manually set equipment slot
                GameEngine.state.equipment.food = 'lightRations';
            }

            UICore.update();
            console.log('✅ Added infinite rest resources: 999999 pinewood, 999999 lightRations');
            console.log('✅ Equipped lightRations in food slot');
        }
    },

    completeMission() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            const activeMission = GameEngine.state.activeMission;
            if (activeMission && GameEngine.state.missions[activeMission]) {
                GameEngine.state.missions[activeMission].completed = true;
                GameEngine.state.activeMission = null;
                UICore.update();
                console.log('Completed mission:', activeMission);
            } else {
                console.log('No active mission');
            }
        }
    },

    unlockAllMissions() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state && GameEngine.definitions) {
            for (let missionId in GameEngine.definitions.missions) {
                if (!GameEngine.state.missions[missionId]) {
                    GameEngine.state.missions[missionId] = {};
                }
                GameEngine.state.missions[missionId].unlocked = true;
            }
            UICore.update();
            console.log('Unlocked all missions');
        }
    },

    speedUp() {
        if (typeof GameEngine !== 'undefined') {
            GameEngine.devSpeedMultiplier = GameEngine.devSpeedMultiplier === 10 ? 1 : 10;
            console.log('Speed multiplier:', GameEngine.devSpeedMultiplier + 'x');
        }
    },

    skipTime() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            const oneHour = 3600000; // 1 hour in milliseconds
            GameEngine.update(oneHour / 1000); // Pass seconds
            UICore.update();
            console.log('Skipped 1 hour');
        }
    },

    completeActivity() {
        if (typeof GameEngine !== 'undefined' && GameEngine.state) {
            if (GameEngine.state.activity?.type) {
                GameEngine.state.activity.progress = GameEngine.state.activity.duration || 0;
                UICore.update();
                console.log('Completed current activity');
            } else {
                console.log('No active activity');
            }
        }
    }
};

/**
 * Toggle the dev modal
 */
function toggleDevModal() {
    const modal = document.getElementById('devModal');
    if (!modal) return;

    DevModal.isOpen = !DevModal.isOpen;

    if (DevModal.isOpen) {
        modal.style.display = 'block';
        DevModal.update();
    } else {
        modal.style.display = 'none';
    }
}
