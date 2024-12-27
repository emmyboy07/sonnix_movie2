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
            <p><strong>Rating:</strong> ${movie.vote_average}</p>
            <p><strong>Overview:</strong> ${movie.overview}</p>
            <p><strong>Cast:</strong> ${movie.credits.cast.map(cast => cast.name).join(', ')}</p>
            <button id="watch-trailer">Watch Trailer</button>
            <button id="watch-movie">Watch Movie</button>
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
    };

    const displayError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    fetchMovieDetails(movieId);
});