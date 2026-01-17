// Утилиты для работы с localStorage
const Storage = {
    // Сохранение данных в localStorage
    save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (e) {
            console.error('Ошибка сохранения данных:', e);
            return false;
        }
    },




    // Загрузка данных из localStorage
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
            return defaultValue;
        }
    },


    // Удаление данных
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Ошибка удаления данных:', e);
            return false;
        }
    },


    // Очистка всех данных
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Ошибка очистки данных:', e);
            return false;
        }
    },




    // Работа с рейтингом



    saveRating(playerData) {
        const ratings = this.load('ratings', []);




        ratings.push({
            ...playerData,
            date: new Date().toISOString(),
            timestamp: Date.now()
        });
        // Сортируем по баллам (по убыванию)
        ratings.sort((a, b) => b.score - a.score);
        // Оставляем только топ 100
        const topRatings = ratings.slice(0, 100);
        this.save('ratings', topRatings);
        return true;
    },




    getRatings() {
        return this.load('ratings', []);
    },

    clearRatings() {
        this.remove('ratings');
        return true;
    },





    // Работа с настройками
    saveSettings(settings) {
        return this.save('gameSettings', settings);
    },

    getSettings() {
        return this.load('gameSettings', {
            theme: 'default',
            difficulty: 'medium',
            debugMode: false
        });
    }
};