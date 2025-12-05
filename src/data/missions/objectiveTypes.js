/**
 * OBJECTIVE TYPES DEFINITION
 *
 * Defines all supported objective types for the mission system.
 * Each type maps to specific EventBus events for automatic tracking.
 *
 * Objective Structure:
 * {
 *   type: string,        // One of OBJECTIVE_TYPES values
 *   target?: string,     // Specific target ID (enemy, item, node, etc.)
 *   count: number,       // Required count to complete
 *   current?: number,    // Current progress (managed by MissionSystem)
 *   ...typeSpecificProps // Additional properties based on type
 * }
 */

const OBJECTIVE_TYPES = {
    // === COMBAT OBJECTIVES ===

    /**
     * Kill specific enemy by ID
     * { type: 'kill', target: 'enemy_goblin', count: 10 }
     * EventBus: 'combat:enemyKilled' with enemyId
     */
    KILL: 'kill',

    /**
     * Kill enemies of specific armor type
     * { type: 'killType', armorType: 'biological', count: 5 }
     * EventBus: 'combat:enemyKilled' checking enemy.armorType
     */
    KILL_TYPE: 'killType',

    /**
     * Kill any enemies (generic combat)
     * { type: 'killAny', count: 20 }
     * EventBus: 'combat:enemyKilled' (any)
     */
    KILL_ANY: 'killAny',

    // === GATHERING OBJECTIVES ===

    /**
     * Harvest from specific node type
     * { type: 'harvest', target: 'node_oakTree', count: 5 }
     * EventBus: 'node:harvested' with nodeId
     */
    HARVEST: 'harvest',

    /**
     * Gather specific item (from any source)
     * { type: 'gather', target: 'item_oakLog', count: 10 }
     * EventBus: 'inventory:itemAdded' with itemId
     */
    GATHER: 'gather',

    // === TURN-IN OBJECTIVES (consume items on submission) ===

    /**
     * Turn in specific item (consumed when mission completes)
     * { type: 'turnIn', target: 'item_oakLog', count: 5 }
     * Check: inventory count >= required
     * Action: Remove items on mission completion
     */
    TURN_IN: 'turnIn',

    /**
     * Turn in a set of different items
     * { type: 'turnInSet', items: [{itemId: 'item_a', count: 2}, {itemId: 'item_b', count: 1}] }
     * Check: all items in set meet count requirements
     * Action: Remove all items on mission completion
     */
    TURN_IN_SET: 'turnInSet',

    // === CRAFTING OBJECTIVES ===

    /**
     * Craft specific item
     * { type: 'craft', target: 'item_ironSword', count: 1 }
     * EventBus: 'crafting:completed' with recipeId/itemId
     */
    CRAFT: 'craft',

    /**
     * Craft any item in a skill category
     * { type: 'craftSkill', skill: 'smithing', count: 5 }
     * EventBus: 'crafting:completed' checking recipe.skill
     */
    CRAFT_SKILL: 'craftSkill',

    // === EXPLORATION OBJECTIVES ===

    /**
     * Explore/visit specific location
     * { type: 'explore', target: 'region_forest', count: 1 }
     * EventBus: 'navigation:regionEntered' with regionId
     */
    EXPLORE: 'explore',

    /**
     * Discover something (POI, secret, lore)
     * { type: 'discover', target: 'poi_hiddenCave', count: 1 }
     * EventBus: 'discovery:found' with discoveryId
     */
    DISCOVER: 'discover',

    /**
     * Travel distance (tiles/steps)
     * { type: 'travel', count: 100 }
     * EventBus: 'navigation:moved' incrementing count
     */
    TRAVEL: 'travel',

    // === PROGRESSION OBJECTIVES ===

    /**
     * Reach specific skill level
     * { type: 'levelSkill', skill: 'mining', level: 10 }
     * EventBus: 'skill:levelUp' with skillId, level
     */
    LEVEL_SKILL: 'levelSkill',

    /**
     * Reach specific character level
     * { type: 'levelChar', level: 5 }
     * EventBus: 'player:levelUp' with level
     */
    LEVEL_CHAR: 'levelChar',

    // === EQUIPMENT OBJECTIVES ===

    /**
     * Equip specific item or any item in slot
     * { type: 'equip', target: 'item_ironHelm' } or { type: 'equip', slot: 'weapon' }
     * EventBus: 'equipment:equipped' with itemId, slot
     */
    EQUIP: 'equip',

    // === ECONOMY OBJECTIVES ===

    /**
     * Earn gold (total earned, not current balance)
     * { type: 'earnGold', count: 1000 }
     * EventBus: 'currency:earned' with amount, type
     */
    EARN_GOLD: 'earnGold',

    /**
     * Spend gold
     * { type: 'spendGold', count: 500 }
     * EventBus: 'currency:spent' with amount, type
     */
    SPEND_GOLD: 'spendGold',

    // === INTERACTION OBJECTIVES ===

    /**
     * Talk to NPC (for future use)
     * { type: 'talk', target: 'npc_blacksmith', count: 1 }
     * EventBus: 'npc:talked' with npcId
     */
    TALK: 'talk',

    // === SPECIAL OBJECTIVES ===

    /**
     * Custom objective (manual completion via code)
     * { type: 'custom', key: 'tutorialStep1', count: 1 }
     * EventBus: 'mission:customObjective' with key
     */
    CUSTOM: 'custom',

    // === UI/NAVIGATION OBJECTIVES ===

    /**
     * Visit a specific UI tab
     * { type: 'visitTab', tab: 'skills', count: 1 }
     * EventBus: 'tab-visited' with tab name
     */
    VISIT_TAB: 'visitTab'
};

