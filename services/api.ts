import type {
  EmbedUrlParams,
  Movie,
  MovieDetails,
  MovieEmbedData,
  PlayerEventData,
  PlayerMessage,
  ProgressEventHandlers,
  ProgressTrackingConfig,
  TVEmbedData,
  TVShow,
  TVShowDetails,
  TrendingMovie,
  TrendingTVShow,
  Video,
  VideoEmbedOptions,
  VideoResponse,
  WatchProgress,
  WatchProgressStorage,
  WatchProvider,
  WatchProviderRegion,
  WatchProviderResponse
} from '../interfaces/interfaces';

// Type definitions for watch providers that are not in the main interfaces
interface WatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link?: string;
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
    };
  };
}

export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch movie details: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

export const fetchTVShowDetails = async (
  tvShowId: string
): Promise<TVShowDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvShowId}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch TV show details: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    throw error;
  }
};

export const fetchTVShows = async ({
  query,
}: {
  query: string;
}): Promise<TVShow[]> => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch TV shows: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
};

export const getTrendingTVShows = async (): Promise<TrendingTVShow[]> => {
  try {
    console.log("Fetching trending TV shows...");
    console.log("API Key exists:", !!TMDB_CONFIG.API_KEY);
    
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/trending/tv/week`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    console.log("TV Shows Response status:", response.status);
    console.log("TV Shows Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("TV Shows Error response:", errorText);
      throw new Error(`Failed to fetch trending TV shows: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("TV Shows Data received:", data);
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid data structure received from TMDB API for TV shows");
    }
    
    // Transform the data to match TrendingTVShow interface
    return data.results.slice(0, 10).map((tvShow: any, index: number) => ({
      searchTerm: tvShow.name,
      tv_id: tvShow.id,
      name: tvShow.name,
      count: tvShow.vote_count,
      poster_url: tvShow.poster_path ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}` : '',
    }));
  } catch (error) {
    console.error("Error fetching trending TV shows:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
  try {
    console.log("Fetching trending movies...");
    console.log("API Key exists:", !!TMDB_CONFIG.API_KEY);
    
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/trending/movie/week`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      throw new Error(`Failed to fetch trending movies: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Data received:", data);
    
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid data structure received from TMDB API");
    }
    
    // Transform the data to match TrendingMovie interface
    return data.results.slice(0, 10).map((movie: any, index: number) => ({
      searchTerm: movie.title,
      movie_id: movie.id,
      title: movie.title,
      count: movie.vote_count,
      poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
    }));
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    throw error;
  }
};

// Multi-search function to search both movies and TV shows
export const multiSearch = async ({ query }: { query: string }): Promise<{
  movies: Movie[];
  tvShows: TVShow[];
  total_results: number;
}> => {
  try {
    if (!query.trim()) {
      return { movies: [], tvShows: [], total_results: 0 };
    }

    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/search/multi?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    const data = await response.json();
    const movies: Movie[] = [];
    const tvShows: TVShow[] = [];

    // Separate movies and TV shows from results
    data.results.forEach((result: any) => {
      if (result.media_type === 'movie') {
        movies.push({
          id: result.id,
          title: result.title,
          adult: result.adult,
          backdrop_path: result.backdrop_path,
          genre_ids: result.genre_ids,
          original_language: result.original_language,
          original_title: result.original_title,
          overview: result.overview,
          popularity: result.popularity,
          poster_path: result.poster_path,
          release_date: result.release_date,
          video: result.video,
          vote_average: result.vote_average,
          vote_count: result.vote_count,
        });
      } else if (result.media_type === 'tv') {
        tvShows.push({
          id: result.id,
          name: result.name,
          adult: result.adult,
          backdrop_path: result.backdrop_path,
          genre_ids: result.genre_ids,
          original_language: result.original_language,
          original_name: result.original_name,
          overview: result.overview,
          popularity: result.popularity,
          poster_path: result.poster_path,
          first_air_date: result.first_air_date,
          vote_average: result.vote_average,
          vote_count: result.vote_count,
          origin_country: result.origin_country,
        });
      }
    });

    return {
      movies,
      tvShows,
      total_results: data.total_results,
    };
  } catch (error) {
    console.error("Error in multi-search:", error);
    throw error;
  }
};

// Fetch popular movies
export const getPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/popular?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw error;
  }
};

// Fetch popular TV shows
export const getPopularTVShows = async (page: number = 1): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/popular?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch popular TV shows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    throw error;
  }
};

// Fetch top-rated movies
export const getTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/top_rated?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top-rated movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching top-rated movies:", error);
    throw error;
  }
};

// Fetch top-rated TV shows
export const getTopRatedTVShows = async (page: number = 1): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/top_rated?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top-rated TV shows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching top-rated TV shows:", error);
    throw error;
  }
};

// Fetch movie genres
export const getMovieGenres = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/genre/movie/list`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie genres: ${response.statusText}`);
    }

    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching movie genres:", error);
    throw error;
  }
};

// Fetch TV show genres
export const getTVShowGenres = async (): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/genre/tv/list`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV show genres: ${response.statusText}`);
    }

    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error("Error fetching TV show genres:", error);
    throw error;
  }
};

// Discover movies by genre
export const discoverMoviesByGenre = async (
  genreIds: number[],
  page: number = 1,
  sortBy: string = 'popularity.desc'
): Promise<Movie[]> => {
  try {
    const genreString = genreIds.join(',');
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/discover/movie?with_genres=${genreString}&sort_by=${sortBy}&page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to discover movies by genre: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error discovering movies by genre:", error);
    throw error;
  }
};

// Discover TV shows by genre
export const discoverTVShowsByGenre = async (
  genreIds: number[],
  page: number = 1,
  sortBy: string = 'popularity.desc'
): Promise<TVShow[]> => {
  try {
    const genreString = genreIds.join(',');
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/discover/tv?with_genres=${genreString}&sort_by=${sortBy}&page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to discover TV shows by genre: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error discovering TV shows by genre:", error);
    throw error;
  }
};

// Fetch now playing movies (currently in theaters)
export const getNowPlayingMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/now_playing?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch now playing movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    throw error;
  }
};

// Fetch upcoming movies
export const getUpcomingMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/upcoming?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch upcoming movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    throw error;
  }
};

// Fetch TV shows airing today
export const getTVShowsAiringToday = async (page: number = 1): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/airing_today?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV shows airing today: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching TV shows airing today:", error);
    throw error;
  }
};

// Fetch TV shows on the air (currently airing series)
export const getTVShowsOnTheAir = async (page: number = 1): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/on_the_air?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV shows on the air: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching TV shows on the air:", error);
    throw error;
  }
};

// Get similar movies based on a movie ID
export const getSimilarMovies = async (movieId: number, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/similar?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch similar movies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    throw error;
  }
};

// Get movie recommendations based on a movie ID
export const getMovieRecommendations = async (movieId: number, page: number = 1): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/recommendations?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie recommendations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movie recommendations:", error);
    throw error;
  }
};

// Get similar TV shows based on a TV show ID
export const getSimilarTVShows = async (tvShowId: number, page: number = 1): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvShowId}/similar?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch similar TV shows: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching similar TV shows:", error);
    throw error;
  }
};

// Get TV show recommendations based on a TV show ID
export const getTVShowRecommendations = async (tvShowId: number, page: number = 1): Promise<TVShow[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvShowId}/recommendations?page=${page}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV show recommendations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching TV show recommendations:", error);
    throw error;
  }
};

// Get watch providers for a movie
export const getMovieWatchProviders = async (movieId: number): Promise<WatchProviders> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/watch/providers`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie watch providers: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie watch providers:", error);
    throw error;
  }
};

// Get watch providers for a TV show
export const getTVShowWatchProviders = async (tvShowId: number): Promise<WatchProviders> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvShowId}/watch/providers`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV show watch providers: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV show watch providers:", error);
    throw error;
  }
};

// Get available regions for watch providers
export const getWatchProviderRegions = async (language: string = 'en-US'): Promise<WatchProviderRegion[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/watch/providers/regions?language=${language}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch watch provider regions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching watch provider regions:", error);
    throw error;
  }
};

// Get all available watch providers for movies
export const getMovieWatchProviderList = async (): Promise<WatchProvider[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/watch/providers/movie`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie watch provider list: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movie watch provider list:", error);
    throw error;
  }
};

