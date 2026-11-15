/**
 * MAIN STORY MISSIONS
 *
 * Core storyline missions that continue the wired tutorial chain (101-106,
 * tutorial_missions.js) into Act I of the campaign (CAMPAIGN_ARC.md §1a, Tier 1).
 *
 * Chain so far:
 *   106  Force of Nature   -> (tutorial end) craft Bow + Arrows
 *   107  Machines in the Garden -> FIRST COMBAT TEST: defeat 5 Elaran Survey Drones.
 *                                 Teaches the combat loadout (bow + ammo + food).
 *   108  What the Drones Saw     -> Reverse the salvaged survey data; the first
 *                                   Infernus breadcrumb + Unity's founding history.
 *
 * Region 2 — Peaceful Meadows (mission numbering: 2xx):
 *   201  Past the Breach         -> First mission of the next region. Push EAST into
 *                                   Peaceful Meadows; take on the Elaran Surveyors
 *                                   (the enemy gets a face); learn more of Unity's
 *                                   history. Less handheld.
 *
 * Narrative canon: CAMPAIGN_ARC.md (Act I spine, Tier 1 anchors), MAP_POI.md
 * (Hex 2 Scoutreach — "machines in the garden", the surveying mystery), WORLD_BIBLE.md
 * (the Covenant, Elara's schism). The player must NOT yet learn the signal lies
 * beneath the Cradle — early hints stay cryptic (CAMPAIGN_ARC §5).
 */

