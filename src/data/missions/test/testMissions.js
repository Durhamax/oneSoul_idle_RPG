/**
 * TEST MISSIONS
 *
 * Test missions for validating the mission system architecture.
 * These use the new mission_XYY ID format and new objective types.
 *
 * Mission Types (from MissionIdUtils):
 * 1 = main, 2 = side, 3 = daily, 4 = milestone, 5 = regional, 6 = faction, 7 = event, 8 = hidden
 */

const TEST_MISSIONS = {
    /**
     * Test Mission 1 - Gather Test (mission_901)
     * Tests: gather objective, auto-completion
     * Note: Renamed from mission_101 to avoid conflict with production tutorial
     */
    mission_901: {
        id: 'mission_901',
        name: 'First Steps (Test)',
        description: 'Gather some basic materials to get started on your journey.',
        type: 'main',
        tier: 1,
        difficulty: 'trivial',

        objectives: [
            {
                id: 'gather_logs',
                type: 'gather',
                target: 'pinewood',
                count: 5,
                description: 'Gather 5 Pinewood'
            }
        ],

        rewards: {
            gold: 50,
            experience: 100,
            skills: {
                logging: 25
            }
        },

        narrative: {
            intro: 'Every journey begins with a single step. Let\'s start by gathering some wood.',
            accept: 'Good luck out there!',
            progress: 'Keep gathering those logs.',
            complete: 'Excellent work! You\'re already making progress.'
        },

        requirements: {},

        chains: {
            next: 'mission_902',
            chainId: 'test_tutorial_chain',
            chainOrder: 1
        }
    },

    /**
     * Test Mission 2 - Craft Test (mission_902)
     * Tests: craft objective, mission chaining
     * Note: Renamed from mission_102 to avoid conflict with production missions
     */
    mission_902: {
        id: 'mission_902',
        name: 'Basic Crafting (Test)',
        description: 'Learn to craft basic tools using the materials you\'ve gathered.',
        type: 'main',
        tier: 1,
        difficulty: 'easy',

        objectives: [
            {
                id: 'craft_tool',
                type: 'craft',
                target: 'stonePickaxe',
                count: 1,
                description: 'Craft a Stone Pickaxe'
            }
        ],

        rewards: {
            gold: 75,
            experience: 150,
            items: [
                { itemId: 'flint', quantity: 5 }
            ]
        },

        narrative: {
            intro: 'Now that you have some materials, let\'s put them to use.',
            complete: 'A fine tool! This will serve you well.'
        },

        requirements: {
            missions: ['mission_901']
        },

        chains: {
            previous: 'mission_901',
            next: 'mission_903',
            chainId: 'test_tutorial_chain',
            chainOrder: 2
        }
    },

    /**
     * Side Quest - Gathering Challenge (mission_201)
     * Tests: multiple gather objectives
     */
    mission_201: {
        id: 'mission_201',
        name: 'Stockpile Resources',
        description: 'Build up a stockpile of various materials for future use.',
        type: 'side',
        tier: 1,
        difficulty: 'normal',

        objectives: [
            {
                id: 'gather_logs_2',
                type: 'gather',
                target: 'pinewood',
                count: 10,
                description: 'Gather 10 Pinewood'
            },
            {
                id: 'gather_stone',
                type: 'gather',
                target: 'stone',
                count: 10,
                description: 'Gather 10 Stone'
            },
            {
                id: 'gather_copper',
                type: 'gather',
                target: 'copperOre',
                count: 5,
                description: 'Gather 5 Copper Ore'
            }
        ],

        rewards: {
            gold: 200,
            experience: 250,
            skills: {
                mining: 50,
                logging: 50
            }
        },

        requirements: {
            level: 2
        }
    },

    /**
     * Turn-in Mission - Supply Run (mission_202)
     * Tests: turnIn objective (items consumed on submission)
     */
    mission_202: {
        id: 'mission_202',
        name: 'Supply Run',
        description: 'Deliver materials to the supply depot.',
        type: 'side',
        tier: 1,
        difficulty: 'easy',

        objectives: [
            {
                id: 'turnin_logs',
                type: 'turnIn',
                target: 'pinewood',
                count: 10,
                description: 'Deliver 10 Pinewood'
            }
        ],

        rewards: {
            gold: 150,
            experience: 100
        },

        narrative: {
            intro: 'The depot needs supplies. Bring us some logs.',
            complete: 'Much appreciated! Here\'s your payment.'
        },

        requirements: {}
    },

    /**
     * Daily Mission - Training Exercise (mission_301)
     * Tests: repeatable mission, killAny objective
     */
    mission_301: {
        id: 'mission_301',
        name: 'Combat Training',
        description: 'Defeat enemies to improve your combat skills.',
        type: 'daily',
        tier: 1,
        difficulty: 'normal',
        repeatable: true,
        cooldown: 86400,  // 24 hours in seconds

        objectives: [
            {
                id: 'kill_any',
                type: 'killAny',
                count: 5,
                description: 'Defeat 5 enemies'
            }
        ],

        rewards: {
            gold: 100,
            experience: 200
        },

        requirements: {}
    },

    /**
     * Milestone Mission - Skill Mastery (mission_401)
     * Tests: levelSkill objective
     */
    mission_401: {
        id: 'mission_401',
        name: 'Mining Apprentice',
        description: 'Reach Mining level 5 to prove your skill.',
        type: 'milestone',
        tier: 1,
        difficulty: 'normal',

        objectives: [
            {
                id: 'level_mining',
                type: 'levelSkill',
                skill: 'mining',
                level: 5,
                count: 1,
                description: 'Reach Mining level 5'
            }
        ],

        rewards: {
            gold: 500,
            experience: 500,
            items: [
                { itemId: 'ironPickaxe', quantity: 1 }
            ]
        },

        requirements: {}
    }
};

// Register test missions - ONLY in dev mode
// Test missions use fake items (flint, ironPickaxe, stonePickaxe) that don't exist in production
if (typeof MissionRegistry !== 'undefined') {
    // Check for dev mode flag - only register if explicitly in dev/test environment
    const isDevMode = typeof window !== 'undefined' && (
        window.DEV_MODE === true ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('dev=true')
    );

    if (isDevMode) {
        MissionRegistry.register('test', TEST_MISSIONS);
        console.log('🧪 Test missions registered (dev mode)');
    } else {
        console.log('ℹ️ Test missions skipped (production mode)');
    }
} else {
    console.warn('⚠️ MissionRegistry not available - test missions not registered');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TEST_MISSIONS;
}
