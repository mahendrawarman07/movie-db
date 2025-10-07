import React, { useState, useRef, useEffect } from 'react';
import { ListFilter as Filter, X, ChevronDown } from 'lucide-react';
import { genreMap } from '../utilities/genreMap';

// ============================================
// MAIN FILTER BAR COMPONENT
// Handles both mobile and desktop filter layouts
// ============================================
const FilterBar = ({ type = 'category', onFilterChange, activeFilters, categoryEndpoint }) => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile drawer open/close
  const [isGenreOpen, setIsGenreOpen] = useState(false); // Genre dropdown state
  const [isYearOpen, setIsYearOpen] = useState(false); // Year dropdown state
  const [isRatingOpen, setIsRatingOpen] = useState(false); // Rating dropdown state
  const [isSortOpen, setIsSortOpen] = useState(false); // Sort dropdown state
  const [isYearRangeOpen, setIsYearRangeOpen] = useState(false); // Custom year range modal state

  // ============================================
  // REFS FOR CLICK OUTSIDE DETECTION (Desktop only)
  // ============================================
  const genreDropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const ratingDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const yearRangeRef = useRef(null); // This ref is for the YEAR RANGE MODAL itself

  // ============================================
  // CLICK OUTSIDE HANDLER (Desktop only dropdowns & Desktop Year Range Modal)
  // Closes dropdowns when clicking outside
  // ============================================
