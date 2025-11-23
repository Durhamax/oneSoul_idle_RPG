/**
 * Script to add `instanced` property to all items
 *
 * Usage: node scripts/add-instanced-flag.js <file-path> <instanced-value>
 * Example: node scripts/add-instanced-flag.js src/data/items/production/materials/materials.js false
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const instancedValue = process.argv[3] === 'true';

if (!filePath) {
    console.error('❌ Error: Please provide a file path');
    console.error('Usage: node scripts/add-instanced-flag.js <file-path> <instanced-value>');
    process.exit(1);
}

const fullPath = path.join(__dirname, '..', filePath);

if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: File not found: ${fullPath}`);
    process.exit(1);
}

console.log(`📝 Processing: ${filePath}`);
console.log(`🔧 Setting instanced: ${instancedValue}`);

let content = fs.readFileSync(fullPath, 'utf8');
let modified = 0;

// Pattern to find category lines and add instanced after them
// Matches:     category: 'material',  OR  category: "material",  OR  category: "currency", etc.
const pattern = /(category: ['"](?:material|consumable|resource|currency|quest|special|key|equipment)['"],)\s*\n/g;

content = content.replace(pattern, (match, p1) => {
    modified++;
    return `${p1}\n        instanced: ${instancedValue},  // ${instancedValue ? 'Unique instance' : 'Stackable resource'}\n`;
});

if (modified > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Modified ${modified} items`);
    console.log(`💾 Saved: ${filePath}`);
} else {
    console.log(`⚠️  No modifications needed`);
}
