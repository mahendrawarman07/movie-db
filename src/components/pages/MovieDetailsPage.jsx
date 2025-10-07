import {React,useEffect} from 'react';
import { useParams, useNavigate , useLocation} from 'react-router-dom';
import MovieDetails from '../MovieDetails';
import { useWatchlist } from '../context/WatchlistContext';


const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist(); 
    useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

//   const { id } = useParams();
// const navigate = useNavigate();
const location = useLocation();
// const { toggleWatchlist, isInWatchlist } = useWatchlist();

//   return (
//     <MovieDetails 
//       movieId={id}
//       mode="fullpage"
//       onClose={() => navigate(-1)}
//       onMovieClick={(newMovieId) => navigate(`/movie/${newMovieId}`)}
//     //   onPersonClick={(personId, personName) => {
//     //     console.log('Future: Navigate to person page:', personId, personName);
//     //     // Later: navigate(`/person/${personId}`)
//     //   }}
//       onPersonClick={(personId) => navigate(`/person/${personId}`)}
//     //   onAddToWatchlist={(movie) => {
//     //     console.log('Add to watchlist:', movie);
//     //     // Later: Use context to add
//     //   }}
//       onAddToWatchlist = {toggleWatchlist} 
//     //   isInWatchlist={false}
//       isInWatchlist={isInWatchlist(parseInt(id))}
//     />
//   );
// };

return (
  <MovieDetails 
    movieId={id}
    mode="fullpage"
    onClose={() => {
      if (location.state?.fromSearch) {
        navigate('/', { state: { fromSearch: true, searchQuery: location.state.searchQuery } });
      } else {
        navigate(-1);
      }
    }}
    onMovieClick={(newMovieId) => navigate(`/movie/${newMovieId}`, { 
      state: location.state // Preserve search state
    })}
    onPersonClick={(personId) => navigate(`/person/${personId}`)}
    onAddToWatchlist={toggleWatchlist}
    isInWatchlist={isInWatchlist(parseInt(id))}
  />
);};

export default MovieDetailsPage;