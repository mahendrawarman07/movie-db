import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { ArrowLeft, Bookmark, Trash2, Film, Star } from 'lucide-react';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist, watchlistCount } = useWatchlist();

  const getRatingColor = (rating) => {
    if (rating >= 7) return 'bg-green-500';
    if (rating >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-2 text-white">
              <Bookmark className="text-indigo-500" size={24} />
              <h1 className="text-xl sm:text-2xl font-bold">My Watchlist</h1>
            </div>

            <div className="w-16" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Watchlist Count */}
        {watchlistCount > 0 && (
          <div className="mb-6">
            <p className="text-slate-400 text-lg">
              {watchlistCount} {watchlistCount === 1 ? 'movie' : 'movies'} in your watchlist
            </p>
          </div>
        )}

        {/* Empty State */}
        {watchlistCount === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-full mb-6">
              <Bookmark className="text-indigo-400" size={40} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Your Watchlist is Empty
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Start adding movies you want to watch later
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
            >
              Discover Movies
            </button>
          </div>
        ) : (
          /* Movie Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {watchlist.map((movie) => (
              <div key={movie.id} className="group relative">
                <div 
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50">
                    {/* Poster */}
                    <div className="relative w-full pb-[150%] bg-slate-900/50">
                      {movie.poster_path ? (
                        <img
                          src={`${IMAGE_BASE_URL}/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="text-slate-600" size={48} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                      {/* Rating Badge */}
                      {movie.vote_average > 0 && (
                        <div className={`absolute top-2 left-2 px-2 py-1 ${getRatingColor(movie.vote_average)} backdrop-blur-sm rounded-md text-xs font-bold text-white shadow-lg flex items-center gap-1`}>
                          <Star size={12} fill="white" />
                          {movie.vote_average.toFixed(1)}
                        </div>
                      )}

                      {/* Year Badge */}
                      {movie.release_date && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-md text-xs font-semibold text-slate-300 border border-slate-700/50">
                          {movie.release_date.split('-')[0]}
                        </div>
                      )}

                      {/* Remove Button - Shows on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(movie.id);
                        }}
                        className="absolute bottom-2 right-2 p-2 bg-red-600/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3
                        className="font-semibold text-white text-sm sm:text-base overflow-hidden group-hover:text-indigo-400 transition-colors"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {movie.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;