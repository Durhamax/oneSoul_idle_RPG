/**
 * STANCE REGISTRY
 *
 * Manages combat stance definitions (offensive/defensive postures).
 * Stances provide different combat bonuses and playstyles.
 */

class StanceRegistryClass extends BaseRegistry {
    constructor() {
        super('stance');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'type'],
            optional: [
                'description', 'icon', 'effects', 'bonuses', 'penalties',
                'requirements', 'category', 'unlockLevel', 'tags'
            ]
        };
    }

    // Query methods
    getByType(type) {
        const allStances = this.getAllActive();
        const filtered = {};
        for (const [id, stance] of Object.entries(allStances)) {
            if (stance.type === type) filtered[id] = stance;
        }
        return filtered;
    }

    getOffensive() {
        return this.getByType('offensive');
    }

    getDefensive() {
        return this.getByType('defensive');
    }

    getBalanced() {
        return this.getByType('balanced');
    }

    getByEffect(effect) {
        const allStances = this.getAllActive();
        const filtered = {};
        for (const [id, stance] of Object.entries(allStances)) {
            if (stance.effects?.includes(effect)) filtered[id] = stance;
        }
        return filtered;
    }
}

const StanceRegistry = new StanceRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StanceRegistry;
}
