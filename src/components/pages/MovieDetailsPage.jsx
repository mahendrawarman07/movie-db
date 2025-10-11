import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MovieDetails from '../MovieDetails';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Store the original navigation source persistently
// Store the original navigation source persistently
const originalSource = useRef(location.state?.fromSearch 
  ? { type: 'search', path: location.state.searchPath }
  : location.state?.fromWatchlist 
  ? { type: 'watchlist', path: '/watchlist' }
  : null
);

// Set original source only once when first arriving from search/watchlist
useEffect(() => {
  console.log('UseEffect running, location.state:', location.state);
  console.log('originalSource.current before:', originalSource.current);
  
  if (location.state?.fromSearch && originalSource.current === null) {
    originalSource.current = {
      type: 'search',
      path: location.state.searchPath
    };
    console.log('Set originalSource to search:', originalSource.current);
  } else if (location.state?.fromWatchlist && originalSource.current === null) {
    originalSource.current = {
      type: 'watchlist',
      path: '/watchlist'
    };
    console.log('Set originalSource to watchlist:', originalSource.current);
  }
}, []); // Empty dependency array - run only once on mount

// Also set it immediately on component creation
if (location.state?.fromSearch && originalSource.current === null) {
  originalSource.current = {
    type: 'search',
    path: location.state.searchPath
  };
} else if (location.state?.fromWatchlist && originalSource.current === null) {
  originalSource.current = {
    type: 'watchlist', 
    path: '/watchlist'
  };
}

  
  console.log('MovieDetailsPage location.state:', location.state);
  console.log('OriginalSource:', originalSource.current);

  const handleBack = () => {
    console.log('Going back to previous page');
    
    // Always use browser history for natural navigation
    window.history.back();
  };

  const handleMovieClick = (newMovieId) => {
    // Navigate to new movie WITHOUT any state - just use browser history
    navigate(`/movie/${newMovieId}`);
    
    // Scroll to top when navigating to new movie
    window.scrollTo(0, 0);
  };

  const handlePersonClick = (personId, name) => {
    navigate(`/person/${personId}`, {
      state: {
        fromMovieDetails: true,
        movieId: id
      }
    });
  };

  const handleAddToWatchlist = (movie) => {
    console.log("Add to watchlist:", movie.title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <MovieDetails
        movieId={parseInt(id)}
        mode="fullpage"
        onBack={handleBack}
        onMovieClick={handleMovieClick}
        onPersonClick={handlePersonClick}
        onAddToWatchlist={handleAddToWatchlist}
      />
    </div>
  );
};

export default MovieDetailsPage;
