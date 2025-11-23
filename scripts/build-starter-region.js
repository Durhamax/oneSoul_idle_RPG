/**
 * BUILD STARTER REGION
 *
 * Creates clean "The Cradle" region with proper node references
 */

const fs = require('fs');
const path = require('path');

// Helper to create CSV from data
function createCSV(headers, rows) {
    const escape = (val) => {
        if (!val && val !== 0) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };

    const lines = [headers.join(',')];
    rows.forEach(row => {
        const line = headers.map(h => escape(row[h] || '')).join(',');
        lines.push(line);
    });

    return lines.join('\n');
}

console.log('🏰 Building starter region: The Cradle\n');

// Region headers - matching the structure
const regionHeaders = [
    'id',
    'name',
    '_status',
    'description',
    '_notes',
    'baseFogAmount',
    'craftingNodes_chemistry',
    'craftingNodes_cooking',
    'craftingNodes_engineering',
    'craftingNodes_forging',
    'craftingNodes_machining',
    'craftingNodes_textiles',
    'gatheringNodes_fishing',
    'gatheringNodes_foraging',
    'gatheringNodes_hunting',
    'gatheringNodes_logging',
    'gatheringNodes_mining',
    'gatheringNodes_thieving',
    'locations',
    'navigationRequirement',
    'unlockRequirement_mining',
    'unlockRequirement_navigation'
];

// The Cradle - starter region (region_-3_-4 = coordinates -3,-4)
const theCradle = {
    id: 'region_-3_-4',
    name: 'The Cradle',
    _status: 'active',
    description: 'A peaceful starting region with riverbeds and shallows of Cradle Lake',
    _notes: '',
    baseFogAmount: 100,

    // Crafting nodes (basic tier 1)
    craftingNodes_chemistry: '[]',
    craftingNodes_cooking: '["campfire"]',
    craftingNodes_engineering: '[]',
    craftingNodes_forging: '[]',
    craftingNodes_machining: '[]',
    craftingNodes_textiles: '[]',

    // Gathering nodes - only our two custom nodes
    gatheringNodes_fishing: '["cradle_lake_shallows"]',
    gatheringNodes_foraging: '[]',
    gatheringNodes_hunting: '[]',
    gatheringNodes_logging: '[]',
    gatheringNodes_mining: '["riverbed"]',
    gatheringNodes_thieving: '[]',

    // Locations for navigation
    locations: '[]',

    // Requirements
    navigationRequirement: 0,
    unlockRequirement_mining: '',
    unlockRequirement_navigation: ''
};

// Save files
console.log('💾 Creating regions.csv...\n');

const regionsCSV = createCSV(regionHeaders, [theCradle]);

const outputDir = path.join(__dirname, '../outputs');
fs.writeFileSync(path.join(outputDir, 'regions.csv'), regionsCSV);

const dataDir = path.join(__dirname, '../data/csv');
fs.writeFileSync(path.join(dataDir, 'regions.csv'), regionsCSV);

console.log('✅ Starter region created!\n');
console.log('📊 Contents:');
console.log('   Region: The Cradle');
console.log('   - Fishing nodes: cradle_lake_shallows');
console.log('   - Mining nodes: riverbed');
console.log('   - Crafting: campfire (cooking)');
console.log();
console.log('📁 Files saved to:');
console.log('   - outputs/regions.csv');
console.log('   - data/csv/regions.csv');
console.log();
console.log('💡 Next: npm run import-to-excel (close Excel first!)');