const MAIN_STORY_MISSIONS = {
    // ==========================================
    // MISSION 107: Machines in the Garden (FIRST COMBAT)
    // ==========================================
    mission_107: {
        id: 'mission_107',
        name: 'Machines in the Garden',
        description: 'Drones have breached the Cradle. Arm yourself and drive them off.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_-3_-4',
        requirements: {
            missions: ['mission_106']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "They're here. Machines — in the garden. I never thought I'd see Elaran steel inside the Cradle.",
            body: "That bow you built is no longer for practice. Equip it, load your arrows, and keep cooked food on hand — a drone's laser bites, and only a full stomach brings you back. Go to Combat, pick an Elaran Survey Drone, and don't stop until five are scrap.",
            completion: "Five down. You held the garden. But why were they here at all? Those things weren't raiding — they were looking. Bring me what you tore off them; I want to know what they saw."
        },

        // Combat loadout test: weapon, ammo, then the fight. Food is taught in dialog
        // (it's consumed in combat, not an equip slot).
        objectives: [
            {
                id: 'equip_bow',
                type: 'equip',
                slot: 'weapon',
                target: 'greensmanTrainingBow',
                description: 'Equip the Greensman Training Bow',
                count: 1,
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Equip Your Weapon',
                    body: 'A bow is useless in the bank. Open your Loadout and equip the Greensman Training Bow to your weapon slot.',
                    hint: 'Equip the Greensman Training Bow'
                }
            },
            {
                id: 'equip_arrows',
                type: 'equip',
                slot: 'ammo',
                target: 'flintheadArrows',
                description: 'Load Flinthead Arrows into your ammo slot',
                count: 1,
                required: 1,
                useSpotlight: true,
                tourContent: {
                    title: 'Load Your Ammo',
                    body: 'A ranged weapon needs ammunition. Equip your Flinthead Arrows into the ammo slot — without arrows, your bow cannot fire.',
                    hint: 'Equip the Flinthead Arrows'
                }
            },
            {
                id: 'kill_drones',
                type: 'kill',
                target: 'elaran_survey_drone',
                description: 'Defeat 5 Elaran Survey Drones',
                count: 5,
                required: 5,
                useSpotlight: true,
                tourContent: {
                    title: 'Defend the Cradle',
                    body: 'Open the Combat tab, select an Elaran Survey Drone, and defeat five of them. Keep Solfish Bake in your bank — you heal with food between blows.',
                    hint: 'Defeat 5 Elaran Survey Drones in Combat'
                }
            },
            {
                id: 'return_to_missions_107',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                count: 1,
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 150,
            items: [
                { itemId: 'flintheadArrows', quantity: 40 },
                { itemId: 'solfishBake', quantity: 10 }
            ],
            base: {
                currencies: { medals: 3 }
            }
        },

        metadata: {
            chain: 'main_story',
            chainOrder: 7,
            unlocks: ['mission_108'],
            requiresTurnIn: true,
            flags: {
                isCombatIntro: true,
                useSpotlight: true
            }
        }
    },

    // ==========================================
    // MISSION 108: What the Drones Saw (lore + the first breadcrumb)
    // ==========================================
    mission_108: {
        id: 'mission_108',
        name: 'What the Drones Saw',
        description: "Study the drones' salvaged sensors and learn why the Elarans came.",
        type: 'main',
        tier: 1,

        regionRequired: 'region_-3_-4',
        requirements: {
            missions: ['mission_107']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "Tear the sensors from two more of them and bring them here. A drone's eye remembers where it looked.",
            body: "You should know what we are, before you carry our name out there. We are Unity — the pioneers who chose one people over many, bound by the Covenant our founders wrote for a world that would never need soldiers. Elara disagreed. She took her followers, named them for herself, and built a war-machine we swore never to become. These drones are hers. And they are not raiding — they are hunting a signal, a 'ghost' their instruments chase. I do not know what it is. I only know they followed it here, to the last garden we have left.",
            completion: "I was right. The readings point east and far away — a place their records call AV-S1, Infernus. Nothing of ours is out there. So why does the signal sing from under our feet? ...No. Old ears, imagining things. Go east, past the breach, and find out what the ones who sent these machines actually want."
        },

        objectives: [
            {
                id: 'turnin_sensors',
                type: 'turnIn',
                target: 'salvagedSensor',
                description: 'Recover 2 Salvaged Sensors from the drones',
                count: 2,
                required: 2
            },
            {
                id: 'return_to_missions_108',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                count: 1,
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 175,
            items: [
                { itemId: 'solfishBake', quantity: 10 }
            ],
            base: {
                currencies: { medals: 2 }
            }
        },

        metadata: {
            chain: 'main_story',
            chainOrder: 8,
            unlocks: ['mission_201'],
            requiresTurnIn: true,
            flags: {
                isLoreBeat: true
            }
        }
    },

    // ==========================================
    // MISSION 201: Past the Breach (REGION 2 — first mission; Elaran Surveyors)
    // ==========================================
    mission_201: {
        id: 'mission_201',
        name: 'Past the Breach',
        description: 'Cross east into the Peaceful Meadows and confront the Elarans behind the machines.',
        type: 'main',
        tier: 1,

        regionRequired: 'region_-2_-4',
        requirements: {
            missions: ['mission_108']
        },

        dialog: {
            npc: 'Elder Maren',
            npcIcon: '👴',
            intro: "The drones had handlers. Where machines map, people follow — surveyors, Elara's own, walking the meadows east of the breach.",
            body: "Travel into the Peaceful Meadows and see for yourself. These are not probes. They have faces, and names, and orders — orders that name the Cradle. Deal with the surveyors you find, and take whatever they carry. The road out is less gentle than home; no one will hold your hand past the breach.",
            completion: "So it's true. Their orders mark our garden as a target, even as they hunt their ghost-signal across the world. The founders wrote the Covenant for peace and left us no answer for this. Whatever the Elarans are truly after, the trail runs east — and so, now, do you."
        },

        objectives: [
            {
                id: 'explore_meadows',
                type: 'explore',
                target: 'region_-2_-4',
                description: 'Press east into the Peaceful Meadows',
                count: 10,
                required: 10
            },
            {
                id: 'kill_surveyors',
                type: 'kill',
                target: 'elaran_surveyor',
                description: 'Defeat 4 Elaran Surveyors',
                count: 4,
                required: 4
            },
            {
                id: 'return_to_missions_201',
                type: 'visitTab',
                tab: 'missions',
                description: 'Return to Missions to complete',
                count: 1,
                required: 1,
                isTurnIn: true
            }
        ],

        rewards: {
            characterXP: 250,
            gold: 60,
            items: [
                { itemId: 'flintheadArrows', quantity: 60 },
                { itemId: 'solfishBake', quantity: 15 }
            ],
            base: {
                currencies: { medals: 6 }
            }
        },

        metadata: {
            chain: 'region_2_meadows',
            chainOrder: 1,
            unlocks: [],  // Next region-2 mission to author
            requiresTurnIn: true,
            flags: {
                isLoreBeat: true
            }
        }
    }
};

// Register main story missions
if (typeof MissionRegistry !== 'undefined') {
    MissionRegistry.register('production', MAIN_STORY_MISSIONS);
    console.log(`📖 Main story missions registered: ${Object.keys(MAIN_STORY_MISSIONS).length}`);
} else {
    console.error('❌ MissionRegistry not found - cannot register main story missions');
}

// Export for reference
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAIN_STORY_MISSIONS };
}
