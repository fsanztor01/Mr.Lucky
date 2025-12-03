// ==========================================
// MAIN APPLICATION ENTRY POINT
// ==========================================

import AudioManager from './modules/audioManager.js';
import UIManager from './modules/uiManager.js';
import BackgroundAnimation from './modules/background.js';
import JackpotManager from './modules/jackpotManager.js';
import IndividualMode from './modules/individualMode.js';
import RaceMode from './modules/raceMode.js';
import CompetitiveMode from './modules/competitiveMode.js';

class MrLuckyApp {
    constructor() {
        this.audio = new AudioManager();
        this.ui = new UIManager();
        this.background = new BackgroundAnimation();
        this.jackpot = new JackpotManager(this.audio);

        this.currentMode = null;
        this.currentGameMode = null;
        this.selectedMode = null;
        this.selectedDifficulty = 'normal';

        this.init();
    }

    init() {
        this.setupWelcomeScreen();
        this.setupMenuButtons();
        this.setupDifficultyButtons();
        this.setupBackButtons();
    }

    setupWelcomeScreen() {
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.ui.showScreen('main');
            });
        }
    }

    setupMenuButtons() {
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.selectedMode = mode;
                this.ui.showScreen('difficulty');
            });
        });
    }

    setupDifficultyButtons() {
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.selectedDifficulty = difficulty;
                this.startGame(this.selectedMode, difficulty);
            });
        });
    }

    setupBackButtons() {
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.stopCurrentGame();
                this.ui.showScreen('main');
            });
        });
    }

    startGame(mode, difficulty) {
        // Clean up previous game
        this.stopCurrentGame();

        // Show appropriate screen
        this.ui.showScreen(mode);

        // Initialize game mode - pass jackpot manager to all modes
        switch (mode) {
            case 'individual':
                this.currentGameMode = new IndividualMode(this.audio, this.ui, difficulty, this.jackpot);
                break;
            case 'race':
                this.currentGameMode = new RaceMode(this.audio, this.ui, difficulty, this.jackpot);
                break;
            case 'competitive':
                this.currentGameMode = new CompetitiveMode(this.audio, this.ui, difficulty, this.jackpot);
                break;
        }

        this.currentMode = mode;
    }

    stopCurrentGame() {
        if (this.currentGameMode && this.currentGameMode.destroy) {
            this.currentGameMode.destroy();
        }
        this.currentGameMode = null;
        this.currentMode = null;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MrLuckyApp();
});
