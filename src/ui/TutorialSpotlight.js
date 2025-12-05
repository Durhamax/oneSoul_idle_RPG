/**
 * TutorialSpotlight - Visual guidance system for tutorials
 *
 * Two-phase approach for tab visits:
 * Phase 1: Glowing border on tab button, tooltip says "Click the X tab"
 * Phase 2: No spotlight, tooltip shows explanation with "Next" button
 *
 * Tooltip always stays on left side near the sidebar.
 */
const TutorialSpotlight = {
    isActive: false,
    currentMissionId: null,
    currentObjective: null,
    currentStep: 0,
    totalSteps: 0,

    // Phase tracking: 'click' or 'explain'
    currentPhase: 'click',

    // DOM elements
    spotlightElement: null,
    tooltipElement: null,
    pulseRingElement: null,

    // Selector mappings
    targetSelectors: {
        'visit_overview': '[data-view="overview"]',
        'visit_bank': '[data-view="bank"]',
        'visit_equipment': '[data-view="equipment"]',
        'visit_combat': '[data-view="combat"]',
        'visit_navigation': '[data-view="navigation"]',
        'visit_gather': '[data-view="gather"]',
        'visit_crafting': '[data-view="crafting"]',
        'visit_missions': '[data-view="missions"]',
        'visit_perks': '[data-view="perks"]',
        'return_to_missions': '[data-view="missions"]',
        'return_to_missions_102': '[data-view="missions"]',
        'return_to_missions_103': '[data-view="missions"]',
        'return_to_missions_104': '[data-view="missions"]',
        'return_to_missions_105': '[data-view="missions"]',
        'return_to_missions_106': '[data-view="missions"]',
        'equip_armor': { view: 'equipment', element: '.equipment-slot[data-slot="chest"], .armor-set-slot' },
    },

    init() {
        this.createElements();
        this.setupEventListeners();
        console.log('✅ TutorialSpotlight initialized');
    },

    createElements() {
        if (document.getElementById('tutorial-spotlight')) return;

        // Spotlight (glowing border around target)
        const spotlight = document.createElement('div');
        spotlight.id = 'tutorial-spotlight';
        spotlight.className = 'tutorial-spotlight hidden';

        // Pulse ring
        const pulseRing = document.createElement('div');
        pulseRing.id = 'tutorial-pulse-ring';
        pulseRing.className = 'tutorial-pulse-ring hidden';

        // Tooltip - positioned on left side
        const tooltip = document.createElement('div');
        tooltip.id = 'tutorial-tooltip';
        tooltip.className = 'tutorial-tooltip hidden';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <span class="tooltip-step">Step 1/7</span>
                    <button class="tooltip-skip" data-action="skip-tutorial-spotlight">Skip Tour</button>
                </div>
                <h3 class="tooltip-title"></h3>
                <p class="tooltip-body"></p>
                <div class="tooltip-hint">
                    <span class="hint-icon">👆</span>
                    <span class="hint-text"></span>
                </div>
                <div class="tooltip-actions">
                    <button class="tooltip-next-btn" id="tutorial-next-btn" type="button">Next →</button>
                </div>
            </div>
        `;

        document.body.appendChild(spotlight);
        document.body.appendChild(pulseRing);
        document.body.appendChild(tooltip);

        this.spotlightElement = spotlight;
        this.pulseRingElement = pulseRing;
        this.tooltipElement = tooltip;

        // Attach click handler directly to the Next button
        const nextBtn = tooltip.querySelector('#tutorial-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔦 Direct Next button click handler fired');
                this.onNextClicked();
            });
        }
    },

    setupEventListeners() {
        // Mission lifecycle
        EventBus.on('mission:started', (data) => this.onMissionStarted(data));
        EventBus.on('mission-started', (data) => this.onMissionStarted(data));
        EventBus.on('mission:completed', (data) => this.onMissionCompleted(data));
        EventBus.on('mission-completed', (data) => this.onMissionCompleted(data));
        EventBus.on('mission:abandoned', (data) => this.onMissionAbandoned(data));
        EventBus.on('mission-abandoned', (data) => this.onMissionAbandoned(data));

        // Tab/view change - triggers phase 2
        EventBus.on('tab-visited', (data) => this.onTabVisited(data));
        EventBus.on('view-changed', (data) => this.onTabVisited(data));

        // Reposition on resize
        window.addEventListener('resize', () => {
            if (this.isActive) {
                this.updatePositions();
            }
        });

        // Next button click - bind to this explicitly
        const self = this;
        document.addEventListener('click', function(e) {
            const nextBtn = e.target.closest('.tooltip-next-btn');
            if (nextBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔦 Next button clicked, isActive:', self.isActive);
                self.onNextClicked();
                return;
            }

            const skipBtn = e.target.closest('[data-action="skip-tutorial-spotlight"]');
            if (skipBtn) {
                e.preventDefault();
                e.stopPropagation();
                self.deactivate();
                return;
            }
        }, true); // Use capture phase to ensure we get the event first
    },

    onMissionStarted(data) {
        const { missionId, mission } = data;

        const isTutorial = mission?.metadata?.flags?.isTutorial;
        const isUITour = mission?.metadata?.flags?.isUITour;
        const hasSpotlight = mission?.metadata?.flags?.useSpotlight;

        if (isTutorial || isUITour || hasSpotlight) {
            this.currentMissionId = missionId;
            this.isActive = true;

            const visitObjectives = mission.objectives?.filter(o =>
                o.type === 'visitTab' || o.type === 'equip' || o.useSpotlight
            ) || [];
            this.totalSteps = visitObjectives.length;
            this.currentStep = 0;

            setTimeout(() => this.showNextObjective(), 300);
            console.log(`🔦 Tutorial spotlight activated for ${missionId}`);
        }
    },

    onMissionCompleted(data) {
        if (data.missionId === this.currentMissionId) {
            this.deactivate();
            console.log('🔦 Tutorial complete');
        }
    },

    onMissionAbandoned(data) {
        if (data.missionId === this.currentMissionId) {
            this.deactivate();
        }
    },

    onTabVisited(data) {
        if (!this.isActive || !this.currentObjective) return;
        if (this.currentObjective.type !== 'visitTab') return;
        if (this.currentPhase !== 'click') return;

        const expectedTab = this.currentObjective.tab;
        const visitedTab = data.tab || data.view;

        if (visitedTab === expectedTab) {
            console.log(`🔦 Tab visited: ${visitedTab}, moving to explain phase`);
            this.currentPhase = 'explain';
            this.showExplainPhase();
        }
    },

    onNextClicked() {
        if (!this.isActive) return;

        console.log(`🔦 Processing Next click, phase: ${this.currentPhase}`);

        // Complete current objective
        this.completeCurrentObjective();

        // Move to next
        this.currentStep++;
        this.currentPhase = 'click';

        setTimeout(() => this.showNextObjective(), 300);
    },

    completeCurrentObjective() {
        if (!this.currentObjective || !this.currentMissionId) return;

        const objectiveId = this.currentObjective.id;
        const progress = GameEngine.state.missions?.activeProgress?.[this.currentMissionId];

        if (progress && progress.objectives[objectiveId]) {
            const obj = progress.objectives[objectiveId];

            // Safety check: Don't complete turn-in objectives if others aren't done
            const isTurnIn = this.currentObjective.isTurnIn || obj.isTurnIn ||
                objectiveId.startsWith('return_to_') || objectiveId.includes('turn_in');

            if (isTurnIn) {
                const allOthersComplete = Object.entries(progress.objectives)
                    .filter(([id, o]) => id !== objectiveId && !o.optional)
                    .every(([id, o]) => o.completed);

                if (!allOthersComplete) {
                    console.log(`🔦 Cannot complete turn-in objective ${objectiveId} - other objectives not complete`);
                    return;
                }
            }

            obj.current = obj.required;
            obj.completed = true;  // Mark as completed to prevent re-triggering
            console.log(`🔦 Objective completed: ${objectiveId}`);

            // Emit objective completed event for MissionSystem to handle
            EventBus.emit('mission:objectiveCompleted', {
                missionId: this.currentMissionId,
                objectiveId: objectiveId,
                objective: this.currentObjective
            });
        }
    },

    showNextObjective() {
        if (!this.isActive || !this.currentMissionId) {
            this.hide();
            return;
        }

        const mission = typeof MissionRegistry !== 'undefined' ? MissionRegistry.get(this.currentMissionId) : null;
        if (!mission) {
            this.hide();
            return;
        }

        const progress = GameEngine.state.missions?.activeProgress?.[this.currentMissionId];
        if (!progress) {
            this.hide();
            return;
        }

        // Find next incomplete objective
        const nextObjective = mission.objectives.find(obj => {
            const objProgress = progress.objectives[obj.id];
            // Check both current < required AND not already marked completed
            const isIncomplete = objProgress && !objProgress.completed && objProgress.current < objProgress.required;
            const usesSpotlight = obj.type === 'visitTab' || obj.type === 'equip' || obj.useSpotlight;

            if (!isIncomplete || !usesSpotlight) return false;

            // Skip turn-in objectives until all other objectives are complete
            const isTurnIn = obj.isTurnIn || objProgress?.isTurnIn ||
                obj.id?.startsWith('return_to_') || obj.id?.includes('turn_in');

            if (isTurnIn) {
                const allOthersComplete = Object.entries(progress.objectives)
                    .filter(([id, o]) => id !== obj.id && !o.optional)
                    .every(([id, o]) => o.completed);

                if (!allOthersComplete) {
                    console.log(`🔦 Skipping turn-in objective ${obj.id} - other objectives not complete`);
                    return false;
                }
            }

            return true;
        });

        if (nextObjective) {
            this.currentObjective = nextObjective;
            this.currentPhase = 'click';
            this.showClickPhase(nextObjective, mission);
        } else {
            console.log('🔦 No more objectives');
            this.hide();
        }
    },

    showClickPhase(objective, mission) {
        const selector = this.targetSelectors[objective.id];
        if (!selector) {
            console.warn(`[TutorialSpotlight] No selector for: ${objective.id}`);
            return;
        }

        const targetSelector = typeof selector === 'string' ? selector : selector.element;
        const targetElement = document.querySelector(targetSelector);

        if (!targetElement) {
            console.warn(`[TutorialSpotlight] Element not found: ${targetSelector}`);
            return;
        }

        // Position spotlight on target
        this.positionSpotlight(targetElement);

        // Update tooltip content for click phase
        const content = objective.tourContent || {};
        const tabName = content.title || objective.tab || 'this tab';
        const stepIndex = this.getStepIndex(objective, mission);

        this.updateTooltip({
            step: `Step ${stepIndex + 1}/${this.totalSteps}`,
            title: tabName,
            body: `Click the ${tabName} tab to continue.`,
            hint: content.hint || `Click the ${tabName} tab`,
            showHint: true,
            showNext: false
        });

        // Position tooltip on left side, below the target
        this.positionTooltipLeftSide(targetElement);

        this.showSpotlight();
        this.showTooltip();
    },

    showExplainPhase() {
        const objective = this.currentObjective;
        const mission = typeof MissionRegistry !== 'undefined' ? MissionRegistry.get(this.currentMissionId) : null;

        if (!objective || !mission) return;

        // Hide spotlight
        this.hideSpotlight();

        // Update tooltip for explain phase
        const content = objective.tourContent || {};
        const stepIndex = this.getStepIndex(objective, mission);

        this.updateTooltip({
            step: `Step ${stepIndex + 1}/${this.totalSteps}`,
            title: content.title || objective.description || 'This View',
            body: content.body || 'Explore this area of the game.',
            hint: '',
            showHint: false,
            showNext: true
        });

        // Keep tooltip on left side
        this.positionTooltipLeftSideFixed();
        this.showTooltip();
    },

    getStepIndex(objective, mission) {
        const spotlightObjectives = mission.objectives.filter(o =>
            o.type === 'visitTab' || o.type === 'equip' || o.useSpotlight
        );
        return spotlightObjectives.findIndex(o => o.id === objective.id);
    },

    updateTooltip({ step, title, body, hint, showHint, showNext }) {
        if (!this.tooltipElement) return;

        const stepEl = this.tooltipElement.querySelector('.tooltip-step');
        const titleEl = this.tooltipElement.querySelector('.tooltip-title');
        const bodyEl = this.tooltipElement.querySelector('.tooltip-body');
        const hintEl = this.tooltipElement.querySelector('.tooltip-hint');
        const hintText = this.tooltipElement.querySelector('.hint-text');
        const actionsEl = this.tooltipElement.querySelector('.tooltip-actions');

        if (stepEl) stepEl.textContent = step;
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.textContent = body;
        if (hintText) hintText.textContent = hint;

        if (hintEl) {
            hintEl.style.display = showHint ? 'flex' : 'none';
        }
        if (actionsEl) {
            actionsEl.style.display = showNext ? 'flex' : 'none';
        }
    },

    positionSpotlight(targetElement) {
        if (!targetElement || !this.spotlightElement) return;

        this.clearPreviousTargets();

        const rect = targetElement.getBoundingClientRect();
        const padding = 6;

        this.spotlightElement.style.left = `${rect.left - padding}px`;
        this.spotlightElement.style.top = `${rect.top - padding}px`;
        this.spotlightElement.style.width = `${rect.width + padding * 2}px`;
        this.spotlightElement.style.height = `${rect.height + padding * 2}px`;

        if (this.pulseRingElement) {
            this.pulseRingElement.style.left = `${rect.left - padding}px`;
            this.pulseRingElement.style.top = `${rect.top - padding}px`;
            this.pulseRingElement.style.width = `${rect.width + padding * 2}px`;
            this.pulseRingElement.style.height = `${rect.height + padding * 2}px`;
        }

        targetElement.classList.add('tutorial-target');
    },

    positionTooltipLeftSide(targetElement) {
        if (!this.tooltipElement || !targetElement) return;

        const targetRect = targetElement.getBoundingClientRect();
        const tooltip = this.tooltipElement;

        // Reset styles
        tooltip.style.right = '';
        tooltip.style.transform = '';

        // Position to the right of sidebar, vertically centered with target
        const sidebarWidth = 70; // Approximate sidebar width
        const left = sidebarWidth + 20;
        const top = Math.max(targetRect.top - 20, 60);

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    },

    positionTooltipLeftSideFixed() {
        if (!this.tooltipElement) return;

        const tooltip = this.tooltipElement;

        // Reset styles
        tooltip.style.right = '';
        tooltip.style.transform = '';

        // Fixed position on left side, below header
        const sidebarWidth = 70;
        tooltip.style.left = `${sidebarWidth + 20}px`;
        tooltip.style.top = '100px';
    },

    updatePositions() {
        if (!this.currentObjective) return;

        const selector = this.targetSelectors[this.currentObjective.id];
        if (!selector) return;

        const targetSelector = typeof selector === 'string' ? selector : selector.element;
        const targetElement = document.querySelector(targetSelector);

        if (targetElement && this.currentPhase === 'click') {
            this.positionSpotlight(targetElement);
            this.positionTooltipLeftSide(targetElement);
        }
    },

    showSpotlight() {
        if (this.spotlightElement) {
            this.spotlightElement.classList.remove('hidden');
            this.spotlightElement.style.display = '';
        }
        if (this.pulseRingElement) {
            this.pulseRingElement.classList.remove('hidden');
            this.pulseRingElement.style.display = '';
        }
    },

    hideSpotlight() {
        if (this.spotlightElement) {
            this.spotlightElement.classList.add('hidden');
        }
        if (this.pulseRingElement) {
            this.pulseRingElement.classList.add('hidden');
        }
    },

    showTooltip() {
        if (this.tooltipElement) this.tooltipElement.classList.remove('hidden');
    },

    hideTooltip() {
        if (this.tooltipElement) this.tooltipElement.classList.add('hidden');
    },

    hide() {
        this.hideSpotlight();
        this.hideTooltip();
        this.clearPreviousTargets();
    },

    clearPreviousTargets() {
        document.querySelectorAll('.tutorial-target').forEach(el => {
            el.classList.remove('tutorial-target');
        });
    },

    deactivate() {
        this.isActive = false;
        this.currentMissionId = null;
        this.currentObjective = null;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.currentPhase = 'click';

        // Explicitly hide all visual elements
        this.hideSpotlight();
        this.hideTooltip();
        this.clearPreviousTargets();

        // Extra cleanup - ensure elements are fully hidden
        if (this.spotlightElement) {
            this.spotlightElement.classList.add('hidden');
            this.spotlightElement.style.display = 'none';
        }
        if (this.pulseRingElement) {
            this.pulseRingElement.classList.add('hidden');
            this.pulseRingElement.style.display = 'none';
        }
        if (this.tooltipElement) {
            this.tooltipElement.classList.add('hidden');
        }

        console.log('🔦 Tutorial spotlight deactivated');
    },

    activate(missionId) {
        const mission = typeof MissionRegistry !== 'undefined' ? MissionRegistry.get(missionId) : null;
        if (mission) {
            this.onMissionStarted({ missionId, mission });
        }
    }
};

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TutorialSpotlight.init());
    } else {
        TutorialSpotlight.init();
    }
}

if (typeof window !== 'undefined') {
    window.TutorialSpotlight = TutorialSpotlight;
}
