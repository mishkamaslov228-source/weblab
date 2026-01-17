// Уровень 2: Определение времени между включениями лампочки
const Level2 = {
    currentRound: 0,
    totalRounds: 4,
    lightBulbs: [],
    targetInterval: 0,
    lastFlashTime: 0,
    flashTimes: [],
    flashTimer: null,
    inputField: null,
    submitButton: null,
    lightContainer: null,

    init() {
        // init больше не запускает уровень напрямую
        // уровень запускается через start() после показа правил
    },




    start() {
        this.currentRound = 0;
        this.startRound();
    },

    restartSublevel() {
        // Перезапускаем текущий подуровень (раунд)
        this.cleanup();
        // Откатываем счетчик раунда, чтобы начать тот же подуровень заново
        this.currentRound--;
        this.startRound();
    },

    startRound() {
        this.currentRound++;





        
        if (this.currentRound > this.totalRounds) {
            GameEngine.completeLevel();
            return;
        }

        // Генерируем случайный интервал от 2 до 6 секунд
        const baseInterval = 2 + Math.random() * 4;
        this.targetInterval = Math.round(baseInterval * 100) / 100; // Округляем до 2 знаков после запятой




        
        this.createGameArea();
        this.startFlashing();
    },

    createGameArea() {
        const gameArea = document.getElementById('gameArea');
        if (!gameArea) return;

        // Определяем количество лампочек в зависимости от подуровня и сложности



        const difficulty = Settings.current.difficulty;
        let bulbCount = 0;
        
        // Подуровень 1: минимальное количество



        if (this.currentRound === 1) {
            bulbCount = 2;



            if (difficulty === 'easy') bulbCount = 2;
            else if (difficulty === 'hard') bulbCount = 3;
        }
        // Подуровень 2: больше лампочек
        else if (this.currentRound === 2) {
            bulbCount = 3;
            if (difficulty === 'easy') bulbCount = 3;
            else if (difficulty === 'hard') bulbCount = 4;
        }
        // Подуровень 3: еще больше
        else if (this.currentRound === 3) {
            bulbCount = 4;
            if (difficulty === 'easy') bulbCount = 4;
            else if (difficulty === 'hard') bulbCount = 5;
        }
        // Подуровень 4 (последний): максимальное количество
        else if (this.currentRound === 4) {
            bulbCount = 5;
            if (difficulty === 'easy') bulbCount = 5;
            else if (difficulty === 'hard') bulbCount = 6;
        }

        gameArea.innerHTML = `
            <div class="level2-container">
                <div class="light-container" id="lightContainer"></div>
                <div class="time-input-container">
                    <label for="timeInput">Время между включениями (секунды):</label>
                    <input type="number" step="0.01" min="0" class="time-input" id="timeInput" placeholder="0.00">
                    <button class="btn btn-primary submit-time-btn" id="submitTimeBtn">Ответить</button>
                </div>
                <div id="roundInfo">Раунд ${this.currentRound} из ${this.totalRounds}</div>
            </div>
        `;

        this.lightContainer = document.getElementById('lightContainer');
        this.inputField = document.getElementById('timeInput');
        this.submitButton = document.getElementById('submitTimeBtn');




        // Создаем лампочки в зависимости от подуровня
        for (let i = 0; i < bulbCount; i++) {
            const bulb = document.createElement('div');
            bulb.className = 'light-bulb off';
            bulb.textContent = '💡';
            bulb.id = `bulb${i}`;
            


            // Добавляем обработчик наведения (одно из требований)
            bulb.addEventListener('mouseenter', () => {
                if (!bulb.classList.contains('on')) {
                    bulb.style.transform = 'scale(1.15)';
                }
            });

            bulb.addEventListener('mouseleave', () => {
                if (!bulb.classList.contains('on')) {
                    bulb.style.transform = 'scale(1)';
                }
            });

            this.lightContainer.appendChild(bulb);
            this.lightBulbs.push(bulb);
        }

        if (this.submitButton) {
            this.submitButton.addEventListener('click', () => this.checkAnswer());
        }

        // Обработка клавиши Enter (одно из требований)
        if (this.inputField) {
            this.inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }
    },

    startFlashing() {
        this.flashTimes = [];
        let flashCount = 0;




        const maxFlashes = 5 + Math.floor(Math.random() * 3); // 5-7 вспышек

        const flash = () => {
            if (flashCount >= maxFlashes) {
                // Останавливаем вспышки, даем время на ответ
                return;
            }

            // Выбираем случайную лампочку
            const randomBulb = this.lightBulbs[Math.floor(Math.random() * this.lightBulbs.length)];
            
            // Включаем лампочку
            randomBulb.classList.add('on');
            randomBulb.classList.remove('off');




            
            const flashTime = Date.now();
            this.flashTimes.push(flashTime);

            // Выключаем через 300-500мс
            setTimeout(() => {
                randomBulb.classList.remove('on');
                randomBulb.classList.add('off');
            }, 300 + Math.random() * 200);

            flashCount++;
            
            // Следующая вспышка через targetInterval
            if (flashCount < maxFlashes) {
                this.flashTimer = setTimeout(flash, this.targetInterval * 1000);
            }
        };

        // Начинаем первую вспышку
        setTimeout(flash, 1000);
    },

    checkAnswer() {
        if (!this.inputField || !this.inputField.value) {
            alert('Пожалуйста, введите время!');
            return;
        }

        const userAnswer = parseFloat(this.inputField.value);





        
        if (isNaN(userAnswer) || userAnswer <= 0) {
            alert('Пожалуйста, введите корректное время!');
            return;
        }

        // Останавливаем вспышки
        if (this.flashTimer) {
            clearTimeout(this.flashTimer);
        }






        // Вычисляем правильный ответ на основе реальных интервалов
        let correctInterval = this.targetInterval;
        if (this.flashTimes.length >= 2) {
            const intervals = [];
            for (let i = 1; i < this.flashTimes.length; i++) {
                intervals.push((this.flashTimes[i] - this.flashTimes[i - 1]) / 1000);
            }
            correctInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        }

        const difference = Math.abs(userAnswer - correctInterval);
        const percentageError = (difference / correctInterval) * 100;

        // Вычисляем баллы
        let points = 0;
        let reason = '';

        if (percentageError <= 5) {
            points = 100;
            reason = 'Идеально!';
        } else if (percentageError <= 10) {
            points = 80;
            reason = 'Отлично!';
        } else if (percentageError <= 20) {
            points = 60;
            reason = 'Хорошо!';
        } else if (percentageError <= 30) {
            points = 40;
            reason = 'Неплохо';
        } else {
            points = Math.max(0, 20 - Math.floor(percentageError / 5));
            reason = 'Можно лучше';
        }

        // Штраф за большую ошибку
        if (percentageError > 50) {
            const penalty = Math.floor(percentageError / 10);
            GameEngine.subtractScore(penalty, 'Штраф за неточность');
        } else {
            GameEngine.addScore(points, reason);
        }

        // Показываем результат
        const roundInfo = document.getElementById('roundInfo');
        if (roundInfo) {
            roundInfo.textContent = `Правильный ответ: ${correctInterval.toFixed(2)}с. Ваш ответ: ${userAnswer.toFixed(2)}с. Ошибка: ${difference.toFixed(2)}с`;
            roundInfo.style.color = percentageError <= 20 ? '#2ecc71' : '#e74c3c';
            roundInfo.style.fontWeight = 'bold';
        }

        // Переход к следующему раунду
        setTimeout(() => {
            this.cleanup();
            this.startRound();
        }, 3000);
    },

    cleanup() {
        if (this.flashTimer) {
            clearTimeout(this.flashTimer);
        }
        this.lightBulbs = [];
        this.flashTimes = [];
    },

    destroy() {
        this.cleanup();
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            gameArea.innerHTML = '';
        }
    }
};
