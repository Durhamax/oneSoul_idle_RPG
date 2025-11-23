/**
 * PERSISTENT ACTION BAR COMPONENT
 *
 * Sticky top bar showing active gathering with rich visual feedback.
 * Implements dopamine triggers: segmented health, combo multiplier, escalating effects.
 * Follows UIComponent pattern from Foundation Spec.
 */

class PersistentActionBar extends UIComponent {
    constructor() {
        super();
        this.element = null;
        this.comboCount = 0;
        this.nodeHealth = 10;
        this.maxNodeHealth = 10;
        this.isRecovering = false;
        this.recoveryProgress = 0; // 0-100% recovery progress
        this.actionProgress = 0; // 0-100% progress to next action
        this.actionStartTime = 0; // When current action interval started
        this.actionInterval = 5000; // ms per action (will be updated from game)
        this.animationFrame = null; // requestAnimationFrame ID
    }

    init() {
        this.element = this.getElement('activeGatheringDisplay');
        if (!this.element) {
            console.error('[PersistentActionBar] Could not find activeGatheringDisplay element');
            return;
        }

        // Listen for gathering events
        this.on('gathering-started', (data) => this.handleGatheringStarted(data));
        this.on('gathering-success', (data) => this.handleGatheringSuccess(data));
        this.on('gathering-miss', () => this.handleGatheringMiss());
        this.on('node-depleted', () => this.handleNodeDepleted());
        this.on('gathering-stopped', () => this.handleGatheringStopped());

        console.log('✅ PersistentActionBar initialized');
    }

    handleGatheringStarted(data) {
        const { skill, nodeId, nodeName, nodeHealth, maxHealth } = data;
        this.comboCount = 0;
        this.nodeHealth = nodeHealth || 10;
        this.maxNodeHealth = maxHealth || 10;
        this.isRecovering = false;

        // Store current node info for recovery re-render
        this.currentSkill = skill;
        this.currentNodeId = nodeId;
        this.currentNodeName = nodeName;

        // Start action interval animation
        this.actionStartTime = Date.now();
        this.startActionIntervalAnimation();

        this.render({
            active: true,
            skill,
            nodeId,
            nodeName,
            nodeHealth: this.nodeHealth,
            maxNodeHealth: this.maxNodeHealth,
            combo: this.comboCount,
            isRecovering: false
        });
    }

    handleGatheringSuccess(data) {
        const { damage, rewards, nodeHealth, maxHealth, xpGained, isCritical, isRare } = data;

        // Increment combo
        this.comboCount++;

        // Update node health from event data
        if (nodeHealth !== undefined) {
            this.nodeHealth = nodeHealth;
        } else {
            this.nodeHealth = Math.max(0, this.nodeHealth - (damage || 1));
        }

        if (maxHealth !== undefined) {
            this.maxNodeHealth = maxHealth;
        }

        // Action interval continues cycling - no need to reset
        // The animation loop handles the cycling automatically

        // Trigger success animation
        this.triggerSuccessAnimation(isCritical, isRare);

        // Show reward popup
        if (rewards && rewards.length > 0) {
            this.showRewardPopup(rewards, xpGained, isCritical, isRare);
        }

        // Re-render to update node health display
        this.updateNodeHealthBar();
    }

    handleGatheringMiss() {
        // Reset combo on miss
        this.comboCount = 0;

        // Trigger miss animation
        this.triggerMissAnimation();

        this.render({
            active: true,
            nodeHealth: this.nodeHealth,
            maxHealth: this.maxHealth,
            combo: this.comboCount
        });
    }

    handleNodeDepleted(data) {
        // Node has been depleted - enter 20-second recovery mode
        console.log('[PersistentActionBar] Node depleted, entering recovery mode');
        this.nodeHealth = 0;
        this.isRecovering = true;
        this.recoveryProgress = 0;

        // Stop action interval animation during node recovery
        this.stopActionIntervalAnimation();

        // Trigger depletion animation
        this.triggerDepletionAnimation();

        // Start node recovery animation (20 second duration)
        const recoveryDuration = 20000; // 20 seconds
        this.startRecoveryAnimation(recoveryDuration);
    }

    handleGatheringStopped() {
        this.comboCount = 0;
        this.nodeHealth = 10;
        this.maxNodeHealth = 10;
        this.isRecovering = false;

        // Stop all animations
        this.stopActionIntervalAnimation();
        this.stopRecoveryAnimation();

        this.render({
            active: false
        });
    }

