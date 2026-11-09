/**
 * CRAFT QUEUE COMPONENT
 *
 * Persistent sidebar showing session output (total crafted items).
 * Similar to GatherUI's Session Loot sidebar.
 * Always visible in the Recipes tab.
 */

const CraftQueue = {
    /**
     * Render the queue sidebar (now shows session output like GatherUI)
     */
    render() {
        const sessionOutputs = GameEngine.state.crafting?.sessionStats?.outputs || {};
        const hasOutputs = Object.keys(sessionOutputs).length > 0;

        return `
            <div class="craft-queue-sidebar">
                <div class="queue-header">
                    <h3>📦 Session Output</h3>
                </div>
                <div id="queue-content" class="queue-content">
                    ${this.renderSessionOutput()}
                </div>
            </div>
        `;
    },

    /**
     * Render session output (total crafted items)
     */
    renderSessionOutput() {
        const sessionOutputs = GameEngine.state.crafting?.sessionStats?.outputs || {};

        if (Object.keys(sessionOutputs).length === 0) {
            return `
                <div class="queue-empty">
                    <div class="empty-icon">📦</div>
                    <div class="empty-text">No items crafted</div>
                    <div class="empty-hint">Start crafting to track output</div>
                </div>
            `;
        }

        let html = '<div class="session-output-list">';

        for (const [itemId, qty] of Object.entries(sessionOutputs)) {
            const itemDef = typeof ItemRegistry !== 'undefined' ? ItemRegistry.getItem(itemId) : null;
            const iconHtml = (typeof IconHelper !== 'undefined' && itemDef)
                ? IconHelper.getItemIconHTML(itemDef, { size: 24 })
                : (itemDef?.icon || '📦');

            html += `
                <div class="output-item">
                    <span class="output-icon">${iconHtml}</span>
                    <span class="output-name">${itemDef?.name || itemId}</span>
                    <span class="output-qty">+${qty}</span>
                </div>
            `;
        }

        html += '</div>';
        return html;
    },

    /**
     * Legacy: Render queue content for backward compatibility
     */
    renderQueueContent() {
        return this.renderSessionOutput();
    },

    /**
     * Render a single queue item
     */
    renderQueueItem(craft, skill, index) {
        // Get recipe definition
        let recipe = null;
        if (typeof RecipeRegistry !== 'undefined') {
            // RecipeRegistry.get() only takes recipeId, not skill
            recipe = RecipeRegistry.get(craft.recipeId);
        }
        if (!recipe) {
            recipe = GameEngine.definitions?.recipes?.[craft.recipeId] || { name: craft.recipeId, icon: '📦' };
        }

        const now = Date.now();
        const elapsed = now - craft.startTime;
        const totalTime = craft.completionTime - craft.startTime;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        const remaining = Math.max(0, Math.ceil((craft.completionTime - now) / 1000));

        // Format remaining time
        let timeDisplay;
        if (remaining >= 60) {
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            timeDisplay = `${mins}m ${secs}s`;
        } else {
            timeDisplay = `${remaining}s`;
        }

        return `
            <div class="queue-item" data-craft-index="${index}" data-skill="${skill || 'legacy'}">
                <div class="queue-item-header">
                    <span class="queue-item-icon">${recipe.icon || '📦'}</span>
                    <span class="queue-item-name">${recipe.name}</span>
                    <span class="queue-item-time">${timeDisplay}</span>
                </div>
                <div class="queue-progress">
                    <div class="queue-progress-fill" style="width: ${progress}%;"></div>
                </div>
                <button class="queue-cancel-btn" onclick="CraftQueue.cancelCraft('${skill}', ${index})" title="Cancel">
                    ✕
                </button>
            </div>
        `;
    },

    /**
     * Update queue display (called every tick)
     */
    update() {
        const container = document.getElementById('queue-content');
        if (!container) return;

        container.innerHTML = this.renderQueueContent();
    },

    /**
     * Cancel a craft
     */
    cancelCraft(skill, index) {
        console.log(`[CraftQueue] Canceling craft: skill=${skill}, index=${index}`);

        if (skill && skill !== 'legacy') {
            // Cancel from skill queue
            if (typeof CraftingSystem !== 'undefined' && CraftingSystem.cancelCraft) {
                CraftingSystem.cancelCraft(skill, index);
            }
        } else {
            // Cancel from legacy queue
            const crafts = GameEngine.state.crafting?.activeCrafts;
            if (crafts && crafts[index]) {
                crafts.splice(index, 1);
            }
        }

        // Update display
        this.update();

        // Also refresh recipes tab if visible
        if (UnifiedCraftingUI.currentTab === 'recipes') {
            UnifiedCraftingUI.renderCurrentTab();
        }
    },

    /**
     * Get total active crafts across all skills
     */
    getTotalActive() {
        const queues = GameEngine.state.crafting?.activeQueues || {};
        const legacyCrafts = GameEngine.state.crafting?.activeCrafts || [];

        let total = legacyCrafts.length;
        for (const skill in queues) {
            total += queues[skill]?.length || 0;
        }
        return total;
    },

    /**
     * Stop all crafting across all skills
     */
    stopAllCrafting() {
        console.log('[CraftQueue] Stopping all crafts');

        // Clear all skill queues
        const skills = ['smithing', 'mechanics', 'electronics', 'tailoring', 'chemistry', 'cooking'];
        for (const skill of skills) {
            if (GameEngine.state.crafting?.activeQueues?.[skill]) {
                GameEngine.state.crafting.activeQueues[skill] = [];
            }
        }

        // Clear legacy crafts
        if (GameEngine.state.crafting?.activeCrafts) {
            GameEngine.state.crafting.activeCrafts = [];
        }

        // Clear auto-repeat
        if (GameEngine.state.crafting) {
            GameEngine.state.crafting.autoRecipe = null;
        }

        // Clear current activity
        if (GameEngine.state.currentActivity === 'crafting') {
            GameEngine.state.currentActivity = null;
        }

        // Update UI
        this.update();

        // Re-render the whole crafting UI to update buttons
        if (UnifiedCraftingUI.currentTab === 'recipes') {
            UnifiedCraftingUI.renderCurrentTab();
        }

        // Re-render the sidebar to remove the Stop All button
        const sidebar = document.querySelector('.craft-queue-sidebar');
        if (sidebar) {
            sidebar.outerHTML = this.render();
        }
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.CraftQueue = CraftQueue;
}
