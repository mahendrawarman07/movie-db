import React, { useState } from "react";
import { Search, Film, Bookmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWatchlist } from "./context/WatchlistContext";
import NavbarDropdown from "./NavbarDropdown";
import MovieCarousel from "./MovieCarousel";
import FeaturedHero from "./FeaturedHero";
import MobileNavbar from "./MobileNavbar";
import BackToTop from "./BacktoTop";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlistCount } = useWatchlist();

  // Only search query state needed
  const [searchQuery, setSearchQuery] = useState("");

  // Simple search handler - navigate to search page
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      navigate(`/search/${encodedQuery}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Logo click handler - no refresh on home page
  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate("/");
    } else {
      // Already on home, just scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
                onClick={handleLogoClick}
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

      {/* Featured Hero - Always show on home page */}
      <FeaturedHero />

      {/* Content - Movie Carousels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
      
      <BackToTop />
    </div>
  );
};

export default Home;
