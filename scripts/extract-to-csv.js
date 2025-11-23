/**
 * EXTRACT GAME DATA TO CSV
 *
 * Reads definitions.js and creates CSV template files
 * for Excel-based data management workflow
 */

const fs = require('fs');
const path = require('path');

// Read definitions.js
const definitionsPath = path.join(__dirname, '../src/core/definitions.js');
let definitionsContent = fs.readFileSync(definitionsPath, 'utf8');

// Parse the GameDefinitions object by evaluating it
// (In production, we'd use a proper parser, but for extraction this works)
const GameDefinitions = eval(definitionsContent + '; GameDefinitions;');

/**
 * Flatten nested objects with underscore notation
 * Example: { combatStats: { damage: 10 } } → { combatStats_damage: 10 }
 */
function flattenObject(obj, prefix = '') {
    let flat = {};

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}_${key}` : key;

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Recursively flatten nested objects
                Object.assign(flat, flattenObject(value, newKey));
            } else if (Array.isArray(value)) {
                // Convert arrays to JSON strings
                flat[newKey] = JSON.stringify(value);
            } else {
                flat[newKey] = value;
            }
        }
    }

    return flat;
}

/**
 * Convert array of objects to CSV
 */
function objectsToCSV(objects) {
    if (!objects || objects.length === 0) {
        return '';
    }

    // Get all unique keys from all objects
    const allKeys = new Set();
    objects.forEach(obj => {
        Object.keys(obj).forEach(key => allKeys.add(key));
    });

    const keys = Array.from(allKeys).sort();

    // Create header row
    const header = keys.join(',');

    // Create data rows
    const rows = objects.map(obj => {
        return keys.map(key => {
            let value = obj[key];

            // Handle different value types
            if (value === undefined || value === null) {
                return '';
            } else if (typeof value === 'boolean') {
                return value ? 'TRUE' : 'FALSE';
            } else if (typeof value === 'string') {
                // Escape quotes and wrap in quotes if contains comma or quote
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

/**
 * Extract items data
 */
function extractItems() {
    console.log('Extracting items...');

    const items = GameDefinitions.items || {};
    const flattened = [];

    for (let itemId in items) {
        const item = { ...items[itemId] };
        const flat = flattenObject(item);

        // Ensure ID is present
        flat.id = itemId;

        // Add reference columns
        flat._tier = flat.tier || '';
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Extract skills data
 */
function extractSkills() {
    console.log('Extracting skills...');

    const skills = GameDefinitions.skills || {};
    const flattened = [];

    for (let skillId in skills) {
        const skill = { ...skills[skillId] };
        const flat = flattenObject(skill);

        flat.id = skillId;
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Extract enemies data
 */
function extractEnemies() {
    console.log('Extracting enemies...');

    const enemies = GameDefinitions.enemies || {};
    const flattened = [];

    for (let enemyId in enemies) {
        const enemy = { ...enemies[enemyId] };
        const flat = flattenObject(enemy);

        flat.id = enemyId;
        flat._difficulty = flat.level || '';
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Extract regions data
 */
function extractRegions() {
    console.log('Extracting regions...');

    const regions = GameDefinitions.regions || {};
    const flattened = [];

    for (let regionId in regions) {
        const region = { ...regions[regionId] };
        const flat = flattenObject(region);

        flat.id = regionId;
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Extract recipes data
 */
function extractRecipes() {
    console.log('Extracting recipes...');

    const recipes = GameDefinitions.recipes || {};
    const flattened = [];

    for (let recipeId in recipes) {
        const recipe = { ...recipes[recipeId] };
        const flat = flattenObject(recipe);

        flat.id = recipeId;
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Extract missions data
 */
function extractMissions() {
    console.log('Extracting missions...');

    const missions = GameDefinitions.missions || {};
    const flattened = [];

    for (let missionId in missions) {
        const mission = { ...missions[missionId] };
        const flat = flattenObject(mission);

        flat.id = missionId;
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Extract nodes data
 */
function extractNodes() {
    console.log('Extracting nodes...');

    // Nodes are in NodeRegistry.production (need to check if NodeRegistry is loaded)
    const nodes = (typeof NodeRegistry !== 'undefined' && NodeRegistry.production) ? NodeRegistry.production : {};
    const flattened = [];

    for (let nodeId in nodes) {
        const node = { ...nodes[nodeId] };
        const flat = flattenObject(node);

        flat.id = nodeId;
        flat._notes = '';
        flat._status = 'active';

        flattened.push(flat);
    }

    return flattened;
}

/**
 * Main extraction process
 */
function main() {
    const outputDir = path.join(__dirname, '../data/csv');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        // Extract each data type
        const itemsData = extractItems();
        const skillsData = extractSkills();
        const enemiesData = extractEnemies();
        const regionsData = extractRegions();
        const recipesData = extractRecipes();
        const missionsData = extractMissions();
        const nodesData = extractNodes();

        // Convert to CSV
        const itemsCSV = objectsToCSV(itemsData);
        const skillsCSV = objectsToCSV(skillsData);
        const enemiesCSV = objectsToCSV(enemiesData);
        const regionsCSV = objectsToCSV(regionsData);
        const recipesCSV = objectsToCSV(recipesData);
        const missionsCSV = objectsToCSV(missionsData);
        const nodesCSV = objectsToCSV(nodesData);

        // Write CSV files
        fs.writeFileSync(path.join(outputDir, 'items.csv'), itemsCSV);
        fs.writeFileSync(path.join(outputDir, 'skills.csv'), skillsCSV);
        fs.writeFileSync(path.join(outputDir, 'enemies.csv'), enemiesCSV);
        fs.writeFileSync(path.join(outputDir, 'regions.csv'), regionsCSV);
        fs.writeFileSync(path.join(outputDir, 'recipes.csv'), recipesCSV);
        fs.writeFileSync(path.join(outputDir, 'missions.csv'), missionsCSV);
        fs.writeFileSync(path.join(outputDir, 'nodes.csv'), nodesCSV);

        console.log('\n✅ CSV extraction complete!');
        console.log(`   Items: ${itemsData.length} records`);
        console.log(`   Skills: ${skillsData.length} records`);
        console.log(`   Enemies: ${enemiesData.length} records`);
        console.log(`   Regions: ${regionsData.length} records`);
        console.log(`   Recipes: ${recipesData.length} records`);
        console.log(`   Missions: ${missionsData.length} records`);
        console.log(`   Nodes: ${nodesData.length} records`);
        console.log(`\n   Files saved to: ${outputDir}`);
    } catch (error) {
        console.error('❌ Extraction failed:', error);
        process.exit(1);
    }
}

// Run extraction
main();
