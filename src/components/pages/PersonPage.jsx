import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Film, Star } from 'lucide-react';

const API_KEY = 'af3436a31f5d01d0b6665445693316f2';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const PersonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPersonDetails();
  }, [id]);

  const fetchPersonDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const [personRes, creditsRes] = await Promise.all([
        fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/person/${id}/movie_credits?api_key=${API_KEY}`)
      ]);

      const [personData, creditsData] = await Promise.all([
        personRes.json(),
        creditsRes.json()
      ]);

      setPerson(personData);
      
      // Combine cast and crew, remove duplicates, sort by popularity
      const allMovies = [
        ...(creditsData.cast || []),
        ...(creditsData.crew || [])
      ];
      
      // Remove duplicates by movie id
      const uniqueMovies = allMovies.filter((movie, index, self) =>
        index === self.findIndex(m => m.id === movie.id)
      );
      
      // Sort by popularity (most popular first)
      const sortedMovies = uniqueMovies.sort((a, b) => 
        (b.popularity || 0) - (a.popularity || 0)
      );
      
      setCredits(sortedMovies);
    } catch (err) {
      setError('Failed to load person details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Film className="animate-spin text-indigo-500 mx-auto mb-4" size={48} />
          <p className="text-white text-lg">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Film className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-white text-lg">{error || 'Person not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profileUrl = person.profile_path
    ? `${IMAGE_BASE_URL}/w500${person.profile_path}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Person Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profileUrl ? (
              <img
                src={profileUrl}
                alt={person.name}
                className="w-48 sm:w-64 md:w-80 rounded-lg shadow-2xl mx-auto md:mx-0"
              />
            ) : (
              <div className="w-48 sm:w-64 md:w-80 h-72 sm:h-96 bg-slate-800 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                <Film className="text-slate-600" size={80} />
              </div>
            )}
          </div>

          {/* Person Details */}
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {person.name}
            </h1>

            {person.known_for_department && (
              <div className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg mb-6">
                {person.known_for_department}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {person.birthday && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar size={20} className="text-indigo-400" />
                  <span>
                    {new Date(person.birthday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {person.deathday && ` - ${new Date(person.deathday).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}`}
                  </span>
                </div>
              )}

              {person.place_of_birth && (
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin size={20} className="text-indigo-400" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {person.biography && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Biography</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filmography Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Filmography ({credits.length} {credits.length === 1 ? 'movie' : 'movies'})
          </h2>

          {credits.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {credits.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50">
                    {/* Poster */}
                    <div className="relative w-full pb-[150%] bg-slate-900/50">
                      {movie.poster_path ? (
                        <img
                          src={`${IMAGE_BASE_URL}/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="text-slate-600" size={48} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                      {/* Rating Badge */}
                      {movie.vote_average > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 backdrop-blur-sm rounded-md text-xs font-bold text-black shadow-lg flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          {movie.vote_average.toFixed(1)}
                        </div>
                      )}

                      {/* Year Badge */}
                      {movie.release_date && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-md text-xs font-semibold text-slate-300 border border-slate-700/50">
                          {movie.release_date.split('-')[0]}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3
                        className="font-semibold text-white text-sm sm:text-base overflow-hidden group-hover:text-indigo-400 transition-colors"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {movie.title}
                      </h3>
                      {movie.character && (
                        <p className="text-slate-400 text-xs mt-1">
                          as {movie.character}
                        </p>
                      )}
                      {movie.job && (
                        <p className="text-slate-400 text-xs mt-1">
                          {movie.job}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12">No movies found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonPage;