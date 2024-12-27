const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const tmdbApiKey = process.env.TMDB_API_KEY;
const youTubeApiKey = process.env.YOUTUBE_API_KEY;

app.get('/api/movies/popular', async (req, res) => {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}`);
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching popular movies:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch popular movies' });
    }
});

app.get('/api/movies/search', async (req, res) => {
    const query = req.query.query;
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${query}`);
        res.json(response.data.results);
    } catch (error) {
        console.error('Error searching movies:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    const movieId = req.params.id;
    try {
        console.log(`Fetching details for movie ID: ${movieId}`);

        const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}&append_to_response=credits`);
        const movieDuration = movieResponse.data.runtime * 60; // Convert minutes to seconds
        const trailerResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movieResponse.data.title)} trailer&key=${youTubeApiKey}`);

        // Enhance Dailymotion search query with exact match and additional filters
        const dailyMotionResponse = await axios.get(`https://api.dailymotion.com/videos?search="${encodeURIComponent(movieResponse.data.title)}"&sort=relevance&limit=10&fields=id,title,duration,description`);
        console.log(dailyMotionResponse.data);

        // Select the most relevant video based on metadata
        let dailyMotionVideoId = null;
        if (dailyMotionResponse.data.list.length > 0) {
            // Filter videos by title match and duration of at least 1 hour (3600 seconds)
            const filteredVideos = dailyMotionResponse.data.list.filter(video => 
                video.title.toLowerCase().includes(movieResponse.data.title.toLowerCase()) && 
                video.duration >= 3600
            );
            console.log('Filtered videos:', filteredVideos);
            if (filteredVideos.length > 0) {
                dailyMotionVideoId = filteredVideos[0].id;
            } else {
                // Fallback to the first video if no matches found
                console.warn('No videos found with duration >= 1 hour. Falling back to the first video.');
                dailyMotionVideoId = dailyMotionResponse.data.list[0].id;
            }
        } else {
            console.error('No videos found on Dailymotion.');
        }

        res.json({ movie: movieResponse.data, trailer: trailerResponse.data.items[0], dailyMotionVideoId });
    } catch (error) {
        console.error('Error fetching movie details:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch movie details' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));