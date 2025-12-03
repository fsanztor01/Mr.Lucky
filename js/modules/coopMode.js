// ==========================================
// COOPERATIVE MODE
// ==========================================

import ConfettiSystem from './confetti.js';

class CoopMode {
    constructor(audioManager, uiManager, difficulty) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.difficulty = difficulty;
        this.confetti = new ConfettiSystem('coopConfetti');

        this.points = 0;
        this.ball1Y = 0;
        this.ball2Y = 0;
        this.target1Y = 50;
        this.target2Y = 50;

        this.ball1 = document.getElementById('coopBall1');
        this.ball2 = document.getElementById('coopBall2');
        this.target1 = document.getElementById('coopTarget1');
        this.target2 = document.getElementById('coopTarget2');

        this.touching1 = false;
        this.touching2 = false;

        this.init();
    }

    init() {
        this.ui.updateStat('coopPoints', this.points);
        this.ui.clearMessage('coopMessage');

        // Set initial positions
        this.ball1.style.bottom = '10px';
        this.ball2.style.bottom = '10px';
        this.randomizeTargets();

        // Touch/Mouse handlers for ball 1
        this.ball1.addEventListener('touchstart', () => this.touching1 = true);
        this.ball1.addEventListener('touchend', () => this.touching1 = false);
        this.ball1.addEventListener('mousedown', () => this.touching1 = true);
        this.ball1.addEventListener('mouseup', () => this.touching1 = false);

        // Touch/Mouse handlers for ball 2
        this.ball2.addEventListener('touchstart', () => this.touching2 = true);
        this.ball2.addEventListener('touchend', () => this.touching2 = false);
        this.ball2.addEventListener('mousedown', () => this.touching2 = true);
        this.ball2.addEventListener('mouseup', () => this.touching2 = false);

        // Start game loop
        this.gameLoop();
        this.targetLoop();
    }

    randomizeTargets() {
        this.target1Y = Math.random() * 180 + 20;
        this.target2Y = Math.random() * 180 + 20;
        this.target1.style.top = this.target1Y + 'px';
        this.target2.style.top = this.target2Y + 'px';
    }

    gameLoop() {
        // Move balls if being touched
        if (this.touching1 && this.ball1Y < 200) {
            this.ball1Y += 3;
            this.ball1.style.bottom = (10 + this.ball1Y) + 'px';
        }

        if (this.touching2 && this.ball2Y < 200) {
            this.ball2Y += 3;
            this.ball2.style.bottom = (10 + this.ball2Y) + 'px';
        }

        // Check for simultaneous hits
        this.checkHits();

        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    targetLoop() {
        this.randomizeTargets();
        this.targetLoopId = setTimeout(() => this.targetLoop(), 2000);
    }

    checkHits() {
        const ball1Top = 250 - (10 + this.ball1Y) - 40; // Convert bottom to top
        const ball2Top = 250 - (10 + this.ball2Y) - 40;

        const hit1 = Math.abs(ball1Top - this.target1Y) < 20;
        const hit2 = Math.abs(ball2Top - this.target2Y) < 20;

        if (hit1 && hit2) {
            this.points += 20;
            this.ui.updateStat('coopPoints', this.points);
            this.ui.showMessage('coopMessage', '¡SINCRONIZACIÓN PERFECTA! 🎉', true);
            this.confetti.launch(150);
            this.audio.playExplosion();

            // Reset balls
            this.ball1Y = 0;
            this.ball2Y = 0;
            this.ball1.style.bottom = '10px';
            this.ball2.style.bottom = '10px';
            this.randomizeTargets();
        }
    }

    destroy() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        if (this.targetLoopId) {
            clearTimeout(this.targetLoopId);
        }
        this.confetti.clear();
    }
}

export default CoopMode;
