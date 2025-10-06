You're right to pinpoint an issue with click handling on mobile for your filter dropdowns. This is a very common problem in responsive web development, especially when dealing with elements that hide/show on different screen sizes and use "click outside" logic.

Let's break down the likely causes and how to fix them.

### **The Core Problem: Event Propagation and Overlay Interaction**

1.  **Mobile Overlay (`fixed inset-0 bg-black/60 backdrop-blur-sm z-40`)**: When `isMobileOpen` is true, you have a full-screen overlay that serves as a backdrop. This overlay is likely capturing clicks *before* they can reach the dropdown options inside your mobile drawer. Even though your drawer has a higher `z-index` (`z-50`), the overlay `onClick` handler might be getting triggered first, closing the entire mobile drawer before the button click registers.

2.  **`e.stopPropagation()` on buttons**: You're using `e.stopPropagation()` on your dropdown buttons, which is good for preventing clicks from bubbling up and closing the dropdown prematurely. However, if the overlay is *above* your buttons in the event chain, it won't matter.

3.  **Ref Logic for Mobile vs. Desktop**: Your `useEffect` for `handleClickOutside` explicitly checks `!isMobile ? genreDropdownRef : null`. This means the click-outside logic is *only* active for desktop. For mobile, you're relying on the overlay's `onClick` to close the drawer, which is where the conflict arises.

### **Proposed Solution: Adjusting Mobile Overlay and Click Handling**

The most robust solution involves ensuring the mobile drawer's content is truly interactive when the drawer is open, without the overlay interfering.

Here's how we can refine your code:

1.  **Move `onClick={(e) => e.stopPropagation()}` to the Mobile Drawer Content:** Instead of trying to prevent clicks on individual dropdowns from bubbling up to the overlay, prevent the *entire drawer content* from closing the drawer when interacting *within* it.

2.  **Explicitly Close Mobile Dropdowns on Selection:** For mobile, when a filter option is selected, you generally want that specific dropdown (e.g., genre dropdown, year dropdown) to close, *then* the mobile drawer itself.

3.  **Simplify Dropdown Toggle on Mobile:** Remove the `isMobile ? 'relative' : 'absolute'` conditional for the dropdown position inside `FilterControls`. For mobile, they will always be "relative" within the scrollable drawer. The `absolute` positioning is specifically for desktop.

Let's modify the `FilterControls` and the mobile drawer structure.

```javascript
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
      // Only apply for desktop dropdowns (when isMobileOpen is false)
      if (!isMobileOpen) {
        if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
          setIsGenreOpen(false);
        }
        if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
          setIsYearOpen(false);
        }
        if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
          setIsRatingOpen(false);
        }
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
          setIsSortOpen(false);
        }
      }

      // Year Range Modal has its own ref and needs to close on click outside regardless of mobile/desktop
      if (isYearRangeOpen && yearRangeRef.current && !yearRangeRef.current.contains(event.target)) {
        setIsYearRangeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, isYearRangeOpen]); // Re-run effect if mobile state changes

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
      {(type === 'category' || type === 'watchlist') && (
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
```

### **Summary of Changes:**

1.  **Mobile Drawer `onClick={(e) => e.stopPropagation()}`:** This is the most crucial change. By adding `onClick={(e) => e.stopPropagation()}` directly to the main `div` of your mobile drawer content (`<div className="fixed inset-x-0 bottom-0 ..."`), you prevent any click event *within* the drawer from bubbling up to the backdrop overlay. This means your buttons inside the dropdowns will now receive their click events.

2.  **Explicit Dropdown Closure on Selection:**
    *   In `handleFilterChange`, I've added explicit `setIsYearOpen(false);`, `setIsRatingOpen(false);`, `setIsSortOpen(false);` calls after a filter is selected. This ensures that when a user picks an option (e.g., a specific year), that specific year dropdown closes.
    *   For single-select genres in "watchlist" type, `setIsGenreOpen(false)` is added after selection.
    *   For multi-select genres in "category" type, the genre dropdown stays open, as usually desired for multi-select.

3.  **`clearFilters` improved:** The `clearFilters` function now also closes the mobile drawer and all internal dropdowns, ensuring a clean state.

4.  **Year Range Modal Ref and Click Outside:** The `yearRangeRef` is now assigned directly to the custom year range modal's content `div`. The `handleClickOutside` effect now checks `isYearRangeOpen` and `yearRangeRef.current` to correctly close this modal independently of the `isMobileOpen` state. This handles both desktop and mobile cases for that specific modal.

