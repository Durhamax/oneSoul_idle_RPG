/**
 * Combat System
 * Handles all combat-related functionality including attacks, damage calculation, and enemy management
 */

/**
 * Unified Status Effect Definitions
 * Central source of truth for all status effects in the game
 */
const STATUS_EFFECTS = {
    frozen: {
        icon: '❄️',
        overlay: 'frozen',
        duration: 3000,
        tickDamage: 0,
        tickInterval: 0,
        speedReduction: 0.5,
        color: '#03a9f4',
        name: 'Frozen',
        description: 'Slowed by ice'
    },
    shocked: {
        icon: '⚡',
        overlay: 'shocked',
        duration: 2000,
        tickDamage: 5,
        tickInterval: 500,
        speedReduction: 0,
        color: '#ffeb3b',
        name: 'Shocked',
        description: 'Taking lightning damage over time',
        damageType: 'shock'
    },
    poisoned: {
        icon: '☠️',
        overlay: 'poisoned',
        duration: 5000,
        tickDamage: 3,
        tickInterval: 1000,
        speedReduction: 0,
        color: '#4caf50',
        name: 'Poisoned',
        description: 'Taking poison damage over time',
        damageType: 'poison'
    },
    burning: {
        icon: '🔥',
        overlay: 'burning',
        duration: 4000,
        tickDamage: 4,
        tickInterval: 750,
        speedReduction: 0,
        color: '#ff9800',
        name: 'Burning',
        description: 'Taking fire damage over time',
        damageType: 'incendiary'
    },
    bleeding: {
        icon: '🩸',
        overlay: 'bleeding',
        duration: 6000,
        tickDamage: 2,
        tickInterval: 1000,
        speedReduction: 0,
        color: '#8b0000',
        name: 'Bleeding',
        description: 'Taking bleed damage over time',
        damageType: 'pierce'
    },
    armor_break: {
        icon: '💔',
        overlay: 'armor-broken',
        duration: 8000,
        tickDamage: 0,
        tickInterval: 0,
        defenseLoss: 0.3,
        speedReduction: 0,
        color: '#9e9e9e',
        name: 'Armor Break',
        description: 'Armor reduced by 30%'
    }
};

