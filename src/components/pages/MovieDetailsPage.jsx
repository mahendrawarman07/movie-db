import {React,useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MovieDetails from '../MovieDetails';
import { useWatchlist } from '../context/WatchlistContext';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist(); 
    useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <MovieDetails 
      movieId={id}
      mode="fullpage"
      onClose={() => navigate(-1)}
      onMovieClick={(newMovieId) => navigate(`/movie/${newMovieId}`)}
    //   onPersonClick={(personId, personName) => {
    //     console.log('Future: Navigate to person page:', personId, personName);
    //     // Later: navigate(`/person/${personId}`)
    //   }}
      onPersonClick={(personId) => navigate(`/person/${personId}`)}
    //   onAddToWatchlist={(movie) => {
    //     console.log('Add to watchlist:', movie);
    //     // Later: Use context to add
    //   }}
      onAddToWatchlist = {toggleWatchlist} 
    //   isInWatchlist={false}
      isInWatchlist={isInWatchlist(parseInt(id))}
    />
  );
};

export default MovieDetailsPage;