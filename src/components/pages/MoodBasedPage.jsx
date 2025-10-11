import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Heart, Zap, Coffee, Sun, Moon, Star, Smile, Frown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../MovieCard';
import { getMoodRecommendations } from '../../utilities/moodRecommendations';

const MoodBasedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist(); // Get watchlist from context
  
  const [selectedMood, setSelectedMood] = useState(() => {
    return sessionStorage.getItem('selectedMood') || null;
  });
  const [movies, setMovies] = useState(() => {
    const saved = sessionStorage.getItem('moodMovies');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mood options with icons and descriptions
  const moods = [
    { id: 'happy', label: 'Happy & Upbeat', icon: <Smile size={24} />, description: 'Feel-good movies to boost your mood' },
    { id: 'romantic', label: 'Romantic', icon: <Heart size={24} />, description: 'Love stories and romantic comedies' },
    { id: 'exciting', label: 'Excited & Energetic', icon: <Zap size={24} />, description: 'Action-packed thrillers and adventures' },
    { id: 'relaxed', label: 'Calm & Relaxed', icon: <Coffee size={24} />, description: 'Peaceful dramas and light comedies' },
    { id: 'nostalgic', label: 'Nostalgic', icon: <Star size={24} />, description: 'Classic films and childhood favorites' },
    { id: 'sad', label: 'Melancholy', icon: <Frown size={24} />, description: 'Emotional dramas and tearjerkers' },
    { id: 'motivated', label: 'Motivated & Inspired', icon: <Sun size={24} />, description: 'Inspiring stories and sports dramas' },
    { id: 'mysterious', label: 'Mystery & Suspense', icon: <Moon size={24} />, description: 'Mysteries, thrillers, and psychological dramas' }
  ];

  // Check if coming back from movie details with mood state
  useEffect(() => {
    if (location.state?.fromMood && location.state?.moodData) {
      setSelectedMood(location.state.moodData.mood);
      setMovies(location.state.moodData.movies);
    }
  }, []);

  const handleMoodSelect = async (moodId) => {
    setSelectedMood(moodId);
    setLoading(true);
    setError('');
    
    // Save mood to sessionStorage
    sessionStorage.setItem('selectedMood', moodId);

    try {
      console.log('=== MOOD RECOMMENDATION DEBUG ===');
      console.log('Selected mood:', moodId);
      console.log('Watchlist from context:', watchlist);
      console.log('Watchlist length:', watchlist?.length || 0);
      
      // Use watchlist from context (it's already loaded from localStorage)
      const recommendations = await getMoodRecommendations(moodId, watchlist || []);
      setMovies(recommendations);
      
      // Save movies to sessionStorage
      sessionStorage.setItem('moodMovies', JSON.stringify(recommendations));
    } catch (err) {
      setError('Failed to get mood-based recommendations. Please try again.');
      console.error('Mood recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`, {
      state: {
        fromMood: true,
        moodData: { mood: selectedMood, movies }
      }
    });
  };

  const handleBackToMoods = () => {
    setSelectedMood(null);
    setMovies([]);
    setError('');
    // Clear sessionStorage
    sessionStorage.removeItem('selectedMood');
    sessionStorage.removeItem('moodMovies');
  };

  const selectedMoodData = moods.find(m => m.id === selectedMood);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => selectedMood ? handleBackToMoods() : navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{selectedMood ? 'Back to Moods' : 'Home'}</span>
            </button>
            <div className="h-6 w-px bg-slate-700" />
            <h1 className="text-xl font-bold text-white">
              {selectedMood ? selectedMoodData?.label : 'Mood-Based Movies'}
            </h1>
            {/* Debug info */}
            {watchlist && watchlist.length > 0 && (
              <span className="text-xs text-slate-400 ml-2">
                ({watchlist.length} movies in watchlist)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedMood ? (
          // Mood Selection Screen
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                How are you feeling?
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Tell us your current mood and we'll recommend the perfect movies to match your vibe
              </p>
              {watchlist && watchlist.length > 0 && (
                <p className="text-indigo-400 mt-2 text-sm">
                  ✨ Personalized based on your {watchlist.length} watched movies
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className="group p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-4 bg-slate-800/50 rounded-full group-hover:bg-indigo-600/20 transition-colors">
                      <div className="text-indigo-400 group-hover:text-indigo-300">
                        {mood.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {mood.label}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {mood.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          // Movie Results Screen
          <>
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
                  <p className="text-white text-lg">Finding perfect movies for your mood...</p>
                  <p className="text-slate-400 mt-2">
                    {watchlist && watchlist.length > 0 
                      ? `Analyzing your ${watchlist.length} watched movies for personalization`
                      : 'Getting popular recommendations'
                    }
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-6">
                  <Frown className="text-slate-500" size={40} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Something went wrong</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <button
                  onClick={() => handleMoodSelect(selectedMood)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {movies.length > 0 && !loading && (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-600/20 rounded-lg">
                      {selectedMoodData?.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedMoodData?.label} Movies
                      </h2>
                      <p className="text-slate-400">
                        {movies.length} recommendations • {selectedMoodData?.description}
                        {watchlist && watchlist.length > 0 && (
                          <span className="text-indigo-400 ml-2">
                            • Personalized for you
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {movies.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => handleMovieClick(movie.id)}
                      className="cursor-pointer"
                    >
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoodBasedPage;