useEffect(() => {
    const handleClickOutside = (event) => {
      // Logic for desktop dropdowns
      // We only want to close these if a click occurs outside of them AND outside the year range modal
      // This is crucial for desktop year dropdown + custom range modal interaction.
      if (!isMobileOpen) { // Only apply this logic for desktop mode
        if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
          setIsGenreOpen(false);
        }
        if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target) && !yearRangeRef.current?.contains(event.target)) {
          // IMPORTANT: Check if click is NOT within year dropdown AND NOT within year range modal
          setIsYearOpen(false);
        }
        if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
          setIsRatingOpen(false);
        }
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
          setIsSortOpen(false);
        }
      }

      // Logic for the Year Range Modal (desktop and mobile)
      // Close the year range modal ONLY if clicked outside of it.
      // We don't want it to close if clicked inside, or if it's already closed.
      if (isYearRangeOpen && yearRangeRef.current && !yearRangeRef.current.contains(event.target)) {
        setIsYearRangeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, isYearRangeOpen]); // Ensure dependencies are updated

  // ============================================
  // FILTER OPTIONS DATA
  // ============================================

  // Genre options from genre map
  const genreOptions = Object.entries(genreMap).map(([id, name]) => ({
    id: parseInt(id),
    name
  }));

  // Year range state
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState({
    from: activeFilters.yearFrom || 1900,
    to: activeFilters.yearTo || currentYear
  });

  // Year filter options
  const yearOptions = [
    { value: 'all', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2020-2024', label: '2020-2024' },
    { value: '2015-2019', label: '2015-2019' },
    { value: '2010-2014', label: '2010-2014' },
    { value: '2000-2009', label: '2000-2009' },
    { value: 'custom', label: 'Custom Range...' }
  ];

  // Rating filter options
  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '9', label: '9+ Stars' },
    { value: '8', label: '8+ Stars' },
    { value: '7', label: '7+ Stars' },
    { value: '6', label: '6+ Stars' },
    { value: '5', label: '5+ Stars' },
    { value: '0-5', label: 'Less than 5' }
  ];

  // Sort options (varies by page type)
  const getSortOptions = () => {
    if (type === 'watchlist') {
      return [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'year', label: 'Newest First' },
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'dateAdded', label: 'Recently Added' }
      ];
    }

    if (categoryEndpoint === 'popular') {
      return [
        { value: 'vote_average.desc', label: 'Highest Rated' },
        { value: 'release_date.desc', label: 'Newest First' },
        { value: 'release_date.asc', label: 'Oldest First' },
        { value: 'title.asc', label: 'Title (A-Z)' }
      ];
    }

    return [
      { value: 'popularity.desc', label: 'Popularity' },
      { value: 'vote_average.desc', label: 'Highest Rated' },
      { value: 'release_date.desc', label: 'Newest First' },
      { value: 'release_date.asc', label: 'Oldest First' },
      { value: 'title.asc', label: 'Title (A-Z)' }
    ];
  };

  const sortOptions = getSortOptions();

  // ============================================
  // FILTER CHANGE HANDLERS
  // ============================================

  // General filter change handler
  const handleFilterChange = (filterType, value) => {
    onFilterChange({ ...activeFilters, [filterType]: value });
    // When a filter is selected, close its specific dropdown
    if (filterType === 'year') setIsYearOpen(false);
    if (filterType === 'rating') setIsRatingOpen(false);
    if (filterType === 'sort') setIsSortOpen(false);
  };

  // Genre toggle handler (for multi-select genres)
  const handleGenreToggle = (genreId) => {
    const currentGenres = activeFilters.genres || [];
    const newGenres = currentGenres.includes(genreId)
      ? currentGenres.filter(id => id !== genreId)
      : [...currentGenres, genreId];

    onFilterChange({ ...activeFilters, genres: newGenres });
    // No need to close genre dropdown for multi-select immediately, user might select more
  };

  // Year change handler
  const handleYearChange = (value) => {
    if (value === 'custom') {
      setIsYearRangeOpen(true);
      setIsYearOpen(false); // Close the year dropdown when custom range modal opens
      return;
    }

    handleFilterChange('year', value);
    setIsYearOpen(false); // Close year dropdown after selection
  };

  // Year range apply handler
  const handleYearRangeApply = () => {
    onFilterChange({
      ...activeFilters,
      year: 'custom',
      yearFrom: yearRange.from,
      yearTo: yearRange.to
    });
    setIsYearRangeOpen(false); // Close the year range modal
  };

  // Clear all filters
  const clearFilters = () => {
    setYearRange({ from: 1900, to: currentYear });
    onFilterChange({
      genres: [],
      year: 'all',
      yearFrom: undefined,
      yearTo: undefined,
      rating: 'all',
      sort: type === 'watchlist' ? 'rating' : 'popularity.desc'
    });
    // Close all dropdowns and mobile drawer when filters are cleared
    setIsGenreOpen(false);
    setIsYearOpen(false);
    setIsRatingOpen(false);
    setIsSortOpen(false);
    setIsYearRangeOpen(false);
    setIsMobileOpen(false);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (activeFilters.genres && activeFilters.genres.length > 0) ||
      (activeFilters.year && activeFilters.year !== 'all') ||
      (activeFilters.rating && activeFilters.rating !== 'all')
    );
  };

  // Get year label for display
  const getYearLabel = () => {
    if (activeFilters.year === 'custom') {
      return `${activeFilters.yearFrom} - ${activeFilters.yearTo}`;
    }
    return yearOptions.find(y => y.value === activeFilters.year)?.label || 'All Years';
  };

  // ============================================
  // FILTER CONTROLS COMPONENT
  // Renders the actual filter buttons and dropdowns
  // Used by both desktop and mobile layouts
  // ============================================
  const FilterControls = ({ isMobile = false }) => (
    <>
      {/* ========== GENRE FILTER ========== */}
      {(type === 'category' || type === 'watchlist' || type === 'search') && (
        <div className="relative" ref={!isMobile ? genreDropdownRef : null}>
          {/* Genre Button */}
          <button
            onClick={() => setIsGenreOpen(!isGenreOpen)}
            className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all flex items-center justify-between md:justify-start gap-2"
          >
            <span>Genre</span>
            <ChevronDown size={16} className={`transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Genre Dropdown */}
          {isGenreOpen && (
            <div className={`${isMobile ? 'relative' : 'absolute'} ${isMobile ? 'w-full' : 'top-full left-0'} mt-2 ${isMobile ? '' : 'w-64'} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl ${isMobile ? 'z-auto' : 'z-10'} max-h-80 overflow-y-auto scrollbar-hide`}>
              {/* Category Page: Multi-select checkboxes */}
              {type === 'category' ? (
                <div className="p-2">
                  {genreOptions.map((genre) => (
                    <label
                      key={genre.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer select-none active:bg-slate-700"
                      // Removed e.preventDefault() and e.stopPropagation() here to allow label to function normally
                      onClick={() => handleGenreToggle(genre.id)} // Click handler directly on label
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.genres?.includes(genre.id) || false}
                        onChange={() => {}} // onChange is required but we handle click on label
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-white">{genre.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                // Watchlist: Single-select buttons
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleFilterChange('genres', []);
                      setIsGenreOpen(false); // Close dropdown after selection
                    }}
                    className="w-full text-left px-3 py-2 text-white hover:bg-slate-800 rounded active:bg-slate-700"
                  >
                    All Genres
                  </button>
                  {genreOptions.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        handleFilterChange('genres', [genre.id]);
                        setIsGenreOpen(false); // Close dropdown after selection
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-800 rounded active:bg-slate-700 ${
                        activeFilters.genres?.includes(genre.id) ? 'text-indigo-400' : 'text-white'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== YEAR FILTER ========== */}
      {/* Hidden on watchlist page */}
      {type !== 'watchlist' && (
        <div className="relative" ref={!isMobile ? yearDropdownRef : null}>
          {/* Year Button */}
          <button
            onClick={() => setIsYearOpen(!isYearOpen)}
            className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all flex items-center justify-between md:justify-start gap-2"
          >
            <span>{getYearLabel()}</span>
            <ChevronDown size={16} className={`transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Year Dropdown */}
          {isYearOpen && (
            <div className={`${isMobile ? 'relative' : 'absolute top-full left-0'} mt-2 ${isMobile ? 'w-full' : 'min-w-[200px]'} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl ${isMobile ? 'z-auto' : 'z-10'} max-h-60 overflow-y-auto scrollbar-hide`}>
              <div className="p-2">
                {yearOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleYearChange(option.value);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 rounded active:bg-slate-700 ${
                      activeFilters.year === option.value ? 'text-indigo-400 bg-slate-800/50' : 'text-white'
                    }`}
                  >
                    {option.value === 'custom' && activeFilters.year === 'custom' && activeFilters.yearFrom && activeFilters.yearTo
                      ? getYearLabel() // Only show custom label if active and values exist
                      : option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Year Range Modal */}
          {isYearRangeOpen && (
            <>
              {/* Desktop: Backdrop overlay */}
              {!isMobile && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsYearRangeOpen(false)}
                />
              )}
              {/* Year Range Selector */}
              <div
                ref={yearRangeRef} // Assign ref to the modal content
                className={`${isMobile ? 'relative' : 'absolute top-full left-0'} mt-2 ${isMobile ? 'w-full' : 'w-80'} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl ${isMobile ? 'z-auto' : 'z-50'} p-4`}
              >
                <h4 className="text-white font-semibold mb-4">Custom Year Range</h4>

                <div className="space-y-4">
                  {/* From Year Slider */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">From: {yearRange.from}</label>
                    <input
                      type="range"
                      min="1900"
                      max={currentYear}
                      value={yearRange.from}
                      onChange={(e) => setYearRange({ ...yearRange, from: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* To Year Slider */}
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">To: {yearRange.to}</label>
                    <input
                      type="range"
                      min="1900"
                      max={currentYear}
                      value={yearRange.to}
                      onChange={(e) => setYearRange({ ...yearRange, to: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleYearRangeApply}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setIsYearRangeOpen(false)}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== RATING FILTER ========== */}
      {/* Hidden on watchlist page */}
      {type !== 'watchlist' && (
        <div className="relative" ref={!isMobile ? ratingDropdownRef : null}>
          {/* Rating Button */}
          <button
            onClick={() => setIsRatingOpen(!isRatingOpen)}
            className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all flex items-center justify-between md:justify-start gap-2"
          >
            <span>{ratingOptions.find(r => r.value === activeFilters.rating)?.label || 'All Ratings'}</span>
            <ChevronDown size={16} className={`transition-transform ${isRatingOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Rating Dropdown */}
          {isRatingOpen && (
            <div className={`${isMobile ? 'relative' : 'absolute top-full left-0'} mt-2 ${isMobile ? 'w-full' : 'min-w-[200px]'} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl ${isMobile ? 'z-auto' : 'z-10'} max-h-60 overflow-y-auto scrollbar-hide`}>
              <div className="p-2">
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange('rating', option.value);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 rounded active:bg-slate-700 ${
                      activeFilters.rating === option.value ? 'text-indigo-400 bg-slate-800/50' : 'text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== SORT FILTER ========== */}
      <div className="relative" ref={!isMobile ? sortDropdownRef : null}>
        {/* Sort Button */}
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full md:w-auto px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all flex items-center justify-between md:justify-start gap-2"
        >
          <span>{sortOptions.find(s => s.value === (activeFilters.sort || (type === 'watchlist' ? 'rating' : 'popularity.desc')))?.label || 'Sort By'}</span>
          <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Sort Dropdown */}
        {isSortOpen && (
          <div className={`${isMobile ? 'relative' : 'absolute top-full left-0'} mt-2 ${isMobile ? 'w-full' : 'min-w-[200px]'} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl ${isMobile ? 'z-auto' : 'z-10'} max-h-60 overflow-y-auto scrollbar-hide`}>
            <div className="p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleFilterChange('sort', option.value);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-800 rounded active:bg-slate-700 ${
                    (activeFilters.sort || (type === 'watchlist' ? 'rating' : 'popularity.desc')) === option.value ? 'text-indigo-400 bg-slate-800/50' : 'text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== CLEAR FILTERS BUTTON (Desktop only) ========== */}
      {hasActiveFilters() && !isMobile && (
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

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <>
      {/* ========================================== */}
      {/* DESKTOP LAYOUT (hidden on mobile) */}
      {/* ========================================== */}
      <div className="hidden md:flex items-center gap-3 mb-6 flex-wrap">
        <FilterControls />
      </div>

      {/* ========================================== */}
      {/* MOBILE LAYOUT (hidden on desktop) */}
      {/* ========================================== */}
      <div className="md:hidden mb-6">
        {/* Mobile Filter Toggle Button */}
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

        {/* Mobile Filter Drawer */}
        {isMobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer Content */}
            <div
              className="fixed inset-x-0 bottom-0 bg-slate-900 border-t border-slate-800 z-50 rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slideUp"
              // Crucial change: Add stopPropagation here.
              // This prevents clicks *inside* the drawer from bubbling up to the backdrop and closing the drawer.
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Filters & Sort</h3>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Filter Controls (Mobile Version) */}
                {/* Ensure all mobile dropdowns are closed when the main mobile drawer is closed */}
                <div className="space-y-3">
                  <FilterControls isMobile={true} />

                  {/* Clear All Filters Button (Mobile) */}
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters} // clearFilters now handles closing mobile drawer
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      <span>Clear All Filters</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================== */}
      {/* ACTIVE FILTER TAGS (Both Mobile & Desktop) */}
      {/* ========================================== */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Genre Tags */}
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

          {/* Year Tag */}
          {activeFilters.year && activeFilters.year !== 'all' && (
            <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full flex items-center gap-2">
              {getYearLabel()}
              <button onClick={() => handleFilterChange('year', 'all')}>
                <X size={14} />
              </button>
            </span>
          )}

          {/* Rating Tag */}
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