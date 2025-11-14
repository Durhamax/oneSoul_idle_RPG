/**
 * MEDAL SELECTION MODAL
 *
 * Modal popup for selecting a medal to place on the perk grid
 * - Shows available medals from bank
 * - Displays medal rarity and perks
 * - Handles placing medal on grid
 */

const MedalSelectionModal = {
    targetRow: null,
    targetCol: null,

    /**
     * Show the medal selection modal for a specific grid cell
     */
    show(row, col) {
        this.targetRow = row;
        this.targetCol = col;

        let modal = document.getElementById('medalSelectionModal');

        // Create modal if it doesn't exist
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'medalSelectionModal';
            modal.className = 'modal';
            modal.style.display = 'none';
            document.body.appendChild(modal);
        }

        // Render content
        modal.innerHTML = this.renderModalContent();
        modal.style.display = 'block';

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.hide();
            }
        };
    },

    /**
     * Hide the modal
     */
    hide() {
        const modal = document.getElementById('medalSelectionModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.targetRow = null;
        this.targetCol = null;
    },

    /**
     * Render modal content
     */
    renderModalContent() {
        const medals = GameEngine.state.craftedMedals || [];
        const availableMedals = medals.filter(m => {
            // Medal is available if not placed anywhere on grid
            const placedMedals = GameEngine.state.perkGrid?.placedMedals || {};
            for (let cellKey in placedMedals) {
                const placed = placedMedals[cellKey];
                if (placed.medal && placed.medal.id === m.id) {
                    return false; // Already placed
                }
            }
            return true;
        });

        return `
            <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="margin: 0; color: #ff9800;">🏅 Select Medal for Cell (${this.targetRow}, ${this.targetCol})</h2>
                    <button class="modal-close" onclick="MedalSelectionModal.hide()">&times;</button>
                </div>

                <div style="padding: 20px;">
                    ${availableMedals.length === 0 ? this.renderNoMedals() : this.renderMedalGrid(availableMedals)}
                </div>
            </div>
        `;
    },

    /**
     * Render "no medals" message
     */
    renderNoMedals() {
        return `
            <div style="text-align: center; padding: 40px; color: #888;">
                <div style="font-size: 3em; margin-bottom: 20px;">📭</div>
                <div style="font-size: 1.2em; margin-bottom: 10px;">No medals available</div>
                <div style="font-size: 0.9em; margin-bottom: 20px;">All medals are either placed on the grid or you haven't crafted any yet.</div>
                <button onclick="MedalSelectionModal.hide(); document.getElementById('view-perks').click(); setTimeout(() => MedalCraftingModal.show(), 100);"
                        style="padding: 12px 24px; background: linear-gradient(135deg, #ff9800, #f44336); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">
                    🏅 Craft Medals
                </button>
            </div>
        `;
    },

    /**
     * Render grid of available medals
     */
    renderMedalGrid(medals) {
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">';

        for (let medal of medals) {
            const rarityData = MedalCraftingSystem.rarities[medal.rarity];
            if (!rarityData) continue;

            // Build perks display
            let perksHtml = '';
            for (let perk of medal.perks) {
                // Format value based on perk type
                let displayValue;
                if (perk.stat === 'rowMultiplier' || perk.stat === 'colMultiplier') {
                    // Row/col multipliers show as multiplier values
                    displayValue = perk.value.toFixed(2) + 'x';
                } else {
                    // All other perks are percentage multipliers
                    displayValue = (perk.value * 100).toFixed(1) + '%';
                }

                perksHtml += `
                    <div style="font-size: 0.8em; margin: 4px 0; color: #ddd; display: flex; justify-content: space-between;">
                        <span>${perk.name}</span>
                        <span style="color: ${rarityData.color}; font-weight: bold;">+${displayValue}</span>
                    </div>
                `;
            }

            html += `
                <div style="background: rgba(255,255,255,0.05); border: 2px solid ${rarityData.color}; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; position: relative;"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px ${rarityData.color}66'"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                     onclick="MedalSelectionModal.selectMedal('${medal.id}')">

                    <!-- Rarity Badge -->
                    <div style="text-align: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 2.5em; margin-bottom: 5px;">${rarityData.icon}</div>
                        <div style="font-weight: bold; color: ${rarityData.color}; font-size: 1.1em;">${rarityData.name}</div>
                        <div style="font-size: 0.7em; color: #888; margin-top: 2px;">Power: ${rarityData.powerMultiplier}x</div>
                    </div>

                    <!-- Perks List -->
                    <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; min-height: 80px;">
                        <div style="font-size: 0.75em; color: #aaa; margin-bottom: 5px;">Perks (${medal.perks.length}):</div>
                        ${perksHtml}
                    </div>

                    <!-- Place Button -->
                    <button onclick="event.stopPropagation(); MedalSelectionModal.selectMedal('${medal.id}')"
                            style="width: 100%; margin-top: 10px; padding: 8px; background: ${rarityData.color}; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; transition: opacity 0.2s;"
                            onmouseover="this.style.opacity='0.8'"
                            onmouseout="this.style.opacity='1'">
                        ✓ Place Medal
                    </button>
                </div>
            `;
        }

        html += '</div>';

        // Add instructions at top
        return `
            <div style="background: rgba(76, 175, 80, 0.2); border: 1px solid #4caf50; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                <div style="font-size: 0.9em; color: #4caf50;">
                    💡 <strong>Tip:</strong> Click on any medal to place it on the grid at position (${this.targetRow}, ${this.targetCol})
                </div>
            </div>
            ${html}
        `;
    },

    /**
     * Select and place a medal
     */
    selectMedal(medalId) {
        if (this.targetRow === null || this.targetCol === null) {
            console.error('No target cell selected');
            return;
        }

        // Find the medal
        const medal = GameEngine.state.craftedMedals?.find(m => m.id === medalId);
        if (!medal) {
            alert('Medal not found!');
            return;
        }

        // Place the medal on the grid
        const result = GameEngine.placeMedalOnGrid(this.targetRow, this.targetCol, medal);

        if (result.success) {
            console.log(`✅ Placed ${medal.name} at (${this.targetRow}, ${this.targetCol})`);

            // Hide modal
            this.hide();

            // Refresh perk grid UI
            if (PerkGridUI && PerkGridUI.render) {
                PerkGridUI.render();
            }

            // Show success notification
            this.showNotification(`Placed ${medal.name} on grid!`, MedalCraftingSystem.rarities[medal.rarity].color);
        } else {
            alert(`Failed to place medal: ${result.reason}`);
        }
    },

    /**
     * Show notification
     */
    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${color};
            color: white;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
};
