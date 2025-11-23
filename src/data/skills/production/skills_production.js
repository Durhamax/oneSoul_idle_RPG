/**
 * PRODUCTION SKILLS
 *
 * All live, player-facing skills in the game.
 */

const productionSkills = {
    // Priority Skills
    navigation: {
        id: 'navigation',
        name: "Navigation",
        description: "Explore regions and discover new locations",
        icon: '🗺️',
        category: 'priority',
        type: 'exploration',
        explorationSpeed: 0.1  // Base exploration speed per level (% per second)
    },

    engineering: {
        id: 'engineering',
        name: "Engineering",
        description: "Unlocks workshop upgrades, reverse engineering, and advanced assembly. Enhances all crafting skills.",
        icon: '⚙️',
        category: 'vertical',
        type: 'support',
        bonusPerLevel: 0.02,  // +2% all crafting effectiveness per level
        enhancesSkills: ["cooking", "chemistry", "smithing", "mechanics", "electronics", "textiles"]
    },

    // Gathering Skills
    mining: {
        id: 'mining',
        name: "Mining",
        description: "Increases ore gathering efficiency",
        icon: '⛏️',
        category: 'gathering',
        type: 'resource',
        bonusPerLevel: 0.05,  // +5% ore per level
        gatheringSkill: true
    },

    logging: {
        id: 'logging',
        name: "Logging",
        description: "Increases wood gathering efficiency",
        icon: '🪓',
        category: 'gathering',
        type: 'resource',
        bonusPerLevel: 0.05,  // +5% wood per level
        gatheringSkill: true
    },

    fishing: {
        id: 'fishing',
        name: "Fishing",
        description: "Catch fish from lakes, rivers, and streams",
        icon: '🎣',
        category: 'gathering',
        type: 'resource',
        bonusPerLevel: 0.05,  // +5% fishing success per level
        gatheringSkill: true
    },

    hunting: {
        id: 'hunting',
        name: "Hunting",
        description: "Track and hunt animals for meat and materials",
        icon: '🏹',
        category: 'gathering',
        type: 'resource',
        bonusPerLevel: 0.05,  // +5% hunting success per level
        gatheringSkill: true
    },

    foraging: {
        id: 'foraging',
        name: "Foraging",
        description: "Gather mushrooms, herbs, flowers, and plants",
        icon: '🌿',
        category: 'gathering',
        type: 'resource',
        bonusPerLevel: 0.05,  // +5% foraging success per level
        gatheringSkill: true
    },

    thieving: {
        id: 'thieving',
        name: "Thieving",
        description: "Steal valuables from locations and NPCs",
        icon: '🎭',
        category: 'gathering',
        type: 'resource',
        bonusPerLevel: 0.05,  // +5% thieving success per level
        gatheringSkill: true
    },

    // Crafting Skills
    cooking: {
        id: 'cooking',
        name: "Cooking",
        description: "Produces food, buffs, healing consumables. Consumes fish, meat, plants, herbs.",
        icon: '🍳',
        category: 'crafting',
        type: 'production',
        bonusPerLevel: 0.05,  // +5% buff effectiveness per level
        consumesResources: ["fish", "meat", "plants", "herbs"],
        producesTypes: ["food", "consumable", "buff"],
        craftingSkill: true
    },

    chemistry: {
        id: 'chemistry',
        name: "Chemistry",
        description: "Produces potions, explosives, ammo, processed materials. Consumes herbs, minerals, compounds.",
        icon: '⚗️',
        category: 'crafting',
        type: 'production',
        bonusPerLevel: 0.04,  // +4% potency per level
        consumesResources: ["herbs", "minerals", "compounds"],
        producesTypes: ["potion", "explosive", "ammo", "material"],
        craftingSkill: true
    },

    smithing: {
        id: 'smithing',
        name: "Smithing",
        description: "Produces melee weapons, armor plates, metal tools. Consumes ores, alloys, fuel.",
        icon: '🔨',
        category: 'crafting',
        type: 'production',
        bonusPerLevel: 0.03,  // +3% crafting quality per level
        consumesResources: ["ore", "alloys", "fuel"],
        producesTypes: ["meleeWeapon", "armor", "tool"],
        equipSlots: ["weapon", "chest", "helmet", "legs"],
        craftingSkill: true
    },

    mechanics: {
        id: 'mechanics',
        name: "Mechanics",
        description: "Produces ranged weapons, vehicles, drones. Consumes metals, parts, fuel.",
        icon: '⚙️',
        category: 'crafting',
        type: 'production',
        bonusPerLevel: 0.03,  // +3% crafting quality per level
        consumesResources: ["metal", "parts", "fuel"],
        producesTypes: ["rangedWeapon", "vehicle", "drone"],
        equipSlots: ["weapon", "back", "companion"],
        craftingSkill: true
    },

    electronics: {
        id: 'electronics',
        name: "Electronics",
        description: "Produces energy weapons, shields, augments. Consumes circuits, batteries, rare materials.",
        icon: '⚡',
        category: 'crafting',
        type: 'production',
        bonusPerLevel: 0.025,  // +2.5% crafting quality per level
        consumesResources: ["circuits", "batteries", "rareMaterials"],
        producesTypes: ["energyWeapon", "shield", "augment"],
        equipSlots: ["weapon", "neck", "ring"],
        craftingSkill: true
    },

    textiles: {
        id: 'textiles',
        name: "Textiles",
        description: "Produces cloth armor, bags, cloaks. Consumes fibers, leather, thread.",
        icon: '🧵',
        category: 'crafting',
        type: 'production',
        bonusPerLevel: 0.03,  // +3% crafting quality per level
        consumesResources: ["fiber", "leather", "thread"],
        producesTypes: ["clothArmor", "bag", "cloak"],
        equipSlots: ["chest", "back", "gloves", "boots"],
        craftingSkill: true
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = productionSkills;
}
