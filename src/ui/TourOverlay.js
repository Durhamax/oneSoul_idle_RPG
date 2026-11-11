/**
 * TOUR OVERLAY SYSTEM (DEPRECATED)
 *
 * This system is disabled - TutorialSpotlight.js now handles all tutorial UI.
 * Kept for backwards compatibility but does not activate.
 */

const TourOverlay = {
    isActive: false,
    currentMissionId: null,

    /**
     * Initialize - disabled, TutorialSpotlight handles tours now
     */
    init() {
        // DISABLED - TutorialSpotlight.js handles all tutorial UI
        console.log('⏭️ TourOverlay disabled (using TutorialSpotlight instead)');
    },

    /**
     * Subscribe to relevant EventBus events
     */
    _subscribeToEvents() {
        if (typeof EventBus === 'undefined') {
            console.warn('⚠️ EventBus not available for TourOverlay');
            return;
        }

        EventBus.on('tab-visited', (data) => this.onTabVisited(data));
        EventBus.on('mission:started', (data) => this.onMissionStarted(data));
        EventBus.on('mission:completed', (data) => this.onMissionCompleted(data));
        EventBus.on('mission:abandoned', (data) => this.onMissionAbandoned(data));
    },

    /**
     * Create the overlay DOM element
     */
    createOverlayElement() {
        if (document.getElementById('tour-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'tour-overlay';
        overlay.className = 'tour-overlay hidden';
        overlay.innerHTML = `
            <div class="tour-content">
                <div class="tour-header">
                    <span class="tour-step">Step 1/8</span>
                    <button class="tour-close" data-action="close-tour">✕</button>
                </div>
                <h3 class="tour-title"></h3>
                <p class="tour-body"></p>
                <div class="tour-footer">
                    <button class="tour-continue" data-action="continue-tour">Got it!</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    /**
     * Handle mission started event
     */
    onMissionStarted(data) {
        const { missionId, mission } = data;

        // Check if this mission has the UI tour flag
        const isUITour = mission?.metadata?.flags?.isUITour;

        if (isUITour) {
            this.isActive = true;
            this.currentMissionId = missionId;
            console.log('🎯 UI Tour activated for', missionId);
        }
    },

    /**
     * Handle mission completed event
     */
    onMissionCompleted(data) {
        if (data.missionId === this.currentMissionId) {
            this.isActive = false;
            this.currentMissionId = null;
            this.hide();
            console.log('🎯 UI Tour completed');
        }
    },

    /**
     * Handle mission abandoned event
     */
    onMissionAbandoned(data) {
        if (data.missionId === this.currentMissionId) {
            this.isActive = false;
            this.currentMissionId = null;
            this.hide();
            console.log('🎯 UI Tour abandoned');
        }
    },

    /**
     * Handle tab visited event
     */
    onTabVisited(data) {
        if (!this.isActive || !this.currentMissionId) return;

        const { tab } = data;

        // Get mission definition
        let mission = null;
        if (typeof MissionRegistry !== 'undefined') {
            mission = MissionRegistry.get(this.currentMissionId);
        }
        if (!mission && typeof GameEngine !== 'undefined') {
            mission = GameEngine.definitions?.missions?.[this.currentMissionId];
        }

        if (!mission) return;

        // Find the objective for this tab
        const objective = mission.objectives?.find(obj =>
            obj.type === 'visitTab' && obj.tab === tab
        );

        if (objective?.tourContent) {
            const stepInfo = this.getStepInfo(mission, objective);
            this.show(objective.tourContent, stepInfo);
        }
    },

    /**
     * Get step info for display
     */
    getStepInfo(mission, currentObjective) {
        const visitTabObjectives = mission.objectives?.filter(o => o.type === 'visitTab') || [];
        const totalSteps = visitTabObjectives.length;
        const currentStep = visitTabObjectives.findIndex(o => o.id === currentObjective.id) + 1;
        return { current: currentStep, total: totalSteps };
    },

    /**
     * Show the tour overlay with content
     */
    show(content, stepInfo) {
        const overlay = document.getElementById('tour-overlay');
        if (!overlay) return;

        overlay.querySelector('.tour-step').textContent = `Step ${stepInfo.current}/${stepInfo.total}`;
        overlay.querySelector('.tour-title').textContent = content.title || 'Tutorial';
        overlay.querySelector('.tour-body').textContent = content.body || '';

        overlay.classList.remove('hidden');
    },

    /**
     * Hide the tour overlay
     */
    hide() {
        const overlay = document.getElementById('tour-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    /**
     * Check if tour is currently active
     */
    isRunning() {
        return this.isActive && this.currentMissionId !== null;
    }
};

// Browser global access
if (typeof window !== 'undefined') {
    window.TourOverlay = TourOverlay;
}
