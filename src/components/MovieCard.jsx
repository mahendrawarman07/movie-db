import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Star, Bookmark } from "lucide-react";
import { useWatchlist } from "./context/WatchlistContext";
import { genreMap } from "../utilities/genreMap";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const [imageError, setImageError] = useState(false);

  const posterUrl =
    movie.poster_path && !imageError
      ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
      : null;

  const inWatchlist = isInWatchlist(movie.id);

  const getRatingColor = (rating) => {
    if (rating >= 7) return "bg-green-500";
    if (rating >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation(); // Prevent card click
    toggleWatchlist(movie);
  };

  // Get genres from genre_ids using genreMap
  const genreNames = movie.genre_ids
    ? movie.genre_ids
        .slice(0, 2)
        .map((id) => genreMap[id])
        .filter(Boolean)
    : movie.genres
    ? movie.genres.slice(0, 2).map((g) => g.name)
    : [];

  // Fallback: if no genres array, we can't show genres (API doesn't return names in list endpoints)
  // For now, we'll just show what's available

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden rounded-lg bg-slate-900 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50">
        {/* Poster Section */}
        <div className="relative w-full pb-[150%] bg-slate-900/50">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="text-slate-600" size={48} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

          {/* Rating Badge - Top Left */}
          {movie.vote_average > 0 && (
            <div
              className={`absolute top-2 left-2 px-2 py-1 ${getRatingColor(
                movie.vote_average
              )} backdrop-blur-sm rounded-md text-xs font-bold text-white shadow-lg flex items-center gap-1`}
            >
              <Star size={12} fill="white" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}

          {/* Bookmark Button - Top Right */}
          <button
            onClick={handleWatchlistClick}
            className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full transition-all hover:scale-110 ${
              inWatchlist
                ? "bg-green-600 hover:bg-green-700 animate-bookmark-pop"
                : "bg-slate-900/70 hover:bg-slate-800"
            }`}
            title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Bookmark
              size={16}
              className="text-white transition-transform"
              fill={inWatchlist ? "white" : "none"}
            />
            {/* Checkmark popup animation */}
            {inWatchlist && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-400 text-lg animate-float-up">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="p-3 bg-slate-900 h-28 flex flex-col justify-between">
          {/* Title */}
          <h3
            className="font-bold text-white text-xs sm:text-sm mb-1 overflow-hidden group-hover:text-indigo-400 transition-colors"
            // text-sm sm:text-base → text-xs sm:text-sm
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {movie.title}
          </h3>

          {/* Year */}
          {movie.release_date && (
            <p className="text-slate-400 text-xs mb-2">
              {movie.release_date.split("-")[0]}
            </p>
          )}

          {/* Genres */}
          {genreNames.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genreNames.map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-xs border border-slate-700"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
