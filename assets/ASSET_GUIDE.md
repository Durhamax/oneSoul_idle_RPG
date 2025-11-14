# Game Assets - Complete Guide

## 📁 Directory Structure

```
assets/
├── backgrounds/          # Background images
│   ├── regions/         # Specific region backgrounds
│   ├── biomes/          # Generic biome backgrounds
│   └── ui/              # UI panel backgrounds
├── nodes/               # Resource node images
│   ├── mining/
│   ├── logging/
│   ├── fishing/
│   ├── hunting/
│   ├── foraging/
│   └── thieving/
├── items/               # Item images
│   ├── equipment/
│   │   ├── weapons/
│   │   ├── armor/
│   │   └── tools/
│   ├── consumables/
│   ├── materials/
│   └── currencies/
├── enemies/             # Enemy sprites
├── npcs/                # NPC portraits
├── icons/               # UI and skill icons
│   ├── skills/
│   ├── ui/
│   └── status/
└── particles/           # Effect sprites
```

---

## 📝 Naming Conventions

### Format Rules
1. **Lowercase only**: `node_copper_vein.png` ✅
2. **Underscores for spaces**: `item_health_potion.png` ✅
3. **Category prefix**: Always start with type (`node_`, `item_`, etc.)
4. **Match game IDs**: Filename must match code ID
5. **Variants use numbers**: `_01`, `_02`, etc.

---

## 🎨 Category Guidelines

### **Backgrounds**

#### Region Backgrounds
```
Format: region_{biome}_{variant}.png
Size: 1920x1080 (or larger)
Format: PNG or JPG

Examples:
- region_plains_01.png
- region_forest_01.png
- region_mountains_01.png
```

#### Biome Backgrounds (Generic)
```
Format: biome_{biome}.png
Size: 1920x1080

Examples:
- biome_plains.png
- biome_forest.png
```

**Usage:**
```javascript
// Get region-specific background
AssetManager.getRegionBackground('plains', '01')
// → assets/backgrounds/regions/region_plains_01.png

// Get generic biome background
AssetManager.getBiomeBackground('forest')
// → assets/backgrounds/biomes/biome_forest.png
```

---

### **Resource Nodes**

```
Format: node_{nodeId}.png
Size: 256x256 or 512x512
Format: PNG with transparency

Examples:
- node_copper_vein.png
- node_oak_tree.png
- node_pond_fishing_spot.png

Location: assets/nodes/{skillType}/node_{nodeId}.png
```

**Must match node IDs:**
```javascript
// In production/mining.js
NodeRegistry.production.copper_vein = {
    id: "copper_vein",  // ← Must match: node_copper_vein.png
    // ...
}
```

**Usage:**
```javascript
// Get node image
AssetManager.getNodeImage('copper_vein', 'mining')
// → assets/nodes/mining/node_copper_vein.png
```

---

### **Items**

```
Format: item_{itemId}_{variant}.png
Size: 128x128 or 256x256
Format: PNG with transparency

Examples:
- item_sword_iron.png
- item_helmet_steel.png
- item_potion_health.png
- item_ore_copper.png

Location: assets/items/{category}/{subcategory}/item_{itemId}.png
```

**Organization by category:**
```
items/
├── equipment/
│   ├── weapons/item_sword_iron.png
│   ├── armor/item_helmet_iron.png
│   └── tools/item_pickaxe_iron.png
├── consumables/item_potion_health.png
├── materials/item_ore_copper.png
└── currencies/item_coin_gold.png
```

**Usage:**
```javascript
// Equipment with subcategory
AssetManager.getItemImage('sword_iron', 'equipment', 'weapons')
// → assets/items/equipment/weapons/item_sword_iron.png

// Materials without subcategory
AssetManager.getItemImage('ore_copper', 'materials')
// → assets/items/materials/item_ore_copper.png
```

---

### **Enemies**

```
Format: enemy_{enemyId}_{variant}.png
Size: 256x256 or 512x512
Format: PNG with transparency

Examples:
- enemy_goblin.png
- enemy_goblin_archer.png (variant)
- enemy_wolf.png
- enemy_skeleton_warrior.png

Location: assets/enemies/enemy_{enemyId}.png
```

**Usage:**
```javascript
AssetManager.getEnemyImage('goblin')
// → assets/enemies/enemy_goblin.png
```

---

### **NPCs**

```
Format: npc_{npcId}.png
Size: 256x256 or 512x512
Format: PNG with transparency

Examples:
- npc_blacksmith.png
- npc_elder.png
- npc_merchant.png

Location: assets/npcs/npc_{npcId}.png
```

**Usage:**
```javascript
AssetManager.getNPCImage('blacksmith')
// → assets/npcs/npc_blacksmith.png
```

---

### **Icons**

```
Format: icon_{iconId}.png
Size: 64x64 or 128x128
Format: PNG with transparency

Examples:
- icon_mining.png (skill icon)
- icon_inventory.png (UI icon)
- icon_health.png (status icon)

Location: assets/icons/{type}/icon_{iconId}.png
```

**Usage:**
```javascript
// Skill icon
AssetManager.getIcon('skills', 'mining')
// → assets/icons/skills/icon_mining.png

// UI icon
AssetManager.getIcon('ui', 'inventory')
// → assets/icons/ui/icon_inventory.png
```

---

## 🔧 Integration Examples

### **1. Update Background System**

