/**
 * ITEM CARD COMPONENT
 *
 * Reusable component for displaying item cards in inventory, bank, equipment, etc.
 * Follows Foundation Specification UI Component pattern.
 *
 * Features:
 * - Displays item icon (PNG or emoji fallback)
 * - Shows item name, quantity, rarity
 * - Supports click handlers
 * - Applies rarity-based styling
 * - Handles equipped/new state indicators
 */

class ItemCard extends UIComponent {
    constructor() {
        super();
        this.styles = this.getStyles();
    }

    /**
     * Render an item card
     * @param {object} options - Render options
     * @param {object} options.item - Item definition from registry
     * @param {number} options.quantity - Quantity of item
     * @param {boolean} options.isNew - Whether item is newly acquired
     * @param {boolean} options.isEquipped - Whether item is equipped
     * @param {function} options.onClick - Click handler
     * @returns {string} HTML string for item card
     */
    render(options) {
        const {
            item,
            quantity = 1,
            isNew = false,
            isEquipped = false,
            onClick = null,
            showStackLimit = false
        } = options;

        if (!item) {
            console.error('[ItemCard] Cannot render without item');
            return '';
        }

        // Get rarity styling
        const rarityClass = this.getRarityClass(item.rarity);
        const rarityColor = this.getRarityColor(item.rarity);

        // Build state classes
        const stateClasses = [
            'item-card',
            rarityClass,
            isNew ? 'item-card-new' : '',
            isEquipped ? 'item-card-equipped' : ''
        ].filter(Boolean).join(' ');

        // Get icon HTML (PNG with emoji fallback)
        const iconHTML = this.getIconHTML(item);

        // Format quantity display
        const quantityDisplay = quantity > 1 ? `×${quantity}` : '';

        return `
            <div class="${stateClasses}"
                 data-item-id="${item.id}"
                 ${onClick ? `onclick="${onClick}"` : ''}
                 style="border-color: ${rarityColor};">

                ${isEquipped ? '<div class="item-card-equipped-badge">E</div>' : ''}
                ${isNew ? '<div class="item-card-new-badge">NEW</div>' : ''}

                <div class="item-card-icon">
                    ${iconHTML}
                </div>

                <div class="item-card-name" title="${item.name}">
                    ${item.name}
                </div>

                ${quantity > 1 ? `
                    <div class="item-card-quantity">
                        ${quantityDisplay}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Get icon HTML with PNG fallback to emoji
     * @param {object} item - Item definition
     * @returns {string} Icon HTML
     */
    getIconHTML(item) {
        if (item.iconPath) {
            // PNG icon with emoji fallback
            return `<img src="${item.iconPath}"
                         alt="${item.name}"
                         class="item-icon-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span class="item-icon-emoji" style="display:none;">${item.icon}</span>`;
        } else {
            // Emoji only
            return `<span class="item-icon-emoji">${item.icon}</span>`;
        }
    }

    /**
     * Get rarity CSS class
     * @param {string} rarity - Item rarity
     * @returns {string} CSS class name
     */
    getRarityClass(rarity) {
        const rarityMap = {
            common: 'rarity-common',
            uncommon: 'rarity-uncommon',
            rare: 'rarity-rare',
            epic: 'rarity-epic',
            legendary: 'rarity-legendary'
        };
        return rarityMap[rarity] || 'rarity-common';
    }

    /**
     * Get rarity border color
     * @param {string} rarity - Item rarity
     * @returns {string} Hex color
     */
    getRarityColor(rarity) {
        const colorMap = {
            common: '#aaa',
            uncommon: '#1eff00',
            rare: '#0070dd',
            epic: '#a335ee',
            legendary: '#ff8000'
        };
        return colorMap[rarity] || '#aaa';
    }

    /**
     * Get component styles as CSS string
     * These will be injected into the document
     * @returns {string} CSS styles
     */
    getStyles() {
        return `
            /* Item Card Base Styles */
            .item-card {
                position: relative;
                background: var(--color-bg-glass, rgba(0, 0, 0, 0.6));
                border: 2px solid var(--color-border, #444);
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 110px;
                width: 126px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                backdrop-filter: blur(4px);
            }

            .item-card:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            /* Icon Container - Centered with Golden Ratio sizing */
            .item-card-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                margin-bottom: 8px;
                padding: 4px;
            }

            .item-icon-img {
                max-width: 55px;
                max-height: 55px;
                width: 55px;
                height: 55px;
                object-fit: contain;
            }

            .item-icon-emoji {
                font-size: 3em;
                line-height: 1;
            }

            /* Item Name */
            .item-card-name {
                font-size: 0.75em;
                color: #aaa;
                margin-bottom: 5px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
            }

            /* Quantity Display */
            .item-card-quantity {
                font-size: 0.9em;
                font-weight: bold;
                color: #4a9eff;
                margin-top: 4px;
            }

            /* State Badges */
            .item-card-equipped-badge {
                position: absolute;
                top: 4px;
                right: 4px;
                background: #4caf50;
                color: white;
                font-size: 0.7em;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 3px;
                line-height: 1;
            }

            .item-card-new-badge {
                position: absolute;
                top: 4px;
                left: 4px;
                background: #ffeb3b;
                color: #000;
                font-size: 0.7em;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 3px;
                line-height: 1;
                animation: pulse-new 2s infinite;
            }

            @keyframes pulse-new {
                0%, 100% {
                    box-shadow: 0 0 8px rgba(255, 235, 59, 0.5);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 16px rgba(255, 235, 59, 0.8);
                    transform: scale(1.05);
                }
            }

            /* Rarity Variants */
            .item-card.rarity-common {
                border-color: #aaa;
            }

            .item-card.rarity-uncommon {
                border-color: #1eff00;
            }

            .item-card.rarity-rare {
                border-color: #0070dd;
            }

            .item-card.rarity-epic {
                border-color: #a335ee;
            }

            .item-card.rarity-legendary {
                border-color: #ff8000;
                box-shadow: 0 0 12px rgba(255, 128, 0, 0.3);
            }

            .item-card.rarity-legendary:hover {
                box-shadow: 0 0 20px rgba(255, 128, 0, 0.5);
            }

            /* State Modifiers */
            .item-card-new {
                animation: pulse-card 2s infinite;
            }

            @keyframes pulse-card {
                0%, 100% {
                    box-shadow: 0 0 10px rgba(255, 235, 59, 0.4);
                }
                50% {
                    box-shadow: 0 0 20px rgba(255, 235, 59, 0.7);
                }
            }

            .item-card-equipped {
                background: rgba(76, 175, 80, 0.1);
            }

            /* Responsive Adjustments */
            @media (max-width: 640px) {
                .item-card {
                    width: 110px;
                    min-height: 100px;
                    padding: 8px;
                }

                .item-card-icon {
                    font-size: 2.5em;
                }

                .item-card-name {
                    font-size: 0.7em;
                }
            }
        `;
    }

    /**
     * Inject styles into document (call once on init)
     */
    injectStyles() {
        // Check if styles already injected
        if (document.getElementById('item-card-styles')) {
            return;
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'item-card-styles';
        styleElement.textContent = this.styles;
        document.head.appendChild(styleElement);

        console.log('✅ ItemCard styles injected');
    }
}

// Create singleton instance and inject styles
const itemCard = new ItemCard();
itemCard.injectStyles();

console.log('✅ ItemCard component loaded');
