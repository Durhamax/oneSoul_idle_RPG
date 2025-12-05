/**
 * MISSION SCHEMA
 *
 * Defines the complete structure and validation for mission definitions.
 * Used by MissionRegistry and MissionSystem to ensure mission data integrity.
 *
 * Mission ID Format: mission_XYY
 * - X = Type digit (1-8, see MissionIdUtils)
 * - YY = Order/tier (01-99)
 */

const MissionSchema = {
    /**
     * Complete mission definition schema
     */
    definition: {
        // === REQUIRED FIELDS ===
        required: {
            id: {
                type: 'string',
                pattern: /^mission_\d{3}$/,
                description: 'Unique mission ID in format mission_XYY'
            },
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: 'Display name of the mission'
            },
            description: {
                type: 'string',
                minLength: 1,
                maxLength: 500,
                description: 'Mission description shown to player'
            },
            type: {
                type: 'string',
                enum: ['main', 'side', 'daily', 'milestone', 'regional', 'faction', 'event', 'hidden'],
                description: 'Mission type (must match ID type code)'
            },
            objectives: {
                type: 'array',
                minItems: 1,
                maxItems: 10,
                description: 'Array of objective definitions'
            }
        },

        // === OPTIONAL FIELDS ===
        optional: {
            // --- TIER & DIFFICULTY ---
            tier: {
                type: 'number',
                min: 1,
                max: 10,
                default: 1,
                description: 'Mission tier (1-10)'
            },
            difficulty: {
                type: 'string',
                enum: ['trivial', 'easy', 'normal', 'hard', 'expert', 'legendary'],
                default: 'normal',
                description: 'Difficulty rating'
            },

            // --- REQUIREMENTS ---
            requirements: {
                type: 'object',
                description: 'Prerequisites to start the mission',
                properties: {
                    level: { type: 'number', description: 'Minimum player level' },
                    skills: { type: 'object', description: 'Minimum skill levels { skillId: level }' },
                    missions: { type: 'array', description: 'Required completed mission IDs' },
                    items: { type: 'array', description: 'Required items to have (not consumed)' },
                    regions: { type: 'array', description: 'Required discovered regions' },
                    reputation: { type: 'object', description: 'Required faction reputation { factionId: level }' }
                }
            },

            // --- REWARDS ---
            rewards: {
                type: 'object',
                description: 'Rewards given on completion',
                properties: {
                    experience: { type: 'number', description: 'XP reward' },
                    gold: { type: 'number', description: 'Gold reward' },
                    items: { type: 'array', description: 'Item rewards [{ itemId, quantity, guaranteed? }]' },
                    skills: { type: 'object', description: 'Skill XP rewards { skillId: amount }' },
                    reputation: { type: 'object', description: 'Faction reputation { factionId: amount }' },
                    unlocks: { type: 'array', description: 'IDs of things to unlock (missions, regions, recipes)' }
                }
            },

            // --- NARRATIVE ---
            narrative: {
                type: 'object',
                description: 'Story and dialogue text',
                properties: {
                    intro: { type: 'string', description: 'Text shown when mission becomes available' },
                    accept: { type: 'string', description: 'Text shown when mission is accepted' },
                    progress: { type: 'string', description: 'Text shown while mission is in progress' },
                    complete: { type: 'string', description: 'Text shown on completion' },
                    fail: { type: 'string', description: 'Text shown on failure (if applicable)' }
                }
            },

            // --- TIMING ---
            repeatable: {
                type: 'boolean',
                default: false,
                description: 'Whether mission can be repeated'
            },
            cooldown: {
                type: 'number',
                default: 0,
                description: 'Cooldown in milliseconds before repeat (if repeatable)'
            },
            timeLimit: {
                type: 'number',
                default: 0,
                description: 'Time limit in milliseconds (0 = no limit)'
            },

            // --- CHAINING ---
            chains: {
                type: 'object',
                description: 'Mission chain configuration',
                properties: {
                    next: { type: 'string', description: 'Mission ID to auto-offer on completion' },
                    previous: { type: 'string', description: 'Previous mission in chain' },
                    chainId: { type: 'string', description: 'Chain group identifier' },
                    chainOrder: { type: 'number', description: 'Position in chain' }
                }
            },

            // --- LOCATION ---
            region: {
                type: 'string',
                description: 'Region where mission takes place'
            },
            questGiver: {
                type: 'string',
                description: 'NPC who gives the mission'
            },

            // --- DISPLAY ---
            icon: {
                type: 'string',
                description: 'Icon for mission display'
            },
            tags: {
                type: 'array',
                description: 'Tags for filtering/categorization'
            },

            // --- METADATA ---
            metadata: {
                type: 'object',
                description: 'Additional metadata for mission management',
                properties: {
                    category: { type: 'string' },
                    author: { type: 'string' },
                    version: { type: 'string' },
                    notes: { type: 'string' }
                }
            }
        }
    },

    /**
     * Objective schema (within mission.objectives array)
     */
    objective: {
        required: {
            type: {
                type: 'string',
                description: 'Objective type (from OBJECTIVE_TYPES)'
            }
        },
        optional: {
            id: {
                type: 'string',
                description: 'Unique objective ID within mission (auto-generated if not provided)'
            },
            target: {
                type: 'string',
                description: 'Target ID (enemy, item, node, region, etc.)'
            },
            count: {
                type: 'number',
                min: 1,
                description: 'Required count to complete'
            },
            current: {
                type: 'number',
                default: 0,
                description: 'Current progress (managed by system)'
            },
            skill: {
                type: 'string',
                description: 'Skill ID (for skill-related objectives)'
            },
            level: {
                type: 'number',
                description: 'Required level (for level objectives)'
            },
            slot: {
                type: 'string',
                description: 'Equipment slot (for equip objectives)'
            },
            armorType: {
                type: 'string',
                description: 'Armor type (for killType objectives)'
            },
            items: {
                type: 'array',
                description: 'Item set (for turnInSet objectives)'
            },
            key: {
                type: 'string',
                description: 'Custom key (for custom objectives)'
            },
            description: {
                type: 'string',
                description: 'Custom description override'
            },
            hidden: {
                type: 'boolean',
                default: false,
                description: 'Whether objective is hidden until discovered'
            },
            optional: {
                type: 'boolean',
                default: false,
                description: 'Whether objective is optional for completion'
            }
        }
    },

    /**
     * Validate a complete mission definition
     * @param {object} mission - Mission definition to validate
     * @returns {object} { valid: boolean, errors: string[], warnings: string[] }
     */
    validate(mission) {
        const errors = [];
        const warnings = [];

        if (!mission || typeof mission !== 'object') {
            return { valid: false, errors: ['Mission must be an object'], warnings: [] };
        }

        // Check required fields
        for (const [field, schema] of Object.entries(this.definition.required)) {
            if (mission[field] === undefined) {
                errors.push(`Missing required field: ${field}`);
                continue;
            }

            const value = mission[field];

            // Type check
            if (schema.type === 'array' && !Array.isArray(value)) {
                errors.push(`Field '${field}' must be an array`);
            } else if (schema.type !== 'array' && typeof value !== schema.type) {
                errors.push(`Field '${field}' must be a ${schema.type}`);
            }

            // Pattern check (for id)
            if (schema.pattern && !schema.pattern.test(value)) {
                errors.push(`Field '${field}' does not match required pattern`);
            }

            // Enum check
            if (schema.enum && !schema.enum.includes(value)) {
                errors.push(`Field '${field}' must be one of: ${schema.enum.join(', ')}`);
            }

            // Length checks
            if (schema.minLength && value.length < schema.minLength) {
                errors.push(`Field '${field}' must have at least ${schema.minLength} characters`);
            }
            if (schema.maxLength && value.length > schema.maxLength) {
                errors.push(`Field '${field}' must have at most ${schema.maxLength} characters`);
            }

            // Array item checks
            if (schema.minItems && value.length < schema.minItems) {
                errors.push(`Field '${field}' must have at least ${schema.minItems} items`);
            }
            if (schema.maxItems && value.length > schema.maxItems) {
                warnings.push(`Field '${field}' has more than recommended ${schema.maxItems} items`);
            }
        }

        // Validate ID matches type
        if (mission.id && mission.type) {
            const parsed = typeof window !== 'undefined' && window.MissionIdUtils
                ? window.MissionIdUtils.parse(mission.id)
                : null;
            if (parsed && parsed.type !== mission.type) {
                errors.push(`Mission ID type code (${parsed.type}) does not match type field (${mission.type})`);
            }
        }

        // Validate objectives
        if (Array.isArray(mission.objectives)) {
            mission.objectives.forEach((obj, index) => {
                const objValidation = this.validateObjective(obj, index);
                errors.push(...objValidation.errors);
                warnings.push(...objValidation.warnings);
            });
        }

        // Validate optional fields have correct types
        for (const [field, schema] of Object.entries(this.definition.optional)) {
            if (mission[field] !== undefined) {
                const value = mission[field];

                if (schema.type === 'array' && !Array.isArray(value)) {
                    errors.push(`Optional field '${field}' must be an array`);
                } else if (schema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
                    errors.push(`Optional field '${field}' must be an object`);
                } else if (schema.type !== 'array' && schema.type !== 'object' && typeof value !== schema.type) {
                    errors.push(`Optional field '${field}' must be a ${schema.type}`);
                }

                // Range checks for numbers
                if (schema.type === 'number') {
                    if (schema.min !== undefined && value < schema.min) {
                        errors.push(`Field '${field}' must be at least ${schema.min}`);
                    }
                    if (schema.max !== undefined && value > schema.max) {
                        errors.push(`Field '${field}' must be at most ${schema.max}`);
                    }
                }

                // Enum check
                if (schema.enum && !schema.enum.includes(value)) {
                    errors.push(`Field '${field}' must be one of: ${schema.enum.join(', ')}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Validate a single objective
     * @param {object} objective - Objective to validate
     * @param {number} index - Index in objectives array
     * @returns {object} { errors: string[], warnings: string[] }
     */
    validateObjective(objective, index) {
        const errors = [];
        const warnings = [];
        const prefix = `Objective[${index}]`;

        if (!objective || typeof objective !== 'object') {
            errors.push(`${prefix}: Must be an object`);
            return { errors, warnings };
        }

        if (!objective.type) {
            errors.push(`${prefix}: Missing required 'type' field`);
        }

        // Use OBJECTIVE_TYPES validation if available
        if (typeof window !== 'undefined' && window.validateObjective) {
            const objValidation = window.validateObjective(objective);
            if (!objValidation.valid) {
                objValidation.errors.forEach(err => errors.push(`${prefix}: ${err}`));
            }
        }

        return { errors, warnings };
    },

    /**
     * Create a mission definition with defaults applied
     * @param {object} partial - Partial mission definition
     * @returns {object} Complete mission definition with defaults
     */
    withDefaults(partial) {
        const mission = { ...partial };

        // Apply defaults for optional fields
        for (const [field, schema] of Object.entries(this.definition.optional)) {
            if (mission[field] === undefined && schema.default !== undefined) {
                mission[field] = schema.default;
            }
        }

        // Auto-generate objective IDs if not provided
        if (Array.isArray(mission.objectives)) {
            mission.objectives = mission.objectives.map((obj, index) => {
                if (!obj.id) {
                    return { ...obj, id: `obj_${index + 1}` };
                }
                return obj;
            });
        }

        return mission;
    },

    /**
     * Get schema documentation
     * @returns {string} Human-readable schema documentation
     */
    getDocumentation() {
        let doc = '=== MISSION SCHEMA DOCUMENTATION ===\n\n';

        doc += '--- REQUIRED FIELDS ---\n';
        for (const [field, schema] of Object.entries(this.definition.required)) {
            doc += `${field} (${schema.type}): ${schema.description}\n`;
        }

        doc += '\n--- OPTIONAL FIELDS ---\n';
        for (const [field, schema] of Object.entries(this.definition.optional)) {
            const defaultStr = schema.default !== undefined ? ` [default: ${schema.default}]` : '';
            doc += `${field} (${schema.type})${defaultStr}: ${schema.description}\n`;
        }

        return doc;
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionSchema;
}

// Browser global access
if (typeof window !== 'undefined') {
    window.MissionSchema = MissionSchema;
}
