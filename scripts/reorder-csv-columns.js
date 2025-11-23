/**
 * REORDER CSV COLUMNS
 *
 * Puts important columns first (id, name, _status, icon, tier)
 * for better visibility in Excel
 */

const fs = require('fs');
const path = require('path');

/**
 * Reorder columns in a CSV file
 */
function reorderCSV(filepath, priorityColumns) {
    console.log(`\n📝 Processing: ${path.basename(filepath)}`);

    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');

    if (lines.length === 0) {
        console.log('   ⚠️  Empty file, skipping');
        return;
    }

    // Parse header row
    const headerRow = lines[0];
    const headers = parseCSVRow(headerRow);

    // Create new column order: priority columns first, then rest alphabetically
    const prioritySet = new Set(priorityColumns);
    const remainingColumns = headers.filter(h => !prioritySet.has(h)).sort();
    const newOrder = [...priorityColumns.filter(h => headers.includes(h)), ...remainingColumns];

    console.log(`   Columns: ${headers.length}`);
    console.log(`   Reordered: ${priorityColumns.filter(h => headers.includes(h)).join(', ')} → ...`);

    // Create column index mapping
    const oldIndexMap = {};
    headers.forEach((header, index) => {
        oldIndexMap[header] = index;
    });

    // Reorder all rows
    const reorderedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVRow(line);
        const reorderedValues = newOrder.map(header => {
            const oldIndex = oldIndexMap[header];
            return values[oldIndex] || '';
        });

        reorderedLines.push(reorderedValues.join(','));
    }

    // Write back to file
    fs.writeFileSync(filepath, reorderedLines.join('\n'));
    console.log(`   ✅ Saved with new column order`);
}

/**
 * Simple CSV row parser (handles quoted values with commas)
 */
function parseCSVRow(row) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quotes
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    // Add last field
    values.push(current);

    return values;
}

/**
 * Main process
 */
function main() {
    console.log('🔄 Reordering CSV columns for better Excel viewing...\n');

    const csvDir = path.join(__dirname, '../data/csv');

    // Define priority columns for each file type
    const columnOrders = {
        items: ['id', 'name', '_status', 'icon', '_tier', 'tier', 'category', 'rarity', 'description', 'value'],
        nodes: ['id', 'name', '_status', 'icon', '_tier', 'tier', 'nodeType', 'category', 'description', 'baseHealth'],
        enemies: ['id', 'name', '_status', 'icon', '_difficulty', 'tier', 'description', 'health', 'attackDamage'],
        skills: ['id', 'name', '_status', 'icon', 'description', 'maxLevel'],
        regions: ['id', 'name', '_status', 'description', 'coordinates'],
        recipes: ['id', 'name', '_status', 'output', 'skill', 'level'],
        missions: ['id', 'name', '_status', 'description', 'metadata_category', 'metadata_difficulty']
    };

    // Process each CSV file
    for (let filename in columnOrders) {
        const filepath = path.join(csvDir, `${filename}.csv`);

        if (fs.existsSync(filepath)) {
            reorderCSV(filepath, columnOrders[filename]);
        } else {
            console.log(`\n⚠️  ${filename}.csv not found, skipping`);
        }
    }

    // Copy to outputs
    console.log('\n📦 Copying reordered CSVs to outputs/...');
    const outputDir = path.join(__dirname, '../outputs');

    for (let filename in columnOrders) {
        const srcPath = path.join(csvDir, `${filename}.csv`);
        const dstPath = path.join(outputDir, `${filename}.csv`);

        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, dstPath);
        }
    }

    console.log('\n✅ All CSV files reordered!');
    console.log('\n📋 Important columns now appear first:');
    console.log('   1. id');
    console.log('   2. name');
    console.log('   3. _status');
    console.log('   4. icon');
    console.log('   5. tier (or _tier)');
    console.log('   6. category/type');
    console.log('   ...then remaining columns alphabetically');
    console.log('\n💡 Now when you import these CSVs to Excel, columns will be in a logical order!');
}

main();
