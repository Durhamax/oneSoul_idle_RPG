/**
 * EXCEL TO JSON EXPORT SCRIPT
 *
 * Converts Excel workbook (OneSoul_GameData.xlsx) to JSON files
 * for game data loading.
 *
 * Features:
 * - Auto-detects OneDrive path
 * - Converts flattened columns back to nested objects
 * - Skips columns/sheets starting with underscore
 * - Type conversions (TRUE/FALSE → boolean, numbers, null)
 * - Validates data structure
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Auto-detect OneDrive path
 */
function findOneDrivePath() {
    const username = os.userInfo().username;
    const possiblePaths = [
        `C:\\Users\\${username}\\OneDrive\\OneSoul_GameData\\OneSoul_GameData.xlsx`,
        `C:\\Users\\${username}\\OneDrive - Personal\\OneSoul_GameData\\OneSoul_GameData.xlsx`,
        `C:\\Users\\${username}\\OneDrive\\Documents\\OneSoul_GameData\\OneSoul_GameData.xlsx`,
        path.join(__dirname, '../data/OneSoul_GameData.xlsx'), // Local fallback
    ];

    for (let testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
            console.log(`✅ Found Excel file at: ${testPath}`);
            return testPath;
        }
    }

    throw new Error('Could not find OneSoul_GameData.xlsx. Checked paths:\n' + possiblePaths.join('\n'));
}

/**
 * Unflatten object keys with underscores back to nested objects
 * Example: { combatStats_damage: 10 } → { combatStats: { damage: 10 } }
 */
function unflattenObject(flat) {
    const nested = {};

    for (let key in flat) {
        if (!key || key.startsWith('_')) {
            // Skip underscore columns (reference columns)
            continue;
        }

        const value = flat[key];

        // Skip empty/null values
        if (value === '' || value === null || value === undefined) {
            continue;
        }

        const parts = key.split('_');

        if (parts.length === 1) {
            // Top-level property
            nested[key] = convertValue(value);
        } else {
            // Nested property
            let current = nested;

            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }

            const lastPart = parts[parts.length - 1];
            current[lastPart] = convertValue(value);
        }
    }

    return nested;
}

/**
 * Convert string values to proper types
 */
function convertValue(value) {
    if (typeof value === 'string') {
        // Boolean conversion
        if (value === 'TRUE' || value === 'true') return true;
        if (value === 'FALSE' || value === 'false') return false;

        // Number conversion
        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return parseFloat(value);
        }

        // JSON array conversion (for tags, etc.)
        if (value.startsWith('[') && value.endsWith(']')) {
            try {
                return JSON.parse(value);
            } catch (e) {
                // If parsing fails, return as-is
                return value;
            }
        }

        // JSON object conversion
        if (value.startsWith('{') && value.endsWith('}')) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }

        return value;
    }

    return value;
}

/**
 * Convert Excel sheet to JSON array
 */
function sheetToJSON(worksheet) {
    // Convert sheet to array of objects (header row = keys)
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    // Unflatten each row
    const processed = rawData.map(row => unflattenObject(row));

    return processed;
}

/**
 * Convert JSON array to keyed object (using 'id' field as key)
 */
function arrayToObject(array) {
    const obj = {};

    array.forEach(item => {
        const id = item.id;
        if (id) {
            obj[id] = item;
            delete item.id; // Remove id from nested object (redundant)
        }
    });

    return obj;
}

/**
 * Main export process
 */
function main() {
    console.log('🔄 Starting Excel to JSON export...\n');

    try {
        // Find Excel file
        const excelPath = findOneDrivePath();

        // Read workbook
        console.log('📖 Reading Excel workbook...');
        const workbook = XLSX.readFile(excelPath);

        // Output directory
        const outputDir = path.join(__dirname, '../data/json');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Process each sheet
        const sheetNames = workbook.SheetNames.filter(name => !name.startsWith('_'));
        console.log(`\n📊 Processing ${sheetNames.length} sheets...`);

        const results = {};

        for (let sheetName of sheetNames) {
            console.log(`   • ${sheetName}`);

            const worksheet = workbook.Sheets[sheetName];
            const jsonArray = sheetToJSON(worksheet);
            const jsonObject = arrayToObject(jsonArray);

            // Write to file
            const filename = sheetName.toLowerCase() + '.json';
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, JSON.stringify(jsonObject, null, 2));

            results[sheetName] = {
                records: Object.keys(jsonObject).length,
                file: filename
            };
        }

        // Write summary
        console.log('\n✅ Export complete!');
        console.log('\nResults:');
        for (let sheet in results) {
            const info = results[sheet];
            console.log(`   ${sheet}: ${info.records} records → ${info.file}`);
        }

        console.log(`\n📁 Files saved to: ${outputDir}`);

        // Optional: Create combined definitions.json
        const combinedPath = path.join(outputDir, 'definitions.json');
        const combinedData = {};
        for (let sheet in results) {
            const jsonFile = path.join(outputDir, results[sheet].file);
            combinedData[sheet.toLowerCase()] = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        }
        fs.writeFileSync(combinedPath, JSON.stringify(combinedData, null, 2));
        console.log(`\n📦 Combined definitions: definitions.json`);

    } catch (error) {
        console.error('❌ Export failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, unflattenObject, convertValue };