// Get all available watch providers for TV shows
export const getTVWatchProviderList = async (): Promise<WatchProvider[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/watch/providers/tv`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch TV watch provider list: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching TV watch provider list:", error);
    throw error;
  }
};

// Fetch videos for a movie
export const fetchMovieVideos = async (movieId: string): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?language=en-US`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch movie videos: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: VideoResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    throw error;
  }
};

// Fetch videos for a TV show
export const fetchTVShowVideos = async (tvShowId: string): Promise<Video[]> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvShowId}/videos?language=en-US`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch TV show videos: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: VideoResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching TV show videos:", error);
    throw error;
  }
};

// Generic function to fetch videos by type (movie or TV show)
export const fetchVideos = async (
  id: string,
  type: 'movie' | 'tv'
): Promise<Video[]> => {
  return type === 'movie' ? fetchMovieVideos(id) : fetchTVShowVideos(id);
};

// Fetch watch providers for a TV season
export const fetchTVSeasonWatchProviders = async (
  seriesId: string,
  seasonNumber: number
): Promise<WatchProviderResponse> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${seriesId}/season/${seasonNumber}/watch/providers?language=en-US`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch TV season watch providers: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: WatchProviderResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching TV season watch providers:", error);
    throw error;
  }
};

