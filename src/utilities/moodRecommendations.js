import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const API_KEY = "af3436a31f5d01d0b6665445693316f2";
const BASE_URL = "https://api.themoviedb.org/3";

// Helper function to analyze user's watchlist
const analyzeWatchlist = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    return {
      preferredLanguages: ['en'],
      preferredGenres: [],
      watchlistSummary: "New user with no watch history"
    };
  }

  // Extract languages
  const languages = watchlist.map(m => m.original_language).filter(Boolean);
  const languageCounts = languages.reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});
  
  const preferredLanguages = Object.entries(languageCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([lang]) => lang);

  // Extract genres
  const allGenres = watchlist.flatMap(m => m.genre_ids || []);
  const genreCounts = allGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});
  
  const preferredGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => parseInt(genre));

  // Create a summary of user's watchlist for AI
  const recentMovies = watchlist.slice(0, 8).map(m => 
    `${m.title} (${m.release_date?.split('-')[0] || 'Unknown'}, ${m.original_language?.toUpperCase()})`
  );
  
  const watchlistSummary = `User's recent watchlist: ${recentMovies.join(', ')}`;

  return {
    preferredLanguages,
    // preferredGenres,
    watchlistSummary
  };
};

// Helper function to safely parse AI response
const parseAIResponse = (content, callIndex) => {
  try {
    if (!content || typeof content !== 'string') {
      console.log(`AI call ${callIndex}: No valid content`);
      return [];
    }

    const cleanContent = content.trim();
    console.log(`AI call ${callIndex} raw response:`, cleanContent);

    // Try to find JSON array in the response
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log(`AI call ${callIndex}: No JSON array found`);
      return [];
    }

    const jsonStr = jsonMatch[0];
    console.log(`AI call ${callIndex} extracted JSON:`, jsonStr);

    // Parse the JSON
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed)) {
      console.log(`AI call ${callIndex}: Parsed result is not an array`);
      return [];
    }

    // Validate each movie object has title and year
    const validMovies = parsed.filter(movie => 
      movie && 
      typeof movie === 'object' && 
      movie.title && 
      typeof movie.title === 'string' && 
      movie.title.trim().length > 0 &&
      movie.year &&
      typeof movie.year === 'number'
    );

    console.log(`AI call ${callIndex} valid movies:`, validMovies);
    return validMovies;

  } catch (error) {
    console.error(`AI call ${callIndex} parse error:`, error);
    console.log(`AI call ${callIndex} problematic content:`, content);
    return [];
  }
};

// Search TMDB for specific movie with title and year
const searchTMDBMovie = async (title, year) => {
  try {
    const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error(`TMDB API error for "${title}" (${year}): ${response.status}`);
      return null;
    }
    
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0]; // Return the most relevant result
    }
    
    // If no results with year, try without year
    const fallbackUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}`;
    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();
    
    if (fallbackData.results && fallbackData.results.length > 0) {
      return fallbackData.results[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to search movie: ${title} (${year})`, error);
    return null;
  }
};

