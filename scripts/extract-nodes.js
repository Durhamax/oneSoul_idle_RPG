/**
 * EXTRACT NODES FROM PRODUCTION FILES
 *
 * Special script to extract node data since NodeRegistry requires browser context
 */

const fs = require('fs');
const path = require('path');

// Mock NodeRegistry to capture node definitions
global.NodeRegistry = {
    production: {}
};

// Load all node production files
const nodeFiles = [
    '../src/data/nodes/nodeRegistry.js',
    '../src/data/nodes/production/mining.js',
    '../src/data/nodes/production/logging.js',
    '../src/data/nodes/production/fishing.js',
    '../src/data/nodes/production/hunting.js',
    '../src/data/nodes/production/foraging.js',
    '../src/data/nodes/production/thieving.js'
];

console.log('📦 Loading node files...');

for (let file of nodeFiles) {
    const filepath = path.join(__dirname, file);
    if (fs.existsSync(filepath)) {
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            eval(content);
            console.log(`   ✅ Loaded: ${path.basename(file)}`);
        } catch (error) {
            console.log(`   ⚠️  Skipped: ${path.basename(file)} (${error.message})`);
        }
    }
}

console.log(`\n📊 Found ${Object.keys(NodeRegistry.production).length} nodes`);

// Flatten object function (same as extract-to-csv.js)
function flattenObject(obj, prefix = '') {
    let flat = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}_${key}` : key;

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(flat, flattenObject(value, newKey));
            } else if (Array.isArray(value)) {
                flat[newKey] = JSON.stringify(value);
            } else {
                flat[newKey] = value;
            }
        }
    }

    return flat;
}

// Convert to CSV function (same as extract-to-csv.js)
function objectsToCSV(objects) {
    if (!objects || objects.length === 0) {
        return '';
    }

    const allKeys = new Set();
    objects.forEach(obj => {
        Object.keys(obj).forEach(key => allKeys.add(key));
    });

    const keys = Array.from(allKeys).sort();
    const header = keys.join(',');

    const rows = objects.map(obj => {
        return keys.map(key => {
            let value = obj[key];

            if (value === undefined || value === null) {
                return '';
            } else if (typeof value === 'boolean') {
                return value ? 'TRUE' : 'FALSE';
            } else if (typeof value === 'string') {
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            } else {
                return value;
            }
        }).join(',');
    });

    return header + '\n' + rows.join('\n');
}

// Extract nodes
const flattened = [];

for (let nodeId in NodeRegistry.production) {
    const node = { ...NodeRegistry.production[nodeId] };
    const flat = flattenObject(node);

    flat.id = nodeId;
    flat._notes = '';
    flat._status = 'active';

    flattened.push(flat);
}

// Write CSV
const outputDir = path.join(__dirname, '../data/csv');
const nodesCSV = objectsToCSV(flattened);
fs.writeFileSync(path.join(outputDir, 'nodes.csv'), nodesCSV);

console.log(`✅ Extracted ${flattened.length} nodes to nodes.csv`);
