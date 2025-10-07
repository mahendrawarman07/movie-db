import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import { getRecommendedMovies } from '../utilities/aiRecommendations';
import { useWatchlist } from './context/WatchlistContext';

const API_KEY = 'af3436a31f5d01d0b6665445693316f2';
const BASE_URL = 'https://api.themoviedb.org/3';

const MovieCarousel = ({ endpoint, title, icon, seeAllPath }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();

  useEffect(() => {
    fetchMovies();
  }, [endpoint]); // Add watchlist as dependency

const fetchMovies = async () => {
  setLoading(true);
  try {
    // Check if this is AI recommendations
    if (endpoint === 'ai_recommended') {
      // Use watchlist from hook (already available in component scope)
      const recommendedMovies = await getRecommendedMovies(watchlist);
      console.log(recommendedMovies);
      setMovies(recommendedMovies || []);
    } else {
      // Original TMDB endpoint logic
      const response = await fetch(
        `${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}&page=1`
      );
      const data = await response.json();
      setMovies(data.results?.slice(0, 20) || []);
    }
  } catch (err) {
    console.error('Failed to fetch movies:', err);
    setMovies([]);
  } finally {
    setLoading(false);
  }
};

  // ADD THIS NEW FUNCTION
const fetchAIRecommendations = async () => {
  setLoading(true);
  try {
    const { watchlist } = useWatchlist(); // Import at top
    const recommendedMovies = await getRecommendedMovies(watchlist);
    setMovies(recommendedMovies);
  } catch (err) {
    console.error('Failed to fetch AI recommendations:', err);
  } finally {
    setLoading(false);
  }
};

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8; // Scroll 80% of container width
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  const handleSeeAll = () => {
    navigate(seeAllPath);
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 animate-pulse">
              <div className="bg-slate-800/50 rounded-lg h-72" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h2>
        <button
          onClick={handleSeeAll}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm sm:text-base"
        >
          <span>See All</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-slate-900/90 rounded-full hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>

        {/* Movies Container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-44 sm:w-52">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-slate-900/90 rounded-full hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white" size={24} />
        </button>
      </div>
    </div>
  );
};

export default MovieCarousel;