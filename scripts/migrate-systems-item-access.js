/**
 * SYSTEMS ITEM ACCESS MIGRATION SCRIPT
 *
 * Automatically migrates all system files to use _getItemDef() helper
 * instead of direct this.definitions.items access.
 *
 * Run with: node scripts/migrate-systems-item-access.js
 */

const fs = require('fs');
const path = require('path');

// Systems to migrate
const systemsToMigrate = [
    'engineeringSystem.js',
    'enhancementSystem.js',
    'equipmentPresetSystem.js',
    'harvestSystem.js',
    'offlineCombatSystem.js',
    'restRecoverySystem.js',
    'typeEffectivenessSystem.js',
    'migrationSystem.js'
];

// Helper function template
const helperTemplate = `    /**
     * Get item definition from ItemRegistry (standardized access pattern)
     * @param {string} itemId - Item ID to retrieve
     * @returns {object|null} Item definition or null if not found
     */
    _getItemDef(itemId) {
        // Primary: Use ItemRegistry if available
        if (typeof ItemRegistry !== 'undefined' && ItemRegistry.getItem) {
            return ItemRegistry.getItem(itemId);
        }

        // Fallback: Use definitions.items (legacy support)
        return this.definitions?.items?.[itemId] || null;
    },

`;

// Add helper to a system
function addHelper(content, systemName) {
    // Find the init method
    const initMatch = content.match(/(\s+)init\(engine\)/);
    if (!initMatch) {
        console.warn(`   ⚠️  Could not find init() method`);
        return content;
    }

    // Insert helper before init
    const indent = initMatch[1];
    const insertPoint = initMatch.index;

    return content.slice(0, insertPoint) + helperTemplate + content.slice(insertPoint);
}

// Replace direct access with helper calls
function replaceCalls(content, systemName) {
    let modified = content;
    let changeCount = 0;

    // Pattern 1: this.definitions.items[itemId]
    const pattern1 = /this\.definitions\.items\[([^\]]+)\]/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
        modified = modified.replace(pattern1, `${systemName}._getItemDef.call(this, $1)`);
        changeCount += matches1.length;
    }

    // Pattern 2: GameEngine.definitions.items[itemId] (for migrationSystem)
    const pattern2 = /GameEngine\.definitions\.items\[([^\]]+)\]/g;
    const matches2 = modified.match(pattern2);
    if (matches2) {
        modified = modified.replace(pattern2, `GameEngine.getItem($1)`);
        changeCount += matches2.length;
    }

    return { content: modified, changes: changeCount };
}

// Update init method to add console log
function addInitLog(content, systemName) {
    // Find the init method closing brace
    const initMatch = content.match(/(init\(engine\)\s*\{[\s\S]*?)(^\s+\})/m);
    if (!initMatch) {
        return content;
    }

    // Check if log already exists
    if (content.includes('ItemRegistry pattern')) {
        return content;
    }

    // Insert log before closing brace
    const beforeBrace = initMatch[1];
    const closingBrace = initMatch[2];
    const insertPoint = initMatch.index + beforeBrace.length;

    const logLine = `\n        console.log('✅ ${systemName} initialized (ItemRegistry pattern)');\n`;

    return content.slice(0, insertPoint) + logLine + content.slice(insertPoint);
}

// Migrate a single system file
function migrateSystem(filePath, systemName) {
    console.log(`\n📄 Migrating ${systemName}...`);

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has _getItemDef
    if (content.includes('_getItemDef(itemId)')) {
        console.log('   ℹ️  Already has _getItemDef helper, updating calls only...');
    } else {
        content = addHelper(content, systemName);
        console.log('   ✅ Added _getItemDef helper');
    }

    // Replace all direct access calls
    const { content: newContent, changes } = replaceCalls(content, systemName);
    content = newContent;

    if (changes > 0) {
        console.log(`   ✅ Replaced ${changes} direct access call(s)`);
    }

    // Add init log
    content = addInitLog(content, systemName);
    console.log('   ✅ Added init log');

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');

    return { modified: true, changes };
}

// Main execution
function main() {
    console.log('🔄 Starting Systems Item Access Migration...\n');

    const systemsDir = path.join(__dirname, '..', 'src', 'systems');
    let totalChanges = 0;

    systemsToMigrate.forEach(filename => {
        const filePath = path.join(systemsDir, filename);

        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  ${filename} not found, skipping...`);
            return;
        }

        const systemName = filename.replace('.js', '');
        const systemClassName = systemName.charAt(0).toUpperCase() + systemName.slice(1);

        const result = migrateSystem(filePath, systemClassName);
        totalChanges += result.changes;
    });

    console.log(`\n\n📊 Migration Complete:`);
    console.log(`   Systems migrated: ${systemsToMigrate.length}`);
    console.log(`   Total replacements: ${totalChanges}`);
    console.log(`\n✅ All systems now use ItemRegistry pattern`);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { migrateSystem };
