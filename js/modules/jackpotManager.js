// ==========================================
// JACKPOT MANAGER MODULE (Lucky Momentum)
// ==========================================

import ConfettiSystem from './confetti.js';

class JackpotManager {
    constructor(audioManager) {
        this.audio = audioManager;
        this.overlay = document.getElementById('jackpotOverlay');
        this.closeBtn = document.getElementById('jackpotCloseBtn');
        this.confetti = new ConfettiSystem('jackpotConfetti');

        this.title = this.overlay?.querySelector('.jackpot-title');
        this.subtitle = this.overlay?.querySelector('.jackpot-subtitle');
        this.jackpotText = this.overlay?.querySelector('.jackpot-text');
        this.jackpotSubtext = this.overlay?.querySelector('.jackpot-subtext');
        this.jackpotCta = this.overlay?.querySelector('.jackpot-cta');

        this.callback = null;
        this.init();
    }

    init() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide();
                if (this.callback) {
                    this.callback();
                    this.callback = null;
                }
            });
            
            // Touch support for mobile
            this.closeBtn.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.hide();
                if (this.callback) {
                    this.callback();
                    this.callback = null;
                }
            });
        }
        
        // Close on backdrop click/touch
        const backdrop = document.getElementById('jackpotBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                this.hide();
                if (this.callback) {
                    this.callback();
                    this.callback = null;
                }
            });
            
            backdrop.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.hide();
                if (this.callback) {
                    this.callback();
                    this.callback = null;
                }
            });
        }
        
        // Prevent content clicks from closing
        if (this.overlay) {
            const content = this.overlay.querySelector('.jackpot-content');
            if (content) {
                content.addEventListener('click', (e) => e.stopPropagation());
                content.addEventListener('touchend', (e) => e.stopPropagation());
            }
        }
    }

    show(config = {}) {
        const {
            title = '¡LUCKY MOMENTUM!',
            subtitle = '🔥 SUERTE MÁXIMA ALCANZADA 🔥',
            text = '¡FELICIDADES!',
            subtext = 'Has demostrado tener una fortuna increíble',
            cta = '🎲 ¡Es hora de ir al BINGO! 🎰',
            buttonText = 'Continuar Jugando',
            onClose = null
        } = config;

        if (this.overlay) {
            // Update content
            if (this.title) this.title.textContent = title;
            if (this.subtitle) this.subtitle.textContent = subtitle;
            if (this.jackpotText) this.jackpotText.textContent = text;
            if (this.jackpotSubtext) this.jackpotSubtext.textContent = subtext;
            if (this.jackpotCta) this.jackpotCta.textContent = cta;
            if (this.closeBtn) this.closeBtn.textContent = buttonText;

            this.callback = onClose;

            this.overlay.classList.add('active');
            this.confetti.launch(300);
            this.audio.playExplosion();

            // Continue launching confetti
            this.confettiInterval = setInterval(() => {
                this.confetti.launch(150);
            }, 1500);
        }
    }

    showDoubleOrNothing(onContinue, onQuit) {
        if (this.overlay) {
            // Update content for double or nothing
            if (this.title) this.title.textContent = '¡RACHA 5!';
            if (this.subtitle) this.subtitle.textContent = '🔥 DOBLE O NADA 🔥';
            if (this.jackpotText) this.jackpotText.textContent = '¡INCREÍBLE SUERTE!';
            if (this.jackpotSubtext) this.jackpotSubtext.textContent = '¿Deseas continuar y arriesgar tu racha?';
            if (this.jackpotCta) this.jackpotCta.textContent = '🎲 Llega a racha 10 para el LUCKY MOMENTUM FINAL 🎰';
            if (this.closeBtn) this.closeBtn.textContent = 'SÍ, ¡Continuar!';

            this.callback = onContinue;

            this.overlay.classList.add('active');
            this.confetti.launch(200);
            this.audio.playSuccess();

            // Launch confetti a few times
            let count = 0;
            this.confettiInterval = setInterval(() => {
                this.confetti.launch(100);
                count++;
                if (count >= 3) {
                    clearInterval(this.confettiInterval);
                }
            }, 1000);
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            if (this.confettiInterval) {
                clearInterval(this.confettiInterval);
            }
            this.confetti.clear();
        }
    }
}

export default JackpotManager;
