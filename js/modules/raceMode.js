// ==========================================
// RACE MODE (with countdown, tap mechanics, and jackpot)
// ==========================================

import ConfettiSystem from './confetti.js';

class RaceMode {
    constructor(audioManager, uiManager, difficulty, jackpotManager) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.difficulty = difficulty;
        this.confetti = new ConfettiSystem('raceConfetti');
        this.jackpot = jackpotManager;

        this.runner1Y = 0;
        this.runner2Y = 0;
        this.gameActive = false;
        this.finishLine = 270;
        this.tapSpeed = this.getTapSpeed();

        this.runner1 = document.getElementById('runner1');
        this.runner2 = document.getElementById('runner2');
        this.track1 = document.getElementById('track1');
        this.track2 = document.getElementById('track2');
        this.countdownOverlay = document.getElementById('countdownOverlay');
        this.countdownNumber = document.getElementById('countdownNumber');
        this.instruction = document.getElementById('raceInstruction');

        this.init();
    }

    getTapSpeed() {
        const speeds = {
            easy: 4,
            normal: 3,
            hard: 2.5,
            insane: 2
        };
        return speeds[this.difficulty] || 3;
    }

    init() {
        this.ui.clearMessage('raceMessage');

        // Reset positions
        this.runner1.style.bottom = '15px';
        this.runner2.style.bottom = '15px';

        // Start countdown
        this.startCountdown();
    }

    startCountdown() {
        this.instruction.textContent = '¡Prepárate!';
        this.countdownOverlay.classList.add('active');

        let count = 3;
        this.countdownNumber.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumber.textContent = count;
            } else if (count === 0) {
                this.countdownNumber.textContent = '¡YA!';
                setTimeout(() => {
                    this.countdownOverlay.classList.remove('active');
                    this.startRace();
                }, 500);
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    startRace() {
        this.gameActive = true;
        this.instruction.textContent = '¡Toca rápido tu carril para avanzar!';

        // Tap handlers for track 1
        const tap1Handler = (e) => {
            e.preventDefault();
            if (this.gameActive) {
                this.moveRunner(1);
            }
        };

        this.track1.addEventListener('touchstart', tap1Handler);
        this.track1.addEventListener('click', tap1Handler);

        // Tap handlers for track 2
        const tap2Handler = (e) => {
            e.preventDefault();
            if (this.gameActive) {
                this.moveRunner(2);
            }
        };

        this.track2.addEventListener('touchstart', tap2Handler);
        this.track2.addEventListener('click', tap2Handler);

        // Store handlers for cleanup
        this.tap1Handler = tap1Handler;
        this.tap2Handler = tap2Handler;
    }

    moveRunner(player) {
        if (!this.gameActive) return;

        if (player === 1 && this.runner1Y < this.finishLine) {
            this.runner1Y += this.tapSpeed;
            this.runner1.style.bottom = (15 + this.runner1Y) + 'px';

            if (this.runner1Y >= this.finishLine) {
                this.endRace('Jugador 1 🍀', 1);
            }
        } else if (player === 2 && this.runner2Y < this.finishLine) {
            this.runner2Y += this.tapSpeed;
            this.runner2.style.bottom = (15 + this.runner2Y) + 'px';

            if (this.runner2Y >= this.finishLine) {
                this.endRace('Jugador 2 ⭐', 2);
            }
        }
    }

    endRace(winner, playerNum) {
        this.gameActive = false;

        // Show jackpot for winner
        this.jackpot.show({
            title: '¡GANADOR!',
            subtitle: `🏆 ${winner} GANÓ LA CARRERA 🏆`,
            text: '¡FELICIDADES!',
            subtext: 'La fortuna estuvo de tu lado',
            cta: '🎲 ¡Es hora de ir al BINGO! 🎰',
            buttonText: 'Volver al Menú',
            onClose: () => {
                // Winner message
                const winMessages = [
                    `🏆 ¡${winner} GANÓ! ¡QUÉ SUERTE! 🏆`,
                    `🎉 ¡${winner} ES EL MÁS AFORTUNADO! 🎉`,
                    `⭐ ¡${winner} TIENE TODA LA FORTUNA! ⭐`
                ];
                const randomMsg = winMessages[Math.floor(Math.random() * winMessages.length)];
                this.ui.showMessage('raceMessage', randomMsg, true);
            }
        });
    }

    destroy() {
        this.gameActive = false;

        // Remove event listeners
        if (this.tap1Handler) {
            this.track1.removeEventListener('touchstart', this.tap1Handler);
            this.track1.removeEventListener('click', this.tap1Handler);
        }
        if (this.tap2Handler) {
            this.track2.removeEventListener('touchstart', this.tap2Handler);
            this.track2.removeEventListener('click', this.tap2Handler);
        }

        this.confetti.clear();
    }
}

export default RaceMode;
