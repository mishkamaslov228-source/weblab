// Страница рейтинга
document.addEventListener('DOMContentLoaded', () => {
    const ratingTableBody = document.getElementById('ratingTableBody');
    const noResults = document.getElementById('noResults');
    const sortByScoreBtn = document.getElementById('sortByScoreBtn');
    const sortByDateBtn = document.getElementById('sortByDateBtn');
    const clearRatingBtn = document.getElementById('clearRatingBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');


    let currentRatings = [];
    let sortOrder = 'score'; // 'score' или 'date'




    // Загрузка рейтинга
    function loadRatings() {
        currentRatings = Storage.getRatings();
        displayRatings();
    }


    // Отображение рейтинга
    function displayRatings() {
        if (!ratingTableBody) return;

        ratingTableBody.innerHTML = '';

        if (currentRatings.length === 0) {
            if (noResults) {
                noResults.style.display = 'block';
            }
            return;
        }

        if (noResults) {
            noResults.style.display = 'none';
        }

        currentRatings.forEach((rating, index) => {
            const row = document.createElement('tr');
            
            // Выделяем топ-3
            if (index < 3) {
                row.classList.add('highlight');
            }

            const rank = index + 1;
            const rankBadge = document.createElement('span');
            rankBadge.className = 'rank-badge';
            
            if (rank === 1) rankBadge.classList.add('gold');
            else if (rank === 2) rankBadge.classList.add('silver');
            else if (rank === 3) rankBadge.classList.add('bronze');
            
            rankBadge.textContent = rank;

            const date = new Date(rating.date);
            const formattedDate = date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const timeMinutes = Math.floor(rating.time / 60);
            const timeSeconds = rating.time % 60;
            const formattedTime = `${timeMinutes}:${String(timeSeconds).padStart(2, '0')}`;

            row.innerHTML = `
                <td>${rankBadge.outerHTML}</td>
                <td>${rating.name}</td>
                <td><strong>${rating.score}</strong></td>
                <td>${rating.levels} / 3</td>
                <td>${formattedTime}</td>
                <td>${formattedDate}</td>
            `;

            ratingTableBody.appendChild(row);
        });
    }




    // Сортировка по баллам
    if (sortByScoreBtn) {
        sortByScoreBtn.addEventListener('click', () => {
            sortOrder = 'score';
            currentRatings.sort((a, b) => b.score - a.score);
            displayRatings();
        });
    }


    // Сортировка по дате
    if (sortByDateBtn) {
        sortByDateBtn.addEventListener('click', () => {
            sortOrder = 'date';
            currentRatings.sort((a, b) => new Date(b.date) - new Date(a.date));
            displayRatings();
        });
    }



    // Очистка рейтинга
    if (clearRatingBtn) {
        clearRatingBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить весь рейтинг?')) {
                Storage.clearRatings();
                loadRatings();
            }
        });
    }




    // Возврат в меню
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }


    // Загружаем рейтинг при загрузке страницы
    loadRatings();
});
