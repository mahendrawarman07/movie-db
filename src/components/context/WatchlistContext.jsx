import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const WatchlistContext = createContext();

// Custom hook to use watchlist
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

// Provider Component
export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('movieWatchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Add movie to watchlist
  const addToWatchlist = (movie) => {
    setWatchlist(prev => {
      // Check if already in watchlist
      if (prev.find(m => m.id === movie.id)) {
        return prev; // Already exists, don't add
      }
      return [...prev, movie];
    });
  };

  // Remove movie from watchlist
  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(m => m.id !== movieId));
  };

  // Check if movie is in watchlist
  const isInWatchlist = (movieId) => {
    return watchlist.some(m => m.id === movieId);
  };

  // Toggle movie in/out of watchlist
  const toggleWatchlist = (movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    watchlistCount: watchlist.length
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};