const CombatSystem = {
    /**
     * Helper: Get enemy definition from EnemyRegistry first, fallback to definitions
     */
    _getEnemyDef(enemyId, engine) {
        let enemyDef = null;
        if (typeof EnemyRegistry !== 'undefined') {
            enemyDef = EnemyRegistry.getAllActive()[enemyId];
        }
        if (!enemyDef && engine.definitions) {
            enemyDef = engine.definitions.enemies?.[enemyId];
        }
        return enemyDef;
    },

    /**
     * Helper: Get item definition from ItemRegistry first, fallback to definitions
     */
    _getItemDef(itemId, engine) {
        let itemDef = null;
        if (typeof ItemRegistry !== 'undefined') {
            itemDef = ItemRegistry.getItem(itemId);
        }
        if (!itemDef && engine.definitions) {
            itemDef = engine.definitions.items?.[itemId];
        }
        return itemDef;
    },

    /**
     * Initialize the combat system and bind methods to the game engine
     * @param {Object} engine - The game engine instance
     */
    init(engine) {
        // Bind all combat methods to engine
        engine.startCombat = this.startCombat.bind(engine);
        engine.playerAttack = this.playerAttack.bind(engine);
        engine.enemyAttack = this.enemyAttack.bind(engine);
        engine.applyHPRegeneration = this.applyHPRegeneration.bind(engine);
        engine.defeatEnemy = this.defeatEnemy.bind(engine);
        engine.rollLoot = this.rollLoot.bind(engine);
        engine.collectLoot = this.collectLoot.bind(engine);
        engine.playerDefeated = this.playerDefeated.bind(engine);
        engine.endCombat = this.endCombat.bind(engine);
        engine.checkEnemyRespawn = this.checkEnemyRespawn.bind(engine);
        engine.fleeCombat = this.fleeCombat.bind(engine);
        engine.healPlayer = this.healPlayer.bind(engine);
        engine.addCombatLog = this.addCombatLog.bind(engine);
        engine.applyStatusEffect = this.applyStatusEffect.bind(engine);
        engine.applySpecialEffect = this.applySpecialEffect.bind(engine);
        engine.processActiveEffects = this.processActiveEffects.bind(engine);
        engine.autoConsumeFood = this.autoConsumeFood.bind(engine);
        engine.toggleStance = this.toggleStance.bind(engine);
        engine.triggerAttackAnimation = this.triggerAttackAnimation.bind(engine);

        console.log('✅ Combat System initialized');
    },

    // =============================================================================
    // COMBAT SYSTEM
    // =============================================================================

    /**
     * Start combat with an enemy
     */
    startCombat(enemyId) {
        const enemyDef = CombatSystem._getEnemyDef(enemyId, this);

        if (!enemyDef) {
            return { success: false, reason: "Enemy not found" };
        }

        // Check unlock requirements
        if (!this.meetsRequirement(enemyDef.unlockRequirement)) {
            return { success: false, reason: "Enemy not unlocked yet" };
        }

        // Stop other activities
        if (this.state.currentActivity === 'navigation') {
            this.stopNavigation();
        }
        if (this.state.currentActivity === 'nodeCollection') {
            if (this.stopNodeHarvesting) {
                this.stopNodeHarvesting();
            }
        }

        // Set combat as current activity
        this.state.currentActivity = 'combat';

        // Create enemy instance
        this.state.combat.currentEnemy = {
            id: enemyId,
            name: enemyDef.name,
            image: enemyDef.image,
            currentHealth: enemyDef.stats.maxHealth,
            maxHealth: enemyDef.stats.maxHealth,
            attackDamage: enemyDef.stats.attackDamage,
            attackSpeed: enemyDef.stats.attackSpeed,
            accuracy: enemyDef.stats.accuracy,
            lastAttackTime: Date.now()
        };

        this.state.combat.inCombat = true;
        this.state.combat.selectedEnemyId = enemyId;  // Save for respawning
        this.state.combat.waitingForRespawn = false;
        this.state.combat.combatLog = [];
        this.state.combat.firstStrike = true; // Track first attack for STEALTH bonus

        // Initialize player ammo if using a gun
        const equippedWeapon = this.state.equipment.weapon;
        const playerStats = this.getPlayerCombatStats();
        if (equippedWeapon) {
            const weaponDef = CombatSystem._getItemDef(equippedWeapon, this);
            if (weaponDef?.magazineSize) {
                // Player has a gun, initialize magazine to full
                this.state.combat.playerAmmo.magazineSize = weaponDef.magazineSize;
                this.state.combat.playerAmmo.currentAmmo = weaponDef.magazineSize;
                this.state.combat.playerAmmo.isReloading = false;
                // Apply STRENGTH reload time reduction
                const reloadReduction = 1 - playerStats.reloadTimeReduction;
                this.state.combat.playerAmmo.reloadDuration = Math.max(500, weaponDef.reloadTime * reloadReduction);
            } else {
                // Not a gun, reset ammo tracking
                this.state.combat.playerAmmo.magazineSize = 0;
                this.state.combat.playerAmmo.currentAmmo = 0;
            }
        }

        // Initialize enemy ammo if using a gun
        if (enemyDef.magazineSize) {
            this.state.combat.currentEnemy.magazineSize = enemyDef.magazineSize;
            this.state.combat.currentEnemy.currentAmmo = enemyDef.magazineSize;
            this.state.combat.currentEnemy.isReloading = false;
            this.state.combat.currentEnemy.reloadDuration = enemyDef.reloadTime || 2000;
            this.state.combat.currentEnemy.reloadStartTime = 0;
        }

        // Initialize food quantity for auto-eat system
        const equippedFood = this.state.equipment.food;
        if (equippedFood && this.state.bank.items[equippedFood]) {
            this.state.combat.equippedFoodQuantity = this.state.bank.items[equippedFood].quantity;
        } else {
            this.state.combat.equippedFoodQuantity = 0;
        }

        this.addCombatLog(`⚔️ Combat started with ${enemyDef.name}!`);

        console.log(`⚔️ Engaged in combat with ${enemyDef.name}`);

        return { success: true };
    },

    /**
     * Player attacks enemy
     */
    playerAttack() {
        if (!this.state.combat.inCombat || !this.state.combat.currentEnemy) {
            return { success: false, reason: "Not in combat" };
        }

        const now = Date.now();
        const playerStats = this.getPlayerCombatStats();
        const enemy = this.state.combat.currentEnemy;
        const ammo = this.state.combat.playerAmmo;

        // Check if player is reloading
        if (ammo.isReloading) {
            // Check if reload complete
            if (now - ammo.reloadStartTime >= ammo.reloadDuration) {
                // Reload complete!
                ammo.isReloading = false;
                ammo.currentAmmo = ammo.magazineSize;
                this.addCombatLog(`🔄 <span style="color: #4a9eff;">Reload complete!</span>`);
            } else {
                // Still reloading
                return { success: false, reason: "Reloading" };
            }
        }

        // Check if gun is out of ammo and needs reload
        if (ammo.magazineSize > 0 && ammo.currentAmmo <= 0) {
            // Trigger reload
            ammo.isReloading = true;
            ammo.reloadStartTime = now;
            this.addCombatLog(`🔄 <span style="color: #ffd43b;">Reloading...</span>`);
            return { success: false, reason: "Out of ammo, reloading" };
        }

        // Check attack speed cooldown using effectiveAttackInterval
        const timeSinceLastAttack = now - this.state.combat.lastAttackTime;

        if (timeSinceLastAttack < playerStats.effectiveAttackInterval) {
            return { success: false, reason: "Attack on cooldown" };
        }

        // Set attacking flag (for disabling equipment swaps during attack animation)
        this.state.combat.isAttacking = true;
        setTimeout(() => {
            this.state.combat.isAttacking = false;
        }, 300); // Clear after 300ms (attack animation duration)

        this.state.combat.lastAttackTime = now;

        // Check if attack hits using effectiveHitChance
        const hitRoll = Math.random() * 100;
        if (hitRoll > playerStats.effectiveHitChance) {
            this.addCombatLog("💨 You missed!");
            // Show miss hit splat
            if (CombatUI && CombatUI.createHitSplat) {
                CombatUI.createHitSplat(0, 'pierce', false, 'enemy', true);
            }
            return { success: true, hit: false };
        }

        // Check for critical hit
        const critRoll = Math.random() * 100;
        const isCritical = critRoll < playerStats.criticalChance;

        // Calculate damage using weighted roll system
        // Roll between minHit and maxHit with weighted distribution favoring higher damage
        const damageRange = playerStats.maxHit - playerStats.minHit;
        const totalWeight = playerStats.damageRollWeightAbove + playerStats.damageRollWeightBelow;
        const weightedRoll = Math.random() * totalWeight;

        let damageMultiplier;
        if (weightedRoll < playerStats.damageRollWeightAbove) {
            // High damage roll (weighted toward max)
            damageMultiplier = 0.5 + (weightedRoll / playerStats.damageRollWeightAbove) * 0.5;
        } else {
            // Low damage roll
            damageMultiplier = (weightedRoll - playerStats.damageRollWeightAbove) / playerStats.damageRollWeightBelow * 0.5;
        }

        let damage = Math.floor(playerStats.minHit + (damageRange * damageMultiplier));

        // Apply type effectiveness (weapon damage type vs enemy armor type)
        const weaponDamageType = this.getWeaponDamageType();
        const enemyDef = CombatSystem._getEnemyDef(enemy.id, this);
        const enemyArmorType = enemyDef?.stats?.armorType || 'biological';
        const typeMultiplier = this.calculateDamageMultiplier(weaponDamageType, enemyArmorType);
        damage = Math.floor(damage * typeMultiplier);

        // Apply STEALTH first strike bonus (only on first attack)
        if (this.state.combat.firstStrike) {
            const firstStrikeMultiplier = 1 + playerStats.firstStrikeBonusDamage;
            damage = Math.floor(damage * firstStrikeMultiplier);
            this.state.combat.firstStrike = false; // Consume first strike bonus
        }

        // Check for special attack proc
        let isSpecialAttack = false;
        let specialAttackData = null;
        const equippedWeapon = this.state.equipment.weapon;
        if (equippedWeapon) {
            const weaponDef = CombatSystem._getItemDef(equippedWeapon, this);
            if (weaponDef?.specialAttack) {
                const specialRoll = Math.random();
                // Apply INTELLECT special attack chance bonus
                const effectiveSpecialChance = weaponDef.specialAttack.chance + playerStats.specialAttackChanceBonus;
                if (specialRoll < effectiveSpecialChance) {
                    isSpecialAttack = true;
                    specialAttackData = weaponDef.specialAttack;
                    // Apply special attack damage multiplier
                    damage = Math.floor(damage * specialAttackData.damageMultiplier);
                }
            }
        }

        // Apply critical multiplier
        if (isCritical) {
            damage = Math.floor(damage * playerStats.criticalImpact);

            // Log with type effectiveness indicator
            let typeIndicator = '';
            if (typeMultiplier > 1.0) {
                typeIndicator = ' [SUPER EFFECTIVE!]';
            } else if (typeMultiplier < 1.0) {
                typeIndicator = ' [Not very effective...]';
            }

            if (isSpecialAttack) {
                this.addCombatLog(`<span style="color: #ffd700; font-weight: bold;">✨ ${specialAttackData.name}!</span> 💥 CRITICAL! ${damage} damage!${typeIndicator}`);
            } else {
                this.addCombatLog(`💥 CRITICAL HIT! You dealt ${damage} damage!${typeIndicator}`);
            }

            // Trigger attack animations with timing
            this.triggerAttackAnimation(damage, weaponDamageType, true, 'enemy');
        } else {
            // Log with type effectiveness indicator
            let typeIndicator = '';
            if (typeMultiplier > 1.0) {
                typeIndicator = ' [SUPER EFFECTIVE!]';
            } else if (typeMultiplier < 1.0) {
                typeIndicator = ' [Not very effective...]';
            }

            if (isSpecialAttack) {
                this.addCombatLog(`<span style="color: #ffd700; font-weight: bold;">✨ ${specialAttackData.name}!</span> ⚔️ ${damage} damage!${typeIndicator}`);
            } else {
                this.addCombatLog(`⚔️ You hit for ${damage} damage!${typeIndicator}`);
            }

            // Trigger attack animations with timing
            this.triggerAttackAnimation(damage, weaponDamageType, false, 'enemy');
        }

        // Apply damage to enemy
        enemy.currentHealth -= damage;

        // Consume ammo if using a gun
        if (ammo.magazineSize > 0) {
            ammo.currentAmmo--;
        }

        // Apply special attack effect if triggered
        if (isSpecialAttack && specialAttackData.effect) {
            this.applySpecialEffect(specialAttackData.effect);
        }

        // Apply lifesteal
        if (playerStats.lifestealPercent > 0) {
            const healAmount = Math.floor(damage * (playerStats.lifestealPercent / 100));
            if (healAmount > 0) {
                this.state.combat.player.currentHealth = Math.min(
                    this.state.combat.player.currentHealth + healAmount,
                    playerStats.maxHealth
                );
                this.addCombatLog(`💚 Lifesteal restored ${healAmount} HP`);
                // Show healing hit splat
                if (CombatUI && CombatUI.createHitSplat) {
                    CombatUI.createHitSplat(healAmount, 'healing', false, 'player', false, true);
                }
            }
        }

        // Check if enemy defeated
        if (enemy.currentHealth <= 0) {
            return this.defeatEnemy();
        }

        return { success: true, hit: true, damage: damage, critical: isCritical };
    },

    /**
     * Enemy attacks player (called automatically)
     */
    enemyAttack() {
        if (!this.state.combat.inCombat || !this.state.combat.currentEnemy) {
            return;
        }

        const enemy = this.state.combat.currentEnemy;
        const now = Date.now();

        // Check if enemy is reloading
        if (enemy.isReloading) {
            // Check if reload complete
            if (now - enemy.reloadStartTime >= enemy.reloadDuration) {
                // Reload complete!
                enemy.isReloading = false;
                enemy.currentAmmo = enemy.magazineSize;
                this.addCombatLog(`🔄 <span style="color: #ff6b6b;">${enemy.name} reloaded!</span>`);
            } else {
                // Still reloading
                return;
            }
        }

        // Check if enemy gun is out of ammo and needs reload
        if (enemy.magazineSize && enemy.currentAmmo <= 0) {
            // Trigger reload
            enemy.isReloading = true;
            enemy.reloadStartTime = now;
            this.addCombatLog(`🔄 <span style="color: #ffd43b;">${enemy.name} is reloading...</span>`);
            return;
        }

        // Check enemy attack cooldown
        const attackCooldown = 1000 / enemy.attackSpeed;
        const timeSinceLastAttack = now - enemy.lastAttackTime;

        if (timeSinceLastAttack < attackCooldown) {
            return;
        }

        enemy.lastAttackTime = now;

        const playerStats = this.getPlayerCombatStats();

        // Check if player evades using evasionRating
        const evasionRoll = Math.random() * 100;
        if (evasionRoll < playerStats.evasionRating) {
            this.addCombatLog(`🌪️ You evaded ${enemy.name}'s attack!`);
            // Show evade hit splat
            const enemyDef = CombatSystem._getEnemyDef(enemy.id, this);
            const enemyDamageType = enemyDef?.stats?.damageType || 'pierce';
            if (CombatUI && CombatUI.createHitSplat) {
                CombatUI.createHitSplat(0, enemyDamageType, false, 'player', true);
            }
            return;
        }

        // Check if attack hits
        const hitRoll = Math.random() * 100;
        // Apply STEALTH enemy accuracy reduction
        const effectiveEnemyAccuracy = enemy.accuracy * (1 - playerStats.enemyAccuracyReduction);
        if (hitRoll > effectiveEnemyAccuracy) {
            this.addCombatLog(`💨 ${enemy.name} missed!`);
            // Show miss hit splat
            const enemyDef = CombatSystem._getEnemyDef(enemy.id, this);
            const enemyDamageType = enemyDef?.stats?.damageType || 'pierce';
            if (CombatUI && CombatUI.createHitSplat) {
                CombatUI.createHitSplat(0, enemyDamageType, false, 'player', true);
            }
            return;
        }

        // Calculate damage
        const variance = 0.9 + Math.random() * 0.2;
        let damage = Math.floor(enemy.attackDamage * variance);

        // Apply type effectiveness (enemy damage type vs player armor type)
        const enemyDef = CombatSystem._getEnemyDef(enemy.id, this);
        const enemyDamageType = enemyDef?.stats?.damageType || 'pierce';
        const playerArmorType = this.getPlayerDominantArmorType();
        const typeMultiplier = this.calculateDamageMultiplier(enemyDamageType, playerArmorType);
        damage = Math.floor(damage * typeMultiplier);

        // Apply percentage damage reduction
        if (playerStats.damageReductionRate > 0) {
            damage = damage * (1 - playerStats.damageReductionRate);
        }

        // Apply absolute damage reduction
        damage = Math.max(1, damage - playerStats.absoluteDamageReduction);

        damage = Math.floor(damage);

        // Apply damage to player
        this.state.combat.player.currentHealth -= damage;

        // Consume enemy ammo if using a gun
        if (enemy.magazineSize) {
            enemy.currentAmmo--;
        }

        // Log with type effectiveness indicator
        let typeIndicator = '';
        if (typeMultiplier > 1.0) {
            typeIndicator = ' [SUPER EFFECTIVE!]';
        } else if (typeMultiplier < 1.0) {
            typeIndicator = ' [Not very effective...]';
        }
        this.addCombatLog(`💥 ${enemy.name} hit you for ${damage} damage!${typeIndicator}`);

        // Show damage hit splat
        if (CombatUI && CombatUI.createHitSplat) {
            CombatUI.createHitSplat(damage, enemyDamageType, false, 'player');
        }

        // Try to auto-consume food if health is low
        this.autoConsumeFood();

        // Check if player defeated
        if (this.state.combat.player.currentHealth <= 0) {
            this.playerDefeated();
        }
    },

    /**
     * Apply HP regeneration to player in combat
     * @param {number} deltaTime - Time elapsed in seconds
     */
    applyHPRegeneration(deltaTime) {
        if (!this.state.combat.inCombat) {
            return;
        }

        const playerStats = this.getPlayerCombatStats();

        // Apply HP regeneration if not at max health
        if (this.state.combat.player.currentHealth < playerStats.maxHealth && playerStats.hpRegenerationRate > 0) {
            const regenAmount = playerStats.hpRegenerationRate * deltaTime;
            this.state.combat.player.currentHealth = Math.min(
                this.state.combat.player.currentHealth + regenAmount,
                playerStats.maxHealth
            );
        }
    },

    /**
     * Enemy defeated - give rewards
     */
    defeatEnemy() {
        const enemy = this.state.combat.currentEnemy;
        const enemyDef = CombatSystem._getEnemyDef(enemy.id, this);

        this.addCombatLog(`🎉 You defeated ${enemy.name}!`);

        // Trigger mission objective check for enemy kills
        if (this.checkMissionObjectives) {
            this.checkMissionObjectives('enemy_killed', {
                enemyId: enemy.id
            });
        }

        // Grant combat experience
        if (enemyDef.rewards.exp.combat) {
            this.gainSkillExp("combat", enemyDef.rewards.exp.combat);
            this.addCombatLog(`📈 Gained ${enemyDef.rewards.exp.combat} combat EXP!`);
        }

        // Roll for loot
        const loot = this.rollLoot(enemyDef);

        // Add loot to pending
        this.state.combat.pendingLoot.push({
            timestamp: Date.now(),
            items: loot
        });

        // Start respawn timer instead of ending combat
        this.state.combat.currentEnemy = null;
        this.state.combat.inCombat = false;
        this.state.combat.waitingForRespawn = true;
        this.state.combat.enemyDefeatedAt = Date.now();

        const respawnSeconds = enemyDef.respawnTime / 1000;
        this.addCombatLog(`⏳ ${enemy.name} will respawn in ${respawnSeconds}s...`);

        return { success: true, defeated: true };
    },

    /**
     * Roll for loot from enemy loot table
     */
    rollLoot(enemyDef) {
        const loot = [];

        // Roll for gold
        const goldAmount = Math.floor(
            enemyDef.rewards.gold.min +
            Math.random() * (enemyDef.rewards.gold.max - enemyDef.rewards.gold.min)
        );
        loot.push({ type: 'currency', id: 'gold', amount: goldAmount });

        // Roll for medals
        const medalsAmount = Math.floor(
            enemyDef.rewards.medals.min +
            Math.random() * (enemyDef.rewards.medals.max - enemyDef.rewards.medals.min)
        );
        loot.push({ type: 'currency', id: 'medals', amount: medalsAmount });

        // Roll for items from loot table
        if (enemyDef.lootTable) {
            for (let entry of enemyDef.lootTable) {
                // Get item rarity to adjust drop chance
                const rarity = this.getItemRarity(entry.itemId);
                const rarityMultiplier = rarity ? (rarity.dropWeight / 100) : 1.0;

                // Apply rarity modifier to drop chance (rarer items drop less frequently)
                const adjustedChance = entry.chance * rarityMultiplier;

                const roll = Math.random();
                if (roll < adjustedChance) {
                    const amount = Math.floor(
                        entry.min + Math.random() * (entry.max - entry.min + 1)
                    );
                    loot.push({ type: 'item', id: entry.itemId, amount: amount });
                }
            }
        }

        return loot;
    },

    /**
     * Collect all pending loot
     */
    collectLoot() {
        if (this.state.combat.pendingLoot.length === 0) {
            return { success: false, reason: "No loot to collect" };
        }

        const totalCollected = {
            currencies: {},
            items: {}
        };

        // Collect all pending loot
        for (let lootDrop of this.state.combat.pendingLoot) {
            for (let item of lootDrop.items) {
                if (item.type === 'currency') {
                    this.state.currencies[item.id] += item.amount;
                    totalCollected.currencies[item.id] = (totalCollected.currencies[item.id] || 0) + item.amount;
                } else if (item.type === 'item') {
                    this.addItemToBank(item.id, item.amount);
                    totalCollected.items[item.id] = (totalCollected.items[item.id] || 0) + item.amount;
                }
            }
        }

        // Clear pending loot
        this.state.combat.pendingLoot = [];

        console.log("📦 Collected all loot!");
        return { success: true, collected: totalCollected };
    },

    /**
     * Player defeated
     */
    playerDefeated() {
        this.addCombatLog("💀 You were defeated!");

        // Penalty: lose some gold
        const goldLoss = Math.floor(this.state.currencies.gold * 0.1);
        this.state.currencies.gold -= goldLoss;

        if (goldLoss > 0) {
            this.addCombatLog(`💸 Lost ${goldLoss} gold!`);
        }

        // End combat and heal player
        this.endCombat();
        this.healPlayer(100); // Full heal after defeat
    },

    /**
     * End combat
     */
    endCombat() {
        if (this.state.currentActivity === 'combat') {
            this.state.currentActivity = null;
        }
        this.state.combat.inCombat = false;
        this.state.combat.currentEnemy = null;
        this.state.combat.waitingForRespawn = false;
        this.state.combat.selectedEnemyId = null;
        this.state.combat.activeEffects = []; // Clear all active effects
        console.log("⚔️ Combat ended");
    },

    /**
     * Check if enemy should respawn
     */
    checkEnemyRespawn() {
        if (!this.state.combat.waitingForRespawn || !this.state.combat.selectedEnemyId) {
            return;
        }

        const enemyId = this.state.combat.selectedEnemyId;
        const enemyDef = CombatSystem._getEnemyDef(enemyId, this);
        const now = Date.now();
        const timeSinceDefeat = now - this.state.combat.enemyDefeatedAt;

        if (timeSinceDefeat >= enemyDef.respawnTime) {
            // Respawn the enemy
            this.addCombatLog(`✨ ${enemyDef.name} has respawned!`);
            this.startCombat(enemyId);
        }
    },

    /**
     * Flee from combat
     */
    fleeCombat() {
        if (!this.state.combat.inCombat && !this.state.combat.waitingForRespawn) {
            return { success: false, reason: "Not in combat" };
        }

        this.addCombatLog("🏃 You fled from combat!");
        this.endCombat();

        return { success: true };
    },

    /**
     * Heal player
     */
    healPlayer(amount) {
        const stats = this.getPlayerCombatStats();
        this.state.combat.player.currentHealth = Math.min(
            this.state.combat.player.currentHealth + amount,
            stats.maxHealth
        );
    },

    /**
     * Add message to combat log
     */
    addCombatLog(message) {
        this.state.combat.combatLog.push({
            message: message,
            timestamp: Date.now()
        });

        // Keep only last 20 messages
        if (this.state.combat.combatLog.length > 20) {
            this.state.combat.combatLog.shift();
        }
    },

    /**
     * Apply special effect to enemy
     */
    /**
     * Apply a status effect to a target (currently only enemies)
     * @param {string|Object} effectTypeOrObject - Effect type string or full effect object
     * @param {string} target - Target type ('enemy' or 'player')
     */
    applyStatusEffect(effectTypeOrObject, target = 'enemy') {
        const now = Date.now();

        // Determine effect type and get definition
        let effectType, effectDef, customDuration, customDamage;

        if (typeof effectTypeOrObject === 'string') {
            effectType = effectTypeOrObject;
            effectDef = STATUS_EFFECTS[effectType];
        } else {
            // Legacy support: object with type property
            effectType = effectTypeOrObject.type;
            effectDef = STATUS_EFFECTS[effectType];
            customDuration = effectTypeOrObject.duration;
            customDamage = effectTypeOrObject.damagePerTick;
        }

        if (!effectDef) {
            console.warn(`Unknown status effect type: ${effectType}`);
            return;
        }

        // Check if this effect type is already active
        const existingEffect = this.state.combat.activeEffects.find(e => e.type === effectType);

        if (existingEffect) {
            // Refresh duration of existing effect
            existingEffect.startTime = now;
            existingEffect.duration = customDuration || effectDef.duration;
            existingEffect.lastTickTime = now;
            this.addCombatLog(`${effectDef.icon} <span style="color: ${effectDef.color};">${effectDef.name} refreshed!</span>`);
        } else {
            // Add new effect
            const newEffect = {
                type: effectType,
                startTime: now,
                duration: customDuration || effectDef.duration,
                lastTickTime: now,
                damagePerTick: customDamage || effectDef.tickDamage,
                tickInterval: effectDef.tickInterval,
                defenseLoss: effectDef.defenseLoss || 0,
                speedReduction: effectDef.speedReduction || 0,
                damageType: effectDef.damageType || 'pierce'
            };
            this.state.combat.activeEffects.push(newEffect);

            // Log effect application
            this.addCombatLog(`${effectDef.icon} <span style="color: ${effectDef.color};">${effectDef.name} applied!</span>`);

            // Update UI overlays
            if (CombatUI && CombatUI.updateStatusEffects) {
                CombatUI.updateStatusEffects(this.state.combat.activeEffects);
            }
        }
    },

    /**
     * Legacy alias for backward compatibility
     */
    applySpecialEffect(effect) {
        this.applyStatusEffect(effect, 'enemy');
    },

    /**
     * Process active effects (DOTs and debuffs)
     */
    processActiveEffects() {
        if (!this.state.combat.inCombat || !this.state.combat.currentEnemy) {
            return;
        }

        const now = Date.now();
        const enemy = this.state.combat.currentEnemy;
        let effectsChanged = false;

        // Process each active effect
        for (let i = this.state.combat.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.state.combat.activeEffects[i];
            const effectDef = STATUS_EFFECTS[effect.type];

            // Check if effect has expired
            if (now - effect.startTime >= effect.duration) {
                this.state.combat.activeEffects.splice(i, 1);
                effectsChanged = true;

                if (effectDef) {
                    this.addCombatLog(`<span style="color: #888;">${effectDef.icon} ${effectDef.name} wore off</span>`);
                } else {
                    this.addCombatLog(`<span style="color: #888;">${this.capitalizeFirst(effect.type)} wore off</span>`);
                }
                continue;
            }

            // Process DOT effects
            if (effect.damagePerTick > 0 && effect.tickInterval > 0) {
                // Check if it's time for a tick
                if (now - effect.lastTickTime >= effect.tickInterval) {
                    effect.lastTickTime = now;

                    // Apply tick damage
                    // NOTE: HEALTH dotResistance will reduce DOT damage when enemies can apply DOTs to player
                    const damage = effect.damagePerTick;
                    enemy.currentHealth -= damage;

                    // Get effect definition for proper coloring
                    if (effectDef) {
                        this.addCombatLog(`${effectDef.icon} <span style="color: ${effectDef.color};">${effectDef.name} deals ${damage} damage</span>`);

                        // Create colored hit splat for DOT damage
                        if (CombatUI && CombatUI.createHitSplat) {
                            // Use smaller, pulsing hit splat for DOT (75% size)
                            CombatUI.createDOTHitSplat(damage, effect.damageType || effectDef.damageType, 'enemy', effectDef.icon);
                        }
                    } else {
                        this.addCombatLog(`${effect.type} deals ${damage} damage`);
                    }

                    // Check if enemy defeated by DOT
                    if (enemy.currentHealth <= 0) {
                        this.defeatEnemy();
                        return;
                    }
                }
            }
        }

        // Update UI overlays if effects changed
        if (effectsChanged && CombatUI && CombatUI.updateStatusEffects) {
            CombatUI.updateStatusEffects(this.state.combat.activeEffects);
        }
    },

    /**
     * Get enemy defense reduction from active effects
     */
    getEnemyDefenseReduction() {
        let totalReduction = 0;
        for (const effect of this.state.combat.activeEffects) {
            if (effect.defenseLoss) {
                totalReduction += effect.defenseLoss;
            }
        }
        return Math.min(totalReduction, 0.75); // Cap at 75% reduction
    },

    /**
     * Capitalize first letter of a string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Auto-consume equipped food when health drops below threshold
     */
    autoConsumeFood() {
        // Only auto-eat during active combat
        if (!this.state.combat.inCombat) {
            return;
        }

        const now = Date.now();
        const playerStats = this.getPlayerCombatStats();
        const combat = this.state.combat;

        // Check if player health is below threshold (with HEALTH attribute bonus)
        const effectiveThreshold = Math.min(0.95, combat.autoEatThreshold + playerStats.autoEatThresholdBonus);
        const healthPercent = combat.player.currentHealth / playerStats.maxHealth;
        if (healthPercent >= effectiveThreshold) {
            return; // Health is still above threshold
        }

        // Check cooldown
        if (now - combat.lastAutoEatTime < combat.autoEatCooldown) {
            return; // Still on cooldown
        }

        // Check if food is equipped
        const equippedFood = this.state.equipment.food;
        if (!equippedFood) {
            return; // No food equipped
        }

        // Check if we have food quantity remaining
        if (combat.equippedFoodQuantity <= 0) {
            return; // Out of food
        }

        // Get food definition
        const foodDef = CombatSystem._getItemDef(equippedFood, this);
        if (!foodDef || !foodDef.healAmount) {
            return; // Invalid food item
        }

        // Consume the food (with INTELLECT consumable efficiency bonus)
        const baseHealAmount = foodDef.healAmount;
        const healAmount = Math.floor(baseHealAmount * (1 + playerStats.consumableEfficiency));

        // Heal the player
        const oldHealth = combat.player.currentHealth;
        combat.player.currentHealth = Math.min(
            combat.player.currentHealth + healAmount,
            playerStats.maxHealth
        );
        const actualHeal = combat.player.currentHealth - oldHealth;

        // Decrement food quantity in bank
        if (this.state.bank.items[equippedFood]) {
            this.state.bank.items[equippedFood].quantity--;

            // Remove from bank if depleted
            if (this.state.bank.items[equippedFood].quantity <= 0) {
                delete this.state.bank.items[equippedFood];
                this.state.equipment.food = null; // Unequip depleted food
            }
        }

        // Decrement food quantity in combat state
        combat.equippedFoodQuantity--;

        // Update last auto-eat time
        combat.lastAutoEatTime = now;

        // Log the auto-consume
        const foodName = foodDef.name || equippedFood;
        this.addCombatLog(`🍎 <span style="color: #4caf50;">[AUTO] Consumed ${foodName} (+${Math.floor(actualHeal)} HP)</span>`);

        console.log(`🍎 Auto-consumed ${foodName} for ${actualHeal} HP (${combat.equippedFoodQuantity} remaining)`);
    },

    /**
     * Toggle combat stance between offensive and defensive
     */
    toggleStance() {
        const now = Date.now();
        const combat = this.state.combat;

        // Check if on cooldown
        if (now - combat.lastStanceChange < combat.stanceChangeCooldown) {
            const cooldownRemaining = ((combat.stanceChangeCooldown - (now - combat.lastStanceChange)) / 1000).toFixed(1);
            return {
                success: false,
                reason: `Stance change on cooldown (${cooldownRemaining}s remaining)`
            };
        }

        // Toggle stance
        const oldStance = combat.currentStance;
        combat.currentStance = combat.currentStance === "offensive" ? "defensive" : "offensive";
        combat.lastStanceChange = now;

        // Log stance change
        const stanceIcon = combat.currentStance === "defensive" ? "🛡️" : "⚔️";
        const stanceColor = combat.currentStance === "defensive" ? "#4a9eff" : "#f44336";
        const stanceName = combat.currentStance === "defensive" ? "Defensive" : "Offensive";

        this.addCombatLog(`${stanceIcon} <span style="color: ${stanceColor};">Switched to ${stanceName} Stance</span>`);

        console.log(`⚔️ Stance changed from ${oldStance} to ${combat.currentStance}`);

        return {
            success: true,
            newStance: combat.currentStance
        };
    },

    /**
     * Trigger attack animation with proper timing
     * 0ms: Attack button pressed (already happened)
     * 200ms: Weapon winds up (visual feedback)
     * 400ms: Hit connects (spawn hit splat)
     * 600ms: Enemy reacts (shake/flash)
     */
    triggerAttackAnimation(damage, damageType, isCritical, targetType) {
        console.log(`⚡ triggerAttackAnimation called - damage: ${damage}, type: ${damageType}, crit: ${isCritical}, target: ${targetType}`);

        const attackBtn = document.getElementById('attackBtn');
        const combatArena = document.querySelector('.combat-arena');
        const enemyDisplay = document.querySelector('.enemy-side');

        // 0ms: Attack starts - add windup class
        if (attackBtn) {
            attackBtn.classList.add('attack-windup');
            setTimeout(() => attackBtn.classList.remove('attack-windup'), 200);
        }

        // 200ms: Weapon winds up
        setTimeout(() => {
            if (attackBtn) {
                attackBtn.classList.add('attack-impact');
                setTimeout(() => attackBtn.classList.remove('attack-impact'), 200);
            }
        }, 200);

        // 400ms: Hit connects - spawn hit splat
        setTimeout(() => {
            console.log(`💥 Creating hit splat - damage: ${damage}, CombatUI exists: ${!!CombatUI}, createHitSplat exists: ${!!(CombatUI && CombatUI.createHitSplat)}`);
            if (CombatUI && CombatUI.createHitSplat) {
                CombatUI.createHitSplat(damage, damageType, isCritical, targetType);
            } else {
                console.error('❌ CombatUI or createHitSplat not available!');
            }

            // Screen shake on critical hits
            if (isCritical && combatArena) {
                combatArena.classList.add('critical-shake');
                setTimeout(() => combatArena.classList.remove('critical-shake'), 300);
            }
        }, 400);

        // 600ms: Enemy reacts
        setTimeout(() => {
            if (targetType === 'enemy') {
                // Add hit animation to enemy avatar container
                const enemyAvatarContainer = document.getElementById('enemyAvatarContainer');
                if (enemyAvatarContainer) {
                    enemyAvatarContainer.classList.add('hit');
                    setTimeout(() => enemyAvatarContainer.classList.remove('hit'), 300);
                }

                // Also keep the old enemy-hit-react for the display area
                if (enemyDisplay) {
                    enemyDisplay.classList.add('enemy-hit-react');
                    setTimeout(() => enemyDisplay.classList.remove('enemy-hit-react'), 300);
                }
            }
        }, 600);
    }
};