    startActionIntervalAnimation() {
        // Stop any existing animation
        this.stopActionIntervalAnimation();

        // Start cycling animation loop (0% → 100% → 0% → 100%...)
        const animate = () => {
            const now = Date.now();
            const elapsed = now - this.actionStartTime;

            // Calculate progress as percentage within current cycle
            // Uses modulo to create repeating cycles
            this.actionProgress = ((elapsed % this.actionInterval) / this.actionInterval) * 100;

            // Update moving highlight position
            const highlight = document.querySelector('.interval-highlight');
            if (highlight) {
                highlight.style.left = `${this.actionProgress}%`;
            }

            // Continue animation loop
            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    stopActionIntervalAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.actionProgress = 0;
    }

    startRecoveryAnimation(recoveryDuration = 30000) {
        // Stop any existing recovery animation
        this.stopRecoveryAnimation();

        const recoveryStartTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - recoveryStartTime;

            this.recoveryProgress = Math.min(100, (elapsed / recoveryDuration) * 100);

            // Update moving highlight position during recovery
            const highlight = document.querySelector('.interval-highlight');
            if (highlight) {
                highlight.style.left = `${this.recoveryProgress}%`;

                // Transition color from red → yellow → green based on progress
                const color = this.getRecoveryColor(this.recoveryProgress);
                highlight.style.background = `linear-gradient(90deg,
                    transparent,
                    ${color.bright},
                    transparent)`;
            }

            // Update notches to show recovery filling
            this.updateRecoveringNotches();

            // Check if recovery is complete
            if (this.recoveryProgress >= 100) {
                this.isRecovering = false;
                this.nodeHealth = this.maxNodeHealth;
                this.stopRecoveryAnimation();

                // Restart action interval animation
                this.actionStartTime = Date.now();
                this.startActionIntervalAnimation();

                // Full re-render to show all notches active
                this.render({
                    active: true,
                    skill: this.currentSkill,
                    nodeId: this.currentNodeId,
                    nodeName: this.currentNodeName
                });
            } else {
                this.recoveryAnimationFrame = requestAnimationFrame(animate);
            }
        };

        this.recoveryAnimationFrame = requestAnimationFrame(animate);
    }

    getRecoveryColor(progress) {
        // Transition from red (0%) → yellow (50%) → green (100%)
        let r, g, b;

        if (progress <= 50) {
            // Red to Yellow (0-50%)
            const t = progress / 50; // 0 to 1
            r = 255;
            g = Math.floor(255 * t);
            b = 0;
        } else {
            // Yellow to Green (50-100%)
            const t = (progress - 50) / 50; // 0 to 1
            r = Math.floor(255 * (1 - t));
            g = 255;
            b = 0;
        }

        // Match the shimmer style opacity (0.3 center brightness)
        return {
            bright: `rgba(${r}, ${g}, ${b}, 0.3)`,
            medium: `rgba(${r}, ${g}, ${b}, 0.2)`,
            faint: `rgba(${r}, ${g}, ${b}, 0.1)`,
            glow: `rgba(${r}, ${g}, ${b}, 0.3)`
        };
    }

    updateRecoveringNotches() {
        // Update notches during recovery without full re-render
        const notches = document.querySelectorAll('.node-notch');
        const recoveringCount = Math.floor((this.recoveryProgress / 100) * this.maxNodeHealth);

        notches.forEach((notch, index) => {
            if (index < recoveringCount) {
                notch.classList.add('recovering');
                notch.classList.add('active');
            } else {
                notch.classList.remove('recovering');
                notch.classList.remove('active');
            }
        });
    }

    stopRecoveryAnimation() {
        if (this.recoveryAnimationFrame) {
            cancelAnimationFrame(this.recoveryAnimationFrame);
            this.recoveryAnimationFrame = null;
        }
        this.recoveryProgress = 0;
    }

