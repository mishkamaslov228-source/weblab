// Главная страница
document.addEventListener('DOMContentLoaded', () => {
    Settings.init();

    const playerNameInput = document.getElementById('playerName');
    const startGameBtn = document.getElementById('startGameBtn');
    const viewRatingBtn = document.getElementById('viewRatingBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.querySelector('.close');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const colorThemeSelect = document.getElementById('colorTheme');
    const difficultySelect = document.getElementById('difficulty');
    const debugModeCheckbox = document.getElementById('debugMode');


    // Загружаем сохраненные настройки
    const savedSettings = Storage.getSettings();
    if (colorThemeSelect) colorThemeSelect.value = savedSettings.theme || 'default';
    if (difficultySelect) difficultySelect.value = savedSettings.difficulty || 'medium';
    if (debugModeCheckbox) debugModeCheckbox.checked = savedSettings.debugMode || false;





    // Начало игры
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            const playerName = playerNameInput ? playerNameInput.value.trim() : '';
            
            if (!playerName) {
                alert('Пожалуйста, введите ваше имя!');
                return;
            }

            // Сохраняем имя игрока
            Storage.save('currentPlayer', playerName);
            
            // Переход на страницу игры
            window.location.href = 'game.html';
        });


        // Нажатие Enter в поле ввода
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    startGameBtn.click();
                }
            });
        }
    }



    // Просмотр рейтинга
    if (viewRatingBtn) {
        viewRatingBtn.addEventListener('click', () => {
            window.location.href = 'rating.html';
        });
    }


    // Открытие настроек
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.add('active');
            }
        });
    }



    // Закрытие модального окна
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }


    // Закрытие по клику вне модального окна
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }




    // Сохранение настроек
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            if (colorThemeSelect) {
                Settings.setTheme(colorThemeSelect.value);
            }
            if (difficultySelect) {
                Settings.setDifficulty(difficultySelect.value);
            }
            if (debugModeCheckbox) {
                Settings.setDebugMode(debugModeCheckbox.checked);
            }
            
            Settings.saveSettings();
            
            if (settingsModal) {
                settingsModal.classList.remove('active');
            }
            
            alert('Настройки сохранены!');
        });
    }


    // Загружаем последнее имя игрока
    const lastPlayerName = Storage.load('currentPlayer', '');
    if (playerNameInput && lastPlayerName) {
        playerNameInput.value = lastPlayerName;
    }
});
