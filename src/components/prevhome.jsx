import React, { useState } from 'react';
import { Search, Film, Loader } from 'lucide-react';
import MovieCard from './MovieCard'

// OMDB API - Get your free key from: http://www.omdbapi.com/apikey.aspx
const API_KEY = 'af3436a31f5d01d0b6665445693316f2'; // Replace with your actual API key
const API_URL = 'https://www.themoviedb.org/settings/api';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchMovies = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${query}&type=movie`);
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
      
// Data structure is different:
// OMDB: data.Search
// TMDB: data.results
      const data = await response.json();
    //   console.log(data.results,data.response);
      console.log(data);
      if (data && data.results.length>0 ) {
        setMovies(data.results);
      } else {
        setMovies([]);
        setError(data.Error || 'No movies found');
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }

    console.log(movies);
  };

  const handleSearch = () => {
    searchMovies(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Film className="text-indigo-500" size={32} />
              <h1 className="text-2xl font-bold text-white">
                Movie<span className="text-indigo-500">Finder</span>
              </h1>
            </div>
            
            {/* Desktop search in navbar - hidden on mobile */}
            <div className="hidden md:block w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
          <div className="text-center mb-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Discover Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Favorite Movie
              </span>
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
              Search through thousands of movies and find detailed information instantly
            </p>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={24} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search for movies (e.g., Inception, Avatar)..."
                className="w-full pl-14 pr-32 py-4 sm:py-5 bg-slate-900/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-xl"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400">{error}</p>
          </div>
        )}

        {/* Empty State (before search) */}
        {!hasSearched && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-full mb-6">
              <Search className="text-indigo-400" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Start Your Search</h3>
            <p className="text-slate-400 text-lg">
              Enter a movie title above to discover amazing films
            </p>
          </div>
        )}

        {/* Movie Grid */}
        {movies.length > 0 && !loading && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Search Results ({movies.length})
              </h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;