```javascript
// In src/systems/backgroundSystem.js
updateBackground() {
    const region = GameEngine.state.currentRegion;
    const regionDef = GameEngine.definitions.regions[region];
    const biome = regionDef?.biome || 'plains';

    // Try region-specific background first
    let bgPath = AssetManager.getRegionBackground(biome, '01');

    // Fallback to generic biome background
    if (!await AssetManager.imageExists(bgPath)) {
        bgPath = AssetManager.getBiomeBackground(biome);
    }

    // Apply background
    document.body.style.backgroundImage = `url('${bgPath}')`;
}
```

---

### **2. Update Node UI**

```javascript
// In src/ui/nodeCollectionUI.js
renderNodeCard(node) {
    const imagePath = AssetManager.getNodeImage(node.id, node.nodeType);

    return `
        <div class="node-card">
            <div class="node-image"
                 style="${AssetManager.getBackgroundStyle(imagePath)}">
                <!-- Or use img tag -->
                ${AssetManager.getImageHTML(imagePath, node.name, 'node-icon')}
            </div>
            <div class="node-info">
                <h3>${node.name}</h3>
                <!-- ... rest of card -->
            </div>
        </div>
    `;
}
```

---

### **3. Update Item Tooltips**

```javascript
// In src/ui/tooltipUI.js
showItemTooltip(itemId) {
    const item = GameEngine.definitions.items[itemId];
    const imagePath = AssetManager.getItemImage(
        itemId,
        item.category,
        item.subcategory
    );

    return `
        <div class="tooltip">
            ${AssetManager.getImageHTML(imagePath, item.name, 'item-icon')}
            <h3>${item.name}</h3>
            <!-- ... rest of tooltip -->
        </div>
    `;
}
```

---

## 🎯 File Format Recommendations

| Asset Type | Format | Size | Transparency |
|------------|--------|------|--------------|
| Backgrounds | JPG or PNG | 1920x1080+ | Optional |
| Nodes | PNG | 256x256 or 512x512 | Yes |
| Items | PNG | 128x128 or 256x256 | Yes |
| Enemies | PNG | 256x256 or 512x512 | Yes |
| NPCs | PNG | 256x256 or 512x512 | Yes |
| Icons | PNG | 64x64 or 128x128 | Yes |
| Particles | PNG | 64x64 or 128x128 | Yes |

---

## 📋 Asset Checklist

### When Adding New Assets:

1. **✅ Place in correct directory**
   - Follow the structure above

2. **✅ Use correct naming convention**
   - Lowercase, underscores, category prefix

3. **✅ Match game ID exactly**
   - Filename must match ID in code

4. **✅ Use appropriate file format**
   - PNG for transparency, JPG for backgrounds

5. **✅ Optimize file size**
   - Compress images without losing quality
   - Use tools like TinyPNG or ImageOptim

6. **✅ Test in game**
   - Verify image loads correctly
   - Check fallback behavior

---

## 🔍 Finding Missing Assets

### Check what assets are needed:

```javascript
// In console
// Get all node IDs
const nodeIds = Object.keys(NodeRegistry.getAllActive());
console.log('Node assets needed:', nodeIds);

// Get all item IDs
const itemIds = Object.keys(GameEngine.definitions.items);
console.log('Item assets needed:', itemIds);

// Check if specific asset exists
await AssetManager.imageExists('assets/nodes/mining/node_copper_vein.png');
```

---

## 🎨 Fallback Behavior

If an image is missing:

1. **Emoji fallback** (current system)
   - Node: 🪨
   - Item: 📦
   - Enemy: 👹

2. **Placeholder image** (recommended)
   - Create placeholder images for each category
   - `assets/placeholders/placeholder_node.png`

3. **Hide element** (if appropriate)
   - Image fails to load → hide with `onerror`

---

## 🚀 Preloading Assets

### Preload critical assets on game start:

```javascript
// In game initialization
async function initGame() {
    console.log('Loading assets...');

    // Preload critical assets
    await AssetManager.preloadCriticalAssets();

    // Preload all node images
    await AssetManager.preloadNodeImages();

    console.log('Assets loaded!');
    GameEngine.init();
}
```

---

## 📦 Bulk Asset Naming Tool

Create a helper script to rename files in bulk:

```javascript
// renameAssets.js (Node.js script)
const fs = require('fs');
const path = require('path');

const assetsDir = './assets/nodes/mining';
const prefix = 'node_';

fs.readdirSync(assetsDir).forEach(file => {
    if (!file.startsWith(prefix)) {
        const newName = prefix + file.toLowerCase().replace(/\s+/g, '_');
        fs.renameSync(
            path.join(assetsDir, file),
            path.join(assetsDir, newName)
        );
        console.log(`Renamed: ${file} → ${newName}`);
    }
});
```

---

## 🎯 Quick Reference

### How to add images:

1. **Save image to correct folder**
   ```
   assets/nodes/mining/node_copper_vein.png
   ```

2. **Use in code**
   ```javascript
   const imagePath = AssetManager.getNodeImage('copper_vein', 'mining');
   ```

3. **Display in HTML**
   ```html
   <img src="${imagePath}" alt="Copper Vein">
   ```

4. **Or as background**
   ```javascript
   element.style.backgroundImage = `url('${imagePath}')`;
   ```

---

## 🔗 Integration Checklist

- [ ] Create assets/ directory structure
- [ ] Add AssetManager.js to index.html
- [ ] Update backgroundSystem.js to use AssetManager
- [ ] Update nodeCollectionUI.js to show node images
- [ ] Update item tooltips to show item images
- [ ] Add placeholders for missing assets
- [ ] Test with actual images
- [ ] Optimize image file sizes

---

**Last Updated:** 2025-01-10
**Version:** 1.0
