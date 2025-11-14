/**
 * ITEM VALIDATOR
 *
 * Validates item data against the item schema.
 * Provides detailed error messages and warnings for item definitions.
 *
 * Usage:
 *   const result = ItemValidator.validate(itemData);
 *   if (!result.isValid) {
 *     console.error('Validation failed:', result.errors);
 *   }
 */

// Import schema (will work in both Node.js and browser)
// In browser mode, these are already available globally from itemSchema.js
// We don't redeclare them - just use them directly as globals

const ItemValidator = {
    /**
     * Validate a single item
     * @param {Object} item - Item data to validate
     * @param {string} item.id - Item ID
     * @returns {Object} Validation result with errors and warnings
     */
    validate(item) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            itemId: item?.id || 'unknown',
        };

        // Check if item exists
        if (!item || typeof item !== 'object') {
            result.isValid = false;
            result.errors.push('Item data is null or not an object');
            return result;
        }

        // Run all validation checks
        this.validateRequiredFields(item, result);
        this.validateCategory(item, result);
        this.validateRarity(item, result);
        this.validateCategorySpecific(item, result);
        this.validateDeprecatedFields(item, result);
        this.validateEquipment(item, result);
        this.validateConsumable(item, result);
        this.validateMaterial(item, result);
        this.validateRanges(item, result);
        this.checkDataCompleteness(item, result);

        return result;
    },

    /**
     * Validate multiple items
     * @param {Object} items - Object containing multiple items
     * @returns {Object} Validation results for all items
     */
    validateAll(items) {
        const results = {
            totalItems: 0,
            validItems: 0,
            invalidItems: 0,
            totalErrors: 0,
            totalWarnings: 0,
            items: {},
        };

        if (!items || typeof items !== 'object') {
            console.error('❌ Items data is null or not an object');
            return results;
        }

        for (const [itemId, itemData] of Object.entries(items)) {
            results.totalItems++;

            const validation = this.validate(itemData);
            results.items[itemId] = validation;

            if (validation.isValid) {
                results.validItems++;
            } else {
                results.invalidItems++;
            }

            results.totalErrors += validation.errors.length;
            results.totalWarnings += validation.warnings.length;
        }

        return results;
    },

    /**
     * Validate required fields
     */
    validateRequiredFields(item, result) {
        for (const field of VALIDATION_RULES.required) {
            if (!item[field] || item[field] === '') {
                result.isValid = false;
                result.errors.push(`Missing required field: "${field}"`);
            }
        }
    },

    /**
     * Validate category field
     */
    validateCategory(item, result) {
        if (!item.category) return;

        const validCategories = Object.values(ITEM_CATEGORIES);
        if (!validCategories.includes(item.category)) {
            result.isValid = false;
            result.errors.push(
                `Invalid category "${item.category}". Must be one of: ${validCategories.join(', ')}`
            );
        }
    },

    /**
     * Validate rarity field
     */
    validateRarity(item, result) {
        if (!item.rarity) return;

        const validRarities = Object.values(ITEM_RARITIES);
        if (!validRarities.includes(item.rarity)) {
            result.isValid = false;
            result.errors.push(
                `Invalid rarity "${item.rarity}". Must be one of: ${validRarities.join(', ')}`
            );
        }
    },

    /**
     * Validate category-specific required fields
     */
    validateCategorySpecific(item, result) {
        if (!item.category) return;

        const categoryRequirements = VALIDATION_RULES.categoryRequired[item.category];
        if (!categoryRequirements) return;

        for (const field of categoryRequirements) {
            if (!item[field] || item[field] === '') {
                result.isValid = false;
                result.errors.push(
                    `Missing required field for category "${item.category}": "${field}"`
                );
            }
        }
    },

    /**
     * Check for deprecated fields
     */
    validateDeprecatedFields(item, result) {
        for (const [deprecatedField, message] of Object.entries(VALIDATION_RULES.deprecated)) {
            if (item[deprecatedField] !== undefined) {
                result.warnings.push(
                    `Deprecated field "${deprecatedField}": ${message}`
                );
            }

            // Check if deprecated value is used in other fields
            if (item.slot === deprecatedField) {
                result.warnings.push(
                    `Deprecated slot value "${deprecatedField}": ${message}`
                );
            }
        }
    },

    /**
     * Validate equipment-specific fields
     */
    validateEquipment(item, result) {
        if (item.category !== 'equipment') return;

        // Validate slot
        if (item.slot) {
            const validSlots = Object.values(EQUIPMENT_SLOTS);
            if (!validSlots.includes(item.slot)) {
                result.isValid = false;
                result.errors.push(
                    `Invalid equipment slot "${item.slot}". Must be one of: ${validSlots.join(', ')}`
                );
            }
        }

        // Validate tier
        if (item.tier) {
            const validTiers = Object.values(EQUIPMENT_TIERS);
            if (!validTiers.includes(item.tier)) {
                result.warnings.push(
                    `Invalid equipment tier "${item.tier}". Should be one of: ${validTiers.join(', ')}`
                );
            }
        }

        // Check for combat stats or attributes
        const hasStats = item.combatStats && Object.values(item.combatStats).some(v => v > 0);
        const hasAttributes = item.attributes && Object.values(item.attributes).some(v => v > 0);

        if (!hasStats && !hasAttributes) {
            result.warnings.push(
                'Equipment has no combat stats or attributes defined'
            );
        }

        // Validate stackLimit for equipment (should be 1)
        if (item.stackLimit && item.stackLimit > 1) {
            result.warnings.push(
                'Equipment should typically have stackLimit of 1'
            );
        }
    },

    /**
     * Validate consumable-specific fields
     */
    validateConsumable(item, result) {
        if (item.category !== 'consumable') return;

        // Validate effect type
        if (item.effectType) {
            const validEffects = Object.values(CONSUMABLE_EFFECTS);
            if (!validEffects.includes(item.effectType)) {
                result.warnings.push(
                    `Unknown consumable effect type "${item.effectType}". Common types: ${validEffects.join(', ')}`
                );
            }
        }

        // Check for effect value
        if (item.effectType && item.effectValue === undefined) {
            result.warnings.push(
                'Consumable has effectType but no effectValue defined'
            );
        }

        // Warn if stackLimit is 1 for consumables
        if (item.stackLimit === 1) {
            result.warnings.push(
                'Consumable has stackLimit of 1 - consider increasing for better inventory management'
            );
        }
    },

    /**
     * Validate material/resource-specific fields
     */
    validateMaterial(item, result) {
        if (item.category !== 'material' && item.category !== 'resource') return;

        // Check for resource type
        if (!item.resourceType) {
            result.warnings.push(
                'Material/Resource should have a "resourceType" defined'
            );
        }

        // Check for gather skill
        if (!item.gatherSkill) {
            result.warnings.push(
                'Material/Resource should have a "gatherSkill" defined'
            );
        }

        // Check for reasonable stack limit
        if (item.stackLimit && item.stackLimit < 50) {
            result.warnings.push(
                'Material/Resource has low stackLimit - consider 50-999 for better inventory management'
            );
        }
    },

    /**
     * Validate numeric ranges
     */
    validateRanges(item, result) {
        for (const [field, range] of Object.entries(VALIDATION_RULES.ranges)) {
            if (item[field] === undefined) continue;

            const value = item[field];

            if (typeof value !== 'number') {
                result.errors.push(
                    `Field "${field}" must be a number, got ${typeof value}`
                );
                continue;
            }

            if (value < range.min || value > range.max) {
                result.warnings.push(
                    `Field "${field}" value ${value} is outside recommended range [${range.min}, ${range.max}]`
                );
            }
        }
    },

    /**
     * Check data completeness
     */
    checkDataCompleteness(item, result) {
        // Check for empty description
        if (item.description && item.description.length < 10) {
            result.warnings.push(
                'Description is too short - provide more detail'
            );
        }

        // Check for default icon
        if (item.icon === '❓' || item.icon === '⚠️') {
            result.warnings.push(
                'Using placeholder icon - consider adding a proper icon'
            );
        }

        // Check for zero value
        if (item.value === 0 && item.category !== 'currency' && item.category !== 'quest') {
            result.warnings.push(
                'Item has zero value - consider adding a vendor price'
            );
        }

        // Check for tags
        if (!item.tags || item.tags.length === 0) {
            result.warnings.push(
                'No tags defined - tags help with searching and filtering'
            );
        }
    },

    /**
     * Print validation summary
     */
    printSummary(results) {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║     ITEM VALIDATION SUMMARY           ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log(`📦 Total Items: ${results.totalItems}`);
        console.log(`✅ Valid Items: ${results.validItems}`);
        console.log(`❌ Invalid Items: ${results.invalidItems}`);
        console.log(`🚨 Total Errors: ${results.totalErrors}`);
        console.log(`⚠️  Total Warnings: ${results.totalWarnings}`);

        // Print invalid items
        if (results.invalidItems > 0) {
            console.log('\n❌ INVALID ITEMS:\n');

            for (const [itemId, validation] of Object.entries(results.items)) {
                if (!validation.isValid) {
                    console.log(`  ${itemId}:`);
                    validation.errors.forEach(error => {
                        console.log(`    ❌ ${error}`);
                    });
                    if (validation.warnings.length > 0) {
                        validation.warnings.forEach(warning => {
                            console.log(`    ⚠️  ${warning}`);
                        });
                    }
                    console.log('');
                }
            }
        }

        // Print items with warnings
        const itemsWithWarnings = Object.entries(results.items)
            .filter(([_, v]) => v.isValid && v.warnings.length > 0);

        if (itemsWithWarnings.length > 0) {
            console.log('\n⚠️  ITEMS WITH WARNINGS:\n');

            for (const [itemId, validation] of itemsWithWarnings) {
                console.log(`  ${itemId}:`);
                validation.warnings.forEach(warning => {
                    console.log(`    ⚠️  ${warning}`);
                });
                console.log('');
            }
        }

        // Success message
        if (results.invalidItems === 0 && results.totalWarnings === 0) {
            console.log('\n✨ All items are valid with no warnings!');
        } else if (results.invalidItems === 0) {
            console.log('\n✅ All items are valid (but have warnings to review)');
        }

        console.log('\n' + '─'.repeat(50) + '\n');
    },

    /**
     * Print detailed report for a single item
     */
    printItemReport(itemId, validation) {
        console.log(`\n${'─'.repeat(50)}`);
        console.log(`📦 ITEM: ${itemId}`);
        console.log('─'.repeat(50));

        if (validation.isValid) {
            console.log('✅ Status: VALID');
        } else {
            console.log('❌ Status: INVALID');
        }

        if (validation.errors.length > 0) {
            console.log('\n❌ Errors:');
            validation.errors.forEach((error, i) => {
                console.log(`  ${i + 1}. ${error}`);
            });
        }

        if (validation.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            validation.warnings.forEach((warning, i) => {
                console.log(`  ${i + 1}. ${warning}`);
            });
        }

        if (validation.errors.length === 0 && validation.warnings.length === 0) {
            console.log('\n✨ No issues found!');
        }

        console.log('');
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ItemValidator;
}