// Fetch watch providers for a movie (for consistency)
export const fetchMovieWatchProviders = async (
  movieId: string
): Promise<WatchProviderResponse> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/watch/providers`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch movie watch providers: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: WatchProviderResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie watch providers:", error);
    throw error;
  }
};

// Video Embed Service Configuration
export const EMBED_CONFIG = {
  BASE_URL: "https://www.vidking.net/embed",
  DEFAULT_OPTIONS: {
    width: "100%",
    height: "600",
    allowFullscreen: true,
    autoPlay: false,
  } as VideoEmbedOptions,
};

// Helper function to validate TMDB ID
const validateTmdbId = (tmdbId: number): boolean => {
  return !!(tmdbId && tmdbId > 0 && Number.isInteger(tmdbId));
};

// Helper function to validate season and episode
const validateEpisode = (season: number, episode: number): boolean => {
  return !!(
    season && season > 0 && Number.isInteger(season) &&
    episode && episode > 0 && Number.isInteger(episode)
  );
};

// Helper function to validate hex color (without #)
const validateHexColor = (color: string): boolean => {
  const hexPattern = /^[0-9A-Fa-f]{6}$/;
  return hexPattern.test(color);
};

// Helper function to validate progress time
const validateProgress = (progress: number): boolean => {
  return progress >= 0 && Number.isFinite(progress);
};

// Helper function to build URL parameters
const buildUrlParameters = (options: VideoEmbedOptions, mediaType: 'movie' | 'tv'): string => {
  const params = new URLSearchParams();
  
  // Validate and add color parameter
  if (options.color) {
    if (!validateHexColor(options.color)) {
      throw new Error(`Invalid color format: ${options.color}. Must be a 6-character hex color without #.`);
    }
    params.append('color', options.color);
  }
  
  // Add autoPlay parameter
  if (options.autoPlay !== undefined) {
    params.append('autoPlay', options.autoPlay.toString());
  }
  
  // Add TV-specific parameters
  if (mediaType === 'tv') {
    if (options.nextEpisode !== undefined) {
      params.append('nextEpisode', options.nextEpisode.toString());
    }
    
    if (options.episodeSelector !== undefined) {
      params.append('episodeSelector', options.episodeSelector.toString());
    }
  }
  
  // Validate and add progress parameter
  if (options.progress !== undefined) {
    if (!validateProgress(options.progress)) {
      throw new Error(`Invalid progress time: ${options.progress}. Must be a non-negative number.`);
    }
    params.append('progress', options.progress.toString());
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

// Generate movie embed URL (basic)
export const getMovieEmbedUrl = (tmdbId: number): string => {
  if (!validateTmdbId(tmdbId)) {
    throw new Error(`Invalid TMDB ID: ${tmdbId}. Must be a positive integer.`);
  }
  
  return `${EMBED_CONFIG.BASE_URL}/movie/${tmdbId}`;
};

// Generate movie embed URL with parameters
export const getMovieEmbedUrlWithParams = (tmdbId: number, options: VideoEmbedOptions = {}): string => {
  const baseUrl = getMovieEmbedUrl(tmdbId);
  const params = buildUrlParameters(options, 'movie');
  return `${baseUrl}${params}`;
};

// Generate TV series embed URL (basic)
export const getTVEmbedUrl = (tmdbId: number, season: number, episode: number): string => {
  if (!validateTmdbId(tmdbId)) {
    throw new Error(`Invalid TMDB ID: ${tmdbId}. Must be a positive integer.`);
  }
  
  if (!validateEpisode(season, episode)) {
    throw new Error(`Invalid season (${season}) or episode (${episode}). Both must be positive integers.`);
  }
  
  return `${EMBED_CONFIG.BASE_URL}/tv/${tmdbId}/${season}/${episode}`;
};

// Generate TV series embed URL with parameters
export const getTVEmbedUrlWithParams = (tmdbId: number, season: number, episode: number, options: VideoEmbedOptions = {}): string => {
  const baseUrl = getTVEmbedUrl(tmdbId, season, episode);
  const params = buildUrlParameters(options, 'tv');
  return `${baseUrl}${params}`;
};

// Generate movie embed data
export const getMovieEmbedData = (
  tmdbId: number, 
  options?: VideoEmbedOptions
): MovieEmbedData => {
  const finalOptions = { ...EMBED_CONFIG.DEFAULT_OPTIONS, ...options };
  const embedUrl = options && Object.keys(options).some(key => ['color', 'autoPlay', 'progress'].includes(key))
    ? getMovieEmbedUrlWithParams(tmdbId, options)
    : getMovieEmbedUrl(tmdbId);
  
  return {
    tmdbId,
    embedUrl,
    type: 'movie',
    options: finalOptions,
  };
};

// Generate TV series embed data
export const getTVEmbedData = (
  tmdbId: number,
  season: number,
  episode: number,
  options?: VideoEmbedOptions
): TVEmbedData => {
  const finalOptions = { ...EMBED_CONFIG.DEFAULT_OPTIONS, ...options };
  const embedUrl = options && Object.keys(options).some(key => ['color', 'autoPlay', 'nextEpisode', 'episodeSelector', 'progress'].includes(key))
    ? getTVEmbedUrlWithParams(tmdbId, season, episode, options)
    : getTVEmbedUrl(tmdbId, season, episode);
  
  return {
    tmdbId,
    season,
    episode,
    embedUrl,
    type: 'tv',
    options: finalOptions,
  };
};

// Universal embed URL generator (basic)
export const getEmbedUrl = (params: EmbedUrlParams): string => {
  const { tmdbId, season, episode, mediaType } = params;
  
  if (mediaType === 'movie') {
    return getMovieEmbedUrl(tmdbId);
  } else if (mediaType === 'tv') {
    if (season === undefined || episode === undefined) {
      throw new Error('Season and episode are required for TV series embed URLs');
    }
    return getTVEmbedUrl(tmdbId, season, episode);
  } else {
    throw new Error(`Invalid media type: ${mediaType}. Must be 'movie' or 'tv'.`);
  }
};

// Universal embed URL generator with parameters
export const getEmbedUrlWithParams = (params: EmbedUrlParams, options: VideoEmbedOptions = {}): string => {
  const { tmdbId, season, episode, mediaType } = params;
  
  if (mediaType === 'movie') {
    return getMovieEmbedUrlWithParams(tmdbId, options);
  } else if (mediaType === 'tv') {
    if (season === undefined || episode === undefined) {
      throw new Error('Season and episode are required for TV series embed URLs');
    }
    return getTVEmbedUrlWithParams(tmdbId, season, episode, options);
  } else {
    throw new Error(`Invalid media type: ${mediaType}. Must be 'movie' or 'tv'.`);
  }
};

// Generate HTML iframe embed code
export const generateEmbedHTML = (
  embedUrl: string, 
  options?: VideoEmbedOptions
): string => {
  const finalOptions = { ...EMBED_CONFIG.DEFAULT_OPTIONS, ...options };
  
  return `<iframe src="${embedUrl}" width="${finalOptions.width}" height="${finalOptions.height}" frameborder="0" ${finalOptions.allowFullscreen ? 'allowfullscreen' : ''}></iframe>`;
};

// ===== WATCH PROGRESS TRACKING =====

// Default configuration for progress tracking
export const PROGRESS_CONFIG: ProgressTrackingConfig = {
  enableLocalStorage: true,
  enableConsoleLogging: true,
  saveInterval: 10, // Save every 10 seconds
  completionThreshold: 90, // Consider completed at 90%
};

// LocalStorage key for watch progress
const PROGRESS_STORAGE_KEY = 'movieapp_watch_progress';

// Generate unique content ID for tracking
export const generateContentId = (tmdbId: number, season?: number, episode?: number): string => {
  if (season !== undefined && episode !== undefined) {
    return `tv_${tmdbId}_s${season}e${episode}`;
  }
  return `movie_${tmdbId}`;
};

// Parse content ID back to components
export const parseContentId = (contentId: string): { tmdbId: number; mediaType: 'movie' | 'tv'; season?: number; episode?: number } => {
  const parts = contentId.split('_');
  const mediaType = parts[0] as 'movie' | 'tv';
  const tmdbId = parseInt(parts[1]);
  
  if (mediaType === 'tv' && parts[2]) {
    const seasonEpisode = parts[2];
    const seasonMatch = seasonEpisode.match(/s(\d+)e(\d+)/);
    if (seasonMatch) {
      return {
        tmdbId,
        mediaType,
        season: parseInt(seasonMatch[1]),
        episode: parseInt(seasonMatch[2])
      };
    }
  }
  
  return { tmdbId, mediaType };
};

// Save watch progress to localStorage
export const saveWatchProgress = (progress: WatchProgress): void => {
  try {
    const stored = getStoredProgress();
    stored[progress.id] = progress;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to save watch progress:', error);
  }
};

// Load watch progress from localStorage
export const loadWatchProgress = (contentId: string): WatchProgress | null => {
  try {
    const stored = getStoredProgress();
    return stored[contentId] || null;
  } catch (error) {
    console.error('Failed to load watch progress:', error);
    return null;
  }
};

// Get all stored progress
export const getStoredProgress = (): WatchProgressStorage => {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to parse stored progress:', error);
    return {};
  }
};

