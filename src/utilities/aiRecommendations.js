import Groq from 'groq-sdk';

const API_KEY = 'af3436a31f5d01d0b6665445693316f2';
const BASE_URL = 'https://api.themoviedb.org/3';

// Step 1: Get AI recommendations (movie names)
export const getAIRecommendations = async (watchlist) => {
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const movieTitles = watchlist.map(m => `${m.title} (${m.release_date?.split('-')[0]})`).join(', ');

  const prompt = `Based on these movies: ${movieTitles}.
  
Recommend 20 NEW movies (released after 2015) that the user would enjoy.
Focus on recent releases (2020-2024).

Return ONLY a JSON array of movie objects with this exact format:
[
  {"title": "Movie Name", "year": 2023},
  {"title": "Another Movie Name", "year": 2022}
]

Important: 
- Return ONLY the JSON array, no other text
- Include the release year
- Focus on popular, well-known movies
- Recommend diverse genres`;
// - Return original title of the movie in their regional language for example பீஸ்ட்`;

  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1500
  });

  const aiResponse = response.choices[0].message.content;
//   console.log(response.choices);
  // Parse AI response (handle potential formatting issues)
  try {
    const recommendations = JSON.parse(aiResponse);
    return recommendations;
  } catch (error) {
    // Fallback: extract JSON from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI recommendations');
  }
};

// Step 2: Search TMDB for each movie and get details
export const searchTMDBMovie = async (title, year) => {
  try {
    const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the first (most relevant) result
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error(`Failed to search movie: ${title}`, error);
    return null;
  }
};

// Step 3: Convert AI recommendations to TMDB movie objects
export const getRecommendedMovies = async (watchlist) => {
  try {
    // Get AI recommendations (movie names)
    const aiRecommendations = await getAIRecommendations(watchlist);

    // Search TMDB for each movie
    const moviePromises = aiRecommendations.map(rec => 
      searchTMDBMovie(rec.title, rec.year)
    );

    const tmdbMovies = await Promise.all(moviePromises);

    // Filter out nulls (movies not found) and limit to 20
    const validMovies = tmdbMovies.filter(movie => movie !== null).slice(0, 20);

    return validMovies;
  } catch (error) {
    console.error('Failed to get AI recommendations:', error);
    return [];
  }
};