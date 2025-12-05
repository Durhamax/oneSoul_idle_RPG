/**
 * Tutorial Missions (101-106)
 *
 * These missions guide new players through all core game systems.
 * Mission flow:
 * 101: Getting Around     -> UI Tour, learn interface        -> Reward: Unity Scout Set
 * 102: Tools For Success  -> Learn equipment system          -> Reward: 6 Gathering Tools
 * 103: Gather Up          -> Learn gathering (5 skills)      -> Reward: Crafting materials
 * 104: Now We're Cookin'  -> Learn crafting (Cooking)        -> Reward: Food stockpile
 * 105: Back On Shift      -> Learn navigation/exploration    -> Reward: More resources
 * 106: Force of Nature    -> Self-directed crafting loop     -> Reward: Bow + Arrows
 *
 * All missions require returning to Missions tab to complete (requiresTurnIn: true)
 */

const TUTORIAL_MISSIONS = {
    // ==========================================
    // MISSION 101: Getting Around (UI Tour)
    // ==========================================
    mission_101: {
        id: 'mission_101',
        name: 'Getting Around',
        description: 'Elder Maren shows you the facilities of Unity settlement.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_1',
        prerequisites: [],

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "Before you can survive out there, you need to understand what we have here in Unity.",
            body: "Let me show you around. Each area of our settlement serves a vital purpose.",
            completion: "Excellent! You now know your way around. Take this armor - it belonged to a scout who... well, you'll do it justice."
        },

        // Tab order: Overview, Items, Loadout, Combat, Explore, Gather, Craft, Missions
        // Note: Perks tab will get its own tutorial after combat introduction
        objectives: [
            {
                id: 'visit_overview',
                type: 'visitTab',
                tab: 'overview',
                description: 'Visit the Overview tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Overview',
                    body: 'Your personal dashboard. Track your level, experience, and attributes here. As you grow, you\'ll spend attribute points to specialize.',
                    hint: 'Click the Overview tab'
                }
            },
            {
                id: 'visit_bank',
                type: 'visitTab',
                tab: 'bank',
                description: 'Visit the Items tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Items',
                    body: 'Everything you gather, craft, or loot ends up here. Items are organized by type. Click any item to see details and options.',
                    hint: 'Click the Items tab'
                }
            },
            {
                id: 'visit_equipment',
                type: 'visitTab',
                tab: 'equipment',
                description: 'Visit the Loadout tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Loadout',
                    body: 'What you wear and wield determines your power. Equip weapons for combat, tools for gathering, armor for protection.',
                    hint: 'Click the Loadout tab'
                }
            },
            {
                id: 'visit_combat',
                type: 'visitTab',
                tab: 'combat',
                description: 'Visit the Combat tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Combat',
                    body: 'The wilds are dangerous. Here you\'ll select enemies to fight and claim victory over the creatures of Aurora Vitae.',
                    hint: 'Click the Combat tab'
                }
            },
            {
                id: 'visit_navigation',
                type: 'visitTab',
                tab: 'navigation',
                description: 'Visit the Explore tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Explore',
                    body: 'Aurora Vitae is vast. Navigate the world, discover resources, and expand your reach. Exploration costs endurance.',
                    hint: 'Click the Explore tab'
                }
            },
            {
                id: 'visit_gather',
                type: 'visitTab',
                tab: 'gather',
                description: 'Visit the Gather tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Gather',
                    body: 'Resources are the lifeblood of survival. Select a gathering node and use your tools to collect materials for crafting.',
                    hint: 'Click the Gather tab'
                }
            },
            {
                id: 'visit_crafting',
                type: 'visitTab',
                tab: 'crafting',
                description: 'Visit the Crafting tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Crafting',
                    body: 'Raw materials become powerful equipment through crafting. Browse recipes, queue crafts, and upgrade your workshops.',
                    hint: 'Click the Crafting tab'
                }
            },
            {
                id: 'visit_missions',
                type: 'visitTab',
                tab: 'missions',
                description: 'Visit the Missions tab',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Missions',
                    body: 'Your mission hub. Accept quests, track progress, and claim rewards. Return here to complete missions and receive your rewards.',
                    hint: 'Click the Missions tab'
                }
            },
            {
                id: 'return_to_missions',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                required: 1,
                useSpotlight: true,
                isTurnIn: true,
                tourContent: {
                    title: 'Complete Mission',
                    body: 'Return to the Missions tab to complete your mission and claim your rewards!',
                    hint: 'Click the Missions tab to finish'
                }
            }
        ],

        rewards: {
            characterXP: 50,
            items: [
                { itemId: 'unityScoutSet', quantity: 1 }
            ]
        },

        metadata: {
            chain: 'tutorial',
            chainOrder: 1,
            unlocks: ['mission_102'],
            requiresTurnIn: true,
            flags: {
                isTutorial: true,
                isUITour: true,
                useSpotlight: true
            }
        }
    },

    // ==========================================
    // MISSION 102: Tools For Success
    // ==========================================
    mission_102: {
        id: 'mission_102',
        name: 'Tools For Success',
        description: 'Equip your new armor and receive the tools of a Unity ranger.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_1',
        requirements: {
            missions: ['mission_101']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "That armor will protect you, but you need to wear it first. Let me show you how equipment works.",
            body: "Go to your Loadout and equip the Unity Scout Set. Once you've done that, I'll give you the tools every ranger needs.",
            completion: "Well done! A true Unity ranger now. These tools will let you gather resources from the land. Treat them well."
        },

        objectives: [
            {
                id: 'equip_armor',
                type: 'equip',
                slot: 'armor',
                target: 'unityScoutSet',
                description: 'Equip the Unity Scout Set',
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Equip Your Armor',
                    body: 'Open your Items, find the Unity Scout Set, and equip it. Or click the armor slot here to see available armor.',
                    hint: 'Equip the Unity Scout Set to your armor slot'
                }
            },
            {
                id: 'return_to_missions_102',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 75,
            items: [
                { itemId: 'lightPickaxe', quantity: 1 },
                { itemId: 'utilityHatchet', quantity: 1 },
                { itemId: 'caneRod', quantity: 1 },
                { itemId: 'huntingBlade', quantity: 1 },
                { itemId: 'wovenBasket', quantity: 1 },
                { itemId: 'lockpick', quantity: 1 }
            ]
        },

        metadata: {
            chain: 'tutorial',
            chainOrder: 2,
            unlocks: ['mission_103'],
            requiresTurnIn: true,
            flags: {
                isTutorial: true,
                useSpotlight: true
            }
        }
    },

    // ==========================================
    // MISSION 103: Gather Up
    // ==========================================
    mission_103: {
        id: 'mission_103',
        name: 'Gather Up',
        description: 'Learn the five gathering skills by collecting resources from The Cradle.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_1',
        requirements: {
            missions: ['mission_102']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "Now you have the tools, it's time to learn how to use them. The Cradle provides everything we need to survive.",
            body: "Visit each gathering location and collect some basic resources. You'll need to equip the right tool for each task.",
            completion: "You're a natural! These resources are the foundation of everything we build. Here, take some extra supplies for your next lesson."
        },

        objectives: [
            {
                id: 'gather_clay',
                type: 'gather',
                target: 'clay',
                count: 10,
                description: 'Gather 10 Clay from the Riverbed',
                required: 10
            },
            {
                id: 'gather_pinewood',
                type: 'gather',
                target: 'pinewood',
                count: 10,
                description: 'Gather 10 Pinewood from Lakeside Forest',
                required: 10
            },
            {
                id: 'gather_solfish',
                type: 'gather',
                target: 'solfish',
                count: 10,
                description: 'Gather 10 Solfish from Lake Shallows',
                required: 10
            },
            {
                id: 'gather_pelts',
                type: 'gather',
                target: 'smallPelts',
                count: 10,
                description: 'Gather 10 Small Pelts from Meadow Game Trail',
                required: 10
            },
            {
                id: 'gather_herbs',
                type: 'gather',
                target: 'mintyHerb',
                count: 10,
                description: 'Gather 10 Minty Herb from Fallen Timber',
                required: 10
            },
            {
                id: 'return_to_missions_103',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 100,
            skillXP: {
                mining: 25,
                logging: 25,
                fishing: 25,
                hunting: 25,
                foraging: 25
            },
            items: [
                { itemId: 'solfish', quantity: 25 },
                { itemId: 'mintyHerb', quantity: 25 }
            ]
        },

        metadata: {
            chain: 'tutorial',
            chainOrder: 3,
            unlocks: ['mission_104'],
            requiresTurnIn: true,
            flags: {
                isTutorial: true
            }
        }
    },

    // ==========================================
    // MISSION 104: Now We're Cookin'
    // ==========================================
    mission_104: {
        id: 'mission_104',
        name: "Now We're Cookin'",
        description: 'Learn the crafting system by preparing Solfish Bakes.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_1',
        requirements: {
            missions: ['mission_103']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "Raw fish is fine in a pinch, but a proper meal restores both body and spirit.",
            body: "Take those fish and herbs to the crafting area. I'll teach you to make Solfish Bake - a Unity staple.",
            completion: "The smell alone would make the ancestors proud! Food heals you in combat and speeds recovery. Never venture out hungry."
        },

        objectives: [
            {
                id: 'craft_solfishbake',
                type: 'craft',
                target: 'solfishBake',
                count: 25,
                description: 'Craft 25 Solfish Bakes',
                required: 25
            },
            {
                id: 'return_to_missions_104',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 100,
            skillXP: {
                cooking: 50
            },
            items: [
                { itemId: 'solfishBake', quantity: 10 }
            ]
        },

        metadata: {
            chain: 'tutorial',
            chainOrder: 4,
            unlocks: ['mission_105'],
            requiresTurnIn: true,
            flags: {
                isTutorial: true
            }
        }
    },

    // ==========================================
    // MISSION 105: Back On Shift
    // ==========================================
    mission_105: {
        id: 'mission_105',
        name: 'Back On Shift',
        description: 'Learn the navigation system by exploring The Cradle.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_1',
        requirements: {
            missions: ['mission_104']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "You've learned to gather and craft. Now it's time to expand your horizons.",
            body: "Use the navigation system to explore The Cradle further. Each expedition reveals more resources and opportunities.",
            completion: "Your efforts have expanded our knowledge of the region. The more we discover, the more resources become available to harvest."
        },

        objectives: [
            {
                id: 'explore_region',
                type: 'explore',
                target: 'region_1',
                count: 10,
                description: 'Explore The Cradle to 10% discovery',
                required: 10
            },
            {
                id: 'return_to_missions_105',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 100,
            skillXP: {
                navigation: 50
            },
            items: [
                { itemId: 'pinewood', quantity: 20 },
                { itemId: 'riverwillow', quantity: 10 },
                { itemId: 'plantFibers', quantity: 10 }
            ]
        },

        metadata: {
            chain: 'tutorial',
            chainOrder: 5,
            unlocks: ['mission_106'],
            requiresTurnIn: true,
            flags: {
                isTutorial: true
            }
        }
    },

    // ==========================================
    // MISSION 106: Force of Nature
    // ==========================================
    mission_106: {
        id: 'mission_106',
        name: 'Force of Nature',
        description: 'Put your skills together to craft a bow and arrows.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_1',
        requirements: {
            missions: ['mission_105']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "You've learned to gather, cook, and explore. Now let's see if you can put it all together.",
            body: "Craft yourself a Greensman Training Bow and some Flinthead Arrows. You'll need to gather the materials yourself - riverwillow, plant fibers, pelts, flint, pinewood, and feathers.",
            completion: "A ranger armed and ready! You've proven you can survive on your own. The wilds of Aurora Vitae await you. May your aim be true."
        },

        objectives: [
            {
                id: 'craft_bow',
                type: 'craft',
                target: 'greensmanTrainingBow',
                count: 1,
                description: 'Craft a Greensman Training Bow',
                required: 1
            },
            {
                id: 'craft_arrows',
                type: 'craft',
                target: 'flintheadArrows',
                count: 1,
                description: 'Craft Flinthead Arrows',
                required: 1
            },
            {
                id: 'return_to_missions_106',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 150,
            skillXP: {
                mechanics: 75
            },
            items: [
                { itemId: 'flintheadArrows', quantity: 50 }
            ]
        },

        metadata: {
            chain: 'tutorial',
            chainOrder: 6,
            unlocks: [],  // Tutorial complete - opens to main story
            requiresTurnIn: true,
            flags: {
                isTutorial: true,
                tutorialComplete: true
            }
        }
    }
};

// Register tutorial missions
if (typeof MissionRegistry !== 'undefined') {
    MissionRegistry.register('production', TUTORIAL_MISSIONS);
    console.log(`📋 Tutorial missions registered: ${Object.keys(TUTORIAL_MISSIONS).length}`);
} else {
    console.error('❌ MissionRegistry not found - cannot register tutorial missions');
}

// Export for reference
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TUTORIAL_MISSIONS };
}
