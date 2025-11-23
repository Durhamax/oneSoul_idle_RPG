/**
 * SKILL SYSTEM
 *
 * Manages skill progression, experience gain, leveling, and skill-based bonuses.
 */

const SkillSystem = {
    /**
     * Initialize skill system functions on the GameEngine
     * @param {object} engine - Reference to GameEngine
     */
    init(engine) {
        // Attach all skill functions to engine
        engine.gainSkillExp = this.gainSkillExp.bind(engine);
        engine.getSkillExpRequired = this.getSkillExpRequired.bind(engine);
        engine.getSkillMultiplier = this.getSkillMultiplier.bind(engine);
        engine.getResourceSkill = this.getResourceSkill.bind(engine);
        engine.gainCharacterExp = this.gainCharacterExp.bind(engine);
        engine.getCharacterExpRequired = this.getCharacterExpRequired.bind(engine);
        engine.assignAttributePoint = this.assignAttributePoint.bind(engine);
        engine.resetAttributes = this.resetAttributes.bind(engine);
    },

    /**
     * Get skill multiplier for a resource type
     */
    getSkillMultiplier(resourceType) {
        let multiplier = 1.0;
        const skillId = this.getResourceSkill(resourceType);

        if (!skillId) return multiplier;

        const skill = this.state.skills[skillId];
        const skillDef = this.definitions.skills[skillId];

        if (!skill || !skillDef.bonusPerLevel) return multiplier;

        // Formula: 1.0 + (bonusPerLevel * level)
        multiplier += (skillDef.bonusPerLevel * skill.level);

        return multiplier;
    },

    /**
     * Map resource types to their associated skill
     */
    getResourceSkill(resourceType) {
        const mapping = {
            ore: "mining",
            wood: "logging"
        };
        return mapping[resourceType] || null;
    },

    /**
     * Calculate EXP required for next skill level
     * Endless exponential formula: baseExp * (scalingFactor ^ (currentLevel - 1))
     * Example with base=100, scaling=1.15:
     *   Level 1→2: 100 * 1.15^0 = 100 XP
     *   Level 2→3: 100 * 1.15^1 = 115 XP
     *   Level 3→4: 100 * 1.15^2 = 132 XP
     *   Level 10→11: 100 * 1.15^9 = 354 XP
     *   Level 50→51: 100 * 1.15^49 = 77,377 XP
     */
    getSkillExpRequired(skillId) {
        const skill = this.state.skills[skillId];
        const baseExp = this.gameBalance.skillBaseExpLv1to2;
        const scaling = this.gameBalance.skillExpScaling;

        // Formula: baseExp * (scaling ^ (level - 1))
        return Math.floor(baseExp * Math.pow(scaling, skill.level - 1));
    },

    /**
     * Gain skill experience
     */
    gainSkillExp(skillId, amount) {
        if (!skillId || !this.state.skills[skillId]) return;

        const skill = this.state.skills[skillId];
        skill.exp += amount;

        // Emit event for UI update (SkillCard component)
        if (typeof EventBus !== 'undefined') {
            EventBus.emit('skill-xp-gained', {
                skillId: skillId,
                amount: amount,
                currentExp: skill.exp,
                level: skill.level
            });
        }

        // Check for level up
        const expRequired = this.getSkillExpRequired(skillId);
        if (skill.exp >= expRequired) {
            skill.exp -= expRequired;
            skill.level++;
            const def = this.definitions.skills[skillId];
            console.log(`⬆️ ${def.name} leveled up to ${skill.level}!`);

            // Emit level-up event
            if (typeof EventBus !== 'undefined') {
                EventBus.emit('skill-level-up', {
                    skillId: skillId,
                    newLevel: skill.level
                });
            }
        }

        // Also grant character XP at reduced rate
        const generalExpRate = this.definitions.characterLevel.generalExpRate;
        const characterExp = amount * generalExpRate;
        this.gainCharacterExp(characterExp);
    },

    /**
     * Gain character experience
     */
    gainCharacterExp(amount) {
        const charLevel = this.state.characterLevel;
        charLevel.exp += amount;

        // Check for level up
        const expRequired = this.getCharacterExpRequired();
        if (charLevel.exp >= expRequired) {
            charLevel.exp -= expRequired;
            charLevel.level++;

            // Award attribute points
            const pointsAwarded = this.definitions.characterLevel.attributePointsPerLevel;
            charLevel.unassignedAttributePoints += pointsAwarded;

            console.log(`🌟 Character leveled up to ${charLevel.level}!`);
            console.log(`📈 Gained ${pointsAwarded} attribute points!`);

            // Trigger level up animation
            if (typeof Animations !== 'undefined') {
                Animations.showLevelUp(charLevel.level);
                Animations.showNotification(`Level ${charLevel.level}! +${pointsAwarded} Attribute Points`, 'success', 4000);
            }

            // Trigger UI update to refresh Skills tab and notification badges
            if (typeof UICore !== 'undefined' && UICore.update) {
                UICore.update();
            }
        }
    },

    /**
     * Get experience required for next character level
     * Uses slower exponential scaling than skills
     * Example with base=500, scaling=1.10:
     *   Level 1→2: 500 * 1.10^0 = 500 XP
     *   Level 2→3: 500 * 1.10^1 = 550 XP
     *   Level 3→4: 500 * 1.10^2 = 605 XP
     *   Level 10→11: 500 * 1.10^9 = 1,179 XP
     *   Level 50→51: 500 * 1.10^49 = 58,596 XP
     */
    getCharacterExpRequired() {
        const level = this.state.characterLevel.level;
        const baseExp = this.gameBalance.characterBaseExpLv1to2;
        const scaling = this.gameBalance.characterExpScaling;

        // Formula: baseExp * (scaling ^ (level - 1))
        return Math.floor(baseExp * Math.pow(scaling, level - 1));
    },

    /**
     * Assign an attribute point
     */
    assignAttributePoint(attributeId) {
        if (!this.definitions.combatAttributes[attributeId]) {
            return { success: false, reason: "Invalid attribute" };
        }

        if (this.state.characterLevel.unassignedAttributePoints <= 0) {
            return { success: false, reason: "No unassigned points available" };
        }

        // Assign the point
        this.state.combatAttributes[attributeId]++;
        this.state.characterLevel.unassignedAttributePoints--;

        console.log(`✨ Assigned point to ${this.definitions.combatAttributes[attributeId].name}`);

        // Trigger UI update to refresh immediately
        if (typeof UICore !== 'undefined' && UICore.update) {
            UICore.update();
        }

        return { success: true };
    },

    /**
     * Reset all attribute points (costs gold or special item - implement later)
     */
    resetAttributes() {
        // Calculate total points assigned
        let totalPoints = 0;
        for (let attr in this.state.combatAttributes) {
            totalPoints += this.state.combatAttributes[attr];
            this.state.combatAttributes[attr] = 0;
        }

        // Return points to unassigned pool
        this.state.characterLevel.unassignedAttributePoints += totalPoints;

        console.log(`🔄 Reset all attributes. ${totalPoints} points available to reassign.`);
        return { success: true, pointsReturned: totalPoints };
    }
};
