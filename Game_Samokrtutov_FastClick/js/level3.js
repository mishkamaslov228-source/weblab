// Уровень 3: Координация действий с движущимися объектами
const Level3 = {
    currentRound: 0,
    totalRounds: 4,
    movingObjects: [],
    targetZone: null,
    targetObject: null,
    selectedObject: null, // Выбранный объект для управления WASD
    animationFrames: [],
    objectsArea: null,
    targetCount: 0,
    caughtCount: 0,
    keyPressHandler: null,
    roundTimer: null,
    timeRemaining: 0,
    targetColor: null,
    targetEmoji: null,
    isLastRound: false,

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

        // Определяем время для подуровня (25-20-15-10 секунд)
        const timeByRound = {
            1: 25,
            2: 20,
            3: 15,
            4: 10
        };
        this.timeRemaining = timeByRound[this.currentRound] || 10;
        this.caughtCount = 0;




        this.isLastRound = (this.currentRound === this.totalRounds);

        // Определяем количество объектов в зависимости от подуровня и сложности



        const difficulty = Settings.current.difficulty;
        let objectCount = 0;
        
        if (this.currentRound === 1) {
            objectCount = 6;
            if (difficulty === 'easy') objectCount = 5;
            else if (difficulty === 'hard') objectCount = 8;
        } else if (this.currentRound === 2) {
            objectCount = 8;
            if (difficulty === 'easy') objectCount = 6;
            else if (difficulty === 'hard') objectCount = 10;
        } else if (this.currentRound === 3) {
            objectCount = 10;
            if (difficulty === 'easy') objectCount = 8;
            else if (difficulty === 'hard') objectCount = 12;
        } else if (this.currentRound === 4) {
            objectCount = 12;
            if (difficulty === 'easy') objectCount = 10;
            else if (difficulty === 'hard') objectCount = 15;
        }

        // На последнем подуровне нужно перенести 3 элемента, на обычных - в зависимости от подуровня




        if (this.isLastRound) {
            this.targetCount = 3; // На последнем подуровне 3 элемента с целевым эмодзи


        } else {
            this.targetCount = 2 + Math.floor(this.currentRound / 2);
        }

        // Устанавливаем целевой цвет и эмодзи до создания области игры



        const targetColors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6'];
        this.targetColor = targetColors[(this.currentRound - 1) % targetColors.length];
        
        const emojis = ['🎯', '🎪', '🎨', '🎭', '🎬', '🎮', '🎲', '🎸', '🎤', '🎧', '🎼', '🎵'];
        if (this.isLastRound) {
            this.targetEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        } else {
            this.targetEmoji = null;
        }

        this.createGameArea();
        this.createObjects();
        this.startRoundTimer();






        
        // Добавляем обработчик клавиатуры после создания объектов
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
        this.keyPressHandler = (e) => this.handleKeyPress(e);
        document.addEventListener('keydown', this.keyPressHandler);
        
        this.startAnimations();
    },

    createGameArea() {
        const gameArea = document.getElementById('gameArea');
        if (!gameArea) return;

        // Определяем текст для целевой зоны
        let targetText = 'Цель';
        if (this.isLastRound) {
            targetText = `Найти: ${this.targetEmoji} (${this.targetCount} шт.)`;
        } else {
            targetText = `Цвет: ${this.getColorName(this.targetColor)}`;
        }

        // Формируем текст подсказки
        let hintText = '';
        if (this.isLastRound) {
            hintText = `Найдите и перенесите ${this.targetCount} объекта с эмодзи ${this.targetEmoji} в целевую зону!`;
        } else {
            const colorName = this.getColorName(this.targetColor);
            hintText = `Найдите и перенесите объекты ${colorName.toLowerCase()} цвета в целевую зону!`;
        }

        gameArea.innerHTML = `
            <div class="level3-container">
                <div class="level3-hint" id="level3Hint">
                    <strong>Задача:</strong> ${hintText}
                </div>
                <div class="level3-info">
                    <div class="round-timer-display" id="roundTimerDisplay">Время: ${this.timeRemaining}с</div>
                    <div id="roundProgress">Поймано: 0 / ${this.targetCount}</div>
                </div>
                <div class="moving-objects-area" id="objectsArea">
                    <div class="target-zone" id="targetZone">${targetText}</div>
                </div>
            </div>
        `;

        this.objectsArea = document.getElementById('objectsArea');
        this.targetZone = document.getElementById('targetZone');






        // Позиционируем целевую зону
        if (this.targetZone) {
            const areaRect = this.objectsArea.getBoundingClientRect();
            const zoneSize = 120;
            this.targetZone.style.left = `${areaRect.width - zoneSize - 20}px`;
            this.targetZone.style.top = `${20}px`;
            this.targetZone.style.width = `${zoneSize}px`;
            this.targetZone.style.height = `${zoneSize}px`;
            this.targetZone.style.fontSize = '16px';
            this.targetZone.style.textAlign = 'center';
            this.targetZone.style.padding = '10px';
            this.targetZone.style.boxSizing = 'border-box';
        }

        // Обработка клавиатуры (одно из требований) - добавляем после создания объектов
        // Будет добавлено после createObjects
    },

    getColorName(color) {
        const colorNames = {
            '#e74c3c': 'Красный',
            '#3498db': 'Синий',
            '#f39c12': 'Оранжевый',
            '#9b59b6': 'Фиолетовый',
            '#2ecc71': 'Зеленый'
        };
        return colorNames[color] || 'Цвет';
    },

    startRoundTimer() {
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
        }

        const timerDisplay = document.getElementById('roundTimerDisplay');
        
        this.roundTimer = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                if (timerDisplay) {
                    timerDisplay.textContent = `Время: ${this.timeRemaining}с`;
                    
                    // Изменяем цвет при приближении к концу
                    if (this.timeRemaining <= 5) {
                        timerDisplay.style.color = '#e74c3c';
                        timerDisplay.style.fontWeight = 'bold';
                    } else if (this.timeRemaining <= 10) {
                        timerDisplay.style.color = '#f39c12';
                    }
                }
            } else {
                // Время вышло
                this.timeUp();
            }
        }, 1000);
    },

    timeUp() {
        if (this.roundTimer) {
            clearInterval(this.roundTimer);
            this.roundTimer = null;
        }

        // Показываем сообщение о том, что не успели
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            const message = document.createElement('div');
            message.className = 'time-up-message';
            message.innerHTML = `
                <h2>Время вышло!</h2>
                <p>Вы не успели перенести все необходимые элементы</p>
                <p>Подуровень начинается заново</p>
            `;
            document.body.appendChild(message);

            setTimeout(() => {
                message.remove();
                // Перезапускаем подуровень
                this.cleanup();
                this.startRound();
            }, 3000);
        }
    },

    createObjects() {
        const emojis = ['🎯', '🎪', '🎨', '🎭', '🎬', '🎮', '🎲', '🎸', '🎤', '🎧', '🎼', '🎵'];
        // Исключаем зеленый из цветов обычных объектов
        const colors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#16a085', '#d35400'];
        
        // targetColor и targetEmoji уже установлены в startRound

        const areaRect = this.objectsArea.getBoundingClientRect();
        const difficulty = Settings.current.difficulty;
        
        let objectCount = 0;
        if (this.currentRound === 1) {
            objectCount = 6;
            if (difficulty === 'easy') objectCount = 5;
            else if (difficulty === 'hard') objectCount = 8;
        } else if (this.currentRound === 2) {
            objectCount = 8;
            if (difficulty === 'easy') objectCount = 6;
            else if (difficulty === 'hard') objectCount = 10;
        } else if (this.currentRound === 3) {
            objectCount = 10;
            if (difficulty === 'easy') objectCount = 8;
            else if (difficulty === 'hard') objectCount = 12;
        } else if (this.currentRound === 4) {
            // На последнем подуровне больше элементов для усложнения задачи
            objectCount = 18;
            if (difficulty === 'easy') objectCount = 15;
            else if (difficulty === 'hard') objectCount = 22;
        }

        // На последнем подуровне все объекты одного цвета (но разные эмодзи)
        if (this.isLastRound) {
            const allSameColor = this.targetColor;
            
            // Обновляем текст целевой зоны после выбора эмодзи
            // Будет обновлено после создания объектов с правильным targetCount
            
            // Перемешиваем эмодзи для разнообразия
            const shuffledEmojis = [...emojis].sort(() => Math.random() - 0.5);
            // Убираем целевой эмодзи из списка для обычных объектов
            const otherEmojis = shuffledEmojis.filter(e => e !== this.targetEmoji);
            
            // Счетчик целевых объектов с целевым эмодзи
            let targetEmojiCount = 0;
            
            for (let i = 0; i < objectCount; i++) {
                const obj = document.createElement('div');
                obj.className = 'moving-object fade-in';
                
                // Все объекты одного цвета
                obj.style.background = allSameColor;
                
                let emoji;
                let isTarget = false;
                
                // Создаем targetCount объектов с целевым эмодзи (3 штуки)
                if (targetEmojiCount < this.targetCount) {
                    emoji = this.targetEmoji;
                    isTarget = true;
                    targetEmojiCount++;
                } else {
                    // Остальные объекты с другими эмодзи
                    emoji = otherEmojis[i % otherEmojis.length];
                    isTarget = false;
                }
                
                obj.textContent = emoji;
                obj.dataset.emoji = emoji;
                
                if (isTarget) {
                    obj.classList.add('target');
                    obj.dataset.isTarget = 'true';




                    // Зеленая подсветка только на первом подуровне
                    if (this.currentRound === 1) {
                        obj.style.border = '4px solid #2ecc71';
                    } else {
                        obj.style.border = 'none';
                    }
                } else {
                    obj.dataset.isTarget = 'false';
                    obj.style.border = 'none';
                }
                
                const x = Math.random() * (areaRect.width - 60);
                const y = Math.random() * (areaRect.height - 60);
                
                obj.style.left = `${x}px`;
                obj.style.top = `${y}px`;

                this.makeDraggable(obj);
                obj.addEventListener('dblclick', () => this.handleDoubleClick(obj));

                this.objectsArea.appendChild(obj);
                this.movingObjects.push({
                    element: obj,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    x: x,
                    y: y
                });
            }
            
            // Обновляем текст целевой зоны после создания объектов
            if (this.targetZone) {
                this.targetZone.textContent = `Найти: ${this.targetEmoji} (${this.targetCount} шт.)`;
            }
        } else {
            // На обычных подуровнях - переносим по цвету
            // Все объекты целевого цвета должны быть целевыми
            // Сначала создаем все целевые объекты
            for (let i = 0; i < this.targetCount; i++) {
                const obj = document.createElement('div');
                obj.className = 'moving-object fade-in';
                
                const x = Math.random() * (areaRect.width - 60);
                const y = Math.random() * (areaRect.height - 60);
                
                obj.style.left = `${x}px`;
                obj.style.top = `${y}px`;
                
                // Целевые объекты с определенным цветом
                obj.style.background = this.targetColor;
                obj.dataset.color = this.targetColor;
                obj.dataset.isTarget = 'true';
                obj.classList.add('target');
                
                // Зеленая подсветка только на первом подуровне
                if (this.currentRound === 1) {
                    obj.style.border = '4px solid #2ecc71';
                } else {
                    obj.style.border = 'none';
                }
                
                obj.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                this.makeDraggable(obj);
                obj.addEventListener('dblclick', () => this.handleDoubleClick(obj));

                this.objectsArea.appendChild(obj);
                this.movingObjects.push({
                    element: obj,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    x: x,
                    y: y
                });
            }
            
            // Затем создаем остальные объекты с другими цветами (НЕ целевой цвет!)
            // Убираем целевой цвет из списка доступных цветов для обычных объектов
            const availableColors = colors.filter(c => c !== this.targetColor);
            
            for (let i = this.targetCount; i < objectCount; i++) {
                const obj = document.createElement('div');
                obj.className = 'moving-object fade-in';
                
                const x = Math.random() * (areaRect.width - 60);
                const y = Math.random() * (areaRect.height - 60);
                
                obj.style.left = `${x}px`;
                obj.style.top = `${y}px`;
                
                // Обычные объекты с цветами, отличными от целевого
                const color = availableColors[Math.floor(Math.random() * availableColors.length)];
                obj.style.background = color;
                obj.dataset.color = color;
                obj.dataset.isTarget = 'false';
                obj.style.border = 'none';
                
                obj.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                this.makeDraggable(obj);
                obj.addEventListener('dblclick', () => this.handleDoubleClick(obj));

                this.objectsArea.appendChild(obj);
                this.movingObjects.push({
                    element: obj,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    x: x,
                    y: y
                });
            }
        }
    },

    makeDraggable(element) {
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        // Обработчик клика для выбора объекта для управления WASD


        element.addEventListener('click', (e) => {
            // Не обрабатываем клик если это перетаскивание


            if (isDragging) return;
            
            // Проверяем, что объект является целевым (не пойманным)
            const isTarget = element.dataset.isTarget === 'true' && !element.dataset.caught;
            
            if (isTarget || this.isLastRound && element.dataset.emoji === this.targetEmoji && !element.dataset.caught) {
                // Снимаем выделение с предыдущего объекта
                if (this.selectedObject) {
                    this.selectedObject.element.classList.remove('selected');
                }
                
                // Выбираем новый объект
                const obj = this.movingObjects.find(o => o.element === element);
                if (obj) {
                    this.selectedObject = obj;
                    element.classList.add('selected');
                    // Останавливаем авто-движение выбранного объекта
                    obj.vx = 0;
                    obj.vy = 0;
                }
            }
        });

        element.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Только левая кнопка мыши
            
            isDragging = true;
            element.classList.add('dragging');
            initialX = e.clientX - element.offsetLeft;
            initialY = e.clientY - element.offsetTop;
            
            // Выбираем объект при начале перетаскивания (если он целевой)
            const isTarget = element.dataset.isTarget === 'true' && !element.dataset.caught;
            if (isTarget || this.isLastRound && element.dataset.emoji === this.targetEmoji && !element.dataset.caught) {
                if (this.selectedObject && this.selectedObject.element !== element) {
                    this.selectedObject.element.classList.remove('selected');
                }
                const obj = this.movingObjects.find(o => o.element === element);
                if (obj) {
                    this.selectedObject = obj;
                    element.classList.add('selected');
                }
            }
            
            // Останавливаем автоматическое движение при перетаскивании
            const obj = this.movingObjects.find(o => o.element === element);
            if (obj) {
                obj.vx = 0;
                obj.vy = 0;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            const areaRect = this.objectsArea.getBoundingClientRect();
            const maxX = areaRect.width - 60;
            const maxY = areaRect.height - 60;

            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            element.style.left = `${currentX}px`;
            element.style.top = `${currentY}px`;

            // Обновляем позицию в объекте
            const obj = this.movingObjects.find(o => o.element === element);
            if (obj) {
                obj.x = currentX;
                obj.y = currentY;
                // Помечаем что объект перемещен пользователем
                obj.userMoved = true;
            }

            // Проверяем попадание в целевую зону (только при ручном перемещении)
            this.checkTargetZone(element, true); // Передаем true - это ручное перемещение
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('dragging');
                
                // Возобновляем движение
                const obj = this.movingObjects.find(o => o.element === element);
                if (obj && !element.dataset.caught) {
                    obj.vx = (Math.random() - 0.5) * 2;
                    obj.vy = (Math.random() - 0.5) * 2;
                }
            }
        });
    },

    handleDoubleClick(element) {
        // При двойном клике объект получает импульс
        const obj = this.movingObjects.find(o => o.element === element);
        if (obj && !element.dataset.caught) {
            obj.vx *= 2;
            obj.vy *= 2;
            element.style.transform = 'scale(1.3)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }
    },

    handleKeyPress(e) {
        // Используем e.code для независимости от раскладки клавиатуры
        // KeyW, KeyA, KeyS, KeyD работают независимо от раскладки (английская/русскаяя)
        const code = e.code;
        
        // Управление только клавишами WASD (по физическим клавишам, не по символам)
        if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code)) {
            return;
        }
        
        // Предотвращаем стандартное поведение браузера для WASD
        e.preventDefault();
        e.stopPropagation();
        
        // Управляем только выбранным объектом (если он есть)
        if (!this.selectedObject || !this.selectedObject.element || this.selectedObject.element.dataset.caught) {
            return;
        }

        const obj = this.selectedObject;
        if (!this.objectsArea) {
            return;
        }
        
        const speed = 8;
        const areaRect = this.objectsArea.getBoundingClientRect();
        const maxX = areaRect.width - 60;
        const maxY = areaRect.height - 60;
        
        // Помечаем что объект перемещен пользователем
        obj.userMoved = true;
        
        switch(code) {
            case 'KeyW':
                obj.y = Math.max(0, obj.y - speed);
                obj.vy = 0;
                obj.vx = 0;
                break;
            case 'KeyS':
                obj.y = Math.min(maxY, obj.y + speed);
                obj.vy = 0;
                obj.vx = 0;
                break;
            case 'KeyA':
                obj.x = Math.max(0, obj.x - speed);
                obj.vx = 0;
                obj.vy = 0;
                break;
            case 'KeyD':
                obj.x = Math.min(maxX, obj.x + speed);
                obj.vx = 0;
                obj.vy = 0;
                break;
        }

        obj.element.style.left = `${obj.x}px`;
        obj.element.style.top = `${obj.y}px`;
        this.checkTargetZone(obj.element, true); // Передаем true - это ручное перемещение
    },

    checkTargetZone(element, isUserMoved = false) {
        // Проверяем только если объект перемещен пользователем (мышью или клавиатурой)
        // или если это явно указано параметром isUserMoved




        if (!isUserMoved) {
            // Если не указано, проверяем флаг userMoved в объекте
            const obj = this.movingObjects.find(o => o.element === element);
            if (!obj || !obj.userMoved) {
                return; // Объект движется автоматически - не проверяем
            }
        }
        
        if (!this.targetZone || element.dataset.caught) return;

        const elementRect = element.getBoundingClientRect();
        const zoneRect = this.targetZone.getBoundingClientRect();

        const overlap = !(
            elementRect.right < zoneRect.left ||
            elementRect.left > zoneRect.right ||
            elementRect.bottom < zoneRect.top ||
            elementRect.top > zoneRect.bottom
        );

        if (overlap) {
            // Проверяем условие в зависимости от типа уровня
            let isCorrectTarget = false;
            
            if (this.isLastRound) {
                // На последнем подуровне проверяем эмодзи
                isCorrectTarget = element.dataset.isTarget === 'true' && 
                                  element.dataset.emoji === this.targetEmoji;
            } else {
                // На обычных подуровнях проверяем цвет - объект должен быть целевого цвета
                const elementColor = element.style.background || element.dataset.color;
                // Преобразуем rgb в hex для сравнения, или сравниваем напрямую
                isCorrectTarget = element.dataset.isTarget === 'true' && 
                                  (elementColor === this.targetColor || 
                                   element.dataset.color === this.targetColor);
            }
            
            if (isCorrectTarget) {
                this.catchTarget(element);
            }
        }
    },

    catchTarget(element) {
        element.dataset.caught = 'true';
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
        element.classList.remove('selected');
        this.caughtCount++;

        // Останавливаем движение
        const obj = this.movingObjects.find(o => o.element === element);
        if (obj) {
            obj.vx = 0;
            obj.vy = 0;
        }
        
        // Если пойманный объект был выбран, снимаем выделение
        if (this.selectedObject && this.selectedObject.element === element) {
            this.selectedObject = null;
        }

        // Начисляем баллы (бонус за оставшееся время)
        const timeBonus = Math.floor(this.timeRemaining * 5);
        const basePoints = 50 + (this.currentRound * 10);
        GameEngine.addScore(basePoints + timeBonus, 'Цель поймана!');

        // Обновляем прогресс
        const progressEl = document.getElementById('roundProgress');
        if (progressEl) {
            progressEl.textContent = `Поймано: ${this.caughtCount} / ${this.targetCount}`;
        }

        // Проверяем завершение раунда
        if (this.caughtCount >= this.targetCount) {
            // Останавливаем таймер раунда
            if (this.roundTimer) {
                clearInterval(this.roundTimer);
                this.roundTimer = null;
            }
            
            // Показываем успешное завершение подуровня
            setTimeout(() => {
                this.cleanup();
                this.startRound();
            }, 1500);
        }
    },

    startAnimations() {
        const animate = () => {
            if (!this.objectsArea) return;
            
            const areaRect = this.objectsArea.getBoundingClientRect();
            const difficultyMultiplier = Settings.getDifficultyMultiplier();

            this.movingObjects.forEach(obj => {
                if (!obj.element || obj.element.dataset.caught) return;

                const isTarget = obj.element.classList.contains('target');
                
                // Для целевых объектов обновляем движение только если они не управляются клавиатурой
                // (т.е. если vx или vy не равны 0)
                // Для нецелевых объектов всегда обновляем движение
                if (!isTarget || (Math.abs(obj.vx) > 0.01 || Math.abs(obj.vy) > 0.01)) {
                    obj.x += obj.vx * difficultyMultiplier;
                    obj.y += obj.vy * difficultyMultiplier;

                    // Отскок от границ
                    if (obj.x <= 0 || obj.x >= areaRect.width - 60) {
                        obj.vx *= -1;
                        obj.x = Math.max(0, Math.min(obj.x, areaRect.width - 60));
                    }
                    if (obj.y <= 0 || obj.y >= areaRect.height - 60) {
                        obj.vy *= -1;
                        obj.y = Math.max(0, Math.min(obj.y, areaRect.height - 60));
                    }

                    obj.element.style.left = `${obj.x}px`;
                    obj.element.style.top = `${obj.y}px`;
                    
                    // Сбрасываем флаг userMoved при автоматическом движении
                    // (если объект не выбран для управления клавиатурой)
                    if (!obj.userMoved || (obj !== this.selectedObject)) {
                        obj.userMoved = false;
                    }
                }

                // НЕ проверяем попадание в целевую зону при автоматическом движении
                // checkTargetZone будет вызываться только при ручном перемещении (мышь/клавиатура)
            });

            this.animationFrames.push(requestAnimationFrame(animate));
        };

        animate();
    },

    cleanup() {
        // Останавливаем анимации
        this.animationFrames.forEach(cancelAnimationFrame);
        this.animationFrames = [];
        
        // Удаляем обработчик клавиатуры
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
        }
        
        this.movingObjects = [];
    },

    destroy() {
        this.cleanup();
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            gameArea.innerHTML = '';
        }
    }
};
