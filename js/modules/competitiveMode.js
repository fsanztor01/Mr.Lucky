// ==========================================
// COMPETITIVE MODE (with moving targets & streak goals)
// ==========================================

import ConfettiSystem from './confetti.js';

class CompetitiveMode {
    constructor(audioManager, uiManager, difficulty, jackpotManager) {
        this.audio = audioManager;
        this.ui = uiManager;
        this.difficulty = difficulty;
        this.confetti = new ConfettiSystem('compConfetti');
        this.jackpot = jackpotManager;

        this.score1 = 0;
        this.score2 = 0;
        this.streak1 = 0;
        this.streak2 = 0;
        this.bar1Position = 0;
        this.bar2Position = 0;
        this.target1Position = 40;
        this.target2Position = 40;
        this.direction1 = 1;
        this.direction2 = 1;
        this.speed = this.getSpeed();
        this.animationId = null;
        this.isPaused = false;

        this.bar1 = document.getElementById('comp1Bar');
        this.bar2 = document.getElementById('comp2Bar');
        this.target1 = document.getElementById('comp1Target');
        this.target2 = document.getElementById('comp2Target');
        this.btn1 = document.getElementById('comp1Btn');
        this.btn2 = document.getElementById('comp2Btn');
        this.streakBanner = document.getElementById('compStreakGoalBanner');

        this.init();
    }

    getSpeed() {
        const speeds = {
            easy: 0.4,
            normal: 0.7,
            hard: 1.0,
            insane: 1.4
        };
        return speeds[this.difficulty] || 0.7;
    }

