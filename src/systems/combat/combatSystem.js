/**
 * COMBAT SYSTEM (Rev1)
 *
 * Real-time simultaneous combat system
 * Both player and enemy attack on independent timers
 */

const CombatSystem = {
    /**
     * Initialize combat system
     */
    init(engine) {
        console.log('✅ CombatSystem initialized (Rev1)');

        // Attach combat functions to engine
        engine.startCombat = this.startCombat.bind(this);
        engine.endCombat = this.endCombat.bind(this);
        engine.updateCombat = this.update.bind(this);

        // Initialize default perk multipliers structure
        engine.getDefaultPerkMultipliers = this.getDefaultPerkMultipliers.bind(this);
    },

    /**
     * Get default perk multipliers
     */
    getDefaultPerkMultipliers() {
        return {
            // Attribute Scaling
            healthScaling: 1.0,
            strengthScaling: 1.0,
            defenseScaling: 1.0,
            mobilityScaling: 1.0,
            perceptionScaling: 1.0,
            stealthScaling: 1.0,
            intelligenceScaling: 1.0,

            // Combat Stats
            maxHealth: 1.0,
            meleeDamage: 1.0,
            rangedDamage: 1.0,
            accuracy: 1.0,
            evasion: 1.0,
            critRating: 1.0,
            critResistance: 1.0,
            critMultiplier: 1.0,
            attackSpeed: 1.0,

            // Defense
            armorRating: 1.0,
            damageReduction: 1.0,

            // Consumable Effectiveness
            foodHealing: 1.0,
            potionPotency: 1.0,
            techPotency: 1.0,

            // Consumable Conservation
            foodConservation: 1.0,
            potionConservation: 1.0,
            techConservation: 1.0,
            ammoConservation: 1.0,

            // Auto-Eat
            autoEatThreshold: 1.0,
            autoEatEfficiency: 1.0,

            // Type Resistances
            pierceResist: 1.0,
            explosiveResist: 1.0,
            cryoResist: 1.0,
            shockResist: 1.0,
            incendiaryResist: 1.0,

            // Loot (new perk names)
            combatXP: 1.0,
            goldFind: 1.0,
            fragmentFind: 1.0,
            itemFind: 1.0
        };
    },

    /**
     * Start combat encounter
     */
    startCombat(player, enemy) {
        // Validate enemy object
        if (!enemy || typeof enemy !== 'object') {
            console.error(`❌ [COMBAT] Invalid enemy passed to startCombat:`, enemy);
            return null;
        }

        console.log(`⚔️ [COMBAT START] vs ${enemy.name} (Lv.${enemy.level})`);
        console.log(`   Enemy: ${enemy.maxHP} HP | ${enemy.minDamage}-${enemy.maxDamage} dmg | ${enemy.attackInterval}ms interval | ${enemy.damageType} dmg / ${enemy.armorType} armor`);
        console.log(`   Enemy Accuracy: ${enemy.accuracy} | Enemy Evasion: ${enemy.evasion} | Enemy CritRating: ${enemy.critRating}`);
        console.log(`   Enemy Object Keys:`, Object.keys(enemy));
        console.log(`   Player Attributes:`, player.combatAttributes);
        console.log(`   Player Equipment:`, player.equipment);

        // Compile weapon data at combat start (resolve instanced IDs once)
        const compiledWeapon = this.compileWeaponData(player);
        const compiledAmmo = this.compileAmmoData(player);

        // Initialize combat state
        player.combat = {
            inCombat: true,
            currentEnemy: enemy,

            // Pre-compiled equipment data (resolved once, used throughout combat)
            compiledWeapon: compiledWeapon,
            playerAmmo: compiledAmmo,

            // Timers
            playerTimer: CombatTimers.createTimerState(),
            enemyTimer: CombatTimers.createTimerState(),

            // Auto-consumption
            lastAutoEat: 0,

            // Combat log
            log: [],

            // Session stats
            session: {
                damageDealt: 0,
                damageTaken: 0,
                hits: 0,
                misses: 0,
                crits: 0,
                kills: 0,
                foodConsumed: 0,
                ammoConsumed: 0
            }
        };

        console.log(`   Compiled Weapon:`, compiledWeapon ? `${compiledWeapon.name} (${compiledWeapon.weaponType})` : 'None');
        console.log(`   Compiled Ammo:`, compiledAmmo ? `${compiledAmmo.ammoName} x${compiledAmmo.currentAmmo}` : 'None');

        // Use centralized compiled stats when available (from StatCompiler)
        // This ensures combat uses the same stat values as other systems
        const compiledStats = typeof GameEngine !== 'undefined' && GameEngine.state?.compiledStats;

        // Get perk multipliers from compiled stats or fall back to getPerkMultipliers
        if (compiledStats && compiledStats.perkMultipliers) {
            player.perkMultipliers = compiledStats.perkMultipliers;
            console.log(`   Perk Multipliers (from compiled):`, Object.entries(player.perkMultipliers).filter(([k, v]) => v !== 1.0));
        } else if (typeof GameEngine !== 'undefined' && GameEngine.getPerkMultipliers) {
            player.perkMultipliers = GameEngine.getPerkMultipliers();
            console.log(`   Perk Multipliers (from getPerkMultipliers):`, Object.entries(player.perkMultipliers).filter(([k, v]) => v !== 1.0));
        } else {
            player.perkMultipliers = this.getDefaultPerkMultipliers();
        }

        // Enemy uses defaults (enemies don't have perk grids)
        if (!enemy.perkMultipliers) {
            enemy.perkMultipliers = this.getDefaultPerkMultipliers();
        }

        // Use pre-compiled maxHealth if available, otherwise calculate
        let calculatedMaxHP;
        if (compiledStats && compiledStats.maxHealth) {
            calculatedMaxHP = compiledStats.maxHealth;
            console.log(`   HP Source: compiledStats.maxHealth = ${calculatedMaxHP}`);
        } else {
            calculatedMaxHP = AutoConsumption.calculateMaxHP(player);
            console.log(`   HP Source: AutoConsumption.calculateMaxHP = ${calculatedMaxHP}`);
        }
        player.currentHP = player.currentHP || calculatedMaxHP;
        player.maxHP = calculatedMaxHP;
        enemy.currentHP = enemy.maxHP || enemy.health || 100;

        // Log HP calculation details
        const healthAttr = player.combatAttributes?.health || player.attributes?.health || 1;
        const healthScaling = player.perkMultipliers?.healthScaling || 1.0;
        const maxHealthPerk = player.perkMultipliers?.maxHealth || 1.0;
        console.log(`   Player: ${player.currentHP}/${player.maxHP} HP (Health attr: ${healthAttr}, healthScaling: ${healthScaling}, maxHealth perk: ${maxHealthPerk})`);

        // Compile equipment stats
        this.compilePlayerStats(player);
        this.compileEnemyStats(enemy);

        // Log compiled stats
        console.log(`   Player compiled: ACC=${player.accuracy} | CRIT=${player.critRating} | DMG=${player.minDamage}-${player.maxDamage}`);
        console.log(`   Enemy compiled: ACC=${enemy.accuracy} | CRIT=${enemy.critRating} | EVA=${enemy.evasion}`);

        // Add combat start log
        this.addLog(player.combat, `Combat started against ${enemy.name}!`);

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('combat-started', { player, enemy });
        }

        return player.combat;
    },

    /**
     * End combat encounter
     */
    endCombat(player, victory) {
        if (!player.combat || !player.combat.inCombat) {
            console.log('⚠️ [COMBAT] endCombat called but no active combat');
            return;
        }

        const combat = player.combat;
        const enemy = combat.currentEnemy;

        console.log(`🏁 [COMBAT] Ending combat - Victory: ${victory}`);
        console.log(`📊 [COMBAT] Session stats:`, combat.session);

        // Add end log
        if (victory) {
            this.addLog(combat, `Victory! ${enemy.name} defeated!`);
            combat.session.kills++;

            // Award loot/XP here
            this.awardLoot(player, enemy);
        } else {
            this.addLog(combat, `Defeat! You were slain by ${enemy.name}.`);
        }

        // Emit event
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('combat-ended', {
                result: victory ? 'victory' : 'defeat',
                enemy: enemy.name,
                session: { ...combat.session }
            });
        }

        // Clean up
        combat.inCombat = false;
        combat.currentEnemy = null;

        return combat.session;
    },

    /**
     * Main combat update loop (called each tick)
     */
    update(deltaTime, player) {
        if (!player.combat || !player.combat.inCombat) {
            return;
        }

        const combat = player.combat;
        const enemy = combat.currentEnemy;

        if (!enemy) {
            console.log('❌ [COMBAT] No enemy found, ending combat');
            this.endCombat(player, false);
            return;
        }

        // Check for combat end conditions
        if (player.currentHP <= 0) {
            console.log('💀 [COMBAT] Player defeated! HP: 0/' + player.maxHP);
            this.endCombat(player, false);
            return;
        }

        if (enemy.currentHP <= 0) {
            console.log('🏆 [COMBAT] Victory! ' + enemy.name + ' defeated');
            this.endCombat(player, true);
            return;
        }

        // Process auto-eat
        const autoEatResult = AutoConsumption.processAutoEat(player, combat);
        if (autoEatResult && autoEatResult.success) {
            console.log(`🍖 [COMBAT] Auto-eat: ${autoEatResult.foodName} (+${autoEatResult.healed} HP) | Player HP: ${player.currentHP}/${player.maxHP}`);
            this.addLog(combat, `Auto-eat: Consumed ${autoEatResult.foodName}, healed ${autoEatResult.healed} HP`);

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player-healed', {
                    amount: autoEatResult.healed,
                    source: 'food',
                    foodName: autoEatResult.foodName
                });
            }
        }

        // Update player attack timer
        const playerInterval = this.getPlayerAttackInterval(player);
        const playerReady = CombatTimers.updateTimer(combat.playerTimer, deltaTime, playerInterval.interval);

        if (playerReady) {
            this.performPlayerAttack(player, enemy, combat);
        }

        // Update enemy attack timer
        const enemyInterval = enemy.attackInterval || 2000; // Default 2 seconds
        const enemyReady = CombatTimers.updateTimer(combat.enemyTimer, deltaTime, enemyInterval);

        if (enemyReady) {
            this.performEnemyAttack(enemy, player, combat);
        }
    },

    /**
     * Perform player attack
     */
    performPlayerAttack(player, enemy, combat) {
        // Check if can attack (ammo check)
        const canAttack = AutoConsumption.canAttack(player);
        if (!canAttack.canAttack) {
            console.log(`⚔️ [PLAYER] Cannot attack: ${canAttack.reason}`);
            this.addLog(combat, `Cannot attack: ${canAttack.reason}`);
            return;
        }

        // Consume ammo if needed
        const ammoResult = AutoConsumption.consumeAmmo(player, combat);
        if (!ammoResult.success) {
            console.log(`⚔️ [PLAYER] Out of ammo: ${ammoResult.reason}`);
            this.addLog(combat, `Cannot attack: ${ammoResult.reason}`);
            return;
        }

        // Perform 3-roll attack sequence
        const attackResult = this.performAttack(player, enemy);

        // Log result
        if (!attackResult.hit.success) {
            const hitChance = (attackResult.hit.chance * 100).toFixed(1);
            console.log(`⚔️ [PLAYER] MISS vs ${enemy.name} | Hit chance: ${hitChance}% | Enemy HP: ${enemy.currentHP}/${enemy.maxHP}`);
            this.addLog(combat, `You missed ${enemy.name}!`);
            combat.session.misses++;

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('attack-missed', { attacker: 'player', target: 'enemy' });
            }
        } else {
            const critText = attackResult.crit.success ? ' CRIT!' : '';
            const newEnemyHP = Math.max(0, enemy.currentHP - attackResult.finalDamage);
            console.log(`⚔️ [PLAYER] HIT${critText} ${enemy.name} for ${attackResult.finalDamage} dmg | Enemy HP: ${enemy.currentHP} → ${newEnemyHP}/${enemy.maxHP}`);
            this.addLog(combat, `You hit ${enemy.name} for ${attackResult.finalDamage} damage${critText ? ' (CRITICAL!)' : ''}`);

            combat.session.hits++;
            if (attackResult.crit.success) combat.session.crits++;
            combat.session.damageDealt += attackResult.finalDamage;

            // Apply damage to enemy
            enemy.currentHP = newEnemyHP;

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('enemy-damaged', {
                    damage: attackResult.finalDamage,
                    isCrit: attackResult.crit.success,
                    currentHP: enemy.currentHP,
                    maxHP: enemy.maxHP
                });
            }
        }
    },

    /**
     * Perform enemy attack
     */
    performEnemyAttack(enemy, player, combat) {
        // Perform 3-roll attack sequence
        const attackResult = this.performAttack(enemy, player);

        // Log result
        if (!attackResult.hit.success) {
            const hitChance = (attackResult.hit.chance * 100).toFixed(1);
            console.log(`👾 [ENEMY] MISS vs Player | Hit chance: ${hitChance}% | Player HP: ${player.currentHP}/${player.maxHP}`);
            this.addLog(combat, `${enemy.name} missed you!`);

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('attack-missed', { attacker: 'enemy', target: 'player' });
            }
        } else {
            const critText = attackResult.crit.success ? ' CRIT!' : '';
            const newPlayerHP = Math.max(0, player.currentHP - attackResult.finalDamage);
            console.log(`👾 [ENEMY] HIT${critText} Player for ${attackResult.finalDamage} dmg | Player HP: ${player.currentHP} → ${newPlayerHP}/${player.maxHP}`);
            this.addLog(combat, `${enemy.name} hit you for ${attackResult.finalDamage} damage${critText ? ' (CRITICAL!)' : ''}`);

            combat.session.damageTaken += attackResult.finalDamage;

            // Apply damage to player
            player.currentHP = newPlayerHP;

            // Emit event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('player-damaged', {
                    damage: attackResult.finalDamage,
                    isCrit: attackResult.crit.success,
                    currentHP: player.currentHP,
                    maxHP: player.maxHP
                });
            }
        }
    },

    /**
     * Perform complete attack (3 rolls + damage calculation)
     */
    performAttack(attacker, defender) {
        // Roll 1: Hit Check
        const hitRoll = CombatRolls.performHitRoll(attacker, defender);

        if (!hitRoll.success) {
            return {
                hit: hitRoll,
                crit: { success: false },
                damageRoll: { damage: 0 },
                finalDamage: 0
            };
        }

        // Roll 2: Crit Check
        const critRoll = CombatRolls.performCritRoll(attacker, defender);

        // Roll 3: Damage Roll
        const damageRoll = CombatRolls.performDamageRoll(attacker);

        // Apply crit multiplier if crit
        let rawDamage = damageRoll.damage;
        if (critRoll.success) {
            const critMult = (attacker.perkMultipliers?.critMultiplier || 1.0) * 2.0;
            rawDamage = Math.floor(rawDamage * critMult);
        }

        // Calculate final damage through pipeline
        const damageResult = DamageCalculator.calculateFinalDamage(rawDamage, attacker, defender);

        return {
            hit: hitRoll,
            crit: critRoll,
            damageRoll: damageRoll,
            rawDamage: rawDamage,
            finalDamage: damageResult.damage,
            pipeline: damageResult.pipeline
        };
    },

    /**
     * Get player attack interval
     */
    getPlayerAttackInterval(player) {
        // Use compiled weapon data if available (set at combat start)
        const compiledWeapon = player.combat?.compiledWeapon;
        const baseInterval = compiledWeapon?.attackInterval || 2000; // Default 2 seconds

        return CombatTimers.calculateAttackInterval(player, baseInterval);
    },

    /**
     * Compile player stats from equipment
     * Uses centralized compiled stats when available for consistency
     */
    compilePlayerStats(player) {
        // Check for centralized compiled stats first (from StatCompiler)
        const centralStats = typeof GameEngine !== 'undefined' && GameEngine.state?.compiledStats;

        if (centralStats && centralStats.lastCompiled) {
            // Use pre-compiled offense/defense stats from StatCompiler
            player.compiledStats = {
                offense: {
                    baseDamage: centralStats.baseDamage || 0,
                    damageRatings: centralStats.damageRatings || {},
                    weaponAccuracyMod: 1.0
                },
                defense: {
                    armorRating: centralStats.armorRating || 0,
                    damageReduction: centralStats.damageReduction || 0,
                    flatEvasionBonus: centralStats.flatEvasionBonus || 0,
                    ratings: centralStats.armorRatings || {},
                    total: Object.values(centralStats.armorRatings || {}).reduce((a, b) => a + b, 0)
                },
                weight: centralStats.equipmentWeight || 0
            };
        } else if (typeof EquipmentSystem !== 'undefined' && EquipmentSystem.compileStats) {
            // Fallback to EquipmentSystem compilation
            player.compiledStats = EquipmentSystem.compileStats(player);
        } else {
            // Fallback to local compilation
            player.compiledStats = this.compileEquipmentStats(player);
        }

        // Calculate combat stats (accuracy, crit, damage ranges)
        this.calculateCombatStats(player);
    },

    /**
     * Compile enemy stats
     * Converts baseDamage + ratios to minDamage/maxDamage for combat rolls
     */
    compileEnemyStats(enemy) {
        // Calculate minDamage and maxDamage from baseDamage and ratios if not already set
        if (enemy.baseDamage && !enemy.minDamage) {
            const minRatio = enemy.minDamageRatio || 0.5;
            const maxRatio = enemy.maxDamageRatio || 1.5;
            enemy.minDamage = Math.floor(enemy.baseDamage * minRatio);
            enemy.maxDamage = Math.floor(enemy.baseDamage * maxRatio);
            console.log(`   Enemy damage computed: ${enemy.minDamage}-${enemy.maxDamage} (base ${enemy.baseDamage} × ${minRatio}-${maxRatio})`);
        }

        // Ensure enemy has necessary stat structures
        if (!enemy.compiledStats) {
            enemy.compiledStats = {
                defense: {
                    armorRating: enemy.armorRating || 0,
                    damageReduction: enemy.damageReduction || 0,
                    flatEvasionBonus: 0,
                    ratings: enemy.armorRatings || { plated: 100 },
                    total: Object.values(enemy.armorRatings || { plated: 100 }).reduce((a, b) => a + b, 0)
                },
                damage: {
                    ratings: enemy.damageRatings || { pierce: 100 },
                    total: Object.values(enemy.damageRatings || { pierce: 100 }).reduce((a, b) => a + b, 0)
                },
                weight: 0
            };
        }

        this.calculateCombatStats(enemy);
    },

    /**
     * Calculate derived combat stats (accuracy, crit, etc.)
     * Note: For enemies, stats like accuracy/critRating are already set from definition.
     * For players, uses centralized compiled stats when available for consistency.
     */
    calculateCombatStats(combatant) {
        const mult = combatant.perkMultipliers || {};
        const attr = combatant.attributes || combatant.combatAttributes || {};

        // Check if this is a player (has equipment) or an enemy (has enemyId)
        const isPlayer = combatant.equipment !== undefined && !combatant.enemyId;

        // Check for centralized compiled stats (from StatCompiler)
        const centralStats = isPlayer && typeof GameEngine !== 'undefined' && GameEngine.state?.compiledStats;

        // Get weapon for accuracy modifier (player only)
        const weaponSlot = combatant.equipment?.weapon;
        let weaponDef = null;
        if (weaponSlot) {
            // Use centralized ItemIdUtils for consistent ID resolution
            if (typeof ItemIdUtils !== 'undefined') {
                weaponDef = ItemIdUtils.getItemDefinition(weaponSlot);
            } else {
                // Fallback to manual extraction
                const baseId = this.getBaseItemId(weaponSlot);
                if (baseId && typeof ItemRegistry !== 'undefined') {
                    weaponDef = ItemRegistry.getItem(baseId);
                }
            }
        }

        // Calculate weapon accuracy modifier (player only)
        const weaponAccuracyMod = typeof WeaponStats !== 'undefined' && weaponDef
            ? WeaponStats.calculateAccuracyModifier(weaponDef)
            : 1.0;

        // Only calculate stats for players - enemies keep their definition values
        if (isPlayer) {
            // Use pre-compiled stats if available, otherwise calculate
            if (centralStats && centralStats.accuracy !== undefined) {
                // Use centralized compiled values
                combatant.accuracy = centralStats.accuracy;
                combatant.critRating = centralStats.critRating;
                combatant.critResistance = centralStats.critResistance;
                combatant.evasion = centralStats.evasion;
            } else {
                // Fallback to manual calculation
                // Accuracy from Perception with weapon modifier
                const baseAccuracy = (attr.perception || 0) * 5;
                combatant.accuracy = Math.floor(
                    baseAccuracy
                    * weaponAccuracyMod
                    * (mult.perceptionScaling || 1.0)
                    * (mult.accuracy || 1.0)
                );

                // Crit Rating from Stealth
                combatant.critRating = Math.floor(
                    (attr.stealth || 0) * 1
                    * (mult.stealthScaling || 1.0)
                    * (mult.critRating || 1.0)
                );

                // Crit Resistance from Perception
                combatant.critResistance = Math.floor(
                    (attr.perception || 0) * 10
                    * (mult.perceptionScaling || 1.0)
                    * (mult.critResistance || 1.0)
                );
            }
        }
        // Enemies already have accuracy, critRating, etc. from their definition - don't overwrite!

        // Store weapon accuracy modifier for UI display
        if (!combatant.compiledStats) {
            combatant.compiledStats = {};
        }
        if (!combatant.compiledStats.offense) {
            combatant.compiledStats.offense = {};
        }
        combatant.compiledStats.offense.weaponAccuracyMod = weaponAccuracyMod;

        // Calculate min/max damage (player only - enemies have this from definition)
        if (isPlayer && weaponDef) {
            const baseDamage = weaponDef.baseDamage || 0;
            let damageWithBonus = baseDamage;

            // Determine if weapon is melee or ranged based on weaponType/weaponCategory
            const rangedTypes = ['ranged', 'pistol', 'rifle', 'bow', 'crossbow'];
            const meleeTypes = ['melee', 'sword', 'axe', 'mace', 'dagger', 'balancedMelee'];
            const weaponType = weaponDef.weaponType || weaponDef.weaponCategory || 'melee';

            const isRanged = rangedTypes.includes(weaponType);
            const isMelee = meleeTypes.includes(weaponType);

            // Add Strength for melee weapons
            if (isMelee) {
                damageWithBonus += (attr.strength || 0);
                damageWithBonus = Math.floor(damageWithBonus * (mult.meleeDamage || 1.0));
            }
            // Apply ranged multiplier for ranged weapons
            else if (isRanged) {
                damageWithBonus = Math.floor(damageWithBonus * (mult.rangedDamage || 1.0));
            }

            combatant.minDamage = Math.floor(damageWithBonus * 0.5);
            combatant.maxDamage = Math.floor(damageWithBonus * 1.5);
        } else {
            combatant.minDamage = combatant.minDamage || 1;
            combatant.maxDamage = combatant.maxDamage || 3;
        }
    },

    /**
     * Compile equipment stats (fallback if EquipmentSystem not available)
     */
    compileEquipmentStats(player) {
        const slots = ['weapon', 'armor', 'back', 'neck', 'ring', 'gloves', 'boots'];
        const mult = player.perkMultipliers || {};

        const defenseRatings = { insulated: 0, plated: 0, airborne: 0, droid: 0, biological: 0 };
        const damageRatings = { pierce: 0, explosive: 0, cryo: 0, shock: 0, incendiary: 0 };

        let totalArmorRating = 0;
        let totalDamageReduction = 0;
        let totalWeight = 0;
        let flatEvasionBonus = 0;

        for (const slot of slots) {
            const item = player.equipment?.[slot];
            if (!item) continue;

            if (item.armorRating) totalArmorRating += item.armorRating;
            if (item.damageReduction) totalDamageReduction += item.damageReduction;
            if (item.weight) totalWeight += item.weight;
            if (item.evasionBonus) flatEvasionBonus += item.evasionBonus;

            if (item.armorRatings) {
                for (const [type, rating] of Object.entries(item.armorRatings)) {
                    if (defenseRatings.hasOwnProperty(type)) defenseRatings[type] += rating;
                }
            }

            if (item.damageRatings) {
                for (const [type, rating] of Object.entries(item.damageRatings)) {
                    if (damageRatings.hasOwnProperty(type)) damageRatings[type] += rating;
                }
            }
        }

        // Add ammo damage ratings
        const ammo = player.equipment?.ammo;
        if (ammo?.damageRatings) {
            for (const [type, rating] of Object.entries(ammo.damageRatings)) {
                if (damageRatings.hasOwnProperty(type)) damageRatings[type] += rating;
            }
        }

        // Apply multipliers
        totalArmorRating = Math.floor(totalArmorRating * (mult.armorRating || 1.0));
        flatEvasionBonus = Math.floor(flatEvasionBonus * (mult.evasion || 1.0));

        const defenseTotal = Object.values(defenseRatings).reduce((a, b) => a + b, 0);
        const damageTotal = Object.values(damageRatings).reduce((a, b) => a + b, 0);

        return {
            defense: {
                armorRating: totalArmorRating,
                damageReduction: totalDamageReduction,
                flatEvasionBonus: flatEvasionBonus,
                ratings: defenseRatings,
                total: defenseTotal
            },
            damage: {
                ratings: damageRatings,
                total: damageTotal
            },
            weight: totalWeight
        };
    },

    /**
     * Add message to combat log
     */
    addLog(combat, message) {
        combat.log.push({
            timestamp: Date.now(),
            message: message
        });

        // Keep log to last 50 messages
        if (combat.log.length > 50) {
            combat.log.shift();
        }
    },

    /**
     * Award loot and XP with multipliers from compiled stats
     */
    awardLoot(player, enemy) {
        // Get compiled stats for loot multipliers
        const compiled = typeof GameEngine !== 'undefined' && GameEngine.state?.compiledStats;
        const mult = player.perkMultipliers || {};

        // ═══ COMBAT XP ═══
        const baseXP = enemy.baseXP || enemy.xpReward || 10;
        const xpMultiplier = compiled?.combatXPMultiplier || mult.combatXP || 1.0;
        const xp = Math.floor(baseXP * xpMultiplier);

        // ═══ GOLD with goldFind multiplier ═══
        // Supports both { min, max } object and legacy single number
        const goldDrop = enemy.goldDrop;
        let baseGold = 0;
        if (goldDrop && typeof goldDrop === 'object') {
            // Roll between min and max (inclusive)
            baseGold = this.rollRange(goldDrop.min, goldDrop.max);
        } else {
            baseGold = goldDrop || 5;
        }
        const goldMultiplier = compiled?.goldFindMultiplier || mult.goldFind || 1.0;
        const gold = Math.round(baseGold * goldMultiplier);

        console.log(`💰 Loot: Gold ${baseGold} × ${goldMultiplier.toFixed(2)} = ${gold} | XP ${baseXP} × ${xpMultiplier.toFixed(2)} = ${xp}`);

        // Award gold to player
        if (player.currencies) {
            player.currencies.gold = (player.currencies.gold || 0) + gold;

            // Emit event for gold drop
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('loot-dropped', {
                    itemId: 'gold',
                    quantity: gold,
                    rarity: 'common'
                });
            }
        }

        // ═══ MEDAL FRAGMENTS with fragmentFind multiplier ═══
        // Supports { min, max } object format
        const fragmentDrop = enemy.fragmentDrop;
        if (fragmentDrop) {
            let baseFragments = 0;
            if (typeof fragmentDrop === 'object') {
                // Roll between min and max (inclusive)
                baseFragments = this.rollRange(fragmentDrop.min, fragmentDrop.max);
            } else {
                // Legacy: single number
                baseFragments = fragmentDrop;
            }

            if (baseFragments > 0) {
                const fragmentMultiplier = compiled?.fragmentFindMultiplier || mult.fragmentFind || 1.0;
                const fragments = Math.round(baseFragments * fragmentMultiplier);

                console.log(`🏅 Loot: Fragments ${baseFragments} × ${fragmentMultiplier.toFixed(2)} = ${fragments}`);

                if (player.currencies && fragments > 0) {
                    player.currencies.medalFragments = (player.currencies.medalFragments || 0) + fragments;

                    // Emit event for fragment drop
                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('loot-dropped', {
                            itemId: 'medalFragments',
                            quantity: fragments,
                            rarity: 'uncommon'
                        });
                    }
                }
            }
        }

        // ═══ ITEM DROPS with itemFind multiplier ═══
        // Check both 'loot' (new schema) and 'lootTable' (legacy) arrays
        const lootArray = enemy.loot || enemy.lootTable;
        if (lootArray && Array.isArray(lootArray)) {
            const itemMultiplier = compiled?.itemFindMultiplier || mult.itemFind || 1.0;

            for (const lootEntry of lootArray) {
                // Roll for drop chance
                const roll = Math.random();
                const baseChance = lootEntry.chance || 0.1;

                if (roll < baseChance) {
                    // Roll quantity within range
                    // Supports: { quantity: 1 }, { quantity: { min, max } }, { minQty, maxQty }
                    let baseQty = 1;
                    if (lootEntry.quantity && typeof lootEntry.quantity === 'object') {
                        baseQty = this.rollRange(lootEntry.quantity.min, lootEntry.quantity.max);
                    } else if (lootEntry.minQty !== undefined || lootEntry.maxQty !== undefined) {
                        baseQty = this.rollRange(lootEntry.minQty || 1, lootEntry.maxQty || 1);
                    } else {
                        baseQty = lootEntry.quantity || 1;
                    }

                    // Apply item find multiplier to quantity
                    const finalQty = Math.round(baseQty * itemMultiplier);

                    if (finalQty > 0) {
                        // Add item to player inventory
                        if (typeof GameEngine !== 'undefined' && GameEngine.addItemToBank) {
                            GameEngine.addItemToBank(lootEntry.itemId, finalQty);
                        } else if (typeof InventorySystem !== 'undefined' && InventorySystem.addItem) {
                            InventorySystem.addItem(player, lootEntry.itemId, finalQty, { isNew: true });
                        }

                        // Emit event
                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('loot-dropped', {
                                itemId: lootEntry.itemId,
                                quantity: finalQty,
                                rarity: lootEntry.rarity || 'common'
                            });
                        }

                        console.log(`🎁 Loot: ${lootEntry.itemId} × ${baseQty} × ${itemMultiplier.toFixed(2)} = ${finalQty}`);
                    }
                }
            }
        }

        // TODO: Integrate with player progression system for XP
    },

    /**
     * Roll a random integer between min and max (inclusive)
     * Uses uniform distribution
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer in range [min, max]
     */
    rollRange(min, max) {
        min = Math.floor(min || 0);
        max = Math.floor(max || 0);
        if (min > max) [min, max] = [max, min]; // Swap if reversed
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Helper: Extract base item ID from instanced ID
     * Delegates to centralized ItemIdUtils for consistent ID parsing
     * e.g., "sidekick22_1764441114356_r431m1xvb" -> "sidekick22"
     */
    getBaseItemId(itemIdOrSlot) {
        // Use centralized utility for consistent ID parsing
        if (typeof ItemIdUtils !== 'undefined') {
            return ItemIdUtils.getBaseItemId(itemIdOrSlot);
        }

        // Fallback if ItemIdUtils not loaded yet
        if (!itemIdOrSlot) return null;

        if (typeof itemIdOrSlot === 'object') {
            return itemIdOrSlot.baseItemId || itemIdOrSlot.itemId || null;
        }

        if (typeof itemIdOrSlot === 'string') {
            // Match pattern: baseId_13digitTimestamp_randomId
            const match = itemIdOrSlot.match(/^(.+)_(\d{13})_([a-z0-9]+)$/i);
            if (match) {
                return match[1];
            }
            return itemIdOrSlot;
        }

        return null;
    },

    /**
     * Compile weapon data at combat start
     * Resolves instanced item IDs to full definitions using ItemIdUtils
     */
    compileWeaponData(player) {
        const weaponSlot = player.equipment?.weapon;
        if (!weaponSlot) return null;

        // Use ItemIdUtils for consistent ID resolution
        const baseId = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getBaseItemId(weaponSlot)
            : this.getBaseItemId(weaponSlot);
        if (!baseId) return null;

        const weaponDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(weaponSlot)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(baseId) : null);

        if (!weaponDef) {
            console.warn(`⚠️ [CombatSystem] Could not find weapon definition for: ${weaponSlot} (base: ${baseId})`);
            return null;
        }

        // Return compiled weapon data
        return {
            baseId: baseId,
            instanceId: typeof weaponSlot === 'string' ? weaponSlot : weaponSlot.instanceId,
            name: weaponDef.name,
            icon: weaponDef.icon,
            weaponType: weaponDef.weaponType || 'melee',
            baseDamage: weaponDef.baseDamage || 10,
            attackInterval: weaponDef.attackInterval || 2000,
            requiresAmmo: weaponDef.requiresAmmo || false,
            ammoType: weaponDef.ammoType || null,
            damageType: weaponDef.damageType || 'pierce',
            damageRatings: weaponDef.damageRatings || { pierce: 100 },
            accuracyModifier: weaponDef.accuracyModifier || 1.0,
            weight: weaponDef.weight || 0
        };
    },

    /**
     * Compile ammo data at combat start
     * Resolves instanced item IDs to full definitions using ItemIdUtils
     */
    compileAmmoData(player) {
        const ammoSlot = player.equipment?.ammo;
        if (!ammoSlot) return null;

        // Use ItemIdUtils for consistent ID resolution
        const baseId = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getBaseItemId(ammoSlot)
            : this.getBaseItemId(ammoSlot);
        if (!baseId) return null;

        const ammoDef = typeof ItemIdUtils !== 'undefined'
            ? ItemIdUtils.getItemDefinition(ammoSlot)
            : (typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(baseId) : null);

        // Get quantity from bank (stackable items store quantity in bank, not equipment slot)
        // Equipment slot for ammo is just the item ID string (the base item ID)
        let quantity = 0;

        if (typeof ammoSlot === 'string') {
            // Ammo slot is a string ID - look up quantity in bank
            // bank.stackable stores quantities as plain numbers: bank.stackable[itemId] = number
            const stackableEntry = player.bank?.stackable?.[ammoSlot];
            const legacyEntry = player.bank?.items?.[ammoSlot];

            if (typeof stackableEntry === 'number') {
                // New dual-bank system: stackable is stored as a number
                quantity = stackableEntry;
            } else if (typeof legacyEntry === 'number') {
                // Legacy system: bank.items stored as number
                quantity = legacyEntry;
            } else if (legacyEntry && typeof legacyEntry === 'object') {
                // Legacy system: bank.items stored as object with quantity
                quantity = legacyEntry.quantity || 0;
            }
        } else if (typeof ammoSlot === 'object') {
            // Legacy: ammo slot is an object with quantity
            quantity = ammoSlot.quantity || 0;
        }

        console.log(`   Ammo lookup: ${baseId} | slot: "${ammoSlot}" | stackable: ${player.bank?.stackable?.[ammoSlot]} | quantity: ${quantity}`);

        return {
            ammoId: baseId,
            ammoName: ammoDef?.name || baseId,
            ammoType: ammoDef?.ammoType || 'arrow',
            currentAmmo: quantity,
            maxAmmo: quantity,
            damageRatings: ammoDef?.damageRatings || {}
        };
    },

    /**
     * Test functions
     */
    testWeightedRoll(attackStat, defenseStat) {
        const result = CombatRolls.weightedRoll(attackStat, defenseStat);
        console.log('Weighted Roll Test:', result);
        return result;
    },

    testTypeEffectiveness(damageRatings, armorRatings) {
        const result = TypeEffectiveness.calculate(damageRatings, armorRatings);
        console.log('Type Effectiveness Test:', result);
        return result;
    },

    testDamagePipeline(rawDamage, attacker, defender) {
        const result = DamageCalculator.calculateFinalDamage(rawDamage, attacker, defender);
        console.log('Damage Pipeline Test:', result);
        return result;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}
