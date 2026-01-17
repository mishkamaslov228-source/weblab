// Страница игры
let currentLevelInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    Settings.init();

    // Загружаем имя игрока
    const playerName = Storage.load('currentPlayer', 'Гость');




    // Инициализируем игру
    GameEngine.init(playerName);

    // Элементы управления


    const pauseBtn = document.getElementById('pauseBtn');
    const exitBtn = document.getElementById('exitBtn');
    const pauseModal = document.getElementById('pauseModal');
    const resumeBtn = document.getElementById('resumeBtn');
    const exitGameBtn = document.getElementById('exitGameBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const toRatingBtn = document.getElementById('toRatingBtn');
    const pauseFromCompleteBtn = document.getElementById('pauseFromCompleteBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const toRatingFromGameBtn = document.getElementById('toRatingFromGameBtn');
    const levelCompleteModal = document.getElementById('levelCompleteModal');
    const gameOverModal = document.getElementById('gameOverModal');

    // Пауза


    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            // Таймер должен продолжать работать, только игровые действия на паузе
            // Но по требованию, пауза останавливает таймер
            GameEngine.pause();
            if (pauseModal) {
                pauseModal.classList.add('active');
            }
        });
    }

    // Продолжить
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (pauseModal) {
                pauseModal.classList.remove('active');
            }
            
            // Если уровень был завершен до паузы, показываем снова модальное окно завершения


            if (GameEngine.isLevelComplete) {
                GameEngine.resume();
                GameEngine.showLevelCompleteModal();
            } else {
                // Если это пауза во время игры - перезапускаем текущий подуровень
                GameEngine.resume();
                restartCurrentSublevel();
            }
        });
    }

    // Функция перезапуска текущего подуровня


    function restartCurrentSublevel() {
        if (!currentLevelInstance) return;






        // Для каждого уровня вызываем метод перезапуска подуровня
        if (currentLevelInstance.restartSublevel) {
            currentLevelInstance.restartSublevel();
        } else {
            // Если метод не реализован, просто перезапускаем уровень
            const level = GameEngine.currentLevel;
            startLevel(level);
        }
    }

    // Выход из игры
    if (exitBtn || exitGameBtn) {
        const exitHandler = () => {
            if (confirm('Вы уверены, что хотите выйти? Прогресс не будет сохранен.')) {
                GameEngine.reset();
                window.location.href = 'index.html';
            }
        };
        
        if (exitBtn) exitBtn.addEventListener('click', exitHandler);
        if (exitGameBtn) exitGameBtn.addEventListener('click', exitHandler);
    }

    // Пауза из модального окна завершения уровня
    if (pauseFromCompleteBtn) {
        pauseFromCompleteBtn.addEventListener('click', () => {
            GameEngine.pause();
            if (levelCompleteModal) {
                levelCompleteModal.classList.remove('active');
            }
            if (pauseModal) {
                pauseModal.classList.add('active');
            }
        });
    }

    // Следующий уровень
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            if (levelCompleteModal) {
                levelCompleteModal.classList.remove('active');
            }
            
            // При переходе на следующий уровень показываем правила (таймер будет приостановлен в showLevelRules)
            if (GameEngine.nextLevel()) {
                // Небольшая задержка перед показом правил следующего уровня
                setTimeout(() => {
                    startLevel(GameEngine.currentLevel);
                }, 300);
            }
        });
    }

    // К рейтингу из модального окна уровня
    if (toRatingBtn) {
        toRatingBtn.addEventListener('click', () => {
            GameEngine.reset();
            window.location.href = 'rating.html';
        });
    }

    // Играть снова
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            if (gameOverModal) {
                gameOverModal.classList.remove('active');
            }
            GameEngine.reset();
            GameEngine.init(playerName);
            startLevel(1);
        });
    }

    // К рейтингу из финального модального окна
    if (toRatingFromGameBtn) {
        toRatingFromGameBtn.addEventListener('click', () => {
            GameEngine.reset();
            window.location.href = 'rating.html';
        });
    }

    // Закрытие модальных окон по клику вне (только для паузы)
    if (pauseModal) {
        pauseModal.addEventListener('click', (e) => {
            if (e.target === pauseModal) {
                pauseModal.classList.remove('active');
            }
        });
    }
    
    // Модальные окна завершения уровня и игры НЕ закрываются по клику вне
    // Они закрываются только через кнопки внутри них

    // Функция показа правил и запуска уровня



    function startLevel(level) {
        // Очищаем предыдущий уровень


        if (currentLevelInstance && currentLevelInstance.destroy) {
            currentLevelInstance.destroy();
        }

        // Показываем правила уровня в модальном окне
        showLevelRules(level);
    }

    // Функция показа правил уровня
    function showLevelRules(level) {
        const rulesModal = document.getElementById('levelRulesModal');
        const rulesTitle = document.getElementById('levelRulesTitle');
        const rulesText = document.getElementById('levelRulesText');
        const startLevelBtn = document.getElementById('startLevelBtn');

        if (!rulesModal || !rulesTitle || !rulesText || !startLevelBtn) return;


        // Приостанавливаем таймер во время показа правил
        GameEngine.pause();




        // Получаем правила для уровня


        let title = '';
        let rules = '';

        switch(level) {
            case 1:
                title = 'Уровень 1: Реакция';
                rules = `
                    <strong>Задача:</strong> Как можно быстрее нажать на кнопку "НАЖМИ СЕЙЧАС!"<br><br>
                    • Кнопка появится через 2-6 секунд (зависит от сложности)<br>
                    • Кнопка плавает по экрану вместе с отвлекающими элементами<br>
                    • Можно нажимать любой кнопкой мыши, пробелом или Enter<br><br>
                    <em>Чем быстрее реакция, тем больше баллов!</em>
                `;
                break;
            case 2:
                title = 'Уровень 2: Определение интервала';
                rules = `
                    <strong>Задача:</strong> Определить время между включениями лампочек (в секундах)<br><br>
                    • Внимательно наблюдайте за ритмом вспышек<br>
                    • Введите время в поле и нажмите "Ответить" или Enter<br><br>
                    <em>Чем точнее ответ, тем больше баллов!</em>
                `;
                break;
            case 3:
                title = 'Уровень 3: Координация и точность';
                rules = `
                    <strong>Задача:</strong> Доставить все целевые объекты в целевую зону (справа вверху)<br><br>
                    • <strong>Кликните на целевой объект для выбора</strong><br>
                    • После выбора управляйте WASD (W/S/A/D) или мышью<br>
                    • Можно перетаскивать любые объекты мышью<br>
                    • Двойной клик ускоряет движение<br><br>
                    <em>Доберитесь до цели быстрее!</em>
                `;
                break;
        }

        rulesTitle.textContent = title;
        rulesText.innerHTML = rules;






        
        // Удаляем старый обработчик и добавляем новый
        const newStartBtn = startLevelBtn.cloneNode(true);
        startLevelBtn.parentNode.replaceChild(newStartBtn, startLevelBtn);

        newStartBtn.addEventListener('click', () => {
            rulesModal.classList.remove('active');
            // Возобновляем таймер при начале уровня
            GameEngine.resume();
            // Запускаем уровень после закрытия модального окна
            setTimeout(() => {
                switch(level) {
                    case 1:
                        currentLevelInstance = Level1;
                        Level1.start();
                        break;
                    case 2:
                        currentLevelInstance = Level2;
                        Level2.start();
                        break;
                    case 3:
                        currentLevelInstance = Level3;
                        Level3.start();
                        break;
                }
                // Убеждаемся, что таймер работает
                if (!GameEngine.isPaused && GameEngine.timeRemaining > 0) {
                    if (!GameEngine.gameTimer) {
                        GameEngine.startTimer();
                    }
                }
            }, 300);
        });

        // Показываем модальное окно
        rulesModal.classList.add('active');
    }

    // Режим отладки - возможность выбрать уровень
    if (Settings.current.debugMode) {
        const debugPanel = document.createElement('div');
        debugPanel.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 2000; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 8px;';
        debugPanel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold;">Режим отладки</div>
            <button id="debugLevel1" style="margin: 5px; padding: 5px 10px;">Уровень 1</button>
            <button id="debugLevel2" style="margin: 5px; padding: 5px 10px;">Уровень 2</button>
            <button id="debugLevel3" style="margin: 5px; padding: 5px 10px;">Уровень 3</button>
        `;
        document.body.appendChild(debugPanel);

        document.getElementById('debugLevel1').addEventListener('click', () => {
            GameEngine.currentLevel = 1;
            GameEngine.updateUI();
            startLevel(1);
        });
        document.getElementById('debugLevel2').addEventListener('click', () => {
            GameEngine.currentLevel = 2;
            GameEngine.updateUI();
            startLevel(2);
        });
        document.getElementById('debugLevel3').addEventListener('click', () => {
            GameEngine.currentLevel = 3;
            GameEngine.updateUI();
            startLevel(3);
        });
    }

    // Закрытие модального окна правил по клику вне
    const levelRulesModal = document.getElementById('levelRulesModal');
    if (levelRulesModal) {
        levelRulesModal.addEventListener('click', (e) => {
            if (e.target === levelRulesModal) {
                // Не закрываем по клику вне, только по кнопке
            }
        });
    }

    // Запускаем первый уровень
    startLevel(1);
});
