// ==========================================
// PRECISION MODE
// ==========================================

import ConfettiSystem from './confetti.js';

class PrecisionMode {
    constructor(audioManager, uiManager, difficulty) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.difficulty = difficulty;
        this.confetti = new ConfettiSystem('precisionConfetti');

        this.hits = 0;
        this.barPosition = 0;
        this.direction = 1;
        this.speed = this.getSpeed();
        this.animationId = null;

        this.bar = document.getElementById('precisionBar');
        this.target = document.getElementById('precisionTarget');
        this.actionBtn = document.getElementById('precisionActionBtn');

        this.init();
    }

    getSpeed() {
        const speeds = {
            easy: 0.4,
            normal: 0.7,
            hard: 1.0,
            insane: 1.5
        };
        return speeds[this.difficulty] || 0.7;
    }

    init() {
        this.ui.updateStat('precisionHits', this.hits);
        this.ui.clearMessage('precisionMessage');

        this.barPosition = 0;
        this.bar.style.left = '0%';

        this.animate();

        this.actionBtn.addEventListener('click', () => this.checkHit());
        this.actionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.checkHit();
        });
    }

    animate() {
        this.barPosition += this.speed * this.direction;

        if (this.barPosition <= 0) {
            this.barPosition = 0;
            this.direction = 1;
        } else if (this.barPosition >= 88) {
            this.barPosition = 88;
            this.direction = -1;
        }

        this.bar.style.left = this.barPosition + '%';
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    checkHit() {
        const barLeft = this.barPosition;
        const barRight = barLeft + 12;
        const targetLeft = 42.5; // Small target zone
        const targetRight = 57.5; // 15% wide

        const isHit = barRight > targetLeft && barLeft < targetRight;

        if (isHit) {
            this.hits++;
            this.ui.updateStat('precisionHits', this.hits);
            this.ui.showMessage('precisionMessage', '¡PERFECTO! 🎯✨', true);
            this.confetti.launch(120);
            this.audio.playSuccess();
        } else {
            this.ui.showMessage('precisionMessage', '¡Casi! Inténtalo de nuevo 😤', false);
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

export default PrecisionMode;
