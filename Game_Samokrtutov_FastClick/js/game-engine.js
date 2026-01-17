// Игровой движок
const GameEngine = {
    currentLevel: 1,
    score: 0,
    timeRemaining: 0,
    gameTimer: null,
    isPaused: false,
    playerName: '',
    levelScore: 0,
    startTime: null,
    completedLevels: [],



    init(playerName) {
        this.playerName = playerName;
        this.currentLevel = 1;
        this.score = 0;
        this.levelScore = 0;
        this.completedLevels = [];
        this.startTime = Date.now();
        this.timeRemaining = Settings.getTimeLimit();
        this.updateUI();
        this.startTimer();
    },

    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }


        this.gameTimer = setInterval(() => {
            if (!this.isPaused && this.timeRemaining > 0) {
                this.timeRemaining--;
                this.updateTimer();
                if (this.timeRemaining === 0) {
                    this.endGame('time');
                }
            }
        }, 1000);
    },

    pause() {
        this.isPaused = true;
    },

    resume() {
        this.isPaused = false;
    },

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    },

    updateTimer() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timerElement = document.getElementById('gameTimer');
        if (timerElement) {
            timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    },

    addScore(points, reason = '') {
        const multiplier = Settings.getDifficultyMultiplier();
        const adjustedPoints = Math.round(points * multiplier);




        this.score += adjustedPoints;
        this.levelScore += adjustedPoints;
        this.updateScore();
        this.showScoreFeedback(adjustedPoints, reason);
        return adjustedPoints;
    },

    subtractScore(points, reason = '') {
        const multiplier = Settings.getDifficultyMultiplier();
        const adjustedPoints = Math.round(points * multiplier);
        this.score = Math.max(0, this.score - adjustedPoints);
        this.levelScore = Math.max(0, this.levelScore - adjustedPoints);
        this.updateScore();
        this.showScoreFeedback(-adjustedPoints, reason);
        return adjustedPoints;
    },

    updateScore() {
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    },

    updateUI() {
        const playerElement = document.getElementById('currentPlayer');
        const levelElement = document.getElementById('currentLevel');






        
        if (playerElement) playerElement.textContent = this.playerName;
        if (levelElement) levelElement.textContent = this.currentLevel;
        this.updateScore();
        this.updateTimer();
    },

    showScoreFeedback(points, reason) {
        const feedback = document.createElement('div');
        feedback.className = `score-feedback ${points > 0 ? 'positive' : 'negative'}`;
        feedback.textContent = `${points > 0 ? '+' : ''}${points} ${reason}`;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    },

    completeLevel() {
        this.completedLevels.push(this.currentLevel);
        this.isLevelComplete = true; // Отмечаем что уровень завершен
        // НЕ останавливаем таймер при завершении уровня, только при окончаниии игры
        this.showLevelCompleteModal();
    },
    



    isLevelComplete: false, // Флаг завершения уровня

    nextLevel() {
        this.isLevelComplete = false; // Сбрасываем флаг при переходе на следующий уровень
        if (this.currentLevel < 3) {
            this.currentLevel++;
            this.levelScore = 0;
            this.updateUI();
            // Возобновляем таймер при переходе на следующий уровень
            if (!this.gameTimer) {
                this.startTimer();
            }
            return true;
        } else {
            this.endGame('complete');
            return false;
        }
    },

    showLevelCompleteModal() {
        const modal = document.getElementById('levelCompleteModal');
        const levelScoreEl = document.getElementById('levelScore');
        const totalScoreEl = document.getElementById('totalScore');
        
        if (levelScoreEl) levelScoreEl.textContent = this.levelScore;
        if (totalScoreEl) totalScoreEl.textContent = this.score;
        if (modal) {
            modal.classList.add('active');
            // Убеждаемся что таймер продолжает работать даже при открытом модальном окне
            // Таймер должен работать в фоне
        }
    },

    endGame(reason) {
        this.stopTimer();
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);




        // Сохраняем результат
        Storage.saveRating({
            name: this.playerName,
            score: this.score,
            levels: this.completedLevels.length,
            time: gameTime,
            difficulty: Settings.current.difficulty
        });

        const modal = document.getElementById('gameOverModal');
        const finalScoreEl = document.getElementById('finalScore');
        const finalTimeEl = document.getElementById('finalTime');
        
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (finalTimeEl) {
            const minutes = Math.floor(gameTime / 60);
            const seconds = gameTime % 60;
            finalTimeEl.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
        if (modal) modal.classList.add('active');
    },

    reset() {
        this.stopTimer();
        this.currentLevel = 1;
        this.score = 0;
        this.levelScore = 0;
        this.completedLevels = [];
        this.isPaused = false;
        this.isLevelComplete = false;
    }
};
