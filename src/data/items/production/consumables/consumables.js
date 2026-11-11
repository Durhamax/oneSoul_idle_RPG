/**
 * CONSUMABLE ITEMS
 *
 * Single-use items: potions, food, scrolls, buffs
 */

const CONSUMABLE_ITEMS = {
    // =================================================================
    // TIER 1 FOOD
    // =================================================================
    solfishBake: {
        id: 'solfishBake',
        weight: 0.5,             // flat per stack (food)
        name: 'Solfish Bake',
        description: 'A basic baked fish meal. Provides modest healing and endurance recovery.',
        icon: '🐟',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'food',       // Equipment slot
        instanced: false,
        rarity: 'common',
        stackLimit: 50,
        value: 8,
        effectType: 'heal',
        effectValue: 75,         // HP restored when consumed
        cooldown: 800,
        enduranceRecovery: 12,
        tags: ['consumable', 'food', 'healing', 'fish'],
    },

    smallGameStew: {
        id: 'smallGameStew',
        weight: 0.6,             // flat per stack (food)
        name: 'Small Game Stew',
        description: 'A hearty stew made from small game meat. Restores health and provides a temporary strength boost.',
        icon: '🍲',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'food',       // Equipment slot
        instanced: false,
        rarity: 'common',
        stackLimit: 40,
        value: 12,
        effectType: 'heal',
        effectValue: 100,        // HP restored when consumed
        effect: {
            stat: 'strength',
            amount: 1,
            duration: 120000, // 2 minutes
        },
        cooldown: 1000,
        enduranceRecovery: 18,
        tags: ['consumable', 'food', 'healing', 'buff', 'meat'],
    },

    // =================================================================
    // TIER 1 SERUMS / TINCTURES (potion slot — dosed, not eaten)
    // =================================================================
    mintyTincture: {
        id: 'mintyTincture',
        weight: 0.3,             // flat per stack (serum vial)
        name: 'Minty Tincture',
        description: 'A bracing tincture pressed from minty herb. Keeps you sharp and refreshed — grants +1 Perception while equipped. Depletes only when that focus is used: in combat, or during activities that roll on Perception. It is not spent by gathering that never calls on it.',
        icon: '🧪',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'potion',     // Equipment slot (serum/tincture)
        instanced: false,
        rarity: 'common',
        stackLimit: 40,
        value: 14,
        // "Refreshing" timed buff: +1 Perception. drivenBy gates consumption so the
        // tincture is only dosed when Perception actually matters (combat / Perception
        // skills), never by gathering intervals that ignore Perception.
        effectType: 'buff',
        effect: {
            stat: 'perception',
            amount: 1,
            duration: 60000,         // refreshed focus lasts 60s; re-dosed (−1) when it lapses
        },
        drivenBy: 'perception',
        tags: ['consumable', 'serum', 'tincture', 'buff', 'herb', 'refreshing'],
    },

    daypetalSalve: {
        id: 'daypetalSalve',
        weight: 0.4,             // flat per stack (salve pot)
        name: 'Daypetal Salve',
        description: 'A restorative salve rendered from daypetal blooms. While equipped it sharpens your instinct to patch up — raising the auto-eat threshold by +1 HP. One measure is spent each time auto-eat triggers.',
        icon: '🌼',
        category: 'consumable',
        slot: 'consumable',      // Bank tab
        equipSlot: 'potion',     // Equipment slot (serum/salve) — shares the potion slot
        instanced: false,
        rarity: 'uncommon',
        stackLimit: 40,
        value: 18,
        // Passive-while-equipped utility: nudges the auto-eat trigger up. Consumed by the
        // auto-eat path (one per trigger), NOT by the dose engine (no `duration`).
        effectType: 'utility',
        effect: {
            autoEatThreshold: 1,     // +1 HP to the auto-eat trigger threshold
        },
        tags: ['consumable', 'serum', 'salve', 'utility', 'flower'],
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSUMABLE_ITEMS;
}