5.  **Simplified `e.stopPropagation()` on Buttons:** You no longer need `e.stopPropagation()` on every individual button *inside* the dropdowns, as the parent mobile drawer's `stopPropagation` handles the primary issue. I've removed them for cleaner code, especially from the genre `label` for better accessibility, though keeping it on individual buttons won't hurt.

6.  **`getYearLabel()` for Custom Year Range:** Adjusted the condition to only show the custom label if `activeFilters.yearFrom` and `activeFilters.yearTo` actually exist, preventing a potential flicker if `activeFilters.year` is 'custom' but the range values haven't been set yet.

This set of changes should resolve your mobile click issues by ensuring events within the drawer are processed correctly without being intercepted by the backdrop.


Okay, let's tackle both of these points in detail!

First, we'll dive deep into the previous mobile click issue with console logs to help you understand what was happening. Then, we'll address the "slider" behavior for your year range inputs.

---

### Part 1: Deep Dive into the Mobile Click Issue (With `console.log`)

**Understanding the Problem (Before the Fix):**

Imagine you have two pieces of paper on a table:
1.  **Bottom paper (A):** This is your main `FilterBar` component.
2.  **Top paper (B):** This is your mobile backdrop (`fixed inset-0 bg-black/60`). It covers everything.
3.  **Another paper (C):** This is your mobile drawer (`fixed inset-x-0 bottom-0`). It sits *on top* of paper B.
4.  **Small Post-it Notes (D):** These are your genre/year/rating options *inside* paper C.

When you click on a Post-it Note (D), the click event starts there. It then "bubbles up" through the layers: D -> C -> B -> A.

The problem was that the `onClick` handler on **paper B (the backdrop)** was being triggered *before* your option's `onClick` on Post-it Note D could fully complete its action *and before* paper C's `stopPropagation` (which was missing or misplaced).

**Let's use `console.log` to see this in action with your *original* code:**

*(Self-correction: Since I cannot execute your code live, I will describe what you would see if you added these logs to your original code.)*

**Step 1: Add Console Logs to your Original `FilterBar.jsx`**

