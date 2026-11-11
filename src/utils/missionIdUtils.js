/**
 * MISSION ID UTILITIES
 *
 * Utility module for mission ID parsing and generation.
 *
 * ID Format: mission_XYY
 * - X = Type digit (1-8)
 * - YY = Order/tier (01-99)
 *
 * Type Codes:
 * 1 = main (sequential, 101-104 are tutorials)
 * 2 = side (tier-based difficulty)
 * 3 = daily (repeatable)
 * 4 = milestone (achievement-based)
 * 5 = regional (region-specific)
 * 6 = faction (reputation-based)
 * 7 = event (limited-time)
 * 8 = hidden (secret/discovery)
 */

const MissionIdUtils = {
    // Type code mappings
    TYPE_CODES: {
        main: 1,
        side: 2,
        daily: 3,
        milestone: 4,
        regional: 5,
        faction: 6,
        event: 7,
        hidden: 8
    },

    TYPE_NAMES: {
        1: 'main',
        2: 'side',
        3: 'daily',
        4: 'milestone',
        5: 'regional',
        6: 'faction',
        7: 'event',
        8: 'hidden'
    },

    // Tutorial missions are main story missions 101-104
    TUTORIAL_RANGE: { start: 1, end: 4 },

    // Sequential types (order matters)
    SEQUENTIAL_TYPES: ['main'],

    // Repeatable types
    REPEATABLE_TYPES: ['daily', 'event'],

    /**
     * Parse a mission ID into its components
     * @param {string} missionId - The mission ID (e.g., 'mission_101')
     * @returns {object|null} Parsed components or null if invalid
     */
    parse(missionId) {
        if (!missionId || typeof missionId !== 'string') {
            return null;
        }

        // Match pattern: mission_XYY where X is 1-8 and YY is 01-99
        const match = missionId.match(/^mission_(\d)(\d{2})$/);
        if (!match) {
            return null;
        }

        const typeCode = parseInt(match[1], 10);
        const order = parseInt(match[2], 10);
        const type = this.TYPE_NAMES[typeCode];

        if (!type) {
            return null;
        }

        const isMainStory = type === 'main';
        const isTutorial = isMainStory && order >= this.TUTORIAL_RANGE.start && order <= this.TUTORIAL_RANGE.end;
        const isSideQuest = type === 'side';
        const isRepeatable = this.REPEATABLE_TYPES.includes(type);
        const isSequential = this.SEQUENTIAL_TYPES.includes(type);

        return {
            fullId: missionId,
            typeCode,
            order,
            type,
            isMainStory,
            isTutorial,
            isSideQuest,
            isRepeatable,
            isSequential
        };
    },

    /**
     * Create a mission ID from type and order
     * @param {string|number} type - Type name ('main') or type code (1)
     * @param {number} order - Order number (1-99)
     * @returns {string|null} Mission ID or null if invalid
     */
    create(type, order) {
        let typeCode;

        if (typeof type === 'string') {
            typeCode = this.TYPE_CODES[type];
        } else if (typeof type === 'number') {
            typeCode = type;
        }

        if (!typeCode || typeCode < 1 || typeCode > 8) {
            console.warn(`[MissionIdUtils] Invalid type: ${type}`);
            return null;
        }

        if (!order || order < 1 || order > 99) {
            console.warn(`[MissionIdUtils] Invalid order: ${order}`);
            return null;
        }

        const orderStr = order.toString().padStart(2, '0');
        return `mission_${typeCode}${orderStr}`;
    },

    /**
     * Get the next main story mission ID
     * @param {string} currentId - Current mission ID
     * @returns {string|null} Next mission ID or null
     */
    getNextMainStory(currentId) {
        const parsed = this.parse(currentId);
        if (!parsed || !parsed.isMainStory) {
            return null;
        }

        if (parsed.order >= 99) {
            return null;
        }

        return this.create('main', parsed.order + 1);
    },

    /**
     * Get the previous main story mission ID
     * @param {string} currentId - Current mission ID
     * @returns {string|null} Previous mission ID or null
     */
    getPreviousMainStory(currentId) {
        const parsed = this.parse(currentId);
        if (!parsed || !parsed.isMainStory) {
            return null;
        }

        if (parsed.order <= 1) {
            return null;
        }

        return this.create('main', parsed.order - 1);
    },

    /**
     * Sort mission IDs (main story first in order, then by type/order)
     * @param {string[]} missionIds - Array of mission IDs
     * @returns {string[]} Sorted array
     */
    sort(missionIds) {
        if (!Array.isArray(missionIds)) {
            return [];
        }

        return [...missionIds].sort((a, b) => {
            const parsedA = this.parse(a);
            const parsedB = this.parse(b);

            // Invalid IDs go to end
            if (!parsedA && !parsedB) return 0;
            if (!parsedA) return 1;
            if (!parsedB) return -1;

            // Main story missions first
            if (parsedA.isMainStory && !parsedB.isMainStory) return -1;
            if (!parsedA.isMainStory && parsedB.isMainStory) return 1;

            // Same type: sort by order
            if (parsedA.typeCode === parsedB.typeCode) {
                return parsedA.order - parsedB.order;
            }

            // Different types: sort by type code
            return parsedA.typeCode - parsedB.typeCode;
        });
    },

    /**
     * Filter missions by type
     * @param {string[]} missionIds - Array of mission IDs
     * @param {string|number} type - Type name or code
     * @returns {string[]} Filtered array
     */
    filterByType(missionIds, type) {
        if (!Array.isArray(missionIds)) {
            return [];
        }

        let targetTypeCode;
        if (typeof type === 'string') {
            targetTypeCode = this.TYPE_CODES[type];
        } else {
            targetTypeCode = type;
        }

        if (!targetTypeCode) {
            return [];
        }

        return missionIds.filter(id => {
            const parsed = this.parse(id);
            return parsed && parsed.typeCode === targetTypeCode;
        });
    },

    /**
     * Get all main story missions from a list
     * @param {string[]} missionIds - Array of mission IDs
     * @returns {string[]} Main story mission IDs
     */
    getMainStoryMissions(missionIds) {
        return this.filterByType(missionIds, 'main');
    },

    /**
     * Get all tutorial missions from a list
     * @param {string[]} missionIds - Array of mission IDs
     * @returns {string[]} Tutorial mission IDs
     */
    getTutorialMissions(missionIds) {
        return this.getMainStoryMissions(missionIds).filter(id => {
            const parsed = this.parse(id);
            return parsed && parsed.isTutorial;
        });
    },

    /**
     * Get all side quests from a list
     * @param {string[]} missionIds - Array of mission IDs
     * @returns {string[]} Side quest mission IDs
     */
    getSideQuests(missionIds) {
        return this.filterByType(missionIds, 'side');
    },

    /**
     * Get type display info for UI
     * @param {string} type - Type name
     * @returns {object} Display info with icon, color, label
     */
    getTypeDisplayInfo(type) {
        const displayInfo = {
            main: { icon: '📖', color: '#2196F3', label: 'Main Story' },
            side: { icon: '📜', color: '#FF9800', label: 'Side Quest' },
            daily: { icon: '🔄', color: '#9C27B0', label: 'Daily' },
            milestone: { icon: '🏆', color: '#4CAF50', label: 'Milestone' },
            regional: { icon: '🗺️', color: '#00BCD4', label: 'Regional' },
            faction: { icon: '⚔️', color: '#F44336', label: 'Faction' },
            event: { icon: '🎉', color: '#FFEB3B', label: 'Event' },
            hidden: { icon: '🔮', color: '#607D8B', label: 'Hidden' }
        };

        return displayInfo[type] || { icon: '📋', color: '#888', label: 'Unknown' };
    },

    /**
     * Validate a mission ID format
     * @param {string} missionId - The mission ID to validate
     * @returns {boolean} True if valid
     */
    isValid(missionId) {
        return this.parse(missionId) !== null;
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionIdUtils;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.MissionIdUtils = MissionIdUtils;
}
