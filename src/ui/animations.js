/**
 * ANIMATIONS & MICRO-INTERACTIONS
 *
 * Handles all UI animations, transitions, and micro-interactions for a polished feel.
 * Keeps animations subtle and minimal - Hitman aesthetic.
 */

const Animations = {
    /**
     * Show level up screen flash effect
     */
    showLevelUp(level) {
        // Create flash overlay
        const flash = document.createElement('div');
        flash.className = 'level-up-flash';
        document.body.appendChild(flash);

        // Create level up text
        const text = document.createElement('div');
        text.className = 'level-up-text';
        text.textContent = `LEVEL ${level}`;
        document.body.appendChild(text);

        // Remove elements after animation
        setTimeout(() => {
            flash.remove();
            text.remove();
        }, 2000);
    },

    /**
     * Flash currency when it changes
     */
    flashCurrency(currencyElement) {
        if (!currencyElement) return;

        currencyElement.classList.add('currency-flash');

        setTimeout(() => {
            currencyElement.classList.remove('currency-flash');
        }, 600);
    },

    /**
     * Animate number count-up
     */
    countUp(element, start, end, duration = 500) {
        if (!element) return;

        const startTime = Date.now();
        const range = end - start;

        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOut));

            element.textContent = Formatting.formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = Formatting.formatNumber(end);
            }
        };

        element.classList.add('count-up');
        step();

        setTimeout(() => {
            element.classList.remove('count-up');
        }, duration);
    },

    /**
     * Animate item pickup (slide in from bottom)
     */
    itemPickup(element) {
        if (!element) return;

        element.classList.add('item-pickup');

        setTimeout(() => {
            element.classList.remove('item-pickup');
        }, 400);
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ';

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 20px;">${icon}</span>
                <span style="font-family: var(--font-display); font-size: var(--font-size-sm); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide);">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'fadeOut 300ms ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    },

    /**
     * Parallax scroll effect for background
     */
    initParallax() {
        let ticking = false;
        let lastScrollY = 0;

        const updateParallax = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const backgroundLayer = document.getElementById('backgroundLayer');

            if (backgroundLayer) {
                // Very subtle parallax - move 20% of scroll speed
                const offset = scrollY * 0.2;
                backgroundLayer.style.transform = `translateY(${offset}px)`;
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    },

    /**
     * Fade in view on switch
     */
    fadeInView(viewElement) {
        if (!viewElement) return;

        // Reset animation
        viewElement.style.animation = 'none';

        // Trigger reflow
        void viewElement.offsetHeight;

        // Apply fade in animation
        viewElement.style.animation = 'fadeIn 300ms ease-out forwards';
    },

    /**
     * Add pulse animation to element
     */
    pulse(element) {
        if (!element) return;

        element.classList.add('pulse');
    },

    /**
     * Remove pulse animation from element
     */
    stopPulse(element) {
        if (!element) return;

        element.classList.remove('pulse');
    },

    /**
     * Add glow pulse to element
     */
    glowPulse(element) {
        if (!element) return;

        element.classList.add('glow-pulse');
    },

    /**
     * Remove glow pulse from element
     */
    stopGlowPulse(element) {
        if (!element) return;

        element.classList.remove('glow-pulse');
    },

    /**
     * Create skeleton loading placeholder
     */
    createSkeleton(type = 'card') {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        return skeleton;
    },

    /**
     * Show skeleton loaders in container
     */
    showSkeletons(container, count = 3, type = 'card') {
        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const skeleton = this.createSkeleton(type);
            container.appendChild(skeleton);
        }
    },

    /**
     * Fade in up animation for elements
     */
    fadeInUp(element, delay = 0) {
        if (!element) return;

        setTimeout(() => {
            element.classList.add('fade-in-up');
        }, delay);
    },

    /**
     * Stagger fade in up for multiple elements
     */
    staggerFadeInUp(elements, delayBetween = 50) {
        elements.forEach((element, index) => {
            this.fadeInUp(element, index * delayBetween);
        });
    },

    /**
     * Initialize all animations
     */
    init() {
        console.log("🎬 Animations System Initialized");

        // Initialize parallax scrolling
        this.initParallax();

        // Add hover lift to panels
        document.querySelectorAll('.dashboard-panel').forEach(panel => {
            panel.addEventListener('mouseenter', () => {
                panel.style.transform = 'translateY(-2px)';
            });

            panel.addEventListener('mouseleave', () => {
                panel.style.transform = 'translateY(0)';
            });
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Animations;
}
