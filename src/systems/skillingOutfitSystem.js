/**
 * SkillingOutfit — skilling-gear bonus aggregation
 *
 * Reads `skillingBonus` off EQUIPPED gear (any equipment slot, not just the tool)
 * and exposes the two bonus channels a skilling piece can provide:
 *
 *   skillingBonus: {
 *     skills: 'all' | ['fishing', 'foraging', ...],   // which gathering skills it helps
 *     xp:    0.005,                                    // +0.5% action XP per piece (additive)
 *     yield: { chance: 0.01, amount: 1 }               // per-resource roll for +amount extra
 *   }
 *
 * A piece carries EITHER xp OR yield early-game (not both); the aggregation supports
 * both so later-tier pieces can stack or combine freely. Pieces are INDEPENDENT —
 * there is no required full "set"; a lone fishing vest works on its own.
 *
 * XP vs. yield, by design:
 *   - XP bonus scales the skill XP of the GATHER ACTION (applied once in gainSkillExp).
 *   - Yield bonus adds extra RESOURCES only (rolled in the yield calc). Those extra
 *     resources deliberately grant NO additional XP — XP is per action, not per item.
 */
const SkillingOutfit = {
    // Equipment slots that can hold a skilling piece (tool/weapon included for future gear).
    EQUIP_SLOTS: ['weapon', 'tool', 'head', 'chest', 'legs', 'back', 'gloves', 'boots', 'neck', 'ring'],

    /**
     * Resolve the equipped item definitions that carry a `skillingBonus`.
     * Handles instance-id strings, plain ids, and {itemId|baseItemId} objects.
     * @param {Object} state - GameEngine state
     * @returns {Array<Object>} item definitions with a skillingBonus
     */
    _bonusDefs(state) {
        const out = [];
        const eq = state && state.equipment;
        if (!eq) return out;
        const reg = (typeof ItemRegistry !== 'undefined') ? ItemRegistry : null;
        if (!reg) return out;

        for (const slot of this.EQUIP_SLOTS) {
            const val = eq[slot];
            if (!val) continue;

            let baseId = null;
            if (typeof ItemIdUtils !== 'undefined' && ItemIdUtils.getBaseItemId) {
                baseId = ItemIdUtils.getBaseItemId(val);
            } else if (typeof val === 'string') {
                baseId = val;
            } else if (val.baseItemId || val.itemId) {
                baseId = val.baseItemId || val.itemId;
            }
            if (!baseId) continue;

            const def = reg.getItem(baseId);
            if (def && def.skillingBonus) out.push(def);
        }
        return out;
    },

    /**
     * Whether a piece's bonus applies to the given skill.
     * `skills` may be 'all', a single id, or an array of ids.
     */
    _applies(def, skillId) {
        const s = def.skillingBonus && def.skillingBonus.skills;
        if (!s || s === 'all') return true;
        if (Array.isArray(s)) return s.includes(skillId);
        return s === skillId;
    },

    /**
     * Total additive XP fraction from equipped skilling pieces for this skill.
     * e.g. two +0.5% pieces → 0.01 (apply as amount * (1 + bonus)).
     * @returns {number}
     */
    getXpBonus(state, skillId) {
        let total = 0;
        for (const def of this._bonusDefs(state)) {
            if (this._applies(def, skillId) && def.skillingBonus.xp) {
                total += def.skillingBonus.xp;
            }
        }
        return total;
    },

    /**
     * Roll the yield bonus for this skill: for each equipped piece with a yield
     * bonus that applies, roll its chance and accumulate the extra amount.
     * Returns the number of EXTRA resource units to add (grants no XP).
     * @returns {number}
     */
    rollYieldBonus(state, skillId) {
        let extra = 0;
        for (const def of this._bonusDefs(state)) {
            if (!this._applies(def, skillId)) continue;
            const y = def.skillingBonus.yield;
            if (y && y.amount && Math.random() < (y.chance || 0)) {
                extra += y.amount;
            }
        }
        return extra;
    }
};

// Global registration (vanilla script-tag pattern used across the project)
if (typeof window !== 'undefined') {
    window.SkillingOutfit = SkillingOutfit;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillingOutfit;
}
