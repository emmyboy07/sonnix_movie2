let page = 1;
let isLoading = false;
let selectedGenre = null;
let currentYear = new Date().getFullYear();

const moviesContainer = document.getElementById('movies');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const voiceSearchButton = document.getElementById('voice-search');
const searchSuggestions = document.getElementById('search-suggestions');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const errorMessage = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading');
const genreFilterContainer = document.getElementById('genre-filter');
const advancedFilters = document.getElementById('advanced-filters');
const toggleFilters = document.getElementById('toggle-filters');
const yearFilter = document.getElementById('year-filter');
const ratingFilter = document.getElementById('rating-filter');

const API_BASE_URL = 'http://localhost:5000/api';

const fetchMovies = async (endpoint) => {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        hideLoading();
        return await response.json();
    } catch (error) {
        hideLoading();
        displayError(error.message);
        return [];
    }
};

const loadMoreMovies = async () => {
    if (isLoading) return;
    isLoading = true;
    showLoading();

    let endpoint = `/movies/popular?page=${page}`;
    if (selectedGenre) {
        endpoint = `/movies/genre/${selectedGenre}?page=${page}`;
    }

    const movies = await fetchMovies(endpoint);
    displayMovies(movies, true);
    page++;

    hideLoading();
    isLoading = false;
};

const displayMovies = (movies, append = false) => {
    if (!append) {
        moviesContainer.innerHTML = '';
        page = 1;
    }
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('card');
        movieCard.innerHTML = `
            <img class="lazy" data-src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-rating">⭐ ${movie.vote_average.toFixed(1)}</p>
            </div>
        `;
        movieCard.addEventListener('click', () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });
        moviesContainer.appendChild(movieCard);
    });
    lazyLoadImages();
};

const lazyLoadImages = () => {
    const lazyImages = document.querySelectorAll('img.lazy');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
};

const displayError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
};

const clearError = () => {
    errorMessage.style.display = 'none';
};

const showLoading = () => {
    loadingIndicator.style.display = 'flex';
};

const hideLoading = () => {
    loadingIndicator.style.display = 'none';
};

const searchMovies = async (query) => {
    clearError();
    const movies = await fetchMovies(`/movies/search?query=${query}`);
    displayMovies(movies);
};

const fetchGenres = async () => {
    const genres = await fetchMovies('/movies/genres');
    displayGenres(genres);
};

const displayGenres = (genres) => {
    genreFilterContainer.innerHTML = '<button class="active" data-genre-id="">All</button>';
    genres.forEach(genre => {
        const genreButton = document.createElement('button');
        genreButton.textContent = genre.name;
        genreButton.dataset.genreId = genre.id;
        genreFilterContainer.appendChild(genreButton);
    });
};

const filterByGenre = async (genreId) => {
    selectedGenre = genreId;
    const movies = await fetchMovies(`/movies/genre/${genreId}`);
    displayMovies(movies);
};

const initializeAdvancedFilters = () => {
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }

    for (let rating = 10; rating >= 1; rating--) {
        const option = document.createElement('option');
        option.value = rating;
        option.textContent = `${rating}+`;
        ratingFilter.appendChild(option);
    }
};

const applyAdvancedFilters = async () => {
    const year = yearFilter.value;
    const rating = ratingFilter.value;
    let endpoint = '/movies/filter?';
    if (year) endpoint += `year=${year}&`;
    if (rating) endpoint += `rating=${rating}&`;
    if (selectedGenre) endpoint += `genre=${selectedGenre}&`;
    endpoint = endpoint.slice(0, -1); // Remove trailing '&'

    const movies = await fetchMovies(endpoint);
    displayMovies(movies);
};

const initializeVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            searchMovies(transcript);
        };

        voiceSearchButton.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        voiceSearchButton.style.display = 'none';
    }
};

const initializeSearchSuggestions = () => {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = e.target.value;
            if (query.length > 2) {
                const suggestions = await fetchMovies(`/movies/suggestions?query=${query}`);
                displaySearchSuggestions(suggestions);
            } else {
                searchSuggestions.innerHTML = '';
            }
        }, 300);
    });
};

const displaySearchSuggestions = (suggestions) => {
    searchSuggestions.innerHTML = '';
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = suggestion.title;
        div.addEventListener('click', () => {
            searchInput.value = suggestion.title;
            searchMovies(suggestion.title);
            searchSuggestions.innerHTML = '';
        });
        searchSuggestions.appendChild(div);
    });
};

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value;
    if (query) {
        searchMovies(query);
    } else {
        fetchMovies('/movies/popular').then(displayMovies);
    }
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    updateDarkModeIcon();
});

const updateDarkModeIcon = () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
};

genreFilterContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        genreFilterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        const genreId = e.target.dataset.genreId;
        if (genreId) {
            filterByGenre(genreId);
        } else {
            selectedGenre = null;
            fetchMovies('/movies/popular').then(displayMovies);
        }
    }
});

toggleFilters.addEventListener('click', () => {
    const filterOptions = advancedFilters.querySelector('.filter-options');
    filterOptions.style.display = filterOptions.style.display === 'none' ? 'flex' : 'none';
});

yearFilter.addEventListener('change', applyAdvancedFilters);
ratingFilter.addEventListener('change', applyAdvancedFilters);

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
        loadMoreMovies();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies('/movies/popular').then(displayMovies);
    fetchGenres();
    initializeAdvancedFilters();
    initializeVoiceSearch();
    initializeSearchSuggestions();
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcon();
});

