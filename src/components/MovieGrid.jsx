import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader, Film } from 'lucide-react';
import MovieCard from './MovieCard';

const API_KEY = 'af3436a31f5d01d0b6665445693316f2';
const BASE_URL = 'https://api.themoviedb.org/3';

const MovieGrid = ({ endpoint, title }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Reset when endpoint changes
    setMovies([]);
    setCurrentPage(1);
    fetchMovies(1, false);
  }, [endpoint]);

  const fetchMovies = async (page, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setMovies([]);
    }

    setError('');

    try {
      const response = await fetch(
        `${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}&page=${page}`
      );
      const data = await response.json();

      if (data && data.results) {
        setMovies(prev => append ? [...prev, ...data.results] : data.results);
        setCurrentPage(data.page);
        setTotalPages(data.total_pages);
        setTotalResults(data.total_results);
      } else {
        setError('No movies found');
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchMovies(nextPage, true);
  };

  const hasMoreResults = currentPage < totalPages;
  const showingCount = movies.length;

  return (
    <div className="py-8">
      {/* Section Title */}
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          {totalResults > 0 && (
            <p className="text-slate-400">
              {totalResults.toLocaleString()} movies available
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800/50 rounded-lg h-80 sm:h-96" />
              <div className="mt-3 bg-slate-800/50 h-4 rounded w-3/4" />
              <div className="mt-2 bg-slate-800/50 h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <Film className="text-red-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      )}

      {/* Movie Grid */}
      {movies.length > 0 && !loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMoreResults && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
              >
                {loadingMore ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Loading More...
                  </>
                ) : (
                  <>
                    <ChevronDown size={20} />
                    Load More ({totalResults - showingCount} remaining)
                  </>
                )}
              </button>
              <p className="text-slate-500 text-sm mt-4">
                Showing {showingCount} of {totalResults.toLocaleString()} • Page {currentPage} of {totalPages}
              </p>
            </div>
          )}

          {/* End Message */}
          {!hasMoreResults && showingCount > 0 && (
            <div className="mt-12 text-center py-8 border-t border-slate-800">
              <p className="text-slate-400">
                You've reached the end • All {totalResults.toLocaleString()} movies loaded
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovieGrid;