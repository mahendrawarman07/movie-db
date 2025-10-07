import React, { useState, useEffect } from "react";
import {
  Star,
  Clock,
  Calendar,
  Play,
  Plus,
  Check,
  User,
  Film,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


const API_KEY = "af3436a31f5d01d0b6665445693316f2";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const MovieDetails = ({
  movieId,
  mode = "modal", // 'modal' or 'fullpage'
  onClose,
  onExpand,
  onAddToWatchlist,
  isInWatchlist = false,
  onMovieClick, // For clicking similar movies
  onPersonClick, // For clicking cast/director (future: person's movies page)
}) => {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [showTrailer, setShowTrailer] = useState(false);
  const [similarScrollPosition, setSimilarScrollPosition] = useState(0);

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const [movieRes, creditsRes, videosRes, similarRes, reviewsRes] =
        await Promise.all([
          fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`),
          fetch(`${BASE_URL}/movie/${movieId}/reviews?api_key=${API_KEY}`),
        ]);

      const [movieData, creditsData, videosData, similarData, reviewsData] =
        await Promise.all([
          movieRes.json(),
          creditsRes.json(),
          videosRes.json(),
          similarRes.json(),
          reviewsRes.json(),
        ]);

      setMovie(movieData);
      setCredits(creditsData);
      setVideos(videosData.results || []);
      setSimilar(similarData.results || []);
      setReviews(reviewsData.results?.slice(0, 5) || []);
    } catch (err) {
      setError("Failed to load movie details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 7) return "bg-green-500";
    if (rating >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTrailer = () => {
    const trailer = videos.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    return trailer || videos[0];
  };

  const handleSimilarScroll = (direction) => {
    const container = document.getElementById("similar-movies-container");
    const scrollAmount = 300;
    if (container) {
      const newPosition =
        direction === "left"
          ? Math.max(0, similarScrollPosition - scrollAmount)
          : similarScrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setSimilarScrollPosition(newPosition);
    }
  };

  const handleSimilarMovieClick = (movieId) => {
    if (onMovieClick) {
      onMovieClick(movieId);
    } else {
      // Fallback: reload current component with new movie
      window.scrollTo(0, 0);
      fetchMovieDetails();
    }
  };

  const handlePersonClick = (personId, personName) => {
    if (onPersonClick) {
      onPersonClick(personId, personName);
    } else {
      console.log("Future: Navigate to person page:", personId, personName);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Film
            className="animate-spin text-indigo-500 mx-auto mb-4"
            size={48}
          />
          <p className="text-white text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Film className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-white text-lg">{error || "Movie not found"}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : null;
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
    : null;
  const trailer = getTrailer();
  const director = credits?.crew?.find((person) => person.job === "Director");
  const cast = credits?.cast || [];

  return (
    <div
      className={`${
        mode === "modal" ? "max-h-[90vh] overflow-y-auto" : "min-h-screen"
      } bg-slate-950`}
    >
      {/* Backdrop Header */}
      <div className="relative min-h-[70vh] sm:min-h-[55vh] md:h-[60vh]">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <Film className="text-slate-700" size={120} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          {mode === "modal" && onExpand && (
            <button
              onClick={onExpand}
              className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-full hover:bg-indigo-600 transition-all"
              title="Expand to full page"
            >
              <Maximize2 size={20} className="text-white" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-full hover:bg-red-600 transition-all"
            >
              <X size={20} className="text-white" />
            </button>
          )}
        </div>

        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
            {posterUrl && (
              <div className="flex-shrink-0">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-20 h-28 min-[400px]:w-28 min-[400px]:h-auto sm:w-32 sm:h-auto md:w-48 object-cover rounded-lg shadow-2xl"
                />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-slate-400 text-lg italic mb-4">
                  "{movie.tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div
                  className={`${getRatingColor(
                    movie.vote_average
                  )} px-3 py-1 rounded-lg flex items-center gap-1`}
                >
                  <Star size={16} fill="white" className="text-white" />
                  <span className="text-white font-bold">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-300">
                  <Calendar size={16} />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock size={16} />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-slate-800/80 backdrop-blur-sm text-slate-300 rounded-full text-sm border border-slate-700"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Play size={20} fill="white" />
                    Watch Trailer
                  </button>
                )}

                <button
                  onClick={() => onAddToWatchlist && onAddToWatchlist(movie)}
                  className={`px-3 min-[400px]:px-5 sm:px-6 py-2 min-[400px]:py-3 sm:py-3 text-xs min-[400px]:text-base sm:text-base ${
                    isInWatchlist
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-slate-800 hover:bg-slate-700"
                  } text-white font-semibold rounded-lg transition-all shadow-lg flex items-center gap-1 sm:gap-2 border border-slate-700`}
                >
                  {" "}
                  {isInWatchlist ? (
                    <>
                      <Check size={16} className="sm:w-5 sm:h-5" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="sm:w-5 sm:h-5" />
                      Add to Watchlist
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex gap-4 border-b border-slate-800 mb-8">
          {["about", "cast", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

{activeTab === 'about' && (
  <div className="space-y-8 pb-8">
    {/* Overview */}
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
      <p className="text-slate-300 text-lg leading-relaxed">{movie.overview}</p>
    </div>

    {/* Movie Details Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Original Title */}
      {movie.original_title && movie.original_title !== movie.title && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Original Title</h3>
          <p className="text-white">{movie.original_title}</p>
        </div>
      )}

      {/* Status */}
      {movie.status && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Status</h3>
          <p className="text-white">{movie.status}</p>
        </div>
      )}

      {/* Original Language */}
      {movie.original_language && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Original Language</h3>
          <p className="text-white uppercase">{movie.original_language}</p>
        </div>
      )}

      {/* Budget */}
      {movie.budget > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Budget</h3>
          <p className="text-white">${movie.budget.toLocaleString()}</p>
        </div>
      )}

      {/* Revenue */}
      {movie.revenue > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Revenue</h3>
          <p className="text-white">${movie.revenue.toLocaleString()}</p>
        </div>
      )}

      {/* Profit */}
      {movie.revenue > 0 && movie.budget > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Profit</h3>
          <p className={`font-semibold ${movie.revenue - movie.budget > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(movie.revenue - movie.budget).toLocaleString()}
          </p>
        </div>
      )}

      {/* Vote Count */}
      {movie.vote_count > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Vote Count</h3>
          <p className="text-white">{movie.vote_count.toLocaleString()} votes</p>
        </div>
      )}

      {/* Popularity */}
      {movie.popularity && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Popularity</h3>
          <p className="text-white">{movie.popularity.toFixed(1)}</p>
        </div>
      )}

      {/* Homepage */}
      {movie.homepage && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Official Website</h3>
          <a 
            href={movie.homepage} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            Visit Site
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>

    {/* Director */}
    {director && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Director</h3>
        <div 
          onClick={() => handlePersonClick(director.id, director.name)}
          className="inline-flex items-center gap-4 cursor-pointer hover:bg-slate-900/50 p-3 rounded-lg transition-all"
        >
          {director.profile_path ? (
            <img 
              src={`${IMAGE_BASE_URL}/w200${director.profile_path}`}
              alt={director.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
              <User className="text-slate-600" size={32} />
            </div>
          )}
          <p className="text-slate-300 text-lg hover:text-indigo-400 transition-colors">{director.name}</p>
        </div>
      </div>
    )}

    {/* Production Companies */}
    {movie.production_companies?.length > 0 && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Production Companies</h3>
        <div className="flex flex-wrap gap-6">
          {movie.production_companies.map(company => (
            <div key={company.id} className="flex flex-col items-center gap-2">
              {company.logo_path ? (
                <img 
                  src={`${IMAGE_BASE_URL}/w200${company.logo_path}`}
                  alt={company.name}
                  className="h-16 object-contain bg-white p-2 rounded"
                />
              ) : (
                <span className="text-slate-300">{company.name}</span>
              )}
              {company.logo_path && (
                <span className="text-slate-400 text-xs">{company.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Production Countries */}
    {movie.production_countries?.length > 0 && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Production Countries</h3>
        <div className="flex flex-wrap gap-2">
          {movie.production_countries.map((country, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700"
            >
              {country.name}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Spoken Languages */}
    {movie.spoken_languages?.length > 0 && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Spoken Languages</h3>
        <div className="flex flex-wrap gap-2">
          {movie.spoken_languages.map((lang, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700"
            >
              {lang.english_name}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Similar Movies */}
    {similar.length > 0 && (
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Similar Movies</h3>
        <div className="relative group">
          <button
            onClick={() => handleSimilarScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-slate-900/90 rounded-full hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          
          <div 
            id="similar-movies-container"
            className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {similar.map(sim => (
              <div 
                key={sim.id} 
                onClick={() => handleSimilarMovieClick(sim.id)}
                className="flex-shrink-0 w-36 cursor-pointer hover:scale-105 transition-transform"
              >
                {sim.poster_path ? (
                  <img 
                    src={`${IMAGE_BASE_URL}/w200${sim.poster_path}`}
                    alt={sim.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full h-54 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Film className="text-slate-600" size={32} />
                  </div>
                )}
                <p className="text-white text-sm mt-2 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {sim.title}
                </p>
                {sim.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                    <Star size={12} fill="currentColor" />
                    <span>{sim.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handleSimilarScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 bg-slate-900/90 rounded-full hover:bg-indigo-600 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </div>
      </div>
    )}
  </div>
)}

        {activeTab === "cast" && (
          <div className="pb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Full Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {cast.map((person) => (
                <div
                  key={person.id}
                  onClick={() => handlePersonClick(person.id, person.name)}
                  className="text-center cursor-pointer hover:scale-105 transition-transform"
                >
                  {person.profile_path ? (
                    <img
                      src={`${IMAGE_BASE_URL}/w200${person.profile_path}`}
                      alt={person.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-slate-800 rounded-lg mb-2 flex items-center justify-center">
                      <User className="text-slate-600" size={48} />
                    </div>
                  )}
                  <p className="text-white font-semibold text-sm hover:text-indigo-400 transition-colors">
                    {person.name}
                  </p>
                  <p className="text-slate-400 text-xs">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="pb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {review.author[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {review.author}
                        </p>
                        {review.author_details?.rating && (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <Star size={14} fill="currentColor" />
                            <span>{review.author_details.rating}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p
                      className="text-slate-300 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">
                No reviews available
              </p>
            )}
          </div>
        )}
      </div>

      {showTrailer && trailer && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 p-2 bg-slate-900 rounded-full hover:bg-red-600 transition-all"
            >
              <X size={24} className="text-white" />
            </button>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
