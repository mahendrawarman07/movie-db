// import MovieCard from './components/MovieCard'
import Home from "./components/Home";
import MovieDetails from "./components/MovieDetails";
import MovieDetailsPage from "./components/pages/MovieDetailsPage";
import PersonPage from './components/pages/PersonPage'; 
import WatchlistPage from './components/pages/WatchlistPage'; 
// import PopularPage from './components/pages/PopularPage';           // ADD
// import NowPlayingPage from './components/pages/NowPlayingPage';     // ADD
// import UpcomingPage from './components/pages/UpcomingPage';         // ADD
// import TopRatedPage from './components/pages/TopRatedPage';         // ADD
import MovieCategoryPage from './components/pages/MovieCategoryPage';
import AIRecommendedPage from './components/pages/AIRecommendedPage';
import MoodBasedPage from './components/pages/MoodBasedPage';
import SearchResultsPage from './components/pages/SearchResultsPage';



import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { WatchlistProvider } from "./components/context/WatchlistContext";


function App() {
  const [currentMovieId, setCurrentMovieId] = useState(550);
  return (
    <>
      {/* <h1 class="text-3xl font-bold underline">Movie App</h1> */}
      {/* <Home /> */}
      <WatchlistProvider>
        <BrowserRouter>
          <Routes>
            {/* <Route path="/home" element={<Home />} />
          <Route path="/" element={<Navigate to="/home" />} /> */}
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="/person/:id" element={<PersonPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            {/* Reusable category pages */}
          <Route 
            path="/movies/popular" 
            element={<MovieCategoryPage endpoint="popular" title="Popular Movies" icon="⭐" />} 
          />
          <Route 
            path="/movies/now-playing" 
            element={<MovieCategoryPage endpoint="now_playing" title="Now Playing in Theaters" icon="🎬" />} 
          />
          <Route 
            path="/movies/upcoming" 
            element={<MovieCategoryPage endpoint="upcoming" title="Coming Soon" icon="🎯" />} 
          />
          <Route 
            path="/movies/top-rated" 
            element={<MovieCategoryPage endpoint="top_rated" title="Top Rated Movies" icon="🏆" />} 
          />
          <Route 
  path="/movies/ai-recommended" 
  element={<AIRecommendedPage />} 
/>
<Route 
  path="/movies/mood-based" 
  element={<MoodBasedPage />} 
/>
<Route 
  path="/search/:query" 
  element={<SearchResultsPage />} 
/>

          
          </Routes>
        </BrowserRouter>
      </WatchlistProvider>

      {/* <MovieDetails
        movieId={currentMovieId}
        mode="fullpage" // ← Change this to test!
        onMovieClick={(newMovieId) => {
          setCurrentMovieId(newMovieId); // ← Update movie ID
          window.scrollTo(0, 0); // ← Scroll to top
        }}
        onPersonClick={(id, name) => console.log("Person clicked:", name)}
        onAddToWatchlist={(movie) => console.log("Add:", movie.title)}
      /> */}
    </>
  );
}

export default App;
