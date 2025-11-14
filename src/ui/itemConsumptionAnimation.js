/**
 * ITEM CONSUMPTION ANIMATION SYSTEM
 *
 * Global system for showing visual feedback when items are consumed.
 * Items drop from the top header and fade out over 1.5 seconds.
 */

const ItemConsumptionAnimation = {
    /**
     * Show item consumption animation
     * @param {string} itemId - ID of the item being consumed
     * @param {number} quantity - Amount consumed
     */
    showItemConsumed(itemId, quantity) {
        // Get item definition
        const item = GameDefinitions.items[itemId];
        if (!item) {
            console.warn(`Item ${itemId} not found in definitions`);
            return;
        }

        // Create animation container
        const animContainer = document.createElement('div');
        animContainer.className = 'item-consumption-animation';

        // Random horizontal position (avoid edges)
        const randomX = 20 + Math.random() * 60; // 20-80% of screen width

        animContainer.style.cssText = `
            position: fixed;
            top: 60px;
            left: ${randomX}%;
            transform: translateX(-50%);
            z-index: 10000;
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid ${this.getItemBorderColor(item)};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            animation: itemConsumptionDrop 1.5s ease-out forwards;
        `;

        // Item icon
        const icon = document.createElement('div');
        icon.textContent = item.icon || '📦';
        icon.style.cssText = `
            font-size: 24px;
            line-height: 1;
        `;

        // Quantity text
        const quantityText = document.createElement('div');
        quantityText.textContent = `-${quantity}`;
        quantityText.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            color: #ff6b6b;
            text-shadow: 0 0 4px rgba(255, 107, 107, 0.5);
        `;

        // Item name
        const nameText = document.createElement('div');
        nameText.textContent = item.name;
        nameText.style.cssText = `
            font-size: 14px;
            color: #ffffff;
            font-weight: 500;
        `;

        // Assemble animation
        animContainer.appendChild(icon);
        animContainer.appendChild(quantityText);
        animContainer.appendChild(nameText);
        document.body.appendChild(animContainer);

        // Remove after animation completes
        setTimeout(() => {
            if (animContainer.parentNode) {
                animContainer.parentNode.removeChild(animContainer);
            }
        }, 1500);
    },

    /**
     * Get border color based on item type
     * @param {object} item - Item definition
     * @returns {string} CSS color
     */
    getItemBorderColor(item) {
        // Match item tab colors
        if (item.category === 'consumable') {
            return '#4CAF50'; // Green for consumables
        } else if (item.category === 'resource') {
            return '#FF9800'; // Orange for resources
        } else if (item.category === 'equipment') {
            return '#2196F3'; // Blue for equipment
        }
        return '#9E9E9E'; // Gray default
    }
};

// Add CSS animation keyframes
if (!document.getElementById('itemConsumptionAnimationStyles')) {
    const style = document.createElement('style');
    style.id = 'itemConsumptionAnimationStyles';
    style.textContent = `
        @keyframes itemConsumptionDrop {
            0% {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            60% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translateX(-50%) translateY(80px);
            }
        }
    `;
    document.head.appendChild(style);
}
