import React, { useState } from "react";
import { Menu, X, Film, Bookmark, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "./context/WatchlistContext";

const MobileNavbar = ({ searchQuery, setSearchQuery, handleKeyPress }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { watchlistCount } = useWatchlist();

  const menuItems = [
    { label: "Popular", path: "/movies/popular", icon: "⭐" },
    { label: "Now Playing", path: "/movies/now-playing", icon: "🎬" },
    { label: "Upcoming", path: "/movies/upcoming", icon: "🎯" },
    { label: "Top Rated", path: "/movies/top-rated", icon: "🏆" },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      handleKeyPress(e);
      setIsMenuOpen(false); // ← Close menu after search
    }
  };

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between h-16 px-4">
        {/* Left: Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-white hover:text-indigo-400 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center: Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Film className="text-indigo-500" size={28} />
          <h1 className="text-xl font-bold text-white">
            Movie<span className="text-indigo-500">Finder</span>
          </h1>
        </div>

        {/* Right: Search + Watchlist */}
        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white hover:text-indigo-400 transition-colors"
          >
            <Search size={24} />
          </button>

          {/* Watchlist */}
          <button
            onClick={() => navigate("/watchlist")}
            className="relative p-2 text-white hover:text-indigo-400 transition-colors"
          >
            <Bookmark size={24} />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50 md:hidden animate-slideDown">
            <div className="px-4 py-4">
              {/* Close Button - ADD THIS */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Search & Browse
                </h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Browse Movies
                </div>
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleMenuClick(item.path)}
                    className="w-full px-3 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Watchlist Link */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleMenuClick("/watchlist")}
                  className="w-full px-3 py-3 text-left flex items-center justify-between text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark size={20} />
                    <span>My Watchlist</span>
                  </div>
                  {watchlistCount > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                      {watchlistCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNavbar;
