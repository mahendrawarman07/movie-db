import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from './context/WatchlistContext';
import MovieDetails from './MovieDetails';

const MovieModal = ({ movieId, onClose }) => {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExpand = () => {
    onClose(); // Close modal first
    navigate(`/movie/${movieId}`); // Then navigate to full page
  };

  const handleMovieClick = (newMovieId) => {
    // When clicking similar movie in modal, navigate to that movie's page
    onClose();
    navigate(`/movie/${newMovieId}`);
  };

  const handlePersonClick = (personId) => {
    // When clicking actor/director in modal, navigate to person page
    onClose();
    navigate(`/person/${personId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-6xl bg-slate-950 sm:rounded-xl overflow-hidden shadow-2xl animate-slideUp">
        <MovieDetails
          movieId={movieId}
          mode="modal"
          onClose={onClose}
          onExpand={handleExpand}
          onMovieClick={handleMovieClick}
          onPersonClick={handlePersonClick}
          onAddToWatchlist={toggleWatchlist}
          isInWatchlist={isInWatchlist(parseInt(movieId))}
        />
      </div>
    </div>
  );
};

export default MovieModal;