/**
 * CREATE FRESH EXCEL FILE
 *
 * Deletes old Excel file and creates a brand new one with only clean data
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const os = require('os');

function findExcelPath() {
    const username = os.userInfo().username;
    return `C:\\Users\\${username}\\OneDrive\\OneSoul_GameData\\OneSoul_GameData.xlsx`;
}

function csvToWorksheet(csvPath) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const worksheet = XLSX.read(csvContent, { type: 'string' }).Sheets['Sheet1'];
    return worksheet;
}

console.log('🔥 Creating FRESH Excel file (deleting old one)...\n');

const excelPath = findExcelPath();

// Delete old file if exists
if (fs.existsSync(excelPath)) {
    fs.unlinkSync(excelPath);
    console.log('✅ Deleted old Excel file\n');
}

// Create brand new workbook
console.log('📝 Creating new workbook...\n');
const workbook = XLSX.utils.book_new();

// Import clean CSV files
const csvDir = path.join(__dirname, '../outputs');
const csvFiles = ['items', 'nodes', 'skills', 'enemies', 'regions', 'recipes', 'missions'];

for (let csvFile of csvFiles) {
    const csvPath = path.join(csvDir, `${csvFile}.csv`);

    if (fs.existsSync(csvPath)) {
        const worksheet = csvToWorksheet(csvPath);
        XLSX.utils.book_append_sheet(workbook, worksheet, csvFile);
        console.log(`✅ Added: ${csvFile}`);
    } else {
        console.log(`⚠️  Skipped: ${csvFile} (file not found)`);
    }
}

// Save new workbook
console.log('\n💾 Saving new Excel file...');
XLSX.writeFile(workbook, excelPath);

console.log('\n✅ Fresh Excel file created!\n');
console.log(`📁 Location: ${excelPath}`);
console.log('\n💡 Open Excel and verify you have ONLY clean data!');
