// Type definitions for watch providers
interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProviderRegion {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

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

interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: string;
  size: number;
  type: string;
}

interface VideoResponse {
  id: number;
  results: Video[];
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
