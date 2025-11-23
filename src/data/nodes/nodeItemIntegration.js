/**
 * NODE-ITEM INTEGRATION
 *
 * Handles automatic registration of items defined within node resource tables.
 * This eliminates the need for separate material definition files.
 */

const NodeItemIntegration = {
    /**
     * Extract and register all items defined in node resource tables
     * @param {Object} nodeRegistry - The NodeRegistry object containing all nodes
     * @returns {Object} - Statistics about registered items
     */
    registerNodeItems(nodeRegistry) {
        console.log('🔗 Registering items from node definitions...');
        console.log('   ItemRegistry available:', typeof ItemRegistry !== 'undefined');
        console.log('   NodeRegistry available:', typeof nodeRegistry !== 'undefined');

        const stats = {
            total: 0,
            registered: 0,
            skipped: 0,
            errors: []
        };

        const allNodes = nodeRegistry.getAllActive();
        console.log('   Total nodes to scan:', Object.keys(allNodes).length);

        for (let nodeId in allNodes) {
            const node = allNodes[nodeId];

            // Process main resource table
            if (node.resourceTable && Array.isArray(node.resourceTable)) {
                for (let resource of node.resourceTable) {
                    this._processResource(resource, node, stats);
                }
            }

            // Process rare drop table
            if (node.rareDropTable && Array.isArray(node.rareDropTable)) {
                for (let resource of node.rareDropTable) {
                    this._processResource(resource, node, stats);
                }
            }
        }

        console.log(`✅ Node item registration complete:`);
        console.log(`   Total resources: ${stats.total}`);
        console.log(`   Registered: ${stats.registered}`);
        console.log(`   Skipped (already exist): ${stats.skipped}`);

        if (stats.errors.length > 0) {
            console.warn(`⚠️  Errors: ${stats.errors.length}`);
            stats.errors.forEach(err => console.warn(`   - ${err}`));
        }

        return stats;
    },

    /**
     * Process a single resource entry
     * @private
     */
    _processResource(resource, node, stats) {
        stats.total++;

        // Skip if no embedded item definition
        if (!resource.itemDef) {
            stats.skipped++;
            return;
        }

        const itemId = resource.itemId;
        const itemDef = resource.itemDef;

        // Validate item definition has minimum required fields
        if (!itemDef.id || !itemDef.name) {
            stats.errors.push(`Invalid item definition in ${node.id}: missing id or name`);
            return;
        }

        // Ensure itemId matches embedded definition
        if (itemDef.id !== itemId) {
            stats.errors.push(`Item ID mismatch in ${node.id}: ${itemId} vs ${itemDef.id}`);
            return;
        }

        // Check if item already exists in registry
        if (typeof ItemRegistry !== 'undefined') {
            // Check if item already exists in any registry
            const existing = ItemRegistry.production[itemId] ||
                           ItemRegistry.dev[itemId] ||
                           ItemRegistry.legacy[itemId];

            if (existing) {
                // Item already registered, skip
                stats.skipped++;
                return;
            }

            // Register the item to the production registry
            try {
                // Add default values for required fields
                const completeItemDef = {
                    category: 'resource',  // Default: resource (wood, ore, fish, etc.)
                    rarity: 'common',
                    stackLimit: 100,
                    value: 1,
                    tags: [],
                    ...itemDef,
                    // Add source tracking
                    _sourceNode: node.id,
                    _sourceSkill: node.nodeType
                };

                ItemRegistry.production[itemId] = completeItemDef;
                stats.registered++;
                console.log(`   ✅ Registered: ${itemId} from ${node.id}`);

            } catch (error) {
                stats.errors.push(`Failed to register ${itemId}: ${error.message}`);
                console.error(`   ❌ Failed to register ${itemId}:`, error);
            }
        } else {
            stats.errors.push('ItemRegistry not available');
        }
    },

    /**
     * Get all items that were registered from nodes
     * @returns {Array} - Array of item IDs with their source nodes
     */
    getNodeSourcedItems() {
        if (typeof ItemRegistry === 'undefined') {
            return [];
        }

        const items = [];
        const allItems = ItemRegistry.getByStatus('production');

        for (let itemId in allItems) {
            const item = allItems[itemId];
            if (item._sourceNode) {
                items.push({
                    itemId: itemId,
                    itemName: item.name,
                    sourceNode: item._sourceNode,
                    sourceSkill: item._sourceSkill
                });
            }
        }

        return items;
    },

    /**
     * Print a report of all node-sourced items
     */
    printReport() {
        const items = this.getNodeSourcedItems();

        if (items.length === 0) {
            console.log('No items registered from nodes');
            return;
        }

        console.log(`\n📊 Node-Sourced Items Report (${items.length} items)`);
        console.log('═'.repeat(60));

        // Group by skill
        const bySkill = {};
        items.forEach(item => {
            if (!bySkill[item.sourceSkill]) {
                bySkill[item.sourceSkill] = [];
            }
            bySkill[item.sourceSkill].push(item);
        });

        for (let skill in bySkill) {
            console.log(`\n${skill.toUpperCase()} (${bySkill[skill].length} items):`);
            bySkill[skill].forEach(item => {
                console.log(`  • ${item.itemName} (${item.itemId}) from ${item.sourceNode}`);
            });
        }
    }
};
