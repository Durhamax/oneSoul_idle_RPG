/**
 * WelcomeModal - First-time player greeting
 *
 * Shows a narrative welcome screen for new players with tutorial start option.
 * Triggered when a new player is detected (no save data).
 */
const WelcomeModal = {
    init() {
        EventBus.on('new-player-initialized', () => this.show());
        console.log('✅ WelcomeModal initialized');
    },

    show() {
        // Don't show if modal already exists
        if (document.getElementById('welcome-modal-overlay')) return;

        // Don't show if mission 101 is already completed
        if (GameEngine?.state?.missions?.completed?.includes('mission_101')) {
            console.log('⏭️ WelcomeModal skipped - mission_101 already completed');
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'welcome-modal-overlay';
        overlay.className = 'modal-overlay welcome-modal-overlay';

        overlay.innerHTML = `
            <div class="welcome-modal">
                <div class="welcome-header">
                    <div class="welcome-icon">🌅</div>
                    <h2>Welcome to Aurora Vitae</h2>
                </div>

                <div class="welcome-body">
                    <p>You awaken in <strong>The Cradle</strong>, the protected heart of Unity territory.</p>
                    <p>600 years ago, your ancestors arrived on this world aboard the colony ship <em>Exodus</em>. Now, a new chapter begins.</p>
                </div>

                <div class="welcome-npc">
                    <div class="npc-avatar">👴</div>
                    <div class="npc-dialogue">
                        <div class="npc-name">Elder Maren</div>
                        <p>"Ah, you're finally awake. Come, young one. Before you venture into the wilds, let me show you how we survive here in Unity."</p>
                    </div>
                </div>

                <div class="welcome-footer">
                    <button class="welcome-btn primary" data-action="start-tutorial">
                        Begin Your Journey
                    </button>
                    <button class="welcome-btn secondary" data-action="skip-tutorial">
                        Skip Tutorial
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    hide() {
        const overlay = document.getElementById('welcome-modal-overlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        }
    }
};

// Browser global access
if (typeof window !== 'undefined') {
    window.WelcomeModal = WelcomeModal;
}
