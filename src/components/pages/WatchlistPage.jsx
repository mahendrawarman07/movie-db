import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { ArrowLeft, Bookmark, Trash2, Film, Star } from 'lucide-react';
import FilterBar from '../FilterBar';
import { genreMap } from '../../utilities/genreMap';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist, watchlistCount } = useWatchlist();
  
  const [filters, setFilters] = useState({
    genres: [],
    sort: 'rating'
  });

  const filteredAndSortedMovies = useMemo(() => {
    let movies = [...watchlist];

    // Filter by genre
    if (filters.genres && filters.genres.length > 0) {
      movies = movies.filter(movie => {
        const movieGenres = movie.genres?.map(g => g.id) || movie.genre_ids || [];
        return filters.genres.some(genreId => movieGenres.includes(genreId));
      });
    }

    // Sort
    switch (filters.sort) {
      case 'rating':
        movies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'year':
        movies.sort((a, b) => {
          const yearA = a.release_date ? parseInt(a.release_date.split('-')[0]) : 0;
          const yearB = b.release_date ? parseInt(b.release_date.split('-')[0]) : 0;
          return yearB - yearA;
        });
        break;
      case 'title':
        movies.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'dateAdded':
        // Most recently added first (reverse order)
        movies.reverse();
        break;
      default:
        break;
    }

    return movies;
  }, [watchlist, filters]);

  const getRatingColor = (rating) => {
    if (rating >= 7) return 'bg-green-500';
    if (rating >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
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

            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {watchlistCount > 0 && (
          <>
            <div className="mb-6">
              <p className="text-slate-400 text-lg">
                {filteredAndSortedMovies.length} {filteredAndSortedMovies.length === 1 ? 'movie' : 'movies'}
                {filteredAndSortedMovies.length !== watchlistCount && ` (filtered from ${watchlistCount})`}
              </p>
            </div>

            <FilterBar 
              type="watchlist"
              activeFilters={filters}
              onFilterChange={setFilters}
            />
          </>
        )}

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
        ) : filteredAndSortedMovies.length === 0 ? (
          <div className="text-center py-20">
            <Film className="text-slate-600 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">No Movies Match Your Filters</h3>
            <p className="text-slate-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredAndSortedMovies.map((movie) => (
              <div key={movie.id} className="group relative">
                <div 
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50">
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

                      {movie.vote_average > 0 && (
                        <div className={`absolute top-2 left-2 px-2 py-1 ${getRatingColor(movie.vote_average)} backdrop-blur-sm rounded-md text-xs font-bold text-white shadow-lg flex items-center gap-1`}>
                          <Star size={12} fill="white" />
                          {movie.vote_average.toFixed(1)}
                        </div>
                      )}

                      {movie.release_date && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-md text-xs font-semibold text-slate-300 border border-slate-700/50">
                          {movie.release_date.split('-')[0]}
                        </div>
                      )}

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

                    <div className="p-3 bg-slate-900 h-28 flex flex-col justify-between">
                      <h3
                        className="font-semibold text-white text-xs overflow-hidden group-hover:text-indigo-400 transition-colors"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {movie.title}
                      </h3>
                      {movie.release_date && (
                        <p className="text-slate-400 text-xs">
                          {movie.release_date.split('-')[0]}
                        </p>
                      )}
                      {(movie.genres || movie.genre_ids) && (
                        <div className="flex flex-wrap gap-1">
                          {(movie.genres?.slice(0, 2) || (movie.genre_ids?.slice(0, 2).map(id => ({ name: genreMap[id] })) || [])).map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs border border-slate-700"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
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