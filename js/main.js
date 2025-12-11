// ==========================================
// MAIN APPLICATION ENTRY POINT
// ==========================================

import AudioManager from './modules/audioManager.js';
import UIManager from './modules/uiManager.js';
import BackgroundAnimation from './modules/background.js';
import JackpotManager from './modules/jackpotManager.js';
import RaceMode from './modules/raceMode.js';
import CompetitiveMode from './modules/competitiveMode.js';
import RitualMode from './modules/ritualMode.js';
import FortuneWheelMode from './modules/fortuneWheelMode.js';

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
                
                // Race mode and new modes go directly without difficulty selection (uses 'easy' by default)
                if (mode === 'race' || mode === 'ritual' || mode === 'fortuneWheel') {
                    this.startGame(mode, 'easy');
                } else {
                    this.ui.showScreen('difficulty');
                }
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
        const screenMap = {
            'race': 'race',
            'competitive': 'competitive',
            'ritual': 'ritual',
            'fortuneWheel': 'fortuneWheel'
        };
        this.ui.showScreen(screenMap[mode] || mode);

        // Initialize game mode - pass jackpot manager to all modes
        // Always create new instance to ensure fresh state (especially for ritual)
        switch (mode) {
            case 'race':
                this.currentGameMode = new RaceMode(this.audio, this.ui, difficulty, this.jackpot);
                break;
            case 'competitive':
                this.currentGameMode = new CompetitiveMode(this.audio, this.ui, difficulty, this.jackpot);
                break;
            case 'ritual':
                this.currentGameMode = new RitualMode(this.audio, this.ui, this.jackpot);
                break;
            case 'fortuneWheel':
                this.currentGameMode = new FortuneWheelMode(this.audio, this.ui, this.jackpot);
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
