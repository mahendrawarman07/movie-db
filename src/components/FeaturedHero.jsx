import React, { useState, useEffect } from 'react';
import { Play, Bookmark, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from './context/WatchlistContext';

const API_KEY = 'af3436a31f5d01d0b6665445693316f2';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const FeaturedHero = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    fetchFeaturedMovie();
  }, []);

  const fetchFeaturedMovie = async () => {
    try {
      // Get trending movies for today
      const response = await fetch(
        `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`
      );
      const data = await response.json();
      // console.log(data);
      if (data.results && data.results.length > 0) {
        // Pick a random movie from top 10
        const randomIndex = Math.floor(Math.random() * Math.min(25, data.results.length));
        // console.log(randomIndex);
        const selectedMovie = data.results[randomIndex];
        
        // Fetch full details for this movie
        const detailsResponse = await fetch(
          `${BASE_URL}/movie/${selectedMovie.id}?api_key=${API_KEY}`
        );
        const movieDetails = await detailsResponse.json();
        setMovie(movieDetails);
      }
    } catch (err) {
      console.error('Failed to fetch featured movie:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleWatchlistClick = () => {
    toggleWatchlist(movie);
  };

  if (loading || !movie) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-slate-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : null;
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
    : null;
  const inWatchlist = isInWatchlist(movie.id);

  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden animate-fadeIn">
      {/* Backdrop Image */}
      {backdropUrl && (
        <img
          src={backdropUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12 sm:pb-16 lg:pb-20">
        <div className="flex flex-col sm:flex-row gap-6 max-w-4xl">
          {/* Poster - Hidden on small mobile */}
          {posterUrl && (
            <div className="hidden sm:block flex-shrink-0">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-32 sm:w-40 lg:w-48 rounded-lg shadow-2xl"
              />
            </div>
          )}

          {/* Movie Info */}
          <div className="flex-1">
            {/* Featured Badge */}
            <div className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-3">
              {/* 🔥 FEATURED */}
              TRENDING
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg">
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm sm:text-base">
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>⭐</span>
                  <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
              {movie.release_date && (
                <span className="text-slate-300">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              )}
              {movie.runtime && (
                <span className="text-slate-300">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-slate-800/80 backdrop-blur-sm text-slate-300 rounded-full text-xs sm:text-sm border border-slate-700"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-slate-300 text-sm sm:text-base mb-6 line-clamp-2 sm:line-clamp-3 max-w-2xl drop-shadow">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleViewDetails}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 font-semibold rounded-lg hover:bg-slate-200 transition-all shadow-lg hover:scale-105"
              >
                <Info size={20} />
                <span>More Info</span>
              </button>

              <button
                onClick={handleWatchlistClick}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all shadow-lg hover:scale-105 ${
                  inWatchlist
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-white backdrop-blur-sm'
                }`}
              >
                <Bookmark size={20} fill={inWatchlist ? 'white' : 'none'} />
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHero;