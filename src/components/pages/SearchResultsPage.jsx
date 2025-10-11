import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Loader, ChevronDown } from 'lucide-react';
import MovieCard from '../MovieCard';

const API_KEY = "af3436a31f5d01d0b6665445693316f2";
const BASE_URL = "https://api.themoviedb.org/3";

const SearchResultsPage = () => {
  const { query } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(decodeURIComponent(query));
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Search movies function (no filters - pure TMDB search)
  const searchMovies = async (query, page = 1, append = false) => {
    if (!query.trim()) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setSearchResults([]);
    }

    setError('');

    try {
      const params = new URLSearchParams({
        api_key: API_KEY,
        query: query,
        page: page
      });

      const response = await fetch(`${BASE_URL}/search/movie?${params.toString()}`);
      const data = await response.json();

      if (data && data.results.length > 0) {
        setSearchResults(prev => append ? [...prev, ...data.results] : data.results);
        setCurrentPage(data.page);
        setTotalPages(data.total_pages);
        setTotalResults(data.total_results);
      } else {
        setSearchResults([]);
        setError('No movies found');
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load search results when component mounts or query changes
  useEffect(() => {
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      setSearchQuery(decodedQuery);
      searchMovies(decodedQuery, 1, false);
    }
  }, [query]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery);
      navigate(`/search/${encodedQuery}`);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    searchMovies(searchQuery, nextPage, true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasMoreResults = currentPage < totalPages;
  const showingCount = searchResults.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Home</span>
            </button>
            <div className="h-6 w-px bg-slate-700" />
            <h1 className="text-xl font-bold text-white">
              Search Results
            </h1>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative overflow-hidden bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Movie Search
            </h2>
            {searchResults.length > 0 && (
              <p className="text-slate-400">
                Found {totalResults.toLocaleString()} results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search
  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors z-10"
  size={24}
/>
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={handleKeyPress}
  placeholder="Search for movies..."
  className="w-full pl-14 pr-32 py-4 bg-slate-900/80 border-2 border-slate-700 rounded-2xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-xl"
/>

              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {error && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-6">
              <Search className="text-slate-500" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">No Results Found</h3>
            <p className="text-slate-400 mb-6">
              We couldn't find any movies matching "{searchQuery}"
            </p>
          </div>
        )}

        {searchResults.length > 0 && !loading && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {searchResults.map((movie) => (
  <MovieCard 
    key={movie.id} 
    movie={movie} 
    onClick={() => navigate(`/movie/${movie.id}`, { 
      state: { 
        fromSearch: true, 
        searchQuery: searchQuery,
        searchPath: `/search/${encodeURIComponent(searchQuery)}`
      }
    })}
  />
))}
            </div>

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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
