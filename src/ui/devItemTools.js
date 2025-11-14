/**
 * DEVELOPER ITEM TOOLS
 *
 * Tools for managing items in the developer panel.
 * Provides functionality for viewing, validating, searching, and managing items.
 */

const DevItemTools = {
    /**
     * View items by registry status
     */
    viewItemsByStatus(status) {
        console.log(`\n=== ${status.toUpperCase()} ITEMS ===\n`);

        if (!ItemRegistry) {
            this.showError('ItemRegistry not loaded');
            return;
        }

        let items;
        switch(status) {
            case 'production':
                items = ItemRegistry.getProduction();
                break;
            case 'dev':
                items = ItemRegistry.getDev();
                break;
            case 'test':
                items = ItemRegistry.getTest();
                break;
            case 'legacy':
                items = ItemRegistry.getLegacy();
                break;
            case 'planned':
                items = ItemRegistry.getPlanned();
                break;
            default:
                this.showError('Invalid status');
                return;
        }

        const itemArray = Object.values(items);

        console.log(`Total: ${itemArray.length} items`);

        if (itemArray.length === 0) {
            this.showResults(`
                <div style="text-align: center; padding: 40px; color: #888;">
                    No ${status} items found
                </div>
            `);
            return;
        }

        // Group by category
        const byCategory = {};
        itemArray.forEach(item => {
            const cat = item.category || 'unknown';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(item);
        });

        console.log('\nBy Category:');
        Object.entries(byCategory).forEach(([cat, items]) => {
            console.log(`  ${cat}: ${items.length} items`);
        });

        // Build HTML
        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">
                <strong>${status.toUpperCase()} ITEMS</strong> - ${itemArray.length} total
            </div>
        `;

        for (const [category, items] of Object.entries(byCategory)) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h5 style="color: #4a9eff; margin: 10px 0;">${category.toUpperCase()} (${items.length})</h5>
                    <div style="display: grid; gap: 8px;">
            `;

            items.forEach(item => {
                const rarityColor = this.getRarityColor(item.rarity);
                html += `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-left: 3px solid ${rarityColor}; border-radius: 4px;">
                        <span style="font-size: 1.5em;">${item.icon || '❓'}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: ${rarityColor};">${item.name}</div>
                            <div style="font-size: 0.85em; color: #888;">${item.id}</div>
                        </div>
                        <div style="text-align: right; font-size: 0.85em; color: #aaa;">
                            <div>${item.rarity || 'common'}</div>
                            ${item.level ? `<div>Lv ${item.level}</div>` : ''}
                        </div>
                        <button onclick="DevItemTools.viewItemDetails('${item.id}')"
                                style="padding: 5px 10px; background: #4a9eff; border: 1px solid #2980b9; border-radius: 4px; color: white; cursor: pointer;">
                            View
                        </button>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        this.showResults(html);
    },

    /**
     * View all active items
     */
    viewAllItems() {
        console.log('\n=== ALL ACTIVE ITEMS ===\n');

        if (!ItemRegistry) {
            this.showError('ItemRegistry not loaded');
            return;
        }

        const allItems = ItemRegistry.getAllActive();
        const itemArray = Object.values(allItems);

        console.log(`Total Active: ${itemArray.length} items`);

        const stats = ItemRegistry.getStatistics();
        console.log('\nBy Registry:');
        console.log(`  Production: ${stats.production.count} (${stats.production.active ? 'active' : 'inactive'})`);
        console.log(`  Dev: ${stats.dev.count} (${stats.dev.active ? 'active' : 'inactive'})`);
        console.log(`  Test: ${stats.test.count} (${stats.test.active ? 'active' : 'inactive'})`);
        console.log(`  Legacy: ${stats.legacy.count} (${stats.legacy.active ? 'active' : 'inactive'})`);
        console.log(`  Planned: ${stats.planned.count} (${stats.planned.active ? 'active' : 'inactive'})`);

        // Group by category
        const byCategory = {};
        itemArray.forEach(item => {
            const cat = item.category || 'unknown';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(item);
        });

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
                <strong>ALL ACTIVE ITEMS</strong> - ${itemArray.length} total
            </div>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">
                    <div style="font-size: 1.2em; font-weight: bold;">${stats.production.count}</div>
                    <div style="font-size: 0.85em; color: #aaa;">Production</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 4px;">
                    <div style="font-size: 1.2em; font-weight: bold;">${stats.dev.count}</div>
                    <div style="font-size: 0.85em; color: #aaa;">Dev</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(156, 39, 176, 0.1); border-radius: 4px;">
                    <div style="font-size: 1.2em; font-weight: bold;">${stats.test.count}</div>
                    <div style="font-size: 0.85em; color: #aaa;">Test</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(233, 30, 99, 0.1); border-radius: 4px;">
                    <div style="font-size: 1.2em; font-weight: bold;">${stats.legacy.count}</div>
                    <div style="font-size: 0.85em; color: #aaa;">Legacy</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
                    <div style="font-size: 1.2em; font-weight: bold;">${stats.planned.count}</div>
                    <div style="font-size: 0.85em; color: #aaa;">Planned</div>
                </div>
            </div>
        `;

        for (const [category, items] of Object.entries(byCategory)) {
            html += `<h5 style="color: #4a9eff; margin: 15px 0 10px 0;">${category.toUpperCase()} (${items.length})</h5>`;
            html += `<div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px;">`;

            items.forEach(item => {
                const rarityColor = this.getRarityColor(item.rarity);
                html += `
                    <div onclick="DevItemTools.viewItemDetails('${item.id}')"
                         style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: rgba(0,0,0,0.3); border-left: 2px solid ${rarityColor}; border-radius: 4px; cursor: pointer;">
                        <span>${item.icon || '❓'}</span>
                        <span style="font-size: 0.9em;">${item.name}</span>
                    </div>
                `;
            });

            html += `</div>`;
        }

        this.showResults(html);
    },

    /**
     * Validate all items
     */
    validateAllItems() {
        console.log('\n=== VALIDATING ALL ITEMS ===\n');

        if (!ItemValidator || !ITEMS_DB) {
            this.showError('ItemValidator or ITEMS_DB not loaded');
            return;
        }

        const results = ItemValidator.validateAll(ITEMS_DB);

        console.log(`Total Items: ${results.totalItems}`);
        console.log(`✅ Valid: ${results.validItems}`);
        console.log(`❌ Invalid: ${results.invalidItems}`);
        console.log(`⚠️  Warnings: ${results.totalWarnings}`);

        ItemValidator.printSummary(results);

        let html = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #4a9eff; margin-bottom: 15px;">Validation Results</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 15px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #4a9eff;">${results.totalItems}</div>
                        <div style="font-size: 0.85em; color: #aaa;">Total</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #4caf50;">${results.validItems}</div>
                        <div style="font-size: 0.85em; color: #aaa;">Valid</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(244, 67, 54, 0.1); border-radius: 4px;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #f44336;">${results.invalidItems}</div>
                        <div style="font-size: 0.85em; color: #aaa;">Invalid</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(255, 152, 0, 0.1); border-radius: 4px;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #ff9800;">${results.totalWarnings}</div>
                        <div style="font-size: 0.85em; color: #aaa;">Warnings</div>
                    </div>
                </div>
        `;

        if (results.invalidItems > 0) {
            html += `
                <div style="background: rgba(244, 67, 54, 0.1); border: 1px solid #f44336; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
                    <h5 style="color: #f44336; margin: 0 0 10px 0;">❌ Invalid Items (${results.invalidItems})</h5>
            `;

            results.items.filter(r => !r.isValid).forEach(r => {
                html += `
                    <div style="margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="font-weight: bold; color: #f44336;">${r.itemId}</div>
                        <div style="font-size: 0.9em; color: #aaa; margin-top: 5px;">
                            ${r.errors.map(e => `• ${e}`).join('<br>')}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        if (results.totalWarnings > 0) {
            html += `
                <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid #ff9800; border-radius: 4px; padding: 15px;">
                    <h5 style="color: #ff9800; margin: 0 0 10px 0;">⚠️  Items with Warnings (${results.items.filter(r => r.warnings.length > 0).length})</h5>
                    <div style="font-size: 0.9em; color: #aaa;">
                        Check console for detailed warning messages
                    </div>
                </div>
            `;
        }

        if (results.invalidItems === 0 && results.totalWarnings === 0) {
            html += `
                <div style="background: rgba(76, 175, 80, 0.2); border: 1px solid #4caf50; border-radius: 4px; padding: 20px; text-align: center;">
                    <div style="font-size: 1.5em; margin-bottom: 10px;">✨</div>
                    <div style="font-size: 1.2em; font-weight: bold; color: #4caf50;">All items are valid!</div>
                </div>
            `;
        }

        html += `</div>`;

        this.showResults(html);
    },

    /**
     * Find incomplete items
     */
    findIncompleteItems() {
        console.log('\n=== FINDING INCOMPLETE ITEMS ===\n');

        if (!ItemUtils) {
            this.showError('ItemUtils not loaded');
            return;
        }

        const allItems = ItemUtils.getAllItems();
        const incomplete = [];

        allItems.forEach(item => {
            const issues = [];

            // Check for placeholder/default values
            if (!item.description || item.description === 'No description') {
                issues.push('Missing description');
            }
            if (!item.icon || item.icon === '❓') {
                issues.push('Missing/placeholder icon');
            }
            if (!item.tags || item.tags.length === 0) {
                issues.push('No tags');
            }
            if (!item.value || item.value === 0) {
                issues.push('No value');
            }
            if (!item.level) {
                issues.push('No level');
            }

            if (issues.length > 0) {
                incomplete.push({ item, issues });
            }
        });

        console.log(`Found ${incomplete.length} incomplete items out of ${allItems.length}`);

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 4px;">
                <strong>INCOMPLETE ITEMS</strong> - ${incomplete.length} / ${allItems.length} total
            </div>
        `;

        if (incomplete.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; background: rgba(76, 175, 80, 0.2); border-radius: 4px;">
                    <div style="font-size: 1.5em; margin-bottom: 10px;">✨</div>
                    <div style="font-size: 1.2em; color: #4caf50;">All items are complete!</div>
                </div>
            `;
        } else {
            incomplete.forEach(({ item, issues }) => {
                html += `
                    <div style="margin-bottom: 10px; padding: 12px; background: rgba(0,0,0,0.3); border-left: 3px solid #ff9800; border-radius: 4px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 1.5em;">${item.icon || '❓'}</span>
                            <div style="flex: 1;">
                                <div style="font-weight: bold;">${item.name}</div>
                                <div style="font-size: 0.85em; color: #888;">${item.id}</div>
                            </div>
                        </div>
                        <div style="font-size: 0.9em; color: #ff9800; margin-left: 40px;">
                            ${issues.map(i => `⚠️ ${i}`).join('<br>')}
                        </div>
                    </div>
                `;
            });
        }

        this.showResults(html);
    },

    /**
     * Find duplicate items
     */
    findDuplicateItems() {
        console.log('\n=== FINDING DUPLICATE ITEMS ===\n');

        if (!ItemUtils) {
            this.showError('ItemUtils not loaded');
            return;
        }

        const allItems = ItemUtils.getAllItems();
        const duplicates = [];

        // Check for duplicate IDs (should not happen)
        const ids = {};
        allItems.forEach(item => {
            if (ids[item.id]) {
                duplicates.push({
                    type: 'ID',
                    id: item.id,
                    items: [ids[item.id], item]
                });
            } else {
                ids[item.id] = item;
            }
        });

        // Check for duplicate names
        const names = {};
        allItems.forEach(item => {
            if (names[item.name]) {
                const existing = duplicates.find(d => d.type === 'Name' && d.name === item.name);
                if (existing) {
                    existing.items.push(item);
                } else {
                    duplicates.push({
                        type: 'Name',
                        name: item.name,
                        items: [names[item.name], item]
                    });
                }
            } else {
                names[item.name] = item;
            }
        });

        console.log(`Found ${duplicates.length} duplicate groups`);

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(233, 30, 99, 0.1); border-radius: 4px;">
                <strong>DUPLICATE ITEMS</strong> - ${duplicates.length} groups found
            </div>
        `;

        if (duplicates.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; background: rgba(76, 175, 80, 0.2); border-radius: 4px;">
                    <div style="font-size: 1.5em; margin-bottom: 10px;">✅</div>
                    <div style="font-size: 1.2em; color: #4caf50;">No duplicates found!</div>
                </div>
            `;
        } else {
            duplicates.forEach(dup => {
                html += `
                    <div style="margin-bottom: 15px; padding: 12px; background: rgba(0,0,0,0.3); border-left: 3px solid #e91e63; border-radius: 4px;">
                        <div style="font-weight: bold; color: #e91e63; margin-bottom: 10px;">
                            Duplicate ${dup.type}: ${dup.id || dup.name}
                        </div>
                        <div style="margin-left: 20px;">
                `;

                dup.items.forEach(item => {
                    html += `
                        <div style="padding: 5px; margin-bottom: 5px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            ${item.icon} ${item.name} (${item.id})
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });
        }

        this.showResults(html);
    },

    /**
     * Check missing fields
     */
    checkMissingFields() {
        console.log('\n=== CHECKING MISSING FIELDS ===\n');

        if (!ItemUtils) {
            this.showError('ItemUtils not loaded');
            return;
        }

        const allItems = ItemUtils.getAllItems();
        const requiredFields = ['id', 'name', 'description', 'icon', 'category', 'rarity'];
        const optionalFields = ['value', 'level', 'tags', 'stackLimit'];

        const missing = {
            required: [],
            optional: []
        };

        allItems.forEach(item => {
            const itemMissing = { item, fields: [] };

            requiredFields.forEach(field => {
                if (!item[field]) {
                    itemMissing.fields.push(field);
                }
            });

            if (itemMissing.fields.length > 0) {
                missing.required.push(itemMissing);
            }

            const optionalMissing = { item, fields: [] };
            optionalFields.forEach(field => {
                if (!item[field]) {
                    optionalMissing.fields.push(field);
                }
            });

            if (optionalMissing.fields.length > 0) {
                missing.optional.push(optionalMissing);
            }
        });

        console.log(`Required field issues: ${missing.required.length}`);
        console.log(`Optional field issues: ${missing.optional.length}`);

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">
                <strong>MISSING FIELDS CHECK</strong>
            </div>
        `;

        if (missing.required.length > 0) {
            html += `
                <div style="background: rgba(244, 67, 54, 0.1); border: 1px solid #f44336; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
                    <h5 style="color: #f44336; margin: 0 0 10px 0;">❌ Missing Required Fields (${missing.required.length})</h5>
            `;

            missing.required.forEach(({ item, fields }) => {
                html += `
                    <div style="margin-bottom: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="font-weight: bold;">${item.name} (${item.id})</div>
                        <div style="font-size: 0.9em; color: #f44336; margin-top: 5px;">
                            Missing: ${fields.join(', ')}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        if (missing.optional.length > 0) {
            html += `
                <div style="background: rgba(255, 152, 0, 0.1); border: 1px solid #ff9800; border-radius: 4px; padding: 15px;">
                    <h5 style="color: #ff9800; margin: 0 0 10px 0;">⚠️  Missing Optional Fields (${missing.optional.length})</h5>
                    <div style="font-size: 0.9em; color: #aaa;">
                        First ${Math.min(10, missing.optional.length)} items shown
                    </div>
                    <div style="margin-top: 10px;">
            `;

            missing.optional.slice(0, 10).forEach(({ item, fields }) => {
                html += `
                    <div style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                        <div style="font-weight: bold;">${item.name}</div>
                        <div style="font-size: 0.85em; color: #ff9800;">
                            Missing: ${fields.join(', ')}
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        if (missing.required.length === 0 && missing.optional.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; background: rgba(76, 175, 80, 0.2); border-radius: 4px;">
                    <div style="font-size: 1.5em; margin-bottom: 10px;">✅</div>
                    <div style="font-size: 1.2em; color: #4caf50;">All items have required fields!</div>
                </div>
            `;
        }

        this.showResults(html);
    },

    /**
     * Search items
     */
    searchItems() {
        const input = document.getElementById('itemSearchInput');
        if (!input || !input.value) {
            this.showError('Please enter a search term');
            return;
        }

        const searchTerm = input.value.trim();
        console.log(`\n=== SEARCHING FOR: "${searchTerm}" ===\n`);

        if (!ItemUtils) {
            this.showError('ItemUtils not loaded');
            return;
        }

        const results = ItemUtils.searchItems(searchTerm);

        console.log(`Found ${results.length} results`);

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(74, 158, 255, 0.1); border-radius: 4px;">
                <strong>SEARCH RESULTS</strong> - ${results.length} items for "${searchTerm}"
            </div>
        `;

        if (results.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: #888;">
                    No items found matching "${searchTerm}"
                </div>
            `;
        } else {
            results.forEach(item => {
                const rarityColor = this.getRarityColor(item.rarity);
                html += `
                    <div style="margin-bottom: 8px; padding: 10px; background: rgba(0,0,0,0.3); border-left: 3px solid ${rarityColor}; border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5em;">${item.icon || '❓'}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: ${rarityColor};">${item.name}</div>
                            <div style="font-size: 0.85em; color: #888;">${item.id} - ${item.category}</div>
                        </div>
                        <button onclick="DevItemTools.viewItemDetails('${item.id}')"
                                style="padding: 5px 10px; background: #4a9eff; border: 1px solid #2980b9; border-radius: 4px; color: white; cursor: pointer;">
                            View
                        </button>
                    </div>
                `;
            });
        }

        this.showResults(html);
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const category = document.getElementById('itemCategoryFilter')?.value;
        const rarity = document.getElementById('itemRarityFilter')?.value;
        const tier = document.getElementById('itemTierFilter')?.value;

        console.log(`\n=== APPLYING FILTERS ===`);
        console.log(`Category: ${category || 'all'}`);
        console.log(`Rarity: ${rarity || 'all'}`);
        console.log(`Tier: ${tier || 'all'}`);

        if (!ItemUtils) {
            this.showError('ItemUtils not loaded');
            return;
        }

        let items = ItemUtils.getAllItems();

        if (category) {
            items = items.filter(item => item.category === category);
        }
        if (rarity) {
            items = items.filter(item => item.rarity === rarity);
        }
        if (tier) {
            items = items.filter(item => item.tier === tier);
        }

        console.log(`Found ${items.length} items`);

        let html = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
                <strong>FILTERED RESULTS</strong> - ${items.length} items
                ${category ? `<br>Category: ${category}` : ''}
                ${rarity ? `<br>Rarity: ${rarity}` : ''}
                ${tier ? `<br>Tier: ${tier}` : ''}
            </div>
        `;

        if (items.length === 0) {
            html += `
                <div style="text-align: center; padding: 40px; color: #888;">
                    No items match the selected filters
                </div>
            `;
        } else {
            items.forEach(item => {
                const rarityColor = this.getRarityColor(item.rarity);
                html += `
                    <div style="margin-bottom: 8px; padding: 10px; background: rgba(0,0,0,0.3); border-left: 3px solid ${rarityColor}; border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5em;">${item.icon || '❓'}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: ${rarityColor};">${item.name}</div>
                            <div style="font-size: 0.85em; color: #888;">${item.category}${item.tier ? ` - ${item.tier}` : ''}</div>
                        </div>
                        <button onclick="DevItemTools.viewItemDetails('${item.id}')"
                                style="padding: 5px 10px; background: #4a9eff; border: 1px solid #2980b9; border-radius: 4px; color: white; cursor: pointer;">
                            View
                        </button>
                    </div>
                `;
            });
        }

        this.showResults(html);
    },

    /**
     * Toggle dev mode
     */
    toggleDevMode() {
        if (!ItemRegistry) {
            this.showError('ItemRegistry not loaded');
            return;
        }

        const wasEnabled = ItemRegistry.config.includeDevItems;

        if (wasEnabled) {
            ItemRegistry.disableDevMode();
        } else {
            ItemRegistry.enableDevMode();
        }

        const stats = ItemRegistry.getStatistics();

        console.log(`\nDev Mode: ${wasEnabled ? 'OFF' : 'ON'}`);
        console.log(`Total Active Items: ${stats.totalActive}`);

        this.showSuccess(`Dev Mode ${wasEnabled ? 'Disabled' : 'Enabled'} - ${stats.totalActive} items now active`);

        // Refresh the UI
        if (typeof DeveloperUI !== 'undefined') {
            DeveloperUI.updateItemManagement();
        }
    },

    /**
     * Toggle preview mode
     */
    togglePreviewMode() {
        if (!ItemRegistry) {
            this.showError('ItemRegistry not loaded');
            return;
        }

        const wasEnabled = ItemRegistry.config.includePlannedItems;

        if (wasEnabled) {
            ItemRegistry.disablePreviewMode();
        } else {
            ItemRegistry.enablePreviewMode();
        }

        const stats = ItemRegistry.getStatistics();

        console.log(`\nPreview Mode: ${wasEnabled ? 'OFF' : 'ON'}`);
        console.log(`Total Active Items: ${stats.totalActive}`);

        this.showSuccess(`Preview Mode ${wasEnabled ? 'Disabled' : 'Enabled'} - ${stats.totalActive} items now active`);

        // Refresh the UI
        if (typeof DeveloperUI !== 'undefined') {
            DeveloperUI.updateItemManagement();
        }
    },

    /**
     * Refresh registry
     */
    refreshRegistry() {
        console.log('\n=== REFRESHING REGISTRY ===\n');

        if (ItemRegistry) {
            // Refresh ITEMS_DB
            if (typeof window !== 'undefined') {
                window.ITEMS_DB = ItemRegistry.getAllActive();
            }

            const stats = ItemRegistry.getStatistics();
            console.log(`Registry refreshed: ${stats.totalActive} active items`);

            this.showSuccess(`Registry refreshed - ${stats.totalActive} items active`);
        } else {
            this.showError('ItemRegistry not loaded');
        }

        // Refresh the UI
        if (typeof DeveloperUI !== 'undefined') {
            DeveloperUI.updateItemManagement();
        }
    },

    /**
     * Print summary to console
     */
    printSummary() {
        console.log('\n');
        if (ItemRegistry) {
            ItemRegistry.printSummary();
        }
        if (ItemUtils) {
            ItemUtils.printSummary();
        }

        this.showSuccess('Summary printed to console');
    },

    /**
     * View item details
     */
    viewItemDetails(itemId) {
        console.log(`\n=== ITEM DETAILS: ${itemId} ===\n`);

        if (!ItemUtils) {
            this.showError('ItemUtils not loaded');
            return;
        }

        const item = ItemUtils.getItem(itemId);
        if (!item) {
            this.showError(`Item ${itemId} not found`);
            return;
        }

        console.log(item);

        const rarityColor = this.getRarityColor(item.rarity);

        let html = `
            <div style="background: rgba(0,0,0,0.5); border: 2px solid ${rarityColor}; border-radius: 8px; padding: 20px;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div style="font-size: 3em;">${item.icon || '❓'}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 1.5em; font-weight: bold; color: ${rarityColor};">${item.name}</div>
                        <div style="font-size: 0.9em; color: #888;">${item.id}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div>
                        <div style="color: #888; font-size: 0.85em;">Category</div>
                        <div style="font-weight: bold;">${item.category}</div>
                    </div>
                    <div>
                        <div style="color: #888; font-size: 0.85em;">Rarity</div>
                        <div style="font-weight: bold; color: ${rarityColor};">${item.rarity || 'common'}</div>
                    </div>
                    <div>
                        <div style="color: #888; font-size: 0.85em;">Level</div>
                        <div style="font-weight: bold;">${item.level || 'N/A'}</div>
                    </div>
                    <div>
                        <div style="color: #888; font-size: 0.85em;">Value</div>
                        <div style="font-weight: bold;">${item.value || 0} gold</div>
                    </div>
                    <div>
                        <div style="color: #888; font-size: 0.85em;">Stack Limit</div>
                        <div style="font-weight: bold;">${item.stackLimit || 1}</div>
                    </div>
                    ${item.tier ? `
                        <div>
                            <div style="color: #888; font-size: 0.85em;">Tier</div>
                            <div style="font-weight: bold;">${item.tier}</div>
                        </div>
                    ` : ''}
                </div>

                <div style="margin-bottom: 15px;">
                    <div style="color: #888; font-size: 0.85em; margin-bottom: 5px;">Description</div>
                    <div style="padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        ${item.description || 'No description'}
                    </div>
                </div>

                ${item.tags && item.tags.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                        <div style="color: #888; font-size: 0.85em; margin-bottom: 5px;">Tags</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${item.tags.map(tag => `
                                <span style="padding: 4px 8px; background: rgba(74, 158, 255, 0.2); border-radius: 4px; font-size: 0.85em;">
                                    ${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${item.combatStats ? `
                    <div style="margin-bottom: 15px;">
                        <div style="color: #888; font-size: 0.85em; margin-bottom: 5px;">Combat Stats</div>
                        <div style="padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px; font-size: 0.9em;">
                            <pre style="margin: 0; color: #ddd;">${JSON.stringify(item.combatStats, null, 2)}</pre>
                        </div>
                    </div>
                ` : ''}

                ${item._legacy ? `
                    <div style="padding: 10px; background: rgba(233, 30, 99, 0.1); border: 1px solid #e91e63; border-radius: 4px; margin-top: 15px;">
                        <strong style="color: #e91e63;">⚠️ Legacy Item</strong> - Migrated from definitions.js
                        ${item._originalFormat ? `<br><span style="font-size: 0.85em; color: #aaa;">Original format: ${item._originalFormat}</span>` : ''}
                    </div>
                ` : ''}

                <div style="margin-top: 20px;">
                    <button onclick="console.log(ItemUtils.getItem('${itemId}'))"
                            style="padding: 10px 20px; background: #4a9eff; border: 1px solid #2980b9; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; margin-right: 10px;">
                        Log to Console
                    </button>
                    <button onclick="DevItemTools.showResults('')"
                            style="padding: 10px 20px; background: #607d8b; border: 1px solid #455a64; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;

        this.showResults(html);
    },

    /**
     * Get rarity color
     */
    getRarityColor(rarity) {
        const colors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800',
            mythic: '#f44336',
        };
        return colors[rarity] || colors.common;
    },

    /**
     * Show results in UI
     */
    showResults(html) {
        const container = document.getElementById('itemManagementResults');
        const content = document.getElementById('itemManagementResultsContent');

        if (container && content) {
            content.innerHTML = html;
            container.style.display = html ? 'block' : 'none';
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        this.showResults(`
            <div style="padding: 20px; background: rgba(244, 67, 54, 0.1); border: 1px solid #f44336; border-radius: 4px; color: #f44336; text-align: center;">
                ❌ ${message}
            </div>
        `);
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        console.log(`✅ ${message}`);
        this.showResults(`
            <div style="padding: 20px; background: rgba(76, 175, 80, 0.1); border: 1px solid #4caf50; border-radius: 4px; color: #4caf50; text-align: center;">
                ✅ ${message}
            </div>
        `);
    },
};
