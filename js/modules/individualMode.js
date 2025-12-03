// ==========================================
// INDIVIDUAL MODE (with Chaos mechanics & Streak Goals)
// ==========================================

import ConfettiSystem from './confetti.js';

class IndividualMode {
    constructor(audioManager, uiManager, difficulty, jackpotManager) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.difficulty = difficulty;
        this.confetti = new ConfettiSystem('indConfetti');
        this.jackpot = jackpotManager;

        this.points = 0;
        this.streak = 0;
        this.barPosition = 0;
        this.direction = 1;
        this.baseSpeed = this.getBaseSpeed();
        this.currentSpeed = this.baseSpeed;
        this.targetPosition = 40;
        this.animationId = null;
        this.isPaused = false;

        this.bar = document.getElementById('indBar');
        this.target = document.getElementById('indTarget');
        this.actionBtn = document.getElementById('indActionBtn');
        this.streakBanner = document.getElementById('streakGoalBanner');

        this.init();
    }

    getBaseSpeed() {
        const speeds = {
            easy: 0.4,
            normal: 0.7,
            hard: 1.1,
            insane: 1.6
        };
        return speeds[this.difficulty] || 0.7;
    }

    init() {
        this.ui.updateStat('indPoints', this.points);
        this.ui.updateStat('indStreak', this.streak);
        this.ui.clearMessage('indMessage');
        this.updateStreakBanner();

        this.barPosition = 0;
        this.bar.style.left = '0%';
        this.target.style.left = this.targetPosition + '%';

        this.animate();

        // Handle both click and touch
        this.actionBtn.addEventListener('click', () => this.checkHit());
        this.actionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.checkHit();
        });
    }

    updateStreakBanner() {
        if (!this.streakBanner) return;

        const goalText = this.streakBanner.querySelector('.goal-text');

        if (this.streak < 5) {
            this.streakBanner.classList.remove('double-or-nothing');
            goalText.textContent = 'Meta: Racha 5 🎯';
        } else if (this.streak >= 5 && this.streak < 10) {
            this.streakBanner.classList.add('double-or-nothing');
            goalText.textContent = '🔥 ¡DOBLE O NADA! Meta: Racha 10 🔥';
        } else if (this.streak >= 10) {
            this.streakBanner.classList.remove('double-or-nothing');
            goalText.textContent = '🏆 ¡SUERTE MÁXIMA! 🏆';
        }
    }

    animate() {
        if (this.isPaused) return;

        // Chaos mechanics: random speed variation
        this.currentSpeed = this.baseSpeed + (Math.random() - 0.5) * 0.4;

        this.barPosition += this.currentSpeed * this.direction;

        if (this.barPosition <= 0) {
            this.barPosition = 0;
            this.direction = 1;
        } else if (this.barPosition >= 85) {
            this.barPosition = 85;
            this.direction = -1;
        }

        // Occasionally move target (chaos element)
        if (Math.random() < 0.015) {
            this.targetPosition = 20 + Math.random() * 50;
            this.target.style.left = this.targetPosition + '%';
        }

        this.bar.style.left = this.barPosition + '%';
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    pause() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        this.isPaused = false;
        this.animate();
    }

    checkHit() {
        if (this.isPaused) return;

        const barLeft = this.barPosition;
        const barRight = barLeft + 15;
        const targetLeft = this.targetPosition;
        const targetRight = targetLeft + 20;

        const isHit = barRight > targetLeft && barLeft < targetRight;

        if (isHit) {
            const bonusMultiplier = this.streak + 1;
            this.points += 10 * bonusMultiplier;
            this.streak++;
            this.ui.updateStat('indPoints', this.points);
            this.ui.updateStat('indStreak', this.streak);
            this.updateStreakBanner();

            // Check for jackpot at streak 5 (double or nothing)
            if (this.streak === 5) {
                this.triggerDoubleOrNothing();
                return;
            }

            // Check for final jackpot at streak 10
            if (this.streak === 10) {
                this.triggerFinalJackpot();
                return;
            }

            const messages = [
                '¡LA SUERTE ESTÁ DE TU LADO! 🍀✨',
                '¡FORTUNA INCREÍBLE! 💰🎯',
                '¡ERES UN AFORTUNADO! ⭐💎',
                '¡QUÉ SUERTE TIENES! 🎲🔮'
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];

            this.ui.showMessage('indMessage', randomMsg, true);
            this.confetti.launch(150);
            this.audio.playSuccess();
        } else {
            this.streak = 0;
            this.ui.updateStat('indStreak', this.streak);
            this.updateStreakBanner();

            const failMessages = [
                '¡Mala suerte! Inténtalo de nuevo 🎲',
                '¡La fortuna no te acompaña! 😢',
                '¡Casi! Prueba otra vez 🍀'
            ];
            const randomFail = failMessages[Math.floor(Math.random() * failMessages.length)];

            this.ui.showMessage('indMessage', randomFail, false);
            this.audio.playFail();
        }
    }

    triggerDoubleOrNothing() {
        this.pause();

        this.jackpot.showDoubleOrNothing(
            () => {
                // Continue playing
                this.resume();
                this.ui.showMessage('indMessage', '¡Vamos por la racha 10! 🔥', true);
            },
            () => {
                // Quit (not used but kept for future)
                this.resume();
                this.streak = 0;
                this.ui.updateStat('indStreak', this.streak);
                this.updateStreakBanner();
                this.resume();
            }
        });
}

destroy() {
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
    }
    this.confetti.clear();
}
}

export default IndividualMode;
