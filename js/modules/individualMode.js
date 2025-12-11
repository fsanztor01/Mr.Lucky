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

        // Elementos del DOM
        this.bar = document.getElementById('indBar');
        this.target = document.getElementById('indTarget');
        this.actionBtn = document.getElementById('indActionBtn');
        this.streakBanner = document.getElementById('streakGoalBanner');

        // Handlers para poder desuscribir en destroy()
        this.handleActionClick = () => this.checkHit();
        this.handleActionTouch = (e) => {
            e.preventDefault();
            this.checkHit();
        };

        // Comprobación básica de DOM
        if (!this.bar || !this.target) {
            console.error('[IndividualMode] Faltan elementos de barra/target en el DOM.');
            return;
        }

        if (!this.actionBtn) {
            console.error('[IndividualMode] Falta el botón indActionBtn en el DOM.');
            return;
        }

        this.bindEvents();
        this.init();
    }

    getBaseSpeed() {
        const speeds = {
            easy: 0.4,
            normal: 0.7,
            hard: 1.1,
            insane: 1.6
        };
        return speeds[this.difficulty] || speeds.normal;
    }

    bindEvents() {
        this.actionBtn.addEventListener('click', this.handleActionClick);
        this.actionBtn.addEventListener('touchstart', this.handleActionTouch, { passive: false });
    }

    unbindEvents() {
        if (!this.actionBtn) return;
        this.actionBtn.removeEventListener('click', this.handleActionClick);
        this.actionBtn.removeEventListener('touchstart', this.handleActionTouch);
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
    }

    updateStreakBanner() {
        if (!this.streakBanner) return;

        const goalText = this.streakBanner.querySelector('.goal-text');
        if (!goalText) return;

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

        // Chaos mechanics: variación aleatoria de velocidad
        this.currentSpeed = this.baseSpeed + (Math.random() - 0.5) * 0.4;

        this.barPosition += this.currentSpeed * this.direction;

        if (this.barPosition <= 0) {
            this.barPosition = 0;
            this.direction = 1;
        } else if (this.barPosition >= 85) {
            this.barPosition = 85;
            this.direction = -1;
        }

        // Mover target ocasionalmente (componente “caos”)
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
        if (!this.isPaused) return; // evita doble animación
        this.isPaused = false;
        this.animate();
    }

    checkHit() {
        if (this.isPaused) return;

        const barWidth = 15;
        const targetWidth = 20;

        const barLeft = this.barPosition;
        const barRight = barLeft + barWidth;
        const targetLeft = this.targetPosition;
        const targetRight = targetLeft + targetWidth;

        const isHit = barRight > targetLeft && barLeft < targetRight;

        if (isHit) {
            const bonusMultiplier = this.streak + 1;
            this.points += 10 * bonusMultiplier;
            this.streak++;
            this.ui.updateStat('indPoints', this.points);
            this.ui.updateStat('indStreak', this.streak);
            this.updateStreakBanner();

            // Jackpot a racha 5 (doble o nada)
            if (this.streak === 5) {
                this.triggerDoubleOrNothing();
                return;
            }

            // Jackpot final a racha 10
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
                // Sigue jugando
                this.resume();
                this.ui.showMessage('indMessage', '¡Vamos por la racha 10! 🔥', true);
            },
            () => {
                // Opción “perder todo”: resetea racha
                this.resume();
                this.streak = 0;
                this.ui.updateStat('indStreak', this.streak);
                this.updateStreakBanner();
            }
        );
    }

    triggerFinalJackpot() {
        this.pause();

        this.jackpot.show({
            onClose: () => {
                this.resume();
                this.ui.showMessage('indMessage', '¡LUCKY MOMENTUM alcanzado! 🎰', true);
            }
        });
    }

    destroy() {
        // Parar animación
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Quitar listeners
        this.unbindEvents();

        // Limpiar confeti
        if (this.confetti && typeof this.confetti.clear === 'function') {
            this.confetti.clear();
        }
    }
}

export default IndividualMode;
