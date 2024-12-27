document.addEventListener('DOMContentLoaded', async () => {
    const movieDetailsContainer = document.getElementById('movie-details');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const errorMessage = document.getElementById('error-message');
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    const fetchMovieDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/movies/${id}`);
            if (!response.ok) throw new Error('Failed to fetch movie details');
            const data = await response.json();
            displayMovieDetails(data.movie, data.trailer, data.dailyMotionVideoId);
        
            // Add the "Add to Favorites" button
            const addToFavoritesButton = document.createElement('button');
            addToFavoritesButton.textContent = 'Add to Favorites';
            addToFavoritesButton.addEventListener('click', () => addToFavorites(id));
            movieDetailsContainer.appendChild(addToFavoritesButton);
        } catch (error) {
            displayError(error.message);
        }
    };

    const displayMovieDetails = (movie, trailer, dailyMotionVideoId) => {
        movieDetailsContainer.innerHTML = `
            <h2>${movie.title}</h2>
            <div id="poster-container">
                <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}" id="poster-image">
            </div>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Cast:</strong> ${movie.credits.cast.slice(0, 5).map(cast => cast.name).join(', ')}</p>
            <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
            <button id="watch-trailer">Watch Trailer</button>
            <button id="watch-movie">Watch Movie</button>
            <div id="similar-movies">
                <h3>Similar Movies</h3>
                <div id="similar-movies-container"></div>
            </div>
        `;

        document.getElementById('watch-trailer').addEventListener('click', () => {
            const posterContainer = document.getElementById('poster-container');
            posterContainer.innerHTML = `
                <iframe width="100%" height="400" 
                        src="https://www.youtube.com/embed/${trailer.id.videoId}?autoplay=1" 
                        frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
            `;
        });

        document.getElementById('watch-movie').addEventListener('click', () => {
            if (dailyMotionVideoId) {
                const posterContainer = document.getElementById('poster-container');
                posterContainer.innerHTML = `
                    <iframe width="100%" height="400" 
                            src="https://www.dailymotion.com/embed/video/${dailyMotionVideoId}?autoplay=1" 
                            frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                `;
            } else {
                displayError('Movie not available on Dailymotion.');
            }
        });

        fetchSimilarMovies(movie.id);
    };

    const displayError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    const fetchSimilarMovies = async (movieId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/movies/${movieId}/similar`);
            if (!response.ok) throw new Error('Failed to fetch similar movies');
            const similarMovies = await response.json();
            displaySimilarMovies(similarMovies);
        } catch (error) {
            displayError(error.message);
        }
    };

    const displaySimilarMovies = (movies) => {
        const similarMoviesContainer = document.getElementById('similar-movies-container');
        movies.slice(0, 5).forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('card', 'similar-movie-card');
            movieCard.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w200/${movie.poster_path}" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                </div>
            `;
            movieCard.addEventListener('click', () => {
                window.location.href = `movie.html?id=${movie.id}`;
            });
            similarMoviesContainer.appendChild(movieCard);
        });
    };

    const addToFavorites = (movieId) => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.includes(movieId)) {
            favorites.push(movieId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Movie added to favorites!');
        } else {
            alert('This movie is already in your favorites!');
        }
    };

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    fetchMovieDetails(movieId);
});