export const getMoodRecommendations = async (mood, watchlist = []) => {
  try {
    console.log('=== MOOD RECOMMENDATIONS START ===');
    console.log('Mood:', mood);
    console.log('Watchlist length:', watchlist?.length || 0);

    // Analyze user's watchlist
    const userProfile = analyzeWatchlist(watchlist);
    console.log('User profile:', userProfile);
    
    // Generate unique identifiers for this request
    const currentTime = new Date();
    const dateTimeString = currentTime.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const randomSeed = Math.floor(Math.random() * 100000);
    const uniqueId = `${currentTime.getTime()}-${randomSeed}`;
    
    console.log('Request timestamp:', dateTimeString);
    console.log('Unique ID:', uniqueId);
    
    const moodDescriptions = {
      happy: "joyful, uplifting, feel-good movies that make you smile and laugh",
      romantic: "love stories, romantic dramas, heartwarming relationships, romantic comedies",
      exciting: "thrilling action, adventures, high-energy films with suspense and excitement",
      relaxed: "calm, peaceful, slow-paced movies perfect for unwinding",
      nostalgic: "classic films, childhood memories, retro movies that bring back memories",
      sad: "emotional, touching dramas that allow you to have a good cry",
      motivated: "inspiring stories, success journeys, biographical films that motivate",
      mysterious: "puzzling mysteries, psychological thrillers, suspenseful detective stories"
    };

    // Create the standard prompt ending with date/time for uniqueness
    const standardPromptEnding = `

SESSION INFO: Date: ${dateTimeString}, Request ID: ${uniqueId}

Recommend 8 NEW movies (released after 2015) that the user would enjoy for ${mood} mood.
Focus on recent releases (2020-2024) and ${moodDescriptions[mood]}.

IMPORTANT - For uniqueness based on this session (${dateTimeString}):
- Use the current date/time to vary your selections
- Avoid giving the same recommendations as previous sessions
- Include mix of popular and lesser-known quality films
- Consider seasonal preferences if applicable to current date

Return ONLY a JSON array of movie objects with this exact format:
[
  {"title": "Movie Name", "year": 2023},
  {"title": "Another Movie Name", "year": 2022}
]

Important: 
- Return ONLY the JSON array, no other text
- Include the release year
- Focus on popular, well-known movies
- Recommend diverse genres that match ${mood} mood
- Session ID: ${uniqueId}`;

    // Create 5 different prompts with date/time variations
    const uniquePrompts = [
      `WATCHLIST ANALYSIS: ${userProfile.watchlistSummary}
TIME: ${dateTimeString} | SESSION: ${uniqueId}

Based on this user's viewing history, suggest ${moodDescriptions[mood]} movies that match their language preferences and genre interests for someone feeling ${mood}.

Use current date/time (${dateTimeString}) to provide fresh, varied recommendations different from any previous sessions.${standardPromptEnding}`,

      `USER PREFERENCES: ${userProfile.watchlistSummary}
TIMESTAMP: ${dateTimeString} | ID: ${uniqueId}

This user wants ${moodDescriptions[mood]} movies. Based on their watch patterns and current session time (${dateTimeString}), find films that fit their regional/language preferences.

Vary selections based on this unique session identifier: ${uniqueId}${standardPromptEnding}`,

      `PERSONALIZED REQUEST: ${userProfile.watchlistSummary}
REQUEST TIME: ${dateTimeString} | SEED: ${randomSeed}

Generate ${moodDescriptions[mood]} recommendations for this user feeling ${mood}. Consider their preferences and use session timestamp (${dateTimeString}) for variety.

Session uniqueness factor: ${uniqueId}${standardPromptEnding}`,

      `DISCOVERY MODE: ${userProfile.watchlistSummary}
SESSION: ${dateTimeString} | RANDOM: ${randomSeed}

Help user discover new ${moodDescriptions[mood]} films perfect for ${mood} mood. Use current time (${dateTimeString}) to ensure fresh recommendations.

Uniqueness seed: ${uniqueId} - vary from previous sessions${standardPromptEnding}`,

      `TAILORED SUGGESTIONS: ${userProfile.watchlistSummary}
CURRENT TIME: ${dateTimeString} | VARIETY SEED: ${uniqueId}

Provide ${moodDescriptions[mood]} movie recommendations for ${mood} feeling. Use session time (${dateTimeString}) and seed (${randomSeed}) for unique selections.

Temporal uniqueness: ${dateTimeString}${standardPromptEnding}`
    ];

    // Make 5 AI calls with unique timestamps
    const aiCalls = uniquePrompts.map(async (prompt, index) => {
      try {
        console.log(`Making AI call ${index + 1} at ${new Date().toLocaleTimeString()}...`);
        
        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.9, // Higher temperature for more randomness
          max_tokens: 800,
          // Add some randomness to the request itself
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3
        });

        const content = completion.choices[0]?.message?.content;
        return parseAIResponse(content, index + 1);
        
      } catch (error) {
        console.error(`AI call ${index + 1} failed:`, error);
        return [];
      }
    });

    // Wait for all AI calls
    const allRecommendations = await Promise.all(aiCalls);
    console.log('All AI recommendations with timestamp:', dateTimeString, allRecommendations);
    
    // Combine all movie objects
    const combinedMovies = allRecommendations.flat().filter(movie => 
      movie && movie.title && movie.year
    );
    
    console.log(`Combined movies for session ${uniqueId}:`, combinedMovies);
    
    // Remove duplicates by title (case insensitive)
    const uniqueMovies = [];
    const seenTitles = new Set();
    
    combinedMovies.forEach(movie => {
      const normalizedTitle = movie.title.toLowerCase().trim();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueMovies.push(movie);
      }
    });
    
    console.log(`Unique movies after dedup (${dateTimeString}):`, uniqueMovies);
    console.log('Unique movies count:', uniqueMovies.length);

    // Shuffle with time-based randomness
    const timeBasedSeed = currentTime.getTime() % 1000;
    const shuffledMovies = uniqueMovies.sort(() => (Math.random() + timeBasedSeed / 1000) - 0.5);

    // Search for movies on TMDB using title and year
    const moviePromises = shuffledMovies.slice(0, Math.min(40, shuffledMovies.length)).map(async (movieObj, index) => {
      const result = await searchTMDBMovie(movieObj.title, movieObj.year);
      if (result) {
        console.log(`Found movie ${index + 1}: ${result.title} (${result.release_date?.split('-')[0]}) [Session: ${uniqueId}]`);
      } else {
        console.log(`No TMDB results for: ${movieObj.title} (${movieObj.year}) [Session: ${uniqueId}]`);
      }
      return result;
    });

    let validMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
    console.log(`Valid movies from AI search (${dateTimeString}):`, validMovies.length);

    // If we don't have enough movies, get more from discover API with time-based page selection
    if (validMovies.length < 25) {
      try {
        console.log(`Getting additional movies from discover API (${dateTimeString})...`);
        
        // Use time-based page selection for variety
        const timeBasedPages = [
          1 + (currentTime.getMinutes() % 5),
          1 + (currentTime.getSeconds() % 5),
          1 + (randomSeed % 5),
          1 + ((currentTime.getTime() / 1000) % 5),
          1 + (currentTime.getHours() % 5)
        ].map(p => Math.floor(p));
        
        const discoverCalls = timeBasedPages.map(page => {
          const discoverParams = new URLSearchParams({
            api_key: API_KEY,
            sort_by: 'popularity.desc',
            'vote_count.gte': '100',
            'primary_release_date.gte': '2015-01-01',
            page: page
          });

          // Add user's preferred language if available
          if (userProfile.preferredLanguages && userProfile.preferredLanguages.length > 0 && userProfile.preferredLanguages[0] !== 'en') {
            discoverParams.append('with_original_language', userProfile.preferredLanguages[0]);
          }

          // Add user's preferred genres if available
          if (userProfile.preferredGenres && userProfile.preferredGenres.length > 0) {
            discoverParams.append('with_genres', userProfile.preferredGenres.slice(0, 2).join(','));
          }

          return fetch(`${BASE_URL}/discover/movie?${discoverParams}`)
            .then(response => response.json())
            .then(data => data.results || [])
            .catch(error => {
              console.error(`Discover API error for page ${page} (${dateTimeString}):`, error);
              return [];
            });
        });

        const discoverResults = await Promise.all(discoverCalls);
        const allDiscoverMovies = discoverResults.flat();
        
        // Filter out movies already in watchlist and validMovies
        const watchlistIds = new Set((watchlist || []).map(m => m.id));
        const validMovieIds = new Set(validMovies.map(m => m.id));
        
        const additionalMovies = allDiscoverMovies
          .filter(movie => !watchlistIds.has(movie.id) && !validMovieIds.has(movie.id))
          .slice(0, 30 - validMovies.length);
        
        validMovies = [...validMovies, ...additionalMovies];
        console.log(`Movies after discover API (${dateTimeString}):`, validMovies.length);
        
      } catch (error) {
        console.error('Discover API fallback failed:', error);
      }
    }

    // Final deduplication by movie ID with time-based sorting
    const finalUniqueMovies = [];
    const seenMovieIds = new Set();
    
    validMovies.forEach(movie => {
      if (movie && movie.id && !seenMovieIds.has(movie.id)) {
        seenMovieIds.add(movie.id);
        finalUniqueMovies.push(movie);
      }
    });

    // Final shuffle with multiple randomness sources
    const finalMovies = finalUniqueMovies
      .sort(() => Math.random() + (currentTime.getTime() % 1000) / 1000 - 0.5)
      .slice(0, 30);
    
    console.log('=== FINAL RESULTS ===');
    console.log('Session timestamp:', dateTimeString);
    console.log('Unique session ID:', uniqueId);
    console.log('Total unique movies found:', finalUniqueMovies.length);
    console.log('Final movies returned:', finalMovies.length);
    console.log('Final movie titles with years:', finalMovies.map(m => `${m.title} (${m.release_date?.split('-')[0]})`));
    
    return finalMovies;

  } catch (error) {
    console.error('Error getting mood recommendations:', error);
    throw error;
  }
};
