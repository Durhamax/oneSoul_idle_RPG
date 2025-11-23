/**
 * CREATE CLEAN STARTER REGION DATA
 *
 * Filters to only essential items and nodes for starter region
 */

const fs = require('fs');
const path = require('path');

// Parse CSV helper
function parseCSVRow(row) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

// Convert CSV to array of objects
function csvToObjects(csvPath) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());

    const headers = parseCSVRow(lines[0]);
    const objects = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVRow(lines[i]);
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        objects.push(obj);
    }

    return { headers, objects };
}

// Convert objects back to CSV
function objectsToCSV(headers, objects) {
    const escapeValue = (val) => {
        if (!val) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };

    const rows = [headers.join(',')];
    objects.forEach(obj => {
        const row = headers.map(h => escapeValue(obj[h]));
        rows.push(row.join(','));
    });

    return rows.join('\n');
}

console.log('🧹 Creating clean starter region data...\n');

// ===== STARTER ITEMS =====
console.log('📦 Filtering items...');

const itemsPath = path.join(__dirname, '../data/csv/items.csv');
const { headers: itemHeaders, objects: allItems } = csvToObjects(itemsPath);

// Essential starter items
const starterItemIds = new Set([
    // Currency
    'gold',

    // New starter materials
    'clay',
    'flint',
    'goldFlakes',
    'solfish',

    // Basic starter tools
    'stone_pickaxe',
    'stone_hatchet',
    'fishing_net',

    // Basic resources (if they exist)
    'wood',
    'stone',
    'ore',

    // Light rations (for navigation)
    'lightRations',

    // Basic starting gear
    'dagger',
    'clothHood',
    'huntingJacket',
    'clothPants'
]);

const starterItems = allItems.filter(item => starterItemIds.has(item.id));

console.log(`   Kept: ${starterItems.length} / ${allItems.length} items`);
console.log(`   Items: ${starterItems.map(i => i.id).join(', ')}`);

// ===== STARTER NODES =====
console.log('\n🌳 Filtering nodes...');

const nodesPath = path.join(__dirname, '../data/csv/nodes.csv');
const { headers: nodeHeaders, objects: allNodes } = csvToObjects(nodesPath);

// Keep only tier 1 starter nodes
const starterNodes = allNodes.filter(node => {
    // Keep our new custom nodes
    if (node.id === 'riverbed' || node.id === 'cradle_lake_shallows') {
        return true;
    }

    // Keep basic tier 1 nodes (copper, normal logs, basic fish, etc.)
    const tier1StarterNodes = [
        'copper_vein',      // Mining - basic copper
        'normal_tree',      // Logging - basic wood
        'pond_basic',       // Fishing - basic fish
        'rabbit_burrow',    // Hunting - basic game
        'herb_patch',       // Foraging - basic herbs
        'wooden_crate'      // Thieving - basic loot
    ];

    if (tier1StarterNodes.includes(node.id)) {
        return true;
    }

    return false;
});

console.log(`   Kept: ${starterNodes.length} / ${allNodes.length} nodes`);
console.log(`   Nodes: ${starterNodes.map(n => n.id).join(', ')}`);

// ===== SAVE CLEANED DATA =====
console.log('\n💾 Saving cleaned data...');

const outputDir = path.join(__dirname, '../data/csv');

const cleanItemsCSV = objectsToCSV(itemHeaders, starterItems);
const cleanNodesCSV = objectsToCSV(nodeHeaders, starterNodes);

fs.writeFileSync(path.join(outputDir, 'items.csv'), cleanItemsCSV);
fs.writeFileSync(path.join(outputDir, 'nodes.csv'), cleanNodesCSV);

// Copy to outputs
const outputsDir = path.join(__dirname, '../outputs');
fs.writeFileSync(path.join(outputsDir, 'items.csv'), cleanItemsCSV);
fs.writeFileSync(path.join(outputsDir, 'nodes.csv'), cleanNodesCSV);

console.log('\n✅ Cleanup complete!\n');
console.log('📊 Final counts:');
console.log(`   Items: ${starterItems.length} (was ${allItems.length})`);
console.log(`   Nodes: ${starterNodes.length} (was ${allNodes.length})`);
console.log('\n📁 Updated files:');
console.log('   - data/csv/items.csv');
console.log('   - data/csv/nodes.csv');
console.log('   - outputs/items.csv');
console.log('   - outputs/nodes.csv');
console.log('\n💡 Next step: npm run import-to-excel');
