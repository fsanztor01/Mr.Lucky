// ==========================================
// CHAOS MODE
// ==========================================

import ConfettiSystem from './confetti.js';

class ChaosMode {
    constructor(audioManager, uiManager, difficulty) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.difficulty = difficulty;
        this.confetti = new ConfettiSystem('chaosConfetti');

        this.hits = 0;
        this.barPosition = 0;
        this.direction = 1;
        this.baseSpeed = this.getBaseSpeed();
        this.currentSpeed = this.baseSpeed;
        this.targetPosition = 37.5;
        this.animationId = null;

        this.bar = document.getElementById('chaosBar');
        this.target = document.getElementById('chaosTarget');
        this.actionBtn = document.getElementById('chaosActionBtn');

        this.init();
    }

    getBaseSpeed() {
        const speeds = {
            easy: 0.5,
            normal: 0.8,
            hard: 1.2,
            insane: 1.8
        };
        return speeds[this.difficulty] || 0.8;
    }

    init() {
        this.ui.updateStat('chaosHits', this.hits);
        this.ui.clearMessage('chaosMessage');

        this.barPosition = 0;
        this.bar.style.left = '0%';
        this.target.style.left = this.targetPosition + '%';

        this.animate();

        this.actionBtn.addEventListener('click', () => this.checkHit());
        this.actionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.checkHit();
        });
    }

    animate() {
        // Random speed variation
        this.currentSpeed = this.baseSpeed + (Math.random() - 0.5) * 0.5;

        this.barPosition += this.currentSpeed * this.direction;

        if (this.barPosition <= 0) {
            this.barPosition = 0;
            this.direction = 1;
        } else if (this.barPosition >= 88) {
            this.barPosition = 88;
            this.direction = -1;
        }

        // Move target randomly
        if (Math.random() < 0.02) {
            this.targetPosition = Math.random() * 63; // Keep target visible
            this.target.style.left = this.targetPosition + '%';
        }

        this.bar.style.left = this.barPosition + '%';
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    checkHit() {
        const barLeft = this.barPosition;
        const barRight = barLeft + 12;
        const targetLeft = this.targetPosition;
        const targetRight = targetLeft + 25;

        const isHit = barRight > targetLeft && barLeft < targetRight;

        if (isHit) {
            this.hits++;
            this.ui.updateStat('chaosHits', this.hits);
            this.ui.showMessage('chaosMessage', '¡INCREÍBLE! 🌀⚡', true);
            this.confetti.launch(150);
            this.audio.playSuccess();
        } else {
            this.ui.showMessage('chaosMessage', '¡Demasiado caótico! 😈', false);
            this.audio.playFail();
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.confetti.clear();
    }
}

export default ChaosMode;
