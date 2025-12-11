// ==========================================
// FORTUNE WHEEL MODE (Spin the Wheel of Fortune)
// ==========================================

import ConfettiSystem from './confetti.js';

class FortuneWheelMode {
    constructor(audioManager, uiManager, jackpotManager) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.jackpot = jackpotManager;
        this.confetti = new ConfettiSystem('fortuneWheelConfetti');

        this.isSpinning = false;
        this.wheelRotation = 0;

        this.spinBtn = document.getElementById('fortuneWheelSpinBtn');
        this.wheel = document.getElementById('fortuneWheel');
        this.wheelPointer = document.getElementById('fortuneWheelPointer');
        this.resultMessage = document.getElementById('fortuneWheelResult');
        this.resultDetails = document.getElementById('fortuneWheelResultDetails');

        // Fortune segments with different luck levels
        this.fortuneSegments = [
            { name: 'Suerte Máxima', emoji: '🎰', message: '¡Tienes la suerte al máximo! Hoy es tu día.', level: 5 },
            { name: 'Gran Fortuna', emoji: '💰', message: 'La fortuna te sonríe. ¡Aprovecha esta energía!', level: 4 },
            { name: 'Buena Suerte', emoji: '🍀', message: 'Las estrellas están alineadas a tu favor.', level: 3 },
            { name: 'Suerte Normal', emoji: '🎲', message: 'La suerte está de tu lado. Sigue adelante.', level: 2 },
            { name: 'Suerte Básica', emoji: '⭐', message: 'Tienes suerte básica. Todo saldrá bien.', level: 1 },
            { name: 'Suerte Mínima', emoji: '🔮', message: 'La suerte está presente, aunque sea mínima.', level: 1 }
        ];

        this.init();
    }

    init() {
        this.reset();
        this.spinBtn.addEventListener('click', () => this.spinWheel());
    }

    reset() {
        this.isSpinning = false;
        this.wheelRotation = 0;
        if (this.wheel) {
            this.wheel.style.transform = 'rotate(0deg)';
        }
        if (this.resultMessage) {
            this.resultMessage.textContent = '';
        }
        if (this.resultDetails) {
            this.resultDetails.textContent = '';
        }
        if (this.spinBtn) {
            this.spinBtn.disabled = false;
        }
    }

    spinWheel() {
        if (this.isSpinning || !this.wheel) return;

        this.isSpinning = true;
        if (this.spinBtn) {
            this.spinBtn.disabled = true;
        }
        if (this.resultMessage) {
            this.resultMessage.textContent = '';
        }
        if (this.resultDetails) {
            this.resultDetails.textContent = 'Girando la rueda...';
        }

        // Random rotation (multiple full spins + random segment)
        const segments = this.fortuneSegments.length;
        const segmentAngle = 360 / segments;
        const randomSegment = Math.floor(Math.random() * segments);
        const targetRotation = this.wheelRotation + 1080 + (randomSegment * segmentAngle) + (Math.random() * segmentAngle);

        // Animate wheel
        this.wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        this.wheel.style.transform = `rotate(${targetRotation}deg)`;
        this.wheelRotation = targetRotation % 360;

        // Get result after animation
        setTimeout(() => {
            const normalizedRotation = (360 - (this.wheelRotation % 360)) % 360;
            const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
            const result = this.fortuneSegments[segmentIndex];

            this.showResult(result);
            this.isSpinning = false;
            if (this.spinBtn) {
                this.spinBtn.disabled = false;
            }
        }, 3000);
    }

    showResult(result) {
        // Launch confetti based on luck level
        const confettiAmount = result.level * 30;
        this.confetti.launch(confettiAmount);
        this.audio.playSuccess();

        // Show result message
        if (this.resultMessage) {
            this.resultMessage.textContent = `${result.emoji} ${result.name} ${result.emoji}`;
        }
        if (this.resultDetails) {
            this.resultDetails.textContent = result.message;
        }

        // Special message for maximum luck
        if (result.level === 5) {
            setTimeout(() => {
                this.jackpot.show({
                    title: '¡SUERTE MÁXIMA!',
                    subtitle: '🎰 LA FORTUNA ESTÁ DE TU LADO 🎰',
                    text: '¡FELICIDADES!',
                    subtext: 'Has obtenido el nivel máximo de suerte. ¡Es hora de ir al BINGO!',
                    cta: '🎲 ¡Que los números te acompañen! 🎰',
                    buttonText: 'Continuar',
                    onClose: () => {
                        if (this.resultDetails) {
                            this.resultDetails.textContent = '¡Ve al bingo ahora! La suerte está contigo.';
                        }
                    }
                });
            }, 1000);
        }
    }

    destroy() {
        this.confetti.clear();
    }
}

export default FortuneWheelMode;
