document.addEventListener('DOMContentLoaded', () => {
    const favoritesContainer = document.getElementById('favorites-container');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const errorMessage = document.getElementById('error-message');

    const displayFavorites = async () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>You have no favorite movies yet.</p>';
            return;
        }

        favoritesContainer.innerHTML = '';
        for (const movieId of favorites) {
            try {
                const response = await fetch(`http://localhost:5000/api/movies/${movieId}`);
                if (!response.ok) throw new Error(`Failed to fetch movie details for ID ${movieId}`);
                const data = await response.json();
                const movie = data.movie;

                const movieCard = document.createElement('div');
                movieCard.classList.add('card');
                movieCard.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.release_date.split('-')[0]}</p>
                        <button class="remove-favorite" data-id="${movie.id}">Remove from Favorites</button>
                    </div>
                `;
                movieCard.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('remove-favorite')) {
                        window.location.href = `movie.html?id=${movie.id}`;
                    }
                });
                favoritesContainer.appendChild(movieCard);
            } catch (error) {
                console.error(error);
                displayError(`Failed to load movie ${movieId}`);
            }
        }

        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = e.target.dataset.id;
                removeFavorite(movieId);
            });
        });
    };

    const removeFavorite = (movieId) => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(id => id !== movieId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    };

    const displayError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    displayFavorites();
});

