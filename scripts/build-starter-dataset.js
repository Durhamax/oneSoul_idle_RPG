/**
 * BUILD MINIMAL STARTER DATASET
 *
 * Creates a clean, minimal dataset with only what's needed for starter region
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

console.log('🔨 Building minimal starter dataset...\n');

// ===== STARTER ITEMS =====
const itemHeaders = ['id', 'name', '_status', 'icon', 'category', 'rarity', 'description', 'value', 'stackLimit', 'resourceType', 'gatherSkill', 'gatherLevel', 'slot', 'tags'];

const starterItems = [
    // Currency
    { id: 'gold', name: 'Gold Coins', _status: 'active', icon: '💰', category: 'currency', rarity: 'common', description: 'Shiny gold coins used for trading', value: 1, stackLimit: 10000, resourceType: '', gatherSkill: '', gatherLevel: '', slot: '', tags: '["currency"]' },

    // Riverbed materials
    { id: 'clay', name: 'Clay', _status: 'active', icon: '🟤', category: 'material', rarity: 'common', description: 'Soft clay from riverbeds, useful for crafting and pottery', value: 3, stackLimit: 100, resourceType: 'ore', gatherSkill: 'mining', gatherLevel: 1, slot: '', tags: '["material","clay","mining","crafting"]' },
    { id: 'flint', name: 'Flint', _status: 'active', icon: '⚫', category: 'material', rarity: 'common', description: 'Sharp flint stone, essential for tool-making and fire-starting', value: 5, stackLimit: 100, resourceType: 'ore', gatherSkill: 'mining', gatherLevel: 1, slot: '', tags: '["material","flint","mining","tool-making"]' },
    { id: 'goldFlakes', name: 'Gold Flakes', _status: 'active', icon: '✨', category: 'material', rarity: 'rare', description: 'Tiny flakes of gold found in riverbeds. Rare and valuable.', value: 100, stackLimit: 50, resourceType: 'ore', gatherSkill: 'mining', gatherLevel: 1, slot: '', tags: '["material","gold","mining","rare","precious"]' },

    // Fishing materials
    { id: 'solfish', name: 'Solfish', _status: 'active', icon: '🐟', category: 'material', rarity: 'common', description: 'A small, silvery fish found in shallow lakes. Common catch for beginners.', value: 4, stackLimit: 100, resourceType: 'fish', gatherSkill: 'fishing', gatherLevel: 1, slot: '', tags: '["material","fish","fishing","food"]' },

    // Basic tools
    { id: 'stone_pickaxe', name: 'Stone Pickaxe', _status: 'active', icon: '⛏️', category: 'tool', rarity: 'common', description: 'A crude pickaxe made from stone. Better than nothing.', value: 10, stackLimit: 1, resourceType: '', gatherSkill: '', gatherLevel: '', slot: 'weapon', tags: '["tool","pickaxe","mining","starter"]' },
    { id: 'stone_hatchet', name: 'Stone Hatchet', _status: 'active', icon: '🪓', category: 'tool', rarity: 'common', description: 'A crude hatchet with a stone head. Useful for chopping wood.', value: 10, stackLimit: 1, resourceType: '', gatherSkill: '', gatherLevel: '', slot: 'weapon', tags: '["tool","hatchet","logging","starter"]' },
    { id: 'fishing_net', name: 'Fishing Net', _status: 'active', icon: '🎣', category: 'tool', rarity: 'common', description: 'A simple net for catching fish.', value: 10, stackLimit: 1, resourceType: '', gatherSkill: '', gatherLevel: '', slot: 'weapon', tags: '["tool","fishing","starter"]' },

    // Basic consumable
    { id: 'lightRations', name: 'Light Rations', _status: 'active', icon: '🍖', category: 'consumable', rarity: 'common', description: 'Simple preserved food rations. Restores 10 HP and used for navigation rest.', value: 5, stackLimit: 100, resourceType: 'food', gatherSkill: '', gatherLevel: '', slot: 'food', tags: '["consumable","food","rations","healing","navigation"]' },
];

// ===== STARTER NODES =====
const nodeHeaders = ['id', 'name', '_status', 'icon', 'tier', 'nodeType', 'category', 'description', 'baseHealth', 'harvestTime', 'respawnTime', 'baseXP', 'requiredSkillLevel', 'requirements_skill', 'requirements_toolTier', 'requirements_tools', 'resourceTable', 'biomes', 'rarity'];

const starterNodes = [
    // Mining - Riverbed
    {
        id: 'riverbed',
        name: 'Riverbed',
        _status: 'active',
        icon: '💎',
        tier: 1,
        nodeType: 'mining',
        category: 'ore_deposit',
        description: 'A shallow riverbed rich with clay, flint, and occasional gold flakes',
        baseHealth: 10,
        harvestTime: 3.0,
        respawnTime: 30,
        baseXP: 25,
        requiredSkillLevel: 1,
        requirements_skill: 'mining',
        requirements_toolTier: 1,
        requirements_tools: '["pickaxe"]',
        resourceTable: '[{"itemId":"clay","weight":60,"minYield":1,"maxYield":3,"skillScaling":true},{"itemId":"flint","weight":39,"minYield":1,"maxYield":2,"skillScaling":true},{"itemId":"goldFlakes","weight":1,"minYield":1,"maxYield":1,"skillScaling":false}]',
        biomes: '["plains","river","starting_region"]',
        rarity: 'common'
    },

    // Fishing - Cradle Lake Shallows
    {
        id: 'cradle_lake_shallows',
        name: 'Cradle Lake Shallows',
        _status: 'active',
        icon: '🎣',
        tier: 1,
        nodeType: 'fishing',
        category: 'fish_spot',
        description: 'Shallow waters of Cradle Lake, teeming with solfish',
        baseHealth: 8,
        harvestTime: 2.5,
        respawnTime: 25,
        baseXP: 20,
        requiredSkillLevel: 1,
        requirements_skill: 'fishing',
        requirements_toolTier: 1,
        requirements_tools: '["fishing_rod"]',
        resourceTable: '[{"itemId":"solfish","weight":100,"minYield":1,"maxYield":2,"skillScaling":true}]',
        biomes: '["plains","lake","starting_region"]',
        rarity: 'common'
    }
];

// ===== SAVE FILES =====
console.log('💾 Creating files...\n');

const itemsCSV = createCSV(itemHeaders, starterItems);
const nodesCSV = createCSV(nodeHeaders, starterNodes);

const outputDir = path.join(__dirname, '../outputs');
fs.writeFileSync(path.join(outputDir, 'items.csv'), itemsCSV);
fs.writeFileSync(path.join(outputDir, 'nodes.csv'), nodesCSV);

const dataDir = path.join(__dirname, '../data/csv');
fs.writeFileSync(path.join(dataDir, 'items.csv'), itemsCSV);
fs.writeFileSync(path.join(dataDir, 'nodes.csv'), nodesCSV);

console.log('✅ Minimal starter dataset created!\n');
console.log('📊 Contents:');
console.log(`   Items: ${starterItems.length}`);
console.log('     - Currency: gold');
console.log('     - Materials: clay, flint, goldFlakes, solfish');
console.log('     - Tools: stone_pickaxe, stone_hatchet, fishing_net');
console.log('     - Consumables: lightRations');
console.log();
console.log(`   Nodes: ${starterNodes.length}`);
console.log('     - Mining: riverbed');
console.log('     - Fishing: cradle_lake_shallows');
console.log();
console.log('📁 Files saved to:');
console.log('   - outputs/items.csv');
console.log('   - outputs/nodes.csv');
console.log('   - data/csv/items.csv');
console.log('   - data/csv/nodes.csv');
console.log();
console.log('💡 Next: npm run import-to-excel (close Excel first!)');
