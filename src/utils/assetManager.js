/**
 * ASSET MANAGER
 *
 * Centralized system for loading and managing game assets (images, sprites, etc.)
 */

const AssetManager = {
    // Base paths for different asset categories
    paths: {
        backgrounds: 'assets/backgrounds',
        nodes: 'assets/nodes',
        items: 'assets/items',
        enemies: 'assets/enemies',
        npcs: 'assets/npcs',
        icons: 'assets/icons',
        particles: 'assets/particles'
    },

    // Cache for loaded images
    cache: {},

    // Fallback images for missing assets
    fallbacks: {
        node: '🪨',      // Emoji fallback
        item: '📦',
        enemy: '👹',
        npc: '👤',
        background: null // Use solid color
    },

    /**
     * Get full path for an asset
     */
    getPath(category, subcategory, filename) {
        const basePath = this.paths[category];
        if (!basePath) {
            console.warn(`Unknown asset category: ${category}`);
            return null;
        }

        if (subcategory) {
            return `${basePath}/${subcategory}/${filename}`;
        }
        return `${basePath}/${filename}`;
    },

    /**
     * Get region background path
     */
    getRegionBackground(biome, variant = '01') {
        const filename = `region_${biome}_${variant}.png`;
        return this.getPath('backgrounds', 'regions', filename);
    },

    /**
     * Get biome background path (for general use)
     */
    getBiomeBackground(biome) {
        const filename = `biome_${biome}.png`;
        return this.getPath('backgrounds', 'biomes', filename);
    },

    /**
     * Get node image path
     */
    getNodeImage(nodeId, skillType) {
        const filename = `node_${nodeId}.png`;
        return this.getPath('nodes', skillType, filename);
    },

    /**
     * Get item image path
     */
    getItemImage(itemId, category, subcategory = null) {
        const filename = `item_${itemId}.png`;

        if (subcategory) {
            return `${this.paths.items}/${category}/${subcategory}/${filename}`;
        }
        return this.getPath('items', category, filename);
    },

    /**
     * Get enemy image path
     */
    getEnemyImage(enemyId) {
        const filename = `enemy_${enemyId}.png`;
        return this.getPath('enemies', null, filename);
    },

    /**
     * Get NPC image path
     */
    getNPCImage(npcId) {
        const filename = `npc_${npcId}.png`;
        return this.getPath('npcs', null, filename);
    },

    /**
     * Get icon path
     */
    getIcon(iconType, iconId) {
        const filename = `icon_${iconId}.png`;
        return this.getPath('icons', iconType, filename);
    },

    /**
     * Preload an image
     */
    preloadImage(path) {
        return new Promise((resolve, reject) => {
            // Check cache first
            if (this.cache[path]) {
                resolve(this.cache[path]);
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.cache[path] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${path}`);
                reject(new Error(`Failed to load: ${path}`));
            };
            img.src = path;
        });
    },

    /**
     * Preload multiple images
     */
    async preloadImages(paths) {
        const promises = paths.map(path => this.preloadImage(path));
        const results = await Promise.allSettled(promises);

        const loaded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`Preloaded ${loaded}/${paths.length} images (${failed} failed)`);

        return results;
    },

    /**
     * Get image element (creates or returns cached)
     */
    getImage(path, fallback = null) {
        // Return cached if available
        if (this.cache[path]) {
            return this.cache[path];
        }

        // Create new image
        const img = new Image();
        img.src = path;

        // Handle load error with fallback
        img.onerror = () => {
            console.warn(`Image not found: ${path}`);
            if (fallback) {
                img.src = fallback;
            }
        };

        // Cache it
        this.cache[path] = img;

        return img;
    },

    /**
     * Check if image exists
     */
    async imageExists(path) {
        try {
            await this.preloadImage(path);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get image as CSS background
     */
    getBackgroundStyle(path, fallbackColor = '#1a1a1a') {
        return `
            background-image: url('${path}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: ${fallbackColor};
        `;
    },

    /**
     * Get image HTML element
     */
    getImageHTML(path, alt = '', className = '', style = '') {
        return `<img src="${path}" alt="${alt}" class="${className}" style="${style}"
                     onerror="this.style.display='none'">`;
    },

    /**
     * Preload all node images
     */
    async preloadNodeImages() {
        const nodes = NodeRegistry.getAllActive();
        const paths = [];

        for (const nodeId in nodes) {
            const node = nodes[nodeId];
            const path = this.getNodeImage(node.id, node.nodeType);
            paths.push(path);
        }

        return this.preloadImages(paths);
    },

    /**
     * Preload critical assets (call on game load)
     */
    async preloadCriticalAssets() {
        console.log('🎨 Preloading critical assets...');

        const critical = [
            // UI backgrounds
            this.getPath('backgrounds', 'ui', 'panel_background.png'),

            // Skill icons
            this.getIcon('skills', 'mining'),
            this.getIcon('skills', 'combat'),
            this.getIcon('skills', 'logging'),

            // Common items
            this.getItemImage('sword_iron', 'equipment', 'weapons'),
            this.getItemImage('ore_copper', 'materials')
        ];

        const results = await this.preloadImages(critical);
        return results;
    },

    /**
     * Clear cache (use when needed to free memory)
     */
    clearCache() {
        this.cache = {};
        console.log('🗑️ Asset cache cleared');
    }
};

// Make globally available
if (typeof window !== 'undefined') {
    window.AssetManager = AssetManager;
}