// Clear specific progress entry
export const clearWatchProgress = (contentId: string): void => {
  try {
    const stored = getStoredProgress();
    delete stored[contentId];
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to clear watch progress:', error);
  }
};

// Clear all progress
export const clearAllProgress = (): void => {
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear all progress:', error);
  }
};

// Convert player event data to watch progress
export const eventDataToProgress = (eventData: PlayerEventData, title?: string): WatchProgress => {
  const contentId = generateContentId(parseInt(eventData.id), eventData.season, eventData.episode);
  const isCompleted = eventData.progress >= (PROGRESS_CONFIG.completionThreshold || 90);
  
  return {
    id: contentId,
    mediaType: eventData.mediaType,
    tmdbId: parseInt(eventData.id),
    title,
    season: eventData.season,
    episode: eventData.episode,
    currentTime: eventData.currentTime,
    duration: eventData.duration,
    progress: eventData.progress,
    lastWatched: eventData.timestamp,
    completed: isCompleted
  };
};

// Main progress tracking handler
export const handleProgressEvent = (
  eventData: PlayerEventData, 
  config: ProgressTrackingConfig = PROGRESS_CONFIG,
  title?: string
): void => {
  if (config.enableConsoleLogging) {
    console.log(`Player Event [${eventData.event}]:`, eventData);
  }
  
  // Convert to progress format
  const progress = eventDataToProgress(eventData, title);
  
  // Save to localStorage if enabled
  if (config.enableLocalStorage) {
    saveWatchProgress(progress);
  }
  
  // Use custom save function if provided
  if (config.customSaveFunction) {
    config.customSaveFunction(progress).catch(error => {
      console.error('Custom save function failed:', error);
    });
  }
};