/**
 * Maps objective types to their EventBus event names
 * Used by MissionSystem to automatically subscribe to relevant events
 */
const OBJECTIVE_EVENT_MAP = {
    [OBJECTIVE_TYPES.KILL]: 'combat:enemyKilled',
    [OBJECTIVE_TYPES.KILL_TYPE]: 'combat:enemyKilled',
    [OBJECTIVE_TYPES.KILL_ANY]: 'combat:enemyKilled',
    [OBJECTIVE_TYPES.HARVEST]: 'node:harvested',
    [OBJECTIVE_TYPES.GATHER]: 'inventory:itemAdded',
    [OBJECTIVE_TYPES.TURN_IN]: null,  // Checked on submission, not event-driven
    [OBJECTIVE_TYPES.TURN_IN_SET]: null,  // Checked on submission, not event-driven
    [OBJECTIVE_TYPES.CRAFT]: 'crafting:completed',
    [OBJECTIVE_TYPES.CRAFT_SKILL]: 'crafting:completed',
    [OBJECTIVE_TYPES.EXPLORE]: 'navigation:regionEntered',
    [OBJECTIVE_TYPES.DISCOVER]: 'discovery:found',
    [OBJECTIVE_TYPES.TRAVEL]: 'navigation:moved',
    [OBJECTIVE_TYPES.LEVEL_SKILL]: 'skill:levelUp',
    [OBJECTIVE_TYPES.LEVEL_CHAR]: 'player:levelUp',
    [OBJECTIVE_TYPES.EQUIP]: 'equipment:equipped',
    [OBJECTIVE_TYPES.EARN_GOLD]: 'currency:earned',
    [OBJECTIVE_TYPES.SPEND_GOLD]: 'currency:spent',
    [OBJECTIVE_TYPES.TALK]: 'npc:talked',
    [OBJECTIVE_TYPES.CUSTOM]: 'mission:customObjective',
    [OBJECTIVE_TYPES.VISIT_TAB]: 'tab-visited'
};

/**
 * Objective type metadata for UI and validation
 */