    render(state) {
        if (!this.element) return;

        if (!state.active) {
            this.element.innerHTML = '';
            this.element.classList.remove('active');
            return;
        }

        this.element.classList.add('active');

        const comboTier = this.getComboTier(state.combo || this.comboCount);
        const comboClass = comboTier > 0 ? `combo-tier-${comboTier}` : '';

        const html = `
            <div class="gathering-bar ${comboClass}">
                <div class="gathering-info">
                    <div class="skill-icon">${this.getSkillIcon(state.skill || this.currentSkill)}</div>
                    <div class="node-info">
                        <div class="node-name">${state.nodeName || 'Unknown Node'}</div>
                        <div class="node-status">${this.isRecovering ? 'Resting' : this.getSkillVerb(state.skill || this.currentSkill)}</div>
                    </div>
                </div>

                <!-- Action Interval Container with moving highlight -->
                <div class="action-interval-container ${this.isRecovering ? 'recovering' : ''}">
                    <!-- Moving highlight (tied to interval speed) -->
                    <div class="interval-highlight ${this.isRecovering ? 'recovery-highlight' : 'action-highlight'}"
                         style="left: ${this.isRecovering ? this.recoveryProgress : this.actionProgress}%"></div>

                    <!-- Node health notches bar -->
                    <div class="node-notches-bar">
                        ${this.renderNodeNotches()}
                    </div>
                </div>

                ${this.comboCount > 0 ? `
                    <div class="combo-display ${comboClass}">
                        <div class="combo-icon">🔥</div>
                        <div class="combo-count">${this.comboCount}x</div>
                        ${comboTier > 0 ? `<div class="combo-tier-label">${this.getComboTierLabel(comboTier)}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        this.setHTML(this.element, html);
    }

    renderNodeNotches() {
        // Create discrete notches for each hit point
        // Notches disappear from RIGHT to LEFT (last notch goes dark first)
        let notchesHTML = '';

        for (let i = 0; i < this.maxNodeHealth; i++) {
            // Check if this notch should be active
            // i=0 is leftmost, i=maxNodeHealth-1 is rightmost
            // Active if i < nodeHealth
            const isActive = i < this.nodeHealth;

            // During recovery, show filling animation
            const isRecoveringNotch = this.isRecovering && i < Math.floor((this.recoveryProgress / 100) * this.maxNodeHealth);

            notchesHTML += `
                <div class="node-notch ${isActive ? 'active' : ''} ${isRecoveringNotch ? 'recovering' : ''}"></div>
            `;
        }

        return notchesHTML;
    }

    updateNodeHealthBar() {
        // Quick update for node health notches without full re-render
        const notches = document.querySelectorAll('.node-notch');
        const healthLabel = document.querySelector('.node-capacity');

        // Update notches (right side disappears first)
        notches.forEach((notch, index) => {
            if (index < this.nodeHealth) {
                notch.classList.add('active');
                notch.classList.remove('recovering');
            } else {
                notch.classList.remove('active');
                notch.classList.remove('recovering');
            }
        });

        if (healthLabel) {
            healthLabel.textContent = `${this.nodeHealth}/${this.maxNodeHealth} harvests`;
        }

        // Update combo display
        const comboCount = document.querySelector('.combo-count');
        if (comboCount) {
            comboCount.textContent = `${this.comboCount}x`;
        }
    }


    getComboTier(combo) {
        if (combo >= 50) return 4;
        if (combo >= 20) return 3;
        if (combo >= 10) return 2;
        if (combo >= 5) return 1;
        return 0;
    }

    getComboTierLabel(tier) {
        const labels = {
            1: 'HEATING UP!',
            2: 'ON FIRE!!',
            3: 'UNSTOPPABLE!!!',
            4: 'LEGENDARY!!!!'
        };
        return labels[tier] || '';
    }

    getSkillIcon(skill) {
        const icons = {
            mining: '⛏️',
            logging: '🪓',
            fishing: '🎣',
            hunting: '🏹',
            foraging: '🧺',
            thieving: '🔓'
        };
        return icons[skill] || '⚒️';
    }

    getSkillVerb(skill) {
        const verbs = {
            mining: 'Mining',
            logging: 'Logging',
            fishing: 'Fishing',
            foraging: 'Foraging',
            hunting: 'Hunting',
            thieving: 'Thieving',
            combat: 'Fighting'
        };
        return verbs[skill] || 'Gathering';
    }

    triggerSuccessAnimation() {
        if (!this.element) return;

        // Add success flash
        this.element.classList.add('success-flash');
        setTimeout(() => {
            this.element.classList.remove('success-flash');
        }, 300);

        // Emit particle event for particle system
        EventBus.emit('spawn-particles', {
            type: 'success',
            x: this.element.offsetLeft + this.element.offsetWidth / 2,
            y: this.element.offsetTop + this.element.offsetHeight / 2
        });
    }

    triggerMissAnimation() {
        if (!this.element) return;

        this.element.classList.add('miss-shake');
        setTimeout(() => {
            this.element.classList.remove('miss-shake');
        }, 400);
    }

    triggerDepletionAnimation() {
        if (!this.element) return;

        this.element.classList.add('node-depleted');
        setTimeout(() => {
            this.element.classList.remove('node-depleted');
        }, 1000);
    }

    showRewardPopup(rewards) {
        // Create floating reward text
        const popup = document.createElement('div');
        popup.className = 'reward-popup';

        let rewardText = rewards.map(r => {
            const item = ItemRegistry.getItem(r.itemId);
            return `+${r.quantity} ${item?.name || r.itemId}`;
        }).join(', ');

        popup.innerHTML = `<div class="reward-text">${rewardText}</div>`;

        if (this.element && this.element.parentElement) {
            this.element.parentElement.appendChild(popup);

            // Animate and remove
            setTimeout(() => {
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 500);
            }, 1500);
        }
    }
}

// Create singleton instance
const persistentActionBar = new PersistentActionBar();

console.log('✅ PersistentActionBar component loaded');
