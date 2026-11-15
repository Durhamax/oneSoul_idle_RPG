/**
 * ACTIVE ACTION RIBBON
 *
 * A thin, global, persistent strip that shows the ONE action currently running
 * — gathering, crafting, or combat — whenever you are NOT on that action's own
 * screen. Because the game enforces a single active activity at a time, this one
 * ribbon can always represent "what's happening" unambiguously.
 *
 * Lives in the shell chrome, docked just above the character level bar. It mirrors
 * the levelbar's visual language: an icon, a thin progress fill, and (for gathering)
 * a slim target-health line. Tap to deep-link straight into that activity's view.
 * Collapses to nothing when idle, or when you're already on the active view.
 *
 * It is self-correcting: a light interval re-reads game state, rebuilds the DOM
 * only when the active action's identity changes, and otherwise just nudges the
 * fill widths — so it needs no event wiring to stay accurate.
 */

const ActiveActionRibbon = {
    el: null,
    _timer: null,
    _signature: null, // identity of the current action; rebuild DOM only when it changes

    SKILL_ICONS: {
        mining: '⛏️', logging: '🪓', fishing: '🎣',
        hunting: '🏹', foraging: '🌿', thieving: '🎭'
    },

    SKILL_LABELS: {
        mining: 'Mining', logging: 'Logging', fishing: 'Fishing',
        hunting: 'Hunting', foraging: 'Foraging', thieving: 'Thieving'
    },

    init() {
        this.el = document.getElementById('activeActionRibbon');
        if (!this.el) {
            console.warn('[ActiveActionRibbon] host element #activeActionRibbon not found');
            return;
        }

        // Tap → deep-link into the active action's view.
        this.el.addEventListener('click', () => {
            const a = this._lastActive;
            if (a && typeof UICore !== 'undefined' && UICore.switchView) {
                UICore.switchView(a.view);
            }
        });

        // Light poll: cheap, self-correcting, no event plumbing required.
        this._timer = setInterval(() => this.refresh(), 100);
        this.refresh();
        console.log('✅ ActiveActionRibbon initialized');
    },

    /**
     * Inspect game state for the single active action. Returns a descriptor or null.
     * { type, view, icon, label, sub, progress(0-1), target(0-1|null), danger }
     */
    getActive() {
        if (typeof GameEngine === 'undefined' || !GameEngine.state) return null;
        const s = GameEngine.state;

        // ---- Combat: main fill = player HP (so you can watch your health off-screen) ----
        const inCombat = s.currentActivity === 'combat' || s.combat?.currentEnemy;
        if (inCombat && s.combat?.currentEnemy) {
            const maxHP = s.maxHP || s.combat.playerMaxHP || 1;
            const curHP = Math.max(0, s.currentHP ?? maxHP);
            const hpFrac = maxHP > 0 ? curHP / maxHP : 0;
            const enemy = s.combat.currentEnemy;
            return {
                type: 'combat',
                view: 'combat',
                icon: '⚔️',
                label: enemy?.name || 'In Combat',
                sub: `${Math.round(curHP)}/${Math.round(maxHP)} HP`,
                progress: hpFrac,
                target: null,
                danger: hpFrac <= 0.3
            };
        }

        // ---- Navigation: main fill = discovery interval, thin line = endurance ----
        const nav = s.activeNavigation;
        if (s.currentActivity === 'navigation' && nav?.isNavigating) {
            let progress = 0;
            if (typeof GameEngine !== 'undefined' && GameEngine.getNavigationStats) {
                const stats = GameEngine.getNavigationStats();
                const lastTick = nav.lastNavigationTick || Date.now();
                const elapsed = Date.now() - lastTick;
                progress = nav.isRecovering ? 0 : Math.min(1, elapsed / (stats.discoveryInterval || 1));
            }
            const maxE = nav.maxEndurance || 1;
            const curE = Math.max(0, nav.endurance ?? maxE);
            return {
                type: 'navigation',
                view: 'navigation',
                icon: '🧭',
                label: nav.isRecovering ? 'Resting' : 'Exploring',
                sub: `${Math.floor(curE)}/${maxE}`,
                progress,
                target: maxE > 0 ? curE / maxE : 0,
                danger: false
            };
        }

        // ---- Gathering: main fill = interval progress, thin line = node health ----
        const session = s.gatheringSession;
        if (s.currentActivity === 'gathering' && session) {
            let progress = 0;
            if (typeof GatherUI !== 'undefined') {
                const nodeDef = GatherUI.getNodeDefinition(session.nodeId);
                const toolDef = (typeof ItemRegistry !== 'undefined') ? ItemRegistry.getItem(session.toolId) : null;
                const skill = s.skills?.[session.skill];
                if (nodeDef) {
                    const interval = GatherUI.calculateActionInterval(nodeDef, toolDef, skill);
                    const elapsed = Date.now() - (session.lastActionTime || Date.now());
                    progress = session.isRecovering ? 0 : Math.min(1, elapsed / interval);
                }
            }
            const maxH = session.maxNodeHealth !== undefined ? session.maxNodeHealth : 10;
            const curH = session.nodeHealth !== undefined ? session.nodeHealth : maxH;
            return {
                type: 'gathering',
                view: 'gather',
                icon: this.SKILL_ICONS[session.skill] || '🌿',
                label: this._nodeName(session),
                sub: session.isRecovering ? 'Resting' : (this.SKILL_LABELS[session.skill] || 'Gathering'),
                progress,
                target: maxH > 0 ? Math.max(0, curH / maxH) : 0,
                danger: false
            };
        }

        // ---- Crafting: main fill = craft progress ----
        const craft = this._activeCraft(s);
        if (craft) {
            const now = Date.now();
            const total = craft.totalTime || (craft.completionTime - craft.startTime) || 1;
            const progress = Math.min(1, (now - craft.startTime) / total);
            const recipe = this._recipeDef(craft.recipeId);
            return {
                type: 'crafting',
                view: 'crafting',
                icon: recipe?.icon || '🔨',
                label: recipe?.name || 'Crafting',
                sub: craft.quantity > 1 ? `x${craft.quantity}` : 'Crafting',
                progress,
                target: null,
                danger: false
            };
        }

        return null;
    },

    refresh() {
        if (!this.el) return;
        const active = this.getActive();
        this._lastActive = active;

        const onOwnView = active && typeof UICore !== 'undefined' && UICore.currentView === active.view;
        const show = !!active && !onOwnView;

        if (!show) {
            if (this._signature !== null) {
                this._signature = null;
                this.el.classList.remove('is-active');
                this.el.innerHTML = '';
                document.body.classList.remove('has-action-ribbon');
            }
            return;
        }

        // Rebuild DOM only when the action's identity changes; otherwise just move fills.
        const sig = `${active.type}:${active.label}:${active.target !== null}`;
        if (sig !== this._signature) {
            this._signature = sig;
            this.el.classList.add('is-active');
            document.body.classList.add('has-action-ribbon');
            this.el.innerHTML = `
                <span class="ar-icon">${active.icon}</span>
                <div class="ar-body">
                    <div class="ar-row">
                        <span class="ar-label">${active.label}</span>
                        <span class="ar-sub">${active.sub || ''}</span>
                    </div>
                    <div class="ar-track"><div class="ar-fill"></div></div>
                    ${active.target !== null ? `<div class="ar-track ar-track-thin"><div class="ar-fill2"></div></div>` : ''}
                </div>
                <span class="ar-go">›</span>
            `;
        } else {
            // Keep the sub text fresh (HP / quantity) without a full rebuild.
            const subEl = this.el.querySelector('.ar-sub');
            if (subEl) subEl.textContent = active.sub || '';
        }

        this.el.classList.toggle('ar-type-combat', active.type === 'combat');
        this.el.classList.toggle('is-danger', !!active.danger);

        const fill = this.el.querySelector('.ar-fill');
        if (fill) fill.style.width = `${Math.round((active.progress || 0) * 100)}%`;
        const fill2 = this.el.querySelector('.ar-fill2');
        if (fill2 && active.target !== null) fill2.style.width = `${Math.round(active.target * 100)}%`;
    },

    // ---- helpers ----
    _nodeName(session) {
        if (typeof GatherUI !== 'undefined') {
            const def = GatherUI.getNodeDefinition(session.nodeId);
            if (def?.name) return def.name;
        }
        return session.nodeName || 'Gathering';
    },

    _activeCraft(s) {
        const queues = s.crafting?.activeQueues;
        if (queues) {
            for (const skill in queues) {
                const q = queues[skill];
                if (Array.isArray(q) && q.length > 0 && q[0]?.startTime) return q[0];
            }
        }
        if (Array.isArray(s.crafting?.activeCrafts) && s.crafting.activeCrafts.length > 0) {
            return s.crafting.activeCrafts[0];
        }
        return null;
    },

    _recipeDef(recipeId) {
        if (!recipeId) return null;
        if (typeof RecipeRegistry !== 'undefined' && RecipeRegistry.get) {
            return RecipeRegistry.get(recipeId);
        }
        return GameEngine.definitions?.recipes?.[recipeId] || null;
    }
};

if (typeof window !== 'undefined') {
    window.ActiveActionRibbon = ActiveActionRibbon;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ActiveActionRibbon.init());
    } else {
        ActiveActionRibbon.init();
    }
}

console.log('✅ ActiveActionRibbon component loaded');
