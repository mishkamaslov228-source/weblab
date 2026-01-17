// Управление настройками игры
const Settings = {
    current: {
        theme: 'default',
        difficulty: 'medium',
        debugMode: false
    },

    init() {
        this.loadSettings();
        this.applyTheme();
    },



    loadSettings() {
        const saved = Storage.getSettings();
        this.current = { ...this.current, ...saved };
    },

    saveSettings() {
        Storage.saveSettings(this.current);
        this.applyTheme(); // применяем тему после сохранени
    },



    applyTheme() {
        document.body.className = '';




        if (this.current.theme !== 'default') {
            document.body.classList.add(`theme-${this.current.theme}`);
        }
    },

    setTheme(theme) {
        this.current.theme = theme;
        this.applyTheme();
    },

    setDifficulty(difficulty) {
        this.current.difficulty = difficulty;
    },



    setDebugMode(enabled) {
        this.current.debugMode = enabled;
    },

    getDifficultyMultiplier() {
        const multipliers = {
            easy: 0.8,
            medium: 1.0,
            hard: 1.3
        };
        return multipliers[this.current.difficulty] || 1.0;
    },






    getTimeLimit() {
        const limits = {
            easy: 300, // 5 минут
            medium: 240, // 4 минуты
            hard: 180 // 3 минуты
        };
        return limits[this.current.difficulty] || 240;
    }
};