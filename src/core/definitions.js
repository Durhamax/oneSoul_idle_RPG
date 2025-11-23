/**
 * GAME DEFINITIONS
 *
 * Contains all game data: items, recipes, enemies, skills, world map, etc.
 * Extracted from gameEngine.js for better organization and maintainability.
 */

const GameDefinitions = {
    /**
     * Global Rarity Tiers System
     * Used across all items: equipment, consumables, resources, etc.
     *
     * Usage:
     * - Border Colors: Item cards display borders in rarity color
     * - Stat Scaling: statMultiplier can be used for procedurally generated items
     * - Drop Rates: dropWeight affects chance of items dropping (100 = normal, lower = rarer)
     * - Crafting: Can be used to affect success rates or required materials
     * - Glow Effect: Epic+ rarities have visual glow effects
     */
    RARITY_TIERS: {
        common: {
            name: "Common",
            color: "#9e9e9e",        // White/Gray
            icon: "⚪",
            statMultiplier: 1.0,      // Base stats (no bonus)
            dropWeight: 100,          // Most common drops
            glow: false
        },
        uncommon: {
            name: "Uncommon",
            color: "#4caf50",        // Green
            icon: "🟢",
            statMultiplier: 1.25,    // +25% stats
            dropWeight: 40,          // Common drops
            glow: false
        },
        rare: {
            name: "Rare",
            color: "#2196f3",        // Blue
            icon: "🔵",
            statMultiplier: 1.5,     // +50% stats
            dropWeight: 15,          // Uncommon drops
            glow: false
        },
        epic: {
            name: "Epic",
            color: "#9c27b0",        // Purple
            icon: "🟣",
            statMultiplier: 2.0,     // 2x stats
            dropWeight: 5,           // Rare drops
            glow: true
        },
        legendary: {
            name: "Legendary",
            color: "#ff9800",        // Orange
            icon: "🟠",
            statMultiplier: 3.0,     // 3x stats
            dropWeight: 1.5,         // Very rare drops
            glow: true
        },
        mythic: {
            name: "Mythic",
            color: "#f44336",        // Red
            icon: "🔴",
            statMultiplier: 5.0,     // 5x stats
            dropWeight: 0.5,         // Extremely rare
            glow: true
        },
        divine: {
            name: "Divine",
            color: "#ffd700",        // Gold
            icon: "✨",
            statMultiplier: 10.0,    // 10x stats
            dropWeight: 0.1,         // Nearly impossible
            glow: true
        },
        transcendent: {
            name: "Transcendent",
            color: "#00ffff",        // Cyan
            icon: "💫",
            statMultiplier: 20.0,    // 20x stats
            dropWeight: 0.01,        // Boss-only tier
            glow: true
        },
        creator: {
            name: "Creator",
            color: "#ff00ff",        // Magenta
            icon: "🌟",
            statMultiplier: 50.0,    // 50x stats
            dropWeight: 0.001,       // Legendary boss-only
            glow: true
        }
    },

    /**
     * Item Categories
     * Defines the types of items in the game
     */
    ITEM_CATEGORIES: {
        equipment: {
            name: "Equipment",
            description: "Wearable gear that provides stats",
            stackable: false,
            hasInstances: true
        },
        consumable: {
            name: "Consumable",
            description: "Single-use items that provide effects",
            stackable: true,
            hasInstances: false
        },
        component: {
            name: "Component",
            description: "Stackable crafted parts used in assembly",
            stackable: true,
            hasInstances: false
        },
        blueprint: {
            name: "Blueprint",
            description: "Non-stackable learned schematics",
            stackable: false,
            hasInstances: true
        },
        catalyst: {
            name: "Catalyst",
            description: "Enhancement materials",
            stackable: true,
            hasInstances: false
        },
        material: {
            name: "Material",
            description: "Processed resources",
            stackable: true,
            hasInstances: false
        },
        resource: {
            name: "Resource",
            description: "Raw gathered materials",
            stackable: true,
            hasInstances: false
        }
    },

    /**
     * Equipment Crafting Rarity System
     * Base chances for equipment crafting (before workshop bonuses)
     */
    EQUIPMENT_RARITY_CHANCES: {
        common: {
            baseChance: 0.50,        // 50%
            statRange: [0.80, 1.00],  // 80-100% of base stats
            enhancementSlots: 1
        },
        uncommon: {
            baseChance: 0.25,        // 25%
            statRange: [0.90, 1.10],  // 90-110% of base stats
            enhancementSlots: 2
        },
        rare: {
            baseChance: 0.15,        // 15%
            statRange: [1.00, 1.25],  // 100-125% of base stats
            enhancementSlots: 3
        },
        epic: {
            baseChance: 0.07,        // 7%
            statRange: [1.10, 1.40],  // 110-140% of base stats
            enhancementSlots: 4
        },
        legendary: {
            baseChance: 0.025,       // 2.5%
            statRange: [1.25, 1.60],  // 125-160% of base stats
            enhancementSlots: 5
        },
        mythic: {
            baseChance: 0.005,       // 0.5%
            statRange: [1.50, 2.00],  // 150-200% of base stats
            enhancementSlots: 6
        }
    },

    /**
     * Craft Types
     * Defines how different items are crafted
     */
    CRAFT_TYPES: {
        consumable: {
            name: "Consumable Crafting",
            description: "Mass production - every craft interval produces output",
            behavior: "continuous"
        },
        equipment: {
            name: "Equipment Crafting",
            description: "Long crafts with rarity and stat rolling",
            behavior: "single",
            rollsRarity: true,
            rollsStats: true
        },
        component: {
            name: "Component Crafting",
            description: "Stackable parts for assembly",
            behavior: "continuous"
        },
        enhancement: {
            name: "Enhancement",
            description: "Upgrades existing equipment",
            behavior: "single",
            requiresTarget: true
        }
    },

    /**
     * Workshop Upgrade System
     * Each crafting skill has tiered workshop upgrades
     */
    WORKSHOP_UPGRADES: {
        cooking: {
            name: "Kitchen",
            tiers: [
                {
                    tier: 1,
                    name: "Basic Kitchen",
                    cost: { engineeringTokens: 0, gold: 0 },
                    bonuses: { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "uncommon" }
                },
                {
                    tier: 2,
                    name: "Professional Kitchen",
                    cost: { engineeringTokens: 10, gold: 5000 },
                    bonuses: { rarityChance: 1.15, craftSpeed: 1.10, parallelSlots: 2, maxRarity: "rare" }
                },
                {
                    tier: 3,
                    name: "Master Kitchen",
                    cost: { engineeringTokens: 25, gold: 15000 },
                    bonuses: { rarityChance: 1.30, craftSpeed: 1.25, parallelSlots: 3, maxRarity: "epic" }
                },
                {
                    tier: 4,
                    name: "Legendary Kitchen",
                    cost: { engineeringTokens: 50, gold: 50000 },
                    bonuses: { rarityChance: 1.50, craftSpeed: 1.50, parallelSlots: 4, maxRarity: "legendary" }
                }
            ]
        },
        chemistry: {
            name: "Laboratory",
            tiers: [
                {
                    tier: 1,
                    name: "Basic Laboratory",
                    cost: { engineeringTokens: 0, gold: 0 },
                    bonuses: { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "uncommon" }
                },
                {
                    tier: 2,
                    name: "Advanced Laboratory",
                    cost: { engineeringTokens: 10, gold: 5000 },
                    bonuses: { rarityChance: 1.15, craftSpeed: 1.10, parallelSlots: 2, maxRarity: "rare" }
                },
                {
                    tier: 3,
                    name: "Research Laboratory",
                    cost: { engineeringTokens: 25, gold: 15000 },
                    bonuses: { rarityChance: 1.30, craftSpeed: 1.25, parallelSlots: 3, maxRarity: "epic" }
                },
                {
                    tier: 4,
                    name: "Quantum Laboratory",
                    cost: { engineeringTokens: 50, gold: 50000 },
                    bonuses: { rarityChance: 1.50, craftSpeed: 1.50, parallelSlots: 4, maxRarity: "legendary" }
                }
            ]
        },
        smithing: {
            name: "Forge",
            tiers: [
                {
                    tier: 1,
                    name: "Basic Forge",
                    cost: { engineeringTokens: 0, gold: 0 },
                    bonuses: { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "uncommon" }
                },
                {
                    tier: 2,
                    name: "Steel Forge",
                    cost: { engineeringTokens: 10, gold: 5000 },
                    bonuses: { rarityChance: 1.15, craftSpeed: 1.10, parallelSlots: 2, maxRarity: "rare" }
                },
                {
                    tier: 3,
                    name: "Master Forge",
                    cost: { engineeringTokens: 25, gold: 15000 },
                    bonuses: { rarityChance: 1.30, craftSpeed: 1.25, parallelSlots: 3, maxRarity: "epic" }
                },
                {
                    tier: 4,
                    name: "Mythril Forge",
                    cost: { engineeringTokens: 50, gold: 50000 },
                    bonuses: { rarityChance: 1.50, craftSpeed: 1.50, parallelSlots: 4, maxRarity: "legendary" }
                }
            ]
        },
        mechanics: {
            name: "Workshop",
            tiers: [
                {
                    tier: 1,
                    name: "Basic Workshop",
                    cost: { engineeringTokens: 0, gold: 0 },
                    bonuses: { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "uncommon" }
                },
                {
                    tier: 2,
                    name: "Machining Workshop",
                    cost: { engineeringTokens: 10, gold: 5000 },
                    bonuses: { rarityChance: 1.15, craftSpeed: 1.10, parallelSlots: 2, maxRarity: "rare" }
                },
                {
                    tier: 3,
                    name: "Precision Workshop",
                    cost: { engineeringTokens: 25, gold: 15000 },
                    bonuses: { rarityChance: 1.30, craftSpeed: 1.25, parallelSlots: 3, maxRarity: "epic" }
                },
                {
                    tier: 4,
                    name: "Automated Workshop",
                    cost: { engineeringTokens: 50, gold: 50000 },
                    bonuses: { rarityChance: 1.50, craftSpeed: 1.50, parallelSlots: 4, maxRarity: "legendary" }
                }
            ]
        },
        electronics: {
            name: "Tech Bay",
            tiers: [
                {
                    tier: 1,
                    name: "Basic Tech Bay",
                    cost: { engineeringTokens: 0, gold: 0 },
                    bonuses: { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "uncommon" }
                },
                {
                    tier: 2,
                    name: "Advanced Tech Bay",
                    cost: { engineeringTokens: 10, gold: 5000 },
                    bonuses: { rarityChance: 1.15, craftSpeed: 1.10, parallelSlots: 2, maxRarity: "rare" }
                },
                {
                    tier: 3,
                    name: "Nanotech Bay",
                    cost: { engineeringTokens: 25, gold: 15000 },
                    bonuses: { rarityChance: 1.30, craftSpeed: 1.25, parallelSlots: 3, maxRarity: "epic" }
                },
                {
                    tier: 4,
                    name: "Quantum Tech Bay",
                    cost: { engineeringTokens: 50, gold: 50000 },
                    bonuses: { rarityChance: 1.50, craftSpeed: 1.50, parallelSlots: 4, maxRarity: "legendary" }
                }
            ]
        },
        textiles: {
            name: "Tailoring Shop",
            tiers: [
                {
                    tier: 1,
                    name: "Basic Tailoring Shop",
                    cost: { engineeringTokens: 0, gold: 0 },
                    bonuses: { rarityChance: 1.0, craftSpeed: 1.0, parallelSlots: 1, maxRarity: "uncommon" }
                },
                {
                    tier: 2,
                    name: "Professional Tailoring Shop",
                    cost: { engineeringTokens: 10, gold: 5000 },
                    bonuses: { rarityChance: 1.15, craftSpeed: 1.10, parallelSlots: 2, maxRarity: "rare" }
                },
                {
                    tier: 3,
                    name: "Master Tailoring Shop",
                    cost: { engineeringTokens: 25, gold: 15000 },
                    bonuses: { rarityChance: 1.30, craftSpeed: 1.25, parallelSlots: 3, maxRarity: "epic" }
                },
                {
                    tier: 4,
                    name: "Enchanted Tailoring Shop",
                    cost: { engineeringTokens: 50, gold: 50000 },
                    bonuses: { rarityChance: 1.50, craftSpeed: 1.50, parallelSlots: 4, maxRarity: "legendary" }
                }
            ]
        }
    },

    /**
     * Engineering Specialization Paths
     * Players can unlock one path per crafting skill
     */
    ENGINEERING_PATHS: {
        cooking: [
            {
                id: "culinary_master",
                name: "Culinary Master",
                description: "+25% food buff effectiveness, +15% cooking speed",
                cost: { engineeringTokens: 20 },
                bonuses: { buffEffectiveness: 1.25, craftSpeed: 1.15 }
            },
            {
                id: "mass_production",
                name: "Mass Production",
                description: "+2 parallel cooking slots, +10% faster crafting",
                cost: { engineeringTokens: 20 },
                bonuses: { parallelSlots: 2, craftSpeed: 1.10 }
            }
        ],
        chemistry: [
            {
                id: "explosives_expert",
                name: "Explosives Expert",
                description: "+50% explosive damage, +20% ammo output",
                cost: { engineeringTokens: 20 },
                bonuses: { explosiveDamage: 1.50, ammoOutput: 1.20 }
            },
            {
                id: "pharmacist",
                name: "Pharmacist",
                description: "+30% potion effectiveness, longer durations",
                cost: { engineeringTokens: 20 },
                bonuses: { potionPower: 1.30, potionDuration: 1.25 }
            }
        ],
        smithing: [
            {
                id: "weapon_smith",
                name: "Weapon Smith",
                description: "+20% weapon damage when smithing weapons",
                cost: { engineeringTokens: 20 },
                bonuses: { weaponDamageBonus: 1.20 }
            },
            {
                id: "armor_smith",
                name: "Armor Smith",
                description: "+20% armor defense when smithing armor",
                cost: { engineeringTokens: 20 },
                bonuses: { armorDefenseBonus: 1.20 }
            }
        ],
        mechanics: [
            {
                id: "gunsmith",
                name: "Gunsmith",
                description: "+25% ranged weapon damage, +15% accuracy",
                cost: { engineeringTokens: 20 },
                bonuses: { rangedDamageBonus: 1.25, accuracyBonus: 1.15 }
            },
            {
                id: "vehicle_engineer",
                name: "Vehicle Engineer",
                description: "+30% vehicle speed, +20% durability",
                cost: { engineeringTokens: 20 },
                bonuses: { vehicleSpeed: 1.30, vehicleDurability: 1.20 }
            }
        ],
        electronics: [
            {
                id: "energy_weapons",
                name: "Energy Weapons Specialist",
                description: "+30% energy weapon damage, -15% power consumption",
                cost: { engineeringTokens: 20 },
                bonuses: { energyDamageBonus: 1.30, powerEfficiency: 0.85 }
            },
            {
                id: "shield_tech",
                name: "Shield Technician",
                description: "+40% shield capacity, faster recharge",
                cost: { engineeringTokens: 20 },
                bonuses: { shieldCapacity: 1.40, rechargeSpeed: 1.25 }
            }
        ],
        textiles: [
            {
                id: "light_armor",
                name: "Light Armor Specialist",
                description: "+15% defense, +10% movement speed",
                cost: { engineeringTokens: 20 },
                bonuses: { defenseBonus: 1.15, movementSpeed: 1.10 }
            },
            {
                id: "storage_expert",
                name: "Storage Expert",
                description: "+50% bag capacity, +2 equipment slots",
                cost: { engineeringTokens: 20 },
                bonuses: { bagCapacity: 1.50, extraSlots: 2 }
            }
        ]
    },

        // Legacy skill definitions (will be migrated to SkillRegistry)
        // DO NOT ACCESS DIRECTLY - use GameDefinitions.skills instead
        _legacySkills: {
            navigation: {
                name: "Navigation",
                description: "Explore regions and discover new locations",
                // XP formula is now unified across all skills (see gameBalance variables)
                explorationSpeed: 0.1  // Base exploration speed per level (% per second)
            },
            mining: {
                name: "Mining",
                description: "Increases ore gathering efficiency",
                bonusPerLevel: 0.05  // +5% ore per level
            },
            logging: {
                name: "Logging",
                description: "Increases wood gathering efficiency",
                bonusPerLevel: 0.05  // +5% wood per level
            },
            fishing: {
                name: "Fishing",
                description: "Catch fish from lakes, rivers, and streams",
                bonusPerLevel: 0.05  // +5% fishing success per level
            },
            hunting: {
                name: "Hunting",
                description: "Track and hunt animals for meat and materials",
                bonusPerLevel: 0.05  // +5% hunting success per level
            },
            foraging: {
                name: "Foraging",
                description: "Gather mushrooms, herbs, flowers, and plants",
                bonusPerLevel: 0.05  // +5% foraging success per level
            },
            thieving: {
                name: "Thieving",
                description: "Steal valuables from locations and NPCs",
                bonusPerLevel: 0.05  // +5% thieving success per level
            },

            // Crafting Skills - 6 Core Production Skills
            cooking: {
                name: "Cooking",
                description: "Produces food, buffs, healing consumables. Consumes fish, meat, plants, herbs.",
                bonusPerLevel: 0.05,  // +5% buff effectiveness per level
                category: "crafting",
                consumesResources: ["fish", "meat", "plants", "herbs"],
                producesTypes: ["food", "consumable", "buff"]
            },
            chemistry: {
                name: "Chemistry",
                description: "Produces potions, explosives, ammo, processed materials. Consumes herbs, minerals, compounds.",
                bonusPerLevel: 0.04,  // +4% potency per level
                category: "crafting",
                consumesResources: ["herbs", "minerals", "compounds"],
                producesTypes: ["potion", "explosive", "ammo", "material"]
            },
            smithing: {
                name: "Smithing",
                description: "Produces melee weapons, armor plates, metal tools. Consumes ores, alloys, fuel.",
                bonusPerLevel: 0.03,  // +3% crafting quality per level
                category: "crafting",
                consumesResources: ["ore", "alloys", "fuel"],
                producesTypes: ["meleeWeapon", "armor", "tool"],
                equipSlots: ["weapon", "chest", "helmet", "legs"]
            },
            mechanics: {
                name: "Mechanics",
                description: "Produces ranged weapons, vehicles, drones. Consumes metals, parts, fuel.",
                bonusPerLevel: 0.03,  // +3% crafting quality per level
                category: "crafting",
                consumesResources: ["metal", "parts", "fuel"],
                producesTypes: ["rangedWeapon", "vehicle", "drone"],
                equipSlots: ["weapon", "back", "companion"]
            },
            electronics: {
                name: "Electronics",
                description: "Produces energy weapons, shields, augments. Consumes circuits, batteries, rare materials.",
                bonusPerLevel: 0.025,  // +2.5% crafting quality per level
                category: "crafting",
                consumesResources: ["circuits", "batteries", "rareMaterials"],
                producesTypes: ["energyWeapon", "shield", "augment"],
                equipSlots: ["weapon", "neck", "ring"]
            },
            textiles: {
                name: "Textiles",
                description: "Produces cloth armor, bags, cloaks. Consumes fibers, leather, thread.",
                bonusPerLevel: 0.03,  // +3% crafting quality per level
                category: "crafting",
                consumesResources: ["fiber", "leather", "thread"],
                producesTypes: ["clothArmor", "bag", "cloak"],
                equipSlots: ["chest", "back", "gloves", "boots"]
            },

            // Engineering - Vertical Skill (enhances all crafting but doesn't directly craft)
            engineering: {
                name: "Engineering",
                description: "Unlocks workshop upgrades, reverse engineering, and advanced assembly. Enhances all crafting skills.",
                bonusPerLevel: 0.02,  // +2% all crafting effectiveness per level
                category: "vertical",
                enhancesSkills: ["cooking", "chemistry", "smithing", "mechanics", "electronics", "textiles"]
            }
        },

        // Character Level definitions
        characterLevel: {
            name: "Character Level",
            description: "Your overall character level, gained from all activities",
            // XP formula uses separate character scaling (see gameBalance variables)
            attributePointsPerLevel: 1,  // Points awarded per level up
            generalExpRate: 0.1  // 10% of skill XP also goes to character XP
        },

        // Combat Attribute definitions
        combatAttributes: {
            health: {
                name: "Health",
                description: "Increases maximum health points",
                effectPerPoint: 50  // +50 max HP per point (scaled 5x for slower combat)
            },
            defense: {
                name: "Defense",
                description: "Reduces damage taken from attacks",
                effectPerPoint: 0.02  // +2% damage reduction per point
            },
            strength: {
                name: "Strength",
                description: "Increases physical damage dealt",
                effectPerPoint: 2  // +2 attack damage per point
            },
            stealth: {
                name: "Stealth",
                description: "Improves thieving success and enables stealth attacks",
                effectPerPoint: 0.01  // +1% thieving success per point
            },
            perception: {
                name: "Perception",
                description: "Improves accuracy and foraging success rates",
                effectPerPoint: 0.5  // +0.5% accuracy and foraging success per point
            },
            mobility: {
                name: "Mobility",
                description: "Increases attack speed and dodge chance",
                effectPerPoint: 0.02  // +2% attack speed per point
            },
            intellect: {
                name: "Intellect",
                description: "Improves skill learning and magic abilities",
                effectPerPoint: 0.01  // +1% skill exp gain per point (future: magic damage)
            }
        },

        // Damage Type System
        damageTypes: {
            pierce: {
                name: "Pierce",
                icon: "🗡️",
                description: "Piercing damage from sharp weapons",
                color: "#9e9e9e",
                strongAgainst: "insulated",
                weakAgainst: "plated"
            },
            explosive: {
                name: "Explosive",
                icon: "💥",
                description: "Explosive blast damage",
                color: "#ff5722",
                strongAgainst: "plated",
                weakAgainst: "airborne"
            },
            cryo: {
                name: "Cryo",
                icon: "❄️",
                description: "Freezing cold damage",
                color: "#03a9f4",
                strongAgainst: "airborne",
                weakAgainst: "biological"
            },
            shock: {
                name: "Shock",
                icon: "⚡",
                description: "Electrical shock damage",
                color: "#ffeb3b",
                strongAgainst: "droid",
                weakAgainst: "insulated"
            },
            incendiary: {
                name: "Incendiary",
                icon: "🔥",
                description: "Burning fire damage",
                color: "#ff9800",
                strongAgainst: "biological",
                weakAgainst: "droid"
            }
        },

        // Armor Type System
        armorTypes: {
            insulated: {
                name: "Insulated",
                icon: "🛡️",
                description: "Insulated armor, resistant to shock",
                color: "#ffc107",
                strongAgainst: "shock",
                weakAgainst: "pierce"
            },
            plated: {
                name: "Plated",
                icon: "🛡️",
                description: "Heavy plated armor, resistant to piercing",
                color: "#607d8b",
                strongAgainst: "pierce",
                weakAgainst: "explosive"
            },
            airborne: {
                name: "Airborne",
                icon: "🌪️",
                description: "Light, mobile armor, resistant to explosives",
                color: "#2196f3",
                strongAgainst: "explosive",
                weakAgainst: "cryo"
            },
            droid: {
                name: "Droid",
                icon: "🤖",
                description: "Mechanical armor, resistant to fire",
                color: "#9c27b0",
                strongAgainst: "incendiary",
                weakAgainst: "shock"
            },
            biological: {
                name: "Biological",
                icon: "🧬",
                description: "Organic armor, resistant to cold",
                color: "#4caf50",
                strongAgainst: "cryo",
                weakAgainst: "incendiary"
            }
        },

        // Type Effectiveness Multipliers
        typeEffectiveness: {
            strongMultiplier: 1.5,    // 50% more damage
            weakMultiplier: 0.67,     // 33% less damage
            neutralMultiplier: 1.0    // Normal damage
        },

        // Hex Grid World Map (axial coordinates: q, r)
        // Generated procedurally at initialization - see generateWorldMap()
        worldMap: null,

        // OLD worldMap for reference (replaced by generated 20x20 grid)
        _oldWorldMap: {
            // Center starting hex
            "region_0_0": {
                name: "Starting Plains",
                biome: "plains",
                hexCoords: { q: 0, r: 0 },
                navigationRequirement: 0,
                adjacentHexes: [
                    { id: "region_1_0", direction: "E", discovered: false },
                    { id: "region_1_-1", direction: "NE", discovered: false },
                    { id: "region_0_-1", direction: "NW", discovered: false },
                    { id: "region_-1_0", direction: "W", discovered: false },
                    { id: "region_-1_1", direction: "SW", discovered: false },
                    { id: "region_0_1", direction: "SE", discovered: false }
                ]
            },
            // East
            "region_1_0": {
                name: "Verdant Woods",
                biome: "forest",
                hexCoords: { q: 1, r: 0 },
                navigationRequirement: 2,
                adjacentHexes: [
                    { id: "region_2_0", direction: "E", discovered: false },
                    { id: "region_2_-1", direction: "NE", discovered: false },
                    { id: "region_1_-1", direction: "NW", discovered: false },
                    { id: "region_0_0", direction: "W", discovered: false },
                    { id: "region_0_1", direction: "SW", discovered: false },
                    { id: "region_1_1", direction: "SE", discovered: false }
                ]
            },
            // Northeast
            "region_1_-1": {
                name: "Highland Ridge",
                biome: "mountains",
                hexCoords: { q: 1, r: -1 },
                navigationRequirement: 3,
                adjacentHexes: [
                    { id: "region_2_-1", direction: "E", discovered: false },
                    { id: "region_2_-2", direction: "NE", discovered: false },
                    { id: "region_1_-2", direction: "NW", discovered: false },
                    { id: "region_0_-1", direction: "W", discovered: false },
                    { id: "region_0_0", direction: "SW", discovered: false },
                    { id: "region_1_0", direction: "SE", discovered: false }
                ]
            },
            // Northwest
            "region_0_-1": {
                name: "Frozen Tundra",
                biome: "tundra",
                hexCoords: { q: 0, r: -1 },
                navigationRequirement: 4,
                adjacentHexes: [
                    { id: "region_1_-1", direction: "E", discovered: false },
                    { id: "region_1_-2", direction: "NE", discovered: false },
                    { id: "region_0_-2", direction: "NW", discovered: false },
                    { id: "region_-1_-1", direction: "W", discovered: false },
                    { id: "region_-1_0", direction: "SW", discovered: false },
                    { id: "region_0_0", direction: "SE", discovered: false }
                ]
            },
            // West
            "region_-1_0": {
                name: "Arid Wastes",
                biome: "desert",
                hexCoords: { q: -1, r: 0 },
                navigationRequirement: 3,
                adjacentHexes: [
                    { id: "region_0_0", direction: "E", discovered: false },
                    { id: "region_0_-1", direction: "NE", discovered: false },
                    { id: "region_-1_-1", direction: "NW", discovered: false },
                    { id: "region_-2_0", direction: "W", discovered: false },
                    { id: "region_-2_1", direction: "SW", discovered: false },
                    { id: "region_-1_1", direction: "SE", discovered: false }
                ]
            },
            // Southwest
            "region_-1_1": {
                name: "Murky Swamp",
                biome: "swamp",
                hexCoords: { q: -1, r: 1 },
                navigationRequirement: 3,
                adjacentHexes: [
                    { id: "region_0_1", direction: "E", discovered: false },
                    { id: "region_0_0", direction: "NE", discovered: false },
                    { id: "region_-1_0", direction: "NW", discovered: false },
                    { id: "region_-2_1", direction: "W", discovered: false },
                    { id: "region_-2_2", direction: "SW", discovered: false },
                    { id: "region_-1_2", direction: "SE", discovered: false }
                ]
            },
            // Southeast
            "region_0_1": {
                name: "Coastal Shores",
                biome: "coast",
                hexCoords: { q: 0, r: 1 },
                navigationRequirement: 2,
                adjacentHexes: [
                    { id: "region_1_1", direction: "E", discovered: false },
                    { id: "region_1_0", direction: "NE", discovered: false },
                    { id: "region_0_0", direction: "NW", discovered: false },
                    { id: "region_-1_1", direction: "W", discovered: false },
                    { id: "region_-1_2", direction: "SW", discovered: false },
                    { id: "region_0_2", direction: "SE", discovered: false }
                ]
            }
        },

        // Biome definitions (determines what can be discovered in each hex)
        biomes: {
            plains: {
                name: "Plains",
                description: "Open grasslands with basic resources",
                icon: "🌾",
                color: "#7fb069",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock"],
                    logging: ["oakTree", "birchTree"],
                    fishing: ["pond", "stream"],
                    hunting: ["grassland"],
                    foraging: ["flowerPatch", "berryBush"],
                    thieving: ["abandonedCart", "marketStall"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["campfire"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                exitPathChance: 0.15  // 15% chance per discovery to find exit path
            },
            forest: {
                name: "Forest",
                description: "Dense woodland with timber and wildlife",
                icon: "🌲",
                color: "#2d6a4f",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock", "ironVein"],
                    logging: ["oakTree", "birchTree", "pineTree", "mapleTree"],
                    fishing: ["stream", "lake", "river"],
                    hunting: ["woodland", "deepForest"],
                    foraging: ["berryBush", "mushroomLog", "herbGarden"],
                    thieving: ["marketStall", "guardPost"]
                },
                craftingNodes: {
                    forging: ["basicForge", "advancedForge"],
                    machining: ["basicWorkbench", "machineShop"],
                    cooking: ["campfire", "fieldKitchen"],
                    chemistry: ["chemTable", "chemLab"],
                    textiles: ["sewingKit", "tailorShop"],
                    engineering: ["engineeringDesk", "techBench"]
                },
                exitPathChance: 0.12
            },
            mountains: {
                name: "Mountains",
                description: "Rocky peaks rich with ore and minerals",
                icon: "⛰️",
                color: "#8b7355",
                gatheringNodes: {
                    mining: ["ironVein", "coalDeposit", "goldVein", "mithrilDeposit"],
                    logging: ["pineTree", "mapleTree", "ancientTree"],
                    fishing: ["stream", "river", "ocean"],
                    hunting: ["deepForest", "mountainSlope", "ancientWilds"],
                    foraging: ["herbGarden", "mushroomLog", "mysticGrove"],
                    thieving: ["guardPost", "warehouse", "royalVault"]
                },
                craftingNodes: {
                    forging: ["advancedForge", "masterForge"],
                    machining: ["machineShop", "precisionLab"],
                    cooking: ["fieldKitchen", "fullKitchen"],
                    chemistry: ["chemLab", "researchLab"],
                    textiles: ["tailorShop", "fabricMill"],
                    engineering: ["techBench", "innovationCenter"]
                },
                exitPathChance: 0.10
            },
            tundra: {
                name: "Tundra",
                description: "Frozen wasteland with unique cold-climate resources",
                icon: "❄️",
                color: "#cce7ff",
                gatheringNodes: {
                    mining: ["ironVein", "coalDeposit", "mithrilDeposit"],
                    logging: ["pineTree", "ancientTree"],
                    fishing: ["pond", "lake", "stream"],
                    hunting: ["woodland", "mountainSlope"],
                    foraging: ["herbGarden", "mysticGrove"],
                    thieving: ["warehouse", "royalVault"]
                },
                craftingNodes: {
                    forging: ["advancedForge"],
                    machining: ["machineShop"],
                    cooking: ["fieldKitchen"],
                    chemistry: ["chemLab"],
                    textiles: ["tailorShop"],
                    engineering: ["techBench"]
                },
                exitPathChance: 0.10
            },
            desert: {
                name: "Desert",
                description: "Arid landscape with scarce but valuable resources",
                icon: "🏜️",
                color: "#f4a261",
                gatheringNodes: {
                    mining: ["goldVein", "mithrilDeposit"],
                    logging: [],
                    fishing: [],
                    hunting: ["grassland", "mountainSlope"],
                    foraging: ["flowerPatch"],
                    thieving: ["warehouse", "royalVault"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["machineShop"],
                    cooking: ["campfire"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["techBench"]
                },
                exitPathChance: 0.08
            },
            swamp: {
                name: "Swamp",
                description: "Murky wetlands with poisonous plants and hidden treasures",
                icon: "🐊",
                color: "#52796f",
                gatheringNodes: {
                    mining: ["copperVein"],
                    logging: ["oakTree", "birchTree"],
                    fishing: ["pond", "lake"],
                    hunting: ["woodland", "deepForest"],
                    foraging: ["mushroomLog", "herbGarden", "berryBush"],
                    thieving: ["abandonedCart", "guardPost"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["fieldKitchen"],
                    chemistry: ["chemLab"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                exitPathChance: 0.10
            },
            coast: {
                name: "Coast",
                description: "Shoreline with abundant fish and maritime resources",
                icon: "🌊",
                color: "#4a90e2",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock"],
                    logging: ["oakTree", "birchTree"],
                    fishing: ["pond", "stream", "lake", "ocean"],
                    hunting: ["grassland", "woodland"],
                    foraging: ["flowerPatch", "berryBush"],
                    thieving: ["marketStall", "guardPost"]
                },
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["campfire", "fieldKitchen"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                exitPathChance: 0.12
            }
        },

        // Region definitions (legacy - will be phased out in favor of worldMap)
        regions: {
            startingPlains: {
                name: "Starting Plains",
                description: "A peaceful grassland with basic resources",
                // Discoverable gathering nodes (references to resourceNodes)
                gatheringNodes: {
                    mining: ["copperVein", "tinRock"],
                    logging: ["oakTree", "birchTree"],
                    fishing: ["pond", "stream"],
                    hunting: ["grassland"],
                    foraging: ["flowerPatch", "berryBush"],
                    thieving: ["abandonedCart", "marketStall"]
                },
                // Discoverable crafting stations (references to craftingNodes)
                craftingNodes: {
                    forging: ["basicForge"],
                    machining: ["basicWorkbench"],
                    cooking: ["campfire"],
                    chemistry: ["chemTable"],
                    textiles: ["sewingKit"],
                    engineering: ["engineeringDesk"]
                },
                // Special locations to discover
                locations: [
                    { id: "abandonedCamp", name: "Abandoned Camp", reward: { gold: 50 } },
                    { id: "oldShrine", name: "Old Shrine", reward: { navigation: 20 } }
                ],
                // Fog of war settings
                baseFogAmount: 100,  // Starting fog %
                navigationRequirement: 0  // Min navigation level to explore
            },
            darkForest: {
                name: "Dark Forest",
                description: "A dense forest rich with timber and ore deposits",
                gatheringNodes: {
                    mining: ["copperVein", "tinRock", "ironVein", "coalDeposit"],
                    logging: ["oakTree", "birchTree", "pineTree", "mapleTree"],
                    fishing: ["stream", "lake", "river"],
                    hunting: ["woodland", "deepForest"],
                    foraging: ["berryBush", "mushroomLog", "herbGarden"],
                    thieving: ["marketStall", "guardPost", "warehouse"]
                },
                craftingNodes: {
                    forging: ["basicForge", "advancedForge"],
                    machining: ["basicWorkbench", "machineShop"],
                    cooking: ["campfire", "fieldKitchen"],
                    chemistry: ["chemTable", "chemLab"],
                    textiles: ["sewingKit", "tailorShop"],
                    engineering: ["engineeringDesk", "techBench"]
                },
                locations: [
                    { id: "huntersCabin", name: "Hunter's Cabin", reward: { wood: 100 } },
                    { id: "hiddenCave", name: "Hidden Cave", reward: { ore: 50 } }
                ],
                baseFogAmount: 100,
                navigationRequirement: 3,
                unlockRequirement: { navigation: 2 }
            },
            mountainPass: {
                name: "Mountain Pass",
                description: "Rocky terrain with abundant ore and precious metals",
                gatheringNodes: {
                    mining: ["ironVein", "coalDeposit", "goldVein", "mithrilDeposit"],
                    logging: ["pineTree", "mapleTree", "ancientTree"],
                    fishing: ["stream", "river", "ocean"],
                    hunting: ["deepForest", "mountainSlope", "ancientWilds"],
                    foraging: ["herbGarden", "mushroomLog", "mysticGrove"],
                    thieving: ["warehouse", "guardPost", "royalVault"]
                },
                craftingNodes: {
                    forging: ["advancedForge", "masterForge"],
                    machining: ["machineShop", "precisionLab"],
                    cooking: ["fieldKitchen", "fullKitchen"],
                    chemistry: ["chemLab", "researchLab"],
                    textiles: ["tailorShop", "fabricMill"],
                    engineering: ["techBench", "innovationCenter"]
                },
                locations: [
                    { id: "dwarvenOutpost", name: "Dwarven Outpost", reward: { gold: 200, ore: 100 } },
                    { id: "peakShrine", name: "Peak Shrine", reward: { mining: 50 } }
                ],
                baseFogAmount: 100,
                navigationRequirement: 5,
                unlockRequirement: { navigation: 5, mining: 3 }
            }
        },

        // Legacy item definitions (will be migrated to ItemRegistry)
        // DO NOT ACCESS DIRECTLY - use GameDefinitions.items instead
        _legacyItems: {
            // Resources
            gold: {
                name: "Gold Coins",
                description: "Shiny gold coins used for trading",
                image: "💰",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "currency"
            },
            ore: {
                name: "Iron Ore",
                description: "Raw iron ore from the mines",
                image: "⛏️",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "material"
            },
            wood: {
                name: "Wood Logs",
                description: "Sturdy logs from trees",
                image: "🪵",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "material"
            },
            pinewood: {
                name: "Pinewood",
                description: "Soft pine logs from young pine trees. Basic fuel for campfires and navigation.",
                image: "🪵",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "resource",
                itemType: "resource",
                category: "material",
                resourceType: "wood",
                gatherSkill: "woodcutting",
                gatherLevel: 1,
                value: 2,
                tags: ['material', 'wood', 'logs', 'pine', 'woodcutting', 'fuel', 'navigation']
            },
            lightRations: {
                name: "Light Rations",
                description: "Simple preserved food rations. Restores 10 HP and used for navigation rest.",
                image: "🍖",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "consumable",
                itemType: "consumable",
                category: "consumable",
                equipSlot: "food",
                slot: "food",
                effectType: "heal",
                effectValue: 10,
                cooldown: 500,
                resourceType: "food",
                value: 5,
                tags: ['consumable', 'food', 'rations', 'healing', 'navigation']
            },
            stone: {
                name: "Stone",
                description: "Hard stone from quarries",
                image: "🪨",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "material"
            },
            copperOre: {
                name: "Copper Ore",
                description: "Raw copper ore, useful for crafting",
                image: "🟠",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            tinOre: {
                name: "Tin Ore",
                description: "Silvery tin ore",
                image: "⚪",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            coal: {
                name: "Coal",
                description: "Black coal for fuel",
                image: "⚫",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            silverOre: {
                name: "Silver Ore",
                description: "Shiny silver ore",
                image: "⚪",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            goldOre: {
                name: "Gold Ore",
                description: "Precious gold ore",
                image: "🟡",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "ore"
            },
            // Equipment - Tools (Pickaxes)
            stone_pickaxe: {
                name: "Stone Pickaxe",
                description: "A crude pickaxe made from stone. Better than nothing.",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 3,
                    attackDamage: 2,
                    weight: 5,
                    damageType: "pierce"
                }
            },
            bronzePickaxe: {
                name: "Bronze Pickaxe",
                description: "A basic mining pickaxe",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 5,
                    attackDamage: 3,
                    weight: 6,
                    damageType: "pierce"
                }
            },
            ironPickaxe: {
                name: "Iron Pickaxe",
                description: "A sturdy iron pickaxe",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 10,
                    attackDamage: 5,
                    weight: 7,
                    damageType: "pierce"
                }
            },
            steelPickaxe: {
                name: "Steel Pickaxe",
                description: "A strong steel pickaxe",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 20,
                    attackDamage: 8,
                    weight: 8,
                    damageType: "pierce"
                }
            },
            mithrilPickaxe: {
                name: "Mithril Pickaxe",
                description: "A legendary pickaxe made from mithril",
                image: "⛏️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    pickaxeDamage: 40,
                    attackDamage: 12,
                    weight: 9,
                    damageType: "pierce"
                }
            },
            // Equipment - Tools (Axes)
            stone_hatchet: {
                name: "Stone Hatchet",
                description: "A crude hatchet with a stone head. Useful for chopping wood.",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 3,
                    attackDamage: 2,
                    weight: 5,
                    damageType: "incendiary"
                }
            },
            bronzeAxe: {
                name: "Bronze Axe",
                description: "A basic woodcutting axe",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 5,
                    attackDamage: 4,
                    weight: 6,
                    damageType: "incendiary"
                }
            },
            ironAxe: {
                name: "Iron Axe",
                description: "A sturdy iron axe",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 10,
                    attackDamage: 7,
                    weight: 7,
                    damageType: "incendiary"
                }
            },
            steelAxe: {
                name: "Steel Axe",
                description: "A sharp steel axe",
                image: "🪓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    chopDamage: 20,
                    attackDamage: 12,
                    weight: 8,
                    damageType: "incendiary"
                }
            },
            // Equipment - Tools (Fishing Rods)
            fishing_net: {
                name: "Fishing Net",
                description: "A simple net for catching fish. Not very efficient but it works.",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 3,
                    weight: 4,
                    damageType: "pierce"
                }
            },
            bambooPole: {
                name: "Bamboo Fishing Pole",
                description: "A simple fishing pole",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 5,
                    weight: 5,
                    damageType: "pierce"
                }
            },
            basicRod: {
                name: "Basic Fishing Rod",
                description: "A standard fishing rod",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 10,
                    weight: 5,
                    damageType: "pierce"
                }
            },
            carbonRod: {
                name: "Carbon Fiber Rod",
                description: "A modern, flexible fishing rod",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 20,
                    weight: 5,
                    damageType: "pierce"
                }
            },
            masterRod: {
                name: "Master's Fishing Rod",
                description: "A legendary fishing rod",
                image: "🎣",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    fishingPower: 40,
                    weight: 5,
                    damageType: "pierce"
                }
            },
            // Equipment - Tools (Bows)
            shortBow: {
                name: "Short Bow",
                description: "A basic hunting bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 5,
                    attackDamage: 8,
                    weight: 6,
                    damageType: "pierce"
                }
            },
            longBow: {
                name: "Long Bow",
                description: "A sturdy long bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 10,
                    attackDamage: 14,
                    weight: 8,
                    damageType: "pierce"
                }
            },
            compositeBow: {
                name: "Composite Bow",
                description: "A powerful composite bow",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 20,
                    attackDamage: 22,
                    weight: 9,
                    damageType: "pierce"
                }
            },
            legendaryBow: {
                name: "Legendary Hunter's Bow",
                description: "A bow fit for the greatest hunters",
                image: "🏹",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    huntingPower: 40,
                    attackDamage: 35,
                    weight: 9,
                    damageType: "pierce"
                }
            },
            // Fish Resources
            minnow: {
                name: "Minnow",
                description: "A tiny fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            trout: {
                name: "Trout",
                description: "A common freshwater fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            bass: {
                name: "Bass",
                description: "A popular game fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            salmon: {
                name: "Salmon",
                description: "A prized fish known for swimming upstream",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            pike: {
                name: "Pike",
                description: "A fierce predatory fish",
                image: "🐟",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            goldfish: {
                name: "Golden Fish",
                description: "A rare, shimmering fish",
                image: "🐠",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fish"
            },
            // Hunting Resources
            rawMeat: {
                name: "Raw Meat",
                description: "Freshly hunted meat",
                image: "🥩",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "meat"
            },
            hide: {
                name: "Animal Hide",
                description: "Leather for crafting",
                image: "🦌",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "hide"
            },
            feather: {
                name: "Feather",
                description: "Bird feathers for crafting arrows",
                image: "🪶",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "feather"
            },
            bone: {
                name: "Bone",
                description: "Animal bones for crafting",
                image: "🦴",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "bone"
            },
            fang: {
                name: "Beast Fang",
                description: "Sharp fang from a predator",
                image: "🦷",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "fang"
            },
            pelt: {
                name: "Rare Pelt",
                description: "A valuable animal pelt",
                image: "🦊",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "pelt"
            },
            // Foraging Resources
            mushroom: {
                name: "Mushroom",
                description: "Edible fungi from the forest",
                image: "🍄",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            herb: {
                name: "Herb",
                description: "Medicinal plant",
                image: "🌿",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            flower: {
                name: "Flower",
                description: "Colorful wildflower",
                image: "🌸",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            berries: {
                name: "Berries",
                description: "Sweet wild berries",
                image: "🫐",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            root: {
                name: "Root",
                description: "Edible plant root",
                image: "🥕",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            seed: {
                name: "Seeds",
                description: "Plant seeds for farming",
                image: "🌱",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "forage"
            },
            // Thieving Resources
            coinPouch: {
                name: "Coin Pouch",
                description: "Stolen money",
                image: "💰",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            jewelry: {
                name: "Jewelry",
                description: "Valuable trinkets",
                image: "💎",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            computerPart: {
                name: "Computer Part",
                description: "Electronic component",
                image: "🖥️",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            wire: {
                name: "Wire",
                description: "Copper wiring",
                image: "📎",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            scrap: {
                name: "Metal Scrap",
                description: "Salvaged metal",
                image: "🔩",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            keycard: {
                name: "Keycard",
                description: "Access card",
                image: "🎫",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "stolen"
            },
            // Equipment - Tools (Foraging)
            wickerBasket: {
                name: "Wicker Basket",
                description: "A simple foraging basket",
                image: "🧺",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 5,
                    weight: 3,
                    damageType: "pierce"
                }
            },
            gatherersSatchel: {
                name: "Gatherer's Satchel",
                description: "A sturdy satchel for foraging",
                image: "🎒",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 10,
                    weight: 3,
                    damageType: "pierce"
                }
            },
            herbalistKit: {
                name: "Herbalist's Kit",
                description: "Professional foraging tools",
                image: "🧰",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 20,
                    weight: 4,
                    damageType: "pierce"
                }
            },
            masterGatherer: {
                name: "Master Gatherer's Set",
                description: "Expert foraging equipment",
                image: "🎒",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    foragingPower: 40,
                    weight: 4,
                    damageType: "pierce"
                }
            },
            // Equipment - Tools (Thieving)
            lockpick: {
                name: "Lockpick Set",
                description: "Basic lockpicking tools",
                image: "🔓",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 5,
                    weight: 2,
                    damageType: "pierce"
                }
            },
            crowbar: {
                name: "Crowbar",
                description: "For breaking and entering",
                image: "🔨",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 10,
                    weight: 7,
                    damageType: "pierce"
                }
            },
            advancedLockpick: {
                name: "Advanced Lockpick Set",
                description: "Professional thieving tools",
                image: "🔐",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 20,
                    weight: 2,
                    damageType: "pierce"
                }
            },
            masterThiefKit: {
                name: "Master Thief's Kit",
                description: "The best tools for stealing",
                image: "🎭",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "tool",
                equipSlot: "weapon",
                stats: {
                    thievingPower: 40,
                    weight: 3,
                    damageType: "pierce"
                }
            },

            // ========================================
            // Equipment - Shields
            woodenShield: {
                name: "Wooden Shield",
                description: "A simple wooden shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "shield",
                equipSlot: "shield",
                stats: {
                    maxHealth: 15,
                    accuracy: -3,
                    weight: 6
                }
            },
            ironShield: {
                name: "Iron Shield",
                description: "A sturdy iron shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "shield",
                equipSlot: "shield",
                stats: {
                    maxHealth: 30,
                    accuracy: -5,
                    attackSpeed: -0.1,
                    weight: 10
                }
            },
            // Equipment - Helmets
            clothHood: {
                name: "Cloth Hood",
                description: "A simple cloth covering",
                image: "🧢",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "helmet",
                equipSlot: "helmet",
                stats: {
                    maxHealth: 5,
                    accuracy: 1,
                    weight: 5,
                    armorRatings: {
                        insulated: 50,
                        plated: 5,
                        airborne: 20,
                        droid: 10,
                        biological: 15
                    }
                }
            },
            leatherHelmet: {
                name: "Leather Helmet",
                description: "Basic head protection",
                image: "🪖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "helmet",
                equipSlot: "helmet",
                stats: {
                    maxHealth: 12,
                    accuracy: 2,
                    weight: 6,
                    armorRatings: {
                        insulated: 30,
                        plated: 15,
                        airborne: 20,
                        droid: 10,
                        biological: 25
                    }
                }
            },
            ironHelmet: {
                name: "Iron Helmet",
                description: "Heavy metal helmet",
                image: "⛑️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "helmet",
                equipSlot: "helmet",
                stats: {
                    maxHealth: 20,
                    attackSpeed: -0.05,
                    weight: 9,
                    armorRatings: {
                        insulated: 10,
                        plated: 50,
                        airborne: 15,
                        droid: 10,
                        biological: 15
                    }
                }
            },
            // Equipment - Chest Armor
            huntingJacket: {
                name: "Hunting Jacket",
                description: "A sturdy leather hunting jacket",
                image: "🧥",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 25,
                    accuracy: 3,
                    weight: 10,
                    armorRatings: {
                        insulated: 30,
                        plated: 15,
                        airborne: 25,
                        droid: 8,
                        biological: 22
                    }
                }
            },
            leatherArmor: {
                name: "Leather Armor",
                description: "Basic leather protection",
                image: "🦺",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 35,
                    attackSpeed: -0.05,
                    weight: 12,
                    armorRatings: {
                        insulated: 32,
                        plated: 18,
                        airborne: 22,
                        droid: 10,
                        biological: 18
                    }
                }
            },
            chainmail: {
                name: "Chainmail Armor",
                description: "Interlocking metal rings",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 50,
                    attackSpeed: -0.15,
                    weight: 18,
                    armorRatings: {
                        insulated: 15,
                        plated: 48,
                        airborne: 18,
                        droid: 12,
                        biological: 7
                    }
                }
            },
            ironArmor: {
                name: "Iron Plate Armor",
                description: "Heavy iron plating",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "chest",
                equipSlot: "chest",
                stats: {
                    maxHealth: 70,
                    attackSpeed: -0.25,
                    accuracy: -5,
                    weight: 22,
                    armorRatings: {
                        insulated: 8,
                        plated: 60,
                        airborne: 15,
                        droid: 10,
                        biological: 7
                    }
                }
            },
            // Equipment - Legs
            clothPants: {
                name: "Cloth Pants",
                description: "Basic cloth leg protection",
                image: "👖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "legs",
                equipSlot: "legs",
                stats: {
                    maxHealth: 8,
                    weight: 8,
                    armorRatings: {
                        insulated: 45,
                        plated: 8,
                        airborne: 20,
                        droid: 10,
                        biological: 17
                    }
                }
            },
            leatherPants: {
                name: "Leather Pants",
                description: "Reinforced leather leggings",
                image: "👖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "legs",
                equipSlot: "legs",
                stats: {
                    maxHealth: 18,
                    attackSpeed: -0.02,
                    weight: 10,
                    armorRatings: {
                        insulated: 28,
                        plated: 18,
                        airborne: 22,
                        droid: 10,
                        biological: 22
                    }
                }
            },
            ironGreaves: {
                name: "Iron Greaves",
                description: "Heavy metal leg armor",
                image: "🦿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "legs",
                equipSlot: "legs",
                stats: {
                    maxHealth: 30,
                    attackSpeed: -0.1,
                    weight: 13,
                    armorRatings: {
                        insulated: 10,
                        plated: 52,
                        airborne: 18,
                        droid: 12,
                        biological: 8
                    }
                }
            },
            // Equipment - Neck
            bronzeAmulet: {
                name: "Bronze Amulet",
                description: "A simple bronze pendant",
                image: "📿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "neck",
                equipSlot: "neck",
                stats: {
                    maxHealth: 10,
                    attackDamage: 2,
                    weight: 2,
                    armorRatings: {
                        insulated: 15,
                        plated: 20,
                        airborne: 15,
                        droid: 30,
                        biological: 20
                    }
                }
            },
            silverNecklace: {
                name: "Silver Necklace",
                description: "An elegant silver chain",
                image: "📿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "neck",
                equipSlot: "neck",
                stats: {
                    maxHealth: 15,
                    accuracy: 5,
                    weight: 2,
                    armorRatings: {
                        insulated: 18,
                        plated: 22,
                        airborne: 18,
                        droid: 25,
                        biological: 17
                    }
                }
            },
            // Equipment - Ring
            copperRing: {
                name: "Copper Ring",
                description: "A basic copper band",
                image: "💍",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "ring",
                equipSlot: "ring",
                stats: {
                    attackDamage: 3,
                    accuracy: 2,
                    weight: 1,
                    armorRatings: {
                        insulated: 12,
                        plated: 25,
                        airborne: 15,
                        droid: 28,
                        biological: 20
                    }
                }
            },
            silverRing: {
                name: "Silver Ring",
                description: "A polished silver ring",
                image: "💍",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "ring",
                equipSlot: "ring",
                stats: {
                    attackDamage: 5,
                    attackSpeed: 0.05,
                    accuracy: 3,
                    weight: 1,
                    armorRatings: {
                        insulated: 15,
                        plated: 20,
                        airborne: 18,
                        droid: 30,
                        biological: 17
                    }
                }
            },
            // Equipment - Back
            travelersCloak: {
                name: "Traveler's Cloak",
                description: "A worn but sturdy cloak",
                image: "🧥",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "back",
                equipSlot: "back",
                stats: {
                    maxHealth: 12,
                    attackSpeed: 0.05,
                    weight: 4,
                    armorRatings: {
                        insulated: 25,
                        plated: 10,
                        airborne: 50,
                        droid: 8,
                        biological: 7
                    }
                }
            },
            woovenCape: {
                name: "Wooven Cape",
                description: "A finely crafted cape",
                image: "🦸",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "equipment",
                category: "back",
                equipSlot: "back",
                stats: {
                    maxHealth: 20,
                    accuracy: 5,
                    weight: 4,
                    armorRatings: {
                        insulated: 28,
                        plated: 8,
                        airborne: 55,
                        droid: 6,
                        biological: 3
                    }
                }
            },
            // Consumables
            healthPotion: {
                name: "Health Potion",
                description: "Restores 50 health",
                image: "🧪",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "consumables",
                category: "potion"
            },
            bread: {
                name: "Bread",
                description: "Basic food item - Auto-consumed in combat for quick healing",
                image: "🍞",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "consumable",
                equipSlot: "food",
                category: "food",
                value: 5,
                healAmount: 30,
                consumeTime: 1500
            },

            // =============================================================================
            // MODERN LOW-LEVEL ITEMS (Levels 1-5) - Comprehensive Item System
            // =============================================================================

            // RESOURCES
            scrap_metal: {
                name: "Scrap Metal",
                description: "Salvaged metal scraps from discarded machinery",
                image: "🔩",
                stackLimit: 500,
                devLimit: Infinity,
                defaultTab: "resource",
                itemType: "resource",
                category: "material",
                value: 2
            },
            plastic_bits: {
                name: "Plastic Fragments",
                description: "Broken pieces of plastic from various sources",
                image: "🧩",
                stackLimit: 500,
                devLimit: Infinity,
                defaultTab: "resource",
                itemType: "resource",
                category: "material",
                value: 1
            },
            wire_scraps: {
                name: "Wire Scraps",
                description: "Salvaged copper wire pieces",
                image: "📎",
                stackLimit: 500,
                devLimit: Infinity,
                defaultTab: "resource",
                itemType: "resource",
                category: "material",
                value: 3
            },

            // TOOLS
            basic_wrench: {
                name: "Adjustable Wrench",
                description: "Basic wrench for mechanical work",
                image: "🔧",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                itemType: "tool",
                category: "tool",
                value: 15
            },
            plastic_hammer: {
                name: "Plastic Hammer",
                description: "Lightweight hammer made of durable plastic",
                image: "🔨",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                itemType: "tool",
                category: "tool",
                value: 12
            },
            wire_cutters: {
                name: "Wire Cutters",
                description: "Simple tool for cutting wire",
                image: "✂️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                itemType: "tool",
                category: "tool",
                value: 18
            },

            // ARMOR
            leather_jacket: {
                name: "Worn Leather Jacket",
                description: "Provides basic protection",
                image: "🧥",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                itemType: "armor",
                category: "armor",
                equipSlot: "chest",
                value: 30,
                stats: {
                    maxHealth: 8,
                    defense: 8,
                    weight: 10,
                    armorRatings: {
                        insulated: 28,
                        plated: 20,
                        airborne: 24,
                        droid: 10,
                        biological: 18
                    }
                }
            },
            work_boots: {
                name: "Steel-Toed Work Boots",
                description: "Durable boots for protection",
                image: "🥾",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                itemType: "armor",
                category: "armor",
                equipSlot: "feet",
                value: 20,
                stats: {
                    maxHealth: 5,
                    defense: 5,
                    weight: 6,
                    armorRatings: {
                        insulated: 15,
                        plated: 45,
                        airborne: 22,
                        droid: 10,
                        biological: 8
                    }
                }
            },
            safety_goggles: {
                name: "Safety Goggles",
                description: "Protects eyes from debris",
                image: "🥽",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                itemType: "armor",
                category: "armor",
                equipSlot: "head",
                value: 15,
                stats: {
                    maxHealth: 3,
                    defense: 3,
                    weight: 3,
                    armorRatings: {
                        insulated: 20,
                        plated: 30,
                        airborne: 25,
                        droid: 15,
                        biological: 10
                    }
                }
            },

            // TECHNOLOGY
            flashlight: {
                name: "LED Flashlight",
                description: "Portable light source",
                image: "🔦",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "technology",
                itemType: "technology",
                category: "tool",
                value: 25
            },
            battery_pack: {
                name: "Battery Pack",
                description: "Rechargeable power source",
                image: "🔋",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "technology",
                itemType: "technology",
                category: "consumable",
                value: 15
            },
            radio_receiver: {
                name: "Portable Radio",
                description: "Basic communication device",
                image: "📻",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "technology",
                itemType: "technology",
                category: "tool",
                value: 40
            },

            // HEALING
            first_aid_kit: {
                name: "Basic First Aid Kit",
                description: "Emergency medical supplies",
                image: "🩹",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "healing",
                itemType: "healing",
                category: "consumable",
                value: 25
            },
            bandage_roll: {
                name: "Bandage Roll",
                description: "Medical bandages for wounds",
                image: "🏥",
                stackLimit: 20,
                devLimit: Infinity,
                defaultTab: "healing",
                itemType: "healing",
                category: "consumable",
                value: 10
            },
            pain_killers: {
                name: "Pain Killers",
                description: "Reduces pain and provides minor healing",
                image: "💊",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "healing",
                itemType: "healing",
                category: "consumable",
                value: 15
            },

            // CONSUMABLES
            energy_drink: {
                name: "Energy Drink",
                description: "Caffeinated beverage that increases speed",
                image: "🥤",
                stackLimit: 20,
                devLimit: Infinity,
                defaultTab: "consumable",
                itemType: "consumable",
                category: "food",
                value: 8
            },
            protein_bar: {
                name: "Protein Bar",
                description: "Nutritious snack for stamina",
                image: "🍫",
                stackLimit: 20,
                devLimit: Infinity,
                defaultTab: "consumable",
                itemType: "consumable",
                category: "food",
                value: 5
            },
            water_bottle: {
                name: "Water Bottle",
                description: "Clean drinking water",
                image: "💧",
                stackLimit: 15,
                devLimit: Infinity,
                defaultTab: "consumable",
                itemType: "consumable",
                category: "food",
                value: 3
            },

            // QUEST ITEMS
            old_photo: {
                name: "Faded Photograph",
                description: "An old photo with mysterious figures",
                image: "📷",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                itemType: "quest",
                category: "quest",
                value: 0
            },
            keycard_red: {
                name: "Red Security Keycard",
                description: "Grants access to restricted areas",
                image: "🔴",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                itemType: "quest",
                category: "quest",
                value: 0
            },
            broken_phone: {
                name: "Broken Smartphone",
                description: "Damaged phone that may contain data",
                image: "📱",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                itemType: "quest",
                category: "quest",
                value: 0
            },

            // =============================================================================
            // ADDITIONAL TEST ITEMS - Multiple choices for each category
            // =============================================================================

            // MORE RESOURCES - Gems & Rare Materials
            ruby: {
                name: "Ruby",
                description: "A brilliant red gemstone",
                image: "💎",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "gem",
                value: 100
            },
            sapphire: {
                name: "Sapphire",
                description: "A deep blue precious gem",
                image: "💠",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "gem",
                value: 120
            },
            emerald: {
                name: "Emerald",
                description: "A vibrant green gemstone",
                image: "💚",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "gem",
                value: 110
            },
            diamond: {
                name: "Diamond",
                description: "The hardest and most valuable gem",
                image: "💎",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "gem",
                value: 500
            },
            herbs_common: {
                name: "Common Herbs",
                description: "Basic medicinal plants",
                image: "🌿",
                stackLimit: 200,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "herb",
                value: 5
            },
            herbs_rare: {
                name: "Rare Herbs",
                description: "Potent medicinal plants",
                image: "🍀",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "herb",
                value: 25
            },
            mushroom_red: {
                name: "Red Mushroom",
                description: "Poisonous but useful for alchemy",
                image: "🍄",
                stackLimit: 150,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "mushroom",
                value: 15
            },
            crystal_shard: {
                name: "Crystal Shard",
                description: "Magical crystal fragment",
                image: "🔮",
                stackLimit: 80,
                devLimit: Infinity,
                defaultTab: "resource",
                category: "magic",
                value: 150
            },

            // MORE TOOLS - Various types
            shovel_basic: {
                name: "Basic Shovel",
                description: "Simple digging tool",
                image: "🚜",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                value: 20,
                stats: {
                    digPower: 5,
                    weight: 7,
                    damageType: "pierce"
                }
            },
            sickle_iron: {
                name: "Iron Sickle",
                description: "For harvesting crops",
                image: "🔪",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                value: 25,
                stats: {
                    harvestSpeed: 10,
                    weight: 5,
                    damageType: "pierce"
                }
            },
            knife_hunting: {
                name: "Hunting Knife",
                description: "Multipurpose survival knife",
                image: "🔪",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "tool",
                category: "tool",
                equipSlot: "weapon",
                value: 30,
                stats: {
                    attackDamage: 6,
                    skinningBonus: 5,
                    weight: 4,
                    damageType: "pierce"
                }
            },

            // MORE ARMOR - Helmets
            helmet_bronze: {
                name: "Bronze Helmet",
                description: "Basic bronze head protection",
                image: "⛑️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "helmet",
                equipSlot: "helmet",
                value: 30,
                stats: {
                    maxHealth: 15,
                    defense: 3,
                    weight: 7,
                    armorRatings: {
                        insulated: 12,
                        plated: 45,
                        airborne: 18,
                        droid: 10,
                        biological: 15
                    }
                }
            },
            helmet_steel: {
                name: "Steel Helmet",
                description: "Strong steel helmet",
                image: "⛑️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "helmet",
                equipSlot: "helmet",
                value: 60,
                stats: {
                    maxHealth: 25,
                    defense: 6,
                    weight: 10,
                    armorRatings: {
                        insulated: 8,
                        plated: 55,
                        airborne: 15,
                        droid: 12,
                        biological: 10
                    }
                }
            },
            helmet_knight: {
                name: "Knight's Helm",
                description: "Full face protection",
                image: "⛑️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "helmet",
                equipSlot: "helmet",
                value: 120,
                stats: {
                    maxHealth: 35,
                    defense: 10,
                    weight: 12,
                    armorRatings: {
                        insulated: 5,
                        plated: 65,
                        airborne: 12,
                        droid: 10,
                        biological: 8
                    }
                }
            },

            // MORE ARMOR - Chest
            tunic_leather: {
                name: "Leather Tunic",
                description: "Basic leather chest protection",
                image: "👕",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "chest",
                equipSlot: "chest",
                value: 40,
                stats: {
                    maxHealth: 20,
                    defense: 5,
                    weight: 11,
                    armorRatings: {
                        insulated: 30,
                        plated: 18,
                        airborne: 24,
                        droid: 10,
                        biological: 18
                    }
                }
            },
            chainmail: {
                name: "Chainmail Armor",
                description: "Interlocking metal rings",
                image: "👔",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "chest",
                equipSlot: "chest",
                value: 100,
                stats: {
                    maxHealth: 40,
                    defense: 12,
                    attackSpeed: -0.1,
                    weight: 18,
                    armorRatings: {
                        insulated: 15,
                        plated: 48,
                        airborne: 18,
                        droid: 12,
                        biological: 7
                    }
                }
            },
            plate_armor: {
                name: "Plate Armor",
                description: "Heavy full plate protection",
                image: "🦺",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "chest",
                equipSlot: "chest",
                value: 200,
                stats: {
                    maxHealth: 60,
                    defense: 20,
                    attackSpeed: -0.2,
                    weight: 22,
                    armorRatings: {
                        insulated: 5,
                        plated: 70,
                        airborne: 10,
                        droid: 8,
                        biological: 7
                    }
                }
            },
            robe_mage: {
                name: "Mage Robes",
                description: "Enchanted cloth robes",
                image: "🧥",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "chest",
                equipSlot: "chest",
                value: 150,
                stats: {
                    maxHealth: 15,
                    defense: 3,
                    magicPower: 15,
                    weight: 8,
                    armorRatings: {
                        insulated: 45,
                        plated: 8,
                        airborne: 22,
                        droid: 10,
                        biological: 15
                    }
                }
            },

            // MORE ARMOR - Legs
            pants_leather: {
                name: "Leather Pants",
                description: "Flexible leg protection",
                image: "👖",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "legs",
                equipSlot: "legs",
                value: 35,
                stats: {
                    maxHealth: 15,
                    defense: 4,
                    weight: 10,
                    armorRatings: {
                        insulated: 28,
                        plated: 18,
                        airborne: 22,
                        droid: 10,
                        biological: 22
                    }
                }
            },
            greaves_iron: {
                name: "Iron Greaves",
                description: "Metal leg armor",
                image: "🦿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "legs",
                equipSlot: "legs",
                value: 80,
                stats: {
                    maxHealth: 30,
                    defense: 10,
                    weight: 13,
                    armorRatings: {
                        insulated: 10,
                        plated: 52,
                        airborne: 18,
                        droid: 12,
                        biological: 8
                    }
                }
            },
            leggings_plate: {
                name: "Plate Leggings",
                description: "Heavy plate leg armor",
                image: "🦿",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "legs",
                equipSlot: "legs",
                value: 150,
                stats: {
                    maxHealth: 45,
                    defense: 15,
                    weight: 14,
                    armorRatings: {
                        insulated: 8,
                        plated: 60,
                        airborne: 15,
                        droid: 10,
                        biological: 7
                    }
                }
            },

            // MORE ARMOR - Gloves
            gloves_cloth: {
                name: "Cloth Gloves",
                description: "Simple hand wraps",
                image: "🧤",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "gloves",
                equipSlot: "gloves",
                value: 15,
                stats: {
                    maxHealth: 5,
                    accuracy: 2,
                    weight: 3,
                    armorRatings: {
                        insulated: 48,
                        plated: 8,
                        airborne: 20,
                        droid: 10,
                        biological: 14
                    }
                }
            },
            gauntlets_iron: {
                name: "Iron Gauntlets",
                description: "Metal hand protection",
                image: "🧤",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "gloves",
                equipSlot: "gloves",
                value: 50,
                stats: {
                    maxHealth: 15,
                    defense: 5,
                    attackDamage: 3,
                    weight: 6,
                    armorRatings: {
                        insulated: 12,
                        plated: 50,
                        airborne: 18,
                        droid: 12,
                        biological: 8
                    }
                }
            },
            gauntlets_steel: {
                name: "Steel Gauntlets",
                description: "Heavy steel gloves",
                image: "🧤",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "gloves",
                equipSlot: "gloves",
                value: 90,
                stats: {
                    maxHealth: 25,
                    defense: 8,
                    attackDamage: 5,
                    weight: 8,
                    armorRatings: {
                        insulated: 10,
                        plated: 55,
                        airborne: 16,
                        droid: 12,
                        biological: 7
                    }
                }
            },

            // MORE ARMOR - Boots
            boots_leather: {
                name: "Leather Boots",
                description: "Sturdy walking boots",
                image: "👢",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "boots",
                equipSlot: "boots",
                value: 30,
                stats: {
                    maxHealth: 10,
                    defense: 3,
                    speed: 2,
                    weight: 5,
                    armorRatings: {
                        insulated: 28,
                        plated: 18,
                        airborne: 24,
                        droid: 10,
                        biological: 20
                    }
                }
            },
            boots_iron: {
                name: "Iron Boots",
                description: "Heavy metal boots",
                image: "🥾",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "boots",
                equipSlot: "boots",
                value: 70,
                stats: {
                    maxHealth: 20,
                    defense: 8,
                    weight: 7,
                    armorRatings: {
                        insulated: 12,
                        plated: 50,
                        airborne: 20,
                        droid: 10,
                        biological: 8
                    }
                }
            },
            boots_steel: {
                name: "Steel Boots",
                description: "Reinforced steel footwear",
                image: "🥾",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "boots",
                equipSlot: "boots",
                value: 120,
                stats: {
                    maxHealth: 30,
                    defense: 12,
                    weight: 8,
                    armorRatings: {
                        insulated: 10,
                        plated: 56,
                        airborne: 18,
                        droid: 10,
                        biological: 6
                    }
                }
            },

            // MORE ARMOR - Shields
            shield_bronze: {
                name: "Bronze Shield",
                description: "Round bronze shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "shield",
                equipSlot: "shield",
                value: 45,
                stats: {
                    maxHealth: 25,
                    defense: 8,
                    accuracy: -2,
                    weight: 8
                }
            },
            shield_steel: {
                name: "Steel Shield",
                description: "Heavy steel shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "shield",
                equipSlot: "shield",
                value: 100,
                stats: {
                    maxHealth: 50,
                    defense: 15,
                    accuracy: -4,
                    attackSpeed: -0.15,
                    weight: 11
                }
            },
            shield_tower: {
                name: "Tower Shield",
                description: "Massive protective shield",
                image: "🛡️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "armor",
                category: "shield",
                equipSlot: "shield",
                value: 180,
                stats: {
                    maxHealth: 80,
                    defense: 25,
                    accuracy: -8,
                    attackSpeed: -0.3,
                    weight: 12
                }
            },

            // MORE CONSUMABLES - Potions
            potion_small_health: {
                name: "Small Health Potion",
                description: "Restores 25 HP",
                image: "🧪",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "potion",
                value: 10,
                effect: { heal: 25 }
            },
            potion_medium_health: {
                name: "Medium Health Potion",
                description: "Restores 75 HP",
                image: "🧪",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "potion",
                value: 30,
                effect: { heal: 75 }
            },
            potion_large_health: {
                name: "Large Health Potion",
                description: "Restores 150 HP",
                image: "🧪",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "potion",
                value: 60,
                effect: { heal: 150 }
            },
            potion_strength: {
                name: "Strength Potion",
                description: "Increases attack damage",
                image: "💪",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "potion",
                value: 50,
                effect: { attackBuff: 20, duration: 60 }
            },
            potion_speed: {
                name: "Speed Potion",
                description: "Increases attack speed",
                image: "⚡",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "potion",
                value: 50,
                effect: { speedBuff: 30, duration: 60 }
            },
            potion_defense: {
                name: "Defense Potion",
                description: "Increases defense",
                image: "🛡️",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "potion",
                value: 50,
                effect: { defenseBuff: 15, duration: 60 }
            },

            // MORE CONSUMABLES - Food
            apple: {
                name: "Apple",
                description: "Fresh crisp apple - Auto-consumed in combat when health is low",
                image: "🍎",
                stackLimit: 100,
                devLimit: Infinity,
                defaultTab: "consumable",
                equipSlot: "food",
                category: "food",
                value: 3,
                healAmount: 20,
                consumeTime: 1000,
                effect: { heal: 10 }
            },
            cooked_meat: {
                name: "Cooked Meat",
                description: "Grilled meat - Auto-consumed in combat for substantial healing",
                image: "🍖",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "consumable",
                equipSlot: "food",
                category: "food",
                value: 15,
                healAmount: 50,
                consumeTime: 2000,
                effect: { heal: 30 }
            },
            fish_cooked: {
                name: "Cooked Fish",
                description: "Grilled fish",
                image: "🐟",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "food",
                value: 12,
                effect: { heal: 25 }
            },
            stew: {
                name: "Hearty Stew",
                description: "Nutritious vegetable stew",
                image: "🍲",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "food",
                value: 25,
                effect: { heal: 50 }
            },
            cake: {
                name: "Cake",
                description: "Delicious sweet cake",
                image: "🍰",
                stackLimit: 20,
                devLimit: Infinity,
                defaultTab: "consumable",
                category: "food",
                value: 40,
                effect: { heal: 80 }
            },

            // MORE QUEST ITEMS
            ancient_key: {
                name: "Ancient Key",
                description: "Mysterious old key",
                image: "🗝️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                category: "quest",
                value: 0
            },
            map_treasure: {
                name: "Treasure Map",
                description: "Map leading to hidden treasure",
                image: "🗺️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                category: "quest",
                value: 0
            },
            scroll_ancient: {
                name: "Ancient Scroll",
                description: "Contains ancient knowledge",
                image: "📜",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                category: "quest",
                value: 0
            },
            amulet_cursed: {
                name: "Cursed Amulet",
                description: "Dark artifact of unknown origin",
                image: "🔮",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                category: "quest",
                value: 0
            },
            letter_sealed: {
                name: "Sealed Letter",
                description: "Important sealed message",
                image: "✉️",
                stackLimit: 1,
                devLimit: Infinity,
                defaultTab: "quest",
                category: "quest",
                value: 0
            },

            // MORE TECHNOLOGY
            circuit_board: {
                name: "Circuit Board",
                description: "Electronic component",
                image: "🔌",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "technology",
                category: "technology",
                value: 35
            },
            battery: {
                name: "Battery Pack",
                description: "Rechargeable power source",
                image: "🔋",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "technology",
                category: "technology",
                value: 40
            },
            laser_sight: {
                name: "Laser Sight",
                description: "Weapon targeting system",
                image: "🔴",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "technology",
                category: "technology",
                value: 120
            },

            // MORE HEALING
            medical_kit_advanced: {
                name: "Advanced Medical Kit",
                description: "High-tech healing supplies",
                image: "🏥",
                stackLimit: 15,
                devLimit: Infinity,
                defaultTab: "healing",
                category: "healing",
                value: 80,
                effect: { heal: 100 }
            },
            antidote: {
                name: "Antidote",
                description: "Cures poison",
                image: "💉",
                stackLimit: 20,
                devLimit: Infinity,
                defaultTab: "healing",
                category: "healing",
                value: 35
            },
            regeneration_serum: {
                name: "Regeneration Serum",
                description: "Slowly heals over time",
                image: "🧬",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "healing",
                category: "healing",
                value: 120,
                effect: { regen: 5, duration: 120 }
            },

            // === RARE GATHERING RESOURCES ===

            // MINING RARES
            sapphire: {
                name: "Sapphire",
                description: "A brilliant blue gemstone",
                image: "💎",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_mining",
                value: 500,
                rarity: "rare"
            },
            ruby: {
                name: "Ruby",
                description: "A deep red precious gem",
                image: "💍",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_mining",
                value: 650,
                rarity: "rare"
            },
            emerald: {
                name: "Emerald",
                description: "A vibrant green gemstone",
                image: "🟢",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_mining",
                value: 800,
                rarity: "rare"
            },
            diamond: {
                name: "Diamond",
                description: "The hardest natural gemstone",
                image: "💠",
                stackLimit: 25,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_mining",
                value: 2000,
                rarity: "epic"
            },
            prismatic_shard: {
                name: "Prismatic Shard",
                description: "A fragment of pure crystallized energy",
                image: "🔮",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_mining",
                value: 5000,
                rarity: "legendary"
            },

            // LOGGING RARES
            amber: {
                name: "Amber",
                description: "Fossilized tree resin",
                image: "🟡",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_logging",
                value: 400,
                rarity: "rare"
            },
            golden_resin: {
                name: "Golden Resin",
                description: "Shimmering sap from ancient trees",
                image: "🍯",
                stackLimit: 25,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_logging",
                value: 1500,
                rarity: "epic"
            },
            world_tree_bark: {
                name: "World Tree Bark",
                description: "Bark from the mythical World Tree",
                image: "🌳",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_logging",
                value: 4000,
                rarity: "legendary"
            },

            // FISHING RARES
            pearl: {
                name: "Pearl",
                description: "A lustrous ocean gem",
                image: "⚪",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_fishing",
                value: 600,
                rarity: "rare"
            },
            sunken_chest: {
                name: "Sunken Chest",
                description: "An old treasure chest recovered from the depths",
                image: "🎁",
                stackLimit: 10,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_fishing",
                value: 2500,
                rarity: "epic"
            },
            neptune_crown: {
                name: "Neptune's Crown",
                description: "A legendary artifact of the sea god",
                image: "👑",
                stackLimit: 5,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_fishing",
                value: 10000,
                rarity: "legendary"
            },

            // HUNTING RARES
            perfect_pelt: {
                name: "Perfect Pelt",
                description: "A flawless animal hide",
                image: "🦌",
                stackLimit: 30,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_hunting",
                value: 700,
                rarity: "rare"
            },
            dragon_scale: {
                name: "Dragon Scale",
                description: "A scale from a mighty dragon",
                image: "🐉",
                stackLimit: 15,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_hunting",
                value: 3000,
                rarity: "epic"
            },
            phoenix_feather: {
                name: "Phoenix Feather",
                description: "A feather from the immortal phoenix",
                image: "🔥",
                stackLimit: 5,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_hunting",
                value: 8000,
                rarity: "legendary"
            },

            // FORAGING RARES
            golden_mushroom: {
                name: "Golden Mushroom",
                description: "A rare fungus that glows with golden light",
                image: "🟨",
                stackLimit: 40,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_foraging",
                value: 550,
                rarity: "rare"
            },
            fairy_dust: {
                name: "Fairy Dust",
                description: "Magical powder left by forest sprites",
                image: "✨",
                stackLimit: 20,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_foraging",
                value: 2200,
                rarity: "epic"
            },
            eternal_lotus: {
                name: "Eternal Lotus",
                description: "A flower that never wilts",
                image: "🌸",
                stackLimit: 8,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_foraging",
                value: 6500,
                rarity: "legendary"
            },

            // THIEVING RARES
            ancient_coin: {
                name: "Ancient Coin",
                description: "Currency from a long-lost civilization",
                image: "🪙",
                stackLimit: 50,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_thieving",
                value: 450,
                rarity: "rare"
            },
            treasure_map: {
                name: "Treasure Map",
                description: "A map leading to hidden riches",
                image: "🗺️",
                stackLimit: 15,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_thieving",
                value: 1800,
                rarity: "epic"
            },
            crown_of_ages: {
                name: "Crown of Ages",
                description: "A royal crown worn by ancient kings",
                image: "👑",
                stackLimit: 5,
                devLimit: Infinity,
                defaultTab: "resources",
                category: "rare_thieving",
                value: 7500,
                rarity: "legendary"
            }
        },

        // Legacy enemy definitions (will be migrated to EnemyRegistry)
        // DO NOT ACCESS DIRECTLY - use GameDefinitions.enemies instead
        _legacyEnemies: {
            scout: {
                name: "Scout",
                description: "Lightly armed patrol unit",
                image: "🎯",
                stats: {
                    maxHealth: 40,
                    attackDamage: 5,
                    attackSpeed: 1.0,
                    accuracy: 65,
                    armorType: "biological",
                    damageType: "pierce"
                },
                rewards: {
                    gold: { min: 10, max: 20 },
                    medals: { min: 1, max: 3 },
                    exp: { combat: 10 }
                },
                lootTable: [
                    { itemId: "ore", min: 1, max: 3, chance: 0.40 },
                    { itemId: "wood", min: 2, max: 5, chance: 0.35 },
                    { itemId: "cloth", min: 1, max: 3, chance: 0.30 },
                    { itemId: "dagger", min: 1, max: 1, chance: 0.05 }
                ],
                respawnTime: 3000,
                unlockRequirement: null
            },
            soldier: {
                name: "Soldier",
                description: "Standard military unit",
                image: "🪖",
                stats: {
                    maxHealth: 80,
                    attackDamage: 12,
                    attackSpeed: 0.9,
                    accuracy: 70,
                    armorType: "biological",
                    damageType: "pierce"
                },
                rewards: {
                    gold: { min: 25, max: 50 },
                    medals: { min: 3, max: 7 },
                    exp: { combat: 25 }
                },
                lootTable: [
                    { itemId: "ore", min: 2, max: 5, chance: 0.35 },
                    { itemId: "wood", min: 3, max: 6, chance: 0.30 },
                    { itemId: "cloth", min: 2, max: 4, chance: 0.25 },
                    { itemId: "ironSword", min: 1, max: 1, chance: 0.08 },
                    { itemId: "leatherHelmet", min: 1, max: 1, chance: 0.06 }
                ],
                respawnTime: 4000,
                unlockRequirement: { combat: 3 }
            },
            operative: {
                name: "Operative",
                description: "Elite tactical unit",
                image: "🕵️",
                stats: {
                    maxHealth: 120,
                    attackDamage: 18,
                    attackSpeed: 1.2,
                    accuracy: 80,
                    armorType: "biological",
                    damageType: "pierce"
                },
                rewards: {
                    gold: { min: 60, max: 120 },
                    medals: { min: 8, max: 15 },
                    exp: { combat: 50 }
                },
                lootTable: [
                    { itemId: "ore", min: 4, max: 8, chance: 0.40 },
                    { itemId: "wood", min: 5, max: 10, chance: 0.25 },
                    { itemId: "cloth", min: 3, max: 6, chance: 0.30 },
                    { itemId: "steelSword", min: 1, max: 1, chance: 0.12 },
                    { itemId: "leatherArmor", min: 1, max: 1, chance: 0.10 },
                    { itemId: "ironHelmet", min: 1, max: 1, chance: 0.08 }
                ],
                respawnTime: 5000,
                unlockRequirement: { combat: 8 }
            },
            commander: {
                name: "Commander",
                description: "High-ranking military officer",
                image: "⭐",
                stats: {
                    maxHealth: 200,
                    attackDamage: 28,
                    attackSpeed: 0.8,
                    accuracy: 85,
                    armorType: "biological",
                    damageType: "incendiary"
                },
                rewards: {
                    gold: { min: 150, max: 300 },
                    medals: { min: 15, max: 30 },
                    exp: { combat: 100 }
                },
                lootTable: [
                    { itemId: "ore", min: 8, max: 15, chance: 0.45 },
                    { itemId: "wood", min: 8, max: 15, chance: 0.25 },
                    { itemId: "cloth", min: 5, max: 10, chance: 0.30 },
                    { itemId: "steelSword", min: 1, max: 1, chance: 0.20 },
                    { itemId: "ironArmor", min: 1, max: 1, chance: 0.15 },
                    { itemId: "chainmail", min: 1, max: 1, chance: 0.12 },
                    { itemId: "silverRing", min: 1, max: 1, chance: 0.10 }
                ],
                respawnTime: 7000,
                unlockRequirement: { combat: 15 }
            },

            // =============================================================================
            // ELITE ENEMIES - Enhanced versions with special mechanics
            // =============================================================================
            // Elite mechanics are defined in the `elite` object within enemy definitions.
            // These properties are hooks for future elite combat mechanics implementation.

            elite_scout: {
                name: "Elite Scout",
                description: "Veteran reconnaissance specialist with enhanced abilities",
                image: "🎯✨",
                stats: {
                    maxHealth: 80,        // 2x base scout
                    attackDamage: 10,     // 2x base scout
                    attackSpeed: 1.3,     // 30% faster
                    accuracy: 80,         // +15% accuracy
                    armorType: "biological",
                    damageType: "pierce"
                },
                rewards: {
                    gold: { min: 30, max: 60 },     // 3x base
                    medals: { min: 5, max: 10 },    // 3x base
                    exp: { combat: 30 }             // 3x base
                },
                lootTable: [
                    { itemId: "ore", min: 3, max: 6, chance: 0.60 },
                    { itemId: "wood", min: 4, max: 8, chance: 0.50 },
                    { itemId: "cloth", min: 2, max: 5, chance: 0.45 },
                    { itemId: "dagger", min: 1, max: 1, chance: 0.15 },
                    { itemId: "leatherHelmet", min: 1, max: 1, chance: 0.10 }
                ],
                respawnTime: 12000,  // 4x base respawn
                unlockRequirement: { combat: 5 },

                // === ELITE MECHANICS (for future implementation) ===
                elite: {
                    isElite: true,
                    tier: 1,  // 1-3 for bronze/silver/gold elite tiers

                    // Stat modifiers (applied on top of base stats)
                    modifiers: {
                        healthMultiplier: 2.0,      // 2x health
                        damageMultiplier: 2.0,      // 2x damage
                        speedMultiplier: 1.3,       // 30% faster attacks
                        accuracyBonus: 15,          // +15% accuracy
                        defenseBonus: 0.10,         // 10% damage reduction
                        critChance: 15,             // 15% crit chance
                        critMultiplier: 1.5         // 1.5x crit damage
                    },

                    // Special abilities the elite can use in combat
                    abilities: [
                        {
                            id: "evasive_maneuver",
                            name: "Evasive Maneuver",
                            description: "Temporarily increases dodge chance",
                            triggerChance: 0.20,     // 20% chance per turn
                            triggerCondition: "health_below_50",  // or "on_cooldown", "random"
                            cooldown: 10000,         // 10 seconds
                            duration: 5000,          // 5 seconds
                            effect: {
                                type: "self_buff",
                                evasionBonus: 50,    // +50% evasion
                                icon: "💨"
                            }
                        }
                    ],

                    // Passive effects or auras
                    passives: [
                        {
                            id: "keen_eye",
                            name: "Keen Eye",
                            description: "Never misses attacks below 50% health",
                            effect: {
                                type: "conditional_accuracy",
                                condition: "health_below_50",
                                accuracyOverride: 100
                            }
                        }
                    ],

                    // Loot enhancements
                    loot: {
                        goldMultiplier: 3.0,        // 3x gold
                        expMultiplier: 3.0,         // 3x experience
                        medalMultiplier: 3.0,       // 3x medals
                        dropRateBonus: 0.25,        // +25% item drop chance

                        // Unique drops only from this elite
                        guaranteedDrops: [],
                        specialDrops: [
                            { itemId: "eliteToken_bronze", min: 1, max: 1, chance: 0.50 }
                        ]
                    },

                    // Visual and audio effects
                    visual: {
                        nameColor: "#FFD700",       // Gold name
                        glowColor: "#FFD700",       // Gold glow effect
                        particles: "sparkle",        // Particle effect type
                        aura: "golden_shimmer",     // Aura effect
                        icon: "✨",                 // Elite indicator
                        combatMusic: "elite_battle_theme_1"
                    },

                    // Combat behavior modifications
                    behavior: {
                        aggroRange: 1.5,            // 1.5x normal aggro range
                        fleeThreshold: 0.10,        // Will flee at 10% HP
                        enrageThreshold: 0.25,      // Enrages at 25% HP
                        enrageMultiplier: 1.5       // 1.5x damage when enraged
                    }
                }
            },

            elite_soldier: {
                name: "Elite Soldier",
                description: "Battle-hardened veteran with advanced combat training",
                image: "🪖⭐",
                stats: {
                    maxHealth: 160,
                    attackDamage: 24,
                    attackSpeed: 1.1,
                    accuracy: 85,
                    armorType: "biological",
                    damageType: "pierce"
                },
                rewards: {
                    gold: { min: 75, max: 150 },
                    medals: { min: 9, max: 21 },
                    exp: { combat: 75 }
                },
                lootTable: [
                    { itemId: "ore", min: 5, max: 10, chance: 0.55 },
                    { itemId: "wood", min: 6, max: 12, chance: 0.45 },
                    { itemId: "cloth", min: 4, max: 8, chance: 0.40 },
                    { itemId: "ironSword", min: 1, max: 1, chance: 0.20 },
                    { itemId: "leatherHelmet", min: 1, max: 1, chance: 0.15 },
                    { itemId: "ironArmor", min: 1, max: 1, chance: 0.12 }
                ],
                respawnTime: 16000,
                unlockRequirement: { combat: 10 },

                elite: {
                    isElite: true,
                    tier: 2,  // Silver tier

                    modifiers: {
                        healthMultiplier: 2.0,
                        damageMultiplier: 2.0,
                        speedMultiplier: 1.2,
                        accuracyBonus: 15,
                        defenseBonus: 0.20,         // 20% damage reduction
                        critChance: 20,
                        critMultiplier: 1.75
                    },

                    abilities: [
                        {
                            id: "shield_wall",
                            name: "Shield Wall",
                            description: "Reduces incoming damage significantly",
                            triggerChance: 0.25,
                            triggerCondition: "on_hit_taken",
                            cooldown: 15000,
                            duration: 6000,
                            effect: {
                                type: "self_buff",
                                damageReduction: 0.60,   // 60% damage reduction
                                icon: "🛡️"
                            }
                        },
                        {
                            id: "power_strike",
                            name: "Power Strike",
                            description: "Next attack deals massive damage",
                            triggerChance: 0.15,
                            triggerCondition: "random",
                            cooldown: 12000,
                            effect: {
                                type: "next_attack_buff",
                                damageMultiplier: 3.0,   // 3x damage
                                icon: "⚡"
                            }
                        }
                    ],

                    passives: [
                        {
                            id: "combat_veteran",
                            name: "Combat Veteran",
                            description: "Takes reduced damage from critical hits",
                            effect: {
                                type: "crit_resistance",
                                critDamageReduction: 0.40  // -40% crit damage taken
                            }
                        }
                    ],

                    loot: {
                        goldMultiplier: 3.0,
                        expMultiplier: 3.0,
                        medalMultiplier: 3.0,
                        dropRateBonus: 0.30,
                        specialDrops: [
                            { itemId: "eliteToken_silver", min: 1, max: 1, chance: 0.40 }
                        ]
                    },

                    visual: {
                        nameColor: "#C0C0C0",       // Silver
                        glowColor: "#C0C0C0",
                        particles: "steel_gleam",
                        aura: "silver_aura",
                        icon: "⭐"
                    },

                    behavior: {
                        aggroRange: 1.5,
                        enrageThreshold: 0.20,
                        enrageMultiplier: 2.0
                    }
                }
            },

            elite_commander: {
                name: "Elite Commander",
                description: "Legendary military leader with overwhelming power",
                image: "⭐💎",
                stats: {
                    maxHealth: 500,
                    attackDamage: 50,
                    attackSpeed: 1.0,
                    accuracy: 95,
                    armorType: "biological",
                    damageType: "incendiary"
                },
                rewards: {
                    gold: { min: 500, max: 1000 },
                    medals: { min: 50, max: 100 },
                    exp: { combat: 300 }
                },
                lootTable: [
                    { itemId: "ore", min: 20, max: 40, chance: 0.70 },
                    { itemId: "wood", min: 20, max: 40, chance: 0.40 },
                    { itemId: "cloth", min: 15, max: 30, chance: 0.50 },
                    { itemId: "steelSword", min: 1, max: 2, chance: 0.40 },
                    { itemId: "ironArmor", min: 1, max: 1, chance: 0.35 },
                    { itemId: "chainmail", min: 1, max: 1, chance: 0.30 },
                    { itemId: "silverRing", min: 1, max: 1, chance: 0.25 },
                    { itemId: "rifle_hunting", min: 1, max: 1, chance: 0.10 }
                ],
                respawnTime: 30000,  // 30 seconds
                unlockRequirement: { combat: 25 },

                elite: {
                    isElite: true,
                    tier: 3,  // Gold tier

                    modifiers: {
                        healthMultiplier: 2.5,
                        damageMultiplier: 1.8,
                        speedMultiplier: 1.25,
                        accuracyBonus: 10,
                        defenseBonus: 0.30,
                        critChance: 25,
                        critMultiplier: 2.0
                    },

                    abilities: [
                        {
                            id: "tactical_strike",
                            name: "Tactical Strike",
                            description: "Calls in a devastating attack that bypasses armor",
                            triggerChance: 0.20,
                            triggerCondition: "random",
                            cooldown: 20000,
                            effect: {
                                type: "special_attack",
                                damageMultiplier: 2.5,
                                bypassArmor: true,
                                applyEffect: {
                                    type: "armor_break",
                                    duration: 8000,
                                    defenseLoss: 0.50    // -50% player defense
                                },
                                icon: "💥"
                            }
                        },
                        {
                            id: "battle_command",
                            name: "Battle Command",
                            description: "Boosts own combat effectiveness",
                            triggerChance: 0.30,
                            triggerCondition: "health_below_50",
                            cooldown: 25000,
                            duration: 10000,
                            effect: {
                                type: "self_buff_multi",
                                damageBonus: 0.50,       // +50% damage
                                speedBonus: 0.30,        // +30% attack speed
                                accuracyBonus: 20,       // +20% accuracy
                                icon: "📣"
                            }
                        },
                        {
                            id: "emergency_heal",
                            name: "Combat Stim",
                            description: "Heals for 30% max health",
                            triggerChance: 1.0,          // 100% when condition met
                            triggerCondition: "health_below_25",
                            cooldown: 60000,             // Once per fight basically
                            effect: {
                                type: "self_heal",
                                healPercent: 0.30,       // 30% max HP
                                icon: "💊"
                            }
                        }
                    ],

                    passives: [
                        {
                            id: "tactical_genius",
                            name: "Tactical Genius",
                            description: "Cannot be critically hit",
                            effect: {
                                type: "crit_immunity",
                                critDamageReduction: 1.0
                            }
                        },
                        {
                            id: "inspiring_presence",
                            name: "Inspiring Presence",
                            description: "Regenerates health over time",
                            effect: {
                                type: "health_regeneration",
                                hpPerSecond: 2           // 2 HP/sec
                            }
                        }
                    ],

                    loot: {
                        goldMultiplier: 3.5,
                        expMultiplier: 3.0,
                        medalMultiplier: 3.5,
                        dropRateBonus: 0.50,
                        guaranteedDrops: [
                            { itemId: "eliteToken_gold", min: 1, max: 2 }
                        ],
                        specialDrops: [
                            { itemId: "legendary_weapon_fragment", min: 1, max: 1, chance: 0.05 }
                        ]
                    },

                    visual: {
                        nameColor: "#FFD700",
                        glowColor: "#FFA500",
                        particles: "golden_aura",
                        aura: "commanding_presence",
                        icon: "💎",
                        combatMusic: "elite_boss_theme"
                    },

                    behavior: {
                        aggroRange: 2.0,
                        noFlee: true,                // Never flees
                        enrageThreshold: 0.15,       // Enrages at 15% HP
                        enrageMultiplier: 2.5,       // 2.5x damage when enraged
                        phaseTransitions: [
                            {
                                healthThreshold: 0.50,
                                changeStats: {
                                    speedMultiplier: 1.3,
                                    damageMultiplier: 1.2
                                },
                                message: "💢 Elite Commander enters aggressive stance!"
                            },
                            {
                                healthThreshold: 0.25,
                                changeStats: {
                                    speedMultiplier: 1.5,
                                    damageMultiplier: 1.5
                                },
                                message: "🔥 Elite Commander unleashes full power!"
                            }
                        ]
                    }
                }
            }
        },

        // Legacy recipe definitions (will be migrated to RecipeRegistry)
        // DO NOT ACCESS DIRECTLY - use GameDefinitions.recipes instead
        _legacyRecipes: {
            // === FORGING RECIPES ===
            // Melee weapons and metal components
            forgeSteelBar: {
                name: "Steel Bar",
                description: "A refined steel bar for crafting",
                skill: "smithing",
                skillLevel: 5,
                craftingTime: 3000, // ms
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 3 },
                    { itemId: "coal", amount: 1 }
                ],
                outputs: [
                    { itemId: "steelBar", amount: 1 }
                ],
                expReward: 10
            },
            forgeCombatKnife: {
                name: "Combat Knife",
                description: "A tactical combat knife",
                skill: "smithing",
                skillLevel: 1,
                craftingTime: 5000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 2 },
                    { itemId: "wood", amount: 1 }
                ],
                outputs: [
                    { itemId: "combatKnife", amount: 1 }
                ],
                expReward: 15
            },
            forgeWoodenShield: {
                name: "Wooden Shield",
                description: "Basic wooden shield for defense",
                skill: "smithing",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "wood", amount: 4 },
                    { itemId: "ore", amount: 1 }
                ],
                outputs: [
                    { itemId: "woodenShield", amount: 1 }
                ],
                expReward: 8
            },
            forgeIronHelmet: {
                name: "Iron Helmet",
                description: "Sturdy iron helmet for head protection",
                skill: "smithing",
                skillLevel: 3,
                craftingTime: 3500,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 5 },
                    { itemId: "leather", amount: 2 }
                ],
                outputs: [
                    { itemId: "ironHelmet", amount: 1 }
                ],
                expReward: 12
            },
            forgeIronArmor: {
                name: "Iron Armor",
                description: "Heavy iron chest armor",
                skill: "smithing",
                skillLevel: 4,
                craftingTime: 5000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "ore", amount: 8 },
                    { itemId: "leather", amount: 3 }
                ],
                outputs: [
                    { itemId: "ironArmor", amount: 1 }
                ],
                expReward: 20
            },
            forgeBodyArmor: {
                name: "Body Armor Plate",
                description: "Metal armor plating for body armor",
                skill: "smithing",
                skillLevel: 10,
                craftingTime: 8000,
                station: ["basicForge", "advancedForge", "masterForge"],
                inputs: [
                    { itemId: "steelBar", amount: 3 },
                    { itemId: "scrap", amount: 2 }
                ],
                outputs: [
                    { itemId: "armorPlate", amount: 1 }
                ],
                expReward: 25
            },

            // === MACHINING RECIPES ===
            // Firearms and mechanical parts
            machineReceiverPart: {
                name: "Weapon Receiver",
                description: "The main body of a firearm",
                skill: "mechanics",
                skillLevel: 10,
                craftingTime: 10000,
                station: ["basicWorkbench", "machineShop", "precisionLab"],
                inputs: [
                    { itemId: "steelBar", amount: 2 },
                    { itemId: "scrap", amount: 3 }
                ],
                outputs: [
                    { itemId: "weaponReceiver", amount: 1 }
                ],
                expReward: 30
            },
            machinePistol: {
                name: "9mm Pistol",
                description: "A standard 9mm sidearm",
                skill: "mechanics",
                skillLevel: 5,
                craftingTime: 15000,
                station: ["basicWorkbench", "machineShop", "precisionLab"],
                inputs: [
                    { itemId: "weaponReceiver", amount: 1 },
                    { itemId: "steelBar", amount: 1 },
                    { itemId: "spring", amount: 2 }
                ],
                outputs: [
                    { itemId: "pistol9mm", amount: 1 }
                ],
                expReward: 50
            },
            machineOptic: {
                name: "Weapon Optic",
                description: "A precision aiming sight",
                skill: "mechanics",
                skillLevel: 15,
                craftingTime: 12000,
                station: ["machineShop", "precisionLab"],
                inputs: [
                    { itemId: "glass", amount: 2 },
                    { itemId: "scrap", amount: 3 },
                    { itemId: "wire", amount: 2 }
                ],
                outputs: [
                    { itemId: "redDotSight", amount: 1 }
                ],
                expReward: 40
            },

            // === COOKING RECIPES ===
            // Food and consumables with buffs
            cookBread: {
                name: "Bread",
                description: "Simple bread that restores a small amount of health",
                skill: "cooking",
                skillLevel: 1,
                craftingTime: 1500,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "grain", amount: 2 }
                ],
                outputs: [
                    { itemId: "bread", amount: 2 }
                ],
                expReward: 5
            },
            cookMeat: {
                name: "Cooked Meat",
                description: "Grilled meat that restores health",
                skill: "cooking",
                skillLevel: 1,
                craftingTime: 1000,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "meat", amount: 1 }
                ],
                outputs: [
                    { itemId: "cookedMeat", amount: 1 }
                ],
                expReward: 4
            },
            cookStew: {
                name: "Vegetable Stew",
                description: "Hearty stew that restores health and provides a small buff",
                skill: "cooking",
                skillLevel: 2,
                craftingTime: 2500,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "vegetables", amount: 3 },
                    { itemId: "meat", amount: 1 },
                    { itemId: "water", amount: 1 }
                ],
                outputs: [
                    { itemId: "vegetableStew", amount: 1 }
                ],
                expReward: 10
            },
            cookMRE: {
                name: "MRE (Meal Ready to Eat)",
                description: "Basic field ration that restores health",
                skill: "cooking",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["campfire", "fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "meat", amount: 2 },
                    { itemId: "berries", amount: 1 }
                ],
                outputs: [
                    { itemId: "mre", amount: 1 }
                ],
                expReward: 8
            },
            cookEnergyBar: {
                name: "Energy Bar",
                description: "Provides a temporary stamina boost",
                skill: "cooking",
                skillLevel: 5,
                craftingTime: 3000,
                station: ["fieldKitchen", "fullKitchen"],
                inputs: [
                    { itemId: "grain", amount: 3 },
                    { itemId: "honey", amount: 1 },
                    { itemId: "nuts", amount: 2 }
                ],
                outputs: [
                    { itemId: "energyBar", amount: 2 }
                ],
                expReward: 12
            },
            cookStimPack: {
                name: "Combat Stim",
                description: "Temporary combat effectiveness boost",
                skill: "cooking",
                skillLevel: 15,
                craftingTime: 5000,
                station: ["fullKitchen"],
                inputs: [
                    { itemId: "herb", amount: 4 },
                    { itemId: "water", amount: 2 },
                    { itemId: "salt", amount: 1 }
                ],
                outputs: [
                    { itemId: "combatStim", amount: 1 }
                ],
                expReward: 25
            },

            // === CHEMISTRY RECIPES ===
            // Medical supplies and explosives
            chemHealthPotion: {
                name: "Health Potion",
                description: "Basic potion that restores health",
                skill: "chemistry",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "herb", amount: 2 },
                    { itemId: "water", amount: 1 }
                ],
                outputs: [
                    { itemId: "healthPotion", amount: 1 }
                ],
                expReward: 6
            },
            chemStaminaPotion: {
                name: "Stamina Potion",
                description: "Weak potion that restores stamina",
                skill: "chemistry",
                skillLevel: 2,
                craftingTime: 2500,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "herb", amount: 2 },
                    { itemId: "berries", amount: 2 },
                    { itemId: "water", amount: 1 }
                ],
                outputs: [
                    { itemId: "staminaPotion", amount: 1 }
                ],
                expReward: 8
            },
            chemAntidote: {
                name: "Antidote",
                description: "Cures poison and negative effects",
                skill: "chemistry",
                skillLevel: 3,
                craftingTime: 3000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "herb", amount: 3 },
                    { itemId: "flower", amount: 2 },
                    { itemId: "alcohol", amount: 1 }
                ],
                outputs: [
                    { itemId: "antidote", amount: 1 }
                ],
                expReward: 12
            },
            chemMedKit: {
                name: "Medical Kit",
                description: "Restores significant health",
                skill: "chemistry",
                skillLevel: 5,
                craftingTime: 6000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "cloth", amount: 2 },
                    { itemId: "alcohol", amount: 1 },
                    { itemId: "herb", amount: 3 }
                ],
                outputs: [
                    { itemId: "medKit", amount: 1 }
                ],
                expReward: 20
            },
            chemGrenade: {
                name: "Frag Grenade",
                description: "Explosive grenade for combat",
                skill: "chemistry",
                skillLevel: 10,
                craftingTime: 8000,
                station: ["chemTable", "chemLab", "researchLab"],
                inputs: [
                    { itemId: "explosivePowder", amount: 3 },
                    { itemId: "scrap", amount: 2 },
                    { itemId: "wire", amount: 1 }
                ],
                outputs: [
                    { itemId: "fragGrenade", amount: 1 }
                ],
                expReward: 30
            },
            chemExplosive: {
                name: "C4 Explosive",
                description: "High-grade plastic explosive",
                skill: "chemistry",
                skillLevel: 20,
                craftingTime: 15000,
                station: ["chemLab", "researchLab"],
                inputs: [
                    { itemId: "explosivePowder", amount: 5 },
                    { itemId: "plastic", amount: 3 },
                    { itemId: "detonator", amount: 1 }
                ],
                outputs: [
                    { itemId: "c4Explosive", amount: 1 }
                ],
                expReward: 50
            },

            // === TEXTILES RECIPES ===
            // Clothing and tactical gear
            textileCloth: {
                name: "Processed Cloth",
                description: "Clean, processed cloth for crafting",
                skill: "textiles",
                skillLevel: 1,
                craftingTime: 2000,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "rawFiber", amount: 4 }
                ],
                outputs: [
                    { itemId: "cloth", amount: 2 }
                ],
                expReward: 5
            },
            textileClothHood: {
                name: "Cloth Hood",
                description: "Simple cloth hood for basic protection",
                skill: "textiles",
                skillLevel: 1,
                craftingTime: 1500,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 2 },
                    { itemId: "thread", amount: 1 }
                ],
                outputs: [
                    { itemId: "clothHood", amount: 1 }
                ],
                expReward: 6
            },
            textileClothPants: {
                name: "Cloth Pants",
                description: "Basic cloth pants",
                skill: "textiles",
                skillLevel: 1,
                craftingTime: 1500,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 3 },
                    { itemId: "thread", amount: 1 }
                ],
                outputs: [
                    { itemId: "clothPants", amount: 1 }
                ],
                expReward: 6
            },
            textileLeatherArmor: {
                name: "Leather Armor",
                description: "Durable leather chest armor",
                skill: "textiles",
                skillLevel: 3,
                craftingTime: 3000,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "leather", amount: 4 },
                    { itemId: "thread", amount: 2 }
                ],
                outputs: [
                    { itemId: "leatherArmor", amount: 1 }
                ],
                expReward: 15
            },
            textileHuntingJacket: {
                name: "Hunting Jacket",
                description: "Warm jacket with pockets",
                skill: "textiles",
                skillLevel: 2,
                craftingTime: 2500,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 4 },
                    { itemId: "leather", amount: 2 },
                    { itemId: "thread", amount: 2 }
                ],
                outputs: [
                    { itemId: "huntingJacket", amount: 1 }
                ],
                expReward: 12
            },
            textileTacticalVest: {
                name: "Tactical Vest",
                description: "Lightweight vest with pockets",
                skill: "textiles",
                skillLevel: 8,
                craftingTime: 10000,
                station: ["sewingKit", "tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 5 },
                    { itemId: "thread", amount: 3 },
                    { itemId: "buckle", amount: 2 }
                ],
                outputs: [
                    { itemId: "tacticalVest", amount: 1 }
                ],
                expReward: 30
            },
            textileCamo: {
                name: "Camouflage Uniform",
                description: "Stealth-enhancing camo clothing",
                skill: "textiles",
                skillLevel: 15,
                craftingTime: 12000,
                station: ["tailorShop", "fabricMill"],
                inputs: [
                    { itemId: "cloth", amount: 8 },
                    { itemId: "dye", amount: 3 },
                    { itemId: "thread", amount: 5 }
                ],
                outputs: [
                    { itemId: "camoUniform", amount: 1 }
                ],
                expReward: 40
            },

            // === ENGINEERING RECIPES ===
            // Tech items and tools
            engineerCircuitBoard: {
                name: "Circuit Board",
                description: "Basic electronic component",
                skill: "engineering",
                skillLevel: 5,
                craftingTime: 8000,
                station: ["engineeringDesk", "techBench", "innovationCenter"],
                inputs: [
                    { itemId: "wire", amount: 4 },
                    { itemId: "plastic", amount: 2 },
                    { itemId: "solder", amount: 1 }
                ],
                outputs: [
                    { itemId: "circuitBoard", amount: 1 }
                ],
                expReward: 25
            },
            engineerDrone: {
                name: "Recon Drone",
                description: "Small surveillance drone",
                skill: "engineering",
                skillLevel: 20,
                craftingTime: 20000,
                station: ["techBench", "innovationCenter"],
                inputs: [
                    { itemId: "circuitBoard", amount: 3 },
                    { itemId: "motor", amount: 4 },
                    { itemId: "battery", amount: 2 },
                    { itemId: "plastic", amount: 5 }
                ],
                outputs: [
                    { itemId: "reconDrone", amount: 1 }
                ],
                expReward: 75
            },
            engineerTool: {
                name: "Multi-Tool",
                description: "Versatile engineering tool",
                skill: "engineering",
                skillLevel: 10,
                craftingTime: 10000,
                station: ["engineeringDesk", "techBench", "innovationCenter"],
                inputs: [
                    { itemId: "steelBar", amount: 2 },
                    { itemId: "scrap", amount: 3 },
                    { itemId: "spring", amount: 2 }
                ],
                outputs: [
                    { itemId: "multiTool", amount: 1 }
                ],
                expReward: 35
            }
        },

        // Resource Node definitions
        resourceNodes: {
            // MINING NODES - Tier 1
            copperVein: {
                name: "Copper Vein",
                description: "A small vein of copper ore",
                image: "🟠",
                skill: "mining",
                tier: 1,
                skillLevel: 1,
                harvestsPerDepletion: 18,
                harvestTime: 2500,
                respawnTime: 25000,
                // Node Defensive Stats (Tier 1 - Easy)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "copperOre", min: 1, max: 2, weight: 60 },
                    { itemId: "stone", min: 1, max: 3, weight: 40 }
                ],
                rareLoot: [
                    { itemId: "sapphire", min: 1, max: 1, chance: 0.03 }
                ],
                expPerHarvest: 3
            },
            tinRock: {
                name: "Tin Rock",
                description: "A deposit of tin ore",
                image: "⚪",
                skill: "mining",
                tier: 1,
                skillLevel: 4,
                harvestsPerDepletion: 17,
                harvestTime: 2800,
                respawnTime: 27000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,
                evasion: 30,
                critEvasion: 5,
                critResistance: 0.5,
                rareEvasion: 0.5,
                rareResistance: 0.5,
                normalLoot: [
                    { itemId: "tinOre", min: 1, max: 2, weight: 55 },
                    { itemId: "stone", min: 1, max: 3, weight: 45 }
                ],
                rareLoot: [
                    { itemId: "sapphire", min: 1, max: 1, chance: 0.04 }
                ],
                expPerHarvest: 4
            },

            // MINING NODES - Tier 2
            ironVein: {
                name: "Iron Vein",
                description: "A rich vein of iron ore",
                image: "⛏️",
                skill: "mining",
                tier: 2,
                skillLevel: 7,
                harvestsPerDepletion: 14,
                harvestTime: 3500,
                respawnTime: 38000,
                // Node Defensive Stats (Tier 2 - 1.2x multiplier)
                resistance: 3600,
                evasion: 36,
                critEvasion: 6,
                critResistance: 0.6,
                rareEvasion: 0.6,
                rareResistance: 0.6,
                normalLoot: [
                    { itemId: "ore", min: 1, max: 3, weight: 50 },
                    { itemId: "coal", min: 1, max: 2, weight: 30 },
                    { itemId: "stone", min: 2, max: 4, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "ruby", min: 1, max: 1, chance: 0.05 }
                ],
                expPerHarvest: 8
            },
            coalDeposit: {
                name: "Coal Deposit",
                description: "A dark coal deposit",
                image: "⚫",
                skill: "mining",
                tier: 2,
                skillLevel: 9,
                harvestsPerDepletion: 13,
                harvestTime: 3200,
                respawnTime: 35000,
                // Node Defensive Stats (Tier 2 - 1.2x multiplier)
                resistance: 3600,
                evasion: 36,
                critEvasion: 6,
                critResistance: 0.6,
                rareEvasion: 0.6,
                rareResistance: 0.6,
                normalLoot: [
                    { itemId: "coal", min: 2, max: 4, weight: 70 },
                    { itemId: "stone", min: 1, max: 3, weight: 30 }
                ],
                rareLoot: [
                    { itemId: "ruby", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 9
            },

            // MINING NODES - Tier 3
            goldVein: {
                name: "Gold Vein",
                description: "A precious gold vein",
                image: "🟡",
                skill: "mining",
                tier: 3,
                skillLevel: 12,
                harvestsPerDepletion: 10,
                harvestTime: 4500,
                respawnTime: 52000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "goldOre", min: 1, max: 2, weight: 45 },
                    { itemId: "ore", min: 1, max: 3, weight: 35 },
                    { itemId: "coal", min: 1, max: 2, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "emerald", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 15
            },
            mithrilDeposit: {
                name: "Mithril Deposit",
                description: "A legendary mithril ore deposit",
                image: "💎",
                skill: "mining",
                tier: 3,
                skillLevel: 15,
                harvestsPerDepletion: 9,
                harvestTime: 4800,
                respawnTime: 55000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "ore", min: 2, max: 4, weight: 50 },
                    { itemId: "goldOre", min: 1, max: 2, weight: 30 },
                    { itemId: "coal", min: 2, max: 3, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "diamond", min: 1, max: 1, chance: 0.07 },
                    { itemId: "prismatic_shard", min: 1, max: 1, chance: 0.02 }
                ],
                expPerHarvest: 20
            },

            // LOGGING NODES - Tier 1
            oakTree: {
                name: "Oak Tree",
                description: "A sturdy oak tree",
                image: "🌳",
                skill: "logging",
                tier: 1,
                skillLevel: 1,
                harvestsPerDepletion: 20,
                harvestTime: 2200,
                respawnTime: 22000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "wood", min: 2, max: 4, weight: 100 }
                ],
                rareLoot: [
                    { itemId: "amber", min: 1, max: 1, chance: 0.03 }
                ],
                expPerHarvest: 4
            },
            birchTree: {
                name: "Birch Tree",
                description: "A slender birch tree with white bark",
                image: "🌲",
                skill: "logging",
                tier: 1,
                skillLevel: 3,
                harvestsPerDepletion: 19,
                harvestTime: 2400,
                respawnTime: 24000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "wood", min: 2, max: 3, weight: 100 }
                ],
                rareLoot: [
                    { itemId: "amber", min: 1, max: 1, chance: 0.04 }
                ],
                expPerHarvest: 5
            },

            // LOGGING NODES - Tier 2
            pineTree: {
                name: "Pine Tree",
                description: "A tall pine tree",
                image: "🌲",
                skill: "logging",
                tier: 2,
                skillLevel: 6,
                harvestsPerDepletion: 15,
                harvestTime: 3300,
                respawnTime: 36000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "wood", min: 3, max: 5, weight: 100 }
                ],
                rareLoot: [
                    { itemId: "golden_resin", min: 1, max: 1, chance: 0.05 }
                ],
                expPerHarvest: 10
            },
            mapleTree: {
                name: "Maple Tree",
                description: "A maple tree with vibrant leaves",
                image: "🍁",
                skill: "logging",
                tier: 2,
                skillLevel: 8,
                harvestsPerDepletion: 14,
                harvestTime: 3600,
                respawnTime: 40000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "wood", min: 3, max: 6, weight: 100 }
                ],
                rareLoot: [
                    { itemId: "golden_resin", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 12
            },

            // LOGGING NODES - Tier 3
            ancientTree: {
                name: "Ancient Tree",
                description: "An ancient tree of immense size",
                image: "🌳",
                skill: "logging",
                tier: 3,
                skillLevel: 11,
                harvestsPerDepletion: 11,
                harvestTime: 4200,
                respawnTime: 48000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "wood", min: 4, max: 7, weight: 100 }
                ],
                rareLoot: [
                    { itemId: "world_tree_bark", min: 1, max: 1, chance: 0.07 }
                ],
                expPerHarvest: 18
            },

            // FISHING NODES - Tier 1
            pond: {
                name: "Pond",
                description: "A small pond with minnows",
                image: "💧",
                skill: "fishing",
                tier: 1,
                skillLevel: 1,
                harvestsPerDepletion: 16,
                harvestTime: 2600,
                respawnTime: 26000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "minnow", min: 1, max: 3, weight: 70 },
                    { itemId: "trout", min: 1, max: 1, weight: 30 }
                ],
                rareLoot: [
                    { itemId: "pearl", min: 1, max: 1, chance: 0.03 }
                ],
                expPerHarvest: 3
            },
            stream: {
                name: "Stream",
                description: "A flowing stream with clear water",
                image: "💧",
                skill: "fishing",
                tier: 1,
                skillLevel: 4,
                harvestsPerDepletion: 15,
                harvestTime: 2900,
                respawnTime: 28000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "trout", min: 1, max: 2, weight: 60 },
                    { itemId: "bass", min: 1, max: 1, weight: 40 }
                ],
                rareLoot: [
                    { itemId: "pearl", min: 1, max: 1, chance: 0.04 }
                ],
                expPerHarvest: 5
            },

            // FISHING NODES - Tier 2
            lake: {
                name: "Lake",
                description: "A calm lake teeming with fish",
                image: "🌊",
                skill: "fishing",
                tier: 2,
                skillLevel: 6,
                harvestsPerDepletion: 13,
                harvestTime: 3400,
                respawnTime: 37000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "bass", min: 1, max: 2, weight: 50 },
                    { itemId: "pike", min: 1, max: 2, weight: 30 },
                    { itemId: "trout", min: 1, max: 2, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "sunken_chest", min: 1, max: 1, chance: 0.05 }
                ],
                expPerHarvest: 9
            },
            river: {
                name: "River",
                description: "A wide river with strong currents",
                image: "🌊",
                skill: "fishing",
                tier: 2,
                skillLevel: 9,
                harvestsPerDepletion: 12,
                harvestTime: 3700,
                respawnTime: 42000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "salmon", min: 1, max: 2, weight: 55 },
                    { itemId: "pike", min: 1, max: 2, weight: 45 }
                ],
                rareLoot: [
                    { itemId: "sunken_chest", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 11
            },

            // FISHING NODES - Tier 3
            ocean: {
                name: "Ocean",
                description: "The vast ocean depths",
                image: "🌊",
                skill: "fishing",
                tier: 3,
                skillLevel: 13,
                harvestsPerDepletion: 10,
                harvestTime: 4400,
                respawnTime: 50000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "salmon", min: 2, max: 3, weight: 60 },
                    { itemId: "goldfish", min: 1, max: 1, weight: 40 }
                ],
                rareLoot: [
                    { itemId: "neptune_crown", min: 1, max: 1, chance: 0.07 }
                ],
                expPerHarvest: 17
            },

            // HUNTING NODES - Tier 1
            grassland: {
                name: "Grassland",
                description: "Open grasslands with small game",
                image: "🌾",
                skill: "hunting",
                tier: 1,
                skillLevel: 1,
                harvestsPerDepletion: 17,
                harvestTime: 2700,
                respawnTime: 26000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "rawMeat", min: 1, max: 2, weight: 60 },
                    { itemId: "hide", min: 1, max: 1, weight: 40 }
                ],
                rareLoot: [
                    { itemId: "perfect_pelt", min: 1, max: 1, chance: 0.03 }
                ],
                expPerHarvest: 4
            },
            woodland: {
                name: "Woodland",
                description: "A woodland area with rabbits and deer",
                image: "🌲",
                skill: "hunting",
                tier: 1,
                skillLevel: 4,
                harvestsPerDepletion: 16,
                harvestTime: 3000,
                respawnTime: 28000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "rawMeat", min: 1, max: 3, weight: 50 },
                    { itemId: "hide", min: 1, max: 2, weight: 30 },
                    { itemId: "bone", min: 1, max: 1, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "perfect_pelt", min: 1, max: 1, chance: 0.04 }
                ],
                expPerHarvest: 5
            },

            // HUNTING NODES - Tier 2
            deepForest: {
                name: "Deep Forest",
                description: "Dense forest with boar and elk",
                image: "🌳",
                skill: "hunting",
                tier: 2,
                skillLevel: 7,
                harvestsPerDepletion: 14,
                harvestTime: 3500,
                respawnTime: 39000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "rawMeat", min: 2, max: 4, weight: 55 },
                    { itemId: "hide", min: 2, max: 3, weight: 30 },
                    { itemId: "fang", min: 1, max: 1, weight: 15 }
                ],
                rareLoot: [
                    { itemId: "dragon_scale", min: 1, max: 1, chance: 0.05 }
                ],
                expPerHarvest: 10
            },
            mountainSlope: {
                name: "Mountain Slope",
                description: "Rocky slopes with wolves and bears",
                image: "⛰️",
                skill: "hunting",
                tier: 2,
                skillLevel: 9,
                harvestsPerDepletion: 13,
                harvestTime: 3800,
                respawnTime: 43000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "rawMeat", min: 2, max: 4, weight: 50 },
                    { itemId: "hide", min: 2, max: 3, weight: 25 },
                    { itemId: "fang", min: 1, max: 2, weight: 15 },
                    { itemId: "pelt", min: 1, max: 1, weight: 10 }
                ],
                rareLoot: [
                    { itemId: "dragon_scale", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 12
            },

            // HUNTING NODES - Tier 3
            ancientWilds: {
                name: "Ancient Wilds",
                description: "Primeval wilderness with legendary beasts",
                image: "🐉",
                skill: "hunting",
                tier: 3,
                skillLevel: 14,
                harvestsPerDepletion: 9,
                harvestTime: 4600,
                respawnTime: 54000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "rawMeat", min: 3, max: 5, weight: 50 },
                    { itemId: "hide", min: 2, max: 4, weight: 25 },
                    { itemId: "fang", min: 2, max: 3, weight: 15 },
                    { itemId: "pelt", min: 1, max: 2, weight: 10 }
                ],
                rareLoot: [
                    { itemId: "phoenix_feather", min: 1, max: 1, chance: 0.07 }
                ],
                expPerHarvest: 19
            },

            // FORAGING NODES - Tier 1
            flowerPatch: {
                name: "Flower Patch",
                description: "Colorful wildflowers grow here",
                image: "🌸",
                skill: "foraging",
                tier: 1,
                skillLevel: 1,
                harvestsPerDepletion: 19,
                harvestTime: 2300,
                respawnTime: 23000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "flower", min: 2, max: 4, weight: 100 }
                ],
                rareLoot: [
                    { itemId: "golden_mushroom", min: 1, max: 1, chance: 0.03 }
                ],
                expPerHarvest: 3
            },
            berryBush: {
                name: "Berry Bush",
                description: "A bush laden with berries",
                image: "🫐",
                skill: "foraging",
                tier: 1,
                skillLevel: 3,
                harvestsPerDepletion: 18,
                harvestTime: 2500,
                respawnTime: 25000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "berries", min: 2, max: 5, weight: 70 },
                    { itemId: "seed", min: 1, max: 1, weight: 30 }
                ],
                rareLoot: [
                    { itemId: "golden_mushroom", min: 1, max: 1, chance: 0.04 }
                ],
                expPerHarvest: 4
            },

            // FORAGING NODES - Tier 2
            mushroomLog: {
                name: "Mushroom Log",
                description: "A fallen log covered in mushrooms",
                image: "🍄",
                skill: "foraging",
                tier: 2,
                skillLevel: 6,
                harvestsPerDepletion: 14,
                harvestTime: 3400,
                respawnTime: 38000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "mushroom", min: 2, max: 4, weight: 60 },
                    { itemId: "root", min: 1, max: 2, weight: 40 }
                ],
                rareLoot: [
                    { itemId: "fairy_dust", min: 1, max: 1, chance: 0.05 }
                ],
                expPerHarvest: 9
            },
            herbGarden: {
                name: "Herb Garden",
                description: "Wild herbs growing naturally",
                image: "🌿",
                skill: "foraging",
                tier: 2,
                skillLevel: 8,
                harvestsPerDepletion: 13,
                harvestTime: 3600,
                respawnTime: 41000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "herb", min: 2, max: 4, weight: 65 },
                    { itemId: "flower", min: 1, max: 2, weight: 35 }
                ],
                rareLoot: [
                    { itemId: "fairy_dust", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 11
            },

            // FORAGING NODES - Tier 3
            mysticGrove: {
                name: "Mystic Grove",
                description: "An enchanted grove with rare plants",
                image: "✨",
                skill: "foraging",
                tier: 3,
                skillLevel: 12,
                harvestsPerDepletion: 10,
                harvestTime: 4300,
                respawnTime: 49000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "herb", min: 3, max: 5, weight: 50 },
                    { itemId: "mushroom", min: 2, max: 3, weight: 30 },
                    { itemId: "flower", min: 2, max: 4, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "eternal_lotus", min: 1, max: 1, chance: 0.07 }
                ],
                expPerHarvest: 16
            },

            // THIEVING NODES - Tier 1
            abandonedCart: {
                name: "Abandoned Cart",
                description: "An old cart with forgotten goods",
                image: "🛒",
                skill: "thieving",
                tier: 1,
                skillLevel: 1,
                harvestsPerDepletion: 16,
                harvestTime: 2800,
                respawnTime: 27000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "coinPouch", min: 1, max: 2, weight: 60 },
                    { itemId: "scrap", min: 1, max: 3, weight: 40 }
                ],
                rareLoot: [
                    { itemId: "ancient_coin", min: 1, max: 1, chance: 0.03 }
                ],
                expPerHarvest: 4
            },
            marketStall: {
                name: "Market Stall",
                description: "A busy market stall",
                image: "🏪",
                skill: "thieving",
                tier: 1,
                skillLevel: 4,
                harvestsPerDepletion: 15,
                harvestTime: 3000,
                respawnTime: 29000,
                // Node Defensive Stats (Tier 1)
                resistance: 3000,         // Adds 3s to harvest time
                evasion: 30,              // Reduces harvest chance by 30%
                critEvasion: 5,           // Reduces crit chance by 5%
                critResistance: 0.5,      // Reduces crit multiplier by 0.5x
                rareEvasion: 0.5,         // Reduces rare chance by 0.5%
                rareResistance: 0.5,      // Reduces rare multiplier by 0.5x
                normalLoot: [
                    { itemId: "coinPouch", min: 1, max: 3, weight: 55 },
                    { itemId: "jewelry", min: 1, max: 1, weight: 25 },
                    { itemId: "wire", min: 1, max: 2, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "ancient_coin", min: 1, max: 1, chance: 0.04 }
                ],
                expPerHarvest: 5
            },

            // THIEVING NODES - Tier 2
            guardPost: {
                name: "Guard Post",
                description: "A lightly guarded checkpoint",
                image: "🏛️",
                skill: "thieving",
                tier: 2,
                skillLevel: 7,
                harvestsPerDepletion: 13,
                harvestTime: 3600,
                respawnTime: 40000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "coinPouch", min: 2, max: 4, weight: 50 },
                    { itemId: "keycard", min: 1, max: 1, weight: 30 },
                    { itemId: "scrap", min: 2, max: 3, weight: 20 }
                ],
                rareLoot: [
                    { itemId: "treasure_map", min: 1, max: 1, chance: 0.05 }
                ],
                expPerHarvest: 10
            },
            warehouse: {
                name: "Warehouse",
                description: "Storage facility with valuable goods",
                image: "🏭",
                skill: "thieving",
                tier: 2,
                skillLevel: 9,
                harvestsPerDepletion: 12,
                harvestTime: 3900,
                respawnTime: 44000,
                // Node Defensive Stats (Tier 2)
                resistance: 3600,         // Adds 3.6s to harvest time
                evasion: 36,              // Reduces harvest chance by 36%
                critEvasion: 6,           // Reduces crit chance by 6%
                critResistance: 0.6,      // Reduces crit multiplier by 0.6x
                rareEvasion: 0.6,         // Reduces rare chance by 0.6%
                rareResistance: 0.6,      // Reduces rare multiplier by 0.6x
                normalLoot: [
                    { itemId: "computerPart", min: 1, max: 2, weight: 40 },
                    { itemId: "wire", min: 2, max: 4, weight: 35 },
                    { itemId: "scrap", min: 2, max: 4, weight: 25 }
                ],
                rareLoot: [
                    { itemId: "treasure_map", min: 1, max: 1, chance: 0.06 }
                ],
                expPerHarvest: 12
            },

            // THIEVING NODES - Tier 3
            royalVault: {
                name: "Royal Vault",
                description: "The kingdom's treasure vault",
                image: "👑",
                skill: "thieving",
                tier: 3,
                skillLevel: 13,
                harvestsPerDepletion: 9,
                harvestTime: 4700,
                respawnTime: 56000,
                // Node Defensive Stats (Tier 3)
                resistance: 4320,         // Adds 4.32s to harvest time
                evasion: 43.2,            // Reduces harvest chance by 43.2%
                critEvasion: 7.2,         // Reduces crit chance by 7.2%
                critResistance: 0.72,     // Reduces crit multiplier by 0.72x
                rareEvasion: 0.72,        // Reduces rare chance by 0.72%
                rareResistance: 0.72,     // Reduces rare multiplier by 0.72x
                normalLoot: [
                    { itemId: "coinPouch", min: 4, max: 7, weight: 50 },
                    { itemId: "jewelry", min: 2, max: 4, weight: 35 },
                    { itemId: "keycard", min: 1, max: 2, weight: 15 }
                ],
                rareLoot: [
                    { itemId: "crown_of_ages", min: 1, max: 1, chance: 0.07 }
                ],
                expPerHarvest: 18
            }
        },

        // Crafting Node definitions (crafting stations)
        craftingNodes: {
            // FORGING STATIONS
            basicForge: {
                name: "Basic Forge",
                description: "A simple forge for basic metalworking",
                image: "🔥",
                skill: "smithing",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            advancedForge: {
                name: "Advanced Forge",
                description: "A well-equipped forge for advanced metalwork",
                image: "⚒️",
                skill: "smithing",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            masterForge: {
                name: "Master Forge",
                description: "A state-of-the-art metalworking facility",
                image: "🏭",
                skill: "smithing",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // MACHINING STATIONS
            basicWorkbench: {
                name: "Basic Workbench",
                description: "A simple workbench for basic machining",
                image: "🔧",
                skill: "mechanics",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            machineShop: {
                name: "Machine Shop",
                description: "A workshop with precision tools",
                image: "⚙️",
                skill: "mechanics",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            precisionLab: {
                name: "Precision Lab",
                description: "High-tech machining facility",
                image: "🏭",
                skill: "mechanics",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // COOKING STATIONS
            campfire: {
                name: "Campfire",
                description: "A simple fire for basic cooking",
                image: "🔥",
                skill: "cooking",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            fieldKitchen: {
                name: "Field Kitchen",
                description: "A portable cooking station",
                image: "🍳",
                skill: "cooking",
                skillLevel: 10,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            fullKitchen: {
                name: "Full Kitchen",
                description: "A fully equipped professional kitchen",
                image: "👨‍🍳",
                skill: "cooking",
                skillLevel: 25,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // CHEMISTRY STATIONS
            chemTable: {
                name: "Chemistry Table",
                description: "Basic chemistry equipment",
                image: "🧪",
                skill: "chemistry",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            chemLab: {
                name: "Chemistry Lab",
                description: "Advanced chemical synthesis facility",
                image: "⚗️",
                skill: "chemistry",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            researchLab: {
                name: "Research Lab",
                description: "State-of-the-art research facility",
                image: "🔬",
                skill: "chemistry",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // TEXTILES STATIONS
            sewingKit: {
                name: "Sewing Kit",
                description: "Basic sewing and textile tools",
                image: "🧵",
                skill: "textiles",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            tailorShop: {
                name: "Tailor Shop",
                description: "Professional textile crafting station",
                image: "🪡",
                skill: "textiles",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            fabricMill: {
                name: "Fabric Mill",
                description: "Industrial textile production facility",
                image: "🏭",
                skill: "textiles",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            },

            // ENGINEERING STATIONS
            engineeringDesk: {
                name: "Engineering Desk",
                description: "Basic engineering and design station",
                image: "📐",
                skill: "engineering",
                skillLevel: 1,
                availableIn: ["startingPlains", "darkForest"],
                requiresDiscovery: true
            },
            techBench: {
                name: "Tech Bench",
                description: "Advanced electronics and tech workspace",
                image: "💻",
                skill: "engineering",
                skillLevel: 15,
                availableIn: ["darkForest", "mountainPass"],
                requiresDiscovery: true
            },
            innovationCenter: {
                name: "Innovation Center",
                description: "Cutting-edge R&D facility",
                image: "🏢",
                skill: "engineering",
                skillLevel: 30,
                availableIn: ["mountainPass"],
                requiresDiscovery: true
            }
        },

        // Generator definitions
        generators: {
            miner: {
                name: "Miner",
                description: "Mines ore automatically",
                // Base production per second at level 1
                baseProduction: 1,
                // Resource produced
                produces: "ore",
                // Cost formula: baseCost * (costMultiplier ^ level)
                baseCost: 10,
                costMultiplier: 1.15,
                costResource: "gold"
            },
            lumberjack: {
                name: "Lumberjack",
                description: "Chops wood automatically",
                baseProduction: 1,
                produces: "wood",
                baseCost: 10,
                costMultiplier: 1.15,
                costResource: "gold"
            },
            merchant: {
                name: "Merchant",
                description: "Generates gold automatically",
                baseProduction: 0.5,
                produces: "gold",
                baseCost: 50,
                costMultiplier: 1.2,
                costResource: "gold",
                unlockRequirement: { gold: 25 }
            }
        },

        // Upgrade definitions
        upgrades: {
            goldBoost1: {
                name: "Basic Commerce",
                description: "Increases gold generation",
                // Effect formula: each level adds +10% to gold generation
                effectPerLevel: 0.1,
                affectsResource: "gold",
                maxLevel: 10,
                // Cost formula: baseCost * (costMultiplier ^ level)
                baseCost: 25,
                costMultiplier: 1.5,
                costResource: "gold"
            },
            goldBoost2: {
                name: "Advanced Trading",
                description: "Further increases gold generation",
                effectPerLevel: 0.15,
                affectsResource: "gold",
                maxLevel: 10,
                baseCost: 500,
                costMultiplier: 1.8,
                costResource: "gold",
                unlockRequirement: { goldBoost1: 5 } // Requires first upgrade at level 5
            },
            miningEfficiency: {
                name: "Mining Efficiency",
                description: "Miners produce more ore",
                effectPerLevel: 0.2,
                affectsResource: "ore",
                maxLevel: 10,
                baseCost: 50,
                costMultiplier: 1.6,
                costResource: "ore"
            },
            loggingEfficiency: {
                name: "Logging Efficiency",
                description: "Lumberjacks produce more wood",
                effectPerLevel: 0.2,
                affectsResource: "wood",
                maxLevel: 10,
                baseCost: 50,
                costMultiplier: 1.6,
                costResource: "wood"
            },
            merchantSkill: {
                name: "Merchant Mastery",
                description: "Merchants generate significantly more gold",
                effectPerLevel: 0.25,
                affectsResource: "gold",
                maxLevel: 5,
                baseCost: 200,
                costMultiplier: 2.0,
                costResource: "gold",
                unlockRequirement: { gold: 100, merchant: 3 }
            }
        },

        // Legacy mission definitions (will be migrated to MissionRegistry)
        // DO NOT ACCESS DIRECTLY - use GameDefinitions.missions instead
        _legacyMissions: {
            "tutorial_elder": {
                id: "tutorial_elder",
                name: "Speak with the Elder",
                description: "An elder has asked to speak with you. They may have valuable knowledge about surviving in these lands.",

                // Metadata
                metadata: {
                    region: "region_-10_0",  // Must be in starting region
                    category: "tutorial",
                    difficulty: 1,  // 1-10 scale
                    estimatedTime: 30,  // seconds
                    repeatable: false,
                    cooldown: 0,  // seconds between repeats (if repeatable)
                    chain: "tutorial_chain",  // Mission chain ID
                    chainOrder: 1,  // Order in chain
                    unlocks: ["tutorial_gather_resources"]  // Missions unlocked upon completion
                },

                // Requirements to start mission
                requirements: {
                    skills: {},  // e.g., { mining: 5, combat: 10 }
                    characterLevel: 0,
                    completedMissions: [],  // e.g., ["tutorial_elder"]
                    items: {}  // e.g., { stone_pickaxe: 1 }
                },

                // Mission objectives (supports multiple types)
                objectives: [
                    {
                        id: "talk_elder",
                        type: "talk",  // Type: talk, kill, collect, skill, craft, donate, explore
                        target: "elder",
                        description: "Speak with the Elder",
                        required: 1,
                        // Progress tracked separately in mission state
                    }
                ],

                // Rewards (can be scaled based on performance)
                rewards: {
                    base: {
                        exp: {
                            navigation: 50,
                            mining: 25,
                            logging: 25,
                            fishing: 25,
                            hunting: 25,
                            foraging: 25
                        },
                        items: [
                            { itemId: "stone_pickaxe", amount: 1 },
                            { itemId: "stone_hatchet", amount: 1 },
                            { itemId: "fishing_net", amount: 1 },
                            { itemId: "shortBow", amount: 1 },
                            { itemId: "wickerBasket", amount: 1 }
                        ],
                        currencies: {
                            gold: 25
                        }
                    },
                    // Optional bonus rewards for fast/perfect completion
                    bonus: {
                        condition: "time_under_60",  // Complete in under 60s
                        exp: { navigation: 25 },
                        currencies: { gold: 10 }
                    }
                },

                // Dialog
                dialog: {
                    npc: "Elder",
                    npcIcon: "👴",
                    intro: "Ah, welcome traveler! I am the Elder of this village. I've been watching you explore our lands.",
                    body: "These lands are rich with resources, but dangerous too. You'll need proper tools and knowledge to survive. Let me give you some basic equipment to get you started.\n\nMining allows you to gather ores from rocky nodes. Logging helps you collect wood from trees. Fishing lets you catch fish from water. Hunting enables you to track and take down animals. Foraging is for gathering plants, herbs, and mushrooms.\n\nEach skill will grow stronger as you practice it. Master these skills, and you'll thrive in these lands. But remember - you cannot leave this region until you've learned the basics from me.",
                    completion: "Take these tools and put them to good use. Return to me when you've gained some experience - I may have more tasks for you."
                }
            },

            "tutorial_gather_resources": {
                id: "tutorial_gather_resources",
                name: "Gather Basic Resources",
                description: "Use your new tools to gather some basic resources. Collect ore from rocks and wood from trees.",

                metadata: {
                    region: "region_-10_0",
                    category: "tutorial",
                    difficulty: 2,
                    estimatedTime: 120,
                    repeatable: false,
                    cooldown: 0,
                    chain: "tutorial_chain",
                    chainOrder: 2,
                    unlocks: ["tutorial_first_craft"]
                },

                requirements: {
                    skills: {},
                    characterLevel: 0,
                    completedMissions: ["tutorial_elder"],
                    items: {}
                },

                objectives: [
                    {
                        id: "collect_ore",
                        type: "collect",
                        target: "copperOre",
                        description: "Collect Copper Ore",
                        required: 10
                    },
                    {
                        id: "collect_wood",
                        type: "collect",
                        target: "wood",
                        description: "Collect Wood Logs",
                        required: 10
                    },
                    {
                        id: "mine_nodes",
                        type: "skill",
                        target: "mining",
                        description: "Complete mining actions",
                        required: 5
                    }
                ],

                rewards: {
                    base: {
                        exp: {
                            mining: 100,
                            logging: 100
                        },
                        currencies: {
                            gold: 50
                        }
                    }
                },

                dialog: {
                    npc: "Elder",
                    npcIcon: "👴",
                    intro: "Good! You have the tools. Now let's see you put them to use.",
                    body: "Head out into the wilderness and gather some basic resources. Use your pickaxe to mine copper ore from rocky nodes, and your hatchet to chop wood from trees.\n\nThese raw materials are the foundation of crafting. You'll need them for everything from basic tools to advanced equipment.",
                    completion: "Excellent work! You're learning quickly. With these resources, you can craft even better equipment."
                }
            },

            "tutorial_first_craft": {
                id: "tutorial_first_craft",
                name: "Craft Your First Item",
                description: "Use your gathered materials to craft a copper bar at a furnace.",

                metadata: {
                    region: "region_-10_0",
                    category: "tutorial",
                    difficulty: 2,
                    estimatedTime: 90,
                    repeatable: false,
                    cooldown: 0,
                    chain: "tutorial_chain",
                    chainOrder: 3,
                    unlocks: ["daily_gather_ore"]
                },

                requirements: {
                    skills: {},
                    characterLevel: 0,
                    completedMissions: ["tutorial_gather_resources"],
                    items: {}
                },

                objectives: [
                    {
                        id: "explore_station",
                        type: "explore",
                        target: "furnace",
                        description: "Discover a Furnace",
                        required: 1
                    },
                    {
                        id: "craft_bars",
                        type: "craft",
                        target: "copper_bar",
                        description: "Craft Copper Bars",
                        required: 3
                    }
                ],

                rewards: {
                    base: {
                        exp: {
                            smithing: 150
                        },
                        items: [
                            { itemId: "iron_pickaxe", amount: 1 }
                        ],
                        currencies: {
                            gold: 75
                        }
                    }
                },

                dialog: {
                    npc: "Elder",
                    npcIcon: "👴",
                    intro: "Raw materials are useful, but crafted goods are where the real value lies.",
                    body: "Explore the region to find a furnace. Once you locate one, use it to smelt your copper ore into copper bars. Crafting is how you turn raw resources into valuable equipment and trade goods.",
                    completion: "Magnificent! You're now a capable gatherer and crafter. You have the skills to survive and thrive in these lands."
                }
            },

            "daily_gather_ore": {
                id: "daily_gather_ore",
                name: "Daily Mining Task",
                description: "A daily task to gather ore for the village.",

                metadata: {
                    region: "region_-10_0",
                    category: "daily",
                    difficulty: 3,
                    estimatedTime: 180,
                    repeatable: true,
                    cooldown: 86400,  // 24 hours
                    chain: null,
                    chainOrder: 0,
                    unlocks: []
                },

                requirements: {
                    skills: { mining: 3 },
                    characterLevel: 0,
                    completedMissions: ["tutorial_first_craft"],
                    items: {}
                },

                objectives: [
                    {
                        id: "gather_ore",
                        type: "collect",
                        target: "copper_ore",
                        description: "Gather Copper Ore",
                        required: 50
                    },
                    {
                        id: "gather_iron",
                        type: "collect",
                        target: "iron_ore",
                        description: "Gather Iron Ore",
                        required: 25
                    }
                ],

                rewards: {
                    base: {
                        exp: {
                            mining: 200
                        },
                        currencies: {
                            gold: 150,
                            tomes: 1
                        }
                    }
                },

                dialog: {
                    npc: "Village Miner",
                    npcIcon: "⛏️",
                    intro: "The village needs ore for our smiths. Can you help us out?",
                    body: "We're running low on copper and iron. If you can gather some for us, we'll make it worth your while. This is a daily task, so come back tomorrow if you want to help again.",
                    completion: "Perfect! The smiths will be pleased. Come back tomorrow for more work."
                }
            }
        },

        // =============================================================================
        // COMPREHENSIVE ITEM SYSTEM - Example Items
        // =============================================================================
        comprehensiveItems: {
            // RESOURCE ITEMS
            "pristine_iron_ore": {
                id: "pristine_iron_ore",
                name: "Pristine Iron Ore",
                description: "Exceptionally pure iron ore, perfect for high-quality crafting",
                icon: "⛏️",
                rarity: 3,
                stackSize: 200,
                value: 25,
                level: 10,
                bindType: "none",
                quality: 1.3,
                itemType: "resource",
                harvestSource: "mining",
                refinedInto: "steel_bar",
                baseYield: 2,
                qualityGrade: "exceptional"
            },

            "ancient_wood": {
                id: "ancient_wood",
                name: "Ancient Heartwood",
                description: "Wood from trees that have stood for centuries",
                icon: "🪵",
                rarity: 5,
                stackSize: 100,
                value: 150,
                level: 25,
                bindType: "none",
                quality: 1.0,
                itemType: "resource",
                harvestSource: "logging",
                refinedInto: "legendary_planks",
                baseYield: 1,
                qualityGrade: "masterwork",
                lore: "These trees remember the age before darkness."
            },

            // TOOL ITEMS
            "mythril_pickaxe": {
                id: "mythril_pickaxe",
                name: "Mythril Mining Pick",
                description: "A legendary pickaxe forged from mythril ore",
                icon: "⛏️",
                rarity: 6,
                stackSize: 1,
                value: 5000,
                level: 50,
                bindType: "equip",
                quality: 1.0,
                itemType: "tool",
                durability: 500,
                maxDurability: 500,
                efficiency: 2.5,
                skillType: "mining",
                tier: 6,
                repairCost: { gold: 1000, "mythril_ore": 5 },
                bonusYield: 25
            },

            // ARMOR ITEMS
            "titanium_plate_chest": {
                id: "titanium_plate_chest",
                name: "Titanium Plate Armor",
                description: "Exceptionally durable chest armor made from titanium plates",
                icon: "🛡️",
                rarity: 4,
                stackSize: 1,
                value: 3500,
                level: 35,
                bindType: "equip",
                quality: 1.0,
                itemType: "armor",
                defense: 120,
                resistance: {
                    physical: 15,
                    magic: 5,
                    fire: 10,
                    ice: 10,
                    lightning: 8,
                    poison: 5
                },
                slot: "chest",
                setBonus: "titanium_set",
                durability: 400,
                maxDurability: 400,
                socketSlots: 2,
                sockets: []
            },

            "mystic_hood": {
                id: "mystic_hood",
                name: "Mystic's Hood of Insight",
                description: "A magical hood that enhances the wearer's perception",
                icon: "🎩",
                rarity: 5,
                stackSize: 1,
                value: 4200,
                level: 40,
                bindType: "equip",
                quality: 1.0,
                itemType: "armor",
                defense: 45,
                resistance: {
                    physical: 2,
                    magic: 25,
                    fire: 5,
                    ice: 5,
                    lightning: 5,
                    poison: 10
                },
                slot: "head",
                setBonus: "mystic_set",
                durability: 250,
                maxDurability: 250,
                socketSlots: 1,
                sockets: []
            },

            // TECHNOLOGY ITEMS
            "auto_smelter": {
                id: "auto_smelter",
                name: "Automated Smelting Unit",
                description: "Advanced technology that automatically smelts ores",
                icon: "🏭",
                rarity: 4,
                stackSize: 1,
                value: 8000,
                level: 30,
                bindType: "none",
                quality: 1.0,
                itemType: "technology",
                powerConsumption: 50,
                effectRadius: 10,
                automation: "active",
                upgradePath: ["auto_smelter_mk2", "auto_smelter_mk3"],
                techLevel: 3,
                active: false,
                effects: [
                    { type: "autosmelt", rate: 10, description: "Smelts 10 ore per minute" }
                ]
            },

            "power_generator": {
                id: "power_generator",
                name: "Quantum Power Generator",
                description: "Generates power from quantum fluctuations",
                icon: "⚡",
                rarity: 6,
                stackSize: 1,
                value: 15000,
                level: 50,
                bindType: "none",
                quality: 1.0,
                itemType: "technology",
                powerConsumption: -100, // Negative = generates power
                effectRadius: 20,
                automation: "passive",
                upgradePath: ["fusion_generator"],
                techLevel: 5,
                active: false,
                effects: [
                    { type: "power_gen", rate: 100, description: "Generates 100W per second" }
                ]
            },

            // MOD ITEMS
            "crit_damage_mod": {
                id: "crit_damage_mod",
                name: "Gem of Critical Strikes",
                description: "Increases critical strike damage",
                icon: "💎",
                rarity: 3,
                stackSize: 10,
                value: 1500,
                level: 20,
                bindType: "none",
                quality: 1.0,
                itemType: "mod",
                targetSlot: "weapon",
                statModifiers: [
                    { stat: "critChance", value: 5, type: "flat" },
                    { stat: "damage", value: 10, type: "percent" }
                ],
                incompatibleWith: [],
                tier: 3,
                installed: false
            },

            "defense_enhancement": {
                id: "defense_enhancement",
                name: "Rune of Protection",
                description: "Enhances armor's defensive capabilities",
                icon: "🔷",
                rarity: 4,
                stackSize: 5,
                value: 2500,
                level: 30,
                bindType: "none",
                quality: 1.0,
                itemType: "mod",
                targetSlot: "armor",
                statModifiers: [
                    { stat: "defense", value: 20, type: "percent" },
                    { stat: "resistance.physical", value: 5, type: "flat" }
                ],
                incompatibleWith: [],
                tier: 4,
                installed: false
            },

            // HEALING ITEMS
            "greater_health_potion": {
                id: "greater_health_potion",
                name: "Greater Health Potion",
                description: "Instantly restores a large amount of health",
                icon: "🧪",
                rarity: 2,
                stackSize: 50,
                value: 100,
                level: 15,
                bindType: "none",
                quality: 1.0,
                itemType: "healing",
                healAmount: 500,
                healType: "instant",
                duration: 0,
                cooldown: 5000,
                combatUsable: true,
                resurrectPower: 0,
                lastUsed: 0
            },

            "phoenix_feather": {
                id: "phoenix_feather",
                name: "Phoenix Feather",
                description: "A magical feather with the power to revive the fallen",
                icon: "🪶",
                rarity: 7,
                stackSize: 5,
                value: 5000,
                level: 50,
                bindType: "none",
                quality: 1.0,
                itemType: "healing",
                healAmount: 1000,
                healType: "instant",
                duration: 0,
                cooldown: 0,
                combatUsable: true,
                resurrectPower: 100,
                lastUsed: 0,
                lore: "From the ashes, life returns."
            },

            // CONSUMABLE ITEMS
            "strength_elixir": {
                id: "strength_elixir",
                name: "Elixir of Titan's Strength",
                description: "Greatly increases physical power for a duration",
                icon: "⚗️",
                rarity: 3,
                stackSize: 20,
                value: 500,
                level: 25,
                bindType: "none",
                quality: 1.0,
                itemType: "consumable",
                duration: 600000, // 10 minutes
                effects: [
                    { stat: "damage", value: 25, type: "percent" },
                    { stat: "attackSpeed", value: 10, type: "percent" }
                ],
                consumeOnUse: true,
                buffType: "stat",
                debuffCleanse: false,
                stacks: false,
                category: "elixir"
            },

            "exp_boost_scroll": {
                id: "exp_boost_scroll",
                name: "Scroll of Rapid Learning",
                description: "Increases experience gain for all skills",
                icon: "📜",
                rarity: 4,
                stackSize: 10,
                value: 1000,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "consumable",
                duration: 3600000, // 1 hour
                effects: [
                    { stat: "exp_multiplier", value: 50, type: "percent" }
                ],
                consumeOnUse: true,
                buffType: "experience",
                debuffCleanse: false,
                stacks: true,
                category: "scroll"
            },

            // PERK ITEMS
            "master_miner_perk": {
                id: "master_miner_perk",
                name: "Master Miner",
                description: "Unlock the secrets of efficient mining",
                icon: "⛏️",
                rarity: 4,
                stackSize: 1,
                value: 0,
                level: 30,
                bindType: "pickup",
                quality: 1.0,
                itemType: "perk",
                perkType: "passive",
                powerMultiplier: 1.5,
                gridCompatible: true,
                slotCount: 2,
                synergyTags: ["mining", "gathering", "efficiency"],
                requirements: {
                    level: 30,
                    skills: { mining: 50 }
                },
                effects: [
                    { type: "mining_speed", value: 25, description: "+25% mining speed" },
                    { type: "ore_yield", value: 15, description: "+15% ore yield" }
                ],
                tradeable: false
            },

            "combat_veteran_perk": {
                id: "combat_veteran_perk",
                name: "Combat Veteran",
                description: "Years of battle have honed your combat prowess",
                icon: "⚔️",
                rarity: 5,
                stackSize: 1,
                value: 0,
                level: 40,
                bindType: "pickup",
                quality: 1.0,
                itemType: "perk",
                perkType: "passive",
                powerMultiplier: 2.0,
                gridCompatible: true,
                slotCount: 3,
                synergyTags: ["combat", "damage", "survival"],
                requirements: {
                    level: 40,
                    skills: { combat: 60 }
                },
                effects: [
                    { type: "damage", value: 20, description: "+20% damage" },
                    { type: "crit_chance", value: 10, description: "+10% crit chance" },
                    { type: "max_health", value: 15, description: "+15% max health" }
                ],
                tradeable: false
            },

            // QUEST ITEMS
            "elder_amulet": {
                id: "elder_amulet",
                name: "Elder's Amulet",
                description: "An ancient amulet given to you by the village elder",
                icon: "📿",
                rarity: 3,
                stackSize: 1,
                value: 0,
                level: 1,
                bindType: "pickup",
                quality: 1.0,
                itemType: "quest",
                questId: "tutorial_elder",
                progression: 0,
                tradeable: false,
                destructible: false,
                droppable: false,
                lore: "This amulet has been passed down through generations of village elders.",
                unique: true
            },

            "dragon_scale_fragment": {
                id: "dragon_scale_fragment",
                name: "Fragment of Dragon Scale",
                description: "A piece of a dragon's scale, pulsing with residual magic",
                icon: "🐉",
                rarity: 8,
                stackSize: 1,
                value: 0,
                level: 75,
                bindType: "pickup",
                quality: 1.0,
                itemType: "quest",
                questId: "dragon_hunt_chain",
                progression: 33,
                tradeable: false,
                destructible: false,
                droppable: false,
                lore: "The scale thrums with ancient power. Three fragments are needed to forge the legendary Dragon Aegis.",
                unique: false // Can have multiple fragments
            },

            // =============================================================================
            // LOW LEVEL MODERN ITEMS (Level 1-5)
            // =============================================================================

            // RESOURCES (Modern, Low Level)
            "scrap_metal": {
                id: "scrap_metal",
                name: "Scrap Metal",
                description: "Salvaged metal scraps from discarded machinery",
                icon: "🔩",
                rarity: 1,
                stackSize: 500,
                value: 2,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "resource",
                harvestSource: "salvaging",
                refinedInto: "metal_ingot",
                baseYield: 1,
                qualityGrade: "poor",
                lore: "One person's trash is another's treasure."
            },

            "plastic_bits": {
                id: "plastic_bits",
                name: "Plastic Fragments",
                description: "Broken pieces of plastic from various sources",
                icon: "🧩",
                rarity: 1,
                stackSize: 500,
                value: 1,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "resource",
                harvestSource: "salvaging",
                refinedInto: "plastic_sheet",
                baseYield: 1,
                qualityGrade: "poor"
            },

            "wire_scraps": {
                id: "wire_scraps",
                name: "Copper Wiring",
                description: "Stripped copper wire from electronics",
                icon: "📎",
                rarity: 2,
                stackSize: 300,
                value: 5,
                level: 2,
                bindType: "none",
                quality: 1.0,
                itemType: "resource",
                harvestSource: "electronics",
                refinedInto: "copper_coil",
                baseYield: 2,
                qualityGrade: "standard"
            },

            // TOOLS (Modern, Low Level)
            "basic_wrench": {
                id: "basic_wrench",
                name: "Adjustable Wrench",
                description: "A simple wrench for basic mechanical work",
                icon: "🔧",
                rarity: 1,
                stackSize: 1,
                value: 25,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "tool",
                durability: 80,
                maxDurability: 80,
                efficiency: 0.8,
                skillType: "engineering",
                tier: 1,
                repairCost: { gold: 10, scrap_metal: 2 },
                bonusYield: 5
            },

            "plastic_hammer": {
                id: "plastic_hammer",
                name: "Plastic Mallet",
                description: "A lightweight hammer made from reinforced plastic",
                icon: "🔨",
                rarity: 1,
                stackSize: 1,
                value: 20,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "tool",
                durability: 60,
                maxDurability: 60,
                efficiency: 0.7,
                skillType: "crafting",
                tier: 1,
                repairCost: { gold: 8, plastic_bits: 5 },
                bonusYield: 3
            },

            "wire_cutters": {
                id: "wire_cutters",
                name: "Wire Cutters",
                description: "Essential tool for cutting and stripping wires",
                icon: "✂️",
                rarity: 2,
                stackSize: 1,
                value: 35,
                level: 3,
                bindType: "none",
                quality: 1.0,
                itemType: "tool",
                durability: 100,
                maxDurability: 100,
                efficiency: 1.0,
                skillType: "electronics",
                tier: 2,
                repairCost: { gold: 15, wire_scraps: 3 },
                bonusYield: 8
            },

            // ARMOR (Modern, Low Level)
            "leather_jacket": {
                id: "leather_jacket",
                name: "Worn Leather Jacket",
                description: "A tough leather jacket offering basic protection",
                icon: "🧥",
                rarity: 1,
                stackSize: 1,
                value: 50,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "armor",
                defense: 8,
                resistance: {
                    physical: 5,
                    magic: 0,
                    fire: 2,
                    ice: 3,
                    lightning: 0,
                    poison: 1
                },
                slot: "chest",
                setBonus: null,
                durability: 80,
                maxDurability: 80,
                socketSlots: 0,
                sockets: []
            },

            "work_boots": {
                id: "work_boots",
                name: "Steel-Toed Boots",
                description: "Heavy-duty work boots with reinforced toes",
                icon: "🥾",
                rarity: 1,
                stackSize: 1,
                value: 35,
                level: 2,
                bindType: "none",
                quality: 1.0,
                itemType: "armor",
                defense: 5,
                resistance: {
                    physical: 3,
                    magic: 0,
                    fire: 1,
                    ice: 2,
                    lightning: 1,
                    poison: 0
                },
                slot: "feet",
                setBonus: null,
                durability: 100,
                maxDurability: 100,
                socketSlots: 0,
                sockets: []
            },

            "safety_goggles": {
                id: "safety_goggles",
                name: "Safety Goggles",
                description: "Protective eyewear for hazardous environments",
                icon: "🥽",
                rarity: 1,
                stackSize: 1,
                value: 25,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "armor",
                defense: 3,
                resistance: {
                    physical: 1,
                    magic: 0,
                    fire: 2,
                    ice: 0,
                    lightning: 3,
                    poison: 4
                },
                slot: "head",
                setBonus: null,
                durability: 60,
                maxDurability: 60,
                socketSlots: 0,
                sockets: []
            },

            // TECHNOLOGY (Modern, Low Level)
            "flashlight": {
                id: "flashlight",
                name: "LED Flashlight",
                description: "A basic battery-powered flashlight for dark areas",
                icon: "🔦",
                rarity: 1,
                stackSize: 1,
                value: 15,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "technology",
                powerConsumption: 2,
                effectRadius: 5,
                automation: "active",
                upgradePath: ["tactical_flashlight"],
                techLevel: 1,
                active: false,
                effects: [
                    { type: "illumination", rate: 100, description: "Lights up dark areas" }
                ]
            },

            "battery_pack": {
                id: "battery_pack",
                name: "Rechargeable Battery Pack",
                description: "A small battery unit for powering devices",
                icon: "🔋",
                rarity: 2,
                stackSize: 1,
                value: 30,
                level: 2,
                bindType: "none",
                quality: 1.0,
                itemType: "technology",
                powerConsumption: -5, // Generates power
                effectRadius: 3,
                automation: "passive",
                upgradePath: ["advanced_battery"],
                techLevel: 1,
                active: false,
                effects: [
                    { type: "power_storage", rate: 5, description: "Stores 5W of power" }
                ]
            },

            "radio_receiver": {
                id: "radio_receiver",
                name: "Portable Radio",
                description: "A handheld radio for communication and intel gathering",
                icon: "📻",
                rarity: 2,
                stackSize: 1,
                value: 50,
                level: 3,
                bindType: "none",
                quality: 1.0,
                itemType: "technology",
                powerConsumption: 3,
                effectRadius: 15,
                automation: "active",
                upgradePath: ["tactical_radio"],
                techLevel: 2,
                active: false,
                effects: [
                    { type: "communication", rate: 1, description: "Receive transmissions" }
                ]
            },

            // HEALING ITEMS (Modern, Low Level)
            "first_aid_kit": {
                id: "first_aid_kit",
                name: "Basic First Aid Kit",
                description: "Contains bandages, antiseptic, and basic medical supplies",
                icon: "🩹",
                rarity: 1,
                stackSize: 20,
                value: 25,
                level: 2,
                bindType: "none",
                quality: 1.0,
                itemType: "healing",
                healAmount: 50,
                healType: "instant",
                duration: 0,
                cooldown: 3000,
                combatUsable: true,
                resurrectPower: 0,
                lastUsed: 0
            },

            "bandage_roll": {
                id: "bandage_roll",
                name: "Bandage Roll",
                description: "Simple cloth bandages for treating minor wounds",
                icon: "🏥",
                rarity: 1,
                stackSize: 50,
                value: 10,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "healing",
                healAmount: 20,
                healType: "overtime",
                duration: 10000,
                cooldown: 1000,
                combatUsable: true,
                resurrectPower: 0,
                lastUsed: 0
            },

            "pain_killers": {
                id: "pain_killers",
                name: "Pain Medication",
                description: "Over-the-counter pain relief pills",
                icon: "💊",
                rarity: 1,
                stackSize: 30,
                value: 15,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "healing",
                healAmount: 30,
                healType: "overtime",
                duration: 15000,
                cooldown: 2000,
                combatUsable: false,
                resurrectPower: 0,
                lastUsed: 0
            },

            // CONSUMABLE ITEMS (Modern, Low Level)
            "energy_drink": {
                id: "energy_drink",
                name: "Energy Drink",
                description: "A caffeinated beverage that boosts alertness temporarily",
                icon: "🥤",
                rarity: 1,
                stackSize: 20,
                value: 12,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "consumable",
                duration: 180000, // 3 minutes
                effects: [
                    { stat: "attackSpeed", value: 10, type: "percent" },
                    { stat: "efficiency", value: 8, type: "percent" }
                ],
                consumeOnUse: true,
                buffType: "stat",
                debuffCleanse: false,
                stacks: false,
                category: "food"
            },

            "protein_bar": {
                id: "protein_bar",
                name: "Protein Bar",
                description: "A nutrient-packed energy bar for sustained performance",
                icon: "🍫",
                rarity: 1,
                stackSize: 30,
                value: 8,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "consumable",
                duration: 300000, // 5 minutes
                effects: [
                    { stat: "max_health", value: 5, type: "percent" },
                    { stat: "defense", value: 3, type: "flat" }
                ],
                consumeOnUse: true,
                buffType: "stat",
                debuffCleanse: false,
                stacks: false,
                category: "food"
            },

            "water_bottle": {
                id: "water_bottle",
                name: "Bottled Water",
                description: "Clean drinking water essential for survival",
                icon: "💧",
                rarity: 1,
                stackSize: 40,
                value: 5,
                level: 1,
                bindType: "none",
                quality: 1.0,
                itemType: "consumable",
                duration: 120000, // 2 minutes
                effects: [
                    { stat: "stamina_regen", value: 15, type: "percent" }
                ],
                consumeOnUse: true,
                buffType: "stat",
                debuffCleanse: true,
                stacks: false,
                category: "potion"
            },

            // PERK ITEMS (Modern, Low Level)
            "scavenger_basics": {
                id: "scavenger_basics",
                name: "Scavenger's Eye",
                description: "Learn to spot valuable materials in the junk",
                icon: "👁️",
                rarity: 2,
                stackSize: 1,
                value: 0,
                level: 3,
                bindType: "pickup",
                quality: 1.0,
                itemType: "perk",
                perkType: "passive",
                powerMultiplier: 1.2,
                gridCompatible: true,
                slotCount: 1,
                synergyTags: ["salvaging", "looting", "resourcefulness"],
                requirements: {
                    level: 3
                },
                effects: [
                    { type: "loot_quality", value: 10, description: "+10% better loot quality" },
                    { type: "salvage_yield", value: 15, description: "+15% salvage yield" }
                ],
                tradeable: false
            },

            "quick_hands": {
                id: "quick_hands",
                name: "Quick Hands",
                description: "Increased dexterity and crafting speed",
                icon: "✋",
                rarity: 1,
                stackSize: 1,
                value: 0,
                level: 2,
                bindType: "pickup",
                quality: 1.0,
                itemType: "perk",
                perkType: "passive",
                powerMultiplier: 1.1,
                gridCompatible: true,
                slotCount: 1,
                synergyTags: ["crafting", "speed", "dexterity"],
                requirements: {
                    level: 2
                },
                effects: [
                    { type: "craft_speed", value: 12, description: "+12% crafting speed" },
                    { type: "tool_durability", value: 8, description: "+8% tool durability usage" }
                ],
                tradeable: false
            },

            "survivalist": {
                id: "survivalist",
                name: "Survivalist",
                description: "Basic survival training for harsh environments",
                icon: "🏕️",
                rarity: 2,
                stackSize: 1,
                value: 0,
                level: 5,
                bindType: "pickup",
                quality: 1.0,
                itemType: "perk",
                perkType: "passive",
                powerMultiplier: 1.15,
                gridCompatible: true,
                slotCount: 2,
                synergyTags: ["survival", "health", "resistance"],
                requirements: {
                    level: 5
                },
                effects: [
                    { type: "max_health", value: 10, description: "+10% max health" },
                    { type: "healing_effectiveness", value: 15, description: "+15% healing effectiveness" },
                    { type: "poison_resistance", value: 5, description: "+5% poison resistance" }
                ],
                tradeable: false
            },

            // QUEST ITEMS (Modern, Low Level)
            "old_photo": {
                id: "old_photo",
                name: "Faded Photograph",
                description: "An old photograph of people you don't recognize",
                icon: "📷",
                rarity: 2,
                stackSize: 1,
                value: 0,
                level: 1,
                bindType: "pickup",
                quality: 1.0,
                itemType: "quest",
                questId: "find_the_truth",
                progression: 0,
                tradeable: false,
                destructible: false,
                droppable: false,
                lore: "The faces in this photo hold secrets from before the collapse.",
                unique: true
            },

            "keycard_red": {
                id: "keycard_red",
                name: "Red Security Keycard",
                description: "A keycard for accessing restricted areas",
                icon: "🔴",
                rarity: 3,
                stackSize: 1,
                value: 0,
                level: 4,
                bindType: "pickup",
                quality: 1.0,
                itemType: "quest",
                questId: "facility_access",
                progression: 0,
                tradeable: false,
                destructible: false,
                droppable: false,
                lore: "Level 3 clearance required. Handle with care.",
                unique: true
            },

            "broken_phone": {
                id: "broken_phone",
                name: "Damaged Smartphone",
                description: "A cracked phone that might still have recoverable data",
                icon: "📱",
                rarity: 2,
                stackSize: 1,
                value: 0,
                level: 2,
                bindType: "pickup",
                quality: 1.0,
                itemType: "quest",
                questId: "data_recovery",
                progression: 0,
                tradeable: false,
                destructible: false,
                droppable: false,
                lore: "The screen is shattered, but the memory chip might be intact.",
                unique: true
            }
        },

        // =============================================================================
        // ENGINEERING TECHNOLOGIES
        // Tech tree nodes that are researched to unlock recipes and capabilities
        // =============================================================================
        // =========================================================================
        // ENGINEERING TECHNOLOGY TREE - 16 Fields × 6 Tiers = 96 Total Nodes
        // Each field progresses independently (Tier 0-5)
        // =========================================================================
        engineeringFields: {
            electronics: {
                name: 'Electronics',
                icon: '⚡',
                description: 'Circuit design and electronic systems',
                tiers: [
                    { id: 'circuit_components', name: 'Circuit Components', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Basic circuit crafting'] },
                    { id: 'circuit_design', name: 'Circuit Design', tier: 1, engLevel: 10, cost: { tomes: 3, copperOre: 20 }, xp: 200, time: 60000, unlocks: ['Intermediate circuits'] },
                    { id: 'analog_circuits', name: 'Analog Circuits', tier: 2, engLevel: 25, cost: { tomes: 8, gold: 100 }, xp: 500, time: 120000, unlocks: ['Analog devices'] },
                    { id: 'digital_circuits', name: 'Digital Circuits', tier: 3, engLevel: 45, cost: { tomes: 20, silicon: 30 }, xp: 1200, time: 300000, unlocks: ['Digital computing'] },
                    { id: 'integrated_circuits', name: 'Integrated Circuits', tier: 4, engLevel: 65, cost: { tomes: 50, rareMetals: 20 }, xp: 3000, time: 600000, unlocks: ['Microprocessors'] },
                    { id: 'quantum_circuits', name: 'Quantum Circuits', tier: 5, engLevel: 85, cost: { tomes: 100, quantumSubstrate: 10 }, xp: 7500, time: 1200000, unlocks: ['Quantum computers'] }
                ]
            },

            ballistics: {
                name: 'Ballistics',
                icon: '🎯',
                description: 'Projectile physics and weapon accuracy',
                tiers: [
                    { id: 'projectile_motion', name: 'Projectile Motion', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['+5% projectile accuracy'] },
                    { id: 'rifling', name: 'Rifling', tier: 1, engLevel: 10, cost: { tomes: 3, ironOre: 15 }, xp: 200, time: 60000, unlocks: ['+15% projectile accuracy'] },
                    { id: 'terminal_ballistics', name: 'Terminal Ballistics', tier: 2, engLevel: 25, cost: { tomes: 8, steelIngot: 20 }, xp: 500, time: 120000, unlocks: ['+10% damage'] },
                    { id: 'armored_penetration', name: 'Armored Penetration', tier: 3, engLevel: 45, cost: { tomes: 20, tungsten: 15 }, xp: 1200, time: 300000, unlocks: ['Armor piercing rounds'] },
                    { id: 'elemental_munitions', name: 'Elemental Munitions', tier: 4, engLevel: 65, cost: { tomes: 50, elementalCore: 10 }, xp: 3000, time: 600000, unlocks: ['Elemental ammo crafting'] },
                    { id: 'astro_ballistics', name: 'Astro-Ballistics', tier: 5, engLevel: 85, cost: { tomes: 100, voidEssence: 5 }, xp: 7500, time: 1200000, unlocks: ['Gravity-manipulating projectiles'] }
                ]
            },

            ordnance: {
                name: 'Ordnance',
                icon: '💣',
                description: 'Explosives and demolition',
                tiers: [
                    { id: 'basic_explosives', name: 'Basic Explosives', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Explosive crafting'] },
                    { id: 'explosive_formulations', name: 'Explosive Formulations', tier: 1, engLevel: 10, cost: { tomes: 3, sulfur: 25 }, xp: 200, time: 60000, unlocks: ['Improved explosives'] },
                    { id: 'demolitions', name: 'Demolitions', tier: 2, engLevel: 25, cost: { tomes: 8, nitrate: 30 }, xp: 500, time: 120000, unlocks: ['Shaped charges'] },
                    { id: 'advanced_explosives', name: 'Advanced Explosives', tier: 3, engLevel: 45, cost: { tomes: 20, plasticExplosive: 20 }, xp: 1200, time: 300000, unlocks: ['C4 crafting'] },
                    { id: 'structure_weakness', name: 'Structure Weakness', tier: 4, engLevel: 65, cost: { tomes: 50, resonanceCrystals: 15 }, xp: 3000, time: 600000, unlocks: ['Resonance explosives'] },
                    { id: 'smart_munitions', name: 'Smart Munitions', tier: 5, engLevel: 85, cost: { tomes: 100, aiCore: 5 }, xp: 7500, time: 1200000, unlocks: ['Guided explosives'] }
                ]
            },

            mechanical: {
                name: 'Mechanical',
                icon: '⚙️',
                description: 'Mechanisms and automation',
                tiers: [
                    { id: 'simple_machines', name: 'Simple Machines', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Basic machine crafting'] },
                    { id: 'gearing', name: 'Gearing', tier: 1, engLevel: 10, cost: { tomes: 3, ironOre: 20 }, xp: 200, time: 60000, unlocks: ['Gear systems'] },
                    { id: 'mechanical_efficiency', name: 'Mechanical Efficiency', tier: 2, engLevel: 25, cost: { tomes: 8, steelIngot: 25 }, xp: 500, time: 120000, unlocks: ['+20% machine speed'] },
                    { id: 'automation_systems', name: 'Automation', tier: 3, engLevel: 45, cost: { tomes: 20, servo: 30 }, xp: 1200, time: 300000, unlocks: ['Auto-crafting queues'] },
                    { id: 'optimization', name: 'Optimization', tier: 4, engLevel: 65, cost: { tomes: 50, precisionTools: 20 }, xp: 3000, time: 600000, unlocks: ['+50% efficiency'] },
                    { id: 'ai_robotics', name: 'AI Robotics', tier: 5, engLevel: 85, cost: { tomes: 100, neuralProcessor: 10 }, xp: 7500, time: 1200000, unlocks: ['Autonomous systems'] }
                ]
            },

            energy_systems: {
                name: 'Energy Systems',
                icon: '🔋',
                description: 'Power generation and storage',
                tiers: [
                    { id: 'alkaline_battery', name: 'Alkaline Battery', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Battery crafting'] },
                    { id: 'solid_state', name: 'Solid State', tier: 1, engLevel: 10, cost: { tomes: 3, lithium: 15 }, xp: 200, time: 60000, unlocks: ['Lithium batteries'] },
                    { id: 'combustion', name: 'Combustion', tier: 2, engLevel: 25, cost: { tomes: 8, oil: 40 }, xp: 500, time: 120000, unlocks: ['Combustion engines'] },
                    { id: 'nuclear_power', name: 'Nuclear Power', tier: 3, engLevel: 45, cost: { tomes: 20, uranium: 10 }, xp: 1200, time: 300000, unlocks: ['Nuclear reactors'] },
                    { id: 'fuel_cells', name: 'Fuel Cells', tier: 4, engLevel: 65, cost: { tomes: 50, hydrogen: 50 }, xp: 3000, time: 600000, unlocks: ['Hydrogen power'] },
                    { id: 'quantum_energy', name: 'Quantum Energy', tier: 5, engLevel: 85, cost: { tomes: 100, zeroPointModule: 5 }, xp: 7500, time: 1200000, unlocks: ['Zero-point energy'] }
                ]
            },

            thermodynamics: {
                name: 'Thermodynamics',
                icon: '🌡️',
                description: 'Heat transfer and thermal systems',
                tiers: [
                    { id: 'water_phases', name: 'Water Phases', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Basic thermal control'] },
                    { id: 'thermo_cycles', name: 'Thermo Cycles', tier: 1, engLevel: 10, cost: { tomes: 3, ice: 20 }, xp: 200, time: 60000, unlocks: ['Heat engines'] },
                    { id: 'heat_engines', name: 'Heat Engines', tier: 2, engLevel: 25, cost: { tomes: 8, steelIngot: 30 }, xp: 500, time: 120000, unlocks: ['Steam power'] },
                    { id: 'refrigeration', name: 'Refrigeration', tier: 3, engLevel: 45, cost: { tomes: 20, coolant: 25 }, xp: 1200, time: 300000, unlocks: ['Cryogenic systems'] },
                    { id: 'advanced_thermal', name: 'Advanced Thermal', tier: 4, engLevel: 65, cost: { tomes: 50, superconductor: 15 }, xp: 3000, time: 600000, unlocks: ['Superconducting systems'] },
                    { id: 'quantum_thermo', name: 'Quantum Thermo', tier: 5, engLevel: 85, cost: { tomes: 100, entropyCrystal: 8 }, xp: 7500, time: 1200000, unlocks: ['Entropy manipulation'] }
                ]
            },

            materials: {
                name: 'Materials',
                icon: '🔬',
                description: 'Material science and alloys',
                tiers: [
                    { id: 'basic_alloys', name: 'Basic Alloys', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Bronze/Steel crafting'] },
                    { id: 'material_properties', name: 'Material Properties', tier: 1, engLevel: 10, cost: { tomes: 3, copperOre: 25 }, xp: 200, time: 60000, unlocks: ['Material analysis'] },
                    { id: 'advanced_alloys', name: 'Advanced Alloys', tier: 2, engLevel: 25, cost: { tomes: 8, titanium: 20 }, xp: 500, time: 120000, unlocks: ['Titanium alloys'] },
                    { id: 'composites', name: 'Composites', tier: 3, engLevel: 45, cost: { tomes: 20, carbonFiber: 15 }, xp: 1200, time: 300000, unlocks: ['Composite materials'] },
                    { id: 'nanomaterials', name: 'Nanomaterials', tier: 4, engLevel: 65, cost: { tomes: 50, nanotubes: 10 }, xp: 3000, time: 600000, unlocks: ['Nanotech crafting'] },
                    { id: 'exotic_matter', name: 'Exotic Matter', tier: 5, engLevel: 85, cost: { tomes: 100, strangematter: 5 }, xp: 7500, time: 1200000, unlocks: ['Strange matter manipulation'] }
                ]
            },

            chemistry: {
                name: 'Chemistry',
                icon: '⚗️',
                description: 'Chemical processes and synthesis',
                tiers: [
                    { id: 'basic_chemistry', name: 'Basic Chemistry', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Basic chemicals'] },
                    { id: 'organic_chemistry', name: 'Organic Chemistry', tier: 1, engLevel: 10, cost: { tomes: 3, biomass: 30 }, xp: 200, time: 60000, unlocks: ['Organic synthesis'] },
                    { id: 'polymer_science', name: 'Polymer Science', tier: 2, engLevel: 25, cost: { tomes: 8, plastic: 40 }, xp: 500, time: 120000, unlocks: ['Polymer crafting'] },
                    { id: 'biochemistry', name: 'Biochemistry', tier: 3, engLevel: 45, cost: { tomes: 20, enzyme: 20 }, xp: 1200, time: 300000, unlocks: ['Biochemical synthesis'] },
                    { id: 'pharmacology', name: 'Pharmacology', tier: 4, engLevel: 65, cost: { tomes: 50, compound: 15 }, xp: 3000, time: 600000, unlocks: ['Advanced medicine'] },
                    { id: 'molecular_engineering', name: 'Molecular Eng', tier: 5, engLevel: 85, cost: { tomes: 100, molecularTemplate: 8 }, xp: 7500, time: 1200000, unlocks: ['Molecular assembly'] }
                ]
            },

            programming: {
                name: 'Programming',
                icon: '💻',
                description: 'Software and algorithms',
                tiers: [
                    { id: 'basic_coding', name: 'Basic Coding', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Simple scripts'] },
                    { id: 'algorithms', name: 'Algorithms', tier: 1, engLevel: 10, cost: { tomes: 3, dataChip: 10 }, xp: 200, time: 60000, unlocks: ['Algorithm optimization'] },
                    { id: 'data_structures', name: 'Data Structures', tier: 2, engLevel: 25, cost: { tomes: 8, memory: 15 }, xp: 500, time: 120000, unlocks: ['Advanced data handling'] },
                    { id: 'machine_learning', name: 'Machine Learning', tier: 3, engLevel: 45, cost: { tomes: 20, neuralNet: 10 }, xp: 1200, time: 300000, unlocks: ['Research queues'] },
                    { id: 'ai_systems', name: 'AI Systems', tier: 4, engLevel: 65, cost: { tomes: 50, aiCore: 8 }, xp: 3000, time: 600000, unlocks: ['Artificial intelligence'] },
                    { id: 'agi', name: 'AGI', tier: 5, engLevel: 85, cost: { tomes: 100, consciousnessMatrix: 5 }, xp: 7500, time: 1200000, unlocks: ['Artificial general intelligence'] }
                ]
            },

            electromagnetics: {
                name: 'Electromagnetics',
                icon: '🧲',
                description: 'Magnetic fields and EM waves',
                tiers: [
                    { id: 'basic_magnetism', name: 'Basic Magnetism', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Magnets'] },
                    { id: 'electromagnetism', name: 'Electromagnetism', tier: 1, engLevel: 10, cost: { tomes: 3, ironOre: 30 }, xp: 200, time: 60000, unlocks: ['Electromagnets'] },
                    { id: 'induction', name: 'Induction', tier: 2, engLevel: 25, cost: { tomes: 8, copperWire: 40 }, xp: 500, time: 120000, unlocks: ['Wireless power'] },
                    { id: 'em_waves', name: 'EM Waves', tier: 3, engLevel: 45, cost: { tomes: 20, crystal: 25 }, xp: 1200, time: 300000, unlocks: ['Radio/Radar'] },
                    { id: 'particle_acceleration', name: 'Particle Accel', tier: 4, engLevel: 65, cost: { tomes: 50, accelerator: 10 }, xp: 3000, time: 600000, unlocks: ['Particle beams'] },
                    { id: 'antimatter', name: 'Antimatter', tier: 5, engLevel: 85, cost: { tomes: 100, antimatter: 3 }, xp: 7500, time: 1200000, unlocks: ['Antimatter containment'] }
                ]
            },

            optics: {
                name: 'Optics',
                icon: '🔭',
                description: 'Light manipulation and lasers',
                tiers: [
                    { id: 'basic_optics', name: 'Basic Optics', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Lenses'] },
                    { id: 'refraction', name: 'Refraction', tier: 1, engLevel: 10, cost: { tomes: 3, glass: 20 }, xp: 200, time: 60000, unlocks: ['Optical instruments'] },
                    { id: 'fiber_optics', name: 'Fiber Optics', tier: 2, engLevel: 25, cost: { tomes: 8, fiberCable: 30 }, xp: 500, time: 120000, unlocks: ['Data transmission'] },
                    { id: 'lasers', name: 'Lasers', tier: 3, engLevel: 45, cost: { tomes: 20, laserDiode: 15 }, xp: 1200, time: 300000, unlocks: ['Laser weapons'] },
                    { id: 'photonics', name: 'Photonics', tier: 4, engLevel: 65, cost: { tomes: 50, photonicCrystal: 12 }, xp: 3000, time: 600000, unlocks: ['Photonic computers'] },
                    { id: 'holography', name: 'Holography', tier: 5, engLevel: 85, cost: { tomes: 100, hologramProjector: 6 }, xp: 7500, time: 1200000, unlocks: ['Hard-light constructs'] }
                ]
            },

            acoustics: {
                name: 'Acoustics',
                icon: '🔊',
                description: 'Sound and vibration',
                tiers: [
                    { id: 'sound_basics', name: 'Sound Basics', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Basic audio'] },
                    { id: 'resonance', name: 'Resonance', tier: 1, engLevel: 10, cost: { tomes: 3, tuningFork: 15 }, xp: 200, time: 60000, unlocks: ['Resonance weapons'] },
                    { id: 'ultrasound', name: 'Ultrasound', tier: 2, engLevel: 25, cost: { tomes: 8, crystalOscillator: 20 }, xp: 500, time: 120000, unlocks: ['Sonic scanning'] },
                    { id: 'infrasound', name: 'Infrasound', tier: 3, engLevel: 45, cost: { tomes: 20, subwoofer: 18 }, xp: 1200, time: 300000, unlocks: ['Shockwave generator'] },
                    { id: 'sonic_manipulation', name: 'Sonic Manipulation', tier: 4, engLevel: 65, cost: { tomes: 50, sonicEmitter: 14 }, xp: 3000, time: 600000, unlocks: ['Sonic shields'] },
                    { id: 'acoustic_levitation', name: 'Acoustic Levitation', tier: 5, engLevel: 85, cost: { tomes: 100, levitationArray: 7 }, xp: 7500, time: 1200000, unlocks: ['Sound-based flight'] }
                ]
            },

            aerodynamics: {
                name: 'Aerodynamics',
                icon: '✈️',
                description: 'Fluid dynamics and flight',
                tiers: [
                    { id: 'basic_flight', name: 'Basic Flight', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Gliders'] },
                    { id: 'lift_drag', name: 'Lift & Drag', tier: 1, engLevel: 10, cost: { tomes: 3, fabric: 25 }, xp: 200, time: 60000, unlocks: ['Better aircraft'] },
                    { id: 'propulsion', name: 'Propulsion', tier: 2, engLevel: 25, cost: { tomes: 8, propeller: 15 }, xp: 500, time: 120000, unlocks: ['Powered flight'] },
                    { id: 'supersonic', name: 'Supersonic', tier: 3, engLevel: 45, cost: { tomes: 20, jetEngine: 12 }, xp: 1200, time: 300000, unlocks: ['Supersonic travel'] },
                    { id: 'hypersonic', name: 'Hypersonic', tier: 4, engLevel: 65, cost: { tomes: 50, ramjet: 10 }, xp: 3000, time: 600000, unlocks: ['Hypersonic missiles'] },
                    { id: 'orbital_mechanics', name: 'Orbital Mechanics', tier: 5, engLevel: 85, cost: { tomes: 100, rocketEngine: 6 }, xp: 7500, time: 1200000, unlocks: ['Space travel'] }
                ]
            },

            hydraulics: {
                name: 'Hydraulics',
                icon: '💧',
                description: 'Fluid power systems',
                tiers: [
                    { id: 'basic_pumps', name: 'Basic Pumps', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Water pumps'] },
                    { id: 'pressure_systems', name: 'Pressure Systems', tier: 1, engLevel: 10, cost: { tomes: 3, pipe: 25 }, xp: 200, time: 60000, unlocks: ['Hydraulic lifts'] },
                    { id: 'fluid_control', name: 'Fluid Control', tier: 2, engLevel: 25, cost: { tomes: 8, valve: 20 }, xp: 500, time: 120000, unlocks: ['Precision hydraulics'] },
                    { id: 'high_pressure', name: 'High Pressure', tier: 3, engLevel: 45, cost: { tomes: 20, pressureTank: 15 }, xp: 1200, time: 300000, unlocks: ['Power tools'] },
                    { id: 'servo_hydraulics', name: 'Servo Hydraulics', tier: 4, engLevel: 65, cost: { tomes: 50, servoValve: 12 }, xp: 3000, time: 600000, unlocks: ['Robotic hydraulics'] },
                    { id: 'nanofluidics', name: 'Nanofluidics', tier: 5, engLevel: 85, cost: { tomes: 100, nanoFluid: 8 }, xp: 7500, time: 1200000, unlocks: ['Molecular-scale fluids'] }
                ]
            },

            cryogenics: {
                name: 'Cryogenics',
                icon: '❄️',
                description: 'Extreme cold and preservation',
                tiers: [
                    { id: 'basic_cooling', name: 'Basic Cooling', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Ice boxes'] },
                    { id: 'refrigeration_cycles', name: 'Refrigeration', tier: 1, engLevel: 10, cost: { tomes: 3, ice: 30 }, xp: 200, time: 60000, unlocks: ['Freezers'] },
                    { id: 'deep_freeze', name: 'Deep Freeze', tier: 2, engLevel: 25, cost: { tomes: 8, dryIce: 25 }, xp: 500, time: 120000, unlocks: ['Cryogenic storage'] },
                    { id: 'liquid_gases', name: 'Liquid Gases', tier: 3, engLevel: 45, cost: { tomes: 20, liquidNitrogen: 15 }, xp: 1200, time: 300000, unlocks: ['Cryo weapons'] },
                    { id: 'near_absolute_zero', name: 'Near Absolute Zero', tier: 4, engLevel: 65, cost: { tomes: 50, helium3: 10 }, xp: 3000, time: 600000, unlocks: ['Extreme superconductors'] },
                    { id: 'bose_einstein', name: 'Bose-Einstein', tier: 5, engLevel: 85, cost: { tomes: 100, condensate: 5 }, xp: 7500, time: 1200000, unlocks: ['Quantum condensates'] }
                ]
            },

            biotechnology: {
                name: 'Biotechnology',
                icon: '🧬',
                description: 'Biological engineering',
                tiers: [
                    { id: 'basic_biology', name: 'Basic Biology', tier: 0, engLevel: 1, cost: { tomes: 1 }, xp: 50, time: 30000, unlocks: ['Culture growing'] },
                    { id: 'genetics', name: 'Genetics', tier: 1, engLevel: 10, cost: { tomes: 3, dnaSample: 20 }, xp: 200, time: 60000, unlocks: ['Gene sequencing'] },
                    { id: 'genetic_engineering', name: 'Genetic Engineering', tier: 2, engLevel: 25, cost: { tomes: 8, plasmid: 15 }, xp: 500, time: 120000, unlocks: ['Gene modification'] },
                    { id: 'bioweapons', name: 'Bioweapons', tier: 3, engLevel: 45, cost: { tomes: 20, pathogen: 12 }, xp: 1200, time: 300000, unlocks: ['Biological warfare'] },
                    { id: 'synthetic_biology', name: 'Synthetic Biology', tier: 4, engLevel: 65, cost: { tomes: 50, syntheticCell: 10 }, xp: 3000, time: 600000, unlocks: ['Create life'] },
                    { id: 'transhumanism', name: 'Transhumanism', tier: 5, engLevel: 85, cost: { tomes: 100, augmentation: 6 }, xp: 7500, time: 1200000, unlocks: ['Human enhancement'] }
                ]
            }
        },

        // Legacy technologies structure (kept for backwards compatibility - can be removed later)
        technologies: {
            basic_gears: {
                name: 'Basic Gears',
                tier: 1,
                requiredEngLevel: 1,
                researchTime: 30000,  // 30 seconds
                cost: {
                    tomes: 1,
                    copperOre: 10
                },
                xpReward: 100,
                description: 'Simple mechanical components for basic machinery.',
                icon: '⚙️',
                unlocks: ['Allows crafting: Gear, Simple Mechanism']
            },

            crude_explosives: {
                name: 'Crude Explosives',
                tier: 1,
                requiredEngLevel: 5,
                researchTime: 45000,  // 45 seconds
                cost: {
                    tomes: 2,
                    coal: 15
                },
                xpReward: 200,
                description: 'Basic demolition charges for mining and combat.',
                icon: '💣',
                unlocks: ['Allows crafting: Explosive Charge, Mining Bomb']
            },

            simple_circuits: {
                name: 'Simple Circuits',
                tier: 1,
                requiredEngLevel: 10,
                researchTime: 60000,  // 1 minute
                cost: {
                    tomes: 3,
                    copperOre: 20
                },
                xpReward: 350,
                description: 'Elementary electrical systems and components.',
                icon: '🔌',
                unlocks: ['Allows crafting: Circuit Board, Wire Spool']
            },

            // =========================================================================
            // TIER 2 TECHNOLOGIES (Engineering 21-40)
            // =========================================================================
            advanced_mechanics: {
                name: 'Advanced Mechanics',
                tier: 2,
                requiredEngLevel: 25,
                prerequisite: 'basic_gears',
                researchTime: 120000,  // 2 minutes
                cost: {
                    tomes: 8,
                    copperOre: 30,
                    wood: 20
                },
                xpReward: 800,
                description: 'Complex mechanical systems with precision parts.',
                icon: '🔧',
                unlocks: ['Allows crafting: Advanced Gear, Servo Motor, Pulley System']
            },

            combustion_engine: {
                name: 'Combustion Engine',
                tier: 2,
                requiredEngLevel: 30,
                prerequisite: 'advanced_mechanics',
                researchTime: 180000,  // 3 minutes
                cost: {
                    tomes: 12,
                    copperOre: 40,
                    coal: 20
                },
                xpReward: 1200,
                description: 'Power generation through controlled combustion.',
                icon: '⚡',
                unlocks: ['Allows crafting: Engine Core, Power Generator']
            },

            improved_explosives: {
                name: 'Improved Explosives',
                tier: 2,
                requiredEngLevel: 22,
                prerequisite: 'crude_explosives',
                researchTime: 90000,  // 1.5 minutes
                cost: {
                    tomes: 6,
                    coal: 30,
                    wood: 15
                },
                xpReward: 600,
                description: 'More powerful and controlled explosive compounds.',
                icon: '💥',
                unlocks: ['Allows crafting: Shaped Charge, High Explosive']
            },

            // =========================================================================
            // TIER 3 TECHNOLOGIES (Engineering 41-60)
            // =========================================================================
            automated_systems: {
                name: 'Automated Systems',
                tier: 3,
                requiredEngLevel: 45,
                prerequisite: 'combustion_engine',
                researchTime: 300000,  // 5 minutes
                cost: {
                    tomes: 25,
                    copperOre: 50,
                    wood: 30
                },
                xpReward: 2500,
                description: 'Self-operating machinery and automation technology.',
                icon: '🤖',
                unlocks: ['Allows crafting: Auto-Harvester, Auto-Crafter']
            },

            military_engineering: {
                name: 'Military Engineering',
                tier: 3,
                requiredEngLevel: 50,
                prerequisite: 'improved_explosives',
                researchTime: 240000,  // 4 minutes
                cost: {
                    tomes: 20,
                    copperOre: 40,
                    coal: 30
                },
                xpReward: 2000,
                description: 'Advanced combat technologies and fortifications.',
                icon: '🏰',
                unlocks: ['Allows crafting: Combat Turret, Reinforced Armor']
            },

            advanced_circuits: {
                name: 'Advanced Circuits',
                tier: 3,
                requiredEngLevel: 42,
                prerequisite: 'simple_circuits',
                researchTime: 210000,  // 3.5 minutes
                cost: {
                    tomes: 18,
                    copperOre: 50
                },
                xpReward: 1800,
                description: 'Sophisticated electronic circuits and processors.',
                icon: '💻',
                unlocks: ['Allows crafting: Microprocessor, Logic Gate']
            },

            // =========================================================================
            // TIER 4 TECHNOLOGIES (Engineering 61-80)
            // =========================================================================
            robotics: {
                name: 'Robotics',
                tier: 4,
                requiredEngLevel: 65,
                prerequisite: 'automated_systems',
                researchTime: 600000,  // 10 minutes
                cost: {
                    tomes: 50,
                    copperOre: 100,
                    wood: 50
                },
                xpReward: 5000,
                description: 'Autonomous mechanical units with AI control.',
                icon: '🦾',
                unlocks: ['Allows crafting: Combat Robot, Resource Drone']
            },

            energy_weapons: {
                name: 'Energy Weapons',
                tier: 4,
                requiredEngLevel: 70,
                prerequisite: 'military_engineering',
                researchTime: 480000,  // 8 minutes
                cost: {
                    tomes: 45,
                    copperOre: 80,
                    coal: 50
                },
                xpReward: 4500,
                description: 'Directed energy weapon systems.',
                icon: '⚡',
                unlocks: ['Allows crafting: Plasma Rifle, Energy Shield']
            },

            // =========================================================================
            // TIER 5 TECHNOLOGIES (Engineering 81-100)
            // =========================================================================
            nanotechnology: {
                name: 'Nanotechnology',
                tier: 5,
                requiredEngLevel: 85,
                prerequisite: 'robotics',
                researchTime: 1200000,  // 20 minutes
                cost: {
                    tomes: 100,
                    copperOre: 200,
                    wood: 100
                },
                xpReward: 10000,
                description: 'Molecular-scale engineering and construction.',
                icon: '🔬',
                unlocks: ['Allows crafting: Nano-Assembler, Smart Material']
            },

            quantum_computing: {
                name: 'Quantum Computing',
                tier: 5,
                requiredEngLevel: 90,
                prerequisite: 'advanced_circuits',
                researchTime: 900000,  // 15 minutes
                cost: {
                    tomes: 80,
                    copperOre: 150
                },
                xpReward: 8000,
                description: 'Quantum-based computing and encryption.',
                icon: '⚛️',
                unlocks: ['Allows crafting: Quantum Computer, Encryption Key']
            },

            fusion_reactor: {
                name: 'Fusion Reactor',
                tier: 5,
                requiredEngLevel: 95,
                prerequisite: 'energy_weapons',
                researchTime: 1500000,  // 25 minutes
                cost: {
                    tomes: 120,
                    copperOre: 250,
                    coal: 150
                },
                xpReward: 12000,
                description: 'Clean, nearly limitless fusion power.',
                icon: '☀️',
                unlocks: ['Allows crafting: Fusion Core, Infinite Battery']
            }
        },

        // =============================================================================
        // PERK GRID CELL DEFINITIONS
        // Each cell has predetermined perks that unlock at specific character levels
        // =============================================================================
        perkGridCells: (() => {
            const cells = {};

            // Generate cells for 9x9 grid
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const cellKey = `${row},${col}`;

                    // Center 3x3 is equipment area
                    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
                        cells[cellKey] = {
                            type: 'equipment',
                            name: 'Equipment Slot',
                            icon: '⚙️',
                            isEquipmentSlot: true,
                            description: 'Automatically gains bonuses from equipped items'
                        };
                        continue;
                    }

                    // Regular perk cell - empty placeholder
                    cells[cellKey] = {
                        type: 'empty',
                        name: 'Perk Slot',
                        icon: '◻️',
                        isEquipmentSlot: false,
                        description: 'Place a crafted perk medal here'
                    };
                }
            }

            return cells;
        })(),

        // =============================================================================
        // MEDAL DEFINITIONS (LEGACY - may remove later)
        // =============================================================================
        medals: {
            // POWER MEDALS - Provide base power, no multipliers
            "power_medal_small": {
                id: "power_medal_small",
                name: "Bronze Medal",
                description: "A small medal that provides basic power",
                icon: "🥉",
                basePower: 10,
                rowMultiplier: 0,
                colMultiplier: 0,
                rarity: 1
            },

            "power_medal_medium": {
                id: "power_medal_medium",
                name: "Silver Medal",
                description: "A medium-tier medal with decent power",
                icon: "🥈",
                basePower: 50,
                rowMultiplier: 0,
                colMultiplier: 0,
                rarity: 2
            },

            "power_medal_large": {
                id: "power_medal_large",
                name: "Gold Medal",
                description: "A powerful gold medal",
                icon: "🥇",
                basePower: 200,
                rowMultiplier: 0,
                colMultiplier: 0,
                rarity: 3
            },

            // MULTIPLIER MEDALS - Provide multipliers to row/column
            "multiplier_medal_row": {
                id: "multiplier_medal_row",
                name: "Row Enhancer",
                description: "Increases multiplier for entire row",
                icon: "↔️",
                basePower: 0,
                rowMultiplier: 0.5,  // +0.5x to row
                colMultiplier: 0,
                rarity: 2
            },

            "multiplier_medal_col": {
                id: "multiplier_medal_col",
                name: "Column Enhancer",
                description: "Increases multiplier for entire column",
                icon: "↕️",
                basePower: 0,
                rowMultiplier: 0,
                colMultiplier: 0.5,  // +0.5x to column
                rarity: 2
            },

            "multiplier_medal_cross": {
                id: "multiplier_medal_cross",
                name: "Cross Enhancer",
                description: "Increases both row and column multipliers",
                icon: "➕",
                basePower: 0,
                rowMultiplier: 0.3,
                colMultiplier: 0.3,
                rarity: 3
            },

            // HYBRID MEDALS - Mix of power and multipliers
            "hybrid_medal_balanced": {
                id: "hybrid_medal_balanced",
                name: "Balanced Medallion",
                description: "Provides both power and multipliers",
                icon: "⚖️",
                basePower: 25,
                rowMultiplier: 0.2,
                colMultiplier: 0.2,
                rarity: 3
            },

            "hybrid_medal_row_power": {
                id: "hybrid_medal_row_power",
                name: "Row Power Medallion",
                description: "Power with row multiplier bonus",
                icon: "🔷",
                basePower: 30,
                rowMultiplier: 0.4,
                colMultiplier: 0,
                rarity: 3
            },

            "hybrid_medal_col_power": {
                id: "hybrid_medal_col_power",
                name: "Column Power Medallion",
                description: "Power with column multiplier bonus",
                icon: "🔶",
                basePower: 30,
                rowMultiplier: 0,
                colMultiplier: 0.4,
                rarity: 3
            },

            // LEGENDARY MEDALS - Very powerful
            "legendary_medal_power": {
                id: "legendary_medal_power",
                name: "Legendary Power Orb",
                description: "An orb of immense power",
                icon: "💎",
                basePower: 500,
                rowMultiplier: 0,
                colMultiplier: 0,
                rarity: 5
            },

            "legendary_medal_multiplier": {
                id: "legendary_medal_multiplier",
                name: "Legendary Amplifier",
                description: "Massively amplifies row and column",
                icon: "🌟",
                basePower: 10,
                rowMultiplier: 1.0,
                colMultiplier: 1.0,
                rarity: 5
            },

            // EQUIPMENT (for center 3x3 area)
            "equipment": {
                id: "equipment",
                name: "Equipment Slot",
                description: "Represents equipped items",
                icon: "⚙️",
                basePower: 15,
                rowMultiplier: 0.1,
                colMultiplier: 0.1,
                rarity: 1
            }
        }
};

/**
 * DYNAMIC ITEM GETTER SYSTEM
 *
 * Makes GameDefinitions.items a dynamic getter that pulls from ItemRegistry.
 * This ensures ItemRegistry is the single source of truth for all items.
 */

// Track if legacy items have been migrated
let _legacyItemsMigrated = false;

// Define dynamic getter for items property
Object.defineProperty(GameDefinitions, 'items', {
    get() {
        // On first access, migrate legacy items to ItemRegistry
        if (!_legacyItemsMigrated && typeof ItemRegistry !== 'undefined') {
            console.log('🔄 Migrating legacy items from GameDefinitions to ItemRegistry...');

            let migratedCount = 0;
            for (let itemId in this._legacyItems) {
                // Only add to legacy if not already in production
                if (!ItemRegistry.production[itemId]) {
                    ItemRegistry.legacy[itemId] = this._legacyItems[itemId];
                    migratedCount++;
                }
            }

            _legacyItemsMigrated = true;
            console.log(`✅ Migrated ${migratedCount} legacy items to ItemRegistry.legacy`);
        }

        // Return all active items from ItemRegistry
        if (typeof ItemRegistry !== 'undefined') {
            return ItemRegistry.getAllActive();
        }

        // Fallback: return legacy items if ItemRegistry not loaded yet
        console.warn('⚠️  ItemRegistry not available, using legacy items');
        return this._legacyItems;
    },

    // Allow setting (for backwards compatibility, but log a warning)
    set(value) {
        console.warn('⚠️  Direct assignment to GameDefinitions.items is deprecated.');
        console.warn('   Use ItemRegistry.production[itemId] = {...} instead');
    },

    enumerable: true,
    configurable: false
});

/**
 * DYNAMIC ENEMY GETTER SYSTEM
 *
 * Makes GameDefinitions.enemies a dynamic getter that pulls from EnemyRegistry.
 * This ensures EnemyRegistry is the single source of truth for all enemies.
 */

// Track if legacy enemies have been migrated
let _legacyEnemiesMigrated = false;

// Define dynamic getter for enemies property
Object.defineProperty(GameDefinitions, 'enemies', {
    get() {
        // On first access, migrate legacy enemies to EnemyRegistry
        if (!_legacyEnemiesMigrated && typeof EnemyRegistry !== 'undefined') {
            console.log('🔄 Migrating legacy enemies from GameDefinitions to EnemyRegistry...');

            let migratedCount = 0;
            for (let enemyId in this._legacyEnemies) {
                // Only add to legacy if not already in production
                if (!EnemyRegistry.production[enemyId]) {
                    EnemyRegistry.legacy[enemyId] = this._legacyEnemies[enemyId];
                    migratedCount++;
                }
            }

            _legacyEnemiesMigrated = true;
            console.log(`✅ Migrated ${migratedCount} legacy enemies to EnemyRegistry.legacy`);
        }

        // Return all active enemies from EnemyRegistry
        if (typeof EnemyRegistry !== 'undefined') {
            return EnemyRegistry.getAllActive();
        }

        // Fallback: return legacy enemies if EnemyRegistry not loaded yet
        console.warn('⚠️  EnemyRegistry not available, using legacy enemies');
        return this._legacyEnemies;
    },

    // Allow setting (for backwards compatibility, but log a warning)
    set(value) {
        console.warn('⚠️  Direct assignment to GameDefinitions.enemies is deprecated.');
        console.warn('   Use EnemyRegistry.production[enemyId] = {...} instead');
    },

    enumerable: true,
    configurable: false
});

// MISSION GETTER
let _legacyMissionsMigrated = false;
Object.defineProperty(GameDefinitions, 'missions', {
    get() {
        if (!_legacyMissionsMigrated && typeof MissionRegistry !== 'undefined') {
            console.log('🔄 Migrating legacy missions from GameDefinitions to MissionRegistry...');
            let migratedCount = 0;
            for (let missionId in this._legacyMissions) {
                if (!MissionRegistry.production[missionId]) {
                    MissionRegistry.legacy[missionId] = this._legacyMissions[missionId];
                    migratedCount++;
                }
            }
            _legacyMissionsMigrated = true;
            console.log(`✅ Migrated ${migratedCount} legacy missions to MissionRegistry.legacy`);
        }
        if (typeof MissionRegistry !== 'undefined') {
            return MissionRegistry.getAllActive();
        }
        console.warn('⚠️  MissionRegistry not available, using legacy missions');
        return this._legacyMissions;
    },
    set(value) {
        console.warn('⚠️  Direct assignment to GameDefinitions.missions is deprecated.');
        console.warn('   Use MissionRegistry.production[missionId] = {...} instead');
    },
    enumerable: true,
    configurable: false
});

// RECIPE GETTER
let _legacyRecipesMigrated = false;
Object.defineProperty(GameDefinitions, 'recipes', {
    get() {
        if (!_legacyRecipesMigrated && typeof RecipeRegistry !== 'undefined') {
            console.log('🔄 Migrating legacy recipes from GameDefinitions to RecipeRegistry...');
            let migratedCount = 0;
            for (let recipeId in this._legacyRecipes) {
                if (!RecipeRegistry.production[recipeId]) {
                    RecipeRegistry.legacy[recipeId] = this._legacyRecipes[recipeId];
                    migratedCount++;
                }
            }
            _legacyRecipesMigrated = true;
            console.log(`✅ Migrated ${migratedCount} legacy recipes to RecipeRegistry.legacy`);
        }
        if (typeof RecipeRegistry !== 'undefined') {
            return RecipeRegistry.getAllActive();
        }
        console.warn('⚠️  RecipeRegistry not available, using legacy recipes');
        return this._legacyRecipes;
    },
    set(value) {
        console.warn('⚠️  Direct assignment to GameDefinitions.recipes is deprecated.');
        console.warn('   Use RecipeRegistry.production[recipeId] = {...} instead');
    },
    enumerable: true,
    configurable: false
});

// SKILL GETTER
Object.defineProperty(GameDefinitions, 'skills', {
    get() {
        if (typeof SkillRegistry !== 'undefined') {
            return SkillRegistry.getAllActive();
        }
        console.warn('⚠️  SkillRegistry not available, using legacy skills');
        return this._legacySkills;
    },
    set(value) {
        console.warn('⚠️  Direct assignment to GameDefinitions.skills is deprecated.');
        console.warn('   Use SkillRegistry.production[skillId] = {...} instead');
    },
    enumerable: true,
    configurable: false
});


/**
 * DYNAMIC GETTERS FOR NEW ENTITY TYPES (Phase 1)
 *
 * These getters connect to the new registries created in Phase 1.
 */

// Perk Registry Getter
Object.defineProperty(GameDefinitions, 'perks', {
    get() {
        if (typeof PerkRegistry !== 'undefined') {
            return PerkRegistry.getAllActive();
        }
        console.warn('??  PerkRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// NPC Registry Getter
Object.defineProperty(GameDefinitions, 'npcs', {
    get() {
        if (typeof NPCRegistry !== 'undefined') {
            return NPCRegistry.getAllActive();
        }
        console.warn('??  NPCRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Biome Registry Getter
Object.defineProperty(GameDefinitions, 'biomes', {
    get() {
        if (typeof BiomeRegistry !== 'undefined') {
            return BiomeRegistry.getAllActive();
        }
        console.warn('??  BiomeRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Loot Table Registry Getter
Object.defineProperty(GameDefinitions, 'lootTables', {
    get() {
        if (typeof LootTableRegistry !== 'undefined') {
            return LootTableRegistry.getAllActive();
        }
        console.warn('??  LootTableRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Crafting Station Registry Getter
Object.defineProperty(GameDefinitions, 'craftingStations', {
    get() {
        if (typeof CraftingStationRegistry !== 'undefined') {
            return CraftingStationRegistry.getAllActive();
        }
        console.warn('??  CraftingStationRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Technology Registry Getter
Object.defineProperty(GameDefinitions, 'technologies', {
    get() {
        if (typeof TechnologyRegistry !== 'undefined') {
            return TechnologyRegistry.getAllActive();
        }
        console.warn('??  TechnologyRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Incursion Registry Getter
Object.defineProperty(GameDefinitions, 'incursions', {
    get() {
        if (typeof IncursionRegistry !== 'undefined') {
            return IncursionRegistry.getAllActive();
        }
        console.warn('??  IncursionRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Attribute Registry Getter
Object.defineProperty(GameDefinitions, 'attributes', {
    get() {
        if (typeof AttributeRegistry !== 'undefined') {
            return AttributeRegistry.getAllActive();
        }
        console.warn('??  AttributeRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Currency Registry Getter
Object.defineProperty(GameDefinitions, 'currencies', {
    get() {
        if (typeof CurrencyRegistry !== 'undefined') {
            return CurrencyRegistry.getAllActive();
        }
        console.warn('??  CurrencyRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});

// Stance Registry Getter
Object.defineProperty(GameDefinitions, 'stances', {
    get() {
        if (typeof StanceRegistry !== 'undefined') {
            return StanceRegistry.getAllActive();
        }
        console.warn('??  StanceRegistry not available');
        return {};
    },
    enumerable: true,
    configurable: false
});