// Setup message listener for player events
export const setupProgressTracking = (
  handlers?: ProgressEventHandlers,
  config: ProgressTrackingConfig = PROGRESS_CONFIG
): (() => void) => {
  const messageHandler = (event: MessageEvent) => {
    try {
      if (typeof event.data === 'string') {
        const message: PlayerMessage = JSON.parse(event.data);
        
        if (message.type === 'PLAYER_EVENT') {
          const eventData = message.data;
          
          // Handle the progress tracking
          handleProgressEvent(eventData, config);
          
          // Call specific event handlers
          switch (eventData.event) {
            case 'play':
              handlers?.onPlay?.(eventData);
              break;
            case 'pause':
              handlers?.onPause?.(eventData);
              break;
            case 'timeupdate':
              handlers?.onTimeUpdate?.(eventData);
              break;
            case 'ended':
              handlers?.onEnded?.(eventData);
              break;
            case 'seeked':
              handlers?.onSeeked?.(eventData);
              break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to handle player message:', error);
    }
  };
  
  // Add event listener
  window.addEventListener('message', messageHandler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', messageHandler);
  };
};

// Get progress for resume watching
export const getResumeProgress = (tmdbId: number, season?: number, episode?: number): WatchProgress | null => {
  const contentId = generateContentId(tmdbId, season, episode);
  const progress = loadWatchProgress(contentId);
  
  // Only return if not completed and has meaningful progress (> 5%)
  if (progress && !progress.completed && progress.progress > 5) {
    return progress;
  }
  
  return null;
};

// Get all incomplete progress (for continue watching list)
export const getIncompleteProgress = (): WatchProgress[] => {
  const stored = getStoredProgress();
  return Object.values(stored)
    .filter(progress => !progress.completed && progress.progress > 5)
    .sort((a, b) => b.lastWatched - a.lastWatched); // Sort by most recently watched
};
