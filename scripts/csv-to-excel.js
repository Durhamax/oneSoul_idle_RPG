/**
 * CSV TO EXCEL - BULK IMPORT
 *
 * Automatically imports all CSV files into Excel workbook
 * Creates/replaces worksheets with CSV data
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Find OneDrive Excel file path
 */
function findExcelPath() {
    const username = os.userInfo().username;
    const possiblePaths = [
        `C:\\Users\\${username}\\OneDrive\\OneSoul_GameData\\OneSoul_GameData.xlsx`,
        `C:\\Users\\${username}\\OneDrive - Personal\\OneSoul_GameData\\OneSoul_GameData.xlsx`,
        `C:\\Users\\${username}\\OneDrive\\Documents\\OneSoul_GameData\\OneSoul_GameData.xlsx`,
        path.join(__dirname, '../data/OneSoul_GameData.xlsx'), // Local fallback
    ];

    for (let testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
            return testPath;
        }
    }

    return null;
}

/**
 * Import CSV file to worksheet
 */
function csvToWorksheet(csvPath) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const worksheet = XLSX.read(csvContent, { type: 'string' }).Sheets['Sheet1'];
    return worksheet;
}

/**
 * Main process
 */
function main() {
    // Check for command line arguments
    const args = process.argv.slice(2);
    const mode = args[0] || 'replace'; // 'replace' or 'merge'

    console.log('📊 CSV to Excel Bulk Import\n');
    console.log(`Mode: ${mode === 'merge' ? 'MERGE (add new rows only)' : 'REPLACE (full replacement)'}\n`);

    // Find Excel file
    const excelPath = findExcelPath();

    if (!excelPath) {
        console.error('❌ Could not find OneSoul_GameData.xlsx');
        console.error('\nExpected locations:');
        console.error('  - C:\\Users\\[username]\\OneDrive\\OneSoul_GameData\\OneSoul_GameData.xlsx');
        console.error('  - data/OneSoul_GameData.xlsx');
        process.exit(1);
    }

    console.log(`✅ Found Excel file: ${excelPath}\n`);

    // Load existing workbook (or create new one)
    let workbook;
    if (fs.existsSync(excelPath)) {
        console.log('📖 Loading existing workbook...');
        workbook = XLSX.readFile(excelPath);
    } else {
        console.log('📝 Creating new workbook...');
        workbook = XLSX.utils.book_new();
    }

    // CSV files to import
    const csvDir = path.join(__dirname, '../outputs');
    const csvFiles = [
        'items.csv',
        'skills.csv',
        'enemies.csv',
        'regions.csv',
        'recipes.csv',
        'missions.csv',
        'nodes.csv'
    ];

    console.log('🔄 Importing CSV files...\n');

    let importedCount = 0;
    let skippedCount = 0;

    for (let csvFile of csvFiles) {
        const csvPath = path.join(csvDir, csvFile);
        const sheetName = path.basename(csvFile, '.csv');

        if (!fs.existsSync(csvPath)) {
            console.log(`   ⚠️  ${csvFile} not found, skipping`);
            skippedCount++;
            continue;
        }

        // Read CSV and convert to worksheet
        const worksheet = csvToWorksheet(csvPath);

        // Remove old sheet if exists
        if (workbook.SheetNames.includes(sheetName)) {
            const index = workbook.SheetNames.indexOf(sheetName);
            workbook.SheetNames.splice(index, 1);
            delete workbook.Sheets[sheetName];
            console.log(`   🔄 Replacing: ${sheetName}`);
        } else {
            console.log(`   ➕ Adding: ${sheetName}`);
        }

        // Add new sheet
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        importedCount++;
    }

    // Save workbook
    console.log(`\n💾 Saving workbook...`);
    XLSX.writeFile(workbook, excelPath);

    console.log('\n✅ Import complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   Imported: ${importedCount} worksheets`);
    console.log(`   Skipped: ${skippedCount} worksheets`);
    console.log(`\n📁 File: ${excelPath}`);
    console.log('\n💡 You can now open the Excel file and all worksheets will be updated!');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };
