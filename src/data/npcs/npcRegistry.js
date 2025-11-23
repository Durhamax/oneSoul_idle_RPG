/**
 * NPC REGISTRY
 *
 * Manages named character definitions (NPCs).
 * NPCs are quest givers, merchants, trainers, and other named characters.
 */

class NPCRegistryClass extends BaseRegistry {
    constructor() {
        super('npc');
        this._initSchema();
    }

    _initSchema() {
        this.schema = {
            required: ['id', 'name', 'icon'],
            optional: [
                'description', 'faction', 'role', 'location', 'dialog',
                'questsAvailable', 'merchantInventory', 'trainableSkills',
                'assetPath', 'portrait', 'relationship', 'tags'
            ]
        };
    }

    // Query methods
    getByFaction(faction) {
        const allNPCs = this.getAllActive();
        const filtered = {};
        for (const [id, npc] of Object.entries(allNPCs)) {
            if (npc.faction === faction) filtered[id] = npc;
        }
        return filtered;
    }

    getByRole(role) {
        const allNPCs = this.getAllActive();
        const filtered = {};
        for (const [id, npc] of Object.entries(allNPCs)) {
            if (npc.role === role) filtered[id] = npc;
        }
        return filtered;
    }

    getByLocation(location) {
        const allNPCs = this.getAllActive();
        const filtered = {};
        for (const [id, npc] of Object.entries(allNPCs)) {
            if (npc.location === location) filtered[id] = npc;
        }
        return filtered;
    }
}

const NPCRegistry = new NPCRegistryClass();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NPCRegistry;
}