const OBJECTIVE_TYPE_INFO = {
    [OBJECTIVE_TYPES.KILL]: {
        label: 'Defeat',
        icon: '⚔️',
        requiresTarget: true,
        targetType: 'enemy',
        description: 'Defeat a specific enemy'
    },
    [OBJECTIVE_TYPES.KILL_TYPE]: {
        label: 'Hunt',
        icon: '🎯',
        requiresTarget: false,
        requiresArmorType: true,
        description: 'Defeat enemies of a specific type'
    },
    [OBJECTIVE_TYPES.KILL_ANY]: {
        label: 'Combat',
        icon: '⚔️',
        requiresTarget: false,
        description: 'Defeat any enemies'
    },
    [OBJECTIVE_TYPES.HARVEST]: {
        label: 'Harvest',
        icon: '🪓',
        requiresTarget: true,
        targetType: 'node',
        description: 'Harvest from a specific node'
    },
    [OBJECTIVE_TYPES.GATHER]: {
        label: 'Gather',
        icon: '📦',
        requiresTarget: true,
        targetType: 'item',
        description: 'Collect a specific item'
    },
    [OBJECTIVE_TYPES.TURN_IN]: {
        label: 'Deliver',
        icon: '📤',
        requiresTarget: true,
        targetType: 'item',
        consumesItems: true,
        description: 'Deliver items (consumed on completion)'
    },
    [OBJECTIVE_TYPES.TURN_IN_SET]: {
        label: 'Deliver Set',
        icon: '📤',
        requiresItems: true,
        consumesItems: true,
        description: 'Deliver multiple item types'
    },
    [OBJECTIVE_TYPES.CRAFT]: {
        label: 'Craft',
        icon: '🔨',
        requiresTarget: true,
        targetType: 'item',
        description: 'Craft a specific item'
    },
    [OBJECTIVE_TYPES.CRAFT_SKILL]: {
        label: 'Practice',
        icon: '🔨',
        requiresSkill: true,
        description: 'Craft items using a specific skill'
    },
    [OBJECTIVE_TYPES.EXPLORE]: {
        label: 'Explore',
        icon: '🗺️',
        requiresTarget: true,
        targetType: 'region',
        description: 'Visit a specific location'
    },
    [OBJECTIVE_TYPES.DISCOVER]: {
        label: 'Discover',
        icon: '🔍',
        requiresTarget: true,
        targetType: 'discovery',
        description: 'Find something hidden'
    },
    [OBJECTIVE_TYPES.TRAVEL]: {
        label: 'Travel',
        icon: '👣',
        requiresTarget: false,
        description: 'Travel a certain distance'
    },
    [OBJECTIVE_TYPES.LEVEL_SKILL]: {
        label: 'Train',
        icon: '📈',
        requiresSkill: true,
        requiresLevel: true,
        description: 'Reach a skill level'
    },
    [OBJECTIVE_TYPES.LEVEL_CHAR]: {
        label: 'Level Up',
        icon: '⬆️',
        requiresLevel: true,
        description: 'Reach a character level'
    },
    [OBJECTIVE_TYPES.EQUIP]: {
        label: 'Equip',
        icon: '👕',
        requiresTarget: false,  // Can be target OR slot
        description: 'Equip an item'
    },
    [OBJECTIVE_TYPES.EARN_GOLD]: {
        label: 'Earn',
        icon: '💰',
        requiresTarget: false,
        description: 'Earn gold'
    },
    [OBJECTIVE_TYPES.SPEND_GOLD]: {
        label: 'Spend',
        icon: '💸',
        requiresTarget: false,
        description: 'Spend gold'
    },
    [OBJECTIVE_TYPES.TALK]: {
        label: 'Talk',
        icon: '💬',
        requiresTarget: true,
        targetType: 'npc',
        description: 'Speak with an NPC'
    },
    [OBJECTIVE_TYPES.CUSTOM]: {
        label: 'Task',
        icon: '✓',
        requiresKey: true,
        description: 'Complete a special task'
    },
    [OBJECTIVE_TYPES.VISIT_TAB]: {
        label: 'Visit',
        icon: '👁️',
        requiresTab: true,
        description: 'Visit a UI tab',
        category: 'navigation'
    }
};

/**
 * Validate an objective definition
 * @param {object} objective - The objective to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateObjective(objective) {
    const errors = [];

    if (!objective || typeof objective !== 'object') {
        return { valid: false, errors: ['Objective must be an object'] };
    }

    if (!objective.type) {
        errors.push('Objective must have a type');
    } else if (!Object.values(OBJECTIVE_TYPES).includes(objective.type)) {
        errors.push(`Invalid objective type: ${objective.type}`);
    }

    const typeInfo = OBJECTIVE_TYPE_INFO[objective.type];
    if (typeInfo) {
        if (typeInfo.requiresTarget && !objective.target) {
            errors.push(`Objective type '${objective.type}' requires a target`);
        }
        if (typeInfo.requiresSkill && !objective.skill) {
            errors.push(`Objective type '${objective.type}' requires a skill`);
        }
        if (typeInfo.requiresLevel && !objective.level) {
            errors.push(`Objective type '${objective.type}' requires a level`);
        }
        if (typeInfo.requiresArmorType && !objective.armorType) {
            errors.push(`Objective type '${objective.type}' requires an armorType`);
        }
        if (typeInfo.requiresKey && !objective.key) {
            errors.push(`Objective type '${objective.type}' requires a key`);
        }
        if (typeInfo.requiresItems && !objective.items) {
            errors.push(`Objective type '${objective.type}' requires an items array`);
        }
        if (typeInfo.requiresTab && !objective.tab) {
            errors.push(`Objective type '${objective.type}' requires a tab`);
        }
    }

    // Count validation (except for level-based objectives)
    if (!typeInfo?.requiresLevel && (objective.count === undefined || objective.count < 1)) {
        errors.push('Objective must have a count >= 1');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get display text for an objective
 * @param {object} objective - The objective
 * @param {object} options - Display options
 * @returns {string} Human-readable objective text
 */
