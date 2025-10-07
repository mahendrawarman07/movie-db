import React, { useState , useEffect} from "react";
import { Search, Film, Loader, ChevronDown, Bookmark } from "lucide-react";
import { useNavigate , useLocation} from "react-router-dom";
import { useWatchlist } from "./context/WatchlistContext";
import MovieCard from "./MovieCard";
// import MovieGrid from "./MovieGrid";
// import TabNavigation from "./TabNavigation";
import NavbarDropdown from "./NavbarDropdown";
import MovieCarousel from "./MovieCarousel";
import FeaturedHero from "./FeaturedHero";
import MobileNavbar from "./MobileNavbar";
import BackToTop from "./BacktoTop";
import FilterBar from './FilterBar';

// Inside Home component, add:


const API_KEY = "af3436a31f5d01d0b6665445693316f2";
const BASE_URL = "https://api.themoviedb.org/3";

const Home = () => {
  const navigate = useNavigate();
  const { watchlistCount } = useWatchlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const [searchFilters, setSearchFilters] = useState({
  genres: [],
  year: 'all',
  yearFrom: undefined,
  yearTo: undefined,
  rating: 'all',
  sort: 'popularity.desc'
});

const location = useLocation();

// Check if coming from movie details with search state
useEffect(() => {
  if (location.state?.fromSearch && location.state?.searchQuery) {
    setSearchQuery(location.state.searchQuery);
    setHasSearched(true);
    searchMovies(location.state.searchQuery, 1, false);
  }
}, []);



  // Tab state
  // const [activeTab, setActiveTab] = useState("search");

  // const tabs = [
  //   { id: "popular", label: "Popular" },
  //   { id: "nowPlaying", label: "Now Playing" },
  //   { id: "upcoming", label: "Upcoming" },
  //   { id: "topRated", label: "Top Rated" },
  //   {
  //     id: "search",
  //     label: "Search Results",
  //     badge: searchResults.length > 0 ? searchResults.length : null,
  //   },
  // ];

const searchMovies = async (query, page = 1, append = false) => {
  if (!query.trim()) return;

  if (append) {
    setLoadingMore(true);
  } else {
    setLoading(true);
    setSearchResults([]);
  }

  setError('');
  setHasSearched(true);

  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      query: query,
      page: page,
      sort_by: searchFilters.sort
    });

    // Add year filter
    if (searchFilters.year && searchFilters.year !== 'all') {
      if (searchFilters.year === 'custom' && searchFilters.yearFrom && searchFilters.yearTo) {
        params.append('primary_release_date.gte', `${searchFilters.yearFrom}-01-01`);
        params.append('primary_release_date.lte', `${searchFilters.yearTo}-12-31`);
      } else if (searchFilters.year.includes('-')) {
        const [startYear, endYear] = searchFilters.year.split('-');
        params.append('primary_release_date.gte', `${startYear}-01-01`);
        params.append('primary_release_date.lte', `${endYear}-12-31`);
      } else {
        params.append('primary_release_year', searchFilters.year);
      }
    }

    // Add rating filter
    if (searchFilters.rating && searchFilters.rating !== 'all') {
      if (searchFilters.rating === '0-5') {
        params.append('vote_average.lte', '5');
      } else {
        params.append('vote_average.gte', searchFilters.rating);
      }
      params.append('vote_count.gte', '100');
    }
    console.log( `${params.toString()}`);
    const response = await fetch(
      `${BASE_URL}/search/movie?${params.toString()}`
    );
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

  useEffect(() => {
  if (hasSearched && searchQuery) {
    console.log(searchQuery);
    searchMovies(searchQuery, 1, false);
  }
}, [searchFilters]);



  const handleSearch = () => {
    setCurrentPage(1);
    searchMovies(searchQuery, 1, false);
  };

  const handleSearchFilterChange = (newFilters) => {
  setSearchFilters(newFilters);
  if (hasSearched && searchQuery) {
    searchMovies(searchQuery, 1, false);
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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <Film className="text-indigo-500" size={32} />
                <h1 className="text-2xl font-bold text-white">
                  Movie<span className="text-indigo-500">Finder</span>
                </h1>
              </div>

              {/* Dropdown */}
              <NavbarDropdown />
            </div>

            {/* Right side: Search + Watchlist */}
            <div className="flex items-center gap-4">
              {/* Desktop search */}
              <div className="w-96">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
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

              {/* Watchlist Button */}
              <button
                onClick={() => navigate("/watchlist")}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white hover:border-indigo-500 transition-all"
              >
                <Bookmark size={20} className="text-indigo-400" />
                <span>Watchlist</span>
                {watchlistCount > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    {watchlistCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navbar */}
          <MobileNavbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleKeyPress={handleKeyPress}
          />
        </div>
      </nav>

      {/* Featured Hero - Only show when NOT searching */}
      {!hasSearched && <FeaturedHero />}

      {/* Search Hero - Show when searching */}
      {hasSearched && (
        <div className="relative overflow-hidden bg-slate-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Search Results
              </h2>
              <p className="text-slate-400">
                Showing results for "{searchQuery}"
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                  size={24}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Search for movies..."
                  className="w-full pl-14 pr-32 py-4 bg-slate-900/50 backdrop-blur-sm border-2 border-slate-700 rounded-2xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-xl"
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
      )}

      {/* Content - Remove Tabs, Add Carousels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Section - Only show if user has searched */}
        {hasSearched && (
          <div className="mb-12">
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
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No Results Found
                </h3>
                <p className="text-slate-400 mb-6">
                  We couldn't find any movies matching "
                  <span className="text-white font-semibold">
                    {searchQuery}
                  </span>
                  "
                </p>
                <div className="space-y-2 text-slate-400 text-sm">
                  <p>• Try different keywords</p>
                  <p>• Check your spelling</p>
                  <p>• Use more general terms</p>
                </div>
              </div>
            )}

            {searchResults.length > 0 && !loading && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      Search Results
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Showing {showingCount} of {totalResults.toLocaleString()}{" "}
                      results
                      {hasMoreResults &&
                        ` • Page ${currentPage} of ${totalPages}`}
                    </p>
                  </div>
                </div>
                    {/* ADD FILTER BAR HERE */}
                <FilterBar 
                  type="search"
                  activeFilters={searchFilters}
                  // onFilterChange={setSearchFilters}
                  onFilterChange={handleSearchFilterChange}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
  {searchResults.map((movie) => (
    <div 
      key={movie.id} 
      onClick={() => navigate(`/movie/${movie.id}`, { 
        state: { fromSearch: true, searchQuery: searchQuery }
      })}
    >
      <MovieCard movie={movie} />
    </div>
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
        )}

        {/* Movie Carousels - Show when NOT searching */}
        {!hasSearched && (
          <>
            <MovieCarousel
              endpoint="popular"
              title="Popular Movies"
              icon="⭐"
              seeAllPath="/movies/popular"
            />

            <MovieCarousel
              endpoint="now_playing"
              title="Now Playing"
              icon="🎬"
              seeAllPath="/movies/now-playing"
            />

            <MovieCarousel
              endpoint="upcoming"
              title="Coming Soon"
              icon="🎯"
              seeAllPath="/movies/upcoming"
            />

            <MovieCarousel
              endpoint="top_rated"
              title="Top Rated"
              icon="🏆"
              seeAllPath="/movies/top-rated"
            />

            {/* AI Recommended Carousel - Only show if watchlist has movies */}
{watchlistCount > 0 && (
  <MovieCarousel
    endpoint="ai_recommended"
    title="AI Recommended for You"
    icon="✨"
    seeAllPath="/movies/ai-recommended"
  />
)}
          </>
        )}
      </div>
      <BackToTop />
    </div>
  );
};

export default Home;
