/**
 * ITEMREGISTRY PATTERN VALIDATION SCRIPT
 *
 * Validates that all code follows the ItemRegistry access pattern.
 * Run this before commits to ensure compliance.
 *
 * Run with: node scripts/validate-item-access-pattern.js
 */

const fs = require('fs');
const path = require('path');

// Files/patterns allowed to use direct access (legacy fallbacks only)
const ALLOWED_FILES = [
    'src/ui/utilities/itemAccessHelper.js',  // Helper has fallback
    'src/core/gameEngine.js',                 // Engine has getItem() with fallback
    'scripts/migrate-ui-item-access.js',      // Migration script
    'scripts/validate-item-access-pattern.js' // This file
];

// Patterns that are violations
const VIOLATION_PATTERNS = [
    {
        pattern: /(?<!\/\/ )(?<!\/\*)GameEngine\.definitions\.items\[/g,
        message: 'Direct GameEngine.definitions.items access (use GameEngine.getItem() or ItemAccessHelper.getItem())'
    },
    {
        pattern: /(?<!\/\/ )(?<!\/\*)engine\.definitions\.items\[/g,
        message: 'Direct engine.definitions.items access (use engine.getItem() or ItemAccessHelper.getItem())'
    },
    {
        pattern: /(?<!\/\/ )(?<!\/\*)GameDefinitions\.items\[/g,
        message: 'Direct GameDefinitions.items access (use ItemAccessHelper.getItem())'
    },
    {
        pattern: /(?<!\/\/ )(?<!\/\*)this\.definitions\.items\[/g,
        message: 'Direct this.definitions.items access (use SystemName._getItemDef.call(this, itemId))',
        exceptions: [
            'src/core/gameEngine.js'  // GameEngine can use this in its getItem() method
        ]
    }
];

// Scan a file for violations
function scanFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    // Skip allowed files
    if (ALLOWED_FILES.some(allowed => relativePath.includes(allowed.replace(/\//g, path.sep)))) {
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];

    VIOLATION_PATTERNS.forEach(({ pattern, message, exceptions }) => {
        // Skip if this file is in exceptions for this pattern
        if (exceptions && exceptions.some(exc => relativePath.includes(exc.replace(/\//g, path.sep)))) {
            return;
        }

        const lines = content.split('\n');
        lines.forEach((line, index) => {
            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                return;
            }

            const matches = line.matchAll(pattern);
            for (const match of matches) {
                violations.push({
                    file: relativePath,
                    line: index + 1,
                    code: line.trim(),
                    message: message
                });
            }
        });
    });

    return violations;
}

// Scan directory recursively
function scanDirectory(dir) {
    const violations = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Skip node_modules and other non-source directories
                if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
                    traverse(fullPath);
                }
            } else if (item.endsWith('.js')) {
                violations.push(...scanFile(fullPath));
            }
        });
    }

    traverse(dir);
    return violations;
}

// Main execution
function main() {
    console.log('🔍 Validating ItemRegistry Access Pattern...\n');

    const srcDir = path.join(__dirname, '..', 'src');
    const violations = scanDirectory(srcDir);

    if (violations.length === 0) {
        console.log('✅ All files follow the ItemRegistry pattern!');
        console.log('\nCompliance: 100%');
        return 0;
    }

    console.log(`❌ Found ${violations.length} violation(s):\n`);

    // Group by file
    const byFile = {};
    violations.forEach(v => {
        if (!byFile[v.file]) {
            byFile[v.file] = [];
        }
        byFile[v.file].push(v);
    });

    // Print grouped violations
    Object.entries(byFile).forEach(([file, fileViolations]) => {
        console.log(`\n📄 ${file} (${fileViolations.length} violation${fileViolations.length > 1 ? 's' : ''})`);
        fileViolations.forEach(v => {
            console.log(`   Line ${v.line}: ${v.message}`);
            console.log(`   Code: ${v.code}`);
        });
    });

    console.log(`\n\n📋 How to fix:`);
    console.log(`   - In UI files: Use ItemAccessHelper.getItem(itemId)`);
    console.log(`   - In GameEngine: Use this.getItem(itemId)`);
    console.log(`   - In Systems: Use SystemName._getItemDef.call(this, itemId)`);
    console.log(`\n   See ITEM_ACCESS_STANDARD.md for full documentation.`);

    return 1; // Exit code 1 = violations found
}

// Run if called directly
if (require.main === module) {
    const exitCode = main();
    process.exit(exitCode);
}

module.exports = { scanFile, scanDirectory };
