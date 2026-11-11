/**
 * DATA VALIDATION SCRIPT
 *
 * Validates JSON game data for:
 * - Required fields
 * - Data types
 * - Cross-references (recipe ingredients reference real items, etc.)
 * - Balance checks (warnings only)
 */

const fs = require('fs');
const path = require('path');

// Validation results
const errors = [];
const warnings = [];

/**
 * Log validation error
 */
function error(category, id, message) {
    errors.push({ category, id, message });
    console.error(`❌ [${category}] ${id}: ${message}`);
}

/**
 * Log validation warning
 */
function warn(category, id, message) {
    warnings.push({ category, id, message });
    console.warn(`⚠️  [${category}] ${id}: ${message}`);
}

/**
 * Load JSON data
 */
function loadJSON(filename) {
    const filepath = path.join(__dirname, '../data/json', filename);

    if (!fs.existsSync(filepath)) {
        console.warn(`⚠️  File not found: ${filename}`);
        return {};
    }

    try {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
        console.error(`❌ Failed to parse ${filename}:`, e.message);
        return {};
    }
}

/**
 * Validate items data
 */
function validateItems(items) {
    console.log('\n🔍 Validating items...');

    for (let itemId in items) {
        const item = items[itemId];

        // Required fields
        if (!item.name) {
            error('items', itemId, 'Missing required field: name');
        }
        if (!item.category) {
            error('items', itemId, 'Missing required field: category');
        }
        if (!item.icon) {
            warn('items', itemId, 'Missing icon');
        }

        // Type validation
        if (item.value !== undefined && typeof item.value !== 'number') {
            error('items', itemId, `Invalid type for value: expected number, got ${typeof item.value}`);
        }

        if (item.stackLimit !== undefined && typeof item.stackLimit !== 'number') {
            error('items', itemId, `Invalid type for stackLimit: expected number, got ${typeof item.stackLimit}`);
        }

        // Balance warnings
        if (item.category === 'equipment' && item.stats) {
            const stats = item.stats;

            // Check for overpowered items
            if (stats.attackDamage && stats.attackDamage > 1000) {
                warn('items', itemId, `Very high attackDamage: ${stats.attackDamage}`);
            }
            if (stats.defense && stats.defense > 500) {
                warn('items', itemId, `Very high defense: ${stats.defense}`);
            }
        }
    }

    console.log(`   Checked ${Object.keys(items).length} items`);
}

/**
 * Validate skills data
 */
function validateSkills(skills) {
    console.log('\n🔍 Validating skills...');

    for (let skillId in skills) {
        const skill = skills[skillId];

        // Required fields
        if (!skill.name) {
            error('skills', skillId, 'Missing required field: name');
        }
        if (!skill.description) {
            warn('skills', skillId, 'Missing description');
        }
    }

    console.log(`   Checked ${Object.keys(skills).length} skills`);
}

/**
 * Validate enemies data
 */
function validateEnemies(enemies) {
    console.log('\n🔍 Validating enemies...');

    for (let enemyId in enemies) {
        const enemy = enemies[enemyId];

        // Required fields
        if (!enemy.name) {
            error('enemies', enemyId, 'Missing required field: name');
        }
        if (enemy.health === undefined) {
            error('enemies', enemyId, 'Missing required field: health');
        }
        if (enemy.attackDamage === undefined) {
            warn('enemies', enemyId, 'Missing attackDamage');
        }

        // Balance checks
        if (enemy.health && enemy.health > 100000) {
            warn('enemies', enemyId, `Very high health: ${enemy.health}`);
        }
    }

    console.log(`   Checked ${Object.keys(enemies).length} enemies`);
}

/**
 * Validate regions data
 */
function validateRegions(regions) {
    console.log('\n🔍 Validating regions...');

    for (let regionId in regions) {
        const region = regions[regionId];

        // Required fields
        if (!region.name) {
            error('regions', regionId, 'Missing required field: name');
        }
    }

    console.log(`   Checked ${Object.keys(regions).length} regions`);
}

/**
 * Validate recipes data with cross-references
 */
function validateRecipes(recipes, items) {
    console.log('\n🔍 Validating recipes...');

    for (let recipeId in recipes) {
        const recipe = recipes[recipeId];

        // Required fields
        if (!recipe.output) {
            error('recipes', recipeId, 'Missing required field: output');
        }
        if (!recipe.inputs) {
            error('recipes', recipeId, 'Missing required field: inputs');
        }

        // Cross-reference validation: output item exists
        if (recipe.output && !items[recipe.output]) {
            error('recipes', recipeId, `Output item '${recipe.output}' does not exist in items`);
        }

        // Cross-reference validation: input items exist
        if (recipe.inputs) {
            for (let inputId in recipe.inputs) {
                if (!items[inputId]) {
                    error('recipes', recipeId, `Input item '${inputId}' does not exist in items`);
                }
            }
        }
    }

    console.log(`   Checked ${Object.keys(recipes).length} recipes`);
}

/**
 * Main validation process
 */
function main() {
    console.log('🔍 Starting data validation...\n');

    try {
        // Load all data
        const items = loadJSON('items.json');
        const skills = loadJSON('skills.json');
        const enemies = loadJSON('enemies.json');
        const regions = loadJSON('regions.json');
        const recipes = loadJSON('recipes.json');

        // Run validations
        validateItems(items);
        validateSkills(skills);
        validateEnemies(enemies);
        validateRegions(regions);
        validateRecipes(recipes, items);

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('VALIDATION SUMMARY');
        console.log('='.repeat(60));

        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ All validations passed! No errors or warnings.');
        } else {
            if (errors.length > 0) {
                console.log(`\n❌ ${errors.length} ERRORS FOUND`);
                errors.forEach(err => {
                    console.log(`   [${err.category}] ${err.id}: ${err.message}`);
                });
            }

            if (warnings.length > 0) {
                console.log(`\n⚠️  ${warnings.length} WARNINGS`);
                warnings.forEach(warn => {
                    console.log(`   [${warn.category}] ${warn.id}: ${warn.message}`);
                });
            }
        }

        // Exit with error code if there are errors
        if (errors.length > 0) {
            console.log('\n❌ Validation failed due to errors.');
            process.exit(1);
        } else {
            console.log('\n✅ Validation complete!');
        }

    } catch (error) {
        console.error('\n❌ Validation script error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, validateItems, validateSkills, validateEnemies, validateRegions, validateRecipes };
