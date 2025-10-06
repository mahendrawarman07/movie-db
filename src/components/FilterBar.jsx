import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { genreMap } from '../utilities/genreMap';

const FilterBar = ({ type = 'category', onFilterChange, activeFilters }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Genre options (convert genreMap to array)
  const genreOptions = Object.entries(genreMap).map(([id, name]) => ({
    id: parseInt(id),
    name
  }));

  // Year options
  const yearOptions = [
    { value: 'all', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2020-2024', label: '2020-2024' },
    { value: '2015-2019', label: '2015-2019' },
    { value: '2010-2014', label: '2010-2014' },
    { value: '2000-2009', label: '2000-2009' },
  ];

  // Rating options
  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '9', label: '9+ Stars' },
    { value: '8', label: '8+ Stars' },
    { value: '7', label: '7+ Stars' },
    { value: '6', label: '6+ Stars' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'title.asc', label: 'Title (A-Z)' },
    { value: 'title.desc', label: 'Title (Z-A)' },
  ];

  // Watchlist sort options (different)
  const watchlistSortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'year', label: 'Newest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'dateAdded', label: 'Recently Added' },
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({ ...activeFilters, [filterType]: value });
    setIsMobileOpen(false); // Close mobile drawer after selection
  };

  const handleGenreToggle = (genreId) => {
    const currentGenres = activeFilters.genres || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter(id => id !== genreId)
      : [...currentGenres, genreId];
    
    onFilterChange({ ...activeFilters, genres: newGenres });
  };

  const clearFilters = () => {
    onFilterChange({
      genres: [],
      year: 'all',
      rating: 'all',
      sort: type === 'watchlist' ? 'rating' : 'popularity.desc'
    });
  };

  const hasActiveFilters = () => {
    return (
      (activeFilters.genres && activeFilters.genres.length > 0) ||
      (activeFilters.year && activeFilters.year !== 'all') ||
      (activeFilters.rating && activeFilters.rating !== 'all')
    );
  };

  // Desktop Filter Bar
  const FilterControls = () => (
    <>
      {/* Genre Filter - Only for category and watchlist */}
      {(type === 'category' || type === 'watchlist') && (
        <div className="relative group">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all flex items-center gap-2 ">
            <span>Genre</span>
            <ChevronDown size={16} />
          </button>
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 max-h-80 overflow-y-auto scrollbar-hide">
            {type === 'category' ? (
              // Multi-select for category pages
              <div className="p-2">
                {genreOptions.map((genre) => (
                  <label
                    key={genre.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.genres?.includes(genre.id) || false}
                      onChange={() => handleGenreToggle(genre.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-white">{genre.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              // Single-select for watchlist
              <div className="p-2">
                <button
                  onClick={() => handleFilterChange('genres', [])}
                  className="w-full text-left px-3 py-2 text-white hover:bg-slate-800 rounded"
                >
                  All Genres
                </button>
                {genreOptions.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleFilterChange('genres', [genre.id])}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 rounded ${
                      activeFilters.genres?.includes(genre.id) ? 'text-indigo-400' : 'text-white'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Year Filter - Not for watchlist */}
      {type !== 'watchlist' && (

        <select
          value={activeFilters.year || 'all'}
          onChange={(e) => handleFilterChange('year', e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all focus:outline-none focus:border-indigo-500"
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

      )}

      {/* Rating Filter - Not for watchlist */}
      {type !== 'watchlist' && (
        <select
          value={activeFilters.rating || 'all'}
          onChange={(e) => handleFilterChange('rating', e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all focus:outline-none focus:border-indigo-500"
        >
          {ratingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={activeFilters.sort || (type === 'watchlist' ? 'rating' : 'popularity.desc')}
        onChange={(e) => handleFilterChange('sort', e.target.value)}
        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all focus:outline-none focus:border-indigo-500"
      >
        <option disabled>Sort By</option>
        {(type === 'watchlist' ? watchlistSortOptions : sortOptions).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters() && (
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <X size={16} />
          <span>Clear</span>
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Filter Bar */}
      <div className="hidden md:flex items-center gap-3 mb-6 flex-wrap">
        <FilterControls />
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <span>Filters & Sort</span>
          </div>
          {hasActiveFilters() && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 bg-slate-900 border-t border-slate-800 z-50 rounded-t-2xl overflow-y-auto animate-slideUp">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Filters & Sort</h3>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-3 flex flex-wrap gap-3">
                  <FilterControls />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.genres?.map((genreId) => (
            <span
              key={genreId}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full flex items-center gap-2"
            >
              {genreMap[genreId]}
              <button onClick={() => handleGenreToggle(genreId)}>
                <X size={14} />
              </button>
            </span>
          ))}
          {activeFilters.year && activeFilters.year !== 'all' && (
            <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full flex items-center gap-2">
              {yearOptions.find(y => y.value === activeFilters.year)?.label}
              <button onClick={() => handleFilterChange('year', 'all')}>
                <X size={14} />
              </button>
            </span>
          )}
          {activeFilters.rating && activeFilters.rating !== 'all' && (
            <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full flex items-center gap-2">
              {ratingOptions.find(r => r.value === activeFilters.rating)?.label}
              <button onClick={() => handleFilterChange('rating', 'all')}>
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default FilterBar;