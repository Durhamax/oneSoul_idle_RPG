/**
 * UI ITEM ACCESS MIGRATION SCRIPT
 *
 * Automatically migrates all UI files to use ItemAccessHelper
 * instead of direct GameEngine.definitions.items access.
 *
 * Run with: node scripts/migrate-ui-item-access.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to replace
const patterns = [
    {
        // GameEngine.definitions.items[itemId]
        regex: /GameEngine\.definitions\.items\[([^\]]+)\]/g,
        replacement: 'ItemAccessHelper.getItem($1)'
    },
    {
        // GameDefinitions.items[itemId]
        regex: /GameDefinitions\.items\[([^\]]+)\]/g,
        replacement: 'ItemAccessHelper.getItem($1)'
    },
    {
        // engine.definitions.items[itemId]
        regex: /engine\.definitions\.items\[([^\]]+)\]/g,
        replacement: 'ItemAccessHelper.getItem($1)'
    },
    {
        // this.definitions.items[itemId] (rare in UI, but handle it)
        regex: /this\.definitions\.items\[([^\]]+)\]/g,
        replacement: 'ItemAccessHelper.getItem($1)'
    }
];

// Files to migrate
const uiDir = path.join(__dirname, '..', 'src', 'ui');

// Find all .js files in ui directory
function getAllJsFiles(dir) {
    const files = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (item.endsWith('.js') && item !== 'itemAccessHelper.js') {
                files.push(fullPath);
            }
        });
    }

    traverse(dir);
    return files;
}

// Migrate a single file
function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeCount = 0;

    // Apply each pattern
    patterns.forEach(pattern => {
        const matches = content.match(pattern.regex);
        if (matches) {
            content = content.replace(pattern.regex, pattern.replacement);
            changeCount += matches.length;
            modified = true;
        }
    });

    if (modified) {
        // Add comment at top if not already present
        if (!content.includes('ItemAccessHelper')) {
            const header = `/**
 * MIGRATED TO ITEMREGISTRY PATTERN
 * Uses ItemAccessHelper for all item access
 */

`;
            // Only add if file doesn't already have a header comment
            if (!content.startsWith('/**')) {
                content = header + content;
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        return { modified: true, changes: changeCount };
    }

    return { modified: false, changes: 0 };
}

// Main execution
function main() {
    console.log('🔄 Starting UI Item Access Migration...\n');

    const files = getAllJsFiles(uiDir);
    console.log(`Found ${files.length} UI files to check\n`);

    let totalModified = 0;
    let totalChanges = 0;

    files.forEach(filePath => {
        const relativePath = path.relative(process.cwd(), filePath);
        const result = migrateFile(filePath);

        if (result.modified) {
            console.log(`✅ ${relativePath} - ${result.changes} replacements`);
            totalModified++;
            totalChanges += result.changes;
        }
    });

    console.log(`\n📊 Migration Complete:`);
    console.log(`   Files modified: ${totalModified}`);
    console.log(`   Total replacements: ${totalChanges}`);
    console.log(`\n✅ All UI files now use ItemAccessHelper.getItem()`);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { migrateFile, getAllJsFiles };
