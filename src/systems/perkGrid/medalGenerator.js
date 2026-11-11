/**
 * MEDAL GENERATOR
 * Generates medals with random perks based on rarity
 */

const MedalGenerator = {

    /**
     * Generate a new medal
     * @param {string} rarity - Rarity tier
     * @returns {Object|null} Medal object or null
     */
    generate(rarity) {
        const config = MEDAL_RARITIES[rarity];
        if (!config) {
            console.error(`[MedalGenerator] Unknown rarity: ${rarity}`);
            return null;
        }

        const availableStats = Object.keys(PERK_STAT_POOL);
        const usedStats = new Set();
        const perks = [];

        for (let i = 0; i < config.perkCount; i++) {
            let stat;
            let attempts = 0;

            do {
                stat = availableStats[Math.floor(Math.random() * availableStats.length)];
                attempts++;
            } while (usedStats.has(stat) && attempts < 100);

            if (attempts >= 100) continue;

            usedStats.add(stat);

            const { min, max } = config.valueRange;
            const value = min + Math.random() * (max - min);

            perks.push({
                stat,
                value: Math.round(value * 1000) / 1000
            });
        }

        return {
            id: `medal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rarity,
            perks,
            ribbon: this.generateRibbon(rarity, perks),
            craftedAt: Date.now()
        };
    },

    /**
     * Generate medal with weighted perk selection (for combining)
     * @param {string} rarity - Rarity tier
     * @param {Object} weights - Stat weights
     * @returns {Object} Medal object
     */
    generateWithWeights(rarity, weights) {
        const config = MEDAL_RARITIES[rarity];
        if (!config) return null;

        const perks = [];
        const usedStats = new Set();

        for (let i = 0; i < config.perkCount; i++) {
            const stat = this.weightedRandomSelect(weights, usedStats);
            if (!stat) continue;

            usedStats.add(stat);

            const { min, max } = config.valueRange;
            const value = min + Math.random() * (max - min);

            perks.push({
                stat,
                value: Math.round(value * 1000) / 1000
            });
        }

        return {
            id: `medal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rarity,
            perks,
            ribbon: this.generateRibbon(rarity, perks),
            craftedAt: Date.now(),
            combined: true
        };
    },

    /**
     * Weighted random selection
     * @param {Object} weights - Stat weights
     * @param {Set} exclude - Stats to exclude
     * @returns {string|null} Selected stat
     */
    weightedRandomSelect(weights, exclude) {
        const available = Object.entries(weights).filter(([stat]) => !exclude.has(stat));
        if (available.length === 0) return null;

        const totalWeight = available.reduce((sum, [, w]) => sum + w, 0);
        let roll = Math.random() * totalWeight;

        for (const [stat, weight] of available) {
            roll -= weight;
            if (roll <= 0) return stat;
        }

        return available[0][0];
    },

    /**
     * Generate ribbon pattern for medal
     * @param {string} rarity - Medal rarity
     * @param {Array} perks - Medal perks
     * @returns {Object} Ribbon configuration
     */
    generateRibbon(rarity, perks) {
        const rarityConfig = MEDAL_RARITIES[rarity];

        // Sort perks by category for consistent stripe order
        const sortedPerks = [...perks].sort((a, b) => {
            const catA = PERK_STAT_POOL[a.stat]?.category || 'utility';
            const catB = PERK_STAT_POOL[b.stat]?.category || 'utility';
            return catA.localeCompare(catB);
        });

        // Generate stripes based on perks
        const stripes = sortedPerks.map(perk => {
            const category = PERK_STAT_POOL[perk.stat]?.category || 'utility';
            const color = CATEGORY_COLORS[category];
            const width = Math.round(8 + (perk.value * 100));

            return { color, width };
        });

        // Calculate edge color (darker version of rarity color)
        const edgeColor = this.shadeColor(rarityConfig.color, -30);

        return {
            baseColor: rarityConfig.color,
            edgeColor,
            stripes,
            cssGradient: this.generateStripeCSS(stripes, rarityConfig.color)
        };
    },

    /**
     * Generate CSS gradient for ribbon stripes
     * @param {Array} stripes - Stripe configurations
     * @param {string} baseColor - Base ribbon color
     * @returns {string} CSS gradient
     */
    generateStripeCSS(stripes, baseColor) {
        if (stripes.length === 0) {
            return `linear-gradient(90deg, ${baseColor}, ${baseColor})`;
        }

        const totalWidth = stripes.reduce((sum, s) => sum + s.width, 0);
        const stops = [];
        let position = 0;

        // Add edge
        stops.push(`${baseColor} 0%`);
        stops.push(`${baseColor} 5%`);

        // Add stripes
        const stripeArea = 90; // 5% to 95%
        for (const stripe of stripes) {
            const startPct = 5 + (position / totalWidth) * stripeArea;
            const endPct = 5 + ((position + stripe.width) / totalWidth) * stripeArea;

            stops.push(`${stripe.color} ${startPct.toFixed(1)}%`);
            stops.push(`${stripe.color} ${endPct.toFixed(1)}%`);

            position += stripe.width;
        }

        // Add edge
        stops.push(`${baseColor} 95%`);
        stops.push(`${baseColor} 100%`);

        return `linear-gradient(90deg, ${stops.join(', ')})`;
    },

    /**
     * Shade a hex color
     * @param {string} color - Hex color
     * @param {number} percent - Shade percentage (-100 to 100)
     * @returns {string} Shaded hex color
     */
    shadeColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    },

    /**
     * Get display info for a medal
     * @param {Object} medal - Medal object
     * @returns {Object} Display info
     */
    getDisplayInfo(medal) {
        const config = MEDAL_RARITIES[medal.rarity] || MEDAL_RARITIES.common;

        return {
            name: `${config.name} Medal`,
            icon: config.icon,
            color: config.color,
            bgGradient: config.bgGradient,
            glowIntensity: config.glowIntensity,
            animation: config.animation,
            perkCount: medal.perks.length,
            perks: medal.perks.map(p => ({
                stat: p.stat,
                name: PERK_STAT_POOL[p.stat]?.name || p.stat,
                icon: PERK_STAT_POOL[p.stat]?.icon || '-',
                category: PERK_STAT_POOL[p.stat]?.category || 'utility',
                categoryColor: CATEGORY_COLORS[PERK_STAT_POOL[p.stat]?.category] || '#888',
                value: p.value,
                displayValue: `+${(p.value * 100).toFixed(1)}%`
            })),
            ribbon: medal.ribbon
        };
    },

    /**
     * Generate batch of medals
     * @param {string} rarity - Rarity tier
     * @param {number} count - Number to generate
     * @returns {Array} Array of medals
     */
    generateBatch(rarity, count) {
        const medals = [];
        for (let i = 0; i < count; i++) {
            const medal = this.generate(rarity);
            if (medal) medals.push(medal);
        }
        return medals;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedalGenerator;
}
