import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Film, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { getRecommendedMovies } from '../../utilities/aiRecommendations';
import MovieCard from '../MovieCard';

const AIRecommendedPage = () => {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recommended = await getRecommendedMovies(watchlist);
      setMovies(recommended);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
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
            <Sparkles className="text-indigo-400" />
            <span>AI Recommended for You</span>
          </h1>
          <p className="text-slate-400">
            Based on your watchlist • Powered by AI
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/50 rounded-lg h-80 sm:h-96" />
              </div>
            ))}
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="text-slate-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Add movies to your watchlist
            </h3>
            <p className="text-slate-400 mb-6">
              We need some movies in your watchlist to generate AI recommendations
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendedPage;