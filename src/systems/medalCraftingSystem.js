/**
 * MEDAL CRAFTING SYSTEM
 *
 * Allows players to craft perk medals using medal currency
 * - 9 crafting tiers (Common → Creator)
 * - Rarity system with 1-5 perk slots
 * - Pity timer system with progress tracking
 * - Fragment system for Creator medals
 * - Visual effects scaling with rarity
 * - Economy balance calculator
 */

const MedalCraftingSystem = {
    /**
     * Crafting tier definitions
     * 9 tiers from Common to Creator
     */
    craftingTiers: {
        common: {
            name: "Common",
            cost: 10,
            icon: "⚪",
            color: "#9e9e9e",
            rarityChances: {
                common: 0.85,
                uncommon: 0.15,
                rare: 0,
                epic: 0,
                legendary: 0,
                mythic: 0,
                divine: 0,
                transcendent: 0,
                creator: 0
            }
        },
        uncommon: {
            name: "Uncommon",
            cost: 100,
            icon: "🟢",
            color: "#4caf50",
            rarityChances: {
                common: 0.50,
                uncommon: 0.40,
                rare: 0.10,
                epic: 0,
                legendary: 0,
                mythic: 0,
                divine: 0,
                transcendent: 0,
                creator: 0
            }
        },
        rare: {
            name: "Rare",
            cost: 1000,
            icon: "🔵",
            color: "#2196f3",
            rarityChances: {
                common: 0.20,
                uncommon: 0.45,
                rare: 0.30,
                epic: 0.05,
                legendary: 0,
                mythic: 0,
                divine: 0,
                transcendent: 0,
                creator: 0
            }
        },
        epic: {
            name: "Epic",
            cost: 10000,
            icon: "🟣",
            color: "#9c27b0",
            rarityChances: {
                common: 0.05,
                uncommon: 0.25,
                rare: 0.40,
                epic: 0.25,
                legendary: 0.05,
                mythic: 0,
                divine: 0,
                transcendent: 0,
                creator: 0
            }
        },
        legendary: {
            name: "Legendary",
            cost: 50000,
            icon: "🟠",
            color: "#ff9800",
            rarityChances: {
                common: 0,
                uncommon: 0.10,
                rare: 0.30,
                epic: 0.40,
                legendary: 0.18,
                mythic: 0.02,
                divine: 0,
                transcendent: 0,
                creator: 0
            }
        },
        mythic: {
            name: "Mythic",
            cost: 250000,
            icon: "🔴",
            color: "#f44336",
            rarityChances: {
                common: 0,
                uncommon: 0,
                rare: 0.15,
                epic: 0.35,
                legendary: 0.35,
                mythic: 0.14,
                divine: 0.01,
                transcendent: 0,
                creator: 0
            }
        },
        divine: {
            name: "Divine",
            cost: 750000,
            icon: "✨",
            color: "#ffd700",
            rarityChances: {
                common: 0,
                uncommon: 0,
                rare: 0,
                epic: 0.20,
                legendary: 0.40,
                mythic: 0.30,
                divine: 0.095,
                transcendent: 0.005,
                creator: 0
            }
        },
        transcendent: {
            name: "Transcendent",
            cost: 1500000,
            icon: "💫",
            color: "#00ffff",
            rarityChances: {
                common: 0,
                uncommon: 0,
                rare: 0,
                epic: 0,
                legendary: 0.25,
                mythic: 0.40,
                divine: 0.30,
                transcendent: 0.049,
                creator: 0.001
            }
        },
        creator: {
            name: "Creator",
            cost: 2000000,
            icon: "🌟",
            color: "#ff00ff",
            rarityChances: {
                common: 0,
                uncommon: 0,
                rare: 0,
                epic: 0,
                legendary: 0,
                mythic: 0.30,
                divine: 0.40,
                transcendent: 0.295,
                creator: 0.005
            }
        }
    },

    /**
     * Rarity definitions
     * Higher rarities = more perks and power
     */
    rarities: {
        common: {
            name: "Common",
            color: "#9e9e9e",
            icon: "⚪",
            perkCount: 1,
            powerMultiplier: 1.0,
            glow: false
        },
        uncommon: {
            name: "Uncommon",
            color: "#4caf50",
            icon: "🟢",
            perkCount: 1,
            powerMultiplier: 1.5,
            glow: false
        },
        rare: {
            name: "Rare",
            color: "#2196f3",
            icon: "🔵",
            perkCount: 2,
            powerMultiplier: 2.0,
            glow: false
        },
        epic: {
            name: "Epic",
            color: "#9c27b0",
            icon: "🟣",
            perkCount: 3,
            powerMultiplier: 3.0,
            glow: true
        },
        legendary: {
            name: "Legendary",
            color: "#ff9800",
            icon: "🟠",
            perkCount: 3,
            powerMultiplier: 4.0,
            glow: true
        },
        mythic: {
            name: "Mythic",
            color: "#f44336",
            icon: "🔴",
            perkCount: 4,
            powerMultiplier: 6.0,
            glow: true
        },
        divine: {
            name: "Divine",
            color: "#ffd700",
            icon: "✨",
            perkCount: 4,
            powerMultiplier: 10.0,
            glow: true
        },
        transcendent: {
            name: "Transcendent",
            color: "#00ffff",
            icon: "💫",
            perkCount: 5,
            powerMultiplier: 20.0,
            glow: true,
            gridEffect: "row" // Affects entire row
        },
        creator: {
            name: "Creator",
            color: "#ff00ff",
            icon: "🌟",
            perkCount: 5,
            powerMultiplier: 50.0,
            glow: true,
            gridEffect: "all", // Affects entire grid
            requiresFragments: true
        }
    },

    /**
     * Available perk types for medals
     * Organized by category: Combat, Gathering, Crafting, Special
     */
    perkTypes: {
        // === COMBAT PERKS (Multipliers for hidden stats) ===
        combatDamageMult: {
            name: "Damage",
            icon: "⚔️",
            stat: "combatDamageMult",
            category: "combat",
            description: "Multiplies combat damage",
            isMultiplier: true
        },
        combatAttackSpeed: {
            name: "Attack SPD.",
            icon: "⚡",
            stat: "combatAttackSpeed",
            category: "combat",
            description: "Reduces attack interval",
            isMultiplier: true
        },
        combatCritChance: {
            name: "Crit Chance",
            icon: "💥",
            stat: "combatCritChance",
            category: "combat",
            description: "Increases critical hit chance",
            isMultiplier: true
        },
        combatCritDamage: {
            name: "Crit Damage",
            icon: "💢",
            stat: "combatCritDamage",
            category: "combat",
            description: "Increases critical damage multiplier",
            isMultiplier: true
        },
        combatAccuracy: {
            name: "Accuracy",
            icon: "🎯",
            stat: "combatAccuracy",
            category: "combat",
            description: "Increases hit chance",
            isMultiplier: true
        },
        combatEvasion: {
            name: "Evasion",
            icon: "💨",
            stat: "combatEvasion",
            category: "combat",
            description: "Increases dodge chance",
            isMultiplier: true
        },
        combatDefense: {
            name: "Defense",
            icon: "🛡️",
            stat: "combatDefense",
            category: "combat",
            description: "Reduces damage taken",
            isMultiplier: true
        },
        combatHpRegen: {
            name: "HP Regen",
            icon: "❤️",
            stat: "combatHpRegen",
            category: "combat",
            description: "Increases health regeneration",
            isMultiplier: true
        },

        // === GATHERING PERKS (Skill-specific) ===
        miningSpeed: {
            name: "Mining SPD.",
            icon: "⛏️",
            stat: "miningSpeed",
            category: "gathering",
            skill: "mining",
            description: "Reduces mining interval",
            isMultiplier: true
        },
        miningDamage: {
            name: "Mining Damage",
            icon: "💎",
            stat: "miningDamage",
            category: "gathering",
            skill: "mining",
            description: "Increases damage to ore nodes",
            isMultiplier: true
        },
        loggingSpeed: {
            name: "Logging SPD.",
            icon: "🪓",
            stat: "loggingSpeed",
            category: "gathering",
            skill: "logging",
            description: "Reduces logging interval",
            isMultiplier: true
        },
        loggingDamage: {
            name: "Logging Damage",
            icon: "🌲",
            stat: "loggingDamage",
            category: "gathering",
            skill: "logging",
            description: "Increases damage to tree nodes",
            isMultiplier: true
        },
        fishingSpeed: {
            name: "Fishing SPD.",
            icon: "🎣",
            stat: "fishingSpeed",
            category: "gathering",
            skill: "fishing",
            description: "Reduces fishing interval",
            isMultiplier: true
        },
        fishingCatchRate: {
            name: "Fishing Catch Rate",
            icon: "🐟",
            stat: "fishingCatchRate",
            category: "gathering",
            skill: "fishing",
            description: "Increases fish catch chance",
            isMultiplier: true
        },
        huntingSpeed: {
            name: "Hunting SPD.",
            icon: "🏹",
            stat: "huntingSpeed",
            category: "gathering",
            skill: "hunting",
            description: "Reduces hunting interval",
            isMultiplier: true
        },
        huntingDamage: {
            name: "Hunting Damage",
            icon: "🦌",
            stat: "huntingDamage",
            category: "gathering",
            skill: "hunting",
            description: "Increases damage to prey",
            isMultiplier: true
        },
        foragingSpeed: {
            name: "Foraging SPD.",
            icon: "🍄",
            stat: "foragingSpeed",
            category: "gathering",
            skill: "foraging",
            description: "Reduces foraging interval",
            isMultiplier: true
        },
        foragingFindRate: {
            name: "Foraging Find Rate",
            icon: "🌿",
            stat: "foragingFindRate",
            category: "gathering",
            skill: "foraging",
            description: "Increases item find chance",
            isMultiplier: true
        },
        thievingSpeed: {
            name: "Thieving SPD.",
            icon: "🦹",
            stat: "thievingSpeed",
            category: "gathering",
            skill: "thieving",
            description: "Reduces thieving interval",
            isMultiplier: true
        },
        thievingSuccess: {
            name: "Thieving Success",
            icon: "💰",
            stat: "thievingSuccess",
            category: "gathering",
            skill: "thieving",
            description: "Increases pickpocket success",
            isMultiplier: true
        },
        navigationSpeed: {
            name: "Navigation SPD.",
            icon: "🧭",
            stat: "navigationSpeed",
            category: "gathering",
            skill: "navigation",
            description: "Reduces exploration interval",
            isMultiplier: true
        },

        // === CRAFTING PERKS (Skill-specific) ===
        forgingSpeed: {
            name: "Forging SPD.",
            icon: "🔨",
            stat: "forgingSpeed",
            category: "crafting",
            skill: "smithing",
            description: "Reduces forging time",
            isMultiplier: true
        },
        forgingQuality: {
            name: "Forging Quality",
            icon: "✨",
            stat: "forgingQuality",
            category: "crafting",
            skill: "smithing",
            description: "Improves crafted item quality",
            isMultiplier: true
        },
        forgingIngredients: {
            name: "Forging EFF.",
            icon: "📦",
            stat: "forgingIngredients",
            category: "crafting",
            skill: "smithing",
            description: "Reduces material requirements",
            isMultiplier: true
        },
        machiningSpeed: {
            name: "Machining SPD.",
            icon: "⚙️",
            stat: "machiningSpeed",
            category: "crafting",
            skill: "mechanics",
            description: "Reduces machining time",
            isMultiplier: true
        },
        machiningQuality: {
            name: "Machining Quality",
            icon: "✨",
            stat: "machiningQuality",
            category: "crafting",
            skill: "mechanics",
            description: "Improves crafted item quality",
            isMultiplier: true
        },
        machiningIngredients: {
            name: "Machining EFF.",
            icon: "📦",
            stat: "machiningIngredients",
            category: "crafting",
            skill: "mechanics",
            description: "Reduces material requirements",
            isMultiplier: true
        },
        cookingSpeed: {
            name: "Cooking SPD.",
            icon: "🍳",
            stat: "cookingSpeed",
            category: "crafting",
            skill: "cooking",
            description: "Reduces cooking time",
            isMultiplier: true
        },
        cookingQuality: {
            name: "Cooking Quality",
            icon: "✨",
            stat: "cookingQuality",
            category: "crafting",
            skill: "cooking",
            description: "Improves food quality",
            isMultiplier: true
        },
        cookingIngredients: {
            name: "Cooking EFF.",
            icon: "📦",
            stat: "cookingIngredients",
            category: "crafting",
            skill: "cooking",
            description: "Reduces ingredient requirements",
            isMultiplier: true
        },
        chemistrySpeed: {
            name: "Chemistry SPD.",
            icon: "🧪",
            stat: "chemistrySpeed",
            category: "crafting",
            skill: "chemistry",
            description: "Reduces chemistry time",
            isMultiplier: true
        },
        chemistryQuality: {
            name: "Chemistry Quality",
            icon: "✨",
            stat: "chemistryQuality",
            category: "crafting",
            skill: "chemistry",
            description: "Improves potion quality",
            isMultiplier: true
        },
        chemistryIngredients: {
            name: "Chemistry EFF.",
            icon: "📦",
            stat: "chemistryIngredients",
            category: "crafting",
            skill: "chemistry",
            description: "Reduces reagent requirements",
            isMultiplier: true
        },
        textilesSpeed: {
            name: "Textiles SPD.",
            icon: "🧵",
            stat: "textilesSpeed",
            category: "crafting",
            skill: "textiles",
            description: "Reduces weaving time",
            isMultiplier: true
        },
        textilesQuality: {
            name: "Textiles Quality",
            icon: "✨",
            stat: "textilesQuality",
            category: "crafting",
            skill: "textiles",
            description: "Improves fabric quality",
            isMultiplier: true
        },
        textilesIngredients: {
            name: "Textiles EFF.",
            icon: "📦",
            stat: "textilesIngredients",
            category: "crafting",
            skill: "textiles",
            description: "Reduces fiber requirements",
            isMultiplier: true
        },
        engineeringSpeed: {
            name: "Engineering SPD.",
            icon: "🔧",
            stat: "engineeringSpeed",
            category: "crafting",
            skill: "engineering",
            description: "Reduces building time",
            isMultiplier: true
        },
        engineeringQuality: {
            name: "Engineering Quality",
            icon: "✨",
            stat: "engineeringQuality",
            category: "crafting",
            skill: "engineering",
            description: "Improves build quality",
            isMultiplier: true
        },
        engineeringIngredients: {
            name: "Engineering EFF.",
            icon: "📦",
            stat: "engineeringIngredients",
            category: "crafting",
            skill: "engineering",
            description: "Reduces component requirements",
            isMultiplier: true
        },

        // === SPECIAL PERKS ===
        rowMultiplier: {
            name: "Row MULT.",
            icon: "↔️",
            stat: "rowMultiplier",
            category: "special",
            description: "Multiplies entire row",
            isMultiplier: true
        },
        colMultiplier: {
            name: "Column MULT.",
            icon: "↕️",
            stat: "colMultiplier",
            category: "special",
            description: "Multiplies entire column",
            isMultiplier: true
        }
    },

    /**
     * Initialize medal crafting on GameEngine
     */
    init(engine) {
        // Add crafting state if missing
        if (!engine.state.medalCrafting) {
            engine.state.medalCrafting = {
                totalCrafted: 0,
                craftedByTier: {},
                craftedByRarity: {}
            };
        }

        // Bind functions to engine
        engine.craftMedal = this.craftMedal.bind(engine);
        engine.craftMedalBulk = this.craftMedalBulk.bind(engine);
        engine.getMedalCraftingStats = this.getMedalCraftingStats.bind(engine);
    },

    /**
     * Roll for rarity based on tier chances (with multipliers from game balance)
     */
    rollRarity(tierId) {
        const tier = MedalCraftingSystem.craftingTiers[tierId];
        if (!tier) return 'common';

        const baseChances = tier.rarityChances;

        // Apply multipliers from game balance
        const multipliers = {
            common: this.gameBalance.rarityCommonMult || 1.0,
            uncommon: this.gameBalance.rarityUncommonMult || 1.0,
            rare: this.gameBalance.rarityRareMult || 1.0,
            epic: this.gameBalance.rarityEpicMult || 1.0,
            legendary: this.gameBalance.rarityLegendaryMult || 1.0,
            mythic: this.gameBalance.rarityMythicMult || 1.0,
            divine: this.gameBalance.rarityDivineMult || 1.0,
            transcendent: this.gameBalance.rarityTranscendentMult || 1.0,
            creator: this.gameBalance.rarityCreatorMult || 1.0
        };

        // Apply multipliers to base chances
        const modifiedChances = {};
        let totalChance = 0;
        for (let rarity in baseChances) {
            modifiedChances[rarity] = (baseChances[rarity] || 0) * (multipliers[rarity] || 1.0);
            totalChance += modifiedChances[rarity];
        }

        // Normalize chances to sum to 1.0
        const normalizedChances = {};
        for (let rarity in modifiedChances) {
            normalizedChances[rarity] = modifiedChances[rarity] / totalChance;
        }

        // Roll from highest to lowest rarity
        const roll = Math.random();
        let cumulative = 0;

        const rarityOrder = ['creator', 'transcendent', 'divine', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
        for (let rarity of rarityOrder) {
            cumulative += normalizedChances[rarity] || 0;
            if (roll <= cumulative) {
                return rarity;
            }
        }

        return 'common';
    },

    /**
     * Generate random perks for a medal
     * Perks are multipliers that affect hidden game variables
     */
    generatePerks(perkCount, rarity) {
        const perks = [];
        const availablePerks = Object.keys(MedalCraftingSystem.perkTypes);
        const rarityData = MedalCraftingSystem.rarities[rarity];

        // Select unique random perks (allows diverse skill combinations on one medal)
        const selectedPerkTypes = [];
        for (let i = 0; i < perkCount; i++) {
            let attempts = 0;
            let perkType;

            do {
                perkType = availablePerks[Math.floor(Math.random() * availablePerks.length)];
                attempts++;
            } while (selectedPerkTypes.includes(perkType) && attempts < 100);

            // If we couldn't find a unique perk after 100 attempts, allow duplicates
            if (attempts >= 100) {
                perkType = availablePerks[Math.floor(Math.random() * availablePerks.length)];
            }

            selectedPerkTypes.push(perkType);
            const perkDef = MedalCraftingSystem.perkTypes[perkType];

            // Calculate multiplier value based on rarity
            // Apply global perk strength multiplier from dev tools (default 1.0)
            const strengthMult = window.medalPerkStrengthMultiplier || 1.0;
            let value;

            // Row/Column multipliers work differently (additive bonuses)
            if (perkType === 'rowMultiplier' || perkType === 'colMultiplier') {
                // 0.1 to 0.5 based on rarity
                value = 0.1 * rarityData.powerMultiplier * (0.8 + Math.random() * 0.4) * strengthMult;
            } else {
                // Percentage multipliers (0.01 = 1%, 0.10 = 10%, etc.)
                // Base multiplier scales with rarity: 1% to 100%
                const minMultiplier = 0.01 * rarityData.powerMultiplier;
                const maxMultiplier = 0.02 * rarityData.powerMultiplier;
                value = (minMultiplier + (Math.random() * (maxMultiplier - minMultiplier))) * strengthMult;
            }

            perks.push({
                type: perkType,
                stat: perkDef.stat,
                value: value,
                icon: perkDef.icon,
                name: perkDef.name,
                category: perkDef.category,
                skill: perkDef.skill
            });
        }

        return perks;
    },

    /**
     * Craft a single medal
     */
    craftMedal(tierId) {
        const tier = MedalCraftingSystem.craftingTiers[tierId];
        if (!tier) {
            return { success: false, reason: "Invalid tier" };
        }

        // Check if player has enough medals
        if (!this.state.currencies || this.state.currencies.medals < tier.cost) {
            return { success: false, reason: "Not enough medals" };
        }

        // Initialize medal crafting state if needed
        if (!this.state.medalCrafting) {
            this.state.medalCrafting = {
                totalCrafted: 0,
                craftedByTier: {},
                craftedByRarity: {}
            };
        }

        // Deduct cost
        this.state.currencies.medals -= tier.cost;

        // Roll rarity (no pity system)
        const rarity = MedalCraftingSystem.rollRarity(tierId);
        const rarityData = MedalCraftingSystem.rarities[rarity];

        // Generate perks
        const perks = MedalCraftingSystem.generatePerks(rarityData.perkCount, rarity);

        // Create medal object
        const medal = {
            id: `crafted_medal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${rarityData.name} Medal`,
            icon: rarityData.icon,
            rarity: rarity,
            tier: tierId,
            perks: perks,
            craftedAt: Date.now()
        };

        // Add to inventory
        if (!this.state.craftedMedals) {
            this.state.craftedMedals = [];
        }
        this.state.craftedMedals.push(medal);

        // Update stats
        this.state.medalCrafting.totalCrafted++;
        this.state.medalCrafting.craftedByTier[tierId] = (this.state.medalCrafting.craftedByTier[tierId] || 0) + 1;
        this.state.medalCrafting.craftedByRarity[rarity] = (this.state.medalCrafting.craftedByRarity[rarity] || 0) + 1;

        return {
            success: true,
            medal: medal,
            rarity: rarity
        };
    },

    /**
     * Craft multiple medals at once
     */
    craftMedalBulk(tierId, count) {
        const results = {
            success: true,
            crafted: [],
            byRarity: {},
            totalCost: 0,
            failed: 0
        };

        for (let i = 0; i < count; i++) {
            const result = this.craftMedal(tierId);

            if (result.success) {
                results.crafted.push(result.medal);
                results.totalCost += MedalCraftingSystem.craftingTiers[tierId].cost;

                const rarity = result.rarity;
                results.byRarity[rarity] = (results.byRarity[rarity] || 0) + 1;
            } else {
                results.failed++;
                break; // Stop if we run out of medals
            }
        }

        return results;
    },

    /**
     * Get crafting statistics
     */
    getMedalCraftingStats() {
        return {
            totalCrafted: this.state.medalCrafting?.totalCrafted || 0,
            craftedByTier: this.state.medalCrafting?.craftedByTier || {},
            craftedByRarity: this.state.medalCrafting?.craftedByRarity || {},
            currentMedals: this.state.currencies?.medals || 0,
            inventoryMedals: this.state.craftedMedals?.length || 0
        };
    }
};
