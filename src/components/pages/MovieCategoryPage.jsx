import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../MovieCard';
import FilterBar from '../FilterBar';

const API_KEY = 'af3436a31f5d01d0b6665445693316f2';
const BASE_URL = 'https://api.themoviedb.org/3';

const MovieCategoryPage = ({ endpoint, title, icon }) => {
  const navigate = useNavigate();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    genres: [],
    year: 'all',
    yearFrom: undefined,
    yearTo: undefined,
    rating: 'all',
    sort: 'popularity.desc'
  });

  useEffect(() => {
    fetchMovies(1, false);
  }, [endpoint, filters]);

  const fetchMovies = async (page, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setMovies([]);
    }

    try {
      let url;
      let params = new URLSearchParams({
        api_key: API_KEY,
        page: page
      });

      // Check if user has applied any filters
      const hasFilters = 
        filters.genres.length > 0 || 
        (filters.year && filters.year !== 'all') ||
        (filters.rating && filters.rating !== 'all') ||
        (filters.sort && filters.sort !== 'popularity.desc');

      // If filters are applied, use discover endpoint
      // Otherwise, use the category-specific endpoint for authentic results
      if (hasFilters) {
        url = `${BASE_URL}/discover/movie`;
        
        // Add sort
        params.append('sort_by', filters.sort);
        params.append('include_adult', 'false');
        params.append('include_video', 'false');
        params.append('language', 'en-US');

        // Apply category-specific constraints
        const today = new Date().toISOString().split('T')[0];
        
        if (endpoint === 'now_playing') {
          // Now playing: released in last 3 months
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
          
          params.append('primary_release_date.gte', threeMonthsAgoStr);
          params.append('primary_release_date.lte', today);
        } else if (endpoint === 'upcoming') {
          // Upcoming: releasing in the future
          params.append('primary_release_date.gte', today);
          
          const oneYearLater = new Date();
          oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
          params.append('primary_release_date.lte', oneYearLater.toISOString().split('T')[0]);
        } else if (endpoint === 'top_rated') {
          // Top rated: high ratings with enough votes
          params.append('vote_average.gte', '7');
          params.append('vote_count.gte', '1000');
        }

        // Add genre filter
        if (filters.genres.length > 0) {
          params.append('with_genres', filters.genres.join(','));
        }

        // Add year filter
        if (filters.year && filters.year !== 'all') {
          if (filters.year === 'custom' && filters.yearFrom && filters.yearTo) {
            params.append('primary_release_date.gte', `${filters.yearFrom}-01-01`);
            params.append('primary_release_date.lte', `${filters.yearTo}-12-31`);
          } else if (filters.year.includes('-')) {
            const [startYear, endYear] = filters.year.split('-');
            params.append('primary_release_date.gte', `${startYear}-01-01`);
            params.append('primary_release_date.lte', `${endYear}-12-31`);
          } else {
            params.append('primary_release_year', filters.year);
          }
        }

        // Add rating filter
        if (filters.rating && filters.rating !== 'all') {
          if (filters.rating === '0-5') {
            params.append('vote_average.lte', '5');
          } else {
            params.append('vote_average.gte', filters.rating);
          }
          params.append('vote_count.gte', '100');
        }
      } else {
        // No filters applied, use the original category endpoint
        url = `${BASE_URL}/movie/${endpoint}`;
      }

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      setMovies(prev => append ? [...prev, ...data.results] : data.results);
      setCurrentPage(data.page);
      setTotalPages(Math.min(data.total_pages, 500)); // TMDB limits to 500 pages
      setTotalResults(data.total_results);
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchMovies(currentPage + 1, true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h1>
          {totalResults > 0 && (
            <p className="text-slate-400">
              {totalResults.toLocaleString()} movies found
            </p>
          )}
        </div>

        {/* Filter Bar - Pass categoryEndpoint prop */}
        <FilterBar 
          type="category"
          categoryEndpoint={endpoint}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/50 rounded-lg h-80 sm:h-96" />
              </div>
            ))}
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Load More */}
            {currentPage < totalPages && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all"
                >
                  {loadingMore ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Loading...
                    </>
                  ) : (
                    `Load More (${Math.min(totalResults - movies.length, (totalPages - currentPage) * 20)} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <Film className="text-slate-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">No Movies Found</h3>
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCategoryPage;