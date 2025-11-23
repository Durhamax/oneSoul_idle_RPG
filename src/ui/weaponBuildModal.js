/**
 * WEAPON BUILD MODAL
 *
 * Modal for customizing weapon builds, attachments, and modifications.
 * Currently a placeholder for future weapon customization features.
 */

const WeaponBuildModal = {
    /**
     * Initialize the modal
     */
    init() {
        // Create modal if it doesn't exist
        if (!document.getElementById('weaponBuildModal')) {
            this.createModal();
        }
    },

    /**
     * Create the modal HTML structure
     */
    createModal() {
        const modalHTML = `
            <div id="weaponBuildModal" class="modal">
                <div class="modal-content weapon-build-modal-content">
                    <div class="modal-header">
                        <h2>⚙️ Weapon Build</h2>
                        <button class="modal-close" onclick="closeWeaponBuildModal()">&times;</button>
                    </div>
                    <div class="modal-body" id="weaponBuildModalBody">
                        <!-- Content populated by renderWeaponBuild() -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Open the weapon build modal
     */
    open() {
        const modal = document.getElementById('weaponBuildModal');
        if (!modal) {
            this.init();
        }

        this.render();
        document.getElementById('weaponBuildModal').style.display = 'block';
    },

    /**
     * Close the weapon build modal
     */
    close() {
        document.getElementById('weaponBuildModal').style.display = 'none';
    },

    /**
     * Render the weapon build interface
     */
    render() {
        const container = document.getElementById('weaponBuildModalBody');
        if (!container) return;

        const equippedWeaponId = GameEngine.state.equipment.weapon;

        if (!equippedWeaponId) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888;">
                    <div style="font-size: 3em; margin-bottom: 20px;">⚔️</div>
                    <p>No weapon equipped</p>
                    <p style="font-size: 0.85em; margin-top: 10px;">Equip a weapon to customize it</p>
                </div>
            `;
            return;
        }

        const weaponDef = ItemAccessHelper.getItem(equippedWeaponId);

        let html = `
            <div class="weapon-build-container">
                <!-- Weapon Display -->
                <div class="weapon-build-header">
                    <div class="weapon-build-icon">${IconHelper.getItemIconHTML(weaponDef, {size: 64})}</div>
                    <div class="weapon-build-info">
                        <h3>${weaponDef.name}</h3>
                        <div class="weapon-build-type">${weaponDef.weaponType || 'Melee'} Weapon</div>
                    </div>
                </div>

                <!-- Weapon Stats -->
                <div class="weapon-build-stats">
                    <h4>Base Stats</h4>
                    <div class="stat-grid">
                        ${this.renderWeaponStats(weaponDef)}
                    </div>
                </div>

                <!-- Customization Sections (Placeholder) -->
                <div class="weapon-build-section">
                    <h4>🔧 Attachments</h4>
                    <div class="weapon-build-placeholder">
                        <p>Weapon attachment system coming soon...</p>
                        <p style="font-size: 0.85em; color: #888; margin-top: 10px;">
                            Future features: Scopes, grips, barrels, magazines, and more
                        </p>
                    </div>
                </div>

                <div class="weapon-build-section">
                    <h4>⚡ Modifications</h4>
                    <div class="weapon-build-placeholder">
                        <p>Weapon modification system coming soon...</p>
                        <p style="font-size: 0.85em; color: #888; margin-top: 10px;">
                            Future features: Elemental damage, status effects, unique traits
                        </p>
                    </div>
                </div>

                <div class="weapon-build-section">
                    <h4>✨ Enhancements</h4>
                    <div class="weapon-build-placeholder">
                        <p>Weapon enhancement system coming soon...</p>
                        <p style="font-size: 0.85em; color: #888; margin-top: 10px;">
                            Future features: Upgrade levels, stat bonuses, special abilities
                        </p>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Render weapon stats
     */
    renderWeaponStats(weaponDef) {
        let html = '';
        const stats = weaponDef.stats || {};

        const statDisplay = [
            { key: 'attackDamage', icon: '⚔️', label: 'Attack Damage' },
            { key: 'attackSpeed', icon: '⚡', label: 'Attack Speed' },
            { key: 'accuracy', icon: '🎯', label: 'Accuracy' },
            { key: 'critChance', icon: '💥', label: 'Crit Chance' },
            { key: 'critMultiplier', icon: '🌟', label: 'Crit Multiplier' }
        ];

        for (let stat of statDisplay) {
            if (stats[stat.key]) {
                html += `
                    <div class="stat-item">
                        <div class="stat-item-label">${stat.icon} ${stat.label}</div>
                        <div class="stat-item-value">${stats[stat.key]}</div>
                    </div>
                `;
            }
        }

        return html || '<p style="color: #888;">No stats available</p>';
    }
};

// Global functions for modal control
function openWeaponBuildModal() {
    WeaponBuildModal.open();
}

function closeWeaponBuildModal() {
    WeaponBuildModal.close();
}