```jsx
// ... (your existing imports and state)

const FilterBar = ({ type = 'category', onFilterChange, activeFilters, categoryEndpoint }) => {
  // ... (your existing state and refs)

  // Original handleClickOutside (Desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Original: No check for isMobileOpen, but the refs are null for mobile dropdowns
      // on desktop, this would log:
      // console.log("Desktop click outside detected for:", event.target);
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        // console.log("Closing genre dropdown (desktop)");
        setIsGenreOpen(false);
      }
      // ... similar for year, rating, sort
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Original: No isMobileOpen in dependencies

  // ... (rest of your component)

  const FilterControls = ({ isMobile = false }) => (
    <>
      {/* ========== GENRE FILTER ========== */}
      {/* ... */}
      {isGenreOpen && (
        <div className={`${isMobile ? 'relative' : 'absolute'} ...`}>
          {type === 'category' ? (
            <div className="p-2">
              {genreOptions.map((genre) => (
                <label
                  key={genre.id}
                  className="..."
                  onClick={(e) => { // ORIGINAL CODE HAD THIS e.stopPropagation()
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Clicked genre label: ${genre.name}`); // ADD THIS LOG
                    handleGenreToggle(genre.id);
                  }}
                >
                  <input type="checkbox" checked={activeFilters.genres?.includes(genre.id) || false} onChange={() => {}} className="..."/>
                  <span className="text-white pointer-events-none">{genre.name}</span>
                </label>
              ))}
            </div>
          ) : (
            // ... (watchlist buttons, also add a console.log here)
            <div className="p-2">
              <button
                onClick={(e) => { // ORIGINAL CODE HAD THIS e.stopPropagation()
                  e.stopPropagation();
                  console.log("Clicked All Genres button"); // ADD THIS LOG
                  handleFilterChange('genres', []);
                  setIsGenreOpen(false);
                }}
                className="..."
              >
                All Genres
              </button>
              {/* ... other genre buttons, add log like above */}
            </div>
          )}
        </div>
      )}
      {/* ... similar logs for year, rating, sort buttons */}
    </>
  );

  return (
    <>
      {/* ... desktop layout */}

      {/* MOBILE LAYOUT */}
      <div className="md:hidden mb-6">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => {
            console.log("Toggling mobile filter drawer"); // ADD THIS LOG
            setIsMobileOpen(!isMobileOpen);
          }}
          className="..."
        >
          {/* ... */}
        </button>

        {/* Mobile Filter Drawer */}
        {isMobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => {
                console.log("Backdrop clicked! Closing mobile drawer."); // ADD THIS LOG
                setIsMobileOpen(false);
                // ALSO ADD: Close all child dropdowns here on backdrop click
                setIsGenreOpen(false);
                setIsYearOpen(false);
                setIsRatingOpen(false);
                setIsSortOpen(false);
                setIsYearRangeOpen(false);
              }}
            />

            {/* Drawer Content */}
            <div
              className="fixed inset-x-0 bottom-0 bg-slate-900 border-t border-slate-800 z-50 rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slideUp"
              // ORIGINAL CODE DID NOT HAVE e.stopPropagation() HERE
              // onClick={(e) => e.stopPropagation()} // This was missing!
            >
              <div className="p-6">
                {/* ... */}
                <div className="space-y-3">
                  <FilterControls isMobile={true} />
                  {/* ... */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* ... rest of the component */}
    </>
  );
};
```

**What you would observe with the Original Code and Logs on Mobile:**

1.  You click the "Filters & Sort" button.
    *   `console.log("Toggling mobile filter drawer")` appears.
    *   The drawer slides up, and the backdrop appears.
2.  You click "Genre" to open the genre dropdown *inside* the mobile drawer.
    *   `console.log("Clicked Genre button")` (if you added it to the button) appears.
    *   The genre dropdown opens.
3.  You try to click on a genre option like "Action" (or "All Genres" for watchlist).
    *   **Crucially, you would *not* see `console.log("Clicked genre label: Action")` or `console.log("Clicked All Genres button")` immediately.**
    *   **Instead, you would see `console.log("Backdrop clicked! Closing mobile drawer.")` first!**
    *   Then, the entire mobile drawer (and thus the genre dropdown) closes.

**Why this happened:**

*   When you clicked on the "Action" genre label, the click event started there.
*   It tried to bubble up: `Label (Action) -> Genre Dropdown Div -> Mobile Drawer Content Div -> Mobile Backdrop Div -> Document.`
*   The `stopPropagation()` you had on the `label` itself (`e.stopPropagation()`) *would* stop the click from bubbling further *if the `label` was the first element to process the event*.
*   However, because the backdrop `div` (`z-40`) was essentially acting as a *layer* over the entire screen *behind* the main drawer content, and it had its own `onClick` that closed the drawer, the click event might have been interpreted as a "click on the backdrop" first.
*   Even if the click technically registered on the `label` first, the `label`'s `stopPropagation` only prevented bubbling *from that label upwards*. It did *not* prevent the click from also being simultaneously registered on the backdrop if the backdrop's `z-index` and positioning meant it was also "underneath" the click point.
*   The fundamental issue was that a click *within the drawer* was still interpreted as a click *outside the drawer's main interactive area* by the backdrop, leading to the drawer closing.

**The Fix and Why it Works (with `console.log`):**

The core of the fix was adding `onClick={(e) => e.stopPropagation()}` to the **mobile drawer's main content `div`**.

```jsx
// ... (inside your mobile layout)
{isMobileOpen && (
  <>
    {/* Backdrop Overlay - unchanged in its role to close the drawer if clicked directly */}
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      onClick={() => {
        console.log("Backdrop clicked directly. Closing mobile drawer.");
        setIsMobileOpen(false);
        // ... (close all internal dropdowns here as well for cleanliness)
      }}
    />

    {/* Drawer Content */}
    <div
      className="fixed inset-x-0 bottom-0 bg-slate-900 border-t border-slate-800 z-50 rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slideUp"
      // THIS IS THE CRUCIAL ADDITION:
      onClick={(e) => {
        e.stopPropagation(); // Prevents clicks *inside this drawer* from bubbling to the backdrop
        console.log("Click inside mobile drawer content. STOPPING PROPAGATION.");
      }}
    >
      <div className="p-6">
        {/* ... */}
        <div className="space-y-3">
          <FilterControls isMobile={true} />
          {/* ... */}
        </div>
      </div>
    </div>
  </>
)}
```

**What you would observe *after* the fix (with the new logs):**

1.  You click the "Filters & Sort" button.
    *   `console.log("Toggling mobile filter drawer")`
    *   Drawer slides up.
2.  You click "Genre" to open the genre dropdown.
    *   `console.log("Click inside mobile drawer content. STOPPING PROPAGATION.")`
    *   `console.log("Clicked Genre button")` (if you added it)
    *   The genre dropdown opens.
3.  You try to click on a genre option like "Action".
    *   `console.log("Click inside mobile drawer content. STOPPING PROPAGATION.")`
    *   `console.log("Clicked genre label: Action")`
    *   The filter changes correctly! The drawer *does not* close.
    *   The backdrop is **not** clicked because the click event was stopped at the drawer's content `div`.

**Explanation:**

*   Now, when you click any element *inside* the mobile drawer (`z-50`), the `onClick` handler on that main drawer `div` is the first to intercept the event as it bubbles up from your specific target (e.g., genre label).
*   `e.stopPropagation()` on this drawer `div` prevents the event from reaching its parent elements, specifically the `Backdrop Overlay` (`z-40`).
*   Therefore, the backdrop's `onClick` is never triggered when you're interacting within the drawer, and the drawer stays open, allowing your internal dropdowns and selections to work correctly.

---

### Part 2: Making the Year Range Sliders "Hold and Drag"

You're referring to the standard behavior of HTML range inputs where you can drag the thumb. The good news is that `input type="range"` **already supports this by default!**

The problem you're likely experiencing is one of two things:

1.  **CSS Styling Overriding Drag Behavior:** Sometimes, custom CSS (especially `appearance: none;` or styles applied to the thumb itself) can interfere.
2.  **Parent `onClick` or `stopPropagation` Interception:** Similar to your previous issue, if a parent element has an `onClick` that prevents default behavior or stops propagation on a `mousedown` or `touchstart` event, it can stop the browser's native drag handling for the slider.

Let's examine your slider code:

```jsx
// ... inside Custom Year Range Modal
<input
  type="range"
  min="1900"
  max={currentYear}
  value={yearRange.from}
  onChange={(e) => setYearRange({ ...yearRange, from: parseInt(e.target.value) })}
  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