    init() {
        this.ui.updateStat('comp1Score', this.score1);
        this.ui.updateStat('comp2Score', this.score2);
        this.ui.updateStat('comp1Streak', this.streak1);
        this.ui.updateStat('comp2Streak', this.streak2);
        this.ui.clearMessage('compMessage');
        this.updateStreakBanner();

        this.bar1Position = 0;
        this.bar2Position = 0;
        this.bar1.style.left = '0%';
        this.bar2.style.left = '0%';
        this.target1.style.left = this.target1Position + '%';
        this.target2.style.left = this.target2Position + '%';

        this.animate();

        // Player 1 controls
        this.btn1.addEventListener('click', () => this.checkHit(1));
        this.btn1.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.checkHit(1);
        });

        // Player 2 controls
        this.btn2.addEventListener('click', () => this.checkHit(2));
        this.btn2.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.checkHit(2);
        });
    }

    updateStreakBanner() {
        if (!this.streakBanner) return;

        const goalText = this.streakBanner.querySelector('.goal-text');
        const maxStreak = Math.max(this.streak1, this.streak2);

        if (maxStreak < 5) {
            this.streakBanner.classList.remove('double-or-nothing');
            goalText.textContent = 'Meta: Racha 5 🎯';
        } else if (maxStreak >= 5 && maxStreak < 10) {
            this.streakBanner.classList.add('double-or-nothing');
            goalText.textContent = '🔥 ¡DOBLE O NADA! Meta: Racha 10 🔥';
        } else if (maxStreak >= 10) {
            this.streakBanner.classList.remove('double-or-nothing');
            goalText.textContent = '🏆 ¡SUERTE MÁXIMA! 🏆';
        }
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

    animate() {
        if (this.isPaused) return;

        // Animate bar 1
        this.bar1Position += this.speed * this.direction1;
        if (this.bar1Position <= 0) {
            this.bar1Position = 0;
            this.direction1 = 1;
        } else if (this.bar1Position >= 85) {
            this.bar1Position = 85;
            this.direction1 = -1;
        }
        this.bar1.style.left = this.bar1Position + '%';

        // Animate bar 2
        this.bar2Position += this.speed * this.direction2;
        if (this.bar2Position <= 0) {
            this.bar2Position = 0;
            this.direction2 = 1;
        } else if (this.bar2Position >= 85) {
            this.bar2Position = 85;
            this.direction2 = -1;
        }
        this.bar2.style.left = this.bar2Position + '%';

        // Move targets occasionally
        if (Math.random() < 0.015) {
            this.target1Position = 20 + Math.random() * 50;
            this.target1.style.left = this.target1Position + '%';
        }

        if (Math.random() < 0.015) {
            this.target2Position = 20 + Math.random() * 50;
            this.target2.style.left = this.target2Position + '%';
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    checkHit(player) {
        if (this.isPaused) return;

        let barPosition, targetPosition, isHit;

        if (player === 1) {
            barPosition = this.bar1Position;
            targetPosition = this.target1Position;
        } else {
            barPosition = this.bar2Position;
            targetPosition = this.target2Position;
        }

        const barLeft = barPosition;
        const barRight = barLeft + 15;
        const targetLeft = targetPosition;
        const targetRight = targetLeft + 20;
        isHit = barRight > targetLeft && barLeft < targetRight;

        if (isHit) {
            if (player === 1) {
                this.score1++;
                this.streak1++;
                this.ui.updateStat('comp1Score', this.score1);
                this.ui.updateStat('comp1Streak', this.streak1);
                this.updateStreakBanner();

                // Check for streak 5
                if (this.streak1 === 5) {
                    this.triggerDoubleOrNothing(1);
                    return;
                }

                // Check for streak 10
                if (this.streak1 === 10) {
                    this.triggerFinalJackpot(1);
                    return;
                }

                const messages = [
                    '¡Jugador 1 tiene SUERTE! 🍀⭐',
                    '¡Fortuna para Jugador 1! 💰',
                    '¡Jugador 1 es afortunado! 🎲'
                ];
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                this.ui.showMessage('compMessage', randomMsg, true);
            } else {
                this.score2++;
                this.streak2++;
                this.ui.updateStat('comp2Score', this.score2);
                this.ui.updateStat('comp2Streak', this.streak2);
                this.updateStreakBanner();

                // Check for streak 5
                if (this.streak2 === 5) {
                    this.triggerDoubleOrNothing(2);
                    return;
                }

                // Check for streak 10
                if (this.streak2 === 10) {
                    this.triggerFinalJackpot(2);
                    return;
                }

                const messages = [
                    '¡Jugador 2 tiene SUERTE! ⭐🍀',
                    '¡Fortuna para Jugador 2! 💎',
                    '¡Jugador 2 es afortunado! 🔮'
                ];
                const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                this.ui.showMessage('compMessage', randomMsg, true);
            }
            this.confetti.launch(120);
            this.audio.playSuccess();
        } else {
            if (player === 1) {
                this.streak1 = 0;
                this.ui.updateStat('comp1Streak', this.streak1);
                this.updateStreakBanner();
            } else {
                this.streak2 = 0;
                this.ui.updateStat('comp2Streak', this.streak2);
                this.updateStreakBanner();
            }
            this.ui.showMessage('compMessage', `Jugador ${player} sin suerte 😢`, false);
            this.audio.playFail();
        }
    }

    triggerDoubleOrNothing(player) {
        this.pause();

        this.jackpot.showDoubleOrNothing(
            () => {
                this.resume();
                this.ui.showMessage('compMessage', `¡Jugador ${player} va por la racha 10! 🔥`, true);
            },
            () => {
                this.resume();
                if (player === 1) {
                    this.streak1 = 0;
                    this.ui.updateStat('comp1Streak', this.streak1);
                } else {
                    this.streak2 = 0;
                    this.ui.updateStat('comp2Streak', this.streak2);
                }
                this.updateStreakBanner();
            }
        );
    }

    triggerFinalJackpot(player) {
        this.pause();

        this.jackpot.show({
            onClose: () => {
                this.resume();
                this.ui.showMessage('compMessage', `¡Jugador ${player} alcanzó el LUCKY MOMENTUM! 🎰`, true);
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

export default CompetitiveMode;
