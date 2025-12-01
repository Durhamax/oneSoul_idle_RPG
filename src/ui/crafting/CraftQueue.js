/**
 * CRAFT QUEUE COMPONENT
 *
 * Persistent sidebar showing active crafts across ALL skills.
 * Always visible in the Recipes tab.
 * Shows progress bars, time remaining, and cancel buttons.
 */

const CraftQueue = {
    /**
     * Render the queue sidebar
     */
    render() {
        return `
            <div class="craft-queue-sidebar">
                <div class="queue-header">
                    <h3>⏳ Active Crafts</h3>
                </div>
                <div id="queue-content" class="queue-content">
                    ${this.renderQueueContent()}
                </div>
            </div>
        `;
    },

    /**
     * Render queue content (called on updates)
     */
    renderQueueContent() {
        const queues = GameEngine.state.crafting?.activeQueues || {};
        const legacyCrafts = GameEngine.state.crafting?.activeCrafts || [];

        let totalActive = 0;
        for (const skill in queues) {
            totalActive += queues[skill]?.length || 0;
        }
        totalActive += legacyCrafts.length;

        if (totalActive === 0) {
            return `
                <div class="queue-empty">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">No active crafts</div>
                    <div class="empty-hint">Select a recipe to start crafting</div>
                </div>
            `;
        }

        let html = '';

        // Render queues by skill
        const skills = ['smithing', 'mechanics', 'electronics', 'textiles', 'chemistry', 'cooking'];

        for (const skill of skills) {
            const queue = queues[skill];
            if (!queue || queue.length === 0) continue;

            const skillColor = UnifiedCraftingUI.getSkillColor(skill);

            html += `
                <div class="queue-section" style="--skill-color: ${skillColor};">
                    <div class="queue-section-header">
                        <span class="queue-skill-icon">${UnifiedCraftingUI.getSkillIcon(skill)}</span>
                        <span class="queue-skill-name">${UnifiedCraftingUI.capitalizeFirst(skill)}</span>
                        <span class="queue-skill-count">${queue.length}</span>
                    </div>
                    <div class="queue-items">
                        ${queue.map((craft, index) => this.renderQueueItem(craft, skill, index)).join('')}
                    </div>
                </div>
            `;
        }

        // Render legacy crafts (if any)
        if (legacyCrafts.length > 0) {
            html += `
                <div class="queue-section legacy">
                    <div class="queue-section-header">
                        <span class="queue-skill-icon">📦</span>
                        <span class="queue-skill-name">Legacy</span>
                        <span class="queue-skill-count">${legacyCrafts.length}</span>
                    </div>
                    <div class="queue-items">
                        ${legacyCrafts.map((craft, index) => this.renderQueueItem(craft, null, index)).join('')}
                    </div>
                </div>
            `;
        }

        return html;
    },

    /**
     * Render a single queue item
     */
    renderQueueItem(craft, skill, index) {
        // Get recipe definition
        let recipe = null;
        if (skill && typeof RecipeRegistry !== 'undefined') {
            recipe = RecipeRegistry.get(skill, craft.recipeId);
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
    }
};

// Export for use
if (typeof window !== 'undefined') {
    window.CraftQueue = CraftQueue;
}
