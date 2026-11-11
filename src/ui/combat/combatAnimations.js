/**
 * COMBAT ANIMATIONS
 *
 * Visual effects for damage, crits, healing, and combat feedback
 */

const CombatAnimations = {
    /**
     * Show floating damage number
     */
    showDamageNumber(target, amount, type = 'damage') {
        const container = document.getElementById(`${target}-image-container`);
        if (!container) return;

        const damageEl = document.createElement('div');
        damageEl.className = `damage-number ${type}`;

        if (type === 'damage') {
            damageEl.textContent = `-${amount}`;
            damageEl.classList.add('damage-hit');
        } else if (type === 'crit') {
            damageEl.textContent = `-${amount}`;
            damageEl.classList.add('damage-crit');
        } else if (type === 'heal') {
            damageEl.textContent = `+${amount}`;
            damageEl.classList.add('damage-heal');
        } else if (type === 'miss') {
            damageEl.textContent = 'MISS';
            damageEl.classList.add('damage-miss');
        }

        // Random horizontal offset
        const offsetX = (Math.random() - 0.5) * 60;
        damageEl.style.left = `calc(50% + ${offsetX}px)`;

        container.appendChild(damageEl);

        // Remove after animation
        setTimeout(() => damageEl.remove(), 1000);
    },

    /**
     * Show critical hit effect (comic book style)
     */
    showCriticalHitEffect(target) {
        const container = document.getElementById(`${target}-image-container`);
        if (!container) return;

        // Create comic book "POW!" effect
        const critEffect = document.createElement('div');
        critEffect.className = 'crit-effect';
        critEffect.innerHTML = `
            <div class="crit-burst"></div>
            <div class="crit-text">CRIT!</div>
        `;

        container.appendChild(critEffect);

        // Screen shake
        container.classList.add('screen-shake');

        setTimeout(() => {
            critEffect.remove();
            container.classList.remove('screen-shake');
        }, 600);
    },

    /**
     * Animate HP bar change
     */
    animateHPChange(target, oldHP, newHP, maxHP) {
        const hpBar = document.querySelector(`.${target}-panel .hp-bar`);
        const hpText = document.querySelector(`.${target}-panel .hp-values`);
        if (!hpBar) return;

        const oldPercent = (oldHP / maxHP) * 100;
        const newPercent = (newHP / maxHP) * 100;

        // Create "lost HP" segment that fades out
        if (newHP < oldHP) {
            const lostSegment = document.createElement('div');
            lostSegment.className = 'hp-lost-segment';
            lostSegment.style.width = `${oldPercent - newPercent}%`;
            lostSegment.style.left = `${newPercent}%`;
            hpBar.parentElement.appendChild(lostSegment);

            setTimeout(() => lostSegment.remove(), 500);
        }

        // Create "gained HP" flash for healing
        if (newHP > oldHP) {
            const gainedSegment = document.createElement('div');
            gainedSegment.className = 'hp-gained-segment';
            gainedSegment.style.width = `${newPercent - oldPercent}%`;
            gainedSegment.style.left = `${oldPercent}%`;
            hpBar.parentElement.appendChild(gainedSegment);

            setTimeout(() => gainedSegment.remove(), 500);
        }

        // Animate bar width
        hpBar.style.width = `${newPercent}%`;

        // Update text with counting effect
        if (hpText) {
            this.animateNumber(hpText, oldHP, newHP, maxHP);
        }
    },

    /**
     * Animate number counting
     */
    animateNumber(element, from, to, max, duration = 300) {
        const start = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.round(from + (to - from) * progress);
            element.textContent = `${current} / ${max} HP`;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },

    /**
     * Show loot pop animation
     */
    showLootPop(lootElement) {
        if (!lootElement) return;
        lootElement.style.animation = 'none';
        setTimeout(() => {
            lootElement.style.animation = 'lootPop 0.3s ease';
        }, 10);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatAnimations;
}
