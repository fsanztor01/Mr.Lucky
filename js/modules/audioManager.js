// ==========================================
// AUDIO MANAGER MODULE
// ==========================================

class AudioManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.successSound = document.getElementById('successSound');
        this.failSound = document.getElementById('failSound');
        this.explosionSound = document.getElementById('explosionSound');
        this.musicBtn = document.getElementById('musicBtn');

        this.isMuted = true;
        this.init();
    }

    init() {
        this.musicBtn.addEventListener('click', () => this.toggleMusic());
    }

    toggleMusic() {
        if (this.isMuted) {
            this.bgMusic.play().catch(() => { });
            this.musicBtn.classList.remove('muted');
            this.isMuted = false;
        } else {
            this.bgMusic.pause();
            this.musicBtn.classList.add('muted');
            this.isMuted = true;
        }
    }

    playSuccess() {
        this.successSound.currentTime = 0;
        this.successSound.play().catch(() => { });
    }

    playFail() {
        this.failSound.currentTime = 0;
        this.failSound.play().catch(() => { });
    }

    playExplosion() {
        this.explosionSound.currentTime = 0;
        this.explosionSound.play().catch(() => { });
    }
}

export default AudioManager;