function getObjectiveDisplayText(objective, options = {}) {
    const typeInfo = OBJECTIVE_TYPE_INFO[objective.type];
    if (!typeInfo) return 'Unknown objective';

    const current = objective.current || 0;
    const total = objective.count || objective.level || 1;
    const progress = options.showProgress !== false ? ` (${current}/${total})` : '';

    switch (objective.type) {
        case OBJECTIVE_TYPES.KILL:
            const enemyName = getTargetName(objective.target, 'enemy') || objective.target;
            return `${typeInfo.label} ${total} ${enemyName}${progress}`;

        case OBJECTIVE_TYPES.KILL_TYPE:
            return `${typeInfo.label} ${total} ${objective.armorType} enemies${progress}`;

        case OBJECTIVE_TYPES.KILL_ANY:
            return `${typeInfo.label} ${total} enemies${progress}`;

        case OBJECTIVE_TYPES.HARVEST:
            const nodeName = getTargetName(objective.target, 'node') || objective.target;
            return `${typeInfo.label} ${nodeName} ${total} times${progress}`;

        case OBJECTIVE_TYPES.GATHER:
        case OBJECTIVE_TYPES.TURN_IN:
            const itemName = getTargetName(objective.target, 'item') || objective.target;
            return `${typeInfo.label} ${total} ${itemName}${progress}`;

        case OBJECTIVE_TYPES.TURN_IN_SET:
            return `${typeInfo.label} required items${progress}`;

        case OBJECTIVE_TYPES.CRAFT:
            const craftItemName = getTargetName(objective.target, 'item') || objective.target;
            return `${typeInfo.label} ${total} ${craftItemName}${progress}`;

        case OBJECTIVE_TYPES.CRAFT_SKILL:
            return `${typeInfo.label} ${total} ${objective.skill} items${progress}`;

        case OBJECTIVE_TYPES.EXPLORE:
            const regionName = getTargetName(objective.target, 'region') || objective.target;
            return `${typeInfo.label} ${regionName}`;

        case OBJECTIVE_TYPES.DISCOVER:
            return `${typeInfo.label} ${objective.target}`;

        case OBJECTIVE_TYPES.TRAVEL:
            return `${typeInfo.label} ${total} tiles${progress}`;

        case OBJECTIVE_TYPES.LEVEL_SKILL:
            return `${typeInfo.label} ${objective.skill} to level ${objective.level}`;

        case OBJECTIVE_TYPES.LEVEL_CHAR:
            return `${typeInfo.label} to level ${objective.level}`;

        case OBJECTIVE_TYPES.EQUIP:
            if (objective.target) {
                const equipItemName = getTargetName(objective.target, 'item') || objective.target;
                return `${typeInfo.label} ${equipItemName}`;
            }
            return `${typeInfo.label} a ${objective.slot} item`;

        case OBJECTIVE_TYPES.EARN_GOLD:
            return `${typeInfo.label} ${total} gold${progress}`;

        case OBJECTIVE_TYPES.SPEND_GOLD:
            return `${typeInfo.label} ${total} gold${progress}`;

        case OBJECTIVE_TYPES.TALK:
            const npcName = getTargetName(objective.target, 'npc') || objective.target;
            return `${typeInfo.label} to ${npcName}`;

        case OBJECTIVE_TYPES.CUSTOM:
            return objective.description || `Complete: ${objective.key}`;

        case OBJECTIVE_TYPES.VISIT_TAB:
            const tabName = objective.tab ? objective.tab.charAt(0).toUpperCase() + objective.tab.slice(1) : 'tab';
            return `${typeInfo.label} the ${tabName} tab`;

        default:
            return `${typeInfo.label}${progress}`;
    }
}

/**
 * Helper to get display name for targets
 * @param {string} targetId - The target ID
 * @param {string} targetType - The type of target
 * @returns {string|null} Display name or null
 */
function getTargetName(targetId, targetType) {
    if (!targetId || typeof window === 'undefined') return null;

    try {
        switch (targetType) {
            case 'enemy':
                const enemy = window.GameEngine?.definitions?.enemies?.[targetId];
                return enemy?.name || null;
            case 'item':
                const item = window.ItemAccessHelper?.getItem?.(targetId);
                return item?.name || null;
            case 'node':
                const node = window.GameEngine?.definitions?.nodes?.[targetId];
                return node?.name || null;
            case 'region':
                const region = window.GameEngine?.definitions?.regions?.[targetId];
                return region?.name || null;
            case 'npc':
                const npc = window.GameEngine?.definitions?.npcs?.[targetId];
                return npc?.name || null;
            default:
                return null;
        }
    } catch (e) {
        return null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OBJECTIVE_TYPES,
        OBJECTIVE_EVENT_MAP,
        OBJECTIVE_TYPE_INFO,
        validateObjective,
        getObjectiveDisplayText,
        getTargetName
    };
}

// Browser global access
if (typeof window !== 'undefined') {
    window.OBJECTIVE_TYPES = OBJECTIVE_TYPES;
    window.OBJECTIVE_EVENT_MAP = OBJECTIVE_EVENT_MAP;
    window.OBJECTIVE_TYPE_INFO = OBJECTIVE_TYPE_INFO;
    window.validateObjective = validateObjective;
    window.getObjectiveDisplayText = getObjectiveDisplayText;
}
