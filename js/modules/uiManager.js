// ==========================================
// UI MANAGER MODULE
// ==========================================

class UIManager {
    constructor() {
        this.currentScreen = null;
        this.screens = {
            welcome: document.getElementById('welcomeScreen'),
            main: document.getElementById('mainMenu'),
            difficulty: document.getElementById('difficultyScreen'),
            individual: document.getElementById('individualScreen'),
            race: document.getElementById('raceScreen'),
            competitive: document.getElementById('competitiveScreen')
        };
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    showMessage(elementId, text, isSuccess = true) {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = 'message ' + (isSuccess ? 'success' : 'fail');
        }
    }

    clearMessage(elementId) {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = '';
        }
    }

    updateStat(elementId, value) {
        const statEl = document.getElementById(elementId);
        if (statEl) {
            statEl.textContent = value;
        }
    }
}

export default UIManager;