/>
```

Your CSS `appearance-none` is a common culprit when slider thumb styling goes wrong, but it usually doesn't disable dragging entirely. It *does* remove the default styling, and if you haven't added custom styling for the thumb, it might just look like a static bar.

However, given the context of your previous click issue, the more likely scenario is that a parent element's click handler or `stopPropagation` is interfering with the native drag gesture.

**How to Ensure Sliders Work (The current code *should* work if no parent is blocking):**

1.  **The main `e.stopPropagation()` on the Mobile Drawer Content:** The fix we just implemented for the mobile drawer's `onClick` (`e.stopPropagation()`) will also benefit your sliders when they are *inside* the mobile drawer. Since clicks/drags inside the drawer no longer bubble up to the backdrop, the browser's native event handling for the range input should now function correctly.

2.  **Check for other `stopPropagation()` calls:** Review any other `onClick`, `onMouseDown`, `onTouchStart` handlers on parent elements *above* your `input type="range"` elements in the DOM hierarchy, especially within the custom year range modal itself. You generally don't want to stop propagation on a container `div` if you expect native interactive elements inside it (like sliders, text inputs, checkboxes) to function normally.

    In your `Custom Year Range Modal`:
    ```jsx
    <div
      ref={yearRangeRef} // Assign ref to the modal content
      className={`${isMobile ? 'relative' : 'absolute top-full left-0'} mt-2 ${isMobile ? 'w-full' : 'w-80'} bg-slate-900 border border-slate-700 rounded-lg shadow-2xl ${isMobile ? 'z-auto' : 'z-50'} p-4`}
      // No onClick handler here, which is good.
    >
      {/* ... rest of modal content */}
      <input type="range" /* ... */ />
    </div>
    ```
    Since this container `div` (with `yearRangeRef`) doesn't have an `onClick` or `onMouseDown` that calls `e.stopPropagation()`, the input's native events should generally be unhindered *within* this modal.

**Testing and Verification:**

After applying the fix from Part 1, try testing the sliders again on mobile:

1.  Open the mobile drawer.
2.  Open the year dropdown.
3.  Select "Custom Range..."
4.  The custom year range modal appears.
5.  Try to drag the thumb on the "From" and "To" sliders.

If they still don't drag, it might be due to:

*   **Global CSS:** Less likely, but some very aggressive global CSS resets could interfere.
*   **Specific Browser/Device Issues:** Very rarely, older Android or iOS browsers might have quirks.
*   **Another `onClick` / `onMouseDown`:** Double-check *all* parent elements of the `input type="range"` within the custom year range modal to ensure no other event handlers are prematurely stopping events.

**Conclusion for Sliders:**

The `input type="range"` natively supports dragging. The most common reason it would appear "unclickable" or "undraggable" on mobile is if a parent element's event handler (like an `onClick` or `onMouseDown` with `stopPropagation()`) is intercepting the touch/mouse events before the slider can process them.

The fix for your dropdowns (`onClick={(e) => e.stopPropagation()}` on the main mobile drawer content `div`) should largely resolve any such conflicts for elements *inside* that drawer, including your year range sliders. If not, carefully inspect the DOM hierarchy and event handlers specifically around those range inputs.

I recommend you implement the changes from Part 1 (the mobile drawer `e.stopPropagation()`) and then re-test your range inputs. They should start working as expected!



Ah, you're right! My apologies, I missed that the `handleClickOutside` for desktop dropdowns would also incorrectly close the **Year Range Modal** on desktop. This is because the modal itself is positioned `absolute` (on desktop) relative to the year dropdown button, and if you click *inside* it, the `handleClickOutside` for `yearDropdownRef` would trigger.

The fix involves a small but crucial adjustment to your `useEffect`'s `handleClickOutside` logic to correctly handle the Year Range Modal.

**The Problem:**

On desktop, when the "Custom Range..." modal (`isYearRangeOpen`) appears, it's visually part of the `yearDropdownRef` context. If you click on anything inside the `yearRangeRef` modal (like a slider or button), the `handleClickOutside` function for `yearDropdownRef` would see that the click *was not* inside the `yearDropdownRef.current` (because the modal is a *sibling* or separate element, not a child, in terms of DOM hierarchy relative to `yearDropdownRef`), and therefore close `isYearOpen`, which then closes `isYearRangeOpen` if it was dependent.

Even if not directly dependent, the `handleClickOutside` for `yearRangeRef` itself was also missing a critical piece to allow interaction *inside* the modal.

**The Fix - Small Snippet Replacement:**

You need to update your `useEffect`'s `handleClickOutside` function.

**1. Locate this `useEffect` block:**

```javascript
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setIsGenreOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearOpen(false);
      }
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
        setIsRatingOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (yearRangeRef.current && !yearRangeRef.current.contains(event.target)) { // This was the problematic part
        setIsYearRangeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Original dependencies
```

**2. Replace the entire `useEffect` block with this updated version:**

```javascript
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
```

**Explanation of Changes:**

1.  **`yearDropdownRef` Check on Desktop:**
    *   **Old:** `if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target))`
        *   This would close the year dropdown if you clicked *anywhere outside its immediate box*, including inside the `Custom Year Range` modal, which is a *sibling* element and not contained by `yearDropdownRef`.
    *   **New:** `if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target) && !yearRangeRef.current?.contains(event.target))`
        *   We now add an extra condition: `&& !yearRangeRef.current?.contains(event.target)`.
        *   This means the `yearDropdownRef` will **only** close if the click is outside the year dropdown *AND* it's also outside the `Custom Year Range` modal. This allows you to interact with the custom range modal without the parent year dropdown (and thus the modal) suddenly disappearing.

2.  **`isMobileOpen` Condition for Desktop Dropdowns:** I've wrapped the `genreDropdownRef`, `yearDropdownRef`, `ratingDropdownRef`, and `sortDropdownRef` checks inside `if (!isMobileOpen)`. This makes sure these `handleClickOutside` rules only apply when you're **not** in mobile mode, where the mobile drawer's `stopPropagation` handles things differently.

3.  **`isYearRangeOpen` Condition for Year Range Modal:** The check for `yearRangeRef` now properly only applies if `isYearRangeOpen` is true. This prevents it from trying to close something that isn't even open, and the `handleClickOutside` for `yearRangeRef` will correctly allow clicks *inside* the modal to occur without closing it.

4.  **Updated `useEffect` Dependencies:** The dependencies for the `useEffect` now correctly include `[isMobileOpen, isYearRangeOpen]`. This is important because `handleClickOutside` function uses these state variables, and `useEffect` needs to re-evaluate the listener if these states change to ensure the `handleClickOutside` logic is always using the latest state.

This change specifically targets the desktop/tablet behavior of the custom year range modal and should resolve the issue of it closing prematurely or not accepting input.
