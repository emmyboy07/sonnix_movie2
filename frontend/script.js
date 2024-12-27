document.addEventListener('DOMContentLoaded', () => {
    const moviesContainer = document.getElementById('movies');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const errorMessage = document.getElementById('error-message');

    const fetchMovies = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/movies/popular');
            if (!response.ok) throw new Error('Failed to fetch popular movies');
            const movies = await response.json();
            displayMovies(movies);
        } catch (error) {
            displayError(error.message);
        }
    };

    const searchMovies = async (query) => {
        try {
            const response = await fetch(`http://localhost:5000/api/movies/search?query=${query}`);
            if (!response.ok) throw new Error('Failed to search movies');
            const movies = await response.json();
            displayMovies(movies);
        } catch (error) {
            displayError(error.message);
        }
    };

    const displayMovies = (movies) => {
        clearError();
        moviesContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('card');
            movieCard.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                </div>
            `;
            movieCard.addEventListener('click', () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });
            moviesContainer.appendChild(movieCard);
        });
    };

    const displayError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    const clearError = () => {
        errorMessage.style.display = 'none';
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value;
        if (query) {
            searchMovies(query);
        } else {
            fetchMovies();
        }
    });

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    fetchMovies();
});