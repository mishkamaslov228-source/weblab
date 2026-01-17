// Уровень 1: Нажатие кнопки точно через n секунд с отвлекающими элементами
const Level1 = {
    targetTime: 0,
    startTime: 0,
    buttonAppearTime: 0,
    currentRound: 0,
    totalRounds: 4,
    targetButton: null,
    distractionContainer: null,
    roundTimer: null,
    buttonTimer: null,
    distractions: [],
    keyHandler: null,

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
            this.cleanup();
            GameEngine.completeLevel();
            return;
        }

        // Генерируем случайное время появления кнопки от 2 до 6 секунд
        // В зависимости от сложностии изменяем диапазон
        const difficulty = Settings.current.difficulty;



        let minTime = 2;
        let maxTime = 6;
        
        if (difficulty === 'easy') {
            minTime = 3;
            maxTime = 7; // Больше времени на легком уровне
        } else if (difficulty === 'hard') {
            minTime = 1.5;
            maxTime = 4; // Меньше времени на сложном уровне
        }
        
        this.buttonAppearTime = minTime + Math.random() * (maxTime - minTime);
        this.startTime = Date.now();




        
        this.createGameArea();
        this.scheduleButtonAppearance();
    },

    createGameArea() {
        const gameArea = document.getElementById('gameArea');
        if (!gameArea) return;

        gameArea.innerHTML = `
            <div class="level1-container">
                <div class="waiting-message" id="waitingMessage">Ожидайте появления кнопки...</div>
                <div class="distraction-container" id="distractionContainer"></div>
            </div>
        `;

        this.distractionContainer = document.getElementById('distractionContainer');
        this.createDistractions();




        
        // Добавляем обработчики клавиатуры
        this.setupKeyboardHandlers();
    },

    createDistractions() {
        const emojis = ['🎈', '🎉', '⭐', '💫', '🎊', '✨', '🌟', '🎁', '🎯', '🎪', '🎨', '🎭'];
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#16a085'];
        
        const difficulty = Settings.current.difficulty;
        
        // Базовое количество элементов зависит от подуровня и сложности



        let baseCount = 0;
        let speedMultiplier = 1;
        
            // Подуровень 1: небольшое количество


        if (this.currentRound === 1) {
            baseCount = 3;
            speedMultiplier = 1;



            if (difficulty === 'easy') baseCount = 2;
            else if (difficulty === 'hard') baseCount = 4;
        }
        // Подуровень 2: больше элементов и быстрее
        else if (this.currentRound === 2) {
            baseCount = 6;
            speedMultiplier = 1.5;
            if (difficulty === 'easy') baseCount = 4;
            else if (difficulty === 'hard') baseCount = 8;
        }
        // Подуровень 3: еще больше и еще быстрее
        else if (this.currentRound === 3) {
            baseCount = 9;
            speedMultiplier = 2;
            if (difficulty === 'easy') baseCount = 6;
            else if (difficulty === 'hard') baseCount = 12;
        }
        // Подуровень 4 (последний): максимальное количество, максимальная скорость, прямоугольники как кнопка




        else if (this.currentRound === 4) {
            baseCount = 12;
            speedMultiplier = 2.5;
            if (difficulty === 'easy') baseCount = 8;
            else if (difficulty === 'hard') baseCount = 16;
        }
        
        // Добавляем немного случайности
        const count = baseCount + Math.floor(Math.random() * 2);




        
        for (let i = 0; i < count; i++) {
            const distraction = document.createElement('div');
            
            // На последнем подуровне делаем элементы прямоугольными как кнопка
            if (this.currentRound === 4) {
                distraction.className = 'distraction-item distraction-button-like';
                distraction.style.width = '250px';
                distraction.style.height = '80px';
                distraction.style.borderRadius = '12px';
                distraction.style.padding = '15px 30px';
                distraction.style.display = 'flex';
                distraction.style.alignItems = 'center';
                distraction.style.justifyContent = 'center';
                distraction.textContent = emojis[Math.floor(Math.random() * emojis.length)] + ' ' + 
                                        emojis[Math.floor(Math.random() * emojis.length)];
            } else {
                distraction.className = 'distraction-item';
                distraction.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            }
            
            distraction.style.background = colors[Math.floor(Math.random() * colors.length)];
            distraction.style.left = `${Math.random() * 80 + 10}%`;
            distraction.style.top = `${Math.random() * 80 + 10}%`;






            
            // Скорость анимации зависит от подуровня
            const animationDuration = 3 / speedMultiplier;
            distraction.style.animationDuration = `${animationDuration}s`;
            distraction.style.animationDelay = `${Math.random() * 2}s`;
            
            // Добавляем обработчик двойного клика (одно из требований)
            distraction.addEventListener('dblclick', () => {
                this.handleDistractionClick(distraction);
            });

            // Добавляем обработчик наведения (одно из требований)
            distraction.addEventListener('mouseenter', () => {
                if (this.currentRound !== 4) {
                    distraction.style.transform = 'scale(1.3) rotate(360deg)';
                } else {
                    distraction.style.transform = 'scale(1.1)';
                }
            });

            distraction.addEventListener('mouseleave', () => {
                distraction.style.transform = 'scale(1) rotate(0deg)';
            });

            this.distractionContainer.appendChild(distraction);
            this.distractions.push(distraction);
        }
    },

    scheduleButtonAppearance() {
        // Планируем появление кнопки через случайное время
        const appearDelay = this.buttonAppearTime * 1000; // buttonAppearTime уже в секундах
        
        this.buttonTimer = setTimeout(() => {
            this.showButton();
        }, appearDelay);
    },

    showButton() {
        // Скрываем сообщение ожидания
        const waitingMessage = document.getElementById('waitingMessage');




        if (waitingMessage) {
            waitingMessage.style.display = 'none';
        }




        // Создаем кнопку
        this.targetButton = document.createElement('button');
        this.targetButton.className = 'target-button floating-button';
        this.targetButton.textContent = 'НАЖМИ СЕЙЧАС!';
        this.targetButton.id = 'targetButton';
        
        // Случайная начальная позиция
        const container = document.querySelector('.level1-container');
        if (container) {
            const containerRect = container.getBoundingClientRect();
            // Учитываем размер кнопки
            const buttonWidth = 250;
            const buttonHeight = 80;
            const maxX = Math.max(50, containerRect.width - buttonWidth - 50);
            const maxY = Math.max(100, containerRect.height - buttonHeight - 50);
            
            this.targetButton.style.position = 'absolute';
            this.targetButton.style.left = `${50 + Math.random() * (maxX - 50)}px`;
            this.targetButton.style.top = `${100 + Math.random() * (maxY - 100)}px`;
            this.targetButton.style.width = `${buttonWidth}px`;
            this.targetButton.style.padding = '15px 30px';
        }

        // Добавляем в контейнер отвлекающих элементов, чтобы она тоже плавала
        if (this.distractionContainer) {
            this.distractionContainer.appendChild(this.targetButton);
        } else if (container) {
            // Если контейнера нет, добавляем в level1-container
            container.appendChild(this.targetButton);
        }

        // Запоминаем время появления кнопки для подсчета скорости реакции
        this.buttonAppearTime = Date.now();
        
        // Добавляем обработчики клика - любая кнопка мыши, тачпад, трекпад (после добавления в DOM)
        // Обработчики добавляются сразу, так как кнопка уже в DOM
        const handleMouseClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.targetButton && this.targetButton.parentNode) {
                this.handleButtonClick();
            }
        };
        
        // Обычные события мыши
        this.targetButton.addEventListener('click', handleMouseClick);
        this.targetButton.addEventListener('mousedown', handleMouseClick);
        
        // Pointer Events для поддержки мыши, тачпада, трекпада, пера и т.д.
        this.targetButton.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.targetButton && this.targetButton.parentNode) {
                this.handleButtonClick();
            }
        });
        
        // Также добавляем обработчик на touchstart для мобильных устройств и тачпадов
        this.targetButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.targetButton && this.targetButton.parentNode) {
                this.handleButtonClick();
            }
        });
        
        // Для максимальной совместимости добавляем обработчик на contextmenu (правая кнопка мыши/тачпад)
        this.targetButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.targetButton && this.targetButton.parentNode) {
                this.handleButtonClick();
            }
        });
    },

    setupKeyboardHandlers() {
        // Удаляем предыдущий обработчик если есть
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }

        this.keyHandler = (e) => {
            // Проверяем, что кнопка появилась
            if (!this.targetButton || !this.targetButton.parentNode) {
                return;
            }


            // Обрабатываем любое нажатие клавиши (кроме специальных клавиш)
            // Исключаем только функциональные клавиши типа F1-F12, Escape и т.д.
            const excludedKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Escape'];
            if (!excludedKeys.includes(e.key) && !e.key.startsWith('F')) {
                e.preventDefault();
                this.handleButtonClick();
            }
        };

        document.addEventListener('keydown', this.keyHandler);
    },

    handleDistractionClick(distraction) {
        // При двойном клике элемент исчезает, но это отвлекает от основной задачи
        distraction.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            if (distraction.parentNode) {
                distraction.remove();
            }
        }, 500);
    },

    handleButtonClick() {
        // Проверяем наличие кнопки и времени появления
        if (!this.targetButton || !this.buttonAppearTime) {
            return;
        }
        
        // Проверяем что кнопка существует в DOM
        if (!this.targetButton.parentNode) {
            return;
        }

        const clickTime = Date.now();
        const reactionTime = (clickTime - this.buttonAppearTime) / 1000; // Время реакции в секундах






        // Очищаем таймеры


        if (this.buttonTimer) {
            clearTimeout(this.buttonTimer);
            this.buttonTimer = null;
        }

        // Вычисляем баллы на основе скорости реакции
        // Требования зависят от уровня сложности


        const difficulty = Settings.current.difficulty;
        let points = 0;
        let reason = '';
        let penaltyThreshold = 2.0;

        if (difficulty === 'easy') {
            // Легкий уровень - более мягкие требования
            if (reactionTime <= 0.3) {
                points = 100;
                reason = 'Молния!';
            } else if (reactionTime <= 0.5) {
                points = 80;
                reason = 'Отлично!';
            } else if (reactionTime <= 0.7) {
                points = 60;
                reason = 'Хорошо!';
            } else if (reactionTime <= 1.0) {
                points = 40;
                reason = 'Неплохо';
            } else if (reactionTime <= 1.5) {
                points = 25;
                reason = 'Можно быстрее';
            } else if (reactionTime <= 2.0) {
                points = 10;
                reason = 'Медленно';
            } else {
                points = Math.max(0, 5 - Math.floor(reactionTime));
                reason = 'Очень медленно';
            }
            penaltyThreshold = 2.5; // Штраф начинается с 2.5 секунд
        } else if (difficulty === 'hard') {
            // Сложный уровень - очень строгие требования
            if (reactionTime <= 0.15) {
                points = 100;
                reason = 'Молния!';
            } else if (reactionTime <= 0.25) {
                points = 80;
                reason = 'Отлично!';
            } else if (reactionTime <= 0.4) {
                points = 60;
                reason = 'Хорошо!';
            } else if (reactionTime <= 0.6) {
                points = 40;
                reason = 'Неплохо';
            } else if (reactionTime <= 0.8) {
                points = 25;
                reason = 'Можно быстрее';
            } else if (reactionTime <= 1.2) {
                points = 10;
                reason = 'Медленно';
            } else {
                points = Math.max(0, 5 - Math.floor(reactionTime));
                reason = 'Очень медленно';
            }
            penaltyThreshold = 1.5; // Штраф начинается с 1.5 секунд
        } else {
            // Средний уровень - стандартные требования
            if (reactionTime <= 0.2) {
                points = 100;
                reason = 'Молния!';
            } else if (reactionTime <= 0.35) {
                points = 80;
                reason = 'Отлично!';
            } else if (reactionTime <= 0.5) {
                points = 60;
                reason = 'Хорошо!';
            } else if (reactionTime <= 0.7) {
                points = 40;
                reason = 'Неплохо';
            } else if (reactionTime <= 1.0) {
                points = 25;
                reason = 'Можно быстрее';
            } else if (reactionTime <= 1.5) {
                points = 10;
                reason = 'Медленно';
            } else {
                points = Math.max(0, 5 - Math.floor(reactionTime));
                reason = 'Очень медленно';
            }
            penaltyThreshold = 2.0; // Штраф начинается с 2.0 секунд
        }
        
        // Штраф за очень медленную реакцию (зависит от сложности)
        if (reactionTime > penaltyThreshold) {
            const penaltyMultiplier = difficulty === 'hard' ? 8 : (difficulty === 'easy' ? 3 : 5);
            const penalty = Math.floor((reactionTime - penaltyThreshold) * penaltyMultiplier);
            GameEngine.subtractScore(penalty, 'Штраф за медлительность');
        }

        // Начисляем баллы
        GameEngine.addScore(points, reason);

        // Показываем результат
        const waitingMessage = document.getElementById('waitingMessage');
        if (waitingMessage) {
            waitingMessage.style.display = 'block';
            waitingMessage.textContent = `Время реакции: ${reactionTime.toFixed(2)}с. ${reason}`;
            
            // Цветовая индикация зависит от сложности
            let greenThreshold = 0.35;
            let yellowThreshold = 0.7;
            
            if (difficulty === 'easy') {
                greenThreshold = 0.5;
                yellowThreshold = 1.0;
            } else if (difficulty === 'hard') {
                greenThreshold = 0.25;
                yellowThreshold = 0.6;
            }
            
            if (reactionTime <= greenThreshold) {
                waitingMessage.style.color = '#2ecc71';
            } else if (reactionTime <= yellowThreshold) {
                waitingMessage.style.color = '#f39c12';
            } else {
                waitingMessage.style.color = '#e74c3c';
            }
        }

        // Удаляем кнопку
        if (this.targetButton && this.targetButton.parentNode) {
            this.targetButton.remove();
            this.targetButton = null;
        }

        // Переход к следующему раунду



        setTimeout(() => {
            this.cleanup();
            this.startRound();
        }, 2000);
    },

    cleanup() {
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
        }
        if (this.buttonTimer) {
            clearTimeout(this.buttonTimer);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        this.distractions = [];
        if (this.targetButton && this.targetButton.parentNode) {
            this.targetButton.remove();
            this.targetButton = null;
        }
    },

    destroy() {
        this.cleanup();
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            gameArea.innerHTML = '';
        }
    }
};
